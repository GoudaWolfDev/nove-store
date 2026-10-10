import { safeStore, round2, uid } from './utils.js';

const KEYS = {
  cart: 'nova_cart', saved: 'nova_saved', wishlist: 'nova_wishlist', compare: 'nova_compare',
  users: 'nova_users', session: 'nova_session', orders: 'nova_orders', addresses: 'nova_addresses',
  reviews: 'nova_reviews', coupon: 'nova_coupon', recent: 'nova_recent', theme: 'nova_theme',
  lang: 'nova_lang', currency: 'nova_currency', cookie: 'nova_cookie', newsletter: 'nova_newsletter'
};

const state = {
  cart: safeStore.get(KEYS.cart, []),
  saved: safeStore.get(KEYS.saved, []),
  wishlist: safeStore.get(KEYS.wishlist, []),
  compare: safeStore.get(KEYS.compare, [])
};

/** Persist a list and broadcast a change event. */
function persist(key, value, area) {
  safeStore.set(KEYS[key], value);
  window.dispatchEvent(new CustomEvent('nova:change', { detail: { area } }));
}

export const store = {
  KEY: (k) => KEYS[k],

  /* ---------------- Cart ---------------- */
  itemKey: (id, color = '', size = '') => `${id}__${color}__${size}`,
  getCart: () => state.cart,
  cartCount() { return state.cart.reduce((s, i) => s + i.qty, 0); },
  cartSubtotal() { return round2(state.cart.reduce((s, i) => s + i.price * i.qty, 0)); },
  addToCart(product, qty = 1, color = '', size = '') {
    const key = this.itemKey(product.id, color, size);
    const found = state.cart.find((i) => i.key === key);
    if (found) found.qty = Math.min(found.qty + qty, product.stock || 99);
    else state.cart.push({ key, id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.images[0], color, size, qty: Math.min(qty, product.stock || 99), stock: product.stock });
    persist('cart', state.cart, 'cart');
  },
  updateQty(key, qty) {
    const it = state.cart.find((i) => i.key === key);
    if (!it) return;
    it.qty = Math.max(1, Math.min(qty, it.stock || 99));
    persist('cart', state.cart, 'cart');
  },
  removeItem(key) {
    state.cart = state.cart.filter((i) => i.key !== key);
    persist('cart', state.cart, 'cart');
  },
  clearCart() { state.cart = []; persist('cart', state.cart, 'cart'); },
  moveToSaved(key) {
    const it = state.cart.find((i) => i.key === key);
    if (!it) return;
    state.cart = state.cart.filter((i) => i.key !== key);
    if (!state.saved.find((s) => s.key === key)) state.saved.push(it);
    persist('cart', state.cart, 'cart');
    persist('saved', state.saved, 'saved');
  },
  getSaved: () => state.saved,
  moveToCart(key) {
    const it = state.saved.find((i) => i.key === key);
    if (!it) return;
    state.saved = state.saved.filter((i) => i.key !== key);
    if (!state.cart.find((c) => c.key === key)) state.cart.push(it);
    persist('saved', state.saved, 'saved');
    persist('cart', state.cart, 'cart');
  },
  removeSaved(key) { state.saved = state.saved.filter((i) => i.key !== key); persist('saved', state.saved, 'saved'); },

  /* ---------------- Wishlist ---------------- */
  getWishlist: () => state.wishlist,
  wishlistCount: () => state.wishlist.length,
  isWishlisted: (id) => state.wishlist.includes(Number(id)),
  toggleWishlist(id) {
    id = Number(id);
    const idx = state.wishlist.indexOf(id);
    if (idx > -1) state.wishlist.splice(idx, 1); else state.wishlist.push(id);
    persist('wishlist', state.wishlist, 'wishlist');
    return idx === -1;
  },

  /* ---------------- Compare ---------------- */
  getCompare: () => state.compare,
  toggleCompare(id, limit = 3) {
    id = Number(id);
    const idx = state.compare.indexOf(id);
    if (idx > -1) state.compare.splice(idx, 1);
    else if (state.compare.length >= limit) return false;
    else state.compare.push(id);
    persist('compare', state.compare, 'compare');
    return true;
  },
  clearCompare() { state.compare = []; persist('compare', state.compare, 'compare'); },

  /* ---------------- Coupon ---------------- */
  getCoupon: () => safeStore.get(KEYS.coupon, null),
  setCoupon: (c) => persist('coupon', c, 'coupon'),
  clearCoupon: () => persist('coupon', null, 'coupon'),

  /* ---------------- Recently viewed ---------------- */
  getRecent: () => safeStore.get(KEYS.recent, []),
  addRecent(id) {
    let list = safeStore.get(KEYS.recent, []).filter((x) => x !== Number(id));
    list.unshift(Number(id));
    list = list.slice(0, 8);
    safeStore.set(KEYS.recent, list);
  },

  /* ---------------- Reviews ---------------- */
  getReviews: (productId) => safeStore.get(KEYS.reviews, {})[productId] || [],
  addReview(productId, review) {
    const all = safeStore.get(KEYS.reviews, {});
    all[productId] = [review, ...(all[productId] || [])];
    persist('reviews', all, 'reviews');
  },

  /* ---------------- Auth ---------------- */
  getUsers: () => safeStore.get(KEYS.users, []),
  currentUser() { return safeStore.get(KEYS.session, null); },
  isLoggedIn() { return !!this.currentUser(); },
  register({ firstName, lastName, email, password, remember }) {
    const users = this.getUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) return { ok: false, error: 'emailExists' };
    const user = { id: uid('u'), firstName, lastName, email, password, joined: Date.now() };
    users.push(user);
    safeStore.set(KEYS.users, users);
    this._session(user, remember);
    return { ok: true, user };
  },
  login({ email, password, remember }) {
    const user = this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { ok: false, error: 'badCreds' };
    this._session(user, remember);
    return { ok: true, user };
  },
  _session(user, remember) {
    const data = { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, remember: !!remember };
    safeStore.set(KEYS.session, remember ? data : data);
    window.dispatchEvent(new CustomEvent('nova:change', { detail: { area: 'auth' } }));
  },
  logout() {
    safeStore.set(KEYS.session, null);
    window.dispatchEvent(new CustomEvent('nova:change', { detail: { area: 'auth' } }));
  },
  updateProfile(patch) {
    const session = this.currentUser();
    if (!session) return;
    const users = this.getUsers();
    const u = users.find((x) => x.id === session.id);
    if (u) { Object.assign(u, patch); safeStore.set(KEYS.users, users); }
    Object.assign(session, patch);
    safeStore.set(KEYS.session, session);
    window.dispatchEvent(new CustomEvent('nova:change', { detail: { area: 'auth' } }));
  },

  /* ---------------- Orders ---------------- */
  getOrders: () => safeStore.get(KEYS.orders, []),
  addOrder(order) {
    const orders = this.getOrders();
    orders.unshift(order);
    safeStore.set(KEYS.orders, orders);
    return order;
  },
  getOrder: (number) => safeStore.get(KEYS.orders, []).find((o) => o.number === number),

  /* ---------------- Addresses ---------------- */
  getAddresses: () => safeStore.get(KEYS.addresses, []),
  addAddress(addr) {
    const list = this.getAddresses();
    addr.id = uid('a');
    if (addr.isDefault) list.forEach((a) => (a.isDefault = false));
    list.push(addr);
    safeStore.set(KEYS.addresses, list);
    window.dispatchEvent(new CustomEvent('nova:change', { detail: { area: 'addresses' } }));
    return addr;
  },
  removeAddress(id) {
    safeStore.set(KEYS.addresses, this.getAddresses().filter((a) => a.id !== id));
    window.dispatchEvent(new CustomEvent('nova:change', { detail: { area: 'addresses' } }));
  },

  /* ---------------- Settings ---------------- */
  getSetting: (k, fallback) => safeStore.get(KEYS[k], fallback),
  setSetting: (k, v) => { safeStore.set(KEYS[k], v); window.dispatchEvent(new CustomEvent('nova:change', { detail: { area: 'settings' } })); },

  /** Re-sync cart from storage (cross-tab). */
  syncFromStorage() {
    state.cart = safeStore.get(KEYS.cart, []);
    state.saved = safeStore.get(KEYS.saved, []);
    state.wishlist = safeStore.get(KEYS.wishlist, []);
    state.compare = safeStore.get(KEYS.compare, []);
    window.dispatchEvent(new CustomEvent('nova:change', { detail: { area: 'sync' } }));
  }
};

window.addEventListener('storage', (e) => {
  if (e.key && Object.values(KEYS).includes(e.key)) store.syncFromStorage();
});
