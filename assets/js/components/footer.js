import { CONFIG } from '../core/config.js';
import { CATEGORIES } from '../data/categories.js';
import { t, getLang } from '../core/i18n.js';
import { showToast } from './toast.js';
import { qs, qsa, el } from '../core/utils.js';
import { store } from '../core/store.js';

function shell() {
  const brand = CONFIG.brand;
  return `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <a href="index.html" class="logo" style="margin-bottom:12px"><span class="dot"></span><span>${brand}</span></a>
        <p class="text-soft" style="max-width:34ch;font-size:.88rem">${t('footer.tagline')}</p>
        <div class="social-icons" style="margin-top:16px">
          ${Object.entries(CONFIG.social).map(([k]) => `<a href="${CONFIG.social[k]}" aria-label="${k}"><i class="fab fa-${k}"></i></a>`).join('')}
        </div>
      </div>
      <div class="footer-links">
        <h4>${t('footer.shop')}</h4>
        ${CATEGORIES.slice(0, 6).map((c) => `<a href="shop.html?category=${c.slug}">${c.name[getLang()]}</a>`).join('')}
      </div>
      <div class="footer-links">
        <h4>${t('footer.company')}</h4>
        <a href="about.html">${t('nav.about')}</a>
        <a href="contact.html">${t('nav.contact')}</a>
        <a href="account.html">${t('nav.account')}</a>
        <a href="wishlist.html">${t('nav.wishlist')}</a>
        <a href="shop.html?sale=1">${t('nav.deals')}</a>
      </div>
      <div class="newsletter">
        <h4>${t('footer.newsletter')}</h4>
        <p class="text-soft" style="font-size:.85rem">${t('footer.newsletterSub')}</p>
        <form id="newsletterForm" novalidate>
          <input type="email" class="input" id="newsEmail" placeholder="${t('footer.emailPlaceholder')}" aria-label="${t('footer.emailPlaceholder')}" required>
          <button class="btn btn-primary btn-sm" type="submit">${t('footer.subscribe')}</button>
        </form>
        <div class="err" id="newsErr"></div>
        <div class="pay-icons" style="margin-top:20px">
          <i class="fab fa-cc-visa" title="Visa"></i><i class="fab fa-cc-mastercard" title="Mastercard"></i>
          <i class="fab fa-cc-paypal" title="PayPal"></i><i class="fab fa-cc-apple-pay" title="Apple Pay"></i>
          <i class="fas fa-money-bill-wave" title="Cash"></i>
        </div>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© ${new Date().getFullYear()} ${brand}. ${t('footer.rights')}</span>
      <span><a href="#">${t('footer.privacy')}</a> · <a href="#">${t('footer.terms')}</a></span>
    </div>
  </footer>
  <button class="back-top" id="backTop" aria-label="Back to top"><i class="fas fa-arrow-up"></i></button>
  <div class="cookie-banner hidden" id="cookieBanner">
    <p>${t('cookie.text')}</p>
    <div class="flex">
      <button class="btn btn-sm btn-outline" id="cookieDecline">${t('cookie.decline')}</button>
      <button class="btn btn-sm btn-primary" id="cookieAccept">${t('cookie.accept')}</button>
    </div>
  </div>`;
}

const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export function initFooter() {
  const target = qs('#app-footer');
  if (!target) return;
  target.innerHTML = shell();

  const form = qs('#newsletterForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = qs('#newsEmail').value.trim();
    const err = qs('#newsErr');
    if (!validEmail(email)) { err.textContent = t('footer.validEmail'); return; }
    err.textContent = '';
    store.setSetting('newsletter', { email, at: Date.now() });
    form.reset();
    showToast('success', t('footer.subscribed'));
  });

  const backTop = qs('#backTop');
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => backTop.classList.toggle('show', scrollY > 500), { passive: true });

  const banner = qs('#cookieBanner');
  if (!store.getSetting('cookie', null)) {
    setTimeout(() => banner.classList.remove('hidden'), 1200);
  }
  qs('#cookieAccept').addEventListener('click', () => { store.setSetting('cookie', 'accepted'); banner.classList.add('hidden'); });
  qs('#cookieDecline').addEventListener('click', () => { store.setSetting('cookie', 'declined'); banner.classList.add('hidden'); });
}
