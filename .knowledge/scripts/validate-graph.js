// .knowledge/scripts/validate-graph.js
// Validates referential integrity, physical file existence, and consistency of the Knowledge Graph
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const knowledgeGraphPath = path.resolve(__dirname, '../knowledge-graph.json');

if (!fs.existsSync(knowledgeGraphPath)) {
  console.error('Error: knowledge-graph.json does not exist.');
  process.exit(1);
}

const graph = JSON.parse(fs.readFileSync(knowledgeGraphPath, 'utf-8'));
const { nodes, relationships } = graph;

const errors = [];
const warnings = [];
const nodeMap = new Map();

// 1. Check duplicate IDs
nodes.forEach(node => {
  if (nodeMap.has(node.id)) {
    errors.push(`Duplicate node ID found: ${node.id}`);
  }
  nodeMap.set(node.id, node);
});

// 2. Check physical file paths
let verifiedFilesCount = 0;
nodes.forEach(node => {
  const filePath = node.file || node.source || (node.type === 'file' ? node.path : null);
  if (filePath) {
    const absPath = path.resolve(rootDir, filePath);
    if (!fs.existsSync(absPath)) {
      errors.push(`Referenced file does not exist: "${filePath}" in node "${node.id}"`);
    } else {
      verifiedFilesCount++;
    }
  }
});

// 3. Check relationships integrity
let brokenRelationshipsCount = 0;
relationships.forEach((rel, idx) => {
  if (!nodeMap.has(rel.from)) {
    errors.push(`Relationship #${idx} has missing source node: "${rel.from}"`);
    brokenRelationshipsCount++;
  }
  if (!nodeMap.has(rel.to)) {
    errors.push(`Relationship #${idx} has missing target node: "${rel.to}"`);
    brokenRelationshipsCount++;
  }
});

// 4. Check orphaned nodes (nodes with 0 incoming and 0 outgoing relationships)
const connectedNodeIds = new Set();
relationships.forEach(r => {
  connectedNodeIds.add(r.from);
  connectedNodeIds.add(r.to);
});

const orphanedNodes = nodes.filter(n => !connectedNodeIds.has(n.id) && n.type !== 'config');
if (orphanedNodes.length > 0) {
  orphanedNodes.forEach(o => warnings.push(`Orphaned node with 0 relationships: "${o.id}"`));
}

console.log('======================================================');
console.log('🔍 KisanDirect Knowledge Graph Validation Report');
console.log('======================================================');
console.log(`Total Nodes Checked:           ${nodes.length}`);
console.log(`Total Relationships Checked:   ${relationships.length}`);
console.log(`Physical Source Files Verified: ${verifiedFilesCount}`);
console.log(`Broken Relationships:          ${brokenRelationshipsCount}`);
console.log(`Orphaned Nodes:                ${orphanedNodes.length}`);
console.log(`Total Errors:                  ${errors.length}`);
console.log(`Total Warnings:                ${warnings.length}`);
console.log('======================================================');

if (errors.length > 0) {
  console.log('\n❌ Validation ERRORS:');
  errors.forEach(e => console.log(`  • ${e}`));
  process.exit(1);
} else {
  console.log('\n✅ ALL INTEGRITY CHECKS PASSED: Knowledge Graph is 100% referentially sound!');
}

if (warnings.length > 0) {
  console.log('\n⚠️ Warnings:');
  warnings.forEach(w => console.log(`  • ${w}`));
}
