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

export const DEFAULT_USER_ROLE = "contributor";
export const INITIAL_REPUTATION_SCORE = 0;
export const SYSTEM_OWNER_EMAIL = "perfectshadowkai33@gmail.com";

export function buildDefaultUserProfile(profile = {}) {
  return {
    ...profile,
    role: profile.role || DEFAULT_USER_ROLE,
    reputationScore: profile.reputationScore ?? INITIAL_REPUTATION_SCORE
  };
}

export function ensureUserProfileDefaults(profile = {}) {
  const normalized = { ...profile };
  if (!normalized.role) normalized.role = "contributor";
  if (normalized.reputationScore === undefined) normalized.reputationScore = 0;
  return normalized;
}

export function isSystemOwner(user = null) {
  if (!user) return false;
  const email = String(user.email || user.profile?.email || "").toLowerCase();
  return email === SYSTEM_OWNER_EMAIL || user.role === "owner" || user.uid === "owner-root";
}

async function fetchConfig() {
  const response = await fetch("/api/firebase-config");
  if (!response.ok) throw new Error(`Failed to load Firebase configuration: HTTP ${response.status}`);
  return response.json();
}

export async function initFirebase() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const config = await fetchConfig();
      if (!config?.apiKey || !config?.projectId) throw new Error("Invalid Firebase configuration.");
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
      await setPersistence(auth, browserLocalPersistence).catch(() => {});
      db = config.firestoreDatabaseId && config.firestoreDatabaseId !== "(default)"
        ? getFirestore(app, config.firestoreDatabaseId)
        : getFirestore(app);
      if (config.storageBucket) storage = getStorage(app);

      onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        userProfile = user ? await syncUserProfile(user) : null;
        isInitialized = true;
        notifyAuthListeners();
      });
      await getRedirectResult(auth).catch(() => null);
      isInitialized = true;
      notifyAuthListeners();
      return { app, auth, db, storage };
    } catch (error) {
      isInitialized = true;
      notifyAuthListeners();
      throw error;
    }
  })();
  return initPromise;
}

export async function syncUserProfile(user) {
  if (!db || !user) return null;
  const profileRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(profileRef);
  const existing = snapshot.exists() ? snapshot.data() : {};
  const profile = ensureUserProfileDefaults({
    uid: user.uid,
    displayName: user.displayName || "Contributor",
    email: user.email || "",
    photoURL: user.photoURL || "",
    ...existing,
    role: "contributor",
    lastLoginAt: new Date().toISOString()
  });
  if (existing.role) profile.role = existing.role;
  if (isSystemOwner(user)) profile.role = "owner";
  await setDoc(profileRef, { ...profile, uid: user.uid }, { merge: true });
  return profile;
}

export function getDb() {
  return db;
}

export function getCurrentUser() {
  return currentUser;
}

export function getCurrentProfile() {
  return userProfile;
}

export function isFirebaseReady() {
  return Boolean(db) && isInitialized;
}

function notifyAuthListeners() {
  for (const listener of authStateListeners) {
    try {
      listener({ user: currentUser, profile: userProfile, loading: false });
    } catch (err) {
      console.warn("Auth listener failed:", err);
    }
  }
}

export async function signInWithGoogle() {
  await initFirebase();
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    userProfile = await syncUserProfile(currentUser);
    notifyAuthListeners();
    return { user: currentUser, profile: userProfile };
  } catch (error) {
    await signInWithRedirect(auth, provider);
    return null;
  }
}

export async function signInAsVisitor() {
  currentUser = {
    uid: "visitor-" + Date.now(),
    displayName: "Guest Contributor",
    email: "guest@wdiii.vault",
    photoURL: "",
    isVisitor: true,
    role: "visitor"
  };
  userProfile = buildDefaultUserProfile({
    uid: currentUser.uid,
    displayName: currentUser.displayName,
    email: currentUser.email,
    photoURL: currentUser.photoURL,
    role: "visitor",
    isVisitor: true,
    reputationScore: 0
  });
  isInitialized = true;
  notifyAuthListeners();
  return { user: currentUser, profile: userProfile };
}

export async function logOut() {
  if (auth && currentUser && !currentUser.isVisitor) await signOut(auth);
  currentUser = null;
  userProfile = null;
  isInitialized = true;
  notifyAuthListeners();
  return true;
}

export function getStorageInstance() {
  return storage;
}

export async function uploadEvidenceFile(file, userId, onProgress = null) {
  if (!file || !userId || !storage) {
    const error = new Error("Evidence upload is unavailable until Firebase Storage is ready.");
    error.code = "EVIDENCE_UPLOAD_UNAVAILABLE";
    throw error;
  }
  const validTypes = new Set([
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "text/plain", "text/csv", "application/pdf", "application/json"
  ]);
  const isImage = file.type.startsWith("image/");
  const maxSize = (isImage ? 8 : 10) * 1024 * 1024;
  if (!validTypes.has(file.type) || file.size > maxSize) {
    const error = new Error("Evidence file type or size is not permitted.");
    error.code = "INVALID_EVIDENCE_FILE";
    throw error;
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `evidence/${userId}/${Date.now()}_${safeName}`;
  const task = uploadBytesResumable(ref(storage, path), file, { contentType: file.type });
  const result = await new Promise((resolve, reject) => {
    task.on("state_changed", (snapshot) => {
      if (typeof onProgress === "function" && snapshot.totalBytes) {
        onProgress(Math.round(snapshot.bytesTransferred / snapshot.totalBytes * 100));
      }
    }, reject, async () => resolve(await getDownloadURL(task.snapshot.ref)));
  });
  return { name: file.name, fileName: safeName, path, url: result, size: file.size, type: file.type };
}

export async function deleteEvidenceFile(storagePath) {
  if (!storage || !storagePath) return;
  await deleteObject(ref(storage, storagePath));
}

export function onAuthChange(callback) {
  if (typeof callback !== "function") return () => {};
  authStateListeners.push(callback);
  callback({ user: currentUser, profile: userProfile, loading: false });
  return () => {
    authStateListeners = authStateListeners.filter(fn => fn !== callback);
  };
}
