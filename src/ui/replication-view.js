/**
 * WDIII Community Research Hub - Experiment Replication View Module
 * Route: #/replicate/{experimentId}
 * 
 * Step 6B-1 Implementation:
 * - Schema-driven replication interface for official WDIII experiments
 * - Workflow:
 *     Official Experiment
 *             ↓
 *     Read Official Protocol (Read-Only)
 *             ↓
 *     Select Device (Searchable Device Registry)
 *             ↓
 *     Enter Schema-Defined Measurements (Dynamic form from measurementSchema)
 *             ↓
 *     Enter Test Conditions (Protocol baseline + Contributor additional conditions)
 *             ↓
 *     Attach Evidence (Firebase Storage upload with progress)
 *             ↓
 *     Review Submission (Read-only summary + moderator review notice)
 *             ↓
 *     Submit for Moderator Review (createSubmission -> pending_review)
 * 
 * Complies with strict WDIII design system, permissions, and security rules.
 */

import {
  getExperimentById,
  getExperiments,
  getDevices,
  createSubmission
} from "../services/database.js";
import {
  getCurrentUser,
  signInWithGoogle,
  uploadEvidenceFile,
  deleteEvidenceFile
} from "../services/firebase.js";
import { escapeHtml, sanitizeText } from "../utils/sanitize.js";

/**
 * Format bytes to human readable format
 */
function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Main entry point for #/replicate/{experimentId}
 */
export async function renderReplicationView(container, experimentId) {
  if (!container) return;

  const cleanExpId = (experimentId || "").trim();

  // 1. Loading State
  container.innerHTML = `
    <div style="text-align:center; padding:4rem 1rem; color:var(--td-text-muted);">
      <div style="font-size:2.5rem; margin-bottom:1rem; animation: pulse 1.5s infinite;">🔬</div>
      <div style="font-size:1.1rem; font-weight:600; color:var(--td-text-primary); margin-bottom:0.5rem;">
        Loading Official Experiment Replication Lab...
      </div>
      <div style="font-size:0.88rem; color:var(--td-text-secondary);">
        Fetching authoritative protocol dossier and schema specifications
      </div>
    </div>
  `;

  // 2. Authentication Verification
  // Unauthenticated visitors must NOT be able to create a submission.
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.isVisitor) {
    renderAuthPrompt(container, cleanExpId);
    return;
  }

  // 3. If no experiment ID specified, offer protocol selection picker
  if (!cleanExpId) {
    renderExperimentPicker(container);
    return;
  }

  // 4. Fetch requested experiment & all devices
  let experiment = null;
  let allDevices = [];

  try {
    const [expData, devicesData] = await Promise.all([
      getExperimentById(cleanExpId),
      getDevices()
    ]);
    experiment = expData;
    allDevices = devicesData || [];
  } catch (err) {
    console.error("Error loading experiment replication data:", err);
  }

  if (!experiment) {
    renderNotFoundView(container, cleanExpId);
    return;
  }

  // 5. Initialize Replication State Machine
  const state = {
    step: 1, // 1: Protocol, 2: Device, 3: Measurements, 4: Conditions, 5: Evidence, 6: Review, 7: Success
    experiment,
    allDevices,
    selectedDevice: null,
    measurements: {}, // Key -> Value
    measurementErrors: {}, // Key -> error message
    conditions: {
      testDate: new Date().toISOString().split("T")[0],
      softwareVersion: "",
      additionalConditions: "",
      notes: ""
    },
    evidenceList: [], // Array of { name, fileName, path, url, size, type, description }
    isUploading: false,
    uploadProgress: 0,
    isSubmitting: false,
    submissionResult: null,
    generalError: null
  };

  // Prepopulate default measurement schema keys with blank/default values
  const schema = experiment.measurementSchema || [];
  schema.forEach(field => {
    if (field.type === "boolean") {
      state.measurements[field.key] = false;
    } else {
      state.measurements[field.key] = "";
    }
  });

  // Render the interactive multi-step replication wizard
  renderWizard(container, state);
}

/**
 * Render Authentication Required Banner
 */
