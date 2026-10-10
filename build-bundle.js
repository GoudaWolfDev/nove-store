const fs = require('fs');
const path = require('path');

const baseDir = __dirname;
const jsDir = path.join(baseDir, 'assets', 'js');

const filesInOrder = [
  'core/config.js',
  'core/utils.js',
  'data/images.js',
  'data/products.js',
  'core/store.js',
  'core/currency.js',
  'data/translations.js',
  'core/i18n.js',
  'core/totals.js',
  'core/theme.js',
  'components/toast.js',
  'components/modal.js',
  'components/cart-drawer.js',
  'components/product-card.js',
  'components/header.js',
  'components/footer.js',
  'components/slider.js',
  'components/countdown.js',
  'pages/home.js',
  'pages/shop.js',
  'pages/product.js',
  'pages/cart.js',
  'pages/checkout.js',
  'pages/account.js',
  'pages/auth.js',
  'pages/wishlist.js',
  'pages/contact.js',
  'pages/about.js',
  'pages/order-success.js',
  'pages/notfound.js',
];

let bundledCode = `/**
 * NOVA Store - Bundled Production Script
 * Compatible with file:// and http:// protocols.
 */
(function() {
  'use strict';

`;

for (const relPath of filesInOrder) {
  const fullPath = path.join(jsDir, relPath);
  let code = fs.readFileSync(fullPath, 'utf8');

  // Remove import statements
  code = code.replace(/^import\s+[\s\S]*?;?\r?\n/gm, '');

  // Remove export keywords (e.g. export const -> const, export function -> function, export default -> ...)
  code = code.replace(/^export\s+default\s+/gm, '');
  code = code.replace(/^export\s+/gm, '');

  bundledCode += `  // --- ${relPath} ---\n` + code.split('\n').map(l => '  ' + l).join('\n') + '\n\n';
}

// Add main boot code
bundledCode += `  // --- main boot ---
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
    home: () => initHome(),
    shop: () => initShop(),
    product: () => initProduct(),
    cart: () => initCart(),
    checkout: () => initCheckout(),
    wishlist: () => initWishlist(),
    login: () => initAuth(),
    account: () => initAccount(),
    contact: () => initContact(),
    about: () => initAbout(),
    'order-success': () => initOrderSuccess(),
    '404': () => initNotFound()
  };

  function showLoader() {
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
`;

fs.writeFileSync(path.join(jsDir, 'bundle.js'), bundledCode, 'utf8');
console.log('Successfully generated assets/js/bundle.js! Size:', bundledCode.length, 'bytes');
