/**
 * Cache header & versioned module path audit (needs the server on port 3000).
 * File names aren't content-hashed, so scripts must revalidate and the import map
 * must point at the current release, or visitors keep stale code after deploys.
 */
import http from 'http';
import fs from 'fs';

let passed = 0, failed = 0;
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};

function get(path) {
  return new Promise((resolve) => {
    http.get({ host: 'localhost', port: 3000, path, timeout: 3000 }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => resolve({ status: res.statusCode, cache: res.headers['cache-control'] || '', body }));
    }).on('error', () => resolve({ status: 500, cache: '', body: '' }));
  });
}

console.log('\n=== CACHE HEADERS & VERSIONED MODULE PATHS ===');

const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
const html = fs.readFileSync('index.html', 'utf8');
const importMap = html.match(/<script type="importmap">([\s\S]*?)<\/script>/);
check('index.html has an import map', !!importMap);
const map = importMap ? JSON.parse(importMap[1]).imports : {};
check(`import map /src/ points at /v/${version}/src/`, map['/src/'] === `/v/${version}/src/`, `got ${map['/src/']}`);
check(`import map /js/ points at /v/${version}/js/`, map['/js/'] === `/v/${version}/js/`, `got ${map['/js/']}`);
check('import map comes before the module script', html.indexOf('type="importmap"') < html.indexOf('<script type="module">'));
check(`stylesheet link is versioned ?v=${version}`, html.includes(`/css/style.css?v=${version}`));

const firebase = fs.readFileSync('firebase.json', 'utf8');
check('firebase.json no longer marks assets immutable', !firebase.includes('immutable'));

for (const path of ['/src/utils/sanitize.js', `/v/${version}/src/utils/sanitize.js`, '/js/main.js', `/v/${version}/js/main.js`, '/css/style.css']) {
  const r = await get(path);
  check(`GET ${path} -> 200, Cache-Control no-cache`, r.status === 200 && r.cache === 'no-cache', `got ${r.status} "${r.cache}"`);
}

const same = await Promise.all([get('/src/ui/devices-view.js'), get(`/v/${version}/src/ui/devices-view.js`)]);
check('versioned /src path serves the same file', same[0].body.length > 0 && same[0].body === same[1].body);

const img = await get('/logo.svg');
check('GET /logo.svg -> cached for a day, not immutable', img.status === 200 && img.cache === 'public, max-age=86400', `got "${img.cache}"`);

const home = await get('/');
check('GET / -> no-cache', home.status === 200 && home.cache.startsWith('no-cache'), `got "${home.cache}"`);

for (const path of [`/v/${version}/src/../server.js`, `/v/${version}/src/%2e%2e/server.js`, `/v/${version}/src/data/x.json`, '/v/bad!version/src/utils/sanitize.js', `/v/${version}/js/../../server.js`]) {
  const r = await get(path);
  check(`GET ${path} -> does not serve server code`, r.status !== 200 || !r.body.includes('express'), `got ${r.status}`);
}

console.log(`\n   CACHE HEADER AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
