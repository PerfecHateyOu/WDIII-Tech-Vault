/**
 * Experiment 10 data log validator (static, no server needed).
 * Catches malformed rows early so a year of iOS 26 / iOS 27 data stays usable.
 */
import fs from 'fs';

const DIR = 'data/exp-10';
const APPS = ['Settings', 'Camera', 'Safari', 'Messages', 'Maps'];
const TRIALS = 3;
const INCIDENT_TYPES = ['crash', 'hang', 'bug', 'compatibility', 'other'];
const HEADERS = {
  'updates.csv': 'date_installed,from_version,to_version,build,notes',
  'weekly.csv': 'date,os_version,standby_start_pct,standby_end_pct,standby_hours,new_crash_logs,notes',
  'launches.csv': 'date,os_version,app,trial,seconds,notes',
  'monthly.csv': 'date,os_version,max_capacity_pct,cycle_count,storage_free_gb,geekbench_single,geekbench_multi,notes',
  'incidents.csv': 'datetime,os_version,app,type,description,resolution'
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
const isPct = (s) => isNum(s) && Number(s) <= 100;
const optNum = (s) => s === '' || isNum(s);
// Only iOS 26 (phase A) and iOS 27 (phase B) belong in this study, e.g. 26.4 or 27.0.1.
const isIosVersion = (s) => /^2[67](\.\d+){1,2}$/.test(s);

console.log('\n=== EXPERIMENT 10 DATA AUDIT ===');

const tables = {};
for (const [file, header] of Object.entries(HEADERS)) {
  const path = `${DIR}/${file}`;
  if (!fs.existsSync(path)) { check(`${file} exists`, false); continue; }
  const rows = parseCsv(fs.readFileSync(path, 'utf8'));
  check(`${file} header matches`, rows[0]?.join(',') === header, `got "${rows[0]?.join(',')}"`);
  const cols = header.split(',');
  tables[file] = rows.slice(1).map((r, i) => {
    if (r.length !== cols.length) errors.push(`${file} line ${i + 2}: expected ${cols.length} columns, got ${r.length}`);
    return Object.fromEntries(cols.map((c, j) => [c, (r[j] ?? '').trim()]));
  });
}
check('README.md exists', fs.existsSync(`${DIR}/README.md`));

(tables['updates.csv'] || []).forEach((r, i) => {
  const at = `updates.csv line ${i + 2}`;
  if (!isDate(r.date_installed)) errors.push(`${at}: date_installed must be YYYY-MM-DD`);
  if (!isIosVersion(r.from_version)) errors.push(`${at}: from_version must be an iOS 26 or 27 version`);
  if (!isIosVersion(r.to_version)) errors.push(`${at}: to_version must be an iOS 26 or 27 version`);
});

(tables['weekly.csv'] || []).forEach((r, i) => {
  const at = `weekly.csv line ${i + 2}`;
  if (!isDate(r.date)) errors.push(`${at}: date must be YYYY-MM-DD`);
  if (!isIosVersion(r.os_version)) errors.push(`${at}: os_version must be an iOS 26 or 27 version`);
  const hasStandby = r.standby_start_pct !== '' || r.standby_end_pct !== '' || r.standby_hours !== '';
  if (hasStandby) {
    if (!isPct(r.standby_start_pct) || !isPct(r.standby_end_pct)) errors.push(`${at}: standby_start_pct and standby_end_pct must be 0-100`);
    else if (Number(r.standby_end_pct) > Number(r.standby_start_pct)) errors.push(`${at}: standby_end_pct is higher than standby_start_pct (was it charging?)`);
    if (!isNum(r.standby_hours) || Number(r.standby_hours) > 24) errors.push(`${at}: standby_hours must be 0-24`);
  }
  if (r.new_crash_logs !== '' && !(isNum(r.new_crash_logs) && Number.isInteger(Number(r.new_crash_logs)))) errors.push(`${at}: new_crash_logs must be a whole number >= 0, or empty`);
});

(tables['launches.csv'] || []).forEach((r, i) => {
  const at = `launches.csv line ${i + 2}`;
  if (!isDate(r.date)) errors.push(`${at}: date must be YYYY-MM-DD`);
  if (!isIosVersion(r.os_version)) errors.push(`${at}: os_version must be an iOS 26 or 27 version`);
  if (!APPS.includes(r.app)) errors.push(`${at}: app must be one of ${APPS.join(', ')}`);
  if (!(Number.isInteger(Number(r.trial)) && Number(r.trial) >= 1 && Number(r.trial) <= TRIALS)) errors.push(`${at}: trial must be 1-${TRIALS}`);
  if (!isNum(r.seconds) || Number(r.seconds) > 60) errors.push(`${at}: seconds must be 0-60`);
});

(tables['monthly.csv'] || []).forEach((r, i) => {
  const at = `monthly.csv line ${i + 2}`;
  if (!isDate(r.date)) errors.push(`${at}: date must be YYYY-MM-DD`);
  if (!isIosVersion(r.os_version)) errors.push(`${at}: os_version must be an iOS 26 or 27 version`);
  if (r.max_capacity_pct !== '' && !isPct(r.max_capacity_pct)) errors.push(`${at}: max_capacity_pct must be 0-100 or empty`);
  for (const k of ['cycle_count', 'storage_free_gb', 'geekbench_single', 'geekbench_multi']) {
    if (!optNum(r[k])) errors.push(`${at}: ${k} must be a number or empty`);
  }
});

(tables['incidents.csv'] || []).forEach((r, i) => {
  const at = `incidents.csv line ${i + 2}`;
  if (!isDateTime(r.datetime)) errors.push(`${at}: datetime must be YYYY-MM-DD or YYYY-MM-DD HH:MM`);
  if (!isIosVersion(r.os_version)) errors.push(`${at}: os_version must be an iOS 26 or 27 version`);
  if (!INCIDENT_TYPES.includes(r.type)) errors.push(`${at}: type must be one of ${INCIDENT_TYPES.join(', ')}`);
  if (!r.description) errors.push(`${at}: description required`);
});

check('all data rows valid', errors.length === 0, '\n      ' + errors.slice(0, 20).join('\n      '));
const counts = Object.entries(tables).map(([f, r]) => `${f}: ${r.length}`).join(', ');
console.log(`   rows -> ${counts}`);
console.log(`\n   EXPERIMENT 10 DATA AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
