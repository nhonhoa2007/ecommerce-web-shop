# Week 3 Commerce Flow Design

## Goal

Reconstruct Week 3 from `shop-qr-learning` as five buildable daily commits in
`ecommerce-web-shop`, while preserving the current Week 1–2 history and excluding
coupon, shipping, VietQR, and advanced checkout work scheduled for later weeks.

## Daily scope

1. **2026-10-26 — Product detail:** dynamic product route and a detail view backed
   by the existing catalog service.
2. **2026-10-27 — Cart state:** persisted Zustand cart with variant-aware add,
   remove, quantity, totals, and hydration behavior.
3. **2026-10-28 — Cart interface:** cart page and components that enforce positive
   quantities and the stock limit represented by each cart item.
4. **2026-10-29 — Order creation:** a minimal order API that validates customer
   fields, reloads products and prices on the server, and reserves stock atomically.
5. **2026-10-30 — Order status:** authenticated order-status transitions with an
   explicit transition map and stock release when an eligible order is cancelled.

## Architecture and data flow

The product detail page is a Server Component which reads the catalog service and
passes a serializable DTO to the Client Component. The client stores cart snapshots
in localStorage for usability, but those snapshots are never authoritative for
orders. When an order is submitted, the server normalizes the request, reloads
active products or variants from Prisma, calculates the subtotal from database
prices, and reserves inventory in the same transaction that creates the order.

Status changes live in a focused order service. Only allowed transitions are
accepted; terminal states cannot be reopened. Cancellation releases reserved stock
inside the transaction. The route requires a signed-in administrator or staff
member before calling the service.

## Error handling

Unknown products return 404. Invalid cart quantities are clamped or rejected before
state changes. Empty customer fields, malformed items, changed prices, inactive
products, and insufficient stock return explicit 4xx responses. Unexpected database
errors remain 500 responses without exposing internal details.

## Verification

Pure cart, checkout-validation, inventory, and order-transition behavior is covered
with Node tests. Every daily commit must pass its focused tests plus the repository
test suite, lint, architecture check, and production build when applicable. The
existing uncommitted `src/client/views/HomeView.tsx` change is preserved and excluded
from all Week 3 commits.
