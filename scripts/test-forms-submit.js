/**
 * Contact & newsletter forms really POST to /api/submit.
 * Part 1 needs the server on localhost:3000 (npm start); each run uses its own simulated visitor address
 * (behind the default TRUST_PROXY_HOPS=2 chain), so the per-IP submit limit from other tests never interferes.
 * Part 2 loads public/js/forms.js in Node with a stubbed fetch/form and checks what it sends and shows.
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0, failed = 0;
const check = (label, cond, detail = '') => {
  if (cond) { passed++; console.log(`  ✓ [PASS] ${label}`); }
  else { failed++; console.log(`  ✗ [FAIL] ${label} ${detail}`); }
};

const client = `10.${1 + Math.floor(Math.random() * 254)}.${1 + Math.floor(Math.random() * 254)}.${1 + Math.floor(Math.random() * 254)}`;
const post = (body) => new Promise((resolve, reject) => {
  const data = JSON.stringify(body);
  const req = http.request({
    host: 'localhost', port: 3000, method: 'POST', path: '/api/submit',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), 'X-Forwarded-For': `${client}, 198.51.100.7` }
  }, (res) => {
    let out = '';
    res.on('data', (c) => (out += c));
    res.on('end', () => { let json = {}; try { json = JSON.parse(out); } catch {} resolve({ status: res.statusCode, json }); });
  });
  req.on('error', reject);
  req.write(data);
  req.end();
});

console.log('\n=== FORMS → /api/submit ===\n--- server ---');

let r = await post({ type: 'contact', email: 'reader@example.com', message: 'Found a typo in experiment 8.\n\n— Sam' });
check('Contact submission accepted (2xx, ok:true)', r.status >= 200 && r.status < 300 && r.json.ok === true, `got ${r.status} ${JSON.stringify(r.json)}`);

r = await post({ type: 'contact', email: 'reader@example.com', message: '   ' });
check('Contact submission with empty message rejected (400)', r.status === 400 && typeof r.json.error === 'string', `got ${r.status}`);

r = await post({ type: 'newsletter', email: 'reader@example.com', message: 'Newsletter signup' });
check('Newsletter signup payload (as forms.js sends it) accepted (2xx)', r.status >= 200 && r.status < 300 && r.json.ok === true, `got ${r.status} ${JSON.stringify(r.json)}`);

console.log('--- public/js/forms.js ---');

const src = fs.readFileSync(path.join(root, 'public/js/forms.js'), 'utf8');
check('forms.js posts to API_ENDPOINTS.submit (no hard-coded URL)', /API_ENDPOINTS\.submit/.test(src) && !/['"]\/api\/submit['"]/.test(src));

const { FormManager } = await import(path.join(root, 'public/js/forms.js'));
const { API_ENDPOINTS, STRINGS } = await import(path.join(root, 'public/js/config.js'));
check('config.js submit endpoint is /api/submit', API_ENDPOINTS.submit === '/api/submit');

function fakeForm(fields) {
  const inputs = {};
  for (const [sel, value] of Object.entries(fields)) inputs[sel] = { value, initial: '' };
  const button = { disabled: false, attrs: {}, setAttribute(k, v) { this.attrs[k] = v; } };
  return {
    dataset: {}, button, resetCount: 0, inputs,
    querySelector(sel) {
      if (sel.startsWith('button')) return button;
      for (const part of sel.split(',').map((s) => s.trim())) if (inputs[part]) return inputs[part];
      return null;
    },
    reset() { this.resetCount++; for (const i of Object.values(inputs)) i.value = ''; }
  };
}

function harness(response) {
  const calls = [], toasts = [], navs = [];
  let busyDuringFetch = null;
  let form;
  const fm = new FormManager({
    toast: (message, type) => toasts.push({ message, type }),
    navigate: (url) => navs.push(url),
    fetch: async (url, opts) => {
      calls.push({ url, opts, body: JSON.parse(opts.body) });
      busyDuringFetch = form ? form.button.disabled : null;
      if (response instanceof Error) throw response;
      return { status: response.status, json: async () => response.json };
    }
  });
  return { fm, calls, toasts, navs, setForm: (f) => { form = f; }, busy: () => busyDuringFetch };
}

const contactFields = { '#contactName': 'Sam', '#contactEmail': 'sam@example.com', '#contactMessage': 'Hello there' };

// Contact: success
{
  const h = harness({ status: 202, json: { ok: true, delivered: false, persisted: false, message: 'Submission received' } });
  const form = fakeForm(contactFields); h.setForm(form);
  await h.fm.handleContactForm({ preventDefault() {}, target: form });
  const c = h.calls[0];
  check('Contact form calls fetch once on submit', h.calls.length === 1, `calls=${h.calls.length}`);
  check('…to the submit endpoint with POST + JSON', c && c.url === API_ENDPOINTS.submit && c.opts.method === 'POST' && c.opts.headers['Content-Type'] === 'application/json');
  check('…with type contact, the email and the message', c && c.body.type === 'contact' && c.body.email === 'sam@example.com' && c.body.message.startsWith('Hello there'));
  check('Button disabled while sending, re-enabled after', h.busy() === true && form.button.disabled === false);
  check('Success toast only after 2xx, form reset', h.toasts.length === 1 && h.toasts[0].type === 'success' && form.resetCount === 1);
  check('Email hand-off (mailto) when the server did not email it (delivered:false)', h.navs.length === 1 && h.navs[0].startsWith('mailto:williamdebe06@icloud.com?'));
}

// Contact: the server emailed it (delivered:true) → success, reset, no mail app
{
  const h = harness({ status: 200, json: { ok: true, delivered: true, persisted: false, message: 'Message sent' } });
  const form = fakeForm(contactFields); h.setForm(form);
  await h.fm.handleContactForm({ preventDefault() {}, target: form });
  check('delivered:true → success toast + reset, no mailto', h.navs.length === 0 && h.toasts.length === 1 && h.toasts[0].type === 'success' && form.resetCount === 1);
}

// Contact: older server reply without the flag → still hands off (never silently drops a message)
{
  const h = harness({ status: 202, json: { ok: true } });
  const form = fakeForm(contactFields); h.setForm(form);
  await h.fm.handleContactForm({ preventDefault() {}, target: form });
  check('No delivered flag → mailto hand-off kept', h.navs.length === 1 && h.navs[0].startsWith('mailto:'));
}

// Contact: the server could not email it (502) → fall back to the mail app, form kept
{
  const h = harness({ status: 502, json: { ok: false, delivered: false, error: 'We could not send your message right now.' } });
  const form = fakeForm(contactFields); h.setForm(form);
  await h.fm.handleContactForm({ preventDefault() {}, target: form });
  check('502 (email failed) → warning toast + mailto fallback, no reset', h.navs.length === 1 && h.navs[0].startsWith('mailto:') && h.toasts.length === 1 && h.toasts[0].type === 'warning' && form.resetCount === 0 && form.button.disabled === false);
}

// Contact: empty message never reaches the network
{
  const h = harness({ status: 202, json: { ok: true } });
  const form = fakeForm({ ...contactFields, '#contactMessage': '  ' }); h.setForm(form);
  await h.fm.handleContactForm({ preventDefault() {}, target: form });
  check('Empty message blocked client-side (no fetch, warning toast)', h.calls.length === 0 && h.toasts[0].type === 'warning');
}

// Contact: server 400 → server's error shown, form kept
{
  const h = harness({ status: 400, json: { error: 'Invalid email address' } });
  const form = fakeForm(contactFields); h.setForm(form);
  await h.fm.handleContactForm({ preventDefault() {}, target: form });
  check("Server 400 shows the server's error, keeps the form, no success", h.toasts.length === 1 && h.toasts[0].type === 'error' && h.toasts[0].message === 'Invalid email address' && form.resetCount === 0 && h.navs.length === 0 && form.button.disabled === false);
}

// Contact: 429 → rate-limit message
{
  const h = harness({ status: 429, json: { error: 'Too many requests, slow down' } });
  const form = fakeForm(contactFields); h.setForm(form);
  await h.fm.handleContactForm({ preventDefault() {}, target: form });
  check('429 shows the rate-limit message, no mailto', h.toasts.length === 1 && /Too many requests/.test(h.toasts[0].message) && h.toasts[0].type !== 'success' && form.resetCount === 0 && h.navs.length === 0);
}

// Contact: network failure
{
  const h = harness(new Error('offline'));
  const form = fakeForm(contactFields); h.setForm(form);
  await h.fm.handleContactForm({ preventDefault() {}, target: form });
  check('Network failure → mailto fallback, button re-enabled, no reset', h.navs.length === 1 && h.navs[0].startsWith('mailto:') && h.toasts[0].type === 'warning' && form.resetCount === 0 && form.button.disabled === false);
}

// Newsletter: success
{
  const h = harness({ status: 202, json: { ok: true, persisted: false } });
  const form = fakeForm({ '[name="email"]': 'news@example.com' }); h.setForm(form);
  await h.fm.handleNewsletterForm({ preventDefault() {}, target: form });
  const c = h.calls[0];
  check('Newsletter form POSTs type newsletter with the email and a non-empty message', c && c.url === API_ENDPOINTS.submit && c.body.type === 'newsletter' && c.body.email === 'news@example.com' && c.body.message.trim().length > 0);
  check('Newsletter success toast + reset only after 2xx', h.toasts[0].type === 'success' && form.resetCount === 1 && h.busy() === true && form.button.disabled === false);
}

// Newsletter: invalid email never reaches the network
{
  const h = harness({ status: 202, json: { ok: true } });
  const form = fakeForm({ '[name="email"]': 'nope' }); h.setForm(form);
  await h.fm.handleNewsletterForm({ preventDefault() {}, target: form });
  check('Newsletter with invalid email blocked client-side (no fetch)', h.calls.length === 0 && h.toasts[0].type === 'error');
}

// Newsletter: 429
{
  const h = harness({ status: 429, json: { error: 'Too many requests, slow down' } });
  const form = fakeForm({ '[name="email"]': 'news@example.com' }); h.setForm(form);
  await h.fm.handleNewsletterForm({ preventDefault() {}, target: form });
  check('Newsletter 429 shows the rate-limit message, no reset', /Too many requests/.test(h.toasts[0].message) && form.resetCount === 0);
}

console.log(`\n   FORMS SUBMIT: ${passed} PASSED, ${failed} FAILED\n`);
process.exit(failed ? 1 : 0);
