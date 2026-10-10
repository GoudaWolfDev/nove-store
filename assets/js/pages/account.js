import { t } from '../core/i18n.js';
import { money } from '../core/currency.js';
import { store } from '../core/store.js';
import { qs, qsa, el, escapeHtml, formatDate, setImg } from '../core/utils.js';
import { showToast } from '../components/toast.js';
import { renderProducts } from '../components/product-card.js';

export function initAccount() {
  if (!store.isLoggedIn()) { location.replace('login.html?redirect=account.html'); return; }
  const u = store.currentUser();
  const main = qs('#app-main');
  main.innerHTML = `<div class="container"><nav class="breadcrumbs"><a href="index.html">${t('nav.home')}</a><span class="sep">/</span><span>${t('account.title')}</span></nav>
    <div class="section-head"><div><span class="eyebrow">${t('nav.account')}</span><h1>${t('auth.welcomeBack', { name: escapeHtml(u.firstName) })}</h1></div>
      <button class="btn btn-outline" id="logoutBtn"><i class="fas fa-right-from-bracket"></i> ${t('nav.logout')}</button></div>
    <div class="account-layout">
      <nav class="account-nav" aria-label="${t('account.title')}">
        ${[['profile', 'account.profile', 'fa-user'], ['orders', 'account.orders', 'fa-box'], ['addresses', 'account.addresses', 'fa-location-dot'], ['wishlist', 'account.wishlist', 'fa-heart']].map(([k, lab, ic], i) => `
          <button class="${i === 0 ? 'active' : ''}" data-panel="${k}"><i class="fas ${ic}"></i> ${t(lab)}</button>`).join('')}
      </nav>
      <div>
        <div class="account-panel active" id="panel-profile"></div>
        <div class="account-panel" id="panel-orders"></div>
        <div class="account-panel" id="panel-addresses"></div>
        <div class="account-panel" id="panel-wishlist"></div>
      </div>
    </div></div>`;

  qs('#logoutBtn').addEventListener('click', () => { store.logout(); showToast('info', t('auth.logoutDone')); setTimeout(() => (location.href = 'index.html'), 400); });
  qsa('.account-nav button').forEach((b) => b.addEventListener('click', () => {
    qsa('.account-nav button').forEach((x) => x.classList.remove('active')); b.classList.add('active');
    qsa('.account-panel').forEach((p) => p.classList.remove('active'));
    qs('#panel-' + b.dataset.panel).classList.add('active');
  }));

  renderProfile(u);
  renderOrders();
  renderAddresses();
  renderWishlist();
}

function renderProfile(u) {
  qs('#panel-profile').innerHTML = `<div class="summary" style="position:static">
    <h3 style="margin-bottom:16px">${t('account.profile')}</h3>
    <form id="profileForm">
      <div class="grid-2"><div class="field"><label>${t('auth.firstName')}</label><input class="input" name="firstName" value="${escapeHtml(u.firstName)}"></div>
      <div class="field"><label>${t('auth.lastName')}</label><input class="input" name="lastName" value="${escapeHtml(u.lastName)}"></div></div>
      <div class="field"><label>${t('checkout.email')}</label><input class="input" name="email" value="${escapeHtml(u.email)}" disabled></div>
      <button class="btn btn-primary" type="submit">${t('common.save')}</button>
    </form></div>`;
  qs('#profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    store.updateProfile({ firstName: fd.get('firstName'), lastName: fd.get('lastName') });
    showToast('success', t('account.profileSaved'));
  });
}

