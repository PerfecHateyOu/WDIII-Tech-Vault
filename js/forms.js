/**
 * CTC — WDIII Tech Vault Forms Manager
 * Handles client-side validation, accessibility, and feedback for contact & newsletter forms
 */

import { CONFIG, STRINGS } from './config.js';
import { showToast } from './utils.js';

class FormManager {
  constructor() {
    this.forms = {};
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

  handleContactForm(e) {
    e.preventDefault();
    const form = e.target;
    
    const nameInput = document.getElementById('contactName') || form.querySelector('[name="name"]');
    const emailInput = document.getElementById('contactEmail') || form.querySelector('[name="email"]');
    const msgInput = document.getElementById('contactMessage') || form.querySelector('[name="message"]');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = msgInput ? msgInput.value.trim() : '';

    if (!message) {
      showToast(STRINGS.TOASTS.FORM_EMPTY || 'Please fill in a message before submitting.', 'warning');
      return;
    }

    if (email && !this.validateEmail(email)) {
      showToast(STRINGS.TOASTS.FORM_INVALID_EMAIL, 'error');
      return;
    }

    // Direct mailto protocol with subject and payload
    const subject = encodeURIComponent('TechStack Archive contact from ' + (name || 'a reader'));
    const body = encodeURIComponent(message + '\n\n— ' + name + (email ? ' (' + email + ')' : ''));
    showToast(STRINGS.TOASTS.FORM_SUCCESS, 'success');
    window.location.href = 'mailto:williamdebe06@icloud.com?subject=' + subject + '&body=' + body;
  }

  handleNewsletterForm(e) {
    e.preventDefault();
    const form = e.target;
    const emailInput = form.querySelector('[name="email"]') || form.querySelector('input[type="email"]');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!this.validateEmail(email)) {
      showToast(STRINGS.TOASTS.FORM_INVALID_EMAIL, 'error');
      return;
    }

    showToast('Subscribed! We will keep you updated on new research protocols.', 'success');
    form.reset();
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
}

export default new FormManager();
