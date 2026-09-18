// .knowledge/scripts/build-graph.js
// Assembles the complete KisanDirect Project Knowledge Graph
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const knowledgeDir = path.resolve(rootDir, '.knowledge');

if (!fs.existsSync(knowledgeDir)) {
  fs.mkdirSync(knowledgeDir, { recursive: true });
}

// Complete nodes collection
const nodes = [];
const relationships = [];
const nodeSet = new Set();

function addNode(node) {
  if (nodeSet.has(node.id)) {
    console.warn(`Duplicate node skipped: ${node.id}`);
    return;
  }
  nodeSet.add(node.id);
  nodes.push(node);
}

function addRel(from, type, to, metadata = {}) {
  relationships.push({ from, type, to, ...metadata });
}

// -------------------------------------------------------------
// 1. MODULE NODES
// -------------------------------------------------------------
const modules = [
  { id: 'module:server-core', name: 'Server Core & HTTP Setup', path: 'server/src/index.ts', description: 'Express application entry point, middleware configuration, and route mounts' },
  { id: 'module:server-config', name: 'Server Configuration & Environment', path: 'server/src/config', description: 'Database Prisma client and environment variable resolution' },
  { id: 'module:server-middleware', name: 'Server Middleware & Auth Guard', path: 'server/src/middleware', description: 'JWT authentication and role-based access control middleware' },
  { id: 'module:server-services', name: 'Server Domain Services', path: 'server/src/services', description: 'Core business logic engines: matching, collective pooling, freshness decay, state machine, payments, and notifications' },
  { id: 'module:server-routes', name: 'Server REST API Routes', path: 'server/src/routes', description: 'Express routing controllers mapping HTTP requests to database and domain services' },
  { id: 'module:database-schema', name: 'Prisma Schema & Database Layer', path: 'server/prisma/schema.prisma', description: 'Prisma ORM schema with 28 models supporting agricultural marketplace operations' },
  { id: 'module:client-core', name: 'Client App Core & Routing', path: 'client/src/App.tsx', description: 'State-based view routing, global layout, modal controllers, and demo switcher' },
  { id: 'module:client-context', name: 'Client State & Context Providers', path: 'client/src/context', description: 'React Context providers for Auth, Cart/Checkout, and Bilingual Localization' },
  { id: 'module:client-services', name: 'Client HTTP API Service', path: 'client/src/services/api.ts', description: 'Centralized API client wrapping fetch with JWT auth and typed methods' },
  { id: 'module:client-components-common', name: 'Shared UI Components', path: 'client/src/components/common', description: 'Reusable UI elements: FreshnessBadge, FairPriceGauge, DeliveryMap, DemoScenarioBar, Navbar, VoiceListingModal' },
  { id: 'module:client-features-farmer', name: 'Farmer Experience Features', path: 'client/src/features/farmer', description: 'Produce listing, batch inventory, buyer offer negotiation, collective pooling, and earnings dashboard' },
  { id: 'module:client-features-buyer', name: 'Buyer Experience Features', path: 'client/src/features/buyer', description: 'Marketplace browsing, demand posting, smart match clustering, direct checkout, and order tracking' },
  { id: 'module:client-features-coordinator', name: 'Village Coordinator Features', path: 'client/src/features/coordinator', description: 'Assisted farmer registration and voice-assisted harvest listing' },
  { id: 'module:client-features-logistics', name: 'Logistics Fleet & QA Features', path: 'client/src/features/logistics', description: 'Dispatch scheduling, live GPS route simulation, and collection center quality checks' },
  { id: 'module:client-features-admin', name: 'Admin Governance Features', path: 'client/src/features/admin', description: 'Platform telemetry, dispute arbitration, user suspension, and impact metrics' },
  { id: 'module:client-features-public', name: 'Public Landing & Informational Pages', path: 'client/src/features/public', description: 'Landing page, how it works, live APMC mandi rates, persona onboarding, and auth screens' }
];

modules.forEach(m => addNode({ id: m.id, type: 'module', name: m.name, path: m.path, description: m.description }));

// -------------------------------------------------------------
// 2. FEATURE NODES
// -------------------------------------------------------------
const features = [
  { id: 'feature:collective-selling', name: 'Reverse-Demand Collective Supply Pooling (கூட்டு விற்பனை)', description: 'Aggregates multiple smallholder farmers (100-300kg) to fulfill bulk commercial buyer demands (500kg-2000kg) at guaranteed fair prices' },
  { id: 'feature:freshness-decay-engine', name: 'Perishable Freshness Decay & Dynamic Discount Engine', description: 'Tracks produce shelf-life countdown (FRESH -> AGING -> URGENT -> EXPIRED) and automatically applies progressive discounts to eliminate food waste' },
  { id: 'feature:smart-matching-algorithm', name: 'Multi-Factor Smart Matching Algorithm', description: 'Scores candidate produce batches against buyer requirements using distance, price, quality grade, freshness, and farmer rating' },
  { id: 'feature:escrow-order-state-machine', name: '10-Stage Escrow Order State Machine', description: 'Sequential lifecycle tracking (ORDERED -> DELIVERED -> PAYMENT_RELEASED) with automated escrow fund authorization and payouts' },
  { id: 'feature:fair-price-transparency', name: 'Daily APMC Mandi Benchmark & Fair Price Transparency', description: 'Live daily benchmark rates across 13 Tamil Nadu mandis guaranteeing +16% to 22% higher farmer earnings without predatory middlemen' },
  { id: 'feature:voice-assisted-listing', name: 'Bilingual Voice-Assisted Produce Listing', description: 'Speech-to-text simulation in Tamil and English empowering low-literacy farmers and village coordinators' },
  { id: 'feature:two-tier-checkout', name: 'Dual Purchase Modes (Direct Cart & Bulk Reverse Demand)', description: 'Supports immediate consumer/kitchen purchases via cart drawer and large-scale bulk procurement via demand posting' },
  { id: 'feature:quality-verification-logistics', name: 'Hub Quality Verification & Farm Logistics Dispatch', description: 'Physical quality checks at village collection hubs, vehicle dispatch, GPS simulation, and transparent damage reconciliation' }
];

features.forEach(f => addNode({ id: f.id, type: 'feature', name: f.name, description: f.description }));

// -------------------------------------------------------------
// 3. DATABASE TABLE NODES (Prisma Models)
// -------------------------------------------------------------
const prismaModels = [
  { id: 'table:User', name: 'User', source: 'server/prisma/schema.prisma', line_range: '11-31', description: 'Core user credentials, authentication role, mobile, preferred language, status' },
  { id: 'table:FarmerProfile', name: 'FarmerProfile', source: 'server/prisma/schema.prisma', line_range: '33-52', description: 'Farmer profile, FD-ID, village, district, land size, rating, completed orders' },
  { id: 'table:BuyerProfile', name: 'BuyerProfile', source: 'server/prisma/schema.prisma', line_range: '54-73', description: 'Commercial buyer business profile, GST, business type, delivery coordinates' },
  { id: 'table:CoordinatorProfile', name: 'CoordinatorProfile', source: 'server/prisma/schema.prisma', line_range: '75-86', description: 'Village digital hub coordinator profile, assigned center, active farmers managed' },
  { id: 'table:Product', name: 'Product', source: 'server/prisma/schema.prisma', line_range: '88-104', description: 'Master agricultural commodities catalog with Tamil names and reference prices' },
  { id: 'table:FreshnessRule', name: 'FreshnessRule', source: 'server/prisma/schema.prisma', line_range: '106-115', description: 'Commodity-specific shelf-life durations for fresh, aging, and urgent windows' },
  { id: 'table:MarketPrice', name: 'MarketPrice', source: 'server/prisma/schema.prisma', line_range: '117-127', description: 'Historical and daily APMC mandi modal, min, and max price benchmark records' },
  { id: 'table:ProduceBatch', name: 'ProduceBatch', source: 'server/prisma/schema.prisma', line_range: '129-160', description: 'Farmer harvest batch listing with quantities, price, grade, coordinates, and freshness countdown' },
  { id: 'table:BuyerDemand', name: 'BuyerDemand', source: 'server/prisma/schema.prisma', line_range: '162-186', description: 'Commercial buyer demand posting specifying quantity, budget range, grade, and deadline' },
  { id: 'table:Offer', name: 'Offer', source: 'server/prisma/schema.prisma', line_range: '188-207', description: 'Bilateral negotiation offers between buyers and farmers on batches/demands' },
  { id: 'table:OfferHistory', name: 'OfferHistory', source: 'server/prisma/schema.prisma', line_range: '209-219', description: 'Counter-offer negotiation audit trail recording proposed price changes' },
  { id: 'table:CollectiveOrder', name: 'CollectiveOrder', source: 'server/prisma/schema.prisma', line_range: '220-233', description: 'Aggregated pooled order combining multiple farmers to fulfill single bulk demand' },
  { id: 'table:CollectiveOrderMember', name: 'CollectiveOrderMember', source: 'server/prisma/schema.prisma', line_range: '235-248', description: 'Individual farmer allocation within a collective pooled order' },
  { id: 'table:Order', name: 'Order', source: 'server/prisma/schema.prisma', line_range: '249-275', description: 'Central order lifecycle entity with 10-stage status, amounts, and platform fee' },
  { id: 'table:OrderItem', name: 'OrderItem', source: 'server/prisma/schema.prisma', line_range: '277-289', description: 'Line items within an order linking batch, farmer, quantity, and unit price' },
  { id: 'table:CollectionCenter', name: 'CollectionCenter', source: 'server/prisma/schema.prisma', line_range: '291-303', description: 'Village agri-depot collection center with coordinates and coordinator assignment' },
  { id: 'table:QualityCheck', name: 'QualityCheck', source: 'server/prisma/schema.prisma', line_range: '305-323', description: 'Inspection report recording actual vs expected weight, damaged qty, and grade' },
  { id: 'table:Vehicle', name: 'Vehicle', source: 'server/prisma/schema.prisma', line_range: '325-336', description: 'Fleet vehicle entity with registration number, driver details, and capacity' },
  { id: 'table:PickupRequest', name: 'PickupRequest', source: 'server/prisma/schema.prisma', line_range: '338-349', description: 'Scheduled pickup dispatch from farm/center to vehicle' },
  { id: 'table:Delivery', name: 'Delivery', source: 'server/prisma/schema.prisma', line_range: '351-364', description: 'Active delivery tracking record with live coordinates and milestone timestamps' },
  { id: 'table:Payment', name: 'Payment', source: 'server/prisma/schema.prisma', line_range: '366-382', description: 'Escrow payment transaction held in AUTHORIZED state until delivery completion' },
  { id: 'table:FarmerPayout', name: 'FarmerPayout', source: 'server/prisma/schema.prisma', line_range: '384-396', description: 'Individual farmer net payout release with bank UTR reference' },
  { id: 'table:Rating', name: 'Rating', source: 'server/prisma/schema.prisma', line_range: '398-410', description: 'Post-delivery bilateral 1-5 star reviews and feedback comments' },
  { id: 'table:Notification', name: 'Notification', source: 'server/prisma/schema.prisma', line_range: '412-425', description: 'Multichannel user notifications (In-App, SMS, WhatsApp, Voice simulations)' },
  { id: 'table:Dispute', name: 'Dispute', source: 'server/prisma/schema.prisma', line_range: '427-439', description: 'Buyer or farmer order disputes escalated for admin arbitration' },
  { id: 'table:ProductImage', name: 'ProductImage', source: 'server/prisma/schema.prisma', line_range: '441-449', description: 'Uploaded batch produce photos with primary flag' },
  { id: 'table:Cart', name: 'Cart', source: 'server/prisma/schema.prisma', line_range: '451-459', description: 'Buyer direct purchase shopping cart instance per user' },
  { id: 'table:CartItem', name: 'CartItem', source: 'server/prisma/schema.prisma', line_range: '461-473', description: 'Line item in shopping cart pointing to active produce batch' }
];

