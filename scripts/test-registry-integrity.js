/**
 * Registry integrity audit (static).
 * Every device an experiment lists must exist in the registry, and every
 * experimentsInvolved link must point at a real experiment that lists the device back.
 */
import { OFFICIAL_EXPERIMENTS as E } from '../src/data/official-experiments.js';
import { OFFICIAL_DEVICES as D } from '../src/data/official-devices.js';

let passed = 0, failed = 0;
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};

console.log('\n=== REGISTRY INTEGRITY AUDIT ===');
const deviceIds = new Set(D.map((d) => d.id));
const expIds = new Set(E.map((e) => e.id));

check('device ids are unique', deviceIds.size === D.length);
check('experiment ids are unique', expIds.size === E.length);

const missing = E.flatMap((e) => (e.devices || []).filter((id) => !deviceIds.has(id)).map((id) => `${e.id} -> ${id}`));
check('every experiment device exists in the registry', missing.length === 0, missing.join(', '));

const dangling = D.flatMap((d) => (d.experimentsInvolved || []).filter((x) => !expIds.has(x)).map((x) => `${d.id} -> ${x}`));
check('every experimentsInvolved points at a real experiment', dangling.length === 0, dangling.join(', '));

const oneWay = D.flatMap((d) => (d.experimentsInvolved || [])
  .filter((x) => expIds.has(x) && !(E.find((e) => e.id === x).devices || []).includes(d.id))
  .map((x) => `${d.id} -> ${x}`));
check('device/experiment links are two-way', oneWay.length === 0, oneWay.join(', '));

const orphans = D.filter((d) => !(d.experimentsInvolved || []).length).map((d) => d.id);
check('no orphaned devices (used by no experiment)', orphans.length === 0, orphans.join(', '));

console.log(`\n   REGISTRY INTEGRITY AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
