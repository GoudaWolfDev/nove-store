import { CONFIG } from './config.js';
import { store } from './store.js';
import { round2 } from './utils.js';

const { rates, symbols, base } = CONFIG.currency;

export const getCurrency = () => store.getSetting('currency', base);

export const setCurrency = (code) => {
  store.setSetting('currency', code);
  window.dispatchEvent(new CustomEvent('nova:change', { detail: { area: 'currency' } }));
};

/** Convert a base-currency amount to the active currency. */
export const convert = (amount) => round2((Number(amount) || 0) * rates[getCurrency()]);

/** Format an amount (already in base currency) into the active currency string. */
export function money(amount, { decimals } = {}) {
  const code = getCurrency();
  const value = convert(amount);
  const digits = decimals != null ? decimals : value % 1 === 0 ? 0 : 2;
  return `${symbols[code]}${value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

export const CURRENCIES = Object.keys(rates);
