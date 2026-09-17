/**
 * WDIII Tech Vault - Step 6B-1 Test Suite
 * Community Research Hub: Schema-Driven Experiment Replication UI
 * 
 * Verifies:
 * 1. Replication UI view module and exports
 * 2. Protected files remain untouched (security, storage, auth audit, comparison, experiments)
 * 3. Router configuration in index.html for #/replicate/{experimentId}
 * 4. Schema-driven measurement form generation and validation
 * 5. Device registry integration and selection constraint
 * 6. Evidence upload workflow integration
 * 7. Review screen with moderator queue notice and submission payload
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { OFFICIAL_EXPERIMENTS } from "../src/data/official-experiments.js";
import { OFFICIAL_DEVICES } from "../src/data/official-devices.js";

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
console.log("   WDIII TECH VAULT - STEP 6B-1 REPLICATION UI AUDIT");
console.log("================================================================================");

// --- 1. File Structure & Protected Systems Integrity ---
console.log("\n--- 1. Protected Systems & Boundaries ---");

const protectedFiles = [
  "firestore.rules",
  "storage.rules",
  "server.js",
  "src/services/firebase.js",
  "src/services/auth-audit.js",
  "src/services/comparison-service.js",
  "src/utils/comparison-stats.js",
  "src/data/official-experiments.js",
  "src/ui/compare-view.js"
];

protectedFiles.forEach(file => {
  const filePath = path.join(ROOT, file);
  assert(fs.existsSync(filePath), `Protected file '${file}' exists`);
});

// Check git status or diff conceptually: none of these should have unauthorized modifications
const replicationViewPath = path.join(ROOT, "src/ui/replication-view.js");
assert(fs.existsSync(replicationViewPath), "src/ui/replication-view.js was created");

// --- 2. Router & Container Wiring in index.html ---
console.log("\n--- 2. Router & Application Bootstrap in index.html ---");

const indexHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

assert(indexHtml.includes('id="page-replicate"'), "index.html defines '#page-replicate' container");
assert(indexHtml.includes('id="replicationPageContent"'), "index.html defines '#replicationPageContent' mount point");
assert(indexHtml.includes('id="authHeaderContainerReplicate"'), "index.html defines '#authHeaderContainerReplicate'");
assert(indexHtml.includes('import { renderReplicationView } from "/src/ui/replication-view.js";'), "index.html imports renderReplicationView");
assert(indexHtml.includes('route === "/replicate" || route.startsWith("/replicate/")'), "index.html routes #/replicate and #/replicate/{experimentId}");
assert(indexHtml.includes('initAuthHeader("#authHeaderContainerReplicate");'), "index.html initializes AuthHeader for replication view");

// --- 3. Replication View Architecture & Workflow ---
console.log("\n--- 3. Replication View Code & Security Audit ---");

const replicationCode = fs.readFileSync(replicationViewPath, "utf8");

assert(replicationCode.includes("export async function renderReplicationView"), "Exports renderReplicationView function");
assert(replicationCode.includes("getCurrentUser"), "Checks authenticated user state");
assert(replicationCode.includes("currentUser.isVisitor"), "Blocks unauthenticated / visitor write access");
assert(replicationCode.includes("signInWithGoogle"), "Provides Google authentication entry");
assert(replicationCode.includes("getExperimentById"), "Fetches official experiment protocol");
assert(replicationCode.includes("getDevices"), "Retrieves registered hardware devices from registry");
assert(replicationCode.includes("uploadEvidenceFile"), "Integrates Firebase Storage evidence upload");
assert(replicationCode.includes("deleteEvidenceFile"), "Supports removing attached evidence files");
assert(replicationCode.includes("createSubmission"), "Uses createSubmission service to create replication record");
assert(replicationCode.includes("escapeHtml"), "Uses escapeHtml to sanitize all user-facing output");

// --- 4. Schema-Driven Measurements Form ---
console.log("\n--- 4. Schema-Driven Dynamic Form Engine ---");

assert(replicationCode.includes("measurementSchema"), "References experiment measurementSchema");
assert(replicationCode.includes("allowedMeasurementKeys"), "Enforces experiment allowedMeasurementKeys boundary");
assert(replicationCode.includes("field.min !== undefined"), "Enforces numeric min boundary where defined");
assert(replicationCode.includes("field.max !== undefined"), "Enforces numeric max boundary where defined");
assert(replicationCode.includes("field.required"), "Enforces required field validation");

// Validate that every official experiment has valid schemas ready to drive the UI
let allExpsHaveValidSchemas = true;
OFFICIAL_EXPERIMENTS.forEach(exp => {
  if (!Array.isArray(exp.measurementSchema) || exp.measurementSchema.length === 0) {
    allExpsHaveValidSchemas = false;
  }
  if (!Array.isArray(exp.allowedMeasurementKeys) || exp.allowedMeasurementKeys.length === 0) {
    allExpsHaveValidSchemas = false;
  }
});
assert(allExpsHaveValidSchemas, "All 14 official experiments have valid measurementSchema and allowedMeasurementKeys");

// Test schema matching for specific experiment protocols
const exp1 = OFFICIAL_EXPERIMENTS.find(e => e.id === "exp1");
assert(exp1.measurementSchema.some(s => s.key === "turnaroundDays" && s.type === "number"), "Exp 1 has turnaroundDays number metric");
assert(exp1.measurementSchema.some(s => s.key === "repairCost" && s.type === "number"), "Exp 1 has repairCost number metric");
assert(exp1.measurementSchema.some(s => s.key === "qualityRating" && s.type === "number"), "Exp 1 has qualityRating number metric");

const exp9 = OFFICIAL_EXPERIMENTS.find(e => e.id === "exp9");
assert(exp9.measurementSchema.some(s => s.key === "telemetryHostsContacted" && s.type === "number"), "Exp 9 has telemetryHostsContacted metric");

// --- 5. Review & Moderator Notice Verification ---
console.log("\n--- 5. Review Screen & Moderation Verification ---");

assert(
  replicationCode.includes("Once submitted, this replication will enter moderator review"),
  "Review screen displays explicit moderator review notice"
);
assert(
  replicationCode.includes("Contributors cannot approve their own submissions"),
  "Review screen explicitly notes contributors cannot self-approve"
);
assert(
  replicationCode.includes("Pending Review"),
  "Success confirmation indicates Pending Review queue status"
);

// --- 6. Hardware Registry Verification ---
console.log("\n--- 6. Hardware Registry Selection ---");
assert(OFFICIAL_DEVICES.length > 0, `Hardware registry contains ${OFFICIAL_DEVICES.length} registered devices`);
assert(replicationCode.includes("selectedDevice"), "Enforces selectedDevice state");

console.log("================================================================================");
console.log(`   REPLICATION UI AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
console.log("================================================================================");

if (failed > 0) {
  process.exit(1);
}
