/**
 * WDIII Tech Vault - Device Catalog and Device Detail UI Views
 * 
 * Complies with strict WDIII design system:
 * - High-contrast dark theme with CSS custom properties
 * - Research vault & engineering catalog aesthetic (no ecommerce clichés)
 * - Transparent handling of null specifications (no fabricated data)
 * - Cross-linked to official WDIII experiment dossiers
 */

import { getDevices, getDeviceById } from "../services/database.js";
import { getDeviceCommunityStats, formatMetricValue } from "../services/device-stats.js";

function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatSpec(val) {
  if (val === null || val === undefined || val === "") {
    return `<span style="color:var(--td-text-muted); font-style:italic; font-size:0.82rem;">—</span>`;
  }
  return `<span style="color:var(--td-text-primary); font-weight:500;">${esc(val)}</span>`;
}

/**
 * Render Hardware Registry / Device Catalog Page (#/devices)
 */
export async function renderDevicesCatalog(container) {
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center; padding:3rem 1rem 2rem;">
      <div style="display:inline-block; font-size:1.75rem; margin-bottom:0.5rem;">📱</div>
      <h2 style="color:#fff; font-size:1.85rem; font-weight:700; margin:0 0 0.5rem;">Hardware Registry &amp; Device Catalog</h2>
      <p style="color:var(--td-text-secondary); max-width:680px; margin:0 auto; font-size:1rem; line-height:1.6;">
        Authoritative hardware specifications and empirical testing footprints for all consumer devices documented in the WDIII Tech Vault.
      </p>
    </div>

    <!-- Filter & Search Controls Bar -->
    <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.25rem; margin-bottom:2rem;">
      <div style="display:flex; flex-wrap:wrap; gap:1rem; align-items:center; justify-content:space-between; margin-bottom:1rem;">
        <!-- Search Input -->
        <div style="position:relative; flex:1; min-width:240px;">
          <span style="position:absolute; left:0.875rem; top:50%; transform:translateY(-50%); color:var(--td-text-muted); pointer-events:none;">🔍</span>
          <input id="deviceSearchInput" type="text" placeholder="Search devices by brand, model, processor, or OS…" 
            style="width:100%; padding:0.6rem 1rem 0.6rem 2.4rem; border-radius:0.375rem; border:1px solid var(--td-border-subtle); background:var(--td-bg-card); color:var(--td-text-primary); font-size:0.9rem; outline:none;" />
        </div>

        <!-- Sort Select -->
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <label style="font-size:0.82rem; color:var(--td-text-muted); text-transform:uppercase; letter-spacing:0.05em; font-weight:600;">Sort:</label>
          <select id="deviceSortSelect" style="padding:0.55rem 0.875rem; border-radius:0.375rem; border:1px solid var(--td-border-subtle); background:var(--td-bg-card); color:var(--td-text-primary); font-size:0.85rem; outline:none; cursor:pointer;">
            <option value="releaseYear-desc">Release Year (Newest)</option>
            <option value="releaseYear-asc">Release Year (Oldest)</option>
            <option value="brand-asc">Brand (A–Z)</option>
            <option value="model-asc">Model (A–Z)</option>
            <option value="experimentsCount-desc">Most Tested in Vault</option>
          </select>
        </div>
      </div>

      <!-- Categories & OS Filters -->
      <div style="display:flex; flex-wrap:wrap; gap:0.5rem; align-items:center;">
        <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); font-weight:700; margin-right:0.25rem;">Category:</span>
        <button class="device-filter-cat active" data-cat="all" style="padding:0.25rem 0.625rem; border-radius:9999px; font-size:0.78rem; font-weight:600; cursor:pointer; border:1px solid var(--td-info); background:var(--td-info-bg); color:var(--td-info);">All Categories</button>
        <button class="device-filter-cat" data-cat="smartphone" style="padding:0.25rem 0.625rem; border-radius:9999px; font-size:0.78rem; font-weight:600; cursor:pointer; border:1px solid var(--td-border-subtle); background:var(--td-bg-card); color:var(--td-text-secondary);">Smartphones</button>
        <button class="device-filter-cat" data-cat="laptop" style="padding:0.25rem 0.625rem; border-radius:9999px; font-size:0.78rem; font-weight:600; cursor:pointer; border:1px solid var(--td-border-subtle); background:var(--td-bg-card); color:var(--td-text-secondary);">Laptops</button>
        <button class="device-filter-cat" data-cat="wearable" style="padding:0.25rem 0.625rem; border-radius:9999px; font-size:0.78rem; font-weight:600; cursor:pointer; border:1px solid var(--td-border-subtle); background:var(--td-bg-card); color:var(--td-text-secondary);">Wearables</button>
        <button class="device-filter-cat" data-cat="accessory" style="padding:0.25rem 0.625rem; border-radius:9999px; font-size:0.78rem; font-weight:600; cursor:pointer; border:1px solid var(--td-border-subtle); background:var(--td-bg-card); color:var(--td-text-secondary);">Accessories</button>

        <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); font-weight:700; margin-left:1rem; margin-right:0.25rem;">OS:</span>
        <button class="device-filter-os active" data-os="all" style="padding:0.25rem 0.625rem; border-radius:9999px; font-size:0.78rem; font-weight:600; cursor:pointer; border:1px solid var(--td-info); background:var(--td-info-bg); color:var(--td-info);">All</button>
        <button class="device-filter-os" data-os="ios" style="padding:0.25rem 0.625rem; border-radius:9999px; font-size:0.78rem; font-weight:600; cursor:pointer; border:1px solid var(--td-border-subtle); background:var(--td-bg-card); color:var(--td-text-secondary);">iOS</button>
        <button class="device-filter-os" data-os="android" style="padding:0.25rem 0.625rem; border-radius:9999px; font-size:0.78rem; font-weight:600; cursor:pointer; border:1px solid var(--td-border-subtle); background:var(--td-bg-card); color:var(--td-text-secondary);">Android</button>
        <button class="device-filter-os" data-os="macos" style="padding:0.25rem 0.625rem; border-radius:9999px; font-size:0.78rem; font-weight:600; cursor:pointer; border:1px solid var(--td-border-subtle); background:var(--td-bg-card); color:var(--td-text-secondary);">macOS</button>
        <button class="device-filter-os" data-os="windows" style="padding:0.25rem 0.625rem; border-radius:9999px; font-size:0.78rem; font-weight:600; cursor:pointer; border:1px solid var(--td-border-subtle); background:var(--td-bg-card); color:var(--td-text-secondary);">Windows</button>
      </div>
    </div>

    <!-- Results Status Count -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; padding:0 0.25rem;">
      <span id="deviceCountLabel" style="font-size:0.875rem; color:var(--td-text-muted); font-weight:500;">Loading registry…</span>
      <span style="font-size:0.78rem; color:var(--td-text-muted); letter-spacing:0.04em;">Official WDIII Archive Verified Data</span>
    </div>

    <!-- Devices Grid Container -->
    <div id="devicesGrid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(310px, 1fr)); gap:1.25rem; margin-bottom:3rem;">
    </div>
  `;

  // State management for filters
  let currentCat = "all";
  let currentOS = "all";
  let currentSearch = "";
  let currentSort = "releaseYear";
  let currentSortOrder = "desc";

  async function updateList() {
    const grid = document.getElementById("devicesGrid");
    const countLabel = document.getElementById("deviceCountLabel");
    if (!grid) return;

    grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--td-text-muted);">Querying hardware archive…</div>`;

    const devices = await getDevices({
      search: currentSearch,
      category: currentCat,
      operatingSystem: currentOS,
      sortBy: currentSort,
      sortOrder: currentSortOrder
    });

    if (countLabel) {
      countLabel.textContent = `Showing ${devices.length} verified device${devices.length === 1 ? '' : 's'}`;
    }

    if (devices.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:4rem 2rem; background:var(--td-bg-card); border:1px dashed var(--td-border-subtle); border-radius:0.75rem;">
          <div style="font-size:2rem; margin-bottom:0.5rem;">🔍</div>
          <h3 style="color:var(--td-text-primary); font-size:1.1rem; margin:0 0 0.5rem;">No Devices Match Current Filters</h3>
          <p style="color:var(--td-text-muted); font-size:0.88rem; margin:0 0 1.25rem;">Try clearing your search query or selecting "All Categories".</p>
          <button id="btnResetDeviceFilters" style="padding:0.5rem 1rem; border-radius:0.375rem; background:var(--td-info); color:#fff; border:none; font-weight:600; font-size:0.85rem; cursor:pointer;">Reset Filters</button>
        </div>
      `;
      document.getElementById("btnResetDeviceFilters")?.addEventListener("click", () => {
        currentSearch = "";
        currentCat = "all";
        currentOS = "all";
        const sInput = document.getElementById("deviceSearchInput");
        if (sInput) sInput.value = "";
        document.querySelectorAll(".device-filter-cat").forEach(b => {
          b.classList.toggle("active", b.getAttribute("data-cat") === "all");
          applyFilterStyle(b, b.getAttribute("data-cat") === "all");
        });
        document.querySelectorAll(".device-filter-os").forEach(b => {
          b.classList.toggle("active", b.getAttribute("data-os") === "all");
          applyFilterStyle(b, b.getAttribute("data-os") === "all");
        });
        updateList();
      });
      return;
    }

    grid.innerHTML = devices.map(d => renderDeviceCard(d)).join("");
  }

  function applyFilterStyle(btn, isActive) {
    if (isActive) {
      btn.style.borderColor = "var(--td-info)";
      btn.style.background = "var(--td-info-bg)";
      btn.style.color = "var(--td-info)";
    } else {
      btn.style.borderColor = "var(--td-border-subtle)";
      btn.style.background = "var(--td-bg-card)";
      btn.style.color = "var(--td-text-secondary)";
    }
  }

  // Event bindings
  const searchInput = document.getElementById("deviceSearchInput");
  searchInput?.addEventListener("input", (e) => {
    currentSearch = e.target.value;
    updateList();
  });

  const sortSelect = document.getElementById("deviceSortSelect");
  sortSelect?.addEventListener("change", (e) => {
    const parts = e.target.value.split("-");
    currentSort = parts[0];
    currentSortOrder = parts[1] || "asc";
    updateList();
  });

  document.querySelectorAll(".device-filter-cat").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".device-filter-cat").forEach(b => {
        b.classList.remove("active");
        applyFilterStyle(b, false);
      });
      btn.classList.add("active");
      applyFilterStyle(btn, true);
      currentCat = btn.getAttribute("data-cat");
      updateList();
    });
  });

  document.querySelectorAll(".device-filter-os").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".device-filter-os").forEach(b => {
        b.classList.remove("active");
        applyFilterStyle(b, false);
      });
      btn.classList.add("active");
      applyFilterStyle(btn, true);
      currentOS = btn.getAttribute("data-os");
      updateList();
    });
  });

  // Initial load
  await updateList();
}

/**
 * Generate markup for a single Device Card in the catalog
 */
function renderDeviceCard(device) {
  const specs = device.specifications || {};
  const expCount = (device.experimentsInvolved || []).length;

  let categoryIcon = "📱";
  if (device.category === "laptop") categoryIcon = "💻";
  else if (device.category === "wearable") categoryIcon = "⌚";
  else if (device.category === "accessory") categoryIcon = "🔌";
  else if (device.category === "tablet") categoryIcon = "📋";

  return `
    <div class="td-device-card" style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.625rem; padding:1.25rem; display:flex; flex-direction:column; justify-content:space-between; transition:transform 0.15s ease, border-color 0.15s ease; box-shadow:0 4px 12px rgba(0,0,0,0.15);">
      <div>
        <!-- Card Header: Brand, Model, Release Year -->
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
          <div>
            <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.06em; color:var(--td-text-muted); font-weight:700;">${esc(device.brand)}</div>
            <h3 style="font-size:1.15rem; font-weight:700; color:#fff; margin:0.15rem 0 0.25rem;">${esc(device.model)}</h3>
          </div>
          ${device.releaseYear ? `<span style="font-size:0.75rem; font-weight:700; font-family:monospace; padding:0.15rem 0.5rem; border-radius:0.25rem; background:var(--td-border-subtle); color:var(--td-text-secondary);">${device.releaseYear}</span>` : ""}
        </div>

        <!-- Badges Row -->
        <div style="display:flex; flex-wrap:wrap; gap:0.375rem; margin-bottom:1rem;">
          <span style="font-size:0.72rem; padding:0.15rem 0.5rem; border-radius:0.25rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-secondary);">
            ${categoryIcon} ${esc(device.category)}
          </span>
          ${device.operatingSystem ? `
            <span style="font-size:0.72rem; padding:0.15rem 0.5rem; border-radius:0.25rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-muted);">
              ${esc(device.operatingSystem)}
            </span>
          ` : ""}
          <span style="font-size:0.72rem; padding:0.15rem 0.5rem; border-radius:0.25rem; background:rgba(52, 211, 153, 0.1); border:1px solid rgba(52, 211, 153, 0.25); color:var(--td-success);">
            Verified Spec
          </span>
        </div>

        <!-- Quick Spec Snapshot -->
        <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.375rem; padding:0.75rem; margin-bottom:1rem; font-size:0.82rem; display:flex; flex-direction:column; gap:0.35rem;">
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--td-text-muted);">SoC / CPU:</span>
            <span style="color:var(--td-text-primary); font-weight:500; text-align:right; max-width:65%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              ${specs.processor ? esc(specs.processor) : "—"}
            </span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--td-text-muted);">Display:</span>
            <span style="color:var(--td-text-primary); font-weight:500; text-align:right; max-width:65%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
              ${specs.displaySize ? esc(specs.displaySize) : "—"}
            </span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--td-text-muted);">Battery:</span>
            <span style="color:var(--td-text-primary); font-weight:500; text-align:right;">
              ${specs.batteryCapacity ? esc(specs.batteryCapacity) : "—"}
            </span>
          </div>
        </div>

        <!-- Empirical Vault Footprint -->
        <div style="margin-bottom:1rem;">
          ${expCount > 0 ? `
            <div style="display:flex; align-items:center; gap:0.375rem; font-size:0.78rem; font-weight:600; color:var(--td-info);">
              <span>⚡</span>
              <span>Tested in ${expCount} WDIII Experiment${expCount > 1 ? 's' : ''}</span>
            </div>
            <div style="display:flex; flex-wrap:wrap; gap:0.25rem; margin-top:0.35rem;">
              ${(device.experimentsInvolved || []).slice(0, 4).map(expId => `
                <a href="#/experiments/${expId}" style="font-size:0.7rem; font-family:monospace; text-decoration:none; padding:0.1rem 0.375rem; border-radius:0.25rem; background:var(--td-info-bg); color:var(--td-info); border:1px solid rgba(96,165,250,0.3);">
                  ${expId.toUpperCase()}
                </a>
              `).join("")}
              ${expCount > 4 ? `<span style="font-size:0.7rem; color:var(--td-text-muted); padding:0.1rem 0.25rem;">+${expCount - 4} more</span>` : ""}
            </div>
          ` : `
            <div style="display:flex; align-items:center; gap:0.375rem; font-size:0.78rem; color:var(--td-text-muted);">
              <span>📋</span>
              <span>Hardware Registry Baseline (0 logged)</span>
            </div>
          `}
        </div>
      </div>

      <!-- Action Button -->
      <a href="#/devices/${device.id}" style="display:inline-flex; align-items:center; justify-content:center; gap:0.375rem; width:100%; padding:0.55rem; border-radius:0.375rem; background:var(--td-bg-surface); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); font-size:0.85rem; font-weight:600; text-decoration:none; transition:background 0.15s, border-color 0.15s;">
        <span>View Hardware Dossier</span>
        <span>→</span>
      </a>
    </div>
  `;
}

/**
 * Render Detailed Single Device Page (#/devices/{deviceId})
 */
export async function renderDeviceDetail(container, deviceId) {
  if (!container) return;

  container.innerHTML = `<div style="text-align:center; padding:4rem 2rem; color:var(--td-text-muted);">Loading hardware specifications…</div>`;

  const device = await getDeviceById(deviceId);

  if (!device) {
    container.innerHTML = `
      <div style="max-width:640px; margin:4rem auto; text-align:center; padding:3rem 2rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem;">
        <div style="font-size:2.5rem; margin-bottom:0.75rem;">⚠️</div>
        <h2 style="color:#fff; font-size:1.4rem; font-weight:700; margin:0 0 0.5rem;">Hardware Record Not Found</h2>
        <p style="color:var(--td-text-secondary); font-size:0.95rem; margin:0 0 1.5rem; line-height:1.6;">
          Device identifier <code style="color:var(--td-info); background:var(--td-bg-card); padding:0.2rem 0.4rem; border-radius:0.25rem;">${esc(deviceId)}</code> is not registered in the authoritative WDIII database.
        </p>
        <a href="#/devices" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.6rem 1.25rem; border-radius:0.375rem; background:var(--td-info); color:#fff; font-weight:600; font-size:0.9rem; text-decoration:none;">
          ← Return to Hardware Registry
        </a>
      </div>
    `;
    return;
  }

  const stats = await getDeviceCommunityStats(device.id);
  const specs = device.specifications || {};
  const linked = device.linkedExperiments || [];

  container.innerHTML = `
    <div style="max-width:960px; margin:0 auto; padding:2rem 1rem;">
      <!-- Breadcrumb Navigation -->
      <nav style="display:flex; align-items:center; flex-wrap:wrap; gap:0.5rem; font-size:0.85rem; color:var(--td-text-muted); margin-bottom:1.5rem;">
        <a href="#/" style="color:var(--td-text-muted); text-decoration:none;">🏠 Home</a>
        <span>/</span>
        <a href="#/devices" style="color:var(--td-text-muted); text-decoration:none;">📱 Hardware Registry</a>
        <span>/</span>
        <span style="color:var(--td-text-primary); font-weight:600;">${esc(device.brand)} ${esc(device.model)}</span>
      </nav>

      <!-- Top Return Link & Action Bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:1.25rem;">
        <a href="#/devices" style="display:inline-flex; align-items:center; gap:0.375rem; color:var(--td-info); font-size:0.85rem; font-weight:600; text-decoration:none;">
          ← Back to All Devices
        </a>
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <a href="#/compare?devices=${encodeURIComponent(device.id)}" style="display:inline-flex; align-items:center; gap:0.35rem; padding:0.35rem 0.75rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-secondary); font-size:0.82rem; font-weight:600; text-decoration:none;">
            <span>⚖️</span> <span>Compare in Shootout</span>
          </a>
          <a href="#/submit?device=${encodeURIComponent(device.id)}" style="display:inline-flex; align-items:center; gap:0.35rem; padding:0.35rem 0.75rem; border-radius:0.375rem; background:var(--td-info); color:#fff; font-size:0.82rem; font-weight:600; text-decoration:none;">
            <span>🧪</span> <span>Submit Protocol Test</span>
          </a>
        </div>
      </div>

      <!-- Device Header Dossier Card -->
      <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:2rem; margin-bottom:2rem;">
        <div style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:flex-start; gap:1.5rem;">
          <div>
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
              <span style="font-size:0.8rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--td-text-muted);">${esc(device.brand)}</span>
              <span style="color:var(--td-border-subtle);">•</span>
              <span style="font-size:0.8rem; font-weight:600; color:var(--td-text-secondary); text-transform:uppercase;">${esc(device.category)}</span>
            </div>
            <h1 style="color:#fff; font-size:2rem; font-weight:700; margin:0 0 0.5rem;">${esc(device.model)}</h1>
            <div style="display:flex; flex-wrap:wrap; gap:0.5rem; align-items:center;">
              ${device.releaseYear ? `
                <span style="font-size:0.8rem; font-weight:700; font-family:monospace; padding:0.2rem 0.6rem; border-radius:0.25rem; background:var(--td-border-subtle); color:var(--td-text-primary);">
                  Released: ${device.releaseYear}
                </span>
              ` : ""}
              ${device.operatingSystem ? `
                <span style="font-size:0.8rem; padding:0.2rem 0.6rem; border-radius:0.25rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-secondary);">
                  OS: ${esc(device.operatingSystem)}
                </span>
              ` : ""}
              <span style="font-size:0.8rem; font-weight:600; padding:0.2rem 0.6rem; border-radius:0.25rem; background:rgba(52, 211, 153, 0.12); border:1px solid rgba(52, 211, 153, 0.3); color:var(--td-success);">
                ✓ Official WDIII Registry
              </span>
            </div>
          </div>

          <!-- Quick Stats Badge Box (Canonical vs Community) -->
          <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
            <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem 1.25rem; text-align:center; min-width:140px;">
              <div style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); margin-bottom:0.25rem;">Lab Experiments</div>
              <div style="font-size:1.6rem; font-weight:700; color:${linked.length > 0 ? 'var(--td-info)' : 'var(--td-text-muted)'};">${linked.length}</div>
              <div style="font-size:0.72rem; color:var(--td-text-secondary); margin-top:0.25rem;">${linked.length > 0 ? 'Canonical Tests' : 'Baseline Catalog'}</div>
            </div>

            <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem 1.25rem; text-align:center; min-width:140px;">
              <div style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); margin-bottom:0.25rem;">Community Data</div>
              <div style="font-size:1.6rem; font-weight:700; color:${stats.sampleSize > 0 ? 'var(--td-success)' : 'var(--td-text-muted)'};">${stats.sampleSize}</div>
              <div style="font-size:0.72rem; color:var(--td-text-secondary); margin-top:0.25rem;">${stats.sampleSize > 0 ? 'Verified Samples (n)' : 'Pending Data'}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Technical Specifications Section -->
      <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.75rem; margin-bottom:2rem;">
        <h3 style="color:#fff; font-size:1.2rem; font-weight:700; margin:0 0 1.25rem; display:flex; align-items:center; gap:0.5rem;">
          <span>⚙️</span> <span>Verified Technical Specifications</span>
        </h3>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1px; background:var(--td-border-subtle); border:1px solid var(--td-border-subtle); border-radius:0.5rem; overflow:hidden;">
          <div style="background:var(--td-bg-surface); padding:1rem; display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--td-text-muted); font-size:0.88rem;">Processor / Chipset:</span>
            ${formatSpec(specs.processor)}
          </div>
          <div style="background:var(--td-bg-surface); padding:1rem; display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--td-text-muted); font-size:0.88rem;">RAM / Memory:</span>
            ${formatSpec(specs.ram)}
          </div>
          <div style="background:var(--td-bg-surface); padding:1rem; display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--td-text-muted); font-size:0.88rem;">Storage Capacity:</span>
            ${formatSpec(specs.storage)}
          </div>
          <div style="background:var(--td-bg-surface); padding:1rem; display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--td-text-muted); font-size:0.88rem;">Display Size:</span>
            ${formatSpec(specs.displaySize)}
          </div>
          <div style="background:var(--td-bg-surface); padding:1rem; display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--td-text-muted); font-size:0.88rem;">Panel Type:</span>
            ${formatSpec(specs.displayPanel)}
          </div>
          <div style="background:var(--td-bg-surface); padding:1rem; display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--td-text-muted); font-size:0.88rem;">Resolution:</span>
            ${formatSpec(specs.resolution)}
          </div>
          <div style="background:var(--td-bg-surface); padding:1rem; display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--td-text-muted); font-size:0.88rem;">Refresh Rate:</span>
            ${formatSpec(specs.refreshRate)}
          </div>
          <div style="background:var(--td-bg-surface); padding:1rem; display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--td-text-muted); font-size:0.88rem;">Battery Capacity:</span>
            ${formatSpec(specs.batteryCapacity)}
          </div>
          <div style="background:var(--td-bg-surface); padding:1rem; display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--td-text-muted); font-size:0.88rem;">Charging Speed:</span>
            ${formatSpec(specs.chargingSpeed)}
          </div>
          <div style="background:var(--td-bg-surface); padding:1rem; display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--td-text-muted); font-size:0.88rem;">Camera System:</span>
            ${formatSpec(specs.cameras)}
          </div>
          <div style="background:var(--td-bg-surface); padding:1rem; display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--td-text-muted); font-size:0.88rem;">Weight:</span>
            ${formatSpec(specs.weight)}
          </div>
          <div style="background:var(--td-bg-surface); padding:1rem; display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--td-text-muted); font-size:0.88rem;">Connectivity / Radio:</span>
            ${formatSpec(specs.connectivity)}
          </div>
        </div>

        <div style="margin-top:0.75rem; font-size:0.75rem; color:var(--td-text-muted);">
          * Note: Specifications reflect empirically tested configurations or official manufacturer technical documentation. Missing or unverified fields are documented as "—" rather than extrapolated.
        </div>
      </div>

      <!-- Empirical Testing Footprint Section -->
      <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.75rem; margin-bottom:2rem;">
        <h3 style="color:#fff; font-size:1.2rem; font-weight:700; margin:0 0 0.5rem; display:flex; align-items:center; gap:0.5rem;">
          <span>🔬</span> <span>Official WDIII Research Footprint</span>
        </h3>
        <p style="color:var(--td-text-secondary); font-size:0.9rem; margin:0 0 1.5rem; line-height:1.5;">
          Direct empirical tests, case studies, and forensic investigations involving this device in the WDIII laboratory.
        </p>

        ${linked.length > 0 ? `
          <div style="display:flex; flex-direction:column; gap:1rem;">
            ${linked.map(exp => `
              <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem;">
                  <div>
                    <span style="font-size:0.75rem; font-family:monospace; font-weight:700; color:var(--td-info); text-transform:uppercase;">${esc(exp.id)}</span>
                    <h4 style="color:#fff; font-size:1.05rem; font-weight:700; margin:0.15rem 0 0.25rem;">${esc(exp.title)}</h4>
                  </div>
                  <div style="display:flex; gap:0.375rem;">
                    <span style="font-size:0.72rem; padding:0.15rem 0.5rem; border-radius:9999px; background:var(--td-info-bg); color:var(--td-info); font-weight:600; text-transform:uppercase;">
                      ${esc(exp.category)}
                    </span>
                    <span style="font-size:0.72rem; padding:0.15rem 0.5rem; border-radius:9999px; background:rgba(52, 211, 153, 0.1); color:var(--td-success); font-weight:600; text-transform:uppercase;">
                      ${esc(exp.status)}
                    </span>
                  </div>
                </div>

                <p style="color:var(--td-text-secondary); font-size:0.88rem; margin:0 0 0.75rem; line-height:1.5;">
                  <strong>Research Question:</strong> ${esc(exp.researchQuestion)}
                </p>

                ${exp.verdict ? `
                  <div style="background:var(--td-bg-surface); border-left:3px solid var(--td-info); padding:0.6rem 0.875rem; border-radius:0.25rem; font-size:0.84rem; color:var(--td-text-primary); margin-bottom:0.75rem;">
                    <strong>Documented Outcome:</strong> ${esc(exp.verdict)}
                  </div>
                ` : ""}

                <div style="display:flex; justify-content:flex-end;">
                  <a href="#/experiments/${exp.id}" style="display:inline-flex; align-items:center; gap:0.35rem; color:var(--td-info); font-size:0.85rem; font-weight:600; text-decoration:none;">
                    <span>Read Full Experiment Protocol</span>
                    <span>→</span>
                  </a>
                </div>
              </div>
            `).join("")}
          </div>
        ` : `
          <div style="text-align:center; padding:2.5rem 1.5rem; background:var(--td-bg-card); border:1px dashed var(--td-border-subtle); border-radius:0.5rem;">
            <p style="color:var(--td-text-secondary); font-size:0.92rem; margin:0 0 0.5rem;">
              No empirical experiments currently logged for this specific device.
            </p>
            <p style="color:var(--td-text-muted); font-size:0.82rem; margin:0;">
              This hardware entry is registered as a specification baseline and baseline comparator for active protocols.
            </p>
          </div>
        `}
      </div>

      <!-- Step 6: Crowdsourced Community Telemetry & Empirical Statistics Section -->
      ${renderCommunityStatsSection(stats, device)}

      <!-- Authoritative Sources & Verification Footnotes -->
      <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.5rem;">
        <h4 style="color:#fff; font-size:0.95rem; font-weight:700; margin:0 0 0.75rem; display:flex; align-items:center; gap:0.375rem;">
          <span>📚</span> <span>Authoritative Sources &amp; Citations</span>
        </h4>
        <ul style="margin:0; padding-left:1.25rem; color:var(--td-text-secondary); font-size:0.85rem; line-height:1.6;">
          ${(device.sources || ["Manufacturer technical whitepaper", "Internal laboratory test logs"]).map(s => `
            <li>${esc(s)}</li>
          `).join("")}
        </ul>
        <div style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid var(--td-border-subtle); font-size:0.78rem; color:var(--td-text-muted);">
          Device Registry Slug: <code>${esc(device.id)}</code> | Verified Origin: <code>${esc(device.origin)}</code>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders the dedicated Crowdsourced Community Telemetry & Statistics section
 */