function renderAuthPrompt(container, expId) {
  container.innerHTML = `
    <div style="max-width:680px; margin:3rem auto; padding:2.5rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; text-align:center; box-shadow:0 12px 32px rgba(0,0,0,0.25);">
      <div style="display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; border-radius:50%; background:rgba(96,165,250,0.12); color:var(--td-info); font-size:2rem; margin-bottom:1.25rem;">
        🔒
      </div>
      <h2 style="color:var(--td-text-primary); font-size:1.6rem; font-weight:700; margin-bottom:0.5rem;">
        Authentication Required
      </h2>
      <p style="color:var(--td-text-secondary); font-size:0.98rem; line-height:1.6; max-width:540px; margin:0 auto 1.75rem;">
        To uphold strict scientific integrity, prevent automated spam, and maintain permanent provenance audit trails, community experiment replications require an authenticated contributor account.
      </p>

      <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem; text-align:left; max-width:520px; margin:0 auto 2rem; font-size:0.88rem; color:var(--td-text-secondary); line-height:1.6;">
        <div style="font-weight:700; color:var(--td-text-primary); margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem;">
          <span>⚖️</span> <span>WDIII Replication Ground Rules:</span>
        </div>
        <ul style="margin:0; padding-left:1.25rem;">
          <li style="margin-bottom:0.35rem;">Community members test strictly against <strong>official WDIII protocols</strong>.</li>
          <li style="margin-bottom:0.35rem;">Dynamic measurement entries are validated against the official schema.</li>
          <li style="margin-bottom:0.35rem;">Replications enter the <strong>Pending Review</strong> queue for moderator verification.</li>
          <li>Verified community data is integrated alongside official benchmark statistics.</li>
        </ul>
      </div>

      <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
        <button id="btnReplicationSignIn" style="display:inline-flex; align-items:center; gap:0.625rem; padding:0.65rem 1.6rem; background:var(--td-info); color:#fff; font-weight:600; font-size:0.95rem; border-radius:0.375rem; border:none; cursor:pointer; box-shadow:0 4px 12px rgba(2,132,199,0.3);">
          <svg style="width:18px; height:18px;" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Sign In with Google</span>
        </button>
        <a href="#/" style="display:inline-flex; align-items:center; padding:0.65rem 1.25rem; background:transparent; border:1px solid var(--td-border); color:var(--td-text-secondary); border-radius:0.375rem; text-decoration:none; font-size:0.95rem;">
          Return to Tech Vault
        </a>
      </div>
    </div>
  `;

  const signInBtn = container.querySelector("#btnReplicationSignIn");
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

/**
 * Render Experiment Selection Picker (if user hits #/replicate without an ID)
 */
async function renderExperimentPicker(container) {
  let experiments = [];
  try {
    experiments = await getExperiments();
  } catch (err) {
    console.error("Failed to load experiments:", err);
  }

  container.innerHTML = `
    <div style="max-width:980px; margin:2rem auto; padding:0 1rem;">
      <div style="text-align:center; margin-bottom:2rem;">
        <div style="display:inline-block; font-size:2rem; margin-bottom:0.5rem;">🔬</div>
        <h2 style="color:var(--td-text-primary); font-size:1.85rem; font-weight:700; margin:0 0 0.5rem;">
          Community Experiment Replication Lab
        </h2>
        <p style="color:var(--td-text-secondary); font-size:1rem; max-width:640px; margin:0 auto;">
          Select an official authoritative WDIII experiment protocol to conduct an independent replication.
        </p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(290px, 1fr)); gap:1.25rem;">
        ${experiments.map(exp => `
          <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.5rem; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; transition:border-color 0.2s ease;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                <span style="font-size:0.75rem; text-transform:uppercase; font-weight:700; letter-spacing:0.05em; color:var(--td-info);">
                  EXP ${escapeHtml(exp.experimentNumber || exp.id)}
                </span>
                <span style="font-size:0.75rem; padding:0.15rem 0.5rem; border-radius:9999px; background:rgba(96,165,250,0.1); color:var(--td-info); text-transform:capitalize;">
                  ${escapeHtml(exp.category || "General")}
                </span>
              </div>
              <h3 style="color:var(--td-text-primary); font-size:1.05rem; font-weight:600; margin:0 0 0.5rem; line-height:1.4;">
                ${escapeHtml(exp.title)}
              </h3>
              <p style="color:var(--td-text-secondary); font-size:0.85rem; line-height:1.5; margin:0 0 1rem; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">
                ${escapeHtml(exp.researchQuestion || exp.objective || "")}
              </p>
            </div>
            <div>
              <a href="#/replicate/${encodeURIComponent(exp.id)}" style="display:block; text-align:center; padding:0.55rem 1rem; background:var(--td-info); color:#fff; text-decoration:none; border-radius:0.375rem; font-size:0.88rem; font-weight:600;">
                Replicate Protocol →
              </a>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

/**
 * Render Experiment Not Found View
 */
function renderNotFoundView(container, expId) {
  container.innerHTML = `
    <div style="max-width:640px; margin:3rem auto; padding:2.5rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; text-align:center;">
      <div style="font-size:2.5rem; margin-bottom:1rem;">⚠️</div>
      <h2 style="color:var(--td-text-primary); font-size:1.5rem; font-weight:700; margin-bottom:0.5rem;">
        Official Protocol Not Found
      </h2>
      <p style="color:var(--td-text-secondary); font-size:0.95rem; margin-bottom:1.75rem; line-height:1.5;">
        No official experiment with ID <code>"${escapeHtml(expId)}"</code> was found in the authoritative WDIII vault archives.
      </p>
      <div style="display:flex; justify-content:center; gap:1rem;">
        <a href="#/replicate" style="display:inline-block; padding:0.6rem 1.25rem; background:var(--td-info); color:#fff; border-radius:0.375rem; text-decoration:none; font-weight:600; font-size:0.9rem;">
          Browse Replicable Protocols
        </a>
        <a href="#/" style="display:inline-block; padding:0.6rem 1.25rem; background:transparent; border:1px solid var(--td-border); color:var(--td-text-secondary); border-radius:0.375rem; text-decoration:none; font-size:0.9rem;">
          Return to Tech Vault
        </a>
      </div>
    </div>
  `;
}

/**
 * Main Wizard Renderer
 */
function renderWizard(container, state) {
  // If submission was successful, render the completion state
  if (state.step === 7 && state.submissionResult) {
    renderSuccessScreen(container, state);
    return;
  }

  const stepsMeta = [
    { num: 1, label: "Official Protocol", icon: "📋" },
    { num: 2, label: "Select Device", icon: "📱" },
    { num: 3, label: "Measurements", icon: "📊" },
    { num: 4, label: "Conditions", icon: "🌡️" },
    { num: 5, label: "Evidence", icon: "📎" },
    { num: 6, label: "Review & Submit", icon: "🚀" }
  ];

  container.innerHTML = `
    <div style="max-width:1040px; margin:1.5rem auto 3rem; padding:0 1rem;">
      <!-- Page Header -->
      <div style="margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem;">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <a href="#/" style="color:var(--td-text-muted); font-size:0.85rem; text-decoration:none;">Archive</a>
            <span style="color:var(--td-text-muted); font-size:0.85rem;">/</span>
            <span style="color:var(--td-info); font-size:0.85rem; font-weight:600;">Replication Lab</span>
          </div>
          <h1 style="color:var(--td-text-primary); font-size:1.6rem; font-weight:700; margin:0 0 0.25rem;">
            Replicating: ${escapeHtml(state.experiment.title)}
          </h1>
          <div style="display:flex; align-items:center; gap:0.75rem; font-size:0.82rem; color:var(--td-text-muted);">
            <span>Protocol ID: <strong>${escapeHtml(state.experiment.id)}</strong></span>
            <span>•</span>
            <span>Category: <strong style="text-transform:capitalize;">${escapeHtml(state.experiment.category || "General")}</strong></span>
            <span>•</span>
            <span>Protocol Version: <strong>v${escapeHtml(state.experiment.protocolVersion || state.experiment.version || "1.0.0")}</strong></span>
          </div>
        </div>

        <div style="display:flex; gap:0.5rem;">
          <a href="#/exp/${encodeURIComponent(state.experiment.id)}" style="display:inline-flex; align-items:center; gap:0.35rem; padding:0.45rem 0.85rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.375rem; color:var(--td-text-secondary); text-decoration:none; font-size:0.82rem;">
            <span>📖</span> <span>View Full Dossier</span>
          </a>
        </div>
      </div>

      <!-- Stepper Header Navigation -->
      <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.5rem; padding:0.75rem 1rem; margin-bottom:1.5rem; overflow-x:auto;">
        <div style="display:flex; align-items:center; justify-content:space-between; min-width:640px; gap:0.5rem;">
          ${stepsMeta.map(s => {
            const isActive = state.step === s.num;
            const isCompleted = state.step > s.num;
            const canClick = isCompleted || s.num === 1 || (s.num === 2) || (s.num === 3 && state.selectedDevice);
            
            const badgeBg = isActive ? "var(--td-info)" : isCompleted ? "var(--td-success)" : "var(--td-bg-card)";
            const badgeColor = (isActive || isCompleted) ? "#fff" : "var(--td-text-muted)";
            const textColor = isActive ? "var(--td-text-primary)" : isCompleted ? "var(--td-text-secondary)" : "var(--td-text-muted)";
            const fontWeight = isActive ? "700" : "500";

            return `
              <div class="wizard-step-tab" data-step="${s.num}" style="display:flex; align-items:center; gap:0.5rem; cursor:${canClick ? 'pointer' : 'default'}; opacity:${canClick ? '1' : '0.6'}; padding:0.25rem 0.5rem; border-radius:0.25rem;">
                <div style="width:24px; height:24px; border-radius:50%; background:${badgeBg}; color:${badgeColor}; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700;">
                  ${isCompleted ? '✓' : s.num}
                </div>
                <span style="color:${textColor}; font-size:0.85rem; font-weight:${fontWeight}; white-space:nowrap;">
                  ${s.label}
                </span>
                ${s.num < stepsMeta.length ? `<span style="color:var(--td-border-subtle); margin-left:0.5rem;">›</span>` : ''}
              </div>
            `;
          }).join("")}
        </div>
      </div>

      <!-- General Alert Notice (if any) -->
      ${state.generalError ? `
        <div style="margin-bottom:1.5rem; padding:0.875rem 1.25rem; background:rgba(239,68,68,0.12); border:1px solid var(--td-error); border-radius:0.5rem; color:var(--td-error); font-size:0.9rem; display:flex; justify-content:space-between; align-items:center;">
          <div>⚠️ ${escapeHtml(state.generalError)}</div>
          <button id="btnDismissError" style="background:none; border:none; color:var(--td-error); cursor:pointer; font-size:1.1rem;">✕</button>
        </div>
      ` : ''}

      <!-- Dynamic Step Content Container -->
      <div id="replicationStepContent" style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.75rem; box-shadow:0 8px 24px rgba(0,0,0,0.15);">
        <!-- Step Specific Content will be injected here -->
      </div>
    </div>
  `;

  // Attach stepper click handlers
  container.querySelectorAll(".wizard-step-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const targetStep = parseInt(tab.dataset.step, 10);
      if (targetStep < state.step) {
        state.step = targetStep;
        renderWizard(container, state);
      } else if (targetStep === 2 && state.step === 1) {
        state.step = 2;
        renderWizard(container, state);
      } else if (targetStep === 3 && state.selectedDevice) {
        state.step = 3;
        renderWizard(container, state);
      }
    });
  });

  const dismissBtn = container.querySelector("#btnDismissError");
  dismissBtn?.addEventListener("click", () => {
    state.generalError = null;
    renderWizard(container, state);
  });

  // Render the current step
  const stepContainer = container.querySelector("#replicationStepContent");
  if (!stepContainer) return;

  switch (state.step) {
    case 1:
      renderStep1Protocol(stepContainer, container, state);
      break;
    case 2:
      renderStep2Device(stepContainer, container, state);
      break;
    case 3:
      renderStep3Measurements(stepContainer, container, state);
      break;
    case 4:
      renderStep4Conditions(stepContainer, container, state);
      break;
    case 5:
      renderStep5Evidence(stepContainer, container, state);
      break;
    case 6:
      renderStep6Review(stepContainer, container, state);
      break;
  }
}

/**
 * STEP 1: Read Official Protocol (Read-Only)
 */
