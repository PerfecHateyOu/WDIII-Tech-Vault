/**
 * WDIII Tech Vault - UI Performance, Smooth Loading & Progress Bar Service
 * 
 * Provides:
 * 1. Global top viewport progress bar (like NProgress, 60fps GPU-accelerated)
 * 2. Multi-step Submission Progress Modal with live elapsed timer & dynamic ETA
 * 3. Multi-step Contributor / Visitor Auth Progress Modal with live ETA
 * 4. Micro-loading indicators and visual feedback helpers
 */

// Global state for top progress bar
let topBarElement = null;
let topBarTimer = null;
let topBarPercent = 0;

/**
 * Initialize or retrieve top progress bar DOM node
 */
export function initGlobalProgressBar() {
  if (typeof document === "undefined") return null;
  if (topBarElement) return topBarElement;

  let el = document.getElementById("appTopProgressBar");
  if (!el) {
    el = document.createElement("div");
    el.id = "appTopProgressBar";
    el.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, #38bdf8 0%, #60a5fa 40%, #fbbf24 85%, #f59e0b 100%);
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.7), 0 0 4px rgba(251, 191, 36, 0.8);
      z-index: 99999;
      pointer-events: none;
      transition: width 0.22s cubic-bezier(0.1, 0.9, 0.2, 1), opacity 0.3s ease;
      opacity: 0;
    `;
    document.body.appendChild(el);
  }
  topBarElement = el;
  return el;
}

/**
 * Start top progress animation with smooth ease-out physics
 * @param {number} estimatedDurationMs - Estimated duration in ms
 */
export function startTopProgress(estimatedDurationMs = 1200) {
  const el = initGlobalProgressBar();
  if (!el) return;

  clearInterval(topBarTimer);
  topBarPercent = 8;
  el.style.opacity = "1";
  el.style.width = `${topBarPercent}%`;

  const interval = 60;
  const increment = (75 / (estimatedDurationMs / interval));

  topBarTimer = setInterval(() => {
    if (topBarPercent < 88) {
      topBarPercent += increment * (1 - (topBarPercent / 100) * 0.7);
      el.style.width = `${Math.min(topBarPercent, 88)}%`;
    }
  }, interval);
}

/**
 * Set exact percentage on top progress bar
 * @param {number} percent - 0 to 100
 */
export function setTopProgress(percent) {
  const el = initGlobalProgressBar();
  if (!el) return;
  topBarPercent = Math.min(Math.max(percent, 0), 100);
  el.style.opacity = "1";
  el.style.width = `${topBarPercent}%`;
}

/**
 * Complete top progress bar, rush to 100% and fade out
 */
export function completeTopProgress() {
  const el = initGlobalProgressBar();
  if (!el) return;

  clearInterval(topBarTimer);
  topBarPercent = 100;
  el.style.width = "100%";

  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => {
      el.style.width = "0%";
      topBarPercent = 0;
    }, 320);
  }, 180);
}

/**
 * Display an interactive, multi-step progress modal during empirical test submission
 * 
 * @param {Object} options
 * @param {string} options.title - Header title
 * @param {string} options.subtitle - Hardware / protocol context
 * @param {number} options.estimatedSeconds - Baseline estimated duration
 * @returns {Object} Controller object { updateStage(stageIndex, percent, statusText), complete(details), error(err) }
 */
export function renderSubmissionProgressModal(options = {}) {
  const title = options.title || "Transmitting Empirical Test to Vault";
  const subtitle = options.subtitle || "Authenticating cryptographic provenance and recording protocol measurements";
  const estimatedSeconds = options.estimatedSeconds || 1.6;

  // Remove existing modal if any
  document.getElementById("wdiiiProgressModalOverlay")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "wdiiiProgressModalOverlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(8, 12, 20, 0.82);
    backdrop-filter: blur(8px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    animation: wdiiiFadeIn 0.2s ease-out;
  `;

  overlay.innerHTML = `
    <div style="background:var(--td-bg-surface-elevated, #111827); border:1px solid var(--td-border, #1f2937); border-radius:0.75rem; max-width:540px; width:100%; box-shadow:0 24px 64px rgba(0,0,0,0.6); overflow:hidden;">
      <!-- Header -->
      <div style="padding:1.5rem 1.5rem 1.25rem; border-bottom:1px solid var(--td-border-subtle, #273549); display:flex; align-items:flex-start; gap:1rem;">
        <div style="width:44px; height:44px; border-radius:50%; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.3); display:flex; align-items:center; justify-content:center; font-size:1.35rem; color:#38bdf8; flex-shrink:0;">
          🧪
        </div>
        <div style="flex:1;">
          <h3 style="margin:0 0 0.25rem; color:#fff; font-size:1.15rem; font-weight:700;">${title}</h3>
          <p style="margin:0; font-size:0.85rem; color:var(--td-text-muted, #94a3b8); line-height:1.4;">${subtitle}</p>
        </div>
      </div>

      <!-- Main Progress Body -->
      <div style="padding:1.5rem;">
        <!-- Timer & ETA Bar -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.625rem; font-size:0.82rem;">
          <span id="modalCurrentStatusText" style="color:#38bdf8; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:280px;">
            Initializing protocol payload...
          </span>
          <span style="display:flex; align-items:center; gap:0.5rem; color:var(--td-text-muted, #94a3b8); font-variant-numeric:tabular-nums;">
            <span>⏱️ <span id="modalLiveElapsed">0.0s</span></span>
            <span>•</span>
            <span id="modalLiveEta">Est: ~${estimatedSeconds.toFixed(1)}s</span>
          </span>
        </div>

        <!-- Progress Track -->
        <div style="background:rgba(15,23,42,0.9); border:1px solid var(--td-border-subtle, #273549); border-radius:9999px; height:12px; overflow:hidden; position:relative; margin-bottom:1.5rem; padding:2px;">
          <div id="modalProgressBarFill" style="background:linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #fbbf24 100%); height:100%; width:8%; border-radius:9999px; transition:width 0.25s cubic-bezier(0.1, 0.8, 0.2, 1); box-shadow:0 0 10px rgba(56,189,248,0.5);"></div>
        </div>

        <!-- Multi-step checklist -->
        <div id="modalStepList" style="display:flex; flex-direction:column; gap:0.75rem;">
          <div class="modal-step" data-step="1" style="display:flex; align-items:center; gap:0.75rem; font-size:0.875rem; color:#fff;">
            <div class="step-icon" style="width:22px; height:22px; border-radius:50%; background:rgba(56,189,248,0.2); border:1px solid #38bdf8; display:flex; align-items:center; justify-content:center; font-size:0.75rem; color:#38bdf8; font-weight:700;">1</div>
            <div class="step-label" style="flex:1;">Validating empirical parameters &amp; unit compliance</div>
            <span class="step-status" style="font-size:0.75rem; color:#38bdf8; font-weight:600;">In progress</span>
          </div>

          <div class="modal-step" data-step="2" style="display:flex; align-items:center; gap:0.75rem; font-size:0.875rem; color:var(--td-text-muted, #94a3b8); opacity:0.65;">
            <div class="step-icon" style="width:22px; height:22px; border-radius:50%; background:rgba(148,163,184,0.1); border:1px solid var(--td-border, #334155); display:flex; align-items:center; justify-content:center; font-size:0.75rem; color:var(--td-text-muted, #94a3b8);">2</div>
            <div class="step-label" style="flex:1;">Cryptographic provenance &amp; JSON serialization</div>
            <span class="step-status" style="font-size:0.75rem; color:var(--td-text-muted, #94a3b8);">Pending</span>
          </div>

          <div class="modal-step" data-step="3" style="display:flex; align-items:center; gap:0.75rem; font-size:0.875rem; color:var(--td-text-muted, #94a3b8); opacity:0.65;">
            <div class="step-icon" style="width:22px; height:22px; border-radius:50%; background:rgba(148,163,184,0.1); border:1px solid var(--td-border, #334155); display:flex; align-items:center; justify-content:center; font-size:0.75rem; color:var(--td-text-muted, #94a3b8);">3</div>
            <div class="step-label" style="flex:1;">Transmitting to WDIII Vault &amp; persistence layer</div>
            <span class="step-status" style="font-size:0.75rem; color:var(--td-text-muted, #94a3b8);">Pending</span>
          </div>

          <div class="modal-step" data-step="4" style="display:flex; align-items:center; gap:0.75rem; font-size:0.875rem; color:var(--td-text-muted, #94a3b8); opacity:0.65;">
            <div class="step-icon" style="width:22px; height:22px; border-radius:50%; background:rgba(148,163,184,0.1); border:1px solid var(--td-border, #334155); display:flex; align-items:center; justify-content:center; font-size:0.75rem; color:var(--td-text-muted, #94a3b8);">4</div>
            <div class="step-label" style="flex:1;">Registering in peer moderation queue</div>
            <span class="step-status" style="font-size:0.75rem; color:var(--td-text-muted, #94a3b8);">Pending</span>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const fill = overlay.querySelector("#modalProgressBarFill");
  const statusTextEl = overlay.querySelector("#modalCurrentStatusText");
  const elapsedEl = overlay.querySelector("#modalLiveElapsed");
  const etaEl = overlay.querySelector("#modalLiveEta");
  const steps = overlay.querySelectorAll(".modal-step");

  const startTime = performance.now();
  const timerInterval = setInterval(() => {
    const elapsedSec = (performance.now() - startTime) / 1000;
    elapsedEl.textContent = `${elapsedSec.toFixed(1)}s`;
    const remaining = Math.max(0, estimatedSeconds - elapsedSec);
    etaEl.textContent = remaining > 0 ? `Est: ~${remaining.toFixed(1)}s` : "Wrapping up...";
  }, 80);

  function markStep(stepIdx, state) {
    steps.forEach((st, idx) => {
      const stepNum = idx + 1;
      const icon = st.querySelector(".step-icon");
      const stat = st.querySelector(".step-status");

      if (stepNum < stepIdx) {
        st.style.opacity = "1";
        st.style.color = "#fff";
        icon.style.background = "rgba(16,185,129,0.2)";
        icon.style.borderColor = "#10b981";
        icon.style.color = "#10b981";
        icon.innerHTML = "✓";
        stat.style.color = "#10b981";
        stat.textContent = "Done";
      } else if (stepNum === stepIdx) {
        st.style.opacity = "1";
        st.style.color = "#fff";
        icon.style.background = "rgba(56,189,248,0.2)";
        icon.style.borderColor = "#38bdf8";
        icon.style.color = "#38bdf8";
        icon.innerHTML = `${stepNum}`;
        stat.style.color = "#38bdf8";
        stat.textContent = state || "In progress";
      } else {
        st.style.opacity = "0.5";
        st.style.color = "var(--td-text-muted, #94a3b8)";
        icon.style.background = "rgba(148,163,184,0.1)";
        icon.style.borderColor = "var(--td-border, #334155)";
        icon.style.color = "var(--td-text-muted, #94a3b8)";
        icon.innerHTML = `${stepNum}`;
        stat.style.color = "var(--td-text-muted, #94a3b8)";
        stat.textContent = "Pending";
      }
    });
  }

  return {
    updateStage(stepIdx, percent, text) {
      if (fill) fill.style.width = `${Math.min(Math.max(percent, 5), 100)}%`;
      if (statusTextEl && text) statusTextEl.textContent = text;
      markStep(stepIdx, "In progress");
    },

    complete(details = {}) {
      clearInterval(timerInterval);
      const totalTime = ((performance.now() - startTime) / 1000).toFixed(1);
      if (fill) fill.style.width = "100%";
      if (statusTextEl) statusTextEl.textContent = `Completed in ${totalTime}s!`;
      markStep(5, "Done");

      const card = overlay.querySelector("div");
      if (card) {
        card.innerHTML = `
          <div style="padding:2rem; text-align:center;">
            <div style="width:60px; height:60px; border-radius:50%; background:rgba(16,185,129,0.18); border:2px solid #10b981; display:flex; align-items:center; justify-content:center; font-size:2rem; color:#10b981; margin:0 auto 1.25rem;">
              ✓
            </div>
            <h3 style="margin:0 0 0.5rem; color:#fff; font-size:1.35rem; font-weight:700;">Empirical Test Submitted!</h3>
            <p style="color:var(--td-text-secondary, #94a3b8); font-size:0.95rem; margin:0 auto 1.5rem; max-width:440px;">
              Protocol record securely registered in <strong>${totalTime}s</strong>. Submission ID: <code style="color:#38bdf8; background:rgba(56,189,248,0.1); padding:0.2rem 0.4rem; border-radius:0.25rem;">${details.id || "sub_vault"}</code>
            </p>
            <div style="display:inline-flex; align-items:center; gap:0.5rem; font-size:0.85rem; color:var(--td-pending, #fbbf24); background:rgba(245,158,11,0.12); padding:0.4rem 0.8rem; border-radius:9999px; margin-bottom:1.5rem; border:1px solid rgba(245,158,11,0.3);">
              <span>⚖️ Status:</span> <strong>PENDING PEER REVIEW</strong>
            </div>
            <div>
              <a href="#/my-tests" id="btnGoToMyTestsNow" style="display:inline-block; padding:0.6rem 1.4rem; background:#0284c7; color:#fff; border-radius:0.375rem; text-decoration:none; font-weight:600; font-size:0.9rem; box-shadow:0 4px 12px rgba(2,132,199,0.35);">
                View in My Tests Portfolio ↗
              </a>
            </div>
          </div>
        `;
      }

      setTimeout(() => {
        overlay.style.transition = "opacity 0.3s ease";
        overlay.style.opacity = "0";
        setTimeout(() => overlay.remove(), 320);
      }, 2200);
    },

    error(err) {
      clearInterval(timerInterval);
      if (fill) {
        fill.style.background = "var(--td-error, #ef4444)";
        fill.style.width = "100%";
      }
      if (statusTextEl) {
        statusTextEl.style.color = "var(--td-error, #ef4444)";
        statusTextEl.textContent = `Error: ${err.message || "Submission failed"}`;
      }

      const card = overlay.querySelector("div");
      if (card) {
        const errDiv = document.createElement("div");
        errDiv.style.cssText = "margin-top:1.5rem; padding:1rem; background:rgba(239,68,68,0.12); border:1px solid var(--td-error, #ef4444); border-radius:0.5rem; text-align:center;";
        errDiv.innerHTML = `
          <div style="color:var(--td-error, #ef4444); font-weight:600; margin-bottom:0.5rem;">Transmission Interrupted</div>
          <div style="color:var(--td-text-secondary, #94a3b8); font-size:0.85rem; margin-bottom:1rem;">${err.message || "An unexpected error occurred."}</div>
          <button type="button" id="btnDismissModalErr" style="padding:0.45rem 1rem; background:var(--td-bg-card, #1f2937); border:1px solid var(--td-border, #374151); color:#fff; border-radius:0.25rem; cursor:pointer;">Dismiss &amp; Edit Form</button>
        `;
        card.appendChild(errDiv);
        errDiv.querySelector("#btnDismissModalErr")?.addEventListener("click", () => overlay.remove());
      }
    }
  };
}

/**
 * Display an interactive loading modal for logging into contributor or visitor accounts
 * @param {Object} options
 * @param {string} options.type - 'google' | 'visitor'
 * @returns {Object} Controller { updateStage(stageIndex, percent, text), complete(), error(err) }
 */
export function renderAuthProgressModal(options = {}) {
  const isVisitor = options.type === "visitor";
  const title = isVisitor ? "Initializing Guest Contributor Sandbox" : "Signing In with Google Contributor Account";
  const subtitle = isVisitor 
    ? "Allocating empirical sandbox session, research portfolio, and protocol permissions"
    : "Verifying Google OAuth identity, synchronizing research credentials, and privileges";
  const estimatedSeconds = isVisitor ? 0.6 : 1.8;

  document.getElementById("wdiiiAuthProgressModal")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "wdiiiAuthProgressModal";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(8, 12, 20, 0.85);
    backdrop-filter: blur(8px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.25rem;
    animation: wdiiiFadeIn 0.2s ease-out;
  `;

  overlay.innerHTML = `
    <div style="background:var(--td-bg-surface-elevated, #111827); border:1px solid var(--td-border, #1f2937); border-radius:0.75rem; max-width:480px; width:100%; box-shadow:0 24px 64px rgba(0,0,0,0.65); padding:1.75rem;">
      <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.25rem;">
        <div style="width:42px; height:42px; border-radius:50%; background:${isVisitor ? "rgba(245,158,11,0.15)" : "rgba(56,189,248,0.15)"}; border:1px solid ${isVisitor ? "rgba(245,158,11,0.35)" : "rgba(56,189,248,0.35)"}; display:flex; align-items:center; justify-content:center; font-size:1.35rem; color:${isVisitor ? "#fbbf24" : "#38bdf8"};">
          ${isVisitor ? "👤" : "🔑"}
        </div>
        <div>
          <h3 style="margin:0 0 0.25rem; color:#fff; font-size:1.1rem; font-weight:700;">${title}</h3>
          <p style="margin:0; font-size:0.8rem; color:var(--td-text-muted, #94a3b8); line-height:1.4;">${subtitle}</p>
        </div>
      </div>

      <!-- ETA & Elapsed -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; font-size:0.82rem;">
        <span id="authModalStatusText" style="color:${isVisitor ? "#fbbf24" : "#38bdf8"}; font-weight:600;">
          ${isVisitor ? "Configuring guest session..." : "Contacting Google Identity..."}
        </span>
        <span style="color:var(--td-text-muted, #94a3b8); font-variant-numeric:tabular-nums; font-size:0.8rem;">
          ⏱️ <span id="authModalElapsed">0.0s</span> (Est: ~${estimatedSeconds}s)
        </span>
      </div>

      <!-- Progress Track -->
      <div style="background:rgba(15,23,42,0.9); border:1px solid var(--td-border-subtle, #273549); border-radius:9999px; height:10px; overflow:hidden; margin-bottom:1.25rem; padding:1px;">
        <div id="authModalFill" style="background:${isVisitor ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "linear-gradient(90deg, #0284c7, #38bdf8)"}; height:100%; width:15%; border-radius:9999px; transition:width 0.22s ease-out;"></div>
      </div>

      <!-- Mini stages -->
      <div id="authModalStageList" style="display:flex; flex-direction:column; gap:0.5rem; font-size:0.82rem; color:var(--td-text-muted, #94a3b8);">
        <div class="auth-stage" data-stage="1" style="display:flex; justify-content:space-between;">
          <span>1. Identity handshake &amp; security token</span>
          <span class="stage-state" style="color:${isVisitor ? "#fbbf24" : "#38bdf8"}; font-weight:600;">In progress</span>
        </div>
        <div class="auth-stage" data-stage="2" style="display:flex; justify-content:space-between; opacity:0.6;">
          <span>2. Contributor profile synchronization</span>
          <span class="stage-state">Pending</span>
        </div>
        <div class="auth-stage" data-stage="3" style="display:flex; justify-content:space-between; opacity:0.6;">
          <span>3. Vault research privileges initialization</span>
          <span class="stage-state">Pending</span>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const fill = overlay.querySelector("#authModalFill");
  const statusText = overlay.querySelector("#authModalStatusText");
  const elapsedEl = overlay.querySelector("#authModalElapsed");
  const stages = overlay.querySelectorAll(".auth-stage");

  const start = performance.now();
  const timer = setInterval(() => {
    const s = ((performance.now() - start) / 1000).toFixed(1);
    if (elapsedEl) elapsedEl.textContent = `${s}s`;
  }, 80);

  function markStage(stageNum) {
    stages.forEach((st, idx) => {
      const n = idx + 1;
      const stateSpan = st.querySelector(".stage-state");
      if (n < stageNum) {
        st.style.opacity = "1";
        st.style.color = "#fff";
        stateSpan.style.color = "#10b981";
        stateSpan.textContent = "✓ Done";
      } else if (n === stageNum) {
        st.style.opacity = "1";
        st.style.color = "#fff";
        stateSpan.style.color = isVisitor ? "#fbbf24" : "#38bdf8";
        stateSpan.textContent = "In progress";
      } else {
        st.style.opacity = "0.5";
        st.style.color = "var(--td-text-muted, #94a3b8)";
        stateSpan.style.color = "var(--td-text-muted, #94a3b8)";
        stateSpan.textContent = "Pending";
      }
    });
  }

  return {
    updateStage(stageNum, percent, text) {
      if (fill) fill.style.width = `${Math.min(Math.max(percent, 10), 100)}%`;
      if (statusText && text) statusText.textContent = text;
      markStage(stageNum);
    },

    complete() {
      clearInterval(timer);
      if (fill) fill.style.width = "100%";
      markStage(4);
      if (statusText) {
        statusText.style.color = "#10b981";
        statusText.textContent = "✓ Authenticated!";
      }
      setTimeout(() => {
        overlay.style.transition = "opacity 0.25s ease";
        overlay.style.opacity = "0";
        setTimeout(() => overlay.remove(), 260);
      }, 450);
    },

    error(err) {
      clearInterval(timer);
      if (fill) {
        fill.style.background = "var(--td-error, #ef4444)";
        fill.style.width = "100%";
      }
      if (statusText) {
        statusText.style.color = "var(--td-error, #ef4444)";
        statusText.textContent = err.message || "Authentication failed";
      }
      setTimeout(() => overlay.remove(), 2500);
    }
  };
}
