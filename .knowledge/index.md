# 🌾 KisanDirect Project Knowledge Graph Index

> **Master Navigation & Context Layer for AI Coding Agents and Developers**  
> **Repository**: `Farmer_selling_app` (KisanDirect Agricultural Marketplace)  
> **Problem Statement**: SIH 2026 Problem Statement ID **`SIH26033`** (*"Multiple intermediaries reduce farmers earnings and increase consumer prices."*)  
> **Corridor**: Salem District Agricultural Corridor, Tamil Nadu, India  
> **Central Graph File**: [`.knowledge/knowledge-graph.json`](file:///d:/Projects/Farmer_selling_app/.knowledge/knowledge-graph.json)

---

## ⚡ Quick Start for AI Coding Agents

When tasked with fixing, implementing, or analyzing any feature in KisanDirect:

1. **DO NOT rescan the entire repository.**
2. Use this `.knowledge/` directory and query utility to retrieve the exact nodes, files, APIs, services, and tables involved.
3. Run the fast query tool:
   ```bash
   node .knowledge/scripts/query.js --ask "<your question>"
   node .knowledge/scripts/query.js --info "<node_id>"
   node .knowledge/scripts/query.js --impact "<node_id>"
   node .knowledge/scripts/query.js --feature "<feature_id>"
   ```
4. Read **only** the specific source files identified by the query tool.
5. Review the project rules in [`KNOWLEDGE_GRAPH_RULES.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/KNOWLEDGE_GRAPH_RULES.md) before making modifications.
6. After making code changes, run:
   ```bash
   node .knowledge/scripts/update-graph.js --check
   node .knowledge/scripts/validate-graph.js
   ```

---

## 📚 Knowledge Base Documentation Directory

| Document | Purpose & Contents | Primary Consumers |
| :--- | :--- | :--- |
| **[`index.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/index.md)** | Master entry point, quick reference, and knowledge map | All AI agents, engineers |
| **[`architecture.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/architecture.md)** | High-level system architecture, client/server boundaries, security, and data flow diagrams | Architects, AI planning mode |
| **[`modules.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/modules.md)** | Module-level catalog of client and server packages, duties, and file manifests | Feature engineers |
| **[`features.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/features.md)** | Feature-to-code mapping: UI -> Components -> Hooks -> API -> Service -> Database | Feature developers |
| **[`workflows.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/workflows.md)** | Step-by-step traces of 7 core end-to-end user actions and transactions | Workflow debuggers |
| **[`database.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/database.md)** | Database technology, 28 Prisma models, schema relationships, and business rules | Data engineers, backend agents |
| **[`api.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/api.md)** | Complete catalog of 40+ REST API endpoints, auth requirements, payloads, and handlers | API & Frontend integration |
| **[`dependencies.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/dependencies.md)** | Cross-module dependency graph, directional edges, and impact chains | Refactoring & impact analysis |
| **[`configuration.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/configuration.md)** | Environment variables, ports, credentials inventory (zero secrets exposed), and build configs | DevOps, local environment setup |
| **[`decisions.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/decisions.md)** | Key architectural decision records (ADRs) explaining "why" choices were made | Technical designers |
| **[`conventions.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/conventions.md)** | Code conventions, naming patterns, bilingual UI rules, and styling tokens | Implementation agents |
| **[`AGENT_CONTEXT.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/AGENT_CONTEXT.md)** | Operational guidelines for AI agents: workflow, query steps, test expectations | LLM system prompts |
| **[`KNOWLEDGE_GRAPH_RULES.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/KNOWLEDGE_GRAPH_RULES.md)** | Mandatory project constraints: what not to break, what to preserve | Agent guardrails |
| **[`GRAPH_VALIDATION.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/GRAPH_VALIDATION.md)** | Verification report, statistics, graph integrity check, and zero-drift confirmation | Quality assurance |

---

## 🔍 Instant Lookup Cheat Sheet

### Common Architectural Questions

#### 1. Where is Authentication implemented?
- **Backend Handler**: [`server/src/routes/authRoutes.ts:L126-L187`](file:///d:/Projects/Farmer_selling_app/server/src/routes/authRoutes.ts#L126-L187)
- **Token Auth Guard**: [`server/src/middleware/auth.ts:L16-L49`](file:///d:/Projects/Farmer_selling_app/server/src/middleware/auth.ts#L16-L49)
- **Client Session**: [`client/src/context/AuthContext.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/context/AuthContext.tsx)
- **Tables Involved**: `User`, `FarmerProfile`, `BuyerProfile`, `CoordinatorProfile`

#### 2. Where is Reverse-Demand Collective Supply Pooling (கூட்டு விற்பனை)?
- **Algorithm Engine**: [`server/src/services/collectiveSellingService.ts:L19-L152`](file:///d:/Projects/Farmer_selling_app/server/src/services/collectiveSellingService.ts#L19-L152)
- **Matching Calculator**: [`server/src/services/matchingService.ts:L165-L308`](file:///d:/Projects/Farmer_selling_app/server/src/services/matchingService.ts#L165-L308)
- **API Endpoint**: `POST /api/buyers/demands/:id/collective-order`
- **UI Screen**: [`client/src/features/buyer/SmartMatches.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/buyer/SmartMatches.tsx)
- **Tables Involved**: `BuyerDemand`, `CollectiveOrder`, `CollectiveOrderMember`, `Order`, `OrderItem`, `ProduceBatch`, `Payment`

#### 3. Where is the Perishable Freshness Decay Engine?
- **Calculation Engine**: [`server/src/services/freshnessService.ts:L18-L88`](file:///d:/Projects/Farmer_selling_app/server/src/services/freshnessService.ts#L18-L88)
- **Batch Scanner**: [`server/src/services/freshnessService.ts:L93-L134`](file:///d:/Projects/Farmer_selling_app/server/src/services/freshnessService.ts#L93-L134)
- **UI Visual Badge**: [`client/src/components/common/FreshnessBadge.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/components/common/FreshnessBadge.tsx)
- **Demo Decay Simulation**: [`server/src/routes/demoRoutes.ts:L9-L60`](file:///d:/Projects/Farmer_selling_app/server/src/routes/demoRoutes.ts#L9-L60)

#### 4. Where is Direct Cart & Single-Click Checkout (Mode 1)?
- **Frontend Drawer**: [`client/src/features/buyer/CartDrawer.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/buyer/CartDrawer.tsx)
- **Checkout Modal**: [`client/src/features/buyer/CheckoutModal.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/buyer/CheckoutModal.tsx)
- **Cart Context**: [`client/src/context/CartContext.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/context/CartContext.tsx)
- **Backend Checkout Handler**: [`server/src/routes/buyerRoutes.ts:L581-L776`](file:///d:/Projects/Farmer_selling_app/server/src/routes/buyerRoutes.ts#L581-L776)

#### 5. Where is the 10-Stage Order Lifecycle State Machine?
- **State Transition Engine**: [`server/src/services/orderStateMachine.ts:L40-L153`](file:///d:/Projects/Farmer_selling_app/server/src/services/orderStateMachine.ts#L40-L153)
- **API Endpoint**: `PATCH /api/orders/:id/status`
- **Frontend Tracking View**: [`client/src/features/buyer/BuyerOrders.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/features/buyer/BuyerOrders.tsx)
- **Logistics Integration**: [`server/src/routes/logisticsRoutes.ts`](file:///d:/Projects/Farmer_selling_app/server/src/routes/logisticsRoutes.ts)

#### 6. Where is Bilingual Tamil/English Localization?
- **Language Provider & Vocabulary**: [`client/src/context/LanguageContext.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/context/LanguageContext.tsx)
- **Language Switcher UI**: Embedded in [`client/src/components/common/Navbar.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/components/common/Navbar.tsx)
- **Voice Listing Simulator**: [`client/src/components/common/VoiceListingModal.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/components/common/VoiceListingModal.tsx)

---

## 🛠️ Graph Management Scripts

All tools live in [`.knowledge/scripts/`](file:///d:/Projects/Farmer_selling_app/.knowledge/scripts/):

```bash
# 1. Interactive Graph Queries
node .knowledge/scripts/query.js --ask "where is login"
node .knowledge/scripts/query.js --info "table:ProduceBatch"
node .knowledge/scripts/query.js --impact "table:Order"
node .knowledge/scripts/query.js --type api_endpoint

# 2. Referential Integrity Validation
node .knowledge/scripts/validate-graph.js

# 3. Incremental Drift Check & Updates
node .knowledge/scripts/update-graph.js --check
node .knowledge/scripts/update-graph.js --add-file "path/to/file.ts"
node .knowledge/scripts/update-graph.js --link --from "nodeA" --type "contains" --to "nodeB"

# 4. Rebuild Entire Graph
node .knowledge/scripts/build-graph.js
```
