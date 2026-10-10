import { CONFIG } from '../core/config.js';
import { PRODUCTS } from '../data/products.js';
import { CATEGORIES } from '../data/categories.js';
import { store } from '../core/store.js';
import { t, getLang } from '../core/i18n.js';
import { getCurrency, setCurrency, CURRENCIES } from '../core/currency.js';
import { toggleTheme, getTheme } from '../core/theme.js';
import { qs, qsa, el, debounce, escapeHtml, setImg, throttle } from '../core/utils.js';

const PAGE = document.body.dataset.page || '';

function navLinks() {
  return [
    { href: 'index.html', key: 'nav.home', match: 'home' },
    { href: 'shop.html', key: 'nav.shop', match: 'shop', mega: true },
    { href: 'shop.html?sale=1', key: 'nav.deals', match: 'deals' },
    { href: 'shop.html?sort=newest', key: 'nav.new', match: 'new' },
    { href: 'about.html', key: 'nav.about', match: 'about' },
    { href: 'contact.html', key: 'nav.contact', match: 'contact' }
  ];
}

function megaHtml() {
  return `
    <div class="mega" role="menu">
      <div class="container mega-grid">
        <div>
          <h4>${t('nav.categories')}</h4>
          ${CATEGORIES.map((c) => `<a href="shop.html?category=${c.slug}">${c.name[getLang()]}</a>`).join('')}
        </div>
        <div>
          <h4>${t('home.featured')}</h4>
          <a href="shop.html?sort=rating">${t('shop.sort.rating')}</a>
          <a href="shop.html?sort=best">${t('shop.sort.best')}</a>
          <a href="shop.html?sale=1">${t('nav.deals')}</a>
        </div>
        <div>
          <h4>${t('footer.help')}</h4>
          <a href="about.html">${t('nav.about')}</a>
          <a href="contact.html">${t('nav.contact')}</a>
          <a href="account.html">${t('nav.account')}</a>
        </div>
        <div>
          <h4>${t('nav.brands') || 'Brands'}</h4>
          <a href="shop.html?brand=SoundPeak">SoundPeak</a>
          <a href="shop.html?brand=Stride">Stride</a>
          <a href="shop.html?brand=Meridian">Meridian</a>
        </div>
      </div>
    </div>`;
}

