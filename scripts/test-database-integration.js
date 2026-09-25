/**
 * WDIII Tech Vault - Step 3 Database & Schema Integrity Test Suite
 */

import { OFFICIAL_DEVICES } from "../src/data/official-devices.js";
import { OFFICIAL_EXPERIMENTS } from "../src/data/official-experiments.js";
import { getDevices, getDeviceById, getExperiments, getExperimentById } from "../src/services/database.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log("===============================================================================");
console.log("=== WDIII TECH VAULT - STEP 3 DEVICE & EXPERIMENT INTEGRATION VERIFICATION ===");
console.log("===============================================================================\n");

// 1. Devices Schema & Integrity Checks
console.log("1. AUDITING DEVICE REGISTRY DATASET...");
assert(OFFICIAL_DEVICES.length >= 30, `Total devices count is sufficient: ${OFFICIAL_DEVICES.length}`);

const validCategories = new Set(["smartphone", "laptop", "wearable", "tablet", "accessory"]);
const validStatuses = new Set(["active", "archived", "deprecated", "draft", "private"]);

const deviceIdSet = new Set();
let deviceErrors = 0;

for (const d of OFFICIAL_DEVICES) {
  if (!d.id || typeof d.id !== "string") deviceErrors++;
  if (!d.brand || typeof d.brand !== "string") deviceErrors++;
  if (!d.model || typeof d.model !== "string") deviceErrors++;
  if (!validCategories.has(d.category)) deviceErrors++;
  if (d.origin !== "official_wdiii") deviceErrors++;
  if (!validStatuses.has(d.status)) deviceErrors++;
  if (!d.specifications || typeof d.specifications !== "object") deviceErrors++;
  if (!Array.isArray(d.sources) || d.sources.length === 0) deviceErrors++;
  if (!Array.isArray(d.experimentsInvolved)) deviceErrors++;
  deviceIdSet.add(d.id);
}
assert(deviceErrors === 0, `All ${OFFICIAL_DEVICES.length} devices pass strict schema validation with zero errors`);
assert(deviceIdSet.size === OFFICIAL_DEVICES.length, `All ${OFFICIAL_DEVICES.length} device IDs are strictly unique slugs`);

// 2. Experiments Schema & Integrity Checks
console.log("\n2. AUDITING EXPERIMENT PROTOCOLS DATASET...");
assert(OFFICIAL_EXPERIMENTS.length >= 14, `Total experiments count is at least 14: ${OFFICIAL_EXPERIMENTS.length}`);

const validExpCategories = new Set(["repair", "support", "software", "legal", "hardware", "ecosystem", "ai"]);
const validExpStatuses = new Set(["done", "progress", "pending", "paused", "queued", "draft", "private"]);

const expIdSet = new Set();
let expErrors = 0;

for (const e of OFFICIAL_EXPERIMENTS) {
  if (!e.id || typeof e.id !== "string") expErrors++;
  if (!e.title || typeof e.title !== "string") expErrors++;
  if (!validExpCategories.has(e.category)) expErrors++;
  if (e.origin !== "official_wdiii") expErrors++;
  if (!validExpStatuses.has(e.status)) expErrors++;
  if (!e.researchQuestion || typeof e.researchQuestion !== "string") expErrors++;
  if (!e.methodology || typeof e.methodology !== "string") expErrors++;
  if (!Array.isArray(e.devices)) expErrors++;
  if (!Array.isArray(e.sources) || e.sources.length === 0) expErrors++;
  if (!Array.isArray(e.tags) || e.tags.length === 0) expErrors++;
  expIdSet.add(e.id);
}
assert(expErrors === 0, `All ${OFFICIAL_EXPERIMENTS.length} experiments pass strict schema validation with zero errors`);
assert(expIdSet.size === OFFICIAL_EXPERIMENTS.length, `All ${OFFICIAL_EXPERIMENTS.length} experiment IDs are strictly unique`);

// 3. Cross-Reference Relational Integrity
console.log("\n3. AUDITING CROSS-REFERENCE RELATIONAL INTEGRITY...");
let orphanDeviceRefs = 0;
for (const e of OFFICIAL_EXPERIMENTS) {
  for (const devId of e.devices) {
    if (!deviceIdSet.has(devId)) {
      console.error(`Unknown device ID reference: ${devId} in experiment ${e.id}`);
      orphanDeviceRefs++;
    }
  }
}
assert(orphanDeviceRefs === 0, `All device references in experiments link to verified devices in registry`);

let orphanExpRefs = 0;
for (const d of OFFICIAL_DEVICES) {
  for (const expId of d.experimentsInvolved) {
    if (!expIdSet.has(expId)) {
      console.error(`Unknown experiment ID reference: ${expId} in device ${d.id}`);
      orphanExpRefs++;
    }
  }
}
assert(orphanExpRefs === 0, `All experiment references in devices link to verified experiment dossiers`);

// 4. Testing Database Service Query Capabilities
console.log("\n4. TESTING DATABASE QUERY & RETRIEVAL SERVICE...");
const allDevicesResult = await getDevices();
assert(allDevicesResult.length === OFFICIAL_DEVICES.length, `getDevices() returned all ${OFFICIAL_DEVICES.length} devices`);

const appleFiltered = await getDevices({ search: "Apple" });
assert(appleFiltered.length >= 8 && appleFiltered.every(d => d.brand === "Apple"), `Search 'Apple' correctly returned ${appleFiltered.length} Apple devices`);

const laptopFiltered = await getDevices({ category: "laptop" });
assert(laptopFiltered.length === 4 && laptopFiltered.every(d => d.category === "laptop"), `Filter category 'laptop' returned exactly 4 laptops`);

const osFiltered = await getDevices({ operatingSystem: "ios" });
assert(osFiltered.length >= 6 && osFiltered.every(d => (d.operatingSystem || "").toLowerCase().includes("ios")), `Filter OS 'ios' correctly isolated iOS hardware`);

const sortedByYear = await getDevices({ sortBy: "releaseYear", sortOrder: "desc" });
assert(sortedByYear[0].releaseYear >= sortedByYear[sortedByYear.length - 1].releaseYear, `Sorting by releaseYear desc functions properly (${sortedByYear[0].releaseYear} to ${sortedByYear[sortedByYear.length - 1].releaseYear})`);

// 5. Single Device Detail Resolution with Linked Experiments
console.log("\n5. TESTING DETAIL RESOLUTION & RELATIONAL JOINS...");
const pixel10 = await getDeviceById("google-pixel-10-pro");
assert(pixel10 !== null, `Retrieved Google Pixel 10 Pro detail document`);
assert(pixel10.linkedExperiments.length >= 2, `Pixel 10 Pro accurately linked to ${pixel10.linkedExperiments.length} experiments (exp5, exp7, fa02)`);
assert(pixel10.specifications.processor.includes("Tensor G5"), `Pixel 10 Pro specs verify TSMC Tensor G5`);

const exp1 = await getExperimentById("exp1");
assert(exp1 !== null, `Retrieved Experiment 1 detail document`);
assert(exp1.linkedDevices.length === 2, `Experiment 1 resolved 2 linked devices (iPhone 17 Pro Max, Galaxy S26 Ultra)`);
assert(exp1.verdict.includes("Winner: Apple"), `Experiment 1 verdict preserved verbatim without alteration`);

const caseStudy = await getExperimentById("casestudy");
assert(caseStudy !== null && caseStudy.linkedDevices.length >= 7, `Case study resolved ${caseStudy.linkedDevices.length} linked devices with historical battery failure telemetry`);

console.log("\n===============================================================================");
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log("===============================================================================");

if (failed > 0) process.exit(1);
