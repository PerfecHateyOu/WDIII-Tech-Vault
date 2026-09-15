/**
 * WDIII Tech Vault - Device Comparison View (#/compare)
 * 
 * Strict Read-Only Multi-Device Hardware & Telemetry Comparison System.
 * 
 * Data Provenance Rules:
 * 1. WDIII OFFICIAL: Controlled measurements/results from official WDIII experiments.
 * 2. VERIFIED COMMUNITY: Measurements from community submissions that passed moderation (status === 'approved').
 * 3. PUBLISHED SPECIFICATION: Manufacturer or documented hardware specifications from device record.
 * 
 * Technical & UX Standards:
 * - Allows selecting strictly 2 or 3 devices (prevents 4th device)
 * - Searchable selection modal with brand, category, OS, and release year filters
 * - Desktop side-by-side comparison table (Metric | Device A | Device B | optional Device C)
 * - Clean mobile interface with responsive tabs/cards preventing horizontal squeeze
 * - Transparent category scores only (no arbitrary overall phone score) with division-by-zero protection
 * - Deep-linkable URL sharing: #/compare?devices=deviceIdA,deviceIdB,deviceIdC
 * - Complete data availability states: "—", "No WDIII data", "No verified community data", "Limited sample"
 */

import { getDevices, getDeviceById, getApprovedSubmissionsForDevice } from "../services/database.js";
import { 
  loadComparisonData, 
  DATA_PROVENANCE, 
  COMPARABLE_METRICS,
  formatComparisonMetricValue,
  formatMetricRange 
} from "../services/comparison-service.js";
import { escapeHtml } from "../utils/sanitize.js";

function esc(val) {
  if (val === null || val === undefined) return "";
  return escapeHtml(String(val));
}

function formatSpecValue(val) {
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
    badge: "Official Lab Matchup"
  },
  {
    id: "pixel-generations",
    title: "Google Pixel Evolution",
    description: "Pixel 8 Pro vs Pixel 9 Pro vs Pixel 10 Pro",
    devices: ["google-pixel-8-pro", "google-pixel-9-pro", "google-pixel-10-pro"],
    badge: "Generational"
  },
  {
    id: "pro-laptops",
    title: "Apple Silicon Pro Workstations",
    description: "MacBook Pro 16\" (M4 Max) vs MacBook Pro 14\" (M3 Max)",
    devices: ["apple-macbook-pro-16-m4-max", "apple-macbook-pro-14-m3-max"],
    badge: "Pro Compute"
  }
];

/**
 * Main View Entry Point for #/compare
 *
 * @param {HTMLElement} container
 */
