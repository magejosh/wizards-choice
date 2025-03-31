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
  experience: number;
  experienceToNextLevel: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  manaRegen: number;
  spells: Spell[];
  equippedSpells: Spell[];
  equipment: Record<string, Equipment | undefined>;
  inventory?: Equipment[];
  potions: Potion[];
  equippedPotions: Potion[];
  ingredients?: Ingredient[];
  discoveredRecipes?: PotionRecipe[];
  levelUpPoints: number;
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
  };
} 