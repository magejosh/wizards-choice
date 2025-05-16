import React from 'react';
import { Card } from '@/components/ui/card';
import { Potion } from '@/lib/types';
import styles from './Potions.module.css';

interface PotionsProps {
  potions: Potion[];
  equippedPotions: Potion[];
  onUsePotion: (potion: Potion) => void;
  onEquipPotion: (potion: Potion) => void;
  onUnequipPotion: (potionId: string) => void;
}

export function Potions({ potions, equippedPotions, onUsePotion, onEquipPotion, onUnequipPotion }: PotionsProps) {
  const player = require('@/lib/game-state/gameStateStore').getWizard();
  const belt = player?.equipment.belt;
  const slotBonus = belt?.bonuses?.find(b => b.stat === 'potionSlots');
  const maxPotionSlots = slotBonus ? slotBonus.value : 0;
  const slotsUsed = equippedPotions.length;
  const canEquipMore = belt && slotsUsed < maxPotionSlots;

  return (
    <div>
      <div className={styles.equippedPotionsHeader}>
        <strong>Equipped Potions ({slotsUsed}/{maxPotionSlots})</strong>
      </div>
      <div className={styles.equippedPotionsGrid}>
        {equippedPotions.length === 0 ? (
          <div className={styles.emptyPotions}>No potions equipped</div>
        ) : (
          equippedPotions.map(potion => (
            <Card key={potion.id} className={styles.potionCard}>
              <div className={styles.potionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className={styles.potionName} style={{ flex: 1, textAlign: 'left' }}>{potion.name}</h3>
                {potion.quantity && potion.quantity > 1 && (
                  <span className={styles.quantity} style={{ marginLeft: 4 }}>x{potion.quantity}</span>
                )}
              </div>
              <div className={styles.potionImage}></div>
              <div className={styles.potionInfo}>
                <div className={styles.potionDetails}>
                  <span className={styles.type}>{potion.type}</span>
                  <span className={`${styles.rarity} ${styles[potion.rarity]}`}>{potion.rarity}</span>
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
                  onClick={() => onUnequipPotion(potion.id)}
                >
                  Unequip
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
      <hr className={styles.potionDivider} />
      <div className={styles.unequippedPotionsHeader}>
        <strong>Unequipped Potions</strong>
      </div>
      <div className={styles.potionsGrid}>
        {potions.length === 0 ? (
          <div className={styles.emptyPotions}>No potions found in your inventory.</div>
        ) : (
          potions.map((potion) => (
            <Card key={potion.id} className={styles.potionCard}>
              <div className={styles.potionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className={styles.potionName} style={{ flex: 1, textAlign: 'left' }}>{potion.name}</h3>
                {potion.quantity && potion.quantity > 1 && (
                  <span className={styles.quantity} style={{ marginLeft: 4 }}>x{potion.quantity}</span>
                )}
              </div>
              <div className={styles.potionImage}></div>
              <div className={styles.potionInfo}>
                <div className={styles.potionDetails}>
                  <span className={styles.type}>{potion.type}</span>
                  <span className={`${styles.rarity} ${styles[potion.rarity]}`}>{potion.rarity}</span>
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
                <button
                  className={styles.useButton}
                  onClick={() => {
                    if ((potion.quantity || 1) > 1) {
                      // Equip a single potion (let state handle stack decrement)
                      const singlePotion = { ...potion, id: `${potion.id}-eq-${Date.now()}`, quantity: 1 };
                      onEquipPotion(singlePotion);
                    } else {
                      onEquipPotion(potion);
                    }
                  }}
                  disabled={!canEquipMore}
                  title={belt ? (canEquipMore ? '' : 'No available belt slots') : 'Equip a belt to use potions'}
                >
                  Equip to Belt
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}