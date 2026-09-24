import assert from "node:assert/strict";
import fs from "node:fs";

const indexes = JSON.parse(fs.readFileSync("firestore.indexes.json", "utf8"));
const indexFields = indexes.indexes.map(index => index.fields.map(field => `${field.fieldPath}:${field.order}`).join(","));

assert.ok(indexFields.some(value => value.includes("status:ASCENDING") && value.includes("experimentId:ASCENDING")), "approved experiment query index exists");
assert.ok(indexFields.some(value => value.includes("status:ASCENDING") && value.includes("deviceId:ASCENDING")), "approved device query index exists");
assert.ok(indexFields.some(value => value.includes("status:ASCENDING") && value.includes("createdAt:ASCENDING")), "pending moderation queue index exists");
assert.ok(indexFields.some(value => value.includes("authorId:ASCENDING") && value.includes("createdAt:DESCENDING")), "contributor history index exists");
console.log("Firestore Community Hub index checks passed.");
