// src/lib/features/loot/lootSystem.ts
import { Wizard, Equipment, Ingredient, SpellScroll } from '../../types';
import { generateProceduralEquipment, generateLootEquipment } from '../procedural/equipmentGenerator';
import { generateRandomIngredient } from '../procedural/ingredientGenerator';
import { generateRandomSpellScroll } from '../scrolls/scrollSystem';
import { calculateWizardStats } from '../../wizard/wizardUtils';

/**
 * Represents a loot drop from defeating an enemy
 */
export interface LootDrop {
  equipment: Equipment[];
  ingredients: Ingredient[];
  scrolls: SpellScroll[];
  experience: number;
  gold?: number;
}

/**
 * Generate loot after defeating an enemy
 * @param playerWizard The player's wizard
 * @param enemyWizard The defeated enemy wizard
 * @param isWizardEnemy Whether the enemy was a wizard (true) or a magical creature (false)
 * @param difficulty The game difficulty
 * @returns Loot drop containing spells, equipment, ingredients, and experience
 */
export async function generateLoot(
  playerWizard: Wizard,
  enemyWizard: Wizard,
  isWizardEnemy: boolean = true,
  difficulty: 'easy' | 'normal' | 'hard' = 'normal'
): Promise<LootDrop> {
  // Generate equipment loot
  const equipment = generateEquipmentLoot(playerWizard, enemyWizard, isWizardEnemy, difficulty);

  // Generate ingredient loot
  const ingredients = generateIngredientLoot(playerWizard, enemyWizard, isWizardEnemy, difficulty);

  // Generate spell scroll loot
  const scrolls = await generateScrollLoot(playerWizard, enemyWizard, isWizardEnemy, difficulty);

  // Set experience to 0 since we're using calculateExperienceGained in combatStatusManager.ts instead
  const experience = 0;
  const goldAmount = calculateGoldReward(enemyWizard.level, isWizardEnemy, difficulty);

  // Ensure at least one gold or ingredient is awarded
  const finalIngredients = ingredients;
  let finalGold = goldAmount;
  if (finalGold <= 0 && finalIngredients.length === 0) {
    if (Math.random() < 0.5) {
      finalGold = 1;
    } else {
      finalIngredients.push(generateRandomIngredient(enemyWizard.level));
    }
  }

  return {
    equipment,
    ingredients: finalIngredients,
    scrolls,
    experience,
    gold: finalGold,
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
 * Calculate gold reward for defeating an enemy
 * @param enemyLevel The level of the defeated enemy
 * @param isWizardEnemy Whether the enemy was a wizard (true) or a magical creature (false)
 * @param difficulty The game difficulty
 * @returns Gold points rewarded
 */
function calculateGoldReward(
  enemyLevel: number,
  isWizardEnemy: boolean,
  difficulty: 'easy' | 'normal' | 'hard'
): number {
  let baseGold = enemyLevel * 5; // Base gold
  if (isWizardEnemy) {
    baseGold *= 1.2;
  }
  switch (difficulty) {
    case 'easy':
      baseGold *= 1.2;
      break;
    case 'hard':
      baseGold *= 0.8;
      break;
  }
  return Math.floor(baseGold);
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
async function generateScrollLoot(
  playerWizard: Wizard,
  enemyWizard: Wizard,
  isWizardEnemy: boolean,
  difficulty: 'easy' | 'normal' | 'hard'
): Promise<SpellScroll[]> {
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
    // Generate a scroll appropriate for the enemy's level
    scrolls.push(await generateRandomSpellScroll(enemyWizard.level));

    // Higher level enemies have a small chance to drop an additional scroll
    if (enemyWizard.level >= 10 && Math.random() < 0.2) {
      scrolls.push(await generateRandomSpellScroll(enemyWizard.level));
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
  console.log("Applying loot to player wizard:", loot);

  // Player's spells remain unchanged; scrolls allow learning manually
  const updatedSpells = [...playerWizard.spells];

  // Initialize inventory if it doesn't exist
  const updatedInventory = playerWizard.inventory ? [...playerWizard.inventory] : [];

  // Add equipment to wizard's inventory
  if (loot.equipment && loot.equipment.length > 0) {
    console.log("Adding equipment to inventory:", loot.equipment);

    // Ensure each equipment item has all required fields
    const formattedEquipment = loot.equipment.map(equipment => ({
      ...equipment,
      unlocked: true,
      equipped: false,
      bonuses: equipment.bonuses || []
    }));

    updatedInventory.push(...formattedEquipment);
  }

  // Add spell scrolls to wizard's inventory as equipment items
  if (loot.scrolls && loot.scrolls.length > 0) {
    console.log("Adding scrolls to inventory:", loot.scrolls);

    // Convert scrolls to equipment format
    const scrollsAsEquipment = loot.scrolls.map(scroll => ({
      id: scroll.id,
      name: scroll.name,
      slot: 'hand' as const,
      type: 'scroll' as const,
      rarity: scroll.rarity,
      bonuses: [],
      description: scroll.description,
      imagePath: scroll.imagePath || '/images/scrolls/default-scroll.jpg',
      spell: scroll.spell,
      unlocked: true,
      equipped: false
    }));

    updatedInventory.push(...scrollsAsEquipment);
  }

  // Add ingredients to wizard's collection
  const updatedIngredients = playerWizard.ingredients ? [...playerWizard.ingredients] : [];
  if (loot.ingredients && loot.ingredients.length > 0) {
    console.log("Adding ingredients:", loot.ingredients);

    for (const ingredient of loot.ingredients) {
      // Add quantity property if missing
      const formattedIngredient = {
        ...ingredient,
        quantity: ingredient.quantity || 1
      };

      const existingIndex = updatedIngredients.findIndex(i => i.id === ingredient.id);
      if (existingIndex >= 0) {
        // Update quantity of existing ingredient
        updatedIngredients[existingIndex].quantity += formattedIngredient.quantity;
      } else {
        // Add new ingredient
        updatedIngredients.push(formattedIngredient);
      }
    }
  }

  // Add gold to wizard's total (if any)
  const currentGold = playerWizard.gold || 0;
  const lootGold = loot.gold || 0;
  const updatedGold = currentGold + lootGold;

  if (lootGold > 0) {
    console.log(`Adding ${lootGold} gold to player (current: ${currentGold}, new total: ${updatedGold})`);
  }

  console.log("Updated inventory:", updatedInventory);
  console.log("Updated ingredients:", updatedIngredients);

  // Compose the updated wizard
  const updatedWizard: Wizard = {
    ...playerWizard,
    spells: updatedSpells,
    inventory: updatedInventory,
    ingredients: updatedIngredients,
    gold: updatedGold
  };

  // Recalculate stats after loot is applied
  return calculateWizardStats(updatedWizard);
}
