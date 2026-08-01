# PowerBase Gh — UI Wireframes
**Step 5 of 6 — Wireframe Reference**

Low-fidelity layouts shown inline in this conversation. Written reference below for each screen.

---

## Storefront

### Home
Navbar (logo, search bar, cart icon, account menu) → hero banner/carousel → category tiles grid → featured products grid → footer.

### Product listing
Left sidebar: category filter, price range, brand filter. Main area: sort bar (price/newest/rating) + paginated product card grid. Mobile: filters collapse into a slide-out drawer.

### Product detail
Left: image gallery with thumbnail strip. Right: name, price (with discount strike-through if applicable), stock status, quantity selector, "Add to cart" + "Add to wishlist" buttons. Below: description/specs tabs, related products carousel.

### Cart
List of cart items (image, name, price, quantity stepper, remove), order subtotal, "Proceed to checkout" button.

### Checkout
Step 1: select/add delivery address (city selection triggers automatic Pay-on-Delivery eligibility check). Step 2: payment method selector (shows "Pay on Delivery" only if eligible; otherwise card/Mobile Money only). Step 3: order summary + confirm.

### Order history / tracking
List of past orders with status badges; detail view shows a vertical timeline matching the order status flow (Pending → Confirmed → Packed → Shipped → Out for Delivery → Delivered), pulled from `order_status_history`.

### Wishlist & Profile
Simple grid of saved products; profile page with editable name/email/phone, saved addresses list, password change form.

---

## Admin Dashboard

### Dashboard overview
Top stat cards: total sales, orders today, total customers, low-stock alerts. Below: sales trend chart + recent orders table snippet.

### Product management
Table view: thumbnail, name, category, price, stock, status, actions (edit/delete). "Add product" opens a form with multi-image upload (drag-and-drop → Cloudinary), category dropdown, price/stock fields.

### Category management
Simple table + form for name, slug, parent category, image.

### Order management
Filterable table (status, date range, payment status). Row click opens order detail with items, customer info, address, and a status-update dropdown constrained to valid next states in the order lifecycle.

### Customer management
Searchable table of customers with order count and total spend; detail view shows order history.

### Sales reports
Date-range filter, revenue chart, top-selling products table, CSV export button.

---

## Design Direction

- **Style:** Clean, modern, product-forward — similar visual density to Jumia (card-based grids, bold category navigation, prominent pricing/discount badges).
- **Mobile-first:** All storefront layouts collapse gracefully — filters become drawers, multi-column grids become 2-column or single-column on small screens.
- **Consistency:** Shared button/badge/input styles between storefront and admin via a common Tailwind config, even though they're separate apps.

---

## What's Next (Step 6)

With architecture, schema, folder structure, API design, and wireframes approved, we move into **implementation** — one feature at a time, starting with **project setup + authentication (register/login/JWT)** as the foundation everything else builds on, unless you'd prefer a different starting feature.