function renderCommunityStatsSection(stats, device) {
  const metricKeys = Object.keys(stats.metrics || {});
  const hasMetrics = metricKeys.length > 0;
  const protocols = Object.entries(stats.distributions?.protocols || {});
  const osList = Object.entries(stats.distributions?.operatingSystems || {});

  return `
    <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.75rem; margin-bottom:2rem;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; margin-bottom:1rem; border-bottom:1px solid var(--td-border-subtle); padding-bottom:1rem;">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.25rem;">
            <span style="font-size:1.3rem;">🧪</span>
            <h3 style="color:#fff; font-size:1.2rem; font-weight:700; margin:0;">
              Crowdsourced Community Telemetry &amp; Statistics
            </h3>
          </div>
          <p style="color:var(--td-text-secondary); font-size:0.88rem; margin:0; line-height:1.5;">
            Descriptive statistical metrics compiled strictly from approved peer-reviewed reproduction protocols.
          </p>
        </div>

        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
          <span style="font-size:0.75rem; font-weight:700; padding:0.25rem 0.65rem; border-radius:9999px; background:${stats.sampleSize > 0 ? 'rgba(52, 211, 153, 0.12)' : 'var(--td-bg-card)'}; border:1px solid ${stats.sampleSize > 0 ? 'rgba(52, 211, 153, 0.3)' : 'var(--td-border-subtle)'}; color:${stats.sampleSize > 0 ? 'var(--td-success)' : 'var(--td-text-muted)'};">
            ${stats.sampleSize} Verified Sample${stats.sampleSize === 1 ? '' : 's'} (n)
          </span>
          <a href="#/submit?device=${encodeURIComponent(device.id)}" style="display:inline-flex; align-items:center; gap:0.35rem; padding:0.35rem 0.75rem; border-radius:0.375rem; background:var(--td-info); color:#fff; font-size:0.8rem; font-weight:600; text-decoration:none;">
            <span>+</span> <span>Submit Protocol Test</span>
          </a>
        </div>
      </div>

      <!-- Segregation Disclaimer Banner -->
      <div style="display:flex; align-items:flex-start; gap:0.75rem; background:rgba(96, 165, 250, 0.08); border:1px solid rgba(96, 165, 250, 0.2); border-radius:0.5rem; padding:0.75rem 1rem; margin-bottom:1.5rem; font-size:0.82rem; color:var(--td-text-secondary); line-height:1.5;">
        <span style="font-size:1.1rem; line-height:1;">⚖️</span>
        <div>
          <strong style="color:var(--td-info);">Segregation of Data Authority:</strong>
          Community telemetry represents independent test runs under diverse environmental conditions. These data points are mathematically aggregated and isolated from canonical WDIII laboratory research. Pending, rejected, or unverified submissions are strictly excluded from all public metrics.
        </div>
      </div>

      ${stats.sampleSize === 0 ? `
        <div style="text-align:center; padding:2.5rem 1.5rem; background:var(--td-bg-card); border:1px dashed var(--td-border-subtle); border-radius:0.5rem;">
          <div style="font-size:2rem; margin-bottom:0.5rem;">📊</div>
          <p style="color:var(--td-text-primary); font-weight:600; font-size:0.95rem; margin:0 0 0.35rem;">
            No Verified Community Benchmarks Logged Yet
          </p>
          <p style="color:var(--td-text-muted); font-size:0.85rem; max-width:480px; margin:0 auto 1.25rem; line-height:1.5;">
            Be the first verified contributor to submit an empirical reproduction protocol for ${esc(device.brand)} ${esc(device.model)}.
          </p>
          <a href="#/submit?device=${encodeURIComponent(device.id)}" style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.5rem 1.1rem; border-radius:0.375rem; background:var(--td-info); color:#fff; font-size:0.85rem; font-weight:600; text-decoration:none;">
            🧪 Submit First Protocol Reproduction
          </a>
        </div>
      ` : `
        <!-- High-Level KPI Stat Cards -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; margin-bottom:1.75rem;">
          <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem;">
            <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); margin-bottom:0.25rem;">Sample Size (n)</div>
            <div style="font-size:1.6rem; font-weight:700; color:var(--td-success);">${stats.sampleSize}</div>
            <div style="font-size:0.72rem; color:var(--td-text-secondary); margin-top:0.25rem;">${stats.contributorCount || 1} Unique Contributor${(stats.contributorCount || 1) === 1 ? '' : 's'}</div>
          </div>

          ${stats.metrics.screenOnTimeMinutes ? `
            <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); margin-bottom:0.25rem;">Mean Screen-On Time</div>
              <div style="font-size:1.6rem; font-weight:700; color:var(--td-info);">
                ${formatMetricValue(stats.metrics.screenOnTimeMinutes, "mean")}
              </div>
              <div style="font-size:0.72rem; color:var(--td-text-secondary); margin-top:0.25rem;">
                Median: ${formatMetricValue(stats.metrics.screenOnTimeMinutes, "median")}
              </div>
            </div>
          ` : ""}

          ${stats.metrics.repairCost ? `
            <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); margin-bottom:0.25rem;">Mean Repair Cost</div>
              <div style="font-size:1.6rem; font-weight:700; color:#f59e0b;">
                ${formatMetricValue(stats.metrics.repairCost, "mean")}
              </div>
              <div style="font-size:0.72rem; color:var(--td-text-secondary); margin-top:0.25rem;">
                Range: ${formatMetricValue(stats.metrics.repairCost, "range")}
              </div>
            </div>
          ` : ""}

          ${stats.metrics.qualityRating ? `
            <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); margin-bottom:0.25rem;">Post-Repair Quality</div>
              <div style="font-size:1.6rem; font-weight:700; color:var(--td-text-primary);">
                ${formatMetricValue(stats.metrics.qualityRating, "mean")}
              </div>
              <div style="font-size:0.72rem; color:var(--td-text-secondary); margin-top:0.25rem;">
                Median: ${formatMetricValue(stats.metrics.qualityRating, "median")}
              </div>
            </div>
          ` : ""}

          ${stats.metrics.chargeTimeMinutes ? `
            <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem;">
              <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); margin-bottom:0.25rem;">Full Charge Time</div>
              <div style="font-size:1.6rem; font-weight:700; color:var(--td-text-primary);">
                ${formatMetricValue(stats.metrics.chargeTimeMinutes, "mean")}
              </div>
              <div style="font-size:0.72rem; color:var(--td-text-secondary); margin-top:0.25rem;">
                Median: ${formatMetricValue(stats.metrics.chargeTimeMinutes, "median")}
              </div>
            </div>
          ` : ""}
        </div>

        ${hasMetrics ? `
          <!-- Detailed Statistical Aggregation Matrix -->
          <div style="margin-bottom:1.75rem;">
            <h4 style="color:#fff; font-size:1rem; font-weight:700; margin:0 0 0.75rem; display:flex; align-items:center; gap:0.35rem;">
              <span>📐</span> <span>Descriptive Statistical Metrics</span>
            </h4>
            <div style="overflow-x:auto; border:1px solid var(--td-border-subtle); border-radius:0.5rem;" class="td-scrollbar">
              <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
                <thead>
                  <tr style="background:var(--td-bg-card); border-bottom:1px solid var(--td-border-subtle); color:var(--td-text-muted); text-align:left;">
                    <th style="padding:0.75rem 1rem;">Metric / Parameter</th>
                    <th style="padding:0.75rem 1rem; text-align:center;">Sample (n)</th>
                    <th style="padding:0.75rem 1rem;">Arithmetic Mean (μ)</th>
                    <th style="padding:0.75rem 1rem;">Median (M)</th>
                    <th style="padding:0.75rem 1rem;">Std Deviation (σ)</th>
                    <th style="padding:0.75rem 1rem;">Observed Range [Min – Max]</th>
                  </tr>
                </thead>
                <tbody>
                  ${metricKeys.map(k => {
                    const m = stats.metrics[k];
                    const p = m.precision ?? 1;
                    const pref = m.prefix || "";
                    const suff = m.suffix || "";
                    const stdStr = m.count >= 2 && m.stdDev !== null ? `±${m.stdDev.toFixed(p)}` : `<span style="color:var(--td-text-muted); font-style:italic;">— (n &lt; 2)</span>`;
                    const rangeStr = m.min !== null && m.max !== null ? `${pref}${m.min.toFixed(p)}${suff} – ${pref}${m.max.toFixed(p)}${suff}` : "—";
                    return `
                      <tr style="border-bottom:1px solid var(--td-border-subtle); background:var(--td-bg-surface);">
                        <td style="padding:0.75rem 1rem; font-weight:600; color:var(--td-text-primary);">
                          ${esc(m.label)}
                          ${m.isCustom ? `<span style="font-size:0.7rem; margin-left:0.35rem; padding:0.1rem 0.35rem; border-radius:0.25rem; background:var(--td-bg-card); color:var(--td-text-muted);">Custom</span>` : ""}
                        </td>
                        <td style="padding:0.75rem 1rem; text-align:center; font-family:monospace; color:var(--td-text-secondary);">${m.count}</td>
                        <td style="padding:0.75rem 1rem; font-weight:600; color:var(--td-info);">${pref}${m.mean.toFixed(p)}${suff}</td>
                        <td style="padding:0.75rem 1rem; color:var(--td-text-primary);">${pref}${m.median.toFixed(p)}${suff}</td>
                        <td style="padding:0.75rem 1rem; color:var(--td-text-secondary); font-family:monospace;">${stdStr}</td>
                        <td style="padding:0.75rem 1rem; color:var(--td-text-muted); font-size:0.82rem;">${rangeStr}</td>
                      </tr>
                    `;
                  }).join("")}
                </tbody>
              </table>
            </div>
          </div>
        ` : ""}

        <!-- Tested Operating Systems and Protocols Breakdown -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.25rem; margin-bottom:1.75rem;">
          ${osList.length > 0 ? `
            <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem;">
              <h5 style="color:#fff; font-size:0.9rem; font-weight:700; margin:0 0 0.75rem; display:flex; align-items:center; gap:0.35rem;">
                <span>💻</span> <span>Tested Operating Systems &amp; Builds</span>
              </h5>
              <div style="display:flex; flex-direction:column; gap:0.5rem;">
                ${osList.map(([osName, count]) => `
                  <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; background:var(--td-bg-surface); padding:0.4rem 0.6rem; border-radius:0.25rem;">
                    <span style="color:var(--td-text-primary);">${esc(osName)}</span>
                    <span style="font-family:monospace; font-weight:700; color:var(--td-info);">${count} test${count === 1 ? '' : 's'}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ""}

          ${protocols.length > 0 ? `
            <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem;">
              <h5 style="color:#fff; font-size:0.9rem; font-weight:700; margin:0 0 0.75rem; display:flex; align-items:center; gap:0.35rem;">
                <span>🔬</span> <span>Associated Protocols Evaluated</span>
              </h5>
              <div style="display:flex; flex-direction:column; gap:0.5rem;">
                ${protocols.map(([protoId, count]) => `
                  <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; background:var(--td-bg-surface); padding:0.4rem 0.6rem; border-radius:0.25rem;">
                    <a href="#/experiments/${encodeURIComponent(protoId)}" style="color:var(--td-info); text-decoration:none; font-weight:600;">
                      Protocol ${esc(protoId.toUpperCase())}
                    </a>
                    <span style="font-family:monospace; font-weight:700; color:var(--td-text-secondary);">${count} reproduction${count === 1 ? '' : 's'}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ""}
        </div>

        <!-- Recent Verified Submissions -->
        ${stats.recentSubmissions?.length > 0 ? `
          <div>
            <h5 style="color:#fff; font-size:0.9rem; font-weight:700; margin:0 0 0.75rem; display:flex; align-items:center; gap:0.35rem;">
              <span>📋</span> <span>Latest Verified Field Test Logs</span>
            </h5>
            <div style="display:flex; flex-direction:column; gap:0.5rem;">
              ${stats.recentSubmissions.map(sub => {
                const dateStr = sub.testDate ? new Date(sub.testDate).toLocaleDateString() : "Verified";
                const measList = Object.entries(sub.measurements || {});
                return `
                  <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.375rem; padding:0.75rem 1rem; font-size:0.82rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.35rem;">
                      <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span style="font-weight:600; color:var(--td-text-primary);">${esc(sub.authorDisplayName)}</span>
                        <span style="font-size:0.72rem; padding:0.1rem 0.4rem; border-radius:0.25rem; background:rgba(52, 211, 153, 0.1); color:var(--td-success);">Verified</span>
                      </div>
                      <span style="color:var(--td-text-muted); font-size:0.75rem;">${esc(dateStr)} | Build: ${esc(sub.softwareVersion)}</span>
                    </div>
                    ${measList.length > 0 ? `
                      <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:0.35rem;">
                        ${measList.map(([k, v]) => `
                          <span style="font-size:0.75rem; background:var(--td-bg-surface); padding:0.2rem 0.45rem; border-radius:0.25rem; border:1px solid var(--td-border-subtle); color:var(--td-text-secondary);">
                            <strong style="color:var(--td-text-primary);">${esc(k)}:</strong> ${typeof v === 'object' && v !== null ? esc(v.value) + ' ' + esc(v.unit || '') : esc(v)}
                          </span>
                        `).join("")}
                      </div>
                    ` : ""}
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        ` : ""}
      `}
    </div>
  `;
}

