# 📜 KisanDirect Knowledge Graph Rules

> **Project Rule File**: Mandatory instructions for all AI Agents and Human Developers  
> **Repository**: `Farmer_selling_app`

---

## Rule 1: Phase-Based Development Lifecycle

Every task modifying this codebase **must** follow this 3-stage protocol:

### Stage 1: BEFORE CODING
1. **Read Index**: Open [`.knowledge/index.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/index.md) to locate the relevant functional area.
2. **Identify Feature**: Identify which of the 8 core features in [`.knowledge/features.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/features.md) governs your task.
3. **Execute Impact Query**: Run impact analysis on target entities:
   ```bash
   node .knowledge/scripts/query.js --impact "<entity_id>"
   ```
4. **Targeted Inspection**: Read **only** the specific source files identified by the query.
5. **Verify Source Truth**: Cross-reference assumptions with the active code.

### Stage 2: DURING CODING
- **Preserve Existing Architecture**: Respect the client/server boundary and service decoupling.
- **Preserve Existing Workflows**: Do not alter established workflows in [`.knowledge/workflows.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/workflows.md) unless explicitly requested.
- **Do Not Invent Duplicate Implementations**:
  - Always check [`.knowledge/modules.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/modules.md) and [`.knowledge/dependencies.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/dependencies.md).
  - Use existing services (`FreshnessService`, `MatchingService`, `CollectiveSellingService`, `OrderStateMachine`).
  - Reuse shared UI components (`FreshnessBadge`, `FairPriceGauge`, `DeliveryMap`, `VoiceListingModal`).
- **Respect Database Consistency**: Wrap multi-table operations in `prisma.$transaction`.
- **Maintain Dual Language**: Add Tamil translations for every user-facing string using `LanguageContext.tsx`.

### Stage 3: AFTER CODING
1. **Run Type Checks**:
   ```bash
   npm run build:server
   npm run build:client
   ```
2. **Check Knowledge Graph Drift**:
   ```bash
   node .knowledge/scripts/update-graph.js --check
   ```
3. **Update Affected Graph Nodes & Relationships**:
   - If files were added, deleted, or dependencies altered, update the graph using `update-graph.js` or `build-graph.js`.
4. **Validate Referential Integrity**:
   ```bash
   node .knowledge/scripts/validate-graph.js
   ```
5. **Record Architectural Decisions**: Document any new non-obvious design choices in [`.knowledge/decisions.md`](file:///d:/Projects/Farmer_selling_app/.knowledge/decisions.md).

---

## Rule 2: Anti-Patterns & Strict Prohibitions

1. ❌ **Do NOT replace state-based navigation with `react-router`**: The state-based router is an intentional design choice supporting instant evaluation persona switching.
2. ❌ **Do NOT expose secrets in code or markdown**: Never commit real database passwords, JWT secrets, or cloud keys.
3. ❌ **Do NOT perform heavy math inside Express route controllers**: Always delegate to domain services.
4. ❌ **Do NOT delete or orphan nodes in `knowledge-graph.json`**: Always run `validate-graph.js` before concluding your turn.
