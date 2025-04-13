'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
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
            <h3 className={styles.scrollName}>{scroll.spell.name}</h3>
          </div>

          <div className={styles.scrollImage}></div>

          <div className={styles.spellInfo}>
            <div className={styles.spellName}>
              Spell Scroll
            </div>
            <div className={styles.spellDetails}>
              <span className={styles.spellType}>{scroll.spell.type}</span>
              <span className={`${styles.rarity} ${styles[scroll.rarity]}`}>{scroll.rarity}</span>
              <span className={styles.spellElement}>{scroll.spell.element}</span>
              {scroll.quantity && scroll.quantity > 1 && (
                <span className={styles.quantity}>x{scroll.quantity}</span>
              )}
            </div>
            <div className={styles.spellDescription}>
              {scroll.spell.description}
            </div>
          </div>

          <div className={styles.scrollActions}>
            <button
              onClick={() => onUseScroll(scroll)}
              className={styles.useButton}
            >
              {scroll.isConsumable ? 'Use Scroll' : 'Learn Spell'}
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}