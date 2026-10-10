import { imgsFor } from './images.js';

const COLORS = {
  black: '#111318', white: '#ffffff', silver: '#c9cdd6', navy: '#1f2a44', blue: '#2e6ff2',
  red: '#e63946', green: '#12b76a', beige: '#d9c7a7', brown: '#7a4b2a', pink: '#f4a7bb',
  gold: '#d4af37', gray: '#6b7280', purple: '#6C5CE7'
};
export const colorHex = (name) => COLORS[String(name).toLowerCase()] || '#888';

let _id = 0;
const P = (name, category, brand, price, oldPrice, rating, reviewsCount, stock, opts = {}) => {
  const id = ++_id;
  return {
    id,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    category,
    brand,
    price,
    oldPrice: oldPrice || 0,
    discount: oldPrice ? Math.round((1 - price / oldPrice) * 100) : 0,
    rating,
    reviewsCount,
    stock,
    colors: opts.colors || ['Black', 'White', 'Silver'],
    sizes: opts.sizes || [],
    images: imgsFor(category, id),
    description: opts.desc || `${name} by ${brand}. Crafted with premium materials and precision engineering for everyday performance and lasting style.`,
    features: opts.features || ['Premium build quality', '1-year warranty', 'Ethically sourced materials'],
    tags: opts.tags || [],
    isNew: !!opts.isNew,
    isBestSeller: !!opts.isBestSeller,
    sold: opts.sold || Math.round(rating * 40 + reviewsCount)
  };
};

