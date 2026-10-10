import { PRODUCTS } from '../data/products.js';
import { CATEGORIES, BRANDS } from '../data/categories.js';
import { t, getLang } from '../core/i18n.js';
import { money } from '../core/currency.js';
import { store } from '../core/store.js';
import { qs, qsa, el, escapeHtml, debounce, toQuery } from '../core/utils.js';
import { renderProducts, hydrateMedia } from '../components/product-card.js';
import { openCompare } from '../components/product-card.js';

const PER = 12;
const ALL_COLORS = [...new Set(PRODUCTS.flatMap((p) => p.colors))];
const ALL_SIZES = [...new Set(PRODUCTS.flatMap((p) => p.sizes))];
const COLOR_HEX = { black: '#111318', white: '#fff', silver: '#c9cdd6', navy: '#1f2a44', blue: '#2e6ff2', red: '#e63946', green: '#12b76a', beige: '#d9c7a7', brown: '#7a4b2a', pink: '#f4a7bb', gold: '#d4af37', gray: '#6b7280', purple: '#6C5CE7' };

function readState() {
  const p = new URLSearchParams(location.search);
  const list = (k) => (p.get(k) ? p.get(k).split(',') : []);
  return {
    category: list('category'), brand: list('brand'), color: list('color'), size: list('size'),
    min: Number(p.get('min') || 0), max: Number(p.get('max') || 2000),
    rating: Number(p.get('rating') || 0), sale: p.get('sale') === '1', instock: p.get('instock') === '1',
    q: p.get('q') || '', sort: p.get('sort') || 'featured', view: p.get('view') || 'grid', page: Number(p.get('page') || 1)
  };
}

let S = readState();
let visible = PER;

function writeState(push = false) {
  const q = toQuery({
    category: S.category, brand: S.brand, color: S.color, size: S.size,
    min: S.min || '', max: S.max < 2000 ? S.max : '', rating: S.rating || '', sale: S.sale ? 1 : '',
    instock: S.instock ? 1 : '', q: S.q, sort: S.sort !== 'featured' ? S.sort : '', view: S.view !== 'grid' ? S.view : ''
  });
  const url = `${location.pathname}${q ? '?' + q : ''}`;
  history[push ? 'pushState' : 'replaceState']({}, '', url);
}

function filtered() {
  let list = PRODUCTS.filter((p) => {
    if (S.category.length && !S.category.includes(p.category)) return false;
    if (S.brand.length && !S.brand.includes(p.brand)) return false;
    if (S.color.length && !p.colors.some((c) => S.color.includes(c))) return false;
    if (S.size.length && !p.sizes.some((s) => S.size.includes(s))) return false;
    if (p.price < S.min || p.price > S.max) return false;
    if (S.rating && p.rating < S.rating) return false;
    if (S.sale && !p.discount) return false;
    if (S.instock && p.stock <= 0) return false;
    if (S.q) { const hay = `${p.name} ${p.brand} ${p.category} ${p.tags.join(' ')}`.toLowerCase(); if (!hay.includes(S.q.toLowerCase())) return false; }
    return true;
  });
  const sorters = {
    featured: (a, b) => b.rating - a.rating,
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,
    newest: (a, b) => b.isNew - a.isNew || b.id - a.id,
    rating: (a, b) => b.rating - a.rating,
    best: (a, b) => b.sold - a.sold
  };
  return list.sort(sorters[S.sort] || sorters.featured);
}

