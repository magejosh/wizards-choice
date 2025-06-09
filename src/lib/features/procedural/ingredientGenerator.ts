import { v4 as uuidv4 } from 'uuid';
import { Ingredient, IngredientCategory, IngredientRarity } from '../../types';

/**
 * Generate a unique ID for an ingredient
 */
function generateIngredientId(name: string): string {
  return `ingredient_${name.toLowerCase().replace(/\s+/g, '_')}_${uuidv4().slice(0, 8)}`;
}

/**
 * Get ingredient rarity name based on tier
 */
function getIngredientRarity(tier: number): IngredientRarity {
  switch (tier) {
    case 1:
      return 'common';
    case 2:
      return 'uncommon';
    case 3:
      return 'rare';
    case 4:
      return 'epic';
    case 5:
      return 'legendary';
    default:
      return 'common';
  }
}

// Base ingredients data by category
export const HERB_INGREDIENTS = [
  { name: 'Blueleaf', properties: ['Cooling', 'Calming'] },
  { name: 'Dragonwort', properties: ['Warming', 'Energizing'] },
  { name: 'Moonsage', properties: ['Clarity', 'Focus'] },
  { name: 'Sunvine', properties: ['Vitality', 'Strength'] },
  { name: 'Whisperweed', properties: ['Subtle', 'Protection'] },
  { name: 'Stormroot', properties: ['Grounding', 'Stability'] },
];

export const CRYSTAL_INGREDIENTS = [
  { name: 'Azurite', properties: ['Water', 'Calm'] },
  { name: 'Ruby Shard', properties: ['Fire', 'Power'] },
  { name: 'Emerald Dust', properties: ['Earth', 'Healing'] },
  { name: 'Sapphire Powder', properties: ['Air', 'Intelligence'] },
  { name: 'Amethyst Fragment', properties: ['Spirit', 'Wisdom'] },
  { name: 'Topaz Grain', properties: ['Lightning', 'Speed'] },
];

export const ESSENCE_INGREDIENTS = [
  { name: 'Phoenix Essence', properties: ['Rebirth', 'Vitality'] },
  { name: 'Frost Essence', properties: ['Preservation', 'Slowing'] },
  { name: 'Shadow Essence', properties: ['Concealment', 'Stealth'] },
  { name: 'Radiant Essence', properties: ['Illumination', 'Truth'] },
  { name: 'Ethereal Essence', properties: ['Connection', 'Vision'] },
  { name: 'Venom Essence', properties: ['Toxicity', 'Transformation'] },
];

export const FUNGUS_INGREDIENTS = [
  { name: 'Glimmercap', properties: ['Hallucination', 'Insight'] },
  { name: 'Nightshade', properties: ['Dreams', 'Fear'] },
  { name: 'Ironshroom', properties: ['Fortification', 'Resilience'] },
  { name: 'Frosttruffle', properties: ['Preservation', 'Longevity'] },
  { name: 'Emberroot', properties: ['Internal Heat', 'Energy'] },
  { name: 'Mistfungus', properties: ['Obscurement', 'Mystery'] },
];

export const CATALYST_INGREDIENTS = [
  { name: 'Dragon Scale', properties: ['Transformation', 'Power'] },
  { name: 'Starsand', properties: ['Binding', 'Amplification'] },
  { name: 'Void Salt', properties: ['Stabilization', 'Preservation'] },
  { name: 'Arcane Dust', properties: ['Magic Conductivity', 'Enhancement'] },
  { name: 'Alchemical Mercury', properties: ['Fluidity', 'Transmutation'] },
  { name: 'Philosopher Stone Fragment', properties: ['Perfection', 'Transcendence'] },
];

export const CORE_INGREDIENTS = [
  { name: 'Phoenix Feather', properties: ['Rebirth', 'Flame'] },
  { name: 'Dragon Heart', properties: ['Power', 'Transformation'] },
  { name: 'Unicorn Horn', properties: ['Purity', 'Healing'] },
  { name: 'Manticore Venom', properties: ['Toxicity', 'Potency'] },
  { name: 'Kraken Ink', properties: ['Obscurity', 'Depth'] },
  { name: 'Gryphon Talon', properties: ['Sharpness', 'Precision'] },
];

/**
 * Get ingredient descriptions based on properties
 */
function getIngredientDescription(category: IngredientCategory, properties: string[], rarity: IngredientRarity): string {
  const rarityDescriptions = {
    common: 'Relatively common',
    uncommon: 'Somewhat rare',
    rare: 'Quite rare',
    epic: 'Extremely rare',
    legendary: 'Nearly mythical'
  };

  const categoryDescriptions = {
    herb: 'A magical plant',
    crystal: 'A crystalline mineral',
    essence: 'A distilled magical essence',
    fungus: 'A magical fungal growth',
    catalyst: 'A reactive magical substance',
    core: 'A core component from a magical creature'
  };

  return `${rarityDescriptions[rarity]} ${categoryDescriptions[category]} with ${properties.join(' and ')} properties. Used in potion crafting.`;
}

/**
 * Generate an herb ingredient
 */
export function generateHerbIngredient(tier: number = 1): Ingredient {
  const rarity = getIngredientRarity(tier);
  const baseIngredient = HERB_INGREDIENTS[Math.floor(Math.random() * HERB_INGREDIENTS.length)];
  
  // For higher tiers, add a prefix to the name
  const prefixes = ['', 'Enhanced ', 'Potent ', 'Mystic ', 'Legendary '];
  const name = tier > 1 ? `${prefixes[tier-1]}${baseIngredient.name}` : baseIngredient.name;
  
  return {
    id: generateIngredientId(name),
    name,
    category: 'herb',
    rarity,
    properties: baseIngredient.properties,
    description: getIngredientDescription('herb', baseIngredient.properties, rarity)
  };
}

