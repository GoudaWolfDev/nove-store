import { PRODUCTS, featured, newArrivals, bestSellers } from '../data/products.js';
import { CATEGORIES } from '../data/categories.js';
import { unsplash } from '../data/images.js';
import { t, getLang } from '../core/i18n.js';
import { money } from '../core/currency.js';
import { store } from '../core/store.js';
import { qs, qsa, el, escapeHtml, starsHtml } from '../core/utils.js';
import { renderProducts, hydrateMedia } from '../components/product-card.js';
import { createSlider } from '../components/slider.js';
import { startCountdown, nextFlashEnd } from '../components/countdown.js';
import { showToast } from '../components/toast.js';

const heroSlides = [
  { img: unsplash('photo-1505740420928-5e560c06d30e', 900), title: 'home.hero1.title', sub: 'home.hero1.sub', cta: 'home.shopNow', link: 'shop.html' },
  { img: unsplash('photo-1542291026-7eec264c27ff', 900), title: 'home.hero2.title', sub: 'home.hero2.sub', cta: 'home.exploreDeals', link: 'shop.html?sale=1' },
  { img: unsplash('photo-1523275335684-37898b6baf30', 900), title: 'home.hero3.title', sub: 'home.hero3.sub', cta: 'home.shopNow', link: 'shop.html?sort=newest' }
];

function section(id, inner) { return `<section class="section container" id="${id}">${inner}</section>`; }

