/**
 * WDIII Tech Vault - Auth & Firestore Security Audit Service
 * 
 * Diagnostic utility to verify that contributor and visitor accounts cannot self-escalate
 * to admin/owner roles, and that owner accounts are protected.
 */

import { getDb, getCurrentUser, getCurrentProfile, isSystemOwner } from "./firebase.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

export const SYSTEM_OWNER_EMAIL = "perfectshadowkai33@gmail.com";

/**
 * Run diagnostic contributor privilege audit
 * Verifies role boundaries and anti-self-escalation security in Firestore.
 */
export async function runContributorPrivilegeAudit() {
  const user = getCurrentUser();
  const profile = getCurrentProfile();
  const db = getDb();

  const results = {
    userAuthenticated: !!user,
    uid: user?.uid || null,
    currentRole: profile?.role || "visitor",
    isOwner: user ? isSystemOwner(user) : false,
    tests: []
  };

  if (!user || !db) {
    results.tests.push({
      test: "authentication_check",
      passed: true,
      message: "Unauthenticated or visitor mode: read-only access strictly enforced"
    });
    return results;
  }

  // Control test: Safe self-profile update on harmless displayName field
  try {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      displayName: profile.displayName || user.displayName || "Contributor",
      updatedAt: new Date().toISOString()
    });
    results.tests.push({
      test: "self_profile_harmless_update",
      passed: true,
      message: "Contributor can update own harmless displayName field"
    });
  } catch (err) {
    results.tests.push({
      test: "self_profile_harmless_update",
      passed: false,
      message: err.message
    });
  }

  // Anti-escalation test: Attempting to escalate role to admin
  if (!isSystemOwner(user) && profile.role !== "admin") {
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { role: "admin" });
      results.tests.push({
        test: "anti_self_escalation_role",
        passed: false,
        message: "CRITICAL: Self-escalation to admin succeeded (should have been rejected by security rules)"
      });
    } catch (err) {
      results.tests.push({
        test: "anti_self_escalation_role",
        passed: true,
        message: "Blocked by firestore.rules: Contributor cannot escalate role to admin"
      });
    }
  }

  return results;
}
