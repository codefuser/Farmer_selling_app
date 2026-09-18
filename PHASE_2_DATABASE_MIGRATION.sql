-- ====================================================================
-- KISANDIRECT - PHASE 2 DATABASE MIGRATION
-- Target: Supabase PostgreSQL (PostgreSQL 15+)
-- Run this in Supabase SQL Editor
-- ====================================================================

-- 1. ALTER EXISTING TABLES (Safe, Non-Destructive, IF NOT EXISTS)

-- FarmerProfile: Add verificationStatus
ALTER TABLE "FarmerProfile" 
ADD COLUMN IF NOT EXISTS "verificationStatus" TEXT DEFAULT 'PENDING';

-- Delivery: Add deliveryMethod, deliveryProof, confirmedOtp, proofPhotoUrl
ALTER TABLE "Delivery" 
ADD COLUMN IF NOT EXISTS "deliveryMethod" TEXT DEFAULT 'STANDARD',
ADD COLUMN IF NOT EXISTS "deliveryProof" TEXT,
ADD COLUMN IF NOT EXISTS "confirmedOtp" TEXT,
ADD COLUMN IF NOT EXISTS "proofPhotoUrl" TEXT;

-- Order: Add deliveryMethod, deliveryFee, cancellation columns
ALTER TABLE "Order" 
ADD COLUMN IF NOT EXISTS "deliveryMethod" TEXT DEFAULT 'STANDARD',
ADD COLUMN IF NOT EXISTS "deliveryFee" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT,
ADD COLUMN IF NOT EXISTS "cancelledBy" TEXT,
ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMPTZ;

-- Rating: Add multi-dimensional scores (1-5)
ALTER TABLE "Rating" 
ADD COLUMN IF NOT EXISTS "qualityScore" INTEGER,
ADD COLUMN IF NOT EXISTS "freshnessScore" INTEGER,
ADD COLUMN IF NOT EXISTS "accuracyScore" INTEGER,
ADD COLUMN IF NOT EXISTS "communicationScore" INTEGER;

-- Ensure Rating has unique constraint on (orderId, fromUserId) to prevent duplicate reviews
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'Rating_orderId_fromUserId_key'
  ) THEN
    ALTER TABLE "Rating" ADD CONSTRAINT "Rating_orderId_fromUserId_key" UNIQUE ("orderId", "fromUserId");
  END IF;
EXCEPTION
  WHEN others THEN NULL;
END $$;


-- ====================================================================
-- 2. CREATE NEW PHASE 2 TABLES
-- ====================================================================

-- Table: DeliveryPricingRule
CREATE TABLE IF NOT EXISTS "DeliveryPricingRule" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "baseFee" DOUBLE PRECISION NOT NULL DEFAULT 30.0,
  "perKmRate" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
  "perKgRate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  "minDistanceKm" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "maxDistanceKm" DOUBLE PRECISION,
  "minWeightKg" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "maxWeightKg" DOUBLE PRECISION,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: FarmerCost (Input costs for farmer profit/loss tracking)
CREATE TABLE IF NOT EXISTS "FarmerCost" (
  "id" TEXT PRIMARY KEY,
  "farmerId" TEXT NOT NULL,
  "batchId" TEXT,
  "category" TEXT NOT NULL, -- SEED, FERTILIZER, PESTICIDE, LABOR, TRANSPORT, IRRIGATION, MACHINERY, OTHER
  "amount" DOUBLE PRECISION NOT NULL,
  "description" TEXT,
  "date" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FarmerCost_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "FarmerProfile"("id") ON DELETE CASCADE,
  CONSTRAINT "FarmerCost_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ProduceBatch"("id") ON DELETE SET NULL
);

-- Table: FarmerFollow (Buyers/users following trusted farmers)
CREATE TABLE IF NOT EXISTS "FarmerFollow" (
  "id" TEXT PRIMARY KEY,
  "followerId" TEXT NOT NULL,
  "farmerId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FarmerFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "FarmerFollow_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "FarmerProfile"("id") ON DELETE CASCADE,
  CONSTRAINT "FarmerFollow_followerId_farmerId_key" UNIQUE ("followerId", "farmerId")
);

