// src/components/battle/PlayerHand.tsx
// Component to display player's spell cards in battle

import React from 'react';
import { Spell } from '../../lib/types/spell-types';
import styles from './BattleArena.module.css';

interface PlayerHandProps {
  spells: Spell[];
  currentMana: number;
  onSpellSelect: (spell: Spell) => void;
  isPlayerTurn: boolean;
  isAnimating: boolean;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  spells,
  currentMana,
  onSpellSelect,
  isPlayerTurn,
  isAnimating
}) => {
  if (!spells || spells.length === 0) {
    return <div className={styles.noSpells}>No spells in hand</div>;
  }
  
  return (
    <div className={styles.spellsContainer}>
      {spells.map(spell => (
        <div 
          key={spell.id}
          className={`${styles.spellCard} ${
            currentMana < spell.manaCost || !isPlayerTurn || isAnimating
              ? styles.spellCardDisabled 
              : ''
          }`}
          onClick={() => {
            if (isPlayerTurn && currentMana >= spell.manaCost && !isAnimating) {
              onSpellSelect(spell);
            }
          }}
        >
          <div className={styles.spellCardHeader}>
            <span className={styles.spellName}>{spell.name}</span>
            <span className={styles.spellMana}>{spell.manaCost}</span>
          </div>
          <div className={styles.spellCardBody}>
            <div className={styles.spellElement}>{spell.element}</div>
            <div className={styles.spellType}>{spell.type}</div>
          </div>
          <div className={styles.spellCardDescription}>
            {spell.description}
          </div>
          <div className={styles.spellCardFooter}>
            <span className={styles.spellTier}>Tier {spell.tier}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlayerHand; 