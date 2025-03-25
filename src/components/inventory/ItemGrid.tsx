'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
        <Card key={item.id} className={styles.itemCard}>
          <div className={styles.itemHeader}>
            <h3 className={styles.itemName}>{item.name}</h3>
            <span className={`${styles.rarity} ${styles[item.rarity]}`}>
              {item.rarity}
            </span>
          </div>
          
          <div className={styles.itemDetails}>
            <div className={styles.slot}>
              Slot: {item.slot}
            </div>
            {item.type && (
              <div className={styles.type}>
                Type: {item.type}
              </div>
            )}
          </div>

          <div className={styles.bonuses}>
            {item.bonuses.map((bonus, index) => (
              <div key={index} className={styles.bonus}>
                {bonus.stat}: {bonus.value}
                {bonus.element && ` (${bonus.element})`}
              </div>
            ))}
          </div>

          <div className={styles.itemActions}>
            <Button
              variant="default"
              size="sm"
              onClick={() => onEquipItem(item)}
              className={styles.equipButton}
            >
              Equip
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
} 