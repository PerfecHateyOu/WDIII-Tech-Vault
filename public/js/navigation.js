/**
 * CTC — WDIII Tech Vault Navigation & Routing Module
 * Handles SPA hash routing, scroll-spy, collapsible section tabs, and scroll-to-top behavior
 */

import { CONFIG } from './config.js';

class NavigationManager {
  constructor() {
    this.pages = CONFIG.PAGES;
    this.currentPage = 'home';
    this.topProgressTimer = null;
    this.navOpenState = { Home: true, Fodder: true };
  }

  init() {
    this.attachNavListeners();
    this.setupSmoothScroll();
    this.setupScrollToTop();
    this.setupCollapsibleNavs();

    // Listen to hash changes
    window.addEventListener('hashchange', () => {
      this.route(window.location.hash);
    });

    // Handle initial route on page load
    this.route(window.location.hash);
  }

  startTopProgress(estimatedMs = 400) {
    const bar = document.getElementById('topProgressBar');
    if (!bar) return;
    if (this.topProgressTimer) clearInterval(this.topProgressTimer);
    bar.style.opacity = '1';
    bar.style.width = '15%';

    let current = 15;
    const stepTime = 40;
    const increment = 70 / (estimatedMs / stepTime);

    this.topProgressTimer = setInterval(() => {
      if (current < 85) {
        current += increment * (0.8 + Math.random() * 0.4);
        if (current > 85) current = 85;
        bar.style.width = `${current}%`;
      }
    }, stepTime);
  }

  completeTopProgress() {
    const bar = document.getElementById('topProgressBar');
    if (!bar) return;
    if (this.topProgressTimer) {
      clearInterval(this.topProgressTimer);
      this.topProgressTimer = null;
    }
    bar.style.width = '100%';
    setTimeout(() => {
      bar.style.opacity = '0';
      setTimeout(() => {
        bar.style.width = '0%';
      }, 250);
    }, 150);
  }

  attachNavListeners() {
    document.querySelectorAll('[data-nav-link]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-nav-link');
        const hash = page === 'home' ? '#/' : `#/${page}`;
        window.location.hash = hash;
      });
    });
  }

  setupSmoothScroll() {
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-scroll]');
      if (el) {
        const id = el.getAttribute('data-scroll');
        if (id) {
          const target = document.getElementById(id);
          if (target) {
            e.preventDefault();
            const page = target.closest('.page');
            if (page && !page.classList.contains('active')) {
              const route = page.id === 'page-fodder' ? '#/fodder' : page.id === 'page-home' ? '#/' : '#/' + page.id.replace('page-', '');
              window.location.hash = route;
              setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            } else {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }
      }
    });
  }

  setupScrollToTop() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (!scrollTopBtn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        scrollTopBtn.style.opacity = '1';
        scrollTopBtn.style.pointerEvents = 'auto';
      } else {
        scrollTopBtn.style.opacity = '0';
        scrollTopBtn.style.pointerEvents = 'none';
      }
    });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  setupCollapsibleNavs() {
    ['Home', 'Fodder'].forEach((suffix) => {
      const btn = document.getElementById(`sectionsToggle${suffix}`);
      const nav = document.getElementById(`sectionsNav${suffix}`);
      const arrow = document.getElementById(`sectionsArrow${suffix}`);
      if (btn && nav) {
        btn.addEventListener('click', () => {
          this.navOpenState[suffix] = !this.navOpenState[suffix];
          if (this.navOpenState[suffix]) {
            nav.classList.remove('is-collapsed');
            if (arrow) arrow.style.transform = '';
          } else {
            nav.classList.add('is-collapsed');
            if (arrow) arrow.style.transform = 'rotate(180deg)';
          }
        });
      }
    });
  }

  route(hash) {
    if (typeof window.showPage === 'function') {
      window.showPage(hash);
    }
  }
}

const navigationManager = new NavigationManager();

// Expose on window for compatibility with page hooks
if (typeof window !== 'undefined') {
  window.navigationManager = navigationManager;
  window.startTopProgress = (ms) => navigationManager.startTopProgress(ms);
  window.completeTopProgress = () => navigationManager.completeTopProgress();
}

export default navigationManager;