prismaModels.forEach(m => {
  addNode({
    id: m.id,
    type: 'database_table',
    name: m.name,
    source: m.source,
    line_range: m.line_range,
    module: 'module:database-schema',
    description: m.description
  });
  addRel('module:database-schema', 'contains', m.id);
});

// -------------------------------------------------------------
// 4. BACKEND FILES & SERVICES & FUNCTIONS
// -------------------------------------------------------------
const serverFiles = [
  { id: 'file:server/src/index.ts', path: 'server/src/index.ts', module: 'module:server-core', description: 'Main Express server bootstrapper, CORS, JSON parsers, static uploads, and route mounts' },
  { id: 'file:server/prisma/schema.prisma', path: 'server/prisma/schema.prisma', module: 'module:database-schema', description: 'Prisma ORM schema definition with 28 models and relations' },
  { id: 'file:server/prisma/seed.ts', path: 'server/prisma/seed.ts', module: 'module:database-schema', description: 'Comprehensive database seeder script populating test personas, products, and market rates' },
  { id: 'file:server/src/config/db.ts', path: 'server/src/config/db.ts', module: 'module:server-config', description: 'Initializes and exports singleton PrismaClient instance' },
  { id: 'file:server/src/config/env.ts', path: 'server/src/config/env.ts', module: 'module:server-config', description: 'Loads dotenv variables and provides fallback configurations' },
  { id: 'file:server/src/middleware/auth.ts', path: 'server/src/middleware/auth.ts', module: 'module:server-middleware', description: 'JWT authentication guard and role-based authorization middleware' },
  { id: 'file:server/src/services/collectiveSellingService.ts', path: 'server/src/services/collectiveSellingService.ts', module: 'module:server-services', description: 'Transactional creation of collective orders, allocations, escrow payment, and batch quantity deductions' },
  { id: 'file:server/src/services/freshnessService.ts', path: 'server/src/services/freshnessService.ts', module: 'module:server-services', description: 'Calculates batch shelf-life countdown, urgency threshold, recommended discounts, and batch auto-expiration' },
  { id: 'file:server/src/services/marketPriceService.ts', path: 'server/src/services/marketPriceService.ts', module: 'module:server-services', description: 'Generates daily calibrated mandi modal prices for 25+ crops across 13 Tamil Nadu mandis with optional Agmarknet sync' },
  { id: 'file:server/src/services/matchingService.ts', path: 'server/src/services/matchingService.ts', module: 'module:server-services', description: 'Haversine distance calculation, suitability scoring (distance, price, grade, freshness, rating), and collective pooling algorithm' },
  { id: 'file:server/src/services/notificationService.ts', path: 'server/src/services/notificationService.ts', module: 'module:server-services', description: 'Creates notification records across in-app, SMS, WhatsApp, and voice channels' },
  { id: 'file:server/src/services/orderStateMachine.ts', path: 'server/src/services/orderStateMachine.ts', module: 'module:server-services', description: 'State machine for 10-stage order transitions with automated delivery timestamps, escrow releases, and inventory rollbacks' },
  { id: 'file:server/src/services/paymentService.ts', path: 'server/src/services/paymentService.ts', module: 'module:server-services', description: 'Authorizes mock UPI escrow payments and handles released payouts to farmers' },
  { id: 'file:server/src/routes/authRoutes.ts', path: 'server/src/routes/authRoutes.ts', module: 'module:server-routes', description: 'User registration, login, profile retrieval, OTP verification, and demo persona switching' },
  { id: 'file:server/src/routes/farmerRoutes.ts', path: 'server/src/routes/farmerRoutes.ts', module: 'module:server-routes', description: 'Farmer dashboard stats, produce batch CRUD, offer negotiation (accept/reject/counter), and earnings history' },
  { id: 'file:server/src/routes/buyerRoutes.ts', path: 'server/src/routes/buyerRoutes.ts', module: 'module:server-routes', description: 'Buyer dashboard, marketplace filtering, demand posting, smart match querying, collective order execution, cart CRUD, and direct checkout' },
  { id: 'file:server/src/routes/orderRoutes.ts', path: 'server/src/routes/orderRoutes.ts', module: 'module:server-routes', description: 'Order detail retrieval, status transition trigger, and dispute initiation' },
  { id: 'file:server/src/routes/logisticsRoutes.ts', path: 'server/src/routes/logisticsRoutes.ts', module: 'module:server-routes', description: 'Pickup scheduling, delivery tracking, GPS updates, and fleet vehicle management' },
  { id: 'file:server/src/routes/qualityRoutes.ts', path: 'server/src/routes/qualityRoutes.ts', module: 'module:server-routes', description: 'Hub quality inspections, damage percentage calculation, and pass/partial/reject grading' },
  { id: 'file:server/src/routes/paymentRoutes.ts', path: 'server/src/routes/paymentRoutes.ts', module: 'module:server-routes', description: 'Mock payment authorization and escrow release endpoints' },
  { id: 'file:server/src/routes/ratingRoutes.ts', path: 'server/src/routes/ratingRoutes.ts', module: 'module:server-routes', description: 'Rating submission and farmer average rating recalculation' },
  { id: 'file:server/src/routes/coordinatorRoutes.ts', path: 'server/src/routes/coordinatorRoutes.ts', module: 'module:server-routes', description: 'Assisted registration of low-literacy farmers and assisted produce batch creation' },
  { id: 'file:server/src/routes/adminRoutes.ts', path: 'server/src/routes/adminRoutes.ts', module: 'module:server-routes', description: 'System-wide analytics, user moderation, dispute resolution, and impact telemetry' },
  { id: 'file:server/src/routes/notificationRoutes.ts', path: 'server/src/routes/notificationRoutes.ts', module: 'module:server-routes', description: 'User notification listing and read status management' },
  { id: 'file:server/src/routes/demoRoutes.ts', path: 'server/src/routes/demoRoutes.ts', module: 'module:server-routes', description: 'Interactive demo triggers: perishable urgency decay simulation and batch expiration' },
  { id: 'file:server/src/routes/marketPriceRoutes.ts', path: 'server/src/routes/marketPriceRoutes.ts', module: 'module:server-routes', description: 'Live daily APMC mandi prices, price ticker, and market directory' },
  { id: 'file:server/src/routes/uploadRoutes.ts', path: 'server/src/routes/uploadRoutes.ts', module: 'module:server-routes', description: 'Base64 image upload handler saving produce photos to local uploads directory' }
];

serverFiles.forEach(f => {
  addNode({ id: f.id, type: 'file', name: path.basename(f.path), path: f.path, module: f.module, description: f.description });
  addRel(f.module, 'contains', f.id);
});

