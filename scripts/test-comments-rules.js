/**
 * Firestore rules test for /comments — runs against the local emulator.
 *   npm run test:rules
 * (wraps: firebase emulators:exec --only firestore "node scripts/test-comments-rules.js")
 */
import fs from 'fs';
import { initializeTestEnvironment, assertSucceeds, assertFails } from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';

const OWNER_EMAIL = 'perfectshadowkai33@gmail.com';
const env = await initializeTestEnvironment({
  projectId: 'demo-wdiii-rules',
  firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') }
});

const google = (uid, extra = {}) => env.authenticatedContext(uid, {
  email: `${uid}@example.com`, email_verified: true, firebase: { sign_in_provider: 'google.com' }, ...extra
}).firestore();
const anon = (uid) => env.authenticatedContext(uid, { firebase: { sign_in_provider: 'anonymous' } }).firestore();
const unverified = (uid) => env.authenticatedContext(uid, {
  email: `${uid}@example.com`, email_verified: false, firebase: { sign_in_provider: 'password' }
}).firestore();
const owner = () => google('owner1', { email: OWNER_EMAIL });
const guest = () => env.unauthenticatedContext().firestore();

const base = (uid, extra = {}) => ({
  experimentId: 'exp-12', authorId: uid, authorDisplayName: 'Tester', authorPhotoURL: '',
  authorRole: 'contributor', content: 'Nice test', createdAt: '2026-09-27T00:00:00Z',
  updatedAt: '2026-09-27T00:00:00Z', isEdited: false, likesCount: 0, likedBy: [], ...extra
});

let passed = 0, failed = 0;
async function t(label, fn) {
  try { await fn(); passed++; console.log(`  ✓ [PASS] ${label}`); }
  catch (e) { failed++; console.log(`  ✗ [FAIL] ${label}: ${e.message}`); }
}
const seed = async (id, data) => env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), 'comments', id), data));

console.log('\n=== COMMENTS RULES (EMULATOR) ===');

await t('Guest can read comments', async () => { await seed('c0', base('alice')); await assertSucceeds(getDoc(doc(guest(), 'comments/c0'))); });
await t('Guest cannot post', () => assertFails(setDoc(doc(guest(), 'comments/g1'), base('nobody'))));
await t('Anonymous account cannot post', () => assertFails(setDoc(doc(anon('anon1'), 'comments/a1'), base('anon1'))));
await t('Unverified email account cannot post', () => assertFails(setDoc(doc(unverified('u1'), 'comments/u1'), base('u1'))));
await t('Google user can post', () => assertSucceeds(setDoc(doc(google('alice'), 'comments/c1'), base('alice'))));
await t('Cannot post as someone else', () => assertFails(setDoc(doc(google('alice'), 'comments/c2'), base('bob'))));
await t('Cannot store authorEmail', () => assertFails(setDoc(doc(google('alice'), 'comments/c3'), base('alice', { authorEmail: 'alice@example.com' }))));
await t('Non-owner cannot claim owner badge', () => assertFails(setDoc(doc(google('alice'), 'comments/c4'), base('alice', { authorRole: 'owner' }))));
await t('Non-owner cannot claim moderator badge', () => assertFails(setDoc(doc(google('alice'), 'comments/c5'), base('alice', { authorRole: 'moderator' }))));
await t('Verified owner can post with owner badge', () => assertSucceeds(setDoc(doc(owner(), 'comments/c6'), base('owner1', { authorRole: 'owner' }))));
await t('Cannot create with pre-inflated likes', () => assertFails(setDoc(doc(google('alice'), 'comments/c7'), base('alice', { likesCount: 50, likedBy: ['x'] }))));
await t('Content over 3000 chars rejected', () => assertFails(setDoc(doc(google('alice'), 'comments/c8'), base('alice', { content: 'x'.repeat(3001) }))));

await seed('e1', base('alice'));
await t('Author can edit content', () => assertSucceeds(updateDoc(doc(google('alice'), 'comments/e1'), { content: 'edited', updatedAt: 'now', isEdited: true })));
await t('Author cannot change their role badge', () => assertFails(updateDoc(doc(google('alice'), 'comments/e1'), { authorRole: 'owner' })));
await t('Other user cannot edit content', () => assertFails(updateDoc(doc(google('bob'), 'comments/e1'), { content: 'hijack', updatedAt: 'now', isEdited: true })));
await t('Other user cannot rename author', () => assertFails(updateDoc(doc(google('bob'), 'comments/e1'), { authorDisplayName: 'Owner' })));

await t('User can like', () => assertSucceeds(updateDoc(doc(google('bob'), 'comments/e1'), { likedBy: ['bob'], likesCount: 1 })));
await t('User can unlike', () => assertSucceeds(updateDoc(doc(google('bob'), 'comments/e1'), { likedBy: [], likesCount: 0 })));
await t('Cannot like on behalf of others', () => assertFails(updateDoc(doc(google('bob'), 'comments/e1'), { likedBy: ['bob', 'carol'], likesCount: 2 })));
await t('likesCount must match likedBy', () => assertFails(updateDoc(doc(google('bob'), 'comments/e1'), { likedBy: ['bob'], likesCount: 99 })));
await t('No duplicate likes', () => assertFails(updateDoc(doc(google('bob'), 'comments/e1'), { likedBy: ['bob', 'bob'], likesCount: 2 })));
await t('Anonymous account cannot like', () => assertFails(updateDoc(doc(anon('anon1'), 'comments/e1'), { likedBy: ['anon1'], likesCount: 1 })));

await seed('d1', base('alice')); await seed('d2', base('alice'));
await t('Other user cannot delete', () => assertFails(deleteDoc(doc(google('bob'), 'comments/d1'))));
await t('Author can delete own comment', () => assertSucceeds(deleteDoc(doc(google('alice'), 'comments/d1'))));
await t('Verified owner can delete any comment', () => assertSucceeds(deleteDoc(doc(owner(), 'comments/d2'))));

await env.cleanup();
console.log(`\n   COMMENTS RULES AUDIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
