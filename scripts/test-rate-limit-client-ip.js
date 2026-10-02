/**
 * Rate limits must key on the visitor's address, not on a header the visitor controls.
 * Requires the server on localhost:3000 with the default TRUST_PROXY_HOPS (2).
 *
 * Simulates the production chain  X-Forwarded-For: <client-supplied>, <real client>, <Hosting proxy>
 * with a different client-supplied value on every request. If a spoofed leftmost entry were trusted,
 * every request would look like a new visitor and no limit would ever trigger.
 */
import http from 'http';

let passed = 0, failed = 0;
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};

const agent = new http.Agent({ keepAlive: true, maxSockets: 8 });
const send = (path, headers, method = 'GET', body) => new Promise((resolve) => {
  const data = body === undefined ? null : JSON.stringify(body);
  const req = http.request({
    host: 'localhost', port: 3000, path, method, agent,
    headers: { ...headers, ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}) }
  }, (res) => { res.resume(); res.on('end', () => resolve(res.statusCode)); });
  req.on('error', () => resolve(0));
  if (data) req.write(data);
  req.end();
});

// Random private addresses (16 million possible), forced to be different from each other, so reruns and the
// three simulated clients below can never share a counter. (A 150-value pool collided about 1 run in 150.)
const used = new Set();
const randomClient = () => {
  let ip;
  do { ip = `10.${1 + Math.floor(Math.random() * 254)}.${1 + Math.floor(Math.random() * 254)}.${1 + Math.floor(Math.random() * 254)}`; } while (used.has(ip));
  used.add(ip); return ip;
};
const PROXY = '198.51.100.7';
const chain = (spoof, real) => ({ 'X-Forwarded-For': `${spoof}, ${real}, ${PROXY}` });

console.log('\n=== RATE LIMIT CLIENT-IP AUDIT ===');

const realA = randomClient();
let limited = 0, ok = 0;
for (let i = 0; i < 640; i++) {
  const code = await send('/api/summary', chain(`10.${Math.floor(i / 250)}.${i % 250}.1`, realA));
  if (code === 429) limited++; else if (code === 200) ok++;
}
check('one real client with 640 different spoofed headers is rate limited', limited > 0, `429s: ${limited}, 200s: ${ok}`);
check('the limit is applied after the allowance (about 600 requests/min)', ok >= 590 && ok <= 610, `200s: ${ok}`);

const realB = randomClient();
check('a different real client is not affected', (await send('/api/summary', chain('10.99.0.1', realB))) === 200);

const realC = randomClient();
const codes = [];
for (let i = 0; i < 7; i++) codes.push(await send('/api/submit', chain(`10.77.0.${i + 1}`, realC), 'POST', { message: 'rate limit test' }));
check('contact form: first 5 posts accepted', codes.slice(0, 5).every((c) => c === 202), codes.join(','));
check('contact form: 6th and 7th posts rate limited despite spoofed headers', codes[5] === 429 && codes[6] === 429, codes.join(','));

console.log(`\n   RATE LIMIT CLIENT-IP AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
