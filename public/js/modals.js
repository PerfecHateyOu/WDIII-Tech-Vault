/**
 * CTC — WDIII Tech Vault Modals Manager
 * Handles modal lifecycle, keyboard accessibility (Escape, focus trapping), and backdrop clicks
 */

import { CONFIG } from './config.js';

class ModalManager {
  constructor() {
    this.activeModal = null;
    this.previousFocus = null;
  }

  init() {
    this.setupModals();
  }

  setupModals() {
    Object.values(CONFIG.MODAL_IDS).forEach((modalId) => {
      const modal = document.getElementById(modalId);
      if (modal) {
        this.setAccessibilityAttributes(modal);
        this.attachCloseListeners(modal);
      }
    });

    // Check disclaimer acknowledgement from sessionStorage
    const disclaimer = document.getElementById(CONFIG.MODAL_IDS.disclaimer);
    if (disclaimer && !sessionStorage.getItem(CONFIG.STORAGE_KEYS.disclaimerAck)) {
      this.open(CONFIG.MODAL_IDS.disclaimer);
    }

    // Disclaimer dismiss button
    document.getElementById('disclaimerDismiss')?.addEventListener('click', () => {
      sessionStorage.setItem(CONFIG.STORAGE_KEYS.disclaimerAck, '1');
      this.close(CONFIG.MODAL_IDS.disclaimer);
    });

    // Logo modal open buttons
    document.querySelectorAll('.btnOpenLogoModal, #btnOpenLogoModal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open(CONFIG.MODAL_IDS.logo);
      });
    });

    // Logo modal close buttons
    document.getElementById('logoModalCloseBtn')?.addEventListener('click', () => {
      this.close(CONFIG.MODAL_IDS.logo);
    });
    document.getElementById('logoModalDoneBtn')?.addEventListener('click', () => {
      this.close(CONFIG.MODAL_IDS.logo);
    });
  }

  setAccessibilityAttributes(modal) {
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    
    const title = modal.querySelector('[data-modal-title], h2, h3');
    if (title) {
      const titleId = `${modal.id}-title`;
      if (!title.id) title.id = titleId;
      modal.setAttribute('aria-labelledby', title.id);
    }
  }

  attachCloseListeners(modal) {
    const closeBtns = modal.querySelectorAll('[data-modal-close], .btn-modal-close');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => this.close(modal.id));
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModal === modal.id) {
        if (modal.id === CONFIG.MODAL_IDS.disclaimer) {
          sessionStorage.setItem(CONFIG.STORAGE_KEYS.disclaimerAck, '1');
        }
        this.close(modal.id);
      }
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        if (modal.id === CONFIG.MODAL_IDS.disclaimer) {
          sessionStorage.setItem(CONFIG.STORAGE_KEYS.disclaimerAck, '1');
        }
        this.close(modal.id);
      }
    });
  }

  open(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    this.previousFocus = document.activeElement;
    modal.style.display = 'flex';
    this.activeModal = modalId;
    
    // Focus first interactive element
    const focusable = modal.querySelector('button, [href], input, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();
  }

  close(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.style.display = 'none';
    if (this.activeModal === modalId) {
      this.activeModal = null;
    }

    if (modalId === CONFIG.MODAL_IDS.logo) {
      if (window.location.hash === '#/logo' || window.location.hash === '#/brand') {
        history.pushState('', document.title, window.location.pathname + window.location.search);
      }
    }

    if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
      this.previousFocus.focus();
    }
  }
}

const modalManager = new ModalManager();

// Expose openLogoModal / closeLogoModal for compatibility
if (typeof window !== 'undefined') {
  window.openLogoModal = () => modalManager.open(CONFIG.MODAL_IDS.logo);
  window.closeLogoModal = () => modalManager.close(CONFIG.MODAL_IDS.logo);
}

export default modalManager;
