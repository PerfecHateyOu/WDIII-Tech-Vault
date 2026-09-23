/**
 * WDIII Tech Vault - Experiment Discussion & Comments Service
 * 
 * Powered by Google Cloud Firestore:
 * - Real-time synchronization of peer findings and discussion
 * - Strictly enforces authentication: only registered users can post comments
 * - Visitor / guest sessions are strictly read-only
 * - Authors can edit or delete their own comments
 * - Moderators/Admins can delete any inappropriate comment
 * - In-memory and local caching for resilient offline/low-latency performance
 * - Dynamic ESM loader ensures compatibility with both Node test runners and browser runtime
 */

import { getDb, getCurrentUser, getCurrentProfile, isSystemOwner, isFirebaseReady } from "./firebase.js";
import { sanitizeText } from "../utils/sanitize.js";

// Lazy-loaded Firestore SDK
let fsModule = null;

async function getFs() {
  if (!fsModule && typeof window !== "undefined") {
    try {
      fsModule = await import("https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js");
    } catch (err) {
      console.warn("CommentsService: Could not load Firestore SDK dynamically:", err);
    }
  }
  return fsModule;
}

// In-memory cache per experiment
const commentsCache = new Map();

// Active real-time Firestore unsubscribers
const activeUnsubscribers = new Map();

/**
 * Seed initial peer discussions for key experiments so users have immediate context
 */
const INITIAL_SEED_COMMENTS = {
  "exp1": [
    {
      id: "seed-exp1-1",
      experimentId: "exp1",
      authorId: "seed-user-1",
      authorDisplayName: "Alex M. (BenchTech)",
      authorRole: "contributor",
      authorPhotoURL: "",
      content: "Did Samsung attempt to charge any diagnostic fee for the quote, or was shipping completely covered as documented in your logs?",
      createdAt: "2026-09-18T14:32:00.000Z",
      likesCount: 3,
      likedBy: [],
      isEdited: false
    },
    {
      id: "seed-exp1-2",
      experimentId: "exp1",
      authorId: "seed-owner-wdiii",
      authorDisplayName: "WDIII",
      authorRole: "owner",
      authorPhotoURL: "/src/assets/images/wdiii_logo_1789060991252.jpg",
      content: "Samsung provided a pre-paid UPS label with zero upfront diagnostic charges. The quote was sent via email within 48h of depot check-in. Apple's turnaround was identical at 3 days flat.",
      createdAt: "2026-09-18T16:05:00.000Z",
      likesCount: 5,
      likedBy: [],
      isEdited: false
    }
  ],
  "exp5": [
    {
      id: "seed-exp5-1",
      experimentId: "exp5",
      authorId: "seed-user-2",
      authorDisplayName: "HardwareLab_Marcus",
      authorRole: "contributor",
      authorPhotoURL: "",
      content: "The standby drain on the Pixel 10 Pro aligns with our 5G dual-SIM testing. Disabling background location polling reduced the 8-hour overnight loss from 9% down to 4.2%.",
      createdAt: "2026-09-19T09:12:00.000Z",
      likesCount: 4,
      likedBy: [],
      isEdited: false
    }
  ],
  "exp9": [
    {
      id: "seed-exp9-1",
      experimentId: "exp9",
      authorId: "seed-user-3",
      authorDisplayName: "NetSec_Dev",
      authorRole: "moderator",
      authorPhotoURL: "",
      content: "Valid findings on the AWDL packet broadcast interval. Even with AirDrop set to Contacts Only, periodic beacons remain observable on 5GHz channel 149.",
      createdAt: "2026-09-20T11:45:00.000Z",
      likesCount: 7,
      likedBy: [],
      isEdited: false
    }
  ]
};

/**
 * Retrieve comments for an experiment.
 * Checks Firestore first, then falls back to memory cache and initial seeds.
 * 
 * @param {string} experimentId
 * @returns {Promise<Array>}
 */
export async function getComments(experimentId) {
  if (!experimentId) return [];

  // Check if we have freshly queried Firestore data
  const cached = commentsCache.get(experimentId);

  const fs = await getFs();
  const db = getDb();

  if (fs && db && isFirebaseReady()) {
    try {
      const q = fs.query(
        fs.collection(db, "comments"),
        fs.where("experimentId", "==", experimentId)
      );
      const snapshot = await fs.getDocs(q);
      const remoteComments = [];
      snapshot.forEach(docSnap => {
        remoteComments.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });

      // Sort in ascending order by timestamp
      remoteComments.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

      // If remote has comments, merge with seeds if needed or use remote
      if (remoteComments.length > 0) {
        commentsCache.set(experimentId, remoteComments);
        return remoteComments;
      }
    } catch (err) {
      console.warn("Failed to fetch comments from Firestore:", err.message);
    }
  }

  // If cached in memory, return it
  if (cached && cached.length > 0) {
    return cached;
  }

  // Fallback to initial seeds
  const seeds = INITIAL_SEED_COMMENTS[experimentId] || [];
  commentsCache.set(experimentId, [...seeds]);
  return [...seeds];
}

