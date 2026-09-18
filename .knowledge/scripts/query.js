// .knowledge/scripts/query.js
// Interactive and CLI query tool for KisanDirect Project Knowledge Graph
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const knowledgeGraphPath = path.resolve(__dirname, '../knowledge-graph.json');

if (!fs.existsSync(knowledgeGraphPath)) {
  console.error('Error: knowledge-graph.json not found! Run build-graph.js first.');
  process.exit(1);
}

const graph = JSON.parse(fs.readFileSync(knowledgeGraphPath, 'utf-8'));
const { nodes, relationships } = graph;

const uiGraphPath = path.resolve(__dirname, '../ui-knowledge-graph.json');
let uiGraph = null;
if (fs.existsSync(uiGraphPath)) {
  uiGraph = JSON.parse(fs.readFileSync(uiGraphPath, 'utf-8'));
}

const nodeMap = new Map();
nodes.forEach(n => nodeMap.set(n.id, n));

const outgoingMap = new Map();
const incomingMap = new Map();

relationships.forEach(rel => {
  if (!outgoingMap.has(rel.from)) outgoingMap.set(rel.from, []);
  outgoingMap.get(rel.from).push(rel);

  if (!incomingMap.has(rel.to)) incomingMap.set(rel.to, []);
  incomingMap.get(rel.to).push(rel);
});

// Help menu
function showHelp() {
  console.log(`
🌾 KisanDirect Knowledge Graph Query Tool

Usage:
  node .knowledge/scripts/query.js [OPTIONS]

Full-Stack Options:
  --info <id>          Show detailed node specifications and connected edges
  --type <type>        List all nodes of a specific type (e.g., file, feature, api_endpoint, database_table, component, workflow)
  --feature <id>       List all components, APIs, services, and tables implementing a feature
  --search <keyword>   Full-text search across IDs, names, and descriptions
  --impact <id>        Perform impact analysis: traverse what depends on or calls this node
  --ask "<question>"   Answer common architectural and workflow questions
  --stats              Display high-level graph summary statistics

UI Knowledge Graph Options:
  --ui <name>          Inspect UI component / view / overlay (props, state, events, hooks, APIs, children)
  --views              List all 24 state-based views grouped by user persona / role
  --overlays           List all modals, slide-over drawers, and startup overlays
  --help               Display this help guide

Examples:
  node .knowledge/scripts/query.js --info "table:ProduceBatch"
  node .knowledge/scripts/query.js --feature "feature:collective-selling"
  node .knowledge/scripts/query.js --ui "Marketplace"
  node .knowledge/scripts/query.js --ui "CartDrawer"
  node .knowledge/scripts/query.js --views
  node .knowledge/scripts/query.js --overlays
  node .knowledge/scripts/query.js --ask "where is login implemented"
`);
}

// 1. Info Query
function getInfo(id) {
  const node = nodeMap.get(id);
  if (!node) {
    console.log(`❌ Node not found: "${id}". Use --search to find matching IDs.`);
    return;
  }

  console.log('\n======================================================');
  console.log(`📌 Entity: ${node.id}`);
  console.log('======================================================');
  console.log(`Type:        ${node.type}`);
  console.log(`Name:        ${node.name || '-'}`);
  if (node.file || node.source || node.path) {
    console.log(`Source File: ${node.file || node.source || node.path}`);
  }
  if (node.line_range) {
    console.log(`Line Range:  ${node.line_range}`);
  }
  if (node.line) {
    console.log(`Line:        ${node.line}`);
  }
  if (node.module) {
    console.log(`Module:      ${node.module}`);
  }
  if (node.description) {
    console.log(`Description: ${node.description}`);
  }

  const outgoing = outgoingMap.get(id) || [];
  if (outgoing.length > 0) {
    console.log('\n➡️  Outgoing Connections:');
    outgoing.forEach(r => {
      const target = nodeMap.get(r.to);
      const targetName = target ? target.name : r.to;
      console.log(`  --[${r.type}]--> ${r.to} (${targetName})`);
    });
  }

  const incoming = incomingMap.get(id) || [];
  if (incoming.length > 0) {
    console.log('\n⬅️  Incoming References / Dependents:');
    incoming.forEach(r => {
      const source = nodeMap.get(r.from);
      const sourceName = source ? source.name : r.from;
      console.log(`  <--[${r.type}]-- ${r.from} (${sourceName})`);
    });
  }
  console.log('======================================================\n');
}

// 2. Type Query
function listByType(type) {
  const matched = nodes.filter(n => n.type.toLowerCase() === type.toLowerCase());
  console.log(`\nFound ${matched.length} nodes of type "${type}":\n`);
  matched.forEach(n => {
    const loc = n.file || n.source || n.path || '';
    const locStr = loc ? ` [${loc}${n.line_range ? `:${n.line_range}` : ''}]` : '';
    console.log(`• ${n.id}${locStr}`);
    if (n.description) console.log(`    ↳ ${n.description}`);
  });
  console.log('');
}

