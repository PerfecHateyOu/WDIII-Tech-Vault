/**
 * WDIII Community Testing - Submit Test View Module
 * Route: #/submit
 * 
 * Enforces:
 * 1. Community tests must follow an official WDIII protocol.
 * 2. Authenticated contributors only.
 * 3. Structured data entry with explicit measurement units.
 * 4. Evidence file upload to Firebase Storage with local fallback.
 * 5. Initial status strictly set to 'pending_review'.
 * 6. Visual and structural separation from official WDIII archive.
 */

import { getAllDevices, getAllExperiments, getDeviceById, getExperimentById, createSubmission, updateSubmission, getSubmissionById, saveDraftSubmission, loadDraftSubmission, clearDraftSubmission } from "../services/database.js";
import { getCurrentUser, getUserProfile, onAuthChange, signInWithGoogle, uploadEvidenceFile, deleteEvidenceFile } from "../services/firebase.js";
import { escapeHtml, sanitizeText } from "../utils/sanitize.js";

export async function renderSubmitView(container) {
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center; padding:3rem; color:var(--td-text-muted);">
      <div style="font-size:2rem; margin-bottom:0.75rem;">🧪</div>
      <div style="font-weight:600; color:var(--td-text-primary);">Loading Community Testing Protocol Lab...</div>
    </div>
  `;

  // Parse query parameters (e.g. ?edit=sub_xxx or ?device=xxx&experiment=xxx)
  const hash = window.location.hash || "";
  const queryStr = hash.includes("?") ? hash.substring(hash.indexOf("?") + 1) : "";
  const params = new URLSearchParams(queryStr);
  const editSubmissionId = params.get("edit");
  const preselectedDeviceId = params.get("device");
  const preselectedExperimentId = params.get("experiment");

  const currentUser = getCurrentUser();

  if (!currentUser) {
    renderAuthPrompt(container);
    return;
  }

  try {
    const [allDevices, allExperiments] = await Promise.all([
      getAllDevices(),
      getAllExperiments()
    ]);

    let existingSubmission = null;
    if (editSubmissionId) {
      existingSubmission = await getSubmissionById(editSubmissionId, currentUser.uid);
      if (existingSubmission && !["pending_review", "pending", "needs_revision"].includes(existingSubmission.status)) {
        container.innerHTML = `
          <div style="max-width:720px; margin:2rem auto; padding:2rem; background:var(--td-bg-card); border:1px solid var(--td-warning); border-radius:0.5rem; text-align:center;">
            <div style="font-size:2.5rem; margin-bottom:1rem;">⚠️</div>
            <h3 style="color:var(--td-text-primary); margin-bottom:0.5rem;">Submission Cannot Be Edited</h3>
            <p style="color:var(--td-text-secondary); margin-bottom:1.5rem;">
              This test submission is currently in status <strong style="color:var(--td-info); text-transform:uppercase;">${escapeHtml(existingSubmission.status)}</strong>. Only tests pending review or awaiting revision can be updated.
            </p>
            <a href="#/my-tests" style="display:inline-block; padding:0.5rem 1.25rem; background:var(--td-info); color:#fff; border-radius:0.375rem; text-decoration:none; font-weight:600;">Return to My Tests</a>
          </div>
        `;
        return;
      }
    }

    renderSubmissionForm(container, {
      currentUser,
      allDevices,
      allExperiments,
      existingSubmission,
      preselectedDeviceId: preselectedDeviceId || existingSubmission?.deviceId || "",
      preselectedExperimentId: preselectedExperimentId || existingSubmission?.experimentId || ""
    });
  } catch (err) {
    console.error("Error preparing submit view:", err);
    container.innerHTML = `
      <div style="max-width:640px; margin:2rem auto; padding:2rem; background:var(--td-bg-card); border:1px solid var(--td-error); border-radius:0.5rem; text-align:center;">
        <h3 style="color:var(--td-error); margin-bottom:0.5rem;">Initialization Error</h3>
        <p style="color:var(--td-text-secondary);">${escapeHtml(err.message)}</p>
        <a href="#/" style="display:inline-block; margin-top:1rem; color:var(--td-info);">Return to Home</a>
      </div>
    `;
  }
}

function renderAuthPrompt(container) {
  container.innerHTML = `
    <div style="max-width:720px; margin:3rem auto; padding:2.5rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; text-align:center;">
      <div style="display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; border-radius:50%; background:rgba(96,165,250,0.12); color:var(--td-info); font-size:2rem; margin-bottom:1.25rem;">
        🧪
      </div>
      <h2 style="color:var(--td-text-primary); font-size:1.6rem; font-weight:700; margin-bottom:0.5rem;">
        Community Testing Protocol Submission
      </h2>
      <p style="color:var(--td-text-secondary); font-size:1rem; line-height:1.6; max-width:540px; margin:0 auto 1.5rem;">
        To uphold strict scientific integrity, prevent automated spam, and maintain clear audit trails, all community test submissions require an authenticated contributor account.
      </p>

      <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem; text-align:left; max-width:520px; margin:0 auto 2rem; font-size:0.9rem; color:var(--td-text-secondary); line-height:1.6;">
        <div style="font-weight:700; color:var(--td-text-primary); margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">
          <span>⚖️</span> <span>WDIII Protocol Ground Rules:</span>
        </div>
        <ul style="margin:0; padding-left:1.25rem;">
          <li style="margin-bottom:0.35rem;">Community members test against <strong>official WDIII protocols only</strong>.</li>
          <li style="margin-bottom:0.35rem;">Every submission records who submitted it, hardware build, testing environment, and measurements.</li>
          <li style="margin-bottom:0.35rem;">Submissions are queued as <strong>Pending Review</strong> until vetted by peer moderators.</li>
          <li>Approved community data is clearly distinguished from the official vault archive.</li>
        </ul>
      </div>

      <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
        <button id="btnSubmitSignIn" style="display:inline-flex; align-items:center; gap:0.625rem; padding:0.625rem 1.5rem; background:var(--td-info); color:#fff; font-weight:600; font-size:0.95rem; border-radius:0.375rem; border:none; cursor:pointer;">
          <svg style="width:18px; height:18px;" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Sign In with Google to Submit Test</span>
        </button>
        <a href="#/devices" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.625rem 1.25rem; background:transparent; border:1px solid var(--td-border-subtle); color:var(--td-text-secondary); text-decoration:none; font-size:0.95rem; border-radius:0.375rem;">
          Browse Hardware Registry
        </a>
      </div>
    </div>
  `;

  document.getElementById("btnSubmitSignIn")?.addEventListener("click", async () => {
    try {
      await signInWithGoogle();
      renderSubmitView(container);
    } catch (err) {
      console.warn("Sign in error:", err);
    }
  });
}

function renderSubmissionForm(container, ctx) {
  const { currentUser, allDevices, allExperiments, existingSubmission, preselectedDeviceId, preselectedExperimentId } = ctx;

  // Check if draft exists
  const savedDraft = !existingSubmission ? loadDraftSubmission(currentUser.uid) : null;

  // Initial form state
  let state = {
    deviceId: existingSubmission?.deviceId || savedDraft?.deviceId || preselectedDeviceId || (allDevices[0]?.id || ""),
    experimentId: existingSubmission?.experimentId || savedDraft?.experimentId || preselectedExperimentId || (allExperiments[0]?.id || ""),
    testDate: existingSubmission?.testDate || savedDraft?.testDate || new Date().toISOString().split("T")[0],
    softwareVersion: existingSubmission?.softwareVersion || savedDraft?.softwareVersion || "",
    conditions: existingSubmission?.conditions || savedDraft?.conditions || {},
    measurements: existingSubmission?.measurements || savedDraft?.measurements || {},
    notes: existingSubmission?.notes || savedDraft?.notes || "",
    evidenceReferences: existingSubmission?.evidenceReferences ? [...existingSubmission.evidenceReferences] : (savedDraft?.evidenceReferences || []),
    certified: false,
    customMeasurements: []
  };

  // Convert custom measurements if not in standard template
  if (state.measurements) {
    const stdKeys = ["repairCost", "turnaroundDays", "qualityRating", "screenOnTimeMinutes", "chargeTimeMinutes", "batteryDegradationPct", "peakTempC", "fpsStabilityPct", "waitMinutes", "resolutionRate"];
    for (const [k, v] of Object.entries(state.measurements)) {
      if (!stdKeys.includes(k) && typeof v === "object" && v !== null && v.value !== undefined) {
        state.customMeasurements.push({ name: k, value: v.value, unit: v.unit || "" });
      }
    }
  }

  function getSelectedDevice() {
    return allDevices.find(d => d.id === state.deviceId) || allDevices[0];
  }

  function getSelectedExperiment() {
    return allExperiments.find(e => e.id === state.experimentId) || allExperiments[0];
  }

  container.innerHTML = `
    <div style="max-width:960px; margin:1.5rem auto 3rem; padding:0 1rem;">
      <!-- Breadcrumbs -->
      <nav style="display:flex; align-items:center; flex-wrap:wrap; gap:0.375rem; font-size:0.85rem; color:var(--td-text-muted); margin-bottom:1.5rem;">
        <a href="#/" style="color:var(--td-text-secondary); padding:0.25rem 0.5rem; text-decoration:none;">🏠 Home</a>
        <span style="opacity:0.6;">/</span>
        <a href="#/my-tests" style="color:var(--td-text-secondary); padding:0.25rem 0.5rem; text-decoration:none;">📋 Community Tests</a>
        <span style="opacity:0.6;">/</span>
        <span style="color:var(--td-text-primary); padding:0.25rem 0.5rem; font-weight:600;">
          ${existingSubmission ? "✏️ Edit Test Submission" : "🧪 Submit Empirical Test"}
        </span>
      </nav>

      <!-- Header Banner -->
      <div style="background:linear-gradient(135deg, var(--td-bg-surface-elevated), var(--td-bg-card)); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.75rem 2rem; margin-bottom:2rem; position:relative; overflow:hidden;">
        <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
          <div>
            <div style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.25rem 0.625rem; border-radius:9999px; background:rgba(96,165,250,0.12); border:1px solid var(--td-info); color:var(--td-info); font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.75rem;">
              <span>🔬</span> <span>Standardized Protocol Submission</span>
            </div>
            <h1 style="color:var(--td-text-primary); font-size:1.75rem; font-weight:700; margin:0 0 0.5rem;">
              ${existingSubmission ? `Edit Test #${escapeHtml(existingSubmission.id)}` : "Submit Test Under Official Protocol"}
            </h1>
            <p style="color:var(--td-text-secondary); margin:0; font-size:0.95rem; line-height:1.5; max-width:680px;">
              Submit your firsthand empirical test results against a standardized WDIII research protocol. Every result undergoes peer moderator review before publication.
            </p>
          </div>
          ${savedDraft && !existingSubmission ? `
            <div id="draftNoticeBanner" style="display:flex; align-items:center; gap:0.5rem; background:rgba(245,158,11,0.1); border:1px solid var(--td-warning); padding:0.5rem 0.875rem; border-radius:0.375rem; font-size:0.8rem; color:var(--td-warning);">
              <span>💾 Restored from draft (${new Date(savedDraft.savedAt).toLocaleTimeString()})</span>
              <button id="btnClearDraft" type="button" style="background:none; border:none; color:var(--td-text-muted); cursor:pointer; font-size:0.8rem; text-decoration:underline;">Discard</button>
            </div>
          ` : ""}
        </div>

        ${existingSubmission && existingSubmission.status === "needs_revision" ? `
          <div style="margin-top:1.25rem; padding:1rem 1.25rem; border-radius:0.5rem; background:rgba(245,158,11,0.12); border:1px solid var(--td-warning); color:var(--td-warning);">
            <div style="font-weight:700; margin-bottom:0.25rem; display:flex; align-items:center; gap:0.5rem;">
              <span>⚠️</span> <span>Reviewer Requested Revisions</span>
            </div>
            <p style="margin:0 0 0.5rem; font-size:0.9rem; color:var(--td-text-primary); line-height:1.5;">
              ${escapeHtml(existingSubmission.reviewNotes || "Please verify your conditions, measurements, and upload missing photographic/invoice evidence.")}
            </p>
            <div style="font-size:0.75rem; color:var(--td-text-muted);">
              Updated submissions will be automatically transitioned back to <strong>pending_review</strong>.
            </div>
          </div>
        ` : ""}
      </div>

      <!-- Main Submission Form Card -->
      <form id="submissionForm" style="display:flex; flex-direction:column; gap:2rem;">
        
        <!-- STEP 1: TARGET HARDWARE SELECTION -->
        <section style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.75rem;">
          <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.25rem; border-bottom:1px solid var(--td-border-subtle); padding-bottom:0.75rem;">
            <div style="display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:var(--td-info); color:#fff; font-size:0.85rem; font-weight:700;">1</div>
            <div>
              <h2 style="font-size:1.15rem; font-weight:700; color:var(--td-text-primary); margin:0;">Select Target Hardware</h2>
              <div style="font-size:0.8rem; color:var(--td-text-muted);">Identify the exact physical device tested from the official hardware catalog</div>
            </div>
          </div>

          <div style="margin-bottom:1rem;">
            <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.5rem;">Device from Registry *</label>
            <select id="deviceSelect" style="width:100%; padding:0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.92rem; outline:none;">
              ${allDevices.map(d => `
                <option value="${escapeHtml(d.id)}" ${d.id === state.deviceId ? "selected" : ""}>
                  ${escapeHtml(d.brand)} ${escapeHtml(d.model)} (${escapeHtml(d.releaseYear || "Hardware")} - ${escapeHtml(d.category || "device")})
                </option>
              `).join("")}
            </select>
          </div>

          <!-- Selected Device Preview Card -->
          <div id="devicePreviewCard" style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem 1.25rem; display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
            <!-- Rendered dynamically -->
          </div>
        </section>

        <!-- STEP 2: OFFICIAL EXPERIMENT PROTOCOL SELECTION -->
        <section style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.75rem;">
          <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.25rem; border-bottom:1px solid var(--td-border-subtle); padding-bottom:0.75rem;">
            <div style="display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:var(--td-info); color:#fff; font-size:0.85rem; font-weight:700;">2</div>
            <div>
              <h2 style="font-size:1.15rem; font-weight:700; color:var(--td-text-primary); margin:0;">Select Official Protocol</h2>
              <div style="font-size:0.8rem; color:var(--td-text-muted);">Community submissions must strictly reproduce an established WDIII testing methodology</div>
            </div>
          </div>

          <div style="margin-bottom:1rem;">
            <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.5rem;">Standardized Protocol *</label>
            <select id="experimentSelect" style="width:100%; padding:0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.92rem; outline:none;">
              ${allExperiments.map(e => `
                <option value="${escapeHtml(e.id)}" ${e.id === state.experimentId ? "selected" : ""}>
                  [${escapeHtml(e.category ? e.category.toUpperCase() : "TEST")}] ${escapeHtml(e.title)}
                </option>
              `).join("")}
            </select>
          </div>

          <!-- Protocol Details Preview -->
          <div id="protocolPreviewCard" style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem;">
            <!-- Rendered dynamically -->
          </div>
        </section>

        <!-- STEP 3: TESTING CONDITIONS & ENVIRONMENT -->
        <section style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.75rem;">
          <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.25rem; border-bottom:1px solid var(--td-border-subtle); padding-bottom:0.75rem;">
            <div style="display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:var(--td-info); color:#fff; font-size:0.85rem; font-weight:700;">3</div>
            <div>
              <h2 style="font-size:1.15rem; font-weight:700; color:var(--td-text-primary); margin:0;">Testing Conditions &amp; Baseline Metadata</h2>
              <div style="font-size:0.8rem; color:var(--td-text-muted);">Record operating system builds, ambient conditions, and operational variables</div>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1rem; margin-bottom:1.25rem;">
            <div>
              <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Test Execution Date *</label>
              <input type="date" id="inputTestDate" value="${escapeHtml(state.testDate)}" style="width:100%; padding:0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.9rem;" required />
            </div>

            <div>
              <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Software Version / OS Build *</label>
              <input type="text" id="inputSoftwareVersion" value="${escapeHtml(state.softwareVersion)}" placeholder="e.g., iOS 18.2.1 (22C150) or Android 15 (AP2A.241005.015)" style="width:100%; padding:0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.9rem;" required />
            </div>
          </div>

          <!-- Dynamic Condition Fields based on Protocol Category -->
          <div id="dynamicConditionsContainer" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1rem;">
            <!-- Populated based on selected experiment category -->
          </div>
        </section>

        <!-- STEP 4: EMPIRICAL MEASUREMENTS WITH UNITS -->
        <section style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.75rem;">
          <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.25rem; border-bottom:1px solid var(--td-border-subtle); padding-bottom:0.75rem;">
            <div style="display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:var(--td-info); color:#fff; font-size:0.85rem; font-weight:700;">4</div>
            <div>
              <h2 style="font-size:1.15rem; font-weight:700; color:var(--td-text-primary); margin:0;">Empirical Measurements &amp; Quantitative Metrics</h2>
              <div style="font-size:0.8rem; color:var(--td-text-muted);">Enter quantitative findings with explicit locked units (USD $, minutes, percentage %, °C)</div>
            </div>
          </div>

          <div id="dynamicMeasurementsContainer" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1rem; margin-bottom:1.5rem;">
            <!-- Populated based on protocol category -->
          </div>

          <!-- Custom Additional Metrics -->
          <div style="border-top:1px dashed var(--td-border-subtle); padding-top:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
              <span style="font-size:0.85rem; font-weight:600; color:var(--td-text-secondary);">Additional Protocol Telemetry (Optional)</span>
              <button type="button" id="btnAddCustomMetric" style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-info); padding:0.25rem 0.625rem; border-radius:0.25rem; font-size:0.8rem; cursor:pointer; font-weight:600;">+ Add Metric</button>
            </div>
            <div id="customMetricsList" style="display:flex; flex-direction:column; gap:0.5rem;">
              <!-- Rendered custom metrics -->
            </div>
          </div>
        </section>

        <!-- STEP 5: EVIDENCE & TELEMETRY UPLOAD -->
        <section style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.75rem;">
          <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.25rem; border-bottom:1px solid var(--td-border-subtle); padding-bottom:0.75rem;">
            <div style="display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:var(--td-info); color:#fff; font-size:0.85rem; font-weight:700;">5</div>
            <div>
              <h2 style="font-size:1.15rem; font-weight:700; color:var(--td-text-primary); margin:0;">Supporting Evidence &amp; Verification Assets</h2>
              <div style="font-size:0.8rem; color:var(--td-text-muted);">Attach photographic proof, repair invoices, benchmark logs, or diagnostic screenshots (Max 10MB each)</div>
            </div>
          </div>

          <!-- Drag and Drop Dropzone -->
          <div id="evidenceDropzone" style="border:2px dashed var(--td-border-subtle); border-radius:0.5rem; padding:2rem 1.5rem; text-align:center; background:var(--td-bg-card); cursor:pointer; transition:border-color 0.2s, background 0.2s;">
            <div style="font-size:2rem; margin-bottom:0.5rem;">📎</div>
            <div style="font-weight:600; color:var(--td-text-primary); font-size:0.95rem; margin-bottom:0.25rem;">
              Drag &amp; drop evidence files here, or <span style="color:var(--td-info); text-decoration:underline;">browse files</span>
            </div>
            <div style="font-size:0.8rem; color:var(--td-text-muted);">
              Accepted formats: PNG, JPG, WEBP, PDF, CSV, TXT, JSON (Max 10MB per asset)
            </div>
            <input type="file" id="evidenceFileInput" multiple accept="image/*,application/pdf,text/plain,text/csv,application/json" style="display:none;" />
          </div>

          <!-- Upload Progress Bar -->
          <div id="uploadProgressBarContainer" style="display:none; margin-top:1rem;">
            <div style="display:flex; justify-content:space-between; font-size:0.8rem; color:var(--td-text-secondary); margin-bottom:0.25rem;">
              <span id="uploadStatusText">Uploading evidence to vault storage...</span>
              <span id="uploadPercentText">0%</span>
            </div>
            <div style="height:6px; width:100%; background:var(--td-bg-surface); border-radius:9999px; overflow:hidden;">
              <div id="uploadProgressBar" style="height:100%; width:0%; background:var(--td-info); transition:width 0.2s;"></div>
            </div>
          </div>

          <!-- Uploaded Evidence List -->
          <div id="uploadedEvidenceList" style="margin-top:1.25rem; display:flex; flex-direction:column; gap:0.5rem;">
            <!-- Rendered list of attached files -->
          </div>
        </section>

        <!-- STEP 6: NOTES, CERTIFICATION & SUBMISSION -->
        <section style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.75rem;">
          <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:1.25rem; border-bottom:1px solid var(--td-border-subtle); padding-bottom:0.75rem;">
            <div style="display:flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:var(--td-info); color:#fff; font-size:0.85rem; font-weight:700;">6</div>
            <div>
              <h2 style="font-size:1.15rem; font-weight:700; color:var(--td-text-primary); margin:0;">Contributor Observations &amp; Verification</h2>
              <div style="font-size:0.8rem; color:var(--td-text-muted);">Provide context, testing anomalies, and certify empirical authenticity</div>
            </div>
          </div>

          <div style="margin-bottom:1.5rem;">
            <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Qualitative Notes &amp; Observations</label>
            <textarea id="inputNotes" rows="4" placeholder="Detail any unexpected behaviors, environmental shifts, customer support friction, or procedural deviations during the test..." style="width:100%; padding:0.75rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.9rem; resize:vertical;">${escapeHtml(state.notes)}</textarea>
            <div style="font-size:0.75rem; color:var(--td-text-muted); text-align:right; margin-top:0.25rem;">Max 5,000 characters</div>
          </div>

          <!-- Protocol Compliance Certification Checkbox -->
          <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem; margin-bottom:1.5rem;">
            <label style="display:flex; align-items:flex-start; gap:0.75rem; cursor:pointer;">
              <input type="checkbox" id="checkCertified" style="margin-top:0.25rem; width:18px; height:18px; cursor:pointer;" required />
              <div style="font-size:0.88rem; color:var(--td-text-secondary); line-height:1.5;">
                <strong style="color:var(--td-text-primary);">Official Protocol Compliance Attestation:</strong>
                I hereby certify that this test was performed strictly under the specified WDIII protocol methodology using firsthand hardware. The reported conditions, software versions, quantitative measurements, and attached evidence are authentic and accurate to the best of my knowledge.
              </div>
            </label>
          </div>

          <!-- Submission Feedback Banner (Error/Success) -->
          <div id="submitMessageBanner" style="display:none; padding:1rem; border-radius:0.375rem; margin-bottom:1.5rem; font-size:0.9rem;"></div>

          <!-- Actions Row -->
          <div style="display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;">
            <div style="display:flex; gap:0.75rem;">
              <button type="button" id="btnSaveDraft" style="padding:0.625rem 1.25rem; background:transparent; border:1px solid var(--td-border-subtle); color:var(--td-text-secondary); border-radius:0.375rem; font-size:0.9rem; font-weight:600; cursor:pointer;">
                💾 Save Local Draft
              </button>
              <a href="#/my-tests" style="padding:0.625rem 1.25rem; background:transparent; border:1px solid transparent; color:var(--td-text-muted); text-decoration:none; font-size:0.9rem;">
                Cancel
              </a>
            </div>

            <button type="submit" id="btnSubmitTest" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.75rem 2rem; background:var(--td-info); color:#fff; border-radius:0.375rem; border:none; font-size:1rem; font-weight:700; cursor:pointer; box-shadow:0 4px 12px rgba(96,165,250,0.25);">
              <span>🚀</span>
              <span>${existingSubmission ? "Resubmit Test for Review" : "Submit Test for Peer Review"}</span>
            </button>
          </div>
        </section>
      </form>
    </div>
  `;

  // UI Element References
  const deviceSelect = document.getElementById("deviceSelect");
  const experimentSelect = document.getElementById("experimentSelect");
  const devicePreviewCard = document.getElementById("devicePreviewCard");
  const protocolPreviewCard = document.getElementById("protocolPreviewCard");
  const dynamicConditionsContainer = document.getElementById("dynamicConditionsContainer");
  const dynamicMeasurementsContainer = document.getElementById("dynamicMeasurementsContainer");
  const customMetricsList = document.getElementById("customMetricsList");
  const btnAddCustomMetric = document.getElementById("btnAddCustomMetric");
  const evidenceDropzone = document.getElementById("evidenceDropzone");
  const evidenceFileInput = document.getElementById("evidenceFileInput");
  const uploadedEvidenceList = document.getElementById("uploadedEvidenceList");
  const uploadProgressBarContainer = document.getElementById("uploadProgressBarContainer");
  const uploadProgressBar = document.getElementById("uploadProgressBar");
  const uploadPercentText = document.getElementById("uploadPercentText");
  const submissionForm = document.getElementById("submissionForm");
  const btnSaveDraft = document.getElementById("btnSaveDraft");
  const submitMessageBanner = document.getElementById("submitMessageBanner");
  const btnClearDraft = document.getElementById("btnClearDraft");

  // Update Previews
  function updateDevicePreview() {
    const dev = getSelectedDevice();
    if (!dev) return;
    devicePreviewCard.innerHTML = `
      <div style="display:flex; align-items:center; gap:1rem;">
        <div style="font-size:2rem; width:44px; height:44px; display:flex; align-items:center; justify-content:center; background:var(--td-bg-surface); border-radius:0.5rem; border:1px solid var(--td-border-subtle);">
          ${dev.category === "laptop" ? "💻" : "📱"}
        </div>
        <div>
          <div style="font-weight:700; color:var(--td-text-primary); font-size:1.05rem;">
            ${escapeHtml(dev.brand)} ${escapeHtml(dev.model)}
          </div>
          <div style="font-size:0.8rem; color:var(--td-text-muted);">
            Category: <strong>${escapeHtml(dev.category || "Smartphones")}</strong> | Release: <strong>${escapeHtml(dev.releaseYear || "N/A")}</strong> | Architecture: <strong>${escapeHtml(dev.specs?.cpu || dev.specs?.display || "Standard")}</strong>
          </div>
        </div>
      </div>
      <a href="#/devices/${encodeURIComponent(dev.id)}" target="_blank" style="font-size:0.8rem; color:var(--td-info); text-decoration:none; display:inline-flex; align-items:center; gap:0.25rem;">
        <span>View Hardware Spec Sheet</span> <span>↗</span>
      </a>
    `;
  }

  function updateProtocolPreview() {
    const exp = getSelectedExperiment();
    if (!exp) return;

    let catColor = "var(--td-info)";
    if (exp.category === "repair") catColor = "var(--td-info)";
    else if (exp.category === "battery" || exp.category === "hardware") catColor = "var(--td-success)";
    else if (exp.category === "support") catColor = "var(--td-warning)";
    else if (exp.category === "software" || exp.category === "ai") catColor = "var(--td-ai, #a78bfa)";

    protocolPreviewCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap; margin-bottom:0.75rem;">
        <div>
          <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; padding:0.15rem 0.5rem; border-radius:0.25rem; background:rgba(96,165,250,0.12); color:${catColor}; border:1px solid ${catColor}; margin-right:0.5rem;">
            ${escapeHtml(exp.category ? exp.category.toUpperCase() : "PROTOCOL")}
          </span>
          <span style="font-weight:700; color:var(--td-text-primary); font-size:1.1rem;">
            ${escapeHtml(exp.title)}
          </span>
        </div>
        <a href="#/experiments/${encodeURIComponent(exp.id)}" target="_blank" style="font-size:0.8rem; color:var(--td-info); text-decoration:none; display:inline-flex; align-items:center; gap:0.25rem;">
          <span>Read Vault Protocol</span> <span>↗</span>
        </a>
      </div>

      <div style="font-size:0.88rem; color:var(--td-text-secondary); line-height:1.6; margin-bottom:1rem;">
        <strong>Research Inquest:</strong> ${escapeHtml(exp.researchQuestion || exp.subtitle || "Standardized empirical hardware/software evaluation")}
      </div>

      <div style="background:var(--td-bg-surface); border:1px solid var(--td-border-subtle); border-radius:0.375rem; padding:0.75rem 1rem; font-size:0.82rem; color:var(--td-text-muted); line-height:1.5;">
        <strong style="color:var(--td-text-primary);">Mandatory Scope &amp; Constraints:</strong>
        ${escapeHtml(exp.scope || "Single controlled reproduceable trial. Measurements must be recorded within 48 hours of test completion with photographic/receipt validation.")}
      </div>
    `;

    renderDynamicConditions(exp.category);
    renderDynamicMeasurements(exp.category);
  }

  function renderDynamicConditions(category) {
    const conds = state.conditions || {};
    let html = "";

    if (category === "repair") {
      html += `
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Repair Channel / Provider *</label>
          <select id="cond_channel" style="width:100%; padding:0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.9rem;">
            <option value="Official OEM (Apple Store / Samsung Care)" ${conds.channel?.includes("OEM") ? "selected" : ""}>Official OEM (Apple Store / Samsung Care)</option>
            <option value="Apple Authorized Service Provider (AASP)" ${conds.channel?.includes("AASP") ? "selected" : ""}>Apple Authorized Service Provider (AASP)</option>
            <option value="Third-Party Independent Shop" ${conds.channel?.includes("Third-Party") ? "selected" : ""}>Third-Party Independent Shop</option>
            <option value="Self-Repair with OEM Parts" ${conds.channel?.includes("Self-Repair") ? "selected" : ""}>Self-Repair with OEM Parts</option>
            <option value="Mail-In Service Depot" ${conds.channel?.includes("Mail-In") ? "selected" : ""}>Mail-In Service Depot</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Part Replacement Type *</label>
          <select id="cond_partType" style="width:100%; padding:0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.9rem;">
            <option value="Display / OLED Assembly" ${conds.partType?.includes("Display") ? "selected" : ""}>Display / OLED Assembly</option>
            <option value="Battery Pack Replacement" ${conds.partType?.includes("Battery") ? "selected" : ""}>Battery Pack Replacement</option>
            <option value="Rear Glass / Enclosure" ${conds.partType?.includes("Rear") ? "selected" : ""}>Rear Glass / Enclosure</option>
            <option value="Charge Port / Logic Board" ${conds.partType?.includes("Port") ? "selected" : ""}>Charge Port / Logic Board</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Part Sourcing Authenticity</label>
          <input type="text" id="cond_partSourcing" value="${escapeHtml(conds.partSourcing || "Genuine OEM")}" placeholder="e.g. Genuine OEM, Refurbished OEM, Aftermarket" style="width:100%; padding:0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.9rem;" />
        </div>
      `;
    } else if (category === "battery" || category === "hardware") {
      html += `
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Power Profile / Mode</label>
          <select id="cond_powerMode" style="width:100%; padding:0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.9rem;">
            <option value="Standard / Balanced" ${conds.powerMode?.includes("Standard") ? "selected" : ""}>Standard / Balanced</option>
            <option value="Low Power Mode / Battery Saver" ${conds.powerMode?.includes("Low") ? "selected" : ""}>Low Power Mode / Battery Saver</option>
            <option value="High Performance / Unconstrained" ${conds.powerMode?.includes("High") ? "selected" : ""}>High Performance / Unconstrained</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Display Brightness Level (%)</label>
          <input type="number" id="cond_brightness" min="0" max="100" value="${escapeHtml(conds.brightness || "50")}" style="width:100%; padding:0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.9rem;" />
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Ambient Temperature (°C)</label>
          <input type="number" id="cond_ambientTemp" value="${escapeHtml(conds.ambientTemp || "22")}" style="width:100%; padding:0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.9rem;" />
        </div>
      `;
    } else if (category === "support") {
      html += `
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Contact Channel</label>
          <select id="cond_supportChannel" style="width:100%; padding:0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.9rem;">
            <option value="Telephone Support (Direct Line)">Telephone Support (Direct Line)</option>
            <option value="Official Live Chat">Official Live Chat</option>
            <option value="In-Store Retail Appointment">In-Store Retail Appointment</option>
            <option value="Email / Asynchronous Portal">Email / Asynchronous Portal</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Issue Inquest Type</label>
          <input type="text" id="cond_issueType" value="${escapeHtml(conds.issueType || "Hardware warranty inquiry")}" placeholder="e.g. Screen warranty, Battery settlement, Billing" style="width:100%; padding:0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.9rem;" />
        </div>
      `;
    } else {
      // General/software/ecosystem default
      html += `
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Environment / Host OS</label>
          <input type="text" id="cond_hostEnv" value="${escapeHtml(conds.hostEnv || "Standard Consumer Workload")}" placeholder="e.g. Standard Consumer Workload, Laboratory Stand" style="width:100%; padding:0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.9rem;" />
        </div>
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Network Connectivity</label>
          <input type="text" id="cond_network" value="${escapeHtml(conds.network || "Wi-Fi 6 (5GHz)")}" placeholder="e.g. Wi-Fi 6 (5GHz), 5G Ultra Wideband, Offline" style="width:100%; padding:0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.9rem;" />
        </div>
      `;
    }

    dynamicConditionsContainer.innerHTML = html;
  }

  function renderDynamicMeasurements(category) {
    const meas = state.measurements || {};
    let html = "";

    if (category === "repair") {
      html += `
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Total Repair Cost *</label>
          <div style="position:relative;">
            <span style="position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); color:var(--td-text-muted); font-weight:700;">$</span>
            <input type="number" step="0.01" min="0" id="meas_repairCost" value="${meas.repairCost?.value ?? (typeof meas.repairCost === "number" ? meas.repairCost : "")}" placeholder="0.00" style="width:100%; padding:0.625rem 3.5rem 0.625rem 1.75rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.95rem; font-weight:600;" required />
            <span style="position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); font-size:0.75rem; font-weight:700; color:var(--td-text-muted); text-transform:uppercase;">USD</span>
          </div>
        </div>

        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Turnaround Time *</label>
          <div style="position:relative;">
            <input type="number" step="0.5" min="0" id="meas_turnaroundDays" value="${meas.turnaroundDays?.value ?? (typeof meas.turnaroundDays === "number" ? meas.turnaroundDays : "")}" placeholder="e.g. 1.5" style="width:100%; padding:0.625rem 4rem 0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.95rem;" required />
            <span style="position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); font-size:0.75rem; font-weight:700; color:var(--td-text-muted); text-transform:uppercase;">Days</span>
          </div>
        </div>

        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Post-Repair Quality Rating (1–10) *</label>
          <div style="position:relative;">
            <input type="number" min="1" max="10" step="1" id="meas_qualityRating" value="${meas.qualityRating?.value ?? (typeof meas.qualityRating === "number" ? meas.qualityRating : "9")}" style="width:100%; padding:0.625rem 4rem 0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.95rem;" required />
            <span style="position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); font-size:0.75rem; font-weight:700; color:var(--td-text-muted); text-transform:uppercase;">/ 10</span>
          </div>
        </div>
      `;
    } else if (category === "battery") {
      html += `
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Screen-On Runtime (SOT) *</label>
          <div style="position:relative;">
            <input type="number" min="0" step="1" id="meas_screenOnTimeMinutes" value="${meas.screenOnTimeMinutes?.value ?? (typeof meas.screenOnTimeMinutes === "number" ? meas.screenOnTimeMinutes : "")}" placeholder="e.g. 480" style="width:100%; padding:0.625rem 4.5rem 0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.95rem;" required />
            <span style="position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); font-size:0.75rem; font-weight:700; color:var(--td-text-muted); text-transform:uppercase;">Minutes</span>
          </div>
        </div>

        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Full Charge Duration (0–100%) *</label>
          <div style="position:relative;">
            <input type="number" min="0" step="1" id="meas_chargeTimeMinutes" value="${meas.chargeTimeMinutes?.value ?? (typeof meas.chargeTimeMinutes === "number" ? meas.chargeTimeMinutes : "")}" placeholder="e.g. 75" style="width:100%; padding:0.625rem 4.5rem 0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.95rem;" required />
            <span style="position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); font-size:0.75rem; font-weight:700; color:var(--td-text-muted); text-transform:uppercase;">Minutes</span>
          </div>
        </div>

        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Peak Thermal Measurement</label>
          <div style="position:relative;">
            <input type="number" step="0.1" id="meas_peakTempC" value="${meas.peakTempC?.value ?? (typeof meas.peakTempC === "number" ? meas.peakTempC : "")}" placeholder="e.g. 38.5" style="width:100%; padding:0.625rem 3.5rem 0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.95rem;" />
            <span style="position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); font-size:0.75rem; font-weight:700; color:var(--td-text-muted); text-transform:uppercase;">°C</span>
          </div>
        </div>
      `;
    } else if (category === "support") {
      html += `
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Wait / Hold Duration *</label>
          <div style="position:relative;">
            <input type="number" min="0" step="1" id="meas_waitMinutes" value="${meas.waitMinutes?.value ?? (typeof meas.waitMinutes === "number" ? meas.waitMinutes : "")}" placeholder="e.g. 14" style="width:100%; padding:0.625rem 4.5rem 0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.95rem;" required />
            <span style="position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); font-size:0.75rem; font-weight:700; color:var(--td-text-muted); text-transform:uppercase;">Minutes</span>
          </div>
        </div>

        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Support Rep Escalations Count *</label>
          <div style="position:relative;">
            <input type="number" min="0" step="1" id="meas_escalationsCount" value="${meas.escalationsCount?.value ?? (typeof meas.escalationsCount === "number" ? meas.escalationsCount : "1")}" style="width:100%; padding:0.625rem 4rem 0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.95rem;" required />
            <span style="position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); font-size:0.75rem; font-weight:700; color:var(--td-text-muted); text-transform:uppercase;">Tiers</span>
          </div>
        </div>

        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Resolution Outcome (0%–100%) *</label>
          <div style="position:relative;">
            <input type="number" min="0" max="100" step="5" id="meas_resolutionRate" value="${meas.resolutionRate?.value ?? (typeof meas.resolutionRate === "number" ? meas.resolutionRate : "100")}" style="width:100%; padding:0.625rem 3.5rem 0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.95rem;" required />
            <span style="position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); font-size:0.75rem; font-weight:700; color:var(--td-text-muted); text-transform:uppercase;">%</span>
          </div>
        </div>
      `;
    } else {
      // General metrics
      html += `
        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Primary Quantitative Metric *</label>
          <div style="position:relative;">
            <input type="number" step="any" id="meas_primaryScore" value="${meas.primaryScore?.value ?? (typeof meas.primaryScore === "number" ? meas.primaryScore : "")}" placeholder="e.g. 94.5" style="width:100%; padding:0.625rem 4rem 0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.95rem;" required />
            <span style="position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); font-size:0.75rem; font-weight:700; color:var(--td-text-muted); text-transform:uppercase;">Units</span>
          </div>
        </div>

        <div>
          <label style="display:block; font-size:0.85rem; font-weight:600; color:var(--td-text-secondary); margin-bottom:0.375rem;">Friction / Delay Measurement</label>
          <div style="position:relative;">
            <input type="number" step="any" id="meas_frictionSeconds" value="${meas.frictionSeconds?.value ?? (typeof meas.frictionSeconds === "number" ? meas.frictionSeconds : "")}" placeholder="e.g. 3.2" style="width:100%; padding:0.625rem 4.5rem 0.625rem 0.875rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.95rem;" />
            <span style="position:absolute; right:0.75rem; top:50%; transform:translateY(-50%); font-size:0.75rem; font-weight:700; color:var(--td-text-muted); text-transform:uppercase;">Seconds</span>
          </div>
        </div>
      `;
    }

    dynamicMeasurementsContainer.innerHTML = html;
  }

  function renderCustomMetrics() {
    customMetricsList.innerHTML = "";
    state.customMeasurements.forEach((metric, index) => {
      const row = document.createElement("div");
      row.style.cssText = "display:grid; grid-template-columns:1fr 120px 100px 36px; gap:0.5rem; align-items:center;";
      row.innerHTML = `
        <input type="text" placeholder="Metric Name (e.g. Memory Pressure)" value="${escapeHtml(metric.name)}" class="custom-metric-name" style="padding:0.5rem 0.75rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.85rem;" />
        <input type="number" step="any" placeholder="Value" value="${escapeHtml(metric.value)}" class="custom-metric-val" style="padding:0.5rem 0.75rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.85rem;" />
        <input type="text" placeholder="Unit" value="${escapeHtml(metric.unit)}" class="custom-metric-unit" style="padding:0.5rem 0.75rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.85rem;" />
        <button type="button" class="btn-remove-metric" style="background:none; border:none; color:var(--td-error); cursor:pointer; font-size:1.1rem;">✕</button>
      `;

      row.querySelector(".custom-metric-name")?.addEventListener("input", e => {
        state.customMeasurements[index].name = e.target.value;
      });
      row.querySelector(".custom-metric-val")?.addEventListener("input", e => {
        state.customMeasurements[index].value = e.target.value;
      });
      row.querySelector(".custom-metric-unit")?.addEventListener("input", e => {
        state.customMeasurements[index].unit = e.target.value;
      });
      row.querySelector(".btn-remove-metric")?.addEventListener("click", () => {
        state.customMeasurements.splice(index, 1);
        renderCustomMetrics();
      });

      customMetricsList.appendChild(row);
    });
  }

  function renderEvidenceList() {
    uploadedEvidenceList.innerHTML = "";
    if (!state.evidenceReferences.length) {
      uploadedEvidenceList.innerHTML = `
        <div style="font-size:0.82rem; color:var(--td-text-muted); text-align:center; padding:0.5rem;">
          No evidence files attached yet. (Highly recommended to ensure moderator approval)
        </div>
      `;
      return;
    }

    state.evidenceReferences.forEach((ref, idx) => {
      const item = document.createElement("div");
      item.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.375rem; padding:0.5rem 0.875rem; font-size:0.85rem;";
      
      const isImg = ref.type?.startsWith("image/") || ref.fileName?.match(/\.(png|jpe?g|webp|gif)$/i);
      const icon = isImg ? "🖼️" : ref.type?.includes("pdf") ? "📄" : "📑";
      const sizeKb = (ref.size / 1024).toFixed(1);

      item.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.625rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          <span>${icon}</span>
          <span style="font-weight:600; color:var(--td-text-primary); overflow:hidden; text-overflow:ellipsis;">${escapeHtml(ref.name || ref.fileName)}</span>
          <span style="font-size:0.75rem; color:var(--td-text-muted);">(${sizeKb} KB)</span>
        </div>
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <a href="${escapeHtml(ref.url)}" target="_blank" rel="noopener" style="color:var(--td-info); text-decoration:none; font-size:0.8rem; font-weight:600;">
            View ↗
          </a>
          <button type="button" class="btn-delete-evidence" style="background:none; border:none; color:var(--td-error); cursor:pointer; font-size:0.9rem;" title="Remove file">
            ✕
          </button>
        </div>
      `;

      item.querySelector(".btn-delete-evidence")?.addEventListener("click", async () => {
        if (ref.path) {
          try {
            await deleteEvidenceFile(ref.path);
          } catch (e) {
            console.warn("Notice deleting evidence file:", e);
          }
        }
        state.evidenceReferences.splice(idx, 1);
        renderEvidenceList();
      });

      uploadedEvidenceList.appendChild(item);
    });
  }

  // File Upload Handlers
  evidenceDropzone.addEventListener("click", () => evidenceFileInput.click());
  
  evidenceDropzone.addEventListener("dragover", e => {
    e.preventDefault();
    evidenceDropzone.style.borderColor = "var(--td-info)";
    evidenceDropzone.style.background = "rgba(96,165,250,0.06)";
  });

  evidenceDropzone.addEventListener("dragleave", () => {
    evidenceDropzone.style.borderColor = "var(--td-border-subtle)";
    evidenceDropzone.style.background = "var(--td-bg-card)";
  });

  evidenceDropzone.addEventListener("drop", async e => {
    e.preventDefault();
    evidenceDropzone.style.borderColor = "var(--td-border-subtle)";
    evidenceDropzone.style.background = "var(--td-bg-card)";
    if (e.dataTransfer.files?.length) {
      await handleFilesUpload(e.dataTransfer.files);
    }
  });

  evidenceFileInput.addEventListener("change", async e => {
    if (e.target.files?.length) {
      await handleFilesUpload(e.target.files);
      evidenceFileInput.value = "";
    }
  });

  async function handleFilesUpload(files) {
    uploadProgressBarContainer.style.display = "block";
    uploadProgressBar.style.width = "0%";
    uploadPercentText.textContent = "0%";

    const total = files.length;
    for (let i = 0; i < total; i++) {
      const file = files[i];
      uploadStatusText.textContent = `Uploading file ${i + 1} of ${total}: ${file.name}...`;

      try {
        const evidenceRecord = await uploadEvidenceFile(file, currentUser.uid, (percent) => {
          const overall = Math.round(((i + (percent / 100)) / total) * 100);
          uploadProgressBar.style.width = `${overall}%`;
          uploadPercentText.textContent = `${overall}%`;
        });

        state.evidenceReferences.push(evidenceRecord);
        renderEvidenceList();
      } catch (err) {
        console.error("Evidence upload failed:", err);
        alert(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    uploadProgressBar.style.width = "100%";
    uploadPercentText.textContent = "100%";
    uploadStatusText.textContent = "Upload complete!";
    setTimeout(() => {
      uploadProgressBarContainer.style.display = "none";
    }, 1200);
  }

  // Event Listeners
  deviceSelect.addEventListener("change", e => {
    state.deviceId = e.target.value;
    updateDevicePreview();
  });

  experimentSelect.addEventListener("change", e => {
    state.experimentId = e.target.value;
    updateProtocolPreview();
  });

  btnAddCustomMetric?.addEventListener("click", () => {
    state.customMeasurements.push({ name: "", value: "", unit: "" });
    renderCustomMetrics();
  });

  btnClearDraft?.addEventListener("click", () => {
    clearDraftSubmission(currentUser.uid);
    document.getElementById("draftNoticeBanner")?.remove();
  });

  // Extract Form Data
  function extractFormData() {
    const testDate = document.getElementById("inputTestDate")?.value || state.testDate;
    const softwareVersion = document.getElementById("inputSoftwareVersion")?.value || "";
    const notes = document.getElementById("inputNotes")?.value || "";
    const exp = getSelectedExperiment();

    // Extract conditions
    const conditions = {};
    if (exp.category === "repair") {
      conditions.channel = document.getElementById("cond_channel")?.value || "";
      conditions.partType = document.getElementById("cond_partType")?.value || "";
      conditions.partSourcing = document.getElementById("cond_partSourcing")?.value || "";
    } else if (exp.category === "battery" || exp.category === "hardware") {
      conditions.powerMode = document.getElementById("cond_powerMode")?.value || "";
      conditions.brightness = document.getElementById("cond_brightness")?.value || "";
      conditions.ambientTemp = document.getElementById("cond_ambientTemp")?.value || "";
    } else if (exp.category === "support") {
      conditions.supportChannel = document.getElementById("cond_supportChannel")?.value || "";
      conditions.issueType = document.getElementById("cond_issueType")?.value || "";
    } else {
      conditions.hostEnv = document.getElementById("cond_hostEnv")?.value || "";
      conditions.network = document.getElementById("cond_network")?.value || "";
    }

    // Extract measurements
    const measurements = {};
    if (exp.category === "repair") {
      const costVal = parseFloat(document.getElementById("meas_repairCost")?.value);
      const daysVal = parseFloat(document.getElementById("meas_turnaroundDays")?.value);
      const ratingVal = parseInt(document.getElementById("meas_qualityRating")?.value, 10);
      measurements.repairCost = { value: isNaN(costVal) ? 0 : costVal, unit: "USD" };
      measurements.turnaroundDays = { value: isNaN(daysVal) ? 0 : daysVal, unit: "Days" };
      measurements.qualityRating = { value: isNaN(ratingVal) ? 0 : ratingVal, unit: "/ 10" };
    } else if (exp.category === "battery") {
      const sotVal = parseFloat(document.getElementById("meas_screenOnTimeMinutes")?.value);
      const chargeVal = parseFloat(document.getElementById("meas_chargeTimeMinutes")?.value);
      const tempVal = parseFloat(document.getElementById("meas_peakTempC")?.value);
      measurements.screenOnTimeMinutes = { value: isNaN(sotVal) ? 0 : sotVal, unit: "Minutes" };
      measurements.chargeTimeMinutes = { value: isNaN(chargeVal) ? 0 : chargeVal, unit: "Minutes" };
      if (!isNaN(tempVal)) measurements.peakTempC = { value: tempVal, unit: "°C" };
    } else if (exp.category === "support") {
      const waitVal = parseFloat(document.getElementById("meas_waitMinutes")?.value);
      const escVal = parseInt(document.getElementById("meas_escalationsCount")?.value, 10);
      const resVal = parseFloat(document.getElementById("meas_resolutionRate")?.value);
      measurements.waitMinutes = { value: isNaN(waitVal) ? 0 : waitVal, unit: "Minutes" };
      measurements.escalationsCount = { value: isNaN(escVal) ? 1 : escVal, unit: "Tiers" };
      measurements.resolutionRate = { value: isNaN(resVal) ? 100 : resVal, unit: "%" };
    } else {
      const primVal = parseFloat(document.getElementById("meas_primaryScore")?.value);
      const fricVal = parseFloat(document.getElementById("meas_frictionSeconds")?.value);
      measurements.primaryScore = { value: isNaN(primVal) ? 0 : primVal, unit: "Score" };
      if (!isNaN(fricVal)) measurements.frictionSeconds = { value: fricVal, unit: "Seconds" };
    }

    // Append custom metrics
    state.customMeasurements.forEach(m => {
      if (m.name && m.name.trim()) {
        const numVal = parseFloat(m.value);
        measurements[m.name.trim()] = {
          value: isNaN(numVal) ? m.value : numVal,
          unit: m.unit?.trim() || ""
        };
      }
    });

    return {
      deviceId: state.deviceId,
      experimentId: state.experimentId,
      testDate,
      softwareVersion,
      conditions,
      measurements,
      notes,
      evidenceReferences: state.evidenceReferences
    };
  }

  // Save Draft Action
  btnSaveDraft?.addEventListener("click", () => {
    const payload = extractFormData();
    saveDraftSubmission(currentUser.uid, payload);
    
    submitMessageBanner.style.display = "block";
    submitMessageBanner.style.background = "rgba(96,165,250,0.12)";
    submitMessageBanner.style.border = "1px solid var(--td-info)";
    submitMessageBanner.style.color = "var(--td-info)";
    submitMessageBanner.textContent = "Draft saved locally. You can navigate away and resume at any time.";
    setTimeout(() => {
      submitMessageBanner.style.display = "none";
    }, 4000);
  });

  // Submit Form Action
  submissionForm.addEventListener("submit", async e => {
    e.preventDefault();

    const checkCertified = document.getElementById("checkCertified");
    if (!checkCertified?.checked) {
      alert("You must certify protocol compliance before submitting.");
      return;
    }

    const payload = extractFormData();

    if (!payload.softwareVersion || !payload.softwareVersion.trim()) {
      alert("Software version / OS build is required to ensure protocol provenance.");
      return;
    }

    const btnSubmit = document.getElementById("btnSubmitTest");
    btnSubmit.disabled = true;
    btnSubmit.style.opacity = "0.7";
    btnSubmit.innerHTML = `<span>⏳</span> <span>Transmitting Test to Vault...</span>`;

    submitMessageBanner.style.display = "none";

    try {
      if (existingSubmission) {
        // Updating an existing submission (e.g. from needs_revision)
        await updateSubmission(existingSubmission.id, payload, currentUser.uid);
        
        submitMessageBanner.style.display = "block";
        submitMessageBanner.style.background = "rgba(16,185,129,0.15)";
        submitMessageBanner.style.border = "1px solid var(--td-success)";
        submitMessageBanner.style.color = "var(--td-success)";
        submitMessageBanner.innerHTML = `
          <strong>✓ Test Updated &amp; Resubmitted!</strong> Status returned to <strong>PENDING REVIEW</strong>. Redirecting to your test portfolio...
        `;
        setTimeout(() => {
          window.location.hash = "#/my-tests";
        }, 1500);
      } else {
        // Creating fresh submission
        const result = await createSubmission({
          ...payload,
          userId: currentUser.uid,
          submitterName: currentUser.displayName || "Community Contributor",
          submitterEmail: currentUser.email || ""
        });

        submitMessageBanner.style.display = "block";
        submitMessageBanner.style.background = "rgba(16,185,129,0.15)";
        submitMessageBanner.style.border = "1px solid var(--td-success)";
        submitMessageBanner.style.color = "var(--td-success)";
        submitMessageBanner.innerHTML = `
          <div style="font-weight:700; margin-bottom:0.25rem;">✓ Empirical Test Submitted Successfully!</div>
          <div style="font-size:0.85rem;">Submission ID: <code>${escapeHtml(result.id)}</code>. Status: <strong>PENDING REVIEW</strong>.</div>
          <div style="margin-top:0.75rem;">
            <a href="#/my-tests" style="display:inline-block; padding:0.375rem 0.875rem; background:var(--td-success); color:#fff; border-radius:0.25rem; font-weight:600; text-decoration:none; font-size:0.85rem;">
              View in My Tests
            </a>
          </div>
        `;

        submissionForm.reset();
        setTimeout(() => {
          window.location.hash = "#/my-tests";
        }, 1800);
      }
    } catch (err) {
      console.error("Submission failed:", err);
      submitMessageBanner.style.display = "block";
      submitMessageBanner.style.background = "rgba(239,68,68,0.15)";
      submitMessageBanner.style.border = "1px solid var(--td-error)";
      submitMessageBanner.style.color = "var(--td-error)";
      submitMessageBanner.textContent = `Submission Error: ${err.message}`;
      btnSubmit.disabled = false;
      btnSubmit.style.opacity = "1";
      btnSubmit.innerHTML = `<span>🚀</span> <span>${existingSubmission ? "Resubmit Test for Review" : "Submit Test for Peer Review"}</span>`;
    }
  });

  // Initial renders
  updateDevicePreview();
  updateProtocolPreview();
  renderCustomMetrics();
  renderEvidenceList();
}
