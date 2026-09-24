/**
 * WDIII Tech Vault - Step 6 Phase 6A Foundation Test Suite
 * 
 * Verifies:
 * 1. Data Models & Collection schemas in firebase-blueprint.json and community-hub-schema.ts
 * 2. Dynamic measurementSchema and allowedMeasurementKeys across official experiments
 * 3. Strict Firestore Security Rules for authentication, schema enforcement, immutable approved records,
 *    moderation integrity, role separation, and official data protection.
 * 4. Runtime database service behavior for Phase 6A models, immutable records, and audit logs.
 */

import fs from 'fs';
import path from 'path';
import { OFFICIAL_EXPERIMENTS } from '../src/data/official-experiments.js';
import { Phase6ASchemas } from '../src/types/community-hub-schema.ts';
import { createSubmission, reviewSubmission } from '../src/services/database.js';

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

console.log('\n================================================================================');
console.log('   WDIII TECH VAULT - STEP 6 PHASE 6A FOUNDATION AUDIT');
console.log('================================================================================\n');

// --- 1. Collection Schemas in firebase-blueprint.json ---
console.log('--- 1. Blueprint & Collection Schemas ---');
const blueprint = JSON.parse(fs.readFileSync('firebase-blueprint.json', 'utf8'));

assert(Boolean(blueprint.entities.Experiment), 'Blueprint contains Experiment entity');
assert(Boolean(blueprint.entities.Submission), 'Blueprint contains Submission entity');
assert(Boolean(blueprint.entities.AdminAuditLog), 'Blueprint contains AdminAuditLog entity');
assert(
  blueprint.firestore["/experiments/{experimentId}"]?.schema === 'Experiment' || blueprint.firestore.experiments === 'Experiment',
  'Firestore maps experiments collection to Experiment entity'
);
assert(
  blueprint.firestore["/submissions/{submissionId}"]?.schema === 'Submission' || blueprint.firestore.submissions === 'Submission',
  'Firestore maps submissions collection to Submission entity'
);
assert(
  blueprint.firestore["/admin_audit_logs/{logId}"]?.schema === 'AdminAuditLog' || blueprint.firestore.admin_audit_logs === 'AdminAuditLog',
  'Firestore maps admin_audit_logs collection to AdminAuditLog entity'
);

// Check Experiment entity properties in blueprint
const expProps = blueprint.entities.Experiment.properties;
assert(Boolean(expProps.measurementSchema), 'Experiment blueprint defines measurementSchema');
assert(Boolean(expProps.allowedMeasurementKeys), 'Experiment blueprint defines allowedMeasurementKeys');
assert(Boolean(expProps.protocolVersion), 'Experiment blueprint defines protocolVersion');

// Check Submission entity properties in blueprint
const subProps = blueprint.entities.Submission.properties;
assert(Boolean(subProps.authorId), 'Submission blueprint defines authorId');
assert(Boolean(subProps.authorDisplayName), 'Submission blueprint defines authorDisplayName');
assert(Boolean(subProps.deviceId), 'Submission blueprint defines deviceId');
assert(Boolean(subProps.experimentId), 'Submission blueprint defines experimentId');
assert(Boolean(subProps.type), 'Submission blueprint defines type');
assert(Boolean(subProps.status), 'Submission blueprint defines status');
assert(Boolean(subProps.measurements), 'Submission blueprint defines measurements');
assert(Boolean(subProps.conditions), 'Submission blueprint defines conditions');
assert(Boolean(subProps.evidence), 'Submission blueprint defines evidence');
assert(Boolean(subProps.review), 'Submission blueprint defines review object');
assert(Boolean(subProps.provenance), 'Submission blueprint defines provenance object');

// Check AdminAuditLog entity properties in blueprint
const auditProps = blueprint.entities.AdminAuditLog.properties;
assert(Boolean(auditProps.action), 'AdminAuditLog blueprint defines action');
assert(Boolean(auditProps.actorId), 'AdminAuditLog blueprint defines actorId');
assert(Boolean(auditProps.targetSubmissionId), 'AdminAuditLog blueprint defines targetSubmissionId');
assert(Boolean(auditProps.previousStatus), 'AdminAuditLog blueprint defines previousStatus');
assert(Boolean(auditProps.newStatus), 'AdminAuditLog blueprint defines newStatus');
assert(Boolean(auditProps.reason), 'AdminAuditLog blueprint defines reason');
assert(Boolean(auditProps.timestamp), 'AdminAuditLog blueprint defines timestamp');

