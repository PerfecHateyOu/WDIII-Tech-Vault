import assert from "node:assert/strict";
import { OFFICIAL_EXPERIMENTS } from "../src/data/official-experiments.js";
import {
  validateMeasurementSchema,
  validateCommunityMeasurements,
  isContributorSubmission,
  isReviewTransition
} from "../src/services/community-hub-contract.js";

const experiment = OFFICIAL_EXPERIMENTS.find(item => item.id === "exp1");
assert.ok(experiment, "exp1 fixture exists");
assert.equal(validateMeasurementSchema(experiment.measurementSchema, experiment.allowedMeasurementKeys).valid, true);

const valid = {};
for (const field of experiment.measurementSchema) {
  valid[field.key] = field.type === "number" ? (field.min ?? 1) : field.type === "boolean" ? true : "verified";
}
assert.equal(validateCommunityMeasurements(experiment, valid).valid, true);
assert.equal(validateCommunityMeasurements(experiment, { ...valid, injected: 1 }).valid, false);
assert.equal(validateCommunityMeasurements(experiment, {}).valid, false);

const malformed = { ...experiment, allowedMeasurementKeys: [...experiment.allowedMeasurementKeys, "not-in-schema"] };
assert.equal(validateMeasurementSchema(malformed.measurementSchema, malformed.allowedMeasurementKeys).valid, false);
assert.equal(isReviewTransition("pending_review", "approved"), true);
assert.equal(isReviewTransition("approved", "needs_revision"), false);

const contributorPayload = {
  authorId: "user-1", userId: "user-1", type: "replication", status: "pending_review",
  provenance: { source: "community" }, reviewerId: null, reviewedAt: null,
  review: null, reviewNotes: null
};
assert.equal(isContributorSubmission(contributorPayload, "user-1"), true);
assert.equal(isContributorSubmission({ ...contributorPayload, status: "approved" }, "user-1"), false);

console.log("Community Hub canonical contract tests passed.");
