import { PRODUCTS } from '../data/products.js';
import { t } from '../core/i18n.js';
import { money } from '../core/currency.js';
import { store } from '../core/store.js';
import { computeTotals } from '../core/totals.js';
import { CONFIG } from '../core/config.js';
import { qs, qsa, el, escapeHtml, setImg } from '../core/utils.js';
import { renderProducts, hydrateMedia } from '../components/product-card.js';
import { showToast } from '../components/toast.js';

function line(item) {
  const img = el('img', { alt: item.name });
  setImg(img, item.image, item.name, item.id);
  const wrap = el('div', { className: 'cart-line' }, [
    el('a', { href: `product.html?id=${item.id}`, className: 'media', style: { borderRadius: '12px' } }, [img]),
    el('div', {}, [
      el('a', { href: `product.html?id=${item.id}`, style: { fontWeight: '600' }, text: item.name }),
      el('div', { className: 'pill', style: { margin: '4px 0' } }, [item.brand, item.color, item.size].filter(Boolean).join(' · ')),
      el('div', { className: 'flex wrap', style: { gap: '10px' } }, [
        el('div', { className: 'qty' }, [
          el('button', { html: '<i class="fas fa-minus"></i>', on: { click: () => { store.updateQty(item.key, item.qty - 1); renderCart(); } } }),
          el('input', { value: item.qty, readonly: true, attrs: { 'aria-label': t('common.qty') } }),
          el('button', { html: '<i class="fas fa-plus"></i>', on: { click: () => { store.updateQty(item.key, item.qty + 1); renderCart(); } } })
        ]),
        el('button', { className: 'pill', html: `<i class="far fa-bookmark"></i> ${t('common.saveForLater')}`, on: { click: () => { store.moveToSaved(item.key); renderCart(); } } }),
        el('button', { className: 'pill', html: `<i class="fas fa-trash"></i> ${t('common.remove')}`, on: { click: () => { store.removeItem(item.key); renderCart(); } } })
      ])
    ]),
    el('div', { className: 'line-total' }, [el('div', { text: money(item.price * item.qty) }), el('div', { className: 'pill', text: money(item.price) + ' × ' })])
  ]);
  return wrap;
}

function savedLine(item) {
  return el('div', { className: 'between', style: { padding: '10px 0', borderBottom: '1px solid var(--border)' } }, [
    el('div', {}, [el('a', { href: `product.html?id=${item.id}`, style: { fontWeight: '600' }, text: item.name }), el('div', { className: 'pill', text: money(item.price) })]),
    el('div', { className: 'flex' }, [
      el('button', { className: 'btn btn-sm btn-primary', text: t('common.moveToCart'), on: { click: () => { store.moveToCart(item.key); renderCart(); } } }),
      el('button', { className: 'btn btn-sm btn-ghost', html: '<i class="fas fa-xmark"></i>', on: { click: () => { store.removeSaved(item.key); renderCart(); } } })
    ])
  ]);
}

export function initCart() {
  const main = qs('#app-main');
  main.innerHTML = `<div class="container"><nav class="breadcrumbs"><a href="index.html">${t('nav.home')}</a><span class="sep">/</span><span>${t('cart.title')}</span></nav>
    <div class="section-head"><h1>${t('cart.title')}</h1></div>
    <div id="cartRoot"></div></div>`;
  renderCart();
}

function renderCart() {
  const root = qs('#cartRoot');
  const items = store.getCart();
  const saved = store.getSaved();

  if (!items.length) {
    root.innerHTML = `<div class="empty-state"><i class="fas fa-bag-shopping"></i><h3>${t('cart.empty')}</h3>
      <a href="shop.html" class="btn btn-primary mt-4">${t('cart.emptyCta')}</a></div>
      ${recommendSection()}`;
    renderProducts(qs('#recGrid'), PRODUCTS.filter((p) => p.isBestSeller).slice(0, 4));
    return;
  }

  const totals = computeTotals();
  root.innerHTML = `
    <div class="cart-layout">
      <div>
        <div id="cartLines"></div>
        <div id="savedWrap"></div>
      </div>
      <aside class="summary">
        <h3 style="margin-bottom:12px">${t('checkout.orderSummary')}</h3>
        <form class="coupon-row" id="couponForm"><input class="input" id="couponInput" placeholder="${t('cart.coupon')}" aria-label="${t('cart.coupon')}"><button class="btn btn-outline" type="submit">${t('common.apply')}</button></form>
        ${totals.coupon ? `<div class="between pill" style="margin-bottom:10px"><span><i class="fas fa-tag"></i> ${escapeHtml(totals.coupon.code)} (${totals.coupon.label})</span><button id="removeCoupon"><i class="fas fa-xmark"></i></button></div>` : ''}
        <div class="row"><span>${t('common.subtotal')}</span><strong>${money(totals.subtotal)}</strong></div>
        ${totals.discount ? `<div class="row"><span>${t('common.discount')}</span><strong style="color:var(--success)">-${money(totals.discount)}</strong></div>` : ''}
        <div class="row"><span>${t('common.shipping')}</span><strong>${totals.shipping ? money(totals.shipping) : t('common.free')}</strong></div>
        <div class="row"><span>${t('common.tax')}</span><strong>${money(totals.tax)}</strong></div>
        <div class="row total"><span>${t('common.total')}</span><span>${money(totals.total)}</span></div>
        <div id="freeShip" class="mt-4"></div>
        <a href="checkout.html" class="btn btn-primary btn-block btn-lg mt-4">${t('cart.checkout')} <i class="fas fa-arrow-right"></i></a>
        <a href="shop.html" class="btn btn-ghost btn-block mt-2">${t('cart.emptyCta')}</a>
      </aside>
    </div>`;
  const lines = qs('#cartLines');
  lines.innerHTML = '';
  items.forEach((i) => lines.append(line(i)));

  if (saved.length) {
    qs('#savedWrap').innerHTML = `<h3 style="margin:24px 0 8px">${t('common.saveForLater')}</h3><div id="savedList"></div>`;
    saved.forEach((i) => qs('#savedList').append(savedLine(i)));
  }

  // free shipping progress
  const remaining = CONFIG.freeShippingThreshold - totals.subtotal;
  qs('#freeShip').innerHTML = remaining > 0
    ? `<p class="pill"><i class="fas fa-truck"></i> ${t('cart.freeShipProgress', { x: money(remaining) })}</p>
       <div class="progress mt-2"><span style="width:${Math.min(100, (totals.subtotal / CONFIG.freeShippingThreshold) * 100)}%"></span></div>`
    : `<p class="pill" style="color:var(--success)"><i class="fas fa-circle-check"></i> ${t('cart.freeShipDone')}</p>`;

  qs('#couponForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = qs('#couponInput').value.trim().toUpperCase();
    const def = CONFIG.coupons[code];
    if (!def) { showToast('error', t('cart.couponInvalid')); return; }
    store.setCoupon({ code, ...def });
    showToast('success', t('cart.couponApplied'), `${code} · ${def.label}`);
    renderCart();
  });
  const rc = qs('#removeCoupon');
  rc && rc.addEventListener('click', () => { store.clearCoupon(); renderCart(); });

  // recommended
  root.insertAdjacentHTML('beforeend', recommendSection());
  const rec = PRODUCTS.filter((p) => !items.some((i) => i.id === p.id)).slice(0, 4);
  renderProducts(qs('#recGrid'), rec);
}

function recommendSection() {
  return `<section class="section" style="padding-block:32px 0"><div class="section-head"><h2>${t('cart.recommended')}</h2></div><div class="grid-products" id="recGrid"></div></section>`;
}
