import { t } from '../core/i18n.js';
import { money } from '../core/currency.js';
import { store } from '../core/store.js';
import { computeTotals } from '../core/totals.js';
import { qs, qsa, escapeHtml, luhn, setImg } from '../core/utils.js';
import { showToast } from '../components/toast.js';

const data = { delivery: 'standard', payment: 'card' };
let step = 1;

function stepper() {
  return `<div class="step-progress" id="stepper">
    ${[['checkout.step1', 1], ['checkout.step2', 2], ['checkout.step3', 3], ['checkout.step4', 4]].map(([k, n]) => `
      <div class="step ${n === step ? 'active' : ''} ${n < step ? 'done' : ''}" data-step="${n}">
        <div class="num">${n < step ? '<i class="fas fa-check"></i>' : n}</div><span class="label">${t(k)}</span></div>`).join('')}
  </div>`;
}

function summaryHtml() {
  const totals = computeTotals({ delivery: data.delivery });
  const items = store.getCart();
  return `<aside class="summary">
    <h3 style="margin-bottom:12px">${t('checkout.orderSummary')}</h3>
    ${items.map((i) => `<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)"><div class="media" style="width:48px;height:48px;border-radius:8px"><img src="${i.image}" alt=""></div>
      <div class="grow"><div style="font-size:.85rem;font-weight:500">${escapeHtml(i.name)}</div><div class="pill">${[i.color, i.size].filter(Boolean).join(' / ')} × ${i.qty}</div></div>
      <strong style="font-size:.85rem">${money(i.price * i.qty)}</strong></div>`).join('')}
    <div class="row mt-4"><span>${t('common.subtotal')}</span><strong>${money(totals.subtotal)}</strong></div>
    ${totals.discount ? `<div class="row"><span>${t('common.discount')}</span><strong style="color:var(--success)">-${money(totals.discount)}</strong></div>` : ''}
    <div class="row"><span>${t('common.shipping')}</span><strong>${totals.shipping ? money(totals.shipping) : t('common.free')}</strong></div>
    <div class="row"><span>${t('common.tax')}</span><strong>${money(totals.tax)}</strong></div>
    <div class="row total"><span>${t('common.total')}</span><span>${money(totals.total)}</span></div>
  </aside>`;
}

export function initCheckout() {
  const main = qs('#app-main');
  if (!store.getCart().length) {
    main.innerHTML = `<div class="container"><div class="empty-state" style="padding:80px 16px"><i class="fas fa-bag-shopping"></i><h3>${t('cart.empty')}</h3><a href="shop.html" class="btn btn-primary mt-4">${t('cart.emptyCta')}</a></div></div>`;
    return;
  }
  const user = store.currentUser();
  main.innerHTML = `<div class="container"><nav class="breadcrumbs"><a href="cart.html">${t('nav.cart')}</a><span class="sep">/</span><span>${t('checkout.title')}</span></nav>
    <h1 class="section-head">${t('checkout.title')}</h1><div id="stepperWrap"></div>
    <div class="checkout-layout"><div id="stepPanels"></div><div id="summaryWrap"></div></div></div>`;

  renderStep();
  window.addEventListener('nova:change', (e) => { if (e.detail.area === 'cart') renderStep(); });
}

function renderStep() {
  qs('#stepperWrap').innerHTML = stepper();
  qs('#stepPanels').innerHTML = panel();
  qs('#summaryWrap').innerHTML = summaryHtml();
  qsa('[data-img]').forEach((im) => setImg(im, im.dataset.img, im.alt, im.dataset.img));
  bind();
  qsa('.step').forEach((s) => s.addEventListener('click', () => {
    const n = Number(s.dataset.step);
    if (n < step || validateStep(step)) { step = n; renderStep(); }
  }));
}