// Important backend functions & classes
const serverFunctions = [
  // Middleware
  { id: 'function:authenticateToken', name: 'authenticateToken', file: 'server/src/middleware/auth.ts', line_range: '16-33', description: 'Extracts Bearer token from header, validates with JWT_SECRET, attaches user to req' },
  { id: 'function:requireRole', name: 'requireRole', file: 'server/src/middleware/auth.ts', line_range: '35-49', description: 'Ensures authenticated user has one of required roles or ADMIN' },

  // CollectiveSellingService
  { id: 'function:CollectiveSellingService.createCollectiveOrder', name: 'createCollectiveOrder', file: 'server/src/services/collectiveSellingService.ts', line_range: '19-152', description: 'Runs ACID transaction to create CollectiveOrder, Order, CollectiveOrderMembers, OrderItems, updates batch quantities, creates authorized escrow Payment, and notifies farmers' },

  // FreshnessService
  { id: 'function:FreshnessService.calculateFreshness', name: 'calculateFreshness', file: 'server/src/services/freshnessService.ts', line_range: '18-88', description: 'Computes freshness status (FRESH, AGING, URGENT, EXPIRED), hours remaining, and recommended discount' },
  { id: 'function:FreshnessService.evaluateAllActiveBatches', name: 'evaluateAllActiveBatches', file: 'server/src/services/freshnessService.ts', line_range: '93-134', description: 'Batch evaluates active batches and updates database records when statuses change' },

  // MatchingService
  { id: 'function:MatchingService.calculateDistance', name: 'calculateDistance', file: 'server/src/services/matchingService.ts', line_range: '55-67', description: 'Computes Haversine distance in kilometers between two GPS coordinate pairs' },
  { id: 'function:MatchingService.evaluateBatchSuitability', name: 'evaluateBatchSuitability', file: 'server/src/services/matchingService.ts', line_range: '72-160', description: 'Calculates weighted score (0-100) based on distance (25%), price (20%), quality (20%), freshness (15%), rating (10%), quantity (10%)' },
  { id: 'function:MatchingService.findMatchesForDemand', name: 'findMatchesForDemand', file: 'server/src/services/matchingService.ts', line_range: '165-249', description: 'Queries active batches of requested product, scores each batch, and constructs pooled collective group' },
  { id: 'function:MatchingService.buildCollectiveSupplyPool', name: 'buildCollectiveSupplyPool', file: 'server/src/services/matchingService.ts', line_range: '254-308', description: 'Aggregates multiple farmers allocations until required demand quantity is reached' },

  // OrderStateMachine
  { id: 'function:OrderStateMachine.isValidTransition', name: 'isValidTransition', file: 'server/src/services/orderStateMachine.ts', line_range: '22-36', description: 'Validates forward progression through ORDER_STATUS_FLOW or cancellation rules' },
  { id: 'function:OrderStateMachine.transitionOrder', name: 'transitionOrder', file: 'server/src/services/orderStateMachine.ts', line_range: '40-153', description: 'Transitions order status, automatically triggers delivery timestamps, releases payments and updates farmer metrics upon DELIVERED, or restores stock upon CANCELLED' },

  // MarketPriceService
  { id: 'function:MarketPriceService.getDailyRates', name: 'getDailyRates', file: 'server/src/services/marketPriceService.ts', line_range: '377-470', description: 'Returns daily mandi summary with min, modal, max, and KisanDirect fair prices, cached in memory' },
  { id: 'function:MarketPriceService.getTickerRates', name: 'getTickerRates', file: 'server/src/services/marketPriceService.ts', line_range: '475-484', description: 'Returns lightweight ticker items for navigation bar' },

  // PaymentService
  { id: 'function:PaymentService.authorizePayment', name: 'authorizePayment', file: 'server/src/services/paymentService.ts', line_range: '7-34', description: 'Creates AUTHORIZED escrow payment record for order' },
  { id: 'function:PaymentService.releasePayment', name: 'releasePayment', file: 'server/src/services/paymentService.ts', line_range: '39-81', description: 'Updates payment to RELEASED and creates individual farmer payout records with UTR references' },

  // NotificationService
  { id: 'function:NotificationService.notify', name: 'notify', file: 'server/src/services/notificationService.ts', line_range: '7-25', description: 'Creates notification record with channel specification' },
  { id: 'function:NotificationService.broadcastUrgentSale', name: 'broadcastUrgentSale', file: 'server/src/services/notificationService.ts', line_range: '30-55', description: 'Broadcasts urgent perishable alerts to local B2B commercial buyers' }
];

serverFunctions.forEach(fn => {
  addNode({
    id: fn.id,
    type: 'function',
    name: fn.name,
    file: fn.file,
    source: fn.file,
    line_range: fn.line_range,
    description: fn.description
  });
  addRel(`file:${fn.file}`, 'contains', fn.id);
});

