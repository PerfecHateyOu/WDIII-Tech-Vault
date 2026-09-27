/**
 * Release file audit (static, no server needed).
 * The Dockerfile copies package-lock.json and runs `npm ci`, so a missing or
 * out-of-sync lockfile breaks every Cloud Run deploy. Version bumps deleted it
 * twice (5.7.5 and 5.7.6), and the 5.8.0 bump stripped every integrity hash;
 * this catches both before they reach main.
 */
import fs from 'fs';

let passed = 0, failed = 0;
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};

console.log('\n=== RELEASE FILES AUDIT ===');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const hasLock = fs.existsSync('package-lock.json');
check('package-lock.json exists (Dockerfile runs npm ci)', hasLock);

if (hasLock) {
  const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
  check(`lockfile version matches package.json (${pkg.version})`, lock.version === pkg.version, `got ${lock.version}`);
  check('lockfile root package version matches', lock.packages?.['']?.version === pkg.version, `got ${lock.packages?.['']?.version}`);
  const missing = Object.keys(pkg.dependencies || {}).filter((d) => !lock.packages?.[`node_modules/${d}`]);
  check('every dependency is in the lockfile', missing.length === 0, `missing: ${missing.join(', ')}`);
  // Without integrity hashes `npm ci` still succeeds but no longer verifies what it downloads.
  const unverified = Object.entries(lock.packages || {})
    .filter(([name, meta]) => name && !meta.link && !meta.inBundle && (!meta.integrity || !meta.resolved))
    .map(([name]) => name.replace(/^node_modules\//, ''));
  check('every locked package has resolved + integrity', unverified.length === 0, `${unverified.length} without: ${unverified.slice(0, 5).join(', ')}`);
}

const dockerfile = fs.readFileSync('Dockerfile', 'utf8');
check('Dockerfile still installs with npm ci', /npm ci\b/.test(dockerfile));

console.log(`\n   RELEASE FILES AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