export async function renderCompareView(container) {
  if (!container) return;

  // Read initial device IDs from URL hash (e.g. #/compare?devices=id1,id2)
  const initialIds = getDeviceIdsFromHash();
  let selectedIds = initialIds.length >= 1 ? initialIds.slice(0, 3) : ["apple-iphone-17-pro-max", "samsung-galaxy-s26-ultra"];
  // Strictly enforce max 3
  if (selectedIds.length > 3) {
    selectedIds = selectedIds.slice(0, 3);
  }

  // Load complete device catalog for the searchable picker modal
  let allDevices = [];
  try {
    allDevices = await getDevices({ sortBy: "brand", sortOrder: "asc" });
  } catch (err) {
    console.warn("Error fetching device catalog for compare view:", err);
  }

  // Active UI state
  let activeMobileTab = "overview";
  let modalTargetSlot = null; // 0, 1, or 2

  container.innerHTML = `
    <!-- Top Hero Header -->
    <div style="text-align:center; padding:3rem 1rem 2rem;">
      <div style="display:inline-flex; align-items:center; gap:0.5rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border-subtle); padding:0.35rem 0.85rem; border-radius:9999px; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--td-info); margin-bottom:1rem;">
        <span>⚖️</span> <span>Empirical Technical Benchmark</span>
      </div>
      <h1 style="color:#fff; font-size:clamp(1.75rem, 3.5vw + 0.5rem, 2.4rem); font-weight:800; margin:0 0 0.75rem; letter-spacing:-0.02em;">
        DEVICE COMPARISON
      </h1>
      <p style="color:var(--td-text-secondary); max-width:720px; margin:0 auto; font-size:1rem; line-height:1.6;">
        WDIII compares documented manufacturer specifications, official WDIII controlled laboratory measurements, and verified community results.
      </p>

      <!-- Data Provenance Legend Bar -->
      <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:0.75rem; margin-top:1.5rem;">
        <div style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.3rem 0.7rem; border-radius:0.375rem; background:rgba(96, 165, 250, 0.12); border:1px solid rgba(96, 165, 250, 0.35); font-size:0.75rem; font-weight:700; color:var(--td-info);">
          <span>🔬</span> <span>${DATA_PROVENANCE.WDIII_OFFICIAL}</span>
        </div>
        <div style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.3rem 0.7rem; border-radius:0.375rem; background:rgba(52, 211, 153, 0.12); border:1px solid rgba(52, 211, 153, 0.35); font-size:0.75rem; font-weight:700; color:var(--td-success);">
          <span>🧪</span> <span>${DATA_PROVENANCE.VERIFIED_COMMUNITY}</span>
        </div>
        <div style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.3rem 0.7rem; border-radius:0.375rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border-subtle); font-size:0.75rem; font-weight:700; color:var(--td-text-secondary);">
          <span>📋</span> <span>${DATA_PROVENANCE.PUBLISHED_SPECIFICATION}</span>
        </div>
      </div>
    </div>

    <!-- Main Comparison Applet Card Container -->
    <div style="max-width:1180px; margin:0 auto; padding:0 1rem 3rem;">
      
      <!-- Device Selector Toolbar -->
      <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.5rem; margin-bottom:1.75rem; box-shadow:0 4px 16px rgba(0,0,0,0.15);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.25rem;">
          <div>
            <h2 style="color:var(--td-text-primary); font-size:1.15rem; font-weight:700; margin:0 0 0.25rem;">Select Devices to Compare</h2>
            <div style="font-size:0.84rem; color:var(--td-text-muted);">Compare 2 to 3 devices side-by-side (strictly max 3 units)</div>
          </div>
          <div style="display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap;">
            <button id="btnShareComparison" type="button" style="display:inline-flex; align-items:center; gap:0.4rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-primary); padding:0.45rem 0.85rem; border-radius:0.375rem; font-size:0.85rem; font-weight:600; cursor:pointer;">
              <span>🔗</span> <span>Share Comparison</span>
            </button>
            <button id="btnClearComparison" type="button" style="display:inline-flex; align-items:center; gap:0.4rem; background:transparent; border:1px solid var(--td-border-subtle); color:var(--td-error, #f87171); padding:0.45rem 0.85rem; border-radius:0.375rem; font-size:0.85rem; cursor:pointer;">
              <span>✕</span> <span>Reset Selection</span>
            </button>
          </div>
        </div>

        <!-- 3 Device Slots Container -->
        <div id="deviceSlotsRow" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
          <!-- Dynamically Rendered Slots -->
        </div>

        <!-- Fourth Device Prevention Notice -->
        <div id="maxDeviceNotice" style="display:${selectedIds.length >= 3 ? 'block' : 'none'}; margin-top:0.75rem; padding:0.5rem 0.75rem; background:rgba(245, 158, 11, 0.1); border:1px solid rgba(245, 158, 11, 0.25); border-radius:0.375rem; font-size:0.78rem; color:var(--td-warning); text-align:center;">
          ℹ️ Maximum comparison capacity reached (3 devices). Remove a device to select a different one.
        </div>
      </div>

      <!-- Mobile Category Navigation Tabs -->
      <div id="mobileSectionTabs" class="mobile-only" style="display:none; margin-bottom:1.25rem; overflow-x:auto; padding-bottom:0.25rem; gap:0.5rem;">
        <button type="button" class="btn-mobile-tab active" data-tab="overview" style="white-space:nowrap; padding:0.45rem 0.85rem; border-radius:9999px; font-size:0.82rem; font-weight:600; border:1px solid var(--td-info); background:var(--td-info-bg); color:var(--td-info); cursor:pointer;">1. Overview</button>
        <button type="button" class="btn-mobile-tab" data-tab="hardware" style="white-space:nowrap; padding:0.45rem 0.85rem; border-radius:9999px; font-size:0.82rem; font-weight:600; border:1px solid var(--td-border-subtle); background:var(--td-bg-card); color:var(--td-text-secondary); cursor:pointer;">2. Hardware</button>
        <button type="button" class="btn-mobile-tab" data-tab="wdiii" style="white-space:nowrap; padding:0.45rem 0.85rem; border-radius:9999px; font-size:0.82rem; font-weight:600; border:1px solid var(--td-border-subtle); background:var(--td-bg-card); color:var(--td-text-secondary); cursor:pointer;">3. WDIII Lab Results</button>
        <button type="button" class="btn-mobile-tab" data-tab="community" style="white-space:nowrap; padding:0.45rem 0.85rem; border-radius:9999px; font-size:0.82rem; font-weight:600; border:1px solid var(--td-border-subtle); background:var(--td-bg-card); color:var(--td-text-secondary); cursor:pointer;">4. Community Data</button>
        <button type="button" class="btn-mobile-tab" data-tab="scores" style="white-space:nowrap; padding:0.45rem 0.85rem; border-radius:9999px; font-size:0.82rem; font-weight:600; border:1px solid var(--td-border-subtle); background:var(--td-bg-card); color:var(--td-text-secondary); cursor:pointer;">5. Category Scores</button>
      </div>

      <!-- Main Comparison Data Render Area -->
      <div id="comparisonRenderArea">
        <div style="text-align:center; padding:3.5rem; color:var(--td-text-muted);">
          Compiling multi-source telemetry and empirical specifications...
        </div>
      </div>

      <!-- Curated Presets Bar -->
      <div style="margin-top:2.5rem; background:var(--td-bg-card); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.1rem;">⚡</span>
            <h3 style="color:var(--td-text-primary); font-size:1rem; font-weight:700; margin:0;">Curated Technical Presets</h3>
          </div>
          <span style="font-size:0.75rem; color:var(--td-text-muted); text-transform:uppercase; letter-spacing:0.04em;">Instant 1-Click Comparison</span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1rem;">
          ${PRESETS.map(preset => `
            <div class="preset-card" data-preset-id="${preset.id}" style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem; cursor:pointer; transition:border-color 0.15s, transform 0.15s;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.4rem;">
                <h4 style="font-size:0.92rem; font-weight:700; color:var(--td-info); margin:0;">${esc(preset.title)}</h4>
                <span style="font-size:0.68rem; font-weight:700; text-transform:uppercase; padding:0.1rem 0.35rem; border-radius:0.25rem; background:var(--td-info-bg); color:var(--td-info); border:1px solid rgba(96,165,250,0.3);">${esc(preset.badge)}</span>
              </div>
              <p style="font-size:0.8rem; color:var(--td-text-secondary); margin:0 0 0.75rem; line-height:1.4;">${esc(preset.description)}</p>
              <div style="display:flex; align-items:center; justify-content:space-between; font-size:0.78rem; color:var(--td-text-muted);">
                <span>${preset.devices.length} Devices</span>
                <span style="color:var(--td-info); font-weight:600;">Load Matchup →</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

    </div>

    <!-- Searchable Device Picker Modal -->
    <div id="devicePickerModal" role="dialog" aria-modal="true" style="display:none; position:fixed; inset:0; z-index:3000; align-items:center; justify-content:center; padding:1.25rem; background:rgba(0,0,0,0.85); backdrop-filter:blur(6px);">
      <div class="td-slide-up" style="max-width:680px; width:100%; border-radius:0.75rem; padding:1.5rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border-subtle); box-shadow:0 16px 48px rgba(0,0,0,0.6); max-height:90vh; display:flex; flex-direction:column;">
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 style="color:#fff; font-size:1.2rem; font-weight:700; margin:0; display:flex; align-items:center; gap:0.5rem;">
            <span>📱</span> <span>Select Device for Comparison</span>
          </h3>
          <button id="btnClosePickerModal" type="button" style="background:none; border:none; color:var(--td-text-muted); font-size:1.4rem; cursor:pointer; padding:0.25rem;">✕</button>
        </div>

        <!-- Search Input -->
        <div style="position:relative; margin-bottom:1rem;">
          <span style="position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); color:var(--td-text-muted); pointer-events:none;">🔍</span>
          <input id="pickerSearchInput" type="text" placeholder="Search by brand, model, processor, or OS…" 
            style="width:100%; padding:0.6rem 0.85rem 0.6rem 2.25rem; border-radius:0.375rem; border:1px solid var(--td-border); background:var(--td-bg-card); color:var(--td-text-primary); font-size:0.9rem; outline:none;" />
        </div>

        <!-- Filters Row (Brand, Category, OS, Release Year) -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.5rem; margin-bottom:1rem;">
          <select id="pickerFilterBrand" style="padding:0.45rem; border-radius:0.375rem; border:1px solid var(--td-border); background:var(--td-bg-card); color:var(--td-text-primary); font-size:0.8rem; outline:none; cursor:pointer;">
            <option value="all">All Brands</option>
            <option value="apple">Apple</option>
            <option value="samsung">Samsung</option>
            <option value="google">Google</option>
            <option value="other">Other Brands</option>
          </select>

          <select id="pickerFilterCat" style="padding:0.45rem; border-radius:0.375rem; border:1px solid var(--td-border); background:var(--td-bg-card); color:var(--td-text-primary); font-size:0.8rem; outline:none; cursor:pointer;">
            <option value="all">All Categories</option>
            <option value="smartphone">Smartphones</option>
            <option value="laptop">Laptops</option>
            <option value="wearable">Wearables</option>
            <option value="accessory">Accessories</option>
          </select>

          <select id="pickerFilterOS" style="padding:0.45rem; border-radius:0.375rem; border:1px solid var(--td-border); background:var(--td-bg-card); color:var(--td-text-primary); font-size:0.8rem; outline:none; cursor:pointer;">
            <option value="all">All Operating Systems</option>
            <option value="ios">iOS</option>
            <option value="android">Android</option>
            <option value="macos">macOS</option>
            <option value="windows">Windows</option>
          </select>

          <select id="pickerFilterYear" style="padding:0.45rem; border-radius:0.375rem; border:1px solid var(--td-border); background:var(--td-bg-card); color:var(--td-text-primary); font-size:0.8rem; outline:none; cursor:pointer;">
            <option value="all">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023 &amp; Older</option>
          </select>
        </div>

        <!-- Filtered Devices List -->
        <div id="pickerDeviceList" style="flex:1; overflow-y:auto; max-height:420px; display:flex; flex-direction:column; gap:0.5rem; padding-right:0.25rem;" class="td-scrollbar">
          <!-- Populated by JS -->
        </div>

      </div>
    </div>
  `;

  // Inject responsive stylesheet for mobile tab switching
  injectCompareStyles();

  // Wire Top-level Toolbar Handlers
  const btnShare = container.querySelector("#btnShareComparison");
  const btnClear = container.querySelector("#btnClearComparison");

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
      syncUrl();
      renderSlots();
      renderComparison();
    });
  }

  // Presets Handlers
  container.querySelectorAll(".preset-card").forEach(card => {
    card.addEventListener("click", () => {
      const presetId = card.getAttribute("data-preset-id");
      const preset = PRESETS.find(p => p.id === presetId);
      if (preset) {
        selectedIds = [...preset.devices].slice(0, 3);
        syncUrl();
        renderSlots();
        renderComparison();
      }
    });
  });

  // Mobile Tabs Handlers
  container.querySelectorAll(".btn-mobile-tab").forEach(tabBtn => {
    tabBtn.addEventListener("click", () => {
      container.querySelectorAll(".btn-mobile-tab").forEach(b => {
        b.classList.remove("active");
        b.style.border = "1px solid var(--td-border-subtle)";
        b.style.background = "var(--td-bg-card)";
        b.style.color = "var(--td-text-secondary)";
      });
      tabBtn.classList.add("active");
      tabBtn.style.border = "1px solid var(--td-info)";
      tabBtn.style.background = "var(--td-info-bg)";
      tabBtn.style.color = "var(--td-info)";
      activeMobileTab = tabBtn.getAttribute("data-tab");
      updateMobileTabVisibility();
    });
  });

  // Picker Modal Elements
  const modal = container.querySelector("#devicePickerModal");
  const btnCloseModal = container.querySelector("#btnClosePickerModal");
  const pickerSearch = container.querySelector("#pickerSearchInput");
  const filterBrand = container.querySelector("#pickerFilterBrand");
  const filterCat = container.querySelector("#pickerFilterCat");
  const filterOS = container.querySelector("#pickerFilterOS");
  const filterYear = container.querySelector("#pickerFilterYear");
  const pickerList = container.querySelector("#pickerDeviceList");

  if (btnCloseModal) {
    btnCloseModal.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  function openPickerForSlot(slotIdx) {
    modalTargetSlot = slotIdx;
    modal.style.display = "flex";
    if (pickerSearch) {
      pickerSearch.value = "";
      pickerSearch.focus();
    }
    updatePickerList();
  }

  function updatePickerList() {
    if (!pickerList) return;
    const q = (pickerSearch?.value || "").toLowerCase().trim();
    const brand = filterBrand?.value || "all";
    const cat = filterCat?.value || "all";
    const os = filterOS?.value || "all";
    const year = filterYear?.value || "all";

    const filtered = allDevices.filter(d => {
      // Exclude devices already in comparison slots
      if (selectedIds.includes(d.id) && selectedIds[modalTargetSlot] !== d.id) {
        return false;
      }

      if (brand !== "all") {
        const dBrand = (d.brand || "").toLowerCase();
        if (brand === "other") {
          if (["apple", "samsung", "google"].includes(dBrand)) return false;
        } else if (!dBrand.includes(brand)) {
          return false;
        }
      }

      if (cat !== "all" && d.category !== cat) return false;

      if (os !== "all") {
        const dOS = (d.operatingSystem || "").toLowerCase();
        if (!dOS.includes(os)) return false;
      }

      if (year !== "all") {
        if (year === "2023") {
          if (d.releaseYear && d.releaseYear >= 2024) return false;
        } else if (String(d.releaseYear) !== year) {
          return false;
        }
      }

      if (q) {
        const text = `${d.brand} ${d.model} ${d.category} ${d.operatingSystem} ${d.specifications?.processor || ""}`.toLowerCase();
        if (!text.includes(q)) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      pickerList.innerHTML = `
        <div style="padding:2rem; text-align:center; color:var(--td-text-muted); font-size:0.9rem;">
          No matching devices found in registry.
        </div>
      `;
      return;
    }

    pickerList.innerHTML = filtered.map(dev => `
      <div class="picker-device-item" data-device-id="${dev.id}" style="padding:0.75rem 1rem; border-radius:0.375rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); display:flex; justify-content:space-between; align-items:center; cursor:pointer; transition:border-color 0.15s, background 0.15s;">
        <div>
          <div style="display:flex; align-items:center; gap:0.4rem; margin-bottom:0.2rem;">
            <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--td-info);">${esc(dev.brand)}</span>
            <span style="color:var(--td-border-subtle);">•</span>
            <span style="font-size:0.75rem; color:var(--td-text-muted);">${esc(dev.releaseYear || '—')}</span>
            ${dev.category ? `<span style="font-size:0.68rem; padding:0.05rem 0.35rem; border-radius:0.2rem; background:var(--td-bg-surface); color:var(--td-text-secondary);">${esc(dev.category)}</span>` : ""}
          </div>
          <div style="font-size:0.92rem; font-weight:700; color:#fff;">${esc(dev.model)}</div>
          <div style="font-size:0.75rem; color:var(--td-text-muted); margin-top:0.15rem;">${esc(dev.specifications?.processor || dev.operatingSystem || 'Standard specifications')}</div>
        </div>
        <button type="button" style="padding:0.35rem 0.75rem; border-radius:0.25rem; background:var(--td-info-bg); border:1px solid rgba(96,165,250,0.3); color:var(--td-info); font-size:0.8rem; font-weight:600; cursor:pointer;">
          Select →
        </button>
      </div>
    `).join("");

    pickerList.querySelectorAll(".picker-device-item").forEach(item => {
      item.addEventListener("click", () => {
        const deviceId = item.getAttribute("data-device-id");
        if (deviceId && modalTargetSlot !== null) {
          // Strictly prevent 4th device
          if (modalTargetSlot >= 3) return;
          selectedIds[modalTargetSlot] = deviceId;
          // Clean duplicates
          selectedIds = selectedIds.filter((id, i, arr) => Boolean(id) && arr.indexOf(id) === i).slice(0, 3);
          modal.style.display = "none";
          syncUrl();
          renderSlots();
          renderComparison();
        }
      });
    });
  }

  [pickerSearch, filterBrand, filterCat, filterOS, filterYear].forEach(el => {
    el?.addEventListener("input", updatePickerList);
    el?.addEventListener("change", updatePickerList);
  });

  function syncUrl() {
    if (selectedIds.length > 0) {
      window.location.hash = `#/compare?devices=${selectedIds.join(",")}`;
    } else {
      window.location.hash = `#/compare`;
    }
    const notice = container.querySelector("#maxDeviceNotice");
    if (notice) {
      notice.style.display = selectedIds.length >= 3 ? "block" : "none";
    }
  }

  function renderSlots() {
    const slotsRow = container.querySelector("#deviceSlotsRow");
    if (!slotsRow) return;

    // We allow slots for up to 3 devices.
    // If selectedIds.length < 3, show an "Add Device" slot.
    const slotsHtml = [0, 1, 2].map(slotIdx => {
      const currentId = selectedIds[slotIdx] || "";
      const dev = allDevices.find(d => d.id === currentId);
      const isOptional = slotIdx === 2;
      const slotTitle = `Slot ${slotIdx + 1}${isOptional ? ' (Optional 3rd)' : ''}`;

      if (dev) {
        return `
          <div style="background:var(--td-bg-card); border:1px solid var(--td-info); border-radius:0.5rem; padding:1rem; position:relative;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
              <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-info);">
                ${slotTitle}
              </span>
              <button type="button" class="btn-remove-slot" data-slot="${slotIdx}" style="background:none; border:none; color:var(--td-text-muted); cursor:pointer; font-size:0.8rem; padding:0.1rem 0.3rem;" title="Remove this device from comparison">
                ✕ Remove
              </button>
            </div>
            <div style="font-size:1rem; font-weight:700; color:#fff; margin-bottom:0.25rem;">
              ${esc(dev.brand)} ${esc(dev.model)}
            </div>
            <div style="font-size:0.78rem; color:var(--td-text-muted); margin-bottom:0.75rem;">
              ${esc(dev.category || 'Hardware')} • Released ${esc(dev.releaseYear || '—')} • ${esc(dev.operatingSystem || '—')}
            </div>
            <button type="button" class="btn-change-slot" data-slot="${slotIdx}" style="width:100%; padding:0.4rem; border-radius:0.25rem; background:var(--td-bg-surface); border:1px solid var(--td-border-subtle); color:var(--td-text-secondary); font-size:0.8rem; font-weight:600; cursor:pointer;">
              Change Device ⇄
            </button>
          </div>
        `;
      } else {
        // Empty slot
        return `
          <div style="background:var(--td-bg-card); border:1px dashed var(--td-border-subtle); border-radius:0.5rem; padding:1.25rem 1rem; text-align:center; display:flex; flex-direction:column; justify-content:center; align-items:center;">
            <span style="font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--td-text-muted); margin-bottom:0.5rem;">
              ${slotTitle}
            </span>
            <div style="font-size:0.85rem; color:var(--td-text-secondary); margin-bottom:0.75rem;">
              ${isOptional ? 'Add a 3rd device to shootout' : 'Select a device'}
            </div>
            <button type="button" class="btn-add-slot" data-slot="${slotIdx}" style="display:inline-flex; align-items:center; gap:0.35rem; padding:0.45rem 0.9rem; border-radius:0.375rem; background:var(--td-info); color:#fff; border:none; font-size:0.82rem; font-weight:600; cursor:pointer;">
              <span>+ Select Device</span>
            </button>
          </div>
        `;
      }
    }).join("");

    slotsRow.innerHTML = slotsHtml;

    // Wire Remove Buttons
    slotsRow.querySelectorAll(".btn-remove-slot").forEach(btn => {
      btn.addEventListener("click", () => {
        const slot = parseInt(btn.getAttribute("data-slot"), 10);
        selectedIds.splice(slot, 1);
        syncUrl();
        renderSlots();
        renderComparison();
      });
    });

    // Wire Change / Add Buttons
    slotsRow.querySelectorAll(".btn-change-slot, .btn-add-slot").forEach(btn => {
      btn.addEventListener("click", () => {
        const slot = parseInt(btn.getAttribute("data-slot"), 10);
        // Strictly prevent 4th device
        if (slot >= 3) return;
        openPickerForSlot(slot);
      });
    });
  }

  async function renderComparison() {
    const mount = container.querySelector("#comparisonRenderArea");
    if (!mount) return;

    if (selectedIds.length < 2) {
      mount.innerHTML = `
        <div style="background:var(--td-bg-surface-elevated); border:1px dashed var(--td-border); border-radius:0.75rem; padding:3.5rem 2rem; text-align:center;">
          <div style="font-size:2.5rem; margin-bottom:1rem;">⚖️</div>
          <h3 style="color:var(--td-text-primary); font-size:1.25rem; font-weight:700; margin-bottom:0.5rem;">Select At Least 2 Devices</h3>
          <p style="color:var(--td-text-secondary); max-width:520px; margin:0 auto 1.5rem; font-size:0.95rem; line-height:1.5;">
            Pick two or three hardware units using the selectors above, or click one of the curated presets below to immediately evaluate documented specs, official WDIII lab tests, and verified community results.
          </p>
          <div style="display:inline-flex; gap:0.75rem; flex-wrap:wrap; justify-content:center;">
            <button type="button" id="btnLoadShootoutFallback" style="padding:0.6rem 1.25rem; border-radius:0.375rem; background:var(--td-info); color:#fff; border:none; font-weight:600; font-size:0.9rem; cursor:pointer;">
              Load Flagship Shootout
            </button>
            <a href="#/devices" style="padding:0.6rem 1.25rem; border-radius:0.375rem; background:var(--td-bg-card); color:var(--td-text-secondary); border:1px solid var(--td-border-subtle); text-decoration:none; font-weight:600; font-size:0.9rem;">
              Browse Hardware Registry →
            </a>
          </div>
        </div>
      `;
      mount.querySelector("#btnLoadShootoutFallback")?.addEventListener("click", () => {
        selectedIds = ["apple-iphone-17-pro-max", "samsung-galaxy-s26-ultra", "google-pixel-10-pro"];
        syncUrl();
        renderSlots();
        renderComparison();
      });
      return;
    }

    mount.innerHTML = `
      <div style="text-align:center; padding:3.5rem; color:var(--td-text-muted);">
        <div style="font-size:1.5rem; margin-bottom:0.5rem;">⏳</div>
        <div>Loading verified metrics and official research dossiers...</div>
      </div>
    `;

    // Fetch comparison via focused comparison-service
    const data = await loadComparisonData(selectedIds);

    if (!data || !data.success || data.entries.length < 2) {
      mount.innerHTML = `
        <div style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-error, #f87171); border-radius:0.75rem; padding:2rem; text-align:center; color:var(--td-text-secondary);">
          <p style="margin:0 0 1rem; color:var(--td-error, #f87171); font-weight:600;">
            ${esc(data?.message || 'One or more selected devices could not be located in the registry.')}
          </p>
          <button type="button" id="btnResetShootout" style="padding:0.5rem 1rem; border-radius:0.375rem; background:var(--td-info); color:#fff; border:none; cursor:pointer;">Reset Selection</button>
        </div>
      `;
      mount.querySelector("#btnResetShootout")?.addEventListener("click", () => {
        selectedIds = ["apple-iphone-17-pro-max", "samsung-galaxy-s26-ultra"];
        syncUrl();
        renderSlots();
        renderComparison();
      });
      return;
    }

    const { entries, categoryScores } = data;
    const colWidthPct = Math.floor(75 / entries.length);

    // Build Desktop Table HTML & Mobile Cards HTML
    mount.innerHTML = `
      <!-- Desktop Side-by-Side Comparison Container -->
      <div class="desktop-only-table" style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; overflow:hidden; margin-bottom:2rem; box-shadow:0 4px 16px rgba(0,0,0,0.12);">
        
        <!-- Table Scroll Container -->
        <div style="overflow-x:auto;" class="td-scrollbar">
          <table style="width:100%; border-collapse:collapse; min-width:${entries.length * 280 + 220}px;">
            
            <!-- Sticky / Dominant Header with Devices Info -->
            <thead>
              <tr style="background:var(--td-bg-surface-elevated); border-bottom:2px solid var(--td-border);">
                <th style="width:220px; padding:1.25rem 1.5rem; text-align:left; vertical-align:bottom; color:var(--td-text-muted); font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em;">
                  Metric / Domain
                </th>
                ${entries.map(({ device, sampleSize }) => `
                  <th style="width:${colWidthPct}%; padding:1.25rem 1.25rem; text-align:left; vertical-align:top; border-left:1px solid var(--td-border-subtle);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.35rem;">
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
                      <span style="font-size:0.7rem; padding:0.15rem 0.45rem; border-radius:0.25rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle); color:var(--td-text-secondary);">
                        ${esc(device.category || "Hardware")}
                      </span>
                      <span style="font-size:0.7rem; padding:0.15rem 0.45rem; border-radius:0.25rem; background:${sampleSize > 0 ? 'rgba(52, 211, 153, 0.15)' : 'var(--td-bg-card)'}; border:1px solid ${sampleSize > 0 ? 'rgba(52, 211, 153, 0.3)' : 'var(--td-border-subtle)'}; color:${sampleSize > 0 ? 'var(--td-success)' : 'var(--td-text-muted)'};">
                        ${sampleSize} verified tests (n)
                      </span>
                    </div>
                    <div style="display:flex; gap:0.4rem;">
                      <a href="#/devices/${device.id}" style="font-size:0.78rem; font-weight:600; color:var(--td-info); text-decoration:none; padding:0.3rem 0.6rem; border-radius:0.25rem; background:var(--td-info-bg); border:1px solid rgba(96,165,250,0.25);">
                        Dossier →
                      </a>
                      <a href="#/submit?device=${encodeURIComponent(device.id)}" style="font-size:0.78rem; font-weight:600; color:var(--td-text-secondary); text-decoration:none; padding:0.3rem 0.6rem; border-radius:0.25rem; background:var(--td-bg-card); border:1px solid var(--td-border-subtle);">
                        + Submit Test
                      </a>
                    </div>
                  </th>
                `).join("")}
              </tr>
            </thead>

            <!-- Section 1: OVERVIEW -->
            <thead class="compare-section-header">
              <tr style="background:rgba(255,255,255,0.03); border-top:2px solid var(--td-border); border-bottom:1px solid var(--td-border-subtle);">
                <th colspan="${entries.length + 1}" style="padding:0.75rem 1.25rem; text-align:left; color:var(--td-text-primary); font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">
                  1. OVERVIEW <span style="font-size:0.72rem; font-weight:600; color:var(--td-text-muted); text-transform:none; margin-left:0.5rem;">[${DATA_PROVENANCE.PUBLISHED_SPECIFICATION}]</span>
                </th>
              </tr>
            </thead>
            <tbody>
              ${renderTableRow("Brand", entries.map(e => e.device.brand))}
              ${renderTableRow("Model", entries.map(e => e.device.model))}
              ${renderTableRow("Category", entries.map(e => e.device.category ? e.device.category.toUpperCase() : "—"))}
              ${renderTableRow("Release Year", entries.map(e => e.device.releaseYear || "—"))}
              ${renderTableRow("Operating System", entries.map(e => e.device.operatingSystem || "—"))}
            </tbody>

            <!-- Section 2: HARDWARE -->
            <thead class="compare-section-header">
              <tr style="background:rgba(255,255,255,0.03); border-top:2px solid var(--td-border); border-bottom:1px solid var(--td-border-subtle);">
                <th colspan="${entries.length + 1}" style="padding:0.75rem 1.25rem; text-align:left; color:var(--td-text-primary); font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">
                  2. HARDWARE <span style="font-size:0.72rem; font-weight:600; color:var(--td-text-muted); text-transform:none; margin-left:0.5rem;">[${DATA_PROVENANCE.PUBLISHED_SPECIFICATION}]</span>
                </th>
              </tr>
            </thead>
            <tbody>
              ${renderTableRow("Chipset", entries.map(e => e.device.specifications?.processor))}
              ${renderTableRow("Architecture", entries.map(e => e.device.specifications?.architecture || "—"))}
              ${renderTableRow("Battery Capacity", entries.map(e => e.device.specifications?.batteryCapacity))}
              ${renderTableRow("Display", entries.map(e => {
                const s = e.device.specifications;
                if (!s?.display) return "—";
                return `${s.display}${s.resolution ? ` (${s.resolution})` : ''}${s.refreshRate ? ` • ${s.refreshRate}` : ''}`;
              }))}
              ${renderTableRow("Ports & Charging", entries.map(e => {
                const s = e.device.specifications;
                return s?.charging || s?.connectivity || "—";
              }))}
              ${renderTableRow("Repairability Index", entries.map(e => {
                // If official lab experiment has repair verdict, or fallback to "—"
                const repairExp = e.officialResults.find(r => r.category === "repair");
                if (repairExp && repairExp.measurements) {
                  return `Documented in ${repairExp.experimentId.toUpperCase()}`;
                }
                return "—";
              }))}
            </tbody>

            <!-- Section 3: OFFICIAL WDIII RESULTS -->
            <thead class="compare-section-header">
              <tr style="background:rgba(96,165,250,0.06); border-top:2px solid var(--td-border); border-bottom:1px solid var(--td-border-subtle);">
                <th colspan="${entries.length + 1}" style="padding:0.75rem 1.25rem; text-align:left; color:var(--td-info); font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">
                  3. OFFICIAL WDIII RESULTS <span style="font-size:0.72rem; font-weight:600; color:var(--td-info); text-transform:none; margin-left:0.5rem;">[${DATA_PROVENANCE.WDIII_OFFICIAL}]</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row" style="padding:1rem 1.25rem; text-align:left; color:var(--td-text-secondary); font-size:0.85rem; font-weight:600; vertical-align:top; border-right:1px solid var(--td-border-subtle);">
                  Controlled Lab Protocols
                </th>
                ${entries.map(e => `
                  <td style="padding:1rem 1.25rem; text-align:left; vertical-align:top; border-right:1px solid var(--td-border-subtle);">
                    ${renderOfficialLabResultsCell(e)}
                  </td>
                `).join("")}
              </tr>
            </tbody>

            <!-- Section 4: VERIFIED COMMUNITY RESULTS -->
            <thead class="compare-section-header">
              <tr style="background:rgba(52,211,153,0.06); border-top:2px solid var(--td-border); border-bottom:1px solid var(--td-border-subtle);">
                <th colspan="${entries.length + 1}" style="padding:0.75rem 1.25rem; text-align:left; color:var(--td-success); font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">
                  4. VERIFIED COMMUNITY RESULTS <span style="font-size:0.72rem; font-weight:600; color:var(--td-success); text-transform:none; margin-left:0.5rem;">[${DATA_PROVENANCE.VERIFIED_COMMUNITY}]</span>
                </th>
              </tr>
            </thead>
            <tbody>
              ${renderCommunityMetricRow("Battery Runtime (SOT)", entries, "screenOnTimeMinutes")}
              ${renderCommunityMetricRow("Repair Cost", entries, "repairCost")}
              ${renderCommunityMetricRow("Service Turnaround", entries, "turnaroundDays")}
              ${renderCommunityMetricRow("Post-Repair Quality", entries, "qualityRating")}
              ${renderCommunityMetricRow("Peak Operating Temp", entries, "peakTempC")}
              ${renderCommunityMetricRow("Benchmark Throughput", entries, "primaryScore")}
            </tbody>

            <!-- Section 5: TRANSPARENT CATEGORY SCORES -->
            <thead class="compare-section-header">
              <tr style="background:rgba(255,255,255,0.03); border-top:2px solid var(--td-border); border-bottom:1px solid var(--td-border-subtle);">
                <th colspan="${entries.length + 1}" style="padding:0.75rem 1.25rem; text-align:left; color:var(--td-text-primary); font-size:0.85rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">
                  5. CATEGORY SCORES <span style="font-size:0.72rem; font-weight:400; color:var(--td-text-muted); text-transform:none; margin-left:0.5rem;">(Derived purely from comparable verified data)</span>
                </th>
              </tr>
            </thead>
            <tbody>
              ${renderCategoryScoresRow(entries, categoryScores)}
            </tbody>

          </table>
        </div>
      </div>

      <!-- Mobile Responsive Cards Section (Clean UX without Squeezing) -->
      <div class="mobile-only-cards" style="display:none; flex-direction:column; gap:1.25rem; margin-bottom:2rem;">
        ${renderMobileComparisonCards(entries, categoryScores, activeMobileTab)}
      </div>
    `;

    // Re-bind Mobile Tab click triggers if any
    updateMobileTabVisibility();
  }

  function updateMobileTabVisibility() {
    const cards = container.querySelectorAll(".mobile-section-card");
    cards.forEach(c => {
      const section = c.getAttribute("data-section");
      if (section === activeMobileTab) {
        c.style.display = "block";
      } else {
        c.style.display = "none";
      }
    });
  }

  // Initial rendering
  renderSlots();
  await renderComparison();
}

