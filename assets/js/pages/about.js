import { CONFIG } from '../core/config.js';
import { t } from '../core/i18n.js';
import { qs } from '../core/utils.js';
import { unsplash } from '../data/images.js';
import { setImg } from '../core/utils.js';

export function initAbout() {
  const main = qs('#app-main');
  main.innerHTML = `<div class="container"><nav class="breadcrumbs"><a href="index.html">${t('nav.home')}</a><span class="sep">/</span><span>${t('nav.about')}</span></nav></div>
    <section class="section container about-hero">
      <span class="eyebrow">${t('nav.about')}</span>
      <h1 style="margin:12px 0">${t('about.title')}</h1>
      <p class="text-soft">${t('about.sub')}</p>
    </section>
    <div class="container"><div class="media ratio-16-9" style="border-radius:24px"><img data-img="${unsplash('photo-1556742049-0cfed4f6a45d', 1400)}" alt="NOVA"></div></div>
    <section class="section container">
      <div class="grid-2">
        <div><h2>${t('about.missionTitle')}</h2><p class="text-soft mt-2">${t('about.mission')}</p>
          <p class="text-soft mt-2">We believe great design and honest pricing should go hand in hand. NOVA curates the best products across electronics, fashion, beauty and home so you can shop with confidence.</p></div>
        <div class="media ratio-4-3" style="border-radius:20px"><img data-img="${unsplash('photo-1522202176988-66273c2fd55f', 900)}" alt="Team"></div>
      </div>
      <div class="stats">
        ${[['2M+', 'Happy customers'], ['80k+', 'Products shipped'], ['120', 'Countries served'], ['4.9', 'Average rating']].map(([n, l]) => `<div class="stat"><b>${n}</b><span class="text-soft">${l}</span></div>`).join('')}
      </div>
    </section>`;
  main.querySelectorAll('[data-img]').forEach((im) => setImg(im, im.dataset.img, im.alt, im.dataset.img));
}
