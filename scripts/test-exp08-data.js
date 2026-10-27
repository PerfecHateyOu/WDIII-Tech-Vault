/**
 * Experiment 8 review check (static, no server needed).
 * Exp 8 is a plain review: data/exp-08/README.md is the only file, and the
 * site entry stays in progress with no timed-trial / cadence / week-0 leftovers.
 */
import fs from 'fs';
import { OFFICIAL_EXPERIMENTS } from '../src/data/official-experiments.js';
import { OFFICIAL_DEVICES } from '../src/data/official-devices.js';

let passed = 0, failed = 0;
const check = (label, cond) => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label}`); }
};

console.log('\n=== EXPERIMENT 8 REVIEW AUDIT ===');
const DIR = 'data/exp-08';
check('README.md exists', fs.existsSync(`${DIR}/README.md`));
check('README.md is the only file', fs.existsSync(DIR) && fs.readdirSync(DIR).join() === 'README.md');
const readme = fs.existsSync(`${DIR}/README.md`) ? fs.readFileSync(`${DIR}/README.md`, 'utf8') : '';
for (const s of ['We’ve only been a couple of months into this', 'Apple side (iPhone 16e, MacBook Pro, Watch SE 3, AirPods 5)', 'Samsung (S26 Ultra, Galaxy Book, Watch8, Buds4 Pro)', 'Google (Pixel 10 Pro, Chromebook Plus, Pixel Watch 4, Pixel Buds Pro 2)', 'it’s Apple, then Samsung, then Google']) {
  check(`README mentions "${s}"`, readme.includes(s));
}
const exp = OFFICIAL_EXPERIMENTS.find((e) => e.id === 'queued-exp8');
check('queued-exp8 entry exists', !!exp);
check('queued-exp8 status is in progress', exp?.status === 'progress' && exp?.statusLabel === 'In Progress');
check('queued-exp8 lists 12 devices', exp?.devices?.length === 12);
const ids = new Set(OFFICIAL_DEVICES.map((d) => d.id));
check('every queued-exp8 device exists', (exp?.devices || []).every((id) => ids.has(id)));
const html = fs.readFileSync('index.html', 'utf8');
const card = html.split('<article id="queue1"')[1]?.split('<article id="queue2"')[0] || '';
const banned = /timed trial|\.csv|weekly|monthly|\bTBD\b|week[- ]0|day 0|protocol v1|2026-09-27/i;
const files = { README: readme, entry: JSON.stringify(exp || {}), 'index.html card': card };
for (const [name, text] of Object.entries(files)) check(`${name} has no timed-trial / cadence / week-0 wording`, !banned.test(text));
check('index.html card holds the ranking paragraph', card.includes('Two months isn’t long, but the pattern already feels consistent.'));

console.log(`\n   EXPERIMENT 8 REVIEW AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
