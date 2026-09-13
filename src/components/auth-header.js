/**
 * WDIII Tech Vault - Firebase Authentication UI Component
 * 
 * Renders consistent, accessible Google Sign-In and Authenticated Account Menu
 * for header bars across the application.
 */

import { signInWithGoogle, logOut, onAuthChange } from "/src/services/firebase.js";
import { escapeHtml } from "/src/utils/sanitize.js";

/**
 * Mount the Auth Widget inside a container element
 * @param {HTMLElement|string} target - Container element or selector
 */
export function initAuthHeader(target) {
  const container = typeof target === "string" ? document.querySelector(target) : target;
  if (!container) return;

  container.innerHTML = `
    <div class="wdiii-auth-container" style="display:flex; align-items:center; position:relative;">
      <!-- Loading indicator -->
      <div class="auth-loading" style="display:flex; align-items:center; gap:0.5rem; font-size:0.85rem; color:var(--td-text-muted);">
        <span class="auth-spinner" style="display:inline-block; width:14px; height:14px; border:2px solid var(--td-border-subtle); border-top-color:var(--td-info); border-radius:50%; animation:authSpin 0.8s linear infinite;"></span>
        <span>Checking auth...</span>
      </div>

      <!-- Unauthenticated State: Google Sign-In Button -->
      <div class="auth-unauthenticated" style="display:none;">
        <button type="button" class="btn-google-signin" id="btnGoogleSignIn" style="display:inline-flex; align-items:center; gap:0.625rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border-subtle); border-radius:0.375rem; padding:0.375rem 0.875rem; font-size:0.85rem; font-weight:500; color:var(--td-text-primary); cursor:pointer; transition:background-color 0.15s, border-color 0.15s; white-space:nowrap;">
          <svg style="width:16px; height:16px; flex-shrink:0;" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Sign in with Google</span>
        </button>
      </div>

      <!-- Authenticated State: User Button & Dropdown Menu -->
      <div class="auth-authenticated" style="display:none; position:relative;">
        <button type="button" class="btn-user-profile" id="btnUserMenu" aria-expanded="false" aria-haspopup="true" style="display:inline-flex; align-items:center; gap:0.625rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border-subtle); border-radius:9999px; padding:0.25rem 0.75rem 0.25rem 0.25rem; font-size:0.85rem; font-weight:500; color:var(--td-text-primary); cursor:pointer; transition:border-color 0.15s, background-color 0.15s;">
          <img class="user-avatar" src="" alt="" style="width:26px; height:26px; border-radius:50%; object-fit:cover; background:var(--td-bg-card); border:1px solid var(--td-border);" />
          <span class="user-name" style="max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:600;">User</span>
          <span class="user-role-badge" style="display:inline-block; font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; padding:0.1rem 0.4rem; border-radius:0.25rem; background:rgba(96,165,250,0.15); color:var(--td-info); border:1px solid rgba(96,165,250,0.3);"></span>
          <span style="font-size:0.75rem; color:var(--td-text-muted);">▼</span>
        </button>

        <!-- Account Dropdown Menu -->
        <div class="account-menu-dropdown" id="accountMenuDropdown" style="display:none; position:absolute; right:0; top:calc(100% + 0.5rem); min-width:240px; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.5rem; box-shadow:0 12px 32px rgba(0,0,0,0.45); z-index:1000; padding:0.5rem 0;">
          <div class="dropdown-header" style="padding:0.75rem 1rem; border-bottom:1px solid var(--td-border-subtle);">
            <div class="dropdown-displayname" style="font-weight:700; color:var(--td-text-primary); font-size:0.9rem; margin-bottom:0.125rem;"></div>
            <div class="dropdown-email" style="font-size:0.75rem; color:var(--td-text-muted); word-break:break-all;"></div>
          </div>
          <div style="padding:0.25rem 0;">
            <a href="#/profile" class="dropdown-item" id="menuItemProfile" style="display:flex; align-items:center; gap:0.625rem; padding:0.5rem 1rem; color:var(--td-text-primary); font-size:0.85rem; text-decoration:none; transition:background-color 0.12s;">
              <span>👤</span> <span>My Profile</span>
            </a>
            <a href="#/submit" class="dropdown-item" id="menuItemSubmit" style="display:flex; align-items:center; gap:0.625rem; padding:0.5rem 1rem; color:var(--td-text-primary); font-size:0.85rem; text-decoration:none; transition:background-color 0.12s;">
              <span>📝</span> <span>Submit Test</span>
            </a>
            <a href="#/my-tests" class="dropdown-item" id="menuItemMyTests" style="display:flex; align-items:center; gap:0.625rem; padding:0.5rem 1rem; color:var(--td-text-primary); font-size:0.85rem; text-decoration:none; transition:background-color 0.12s;">
              <span>🧪</span> <span>My Tests</span>
            </a>
          </div>
          <div style="border-top:1px solid var(--td-border-subtle); padding:0.25rem 0 0;">
            <button type="button" class="dropdown-item" id="menuItemSignOut" style="display:flex; align-items:center; gap:0.625rem; width:100%; text-align:left; background:none; border:none; padding:0.5rem 1rem; color:var(--td-error, #f87171); font-size:0.85rem; font-weight:500; cursor:pointer; transition:background-color 0.12s;">
              <span>🚪</span> <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Internal element references
  const loadingEl = container.querySelector(".auth-loading");
  const unauthEl = container.querySelector(".auth-unauthenticated");
  const authEl = container.querySelector(".auth-authenticated");
  const btnGoogle = container.querySelector("#btnGoogleSignIn");
  const btnUserMenu = container.querySelector("#btnUserMenu");
  const menuDropdown = container.querySelector("#accountMenuDropdown");
  const avatarImg = container.querySelector(".user-avatar");
  const userNameSpan = container.querySelector(".user-name");
  const roleBadgeSpan = container.querySelector(".user-role-badge");
  const dropName = container.querySelector(".dropdown-displayname");
  const dropEmail = container.querySelector(".dropdown-email");
  const btnSignOut = container.querySelector("#menuItemSignOut");

  // Style CSS helper
  if (!document.getElementById("authWidgetStyles")) {
    const style = document.createElement("style");
    style.id = "authWidgetStyles";
    style.textContent = `
      @keyframes authSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .btn-google-signin:hover, .btn-user-profile:hover {
        border-color: var(--td-info) !important;
      }
      .dropdown-item:hover {
        background-color: var(--td-bg-card) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Toggle Dropdown Menu
  function toggleDropdown(show) {
    const isVisible = show !== undefined ? show : menuDropdown.style.display !== "none";
    menuDropdown.style.display = isVisible ? "none" : "block";
    btnUserMenu.setAttribute("aria-expanded", isVisible ? "false" : "true");
  }

  btnUserMenu.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  document.addEventListener("click", (e) => {
    if (!authEl.contains(e.target)) {
      toggleDropdown(true);
    }
  });

  // Sign In Click
  btnGoogle.addEventListener("click", async () => {
    btnGoogle.disabled = true;
    btnGoogle.style.opacity = "0.7";
    const originalText = btnGoogle.querySelector("span").textContent;
    btnGoogle.querySelector("span").textContent = "Signing in...";

    try {
      await signInWithGoogle();
      if (typeof window.showToast === "function") {
        window.showToast("Signed in successfully with Google", "success");
      }
    } catch (err) {
      console.error("Sign-in error:", err);
      let errorMsg = err.message || "Failed to sign in.";
      if (err.code === "POPUP_CLOSED") {
        errorMsg = "Sign-in cancelled.";
      } else if (err.code === "POPUP_BLOCKED") {
        errorMsg = "Popup was blocked. Please allow popups for Google sign-in.";
      }
      if (typeof window.showToast === "function") {
        window.showToast(errorMsg, err.code === "POPUP_CLOSED" ? "info" : "error");
      }
    } finally {
      btnGoogle.disabled = false;
      btnGoogle.style.opacity = "1";
      btnGoogle.querySelector("span").textContent = originalText;
    }
  });

  // Sign Out Click
  btnSignOut.addEventListener("click", async () => {
    toggleDropdown(true);
    try {
      await logOut();
      if (typeof window.showToast === "function") {
        window.showToast("Signed out successfully", "info");
      }
    } catch (err) {
      console.error("Sign-out error:", err);
    }
  });

  // Listen to Auth State
  onAuthChange(({ user, profile, loading }) => {
    if (loading) {
      loadingEl.style.display = "flex";
      unauthEl.style.display = "none";
      authEl.style.display = "none";
      return;
    }

    loadingEl.style.display = "none";

    if (user) {
      unauthEl.style.display = "none";
      authEl.style.display = "block";

      const name = user.displayName || profile?.displayName || "Contributor";
      const photo = user.photoURL || profile?.photoURL || "/public/icon.png";
      const email = user.email || "";
      const role = profile?.role || "contributor";

      avatarImg.src = photo;
      avatarImg.alt = escapeHtml(name);
      userNameSpan.textContent = name;
      roleBadgeSpan.textContent = role;
      dropName.textContent = name;
      dropEmail.textContent = email;

      // Colorize badge based on role
      if (role === "admin" || role === "owner") {
        roleBadgeSpan.style.background = "rgba(239, 68, 68, 0.15)";
        roleBadgeSpan.style.borderColor = "rgba(239, 68, 68, 0.35)";
        roleBadgeSpan.style.color = "var(--td-error, #f87171)";
      } else if (role === "moderator") {
        roleBadgeSpan.style.background = "rgba(245, 158, 11, 0.15)";
        roleBadgeSpan.style.borderColor = "rgba(245, 158, 11, 0.35)";
        roleBadgeSpan.style.color = "var(--td-pending, #fbbf24)";
      } else {
        roleBadgeSpan.style.background = "rgba(96, 165, 250, 0.15)";
        roleBadgeSpan.style.borderColor = "rgba(96, 165, 250, 0.35)";
        roleBadgeSpan.style.color = "var(--td-info, #60a5fa)";
      }
    } else {
      authEl.style.display = "none";
      unauthEl.style.display = "block";
      toggleDropdown(true);
    }
  });
}