function panel() {
  const u = store.currentUser() || {};
  if (step === 1) return `<div class="checkout-step active">
    <h3 style="margin-bottom:16px">${t('checkout.step1')}</h3>
    <div class="field"><label>${t('checkout.fullName')} *</label><input class="input" id="fName" value="${escapeHtml(u.firstName ? u.firstName + ' ' + u.lastName : '')}"><span class="err"></span></div>
    <div class="grid-2"><div class="field"><label>${t('checkout.email')} *</label><input class="input" id="fEmail" type="email" value="${escapeHtml(u.email || '')}"><span class="err"></span></div>
    <div class="field"><label>${t('checkout.phone')} *</label><input class="input" id="fPhone" type="tel" placeholder="+1 555 000 0000"><span class="err"></span></div></div>
    <div class="field"><label>${t('checkout.address')} *</label><input class="input" id="fAddress"><span class="err"></span></div>
    <div class="grid-2"><div class="field"><label>${t('checkout.city')} *</label><input class="input" id="fCity"><span class="err"></span></div>
    <div class="field"><label>${t('checkout.zip')} *</label><input class="input" id="fZip"><span class="err"></span></div></div>
    <div class="field"><label>${t('checkout.country')}</label><select class="input" id="fCountry"><option>United States</option><option>United Kingdom</option><option>Egypt</option><option>Germany</option><option>UAE</option></select></div>
    <div class="flex between mt-4"><span class="pill"><i class="fas fa-lock"></i> ${t('checkout.guest')}</span><button class="btn btn-primary" id="nextBtn">${t('common.next')} <i class="fas fa-arrow-right"></i></button></div>
  </div>`;
  if (step === 2) return `<div class="checkout-step active"><h3 style="margin-bottom:16px">${t('checkout.deliveryMethod')}</h3>
    ${[['standard', 'checkout.standard', 'fa-truck'], ['express', 'checkout.express', 'fa-bolt']].map(([v, k, ic]) => `
      <label class="pay-option ${data.delivery === v ? 'active' : ''}"><input type="radio" name="delivery" value="${v}" ${data.delivery === v ? 'checked' : ''}>
      <i class="fas ${ic}" style="color:var(--brand);font-size:1.3rem"></i><div><strong>${t(k)}</strong><div class="text-soft" style="font-size:.82rem">${v === 'standard' ? money(15) : money(27)}</div></div></label>`).join('')}
    <button class="btn btn-primary mt-4" id="nextBtn">${t('common.next')} <i class="fas fa-arrow-right"></i></button></div>`;
  if (step === 3) return `<div class="checkout-step active"><h3 style="margin-bottom:16px">${t('checkout.payment')}</h3>
    ${[['card', 'checkout.card', 'fa-credit-card'], ['cod', 'checkout.cod', 'fa-money-bill-wave'], ['wallet', 'checkout.wallet', 'fa-wallet']].map(([v, k, ic]) => `
      <label class="pay-option ${data.payment === v ? 'active' : ''}"><input type="radio" name="payment" value="${v}" ${data.payment === v ? 'checked' : ''}>
      <i class="fas ${ic}" style="color:var(--brand);font-size:1.3rem"></i><strong>${t(k)}</strong></label>`).join('')}
    <div id="cardFields" class="${data.payment === 'card' ? '' : 'hidden'}" style="margin-top:12px">
      <div class="field"><label>${t('checkout.cardNumber')} *</label><input class="input" id="fCard" inputmode="numeric" placeholder="4242 4242 4242 4242" maxlength="19"><span class="err"></span></div>
      <div class="field"><label>${t('checkout.cardName')} *</label><input class="input" id="fCardName"><span class="err"></span></div>
      <div class="grid-2"><div class="field"><label>${t('checkout.expiry')} *</label><input class="input" id="fExp" placeholder="MM/YY" maxlength="5"><span class="err"></span></div>
      <div class="field"><label>${t('checkout.cvv')} *</label><input class="input" id="fCvv" maxlength="4" inputmode="numeric"><span class="err"></span></div></div>
    </div>
    <div class="flex between mt-4"><button class="btn btn-outline" id="prevBtn">${t('common.back')}</button><button class="btn btn-primary" id="nextBtn">${t('common.next')} <i class="fas fa-arrow-right"></i></button></div></div>`;
  const totals = computeTotals({ delivery: data.delivery });
  return `<div class="checkout-step active"><h3 style="margin-bottom:16px">${t('checkout.step4')}</h3>
    <div class="info-box" style="margin-bottom:16px"><i class="fas fa-location-dot"></i><div><strong>${t('checkout.step1')}</strong><div class="text-soft" id="reviewShip"></div></div></div>
    <div class="info-box" style="margin-bottom:16px"><i class="fas fa-credit-card"></i><div><strong>${t('checkout.payment')}</strong><div class="text-soft">${data.payment === 'card' ? t('checkout.card') : data.payment === 'cod' ? t('checkout.cod') : t('checkout.wallet')}</div></div></div>
    <div class="field"><label>${t('checkout.orderNote')}</label><textarea class="input" id="fNote" rows="2"></textarea></div>
    <div class="flex between mt-4"><button class="btn btn-outline" id="prevBtn">${t('common.back')}</button>
      <button class="btn btn-primary btn-lg" id="placeBtn"><i class="fas fa-lock"></i> ${t('common.placeOrder')} · ${money(totals.total)}</button></div></div>`;
}

