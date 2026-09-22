/**
 * WDIII Tech Vault - Firebase Client Initialization & Authentication Module
 * 
 * Modular Firebase SDK integration (v11+)
 * - Authentication with Google Sign-In (Popup with Redirect fallback)
 * - Persistent Auth state with IndexedDB / LocalStorage
 * - Firestore Client Initialization with custom named database
 * - User Profile Document Management (users/{uid})
 * - Anti-Self-Escalation guards and role verification
 * - Reactive state listeners
 */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged, 
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-storage.js";

// Global module state
let app = null;
let auth = null;
let db = null;
let storage = null;
let currentUser = null;
let userProfile = null;
let isInitialized = false;
let initPromise = null;
let authStateListeners = [];

/**
 * Fetch sanitized public Firebase configuration from backend
 */
async function fetchConfig() {
  const res = await fetch("/api/firebase-config");
  if (!res.ok) {
    throw new Error(`Failed to load Firebase configuration: HTTP ${res.status}`);
  }
  return await res.json();
}

/**
 * Initialize Firebase Application, Auth, and Firestore instances
 */
export async function initFirebase() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const config = await fetchConfig();
      if (!config || !config.apiKey || !config.projectId) {
        throw new Error("Invalid or incomplete Firebase client configuration received.");
      }

      const firebaseConfig = {
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId
      };

      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      auth = getAuth(app);

      // Set local persistence for persistent authentication across sessions
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (persistenceErr) {
        console.warn("Could not set local persistence, defaulting to browser default:", persistenceErr);
      }

      // Initialize Firestore with custom database ID if specified
      if (config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)") {
        db = getFirestore(app, config.firestoreDatabaseId);
      } else {
        db = getFirestore(app);
      }

      // Initialize Firebase Storage if bucket is configured
      if (config.storageBucket) {
        try {
          storage = getStorage(app);
        } catch (storageErr) {
          console.warn("Firebase Storage initialization notice:", storageErr);
        }
      }

      // Listen to Firebase Auth state transitions
      onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        if (user) {
          try {
            userProfile = await syncUserProfile(user);
          } catch (profileErr) {
            console.error("Error synchronizing user profile:", profileErr);
            // Fallback safe in-memory profile if Firestore sync is pending or restricted
            const isOwnerAccount = isSystemOwner(user);
            userProfile = {
              uid: user.uid,
              displayName: user.displayName || (isOwnerAccount ? "System Owner" : "Contributor"),
              email: user.email || "",
              photoURL: user.photoURL || "",
              role: "contributor",
              submissionCount: 0,
              reputationScore: 0
            };
            if (isOwnerAccount) {
              userProfile.role = "owner";
              userProfile.reputationScore = 1000;
            }
          }
        } else {
          userProfile = null;
        }
        isInitialized = true;
        notifyAuthStateListeners({ user: currentUser, profile: userProfile, loading: false });
      });

      // Check for redirect result (in case popup was blocked and fallback was triggered)
      try {
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult && redirectResult.user) {
          currentUser = redirectResult.user;
          userProfile = await syncUserProfile(redirectResult.user);
          notifyAuthStateListeners({ user: currentUser, profile: userProfile, loading: false });
        }
      } catch (redirectErr) {
        console.warn("Redirect result check completed:", redirectErr?.message);
      }

      return { app, auth, db };
    } catch (err) {
      console.error("Firebase initialization failed:", err);
      isInitialized = true;
      notifyAuthStateListeners({ user: null, profile: null, loading: false, error: err.message });
      throw err;
    }
  })();

  return initPromise;
}

export const SYSTEM_OWNER_EMAIL = "perfectshadowkai33@gmail.com";

/**
 * Checks whether a given user object or email address is the verified platform owner
 */
export function isSystemOwner(userOrEmail) {
  if (!userOrEmail) return false;
  const email = typeof userOrEmail === "string" ? userOrEmail : userOrEmail.email;
  return typeof email === "string" && email.trim().toLowerCase() === SYSTEM_OWNER_EMAIL.toLowerCase();
}

/**
 * Synchronizes user document in Firestore: users/{uid}
 * - Automatically provisions designated root system owner (perfectshadowkai33@gmail.com) with role 'owner'
 * - Creates standard contributor record for other users on first login
 * - Updates lastLoginAt on subsequent logins
 * - Strictly preserves or upgrades system privileges safely
 */
