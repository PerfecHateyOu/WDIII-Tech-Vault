/**
 * WDIII Tech Vault - Step 5 Device Comparison Test Suite
 * Validates compare view module logic, route registration, and data rendering
 */

import { getDevices, getDeviceById, getApprovedSubmissionsForDevice } from "../src/services/database.js";
import { readFileSync } from "fs";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
    failed++;
  }
}

console.log("======================================================");
console.log("   WDIII TECH VAULT - STEP 5 DEVICE COMPARISON AUDIT  ");
console.log("======================================================");

// 1. Static file check
console.log("\n--- 1. File Structure & Module Integrity ---");
const compareViewSrc = readFileSync("src/ui/compare-view.js", "utf8");
const indexHtmlSrc = readFileSync("index.html", "utf8");

assert(compareViewSrc.includes("export async function renderCompareView"), "compare-view.js exports renderCompareView");
assert(compareViewSrc.includes('import { getDevices, getDeviceById, getApprovedSubmissionsForDevice } from "../services/database.js"'), "Imports verified database functions");
assert(!compareViewSrc.includes("getAllDevices"), "Does NOT call non-existent getAllDevices");
assert(indexHtmlSrc.includes('import { renderCompareView } from "/src/ui/compare-view.js"'), "index.html imports renderCompareView");
assert(indexHtmlSrc.includes('id="page-compare"'), "index.html includes #page-compare element");
assert(indexHtmlSrc.includes('id="comparePageContent"'), "index.html includes #comparePageContent element");
assert(indexHtmlSrc.includes('route === "/compare"'), "index.html router maps /compare");
assert(indexHtmlSrc.includes('#/compare'), "index.html includes links to #/compare");

// 2. Database services compatibility
console.log("\n--- 2. Database Service Integration ---");
const devices = await getDevices();
assert(devices.length >= 30, `getDevices() returned ${devices.length} devices (>= 30 required)`);

const dev1 = await getDeviceById("apple-iphone-17-pro-max");
assert(dev1 !== null && dev1.brand === "Apple", "getDeviceById('apple-iphone-17-pro-max') successfully retrieved");

const dev2 = await getDeviceById("samsung-galaxy-s26-ultra");
assert(dev2 !== null && dev2.brand === "Samsung", "getDeviceById('samsung-galaxy-s26-ultra') successfully retrieved");

const dev3 = await getDeviceById("google-pixel-10-pro");
assert(dev3 !== null && dev3.brand === "Google", "getDeviceById('google-pixel-10-pro') successfully retrieved");

// 3. Community submissions query
console.log("\n--- 3. Community Submissions Retrieval ---");
const subs1 = await getApprovedSubmissionsForDevice("apple-iphone-17-pro-max");
assert(Array.isArray(subs1), "getApprovedSubmissionsForDevice returns array for iPhone 17 Pro Max");

const subs2 = await getApprovedSubmissionsForDevice("samsung-galaxy-s26-ultra");
assert(Array.isArray(subs2), "getApprovedSubmissionsForDevice returns array for S26 Ultra");

// 4. Verification of specification fields across compared devices
console.log("\n--- 4. Specification Comparison Data Extraction ---");
const specKeys = ["processor", "ram", "storage", "display", "resolution", "refreshRate", "batteryCapacity", "charging", "cameras", "weight"];
for (const key of specKeys) {
  const val1 = dev1.specifications?.[key];
  const val2 = dev2.specifications?.[key];
  const val3 = dev3.specifications?.[key];
  assert(val1 !== undefined && val2 !== undefined && val3 !== undefined, `Specification key '${key}' safely exists across flagship shootout trio`);
}

// 5. Experiment linking
console.log("\n--- 5. Official Experiment Cross-Linking ---");
const sharedExps = (dev1.experimentsInvolved || []).filter(e => (dev2.experimentsInvolved || []).includes(e));
assert(sharedExps.includes("exp1"), "Device comparison correctly identifies shared WDIII Experiment 1 (Apple vs Samsung Repair)");

console.log("\n======================================================");
console.log(`Comparison Audit Results: ${passed} Passed, ${failed} Failed`);
console.log("======================================================");

if (failed > 0) process.exit(1);