function renderStep1Protocol(stepContainer, mainContainer, state) {
  const exp = state.experiment;
  const schema = exp.measurementSchema || [];

  stepContainer.innerHTML = `
    <div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.5rem; border-bottom:1px solid var(--td-border-subtle); padding-bottom:1rem;">
        <div>
          <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-info);">Step 1 of 6</span>
          <h2 style="color:var(--td-text-primary); font-size:1.35rem; font-weight:700; margin:0.25rem 0 0;">
            Review Official Authoritative Protocol
          </h2>
        </div>
        <div style="display:inline-flex; align-items:center; gap:0.35rem; padding:0.35rem 0.75rem; background:rgba(96,165,250,0.1); border:1px solid var(--td-info); border-radius:9999px; font-size:0.75rem; color:var(--td-info); font-weight:600;">
          <span>🔒</span> <span>Official WDIII Baseline Protocol (Read-Only)</span>
        </div>
      </div>

      <p style="color:var(--td-text-secondary); font-size:0.92rem; line-height:1.6; margin-bottom:1.5rem;">
        To ensure scientific comparability across community tests, your replication must adhere strictly to this official protocol. All field inputs are validated against the schema defined below.
      </p>

      <!-- Protocol Summary Grid -->
      <div style="display:grid; grid-template-columns:1fr; gap:1.25rem; margin-bottom:1.5rem;">
        <!-- Research Question & Objective -->
        <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem;">
          <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); margin-bottom:0.5rem;">
            🎯 Research Question &amp; Objective
          </div>
          <div style="color:var(--td-text-primary); font-size:0.95rem; line-height:1.6; font-weight:500; margin-bottom:0.5rem;">
            ${escapeHtml(exp.researchQuestion || exp.objective || "No research question specified.")}
          </div>
          ${exp.objective && exp.researchQuestion && exp.objective !== exp.researchQuestion ? `
            <div style="color:var(--td-text-secondary); font-size:0.88rem; line-height:1.5;">
              ${escapeHtml(exp.objective)}
            </div>
          ` : ''}
        </div>

        <!-- Testing Methodology & Protocol -->
        <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem;">
          <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); margin-bottom:0.5rem;">
            📋 Authoritative Protocol &amp; Methodology
          </div>
          <div style="color:var(--td-text-secondary); font-size:0.92rem; line-height:1.6; white-space:pre-line;">
            ${escapeHtml(exp.protocol || exp.methodology || "Standard laboratory methodology as documented in official dossier.")}
          </div>
        </div>

        <!-- Official Baseline Conditions -->
        <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem;">
          <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); margin-bottom:0.5rem;">
            🌡️ Official Baseline Conditions
          </div>
          <div style="color:var(--td-text-secondary); font-size:0.92rem; line-height:1.6;">
            ${escapeHtml(exp.conditions || "Ambient room temperature (20-22°C), official hardware builds, standardized test instruments.")}
          </div>
        </div>

        <!-- Dynamic Measurement Schema Specification -->
        <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem;">
          <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); margin-bottom:0.75rem;">
            📊 Dynamic Measurement Schema Specification (${schema.length} Metrics Defined)
          </div>
          <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; font-size:0.85rem; text-align:left;">
              <thead>
                <tr style="border-bottom:1px solid var(--td-border); color:var(--td-text-muted);">
                  <th style="padding:0.5rem 0.75rem;">Metric Key</th>
                  <th style="padding:0.5rem 0.75rem;">Display Label</th>
                  <th style="padding:0.5rem 0.75rem;">Type</th>
                  <th style="padding:0.5rem 0.75rem;">Unit</th>
                  <th style="padding:0.5rem 0.75rem;">Constraints</th>
                  <th style="padding:0.5rem 0.75rem;">Required</th>
                </tr>
              </thead>
              <tbody>
                ${schema.map(f => `
                  <tr style="border-bottom:1px solid var(--td-border-subtle);">
                    <td style="padding:0.5rem 0.75rem; font-family:monospace; color:var(--td-info);">${escapeHtml(f.key)}</td>
                    <td style="padding:0.5rem 0.75rem; color:var(--td-text-primary); font-weight:600;">${escapeHtml(f.label)}</td>
                    <td style="padding:0.5rem 0.75rem; text-transform:uppercase; font-size:0.75rem; color:var(--td-text-secondary);">${escapeHtml(f.type)}</td>
                    <td style="padding:0.5rem 0.75rem; color:var(--td-text-secondary);">${escapeHtml(f.unit || "—")}</td>
                    <td style="padding:0.5rem 0.75rem; font-size:0.78rem; color:var(--td-text-muted);">
                      ${f.min !== undefined || f.max !== undefined ? `[${f.min !== undefined ? f.min : 'min'} to ${f.max !== undefined ? f.max : 'max'}]` : '—'}
                    </td>
                    <td style="padding:0.5rem 0.75rem;">
                      ${f.required ? `<span style="color:var(--td-error); font-weight:700;">Yes</span>` : `<span style="color:var(--td-text-muted);">Optional</span>`}
                    </td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Scope & Limitations Notice -->
        ${exp.limitations || exp.scope ? `
          <div style="background:rgba(234,179,8,0.06); border:1px solid var(--td-warning); border-radius:0.5rem; padding:1rem 1.25rem; font-size:0.85rem; color:var(--td-text-secondary); line-height:1.5;">
            <strong style="color:var(--td-warning);">⚠️ Official Scope &amp; Limitations:</strong>
            ${escapeHtml(exp.limitations || exp.scope || "")}
          </div>
        ` : ''}
      </div>

      <!-- Action Footer -->
      <div style="display:flex; justify-content:flex-end; gap:1rem; padding-top:1rem; border-top:1px solid var(--td-border-subtle);">
        <button id="btnStep1Next" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.65rem 1.5rem; background:var(--td-info); color:#fff; font-weight:600; font-size:0.92rem; border-radius:0.375rem; border:none; cursor:pointer; box-shadow:0 4px 12px rgba(2,132,199,0.3);">
          <span>Continue to Device Selection</span>
          <span>→</span>
        </button>
      </div>
    </div>
  `;

  stepContainer.querySelector("#btnStep1Next")?.addEventListener("click", () => {
    state.step = 2;
    renderWizard(mainContainer, state);
  });
}

/**
 * STEP 2: Select Device (Searchable Registry)
 */
function renderStep2Device(stepContainer, mainContainer, state) {
  let searchFilter = "";
  let brandFilter = "all";
  let categoryFilter = "all";

  // Unique brands from allDevices
  const brands = Array.from(new Set(state.allDevices.map(d => d.brand).filter(Boolean))).sort();

  function getFilteredDevices() {
    return state.allDevices.filter(dev => {
      if (brandFilter !== "all" && dev.brand?.toLowerCase() !== brandFilter.toLowerCase()) {
        return false;
      }
      if (categoryFilter !== "all" && dev.category?.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
      if (searchFilter.trim()) {
        const q = searchFilter.trim().toLowerCase();
        const mModel = (dev.model || "").toLowerCase().includes(q);
        const mBrand = (dev.brand || "").toLowerCase().includes(q);
        const mProc = (dev.specs?.processor || "").toLowerCase().includes(q);
        const mOS = (dev.specs?.os || "").toLowerCase().includes(q);
        if (!mModel && !mBrand && !mProc && !mOS) return false;
      }
      return true;
    });
  }

  function renderDeviceStep() {
    const filtered = getFilteredDevices();

    stepContainer.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.5rem; border-bottom:1px solid var(--td-border-subtle); padding-bottom:1rem;">
          <div>
            <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-info);">Step 2 of 6</span>
            <h2 style="color:var(--td-text-primary); font-size:1.35rem; font-weight:700; margin:0.25rem 0 0;">
              Select Hardware Device Under Test
            </h2>
          </div>
          <div style="font-size:0.85rem; color:var(--td-text-muted);">
            Only registered WDIII hardware devices are eligible for protocol replication.
          </div>
        </div>

        <!-- Selected Device Preview Banner -->
        ${state.selectedDevice ? `
          <div style="background:rgba(34,197,94,0.08); border:1px solid var(--td-success); border-radius:0.5rem; padding:1rem 1.25rem; margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <span style="font-size:1.5rem;">📱</span>
              <div>
                <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:var(--td-success); letter-spacing:0.05em;">
                  ✓ Selected Hardware Unit
                </div>
                <div style="color:var(--td-text-primary); font-size:1.05rem; font-weight:700;">
                  ${escapeHtml(state.selectedDevice.brand)} ${escapeHtml(state.selectedDevice.model)}
                </div>
                <div style="font-size:0.8rem; color:var(--td-text-secondary);">
                  ${escapeHtml(state.selectedDevice.specs?.processor || "")} • ${escapeHtml(state.selectedDevice.specs?.os || state.selectedDevice.category || "")} • ${escapeHtml(state.selectedDevice.releaseYear || "")}
                </div>
              </div>
            </div>
            <button id="btnClearSelectedDevice" style="padding:0.4rem 0.85rem; background:transparent; border:1px solid var(--td-border); border-radius:0.375rem; color:var(--td-text-muted); font-size:0.82rem; cursor:pointer;">
              Change Selection
            </button>
          </div>
        ` : `
          <div style="background:rgba(96,165,250,0.08); border:1px solid var(--td-info); border-radius:0.5rem; padding:0.875rem 1.25rem; margin-bottom:1.5rem; font-size:0.88rem; color:var(--td-info); display:flex; align-items:center; gap:0.5rem;">
            <span>ℹ️</span> <span>Search and click on a device from the hardware registry below to link it to your replication.</span>
          </div>
        `}

        <!-- Search & Filter Controls -->
        <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem; margin-bottom:1.25rem; display:flex; flex-direction:column; gap:0.75rem;">
          <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
            <div style="flex:1; min-width:240px; position:relative;">
              <input id="deviceSearch" type="text" placeholder="Search by model, brand, processor, or OS..." value="${escapeHtml(searchFilter)}"
                style="width:100%; padding:0.55rem 0.85rem; background:var(--td-bg-surface); border:1px solid var(--td-border); border-radius:0.375rem; color:var(--td-text-primary); font-size:0.88rem; outline:none;" />
            </div>

            <select id="deviceBrandFilter" style="padding:0.55rem 0.85rem; background:var(--td-bg-surface); border:1px solid var(--td-border); border-radius:0.375rem; color:var(--td-text-primary); font-size:0.88rem; outline:none; cursor:pointer;">
              <option value="all" ${brandFilter === "all" ? "selected" : ""}>All Brands</option>
              ${brands.map(b => `<option value="${escapeHtml(b)}" ${brandFilter.toLowerCase() === b.toLowerCase() ? "selected" : ""}>${escapeHtml(b)}</option>`).join("")}
            </select>

            <select id="deviceCategoryFilter" style="padding:0.55rem 0.85rem; background:var(--td-bg-surface); border:1px solid var(--td-border); border-radius:0.375rem; color:var(--td-text-primary); font-size:0.88rem; outline:none; cursor:pointer;">
              <option value="all" ${categoryFilter === "all" ? "selected" : ""}>All Categories</option>
              <option value="smartphone" ${categoryFilter === "smartphone" ? "selected" : ""}>Smartphones</option>
              <option value="laptop" ${categoryFilter === "laptop" ? "selected" : ""}>Laptops</option>
              <option value="wearable" ${categoryFilter === "wearable" ? "selected" : ""}>Wearables</option>
              <option value="accessory" ${categoryFilter === "accessory" ? "selected" : ""}>Accessories</option>
            </select>
          </div>
          <div style="font-size:0.8rem; color:var(--td-text-muted);">
            Showing ${filtered.length} of ${state.allDevices.length} registered hardware units
          </div>
        </div>

        <!-- Devices Selection Grid -->
        <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:1rem; max-height:420px; overflow-y:auto; padding-right:0.25rem; margin-bottom:1.5rem;">
          ${filtered.length === 0 ? `
            <div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--td-text-muted); font-size:0.9rem;">
              No registered devices match your search criteria.
            </div>
          ` : filtered.map(dev => {
            const isSelected = state.selectedDevice?.id === dev.id;
            return `
              <div class="device-card-select" data-id="${escapeHtml(dev.id)}" style="background:var(--td-bg-card); border:2px solid ${isSelected ? 'var(--td-success)' : 'var(--td-border-subtle)'}; border-radius:0.5rem; padding:1rem; cursor:pointer; transition:all 0.15s ease; display:flex; flex-direction:column; justify-content:space-between;">
                <div>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
                    <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--td-text-muted);">${escapeHtml(dev.brand)}</span>
                    <span style="font-size:0.72rem; padding:0.1rem 0.4rem; border-radius:0.25rem; background:var(--td-bg-surface); color:var(--td-text-secondary); text-transform:capitalize;">${escapeHtml(dev.category || "device")}</span>
                  </div>
                  <div style="color:var(--td-text-primary); font-size:0.95rem; font-weight:700; margin-bottom:0.35rem;">
                    ${escapeHtml(dev.model)}
                  </div>
                  <div style="font-size:0.78rem; color:var(--td-text-secondary); line-height:1.4;">
                    ${dev.specs?.processor ? `<div>Chip: ${escapeHtml(dev.specs.processor)}</div>` : ''}
                    ${dev.specs?.os ? `<div>OS: ${escapeHtml(dev.specs.os)}</div>` : ''}
                  </div>
                </div>
                <div style="margin-top:0.75rem; padding-top:0.5rem; border-top:1px solid var(--td-border-subtle); display:flex; justify-content:space-between; align-items:center; font-size:0.78rem;">
                  <span style="color:var(--td-text-muted);">${escapeHtml(dev.releaseYear || "")}</span>
                  <span style="color:${isSelected ? 'var(--td-success)' : 'var(--td-info)'}; font-weight:600;">
                    ${isSelected ? '✓ Selected' : 'Select Unit →'}
                  </span>
                </div>
              </div>
            `;
          }).join("")}
        </div>

        <!-- Navigation Buttons -->
        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:1rem; border-top:1px solid var(--td-border-subtle);">
          <button id="btnStep2Prev" style="padding:0.6rem 1.25rem; background:transparent; border:1px solid var(--td-border); color:var(--td-text-secondary); font-size:0.9rem; border-radius:0.375rem; cursor:pointer;">
            ← Back to Protocol
          </button>
          <button id="btnStep2Next" ${!state.selectedDevice ? "disabled" : ""} style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.65rem 1.5rem; background:${state.selectedDevice ? 'var(--td-info)' : 'var(--td-border)'}; color:#fff; font-weight:600; font-size:0.92rem; border-radius:0.375rem; border:none; cursor:${state.selectedDevice ? 'pointer' : 'not-allowed'}; box-shadow:${state.selectedDevice ? '0 4px 12px rgba(2,132,199,0.3)' : 'none'};">
            <span>Continue to Measurements</span>
            <span>→</span>
          </button>
        </div>
      </div>
    `;

    // Attach search input listener
    const searchEl = stepContainer.querySelector("#deviceSearch");
    searchEl?.addEventListener("input", (e) => {
      searchFilter = e.target.value;
      renderDeviceStep();
      // Restore focus
      const newSearchEl = stepContainer.querySelector("#deviceSearch");
      if (newSearchEl) {
        newSearchEl.focus();
        newSearchEl.setSelectionRange(newSearchEl.value.length, newSearchEl.value.length);
      }
    });

    // Attach brand filter listener
    stepContainer.querySelector("#deviceBrandFilter")?.addEventListener("change", (e) => {
      brandFilter = e.target.value;
      renderDeviceStep();
    });

    // Attach category filter listener
    stepContainer.querySelector("#deviceCategoryFilter")?.addEventListener("change", (e) => {
      categoryFilter = e.target.value;
      renderDeviceStep();
    });

    // Attach card select listener
    stepContainer.querySelectorAll(".device-card-select").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.dataset.id;
        state.selectedDevice = state.allDevices.find(d => d.id === id) || null;
        renderDeviceStep();
      });
    });

    // Clear selection listener
    stepContainer.querySelector("#btnClearSelectedDevice")?.addEventListener("click", () => {
      state.selectedDevice = null;
      renderDeviceStep();
    });

    // Step navigation listeners
    stepContainer.querySelector("#btnStep2Prev")?.addEventListener("click", () => {
      state.step = 1;
      renderWizard(mainContainer, state);
    });

    stepContainer.querySelector("#btnStep2Next")?.addEventListener("click", () => {
      if (!state.selectedDevice) return;
      state.step = 3;
      renderWizard(mainContainer, state);
    });
  }

  renderDeviceStep();
}

