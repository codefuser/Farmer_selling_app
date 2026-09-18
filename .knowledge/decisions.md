# 🏛️ KisanDirect Architectural Decision Records (ADRs)

> **Repository**: `Farmer_selling_app`  
> Captures key technical, design, and structural decisions made in the codebase, along with context, alternatives considered, and consequences.

---

## ADR-001: State-Based View Router vs. BrowserRouter

### Context
KisanDirect was engineered for the Smart India Hackathon 2026 (SIH 2026) evaluation panel. The demo requires evaluators to instantly switch between 5 distinct personas (`FARMER`, `BUYER`, `COORDINATOR`, `LOGISTICS`, `ADMIN`) and trigger live scenarios without browser page refreshes, URL synchronization glitches, or server-side fallback routing configuration.

### Decision
Use a state-driven view routing architecture managed inside [`client/src/App.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/App.tsx) via `currentView` and `viewParams`, passed down via `onNavigate(view, params)` callback prop.

### Consequences
- **Positive**: Instantaneous view transitions; zero broken-route errors on static hosting; seamless persona switching with zero flash of unauthenticated content.
- **Trade-off**: Browser back/forward history buttons do not change internal app state by default. Deep linking requires passing query params or state flags.

---

## ADR-002: Dual Purchase Architecture (Mode 1 Cart vs. Mode 2 Reverse Demand)

### Context
Direct agricultural marketplaces often fail by choosing either a retail consumer checkout model OR an enterprise procurement model:
- Retail cart fails commercial buyers who need 500–2000 kg from multiple farms.
- Pure B2B reverse auction fails small buyers, kitchens, and individual farmers who just want to sell 10–20 kg immediately.

### Decision
Implement two coexisting purchase modes:
1. **Mode 1 (Direct Cart & Checkout)**: Standard shopping cart for quantities under 100 kg. Immediate stock deduction and escrow lock.
2. **Mode 2 (Reverse Demand & Collective Supply Pooling)**: Commercial bulk procurement where buyers post demands and the algorithm aggregates multiple smallholder farmers into a single consolidated pool.

### Consequences
- **Positive**: Solves both immediate retail demand and institutional wholesale procurement on the same platform.
- **Trade-off**: Requires distinct UI entry points (`CartDrawer` vs `PostDemand`/`SmartMatches`) and dual database tracking paths.

---

## ADR-003: 10-Stage Escrow Order Lifecycle State Machine

### Context
Middlemen persist in agricultural supply chains primarily because they absorb counterparty trust risks: farmers fear not getting paid by unknown commercial buyers, and buyers fear substandard or rotting produce.

### Decision
Encapsulate all order transitions in [`server/src/services/orderStateMachine.ts`](file:///d:/Projects/Farmer_selling_app/server/src/services/orderStateMachine.ts) with 10 strictly sequential stages:
`ORDERED` → `ACCEPTED` → `PICKUP_SCHEDULED` → `COLLECTED` → `QUALITY_CHECKED` → `PACKED` → `DISPATCHED` → `DELIVERED` → `PAYMENT_RELEASED` → `COMPLETED`

Payment is held in escrow upon order placement (`AUTHORIZED`). Payouts to farmers are released automatically only after verified delivery (`DELIVERED`).

### Consequences
- **Positive**: Complete trust elimination; automated audit trail; prevents farmers from being cheated or buyers from receiving unverified goods.
- **Trade-off**: Requires strict transition validation; orders cannot skip stages without logistics or hub quality inspection checkpoints.

---

## ADR-004: Native Bilingual Localization (English & Tamil)

### Context
The target corridor is Salem District, Tamil Nadu. Smallholder farmers operate in Tamil, whereas commercial hotel managers, logistics leads, and hackathon judges operate in English.

### Decision
Build a lightweight, dependency-free React Context ([`LanguageContext.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/context/LanguageContext.tsx)) containing a complete vocabulary dictionary covering UI terms, agricultural crop names, statuses, and voice assistant prompts.

### Consequences
- **Positive**: Zero external i18n bundle overhead; instant synchronous language switching across all screens without reloading.
- **Rule**: Every new button, label, or badge must support both English and Tamil.

---

## ADR-005: Deterministic Local APMC Mandi Calibration with Live Government API Fallback

### Context
Wholesale vegetable mandi prices fluctuate daily. Connecting exclusively to government APIs (`data.gov.in`) during live hackathon presentations introduces severe latency, API rate limits, or network failure risks.

### Decision
Implement a hybrid pricing engine in [`server/src/services/marketPriceService.ts`](file:///d:/Projects/Farmer_selling_app/server/src/services/marketPriceService.ts):
- Attempts live query to `api.data.gov.in` Agmarknet resource if `DATA_GOV_IN_API_KEY` is present.
- If absent, slow, or rate-limited, falls back to a deterministic APMC price generation algorithm based on daily date seeds and mandi location premiums.

### Consequences
- **Positive**: 100% reliable uptime during presentations and offline development; realistic, coherent daily market trends.
- **Trade-off**: Requires periodic calibration of base commodity prices to match real-world inflation.

---

## ADR-006: In-Memory & Base64 Local Image Storage

### Context
Uploading produce photos is necessary for quality assessment and voice listings. Relying on external AWS S3 or Cloudinary accounts causes demo failures if credentials expire or bandwidth limits are reached.

### Decision
Store uploaded produce photos locally in `server/uploads/` using Base64 decoding in [`server/src/routes/uploadRoutes.ts`](file:///d:/Projects/Farmer_selling_app/server/src/routes/uploadRoutes.ts), served statically via `express.static('/uploads')`.

### Consequences
- **Positive**: Zero external cloud storage dependencies; instant local file serving; runs 100% offline.
- **Constraint**: Production deployments with ephemeral container filesystems (e.g. Heroku/Vercel serverless) should configure persistent Supabase Storage buckets.
