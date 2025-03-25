import { v4 as uuidv4 } from 'uuid';
import { PotionRecipe, PotionType } from '../../types';
import { HERB_INGREDIENTS } from '../procedural/ingredientGenerator';

/**
 * Generate a unique ID for a potion recipe
 */
function generateRecipeId(name: string): string {
  return `recipe_${name.toLowerCase().replace(/\s+/g, '_')}_${uuidv4().slice(0, 8)}`;
}

/**
 * Base recipes for health potions of different tiers
 */
export const HEALTH_POTION_RECIPES: PotionRecipe[] = [
  {
    id: generateRecipeId('Minor Health Potion'),
    name: 'Minor Health Potion',
    resultType: 'health',
    resultTier: 1,
    ingredients: [
      { ingredientId: 'ingredient_blueleaf', count: 2 },
      { ingredientId: 'ingredient_sunvine', count: 1 },
    ],
    discovered: false,
    description: 'A basic recipe for a minor health potion that restores a small amount of health.'
  },
  {
    id: generateRecipeId('Health Potion'),
    name: 'Health Potion',
    resultType: 'health',
    resultTier: 2,
    ingredients: [
      { ingredientId: 'ingredient_sunvine', count: 2 },
      { ingredientId: 'ingredient_ruby_shard', count: 1 },
      { ingredientId: 'ingredient_unicorn_horn', count: 1 },
    ],
    discovered: false,
    description: 'A standard health potion recipe that provides moderate healing.'
  },
  {
    id: generateRecipeId('Greater Health Potion'),
    name: 'Greater Health Potion',
    resultType: 'health',
    resultTier: 3,
    ingredients: [
      { ingredientId: 'ingredient_phoenix_essence', count: 1 },
      { ingredientId: 'ingredient_sunvine', count: 3 },
      { ingredientId: 'ingredient_unicorn_horn', count: 1 },
    ],
    discovered: false,
    description: 'A powerful healing potion that restores a significant amount of health.'
  },
  {
    id: generateRecipeId('Superior Health Potion'),
    name: 'Superior Health Potion',
    resultType: 'health',
    resultTier: 4,
    ingredients: [
      { ingredientId: 'ingredient_phoenix_feather', count: 1 },
      { ingredientId: 'ingredient_phoenix_essence', count: 2 },
      { ingredientId: 'ingredient_unicorn_horn', count: 2 },
      { ingredientId: 'ingredient_philosopher_stone_fragment', count: 1 },
    ],
    discovered: false,
    description: 'An exceptional healing potion that offers powerful restoration effects.'
  },
  {
    id: generateRecipeId('Supreme Health Potion'),
    name: 'Supreme Health Potion',
    resultType: 'health',
    resultTier: 5,
    ingredients: [
      { ingredientId: 'ingredient_phoenix_feather', count: 2 },
      { ingredientId: 'ingredient_dragon_heart', count: 1 },
      { ingredientId: 'ingredient_unicorn_horn', count: 3 },
      { ingredientId: 'ingredient_philosopher_stone_fragment', count: 2 },
    ],
    discovered: false,
    description: 'The ultimate healing potion, providing near-complete restoration of health.'
  },
];

/**
 * Base recipes for mana potions of different tiers
 */
export const MANA_POTION_RECIPES: PotionRecipe[] = [
  {
    id: generateRecipeId('Minor Mana Potion'),
    name: 'Minor Mana Potion',
    resultType: 'mana',
    resultTier: 1,
    ingredients: [
      { ingredientId: 'ingredient_moonsage', count: 2 },
      { ingredientId: 'ingredient_azurite', count: 1 },
    ],
    discovered: false,
    description: 'A basic recipe for a minor mana potion that restores a small amount of mana.'
  },
  {
    id: generateRecipeId('Mana Potion'),
    name: 'Mana Potion',
    resultType: 'mana',
    resultTier: 2,
    ingredients: [
      { ingredientId: 'ingredient_moonsage', count: 2 },
      { ingredientId: 'ingredient_amethyst_fragment', count: 1 },
      { ingredientId: 'ingredient_ethereal_essence', count: 1 },
    ],
    discovered: false,
    description: 'A standard mana potion recipe that provides moderate mana restoration.'
  },
  {
    id: generateRecipeId('Greater Mana Potion'),
    name: 'Greater Mana Potion',
    resultType: 'mana',
    resultTier: 3,
    ingredients: [
      { ingredientId: 'ingredient_ethereal_essence', count: 2 },
      { ingredientId: 'ingredient_moonsage', count: 3 },
      { ingredientId: 'ingredient_amethyst_fragment', count: 2 },
    ],
    discovered: false,
    description: 'A powerful mana potion that restores a significant amount of magical energy.'
  },
  {
    id: generateRecipeId('Superior Mana Potion'),
    name: 'Superior Mana Potion',
    resultType: 'mana',
    resultTier: 4,
    ingredients: [
      { ingredientId: 'ingredient_kraken_ink', count: 1 },
      { ingredientId: 'ingredient_ethereal_essence', count: 3 },
      { ingredientId: 'ingredient_amethyst_fragment', count: 2 },
      { ingredientId: 'ingredient_arcane_dust', count: 2 },
    ],
    discovered: false,
    description: 'An exceptional mana potion that offers powerful magical energy restoration.'
  },
  {
    id: generateRecipeId('Supreme Mana Potion'),
    name: 'Supreme Mana Potion',
    resultType: 'mana',
    resultTier: 5,
    ingredients: [
      { ingredientId: 'ingredient_kraken_ink', count: 2 },
      { ingredientId: 'ingredient_dragon_heart', count: 1 },
      { ingredientId: 'ingredient_ethereal_essence', count: 3 },
      { ingredientId: 'ingredient_philosopher_stone_fragment', count: 2 },
    ],
    discovered: false,
    description: 'The ultimate mana potion, providing near-complete restoration of magical energy.'
  },
];