function headerShell() {
  const lang = getLang();
  const cur = getCurrency();
  const links = navLinks();
  return `
  <div class="announce" id="announce">
    <div class="container">
      <span class="active"></span>
      <button class="close icon-btn" aria-label="${t('common.close')}"><i class="fas fa-xmark"></i></button>
    </div>
  </div>
  <header class="site-header" id="siteHeader">
    <div class="container header-inner">
      <button class="hamburger icon-btn" id="openDrawer" aria-label="${t('nav.menu')}"><i class="fas fa-bars"></i></button>
      <a href="index.html" class="logo" aria-label="${CONFIG.brand} home"><span class="dot"></span><span>${CONFIG.brand}</span></a>
      <nav class="main-nav" aria-label="Main">
        ${links.map((l) => `
          <div class="nav-item">
            <a href="${l.href}" class="nav-link ${PAGE === l.match ? 'active' : ''}">${t(l.key)}${l.mega ? ' <i class="fas fa-chevron-down" style="font-size:.7em"></i>' : ''}</a>
            ${l.mega ? megaHtml() : ''}
          </div>`).join('')}
      </nav>
      <div class="search" id="searchWrap">
        <i class="fas fa-magnifying-glass" aria-hidden="true"></i>
        <input type="search" id="globalSearch" placeholder="${t('search.placeholder')}" aria-label="${t('nav.search')}" autocomplete="off" role="combobox" aria-expanded="false">
        <div class="autocomplete" id="autocomplete" role="listbox"></div>
      </div>
      <div class="header-actions">
        <div class="switchers">
          <select class="select-mini lang" id="langSelect" aria-label="${t('lang.toggle')}">
            <option value="en" ${lang === 'en' ? 'selected' : ''}>EN</option>
            <option value="ar" ${lang === 'ar' ? 'selected' : ''}>ع</option>
          </select>
          <select class="select-mini" id="currencySelect" aria-label="${t('currency')}">
            ${CURRENCIES.map((c) => `<option value="${c}" ${cur === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <button class="icon-btn" id="themeToggle" aria-label="${t('theme.toggle')}"><i class="fas fa-${getTheme() === 'dark' ? 'sun' : 'moon'}"></i></button>
        <a href="wishlist.html" class="icon-btn" aria-label="${t('nav.wishlist')}"><i class="fas fa-heart"></i><span class="count js-wish-count hidden">0</span></a>
        <a href="cart.html" class="icon-btn js-open-cart" aria-label="${t('nav.cart')}"><i class="fas fa-bag-shopping"></i><span class="count js-cart-count hidden">0</span></a>
        <a href="${store.isLoggedIn() ? 'account.html' : 'login.html'}" class="icon-btn" aria-label="${t('nav.account')}"><i class="fas fa-user"></i></a>
      </div>
    </div>
  </header>
  <div class="mobile-drawer" id="mobileDrawer">
    <div class="backdrop" id="drawerBackdrop"></div>
    <div class="panel" role="dialog" aria-label="${t('nav.menu')}">
      <div class="between" style="margin-bottom:16px">
        <a href="index.html" class="logo"><span class="dot"></span><span>${CONFIG.brand}</span></a>
        <button class="icon-btn" id="closeDrawer" aria-label="${t('common.close')}"><i class="fas fa-xmark"></i></button>
      </div>
      <a href="index.html" class="nav-link">${t('nav.home')}</a>
      <a href="shop.html" class="nav-link">${t('nav.shop')}</a>
      ${CATEGORIES.map((c) => `<a href="shop.html?category=${c.slug}" class="nav-link">${c.name[getLang()]}</a>`).join('')}
      <a href="shop.html?sale=1" class="nav-link">${t('nav.deals')}</a>
      <a href="about.html" class="nav-link">${t('nav.about')}</a>
      <a href="contact.html" class="nav-link">${t('nav.contact')}</a>
      <a href="wishlist.html" class="nav-link">${t('nav.wishlist')}</a>
      <a href="${store.isLoggedIn() ? 'account.html' : 'login.html'}" class="nav-link">${store.isLoggedIn() ? t('account.title') : t('nav.login')}</a>
    </div>
  </div>
  <nav class="bottom-nav" aria-label="Mobile">
    <ul>
      <li><a href="index.html" class="${PAGE === 'home' ? 'active' : ''}"><i class="fas fa-house"></i>${t('nav.home')}</a></li>
      <li><a href="shop.html" class="${PAGE === 'shop' ? 'active' : ''}"><i class="fas fa-store"></i>${t('nav.shop')}</a></li>
      <li><a href="wishlist.html" class="${PAGE === 'wishlist' ? 'active' : ''}"><i class="fas fa-heart"></i>${t('nav.wishlist')}</a></li>
      <li><a href="cart.html" class="js-open-cart"><i class="fas fa-bag-shopping"></i>${t('nav.cart')}<span class="count js-cart-count hidden">0</span></a></li>
      <li><a href="${store.isLoggedIn() ? 'account.html' : 'login.html'}" class="${PAGE === 'account' ? 'active' : ''}"><i class="fas fa-user"></i>${t('nav.account')}</a></li>
    </ul>
  </nav>`;
}

/** Rotating announcement bar. */
function initAnnounce(root) {
  const span = root.querySelector('.announce span');
  const list = CONFIG.announcements;
  let i = 0;
  const render = () => { span.textContent = list[i][getLang()] || list[i].en; };
  render();
  const timer = setInterval(() => { i = (i + 1) % list.length; render(); }, 4500);
  root.querySelector('.announce .close').addEventListener('click', () => {
    clearInterval(timer);
    root.querySelector('.announce').style.display = 'none';
  });
}

/** Live search with autocomplete. */
function initSearch(root) {
  const input = root.querySelector('#globalSearch');
  const panel = root.querySelector('#autocomplete');
  let active = -1, results = [];

  const close = () => { panel.classList.remove('open'); input.setAttribute('aria-expanded', 'false'); active = -1; };

  function render(q) {
    results = PRODUCTS.filter((p) => {
      const hay = `${p.name} ${p.brand} ${p.category}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    }).slice(0, 6);
    if (!q) { close(); return; }
    if (!results.length) {
      panel.innerHTML = `<div class="ac-head">${t('search.noResults')}</div>
        <div style="padding:14px"><p class="text-soft" style="font-size:.85rem">${t('search.suggestions')}</p></div>`;
      panel.classList.add('open');
      input.setAttribute('aria-expanded', 'true');
      return;
    }
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
    panel.innerHTML = `<div class="ac-head">${t('top.searchProducts')}</div>` + results.map((p, idx) => `
      <a class="ac-item ${idx === active ? 'active' : ''}" href="product.html?id=${p.id}" data-idx="${idx}" role="option">
        <div class="media"><img data-src="${p.images[0]}" alt="${escapeHtml(p.name)}"></div>
        <div class="grow"><div class="name">${escapeHtml(p.name).replace(re, '<mark>$1</mark>')}</div>
        <div class="pill">${escapeHtml(p.brand)} · ${p.category}</div></div>
        <span class="price">${window.NOVA.money(p.price)}</span>
      </a>`).join('') +
      `<a class="ac-item" href="shop.html?q=${encodeURIComponent(q)}" style="justify-content:center;color:var(--brand);font-weight:600">${t('search.viewAll')} <i class="fas fa-arrow-right"></i></a>`;
    qsa('.ac-item .media img', panel).forEach((img) => setImg(img, img.dataset.src, img.alt, img.dataset.src));
    panel.classList.add('open');
    input.setAttribute('aria-expanded', 'true');
  }

  input.addEventListener('input', debounce((e) => { active = -1; render(e.target.value.trim()); }, 220));
  input.addEventListener('focus', () => { if (input.value.trim()) render(input.value.trim()); });
  input.addEventListener('keydown', (e) => {
    const items = qsa('.ac-item', panel);
    if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, items.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); }
    else if (e.key === 'Enter') { if (items[active]) { location.href = items[active].href; } else if (input.value.trim()) location.href = `shop.html?q=${encodeURIComponent(input.value.trim())}`; return; }
    else if (e.key === 'Escape') { close(); return; }
    else return;
    items.forEach((it, i) => it.classList.toggle('active', i === active));
    if (items[active]) items[active].scrollIntoView({ block: 'nearest' });
  });
  document.addEventListener('click', (e) => { if (!root.querySelector('#searchWrap').contains(e.target)) close(); });
}

