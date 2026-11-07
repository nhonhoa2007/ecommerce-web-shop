# Full Admin Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the 12 Admin sections and their required actions from `shop-qr-payment` into `ecommerce-web-shop` as buildable, permission-checked increments.

**Architecture:** Create the role-aware Admin shell first. Migrate each domain's server operation, API, page, and view together; only then expose its navigation entry. Reuse existing Prisma models and services where equivalent, keeping the source project as a read-only reference.

**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma 6, NextAuth, Node test runner.

**Spec:** `docs/superpowers/specs/2026-11-07-full-admin-parity-design.md`

## Global Constraints
- Preserve Week 1–4 history and existing user changes.
- English Conventional Commit messages, no AI attribution.
- Do not push.
- Each slice needs route authorization, focused tests, lint, architecture check, and build.
- A navigation item appears only after its page and operations are functional.

## Review Focus
- A Staff user without the section permission cannot see or call it.
- Admin-only financial and role-changing actions cannot be called by Staff.
- List pages must not accidentally leak secrets or unrelated customer data.
- Mutating actions must validate inputs and report failures without silent success.
- Every navigation link must resolve to a working page.

---

### Task 1: Admin shell and route permissions
**Files:** `src/app/admin/layout.tsx`, `src/client/components/admin/layout/AdminAppShell.tsx`, `src/client/components/admin/layout/admin-navigation.ts`, `src/shared/admin-page-access.ts`, `tests/admin-page-access.test.ts`.
**Interfaces:** `canAccessAdminPage(user, pathname)` and `getVisibleAdminNavGroups(user)`; shell wraps existing `/admin` and `/admin/orders`.
- [ ] Write failing role/navigation tests; run RED.
- [ ] Implement shell and only existing links; run tests, lint, architecture check, build.
- [ ] Commit `feat(admin): add role-aware admin shell`.

### Task 2: Products and variants
**Files:** `src/app/admin/products/page.tsx`, `src/client/views/admin/AdminProductsView.tsx`, relevant product routes and server services, `tests/admin-products.test.ts`.
**Interfaces:** protected list/create/update/deactivate product and variant operations.
- [ ] Write failing authorization and product mutation tests; run RED.
- [ ] Transfer source behaviors to existing catalog service and page; run full verification.
- [ ] Commit `feat(admin): add product and variant management`.

### Task 3: Customers and Staff permissions
**Files:** `src/app/admin/customers/page.tsx`, `src/app/api/admin/customers/route.ts`, `src/client/views/admin/AdminCustomersView.tsx`, tests.
**Interfaces:** Admin-only customer list and Staff permission grants using current RBAC service.
- [ ] Write RED tests for role changes and permission restrictions.
- [ ] Implement, verify, and commit.

### Task 4: Commerce operations
**Files:** orders, transactions, coupons, shipments pages, views, API routes and services, tests.
**Interfaces:** each section is independently authorized; payment and order actions retain their transaction invariants.
- [ ] Migrate orders details and status actions, verify and commit.
- [ ] Migrate transactions, verify and commit.
- [ ] Migrate coupons, verify and commit.
- [ ] Migrate shipments, verify and commit.

### Task 5: Customer service and after-sales
**Files:** chat, reviews, warranties, returns, audit logs pages, views, routes, services, tests.
**Interfaces:** per-section role checks and source-compatible DTOs.
- [ ] Migrate chat and reviews with tests; verify and commit each.
- [ ] Migrate warranties and returns with tests; verify and commit each.
- [ ] Migrate audit logs with tests; verify and commit.

### Task 6: Dashboard parity and final audit
**Files:** Admin dashboard cards/analytics, `tests/admin-parity.test.ts`.
**Interfaces:** source-equivalent dashboard data and 12 navigable sections with valid operations.
- [ ] Write parity audit tests and compare source/destination inventory.
- [ ] Add missing dashboard widgets and queries; verify all routes, role cases, tests, lint, architecture, and build.
- [ ] Commit `feat(admin): complete dashboard and section parity`.