function renderOrders() {
  const orders = store.getOrders();
  const panel = qs('#panel-orders');
  if (!orders.length) { panel.innerHTML = `<div class="empty-state"><i class="fas fa-box-open"></i><h3>${t('account.noOrders')}</h3><a href="shop.html" class="btn btn-primary mt-4">${t('cart.emptyCta')}</a></div>`; return; }
  panel.innerHTML = orders.map((o) => `
    <div class="order-card">
      <div class="between wrap"><div><strong>${o.number}</strong><div class="pill">${t('account.orderDate')}: ${formatDate(o.date)}</div></div>
      <div class="flex"><span class="badge badge-new" style="text-transform:capitalize">${o.status}</span><strong>${money(o.total)}</strong></div></div>
      <div style="margin-top:12px">${o.items.map((i) => `<div class="review-item"><div class="media" style="width:48px;height:48px"><img src="${i.image}" alt=""></div>
        <div class="grow"><div style="font-weight:500;font-size:.88rem">${escapeHtml(i.name)}</div><div class="pill">${[i.color, i.size].filter(Boolean).join(' / ')} × ${i.qty}</div></div>
        <strong style="font-size:.85rem">${money(i.price * i.qty)}</strong></div>`).join('')}</div>
      <div class="timeline">${['processing', 'shipped', 'delivered'].map((s, i) => `<div class="tl-step ${['processing', 'shipped', 'delivered'].indexOf(o.status) >= i ? 'done' : ''}"><div class="dot"></div>${s}</div>`).join('')}</div>
    </div>`).join('');
}

function renderAddresses() {
  const list = store.getAddresses();
  qs('#panel-addresses').innerHTML = `<div class="between" style="margin-bottom:16px"><h3>${t('account.addresses')}</h3><button class="btn btn-sm btn-primary" id="addAddr">${t('account.addAddress')}</button></div>
    <div id="addrList">${list.length ? list.map((a) => `<div class="order-card between"><div><strong>${escapeHtml(a.name)}</strong> ${a.isDefault ? `<span class="badge badge-soft">${t('common.default')}</span>` : ''}
      <div class="text-soft" style="font-size:.85rem">${escapeHtml([a.address, a.city, a.zip, a.country].filter(Boolean).join(', '))}<br>${escapeHtml(a.phone || '')}</div></div>
      <button class="icon-btn" data-del="${a.id}" aria-label="${t('common.delete')}"><i class="fas fa-trash"></i></button></div>`).join('') : `<p class="text-muted">${t('account.noAddresses')}</p>`}</div>`;
  qs('#addAddr').addEventListener('click', addAddressForm);
  qsa('[data-del]').forEach((b) => b.addEventListener('click', () => { store.removeAddress(b.dataset.del); renderAddresses(); }));
}

function addAddressForm() {
  const wrap = el('div', {}, [el('div', { html: `<div style="padding:20px"><h3 style="margin-bottom:12px">${t('account.addAddress')}</h3>
    <div class="field"><label>${t('checkout.fullName')}</label><input class="input" id="aName"></div>
    <div class="field"><label>${t('checkout.address')}</label><input class="input" id="aAddr"></div>
    <div class="grid-2"><div class="field"><label>${t('checkout.city')}</label><input class="input" id="aCity"></div>
    <div class="field"><label>${t('checkout.zip')}</label><input class="input" id="aZip"></div></div>
    <div class="field"><label>${t('checkout.phone')}</label><input class="input" id="aPhone"></div>
    <label class="check"><input type="checkbox" id="aDefault"> ${t('common.default')}</label>
    <button class="btn btn-primary btn-block mt-4" id="saveAddr">${t('common.save')}</button></div>` })]);
  import('../components/modal.js').then(({ openModal }) => {
    openModal(wrap.innerHTML);
    qs('#saveAddr').addEventListener('click', () => {
      store.addAddress({ name: qs('#aName').value, address: qs('#aAddr').value, city: qs('#aCity').value, zip: qs('#aZip').value, phone: qs('#aPhone').value, isDefault: qs('#aDefault').checked });
      import('../components/modal.js').then(({ closeModal }) => closeModal());
      renderAddresses();
      showToast('success', t('common.save'));
    });
  });
}

function renderWishlist() {
  const ids = store.getWishlist();
  const products = ids.map((id) => window.NOVA.products.find((p) => p.id === id)).filter(Boolean);
  const panel = qs('#panel-wishlist');
  if (!products.length) { panel.innerHTML = `<div class="empty-state"><i class="fas fa-heart"></i><h3>${t('wishlist.empty')}</h3></div>`; return; }
  panel.innerHTML = `<div class="grid-products" id="accWish"></div>`;
  renderProducts(qs('#accWish'), products);
}
