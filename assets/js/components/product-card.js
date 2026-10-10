import { store } from '../core/store.js';
import { t } from '../core/i18n.js';
import { money } from '../core/currency.js';
import { qs, qsa, el, escapeHtml, setImg, starsHtml, throttle } from '../core/utils.js';
import { CONFIG } from '../core/config.js';
import { openModal } from './modal.js';
import { showToast } from './toast.js';
import { addToCart as drawerAdd } from './cart-drawer.js';

/** Build a product card HTML string. */
export function productCard(p, { list = false } = {}) {
  const wished = store.isWishlisted(p.id);
  const out = p.stock <= 0;
  const badges = [
    p.discount ? `<span class="badge badge-sale">-${p.discount}%</span>` : '',
    p.isNew ? `<span class="badge badge-new">${t('common.new')}</span>` : '',
    p.isBestSeller ? `<span class="badge badge-best">${t('common.bestSeller')}</span>` : (p.sold > 1500 ? `<span class="badge badge-best">${t('common.bestSeller')}</span>` : ''),
    out ? `<span class="badge badge-out">${t('common.outOfStock')}</span>` : ''
  ].join('');
  return `
  <article class="card" data-id="${p.id}">
    <div class="card-media">
      <a href="product.html?id=${p.id}" aria-label="${escapeHtml(p.name)}">
        <img class="img-main" data-src="${p.images[0]}" alt="${escapeHtml(p.name)}">
        <img class="img-alt" data-src="${p.images[1] || p.images[0]}" alt="">
      </a>
      <div class="badges">${badges}</div>
      <div class="card-tools">
        <button class="icon-btn js-wish ${wished ? 'active' : ''}" aria-label="${t('nav.wishlist')}" aria-pressed="${wished}"><i class="fa${wished ? 's' : 'r'} fa-heart"></i></button>
        <button class="icon-btn js-quick" aria-label="${t('common.quickView')}"><i class="far fa-eye"></i></button>
        <button class="icon-btn js-cmp ${store.getCompare().includes(p.id) ? 'active' : ''}" aria-label="${t('common.compare')}"><i class="fas fa-scale-balanced"></i></button>
      </div>
    </div>
    <div class="card-body">
      <span class="cat-label">${escapeHtml(p.brand)}</span>
      <a href="product.html?id=${p.id}" class="card-title">${escapeHtml(p.name)}</a>
      ${list ? `<p class="card-desc">${escapeHtml(p.description)}</p>` : ''}
      <div class="flex" style="gap:6px">
        <span class="stars" aria-label="${p.rating} ${t('common.rating')}">${starsHtml(p.rating)}</span>
        <span class="pill">(${p.reviewsCount})</span>
      </div>
      ${p.stock > 0 && p.stock <= 5 ? `<span class="stock-hint">${t('product.only')} ${p.stock} ${t('product.left')}</span>` : ''}
      <div class="card-foot">
        <div>
          <span class="price">${money(p.price)}</span>
          ${p.oldPrice ? `<span class="price-old">${money(p.oldPrice)}</span>` : ''}
        </div>
        <button class="add-cart ${out ? 'disabled' : ''} js-add" aria-label="${t('common.addToCart')}" ${out ? 'disabled' : ''}><i class="fas fa-plus"></i></button>
      </div>
    </div>
  </article>`;
}

/** Hydrate lazy images inside a scope. */
export function hydrateMedia(scope = document) {
  qsa('img[data-src]', scope).forEach((img) => {
    setImg(img, img.dataset.src, img.alt, img.dataset.src);
    img.removeAttribute('data-src');
  });
}

/** Render an array of products into a container. */
export function renderProducts(container, products, opts = {}) {
  if (!container) return;
  if (!products.length) {
    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-magnifying-glass"></i><h3>${t('shop.noResults')}</h3></div>`;
    return;
  }
  container.innerHTML = products.map((p) => productCard(p, opts)).join('');
  hydrateMedia(container);
}

