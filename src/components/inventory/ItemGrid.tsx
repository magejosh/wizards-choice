'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Equipment } from '@/lib/types';
import styles from './ItemGrid.module.css';

interface ItemGridProps {
  items: Equipment[];
  onEquipItem: (item: Equipment) => void;
}

export function ItemGrid({ items, onEquipItem }: ItemGridProps) {
  if (items.length === 0) {
    return (
      <div className={styles.emptyInventory}>
        Your inventory is empty
      </div>
    );
  }

  return (
    <div className={styles.itemGrid}>
      {items.map((item) => (
        <Card key={item.id} className={`${styles.itemCard} ${item.type === 'scroll' ? styles.scrollCard : ''}`}>


          <div className={styles.itemHeader}>
            <h3 className={styles.itemName}>
              {item.type === 'scroll' && item.spell ? item.spell.name : item.name}
            </h3>
          </div>

          <div className={styles.itemImage}>
            {/* Placeholder for item image */}
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
            {item.type === 'scroll' ? (
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
                  {bonus.stat === 'attack' && '⚔️'}
                  {bonus.stat === 'elementalDamage' && '🔮'}
                  {bonus.stat === 'critChance' && '🎯'}
                  {bonus.stat === 'critDamage' && '💥'}
                  {bonus.stat === 'manaRegen' && '♻️'}
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
                slot: item.type === 'scroll' ? 'body' : item.slot // Change slot to 'body' (robe) for scrolls
              })}
              className={styles.equipButton}
            >
              {item.type === 'scroll' ? 'Equip to Robes' : 'Equip'}
            </button>
          </div>
        </Card>
      ))}
    </div>
  );
}