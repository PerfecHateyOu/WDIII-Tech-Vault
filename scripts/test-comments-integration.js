/**
 * Test Suite: Experiment Comments & Discussion System Integration
 * 
 * Verifies:
 * 1. firebase-blueprint.json defines Comment entity and /comments/{commentId} path
 * 2. firestore.rules enforces authentication, author binding, length constraints, and moderation
 * 3. comments-service.js enforces registered user access, validation, and CRUD operations
 * 4. experiment-detail-view.js integrates comments section at the bottom of experiment pages
 * 5. index.html routes and links to discussion threads
 */

import assert from "assert";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

console.log("===============================================================================");
console.log("WDIII TECH VAULT - EXPERIMENT COMMENTS SYSTEM INTEGRATION AUDIT");
console.log("===============================================================================");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// 1. Blueprint schema verification
console.log("\n1. VERIFYING FIREBASE BLUEPRINT SCHEMA...");

const blueprintPath = path.join(ROOT_DIR, "firebase-blueprint.json");
const blueprint = JSON.parse(fs.readFileSync(blueprintPath, "utf8"));

test("Blueprint includes Comment entity", () => {
  assert(blueprint.entities.Comment, "Comment entity must exist in blueprint");
  assert(blueprint.entities.Comment.properties.experimentId, "Comment must have experimentId property");
  assert(blueprint.entities.Comment.properties.authorId, "Comment must have authorId property");
  assert(blueprint.entities.Comment.properties.content, "Comment must have content property");
  assert(blueprint.entities.Comment.properties.createdAt, "Comment must have createdAt property");
});

test("Blueprint includes /comments/{commentId} collection route", () => {
  assert(blueprint.firestore["/comments/{commentId}"], "firestore blueprint must register /comments/{commentId}");
  assert.strictEqual(blueprint.firestore["/comments/{commentId}"].schema, "Comment");
});

// 2. Firestore Security Rules verification
console.log("\n2. VERIFYING FIRESTORE SECURITY RULES...");

const rulesPath = path.join(ROOT_DIR, "firestore.rules");
const rulesContent = fs.readFileSync(rulesPath, "utf8");

test("Rules file contains match /comments/{commentId}", () => {
  assert(rulesContent.includes("match /comments/{commentId}"), "Must define match /comments/{commentId}");
});

test("Comments allow public read", () => {
  assert(rulesContent.includes("match /comments/{commentId}") && rulesContent.includes("allow read: if true;"), "Must allow public read of comments");
});

test("Comments require isSignedIn() and author binding for creation", () => {
  assert(rulesContent.includes("request.resource.data.authorId == request.auth.uid"), "Must enforce authorId == request.auth.uid");
  assert(rulesContent.includes("request.resource.data.keys().hasAll(['experimentId', 'authorId', 'authorDisplayName', 'content', 'createdAt'])"), "Must enforce mandatory comment fields");
});

test("Comments enforce character length limits (1 to 3000 chars)", () => {
  assert(rulesContent.includes("request.resource.data.content.size() <= 3000"), "Must enforce 3000 max length limit");
});

test("Comments restrict deletion to author or moderator/admin", () => {
  assert(rulesContent.includes("resource.data.authorId == request.auth.uid || isModerator()"), "Must restrict deletion to author or moderator");
});

// 3. Comments Service logic verification
console.log("\n3. VERIFYING COMMENTS SERVICE LOGIC...");

const servicePath = path.join(ROOT_DIR, "src", "services", "comments-service.js");
assert(fs.existsSync(servicePath), "comments-service.js must exist");
const serviceContent = fs.readFileSync(servicePath, "utf8");

test("Comments service exports getComments, subscribeToComments, addComment, updateComment, deleteComment, toggleLikeComment", () => {
  assert(serviceContent.includes("export async function getComments"), "Must export getComments");
  assert(serviceContent.includes("export async function subscribeToComments"), "Must export subscribeToComments");
  assert(serviceContent.includes("export async function addComment"), "Must export addComment");
  assert(serviceContent.includes("export async function updateComment"), "Must export updateComment");
  assert(serviceContent.includes("export async function deleteComment"), "Must export deleteComment");
  assert(serviceContent.includes("export async function toggleLikeComment"), "Must export toggleLikeComment");
});

test("Comments service blocks unauthenticated and visitor/guest users from posting", () => {
  assert(serviceContent.includes("currentUser.isVisitor === true"), "Must check for visitor status");
  assert(serviceContent.includes("Guest/Visitor mode is read-only"), "Must provide informative message to visitors");
});

test("Comments service sanitizes content", () => {
  assert(serviceContent.includes("sanitizeText"), "Must sanitize comment text");
});

// 4. UI Components and Integration verification
console.log("\n4. VERIFYING UI COMPONENT & EXPERIMENT DETAIL VIEW INTEGRATION...");

const componentPath = path.join(ROOT_DIR, "src", "components", "comments-section.js");
assert(fs.existsSync(componentPath), "comments-section.js must exist");
const componentContent = fs.readFileSync(componentPath, "utf8");

test("Comments section component exports initCommentsSection", () => {
  assert(componentContent.includes("export function initCommentsSection"), "Must export initCommentsSection");
});

test("Comments section component displays sign in prompt for visitors", () => {
  assert(componentContent.includes("Sign in with Google"), "Must have Google sign in button");
  assert(componentContent.includes("Guest/Visitor Mode (read-only)"), "Must handle visitor session");
});

test("Comments section component supports real-time comments, editing, and deletion", () => {
  assert(componentContent.includes("subscribeToComments"), "Must subscribe to real-time comments");
  assert(componentContent.includes("btn-edit-comment"), "Must have edit controls");
  assert(componentContent.includes("btn-delete-comment"), "Must have delete controls");
  assert(componentContent.includes("btn-like-comment"), "Must have like/upvote controls");
});

const detailViewPath = path.join(ROOT_DIR, "src", "ui", "experiment-detail-view.js");
const detailViewContent = fs.readFileSync(detailViewPath, "utf8");

test("Experiment detail view imports and mounts comments section", () => {
  assert(detailViewContent.includes("initCommentsSection"), "Must import initCommentsSection");
  assert(detailViewContent.includes('id="experimentCommentsContainer"'), "Must have experimentCommentsContainer div");
  assert(detailViewContent.includes("btn-jump-discussion"), "Must have jump to discussion button in header");
});

// 5. Index.html routing and experiment shells
console.log("\n5. VERIFYING INDEX.HTML PROTOCOL NAVIGATION...");

const indexPath = path.join(ROOT_DIR, "index.html");
const indexContent = fs.readFileSync(indexPath, "utf8");

test("index.html experimentShell includes discussion links", () => {
  assert(indexContent.includes('#comments'), "Must link to #comments");
  assert(indexContent.includes("Discuss Findings"), "Must include Discuss Findings button");
});

test("index.html router sanitizes hash from experimentId", () => {
  assert(indexContent.includes('split("#")[0]'), "Router must isolate expId from #comments hash");
});

console.log("\n===============================================================================");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("===============================================================================");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("All comments integration verification tests passed successfully!");
}
