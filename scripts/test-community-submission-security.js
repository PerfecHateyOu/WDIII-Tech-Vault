import fs from 'node:fs';
import assert from 'node:assert/strict';

const firestore = fs.readFileSync('firestore.rules', 'utf8');
const storage = fs.readFileSync('storage.rules', 'utf8');

assert.match(firestore, /request\.resource\.data\.status == 'pending_review'/);
assert.match(firestore, /resource\.data\.status != 'approved'/);
assert.match(firestore, /affectedKeys\(\)\.hasOnly/);
assert.match(firestore, /isValidMeasurementPayload\(/);
assert.match(firestore, /reviewerId == null/);
assert.match(storage, /allow update: if false/);
assert.match(storage, /request\.resource\.size <= 8 \* 1024 \* 1024/);
assert.match(storage, /request\.resource\.size <= 10 \* 1024 \* 1024/);
assert.match(storage, /request\.auth\.token\.role/);

console.log('Community submission security regression checks passed.');
