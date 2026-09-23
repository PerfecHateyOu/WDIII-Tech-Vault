/**
 * CTC — WDIII Tech Vault Theme Manager
 * Handles system preference detection, localStorage persistence, and WCAG AA contrast states
 */

import { CONFIG } from './config.js';

class ThemeManager {
  constructor() {
    this.storageKey = CONFIG.STORAGE_KEYS.theme;
    this.darkClass = 'dark-theme';
    this.lightClass = 'light-theme';
  }

  init() {
    const stored = localStorage.getItem(this.storageKey);
    const preference = stored || this.getSystemPreference() || CONFIG.THEME.DARK;
    this.apply(preference);
    this.attachToggleListener();
  }

  getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return CONFIG.THEME.DARK;
    }
    return CONFIG.THEME.LIGHT;
  }

  apply(theme) {
    const root = document.documentElement;
    const body = document.body;
    root.classList.remove(this.darkClass, this.lightClass);
    if (body) body.classList.remove(this.darkClass, this.lightClass);
    
    if (theme === CONFIG.THEME.LIGHT) {
      root.classList.add(this.lightClass);
      if (body) body.classList.add(this.lightClass);
    } else {
      root.classList.add(this.darkClass);
      if (body) body.classList.add(this.darkClass);
    }
    
    localStorage.setItem(this.storageKey, theme);
    this.updateToggleIcon(theme);
  }

  updateToggleIcon(theme) {
    const isLight = theme === CONFIG.THEME.LIGHT;
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.textContent = isLight ? '🌙' : '☀️';
      toggle.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} mode`);
      toggle.classList.add('toggled');
      setTimeout(() => toggle.classList.remove('toggled'), 300);
    }

    document.querySelectorAll('.themeToggleBtn, #themeToggleHome, #themeToggleFodder').forEach(btn => {
      btn.textContent = isLight ? '☀️ Light' : '🌙 Dark';
      btn.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} mode`);
    });
  }

  attachToggleListener() {
    const toggle = document.getElementById('themeToggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        const current = localStorage.getItem(this.storageKey) || CONFIG.THEME.DARK;
        const next = current === CONFIG.THEME.LIGHT ? CONFIG.THEME.DARK : CONFIG.THEME.LIGHT;
        this.apply(next);
      });
    }

    document.querySelectorAll('.themeToggleBtn, #themeToggleHome, #themeToggleFodder').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = localStorage.getItem(this.storageKey) || CONFIG.THEME.DARK;
        const next = current === CONFIG.THEME.LIGHT ? CONFIG.THEME.DARK : CONFIG.THEME.LIGHT;
        this.apply(next);
      });
    });
  }
}

export default new ThemeManager();
