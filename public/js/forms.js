/**
 * CTC — WDIII Tech Vault Forms Manager
 * Handles client-side validation, accessibility, and feedback for contact & newsletter forms.
 * Both forms POST JSON to API_ENDPOINTS.submit (/api/submit); the server validates, rate limits and, when
 * configured, emails the submission. The contact form opens a mailto: draft only when the server did not
 * deliver it (delivered:false, a 5xx, or a network error).
 */

import { API_ENDPOINTS, STRINGS } from './config.js';
import { showToast } from './utils.js';

const CONTACT_EMAIL = 'williamdebe06@icloud.com';
const NEWSLETTER_MESSAGE = 'Newsletter signup';
const EMAIL_FALLBACK_MESSAGE = 'Could not send from the site. Opening your email app instead.';
const RATE_LIMIT_MESSAGE = 'Too many submissions. Please wait a few minutes and try again.';

export class FormManager {
  /**
   * @param {object} [deps] injectable for tests: toast(message, type), fetch, navigate(url)
   */
  constructor(deps = {}) {
    this.forms = {};
    this.toast = deps.toast || showToast;
    this.fetchImpl = deps.fetch || ((...args) => globalThis.fetch(...args));
    this.navigate = deps.navigate || ((url) => { window.location.href = url; });
  }

  init() {
    this.registerForms();
  }

  registerForms() {
    // Contact form in index.html
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
    }

    // Newsletter signup form
    const newsForm = document.getElementById('newsletterForm');
    if (newsForm) {
      newsForm.addEventListener('submit', (e) => this.handleNewsletterForm(e));
    }
  }

  /**
   * POSTs a JSON payload to the submit endpoint.
   * Resolves to { ok, status, data } and never throws (network errors become ok:false, status 0).
   */
  async submit(payload) {
    try {
      const res = await this.fetchImpl(API_ENDPOINTS.submit, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      let data = {};
      try { data = await res.json(); } catch { data = {}; }
      return { ok: res.status >= 200 && res.status < 300, status: res.status, data: data || {} };
    } catch {
      return { ok: false, status: 0, data: {} };
    }
  }

  errorMessage(result) {
    if (result.status === 429) return (result.data && result.data.error) ? `${result.data.error}. ${RATE_LIMIT_MESSAGE}` : RATE_LIMIT_MESSAGE;
    if (result.data && typeof result.data.error === 'string' && result.data.error) return result.data.error;
    return STRINGS.TOASTS.FORM_ERROR;
  }

  setBusy(form, busy) {
    const button = form && form.querySelector ? form.querySelector('button[type="submit"], button:not([type])') : null;
    if (!button) return;
    button.disabled = busy;
    button.setAttribute('aria-busy', busy ? 'true' : 'false');
  }

  async handleContactForm(e) {
    e.preventDefault();
    const form = e.target;
    if (form.dataset && form.dataset.sending === 'true') return;

    const nameInput = form.querySelector('#contactName') || form.querySelector('[name="name"]');
    const emailInput = form.querySelector('#contactEmail') || form.querySelector('[name="email"]');
    const msgInput = form.querySelector('#contactMessage') || form.querySelector('[name="message"]');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = msgInput ? msgInput.value.trim() : '';

    if (!message) {
      this.toast(STRINGS.TOASTS.FORM_EMPTY || 'Please fill in a message before submitting.', 'warning');
      return;
    }

    if (email && !this.validateEmail(email)) {
      this.toast(STRINGS.TOASTS.FORM_INVALID_EMAIL, 'error');
      return;
    }

    const payload = { type: 'contact', message: name ? `${message}\n\n— ${name}` : message };
    if (email) payload.email = email;

    if (form.dataset) form.dataset.sending = 'true';
    this.setBusy(form, true);
    try {
      const result = await this.submit(payload);
      const mailtoUrl = () => {
        const subject = encodeURIComponent('TechStack Archive contact from ' + (name || 'a reader'));
        const body = encodeURIComponent(message + '\n\n— ' + name + (email ? ' (' + email + ')' : ''));
        return 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
      };
      if (!result.ok) {
        // Server down, network error, or the server could not email it (5xx): fall back to the visitor's
        // mail app so the message still reaches us. Validation errors (4xx) and rate limits just show the error.
        if (result.status === 0 || result.status >= 500) {
          this.toast(EMAIL_FALLBACK_MESSAGE, 'warning');
          this.navigate(mailtoUrl());
          return;
        }
        this.toast(this.errorMessage(result), result.status === 429 ? 'warning' : 'error');
        return;
      }
      this.toast(STRINGS.TOASTS.FORM_SUCCESS, 'success');
      form.reset();
      // The server emails the message to us when it is configured to (delivered:true). Otherwise hand off to
      // the visitor's mail app, as before, so the message still reaches someone.
      if (result.data.delivered !== true) this.navigate(mailtoUrl());
    } finally {
      if (form.dataset) form.dataset.sending = 'false';
      this.setBusy(form, false);
    }
  }

  async handleNewsletterForm(e) {
    e.preventDefault();
    const form = e.target;
    if (form.dataset && form.dataset.sending === 'true') return;

    const emailInput = form.querySelector('[name="email"]') || form.querySelector('input[type="email"]');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!this.validateEmail(email)) {
      this.toast(STRINGS.TOASTS.FORM_INVALID_EMAIL, 'error');
      return;
    }

    if (form.dataset) form.dataset.sending = 'true';
    this.setBusy(form, true);
    try {
      // /api/submit requires a non-empty message; a signup carries a fixed one.
      const result = await this.submit({ type: 'newsletter', email, message: NEWSLETTER_MESSAGE });
      if (!result.ok) {
        this.toast(this.errorMessage(result), result.status === 429 ? 'warning' : 'error');
        return;
      }
      this.toast('Subscribed! We will keep you updated on new research protocols.', 'success');
      form.reset();
    } finally {
      if (form.dataset) form.dataset.sending = 'false';
      this.setBusy(form, false);
    }
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}

export default new FormManager();
