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

// In-memory cache structures
let devicesCache = null;
let experimentsCache = null;
let deviceDetailCache = new Map();
let experimentDetailCache = new Map();

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
 * Retrieve single device by ID with linked experiment dossiers
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
// Community Submissions Data Layer
// ==========================================

const SUBMISSION_LOCAL_KEY_PREFIX = "wdiii_submissions_local_";
const DRAFT_LOCAL_KEY_PREFIX = "wdiii_draft_submission_";

/**
 * Helper to get local submissions storage
 */
function getLocalSubmissions(userId) {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const raw = localStorage.getItem(SUBMISSION_LOCAL_KEY_PREFIX + userId);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalSubmissions(userId, submissions) {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.setItem(SUBMISSION_LOCAL_KEY_PREFIX + userId, JSON.stringify(submissions));
  } catch (err) {
    console.warn("Could not write local submissions cache:", err);
  }
}

/**
 * Create a new community test submission against an official WDIII protocol
 * Strictly enforces pending_review status and provenance
 */
export async function createSubmission(payload) {
  if (!payload) throw new Error("Submission payload is required.");
  if (!payload.userId) throw new Error("Authenticated User ID is required.");
  if (!payload.deviceId) throw new Error("Target Device ID is required.");
  if (!payload.experimentId) throw new Error("Official Experiment Protocol ID is required.");

  // Verify device exists
  const device = await getDeviceById(payload.deviceId);
  if (!device) {
    throw new Error(`Device '${payload.deviceId}' was not found in the official hardware registry.`);
  }

  // Verify experiment exists and is official
  const experiment = await getExperimentById(payload.experimentId);
  if (!experiment) {
    throw new Error(`Official experiment protocol '${payload.experimentId}' was not found.`);
  }

  const nowIso = new Date().toISOString();
  const subId = payload.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // Sanitize all user-controlled text, conditions, and measurements
  const sanitizedConditions = sanitizeObject(payload.conditions || {});
  const sanitizedMeasurements = sanitizeObject(payload.measurements || {});
  const sanitizedNotes = sanitizeText(payload.notes || "", 5000);
  const sanitizedSoftware = sanitizeText(payload.softwareVersion || "", 120);
  const sanitizedTestDate = sanitizeText(payload.testDate || nowIso.split("T")[0], 30);
  const sanitizedSubmitterName = sanitizeText(payload.submitterName || "Contributor", 100);
  const sanitizedSubmitterEmail = sanitizeText(payload.submitterEmail || "", 150);

  // Filter evidence references to valid structures
  const cleanEvidence = Array.isArray(payload.evidenceReferences)
    ? payload.evidenceReferences.map(ref => ({
        name: sanitizeText(ref.name || "Evidence", 120),
        fileName: sanitizeText(ref.fileName || ref.name || "", 120),
        path: sanitizeText(ref.path || "", 300),
        url: ref.url || "#",
        size: Number(ref.size) || 0,
        type: sanitizeText(ref.type || "application/octet-stream", 60),
        uploadedAt: ref.uploadedAt || nowIso
      }))
    : [];

  // Build hardened submission record
  const submissionRecord = {
    id: subId,
    userId: payload.userId,
    authorId: payload.userId, // Dual-key compatibility for security rules
    submitterName: sanitizedSubmitterName,
    submitterEmail: sanitizedSubmitterEmail,
    deviceId: payload.deviceId,
    deviceBrand: device.brand,
    deviceModel: device.model,
    experimentId: payload.experimentId,
    experimentTitle: experiment.title,
    experimentNumber: experiment.experimentNumber || "",
    experimentCategory: experiment.category,
    submittedAt: nowIso,
    createdAt: nowIso,
    updatedAt: nowIso,
    testDate: sanitizedTestDate,
    softwareVersion: sanitizedSoftware,
    conditions: sanitizedConditions,
    measurements: sanitizedMeasurements,
    evidenceReferences: cleanEvidence,
    notes: sanitizedNotes,
    // Status MUST strictly be pending_review on initial creation
    status: "pending_review",
    reviewerId: null,
    reviewedAt: null,
    reviewNotes: null,
    reviewHistory: []
  };

  // Attempt Firestore write
  const { fb, fs } = await getSdk();
  let firestoreSaved = false;

  if (fb && fs && fb.isFirebaseReady()) {
    try {
      const db = fb.getDb();
      if (db) {
        await fs.setDoc(fs.doc(db, "submissions", subId), submissionRecord);
        firestoreSaved = true;
      }
    } catch (err) {
      console.warn("Firestore submission write encountered notice:", err);
    }
  }

  // Always save to local user cache for immediate feedback & offline durability
  const localList = getLocalSubmissions(payload.userId);
  localList.unshift(submissionRecord);
  saveLocalSubmissions(payload.userId, localList);

  // Clear saved draft if present
  clearDraftSubmission(payload.userId);

  return {
    success: true,
    id: subId,
    submission: submissionRecord,
    firestoreSaved
  };
}