-- Table: Wishlist (Saved produce batches or products)
CREATE TABLE IF NOT EXISTS "Wishlist" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "batchId" TEXT,
  "productId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Wishlist_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "ProduceBatch"("id") ON DELETE CASCADE,
  CONSTRAINT "Wishlist_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);

-- Table: PriceAlert (Threshold notifications for buyers)
CREATE TABLE IF NOT EXISTS "PriceAlert" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "targetPrice" DOUBLE PRECISION NOT NULL,
  "condition" TEXT NOT NULL DEFAULT 'LESS_THAN_EQUAL', -- LESS_THAN_EQUAL, GREATER_THAN_EQUAL
  "district" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "triggeredAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PriceAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "PriceAlert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE
);

-- Table: SearchHistory (Query analytics and recent searches)
CREATE TABLE IF NOT EXISTS "SearchHistory" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "query" TEXT NOT NULL,
  "category" TEXT,
  "district" TEXT,
  "resultCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Table: OrderCancellation (Formal cancellation log)
CREATE TABLE IF NOT EXISTS "OrderCancellation" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT NOT NULL UNIQUE,
  "cancelledByUserId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "comments" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OrderCancellation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
  CONSTRAINT "OrderCancellation_cancelledByUserId_fkey" FOREIGN KEY ("cancelledByUserId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Table: Refund (Refund transactions linked to orders and payments)
CREATE TABLE IF NOT EXISTS "Refund" (
  "id" TEXT PRIMARY KEY,
  "paymentId" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PROCESSED', -- PENDING, PROCESSED, FAILED
  "refundRef" TEXT,
  "processedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE,
  CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE
);

-- ====================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ====================================================================

CREATE INDEX IF NOT EXISTS "FarmerCost_farmerId_idx" ON "FarmerCost"("farmerId");
CREATE INDEX IF NOT EXISTS "FarmerCost_batchId_idx" ON "FarmerCost"("batchId");
CREATE INDEX IF NOT EXISTS "FarmerFollow_followerId_idx" ON "FarmerFollow"("followerId");
CREATE INDEX IF NOT EXISTS "FarmerFollow_farmerId_idx" ON "FarmerFollow"("farmerId");
CREATE INDEX IF NOT EXISTS "Wishlist_userId_idx" ON "Wishlist"("userId");
CREATE INDEX IF NOT EXISTS "PriceAlert_userId_idx" ON "PriceAlert"("userId");
CREATE INDEX IF NOT EXISTS "PriceAlert_productId_idx" ON "PriceAlert"("productId");
CREATE INDEX IF NOT EXISTS "SearchHistory_userId_idx" ON "SearchHistory"("userId");
CREATE INDEX IF NOT EXISTS "Refund_orderId_idx" ON "Refund"("orderId");
CREATE INDEX IF NOT EXISTS "Refund_paymentId_idx" ON "Refund"("paymentId");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_buyerId_idx" ON "Order"("buyerId");
CREATE INDEX IF NOT EXISTS "OrderItem_farmerId_idx" ON "OrderItem"("farmerId");
CREATE INDEX IF NOT EXISTS "OrderItem_batchId_idx" ON "OrderItem"("batchId");

-- ====================================================================
-- 4. DEFAULT SEED DATA (DeliveryPricingRule)
-- ====================================================================

INSERT INTO "DeliveryPricingRule" ("id", "name", "baseFee", "perKmRate", "perKgRate", "minDistanceKm", "maxDistanceKm", "minWeightKg", "maxWeightKg", "isActive", "createdAt", "updatedAt")
VALUES 
  ('rule_standard_local', 'Standard Local (<15km)', 30.0, 4.0, 0.75, 0.0, 15.0, 0.0, 500.0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rule_standard_regional', 'Regional Delivery (15-50km)', 50.0, 6.0, 1.25, 15.0, 50.0, 0.0, 1000.0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('rule_express', 'Express Priority', 80.0, 8.0, 1.50, 0.0, 50.0, 0.0, 200.0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
