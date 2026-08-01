# PowerBase Gh — Database Schema
**Step 2 of 6 — Database Design (MySQL)**

Assumptions used below (flag if you want changes): ORM = **Prisma**, no Redis yet, `InnoDB` engine, `utf8mb4` charset, soft-deletes on key entities via `deleted_at`, timestamps (`created_at`, `updated_at`) on every table.

---

## 1. Entity-Relationship Overview

```
vendors ──< products >── categories
   │            │
   │            ├──< product_images
   │            └──< product_inventory (1:1)
   │
users ──< addresses
   │
   ├──< carts ──< cart_items >── products
   │
   ├──< wishlists ──< wishlist_items >── products
   │
   ├──< orders ──< order_items >── products
   │        │            └── vendor_id (denormalized, for future payouts)
   │        ├──< order_status_history
   │        └──< payments (1:1 per order, or 1:many for split/retry attempts)
   │
   └──< reviews >── products   (flagged optional / can defer to later phase)

delivery_zones (cities) ── referenced by orders.delivery_city + checkout logic
roles ──< user_roles >── users   (or simple users.role enum for MVP simplicity)
```

---

## 2. Tables

### 2.1 `users`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED, PK, AUTO_INCREMENT | |
| full_name | VARCHAR(150) | NOT NULL |
| email | VARCHAR(191) | UNIQUE, NOT NULL |
| phone | VARCHAR(20) | UNIQUE, NULL |
| password_hash | VARCHAR(255) | NOT NULL (bcrypt) |
| role | ENUM('customer','admin') | DEFAULT 'customer' — extensible to `'vendor'` later |
| is_active | BOOLEAN | DEFAULT true |
| email_verified_at | DATETIME | NULL |
| created_at / updated_at / deleted_at | DATETIME | |

**Indexes:** `email` (unique), `phone` (unique), `role`

---

### 2.2 `addresses`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED, PK | |
| user_id | BIGINT UNSIGNED, FK → users.id | |
| label | VARCHAR(50) | e.g. "Home", "Office" |
| recipient_name | VARCHAR(150) | |
| phone | VARCHAR(20) | |
| city | VARCHAR(100) | NOT NULL — drives Pay-on-Delivery logic |
| region | VARCHAR(100) | e.g. Ashanti |
| street_address | VARCHAR(255) | |
| landmark | VARCHAR(255) | NULL — common in Ghanaian addressing |
| is_default | BOOLEAN | DEFAULT false |
| created_at / updated_at | DATETIME | |

**Indexes:** `user_id`, `city`

---

### 2.3 `vendors` *(future-proofing table — single row for MVP)*
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED, PK | |
| name | VARCHAR(150) | e.g. "PowerBase Gh" |
| slug | VARCHAR(150) | UNIQUE |
| logo_url | VARCHAR(500) | Cloudinary URL |
| commission_rate | DECIMAL(5,2) | NULL, unused in MVP — for future marketplace commission |
| status | ENUM('active','suspended') | DEFAULT 'active' |
| owner_user_id | BIGINT UNSIGNED, FK → users.id | NULL for MVP; used when vendor accounts exist |
| created_at / updated_at | DATETIME | |

*MVP: seeded with exactly one row representing PowerBase Gh itself.*

---

### 2.4 `categories`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED, PK | |
| name | VARCHAR(100) | NOT NULL |
| slug | VARCHAR(120) | UNIQUE |
| parent_id | BIGINT UNSIGNED, FK → categories.id | NULL — supports subcategories |
| image_url | VARCHAR(500) | NULL |
| is_active | BOOLEAN | DEFAULT true |
| created_at / updated_at | DATETIME | |

**Indexes:** `slug` (unique), `parent_id`

---

### 2.5 `products`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED, PK | |
| vendor_id | BIGINT UNSIGNED, FK → vendors.id | NOT NULL (always PowerBase Gh in MVP) |
| category_id | BIGINT UNSIGNED, FK → categories.id | |
| name | VARCHAR(200) | NOT NULL |
| slug | VARCHAR(220) | UNIQUE |
| description | TEXT | |
| price | DECIMAL(10,2) | NOT NULL |
| compare_at_price | DECIMAL(10,2) | NULL — for showing discounts/strikethrough |
| sku | VARCHAR(100) | UNIQUE |
| brand | VARCHAR(100) | NULL |
| is_active | BOOLEAN | DEFAULT true |
| is_featured | BOOLEAN | DEFAULT false |
| average_rating | DECIMAL(2,1) | DEFAULT 0 — denormalized, updated on new review |
| created_at / updated_at / deleted_at | DATETIME | |