/**
 * Retrieve user's own submissions with resilient cache fallback
 */
export async function getUserSubmissions(userId) {
  if (!userId) return [];

  let submissions = [];
  const { fb, fs } = await getSdk();

  if (fb && fs && fb.isFirebaseReady()) {
    try {
      const db = fb.getDb();
      if (db) {
        // Query submissions where userId == userId
        const q = fs.query(
          fs.collection(db, "submissions"),
          fs.where("userId", "==", userId)
        );
        const snap = await fs.getDocs(q);
        if (!snap.empty) {
          submissions = snap.docs.map(doc => doc.data());
        }
      }
    } catch (err) {
      console.warn("Firestore query for user submissions:", err);
    }
  }

  // Merge with local storage cache to ensure zero data loss during network hiccups
  const localList = getLocalSubmissions(userId);
  const mergedMap = new Map();
  for (const item of localList) {
    mergedMap.set(item.id, item);
  }
  for (const item of submissions) {
    mergedMap.set(item.id, item);
  }

  const result = Array.from(mergedMap.values());
  // Sort descending by submittedAt / createdAt
  result.sort((a, b) => new Date(b.submittedAt || b.createdAt || 0) - new Date(a.submittedAt || a.createdAt || 0));
  return result;
}

/**
 * Retrieve a single submission by ID
 */
export async function getSubmissionById(submissionId, userId = null) {
  if (!submissionId) return null;

  // Check local cache first
  if (userId) {
    const local = getLocalSubmissions(userId);
    const foundLocal = local.find(s => s.id === submissionId);
    if (foundLocal) return foundLocal;
  }

  const { fb, fs } = await getSdk();
  if (fb && fs && fb.isFirebaseReady()) {
    try {
      const db = fb.getDb();
      if (db) {
        const snap = await fs.getDoc(fs.doc(db, "submissions", submissionId));
        if (snap.exists()) {
          return snap.data();
        }
      }
    } catch (err) {
      console.warn(`Firestore getSubmissionById(${submissionId}) error:`, err);
    }
  }

  return null;
}

/**
 * Update an existing submission while it remains in pending_review or needs_revision
 * Contributors cannot alter status to approved or change reviewerId
 */
