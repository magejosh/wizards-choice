// src/lib/features/loot/lootSystem.ts
import { Wizard, Spell, Equipment, Ingredient, SpellScroll } from '../../types';
import { getAllSpells, getSpellsByTier } from '../../spells/spellData';
import { getRandomEquipment } from '../../equipment/equipmentData';
import { generateProceduralEquipment, generateLootEquipment } from '../procedural/equipmentGenerator';
import { generateRandomIngredient } from '../procedural/ingredientGenerator';
import { generateRandomSpellScroll } from '../scrolls/scrollSystem';

/**
 * Represents a loot drop from defeating an enemy
 */
export interface LootDrop {
  spells: Spell[];
  equipment: Equipment[];
  ingredients: Ingredient[];
  scrolls: SpellScroll[];
  experience: number;
}

/**
 * Generate loot after defeating an enemy
 * @param playerWizard The player's wizard
 * @param enemyWizard The defeated enemy wizard
 * @param isWizardEnemy Whether the enemy was a wizard (true) or a magical creature (false)
 * @param difficulty The game difficulty
 * @returns Loot drop containing spells, equipment, ingredients, and experience
 */
export function generateLoot(
  playerWizard: Wizard,
  enemyWizard: Wizard,
  isWizardEnemy: boolean = true,
  difficulty: 'easy' | 'normal' | 'hard' = 'normal'
): LootDrop {
  // Generate spell loot
  const spells = generateSpellLoot(playerWizard, enemyWizard, isWizardEnemy, difficulty);
  
  // Generate equipment loot
  const equipment = generateEquipmentLoot(playerWizard, enemyWizard, isWizardEnemy, difficulty);
  
  // Generate ingredient loot
  const ingredients = generateIngredientLoot(playerWizard, enemyWizard, isWizardEnemy, difficulty);
  
  // Generate spell scroll loot
  const scrolls = generateScrollLoot(playerWizard, enemyWizard, isWizardEnemy, difficulty);
  
  // Calculate experience reward
  const experience = calculateExperienceReward(enemyWizard.level, isWizardEnemy, difficulty);
  
  return {
    spells,
    equipment,
    ingredients,
    scrolls,
    experience
  };
}

/**
 * Calculate experience reward for defeating an enemy
 * @param enemyLevel The level of the defeated enemy
 * @param isWizardEnemy Whether the enemy was a wizard (true) or a magical creature (false)
 * @param difficulty The game difficulty
 * @returns Experience points rewarded
 */
function calculateExperienceReward(
  enemyLevel: number,
  isWizardEnemy: boolean,
  difficulty: 'easy' | 'normal' | 'hard'
): number {
  // Base experience is enemy level * 10
  let baseExperience = enemyLevel * 10;
  
  // Wizards give more experience than magical creatures
  if (isWizardEnemy) {
    baseExperience *= 1.5;
  }
  
  // Apply difficulty modifier
  switch (difficulty) {
    case 'easy':
      baseExperience *= 0.8; // 80% of base
      break;
    case 'normal':
      // No modification for normal
      break;
    case 'hard':
      baseExperience *= 1.3; // 130% of base
      break;
  }
  
  return Math.floor(baseExperience);
}

/**
 * Generates spell loot after defeating an enemy
 * @param playerWizard The player's wizard
 * @param enemyWizard The defeated enemy wizard
 * @param isWizardEnemy Whether the enemy was a wizard (true) or a magical creature (false)
 * @param difficulty The game difficulty
 * @returns Array of spell loot
 */
function generateSpellLoot(
  playerWizard: Wizard,
  enemyWizard: Wizard,
  isWizardEnemy: boolean,
  difficulty: 'easy' | 'normal' | 'hard'
): Spell[] {
  const lootSpells: Spell[] = [];
  
  // Determine number of spells to drop
  let spellDropCount = 0;
  
  if (isWizardEnemy) {
    // Wizards have higher chance to drop spells
    switch (difficulty) {
      case 'easy':
        spellDropCount = Math.floor(Math.random() * 2) + 1; // 1-2 spells
        break;
      case 'normal':
        spellDropCount = Math.random() < 0.7 ? 1 : 0; // 70% chance for 1 spell
        break;
      case 'hard':
        spellDropCount = Math.random() < 0.4 ? 1 : 0; // 40% chance for 1 spell
        break;
    }
    
    // Chance to get one of the enemy's spells
    if (spellDropCount > 0 && enemyWizard.equippedSpells.length > 0) {
      const randomEnemySpell = enemyWizard.equippedSpells[
        Math.floor(Math.random() * enemyWizard.equippedSpells.length)
      ];
      
      // Check if player already has this spell
      if (!playerWizard.spells.some(spell => spell.id === randomEnemySpell.id)) {
        lootSpells.push(randomEnemySpell);
        spellDropCount--;
      }
    }
  } else {
    // Magical creatures have lower chance to drop spells
    switch (difficulty) {
      case 'easy':
        spellDropCount = Math.random() < 0.7 ? 1 : 0; // 70% chance for 1 spell
        break;
      case 'normal':
        spellDropCount = Math.random() < 0.4 ? 1 : 0; // 40% chance for 1 spell
        break;
      case 'hard':
        spellDropCount = Math.random() < 0.2 ? 1 : 0; // 20% chance for 1 spell
        break;
    }
  }
  
  // Add random spells from appropriate tiers
  if (spellDropCount > 0) {
    // Determine max spell tier based on enemy level
    const maxTier = Math.min(Math.ceil(enemyWizard.level / 3), 10);
    
    // Get spells from appropriate tiers
    let availableSpells: Spell[] = [];
    for (let tier = 1; tier <= maxTier; tier++) {
      availableSpells = [...availableSpells, ...getSpellsByTier(tier)];
    }
    
    // Filter out spells the player already has
    availableSpells = availableSpells.filter(spell => 
      !playerWizard.spells.some(playerSpell => playerSpell.id === spell.id)
    );
    
    // Randomly select spells
    for (let i = 0; i < spellDropCount; i++) {
      if (availableSpells.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableSpells.length);
        lootSpells.push(availableSpells[randomIndex]);
        availableSpells.splice(randomIndex, 1);
      }
    }
  }
  
  return lootSpells;
}

