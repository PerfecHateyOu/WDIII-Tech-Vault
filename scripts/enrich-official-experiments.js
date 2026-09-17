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
    { key: "channelTier", label: "Repair Channel Tier", type: "string", required: true },
    { key: "repairCost", label: "Total Repair Cost", type: "number", unit: "USD", required: true, min: 0, max: 2000 },
    { key: "turnaroundHours", label: "Turnaround Time", type: "number", unit: "Hours", required: true, min: 0, max: 500 },
    { key: "turnaroundDays", label: "Turnaround Days", type: "number", unit: "Days", required: false, min: 0, max: 60 },
    { key: "qualityRating", label: "Repair Quality Rating", type: "number", unit: "/ 10", required: false, min: 1, max: 10 },
    { key: "genuinePartVerified", label: "OEM Genuine Part Verified", type: "boolean", required: false },
    { key: "warrantyMonths", label: "Warranty Coverage", type: "number", unit: "Months", required: false, min: 0, max: 36 }
  ],
  exp3: [
    { key: "holdTimeMinutes", label: "Initial Hold Time", type: "number", unit: "Minutes", required: true, min: 0, max: 180 },
    { key: "waitMinutes", label: "Wait Duration", type: "number", unit: "Minutes", required: false, min: 0, max: 240 },
    { key: "resolutionDays", label: "Resolution Time", type: "number", unit: "Days", required: true, min: 0, max: 90 },
    { key: "escalationsCount", label: "Escalation Count", type: "number", unit: "Tiers", required: false, min: 0, max: 20 },
    { key: "resolutionRate", label: "Resolution Success Rate", type: "number", unit: "%", required: false, min: 0, max: 100 },
    { key: "satisfactionScore", label: "Support Satisfaction Score", type: "number", unit: "Score", required: false, min: 1, max: 10 }
  ],
  exp4: [
    { key: "geekbenchSingleCore", label: "Geekbench Single-Core", type: "number", unit: "Points", required: true, min: 0, max: 10000 },
    { key: "geekbenchMultiCore", label: "Geekbench Multi-Core", type: "number", unit: "Points", required: true, min: 0, max: 30000 },
    { key: "appLaunchRunTime", label: "Cold App Launch Duration", type: "number", unit: "Seconds", required: true, min: 0, max: 30 },
    { key: "thermalPeak", label: "Peak Temperature Under Load", type: "number", unit: "°C", required: false, min: 15, max: 90 },
    { key: "primaryScore", label: "Benchmark Overall Score", type: "number", unit: "Score", required: false, min: 0, max: 50000 }
  ],
  casestudy: [
    { key: "swollenUnits", label: "Swollen Battery Count", type: "number", unit: "Units", required: true, min: 0, max: 100 },
    { key: "controlUnits", label: "Control Batch Size", type: "number", unit: "Units", required: true, min: 1, max: 1000 },
    { key: "peakTempC", label: "Peak Storage Temp", type: "number", unit: "°C", required: false, min: -20, max: 100 },
    { key: "storageTemp", label: "Ambient Storage Temperature", type: "number", unit: "°C", required: false, min: -10, max: 60 },
    { key: "corporateResponseReceived", label: "Formal Manufacturer Response", type: "boolean", required: false }
  ],
  exp5: [
    { key: "screenOnTimeHours", label: "Screen-On Time", type: "number", unit: "Hours", required: true, min: 0, max: 30 },
    { key: "screenOnTimeMinutes", label: "Screen-On Time (Minutes)", type: "number", unit: "Minutes", required: false, min: 0, max: 1800 },
    { key: "chargeTimeMinutes", label: "0-100% Charge Duration", type: "number", unit: "Minutes", required: false, min: 0, max: 300 },
    { key: "peakTempC", label: "Peak Temperature During Fast Charging", type: "number", unit: "°C", required: false, min: 15, max: 80 },
    { key: "standbyDrainPercent", label: "24h Standby Drain", type: "number", unit: "%", required: false, min: 0, max: 100 },
    { key: "batteryHealthPercent", label: "Maximum Battery Health", type: "number", unit: "%", required: false, min: 50, max: 100 }
  ],
  exp6: [
    { key: "intakeWait", label: "Intake Wait Duration", type: "number", unit: "Minutes", required: true, min: 0, max: 240 },
    { key: "repairDuration", label: "Repair Work Duration", type: "number", unit: "Hours", required: true, min: 0, max: 48 },
    { key: "cost", label: "Total Cost", type: "number", unit: "USD", required: true, min: 0, max: 2000 },
    { key: "repairCost", label: "Total Cost (USD)", type: "number", unit: "USD", required: false, min: 0, max: 2000 },
    { key: "systemConfigStatus", label: "Apple System Config Validation", type: "string", required: true },
    { key: "seamUniformity", label: "Chassis Seam Uniformity", type: "number", unit: "/ 10", required: false, min: 1, max: 10 }
  ],
  exp7: [
    { key: "displayPeakNits", label: "Display Peak Brightness", type: "number", unit: "Nits", required: true, min: 100, max: 4000 },
    { key: "tensorThermalThrottle", label: "Thermal Throttle Percent", type: "number", unit: "%", required: true, min: 0, max: 100 },
    { key: "modemSignalDbm", label: "Cellular Signal Strength", type: "number", unit: "dBm", required: false, min: -140, max: -40 },
    { key: "primaryScore", label: "Overall Generational Score", type: "number", unit: "Score", required: false, min: 0, max: 100 }
  ],
  exp9: [
    { key: "telemetryHostsContacted", label: "Telemetry Hosts Contacted", type: "number", unit: "Hosts", required: true, min: 0, max: 500 },
    { key: "airDropHashLeak", label: "AirDrop SHA256 Hash Leak Observed", type: "boolean", required: true },
    { key: "cloudADPEncryptionCoverage", label: "Advanced Data Protection Coverage", type: "number", unit: "%", required: true, min: 0, max: 100 },
    { key: "gatekeeperBypassResistance", label: "Gatekeeper Bypass Resistance", type: "number", unit: "Score", required: false, min: 1, max: 10 }
  ],
  'queued-exp8': [
    { key: "dropCyclesSurvived", label: "Drop Test Cycles Survived", type: "number", unit: "Drops", required: true, min: 0, max: 50 },
    { key: "hingeResistanceDelta", label: "Hinge Torque Degradation", type: "number", unit: "%", required: false, min: 0, max: 100 },
    { key: "ipRatingMaintained", label: "Water/Dust Seal Integrity Maintained", type: "boolean", required: false }
  ],
  'queued-exp10': [
    { key: "crashFrequencyPerWeek", label: "System Crash Frequency", type: "number", unit: "Crashes/Wk", required: true, min: 0, max: 50 },
    { key: "memoryPressureAvg", label: "Average Memory Pressure", type: "number", unit: "%", required: false, min: 0, max: 100 },
    { key: "batteryDegradationMonthly", label: "Monthly Battery Capacity Loss", type: "number", unit: "%", required: false, min: 0, max: 10 }
  ],
  fa01: [
    { key: "codeGenerationSeconds", label: "Generation Latency", type: "number", unit: "Seconds", required: true, min: 1, max: 300 },
    { key: "syntaxCorrectnessScore", label: "Syntax Correctness", type: "number", unit: "/ 10", required: true, min: 1, max: 10 },
    { key: "promptIterations", label: "Refinement Prompts Needed", type: "number", unit: "Prompts", required: false, min: 0, max: 20 },
    { key: "primaryScore", label: "Overall Evaluation Score", type: "number", unit: "Score", required: false, min: 0, max: 100 }
  ],
  fa02: [
    { key: "messagingFriction", label: "SMS/RCS Messaging Friction", type: "number", unit: "/ 10", required: true, min: 1, max: 10 },
    { key: "laptopBatteryDelta", label: "Battery Endurance Delta", type: "number", unit: "Hours", required: true, min: -10, max: 10 },
    { key: "fileTransferFriction", label: "Cross-Device Transfer Friction", type: "number", unit: "/ 10", required: true, min: 1, max: 10 },
    { key: "frictionSeconds", label: "Workflow Delay Duration", type: "number", unit: "Seconds", required: false, min: 0, max: 1000 }
  ],
  fa03: [
    { key: "cinebenchMultiScore", label: "Cinebench Compute Score", type: "number", unit: "Points", required: true, min: 100, max: 30000 },
    { key: "batteryLifeHours", label: "Video Streaming Battery Life", type: "number", unit: "Hours", required: true, min: 1, max: 30 },
    { key: "weightGrams", label: "Measured Chassis Weight", type: "number", unit: "Grams", required: false, min: 500, max: 4000 },
    { key: "primaryScore", label: "Benchmark Overall Score", type: "number", unit: "Score", required: false, min: 0, max: 100 }
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
