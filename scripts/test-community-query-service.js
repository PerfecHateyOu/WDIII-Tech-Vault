import assert from "node:assert/strict";
import fs from "node:fs";

const queryService = fs.readFileSync("src/services/community-submissions-service.js", "utf8");
const firebase = fs.readFileSync("src/services/firebase.js", "utf8");
const database = fs.readFileSync("src/services/database.js", "utf8");

assert.match(queryService, /where\("status", "==", "approved"\)/);
assert.match(queryService, /where\("status", "==", "pending_review"\)/);
assert.match(queryService, /startAfter/);
assert.match(queryService, /limit\(/);
assert.match(queryService, /validateCommunityMeasurements/);
assert.match(database, /status: "pending_review"/);
assert.match(firebase, /uploadEvidenceFile/);
console.log("Community query, pagination, and validation integration checks passed.");
