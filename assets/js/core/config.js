/**
 * Global brand + app configuration. Edit brand name and colors here.
 */
export const CONFIG = {
  brand: 'NOVA',
  brandShort: 'N',
  tagline: { en: 'Modern Shopping, Elevated', ar: 'تسوق عصري بمستوى أرقى' },
  email: 'hello@nova.store',
  phone: '+1 (555) 019-2834',
  address: { en: '128 Market Street, San Francisco, CA', ar: '١٢٨ شارع ماركت، سان فرانسيسكو' },
  social: {
    facebook: '#', instagram: '#', twitter: '#', youtube: '#', tiktok: '#'
  },
  colors: { primary: '#6C5CE7', accent: '#00CEC9' },
  currency: { base: 'USD', rates: { USD: 1, EGP: 48.5, EUR: 0.92 }, symbols: { USD: '$', EGP: 'E£', EUR: '€' } },
  taxRate: 0.08,
  shippingFlat: 15,
  freeShippingThreshold: 200,
  compareLimit: 3,
  coupons: { NOVA10: { type: 'percent', value: 10, label: '10% off' }, FREESHIP: { type: 'shipping', value: 0, label: 'Free shipping' } },
  announcements: [
    { en: 'Free shipping on orders over $200', ar: 'شحن مجاني للطلبات فوق ٢٠٠ دولار' },
    { en: 'Use code NOVA10 for 10% off', ar: 'استخدم كود NOVA10 لخصم ١٠٪' },
    { en: '30-day easy returns', ar: 'إرجاع سهل خلال ٣٠ يوماً' }
  ]
};