/**
 * Render a standard desktop comparison table row for published specifications.
 */
function renderTableRow(label, values = []) {
  return `
    <tr style="border-bottom:1px solid var(--td-border-subtle);">
      <th scope="row" style="padding:0.75rem 1.25rem; text-align:left; color:var(--td-text-secondary); font-size:0.85rem; font-weight:600; vertical-align:top; border-right:1px solid var(--td-border-subtle);">
        ${esc(label)}
      </th>
      ${values.map(val => `
        <td style="padding:0.75rem 1.25rem; text-align:left; vertical-align:top; border-right:1px solid var(--td-border-subtle);">
          ${formatSpecValue(val)}
        </td>
      `).join("")}
    </tr>
  `;
}

/**
 * Render Official Lab Results cell for a device.
 */
function renderOfficialLabResultsCell(entry) {
  const { officialResults, device } = entry;
  if (!officialResults || officialResults.length === 0) {
    return `<div style="color:var(--td-text-muted); font-style:italic; font-size:0.85rem;">No WDIII data</div>`;
  }

  return `
    <div style="display:flex; flex-direction:column; gap:0.75rem;">
      ${officialResults.map(exp => {
        const hasMeas = Boolean(exp.measurements);
        return `
          <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.375rem; padding:0.75rem;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
              <a href="#/experiments/${exp.experimentId}" style="font-family:monospace; font-size:0.78rem; font-weight:700; color:var(--td-info); text-decoration:none;">
                ${exp.experimentId.toUpperCase()} ↗
              </a>
              <span style="font-size:0.68rem; padding:0.1rem 0.35rem; border-radius:0.2rem; background:rgba(96,165,250,0.12); color:var(--td-info);">
                ${DATA_PROVENANCE.WDIII_OFFICIAL}
              </span>
            </div>
            <div style="font-size:0.82rem; font-weight:600; color:#fff; margin-bottom:0.35rem;">
              ${esc(exp.experimentTitle)}
            </div>

            ${hasMeas ? `
              <div style="font-size:0.78rem; background:var(--td-bg-surface); padding:0.45rem; border-radius:0.25rem; border:1px solid var(--td-border-subtle); margin-top:0.35rem;">
                ${Object.entries(exp.measurements).map(([k, v]) => {
                  if (k === "device") return "";
                  return `
                    <div style="display:flex; justify-content:space-between; gap:0.5rem; margin-bottom:0.15rem;">
                      <span style="color:var(--td-text-muted); text-transform:capitalize;">${esc(k)}:</span>
                      <strong style="color:var(--td-text-primary);">${esc(v)}</strong>
                    </div>
                  `;
                }).join("")}
              </div>
            ` : `
              <div style="font-size:0.75rem; color:var(--td-text-muted); font-style:italic;">
                Tested in protocol context (baseline reference)
              </div>
            `}
          </div>
        `;
      }).join("")}
    </div>
  `;
}

