/**
 * WDIII Community Research Hub - My Submissions (Contributor Portfolio)
 * Route: #/my-tests
 *
 * Gives contributors an in-app way to see the outcome of their replication
 * submissions, including moderator feedback on a "needs_revision" decision,
 * and a path to act on it (submit a corrected replication, or withdraw a
 * still-pending one).
 */

import {
  getUserSubmissions,
  withdrawSubmission,
  getExperimentById,
  getDeviceById
} from "../services/database.js";
import {
  getCurrentUser,
  signInWithGoogle
} from "../services/firebase.js";
import { escapeHtml } from "../utils/sanitize.js";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const STATUS_META = {
  pending_review: { label: "Awaiting Review", color: "var(--td-info)", icon: "⏳" },
  pending: { label: "Awaiting Review", color: "var(--td-info)", icon: "⏳" },
  needs_revision: { label: "Needs Revision", color: "var(--td-warning, #f59e0b)", icon: "✏️" },
  approved: { label: "Approved", color: "var(--td-success, #34d399)", icon: "✓" },
  rejected: { label: "Rejected", color: "var(--td-error, #f87171)", icon: "✕" },
  withdrawn: { label: "Withdrawn", color: "var(--td-text-muted)", icon: "↩" }
};

function statusBadge(status) {
  const meta = STATUS_META[status] || { label: status || "Unknown", color: "var(--td-text-muted)", icon: "•" };
  return `<span style="display:inline-flex; align-items:center; gap:0.3rem; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; padding:0.2rem 0.6rem; border-radius:9999px; border:1px solid ${meta.color}; color:${meta.color};">${meta.icon} ${escapeHtml(meta.label)}</span>`;
}

/**
 * Main entry point for #/my-tests
 */
export async function renderMySubmissionsView(container) {
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center; padding:4rem 1rem; color:var(--td-text-muted);">
      <div style="font-size:2.5rem; margin-bottom:1rem;">📋</div>
      <div style="font-size:1.1rem; font-weight:600; color:var(--td-text-primary);">Loading your submissions...</div>
    </div>
  `;

  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.isVisitor) {
    renderAuthPrompt(container);
    return;
  }

  const state = {
    submissions: [],
    experimentCache: new Map(),
    deviceCache: new Map(),
    actionError: null,
    withdrawingId: null
  };

  try {
    state.submissions = await getUserSubmissions();
  } catch (err) {
    console.error("Could not load your submissions:", err);
  }

  state.submissions.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  await hydrateReferences(state);
  render(container, state);
}

async function hydrateReferences(state) {
  const lookups = [];
  for (const submission of state.submissions) {
    if (submission.experimentId && !state.experimentCache.has(submission.experimentId)) {
      lookups.push(
        getExperimentById(submission.experimentId)
          .then(exp => state.experimentCache.set(submission.experimentId, exp))
          .catch(() => state.experimentCache.set(submission.experimentId, null))
      );
    }
    if (submission.deviceId && !state.deviceCache.has(submission.deviceId)) {
      lookups.push(
        getDeviceById(submission.deviceId)
          .then(dev => state.deviceCache.set(submission.deviceId, dev))
          .catch(() => state.deviceCache.set(submission.deviceId, null))
      );
    }
  }
  await Promise.all(lookups);
}

function renderAuthPrompt(container) {
  container.innerHTML = `
    <div style="max-width:640px; margin:3rem auto; padding:2.5rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; text-align:center; box-shadow:0 12px 32px rgba(0,0,0,0.25);">
      <div style="display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; border-radius:50%; background:rgba(96,165,250,0.12); color:var(--td-info); font-size:2rem; margin-bottom:1.25rem;">
        🔒
      </div>
      <h2 style="color:var(--td-text-primary); font-size:1.6rem; font-weight:700; margin-bottom:0.5rem;">
        Authentication Required
      </h2>
      <p style="color:var(--td-text-secondary); font-size:0.98rem; line-height:1.6; max-width:480px; margin:0 auto 1.75rem;">
        Sign in to view the status of your community replication submissions and any moderator feedback.
      </p>
      <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
        <button id="btnMySubmissionsSignIn" style="display:inline-flex; align-items:center; gap:0.625rem; padding:0.65rem 1.6rem; background:var(--td-info); color:#fff; font-weight:600; font-size:0.95rem; border-radius:0.375rem; border:none; cursor:pointer;">
          Sign In with Google
        </button>
        <a href="#/" style="display:inline-flex; align-items:center; padding:0.65rem 1.25rem; background:transparent; border:1px solid var(--td-border); color:var(--td-text-secondary); border-radius:0.375rem; text-decoration:none; font-size:0.95rem;">
          Return to Tech Vault
        </a>
      </div>
    </div>
  `;

  const signInBtn = container.querySelector("#btnMySubmissionsSignIn");
  signInBtn?.addEventListener("click", async () => {
    try {
      signInBtn.disabled = true;
      signInBtn.innerHTML = `<span>Signing in...</span>`;
      await signInWithGoogle();
      // onAuthChange listener in index.html will re-render this view
    } catch (err) {
      console.error("Sign-in failed:", err);
      signInBtn.disabled = false;
      signInBtn.innerHTML = `<span>Sign In with Google</span>`;
      alert("Sign-in was cancelled or encountered an error: " + err.message);
    }
  });
}

function render(container, state) {
  if (!state.submissions.length) {
    container.innerHTML = `
      <div style="max-width:640px; margin:2rem auto; text-align:center; padding:3rem 1.5rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; color:var(--td-text-muted);">
        <div style="font-size:2rem; margin-bottom:0.75rem;">🔬</div>
        <div style="font-weight:600; color:var(--td-text-primary); margin-bottom:0.5rem;">You haven't submitted any replications yet</div>
        <a href="#/devices" style="display:inline-flex; margin-top:0.5rem; padding:0.55rem 1.1rem; background:var(--td-info); color:#fff; border-radius:0.375rem; text-decoration:none; font-size:0.9rem; font-weight:600;">Browse Experiments to Replicate</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="max-width:900px; margin:0 auto; padding:1.5rem;">
      <h1 style="font-size:1.5rem; font-weight:700; color:var(--td-text-primary); margin:0 0 0.25rem;">📋 My Submissions</h1>
      <div style="font-size:0.85rem; color:var(--td-text-muted); margin-bottom:1.25rem;">Status and moderator feedback on your community replications</div>
      ${state.actionError ? `<div style="margin-bottom:1rem; padding:0.75rem 1rem; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.35); border-radius:0.375rem; color:var(--td-error, #f87171); font-size:0.85rem;">${escapeHtml(state.actionError)}</div>` : ""}
      <div id="mySubmissionsList" style="display:flex; flex-direction:column; gap:1rem;"></div>
    </div>
  `;

  const list = container.querySelector("#mySubmissionsList");
  list.innerHTML = state.submissions.map(s => renderCard(s, state)).join("");

  list.querySelectorAll("[data-resubmit-exp]").forEach(link => {
    link.addEventListener("click", () => {
      window.location.hash = `#/replicate/${encodeURIComponent(link.dataset.resubmitExp)}`;
    });
  });

  list.querySelectorAll("[data-withdraw-id]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.withdrawId;
      if (!confirm("Withdraw this submission? This cannot be undone.")) return;

      state.withdrawingId = id;
      state.actionError = null;
      btn.disabled = true;
      btn.textContent = "Withdrawing...";

      try {
        await withdrawSubmission(id);
        state.submissions = state.submissions.map(s => s.id === id ? { ...s, status: "withdrawn" } : s);
      } catch (err) {
        console.error("Withdraw failed:", err);
        state.actionError = err.message || "Could not withdraw this submission.";
      }
      state.withdrawingId = null;
      render(container, state);
    });
  });
}