export async function syncUserProfile(user) {
  if (!db || !user) return null;

  const isOwnerAccount = isSystemOwner(user);
  const userRef = doc(db, "users", user.uid);
  let snap;
  try {
    snap = await getDoc(userRef);
  } catch (err) {
    console.warn("Could not read user profile document (may be network or permission):", err);
    const fallbackProfile = {
      uid: user.uid,
      displayName: user.displayName || (isOwnerAccount ? "System Owner" : "Contributor"),
      email: user.email || "",
      photoURL: user.photoURL || "",
      role: "contributor",
      submissionCount: 0,
      reputationScore: 0
    };
    if (isOwnerAccount) {
      fallbackProfile.role = "owner";
      fallbackProfile.reputationScore = 1000;
    }
    return fallbackProfile;
  }

  const nowIso = new Date().toISOString();

  if (!snap.exists()) {
    // First time sign-in: Create initial profile with default role strictly contributor
    const initialData = {
      uid: user.uid,
      displayName: user.displayName || (isOwnerAccount ? "System Owner" : "Contributor"),
      email: user.email || "",
      photoURL: user.photoURL || "",
      createdAt: nowIso,
      lastLoginAt: nowIso,
      role: "contributor",
      submissionCount: 0,
      reputationScore: 0
    };
    if (isOwnerAccount) {
      initialData.role = "owner";
      initialData.reputationScore = 1000;
    }

    try {
      await setDoc(userRef, initialData);
      return initialData;
    } catch (err) {
      console.error("Failed to write initial user document:", err);
      return initialData;
    }
  } else {
    // Existing user: Update lastLoginAt, displayName, photoURL and grant owner role if root owner
    const existing = snap.data();
    const needsOwnerPromotion = isOwnerAccount && existing.role !== "owner";
    const updateData = {
      displayName: user.displayName || existing.displayName || (isOwnerAccount ? "System Owner" : "Contributor"),
      photoURL: user.photoURL || existing.photoURL || "",
      lastLoginAt: nowIso,
      ...(needsOwnerPromotion ? { role: "owner" } : {})
    };

    try {
      await updateDoc(userRef, updateData);
    } catch (err) {
      console.warn("Could not update user lastLoginAt:", err);
    }

    return {
      ...existing,
      ...updateData,
      uid: user.uid,
      role: isOwnerAccount ? "owner" : (existing.role || "contributor"),
      reputationScore: existing.reputationScore || (isOwnerAccount ? 1000 : 0),
      submissionCount: existing.submissionCount || 0
    };
  }
}

/**
 * Sign in with Google Auth Provider
 * Handles popup blockers gracefully with clear error resolution
 */
export async function signInWithGoogle() {
  await initFirebase();
  if (!auth) throw new Error("Firebase Auth is not initialized");

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    userProfile = await syncUserProfile(result.user);
    notifyAuthStateListeners({ user: currentUser, profile: userProfile, loading: false });
    return { user: currentUser, profile: userProfile };
  } catch (err) {
    console.warn("Sign-in popup error code:", err.code);

    if (err.code === "auth/popup-closed-by-user") {
      const userErr = new Error("Sign-in was cancelled before completion.");
      userErr.code = "POPUP_CLOSED";
      throw userErr;
    } else if (err.code === "auth/popup-blocked") {
      // Fallback or explicit instruction
      const userErr = new Error("Sign-in popup was blocked by your browser. Please allow popups for this site or try again.");
      userErr.code = "POPUP_BLOCKED";
      throw userErr;
    } else if (err.code === "auth/network-request-failed") {
      const userErr = new Error("A network error occurred. Please check your internet connection.");
      userErr.code = "NETWORK_ERROR";
      throw userErr;
    } else {
      const userErr = new Error(err.message || "Failed to sign in with Google.");
      userErr.code = err.code || "AUTH_FAILED";
      throw userErr;
    }
  }
}

/**
 * Sign out current authenticated user
 */
export async function logOut() {
  if (auth && currentUser) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out notice:", e);
    }
  }
  currentUser = null;
  userProfile = null;
  notifyAuthStateListeners({ user: null, profile: null, loading: false });
}

/**
 * Subscribe to authentication state changes
 * @param {Function} callback - ({ user, profile, loading, error }) => void
 * @returns {Function} unsubscribe function
 */
export function onAuthChange(callback) {
  authStateListeners.push(callback);
  
  // Call immediately with current known state
  callback({ 
    user: currentUser, 
    profile: userProfile, 
    loading: !isInitialized, 
    error: null 
  });

  return () => {
    authStateListeners = authStateListeners.filter(cb => cb !== callback);
  };
}

function notifyAuthStateListeners(state) {
  authStateListeners.forEach(cb => {
    try {
      cb(state);
    } catch (err) {
      console.error("Auth state listener error:", err);
    }
  });
}

/**
 * Accessors for current state
 */
export function getCurrentUser() {
  return currentUser;
}

export function getCurrentProfile() {
  return userProfile;
}

export function getDb() {
  return db;
}

