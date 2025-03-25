'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Equipment, EquipmentSlot } from '@/lib/types';
import styles from './EquipmentSlots.module.css';

interface EquipmentSlotsProps {
  equipment: Record<string, Equipment | undefined>;
  onEquipItem: (item: Equipment) => void;
  onUnequipItem: (slot: string) => void;
}

const SLOT_LABELS: Record<EquipmentSlot, string> = {
  head: 'Head',
  hand: 'Hand',
  body: 'Body',
  neck: 'Neck',
  finger: 'Finger',
  belt: 'Belt',
};

export function EquipmentSlots({
  equipment,
  onEquipItem,
  onUnequipItem,
}: EquipmentSlotsProps) {
  return (
    <div className={styles.equipmentSlots}>
      {Object.entries(SLOT_LABELS).map(([slot, label]) => {
        const item = equipment[slot];
        return (
          <Card key={slot} className={styles.slotCard}>
            <div className={styles.slotHeader}>
              <h3 className={styles.slotLabel}>{label}</h3>
              {item && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUnequipItem(slot)}
                  className={styles.unequipButton}
                >
                  Unequip
                </Button>
              )}
            </div>
            <div className={styles.slotContent}>
              {item ? (
                <div className={styles.equippedItem}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemRarity}>{item.rarity}</div>
                  <div className={styles.itemBonuses}>
                    {item.bonuses.map((bonus, index) => (
                      <div key={index} className={styles.bonus}>
                        {bonus.stat}: {bonus.value}
                        {bonus.element && ` (${bonus.element})`}
                      </div>
                    ))}
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