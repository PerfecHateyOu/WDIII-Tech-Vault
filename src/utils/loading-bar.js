/**
 * WDIII Tech Vault - UI Performance, Smooth Loading & Progress Bar Service
 * 
 * Provides:
 * 1. Global top viewport progress bar (like NProgress, 60fps GPU-accelerated)
 * 2. Multi-step Contributor / Visitor Auth Progress Modal with live ETA
 * 3. Micro-loading indicators and visual feedback helpers
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
