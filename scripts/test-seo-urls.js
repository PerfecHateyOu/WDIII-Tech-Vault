/**
 * SEO URL consistency audit (static, no server needed).
 * All search-facing URLs must point at the production site URL below.
 * When a custom domain is added, change SITE_URL here and the test lists every file to update.
 */
import fs from 'fs';

const SITE_URL = 'https://project-95f7ca57-6daa-40f6-90b.web.app';
let passed = 0, failed = 0;
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};

const files = {
  index: fs.readFileSync('index.html', 'utf8'),
  exp12: fs.readFileSync('public/experiment-12.html', 'utf8'),
  sitemap: fs.readFileSync('public/sitemap.xml', 'utf8'),
  robots: fs.readFileSync('public/robots.txt', 'utf8')
};

console.log('\n=== SEO URL CONSISTENCY AUDIT ===');

for (const [name, body] of Object.entries(files)) {
  check(`${name}: no dev/preview hosts (ais-dev, *.run.app)`, !/ais-dev|\.run\.app/.test(body));
}

const canonical = (html) => (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
check('index.html canonical is the site root', canonical(files.index) === `${SITE_URL}/`, `got ${canonical(files.index)}`);
check('experiment-12 canonical is its own URL', canonical(files.exp12) === `${SITE_URL}/experiment-12`, `got ${canonical(files.exp12)}`);

const ogImages = [...files.index.matchAll(/og:image" content="([^"]+)"/g), ...files.exp12.matchAll(/og:image" content="([^"]+)"/g)].map((m) => m[1]);
check('og:image URLs are absolute on the site host', ogImages.length >= 2 && ogImages.every((u) => u.startsWith(`${SITE_URL}/`)), JSON.stringify(ogImages));

const locs = [...files.sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
check('sitemap has entries', locs.length > 0);
check('sitemap URLs are on the site host', locs.every((u) => u.startsWith(`${SITE_URL}/`)), JSON.stringify(locs));
check('sitemap has no hash-route URLs', locs.every((u) => !u.includes('#')), JSON.stringify(locs));

check('robots.txt points at the site sitemap', files.robots.includes(`Sitemap: ${SITE_URL}/sitemap.xml`));

console.log(`\n   SEO URL AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
