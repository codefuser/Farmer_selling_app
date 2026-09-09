# KisanDirect (Harvester to Buyer) · SIH 2026

> **Smart India Hackathon 2026 Project Prototype**  
> **Problem Statement ID**: `SIH26033`  
> **Exact Problem Title**: *"Multiple intermediaries reduce farmers earnings and increase consumer prices."*  
> **Category**: Agriculture, Foodtech & Rural Development  
> **Working Product Name**: **KisanDirect**  
> **Concept**: Community-Powered Direct Agricultural Marketplace  

---

## 🌾 The Problem

In traditional Indian agricultural supply chains (APMC Mandis and private market yards), smallholder farmers depend on a series of commission agents, brokers, wholesalers, and secondary handlers:
$$\text{Farmer} \longrightarrow \text{Village Broker} \longrightarrow \text{APMC Mandi Commission Agent} \longrightarrow \text{Regional Wholesaler} \longrightarrow \text{Sub-Dealer} \longrightarrow \text{Retailer} \longrightarrow \text{Consumer}$$

### Structural Defects of the Traditional Mandi:
1. **Severe Price Realization Collapse**: Farmers receive only **28% to 42%** of the end consumer price, while consumers and commercial kitchens pay inflated rates.
2. **Smallholder Isolation**: An individual farmer with 100 kg cannot supply a hotel or supermarket chain needing 500 kg, forcing distress sales to local village brokers.
3. **Severe Perishable Spoilage**: Harvested produce sits in crates for 36–72 hours across multiple mandi transit points, resulting in **25%–35% food waste**.
4. **Opacities & Delayed Settlements**: Informal paper chits, unauthorized sorting weight deductions, and delayed payouts (15 to 45 days).

---

## 🚀 The KisanDirect Solution

KisanDirect inverts the traditional model through a **reverse-demand, collective-supply agricultural marketplace**:

$$\text{Buyer Demand} \longrightarrow \text{Smart Matching Engine} \longrightarrow \text{Collective Supply Pooling} \longrightarrow \text{Fair Price Transparency} \longrightarrow \text{Quality Check} \longrightarrow \text{Logistics} \longrightarrow \text{Escrow Direct Payout} \longrightarrow \text{Mutual Rating}$$

### Key Architectural Pillars:
- ❌ **NOT "Lowest Price Always Wins"**: Evaluates suitability holistically across **Distance + Price + Quality Grade + Freshness Status + Farmer Rating + Volume**.
- 🤝 **Collective Selling (கூட்டு விற்பனை)**: Aggregates multiple small farmers (e.g. 100kg + 150kg + 100kg + 150kg) to fulfill bulk commercial orders (e.g. 500kg for hotels) without overselling.
- ⏱️ **Freshness Engine**: Hourly perishable countdown (`FRESH` $\rightarrow$ `AGING` $\rightarrow$ `URGENT SALE` $\rightarrow$ `EXPIRED`) with automatic hotel alerts and automated expiry protection.
- 🎙️ **Digital Inclusion & Voice Listing**: Low digital literacy farmers are supported by Village Coordinators and bilingual **Tamil & English** simulated voice listing assistants.
- 🔒 **Direct Escrow Payouts**: Buyer payments are held in escrow and automatically split into direct bank payouts for participating farmers upon verified delivery.

---

## 👥 Demo Accounts for Evaluators

The application includes a persistent **Demo Persona Switcher Bar** at the top for 1-click evaluation:

| Role | Demo Persona | Email | Password | Pre-seeded Highlights |
| :--- | :--- | :--- | :--- | :--- |
| **Farmer** | Kumar Govindasamy | `farmer@kisandirect.demo` | `Demo@123` | Salem Grade A Tomatoes, Tamil/English UI, active batches |
| **Buyer** | ABC Grand Heritage Hotel | `buyer@kisandirect.demo` | `Demo@123` | Active 500kg bulk demand, collective supply matches |
| **Village Coordinator** | Selvam Murugesan | `coordinator@kisandirect.demo` | `Demo@123` | Assisted farmer registration & voice listing on behalf |
| **Logistics Operator** | Ravi Kumar (Fleet) | `logistics@kisandirect.demo` | `Demo@123` | Pickup scheduling, GPS route simulation, quality check |
| **Platform Admin** | Lakshmi Narayanan | `admin@kisandirect.demo` | `Demo@123` | Dispute resolution, impact telemetry, user moderation |

---

## ⚡ Live Demo Scenarios for Judges

### Scenario 1: Hotel Needs 500kg Tomatoes (Bulk Demand & Collective Supply)
1. In the top demo bar, click **"Scenario 1: 500kg Bulk Pool"** (or switch to **Buyer ABC Hotel**).
2. Open **"Smart Matches"** on the 500kg Tomato demand.
3. Observe that the **Smart Matching Engine** recommends 4 nearby farmers:
   - **Farmer Kumar**: 100 kg at ₹22/kg (5 km, Grade A)
   - **Farmer Murugan**: 150 kg at ₹23/kg (8 km, Grade A)
   - **Farmer Priya**: 100 kg at ₹21/kg (12 km, Grade B)
   - **Farmer Ravi**: 150 kg at ₹22/kg (10 km, Grade A)
   - **Combined**: 500 kg (100% fulfilled) with an explainable **94% Suitability Score**.
