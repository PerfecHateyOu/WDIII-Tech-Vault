/**
 * FA-01 raw submission hosting audit. Requires the server on localhost:3000.
 * Writes a temporary fixture under public/fa01/round-99/, checks it is served
 * sandboxed, checks that everything else under /fa01 is refused, validates
 * submission links in the data, and removes the fixture.
 */
import fs from 'fs';
import http from 'http';
import path from 'path';
import { OFFICIAL_EXPERIMENTS as E } from '../src/data/official-experiments.js';

let passed = 0, failed = 0;
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};
const get = (p) => new Promise((resolve, reject) => {
  http.get({ host: 'localhost', port: 3000, path: p }, (res) => {
    let body = ''; res.on('data', (c) => (body += c)); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
  }).on('error', reject);
});

const FIXTURE_DIR = path.join('public', 'fa01', 'round-99');
const FIXTURE = path.join(FIXTURE_DIR, 'test-model.html');
console.log('\n=== FA-01 SUBMISSION HOSTING AUDIT ===');
fs.mkdirSync(FIXTURE_DIR, { recursive: true });
fs.writeFileSync(FIXTURE, '<!doctype html><title>fixture</title><script>document.cookie</script><p>raw</p>');
fs.writeFileSync(path.join(FIXTURE_DIR, 'Bad_Name.html'), '<p>x</p>');

try {
  let r = await get('/fa01/round-99/test-model.html');
  check('valid submission path is served (200)', r.status === 200, `got ${r.status}`);
  const csp = r.headers['content-security-policy'] || '';
  check('served inside a sandbox', /(^|;)\s*sandbox\b/.test(csp), csp);
  check('sandbox does not allow same-origin', !/allow-same-origin/.test(csp), csp);
  check('noindex header set', /noindex/.test(r.headers['x-robots-tag'] || ''));
  check('nosniff header set', r.headers['x-content-type-options'] === 'nosniff');
  check('no-referrer header set', r.headers['referrer-policy'] === 'no-referrer');
  check('content served unchanged', r.body.includes('<script>document.cookie</script>'));

  for (const [label, p] of [
    ['missing file -> 404', '/fa01/round-99/nope.html'],
    ['uppercase / underscore name -> 404', '/fa01/round-99/Bad_Name.html'],
    ['non-html file -> 404', '/fa01/README.md'],
    ['folder listing -> 404', '/fa01/round-99/'],
    ['encoded traversal -> 404', '/fa01/round-99/..%2f..%2f..%2fserver.js'],
    ['traversal to package.json -> 404', '/fa01/round-99/%2e%2e/%2e%2e/%2e%2e/package.json'],
    ['wrong round format -> 404', '/fa01/round-x/test-model.html']
  ]) {
    r = await get(p);
    check(label, r.status === 404, `got ${r.status}`);
  }
} finally {
  fs.rmSync(FIXTURE_DIR, { recursive: true, force: true });
}

const hosting = JSON.parse(fs.readFileSync('firebase.json', 'utf8')).hosting;
const rule = (hosting.headers || []).find((h) => h.source === '/fa01/**');
const hcsp = rule && (rule.headers.find((x) => x.key === 'Content-Security-Policy') || {}).value || '';
check('Firebase Hosting sends the same sandbox for /fa01/**', /(^|;)\s*sandbox\b/.test(hcsp) && !/allow-same-origin/.test(hcsp), hcsp);
check('Firebase Hosting skips README files in /fa01', (hosting.ignore || []).includes('fa01/**/*.md'));

const PATTERN = /^\/fa01\/round-\d{1,2}\/[a-z0-9][a-z0-9-]{0,40}\.html$/;
const links = [];
const walk = (blocks) => (blocks || []).forEach((b) => { if (b.link) links.push(b.link); if (b.type === 'group') walk(b.children); });
E.forEach((e) => walk(e.sections));
const bad = links.filter((l) => !PATTERN.test(l) || !fs.existsSync(path.join('public', l)));
check(`every submission link points to a published file (${links.length} links)`, bad.length === 0, bad.join(', '));

// Every published submission must match its recorded checksum, and every file must be recorded
const sumsText = fs.existsSync(path.join('public', 'fa01', 'checksums.md')) ? fs.readFileSync(path.join('public', 'fa01', 'checksums.md'), 'utf8') : '';
const recorded = new Map([...sumsText.matchAll(/^([0-9a-f]{64})\s+(fa01\/round-\d{1,2}\/[a-z0-9-]+\.html)$/gm)].map((m) => [m[2], m[1]]));
const published = fs.readdirSync(path.join('public', 'fa01'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^round-\d{1,2}$/.test(d.name))
  .flatMap((d) => fs.readdirSync(path.join('public', 'fa01', d.name)).filter((f) => f.endsWith('.html')).map((f) => `fa01/${d.name}/${f}`));
const { createHash } = await import('crypto');
const mismatched = published.filter((rel) => recorded.get(rel) !== createHash('sha256').update(fs.readFileSync(path.join('public', rel))).digest('hex'));
check(`every submission matches its recorded checksum (${published.length} files)`, published.length > 0 && mismatched.length === 0, mismatched.join(', '));
const gitattributes = fs.existsSync('.gitattributes') ? fs.readFileSync('.gitattributes', 'utf8') : '';
check('.gitattributes marks submissions binary (no normalization)', /^public\/fa01\/\*\*\/\*\.html\s+binary\s*$/m.test(gitattributes));

console.log(`\n   FA-01 SUBMISSION AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
