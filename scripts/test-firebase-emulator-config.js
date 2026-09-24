import assert from "node:assert/strict";
import fs from "node:fs";

const firebase = JSON.parse(fs.readFileSync("firebase.json", "utf8"));
assert.equal(firebase.firestore.rules, "firestore.rules");
assert.equal(firebase.firestore.indexes, "firestore.indexes.json");
assert.equal(firebase.storage.rules, "storage.rules");
assert.ok(firebase.emulators.firestore && firebase.emulators.storage, "emulator services are configured");
console.log("Firebase emulator configuration checks passed.");