// 3. Feature Query
function queryFeature(featureId) {
  const feature = nodeMap.get(featureId) || nodes.find(n => n.type === 'feature' && n.id.includes(featureId));
  if (!feature) {
    console.log(`❌ Feature not found: "${featureId}". Available features:`);
    nodes.filter(n => n.type === 'feature').forEach(f => console.log(`  • ${f.id}: ${f.name}`));
    return;
  }

  console.log(`\n🌟 Feature: ${feature.name} (${feature.id})`);
  console.log(`Description: ${feature.description}\n`);

  const connectedRels = relationships.filter(r => r.to === feature.id || r.from === feature.id);
  console.log('🔗 Related Components & Workflows:');
  connectedRels.forEach(r => {
    const peerId = r.from === feature.id ? r.to : r.from;
    const peer = nodeMap.get(peerId);
    console.log(`  • [${peer?.type}] ${peerId} - ${peer?.name || ''}`);
  });
  console.log('');
}

// 4. Search Query
function searchNodes(query) {
  const q = query.toLowerCase();
  const matched = nodes.filter(n =>
    n.id.toLowerCase().includes(q) ||
    (n.name && n.name.toLowerCase().includes(q)) ||
    (n.description && n.description.toLowerCase().includes(q))
  );

  console.log(`\n🔍 Search results for "${query}" (${matched.length} matches):\n`);
  matched.forEach(n => {
    console.log(`• [${n.type}] ${n.id}`);
    if (n.description) console.log(`    ↳ ${n.description}`);
  });
  console.log('');
}

// 5. Impact Analysis
function analyzeImpact(id) {
  const root = nodeMap.get(id);
  if (!root) {
    console.log(`❌ Node not found: "${id}"`);
    return;
  }

  console.log('\n======================================================');
  console.log(`💥 Impact Analysis for: ${root.id}`);
  console.log(`Name: ${root.name || '-'} | Type: ${root.type}`);
  console.log('======================================================\n');

  const visited = new Set();
  const impactTree = [];

  function traverse(currentId, depth = 1) {
    if (depth > 3) return; // limit depth to avoid cycle explosion
    const incoming = incomingMap.get(currentId) || [];
    incoming.forEach(rel => {
      const parentId = rel.from;
      if (!visited.has(`${currentId}<-${parentId}`)) {
        visited.add(`${currentId}<-${parentId}`);
        const parentNode = nodeMap.get(parentId);
        impactTree.push({
          depth,
          from: parentId,
          rel: rel.type,
          to: currentId,
          type: parentNode ? parentNode.type : 'unknown',
          name: parentNode ? parentNode.name : parentId,
          file: parentNode ? (parentNode.file || parentNode.source || parentNode.path) : null
        });
        traverse(parentId, depth + 1);
      }
    });
  }

  traverse(root.id);

  if (impactTree.length === 0) {
    console.log('No direct dependents found. This entity appears to be an entry point or leaf.');
  } else {
    console.log(`Direct & Transitive Dependents (${impactTree.length} paths found):`);
    impactTree.forEach(item => {
      const indent = '  '.repeat(item.depth);
      const fileInfo = item.file ? ` (${item.file})` : '';
      console.log(`${indent}↳ [Level ${item.depth}] ${item.from} [${item.type}] via ${item.rel}${fileInfo}`);
    });
  }
  console.log('\n======================================================\n');
}

