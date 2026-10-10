const U = 'https://images.unsplash.com/';
/** Build a responsive Unsplash URL from a photo id. */
export const unsplash = (id, w = 800) => `${U}${id}?w=${w}&q=80&auto=format&fit=crop`;
export const fallback = (seed, w = 800) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${w}`;

const POOLS = {
  electronics: ['photo-1505740420928-5e560c06d30e','photo-1511707171634-5f897ff02aa9','photo-1546435770-a3e426bf472b','photo-1484704849700-f032a568e944','photo-1498049794561-7780e7231661','photo-1517336714731-489689fd1ca8'],
  fashion: ['photo-1521572163474-6864f9cf17ab','photo-1542272604-787c3835535d','photo-1434389677669-e08b4cac3105','photo-1591047139829-d91aecb6caea','photo-1483985988355-763728e1935b','photo-1490481651871-ab68de25d43d'],
  shoes: ['photo-1542291026-7eec264c27ff','photo-1600185365483-26d7a4cc7519','photo-1595950653106-6c9ebd614d3a','photo-1549298916-b41d501d3772','photo-1606107557195-0e29a4b5b4aa','photo-1552346154-21d32810aba3'],
  watches: ['photo-1523275335684-37898b6baf30','photo-1524592094714-0f0654e20314','photo-1547996160-81dfa63595aa','photo-1508057198894-247b23fe5ade','photo-1434056886845-dac89ffe9b56'],
  home: ['photo-1555041469-a586c61ea9bc','photo-1567538096630-e0c55bd6374c','photo-1586023492125-27b2c045efd7','photo-1493663284031-b7e3aefcae8e','photo-1513694203232-719a280e022f'],
  beauty: ['photo-1596462502278-27bfdc403348','photo-1522335789203-aabd1fc54bc9','photo-1512496015851-a90fb38ba796','photo-1571781926291-c477ebfd024b','photo-1526947425960-945c6e72858f'],
  sports: ['photo-1517649763962-0c623066013b','photo-1461896836934-ffe607ba8211','photo-1571019613454-1cb2f99b2d8b','photo-1534438327276-14e5300c3a48','photo-1552674605-db6ffd4facb5']
};

/** Return 4 images for a product using its category pool. */
export function imgsFor(category, seed) {
  const pool = POOLS[category] || POOLS.fashion;
  const start = (typeof seed === 'number' ? seed : String(seed).length) % pool.length;
  return [0, 1, 2, 3].map((k) => unsplash(pool[(start + k) % pool.length], 800));
}
