import { initTheme } from './core/theme.js';
import { initI18n, setLang } from './core/i18n.js';
import { store } from './core/store.js';
import { PRODUCTS, getProduct } from './data/products.js';
import { money } from './core/currency.js';
import { qs } from './core/utils.js';
import { initHeader } from './components/header.js';
import { initFooter } from './components/footer.js';
import { initCardEvents, openCompare } from './components/product-card.js';
import { renderCart, openCart, addToCart } from './components/cart-drawer.js';
import { closeModal } from './components/modal.js';

/** Public API used by inline handlers and cross-module helpers. */
window.NOVA = {
  money,
  setLang,
  openCart,
  openCompare,
  closeModal,
  products: PRODUCTS,
  getProduct,
  addProduct: (id) => {
    const p = getProduct(id);
    if (p) addToCart(p, 1, p.colors[0] || '', p.sizes[0] || '');
  },
  toggleCompare: (id) => store.toggleCompare(id, 3),
  store
};

const PAGES = {
  home: () => import('./pages/home.js').then((m) => m.initHome()),
  shop: () => import('./pages/shop.js').then((m) => m.initShop()),
  product: () => import('./pages/product.js').then((m) => m.initProduct()),
  cart: () => import('./pages/cart.js').then((m) => m.initCart()),
  checkout: () => import('./pages/checkout.js').then((m) => m.initCheckout()),
  wishlist: () => import('./pages/wishlist.js').then((m) => m.initWishlist()),
  login: () => import('./pages/auth.js').then((m) => m.initAuth()),
  account: () => import('./pages/account.js').then((m) => m.initAccount()),
  contact: () => import('./pages/contact.js').then((m) => m.initContact()),
  about: () => import('./pages/about.js').then((m) => m.initAbout()),
  'order-success': () => import('./pages/order-success.js').then((m) => m.initOrderSuccess()),
  '404': () => import('./pages/notfound.js').then((m) => m.initNotFound())
};

/** Show the page transition loader. */
export function showLoader() {
  const l = qs('#pageLoader');
  if (l) { l.classList.remove('hide'); }
}

async function boot() {
  initTheme();
  initI18n();
  initHeader();
  initFooter();
  initCardEvents();
  renderCart();

  const page = document.body.dataset.page;
  const starter = PAGES[page];
  try {
    if (starter) await starter();
  } catch (err) {
    console.error('[NOVA] page init failed:', err);
  } finally {
    const l = qs('#pageLoader');
    if (l) setTimeout(() => l.classList.add('hide'), 120);
    document.body.classList.add('ready');
  }

  initTransitions();
  initServiceWorker();
}

/** Smooth internal page transitions with a loading overlay. */
function initTransitions() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || /^https?:/.test(href)) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    showLoader();
    setTimeout(() => (location.href = href), 180);
  });
}

function initServiceWorker() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
}

document.addEventListener('DOMContentLoaded', boot);
