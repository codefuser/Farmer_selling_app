# KisanDirect - Phase 2 Database Setup & Migration Guide

## 1. Overview
This guide instructs how to apply the Phase 2 database changes for KisanDirect on your **Supabase PostgreSQL** project.

The migration file is located at the root of the repository:
`PHASE_2_DATABASE_MIGRATION.sql`

All queries use non-destructive clauses (`IF NOT EXISTS`, `ON CONFLICT DO NOTHING`) so existing Phase 1 users, batches, orders, and chats will remain intact.

---

## 2. Step-by-Step Supabase Execution

1. Open your browser and navigate to your Supabase project:
   **https://supabase.com/dashboard/project/xlqtjczjoyaxahoaunuh**
2. In the left navigation sidebar, click on **SQL Editor** (icon: `>_`).
3. Click **"+ New query"** at the top.
4. Copy the entire contents of [`PHASE_2_DATABASE_MIGRATION.sql`](./PHASE_2_DATABASE_MIGRATION.sql).
5. Paste it into the query pane.
6. Click **Run** (or press `Ctrl + Enter` / `Cmd + Enter`).
7. Confirm that the output status displays **"Success. No rows returned"** (or table creation notices).

---

## 3. What Was Added in Phase 2

### Existing Tables Altered:
- **`FarmerProfile`**: Added `verificationStatus` (`PENDING`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`, `SUSPENDED`).
- **`Delivery`**: Added `deliveryMethod` (`STANDARD`, `EXPRESS`, `FARMER_DIRECT`, `SELF_PICKUP`), `deliveryProof`, `confirmedOtp`, and `proofPhotoUrl`.
- **`Order`**: Added `deliveryMethod`, `deliveryFee`, `cancellationReason`, `cancelledBy`, `cancelledAt`.
- **`Rating`**: Added dimension scores (`qualityScore`, `freshnessScore`, `accuracyScore`, `communicationScore` [1-5]) and unique constraint on `(orderId, fromUserId)`.

### New Tables Created:
- **`DeliveryPricingRule`**: Dynamic rules for base fee, per-km rate, and per-kg weight rate.
- **`FarmerCost`**: Tracks farmer's actual production costs (seeds, fertilizer, labor, transport) to calculate real net profit.
- **`FarmerFollow`**: Enables buyers and users to follow specific farmers.
- **`Wishlist`**: Allows users to save favorite batches and produce.
- **`PriceAlert`**: Automated alert triggers when commodity prices meet buyer thresholds.
- **`SearchHistory`**: Logs search queries for auto-complete and demand analytics.
- **`OrderCancellation`**: Formal audit record of cancellations with reasons.
- **`Refund`**: Financial refund records linked to payment and order.

---

## 4. Verifying the Migration

In Supabase **Table Editor**, you can verify that the new tables are visible:
- `DeliveryPricingRule` (contains 3 default seeded pricing tiers)
- `FarmerCost`
- `FarmerFollow`
- `Wishlist`
- `PriceAlert`
- `SearchHistory`
- `OrderCancellation`
- `Refund`

And in `FarmerProfile`, `Order`, `Delivery`, and `Rating`, verify that the new columns are present.
