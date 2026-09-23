/**
 * CTC — WDIII Tech Vault Utilities Module
 * Toast notifications, HTML sanitization, storage wrappers, and DOM helpers
 */

import { CONFIG } from './config.js';

let toastQueue = [];

/**
 * Escapes HTML strings to prevent XSS vulnerabilities
 */
export function escapeHTML(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Creates and inserts a toast notification into the DOM
 */
export function showToast(message, type = 'info', action = null) {
  const container = document.getElementById('toastContainer') || createToastContainer();

  // Enforce toast queue limit
  if (toastQueue.length >= CONFIG.TOAST.MAX_QUEUE) {
    const oldest = toastQueue.shift();
    if (oldest && oldest.parentNode) {
      oldest.remove();
    }
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} td-slide-up`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  let actionHtml = '';
  if (action && action.label && action.url) {
    actionHtml = `<a href="${escapeHTML(action.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--td-info); font-weight:600; text-decoration:underline; margin-left:0.5rem; white-space:nowrap;">${escapeHTML(action.label)}</a>`;
  }

  toast.innerHTML = `
    <span style="display:flex; align-items:center; gap:0.5rem;">
      <span>${icon}</span>
      <span>${escapeHTML(message)}${actionHtml}</span>
    </span>
    <button type="button" aria-label="Dismiss notification" style="background:none; border:none; color:var(--td-text-muted); cursor:pointer; font-size:1rem; padding:0 0.25rem;">✕</button>
  `;

  toast.querySelector('button')?.addEventListener('click', () => {
    removeToast(toast);
  });

  container.appendChild(toast);
  toastQueue.push(toast);

  // Auto-dismiss after duration
  setTimeout(() => {
    removeToast(toast);
  }, CONFIG.TOAST.DURATION_MS);

  return toast;
}

function removeToast(toast) {
  if (!toast || !toast.parentNode) return;
  toast.classList.add('fade-out');
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
    toastQueue = toastQueue.filter(t => t !== toast);
  }, 300);
}

function createToastContainer() {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

// DOM query helpers
export function qs(selector) {
  return document.querySelector(selector);
}

export function qsa(selector) {
  return document.querySelectorAll(selector);
}

// LocalStorage wrappers with fallbacks
export function getStorage(key, defaultValue = null) {
  try {
    const value = localStorage.getItem(key);
    return value !== null ? JSON.parse(value) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Storage full or unavailable:', err);
  }
}

// Debounce helper
export function debounce(fn, delay = 250) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Media query helper
export function matchesMediaQuery(query) {
  return window.matchMedia && window.matchMedia(query).matches;
}

// Expose utilities on window for compatibility
if (typeof window !== 'undefined') {
  window.showToast = showToast;
  window.escapeHTML = escapeHTML;
  window.esc = escapeHTML;
}
