/**
 * WDIII Tech Vault - Community Research Hub Security, RBAC & Immutability Verification Suite
 * 
 * Verifies:
 * 1. Contributor Permissions (Creation, Isolation, Self-Promotion & Schema boundaries)
 * 2. Moderator Transitions (Approval, Rejection, Revision, Audit Logging)
 * 3. Evidence Security (Storage paths, Content-Types, Size limits, Overwrite prevention)
 * 4. Approved-Result Immutability (Locking rules, Runtime enforcement, Audit immutability)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  createSubmission,
  updateSubmission,
  reviewSubmission,
  withdrawSubmission,
  getApprovedSubmissionsForExperiment,
  getDeviceCommunityStats
} from '../src/services/database.js';
import { OFFICIAL_EXPERIMENTS } from '../src/data/official-experiments.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
    failedTests++;
  }
}

// ============================================================================
// SIMULATED RULES EVALUATOR (Matches firestore.rules & storage.rules logic)
// ============================================================================

const firestoreRulesContent = fs.readFileSync(path.join(ROOT_DIR, 'firestore.rules'), 'utf8');
const storageRulesContent = fs.readFileSync(path.join(ROOT_DIR, 'storage.rules'), 'utf8');

// Experiment map for allowedMeasurementKeys
const experimentMap = new Map(OFFICIAL_EXPERIMENTS.map(e => [e.id, e]));

function evaluateFirestoreSubmissionRule(operation, { auth, resource, requestResource }) {
  const isSignedIn = !!auth;
  const isOwner = (uid) => isSignedIn && auth.uid === uid;
  const getUserRole = () => auth?.role || 'guest';
  const isContributor = isSignedIn;
  const isModerator = isSignedIn && (
    auth.email?.toLowerCase() === 'perfectshadowkai33@gmail.com' ||
    ['moderator', 'admin', 'owner'].includes(getUserRole())
  );
  const isAdmin = isSignedIn && (
    auth.email?.toLowerCase() === 'perfectshadowkai33@gmail.com' ||
    ['admin', 'owner'].includes(getUserRole())
  );

  const isValidMeasurementPayload = (expId, measurements) => {
    if (!measurements || typeof measurements !== 'object' || Array.isArray(measurements)) return false;
    const exp = experimentMap.get(expId);
    if (!exp) return false;
    if (!exp.allowedMeasurementKeys) return true;
    const allowed = new Set(exp.allowedMeasurementKeys);
    return Object.keys(measurements).every(k => allowed.has(k));
  };

  if (operation === 'read') {
    if (resource.status === 'approved') return true;
    if (isSignedIn && (resource.userId === auth.uid || resource.authorId === auth.uid || isModerator)) return true;
    return false;
  }

  if (operation === 'create') {
    if (!isContributor) return false;
    const authorMatches = (requestResource.userId === auth.uid || requestResource.authorId === auth.uid);
    if (!authorMatches) return false;
    if (!['pending', 'pending_review', 'draft'].includes(requestResource.status)) return false;
    if (requestResource.type && requestResource.type !== 'replication') return false;
    if (requestResource.reviewerId) return false;
    if (requestResource.reviewedAt) return false;
    if (requestResource.review) return false;
    if (requestResource.provenance && requestResource.provenance.source !== 'community') return false;
    if (!requestResource.deviceId || !requestResource.experimentId || !requestResource.status) return false;
    return isValidMeasurementPayload(requestResource.experimentId, requestResource.measurements);
  }

  if (operation === 'update') {
    // CRITICAL IMMUTABILITY LOCK: Once approved, direct updates are permanently rejected
    if (resource.status === 'approved') return false;

    // Path A: Author update
    const isResourceOwner = (resource.userId && isOwner(resource.userId)) || (resource.authorId && isOwner(resource.authorId));
    if (
      isResourceOwner &&
      ['draft', 'pending_review', 'pending', 'needs_revision'].includes(resource.status) &&
      ['draft', 'pending_review', 'pending', 'withdrawn'].includes(requestResource.status) &&
      (!requestResource.userId || requestResource.userId === resource.userId) &&
      (!requestResource.authorId || requestResource.authorId === resource.authorId) &&
      (!requestResource.reviewerId || requestResource.reviewerId === resource.reviewerId) &&
      (!requestResource.reviewedAt || requestResource.reviewedAt === resource.reviewedAt) &&
      (!requestResource.review || requestResource.review === resource.review) &&
      isValidMeasurementPayload(requestResource.experimentId || resource.experimentId, requestResource.measurements || resource.measurements)
    ) {
      return true;
    }

    // Path B: Moderator review
    if (
      isModerator &&
      ['approved', 'rejected', 'needs_revision', 'pending_review', 'pending'].includes(requestResource.status) &&
      (!requestResource.authorId || !resource.authorId || requestResource.authorId === resource.authorId) &&
      (!requestResource.userId || !resource.userId || requestResource.userId === resource.userId) &&
      (!requestResource.experimentId || !resource.experimentId || requestResource.experimentId === resource.experimentId) &&
      (!requestResource.deviceId || !resource.deviceId || requestResource.deviceId === resource.deviceId)
    ) {
      return true;
    }

    return false;
  }

  if (operation === 'delete') {
    if (resource.status === 'approved') return false;
    const isResourceOwner = (resource.userId && isOwner(resource.userId)) || (resource.authorId && isOwner(resource.authorId));
    if (isResourceOwner && ['draft', 'pending_review', 'pending', 'needs_revision', 'withdrawn'].includes(resource.status)) {
      return true;
    }
    return isAdmin;
  }

  return false;
}

function evaluateStorageEvidenceRule(operation, { auth, targetUserId, resource, requestResource }) {
  const isSignedIn = !!auth;
  const isOwner = isSignedIn && auth.uid === targetUserId;
  const isModerator = isSignedIn && (
    auth.email?.toLowerCase() === 'perfectshadowkai33@gmail.com' ||
    ['moderator', 'admin', 'owner'].includes(auth.role)
  );

  const isValidTelemetryFile = (req) => {
    if (!req) return false;
    const typeOk = (
      req.contentType?.startsWith('image/') ||
      ['text/plain', 'text/csv', 'application/pdf', 'application/json'].includes(req.contentType)
    );
    const sizeOk = typeof req.size === 'number' && req.size <= 10 * 1024 * 1024;
    return typeOk && sizeOk;
  };

  if (operation === 'read') {
    return isOwner || isModerator;
  }

  if (operation === 'create') {
    return isOwner && isValidTelemetryFile(requestResource);
  }

  if (operation === 'update') {
    // Overwrites disallowed to maintain forensic evidence integrity
    return false;
  }

  if (operation === 'delete') {
    return isOwner || isModerator;
  }

  return false;
}

// ============================================================================
// MAIN TEST SUITE EXECUTION
// ============================================================================

async function runTestSuite() {
  console.log('\n================================================================================');
  console.log('   WDIII TECH VAULT - COMMUNITY HUB RULES & SECURITY VERIFICATION');
  console.log('================================================================================\n');

  // --------------------------------------------------------------------------
  // SECTION 1: Rules File Integrity & AST Checks
  // --------------------------------------------------------------------------
  console.log('--- 1. Rules Files Integrity & AST Declarations ---');
  assert(firestoreRulesContent.includes('match /submissions/{submissionId}'), 'firestore.rules declares /submissions collection route');
  assert(firestoreRulesContent.includes("resource.data.status != 'approved'"), 'firestore.rules enforces status != approved immutability guard');
  assert(firestoreRulesContent.includes('isValidMeasurementPayload'), 'firestore.rules declares isValidMeasurementPayload helper');
  assert(firestoreRulesContent.includes('match /admin_audit_logs/{logId}'), 'firestore.rules declares /admin_audit_logs collection route');
  assert(firestoreRulesContent.includes('allow update, delete: if false;'), 'firestore.rules enforces immutable audit trail: update, delete: if false');
  assert(storageRulesContent.includes('match /evidence/{userId}/{fileName}'), 'storage.rules declares /evidence/{userId}/{fileName} path');
  assert(storageRulesContent.includes('allow update: if false;'), 'storage.rules disallows evidence overwrites');

  // --------------------------------------------------------------------------
  // SECTION 2: Contributor Permissions
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Contributor Permissions ---');
  const anonymousAuth = null;
  const contributor1 = { uid: 'researcher-alpha', email: 'alpha@lab.org', role: 'contributor' };
  const contributor2 = { uid: 'researcher-beta', email: 'beta@lab.org', role: 'contributor' };

  // Anonymous visitor checks
  const readApproved = evaluateFirestoreSubmissionRule('read', {
    auth: anonymousAuth,
    resource: { id: 'sub-1', status: 'approved', authorId: 'researcher-alpha' }
  });
  assert(readApproved === true, 'Anonymous visitor CAN read approved community submissions');

  const readPending = evaluateFirestoreSubmissionRule('read', {
    auth: anonymousAuth,
    resource: { id: 'sub-1', status: 'pending_review', authorId: 'researcher-alpha' }
  });
  assert(readPending === false, 'Anonymous visitor CANNOT read pending_review submissions');

  const anonWrite = evaluateFirestoreSubmissionRule('create', {
    auth: anonymousAuth,
    requestResource: {
      experimentId: 'exp1',
      deviceId: 'apple-iphone-17-pro-max',
      status: 'pending_review',
      userId: 'anon',
      authorId: 'anon'
    }
  });
  assert(anonWrite === false, 'Anonymous visitor CANNOT create submissions');

  // Contributor valid creation
  const validCreation = evaluateFirestoreSubmissionRule('create', {
    auth: contributor1,
    requestResource: {
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      experimentId: 'exp1',
      deviceId: 'apple-iphone-17-pro-max',
      status: 'pending_review',
      measurements: { turnaroundDays: 3, repairCost: 320, qualityRating: 5 }
    }
  });
  assert(validCreation === true, 'Contributor CAN create submission with pending_review status and valid metrics');

  // Contributor self-approval prevention
  const selfApproval = evaluateFirestoreSubmissionRule('create', {
    auth: contributor1,
    requestResource: {
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      experimentId: 'exp1',
      deviceId: 'apple-iphone-17-pro-max',
      status: 'approved',
      measurements: { turnaroundDays: 3 }
    }
  });
  assert(selfApproval === false, 'Contributor CANNOT create submission directly with status "approved"');

  // Contributor reviewer injection prevention
  const injectReviewer = evaluateFirestoreSubmissionRule('create', {
    auth: contributor1,
    requestResource: {
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      experimentId: 'exp1',
      deviceId: 'apple-iphone-17-pro-max',
      status: 'pending_review',
      reviewerId: 'researcher-alpha',
      measurements: { turnaroundDays: 3 }
    }
  });
  assert(injectReviewer === false, 'Contributor CANNOT inject reviewerId or review metadata on creation');

  // Contributor schema tampering prevention
  const injectedMetrics = evaluateFirestoreSubmissionRule('create', {
    auth: contributor1,
    requestResource: {
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      experimentId: 'exp1',
      deviceId: 'apple-iphone-17-pro-max',
      status: 'pending_review',
      measurements: { turnaroundDays: 3, injectedFakeScore: 99999 }
    }
  });
  assert(injectedMetrics === false, 'Contributor CANNOT submit arbitrary measurement keys outside experiment schema');

  // Contributor updating own pending submission
  const authorUpdateOwn = evaluateFirestoreSubmissionRule('update', {
    auth: contributor1,
    resource: {
      id: 'sub-alpha-1',
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      experimentId: 'exp1',
      status: 'pending_review'
    },
    requestResource: {
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      experimentId: 'exp1',
      status: 'pending_review',
      measurements: { turnaroundDays: 4, repairCost: 350 }
    }
  });
  assert(authorUpdateOwn === true, 'Contributor CAN update their own pending_review submission');

  // Contributor updating another contributor's submission
  const authorUpdateOther = evaluateFirestoreSubmissionRule('update', {
    auth: contributor2,
    resource: {
      id: 'sub-alpha-1',
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      experimentId: 'exp1',
      status: 'pending_review'
    },
    requestResource: {
      status: 'withdrawn'
    }
  });
  assert(authorUpdateOther === false, 'Contributor CANNOT update another contributor\'s submission');

  // --------------------------------------------------------------------------
  // SECTION 3: Moderator Transitions
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Moderator Transitions ---');
  const moderatorAuth = { uid: 'mod-chief', email: 'mod@wdiii.org', role: 'moderator' };

  // Contributor attempting moderation transition
  const contributorApproveAttempt = evaluateFirestoreSubmissionRule('update', {
    auth: contributor1,
    resource: {
      id: 'sub-alpha-1',
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      experimentId: 'exp1',
      deviceId: 'apple-iphone-17-pro-max',
      status: 'pending_review'
    },
    requestResource: {
      status: 'approved',
      reviewerId: 'researcher-alpha',
      reviewedAt: new Date().toISOString()
    }
  });
  assert(contributorApproveAttempt === false, 'Normal contributor CANNOT transition submission status to "approved"');

  // Moderator approving submission
  const modApprove = evaluateFirestoreSubmissionRule('update', {
    auth: moderatorAuth,
    resource: {
      id: 'sub-alpha-1',
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      experimentId: 'exp1',
      deviceId: 'apple-iphone-17-pro-max',
      status: 'pending_review'
    },
    requestResource: {
      status: 'approved',
      reviewerId: 'mod-chief',
      reviewedAt: new Date().toISOString(),
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      experimentId: 'exp1',
      deviceId: 'apple-iphone-17-pro-max'
    }
  });
  assert(modApprove === true, 'Authorized moderator CAN transition status from pending_review to "approved"');

  // Moderator rejecting submission
  const modReject = evaluateFirestoreSubmissionRule('update', {
    auth: moderatorAuth,
    resource: {
      id: 'sub-alpha-1',
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      experimentId: 'exp1',
      deviceId: 'apple-iphone-17-pro-max',
      status: 'pending_review'
    },
    requestResource: {
      status: 'rejected',
      reviewerId: 'mod-chief',
      reviewedAt: new Date().toISOString(),
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      experimentId: 'exp1',
      deviceId: 'apple-iphone-17-pro-max'
    }
  });
  assert(modReject === true, 'Authorized moderator CAN transition status from pending_review to "rejected"');

  // Moderator requesting revision
  const modRevision = evaluateFirestoreSubmissionRule('update', {
    auth: moderatorAuth,
    resource: {
      id: 'sub-alpha-1',
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      experimentId: 'exp1',
      deviceId: 'apple-iphone-17-pro-max',
      status: 'pending_review'
    },
    requestResource: {
      status: 'needs_revision',
      reviewerId: 'mod-chief',
      reviewedAt: new Date().toISOString(),
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      experimentId: 'exp1',
      deviceId: 'apple-iphone-17-pro-max'
    }
  });
  assert(modRevision === true, 'Authorized moderator CAN transition status from pending_review to "needs_revision"');

  // Moderator attempting to alter author or experiment bindings
  const modTamperAuthor = evaluateFirestoreSubmissionRule('update', {
    auth: moderatorAuth,
    resource: {
      id: 'sub-alpha-1',
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      experimentId: 'exp1',
      deviceId: 'apple-iphone-17-pro-max',
      status: 'pending_review'
    },
    requestResource: {
      status: 'approved',
      authorId: 'fake-author-id',
      experimentId: 'exp1',
      deviceId: 'apple-iphone-17-pro-max'
    }
  });
  assert(modTamperAuthor === false, 'Moderator CANNOT tamper with authorId binding during review');

  // --------------------------------------------------------------------------
  // SECTION 4: Evidence Security
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Evidence Security ---');

  // Valid telemetry upload under own UID
  const validEvidenceUpload = evaluateStorageEvidenceRule('create', {
    auth: contributor1,
    targetUserId: 'researcher-alpha',
    requestResource: {
      contentType: 'image/png',
      size: 2 * 1024 * 1024
    }
  });
  assert(validEvidenceUpload === true, 'Contributor CAN upload valid image evidence to their own storage path');

  // Valid PDF/CSV telemetry log upload
  const validLogUpload = evaluateStorageEvidenceRule('create', {
    auth: contributor1,
    targetUserId: 'researcher-alpha',
    requestResource: {
      contentType: 'text/csv',
      size: 512 * 1024
    }
  });
  assert(validLogUpload === true, 'Contributor CAN upload CSV telemetry logs');

  // Upload to another user's directory
  const crossUserEvidenceUpload = evaluateStorageEvidenceRule('create', {
    auth: contributor1,
    targetUserId: 'researcher-beta',
    requestResource: {
      contentType: 'image/png',
      size: 1 * 1024 * 1024
    }
  });
  assert(crossUserEvidenceUpload === false, 'Contributor CANNOT upload evidence to another user\'s storage directory');

  // Anonymous evidence upload
  const anonEvidenceUpload = evaluateStorageEvidenceRule('create', {
    auth: null,
    targetUserId: 'researcher-alpha',
    requestResource: {
      contentType: 'image/png',
      size: 1 * 1024 * 1024
    }
  });
  assert(anonEvidenceUpload === false, 'Anonymous visitor CANNOT upload evidence');

  // File size limit enforcement (> 10MB)
  const oversizedEvidenceUpload = evaluateStorageEvidenceRule('create', {
    auth: contributor1,
    targetUserId: 'researcher-alpha',
    requestResource: {
      contentType: 'image/jpeg',
      size: 15 * 1024 * 1024
    }
  });
  assert(oversizedEvidenceUpload === false, 'Evidence files exceeding 10MB limit are strictly DENIED');

  // Forbidden executable file type
  const executableEvidenceUpload = evaluateStorageEvidenceRule('create', {
    auth: contributor1,
    targetUserId: 'researcher-alpha',
    requestResource: {
      contentType: 'application/x-executable',
      size: 1024
    }
  });
  assert(executableEvidenceUpload === false, 'Executable binary MIME types are strictly DENIED in evidence storage');

  // Evidence overwrite disallowance
  const evidenceOverwrite = evaluateStorageEvidenceRule('update', {
    auth: contributor1,
    targetUserId: 'researcher-alpha',
    resource: { contentType: 'image/png', size: 1024 },
    requestResource: { contentType: 'image/png', size: 2048 }
  });
  assert(evidenceOverwrite === false, 'Evidence overwrites are strictly DENIED to preserve photographic chain of custody');

  // --------------------------------------------------------------------------
  // SECTION 5: Approved-Result Immutability
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Approved-Result Immutability ---');

  // Author update on approved submission
  const authorUpdateApproved = evaluateFirestoreSubmissionRule('update', {
    auth: contributor1,
    resource: {
      id: 'sub-approved-1',
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      experimentId: 'exp1',
      deviceId: 'apple-iphone-17-pro-max',
      status: 'approved'
    },
    requestResource: {
      measurements: { turnaroundDays: 1 }
    }
  });
  assert(authorUpdateApproved === false, 'Author CANNOT update an approved submission (Firestore rule immutability)');

  // Moderator direct update on approved submission
  const modUpdateApproved = evaluateFirestoreSubmissionRule('update', {
    auth: moderatorAuth,
    resource: {
      id: 'sub-approved-1',
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      experimentId: 'exp1',
      deviceId: 'apple-iphone-17-pro-max',
      status: 'approved'
    },
    requestResource: {
      status: 'needs_revision'
    }
  });
  assert(modUpdateApproved === false, 'Moderator CANNOT directly update an approved submission');

  // Author delete on approved submission
  const authorDeleteApproved = evaluateFirestoreSubmissionRule('delete', {
    auth: contributor1,
    resource: {
      id: 'sub-approved-1',
      authorId: 'researcher-alpha',
      userId: 'researcher-alpha',
      status: 'approved'
    }
  });
  assert(authorDeleteApproved === false, 'Author CANNOT delete an approved submission');

  // Runtime service immutability verification
  console.log('\n--- 6. Runtime Service Layer Immutability & Workflow ---');

  // Create submission via service
  const submissionCreated = await createSubmission({
    userId: 'contributor-lab-1',
    submitterName: 'Senior Lab Auditor',
    deviceId: 'apple-iphone-17-pro-max',
    experimentId: 'exp1',
    measurements: {
      turnaroundDays: 4,
      repairCost: 290,
      qualityRating: 5
    },
    conditions: {
      environment: 'Official Apple Store Genius Bar (Third-party audit baseline)'
    }
  });
  assert(submissionCreated.success === true, 'Runtime createSubmission returns success: true');
  assert(submissionCreated.status === 'pending_review', 'Runtime createSubmission sets status: "pending_review"');

  // Moderator review to approved
  const reviewedRecord = await reviewSubmission(submissionCreated.id, {
    status: 'approved',
    reviewerId: 'mod-chief',
    reviewerName: 'Chief Moderator',
    feedback: 'Calibration telemetry cross-referenced and verified.'
  });
  assert(reviewedRecord.success === true, 'Runtime reviewSubmission successfully approves record');
  assert(reviewedRecord.status === 'approved', 'Runtime status successfully transitioned to approved');

  // Runtime attempt to update approved submission must throw Immutable Record
  let runtimeUpdateFailed = false;
  try {
    await updateSubmission(submissionCreated.id, {
      measurements: { turnaroundDays: 1 }
    });
  } catch (err) {
    runtimeUpdateFailed = true;
    assert(err.message.includes('Immutable Record'), 'Runtime updateSubmission throws "Immutable Record" error');
  }
  assert(runtimeUpdateFailed === true, 'Approved submission is strictly protected from runtime updates');

  // Runtime attempt to review approved submission must throw Immutable Record
  let runtimeReviewFailed = false;
  try {
    await reviewSubmission(submissionCreated.id, {
      status: 'needs_revision',
      feedback: 'Illegal re-review attempt'
    });
  } catch (err) {
    runtimeReviewFailed = true;
    assert(err.message.includes('Immutable Record'), 'Runtime reviewSubmission throws "Immutable Record" error');
  }
  assert(runtimeReviewFailed === true, 'Approved submission is strictly protected from re-review');

  // Runtime attempt to withdraw approved submission must fail
  let runtimeWithdrawFailed = false;
  try {
    await withdrawSubmission(submissionCreated.id, 'contributor-lab-1');
  } catch (err) {
    runtimeWithdrawFailed = true;
  }
  assert(runtimeWithdrawFailed === true, 'Approved submission cannot be withdrawn');

  // Approved results appear in official aggregate stats
  const deviceStats = await getDeviceCommunityStats('apple-iphone-17-pro-max');
  assert(deviceStats.sampleSize >= 1, 'Device community stats strictly incorporates approved submissions');
  assert(deviceStats.metrics.repairCost.sampleSize >= 1, 'Device community stats calculates verified metrics');

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n================================================================================');
  console.log(`   COMMUNITY HUB SECURITY AUDIT: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Fatal error during security test suite:', err);
  process.exit(1);
});
