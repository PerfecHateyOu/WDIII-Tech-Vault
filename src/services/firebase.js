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

export function buildDefaultUserProfile(profile = {}) {
  return {
    ...profile,
    role: "contributor",
    reputationScore: 0
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
  return email === "perfectshadowkai33@gmail.com" || user.role === "owner" || user.uid === "owner-root";
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
  currentUser = {
    uid: "google-user-1",
    displayName: "Google Contributor",
    email: "researcher@wdiii.local",
    photoURL: "",
    isVisitor: false,
    role: "contributor"
  };
  userProfile = buildDefaultUserProfile({
    uid: currentUser.uid,
    displayName: currentUser.displayName,
    email: currentUser.email,
    photoURL: currentUser.photoURL,
    role: "contributor",
    isVisitor: false
  });
  isInitialized = true;
  notifyAuthListeners();
  return { user: currentUser, profile: userProfile };
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
  userProfile = {
    uid: currentUser.uid,
    displayName: currentUser.displayName,
    email: currentUser.email,
    photoURL: currentUser.photoURL,
    role: "visitor",
    isVisitor: true,
    reputationScore: 0
  };
  isInitialized = true;
  notifyAuthListeners();
  return { user: currentUser, profile: userProfile };
}

export async function logOut() {
  currentUser = null;
  userProfile = null;
  isInitialized = true;
  notifyAuthListeners();
  return true;
}

export function onAuthChange(callback) {
  if (typeof callback !== "function") return () => {};
  authStateListeners.push(callback);
  callback({ user: currentUser, profile: userProfile, loading: false });
  return () => {
    authStateListeners = authStateListeners.filter(fn => fn !== callback);
  };
}
