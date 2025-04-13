'use client';

import React from 'react';
import { Spell } from '../../lib/types/spell-types';
import styles from './SpellCard.module.css';

export interface SpellCardProps {
  spell: Spell;
  onClick?: () => void;
  isEquipped?: boolean;
  slotNumber?: number;
  disabled?: boolean;
}

const SpellCard: React.FC<SpellCardProps> = ({
  spell,
  onClick,
  isEquipped = false,
  slotNumber,
  disabled = false
}) => {
  // Handle click with disabled state
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  // Get proper image path, with fallbacks
  const getImagePath = () => {
    // If spell has a specific image path, use it
    if (spell.imagePath && spell.imagePath.trim() !== '') {
      return spell.imagePath;
    }

    // Try element-specific default
    const elementDefault = `/images/${spell.element}-default.jpg`;

    // Fallback to generic default
    return `/images/default-placeholder.jpg`;
  };

  return (
    <div
      className={`${styles.spellCard} ${styles[spell.element]} ${styles[spell.type]} ${disabled ? styles.disabled : ''}`}
      onClick={handleClick}
    >
      {slotNumber !== undefined && (
        <div className={styles.slotNumber}>{slotNumber}</div>
      )}

      <div className={styles.header}>
        <h3 className={styles.name}>{spell.name}</h3>
      </div>

      <div className={styles.imageContainer}>
        <img
          src={getImagePath()}
          alt={spell.name}
          className={styles.image}
          onError={(e) => {
            // Fallback if the image fails to load
            const target = e.target as HTMLImageElement;
            target.src = '/images/default-placeholder.jpg';
          }}
        />
      </div>

      <div className={styles.elementTypeBar}>
        <span className={styles.element}>{spell.element}</span>
        <span className={styles.type}>{spell.type}</span>
      </div>

      <div className={styles.tierManaRow}>
        <div className={styles.tier}>Tier {spell.tier}</div>
        <div className={styles.manaCost}>
          <span className={styles.manaIcon}>✦</span> {spell.manaCost}
        </div>
      </div>

      <div className={styles.info}>
        <div className={styles.description}>
          {spell.description}
        </div>

        <div className={styles.effects}>
          {spell.effects.map((effect, index) => (
            <div key={index} className={styles.effect}>
              <span className={styles.effectType}>
                {effect.type === 'damage' && '💥'}
                {effect.type === 'healing' && '💚'}
                {effect.type === 'buff' && '⚡'}
                {effect.type === 'debuff' && '⬇️'}
                {effect.type === 'statModifier' && '🔄'}
                {effect.type === 'statusEffect' && '⏱️'}
                {effect.type === 'manaRestore' && '✨'}
                {effect.type === 'control' && '🔒'}
                {effect.type === 'summon' && '🧙'}
                {effect.type === 'utility' && '🛠️'}
              </span>
              <span className={styles.effectValue}>
                {effect.value > 0 && effect.type !== 'damage' && effect.type !== 'debuff' ? '+' : ''}
                {effect.value}
              </span>
              {effect.duration && (
                <span className={styles.effectDuration}>
                  for {effect.duration} {effect.duration === 1 ? 'turn' : 'turns'}
                </span>
              )}
              <span className={styles.effectTarget}>
                {effect.target === 'self' ? 'You' : 'Enemy'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {isEquipped && slotNumber === undefined && (
        <div className={styles.equippedBadge}>Equipped</div>
      )}
    </div>
  );
};

export default SpellCard;