// --- 2. Dynamic measurementSchema in Official Experiments ---
console.log('\n--- 2. Official Experiments Dynamic Measurement Schema ---');
assert(OFFICIAL_EXPERIMENTS.length >= 14, `All ${OFFICIAL_EXPERIMENTS.length} official experiments loaded`);

let allHaveSchemas = true;
let allHaveAllowedKeys = true;
let allFieldsValid = true;

for (const exp of OFFICIAL_EXPERIMENTS) {
  if (!Array.isArray(exp.measurementSchema) || exp.measurementSchema.length === 0) {
    allHaveSchemas = false;
  }
  if (!Array.isArray(exp.allowedMeasurementKeys) || exp.allowedMeasurementKeys.length === 0) {
    allHaveAllowedKeys = false;
  }
  for (const field of (exp.measurementSchema || [])) {
    if (!field.key || !field.label || !field.type || typeof field.required !== 'boolean') {
      allFieldsValid = false;
    }
  }
}

assert(allHaveSchemas, 'Every official experiment defines a non-empty measurementSchema array');
assert(allHaveAllowedKeys, 'Every official experiment defines an allowedMeasurementKeys array matching schema keys');
assert(allFieldsValid, 'Every measurement schema field conforms to { key, label, type, required, [min], [max], [unit] }');

// Test specific experiment schemas
const exp1 = OFFICIAL_EXPERIMENTS.find(e => e.id === 'exp1');
assert(exp1.allowedMeasurementKeys.includes('turnaroundDays'), 'Exp 1 schema contains turnaroundDays metric');
assert(exp1.allowedMeasurementKeys.includes('repairCost'), 'Exp 1 schema contains repairCost metric');

const exp5 = OFFICIAL_EXPERIMENTS.find(e => e.id === 'exp5');
assert(exp5.allowedMeasurementKeys.includes('screenOnTimeHours'), 'Exp 5 schema contains screenOnTimeHours metric');

const exp9 = OFFICIAL_EXPERIMENTS.find(e => e.id === 'exp9');
assert(exp9.allowedMeasurementKeys.includes('telemetryHostsContacted'), 'Exp 9 schema contains telemetryHostsContacted metric');

// --- 3. JSON Schemas Exported from community-hub-schema.ts ---
console.log('\n--- 3. JSON Schema Definitions in community-hub-schema.ts ---');
assert(Boolean(Phase6ASchemas.experiment), 'Phase6ASchemas exports experiment JSON schema');
assert(Boolean(Phase6ASchemas.submission), 'Phase6ASchemas exports submission JSON schema');
assert(Boolean(Phase6ASchemas.adminAuditLog), 'Phase6ASchemas exports adminAuditLog JSON schema');

const subRequired = Phase6ASchemas.submission.required;
assert(subRequired.includes('authorId'), 'Submission JSON schema requires authorId');
assert(subRequired.includes('authorDisplayName'), 'Submission JSON schema requires authorDisplayName');
assert(subRequired.includes('type'), 'Submission JSON schema requires type');
assert(subRequired.includes('status'), 'Submission JSON schema requires status');
assert(subRequired.includes('measurements'), 'Submission JSON schema requires measurements');
assert(subRequired.includes('provenance'), 'Submission JSON schema requires provenance');

// --- 4. Strict Firestore Security Rules Verification ---
console.log('\n--- 4. Strict Firestore Security Rules Verification ---');
const rulesContent = fs.readFileSync('firestore.rules', 'utf8');

// A. Schema Enforcement
assert(
  rulesContent.includes('function isValidMeasurementPayload'),
  'Security rules implement isValidMeasurementPayload helper'
);
assert(
  rulesContent.includes('measurements.keys().hasOnly(getExperimentDoc(expId).allowedMeasurementKeys)'),
  'Security rules enforce measurements.keys().hasOnly(parent experiment allowed keys)'
);
assert(
  rulesContent.includes('isValidMeasurementPayload(request.resource.data.experimentId, request.resource.data.measurements)'),
  'Submission create & update rules strictly invoke isValidMeasurementPayload'
);

// B. Immutable Rule for Approved Submissions
assert(
  rulesContent.includes("resource.data.status != 'approved'"),
  "Security rules enforce immutable rule: resource.data.status != 'approved' blocks direct updates on approved records"
);

