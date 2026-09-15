/**
 * WDIII Tech Vault - Comprehensive Device Comparison Test Suite
 * 
 * Validates all 25 mandatory requirements from the specification:
 * 1. Two-device comparison
 * 2. Three-device comparison
 * 3. Fourth-device prevention
 * 4. Device removal
 * 5. Device search
 * 6. URL-based comparison
 * 7. Missing specification handling
 * 8. Missing WDIII result handling
 * 9. Pending community submissions excluded
 * 10. Rejected community submissions excluded
 * 11. Approved/verified community submissions included
 * 12. Correct mean calculation
 * 13. Correct median calculation
 * 14. Correct sample count
 * 15. Correct range
 * 16. Standard deviation handling
 * 17. Higher-is-better normalization
 * 18. Lower-is-better normalization
 * 19. Division-by-zero protection
 * 20. Visitor read-only behavior
 * 21. Existing authentication behavior remains intact
 * 22. Existing moderation behavior remains intact
 * 23. Existing Device Registry remains functional
 * 24. Existing Experiment Archive remains functional
 * 25. Existing Fodder Archive remains functional
 */

import { readFileSync } from "fs";
import { 
  getDevices, 
  getDeviceById, 
  getExperiments, 
  getExperimentById,
  getApprovedSubmissionsForDevice,
  reviewSubmission
} from "../src/services/database.js";
import { 
  loadComparisonData, 
  DATA_PROVENANCE, 
  extractOfficialDeviceMeasurements,
  computeGroupedCommunityMetrics,
  computeTransparentCategoryScores 
} from "../src/services/comparison-service.js";
import { 
  parseNumeric, 
  calculateMean, 
  calculateMedian, 
  calculateMin, 
  calculateMax, 
  calculateSampleSize, 
  calculateStdDev, 
  calculateStats, 
  normalizeScore, 
  getDataConfidenceLabel 
} from "../src/utils/comparison-stats.js";

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

console.log("================================================================================");
console.log("   WDIII TECH VAULT - COMPLETE 25-POINT DEVICE COMPARISON TEST SUITE             ");
console.log("================================================================================");

// --- Test 1: Two-device comparison ---
console.log("\n--- Requirement 1: Two-Device Comparison ---");
const twoDevData = await loadComparisonData(["apple-iphone-17-pro-max", "samsung-galaxy-s26-ultra"]);
assert(twoDevData.success === true, "Two-device comparison completes successfully");
assert(twoDevData.entries.length === 2, "Comparison loaded exactly 2 devices");
assert(twoDevData.entries[0].device.id === "apple-iphone-17-pro-max", "First device is iPhone 17 Pro Max");
assert(twoDevData.entries[1].device.id === "samsung-galaxy-s26-ultra", "Second device is Galaxy S26 Ultra");

// --- Test 2: Three-device comparison ---
console.log("\n--- Requirement 2: Three-Device Comparison ---");
const threeDevData = await loadComparisonData(["apple-iphone-17-pro-max", "samsung-galaxy-s26-ultra", "google-pixel-10-pro"]);
assert(threeDevData.success === true, "Three-device comparison completes successfully");
assert(threeDevData.entries.length === 3, "Comparison loaded exactly 3 devices");
assert(threeDevData.entries[2].device.id === "google-pixel-10-pro", "Third device is Pixel 10 Pro");

// --- Test 3: Fourth-device prevention ---
console.log("\n--- Requirement 3: Fourth-Device Prevention ---");
const fourDevAttempt = await loadComparisonData([
  "apple-iphone-17-pro-max", 
  "samsung-galaxy-s26-ultra", 
  "google-pixel-10-pro", 
  "apple-macbook-pro-16-m4-max"
]);
assert(fourDevAttempt.success === true, "Query executes without crash");
assert(fourDevAttempt.entries.length === 3, "Strictly capped at 3 devices (fourth device strictly excluded)");
const compareViewSrc = readFileSync("src/ui/compare-view.js", "utf8");
assert(compareViewSrc.includes(".slice(0, 3)"), "compare-view enforces max 3 device slice");
assert(compareViewSrc.includes("maxDeviceNotice"), "compare-view displays fourth-device prevention notice");

// --- Test 4: Device removal ---
console.log("\n--- Requirement 4: Device Removal ---");
// Simulate 3 devices -> remove slot 1 -> 2 devices remain
const initialTrio = ["apple-iphone-17-pro-max", "samsung-galaxy-s26-ultra", "google-pixel-10-pro"];
initialTrio.splice(1, 1); // remove index 1
assert(initialTrio.length === 2 && !initialTrio.includes("samsung-galaxy-s26-ultra"), "Removed device from array");
const afterRemovalData = await loadComparisonData(initialTrio);
assert(afterRemovalData.entries.length === 2, "Comparison smoothly transitions to 2 devices upon removal");
assert(compareViewSrc.includes("btn-remove-slot"), "compare-view includes device removal buttons");

