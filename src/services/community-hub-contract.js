/**
 * Canonical, runtime-safe Community Hub submission contract.
 *
 * This module is intentionally dependency-free so it can be used by browser
 * code, emulator tests, or a trusted backend. Firestore rules remain the final
 * authorization boundary; this contract is not a replacement for them.
 */

export const CONTRIBUTOR_SUBMISSION_STATUS = "pending_review";
export const REVIEW_STATUSES = new Set([
  "approved",
  "rejected",
  "needs_revision",
  "pending_review"
]);

const ALLOWED_TYPES = new Set(["number", "string", "boolean"]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function unwrapMeasurement(value) {
  if (isPlainObject(value) && Object.prototype.hasOwnProperty.call(value, "value")) {
    return value.value;
  }
  return value;
}

/**
 * Validate an experiment schema itself before accepting a submission against it.
 * Invalid or incomplete schemas fail closed rather than accepting arbitrary data.
 */
export function validateMeasurementSchema(schema, allowedKeys) {
  const errors = [];
  if (!Array.isArray(schema) || schema.length === 0) {
    errors.push("Experiment measurementSchema must be a non-empty array.");
  }
  if (!Array.isArray(allowedKeys) || allowedKeys.length === 0) {
    errors.push("Experiment allowedMeasurementKeys must be a non-empty array.");
  }
  if (errors.length) return { valid: false, errors };

  const keys = new Set();
  for (const field of schema) {
    if (!isPlainObject(field) || typeof field.key !== "string" || !field.key.trim()) {
      errors.push("Each measurement field must define a non-empty key.");
      continue;
    }
    if (keys.has(field.key)) errors.push(`Duplicate measurement key: ${field.key}.`);
    keys.add(field.key);
    if (typeof field.label !== "string" || !field.label.trim()) {
      errors.push(`Measurement '${field.key}' must define a label.`);
    }
    if (!ALLOWED_TYPES.has(field.type)) {
      errors.push(`Measurement '${field.key}' has an unsupported type.`);
    }
    if (typeof field.required !== "boolean") {
      errors.push(`Measurement '${field.key}' must define required as boolean.`);
    }
    if (field.min !== undefined && (!Number.isFinite(field.min) || field.type !== "number")) {
      errors.push(`Measurement '${field.key}' has an invalid minimum.`);
    }
    if (field.max !== undefined && (!Number.isFinite(field.max) || field.type !== "number")) {
      errors.push(`Measurement '${field.key}' has an invalid maximum.`);
    }
    if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
      errors.push(`Measurement '${field.key}' has min greater than max.`);
    }
  }

  const schemaKeys = [...keys].sort();
  const declaredKeys = [...new Set(allowedKeys)].sort();
  if (JSON.stringify(schemaKeys) !== JSON.stringify(declaredKeys)) {
    errors.push("allowedMeasurementKeys must exactly match measurementSchema keys.");
  }
  return { valid: errors.length === 0, errors };
}

/** Validate a submitted measurement map against one canonical experiment schema. */
export function validateCommunityMeasurements(experiment, measurements) {
  const schema = experiment?.measurementSchema;
  const allowedKeys = experiment?.allowedMeasurementKeys;
  const schemaCheck = validateMeasurementSchema(schema, allowedKeys);
  if (!schemaCheck.valid) return schemaCheck;
  if (!isPlainObject(measurements)) {
    return { valid: false, errors: ["Measurements must be a plain object."] };
  }

  const errors = [];
  const fields = new Map(schema.map(field => [field.key, field]));
  for (const key of Object.keys(measurements)) {
    if (!fields.has(key)) errors.push(`Unknown measurement key: ${key}.`);
  }

  for (const field of schema) {
    const raw = measurements[field.key];
    if (raw === undefined || raw === null || raw === "") {
      if (field.required) errors.push(`Missing required measurement: ${field.key}.`);
      continue;
    }
    const value = unwrapMeasurement(raw);
    if (field.type === "number" && (!Number.isFinite(value) || typeof value !== "number")) {
      errors.push(`Measurement '${field.key}' must be a finite number.`);
      continue;
    }
    if (field.type === "string" && typeof value !== "string") {
      errors.push(`Measurement '${field.key}' must be a string.`);
    }
    if (field.type === "boolean" && typeof value !== "boolean") {
      errors.push(`Measurement '${field.key}' must be a boolean.`);
    }
    if (field.type === "number" && field.min !== undefined && value < field.min) {
      errors.push(`Measurement '${field.key}' is below the minimum.`);
    }
    if (field.type === "number" && field.max !== undefined && value > field.max) {
      errors.push(`Measurement '${field.key}' exceeds the maximum.`);
    }
  }
  return { valid: errors.length === 0, errors };
}

export function isContributorSubmission(payload, uid) {
  return Boolean(payload && uid && payload.authorId === uid && payload.userId === uid &&
    payload.type === "replication" && payload.status === CONTRIBUTOR_SUBMISSION_STATUS &&
    payload.provenance?.source === "community" && payload.reviewerId === null &&
    payload.reviewedAt === null && payload.review === null && payload.reviewNotes === null);
}

export function isReviewTransition(previousStatus, nextStatus) {
  return previousStatus !== "approved" && REVIEW_STATUSES.has(nextStatus);
}
