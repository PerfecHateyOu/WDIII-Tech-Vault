import fs from 'fs';
import { OFFICIAL_EXPERIMENTS } from '../src/data/official-experiments.js';

const SCHEMAS = {
  exp1: [
    { key: "turnaroundDays", label: "Turnaround Time", type: "number", unit: "Days", required: true, min: 0, max: 120 },
    { key: "repairCost", label: "Total Repair Cost", type: "number", unit: "USD", required: true, min: 0, max: 2000 },
    { key: "qualityRating", label: "Physical Repair Quality", type: "number", unit: "/ 10", required: false, min: 1, max: 10 },
    { key: "repairQuality", label: "Quality Assessment", type: "string", required: false },
    { key: "communicationRating", label: "Communication Quality Rating", type: "number", unit: "Score", required: false, min: 1, max: 10 },
    { key: "adminIssueOccurred", label: "Administrative / Logistical Failure", type: "boolean", required: false }
  ],
  exp2: [
    { key: "repairCostUsd", label: "Repair cost", type: "number", required: true, unit: "USD", min: 0, max: 5000 },
    { key: "turnaroundDays", label: "Turnaround", type: "number", required: false, unit: "days", min: 0, max: 120 },
    { key: "waterproofingPreserved", label: "Waterproofing preserved", type: "boolean", required: false },
    { key: "warrantyProvided", label: "Warranty provided", type: "boolean", required: false }
  ],
  exp3: [
    { key: "supportRating", label: "Support rating", type: "number", required: true, unit: "/ 5", min: 0, max: 5 },
    { key: "correctAnswerGiven", label: "Correct answer given", type: "boolean", required: false }
  ],
  exp4: [
    { key: "bootSpeedDeltaPercent", label: "Boot speed change", type: "number", required: false, unit: "%", min: -100, max: 100 },
    { key: "appLoadDeltaPercent", label: "App loading change", type: "number", required: false, unit: "%", min: -100, max: 100 },
    { key: "thermalStabilityPercent", label: "3DMark thermal stability", type: "number", required: false, unit: "%", min: 0, max: 100 },
    { key: "batteryRemainingPercent", label: "Battery remaining (same workload)", type: "number", required: true, unit: "%", min: 0, max: 100 }
  ],
  casestudy: [
    { key: "devicesAffected", label: "Devices affected", type: "number", required: true, min: 0, max: 100 },
    { key: "settlementUsd", label: "Settlement", type: "number", required: false, unit: "USD", min: 0, max: 100000 },
    { key: "daysWithoutResponse", label: "Days without response", type: "number", required: false, unit: "days", min: 0, max: 3650 }
  ],
  exp5: [
    { key: "screenOnTimeHours", label: "Screen-on time", type: "number", required: true, unit: "hours", min: 0, max: 48 },
    { key: "enduranceDays", label: "Endurance per charge", type: "number", required: false, unit: "days", min: 0, max: 7 }
  ],
  exp6: [
    { key: "repairCostUsd", label: "Repair cost", type: "number", required: true, unit: "USD", min: 0, max: 5000 },
    { key: "defectsFound", label: "Defects found", type: "number", required: false, min: 0, max: 100 },
    { key: "warrantyExtended", label: "Warranty extended", type: "boolean", required: false }
  ],
  exp7: [
    { key: "thermalRating", label: "Thermal rating", type: "string", required: false },
    { key: "uiFluidity", label: "UI fluidity", type: "string", required: false }
  ],
  exp9: [
    { key: "telemetryHostsContacted", label: "Telemetry Hosts Contacted", type: "number", unit: "Hosts", required: true, min: 0, max: 500 },
    { key: "airDropHashLeak", label: "AirDrop SHA256 Hash Leak Observed", type: "boolean", required: true },
    { key: "cloudADPEncryptionCoverage", label: "Advanced Data Protection Coverage", type: "number", unit: "%", required: true, min: 0, max: 100 },
    { key: "gatekeeperBypassResistance", label: "Gatekeeper Bypass Resistance", type: "number", unit: "Score", required: false, min: 1, max: 10 }
  ],
  'queued-exp8': [
    { key: "clipboardP2lSeconds", label: "Clipboard Phone → Laptop", type: "number", unit: "Seconds", required: false, min: 0 },
    { key: "clipboardL2pSeconds", label: "Clipboard Laptop → Phone", type: "number", unit: "Seconds", required: false, min: 0 },
    { key: "fileTransferSeconds", label: "50MB File Transfer Phone → Laptop", type: "number", unit: "Seconds", required: false, min: 0 },
    { key: "notifWatchSeconds", label: "Phone → Watch Notification Delivery", type: "number", unit: "Seconds", required: false, min: 0 },
    { key: "audioSwitchSeconds", label: "Earbud Audio Auto-Switch Phone → Laptop", type: "number", unit: "Seconds", required: false, min: 0 },
    { key: "batteryHealthPct", label: "Battery Health (where exposed)", type: "number", unit: "%", required: false, min: 0, max: 100 },
    { key: "cycleCount", label: "Battery Cycle Count (where exposed)", type: "number", unit: "Cycles", required: false, min: 0 }
  ],
  'queued-exp10': [
    { key: "standbyDrainPctPerHour", label: "Overnight Standby Drain", type: "number", unit: "%/hour", required: false, min: 0, max: 100 },
    { key: "appLaunchSeconds", label: "Built-in App Launch Time (mean of 15 trials)", type: "number", unit: "Seconds", required: false, min: 0, max: 60 },
    { key: "newCrashLogsPerWeek", label: "New Crash Logs (Analytics Data)", type: "number", unit: "Logs/Wk", required: false, min: 0 },
    { key: "maxCapacityPct", label: "Battery Maximum Capacity", type: "number", unit: "%", required: false, min: 0, max: 100 },
    { key: "cycleCount", label: "Battery Cycle Count", type: "number", unit: "Cycles", required: false, min: 0 },
    { key: "geekbenchSingle", label: "Geekbench 6 Single-Core (optional)", type: "number", unit: "Points", required: false, min: 0 },
    { key: "geekbenchMulti", label: "Geekbench 6 Multi-Core (optional)", type: "number", unit: "Points", required: false, min: 0 }
  ],
  fa01: [
    { key: "ownerScore", label: "Owner score", type: "number", unit: "/ 10", required: true, min: 0, max: 10 }
  ],
  fa02: [
    { key: "durationDays", label: "Duration", type: "number", unit: "days", required: true, min: 1, max: 365 },
    { key: "accountsMigrated", label: "Accounts migrated", type: "number", required: false, min: 0, max: 500 },
    { key: "firstWindowsLoginMinutes", label: "First Windows login", type: "number", unit: "minutes", required: false, min: 0, max: 600 }
  ],
  fa03: [
    { key: "usageWeeks", label: "Alternating use period", type: "number", unit: "weeks", required: true, min: 1, max: 104 }
  ],
  exp12: [
    { key: "appLaunchTimeDeltaPct", label: "App Launch Responsiveness Improvement", type: "number", unit: "%", required: true, min: -50, max: 100 },
    { key: "siriAiHandoffLatencyMs", label: "Siri AI Handoff Latency", type: "number", unit: "ms", required: true, min: 100, max: 10000 },
    { key: "standbyBatteryDrainPerHour", label: "Standby Battery Drain Rate", type: "number", unit: "%/hr", required: false, min: 0, max: 10 },
    { key: "headlineFeaturesVerified", label: "Headline Features Functionally Verified", type: "number", unit: "Features", required: false, min: 0, max: 30 }
  ]
};

const enriched = OFFICIAL_EXPERIMENTS.map(exp => {
  const schema = SCHEMAS[exp.id] || [
    { key: "primaryScore", label: "Primary Metric", type: "number", required: true },
    { key: "notes", label: "Observation Notes", type: "string", required: false }
  ];
  return {
    ...exp,
    protocolVersion: exp.protocolVersion || "1.0.0",
    version: exp.version || "1.0.0",
    measurementSchema: schema,
    allowedMeasurementKeys: schema.map(s => s.key)
  };
});

const content = `/**
 * Official Authoritative Experiment Protocols & Findings
 * Source of Truth: WDIII Laboratory Archive (official_wdiii)
 * Step 6 Phase 6A Foundation: Dynamic Measurement Schemas & Allowed Keys
 */

export const OFFICIAL_EXPERIMENTS = ${JSON.stringify(enriched, null, 2)};
`;

fs.writeFileSync('./src/data/official-experiments.js', content, 'utf8');
console.log(`Successfully enriched ${enriched.length} official experiments with dynamic measurementSchema!`);
