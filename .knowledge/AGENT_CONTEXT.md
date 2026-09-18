# 🤖 KisanDirect AI Agent Operational Context

> **Mandatory Operating Protocol for Future AI Coding Assistants**  
> **Repository**: `Farmer_selling_app` (KisanDirect Agricultural Marketplace)  
> **Problem Statement ID**: `SIH26033` (Smart India Hackathon 2026)

---

## 🛑 Fundamental Directives

### 1. DO NOT Rescan the Entire Repository
The repository has already undergone comprehensive discovery and indexing. Analyzing every file repeatedly wastes tokens, causes hallucination, and ignores established architectural decisions.

### 2. FIRST Inspect the Knowledge Graph
Before reading or editing source code, inspect:
- [`.knowledge/index.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/index.md) (Quick lookup & map)
- [`.knowledge/features.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/features.md) (Feature-to-code mapping)
- [`.knowledge/workflows.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/workflows.md) (End-to-end data flows)
- [`.knowledge/dependencies.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/dependencies.md) (Dependency & impact chains)

### 3. Use the CLI Query Utility
To find specific files, functions, tables, or API endpoints:
```bash
# Query by question
node .knowledge/scripts/query.js --ask "where is login implemented"
node .knowledge/scripts/query.js --ask "how does collective selling work"

# Query by entity ID
node .knowledge/scripts/query.js --info "table:ProduceBatch"
node .knowledge/scripts/query.js --info "function:CollectiveSellingService.createCollectiveOrder"

# Impact analysis before making an edit
node .knowledge/scripts/query.js --impact "table:Order"
node .knowledge/scripts/query.js --impact "file:server/src/services/orderStateMachine.ts"

# Search by keyword
node .knowledge/scripts/query.js --search "escrow"
```

### 4. Read Only Relevant Source Files
Once the query tool identifies the affected files, read **only** those specific files. Do not browse unrelated directories.

### 5. Source Code Is Always Higher Authority
The Knowledge Graph serves as an index and navigational context layer. The actual source code files on disk remain the ultimate source of truth. Always verify parameters, function signatures, and types against the active code before committing changes.

### 6. Preserve Core Architecture & Conventions
- **Bilingual Requirement**: Every user-facing UI change must provide both English and Tamil text.
- **State Navigation**: Do not introduce `react-router`. Preserve the `onNavigate(view, params)` state-based navigation pattern in [`client/src/App.tsx`](file:///d:/Projects/Farmer_selling_app/client/src/App.tsx).
- **Order State Transitions**: Any change to order statuses must comply with [`OrderStateMachine.ts`](file:///d:/Projects/Farmer_selling_app/server/src/services/orderStateMachine.ts).
- **Atomic Operations**: Always wrap multi-table database mutations in `prisma.$transaction`.
- **Component Reuse**: Reuse `FreshnessBadge`, `FairPriceGauge`, `DeliveryMap`, and `VoiceListingModal` instead of creating duplicate UI elements.

### 7. Run Verification Checks After Coding
After modifying any code:
1. Validate TypeScript compilation:
   ```bash
   npm run build:server
   npm run build:client
   ```
2. Check for Knowledge Graph drift:
   ```bash
   node .knowledge/scripts/update-graph.js --check
   ```
3. Validate graph referential integrity:
   ```bash
   node .knowledge/scripts/validate-graph.js
   ```

### 8. Update the Knowledge Graph After Adding or Renaming Entities
If you add a new file, route, model, or component:
- Run:
  ```bash
  node .knowledge/scripts/update-graph.js --add-file "server/src/routes/newRoute.ts"
  node .knowledge/scripts/update-graph.js --link --from "module:server-routes" --type "contains" --to "file:server/src/routes/newRoute.ts"
  ```
- Or update [`build-graph.js`](file:///d:/Projects/Farmer_selling_app/.knowledge/scripts/build-graph.js) and re-run:
  ```bash
  node .knowledge/scripts/build-graph.js
  node .knowledge/scripts/validate-graph.js
  ```