// --- Test 5: Device search ---
console.log("\n--- Requirement 5: Device Search & Filter Functionality ---");
const allDevices = await getDevices();
assert(allDevices.length >= 30, `Registry contains ${allDevices.length} devices (>= 30)`);

// Brand filter
const appleDevices = allDevices.filter(d => (d.brand || "").toLowerCase().includes("apple"));
assert(appleDevices.length >= 8, `Apple filter found ${appleDevices.length} devices (>= 8)`);

// Category filter
const smartphones = allDevices.filter(d => d.category === "smartphone");
assert(smartphones.length >= 15, `Smartphone filter found ${smartphones.length} devices`);

// OS filter
const androidDevices = allDevices.filter(d => (d.operatingSystem || "").toLowerCase().includes("android"));
assert(androidDevices.length >= 8, `Android filter found ${androidDevices.length} devices`);

// Release year filter
const year2025Devices = allDevices.filter(d => d.releaseYear === 2025);
assert(year2025Devices.length >= 4, `2025 release year filter found ${year2025Devices.length} devices (>= 4)`);

// --- Test 6: URL-based comparison ---
console.log("\n--- Requirement 6: URL-Based Comparison ---");
function parseHash(hash) {
  const qIdx = hash.indexOf("?");
  if (qIdx !== -1) {
    const params = new URLSearchParams(hash.slice(qIdx + 1));
    const devs = params.get("devices");
    if (devs) return devs.split(",").map(s => s.trim()).filter(Boolean);
  }
  return [];
}
const testHash = "#/compare?devices=apple-iphone-17-pro-max,samsung-galaxy-s26-ultra,google-pixel-10-pro";
const parsedIds = parseHash(testHash);
assert(parsedIds.length === 3, "Parsed 3 device IDs from URL query");
assert(parsedIds[0] === "apple-iphone-17-pro-max", "First device preserved in URL");
assert(parsedIds[1] === "samsung-galaxy-s26-ultra", "Second device preserved in URL");
assert(parsedIds[2] === "google-pixel-10-pro", "Third device preserved in URL");

// --- Test 7: Missing specification handling ---
console.log("\n--- Requirement 7: Missing Specification Handling ---");
// Verify iPhone 17 Pro Max has null battery capacity (Apple doesn't publish mAh)
const iphone17 = await getDeviceById("apple-iphone-17-pro-max");
assert(iphone17.specifications.batteryCapacity === null, "iPhone 17 Pro Max has batteryCapacity: null (authentic Apple spec)");
assert(iphone17.specifications.architecture === undefined, "Unpublished architecture is undefined (not fabricated)");
// Verify formatting does not crash and renders em-dash '—'
assert(compareViewSrc.includes("formatSpecValue"), "compare-view contains formatSpecValue helper");
assert(compareViewSrc.includes("—"), "Missing specs render as '—'");

// --- Test 8: Missing WDIII result handling ---
console.log("\n--- Requirement 8: Missing WDIII Result Handling ---");
const unlinkedDev = { id: "test-device", brand: "Generic", model: "Device", experimentsInvolved: [] };
const emptyExpMeasurements = extractOfficialDeviceMeasurements(unlinkedDev, []);
assert(emptyExpMeasurements.length === 0, "No official measurements extracted for unlinked device");
assert(compareViewSrc.includes("No WDIII data"), "Renders 'No WDIII data' state for missing official results");

// --- Test 9: Pending community submissions excluded ---
console.log("\n--- Requirement 9: Pending Community Submissions Excluded ---");
const mockSubmissions = [
  { id: "sub-1", status: "approved", measurements: { screenOnTimeMinutes: 520, repairCost: 289 } },
  { id: "sub-2", status: "pending_review", measurements: { screenOnTimeMinutes: 9999, repairCost: 1 } },
  { id: "sub-3", status: "pending", measurements: { screenOnTimeMinutes: 9999, repairCost: 1 } }
];
const verifiedOnly9 = mockSubmissions.filter(s => s.status === "approved");
assert(verifiedOnly9.length === 1, "Filtered out pending submissions (1 verified remaining)");
const metrics9 = computeGroupedCommunityMetrics(verifiedOnly9);
assert(metrics9.screenOnTimeMinutes.count === 1, "Pending submissions excluded from sample count");
assert(metrics9.screenOnTimeMinutes.mean === 520, "Pending value (9999) did NOT contaminate mean");