// 6. Natural Language Architectural Questions
function askQuestion(q) {
  const query = q.toLowerCase();
  console.log(`\n💬 Question: "${q}"\n`);

  if (query.includes('auth') || query.includes('login') || query.includes('token')) {
    console.log('🔐 Authentication Implementation Context:');
    console.log('  • Backend Route:   server/src/routes/authRoutes.ts (lines 126-187)');
    console.log('  • Middleware Guard: server/src/middleware/auth.ts (authenticateToken, requireRole)');
    console.log('  • Frontend Context: client/src/context/AuthContext.tsx');
    console.log('  • Service Client:   client/src/services/api.ts (login, register, demoSwitch, setToken)');
    console.log('  • Database Tables:  User, FarmerProfile, BuyerProfile, CoordinatorProfile');
    console.log('  • JWT Token Key:    ENV.JWT_SECRET (expiry: 7d)');
  } else if (query.includes('checkout') || query.includes('cart') || query.includes('order')) {
    console.log('🛒 Order Placement & Checkout Data Flow:');
    console.log('  • Frontend Trigger: client/src/features/buyer/CheckoutModal.tsx');
    console.log('  • Context:          client/src/context/CartContext.tsx');
    console.log('  • API Endpoint:     POST /api/buyers/checkout (server/src/routes/buyerRoutes.ts:581)');
    console.log('  • DB Transaction:   Decrements ProduceBatch.quantity -> Creates Order & OrderItems');
    console.log('  • Escrow Lock:      Creates Payment record with status "AUTHORIZED"');
    console.log('  • State Machine:    server/src/services/orderStateMachine.ts manages subsequent 10 status stages');
    console.log('  • Notifications:    Dispatched to Buyer and contributing Farmers');
  } else if (query.includes('collective') || query.includes('pool')) {
    console.log('🌾 Collective Selling (கூட்டு விற்பனை) Implementation:');
    console.log('  • Engine:           server/src/services/collectiveSellingService.ts');
    console.log('  • Matching:         server/src/services/matchingService.ts');
    console.log('  • Endpoint:         POST /api/buyers/demands/:id/collective-order (buyerRoutes.ts:299)');
    console.log('  • UI View:          client/src/features/buyer/SmartMatches.tsx');
    console.log('  • Database Tables:  CollectiveOrder, CollectiveOrderMember, Order, OrderItem, ProduceBatch, Payment');
  } else if (query.includes('fresh') || query.includes('decay') || query.includes('urgent')) {
    console.log('⏱️ Freshness Decay Engine Context:');
    console.log('  • Engine:           server/src/services/freshnessService.ts (calculateFreshness)');
    console.log('  • UI Badge:         client/src/components/common/FreshnessBadge.tsx');
    console.log('  • Status Stages:    FRESH -> AGING -> URGENT (4h remaining, 15% discount) -> EXPIRED');
    console.log('  • Demo Simulation:  POST /api/demo/simulate-urgency & POST /api/demo/simulate-expiry');
    console.log('  • Rules Table:      FreshnessRule in server/prisma/schema.prisma');
  } else if (query.includes('price') || query.includes('mandi') || query.includes('rate')) {
    console.log('📊 Live Mandi Market Prices Context:');
    console.log('  • Service:          server/src/services/marketPriceService.ts');
    console.log('  • Routes:           server/src/routes/marketPriceRoutes.ts (/daily, /ticker, /mandis)');
    console.log('  • UI Explorer:      client/src/features/public/MarketRatesPage.tsx');
    console.log('  • UI Gauge:         client/src/components/common/FairPriceGauge.tsx');
    console.log('  • Mandi Locations:  13 regulated markets in Tamil Nadu (Salem, Koyambedu, Coimbatore, etc.)');
  } else if (query.includes('voice') || query.includes('speech')) {
    console.log('🎙️ Voice-Assisted Listing Context:');
    console.log('  • Modal Component:  client/src/components/common/VoiceListingModal.tsx');
    console.log('  • Coordinator Hub:  client/src/features/coordinator/CoordinatorDashboard.tsx');
    console.log('  • Backend Route:    POST /api/coordinator/create-batch (coordinatorRoutes.ts:92)');
    console.log('  • Languages:        Tamil (ta-IN) and English (en-IN)');
  } else {
    console.log(`🔍 General Search for relevant keywords:`);
    searchNodes(query);
  }
  console.log('');
}

