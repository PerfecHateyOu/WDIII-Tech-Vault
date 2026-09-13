/**
 * WDIII Tech Vault - Input Security & HTML Sanitization Utility
 * 
 * Provides robust escaping, filtering, and template tagging to prevent
 * Cross-Site Scripting (XSS) and injection attacks when rendering
 * user-generated content into the DOM via innerHTML or template strings.
 */

// HTML entity replacement map
const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

const HTML_ESCAPE_REGEX = /[&<>"'`/=/]/g;

/**
 * Escapes standard HTML special characters in strings to prevent XSS.
 * Safely handles null, undefined, numbers, and boolean inputs.
 * 
 * @param {any} value - The input value to escape
 * @returns {string} - Escaped safe string
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value !== 'string') {
    try {
      value = String(value);
    } catch {
      return '';
    }
  }
  return value.replace(HTML_ESCAPE_REGEX, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Escapes an attribute value specifically for use inside HTML attributes (e.g. title="...", data-val="...").
 * 
 * @param {any} value
 * @returns {string}
 */
export function escapeAttribute(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`/g, '&#96;');
}

/**
 * Sanitizes plain text input:
 * - Strips ASCII control characters (preserving tabs, newlines)
 * - Limits maximum string length to prevent DOM DOS
 * - Escapes HTML entities
 * 
 * @param {any} value - The raw text
 * @param {number} [maxLength=4000] - Maximum permitted character count
 * @returns {string}
 */
export function sanitizeText(value, maxLength = 4000) {
  if (value === null || value === undefined) return '';
  let str = String(value).trim();
  
  // Strip null bytes and non-printable control characters (except \t, \n, \r)
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Enforce boundary length
  if (maxLength > 0 && str.length > maxLength) {
    str = str.slice(0, maxLength);
  }
  
  return escapeHtml(str);
}

/**
 * Validates and sanitizes a URL to ensure it does not execute scripts via javascript:, data:, or vbscript:
 * Only allows http:, https:, mailto:, tel:, or relative paths (/ or #).
 * 
 * @param {string} url - Candidate URL
 * @returns {string} - Safe sanitized URL or '#' fallback
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  
  // Relative links and anchors are safe
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    // Avoid double slashes indicating protocol-relative external URLs unless intentional
    if (trimmed.startsWith('//')) return '#';
    return escapeAttribute(trimmed);
  }
  
  // Strict regex check for permitted protocols
  const safeProtocolRegex = /^(https?:|mailto:|tel:)/i;
  if (!safeProtocolRegex.test(trimmed)) {
    return '#';
  }
  
  // Check for embedded dangerous characters or encoded protocols
  const decoded = decodeURIComponent(trimmed).replace(/\s+/g, '');
  if (/^(javascript:|data:|vbscript:)/i.test(decoded)) {
    return '#';
  }
  
  return escapeAttribute(trimmed);
}

/**
 * Wrapper class to mark strings that are intentionally verified safe HTML,
 * preventing double-escaping in the safeHtml tagged template literal.
 */
export class SafeHtmlString {
  constructor(html) {
    this.html = String(html);
  }
  toString() {
    return this.html;
  }
}

/**
 * Marks a string as pre-sanitized/trusted HTML markup.
 * Use with caution ONLY on curated, internal markup generators.
 * 
 * @param {string} html 
 * @returns {SafeHtmlString}
 */
export function markSafeHtml(html) {
  return new SafeHtmlString(html);
}

/**
 * Tagged template literal that automatically escapes all dynamic expressions
 * while preserving the static HTML template structure.
 * 
 * Example:
 * const user = "<script>alert(1)</script>";
 * const html = safeHtml`<div class="card"><h3>${user}</h3></div>`;
 * // Output: <div class="card"><h3>&lt;script&gt;alert(1)&lt;/script&gt;</h3></div>
 */
export function safeHtml(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      const val = values[i];
      if (val instanceof SafeHtmlString) {
        result += val.toString();
      } else if (Array.isArray(val)) {
        result += val.map(item => item instanceof SafeHtmlString ? item.toString() : escapeHtml(item)).join('');
      } else {
        result += escapeHtml(val);
      }
    }
  }
  return markSafeHtml(result);
}

/**
 * Deep sanitization of objects or arrays of user data.
 * Recursively escapes all string values in user-provided payloads.
 * 
 * @param {any} data - Object, array, or primitive
 * @param {number} [maxDepth=5]
 * @returns {any}
 */
export function sanitizeObject(data, maxDepth = 5) {
  if (maxDepth < 0) return null;
  if (data === null || data === undefined) return data;
  if (typeof data === 'string') return sanitizeText(data);
  if (typeof data === 'number' || typeof data === 'boolean') return data;
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeObject(item, maxDepth - 1));
  }
  
  if (typeof data === 'object') {
    const cleaned = {};
    for (const [key, val] of Object.entries(data)) {
      // Sanitize object keys as well to prevent prototype pollution or injection
      const cleanKey = String(key).replace(/[^a-zA-Z0-9_\-\.]/g, '');
      if (cleanKey === '__proto__' || cleanKey === 'constructor' || cleanKey === 'prototype') {
        continue;
      }
      cleaned[cleanKey] = sanitizeObject(val, maxDepth - 1);
    }
    return cleaned;
  }
  
  return null;
}
