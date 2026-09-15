/**
 * WDIII Tech Vault - Device Comparison Service Layer
 * 
 * Responsible for:
 * - Loading selected devices using existing database.js service
 * - Loading linked official WDIII experiment results
 * - Retrieving strictly approved/verified community submissions (status === 'approved')
 * - Grouping measurements by device and comparable metric
 * - Computing rigorous mathematical descriptive statistics (mean, median, range, sample size, stdDev)
 * - Computing transparent category-specific scores (never arbitrary combined phone scores)
 * - Enforcing strict data provenance:
 *     1. WDIII OFFICIAL (Controlled experiment measurements)
 *     2. VERIFIED COMMUNITY (Moderator-approved contributor data)
 *     3. PUBLISHED SPECIFICATION (Manufacturer / documented hardware specs)
 * - Ensuring read-only behavior with zero DOM manipulation
 */

import { getDeviceById, getDevices, getExperimentById, getApprovedSubmissionsForDevice } from "./database.js";
import { 
  calculateStats, 
  normalizeScore, 
  getDataConfidenceLabel, 
  parseNumeric 
} from "../utils/comparison-stats.js";

/**
 * Visual Data Provenance Constants
 */
export const DATA_PROVENANCE = {
  WDIII_OFFICIAL: "WDIII OFFICIAL",
  VERIFIED_COMMUNITY: "VERIFIED COMMUNITY",
  PUBLISHED_SPECIFICATION: "PUBLISHED SPECIFICATION"
};

/**
 * Standard Comparable Metrics Definition
 */
export const COMPARABLE_METRICS = {
  screenOnTimeMinutes: {
    key: "screenOnTimeMinutes",
    label: "Screen-On Runtime (SOT)",
    category: "battery",
    unit: "Minutes",
    suffix: " min",
    higherIsBetter: true,
    description: "Empirically measured active display runtime under standard workload"
  },
  chargeTimeMinutes: {
    key: "chargeTimeMinutes",
    label: "Full Charge Time (0–100%)",
    category: "battery",
    unit: "Minutes",
    suffix: " min",
    higherIsBetter: false,
    description: "Time required to reach full charge using recommended charger"
  },
  repairCost: {
    key: "repairCost",
    label: "Mail-In Repair Cost",
    category: "repairability",
    unit: "USD",
    prefix: "$",
    higherIsBetter: false,
    description: "Total invoice cost for official / authorized screen or component repair"
  },
  turnaroundDays: {
    key: "turnaroundDays",
    label: "Service Turnaround Time",
    category: "repairability",
    unit: "Days",
    suffix: " days",
    higherIsBetter: false,
    description: "Business days between service dispatch and device return"
  },
  qualityRating: {
    key: "qualityRating",
    label: "Post-Repair Quality Score",
    category: "repairability",
    unit: "/10",
    suffix: " / 10",
    higherIsBetter: true,
    description: "Inspection rating for adhesive seal, panel fit, and calibration"
  },
  peakTempC: {
    key: "peakTempC",
    label: "Peak Thermal Load",
    category: "thermal",
    unit: "°C",
    suffix: " °C",
    higherIsBetter: false,
    description: "Maximum surface temperature recorded during sustained compute load"
  },
  waitMinutes: {
    key: "waitMinutes",
    label: "Customer Support Hold Time",
    category: "support",
    unit: "Minutes",
    suffix: " min",
    higherIsBetter: false,
    description: "Duration before reaching a live customer service representative"
  },
  primaryScore: {
    key: "primaryScore",
    label: "Standard Benchmark Score",
    category: "performance",
    unit: "pts",
    suffix: " pts",
    higherIsBetter: true,
    description: "Empirical standardized computational throughput benchmark"
  }
};

/**
 * Load and structure complete comparison data for 2–3 selected devices.
 * Strictly limits to max 3 devices. Returns null if fewer than 2 valid devices.
 *
 * @param {Array<string>} deviceIds
 * @returns {Promise<object|null>}
 */
