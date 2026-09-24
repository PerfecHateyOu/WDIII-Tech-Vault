# Moderation and evidence continuation

The branch now includes `src/services/moderation-service.js`.

It provides:

- A paginated moderation-queue facade.
- Consistent authentication and moderator error codes.
- Review-status validation.
- Required reasons for rejection and revision requests.

The existing Firestore rules remain the final authorization boundary. The current browser `reviewSubmission()` implementation still needs to be replaced by a trusted transaction that updates `/submissions/{id}` and appends `/admin_audit_logs/{id}` atomically. Until that is deployed, the UI helper is validation only and must not be treated as a security boundary.

The evidence policy regression test confirms UID-scoped creates, denied overwrites, MIME/size limits, and the default-deny structure. A live Firebase Emulator Storage test is still required before declaring evidence security verified.
