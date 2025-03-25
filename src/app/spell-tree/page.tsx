'use client';

import { useState, useEffect } from 'react';
import { SpellTree } from '../../components/spells/SpellTree';
import { SpellNode, unlockNode } from '../../lib/spells/spellTree';
import { createSpellTreeLayout } from '../../lib/spells/spellTreeLayout';
import styles from './page.module.css';

const STORAGE_KEY = 'spell_tree_state';

export default function SpellTreePage() {
  const [tree, setTree] = useState(createSpellTreeLayout());
  const [selectedNode, setSelectedNode] = useState<SpellNode | null>(null);
  const [unlockingNodeId, setUnlockingNodeId] = useState<string | null>(null);

  // Load saved state on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        setTree(parsedState);
      } catch (error) {
        console.error('Failed to load saved spell tree state:', error);
      }
    }
  }, []);

  // Save state whenever tree changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tree));
  }, [tree]);

  const handleNodeClick = (node: SpellNode) => {
    if (node.isUnlocked) {
      setSelectedNode(node);
      return;
    }

    // Try to unlock the node
    const newTree = { ...tree };
    if (unlockNode(node.id, newTree)) {
      setTree(newTree);
      setSelectedNode(node);
      setUnlockingNodeId(node.id);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your spell tree? This cannot be undone.')) {
      setTree(createSpellTreeLayout());
      setSelectedNode(null);
      setUnlockingNodeId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Spell Tree</h1>
        <button className={styles.resetButton} onClick={handleReset}>
          Reset Tree
        </button>
      </div>
      <div className={styles.treeContainer}>
        <SpellTree 
          tree={tree} 
          onNodeClick={handleNodeClick}
          unlockingNodeId={unlockingNodeId}
        />
      </div>
      {selectedNode && (
        <div className={styles.spellDetails}>
          <h2>{selectedNode.spell.name}</h2>
          <p>Tier: {selectedNode.spell.tier}</p>
          <p>Cost: {selectedNode.cost} points</p>
          <p>{selectedNode.spell.description}</p>
          <p>Type: {selectedNode.spell.type}</p>
          <p>Element: {selectedNode.spell.element}</p>
          <p>Mana Cost: {selectedNode.spell.manaCost}</p>
          <p>Power: {selectedNode.spell.power}</p>
        </div>
      )}
    </div>
  );
} 