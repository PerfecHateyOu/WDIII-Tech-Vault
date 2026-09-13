/**
 * WDIII Community Testing - My Tests View Module
 * Route: #/my-tests
 * 
 * Provides:
 * 1. Contributor portfolio of empirical test submissions.
 * 2. Status tracking (pending_review, needs_revision, approved, rejected, withdrawn).
 * 3. Provenance inspector (who, what device, which protocol, when, conditions, measurements).
 * 4. Resubmission flow for tests marked 'needs_revision'.
 * 5. Withdrawal action for pending tests.
 * 6. Moderator decision panel (for authorized reviewers/admins to test the review loop).
 */

import { getUserSubmissions, getSubmissionById, withdrawSubmission, reviewSubmission } from "../services/database.js";
import { getCurrentUser, getCurrentProfile, signInWithGoogle } from "../services/firebase.js";
import { escapeHtml, sanitizeText } from "../utils/sanitize.js";

export async function renderMyTestsView(container) {
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center; padding:3rem; color:var(--td-text-muted);">
      <div style="font-size:2rem; margin-bottom:0.75rem;">📋</div>
      <div style="font-weight:600; color:var(--td-text-primary);">Loading Community Submissions Portfolio...</div>
    </div>
  `;

  const currentUser = getCurrentUser();
  const profile = getUserProfile();

  if (!currentUser) {
    renderAuthPrompt(container);
    return;
  }

  try {
    const submissions = await getUserSubmissions(currentUser.uid);
    renderPortfolio(container, { currentUser, profile, submissions });
  } catch (err) {
    console.error("Error loading submissions:", err);
    container.innerHTML = `
      <div style="max-width:640px; margin:2rem auto; padding:2rem; background:var(--td-bg-card); border:1px solid var(--td-error); border-radius:0.5rem; text-align:center;">
        <h3 style="color:var(--td-error); margin-bottom:0.5rem;">Could Not Load Submissions</h3>
        <p style="color:var(--td-text-secondary);">${escapeHtml(err.message)}</p>
        <button id="btnRetrySubmissions" style="margin-top:1rem; padding:0.5rem 1rem; background:var(--td-info); color:#fff; border:none; border-radius:0.25rem; cursor:pointer;">Retry</button>
      </div>
    `;
    document.getElementById("btnRetrySubmissions")?.addEventListener("click", () => renderMyTestsView(container));
  }
}

function renderAuthPrompt(container) {
  container.innerHTML = `
    <div style="max-width:680px; margin:3rem auto; padding:2.5rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; text-align:center;">
      <div style="font-size:2.5rem; margin-bottom:1rem;">🔒</div>
      <h2 style="color:var(--td-text-primary); font-size:1.5rem; font-weight:700; margin-bottom:0.5rem;">
        Authentication Required
      </h2>
      <p style="color:var(--td-text-secondary); font-size:0.95rem; line-height:1.5; max-width:480px; margin:0 auto 1.75rem;">
        Sign in with your Google account to track your submitted community tests, review peer audit notes, and manage protocol submissions.
      </p>
      <button id="btnMyTestsSignIn" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.625rem 1.5rem; background:var(--td-info); color:#fff; font-weight:600; font-size:0.95rem; border-radius:0.375rem; border:none; cursor:pointer;">
        <span>Sign In with Google</span>
      </button>
    </div>
  `;

  document.getElementById("btnMyTestsSignIn")?.addEventListener("click", async () => {
    try {
      await signInWithGoogle();
      renderMyTestsView(container);
    } catch (err) {
      console.warn("Sign in error:", err);
    }
  });
}

function renderPortfolio(container, ctx) {
  const { currentUser, profile, submissions } = ctx;
  const isModerator = profile?.role === "admin" || profile?.role === "moderator" || profile?.role === "owner" || currentUser.email === "perfectshadowkai33@gmail.com";

  let currentFilter = "all";

  function getFilteredSubmissions() {
    if (currentFilter === "all") return submissions;
    if (currentFilter === "pending") return submissions.filter(s => s.status === "pending_review" || s.status === "pending");
    return submissions.filter(s => s.status === currentFilter);
  }

  function getStatusBadge(status) {
    if (status === "approved") {
      return `<span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; padding:0.2rem 0.625rem; border-radius:0.25rem; background:rgba(16,185,129,0.15); color:var(--td-success); border:1px solid var(--td-success);">✓ Approved &amp; Verified</span>`;
    }
    if (status === "needs_revision") {
      return `<span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; padding:0.2rem 0.625rem; border-radius:0.25rem; background:rgba(245,158,11,0.15); color:var(--td-warning); border:1px solid var(--td-warning);">⚠️ Needs Revision</span>`;
    }
    if (status === "rejected") {
      return `<span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; padding:0.2rem 0.625rem; border-radius:0.25rem; background:rgba(239,68,68,0.15); color:var(--td-error); border:1px solid var(--td-error);">✕ Rejected</span>`;
    }
    if (status === "withdrawn") {
      return `<span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; padding:0.2rem 0.625rem; border-radius:0.25rem; background:rgba(148,163,184,0.15); color:var(--td-text-muted); border:1px solid var(--td-border-subtle);">Withdrawn</span>`;
    }
    return `<span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; padding:0.2rem 0.625rem; border-radius:0.25rem; background:rgba(96,165,250,0.15); color:var(--td-info); border:1px solid var(--td-info);">⏳ Pending Review</span>`;
  }

  function render() {
    const list = getFilteredSubmissions();

    const counts = {
      all: submissions.length,
      pending: submissions.filter(s => s.status === "pending_review" || s.status === "pending").length,
      needs_revision: submissions.filter(s => s.status === "needs_revision").length,
      approved: submissions.filter(s => s.status === "approved").length,
      rejected: submissions.filter(s => s.status === "rejected").length,
      withdrawn: submissions.filter(s => s.status === "withdrawn").length
    };

    container.innerHTML = `
      <div style="max-width:1040px; margin:1.5rem auto 3rem; padding:0 1rem;">
        <!-- Breadcrumbs -->
        <nav style="display:flex; align-items:center; flex-wrap:wrap; gap:0.375rem; font-size:0.85rem; color:var(--td-text-muted); margin-bottom:1.5rem;">
          <a href="#/" style="color:var(--td-text-secondary); padding:0.25rem 0.5rem; text-decoration:none;">🏠 Home</a>
          <span style="opacity:0.6;">/</span>
          <span style="color:var(--td-text-primary); padding:0.25rem 0.5rem; font-weight:600;">📋 Community Testing Portfolio</span>
        </nav>

        <!-- Top Header Card -->
        <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.75rem 2rem; margin-bottom:2rem; display:flex; justify-content:space-between; align-items:center; gap:1.5rem; flex-wrap:wrap;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.375rem;">
              <h1 style="color:var(--td-text-primary); font-size:1.6rem; font-weight:700; margin:0;">
                My Community Tests
              </h1>
              ${isModerator ? `
                <span style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; padding:0.15rem 0.5rem; border-radius:0.25rem; background:rgba(239,68,68,0.15); color:var(--td-error); border:1px solid var(--td-error);">
                  🛡️ Moderator Review Enabled
                </span>
              ` : ""}
            </div>
            <p style="color:var(--td-text-secondary); margin:0; font-size:0.92rem; line-height:1.5;">
              Personal audit log of empirical hardware tests submitted against official WDIII research protocols.
            </p>
          </div>

          <a href="#/submit" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.625rem 1.25rem; background:var(--td-info); color:#fff; font-weight:600; font-size:0.92rem; border-radius:0.375rem; text-decoration:none; box-shadow:0 4px 12px rgba(96,165,250,0.25);">
            <span>+</span> <span>Submit New Test</span>
          </a>
        </div>

        <!-- Filter Tabs -->
        <div style="display:flex; gap:0.5rem; overflow-x:auto; padding-bottom:0.5rem; margin-bottom:1.5rem; border-bottom:1px solid var(--td-border-subtle);">
          ${[
            { id: "all", label: "All Tests", count: counts.all },
            { id: "pending", label: "Pending Review", count: counts.pending },
            { id: "needs_revision", label: "Needs Revision", count: counts.needs_revision },
            { id: "approved", label: "Approved", count: counts.approved },
            { id: "rejected", label: "Rejected", count: counts.rejected },
            { id: "withdrawn", label: "Withdrawn", count: counts.withdrawn }
          ].map(tab => `
            <button class="filter-tab-btn" data-filter="${tab.id}" style="display:inline-flex; align-items:center; gap:0.375rem; padding:0.5rem 0.875rem; border-radius:9999px; border:1px solid ${currentFilter === tab.id ? 'var(--td-info)' : 'var(--td-border-subtle)'}; background:${currentFilter === tab.id ? 'var(--td-info-bg)' : 'var(--td-bg-card)'}; color:${currentFilter === tab.id ? 'var(--td-info)' : 'var(--td-text-secondary)'}; font-size:0.85rem; font-weight:600; cursor:pointer; white-space:nowrap;">
              <span>${tab.label}</span>
              <span style="font-size:0.75rem; opacity:0.8; background:var(--td-bg-surface); padding:0.1rem 0.35rem; border-radius:9999px;">${tab.count}</span>
            </button>
          `).join("")}
        </div>

        <!-- Submissions Container -->
        <div id="submissionsCardsList" style="display:flex; flex-direction:column; gap:1.5rem;">
          ${!list.length ? `
            <div style="background:var(--td-bg-card); border:1px dashed var(--td-border-subtle); border-radius:0.75rem; padding:3rem 2rem; text-align:center;">
              <div style="font-size:2.5rem; margin-bottom:0.75rem;">🧪</div>
              <h3 style="color:var(--td-text-primary); font-size:1.2rem; margin:0 0 0.5rem;">No submissions found</h3>
              <p style="color:var(--td-text-secondary); max-width:480px; margin:0 auto 1.5rem; font-size:0.9rem; line-height:1.5;">
                ${currentFilter === "all" ? "You haven't submitted any community test results yet. Choose an official protocol to contribute empirical data." : `No tests currently have status '${currentFilter}'.`}
              </p>
              <a href="#/submit" style="display:inline-block; padding:0.5rem 1.25rem; background:var(--td-info); color:#fff; font-weight:600; font-size:0.88rem; border-radius:0.375rem; text-decoration:none;">
                Submit a Protocol Test
              </a>
            </div>
          ` : list.map(sub => renderSubmissionCard(sub, isModerator)).join("")}
        </div>
      </div>
    `;

    // Attach filter listeners
    container.querySelectorAll(".filter-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        currentFilter = btn.getAttribute("data-filter");
        render();
      });
    });

    // Attach card actions
    attachCardListeners();
  }

  function renderSubmissionCard(sub, isMod) {
    const formattedDate = sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "N/A";
    const testDate = sub.testDate || "N/A";

    const isEditable = ["pending_review", "pending", "needs_revision"].includes(sub.status);
    const isWithdrawable = ["pending_review", "pending", "needs_revision"].includes(sub.status);

    // Build conditions table
    const conditions = sub.conditions || {};
    const condKeys = Object.keys(conditions);

    // Build measurements table
    const measurements = sub.measurements || {};
    const measEntries = Object.entries(measurements);

    // Evidence
    const evidence = sub.evidenceReferences || [];

    return `
      <article class="submission-card" id="card-${escapeHtml(sub.id)}" style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; overflow:hidden; transition:box-shadow 0.2s;">
        <!-- Card Header -->
        <div style="padding:1.25rem 1.5rem; background:var(--td-bg-surface); border-bottom:1px solid var(--td-border-subtle); display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;">
          <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
            ${getStatusBadge(sub.status)}
            <span style="font-family:monospace; font-size:0.8rem; color:var(--td-text-muted); background:var(--td-bg-card); padding:0.15rem 0.5rem; border-radius:0.25rem; border:1px solid var(--td-border-subtle);">
              ID: ${escapeHtml(sub.id)}
            </span>
          </div>
          <div style="font-size:0.8rem; color:var(--td-text-muted);">
            Submitted: <strong style="color:var(--td-text-secondary);">${formattedDate}</strong>
          </div>
        </div>

        <!-- Card Body -->
        <div style="padding:1.5rem;">
          <!-- Provenance Header: Device & Experiment -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem; margin-bottom:1.25rem;">
            <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); font-weight:700; margin-bottom:0.25rem;">
                Target Hardware Tested
              </div>
              <div style="font-weight:700; font-size:1.05rem; color:var(--td-text-primary); margin-bottom:0.25rem;">
                ${escapeHtml(sub.deviceBrand || "")} ${escapeHtml(sub.deviceModel || sub.deviceId)}
              </div>
              <div style="font-size:0.8rem; color:var(--td-text-muted);">
                Device ID: <a href="#/devices/${encodeURIComponent(sub.deviceId)}" style="color:var(--td-info); text-decoration:none;">${escapeHtml(sub.deviceId)} ↗</a>
              </div>
            </div>

            <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); font-weight:700; margin-bottom:0.25rem;">
                Official Protocol Followed
              </div>
              <div style="font-weight:700; font-size:1.05rem; color:var(--td-text-primary); margin-bottom:0.25rem;">
                ${escapeHtml(sub.experimentTitle || sub.experimentId)}
              </div>
              <div style="font-size:0.8rem; color:var(--td-text-muted);">
                Protocol: <a href="#/experiments/${encodeURIComponent(sub.experimentId)}" style="color:var(--td-info); text-decoration:none;">${escapeHtml(sub.experimentId)} ↗</a>
              </div>
            </div>
          </div>

          <!-- Provenance Parameters -->
          <div style="display:flex; flex-wrap:wrap; gap:1.5rem; padding:0.75rem 1rem; background:var(--td-bg-card); border-radius:0.375rem; border:1px solid var(--td-border-subtle); font-size:0.85rem; margin-bottom:1.25rem;">
            <div>
              <span style="color:var(--td-text-muted);">Test Execution Date:</span>
              <strong style="color:var(--td-text-primary); margin-left:0.25rem;">${escapeHtml(testDate)}</strong>
            </div>
            <div>
              <span style="color:var(--td-text-muted);">Software / OS Build:</span>
              <strong style="color:var(--td-text-primary); margin-left:0.25rem;">${escapeHtml(sub.softwareVersion || "Standard")}</strong>
            </div>
            <div>
              <span style="color:var(--td-text-muted);">Submitter:</span>
              <strong style="color:var(--td-text-primary); margin-left:0.25rem;">${escapeHtml(sub.submitterName || "Contributor")}</strong>
            </div>
          </div>

          <!-- Reviewer Feedback Notice (if needs_revision or rejected or approved) -->
          ${sub.reviewNotes ? `
            <div style="margin-bottom:1.25rem; padding:1rem 1.25rem; border-radius:0.5rem; background:${sub.status === 'approved' ? 'rgba(16,185,129,0.1)' : sub.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.12)'}; border:1px solid ${sub.status === 'approved' ? 'var(--td-success)' : sub.status === 'rejected' ? 'var(--td-error)' : 'var(--td-warning)'};">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
                <strong style="color:${sub.status === 'approved' ? 'var(--td-success)' : sub.status === 'rejected' ? 'var(--td-error)' : 'var(--td-warning)'}; font-size:0.85rem; text-transform:uppercase; letter-spacing:0.05em;">
                  🛡️ Moderator Audit Assessment
                </strong>
                <span style="font-size:0.75rem; color:var(--td-text-muted);">
                  ${sub.reviewedAt ? new Date(sub.reviewedAt).toLocaleDateString() : ""}
                </span>
              </div>
              <p style="margin:0; font-size:0.9rem; color:var(--td-text-primary); line-height:1.5;">
                ${escapeHtml(sub.reviewNotes)}
              </p>
            </div>
          ` : ""}

          <!-- Measurements & Conditions Grid -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem; margin-bottom:1.25rem;">
            <!-- Empirical Measurements -->
            <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem;">
              <h4 style="margin:0 0 0.75rem; font-size:0.9rem; font-weight:700; color:var(--td-text-primary); display:flex; align-items:center; gap:0.5rem;">
                <span>📊</span> <span>Recorded Measurements</span>
              </h4>
              ${!measEntries.length ? `<div style="font-size:0.82rem; color:var(--td-text-muted);">No measurements recorded</div>` : `
                <div style="display:flex; flex-direction:column; gap:0.5rem; font-size:0.85rem;">
                  ${measEntries.map(([key, m]) => {
                    const val = typeof m === "object" && m !== null ? m.value : m;
                    const unit = typeof m === "object" && m !== null ? m.unit : "";
                    return `
                      <div style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--td-border-subtle); padding-bottom:0.25rem;">
                        <span style="color:var(--td-text-secondary);">${escapeHtml(key)}:</span>
                        <strong style="color:var(--td-text-primary); font-family:monospace;">${escapeHtml(String(val))} <span style="font-size:0.75rem; color:var(--td-text-muted);">${escapeHtml(unit || "")}</span></strong>
                      </div>
                    `;
                  }).join("")}
                </div>
              `}
            </div>

            <!-- Testing Conditions -->
            <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem;">
              <h4 style="margin:0 0 0.75rem; font-size:0.9rem; font-weight:700; color:var(--td-text-primary); display:flex; align-items:center; gap:0.5rem;">
                <span>⚙️</span> <span>Operational Conditions</span>
              </h4>
              ${!condKeys.length ? `<div style="font-size:0.82rem; color:var(--td-text-muted);">Standard lab baseline conditions</div>` : `
                <div style="display:flex; flex-direction:column; gap:0.5rem; font-size:0.85rem;">
                  ${condKeys.map(key => `
                    <div style="display:flex; justify-content:space-between; border-bottom:1px dashed var(--td-border-subtle); padding-bottom:0.25rem;">
                      <span style="color:var(--td-text-secondary); text-transform:capitalize;">${escapeHtml(key)}:</span>
                      <span style="color:var(--td-text-primary); font-weight:500;">${escapeHtml(String(conditions[key]))}</span>
                    </div>
                  `).join("")}
                </div>
              `}
            </div>
          </div>

          <!-- Evidence Assets -->
          ${evidence.length ? `
            <div style="margin-bottom:1.25rem;">
              <div style="font-size:0.8rem; font-weight:700; color:var(--td-text-muted); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.5rem;">
                Attached Verification Assets (${evidence.length})
              </div>
              <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
                ${evidence.map(e => `
                  <a href="${escapeHtml(e.url)}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:0.375rem; padding:0.375rem 0.75rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.25rem; font-size:0.8rem; color:var(--td-info); text-decoration:none;">
                    <span>📎</span>
                    <span style="max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(e.name || e.fileName)}</span>
                    <span style="font-size:0.7rem; color:var(--td-text-muted);">↗</span>
                  </a>
                `).join("")}
              </div>
            </div>
          ` : ""}

          <!-- Contributor Notes -->
          ${sub.notes ? `
            <div style="background:var(--td-bg-card); border-left:3px solid var(--td-info); border-radius:0.25rem; padding:0.75rem 1rem; font-size:0.88rem; color:var(--td-text-secondary); line-height:1.5; margin-bottom:1.25rem;">
              <strong style="color:var(--td-text-primary);">Contributor Notes:</strong> ${escapeHtml(sub.notes)}
            </div>
          ` : ""}

          <!-- Actions & Management Row -->
          <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--td-border-subtle); padding-top:1rem; flex-wrap:wrap; gap:0.75rem;">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              ${sub.status === "needs_revision" ? `
                <a href="#/submit?edit=${encodeURIComponent(sub.id)}" style="display:inline-flex; align-items:center; gap:0.375rem; padding:0.5rem 1rem; background:var(--td-warning); color:#000; border-radius:0.375rem; font-weight:700; font-size:0.85rem; text-decoration:none;">
                  <span>✏️</span> <span>Edit &amp; Resubmit</span>
                </a>
              ` : isEditable ? `
                <a href="#/submit?edit=${encodeURIComponent(sub.id)}" style="display:inline-flex; align-items:center; gap:0.375rem; padding:0.4rem 0.875rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-secondary); border-radius:0.375rem; font-weight:600; font-size:0.85rem; text-decoration:none;">
                  <span>✏️</span> <span>Edit Test</span>
                </a>
              ` : ""}

              ${isWithdrawable ? `
                <button type="button" class="btn-withdraw-sub" data-id="${escapeHtml(sub.id)}" style="padding:0.4rem 0.875rem; background:transparent; border:1px solid var(--td-border-subtle); color:var(--td-error); border-radius:0.375rem; font-size:0.85rem; cursor:pointer;">
                  Withdraw
                </button>
              ` : ""}
            </div>

            ${isMod ? `
              <button type="button" class="btn-toggle-mod-panel" data-id="${escapeHtml(sub.id)}" style="display:inline-flex; align-items:center; gap:0.375rem; padding:0.4rem 0.875rem; background:rgba(239,68,68,0.1); border:1px solid var(--td-error); color:var(--td-error); border-radius:0.375rem; font-size:0.8rem; font-weight:700; cursor:pointer;">
                <span>🛡️</span> <span>Moderator Decision</span>
              </button>
            ` : ""}
          </div>

          <!-- Moderator Decision Panel (Visible to Admins/Moderators) -->
          ${isMod ? `
            <div id="mod-panel-${escapeHtml(sub.id)}" style="display:none; margin-top:1.25rem; padding:1.25rem; background:var(--td-bg-surface); border:1px solid var(--td-error); border-radius:0.5rem;">
              <div style="font-weight:700; color:var(--td-error); font-size:0.9rem; margin-bottom:0.75rem; display:flex; align-items:center; gap:0.5rem;">
                <span>🛡️</span> <span>Moderator Review Decision Panel (Authorized)</span>
              </div>
              
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; margin-bottom:1rem;">
                <div>
                  <label style="display:block; font-size:0.8rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.25rem;">New Status Decision *</label>
                  <select class="mod-select-status" style="width:100%; padding:0.5rem 0.75rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.88rem;">
                    <option value="approved" ${sub.status === 'approved' ? 'selected' : ''}>✓ Approve (Publish as Verified Community Data)</option>
                    <option value="needs_revision" ${sub.status === 'needs_revision' ? 'selected' : ''}>⚠️ Needs Revision (Return to Contributor)</option>
                    <option value="rejected" ${sub.status === 'rejected' ? 'selected' : ''}>✕ Reject (Violates Protocol / Inauthentic)</option>
                  </select>
                </div>
                <div>
                  <label style="display:block; font-size:0.8rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.25rem;">Review Notes &amp; Rationale *</label>
                  <input type="text" class="mod-input-notes" value="${escapeHtml(sub.reviewNotes || '')}" placeholder="Reasoning for approval, requested changes, or rejection rationale..." style="width:100%; padding:0.5rem 0.75rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.88rem;" />
                </div>
              </div>

              <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
                <button type="button" class="btn-cancel-mod" data-id="${escapeHtml(sub.id)}" style="padding:0.375rem 0.75rem; background:none; border:1px solid var(--td-border-subtle); color:var(--td-text-muted); border-radius:0.25rem; font-size:0.82rem; cursor:pointer;">Cancel</button>
                <button type="button" class="btn-save-mod-decision" data-id="${escapeHtml(sub.id)}" style="padding:0.375rem 1rem; background:var(--td-error); color:#fff; border:none; border-radius:0.25rem; font-size:0.82rem; font-weight:700; cursor:pointer;">Apply Decision</button>
              </div>
            </div>
          ` : ""}
        </div>
      </article>
    `;
  }

  function attachCardListeners() {
    // Withdraw buttons
    container.querySelectorAll(".btn-withdraw-sub").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (!confirm(`Are you sure you want to withdraw submission ${id}? This action cannot be undone.`)) return;

        try {
          await withdrawSubmission(id, currentUser.uid);
          renderMyTestsView(container);
        } catch (err) {
          alert(`Could not withdraw submission: ${err.message}`);
        }
      });
    });

    // Moderator toggle buttons
    container.querySelectorAll(".btn-toggle-mod-panel").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const panel = document.getElementById(`mod-panel-${id}`);
        if (panel) {
          panel.style.display = panel.style.display === "none" ? "block" : "none";
        }
      });
    });

    container.querySelectorAll(".btn-cancel-mod").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const panel = document.getElementById(`mod-panel-${id}`);
        if (panel) panel.style.display = "none";
      });
    });

    // Moderator decision submit
    container.querySelectorAll(".btn-save-mod-decision").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const panel = document.getElementById(`mod-panel-${id}`);
        if (!panel) return;

        const statusSelect = panel.querySelector(".mod-select-status");
        const notesInput = panel.querySelector(".mod-input-notes");

        const status = statusSelect?.value;
        const reviewNotes = notesInput?.value?.trim() || "";

        if (!status) return;

        btn.disabled = true;
        btn.textContent = "Saving...";

        try {
          await reviewSubmission(id, {
            status,
            reviewNotes,
            reviewerId: currentUser.uid,
            reviewerName: currentUser.displayName || "Moderator"
          });

          renderMyTestsView(container);
        } catch (err) {
          alert(`Moderator review failed: ${err.message}`);
          btn.disabled = false;
          btn.textContent = "Apply Decision";
        }
      });
    });
  }

  render();
}
