/**
 * Server hardening: malformed URLs, error responses and the /src path check.
 * Requires the server on localhost:3000.
 */
import http from 'http';

let passed = 0, failed = 0;
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};

// http.request normalises nothing here: the path is sent exactly as written
const get = (path, { method = 'GET', headers = {}, body } = {}) => new Promise((resolve) => {
  const req = http.request({ host: 'localhost', port: 3000, path, method, headers }, (res) => {
    let data = '';
    res.on('data', (c) => { data += c; });
    res.on('end', () => resolve({ status: res.statusCode, body: data }));
  });
  req.on('error', () => resolve({ status: 0, body: '' }));
  if (body) req.write(body);
  req.end();
});

console.log('\n=== SERVER HARDENING AUDIT ===');

for (const p of ['/%E0%A4%A', '/%', '/%zz', '/css/%E0%A4%A', '/api/%E0%A4%A']) {
  const r = await get(p);
  check(`malformed URL ${p} -> 404`, r.status === 404, `got ${r.status}`);
  check(`malformed URL ${p} leaks no stack`, !/URIError|at .*server\.js|node_modules/.test(r.body));
}

const bad = await get('/api/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"message": ' });
check('invalid JSON body -> 400, no stack', bad.status === 400 && !/SyntaxError|node_modules|at /.test(bad.body), `got ${bad.status} ${bad.body.slice(0, 80)}`);

for (const p of ['/src/../server.js', '/src/%2e%2e/server.js', '/src/../src-old/x.js', '/src/../package.json']) {
  const r = await get(p);
  check(`/src traversal ${p} -> 404`, r.status === 404, `got ${r.status}`);
}
check('/src/data/official-experiments.js still served', (await get('/src/data/official-experiments.js')).status === 200);
check('home page still served', (await get('/')).status === 200);

console.log(`\n   SERVER HARDENING AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
