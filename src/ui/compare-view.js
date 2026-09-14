/**
 * WDIII Tech Vault - Device Comparison View (#/compare)
 * 
 * Side-by-side empirical hardware specification and community benchmark comparison.
 * - Allows comparing 2 to 3 devices simultaneously
 * - Difference highlighting toggle across technical specifications
 * - Cross-reference to official WDIII experiment dossiers and shared testing protocols
 * - Side-by-side community benchmark testing submissions and telemetry
 * - Deep-linkable via URL query parameters (#/compare?devices=id1,id2,id3)
 */

import { getDevices, getDeviceById, getApprovedSubmissionsForDevice } from "../services/database.js";
import { computeDeviceCommunityStats, formatMetricValue } from "../services/device-stats.js";
import { escapeHtml } from "../utils/sanitize.js";

function esc(val) {
  if (val === null || val === undefined) return "";
  return escapeHtml(String(val));
}

function formatSpec(val) {
  if (val === null || val === undefined || val === "" || val === "null") {
    return `<span style="color:var(--td-text-muted); font-style:italic; font-size:0.85rem;">—</span>`;
  }
  return `<span style="color:var(--td-text-primary); font-size:0.9rem; font-weight:500;">${esc(val)}</span>`;
}

// Curated comparison presets for rapid exploration
const PRESETS = [
  {
    id: "flagship-shootout",
    title: "Flagship Shootout (2025–2026)",
    description: "iPhone 17 Pro Max vs Galaxy S26 Ultra vs Pixel 10 Pro",
    devices: ["apple-iphone-17-pro-max", "samsung-galaxy-s26-ultra", "google-pixel-10-pro"],
    badge: "Most Popular"
  },
  {
    id: "pixel-tensor-evolution",
    title: "Google Tensor Pro Evolution",
    description: "Pixel 8 Pro (Tensor G3) vs Pixel 9 Pro (G4) vs Pixel 10 Pro (TSMC G5)",
    devices: ["google-pixel-8-pro", "google-pixel-9-pro", "google-pixel-10-pro"],
    badge: "Architectural"
  },
  {
    id: "laptop-silicon",
    title: "Apple Silicon Pro Workhorses",
    description: "MacBook Pro 16\" (M4 Max) vs MacBook Pro 14\" (M3 Max)",
    devices: ["apple-macbook-pro-16-m4-max", "apple-macbook-pro-14-m3-max"],
    badge: "Pro Compute"
  },
  {
    id: "baseline-generations",
    title: "iPhone Generation Leaps",
    description: "iPhone 13 vs iPhone 15 Pro Max vs iPhone 17 Pro Max",
    devices: ["apple-iphone-13", "apple-iphone-15-pro-max", "apple-iphone-17-pro-max"],
    badge: "Generational"
  }
];

// Specification definition matrix
const SPEC_SECTIONS = [
  {
    title: "Overview & Identity",
    icon: "📋",
    specs: [
      { key: "brand", label: "Manufacturer Brand", extract: d => d.brand },
      { key: "model", label: "Model Designation", extract: d => d.model },
      { key: "category", label: "Hardware Category", extract: d => d.category ? d.category.toUpperCase() : null },
      { key: "releaseYear", label: "Release Year", extract: d => d.releaseYear },
      { key: "operatingSystem", label: "Shipped Operating System", extract: d => d.operatingSystem },
      { key: "origin", label: "Data Origin", extract: d => d.origin === "official_wdiii" ? "Official WDIII Vault" : "Community Registry" }
    ]
  },
  {
    title: "Compute & Silicon Architecture",
    icon: "⚡",
    specs: [
      { key: "processor", label: "SoC / Processor", extract: d => d.specifications?.processor },
      { key: "ram", label: "System Memory (RAM)", extract: d => d.specifications?.ram },
      { key: "storage", label: "Internal Storage Tiers", extract: d => d.specifications?.storage }
    ]
  },
  {
    title: "Display & Chassis",
    icon: "🖥️",
    specs: [
      { key: "display", label: "Display Technology & Size", extract: d => d.specifications?.display },
      { key: "resolution", label: "Panel Resolution", extract: d => d.specifications?.resolution },
      { key: "refreshRate", label: "Refresh Rate / Motion", extract: d => d.specifications?.refreshRate },
      { key: "weight", label: "Physical Weight", extract: d => d.specifications?.weight }
    ]
  },
  {
    title: "Battery & Thermal",
    icon: "🔋",
    specs: [
      { key: "batteryCapacity", label: "Battery Capacity", extract: d => d.specifications?.batteryCapacity },
      { key: "charging", label: "Charging Standards", extract: d => d.specifications?.charging }
    ]
  },
  {
    title: "Camera & Connectivity",
    icon: "📷",
    specs: [
      { key: "cameras", label: "Camera Array & Sensors", extract: d => d.specifications?.cameras },
      { key: "connectivity", label: "Wireless & Port Standards", extract: d => d.specifications?.connectivity }
    ]
  }
];

