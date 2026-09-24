import { queryPendingSubmissions } from "./community-submissions-service.js";

const REVIEWABLE_STATUSES = new Set(["approved", "rejected", "needs_revision", "pending_review"]);

function requireModerator(fb) {
  const user = fb?.getCurrentUser?.();
  if (!user || user.isVisitor) {
    const error = new Error("Authentication is required for moderation.");
    error.code = "AUTH_REQUIRED";
    throw error;
  }
  const profile = fb.getCurrentProfile?.();
  const role = profile?.role;
  if (!(["moderator", "admin", "owner"].includes(role) || fb.isSystemOwner?.(user))) {
    const error = new Error("Moderator authorization is required.");
    error.code = "MODERATOR_REQUIRED";
    throw error;
  }
  return user;
}

/**
 * Paginated moderation queue facade. The Firestore rules remain authoritative;
 * this helper only provides a consistent UI/service API and error taxonomy.
 */
export async function getModerationQueue({ fb, fs, cursor = null, pageSize = 25 } = {}) {
  requireModerator(fb);
  return queryPendingSubmissions({ fb, fs, cursor, pageSize });
}

export async function reviewSubmission({ fb, fs, submissionId, decision } = {}) {
  const moderator = requireModerator(fb);
  const validated = validateModerationDecision(decision);
  const db = fb.getDb?.();
  if (!db || !fs?.runTransaction) {
    const error = new Error("Firestore moderation writes are unavailable.");
    error.code = "FIRESTORE_UNAVAILABLE";
    throw error;
  }
  if (!submissionId) {
    const error = new Error("A submission ID is required.");
    error.code = "SUBMISSION_ID_REQUIRED";
    throw error;
  }

  const submissionRef = fs.doc(db, "submissions", submissionId);
  const auditRef = fs.doc(db, "admin_audit_logs", `${submissionId}_${Date.now()}`);
  await fs.runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(submissionRef);
    if (!snapshot.exists()) {
      const error = new Error("Submission was not found.");
      error.code = "SUBMISSION_NOT_FOUND";
      throw error;
    }
    const current = snapshot.data();
    if (current.status === "approved") {
      const error = new Error("Approved submissions cannot be modified.");
      error.code = "IMMUTABLE_RECORD";
      throw error;
    }
    const now = fs.serverTimestamp();
    transaction.update(submissionRef, {
      status: validated.status,
      reviewerId: moderator.uid,
      reviewedAt: now,
      review: validated.reason,
      reviewNotes: validated.reason,
      updatedAt: now
    });
    transaction.set(auditRef, {
      action: "submission_review",
      actorId: moderator.uid,
      targetSubmissionId: submissionId,
      previousStatus: current.status,
      newStatus: validated.status,
      reason: validated.reason,
      timestamp: now
    });
  });
  return { success: true, id: submissionId, status: validated.status };
}

/**
 * Validate review input before the write path. A production deployment should
 * execute the submission update and audit-log append in a trusted transaction.
 */
export function validateModerationDecision(decision = {}) {
  if (!REVIEWABLE_STATUSES.has(decision.status)) {
    const error = new Error("Invalid moderation status.");
    error.code = "INVALID_REVIEW_STATUS";
    throw error;
  }
  if (["rejected", "needs_revision"].includes(decision.status) &&
      String(decision.reason || decision.feedback || "").trim().length < 3) {
    const error = new Error("A reason is required for rejection or revision requests.");
    error.code = "REVIEW_REASON_REQUIRED";
    throw error;
  }
  return {
    status: decision.status,
    reason: String(decision.reason || decision.feedback || "").trim().slice(0, 5000)
  };
}
