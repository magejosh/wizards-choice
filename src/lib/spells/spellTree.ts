import { Spell, ElementType } from '../types';

/**
 * Represents a node in the spell tree
 */
export interface SpellNode {
  id: string;
  spell: Spell;
  position: {
    x: number;
    y: number;
  };
  connections: string[]; // IDs of connected nodes
  isUnlocked: boolean;
  cost: number; // Number of level-up points required to unlock
  prerequisites: string[]; // IDs of prerequisite nodes that must be unlocked first
}

/**
 * Represents the entire spell tree
 */
export interface SpellTree {
  nodes: SpellNode[];
  centerNode: string; // ID of the center node (wizard)
  maxPoints: number; // Maximum number of points that can be allocated
  allocatedPoints: number; // Current number of allocated points
}

/**
 * Creates the initial spell tree structure
 */
export function createSpellTree(): SpellTree {
  // Start with a basic tree structure
  // We'll expand this as we implement more features
  return {
    nodes: [],
    centerNode: '',
    maxPoints: 0,
    allocatedPoints: 0,
  };
}

/**
 * Checks if a node can be unlocked based on prerequisites
 */
export function canUnlockNode(node: SpellNode, tree: SpellTree): boolean {
  // Check if all prerequisites are unlocked
  return node.prerequisites.every(prereqId => {
    const prereqNode = tree.nodes.find(n => n.id === prereqId);
    return prereqNode?.isUnlocked ?? false;
  });
}

/**
 * Attempts to unlock a node in the spell tree
 */
export function unlockNode(nodeId: string, tree: SpellTree): boolean {
  const node = tree.nodes.find(n => n.id === nodeId);
  if (!node) return false;

  // Check if node is already unlocked
  if (node.isUnlocked) return false;

  // Check if we have enough points
  if (tree.allocatedPoints + node.cost > tree.maxPoints) return false;

  // Check prerequisites
  if (!canUnlockNode(node, tree)) return false;

  // Unlock the node
  node.isUnlocked = true;
  tree.allocatedPoints += node.cost;

  return true;
}

/**
 * Gets all available nodes that can be unlocked
 */
export function getAvailableNodes(tree: SpellTree): SpellNode[] {
  return tree.nodes.filter(node => 
    !node.isUnlocked && 
    canUnlockNode(node, tree) &&
    tree.allocatedPoints + node.cost <= tree.maxPoints
  );
}

/**
 * Gets all nodes that are prerequisites for the given node
 */
export function getPrerequisites(nodeId: string, tree: SpellTree): SpellNode[] {
  const node = tree.nodes.find(n => n.id === nodeId);
  if (!node) return [];

  return node.prerequisites
    .map(prereqId => tree.nodes.find(n => n.id === prereqId))
    .filter((n): n is SpellNode => n !== undefined);
}

/**
 * Gets all nodes that depend on the given node
 */
export function getDependents(nodeId: string, tree: SpellTree): SpellNode[] {
  return tree.nodes.filter(node => 
    node.prerequisites.includes(nodeId)
  );
} 