/**
 * STEP 3: Enter Schema-Defined Measurements (Dynamic Form)
 */
function renderStep3Measurements(stepContainer, mainContainer, state) {
  const schema = state.experiment.measurementSchema || [];
  const allowedKeys = state.experiment.allowedMeasurementKeys || schema.map(s => s.key);

  // Validate current measurements against schema
  function validateMeasurements() {
    const errors = {};
    let isValid = true;

    schema.forEach(field => {
      // Must be in allowedKeys
      if (!allowedKeys.includes(field.key)) return;

      const val = state.measurements[field.key];

      if (field.required) {
        if (val === undefined || val === null || val === "") {
          errors[field.key] = `${field.label} is required.`;
          isValid = false;
          return;
        }
      }

      if (field.type === "number" && val !== "" && val !== null && val !== undefined) {
        const num = Number(val);
        if (isNaN(num)) {
          errors[field.key] = `${field.label} must be a valid numeric value.`;
          isValid = false;
          return;
        }
        if (field.min !== undefined && num < field.min) {
          errors[field.key] = `${field.label} cannot be less than ${field.min}.`;
          isValid = false;
          return;
        }
        if (field.max !== undefined && num > field.max) {
          errors[field.key] = `${field.label} cannot exceed ${field.max}.`;
          isValid = false;
          return;
        }
      }
    });

    state.measurementErrors = errors;
    return isValid;
  }

  stepContainer.innerHTML = `
    <div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.5rem; border-bottom:1px solid var(--td-border-subtle); padding-bottom:1rem;">
        <div>
          <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-info);">Step 3 of 6</span>
          <h2 style="color:var(--td-text-primary); font-size:1.35rem; font-weight:700; margin:0.25rem 0 0;">
            Enter Schema-Defined Measurements
          </h2>
        </div>
        <div style="font-size:0.85rem; color:var(--td-text-muted);">
          Testing: <strong style="color:var(--td-text-primary);">${escapeHtml(state.selectedDevice?.brand)} ${escapeHtml(state.selectedDevice?.model)}</strong>
        </div>
      </div>

      <div style="background:rgba(96,165,250,0.08); border:1px solid var(--td-info); border-radius:0.5rem; padding:0.875rem 1.25rem; margin-bottom:1.5rem; font-size:0.88rem; color:var(--td-info);">
        <span>📊</span> <strong>Dynamic Protocol Schema:</strong> Input fields below are generated directly from the official protocol specification. All values are strictly audited against allowed schema parameters.
      </div>

      <!-- Dynamic Form Fields Container -->
      <form id="measurementsForm" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem; margin-bottom:2rem;">
        ${schema.map(field => {
          const isAllowed = allowedKeys.includes(field.key);
          if (!isAllowed) return '';

          const error = state.measurementErrors[field.key];
          const val = state.measurements[field.key];

          return `
            <div style="background:var(--td-bg-card); border:1px solid ${error ? 'var(--td-error)' : 'var(--td-border-subtle)'}; border-radius:0.5rem; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between;">
              <div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                  <label for="input_${escapeHtml(field.key)}" style="font-size:0.9rem; font-weight:700; color:var(--td-text-primary); line-height:1.4;">
                    ${escapeHtml(field.label)}
                    ${field.required ? `<span style="color:var(--td-error); margin-left:0.2rem;">*</span>` : ''}
                  </label>
                  ${field.unit ? `
                    <span style="font-size:0.75rem; padding:0.15rem 0.5rem; border-radius:0.25rem; background:var(--td-bg-surface); color:var(--td-info); font-weight:600; white-space:nowrap;">
                      ${escapeHtml(field.unit)}
                    </span>
                  ` : ''}
                </div>

                ${field.description ? `
                  <div style="font-size:0.78rem; color:var(--td-text-muted); margin-bottom:0.75rem; line-height:1.4;">
                    ${escapeHtml(field.description)}
                  </div>
                ` : ''}

                <!-- Input Element by Type -->
                <div style="margin-top:0.5rem;">
                  ${field.type === "number" ? `
                    <input 
                      id="input_${escapeHtml(field.key)}" 
                      name="${escapeHtml(field.key)}" 
                      type="number" 
                      step="any"
                      ${field.min !== undefined ? `min="${field.min}"` : ''}
                      ${field.max !== undefined ? `max="${field.max}"` : ''}
                      placeholder="e.g. ${field.min !== undefined ? field.min : '0'}"
                      value="${val !== undefined && val !== null ? escapeHtml(val) : ''}"
                      style="width:100%; padding:0.6rem 0.85rem; background:var(--td-bg-surface); border:1px solid ${error ? 'var(--td-error)' : 'var(--td-border)'}; border-radius:0.375rem; color:var(--td-text-primary); font-size:0.92rem; outline:none;" />
                    ${field.min !== undefined || field.max !== undefined ? `
                      <div style="font-size:0.72rem; color:var(--td-text-muted); margin-top:0.35rem;">
                        Permitted range: ${field.min !== undefined ? field.min : '—'} to ${field.max !== undefined ? field.max : '—'} ${escapeHtml(field.unit || "")}
                      </div>
                    ` : ''}
                  ` : field.type === "boolean" ? `
                    <div style="display:flex; gap:0.75rem; margin-top:0.25rem;">
                      <label style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.5rem 0.85rem; background:var(--td-bg-surface); border:1px solid var(--td-border); border-radius:0.375rem; cursor:pointer; font-size:0.85rem; color:var(--td-text-primary);">
                        <input type="radio" name="${escapeHtml(field.key)}" value="true" ${val === true ? 'checked' : ''} />
                        <span>Yes / True</span>
                      </label>
                      <label style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.5rem 0.85rem; background:var(--td-bg-surface); border:1px solid var(--td-border); border-radius:0.375rem; cursor:pointer; font-size:0.85rem; color:var(--td-text-primary);">
                        <input type="radio" name="${escapeHtml(field.key)}" value="false" ${val === false ? 'checked' : ''} />
                        <span>No / False</span>
                      </label>
                    </div>
                  ` : `
                    <input 
                      id="input_${escapeHtml(field.key)}" 
                      name="${escapeHtml(field.key)}" 
                      type="text" 
                      placeholder="Enter ${escapeHtml(field.label).toLowerCase()}..."
                      value="${val !== undefined && val !== null ? escapeHtml(val) : ''}"
                      style="width:100%; padding:0.6rem 0.85rem; background:var(--td-bg-surface); border:1px solid ${error ? 'var(--td-error)' : 'var(--td-border)'}; border-radius:0.375rem; color:var(--td-text-primary); font-size:0.92rem; outline:none;" />
                  `}
                </div>
              </div>

              ${error ? `
                <div style="font-size:0.78rem; color:var(--td-error); margin-top:0.5rem; font-weight:500;">
                  ⚠️ ${escapeHtml(error)}
                </div>
              ` : ''}
            </div>
          `;
        }).join("")}
      </form>

      <!-- Navigation Buttons -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding-top:1rem; border-top:1px solid var(--td-border-subtle);">
        <button id="btnStep3Prev" style="padding:0.6rem 1.25rem; background:transparent; border:1px solid var(--td-border); color:var(--td-text-secondary); font-size:0.9rem; border-radius:0.375rem; cursor:pointer;">
          ← Back to Device
        </button>
        <button id="btnStep3Next" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.65rem 1.5rem; background:var(--td-info); color:#fff; font-weight:600; font-size:0.92rem; border-radius:0.375rem; border:none; cursor:pointer; box-shadow:0 4px 12px rgba(2,132,199,0.3);">
          <span>Continue to Test Conditions</span>
          <span>→</span>
        </button>
      </div>
    </div>
  `;

  // Attach input sync handlers
  const form = stepContainer.querySelector("#measurementsForm");
  form?.addEventListener("input", (e) => {
    const target = e.target;
    const name = target.name;
    if (!name) return;

    const fieldMeta = schema.find(s => s.key === name);
    if (!fieldMeta) return;

    if (fieldMeta.type === "boolean") {
      state.measurements[name] = target.value === "true";
    } else if (fieldMeta.type === "number") {
      state.measurements[name] = target.value === "" ? "" : Number(target.value);
    } else {
      state.measurements[name] = target.value;
    }
  });

  // Step navigation listeners
  stepContainer.querySelector("#btnStep3Prev")?.addEventListener("click", () => {
    state.step = 2;
    renderWizard(mainContainer, state);
  });

  stepContainer.querySelector("#btnStep3Next")?.addEventListener("click", () => {
    const isValid = validateMeasurements();
    if (!isValid) {
      renderStep3Measurements(stepContainer, mainContainer, state);
      return;
    }
    state.step = 4;
    renderWizard(mainContainer, state);
  });
}

