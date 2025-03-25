// src/lib/wizard/wizardUtils.ts
import { Wizard } from '../types';

/**
 * Generates a default wizard with starting stats
 * @param name The name of the wizard
 * @returns A new wizard object with default stats
 */
export function generateDefaultWizard(name: string): Wizard {
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
    spells: [], // Will be populated with default spells
    equippedSpells: [], // Will be populated with 3 selected spells
    equipment: {}, // No equipment at start
    levelUpPoints: 0,
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
  
  // Add equipment bonuses
  Object.values(wizard.equipment).forEach(item => {
    if (!item) return;
    
    item.bonuses.forEach(bonus => {
      switch (bonus.type) {
        case 'health':
          totalMaxHealth += bonus.value;
          break;
        case 'manaBoost':
          totalMaxMana += bonus.value;
          break;
        case 'manaRegen':
          totalManaRegen += bonus.value;
          break;
      }
    });
  });
  
  // Update the wizard with calculated stats
  calculatedWizard.maxHealth = totalMaxHealth;
  calculatedWizard.maxMana = totalMaxMana;
  calculatedWizard.manaRegen = totalManaRegen;
  
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
