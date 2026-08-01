# PowerBase Gh — API Endpoint Reference
**Step 4 of 6 — REST API Design**

All endpoints prefixed with `/api/v1`. Auth via `Authorization: Bearer <token>` header unless noted. Response shape is standardized:

```json
// Success
{ "success": true, "data": { ... }, "message": "..." }

// Error
{ "success": false, "message": "...", "errors": [ ... ] }
```

---

## 1. Auth Module — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new customer |
| POST | `/auth/login` | Public | Login (returns access + refresh token) |
| POST | `/auth/refresh` | Refresh token (cookie) | Issue new access token |
| POST | `/auth/logout` | Authenticated | Invalidate refresh token |
| GET | `/auth/me` | Authenticated | Get current logged-in user profile |
| POST | `/auth/admin/login` | Public | Admin-specific login (same table, role-checked) |
| POST | `/auth/forgot-password` | Public | Send password reset link (Phase 2 — needs email service) |
| POST | `/auth/reset-password` | Public (token in body) | Reset password |

---

## 2. Users / Profile Module — `/api/v1/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users/profile` | Customer | Get own profile |
| PUT | `/users/profile` | Customer | Update name/phone/email |
| PUT | `/users/change-password` | Customer | Change password |
| GET | `/users/addresses` | Customer | List saved addresses |
| POST | `/users/addresses` | Customer | Add new address |
| PUT | `/users/addresses/:id` | Customer | Update address |
| DELETE | `/users/addresses/:id` | Customer | Delete address |
| PUT | `/users/addresses/:id/default` | Customer | Set as default address |

---

## 3. Products Module (Public) — `/api/v1/products`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/products` | Public | List products — supports `?category=`, `?search=`, `?minPrice=`, `?maxPrice=`, `?sort=`, `?page=`, `?limit=` |
| GET | `/products/:slug` | Public | Get single product details |
| GET | `/products/featured` | Public | Get featured products (homepage) |
| GET | `/products/:slug/related` | Public | Related products (same category) |

---

## 4. Categories Module (Public) — `/api/v1/categories`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/categories` | Public | List all active categories (tree structure with subcategories) |
| GET | `/categories/:slug` | Public | Get category detail + its products (paginated) |

---

## 5. Cart Module — `/api/v1/cart`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/cart` | Customer | Get current cart with items |
| POST | `/cart/items` | Customer | Add item to cart `{ productId, quantity }` |
| PUT | `/cart/items/:itemId` | Customer | Update quantity |
| DELETE | `/cart/items/:itemId` | Customer | Remove item from cart |
| DELETE | `/cart` | Customer | Clear entire cart |

---

## 6. Wishlist Module — `/api/v1/wishlist`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/wishlist` | Customer | List wishlist items |
| POST | `/wishlist` | Customer | Add product to wishlist `{ productId }` |
| DELETE | `/wishlist/:productId` | Customer | Remove product from wishlist |

---

## 7. Delivery Module — `/api/v1/delivery`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/delivery/zones` | Public | List all delivery cities + their fee, POD availability, est. days |
| GET | `/delivery/zones/:cityId/pod-check` | Public | Check if Pay-on-Delivery is available for a given city — used at checkout |

---

## 8. Orders Module — `/api/v1/orders`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/orders` | Customer | Create order from cart `{ addressId, paymentMethod }` — validates POD eligibility |
| GET | `/orders` | Customer | List own order history (paginated) |
| GET | `/orders/:orderNumber` | Customer | Get single order details |
| GET | `/orders/:orderNumber/tracking` | Customer | Get order status + full status history timeline |
| PUT | `/orders/:orderNumber/cancel` | Customer | Cancel order (only if status = Pending/Confirmed) |

---