// -------------------------------------------------------------
// 5. API ENDPOINT NODES
// -------------------------------------------------------------
const apiEndpoints = [
  // Auth
  { id: 'api:POST /api/auth/register', method: 'POST', path: '/api/auth/register', file: 'server/src/routes/authRoutes.ts', line: 11, auth: false, description: 'Register new user (Farmer, Buyer, Coordinator)' },
  { id: 'api:POST /api/auth/login', method: 'POST', path: '/api/auth/login', file: 'server/src/routes/authRoutes.ts', line: 126, auth: false, description: 'User login with email/mobile and password' },
  { id: 'api:POST /api/auth/verify-otp', method: 'POST', path: '/api/auth/verify-otp', file: 'server/src/routes/authRoutes.ts', line: 190, auth: false, description: 'Mock OTP verification for mobile registration' },
  { id: 'api:POST /api/auth/demo-switch', method: 'POST', path: '/api/auth/demo-switch', file: 'server/src/routes/authRoutes.ts', line: 205, auth: false, description: 'Instant persona switch to demo accounts' },
  { id: 'api:GET /api/auth/me', method: 'GET', path: '/api/auth/me', file: 'server/src/routes/authRoutes.ts', line: 257, auth: true, description: 'Get current authenticated user profile' },

  // Upload
  { id: 'api:POST /api/upload', method: 'POST', path: '/api/upload', file: 'server/src/routes/uploadRoutes.ts', line: 14, auth: false, description: 'Upload Base64 encoded produce image' },

  // Farmer
  { id: 'api:GET /api/farmers/products', method: 'GET', path: '/api/farmers/products', file: 'server/src/routes/farmerRoutes.ts', line: 20, auth: true, description: 'List catalog products with freshness rules and reference prices' },
  { id: 'api:GET /api/farmers/dashboard', method: 'GET', path: '/api/farmers/dashboard', file: 'server/src/routes/farmerRoutes.ts', line: 38, auth: true, description: 'Farmer dashboard metrics, stock quantities, and earnings' },
  { id: 'api:POST /api/farmers/batches', method: 'POST', path: '/api/farmers/batches', file: 'server/src/routes/farmerRoutes.ts', line: 123, auth: true, description: 'Create new produce batch harvest listing' },
  { id: 'api:GET /api/farmers/batches', method: 'GET', path: '/api/farmers/batches', file: 'server/src/routes/farmerRoutes.ts', line: 212, auth: true, description: 'List batches listed by current farmer' },
  { id: 'api:GET /api/farmers/offers', method: 'GET', path: '/api/farmers/offers', file: 'server/src/routes/farmerRoutes.ts', line: 247, auth: true, description: 'List incoming buyer negotiation offers' },
  { id: 'api:PATCH /api/farmers/offers/:id/accept', method: 'PATCH', path: '/api/farmers/offers/:id/accept', file: 'server/src/routes/farmerRoutes.ts', line: 273, auth: true, description: 'Accept incoming buyer offer' },
  { id: 'api:PATCH /api/farmers/offers/:id/reject', method: 'PATCH', path: '/api/farmers/offers/:id/reject', file: 'server/src/routes/farmerRoutes.ts', line: 314, auth: true, description: 'Reject incoming buyer offer' },
  { id: 'api:POST /api/farmers/offers/:id/counter', method: 'POST', path: '/api/farmers/offers/:id/counter', file: 'server/src/routes/farmerRoutes.ts', line: 329, auth: true, description: 'Counter an offer with revised price' },
  { id: 'api:GET /api/farmers/orders', method: 'GET', path: '/api/farmers/orders', file: 'server/src/routes/farmerRoutes.ts', line: 386, auth: true, description: 'List orders containing farmer produce' },
  { id: 'api:GET /api/farmers/collective-pools', method: 'GET', path: '/api/farmers/collective-pools', file: 'server/src/routes/farmerRoutes.ts', line: 416, auth: true, description: 'List collective selling pools farmer participates in' },
  { id: 'api:GET /api/farmers/earnings', method: 'GET', path: '/api/farmers/earnings', file: 'server/src/routes/farmerRoutes.ts', line: 444, auth: true, description: 'Get farmer released payouts and earnings breakdown' },

  // Buyer
  { id: 'api:GET /api/buyers/dashboard', method: 'GET', path: '/api/buyers/dashboard', file: 'server/src/routes/buyerRoutes.ts', line: 20, auth: true, description: 'Buyer dashboard overview and spend metrics' },
  { id: 'api:GET /api/buyers/marketplace', method: 'GET', path: '/api/buyers/marketplace', file: 'server/src/routes/buyerRoutes.ts', line: 75, auth: true, description: 'Browse and filter available produce batches' },
  { id: 'api:POST /api/buyers/demands', method: 'POST', path: '/api/buyers/demands', file: 'server/src/routes/buyerRoutes.ts', line: 140, auth: true, description: 'Post commercial bulk produce demand' },
  { id: 'api:GET /api/buyers/demands', method: 'GET', path: '/api/buyers/demands', file: 'server/src/routes/buyerRoutes.ts', line: 199, auth: true, description: 'List demands posted by buyer' },
  { id: 'api:GET /api/buyers/demands/:id/matches', method: 'GET', path: '/api/buyers/demands/:id/matches', file: 'server/src/routes/buyerRoutes.ts', line: 224, auth: true, description: 'Get smart matches and collective pool for a demand' },
  { id: 'api:POST /api/buyers/demands/:id/offers', method: 'POST', path: '/api/buyers/demands/:id/offers', file: 'server/src/routes/buyerRoutes.ts', line: 235, auth: true, description: 'Send direct offer to a farmer' },
  { id: 'api:POST /api/buyers/demands/:id/collective-order', method: 'POST', path: '/api/buyers/demands/:id/collective-order', file: 'server/src/routes/buyerRoutes.ts', line: 299, auth: true, description: 'Confirm collective pooled order and authorize escrow payment' },
  { id: 'api:GET /api/buyers/orders', method: 'GET', path: '/api/buyers/orders', file: 'server/src/routes/buyerRoutes.ts', line: 333, auth: true, description: 'List orders placed by buyer' },
  { id: 'api:GET /api/buyers/cart', method: 'GET', path: '/api/buyers/cart', file: 'server/src/routes/buyerRoutes.ts', line: 369, auth: true, description: 'Get buyer shopping cart items and totals' },
  { id: 'api:POST /api/buyers/cart/items', method: 'POST', path: '/api/buyers/cart/items', file: 'server/src/routes/buyerRoutes.ts', line: 442, auth: true, description: 'Add produce batch item to cart' },
  { id: 'api:PATCH /api/buyers/cart/items/:id', method: 'PATCH', path: '/api/buyers/cart/items/:id', file: 'server/src/routes/buyerRoutes.ts', line: 517, auth: true, description: 'Update cart item quantity' },
  { id: 'api:DELETE /api/buyers/cart/items/:id', method: 'DELETE', path: '/api/buyers/cart/items/:id', file: 'server/src/routes/buyerRoutes.ts', line: 556, auth: true, description: 'Remove item from cart' },
  { id: 'api:DELETE /api/buyers/cart', method: 'DELETE', path: '/api/buyers/cart', file: 'server/src/routes/buyerRoutes.ts', line: 567, auth: true, description: 'Clear all items from cart' },
  { id: 'api:POST /api/buyers/checkout', method: 'POST', path: '/api/buyers/checkout', file: 'server/src/routes/buyerRoutes.ts', line: 581, auth: true, description: 'Direct checkout: creates order, authorizes escrow payment, schedules delivery' },

  // Orders
  { id: 'api:GET /api/orders/:id', method: 'GET', path: '/api/orders/:id', file: 'server/src/routes/orderRoutes.ts', line: 11, auth: true, description: 'Get complete order details with tracking, items, quality checks, payments' },
  { id: 'api:PATCH /api/orders/:id/status', method: 'PATCH', path: '/api/orders/:id/status', file: 'server/src/routes/orderRoutes.ts', line: 55, auth: true, description: 'Advance order state machine to next status' },
  { id: 'api:POST /api/orders/:id/dispute', method: 'POST', path: '/api/orders/:id/dispute', file: 'server/src/routes/orderRoutes.ts', line: 82, auth: true, description: 'Raise order dispute for admin resolution' },

  // Logistics
  { id: 'api:GET /api/logistics/pickups', method: 'GET', path: '/api/logistics/pickups', file: 'server/src/routes/logisticsRoutes.ts', line: 11, auth: true, description: 'List scheduled pickup requests' },
  { id: 'api:POST /api/logistics/pickups', method: 'POST', path: '/api/logistics/pickups', file: 'server/src/routes/logisticsRoutes.ts', line: 34, auth: true, description: 'Schedule pickup and advance order to PICKUP_SCHEDULED' },
  { id: 'api:PATCH /api/logistics/pickups/:id', method: 'PATCH', path: '/api/logistics/pickups/:id', file: 'server/src/routes/logisticsRoutes.ts', line: 64, auth: true, description: 'Update pickup status (COMPLETED triggers COLLECTED)' },
  { id: 'api:GET /api/logistics/deliveries', method: 'GET', path: '/api/logistics/deliveries', file: 'server/src/routes/logisticsRoutes.ts', line: 89, auth: true, description: 'List active deliveries and coordinates' },
  { id: 'api:PATCH /api/logistics/deliveries/:id/status', method: 'PATCH', path: '/api/logistics/deliveries/:id/status', file: 'server/src/routes/logisticsRoutes.ts', line: 111, auth: true, description: 'Update delivery status and GPS coordinates' },
  { id: 'api:GET /api/logistics/vehicles', method: 'GET', path: '/api/logistics/vehicles', file: 'server/src/routes/logisticsRoutes.ts', line: 150, auth: true, description: 'List fleet vehicles' },
  { id: 'api:GET /api/logistics/collection-centers', method: 'GET', path: '/api/logistics/collection-centers', file: 'server/src/routes/logisticsRoutes.ts', line: 160, auth: true, description: 'List collection centers' },

  // Quality Checks
  { id: 'api:POST /api/quality-checks', method: 'POST', path: '/api/quality-checks', file: 'server/src/routes/qualityRoutes.ts', line: 11, auth: true, description: 'Submit quality verification report and advance order to QUALITY_CHECKED' },
  { id: 'api:GET /api/quality-checks/:id', method: 'GET', path: '/api/quality-checks/:id', file: 'server/src/routes/qualityRoutes.ts', line: 73, auth: true, description: 'Get quality check report details' },

  // Payments
  { id: 'api:POST /api/payments/create', method: 'POST', path: '/api/payments/create', file: 'server/src/routes/paymentRoutes.ts', line: 11, auth: true, description: 'Create mock payment authorization' },
  { id: 'api:POST /api/payments/release/:id', method: 'POST', path: '/api/payments/release/:id', file: 'server/src/routes/paymentRoutes.ts', line: 27, auth: true, description: 'Release escrow payment to farmers' },
  { id: 'api:GET /api/payments/:id', method: 'GET', path: '/api/payments/:id', file: 'server/src/routes/paymentRoutes.ts', line: 38, auth: true, description: 'Get payment details and farmer payouts' },

  // Ratings
  { id: 'api:POST /api/ratings', method: 'POST', path: '/api/ratings', file: 'server/src/routes/ratingRoutes.ts', line: 10, auth: true, description: 'Submit 1-5 rating review and update average' },
  { id: 'api:GET /api/ratings/:userId', method: 'GET', path: '/api/ratings/:userId', file: 'server/src/routes/ratingRoutes.ts', line: 52, auth: true, description: 'Get reviews received by user' },

  // Coordinator
  { id: 'api:GET /api/coordinator/farmers', method: 'GET', path: '/api/coordinator/farmers', file: 'server/src/routes/coordinatorRoutes.ts', line: 12, auth: true, description: 'List village farmers managed by coordinator' },
  { id: 'api:POST /api/coordinator/register-farmer', method: 'POST', path: '/api/coordinator/register-farmer', file: 'server/src/routes/coordinatorRoutes.ts', line: 32, auth: true, description: 'Assisted registration of low-literacy farmer' },
  { id: 'api:POST /api/coordinator/create-batch', method: 'POST', path: '/api/coordinator/create-batch', file: 'server/src/routes/coordinatorRoutes.ts', line: 92, auth: true, description: 'Assisted produce batch creation on behalf of farmer' },
  { id: 'api:GET /api/coordinator/dashboard', method: 'GET', path: '/api/coordinator/dashboard', file: 'server/src/routes/coordinatorRoutes.ts', line: 170, auth: true, description: 'Get coordinator summary metrics' },

  // Admin
  { id: 'api:GET /api/admin/dashboard', method: 'GET', path: '/api/admin/dashboard', file: 'server/src/routes/adminRoutes.ts', line: 10, auth: true, description: 'Get admin overview counts, financials, and impact metrics' },
  { id: 'api:GET /api/admin/farmers', method: 'GET', path: '/api/admin/farmers', file: 'server/src/routes/adminRoutes.ts', line: 64, auth: true, description: 'List all registered farmers' },
  { id: 'api:GET /api/admin/buyers', method: 'GET', path: '/api/admin/buyers', file: 'server/src/routes/adminRoutes.ts', line: 80, auth: true, description: 'List all registered buyers' },
  { id: 'api:GET /api/admin/listings', method: 'GET', path: '/api/admin/listings', file: 'server/src/routes/adminRoutes.ts', line: 96, auth: true, description: 'List all produce batch listings' },
  { id: 'api:GET /api/admin/orders', method: 'GET', path: '/api/admin/orders', file: 'server/src/routes/adminRoutes.ts', line: 112, auth: true, description: 'List all platform orders' },
  { id: 'api:GET /api/admin/disputes', method: 'GET', path: '/api/admin/disputes', file: 'server/src/routes/adminRoutes.ts', line: 130, auth: true, description: 'List all open and resolved disputes' },
  { id: 'api:PATCH /api/admin/disputes/:id', method: 'PATCH', path: '/api/admin/disputes/:id', file: 'server/src/routes/adminRoutes.ts', line: 146, auth: true, description: 'Resolve dispute and save resolution notes' },
  { id: 'api:PATCH /api/admin/users/:id/status', method: 'PATCH', path: '/api/admin/users/:id/status', file: 'server/src/routes/adminRoutes.ts', line: 166, auth: true, description: 'Suspend or activate user account' },

  // Notifications
  { id: 'api:GET /api/notifications', method: 'GET', path: '/api/notifications', file: 'server/src/routes/notificationRoutes.ts', line: 10, auth: true, description: 'Get current user notifications' },
  { id: 'api:PATCH /api/notifications/:id/read', method: 'PATCH', path: '/api/notifications/:id/read', file: 'server/src/routes/notificationRoutes.ts', line: 24, auth: true, description: 'Mark single notification as read' },
  { id: 'api:PATCH /api/notifications/read-all', method: 'PATCH', path: '/api/notifications/read-all', file: 'server/src/routes/notificationRoutes.ts', line: 38, auth: true, description: 'Mark all notifications as read' },

  // Demo
  { id: 'api:POST /api/demo/simulate-urgency', method: 'POST', path: '/api/demo/simulate-urgency', file: 'server/src/routes/demoRoutes.ts', line: 9, auth: false, description: 'Simulate freshness decay to 45 mins and trigger urgent sale broadcast' },
  { id: 'api:POST /api/demo/simulate-expiry', method: 'POST', path: '/api/demo/simulate-expiry', file: 'server/src/routes/demoRoutes.ts', line: 64, auth: false, description: 'Simulate batch shelf-life expiry and deactivation' },

  // Market Prices
  { id: 'api:GET /api/market-prices/daily', method: 'GET', path: '/api/market-prices/daily', file: 'server/src/routes/marketPriceRoutes.ts', line: 10, auth: false, description: 'Get daily live mandi rates and KisanDirect benchmark prices' },
  { id: 'api:GET /api/market-prices/ticker', method: 'GET', path: '/api/market-prices/ticker', file: 'server/src/routes/marketPriceRoutes.ts', line: 50, auth: false, description: 'Get lightweight ticker rates for top header' },
  { id: 'api:GET /api/market-prices/mandis', method: 'GET', path: '/api/market-prices/mandis', file: 'server/src/routes/marketPriceRoutes.ts', line: 65, auth: false, description: 'List available mandis directory' }
];