/** Update all live badge counts. */
export function updateBadges() {
  const cart = store.cartCount(), wish = store.wishlistCount();
  qsa('.js-cart-count').forEach((n) => { n.textContent = cart; n.classList.toggle('hidden', cart === 0); });
  qsa('.js-wish-count').forEach((n) => { n.textContent = wish; n.classList.toggle('hidden', wish === 0); });
}

/** Build, mount and wire the header. */
export function initHeader() {
  const target = qs('#app-header');
  if (!target) return;
  target.innerHTML = headerShell();
  initAnnounce(target);
  initSearch(target);

  qs('#themeToggle').addEventListener('click', () => {
    const t2 = toggleTheme();
    qs('#themeToggle').innerHTML = `<i class="fas fa-${t2 === 'dark' ? 'sun' : 'moon'}"></i>`;
  });
  qs('#langSelect').addEventListener('change', (e) => window.NOVA.setLang(e.target.value));
  qs('#currencySelect').addEventListener('change', (e) => setCurrency(e.target.value));

  const drawer = qs('#mobileDrawer');
  const open = () => { drawer.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { drawer.classList.remove('open'); document.body.style.overflow = ''; };
  qs('#openDrawer').addEventListener('click', open);
  qs('#closeDrawer').addEventListener('click', close);
  qs('#drawerBackdrop').addEventListener('click', close);

  // cart drawer triggers
  qsa('.js-open-cart').forEach((a) => a.addEventListener('click', (e) => {
    if (e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    window.NOVA.openCart();
  }));

  const header = qs('#siteHeader');
  window.addEventListener('scroll', throttle(() => header.classList.toggle('scrolled', scrollY > 10), 120), { passive: true });

  updateBadges();
  window.addEventListener('nova:change', updateBadges);
}