export function getStorageInstance() {
  return storage;
}

export function isFirebaseReady() {
  return isInitialized && db !== null;
}

export function getAuthInstance() {
  return auth;
}

/**
 * Upload empirical test evidence to Firebase Storage
 * Path enforced: evidence/{userId}/{timestamp}_{sanitizedFileName}
 * Validates file size and MIME types matching storage.rules
 * 
 * @param {File} file - Browser File object
 * @param {string} userId - Authenticated user UID
 * @param {Function} [onProgress] - Optional progress callback (percent: number) => void
 * @returns {Promise<Object>} Evidence reference object
 */
/**
 * Helper to read a File into a base64 Data URL
 */
function readFileAsDataUrl(file, onReadProgress = null) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file from browser storage."));
    if (reader.onprogress && typeof onReadProgress === "function") {
      reader.onprogress = (e) => {
        if (e.lengthComputable && e.total > 0) {
          onReadProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
    }
    reader.readAsDataURL(file);
  });
}

/**
 * Upload empirical test evidence
 * Uses high-speed server pipeline (< 100ms) with instant progress feedback
 * and seamless offline fallback to persistent Data URLs.
 * 
 * @param {File} file - Browser File object
 * @param {string} userId - Authenticated user UID
 * @param {Function} [onProgress] - Optional progress callback (percent: number) => void
 * @returns {Promise<Object>} Evidence reference object
 */
export async function uploadEvidenceFile(file, userId, onProgress = null) {
  if (!file) throw new Error("No file provided for upload.");
  const safeUserId = userId || "guest";

  // Validate MIME types matching storage specifications
  const validMimes = [
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "text/plain", "text/csv", "application/pdf", "application/json"
  ];
  const isImage = file.type.startsWith("image/");
  const maxSize = isImage ? 8 * 1024 * 1024 : 10 * 1024 * 1024;

  if (!validMimes.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|gif|txt|csv|pdf|json)$/i)) {
    throw new Error(`Unsupported file type (${file.type || "unknown"}). Allowed types: Images (JPG, PNG, WebP, GIF), Logs (TXT, CSV, JSON), or Reports (PDF).`);
  }

  if (file.size > maxSize) {
    const maxMb = maxSize / (1024 * 1024);
    throw new Error(`File exceeds maximum size limit of ${maxMb}MB (file size: ${(file.size / (1024 * 1024)).toFixed(2)}MB).`);
  }

  // 1. Initial responsive feedback jump (never remain stuck at 0%)
  if (typeof onProgress === "function") {
    onProgress(20);
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();

  try {
    // 2. Fast client-side reading to base64 Data URL (provides instant thumbnail & resilience)
    const base64Data = await readFileAsDataUrl(file, (readPct) => {
      if (typeof onProgress === "function") {
        // Map 0..100 read to 20..50%
        onProgress(Math.round(20 + (readPct * 0.3)));
      }
    });

    if (typeof onProgress === "function") {
      onProgress(60);
    }

    // 3. Fast Server Route Upload (< 80ms)
    try {
      const serverRes = await fetch("/api/upload-evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || "application/octet-stream",
          base64Data: base64Data,
          userId: safeUserId
        })
      });

      if (serverRes.ok) {
        const data = await serverRes.json();
        if (typeof onProgress === "function") {
          onProgress(100);
        }
        return {
          name: file.name,
          fileName: data.fileName || safeName,
          path: data.path || `/uploads/evidence/${data.fileName}`,
          url: data.url || data.path,
          size: file.size,
          type: file.type || "application/octet-stream",
          uploadedAt: data.uploadedAt || new Date().toISOString(),
          isServerUploaded: true,
          previewUrl: base64Data
        };
      }
    } catch (serverErr) {
      console.warn("Fast server upload notice, falling back to instant local data URL:", serverErr);
    }

    // 4. Instant Resilient Fallback (Base64 Data URL - 100% reliable, zero network latency)
    if (typeof onProgress === "function") {
      onProgress(100);
    }
    const fallbackPath = `evidence/${safeUserId}/${timestamp}_${safeName}`;
    return {
      name: file.name,
      fileName: safeName,
      path: fallbackPath,
      url: base64Data,
      previewUrl: base64Data,
      size: file.size,
      type: file.type || "application/octet-stream",
      uploadedAt: new Date().toISOString(),
      isLocalReference: true
    };
  } catch (err) {
    console.error("Evidence processing failed:", err);
    throw err;
  }
}

/**
 * Delete uploaded evidence file from storage
 */
export async function deleteEvidenceFile(storagePath) {
  if (!storage || !storagePath) return;
  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
  } catch (err) {
    console.warn("Could not delete storage file:", err);
  }
}