export async function loadComparisonData(deviceIds = []) {
  if (!Array.isArray(deviceIds)) return null;

  // Filter out blanks, duplicates, and limit strictly to 2 or 3 devices
  const uniqueIds = deviceIds
    .filter((id, idx, arr) => Boolean(id) && arr.indexOf(id) === idx)
    .slice(0, 3);

  if (uniqueIds.length < 2) {
    return {
      success: false,
      error: "insufficient_devices",
      message: "At least 2 devices are required for comparison.",
      devices: []
    };
  }

  // 1. Fetch devices in parallel using existing database.js
  const devices = [];
  for (const id of uniqueIds) {
    const dev = await getDeviceById(id);
    if (dev) {
      devices.push(dev);
    }
  }

  if (devices.length < 2) {
    return {
      success: false,
      error: "devices_not_found",
      message: "One or more specified devices could not be found in the registry.",
      devices: []
    };
  }

  // 2. Fetch linked official experiments and verified community submissions
  const deviceComparisonEntries = await Promise.all(devices.map(async (device) => {
    // Official Experiments
    const experimentIds = device.experimentsInvolved || [];
    const linkedExperiments = [];
    for (const expId of experimentIds) {
      const exp = await getExperimentById(expId);
      if (exp) {
        linkedExperiments.push(exp);
      }
    }

    // Extract official lab measurements specific to this device
    const officialResults = extractOfficialDeviceMeasurements(device, linkedExperiments);

    // Community Submissions (strictly status === 'approved')
    let rawSubmissions = [];
    try {
      rawSubmissions = await getApprovedSubmissionsForDevice(device.id);
    } catch (err) {
      console.warn(`Could not load community submissions for ${device.id}:`, err);
    }

    // Explicitly enforce verified filter: exclude pending, rejected, withdrawn, or unverified
    const verifiedSubmissions = (rawSubmissions || []).filter(s => s && s.status === "approved");

    // Group and calculate statistics for community metrics
    const communityMetrics = computeGroupedCommunityMetrics(verifiedSubmissions);

    return {
      device,
      officialResults,
      linkedExperiments,
      verifiedSubmissions,
      communityMetrics,
      sampleSize: verifiedSubmissions.length,
      confidenceLabel: getDataConfidenceLabel(verifiedSubmissions.length)
    };
  }));

  // 3. Compute Transparent Category Scores (Battery, Repairability, Thermal, Performance)
  // Only calculated where valid comparable underlying data exists
  const categoryScores = computeTransparentCategoryScores(deviceComparisonEntries);

  return {
    success: true,
    devicesCount: deviceComparisonEntries.length,
    entries: deviceComparisonEntries,
    categoryScores,
    provenanceLabels: DATA_PROVENANCE
  };
}

/**
 * Extract official WDIII measurements specific to a device from linked experiments.
 *
 * @param {object} device
 * @param {Array<object>} experiments
 * @returns {Array<object>}
 */
export function extractOfficialDeviceMeasurements(device, experiments = []) {
  const results = [];
  if (!device || !Array.isArray(experiments)) return results;

  const modelLower = (device.model || "").toLowerCase();
  const brandLower = (device.brand || "").toLowerCase();

  for (const exp of experiments) {
    if (!exp) continue;

    let deviceMeasurements = null;

    if (exp.measurements) {
      // Direct brand/model matching in measurements
      if (brandLower.includes("apple") && exp.measurements.apple) {
        deviceMeasurements = exp.measurements.apple;
      } else if (brandLower.includes("samsung") && exp.measurements.samsung) {
        deviceMeasurements = exp.measurements.samsung;
      } else if (brandLower.includes("google") && exp.measurements.google) {
        deviceMeasurements = exp.measurements.google;
      } else if (exp.measurements[device.id]) {
        deviceMeasurements = exp.measurements[device.id];
      } else {
        // Search inside object values for device name match
        for (const [key, val] of Object.entries(exp.measurements)) {
          if (typeof val === "object" && val !== null) {
            const devName = (val.device || "").toLowerCase();
            if (devName && (modelLower.includes(devName) || devName.includes(modelLower))) {
              deviceMeasurements = val;
              break;
            }
          }
        }
      }
    }

    results.push({
      experimentId: exp.id,
      experimentNumber: exp.experimentNumber || "",
      experimentTitle: exp.title,
      category: exp.category,
      provenance: DATA_PROVENANCE.WDIII_OFFICIAL,
      verdict: exp.verdict || null,
      scope: exp.scope || exp.limitations || null,
      measurements: deviceMeasurements,
      hasDeviceSpecificData: deviceMeasurements !== null
    });
  }

  return results;
}

