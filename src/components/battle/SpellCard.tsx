import React from 'react';
import { Spell } from '../../lib/types/spell-types';
import styles from './BattleArena.module.css';

interface SpellCardProps {
  spell: Spell;
  onClick: () => void;
  disabled: boolean;
}

const SpellCard: React.FC<SpellCardProps> = ({ spell, onClick, disabled }) => {
  return (
    <div 
      className={`${styles.spellCard} ${disabled ? styles.spellCardDisabled : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className={styles.spellCardHeader}>
        <span className={styles.spellName}>{spell.name}</span>
        <span className={styles.spellMana}>{spell.manaCost}</span>
      </div>
      <div className={styles.spellCardBody}>
        <span className={styles.spellElement}>{spell.element}</span>
        <span className={styles.spellType}>{spell.type}</span>
      </div>
      <div className={styles.spellCardDescription}>
        {spell.description}
      </div>
    </div>
  );
};

export default SpellCard; 