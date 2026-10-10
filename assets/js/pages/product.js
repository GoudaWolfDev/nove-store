import { PRODUCTS, getProduct, byCategory } from '../data/products.js';
import { catName } from '../data/categories.js';
import { t, getLang } from '../core/i18n.js';
import { money } from '../core/currency.js';
import { store } from '../core/store.js';
import { qs, qsa, el, escapeHtml, setImg, starsHtml, uid, formatDate } from '../core/utils.js';
import { renderProducts, hydrateMedia, openQuickView } from '../components/product-card.js';
import { openLightbox, openModal } from '../components/modal.js';
import { addToCart as drawerAdd } from '../components/cart-drawer.js';
import { showToast } from '../components/toast.js';
import { CONFIG } from '../core/config.js';

const COLOR_HEX = { black: '#111318', white: '#fff', silver: '#c9cdd6', navy: '#1f2a44', blue: '#2e6ff2', red: '#e63946', green: '#12b76a', beige: '#d9c7a7', brown: '#7a4b2a', pink: '#f4a7bb', gold: '#d4af37', gray: '#6b7280', purple: '#6C5CE7' };

export function initProduct() {
  const id = new URLSearchParams(location.search).get('id');
  const p = getProduct(id);
  if (!p) { location.replace('404.html'); return; }
  store.addRecent(p.id);

  let color = p.colors[0] || '';
  let size = p.sizes[0] || '';
  let qty = 1;

  const main = qs('#app-main');
  main.innerHTML = `
  <div class="container">
    <nav class="breadcrumbs"><a href="index.html">${t('nav.home')}</a><span class="sep">/</span>
      <a href="shop.html?category=${p.category}">${catName(p.category, getLang())}</a><span class="sep">/</span><span>${escapeHtml(p.name)}</span></nav>
  </div>
  <div class="container section" style="padding-top:16px">
    <div class="product-layout">
      <div>
        <div class="gallery-main" id="galleryMain"><img id="mainImg" src="${p.images[0]}" alt="${escapeHtml(p.name)}"></div>
        <div class="gallery-thumbs" id="thumbs">
          ${p.images.map((im, i) => `<button class="${i === 0 ? 'active' : ''}" data-i="${i}" aria-label="View image ${i + 1}"><img src="${im}" alt=""></button>`).join('')}
        </div>
      </div>
      <div class="product-info">
        <span class="eyebrow">${escapeHtml(p.brand)}</span>
        <h1 class="title">${escapeHtml(p.name)}</h1>
        <div class="flex wrap" style="gap:10px">
          <span class="stars">${starsHtml(p.rating)}</span>
          <a href="#reviews" class="pill">${p.rating} · ${p.reviewsCount} ${t('common.reviews')}</a>
          ${p.isNew ? `<span class="badge badge-new">${t('common.new')}</span>` : ''}
          ${p.isBestSeller ? `<span class="badge badge-best">${t('common.bestSeller')}</span>` : ''}
        </div>
        <div class="product-price"><span class="now">${money(p.price)}</span>
          ${p.oldPrice ? `<span class="price-old">${money(p.oldPrice)}</span><span class="badge badge-sale">-${p.discount}%</span>` : ''}</div>
        <p class="text-soft" style="margin-bottom:16px">${escapeHtml(p.description)}</p>
        <p class="stock-line ${p.stock > 5 ? 'in' : 'low'}"><i class="fas fa-${p.stock > 0 ? 'circle-check' : 'circle-xmark'}"></i>
          ${p.stock > 0 ? `${t('common.inStock')}${p.stock <= 5 ? ` - ${t('product.only')} ${p.stock} ${t('product.left')}` : ''}` : t('common.outOfStock')}</p>

        ${p.colors.length ? `<div class="mt-4"><label style="font-weight:600;font-size:.85rem">${t('common.color')}: <span id="colorLabel">${color}</span></label>
          <div class="swatches mt-2" id="colors">${p.colors.map((c) => `<button class="swatch ${c === color ? 'active' : ''}" data-val="${c}" title="${c}" style="background:${COLOR_HEX[c.toLowerCase()] || '#888'}"></button>`).join('')}</div>
          <span class="err" id="colorErr"></span></div>` : ''}

        ${p.sizes.length ? `<div class="mt-4"><label style="font-weight:600;font-size:.85rem">${t('common.size')}</label>
          <div class="flex wrap mt-2" id="sizes">${p.sizes.map((s) => `<button class="size-opt ${s === size ? 'active' : ''}" data-val="${s}">${s}</button>`).join('')}</div>
          <span class="err" id="sizeErr"></span></div>` : ''}

        <div class="flex wrap mt-5" style="gap:12px">
          <div class="qty"><button id="qMinus" aria-label="minus"><i class="fas fa-minus"></i></button><input id="qVal" value="1" readonly aria-label="${t('common.qty')}"><button id="qPlus" aria-label="plus"><i class="fas fa-plus"></i></button></div>
          <button class="btn btn-primary btn-lg grow" id="addBtn" ${p.stock <= 0 ? 'disabled' : ''}><i class="fas fa-bag-shopping"></i> ${t('common.addToCart')}</button>
          <button class="btn btn-outline btn-lg" id="wishBtn" aria-label="${t('nav.wishlist')}"><i class="fa${store.isWishlisted(p.id) ? 's' : 'r'} fa-heart"></i></button>
          <button class="btn btn-outline btn-lg" id="shareBtn" aria-label="${t('product.share')}"><i class="fas fa-share-nodes"></i></button>
        </div>
        <button class="btn btn-lg btn-block mt-3" id="buyBtn" style="background:var(--text);color:var(--bg)" ${p.stock <= 0 ? 'disabled' : ''}>${t('common.buyNow')}</button>

        <div class="info-boxes">
          <div class="info-box"><i class="fas fa-truck-fast"></i><div><strong>${t('product.delivery')}</strong><div class="text-soft">${new Date(Date.now() + 3 * 864e5).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div></div></div>
          <div class="info-box"><i class="fas fa-rotate-left"></i><div><strong>${t('product.returns')}</strong><div class="text-soft">${t('product.shipping')}</div></div></div>
        </div>
        <div class="pay-icons" style="font-size:1.6rem"><i class="fab fa-cc-visa"></i><i class="fab fa-cc-mastercard"></i><i class="fab fa-cc-paypal"></i><i class="fab fa-cc-apple-pay"></i></div>
      </div>
    </div>
  </div>

  <div class="container section" style="padding-top:0">
    <div class="tabs" id="pTabs">
      <button class="tab active" data-tab="desc">${t('product.description')}</button>
      <button class="tab" data-tab="specs">${t('product.specs')}</button>
      <button class="tab" data-tab="rev">${t('product.reviews')} (${p.reviewsCount})</button>
      <button class="tab" data-tab="ship">${t('product.shipping')}</button>
    </div>
    <div class="tab-panel active" id="tab-desc">
      <div class="grid-2"><div><p class="text-soft">${escapeHtml(p.description)}</p>
        <ul style="margin-top:16px">${p.features.map((f) => `<li style="padding:6px 0"><i class="fas fa-check" style="color:var(--success)"></i> ${escapeHtml(f)}</li>`).join('')}</ul></div>
        <div class="media ratio-4-3" style="border-radius:14px"><img src="${p.images[2] || p.images[0]}" alt=""></div></div>
    </div>
    <div class="tab-panel" id="tab-specs">
      <table class="compare-table" style="max-width:640px"><tbody>
        ${[['brand', p.brand], ['category', catName(p.category, getLang())], ['rating', p.rating], ['stock', p.stock], ['colors', p.colors.join(', ') || '-'], ['sizes', p.sizes.join(', ') || '-'], ['sku', `NOVA-${String(p.id).padStart(4, '0')}`]].map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}
      </tbody></table>
    </div>
    <div class="tab-panel" id="tab-rev">
      <div class="grid-2"><div id="ratingBreakdown"></div>
        <div>
          <h3 style="margin-bottom:12px">${t('product.addReview')}</h3>
          <form id="reviewForm">
            <div class="field"><label>${t('product.reviewName')}</label><input class="input" name="name" required></div>
            <div class="field"><label>${t('product.yourRating')}</label><div class="star-input" id="starInput">${[1,2,3,4,5].map((i)=>`<i class="far fa-star" data-i="${i}"></i>`).join('')}</div></div>
            <div class="field"><label>${t('product.yourReview')}</label><textarea class="input" name="text" rows="3" required></textarea></div>
            <button class="btn btn-primary" type="submit">${t('product.submitReview')}</button>
          </form>
        </div></div>
      <div id="reviewList" style="margin-top:24px"></div>
    </div>
    <div class="tab-panel" id="tab-ship">
      <div class="grid-2"><div><h3>${t('common.shipping')}</h3><p class="text-soft mt-2">${t('product.delivery')} ${new Date(Date.now() + 3 * 864e5).toLocaleDateString()}. ${CONFIG.freeShippingThreshold ? t('cart.freeShipDone') : ''}</p></div>
        <div class="info-box"><i class="fas fa-rotate-left"></i><div><strong>${t('product.returns')}</strong><p class="text-soft">30 ${t('home.days')}</p></div></div></div>
    </div>
  </div>

  <div class="container section" style="padding-top:0"><div id="related"></div></div>
  <div class="container section" style="padding-top:0"><div id="recent"></div></div>

  <div class="sticky-buy">
    <div class="grow"><div style="font-weight:600;font-size:.85rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(p.name)}</div>
      <span class="price">${money(p.price)}</span></div>
    <button class="btn btn-primary" id="stickyAdd" ${p.stock <= 0 ? 'disabled' : ''}><i class="fas fa-bag-shopping"></i> ${t('common.addToCart')}</button>
  </div>`;

  // gallery
  hydrateMedia(main);
  const mainImg = qs('#mainImg');
  qsa('#thumbs button').forEach((b) => b.addEventListener('click', () => {
    qsa('#thumbs button').forEach((x) => x.classList.remove('active'));
    b.classList.add('active'); mainImg.src = p.images[Number(b.dataset.i)];
  }));
  let gi = 0;
  qs('#galleryMain').addEventListener('click', () => openLightbox(p.images, Number(qs('#thumbs button.active').dataset.i), p.name));
  const gm = qs('#galleryMain');
  let sx = 0;
  gm.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  gm.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) < 40) return;
    const idx = (Number(qs('#thumbs button.active').dataset.i) + (dx < 0 ? 1 : -1) + p.images.length) % p.images.length;
    qs('#thumbs button[data-i="' + idx + '"]').click();
  });

  // selectors
  if (p.colors.length) qsa('#colors .swatch').forEach((b) => b.addEventListener('click', () => {
    qsa('#colors .swatch').forEach((x) => x.classList.remove('active')); b.classList.add('active');
    color = b.dataset.val; qs('#colorLabel').textContent = color; qs('#colorErr').textContent = '';
  }));
  if (p.sizes.length) qsa('#sizes .size-opt').forEach((b) => b.addEventListener('click', () => {
    qsa('#sizes .size-opt').forEach((x) => x.classList.remove('active')); b.classList.add('active');
    size = b.dataset.val; qs('#sizeErr').textContent = '';
  }));
  qs('#qPlus').addEventListener('click', () => { qty = Math.min(qty + 1, p.stock || 99); qs('#qVal').value = qty; });
  qs('#qMinus').addEventListener('click', () => { qty = Math.max(1, qty - 1); qs('#qVal').value = qty; });

  const doAdd = () => { if (p.stock <= 0) return; drawerAdd(p, qty, color, size); };
  qs('#addBtn').addEventListener('click', doAdd);
  qs('#stickyAdd').addEventListener('click', () => { doAdd(); });
  qs('#buyBtn').addEventListener('click', () => { doAdd(); location.href = 'checkout.html'; });
  qs('#wishBtn').addEventListener('click', () => {
    const on = store.toggleWishlist(p.id);
    qs('#wishBtn').innerHTML = `<i class="fa${on ? 's' : 'r'} fa-heart"></i>`;
    showToast(on ? 'success' : 'info', on ? t('nav.wishlist') : t('common.remove'));
  });
  qs('#shareBtn').addEventListener('click', async () => {
    const data = { title: p.name, text: p.description, url: location.href };
    try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(location.href); showToast('success', t('product.share')); } } catch {}
  });

  // tabs
  qsa('#pTabs .tab').forEach((tab) => tab.addEventListener('click', () => {
    qsa('#pTabs .tab').forEach((x) => x.classList.remove('active')); tab.classList.add('active');
    qsa('.tab-panel', main).forEach((x) => x.classList.remove('active'));
    qs(`#tab-${tab.dataset.tab}`).classList.add('active');
  }));

  renderReviews(p);
  renderRatingBreakdown(p);

  // related + recent
  const rel = byCategory(p.category).filter((x) => x.id !== p.id).slice(0, 4);
  qs('#related').innerHTML = `<div class="section-head"><h2>${t('product.related')}</h2></div><div class="grid-products" id="relatedGrid"></div>`;
  renderProducts(qs('#relatedGrid'), rel);
  const recentIds = store.getRecent().filter((x) => x !== p.id).slice(0, 4);
  const recent = recentIds.map((x) => PRODUCTS.find((k) => k.id === x)).filter(Boolean);
  if (recent.length) {
    qs('#recent').innerHTML = `<div class="section-head"><h2>${t('product.recentlyViewed')}</h2></div><div class="grid-products" id="recentGrid"></div>`;
    renderProducts(qs('#recentGrid'), recent);
  }

  injectJsonLd(p);
}