/** Quick view modal. */
export function openQuickView(p) {
  const hasOptions = (p.colors && p.colors.length) || (p.sizes && p.sizes.length);
  const html = `
    <div class="quickview-grid" style="padding:24px">
      <div class="media" style="border-radius:14px"><img id="qvImg" src="${p.images[0]}" alt="${escapeHtml(p.name)}"></div>
      <div>
        <span class="eyebrow">${escapeHtml(p.brand)}</span>
        <h3 style="margin:6px 0">${escapeHtml(p.name)}</h3>
        <div class="flex" style="gap:6px"><span class="stars">${starsHtml(p.rating)}</span><span class="pill">(${p.reviewsCount} ${t('common.reviews')})</span></div>
        <div class="product-price"><span class="now">${money(p.price)}</span>${p.oldPrice ? `<span class="price-old">${money(p.oldPrice)}</span>` : ''}</div>
        <p class="text-soft" style="font-size:.88rem;margin-bottom:16px">${escapeHtml(p.description)}</p>
        ${p.colors && p.colors.length ? `<div style="margin-bottom:12px"><label style="font-size:.8rem;font-weight:600">${t('common.color')}</label><div class="swatches mt-2" id="qvColors">${p.colors.map((c, i) => `<button class="swatch ${i === 0 ? 'active' : ''}" data-val="${c}" title="${c}" style="background:${colorFor(c)}"></button>`).join('')}</div></div>` : ''}
        ${p.sizes && p.sizes.length ? `<div style="margin-bottom:12px"><label style="font-size:.8rem;font-weight:600">${t('common.size')}</label><div class="flex wrap mt-2" id="qvSizes">${p.sizes.map((s, i) => `<button class="size-opt ${i === 0 ? 'active' : ''}" data-val="${s}">${s}</button>`).join('')}</div></div>` : ''}
        <div class="flex mt-4">
          <div class="qty"><button id="qvMinus" aria-label="minus"><i class="fas fa-minus"></i></button><input id="qvQty" value="1" readonly><button id="qvPlus" aria-label="plus"><i class="fas fa-plus"></i></button></div>
          <button class="btn btn-primary grow" id="qvAdd" ${p.stock <= 0 ? 'disabled' : ''}><i class="fas fa-bag-shopping"></i> ${t('common.addToCart')}</button>
        </div>
        <a href="product.html?id=${p.id}" class="btn btn-ghost btn-block mt-2">${t('common.viewMore')}</a>
      </div>
    </div>`;
  openModal(html, { wide: true });
  const wrap = qs('#nova-modal');
  const getSel = (sel) => qs(sel, wrap)?.dataset.val;
  qsa('#qvColors .swatch', wrap).forEach((b) => b.addEventListener('click', () => { qsa('#qvColors .swatch', wrap).forEach((x) => x.classList.remove('active')); b.classList.add('active'); }));
  qsa('#qvSizes .size-opt', wrap).forEach((b) => b.addEventListener('click', () => { qsa('#qvSizes .size-opt', wrap).forEach((x) => x.classList.remove('active')); b.classList.add('active'); }));
  const qtyIn = qs('#qvQty', wrap);
  qs('#qvPlus', wrap).addEventListener('click', () => { qtyIn.value = Math.min(Number(qtyIn.value) + 1, p.stock || 99); });
  qs('#qvMinus', wrap).addEventListener('click', () => { qtyIn.value = Math.max(1, Number(qtyIn.value) - 1); });
  qs('#qvAdd', wrap).addEventListener('click', () => {
    drawerAdd(p, Number(qtyIn.value), qs('#qvColors .swatch.active', wrap)?.dataset.val || '', qs('#qvSizes .size-opt.active', wrap)?.dataset.val || '');
  });
}

const colorFor = (name) => ({
  black: '#111318', white: '#fff', silver: '#c9cdd6', navy: '#1f2a44', blue: '#2e6ff2', red: '#e63946',
  green: '#12b76a', beige: '#d9c7a7', brown: '#7a4b2a', pink: '#f4a7bb', gold: '#d4af37', gray: '#6b7280', purple: '#6C5CE7'
}[String(name).toLowerCase()] || '#888');

/** Compare modal. */
export function openCompare() {
  const ids = store.getCompare();
  if (!ids.length) { showToast('info', t('compare.empty')); return; }
  const products = ids.map((id) => window.NOVA.products.find((p) => p.id === id)).filter(Boolean);
  const rows = [
    ['', (p) => `<img src="${p.images[0]}" alt=""><br><a href="product.html?id=${p.id}" style="font-weight:600">${escapeHtml(p.name)}</a>`],
    [t('common.price'), (p) => `<strong>${money(p.price)}</strong>`],
    [t('common.rating'), (p) => `<span class="stars">${starsHtml(p.rating)}</span> ${p.rating}`],
    [t('common.brand'), (p) => escapeHtml(p.brand)],
    [t('common.category'), (p) => p.category],
    [t('shop.inStockOnly'), (p) => p.stock > 0 ? t('common.inStock') : t('common.outOfStock')],
    ['', (p) => `<button class="btn btn-sm btn-primary" onclick="NOVA.addProduct(${p.id})">${t('common.addToCart')}</button>`]
  ];
  const html = `<div style="padding:24px"><h3 style="margin-bottom:16px">${t('compare.title')}</h3>
    <div style="overflow-x:auto"><table class="compare-table"><tbody>
    ${rows.map(([label, fn]) => `<tr><th>${label}</th>${products.map((p) => `<td>${fn(p)}</td>`).join('')}</tr>`).join('')}
    <tr><th></th>${products.map((p) => `<td><button class="btn btn-sm btn-ghost" onclick="NOVA.toggleCompare(${p.id});NOVA.closeModal()">${t('common.remove')}</button></td>`).join('')}</tr>
    </tbody></table></div></div>`;
  openModal(html, { wide: true });
}

/** Attach delegated card events (once). */
let bound = false;
export function initCardEvents() {
  if (bound) return;
  bound = true;
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card && (e.target.closest('.js-wish') || e.target.closest('.js-quick') || e.target.closest('.js-add') || e.target.closest('.js-cmp'))) {
      e.preventDefault();
      const id = Number(card.dataset.id);
      const p = window.NOVA.products.find((x) => x.id === id);
      if (!p) return;
      if (e.target.closest('.js-wish')) {
        const on = store.toggleWishlist(id);
        const btn = e.target.closest('.js-wish');
        btn.classList.toggle('active', on);
        btn.innerHTML = `<i class="fa${on ? 's' : 'r'} fa-heart"></i>`;
        showToast(on ? 'success' : 'info', on ? t('common.addedToCart').replace(t('common.addToCart'), t('nav.wishlist')) : t('common.remove'));
      } else if (e.target.closest('.js-quick')) {
        openQuickView(p);
      } else if (e.target.closest('.js-cmp')) {
        const ok = store.toggleCompare(id, CONFIG.compareLimit);
        if (!ok) { showToast('error', t('compare.max')); return; }
        e.target.closest('.js-cmp').classList.toggle('active');
      } else if (e.target.closest('.js-add')) {
        if (p.stock <= 0) return;
        if ((p.colors && p.colors.length) || (p.sizes && p.sizes.length)) openQuickView(p);
        else drawerAdd(p, 1);
      }
    }
  });
}
