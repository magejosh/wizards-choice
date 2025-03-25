import { v4 as uuidv4 } from 'uuid';
import { Wizard, Ingredient, PotionRecipe, Potion } from '../../types';
import { getAllPotionRecipes, getPotionRecipeById } from './potionRecipes';
import * as potionGenerator from '../procedural/potionGenerator';

/**
 * Check if the player has all ingredients needed for a recipe
 * @param wizard The wizard to check ingredients for
 * @param recipe The potion recipe to check
 * @returns True if the player has all ingredients, false otherwise
 */
export function hasIngredientsForRecipe(wizard: Wizard, recipe: PotionRecipe): boolean {
  if (!wizard.ingredients) return false;

  // Create a count of all player ingredients
  const playerIngredientCounts: Record<string, number> = {};
  wizard.ingredients.forEach(ingredient => {
    const id = ingredient.id;
    playerIngredientCounts[id] = (playerIngredientCounts[id] || 0) + 1;
  });

  // Check if player has enough of each ingredient
  for (const requiredIngredient of recipe.ingredients) {
    const { ingredientId, count } = requiredIngredient;
    if (!playerIngredientCounts[ingredientId] || playerIngredientCounts[ingredientId] < count) {
      return false;
    }
  }

  return true;
}

/**
 * Get all recipes that can be crafted with the player's current ingredients
 * @param wizard The wizard to check ingredients for
 * @returns Array of craftable recipes
 */
export function getCraftableRecipes(wizard: Wizard): PotionRecipe[] {
  if (!wizard.discoveredRecipes || !wizard.ingredients) return [];

  return wizard.discoveredRecipes
    .filter(recipe => recipe.discovered)
    .filter(recipe => hasIngredientsForRecipe(wizard, recipe));
}

/**
 * Get all recipes that the player has discovered
 * @param wizard The wizard to get discovered recipes for
 * @returns Array of discovered recipes
 */
export function getDiscoveredRecipes(wizard: Wizard): PotionRecipe[] {
  if (!wizard.discoveredRecipes) return [];
  return wizard.discoveredRecipes.filter(recipe => recipe.discovered);
}

/**
 * Get all recipes that the player has not yet discovered
 * @param wizard The wizard to get undiscovered recipes for
 * @returns Array of undiscovered recipes
 */
export function getUndiscoveredRecipes(wizard: Wizard): PotionRecipe[] {
  if (!wizard.discoveredRecipes) {
    // If player has no discovered recipes array yet, all recipes are undiscovered
    return getAllPotionRecipes();
  }
  
  const discoveredRecipeIds = new Set(wizard.discoveredRecipes.map(r => r.id));
  return getAllPotionRecipes().filter(recipe => !discoveredRecipeIds.has(recipe.id));
}

/**
 * Discover a recipe by ID
 * @param wizard The wizard to discover the recipe for
 * @param recipeId The ID of the recipe to discover
 * @returns Updated wizard with the recipe discovered, or undefined if recipe not found
 */
export function discoverRecipe(wizard: Wizard, recipeId: string): Wizard | undefined {
  const recipe = getPotionRecipeById(recipeId);
  if (!recipe) return undefined;

  const updatedWizard = { ...wizard };
  
  // Initialize discoveredRecipes array if it doesn't exist
  if (!updatedWizard.discoveredRecipes) {
    updatedWizard.discoveredRecipes = [];
  }
  
  // Check if player already has this recipe
  const existingRecipeIndex = updatedWizard.discoveredRecipes.findIndex(r => r.id === recipeId);
  
  if (existingRecipeIndex >= 0) {
    // Update existing recipe to be discovered
    const updatedRecipes = [...updatedWizard.discoveredRecipes];
    updatedRecipes[existingRecipeIndex] = {
      ...updatedRecipes[existingRecipeIndex],
      discovered: true
    };
    updatedWizard.discoveredRecipes = updatedRecipes;
  } else {
    // Add new discovered recipe
    updatedWizard.discoveredRecipes.push({
      ...recipe,
      discovered: true
    });
  }
  
  return updatedWizard;
}

/**
 * Attempt to discover a recipe by experimenting with ingredients
 * This method consumes the ingredients used in the experiment
 * 
 * @param wizard The wizard performing the experiment
 * @param ingredientIds Array of ingredient IDs to experiment with
 * @returns Object containing the updated wizard and result of the experiment
 */
