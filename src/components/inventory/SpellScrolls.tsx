'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { SpellScroll, Equipment } from '@/lib/types';
import styles from './SpellScrolls.module.css';

interface SpellScrollsProps {
  scrolls: SpellScroll[];
  equippedSpellScrolls: Equipment[];
  onUseScroll: (scroll: SpellScroll) => void;
  onEquipScroll: (scroll: Equipment) => void;
  onUnequipScroll: (scrollId: string) => void;
}

export function SpellScrolls({ scrolls, equippedSpellScrolls, onUseScroll, onEquipScroll, onUnequipScroll }: SpellScrollsProps) {
  // Get slot limit from equipped robe
  const player = require('@/lib/game-state/gameStateStore').getWizard();
  const robe = player?.equipment.body;
  const slotBonus = robe?.bonuses?.find(b => b.stat === 'scrollSlots');
  const maxScrollSlots = slotBonus ? slotBonus.value : 0;
  const slotsUsed = equippedSpellScrolls.length;
  const canEquipMore = robe && slotsUsed < maxScrollSlots;

  return (
    <div>
      <div className={styles.equippedScrollsHeader}>
        <strong>Equipped Spell Scrolls ({slotsUsed}/{maxScrollSlots})</strong>
      </div>
      <div className={styles.equippedScrollsGrid}>
        {equippedSpellScrolls.length === 0 ? (
          <div className={styles.emptyScrolls}>No spell scrolls equipped</div>
        ) : (
          equippedSpellScrolls.map(scroll => (
            <Card key={scroll.id} className={styles.scrollCard}>
              <div className={styles.scrollHeader}>
                <h3 className={styles.scrollName}>{scroll.spell?.name || scroll.name}</h3>
              </div>
              <div className={styles.scrollImage}></div>
              <div className={styles.spellInfo}>
                <div className={styles.spellName}>Spell Scroll</div>
                <div className={styles.spellDetails}>
                  <span className={styles.spellType}>{scroll.spell?.type}</span>
                  <span className={`${styles.rarity} ${styles[scroll.rarity]}`}>{scroll.rarity}</span>
                  <span className={styles.spellElement}>{scroll.spell?.element}</span>
                </div>
                <div className={styles.spellDescription}>{scroll.spell?.description}</div>
              </div>
              <div className={styles.scrollActions}>
                <button
                  onClick={() => onUnequipScroll(scroll.id)}
                  className={styles.useButton}
                >
                  Unequip
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
      <hr className={styles.scrollDivider} />
      <div className={styles.unequippedScrollsHeader}>
        <strong>Unequipped Spell Scrolls</strong>
      </div>
      <div className={styles.scrollGrid}>
        {scrolls.length === 0 ? (
          <div className={styles.emptyScrolls}>You have no spell scrolls</div>
        ) : (
          scrolls.map((scroll) => {
            const quantity = (scroll as any).quantity || 1;
            return (
              <Card key={scroll.id} className={styles.scrollCard}>
                <div className={styles.scrollHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className={styles.scrollName} style={{ flex: 1, textAlign: 'left' }}>{scroll.spell.name}</h3>
                  {quantity > 1 && (
                    <span className={styles.quantity} style={{ marginLeft: 4 }}>x{quantity}</span>
                  )}
                </div>
                <div className={styles.scrollImage}></div>
                <div className={styles.spellInfo}>
                  <div className={styles.spellName}>Spell Scroll</div>
                  <div className={styles.spellDetails}>
                    <span className={styles.spellType}>{scroll.spell.type}</span>
                    <span className={`${styles.rarity} ${styles[scroll.rarity]}`}>{scroll.rarity}</span>
                    <span className={styles.spellElement}>{scroll.spell.element}</span>
                  </div>
                  <div className={styles.spellDescription}>{scroll.spell.description}</div>
                </div>
                <div className={styles.scrollActions}>
                  <button
                    onClick={() => onUseScroll(scroll)}
                    className={styles.useButton}
                  >
                    Learn Spell
                  </button>
                  <button
                    onClick={() => {
                      if ((quantity) > 1) {
                        // Equip a single scroll (let state handle stack decrement)
                        const singleScroll = { ...scroll, id: `${scroll.id}-eq-${Date.now()}`, quantity: 1 };
                        onEquipScroll(singleScroll as unknown as Equipment);
                      } else {
                        onEquipScroll(scroll as unknown as Equipment);
                      }
                    }}
                    className={styles.useButton}
                    disabled={!canEquipMore}
                    title={robe ? (canEquipMore ? '' : 'No available robe slots') : 'Equip a robe to use spell scrolls'}
                  >
                    Equip to Robes
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}