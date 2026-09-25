/**
 * CTC — WDIII Tech Vault Central Configuration Module
 * Eliminates magic strings and centralizes application parameters
 */

export const CONFIG = {
  VERSION: 'V5.7.2',
  LAST_UPDATED: 'September 26, 2026',
  STORAGE_KEYS: {
    theme: 'ctd-theme',
    disclaimerAck: 'ctd-disclaimer-ack'
  },
  MODAL_IDS: {
    logo: 'logoModal',
    disclaimer: 'disclaimerModal'
  },
  THEME: {
    DARK: 'dark',
    LIGHT: 'light',
    AUTO: 'auto'
  },
  TOAST: {
    DURATION_MS: 6000,
    MAX_QUEUE: 3
  },
  PAGES: [
    'home', 'experiments', 'devices', 'compare', 'fodder', 'about', 'contact', 'methodology', 'profile'
  ]
};

export const API_ENDPOINTS = {
  firebaseConfig: '/api/firebase-config',
  submit: '/api/submit'
};

export const STRINGS = {
  TOASTS: {
    EMAIL_COPIED: 'Email copied to clipboard!',
    FORM_SUCCESS: "Message sent. We'll be in touch!",
    FORM_ERROR: 'Something went wrong. Please try again.',
    FORM_EMPTY: 'Please fill in all required fields.',
    FORM_INVALID_EMAIL: 'Please enter a valid email address.'
  },
  MODALS: {
    DISCLAIMER_TITLE: '⚠️ Before You Read On',
    LOGO_TITLE: 'Official Brand Mark & Assets'
  }
};
