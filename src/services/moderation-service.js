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