/**
 * Render a verified community statistics row for a metric.
 */
function renderCommunityMetricRow(label, entries = [], metricKey) {
  return `
    <tr style="border-bottom:1px solid var(--td-border-subtle);">
      <th scope="row" style="padding:0.85rem 1.25rem; text-align:left; color:var(--td-text-secondary); font-size:0.85rem; font-weight:600; vertical-align:top; border-right:1px solid var(--td-border-subtle);">
        ${esc(label)}
      </th>
      ${entries.map(e => {
        const metricStat = e.communityMetrics?.[metricKey];
        return `
          <td style="padding:0.85rem 1.25rem; text-align:left; vertical-align:top; border-right:1px solid var(--td-border-subtle);">
            ${renderCommunityMetricCell(metricStat)}
          </td>
        `;
      }).join("")}
    </tr>
  `;
}

/**
 * Format a community metric cell following the exact presentation requirements:
 * Average: X
 * Median: Y
 * Range: A–B
 * Verified tests: n=Z
 */
function renderCommunityMetricCell(metricStat) {
  if (!metricStat || metricStat.count === 0) {
    return `<div style="color:var(--td-text-muted); font-style:italic; font-size:0.85rem;">No verified community data</div>`;
  }

  const n = metricStat.count;
  const avgStr = formatComparisonMetricValue(metricStat, "mean");
  const medianStr = formatComparisonMetricValue(metricStat, "median");
  const rangeStr = formatMetricRange(metricStat);

  return `
    <div style="font-size:0.85rem; line-height:1.45;">
      <div style="margin-bottom:0.2rem;">
        <span style="color:var(--td-text-muted);">Average:</span> <strong style="color:var(--td-text-primary);">${avgStr}</strong>
      </div>
      <div style="margin-bottom:0.2rem;">
        <span style="color:var(--td-text-muted);">Median:</span> <strong style="color:var(--td-text-primary);">${medianStr}</strong>
      </div>
      <div style="margin-bottom:0.2rem;">
        <span style="color:var(--td-text-muted);">Range:</span> <span style="color:var(--td-text-secondary); font-family:monospace;">${rangeStr}</span>
      </div>
      ${metricStat.stdDev !== null && n >= 2 ? `
        <div style="margin-bottom:0.2rem; font-size:0.78rem; color:var(--td-text-muted);">
          <span>Std Dev:</span> ±${metricStat.stdDev.toFixed(2)}
        </div>
      ` : ""}
      <div style="margin-top:0.35rem; display:inline-flex; align-items:center; gap:0.35rem; font-size:0.75rem; font-weight:600; padding:0.1rem 0.4rem; border-radius:0.25rem; background:rgba(52,211,153,0.12); color:var(--td-success); border:1px solid rgba(52,211,153,0.25);">
        <span>Verified tests: n=${n}</span>
        <span style="opacity:0.6;">•</span>
        <span>${metricStat.confidenceLabel}</span>
      </div>
    </div>
  `;
}

