// .knowledge/scripts/update-graph.js
// Incremental update mechanism for KisanDirect Project Knowledge Graph
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const knowledgeGraphPath = path.resolve(__dirname, '../knowledge-graph.json');

if (!fs.existsSync(knowledgeGraphPath)) {
  console.error('Error: knowledge-graph.json not found! Run build-graph.js first.');
  process.exit(1);
}

function loadGraph() {
  return JSON.parse(fs.readFileSync(knowledgeGraphPath, 'utf-8'));
}

function saveGraph(graph) {
  graph.stats = {
    totalNodes: graph.nodes.length,
    totalRelationships: graph.relationships.length,
    nodeTypes: graph.nodes.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {})
  };
  graph.lastUpdated = new Date().toISOString();
  fs.writeFileSync(knowledgeGraphPath, JSON.stringify(graph, null, 2), 'utf-8');
  console.log(`💾 Knowledge graph updated successfully (${graph.nodes.length} nodes, ${graph.relationships.length} relationships).`);
}

function showHelp() {
  console.log(`
🌾 KisanDirect Incremental Knowledge Graph Update Utility

Usage:
  node .knowledge/scripts/update-graph.js [COMMAND] [OPTIONS]

Commands:
  --check               Detects file system changes (new, deleted, or modified files) compared to graph
  --add-file <path>     Incrementally registers a new file node
  --remove-node <id>    Removes a node and cascades deletion across all connected relationships
  --link                Adds a directed relationship between two nodes:
                        --from <id> --type <type> --to <id>
  --unlink              Removes a relationship:
                        --from <id> --type <type> --to <id>
  --update-meta         Updates properties on an existing node:
                        --id <id> --field <fieldName> --value <newVal>
  --help                Shows this help manual

Examples:
  node .knowledge/scripts/update-graph.js --check
  node .knowledge/scripts/update-graph.js --add-file "server/src/routes/newRoute.ts"
  node .knowledge/scripts/update-graph.js --link --from "file:server/src/routes/newRoute.ts" --type "contains" --to "api:GET /api/new"
`);
}

// 1. Check Drift & Changes
function checkChanges() {
  const graph = loadGraph();
  console.log('\n🔍 Checking for code drift and file modifications against Knowledge Graph...\n');

  // Find all actual ts/tsx files in server/src and client/src
  const allSourceFiles = [];
  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory() && ent.name !== 'node_modules' && ent.name !== 'dist') {
        scan(full);
      } else if (ent.isFile() && (ent.name.endsWith('.ts') || ent.name.endsWith('.tsx') || ent.name.endsWith('.prisma'))) {
        const rel = path.relative(rootDir, full).replace(/\\/g, '/');
        allSourceFiles.push(rel);
      }
    }
  }

  scan(path.join(rootDir, 'server/src'));
  scan(path.join(rootDir, 'server/prisma'));
  scan(path.join(rootDir, 'client/src'));

  const indexedFilePaths = new Set(
    graph.nodes.filter(n => n.type === 'file').map(n => n.path)
  );

  const newFiles = allSourceFiles.filter(f => !indexedFilePaths.has(f));
  const deletedFiles = Array.from(indexedFilePaths).filter(p => !fs.existsSync(path.resolve(rootDir, p)));

  console.log(`Source Files in Repository:  ${allSourceFiles.length}`);
  console.log(`Files Indexed in Graph:      ${indexedFilePaths.size}`);
  console.log(`Unindexed New Files:         ${newFiles.length}`);
  console.log(`Deleted/Missing Files:       ${deletedFiles.length}`);

  if (newFiles.length > 0) {
    console.log('\n🆕 Unindexed Files Found (run --add-file to index):');
    newFiles.forEach(f => console.log(`  + ${f}`));
  }

  if (deletedFiles.length > 0) {
    console.log('\n🗑️ Missing Files in Graph (run --remove-node to clean up):');
    deletedFiles.forEach(f => console.log(`  - ${f}`));
  }

  if (newFiles.length === 0 && deletedFiles.length === 0) {
    console.log('\n✅ Knowledge Graph file structure is completely in sync with local disk!');
  }
  console.log('');
}

