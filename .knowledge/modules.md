# 📦 KisanDirect Module Catalog

> **Repository**: `Farmer_selling_app`  
> Complete technical reference for all 16 modules spanning backend and frontend codebases.

---

## 1. Backend Modules

### 1.1 `module:server-core` — Express Server Entry & App Shell
- **Primary File**: [`server/src/index.ts`](file:///d:/Projects/Farmer_selling_app/server/src/index.ts) (76 lines)
- **Responsibilities**:
  - Initializes Express application instance.
  - Configures CORS for local development (`origin: '*'`, `credentials: true`).
  - Configures `express.json` and `express.urlencoded` body parsers with `50mb` payload limit (supporting Base64 produce photo uploads).
  - Mounts static file server at `/uploads` targeting the local filesystem `uploads/` directory.
  - Mounts 14 REST route modules under `/api/*`.
  - Exposes `/api/health` system health status endpoint with Problem Statement ID `SIH26033`.
  - Global error handler catching unhandled exceptions and returning HTTP 500 JSON responses.
- **Dependencies**: Express, CORS, routes, config.

### 1.2 `module:server-config` — Database & Environment
- **Files**:
  - [`server/src/config/db.ts`](file:///d:/Projects/Farmer_selling_app/server/src/config/db.ts) (8 lines): Singleton PrismaClient instance with conditional logging (`warn`/`error` in dev, `error` in prod).
  - [`server/src/config/env.ts`](file:///d:/Projects/Farmer_selling_app/server/src/config/env.ts) (20 lines): Loads environment variables via `dotenv` with safe local fallbacks (port 5000, local SQLite fallback, mock API keys).
- **Security Rule**: Never check in real secrets. Always use `process.env` lookups.

### 1.3 `module:server-middleware` — Auth & Role Enforcement
- **Primary File**: [`server/src/middleware/auth.ts`](file:///d:/Projects/Farmer_selling_app/server/src/middleware/auth.ts) (50 lines)
- **Exports**:
  - `authenticateToken`: Express middleware extracting Bearer token from `Authorization` header, verifying with `ENV.JWT_SECRET`, and populating `req.user: AuthUser`.
  - `requireRole(roles: string[])`: Higher-order middleware ensuring `req.user.role` matches one of the allowed roles, with universal bypass for `ADMIN`.
  - Interfaces: `AuthUser`, `AuthenticatedRequest`.

### 1.4 `module:server-services` — Domain Algorithmic Engines
Core business logic classes completely decoupled from Express HTTP request/response objects:
- **[`collectiveSellingService.ts`](file:///d:/Projects/Farmer_selling_app/server/src/services/collectiveSellingService.ts)** (156 lines):
  - Method: `createCollectiveOrder(input: CreateCollectiveOrderInput)`
  - Encapsulates transactional creation of `CollectiveOrder`, `Order`, `CollectiveOrderMember`, `OrderItem`, inventory deductions, and mock escrow payment.
- **[`freshnessService.ts`](file:///d:/Projects/Farmer_selling_app/server/src/services/freshnessService.ts)** (138 lines):
  - Method: `calculateFreshness(harvestedAt, sellBy, productRules)`: Computes hours remaining, urgency boolean, and recommended discount.
  - Method: `evaluateAllActiveBatches()`: Scans all active batches and auto-expires or flags urgency in the database.
- **[`marketPriceService.ts`](file:///d:/Projects/Farmer_selling_app/server/src/services/marketPriceService.ts)** (489 lines):
  - Catalog of 25+ vegetables with base minimum, modal, and maximum prices.
  - Mandi registry of 13 regulated markets in Tamil Nadu.
  - Method: `getDailyRates(district, mandiId)`: Generates calibrated mandi rates with deterministic daily seed factors, with live Agmarknet / data.gov.in fallback.
  - Method: `getTickerRates(district)`: Top 10 vegetable prices for the navigation bar ticker.
- **[`matchingService.ts`](file:///d:/Projects/Farmer_selling_app/server/src/services/matchingService.ts)** (312 lines):
  - Method: `calculateDistance(lat1, lon1, lat2, lon2)`: Haversine distance formula with local Salem village cluster recognition.
  - Method: `evaluateBatchSuitability(batch, demand, distance)`: Multi-factor scoring (0-100) combining distance, price, grade, freshness, rating, and quantity match.
  - Method: `findMatchesForDemand(demandId)`: Returns individual candidates and pooled collective groups.
  - Method: `buildCollectiveSupplyPool(candidates, requiredQuantity)`: Aggregation algorithm filling bulk demand from smallholder allocations.
- **[`orderStateMachine.ts`](file:///d:/Projects/Farmer_selling_app/server/src/services/orderStateMachine.ts)** (157 lines):
  - Array: `ORDER_STATUS_FLOW` (10 sequential stages).
  - Method: `isValidTransition(currentStatus, nextStatus)`: Validates state advancement.
  - Method: `transitionOrder(orderId, nextStatus, actorUserId, details)`: Executes state advancement, handles automated side effects (releases escrow upon `DELIVERED`, restores inventory upon `CANCELLED`).
- **[`paymentService.ts`](file:///d:/Projects/Farmer_selling_app/server/src/services/paymentService.ts)** (85 lines):
  - Method: `authorizePayment(orderId, buyerId, method)`: Creates escrow record.
  - Method: `releasePayment(paymentId)`: Disburses farmer payouts (98% net payout, 2% platform fee).
- **[`notificationService.ts`](file:///d:/Projects/Farmer_selling_app/server/src/services/notificationService.ts)** (59 lines):
  - Method: `notify(input)`: Creates notification record across channels.
  - Method: `broadcastUrgentSale(batch)`: Broadcasts WhatsApp perishable alert to nearby commercial buyers.

### 1.5 `module:server-routes` — REST Routing Controllers
- 14 route files mapping REST operations:
  - [`authRoutes.ts`](file:///d:/Projects/Farmer_selling_app/server/src/routes/authRoutes.ts) (register, login, verify-otp, demo-switch, me)
  - [`farmerRoutes.ts`](file:///d:/Projects/Farmer_selling_app/server/src/routes/farmerRoutes.ts) (products, dashboard, batches, offers, orders, collective-pools, earnings)
  - [`buyerRoutes.ts`](file:///d:/Projects/Farmer_selling_app/server/src/routes/buyerRoutes.ts) (dashboard, marketplace, demands, matches, offers, collective-order, orders, cart, checkout)
  - [`orderRoutes.ts`](file:///d:/Projects/Farmer_selling_app/server/src/routes/orderRoutes.ts) (details, status transition, dispute)
  - [`logisticsRoutes.ts`](file:///d:/Projects/Farmer_selling_app/server/src/routes/logisticsRoutes.ts) (pickups, deliveries, vehicles, collection-centers)
  - [`qualityRoutes.ts`](file:///d:/Projects/Farmer_selling_app/server/src/routes/qualityRoutes.ts) (record quality check, get check report)
  - [`paymentRoutes.ts`](file:///d:/Projects/Farmer_selling_app/server/src/routes/paymentRoutes.ts) (create authorization, release payout, get payment)
  - [`ratingRoutes.ts`](file:///d:/Projects/Farmer_selling_app/server/src/routes/ratingRoutes.ts) (submit rating, get user ratings)
  - [`coordinatorRoutes.ts`](file:///d:/Projects/Farmer_selling_app/server/src/routes/coordinatorRoutes.ts) (assisted register farmer, assisted create batch, dashboard)
  - [`adminRoutes.ts`](file:///d:/Projects/Farmer_selling_app/server/src/routes/adminRoutes.ts) (dashboard KPIs, farmers, buyers, listings, orders, disputes, resolve dispute, user status)
  - [`notificationRoutes.ts`](file:///d:/Projects/Farmer_selling_app/server/src/routes/notificationRoutes.ts) (list, mark read, mark all read)
  - [`demoRoutes.ts`](file:///d:/Projects/Farmer_selling_app/server/src/routes/demoRoutes.ts) (simulate urgency, simulate expiry)
  - [`marketPriceRoutes.ts`](file:///d:/Projects/Farmer_selling_app/server/src/routes/marketPriceRoutes.ts) (daily rates, ticker, mandis)
  - [`uploadRoutes.ts`](file:///d:/Projects/Farmer_selling_app/server/src/routes/uploadRoutes.ts) (Base64 image upload)

### 1.6 `module:database-schema` — Prisma ORM & Seeding
- **[`server/prisma/schema.prisma`](file:///d:/Projects/Farmer_selling_app/server/prisma/schema.prisma)** (474 lines): 28 models defining tables, relationships, and constraints.
- **[`server/prisma/seed.ts`](file:///d:/Projects/Farmer_selling_app/server/prisma/seed.ts)** (891 lines): Complete demonstration seeder initializing all 5 test personas, 7 catalog crops, fresh/aging/urgent batches, buyer demands, smart matches, and historical orders.

---

## 2. Frontend Modules

### 2.1 `module:client-core` — App Shell, Types & Entry
- [`client/src/main.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/main.tsx): React root mount.
- [`client/src/App.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/App.tsx) (274 lines): Top-level component orchestrating state-based view switching (`currentView`), modal visibility, splash screen, and onboarding.
- [`client/src/types/index.ts`](file:///d:/Projects/Farmer_selling_app/client/src/types/index.ts) (319 lines): Complete TypeScript domain interfaces.

### 2.2 `module:client-context` — Global React Contexts
- [`AuthContext.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/context/AuthContext.tsx): Manages authentication token, user object, demo persona switcher, and notification count.
- [`CartContext.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/context/CartContext.tsx): Manages shopping cart state, drawer opening/closing, and cart CRUD.
- [`LanguageContext.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/context/LanguageContext.tsx): Dual-language provider (`en`/`ta`) with full translations dictionary.

### 2.3 `module:client-services` — Centralized API Client
- [`client/src/services/api.ts`](file:///d:/Projects/Farmer_selling_app/client/src/services/api.ts) (447 lines): Typed methods mapping to all backend endpoints, handling token persistence and response parsing.

### 2.4 `module:client-components-common` — Shared Components
- [`Navbar.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/components/common/Navbar.tsx): Header with APMC mandi ticker, role navigation, cart button, notifications, language switcher.
- [`DemoScenarioBar.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/components/common/DemoScenarioBar.tsx): Top presenter control bar triggering 3 SIH evaluation scenarios.
- [`FreshnessBadge.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/components/common/FreshnessBadge.tsx): Color-coded shelf-life badge with live countdown.
- [`FairPriceGauge.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/components/common/FairPriceGauge.tsx): Visual price range comparison gauge.
- [`DeliveryMap.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/components/common/DeliveryMap.tsx): SVG route map for farm-to-door tracking.
- [`VoiceListingModal.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/components/common/VoiceListingModal.tsx): Speech-to-text assisted harvest listing in Tamil/English.
- [`MobileBottomNav.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/components/common/MobileBottomNav.tsx): Bottom tab navigation for mobile viewports.
- [`OnboardingView.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/components/common/OnboardingView.tsx): First-time visitor carousel.
- [`SplashScreen.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/components/common/SplashScreen.tsx): Animated startup screen.

### 2.5 `module:client-features-farmer` — Farmer Workflow
- [`FarmerDashboard.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/farmer/FarmerDashboard.tsx): KPI cards, recent listings, quick voice CTA.
- [`AddProduce.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/farmer/AddProduce.tsx): 5-step produce listing wizard with camera photo capture and price gauge.
- [`MyProduce.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/farmer/MyProduce.tsx): Active harvest cards with freshness countdowns and status pills.
- [`FarmerOffers.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/farmer/FarmerOffers.tsx): Negotiation inbox with accept, reject, and counter-offer dialog.
- [`FarmerCollective.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/farmer/FarmerCollective.tsx): History of participating collective selling groups.
- [`FarmerOrders.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/farmer/FarmerOrders.tsx): Order tracking and dispatch details.
- [`FarmerEarnings.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/farmer/FarmerEarnings.tsx): Earnings summary, monthly income chart, and middlemen savings metric.

### 2.6 `module:client-features-buyer` — Buyer Workflow
- [`BuyerDashboard.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/buyer/BuyerDashboard.tsx): Spend analytics, active demands, transit orders.
- [`Marketplace.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/buyer/Marketplace.tsx): Produce catalog with crop/freshness filters, sorting, and add-to-cart.
- [`PostDemand.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/buyer/PostDemand.tsx): Commercial bulk demand creation form.
- [`SmartMatches.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/buyer/SmartMatches.tsx): Smart match evaluation and collective supply pooling view.
- [`ProductDetailPage.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/buyer/ProductDetailPage.tsx): Produce details modal with quantity selector.
- [`CartDrawer.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/buyer/CartDrawer.tsx): Slide-over drawer with item quantities, delivery fee, and checkout CTA.
- [`CheckoutModal.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/buyer/CheckoutModal.tsx): Direct checkout dialog with escrow authorization.
- [`BuyerOrders.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/buyer/BuyerOrders.tsx): 10-stage lifecycle progress tracker with delivery map and rating feedback.

### 2.7 `module:client-features-coordinator` — Coordinator Desk
- [`CoordinatorDashboard.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/coordinator/CoordinatorDashboard.tsx): Assisted registration for non-smartphone farmers and voice produce listing.

### 2.8 `module:client-features-logistics` — Logistics Fleet & QA
- [`LogisticsDashboard.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/logistics/LogisticsDashboard.tsx): Fleet dispatch, delivery updates, and collection center quality verification form.

### 2.9 `module:client-features-admin` — Governance Console
- [`AdminDashboard.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/admin/AdminDashboard.tsx): KPI metrics, financial volume, dispute arbitration, user suspension, and social impact indicators.

### 2.10 `module:client-features-public` — Informational & Auth Pages
- [`LandingPage.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/public/LandingPage.tsx): Hero, value propositions, mandi rate preview.
- [`HowItWorksPage.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/public/HowItWorksPage.tsx): Illustrated 4-step farm-to-door logistics explanation.
- [`ForFarmersPage.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/public/ForFarmersPage.tsx): Farmer benefits and price guarantee overview.
- [`ForBuyersPage.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/public/ForBuyersPage.tsx): Commercial kitchen bulk benefits.
- [`ImpactPage.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/public/ImpactPage.tsx): Socio-economic telemetry.
- [`LoginPage.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/public/LoginPage.tsx): Login screen with persona quick-login pills.
- [`RegisterPage.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/public/RegisterPage.tsx): Role-based registration form.
- [`MarketRatesPage.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/public/MarketRatesPage.tsx): 13-mandi live daily rate explorer.
- [`ProfilePage.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/public/ProfilePage.tsx): User profile and verified credentials display.
