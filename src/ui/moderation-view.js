/**
 * WDIII Tech Vault — Step 7: Empirical Protocol Moderation Queue
 * Route: #/moderation
 * 
 * SECURITY & ARCHITECTURAL INVARIANTS:
 * 1. UI-level role checks in this file are a courtesy redirect only.
 *    Real enforcement and privilege boundaries are enforced exclusively
 *    by firestore.rules (request.auth != null && isModerator()).
 * 2. Every moderation mutation (approve/reject/needs_revision) must flow
 *    strictly through reviewSubmission() in database.js.
 * 3. Never write directly to Firestore or bypass database.js.
 */

import { getCurrentUser, getCurrentProfile } from "../services/firebase.js";
import {
  getPendingSubmissions,
  reviewSubmission,
  getDeviceById,
  getExperimentById
} from "../services/database.js";
import { escapeHtml, sanitizeText } from "../utils/sanitize.js";

/**
 * Check if the active session possesses moderation or higher authorization.
 * NOTE: This is a client-side UI courtesy check. True security enforcement
 * is performed server-side by Firestore security rules.
 */
function isUserModerator() {
  const user = getCurrentUser();
  const profile = getCurrentProfile();
  if (!user) return false;

  const email = (user.email || "").toLowerCase();
  const isOwner = (profile?.role === "owner") || email === "perfectshadowkai33@gmail.com";
  const role = isOwner ? "owner" : (profile?.role || "contributor");

  return isOwner || role === "admin" || role === "moderator";
}

/**
 * Render the moderation dashboard view into the target container.
 */