function bind() {
  qsa('.pay-option input').forEach((r) => r.addEventListener('change', () => {
    if (r.name === 'delivery') data.delivery = r.value; else { data.payment = r.value; qs('#cardFields')?.classList.toggle('hidden', data.payment !== 'card'); }
    renderStep();
  }));
  qs('#nextBtn')?.addEventListener('click', () => { if (validateStep(step)) { step++; renderStep(); } });
  qs('#prevBtn')?.addEventListener('click', () => { step--; renderStep(); });
  qs('#fCard')?.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim(); });
  qs('#fExp')?.addEventListener('input', (e) => { let v = e.target.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); e.target.value = v; });
  qs('#fCvv')?.addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); });
  qs('#placeBtn')?.addEventListener('click', placeOrder);
  if (step === 4) {
    const a = data.ship || {};
    qs('#reviewShip').textContent = [a.name, a.address, a.city, a.zip, a.country].filter(Boolean).join(', ');
  }
}

function setErr(id, msg) {
  const f = qs('#' + id); if (!f) return !msg;
  const err = f.parentElement.querySelector('.err');
  if (err) err.textContent = msg || '';
  f.classList.toggle('invalid', !!msg);
  return !msg;
}

function validateStep(s) {
  if (s === 1) {
    const name = qs('#fName'), email = qs('#fEmail'), phone = qs('#fPhone'), address = qs('#fAddress'), city = qs('#fCity'), zip = qs('#fZip');
    let ok = true;
    ok = setErr('fName', name.value.trim().length < 3 ? 'Required' : '') && ok;
    ok = setErr('fEmail', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()) ? t('auth.invalidEmail') : '') && ok;
    ok = setErr('fPhone', phone.value.replace(/\D/g, '').length < 7 ? 'Required' : '') && ok;
    ok = setErr('fAddress', address.value.trim().length < 5 ? 'Required' : '') && ok;
    ok = setErr('fCity', city.value.trim().length < 2 ? 'Required' : '') && ok;
    ok = setErr('fZip', zip.value.trim().length < 3 ? 'Required' : '') && ok;
    if (ok) data.ship = { name: name.value.trim(), email: email.value.trim(), phone: phone.value.trim(), address: address.value.trim(), city: city.value.trim(), zip: zip.value.trim(), country: qs('#fCountry').value };
    return ok;
  }
  if (s === 3 && data.payment === 'card') {
    const card = qs('#fCard'), cname = qs('#fCardName'), exp = qs('#fExp'), cvv = qs('#fCvv');
    let ok = true;
    ok = setErr('fCard', !luhn(card.value) ? 'Invalid card number' : '') && ok;
    ok = setErr('fCardName', cname.value.trim().length < 3 ? 'Required' : '') && ok;
    ok = setErr('fExp', !/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp.value) ? 'MM/YY' : '') && ok;
    ok = setErr('fCvv', !/^\d{3,4}$/.test(cvv.value) ? 'CVV' : '') && ok;
    return ok;
  }
  return true;
}

function placeOrder() {
  const totals = computeTotals({ delivery: data.delivery });
  const number = 'NOVA-' + Date.now().toString().slice(-8);
  const order = {
    number, date: Date.now(), status: 'processing', delivery: data.delivery, payment: data.payment,
    ship: data.ship, note: qs('#fNote')?.value || '', subtotal: totals.subtotal, discount: totals.discount,
    shipping: totals.shipping, tax: totals.tax, total: totals.total,
    items: store.getCart().map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price, image: i.image, color: i.color, size: i.size }))
  };
  store.addOrder(order);
  store.clearCart();
  store.clearCoupon();
  showToast('success', t('order.successTitle'));
  location.href = `order-success.html?order=${number}`;
}
