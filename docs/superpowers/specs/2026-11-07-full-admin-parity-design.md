# Full Admin Parity Design

## Intent

Bring the entire Admin area of `/home/nhonhoa/shop-qr-payment` into `ecommerce-web-shop`, not only the Week 4 dashboard and orders subset. The source currently has 12 Admin pages, about 88 Admin related files, and supporting payment, shipping, chat, review, warranty, return, inventory, and audit modules. The destination currently exposes only `/admin` and `/admin/orders`.

## Approaches

1. **Selected from the conversation: migrate by working feature slice.** Transfer the source behavior, API, permissions, UI, and tests of one group at a time. Keep every checkpoint buildable and the menu limited to available pages. This preserves the destination history and makes missing dependencies visible.
2. Copy all Admin files at once. This is faster to start but most source imports point into systems absent from the destination; the application would not build or would have dead controls.
3. Replace the destination with the source snapshot. This would bring all Admin behavior but overwrite the staged weekly project and its independent history.

## Scope and order

1. **Admin foundation:** role aware `/admin` layout, sidebar and topbar, per page access rules, shared empty/error states. Existing dashboard and order report move inside the shell. Admin sees all available sections; Staff sees only granted sections.
2. **Catalog and customers:** product/variant management, media upload as needed, customer list and Staff permission management. Reuse the current catalog and RBAC services where equivalent; port missing operations with their routes.
3. **Commerce operations:** order detail and status actions, payment transaction review, coupons, shipments, and related API routes. A control is not displayed until its server operation is present.
4. **Customer service:** chat and reviews with role checks and the source's data contracts.
5. **After sales and audit:** warranty cases, returns, and audit log pages with their supporting services.
6. **Dashboard parity:** source KPI cards, trends, recent orders, alerts, and widgets. Each metric is derived from persisted data; Staff responses omit financial fields unless explicit authority is established.

## Constraints

- The source project is a reference, not a filesystem dependency of the destination.
- Preserve existing Week 1–4 commits and uncommitted user changes.
- Use English Conventional Commit messages with no AI attribution.
- Do not push without an explicit request.
- Each slice includes its UI, API, authorization, relevant tests, lint, architecture check, and build before commit.
- Never show links or actions leading to missing routes.
- New features beyond the Week 4 syllabus necessarily move the visible staged project ahead of the academic weekly plan; record this clearly in commit messages and status reports.

## Verification

Audit route and API parity against the source inventory; verify each role's navigation and server access independently. Test write operations against the database transaction rules. Test page rendering with real session shapes and representative data. The final check compares all 12 source Admin sections and their required actions, not merely a successful build.
