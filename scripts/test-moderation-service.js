import assert from "node:assert/strict";
import fs from "node:fs";
import { validateModerationDecision } from "../src/services/moderation-service.js";

const storage = fs.readFileSync("storage.rules", "utf8");
assert.match(storage, /match \/evidence\/\{userId\}\/\{fileName\}/);
assert.match(storage, /allow create: if owner\(userId\)/);
assert.match(storage, /allow update: if false/);
assert.match(storage, /request\.resource\.size <= 10 \* 1024 \* 1024/);
assert.throws(() => validateModerationDecision({ status: "rejected" }), /reason is required/i);
assert.deepEqual(validateModerationDecision({ status: "approved" }), {
  status: "approved",
  reason: ""
});
assert.deepEqual(validateModerationDecision({ status: "needs_revision", reason: "Add evidence" }), {
  status: "needs_revision",
  reason: "Add evidence"
});
console.log("Moderation and evidence policy checks passed.");