4. Click **"Establish Collective Order"** $\rightarrow$ Escrow payment is authorized $\rightarrow$ View Order Tracking.
5. In the Order Tracking screen, click **"Advance to Next Stage"** to test the 10-stage state machine (`ORDERED` $\rightarrow$ `ACCEPTED` $\rightarrow$ `COLLECTED` $\rightarrow$ `QUALITY_CHECKED` $\rightarrow$ `DISPATCHED` $\rightarrow$ `DELIVERED` $\rightarrow$ `PAYMENT_RELEASED` $\rightarrow$ `COMPLETED`).
6. Submit a mutual 5-star verified review upon completion.

### Scenario 2: Perishable Freshness & Urgent Sale Decay
1. Click **"Scenario 2: Urgent Sale"** in the top demo bar.
2. The server artificially advances harvest age on active batches to under 60 minutes remaining:
   - Status transitions from `FRESH` $\rightarrow$ `AGING` $\rightarrow$ `URGENT SALE` 🔥.
   - Recommended 15% discount is applied.
   - Urgent notifications are dispatched to nearby B2B hotels.
3. Switch to **Farmer Kumar** or **Marketplace** to observe the animated glowing urgent badge and countdown timer.

### Scenario 3: Village Coordinator Assisted Voice Listing
1. Click **"Scenario 3: Voice Listing"** in the top demo bar.
2. Switch to **Coordinator Selvam** and click **"Create Voice Listing on Behalf"**.
3. Tap the pulsing microphone or click **"Simulate Complete Voice Dialogue"**:
   - Converses in bilingual Tamil & English:
     *"வணக்கம்! என்ன விளைபொருள் விற்க விரும்புகிறீர்கள்?"* $\rightarrow$ *"100 கிலோ தக்காளி, கிலோ ₹22, தலைவாசல்."*
   - Auto-extracts details into the listing review card.
4. Click **"Publish Batch"** $\rightarrow$ Batch `TOM-2026-XXXXX` is instantly live on the marketplace.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: SQLite by default for zero-config portability (`prisma/dev.db`), PostgreSQL turnkey-ready
- **Security**: JWT tokens, bcrypt password hashing, role-based access control (RBAC), SQL injection prevention via ORM
- **Localization**: English + தமிழ் (Tamil) dual-language engine

---

## 📁 Repository Structure

```
Farmer_selling_app/
├── client/                     # Vite + React 18 + TypeScript Frontend
│   ├── src/
│   │   ├── components/common/  # Navbar, MobileBottomNav, DemoScenarioBar, VoiceListingModal, DeliveryMap, FairPriceGauge
│   │   ├── context/            # AuthContext (sessions & persona switcher), LanguageContext (EN/TA)
│   │   ├── features/
│   │   │   ├── public/         # Landing, HowItWorks, ForFarmers, ForBuyers, Impact, Login, Register
│   │   │   ├── farmer/         # FarmerDashboard, MyProduce, AddProduce, FarmerOffers, Collective, Earnings
│   │   │   ├── buyer/          # BuyerDashboard, Marketplace, PostDemand, SmartMatches, Orders
│   │   │   ├── coordinator/    # CoordinatorDashboard (Assisted registration & voice helper)
│   │   │   ├── logistics/      # LogisticsDashboard & Physical Quality Check screen
│   │   │   └── admin/          # AdminDashboard (Moderation, disputes, telemetry)
│   │   ├── services/api.ts     # Centralized REST client with JWT header injection
│   │   └── types/index.ts      # Domain interfaces
│   └── vite.config.ts          # Proxy configuration to backend (:5000)
│
├── server/                     # Node.js + Express + Prisma API Backend
│   ├── prisma/
│   │   ├── schema.prisma       # 25 relational models (users, batches, demands, offers, collective pools, orders, payments)
│   │   └── seed.ts             # Comprehensive seed: 20 farmers, 10 buyers, 3 coordinators, products, demo batches
│   └── src/
│       ├── config/             # Database client & environment variables
│       ├── middleware/         # JWT authentication & role-based access control
│       ├── services/           # Freshness engine, matching engine, collective selling, order state machine
│       ├── routes/             # REST APIs for all roles & demo scenarios
│       └── index.ts            # Server entry point
│
├── package.json                # Root workspaces configuration
└── .env.example                # Configuration template
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ and npm installed

### 1. Installation
```powershell
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### 2. Database Generation & Seed
```powershell
cd server
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
cd ..
```

### 3. Running Locally
In terminal 1 (Backend API on `http://localhost:5000`):
```powershell
cd server
npm run dev
```

In terminal 2 (Frontend Client on `http://localhost:5173`):
```powershell
cd client
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🛡️ License
Built with passion for the **Smart India Hackathon 2026** (Problem Statement ID: **SIH26033**). MIT License.
