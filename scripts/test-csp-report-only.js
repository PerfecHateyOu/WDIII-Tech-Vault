/**
 * The trial script policy (Content-Security-Policy-Report-Only). Requires the server on localhost:3000.
 *  - sent on pages, never enforced (the enforced CSP must not contain script-src yet)
 *  - lists a hash for every inline <script> in index.html, computed independently here
 *  - not sent on /fa01 submissions, which have their own sandbox policy
 */
import crypto from 'crypto';
import fs from 'fs';
import http from 'http';

let passed = 0, failed = 0;
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};
const get = (path) => new Promise((resolve, reject) => {
  http.get({ host: 'localhost', port: 3000, path }, (res) => {
    res.resume(); res.on('end', () => resolve({ status: res.statusCode, headers: res.headers }));
  }).on('error', reject);
});

console.log('\n=== CSP REPORT-ONLY AUDIT ===');

const home = await get('/');
const ro = home.headers['content-security-policy-report-only'] || '';
check('home page sends Content-Security-Policy-Report-Only', ro.length > 0);
check('policy allows own origin and the Firebase SDK host', /script-src 'self' https:\/\/www\.gstatic\.com/.test(ro), ro.slice(0, 120));
check('the enforced CSP does not restrict scripts yet', !/script-src/.test(home.headers['content-security-policy'] || ''));

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const inline = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter((m) => !/\bsrc\s*=/i.test(m[1]) && !/application\/ld\+json/i.test(m[1]));
check('index.html has inline scripts to cover', inline.length >= 3, `found ${inline.length}`);
for (const [i, m] of inline.entries()) {
  const hash = `'sha256-${crypto.createHash('sha256').update(m[2], 'utf8').digest('base64')}'`;
  check(`inline script ${i + 1} (${m[2].trim().slice(0, 30).replace(/\s+/g, ' ')}…) is listed`, ro.includes(hash));
}

const sub = await get('/fa01/round-1/gemini.html');
check('/fa01 submission keeps only its sandbox policy', sub.status === 200 && !sub.headers['content-security-policy-report-only'] && /sandbox/.test(sub.headers['content-security-policy'] || ''), `${sub.status}`);

console.log(`\n   CSP REPORT-ONLY AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