/**
 * STEP 4: Enter Test Conditions
 */
function renderStep4Conditions(stepContainer, mainContainer, state) {
  const exp = state.experiment;

  stepContainer.innerHTML = `
    <div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.5rem; border-bottom:1px solid var(--td-border-subtle); padding-bottom:1rem;">
        <div>
          <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-info);">Step 4 of 6</span>
          <h2 style="color:var(--td-text-primary); font-size:1.35rem; font-weight:700; margin:0.25rem 0 0;">
            Document Testing Conditions &amp; Environment
          </h2>
        </div>
        <div style="font-size:0.85rem; color:var(--td-text-muted);">
          Contextualize environmental parameters and hardware setup
        </div>
      </div>

      <!-- Reference: Official Baseline Conditions (Read-Only) -->
      <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem; margin-bottom:1.5rem;">
        <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); margin-bottom:0.35rem; display:flex; align-items:center; gap:0.4rem;">
          <span>🔒</span> <span>Official Protocol Baseline Conditions (Read-Only Reference)</span>
        </div>
        <div style="color:var(--td-text-secondary); font-size:0.9rem; line-height:1.5;">
          ${escapeHtml(exp.conditions || "Ambient room conditions (20-22°C), official hardware builds.")}
        </div>
      </div>

      <!-- Contributor Environment Inputs -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; margin-bottom:1.5rem;">
        <div>
          <label for="condTestDate" style="display:block; font-size:0.88rem; font-weight:700; color:var(--td-text-primary); margin-bottom:0.4rem;">
            Test Date <span style="color:var(--td-error);">*</span>
          </label>
          <input 
            id="condTestDate" 
            type="date" 
            value="${escapeHtml(state.conditions.testDate)}"
            style="width:100%; padding:0.6rem 0.85rem; background:var(--td-bg-surface); border:1px solid var(--td-border); border-radius:0.375rem; color:var(--td-text-primary); font-size:0.9rem; outline:none;" />
        </div>

        <div>
          <label for="condSoftwareVersion" style="display:block; font-size:0.88rem; font-weight:700; color:var(--td-text-primary); margin-bottom:0.4rem;">
            Software / OS / Firmware Build
          </label>
          <input 
            id="condSoftwareVersion" 
            type="text" 
            placeholder="e.g. iOS 18.3.1, One UI 7.0, Ubuntu 24.04..."
            value="${escapeHtml(state.conditions.softwareVersion)}"
            style="width:100%; padding:0.6rem 0.85rem; background:var(--td-bg-surface); border:1px solid var(--td-border); border-radius:0.375rem; color:var(--td-text-primary); font-size:0.9rem; outline:none;" />
        </div>
      </div>

      <!-- Additional Conditions Free-Text -->
      <div style="margin-bottom:1.5rem;">
        <label for="condAdditional" style="display:block; font-size:0.88rem; font-weight:700; color:var(--td-text-primary); margin-bottom:0.4rem;">
          Additional Test Conditions &amp; Lab Environment
        </label>
        <p style="color:var(--td-text-muted); font-size:0.8rem; margin:0 0 0.5rem;">
          Document any relevant environmental factors: room temperature, charger wattage, Wi-Fi band, carrier signal, or specific test equipment.
        </p>
        <textarea 
          id="condAdditional" 
          rows="3" 
          placeholder="e.g. Ambient temperature: 21°C; tested using official 30W USB-C charger; unit was kept in factory packaging prior to test..."
          style="width:100%; padding:0.65rem 0.85rem; background:var(--td-bg-surface); border:1px solid var(--td-border); border-radius:0.375rem; color:var(--td-text-primary); font-size:0.9rem; outline:none; resize:vertical;">${escapeHtml(state.conditions.additionalConditions)}</textarea>
      </div>

      <!-- Contributor Observations & Notes -->
      <div style="margin-bottom:1.5rem;">
        <label for="condNotes" style="display:block; font-size:0.88rem; font-weight:700; color:var(--td-text-primary); margin-bottom:0.4rem;">
          Empirical Observations &amp; Physical Findings Notes
        </label>
        <p style="color:var(--td-text-muted); font-size:0.8rem; margin:0 0 0.5rem;">
          Record qualitative details: display seam tightness, unexpected anomalies, administrative communications, or deviations from official baseline.
        </p>
        <textarea 
          id="condNotes" 
          rows="4" 
          placeholder="Describe physical findings, anomalies, or unexpected behavior observed during test execution..."
          style="width:100%; padding:0.65rem 0.85rem; background:var(--td-bg-surface); border:1px solid var(--td-border); border-radius:0.375rem; color:var(--td-text-primary); font-size:0.9rem; outline:none; resize:vertical;">${escapeHtml(state.conditions.notes)}</textarea>
      </div>

      <!-- Navigation Buttons -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding-top:1rem; border-top:1px solid var(--td-border-subtle);">
        <button id="btnStep4Prev" style="padding:0.6rem 1.25rem; background:transparent; border:1px solid var(--td-border); color:var(--td-text-secondary); font-size:0.9rem; border-radius:0.375rem; cursor:pointer;">
          ← Back to Measurements
        </button>
        <button id="btnStep4Next" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.65rem 1.5rem; background:var(--td-info); color:#fff; font-weight:600; font-size:0.92rem; border-radius:0.375rem; border:none; cursor:pointer; box-shadow:0 4px 12px rgba(2,132,199,0.3);">
          <span>Continue to Evidence Attachments</span>
          <span>→</span>
        </button>
      </div>
    </div>
  `;

  // Attach sync listeners
  stepContainer.querySelector("#condTestDate")?.addEventListener("input", (e) => {
    state.conditions.testDate = e.target.value;
  });
  stepContainer.querySelector("#condSoftwareVersion")?.addEventListener("input", (e) => {
    state.conditions.softwareVersion = e.target.value;
  });
  stepContainer.querySelector("#condAdditional")?.addEventListener("input", (e) => {
    state.conditions.additionalConditions = e.target.value;
  });
  stepContainer.querySelector("#condNotes")?.addEventListener("input", (e) => {
    state.conditions.notes = e.target.value;
  });

  // Step navigation listeners
  stepContainer.querySelector("#btnStep4Prev")?.addEventListener("click", () => {
    state.step = 3;
    renderWizard(mainContainer, state);
  });

  stepContainer.querySelector("#btnStep4Next")?.addEventListener("click", () => {
    state.step = 5;
    renderWizard(mainContainer, state);
  });
}