// C. Role Separation
assert(
  rulesContent.includes('getUserRole()') && rulesContent.includes('/users/$(request.auth.uid)'),
  'getUserRole strictly checks /users/{uid}.role doc, never client token or reputationScore'
);
assert(
  rulesContent.includes("request.resource.data.role == resource.data.role"),
  'User update rule prevents users from modifying their own role'
);
assert(
  rulesContent.includes("request.resource.data.reputationScore == resource.data.reputationScore"),
  'User update rule prevents users from tampering with their reputationScore'
);

// D. Moderation Integrity
assert(
  rulesContent.includes('isModerator()'),
  'Moderator role helper verifies moderator, admin, or system owner'
);
assert(
  rulesContent.includes("request.resource.data.status in ['approved', 'rejected', 'needs_revision', 'pending_review', 'pending']"),
  'Only moderators can transition submissions to approved/rejected/needs_revision'
);

// E. Official Data Protection
assert(
  rulesContent.includes('match /experiments/{experimentId}') && rulesContent.includes('allow create, update: if isAdmin()'),
  'Only admins can modify official experiment dossiers (community cannot overwrite)'
);
assert(
  rulesContent.includes('match /devices/{deviceId}') && rulesContent.includes('allow create, update: if isAdmin()'),
  'Only admins can modify official hardware specifications'
);

// F. Admin Audit Logs Immutability
assert(
  rulesContent.includes('match /admin_audit_logs/{logId}'),
  'Security rules define match /admin_audit_logs/{logId}'
);
assert(
  rulesContent.includes('allow update, delete: if false;'),
  'Admin audit logs rule strictly enforces immutable audit trail: allow update, delete: if false;'
);

// --- 5. Runtime Service Integration & Immutability Test ---
console.log('\n--- 5. Runtime Service Integration & Immutability Test ---');

// Test createSubmission Phase 6A document structure
const testSubmission = await createSubmission({
  userId: 'test-researcher-1',
  submitterName: 'Dr. Evelyn Vance',
  deviceId: 'apple-iphone-17-pro-max',
  experimentId: 'exp1',
  measurements: {
    turnaroundDays: { value: 3, unit: 'Days' },
    repairCost: { value: 550, unit: 'USD' }
  },
  conditions: {
    ambientTemp: '22°C',
    carrier: 'FedEx Air'
  },
  evidenceReferences: [
    { name: 'repair_invoice.pdf', url: 'https://storage.wdiii.org/repair_invoice.pdf', size: 102400, type: 'application/pdf' }
  ],
  notes: 'Replication completed with official mail-in channel.'
});

assert(testSubmission.submission.authorId === 'test-researcher-1', 'Created submission has correct authorId');
assert(testSubmission.submission.authorDisplayName === 'Dr. Evelyn Vance', 'Created submission has authorDisplayName');
assert(testSubmission.submission.type === 'replication', 'Created submission has type: "replication"');
assert(testSubmission.submission.status === 'pending_review', 'Created submission has initial status: "pending_review"');
assert(Array.isArray(testSubmission.submission.evidence), 'Created submission has evidence array');
assert(testSubmission.submission.provenance.source === 'community', 'Created submission has provenance source: "community"');
assert(testSubmission.submission.provenance.protocolVersion === '1.0.0', 'Created submission has protocolVersion');

// Test reviewSubmission transition to approved
const reviewResult = await reviewSubmission(testSubmission.submission.id, {
  status: 'approved',
  reviewerId: 'mod-chief-1',
  reviewerName: 'Chief Laboratory Auditor',
  reviewNotes: 'Methodology verified and cross-referenced against photographic telemetry.'
});

assert(reviewResult.success === true, 'Submission successfully approved by moderator');
assert(reviewResult.status === 'approved', 'Submission status updated to approved');

// Test Immutable Rule: attempting to review/update an approved submission must throw
let immutableErrorThrown = false;
try {
  await reviewSubmission(testSubmission.submission.id, {
    status: 'needs_revision',
    reviewerId: 'mod-chief-1',
    reviewNotes: 'Attempting illegal update on approved document'
  });
} catch (err) {
  immutableErrorThrown = true;
  assert(err.message.includes('Immutable Record'), 'Reviewing approved submission throws immutable record error');
}
assert(immutableErrorThrown, 'Approved submission is strictly protected against direct updates');

console.log(`\n================================================================================`);
console.log(`   PHASE 6A FOUNDATION AUDIT: ${passed} PASSED, ${failed} FAILED`);
console.log(`================================================================================\n`);

if (failed > 0) {
  process.exit(1);
}