function renderRatingBreakdown(p) {
  const dist = [5, 4, 3, 2, 1].map((star) => {
    const base = star === Math.round(p.rating) ? 0.55 : star === 4 ? 0.25 : star === 5 ? 0.1 : 0.05;
    return { star, pct: Math.round(base * 100) };
  });
  qs('#ratingBreakdown').innerHTML = `<h3>${t('common.rating')}</h3>
    <div class="flex" style="gap:20px;margin-bottom:16px"><div style="text-align:center"><div style="font-size:2.5rem;font-weight:700">${p.rating}</div><span class="stars">${starsHtml(p.rating)}</span><div class="pill">${p.reviewsCount} ${t('common.reviews')}</div></div>
    <div class="rating-bars grow">${dist.map((d) => `<div class="row"><span>${d.star}★</span><div class="bar"><span style="width:${d.pct}%"></span></div><span>${d.pct}%</span></div>`).join('')}</div></div>`;
}

function renderReviews(p) {
  const list = store.getReviews(p.id);
  const wrap = qs('#reviewList');
  wrap.innerHTML = list.length
    ? list.map((r) => `<div class="review"><div class="review-head"><div class="avatar">${escapeHtml((r.name || 'G')[0])}</div>
        <div><strong>${escapeHtml(r.name)}</strong><div class="stars">${starsHtml(r.rating)}</div></div>
        <span class="pill" style="margin-inline-start:auto">${formatDate(r.at || Date.now())}</span></div>
        <p class="text-soft">${escapeHtml(r.text)}</p></div>`).join('')
    : `<p class="text-muted">${t('common.empty')}</p>`;

  const form = qs('#reviewForm');
  let rating = 5;
  qsa('#starInput i').forEach((s) => {
    s.classList.toggle('active', Number(s.dataset.i) <= rating);
    s.addEventListener('click', () => { rating = Number(s.dataset.i); qsa('#starInput i').forEach((x) => x.classList.toggle('active', Number(x.dataset.i) <= rating)); });
    s.addEventListener('mouseenter', () => qsa('#starInput i').forEach((x) => x.classList.toggle('active', Number(x.dataset.i) <= Number(s.dataset.i))));
  });
  qs('#starInput').addEventListener('mouseleave', () => qsa('#starInput i').forEach((x) => x.classList.toggle('active', Number(x.dataset.i) <= rating)));
  if (!form.dataset.bound) {
    form.dataset.bound = '1';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      store.addReview(p.id, { id: uid('r'), name: fd.get('name'), text: fd.get('text'), rating, at: Date.now() });
      showToast('success', t('product.thanks'));
      renderReviews(p);
    });
  }
}

function injectJsonLd(p) {
  const data = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, image: p.images,
    description: p.description, brand: { '@type': 'Brand', name: p.brand },
    aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviewsCount },
    offers: { '@type': 'Offer', price: p.price, priceCurrency: 'USD', availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' }
  };
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(data);
  document.head.append(s);
}
