/**
 * Automated test suite for WDIII Tech Vault input sanitization and anti-XSS utilities.
 */
import { escapeHtml, escapeAttribute, sanitizeText, sanitizeUrl, safeHtml, sanitizeObject, isGoogleAvatarUrl, safeAvatarUrl, storableAvatarUrl } from './sanitize.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('--- Running Sanitization Security Tests ---');

// 1. Basic HTML Escaping
const xss1 = '<script>alert("XSS")</script>';
assert(escapeHtml(xss1) === '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;', 'Blocks standard script tags');

const xss2 = '<img src=x onerror=alert(1)>';
assert(!escapeHtml(xss2).includes('<') && !escapeHtml(xss2).includes('>'), 'Escapes tags in image event handlers');

const xss3 = '"><svg onload=alert(document.cookie)>';
assert(escapeHtml(xss3).startsWith('&quot;&gt;'), 'Escapes quotes and brackets');

// 2. Attribute Escaping
const attrTest = 'test" onclick="steal()';
assert(!escapeAttribute(attrTest).includes('"'), 'Escapes double quotes in HTML attributes');

// 3. Text Sanitization
const controlChars = 'Hello\x00\x08World<script>';
const sanitized = sanitizeText(controlChars);
assert(!sanitized.includes('\x00') && sanitized.includes('&lt;script&gt;'), 'Strips ASCII control characters and escapes markup');

// 4. Dangerous URL Blocking
assert(sanitizeUrl('javascript:alert(1)') === '#', 'Blocks javascript: URIs');
assert(sanitizeUrl('JAVASCRIPT:alert(1)') === '#', 'Blocks case-variant javascript: URIs');
assert(sanitizeUrl('data:text/html,<script>alert(1)</script>') === '#', 'Blocks data: URIs');
assert(sanitizeUrl('vbscript:msgbox(1)') === '#', 'Blocks vbscript: URIs');
assert(sanitizeUrl('https://example.com/test') === 'https://example.com/test', 'Allows safe https: URLs');
assert(sanitizeUrl('/download/logo.svg') === '/download/logo.svg', 'Allows safe relative paths');
assert(sanitizeUrl('#/devices') === '#/devices', 'Allows safe hash anchors');

// 5. safeHtml Tagged Template
const maliciousUser = '<script>alert("pwned")</script>';
const deviceName = 'Pixel 9 Pro "><img src=x onerror=alert(1)>';
const rendered = safeHtml`
  <div class="user-card">
    <span class="user">${maliciousUser}</span>
    <span class="device">${deviceName}</span>
  </div>
`;
assert(!rendered.toString().includes('<script>'), 'safeHtml strictly neutralizes injected script tags');
assert(!rendered.toString().includes('onerror='), 'safeHtml strictly neutralizes injected event handlers');
assert(rendered.toString().includes('&lt;script&gt;'), 'safeHtml renders safe entity equivalents');

// 6. Deep Object Sanitization
const submissionPayload = {
  deviceName: 'iPhone 15 <script>',
  notes: 'Battery drained fast "><script>alert(1)</script>',
  metrics: {
    comment: '<b onmouseover=alert(1)>Warning</b>',
    cycles: 42
  }
};
const cleanedObj = sanitizeObject(submissionPayload);
assert(cleanedObj.deviceName === 'iPhone 15 &lt;script&gt;', 'Sanitizes top-level string fields');
assert(cleanedObj.metrics.cycles === 42, 'Preserves numeric metrics intact');
assert(!cleanedObj.notes.includes('<script>'), 'Recursively cleans nested string notes');
assert(!cleanedObj.metrics.comment.includes('<b'), 'Recursively cleans child object properties');

// ---- avatar URLs (visitor-controlled; must not make viewers contact other sites) ----
console.log('\nAvatar URLs:');
const GOOD = 'https://lh3.googleusercontent.com/a/ACg8ocJExample=s96-c';
assert(isGoogleAvatarUrl(GOOD), 'Accepts a Google-hosted profile photo');
assert(safeAvatarUrl(GOOD) === GOOD && storableAvatarUrl(GOOD) === GOOD, 'Renders and stores a Google photo');
assert(safeAvatarUrl('/public/icon.png') === '/public/icon.png', 'Renders the default site icon');
assert(safeAvatarUrl('/src/assets/images/wdiii_logo_1789060991252.jpg') !== '', 'Renders the seed comment logo');
assert(storableAvatarUrl('/public/icon.png') === '', 'Never stores a relative path');
for (const bad of [
  'https://evil.example/pixel.png',
  'http://lh3.googleusercontent.com/a/x',
  'https://lh3.googleusercontent.com.evil.example/a',
  'https://evil.example/?x=.googleusercontent.com/a',
  'https://evil.example/.googleusercontent.com/a',
  'https://user@lh3.googleusercontent.com/a',
  'https://a.b.googleusercontent.com/a',
  'javascript:alert(1)', 'data:image/svg+xml,<svg onload=alert(1)>', '//evil.example/x.png',
  '/public/../../etc/passwd', '/other/path.png', 'https://lh3.googleusercontent.com/a" onerror="alert(1)',
  'https://lh3.googleusercontent.com/a b', 'https://lh3.googleusercontent.com/' + 'a'.repeat(600), '', null, undefined, 42, {}
]) {
  assert(safeAvatarUrl(bad) === '' && storableAvatarUrl(bad) === '', `Rejects ${String(typeof bad === 'string' ? bad.slice(0, 48) : bad)}`);
}

console.log(`\nTests Completed: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
}