/**
 * Base recipes for strength potions of different tiers
 */
export const STRENGTH_POTION_RECIPES: PotionRecipe[] = [
  {
    id: generateRecipeId('Minor Strength Potion'),
    name: 'Minor Strength Potion',
    resultType: 'strength',
    resultTier: 1,
    ingredients: [
      { ingredientId: 'ingredient_dragonwort', count: 2 },
      { ingredientId: 'ingredient_ruby_shard', count: 1 },
    ],
    discovered: false,
    description: 'A basic recipe for a minor strength potion that temporarily increases spell damage.'
  },
  // Add more strength potion recipes for tiers 2-5 here
];

/**
 * Base recipes for protection potions of different tiers
 */
export const PROTECTION_POTION_RECIPES: PotionRecipe[] = [
  {
    id: generateRecipeId('Minor Protection Potion'),
    name: 'Minor Protection Potion',
    resultType: 'protection',
    resultTier: 1,
    ingredients: [
      { ingredientId: 'ingredient_whisperweed', count: 2 },
      { ingredientId: 'ingredient_emerald_dust', count: 1 },
    ],
    discovered: false,
    description: 'A basic recipe for a minor protection potion that temporarily reduces incoming damage.'
  },
  // Add more protection potion recipes for tiers 2-5 here
];

/**
 * Base recipes for elemental potions of different tiers
 */
export const ELEMENTAL_POTION_RECIPES: PotionRecipe[] = [
  {
    id: generateRecipeId('Minor Elemental Potion'),
    name: 'Minor Elemental Potion',
    resultType: 'elemental',
    resultTier: 1,
    ingredients: [
      { ingredientId: 'ingredient_stormroot', count: 1 },
      { ingredientId: 'ingredient_topaz_grain', count: 1 },
      { ingredientId: 'ingredient_ruby_shard', count: 1 },
    ],
    discovered: false,
    description: 'A basic recipe for a minor elemental potion that temporarily increases elemental spell damage.'
  },
  // Add more elemental potion recipes for tiers 2-5 here
];

/**
 * Base recipes for luck potions of different tiers
 */
export const LUCK_POTION_RECIPES: PotionRecipe[] = [
  {
    id: generateRecipeId('Minor Luck Potion'),
    name: 'Minor Luck Potion',
    resultType: 'luck',
    resultTier: 1,
    ingredients: [
      { ingredientId: 'ingredient_glimmercap', count: 2 },
      { ingredientId: 'ingredient_sapphire_powder', count: 1 },
    ],
    discovered: false,
    description: 'A basic recipe for a minor luck potion that temporarily increases critical spell chance.'
  },
  // Add more luck potion recipes for tiers 2-5 here
];

/**
 * Get all potion recipes
 */
export function getAllPotionRecipes(): PotionRecipe[] {
  return [
    ...HEALTH_POTION_RECIPES,
    ...MANA_POTION_RECIPES,
    ...STRENGTH_POTION_RECIPES,
    ...PROTECTION_POTION_RECIPES,
    ...ELEMENTAL_POTION_RECIPES,
    ...LUCK_POTION_RECIPES
  ];
}

/**
 * Get potion recipes by type
 */
export function getPotionRecipesByType(type: PotionType): PotionRecipe[] {
  switch (type) {
    case 'health':
      return HEALTH_POTION_RECIPES;
    case 'mana':
      return MANA_POTION_RECIPES;
    case 'strength':
      return STRENGTH_POTION_RECIPES;
    case 'protection':
      return PROTECTION_POTION_RECIPES;
    case 'elemental':
      return ELEMENTAL_POTION_RECIPES;
    case 'luck':
      return LUCK_POTION_RECIPES;
    default:
      return [];
  }
}

/**
 * Get potion recipes by tier
 */
export function getPotionRecipesByTier(tier: number): PotionRecipe[] {
  return getAllPotionRecipes().filter(recipe => recipe.resultTier === tier);
}

/**
 * Get a specific potion recipe by ID
 */
export function getPotionRecipeById(recipeId: string): PotionRecipe | undefined {
  return getAllPotionRecipes().find(recipe => recipe.id === recipeId);
} 