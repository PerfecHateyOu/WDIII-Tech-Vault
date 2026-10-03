/**
 * Security headers audit. Requires the server on localhost:3000.
 *  - every response (pages, API, static files, 404s) carries the baseline headers and no X-Powered-By
 *  - CORS is unchanged (public read-only data stays readable)
 *  - /fa01/ submissions keep their stricter sandbox headers (the global ones must not replace them)
 *  - firebase.json: only /experiment-12.html and /fa01/** may set a CSP, and /fa01/** stays the last rule,
 *    so a broader Hosting rule can never weaken the sandbox
 *  - the pages use nothing the CSP forbids (iframes, plugins, <base>, cross-origin form actions)
 */
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

console.log('\n=== SECURITY HEADERS AUDIT ===');

const baseline = (label, res) => {
  const h = res.headers, csp = h['content-security-policy'] || '';
  check(`${label}: nosniff`, h['x-content-type-options'] === 'nosniff');
  check(`${label}: clickjacking protection (X-Frame-Options and frame-ancestors)`, h['x-frame-options'] === 'SAMEORIGIN' && /frame-ancestors 'self'/.test(csp), `${h['x-frame-options']} | ${csp}`);
  check(`${label}: CSP forbids plugins, foreign <base> and foreign form targets`, /object-src 'none'/.test(csp) && /base-uri 'self'/.test(csp) && /form-action 'self'/.test(csp), csp);
  check(`${label}: referrer and permissions policies`, /strict-origin-when-cross-origin/.test(h['referrer-policy'] || '') && /camera=\(\)/.test(h['permissions-policy'] || ''));
  check(`${label}: no X-Powered-By`, h['x-powered-by'] === undefined, h['x-powered-by']);
};
baseline('home page', await get('/'));
const api = await get('/api/summary'); baseline('API', api);
check('API: CORS unchanged (public data stays readable)', api.headers['access-control-allow-origin'] === '*');
baseline('static module', await get('/src/data/official-experiments.js'));
baseline('stylesheet', await get('/css/style.css'));
const notFound = await get('/definitely-not-a-page.html'); baseline('404 page', notFound);
check('404 page really is a 404', notFound.status === 404, `got ${notFound.status}`);

const sub = await get('/fa01/round-1/grok.html');
check('submission still served (needs the Round 1 file)', sub.status === 200, `got ${sub.status}`);
const scsp = sub.headers['content-security-policy'] || '';
check('submission keeps the sandbox CSP', /(^|;)\s*sandbox\b/.test(scsp) && !/allow-same-origin/.test(scsp), scsp);
check('submission keeps no-referrer and noindex', sub.headers['referrer-policy'] === 'no-referrer' && /noindex/.test(sub.headers['x-robots-tag'] || ''), `${sub.headers['referrer-policy']} | ${sub.headers['x-robots-tag']}`);

const rules = JSON.parse(fs.readFileSync('firebase.json', 'utf8')).hosting.headers;
const withCsp = rules.filter((r) => r.headers.some((x) => x.key === 'Content-Security-Policy')).map((r) => r.source);
check('Hosting: only /experiment-12.html and /fa01/** set a CSP', withCsp.every((s) => ['/experiment-12.html', '/fa01/**'].includes(s)) && withCsp.includes('/fa01/**'), withCsp.join(', '));
check('Hosting: /fa01/** is the last header rule', rules[rules.length - 1].source === '/fa01/**');
check('Hosting: asset rules add nosniff', rules.filter((r) => /\.@\(/.test(r.source)).every((r) => r.headers.some((x) => x.key === 'X-Content-Type-Options')));

const pages = fs.readFileSync('index.html', 'utf8') + '\n' + fs.readFileSync('public/experiment-12.html', 'utf8');
const forbidden = ['<iframe', '<object', '<embed', '<base ', 'srcdoc='].filter((t) => pages.toLowerCase().includes(t));
check('pages use nothing the CSP forbids (no iframe, object, embed, base, srcdoc)', forbidden.length === 0, forbidden.join(', '));
check('no form posts to another origin', !/<form[^>]*\saction\s*=\s*["']https?:/i.test(pages));

console.log(`\n   SECURITY HEADERS AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
