// src/lib/wizard/wizardUtils.ts
import { Wizard, Equipment } from '../types';
import { getDefaultSpells } from '../spells/spellData';

/**
 * Generates a default wizard with starting stats
 * @param name The name of the wizard
 * @returns A new wizard object with default stats
 */
export function generateDefaultWizard(name: string): Wizard {
  // Get default spells for the wizard
  const defaultSpells = getDefaultSpells();

  // Select the first 3 spells for the equipped spells
  const equippedSpells = defaultSpells.slice(0, 3);

  // Create a default deck
  const defaultDeckId = `deck_default_${Date.now()}`;
  const defaultDeck = {
    id: defaultDeckId,
    name: 'Starter Deck',
    spells: defaultSpells,
    dateCreated: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };

  return {
    id: `wizard_${Date.now()}`,
    name: name || 'Unnamed Wizard',
    level: 1,
    experience: 0,
    experienceToNextLevel: 100, // Level 1 * 100
    health: 100,
    maxHealth: 100,
    mana: 100,
    maxMana: 100,
    manaRegen: 1, // Base mana regen equals player level
    spells: defaultSpells,
    equippedSpells: equippedSpells,
    equipment: {}, // No equipment at start
    inventory: [], // No items in inventory at start
    potions: [], // No potions at start
    equippedPotions: [], // No equipped potions at start
    ingredients: [], // No ingredients at start
    discoveredRecipes: [], // No discovered recipes at start
    levelUpPoints: 0,
    gold: 100, // Starting gold
    skillPoints: 0,
    decks: [defaultDeck],
    activeDeckId: defaultDeckId,
  };
}

/**
 * Calculates the total stats for a wizard including equipment bonuses
 * @param wizard The wizard to calculate stats for
 * @returns The wizard with calculated total stats
 */
export function calculateWizardStats(wizard: Wizard): Wizard {
  const calculatedWizard = { ...wizard };

  // Start with base stats
  let totalMaxHealth = wizard.maxHealth;
  let totalMaxMana = wizard.maxMana;
  let totalManaRegen = wizard.level; // Base mana regen equals player level
  let totalMysticPunchPower = 5; // Base mystic punch power
  let totalBleedEffect = 0; // Base bleed effect
  let totalExtraCardDraw = 0; // Base extra card draw
  let canDiscardAndDraw = false; // Whether the wizard can discard and draw a card
  let totalPotionSlots = 0; // Total potion slots from belt

  // Process equipped items by slot
  const equipment = wizard.equipment;

  // Array of all equipped items
  const equippedItems = [
    equipment.head,
    equipment.hand,
    equipment.body,
    equipment.neck,
    equipment.finger1,
    equipment.finger2,
    equipment.belt
  ].filter(Boolean) as Equipment[];

  // Add equipment bonuses
  equippedItems.forEach(item => {
    // Add maxHealth bonus
    if (item.bonuses.maxHealth) {
      totalMaxHealth += item.bonuses.maxHealth;
    }

    // Add maxMana bonus
    if (item.bonuses.maxMana) {
      totalMaxMana += item.bonuses.maxMana;
    }

    // Add manaRegen bonus
    if (item.bonuses.manaRegen) {
      totalManaRegen += item.bonuses.manaRegen;
    }

    // Add mystic punch power
    if (item.bonuses.mysticPunchPower) {
      totalMysticPunchPower += item.bonuses.mysticPunchPower;
    }

    // Add bleed effect
    if (item.bonuses.bleedEffect) {
      totalBleedEffect += item.bonuses.bleedEffect;
    }

    // Add extra card draw
    if (item.bonuses.extraCardDraw) {
      totalExtraCardDraw += item.bonuses.extraCardDraw;
    }

    // Check for discard and draw ability
    if (item.bonuses.discardAndDraw) {
      canDiscardAndDraw = true;
    }

    // Check for potion slots on belt
    if (item.slot === 'belt' && item.bonuses.potionSlots) {
      totalPotionSlots = item.bonuses.potionSlots;
    }
  });

  // Update the wizard with calculated stats
  calculatedWizard.maxHealth = totalMaxHealth;
  calculatedWizard.maxMana = totalMaxMana;
  calculatedWizard.manaRegen = totalManaRegen;

  // Store combat-specific stats in a separate property to avoid polluting the core wizard object
  calculatedWizard.combatStats = {
    mysticPunchPower: totalMysticPunchPower,
    bleedEffect: totalBleedEffect,
    extraCardDraw: totalExtraCardDraw,
    canDiscardAndDraw: canDiscardAndDraw,
    potionSlots: totalPotionSlots
  };

  return calculatedWizard;
}

/**
 * Calculates the experience needed for a given level
 * @param level The level to calculate experience for
 * @returns The amount of experience needed to reach the next level
 */
export function calculateExperienceForLevel(level: number): number {
  return level * 100;
}

/**
 * Calculates the level up points awarded based on difficulty
 * @param difficulty The game difficulty
 * @returns The number of level up points to award
 */
export function calculateLevelUpPoints(difficulty: 'easy' | 'normal' | 'hard'): number {
  switch (difficulty) {
    case 'easy':
      return 1;
    case 'normal':
      return 2;
    case 'hard':
      return 5;
    default:
      return 2;
  }
}
