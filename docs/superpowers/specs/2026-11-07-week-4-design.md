# Week 4 Design

## Intent
Reconstruct the syllabus Week 4 from `shop-qr-payment` in `ecommerce-web-shop`: QR payment display and order confirmation, Admin/Staff dashboard, and revenue/order reports.

## Approaches
1. Selected: migrate the source project's focused payment and analytics ideas, adapting them to the smaller Week 3 schema and routes. This keeps each daily checkpoint usable.
2. Replay source modules wholesale. This would also import wallet, shipping, webhook reconciliation, and other later dependencies.

## Boundaries
Bank details come only from environment variables. The QR amount and transfer code come from the persisted order. Showing a QR never marks an order paid. A permitted operator confirms payment after checking the bank transfer, with a conditional database update to prevent duplicate confirmation. Revenue counts only PAID orders; Staff receive operational order counts without revenue. Dashboard queries are guarded on the server. No remote push.

## Commit schedule
- 02/11: QR URL generation and payment display.
- 04/11: operator payment confirmation.
- 06/11 morning: analytics queries and protected API.
- 06/11 afternoon: Admin/Staff dashboard.
- 07/11: order report table and final verification.
