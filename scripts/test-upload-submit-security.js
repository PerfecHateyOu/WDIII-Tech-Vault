/**
 * Submit endpoint hardening audit (the evidence upload endpoint is retired).
 * Requires the server running on localhost:3000 (npm start).
 * Covers the unauthenticated surface; the authenticated path needs a real Firebase ID token.
 */
import http from 'http';

let passed = 0, failed = 0;
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};

function request(method, path, { body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? null : (typeof body === 'string' ? body : JSON.stringify(body));
    const req = http.request({
      host: 'localhost', port: 3000, method, path,
      headers: { ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}), ...headers }
    }, (res) => {
      let out = '';
      res.on('data', (c) => (out += c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: out }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

console.log('\n=== UPLOAD & SUBMIT SECURITY AUDIT ===\n--- /api/upload-evidence (retired) ---');

let r = await request('POST', '/api/upload-evidence', { body: { fileName: 'x.png', fileType: 'image/png', base64Data: 'AA==' }, headers: { Authorization: 'Bearer x' } });
check('Evidence upload endpoint no longer exists (404)', r.status === 404, `got ${r.status}`);

r = await request('POST', '/api/submit', { body: '{not json', headers: { 'Content-Type': 'application/json' } });
check('Malformed JSON rejected (400)', r.status === 400, `got ${r.status}`);

console.log('\n--- /api/submit ---');
r = await request('POST', '/api/submit', { body: { message: '' } });
check('Empty message rejected (400)', r.status === 400, `got ${r.status}`);

r = await request('POST', '/api/submit', { body: { message: 'hi', email: 'nope' } });
check('Invalid email rejected (400)', r.status === 400, `got ${r.status}`);

r = await request('POST', '/api/submit', { body: { message: 'x'.repeat(5001) } });
check('Oversized message rejected (400)', r.status === 400, `got ${r.status}`);

r = await request('POST', '/api/submit', { body: { message: 'hello', email: 'a@b.co' } });
check('Valid submission acknowledged as not persisted (202)', r.status === 202 && JSON.parse(r.body).persisted === false, `got ${r.status} ${r.body}`);

r = await request('POST', '/api/submit', { body: { message: 'y'.repeat(2 * 1024 * 1024) } });
check('Default JSON body limit is 1 MB (413)', r.status === 413, `got ${r.status}`);

let limited = false;
for (let i = 0; i < 6; i++) {
  r = await request('POST', '/api/submit', { body: { message: 'rate test' } });
  if (r.status === 429) { limited = true; break; }
}
check('Submit is rate limited per IP (429)', limited && Boolean(r.headers['retry-after']));

console.log(`\n   UPLOAD & SUBMIT SECURITY AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
