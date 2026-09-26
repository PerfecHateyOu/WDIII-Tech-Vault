/**
 * WDIII Community Research Hub - Moderator Review Workbench
 * Route: #/moderation
 *
 * Implements the moderator-facing half of the submission pipeline:
 *     Pending Review Queue
 *             ↓
 *     Review Details (measurements, conditions, evidence, provenance)
 *             ↓
 *     Approve / Reject / Request Revision (reviewSubmission -> immutable audit log)
 *             ↓
 *     Audit Log (permanent moderation history)
 *
 * Access is restricted to moderators, admins, and the system owner.
 * The underlying security (Firestore rules, reviewSubmission authorization,
 * self-approval prevention) is enforced server-side; this view only gates
 * the UI and surfaces the same rules to the moderator.
 */

import {
  getPendingSubmissions,
  reviewSubmission,
  getAuditLogs,
  getExperimentById,
  getDeviceById
} from "../services/database.js";
import {
  getCurrentUser,
  getCurrentProfile,
  signInWithGoogle,
  isSystemOwner
} from "../services/firebase.js";
import { escapeHtml, sanitizeUrl } from "../utils/sanitize.js";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatFileSize(bytes) {
  if (!bytes || Number.isNaN(bytes)) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function isModeratorRole(profile, user) {
  if (user && isSystemOwner?.(user)) return true;
  return ["moderator", "admin", "owner"].includes(profile?.role);
}

const STATUS_META = {
  pending_review: { label: "Pending Review", color: "var(--td-info)" },
  pending: { label: "Pending Review", color: "var(--td-info)" },
  needs_revision: { label: "Needs Revision", color: "var(--td-warning, #f59e0b)" },
  approved: { label: "Approved", color: "var(--td-success, #34d399)" },
  rejected: { label: "Rejected", color: "var(--td-error, #f87171)" }
};

/**
 * Main entry point for #/moderation
 */
export async function renderModerationView(container) {
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center; padding:4rem 1rem; color:var(--td-text-muted);">
      <div style="font-size:2.5rem; margin-bottom:1rem;">🛡️</div>
      <div style="font-size:1.1rem; font-weight:600; color:var(--td-text-primary); margin-bottom:0.5rem;">
        Loading Moderator Review Workbench...
      </div>
    </div>
  `;

  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.isVisitor) {
    renderAuthPrompt(container);
    return;
  }

  const profile = getCurrentProfile();
  if (!isModeratorRole(profile, currentUser)) {
    renderAccessDenied(container);
    return;
  }

  const state = {
    tab: "queue", // "queue" | "audit"
    submissions: [],
    selectedId: null,
    actionPanel: null, // "approved" | "rejected" | "needs_revision" | null
    actionInFlight: false,
    actionError: null,
    auditLogs: [],
    auditLoaded: false,
    experimentCache: new Map(),
    deviceCache: new Map()
  };

  try {
    state.submissions = await getPendingSubmissions();
  } catch (err) {
    console.error("Could not load pending submissions:", err);
  }

  await hydrateReferences(state);

  if (state.submissions.length && !state.selectedId) {
    state.selectedId = state.submissions[0].id;
  }

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
        The Moderator Review Workbench requires an authenticated account with moderator, admin, or owner privileges.
      </p>
      <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
        <button id="btnModerationSignIn" style="display:inline-flex; align-items:center; gap:0.625rem; padding:0.65rem 1.6rem; background:var(--td-info); color:#fff; font-weight:600; font-size:0.95rem; border-radius:0.375rem; border:none; cursor:pointer;">
          Sign In with Google
        </button>
        <a href="#/" style="display:inline-flex; align-items:center; padding:0.65rem 1.25rem; background:transparent; border:1px solid var(--td-border); color:var(--td-text-secondary); border-radius:0.375rem; text-decoration:none; font-size:0.95rem;">
          Return to Tech Vault
        </a>
      </div>
    </div>
  `;

  const signInBtn = container.querySelector("#btnModerationSignIn");
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

function renderAccessDenied(container) {
  container.innerHTML = `
    <div style="max-width:640px; margin:3rem auto; padding:2.5rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; text-align:center; box-shadow:0 12px 32px rgba(0,0,0,0.25);">
      <div style="display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; border-radius:50%; background:rgba(239,68,68,0.12); color:var(--td-error, #f87171); font-size:2rem; margin-bottom:1.25rem;">
        ⛔
      </div>
      <h2 style="color:var(--td-text-primary); font-size:1.6rem; font-weight:700; margin-bottom:0.5rem;">
        Moderator Access Required
      </h2>
      <p style="color:var(--td-text-secondary); font-size:0.98rem; line-height:1.6; max-width:480px; margin:0 auto 1.75rem;">
        Your account does not currently hold moderator, admin, or owner privileges. Community submission review is restricted to verified WDIII moderators.
      </p>
      <a href="#/" style="display:inline-flex; align-items:center; padding:0.65rem 1.25rem; background:transparent; border:1px solid var(--td-border); color:var(--td-text-secondary); border-radius:0.375rem; text-decoration:none; font-size:0.95rem;">
        Return to Tech Vault
      </a>
    </div>
  `;
}

function statusBadge(status) {
  const meta = STATUS_META[status] || { label: status || "Unknown", color: "var(--td-text-muted)" };
  return `<span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; padding:0.15rem 0.55rem; border-radius:9999px; border:1px solid ${meta.color}; color:${meta.color};">${escapeHtml(meta.label)}</span>`;
}

function render(container, state) {
  const queueCount = state.submissions.length;

  container.innerHTML = `
    <div style="max-width:1180px; margin:0 auto; padding:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.25rem;">
        <div>
          <h1 style="font-size:1.5rem; font-weight:700; color:var(--td-text-primary); margin:0 0 0.25rem;">🛡️ Moderator Review Workbench</h1>
          <div style="font-size:0.85rem; color:var(--td-text-muted);">Community Research Hub — moderation queue and immutable audit trail</div>
        </div>
        <div style="display:flex; gap:0.5rem;">
          <button type="button" data-tab="queue" class="td-mod-tab" style="padding:0.5rem 1rem; border-radius:0.375rem; font-weight:600; font-size:0.85rem; cursor:pointer; border:1px solid var(--td-border-subtle); background:${state.tab === "queue" ? "var(--td-info)" : "var(--td-bg-card)"}; color:${state.tab === "queue" ? "#fff" : "var(--td-text-secondary)"};">
            Pending Queue (${queueCount})
          </button>
          <button type="button" data-tab="audit" class="td-mod-tab" style="padding:0.5rem 1rem; border-radius:0.375rem; font-weight:600; font-size:0.85rem; cursor:pointer; border:1px solid var(--td-border-subtle); background:${state.tab === "audit" ? "var(--td-info)" : "var(--td-bg-card)"}; color:${state.tab === "audit" ? "#fff" : "var(--td-text-secondary)"};">
            Audit Log
          </button>
        </div>
      </div>

      <div id="moderationTabContent"></div>
    </div>
  `;

  const tabContent = container.querySelector("#moderationTabContent");
  if (state.tab === "audit") {
    renderAuditTab(tabContent, state, container);
  } else {
    renderQueueTab(tabContent, state, container);
  }

  container.querySelectorAll(".td-mod-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const nextTab = btn.dataset.tab;
      if (nextTab === state.tab) return;
      state.tab = nextTab;
      if (nextTab === "audit" && !state.auditLoaded) {
        state.auditLogs = [];
        render(container, state);
        getAuditLogs({ limit: 100 })
          .then(logs => {
            state.auditLogs = logs;
            state.auditLoaded = true;
            if (state.tab === "audit") render(container, state);
          })
          .catch(err => console.error("Could not load audit logs:", err));
      } else {
        render(container, state);
      }
    });
  });
}

