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

// ... same file unchanged until relevant functions
