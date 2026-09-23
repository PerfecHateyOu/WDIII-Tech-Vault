/**
 * WDIII Tech Vault - Experiment Comments & Peer Discussion Component
 * 
 * Embeds a full-featured real-time discussion thread at the bottom of experiment pages:
 * - Powered by Google Cloud Firestore
 * - Registered contributors, moderators, and owners can post findings
 * - Visitors receive an informative prompt to authenticate with Google
 * - Authors can edit and delete their comments
 * - Moderators & owners have administrative moderation capabilities
 * - Supports real-time peer upvotes, formatted text, and responsive design
 */

import {
  subscribeToComments,
  addComment,
  updateComment,
  deleteComment,
  toggleLikeComment
} from "../services/comments-service.js";
import {
  getCurrentUser,
  getCurrentProfile,
  signInWithGoogle,
  onAuthChange,
  isSystemOwner
} from "../services/firebase.js";
import { escapeHtml } from "../utils/sanitize.js";

/**
 * Format relative time (e.g. "5m ago", "2h ago", or formatted date)
 */
function formatTime(isoString) {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const now = Date.now();
    const diff = Math.floor((now - d.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined
    });
  } catch (e) {
    return "";
  }
}

/**
 * Format comment content safely with paragraph and formatting support
 */
function formatCommentContent(rawText) {
  if (!rawText) return "";
  const escaped = escapeHtml(rawText);

  // Convert double newlines to paragraphs, single newlines to <br>
  const paragraphs = escaped.split(/\n\s*\n/);
  return paragraphs
    .map(p => {
      let formatted = p.replace(/\n/g, "<br>");
      // Simple code highlight: `code`
      formatted = formatted.replace(/`([^`]+)`/g, '<code style="background:var(--td-bg-surface-elevated); border:1px solid var(--td-border-subtle); padding:0.15rem 0.35rem; border-radius:0.25rem; font-family:monospace; font-size:0.85em; color:var(--td-info);">$1</code>');
      return `<p style="margin:0 0 0.5rem 0; line-height:1.6; word-break:break-word;">${formatted}</p>`;
    })
    .join("");
}

/**
 * Render role badge
 */
function renderRoleBadge(role, isOwner) {
  if (isOwner || role === "owner") {
    return `<span style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; padding:0.15rem 0.45rem; border-radius:0.25rem; background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.3);">👑 Owner</span>`;
  }
  if (role === "admin") {
    return `<span style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; padding:0.15rem 0.45rem; border-radius:0.25rem; background:rgba(168,85,247,0.15); color:#c084fc; border:1px solid rgba(168,85,247,0.3);">🛡️ Admin</span>`;
  }
  if (role === "moderator") {
    return `<span style="font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; padding:0.15rem 0.45rem; border-radius:0.25rem; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.3);">⚖️ Moderator</span>`;
  }
  return `<span style="font-size:0.7rem; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; padding:0.15rem 0.45rem; border-radius:0.25rem; background:var(--td-bg-surface-elevated); color:var(--td-text-secondary); border:1px solid var(--td-border-subtle);">Contributor</span>`;
}

/**
 * Initialize and render the Comments Section into a container
 * 
 * @param {HTMLElement} container
 * @param {string} experimentId
 * @returns {Function} cleanup function
 */
