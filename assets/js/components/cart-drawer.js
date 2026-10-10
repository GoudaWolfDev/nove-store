import { store } from '../core/store.js';
import { t } from '../core/i18n.js';
import { money } from '../core/currency.js';
import { el, qs, qsa, escapeHtml, setImg } from '../core/utils.js';
import { CONFIG } from '../core/config.js';
import { showToast } from './toast.js';

let root, body, foot;

function ensure() {
  if (root) return;
  body = el('div', { className: 'drawer-body', attrs: { id: 'cartDrawerBody' } });
  foot = el('div', { className: 'drawer-foot', attrs: { id: 'cartDrawerFoot' } });
  root = el('div', { className: 'drawer-side', attrs: { id: 'cartDrawer', 'aria-label': t('cart.title') } }, [
    el('div', { className: 'drawer-head' }, [
      el('h3', { text: t('cart.title'), style: { fontSize: '1.1rem' } }),
      el('button', { className: 'icon-btn', html: '<i class="fas fa-xmark"></i>', attrs: { 'aria-label': t('common.close') }, on: { click: closeCart } })
    ]),
    body, foot
  ]);
  document.body.append(root);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });
}

function line(item) {
  const wrap = el('div', { className: 'cart-line', style: { gridTemplateColumns: '64px 1fr auto' } });
  const media = el('div', { className: 'media', style: { width: '64px', height: '64px', borderRadius: '10px' } });
  const img = el('img', { alt: item.name });
  setImg(img, item.image, item.name, item.id);
  media.append(img);
  const info = el('div', { className: 'grow' }, [
    el('div', { style: { fontWeight: '600', fontSize: '.9rem' }, text: item.name }),
    el('div', { className: 'pill', style: { margin: '4px 0' } }, [item.color, item.size].filter(Boolean).join(' / ')),
    el('div', { className: 'flex', style: { gap: '8px' } }, [
      el('div', { className: 'qty' }, [
        el('button', { html: '<i class="fas fa-minus"></i>', attrs: { 'aria-label': 'decrease' }, on: { click: () => { store.updateQty(item.key, item.qty - 1); renderCart(); } } }),
        el('input', { value: item.qty, attrs: { readonly: true, 'aria-label': t('common.qty') } }),
        el('button', { html: '<i class="fas fa-plus"></i>', attrs: { 'aria-label': 'increase' }, on: { click: () => { store.updateQty(item.key, item.qty + 1); renderCart(); } } })
      ]),
      el('button', { className: 'pill', html: `<i class="fas fa-trash"></i>`, attrs: { 'aria-label': t('common.remove') }, on: { click: () => { store.removeItem(item.key); renderCart(); } } })
    ])
  ]);
  wrap.append(media, info, el('div', { style: { fontWeight: '700' }, text: money(item.price * item.qty) }));
  return wrap;
}

export function renderCart() {
  ensure();
  const items = store.getCart();
  if (!items.length) {
    body.innerHTML = `<div class="empty-state"><i class="fas fa-bag-shopping"></i><h3>${t('cart.empty')}</h3>
      <a href="shop.html" class="btn btn-primary mt-4">${t('cart.emptyCta')}</a></div>`;
    foot.innerHTML = '';
    return;
  }
  body.innerHTML = '';
  items.forEach((i) => body.append(line(i)));
  const subtotal = store.cartSubtotal();
  const remaining = CONFIG.freeShippingThreshold - subtotal;
  foot.innerHTML = '';
  foot.append(
    el('div', { className: 'between', style: { marginBottom: '4px' } }, [
      el('span', { className: 'text-soft', text: t('common.subtotal') }),
      el('strong', { text: money(subtotal) })
    ]),
    el('p', { className: 'pill', style: { margin: '6px 0 12px' } }, [
      el('i', { className: `fas ${remaining > 0 ? 'fa-truck' : 'fa-circle-check'}` }),
      remaining > 0 ? t('cart.freeShipProgress', { x: money(remaining) }) : t('cart.freeShipDone')
    ]),
    el('a', { href: 'checkout.html', className: 'btn btn-primary btn-block', text: t('cart.checkout') }),
    el('a', { href: 'cart.html', className: 'btn btn-ghost btn-block mt-2', text: t('nav.cart') })
  );
}

export function openCart() {
  ensure();
  renderCart();
  root.classList.add('open');
}
export function closeCart() { if (root) root.classList.remove('open'); }

export function addToCart(product, qty = 1, color = '', size = '') {
  store.addToCart(product, qty, color, size);
  renderCart();
  showToast('success', t('common.addedToCart'), product.name);
  openCart();
}