apiEndpoints.forEach(ep => {
  addNode({
    id: ep.id,
    type: 'api_endpoint',
    name: `${ep.method} ${ep.path}`,
    method: ep.method,
    path: ep.path,
    file: ep.file,
    source: ep.file,
    line: ep.line,
    authRequired: ep.auth,
    module: 'module:server-routes',
    description: ep.description
  });
  addRel(`file:${ep.file}`, 'contains', ep.id);
});

// -------------------------------------------------------------
// 6. CLIENT FILES, CONTEXTS, AND COMPONENTS
// -------------------------------------------------------------
const clientFiles = [
  { id: 'file:client/src/main.tsx', path: 'client/src/main.tsx', module: 'module:client-core', description: 'React 18 DOM mount with StrictMode' },
  { id: 'file:client/src/vite-env.d.ts', path: 'client/src/vite-env.d.ts', module: 'module:client-core', description: 'Vite client TypeScript environment definitions' },
  { id: 'file:client/src/App.tsx', path: 'client/src/App.tsx', module: 'module:client-core', description: 'Root application shell, state-based view router, modal controllers, and demo hooks' },
  { id: 'file:client/src/services/api.ts', path: 'client/src/services/api.ts', module: 'module:client-services', description: 'Centralized HTTP client wrapping all backend REST endpoints with JWT handling' },
  { id: 'file:client/src/types/index.ts', path: 'client/src/types/index.ts', module: 'module:client-core', description: 'TypeScript interface definitions for users, profiles, batches, orders, and mandis' },
  { id: 'file:client/src/context/AuthContext.tsx', path: 'client/src/context/AuthContext.tsx', module: 'module:client-context', description: 'Authentication context, session management, demo persona switcher, and notification polling' },
  { id: 'file:client/src/context/CartContext.tsx', path: 'client/src/context/CartContext.tsx', module: 'module:client-context', description: 'Cart context managing shopping items, quantities, subtotal, and drawer toggle' },
  { id: 'file:client/src/context/LanguageContext.tsx', path: 'client/src/context/LanguageContext.tsx', module: 'module:client-context', description: 'Dual-language context providing English and Tamil translations with key dictionary' },

  // Common Components
  { id: 'file:client/src/components/common/Navbar.tsx', path: 'client/src/components/common/Navbar.tsx', module: 'module:client-components-common', description: 'Global header with live mandi rate ticker, cart button, notifications, and language switcher' },
  { id: 'file:client/src/components/common/DemoScenarioBar.tsx', path: 'client/src/components/common/DemoScenarioBar.tsx', module: 'module:client-components-common', description: 'Top presenter bar for triggering 3 SIH evaluation scenarios and 5 persona switches' },
  { id: 'file:client/src/components/common/FreshnessBadge.tsx', path: 'client/src/components/common/FreshnessBadge.tsx', module: 'module:client-components-common', description: 'Visual countdown badge showing FRESH, AGING, URGENT SALE, or EXPIRED with live time remaining' },
  { id: 'file:client/src/components/common/FairPriceGauge.tsx', path: 'client/src/components/common/FairPriceGauge.tsx', module: 'module:client-components-common', description: 'Comparative pricing gauge showing APMC Mandi Modal vs KisanDirect vs Middlemen rates' },
  { id: 'file:client/src/components/common/DeliveryMap.tsx', path: 'client/src/components/common/DeliveryMap.tsx', module: 'module:client-components-common', description: 'SVG route visualization from farm clusters to hub to buyer delivery destination' },
  { id: 'file:client/src/components/common/VoiceListingModal.tsx', path: 'client/src/components/common/VoiceListingModal.tsx', module: 'module:client-components-common', description: 'Simulated bilingual voice assistant parsing spoken harvests into structured produce batches' },
  { id: 'file:client/src/components/common/MobileBottomNav.tsx', path: 'client/src/components/common/MobileBottomNav.tsx', module: 'module:client-components-common', description: 'Mobile bottom tab navigation bar' },
  { id: 'file:client/src/components/common/OnboardingView.tsx', path: 'client/src/components/common/OnboardingView.tsx', module: 'module:client-components-common', description: '4-step onboarding carousel introducing platform innovations and role selection' },
  { id: 'file:client/src/components/common/SplashScreen.tsx', path: 'client/src/components/common/SplashScreen.tsx', module: 'module:client-components-common', description: 'Animated splash screen with SIH26033 problem statement tag' },

  // Feature Components - Farmer
  { id: 'file:client/src/features/farmer/FarmerDashboard.tsx', path: 'client/src/features/farmer/FarmerDashboard.tsx', module: 'module:client-features-farmer', description: 'Farmer overview with quick listing, pending offers, active orders, and live batch freshness' },
  { id: 'file:client/src/features/farmer/AddProduce.tsx', path: 'client/src/features/farmer/AddProduce.tsx', module: 'module:client-features-farmer', description: '5-step produce listing wizard with photo upload, grade selection, shelf-life hours, and price gauge' },
  { id: 'file:client/src/features/farmer/MyProduce.tsx', path: 'client/src/features/farmer/MyProduce.tsx', module: 'module:client-features-farmer', description: 'Inventory management showing batch cards, freshness countdowns, and quick actions' },
  { id: 'file:client/src/features/farmer/FarmerOffers.tsx', path: 'client/src/features/farmer/FarmerOffers.tsx', module: 'module:client-features-farmer', description: 'Bilateral buyer offer inbox with Accept, Reject, and Counter-Offer actions' },
  { id: 'file:client/src/features/farmer/FarmerCollective.tsx', path: 'client/src/features/farmer/FarmerCollective.tsx', module: 'module:client-features-farmer', description: 'Collective selling pooling history showing farmer share in aggregated bulk orders' },
  { id: 'file:client/src/features/farmer/FarmerOrders.tsx', path: 'client/src/features/farmer/FarmerOrders.tsx', module: 'module:client-features-farmer', description: 'Farmer orders tracking pickup scheduling and collection center drop-offs' },
  { id: 'file:client/src/features/farmer/FarmerEarnings.tsx', path: 'client/src/features/farmer/FarmerEarnings.tsx', module: 'module:client-features-farmer', description: 'Farmer earnings telemetry, released payouts, and middlemen savings comparison' },

  // Feature Components - Buyer
  { id: 'file:client/src/features/buyer/BuyerDashboard.tsx', path: 'client/src/features/buyer/BuyerDashboard.tsx', module: 'module:client-features-buyer', description: 'Buyer overview showing active demands, orders in transit, and total spend' },
  { id: 'file:client/src/features/buyer/Marketplace.tsx', path: 'client/src/features/buyer/Marketplace.tsx', module: 'module:client-features-buyer', description: 'Produce marketplace with filters (crop, grade, freshness, max price, sort) and add-to-cart' },
  { id: 'file:client/src/features/buyer/PostDemand.tsx', path: 'client/src/features/buyer/PostDemand.tsx', module: 'module:client-features-buyer', description: 'Commercial bulk demand form specifying quantity, budget band, required grade, and delivery deadline' },
  { id: 'file:client/src/features/buyer/SmartMatches.tsx', path: 'client/src/features/buyer/SmartMatches.tsx', module: 'module:client-features-buyer', description: 'Smart match view displaying individual candidate batches and auto-formed collective supply pool' },
  { id: 'file:client/src/features/buyer/ProductDetailPage.tsx', path: 'client/src/features/buyer/ProductDetailPage.tsx', module: 'module:client-features-buyer', description: 'Batch detail modal with freshness badge, farmer rating, quantity selector, and Buy Now' },
  { id: 'file:client/src/features/buyer/CartDrawer.tsx', path: 'client/src/features/buyer/CartDrawer.tsx', module: 'module:client-features-buyer', description: 'Slide-over cart drawer with quantity adjustments, delivery fee calculation, and checkout CTA' },
  { id: 'file:client/src/features/buyer/CheckoutModal.tsx', path: 'client/src/features/buyer/CheckoutModal.tsx', module: 'module:client-features-buyer', description: 'Checkout dialog with address, phone, escrow payment authorization, and instant order placement' },
  { id: 'file:client/src/features/buyer/BuyerOrders.tsx', path: 'client/src/features/buyer/BuyerOrders.tsx', module: 'module:client-features-buyer', description: 'Order tracking view with 10-step progress bar, route map, escrow status, and rating submission' },

  // Feature Components - Others
  { id: 'file:client/src/features/coordinator/CoordinatorDashboard.tsx', path: 'client/src/features/coordinator/CoordinatorDashboard.tsx', module: 'module:client-features-coordinator', description: 'Coordinator hub with assisted farmer registration and voice batch listing' },
  { id: 'file:client/src/features/logistics/LogisticsDashboard.tsx', path: 'client/src/features/logistics/LogisticsDashboard.tsx', module: 'module:client-features-logistics', description: 'Fleet dashboard with pickups, deliveries, vehicles, and hub quality check submission' },
  { id: 'file:client/src/features/admin/AdminDashboard.tsx', path: 'client/src/features/admin/AdminDashboard.tsx', module: 'module:client-features-admin', description: 'Admin console with platform counts, financials, dispute arbitration, and impact metrics' },

  // Feature Components - Public
  { id: 'file:client/src/features/public/LandingPage.tsx', path: 'client/src/features/public/LandingPage.tsx', module: 'module:client-features-public', description: 'Public landing hero, key innovations showcase, interactive mandi price widget, and persona CTAs' },
  { id: 'file:client/src/features/public/HowItWorksPage.tsx', path: 'client/src/features/public/HowItWorksPage.tsx', module: 'module:client-features-public', description: 'Illustrated breakdown of 4-step farm-to-door direct supply chain' },
  { id: 'file:client/src/features/public/ForFarmersPage.tsx', path: 'client/src/features/public/ForFarmersPage.tsx', module: 'module:client-features-public', description: 'Farmer-focused value proposition, voice listing demo, and price guarantee highlights' },
  { id: 'file:client/src/features/public/ForBuyersPage.tsx', path: 'client/src/features/public/ForBuyersPage.tsx', module: 'module:client-features-public', description: 'Buyer-focused value proposition, commercial bulk pooling, and freshness guarantee' },
  { id: 'file:client/src/features/public/ImpactPage.tsx', path: 'client/src/features/public/ImpactPage.tsx', module: 'module:client-features-public', description: 'Socio-economic impact metrics: farmer income increase, wastage reduction, and middlemen eliminated' },
  { id: 'file:client/src/features/public/LoginPage.tsx', path: 'client/src/features/public/LoginPage.tsx', module: 'module:client-features-public', description: 'Login form with mobile/email and password, plus quick persona login pills' },
  { id: 'file:client/src/features/public/RegisterPage.tsx', path: 'client/src/features/public/RegisterPage.tsx', module: 'module:client-features-public', description: 'Role-based registration form with role selection (Farmer, Buyer, Coordinator)' },
  { id: 'file:client/src/features/public/MarketRatesPage.tsx', path: 'client/src/features/public/MarketRatesPage.tsx', module: 'module:client-features-public', description: 'Dedicated live market rates explorer across 13 Tamil Nadu mandis with grid/table views' },
  { id: 'file:client/src/features/public/ProfilePage.tsx', path: 'client/src/features/public/ProfilePage.tsx', module: 'module:client-features-public', description: 'User profile management showing verified status, contact details, and role info' }
];