/**
 * Render category scores row.
 */
function renderCategoryScoresRow(entries = [], categoryScores = {}) {
  const activeCategories = Object.values(categoryScores).filter(c => c.available);

  if (activeCategories.length === 0) {
    return `
      <tr>
        <td colspan="${entries.length + 1}" style="padding:1.5rem; text-align:center; color:var(--td-text-muted); font-size:0.85rem; font-style:italic;">
          Category scores require comparable verified data across multiple devices. Currently collecting additional community samples.
        </td>
      </tr>
    `;
  }

  return activeCategories.map(cat => `
    <tr style="border-bottom:1px solid var(--td-border-subtle); background:rgba(255,255,255,0.01);">
      <th scope="row" style="padding:1rem 1.25rem; text-align:left; color:var(--td-text-primary); font-size:0.85rem; font-weight:700; vertical-align:top; border-right:1px solid var(--td-border-subtle);">
        <div>${esc(cat.title)}</div>
        <div style="font-size:0.72rem; color:var(--td-text-muted); font-weight:400; margin-top:0.2rem;">${esc(cat.description)}</div>
      </th>
      ${entries.map(e => {
        const scoreData = cat.scores[e.device.id];
        if (!scoreData || scoreData.score === null) {
          return `
            <td style="padding:1rem 1.25rem; text-align:left; vertical-align:top; border-right:1px solid var(--td-border-subtle); color:var(--td-text-muted); font-style:italic; font-size:0.85rem;">
              Insufficient data
            </td>
          `;
        }

        const s = scoreData.score;
        let scoreColor = "var(--td-info)";
        if (s >= 80) scoreColor = "var(--td-success)";
        else if (s < 50) scoreColor = "var(--td-warning)";

        return `
          <td style="padding:1rem 1.25rem; text-align:left; vertical-align:top; border-right:1px solid var(--td-border-subtle);">
            <div style="display:flex; align-items:baseline; gap:0.25rem; margin-bottom:0.25rem;">
              <span style="font-size:1.4rem; font-weight:800; color:${scoreColor};">${s}</span>
              <span style="font-size:0.8rem; color:var(--td-text-muted); font-weight:600;">/ 100</span>
            </div>
            <div style="font-size:0.75rem; color:var(--td-text-muted);">
              Based on: <span style="color:var(--td-text-secondary);">${esc(scoreData.basedOn)}</span>
            </div>
          </td>
        `;
      }).join("")}
    </tr>
  `).join("");
}

