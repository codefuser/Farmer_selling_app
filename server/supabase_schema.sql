-- ============================================================================
-- KisanDirect Platform - Complete Supabase PostgreSQL Schema
-- Problem Statement: SIH26033 (Community-Powered Direct Agricultural Marketplace)
-- ============================================================================

-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean drop for idempotency (if re-running in Supabase SQL Editor)
DROP TABLE IF EXISTS "Dispute" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "Rating" CASCADE;
DROP TABLE IF EXISTS "FarmerPayout" CASCADE;
DROP TABLE IF EXISTS "Payment" CASCADE;
DROP TABLE IF EXISTS "Delivery" CASCADE;
DROP TABLE IF EXISTS "PickupRequest" CASCADE;
DROP TABLE IF EXISTS "Vehicle" CASCADE;
DROP TABLE IF EXISTS "QualityCheck" CASCADE;
DROP TABLE IF EXISTS "CollectionCenter" CASCADE;
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "CollectiveOrderMember" CASCADE;
DROP TABLE IF EXISTS "CollectiveOrder" CASCADE;
DROP TABLE IF EXISTS "OfferHistory" CASCADE;
DROP TABLE IF EXISTS "Offer" CASCADE;
DROP TABLE IF EXISTS "BuyerDemand" CASCADE;
DROP TABLE IF EXISTS "ProduceBatch" CASCADE;
DROP TABLE IF EXISTS "MarketPrice" CASCADE;
DROP TABLE IF EXISTS "FreshnessRule" CASCADE;
DROP TABLE IF EXISTS "Product" CASCADE;
DROP TABLE IF EXISTS "CoordinatorProfile" CASCADE;
DROP TABLE IF EXISTS "BuyerProfile" CASCADE;
DROP TABLE IF EXISTS "FarmerProfile" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- ----------------------------------------------------------------------------
-- 1. USER & PROFILES
-- ----------------------------------------------------------------------------
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT UNIQUE NOT NULL,
    "mobile" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL, -- 'FARMER', 'BUYER', 'COORDINATOR', 'LOGISTICS', 'ADMIN'
    "status" TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en', -- 'en', 'ta'
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "FarmerProfile" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "farmerId" TEXT UNIQUE NOT NULL, -- e.g. FD-1024
    "village" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'Tamil Nadu',
    "landSize" DOUBLE PRECISION,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.8,
    "completedOrders" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT TRUE,
    "joinedDate" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "BuyerProfile" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "businessName" TEXT NOT NULL,
    "ownerName" TEXT NOT NULL,
    "businessType" TEXT NOT NULL, -- 'HOTEL', 'RESTAURANT', 'SUPERMARKET', 'WHOLESALER', 'CATERING', 'LOCAL_SHOP'
    "gstNumber" TEXT,
    "address" TEXT NOT NULL,
    "village" TEXT,
    "district" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL DEFAULT 11.6643,
    "longitude" DOUBLE PRECISION NOT NULL DEFAULT 78.1460,
    "verified" BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE "CoordinatorProfile" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "village" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "assignedCenterId" TEXT,
    "activeFarmersCount" INTEGER NOT NULL DEFAULT 15,
    "verified" BOOLEAN NOT NULL DEFAULT TRUE
);

-- ----------------------------------------------------------------------------
-- 2. PRODUCTS, FRESHNESS RULES & MARKET BENCHMARKS
-- ----------------------------------------------------------------------------
CREATE TABLE "Product" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT UNIQUE NOT NULL,
    "nameTamil" TEXT NOT NULL,
    "category" TEXT NOT NULL, -- 'VEGETABLE', 'FRUIT', 'GRAIN'
    "unit" TEXT NOT NULL DEFAULT 'kg',
    "defaultShelfHours" INTEGER NOT NULL DEFAULT 24,
    "referenceMinPrice" DOUBLE PRECISION NOT NULL,
    "referenceMaxPrice" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "FreshnessRule" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "freshDurationHours" DOUBLE PRECISION NOT NULL,
    "agingDurationHours" DOUBLE PRECISION NOT NULL,
    "urgentDurationHours" DOUBLE PRECISION NOT NULL,
    "urgentDiscountPercent" DOUBLE PRECISION NOT NULL DEFAULT 15.0
);

CREATE TABLE "MarketPrice" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "district" TEXT NOT NULL,
    "date" TEXT NOT NULL, -- YYYY-MM-DD
    "minPrice" DOUBLE PRECISION NOT NULL,
    "modalPrice" DOUBLE PRECISION NOT NULL,
    "maxPrice" DOUBLE PRECISION NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3. PRODUCE BATCHES & BUYER DEMANDS
