/**
 * /api/submit → email via Resend.
 * Starts its own copy of server.js on a spare port with RESEND_API_KEY set and RESEND_API_URL pointed at a
 * local stub of Resend's POST /emails, so nothing ever reaches the real API. Does not need npm start.
 * Covers: delivered:true sends the right payload (to, from, subject, reply_to, plain text, Bearer key),
 * newsletter subject, Resend error → 502, Resend timeout → 502, no key → delivered:false and no call,
 * and that no message text or visitor email reaches the server's logs.
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

// ---- Resend stub ----
const received = [];
let mode = 'ok';
const stub = http.createServer((req, res) => {
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    let json = null; try { json = JSON.parse(body); } catch {}
    received.push({ method: req.method, url: req.url, headers: req.headers, json });
    if (mode === 'hang') return; // never answers; the server's timeout must fire
    if (mode === 'error') {
      res.writeHead(422, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ statusCode: 422, name: 'validation_error', message: 'echo reader@example.com' }));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ id: 'stub-email-id' }));
  });
});
await new Promise((r) => stub.listen(0, '127.0.0.1', r));
const stubUrl = `http://127.0.0.1:${stub.address().port}/emails`;

// ---- server.js instances ----
function freePort() {
  return new Promise((resolve) => { const s = http.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => resolve(p)); }); });
}
async function startServer(extraEnv) {
  const port = await freePort();
  const env = { ...process.env, PORT: String(port), RESEND_API_URL: stubUrl, RESEND_TIMEOUT_MS: '500', ...extraEnv };
  for (const k of Object.keys(extraEnv)) if (extraEnv[k] === undefined) delete env[k];
  const child = spawn(process.execPath, ['server.js'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '';
  child.stdout.on('data', (c) => (logs += c));
  child.stderr.on('data', (c) => (logs += c));
  for (let i = 0; i < 100; i++) {
    const up = await new Promise((r) => { const q = http.get({ host: '127.0.0.1', port, path: '/api/firebase-config' }, (res) => { res.resume(); r(true); }); q.on('error', () => r(false)); });
    if (up) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  return { port, child, logs: () => logs, stop: () => new Promise((r) => { child.once('exit', r); child.kill(); }) };
}
let n = 0;
const post = (port, body) => new Promise((resolve, reject) => {
  const data = JSON.stringify(body);
  const ip = `10.99.${Math.floor(++n / 250)}.${(n % 250) + 1}`; // a fresh visitor each time, so the 5/10min limit never trips
  const req = http.request({
    host: '127.0.0.1', port, method: 'POST', path: '/api/submit',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), 'X-Forwarded-For': `${ip}, 198.51.100.7` }
  }, (res) => {
    let out = '';
    res.on('data', (c) => (out += c));
    res.on('end', () => { let json = {}; try { json = JSON.parse(out); } catch {} resolve({ status: res.statusCode, json }); });
  });
  req.on('error', reject);
  req.write(data);
  req.end();
});

console.log('\n=== /api/submit → EMAIL (Resend stub) ===\n--- key configured ---');
const secretMsg = 'Hello Williams\r\nsecond line\u0007 with a bell';
const s1 = await startServer({ RESEND_API_KEY: 're_test_key', CONTACT_TO_EMAIL: 'owner@example.com', CONTACT_FROM_EMAIL: undefined });
try {
  mode = 'ok'; received.length = 0;
  let r = await post(s1.port, { type: 'contact', email: 'reader@example.com', message: secretMsg });
  const e = received[0];
  check('delivered:true → 200 { ok:true, delivered:true }', r.status === 200 && r.json.ok === true && r.json.delivered === true, `got ${r.status} ${JSON.stringify(r.json)}`);
  check('One POST to Resend /emails', received.length === 1 && e.method === 'POST' && e.url === '/emails');
  check('Authorization: Bearer <RESEND_API_KEY>', e && e.headers.authorization === 'Bearer re_test_key');
  check('to = CONTACT_TO_EMAIL', e && Array.isArray(e.json.to) && e.json.to.length === 1 && e.json.to[0] === 'owner@example.com');
  check("from defaults to Resend's test sender", e && e.json.from === 'WDIII Tech Vault <onboarding@resend.dev>');
  check('reply_to = the visitor\'s email', e && e.json.reply_to === 'reader@example.com');
  check('Subject "New contact form message"', e && e.json.subject === 'New contact form message');
  check('Plain text only (no html field)', e && typeof e.json.text === 'string' && !('html' in e.json));
  check('Body carries message, visitor email, type and timestamp', e && e.json.text.includes('Hello Williams\nsecond line') && e.json.text.includes('From: reader@example.com') && e.json.text.includes('Type: contact') && /Received: \d{4}-\d\d-\d\dT/.test(e.json.text));
  check('Control characters stripped (no CR, no BEL)', e && !/[\r\u0007]/.test(e.json.text));

  received.length = 0;
  r = await post(s1.port, { type: 'newsletter', email: 'news@example.com', message: 'Newsletter signup' });
  check('Newsletter → delivered:true, subject "New newsletter signup"', r.status === 200 && r.json.delivered === true && received[0] && received[0].json.subject === 'New newsletter signup' && received[0].json.reply_to === 'news@example.com');

  received.length = 0;
  r = await post(s1.port, { type: 'contact', message: 'No email given' });
  check('No visitor email → sent without reply_to', r.status === 200 && received[0] && !('reply_to' in received[0].json) && received[0].json.text.includes('(no email given)'));

  received.length = 0;
  r = await post(s1.port, { type: 'contact', email: 'reader@example.com', message: '   ' });
  check('Validation still runs first (400, Resend not called)', r.status === 400 && received.length === 0);

  mode = 'error'; received.length = 0;
  r = await post(s1.port, { type: 'contact', email: 'reader@example.com', message: 'will fail' });
  check('Resend error → 502 { ok:false, delivered:false } with a friendly error', r.status === 502 && r.json.ok === false && r.json.delivered === false && typeof r.json.error === 'string' && !/re_test_key|validation_error|reader@example/.test(r.json.error), `got ${r.status} ${JSON.stringify(r.json)}`);

  mode = 'hang';
  const t0 = Date.now();
  r = await post(s1.port, { type: 'contact', email: 'reader@example.com', message: 'will time out' });
  check('Resend timeout → 502 (server does not hang)', r.status === 502 && r.json.delivered === false && Date.now() - t0 < 5000, `got ${r.status} after ${Date.now() - t0}ms`);
  mode = 'ok';

  await new Promise((r2) => setTimeout(r2, 100));
  const logs = s1.logs();
  check('Logs carry no message text, visitor email, key or Resend reply', !/Hello Williams|reader@example\.com|news@example\.com|owner@example\.com|re_test_key|validation_error/.test(logs), logs);
  check('Logs say whether the email went out', /email=sent/.test(logs) && /email=failed:422/.test(logs) && /email=failed:timeout/.test(logs));
} finally {
  await s1.stop();
}

console.log('--- key but no CONTACT_TO_EMAIL ---');
const s3 = await startServer({ RESEND_API_KEY: 're_test_key', CONTACT_TO_EMAIL: undefined });
try {
  received.length = 0;
  const r = await post(s3.port, { type: 'contact', email: 'reader@example.com', message: 'hello' });
  check('Key without CONTACT_TO_EMAIL → not sent, delivered:false (mailto fallback), no Resend call', r.status === 202 && r.json.delivered === false && received.length === 0, `got ${r.status} ${JSON.stringify(r.json)}`);
  await new Promise((r2) => setTimeout(r2, 100));
  check('…and the log says why (email=off:no-recipient)', /email=off:no-recipient/.test(s3.logs()));
} finally {
  await s3.stop();
}

console.log('--- no key configured ---');
const s2 = await startServer({ RESEND_API_KEY: undefined });
try {
  received.length = 0;
  const r = await post(s2.port, { type: 'contact', email: 'reader@example.com', message: 'hello' });
  check('No RESEND_API_KEY → 202 { ok:true, delivered:false }, behaves as before', r.status === 202 && r.json.ok === true && r.json.delivered === false && r.json.persisted === false, `got ${r.status} ${JSON.stringify(r.json)}`);
  check('No RESEND_API_KEY → Resend never called', received.length === 0);
} finally {
  await s2.stop();
}

stub.close();
console.log(`\n   CONTACT EMAIL: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