/**
 * Render mobile cards ensuring clean browsing without squishing giant desktop tables.
 */
function renderMobileComparisonCards(entries = [], categoryScores = {}, activeTab = "overview") {
  return `
    <!-- Section 1 Mobile Card: Overview -->
    <div class="mobile-section-card" data-section="overview" style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.25rem;">
      <h3 style="color:#fff; font-size:1.1rem; font-weight:700; margin:0 0 1rem; display:flex; align-items:center; gap:0.5rem;">
        <span>📋</span> <span>Overview &amp; Identity</span>
      </h3>
      <div style="display:flex; flex-direction:column; gap:1rem;">
        ${entries.map(e => `
          <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem;">
            <div style="font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--td-info);">${esc(e.device.brand)}</div>
            <h4 style="font-size:1rem; font-weight:700; color:#fff; margin:0.2rem 0 0.5rem;">${esc(e.device.model)}</h4>
            <div style="font-size:0.82rem; color:var(--td-text-secondary); display:grid; grid-template-columns:1fr 1fr; gap:0.4rem;">
              <div>Category: <strong>${esc(e.device.category || '—')}</strong></div>
              <div>Year: <strong>${esc(e.device.releaseYear || '—')}</strong></div>
              <div style="grid-column:1 / -1;">OS: <strong>${esc(e.device.operatingSystem || '—')}</strong></div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- Section 2 Mobile Card: Hardware -->
    <div class="mobile-section-card" data-section="hardware" style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.25rem; display:none;">
      <h3 style="color:#fff; font-size:1.1rem; font-weight:700; margin:0 0 1rem; display:flex; align-items:center; gap:0.5rem;">
        <span>⚙️</span> <span>Hardware Specifications</span>
      </h3>
      <div style="display:flex; flex-direction:column; gap:1rem;">
        ${entries.map(e => `
          <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem;">
            <div style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:0.5rem;">${esc(e.device.brand)} ${esc(e.device.model)}</div>
            <div style="font-size:0.8rem; display:flex; flex-direction:column; gap:0.4rem;">
              <div><span style="color:var(--td-text-muted);">Chipset:</span> <strong>${esc(e.device.specifications?.processor || '—')}</strong></div>
              <div><span style="color:var(--td-text-muted);">Battery:</span> <strong>${esc(e.device.specifications?.batteryCapacity || '—')}</strong></div>
              <div><span style="color:var(--td-text-muted);">Display:</span> <strong>${esc(e.device.specifications?.display || '—')}</strong></div>
              <div><span style="color:var(--td-text-muted);">Ports/Charging:</span> <strong>${esc(e.device.specifications?.charging || '—')}</strong></div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- Section 3 Mobile Card: WDIII Lab Results -->
    <div class="mobile-section-card" data-section="wdiii" style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.25rem; display:none;">
      <h3 style="color:var(--td-info); font-size:1.1rem; font-weight:700; margin:0 0 1rem; display:flex; align-items:center; gap:0.5rem;">
        <span>🔬</span> <span>Official WDIII Results</span>
      </h3>
      <div style="display:flex; flex-direction:column; gap:1rem;">
        ${entries.map(e => `
          <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem;">
            <div style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:0.5rem;">${esc(e.device.brand)} ${esc(e.device.model)}</div>
            ${renderOfficialLabResultsCell(e)}
          </div>
        `).join("")}
      </div>
    </div>

    <!-- Section 4 Mobile Card: Community Data -->
    <div class="mobile-section-card" data-section="community" style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.25rem; display:none;">
      <h3 style="color:var(--td-success); font-size:1.1rem; font-weight:700; margin:0 0 1rem; display:flex; align-items:center; gap:0.5rem;">
        <span>🧪</span> <span>Verified Community Results</span>
      </h3>
      <div style="display:flex; flex-direction:column; gap:1rem;">
        ${entries.map(e => `
          <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem;">
            <div style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:0.75rem;">${esc(e.device.brand)} ${esc(e.device.model)}</div>
            <div style="display:flex; flex-direction:column; gap:0.75rem;">
              <div>
                <div style="font-size:0.75rem; font-weight:700; color:var(--td-text-muted); text-transform:uppercase;">Battery Runtime (SOT)</div>
                ${renderCommunityMetricCell(e.communityMetrics?.screenOnTimeMinutes)}
              </div>
              <div>
                <div style="font-size:0.75rem; font-weight:700; color:var(--td-text-muted); text-transform:uppercase;">Repair Cost</div>
                ${renderCommunityMetricCell(e.communityMetrics?.repairCost)}
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- Section 5 Mobile Card: Category Scores -->
    <div class="mobile-section-card" data-section="scores" style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.75rem; padding:1.25rem; display:none;">
      <h3 style="color:#fff; font-size:1.1rem; font-weight:700; margin:0 0 1rem; display:flex; align-items:center; gap:0.5rem;">
        <span>📊</span> <span>Category Scores</span>
      </h3>
      <div style="display:flex; flex-direction:column; gap:1rem;">
        ${entries.map(e => `
          <div style="background:var(--td-bg-card); border:1px solid var(--td-border-subtle); border-radius:0.5rem; padding:1rem;">
            <div style="font-size:0.95rem; font-weight:700; color:#fff; margin-bottom:0.75rem;">${esc(e.device.brand)} ${esc(e.device.model)}</div>
            ${Object.values(categoryScores).filter(c => c.available).map(cat => {
              const sc = cat.scores[e.device.id];
              return `
                <div style="margin-bottom:0.6rem;">
                  <div style="font-size:0.78rem; font-weight:600; color:var(--td-text-primary);">${esc(cat.title)}</div>
                  ${sc && sc.score !== null ? `
                    <div style="font-size:1.1rem; font-weight:800; color:var(--td-info);">${sc.score}/100</div>
                    <div style="font-size:0.72rem; color:var(--td-text-muted);">Based on: ${esc(sc.basedOn)}</div>
                  ` : `
                    <div style="font-size:0.75rem; color:var(--td-text-muted); font-style:italic;">Insufficient data</div>
                  `}
                </div>
              `;
            }).join("")}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

/**
 * Responsive CSS injection to toggle desktop table vs clean mobile view
 */
function injectCompareStyles() {
  if (document.getElementById("wdiiiCompareStyles")) return;
  const style = document.createElement("style");
  style.id = "wdiiiCompareStyles";
  style.textContent = `
    @media (max-width: 768px) {
      .desktop-only-table {
        display: none !important;
      }
      .mobile-only {
        display: flex !important;
      }
      .mobile-only-cards {
        display: flex !important;
      }
    }
    @media (min-width: 769px) {
      .desktop-only-table {
        display: block !important;
      }
      .mobile-only {
        display: none !important;
      }
      .mobile-only-cards {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

/**
 * Extract device IDs from URL Hash (#/compare?devices=id1,id2,id3)
 */
function getDeviceIdsFromHash() {
  const hash = window.location.hash || "";
  if (!hash.includes("/compare")) return [];

  const qIdx = hash.indexOf("?");
  if (qIdx !== -1) {
    const query = hash.slice(qIdx + 1);
    const params = new URLSearchParams(query);
    const devsParam = params.get("devices");
    if (devsParam) {
      return devsParam.split(",").map(s => s.trim()).filter(Boolean);
    }
  }

  // Path fallback syntax #/compare/id1/vs/id2
  const clean = hash.replace(/^#\/compare\/?/, "");
  if (clean.includes("/vs/")) {
    return clean.split("/vs/").map(s => s.trim()).filter(Boolean);
  }

  return [];
}

/**
 * Toast Notification Helper
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
  `;
  toast.innerHTML = `<span>✓</span> <span>${esc(message)}</span>`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}