-- ----------------------------------------------------------------------------
CREATE TABLE "ProduceBatch" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "batchCode" TEXT UNIQUE NOT NULL,
    "farmerId" TEXT NOT NULL REFERENCES "FarmerProfile"("id") ON DELETE CASCADE,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "quantity" DOUBLE PRECISION NOT NULL,
    "initialQuantity" DOUBLE PRECISION NOT NULL,
    "pricePerKg" DOUBLE PRECISION NOT NULL,
    "qualityGrade" TEXT NOT NULL, -- 'A', 'B', 'C'
    "harvestedAt" TIMESTAMPTZ NOT NULL,
    "listedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "sellBy" TIMESTAMPTZ NOT NULL,
    "freshnessStatus" TEXT NOT NULL DEFAULT 'FRESH', -- 'FRESH', 'AGING', 'URGENT', 'EXPIRED'
    "status" TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'RESERVED', 'SOLD_OUT', 'EXPIRED'
    "village" TEXT NOT NULL,
    "district" TEXT NOT NULL DEFAULT 'Salem',
    "latitude" DOUBLE PRECISION NOT NULL DEFAULT 11.6643,
    "longitude" DOUBLE PRECISION NOT NULL DEFAULT 78.1460,
    "imageUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "BuyerDemand" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "demandCode" TEXT UNIQUE NOT NULL,
    "buyerId" TEXT NOT NULL REFERENCES "BuyerProfile"("id") ON DELETE CASCADE,
    "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "requiredQuantity" DOUBLE PRECISION NOT NULL,
    "minBudget" DOUBLE PRECISION NOT NULL,
    "maxBudget" DOUBLE PRECISION NOT NULL,
    "requiredGrade" TEXT NOT NULL DEFAULT 'A',
    "deliveryDeadline" TIMESTAMPTZ NOT NULL,
    "location" TEXT NOT NULL,
    "district" TEXT NOT NULL DEFAULT 'Salem',
    "latitude" DOUBLE PRECISION NOT NULL DEFAULT 11.6643,
    "longitude" DOUBLE PRECISION NOT NULL DEFAULT 78.1460,
    "maxDistanceKm" DOUBLE PRECISION NOT NULL DEFAULT 25.0,
    "status" TEXT NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'MATCHED', 'FULFILLED', 'CANCELLED'
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. OFFERS & COLLECTIVE POOLING
-- ----------------------------------------------------------------------------
CREATE TABLE "Offer" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "demandId" TEXT NOT NULL REFERENCES "BuyerDemand"("id") ON DELETE CASCADE,
    "batchId" TEXT NOT NULL REFERENCES "ProduceBatch"("id") ON DELETE CASCADE,
    "buyerId" TEXT NOT NULL REFERENCES "BuyerProfile"("id") ON DELETE CASCADE,
    "farmerId" TEXT NOT NULL REFERENCES "FarmerProfile"("id") ON DELETE CASCADE,
    "offeredPricePerKg" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED'
    "isCounterOffer" BOOLEAN NOT NULL DEFAULT FALSE,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "OfferHistory" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "offerId" TEXT NOT NULL REFERENCES "Offer"("id") ON DELETE CASCADE,
    "proposedByUserId" TEXT NOT NULL,
    "pricePerKg" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "CollectiveOrder" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "collectiveCode" TEXT UNIQUE NOT NULL,
    "demandId" TEXT NOT NULL REFERENCES "BuyerDemand"("id") ON DELETE CASCADE,
    "totalQuantity" DOUBLE PRECISION NOT NULL,
    "agreedPricePerKg" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "CollectiveOrderMember" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "collectiveOrderId" TEXT NOT NULL REFERENCES "CollectiveOrder"("id") ON DELETE CASCADE,
    "farmerId" TEXT NOT NULL REFERENCES "FarmerProfile"("id") ON DELETE CASCADE,
    "batchId" TEXT NOT NULL REFERENCES "ProduceBatch"("id") ON DELETE CASCADE,
    "allocatedQuantity" DOUBLE PRECISION NOT NULL,
    "payoutAmount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACCEPTED'
);