// 7. UI Query
function queryUi(targetName) {
  if (!uiGraph) {
    console.log('❌ ui-knowledge-graph.json not found! Run node .knowledge/scripts/build-ui-graph.js first.');
    return;
  }
  if (!targetName) {
    console.log('❌ Please specify a component, view, or overlay name. Example: --ui "Marketplace"');
    return;
  }

  const q = targetName.toLowerCase().trim();
  const matched = uiGraph.nodes.filter(n =>
    n.id.toLowerCase() === q ||
    n.id.toLowerCase() === `component:${q}` ||
    n.id.toLowerCase() === `view:${q}` ||
    n.id.toLowerCase() === `overlay:${q}` ||
    (n.name && n.name.toLowerCase() === q) ||
    (n.slug && n.slug.toLowerCase() === q) ||
    (n.name && n.name.toLowerCase().includes(q))
  );

  if (matched.length === 0) {
    console.log(`❌ No UI entity found matching "${targetName}".`);
    console.log('Available components/views can be listed with --views or --overlays.');
    return;
  }

  matched.forEach(node => {
    console.log('\n======================================================');
    console.log(`🖥️  UI Entity: ${node.id} (${node.name})`);
    console.log('======================================================');
    console.log(`Type:        ${node.type}`);
    if (node.slug) console.log(`Slug:        ${node.slug}`);
    if (node.role) console.log(`Role:        ${node.role}`);
    if (node.file || node.source) console.log(`Source File: ${node.file || node.source}`);
    if (node.description) console.log(`Description: ${node.description}`);

    if (node.props && node.props.length > 0) {
      console.log('\n📋 Props:');
      node.props.forEach(p => console.log(`  • ${p}`));
    }

    if (node.state && node.state.length > 0) {
      console.log('\n💾 State:');
      node.state.forEach(s => console.log(`  • ${s}`));
    }

    if (node.events && node.events.length > 0) {
      console.log('\n⚡ Events & Handlers:');
      node.events.forEach(e => console.log(`  • ${e}`));
    }

    if (node.hooks && node.hooks.length > 0) {
      console.log('\n🪝 React Hooks Used:');
      node.hooks.forEach(h => console.log(`  • ${h}`));
    }

    if (node.apisCalled && node.apisCalled.length > 0) {
      console.log('\n🌐 Client APIs Invoked:');
      node.apisCalled.forEach(a => console.log(`  • ${a}`));
    }

    if (node.children && node.children.length > 0) {
      console.log('\n👶 Children Components Rendered:');
      node.children.forEach(c => console.log(`  • ${c}`));
    }

    const outRels = uiGraph.relationships.filter(r => r.from === node.id);
    if (outRels.length > 0) {
      console.log('\n➡️  UI Graph Connections:');
      outRels.forEach(r => console.log(`  --[${r.type}]--> ${r.to}`));
    }

    const inRels = uiGraph.relationships.filter(r => r.to === node.id);
    if (inRels.length > 0) {
      console.log('\n⬅️  Parent References:');
      inRels.forEach(r => console.log(`  <--[${r.type}]-- ${r.from}`));
    }
    console.log('======================================================\n');
  });
}

// 8. List Views
function listViews() {
  if (!uiGraph) {
    console.log('❌ ui-knowledge-graph.json not found! Run build-ui-graph.js first.');
    return;
  }
  const views = uiGraph.nodes.filter(n => n.type === 'ui_view');
  console.log(`\n🗺️  KisanDirect UI State-Based Views (${views.length} total):\n`);

  const roles = ['PUBLIC', 'AUTHENTICATED', 'FARMER', 'BUYER', 'COORDINATOR', 'LOGISTICS', 'ADMIN'];
  roles.forEach(role => {
    const roleViews = views.filter(v => v.role === role);
    if (roleViews.length > 0) {
      console.log(`📁 [${role}] Views:`);
      roleViews.forEach(v => {
        console.log(`  • slug: "${v.slug.padEnd(20)}" | ID: ${v.id.padEnd(26)} | ${v.name}`);
        if (v.description) console.log(`      ↳ ${v.description}`);
      });
      console.log('');
    }
  });
}

// 9. List Overlays
function listOverlays() {
  if (!uiGraph) {
    console.log('❌ ui-knowledge-graph.json not found! Run build-ui-graph.js first.');
    return;
  }
  const overlays = uiGraph.nodes.filter(n => n.type === 'ui_overlay');
  console.log(`\n🪟 KisanDirect Modals, Drawers & Overlays (${overlays.length} total):\n`);
  overlays.forEach(o => {
    console.log(`• ${o.name} (${o.id})`);
    console.log(`    File:        ${o.file}`);
    console.log(`    Description: ${o.description}`);
  });
  console.log('');
}

// CLI Arg Parsing
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help')) {
  showHelp();
  process.exit(0);
}

if (args.includes('--stats')) {
  console.log('\n📊 KisanDirect Knowledge Graph Stats:');
  console.log(JSON.stringify(graph.stats, null, 2));
  if (uiGraph) {
    console.log('\n📊 UI Knowledge Graph Stats:');
    console.log(JSON.stringify(uiGraph.stats, null, 2));
  }
  console.log('');
} else if (args.includes('--info')) {
  const idx = args.indexOf('--info');
  getInfo(args[idx + 1]);
} else if (args.includes('--type')) {
  const idx = args.indexOf('--type');
  listByType(args[idx + 1]);
} else if (args.includes('--feature')) {
  const idx = args.indexOf('--feature');
  queryFeature(args[idx + 1]);
} else if (args.includes('--search')) {
  const idx = args.indexOf('--search');
  searchNodes(args[idx + 1]);
} else if (args.includes('--impact')) {
  const idx = args.indexOf('--impact');
  analyzeImpact(args[idx + 1]);
} else if (args.includes('--ask')) {
  const idx = args.indexOf('--ask');
  askQuestion(args[idx + 1]);
} else if (args.includes('--ui')) {
  const idx = args.indexOf('--ui');
  queryUi(args[idx + 1]);
} else if (args.includes('--views')) {
  listViews();
} else if (args.includes('--overlays')) {
  listOverlays();
} else {
  showHelp();
}
