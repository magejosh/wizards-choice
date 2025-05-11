'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Equipment, Potion } from '@/lib/types';
import styles from './ItemGrid.module.css';
import { getWizard } from '@/lib/game-state/gameStateStore';

interface ItemGridProps {
  items: (Equipment | Potion)[];
  onEquipItem: (item: Equipment | Potion) => void;
}

export function ItemGrid({ items, onEquipItem }: ItemGridProps) {
  const player = getWizard();
  const hasRobesEquipped = !!player?.equipment.body;
  const hasBeltEquipped = !!player?.equipment.belt;

  if (items.length === 0) {
    return (
      <div className={styles.emptyInventory}>
        Your inventory is empty
      </div>
    );
  }

  return (
    <div className={styles.itemGrid}>
      {items.map((item) => {
        // Potion rendering
        if ('effect' in item) {
          const equipDisabled = !hasBeltEquipped;
          const equipTooltip = !hasBeltEquipped ? 'Equip a belt to use potions.' : undefined;
          return (
            <Card key={item.id} className={styles.itemCard}>
              <div className={styles.itemHeader}>
                <h3 className={styles.itemName}>{item.name}</h3>
              </div>
              <div className={styles.itemImage}>
                <div style={{ fontSize: '24px' }}>🧪</div>
              </div>
              <div className={styles.itemDetails}>
                <div className={styles.type}>{item.type}</div>
                <div className={`${styles.rarity} ${styles[item.rarity]}`}>{item.rarity}</div>
                {item.quantity && item.quantity > 1 && (
                  <div className={styles.quantity}>x{item.quantity}</div>
                )}
              </div>
              <div className={styles.bonuses}>
                <div className={styles.bonus}>
                  {item.type === 'health' && `❤️ +${item.effect.value} health`}
                  {item.type === 'mana' && `✨ +${item.effect.value} mana`}
                  {item.type === 'strength' && `⚔️ +${item.effect.value}% damage`}
                  {item.type === 'protection' && `🛡️ -${item.effect.value}% damage`}
                  {item.type === 'elemental' && `🔮 +${item.effect.value}% elem dmg`}
                  {item.type === 'luck' && `🎯 +${item.effect.value}% crit`}
                </div>
                {item.effect.duration && (
                  <div className={styles.bonus}>
                    Duration: {item.effect.duration} turns
                  </div>
                )}
                <div className={styles.bonus}>{item.description}</div>
              </div>
              <div className={styles.itemActions}>
                <button
                  onClick={() => onEquipItem(item)}
                  className={styles.equipButton}
                  disabled={equipDisabled}
                  title={equipTooltip}
                >
                  Equip to Belt
                </button>
              </div>
            </Card>
          );
        }
        // Equipment and spell scroll rendering (existing logic)
        const isSpellScroll = item.type === 'scroll';
        const equipDisabled = isSpellScroll && !hasRobesEquipped;
        const equipTooltip =
          isSpellScroll && !hasRobesEquipped
            ? 'Equip a robe to use spell scrolls.'
            : undefined;
        return (
          <Card key={item.id} className={`${styles.itemCard} ${isSpellScroll ? styles.scrollCard : ''}`}>
            <div className={styles.itemHeader}>
              <h3 className={styles.itemName}>
                {item.type === 'scroll' && item.spell ? item.spell.name : item.name}
              </h3>
            </div>
            <div className={styles.itemImage}>
              <div style={{ fontSize: '24px' }}>
                {item.slot === 'head' && '🧢'}
                {item.slot === 'body' && (item.type === 'scroll' ? '📜' : '👕')}
                {item.slot === 'hand' && '🧤'}
                {item.slot === 'neck' && '📿'}
                {item.slot === 'finger' && '💍'}
                {item.slot === 'belt' && '🧶'}
              </div>
            </div>
            <div className={styles.itemDetails}>
              {item.type === 'scroll' && item.spell ? (
                <>
                  <div className={styles.spellType}>{item.spell.type}</div>
                  <div className={`${styles.rarity} ${styles[item.rarity]}`}>{item.rarity}</div>
                  <div className={styles.spellElement}>{item.spell.element}</div>
                  {item.quantity && item.quantity > 1 && (
                    <div className={styles.quantity}>x{item.quantity}</div>
                  )}
                </>
              ) : (
                <>
                  <div className={styles.slot}>{item.type === 'scroll' ? 'Robes' : item.slot}</div>
                  <div className={`${styles.rarity} ${styles[item.rarity]}`}>{item.rarity}</div>
                  {item.type && <div className={styles.type}>{item.type}</div>}
                  {item.quantity && item.quantity > 1 && (
                    <div className={styles.quantity}>x{item.quantity}</div>
                  )}
                </>
              )}
            </div>
            <div className={styles.bonuses}>
              {isSpellScroll ? (
                <>
                  <div className={styles.spellName}>Spell Scroll</div>
                  {item.spell && (
                    <div className={styles.spellDescription}>
                      {item.spell.description}
                    </div>
                  )}
                </>
              ) : (
                item.bonuses.map((bonus, index) => (
                  <div key={index} className={styles.bonus}>
                    {bonus.stat === 'health' && '❤️'}
                    {bonus.stat === 'mana' && '✨'}
                    {bonus.stat === 'defense' && '🛡️'}
                    {bonus.stat === 'maxHealth' && '❤️'}
                    {bonus.stat === 'maxMana' && '✨'}
                    {bonus.stat === 'spellPower' && '🔮'}
                    {bonus.stat === 'manaRegen' && '♻️'}
                    {bonus.stat === 'manaCostReduction' && '💧'}
                    {bonus.stat === 'mysticPunchPower' && '👊'}
                    {bonus.stat === 'bleedEffect' && '🩸'}
                    {bonus.stat === 'extraCardDraw' && '🃏'}
                    {bonus.stat === 'potionSlots' && '🧪'}
                    {bonus.stat === 'potionEffectiveness' && '✨'}
                    {bonus.stat === 'elementalAffinity' && '🌟'}
                    {bonus.stat}: {bonus.value > 0 ? `+${bonus.value}` : bonus.value}
                    {bonus.element && ` (${bonus.element})`}
                  </div>
                ))
              )}
            </div>
            <div className={styles.itemActions}>
              <button
                onClick={() => onEquipItem({
                  ...item,
                  slot: isSpellScroll ? 'body' : item.slot
                })}
                className={styles.equipButton}
                disabled={equipDisabled}
                title={equipTooltip}
              >
                {isSpellScroll ? 'Equip to Robes' : 'Equip'}
              </button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}