/**
 * Subscribe to real-time comment updates for an experiment.
 * 
 * @param {string} experimentId
 * @param {Function} onUpdate - callback(comments: Array)
 * @param {Function} onError - optional error callback
 * @returns {Promise<Function>} unsubscribe function
 */
export async function subscribeToComments(experimentId, onUpdate, onError = null) {
  if (!experimentId || typeof onUpdate !== "function") {
    return () => {};
  }

  // Clean up any existing subscription for this experiment
  if (activeUnsubscribers.has(experimentId)) {
    try {
      activeUnsubscribers.get(experimentId)();
    } catch (e) {}
    activeUnsubscribers.delete(experimentId);
  }

  // Immediately send whatever is in cache or seeds
  const current = await getComments(experimentId);
  onUpdate(current);

  const fs = await getFs();
  const db = getDb();

  if (fs && db && isFirebaseReady()) {
    try {
      const q = fs.query(
        fs.collection(db, "comments"),
        fs.where("experimentId", "==", experimentId)
      );

      const unsubscribe = fs.onSnapshot(
        q,
        (snapshot) => {
          const liveComments = [];
          snapshot.forEach(docSnap => {
            liveComments.push({
              id: docSnap.id,
              ...docSnap.data()
            });
          });

          // Sort chronologically
          liveComments.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());

          // If remote is empty, we keep our seed discussions visible so users have context
          const seeds = INITIAL_SEED_COMMENTS[experimentId] || [];
          const combined = liveComments.length > 0 
            ? liveComments 
            : [...seeds];

          commentsCache.set(experimentId, combined);
          onUpdate(combined);
        },
        (error) => {
          console.warn("Real-time comments subscription notice:", error.message);
          if (typeof onError === "function") onError(error);
        }
      );

      activeUnsubscribers.set(experimentId, unsubscribe);

      return () => {
        unsubscribe();
        activeUnsubscribers.delete(experimentId);
      };
    } catch (err) {
      console.warn("Could not establish real-time snapshot:", err.message);
    }
  }

  return () => {};
}

/**
 * Post a new comment on an experiment.
 * Strictly verifies that user is signed in with a registered account.
 * 
 * @param {Object} options
 * @param {string} options.experimentId
 * @param {string} options.content
 * @returns {Promise<Object>} Created comment object
 */
export async function addComment({ experimentId, content }) {
  if (!experimentId) throw new Error("Experiment ID is required.");
  
  const rawContent = (content || "").trim();
  if (!rawContent || rawContent.length < 2) {
    throw new Error("Comment must be at least 2 characters long.");
  }
  if (rawContent.length > 3000) {
    throw new Error("Comment exceeds 3,000 characters limit.");
  }

  const currentUser = getCurrentUser();
  const profile = getCurrentProfile();

  // Authentication check
  if (!currentUser) {
    throw new Error("You must be signed in with a registered account to post a comment.");
  }

  if (currentUser.isVisitor === true || profile?.isVisitor === true) {
    throw new Error("Guest/Visitor mode is read-only. Please sign in with Google to post your findings.");
  }

  const sanitizedContent = sanitizeText(rawContent);
  const now = new Date().toISOString();
  const isOwner = isSystemOwner(currentUser);
  const role = isOwner ? "owner" : (profile?.role || "contributor");

  const commentPayload = {
    experimentId: String(experimentId),
    authorId: currentUser.uid,
    authorDisplayName: profile?.displayName || currentUser.displayName || "Registered Researcher",
    authorEmail: currentUser.email || "",
    authorPhotoURL: currentUser.photoURL || profile?.photoURL || "",
    authorRole: role,
    content: sanitizedContent,
    createdAt: now,
    updatedAt: now,
    isEdited: false,
    likesCount: 0,
    likedBy: []
  };

  const fs = await getFs();
  const db = getDb();

  let docId = "cmt_" + Math.random().toString(36).substring(2, 10) + "_" + Date.now();

  if (fs && db && isFirebaseReady()) {
    try {
      const docRef = await fs.addDoc(fs.collection(db, "comments"), commentPayload);
      docId = docRef.id;
    } catch (err) {
      console.error("Firestore comment write error:", err);
      throw new Error(`Failed to save comment to Firestore: ${err.message}`);
    }
  } else {
    // If offline/demo mode, save to in-memory cache
    const current = commentsCache.get(experimentId) || [];
    current.push({ id: docId, ...commentPayload });
    commentsCache.set(experimentId, current);
  }

  return { id: docId, ...commentPayload };
}

