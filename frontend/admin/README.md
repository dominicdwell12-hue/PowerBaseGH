# Arcvan Ghana Limited — Admin Dashboard

Internal dashboard for managing products, categories, orders, customers,
and delivery zones. See `../../04-api-endpoints.md` for the full API and
`../storefront/README.md` for the customer-facing app this manages.

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your running backend
npm run dev            # runs on :5174 so it can run alongside the storefront (:5173)
```

Sign in with a user whose role is `admin` (seed one via the backend, or
promote an existing user's `roleId` directly in the database — there's no
self-serve admin signup by design).

## Design tokens

Same palette/type/tokens as the storefront (`tailwind.config.js`,
`src/styles/index.css`) — ink, gold, forest, brick, paper; Sora, Inter,
IBM Plex Mono — for visual consistency between the two frontends.

## Implemented

**Data layer** — `src/api/*.js`: `authApi` (admin login), `productApi`,
`categoryApi`, `orderApi`, `customerApi`, `deliveryApi`, `reportApi`.
Same `axiosClient.js` refresh-on-401 pattern as the storefront.
`AdminAuthContext` also checks the returned user's `role` is `'admin'`
during the silent-refresh bootstrap, so a leftover customer session
cookie can never grant dashboard access.

**Shared UI**: `DataTable`, `Modal`, `Pagination`, `StatusBadge`,
`ErrorState`, `Skeleton`/`TableSkeleton`, `FormField`, `StatCard`,
`SalesChart` (recharts).

**Pages**, every one wired to the real backend with loading/error states:
- **Login** — admin-only login (`POST /auth/admin/login`)
- **Dashboard** — summary cards (total paid sales, orders today, low
  stock count, new customers), a sales chart with daily/weekly/monthly
  toggle, low-stock list, top-selling products
- **Products** — searchable/filterable table, stock quantity editable
  inline, create/edit via modal, image upload/delete/set-primary for
  existing products. Note: the admin list endpoint only returns each
  product's primary image, so the edit modal fetches the full image set
  from the public product-detail endpoint by slug — which only works for
  **active** products (that endpoint filters `isActive: true`). Editing
  an inactive product's images will silently fall back to showing just
  the primary image. Fixing this properly needs a dedicated admin
  get-by-id endpoint, which doesn't exist yet.
- **Categories** — table with parent/product-count columns, create/edit
  via modal. No status/active toggle in the UI because the backend's
  `updateCategorySchema` doesn't accept `isActive` — there's currently no
  way to deactivate a category short of deleting it (which the backend
  blocks if it still has products or subcategories).
- **Orders** — filterable table (status, payment status, search),
  detail page with the full item/address/payment breakdown, status
  history, and a status-update control that only offers the next steps
  the backend's state machine actually allows (mirrored in
  `utils/constants.js` — the backend re-validates regardless)
- **Customers** — searchable table, detail page with lifetime
  orders/spend and recent order history, activate/deactivate
- **Delivery zones** — table, create/edit via modal, deactivate
  (soft-delete, matches `delivery.service.js`)

## Not built

- **Reports page** as a standalone screen — `reportApi.exportSalesReport`
  (CSV export) exists and is wired, but there's no page with a "download
  CSV" button wired to it yet; the sales chart/top-products data is
  currently shown only on the Dashboard.
- Product **bulk actions** (bulk activate/deactivate/delete).
