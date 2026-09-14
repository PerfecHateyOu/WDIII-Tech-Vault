/**
 * WDIII Tech Vault - Step 6 Community Statistics (device_stats) Service Layer
 * Computes robust empirical statistical metrics (n, mean, median, standard deviation,
 * variance, repair costs, battery telemetry, and failure rates) strictly from verified
 * community test submissions.
 */

import { getApprovedSubmissionsForDevice } from "./database.js";

/**
 * Standard Metric Configuration
 */
export const KNOWN_METRIC_CONFIGS = {
  repairCost: { key: "repairCost", label: "Repair Cost", unit: "USD", prefix: "$", precision: 2 },
  turnaroundDays: { key: "turnaroundDays", label: "Turnaround Time", unit: "Days", suffix: " days", precision: 1 },
  qualityRating: { key: "qualityRating", label: "Post-Repair Quality", unit: "/10", suffix: " / 10", precision: 1 },
  screenOnTimeMinutes: { key: "screenOnTimeMinutes", label: "Screen-On Runtime (SOT)", unit: "Minutes", suffix: " min", precision: 0 },
  chargeTimeMinutes: { key: "chargeTimeMinutes", label: "Full Charge Time", unit: "Minutes", suffix: " min", precision: 0 },
  peakTempC: { key: "peakTempC", label: "Peak Operating Temp", unit: "°C", suffix: " °C", precision: 1 },
  waitMinutes: { key: "waitMinutes", label: "Support Wait Time", unit: "Minutes", suffix: " min", precision: 1 },
  escalationsCount: { key: "escalationsCount", label: "Support Escalations", unit: "Tiers", suffix: " tiers", precision: 1 },
  resolutionRate: { key: "resolutionRate", label: "Issue Resolution Rate", unit: "%", suffix: "%", precision: 1 },
  primaryScore: { key: "primaryScore", label: "Benchmark Score", unit: "Units", precision: 1 },
  frictionSeconds: { key: "frictionSeconds", label: "Friction / Latency", unit: "Seconds", suffix: "s", precision: 2 }
};

/**
 * Parses any incoming value into a finite number, handling strings, numbers, and { value, unit } shapes.
 * Returns null if invalid or not finite.
 *
 * @param {any} val
 * @returns {number|null}
 */