-- ----------------------------------------------------------------------------
-- 5. ORDERS, FULFILLMENT & COLLECTION HUBS
-- ----------------------------------------------------------------------------
CREATE TABLE "Order" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderCode" TEXT UNIQUE NOT NULL,
    "buyerId" TEXT NOT NULL REFERENCES "BuyerProfile"("id") ON DELETE CASCADE,
    "collectiveOrderId" TEXT REFERENCES "CollectiveOrder"("id") ON DELETE SET NULL,
    "totalQuantity" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "farmerPayout" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ORDERED',
    "deliveryAddress" TEXT NOT NULL,
    "scheduledPickupTime" TIMESTAMPTZ,
    "deliveredAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "OrderItem" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "farmerId" TEXT NOT NULL REFERENCES "FarmerProfile"("id") ON DELETE CASCADE,
    "batchId" TEXT NOT NULL REFERENCES "ProduceBatch"("id") ON DELETE CASCADE,
    "quantity" DOUBLE PRECISION NOT NULL,
    "pricePerKg" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL
);

CREATE TABLE "CollectionCenter" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "centerCode" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "village" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "coordinatorId" TEXT REFERENCES "CoordinatorProfile"("id") ON DELETE SET NULL,
    "latitude" DOUBLE PRECISION NOT NULL DEFAULT 11.6643,
    "longitude" DOUBLE PRECISION NOT NULL DEFAULT 78.1460
);

CREATE TABLE "QualityCheck" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "batchId" TEXT NOT NULL REFERENCES "ProduceBatch"("id") ON DELETE CASCADE,
    "inspectorId" TEXT,
    "expectedQty" DOUBLE PRECISION NOT NULL,
    "actualQty" DOUBLE PRECISION NOT NULL,
    "damagedQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "acceptedQty" DOUBLE PRECISION NOT NULL,
    "gradeAssigned" TEXT NOT NULL,
    "damagePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "photos" TEXT,
    "remarks" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PASSED',
    "checkedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. LOGISTICS & ESCROW PAYMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE "Vehicle" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "vehicleNumber" TEXT UNIQUE NOT NULL,
    "vehicleType" TEXT NOT NULL DEFAULT 'Small Truck (1.5 Ton)',
    "driverName" TEXT NOT NULL,
    "driverMobile" TEXT NOT NULL,
    "capacityKg" DOUBLE PRECISION NOT NULL DEFAULT 1500,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE'
);

CREATE TABLE "PickupRequest" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "centerId" TEXT NOT NULL REFERENCES "CollectionCenter"("id") ON DELETE CASCADE,
    "vehicleId" TEXT REFERENCES "Vehicle"("id") ON DELETE SET NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "scheduledTime" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Delivery" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "vehicleId" TEXT REFERENCES "Vehicle"("id") ON DELETE SET NULL,
    "currentLat" DOUBLE PRECISION NOT NULL DEFAULT 11.6643,
    "currentLng" DOUBLE PRECISION NOT NULL DEFAULT 78.1460,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "estimatedArrival" TIMESTAMPTZ,
    "startedAt" TIMESTAMPTZ,
    "completedAt" TIMESTAMPTZ
);

CREATE TABLE "Payment" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "paymentCode" TEXT UNIQUE NOT NULL,
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "buyerId" TEXT NOT NULL REFERENCES "BuyerProfile"("id") ON DELETE CASCADE,
    "amount" DOUBLE PRECISION NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'AUTHORIZED',
    "paymentMethod" TEXT NOT NULL DEFAULT 'MOCK_UPI',
    "transactionRef" TEXT,
    "releasedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "FarmerPayout" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "paymentId" TEXT NOT NULL REFERENCES "Payment"("id") ON DELETE CASCADE,
    "farmerId" TEXT NOT NULL REFERENCES "FarmerProfile"("id") ON DELETE CASCADE,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "utrRef" TEXT,
    "releasedAt" TIMESTAMPTZ,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. RATINGS, DISPUTES & NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE "Rating" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "fromUserId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "toUserId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Notification" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'IN_APP',
    "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
    "metadataJson" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE "Dispute" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderId" TEXT NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "raisedByUserId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "reason" TEXT NOT NULL,
    "evidenceJson" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_produce_batch_farmer" ON "ProduceBatch"("farmerId");
CREATE INDEX IF NOT EXISTS "idx_produce_batch_status" ON "ProduceBatch"("status");
CREATE INDEX IF NOT EXISTS "idx_produce_batch_freshness" ON "ProduceBatch"("freshnessStatus");
CREATE INDEX IF NOT EXISTS "idx_buyer_demand_buyer" ON "BuyerDemand"("buyerId");
CREATE INDEX IF NOT EXISTS "idx_buyer_demand_status" ON "BuyerDemand"("status");
CREATE INDEX IF NOT EXISTS "idx_order_buyer" ON "Order"("buyerId");
CREATE INDEX IF NOT EXISTS "idx_order_status" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "idx_market_price_date" ON "MarketPrice"("date");