**Indexes:** `slug` (unique), `category_id`, `vendor_id`, `is_active`, full-text index on `name, description` (for search)

---

### 2.6 `product_images`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED, PK | |
| product_id | BIGINT UNSIGNED, FK → products.id | |
| image_url | VARCHAR(500) | Cloudinary secure_url |
| is_primary | BOOLEAN | DEFAULT false |
| sort_order | SMALLINT | DEFAULT 0 |
| created_at | DATETIME | |

**Indexes:** `product_id`

---

### 2.7 `product_inventory`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED, PK | |
| product_id | BIGINT UNSIGNED, FK → products.id, UNIQUE | 1:1 with product |
| quantity_available | INT | DEFAULT 0 |
| low_stock_threshold | INT | DEFAULT 5 |
| updated_at | DATETIME | |

**Indexes:** `product_id` (unique)

*Kept separate from `products` so inventory updates (frequent, from orders) don't lock/contend with product metadata reads.*

---

### 2.8 `carts` & `cart_items`
**carts**
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED, PK | |
| user_id | BIGINT UNSIGNED, FK → users.id, UNIQUE | 1 active cart per user |
| created_at / updated_at | DATETIME | |

**cart_items**
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED, PK | |
| cart_id | BIGINT UNSIGNED, FK → carts.id | |
| product_id | BIGINT UNSIGNED, FK → products.id | |
| quantity | INT | NOT NULL, DEFAULT 1 |
| price_snapshot | DECIMAL(10,2) | price at time of adding (for integrity if price changes) |
| created_at / updated_at | DATETIME | |

**Indexes:** `cart_id`, unique(`cart_id`, `product_id`)

---

### 2.9 `wishlists` & `wishlist_items`
**wishlists**
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED, PK | |
| user_id | BIGINT UNSIGNED, FK → users.id, UNIQUE | |

**wishlist_items**
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED, PK | |
| wishlist_id | BIGINT UNSIGNED, FK → wishlists.id | |
| product_id | BIGINT UNSIGNED, FK → products.id | |
| created_at | DATETIME | |

**Indexes:** unique(`wishlist_id`, `product_id`)

---

### 2.10 `delivery_zones`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED, PK | |
| city_name | VARCHAR(100) | UNIQUE, e.g. "Kumasi" |
| region | VARCHAR(100) | e.g. "Ashanti" |
| pay_on_delivery_enabled | BOOLEAN | DEFAULT false (true only for Kumasi at launch) |
| standard_delivery_fee | DECIMAL(10,2) | NULL |
| estimated_delivery_days | SMALLINT | e.g. 1–2 for Kumasi, 3–5 elsewhere |
| is_active | BOOLEAN | DEFAULT true |

**Indexes:** `city_name` (unique)

*This is the data-driven table that powers the checkout Pay-on-Delivery rule described in Step 1.*

---

### 2.11 `orders`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED, PK | |
| order_number | VARCHAR(30) | UNIQUE, human-readable e.g. `PBG-2026-000123` |
| user_id | BIGINT UNSIGNED, FK → users.id | |
| status | ENUM('pending','confirmed','packed','shipped','out_for_delivery','delivered','cancelled') | DEFAULT 'pending' |
| payment_method | ENUM('card','mobile_money','pay_on_delivery') | |
| payment_status | ENUM('unpaid','paid','failed','refunded') | DEFAULT 'unpaid' |
| subtotal | DECIMAL(10,2) | |
| delivery_fee | DECIMAL(10,2) | |
| total | DECIMAL(10,2) | |
| delivery_city | VARCHAR(100) | snapshot at order time |
| delivery_address_id | BIGINT UNSIGNED, FK → addresses.id | |
| placed_at | DATETIME | |
| created_at / updated_at | DATETIME | |

**Indexes:** `order_number` (unique), `user_id`, `status`, `payment_status`

---

