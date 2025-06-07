// src/lib/types/wizard-types.ts
// Wizard character types and interfaces

import { Equipment, Ingredient, Potion, PotionRecipe } from './equipment-types';
import { Spell } from './spell-types';

/**
 * The player's wizard character
 */
export interface Wizard {
  id: string;
  name: string;
  level: number;
  /** Optional path to a 3D model for rendering this wizard */
  modelPath?: string;
  experience: number;
  experienceToNextLevel: number;
  /** @deprecated Use totalMaxHealth instead. */
  health: number;
  /** @deprecated Use totalMaxMana instead. */
  mana: number;
  maxHealth: number;
  maxMana: number;
  manaRegen: number;
  spells: Spell[];
  equippedSpells: Spell[];
  equipment: Record<string, Equipment | undefined>;
  inventory?: Equipment[];
  potions: Potion[];
  equippedPotions: Potion[];
  equippedSpellScrolls: Equipment[];
  ingredients?: Ingredient[];
  discoveredRecipes?: PotionRecipe[];
  levelUpPoints: number;
  gold: number;
  skillPoints?: number;
  decks?: {
    id: string;
    name: string;
    spells: Spell[];
    dateCreated: string;
    lastModified: string;
  }[];
  activeDeckId?: string | null;
  combatStats?: {
    mysticPunchPower?: number;
    bleedEffect?: number;
    extraCardDraw?: number;
    canDiscardAndDraw?: boolean;
    potionSlots?: number;
    spellPower?: number;
  };
  /**
   * Stat structure for robust calculation:
   * - baseMaxHealth/baseMaxMana: True base stat, only changed by rare effects or admin tools
   * - progressionMaxHealth/progressionMaxMana: Permanent upgrades from level-ups, quests, etc.
   * - equipmentMaxHealth/equipmentMaxMana: Sum of all currently equipped item bonuses
   * - totalMaxHealth/totalMaxMana: Sum of all the above, used for display and combat
   *
   * maxHealth/maxMana are deprecated and will be removed after migration.
   */
  baseMaxHealth: number;
  progressionMaxHealth: number;
  equipmentMaxHealth: number;
  totalMaxHealth: number;
  baseMaxMana: number;
  progressionMaxMana: number;
  equipmentMaxMana: number;
  totalMaxMana: number;
}