export function parseNumericValue(val) {
  if (val === null || val === undefined || val === "") return null;
  if (typeof val === "object" && val !== null && "value" in val) {
    return parseNumericValue(val.value);
  }
  if (typeof val === "number") {
    return Number.isFinite(val) ? val : null;
  }
  if (typeof val === "string") {
    // Strip currency symbols and whitespace
    const cleanStr = val.replace(/[\$,]/g, "").trim();
    const parsed = parseFloat(cleanStr);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/**
 * Calculates descriptive statistical metrics for a collection of quantitative measurements.
 * Handles zero-sample, single-sample, and multi-sample distributions cleanly without runtime errors.
 *
 * @param {Array<number|string|object>} rawValues
 * @returns {object} { count, mean, median, variance, stdDev, min, max, sum }
 */
export function calculateMetricStats(rawValues = []) {
  if (!Array.isArray(rawValues) || rawValues.length === 0) {
    return {
      count: 0,
      mean: null,
      median: null,
      variance: null,
      stdDev: null,
      min: null,
      max: null,
      sum: 0
    };
  }

  // Filter down to valid finite numbers
  const nums = rawValues
    .map(parseNumericValue)
    .filter(v => v !== null);

  const n = nums.length;
  if (n === 0) {
    return {
      count: 0,
      mean: null,
      median: null,
      variance: null,
      stdDev: null,
      min: null,
      max: null,
      sum: 0
    };
  }

  // Sort ascending for median and range
  const sorted = [...nums].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[n - 1];
  const sum = nums.reduce((acc, curr) => acc + curr, 0);
  const mean = sum / n;

  // Median calculation
  let median;
  if (n % 2 === 1) {
    median = sorted[Math.floor(n / 2)];
  } else {
    median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  }

  // Variance & Standard Deviation (Sample statistics: denominator n - 1 for n >= 2)
  let variance = null;
  let stdDev = null;
  if (n >= 2) {
    const sumSqDiff = nums.reduce((acc, curr) => acc + Math.pow(curr - mean, 2), 0);
    variance = sumSqDiff / (n - 1);
    stdDev = Math.sqrt(variance);
  } else if (n === 1) {
    // For single sample, variance and stdDev are 0 (no dispersion) or null for degrees of freedom = 0
    variance = 0;
    stdDev = 0;
  }

  return {
    count: n,
    mean,
    median,
    variance,
    stdDev,
    min,
    max,
    sum
  };
}

/**
 * Extracts a numeric value for a given metric key from a submission document.
 * Checks both `submission.measurements[key]` and top-level properties.
 *
 * @param {object} submission
 * @param {string} metricKey
 * @returns {number|null}
 */
export function extractMetricValue(submission, metricKey) {
  if (!submission) return null;

  // Check in measurements container first
  if (submission.measurements && typeof submission.measurements === "object") {
    if (metricKey in submission.measurements) {
      const val = parseNumericValue(submission.measurements[metricKey]);
      if (val !== null) return val;
    }
  }

  // Check top-level
  if (metricKey in submission) {
    const val = parseNumericValue(submission[metricKey]);
    if (val !== null) return val;
  }

  // Check custom measurements if array
  if (Array.isArray(submission.customMeasurements)) {
    const customMatch = submission.customMeasurements.find(
      c => c && (c.name === metricKey || c.name?.toLowerCase() === metricKey.toLowerCase())
    );
    if (customMatch && customMatch.value !== undefined) {
      const val = parseNumericValue(customMatch.value);
      if (val !== null) return val;
    }
  }

  return null;
}

/**
 * Computes aggregated device community statistics from a list of submissions.
 *
 * CRITICAL SECURITY CONSTRAINT:
 * Only submissions with status === 'approved' are included. All pending,
 * rejected, or withdrawn submissions are strictly discarded.
 *
 * @param {Array<object>} rawSubmissions
 * @param {string} [deviceId=""]
 * @returns {object} Device Community Statistics dossier
 */
export function computeDeviceCommunityStats(rawSubmissions = [], deviceId = "") {
  // Enforce strict security filter: APPROVED submissions ONLY
  const approved = (Array.isArray(rawSubmissions) ? rawSubmissions : []).filter(
    s => s && typeof s === "object" && s.status === "approved"
  );

  const sampleSize = approved.length;

  if (sampleSize === 0) {
    return {
      deviceId,
      sampleSize: 0,
      hasData: false,
      lastUpdated: new Date().toISOString(),
      metrics: {},
      summary: {
        avgRepairCost: null,
        avgScreenOnTime: null,
        avgChargeTime: null,
        avgTurnaroundDays: null,
        avgQualityRating: null,
        reportedRepairCount: 0,
        issueResolutionRate: null
      },
      distributions: {
        protocols: {},
        operatingSystems: {},
        channels: {}
      },
      contributorCount: 0,
      recentSubmissions: []
    };
  }

  // 1. Gather all known quantitative metrics
  const computedMetrics = {};
  for (const [key, cfg] of Object.entries(KNOWN_METRIC_CONFIGS)) {
    const values = [];
    approved.forEach(sub => {
      const v = extractMetricValue(sub, key);
      if (v !== null) values.push(v);
    });

    if (values.length > 0) {
      const stats = calculateMetricStats(values);
      computedMetrics[key] = {
        key,
        label: cfg.label,
        unit: cfg.unit,
        prefix: cfg.prefix || "",
        suffix: cfg.suffix || "",
        precision: cfg.precision ?? 1,
        ...stats
      };
    }
  }

  // 2. Gather custom metrics
  const customValuesMap = {};
  approved.forEach(sub => {
    if (Array.isArray(sub.customMeasurements)) {
      sub.customMeasurements.forEach(c => {
        if (!c || !c.name) return;
        const normName = c.name.trim();
        const v = parseNumericValue(c.value);
        if (v !== null) {
          if (!customValuesMap[normName]) {
            customValuesMap[normName] = { unit: c.unit || "Units", values: [] };
          }
          customValuesMap[normName].values.push(v);
        }
      });
    }
  });

  for (const [customName, data] of Object.entries(customValuesMap)) {
    if (data.values.length > 0 && !computedMetrics[customName]) {
      const stats = calculateMetricStats(data.values);
      computedMetrics[customName] = {
        key: customName,
        label: customName,
        unit: data.unit,
        prefix: "",
        suffix: ` ${data.unit}`,
        precision: 1,
        isCustom: true,
        ...stats
      };
    }
  }

  // 3. Distributions & Metadata Breakdown
  const protocolsDist = {};
  const osDist = {};
  const channelsDist = {};
  const authorsSet = new Set();
  let repairTestsCount = 0;

  approved.forEach(sub => {
    // Protocol count
    if (sub.experimentId) {
      protocolsDist[sub.experimentId] = (protocolsDist[sub.experimentId] || 0) + 1;
      if (sub.experimentId === "exp1" || sub.experimentId === "exp2" || sub.experimentId === "exp6") {
        repairTestsCount++;
      }
    }

    // OS builds
    const os = sub.softwareVersion || sub.conditions?.softwareVersion || "Unspecified";
    osDist[os] = (osDist[os] || 0) + 1;

    // Channel/condition
    const channel = sub.conditions?.channel || sub.channel;
    if (channel) {
      channelsDist[channel] = (channelsDist[channel] || 0) + 1;
    }

    // Contributor ID
    if (sub.authorId || sub.userId) {
      authorsSet.add(sub.authorId || sub.userId);
    }
  });

  // 4. Extract High-Level Summary Indicators
  const summary = {
    avgRepairCost: computedMetrics.repairCost?.mean ?? null,
    avgScreenOnTime: computedMetrics.screenOnTimeMinutes?.mean ?? null,
    avgChargeTime: computedMetrics.chargeTimeMinutes?.mean ?? null,
    avgTurnaroundDays: computedMetrics.turnaroundDays?.mean ?? null,
    avgQualityRating: computedMetrics.qualityRating?.mean ?? null,
    reportedRepairCount: repairTestsCount,
    issueResolutionRate: computedMetrics.resolutionRate?.mean ?? null
  };

  // Recent approved submissions (latest 5)
  const sortedApproved = [...approved].sort((a, b) => {
    const dateA = new Date(a.testDate || a.submittedAt || 0).getTime();
    const dateB = new Date(b.testDate || b.submittedAt || 0).getTime();
    return dateB - dateA;
  });

  return {
    deviceId: deviceId || approved[0]?.deviceId || "",
    sampleSize,
    hasData: sampleSize > 0,
    lastUpdated: new Date().toISOString(),
    metrics: computedMetrics,
    summary,
    distributions: {
      protocols: protocolsDist,
      operatingSystems: osDist,
      channels: channelsDist
    },
    contributorCount: authorsSet.size,
    recentSubmissions: sortedApproved.slice(0, 5).map(s => ({
      id: s.id,
      experimentId: s.experimentId,
      testDate: s.testDate || s.submittedAt,
      softwareVersion: s.softwareVersion || "Standard Build",
      authorDisplayName: s.authorDisplayName || s.authorEmail?.split("@")[0] || "Verified Contributor",
      measurements: s.measurements || {}
    }))
  };
}

/**
 * Retrieves aggregate device community statistics for a specific device.
 * Queries approved submissions via database service, computes statistical aggregations,
 * and caches or checks Firestore `/device_stats/{deviceId}` where applicable.
 *
 * @param {string} deviceId
 * @returns {Promise<object>}
 */
export async function getDeviceCommunityStats(deviceId) {
  if (!deviceId) {
    return computeDeviceCommunityStats([], "");
  }

  // Fetch approved submissions strictly filtered by getApprovedSubmissionsForDevice
  try {
    const submissions = await getApprovedSubmissionsForDevice(deviceId);
    const computed = computeDeviceCommunityStats(submissions, deviceId);

    // If in browser and Firestore is ready, also check Firestore /device_stats/{deviceId} cache
    if (typeof window !== "undefined") {
      try {
        const fbModule = await import("./firebase.js");
        const fb = fbModule?.getFirebaseInstance?.();
        if (fb && fb.isFirebaseReady()) {
          const { getFirestore, doc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js");
          const db = getFirestore();
          if (db) {
            const statsDocRef = doc(db, "device_stats", deviceId);
            const snap = await getDoc(statsDocRef);
            if (snap.exists()) {
              const cachedData = snap.data();
              if (cachedData && cachedData.sampleSize >= computed.sampleSize) {
                return {
                  ...computed,
                  ...cachedData,
                  metrics: { ...computed.metrics, ...(cachedData.metrics || {}) },
                  isFirestoreCached: true
                };
              }
            }
          }
        }
      } catch (e) {
        // Firestore device_stats cache read error is non-fatal; computed data remains authoritative
      }
    }

    return computed;
  } catch (err) {
    console.warn(`Error compiling community stats for device ${deviceId}:`, err);
    return computeDeviceCommunityStats([], deviceId);
  }
}

/**
 * Format helper to render a metric value with appropriate unit and precision
 *
 * @param {object} metric
 * @param {string} [type="mean"] "mean" | "median" | "range"
 * @returns {string}
 */
export function formatMetricValue(metric, type = "mean") {
  if (!metric) return "—";

  const p = metric.precision ?? 1;
  const prefix = metric.prefix || "";
  const suffix = metric.suffix || "";

  if (type === "range") {
    if (metric.min === null || metric.max === null) return "—";
    return `${prefix}${metric.min.toFixed(p)}${suffix} – ${prefix}${metric.max.toFixed(p)}${suffix}`;
  }

  const val = type === "median" ? metric.median : metric.mean;
  if (val === null || val === undefined) return "—";

  let out = `${prefix}${val.toFixed(p)}${suffix}`;
  if (type === "mean" && metric.stdDev !== null && metric.count >= 2) {
    out += ` (±${metric.stdDev.toFixed(p)})`;
  }
  return out;
}
