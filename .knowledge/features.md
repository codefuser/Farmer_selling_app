# 🌟 KisanDirect Feature Knowledge Map

> **Repository**: `Farmer_selling_app`  
> Complete stack trace for all 8 core platform innovations, tracing from UI presentation down to database entities and external integrations.

---

## 1. Feature: Reverse-Demand Collective Supply Pooling (`feature:collective-selling`)

### Core Concept & Innovation
Smallholder farmers typically harvest 50–300 kg at a time, whereas commercial buyers (hotels, catering services, supermarkets) require 500–2000 kg. Middlemen exploit this imbalance by aggregating small farmers at distressed prices. **Collective Supply Pooling (கூட்டு விற்பனை)** reverses this dynamic by allowing commercial buyers to post bulk demands and letting the platform automatically aggregate multiple local farmers into a single consolidated supply pool with guaranteed fair pricing.

### Vertical Stack Trace
```
Feature: Reverse-Demand Collective Supply Pooling (கூட்டு விற்பனை)
    ↓
UI Screen: Smart Matches View (`client/src/features/buyer/SmartMatches.tsx`)
    ↓
Components: `SmartMatches`, `DemoScenarioBar` (Trigger Scenario 1)
    ↓
Hooks/State: `useLanguage`, `useAuth`
    ↓
API Endpoint: `POST /api/buyers/demands/:id/collective-order` (`server/src/routes/buyerRoutes.ts:L299-L330`)
    ↓
Service: `CollectiveSellingService.createCollectiveOrder` (`server/src/services/collectiveSellingService.ts:L19-L152`)
    ↓
Database Tables: `BuyerDemand`, `CollectiveOrder`, `CollectiveOrderMember`, `Order`, `OrderItem`, `ProduceBatch`, `Payment`, `Notification`
    ↓
External Integrations: Mock UPI Escrow Payment, SMS/WhatsApp Mock Notifications
```

### Business Rules & Constraints
1. **Atomic Transaction**: The entire pooled order creation must execute inside a Prisma interactive transaction (`prisma.$transaction`).
2. **Stock Verification**: Every contributing farmer's batch quantity must be verified before deduction to prevent race conditions or overselling.
3. **Escrow Split**: Total amount is held in escrow. Platform fee (2%) is calculated; net payout (98%) is reserved for contributing farmers based on their allocated quantities.
4. **Status Advancement**: Upon collective creation, `BuyerDemand.status` transitions from `OPEN` to `MATCHED`.

---

## 2. Feature: Perishable Freshness Decay & Dynamic Discount Engine (`feature:freshness-decay-engine`)

### Core Concept & Innovation
Agricultural produce deteriorates rapidly after harvest. Middlemen weaponize decay to force farmers into distress sales. KisanDirect models post-harvest freshness algorithmically using time-based decay windows, automatically transitioning produce through 4 stages (`FRESH` -> `AGING` -> `URGENT` -> `EXPIRED`) and applying transparent, predefined discounts to ensure swift liquidation before spoilage.

### Vertical Stack Trace
```
Feature: Perishable Freshness Decay & Dynamic Discount Engine
    ↓
UI Presentation: Marketplace & Batch Cards (`client/src/features/buyer/Marketplace.tsx`, `client/src/features/farmer/MyProduce.tsx`)
    ↓
Components: `FreshnessBadge` (`client/src/components/common/FreshnessBadge.tsx`), `DemoScenarioBar` (Trigger Scenario 2)
    ↓
Hooks/State: `useLanguage`
    ↓
API Endpoints:
    • `POST /api/demo/simulate-urgency` (`server/src/routes/demoRoutes.ts:L9-L61`)
    • `POST /api/demo/simulate-expiry` (`server/src/routes/demoRoutes.ts:L64-L106`)
    • `GET /api/farmers/dashboard` (`server/src/routes/farmerRoutes.ts:L38-L120`)
    ↓
Service: `FreshnessService.calculateFreshness` & `FreshnessService.evaluateAllActiveBatches` (`server/src/services/freshnessService.ts`)
    ↓
Database Tables: `ProduceBatch`, `FreshnessRule`, `Product`, `Notification`
    ↓
External Integrations: WhatsApp Mock Broadcast (`NotificationService.broadcastUrgentSale`)
```

### Business Rules & Constraints
1. **Urgency Threshold**: When remaining shelf-life drops below the urgent duration (default: 4 hours), the batch status becomes `URGENT` and an automatic 15% discount is applied.
2. **B2B Broadcast**: Entering `URGENT` state automatically triggers a broadcast to nearby commercial buyers (hotels, restaurants, supermarkets) who can consume bulk perishables immediately.
3. **Auto-Expiration**: When time remaining reaches 0, the batch is automatically marked `EXPIRED` and removed from the active marketplace.