/**
 * Group verified submissions and compute statistical summaries for each comparable metric.
 *
 * @param {Array<object>} verifiedSubmissions
 * @returns {object} Map of metricKey -> { count, mean, median, min, max, stdDev, confidenceLabel, ... }
 */
export function computeGroupedCommunityMetrics(verifiedSubmissions = []) {
  const result = {};

  for (const [metricKey, config] of Object.entries(COMPARABLE_METRICS)) {
    const rawValues = [];

    for (const sub of verifiedSubmissions) {
      if (!sub) continue;
      // Check in measurements object
      if (sub.measurements && metricKey in sub.measurements) {
        rawValues.push(sub.measurements[metricKey]);
      } else if (metricKey in sub) {
        rawValues.push(sub[metricKey]);
      }
    }

    const stats = calculateStats(rawValues);

    result[metricKey] = {
      ...config,
      ...stats,
      confidenceLabel: getDataConfidenceLabel(stats.count),
      provenance: DATA_PROVENANCE.VERIFIED_COMMUNITY
    };
  }

  return result;
}

/**
 * Compute transparent, reproducible category scores based strictly on available data.
 * Does NOT generate an arbitrary overall phone score.
 *
 * Categories supported:
 * 1. Battery Score (based on Screen-On Time or Charge Time)
 * 2. Repairability Score (based on Post-Repair Quality, Repair Cost, or Turnaround)
 * 3. Thermal Score (based on Peak Operating Temp)
 * 4. Community Reliability Score (based on verified test volume & issue resolution)
 *
 * @param {Array<object>} entries
 * @returns {object} Map of categoryKey -> { available, title, description, scores: { [deviceId]: { score, basedOn } } }
 */
