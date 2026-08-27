# Arcvan Ghana Limited — Backend API

## Setup

1. Install dependencies:
   npm install

2. Copy environment file and fill in your values:
   cp .env.example .env

3. Set up the database (requires a running MySQL instance):
   npx prisma migrate dev --name init
   npm run seed

4. Start the dev server:
   npm run dev

The API runs at http://localhost:5000/api/v1 by default. Health check: GET /health

## Seeded accounts (from `npm run seed`)

- Admin login: admin@powerbase.gh (identifier unchanged — see seed.js note) / ChangeMe123! (change this immediately)
- Delivery zones: Kumasi (Pay on Delivery enabled), plus Accra, Tamale, Takoradi, Cape Coast (prepay only)

## Implemented so far (Step 6, features 1-2 of many)

**Feature 1 — Project setup + auth**
- Full Prisma schema matching the approved database design (Step 2), vendor-ready for future multi-vendor expansion
- Auth module: register, login, admin login, refresh token (httpOnly cookie rotation), logout, /me
- JWT middleware (`authenticate`) + role guard (`requireRole('admin')`) reusable by every future module
- Centralized error handling, request validation (Zod), rate limiting on login

**Feature 2 — Products + categories**
- Public: `GET /products` (search/filter/sort/pagination), `/products/featured`, `/products/:slug`, `/products/:slug/related`
- Public: `GET /categories` (nested tree), `/categories/:slug` (with paginated products)
- Admin CRUD for both products and categories, including multi-image upload to Cloudinary (`multer` in-memory → Cloudinary stream upload), primary-image selection, and stock updates
- Soft-delete on products (preserves order history integrity — see Step 2 notes)
- Auto-generated unique slugs and SKU/category validation on create

**Feature 3 — Cart + wishlist**
- `GET/POST/PUT/DELETE /api/v1/cart` and `/cart/items/:itemId` — one cart per customer, created lazily on first add
- Cart items snapshot `priceAtAdd` (uses `discountPrice` if the product has one) but the response also returns each item's live `currentPrice`, `isAvailable`, and `inStock` flags so the frontend can flag stale prices or out-of-stock items before checkout without a second request
- Adding an item that's already in the cart increases its quantity (capped at available stock) instead of creating a duplicate row
- `GET/POST/DELETE /api/v1/wishlist` — simple save/remove, protected by the same `(userId, productId)` unique constraint from the schema so duplicate adds are a no-op, not an error
- Both modules are customer-only (`requireRole('customer')`), matching the auth pattern used everywhere else

**Feature 4 — Delivery zones + checkout/orders**
- `GET /api/v1/delivery/zones` and `/delivery/zones/:cityId/pod-check` — public, used to populate the city picker and grey out "Pay on Delivery" live as the customer selects a city, before they ever hit submit
- `POST /api/v1/orders` is the actual checkout: it re-validates the chosen address's delivery zone server-side and rejects `pay_on_delivery` for any city other than Kumasi with a 422 — the frontend's pod-check is just a UX nicety, this is the real enforcement
- Checkout re-checks every cart line against the live product (price, stock, active/deleted) instead of trusting the cart's cached `priceAtAdd`, since time can pass between adding to cart and paying
- Order creation, stock decrement, and cart clearing happen inside one Prisma transaction so a failure partway through can't leave stock reserved without an order, or an order without reserved stock
- `GET /orders`, `/orders/:orderNumber`, `/orders/:orderNumber/tracking`, `PUT /orders/:orderNumber/cancel` — cancellation is only allowed while status is `Pending`/`Confirmed` and releases the reserved stock back to inventory
- Every order status change (placed, cancelled, and later admin-driven updates) is appended to `OrderStatusHistory`, which is what the tracking timeline reads from
- **Fix (found while wiring the storefront checkout page):** `serializeOrder` never returned `order.id`, only `orderNumber` — every other endpoint correctly looks orders up by `orderNumber`, but `POST /payments/initialize` needs the numeric `orderId`, which the frontend had no way to get. Added `id` to the serialized shape.

**Feature 5 — Users/Profile + Address book**
- `GET/PUT /api/v1/users/profile`, `PUT /users/change-password` — email/phone uniqueness re-checked on update; changing the password also clears the stored refresh token hash, forcing re-login everywhere
- `GET/POST/PUT/DELETE /api/v1/users/addresses`, `PUT /addresses/:id/default` — this unblocks checkout: `POST /orders` needs an `addressId`, and until now there was no way for a customer to create one
- The first address a customer saves is auto-marked default (checkout needs something to preselect); saving a new default, or explicitly setting one, unmarks the previous default in the same transaction
- Deleting an address that's referenced by a past order is blocked with a 409 instead of hitting the DB's foreign-key constraint — if the default address is deleted, the most recently added remaining one is promoted automatically