## 9. Payments Module — `/api/v1/payments`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/payments/initialize` | Customer | Initialize payment for an order `{ orderId, provider }` → returns gateway checkout URL/reference |
| GET | `/payments/verify/:reference` | Customer | Verify payment status after redirect back from gateway |
| POST | `/payments/webhook/paystack` | Public (signature-verified) | Paystack webhook — confirms payment, updates order |
| POST | `/payments/webhook/flutterwave` | Public (signature-verified) | Flutterwave webhook — confirms payment, updates order |

---

## 10. Admin — Product Management — `/api/v1/admin/products`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/products` | Admin | List all products (incl. inactive), admin filters |
| POST | `/admin/products` | Admin | Create product |
| PUT | `/admin/products/:id` | Admin | Update product |
| DELETE | `/admin/products/:id` | Admin | Delete (soft-delete) product |
| POST | `/admin/products/:id/images` | Admin | Upload one or more images (multipart, → Cloudinary) |
| DELETE | `/admin/products/:id/images/:imageId` | Admin | Remove a product image |
| PUT | `/admin/products/:id/images/:imageId/primary` | Admin | Set image as primary |
| PUT | `/admin/products/:id/stock` | Admin | Update stock quantity (inventory management) |

---

## 11. Admin — Category Management — `/api/v1/admin/categories`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/categories` | Admin | List all categories (incl. inactive) |
| POST | `/admin/categories` | Admin | Create category |
| PUT | `/admin/categories/:id` | Admin | Update category |
| DELETE | `/admin/categories/:id` | Admin | Delete category |

---

## 12. Admin — Order Management — `/api/v1/admin/orders`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/orders` | Admin | List all orders — filters: `?status=`, `?paymentStatus=`, `?dateFrom=`, `?dateTo=` |
| GET | `/admin/orders/:orderNumber` | Admin | Get full order detail |
| PUT | `/admin/orders/:orderNumber/status` | Admin | Update order status `{ status, note }` — validated against state machine |

---

## 13. Admin — Customer Management — `/api/v1/admin/customers`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/customers` | Admin | List all customers, search by name/email |
| GET | `/admin/customers/:id` | Admin | Get customer detail + order history |
| PUT | `/admin/customers/:id/status` | Admin | Activate/deactivate a customer account |

---

## 14. Admin — Delivery Zones — `/api/v1/admin/delivery-zones`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/delivery-zones` | Admin | List all zones |
| POST | `/admin/delivery-zones` | Admin | Add new city/zone |
| PUT | `/admin/delivery-zones/:id` | Admin | Update fee, POD eligibility, est. days |
| DELETE | `/admin/delivery-zones/:id` | Admin | Deactivate zone |

---

## 15. Admin — Dashboard & Reports — `/api/v1/admin/dashboard`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/dashboard/summary` | Admin | Key stats: total sales, orders today, low stock alerts, new customers |
| GET | `/admin/reports/sales` | Admin | Sales report — filters: `?period=daily/weekly/monthly`, `?dateFrom=`, `?dateTo=` |
| GET | `/admin/reports/top-products` | Admin | Best-selling products report |
| GET | `/admin/reports/export` | Admin | Export sales report as CSV |

---

## 16. Common Query Parameters (list endpoints)

| Param | Description |
|---|---|
| `page` | Page number (default 1) |
| `limit` | Items per page (default 20, max 100) |
| `sort` | e.g. `price_asc`, `price_desc`, `newest`, `rating` |
| `search` | Full-text search term |

---

## 17. Standard Error Codes

| HTTP Status | Meaning |
|---|---|
| 400 | Validation error |
| 401 | Not authenticated / invalid token |
| 403 | Authenticated but not authorized (wrong role) |
| 404 | Resource not found |
| 409 | Conflict (e.g. duplicate email, insufficient stock) |
| 422 | Business rule violation (e.g. POD not available for city) |
| 500 | Server error |

---

## What's Next (Step 5)

Once approved, I'll design **UI wireframes** — key screens for both the storefront (home, product listing, product detail, cart, checkout, order tracking) and the admin dashboard (dashboard home, product management, order management) — as visual layouts before we start coding.