export function experimentWithIngredients(
  wizard: Wizard,
  ingredientIds: string[]
): { 
  wizard: Wizard, 
  result: {
    success: boolean,
    message: string,
    discoveredRecipe?: PotionRecipe,
    potion?: Potion
  }
} {
  const updatedWizard = { ...wizard };
  
  // Check if the wizard has all the specified ingredients
  if (!updatedWizard.ingredients) {
    return {
      wizard: updatedWizard,
      result: { 
        success: false, 
        message: 'You don\'t have any ingredients to experiment with.'
      }
    };
  }
  
  const ingredientsMap: Record<string, Ingredient> = {};
  updatedWizard.ingredients.forEach(ingredient => {
    ingredientsMap[ingredient.id] = ingredient;
  });
  
  // Validate all ingredient IDs exist in the wizard's inventory
  for (const id of ingredientIds) {
    if (!ingredientsMap[id]) {
      return {
        wizard: updatedWizard,
        result: { 
          success: false, 
          message: `You don't have the ingredient with ID ${id}.`
        }
      };
    }
  }
  
  // Get all recipes (discovered and undiscovered)
  const allRecipes = getAllPotionRecipes();
  
  // Check if these exact ingredients match any known recipe
  const matchingRecipe = allRecipes.find(recipe => {
    // Check if ingredients count matches
    if (recipe.ingredients.length !== ingredientIds.length) {
      return false;
    }
    
    // For each ingredient in the recipe, check if it's in the experiment
    for (const { ingredientId, count } of recipe.ingredients) {
      // Count how many times this ingredient appears in the experiment
      const experimentCount = ingredientIds.filter(id => id === ingredientId).length;
      if (experimentCount !== count) {
        return false;
      }
    }
    
    return true;
  });
  
  // Remove used ingredients from inventory
  updatedWizard.ingredients = updatedWizard.ingredients.filter(ingredient => 
    !ingredientIds.includes(ingredient.id)
  );
  
  // If a matching recipe was found
  if (matchingRecipe) {
    // Discover the recipe
    const wizardWithRecipe = discoverRecipe(updatedWizard, matchingRecipe.id) || updatedWizard;
    
    // Create the potion
    let potion: Potion;
    switch (matchingRecipe.resultType) {
      case 'health':
        potion = potionGenerator.generateHealthPotion(matchingRecipe.resultTier);
        break;
      case 'mana':
        potion = potionGenerator.generateManaPotion(matchingRecipe.resultTier);
        break;
      case 'strength':
        potion = potionGenerator.generateStrengthPotion(matchingRecipe.resultTier);
        break;
      case 'protection':
        potion = potionGenerator.generateProtectionPotion(matchingRecipe.resultTier);
        break;
      case 'elemental':
        potion = potionGenerator.generateElementalPotion(matchingRecipe.resultTier);
        break;
      case 'luck':
        potion = potionGenerator.generateLuckPotion(matchingRecipe.resultTier);
        break;
      default:
        potion = potionGenerator.generateHealthPotion(matchingRecipe.resultTier);
    }
    
    // Add potion to inventory
    if (!wizardWithRecipe.potions) {
      wizardWithRecipe.potions = [];
    }
    wizardWithRecipe.potions.push(potion);
    
    return {
      wizard: wizardWithRecipe,
      result: {
        success: true,
        message: `Success! You discovered the recipe for ${matchingRecipe.name} and created the potion.`,
        discoveredRecipe: matchingRecipe,
        potion
      }
    };
  } else {
    // No matching recipe found, the experiment failed
    return {
      wizard: updatedWizard,
      result: {
        success: false,
        message: 'The experiment failed. The ingredients didn\'t form a known potion. Your ingredients were consumed in the process.'
      }
    };
  }
}

/**
 * Craft a potion from a known recipe
 * 
 * @param wizard The wizard crafting the potion
 * @param recipeId The ID of the recipe to craft
 * @returns Object containing the updated wizard and result of crafting
 */
export function craftPotion(
  wizard: Wizard,
  recipeId: string
): {
  wizard: Wizard,
  result: {
    success: boolean,
    message: string,
    potion?: Potion
  }
} {
  const updatedWizard = { ...wizard };
  
  // Check if the recipe exists and is discovered
  const discoveredRecipe = updatedWizard.discoveredRecipes?.find(
    r => r.id === recipeId && r.discovered
  );
  
  if (!discoveredRecipe) {
    return {
      wizard: updatedWizard,
      result: {
        success: false,
        message: 'You haven\'t discovered this recipe yet.'
      }
    };
  }
  
  // Check if the wizard has all the required ingredients
  if (!hasIngredientsForRecipe(updatedWizard, discoveredRecipe)) {
    return {
      wizard: updatedWizard,
      result: {
        success: false,
        message: 'You don\'t have all the required ingredients for this recipe.'
      }
    };
  }
  
  // Remove ingredients from inventory
  if (updatedWizard.ingredients) {
    for (const { ingredientId, count } of discoveredRecipe.ingredients) {
      let remainingToRemove = count;
      
      // Remove the required count of each ingredient
      updatedWizard.ingredients = updatedWizard.ingredients.filter(ingredient => {
        if (ingredient.id === ingredientId && remainingToRemove > 0) {
          remainingToRemove--;
          return false; // Remove this ingredient
        }
        return true; // Keep this ingredient
      });
    }
  }
  
  // Create the potion
  let potion: Potion;
  switch (discoveredRecipe.resultType) {
    case 'health':
      potion = potionGenerator.generateHealthPotion(discoveredRecipe.resultTier);
      break;
    case 'mana':
      potion = potionGenerator.generateManaPotion(discoveredRecipe.resultTier);
      break;
    case 'strength':
      potion = potionGenerator.generateStrengthPotion(discoveredRecipe.resultTier);
      break;
    case 'protection':
      potion = potionGenerator.generateProtectionPotion(discoveredRecipe.resultTier);
      break;
    case 'elemental':
      potion = potionGenerator.generateElementalPotion(discoveredRecipe.resultTier);
      break;
    case 'luck':
      potion = potionGenerator.generateLuckPotion(discoveredRecipe.resultTier);
      break;
    default:
      potion = potionGenerator.generateHealthPotion(discoveredRecipe.resultTier);
  }
  
  // Add potion to inventory
  if (!updatedWizard.potions) {
    updatedWizard.potions = [];
  }
  updatedWizard.potions.push(potion);
  
  return {
    wizard: updatedWizard,
    result: {
      success: true,
      message: `You successfully crafted a ${potion.name}.`,
      potion
    }
  };
} 