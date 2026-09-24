import { validateCommunityMeasurements } from "./community-hub-contract.js";

const PAGE_SIZE = 25;

function requireSdk(fb, fs) {
  if (!fb || !fs || !fb.isFirebaseReady()) {
    const error = new Error("Firebase is unavailable.");
    error.code = "FIREBASE_UNAVAILABLE";
    throw error;
  }
  const db = fb.getDb();
  if (!db) {
    const error = new Error("Firestore is unavailable.");
    error.code = "FIRESTORE_UNAVAILABLE";
    throw error;
  }
  return db;
}

function mapSnapshot(snapshot) {
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
}

/**
 * Query-oriented Community Hub accessors. These avoid downloading the entire
 * submissions collection and return cursors for incremental pagination.
 */
export async function queryApprovedSubmissions({ fb, fs, field, value, cursor = null, pageSize = PAGE_SIZE }) {
  if (!field || !value) return { items: [], nextCursor: null, hasMore: false };
  const db = requireSdk(fb, fs);
  const constraints = [
    fs.where("status", "==", "approved"),
    fs.where(field, "==", value),
    fs.orderBy("createdAt", "desc"),
    fs.limit(Math.min(Math.max(pageSize, 1), 100))
  ];
  if (cursor) constraints.push(fs.startAfter(cursor));
  const snapshot = await fs.getDocs(fs.query(fs.collection(db, "submissions"), ...constraints));
  return {
    items: mapSnapshot(snapshot),
    nextCursor: snapshot.docs.at(-1) || null,
    hasMore: snapshot.docs.length === Math.min(Math.max(pageSize, 1), 100)
  };
}

export async function queryPendingSubmissions({ fb, fs, cursor = null, pageSize = PAGE_SIZE } = {}) {
  const db = requireSdk(fb, fs);
  const size = Math.min(Math.max(pageSize, 1), 100);
  const constraints = [
    fs.where("status", "==", "pending_review"),
    fs.orderBy("createdAt", "asc"),
    fs.limit(size)
  ];
  if (cursor) constraints.push(fs.startAfter(cursor));
  const snapshot = await fs.getDocs(fs.query(fs.collection(db, "submissions"), ...constraints));
  return {
    items: mapSnapshot(snapshot),
    nextCursor: snapshot.docs.at(-1) || null,
    hasMore: snapshot.docs.length === size
  };
}

export async function queryUserSubmissions({ fb, fs, userId, cursor = null, pageSize = PAGE_SIZE } = {}) {
  if (!userId) return { items: [], nextCursor: null, hasMore: false };
  const db = requireSdk(fb, fs);
  const size = Math.min(Math.max(pageSize, 1), 100);
  const constraints = [
    fs.where("authorId", "==", userId),
    fs.orderBy("createdAt", "desc"),
    fs.limit(size)
  ];
  if (cursor) constraints.push(fs.startAfter(cursor));
  const snapshot = await fs.getDocs(fs.query(fs.collection(db, "submissions"), ...constraints));
  return {
    items: mapSnapshot(snapshot),
    nextCursor: snapshot.docs.at(-1) || null,
    hasMore: snapshot.docs.length === size
  };
}

/** Validate before any trusted or client submission write. */
export function validateBeforeSubmissionWrite(experiment, payload) {
  if (!payload || payload.status !== "pending_review") {
    const error = new Error("Contributor submissions must start in pending_review.");
    error.code = "INVALID_SUBMISSION_STATUS";
    throw error;
  }
  const result = validateCommunityMeasurements(experiment, payload.measurements);
  if (!result.valid) {
    const error = new Error(`Measurement validation failed: ${result.errors.join(" ")}`);
    error.code = "INVALID_MEASUREMENTS";
    error.details = result.errors;
    throw error;
  }
  return true;
}