clientFiles.forEach(f => {
  addNode({ id: f.id, type: 'file', name: path.basename(f.path), path: f.path, module: f.module, description: f.description });
  addRel(f.module, 'contains', f.id);
});

// Important UI Components
const uiComponents = [
  { id: 'component:App', name: 'App', file: 'client/src/App.tsx', description: 'Root component providing Context wrappers and rendering AppContent' },
  { id: 'component:Navbar', name: 'Navbar', file: 'client/src/components/common/Navbar.tsx', description: 'Main navigation bar with live APMC rates ticker, cart drawer trigger, and language selector' },
  { id: 'component:DemoScenarioBar', name: 'DemoScenarioBar', file: 'client/src/components/common/DemoScenarioBar.tsx', description: 'Interactive demo switcher bar triggering 3 SIH scenarios and 5 user personas' },
  { id: 'component:FreshnessBadge', name: 'FreshnessBadge', file: 'client/src/components/common/FreshnessBadge.tsx', description: 'Countdown badge reflecting produce freshness state and remaining shelf-life' },
  { id: 'component:FairPriceGauge', name: 'FairPriceGauge', file: 'client/src/components/common/FairPriceGauge.tsx', description: 'Price benchmark gauge comparing APMC Mandi Modal with KisanDirect Fair Price' },
  { id: 'component:DeliveryMap', name: 'DeliveryMap', file: 'client/src/components/common/DeliveryMap.tsx', description: 'Interactive SVG route map showing collection center and delivery path' },
  { id: 'component:VoiceListingModal', name: 'VoiceListingModal', file: 'client/src/components/common/VoiceListingModal.tsx', description: 'Speech-to-text assisted produce listing modal with Tamil audio prompts' },
  { id: 'component:CartDrawer', name: 'CartDrawer', file: 'client/src/features/buyer/CartDrawer.tsx', description: 'Shopping cart slide-over drawer showing selected produce items and direct checkout action' },
  { id: 'component:CheckoutModal', name: 'CheckoutModal', file: 'client/src/features/buyer/CheckoutModal.tsx', description: 'Direct checkout confirmation dialog authorizing escrow payment' },
  { id: 'component:SmartMatches', name: 'SmartMatches', file: 'client/src/features/buyer/SmartMatches.tsx', description: 'Displays candidate farmer matches and collective supply pool with single-click order creation' },
  { id: 'component:Marketplace', name: 'Marketplace', file: 'client/src/features/buyer/Marketplace.tsx', description: 'Browse and filter available produce with live freshness badges and add to cart' },
  { id: 'component:BuyerOrders', name: 'BuyerOrders', file: 'client/src/features/buyer/BuyerOrders.tsx', description: 'Interactive 10-step order tracking with delivery map and rating feedback' },
  { id: 'component:AddProduce', name: 'AddProduce', file: 'client/src/features/farmer/AddProduce.tsx', description: 'Step-by-step farmer produce upload with camera capture and fair price gauge' },
  { id: 'component:FarmerOffers', name: 'FarmerOffers', file: 'client/src/features/farmer/FarmerOffers.tsx', description: 'Negotiation offer management with accept, reject, and counter-offer dialog' },
  { id: 'component:CoordinatorDashboard', name: 'CoordinatorDashboard', file: 'client/src/features/coordinator/CoordinatorDashboard.tsx', description: 'Digital village coordinator desk for assisted farmer registration and voice harvest input' },
  { id: 'component:LogisticsDashboard', name: 'LogisticsDashboard', file: 'client/src/features/logistics/LogisticsDashboard.tsx', description: 'Fleet logistics desk with quality verification modal and delivery tracking' },
  { id: 'component:AdminDashboard', name: 'AdminDashboard', file: 'client/src/features/admin/AdminDashboard.tsx', description: 'Governance control center with dispute resolution and impact calculations' }
];

uiComponents.forEach(c => {
  addNode({ id: c.id, type: 'component', name: c.name, file: c.file, source: c.file, description: c.description });
  addRel(`file:${c.file}`, 'contains', c.id);
});

// React Context Hooks
const hooks = [
  { id: 'hook:useAuth', name: 'useAuth', file: 'client/src/context/AuthContext.tsx', description: 'Hook providing current user profile, login, logout, demoSwitch, and notifications' },
  { id: 'hook:useCart', name: 'useCart', file: 'client/src/context/CartContext.tsx', description: 'Hook providing shopping cart items, add/remove/update, subtotal, and drawer controls' },
  { id: 'hook:useLanguage', name: 'useLanguage', file: 'client/src/context/LanguageContext.tsx', description: 'Hook providing current language (en/ta), setLanguage, and translation function t(key)' }
];

hooks.forEach(h => {
  addNode({ id: h.id, type: 'hook', name: h.name, file: h.file, source: h.file, description: h.description });
  addRel(`file:${h.file}`, 'contains', h.id);
});

// -------------------------------------------------------------
// 7. WORKFLOW NODES
// -------------------------------------------------------------
const workflows = [
  {
    id: 'workflow:reverse-demand-collective-pooling',
    name: 'Workflow 1: Reverse Demand & Collective Supply Pooling (கூட்டு விற்பனை)',
    description: 'Buyer posts 500kg demand -> MatchingService scores candidate farmers -> Collective pool auto-assembled -> Buyer confirms -> CollectiveSellingService creates order & locks escrow -> Farmers notified'
  },
  {
    id: 'workflow:perishable-freshness-decay',
    name: 'Workflow 2: Freshness Decay, Urgent Sale & Auto-Expiration',
    description: 'Farmer lists batch -> FreshnessService computes hourly decay -> At 4h enters URGENT SALE (15% discount) -> WhatsApp alert broadcast to B2B buyers -> At 0h marks EXPIRED and deactivates listing'
  },
  {
    id: 'workflow:direct-cart-checkout',
    name: 'Workflow 3: Direct Cart Purchase & Escrow Authorization (Mode 1)',
    description: 'Buyer browses marketplace -> Adds batches to cart -> Opens CartDrawer -> Clicks Checkout -> Authorizes escrow payment -> Order created -> Quantities deducted -> Farmers notified'
  },
  {
    id: 'workflow:assisted-voice-listing',
    name: 'Workflow 4: Low-Literacy Farmer Assisted Voice Harvest Listing',
    description: 'Farmer or Coordinator opens VoiceListingModal -> Speaks harvest details in Tamil/English -> Web Speech API extracts crop, qty, price -> Preview confirmed -> ProduceBatch created with unique batchCode'
  },
  {
    id: 'workflow:order-fulfillment-state-machine',
    name: 'Workflow 5: 10-Stage Order Fulfillment & Quality Verification',
    description: 'ORDERED -> ACCEPTED -> PICKUP_SCHEDULED -> COLLECTED -> QUALITY_CHECKED (hub inspection) -> PACKED -> DISPATCHED -> DELIVERED (GPS updates) -> PAYMENT_RELEASED (auto escrow payout to farmers) -> COMPLETED'
  },
  {
    id: 'workflow:bilateral-offer-negotiation',
    name: 'Workflow 6: Direct Price Negotiation & Counter-Offers',
    description: 'Buyer submits offer on farmer batch -> Farmer receives notification -> Farmer accepts (locks stock) OR counters with new price -> Buyer receives counter-offer -> Agreement leads to order'
  },
  {
    id: 'workflow:dispute-arbitration',
    name: 'Workflow 7: Quality Dispute Arbitration & Resolution',
    description: 'Buyer or Farmer raises dispute with reason & evidence -> Admin views dispute dashboard -> Examines weighing logs & photos -> Updates status to RESOLVED with notes -> Adjusts escrow payout'
  }
];

