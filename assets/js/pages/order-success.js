import { t } from '../core/i18n.js';
import { money } from '../core/currency.js';
import { store } from '../core/store.js';
import { qs, escapeHtml, formatDate } from '../core/utils.js';

export function initOrderSuccess() {
  const number = new URLSearchParams(location.search).get('order');
  const order = number ? store.getOrder(number) : null;
  const main = qs('#app-main');

  main.innerHTML = `<div class="container"><div class="order-success">
    <div class="check"><i class="fas fa-check"></i></div>
    <h1>${t('order.successTitle')}</h1>
    <p class="text-soft mt-2">${t('order.thanks')} ${t('order.emailSent')}</p>
    <div class="summary mt-5" style="position:static;text-align:start">
      ${order ? `
        <div class="between"><span class="text-soft">${t('order.number')}</span><strong>${order.number}</strong></div>
        <div class="between" style="margin-top:8px"><span class="text-soft">${t('account.orderDate')}</span><strong>${formatDate(order.date)}</strong></div>
        <div class="between" style="margin-top:8px"><span class="text-soft">${t('common.total')}</span><strong>${money(order.total)}</strong></div>
        <div style="margin-top:16px">${order.items.map((i) => `<div class="review-item"><div class="media" style="width:48px;height:48px"><img src="${i.image}" alt=""></div>
          <div class="grow"><div style="font-weight:500;font-size:.88rem">${escapeHtml(i.name)}</div><div class="pill">${[i.color, i.size].filter(Boolean).join(' / ')} × ${i.qty}</div></div>
          <strong style="font-size:.85rem">${money(i.price * i.qty)}</strong></div>`).join('')}</div>` : `<p class="text-muted">${t('errors.notFound')}</p>`}
    </div>
    <div class="flex center" style="justify-content:center;gap:12px;margin-top:24px;flex-wrap:wrap">
      <a href="shop.html" class="btn btn-primary btn-lg">${t('order.continueShopping')}</a>
      <a href="account.html" class="btn btn-outline btn-lg">${t('order.viewOrder')}</a>
    </div>
  </div></div>`;
  confetti();
}

function confetti() {
  const colors = ['#6C5CE7', '#00CEC9', '#ffb400', '#f04438', '#12b76a', '#2e90fa'];
  const wrap = document.createElement('div');
  wrap.className = 'confetti';
  for (let i = 0; i < 90; i++) {
    const b = document.createElement('i');
    b.style.left = Math.random() * 100 + 'vw';
    b.style.background = colors[i % colors.length];
    b.style.animationDuration = 2 + Math.random() * 2.5 + 's';
    b.style.animationDelay = Math.random() * 1.2 + 's';
    b.style.transform = `rotate(${Math.random() * 360}deg)`;
    wrap.append(b);
  }
  document.body.append(wrap);
  setTimeout(() => wrap.remove(), 6000);
}
