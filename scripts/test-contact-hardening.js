/**
 * /api/submit hardening. Starts its own copies of server.js on spare ports with RESEND_API_URL pointed at a
 * local stub, so nothing reaches the real Resend API. Does not need npm start.
 *  - Reply-To addresses: display names, lists and comments are rejected; normal addresses still work
 *  - global email cap per hour (CONTACT_MAX_PER_HOUR): the next submission gets 429 and no email is sent
 *  - cross-site submissions are refused (403, no email) and /api/submit sends no CORS headers
 *  - own origin (Host or X-Forwarded-Host) and ALLOWED_ORIGINS are accepted; read-only APIs keep open CORS
 */
import http from 'http';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0, failed = 0;
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};

let sent = 0;
const stub = http.createServer((req, res) => {
  req.resume();
  req.on('end', () => { sent++; res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"id":"stub"}'); });
});
await new Promise((r) => stub.listen(0, '127.0.0.1', r));
const stubUrl = `http://127.0.0.1:${stub.address().port}/emails`;

const freePort = () => new Promise((resolve) => { const s = http.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
async function startServer(extraEnv = {}) {
  const port = await freePort();
  const env = { ...process.env, PORT: String(port), RESEND_API_URL: stubUrl, RESEND_API_KEY: 're_test_key', CONTACT_TO_EMAIL: 'owner@example.com', ...extraEnv };
  const child = spawn(process.execPath, ['server.js'], { cwd: root, env, stdio: 'ignore' });
  for (let i = 0; i < 100; i++) {
    const up = await new Promise((r) => { const q = http.get({ host: '127.0.0.1', port, path: '/api/firebase-config' }, (res) => { res.resume(); r(true); }); q.on('error', () => r(false)); });
    if (up) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  return { port, stop: () => new Promise((r) => { child.once('exit', r); child.kill(); }) };
}
let n = 0;
const request = (port, { method = 'POST', path: p = '/api/submit', body, headers = {} } = {}) => new Promise((resolve, reject) => {
  const data = body === undefined ? null : JSON.stringify(body);
  const ip = `10.88.${Math.floor(++n / 250)}.${(n % 250) + 1}`; // a fresh visitor each time, so the per-IP limit never trips
  const req = http.request({
    host: '127.0.0.1', port, method, path: p,
    headers: { ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}), 'X-Forwarded-For': `${ip}, 198.51.100.7`, ...headers }
  }, (res) => { res.resume(); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers })); });
  req.on('error', reject);
  if (data) req.write(data);
  req.end();
});

console.log('\n=== CONTACT FORM HARDENING ===\n--- Reply-To addresses ---');
const s1 = await startServer();
try {
  for (const bad of ['CEO<phish@evil.com>', 'x<y>@example.com', 'a,b@example.com', 'a(b)@example.com', 'a"b@example.com', 'a;b@example.com', 'a\\b@example.com']) {
    const r = await request(s1.port, { body: { message: 'hi', email: bad } });
    check(`rejected: ${bad}`, r.status === 400, `got ${r.status}`);
  }
  for (const good of ['reader@example.com', 'first.last+tag@sub.example.co.uk']) {
    const r = await request(s1.port, { body: { message: 'hi', email: good } });
    check(`accepted: ${good}`, r.status === 200, `got ${r.status}`);
  }

  console.log('\n--- cross-site submissions ---');
  sent = 0;
  let r = await request(s1.port, { body: { message: 'hi' }, headers: { Origin: 'https://evil.example' } });
  check('foreign Origin -> 403', r.status === 403, `got ${r.status}`);
  check('no email sent for it', sent === 0, `sent ${sent}`);
  r = await request(s1.port, { body: { message: 'hi' }, headers: { Origin: 'not a url' } });
  check('garbage Origin -> 403', r.status === 403, `got ${r.status}`);
  r = await request(s1.port, { body: { message: 'hi' }, headers: { Origin: `http://127.0.0.1:${s1.port}` } });
  check('own origin (Host) -> 200', r.status === 200, `got ${r.status}`);
  r = await request(s1.port, { body: { message: 'hi' }, headers: { Origin: 'https://my.site.example', 'X-Forwarded-Host': 'my.site.example' } });
  check('own origin via X-Forwarded-Host (Firebase Hosting) -> 200', r.status === 200, `got ${r.status}`);
  r = await request(s1.port, { body: { message: 'hi' } });
  check('no Origin (not a browser form post) -> 200', r.status === 200, `got ${r.status}`);

  console.log('\n--- CORS headers ---');
  r = await request(s1.port, { method: 'OPTIONS', headers: { Origin: 'https://evil.example', 'Access-Control-Request-Method': 'POST' } });
  check('preflight to /api/submit: 204 without Access-Control-Allow-Origin', r.status === 204 && !r.headers['access-control-allow-origin'], JSON.stringify(r.headers['access-control-allow-origin']));
  r = await request(s1.port, { method: 'POST', body: { message: 'hi' } });
  check('POST /api/submit sends no Access-Control-Allow-Origin', !r.headers['access-control-allow-origin']);
  r = await request(s1.port, { method: 'GET', path: '/api/summary', headers: { Origin: 'https://evil.example' } });
  check('read-only API keeps open CORS (*)', r.status === 200 && r.headers['access-control-allow-origin'] === '*');
} finally { await s1.stop(); }

console.log('\n--- hourly email cap ---');
const s2 = await startServer({ CONTACT_MAX_PER_HOUR: '3' });
try {
  sent = 0;
  const codes = [];
  for (let i = 0; i < 5; i++) codes.push((await request(s2.port, { body: { message: `cap test ${i}` } })).status);
  check('first 3 accepted, then 429', codes.slice(0, 3).every((c) => c === 200) && codes[3] === 429 && codes[4] === 429, codes.join(','));
  check('only 3 emails reached Resend', sent === 3, `sent ${sent}`);
  const r = await request(s2.port, { body: { message: 'again' } });
  check('429 carries Retry-After', r.status === 429 && !!r.headers['retry-after']);
  const bad = await request(s2.port, { body: { message: '' } });
  check('invalid requests are still 400, not 429', bad.status === 400, `got ${bad.status}`);
} finally { await s2.stop(); }

console.log('\n--- ALLOWED_ORIGINS ---');
const s3 = await startServer({ ALLOWED_ORIGINS: 'https://friend.example, https://other.example' });
try {
  let r = await request(s3.port, { body: { message: 'hi' }, headers: { Origin: 'https://friend.example' } });
  check('listed origin -> 200', r.status === 200, `got ${r.status}`);
  r = await request(s3.port, { body: { message: 'hi' }, headers: { Origin: 'https://evil.example' } });
  check('unlisted origin still -> 403', r.status === 403, `got ${r.status}`);
} finally { await s3.stop(); }

stub.close();
console.log(`\n   CONTACT FORM HARDENING: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
