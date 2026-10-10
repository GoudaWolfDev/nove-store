/** Small DOM + helper utilities (no globals). */

/** querySelector shorthand */
export const qs = (sel, ctx = document) => ctx.querySelector(sel);
/** querySelectorAll shorthand -> array */
export const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/**
 * Create a DOM element.
 * @param {string} tag
 * @param {object} [props] - className, html, text, dataset, style, attrs, on
 * @param {(Node|string)[]} [children]
 */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  const { className, html, text, dataset, style, attrs, on, ...rest } = props;
  if (className) node.className = className;
  if (html != null) node.innerHTML = html;
  if (text != null) node.textContent = text;
  if (dataset) Object.entries(dataset).forEach(([k, v]) => { node.dataset[k] = v; });
  if (style) Object.assign(node.style, style);
  if (attrs) Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  if (on) Object.entries(on).forEach(([k, v]) => node.addEventListener(k, v));
  Object.entries(rest).forEach(([k, v]) => { node[k] = v; });
  const list = Array.isArray(children) ? children : [children];
  list.forEach((c) => c != null && node.append(c.nodeType ? c : document.createTextNode(String(c))));
  return node;
}

/** Escape user text for safe HTML insertion. */
export const escapeHtml = (str = '') =>
  String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Debounce a function by ms. */
export function debounce(fn, ms = 250) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

/** Throttle a function by ms. */
export function throttle(fn, ms = 200) {
  let last = 0;
  return (...args) => { const now = Date.now(); if (now - last >= ms) { last = now; fn(...args); } };
}

/** Format a number with locale separators. */
export const formatNum = (n, digits = 0) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Return star rating HTML. */
export const starsHtml = (rating = 0) => {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    const cls = rating >= i ? 'fas fa-star' : rating >= i - 0.5 ? 'fas fa-star-half-alt' : 'far fa-star';
    html += `<i class="${cls}"></i>`;
  }
  return html;
};

/** Unique id generator. */
export const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/** Format a date for display. */
export const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

export const round2 = (n) => Math.round(n * 100) / 100;

/** Luhn algorithm check for card numbers. */
export function luhn(num) {
  const digits = String(num).replace(/\D/g, '');
  if (digits.length < 12) return false;
  let sum = 0, alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d; alt = !alt;
  }
  return sum % 10 === 0;
}

/** Set an image source with skeleton + error fallback. */
export function setImg(img, src, alt, seed) {
  if (!img) return;
  img.alt = alt || '';
  img.loading = 'lazy';
  img.classList.add('skeleton');
  const done = () => { img.classList.remove('skeleton'); img.classList.add('loaded'); };
  img.addEventListener('load', done, { once: true });
  img.addEventListener('error', () => {
    img.onerror = null;
    img.src = `https://picsum.photos/seed/${encodeURIComponent(seed || alt || 'nova')}/800/800`;
  }, { once: true });
  img.src = src;
}

/** Safe localStorage access. */
export const safeStore = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }
};

/** Build a query string from an object, skipping empty values. */
export function toQuery(obj) {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v === '' || v == null || (Array.isArray(v) && !v.length)) return;
    p.set(k, Array.isArray(v) ? v.join(',') : v);
  });
  return p.toString();
}
