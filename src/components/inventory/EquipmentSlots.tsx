'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Equipment, EquipmentSlot } from '@/lib/types';
import styles from './EquipmentSlots.module.css';
import itemGridStyles from './ItemGrid.module.css';

interface EquipmentSlotsProps {
  equipment: Record<string, Equipment | undefined>;
  onEquipItem: (item: Equipment) => void;
  onUnequipItem: (slot: string) => void;
}

const SLOT_ORDER = [
  { key: 'head', label: 'Head' },
  { key: 'hand', label: 'Hand' },
  { key: 'body', label: 'Body' },
  { key: 'neck', label: 'Neck' },
  { key: 'finger1', label: 'Right Finger' },
  { key: 'finger2', label: 'Left Finger' },
  { key: 'belt', label: 'Belt' },
];

export function EquipmentSlots({
  equipment,
  onEquipItem,
  onUnequipItem,
}: EquipmentSlotsProps) {
  return (
    <div className={styles.equipmentSlots}>
      {SLOT_ORDER.map(({ key, label }) => {
        const item = equipment[key];
        return (
          <Card key={key} className={styles.slotCard}>
            <div className={styles.slotHeader}>
              <h3 className={styles.slotLabel}>{label}</h3>
            </div>
            <div className={styles.slotContent}>
              {item ? (
                <div className={itemGridStyles.itemCard} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className={itemGridStyles.itemHeader}>
                    <h3 className={itemGridStyles.itemName}>{item.name}</h3>
                  </div>
                  <div className={itemGridStyles.itemImage}>
                    <div style={{ fontSize: '24px' }}>
                      {item.slot === 'head' && '🧢'}
                      {item.slot === 'body' && (item.type === 'scroll' ? '📜' : '👕')}
                      {item.slot === 'hand' && '🧤'}
                      {item.slot === 'neck' && '📿'}
                      {item.slot === 'finger' && '💍'}
                      {item.slot === 'belt' && '🧶'}
                    </div>
                  </div>
                  <div className={itemGridStyles.itemDetails}>
                    <div className={itemGridStyles.slot}>{item.slot}</div>
                    <div className={`${itemGridStyles.rarity} ${itemGridStyles[item.rarity]}`}>{item.rarity}</div>
                    {item.type && <div className={itemGridStyles.type}>{item.type}</div>}
                  </div>
                  <div className={itemGridStyles.bonuses}>
                    {item.bonuses.map((bonus, index) => (
                      <div key={index} className={itemGridStyles.bonus}>
                        {bonus.stat === 'health' && '❤️'}
                        {bonus.stat === 'mana' && '✨'}
                        {bonus.stat === 'defense' && '🛡️'}
                        {bonus.stat === 'damage' && '⚔️'}
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
                    ))}
                  </div>
                  <div className={itemGridStyles.itemActions}>
                    <button
                      onClick={() => onUnequipItem(key)}
                      className={itemGridStyles.equipButton}
                    >
                      Unequip
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.emptySlot}>Empty</div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}