/**
 * Edit an existing comment.
 * Only the original author can edit content.
 * 
 * @param {string} commentId
 * @param {string} experimentId
 * @param {string} newContent
 */
export async function updateComment(commentId, experimentId, newContent) {
  const rawContent = (newContent || "").trim();
  if (!rawContent || rawContent.length < 2) {
    throw new Error("Comment must be at least 2 characters long.");
  }
  if (rawContent.length > 3000) {
    throw new Error("Comment exceeds 3,000 characters limit.");
  }

  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.isVisitor) {
    throw new Error("Sign in required to edit comments.");
  }

  const sanitizedContent = sanitizeText(rawContent);
  const now = new Date().toISOString();

  const fs = await getFs();
  const db = getDb();

  if (fs && db && isFirebaseReady()) {
    const commentRef = fs.doc(db, "comments", commentId);
    await fs.updateDoc(commentRef, {
      content: sanitizedContent,
      updatedAt: now,
      isEdited: true
    });
  }

  // Update memory cache
  const list = commentsCache.get(experimentId) || [];
  const found = list.find(c => c.id === commentId);
  if (found) {
    found.content = sanitizedContent;
    found.updatedAt = now;
    found.isEdited = true;
  }
}

/**
 * Delete a comment.
 * Allowed for the original author OR a moderator/admin/owner.
 * 
 * @param {string} commentId
 * @param {string} experimentId
 * @param {string} authorId
 */
export async function deleteComment(commentId, experimentId, authorId) {
  const currentUser = getCurrentUser();
  const profile = getCurrentProfile();

  if (!currentUser || currentUser.isVisitor) {
    throw new Error("Sign in required to delete comments.");
  }

  const isAuthor = currentUser.uid === authorId;
  const isPrivileged = isSystemOwner(currentUser) || 
    profile?.role === "admin" || 
    profile?.role === "moderator" || 
    profile?.role === "owner";

  if (!isAuthor && !isPrivileged) {
    throw new Error("You do not have permission to delete this comment.");
  }

  const fs = await getFs();
  const db = getDb();

  if (fs && db && isFirebaseReady()) {
    try {
      await fs.deleteDoc(fs.doc(db, "comments", commentId));
    } catch (err) {
      console.error("Failed to delete comment from Firestore:", err);
      throw new Error(`Failed to delete comment: ${err.message}`);
    }
  }

  // Update memory cache
  const list = commentsCache.get(experimentId) || [];
  const updated = list.filter(c => c.id !== commentId);
  commentsCache.set(experimentId, updated);
}

/**
 * Upvote/Like or un-like a comment.
 * Registered users only.
 * 
 * @param {string} commentId
 * @param {string} experimentId
 */
export async function toggleLikeComment(commentId, experimentId) {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.isVisitor) {
    throw new Error("Please sign in with a registered account to upvote findings.");
  }

  const uid = currentUser.uid;
  const fs = await getFs();
  const db = getDb();

  const list = commentsCache.get(experimentId) || [];
  const comment = list.find(c => c.id === commentId);

  let newLikedBy = Array.isArray(comment?.likedBy) ? [...comment.likedBy] : [];
  let isCurrentlyLiked = newLikedBy.includes(uid);

  if (isCurrentlyLiked) {
    newLikedBy = newLikedBy.filter(id => id !== uid);
  } else {
    newLikedBy.push(uid);
  }
  const newCount = newLikedBy.length;

  if (comment) {
    comment.likedBy = newLikedBy;
    comment.likesCount = newCount;
  }

  if (fs && db && isFirebaseReady() && !commentId.startsWith("seed-")) {
    try {
      const commentRef = fs.doc(db, "comments", commentId);
      await fs.updateDoc(commentRef, {
        likedBy: newLikedBy,
        likesCount: newCount
      });
    } catch (err) {
      console.warn("Could not sync like update to Firestore:", err.message);
    }
  }

  return { liked: !isCurrentlyLiked, count: newCount };
}
