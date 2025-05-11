'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Equipment, Ingredient, Potion, SpellScroll } from '@/lib/types';
import { EquipmentSlots } from './EquipmentSlots';
import { ItemGrid } from './ItemGrid';
import { SpellScrolls } from './SpellScrolls';
import { Ingredients } from './Ingredients';
import { Potions } from './Potions';
import styles from './Inventory.module.css';

interface InventoryProps {
  equipment: Record<string, Equipment | undefined>;
  inventory: (Equipment | Potion)[];
  spellScrolls: SpellScroll[];
  equippedSpellScrolls: Equipment[];
  ingredients: Ingredient[];
  potions: Potion[];
  onEquipItem: (item: Equipment | Potion) => void;
  onUnequipItem: (slot: string) => void;
  onUseSpellScroll: (scroll: SpellScroll) => void;
  onEquipSpellScroll: (scroll: Equipment) => void;
  onUnequipSpellScroll: (scrollId: string) => void;
  onUsePotion: (potion: Potion) => void;
  onUseIngredient: (ingredient: Ingredient) => void;
}

export function Inventory({
  equipment,
  inventory,
  spellScrolls,
  equippedSpellScrolls,
  ingredients,
  potions,
  onEquipItem,
  onUnequipItem,
  onUseSpellScroll,
  onEquipSpellScroll,
  onUnequipSpellScroll,
  onUsePotion,
  onUseIngredient,
}: InventoryProps) {
  return (
    <Card className={styles.inventoryContainer}>
      <Tabs defaultValue="equipment" className={styles.tabs}>
        <TabsList className={styles.tabsList}>
          <TabsTrigger value="equipment" className={styles.tabsTrigger}>Equipment</TabsTrigger>
          <TabsTrigger value="items" className={styles.tabsTrigger}>Items</TabsTrigger>
          <TabsTrigger value="scrolls" className={styles.tabsTrigger}>Spell Scrolls</TabsTrigger>
          <TabsTrigger value="ingredients" className={styles.tabsTrigger}>Ingredients</TabsTrigger>
          <TabsTrigger value="potions" className={styles.tabsTrigger}>Potions</TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className={styles.tabContent}>
          <EquipmentSlots
            equipment={equipment}
            onEquipItem={onEquipItem}
            onUnequipItem={onUnequipItem}
          />
        </TabsContent>

        <TabsContent value="items" className={styles.tabContent}>
          <ItemGrid
            items={inventory}
            onEquipItem={onEquipItem}
          />
        </TabsContent>

        <TabsContent value="scrolls" className={styles.tabContent}>
          <SpellScrolls
            scrolls={spellScrolls}
            equippedSpellScrolls={equippedSpellScrolls}
            onUseScroll={onUseSpellScroll}
            onEquipScroll={onEquipSpellScroll}
            onUnequipScroll={onUnequipSpellScroll}
          />
        </TabsContent>

        <TabsContent value="ingredients" className={styles.tabContent}>
          <Ingredients
            ingredients={ingredients}
            onUseIngredient={onUseIngredient}
          />
        </TabsContent>

        <TabsContent value="potions" className={styles.tabContent}>
          <Potions
            potions={potions}
            onUsePotion={onUsePotion}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}