# PowerBase Gh — System Architecture
**Step 1 of 6 — System Architecture Design**

---

## 1. High-Level Overview

PowerBase Gh is a full-stack e-commerce platform built as a **modular monolith** (single Node.js/Express backend, single MySQL database) with a clean separation of concerns that allows it to evolve into a multi-vendor marketplace later without a rewrite.

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                            │
│  ┌───────────────────┐        ┌───────────────────────────────┐ │
│  │  Customer Web App  │        │      Admin Dashboard          │ │
│  │  (React + Tailwind)│        │   (React + Tailwind, /admin)  │ │
│  └─────────┬──────────┘        └───────────────┬───────────────┘ │
└────────────┼───────────────────────────────────┼─────────────────┘
             │              HTTPS / REST (JSON)  │
             ▼                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY LAYER                         │
│              Express.js REST API (Node.js runtime)               │
│  ┌───────────────┬───────────────┬───────────────┬─────────────┐ │
│  │  Auth Module   │ Product Module│  Order Module │ Admin Module│ │
│  ├───────────────┼───────────────┼───────────────┼─────────────┤ │
│  │ Cart Module    │ Wishlist Mod. │ Payment Module│ Report Mod. │ │
│  └───────────────┴───────────────┴───────────────┴─────────────┘ │
│      Middleware: JWT Auth · Validation · Error Handler · RBAC     │
└─────────┬───────────────────┬───────────────────┬────────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌───────────────────────┐
│   MySQL Database  │ │    Cloudinary     │ │  Payment Gateway      │
│ (Products, Orders,│ │ (Product Images)  │ │ (Paystack/Flutterwave)│
│  Users, etc.)      │ │                    │ │  Cards + Mobile Money │
└──────────────────┘ └──────────────────┘ └───────────────────────┘
```

---

## 2. Architectural Style

- **Pattern:** Layered / N-tier architecture within a modular monolith
  - `Routes → Controllers → Services → Models (ORM/Query layer) → Database`
- **Why not microservices now:** Unnecessary complexity for a single-vendor MVP. The modular structure (separate modules per domain: products, orders, users, payments) means we can **extract a module into its own service later** if scale demands it — but we don't pay that operational cost today.
- **API style:** RESTful JSON API, versioned from day one (`/api/v1/...`) so future breaking changes don't affect the live app.
- **Statelessness:** Backend is stateless; JWT carries auth state, enabling easy horizontal scaling (multiple Node instances behind a load balancer later).

---

## 3. Core System Layers

### 3.1 Presentation Layer (Frontend)
- Two React apps sharing a component library and design tokens:
  1. **Storefront** (public-facing, customer-facing)
  2. **Admin Dashboard** (protected, role-gated)
- Both consume the same REST API, differentiated by JWT role claims.
- State management: React Context + hooks for auth/cart; TanStack Query (React Query) for server-state (product lists, orders) to handle caching/loading/error states cleanly.

### 3.2 Application/API Layer (Backend)
- Express.js with a **modular folder-per-domain** structure (see Step 3).
- Each module owns its routes, controller, service (business logic), and validation schema.
- Cross-cutting middleware: authentication (JWT verify), authorization (role/permission check), request validation (Joi/Zod), centralized error handler, request logging (morgan/winston).

### 3.3 Data Layer
- MySQL as the single source of truth, accessed via an ORM (Sequelize or Prisma — recommend **Prisma** for type-safety and migration tooling) or a query builder (Knex) — decided in Step 2.
- Redis (optional, phase 2) for session/cache and cart persistence at scale — not required for MVP, flagged as future enhancement.

### 3.4 External Services
- **Cloudinary** — product image upload, transformation (thumbnails, responsive sizes), CDN delivery.
- **Paystack / Flutterwave** — card + Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo) payment processing, webhook-based payment confirmation.
- **Email/SMS (future)** — order confirmations, status updates (e.g., via SendGrid/Twilio) — flagged as Phase 2.

---

## 4. Key Architectural Decisions (with future multi-vendor path in mind)

| Decision | MVP Behavior | Future Multi-Vendor Path |
|---|---|---|
| `vendors` table exists from day one | Single seeded vendor record ("PowerBase Gh") | New vendors register; products link to their vendor |
| Every `product` row has a `vendor_id` FK | Always points to the one vendor | Enables per-vendor product filtering, vendor dashboards |
| `orders` can span vendors via `order_items` | All items belong to one vendor | `order_items.vendor_id` allows splitting one order into per-vendor sub-shipments/payouts |
| Roles table is extensible | `customer`, `admin` | Add `vendor` role without schema change |
| Commission/payout fields on vendor table | Unused/null | Enables vendor payout logic later |

This means **Step 2 (database schema) will already include `vendor_id` fields**, even though we're not building vendor-facing features yet. Zero throwaway work later.

---

## 5. Security Architecture

- **Authentication:** JWT (access token, short-lived ~15–30 min) + refresh token (httpOnly cookie, long-lived) rotation strategy.
- **Password storage:** bcrypt hashing (cost factor 10–12).
- **Authorization:** Role-based access control (RBAC) middleware guarding `/admin/*` routes.
- **Input validation:** Schema validation (Zod/Joi) on every mutating endpoint — never trust client input.
- **Rate limiting:** express-rate-limit on auth endpoints (login/register) to prevent brute force.
- **CORS:** Whitelisted origins only (storefront + admin domains).
- **SQL Injection protection:** Parameterized queries via ORM, no raw string concatenation.
- **Secrets management:** `.env` files (never committed), separate secrets for dev/staging/production.
- **Payment security:** No card data ever touches our servers — handled entirely by Paystack/Flutterwave's hosted checkout/SDK; we only store transaction references and status via signed webhooks.
- **HTTPS everywhere** in production (enforced via reverse proxy/hosting platform).

---

## 6. Delivery / Pay-on-Delivery Logic (Business Rule Architecture)

- A `cities` or `delivery_zones` table stores which cities/areas qualify for **Pay on Delivery** (initially: Kumasi only, extensible to more zones later).
- At checkout:
  1. Customer selects delivery city.
  2. Backend checks `delivery_zones` for `pay_on_delivery_enabled` flag for that city.
  3. If `true` → "Pay on Delivery" is offered as a payment option alongside card/Mobile Money.
  4. If `false` → only prepayment (Paystack/Flutterwave) options are shown; order cannot proceed to "Confirmed" status without successful payment.
- This is **data-driven, not hardcoded** — so adding new Pay-on-Delivery cities later is an admin action, not a code change.

---

## 7. Order Lifecycle (State Machine)

```
Pending → Confirmed → Packed → Shipped → Out for Delivery → Delivered
   │
   └──────────────────────────────────────────────────────→ Cancelled
```
- Enforced via a backend state-transition guard (no illegal jumps, e.g., can't go from `Pending` directly to `Delivered`).
- Every status change is logged in an `order_status_history` table for audit trail and customer order-tracking display.

---

## 8. Scalability Considerations (for future growth)

- Stateless API servers → horizontal scaling behind a load balancer.
- Database indexing on high-query columns (product slug, category_id, order status, user email).
- Image delivery offloaded entirely to Cloudinary's CDN (no server-side image storage/bandwidth burden).
- Pagination on all list endpoints (products, orders, customers) from day one — never return unbounded result sets.
- Caching layer (Redis) reserved as a Phase 2 addition for product listing/category caching once traffic justifies it.

---

## 9. Environments & Deployment (recommended, to confirm with you)

- **Dev:** Local (Docker Compose optional for MySQL/Node parity).
- **Staging:** Mirrors production for QA before release.
- **Production:** Backend on a Node-friendly host (Railway/Render/VPS), MySQL managed instance, frontend static build on Vercel/Netlify or same host.
- **CI/CD:** Git-based, with basic lint/test checks on push (can formalize once repo is set up).

---

## What's Next (Step 2)

Once you approve this architecture, I'll design the **complete database schema** — all tables, columns, data types, relationships (including the `vendor_id`-ready structure described above), indexes, and an ER diagram.

Let me know if you'd like any adjustments here (e.g., ORM preference: Prisma vs Sequelize, hosting preferences, or whether you want Redis included now vs later) before I move to Step 2.
