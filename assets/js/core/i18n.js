import { translations } from '../data/translations.js';
import { store } from './store.js';

let lang = 'en';

export const getLang = () => lang;
export const isRTL = () => lang === 'ar';

/** Translate a key with optional {var} interpolation. */
export function t(key, vars) {
  let str = (translations[lang] && translations[lang][key]) || (translations.en[key]) || key;
  if (vars) Object.entries(vars).forEach(([k, v]) => { str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v); });
  return str;
}

function apply(l) {
  lang = l;
  document.documentElement.lang = l;
  document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('data-lang', l);
}

export const setLang = (l) => {
  store.setSetting('lang', l);
  apply(l);
  window.dispatchEvent(new CustomEvent('nova:change', { detail: { area: 'lang' } }));
};

/** Initialise language from storage or browser. */
export function initI18n() {
  const saved = store.getSetting('lang', null);
  const guess = (navigator.language || 'en').toLowerCase().startsWith('ar') ? 'ar' : 'en';
  apply(saved || guess);
}

/** Apply translations to all [data-i18n] / [data-i18n-ph] nodes in a root. */
export function applyTranslations(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.dataset.i18n); });
  root.querySelectorAll('[data-i18n-ph]').forEach((n) => { n.setAttribute('placeholder', t(n.dataset.i18nPh)); });
  root.querySelectorAll('[data-i18n-aria]').forEach((n) => { n.setAttribute('aria-label', t(n.dataset.i18nAria)); });
  root.querySelectorAll('[data-i18n-title]').forEach((n) => { n.setAttribute('title', t(n.dataset.i18nTitle)); });
}
