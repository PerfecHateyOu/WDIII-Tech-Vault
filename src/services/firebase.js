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
