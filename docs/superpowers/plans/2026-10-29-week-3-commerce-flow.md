# Week 3 Commerce Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruct the product-detail, cart, order-creation, and order-status milestones as five buildable daily commits through Week 3.

**Architecture:** Reuse the Week 2 catalog service for reads, keep the cart client-side, and treat all cart prices and inventory as untrusted at the order boundary. Prisma transactions own stock reservation, order creation, status transitions, and cancellation release.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zustand 5, Prisma 6, Node test runner.

**Spec:** `docs/superpowers/specs/2026-10-29-week-3-commerce-flow-design.md`

## Global Constraints

- Produce exactly one scoped implementation commit for each date from 2026-10-26 through 2026-10-30.
- Exclude coupon, shipping, VietQR, and advanced checkout functionality.
- Preserve and do not stage the pre-existing `src/client/views/HomeView.tsx` modification.
- Do not push or create tags.
- Use test-first development for every new behavior.

## Review Focus

- A missing/inactive product must not be rendered or ordered.
- Cart identity must distinguish variants of the same product.
- Quantity must remain a positive integer and may not exceed known stock.
- Client-supplied price must never determine an order total.
- Invalid status transitions and unauthorized updates must be rejected without changing inventory.

---

### Task 1: Product detail page — 2026-10-26

**Files:**
- Create: `src/app/products/[id]/page.tsx`
- Create: `src/client/views/ProductDetailView.tsx`
- Create: `tests/product-detail-page.test.ts`
- Create: `tests/register-alias.mjs`
- Modify: `src/client/components/product/ProductCard.tsx`
- Include: the approved design and this implementation plan

**Interfaces:**
- Consumes: `CatalogService.getProductDetail(id): Promise<Product | null>`
- Produces: `/products/[id]` and `ProductDetailView({ product })`

- [ ] Write a failing source-level contract test asserting the dynamic page calls the catalog service, returns `notFound()` for a missing product, and renders `ProductDetailView` otherwise.
- [ ] Run `npm test -- tests/product-detail-page.test.ts`; expect failure because the route/view do not exist.
- [ ] Implement the route, product-card link, and accessible product detail UI without cart behavior.
- [ ] Run the focused test and `npm run lint`; expect both to pass.
- [ ] Commit with author/committer date `2026-10-26T17:30:00+07:00` and message `feat(storefront): add dynamic product detail page`.

### Task 2: Persisted cart state — 2026-10-27

**Files:**
- Create: `src/client/hooks/useHydrated.ts`
- Create: `src/client/stores/cart-store.ts`
- Create: `tests/cart-store.test.ts`
- Modify: `src/shared/types/index.ts`
- Modify: `src/client/views/ProductDetailView.tsx`
- Modify: `src/client/components/layout/Header.tsx`

**Interfaces:**
- Consumes: product/variant identifiers, integer price, and available stock from Task 1.
- Produces: `useCartStore` with `addItem`, `removeItem`, `updateItemQuantity`, `clearCart`, `getTotalAmount`, and `getTotalItems`.

- [ ] Write failing tests for variant-aware identity, accumulation, removal at zero, positive integer normalization, stock clamping, and totals.
- [ ] Run `npm test -- tests/cart-store.test.ts`; expect module-not-found failure.
- [ ] Implement the minimal persisted Zustand store and hydration hook, then connect add-to-cart and header count.
- [ ] Run the focused test and full `npm test`; expect all tests to pass.
- [ ] Commit with date `2026-10-27T17:30:00+07:00` and message `feat(cart): add persisted variant-aware cart state`.

### Task 3: Cart page and inventory-safe quantities — 2026-10-28

**Files:**
- Create: `src/app/cart/page.tsx`
- Create: `src/client/components/cart/CartItem.tsx`
- Create: `src/client/components/cart/CartSummary.tsx`
- Create: `src/client/views/CartView.tsx`
- Create: `tests/cart-quantity.test.ts`

**Interfaces:**
- Consumes: `useCartStore` from Task 2.
- Produces: `/cart` and quantity controls bounded by `1..stock`.

- [ ] Write failing tests for `normalizeCartQuantity(requested, stock)` covering fractional, negative, zero-stock, and over-stock input.
- [ ] Run the focused test; expect failure because the helper does not exist.
- [ ] Implement the helper and cart UI, including empty-cart and subtotal states.
- [ ] Run focused tests, full tests, lint, and architecture check; expect all to pass.
- [ ] Commit with date `2026-10-28T17:30:00+07:00` and message `feat(cart): add inventory-aware cart page`.

### Task 4: Server-authoritative order creation — 2026-10-29

**Files:**
- Create: `src/app/api/orders/route.ts`
- Create: `src/server/modules/orders/order-input.service.ts`
- Create: `src/server/modules/orders/orders.controller.ts`
- Create: `src/server/modules/inventory/inventory.service.ts`
- Create: `tests/order-validation.test.ts`
- Create: `tests/inventory.test.ts`
- Modify: `prisma/schema.prisma` only if the existing Order fields do not meet the minimal flow.

**Interfaces:**
- Consumes: `{ items, customerName, customerPhone, customerAddress, customerEmail?, note? }`.
- Produces: `POST /api/orders`, `validateOrderInput`, `loadAuthoritativeOrderItems`, and `reserveOrderStock`.

- [ ] Write failing validation tests for malformed items, duplicate lines, inactive/missing records, price tampering, and insufficient stock.
- [ ] Run focused tests; expect missing-module failures.
- [ ] Implement request normalization and authoritative item loading, then atomic stock reservation and order creation without later-week features.
- [ ] Run focused tests, full tests, Prisma validation, lint, and architecture check; expect all to pass.
- [ ] Commit with date `2026-10-29T17:30:00+07:00` and message `feat(orders): create orders with server-side inventory validation`.

### Task 5: Controlled order-status transitions — 2026-10-30

**Files:**
- Create: `src/app/api/orders/[id]/status/route.ts`
- Create: `src/server/modules/orders/order-status.service.ts`
- Create: `tests/order-status.test.ts`
- Modify: `src/server/modules/inventory/inventory.service.ts`

**Interfaces:**
- Consumes: existing order status, requested status, authenticated staff/admin session.
- Produces: `canTransitionOrderStatus(from, to)`, `updateOrderStatus(tx, id, to)`, and `PATCH /api/orders/[id]/status`.

- [ ] Write failing tests for allowed transitions, terminal-state rejection, same-state idempotence, cancellation stock release, and role rejection.
- [ ] Run focused tests; expect missing-module failures.
- [ ] Implement the transition map, transactional status service, release logic, and protected route.
- [ ] Run focused and full tests, lint, architecture check, and production build; expect all to pass.
- [ ] Commit with date `2026-10-30T17:30:00+07:00` and message `feat(orders): enforce controlled order status transitions`.
