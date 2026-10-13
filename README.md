# NOVA - Modern Shopping, Elevated

> A complete, professional, fully responsive e-commerce front-end built with **only** HTML5, CSS3 and Vanilla JavaScript (ES6 modules). No frameworks, no build tools, no backend, no npm.

![NOVA Banner](https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80&auto=format&fit=crop)

**Live Demo:** _https://goudawolfdev.github.io/nova-store/_ (placeholder)

---

## Features

- **12 pages:** Home, Shop, Product, Cart, Checkout (4-step wizard), Wishlist, Login/Register, Account, Contact, About, Order Success, 404.
- **Premium UI:** soft shadows, 12-16px radii, whitespace, smooth micro-interactions, glassy sticky header.
- **Dark / Light mode** with `localStorage` + `prefers-color-scheme`.
- **Bilingual EN / AR** with full RTL support and a translations dictionary.
- **Multi-currency** USD / EGP / EUR switcher (static rates).
- **Rotating announcement bar**, live search with autocomplete, mega-menu, mini-cart slide-over.
- **Home:** hero slider (autoplay, arrows, dots, swipe), category cards, flash sale with live countdown, tabs, promos, brand marquee, testimonials, Instagram gallery, scroll reveal.
- **Shop:** filters (category, price, brand, rating, color, size, availability, on-sale), sort, grid/list, load-more, URL-synced state, active filter chips.
- **Product:** gallery with lightbox + magnifier, variant selectors with validation, reviews with breakdown + add-review form, related + recently viewed, sticky mobile buy bar, JSON-LD schema.
- **Cart & Checkout:** coupons (`NOVA10`, `FREESHIP`), free-shipping progress, save-for-later, 4-step wizard with Luhn card validation, order history.
- **Auth (simulated):** register/login, password strength meter, remember me, guest checkout.
- **Extras:** compare (up to 3), toast system, quick view modal, cookie banner, page loader, breadcrumbs, PWA (manifest + service worker).
- **Accessibility:** keyboard nav, ARIA, visible focus, skip link, reduced-motion support.
- **SEO:** semantic HTML, meta + Open Graph, favicon.

## Tech Stack

- HTML5, CSS3 (custom properties, Grid, Flexbox, `clamp()`)
- Vanilla JavaScript ES6 modules
- Google Fonts (Poppins / Cairo) + Font Awesome 6 (CDN)
- LocalStorage for persistence (cart, wishlist, auth, orders, theme, language)

## Folder Tree

```
nova-store/
├── index.html          shop.html           product.html
├── cart.html           checkout.html       wishlist.html
├── login.html          account.html        contact.html
├── about.html          order-success.html  404.html
├── manifest.json       sw.js
├── README.md           LICENSE             .gitignore
└── assets/
    ├── css/  (variables, base, layout, components, pages, responsive, rtl, dark)
    ├── img/  (favicon.svg, logo.svg)
    └── js/
        ├── data/       (products, categories, translations, images)
        ├── core/       (config, store, utils, i18n, theme, currency, totals)
        ├── components/ (header, footer, cart-drawer, toast, modal, slider, countdown, product-card)
        ├── pages/      (home, shop, product, cart, checkout, auth, account, wishlist, contact, about, order-success, notfound)
        └── main.js
```

## Run Locally

ES modules require a local server (opening `index.html` directly will block module loading due to browser CORS rules).

1. Install the **Live Server** extension in VS Code, right-click `index.html`, choose **Open with Live Server**.
2. Or use any static server:

```bash
# Python 3
python -m http.server 5500

# Node.js
npx serve .
```

Then open `http://localhost:5500`.

## Deploy to GitHub Pages

```bash
# Initialise and push
git init
git add .
git commit -m "feat: initial NOVA store"
git branch -M main
git remote add origin https://github.com/<your-username>/nova-store.git
git push -u origin main
```

Then in the repository: **Settings > Pages > Source: Deploy from a branch > `main` / `root`**. Your site will be live at `https://<your-username>.github.io/nova-store/`.

## Customisation

Edit `assets/js/core/config.js` (brand name, currencies, tax, shipping, coupons, social links) and `assets/css/variables.css` (colors, spacing, radii, shadows, fonts). Update the product catalogue in `assets/js/data/products.js`.

## Screenshots

| Home | Shop | Product |
| --- | --- | --- |
| _placeholder_ | _placeholder_ | _placeholder_ |

## Roadmap

- [ ] Real backend / REST API integration
- [ ] Product recommendations engine
- [ ] Multi-image zoom on mobile
- [ ] Loyalty points and referrals
- [ ] Order tracking integration

## License

Released under the [MIT License](LICENSE).

## Author

**NOVA Team** - Built for the MonkeyCode AI Smart Development Platform.
