# PowerBase Gh — Folder Structure
**Step 3 of 6 — Project Folder Structure**

Modular-by-domain structure for both backend and frontend, matching the architecture from Step 1. This keeps each feature (products, orders, auth, etc.) self-contained, making the codebase easy to navigate and easy to extract into services later if needed.

---

## 1. Repository Layout (Monorepo, recommended)

```
powerbase-gh/
├── backend/                 # Node.js + Express API
├── frontend/
│   ├── storefront/          # Customer-facing React app
│   └── admin/               # Admin dashboard React app
├── shared/                  # Shared types/constants (optional, phase 2)
├── docs/                    # Architecture docs, API docs (this project's outputs)
├── .gitignore
└── README.md
```

*Why one repo:* Easier for a solo/small team to manage versioning, and both frontend apps + backend evolve together at this stage. Can split into separate repos later if a dedicated team per app emerges.

---

## 2. Backend Structure (`/backend`)

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # DB connection/Prisma client init
│   │   ├── cloudinary.js        # Cloudinary SDK config
│   │   ├── payment.js           # Paystack/Flutterwave config
│   │   └── env.js               # Centralized env var validation
│   │
│   ├── modules/                 # One folder per business domain
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.validation.js
│   │   │   └── auth.middleware.js   # JWT verify, role guard
│   │   │
│   │   ├── users/
│   │   │   ├── user.routes.js
│   │   │   ├── user.controller.js
│   │   │   ├── user.service.js
│   │   │   └── user.validation.js
│   │   │
│   │   ├── products/
│   │   │   ├── product.routes.js
│   │   │   ├── product.controller.js
│   │   │   ├── product.service.js
│   │   │   ├── product.validation.js
│   │   │   └── product-image.service.js   # Cloudinary upload logic
│   │   │
│   │   ├── categories/
│   │   │   ├── category.routes.js
│   │   │   ├── category.controller.js
│   │   │   └── category.service.js
│   │   │
│   │   ├── cart/
│   │   │   ├── cart.routes.js
│   │   │   ├── cart.controller.js
│   │   │   └── cart.service.js
│   │   │
│   │   ├── wishlist/
│   │   │   ├── wishlist.routes.js
│   │   │   ├── wishlist.controller.js
│   │   │   └── wishlist.service.js
│   │   │
│   │   ├── orders/
│   │   │   ├── order.routes.js
│   │   │   ├── order.controller.js
│   │   │   ├── order.service.js
│   │   │   ├── order.validation.js
│   │   │   └── order-status.service.js   # state machine logic
│   │   │
│   │   ├── delivery/
│   │   │   ├── delivery.routes.js         # zones/cities, pay-on-delivery check
│   │   │   ├── delivery.controller.js
│   │   │   └── delivery.service.js
│   │   │
│   │   ├── payments/
│   │   │   ├── payment.routes.js
│   │   │   ├── payment.controller.js
│   │   │   ├── payment.service.js
│   │   │   ├── paystack.provider.js
│   │   │   ├── flutterwave.provider.js
│   │   │   └── webhook.controller.js      # payment gateway webhooks
│   │   │
│   │   └── admin/
│   │       ├── dashboard.routes.js
│   │       ├── dashboard.controller.js
│   │       ├── reports.service.js         # sales reports
│   │       └── admin.middleware.js
│   │
│   ├── middlewares/
│   │   ├── errorHandler.js
│   │   ├── notFound.js
│   │   ├── rateLimiter.js
│   │   └── validateRequest.js
│   │
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── generateOrderNumber.js
│   │   ├── pagination.js
│   │   ├── logger.js
│   │   └── apiResponse.js        # standardized success/error response shape
│   │
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── seed.js               # seeds vendor, roles, delivery_zones (Kumasi), categories
│   │
│   ├── app.js                    # Express app setup (middleware, routes mounting)
│   └── server.js                 # Entry point (starts HTTP server)
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env.example
├── .eslintrc.json
├── package.json
└── README.md
```

**Route mounting convention:** All routes mounted under `/api/v1/...`, e.g. `/api/v1/products`, `/api/v1/orders`, `/api/v1/admin/dashboard`.

---

## 3. Frontend Structure — Storefront (`/frontend/storefront`)

```
storefront/
├── public/
├── src/
│   ├── api/                      # Axios instance + API call functions per module
│   │   ├── axiosClient.js
│   │   ├── authApi.js
│   │   ├── productApi.js
│   │   ├── cartApi.js
│   │   ├── orderApi.js
│   │   ├── wishlistApi.js
│   │   └── deliveryApi.js
│   │
│   ├── components/
│   │   ├── common/                # Buttons, Inputs, Modals, Spinners, Badges
│   │   ├── layout/                 # Navbar, Footer, Sidebar, MobileMenu
│   │   ├── product/                 # ProductCard, ProductGrid, ProductGallery, RatingStars
│   │   ├── cart/                     # CartItem, CartSummary, CartDrawer
│   │   └── checkout/                 # AddressForm, DeliveryZoneSelector, PaymentMethodSelector
│   │
│   ├── pages/
│   │   ├── Home/
│   │   ├── ProductListing/
│   │   ├── ProductDetails/
│   │   ├── Cart/
│   │   ├── Checkout/
│   │   ├── OrderConfirmation/
│   │   ├── OrderHistory/
│   │   ├── OrderTracking/
│   │   ├── Wishlist/
│   │   ├── Profile/
│   │   ├── Auth/ (Login, Register)
│   │   └── NotFound/
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useCart.js
│   │   └── useDebounce.js          # for search
│   │
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── utils/
│   │   ├── formatCurrency.js
│   │   ├── validators.js
│   │   └── constants.js
│   │
│   ├── styles/
│   │   └── index.css              # Tailwind directives + custom tokens
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── tailwind.config.js
├── .env.example
├── package.json
└── README.md
```

---

## 4. Frontend Structure — Admin Dashboard (`/frontend/admin`)

```
admin/
├── src/
│   ├── api/
│   │   ├── axiosClient.js
│   │   ├── productApi.js
│   │   ├── categoryApi.js
│   │   ├── orderApi.js
│   │   ├── customerApi.js
│   │   └── reportApi.js
│   │
│   ├── components/
│   │   ├── common/                  # Table, Modal, Pagination, StatusBadge
│   │   ├── layout/                   # Sidebar, Topbar, AdminLayout
│   │   ├── products/                  # ProductForm, ImageUploader (multi-image), ProductTable
│   │   ├── orders/                     # OrderTable, OrderStatusUpdater
│   │   └── charts/                      # SalesChart, StatCard (dashboard widgets)
│   │
│   ├── pages/
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── Products/ (List, Create, Edit)
│   │   ├── Categories/
│   │   ├── Orders/ (List, Detail)
│   │   ├── Customers/
│   │   └── Reports/
│   │
│   ├── context/
│   │   └── AdminAuthContext.jsx
│   │
│   ├── routes/
│   │   ├── AdminRoutes.jsx
│   │   └── ProtectedAdminRoute.jsx
│   │
│   ├── utils/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
│
├── tailwind.config.js
├── .env.example
└── package.json
```

---

## 5. Shared Conventions (both frontends)

- **Component reusability:** shared design tokens (colors, spacing) via a common Tailwind config, kept in sync manually for now (or extracted to a shared package if the design system grows).
- **API layer separation:** every frontend module talks to the backend only through its `api/*.js` file — no raw `fetch`/`axios` calls scattered inside components.
- **Naming convention:** PascalCase for components, camelCase for functions/hooks, kebab-case for CSS/asset files.

---

## What's Next (Step 4)

Once approved, I'll list the **complete REST API endpoint reference** — every route, HTTP method, request/response shape, and auth requirements — across all modules (auth, products, cart, orders, payments, admin, etc.).
