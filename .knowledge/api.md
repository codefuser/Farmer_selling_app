# 🌐 KisanDirect REST API Catalog

> **Repository**: `Farmer_selling_app`  
> Complete technical reference for all REST API endpoints exposed by the KisanDirect server.

---

## 1. Authentication & Persona Switcher APIs (`/api/auth`)

| Endpoint | Method | Auth | Frontend Caller | Backend Handler | Database Mutation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | None | `api.register(userData)` | [`authRoutes.ts:L11-L123`](file:///d:/Projects/Farmer_selling_app/server/src/routes/authRoutes.ts#L11-L123) | `User`, `FarmerProfile`, `BuyerProfile`, `CoordinatorProfile` |
| `/api/auth/login` | `POST` | None | `api.login(email, pass)` | [`authRoutes.ts:L126-L187`](file:///d:/Projects/Farmer_selling_app/server/src/routes/authRoutes.ts#L126-L187) | Reads `User` |
| `/api/auth/verify-otp` | `POST` | None | `api.verifyOtp(mobile, otp)` | [`authRoutes.ts:L190-L202`](file:///d:/Projects/Farmer_selling_app/server/src/routes/authRoutes.ts#L190-L202) | None (mock verification) |
| `/api/auth/demo-switch` | `POST` | None | `api.demoSwitch(role)` | [`authRoutes.ts:L205-L254`](file:///d:/Projects/Farmer_selling_app/server/src/routes/authRoutes.ts#L205-L254) | Reads `User` |
| `/api/auth/me` | `GET` | JWT | `api.getMe()` | [`authRoutes.ts:L257-L289`](file:///d:/Projects/Farmer_selling_app/server/src/routes/authRoutes.ts#L257-L289) | Reads `User` |

### Sample Payload: Register
```json
{
  "name": "Kumar Govindasamy",
  "email": "farmer@kisandirect.demo",
  "mobile": "9876543210",
  "password": "Password123",
  "role": "FARMER",
  "preferredLanguage": "ta",
  "village": "Thalaivasal",
  "district": "Salem",
  "landSize": 2.5
}
```

---

## 2. Farmer APIs (`/api/farmers`)

*All farmer endpoints require `authenticateToken`.*

| Endpoint | Method | Auth | Frontend Caller | Backend Handler | Services & Tables |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/farmers/products` | `GET` | JWT | `api.getFarmerProducts()` | [`farmerRoutes.ts:L20`](file:///d:/Projects/Farmer_selling_app/server/src/routes/farmerRoutes.ts#L20) | Reads `Product`, `FreshnessRule`, `MarketPrice` |
| `/api/farmers/dashboard` | `GET` | JWT | `api.getFarmerDashboard()` | [`farmerRoutes.ts:L38`](file:///d:/Projects/Farmer_selling_app/server/src/routes/farmerRoutes.ts#L38) | Invokes `FreshnessService.evaluateAllActiveBatches()`, reads `ProduceBatch`, `Offer`, `OrderItem`, `FarmerPayout` |
| `/api/farmers/batches` | `POST` | JWT | `api.createFarmerBatch(data)` | [`farmerRoutes.ts:L123`](file:///d:/Projects/Farmer_selling_app/server/src/routes/farmerRoutes.ts#L123) | Invokes `FreshnessService.calculateFreshness()`, creates `ProduceBatch`, `ProductImage` |
| `/api/farmers/batches` | `GET` | JWT | `api.getFarmerBatches()` | [`farmerRoutes.ts:L212`](file:///d:/Projects/Farmer_selling_app/server/src/routes/farmerRoutes.ts#L212) | Reads `ProduceBatch`, calls `calculateFreshness()` |
| `/api/farmers/offers` | `GET` | JWT | `api.getFarmerOffers()` | [`farmerRoutes.ts:L247`](file:///d:/Projects/Farmer_selling_app/server/src/routes/farmerRoutes.ts#L247) | Reads `Offer`, `OfferHistory` |
| `/api/farmers/offers/:id/accept` | `PATCH` | JWT | `api.acceptFarmerOffer(id)` | [`farmerRoutes.ts:L273`](file:///d:/Projects/Farmer_selling_app/server/src/routes/farmerRoutes.ts#L273) | Updates `Offer.status = ACCEPTED`, notifies Buyer |
| `/api/farmers/offers/:id/reject` | `PATCH` | JWT | `api.rejectFarmerOffer(id)` | [`farmerRoutes.ts:L314`](file:///d:/Projects/Farmer_selling_app/server/src/routes/farmerRoutes.ts#L314) | Updates `Offer.status = REJECTED` |
| `/api/farmers/offers/:id/counter` | `POST` | JWT | `api.counterFarmerOffer(id, p, n)` | [`farmerRoutes.ts:L329`](file:///d:/Projects/Farmer_selling_app/server/src/routes/farmerRoutes.ts#L329) | Updates `Offer.status = COUNTERED`, creates `OfferHistory`, notifies Buyer |
| `/api/farmers/orders` | `GET` | JWT | `api.getFarmerOrders()` | [`farmerRoutes.ts:L386`](file:///d:/Projects/Farmer_selling_app/server/src/routes/farmerRoutes.ts#L386) | Reads `OrderItem`, `Order`, `Delivery` |
| `/api/farmers/collective-pools` | `GET` | JWT | `api.getFarmerCollectivePools()` | [`farmerRoutes.ts:L416`](file:///d:/Projects/Farmer_selling_app/server/src/routes/farmerRoutes.ts#L416) | Reads `CollectiveOrderMember`, `CollectiveOrder` |
| `/api/farmers/earnings` | `GET` | JWT | `api.getFarmerEarnings()` | [`farmerRoutes.ts:L444`](file:///d:/Projects/Farmer_selling_app/server/src/routes/farmerRoutes.ts#L444) | Reads `FarmerPayout` |

---

## 3. Buyer APIs (`/api/buyers`)

*All buyer endpoints require `authenticateToken`.*

| Endpoint | Method | Auth | Frontend Caller | Backend Handler | Services & Tables |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/buyers/dashboard` | `GET` | JWT | `api.getBuyerDashboard()` | [`buyerRoutes.ts:L20`](file:///d:/Projects/Farmer_selling_app/server/src/routes/buyerRoutes.ts#L20) | Reads `BuyerDemand`, `Order` |
| `/api/buyers/marketplace` | `GET` | JWT | `api.getMarketplaceProduce(filters)` | [`buyerRoutes.ts:L75`](file:///d:/Projects/Farmer_selling_app/server/src/routes/buyerRoutes.ts#L75) | Invokes `evaluateAllActiveBatches()`, `calculateDistance()`, `calculateFreshness()` |
| `/api/buyers/demands` | `POST` | JWT | `api.postBuyerDemand(data)` | [`buyerRoutes.ts:L140`](file:///d:/Projects/Farmer_selling_app/server/src/routes/buyerRoutes.ts#L140) | Creates `BuyerDemand` |
| `/api/buyers/demands` | `GET` | JWT | `api.getBuyerDemands()` | [`buyerRoutes.ts:L199`](file:///d:/Projects/Farmer_selling_app/server/src/routes/buyerRoutes.ts#L199) | Reads `BuyerDemand` |
| `/api/buyers/demands/:id/matches` | `GET` | JWT | `api.getDemandMatches(id)` | [`buyerRoutes.ts:L224`](file:///d:/Projects/Farmer_selling_app/server/src/routes/buyerRoutes.ts#L224) | Invokes `MatchingService.findMatchesForDemand(id)` |
| `/api/buyers/demands/:id/offers` | `POST` | JWT | `api.sendBuyerOffer(id, data)` | [`buyerRoutes.ts:L235`](file:///d:/Projects/Farmer_selling_app/server/src/routes/buyerRoutes.ts#L235) | Creates `Offer`, `OfferHistory`, notifies Farmer |
| `/api/buyers/demands/:id/collective-order` | `POST` | JWT | `api.createCollectiveOrder(id, payload)` | [`buyerRoutes.ts:L299`](file:///d:/Projects/Farmer_selling_app/server/src/routes/buyerRoutes.ts#L299) | Invokes `CollectiveSellingService.createCollectiveOrder` |
| `/api/buyers/orders` | `GET` | JWT | `api.getBuyerOrders()` | [`buyerRoutes.ts:L333`](file:///d:/Projects/Farmer_selling_app/server/src/routes/buyerRoutes.ts#L333) | Reads `Order`, `OrderItem`, `Delivery`, `Payment`, `QualityCheck` |
| `/api/buyers/cart` | `GET` | JWT | `api.getCart()` | [`buyerRoutes.ts:L369`](file:///d:/Projects/Farmer_selling_app/server/src/routes/buyerRoutes.ts#L369) | Reads/creates `Cart`, `CartItem`, calls `calculateFreshness()` |
| `/api/buyers/cart/items` | `POST` | JWT | `api.addToCart(batchId, qty)` | [`buyerRoutes.ts:L442`](file:///d:/Projects/Farmer_selling_app/server/src/routes/buyerRoutes.ts#L442) | Creates/updates `CartItem` |
| `/api/buyers/cart/items/:id` | `PATCH` | JWT | `api.updateCartItem(id, qty)` | [`buyerRoutes.ts:L517`](file:///d:/Projects/Farmer_selling_app/server/src/routes/buyerRoutes.ts#L517) | Updates `CartItem.quantity` |
| `/api/buyers/cart/items/:id` | `DELETE` | JWT | `api.removeFromCart(id)` | [`buyerRoutes.ts:L556`](file:///d:/Projects/Farmer_selling_app/server/src/routes/buyerRoutes.ts#L556) | Deletes `CartItem` |
| `/api/buyers/cart` | `DELETE` | JWT | `api.clearCart()` | [`buyerRoutes.ts:L567`](file:///d:/Projects/Farmer_selling_app/server/src/routes/buyerRoutes.ts#L567) | Deletes all `CartItem` records for user |
| `/api/buyers/checkout` | `POST` | JWT | `api.checkout(data)` | [`buyerRoutes.ts:L581`](file:///d:/Projects/Farmer_selling_app/server/src/routes/buyerRoutes.ts#L581) | Direct checkout transaction: decrements `ProduceBatch`, creates `Order`, `OrderItem`, `Payment`, `Delivery` |

---

## 4. Orders, Logistics & Quality Inspection APIs

| Endpoint | Method | Auth | Frontend Caller | Backend Handler | Services & Tables |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/orders/:id` | `GET` | JWT | `api.getOrder(id)` | [`orderRoutes.ts:L11`](file:///d:/Projects/Farmer_selling_app/server/src/routes/orderRoutes.ts#L11) | Reads complete relational `Order` graph |
| `/api/orders/:id/status` | `PATCH` | JWT | `api.updateOrderStatus(id, st)` | [`orderRoutes.ts:L55`](file:///d:/Projects/Farmer_selling_app/server/src/routes/orderRoutes.ts#L55) | Invokes `OrderStateMachine.transitionOrder` |
| `/api/orders/:id/dispute` | `POST` | JWT | `api.raiseDispute(id, reason)` | [`orderRoutes.ts:L82`](file:///d:/Projects/Farmer_selling_app/server/src/routes/orderRoutes.ts#L82) | Creates `Dispute` record with status `OPEN` |
| `/api/logistics/pickups` | `GET` | JWT | `api.getPickups()` | [`logisticsRoutes.ts:L11`](file:///d:/Projects/Farmer_selling_app/server/src/routes/logisticsRoutes.ts#L11) | Reads `PickupRequest` |
| `/api/logistics/pickups` | `POST` | JWT | `api.schedulePickup(data)` | [`logisticsRoutes.ts:L34`](file:///d:/Projects/Farmer_selling_app/server/src/routes/logisticsRoutes.ts#L34) | Creates `PickupRequest`, triggers `PICKUP_SCHEDULED` |
| `/api/logistics/pickups/:id` | `PATCH` | JWT | `api.updatePickup(id, data)` | [`logisticsRoutes.ts:L64`](file:///d:/Projects/Farmer_selling_app/server/src/routes/logisticsRoutes.ts#L64) | Updates `PickupRequest`, triggers `COLLECTED` |
| `/api/logistics/deliveries` | `GET` | JWT | `api.getDeliveries()` | [`logisticsRoutes.ts:L89`](file:///d:/Projects/Farmer_selling_app/server/src/routes/logisticsRoutes.ts#L89) | Reads `Delivery` |
| `/api/logistics/deliveries/:id/status` | `PATCH` | JWT | `api.updateDeliveryStatus(id, st)` | [`logisticsRoutes.ts:L111`](file:///d:/Projects/Farmer_selling_app/server/src/routes/logisticsRoutes.ts#L111) | Updates `Delivery`, triggers `DISPATCHED` or `DELIVERED` |
| `/api/logistics/vehicles` | `GET` | JWT | `api.getVehicles()` | [`logisticsRoutes.ts:L150`](file:///d:/Projects/Farmer_selling_app/server/src/routes/logisticsRoutes.ts#L150) | Reads `Vehicle` |
| `/api/logistics/collection-centers` | `GET` | JWT | `api.getCollectionCenters()` | [`logisticsRoutes.ts:L160`](file:///d:/Projects/Farmer_selling_app/server/src/routes/logisticsRoutes.ts#L160) | Reads `CollectionCenter` |
| `/api/quality-checks` | `POST` | JWT | `api.submitQualityCheck(data)` | [`qualityRoutes.ts:L11`](file:///d:/Projects/Farmer_selling_app/server/src/routes/qualityRoutes.ts#L11) | Creates `QualityCheck`, triggers `QUALITY_CHECKED` |
| `/api/quality-checks/:id` | `GET` | JWT | `api.getQualityCheck(id)` | [`qualityRoutes.ts:L73`](file:///d:/Projects/Farmer_selling_app/server/src/routes/qualityRoutes.ts#L73) | Reads `QualityCheck` |

---

## 5. Payments, Ratings, Coordinator & Admin APIs

| Endpoint | Method | Auth | Frontend Caller | Backend Handler | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/payments/create` | `POST` | JWT | `api.authorizePayment()` | [`paymentRoutes.ts:L11`](file:///d:/Projects/Farmer_selling_app/server/src/routes/paymentRoutes.ts#L11) | Authorizes mock UPI payment in escrow |
| `/api/payments/release/:id` | `POST` | JWT | `api.releasePayment(id)` | [`paymentRoutes.ts:L27`](file:///d:/Projects/Farmer_selling_app/server/src/routes/paymentRoutes.ts#L27) | Disburses payouts to farmers |
| `/api/payments/:id` | `GET` | JWT | `api.getPayment(id)` | [`paymentRoutes.ts:L38`](file:///d:/Projects/Farmer_selling_app/server/src/routes/paymentRoutes.ts#L38) | Retrieves payment details and payouts |
| `/api/ratings` | `POST` | JWT | `api.submitRating(data)` | [`ratingRoutes.ts:L10`](file:///d:/Projects/Farmer_selling_app/server/src/routes/ratingRoutes.ts#L10) | Submits 1-5 review and updates farmer avg |
| `/api/ratings/:userId` | `GET` | JWT | `api.getUserRatings(id)` | [`ratingRoutes.ts:L52`](file:///d:/Projects/Farmer_selling_app/server/src/routes/ratingRoutes.ts#L52) | Gets reviews received by a user |
| `/api/coordinator/farmers` | `GET` | JWT | `api.getCoordinatorFarmers()` | [`coordinatorRoutes.ts:L12`](file:///d:/Projects/Farmer_selling_app/server/src/routes/coordinatorRoutes.ts#L12) | Lists village farmers managed by coordinator |
| `/api/coordinator/register-farmer` | `POST` | JWT | `api.coordinatorRegisterFarmer(d)` | [`coordinatorRoutes.ts:L32`](file:///d:/Projects/Farmer_selling_app/server/src/routes/coordinatorRoutes.ts#L32) | Assisted registration of farmer |
| `/api/coordinator/create-batch` | `POST` | JWT | `api.coordinatorCreateBatch(d)` | [`coordinatorRoutes.ts:L92`](file:///d:/Projects/Farmer_selling_app/server/src/routes/coordinatorRoutes.ts#L92) | Creates produce batch on behalf of farmer |
| `/api/admin/dashboard` | `GET` | JWT | `api.getAdminDashboard()` | [`adminRoutes.ts:L10`](file:///d:/Projects/Farmer_selling_app/server/src/routes/adminRoutes.ts#L10) | Overview counts, financial volume, impact |
| `/api/admin/farmers` | `GET` | JWT | `api.getAdminFarmers()` | [`adminRoutes.ts:L64`](file:///d:/Projects/Farmer_selling_app/server/src/routes/adminRoutes.ts#L64) | Lists all farmers |
| `/api/admin/buyers` | `GET` | JWT | `api.getAdminBuyers()` | [`adminRoutes.ts:L80`](file:///d:/Projects/Farmer_selling_app/server/src/routes/adminRoutes.ts#L80) | Lists all commercial buyers |
| `/api/admin/listings` | `GET` | JWT | `api.getAdminListings()` | [`adminRoutes.ts:L96`](file:///d:/Projects/Farmer_selling_app/server/src/routes/adminRoutes.ts#L96) | Lists all produce batches |
| `/api/admin/orders` | `GET` | JWT | `api.getAdminOrders()` | [`adminRoutes.ts:L112`](file:///d:/Projects/Farmer_selling_app/server/src/routes/adminRoutes.ts#L112) | Lists all orders |
| `/api/admin/disputes` | `GET` | JWT | `api.getAdminDisputes()` | [`adminRoutes.ts:L130`](file:///d:/Projects/Farmer_selling_app/server/src/routes/adminRoutes.ts#L130) | Lists all open & resolved disputes |
| `/api/admin/disputes/:id` | `PATCH` | JWT | `api.resolveDispute(id, st, notes)` | [`adminRoutes.ts:L146`](file:///d:/Projects/Farmer_selling_app/server/src/routes/adminRoutes.ts#L146) | Resolves dispute with resolution notes |
| `/api/admin/users/:id/status` | `PATCH` | JWT | `api.updateUserStatus(id, st)` | [`adminRoutes.ts:L166`](file:///d:/Projects/Farmer_selling_app/server/src/routes/adminRoutes.ts#L166) | Suspends or activates user account |

---

## 6. Daily Mandi Prices, Uploads & Demo Simulation APIs

| Endpoint | Method | Auth | Frontend Caller | Backend Handler | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/market-prices/daily` | `GET` | None | `api.getDailyMarketPrices(params)` | [`marketPriceRoutes.ts:L10`](file:///d:/Projects/Farmer_selling_app/server/src/routes/marketPriceRoutes.ts#L10) | Live APMC rates for 25+ crops |
| `/api/market-prices/ticker` | `GET` | None | `api.getMarketTicker(district)` | [`marketPriceRoutes.ts:L50`](file:///d:/Projects/Farmer_selling_app/server/src/routes/marketPriceRoutes.ts#L50) | Top 10 vegetable ticker rates |
| `/api/market-prices/mandis` | `GET` | None | `api.getAvailableMandis()` | [`marketPriceRoutes.ts:L65`](file:///d:/Projects/Farmer_selling_app/server/src/routes/marketPriceRoutes.ts#L65) | List of 13 regulated mandis |
| `/api/upload` | `POST` | None | `api.uploadImage(base64, name)` | [`uploadRoutes.ts:L14`](file:///d:/Projects/Farmer_selling_app/server/src/routes/uploadRoutes.ts#L14) | Base64 produce photo upload to `/uploads/` |
| `/api/demo/simulate-urgency` | `POST` | None | `api.simulateUrgency(batchId)` | [`demoRoutes.ts:L9`](file:///d:/Projects/Farmer_selling_app/server/src/routes/demoRoutes.ts#L9) | Sets batch sellBy to 45 mins & alerts buyers |
| `/api/demo/simulate-expiry` | `POST` | None | `api.simulateExpiry(batchId)` | [`demoRoutes.ts:L64`](file:///d:/Projects/Farmer_selling_app/server/src/routes/demoRoutes.ts#L64) | Marks batch EXPIRED and deactivates |
| `/api/health` | `GET` | None | Direct curl / monitoring | [`index.ts:L50`](file:///d:/Projects/Farmer_selling_app/server/src/index.ts#L50) | Returns `{ status: 'online', problemStatementId: 'SIH26033' }` |
