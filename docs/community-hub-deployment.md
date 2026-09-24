# Issue #4 continuation status

## Added in this pass

- `firestore.indexes.json` defines the composite indexes required by the paginated Community Hub queries.
- `scripts/test-community-indexes.js` verifies those index definitions.
- `scripts/provision-role-claims.js` validates a role manifest and documents the trusted Admin SDK operation required to synchronize moderator/admin claims.
- `config/moderator-roles.example.json` provides a safe template without real credentials.

## Deployment commands

Deploy indexes with:

```sh
firebase deploy --only firestore:indexes
```

Role claims must be provisioned from a protected Admin SDK environment. Never expose a service-account key or allow browser code to set claims. After provisioning, affected users must refresh their ID token by signing out/in or using `getIdToken(true)`.

## Still not complete

The legacy functions in `src/services/database.js` still need to delegate to the paginated query service. The browser evidence uploader still contains an insecure local data-URL fallback and must be changed to fail closed or use Firebase Storage directly. A Firebase Emulator Suite workflow is still required to prove contributor, moderator, Storage, audit-log, and immutable-approved behavior together.