/**
 * Generate a crystal ingredient
 */
export function generateCrystalIngredient(tier: number = 1): Ingredient {
  const rarity = getIngredientRarity(tier);
  const baseIngredient = CRYSTAL_INGREDIENTS[Math.floor(Math.random() * CRYSTAL_INGREDIENTS.length)];
  
  // For higher tiers, add a prefix to the name
  const prefixes = ['', 'Refined ', 'Pure ', 'Radiant ', 'Perfect '];
  const name = tier > 1 ? `${prefixes[tier-1]}${baseIngredient.name}` : baseIngredient.name;
  
  return {
    id: generateIngredientId(name),
    name,
    category: 'crystal',
    rarity,
    properties: baseIngredient.properties,
    description: getIngredientDescription('crystal', baseIngredient.properties, rarity)
  };
}

/**
 * Generate an essence ingredient
 */
export function generateEssenceIngredient(tier: number = 1): Ingredient {
  const rarity = getIngredientRarity(tier);
  const baseIngredient = ESSENCE_INGREDIENTS[Math.floor(Math.random() * ESSENCE_INGREDIENTS.length)];
  
  // For higher tiers, add a prefix to the name
  const prefixes = ['', 'Distilled ', 'Concentrated ', 'Primordial ', 'Eternal '];
  const name = tier > 1 ? `${prefixes[tier-1]}${baseIngredient.name}` : baseIngredient.name;
  
  return {
    id: generateIngredientId(name),
    name,
    category: 'essence',
    rarity,
    properties: baseIngredient.properties,
    description: getIngredientDescription('essence', baseIngredient.properties, rarity)
  };
}

/**
 * Generate a fungus ingredient
 */
export function generateFungusIngredient(tier: number = 1): Ingredient {
  const rarity = getIngredientRarity(tier);
  const baseIngredient = FUNGUS_INGREDIENTS[Math.floor(Math.random() * FUNGUS_INGREDIENTS.length)];
  
  // For higher tiers, add a prefix to the name
  const prefixes = ['', 'Mature ', 'Ancient ', 'Prismatic ', 'Ethereal '];
  const name = tier > 1 ? `${prefixes[tier-1]}${baseIngredient.name}` : baseIngredient.name;
  
  return {
    id: generateIngredientId(name),
    name,
    category: 'fungus',
    rarity,
    properties: baseIngredient.properties,
    description: getIngredientDescription('fungus', baseIngredient.properties, rarity)
  };
}

/**
 * Generate a catalyst ingredient
 */
export function generateCatalystIngredient(tier: number = 1): Ingredient {
  const rarity = getIngredientRarity(tier);
  const baseIngredient = CATALYST_INGREDIENTS[Math.floor(Math.random() * CATALYST_INGREDIENTS.length)];
  
  // For higher tiers, add a prefix to the name
  const prefixes = ['', 'Quality ', 'Superior ', 'Exceptional ', 'Divine '];
  const name = tier > 1 ? `${prefixes[tier-1]}${baseIngredient.name}` : baseIngredient.name;
  
  return {
    id: generateIngredientId(name),
    name,
    category: 'catalyst',
    rarity,
    properties: baseIngredient.properties,
    description: getIngredientDescription('catalyst', baseIngredient.properties, rarity)
  };
}

/**
 * Generate a core ingredient
 */
export function generateCoreIngredient(tier: number = 1): Ingredient {
  const rarity = getIngredientRarity(tier);
  const baseIngredient = CORE_INGREDIENTS[Math.floor(Math.random() * CORE_INGREDIENTS.length)];
  
  // For higher tiers, add a prefix to the name
  const prefixes = ['', 'Pristine ', 'Ancient ', 'Mythical ', 'Primeval '];
  const name = tier > 1 ? `${prefixes[tier-1]}${baseIngredient.name}` : baseIngredient.name;
  
  return {
    id: generateIngredientId(name),
    name,
    category: 'core',
    rarity,
    properties: baseIngredient.properties,
    description: getIngredientDescription('core', baseIngredient.properties, rarity)
  };
}

/**
 * Generate a random ingredient
 * @param playerLevel The player's level
 * @returns A random ingredient with tier based on player level
 */
export function generateRandomIngredient(
  playerLevel: number,
  categories?: IngredientCategory[],
  allowedRarities?: IngredientRarity[],
): Ingredient {
  // Calculate the maximum tier based on player level
  let maxTier = Math.min(Math.ceil(playerLevel / 5), 5);

  if (allowedRarities && allowedRarities.length > 0) {
    const rarityMap: Record<IngredientRarity, number> = {
      common: 1,
      uncommon: 2,
      rare: 3,
      epic: 4,
      legendary: 5,
    };
    const highest = allowedRarities[allowedRarities.length - 1];
    maxTier = Math.min(maxTier, rarityMap[highest]);
  }

  const tier = Math.max(1, Math.floor(Math.random() * maxTier) + 1);

  // Get a random ingredient category
  const ingredientCategories: IngredientCategory[] =
    categories && categories.length > 0
      ? categories
      : ['herb', 'crystal', 'essence', 'fungus', 'catalyst', 'core'];
  const randomCategory =
    ingredientCategories[Math.floor(Math.random() * ingredientCategories.length)];
  
  // Generate the ingredient based on category
  switch (randomCategory) {
    case 'herb':
      return generateHerbIngredient(tier);
    case 'crystal':
      return generateCrystalIngredient(tier);
    case 'essence':
      return generateEssenceIngredient(tier);
    case 'fungus':
      return generateFungusIngredient(tier);
    case 'catalyst':
      return generateCatalystIngredient(tier);
    case 'core':
      return generateCoreIngredient(tier);
    default:
      return generateHerbIngredient(tier);
  }
} 