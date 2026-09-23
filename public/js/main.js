/**
 * CTC — WDIII Tech Vault Main Entrypoint Module
 * Initializes theme, navigation, modals, and form validation managers
 */

import { CONFIG, STRINGS } from './config.js';
import themeManager from './theme.js';
import navigationManager from './navigation.js';
import modalManager from './modals.js';
import formManager from './forms.js';
import { showToast, escapeHTML, qs, qsa, getStorage, setStorage } from './utils.js';

class App {
  constructor() {
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    themeManager.init();
    modalManager.init();
    formManager.init();
    navigationManager.init();

    console.log('CTC — WDIII Tech Vault initialized successfully');
  }
}

const app = new App();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

export {
  app,
  CONFIG,
  STRINGS,
  themeManager,
  navigationManager,
  modalManager,
  formManager,
  showToast,
  escapeHTML,
  qs,
  qsa,
  getStorage,
  setStorage
};
export default app;