function renderCard(submission, state) {
  const exp = state.experimentCache.get(submission.experimentId);
  const dev = state.deviceCache.get(submission.deviceId);
  const canWithdraw = ["pending_review", "pending"].includes(submission.status);
  const canResubmit = ["needs_revision", "rejected"].includes(submission.status);

  return `
    <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.25rem;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.75rem; margin-bottom:0.5rem;">
        <div>
          <div style="font-weight:700; color:var(--td-text-primary); font-size:1rem;">${escapeHtml(exp?.title || submission.experimentId || "Unknown Experiment")}</div>
          <div style="font-size:0.82rem; color:var(--td-text-muted);">${escapeHtml(dev ? `${dev.brand} ${dev.model}` : submission.deviceId || "Unknown device")}</div>
        </div>
        ${statusBadge(submission.status)}
      </div>
      <div style="font-size:0.78rem; color:var(--td-text-muted); margin-bottom:0.75rem;">Submitted ${escapeHtml(formatDate(submission.submittedAt || submission.createdAt))}</div>

      ${submission.review?.feedback || submission.reviewNotes ? `
        <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:0.85rem; margin-bottom:0.85rem;">
          <div style="font-size:0.78rem; font-weight:700; color:var(--td-text-primary); margin-bottom:0.25rem;">Moderator Feedback</div>
          <div style="font-size:0.85rem; color:var(--td-text-secondary); line-height:1.5;">${escapeHtml(submission.review?.feedback || submission.reviewNotes)}</div>
          <div style="font-size:0.75rem; color:var(--td-text-muted); margin-top:0.4rem;">— ${escapeHtml(submission.review?.reviewerName || submission.reviewerName || "Moderator")}, ${escapeHtml(formatDate(submission.review?.reviewedAt || submission.reviewedAt))}</div>
        </div>
      ` : ""}

      <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
        ${canResubmit ? `
          <button type="button" data-resubmit-exp="${escapeHtml(submission.experimentId)}" style="padding:0.5rem 1rem; border-radius:0.375rem; font-weight:600; font-size:0.82rem; cursor:pointer; border:none; background:var(--td-info); color:#fff;">
            Submit a Corrected Replication
          </button>
        ` : ""}
        ${canWithdraw ? `
          <button type="button" data-withdraw-id="${escapeHtml(submission.id)}" ${state.withdrawingId === submission.id ? "disabled" : ""} style="padding:0.5rem 1rem; border-radius:0.375rem; font-weight:600; font-size:0.82rem; cursor:pointer; border:1px solid var(--td-border-subtle); background:transparent; color:var(--td-text-secondary);">
            Withdraw
          </button>
        ` : ""}
      </div>
    </div>
  `;
}