---

## 3. Feature: Multi-Factor Smart Matching Algorithm (`feature:smart-matching-algorithm`)

### Core Concept & Innovation
Matches buyer requirements with available farmer harvests using a multi-parameter suitability score (0–100) instead of relying solely on distance or price.

### Vertical Stack Trace
```
Feature: Multi-Factor Smart Matching Algorithm
    ↓
UI Screen: Smart Matches Explorer (`client/src/features/buyer/SmartMatches.tsx`)
    ↓
Components: `SmartMatches`, `DeliveryMap`
    ↓
Hooks/State: `useLanguage`, `useAuth`
    ↓
API Endpoint: `GET /api/buyers/demands/:id/matches` (`server/src/routes/buyerRoutes.ts:L224-L232`)
    ↓
Service: `MatchingService.findMatchesForDemand` (`server/src/services/matchingService.ts:L165-L249`)
    ↓
Database Tables: `BuyerDemand`, `ProduceBatch`, `FarmerProfile`, `Product`, `FreshnessRule`
    ↓
External Integrations: Distance Geocoding / Salem Regional Cluster Matrix
```

### Scoring Weights Formula
Total Suitability Score is evaluated out of 100 points:
- **Distance Score (25%)**: Proximity to buyer delivery point using Haversine calculation with local Salem village cluster coordinates (Thalaivasal, Attur, Gangavalli, Mecheri, Valapadi).
- **Price Compatibility (20%)**: Batch price vs buyer budget window (`minBudget` to `maxBudget`).
- **Quality Grade (20%)**: Match against buyer requested grade (`A`, `B`, or `ANY`).
- **Freshness Score (15%)**: `FRESH` (15 pts), `AGING` (11 pts), `URGENT` (8 pts).
- **Farmer Rating (10%)**: Historical review score out of 5 stars.
- **Quantity Match (10%)**: Proportion of total demand satisfied by the batch.

---

## 4. Feature: 10-Stage Escrow Order State Machine (`feature:escrow-order-state-machine`)

### Core Concept & Innovation
Eliminates payment insecurity for farmers and quality anxiety for buyers through a 10-stage sequential state machine with automated escrow payment locking and verification-triggered payout release.

### Vertical Stack Trace
```
Feature: 10-Stage Escrow Order State Machine
    ↓
UI Screen: Order Tracking View (`client/src/features/buyer/BuyerOrders.tsx`, `client/src/features/farmer/FarmerOrders.tsx`)
    ↓
Components: `BuyerOrders`, `DeliveryMap`, `LogisticsDashboard`
    ↓
Hooks/State: `useLanguage`, `useAuth`
    ↓
API Endpoints:
    • `PATCH /api/orders/:id/status` (`server/src/routes/orderRoutes.ts:L55-L79`)
    • `POST /api/quality-checks` (`server/src/routes/qualityRoutes.ts:L11-L70`)
    • `PATCH /api/logistics/deliveries/:id/status` (`server/src/routes/logisticsRoutes.ts:L111-L147`)
    ↓
Service: `OrderStateMachine.transitionOrder` (`server/src/services/orderStateMachine.ts:L40-L153`)
    ↓
Database Tables: `Order`, `Payment`, `FarmerPayout`, `ProduceBatch`, `Delivery`, `QualityCheck`, `Notification`
    ↓
External Integrations: Mock UPI Escrow Gateway, Fleet GPS Simulation
```

### Lifecycle Progression
`ORDERED` → `ACCEPTED` → `PICKUP_SCHEDULED` → `COLLECTED` → `QUALITY_CHECKED` → `PACKED` → `DISPATCHED` → `DELIVERED` → `PAYMENT_RELEASED` → `COMPLETED`
- Transition to `DELIVERED` automatically records `deliveredAt` timestamp, transitions `Payment.status` to `RELEASED`, creates `FarmerPayout` records with bank UTR codes, and increments `FarmerProfile.completedOrders`.
- Transition to `CANCELLED` safely restores deducted quantities back to original produce batches.

---

## 5. Feature: Daily APMC Mandi Benchmark & Fair Price Transparency (`feature:fair-price-transparency`)

### Core Concept & Innovation
Provides transparent price discovery based on official government APMC wholesale mandi rates across 13 Tamil Nadu markets. Farmers are guaranteed +16% to 22% higher net realization compared to distress middleman sales, while buyers save ~10% compared to wholesale markups.