export function computeTransparentCategoryScores(entries = []) {
  const categories = {
    battery: {
      key: "battery",
      title: "Battery Category Score",
      description: "Normalized endurance score based strictly on verified screen-on runtime (SOT) measurements.",
      available: false,
      scores: {}
    },
    repairability: {
      key: "repairability",
      title: "Repairability Category Score",
      description: "Normalized serviceability score derived from empirical repair costs, turnaround, and post-service quality.",
      available: false,
      scores: {}
    },
    thermal: {
      key: "thermal",
      title: "Thermal Performance Score",
      description: "Normalized operating temperature rating under sustained load (lower temperature is better).",
      available: false,
      scores: {}
    }
  };

  // --- 1. Battery Score Evaluation (based on screenOnTimeMinutes) ---
  const batteryMeans = [];
  const batteryDeviceData = {};

  for (const entry of entries) {
    const sotStat = entry.communityMetrics?.screenOnTimeMinutes;
    if (sotStat && sotStat.count >= 1 && sotStat.mean !== null) {
      batteryMeans.push(sotStat.mean);
      batteryDeviceData[entry.device.id] = {
        mean: sotStat.mean,
        count: sotStat.count
      };
    }
  }

  if (batteryMeans.length >= 2) {
    categories.battery.available = true;
    const minSot = Math.min(...batteryMeans);
    const maxSot = Math.max(...batteryMeans);

    for (const entry of entries) {
      const data = batteryDeviceData[entry.device.id];
      if (data) {
        const score = normalizeScore(data.mean, minSot, maxSot, true);
        categories.battery.scores[entry.device.id] = {
          score,
          basedOn: `${data.count} verified test${data.count === 1 ? '' : 's'} (Mean SOT: ${Math.round(data.mean)} min)`,
          metric: "screenOnTimeMinutes"
        };
      } else {
        categories.battery.scores[entry.device.id] = {
          score: null,
          basedOn: "Insufficient verified battery tests",
          metric: null
        };
      }
    }
  }

  // --- 2. Repairability Score Evaluation (based on qualityRating or repairCost) ---
  const repairCosts = [];
  const repairDeviceData = {};

  for (const entry of entries) {
    const costStat = entry.communityMetrics?.repairCost;
    if (costStat && costStat.count >= 1 && costStat.mean !== null) {
      repairCosts.push(costStat.mean);
      repairDeviceData[entry.device.id] = {
        mean: costStat.mean,
        count: costStat.count
      };
    }
  }

  if (repairCosts.length >= 2) {
    categories.repairability.available = true;
    const minCost = Math.min(...repairCosts);
    const maxCost = Math.max(...repairCosts);

    for (const entry of entries) {
      const data = repairDeviceData[entry.device.id];
      if (data) {
        // Lower cost is better
        const score = normalizeScore(data.mean, minCost, maxCost, false);
        categories.repairability.scores[entry.device.id] = {
          score,
          basedOn: `${data.count} verified repair${data.count === 1 ? '' : 's'} (Mean Cost: $${Math.round(data.mean)})`,
          metric: "repairCost"
        };
      } else {
        categories.repairability.scores[entry.device.id] = {
          score: null,
          basedOn: "Insufficient verified repair data",
          metric: null
        };
      }
    }
  }

  // --- 3. Thermal Score Evaluation (based on peakTempC) ---
  const thermalMeans = [];
  const thermalDeviceData = {};

  for (const entry of entries) {
    const tempStat = entry.communityMetrics?.peakTempC;
    if (tempStat && tempStat.count >= 1 && tempStat.mean !== null) {
      thermalMeans.push(tempStat.mean);
      thermalDeviceData[entry.device.id] = {
        mean: tempStat.mean,
        count: tempStat.count
      };
    }
  }

  if (thermalMeans.length >= 2) {
    categories.thermal.available = true;
    const minTemp = Math.min(...thermalMeans);
    const maxTemp = Math.max(...thermalMeans);

    for (const entry of entries) {
      const data = thermalDeviceData[entry.device.id];
      if (data) {
        // Lower temperature is better
        const score = normalizeScore(data.mean, minTemp, maxTemp, false);
        categories.thermal.scores[entry.device.id] = {
          score,
          basedOn: `${data.count} verified thermal test${data.count === 1 ? '' : 's'} (Mean Peak: ${data.mean.toFixed(1)}°C)`,
          metric: "peakTempC"
        };
      } else {
        categories.thermal.scores[entry.device.id] = {
          score: null,
          basedOn: "Insufficient verified thermal data",
          metric: null
        };
      }
    }
  }

  return categories;
}

/**
 * Format metric value with appropriate prefix/suffix and precision.
 *
 * @param {object} metricStat
 * @param {string} field ("mean" | "median" | "min" | "max")
 * @returns {string}
 */
export function formatComparisonMetricValue(metricStat, field = "mean") {
  if (!metricStat || metricStat[field] === null || metricStat[field] === undefined) {
    return "—";
  }

  const val = metricStat[field];
  const prefix = metricStat.prefix || "";
  const suffix = metricStat.suffix || "";

  let numFormatted;
  if (metricStat.unit === "USD") {
    numFormatted = Number(val).toFixed(2);
  } else if (Number.isInteger(val)) {
    numFormatted = String(val);
  } else {
    numFormatted = Number(val).toFixed(1);
  }

  return `${prefix}${numFormatted}${suffix}`;
}

/**
 * Format range string for a metric (e.g., "7.8–8.9 hours" or "$289.00–$600.00").
 * Returns "—" if min or max is missing.
 *
 * @param {object} metricStat
 * @returns {string}
 */
export function formatMetricRange(metricStat) {
  if (!metricStat || metricStat.min === null || metricStat.max === null) {
    return "—";
  }
  const prefix = metricStat.prefix || "";
  const suffix = metricStat.suffix || "";

  if (metricStat.min === metricStat.max) {
    return `${prefix}${metricStat.min}${suffix}`;
  }

  return `${prefix}${metricStat.min}${suffix} – ${prefix}${metricStat.max}${suffix}`;
}