export async function renderModerationView(container) {
  if (!container) return;

  // 1. Courtesy Authorization Check
  // Server-side enforcement remains authoritative in firestore.rules
  if (!isUserModerator()) {
    container.innerHTML = `
      <div style="max-width:800px; margin:3rem auto; padding:2.5rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; text-align:center;">
        <div style="font-size:3rem; margin-bottom:1rem;">🛡️</div>
        <h2 style="color:var(--td-text-primary); font-size:1.5rem; font-weight:700; margin-bottom:0.75rem;">Access Restricted</h2>
        <p style="color:var(--td-text-secondary); max-width:540px; margin:0 auto 1.75rem; line-height:1.6; font-size:0.95rem;">
          The Empirical Protocol Moderation Queue is reserved for designated moderators, administrators, and vault owners.
        </p>
        <div style="display:flex; justify-content:center; gap:1rem;">
          <a href="#/" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.625rem 1.25rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); text-decoration:none; font-size:0.9rem; font-weight:600;">
            ← Return to Vault
          </a>
          <a href="#/profile" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.625rem 1.25rem; border-radius:0.375rem; background:var(--td-info); color:#fff; text-decoration:none; font-size:0.9rem; font-weight:600;">
            View Account Credentials
          </a>
        </div>
      </div>
    `;
    return;
  }

  // 2. Loading State
  container.innerHTML = `
    <div style="max-width:1100px; margin:0 auto; padding:2rem 1.5rem;">
      <header style="margin-bottom:2rem; border-bottom:1px solid var(--td-border); padding-bottom:1.25rem;">
        <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.5rem;">
          <span style="font-size:1.5rem;">⚖️</span>
          <h1 style="color:var(--td-text-primary); font-size:1.75rem; font-weight:700; margin:0;">Community Moderation Dashboard</h1>
          <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; padding:0.2rem 0.6rem; border-radius:0.25rem; background:rgba(245,158,11,0.15); color:var(--td-pending); border:1px solid rgba(245,158,11,0.35);">Moderator Mode</span>
        </div>
        <p style="color:var(--td-text-secondary); margin:0; font-size:0.95rem;">
          Audit empirical test submissions for methodological rigor, verifiable telemetry, and protocol adherence.
        </p>
      </header>

      <div id="modQueueStatusMessage" style="display:none; margin-bottom:1.5rem;"></div>

      <div id="modQueueLoading" style="text-align:center; padding:4rem 2rem; color:var(--td-text-muted);">
        <div style="font-size:2rem; margin-bottom:0.75rem; animation:spin 2s linear infinite;">⏳</div>
        <div>Loading pending protocol submissions from Vault...</div>
      </div>

      <div id="modQueueItems"></div>
    </div>
  `;

  // 3. Fetch Pending Submissions
  try {
    const submissions = await getPendingSubmissions();
    const loadingEl = container.querySelector("#modQueueLoading");
    if (loadingEl) loadingEl.style.display = "none";

    const itemsContainer = container.querySelector("#modQueueItems");
    if (!itemsContainer) return;

    if (!submissions || submissions.length === 0) {
      itemsContainer.innerHTML = `
        <div style="text-align:center; padding:4rem 2rem; background:var(--td-bg-card); border:1px dashed var(--td-border); border-radius:0.5rem;">
          <div style="font-size:2.5rem; margin-bottom:0.75rem;">✨</div>
          <h3 style="color:var(--td-text-primary); font-size:1.2rem; font-weight:600; margin:0 0 0.5rem;">Queue is Clear</h3>
          <p style="color:var(--td-text-secondary); max-width:440px; margin:0 auto; font-size:0.9rem;">
            All empirical test submissions have been audited. No community records are currently awaiting protocol review.
          </p>
        </div>
      `;
      return;
    }

    // Resolve device and experiment metadata in parallel for all submissions
    const devicePromises = submissions.map(s => s.deviceId ? getDeviceById(s.deviceId) : Promise.resolve(null));
    const experimentPromises = submissions.map(s => s.experimentId ? getExperimentById(s.experimentId) : Promise.resolve(null));

    const [resolvedDevices, resolvedExperiments] = await Promise.all([
      Promise.all(devicePromises),
      Promise.all(experimentPromises)
    ]);

    itemsContainer.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
        <span style="font-size:0.9rem; color:var(--td-text-secondary);">
          Pending Submissions: <strong style="color:var(--td-pending);">${submissions.length}</strong>
        </span>
        <button id="modBtnRefreshQueue" type="button" style="display:inline-flex; align-items:center; gap:0.375rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border-subtle); color:var(--td-text-secondary); padding:0.375rem 0.875rem; border-radius:0.375rem; font-size:0.85rem; cursor:pointer;">
          🔄 Refresh Queue
        </button>
      </div>

      <div style="display:flex; flex-direction:column; gap:1.75rem;" id="modCardsList">
        ${submissions.map((sub, index) => {
          const device = resolvedDevices[index];
          const exp = resolvedExperiments[index];
          return buildSubmissionCard(sub, device, exp);
        }).join("")}
      </div>
    `;

    // Bind refresh button
    container.querySelector("#modBtnRefreshQueue")?.addEventListener("click", () => {
      renderModerationView(container);
    });

    // Bind review action handlers for each submission
    submissions.forEach(sub => {
      attachCardListeners(container, sub.id);
    });

  } catch (err) {
    console.error("Failed to load moderation queue:", err);
    const loadingEl = container.querySelector("#modQueueLoading");
    if (loadingEl) {
      loadingEl.innerHTML = `
        <div style="color:var(--td-error); font-size:1.1rem; margin-bottom:0.5rem;">⚠️ Error Loading Submissions</div>
        <p style="color:var(--td-text-muted); font-size:0.9rem; margin-bottom:1rem;">${escapeHtml(err.message || "Failed to communicate with Vault.")}</p>
        <button id="modBtnRetry" type="button" style="padding:0.5rem 1.25rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); color:var(--td-text-primary); border-radius:0.375rem; cursor:pointer;">
          Retry
        </button>
      `;
      container.querySelector("#modBtnRetry")?.addEventListener("click", () => renderModerationView(container));
    }
  }
}

/**
 * Format timestamp into standard readable representation
 */
function formatDate(timestamp) {
  if (!timestamp) return "Unknown date";
  try {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return "Unknown date";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "Unknown date";
  }
}

/**
 * Build HTML card for an individual pending submission.
 */
function buildSubmissionCard(sub, device, exp) {
  const subId = escapeHtml(sub.id || "");
  const submitterName = escapeHtml(sub.contributorName || sub.submitterEmail || (sub.userId ? `User (${sub.userId.substring(0, 8)}...)` : "Anonymous Contributor"));
  const dateStr = formatDate(sub.submittedAt || sub.createdAt);

  const deviceTitle = device
    ? `${escapeHtml(device.brand || "")} ${escapeHtml(device.model || "")}`
    : `Unknown Device (${escapeHtml(sub.deviceId || "None")})`;

  const expTitle = exp
    ? `${escapeHtml(exp.title || "")}`
    : `Unknown Experiment (${escapeHtml(sub.experimentId || "None")})`;

  const expCategory = exp?.category ? escapeHtml(exp.category) : "empirical";

  // Format measurements
  let measurementsHtml = `<span style="color:var(--td-text-muted); font-style:italic;">No discrete metrics recorded</span>`;
  if (sub.measurements) {
    if (typeof sub.measurements === "object" && Object.keys(sub.measurements).length > 0) {
      measurementsHtml = `
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:0.75rem;">
          ${Object.entries(sub.measurements).map(([key, val]) => `
            <div style="background:var(--td-bg-card); padding:0.625rem 0.875rem; border-radius:0.375rem; border:1px solid var(--td-border-subtle);">
              <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.04em; color:var(--td-text-muted); margin-bottom:0.15rem;">${escapeHtml(key)}</div>
              <div style="font-size:1.05rem; font-weight:700; color:var(--td-text-primary);">${escapeHtml(String(val))}</div>
            </div>
          `).join("")}
        </div>
      `;
    }
  }

  // Format test conditions
  const conditions = sub.testConditions || {};
  const ambientTemp = conditions.ambientTemperature !== undefined && conditions.ambientTemperature !== "" ? `${escapeHtml(String(conditions.ambientTemperature))}°C` : "Not logged";
  const humidity = conditions.humidity !== undefined && conditions.humidity !== "" ? `${escapeHtml(String(conditions.humidity))}%` : "Not logged";
  const osVersion = conditions.osVersion || conditions.firmwareVersion ? escapeHtml(conditions.osVersion || conditions.firmwareVersion) : "Standard release";
  const physicalCondition = conditions.physicalCondition ? escapeHtml(conditions.physicalCondition) : "Nominal (No structural damage)";

  // Format evidence
  let evidenceHtml = `<span style="color:var(--td-text-muted); font-size:0.85rem;">No supplemental media attached</span>`;
  if (Array.isArray(sub.evidenceReferences) && sub.evidenceReferences.length > 0) {
    evidenceHtml = `
      <div style="display:flex; flex-wrap:wrap; gap:0.75rem; margin-top:0.25rem;">
        ${sub.evidenceReferences.map((ref, i) => {
          const url = typeof ref === "string" ? ref : ref.url || "";
          const label = (typeof ref === "object" && ref.label) ? ref.label : `Evidence Item #${i + 1}`;
          if (!url) return "";
          const safeUrl = escapeHtml(url);
          const safeLabel = escapeHtml(label);
          return `
            <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:0.375rem; padding:0.375rem 0.75rem; border-radius:0.375rem; background:var(--td-bg-surface); border:1px solid var(--td-border-subtle); color:var(--td-info); font-size:0.85rem; text-decoration:none; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              <span>📎</span> <span>${safeLabel}</span>
            </a>
          `;
        }).join("")}
      </div>
    `;
  }

  const contributorNotes = sub.notes || sub.contributorNotes || sub.description || "";

  return `
    <article class="td-card td-mod-submission-card" id="mod-card-${subId}" style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.5rem; overflow:hidden; padding:0;">
      <!-- Header -->
      <div style="padding:1.25rem 1.5rem; background:var(--td-bg-surface); border-bottom:1px solid var(--td-border); display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.25rem;">
            <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; padding:0.15rem 0.5rem; border-radius:9999px; background:rgba(245,158,11,0.15); color:var(--td-pending); border:1px solid rgba(245,158,11,0.35);">
              ● Pending Review
            </span>
            <span style="font-size:0.8rem; color:var(--td-text-muted); font-family:monospace;">ID: ${subId}</span>
          </div>
          <div style="font-size:0.88rem; color:var(--td-text-secondary);">
            Submitted by <strong style="color:var(--td-text-primary);">${submitterName}</strong> on <span>${dateStr}</span>
          </div>
        </div>

        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          ${sub.deviceId ? `<a href="#/devices/${escapeHtml(sub.deviceId)}" style="display:inline-flex; align-items:center; gap:0.35rem; font-size:0.82rem; padding:0.25rem 0.625rem; border-radius:0.25rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-info); text-decoration:none;">📱 View Device</a>` : ""}
          ${sub.experimentId ? `<a href="#/experiments/${escapeHtml(sub.experimentId)}" style="display:inline-flex; align-items:center; gap:0.35rem; font-size:0.82rem; padding:0.25rem 0.625rem; border-radius:0.25rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-info); text-decoration:none;">🧪 View Experiment</a>` : ""}
        </div>
      </div>

      <!-- Content Details -->
      <div style="padding:1.5rem; display:flex; flex-direction:column; gap:1.25rem;">
        <!-- Device and Experiment Target -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
          <div style="background:var(--td-bg-card); padding:1rem; border-radius:0.375rem; border:1px solid var(--td-border-subtle);">
            <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); margin-bottom:0.25rem;">Target Hardware</div>
            <div style="font-size:1.05rem; font-weight:600; color:var(--td-text-primary);">${deviceTitle}</div>
          </div>

          <div style="background:var(--td-bg-card); padding:1rem; border-radius:0.375rem; border:1px solid var(--td-border-subtle);">
            <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); margin-bottom:0.25rem;">Experimental Protocol (${expCategory})</div>
            <div style="font-size:1.05rem; font-weight:600; color:var(--td-text-primary);">${expTitle}</div>
          </div>
        </div>

        <!-- Telemetry & Measurements -->
        <div>
          <h4 style="color:var(--td-text-primary); font-size:0.9rem; font-weight:600; margin:0 0 0.5rem; text-transform:uppercase; letter-spacing:0.05em;">Recorded Measurements</h4>
          ${measurementsHtml}
        </div>

        <!-- Empirical Test Conditions -->
        <div style="background:var(--td-bg-surface); padding:1rem 1.25rem; border-radius:0.375rem; border:1px solid var(--td-border-subtle);">
          <h4 style="color:var(--td-text-primary); font-size:0.85rem; font-weight:600; margin:0 0 0.75rem; text-transform:uppercase; letter-spacing:0.05em;">Test Environment &amp; Conditions</h4>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:0.75rem; font-size:0.88rem;">
            <div>
              <span style="color:var(--td-text-muted);">Ambient Temp:</span>
              <span style="color:var(--td-text-primary); font-weight:500; margin-left:0.35rem;">${ambientTemp}</span>
            </div>
            <div>
              <span style="color:var(--td-text-muted);">Ambient Humidity:</span>
              <span style="color:var(--td-text-primary); font-weight:500; margin-left:0.35rem;">${humidity}</span>
            </div>
            <div>
              <span style="color:var(--td-text-muted);">Software / OS:</span>
              <span style="color:var(--td-text-primary); font-weight:500; margin-left:0.35rem;">${osVersion}</span>
            </div>
            <div>
              <span style="color:var(--td-text-muted);">Hardware State:</span>
              <span style="color:var(--td-text-primary); font-weight:500; margin-left:0.35rem;">${physicalCondition}</span>
            </div>
          </div>
        </div>

        <!-- Contributor Observations -->
        ${contributorNotes ? `
          <div>
            <h4 style="color:var(--td-text-primary); font-size:0.85rem; font-weight:600; margin:0 0 0.35rem; text-transform:uppercase; letter-spacing:0.05em;">Contributor Observations</h4>
            <div style="background:var(--td-bg-card); padding:1rem; border-radius:0.375rem; border:1px solid var(--td-border-subtle); color:var(--td-text-secondary); font-size:0.92rem; line-height:1.6; white-space:pre-wrap;">${escapeHtml(contributorNotes)}</div>
          </div>
        ` : ""}

        <!-- Verifiable Evidence Media -->
        <div>
          <h4 style="color:var(--td-text-primary); font-size:0.85rem; font-weight:600; margin:0 0 0.35rem; text-transform:uppercase; letter-spacing:0.05em;">Verifiable Evidence</h4>
          ${evidenceHtml}
        </div>
      </div>

      <!-- Moderation Actions Section -->
      <div style="background:var(--td-bg-surface); border-top:1px solid var(--td-border); padding:1.25rem 1.5rem;">
        <div style="margin-bottom:1rem;">
          <label for="mod-notes-${subId}" style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-primary); margin-bottom:0.35rem;">
            Moderator Audit Log &amp; Decision Notes <span style="font-weight:400; color:var(--td-text-muted);">(Required if rejecting or requesting revision)</span>
          </label>
          <textarea id="mod-notes-${subId}" rows="2" placeholder="Document review rationale, protocol deviations, or confirmation remarks..." style="width:100%; box-sizing:border-box; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.375rem; padding:0.625rem 0.875rem; color:var(--td-text-primary); font-size:0.9rem; font-family:inherit; resize:vertical;"></textarea>
          <div id="mod-error-${subId}" style="display:none; color:var(--td-error); font-size:0.85rem; margin-top:0.35rem;"></div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem;">
          <div style="font-size:0.8rem; color:var(--td-text-muted);">
            ⚡ Writes strictly committed via authoritative database.js pipeline.
          </div>
          <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
            <button type="button" class="btnModReject" data-sub-id="${subId}" style="display:inline-flex; align-items:center; gap:0.375rem; padding:0.55rem 1.1rem; border-radius:0.375rem; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.4); color:var(--td-error, #f87171); font-size:0.88rem; font-weight:600; cursor:pointer;">
              ✕ Reject Submission
            </button>
            <button type="button" class="btnModRevise" data-sub-id="${subId}" style="display:inline-flex; align-items:center; gap:0.375rem; padding:0.55rem 1.1rem; border-radius:0.375rem; background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.4); color:var(--td-pending, #fbbf24); font-size:0.88rem; font-weight:600; cursor:pointer;">
              ✎ Request Revision
            </button>
            <button type="button" class="btnModApprove" data-sub-id="${subId}" style="display:inline-flex; align-items:center; gap:0.375rem; padding:0.55rem 1.25rem; border-radius:0.375rem; background:var(--td-success); border:1px solid var(--td-success); color:#fff; font-size:0.88rem; font-weight:600; cursor:pointer;">
              ✓ Approve &amp; Publish
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * Bind action button click listeners for an individual submission card.
 */
