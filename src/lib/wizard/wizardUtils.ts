// src/lib/wizard/wizardUtils.ts
import { Wizard, Equipment } from '../types';
import { getAllSpells } from '../spells/spellData';

function isSpell(spell: unknown): spell is import('../types').Spell {
  return !!spell;
}

/**
 * Generates a default wizard with starting stats (ASYNC)
 * @param name The name of the wizard
 * @returns A new wizard object with default stats
 */
export async function generateDefaultWizardAsync(name: string): Promise<Wizard> {
  // Get all spells from XML
  const allSpells = await getAllSpells();
  // Always select the three intended starter spells by name
  const starterNames = ["Firebolt", "Arcane Shield", "Minor Healing"];
  const starterSpells = starterNames.map(n => allSpells.find(s => s.name === n)).filter(isSpell);
  if (starterSpells.length !== 3) throw new Error("One or more starter spells missing from XML");
  // Add two more random tier 1 spells (excluding the three core)
  const tier1Spells = allSpells.filter(s => s.tier === 1 && !starterNames.includes(s.name));
  const shuffled = tier1Spells.sort(() => Math.random() - 0.5);
  const extraSpells = shuffled.slice(0, 2);
  const defaultSpells: import('../types').Spell[] = [...starterSpells, ...extraSpells];
  // Equipped spells are always the three core starter spells
  const equippedSpells: import('../types').Spell[] = starterSpells;
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
    health: 100, // Deprecated, kept for compatibility
    mana: 100,   // Deprecated, kept for compatibility
    maxHealth: 100, // Deprecated, kept for compatibility
    maxMana: 100,   // Deprecated, kept for compatibility
    manaRegen: 1, // Base mana regen equals player level
    spells: defaultSpells,
    equippedSpells: equippedSpells,
    equipment: {}, // No equipment at start
    inventory: [], // No items in inventory at start
    potions: [], // No potions at start
    equippedPotions: [], // No equipped potions at start
    equippedSpellScrolls: [], // No equipped spell scrolls at start
    ingredients: [], // No ingredients at start
    discoveredRecipes: [], // No discovered recipes at start
    levelUpPoints: 0,
    gold: 100, // Starting gold
    skillPoints: 0,
    decks: [defaultDeck],
    activeDeckId: defaultDeckId,
    baseMaxHealth: 100,
    progressionMaxHealth: 0,
    equipmentMaxHealth: 0,
    totalMaxHealth: 100,
    baseMaxMana: 100,
    progressionMaxMana: 0,
    equipmentMaxMana: 0,
    totalMaxMana: 100,
  };
}

/**
 * Calculates the total stats for a wizard including equipment bonuses
 * @param wizard The wizard to calculate stats for
 * @returns The wizard with calculated total stats
 */
export function calculateWizardStats(wizard: Wizard): Wizard {
  const calculatedWizard = { ...wizard };

  // Calculate equipment bonuses
  let equipmentMaxHealth = 0;
  let equipmentMaxMana = 0;
  let totalManaRegen = wizard.level; // Base mana regen equals player level
  let totalMysticPunchPower = 5; // Base mystic punch power
  let totalBleedEffect = 0; // Base bleed effect
  let totalExtraCardDraw = 0; // Base extra card draw
  let canDiscardAndDraw = false; // Whether the wizard can discard and draw a card
  let totalPotionSlots = 0; // Total potion slots from belt
  let totalSpellPower = 0; // Base spell power

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
    if (Array.isArray(item.bonuses)) {
      // Sum all maxHealth bonuses
      equipmentMaxHealth += item.bonuses
        .filter(b => b.stat === 'maxHealth')
        .reduce((sum, b) => sum + b.value, 0);
      // Sum all maxMana bonuses
      equipmentMaxMana += item.bonuses
        .filter(b => b.stat === 'maxMana')
        .reduce((sum, b) => sum + b.value, 0);
      // Sum all manaRegen bonuses
      totalManaRegen += item.bonuses
        .filter(b => b.stat === 'manaRegen')
        .reduce((sum, b) => sum + b.value, 0);
      // Sum all mysticPunchPower bonuses
      totalMysticPunchPower += item.bonuses
        .filter(b => b.stat === 'mysticPunchPower')
        .reduce((sum, b) => sum + b.value, 0);
      // Sum all bleedEffect bonuses
      totalBleedEffect += item.bonuses
        .filter(b => b.stat === 'bleedEffect')
        .reduce((sum, b) => sum + b.value, 0);
      // Sum all extraCardDraw bonuses
      totalExtraCardDraw += item.bonuses
        .filter(b => b.stat === 'extraCardDraw')
        .reduce((sum, b) => sum + b.value, 0);
      // Sum all spellPower bonuses
      totalSpellPower += item.bonuses
        .filter(b => b.stat === 'spellPower')
        .reduce((sum, b) => sum + b.value, 0);
      // Check for discardAndDraw ability (not a StatBonus, but a direct property on the item)
      if ((item as any).discardAndDraw) {
        canDiscardAndDraw = true;
      }
      // Check for potion slots on belt
      if (item.slot === 'belt') {
        const potionSlotBonus = item.bonuses.find(b => b.stat === 'potionSlots');
        if (potionSlotBonus) {
          totalPotionSlots = potionSlotBonus.value;
        }
      }
    }
  });

  // Calculate total stats
  calculatedWizard.equipmentMaxHealth = equipmentMaxHealth;
  calculatedWizard.equipmentMaxMana = equipmentMaxMana;
  calculatedWizard.totalMaxHealth =
    (wizard.baseMaxHealth || 0) + (wizard.progressionMaxHealth || 0) + equipmentMaxHealth;
  calculatedWizard.totalMaxMana =
    (wizard.baseMaxMana || 0) + (wizard.progressionMaxMana || 0) + equipmentMaxMana;

  // For compatibility, set deprecated fields
  calculatedWizard.maxHealth = calculatedWizard.totalMaxHealth;
  calculatedWizard.maxMana = calculatedWizard.totalMaxMana;

  calculatedWizard.manaRegen = totalManaRegen;

  // Store combat-specific stats in a separate property to avoid polluting the core wizard object
  calculatedWizard.combatStats = {
    mysticPunchPower: totalMysticPunchPower,
    bleedEffect: totalBleedEffect,
    extraCardDraw: totalExtraCardDraw,
    canDiscardAndDraw: canDiscardAndDraw,
    potionSlots: totalPotionSlots,
    spellPower: totalSpellPower
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
