/**
 * WDIII Tech Vault - Experiment Detail UI View
 * 
 * Complies with strict WDIII design system:
 * - High-contrast dark theme with CSS custom properties
 * - Preserves authoritative research findings and data presentation
 * - Features linked hardware devices with direct links to #/devices/{deviceId}
 * - Displays research questions, objectives, methodology, and verdicts
 */

import { getExperimentById, getApprovedSubmissionsForExperiment } from "../services/database.js";

function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Render single Experiment Detail Page (#/experiments/{experimentId})
 */
export async function renderExperimentDetail(container, experimentId) {
  if (!container) return;

  container.innerHTML = `<div style="text-align:center; padding:4rem 2rem; color:var(--td-text-muted);">Retrieving research dossier…</div>`;

  const exp = await getExperimentById(experimentId);
  const communitySubmissions = await getApprovedSubmissionsForExperiment(experimentId);

  if (!exp) {
    container.innerHTML = `
      <div style="max-width:640px; margin:4rem auto; text-align:center; padding:3rem 2rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem;">
        <div style="font-size:2.5rem; margin-bottom:0.75rem;">⚠️</div>
        <h2 style="color:#fff; font-size:1.4rem; font-weight:700; margin:0 0 0.5rem;">Experiment Not Found</h2>
        <p style="color:var(--td-text-secondary); font-size:0.95rem; margin:0 0 1.5rem; line-height:1.6;">
          Experiment identifier <code style="color:var(--td-info); background:var(--td-bg-card); padding:0.2rem 0.4rem; border-radius:0.25rem;">${esc(experimentId)}</code> does not exist in the WDIII archive.
        </p>
        <a href="#/" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.6rem 1.25rem; border-radius:0.375rem; background:var(--td-info); color:#fff; font-weight:600; font-size:0.9rem; text-decoration:none;">
          ← Return to Vault Home
        </a>
      </div>
    `;
    return;
  }

  const linkedDevices = exp.linkedDevices || [];

  // Determine category and status colors
  let catBg = "var(--td-info-bg)";
  let catColor = "var(--td-info)";
  if (exp.category === "support") { catBg = "var(--td-warning-bg)"; catColor = "var(--td-warning)"; }
  else if (exp.category === "software" || exp.category === "ai") { catBg = "var(--td-ai-bg)"; catColor = "var(--td-ai)"; }
  else if (exp.category === "legal") { catBg = "var(--td-error-bg)"; catColor = "var(--td-error)"; }
  else if (exp.category === "hardware") { catBg = "var(--td-success-bg)"; catColor = "var(--td-success)"; }
  else if (exp.category === "ecosystem") { catBg = "var(--td-ecosystem-bg)"; catColor = "var(--td-ecosystem)"; }

  // Check if there is an existing rendered experiment in the DOM on home/fodder page
  // We can cleanly embed or replicate the exact visual content
  let customContentHtml = "";
  const existingDomExp = document.querySelector(`article#${exp.id}`);
  if (existingDomExp) {
    // Clone the body of the existing experiment for 100% visual fidelity
    const bodyEl = existingDomExp.querySelector(".td-experiment-body");
    if (bodyEl) {
      customContentHtml = bodyEl.innerHTML;
    }
  }

  container.innerHTML = `
    <div style="max-width:1000px; margin:0 auto; padding:2rem 1rem;">
      <!-- Breadcrumb Navigation -->
      <nav style="display:flex; align-items:center; flex-wrap:wrap; gap:0.5rem; font-size:0.85rem; color:var(--td-text-muted); margin-bottom:1.5rem;">
        <a href="#/" style="color:var(--td-text-muted); text-decoration:none;">🏠 Home</a>
        <span>/</span>
        <span style="color:var(--td-text-muted);">🧪 Experiments</span>
        <span>/</span>
        <span style="color:var(--td-text-primary); font-weight:600;">${esc(exp.title)}</span>
      </nav>

      <!-- Back Link -->
      <div style="margin-bottom:1.25rem;">
        <a href="#/" style="display:inline-flex; align-items:center; gap:0.375rem; color:var(--td-info); font-size:0.85rem; font-weight:600; text-decoration:none;">
          ← Back to Vault Index
        </a>
      </div>

      <!-- Main Experiment Container -->
      <article class="td-experiment" style="margin-bottom:2.5rem; border:1px solid var(--td-border); border-radius:0.75rem; overflow:hidden; background:var(--td-bg-surface);">
        <!-- Experiment Header -->
        <div class="td-experiment-header" style="background:var(--td-bg-surface-elevated); padding:2rem; border-bottom:1px solid var(--td-border);">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.75rem; margin-bottom:0.75rem;">
            <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
              <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; padding:0.2rem 0.6rem; border-radius:0.25rem; background:${catBg}; color:${catColor};">
                ${esc(exp.category)}
              </span>
              <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; padding:0.2rem 0.6rem; border-radius:9999px; border:1px solid var(--td-success); background:var(--td-success-bg); color:var(--td-success);">
                ${esc(exp.status)}
              </span>
              ${exp.scope ? `
                <span style="font-size:0.75rem; color:var(--td-text-muted); background:var(--td-bg-card); border:1px dashed var(--td-border-subtle); padding:0.2rem 0.6rem; border-radius:9999px;">
                  ${esc(exp.scope)}
                </span>
              ` : ""}
            </div>
            <div style="font-size:0.8rem; color:var(--td-text-muted); font-family:monospace;">
              PROTOCOL: ${esc(exp.id.toUpperCase())}
            </div>
          </div>

          <h1 style="color:#fff; font-size:clamp(1.5rem, 3vw, 2.1rem); font-weight:700; margin:0 0 0.5rem; line-height:1.3;">
            ${esc(exp.title)}
          </h1>
          ${exp.subtitle ? `<p style="color:var(--td-text-secondary); font-size:1.05rem; margin:0 0 1rem; line-height:1.5;">${esc(exp.subtitle)}</p>` : ""}

          <!-- Community Protocol Action Banner -->
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-top:1.25rem; padding:0.875rem 1.25rem; background:var(--td-bg-card); border:1px solid var(--td-info); border-radius:0.5rem;">
            <div>
              <div style="font-size:0.85rem; font-weight:700; color:var(--td-text-primary); margin-bottom:0.15rem;">
                🧪 Contribute Empirical Test Data
              </div>
              <div style="font-size:0.8rem; color:var(--td-text-secondary);">
                Run this official protocol on your personal hardware and submit your measurements for peer review.
              </div>
            </div>
            <a href="#/submit?experiment=${encodeURIComponent(exp.id)}" style="display:inline-flex; align-items:center; gap:0.375rem; padding:0.45rem 1rem; border-radius:0.375rem; background:var(--td-info); color:#fff; font-weight:600; font-size:0.85rem; text-decoration:none; white-space:nowrap;">
              <span>+ Submit Test for This Protocol</span>
            </a>
          </div>

          <!-- Linked Devices Bar -->
          <div style="margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid var(--td-border-subtle);">
            <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:var(--td-text-muted); margin-bottom:0.5rem; display:flex; align-items:center; gap:0.35rem;">
              <span>📱</span> <span>Hardware Devices Tested in this Protocol (${linkedDevices.length}):</span>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:0.5rem;">
              ${linkedDevices.length > 0 ? linkedDevices.map(dev => `
                <a href="#/devices/${dev.id}" style="display:inline-flex; align-items:center; gap:0.375rem; padding:0.35rem 0.75rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.82rem; font-weight:600; text-decoration:none; transition:border-color 0.15s;">
                  <span style="color:var(--td-info);">↗</span>
                  <span>${esc(dev.brand ? dev.brand + " " + dev.model : dev.id)}</span>
                </a>
              `).join("") : `
                <span style="font-size:0.82rem; color:var(--td-text-muted); font-style:italic;">No direct physical hardware models linked.</span>
              `}
            </div>
          </div>
        </div>

        <!-- Experiment Body -->
        <div class="td-experiment-body" style="padding:2rem;">
          <!-- Structured Methodology & Research Question Block -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem; margin-bottom:2rem;">
            <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-info); font-weight:700; margin-bottom:0.35rem;">
                🎯 Research Question
              </div>
              <p style="color:var(--td-text-primary); font-size:0.92rem; margin:0; line-height:1.5; font-weight:500;">
                ${esc(exp.researchQuestion)}
              </p>
            </div>

            <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-success); font-weight:700; margin-bottom:0.35rem;">
                🔬 Empirical Methodology
              </div>
              <p style="color:var(--td-text-secondary); font-size:0.9rem; margin:0; line-height:1.5;">
                ${esc(exp.methodology)}
              </p>
            </div>
          </div>

          <!-- Existing or Rich Protocol Content -->
          ${customContentHtml ? `
            <div class="custom-protocol-content">
              ${customContentHtml}
            </div>
          ` : `
            <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.5rem; padding:1.5rem; margin-bottom:1.5rem;">
              <h3 style="color:#fff; font-size:1.15rem; font-weight:700; margin:0 0 0.75rem;">Documented Protocol &amp; Measurements</h3>
              <p style="color:var(--td-text-secondary); font-size:0.95rem; line-height:1.6; margin:0 0 1rem;">
                ${esc(exp.protocol || "Comprehensive hands-on measurement protocol conducted in the WDIII testing environment.")}
              </p>
              ${exp.verdict ? `
                <div style="background:var(--td-bg-surface); border-left:3px solid var(--td-success); padding:1rem; border-radius:0.375rem; margin-top:1rem;">
                  <div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-success); margin-bottom:0.25rem;">Final Verdict &amp; Takeaways</div>
                  <div style="color:var(--td-text-primary); font-size:0.95rem; line-height:1.5; font-weight:500;">${esc(exp.verdict)}</div>
                </div>
              ` : ""}
            </div>
          `}

          <!-- Limitations and Caveats -->
          ${exp.limitations ? `
            <div style="background:rgba(245, 158, 11, 0.08); border:1px solid rgba(245, 158, 11, 0.25); border-radius:0.5rem; padding:1.25rem; margin-top:1.5rem; margin-bottom:1.5rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-warning); font-weight:700; margin-bottom:0.25rem; display:flex; align-items:center; gap:0.35rem;">
                <span>⚠️</span> <span>Scope Limitations &amp; Documentation Gaps</span>
              </div>
              <p style="color:var(--td-text-secondary); font-size:0.88rem; margin:0; line-height:1.5;">
                ${esc(exp.limitations)}
              </p>
            </div>
          ` : ""}

          <!-- Authoritative Sources -->
          <div style="font-size:0.82rem; color:var(--td-text-muted); border-top:1px solid var(--td-border); padding-top:1.25rem; margin-top:2rem;">
            <strong>Data Sources &amp; Verification Citations:</strong><br>
            ${(exp.sources || ["Direct laboratory measurements"]).map(s => esc(s)).join(" • ")}
          </div>
        </div>
      </article>

      <!-- ========================================================
           COMMUNITY TEST RESULTS SECTION (STRUCTURALLY SEPARATED)
           ======================================================== -->
      <section style="margin-top:2.5rem; margin-bottom:2.5rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:2rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem; border-bottom:1px solid var(--td-border-subtle); padding-bottom:1rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
              <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; padding:0.2rem 0.5rem; border-radius:0.25rem; background:rgba(96,165,250,0.15); color:var(--td-info); border:1px solid var(--td-info);">
                Community Replications
              </span>
              <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; padding:0.2rem 0.5rem; border-radius:0.25rem; background:rgba(16,185,129,0.15); color:var(--td-success); border:1px solid var(--td-success);">
                Peer Audited
              </span>
            </div>
            <h2 style="color:var(--td-text-primary); font-size:1.4rem; font-weight:700; margin:0 0 0.25rem;">
              Verified Community Test Results (${communitySubmissions.length})
            </h2>
            <p style="color:var(--td-text-secondary); font-size:0.88rem; margin:0; line-height:1.5;">
              Independent replication submissions submitted against this official protocol and verified by WDIII peer reviewers.
            </p>
          </div>

          <a href="#/submit?experiment=${encodeURIComponent(exp.id)}" style="display:inline-flex; align-items:center; gap:0.375rem; padding:0.5rem 1rem; border-radius:0.375rem; background:var(--td-info); color:#fff; font-weight:600; font-size:0.85rem; text-decoration:none; white-space:nowrap;">
            <span>+ Submit Replication Test</span>
          </a>
        </div>

        ${!communitySubmissions.length ? `
          <div style="background:var(--td-bg-card); border:1px dashed var(--td-border-subtle); border-radius:0.5rem; padding:2rem; text-align:center;">
            <div style="font-size:2rem; margin-bottom:0.5rem;">🧪</div>
            <div style="font-weight:600; color:var(--td-text-primary); margin-bottom:0.25rem;">No Community Replications Yet</div>
            <p style="color:var(--td-text-secondary); font-size:0.88rem; max-width:480px; margin:0 auto 1.25rem; line-height:1.5;">
              Be the first community researcher to run this protocol on your personal hardware and submit your measurements.
            </p>
            <a href="#/submit?experiment=${encodeURIComponent(exp.id)}" style="display:inline-block; padding:0.45rem 1.1rem; background:var(--td-info); color:#fff; font-weight:600; font-size:0.85rem; border-radius:0.375rem; text-decoration:none;">
              Submit Empirical Data
            </a>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:1.25rem;">
            ${communitySubmissions.map(sub => {
              const cond = sub.conditions || {};
              const condKeys = Object.keys(cond);
              const meas = sub.measurements || {};
              const measEntries = Object.entries(meas);
              const ev = sub.evidenceReferences || [];

              return `
                <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem; border-bottom:1px solid var(--td-border-subtle); padding-bottom:0.5rem;">
                    <div>
                      <span style="font-size:0.75rem; font-weight:700; color:var(--td-success); background:rgba(16,185,129,0.12); padding:0.15rem 0.45rem; border-radius:0.25rem; border:1px solid var(--td-success);">
                        ✓ Peer Verified
                      </span>
                      <strong style="color:var(--td-text-primary); font-size:0.95rem; margin-left:0.5rem;">
                        ${esc(sub.deviceBrand || "")} ${esc(sub.deviceModel || sub.deviceId)}
                      </strong>
                    </div>
                    <div style="font-size:0.8rem; color:var(--td-text-muted);">
                      Tested: <strong style="color:var(--td-text-secondary);">${esc(sub.testDate || "N/A")}</strong>
                    </div>
                  </div>

                  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem; margin-bottom:0.75rem; font-size:0.85rem;">
                    <div>
                      <span style="color:var(--td-text-muted);">Submitter:</span>
                      <strong style="color:var(--td-text-primary); margin-left:0.25rem;">${esc(sub.submitterName || "Community Member")}</strong>
                    </div>
                    <div>
                      <span style="color:var(--td-text-muted);">OS / Build:</span>
                      <strong style="color:var(--td-text-primary); margin-left:0.25rem;">${esc(sub.softwareVersion || "Standard")}</strong>
                    </div>
                  </div>

                  <!-- Measurements Summary -->
                  ${measEntries.length ? `
                    <div style="background:var(--td-bg-surface); border-radius:0.375rem; padding:0.75rem; margin-bottom:0.75rem;">
                      <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--td-text-muted); margin-bottom:0.35rem;">
                        Measured Results:
                      </div>
                      <div style="display:flex; flex-wrap:wrap; gap:1rem; font-size:0.85rem;">
                        ${measEntries.map(([k, m]) => {
                          const val = typeof m === "object" && m !== null ? m.value : m;
                          const unit = typeof m === "object" && m !== null ? m.unit : "";
                          return `<div><span style="color:var(--td-text-secondary);">${esc(k)}:</span> <strong style="color:var(--td-text-primary); font-family:monospace;">${esc(String(val))} ${esc(unit)}</strong></div>`;
                        }).join("")}
                      </div>
                    </div>
                  ` : ""}

                  <!-- Evidence links -->
                  ${ev.length ? `
                    <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; font-size:0.8rem;">
                      <span style="color:var(--td-text-muted);">Evidence:</span>
                      ${ev.map(e => `<a href="${esc(e.url)}" target="_blank" rel="noopener" style="color:var(--td-info); text-decoration:none;">📎 ${esc(e.name || e.fileName)} ↗</a>`).join(" • ")}
                    </div>
                  ` : ""}
                </div>
              `;
            }).join("")}
          </div>
        `}
      </section>

      <!-- Bottom Quick Navigation -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; padding:1rem 0;">
        <a href="#/" style="color:var(--td-info); font-size:0.9rem; font-weight:600; text-decoration:none;">
          ← Back to Vault Index
        </a>
        <a href="#/devices" style="color:var(--td-info); font-size:0.9rem; font-weight:600; text-decoration:none;">
          Browse Hardware Registry →
        </a>
      </div>
    </div>
  `;
}