function attachCardListeners(container, submissionId) {
  const card = container.querySelector(`#mod-card-${submissionId}`);
  if (!card) return;

  const notesInput = card.querySelector(`#mod-notes-${submissionId}`);
  const errorBox = card.querySelector(`#mod-error-${submissionId}`);
  const approveBtn = card.querySelector(`.btnModApprove[data-sub-id="${submissionId}"]`);
  const rejectBtn = card.querySelector(`.btnModReject[data-sub-id="${submissionId}"]`);
  const reviseBtn = card.querySelector(`.btnModRevise[data-sub-id="${submissionId}"]`);

  const setButtonsDisabled = (disabled) => {
    if (approveBtn) approveBtn.disabled = disabled;
    if (rejectBtn) rejectBtn.disabled = disabled;
    if (reviseBtn) reviseBtn.disabled = disabled;
    if (notesInput) notesInput.disabled = disabled;
    card.style.opacity = disabled ? "0.6" : "1";
  };

  const showError = (msg) => {
    if (errorBox) {
      errorBox.textContent = msg;
      errorBox.style.display = "block";
    }
  };

  const clearError = () => {
    if (errorBox) {
      errorBox.textContent = "";
      errorBox.style.display = "none";
    }
  };

  const handleReviewAction = async (status) => {
    clearError();
    const rawNotes = notesInput ? notesInput.value.trim() : "";

    // Require non-empty review notes for rejection or revision
    if ((status === "rejected" || status === "needs_revision") && !rawNotes) {
      showError(`A reason or audit explanation is required to ${status === "rejected" ? "reject" : "request revision for"} this submission.`);
      if (notesInput) notesInput.focus();
      return;
    }

    const user = getCurrentUser();
    const profile = getCurrentProfile();

    setButtonsDisabled(true);

    try {
      // Execute mutation strictly via database.js pipeline
      await reviewSubmission(submissionId, {
        status,
        reviewNotes: rawNotes,
        reviewerId: user?.uid || "moderator",
        reviewerName: profile?.displayName || user?.displayName || "Vault Moderator"
      });

      // Optimistic UI removal: only update DOM after the write succeeds
      card.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      card.style.opacity = "0";
      card.style.transform = "scale(0.98)";
      setTimeout(() => {
        card.remove();
        const cardsList = container.querySelector("#modCardsList");
        if (cardsList && cardsList.children.length === 0) {
          renderModerationView(container);
        }
      }, 300);

      // Show temporary status notice
      const statusNotice = container.querySelector("#modQueueStatusMessage");
      if (statusNotice) {
        const actionLabel = status === "approved" ? "approved and published" : status === "rejected" ? "rejected" : "marked for revision";
        statusNotice.style.display = "block";
        statusNotice.innerHTML = `
          <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-info); border-radius:0.375rem; padding:0.75rem 1.25rem; font-size:0.9rem; color:var(--td-text-primary); display:flex; justify-content:space-between; align-items:center;">
            <span>Submission <strong>${escapeHtml(submissionId)}</strong> successfully ${actionLabel}.</span>
            <button type="button" onclick="this.parentElement.remove()" style="background:none; border:none; color:var(--td-text-muted); cursor:pointer; font-size:1rem;">✕</button>
          </div>
        `;
      }
    } catch (err) {
      console.error(`Failed to execute review action '${status}':`, err);
      setButtonsDisabled(false);
      showError(`Write failed: ${err.message || "Failed to update submission status in Vault."}`);
    }
  };

  approveBtn?.addEventListener("click", () => handleReviewAction("approved"));
  rejectBtn?.addEventListener("click", () => handleReviewAction("rejected"));
  reviseBtn?.addEventListener("click", () => handleReviewAction("needs_revision"));
}