workflows.forEach(w => addNode({ id: w.id, type: 'workflow', name: w.name, description: w.description }));

// -------------------------------------------------------------
// 8. CONFIGURATION NODES
// -------------------------------------------------------------
const configs = [
  { id: 'config:PORT', name: 'PORT', description: 'Server HTTP listening port (default: 5000)' },
  { id: 'config:NODE_ENV', name: 'NODE_ENV', description: 'Execution environment (development | production)' },
  { id: 'config:DATABASE_URL', name: 'DATABASE_URL', description: 'PostgreSQL or SQLite database connection URL for Prisma ORM' },
  { id: 'config:DIRECT_URL', name: 'DIRECT_URL', description: 'Direct connection URL bypassing transaction poolers for Prisma migrations' },
  { id: 'config:SUPABASE_URL', name: 'SUPABASE_URL', description: 'Supabase project API gateway endpoint' },
  { id: 'config:SUPABASE_ANON_KEY', name: 'SUPABASE_ANON_KEY', description: 'Supabase anonymous client public authorization key' },
  { id: 'config:JWT_SECRET', name: 'JWT_SECRET', description: 'HMAC SHA-256 secret key for signing and verifying user tokens' },
  { id: 'config:JWT_EXPIRES_IN', name: 'JWT_EXPIRES_IN', description: 'Token lifetime duration (default: 7d)' },
  { id: 'config:DATA_GOV_IN_API_KEY', name: 'DATA_GOV_IN_API_KEY', description: 'Government Agmarknet API key for live APMC mandi wholesale price synchronization' },
  { id: 'config:MAPS_API_KEY', name: 'MAPS_API_KEY', description: 'Mapping service API key for route rendering and geocoding' },
  { id: 'config:PAYMENT_API_KEY', name: 'PAYMENT_API_KEY', description: 'Payment gateway API key (e.g. Razorpay / Mock UPI)' },
  { id: 'config:SMS_API_KEY', name: 'SMS_API_KEY', description: 'SMS notification provider API key (e.g. Fast2SMS / Mock)' },
  { id: 'config:VOICE_API_KEY', name: 'VOICE_API_KEY', description: 'Speech recognition API key (Google Speech / Web Speech API)' },
  { id: 'config:FRONTEND_URL', name: 'FRONTEND_URL', description: 'Client application origin URL for CORS configuration (default: http://localhost:5173)' }
];

configs.forEach(c => addNode({ id: c.id, type: 'config', name: c.name, description: c.description }));

// -------------------------------------------------------------
// 9. CROSS-ENTITY RELATIONSHIPS
// -------------------------------------------------------------

// Service <-> Database relationships
addRel('function:CollectiveSellingService.createCollectiveOrder', 'queries', 'table:ProduceBatch');
addRel('function:CollectiveSellingService.createCollectiveOrder', 'queries', 'table:FarmerProfile');
addRel('function:CollectiveSellingService.createCollectiveOrder', 'mutates', 'table:CollectiveOrder');
addRel('function:CollectiveSellingService.createCollectiveOrder', 'mutates', 'table:Order');
addRel('function:CollectiveSellingService.createCollectiveOrder', 'mutates', 'table:CollectiveOrderMember');
addRel('function:CollectiveSellingService.createCollectiveOrder', 'mutates', 'table:OrderItem');
addRel('function:CollectiveSellingService.createCollectiveOrder', 'mutates', 'table:ProduceBatch');
addRel('function:CollectiveSellingService.createCollectiveOrder', 'mutates', 'table:BuyerDemand');
addRel('function:CollectiveSellingService.createCollectiveOrder', 'mutates', 'table:Payment');
addRel('function:CollectiveSellingService.createCollectiveOrder', 'mutates', 'table:Notification');

addRel('function:FreshnessService.calculateFreshness', 'reads', 'table:FreshnessRule');
addRel('function:FreshnessService.evaluateAllActiveBatches', 'queries', 'table:ProduceBatch');
addRel('function:FreshnessService.evaluateAllActiveBatches', 'queries', 'table:Product');
addRel('function:FreshnessService.evaluateAllActiveBatches', 'mutates', 'table:ProduceBatch');

addRel('function:MatchingService.findMatchesForDemand', 'queries', 'table:BuyerDemand');
addRel('function:MatchingService.findMatchesForDemand', 'queries', 'table:ProduceBatch');
addRel('function:MatchingService.findMatchesForDemand', 'calls', 'function:MatchingService.calculateDistance');
addRel('function:MatchingService.findMatchesForDemand', 'calls', 'function:MatchingService.evaluateBatchSuitability');
addRel('function:MatchingService.findMatchesForDemand', 'calls', 'function:MatchingService.buildCollectiveSupplyPool');

addRel('function:OrderStateMachine.transitionOrder', 'queries', 'table:Order');
addRel('function:OrderStateMachine.transitionOrder', 'mutates', 'table:Order');
addRel('function:OrderStateMachine.transitionOrder', 'mutates', 'table:Payment');
addRel('function:OrderStateMachine.transitionOrder', 'mutates', 'table:FarmerPayout');
addRel('function:OrderStateMachine.transitionOrder', 'mutates', 'table:FarmerProfile');
addRel('function:OrderStateMachine.transitionOrder', 'mutates', 'table:ProduceBatch');
addRel('function:OrderStateMachine.transitionOrder', 'mutates', 'table:Notification');

addRel('function:PaymentService.authorizePayment', 'queries', 'table:Order');
addRel('function:PaymentService.authorizePayment', 'mutates', 'table:Payment');
addRel('function:PaymentService.releasePayment', 'queries', 'table:Payment');
addRel('function:PaymentService.releasePayment', 'mutates', 'table:Payment');
addRel('function:PaymentService.releasePayment', 'mutates', 'table:FarmerPayout');

addRel('function:NotificationService.notify', 'mutates', 'table:Notification');
addRel('function:NotificationService.broadcastUrgentSale', 'queries', 'table:BuyerProfile');
addRel('function:NotificationService.broadcastUrgentSale', 'mutates', 'table:Notification');

// API <-> Service & Database relationships
addRel('api:POST /api/auth/register', 'mutates', 'table:User');
addRel('api:POST /api/auth/register', 'mutates', 'table:FarmerProfile');
addRel('api:POST /api/auth/register', 'mutates', 'table:BuyerProfile');
addRel('api:POST /api/auth/register', 'mutates', 'table:CoordinatorProfile');
addRel('api:POST /api/auth/login', 'queries', 'table:User');
addRel('api:GET /api/auth/me', 'queries', 'table:User');
addRel('api:POST /api/auth/demo-switch', 'queries', 'table:User');

addRel('api:GET /api/farmers/products', 'queries', 'table:Product');
addRel('api:GET /api/farmers/products', 'queries', 'table:FreshnessRule');
addRel('api:GET /api/farmers/products', 'queries', 'table:MarketPrice');

addRel('api:GET /api/farmers/dashboard', 'calls', 'function:FreshnessService.evaluateAllActiveBatches');
addRel('api:GET /api/farmers/dashboard', 'queries', 'table:ProduceBatch');
addRel('api:GET /api/farmers/dashboard', 'queries', 'table:Offer');
addRel('api:GET /api/farmers/dashboard', 'queries', 'table:OrderItem');
addRel('api:GET /api/farmers/dashboard', 'queries', 'table:FarmerPayout');

addRel('api:POST /api/farmers/batches', 'calls', 'function:FreshnessService.calculateFreshness');
addRel('api:POST /api/farmers/batches', 'mutates', 'table:ProduceBatch');
addRel('api:POST /api/farmers/batches', 'mutates', 'table:ProductImage');

addRel('api:GET /api/farmers/batches', 'queries', 'table:ProduceBatch');
addRel('api:GET /api/farmers/batches', 'calls', 'function:FreshnessService.calculateFreshness');

addRel('api:GET /api/farmers/offers', 'queries', 'table:Offer');
addRel('api:PATCH /api/farmers/offers/:id/accept', 'mutates', 'table:Offer');
addRel('api:PATCH /api/farmers/offers/:id/accept', 'mutates', 'table:Notification');
addRel('api:PATCH /api/farmers/offers/:id/reject', 'mutates', 'table:Offer');
addRel('api:POST /api/farmers/offers/:id/counter', 'mutates', 'table:Offer');
addRel('api:POST /api/farmers/offers/:id/counter', 'mutates', 'table:OfferHistory');
addRel('api:POST /api/farmers/offers/:id/counter', 'mutates', 'table:Notification');

addRel('api:GET /api/farmers/orders', 'queries', 'table:OrderItem');
addRel('api:GET /api/farmers/collective-pools', 'queries', 'table:CollectiveOrderMember');
addRel('api:GET /api/farmers/earnings', 'queries', 'table:FarmerPayout');

addRel('api:GET /api/buyers/marketplace', 'calls', 'function:FreshnessService.evaluateAllActiveBatches');
addRel('api:GET /api/buyers/marketplace', 'queries', 'table:ProduceBatch');
addRel('api:GET /api/buyers/marketplace', 'calls', 'function:MatchingService.calculateDistance');
addRel('api:GET /api/buyers/marketplace', 'calls', 'function:FreshnessService.calculateFreshness');

addRel('api:POST /api/buyers/demands', 'mutates', 'table:BuyerDemand');
addRel('api:GET /api/buyers/demands', 'queries', 'table:BuyerDemand');
addRel('api:GET /api/buyers/demands/:id/matches', 'calls', 'function:MatchingService.findMatchesForDemand');
addRel('api:POST /api/buyers/demands/:id/offers', 'mutates', 'table:Offer');
addRel('api:POST /api/buyers/demands/:id/offers', 'mutates', 'table:OfferHistory');
addRel('api:POST /api/buyers/demands/:id/offers', 'mutates', 'table:Notification');
addRel('api:POST /api/buyers/demands/:id/collective-order', 'calls', 'function:CollectiveSellingService.createCollectiveOrder');