### Vertical Stack Trace
```
Feature: Daily APMC Mandi Benchmark & Fair Price Transparency
    ↓
UI Presentation: Market Rates Page (`client/src/features/public/MarketRatesPage.tsx`), Top Ticker (`client/src/components/common/Navbar.tsx`)
    ↓
Components: `FairPriceGauge` (`client/src/components/common/FairPriceGauge.tsx`), `MarketRatesPage`
    ↓
Hooks/State: `useLanguage`
    ↓
API Endpoints:
    • `GET /api/market-prices/daily` (`server/src/routes/marketPriceRoutes.ts:L10-L44`)
    • `GET /api/market-prices/ticker` (`server/src/routes/marketPriceRoutes.ts:L50-L59`)
    • `GET /api/market-prices/mandis` (`server/src/routes/marketPriceRoutes.ts:L65-L68`)
    ↓
Service: `MarketPriceService.getDailyRates` (`server/src/services/marketPriceService.ts:L377-L470`)
    ↓
Database Tables: `MarketPrice`, `Product`
    ↓
External Integrations: Data.gov.in Agmarknet API (filters: state=Tamil+Nadu, district)
```

---

## 6. Feature: Bilingual Voice-Assisted Produce Listing (`feature:voice-assisted-listing`)

### Core Concept & Innovation
Overcomes the digital literacy barrier for smallholder farmers who may struggle with typing complex forms on smartphones. Allows farmers and Village Coordinators to dictate harvest details in natural Tamil or English.

### Vertical Stack Trace
```
Feature: Bilingual Voice-Assisted Produce Listing
    ↓
UI Presentation: Voice Modal (`client/src/components/common/VoiceListingModal.tsx`)
    ↓
Components: `VoiceListingModal`, `CoordinatorDashboard`
    ↓
Hooks/State: `useLanguage`
    ↓
API Endpoints:
    • `POST /api/coordinator/create-batch` (`server/src/routes/coordinatorRoutes.ts:L92-L167`)
    • `POST /api/farmers/batches` (`server/src/routes/farmerRoutes.ts:L123-L209`)
    ↓
Service: `FreshnessService.calculateFreshness`
    ↓
Database Tables: `ProduceBatch`, `Product`, `FarmerProfile`
    ↓
External Integrations: Web Speech API (SpeechRecognition / SpeechSynthesis) in Tamil (`ta-IN`) and English (`en-IN`)
```

---

## 7. Feature: Dual Purchase Modes (`feature:two-tier-checkout`)

### Core Concept & Innovation
Accommodates two divergent user needs on a single platform:
1. **Direct Purchase via Cart (Mode 1)**: For small restaurants, cafes, and consumers buying 1–50 kg directly from existing farmer batches.
2. **Bulk Reverse Demand (Mode 2)**: For hotels, commercial caterers, and institutional buyers needing 500–2000 kg assembled via Collective Pooling.

### Vertical Stack Trace (Mode 1: Cart & Direct Checkout)
```
Feature: Dual Purchase Modes (Mode 1: Direct Cart)
    ↓
UI Presentation: Marketplace & Cart Drawer (`client/src/features/buyer/CartDrawer.tsx`)
    ↓
Components: `CartDrawer`, `CheckoutModal`, `ProductDetailPage`
    ↓
Hooks/State: `useCart`, `useAuth`, `useLanguage`
    ↓
API Endpoints:
    • `GET /api/buyers/cart` (`server/src/routes/buyerRoutes.ts:L369`)
    • `POST /api/buyers/cart/items` (`server/src/routes/buyerRoutes.ts:L442`)
    • `POST /api/buyers/checkout` (`server/src/routes/buyerRoutes.ts:L581`)
    ↓
Service: Transactional deduction in `buyerRoutes.ts`
    ↓
Database Tables: `Cart`, `CartItem`, `ProduceBatch`, `Order`, `OrderItem`, `Payment`, `Delivery`
```

---

## 8. Feature: Hub Quality Verification & Farm Logistics Dispatch (`feature:quality-verification-logistics`)

### Core Concept & Innovation
Standardizes produce grading at village collection centers before final dispatch to buyers, reducing return rates and quality disputes.

### Vertical Stack Trace
```
Feature: Hub Quality Verification & Farm Logistics Dispatch
    ↓
UI Screen: Logistics & Quality Hub (`client/src/features/logistics/LogisticsDashboard.tsx`)
    ↓
Components: `LogisticsDashboard`, `DeliveryMap`
    ↓
Hooks/State: `useLanguage`, `useAuth`
    ↓
API Endpoints:
    • `POST /api/quality-checks` (`server/src/routes/qualityRoutes.ts:L11-L70`)
    • `GET /api/logistics/pickups` (`server/src/routes/logisticsRoutes.ts:L11`)
    • `PATCH /api/logistics/deliveries/:id/status` (`server/src/routes/logisticsRoutes.ts:L111`)
    ↓
Service: `OrderStateMachine.transitionOrder`
    ↓
Database Tables: `QualityCheck`, `CollectionCenter`, `Vehicle`, `PickupRequest`, `Delivery`, `Order`
```
