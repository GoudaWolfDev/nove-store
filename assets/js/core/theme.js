import { store } from './store.js';

/** Initialise theme from storage or OS preference. */
export function initTheme() {
  const saved = store.getSetting('theme', null);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  apply(theme);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!store.getSetting('theme', null)) apply(e.matches ? 'dark' : 'light');
  });
}

function apply(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#0d0f16' : '#6C5CE7';
}

export const getTheme = () => document.documentElement.getAttribute('data-theme') || 'light';

export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  store.setSetting('theme', next);
  apply(next);
  return next;
}
