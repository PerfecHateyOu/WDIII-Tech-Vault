/**
 * Sensitive-path checks must run in linear time (CodeQL js/polynomial-redos, alert #1).
 * Requires the server on localhost:3000.
 *
 * `/tsconfig.*\.json$/i` and `/firebase.*\.json$/i` are unanchored with a greedy `.*`, so on a path
 * like "/firebasefirebase...firebase" (no ".json" at the end) the engine retries `.*` from every
 * occurrence: O(n^2) per request. At the longest URL Node accepts (~16 KB) that was ~30 ms of CPU
 * per pattern per request, on a route anyone can hit. The blocked paths themselves must not change.
 */
import http from 'http';

let passed = 0, failed = 0;
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};

const get = (path) => new Promise((resolve) => {
  const started = process.hrtime.bigint();
  const req = http.request({ host: 'localhost', port: 3000, path, method: 'GET' }, (res) => {
    res.resume();
    res.on('end', () => resolve({ status: res.statusCode, ms: Number(process.hrtime.bigint() - started) / 1e6 }));
  });
  req.on('error', () => resolve({ status: 0, ms: 0 }));
  req.end();
});

console.log('\n=== SENSITIVE PATH REDOS AUDIT ===');

// The same files stay blocked, including the less obvious shapes the old patterns matched
for (const p of ['/tsconfig.json', '/tsconfig.node.json', '/TSCONFIG.JSON', '/firebase.json', '/firebase-applet-config.json',
  '/firebase-blueprint.json', '/Firebase-Config.JSON', '/public/firebase/x.json', '/js/my-firebase-settings.json', '/a/tsconfig/b.json']) {
  const r = await get(p);
  check(`${p} still blocked`, r.status === 404, `got ${r.status}`);
}
// ...and nothing that merely mentions the word is newly blocked beyond the old rule's reach
for (const p of ['/src/services/firebase.js', '/manifest.json']) {
  const r = await get(p);
  check(`${p} still served`, r.status === 200, `got ${r.status}`);
}

// Crafted near-max-length paths: each must be answered quickly, not in tens of milliseconds
const LEN = 15000;
const crafted = {
  firebase: '/' + 'firebase'.repeat(LEN / 8),
  tsconfig: '/' + 'tsconfig'.repeat(LEN / 8),
  'firebase + .json!': '/firebase' + '.json!'.repeat(LEN / 6),
};
for (const [name, p] of Object.entries(crafted)) {
  await get(p); // warm-up
  const times = [];
  for (let i = 0; i < 15; i++) times.push((await get(p)).ms);
  times.sort((a, b) => a - b);
  const median = times[Math.floor(times.length / 2)];
  // The quadratic patterns took ~30 ms each per request on these inputs; a linear check is ~1-2 ms incl. HTTP.
  check(`crafted "${name}" path (${p.length} chars) answered in linear time (median ${median.toFixed(1)} ms < 10 ms)`, median < 10);
}

console.log(`\n   SENSITIVE PATH REDOS AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
