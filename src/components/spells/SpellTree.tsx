'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { SpellTree, SpellNode } from '../../lib/spells/spellTree';
import { Tooltip } from '../ui/tooltip';
import styles from './SpellTree.module.css';

interface SpellTreeProps {
  tree: SpellTree;
  onNodeClick?: (node: SpellNode) => void;
  unlockingNodeId: string | null;
}

export function SpellTree({ tree, onNodeClick, unlockingNodeId }: SpellTreeProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [tooltipNode, setTooltipNode] = useState<SpellNode | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      setScale(prev => Math.min(Math.max(prev + delta, 0.5), 2));
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, []);

  // Handle panning
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      setOffset({
        x: e.clientX - startPos.x,
        y: e.clientY - startPos.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mouseleave', handleMouseUp);
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('mouseleave', handleMouseUp);
      };
    }
  }, [isDragging, startPos]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleNodeClick = (node: SpellNode) => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  const handleNodeMouseEnter = (node: SpellNode, e: React.MouseEvent) => {
    if (!node.isUnlocked) {
      setTooltipNode(node);
      setTooltipPosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleNodeMouseLeave = () => {
    setTooltipNode(null);
  };

  const getPrerequisitesText = (node: SpellNode) => {
    const prerequisites = node.prerequisites.map(id => {
      const prereqNode = tree.nodes.find(n => n.id === id);
      return prereqNode ? prereqNode.spell.name : id;
    });

    return prerequisites.length > 0
      ? `Requires: ${prerequisites.join(', ')}`
      : 'No prerequisites';
  };

  return (
    <div 
      ref={containerRef}
      className={styles.container}
      onMouseDown={handleMouseDown}
    >
      <div 
        className={styles.tree}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        }}
      >
        {/* Draw connections */}
        <svg className={styles.connections}>
          {tree.nodes.map(node => (
            node.connections.map(connectionId => {
              const targetNode = tree.nodes.find(n => n.id === connectionId);
              if (!targetNode) return null;
              
              return (
                <line
                  key={`${node.id}-${connectionId}`}
                  x1={node.position.x}
                  y1={node.position.y}
                  x2={targetNode.position.x}
                  y2={targetNode.position.y}
                  className={`${styles.connection} ${
                    node.isUnlocked && targetNode.isUnlocked
                      ? styles.unlocked
                      : styles.locked
                  }`}
                />
              );
            })
          ))}
        </svg>

        {/* Draw nodes */}
        {tree.nodes.map(node => (
          <div
            key={node.id}
            className={`${styles.node} ${
              node.isUnlocked ? styles.unlocked : styles.locked
            } ${node.id === unlockingNodeId ? styles.unlocking : ''}`}
            style={{
              left: `${node.position.x}px`,
              top: `${node.position.y}px`,
            }}
            onClick={() => handleNodeClick(node)}
            onMouseEnter={(e) => handleNodeMouseEnter(node, e)}
            onMouseLeave={handleNodeMouseLeave}
          >
            <div className={styles.nodeContent}>
              <div className={styles.spellName}>{node.spell.name}</div>
              <div className={styles.spellTier}>Tier {node.spell.tier}</div>
              <div className={styles.spellCost}>{node.cost} points</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltipNode && (
        <Tooltip
          content={
            <div>
              <h3>{tooltipNode.spell.name}</h3>
              <p>{getPrerequisitesText(tooltipNode)}</p>
              <p>Cost: {tooltipNode.cost} points</p>
              <p>{tooltipNode.spell.description}</p>
            </div>
          }
          position={tooltipPosition}
          visible={true}
        />
      )}
    </div>
  );
} 