function renderQueueTab(mount, state, rootContainer) {
  if (!state.submissions.length) {
    mount.innerHTML = `
      <div style="text-align:center; padding:3rem 1.5rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; color:var(--td-text-muted);">
        <div style="font-size:2rem; margin-bottom:0.75rem;">✅</div>
        <div style="font-weight:600; color:var(--td-text-primary); margin-bottom:0.25rem;">No submissions await review</div>
        <div style="font-size:0.88rem;">New community replications will appear here as soon as contributors submit them.</div>
      </div>
    `;
    return;
  }

  const selected = state.submissions.find(s => s.id === state.selectedId) || state.submissions[0];
  state.selectedId = selected.id;

  mount.innerHTML = `
    <div style="display:grid; grid-template-columns:minmax(240px, 320px) 1fr; gap:1.25rem; align-items:start;">
      <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; overflow:hidden;">
        <div id="moderationQueueList"></div>
      </div>
      <div id="moderationDetailPanel" style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.5rem;"></div>
    </div>
  `;

  const listMount = mount.querySelector("#moderationQueueList");
  listMount.innerHTML = state.submissions.map(s => {
    const exp = state.experimentCache.get(s.experimentId);
    const dev = state.deviceCache.get(s.deviceId);
    const isActive = s.id === selected.id;
    return `
      <button type="button" class="td-mod-queue-item" data-id="${escapeHtml(s.id)}" style="display:block; width:100%; text-align:left; padding:0.9rem 1rem; border:none; border-bottom:1px solid var(--td-border-subtle); background:${isActive ? "var(--td-bg-card)" : "transparent"}; cursor:pointer;">
        <div style="display:flex; justify-content:space-between; gap:0.5rem; align-items:flex-start;">
          <div style="font-weight:600; font-size:0.9rem; color:var(--td-text-primary);">${escapeHtml(exp?.title || s.experimentId || "Unknown Experiment")}</div>
          ${statusBadge(s.status)}
        </div>
        <div style="font-size:0.8rem; color:var(--td-text-muted); margin-top:0.2rem;">${escapeHtml(dev ? `${dev.brand} ${dev.model}` : s.deviceId || "Unknown device")}</div>
        <div style="font-size:0.75rem; color:var(--td-text-muted); margin-top:0.3rem;">by ${escapeHtml(s.authorDisplayName || s.submitterName || "Contributor")} · ${escapeHtml(formatDate(s.submittedAt || s.createdAt))}</div>
      </button>
    `;
  }).join("");

  listMount.querySelectorAll(".td-mod-queue-item").forEach(btn => {
    btn.addEventListener("click", () => {
      state.selectedId = btn.dataset.id;
      state.actionPanel = null;
      state.actionError = null;
      render(rootContainer, state);
    });
  });

  renderDetailPanel(mount.querySelector("#moderationDetailPanel"), state, rootContainer, selected);
}

