/**
 * Experiment 11 data log validator (static, no server needed).
 * Lenovo Googlebook 15 + Google Pixel integration. Dates may be blank while the
 * session date is TBD; when present they must be valid.
 */
import fs from 'fs';

const DIR = 'data/exp-11';
const TESTS = ['phone_unlock', 'hotspot_connect', 'notification_delay', 'message_send', 'quick_share', 'photo_access', 'call_audio_switch'];
const TRIALS = 3;
const DEVICES = ['googlebook', 'pixel'];
const INCIDENT_DEVICES = ['googlebook', 'pixel', 'both'];
const HEADERS = {
  'trials.csv': 'date,googlebook_os,pixel_model,android_version,test,trial,success,seconds,notes',
  'reliability.csv': 'date,googlebook_os,android_version,disconnects,sync_errors,failed_features,notes',
  'monthly.csv': 'date,device,os_version,battery_health_pct,cycle_count,standby_drain_pct,standby_hours,notes',
  'updates.csv': 'date_installed,device,from_version,to_version,build,notes',
  'incidents.csv': 'datetime,device,feature,description,resolution,minutes_lost'
};

let passed = 0, failed = 0;
const errors = [];
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};

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
const optDate = (s) => s === '' || isDate(s);
const optDateTime = (s) => s === '' || isDateTime(s);
const isNum = (s) => s !== '' && Number.isFinite(Number(s)) && Number(s) >= 0;
const optNum = (s) => s === '' || isNum(s);
const optInt = (s) => s === '' || (isNum(s) && Number.isInteger(Number(s)));
const optPct = (s) => s === '' || (isNum(s) && Number(s) <= 100);

console.log('\n=== EXPERIMENT 11 DATA AUDIT ===');

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

(tables['trials.csv'] || []).forEach((r, i) => {
  const at = `trials.csv line ${i + 2}`;
  if (!optDate(r.date)) errors.push(`${at}: date must be YYYY-MM-DD or empty`);
  if (!TESTS.includes(r.test)) errors.push(`${at}: test must be one of ${TESTS.join(', ')}`);
  if (!(Number.isInteger(Number(r.trial)) && Number(r.trial) >= 1 && Number(r.trial) <= TRIALS)) errors.push(`${at}: trial must be 1-${TRIALS}`);
  if (!['yes', 'no'].includes(r.success)) errors.push(`${at}: success must be yes or no`);
  if (!optNum(r.seconds) || Number(r.seconds) > 600) errors.push(`${at}: seconds must be 0-600 or empty`);
});

(tables['reliability.csv'] || []).forEach((r, i) => {
  const at = `reliability.csv line ${i + 2}`;
  if (!optDate(r.date)) errors.push(`${at}: date must be YYYY-MM-DD or empty`);
  if (!optInt(r.disconnects)) errors.push(`${at}: disconnects must be a whole number or empty`);
  if (!optInt(r.sync_errors)) errors.push(`${at}: sync_errors must be a whole number or empty`);
});

(tables['monthly.csv'] || []).forEach((r, i) => {
  const at = `monthly.csv line ${i + 2}`;
  if (!optDate(r.date)) errors.push(`${at}: date must be YYYY-MM-DD or empty`);
  if (!DEVICES.includes(r.device)) errors.push(`${at}: device must be ${DEVICES.join(' or ')}`);
  if (!optPct(r.battery_health_pct)) errors.push(`${at}: battery_health_pct must be 0-100 or empty`);
  if (!optPct(r.standby_drain_pct)) errors.push(`${at}: standby_drain_pct must be 0-100 or empty`);
  if (!optNum(r.cycle_count)) errors.push(`${at}: cycle_count must be a number or empty`);
  if (!optNum(r.standby_hours) || Number(r.standby_hours) > 24) errors.push(`${at}: standby_hours must be 0-24 or empty`);
});

(tables['updates.csv'] || []).forEach((r, i) => {
  const at = `updates.csv line ${i + 2}`;
  if (!optDate(r.date_installed)) errors.push(`${at}: date_installed must be YYYY-MM-DD or empty`);
  if (!DEVICES.includes(r.device)) errors.push(`${at}: device must be ${DEVICES.join(' or ')}`);
  if (!r.to_version) errors.push(`${at}: to_version required`);
});

(tables['incidents.csv'] || []).forEach((r, i) => {
  const at = `incidents.csv line ${i + 2}`;
  if (!optDateTime(r.datetime)) errors.push(`${at}: datetime must be YYYY-MM-DD[ HH:MM] or empty`);
  if (!INCIDENT_DEVICES.includes(r.device)) errors.push(`${at}: device must be one of ${INCIDENT_DEVICES.join(', ')}`);
  if (!r.feature) errors.push(`${at}: feature required`);
  if (!r.description) errors.push(`${at}: description required`);
  if (!optNum(r.minutes_lost)) errors.push(`${at}: minutes_lost must be a number or empty`);
});

check('all data rows valid', errors.length === 0, '\n      ' + errors.slice(0, 20).join('\n      '));
const counts = Object.entries(tables).map(([f, r]) => `${f}: ${r.length}`).join(', ');
console.log(`   rows -> ${counts}`);
console.log(`\n   EXPERIMENT 11 DATA AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
