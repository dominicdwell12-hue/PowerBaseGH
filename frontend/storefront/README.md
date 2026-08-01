# PowerBase Gh — Storefront

Customer-facing React app. See `../../04-api-endpoints.md` for the API this
app consumes and `../../05-wireframes.md` for screen layouts.

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your running backend
npm run dev
```

## Design tokens

Colors, fonts, and the signature `.price-tag` element are defined in
`tailwind.config.js` and `src/styles/index.css`. Palette: ink (deep
indigo, nav/footer), gold (primary CTA + price tags), forest (in-stock /
confirmed states), brick (discounts / destructive actions), paper (app
background). Fonts: Sora (display), Inter (body), IBM Plex Mono (prices).
The admin app shares this same token set for visual consistency between
the two frontends (see `05-wireframes.md` → Design Direction).

## Implemented so far

Every page is wired to the real backend — no mock data remains anywhere
in this app.

**Data layer**
- `src/api/axiosClient.js` — base URL + cookie credentials, and a real
  refresh-on-401 flow: a bare axios instance handles the refresh call
  itself (avoids interceptor recursion), concurrent 401s share one
  in-flight refresh, and a `setSessionExpiredHandler` lets `AuthContext`
  clear state if the refresh cookie itself is dead.
- `src/api/*.js` — one file per backend module (`authApi`, `userApi`,
  `productApi`, `categoryApi`, `cartApi`, `wishlistApi`, `deliveryApi`,
  `orderApi`, `paymentApi`). Every function was checked against the
  actual controller/service code and Prisma schema, not just
  `04-api-endpoints.md` — e.g. product images use `imageUrl`, not `url`;
  `discountPrice` (when present) is the amount actually charged, `price`
  is the strike-through original.
- **`AuthContext`** — real login/register/logout, plus a silent-refresh
  bootstrap on load (trades a lingering refresh cookie for a fresh
  access token before deciding someone's logged out).
- **`useCart`** / **`useWishlist`** — React Query hooks (`['cart']` /
  `['wishlist']` cache keys) instead of a separate Context. Every
  mutation writes the server's returned cart/wishlist straight back into
  the cache, so the Navbar's count badge, Cart, Wishlist, and Checkout
  all stay in sync automatically.
- `main.jsx` wraps the app in `QueryClientProvider`.

**Shared UI**: `Skeleton` / `ProductGridSkeleton`, `ErrorState` (retry
button), `StatusBadge` (order status colors), `QuantityStepper`,
`FormField`, `Pagination`, `FilterSidebar`, `AddressForm` (shared by
Checkout and Profile's address book).

**Pages** — each with a loading skeleton/spinner and an error state with
retry, driven by React Query:
- **Home** — real `/categories` + `/products/featured`.
- **Product Listing** — filters/search/sort/page live in the URL
  (`useSearchParams`), so it's shareable/bookmarkable and works with the
  browser back button; hits `GET /products` with `keepPreviousData` so
  pagination doesn't flash blank.
- **Product Details** — image gallery, add-to-cart/wishlist (redirects
  to `/login` if signed out, preserving the return path), related
  products.
- **Cart** — quantity steppers, per-item availability/stock warnings,
  blocks checkout while any line is unavailable.
- **Checkout** — address book with inline "add new address", live
  pay-on-delivery eligibility check per selected address's city
  (`GET /delivery/zones/:cityId/pod-check`), payment method selection,
  order placement, then either straight to confirmation (POD) or
  `POST /payments/initialize` + redirect to the gateway's
  `authorizationUrl` (online payment). Note: the customer-facing
  `paymentMethod` ('card'/'mobile_money') and the payment gateway
  `provider` ('paystack'/'flutterwave') are separate concerns in this
  API — this page maps card→Paystack, Mobile Money→Flutterwave, a
  frontend decision since the backend doesn't dictate one.
- **Order Confirmation / History / Tracking** — tracking renders a
  timeline against the same status list the backend's state machine
  enforces; History supports cancelling orders still in a cancellable
  status.
- **Wishlist**, **Profile** (account details, change password — signs
  the person out afterward since the backend invalidates their refresh
  token, full address book CRUD), **Login**, **Register**.

**Backend fix made while wiring this up:** `order.service.js`'s
`serializeOrder` never returned the order's numeric `id`, only
`orderNumber` — but `POST /payments/initialize` needs that `id`. Added
it; see `backend/README.md` for details.

## Not yet built

The admin dashboard (`frontend/admin/`) hasn't been started.