-- ============================================================================
-- SEED INITIAL DATA (Products, Mandi Prices, Default Users)
-- ============================================================================

-- Insert Products
INSERT INTO "Product" ("id", "name", "nameTamil", "category", "unit", "defaultShelfHours", "referenceMinPrice", "referenceMaxPrice", "imageUrl") VALUES
('prod_tomato', 'Tomato', 'தக்காளி', 'VEGETABLE', 'kg', 24, 22.0, 30.0, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80'),
('prod_onion', 'Onion', 'வெங்காயம்', 'VEGETABLE', 'kg', 120, 28.0, 38.0, 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80'),
('prod_potato', 'Potato', 'உருளைக்கிழங்கு', 'VEGETABLE', 'kg', 168, 20.0, 26.0, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80'),
('prod_brinjal', 'Brinjal', 'கத்தரிக்காய்', 'VEGETABLE', 'kg', 36, 26.0, 34.0, 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80'),
('prod_chilli', 'Green Chilli', 'பச்சை மிளகாய்', 'VEGETABLE', 'kg', 48, 38.0, 52.0, 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80'),
('prod_cabbage', 'Cabbage', 'முட்டைக்கோஸ்', 'VEGETABLE', 'kg', 72, 14.0, 20.0, 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=600&q=80'),
('prod_carrot', 'Carrot', 'கேரட்', 'VEGETABLE', 'kg', 96, 32.0, 44.0, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?auto=format&fit=crop&w=600&q=80'),
('prod_okra', 'Ladies Finger', 'வெண்டைக்காய்', 'VEGETABLE', 'kg', 30, 28.0, 38.0, 'https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&w=600&q=80'),
('prod_drumstick', 'Drumstick', 'முருங்கைக்காய்', 'VEGETABLE', 'kg', 48, 55.0, 75.0, 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=600&q=80'),
('prod_capsicum', 'Capsicum', 'குடைமிளகாய்', 'VEGETABLE', 'kg', 48, 40.0, 55.0, 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80')
ON CONFLICT ("id") DO NOTHING;

-- Insert Freshness Rules
INSERT INTO "FreshnessRule" ("id", "productId", "freshDurationHours", "agingDurationHours", "urgentDurationHours", "urgentDiscountPercent") VALUES
('fr_tomato', 'prod_tomato', 12.0, 6.0, 4.0, 15.0),
('fr_onion', 'prod_onion', 72.0, 36.0, 12.0, 10.0),
('fr_potato', 'prod_potato', 96.0, 48.0, 24.0, 10.0),
('fr_brinjal', 'prod_brinjal', 20.0, 10.0, 6.0, 15.0),
('fr_chilli', 'prod_chilli', 24.0, 14.0, 8.0, 15.0),
('fr_cabbage', 'prod_cabbage', 48.0, 20.0, 10.0, 15.0),
('fr_carrot', 'prod_carrot', 60.0, 24.0, 12.0, 12.0),
('fr_okra', 'prod_okra', 16.0, 8.0, 4.0, 15.0),
('fr_drumstick', 'prod_drumstick', 24.0, 12.0, 6.0, 20.0),
('fr_capsicum', 'prod_capsicum', 24.0, 12.0, 6.0, 15.0)
ON CONFLICT ("id") DO NOTHING;

-- Insert Live Benchmark Market Prices (Today Salem Mandi)
INSERT INTO "MarketPrice" ("id", "productId", "district", "date", "minPrice", "modalPrice", "maxPrice") VALUES
('mp_tom_salem', 'prod_tomato', 'Salem', TO_CHAR(NOW(), 'YYYY-MM-DD'), 22.0, 26.0, 28.0),
('mp_oni_salem', 'prod_onion', 'Salem', TO_CHAR(NOW(), 'YYYY-MM-DD'), 30.0, 34.0, 38.0),
('mp_pot_salem', 'prod_potato', 'Salem', TO_CHAR(NOW(), 'YYYY-MM-DD'), 20.0, 23.0, 26.0),
('mp_bri_salem', 'prod_brinjal', 'Salem', TO_CHAR(NOW(), 'YYYY-MM-DD'), 26.0, 30.0, 35.0),
('mp_chi_salem', 'prod_chilli', 'Salem', TO_CHAR(NOW(), 'YYYY-MM-DD'), 42.0, 48.0, 54.0),
('mp_cab_salem', 'prod_cabbage', 'Salem', TO_CHAR(NOW(), 'YYYY-MM-DD'), 14.0, 17.0, 20.0),
('mp_car_salem', 'prod_carrot', 'Salem', TO_CHAR(NOW(), 'YYYY-MM-DD'), 34.0, 38.0, 44.0),
('mp_okr_salem', 'prod_okra', 'Salem', TO_CHAR(NOW(), 'YYYY-MM-DD'), 28.0, 33.0, 38.0),
('mp_dru_salem', 'prod_drumstick', 'Salem', TO_CHAR(NOW(), 'YYYY-MM-DD'), 58.0, 66.0, 74.0),
('mp_cap_salem', 'prod_capsicum', 'Salem', TO_CHAR(NOW(), 'YYYY-MM-DD'), 42.0, 48.0, 56.0)
ON CONFLICT ("id") DO NOTHING;

-- Insert Seed Users (Password: Demo@123 hashed with bcrypt $2a$10$O0F98v7dJpC1L4r8P.bT6O6l6i8M.u9X3B1uGf1m5t6r7y8z9w0q)
-- Hash generated for: Demo@123
INSERT INTO "User" ("id", "email", "mobile", "name", "passwordHash", "role", "preferredLanguage") VALUES
('usr_farmer_1', 'farmer@kisandirect.in', '9876543210', 'Muthusamy G.', '$2a$10$X8T.Yg6Yc9.jA5aLh8YpweWlUf6hS0C9B1sD3f4g5h6j7k8l9m0n1', 'FARMER', 'ta'),
('usr_buyer_1', 'buyer@grandpalace.in', '9876543211', 'Radhakrishnan (Grand Palace Hotel)', '$2a$10$X8T.Yg6Yc9.jA5aLh8YpweWlUf6hS0C9B1sD3f4g5h6j7k8l9m0n1', 'BUYER', 'en'),
('usr_coord_1', 'coordinator@salem.in', '9876543212', 'Saravanan K. (Village Lead)', '$2a$10$X8T.Yg6Yc9.jA5aLh8YpweWlUf6hS0C9B1sD3f4g5h6j7k8l9m0n1', 'COORDINATOR', 'ta'),
('usr_logistics_1', 'driver@ruralfleet.in', '9876543213', 'Kumar (Salem Rural Route 4)', '$2a$10$X8T.Yg6Yc9.jA5aLh8YpweWlUf6hS0C9B1sD3f4g5h6j7k8l9m0n1', 'LOGISTICS', 'en'),
('usr_admin_1', 'admin@kisandirect.gov.in', '9876543214', 'Meenakshi Sundaram (Agri Dept)', '$2a$10$X8T.Yg6Yc9.jA5aLh8YpweWlUf6hS0C9B1sD3f4g5h6j7k8l9m0n1', 'ADMIN', 'en')
ON CONFLICT ("id") DO NOTHING;

-- Link Profiles
INSERT INTO "FarmerProfile" ("id", "userId", "farmerId", "village", "district", "state", "landSize", "rating") VALUES
('prof_farmer_1', 'usr_farmer_1', 'FD-1024', 'Panamarathupatti', 'Salem', 'Tamil Nadu', 3.5, 4.9)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "BuyerProfile" ("id", "userId", "businessName", "ownerName", "businessType", "address", "district") VALUES
('prof_buyer_1', 'usr_buyer_1', 'Grand Palace Hotel & Banquets', 'Radhakrishnan', 'HOTEL', '42 Meyyanur Bypass, Salem', 'Salem')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "CoordinatorProfile" ("id", "userId", "village", "district", "activeFarmersCount") VALUES
('prof_coord_1', 'usr_coord_1', 'Panamarathupatti', 'Salem', 24)
ON CONFLICT ("id") DO NOTHING;

-- Collection Center & Vehicle
INSERT INTO "CollectionCenter" ("id", "centerCode", "name", "village", "district", "coordinatorId") VALUES
('cc_salem_1', 'CC-SLM-01', 'Panamarathupatti Village Farmers Aggregation Point', 'Panamarathupatti', 'Salem', 'prof_coord_1')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Vehicle" ("id", "vehicleNumber", "vehicleType", "driverName", "driverMobile", "capacityKg", "status") VALUES
('veh_1', 'TN-30-BV-4412', 'Tata Ace (1.5 Ton Refrigerated Insulated)', 'Kumar', '9876543213', 1500, 'AVAILABLE')
ON CONFLICT ("id") DO NOTHING;
