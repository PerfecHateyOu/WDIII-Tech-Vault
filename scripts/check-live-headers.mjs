/**
 * Post-deploy check of the security headers on the live site (Hosting + Cloud Run together).
 *
 *   node scripts/check-live-headers.mjs https://<hosting-url>
 *
 * Most important line: the /fa01/ submission must still be sandboxed. If a broader Hosting rule ever
 * replaced its headers, hostile page code would run with the site's own origin.
 */
const base = (process.argv[2] || '').replace(/\/+$/, '');
if (!/^https?:\/\//.test(base)) { console.error('Usage: node scripts/check-live-headers.mjs https://<hosting-url>'); process.exit(2); }

let failures = 0;
const report = (ok, label, detail = '') => { console.log(`${ok ? 'OK  ' : 'FAIL'}  ${label}${ok || !detail ? '' : `  (${detail})`}`); if (!ok) failures++; };
const fetchHeaders = async (path) => { const res = await fetch(base + path, { redirect: 'manual', headers: { 'Cache-Control': 'no-cache' } }); await res.arrayBuffer(); return { status: res.status, h: res.headers }; };

const baseline = (label, { h }) => {
  const csp = h.get('content-security-policy') || '';
  report(h.get('x-content-type-options') === 'nosniff', `${label}: nosniff`);
  report(/frame-ancestors 'self'/.test(csp) && /object-src 'none'/.test(csp) && /base-uri 'self'/.test(csp), `${label}: CSP`, csp || 'no CSP header');
  report(h.get('x-frame-options') === 'SAMEORIGIN', `${label}: X-Frame-Options`, String(h.get('x-frame-options')));
  report(!!h.get('referrer-policy') && !!h.get('permissions-policy'), `${label}: referrer and permissions policies`);
  report(!h.get('x-powered-by'), `${label}: no X-Powered-By`, String(h.get('x-powered-by')));
};

const home = await fetchHeaders('/'); report(home.status === 200, 'home page loads', `HTTP ${home.status}`); baseline('home page', home);
const api = await fetchHeaders('/api/summary'); report(api.status === 200, 'API loads', `HTTP ${api.status}`); baseline('API', api);
const css = await fetchHeaders('/css/style.css'); report(css.status === 200 && css.h.get('x-content-type-options') === 'nosniff', 'stylesheet (served by Hosting): nosniff', `HTTP ${css.status}, ${css.h.get('x-content-type-options')}`);
const e12 = await fetchHeaders('/experiment-12.html'); if (e12.status === 200) baseline('/experiment-12.html (Hosting)', e12); else report(true, `/experiment-12.html not served directly (HTTP ${e12.status}); skipped`);

console.log('');
const sub = await fetchHeaders('/fa01/round-1/grok.html');
const scsp = sub.h.get('content-security-policy') || '';
report(sub.status === 200, 'submission loads', `HTTP ${sub.status}`);
report(/(^|;)\s*sandbox\b/.test(scsp) && !/allow-same-origin/.test(scsp), 'SUBMISSION IS STILL SANDBOXED (no same-origin)', scsp || 'no CSP header');
report(sub.h.get('referrer-policy') === 'no-referrer' && /noindex/.test(sub.h.get('x-robots-tag') || ''), 'submission: no-referrer and noindex', `${sub.h.get('referrer-policy')} | ${sub.h.get('x-robots-tag')}`);

console.log(failures ? `\n${failures} check(s) failed. Do not leave this deployed until the sandbox line is OK.` : '\nAll good.');
process.exit(failures ? 1 : 0);
