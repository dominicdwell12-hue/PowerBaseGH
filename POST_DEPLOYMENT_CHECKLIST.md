# PowerBase Gh — Post-Deployment Checklist

Run through this **in production, against the live URLs**, before telling a
single customer the site exists. Do it in order — later items assume
earlier ones passed. Use two browser profiles (or one normal + one
incognito window) so you can be logged into the storefront as a customer
and the admin dashboard as an admin at the same time.

Check every box. If anything fails, fix it and re-run the whole section
it failed in, not just the one step — a failure early in a flow
(e.g. checkout) can leave data (e.g. a stuck order) that makes later
steps behave differently on a second attempt.

---

## 0. Before you start

- [ ] `GET https://api.yourdomain.com/health` returns `{"success":true,"message":"PowerBase Gh API is running"}`
- [ ] Storefront loads at its production URL with no blank page / console errors
- [ ] Admin dashboard loads at its production URL with no blank page / console errors
- [ ] Browser DevTools → Network tab open for every step below — you're checking for `4xx`/`5xx`/CORS errors, not just visual success
- [ ] Browser DevTools → Console tab open — no red errors on any page load

---

## 1. Account creation & authentication (storefront)

- [ ] Register a new customer account with a real email you control
- [ ] Password validation rejects a weak password (no uppercase / no number) with a clear message
- [ ] Registering the same email twice is rejected with "account already exists," not a 500
- [ ] Log out
- [ ] Log back in with the same credentials
- [ ] Refresh the page while logged in — session persists (silent refresh works, you're not bounced to login)
- [ ] Enter a wrong password — rejected with a generic "invalid email or password" (not "wrong password" — confirms the app isn't leaking which part was wrong)
- [ ] Leave the tab open and idle past the access token's expiry (`JWT_ACCESS_EXPIRES_IN`, 15 min by default) — the next request should silently refresh, not log you out
- [ ] Confirm the refresh token cookie is `httpOnly` and `Secure` (DevTools → Application → Cookies — `HttpOnly` and `Secure` columns both checked)

## 2. Browse products

- [ ] Home page loads featured products with images (confirms Cloudinary URLs resolve)
- [ ] Product listing page loads, pagination works
- [ ] Filter by category works
- [ ] Filter by price range works
- [ ] Search returns relevant results
- [ ] Sort (price asc/desc, newest, rating) changes order
- [ ] Click into a product detail page — images, price, stock, description all render
- [ ] "Related products" section populates
- [ ] Try a product URL with a slug that doesn't exist — clean 404 page, not a crash

## 3. Wishlist

- [ ] Add a product to the wishlist while logged in
- [ ] Wishlist page shows it
- [ ] Remove it — it disappears
- [ ] Log out and try to add to wishlist — redirected to login, not a silent failure

## 4. Cart

- [ ] Add a product to cart
- [ ] Add the same product again — quantity increases, not a duplicate line
- [ ] Change quantity in the cart — subtotal updates correctly
- [ ] Try to set quantity above available stock — blocked with a clear message
- [ ] Remove an item — cart total recalculates
- [ ] Cart persists after logout/login (it's server-side, tied to your account)

## 5. Checkout — address & Pay-on-Delivery rule (critical business rule)

- [ ] Add a delivery address with **Kumasi** as the city
- [ ] Add a second address with **any other city** (e.g. Accra)
- [ ] At checkout, select the Kumasi address — "Pay on Delivery" is selectable
- [ ] Switch to the non-Kumasi address — "Pay on Delivery" becomes unavailable/greyed out in the UI
- [ ] As an extra check, confirm this is enforced **server-side**, not just hidden in the UI: submit an order to a non-Kumasi address requesting `pay_on_delivery` directly via an API client (e.g. curl/Postman) with a valid access token — the API must reject it with a 422, regardless of what the UI shows
- [ ] Place a Pay-on-Delivery order to the Kumasi address — order is created, stock decrements, cart clears
- [ ] Check the product's stock quantity in the admin dashboard — confirm it actually decremented by the ordered quantity

## 6. Checkout — online payment (Paystack)

- [ ] Place an order to any address with "Card" as the payment method
- [ ] You're redirected to the real Paystack checkout page (confirms `PAYSTACK_SECRET_KEY` is live/correct and reachable)
- [ ] Complete payment with a real card or Paystack's test card if still on test keys
- [ ] You're redirected back to `PAYMENT_CALLBACK_URL` (your storefront's `/payment/callback` page)
- [ ] The callback page shows a success state
- [ ] Order status flips from `Pending` to `Confirmed` automatically
- [ ] Order payment status flips from `pending` to `paid`
- [ ] In your Paystack dashboard, confirm the webhook delivery shows a `200` response from your backend (not a retry/failure) — this is the real proof the webhook, not just the browser redirect, reconciled the payment
- [ ] Deliberately fail a payment (cancel on the gateway page, or use a test failure card) — order's payment status becomes `failed`, order status stays `Pending`, and **note that stock is not released automatically** — this is a known limitation (see `PRODUCTION_READINESS_REPORT.md`); confirm you have a manual process for this before launch

## 7. Checkout — online payment (Flutterwave)

- [ ] Repeat the same sequence as section 6 with Flutterwave as the provider
- [ ] Confirm `FLUTTERWAVE_WEBHOOK_HASH` is set correctly by checking the webhook delivery log in your Flutterwave dashboard shows `200`, not `401`
- [ ] If you see repeated `401`s on the webhook, the hash configured on Flutterwave's side doesn't match `FLUTTERWAVE_WEBHOOK_HASH` on your server — fix before launch, since a broken webhook means payments only reconcile when the customer's browser happens to hit the callback page (fragile)

## 8. Order tracking & history (storefront)

- [ ] "My Orders" lists all orders just placed, newest first
- [ ] Click into an order — full detail (items, address, totals) is correct
- [ ] Tracking page shows the status history timeline matching what actually happened (Pending → Confirmed after payment, etc.)
- [ ] Cancel a still-`Pending`/`Confirmed` order — status changes to `Cancelled`, and stock is restored (verify in admin)
- [ ] Try to cancel an order that's already `Shipped`/`Delivered` (use one from admin testing below) — blocked with a clear message, not a 500

## 9. Profile

- [ ] Update first/last name — saves and reflects immediately
- [ ] Try to change email to one already registered — rejected with a clear conflict message
- [ ] Change password — succeeds, and confirms you need to log in again afterward
- [ ] Add a second address, mark it default — it becomes the preselected one at checkout
- [ ] Delete an address **not** used by any order — succeeds
- [ ] Try to delete an address that **is** used by an order — blocked with a clear message

## 10. Admin — login & access control

- [ ] Log into the admin dashboard at `/login` with the seeded admin account
- [ ] **Change the seeded admin password immediately** — see the note in `DEPLOYMENT.md` about this; the default (`ChangeMe123!`) must not still work once real traffic exists
- [ ] Try logging into the admin dashboard with a **customer** account's credentials — rejected with "not authorized," and confirm in DevTools this did **not** log you into/break your separate storefront session in another tab
- [ ] Refresh the admin dashboard while logged in — session persists

## 11. Admin — dashboard & reports

- [ ] Summary cards show real numbers (total paid sales, orders today, low-stock count, new customers) matching what you'd expect from your test data
- [ ] Low-stock list shows any product at ≤5 units (create/adjust one to confirm it appears)
- [ ] Sales chart renders and the daily/weekly/monthly toggle changes the data shown
- [ ] Top products list populates after the orders placed above

## 12. Admin — product management

- [ ] Create a new product with all required fields — appears in the storefront listing within a normal cache/refresh cycle
- [ ] Upload images for it — confirm they appear (proves Cloudinary write access works from production, not just read)
- [ ] Set a non-primary image as primary — storefront reflects the new primary image
- [ ] Edit price/stock/description — changes reflect on the storefront
- [ ] Try creating a product with a duplicate SKU — rejected with a clear conflict message
- [ ] Deactivate a product — disappears from the public storefront listing but is still visible/editable in admin
- [ ] Delete (soft-delete) a product — disappears everywhere except historical orders that reference it (open one of the orders from section 6/7 that included it and confirm the order still shows the correct item name/price)

## 13. Admin — category management

- [ ] Create a category, create a subcategory under it
- [ ] Assign a product to it, confirm it's browsable via that category on the storefront
- [ ] Try deleting a category that still has products — blocked with a clear message
- [ ] Try deleting a category that still has subcategories — blocked with a clear message

## 14. Admin — order management

- [ ] Filter the order list by status and by payment status — results match
- [ ] Search by order number and by customer email — both work
- [ ] Open an order, move it through its real lifecycle: `Pending → Confirmed → Packed → Shipped → Out for Delivery → Delivered`
- [ ] Try to skip a stage (e.g. `Packed` straight to `Delivered`) — rejected with a clear message listing the valid next status
- [ ] Try to change the status of a `Delivered` or `Cancelled` order — rejected, since both are terminal
- [ ] Cancel a `Pending`/`Confirmed` order from the admin side — stock is restored (verify in product admin)
- [ ] For a Pay-on-Delivery order that's been `Delivered` and cash collected: confirm you have a **manual/off-app process** to mark it reconciled — there is currently no in-app "mark as paid" action for POD orders (documented limitation, see `PRODUCTION_READINESS_REPORT.md`)

## 15. Admin — customer management

- [ ] Customer list shows the test customer(s) created above, with correct order counts
- [ ] Search by name/email/phone works
- [ ] Open a customer's detail page — lifetime stats and recent orders match reality
- [ ] Deactivate a customer — confirm that customer is immediately logged out (their next request fails auth, not just blocked from a future login) and cannot log back in
- [ ] Reactivate them — they can log in again

## 16. Admin — delivery zones

- [ ] Zone list shows Kumasi with Pay-on-Delivery enabled, all others without
- [ ] Create a new zone — appears as a city option at storefront checkout
- [ ] Edit a zone's delivery fee — reflects in a new order's total immediately
- [ ] Deactivate a zone — it disappears from the storefront's city picker, and any address already using it should be handled per your business decision (confirm what actually happens matches what you expect — this affects any customer with an existing address in that city)

## 17. Cross-cutting checks

- [ ] Open the storefront and admin dashboard **at the same time in different tabs**, logged in as different roles — confirm no session bleed between them (this was a real bug found and fixed during the production review; re-confirm it in the real deployed environment)
- [ ] Check response times on product listing / order list under whatever real data volume you've seeded — not just single-digit test records
- [ ] Confirm HTTPS padlock shows on all three URLs (API, storefront, admin) with no mixed-content warnings
- [ ] Confirm `CORS_ORIGINS` on the backend only lists your real storefront and admin URLs — not `localhost`, not `*`
- [ ] Hit a handful of protected admin endpoints directly with no token / an expired token / a customer's token — all return 401/403, not data
- [ ] Submit garbage (non-numeric) values in a numeric URL path where possible (e.g. a product ID) — confirm what comes back; a raw 500 here is a known, documented issue (see `PRODUCTION_READINESS_REPORT.md`), not a sign something else is broken

## 18. Monitoring & rollback readiness

- [ ] You know how to view live backend logs on your hosting platform
- [ ] You have a tested rollback plan (previous deploy/build you can revert to in one click)
- [ ] You have a database backup taken **after** seeding and **before** announcing launch
- [ ] Error alerting (even just an email/Slack on 5xx spikes) is wired up, or you've accepted the risk of not having it for launch day
- [ ] You've bookmarked the Paystack and Flutterwave dashboards to watch live transactions on launch day

---

Once every box above is checked in the **live production environment** —
not staging, not local — you're ready to announce the site publicly.