export function initHome() {
  const main = qs('#app-main');
  const flash = PRODUCTS.filter((p) => p.discount >= 30).slice(0, 4);

  main.innerHTML = `
  <section class="hero slider" id="heroSlider" aria-roledescription="carousel">
    <div class="slides">
      ${heroSlides.map((s) => `
        <div class="slide">
          <div class="container hero-slide">
            <div class="hero-content reveal">
              <span class="hero-badge"><i class="fas fa-bolt" style="color:var(--brand)"></i> ${t('nav.deals')}</span>
              <h1>${t(s.title)}</h1>
              <p>${t(s.sub)}</p>
              <div class="hero-actions">
                <a href="${s.link}" class="btn btn-primary btn-lg">${t(s.cta)} <i class="fas fa-arrow-right"></i></a>
                <a href="shop.html" class="btn btn-outline btn-lg">${t('common.viewAll')}</a>
              </div>
            </div>
            <div class="hero-media reveal"><img data-src="${s.img}" alt=""></div>
          </div>
        </div>`).join('')}
    </div>
    <button class="slider-arrow prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>
    <button class="slider-arrow next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>
    <div class="dots"></div>
  </section>

  ${section('categories', `
    <div class="section-head"><div><span class="eyebrow">${t('nav.categories')}</span><h2>${t('home.browseCategories')}</h2></div>
      <a href="shop.html" class="btn btn-outline btn-sm">${t('common.viewAll')} <i class="fas fa-arrow-right"></i></a></div>
    <div class="grid-4">
      ${CATEGORIES.map((c) => `
        <a class="cat-card" href="shop.html?category=${c.slug}">
          <img data-src="${c.image}" alt="${escapeHtml(c.name[getLang()])}">
          <div class="cat-info"><h3 style="font-size:1.1rem">${c.name[getLang()]}</h3><span>${c.count} ${t('shop.results')}</span></div>
        </a>`).join('')}
    </div>`)}

  <section class="section container">
    <div class="flash">
      <div class="flash-head">
        <div><span class="eyebrow"><i class="fas fa-bolt"></i> ${t('home.flashSale')}</span><h2>${t('home.endsIn')}</h2></div>
        <div class="countdown" id="flashCountdown"></div>
      </div>
      <div class="grid-products" id="flashGrid"></div>
    </div>
  </section>

  ${section('tabs', `
    <div class="section-head"><div><span class="eyebrow">${t('nav.shop')}</span><h2>${t('home.featured')}</h2></div></div>
    <div class="tabs" id="homeTabs">
      <button class="tab active" data-tab="featured">${t('home.featured')}</button>
      <button class="tab" data-tab="new">${t('home.whatsNew')}</button>
      <button class="tab" data-tab="best">${t('home.bestSellers')}</button>
    </div>
    <div class="tab-panel active mt-4" id="tab-featured"><div class="grid-products" id="grid-featured"></div></div>
    <div class="tab-panel" id="tab-new"><div class="grid-products" id="grid-new"></div></div>
    <div class="tab-panel" id="tab-best"><div class="grid-products" id="grid-best"></div></div>
    <div class="center mt-5"><a href="shop.html" class="btn btn-outline btn-lg">${t('common.viewAll')}</a></div>`)}

  ${section('promos', `
    <div class="promo-grid">
      <div class="promo"><img data-src="${unsplash('photo-1498049794561-7780e7231661', 1000)}" alt="">
        <div class="promo-info"><span class="eyebrow" style="color:#fff">${t('nav.new')}</span><h3>${t('home.hero3.title')}</h3><p>${t('home.hero3.sub')}</p>
        <a href="shop.html?sort=newest" class="btn btn-primary">${t('home.shopNow')}</a></div></div>
      <div class="promo"><img data-src="${unsplash('photo-1596462502278-27bfdc403348', 800)}" alt="">
        <div class="promo-info"><span class="eyebrow" style="color:#fff">${t('common.sale')}</span><h3>-60%</h3><p>${t('common.brand')} Beauty</p>
        <a href="shop.html?category=beauty" class="btn btn-primary">${t('home.shopNow')}</a></div></div>
    </div>`)}

  ${section('brands', `
    <div class="section-head center" style="justify-content:center;text-align:center"><div><span class="eyebrow">${t('nav.brands') || 'Brands'}</span><h2>Trusted by Leading Brands</h2></div></div>
    <div class="marquee"><div class="marquee-track">
      ${[...brands(), ...brands()].map((b) => `<span class="brand-logo">${b}</span>`).join('')}
    </div></div>`)}

  ${section('why', `
    <div class="section-head center" style="justify-content:center;text-align:center"><div><span class="eyebrow">${t('home.whyUs')}</span><h2>${t('home.whyUs')}</h2></div></div>
    <div class="why-grid">
      ${[['fa-truck-fast', 'home.why1', 'home.why1d'], ['fa-shield-halved', 'home.why2', 'home.why2d'], ['fa-rotate-left', 'home.why3', 'home.why3d'], ['fa-headset', 'home.why4', 'home.why4d']].map(([ic, ti, de]) => `
        <div class="why-card reveal"><div class="ico"><i class="fas ${ic}"></i></div><h3>${t(ti)}</h3><p class="text-soft" style="font-size:.88rem">${t(de)}</p></div>`).join('')}
    </div>`)}

  ${section('testimonials', `
    <div class="section-head center" style="justify-content:center;text-align:center"><div><span class="eyebrow">${t('common.reviews')}</span><h2>${t('home.testimonials')}</h2></div></div>
    <div class="slider" id="testiSlider"><div class="slides">${testimonials().map((tt) => `
      <div class="slide" style="padding:8px"><div class="testimonial">
        <span class="stars">${starsHtml(tt.rating)}</span>
        <p class="quote">"${escapeHtml(tt.text)}"</p>
        <div class="who"><div class="avatar">${tt.name[0]}</div><div><strong>${escapeHtml(tt.name)}</strong><div class="pill">${tt.role}</div></div></div>
      </div></div>`).join('')}</div>
      <button class="slider-arrow prev" aria-label="Previous"><i class="fas fa-chevron-left"></i></button>
      <button class="slider-arrow next" aria-label="Next"><i class="fas fa-chevron-right"></i></button>
      <div class="dots"></div>
    </div>`)}

  ${section('instagram', `
    <div class="section-head center" style="justify-content:center;text-align:center"><div><span class="eyebrow">@nova.store</span><h2>${t('home.followUs')}</h2></div></div>
    <div class="ig-grid">${PRODUCTS.slice(0, 6).map((p) => `<a href="product.html?id=${p.id}" aria-label="${escapeHtml(p.name)}"><img data-src="${p.images[0]}" alt=""></a>`).join('')}</div>`)}

  <section class="section container">
    <div class="newsletter-cta reveal">
      <h2>${t('home.newsletterTitle')}</h2>
      <p style="opacity:.92">${t('home.newsletterSub')}</p>
      <form id="ctaNewsletter"><input type="email" class="input" placeholder="${t('footer.emailPlaceholder')}" aria-label="email" required>
      <button class="btn btn-lg" style="background:#fff;color:var(--brand)" type="submit">${t('common.next')}</button></form>
    </div>
  </section>`;

  hydrateMedia(main);
  renderProducts(qs('#flashGrid'), flash);
  renderProducts(qs('#grid-featured'), featured().slice(0, 8));
  renderProducts(qs('#grid-new'), newArrivals().slice(0, 8));
  renderProducts(qs('#grid-best'), bestSellers().slice(0, 8));

  startCountdown(qs('#flashCountdown'), nextFlashEnd(), { days: t('home.days'), hours: t('home.hours'), mins: t('home.mins'), secs: t('home.secs') });
  createSlider(qs('#heroSlider'), { autoplay: true, interval: 6000 });
  createSlider(qs('#testiSlider'), { autoplay: true, interval: 5000 });

  qsa('#homeTabs .tab').forEach((tab) => tab.addEventListener('click', () => {
    qsa('#homeTabs .tab').forEach((x) => x.classList.remove('active'));
    tab.classList.add('active');
    qsa('.tab-panel', main).forEach((p) => p.classList.remove('active'));
    qs(`#tab-${tab.dataset.tab}`, main).classList.add('active');
  }));

  qs('#ctaNewsletter').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = e.target.querySelector('input').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('error', t('footer.validEmail')); return; }
    store.setSetting('newsletter', { email, at: Date.now() });
    e.target.reset();
    showToast('success', t('footer.subscribed'));
  });

  observeReveal(main);
}

function brands() {
  return ['SoundPeak', 'Vertex', 'Stride', 'Meridian', 'Lueur', 'Lumen', 'Summit', 'Nova Basics'];
}

function testimonials() {
  return [
    { name: 'Sarah M.', role: 'Verified buyer', rating: 5, text: 'Delivery was lightning fast and the packaging felt premium. Will order again.' },
    { name: 'Omar K.', role: 'Verified buyer', rating: 4.5, text: 'Great quality for the price. Customer support answered within minutes.' },
    { name: 'Lena P.', role: 'Verified buyer', rating: 5, text: 'The minimalist website makes shopping a joy. Returns were hassle free.' },
    { name: 'Ahmed R.', role: 'Verified buyer', rating: 5, text: 'Best online store I have used. The Arabic experience is flawless.' }
  ];
}

/** Scroll reveal via IntersectionObserver. */
export function observeReveal(scope = document) {
  const items = qsa('.reveal', scope);
  if (!('IntersectionObserver' in window)) { items.forEach((i) => i.classList.add('in')); return; }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('in'); obs.unobserve(entry.target); } });
  }, { threshold: 0.12 });
  items.forEach((i) => obs.observe(i));
}