export async function updateSubmission(submissionId, updatePayload, userId) {
  if (!submissionId) throw new Error("Submission ID is required.");
  if (!userId) throw new Error("User ID is required.");

  const current = await getSubmissionById(submissionId, userId);
  if (!current) throw new Error("Submission not found.");

  if (current.userId !== userId && current.authorId !== userId) {
    throw new Error("Unauthorized: You may only modify your own submissions.");
  }

  if (!["pending_review", "pending", "needs_revision"].includes(current.status)) {
    throw new Error(`Submission cannot be modified while in status '${current.status}'.`);
  }

  const nowIso = new Date().toISOString();
  const sanitizedConditions = updatePayload.conditions ? sanitizeObject(updatePayload.conditions) : current.conditions;
  const sanitizedMeasurements = updatePayload.measurements ? sanitizeObject(updatePayload.measurements) : current.measurements;
  const sanitizedNotes = updatePayload.notes !== undefined ? sanitizeText(updatePayload.notes, 5000) : current.notes;
  const sanitizedSoftware = updatePayload.softwareVersion !== undefined ? sanitizeText(updatePayload.softwareVersion, 120) : current.softwareVersion;
  const sanitizedTestDate = updatePayload.testDate !== undefined ? sanitizeText(updatePayload.testDate, 30) : current.testDate;

  // When updating from needs_revision, transition back to pending_review for re-review
  const newStatus = current.status === "needs_revision" ? "pending_review" : current.status;

  const updatedRecord = {
    ...current,
    conditions: sanitizedConditions,
    measurements: sanitizedMeasurements,
    notes: sanitizedNotes,
    softwareVersion: sanitizedSoftware,
    testDate: sanitizedTestDate,
    status: newStatus,
    updatedAt: nowIso,
    // Preserve reviewer & audit provenance
    reviewerId: current.reviewerId,
    reviewedAt: current.reviewedAt,
    reviewNotes: current.reviewNotes,
    reviewHistory: current.reviewHistory || []
  };

  if (Array.isArray(updatePayload.evidenceReferences)) {
    updatedRecord.evidenceReferences = updatePayload.evidenceReferences.map(ref => ({
      name: sanitizeText(ref.name || "Evidence", 120),
      fileName: sanitizeText(ref.fileName || ref.name || "", 120),
      path: sanitizeText(ref.path || "", 300),
      url: ref.url || "#",
      size: Number(ref.size) || 0,
      type: sanitizeText(ref.type || "application/octet-stream", 60),
      uploadedAt: ref.uploadedAt || nowIso
    }));
  }

  const { fb, fs } = await getSdk();
  if (fb && fs && fb.isFirebaseReady()) {
    try {
      const db = fb.getDb();
      if (db) {
        await fs.updateDoc(fs.doc(db, "submissions", submissionId), updatedRecord);
      }
    } catch (err) {
      console.warn("Firestore update error:", err);
    }
  }

  // Update local storage cache
  const localList = getLocalSubmissions(userId);
  const idx = localList.findIndex(s => s.id === submissionId);
  if (idx !== -1) {
    localList[idx] = updatedRecord;
  } else {
    localList.unshift(updatedRecord);
  }
  saveLocalSubmissions(userId, localList);

  return updatedRecord;
}

/**
 * Withdraw a pending or needs_revision submission
 */
export async function withdrawSubmission(submissionId, userId) {
  if (!submissionId || !userId) throw new Error("Submission ID and User ID required.");

  const current = await getSubmissionById(submissionId, userId);
  if (!current) throw new Error("Submission not found.");

  if (current.userId !== userId && current.authorId !== userId) {
    throw new Error("Unauthorized: You may only withdraw your own submissions.");
  }

  if (!["pending_review", "pending", "needs_revision"].includes(current.status)) {
    throw new Error(`Cannot withdraw submission with status '${current.status}'.`);
  }

  const nowIso = new Date().toISOString();
  const updateData = {
    status: "withdrawn",
    updatedAt: nowIso
  };

  const { fb, fs } = await getSdk();
  if (fb && fs && fb.isFirebaseReady()) {
    try {
      const db = fb.getDb();
      if (db) {
        await fs.updateDoc(fs.doc(db, "submissions", submissionId), updateData);
      }
    } catch (err) {
      console.warn("Firestore withdrawDoc notice:", err);
    }
  }

  const localList = getLocalSubmissions(userId);
  const idx = localList.findIndex(s => s.id === submissionId);
  if (idx !== -1) {
    localList[idx] = { ...localList[idx], ...updateData };
    saveLocalSubmissions(userId, localList);
  }

  return { success: true, id: submissionId, status: "withdrawn" };
}

/**
 * Review a community submission (Moderator / Admin authorization required)
 * Allows setting status to: 'approved', 'rejected', or 'needs_revision'
 */
