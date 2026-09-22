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
// Compatibility Handlers
// (Community contributions retired in favor of author-provided data)
// ==========================================

/**
 * Retrieve verified community submissions for an experiment protocol.
 * Returns empty array as external contributions are disabled.
 */
export async function getApprovedSubmissionsForExperiment(experimentId) {
  return [];
}

/**
 * Retrieve verified community submissions for a device.
 * Returns empty array as external contributions are disabled.
 */
export async function getApprovedSubmissionsForDevice(deviceId) {
  return [];
}

/**
 * Aggregated telemetry statistics for a device
 */
export async function getDeviceCommunityStats(deviceId) {
  return {
    deviceId,
    sampleSize: 0,
    metrics: {},
    distributions: { operatingSystems: {}, testingEnvironments: {} }
  };
}

/**
 * Retrieve pending submissions. Returns empty array as contributions are disabled.
 */
export async function getPendingSubmissions() {
  return [];
}

/**
 * Moderation review handler stub preserved for interface compatibility.
 */
export async function reviewSubmission(submissionId, reviewData = {}) {
  const status = reviewData.status;
  if (!["approved", "rejected", "needs_revision"].includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }
  return { success: true, id: submissionId, status };
}

/**
 * User submission query stub
 */
export async function getUserSubmissions(userId) {
  return [];
}

/**
 * Single submission query stub
 */
export async function getSubmissionById(submissionId, userId = null) {
  return null;
}

export function saveDraftSubmission(userId, draftData) {}
export function loadDraftSubmission(userId) { return null; }
export function clearDraftSubmission(userId) {}

export async function createSubmission(payload) {
  throw new Error("Community submissions have been retired. The author exclusively publishes verified testing data.");
}

export async function updateSubmission(submissionId, updatePayload, userId) {
  throw new Error("Community submissions have been retired.");
}

export async function withdrawSubmission(submissionId, userId) {
  throw new Error("Community submissions have been retired.");
}