function filterUI() {
  return `
  <div class="between" style="margin-bottom:8px"><h3 style="font-size:1.05rem">${t('shop.filters')}</h3>
    <button class="btn btn-sm btn-ghost" id="clearFilters">${t('common.clearAll')}</button></div>
  <div class="filter-group">
    <h4>${t('common.category')} <i class="fas fa-chevron-up"></i></h4>
    <div class="filter-collapse">${CATEGORIES.map((c) => `
      <label class="check"><input type="checkbox" data-f="category" value="${c.slug}" ${S.category.includes(c.slug) ? 'checked' : ''}> ${c.name[getLang()]} <span class="text-muted">(${PRODUCTS.filter((p) => p.category === c.slug).length})</span></label>`).join('')}</div>
  </div>
  <div class="filter-group">
    <h4>${t('shop.priceRange')} <i class="fas fa-chevron-up"></i></h4>
    <div class="filter-collapse">
      <div class="flex"><input type="number" class="input" id="minPrice" value="${S.min}" min="0" placeholder="Min" aria-label="min">
      <input type="number" class="input" id="maxPrice" value="${S.max < 2000 ? S.max : ''}" min="0" placeholder="Max" aria-label="max"></div>
      <div class="flex wrap mt-2">${[50, 100, 200, 500].map((v) => `<button class="chip" data-price="0,${v}">${money(0)} - ${money(v)}</button>`).join('')}</div>
    </div>
  </div>
  <div class="filter-group">
    <h4>${t('common.brand')} <i class="fas fa-chevron-up"></i></h4>
    <div class="filter-collapse">${BRANDS.map((b) => `<label class="check"><input type="checkbox" data-f="brand" value="${b}" ${S.brand.includes(b) ? 'checked' : ''}> ${b}</label>`).join('')}</div>
  </div>
  <div class="filter-group">
    <h4>${t('common.rating')} <i class="fas fa-chevron-up"></i></h4>
    <div class="filter-collapse">${[4.5, 4, 3.5, 3].map((r) => `<label class="check"><input type="radio" name="rating" data-f="rating" value="${r}" ${S.rating === r ? 'checked' : ''}> ${r}★ ${t('shop.ratingUp')}</label>`).join('')}
    <label class="check"><input type="radio" name="rating" data-f="rating" value="0" ${!S.rating ? 'checked' : ''}> ${t('common.category') === '' ? '' : t('common.viewAll')}</label></div>
  </div>
  <div class="filter-group">
    <h4>${t('common.color')} <i class="fas fa-chevron-up"></i></h4>
    <div class="filter-collapse"><div class="swatches">${ALL_COLORS.map((c) => `<button class="swatch ${S.color.includes(c) ? 'active' : ''}" data-f-color="${c}" title="${c}" style="background:${COLOR_HEX[c] || '#888'}"></button>`).join('')}</div></div>
  </div>
  ${ALL_SIZES.length ? `<div class="filter-group"><h4>${t('common.size')} <i class="fas fa-chevron-up"></i></h4>
    <div class="filter-collapse"><div class="flex wrap">${ALL_SIZES.map((s) => `<button class="size-opt ${S.size.includes(s) ? 'active' : ''}" data-f-size="${s}">${s}</button>`).join('')}</div></div></div>` : ''}
  <div class="filter-group">
    <h4>${t('common.availability')} <i class="fas fa-chevron-up"></i></h4>
    <div class="filter-collapse">
      <label class="check"><input type="checkbox" id="fSale" ${S.sale ? 'checked' : ''}> ${t('shop.onSale')}</label>
      <label class="check"><input type="checkbox" id="fInStock" ${S.instock ? 'checked' : ''}> ${t('shop.inStockOnly')}</label>
    </div>
  </div>`;
}

function chips() {
  const c = [];
  S.category.forEach((x) => c.push({ label: CATEGORIES.find((k) => k.slug === x)?.name[getLang()] || x, key: 'category', val: x }));
  S.brand.forEach((x) => c.push({ label: x, key: 'brand', val: x }));
  S.color.forEach((x) => c.push({ label: x, key: 'color', val: x }));
  S.size.forEach((x) => c.push({ label: x, key: 'size', val: x }));
  if (S.rating) c.push({ label: `${S.rating}★+`, key: 'rating', val: S.rating });
  if (S.sale) c.push({ label: t('shop.onSale'), key: 'sale', val: 1 });
  if (S.instock) c.push({ label: t('shop.inStockOnly'), key: 'instock', val: 1 });
  if (S.q) c.push({ label: `"${S.q}"`, key: 'q', val: S.q });
  if (!c.length) return '';
  return `<div class="active-filters"><span class="pill">${t('shop.activeFilters')}:</span>` +
    c.map((x) => `<span class="chip">${escapeHtml(String(x.label))}<button data-rm-key="${x.key}" data-rm-val="${x.val}" aria-label="${t('common.remove')}"><i class="fas fa-xmark"></i></button></span>`).join('') +
    `<button class="chip" id="clearFilters2"><i class="fas fa-trash"></i> ${t('common.clear')}</button></div>`;
}

export function initShop() {
  const main = qs('#app-main');
  main.innerHTML = `
  <div class="container">
    <nav class="breadcrumbs"><a href="index.html">${t('nav.home')}</a><span class="sep">/</span><span>${t('shop.title')}</span></nav>
  </div>
  <div class="container">
    <div class="section-head"><div><span class="eyebrow">${t('nav.shop')}</span><h1 id="shopTitle">${t('shop.title')}</h1></div></div>
    <div class="shop-layout">
      <aside class="filters" id="filters" aria-label="${t('shop.filters')}">${filterUI()}</aside>
      <div>
        <div class="shop-toolbar">
          <div class="flex wrap">
            <button class="btn btn-outline btn-sm mobile-filter-btn" id="openFilters"><i class="fas fa-filter"></i> ${t('shop.filters')}</button>
            <span class="text-soft" id="resultCount"></span>
          </div>
          <div class="flex">
            <select class="select-mini" id="sortSelect" aria-label="${t('shop.sort')}">
              ${[['featured', 'shop.sort.featured'], ['priceAsc', 'shop.sort.priceAsc'], ['priceDesc', 'shop.sort.priceDesc'], ['newest', 'shop.sort.newest'], ['rating', 'shop.sort.rating'], ['best', 'shop.sort.best']].map(([v, k]) => `<option value="${v}" ${S.sort === v ? 'selected' : ''}>${t(k)}</option>`).join('')}
            </select>
            <button class="icon-btn" id="viewToggle" aria-label="Toggle view"><i class="fas fa-${S.view === 'list' ? 'th-large' : 'list'}"></i></button>
            <button class="icon-btn" id="openCompare" aria-label="${t('compare.title')}"><i class="fas fa-scale-balanced"></i></button>
          </div>
        </div>
        <div id="chips"></div>
        <div id="grid" class="${S.view === 'list' ? 'grid-products list-view' : 'grid-products'}"></div>
        <div class="center mt-5" id="loadWrap"></div>
      </div>
    </div>
  </div>`;

  bindFilters(main);
  qs('#openCompare').addEventListener('click', openCompare);
  render();
  hydrateMedia(main);
}