function renderDetailPanel(mount, state, rootContainer, submission) {
  const exp = state.experimentCache.get(submission.experimentId);
  const dev = state.deviceCache.get(submission.deviceId);

  const measurementRows = Object.entries(submission.measurements || {}).map(([key, value]) => `
    <tr>
      <td style="padding:0.4rem 0.75rem; border-bottom:1px solid var(--td-border-subtle); color:var(--td-text-muted); font-size:0.82rem;">${escapeHtml(key)}</td>
      <td style="padding:0.4rem 0.75rem; border-bottom:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.85rem; font-weight:600;">${escapeHtml(String(value))}</td>
    </tr>
  `).join("") || `<tr><td style="padding:0.5rem 0.75rem; color:var(--td-text-muted); font-size:0.85rem;">No measurements recorded.</td></tr>`;

  const evidenceItems = (submission.evidenceReferences || submission.evidence || []).map(ev => `
    <li style="margin-bottom:0.4rem;">
      <a href="${sanitizeUrl(ev.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--td-info); text-decoration:none; font-size:0.85rem;">${escapeHtml(ev.name || ev.fileName || "Evidence file")}</a>
      <span style="color:var(--td-text-muted); font-size:0.78rem;"> · ${escapeHtml(formatFileSize(ev.size))}</span>
    </li>
  `).join("") || `<li style="color:var(--td-text-muted); font-size:0.85rem;">No evidence files attached.</li>`;

  const canAct = submission.status !== "approved" && submission.status !== "rejected";

  mount.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.75rem; margin-bottom:1.25rem;">
      <div>
        <h2 style="font-size:1.2rem; font-weight:700; color:var(--td-text-primary); margin:0 0 0.25rem;">${escapeHtml(exp?.title || submission.experimentId || "Unknown Experiment")}</h2>
        <div style="font-size:0.85rem; color:var(--td-text-muted);">${escapeHtml(dev ? `${dev.brand} ${dev.model}` : submission.deviceId || "Unknown device")}</div>
      </div>
      ${statusBadge(submission.status)}
    </div>

    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:1px; background:var(--td-border-subtle); border:1px solid var(--td-border-subtle); border-radius:0.5rem; overflow:hidden; margin-bottom:1.25rem;">
      <div style="background:var(--td-bg-card); padding:0.85rem;">
        <div style="font-size:0.72rem; text-transform:uppercase; color:var(--td-text-muted); margin-bottom:0.2rem;">Submitted By</div>
        <div style="font-size:0.88rem; font-weight:600; color:var(--td-text-primary);">${escapeHtml(submission.authorDisplayName || submission.submitterName || "Contributor")}</div>
      </div>
      <div style="background:var(--td-bg-card); padding:0.85rem;">
        <div style="font-size:0.72rem; text-transform:uppercase; color:var(--td-text-muted); margin-bottom:0.2rem;">Submitted</div>
        <div style="font-size:0.88rem; font-weight:600; color:var(--td-text-primary);">${escapeHtml(formatDate(submission.submittedAt || submission.createdAt))}</div>
      </div>
      <div style="background:var(--td-bg-card); padding:0.85rem;">
        <div style="font-size:0.72rem; text-transform:uppercase; color:var(--td-text-muted); margin-bottom:0.2rem;">Protocol Version</div>
        <div style="font-size:0.88rem; font-weight:600; color:var(--td-text-primary);">${escapeHtml(submission.protocolVersion || "1.0.0")}</div>
      </div>
      <div style="background:var(--td-bg-card); padding:0.85rem;">
        <div style="font-size:0.72rem; text-transform:uppercase; color:var(--td-text-muted); margin-bottom:0.2rem;">Provenance</div>
        <div style="font-size:0.88rem; font-weight:600; color:var(--td-text-primary);">${escapeHtml(submission.provenance?.source || "community")}</div>
      </div>
    </div>

    <div style="margin-bottom:1.25rem;">
      <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.03em; color:var(--td-text-muted); margin-bottom:0.5rem;">Measurements</div>
      <table style="width:100%; border-collapse:collapse; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.375rem; overflow:hidden;">
        <tbody>${measurementRows}</tbody>
      </table>
    </div>

    <div style="margin-bottom:1.25rem;">
      <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.03em; color:var(--td-text-muted); margin-bottom:0.5rem;">Test Conditions</div>
      <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.375rem; padding:0.85rem; font-size:0.85rem; color:var(--td-text-secondary); line-height:1.6;">
        <div><strong style="color:var(--td-text-primary);">Baseline:</strong> ${escapeHtml(submission.conditions?.officialBaseline || "—")}</div>
        <div><strong style="color:var(--td-text-primary);">Additional:</strong> ${escapeHtml(submission.conditions?.additionalConditions || "—")}</div>
        <div><strong style="color:var(--td-text-primary);">Test Date:</strong> ${escapeHtml(submission.testDate || "—")}</div>
        <div><strong style="color:var(--td-text-primary);">Software Version:</strong> ${escapeHtml(submission.softwareVersion || "—")}</div>
      </div>
    </div>

    <div style="margin-bottom:1.25rem;">
      <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.03em; color:var(--td-text-muted); margin-bottom:0.5rem;">Evidence</div>
      <ul style="margin:0; padding-left:1.1rem;">${evidenceItems}</ul>
    </div>

    ${submission.notes ? `
      <div style="margin-bottom:1.25rem;">
        <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.03em; color:var(--td-text-muted); margin-bottom:0.5rem;">Contributor Notes</div>
        <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.375rem; padding:0.85rem; font-size:0.85rem; color:var(--td-text-secondary);">${escapeHtml(submission.notes)}</div>
      </div>
    ` : ""}

    ${submission.review ? `
      <div style="margin-bottom:1.25rem; background:rgba(96,165,250,0.08); border:1px solid var(--td-border-subtle); border-radius:0.375rem; padding:0.85rem;">
        <div style="font-size:0.8rem; font-weight:700; color:var(--td-text-primary); margin-bottom:0.25rem;">Last Review</div>
        <div style="font-size:0.82rem; color:var(--td-text-secondary);">By ${escapeHtml(submission.review.reviewerName || "Moderator")} on ${escapeHtml(formatDate(submission.review.reviewedAt))}</div>
        ${submission.review.feedback ? `<div style="font-size:0.82rem; color:var(--td-text-secondary); margin-top:0.25rem;">"${escapeHtml(submission.review.feedback)}"</div>` : ""}
      </div>
    ` : ""}

    ${state.actionError ? `<div style="margin-bottom:1rem; padding:0.75rem 1rem; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.35); border-radius:0.375rem; color:var(--td-error, #f87171); font-size:0.85rem;">${escapeHtml(state.actionError)}</div>` : ""}

    ${canAct ? renderActionArea(state) : `<div style="color:var(--td-text-muted); font-size:0.85rem; font-style:italic;">This submission has already been finalized and is immutable.</div>`}
  `;

  if (canAct) {
    wireActionArea(mount, state, rootContainer, submission);
  }
}

function renderActionArea(state) {
  if (!state.actionPanel) {
    return `
      <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
        <button type="button" data-action="approved" class="td-mod-action-btn" style="padding:0.55rem 1.1rem; border-radius:0.375rem; font-weight:600; font-size:0.85rem; cursor:pointer; border:1px solid var(--td-success, #34d399); background:rgba(52,211,153,0.12); color:var(--td-success, #34d399);">✓ Approve</button>
        <button type="button" data-action="needs_revision" class="td-mod-action-btn" style="padding:0.55rem 1.1rem; border-radius:0.375rem; font-weight:600; font-size:0.85rem; cursor:pointer; border:1px solid var(--td-warning, #f59e0b); background:rgba(245,158,11,0.12); color:var(--td-warning, #f59e0b);">↺ Request Revision</button>
        <button type="button" data-action="rejected" class="td-mod-action-btn" style="padding:0.55rem 1.1rem; border-radius:0.375rem; font-weight:600; font-size:0.85rem; cursor:pointer; border:1px solid var(--td-error, #f87171); background:rgba(239,68,68,0.12); color:var(--td-error, #f87171);">✕ Reject</button>
      </div>
    `;
  }

  const labels = { approved: "Approve Submission", needs_revision: "Request Revision", rejected: "Reject Submission" };
  const requiresReason = state.actionPanel !== "approved";

  return `
    <div style="border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem; background:var(--td-bg-card);">
      <div style="font-weight:700; color:var(--td-text-primary); margin-bottom:0.5rem;">${labels[state.actionPanel]}</div>
      <textarea id="moderationReasonInput" rows="3" placeholder="${requiresReason ? "Explain what needs to change (required)" : "Optional note for the contributor"}" style="width:100%; box-sizing:border-box; padding:0.6rem; border-radius:0.375rem; border:1px solid var(--td-border-subtle); background:var(--td-bg-surface); color:var(--td-text-primary); font-size:0.85rem; resize:vertical; margin-bottom:0.75rem;"></textarea>
      <div style="display:flex; gap:0.75rem;">
        <button type="button" id="moderationActionConfirm" ${state.actionInFlight ? "disabled" : ""} style="padding:0.55rem 1.1rem; border-radius:0.375rem; font-weight:600; font-size:0.85rem; cursor:pointer; border:none; background:var(--td-info); color:#fff;">
          ${state.actionInFlight ? "Submitting..." : "Confirm"}
        </button>
        <button type="button" id="moderationActionCancel" ${state.actionInFlight ? "disabled" : ""} style="padding:0.55rem 1.1rem; border-radius:0.375rem; font-weight:600; font-size:0.85rem; cursor:pointer; border:1px solid var(--td-border-subtle); background:transparent; color:var(--td-text-secondary);">
          Cancel
        </button>
      </div>
    </div>
  `;
}

function wireActionArea(mount, state, rootContainer, submission) {
  mount.querySelectorAll(".td-mod-action-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.actionPanel = btn.dataset.action;
      state.actionError = null;
      render(rootContainer, state);
    });
  });

  const cancelBtn = mount.querySelector("#moderationActionCancel");
  cancelBtn?.addEventListener("click", () => {
    state.actionPanel = null;
    state.actionError = null;
    render(rootContainer, state);
  });

  const confirmBtn = mount.querySelector("#moderationActionConfirm");
  confirmBtn?.addEventListener("click", async () => {
    const reasonInput = mount.querySelector("#moderationReasonInput");
    const reason = (reasonInput?.value || "").trim();
    const requiresReason = state.actionPanel !== "approved";

    if (requiresReason && !reason) {
      state.actionError = "A reason is required for this action.";
      render(rootContainer, state);
      return;
    }

    state.actionInFlight = true;
    state.actionError = null;
    render(rootContainer, state);

    try {
      await reviewSubmission(submission.id, { status: state.actionPanel, feedback: reason });
      state.submissions = state.submissions.filter(s => s.id !== submission.id);
      state.selectedId = state.submissions[0]?.id || null;
      state.actionPanel = null;
      state.actionInFlight = false;
      state.auditLoaded = false;
      render(rootContainer, state);
    } catch (err) {
      console.error("Review action failed:", err);
      state.actionInFlight = false;
      state.actionError = err.message || "Could not submit review decision.";
      render(rootContainer, state);
    }
  });
}

function renderAuditTab(mount, state) {
  if (!state.auditLoaded) {
    mount.innerHTML = `
      <div style="text-align:center; padding:2.5rem; color:var(--td-text-muted);">Loading audit trail...</div>
    `;
    return;
  }

  if (!state.auditLogs.length) {
    mount.innerHTML = `
      <div style="text-align:center; padding:2.5rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; color:var(--td-text-muted);">
        No moderation actions have been recorded yet.
      </div>
    `;
    return;
  }

  const rows = state.auditLogs.map(log => `
    <tr>
      <td style="padding:0.6rem 0.85rem; border-bottom:1px solid var(--td-border-subtle); font-size:0.82rem; color:var(--td-text-muted); white-space:nowrap;">${escapeHtml(formatDate(log.timestamp))}</td>
      <td style="padding:0.6rem 0.85rem; border-bottom:1px solid var(--td-border-subtle); font-size:0.82rem; color:var(--td-text-primary); font-weight:600;">${escapeHtml(log.actorName || log.actorId)}</td>
      <td style="padding:0.6rem 0.85rem; border-bottom:1px solid var(--td-border-subtle); font-size:0.82rem;">${statusBadge(log.previousStatus)} → ${statusBadge(log.newStatus)}</td>
      <td style="padding:0.6rem 0.85rem; border-bottom:1px solid var(--td-border-subtle); font-size:0.8rem; color:var(--td-text-secondary); font-family:monospace;">${escapeHtml(log.targetSubmissionId)}</td>
      <td style="padding:0.6rem 0.85rem; border-bottom:1px solid var(--td-border-subtle); font-size:0.82rem; color:var(--td-text-secondary);">${escapeHtml(log.reason || "—")}</td>
    </tr>
  `).join("");

  mount.innerHTML = `
    <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; min-width:640px;">
        <thead>
          <tr style="background:var(--td-bg-card);">
            <th style="padding:0.6rem 0.85rem; text-align:left; font-size:0.72rem; text-transform:uppercase; color:var(--td-text-muted);">When</th>
            <th style="padding:0.6rem 0.85rem; text-align:left; font-size:0.72rem; text-transform:uppercase; color:var(--td-text-muted);">Moderator</th>
            <th style="padding:0.6rem 0.85rem; text-align:left; font-size:0.72rem; text-transform:uppercase; color:var(--td-text-muted);">Transition</th>
            <th style="padding:0.6rem 0.85rem; text-align:left; font-size:0.72rem; text-transform:uppercase; color:var(--td-text-muted);">Submission</th>
            <th style="padding:0.6rem 0.85rem; text-align:left; font-size:0.72rem; text-transform:uppercase; color:var(--td-text-muted);">Reason</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}
