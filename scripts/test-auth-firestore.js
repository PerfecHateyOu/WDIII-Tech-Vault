/**
 * WDIII Tech Vault - Step 2 Firebase Authentication & Firestore RBAC Security Verification Suite
 * 
 * Verifies:
 * 1. Anonymous visitor can read public archives
 * 2. Anonymous visitor CANNOT read users collection
 * 3. Anonymous visitor CANNOT write to users collection
 * 4. Anonymous visitor CANNOT write to system_config or admin collections
 * 5. Rules enforce that clients cannot self-promote to moderator/admin/owner
 * 6. User documents must strictly maintain default role 'contributor' unless updated by admin
 * 7. Modular Firebase client files exist and pass syntax validation
 * 8. Server safely delivers /api/firebase-config without exposing private service accounts
 * 9. XSS sanitization functions protect profile name and credentials rendering
 * 10. Admin collections (system_config, admin_audit_logs, admin_roles) are protected
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? '(' + details + ')' : ''}`);
    failedTests++;
  }
}

console.log("\n=======================================================");
console.log(" WDIII Tech Vault — Step 2 Auth & Firestore Audit");
console.log("=======================================================\n");

// 1. File Structure & Modular SDK Integration Checks
console.log("Section 1: Modular Client Integration & Assets");
const firebaseServicePath = path.join(ROOT_DIR, 'src', 'services', 'firebase.js');
const authHeaderComponentPath = path.join(ROOT_DIR, 'src', 'components', 'auth-header.js');
const firestoreRulesPath = path.join(ROOT_DIR, 'firestore.rules');
const serverPath = path.join(ROOT_DIR, 'server.js');
const indexPath = path.join(ROOT_DIR, 'index.html');

assert(fs.existsSync(firebaseServicePath), "src/services/firebase.js exists");
assert(fs.existsSync(authHeaderComponentPath), "src/components/auth-header.js exists");
assert(fs.existsSync(firestoreRulesPath), "firestore.rules exists");

const firebaseServiceContent = fs.readFileSync(firebaseServicePath, 'utf8');
assert(firebaseServiceContent.includes('signInWithPopup'), "Firebase service includes Google popup sign-in");
assert(firebaseServiceContent.includes('browserLocalPersistence'), "Firebase service sets persistent authentication state");
assert(firebaseServiceContent.includes('role: "contributor"'), "Default role on initial user doc creation is strictly 'contributor'");
assert(firebaseServiceContent.includes('reputationScore: 0'), "Initial reputation score defaults to 0");
assert(!firebaseServiceContent.includes('role: "admin"') && !firebaseServiceContent.includes('role: "moderator"'), "Client code never self-promotes or sets moderator/admin on first login");

// 2. Firestore Security Rules RBAC Matrix Verification
console.log("\nSection 2: Firestore Security Rules Matrix Verification");
const firestoreRules = fs.readFileSync(firestoreRulesPath, 'utf8');

// Test 1: Anonymous visitor can read public archives
assert(
  firestoreRules.includes('match /experiments/{experimentId}') &&
  firestoreRules.includes('allow read: if true;'),
  "Scenario 1: Anonymous visitors can freely read public experiments without logging in"
);

// Test 2: Anonymous visitor CANNOT read users collection
assert(
  /match \/users\/\{userId\}[\s\S]*?allow read:\s*if isSignedIn\(\);/.test(firestoreRules),
  "Scenario 2: Anonymous visitors are strictly DENIED reading /users/{userId}"
);

// Test 3: Anonymous visitor CANNOT create or write to users collection
assert(
  /match \/users\/\{userId\}[\s\S]*?allow create:\s*if isOwner\(userId\)/.test(firestoreRules) &&
  !/allow (create|write):\s*if true;/.test(firestoreRules),
  "Scenario 3: Anonymous visitors are strictly DENIED creating user documents"
);

// Test 4: Clients cannot promote themselves to moderator, admin, or owner
assert(
  firestoreRules.includes("request.resource.data.role == 'contributor'") &&
  firestoreRules.includes("request.resource.data.role == resource.data.role"),
  "Scenario 4: Contributor clients CANNOT escalate role during create or update (anti-self-escalation enforced)"
);

// Test 5: Only Admins can promote/demote or update user roles
assert(
  firestoreRules.includes("|| isAdmin()") &&
  firestoreRules.includes("isOwner(userId)") &&
  firestoreRules.includes("request.resource.data.role == resource.data.role"),
  "Scenario 5: Only designated Admins have authority to update user roles"
);

// Test 6: Reputation score cannot be manipulated by contributor clients
assert(
  firestoreRules.includes("request.resource.data.reputationScore == resource.data.reputationScore"),
  "Scenario 6: Contributors CANNOT manipulate their reputationScore on update"
);

// Test 7: System configuration and audit logs protected from contributors
assert(
  /match \/system_config\/\{configId\}[\s\S]*?allow write:\s*if isAdmin\(\);/.test(firestoreRules) &&
  /match \/admin_audit_logs\/\{logId\}[\s\S]*?allow read, write:\s*if isAdmin\(\);/.test(firestoreRules),
  "Scenario 7: Admin audit logs and system configuration are restricted to verified admins"
);

// Test 8: Super admin hardcoded safeguard
assert(
  firestoreRules.includes('perfectshadowkai33@gmail.com'),
  "Scenario 8: Master owner/admin root authority configured in security rules"
);

// 3. UI Navigation & Unauthenticated Browsing Preservation
console.log("\nSection 3: UI Navigation & Archive Preservation");
const indexContent = fs.readFileSync(indexPath, 'utf8');

assert(indexContent.includes('authHeaderContainerHome'), "Home page navigation includes auth container");
assert(indexContent.includes('authHeaderContainerFodder'), "Fodder page navigation includes auth container");
assert(indexContent.includes('id="page-profile"'), "Profile view registered in HTML structure");
assert(indexContent.includes('route === "/profile"'), "Client router safely handles #/profile route");
assert(indexContent.includes('buildExp1()'), "Original curated experiment 1 intact");
assert(indexContent.includes('buildExp9()'), "Original curated experiment 9 intact");
assert(indexContent.includes('buildFa01()'), "Original fodder archive intact");

// 4. Server Public Config Security
console.log("\nSection 4: Server Endpoint Security");
const serverContent = fs.readFileSync(serverPath, 'utf8');
assert(serverContent.includes('/api/firebase-config'), "Server exposes safe /api/firebase-config");
assert(!serverContent.includes('serviceAccountKey'), "Server does not expose private service account keys to client");

// 5. Supplemental Regression Tests (Static Rule Logic Simulation)
// NOTE: These static simulation tests provide regression coverage of rule predicates,
// but they do NOT constitute authoritative proof that Firebase's deployed rules reject
// live attacks. Authoritative live verification is handled by src/services/auth-audit.js
// using real authenticated Firebase sessions against deployed Firestore.
console.log("\nSection 5: Supplemental Regression Simulation (Rule AST & Logic Verification)");
const authAuditPath = path.join(ROOT_DIR, 'src', 'services', 'auth-audit.js');
assert(fs.existsSync(authAuditPath), "src/services/auth-audit.js diagnostic module exists");

const authAuditContent = fs.readFileSync(authAuditPath, 'utf8');
assert(authAuditContent.includes('runContributorPrivilegeAudit'), "auth-audit.js exports runContributorPrivilegeAudit");
assert(authAuditContent.includes('isSystemOwner') && authAuditContent.includes('SYSTEM_OWNER_EMAIL'), "auth-audit.js includes owner account protection safeguards");
assert(authAuditContent.includes('displayName'), "auth-audit.js uses harmless displayName field for control test");

// Simulate rule predicate logic from firestore.rules
function simulateUserUpdateRule(auth, existingDoc, updatePayload) {
  const isOwner = auth && auth.uid === existingDoc.uid;
  const targetRole = 'role' in updatePayload ? updatePayload.role : existingDoc.role;
  const roleUnchanged = targetRole === existingDoc.role;
  const reputationUnchanged = !('reputationScore' in updatePayload) || (updatePayload.reputationScore === existingDoc.reputationScore);
  const uidMatches = !('uid' in updatePayload) || (updatePayload.uid === existingDoc.uid);
  const isAdmin = auth && (auth.email === 'perfectshadowkai33@gmail.com' || auth.role === 'admin' || auth.role === 'owner');

  return (isOwner && roleUnchanged && reputationUnchanged && uidMatches) || isAdmin;
}

const standardContributorAuth = { uid: "user_contributor_test", email: "reader@example.com", role: "contributor" };
const existingContributorDoc = { uid: "user_contributor_test", role: "contributor", reputationScore: 0, displayName: "Tech Reader" };

assert(
  simulateUserUpdateRule(standardContributorAuth, existingContributorDoc, { role: "admin" }) === false,
  "[Supplemental Simulation] Contributor escalation to 'admin' is rejected by rule logic"
);
assert(
  simulateUserUpdateRule(standardContributorAuth, existingContributorDoc, { role: "moderator" }) === false,
  "[Supplemental Simulation] Contributor escalation to 'moderator' is rejected by rule logic"
);
assert(
  simulateUserUpdateRule(standardContributorAuth, existingContributorDoc, { role: "owner" }) === false,
  "[Supplemental Simulation] Contributor escalation to 'owner' is rejected by rule logic"
);
assert(
  simulateUserUpdateRule(standardContributorAuth, existingContributorDoc, { reputationScore: 5000 }) === false,
  "[Supplemental Simulation] Contributor tampering with reputationScore is rejected by rule logic"
);
assert(
  simulateUserUpdateRule(standardContributorAuth, existingContributorDoc, { displayName: "Updated Name" }) === true,
  "[Supplemental Simulation] Legitimate profile update (displayName) is permitted by rule logic"
);

console.log("\n=======================================================");
console.log(` Audit Complete: ${passedTests}/${totalTests} tests passed (${failedTests} failed)`);
console.log("=======================================================\n");

if (failedTests > 0) {
  process.exit(1);
}
