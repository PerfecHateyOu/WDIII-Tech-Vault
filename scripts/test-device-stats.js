/**
 * Step 6 Validation Test Suite: Community Statistics (device_stats) Aggregation
 * 
 * Verifies:
 * 1. Descriptive statistical calculations: Sample size (n), Arithmetic Mean, Median, Variance, Standard Deviation
 * 2. Edge cases: Empty dataset (n=0), single sample (n=1), even/odd distributions, strings & formatted values
 * 3. Security boundaries: Only submissions with status === "approved" are aggregated.
 *    Pending, rejected, needs_revision, and withdrawn submissions are strictly excluded.
 * 4. Metric extractions across standard and custom measurement schemas.
 * 5. Formatting utilities and high-level KPI summaries.
 */

import {
  parseNumericValue,
  calculateMetricStats,
  extractMetricValue,
  computeDeviceCommunityStats,
  formatMetricValue,
  KNOWN_METRIC_CONFIGS
} from "../src/services/device-stats.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

function assertClose(actual, expected, tolerance = 0.001, message) {
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    passed++;
    console.log(`  ✓ ${message} (expected ${expected}, got ${actual})`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message} (expected ${expected}, got ${actual}, diff ${diff})`);
  }
}

console.log("================================================================================");
console.log("  WDIII TECH VAULT - STEP 6: COMMUNITY STATISTICS (device_stats) TEST SUITE     ");
console.log("================================================================================\n");

// ============================================================================
// TEST 1: Numeric Parsing
// ============================================================================
console.log("--- TEST GROUP 1: Numeric Parsing Robustness ---");
assert(parseNumericValue(42) === 42, "Direct number 42 parses to 42");
assert(parseNumericValue(0) === 0, "Zero parses to 0");
assert(parseNumericValue(-15.5) === -15.5, "Negative number parses correctly");
assert(parseNumericValue("349.99") === 349.99, "Numeric string '349.99' parses to 349.99");
assert(parseNumericValue("$450.00") === 450, "Currency string '$450.00' parses to 450");
assert(parseNumericValue("1,250.50") === 1250.50, "Comma formatted string '1,250.50' parses correctly");
assert(parseNumericValue({ value: 520, unit: "Minutes" }) === 520, "Object shape { value: 520, unit: 'Minutes' } parses to 520");
assert(parseNumericValue({ value: "$120.00" }) === 120, "Object shape with currency string parses to 120");
assert(parseNumericValue(null) === null, "null returns null");
assert(parseNumericValue(undefined) === null, "undefined returns null");
assert(parseNumericValue("") === null, "Empty string returns null");
assert(parseNumericValue("invalid_non_numeric") === null, "Non-numeric string returns null");
assert(parseNumericValue(NaN) === null, "NaN returns null");
assert(parseNumericValue(Infinity) === null, "Infinity returns null");

// ============================================================================
// TEST 2: Descriptive Statistics Calculations (n=0, n=1, n>1)
// ============================================================================
console.log("\n--- TEST GROUP 2: Descriptive Statistics (n, mean, median, variance, stdDev) ---");

// Edge case: Empty array
const emptyStats = calculateMetricStats([]);
assert(emptyStats.count === 0, "Empty array returns count = 0");
assert(emptyStats.mean === null, "Empty array returns mean = null");
assert(emptyStats.median === null, "Empty array returns median = null");
assert(emptyStats.variance === null, "Empty array returns variance = null");
assert(emptyStats.stdDev === null, "Empty array returns stdDev = null");
assert(emptyStats.min === null, "Empty array returns min = null");
assert(emptyStats.max === null, "Empty array returns max = null");

// Edge case: Non-array or invalid entries
const invalidStats = calculateMetricStats([null, undefined, "", "not a number"]);
assert(invalidStats.count === 0, "Array of invalid entries returns count = 0 and null stats");

// Edge case: Single sample (n = 1)
const singleStats = calculateMetricStats([500]);
assert(singleStats.count === 1, "Single sample returns count = 1");
assert(singleStats.mean === 500, "Single sample returns mean = 500");
assert(singleStats.median === 500, "Single sample returns median = 500");
assert(singleStats.min === 500, "Single sample returns min = 500");
assert(singleStats.max === 500, "Single sample returns max = 500");
assert(singleStats.variance === 0, "Single sample returns variance = 0 (no dispersion)");
assert(singleStats.stdDev === 0, "Single sample returns stdDev = 0 (no dispersion)");

// Odd sample size (n = 5): [10, 20, 30, 40, 50]
// Mean = 150 / 5 = 30
// Median = 30
// Differences from mean: -20, -10, 0, 10, 20 -> squared: 400 + 100 + 0 + 100 + 400 = 1000
// Sample variance = 1000 / (5 - 1) = 250
// Sample stdDev = sqrt(250) = 15.8113883
const oddStats = calculateMetricStats([10, 50, 30, 20, 40]);
assert(oddStats.count === 5, "Odd sample size correctly counts n = 5");
assert(oddStats.mean === 30, "Mean of [10, 20, 30, 40, 50] is 30");
assert(oddStats.median === 30, "Median of [10, 20, 30, 40, 50] is 30");
assert(oddStats.min === 10, "Min is 10");
assert(oddStats.max === 50, "Max is 50");
assertClose(oddStats.variance, 250, 0.001, "Sample variance is 250");
assertClose(oddStats.stdDev, 15.8114, 0.001, "Sample standard deviation is ~15.8114");

// Even sample size (n = 4): [100, 200, 300, 400]
// Mean = 1000 / 4 = 250
// Median = (200 + 300) / 2 = 250
// Differences: -150, -50, 50, 150 -> squared: 22500 + 2500 + 2500 + 22500 = 50000
// Sample variance = 50000 / 3 = 16666.6667
// Sample stdDev = sqrt(16666.6667) = 129.0994
const evenStats = calculateMetricStats([400, 100, 300, 200]);
assert(evenStats.count === 4, "Even sample size correctly counts n = 4");
assert(evenStats.mean === 250, "Mean of [100, 200, 300, 400] is 250");
assert(evenStats.median === 250, "Median of [100, 200, 300, 400] is 250");
assertClose(evenStats.variance, 16666.667, 0.01, "Sample variance is ~16666.67");
assertClose(evenStats.stdDev, 129.099, 0.01, "Sample standard deviation is ~129.10");

// ============================================================================
// TEST 3: Metric Value Extraction
// ============================================================================
console.log("\n--- TEST GROUP 3: Metric Value Extraction ---");

const mockSubmission1 = {
  id: "sub_1",
  measurements: {
    screenOnTimeMinutes: { value: 540, unit: "Minutes" },
    repairCost: "$289.00"
  },
  chargeTimeMinutes: 65,
  customMeasurements: [
    { name: "thermalThrottlingDrop", value: 12.5, unit: "%" }
  ]
};

assert(extractMetricValue(mockSubmission1, "screenOnTimeMinutes") === 540, "Extracts nested { value, unit } measurement");
assert(extractMetricValue(mockSubmission1, "repairCost") === 289, "Extracts nested currency string measurement");
assert(extractMetricValue(mockSubmission1, "chargeTimeMinutes") === 65, "Extracts top-level metric");
assert(extractMetricValue(mockSubmission1, "thermalThrottlingDrop") === 12.5, "Extracts custom measurement from array");
assert(extractMetricValue(mockSubmission1, "nonExistentMetric") === null, "Returns null for missing metric");

// ============================================================================
// TEST 4: Security Boundaries - Strict Approved Submissions Filter
// ============================================================================
console.log("\n--- TEST GROUP 4: Security Enforcement (Approved Only Filter) ---");

const mixedSubmissions = [
  {
    id: "approved_1",
    deviceId: "apple-iphone-17-pro-max",
    status: "approved",
    authorId: "user_a",
    softwareVersion: "iOS 19.1",
    experimentId: "exp1",
    measurements: {
      repairCost: 320,
      turnaroundDays: 3,
      qualityRating: 9.0
    }
  },
  {
    id: "approved_2",
    deviceId: "apple-iphone-17-pro-max",
    status: "approved",
    authorId: "user_b",
    softwareVersion: "iOS 19.1",
    experimentId: "exp1",
    measurements: {
      repairCost: 380,
      turnaroundDays: 5,
      qualityRating: 8.0
    }
  },
  {
    id: "approved_3",
    deviceId: "apple-iphone-17-pro-max",
    status: "approved",
    authorId: "user_c",
    softwareVersion: "iOS 19.2",
    experimentId: "exp5",
    measurements: {
      screenOnTimeMinutes: 620,
      chargeTimeMinutes: 55,
      peakTempC: 38.5
    }
  },
  // UNVERIFIED / PENDING / REJECTED SUBMISSIONS THAT MUST BE DISCARDED:
  {
    id: "unverified_pending",
    deviceId: "apple-iphone-17-pro-max",
    status: "pending",
    measurements: { repairCost: 99999, screenOnTimeMinutes: 10 }
  },
  {
    id: "unverified_pending_review",
    deviceId: "apple-iphone-17-pro-max",
    status: "pending_review",
    measurements: { repairCost: 1, screenOnTimeMinutes: 99999 }
  },
  {
    id: "unverified_rejected",
    deviceId: "apple-iphone-17-pro-max",
    status: "rejected",
    measurements: { repairCost: 5000 }
  },
  {
    id: "unverified_withdrawn",
    deviceId: "apple-iphone-17-pro-max",
    status: "withdrawn",
    measurements: { repairCost: 4000 }
  },
  {
    id: "unverified_needs_revision",
    deviceId: "apple-iphone-17-pro-max",
    status: "needs_revision",
    measurements: { repairCost: 3000 }
  }
];

const compiled = computeDeviceCommunityStats(mixedSubmissions, "apple-iphone-17-pro-max");

assert(compiled.sampleSize === 3, `Strictly 3 approved submissions included (got ${compiled.sampleSize})`);
assert(compiled.contributorCount === 3, "Identifies 3 unique verified contributors");
assert(compiled.hasData === true, "hasData is true");

// Check repairCost stats: values [320, 380] -> n=2, mean=350, median=350, diffs ±30 -> variance = (900+900)/1 = 1800 -> stdDev = sqrt(1800) = 42.426
const repairCostMetric = compiled.metrics.repairCost;
assert(repairCostMetric !== undefined, "repairCost metric is calculated");
assert(repairCostMetric.count === 2, "repairCost sample count is 2 (pending 99999 and 1 were excluded)");
assert(repairCostMetric.mean === 350, "repairCost mean is exactly $350");
assert(repairCostMetric.median === 350, "repairCost median is exactly $350");
assertClose(repairCostMetric.variance, 1800, 0.001, "repairCost variance is 1800");
assertClose(repairCostMetric.stdDev, 42.426, 0.001, "repairCost stdDev is ~42.43");
assert(repairCostMetric.min === 320, "repairCost min is $320");
assert(repairCostMetric.max === 380, "repairCost max is $380");

// Check turnaroundDays: values [3, 5] -> n=2, mean=4, median=4
assert(compiled.metrics.turnaroundDays.count === 2, "turnaroundDays count is 2");
assert(compiled.metrics.turnaroundDays.mean === 4, "turnaroundDays mean is 4");

// Check screenOnTimeMinutes: values [620] -> n=1, mean=620, stdDev=0
assert(compiled.metrics.screenOnTimeMinutes.count === 1, "screenOnTimeMinutes count is 1 (pending were excluded)");
assert(compiled.metrics.screenOnTimeMinutes.mean === 620, "screenOnTimeMinutes mean is 620 min");
assert(compiled.metrics.screenOnTimeMinutes.stdDev === 0, "screenOnTimeMinutes single sample stdDev is 0");

// Check distributions
assert(compiled.distributions.protocols.exp1 === 2, "Protocol exp1 has 2 reproductions");
assert(compiled.distributions.protocols.exp5 === 1, "Protocol exp5 has 1 reproduction");
assert(compiled.distributions.operatingSystems["iOS 19.1"] === 2, "iOS 19.1 has 2 submissions");
assert(compiled.distributions.operatingSystems["iOS 19.2"] === 1, "iOS 19.2 has 1 submission");

// ============================================================================
// TEST 5: Zero Sample Behavior (No verified submissions)
// ============================================================================
console.log("\n--- TEST GROUP 5: Zero Sample Graceful Fallback ---");

const zeroSubmissions = [
  { id: "pending_only", status: "pending", measurements: { repairCost: 100 } }
];
const zeroStats = computeDeviceCommunityStats(zeroSubmissions, "device-with-no-approved");

assert(zeroStats.sampleSize === 0, "Sample size is 0 when only pending exist");
assert(zeroStats.hasData === false, "hasData is false");
assert(zeroStats.summary.avgRepairCost === null, "avgRepairCost is null");
assert(zeroStats.summary.avgScreenOnTime === null, "avgScreenOnTime is null");
assert(Object.keys(zeroStats.metrics).length === 0, "metrics object is empty");

// ============================================================================
// TEST 6: Formatting Utilities
// ============================================================================
console.log("\n--- TEST GROUP 6: Formatting Helper Output ---");

const testMetricMulti = {
  label: "Repair Cost",
  prefix: "$",
  suffix: "",
  precision: 2,
  count: 4,
  mean: 249.50,
  median: 235.00,
  stdDev: 22.15,
  min: 220.00,
  max: 290.00
};

assert(formatMetricValue(testMetricMulti, "mean") === "$249.50 (±22.15)", "Formats mean with currency and std dev: $249.50 (±22.15)");
assert(formatMetricValue(testMetricMulti, "median") === "$235.00", "Formats median: $235.00");
assert(formatMetricValue(testMetricMulti, "range") === "$220.00 – $290.00", "Formats range: $220.00 – $290.00");

const testMetricSingle = {
  label: "SOT",
  prefix: "",
  suffix: " min",
  precision: 0,
  count: 1,
  mean: 480,
  median: 480,
  stdDev: 0,
  min: 480,
  max: 480
};

assert(formatMetricValue(testMetricSingle, "mean") === "480 min", "Single sample omits ±stdDev when count < 2: 480 min");
assert(formatMetricValue(null) === "—", "Null metric returns em-dash '—'");

console.log("\n================================================================================");
console.log(`  STEP 6 TEST RUN COMPLETE: ${passed} PASSED, ${failed} FAILED                 `);
console.log("================================================================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
