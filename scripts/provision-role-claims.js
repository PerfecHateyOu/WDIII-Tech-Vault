import fs from "node:fs";

const output = process.argv[2];
if (!output) {
  console.error("Usage: node scripts/provision-role-claims.js <output-file>");
  process.exit(1);
}

const roles = JSON.parse(fs.readFileSync(output, "utf8"));
if (!Array.isArray(roles)) throw new Error("Role manifest must be an array.");
for (const entry of roles) {
  if (!entry.uid || !["moderator", "admin", "owner"].includes(entry.role)) {
    throw new Error("Each role entry requires uid and moderator/admin/owner role.");
  }
}

console.log("Validated role manifest.");
console.log("Provision claims with a trusted Firebase Admin SDK deployment only.");
console.log("Example: admin.auth().setCustomUserClaims(entry.uid, { role: entry.role });");
