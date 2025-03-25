'use client';

import React from 'react';
import { useGameStateStore } from '../../../game-state/gameStateStore';
import { SpellScroll, Equipment } from '../../../types';
import styles from './SpellScrolls.module.css';

const isSpellScroll = (item: Equipment): item is SpellScroll & Equipment => {
  return item.type === 'scroll' && 'spell' in item;
};

export const SpellScrolls: React.FC = () => {
  const { gameState, consumeScrollToLearnSpell } = useGameStateStore();
  const { player } = gameState;

  const scrolls = player.inventory?.filter(isSpellScroll) || [];

  const learnSpell = (scroll: SpellScroll & Equipment) => {
    const result = consumeScrollToLearnSpell(scroll.id);
    if (result.success) {
      alert(`You have learned the spell: ${scroll.spell.name}!`);
    } else {
      alert(result.message);
    }
  };

  if (scrolls.length === 0) {
    return (
      <div className={styles.emptyScrolls}>
        <p className={styles.emptyScrollsText}>You don't have any spell scrolls.</p>
      </div>
    );
  }

  return (
    <div className={styles.scrollGrid}>
      {scrolls.map(scroll => (
        <div key={scroll.id} className={styles.scrollCard}>
          <div className={styles.scrollHeader}>
            <div className={styles.scrollTitle}>
              <h3 className={styles.scrollName}>{scroll.name}</h3>
              <span className={`${styles.rarity} ${styles[scroll.rarity.toLowerCase()]}`}>
                {scroll.rarity}
              </span>
            </div>
            <div className={styles.scrollType}>
              <span className={styles.type}>Spell Scroll</span>
            </div>
          </div>
          <div className={styles.scrollContent}>
            <div className={styles.spellInfo}>
              <div className={styles.spellLevel}>
                <span className={styles.label}>Level</span>
                <span className={styles.value}>{scroll.spell.tier}</span>
              </div>
              <div className={styles.spellSchool}>
                <span className={styles.label}>School</span>
                <span className={styles.value}>{scroll.spell.element}</span>
              </div>
            </div>
            <p className={styles.description}>{scroll.description}</p>
            <div className={styles.scrollActions}>
              <button
                className={styles.learnButton}
                onClick={() => learnSpell(scroll)}
              >
                Learn Spell
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SpellScrolls; 