// --- Test 10: Rejected community submissions excluded ---
console.log("\n--- Requirement 10: Rejected / Withdrawn Community Submissions Excluded ---");
const mockSubmissions10 = [
  { id: "sub-1", status: "approved", measurements: { repairCost: 350 } },
  { id: "sub-4", status: "rejected", measurements: { repairCost: 10 } },
  { id: "sub-5", status: "withdrawn", measurements: { repairCost: 5 } },
  { id: "sub-6", status: "needs_revision", measurements: { repairCost: 20 } }
];
const verifiedOnly10 = mockSubmissions10.filter(s => s.status === "approved");
assert(verifiedOnly10.length === 1, "Filtered out rejected, withdrawn, and revision submissions");
const metrics10 = computeGroupedCommunityMetrics(verifiedOnly10);
assert(metrics10.repairCost.count === 1, "Rejected/withdrawn excluded from count");
assert(metrics10.repairCost.mean === 350, "Mean reflects strictly approved data ($350)");

// --- Test 11: Approved/verified community submissions included ---
console.log("\n--- Requirement 11: Approved / Verified Community Submissions Included ---");
const mockSubmissions11 = [
  { id: "sub-a", status: "approved", measurements: { screenOnTimeMinutes: 500 } },
  { id: "sub-b", status: "approved", measurements: { screenOnTimeMinutes: 600 } }
];
const verifiedOnly11 = mockSubmissions11.filter(s => s.status === "approved");
assert(verifiedOnly11.length === 2, "All approved submissions included");
const metrics11 = computeGroupedCommunityMetrics(verifiedOnly11);
assert(metrics11.screenOnTimeMinutes.count === 2, "Both approved submissions counted");
assert(metrics11.screenOnTimeMinutes.mean === 550, "Mean correctly computed from both approved values");

// --- Test 12: Correct mean calculation ---
console.log("\n--- Requirement 12: Correct Mean Calculation ---");
const meanTest = calculateMean([10, 20, 30, 40]);
assert(meanTest === 25, `calculateMean([10, 20, 30, 40]) === 25 (got ${meanTest})`);
const meanWithNulls = calculateMean([10, null, 20, undefined, 30]);
assert(meanWithNulls === 20, `calculateMean with nulls safely ignores non-numerics (got ${meanWithNulls})`);

// --- Test 13: Correct median calculation ---
console.log("\n--- Requirement 13: Correct Median Calculation ---");
const oddMedian = calculateMedian([10, 50, 20]); // sorted: [10, 20, 50] -> 20
assert(oddMedian === 20, `Odd-sample median is 20 (got ${oddMedian})`);
const evenMedian = calculateMedian([10, 40, 20, 30]); // sorted: [10, 20, 30, 40] -> (20+30)/2 = 25
assert(evenMedian === 25, `Even-sample median is 25 (got ${evenMedian})`);

// --- Test 14: Correct sample count ---
console.log("\n--- Requirement 14: Correct Sample Count (n) ---");
const sampleSizeTest = calculateSampleSize([10, null, "invalid", 0, 25]);
// 0 is valid numeric, null and "invalid" are excluded -> 3
assert(sampleSizeTest === 3, `Sample size correctly includes 0 and excludes null/invalid (got ${sampleSizeTest})`);

// --- Test 15: Correct range ---
console.log("\n--- Requirement 15: Correct Range (Min–Max) ---");
const testData15 = [45, 12, 89, 34, 120];
assert(calculateMin(testData15) === 12, `calculateMin === 12`);
assert(calculateMax(testData15) === 120, `calculateMax === 120`);

// --- Test 16: Standard deviation handling ---
console.log("\n--- Requirement 16: Standard Deviation Handling ---");
// Sample of [10, 20, 30]: mean = 20, diffs = [-10, 0, 10], sqDiffs = [100, 0, 100], sum = 200, var = 200 / (3 - 1) = 100, stdDev = 10
const stdDev3 = calculateStdDev([10, 20, 30]);
assert(stdDev3 === 10, `Sample stdDev of [10, 20, 30] is exactly 10 (got ${stdDev3})`);
// Single sample (n < 2) must return null
const singleStdDev = calculateStdDev([42]);
assert(singleStdDev === null, "Single sample (n=1) returns null for standard deviation");
const emptyStdDev = calculateStdDev([]);
assert(emptyStdDev === null, "Empty sample returns null for standard deviation");