/**
 * Generates equipment loot after defeating an enemy
 * @param playerWizard The player's wizard
 * @param enemyWizard The defeated enemy wizard
 * @param isWizardEnemy Whether the enemy was a wizard (true) or a magical creature (false)
 * @param difficulty The game difficulty
 * @returns Array of equipment loot
 */
function generateEquipmentLoot(
  playerWizard: Wizard,
  enemyWizard: Wizard,
  isWizardEnemy: boolean,
  difficulty: 'easy' | 'normal' | 'hard'
): Equipment[] {
  const lootEquipment: Equipment[] = [];
  
  // Determine chance to drop equipment
  let equipmentDropChance = 0;
  
  if (isWizardEnemy) {
    // Wizards have lower chance to drop equipment
    switch (difficulty) {
      case 'easy':
        equipmentDropChance = 0.5; // 50% chance
        break;
      case 'normal':
        equipmentDropChance = 0.3; // 30% chance
        break;
      case 'hard':
        equipmentDropChance = 0.15; // 15% chance
        break;
    }
  } else {
    // Magical creatures have higher chance to drop equipment
    switch (difficulty) {
      case 'easy':
        equipmentDropChance = 0.8; // 80% chance
        break;
      case 'normal':
        equipmentDropChance = 0.5; // 50% chance
        break;
      case 'hard':
        equipmentDropChance = 0.3; // 30% chance
        break;
    }
  }
  
  // Roll for equipment drop
  if (Math.random() < equipmentDropChance) {
    // Chance to get one of the enemy's equipment
    if (isWizardEnemy) {
      const enemyEquipment = Object.values(enemyWizard.equipment).filter(item => item !== undefined);
      
      if (enemyEquipment.length > 0) {
        const randomEnemyEquipment = enemyEquipment[
          Math.floor(Math.random() * enemyEquipment.length)
        ];
        
        lootEquipment.push(randomEnemyEquipment as Equipment);
      }
    } else {
      // Generate procedural equipment based on enemy level
      // Determine rarity chances based on enemy level and game difficulty
      let minRarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | undefined = undefined;
      
      // Higher level enemies have a chance to drop better equipment
      if (enemyWizard.level >= 20 && Math.random() < 0.1) {
        minRarity = 'legendary';
      } else if (enemyWizard.level >= 15 && Math.random() < 0.2) {
        minRarity = 'epic';
      } else if (enemyWizard.level >= 10 && Math.random() < 0.3) {
        minRarity = 'rare';
      } else if (enemyWizard.level >= 5 && Math.random() < 0.4) {
        minRarity = 'uncommon';
      }
      
      // Generate 1-2 equipment pieces for magical creatures
      const equipmentCount = Math.random() < 0.3 ? 2 : 1;
      lootEquipment.push(...generateLootEquipment(enemyWizard.level, equipmentCount, minRarity));
    }
  }
  
  return lootEquipment;
}

/**
 * Generates ingredient loot after defeating an enemy
 * @param playerWizard The player's wizard
 * @param enemyWizard The defeated enemy wizard
 * @param isWizardEnemy Whether the enemy was a wizard (true) or a magical creature (false)
 * @param difficulty The game difficulty
 * @returns Array of ingredient loot
 */
