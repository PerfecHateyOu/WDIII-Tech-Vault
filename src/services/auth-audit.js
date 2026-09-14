/**
 * WDIII Tech Vault - Live Authenticated Contributor Privilege Escalation Audit Module
 * 
 * Isolated Diagnostic Module:
 * - Authoritatively verifies that deployed Firestore Security Rules reject privilege escalation
 *   when executed by an authenticated standard contributor session.
 * - Tests specific attack vectors:
 *     1. Attempt to escalate role to "admin"
 *     2. Attempt to escalate role to "moderator"
 *     3. Attempt to escalate role to "owner"
 *     4. Attempt to manipulate reputationScore
 *     5. Compound attack (role escalation + metadata alteration)
 * - Tests control baseline:
 *     6. Legitimate self-update of harmless profile field (displayName), verified and cleanly restored.
 * - Safety guards:
 *     - Aborts immediately if unauthenticated.
 *     - Aborts immediately if the active user is the designated system owner/admin or has elevated role.
 *     - Never attempts to modify user's actual role or reputation.
 */

import { 
  initFirebase, 
  getCurrentUser, 
  getDb, 
  isSystemOwner, 
  SYSTEM_OWNER_EMAIL 
} from "./firebase.js";
import { 
  doc, 
  getDoc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

/**
 * Runs the live authenticated contributor privilege escalation audit.
 * @returns {Promise<Object>} Detailed audit report
 */
export async function runContributorPrivilegeAudit() {
  console.log("\n=======================================================");
  console.log(" 🛡️ WDIII Live Authenticated Firestore Security Audit");
  console.log("=======================================================\n");

  // 1. Ensure Firebase and Firestore are ready
  await initFirebase();
  const db = getDb();
  if (!db) {
    const errorMsg = "Firestore client is not initialized.";
    console.error("❌ " + errorMsg);
    return { status: "FAILED", reason: "FIRESTORE_NOT_INITIALIZED", message: errorMsg };
  }

  // 2. Check current authentication state
  const currentUser = getCurrentUser();
  if (!currentUser) {
    const msg = "Live audit requires an authenticated session. Please sign in as a standard contributor.";
    console.warn("⚠️ [ABORTED] " + msg);
    return { status: "ABORTED", reason: "UNAUTHENTICATED", message: msg };
  }

  // 3. Root Owner & Elevated Role Safeguards
  // The live audit MUST abort if current account is the designated owner/admin
  if (isSystemOwner(currentUser) || 
      (currentUser.email && currentUser.email.trim().toLowerCase() === SYSTEM_OWNER_EMAIL.toLowerCase())) {
    const msg = `Safety Abort: Active account (${currentUser.email}) is the designated system owner. The privilege escalation audit must be conducted with a standard contributor account to verify anti-escalation enforcement without risk of privilege disturbance.`;
    console.warn("⚠️ [SAFETY ABORT] " + msg);
    return { status: "ABORTED", reason: "OWNER_ACCOUNT_PROTECTED", message: msg, userEmail: currentUser.email };
  }

  const userDocRef = doc(db, "users", currentUser.uid);
  let initialSnap;
  try {
    initialSnap = await getDoc(userDocRef);
  } catch (readErr) {
    const msg = `Unable to fetch current user profile document: ${readErr.message}`;
    console.error("❌ " + msg);
    return { status: "ERROR", reason: "READ_FAILED", message: msg };
  }

  if (!initialSnap.exists()) {
    const msg = `User profile document 'users/${currentUser.uid}' does not exist in Firestore.`;
    console.warn("⚠️ [ABORTED] " + msg);
    return { status: "ABORTED", reason: "NO_USER_DOCUMENT", message: msg };
  }

  const initialData = initialSnap.data();

  // Additional safeguard: abort if profile has elevated role
  if (initialData.role === "admin" || initialData.role === "owner" || initialData.role === "moderator") {
    const msg = `Safety Abort: Active profile has elevated role '${initialData.role}'. The audit must only be executed by a standard contributor.`;
    console.warn("⚠️ [SAFETY ABORT] " + msg);
    return { status: "ABORTED", reason: "ELEVATED_ROLE", message: msg, role: initialData.role };
  }

  console.log(`Auditing with authenticated contributor: UID=${currentUser.uid}, Role=${initialData.role}, ReputationScore=${initialData.reputationScore}`);

  const results = {
    timestamp: new Date().toISOString(),
    uid: currentUser.uid,
    initialRole: initialData.role,
    initialReputation: initialData.reputationScore,
    attacks: [],
    control: null,
    verdict: "PENDING"
  };

  // Helper to execute and record an attack vector
  async function testAttackVector(vectorName, maliciousPayload) {
    console.log(`Testing Attack Vector: ${vectorName}...`);
    try {
      await updateDoc(userDocRef, maliciousPayload);
      // If execution reached here, write was NOT rejected by rules!
      console.error(`  ❌ VULNERABILITY: Attack succeeded! Deployed rules permitted ${JSON.stringify(maliciousPayload)}`);
      results.attacks.push({
        vector: vectorName,
        payload: maliciousPayload,
        rejected: false,
        status: "VULNERABLE",
        detail: "Firestore allowed the write without error."
      });
    } catch (err) {
      const code = err?.code || "";
      const isExpected = code.includes("permission-denied") || code.includes("PERMISSION_DENIED");
      if (isExpected) {
        console.log(`  ✅ PROTECTED: Rejected by deployed rules as expected (Code: ${code})`);
        results.attacks.push({
          vector: vectorName,
          payload: maliciousPayload,
          rejected: true,
          status: "PROTECTED",
          code,
          detail: err.message
        });
      } else {
        console.warn(`  ⚠️ UNEXPECTED ERROR: ${code} - ${err.message}`);
        results.attacks.push({
          vector: vectorName,
          payload: maliciousPayload,
          rejected: true,
          status: "UNEXPECTED_ERROR",
          code,
          detail: err.message
        });
      }
    }
  }

  // --- ATTACK VECTOR 1: Escalate role to 'admin' ---
  await testAttackVector("Self-Escalation to 'admin'", { role: "admin" });

  // --- ATTACK VECTOR 2: Escalate role to 'moderator' ---
  await testAttackVector("Self-Escalation to 'moderator'", { role: "moderator" });

  // --- ATTACK VECTOR 3: Escalate role to 'owner' ---
  await testAttackVector("Self-Escalation to 'owner'", { role: "owner" });

  // --- ATTACK VECTOR 4: Manipulate reputationScore ---
  const illegalScore = (initialData.reputationScore || 0) + 5000;
  await testAttackVector("Reputation Score Tampering", { reputationScore: illegalScore });

  // --- ATTACK VECTOR 5: Compound attack (role='admin' + altered displayName) ---
  await testAttackVector("Compound Attack (role='admin' + displayName)", {
    role: "admin",
    displayName: `${initialData.displayName || "Contributor"} [Hacked]`
  });

  // --- LEGITIMATE CONTROL TEST: Harmless profile field update & restore ---
  console.log("\nTesting Legitimate Control: Updating harmless displayName and restoring...");
  const originalDisplayName = initialData.displayName || currentUser.displayName || "Contributor";
  const controlProbeName = `${originalDisplayName} [probe-${Date.now()}]`;

  try {
    // Legitimate update
    await updateDoc(userDocRef, { displayName: controlProbeName });
    console.log("  ✅ Legitimate displayName update succeeded.");

    // Restore immediately to original value
    await updateDoc(userDocRef, { displayName: originalDisplayName });
    console.log("  ✅ Profile field restored to original value.");

    results.control = {
      field: "displayName",
      originalValue: originalDisplayName,
      testValue: controlProbeName,
      restored: true,
      status: "SUCCESS"
    };
  } catch (controlErr) {
    console.error("  ❌ Legitimate control update failed:", controlErr);
    results.control = {
      field: "displayName",
      originalValue: originalDisplayName,
      restored: false,
      status: "FAILED",
      code: controlErr?.code,
      error: controlErr?.message
    };
  }

  // --- FINAL INTEGRITY CHECK ---
  try {
    const finalSnap = await getDoc(userDocRef);
    const finalData = finalSnap.data();
    const roleIntact = finalData.role === initialData.role;
    const repIntact = finalData.reputationScore === initialData.reputationScore;
    const nameIntact = finalData.displayName === originalDisplayName;

    const allAttacksBlocked = results.attacks.every(a => a.rejected && a.status === "PROTECTED");
    const controlPassed = results.control && results.control.status === "SUCCESS";

    if (allAttacksBlocked && controlPassed && roleIntact && repIntact && nameIntact) {
      results.verdict = "PASSED_FULLY_SECURED";
      console.log("\n🎉 FINAL LIVE AUDIT VERDICT: PASSED (All privilege escalation vectors rejected by deployed rules)");
    } else {
      results.verdict = "FAILED_DEFICIENCIES_DETECTED";
      console.error("\n🚨 FINAL LIVE AUDIT VERDICT: FAILED (Vulnerabilities or anomalies detected)");
    }

    results.integrityCheck = { roleIntact, repIntact, nameIntact };
  } catch (postErr) {
    console.error("Could not run post-audit integrity check:", postErr);
  }

  console.log("=======================================================\n");
  return results;
}

// Attach to window for immediate browser console execution
if (typeof window !== "undefined") {
  window.__runAuthAudit = runContributorPrivilegeAudit;
}