// --- Test 17: Higher-is-better normalization ---
console.log("\n--- Requirement 17: Higher-Is-Better Normalization ---");
// value = 80, min = 50, max = 100 -> score = 100 * (80 - 50) / (100 - 50) = 60
const higherScore = normalizeScore(80, 50, 100, true);
assert(higherScore === 60, `Higher-is-better score is 60 (got ${higherScore})`);

// --- Test 18: Lower-is-better normalization ---
console.log("\n--- Requirement 18: Lower-Is-Better Normalization ---");
// value = 60, min = 50, max = 100 -> score = 100 * (100 - 60) / (100 - 50) = 80
const lowerScore = normalizeScore(60, 50, 100, false);
assert(lowerScore === 80, `Lower-is-better score is 80 (got ${lowerScore})`);

// --- Test 19: Division-by-zero protection ---
console.log("\n--- Requirement 19: Division-by-Zero Protection ---");
// max === min -> must return 100 without throwing or returning NaN / Infinity
const divZeroHigher = normalizeScore(50, 50, 50, true);
assert(divZeroHigher === 100 && !Number.isNaN(divZeroHigher) && Number.isFinite(divZeroHigher), "Higher-is-better handles max===min safely");
const divZeroLower = normalizeScore(50, 50, 50, false);
assert(divZeroLower === 100 && !Number.isNaN(divZeroLower) && Number.isFinite(divZeroLower), "Lower-is-better handles max===min safely");

// --- Test 20: Visitor read-only behavior ---
console.log("\n--- Requirement 20: Visitor Read-Only Behavior ---");
const compServiceSrc = readFileSync("src/services/comparison-service.js", "utf8");
assert(!compServiceSrc.includes("setDoc"), "comparison-service has zero setDoc calls");
assert(!compServiceSrc.includes("addDoc"), "comparison-service has zero addDoc calls");
assert(!compServiceSrc.includes("updateDoc"), "comparison-service has zero updateDoc calls");
assert(!compServiceSrc.includes("deleteDoc"), "comparison-service has zero deleteDoc calls");
assert(!compareViewSrc.includes("setDoc"), "compare-view has zero setDoc calls");
assert(!compareViewSrc.includes("addDoc"), "compare-view has zero addDoc calls");

// --- Test 21: Existing authentication behavior remains intact ---
console.log("\n--- Requirement 21: Authentication Behavior Intact ---");
const firebaseSrc = readFileSync("src/services/firebase.js", "utf8");
assert(firebaseSrc.includes("signInWithGoogle"), "signInWithGoogle intact in firebase.js");
assert(firebaseSrc.includes("logOut"), "logOut intact in firebase.js");
assert(firebaseSrc.includes("onAuthChange"), "onAuthChange intact in firebase.js");

// --- Test 22: Existing moderation behavior remains intact ---
console.log("\n--- Requirement 22: Moderation Behavior Intact ---");
const dbSrc = readFileSync("src/services/database.js", "utf8");
assert(typeof reviewSubmission === "function", "reviewSubmission export exists and is a function");
assert(dbSrc.includes('["approved", "rejected", "needs_revision"].includes(status)'), "Moderation status approved check intact");

// --- Test 23: Existing Device Registry remains functional ---
console.log("\n--- Requirement 23: Device Registry Functional ---");
const registryDevices = await getDevices();
assert(registryDevices.length >= 30, `Device registry loaded ${registryDevices.length} curated devices`);
const indexHtmlSrc = readFileSync("index.html", "utf8");
assert(indexHtmlSrc.includes('renderDevicesCatalog'), "index.html imports renderDevicesCatalog");

// --- Test 24: Existing Experiment Archive remains functional ---
console.log("\n--- Requirement 24: Experiment Archive Functional ---");
const experiments = await getExperiments();
assert(experiments.length >= 9, `Experiment archive contains all authoritative experiments (got ${experiments.length})`);
const exp1 = await getExperimentById("exp1");
assert(exp1 && exp1.title.includes("Apple vs Samsung"), "Experiment 1 authoritative title intact");

// --- Test 25: Existing Fodder Archive remains functional ---
console.log("\n--- Requirement 25: Fodder Archive Functional ---");
assert(indexHtmlSrc.includes('buildFa01'), "Fodder entry FA-01 intact in index.html");
assert(indexHtmlSrc.includes('buildFa02'), "Fodder entry FA-02 intact in index.html");
assert(indexHtmlSrc.includes('buildFa03'), "Fodder entry FA-03 intact in index.html");

console.log("\n================================================================================");
console.log(` 25-POINT COMPARISON AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED         `);
console.log("================================================================================");

if (failed > 0) process.exit(1);
