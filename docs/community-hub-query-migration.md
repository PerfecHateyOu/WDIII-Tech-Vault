# Community Hub continuation plan

## Completed in this continuation

- Added `community-submissions-service.js` with query-oriented approved, pending, and user submission accessors.
- Added cursor pagination using `startAfter` and bounded page sizes.
- Added a shared pre-write validation entry point using the canonical contract.
- Added regression checks for filtered queries, pagination, and validation integration.

## Firestore indexes

The new queries require composite indexes for:

- `status ASC, experimentId ASC, createdAt DESC`
- `status ASC, deviceId ASC, createdAt DESC`
- `status ASC, createdAt ASC`
- `authorId ASC, createdAt DESC`

Deploy indexes with the Firebase CLI after adding the project configuration. If Firestore reports a missing index, use its generated index URL or add the equivalent definition to `firestore.indexes.json`.

## Remaining production integration

The existing `database.js` accessors still contain legacy full-collection implementations. Replace their bodies with calls to the query service after confirming indexes in the target Firebase project. Keep the old implementation only as a temporary offline fallback; do not use it for production-scale submission collections.

Evidence uploads must also fail closed when Firebase Storage is unavailable. A base64 data URL should not be persisted as permanent evidence because it bypasses Storage access control and inflates Firestore documents.
