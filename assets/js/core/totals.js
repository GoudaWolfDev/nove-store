import { CONFIG } from './config.js';
import { store } from './store.js';
import { round2 } from './utils.js';

/**
 * Compute cart totals.
 * @param {{delivery?:'standard'|'express'}} [opts]
 */
export function computeTotals({ delivery = 'standard' } = {}) {
  const subtotal = store.cartSubtotal();
  const coupon = store.getCoupon();
  let discount = 0;
  let freeShip = subtotal >= CONFIG.freeShippingThreshold || subtotal === 0;
  if (coupon) {
    if (coupon.type === 'percent') discount = round2(subtotal * (coupon.value / 100));
    if (coupon.type === 'shipping') freeShip = true;
  }
  let shipping = freeShip ? 0 : CONFIG.shippingFlat;
  if (delivery === 'express' && subtotal > 0) shipping = freeShip ? 12 + 0 : CONFIG.shippingFlat + 12;
  const tax = round2((subtotal - discount) * CONFIG.taxRate);
  const total = round2(Math.max(0, subtotal - discount + (delivery === 'express' ? (freeShip ? 12 : CONFIG.shippingFlat + 12) : shipping) + tax));
  return { subtotal, discount, shipping: delivery === 'express' ? (freeShip ? 12 : CONFIG.shippingFlat + 12) : shipping, tax, total, coupon, freeShipThreshold: CONFIG.freeShippingThreshold };
}
