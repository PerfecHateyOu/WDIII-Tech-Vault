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
// End tag: browsers also close a script on `</script >` or `</SCRIPT foo>`, so the pattern accepts those too.
const SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script\b[^>]*>/gi;
const inline = [...html.matchAll(SCRIPT_RE)]
  .filter((m) => !/\bsrc\s*=/i.test(m[1]) && !/application\/ld\+json/i.test(m[1]));
check('index.html has inline scripts to cover', inline.length >= 3, `found ${inline.length}`);
const listed = ro.match(/'sha256-[A-Za-z0-9+/=]+'/g) || [];
check('policy lists exactly one hash per inline script', listed.length === inline.length, `listed ${listed.length}, inline ${inline.length}`);
const ends = [...'<script>a</script ><SCRIPT>b</SCRIPT\n><script>c</script foo>'.matchAll(SCRIPT_RE)].map((m) => m[2]).join('');
check('script pattern closes on spaced and upper-case end tags', ends === 'abc', ends);
for (const [i, m] of inline.entries()) {
  const hash = `'sha256-${crypto.createHash('sha256').update(m[2], 'utf8').digest('base64')}'`;
  check(`inline script ${i + 1} (${m[2].trim().slice(0, 30).replace(/\s+/g, ' ')}…) is listed`, ro.includes(hash));
}

const sub = await get('/fa01/round-1/gemini.html');
check('/fa01 submission keeps only its sandbox policy', sub.status === 200 && !sub.headers['content-security-policy-report-only'] && /sandbox/.test(sub.headers['content-security-policy'] || ''), `${sub.status}`);

console.log(`\n   CSP REPORT-ONLY AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
