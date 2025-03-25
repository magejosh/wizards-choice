import { SpellNode, SpellTree } from './spellTree';
import { Spell } from '../types';
import { getSpellsByTier } from './spellData';

/**
 * Constants for spell tree layout
 */
const LAYOUT_CONSTANTS = {
  NODE_SPACING: 150, // Space between nodes
  TIER_SPACING: 200, // Space between tiers
  MAX_NODES_PER_TIER: 8, // Maximum number of nodes in a tier
  CENTER_X: 0,
  CENTER_Y: 0,
} as const;

/**
 * Calculates the position for a node based on its tier and index
 */
function calculateNodePosition(tier: number, index: number, totalInTier: number): { x: number; y: number } {
  // Calculate the base position based on tier
  const y = tier * LAYOUT_CONSTANTS.TIER_SPACING;
  
  // Calculate x position to center nodes in each tier
  const totalWidth = (totalInTier - 1) * LAYOUT_CONSTANTS.NODE_SPACING;
  const startX = -totalWidth / 2;
  const x = startX + (index * LAYOUT_CONSTANTS.NODE_SPACING);
  
  return { x, y };
}

/**
 * Creates a node with proper positioning
 */
function createNode(spell: Spell, tier: number, index: number, totalInTier: number): SpellNode {
  const position = calculateNodePosition(tier, index, totalInTier);
  
  return {
    id: `node_${spell.id}`,
    spell,
    position,
    connections: [],
    isUnlocked: false,
    cost: spell.tier, // Cost is equal to spell tier
    prerequisites: [],
  };
}

/**
 * Creates connections between nodes in adjacent tiers
 */
function createConnections(nodes: SpellNode[]): SpellNode[] {
  // Group nodes by tier
  const nodesByTier = nodes.reduce((acc, node) => {
    const tier = Math.floor(node.position.y / LAYOUT_CONSTANTS.TIER_SPACING);
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push(node);
    return acc;
  }, {} as Record<number, SpellNode[]>);

  // Connect nodes to adjacent tiers
  Object.entries(nodesByTier).forEach(([tierStr, tierNodes]) => {
    const tier = parseInt(tierStr);
    const nextTierNodes = nodesByTier[tier + 1] || [];
    
    // Connect each node to the next tier's nodes
    tierNodes.forEach(node => {
      // Find the closest nodes in the next tier
      const connections = nextTierNodes
        .map(nextNode => ({
          node: nextNode,
          distance: Math.abs(node.position.x - nextNode.position.x),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 2) // Connect to up to 2 nodes in the next tier
        .map(c => c.node.id);
      
      node.connections = connections;
    });
  });

  return nodes;
}

/**
 * Creates the initial spell tree layout
 */
export function createSpellTreeLayout(): SpellTree {
  const nodes: SpellNode[] = [];
  let centerNode: SpellNode | null = null;

  // Create center node (wizard)
  const wizardNode: SpellNode = {
    id: 'node_wizard',
    spell: {
      id: 'wizard',
      name: 'Wizard',
      type: 'buff',
      element: 'arcane',
      tier: 0,
      manaCost: 0,
      power: 0,
      description: 'The center of your spell tree',
    },
    position: { x: LAYOUT_CONSTANTS.CENTER_X, y: LAYOUT_CONSTANTS.CENTER_Y },
    connections: [],
    isUnlocked: true,
    cost: 0,
    prerequisites: [],
  };
  
  nodes.push(wizardNode);
  centerNode = wizardNode;

  // Create nodes for each tier of spells
  for (let tier = 1; tier <= 10; tier++) {
    // Get spells for this tier
    const tierSpells = getSpellsByTier(tier);
    
    // Calculate how many nodes to create for this tier
    const totalInTier = Math.min(tierSpells.length, LAYOUT_CONSTANTS.MAX_NODES_PER_TIER);
    
    // Create nodes for this tier
    for (let i = 0; i < totalInTier; i++) {
      const node = createNode(tierSpells[i], tier, i, totalInTier);
      nodes.push(node);
    }
  }

  // Create connections between nodes
  const connectedNodes = createConnections(nodes);

  // Set prerequisites based on connections
  connectedNodes.forEach(node => {
    if (node.id !== 'node_wizard') {
      // Find the closest unlocked nodes in the previous tier
      const prevTierNodes = connectedNodes.filter(n => 
        n.position.y < node.position.y &&
        n.isUnlocked
      );
      
      // Set prerequisites to the closest nodes
      node.prerequisites = prevTierNodes
        .map(n => n.id)
        .slice(0, 2); // Require up to 2 prerequisites
    }
  });

  return {
    nodes: connectedNodes,
    centerNode: centerNode.id,
    maxPoints: 100, // Maximum number of points that can be allocated
    allocatedPoints: 0,
  };
} 