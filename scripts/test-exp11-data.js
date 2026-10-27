/**
 * Experiment 11 review check (static, no server needed).
 * Exp 11 is a plain review: data/exp-11/README.md is the only file, and the
 * site entry must be marked done with no timed-trial / cadence leftovers.
 */
import fs from 'fs';
import { OFFICIAL_EXPERIMENTS } from '../src/data/official-experiments.js';

let passed = 0, failed = 0;
const check = (label, cond) => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label}`); }
};

console.log('\n=== EXPERIMENT 11 REVIEW AUDIT ===');
const DIR = 'data/exp-11';
check('README.md exists', fs.existsSync(`${DIR}/README.md`));
check('README.md is the only file', fs.existsSync(DIR) && fs.readdirSync(DIR).join() === 'README.md');
const readme = fs.existsSync(`${DIR}/README.md`) ? fs.readFileSync(`${DIR}/README.md`, 'utf8') : '';
for (const s of ['Google Book OS', 'Lenovo Googlebook 15', 'Pixel 10 Pro with Android 17', 'Wi-Fi connectivity, clipboard management, cross-device app streaming, and task continuation', 'Phone Integration', '$900 to $1,300']) {
  check(`README mentions "${s}"`, readme.includes(s));
}
const exp = OFFICIAL_EXPERIMENTS.find((e) => e.id === 'exp11');
check('exp11 entry exists', !!exp);
check('exp11 status is done', exp?.status === 'done' && exp?.statusLabel === 'Done');
const banned = /timed trial|trials\.csv|weekly|monthly|\bTBD\b|no trials/i;
const files = { README: readme, entry: JSON.stringify(exp || {}), 'index.html': fs.readFileSync('index.html', 'utf8').split('function buildExp11')[1]?.split('function buildQueued')[0] || '' };
for (const [name, text] of Object.entries(files)) check(`${name} has no timed-trial / cadence wording`, !banned.test(text));
check('index.html renders exp11 via buildExp11()', /buildExp11\(\)\+buildQueued\(\)/.test(fs.readFileSync('index.html', 'utf8')));

console.log(`\n   EXPERIMENT 11 REVIEW AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
