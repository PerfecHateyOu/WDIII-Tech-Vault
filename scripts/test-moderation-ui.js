/**
 * WDIII Tech Vault - Moderator Review Workbench Test Suite
 *
 * Verifies:
 * 1. Moderation UI view module and exports
 * 2. Router configuration in index.html for #/moderation
 * 3. Access control gating (auth required, moderator/admin/owner role required)
 * 4. Pending queue, review actions, and audit log wiring
 * 5. Runtime audit log persistence on reviewSubmission()
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createSubmission, reviewSubmission, getAuditLogs, getPendingSubmissions } from "../src/services/database.js";

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
console.log("   WDIII TECH VAULT - MODERATOR REVIEW WORKBENCH AUDIT");
console.log("================================================================================");

// --- 1. File Structure ---
console.log("\n--- 1. Moderation View File ---");
const moderationViewPath = path.join(ROOT, "src/ui/moderation-view.js");
assert(fs.existsSync(moderationViewPath), "src/ui/moderation-view.js was created");
const moderationCode = fs.readFileSync(moderationViewPath, "utf8");

// --- 2. Router & Container Wiring in index.html ---
console.log("\n--- 2. Router & Application Bootstrap in index.html ---");
const indexHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

assert(indexHtml.includes('id="page-moderation"'), "index.html defines '#page-moderation' container");
assert(indexHtml.includes('id="moderationPageContent"'), "index.html defines '#moderationPageContent' mount point");
assert(indexHtml.includes('id="authHeaderContainerModeration"'), "index.html defines '#authHeaderContainerModeration'");
assert(indexHtml.includes('import { renderModerationView } from "/src/ui/moderation-view.js";'), "index.html imports renderModerationView");
assert(indexHtml.includes('route === "/moderation" || route.startsWith("/moderation/")'), "index.html routes #/moderation");
assert(indexHtml.includes('initAuthHeader("#authHeaderContainerModeration");'), "index.html initializes AuthHeader for moderation view");
assert(indexHtml.includes('href="#/moderation"'), "Profile page links moderators to the review workbench");

// --- 3. Access Control ---
console.log("\n--- 3. Access Control Gating ---");
assert(moderationCode.includes("export async function renderModerationView"), "Exports renderModerationView function");
assert(moderationCode.includes("getCurrentUser"), "Checks authenticated user state");
assert(moderationCode.includes("currentUser.isVisitor"), "Blocks unauthenticated / visitor access");
assert(moderationCode.includes('["moderator", "admin", "owner"].includes(profile?.role)'), "Gates access to moderator/admin/owner roles only");
assert(moderationCode.includes("renderAccessDenied"), "Renders explicit access-denied view for unauthorized roles");
assert(moderationCode.includes("signInWithGoogle"), "Provides Google authentication entry");

// --- 4. Queue, Review Actions & Audit Log Wiring ---
console.log("\n--- 4. Pending Queue & Review Actions ---");
assert(moderationCode.includes("getPendingSubmissions"), "Loads the pending-review queue");
assert(moderationCode.includes("reviewSubmission"), "Uses reviewSubmission service to record moderator decisions");
assert(moderationCode.includes('"approved"') && moderationCode.includes('"needs_revision"') && moderationCode.includes('"rejected"'), "Supports approve / reject / request-revision actions");
assert(moderationCode.includes("requiresReason"), "Requires a reason for reject / request-revision actions");
assert(moderationCode.includes("getAuditLogs"), "Retrieves the immutable audit trail for display");
assert(moderationCode.includes("escapeHtml"), "Uses escapeHtml to sanitize all user-facing output");
assert(moderationCode.includes("sanitizeUrl"), "Sanitizes evidence links before rendering");

// --- 5. Runtime Audit Log Persistence ---
console.log("\n--- 5. Runtime Audit Log Persistence ---");

const submission = await createSubmission({
  userId: "mod-test-author",
  submitterName: "Mod Test Author",
  deviceId: "apple-iphone-17-pro-max",
  experimentId: "exp1",
  measurements: { turnaroundDays: 5, repairCost: 100, qualityRating: 4 },
  conditions: { officialBaseline: "Standard", additionalConditions: "None" },
  testDate: "2026-01-01"
});
assert(submission.success === true, "Test submission created successfully");

const pending = await getPendingSubmissions();
assert(pending.some(s => s.id === submission.id), "New submission appears in the pending queue");

const reviewResult = await reviewSubmission(submission.id, {
  status: "approved",
  reviewerId: "mod-test-reviewer",
  reviewerName: "Mod Test Reviewer",
  feedback: "Looks solid."
});
assert(reviewResult.success === true, "reviewSubmission returns success: true");
assert(reviewResult.auditLog && reviewResult.auditLog.id, "reviewSubmission returns the created audit log entry");

const logsForSubmission = await getAuditLogs({ submissionId: submission.id });
assert(logsForSubmission.length === 1, "Exactly one audit log entry recorded for this submission");

const logEntry = logsForSubmission[0];
assert(logEntry.action === "review_approved", "Audit log records the correct action");
assert(logEntry.previousStatus === "pending_review", "Audit log records the correct previousStatus");
assert(logEntry.newStatus === "approved", "Audit log records the correct newStatus");
assert(logEntry.actorId === "mod-test-reviewer", "Audit log records the correct actorId");
assert(logEntry.reason === "Looks solid.", "Audit log records the moderator's reason/feedback");
assert(typeof logEntry.timestamp === "string" && logEntry.timestamp.length > 0, "Audit log entry has a timestamp");

const allSchemaFields = ["action", "actorId", "targetSubmissionId", "previousStatus", "newStatus", "reason", "timestamp"];
assert(
  allSchemaFields.every(field => Object.prototype.hasOwnProperty.call(logEntry, field)),
  "Audit log entry satisfies the mandatory firestore.rules schema (action, actorId, targetSubmissionId, previousStatus, newStatus, reason, timestamp)"
);

const recentLogs = await getAuditLogs({ limit: 10 });
assert(recentLogs.some(l => l.id === logEntry.id), "getAuditLogs() without a submissionId filter still surfaces the entry");

console.log("================================================================================");
console.log(`   MODERATOR REVIEW WORKBENCH AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
console.log("================================================================================");

if (failed > 0) {
  process.exit(1);
}