function generateIngredientLoot(
  playerWizard: Wizard,
  enemyWizard: Wizard,
  isWizardEnemy: boolean,
  difficulty: 'easy' | 'normal' | 'hard'
): Ingredient[] {
  const lootIngredients: Ingredient[] = [];
  
  // Determine number of ingredients to drop
  let ingredientDropCount = 0;
  let ingredientDropChance = 0;
  
  if (isWizardEnemy) {
    // Wizards have higher chance to drop ingredients
    switch (difficulty) {
      case 'easy':
        ingredientDropChance = 0.9; // 90% chance
        ingredientDropCount = Math.floor(Math.random() * 3) + 2; // 2-4 ingredients
        break;
      case 'normal':
        ingredientDropChance = 0.7; // 70% chance
        ingredientDropCount = Math.floor(Math.random() * 2) + 1; // 1-2 ingredients
        break;
      case 'hard':
        ingredientDropChance = 0.5; // 50% chance
        ingredientDropCount = Math.floor(Math.random() * 2) + 1; // 1-2 ingredients
        break;
    }
  } else {
    // Magical creatures have higher chance for ingredients
    switch (difficulty) {
      case 'easy':
        ingredientDropChance = 1.0; // 100% chance
        ingredientDropCount = Math.floor(Math.random() * 4) + 3; // 3-6 ingredients
        break;
      case 'normal':
        ingredientDropChance = 0.9; // 90% chance
        ingredientDropCount = Math.floor(Math.random() * 3) + 2; // 2-4 ingredients
        break;
      case 'hard':
        ingredientDropChance = 0.8; // 80% chance
        ingredientDropCount = Math.floor(Math.random() * 2) + 1; // 1-2 ingredients
        break;
    }
  }
  
  // Roll for ingredient drops
  if (Math.random() < ingredientDropChance) {
    // Generate random ingredients
    for (let i = 0; i < ingredientDropCount; i++) {
      lootIngredients.push(generateRandomIngredient(enemyWizard.level));
    }
  }
  
  return lootIngredients;
}

/**
 * Generates spell scroll loot after defeating an enemy
 * @param playerWizard The player's wizard
 * @param enemyWizard The defeated enemy wizard
 * @param isWizardEnemy Whether the enemy was a wizard (true) or a magical creature (false)
 * @param difficulty The game difficulty
 * @returns Array of spell scroll loot
 */
function generateScrollLoot(
  playerWizard: Wizard,
  enemyWizard: Wizard,
  isWizardEnemy: boolean,
  difficulty: 'easy' | 'normal' | 'hard'
): SpellScroll[] {
  const scrolls: SpellScroll[] = [];
  
  // Determine chance to drop scrolls
  let scrollDropChance = 0;
  
  if (isWizardEnemy) {
    // Wizards have higher chance to drop scrolls
    switch (difficulty) {
      case 'easy':
        scrollDropChance = 0.4; // 40% chance
        break;
      case 'normal':
        scrollDropChance = 0.25; // 25% chance
        break;
      case 'hard':
        scrollDropChance = 0.15; // 15% chance
        break;
    }
  } else {
    // Magical creatures have lower chance to drop scrolls
    switch (difficulty) {
      case 'easy':
        scrollDropChance = 0.2; // 20% chance
        break;
      case 'normal':
        scrollDropChance = 0.1; // 10% chance
        break;
      case 'hard':
        scrollDropChance = 0.05; // 5% chance
        break;
    }
  }
  
  // Check if we should drop a scroll
  if (Math.random() < scrollDropChance) {
    // Generate a scroll appropriate for the player's level
    scrolls.push(generateRandomSpellScroll(playerWizard.level));
    
    // Higher level enemies have a small chance to drop an additional scroll
    if (enemyWizard.level >= 10 && Math.random() < 0.2) {
      scrolls.push(generateRandomSpellScroll(playerWizard.level));
    }
  }
  
  return scrolls;
}

/**
 * Apply loot to the player's wizard
 * @param playerWizard The player's wizard
 * @param loot The loot to apply
 * @returns Updated wizard with loot applied
 */
export function applyLoot(playerWizard: Wizard, loot: LootDrop): Wizard {
  // Add spells to wizard's collection
  const updatedSpells = [...playerWizard.spells];
  for (const spell of loot.spells) {
    if (!updatedSpells.some(s => s.id === spell.id)) {
      updatedSpells.push(spell);
    }
  }
  
  // Add equipment to wizard's inventory
  const updatedInventory = playerWizard.inventory ? [...playerWizard.inventory] : [];
  updatedInventory.push(...loot.equipment);
  
  // Add ingredients to wizard's collection
  const updatedIngredients = playerWizard.ingredients ? [...playerWizard.ingredients] : [];
  for (const ingredient of loot.ingredients) {
    const existingIndex = updatedIngredients.findIndex(i => i.id === ingredient.id);
    if (existingIndex >= 0) {
      // Update the existing ingredient (would need a quantity field for this)
      // For now, we'll just add it as a duplicate
      updatedIngredients.push(ingredient);
    } else {
      updatedIngredients.push(ingredient);
    }
  }
  
  // Add spell scrolls to wizard's inventory
  updatedInventory.push(...loot.scrolls as any); // Cast to any since inventory is Equipment[]
  
  // Return updated wizard
  return {
    ...playerWizard,
    spells: updatedSpells,
    inventory: updatedInventory,
    ingredients: updatedIngredients,
    experience: playerWizard.experience + loot.experience
  };
}
