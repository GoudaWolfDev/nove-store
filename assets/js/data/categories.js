import { unsplash } from './images.js';

export const CATEGORIES = [
  { slug: 'electronics', name: { en: 'Electronics', ar: 'إلكترونيات' }, icon: 'fa-headphones', image: unsplash('photo-1498049794561-7780e7231661', 600), count: 8 },
  { slug: 'fashion', name: { en: 'Fashion', ar: 'أزياء' }, icon: 'fa-shirt', image: unsplash('photo-1483985988355-763728e1935b', 600), count: 7 },
  { slug: 'shoes', name: { en: 'Shoes', ar: 'أحذية' }, icon: 'fa-shoe-prints', image: unsplash('photo-1542291026-7eec264c27ff', 600), count: 5 },
  { slug: 'watches', name: { en: 'Watches', ar: 'ساعات' }, icon: 'fa-clock', image: unsplash('photo-1523275335684-37898b6baf30', 600), count: 5 },
  { slug: 'home', name: { en: 'Home', ar: 'المنزل' }, icon: 'fa-couch', image: unsplash('photo-1555041469-a586c61ea9bc', 600), count: 5 },
  { slug: 'beauty', name: { en: 'Beauty', ar: 'جمال' }, icon: 'fa-spa', image: unsplash('photo-1596462502278-27bfdc403348', 600), count: 5 },
  { slug: 'sports', name: { en: 'Sports', ar: 'رياضة' }, icon: 'fa-dumbbell', image: unsplash('photo-1517649763962-0c623066013b', 600), count: 6 }
];

export const BRANDS = [...new Set([
  'SoundPeak','Vertex','Lumina','Voltix','KeyForge','Nova Basics','RivetCo','Northpeak','Highland',
  'Stride','Summit','Verona','Meridian','Abyss','PulseTech','Lumen','Glowhaus','Terra','Lueur','Maison Noir','FlowFit','IronCore'
])].sort();

export const catName = (slug, lang = 'en') => (CATEGORIES.find((c) => c.slug === slug)?.name[lang]) || slug;