export const PRODUCTS = [
  // ELECTRONICS
  P('Aurora Wireless Headphones','electronics','SoundPeak',129,199,4.8,1240,25,{colors:['Black','White','Navy'],isBestSeller:true,tags:['noise-cancel','bluetooth'],features:['Active noise cancellation','40h battery life','Quick charge USB-C']}),
  P('Nimbus Pro Smartphone','electronics','Vertex',899,1099,4.7,860,12,{colors:['Black','Silver','Blue'],sizes:['128GB','256GB','512GB'],isBestSeller:true,tags:['5g','oled']}),
  P('Pixel 4K Mirrorless Camera','electronics','Lumina',1199,0,4.9,420,8,{colors:['Black'],isNew:true,tags:['4k','photography']}),
  P('Bolt Fast Charge Power Bank','electronics','Voltix',39,59,4.5,2100,80,{colors:['Black','White'],tags:['portable']}),
  P('Aero Slim Laptop 14"','electronics','Vertex',1049,1249,4.6,530,15,{colors:['Silver','Gray'],sizes:['8GB/256GB','16GB/512GB'],isNew:true,tags:['ultrabook']}),
  P('Echo Smart Speaker Mini','electronics','SoundPeak',59,79,4.4,1760,60,{colors:['White','Black','Gray'],isBestSeller:true,tags:['voice']}),
  P('Vortex Mechanical Keyboard','electronics','KeyForge',139,0,4.8,690,34,{colors:['Black','White'],tags:['rgb','hot-swap'],isNew:true}),
  P('Orbit Wireless Earbuds','electronics','SoundPeak',89,119,4.6,3200,120,{colors:['White','Black','Pink'],isBestSeller:true,tags:['anc','sport']}),
  // FASHION
  P('Essential Organic Tee','fashion','Nova Basics',29,39,4.5,980,200,{colors:['Black','White','Navy','Beige'],sizes:['S','M','L','XL'],isBestSeller:true,tags:['organic']}),
  P('Heritage Denim Jacket','fashion','RivetCo',89,129,4.7,540,45,{colors:['Blue','Black'],sizes:['S','M','L','XL'],tags:['denim']}),
  P('Featherlight Puffer Coat','fashion','Northpeak',159,219,4.8,320,30,{colors:['Navy','Black','Red'],sizes:['S','M','L','XL'],isNew:true,tags:['winter']}),
  P('Tailored Chino Trousers','fashion','Nova Basics',69,0,4.4,410,90,{colors:['Beige','Navy','Black'],sizes:['30','32','34','36']}),
  P('Merino Wool Sweater','fashion','Highland',99,139,4.7,275,55,{colors:['Gray','Navy','Brown'],sizes:['S','M','L','XL'],isBestSeller:true,tags:['wool']}),
  P('City Bomber Jacket','fashion','RivetCo',119,0,4.5,190,40,{colors:['Black','Green'],sizes:['S','M','L','XL'],isNew:true}),
  P('Linen Summer Shirt','fashion','Nova Basics',49,69,4.3,360,120,{colors:['White','Beige','Blue'],sizes:['S','M','L','XL']}),
  // SHOES
  P('Velocity Running Shoes','shoes','Stride',129,169,4.8,2400,60,{colors:['Black','Red','White'],sizes:['7','8','9','10','11','12'],isBestSeller:true,tags:['running']}),
  P('Court Classic Sneakers','shoes','Stride',89,0,4.6,1520,110,{colors:['White','Black'],sizes:['7','8','9','10','11'],isBestSeller:true,tags:['casual']}),
  P('Trailblazer Hiking Boots','shoes','Summit',179,229,4.7,430,35,{colors:['Brown','Black'],sizes:['8','9','10','11','12'],isNew:true,tags:['outdoor']}),
  P('Glide Basketball Shoes','shoes','Stride',149,199,4.5,610,48,{colors:['Blue','Black','White'],sizes:['8','9','10','11','12'],tags:['sport']}),
  P('Softstep Leather Loafers','shoes','Verona',139,0,4.4,280,42,{colors:['Brown','Black'],sizes:['7','8','9','10','11']}),
  // WATCHES
  P('Chrono Steel Watch','watches','Meridian',249,349,4.9,880,20,{colors:['Silver','Gold'],isBestSeller:true,tags:['automatic']}),
  P('Minimal Quartz Watch','watches','Meridian',149,0,4.6,640,55,{colors:['Black','White','Gold'],isNew:true}),
  P('Diver 200m Watch','watches','Abyss',329,449,4.8,320,18,{colors:['Blue','Black'],tags:['waterproof'],isBestSeller:true}),
  P('Smart Fitness Watch','watches','PulseTech',199,259,4.5,1900,70,{colors:['Black','Silver','Pink'],isBestSeller:true,tags:['gps','health']}),
  P('Heritage Leather Watch','watches','Meridian',189,0,4.7,410,40,{colors:['Brown','Black'],tags:['leather']}),
  // HOME
  P('Nordic 3-Seat Sofa','home','Lumen',899,1199,4.7,210,10,{colors:['Beige','Gray','Green'],isBestSeller:true,tags:['furniture']}),
  P('Ergo Lounge Chair','home','Lumen',349,459,4.6,340,24,{colors:['Beige','Brown','Black'],isNew:true}),
  P('Ambient Floor Lamp','home','Glowhaus',89,119,4.4,520,65,{colors:['White','Black'],tags:['lighting']}),
  P('Ceramic Dinner Set (16pc)','home','Terra',129,0,4.8,300,50,{colors:['White','Beige'],isBestSeller:true,tags:['kitchen']}),
  P('Woven Area Rug 5x8','home','Terra',159,199,4.5,180,30,{colors:['Beige','Gray','Blue'],isNew:true}),
  // BEAUTY
  P('Radiance Vitamin C Serum','beauty','Lueur',49,69,4.8,3200,150,{colors:[],isBestSeller:true,tags:['skincare']}),
  P('Velvet Matte Lipstick','beauty','Lueur',24,0,4.6,2100,220,{colors:['Red','Pink','Beige'],isBestSeller:true,tags:['makeup']}),
  P('Noir Eau de Parfum','beauty','Maison Noir',119,159,4.9,760,60,{colors:[],isNew:true,tags:['fragrance']}),
  P('Hydra Glow Moisturizer','beauty','Lueur',39,0,4.7,1400,180,{colors:[],tags:['skincare']}),
  P('Pro Makeup Brush Set','beauty','Lueur',59,79,4.5,890,130,{colors:[],isBestSeller:true,tags:['tools']}),
  // SPORTS
  P('Pro Yoga Mat 6mm','sports','FlowFit',59,79,4.7,1500,140,{colors:['Purple','Blue','Green'],isBestSeller:true,tags:['yoga']}),
  P('Adjustable Dumbbell Set','sports','IronCore',249,329,4.8,420,25,{colors:['Black'],isNew:true,tags:['strength']}),
  P('Hydro Insulated Bottle 1L','sports','FlowFit',34,0,4.6,2600,300,{colors:['Black','Blue','Pink'],isBestSeller:true,tags:['hydration']}),
  P('Carbon Road Bike Helmet','sports','Summit',129,169,4.5,310,40,{colors:['White','Black','Red'],sizes:['S','M','L'],tags:['cycling']}),
  P('Resistance Bands Kit','sports','IronCore',29,45,4.4,1900,260,{colors:['Black'],tags:['home-gym'],isNew:true}),
  P('Trail Running Backpack 12L','sports','Summit',89,0,4.6,260,55,{colors:['Green','Black','Blue'],isNew:true,tags:['trail']})
];

export const getProduct = (id) => PRODUCTS.find((p) => p.id === Number(id));
export const byCategory = (cat) => PRODUCTS.filter((p) => p.category === cat);
export const bestSellers = () => PRODUCTS.filter((p) => p.isBestSeller);
export const newArrivals = () => PRODUCTS.filter((p) => p.isNew);
export const featured = () => PRODUCTS.filter((p) => p.rating >= 4.7);
