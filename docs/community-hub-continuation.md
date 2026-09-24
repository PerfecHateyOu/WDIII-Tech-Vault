# Community Hub continuation notes

The `fix/community-hub-issue-4` branch now contains a dependency-free canonical contract at `src/services/community-hub-contract.js`.

## Contract rules

- Experiment schemas fail closed when missing, malformed, duplicated, or inconsistent with `allowedMeasurementKeys`.
- Numeric measurements require actual finite numbers; numeric strings are not silently coerced.
- Unknown keys, missing required fields, wrong primitive types, and min/max violations are rejected.
- Contributor-originated documents must be owned by the authenticated UID and start at `pending_review`.
- Approved submissions cannot transition to another state.

## Required integration work

The contract must be called by the trusted submission write path before production rollout. The current browser service still performs its own compatible validation, while Firestore rules remain authoritative for identity, status, and immutability. Run `node scripts/test-community-hub-contract.js` in CI while the Firebase Emulator Suite tests are added.

## Authorization migration

Moderator/admin claims must be provisioned through Firebase Admin SDK. A Firestore profile role alone is not sufficient for Storage access. After claims are changed, users must refresh their ID token.