export async function reviewSubmission(submissionId, reviewData) {
  const { status, reviewNotes, reviewerId, reviewerName } = reviewData;
  if (!["approved", "rejected", "needs_revision"].includes(status)) {
    throw new Error(`Invalid review status '${status}'. Must be approved, rejected, or needs_revision.`);
  }

  const nowIso = new Date().toISOString();
  const current = await getSubmissionById(submissionId);
  if (!current) throw new Error("Submission not found.");

  const historyEntry = {
    previousStatus: current.status,
    newStatus: status,
    reviewerId: reviewerId || "moderator",
    reviewerName: reviewerName || "Reviewer",
    reviewNotes: sanitizeText(reviewNotes || "", 2000),
    timestamp: nowIso
  };

  const updatedHistory = [...(current.reviewHistory || []), historyEntry];

  const updateFields = {
    status,
    reviewerId: reviewerId || "moderator",
    reviewedAt: nowIso,
    reviewNotes: sanitizeText(reviewNotes || "", 2000),
    reviewHistory: updatedHistory,
    updatedAt: nowIso
  };

  const { fb, fs } = await getSdk();
  if (fb && fs && fb.isFirebaseReady()) {
    try {
      const db = fb.getDb();
      if (db) {
        await fs.updateDoc(fs.doc(db, "submissions", submissionId), updateFields);
      }
    } catch (err) {
      console.warn("Firestore reviewSubmission notice:", err);
    }
  }

  if (current.userId) {
    const localList = getLocalSubmissions(current.userId);
    const idx = localList.findIndex(s => s.id === submissionId);
    if (idx !== -1) {
      localList[idx] = { ...localList[idx], ...updateFields };
      saveLocalSubmissions(current.userId, localList);
    }
  }

  return { success: true, id: submissionId, status };
}

/**
 * Save in-progress submission draft to private client storage
 */
export function saveDraftSubmission(userId, draftData) {
  if (typeof window === "undefined" || !userId) return;
  try {
    const key = DRAFT_LOCAL_KEY_PREFIX + userId;
    const cleanDraft = {
      ...draftData,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(cleanDraft));
    return true;
  } catch (err) {
    console.warn("Could not save submission draft:", err);
    return false;
  }
}

/**
 * Load saved submission draft from private client storage
 */
export function loadDraftSubmission(userId) {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const key = DRAFT_LOCAL_KEY_PREFIX + userId;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Clear saved submission draft
 */
export function clearDraftSubmission(userId) {
  if (typeof window === "undefined" || !userId) return;
  try {
    const key = DRAFT_LOCAL_KEY_PREFIX + userId;
    localStorage.removeItem(key);
  } catch {
    // Ignore error
  }
}

/**
 * Get approved community submissions for an experiment protocol
 */
export async function getApprovedSubmissionsForExperiment(experimentId) {
  if (!experimentId) return [];

  const { fb, fs } = await getSdk();
  if (fb && fs && fb.isFirebaseReady()) {
    try {
      const db = fb.getDb();
      if (db) {
        const q = fs.query(
          fs.collection(db, "submissions"),
          fs.where("experimentId", "==", experimentId),
          fs.where("status", "==", "approved"),
          fs.orderBy("submittedAt", "desc")
        );
        const snap = await fs.getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      }
    } catch (err) {
      console.warn("Firestore approved submissions by experiment query error:", err);
    }
  }

  // Fallback: check local storage across user keys
  try {
    const results = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("wdiii_submissions_")) {
        const list = JSON.parse(localStorage.getItem(k) || "[]");
        list.forEach(s => {
          if (s.experimentId === experimentId && s.status === "approved") {
            results.push(s);
          }
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}

/**
 * Get approved community submissions for a device
 */
export async function getApprovedSubmissionsForDevice(deviceId) {
  if (!deviceId) return [];

  const { fb, fs } = await getSdk();
  if (fb && fs && fb.isFirebaseReady()) {
    try {
      const db = fb.getDb();
      if (db) {
        const q = fs.query(
          fs.collection(db, "submissions"),
          fs.where("deviceId", "==", deviceId),
          fs.where("status", "==", "approved"),
          fs.orderBy("submittedAt", "desc")
        );
        const snap = await fs.getDocs(q);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      }
    } catch (err) {
      console.warn("Firestore approved submissions by device query error:", err);
    }
  }

  // Fallback: check local storage across user keys
  try {
    const results = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("wdiii_submissions_")) {
        const list = JSON.parse(localStorage.getItem(k) || "[]");
        list.forEach(s => {
          if (s.deviceId === deviceId && s.status === "approved") {
            results.push(s);
          }
        });
      }
    }
    return results;
  } catch {
    return [];
  }
}

/**
 * Step 6: Get aggregated community telemetry statistics (device_stats) for a device.
 * Exclusively aggregates approved submissions.
 */
export async function getDeviceCommunityStats(deviceId) {
  const { getDeviceCommunityStats: fetchStats } = await import("./device-stats.js");
  return fetchStats(deviceId);
}