/**
 * Main View Entry Point
 */
export async function renderCompareView(container) {
  if (!container) return;

  // Read initial device IDs from URL hash
  const initialIds = getDeviceIdsFromHash();

  container.innerHTML = `
    <div style="text-align:center; padding:3rem 1rem 2rem;">
      <div style="display:inline-block; font-size:1.75rem; margin-bottom:0.5rem;">⚖️</div>
      <h1 style="color:#fff; font-size:clamp(1.6rem, 3.5vw + 0.5rem, 2.3rem); font-weight:700; margin:0 0 0.5rem;">
        Hardware Specification &amp; Benchmark Shootout
      </h1>
      <p style="color:var(--td-text-secondary); max-width:680px; margin:0 auto; font-size:1rem; line-height:1.6;">
        Side-by-side technical evaluation and empirical community benchmark data for up to three consumer devices.
      </p>
    </div>

    <!-- Main Comparison Applet Card -->
    <div style="max-width:1160px; margin:0 auto; padding:0 1rem 3rem;">
      
      <!-- Device Selector Toolbar Card -->
      <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.5rem; margin-bottom:1.75rem; box-shadow:0 4px 16px rgba(0,0,0,0.15);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.25rem;">
          <div>
            <h2 style="color:var(--td-text-primary); font-size:1.1rem; font-weight:700; margin:0 0 0.25rem;">Select Devices to Compare</h2>
            <div style="font-size:0.82rem; color:var(--td-text-muted);">Choose 2 or 3 devices from the 34-device authoritative registry</div>
          </div>
          <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
            <label style="display:inline-flex; align-items:center; gap:0.4rem; font-size:0.85rem; color:var(--td-text-secondary); cursor:pointer; user-select:none; background:var(--td-bg-card); padding:0.4rem 0.75rem; border-radius:0.375rem; border:1px solid var(--td-border-subtle);">
              <input type="checkbox" id="chkHighlightDiffs" checked style="accent-color:var(--td-info); cursor:pointer;" />
              <span>Highlight Differences</span>
            </label>
            <button id="btnShareComparison" type="button" style="display:inline-flex; align-items:center; gap:0.4rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-secondary); padding:0.4rem 0.75rem; border-radius:0.375rem; font-size:0.85rem; cursor:pointer;">
              <span>🔗</span> <span>Share Comparison</span>
            </button>
            <button id="btnClearComparison" type="button" style="display:inline-flex; align-items:center; gap:0.4rem; background:transparent; border:1px solid var(--td-border-subtle); color:var(--td-error, #f87171); padding:0.4rem 0.75rem; border-radius:0.375rem; font-size:0.85rem; cursor:pointer;">
              <span>✕</span> <span>Clear All</span>
            </button>
          </div>
        </div>

        <!-- 3 Device Picker Slots -->
        <div id="deviceSlotsContainer" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1rem;">
          <div style="text-align:center; padding:1rem; color:var(--td-text-muted); font-size:0.9rem;">Loading hardware registry...</div>
        </div>
      </div>

      <!-- Comparison Content Mount Point -->
      <div id="comparisonMountPoint"></div>

      <!-- Quick Curated Presets Section -->
      <div style="margin-top:2.5rem; background:var(--td-bg-card); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.1rem;">⚡</span>
            <h3 style="color:var(--td-text-primary); font-size:1rem; font-weight:700; margin:0;">Curated Technical Presets</h3>
          </div>
          <span style="font-size:0.75rem; color:var(--td-text-muted); text-transform:uppercase; letter-spacing:0.04em;">1-Click Instant Comparison</span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:1rem;">
          ${PRESETS.map(preset => `
            <div class="preset-card" data-preset-id="${preset.id}" style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem; cursor:pointer; transition:border-color 0.15s, transform 0.15s;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.4rem;">
                <h4 style="font-size:0.92rem; font-weight:700; color:var(--td-info); margin:0;">${esc(preset.title)}</h4>
                <span style="font-size:0.68rem; font-weight:700; text-transform:uppercase; padding:0.1rem 0.35rem; border-radius:0.25rem; background:var(--td-info-bg); color:var(--td-info); border:1px solid rgba(96,165,250,0.3);">${esc(preset.badge)}</span>
              </div>
              <p style="font-size:0.8rem; color:var(--td-text-secondary); margin:0 0 0.75rem; line-height:1.4;">${esc(preset.description)}</p>
              <div style="display:flex; align-items:center; justify-content:space-between; font-size:0.78rem; color:var(--td-text-muted);">
                <span>${preset.devices.length} Devices</span>
                <span style="color:var(--td-info); font-weight:600;">Load Preset →</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

    </div>
  `;

  // Fetch all devices from database service
  let allDevices = [];
  try {
    allDevices = await getDevices({ sortBy: "brand", sortOrder: "asc" });
  } catch (err) {
    console.error("Failed to load devices for comparison view:", err);
  }

  // Active state
  let selectedIds = initialIds.length >= 1 ? initialIds.slice(0, 3) : ["apple-iphone-17-pro-max", "samsung-galaxy-s26-ultra"];
  let highlightDiffs = true;

  // Wire controls
  const chkHighlight = container.querySelector("#chkHighlightDiffs");
  const btnShare = container.querySelector("#btnShareComparison");
  const btnClear = container.querySelector("#btnClearComparison");

  if (chkHighlight) {
    chkHighlight.addEventListener("change", (e) => {
      highlightDiffs = e.target.checked;
      renderComparisonTable();
    });
  }

  if (btnShare) {
    btnShare.addEventListener("click", () => {
      const url = `${window.location.origin}${window.location.pathname}#/compare?devices=${selectedIds.join(",")}`;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
          showToast("Comparison link copied to clipboard!");
        }).catch(() => {
          prompt("Copy this comparison link:", url);
        });
      } else {
        prompt("Copy this comparison link:", url);
      }
    });
  }

  if (btnClear) {
    btnClear.addEventListener("click", () => {
      selectedIds = [];
      syncUrlHash();
      renderSlots();
      renderComparisonTable();
    });
  }

  // Preset click handlers
  container.querySelectorAll(".preset-card").forEach(card => {
    card.addEventListener("click", () => {
      const presetId = card.getAttribute("data-preset-id");
      const preset = PRESETS.find(p => p.id === presetId);
      if (preset) {
        selectedIds = [...preset.devices];
        syncUrlHash();
        renderSlots();
        renderComparisonTable();
      }
    });
  });

  function syncUrlHash() {
    if (selectedIds.length > 0) {
      window.location.hash = `#/compare?devices=${selectedIds.join(",")}`;
    } else {
      window.location.hash = `#/compare`;
    }
  }

  function renderSlots() {
    const slotsEl = container.querySelector("#deviceSlotsContainer");
    if (!slotsEl) return;

    const slotsHtml = [0, 1, 2].map(slotIdx => {
      const currentId = selectedIds[slotIdx] || "";
      const isOptional = slotIdx === 2;
      const label = `Device ${slotIdx + 1}${isOptional ? ' (Optional)' : ''}`;

      return `
        <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:0.875rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:${currentId ? 'var(--td-info)' : 'var(--td-text-muted)'};">
              ${label}
            </span>
            ${currentId ? `
              <button type="button" class="btn-slot-clear" data-slot="${slotIdx}" style="background:none; border:none; color:var(--td-text-muted); cursor:pointer; font-size:0.8rem;" title="Remove this device">
                ✕ Remove
              </button>
            ` : ""}
          </div>
          <select class="slot-select" data-slot="${slotIdx}" style="width:100%; padding:0.55rem 0.75rem; border-radius:0.375rem; border:1px solid var(--td-border); background:var(--td-bg-surface); color:var(--td-text-primary); font-size:0.88rem; outline:none; cursor:pointer;">
            <option value="">${isOptional ? "-- Add a 3rd device --" : "-- Select a device --"}</option>
            ${allDevices.map(d => `
              <option value="${d.id}" ${d.id === currentId ? 'selected' : ''}>
                ${esc(d.brand)} ${esc(d.model)} (${d.releaseYear || 'N/A'})
              </option>
            `).join("")}
          </select>
        </div>
      `;
    }).join("");

    slotsEl.innerHTML = slotsHtml;

    // Attach listeners to select dropdowns
    slotsEl.querySelectorAll(".slot-select").forEach(sel => {
      sel.addEventListener("change", (e) => {
        const slotIdx = parseInt(e.target.getAttribute("data-slot"), 10);
        const newId = e.target.value;
        if (newId) {
          selectedIds[slotIdx] = newId;
        } else {
          selectedIds.splice(slotIdx, 1);
        }
        // Filter out blanks and duplicates
        selectedIds = selectedIds.filter((id, i, arr) => id && arr.indexOf(id) === i);
        syncUrlHash();
        renderSlots();
        renderComparisonTable();
      });
    });

    // Attach listeners to clear buttons
    slotsEl.querySelectorAll(".btn-slot-clear").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const slotIdx = parseInt(btn.getAttribute("data-slot"), 10);
        selectedIds.splice(slotIdx, 1);
        syncUrlHash();
        renderSlots();
        renderComparisonTable();
      });
    });
  }

  async function renderComparisonTable() {
    const mount = container.querySelector("#comparisonMountPoint");
    if (!mount) return;

    if (selectedIds.length < 2) {
      mount.innerHTML = `
        <div style="background:var(--td-bg-surface-elevated); border:1px dashed var(--td-border); border-radius:0.75rem; padding:3.5rem 2rem; text-align:center;">
          <div style="font-size:2.5rem; margin-bottom:1rem;">⚖️</div>
          <h3 style="color:var(--td-text-primary); font-size:1.25rem; font-weight:700; margin-bottom:0.5rem;">Select At Least 2 Devices to Compare</h3>
          <p style="color:var(--td-text-secondary); max-width:520px; margin:0 auto 1.5rem; font-size:0.95rem; line-height:1.5;">
            Pick two or three hardware profiles from the selectors above, or click one of the curated presets below to immediately evaluate empirical specifications side-by-side.
          </p>
          <div style="display:inline-flex; gap:0.75rem; flex-wrap:wrap; justify-content:center;">
            <button type="button" id="btnQuickLoadDefault" style="padding:0.6rem 1.25rem; border-radius:0.375rem; background:var(--td-info); color:#fff; border:none; font-weight:600; font-size:0.9rem; cursor:pointer;">
              Load Flagship Shootout
            </button>
            <a href="#/devices" style="padding:0.6rem 1.25rem; border-radius:0.375rem; background:var(--td-bg-card); color:var(--td-text-secondary); border:1px solid var(--td-border-subtle); text-decoration:none; font-weight:600; font-size:0.9rem;">
              Browse Hardware Registry →
            </a>
          </div>
        </div>
      `;
      mount.querySelector("#btnQuickLoadDefault")?.addEventListener("click", () => {
        selectedIds = ["apple-iphone-17-pro-max", "samsung-galaxy-s26-ultra", "google-pixel-10-pro"];
        syncUrlHash();
        renderSlots();
        renderComparisonTable();
      });
      return;
    }

    mount.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--td-text-muted);">Compiling side-by-side technical dossiers and community metrics...</div>`;

    // Fetch device details and community submissions in parallel
    const devicesData = await Promise.all(selectedIds.map(async id => {
      const dev = await getDeviceById(id);
      let submissions = [];
      try {
        submissions = await getApprovedSubmissionsForDevice(id);
      } catch (err) {
        console.warn(`Could not load submissions for device ${id}:`, err);
      }
      return { device: dev, submissions };
    }));

    const validDevices = devicesData.filter(item => item.device !== null);

    if (validDevices.length < 2) {
      mount.innerHTML = `
        <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-error, #f87171); border-radius:0.75rem; padding:2rem; text-align:center; color:var(--td-text-secondary);">
          <p style="margin:0 0 1rem; color:var(--td-error, #f87171); font-weight:600;">One or more selected devices could not be located in the vault database.</p>
          <button type="button" id="btnResetValid" style="padding:0.5rem 1rem; border-radius:0.375rem; background:var(--td-info); color:#fff; border:none; cursor:pointer;">Reset Selection</button>
        </div>
      `;
      mount.querySelector("#btnResetValid")?.addEventListener("click", () => {
        selectedIds = ["apple-iphone-17-pro-max", "samsung-galaxy-s26-ultra"];
        syncUrlHash();
        renderSlots();
        renderComparisonTable();
      });
      return;
    }

    // Render Side-by-side comparison tables
    let html = `
      <!-- Device Dossier Header Cards Row -->
      <div style="overflow-x:auto; margin-bottom:2rem;" class="td-scrollbar">
        <table style="width:100%; border-collapse:separate; border-spacing:0; min-width:${validDevices.length * 280 + 180}px;">
          <thead>
            <tr>
              <th style="width:200px; padding:1rem; text-align:left; vertical-align:bottom; border-bottom:2px solid var(--td-border); color:var(--td-text-muted); font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em;">
                Hardware Unit
              </th>
              ${validDevices.map(({ device, submissions }) => `
                <th style="padding:1.25rem 1rem; text-align:left; vertical-align:top; border-bottom:2px solid var(--td-border); background:var(--td-bg-surface-elevated); border-left:1px solid var(--td-border-subtle);">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                    <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-info);">
                      ${esc(device.brand)}
                    </span>
                    ${device.releaseYear ? `
                      <span style="font-size:0.72rem; font-family:monospace; padding:0.1rem 0.4rem; border-radius:0.25rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-secondary);">
                        ${device.releaseYear}
                      </span>
                    ` : ""}
                  </div>
                  <h3 style="font-size:1.15rem; font-weight:700; color:#fff; margin:0 0 0.5rem; line-height:1.3;">
                    ${esc(device.model)}
                  </h3>
                  <div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-bottom:0.75rem;">
                    <span style="font-size:0.72rem; padding:0.15rem 0.45rem; border-radius:0.25rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-secondary);">
                      ${esc(device.category || "Hardware")}
                    </span>
                    ${device.operatingSystem ? `
                      <span style="font-size:0.72rem; padding:0.15rem 0.45rem; border-radius:0.25rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-muted);">
                        ${esc(device.operatingSystem)}
                      </span>
                    ` : ""}
                  </div>
                  <div style="display:flex; gap:0.5rem;">
                    <a href="#/devices/${device.id}" style="display:inline-flex; align-items:center; gap:0.3rem; font-size:0.78rem; font-weight:600; color:var(--td-info); text-decoration:none; padding:0.3rem 0.6rem; border-radius:0.25rem; background:var(--td-info-bg); border:1px solid rgba(96,165,250,0.25);">
                      <span>Dossier</span> <span>→</span>
                    </a>
                    <a href="#/submit?deviceId=${device.id}" style="display:inline-flex; align-items:center; gap:0.3rem; font-size:0.78rem; font-weight:600; color:var(--td-text-secondary); text-decoration:none; padding:0.3rem 0.6rem; border-radius:0.25rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle);">
                      <span>+ Submit Test</span>
                    </a>
                  </div>
                </th>
              `).join("")}
            </tr>
          </thead>
        </table>
      </div>

      <!-- Specifications Comparison Sections -->
      <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; overflow:hidden; margin-bottom:2rem; box-shadow:0 4px 16px rgba(0,0,0,0.12);">
        <div style="padding:1rem 1.5rem; background:var(--td-bg-card); border-bottom:1px solid var(--td-border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <h3 style="font-size:1rem; font-weight:700; color:var(--td-text-primary); margin:0;">Technical Specification Matrix</h3>
          <span style="font-size:0.75rem; color:var(--td-text-muted);">Side-by-side technical parameters from official archive</span>
        </div>

        <div style="overflow-x:auto;" class="td-scrollbar">
          <table style="width:100%; border-collapse:collapse; font-size:0.9rem; min-width:${validDevices.length * 280 + 180}px;">
            ${SPEC_SECTIONS.map(section => `
              <!-- Section Header -->
              <thead>
                <tr style="background:rgba(255,255,255,0.02); border-top:1px solid var(--td-border-subtle); border-bottom:1px solid var(--td-border-subtle);">
                  <th colspan="${validDevices.length + 1}" style="padding:0.75rem 1.25rem; text-align:left; color:var(--td-text-primary); font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">
                    <span style="margin-right:0.4rem;">${section.icon}</span> ${esc(section.title)}
                  </th>
                </tr>
              </thead>
              <tbody>
                ${section.specs.map(spec => {
                  const values = validDevices.map(d => spec.extract(d.device));
                  const isDiffering = checkValuesDiffer(values);
                  const rowHighlight = highlightDiffs && isDiffering ? 'background:rgba(96,165,250,0.05);' : '';

                  return `
                    <tr style="${rowHighlight} border-bottom:1px solid var(--td-border-subtle); transition:background 0.1s;">
                      <th scope="row" style="width:200px; padding:0.75rem 1.25rem; text-align:left; color:var(--td-text-secondary); font-size:0.85rem; font-weight:600; vertical-align:top; border-right:1px solid var(--td-border-subtle);">
                        <div style="display:flex; align-items:center; gap:0.35rem;">
                          ${highlightDiffs && isDiffering ? `<span style="width:6px; height:6px; border-radius:50%; background:var(--td-info); display:inline-block;" title="Difference detected"></span>` : ""}
                          <span>${esc(spec.label)}</span>
                        </div>
                      </th>
                      ${values.map((val, vi) => `
                        <td style="padding:0.75rem 1.25rem; text-align:left; vertical-align:top; border-right:1px solid var(--td-border-subtle); ${highlightDiffs && isDiffering ? 'font-weight:600;' : ''}">
                          ${formatSpec(val)}
                        </td>
                      `).join("")}
                    </tr>
                  `;
                }).join("")}
              </tbody>
            `).join("")}
          </table>
        </div>
      </div>

      <!-- Empirical Vault Footprint: Official Experiments Cross-Reference -->
      <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; overflow:hidden; margin-bottom:2rem; box-shadow:0 4px 16px rgba(0,0,0,0.12);">
        <div style="padding:1rem 1.5rem; background:var(--td-bg-card); border-bottom:1px solid var(--td-border);">
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <span style="font-size:1.1rem;">⚡</span>
            <h3 style="font-size:1rem; font-weight:700; color:var(--td-text-primary); margin:0;">Official WDIII Experiment Footprints</h3>
          </div>
          <p style="font-size:0.8rem; color:var(--td-text-muted); margin:0;">Authoritative tests and case studies linking these devices</p>
        </div>

        <div style="overflow-x:auto; padding:1.25rem;" class="td-scrollbar">
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem;">
            ${validDevices.map(({ device }) => {
              const exps = device.experimentsInvolved || [];
              return `
                <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem;">
                  <div style="font-size:0.85rem; font-weight:700; color:#fff; margin-bottom:0.5rem;">
                    ${esc(device.model)}
                  </div>
                  <div style="font-size:0.8rem; color:var(--td-text-muted); margin-bottom:0.75rem;">
                    Documented in <strong>${exps.length}</strong> official research dossier${exps.length === 1 ? '' : 's'}:
                  </div>
                  ${exps.length > 0 ? `
                    <div style="display:flex; flex-direction:column; gap:0.5rem;">
                      ${exps.map(expId => `
                        <a href="#/experiments/${expId}" style="display:flex; align-items:center; justify-content:space-between; padding:0.4rem 0.6rem; border-radius:0.375rem; background:var(--td-bg-surface); border:1px solid var(--td-border-subtle); text-decoration:none; color:var(--td-text-primary); font-size:0.82rem; transition:border-color 0.15s;">
                          <span style="font-family:monospace; color:var(--td-info); font-weight:700;">${expId.toUpperCase()}</span>
                          <span style="color:var(--td-text-muted); font-size:0.75rem;">View Protocol →</span>
                        </a>
                      `).join("")}
                    </div>
                  ` : `
                    <div style="font-size:0.8rem; color:var(--td-text-muted); font-style:italic; padding:0.5rem; background:var(--td-bg-surface); border-radius:0.375rem; border:1px dashed var(--td-border-subtle);">
                      Baseline hardware registry item — no official WDIII experiment dossiers logged yet.
                    </div>
                  `}
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>

      <!-- Community Benchmark & Empirical Testing Submissions -->
      <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; overflow:hidden; margin-bottom:2rem; box-shadow:0 4px 16px rgba(0,0,0,0.12);">
        <div style="padding:1rem 1.5rem; background:var(--td-bg-card); border-bottom:1px solid var(--td-border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
              <span style="font-size:1.1rem;">🧪</span>
              <h3 style="font-size:1rem; font-weight:700; color:var(--td-text-primary); margin:0;">Community Empirical Benchmark Submissions</h3>
            </div>
            <p style="font-size:0.8rem; color:var(--td-text-muted); margin:0;">Verified peer-reviewed test data submitted by WDIII contributors</p>
          </div>
          <a href="#/submit" style="display:inline-flex; align-items:center; gap:0.35rem; padding:0.4rem 0.8rem; border-radius:0.375rem; background:var(--td-info); color:#fff; font-size:0.82rem; font-weight:600; text-decoration:none;">
            <span>+ Submit Benchmark</span>
          </a>
        </div>

        <div style="overflow-x:auto; padding:1.25rem;" class="td-scrollbar">
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem;">
            ${validDevices.map(({ device, submissions }) => {
              const approvedSubs = submissions || [];
              const stats = computeDeviceCommunityStats(approvedSubs, device.id);
              return `
                <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem; display:flex; flex-direction:column; justify-content:space-between;">
                  <div>
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
                      <h4 style="font-size:0.9rem; font-weight:700; color:#fff; margin:0;">${esc(device.model)}</h4>
                      <span style="font-size:0.72rem; font-weight:700; padding:0.15rem 0.45rem; border-radius:0.25rem; background:${stats.sampleSize > 0 ? 'rgba(52, 211, 153, 0.15)' : 'var(--td-bg-surface)'}; color:${stats.sampleSize > 0 ? 'var(--td-success)' : 'var(--td-text-muted)'}; border:1px solid ${stats.sampleSize > 0 ? 'rgba(52, 211, 153, 0.3)' : 'var(--td-border-subtle)'};">
                        ${stats.sampleSize} Verified (n)
                      </span>
                    </div>

                    ${stats.sampleSize > 0 ? `
                      <!-- Statistical Summary Highlights -->
                      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-bottom:0.75rem; background:var(--td-bg-surface); padding:0.6rem; border-radius:0.375rem; border:1px solid var(--td-border-subtle);">
                        ${stats.metrics.screenOnTimeMinutes ? `
                          <div>
                            <div style="font-size:0.68rem; color:var(--td-text-muted); text-transform:uppercase;">Mean SOT</div>
                            <div style="font-size:0.85rem; font-weight:700; color:var(--td-info);">${formatMetricValue(stats.metrics.screenOnTimeMinutes, "mean")}</div>
                          </div>
                        ` : ""}
                        ${stats.metrics.repairCost ? `
                          <div>
                            <div style="font-size:0.68rem; color:var(--td-text-muted); text-transform:uppercase;">Mean Repair</div>
                            <div style="font-size:0.85rem; font-weight:700; color:#f59e0b;">${formatMetricValue(stats.metrics.repairCost, "mean")}</div>
                          </div>
                        ` : ""}
                        ${stats.metrics.qualityRating ? `
                          <div>
                            <div style="font-size:0.68rem; color:var(--td-text-muted); text-transform:uppercase;">Post-Repair Quality</div>
                            <div style="font-size:0.85rem; font-weight:700; color:var(--td-text-primary);">${formatMetricValue(stats.metrics.qualityRating, "mean")}</div>
                          </div>
                        ` : ""}
                        ${stats.metrics.chargeTimeMinutes ? `
                          <div>
                            <div style="font-size:0.68rem; color:var(--td-text-muted); text-transform:uppercase;">Charge Time</div>
                            <div style="font-size:0.85rem; font-weight:700; color:var(--td-text-primary);">${formatMetricValue(stats.metrics.chargeTimeMinutes, "mean")}</div>
                          </div>
                        ` : ""}
                      </div>

                      <div style="margin-bottom:1rem;">
                        <div style="font-size:0.78rem; color:var(--td-text-muted); margin-bottom:0.5rem;">Recent Verified Test Logs:</div>
                        <div style="display:flex; flex-direction:column; gap:0.5rem;">
                          ${approvedSubs.slice(0, 3).map(sub => {
                            const meas = sub.measurements || {};
                            const measKeys = Object.keys(meas);
                            return `
                              <div style="padding:0.6rem; border-radius:0.375rem; background:var(--td-bg-surface); border:1px solid var(--td-border-subtle); font-size:0.8rem;">
                                <div style="display:flex; justify-content:space-between; color:var(--td-text-muted); font-size:0.72rem; margin-bottom:0.25rem;">
                                  <span>OS Build: ${esc(sub.softwareVersion || 'Default')}</span>
                                  <span>${sub.testDate ? esc(sub.testDate) : 'Verified'}</span>
                                </div>
                                ${measKeys.length > 0 ? `
                                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.25rem; margin-top:0.35rem;">
                                    ${measKeys.slice(0, 4).map(k => `
                                      <div style="font-size:0.72rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                                        <span style="color:var(--td-text-muted);">${esc(k)}:</span> 
                                        <strong style="color:var(--td-text-primary);">${esc(meas[k])}</strong>
                                      </div>
                                    `).join("")}
                                  </div>
                                ` : ""}
                              </div>
                            `;
                          }).join("")}
                        </div>
                      </div>
                    ` : `
                      <div style="padding:1.25rem 1rem; text-align:center; background:var(--td-bg-surface); border-radius:0.375rem; border:1px dashed var(--td-border-subtle); margin-bottom:1rem;">
                        <div style="font-size:1.25rem; margin-bottom:0.35rem;">🔬</div>
                        <div style="font-size:0.82rem; color:var(--td-text-muted); margin-bottom:0.75rem;">
                          No verified community benchmark submissions logged yet for this device.
                        </div>
                        <a href="#/submit?deviceId=${device.id}" style="display:inline-block; font-size:0.78rem; font-weight:600; color:var(--td-info); text-decoration:none;">
                          Be the first to submit data →
                        </a>
                      </div>
                    `}
                  </div>

                  <a href="#/submit?deviceId=${device.id}" style="display:block; text-align:center; padding:0.45rem; border-radius:0.375rem; background:var(--td-bg-surface); border:1px solid var(--td-border-subtle); color:var(--td-text-secondary); font-size:0.78rem; font-weight:600; text-decoration:none;">
                    Contribute Telemetry for ${esc(device.model)}
                  </a>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;

    mount.innerHTML = html;
  }

  // Initial renders
  renderSlots();
  await renderComparisonTable();
}

/**
 * Utility: Checks whether a set of values contain differences (ignoring whitespace and capitalization)
 */
function checkValuesDiffer(values) {
  if (values.length <= 1) return false;
  const normalized = values.map(v => (v === null || v === undefined ? "" : String(v).trim().toLowerCase()));
  return normalized.some(v => v !== normalized[0]);
}

/**
 * Utility: Extract device IDs from URL Hash
 * Supported patterns:
 * - #/compare?devices=id1,id2,id3
 * - #/compare/id1/vs/id2
 */
function getDeviceIdsFromHash() {
  const hash = window.location.hash || "";
  if (!hash.includes("/compare")) return [];

  // Check query parameter ?devices=id1,id2
  const qIdx = hash.indexOf("?");
  if (qIdx !== -1) {
    const query = hash.slice(qIdx + 1);
    const params = new URLSearchParams(query);
    const devsParam = params.get("devices");
    if (devsParam) {
      return devsParam.split(",").map(s => s.trim()).filter(Boolean);
    }
  }

  // Check path syntax #/compare/id1/vs/id2
  const clean = hash.replace(/^#\/compare\/?/, "");
  if (clean.includes("/vs/")) {
    return clean.split("/vs/").map(s => s.trim()).filter(Boolean);
  }

  return [];
}

/**
 * Simple toast notification banner
 */
function showToast(message) {
  const existing = document.getElementById("tdComparisonToast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "tdComparisonToast";
  toast.style.cssText = `
    position:fixed;
    bottom:2rem;
    right:2rem;
    z-index:9999;
    background:var(--td-bg-surface-elevated, #18181b);
    color:var(--td-text-primary, #fff);
    border:1px solid var(--td-info, #60a5fa);
    padding:0.75rem 1.25rem;
    border-radius:0.5rem;
    font-size:0.88rem;
    font-weight:600;
    box-shadow:0 8px 24px rgba(0,0,0,0.4);
    display:flex;
    align-items:center;
    gap:0.5rem;
    animation:fadeInToast 0.2s ease;
  `;
  toast.innerHTML = `<span>✓</span> <span>${esc(message)}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}