export function initCommentsSection(container, experimentId) {
  if (!container || !experimentId) return () => {};

  let currentComments = [];
  let unsubscribeComments = null;
  let unsubscribeAuth = null;
  let editingCommentId = null;

  // Render initial skeleton layout
  container.innerHTML = `
    <section id="experiment-comments-section" style="margin-top:2.5rem; border:1px solid var(--td-border); border-radius:0.75rem; background:var(--td-bg-surface); overflow:hidden;">
      <!-- Comments Section Header -->
      <div style="padding:1.5rem 1.75rem; border-bottom:1px solid var(--td-border); background:var(--td-bg-surface-elevated); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <span style="font-size:1.3rem;">💬</span>
            <h2 style="margin:0; font-size:1.25rem; font-weight:700; color:#fff;">
              Peer Discussion &amp; Findings
            </h2>
            <span id="commentCountBadge" style="background:var(--td-info-bg); color:var(--td-info); border:1px solid var(--td-info); font-size:0.75rem; font-weight:700; padding:0.15rem 0.55rem; border-radius:9999px;">
              0 findings
            </span>
          </div>
          <p style="margin:0.35rem 0 0 0; font-size:0.88rem; color:var(--td-text-secondary);">
            Exchange replication observations, debate test controls, and ask questions regarding this protocol.
          </p>
        </div>
        <div style="font-size:0.8rem; color:var(--td-text-muted); font-family:monospace;">
          ARCHIVE PROTOCOL // ${escapeHtml(experimentId).toUpperCase()}
        </div>
      </div>

      <!-- Add Comment Form Area -->
      <div id="commentInputArea" style="padding:1.5rem 1.75rem; border-bottom:1px solid var(--td-border); background:var(--td-bg-card);">
        <!-- Injected via updateInputArea() -->
      </div>

      <!-- Comments List Feed -->
      <div id="commentsFeedArea" style="padding:1.5rem 1.75rem;">
        <div style="text-align:center; padding:2rem; color:var(--td-text-muted);">
          Loading findings &amp; discussion...
        </div>
      </div>
    </section>
  `;

  const countBadgeEl = container.querySelector("#commentCountBadge");
  const inputAreaEl = container.querySelector("#commentInputArea");
  const feedAreaEl = container.querySelector("#commentsFeedArea");

  /**
   * Render the input box according to current authentication state
   */
  function updateInputArea() {
    const user = getCurrentUser();
    const profile = getCurrentProfile();
    const isVisitor = !user || user.isVisitor === true || profile?.isVisitor === true;
    const isOwner = user ? isSystemOwner(user) : false;

    if (isVisitor) {
      inputAreaEl.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; padding:1.25rem; border-radius:0.5rem; background:rgba(56,189,248,0.06); border:1px dashed rgba(56,189,248,0.3);">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="font-size:1.6rem;">🔒</div>
            <div>
              <div style="font-weight:600; font-size:0.95rem; color:#fff; margin-bottom:0.2rem;">
                Sign in to join the peer discussion
              </div>
              <div style="font-size:0.85rem; color:var(--td-text-secondary);">
                ${user?.isVisitor ? "You are currently browsing in Guest/Visitor Mode (read-only). Sign in with Google to post your findings." : "Registered contributors can publish findings, share reproduction test logs, and upvote insights."}
              </div>
            </div>
          </div>
          <button type="button" id="btnSignInToComment" style="display:inline-flex; align-items:center; gap:0.5rem; padding:0.55rem 1.1rem; border-radius:0.375rem; background:var(--td-info); color:#fff; font-size:0.85rem; font-weight:600; border:none; cursor:pointer; transition:background 0.15s; white-space:nowrap;">
            <svg style="width:16px; height:16px;" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
            Sign in with Google
          </button>
        </div>
      `;

      const btnSignIn = inputAreaEl.querySelector("#btnSignInToComment");
      btnSignIn?.addEventListener("click", async () => {
        try {
          btnSignIn.disabled = true;
          btnSignIn.textContent = "Connecting...";
          await signInWithGoogle();
        } catch (err) {
          console.error("Sign in error:", err);
          if (window.showToast) window.showToast("Sign in failed: " + err.message, "error");
        } finally {
          btnSignIn.disabled = false;
        }
      });
      return;
    }

    // Registered user input form
    const authorName = profile?.displayName || user.displayName || "Contributor";
    const authorRole = profile?.role || (isOwner ? "owner" : "contributor");
    const avatarUrl = user.photoURL || profile?.photoURL || "";

    inputAreaEl.innerHTML = `
      <form id="commentPostForm" style="margin:0;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            ${avatarUrl ? `
              <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(authorName)}" style="width:28px; height:28px; border-radius:50%; object-fit:cover; border:1px solid var(--td-border);" />
            ` : `
              <div style="width:28px; height:28px; border-radius:50%; background:var(--td-info-bg); color:var(--td-info); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.8rem;">
                ${escapeHtml(authorName.charAt(0).toUpperCase())}
              </div>
            `}
            <span style="color:#fff; font-size:0.9rem; font-weight:600;">
              ${escapeHtml(authorName)}
            </span>
            ${renderRoleBadge(authorRole, isOwner)}
          </div>
          <div style="font-size:0.78rem; color:var(--td-text-muted);">
            Markdown inline: <code style="color:var(--td-info); background:var(--td-bg-surface-elevated); padding:0.1rem 0.3rem; border-radius:0.2rem;">\`code\`</code> supported
          </div>
        </div>

        <div style="position:relative;">
          <textarea
            id="commentContentInput"
            placeholder="Share your replication data, ask questions about test controls, or note discrepancies with official findings..."
            maxlength="3000"
            rows="3"
            style="width:100%; box-sizing:border-box; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.5rem; padding:0.85rem; color:#fff; font-size:0.92rem; line-height:1.5; font-family:inherit; resize:vertical; outline:none; transition:border-color 0.15s;"
          ></textarea>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.75rem; flex-wrap:wrap; gap:0.75rem;">
          <span id="charCounter" style="font-size:0.78rem; color:var(--td-text-muted);">
            0 / 3,000 characters
          </span>

          <div style="display:flex; gap:0.5rem; align-items:center;">
            <button
              type="submit"
              id="btnSubmitComment"
              style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.55rem 1.25rem; border-radius:0.375rem; background:var(--td-info); color:#fff; font-size:0.88rem; font-weight:600; border:none; cursor:pointer; transition:opacity 0.15s;"
            >
              <span>Post Finding</span>
              <span style="font-size:1rem;">↗</span>
            </button>
          </div>
        </div>
      </form>
    `;

    const form = inputAreaEl.querySelector("#commentPostForm");
    const textarea = inputAreaEl.querySelector("#commentContentInput");
    const charCounter = inputAreaEl.querySelector("#charCounter");
    const submitBtn = inputAreaEl.querySelector("#btnSubmitComment");

    textarea?.addEventListener("input", () => {
      const len = textarea.value.length;
      charCounter.textContent = `${len.toLocaleString()} / 3,000 characters`;
      if (len > 2800) {
        charCounter.style.color = "var(--td-warning)";
      } else {
        charCounter.style.color = "var(--td-text-muted)";
      }
    });

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const content = (textarea.value || "").trim();
      if (!content || content.length < 2) {
        if (window.showToast) window.showToast("Comment must be at least 2 characters.", "warning");
        textarea.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Posting...</span>`;

      try {
        await addComment({
          experimentId,
          content
        });

        textarea.value = "";
        charCounter.textContent = `0 / 3,000 characters`;
        if (window.showToast) window.showToast("Finding published to discussion thread!", "success");
      } catch (err) {
        console.error("Error posting comment:", err);
        if (window.showToast) window.showToast(err.message || "Failed to post comment", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<span>Post Finding</span> <span style="font-size:1rem;">↗</span>`;
      }
    });
  }

  /**
   * Render the list of comments
   */
  function renderCommentsList(comments) {
    currentComments = comments || [];
    const count = currentComments.length;

    // Update count badge
    if (countBadgeEl) {
      countBadgeEl.textContent = `${count} ${count === 1 ? "finding" : "findings"}`;
    }

    if (count === 0) {
      feedAreaEl.innerHTML = `
        <div style="text-align:center; padding:3rem 1.5rem; background:var(--td-bg-surface-elevated); border:1px dashed var(--td-border); border-radius:0.5rem;">
          <div style="font-size:2.2rem; margin-bottom:0.5rem;">🔬</div>
          <h3 style="color:#fff; font-size:1.05rem; font-weight:600; margin:0 0 0.35rem 0;">
            No peer findings recorded yet
          </h3>
          <p style="color:var(--td-text-secondary); font-size:0.88rem; margin:0; max-width:440px; margin:0 auto; line-height:1.5;">
            Have you replicated this protocol or tested comparable hardware? Sign in to contribute your data points.
          </p>
        </div>
      `;
      return;
    }

    const currentUser = getCurrentUser();
    const currentProfile = getCurrentProfile();
    const isOwner = currentUser ? isSystemOwner(currentUser) : false;
    const canModerate = isOwner || currentProfile?.role === "admin" || currentProfile?.role === "moderator" || currentProfile?.role === "owner";

    feedAreaEl.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        ${currentComments.map(comment => {
          const isAuthor = currentUser && currentUser.uid === comment.authorId;
          const isEditing = editingCommentId === comment.id;
          const authorRole = comment.authorRole || "contributor";
          const isAuthorOwner = authorRole === "owner" || (comment.authorEmail && comment.authorEmail.toLowerCase() === "perfectshadowkai33@gmail.com");
          const liked = currentUser && Array.isArray(comment.likedBy) && comment.likedBy.includes(currentUser.uid);

          return `
            <div id="comment-card-${escapeHtml(comment.id)}" class="comment-card" style="padding:1.25rem; background:var(--td-bg-surface-elevated); border:1px solid var(--td-border); border-radius:0.5rem; transition:border-color 0.15s;">
              <!-- Comment Header -->
              <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
                <div style="display:flex; align-items:center; gap:0.6rem;">
                  ${comment.authorPhotoURL ? `
                    <img src="${escapeHtml(comment.authorPhotoURL)}" alt="${escapeHtml(comment.authorDisplayName || "User")}" style="width:32px; height:32px; border-radius:50%; object-fit:cover; border:1px solid var(--td-border);" />
                  ` : `
                    <div style="width:32px; height:32px; border-radius:50%; background:var(--td-info-bg); color:var(--td-info); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.85rem; border:1px solid rgba(56,189,248,0.3);">
                      ${escapeHtml((comment.authorDisplayName || "C").charAt(0).toUpperCase())}
                    </div>
                  `}
                  <div>
                    <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap;">
                      <span style="color:#fff; font-size:0.92rem; font-weight:600;">
                        ${escapeHtml(comment.authorDisplayName || "Anonymous Contributor")}
                      </span>
                      ${renderRoleBadge(authorRole, isAuthorOwner)}
                    </div>
                    <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.78rem; color:var(--td-text-muted); margin-top:0.15rem;">
                      <span>${formatTime(comment.createdAt)}</span>
                      ${comment.isEdited ? `<span>• (edited)</span>` : ""}
                    </div>
                  </div>
                </div>

                <!-- Action buttons (Edit/Delete) -->
                <div style="display:flex; align-items:center; gap:0.35rem;">
                  ${isAuthor && !isEditing ? `
                    <button
                      type="button"
                      class="btn-edit-comment"
                      data-id="${escapeHtml(comment.id)}"
                      title="Edit finding"
                      style="background:none; border:none; color:var(--td-text-muted); font-size:0.8rem; cursor:pointer; padding:0.25rem 0.5rem; border-radius:0.25rem; transition:color 0.15s;"
                    >
                      ✏️ Edit
                    </button>
                  ` : ""}
                  ${(isAuthor || canModerate) ? `
                    <button
                      type="button"
                      class="btn-delete-comment"
                      data-id="${escapeHtml(comment.id)}"
                      data-author="${escapeHtml(comment.authorId)}"
                      title="Delete finding"
                      style="background:none; border:none; color:var(--td-text-muted); font-size:0.8rem; cursor:pointer; padding:0.25rem 0.5rem; border-radius:0.25rem; transition:color 0.15s;"
                    >
                      🗑️ Delete
                    </button>
                  ` : ""}
                </div>
              </div>

              <!-- Comment Body / Inline Edit View -->
              ${isEditing ? `
                <div style="margin-top:0.5rem;">
                  <textarea
                    id="editInput-${escapeHtml(comment.id)}"
                    rows="3"
                    maxlength="3000"
                    style="width:100%; box-sizing:border-box; background:var(--td-bg-surface); border:1px solid var(--td-info); border-radius:0.375rem; padding:0.75rem; color:#fff; font-size:0.92rem; font-family:inherit; line-height:1.5; outline:none;"
                  >${escapeHtml(comment.content || "")}</textarea>
                  <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.5rem;">
                    <button
                      type="button"
                      class="btn-cancel-edit"
                      style="padding:0.35rem 0.75rem; border-radius:0.25rem; background:var(--td-bg-surface); border:1px solid var(--td-border); color:var(--td-text-secondary); font-size:0.82rem; cursor:pointer;"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      class="btn-save-edit"
                      data-id="${escapeHtml(comment.id)}"
                      style="padding:0.35rem 0.85rem; border-radius:0.25rem; background:var(--td-info); border:none; color:#fff; font-size:0.82rem; font-weight:600; cursor:pointer;"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ` : `
                <div class="comment-content" style="color:var(--td-text-primary); font-size:0.92rem; margin:0.5rem 0 0.75rem 0;">
                  ${formatCommentContent(comment.content)}
                </div>

                <!-- Footer / Reactions Bar -->
                <div style="display:flex; align-items:center; gap:0.75rem; border-top:1px solid var(--td-border-subtle); padding-top:0.6rem; margin-top:0.6rem;">
                  <button
                    type="button"
                    class="btn-like-comment"
                    data-id="${escapeHtml(comment.id)}"
                    title="Upvote finding"
                    style="display:inline-flex; align-items:center; gap:0.35rem; background:${liked ? "rgba(56,189,248,0.15)" : "var(--td-bg-surface)"}; border:1px solid ${liked ? "var(--td-info)" : "var(--td-border-subtle)"}; color:${liked ? "var(--td-info)" : "var(--td-text-secondary)"}; font-size:0.82rem; font-weight:600; padding:0.25rem 0.65rem; border-radius:9999px; cursor:pointer; transition:all 0.15s;"
                  >
                    <span>👍</span>
                    <span>${(comment.likesCount || (Array.isArray(comment.likedBy) ? comment.likedBy.length : 0))}</span>
                  </button>

                  <button
                    type="button"
                    class="btn-quote-comment"
                    data-id="${escapeHtml(comment.id)}"
                    data-author="${escapeHtml(comment.authorDisplayName || "Researcher")}"
                    title="Quote in reply"
                    style="display:inline-flex; align-items:center; gap:0.35rem; background:none; border:none; color:var(--td-text-muted); font-size:0.82rem; cursor:pointer; padding:0.25rem 0.5rem; border-radius:0.25rem; transition:color 0.15s;"
                  >
                    <span>↩ Reply</span>
                  </button>
                </div>
              `}
            </div>
          `;
        }).join("")}
      </div>
    `;

    // Attach listeners to comment list items
    feedAreaEl.querySelectorAll(".btn-like-comment").forEach(btn => {
      btn.addEventListener("click", async () => {
        const commentId = btn.getAttribute("data-id");
        try {
          const user = getCurrentUser();
          if (!user || user.isVisitor) {
            if (window.showToast) window.showToast("Sign in with Google to upvote findings.", "warning");
            return;
          }
          await toggleLikeComment(commentId, experimentId);
        } catch (err) {
          if (window.showToast) window.showToast(err.message, "error");
        }
      });
    });

    feedAreaEl.querySelectorAll(".btn-edit-comment").forEach(btn => {
      btn.addEventListener("click", () => {
        editingCommentId = btn.getAttribute("data-id");
        renderCommentsList(currentComments);
      });
    });

    feedAreaEl.querySelectorAll(".btn-cancel-edit").forEach(btn => {
      btn.addEventListener("click", () => {
        editingCommentId = null;
        renderCommentsList(currentComments);
      });
    });

    feedAreaEl.querySelectorAll(".btn-save-edit").forEach(btn => {
      btn.addEventListener("click", async () => {
        const commentId = btn.getAttribute("data-id");
        const textarea = feedAreaEl.querySelector(`#editInput-${commentId}`);
        const newText = textarea ? textarea.value : "";

        try {
          btn.disabled = true;
          btn.textContent = "Saving...";
          await updateComment(commentId, experimentId, newText);
          editingCommentId = null;
          if (window.showToast) window.showToast("Finding updated.", "success");
        } catch (err) {
          if (window.showToast) window.showToast(err.message || "Failed to update", "error");
        } finally {
          btn.disabled = false;
        }
      });
    });

    feedAreaEl.querySelectorAll(".btn-delete-comment").forEach(btn => {
      btn.addEventListener("click", async () => {
        const commentId = btn.getAttribute("data-id");
        const authorId = btn.getAttribute("data-author");

        const confirmed = window.confirm("Are you sure you want to remove this finding from the discussion?");
        if (!confirmed) return;

        try {
          btn.disabled = true;
          await deleteComment(commentId, experimentId, authorId);
          if (window.showToast) window.showToast("Finding removed.", "info");
        } catch (err) {
          if (window.showToast) window.showToast(err.message || "Failed to delete", "error");
        }
      });
    });

    feedAreaEl.querySelectorAll(".btn-quote-comment").forEach(btn => {
      btn.addEventListener("click", () => {
        const commentId = btn.getAttribute("data-id");
        const author = btn.getAttribute("data-author");
        const c = currentComments.find(x => x.id === commentId);
        if (!c) return;

        const textarea = inputAreaEl.querySelector("#commentContentInput");
        if (textarea) {
          const quoteText = `> @${author}: "${c.content.slice(0, 100)}${c.content.length > 100 ? '...' : ''}"\n\n`;
          textarea.value = quoteText + textarea.value;
          textarea.focus();
          textarea.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });
  }

  // Listen to auth state changes to update the comment input bar dynamically
  unsubscribeAuth = onAuthChange(() => {
    updateInputArea();
    renderCommentsList(currentComments);
  });

  // Subscribe to real-time comments updates
  subscribeToComments(
    experimentId,
    (comments) => {
      renderCommentsList(comments);
    },
    (err) => {
      console.warn("Real-time comment stream note:", err);
    }
  ).then(unsub => {
    unsubscribeComments = unsub;
  });

  // Initial render of input area
  updateInputArea();

  // Return teardown function
  return () => {
    if (typeof unsubscribeComments === "function") {
      unsubscribeComments();
    }
    if (typeof unsubscribeAuth === "function") {
      unsubscribeAuth();
    }
  };
}
