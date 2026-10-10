import { t } from '../core/i18n.js';
import { qs } from '../core/utils.js';

export function initNotFound() {
  const main = qs('#app-main');
  main.innerHTML = `<div class="container"><div class="found-404">
    <b>404</b>
    <h1>${t('errors.404')}</h1>
    <p class="text-soft mt-2">${t('errors.404sub')}</p>
    <div class="flex center" style="justify-content:center;gap:12px;margin-top:24px">
      <a href="index.html" class="btn btn-primary btn-lg">${t('errors.backHome')}</a>
      <a href="shop.html" class="btn btn-outline btn-lg">${t('nav.shop')}</a>
    </div>
  </div></div>`;
}