### 2.12 `order_items`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED, PK | |
| order_id | BIGINT UNSIGNED, FK → orders.id | |
| product_id | BIGINT UNSIGNED, FK → products.id | |
| vendor_id | BIGINT UNSIGNED, FK → vendors.id | denormalized — enables future per-vendor order splitting |
| product_name_snapshot | VARCHAR(200) | preserves name even if product later edited/deleted |
| unit_price | DECIMAL(10,2) | price at time of purchase |
| quantity | INT | |
| line_total | DECIMAL(10,2) | |

**Indexes:** `order_id`, `vendor_id`

---

### 2.13 `order_status_history`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED, PK | |
| order_id | BIGINT UNSIGNED, FK → orders.id | |
| status | ENUM(same as orders.status) | |
| note | VARCHAR(255) | NULL — optional admin note |
| changed_by_user_id | BIGINT UNSIGNED, FK → users.id | admin who made the change |
| created_at | DATETIME | |

**Indexes:** `order_id`

*Powers the customer-facing "track order" timeline.*

---

### 2.14 `payments`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED, PK | |
| order_id | BIGINT UNSIGNED, FK → orders.id | |
| provider | ENUM('paystack','flutterwave') | |
| provider_reference | VARCHAR(150) | UNIQUE — transaction ref from gateway |
| amount | DECIMAL(10,2) | |
| status | ENUM('initiated','successful','failed','abandoned') | |
| channel | VARCHAR(50) | e.g. 'card', 'mobile_money' — from gateway response |
| paid_at | DATETIME | NULL |
| raw_response | JSON | NULL — full gateway webhook payload, for audit/debug |
| created_at / updated_at | DATETIME | |

**Indexes:** `order_id`, `provider_reference` (unique)

---

### 2.15 `reviews` *(recommended, can defer if you want a leaner MVP)*
| Column | Type | Notes |
|---|---|---|
| id | BIGINT UNSIGNED, PK | |
| product_id | BIGINT UNSIGNED, FK → products.id | |
| user_id | BIGINT UNSIGNED, FK → users.id | |
| rating | TINYINT | 1–5 |
| comment | TEXT | NULL |
| is_verified_purchase | BOOLEAN | DEFAULT false |
| created_at / updated_at | DATETIME | |

**Indexes:** `product_id`, unique(`product_id`, `user_id`) — one review per user per product

---

## 3. Relationship Summary (Foreign Keys)

- `products.vendor_id → vendors.id`
- `products.category_id → categories.id`
- `product_images.product_id → products.id` (CASCADE delete)
- `product_inventory.product_id → products.id` (CASCADE delete)
- `addresses.user_id → users.id` (CASCADE delete)
- `carts.user_id → users.id`
- `cart_items.cart_id → carts.id` (CASCADE), `cart_items.product_id → products.id`
- `wishlists.user_id → users.id`
- `wishlist_items.wishlist_id → wishlists.id` (CASCADE), `.product_id → products.id`
- `orders.user_id → users.id`, `orders.delivery_address_id → addresses.id`
- `order_items.order_id → orders.id` (CASCADE), `.product_id → products.id` (RESTRICT — keep history even if product later deleted, hence the snapshot columns)
- `order_status_history.order_id → orders.id` (CASCADE)
- `payments.order_id → orders.id`
- `reviews.product_id → products.id`, `.user_id → users.id`

**Deletion strategy:** Products use soft-delete (`deleted_at`) rather than hard delete, since orders reference them historically — this avoids ever breaking an old order's referential integrity.

---

## 4. Notes on Design Choices

- **Price snapshots** (`cart_items.price_snapshot`, `order_items.unit_price`, `product_name_snapshot`) protect order history integrity if a product's price or name changes after purchase — a common real-world bug source if omitted.
- **`order_number`** (human-readable, e.g. `PBG-2026-000123`) is separate from the numeric PK — needed for customer support and matches Jumia-style UX (customers reference order numbers, not database IDs).
- **Full-text index** on `products(name, description)` gives you working search out of the box without needing Elasticsearch for MVP scale; can be swapped in later if catalog grows large.
- **JSON column** (`payments.raw_response`) gives us a debugging safety net for payment gateway discrepancies without needing extra tables.

---

## What's Next (Step 3)

Once approved, I'll design the **complete folder structure** for both the backend (Express, modular-by-domain) and frontend (React storefront + admin), so the codebase stays organized and scalable from the first commit.

Let me know if you want any schema changes (e.g., drop `reviews` for a leaner MVP, or add anything I've missed) before I move on.
