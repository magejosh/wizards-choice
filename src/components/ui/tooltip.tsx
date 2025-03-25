"use client"

import React from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  content: React.ReactNode;
  position: { x: number; y: number };
  visible: boolean;
}

export function Tooltip({ content, position, visible }: TooltipProps) {
  if (!visible) return null;

  return (
    <div 
      className={styles.tooltip}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {content}
    </div>
  );
}
