/**
 * WDIII Tech Vault - Mathematical Comparison & Telemetry Statistics Utility
 * 
 * Provides mathematically sound descriptive statistics for verified community measurements.
 * Follows strict scientific standards:
 * - Does not calculate statistics for null, missing, invalid, or non-numeric values
 * - Does not treat zero as missing (zero is a valid numeric value)
 * - Safe standard deviation using sample variance (n - 1 degrees of freedom for n >= 2)
 * - Transparent min-max normalization with division-by-zero protection
 * - Standard data confidence classification based strictly on sample size (n)
 */

/**
 * Parses any incoming value into a finite number.
 * Handles numbers, strings, and { value, unit } shapes.
 * Returns null if invalid, undefined, null, empty string, or non-numeric.
 * 
 * Note: 0 is explicitly preserved as a valid numeric measurement.
 *
 * @param {any} val
 * @returns {number|null}
 */
export function parseNumeric(val) {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val === "object" && val !== null && "value" in val) {
    return parseNumeric(val.value);
  }
  if (typeof val === "number") {
    return Number.isFinite(val) ? val : null;
  }
  if (typeof val === "string") {
    // Strip dollar signs, percent signs, commas, and trailing units like "h", "hrs", "min", "ms", "s"
    const cleaned = val.replace(/[\$,%]/g, "").trim();
    // Try parseFloat
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Filter an array of raw values to strictly valid finite numbers.
 *
 * @param {Array<any>} rawValues
 * @returns {Array<number>}
 */
export function extractValidNumbers(rawValues = []) {
  if (!Array.isArray(rawValues)) return [];
  return rawValues
    .map(parseNumeric)
    .filter(v => v !== null && typeof v === "number" && Number.isFinite(v));
}

/**
 * Calculate arithmetic mean. Returns null for empty sample.
 *
 * @param {Array<any>} rawValues
 * @returns {number|null}
 */
export function calculateMean(rawValues = []) {
  const nums = extractValidNumbers(rawValues);
  if (nums.length === 0) return null;
  const sum = nums.reduce((acc, v) => acc + v, 0);
  return sum / nums.length;
}

/**
 * Calculate median value. Returns null for empty sample.
 * Correctly interpolates middle two values for even-sized samples.
 *
 * @param {Array<any>} rawValues
 * @returns {number|null}
 */
export function calculateMedian(rawValues = []) {
  const nums = extractValidNumbers(rawValues);
  const n = nums.length;
  if (n === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  if (n % 2 === 1) {
    return sorted[Math.floor(n / 2)];
  }
  return (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

/**
 * Calculate minimum value. Returns null for empty sample.
 *
 * @param {Array<any>} rawValues
 * @returns {number|null}
 */
export function calculateMin(rawValues = []) {
  const nums = extractValidNumbers(rawValues);
  if (nums.length === 0) return null;
  return Math.min(...nums);
}

/**
 * Calculate maximum value. Returns null for empty sample.
 *
 * @param {Array<any>} rawValues
 * @returns {number|null}
 */
export function calculateMax(rawValues = []) {
  const nums = extractValidNumbers(rawValues);
  if (nums.length === 0) return null;
  return Math.max(...nums);
}

/**
 * Get sample size (count of valid numeric values).
 *
 * @param {Array<any>} rawValues
 * @returns {number}
 */
export function calculateSampleSize(rawValues = []) {
  return extractValidNumbers(rawValues).length;
}

/**
 * Calculate sample standard deviation (Bessel's correction: denominator n - 1).
 * Returns null if sample size < 2.
 * Returns 0 if all values are identical.
 *
 * @param {Array<any>} rawValues
 * @returns {number|null}
 */
export function calculateStdDev(rawValues = []) {
  const nums = extractValidNumbers(rawValues);
  const n = nums.length;
  if (n < 2) return null;
  const mean = calculateMean(nums);
  if (mean === null) return null;
  const sumSqDiff = nums.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  const variance = sumSqDiff / (n - 1);
  return Math.sqrt(variance);
}

/**
 * Calculate full descriptive statistics object.
 *
 * @param {Array<any>} rawValues
 * @returns {object} { count, mean, median, min, max, stdDev, hasSufficientData }
 */
export function calculateStats(rawValues = []) {
  const nums = extractValidNumbers(rawValues);
  const count = nums.length;

  if (count === 0) {
    return {
      count: 0,
      mean: null,
      median: null,
      min: null,
      max: null,
      stdDev: null,
      hasSufficientData: false
    };
  }

  const mean = calculateMean(nums);
  const median = calculateMedian(nums);
  const min = calculateMin(nums);
  const max = calculateMax(nums);
  const stdDev = calculateStdDev(nums);

  return {
    count,
    mean,
    median,
    min,
    max,
    stdDev,
    hasSufficientData: count >= 1
  };
}

/**
 * Normalizes a metric value to a 0–100 category score.
 * 
 * Rules:
 * - For higher is better: score = 100 * (value - minimum) / (maximum - minimum)
 * - For lower is better:  score = 100 * (maximum - value) / (maximum - minimum)
 * - Safe handling when maximum === minimum (returns 100 or neutral value without division by zero)
 * - Clamps score strictly between 0 and 100
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @param {boolean} higherIsBetter
 * @returns {number|null} Score rounded to whole integer (0-100), or null if inputs invalid
 */
export function normalizeScore(value, min, max, higherIsBetter = true) {
  const numVal = parseNumeric(value);
  const numMin = parseNumeric(min);
  const numMax = parseNumeric(max);

  if (numVal === null || numMin === null || numMax === null) {
    return null;
  }

  // Handle equal boundary edge-case without division by zero
  if (numMax === numMin) {
    return 100;
  }

  // Guard against inverted bounds
  const actualMin = Math.min(numMin, numMax);
  const actualMax = Math.max(numMin, numMax);
  const range = actualMax - actualMin;

  if (range <= 0) {
    return 100;
  }

  let rawScore;
  if (higherIsBetter) {
    rawScore = 100 * (numVal - actualMin) / range;
  } else {
    rawScore = 100 * (actualMax - numVal) / range;
  }

  // Clamp to 0-100
  const clamped = Math.max(0, Math.min(100, rawScore));
  return Math.round(clamped);
}

/**
 * Returns the standardized data confidence label based on verified sample size (n).
 *
 * Labels:
 * - n = 0: "No verified community data"
 * - n = 1–4: "Very limited sample"
 * - n = 5–9: "Early community sample"
 * - n >= 10: "Growing community sample"
 *
 * @param {number} sampleSize
 * @returns {string}
 */
export function getDataConfidenceLabel(sampleSize) {
  const n = typeof sampleSize === "number" ? sampleSize : 0;
  if (n === 0) return "No verified community data";
  if (n >= 1 && n <= 4) return "Very limited sample";
  if (n >= 5 && n <= 9) return "Early community sample";
  return "Growing community sample";
}
