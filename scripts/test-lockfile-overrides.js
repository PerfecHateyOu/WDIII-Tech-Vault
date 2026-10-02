/**
 * The lockfile must respect package.json "overrides".
 *
 * Why: the overrides pin patched versions of packages that dependencies would otherwise pull in as
 * vulnerable ones (for example @grpc/grpc-js 1.9.x). Regenerating package-lock.json without them
 * silently brings the advisories back; it has happened twice (commits c2a9f3f and 2bba5f4).
 * `npm ci` still passes in that state, so nothing else notices. This runs offline.
 *
 *   node scripts/test-lockfile-overrides.js                    check the repo's lockfile
 *   node scripts/test-lockfile-overrides.js <lock> <package>   check another pair (used to prove the check works)
 */
import fs from 'fs';

const lockPath = process.argv[2] || 'package-lock.json';
const pkgPath = process.argv[3] || 'package.json';

let passed = 0, failed = 0;
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};

// Minimal semver for the range forms used in overrides: exact, ^x.y.z, ~x.y.z, >=x.y.z
const parse = (v) => { const m = /^(\d+)\.(\d+)\.(\d+)/.exec(v || ''); return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null; };
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
function satisfies(version, range) {
  const v = parse(version); if (!v) return false;
  const m = /^(\^|~|>=)?\s*(\d+\.\d+\.\d+)/.exec(range.trim()); if (!m) return null;   // null = range form not understood
  const base = parse(m[2]);
  if (m[1] === '>=') return cmp(v, base) >= 0;
  if (m[1] === '~') return cmp(v, base) >= 0 && v[0] === base[0] && v[1] === base[1];
  if (m[1] === '^') return cmp(v, base) >= 0 && (base[0] > 0 ? v[0] === base[0] : v[1] === base[1]);
  return cmp(v, base) === 0;
}

console.log('\n=== LOCKFILE OVERRIDES AUDIT ===');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
const overrides = Object.entries(pkg.overrides || {}).filter(([, range]) => typeof range === 'string');
check('package.json declares overrides', overrides.length > 0);

for (const [name, range] of overrides) {
  const suffix = `node_modules/${name}`;
  const entries = Object.entries(lock.packages || {}).filter(([path]) => path === suffix || path.endsWith(`/${suffix}`));
  if (entries.length === 0) { check(`${name} ${range}: not installed, nothing to violate`, true); continue; }
  const bad = entries.filter(([, info]) => satisfies(info.version, range) !== true).map(([path, info]) => `${path}@${info.version}`);
  check(`${name} ${range}: every installed copy satisfies the override (${entries.map(([, i]) => i.version).join(', ')})`, bad.length === 0, `-> ${bad.join(', ')}`);
}

console.log(`\n   LOCKFILE OVERRIDES AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