function bindFilters(main) {
  qs('#sortSelect').addEventListener('change', (e) => { S.sort = e.target.value; S.page = 1; visible = PER; sync(); });
  qs('#viewToggle').addEventListener('click', (e) => {
    S.view = S.view === 'list' ? 'grid' : 'list';
    e.currentTarget.innerHTML = `<i class="fas fa-${S.view === 'list' ? 'th-large' : 'list'}"></i>`;
    sync();
  });
  const filters = qs('#filters');
  const openF = () => filters.classList.add('open');
  qs('#openFilters').addEventListener('click', openF);
  document.addEventListener('click', (e) => {
    if (filters.classList.contains('open') && !filters.contains(e.target) && !e.target.closest('#openFilters')) filters.classList.remove('open');
  });

  filters.addEventListener('change', (e) => {
    const f = e.target.dataset.f;
    if (!f) return;
    if (f === 'rating') { S.rating = Number(e.target.value); }
    else {
      const arr = S[f];
      if (e.target.checked) { if (!arr.includes(e.target.value)) arr.push(e.target.value); }
      else { S[f] = arr.filter((x) => x !== e.target.value); }
    }
    S.page = 1; visible = PER; sync();
  });
  filters.addEventListener('click', (e) => {
    const col = e.target.closest('[data-f-color]'); if (col) { toggleArr('color', col.dataset.fColor); return; }
    const sz = e.target.closest('[data-f-size]'); if (sz) { toggleArr('size', sz.dataset.fSize); return; }
    const pr = e.target.closest('[data-price]'); if (pr) { const [a, b] = pr.dataset.price.split(','); S.min = Number(a); S.max = Number(b); S.page = 1; sync(); return; }
    if (e.target.closest('#clearFilters')) clear();
    if (e.target.closest('#clearFilters2')) clear();
    const head = e.target.closest('.filter-group h4');
    if (head) { const body = head.nextElementSibling; body.style.display = body.style.display === 'none' ? '' : 'none'; head.querySelector('i').classList.toggle('fa-chevron-up'); head.querySelector('i').classList.toggle('fa-chevron-down'); }
  });
  qs('#grid').parentElement.addEventListener('click', (e) => {
    const rm = e.target.closest('[data-rm-key]');
    if (rm) removeChip(rm.dataset.rmKey, rm.dataset.rmVal);
  });
  const applyPrice = debounce(() => { S.min = Number(qs('#minPrice')?.value || 0); S.max = Number(qs('#maxPrice')?.value || 2000) || 2000; S.page = 1; sync(); }, 400);
  window.__novaApplyPrice = applyPrice;
  bindPrice();
}
function bindPrice() {
  const minI = qs('#minPrice'), maxI = qs('#maxPrice');
  if (minI) minI.oninput = window.__novaApplyPrice;
  if (maxI) maxI.oninput = window.__novaApplyPrice;
}

function toggleArr(key, val) {
  const i = S[key].indexOf(val);
  if (i > -1) S[key].splice(i, 1); else S[key].push(val);
  S.page = 1; visible = PER; sync();
}
function removeChip(key, val) {
  if (['category', 'brand', 'color', 'size'].includes(key)) S[key] = S[key].filter((x) => x !== val);
  else if (key === 'rating') S.rating = 0;
  else if (key === 'sale') S.sale = false;
  else if (key === 'instock') S.instock = false;
  else if (key === 'q') S.q = '';
  S.page = 1; visible = PER; sync();
}
function clear() {
  S = { category: [], brand: [], color: [], size: [], min: 0, max: 2000, rating: 0, sale: false, instock: false, q: '', sort: S.sort, view: S.view, page: 1 };
  visible = PER; sync();
}

function sync() { writeState(); render(); qs('#filters').innerHTML = filterUI(); bindPrice(); }

function render() {
  writeState();
  const all = filtered();
  const grid = qs('#grid');
  grid.className = S.view === 'list' ? 'grid-products list-view' : 'grid-products';
  renderProducts(grid, all.slice(0, visible));
  qs('#resultCount').textContent = `${all.length} ${t('shop.results')}${S.q ? ` ${t('search.resultsFor')}: "${S.q}"` : ''}`;
  qs('#chips').innerHTML = chips();

  const loadWrap = qs('#loadWrap');
  if (all.length > visible) {
    loadWrap.innerHTML = `<button class="btn btn-outline btn-lg" id="loadMore">${t('common.loadMore')} (${all.length - visible})</button>`;
    qs('#loadMore').addEventListener('click', () => { visible += PER; render(); hydrateMedia(grid); });
  } else loadWrap.innerHTML = '';
}
