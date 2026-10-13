/**
 * Printer-friendly CSS Stylesheet Audit (requires server on localhost:3000).
 * Verifies that documentation articles have a print stylesheet that:
 *  - is linked in index.html and public/experiment-12.html with media="print"
 *  - is served with correct MIME type (text/css) and cache headers
 *  - strips dark and card backgrounds, box-shadows, and gradients
 *  - hides navigation bars, search inputs, theme toggles, auth headers, and modals
 *  - expands collapsed sections and details elements
 *  - enforces page-break hygiene on tables, comparison cards, and findings
 */
import fs from 'fs';
import http from 'http';

let passed = 0, failed = 0;
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};

const get = (path) => new Promise((resolve) => {
  http.get({ host: 'localhost', port: 3000, path, timeout: 3000 }, (res) => {
    let body = '';
    res.on('data', (c) => body += c);
    res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
  }).on('error', (err) => resolve({ status: 500, headers: {}, body: '', error: err.message }));
});

console.log('\n=== PRINTER-FRIENDLY CSS AUDIT ===');

// 1. File existence and content inspection
const printCssPath = 'public/css/print.css';
const exists = fs.existsSync(printCssPath);
check('public/css/print.css exists', exists);

const printCss = exists ? fs.readFileSync(printCssPath, 'utf8') : '';
check('print.css contains @page rule', /@page\b/.test(printCss));
check('print.css contains @media print rule', /@media\s+print\b/.test(printCss));
check('print.css removes backgrounds and shadows', /background:\s*transparent\s*!important/i.test(printCss) && /box-shadow:\s*none\s*!important/i.test(printCss));
check('print.css sets crisp dark ink text color', /color:\s*#111\s*!important/i.test(printCss) || /color:\s*#000\s*!important/i.test(printCss));
check('print.css hides navigation elements', printCss.includes('.home-subheader-bar') && printCss.includes('#navHome') && printCss.includes('.skip-link'));
check('print.css hides theme toggles and search controls', printCss.includes('themeToggle') && printCss.includes('#searchHome'));
check('print.css hides modals and dialogs', printCss.includes('.modal') && printCss.includes('[role="dialog"]'));
check('print.css avoids page breaks inside articles and tables', /break-inside:\s*avoid\s*!important/i.test(printCss));
check('print.css expands details elements', /details\s*\{[^}]*display:\s*block\s*!important/i.test(printCss));

// 2. Head link verification in index.html and experiment-12.html
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const html = fs.readFileSync('index.html', 'utf8');
const exp12Html = fs.readFileSync('public/experiment-12.html', 'utf8');

check(`index.html links /css/print.css with media="print" and ?v=${pkg.version}`,
  html.includes(`/css/print.css?v=${pkg.version}`) && /<link[^>]+href="\/css\/print\.css\?v=[^"]+"[^>]+media="print"/.test(html)
);
check(`experiment-12.html links /css/print.css with media="print"`,
  exp12Html.includes('/css/print.css') && /<link[^>]+href="\/css\/print\.css[^"]*"[^>]+media="print"/.test(exp12Html)
);

// 3. Server HTTP serving check
const res = await get('/css/print.css');
check('GET /css/print.css -> 200 OK', res.status === 200, `got ${res.status}`);
check('GET /css/print.css Content-Type is text/css', (res.headers['content-type'] || '').includes('text/css'), `got ${res.headers['content-type']}`);
check('GET /css/print.css Cache-Control is no-cache', res.headers['cache-control'] === 'no-cache', `got "${res.headers['cache-control']}"`);

// 4. Print Version toggle button and printing-specific CSS adjustment checks
const styleCss = fs.readFileSync('public/css/style.css', 'utf8');
const expDetailJs = fs.readFileSync('src/ui/experiment-detail-view.js', 'utf8');

check('print.css hides .btn-print-version and preview banner in @media print',
  printCss.includes('.btn-print-version') && printCss.includes('.print-version-banner') && /display:\s*none\s*!important/.test(printCss));
check('style.css and print.css define .print-version-active rules',
  styleCss.includes('.print-version-active') && printCss.includes('.print-version-active'));
check('printing-specific CSS adjustments strip backgrounds to pure white and set dark text',
  styleCss.includes('background: #ffffff !important') && styleCss.includes('color: #111111 !important'));
check('index.html contains .btn-print-version toggle buttons with data-target and aria-pressed',
  html.includes('class="btn-print-version"') && html.includes('data-action="toggle-print"') && html.includes('aria-pressed='));
check('experiment-detail-view.js includes .btn-print-version toggle button and click handler',
  expDetailJs.includes('class="btn-print-version"') && expDetailJs.includes('handlePrintVersionToggle'));
check('public/experiment-12.html includes .btn-print-version toggle button',
  exp12Html.includes('class="btn-print-version"') && exp12Html.includes('btnPrintVersionExp12'));

console.log(`\n   PRINTER-FRIENDLY CSS AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
