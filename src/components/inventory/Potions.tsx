import React from 'react';
import { Card } from '@/components/ui/card';
import { Potion } from '@/lib/types';
import styles from './Potions.module.css';

interface PotionsProps {
  potions: Potion[];
  onUsePotion: (potion: Potion) => void;
}

export function Potions({ potions, onUsePotion }: PotionsProps) {
  if (potions.length === 0) {
    return (
      <div className={styles.emptyPotions}>
        No potions found in your inventory.
      </div>
    );
  }

  return (
    <div className={styles.potionsGrid}>
      {potions.map((potion) => (
        <Card key={potion.id} className={styles.potionCard}>


          <div className={styles.potionHeader}>
            <h3 className={styles.potionName}>{potion.name}</h3>
          </div>

          <div className={styles.potionImage}></div>

          <div className={styles.potionInfo}>
            <div className={styles.potionDetails}>
              <span className={styles.type}>{potion.type}</span>
              <span className={`${styles.rarity} ${styles[potion.rarity]}`}>{potion.rarity}</span>
              <span className={styles.quantity}>x{potion.quantity}</span>
            </div>
            <p className={styles.description}>{potion.description}</p>
            <div className={styles.effects}>
              {potion.effect && (
                <span className={styles.effect}>
                  {potion.type === 'health' && `❤️ +${potion.effect.value} health`}
                  {potion.type === 'mana' && `✨ +${potion.effect.value} mana`}
                  {potion.type === 'strength' && `⚔️ +${potion.effect.value}% damage`}
                  {potion.type === 'protection' && `🛡️ -${potion.effect.value}% damage`}
                  {potion.type === 'elemental' && `🔮 +${potion.effect.value}% elem dmg`}
                  {potion.type === 'luck' && `🎯 +${potion.effect.value}% crit`}
                </span>
              )}
            </div>
            {potion.effect && potion.effect.duration && (
              <div className={styles.duration}>
                Duration: {potion.effect.duration} turns
              </div>
            )}
          </div>
          <div className={styles.potionActions}>
            <button
              className={styles.useButton}
              onClick={() => onUsePotion(potion)}
            >
              Use Potion
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}