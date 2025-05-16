// src/lib/types/equipment-types.ts
// Equipment, potion, and inventory related types

import { ElementType } from './element-types';
import { Spell } from './spell-types';

/**
 * Equipment slot types
 */
export type EquipmentSlot = 'head' | 'hand' | 'body' | 'neck' | 'finger' | 'belt';

/**
 * Hand equipment types
 */
export type HandEquipment = 'wand' | 'staff' | 'dagger' | 'sword' | 'spellbook' | 'scroll';

/**
 * Potion types
 */
export type PotionType = 'health' | 'mana' | 'strength' | 'protection' | 'elemental' | 'luck';

/**
 * Rarity levels for items and ingredients
 */
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * Stat bonus configuration
 */
export interface StatBonus {
  stat:
    | 'health'
    | 'maxHealth'
    | 'mana'
    | 'maxMana'
    | 'damage'
    | 'defense'
    | 'spellPower'
    | 'manaRegen'
    | 'manaCostReduction'
    | 'mysticPunchPower'
    | 'bleedEffect'
    | 'extraCardDraw'
    | 'potionSlots'
    | 'potionEffectiveness'
    | 'elementalAffinity'
    | 'scrollSlots'
    // TODO: Effects overhaul - support these special stats
    | 'spellReuse'
    | 'damageBarrier'
    | 'criticalSpellcast'
    | 'spellVampirism';
  value: number;
  element?: ElementType; // For elemental affinity bonuses
}

/**
 * Equipment items
 */
export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  type?: HandEquipment; // For hand slot items
  rarity: Rarity;
  bonuses: StatBonus[];
  description: string;
  imagePath?: string;
  spell?: Spell; // For spell scrolls
  unlocked: boolean;
  equipped: boolean;
  unlockedDate?: Date;
  requiredLevel?: number;
  requiredAchievements?: string[];
  requiredStats?: { stat: string; value: number; }[];
  quantity?: number; // For stackable items
  bonus?: {
    health?: number;
    mana?: number;
    manaRegen?: number;
    damage?: number;
    defense?: number;
    criticalChance?: number;
    criticalDamage?: number;
    potionSlots?: number;
  };
}

/**
 * Consumable potions
 */
export interface Potion {
  id: string;
  name: string;
  type: PotionType;
  rarity: Rarity;
  effect: {
    value: number;
    duration?: number;
  };
  description: string;
  imagePath?: string;
  quantity?: number;
}

/**
 * Ingredient rarity determines how common ingredients are in loot drops
 * and affects the potency of potions created with them
 */
export type IngredientRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * Ingredient categories help organize ingredients by their properties
 */
export type IngredientCategory = 'herb' | 'crystal' | 'essence' | 'fungus' | 'catalyst' | 'core';

/**
 * Represents a potion crafting ingredient that can be gathered and used in recipes
 */
export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  rarity: IngredientRarity;
  description: string;
  properties: string[];
  effects: string[];
  quantity: number;
  imagePath?: string;
}

/**
 * Represents a discoverable potion crafting recipe
 */
export interface PotionRecipe {
  id: string;
  name: string;
  resultType: PotionType;
  resultTier: number;
  ingredients: {
    ingredientId: string;
    count: number;
  }[];
  discovered: boolean;
  description: string;
}