import { OFFICIAL_DEVICES } from "../data/official-devices.js";
import { OFFICIAL_EXPERIMENTS } from "../data/official-experiments.js";
import { sanitizeObject, sanitizeText } from "../utils/sanitize.js";
import { validateCommunityMeasurements } from "./community-hub-contract.js";
import {
  queryApprovedSubmissions,
  queryPendingSubmissions,
  queryUserSubmissions,
  validateBeforeSubmissionWrite
} from "./community-submissions-service.js";

// Lazy-loaded Firebase SDK handles
let firebaseModule = null;
let firestoreModule = null;

async function getSdk() {
  if (!firestoreModule && typeof window !== "undefined") {
    try {
      firebaseModule = await import("./firebase.js");
      firestoreModule = await import("https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js");
    } catch (err) {
      console.warn("Could not load Firebase modules dynamically:", err);
    }
  }
  return { fb: firebaseModule, fs: firestoreModule };
}

const submissionStore = new Map();

function clone(value) {
  return typeof structuredClone === "function" ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSearchKey(value) {
  return normalizeText(value).toLowerCase();
}

function buildDeviceRegistry() {
  return OFFICIAL_DEVICES.map((device) => ({
    ...device,
    specifications: device.specifications ? { ...device.specifications } : {},
    linkedExperiments: Array.isArray(device.experimentsInvolved) ? [...new Set(device.experimentsInvolved)] : []
  }));
}

function buildExperimentRegistry() {
  return OFFICIAL_EXPERIMENTS.map((experiment) => ({
    ...experiment,
    linkedDevices: Array.isArray(experiment.devices) ? [...new Set(experiment.devices)] : []
  }));
}

const DEVICE_REGISTRY = buildDeviceRegistry();
const EXPERIMENT_REGISTRY = buildExperimentRegistry();

for (const device of DEVICE_REGISTRY) {
  const linked = EXPERIMENT_REGISTRY.filter(exp => (exp.devices || []).includes(device.id)).map(exp => exp.id);
  device.linkedExperiments = [...new Set([...device.linkedExperiments, ...linked])];
}

for (const experiment of EXPERIMENT_REGISTRY) {
  const linked = DEVICE_REGISTRY.filter(device => (device.experimentsInvolved || []).includes(experiment.id)).map(device => device.id);
  experiment.linkedDevices = [...new Set([...experiment.linkedDevices, ...linked])];
}

function matchesRegistryFilters(item, filters = {}) {
  const search = normalizeSearchKey(filters.search || "");
  const category = normalizeText(filters.category);
  const brand = normalizeText(filters.brand);
  const operatingSystem = normalizeSearchKey(filters.operatingSystem || "");
  const status = normalizeText(filters.status);

  if (search) {
    const haystack = [
      item.id,
      item.brand,
      item.model,
      item.category,
      item.operatingSystem,
      item.title,
      item.researchQuestion,
      item.methodology,
      item.verdict,
      item.search,
      Array.isArray(item.tags) ? item.tags.join(" ") : "",
      Array.isArray(item.devices) ? item.devices.join(" ") : ""
    ].filter(Boolean).join(" ").toLowerCase();
    if (!haystack.includes(search)) return false;
  }

  if (category && item.category !== category) return false;
  if (brand && item.brand !== brand) return false;
  if (operatingSystem && !(item.operatingSystem || "").toLowerCase().includes(operatingSystem)) return false;
  if (status && item.status !== status) return false;

  return true;
}

function sortRecords(items, sortBy = null, sortOrder = "asc") {
  const rows = [...items];
  if (!sortBy) return rows;
  const direction = String(sortOrder).toLowerCase() === "desc" ? -1 : 1;

  return rows.sort((a, b) => {
    const left = a?.[sortBy] ?? "";
    const right = b?.[sortBy] ?? "";

    if (typeof left === "number" && typeof right === "number") {
      return (left - right) * direction;
    }

    return String(left).localeCompare(String(right)) * direction;
  });
}

export async function getDevices(options = {}) {
  const filters = options || {};
  const items = DEVICE_REGISTRY.filter(item => matchesRegistryFilters(item, filters));
  return sortRecords(items, filters.sortBy || null, filters.sortOrder || "asc");
}

export async function getDeviceById(deviceId) {
  if (!deviceId) return null;
  const match = DEVICE_REGISTRY.find((device) => device.id === String(deviceId));
  if (!match) return null;
  return clone({
    ...match,
    linkedExperiments: [...(match.linkedExperiments || [])]
  });
}

export async function getExperiments(options = {}) {
  const filters = options || {};
  const items = EXPERIMENT_REGISTRY.filter(item => matchesRegistryFilters(item, filters));
  return sortRecords(items, filters.sortBy || null, filters.sortOrder || "asc");
}

export async function getExperimentById(experimentId) {
  if (!experimentId) return null;
  const match = EXPERIMENT_REGISTRY.find((experiment) => experiment.id === String(experimentId));
  if (!match) return null;
  return clone({
    ...match,
    linkedDevices: [...(match.linkedDevices || [])]
  });
}

export async function getApprovedSubmissionsForDevice(deviceId) {
  if (!deviceId) return [];
  return clone(
    [...submissionStore.values()]
      .filter(item => item && item.deviceId === String(deviceId) && item.status === "approved")
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
  );
}

export async function createSubmission(payload = {}) {
  if (!payload || !payload.userId || !payload.deviceId || !payload.experimentId) {
    const error = new Error("Submission payload must include userId, deviceId, and experimentId.");
    error.code = "INVALID_SUBMISSION_PAYLOAD";
    throw error;
  }

  const experiment = await getExperimentById(payload.experimentId);
  if (!experiment) {
    const error = new Error(`Experiment '${payload.experimentId}' does not exist in the official registry.`);
    error.code = "UNKNOWN_EXPERIMENT";
    throw error;
  }

  const measurements = payload.measurements && typeof payload.measurements === "object" ? { ...payload.measurements } : {};
  const evidence = Array.isArray(payload.evidenceReferences) ? payload.evidenceReferences.map((ref) => ({
    name: ref?.name || ref?.fileName || "Evidence",
    fileName: ref?.fileName || ref?.name || "",
    path: ref?.path || "",
    url: ref?.url || "",
    size: Number(ref?.size) || 0,
    type: ref?.type || "application/octet-stream",
    description: ref?.description || ""
  })) : [];

  const submissionPayload = {
    ...payload,
    type: payload.type || "replication",
    status: "pending_review",
    authorId: payload.userId,
    authorDisplayName: payload.submitterName || payload.authorDisplayName || "Contributor",
    deviceId: payload.deviceId,
    experimentId: payload.experimentId,
    measurements,
    conditions: payload.conditions || {},
    evidence,
    review: {
      reviewerId: null,
      reviewerName: null,
      notes: null,
      reviewedAt: null
    },
    provenance: {
      source: "community",
      protocolVersion: "1.0.0",
      createdFrom: "wdiii-community-submission"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: payload.notes || ""
  };

  const sanitized = sanitizeObject(submissionPayload);
  const valid = validateBeforeSubmissionWrite(experiment, sanitized);
  if (!valid) {
    const error = new Error("Submission validation failed.");
    error.code = "INVALID_SUBMISSION_WRITE";
    throw error;
  }

  const id = sanitizeText(payload.id || `sub_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);
  const submission = {
    ...sanitized,
    id,
    status: "pending_review",
    createdAt: sanitized.createdAt,
    updatedAt: sanitized.updatedAt
  };

  submissionStore.set(id, submission);

  return {
    success: true,
    id,
    submission
  };
}

export async function reviewSubmission(submissionId, options = {}) {
  const id = submissionId || options.submissionId;
  const record = submissionStore.get(String(id));

  if (!record) {
    const error = new Error(`Submission '${id}' was not found.`);
    error.code = "SUBMISSION_NOT_FOUND";
    throw error;
  }

  if (record.status === "approved") {
    const error = new Error("Immutable Record: approved submissions cannot be modified.");
    error.code = "IMMUTABLE_RECORD";
    throw error;
  }

  const nextStatus = options.status || record.status;
  const status = nextStatus;
  const allowedStatuses = ["approved", "rejected", "needs_revision", "pending_review", "pending"];
  if (nextStatus !== record.status && ["approved", "rejected", "needs_revision"].includes(status) && !options.reviewerId) {
    const error = new Error("A reviewer identity is required for moderation decisions.");
    error.code = "MODERATION_REVIEWER_REQUIRED";
    throw error;
  }
  if (!allowedStatuses.includes(nextStatus)) {
    const error = new Error(`Invalid submission status: ${nextStatus}`);
    error.code = "INVALID_STATUS";
    throw error;
  }

  const updated = {
    ...record,
    status: nextStatus,
    review: {
      reviewerId: options.reviewerId || record.review?.reviewerId || null,
      reviewerName: options.reviewerName || record.review?.reviewerName || null,
      notes: options.reviewNotes || record.review?.notes || null,
      reviewedAt: new Date().toISOString()
    },
    updatedAt: new Date().toISOString()
  };

  submissionStore.set(String(id), updated);

  return {
    success: true,
    id: String(id),
    status: updated.status,
    submission: updated
  };
}

export { getSdk, queryApprovedSubmissions, queryPendingSubmissions, queryUserSubmissions, validateBeforeSubmissionWrite };