**Feature 6 — Payments (Paystack + Flutterwave)**
- `POST /api/v1/payments/initialize` — starts a checkout session with whichever gateway the customer picked; blocked for `pay_on_delivery` orders (nothing to pay online) and for orders already marked paid
- `GET /payments/verify/:reference` — called when the gateway redirects the browser back; re-checks status directly with the provider rather than trusting the URL parameters, and is idempotent (a payment already marked successful isn't re-verified against the gateway)
- `POST /payments/webhook/paystack` and `/webhook/flutterwave` — the authoritative path, independent of whether the customer's browser makes it back to the redirect page. Paystack is verified via HMAC-SHA512 over the *raw* request body against `x-paystack-signature`; Flutterwave via the `verif-hash` header against a dashboard-configured secret. Both reject with 401 on a bad/missing signature before touching the database.
- `app.js` now captures the raw request buffer alongside the parsed JSON body (`req.rawBody`) specifically so the Paystack signature check has the exact bytes that were signed — re-serializing the parsed object would break verification
- A successful payment moves the order from `Pending` → `Confirmed` automatically and is logged to `OrderStatusHistory`; a failed one marks `paymentStatus: failed` and leaves the order in place so the customer can retry
- New env vars: `FLUTTERWAVE_WEBHOOK_HASH` (separate from the API secret key — set in the Flutterwave dashboard) and `PAYMENT_CALLBACK_URL` (where the gateway redirects back to)

**Feature 7 — Admin Order Management**
- `GET /api/v1/admin/orders` — filters by `status`, `paymentStatus`, `dateFrom`/`dateTo`, plus a `search` across order number and customer name/email
- `GET /admin/orders/:orderNumber` — full detail including the customer's name/email/phone (the customer-facing endpoints never expose this)
- `PUT /admin/orders/:orderNumber/status` — the actual state machine: `Pending → Confirmed → Packed → Shipped → Out_for_Delivery → Delivered`, with `Cancelled` reachable from any non-terminal state. Skipping stages or moving backward is rejected with a 422 that names the valid next states; `Delivered`/`Cancelled` are terminal.
- Cancelling from the admin side reuses the same stock-release logic as customer-initiated cancellation (`restockOrderItems`, factored out so both paths can't drift)
- This is the one module so far tested with actual mocked business logic (not just route wiring) — the transition table, illegal-skip rejection, terminal-state lockout, and stock restock were all verified against a mocked Prisma client, since it's the part most likely to hide a real bug

**Feature 8 — Admin Customer Management**
- `GET /api/v1/admin/customers` — search by name/email/phone, filter by active/inactive, each row includes an order count
- `GET /admin/customers/:id` — profile + lifetime stats (`totalOrders`, `totalSpent` — spend only counts `paymentStatus: paid` orders, so cancelled/pending orders don't inflate it) + the 20 most recent orders
- `PUT /admin/customers/:id/status` — activate/deactivate. Confirmed while building this that `auth.middleware.js` already rejects `isActive: false` users on every request (not just at login), so deactivating actually cuts off an in-progress session immediately, and now also explicitly clears the stored refresh token so a lingering access token can't be silently renewed after expiry.
- Every query in this module is scoped to `role: { name: 'customer' }` — confirmed with a mocked-Prisma test that trying to manage an admin account through this endpoint 404s rather than silently succeeding

**Feature 9 — Admin Delivery Zone Management**
- `GET /api/v1/admin/delivery-zones` — all zones incl. inactive (`?status=active/inactive/all`), unlike the public list which only ever shows active ones
- `POST/PUT /admin/delivery-zones` — create/update, with `cityName` uniqueness enforced (excluding the zone's own current name, so a no-op rename doesn't false-positive as a conflict)
- `DELETE /admin/delivery-zones/:id` — **deactivates**, does not hard-delete. A zone is referenced by addresses and past orders, so removing the row would break their history; `isActive: false` is picked up immediately by the same check `order.service.js::createOrder` already uses, so a deactivated city stops accepting new orders right away without touching any other code
- This is where an admin flips `payOnDeliveryEnabled` per city — deliberately left admin-configurable rather than hardcoded to Kumasi-only in this module, since the actual enforcement always reads the flag live from the order's address at checkout time; this CRUD is just how that flag gets set
- Fixed a small inconsistency while in this file: `deliveryFee` (a Prisma `Decimal`) is now explicitly converted with `Number()` before being returned, matching every other module — previously it would have serialized as a string
- Tested with a mocked-Prisma logic test: duplicate city name rejected, self-rename allowed, deactivate confirmed to flip the flag without removing the row, and the public/admin list scoping (active-only vs. all) verified to actually differ

**Feature 10 — Admin Dashboard & Reports**
- Built while wiring the admin frontend — this was the one backend module left as a placeholder (`app.js` had a literal "mounted here later" comment where these routes now live)
- `GET /api/v1/admin/dashboard/summary` — total sales (paid orders only, same rule as a customer's lifetime spend in `customer.service.js`), orders placed today, a low-stock list (≤5 units, matching the storefront's own low-stock threshold), and new customers in the last 7 days
- `GET /admin/reports/sales?period=daily|weekly|monthly&dateFrom=&dateTo=` — buckets paid orders by day/ISO week/month in application code rather than a DB-specific date-truncation function, so it isn't tied to one database engine
- `GET /admin/reports/top-products` — best sellers by quantity, via `orderItem.groupBy`
- `GET /admin/reports/export` — same sales data as CSV (RFC 4180 quoting for any field with a comma/quote/newline)
- Verified with `node --check` on every new file, plus a full `require()` of `app.js` with dummy env vars — resolved every route/controller/service/validation import cleanly and only stopped at Prisma's engine binary download, which needs network access this sandbox doesn't have. Not a code issue; run `npx prisma generate` with normal network access before starting the server.

## Next up

The React + Tailwind frontend — see `frontend/storefront/README.md` and `frontend/admin/README.md`.
