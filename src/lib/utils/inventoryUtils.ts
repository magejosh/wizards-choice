/**
 * Utility functions for inventory management
 */
import { Equipment, Potion, SpellScroll, Ingredient } from '@/lib/types';

/**
 * Generic grouping utility for inventory items
 * @param items Array of items
 * @param getKey Function to generate a grouping key from an item
 * @returns Array of grouped items with quantity
 */
export function groupInventoryItems<T extends { quantity?: number }>(
  items: T[],
  getKey: (item: T) => string
): T[] {
  if (!items || items.length === 0) return [];

  const groupedItems = new Map<string, T>();

  items.forEach(item => {
    const key = getKey(item);
    if (groupedItems.has(key)) {
      const existingItem = groupedItems.get(key)!;
      groupedItems.set(key, { ...existingItem, quantity: (existingItem.quantity || 1) + (item.quantity || 1) });
    } else {
      groupedItems.set(key, { ...item, quantity: item.quantity || 1 });
    }
  });

  return Array.from(groupedItems.values());
}

/**
 * Groups identical equipment items by name and type
 */
export function groupEquipmentItems(items: Equipment[]): Equipment[] {
  return groupInventoryItems(items, item => `${item.name}_${item.slot}_${item.rarity}_${item.type || ''}`);
}

/**
 * Groups identical spell scrolls by spell name and rarity
 */
export function groupSpellScrolls(scrolls: SpellScroll[]): SpellScroll[] {
  return groupInventoryItems(scrolls, scroll => `${scroll.spell.name}_${scroll.rarity}`);
}

/**
 * Groups identical potions by name, type, and rarity
 */
export function groupPotions(potions: Potion[]): Potion[] {
  return groupInventoryItems(potions, potion => `${potion.name}_${potion.type}_${potion.rarity}`);
}

/**
 * Groups identical ingredients by name, category, and rarity
 */
export function groupIngredients(ingredients: Ingredient[]): Ingredient[] {
  return groupInventoryItems(ingredients, ingredient => `${ingredient.name}_${ingredient.category}_${ingredient.rarity}`);
}
