/**
 * WDIII Tech Vault - My Submissions (Contributor Portfolio) Test Suite
 *
 * Verifies:
 * 1. My Submissions view module and exports
 * 2. Router configuration in index.html for #/my-tests (previously a dead
 *    redirect to #/devices, referenced by pre-existing "View in My Tests"
 *    and "Go to My Tests" links in replication-view.js and loading-bar.js)
 * 3. Access control gating (auth required)
 * 4. Status display, moderator feedback surfacing, resubmit & withdraw actions
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failed++;
  }
}

console.log("================================================================================");
console.log("   WDIII TECH VAULT - MY SUBMISSIONS (CONTRIBUTOR PORTFOLIO) AUDIT");
console.log("================================================================================");

// --- 1. File Structure ---
console.log("\n--- 1. My Submissions View File ---");
const viewPath = path.join(ROOT, "src/ui/my-submissions-view.js");
assert(fs.existsSync(viewPath), "src/ui/my-submissions-view.js was created");
const viewCode = fs.readFileSync(viewPath, "utf8");

// --- 2. Router & Container Wiring in index.html ---
console.log("\n--- 2. Router & Application Bootstrap in index.html ---");
const indexHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

assert(indexHtml.includes('id="page-my-tests"'), "index.html defines '#page-my-tests' container");
assert(indexHtml.includes('id="myTestsPageContent"'), "index.html defines '#myTestsPageContent' mount point");
assert(indexHtml.includes('id="authHeaderContainerMyTests"'), "index.html defines '#authHeaderContainerMyTests'");
assert(indexHtml.includes('import { renderMySubmissionsView } from "/src/ui/my-submissions-view.js";'), "index.html imports renderMySubmissionsView");
assert(indexHtml.includes('route === "/my-tests" || route.startsWith("/my-tests/")'), "index.html routes #/my-tests to the real view (no longer redirects to #/devices)");
assert(!/route\.startsWith\("\/submit"\)\s*\|\|\s*route\.startsWith\("\/my-tests"\)/.test(indexHtml), "The old #/my-tests -> #/devices redirect has been removed");
assert(indexHtml.includes('initAuthHeader("#authHeaderContainerMyTests");'), "index.html initializes AuthHeader for My Submissions view");
assert(indexHtml.includes('href="#/my-tests"') , "Profile page links contributors to My Submissions");

// --- 3. Access Control ---
console.log("\n--- 3. Access Control Gating ---");
assert(viewCode.includes("export async function renderMySubmissionsView"), "Exports renderMySubmissionsView function");
assert(viewCode.includes("getCurrentUser"), "Checks authenticated user state");
assert(viewCode.includes("currentUser.isVisitor"), "Blocks unauthenticated / visitor access");
assert(viewCode.includes("signInWithGoogle"), "Provides Google authentication entry");

// --- 4. Status, Feedback & Actions ---
console.log("\n--- 4. Status Display, Feedback & Contributor Actions ---");
assert(viewCode.includes("getUserSubmissions"), "Loads the current contributor's own submissions");
assert(viewCode.includes("needs_revision"), "Surfaces the needs_revision status distinctly");
assert(viewCode.includes("review?.feedback") || viewCode.includes("reviewNotes"), "Displays the moderator's review feedback");
assert(viewCode.includes("data-resubmit-exp") && viewCode.includes("#/replicate/"), "Provides a resubmit path back to the replication wizard for the same experiment");
assert(viewCode.includes("withdrawSubmission"), "Supports withdrawing a still-pending submission");
assert(viewCode.includes("escapeHtml"), "Uses escapeHtml to sanitize all user-facing output");

console.log("================================================================================");
console.log(`   MY SUBMISSIONS AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
console.log("================================================================================");

if (failed > 0) {
  process.exit(1);
}
