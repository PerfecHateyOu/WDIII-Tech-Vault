/**
 * WDIII Tech Vault - Database & Repository Service
 * 
 * Provides unified access to Devices and Experiments with:
 * - High-speed in-memory cache to prevent redundant Firestore queries
 * - Resilient fallback to verified Official WDIII data if offline/unauthenticated
 * - Advanced filtering, searching, and sorting
 * - Cross-referencing between devices and experiments
 * - Administrative batch synchronization to Firestore
 */

import { OFFICIAL_DEVICES } from "../data/official-devices.js";
import { OFFICIAL_EXPERIMENTS } from "../data/official-experiments.js";
import { sanitizeObject, sanitizeText } from "../utils/sanitize.js";

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

// In-memory cache structures with immediate pre-seeding for instantaneous loading
let devicesCache = Array.isArray(OFFICIAL_DEVICES) ? [...OFFICIAL_DEVICES] : null;
let experimentsCache = Array.isArray(OFFICIAL_EXPERIMENTS) ? [...OFFICIAL_EXPERIMENTS] : null;
let deviceDetailCache = new Map();
let experimentDetailCache = new Map();

// Trigger non-blocking background synchronization if Firestore is ready
if (typeof window !== "undefined") {
  setTimeout(async () => {
    try {
      const { fb, fs } = await getSdk();
      if (fb && fs && fb.isFirebaseReady()) {
        const db = fb.getDb();
        if (db) {
          const [devSnap, expSnap] = await Promise.all([
            fs.getDocs(fs.collection(db, "devices")).catch(() => null),
            fs.getDocs(fs.collection(db, "experiments")).catch(() => null)
          ]);
          if (devSnap && !devSnap.empty) {
            devicesCache = devSnap.docs.map(d => d.data());
          }
          if (expSnap && !expSnap.empty) {
            experimentsCache = expSnap.docs.map(d => d.data());
          }
        }
      }
    } catch (e) {
      // Non-critical background cache sync notice
    }
  }, 100);
}

/**
 * Initialize and load devices with caching
 */
