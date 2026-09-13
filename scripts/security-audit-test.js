/**
 * WDIII Tech Vault - Comprehensive Step 1 Security Audit Test Runner
 */
import http from 'http';
import fs from 'fs';

function testUrl(path) {
  return new Promise((resolve) => {
    http.get({
      host: 'localhost',
      port: 3000,
      path: path,
      timeout: 3000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, contentType: res.headers['content-type'], bodyLength: body.length });
      });
    }).on('error', (err) => {
      resolve({ status: 500, error: err.message });
    });
  });
}

let totalPassed = 0;
let totalFailed = 0;

function check(testName, expectedStatus, actualStatus, extraCondition = true) {
  const isOk = (actualStatus === expectedStatus) && extraCondition;
  if (isOk) {
    totalPassed++;
    console.log(`  ✓ [PASS] ${testName} -> HTTP ${actualStatus}`);
  } else {
    totalFailed++;
    console.error(`  ✗ [FAIL] ${testName} -> Expected ${expectedStatus}, Got ${actualStatus}`);
  }
}

async function runAudit() {
  console.log('\n======================================================');
  console.log('   WDIII TECH VAULT - STEP 1 SECURITY AUDIT TEST SUITE');
  console.log('======================================================\n');

  console.log('--- 1. Public Access to Legitimate Core Routes ---');
  let res = await testUrl('/');
  check('GET / (Homepage)', 200, res.status);

  res = await testUrl('/index.html');
  check('GET /index.html (SPA Entry)', 200, res.status);

  res = await testUrl('/consumer-tech-documentation');
  check('GET /consumer-tech-documentation (Legacy Alias)', 200, res.status);

  console.log('\n--- 2. Public Access to Legitimate Static Assets ---');
  res = await testUrl('/logo.svg');
  check('GET /logo.svg', 200, res.status);

  res = await testUrl('/favicon.ico');
  check('GET /favicon.ico', 200, res.status);

  res = await testUrl('/manifest.json');
  check('GET /manifest.json', 200, res.status);

  res = await testUrl('/icon-192.png');
  check('GET /icon-192.png', 200, res.status);

  res = await testUrl('/download/logo.svg');
  check('GET /download/logo.svg', 200, res.status);

  res = await testUrl('/download/logo.jpg');
  check('GET /download/logo.jpg', 200, res.status);

  res = await testUrl('/src/assets/images/wdiii_logo_1789060991252.jpg');
  check('GET /src/assets/images/wdiii_logo_1789060991252.jpg', 200, res.status);

  res = await testUrl('/src/utils/sanitize.js');
  check('GET /src/utils/sanitize.js (Approved JS Module)', 200, res.status);

  res = await testUrl('/api/firebase-config');
  check('GET /api/firebase-config (Sanitized Public Config)', 200, res.status);

  console.log('\n--- 3. Block Direct Access to Sensitive Server/Development Files ---');
  res = await testUrl('/server.js');
  check('GET /server.js (Blocked)', 404, res.status);

  res = await testUrl('/package.json');
  check('GET /package.json (Blocked)', 404, res.status);

  res = await testUrl('/bun.lock');
  check('GET /bun.lock (Blocked)', 404, res.status);

  res = await testUrl('/bun.lock.json');
  check('GET /bun.lock.json (Blocked)', 404, res.status);

  res = await testUrl('/.env.example');
  check('GET /.env.example (Blocked)', 404, res.status);

  res = await testUrl('/.env');
  check('GET /.env (Blocked)', 404, res.status);

  res = await testUrl('/firebase-applet-config.json');
  check('GET /firebase-applet-config.json (Direct file blocked)', 404, res.status);

  res = await testUrl('/firebase-config.json');
  check('GET /firebase-config.json (Blocked)', 404, res.status);

  res = await testUrl('/metadata.json');
  check('GET /metadata.json (Blocked)', 404, res.status);

  res = await testUrl('/firestore.rules');
  check('GET /firestore.rules (Blocked)', 404, res.status);

  res = await testUrl('/storage.rules');
  check('GET /storage.rules (Blocked)', 404, res.status);

  res = await testUrl('/README.md');
  check('GET /README.md (Blocked)', 404, res.status);

  res = await testUrl('/LICENSE');
  check('GET /LICENSE (Blocked)', 404, res.status);

  console.log('\n--- 4. Block Direct Access to Source Backups & Old HTML Files ---');
  res = await testUrl('/Consumer_Tech_Documentation.html');
  check('GET /Consumer_Tech_Documentation.html (Old source backup blocked)', 404, res.status);

  res = await testUrl('/bases_tech_archive.htm');
  check('GET /bases_tech_archive.htm (Old archive blocked)', 404, res.status);

  res = await testUrl('/Fodder%20Archive%20V2.htm');
  check('GET /Fodder Archive V2.htm (Old backup blocked)', 404, res.status);

  res = await testUrl('/fodder-archive.html');
  check('GET /fodder-archive.html (Old backup blocked)', 404, res.status);

  res = await testUrl('/fodder-archive_1.html');
  check('GET /fodder-archive_1.html (Old backup blocked)', 404, res.status);

  res = await testUrl('/fodder-archive_2.html');
  check('GET /fodder-archive_2.html (Old backup blocked)', 404, res.status);

  res = await testUrl('/fa01-entries/FA01_Claude.html');
  check('GET /fa01-entries/FA01_Claude.html (Subfolder html blocked)', 404, res.status);

  console.log('\n--- 5. Block Path Traversal & Injection Attempts ---');
  res = await testUrl('/src/../package.json');
  check('GET /src/../package.json (Traversal blocked)', 404, res.status);

  res = await testUrl('/..%2Fpackage.json');
  check('GET /..%2Fpackage.json (Encoded traversal blocked)', 404, res.status);

  res = await testUrl('/src/utils/sanitize.test.js');
  check('GET /src/utils/sanitize.test.js', 200, res.status); // Safe test file in /src

  res = await testUrl('/src/unknown.secret');
  check('GET /src/unknown.secret (Unapproved extension blocked)', 404, res.status);

  console.log('\n--- 6. Verify Rules Files Exist on Disk & Syntactically Intact ---');
  const firestoreRulesExist = fs.existsSync('firestore.rules');
  check('firestore.rules file exists on disk', true, firestoreRulesExist);

  const storageRulesExist = fs.existsSync('storage.rules');
  check('storage.rules file exists on disk', true, storageRulesExist);

  const firestoreContent = fs.readFileSync('firestore.rules', 'utf8');
  check('firestore.rules contains default-deny rule', true, firestoreContent.includes('allow read, write: if false;'));
  check('firestore.rules forbids self-role escalation', true, firestoreContent.includes("request.resource.data.role == 'contributor'"));
  check('firestore.rules blocks self-approval of submissions', true, firestoreContent.includes("request.resource.data.status == 'pending'"));

  const storageContent = fs.readFileSync('storage.rules', 'utf8');
  check('storage.rules contains default-deny rule', true, storageContent.includes('allow read, write: if false;'));
  check('storage.rules isolates uploads by UID', true, storageContent.includes('match /evidence/{userId}/{fileName}'));
  check('storage.rules restricts upload size & types', true, storageContent.includes('request.resource.size <= 10 * 1024 * 1024'));

  console.log(`\nAudit Results: ${totalPassed} Passed, ${totalFailed} Failed\n`);
  if (totalFailed > 0) {
    process.exit(1);
  }
}

runAudit();
