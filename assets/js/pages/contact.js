import { CONFIG } from '../core/config.js';
import { t, getLang } from '../core/i18n.js';
import { qs } from '../core/utils.js';
import { showToast } from '../components/toast.js';

export function initContact() {
  const main = qs('#app-main');
  main.innerHTML = `<div class="container"><nav class="breadcrumbs"><a href="index.html">${t('nav.home')}</a><span class="sep">/</span><span>${t('nav.contact')}</span></nav>
    <div class="section-head"><div><span class="eyebrow">${t('nav.contact')}</span><h1>${t('contact.title')}</h1><p class="text-soft">${t('contact.sub')}</p></div></div>
    <div class="contact-grid section" style="padding-top:0">
      <form class="summary" style="position:static" id="contactForm">
        <div class="field"><label>${t('contact.name')}</label><input class="input" name="name" required><span class="err"></span></div>
        <div class="field"><label>${t('checkout.email')}</label><input class="input" name="email" type="email" required><span class="err"></span></div>
        <div class="field"><label>${t('contact.subject')}</label><input class="input" name="subject"></div>
        <div class="field"><label>${t('contact.message')}</label><textarea class="input" name="message" rows="5" required></textarea><span class="err"></span></div>
        <button class="btn btn-primary btn-block btn-lg" type="submit">${t('contact.send')}</button>
      </form>
      <div>
        <div class="summary" style="position:static;margin-bottom:16px">
          <div class="info-boxes" style="grid-template-columns:1fr">
            <div class="info-box"><i class="fas fa-location-dot"></i><strong>${t('nav.contact')}</strong><div class="text-soft">${CONFIG.address[getLang()] || CONFIG.address.en}</div></div>
            <div class="info-box"><i class="fas fa-envelope"></i><strong>Email</strong><div class="text-soft">${CONFIG.email}</div></div>
            <div class="info-box"><i class="fas fa-phone"></i><strong>Phone</strong><div class="text-soft">${CONFIG.phone}</div></div>
          </div>
        </div>
        <div class="map-embed"><div class="center"><i class="fas fa-map-location-dot" style="font-size:2rem"></i><p>${CONFIG.address[getLang()] || CONFIG.address.en}</p></div></div>
      </div>
    </div></div>`;

  qs('#contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target, fd = new FormData(form);
    let ok = true;
    [['name', String(fd.get('name')).trim().length < 2], ['message', String(fd.get('message')).trim().length < 5]].forEach(([k, bad]) => {
      form[k].classList.toggle('invalid', bad);
      form[k].parentElement.querySelector('.err').textContent = bad ? 'Required' : '';
      if (bad) ok = false;
    });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(fd.get('email')))) { ok = false; form.email.classList.add('invalid'); form.email.parentElement.querySelector('.err').textContent = t('auth.invalidEmail'); }
    if (!ok) return;
    form.reset();
    showToast('success', t('contact.sent'));
  });
}
