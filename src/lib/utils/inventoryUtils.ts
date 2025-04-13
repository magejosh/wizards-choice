/**
 * Utility functions for inventory management
 */
import { Equipment, Potion, SpellScroll } from '@/lib/types';

/**
 * Groups identical equipment items by name and type
 * @param items Array of equipment items
 * @returns Array of grouped equipment items with quantity
 */
export function groupEquipmentItems(items: Equipment[]): Equipment[] {
  if (!items || items.length === 0) return [];

  const groupedItems = new Map<string, Equipment>();

  items.forEach(item => {
    // Create a key based on name and other identifying properties
    const key = `${item.name}_${item.slot}_${item.rarity}_${item.type || ''}`;
    
    if (groupedItems.has(key)) {
      // If we already have this item, increment the quantity
      const existingItem = groupedItems.get(key)!;
      existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
      // Otherwise, add it to the map with quantity 1
      groupedItems.set(key, { ...item, quantity: 1 });
    }
  });

  return Array.from(groupedItems.values());
}

/**
 * Groups identical spell scrolls by spell name and rarity
 * @param scrolls Array of spell scrolls
 * @returns Array of grouped spell scrolls with quantity
 */
export function groupSpellScrolls(scrolls: SpellScroll[]): SpellScroll[] {
  if (!scrolls || scrolls.length === 0) return [];

  const groupedScrolls = new Map<string, SpellScroll>();

  scrolls.forEach(scroll => {
    // Create a key based on spell name and rarity
    const key = `${scroll.spell.name}_${scroll.rarity}`;
    
    if (groupedScrolls.has(key)) {
      // If we already have this scroll, increment the quantity
      const existingScroll = groupedScrolls.get(key)!;
      existingScroll.quantity = (existingScroll.quantity || 1) + 1;
    } else {
      // Otherwise, add it to the map with quantity 1
      groupedScrolls.set(key, { ...scroll, quantity: 1 });
    }
  });

  return Array.from(groupedScrolls.values());
}

/**
 * Groups identical potions by name, type, and rarity
 * @param potions Array of potions
 * @returns Array of grouped potions with quantity
 */
export function groupPotions(potions: Potion[]): Potion[] {
  if (!potions || potions.length === 0) return [];

  const groupedPotions = new Map<string, Potion>();

  potions.forEach(potion => {
    // Create a key based on name, type, and rarity
    const key = `${potion.name}_${potion.type}_${potion.rarity}`;
    
    if (groupedPotions.has(key)) {
      // If we already have this potion, increment the quantity
      const existingPotion = groupedPotions.get(key)!;
      existingPotion.quantity = (existingPotion.quantity || 1) + 1;
    } else {
      // Otherwise, add it to the map with quantity 1
      groupedPotions.set(key, { ...potion, quantity: 1 });
    }
  });

  return Array.from(groupedPotions.values());
}