// 2. Add File Node
function addFileNode(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  const abs = path.resolve(rootDir, norm);
  if (!fs.existsSync(abs)) {
    console.error(`Error: File does not exist on disk: ${norm}`);
    process.exit(1);
  }

  const graph = loadGraph();
  const id = `file:${norm}`;
  if (graph.nodes.some(n => n.id === id)) {
    console.log(`Node already exists: ${id}`);
    return;
  }

  const moduleGuess = norm.startsWith('server/src/routes') ? 'module:server-routes'
    : norm.startsWith('server/src/services') ? 'module:server-services'
    : norm.startsWith('client/src/features') ? 'module:client-features'
    : 'module:general';

  const newNode = {
    id,
    type: 'file',
    name: path.basename(norm),
    path: norm,
    module: moduleGuess,
    description: `Source file ${norm}`
  };

  graph.nodes.push(newNode);
  graph.relationships.push({ from: moduleGuess, type: 'contains', to: id });
  saveGraph(graph);
  console.log(`✅ Added new file node: ${id}`);
}

// 3. Remove Node
function removeNode(id) {
  const graph = loadGraph();
  const initCount = graph.nodes.length;
  graph.nodes = graph.nodes.filter(n => n.id !== id);

  if (graph.nodes.length === initCount) {
    console.log(`Node not found: ${id}`);
    return;
  }

  const initialRelCount = graph.relationships.length;
  graph.relationships = graph.relationships.filter(r => r.from !== id && r.to !== id);
  const removedRels = initialRelCount - graph.relationships.length;

  saveGraph(graph);
  console.log(`✅ Removed node ${id} and ${removedRels} connected relationships.`);
}

// 4. Link Nodes
function linkNodes(from, type, to) {
  const graph = loadGraph();
  if (!graph.nodes.some(n => n.id === from)) {
    console.error(`Error: Source node "${from}" does not exist in graph.`);
    process.exit(1);
  }
  if (!graph.nodes.some(n => n.id === to)) {
    console.error(`Error: Target node "${to}" does not exist in graph.`);
    process.exit(1);
  }

  const exists = graph.relationships.some(r => r.from === from && r.type === type && r.to === to);
  if (exists) {
    console.log(`Relationship already exists: (${from}) --[${type}]--> (${to})`);
    return;
  }

  graph.relationships.push({ from, type, to });
  saveGraph(graph);
  console.log(`✅ Linked: (${from}) --[${type}]--> (${to})`);
}

// 5. Unlink Nodes
function unlinkNodes(from, type, to) {
  const graph = loadGraph();
  const initCount = graph.relationships.length;
  graph.relationships = graph.relationships.filter(r => !(r.from === from && r.type === type && r.to === to));

  if (graph.relationships.length === initCount) {
    console.log(`Relationship not found: (${from}) --[${type}]--> (${to})`);
    return;
  }

  saveGraph(graph);
  console.log(`✅ Unlinked: (${from}) --[${type}]--> (${to})`);
}

// CLI Arg Parsing
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help')) {
  showHelp();
  process.exit(0);
}

if (args.includes('--check')) {
  checkChanges();
} else if (args.includes('--add-file')) {
  const idx = args.indexOf('--add-file');
  addFileNode(args[idx + 1]);
} else if (args.includes('--remove-node')) {
  const idx = args.indexOf('--remove-node');
  removeNode(args[idx + 1]);
} else if (args.includes('--link')) {
  const fromIdx = args.indexOf('--from');
  const typeIdx = args.indexOf('--type');
  const toIdx = args.indexOf('--to');
  if (fromIdx === -1 || typeIdx === -1 || toIdx === -1) {
    console.error('Usage: --link --from <id> --type <type> --to <id>');
    process.exit(1);
  }
  linkNodes(args[fromIdx + 1], args[typeIdx + 1], args[toIdx + 1]);
} else if (args.includes('--unlink')) {
  const fromIdx = args.indexOf('--from');
  const typeIdx = args.indexOf('--type');
  const toIdx = args.indexOf('--to');
  if (fromIdx === -1 || typeIdx === -1 || toIdx === -1) {
    console.error('Usage: --unlink --from <id> --type <type> --to <id>');
    process.exit(1);
  }
  unlinkNodes(args[fromIdx + 1], args[typeIdx + 1], args[toIdx + 1]);
} else {
  showHelp();
}
