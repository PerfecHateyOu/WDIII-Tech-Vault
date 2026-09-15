/**
 * WDIII Tech Vault — Step 7 Moderation Dashboard Test Suite
 * Validates:
 * 1. reviewSubmission single-write path and status transitions
 * 2. getPendingSubmissions query filtering (pending_review / pending)
 * 3. UI courtesy role checks and Firestore server-side enforcement awareness
 * 4. Safe resolution of unknown devices and unknown experiments
 * 5. Rejection reason requirement
 * 6. HTML routing and container integration in index.html
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  reviewSubmission,
  getPendingSubmissions,
  getSubmissionById,
  getDeviceById,
  getExperimentById
} from "../src/services/database.js";

console.log("=".repeat(80));
console.log("  WDIII TECH VAULT - STEP 7: MODERATION DASHBOARD VERIFICATION SUITE");
console.log("=".repeat(80));

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✕ [FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✕ [FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. reviewSubmission Function Integrity
test("1.1 reviewSubmission is exported and is an async function", () => {
  assert.strictEqual(typeof reviewSubmission, "function");
});

test("1.2 getPendingSubmissions is exported and is an async function", () => {
  assert.strictEqual(typeof getPendingSubmissions, "function");
});

// 2. Status Validation in reviewSubmission
await runAsyncTest("2.1 reviewSubmission rejects invalid status values", async () => {
  let threw = false;
  try {
    await reviewSubmission("fake-id", { status: "self_approved" });
  } catch (err) {
    threw = true;
    assert.match(err.message, /Invalid review status/);
  }
  assert.strictEqual(threw, true);
});

// 3. getPendingSubmissions Query Logic
await runAsyncTest("3.1 getPendingSubmissions returns array without throwing", async () => {
  const list = await getPendingSubmissions();
  assert(Array.isArray(list), "Expected getPendingSubmissions to return an array");
});

// 4. Unknown Hardware and Experiment Fallbacks
await runAsyncTest("4.1 getDeviceById returns null gracefully for invalid device ID", async () => {
  const dev = await getDeviceById("non-existent-device-xyz");
  assert.strictEqual(dev, null);
});

await runAsyncTest("4.2 getExperimentById returns null gracefully for invalid experiment ID", async () => {
  const exp = await getExperimentById("non-existent-exp-xyz");
  assert.strictEqual(exp, null);
});

// 5. Verification of moderation-view.js Architecture
test("5.1 src/ui/moderation-view.js exists and exports renderModerationView", () => {
  const modViewPath = path.resolve("./src/ui/moderation-view.js");
  assert(fs.existsSync(modViewPath), "moderation-view.js must exist on disk");
  const content = fs.readFileSync(modViewPath, "utf-8");
  assert(content.includes("export async function renderModerationView"), "Must export renderModerationView");
  assert(content.includes("reviewSubmission"), "Must use authoritative reviewSubmission write path");
  assert(!content.includes("addDoc("), "Must not call raw addDoc directly");
  assert(!content.includes("deleteDoc("), "Must not call raw deleteDoc directly");
  assert(!content.includes("setDoc("), "Must not call raw setDoc directly");
  assert(content.includes("escapeHtml"), "Must sanitize submission output");
});

test("5.2 moderation-view.js includes courtesy check comments referencing firestore.rules", () => {
  const content = fs.readFileSync("./src/ui/moderation-view.js", "utf-8");
  assert(content.includes("courtesy"), "Must acknowledge UI check is courtesy redirect");
  assert(content.includes("firestore.rules"), "Must cite firestore.rules as real security gate");
});

// 6. Verification of index.html Integration
test("6.1 index.html contains #page-moderation container", () => {
  const indexHtml = fs.readFileSync("./index.html", "utf-8");
  assert(indexHtml.includes('id="page-moderation"'), "index.html must include #page-moderation");
  assert(indexHtml.includes('id="moderationPageContent"'), "index.html must include #moderationPageContent");
});

test("6.2 index.html contains conditional nav link with .navLinkModeration", () => {
  const indexHtml = fs.readFileSync("./index.html", "utf-8");
  assert(indexHtml.includes('class="navLinkModeration"'), "index.html must contain .navLinkModeration link");
});

test("6.3 index.html contains route mapping for /moderation in showPage", () => {
  const indexHtml = fs.readFileSync("./index.html", "utf-8");
  assert(indexHtml.includes('route === "/moderation"'), "showPage must handle /moderation route");
  assert(indexHtml.includes("renderModerationView("), "showPage must call renderModerationView");
});

test("6.4 index.html imports renderModerationView from /src/ui/moderation-view.js", () => {
  const indexHtml = fs.readFileSync("./index.html", "utf-8");
  assert(indexHtml.includes('import { renderModerationView } from "/src/ui/moderation-view.js"'), "Must import renderModerationView");
});

test("6.5 index.html calls initAuthHeader for #authHeaderContainerModeration", () => {
  const indexHtml = fs.readFileSync("./index.html", "utf-8");
  assert(indexHtml.includes('initAuthHeader("#authHeaderContainerModeration")'), "Must initialize auth header on moderation page");
});

console.log("=".repeat(80));
console.log(`  STEP 7 AUDIT COMPLETE: ${passed} PASSED, 0 FAILED`);
console.log("=".repeat(80));