/**
 * STEP 5: Attach Evidence (Firebase Storage Workflow)
 */
function renderStep5Evidence(stepContainer, mainContainer, state) {
  const currentUser = getCurrentUser();

  function renderEvidenceStep() {
    stepContainer.innerHTML = `
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.5rem; border-bottom:1px solid var(--td-border-subtle); padding-bottom:1rem;">
          <div>
            <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-info);">Step 5 of 6</span>
            <h2 style="color:var(--td-text-primary); font-size:1.35rem; font-weight:700; margin:0.25rem 0 0;">
              Attach Empirical Evidence &amp; Documentation
            </h2>
          </div>
          <div style="font-size:0.85rem; color:var(--td-text-muted);">
            Photos, diagnostic logs, invoices, or telemetry files
          </div>
        </div>

        <p style="color:var(--td-text-secondary); font-size:0.92rem; line-height:1.6; margin-bottom:1.5rem;">
          Strong evidentiary documentation significantly speeds up moderator verification. Upload photos of the damaged/repaired unit, terminal logs, multimeter readings, or official repair invoices.
        </p>

        <!-- Drop Zone & Upload Box -->
        <div id="evidenceDropZone" style="border:2px dashed var(--td-border); border-radius:0.75rem; padding:2.5rem 1.5rem; text-align:center; background:var(--td-bg-card); transition:border-color 0.2s ease, background 0.2s ease; margin-bottom:1.5rem; cursor:pointer;">
          <input id="evidenceFileInput" type="file" multiple accept=".jpg,.jpeg,.png,.webp,.gif,.txt,.csv,.json,.pdf" style="display:none;" />
          <div style="font-size:2.5rem; margin-bottom:0.75rem;">📁</div>
          <div style="color:var(--td-text-primary); font-size:1.05rem; font-weight:700; margin-bottom:0.35rem;">
            Click to select or drag and drop evidence files
          </div>
          <p style="color:var(--td-text-muted); font-size:0.82rem; max-width:480px; margin:0 auto 1rem; line-height:1.4;">
            Accepted formats: Images (JPG, PNG, WebP, GIF), Logs (TXT, CSV, JSON), Reports (PDF). Max 8MB for images, 10MB for documents.
          </p>
          <button id="btnBrowseFiles" type="button" style="padding:0.55rem 1.25rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.375rem; color:var(--td-text-primary); font-size:0.88rem; font-weight:600; cursor:pointer;">
            Browse Local Files
          </button>
        </div>

        <!-- Active Upload Progress (if uploading) -->
        ${state.isUploading ? `
          <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem; margin-bottom:1.5rem;">
            <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.5rem; color:var(--td-text-primary); font-weight:600;">
              <span>Uploading evidence to secure storage...</span>
              <span>${state.uploadProgress}%</span>
            </div>
            <div style="width:100%; height:8px; background:var(--td-bg-surface); border-radius:9999px; overflow:hidden;">
              <div style="width:${state.uploadProgress}%; height:100%; background:var(--td-info); transition:width 0.2s ease;"></div>
            </div>
          </div>
        ` : ''}

        <!-- Uploaded Evidence List -->
        <div style="margin-bottom:1.5rem;">
          <div style="font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); margin-bottom:0.75rem;">
            Attached Evidence (${state.evidenceList.length} Files)
          </div>

          ${state.evidenceList.length === 0 ? `
            <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.5rem; text-align:center; color:var(--td-text-muted); font-size:0.88rem;">
              No evidence files attached yet. (Evidence is recommended but optional for initial submission).
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:0.75rem;">
              ${state.evidenceList.map((item, idx) => `
                <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:0.875rem 1rem; display:flex; align-items:center; justify-content:space-between; gap:1rem; flex-wrap:wrap;">
                  <div style="display:flex; align-items:center; gap:0.75rem; flex:1; min-width:240px;">
                    <div style="font-size:1.5rem;">
                      ${item.type?.startsWith('image/') ? '🖼️' : item.type === 'application/pdf' ? '📄' : '📝'}
                    </div>
                    <div style="flex:1;">
                      <div style="color:var(--td-text-primary); font-size:0.9rem; font-weight:600; word-break:break-all;">
                        ${escapeHtml(item.fileName || item.name)}
                      </div>
                      <div style="font-size:0.78rem; color:var(--td-text-muted); display:flex; gap:0.75rem;">
                        <span>${formatFileSize(item.size)}</span>
                        <span>•</span>
                        <span>${escapeHtml(item.type || "Document")}</span>
                      </div>
                    </div>
                  </div>

                  <div style="display:flex; align-items:center; gap:0.75rem; flex:1; min-width:240px;">
                    <input 
                      type="text" 
                      placeholder="Optional caption / note..." 
                      value="${escapeHtml(item.description || "")}" 
                      data-index="${idx}" 
                      class="evidence-caption-input"
                      style="flex:1; padding:0.4rem 0.65rem; background:var(--td-bg-surface); border:1px solid var(--td-border); border-radius:0.25rem; color:var(--td-text-primary); font-size:0.82rem; outline:none;" />
                    <button 
                      type="button" 
                      data-index="${idx}" 
                      class="btn-delete-evidence" 
                      style="padding:0.4rem 0.65rem; background:transparent; border:1px solid var(--td-error); color:var(--td-error); border-radius:0.25rem; font-size:0.8rem; cursor:pointer;">
                      Remove
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>
          `}
        </div>

        <!-- Navigation Buttons -->
        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:1rem; border-top:1px solid var(--td-border-subtle);">
          <button id="btnStep5Prev" style="padding:0.6rem 1.25rem; background:transparent; border:1px solid var(--td-border); color:var(--td-text-secondary); font-size:0.9rem; border-radius:0.375rem; cursor:pointer;">
            ← Back to Conditions
          </button>
          <button id="btnStep5Next" ${state.isUploading ? "disabled" : ""} style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.65rem 1.5rem; background:var(--td-info); color:#fff; font-weight:600; font-size:0.92rem; border-radius:0.375rem; border:none; cursor:${state.isUploading ? 'not-allowed' : 'pointer'}; box-shadow:0 4px 12px rgba(2,132,199,0.3);">
            <span>Review Replication Submission</span>
            <span>→</span>
          </button>
        </div>
      </div>
    `;

    // Hook up Drop Zone & File Input
    const dropZone = stepContainer.querySelector("#evidenceDropZone");
    const fileInput = stepContainer.querySelector("#evidenceFileInput");
    const browseBtn = stepContainer.querySelector("#btnBrowseFiles");

    browseBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput?.click();
    });

    dropZone?.addEventListener("click", () => {
      fileInput?.click();
    });

    dropZone?.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.style.borderColor = "var(--td-info)";
      dropZone.style.background = "rgba(96,165,250,0.05)";
    });

    dropZone?.addEventListener("dragleave", () => {
      dropZone.style.borderColor = "var(--td-border)";
      dropZone.style.background = "var(--td-bg-card)";
    });

    dropZone?.addEventListener("drop", async (e) => {
      e.preventDefault();
      dropZone.style.borderColor = "var(--td-border)";
      dropZone.style.background = "var(--td-bg-card)";
      if (e.dataTransfer?.files?.length) {
        await handleFilesUpload(e.dataTransfer.files);
      }
    });

    fileInput?.addEventListener("change", async (e) => {
      if (e.target?.files?.length) {
        await handleFilesUpload(e.target.files);
      }
    });

    // Caption inputs listener
    stepContainer.querySelectorAll(".evidence-caption-input").forEach(input => {
      input.addEventListener("input", (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        if (state.evidenceList[idx]) {
          state.evidenceList[idx].description = e.target.value;
        }
      });
    });

    // Delete evidence button listener
    stepContainer.querySelectorAll(".btn-delete-evidence").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        const item = state.evidenceList[idx];
        if (!item) return;

        // Try deleting from storage
        try {
          if (item.path) {
            await deleteEvidenceFile(item.path);
          }
        } catch (delErr) {
          console.warn("Storage deletion notice:", delErr);
        }

        state.evidenceList.splice(idx, 1);
        renderEvidenceStep();
      });
    });

    // Step navigation listeners
    stepContainer.querySelector("#btnStep5Prev")?.addEventListener("click", () => {
      state.step = 4;
      renderWizard(mainContainer, state);
    });

    stepContainer.querySelector("#btnStep5Next")?.addEventListener("click", () => {
      if (state.isUploading) return;
      state.step = 6;
      renderWizard(mainContainer, state);
    });
  }

  async function handleFilesUpload(files) {
    state.isUploading = true;
    state.uploadProgress = 10;
    renderEvidenceStep();

    const fileArr = Array.from(files);
    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i];
      try {
        const ref = await uploadEvidenceFile(file, currentUser?.uid || "contributor", (pct) => {
          state.uploadProgress = Math.round(((i + (pct / 100)) / fileArr.length) * 100);
          const progBar = stepContainer.querySelector(".evidence-progress-bar");
          if (progBar) progBar.style.width = `${state.uploadProgress}%`;
        });

        state.evidenceList.push({
          name: ref.name || file.name,
          fileName: ref.fileName || file.name,
          path: ref.path || "",
          url: ref.url || "#",
          size: file.size,
          type: file.type || "application/octet-stream",
          description: ""
        });
      } catch (err) {
        console.error("File upload error:", err);
        alert(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    state.isUploading = false;
    state.uploadProgress = 100;
    renderEvidenceStep();
  }

  renderEvidenceStep();
}

/**
 * STEP 6: Review & Final Dispatch
 */
function renderStep6Review(stepContainer, mainContainer, state) {
  const exp = state.experiment;
  const schema = exp.measurementSchema || [];
  const allowedKeys = exp.allowedMeasurementKeys || schema.map(s => s.key);
  const currentUser = getCurrentUser();

  stepContainer.innerHTML = `
    <div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.5rem; border-bottom:1px solid var(--td-border-subtle); padding-bottom:1rem;">
        <div>
          <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-info);">Step 6 of 6</span>
          <h2 style="color:var(--td-text-primary); font-size:1.35rem; font-weight:700; margin:0.25rem 0 0;">
            Review Your Replication Before Dispatch
          </h2>
        </div>
        <div style="font-size:0.85rem; color:var(--td-pending); font-weight:600; display:flex; align-items:center; gap:0.4rem;">
          <span>⏳</span> <span>Will Enter Pending Review Queue</span>
        </div>
      </div>

      <!-- Critical Moderation Warning Notice -->
      <div style="background:rgba(234,179,8,0.08); border:1px solid var(--td-warning); border-radius:0.5rem; padding:1rem 1.25rem; margin-bottom:1.5rem; color:var(--td-text-secondary); font-size:0.9rem; line-height:1.5;">
        <div style="font-weight:700; color:var(--td-warning); margin-bottom:0.25rem; display:flex; align-items:center; gap:0.4rem;">
          <span>⚖️</span> <span>Scientific Integrity &amp; Moderation Notice</span>
        </div>
        Once submitted, this replication will enter moderator review. Contributors cannot approve their own submissions. A peer moderator will audit your measurements, conditions, and evidence against official protocol criteria before this data is integrated into community statistics.
      </div>

      <!-- Structured Summary Grid -->
      <div style="display:grid; grid-template-columns:1fr; gap:1.25rem; margin-bottom:2rem;">
        <!-- Protocol & Hardware Summary -->
        <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem; display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1.25rem;">
          <div>
            <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:var(--td-text-muted); margin-bottom:0.25rem;">
              Official Protocol
            </div>
            <div style="color:var(--td-text-primary); font-weight:700; font-size:1rem; margin-bottom:0.25rem;">
              ${escapeHtml(exp.title)}
            </div>
            <div style="font-size:0.82rem; color:var(--td-text-secondary);">
              Protocol ID: <strong>${escapeHtml(exp.id)}</strong> • Version: <strong>v${escapeHtml(exp.protocolVersion || exp.version || "1.0.0")}</strong>
            </div>
          </div>

          <div>
            <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:var(--td-text-muted); margin-bottom:0.25rem;">
              Target Hardware Under Test
            </div>
            <div style="color:var(--td-text-primary); font-weight:700; font-size:1rem; margin-bottom:0.25rem;">
              ${escapeHtml(state.selectedDevice?.brand)} ${escapeHtml(state.selectedDevice?.model)}
            </div>
            <div style="font-size:0.82rem; color:var(--td-text-secondary);">
              ${escapeHtml(state.selectedDevice?.specs?.processor || "")} • ${escapeHtml(state.selectedDevice?.specs?.os || "")} (${escapeHtml(state.selectedDevice?.releaseYear || "")})
            </div>
          </div>

          <div>
            <div style="font-size:0.75rem; text-transform:uppercase; font-weight:700; color:var(--td-text-muted); margin-bottom:0.25rem;">
              Contributor Identity
            </div>
            <div style="color:var(--td-text-primary); font-weight:700; font-size:1rem; margin-bottom:0.25rem;">
              ${escapeHtml(currentUser?.displayName || "Authenticated Contributor")}
            </div>
            <div style="font-size:0.82rem; color:var(--td-text-secondary);">
              ${escapeHtml(currentUser?.email || "")}
            </div>
          </div>
        </div>

        <!-- Submitted Measurements Table -->
        <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted);">
              📊 Schema-Verified Measurements
            </div>
            <button id="btnEditMeasurements" style="background:none; border:none; color:var(--td-info); font-size:0.82rem; font-weight:600; cursor:pointer;">
              Edit Measurements ✏️
            </button>
          </div>

          <table style="width:100%; border-collapse:collapse; font-size:0.88rem; text-align:left;">
            <thead>
              <tr style="border-bottom:1px solid var(--td-border); color:var(--td-text-muted); font-size:0.78rem; text-transform:uppercase;">
                <th style="padding:0.5rem 0.75rem;">Metric</th>
                <th style="padding:0.5rem 0.75rem;">Recorded Value</th>
                <th style="padding:0.5rem 0.75rem;">Unit</th>
                <th style="padding:0.5rem 0.75rem;">Schema Status</th>
              </tr>
            </thead>
            <tbody>
              ${schema.map(f => {
                if (!allowedKeys.includes(f.key)) return '';
                const val = state.measurements[f.key];
                let displayVal = "—";
                if (f.type === "boolean") {
                  displayVal = val === true ? "Yes / True" : "No / False";
                } else if (val !== undefined && val !== null && val !== "") {
                  displayVal = String(val);
                }

                return `
                  <tr style="border-bottom:1px solid var(--td-border-subtle);">
                    <td style="padding:0.55rem 0.75rem; color:var(--td-text-primary); font-weight:600;">${escapeHtml(f.label)}</td>
                    <td style="padding:0.55rem 0.75rem; font-family:monospace; color:var(--td-info); font-weight:700;">${escapeHtml(displayVal)}</td>
                    <td style="padding:0.55rem 0.75rem; color:var(--td-text-secondary);">${escapeHtml(f.unit || "—")}</td>
                    <td style="padding:0.55rem 0.75rem;">
                      <span style="font-size:0.75rem; padding:0.15rem 0.5rem; border-radius:9999px; background:rgba(34,197,94,0.1); color:var(--td-success); font-weight:600;">
                        ✓ Validated
                      </span>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>

        <!-- Testing Conditions & Notes Summary -->
        <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted);">
              🌡️ Testing Conditions &amp; Notes
            </div>
            <button id="btnEditConditions" style="background:none; border:none; color:var(--td-info); font-size:0.82rem; font-weight:600; cursor:pointer;">
              Edit Conditions ✏️
            </button>
          </div>

          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; margin-bottom:1rem; font-size:0.88rem;">
            <div>
              <span style="color:var(--td-text-muted); display:block; font-size:0.78rem;">Test Execution Date:</span>
              <strong style="color:var(--td-text-primary);">${escapeHtml(state.conditions.testDate || "Today")}</strong>
            </div>
            <div>
              <span style="color:var(--td-text-muted); display:block; font-size:0.78rem;">Tested Firmware / Software:</span>
              <strong style="color:var(--td-text-primary);">${escapeHtml(state.conditions.softwareVersion || "Not specified")}</strong>
            </div>
          </div>

          ${state.conditions.additionalConditions ? `
            <div style="margin-bottom:0.75rem; font-size:0.88rem;">
              <span style="color:var(--td-text-muted); display:block; font-size:0.78rem;">Additional Environmental Conditions:</span>
              <div style="color:var(--td-text-secondary); line-height:1.5; margin-top:0.25rem;">
                ${escapeHtml(state.conditions.additionalConditions)}
              </div>
            </div>
          ` : ''}

          ${state.conditions.notes ? `
            <div style="font-size:0.88rem;">
              <span style="color:var(--td-text-muted); display:block; font-size:0.78rem;">Empirical Observations:</span>
              <div style="color:var(--td-text-secondary); line-height:1.5; margin-top:0.25rem;">
                ${escapeHtml(state.conditions.notes)}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Attached Evidence Summary -->
        <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted);">
              📎 Attached Evidence Files (${state.evidenceList.length})
            </div>
            <button id="btnEditEvidence" style="background:none; border:none; color:var(--td-info); font-size:0.82rem; font-weight:600; cursor:pointer;">
              Manage Files ✏️
            </button>
          </div>

          ${state.evidenceList.length === 0 ? `
            <div style="color:var(--td-text-muted); font-size:0.85rem; font-style:italic;">
              No evidence files attached.
            </div>
          ` : `
            <div style="display:flex; flex-wrap:wrap; gap:0.75rem;">
              ${state.evidenceList.map(item => `
                <div style="background:var(--td-bg-surface); border:1px solid var(--td-border-subtle); border-radius:0.375rem; padding:0.5rem 0.75rem; font-size:0.82rem; display:flex; align-items:center; gap:0.5rem;">
                  <span>📎</span>
                  <span style="color:var(--td-text-primary); font-weight:600;">${escapeHtml(item.fileName || item.name)}</span>
                  <span style="color:var(--td-text-muted);">(${formatFileSize(item.size)})</span>
                </div>
              `).join("")}
            </div>
          `}
        </div>
      </div>

      <!-- Action Controls -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding-top:1.25rem; border-top:1px solid var(--td-border-subtle);">
        <button id="btnStep6Prev" style="padding:0.65rem 1.25rem; background:transparent; border:1px solid var(--td-border); color:var(--td-text-secondary); font-size:0.9rem; border-radius:0.375rem; cursor:pointer;">
          ← Back to Evidence
        </button>
        <button id="btnSubmitReplication" ${state.isSubmitting ? "disabled" : ""} style="display:inline-flex; align-items:center; gap:0.65rem; padding:0.75rem 2rem; background:var(--td-success); color:#fff; font-weight:700; font-size:1rem; border-radius:0.375rem; border:none; cursor:${state.isSubmitting ? 'not-allowed' : 'pointer'}; box-shadow:0 4px 16px rgba(34,197,94,0.35);">
          ${state.isSubmitting ? `
            <span>Submitting to Moderator Queue...</span>
          ` : `
            <span>🚀 Submit for Moderator Review</span>
          `}
        </button>
      </div>
    </div>
  `;

  // Jump to edit listeners
  stepContainer.querySelector("#btnEditMeasurements")?.addEventListener("click", () => {
    state.step = 3;
    renderWizard(mainContainer, state);
  });
  stepContainer.querySelector("#btnEditConditions")?.addEventListener("click", () => {
    state.step = 4;
    renderWizard(mainContainer, state);
  });
  stepContainer.querySelector("#btnEditEvidence")?.addEventListener("click", () => {
    state.step = 5;
    renderWizard(mainContainer, state);
  });

  // Step navigation listeners
  stepContainer.querySelector("#btnStep6Prev")?.addEventListener("click", () => {
    state.step = 5;
    renderWizard(mainContainer, state);
  });

  // FINAL SUBMISSION HANDLER
  stepContainer.querySelector("#btnSubmitReplication")?.addEventListener("click", async () => {
    if (state.isSubmitting) return;

    // Safety checks
    if (!state.selectedDevice) {
      alert("Please select a target hardware device before submitting.");
      state.step = 2;
      renderWizard(mainContainer, state);
      return;
    }

    state.isSubmitting = true;
    renderStep6Review(stepContainer, mainContainer, state);

    try {
      // Build clean measurements map strictly adhering to allowed keys
      const cleanMeasurements = {};
      schema.forEach(field => {
        if (allowedKeys.includes(field.key)) {
          const raw = state.measurements[field.key];
          if (field.type === "number") {
            if (raw !== "" && raw !== null && raw !== undefined) {
              cleanMeasurements[field.key] = Number(raw);
            }
          } else if (field.type === "boolean") {
            cleanMeasurements[field.key] = Boolean(raw);
          } else if (raw !== undefined && raw !== null && raw !== "") {
            cleanMeasurements[field.key] = String(raw).trim();
          }
        }
      });

      // Prepare hardened submission payload
      const payload = {
        userId: currentUser.uid,
        submitterName: currentUser.displayName || "Contributor",
        submitterEmail: currentUser.email || "",
        deviceId: state.selectedDevice.id,
        experimentId: exp.id,
        testDate: state.conditions.testDate || new Date().toISOString().split("T")[0],
        softwareVersion: state.conditions.softwareVersion || "",
        conditions: {
          officialBaseline: exp.conditions || "",
          additionalConditions: state.conditions.additionalConditions || "",
          environment: state.conditions.additionalConditions || ""
        },
        measurements: cleanMeasurements,
        evidenceReferences: state.evidenceList.map(ref => ({
          name: ref.name || ref.fileName || "Evidence",
          fileName: ref.fileName || ref.name || "",
          path: ref.path || "",
          url: ref.url || "#",
          size: Number(ref.size) || 0,
          type: ref.type || "application/octet-stream",
          description: ref.description || ""
        })),
        notes: state.conditions.notes || ""
      };

      const result = await createSubmission(payload);
      state.submissionResult = result;
      state.step = 7;
      renderWizard(mainContainer, state);
    } catch (err) {
      console.error("Submission failed:", err);
      state.isSubmitting = false;
      state.generalError = `Submission failed: ${err.message}`;
      renderWizard(mainContainer, state);
    }
  });
}

/**
 * STEP 7: Success Screen (Pending Review Queue)
 */
function renderSuccessScreen(container, state) {
  const result = state.submissionResult;

  container.innerHTML = `
    <div style="max-width:720px; margin:3rem auto; padding:2.5rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; text-align:center; box-shadow:0 12px 32px rgba(0,0,0,0.2);">
      <div style="display:inline-flex; align-items:center; justify-content:center; width:64px; height:64px; border-radius:50%; background:rgba(34,197,94,0.12); color:var(--td-success); font-size:2.25rem; margin-bottom:1.25rem;">
        ✓
      </div>
      
      <h2 style="color:var(--td-text-primary); font-size:1.6rem; font-weight:700; margin-bottom:0.5rem;">
        Replication Successfully Submitted
      </h2>
      
      <p style="color:var(--td-text-secondary); font-size:1rem; line-height:1.6; max-width:540px; margin:0 auto 1.5rem;">
        Your empirical replication test has been safely recorded into the WDIII community peer-review queue.
      </p>

      <!-- Submission Badge Card -->
      <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem; max-width:480px; margin:0 auto 2rem; text-align:left; font-size:0.88rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
          <span style="color:var(--td-text-muted);">Submission ID:</span>
          <span style="font-family:monospace; color:var(--td-info); font-weight:700;">${escapeHtml(result?.id || "sub_unknown")}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
          <span style="color:var(--td-text-muted);">Current Status:</span>
          <span style="font-weight:700; color:var(--td-pending); text-transform:uppercase; font-size:0.78rem; padding:0.15rem 0.5rem; border-radius:9999px; background:rgba(234,179,8,0.12);">
            Pending Review
          </span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
          <span style="color:var(--td-text-muted);">Official Protocol:</span>
          <span style="color:var(--td-text-primary); font-weight:600;">${escapeHtml(state.experiment.title)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="color:var(--td-text-muted);">Hardware Device:</span>
          <span style="color:var(--td-text-primary); font-weight:600;">${escapeHtml(state.selectedDevice?.brand)} ${escapeHtml(state.selectedDevice?.model)}</span>
        </div>
      </div>

      <div style="background:rgba(96,165,250,0.08); border:1px solid var(--td-info); border-radius:0.5rem; padding:1rem; max-width:540px; margin:0 auto 2rem; font-size:0.85rem; color:var(--td-text-secondary); line-height:1.5; text-align:left;">
        <strong style="color:var(--td-info);">Next Step in Verification Pipeline:</strong>
        <p style="margin:0.25rem 0 0;">
          A designated peer moderator will verify your experimental measurements, methodology conditions, and attached evidentiary documentation against the official protocol. You can track this replication's status in your personal portfolio.
        </p>
      </div>

      <!-- Action Navigation Buttons -->
      <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
        <a href="#/my-tests" style="display:inline-block; padding:0.65rem 1.5rem; background:var(--td-info); color:#fff; font-weight:600; border-radius:0.375rem; text-decoration:none; font-size:0.92rem; box-shadow:0 4px 12px rgba(2,132,199,0.3);">
          View in My Tests →
        </a>
        <a href="#/replicate" style="display:inline-block; padding:0.65rem 1.25rem; background:var(--td-bg-card); border:1px solid var(--td-border); color:var(--td-text-primary); font-weight:600; border-radius:0.375rem; text-decoration:none; font-size:0.92rem;">
          Replicate Another Protocol
        </a>
        <a href="#/" style="display:inline-block; padding:0.65rem 1.25rem; background:transparent; border:1px solid var(--td-border); color:var(--td-text-secondary); border-radius:0.375rem; text-decoration:none; font-size:0.92rem;">
          Return to Vault Archive
        </a>
      </div>
    </div>
  `;
}