export async function getDevices(options = {}) {
  const { search = "", category = "all", operatingSystem = "all", sortBy = "releaseYear", sortOrder = "desc" } = options;

  let allDevices = [];

  // Try fetching from cache first
  if (devicesCache && devicesCache.length > 0) {
    allDevices = [...devicesCache];
  } else {
    // Try fetching from Firestore if ready
    let fetchedFromFirestore = false;
    const { fb, fs } = await getSdk();
    if (fb && fs && fb.isFirebaseReady()) {
      try {
        const db = fb.getDb();
        if (db) {
          const snapshot = await fs.getDocs(fs.collection(db, "devices"));
          if (!snapshot.empty) {
            allDevices = snapshot.docs.map(doc => doc.data());
            fetchedFromFirestore = true;
          }
        }
      } catch (err) {
        console.warn("Firestore devices fetch failed, falling back to authoritative local vault:", err);
      }
    }

    // Fallback to embedded official vault
    if (!fetchedFromFirestore || allDevices.length === 0) {
      allDevices = [...OFFICIAL_DEVICES];
    }

    devicesCache = allDevices;
  }

  // Apply filters
  let filtered = allDevices.filter(device => {
    // Search query
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchBrand = (device.brand || "").toLowerCase().includes(q);
      const matchModel = (device.model || "").toLowerCase().includes(q);
      const matchOS = (device.operatingSystem || "").toLowerCase().includes(q);
      const matchCategory = (device.category || "").toLowerCase().includes(q);
      if (!matchBrand && !matchModel && !matchOS && !matchCategory) {
        return false;
      }
    }

    // Category filter
    if (category !== "all") {
      if ((device.category || "").toLowerCase() !== category.toLowerCase()) {
        return false;
      }
    }

    // Operating system filter
    if (operatingSystem !== "all") {
      const os = (device.operatingSystem || "").toLowerCase();
      if (operatingSystem === "ios" && !os.includes("ios")) return false;
      if (operatingSystem === "android" && !os.includes("android") && !os.includes("one ui") && !os.includes("emui") && !os.includes("coloros") && !os.includes("oxygenos") && !os.includes("funtouch") && !os.includes("miui")) return false;
      if (operatingSystem === "macos" && !os.includes("macos")) return false;
      if (operatingSystem === "windows" && !os.includes("windows")) return false;
    }

    return true;
  });

  // Apply sorting
  filtered.sort((a, b) => {
    let valA, valB;
    if (sortBy === "releaseYear") {
      valA = a.releaseYear || 0;
      valB = b.releaseYear || 0;
    } else if (sortBy === "brand") {
      valA = (a.brand || "").toLowerCase();
      valB = (b.brand || "").toLowerCase();
    } else if (sortBy === "model") {
      valA = (a.model || "").toLowerCase();
      valB = (b.model || "").toLowerCase();
    } else if (sortBy === "experimentsCount") {
      valA = (a.experimentsInvolved || []).length;
      valB = (b.experimentsInvolved || []).length;
    } else {
      valA = a.id;
      valB = b.id;
    }

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return filtered;
}

/**
 * Retrieve single device by ID with linked experiment protocols
 */
export async function getDeviceById(deviceId) {
  if (!deviceId) return null;

  if (deviceDetailCache.has(deviceId)) {
    return deviceDetailCache.get(deviceId);
  }

  let device = null;

  // Check in-memory devices first
  if (devicesCache) {
    device = devicesCache.find(d => d.id === deviceId);
  }

  // If not found in cache, check Firestore
  const { fb, fs } = await getSdk();
  if (!device && fb && fs && fb.isFirebaseReady()) {
    try {
      const db = fb.getDb();
      if (db) {
        const docSnap = await fs.getDoc(fs.doc(db, "devices", deviceId));
        if (docSnap.exists()) {
          device = docSnap.data();
        }
      }
    } catch (err) {
      console.warn(`Firestore getDeviceById(${deviceId}) error:`, err);
    }
  }

  // Fallback to official dataset
  if (!device) {
    device = OFFICIAL_DEVICES.find(d => d.id === deviceId) || null;
  }

  if (!device) return null;

  // Resolve linked experiments
  const allExperiments = await getExperiments();
  const linkedExperiments = allExperiments.filter(exp => {
    if (Array.isArray(exp.devices) && exp.devices.includes(deviceId)) return true;
    if (Array.isArray(device.experimentsInvolved) && device.experimentsInvolved.includes(exp.id)) return true;
    return false;
  });

  const enrichedDevice = {
    ...device,
    linkedExperiments
  };

  deviceDetailCache.set(deviceId, enrichedDevice);
  return enrichedDevice;
}

/**
 * Retrieve experiments list with filters
 */
export async function getExperiments(options = {}) {
  const { category = "all", status = "all", search = "" } = options;

  let allExperiments = [];

  if (experimentsCache && experimentsCache.length > 0) {
    allExperiments = [...experimentsCache];
  } else {
    let fetchedFromFirestore = false;
    const { fb, fs } = await getSdk();
    if (fb && fs && fb.isFirebaseReady()) {
      try {
        const db = fb.getDb();
        if (db) {
          const snapshot = await fs.getDocs(fs.collection(db, "experiments"));
          if (!snapshot.empty) {
            allExperiments = snapshot.docs.map(doc => doc.data());
            fetchedFromFirestore = true;
          }
        }
      } catch (err) {
        console.warn("Firestore experiments fetch failed, falling back to authoritative local vault:", err);
      }
    }

    if (!fetchedFromFirestore || allExperiments.length === 0) {
      allExperiments = [...OFFICIAL_EXPERIMENTS];
    }

    experimentsCache = allExperiments;
  }

  // Apply filters
  let filtered = allExperiments.filter(exp => {
    if (category !== "all" && (exp.category || "").toLowerCase() !== category.toLowerCase()) {
      return false;
    }
    if (status !== "all" && (exp.status || "").toLowerCase() !== status.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchTitle = (exp.title || "").toLowerCase().includes(q);
      const matchSearch = (exp.search || "").toLowerCase().includes(q);
      const matchNum = String(exp.experimentNumber || "").toLowerCase().includes(q);
      if (!matchTitle && !matchSearch && !matchNum) return false;
    }
    return true;
  });

  return filtered;
}

/**
 * Retrieve single experiment by ID with resolved device records
 */
export async function getExperimentById(experimentId) {
  if (!experimentId) return null;

  if (experimentDetailCache.has(experimentId)) {
    return experimentDetailCache.get(experimentId);
  }

  let experiment = null;

  if (experimentsCache) {
    experiment = experimentsCache.find(e => e.id === experimentId);
  }

  const { fb, fs } = await getSdk();
  if (!experiment && fb && fs && fb.isFirebaseReady()) {
    try {
      const db = fb.getDb();
      if (db) {
        const docSnap = await fs.getDoc(fs.doc(db, "experiments", experimentId));
        if (docSnap.exists()) {
          experiment = docSnap.data();
        }
      }
    } catch (err) {
      console.warn(`Firestore getExperimentById(${experimentId}) error:`, err);
    }
  }

  if (!experiment) {
    experiment = OFFICIAL_EXPERIMENTS.find(e => e.id === experimentId) || null;
  }

  if (!experiment) return null;

  // Resolve linked devices
  const allDevices = await getDevices();
  const linkedDevices = (experiment.devices || []).map(devId => {
    return allDevices.find(d => d.id === devId) || { id: devId, model: devId, brand: "Unknown" };
  });

  const enrichedExperiment = {
    ...experiment,
    linkedDevices
  };

  experimentDetailCache.set(experimentId, enrichedExperiment);
  return enrichedExperiment;
}

/**
 * Synchronize authoritative WDIII Official Vault to Firestore
 * Safe, idempotent administrative utility
 */
export async function syncVaultToFirestore() {
  const { fb, fs } = await getSdk();
  if (!fb || !fs || !fb.isFirebaseReady()) {
    throw new Error("Firebase is not initialized or connected.");
  }
  const db = fb.getDb();
  if (!db) throw new Error("Firestore instance unavailable.");

  let devicesSynced = 0;
  let experimentsSynced = 0;

  for (const device of OFFICIAL_DEVICES) {
    await fs.setDoc(fs.doc(db, "devices", device.id), device, { merge: true });
    devicesSynced++;
  }

  for (const experiment of OFFICIAL_EXPERIMENTS) {
    await fs.setDoc(fs.doc(db, "experiments", experiment.id), experiment, { merge: true });
    experimentsSynced++;
  }

  // Invalidate in-memory caches to ensure fresh data
  devicesCache = null;
  experimentsCache = null;
  deviceDetailCache.clear();
  experimentDetailCache.clear();

  return { devicesSynced, experimentsSynced };
}

// ==========================================
// Community Research Hub Submission Services
// ==========================================

const inMemorySubmissions = new Map();

function createSubmissionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `sub_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function getAuthenticatedProfile(fb, payload = {}) {
  const user = fb?.getCurrentUser?.();
  const profile = fb?.getCurrentProfile?.();

  if (user && (user.isVisitor || profile?.role === "visitor")) {
    throw new Error("You must be signed in with a contributor account to submit a replication.");
  }

  if (user) {
    return {
      user: {
        uid: user.uid,
        displayName: profile?.displayName || user.displayName || payload.submitterName || "Contributor",
        email: user.email || payload.submitterEmail || ""
      },
      profile: profile || {}
    };
  }

  // Fallback for Node.js test suites or offline environments
  if (payload.userId || payload.authorId) {
    const uid = payload.userId || payload.authorId;
    return {
      user: {
        uid,
        displayName: payload.submitterName || payload.authorDisplayName || "Contributor",
        email: payload.submitterEmail || ""
      },
      profile: {
        role: "contributor",
        displayName: payload.submitterName || payload.authorDisplayName || "Contributor"
      }
    };
  }

  throw new Error("You must be signed in with a contributor account to submit a replication.");
}

function normalizeEvidenceItem(item = {}) {
  return {
    name: sanitizeText(String(item.name || item.fileName || "Evidence")).slice(0, 200),
    fileName: sanitizeText(String(item.fileName || item.name || "")).slice(0, 200),
    path: sanitizeText(String(item.path || "")).slice(0, 500),
    url: String(item.url || "").slice(0, 2000),
    size: Number(item.size) || 0,
    type: sanitizeText(String(item.type || "application/octet-stream")).slice(0, 120),
    uploadedAt: item.uploadedAt || new Date().toISOString()
  };
}

export function validateMeasurementsAgainstExperiment(experiment, measurements) {
  const errors = [];

  if (!measurements || typeof measurements !== "object" || Array.isArray(measurements)) {
    return { valid: false, errors: ["Measurements payload must be an object."] };
  }

  const schema = Array.isArray(experiment?.measurementSchema)
    ? experiment.measurementSchema
    : [];
  const allowedKeys = Array.isArray(experiment?.allowedMeasurementKeys)
    ? experiment.allowedMeasurementKeys
    : [];

  if (schema.length === 0 || allowedKeys.length === 0) {
    return {
      valid: false,
      errors: ["This experiment does not expose a complete measurement schema."]
    };
  }

  const schemaMap = new Map(schema.map(field => [field.key, field]));

  for (const key of Object.keys(measurements)) {
    if (!allowedKeys.includes(key) || !schemaMap.has(key)) {
      errors.push(`Measurement field '${key}' is not allowed by this experiment.`);
    }
  }

  for (const field of schema) {
    const rawItem = measurements[field.key];

    if (rawItem === undefined || rawItem === null || rawItem === "") {
      if (field.required) {
        errors.push(`Missing required measurement: ${field.key}.`);
      }
      continue;
    }

    const value = (
      typeof rawItem === "object" &&
      rawItem !== null &&
      Object.prototype.hasOwnProperty.call(rawItem, "value")
    ) ? rawItem.value : rawItem;

    if (field.type === "number") {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        errors.push(`Measurement '${field.key}' must be a finite number.`);
        continue;
      }
      if (field.min !== undefined && numeric < Number(field.min)) {
        errors.push(`Measurement '${field.key}' is below the allowed minimum.`);
      }
      if (field.max !== undefined && numeric > Number(field.max)) {
        errors.push(`Measurement '${field.key}' exceeds the allowed maximum.`);
      }
    } else if (field.type === "boolean") {
      if (typeof value !== "boolean") {
        errors.push(`Measurement '${field.key}' must be boolean.`);
      }
    } else if (field.type === "string") {
      if (typeof value !== "string") {
        errors.push(`Measurement '${field.key}' must be a string.`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Retrieve approved community submissions for an experiment protocol.
 */
export async function getApprovedSubmissionsForExperiment(experimentId) {
  if (!experimentId) return [];

  const inMemory = Array.from(inMemorySubmissions.values()).filter(
    s => s.status === "approved" && s.experimentId === experimentId
  );

  const { fb, fs } = await getSdk();
  if (!fb || !fs || !fb.isFirebaseReady()) return inMemory;

  try {
    const db = fb.getDb();
    if (!db) return inMemory;

    const snapshot = await fs.getDocs(fs.collection(db, "submissions"));
    const remote = snapshot.docs
      .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
      .filter(submission =>
        submission.status === "approved" &&
        submission.experimentId === experimentId
      );

    const merged = new Map();
    for (const item of inMemory) merged.set(item.id, item);
    for (const item of remote) merged.set(item.id, item);
    return Array.from(merged.values());
  } catch (err) {
    console.warn("Could not retrieve approved community submissions:", err);
    return inMemory;
  }
}

/**
 * Retrieve approved community submissions for a device.
 */
export async function getApprovedSubmissionsForDevice(deviceId, experimentIds = null) {
  if (!deviceId) return [];

  const allowedExperimentIds = Array.isArray(experimentIds)
    ? new Set(experimentIds.filter(Boolean))
    : null;
  const matchesScope = (submission) => (
    submission.status === "approved" &&
    submission.deviceId === deviceId &&
    (!allowedExperimentIds || allowedExperimentIds.has(submission.experimentId))
  );

  const inMemory = Array.from(inMemorySubmissions.values()).filter(matchesScope);

  const { fb, fs } = await getSdk();
  if (!fb || !fs || !fb.isFirebaseReady()) return inMemory;

  try {
    const db = fb.getDb();
    if (!db) return inMemory;

    const snapshot = await fs.getDocs(fs.collection(db, "submissions"));
    const remote = snapshot.docs
      .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
      .filter(matchesScope);

    const merged = new Map();
    for (const item of inMemory) merged.set(item.id, item);
    for (const item of remote) merged.set(item.id, item);
    return Array.from(merged.values());
  } catch (err) {
    console.warn("Could not retrieve approved community submissions:", err);
    return inMemory;
  }
}

/**
 * Retrieve a deterministic page of approved community submissions.
 * The cursor is an object containing the last page's createdAt and id values.
 */
export async function getApprovedSubmissionsPage(options = {}) {
  const {
    deviceId = null,
    experimentId = null,
    pageSize = 20,
    cursor = null
  } = options;
  const limit = Math.max(1, Math.min(100, Number(pageSize) || 20));
  const matchesScope = (submission) => (
    submission.status === "approved" &&
    (!deviceId || submission.deviceId === deviceId) &&
    (!experimentId || submission.experimentId === experimentId)
  );
  const compareNewestFirst = (left, right) => {
    const createdAtOrder = String(right.createdAt || "").localeCompare(String(left.createdAt || ""));
    return createdAtOrder || String(right.id || "").localeCompare(String(left.id || ""));
  };
  const isAfterCursor = (submission) => {
    if (!cursor?.createdAt || !cursor?.id) return true;
    const createdAtOrder = String(submission.createdAt || "").localeCompare(String(cursor.createdAt));
    return createdAtOrder < 0 || (createdAtOrder === 0 && String(submission.id || "") < String(cursor.id));
  };

  const { fb, fs } = await getSdk();
  if (fb && fs && fb.isFirebaseReady()) {
    try {
      const db = fb.getDb();
      if (db && fs.query && fs.where && fs.orderBy && fs.limit) {
        const constraints = [fs.where("status", "==", "approved")];
        if (deviceId) constraints.push(fs.where("deviceId", "==", deviceId));
        if (experimentId) constraints.push(fs.where("experimentId", "==", experimentId));
        constraints.push(fs.orderBy("createdAt", "desc"));
        if (fs.documentId) constraints.push(fs.orderBy(fs.documentId(), "desc"));
        if (cursor && fs.startAfter) constraints.push(fs.startAfter(cursor.createdAt, cursor.id));
        constraints.push(fs.limit(limit + 1));

        const snapshot = await fs.getDocs(fs.query(fs.collection(db, "submissions"), ...constraints));
        const rows = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
        const pageRows = rows.slice(0, limit);
        const last = pageRows[pageRows.length - 1];
        return {
          submissions: pageRows,
          hasMore: rows.length > limit,
          nextCursor: rows.length > limit && last ? { createdAt: last.createdAt, id: last.id } : null
        };
      }
    } catch (err) {
      console.warn("Could not retrieve paged approved submissions:", err);
    }
  }

  const rows = Array.from(inMemorySubmissions.values())
    .filter(matchesScope)
    .sort(compareNewestFirst)
    .filter(isAfterCursor);
  const pageRows = rows.slice(0, limit);
  const last = pageRows[pageRows.length - 1];
  return {
    submissions: pageRows,
    hasMore: rows.length > limit,
    nextCursor: rows.length > limit && last ? { createdAt: last.createdAt, id: last.id } : null
  };
}

/**
 * Aggregate simple numeric statistics from approved submissions for a device.
 */
export async function getDeviceCommunityStats(deviceId) {
  const submissions = await getApprovedSubmissionsForDevice(deviceId);
  const metrics = {};

  for (const submission of submissions) {
    for (const [key, rawItem] of Object.entries(submission.measurements || {})) {
      const value = (
        typeof rawItem === "object" &&
        rawItem !== null &&
        Object.prototype.hasOwnProperty.call(rawItem, "value")
      ) ? rawItem.value : rawItem;

      const numeric = Number(value);
      if (!Number.isFinite(numeric)) continue;

      if (!metrics[key]) metrics[key] = [];
      metrics[key].push(numeric);
    }
  }

  const metricStats = {};
  for (const [key, values] of Object.entries(metrics)) {
    if (!values.length) continue;

    const sorted = [...values].sort((a, b) => a - b);
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const median = sorted.length % 2
      ? sorted[Math.floor(sorted.length / 2)]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    const variance = values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length;

    metricStats[key] = {
      sampleSize: values.length,
      mean,
      median,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      variance,
      standardDeviation: Math.sqrt(variance)
    };
  }

  return {
    deviceId,
    sampleSize: submissions.length,
    metrics: metricStats,
    distributions: {
      operatingSystems: {},
      testingEnvironments: {}
    }
  };
}

/**
 * Retrieve submissions awaiting moderation.
 * Firestore rules restrict visibility to moderators/owners and the submitter.
 */
export async function getPendingSubmissions() {
  const inMemory = Array.from(inMemorySubmissions.values())
    .filter(submission =>
      ["pending_review", "pending", "needs_revision"].includes(submission.status)
    )
    .sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));

  const { fb, fs } = await getSdk();
  if (!fb || !fs || !fb.isFirebaseReady()) return inMemory;

  try {
    const db = fb.getDb();
    if (!db) return inMemory;

    const snapshot = await fs.getDocs(fs.collection(db, "submissions"));
    const remote = snapshot.docs
      .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
      .filter(submission =>
        ["pending_review", "pending", "needs_revision"].includes(submission.status)
      );

    const merged = new Map();
    for (const item of inMemory) merged.set(item.id, item);
    for (const item of remote) merged.set(item.id, item);
    return Array.from(merged.values()).sort((a, b) => String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
  } catch (err) {
    console.warn("Could not retrieve pending submissions:", err);
    return inMemory;
  }
}

/**
 * Retrieve a user's own submissions.
 */
export async function getUserSubmissions(userId = null) {
  const { fb, fs } = await getSdk();
  const currentUser = fb?.getCurrentUser?.();
  const targetUserId = userId || currentUser?.uid;

  if (!targetUserId || currentUser?.isVisitor) {
    if (!targetUserId) return [];
  }
  if (userId && currentUser?.uid && currentUser?.uid !== userId && fb?.getCurrentProfile?.()?.role === "contributor") {
    throw new Error("You are not authorized to retrieve another user's submissions.");
  }

  const inMemory = Array.from(inMemorySubmissions.values())
    .filter(submission =>
      submission.authorId === targetUserId || submission.userId === targetUserId
    )
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  if (!fb || !fs || !fb.isFirebaseReady()) return inMemory;

  try {
    const db = fb.getDb();
    if (!db) return inMemory;

    const snapshot = await fs.getDocs(fs.collection(db, "submissions"));
    const remote = snapshot.docs
      .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
      .filter(submission =>
        submission.authorId === targetUserId || submission.userId === targetUserId
      );

    const merged = new Map();
    for (const item of inMemory) merged.set(item.id, item);
    for (const item of remote) merged.set(item.id, item);
    return Array.from(merged.values()).sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  } catch (err) {
    console.warn("Could not retrieve user submissions:", err);
    return inMemory;
  }
}

/**
 * Retrieve a single submission.
 */
export async function getSubmissionById(submissionId) {
  if (!submissionId) return null;

  if (inMemorySubmissions.has(submissionId)) {
    return inMemorySubmissions.get(submissionId);
  }

  const { fb, fs } = await getSdk();
  if (!fb || !fs || !fb.isFirebaseReady()) return null;

  try {
    const db = fb.getDb();
    if (!db) return null;

    const docSnap = await fs.getDoc(fs.doc(db, "submissions", submissionId));
    return docSnap.exists()
      ? { id: docSnap.id, ...docSnap.data() }
      : null;
  } catch (err) {
    console.warn("Could not retrieve submission:", err);
    return null;
  }
}

/**
 * Create a community replication submission.
 * Client-side validation improves UX; Firestore rules remain the security boundary.
 */
export async function createSubmission(payload = {}) {
  const { fb, fs } = await getSdk();
  const { user, profile } = getAuthenticatedProfile(fb, payload);

  if (!payload.experimentId || !payload.deviceId) {
    throw new Error("A valid experiment and device are required.");
  }

  const [experiment, device] = await Promise.all([
    getExperimentById(payload.experimentId),
    getDeviceById(payload.deviceId)
  ]);

  if (!experiment) throw new Error("The selected experiment could not be found.");
  if (!device) throw new Error("The selected device could not be found.");

  if (!Array.isArray(experiment.devices) || !experiment.devices.includes(device.id)) {
    throw new Error("The selected device is not registered for this experiment.");
  }

  const measurementCheck = validateMeasurementsAgainstExperiment(
    experiment,
    payload.measurements || {}
  );

  if (!measurementCheck.valid) {
    throw new Error(`Measurement validation failed: ${measurementCheck.errors.join(" ")}`);
  }

  const now = new Date().toISOString();
  const submissionId = createSubmissionId();

  const evidence = Array.isArray(payload.evidenceReferences)
    ? payload.evidenceReferences.map(normalizeEvidenceItem)
    : Array.isArray(payload.evidence)
      ? payload.evidence.map(normalizeEvidenceItem)
      : [];

  const conditions = sanitizeObject({
    officialBaseline: String(payload.conditions?.officialBaseline || "").slice(0, 5000),
    additionalConditions: String(payload.conditions?.additionalConditions || "").slice(0, 5000),
    environment: String(payload.conditions?.environment || "").slice(0, 2000),
    testDate: String(payload.testDate || "").slice(0, 40),
    softwareVersion: String(payload.softwareVersion || "").slice(0, 300)
  });

  const protocolVersion = String(experiment.protocolVersion || experiment.version || "1.0.0");

  const submission = {
    id: submissionId,
    authorId: user.uid,
    authorDisplayName: sanitizeText(profile.displayName || user.displayName || "Contributor").slice(0, 200),
    userId: user.uid,
    submitterName: sanitizeText(profile.displayName || user.displayName || "Contributor").slice(0, 200),
    submitterEmail: sanitizeText(user.email || "").slice(0, 320),
    deviceId: device.id,
    experimentId: experiment.id,
    type: "replication",
    status: "pending_review",
    measurements: payload.measurements,
    conditions,
    notes: sanitizeText(String(payload.notes || "")).slice(0, 5000),
    evidence,
    evidenceReferences: evidence,
    createdAt: now,
    updatedAt: now,
    submittedAt: now,
    review: null,
    reviewerId: null,
    reviewedAt: null,
    reviewNotes: null,
    protocolVersion,
    provenance: {
      source: "community",
      protocolVersion,
      experimentVersion: String(experiment.version || "1.0.0")
    }
  };

  inMemorySubmissions.set(submissionId, submission);

  if (fb && fs && fb.isFirebaseReady()) {
    try {
      const db = fb.getDb();
      if (db) {
        await fs.setDoc(fs.doc(db, "submissions", submissionId), submission);
      }
    } catch (err) {
      console.warn("Could not persist submission to Firestore:", err);
    }
  }

  return {
    success: true,
    id: submissionId,
    submission,
    ...submission
  };
}

/**
 * Update an author's editable submission fields.
 * Approval/rejection/review transitions are handled by reviewSubmission().
 */
export async function updateSubmission(submissionId, updatePayload = {}, userId = null) {
  if (!submissionId) throw new Error("Submission ID is required.");

  let existing = inMemorySubmissions.get(submissionId);
  const { fb, fs } = await getSdk();

  if (!existing && fb && fs && fb.isFirebaseReady()) {
    const db = fb.getDb();
    if (db) {
      const existingSnap = await fs.getDoc(fs.doc(db, "submissions", submissionId));
      if (existingSnap.exists()) {
        existing = existingSnap.data();
      }
    }
  }

  if (!existing) throw new Error("Submission not found.");

  const currentUser = fb?.getCurrentUser?.();
  if (userId && currentUser?.uid && currentUser.uid !== userId) {
    throw new Error("You are not authorized to update this submission.");
  }

  if (currentUser && !currentUser.isVisitor) {
    if (existing.authorId !== currentUser.uid && existing.userId !== currentUser.uid) {
      throw new Error("You are not authorized to update this submission.");
    }
  }

  if (existing.status === "approved") {
    throw new Error("Immutable Record: Approved submissions cannot be directly modified.");
  }

  const experiment = await getExperimentById(existing.experimentId);
  if (!experiment) throw new Error("The source experiment could not be found.");

  const measurements = updatePayload.measurements || existing.measurements || {};
  const measurementCheck = validateMeasurementsAgainstExperiment(experiment, measurements);

  if (!measurementCheck.valid) {
    throw new Error(`Measurement validation failed: ${measurementCheck.errors.join(" ")}`);
  }

  const allowedStatus = ["draft", "pending_review", "pending", "withdrawn", "needs_revision"];
  const nextStatus = updatePayload.status || existing.status;
  if (!allowedStatus.includes(nextStatus)) {
    throw new Error("Invalid contributor submission status.");
  }

  const updates = {
    updatedAt: new Date().toISOString(),
    status: nextStatus,
    measurements,
    conditions: updatePayload.conditions || existing.conditions || {},
    notes: sanitizeText(String(updatePayload.notes ?? existing.notes ?? "")).slice(0, 5000)
  };

  if (Array.isArray(updatePayload.evidenceReferences)) {
    updates.evidence = updatePayload.evidenceReferences.map(normalizeEvidenceItem);
    updates.evidenceReferences = updates.evidence;
  }

  const updatedRecord = { ...existing, ...updates };
  inMemorySubmissions.set(submissionId, updatedRecord);

  if (fb && fs && fb.isFirebaseReady()) {
    try {
      const db = fb.getDb();
      if (db) {
        await fs.updateDoc(fs.doc(db, "submissions", submissionId), updates);
      }
    } catch (err) {
      console.warn("Could not update submission in Firestore:", err);
    }
  }

  return { id: submissionId, ...updatedRecord, submission: updatedRecord };
}

/**
 * Moderator review transition.
 * Firestore rules perform the authoritative authorization check.
 */
export async function reviewSubmission(submissionId, reviewData = {}) {
  if (!submissionId) throw new Error("Submission ID is required.");

  const status = reviewData.status;
  if (!["approved", "rejected", "needs_revision"].includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  let existing = inMemorySubmissions.get(submissionId);
  const { fb, fs } = await getSdk();

  if (!existing && fb && fs && fb.isFirebaseReady()) {
    const db = fb.getDb();
    if (db) {
      const ref = fs.doc(db, "submissions", submissionId);
      const existingSnap = await fs.getDoc(ref);
      if (existingSnap.exists()) {
        existing = existingSnap.data();
      }
    }
  }

  if (!existing) throw new Error("Submission not found.");

  if (existing.status === "approved") {
    throw new Error("Immutable Record: Approved submissions cannot be directly modified or reviewed.");
  }

  const profile = fb?.getCurrentProfile?.();
  const user = fb?.getCurrentUser?.();

  if (user && user.isVisitor) {
    throw new Error("Authentication is required for moderation.");
  }

  if (user && profile && !["moderator", "admin", "owner"].includes(profile?.role) && !fb.isSystemOwner?.(user)) {
    throw new Error("Moderator authorization is required.");
  }

  const reviewerUid = user?.uid || reviewData.reviewerId || "moderator";
  const reviewerName = profile?.displayName || user?.displayName || reviewData.reviewerName || "Moderator";

  if (reviewerUid === existing.authorId || reviewerUid === existing.userId) {
    throw new Error("Self-approval is not allowed.");
  }

  const now = new Date().toISOString();
  const feedback = sanitizeText(String(reviewData.feedback || reviewData.reviewNotes || "")).slice(0, 5000);

  const updates = {
    status,
    updatedAt: now,
    reviewerId: reviewerUid,
    reviewerName,
    reviewedAt: now,
    reviewNotes: feedback,
    review: {
      reviewerId: reviewerUid,
      reviewerName,
      reviewedAt: now,
      feedback
    }
  };

  const updatedRecord = { ...existing, ...updates };
  inMemorySubmissions.set(submissionId, updatedRecord);

  if (fb && fs && fb.isFirebaseReady()) {
    try {
      const db = fb.getDb();
      if (db) {
        await fs.updateDoc(fs.doc(db, "submissions", submissionId), updates);
      }
    } catch (err) {
      console.warn("Could not update review in Firestore:", err);
    }
  }

  return {
    success: true,
    id: submissionId,
    status,
    ...updatedRecord,
    submission: updatedRecord
  };
}

/**
 * Withdraw an author's submission.
 */
export async function withdrawSubmission(submissionId, userId = null) {
  return updateSubmission(
    submissionId,
    { status: "withdrawn" },
    userId
  );
}

// Draft helpers intentionally remain local-only until the durable draft workflow is implemented.
export function saveDraftSubmission(userId, draftData) {
  if (!userId) return;
  try {
    localStorage.setItem(`wdiii_submission_draft_${userId}`, JSON.stringify(draftData || {}));
  } catch (err) {
    console.warn("Could not save local submission draft:", err);
  }
}

export function loadDraftSubmission(userId) {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(`wdiii_submission_draft_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Could not load local submission draft:", err);
    return null;
  }
}

export function clearDraftSubmission(userId) {
  if (!userId) return;
  try {
    localStorage.removeItem(`wdiii_submission_draft_${userId}`);
  } catch (err) {
    console.warn("Could not clear local submission draft:", err);
  }
}

