import { t } from '../core/i18n.js';
import { store } from '../core/store.js';
import { qs } from '../core/utils.js';
import { renderProducts } from '../components/product-card.js';
import { showToast } from '../components/toast.js';
import { addToCart as drawerAdd } from '../components/cart-drawer.js';

export function initWishlist() {
  const main = qs('#app-main');
  main.innerHTML = `<div class="container"><nav class="breadcrumbs"><a href="index.html">${t('nav.home')}</a><span class="sep">/</span><span>${t('wishlist.title')}</span></nav>
    <div class="section-head"><h1>${t('wishlist.title')}</h1><div class="flex"><button class="btn btn-outline" id="wishCompare"><i class="fas fa-scale-balanced"></i> ${t('common.compare')}</button>
      <button class="btn btn-primary" id="wishAddAll"><i class="fas fa-bag-shopping"></i> ${t('wishlist.addAll')}</button></div></div>
    <div id="wishRoot"></div></div>`;
  render();

  qs('#wishAddAll').addEventListener('click', () => {
    const products = store.getWishlist().map((id) => window.NOVA.products.find((p) => p.id === id)).filter(Boolean);
    if (!products.length) return;
    products.forEach((p) => drawerAdd(p, 1, p.colors[0] || '', p.sizes[0] || ''));
    showToast('success', t('common.addedToCart'));
  });
  qs('#wishCompare').addEventListener('click', () => window.NOVA.openCompare());
  window.addEventListener('nova:change', (e) => { if (e.detail.area === 'wishlist') render(); });
}

function render() {
  const ids = store.getWishlist();
  const products = ids.map((id) => window.NOVA.products.find((p) => p.id === id)).filter(Boolean);
  const root = qs('#wishRoot');
  if (!products.length) {
    root.innerHTML = `<div class="empty-state"><i class="fas fa-heart"></i><h3>${t('wishlist.empty')}</h3><a href="shop.html" class="btn btn-primary mt-4">${t('cart.emptyCta')}</a></div>`;
    return;
  }
  root.innerHTML = `<div class="grid-products" id="wishGrid"></div>`;
  renderProducts(qs('#wishGrid'), products);
}
