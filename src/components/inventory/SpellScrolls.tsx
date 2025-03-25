'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SpellScroll } from '@/lib/types';
import styles from './SpellScrolls.module.css';

interface SpellScrollsProps {
  scrolls: SpellScroll[];
  onUseScroll: (scroll: SpellScroll) => void;
}

export function SpellScrolls({ scrolls, onUseScroll }: SpellScrollsProps) {
  if (scrolls.length === 0) {
    return (
      <div className={styles.emptyScrolls}>
        You have no spell scrolls
      </div>
    );
  }

  return (
    <div className={styles.scrollGrid}>
      {scrolls.map((scroll) => (
        <Card key={scroll.id} className={styles.scrollCard}>
          <div className={styles.scrollHeader}>
            <h3 className={styles.scrollName}>{scroll.name}</h3>
            <span className={`${styles.rarity} ${styles[scroll.rarity]}`}>
              {scroll.rarity}
            </span>
          </div>

          <div className={styles.spellInfo}>
            <div className={styles.spellName}>
              {scroll.spell.name}
            </div>
            <div className={styles.spellDetails}>
              <span className={styles.spellType}>{scroll.spell.type}</span>
              <span className={styles.spellElement}>{scroll.spell.element}</span>
              <span className={styles.spellTier}>Tier {scroll.spell.tier}</span>
            </div>
            <div className={styles.spellDescription}>
              {scroll.spell.description}
            </div>
          </div>

          <div className={styles.scrollActions}>
            <Button
              variant="default"
              size="sm"
              onClick={() => onUseScroll(scroll)}
              className={styles.useButton}
            >
              {scroll.isConsumable ? 'Use Scroll' : 'Learn Spell'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
} 