addRel('api:GET /api/buyers/cart', 'queries', 'table:Cart');
addRel('api:GET /api/buyers/cart', 'queries', 'table:CartItem');
addRel('api:POST /api/buyers/cart/items', 'mutates', 'table:CartItem');
addRel('api:PATCH /api/buyers/cart/items/:id', 'mutates', 'table:CartItem');
addRel('api:DELETE /api/buyers/cart/items/:id', 'mutates', 'table:CartItem');
addRel('api:DELETE /api/buyers/cart', 'mutates', 'table:CartItem');

addRel('api:POST /api/buyers/checkout', 'queries', 'table:ProduceBatch');
addRel('api:POST /api/buyers/checkout', 'mutates', 'table:ProduceBatch');
addRel('api:POST /api/buyers/checkout', 'mutates', 'table:Order');
addRel('api:POST /api/buyers/checkout', 'mutates', 'table:OrderItem');
addRel('api:POST /api/buyers/checkout', 'mutates', 'table:Payment');
addRel('api:POST /api/buyers/checkout', 'mutates', 'table:Delivery');
addRel('api:POST /api/buyers/checkout', 'mutates', 'table:CartItem');
addRel('api:POST /api/buyers/checkout', 'mutates', 'table:Notification');

addRel('api:GET /api/orders/:id', 'queries', 'table:Order');
addRel('api:PATCH /api/orders/:id/status', 'calls', 'function:OrderStateMachine.transitionOrder');
addRel('api:POST /api/orders/:id/dispute', 'mutates', 'table:Dispute');

addRel('api:POST /api/logistics/pickups', 'mutates', 'table:PickupRequest');
addRel('api:POST /api/logistics/pickups', 'calls', 'function:OrderStateMachine.transitionOrder');
addRel('api:PATCH /api/logistics/pickups/:id', 'mutates', 'table:PickupRequest');
addRel('api:PATCH /api/logistics/pickups/:id', 'calls', 'function:OrderStateMachine.transitionOrder');

addRel('api:PATCH /api/logistics/deliveries/:id/status', 'mutates', 'table:Delivery');
addRel('api:PATCH /api/logistics/deliveries/:id/status', 'calls', 'function:OrderStateMachine.transitionOrder');

addRel('api:POST /api/quality-checks', 'mutates', 'table:QualityCheck');
addRel('api:POST /api/quality-checks', 'calls', 'function:OrderStateMachine.transitionOrder');

addRel('api:POST /api/payments/create', 'calls', 'function:PaymentService.authorizePayment');
addRel('api:POST /api/payments/release/:id', 'calls', 'function:PaymentService.releasePayment');

addRel('api:POST /api/ratings', 'mutates', 'table:Rating');
addRel('api:POST /api/ratings', 'mutates', 'table:FarmerProfile');

addRel('api:POST /api/coordinator/register-farmer', 'mutates', 'table:User');
addRel('api:POST /api/coordinator/register-farmer', 'mutates', 'table:FarmerProfile');
addRel('api:POST /api/coordinator/create-batch', 'calls', 'function:FreshnessService.calculateFreshness');
addRel('api:POST /api/coordinator/create-batch', 'mutates', 'table:ProduceBatch');

addRel('api:POST /api/demo/simulate-urgency', 'mutates', 'table:ProduceBatch');
addRel('api:POST /api/demo/simulate-urgency', 'mutates', 'table:Notification');
addRel('api:POST /api/demo/simulate-urgency', 'calls', 'function:NotificationService.broadcastUrgentSale');
addRel('api:POST /api/demo/simulate-expiry', 'mutates', 'table:ProduceBatch');
addRel('api:POST /api/demo/simulate-expiry', 'mutates', 'table:Notification');

addRel('api:GET /api/market-prices/daily', 'calls', 'function:MarketPriceService.getDailyRates');
addRel('api:GET /api/market-prices/ticker', 'calls', 'function:MarketPriceService.getTickerRates');

// Client API service -> HTTP Endpoints
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:POST /api/auth/login');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:POST /api/auth/register');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:POST /api/auth/demo-switch');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:GET /api/auth/me');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:GET /api/farmers/products');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:GET /api/farmers/dashboard');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:GET /api/farmers/batches');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:POST /api/farmers/batches');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:GET /api/farmers/offers');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:PATCH /api/farmers/offers/:id/accept');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:PATCH /api/farmers/offers/:id/reject');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:POST /api/farmers/offers/:id/counter');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:GET /api/farmers/orders');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:GET /api/farmers/earnings');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:GET /api/buyers/marketplace');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:POST /api/buyers/demands');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:GET /api/buyers/demands');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:GET /api/buyers/demands/:id/matches');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:POST /api/buyers/demands/:id/collective-order');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:GET /api/buyers/orders');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:GET /api/buyers/cart');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:POST /api/buyers/cart/items');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:PATCH /api/buyers/cart/items/:id');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:DELETE /api/buyers/cart/items/:id');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:DELETE /api/buyers/cart');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:POST /api/buyers/checkout');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:GET /api/orders/:id');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:PATCH /api/orders/:id/status');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:POST /api/orders/:id/dispute');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:POST /api/quality-checks');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:POST /api/ratings');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:GET /api/market-prices/daily');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:GET /api/market-prices/ticker');
addRel('file:client/src/services/api.ts', 'invokes_api', 'api:POST /api/upload');

// Frontend Context & Component relationships
addRel('component:App', 'uses_hook', 'hook:useAuth');
addRel('component:App', 'uses_hook', 'hook:useLanguage');
addRel('component:App', 'uses_hook', 'hook:useCart');
addRel('component:App', 'renders', 'component:Navbar');
addRel('component:App', 'renders', 'component:DemoScenarioBar');
addRel('component:App', 'renders', 'component:CartDrawer');
addRel('component:App', 'renders', 'component:CheckoutModal');
addRel('component:App', 'renders', 'component:VoiceListingModal');

addRel('component:Navbar', 'uses_hook', 'hook:useAuth');
addRel('component:Navbar', 'uses_hook', 'hook:useLanguage');
addRel('component:Navbar', 'uses_hook', 'hook:useCart');

addRel('component:CartDrawer', 'uses_hook', 'hook:useCart');
addRel('component:CartDrawer', 'uses_hook', 'hook:useLanguage');

addRel('component:CheckoutModal', 'uses_hook', 'hook:useCart');
addRel('component:CheckoutModal', 'uses_hook', 'hook:useAuth');
addRel('component:CheckoutModal', 'uses_hook', 'hook:useLanguage');

addRel('component:Marketplace', 'uses_hook', 'hook:useLanguage');
addRel('component:Marketplace', 'uses_hook', 'hook:useCart');
addRel('component:Marketplace', 'renders', 'component:FreshnessBadge');

addRel('component:SmartMatches', 'uses_hook', 'hook:useLanguage');
addRel('component:SmartMatches', 'implements', 'feature:smart-matching-algorithm');
addRel('component:SmartMatches', 'implements', 'feature:collective-selling');

addRel('component:BuyerOrders', 'uses_hook', 'hook:useLanguage');
addRel('component:BuyerOrders', 'renders', 'component:DeliveryMap');
addRel('component:BuyerOrders', 'implements', 'feature:escrow-order-state-machine');

addRel('component:AddProduce', 'uses_hook', 'hook:useLanguage');
addRel('component:AddProduce', 'renders', 'component:FairPriceGauge');
addRel('component:AddProduce', 'implements', 'feature:fair-price-transparency');

addRel('component:VoiceListingModal', 'uses_hook', 'hook:useLanguage');
addRel('component:VoiceListingModal', 'implements', 'feature:voice-assisted-listing');

// Workflows <-> Features
addRel('workflow:reverse-demand-collective-pooling', 'implements', 'feature:collective-selling');
addRel('workflow:reverse-demand-collective-pooling', 'implements', 'feature:smart-matching-algorithm');
addRel('workflow:perishable-freshness-decay', 'implements', 'feature:freshness-decay-engine');
addRel('workflow:direct-cart-checkout', 'implements', 'feature:two-tier-checkout');
addRel('workflow:direct-cart-checkout', 'implements', 'feature:escrow-order-state-machine');
addRel('workflow:assisted-voice-listing', 'implements', 'feature:voice-assisted-listing');
addRel('workflow:order-fulfillment-state-machine', 'implements', 'feature:escrow-order-state-machine');
addRel('workflow:order-fulfillment-state-machine', 'implements', 'feature:quality-verification-logistics');
addRel('workflow:bilateral-offer-negotiation', 'implements', 'feature:fair-price-transparency');
addRel('workflow:dispute-arbitration', 'implements', 'feature:escrow-order-state-machine');
addRel('component:FarmerOffers', 'implements', 'workflow:bilateral-offer-negotiation');
addRel('component:AdminDashboard', 'implements', 'workflow:dispute-arbitration');

// Save JSON Knowledge Graph
const graph = {
  version: '1.0.0',
  project: 'KisanDirect - Community-Powered Direct Agricultural Marketplace',
  problemStatementId: 'SIH26033',
  generatedAt: new Date().toISOString(),
  stats: {
    totalNodes: nodes.length,
    totalRelationships: relationships.length,
    nodeTypes: nodes.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {})
  },
  nodes,
  relationships
};

const graphFilePath = path.join(knowledgeDir, 'knowledge-graph.json');
fs.writeFileSync(graphFilePath, JSON.stringify(graph, null, 2), 'utf-8');

console.log(`✅ Project Knowledge Graph generated successfully at: ${graphFilePath}`);
console.log(`📊 Total Nodes: ${nodes.length}`);
console.log(`🔗 Total Relationships: ${relationships.length}`);
console.log('📈 Breakdown by Type:', graph.stats.nodeTypes);
