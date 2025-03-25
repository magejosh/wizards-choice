import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
            <span className={`${styles.rarity} ${styles[potion.rarity]}`}>
              {potion.rarity}
            </span>
          </div>
          <div className={styles.potionInfo}>
            <div className={styles.potionDetails}>
              <span className={styles.type}>{potion.type}</span>
              <span className={styles.quantity}>x{potion.quantity}</span>
            </div>
            <p className={styles.description}>{potion.description}</p>
            <div className={styles.effects}>
              {potion.effects.map((effect, index) => (
                <span key={index} className={styles.effect}>
                  {effect}
                </span>
              ))}
            </div>
            <div className={styles.duration}>
              Duration: {potion.duration} turns
            </div>
          </div>
          <div className={styles.potionActions}>
            <Button
              variant="outline"
              className={styles.useButton}
              onClick={() => onUsePotion(potion)}
            >
              Use Potion
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
} 