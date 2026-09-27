/**
 * Experiment 8 data log validator (static, no server needed).
 * Catches malformed rows early so 24 months of data stay usable.
 */
import fs from 'fs';

const DIR = 'data/exp-08';
const ECOSYSTEMS = ['apple', 'google', 'samsung'];
const CATEGORIES = ['phone', 'laptop', 'watch', 'earbuds'];
const TESTS = { clipboard_p2l: 5, clipboard_l2p: 5, file_transfer: 3, notif_watch: 5, audio_switch: 3 };
const CHECKPOINTS = /^(m00|monthly|m06|m12|m18|m24)$/;
const HEADERS = {
  'devices.csv': 'device_id,ecosystem,category,manufacturer,model,in_registry,acquired_date,os_at_baseline,notes',
  'weekly.csv': 'date,ecosystem,test,trial,success,seconds,phone_os,laptop_os,accessory_fw,notes',
  'health.csv': 'date,device_id,checkpoint,battery_health_pct,cycle_count,storage_free_gb,os_version,issues,notes',
  'incidents.csv': 'datetime,device_id,ecosystem,feature,description,resolution,minutes_lost'
};

let passed = 0, failed = 0;
const errors = [];
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};

// Minimal RFC 4180 parser: handles quoted fields with commas, quotes and newlines.
function parseCsv(text) {
  const rows = []; let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const isDateTime = (s) => /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?$/.test(s) && !Number.isNaN(Date.parse(s.replace(' ', 'T')));
const isNum = (s) => s !== '' && Number.isFinite(Number(s)) && Number(s) >= 0;
const numOrNA = (s) => s === '' || s === 'not_exposed' || isNum(s);

console.log('\n=== EXPERIMENT 8 DATA AUDIT ===');

const tables = {};
for (const [file, header] of Object.entries(HEADERS)) {
  const path = `${DIR}/${file}`;
  if (!fs.existsSync(path)) { check(`${file} exists`, false); continue; }
  const rows = parseCsv(fs.readFileSync(path, 'utf8'));
  check(`${file} header matches`, rows[0]?.join(',') === header, `got "${rows[0]?.join(',')}"`);
  const cols = header.split(',');
  const records = rows.slice(1).map((r, i) => {
    if (r.length !== cols.length) errors.push(`${file} line ${i + 2}: expected ${cols.length} columns, got ${r.length}`);
    return Object.fromEntries(cols.map((c, j) => [c, (r[j] ?? '').trim()]));
  });
  tables[file] = records;
}

const devices = tables['devices.csv'] || [];
const ids = new Set(devices.map((d) => d.device_id));
check('devices.csv lists 12 devices', devices.length === 12, `got ${devices.length}`);
check('device_ids are unique', ids.size === devices.length);
for (const eco of ECOSYSTEMS) {
  const cats = devices.filter((d) => d.ecosystem === eco).map((d) => d.category).sort().join(',');
  check(`${eco}: one device per category`, cats === [...CATEGORIES].sort().join(','), `got ${cats}`);
}
devices.forEach((d, i) => {
  const at = `devices.csv line ${i + 2}`;
  if (!ECOSYSTEMS.includes(d.ecosystem)) errors.push(`${at}: unknown ecosystem "${d.ecosystem}"`);
  if (!CATEGORIES.includes(d.category)) errors.push(`${at}: unknown category "${d.category}"`);
  if (!['yes', 'no'].includes(d.in_registry)) errors.push(`${at}: in_registry must be yes/no`);
  if (d.acquired_date && !isDate(d.acquired_date)) errors.push(`${at}: acquired_date must be YYYY-MM-DD`);
});

(tables['weekly.csv'] || []).forEach((r, i) => {
  const at = `weekly.csv line ${i + 2}`;
  if (!isDate(r.date)) errors.push(`${at}: date must be YYYY-MM-DD`);
  if (!ECOSYSTEMS.includes(r.ecosystem)) errors.push(`${at}: unknown ecosystem "${r.ecosystem}"`);
  if (!(r.test in TESTS)) errors.push(`${at}: unknown test "${r.test}"`);
  else if (!(Number.isInteger(Number(r.trial)) && Number(r.trial) >= 1 && Number(r.trial) <= TESTS[r.test])) errors.push(`${at}: trial must be 1-${TESTS[r.test]} for ${r.test}`);
  if (!['0', '1'].includes(r.success)) errors.push(`${at}: success must be 0 or 1`);
  if (r.success === '1' && !isNum(r.seconds)) errors.push(`${at}: seconds required (>= 0) when success = 1`);
  if (r.success === '0' && r.seconds !== '') errors.push(`${at}: seconds must be empty when success = 0`);
});

(tables['health.csv'] || []).forEach((r, i) => {
  const at = `health.csv line ${i + 2}`;
  if (!isDate(r.date)) errors.push(`${at}: date must be YYYY-MM-DD`);
  if (!ids.has(r.device_id)) errors.push(`${at}: unknown device_id "${r.device_id}"`);
  if (!CHECKPOINTS.test(r.checkpoint)) errors.push(`${at}: checkpoint must be m00/monthly/m06/m12/m18/m24`);
  if (!numOrNA(r.battery_health_pct) || (isNum(r.battery_health_pct) && Number(r.battery_health_pct) > 100)) errors.push(`${at}: battery_health_pct must be 0-100, not_exposed, or empty`);
  if (!numOrNA(r.cycle_count)) errors.push(`${at}: cycle_count must be a number, not_exposed, or empty`);
  if (!numOrNA(r.storage_free_gb)) errors.push(`${at}: storage_free_gb must be a number, not_exposed, or empty`);
});

(tables['incidents.csv'] || []).forEach((r, i) => {
  const at = `incidents.csv line ${i + 2}`;
  if (!isDateTime(r.datetime)) errors.push(`${at}: datetime must be YYYY-MM-DD or YYYY-MM-DD HH:MM`);
  if (!ids.has(r.device_id)) errors.push(`${at}: unknown device_id "${r.device_id}"`);
  if (!ECOSYSTEMS.includes(r.ecosystem)) errors.push(`${at}: unknown ecosystem "${r.ecosystem}"`);
  if (!r.description) errors.push(`${at}: description required`);
  if (r.minutes_lost !== '' && !isNum(r.minutes_lost)) errors.push(`${at}: minutes_lost must be a number`);
});

check('all data rows valid', errors.length === 0, '\n      ' + errors.slice(0, 20).join('\n      '));
const counts = Object.entries(tables).map(([f, r]) => `${f}: ${r.length}`).join(', ');
console.log(`   rows -> ${counts}`);
console.log(`\n   EXPERIMENT 8 DATA AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
