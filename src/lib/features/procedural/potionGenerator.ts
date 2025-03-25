import { Potion, PotionType } from '../../types';

/**
 * Generate a unique ID for a potion
 */
function generatePotionId(name: string): string {
  return `potion_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now().toString(36)}`;
}

/**
 * Generate a health potion
 * @param tier The tier of the potion (1-5)
 * @returns A health potion
 */
export function generateHealthPotion(tier: number = 1): Potion {
  const rarity = getPotionRarity(tier);
  const value = getHealthPotionValue(tier);
  const name = getHealthPotionName(tier);
  
  return {
    id: generatePotionId(name),
    name,
    type: 'health',
    rarity,
    effect: {
      value
    },
    description: `Restores ${value} health points when consumed.`
  };
}

/**
 * Generate a mana potion
 * @param tier The tier of the potion (1-5)
 * @returns A mana potion
 */
export function generateManaPotion(tier: number = 1): Potion {
  const rarity = getPotionRarity(tier);
  const value = getManaPotionValue(tier);
  const name = getManaPotionName(tier);
  
  return {
    id: generatePotionId(name),
    name,
    type: 'mana',
    rarity,
    effect: {
      value
    },
    description: `Restores ${value} mana points when consumed.`
  };
}

/**
 * Generate a strength potion
 * @param tier The tier of the potion (1-5)
 * @returns A strength potion
 */
export function generateStrengthPotion(tier: number = 1): Potion {
  const rarity = getPotionRarity(tier);
  const value = 10 + (tier * 5);
  const duration = tier + 1;
  const name = getStrengthPotionName(tier);
  
  return {
    id: generatePotionId(name),
    name,
    type: 'strength',
    rarity,
    effect: {
      value,
      duration
    },
    description: `Increases spell damage by ${value}% for ${duration} turns.`
  };
}

/**
 * Generate a protection potion
 * @param tier The tier of the potion (1-5)
 * @returns A protection potion
 */
export function generateProtectionPotion(tier: number = 1): Potion {
  const rarity = getPotionRarity(tier);
  const value = 10 + (tier * 8);
  const duration = tier + 1;
  const name = getProtectionPotionName(tier);
  
  return {
    id: generatePotionId(name),
    name,
    type: 'protection',
    rarity,
    effect: {
      value,
      duration
    },
    description: `Reduces incoming damage by ${value}% for ${duration} turns.`
  };
}

/**
 * Generate a elemental potion
 * @param tier The tier of the potion (1-5)
 * @returns An elemental potion
 */
export function generateElementalPotion(tier: number = 1): Potion {
  const rarity = getPotionRarity(tier);
  const value = 20 + (tier * 10);
  const duration = tier + 2;
  const name = getElementalPotionName(tier);
  
  return {
    id: generatePotionId(name),
    name,
    type: 'elemental',
    rarity,
    effect: {
      value,
      duration
    },
    description: `Increases elemental spell damage by ${value}% for ${duration} turns.`
  };
}

/**
 * Generate a luck potion
 * @param tier The tier of the potion (1-5)
 * @returns A luck potion
 */
export function generateLuckPotion(tier: number = 1): Potion {
  const rarity = getPotionRarity(tier);
  const value = 15 + (tier * 10);
  const duration = tier + 2;
  const name = getLuckPotionName(tier);
  
  return {
    id: generatePotionId(name),
    name,
    type: 'luck',
    rarity,
    effect: {
      value,
      duration
    },
    description: `Increases critical spell chance by ${value}% for ${duration} turns.`
  };
}

/**
 * Generate a random potion
 * @param playerLevel The player's level
 * @returns A random potion
 */
export function generateRandomPotion(playerLevel: number): Potion {
  // Calculate the maximum tier based on player level
  const maxTier = Math.min(Math.ceil(playerLevel / 5), 5);
  const tier = Math.max(1, Math.floor(Math.random() * maxTier) + 1);
  
  // Get a random potion type
  const potionTypes: PotionType[] = ['health', 'mana', 'strength', 'protection', 'elemental', 'luck'];
  const randomType = potionTypes[Math.floor(Math.random() * potionTypes.length)];
  
  // Generate the potion based on type
  switch (randomType) {
    case 'health':
      return generateHealthPotion(tier);
    case 'mana':
      return generateManaPotion(tier);
    case 'strength':
      return generateStrengthPotion(tier);
    case 'protection':
      return generateProtectionPotion(tier);
    case 'elemental':
      return generateElementalPotion(tier);
    case 'luck':
      return generateLuckPotion(tier);
    default:
      return generateHealthPotion(tier);
  }
}

/**
 * Generate multiple random potions
 * @param playerLevel The player's level
 * @param count Number of potions to generate
 * @returns Array of random potions
 */
export function generateRandomPotions(playerLevel: number, count: number): Potion[] {
  const potions: Potion[] = [];
  for (let i = 0; i < count; i++) {
    potions.push(generateRandomPotion(playerLevel));
  }
  return potions;
}

// Helper functions

/**
 * Get the rarity of a potion based on tier
 * @param tier The tier of the potion (1-5)
 * @returns The potion rarity
 */
function getPotionRarity(tier: number): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
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

/**
 * Get the name of a health potion based on tier
 * @param tier The tier of the potion (1-5)
 * @returns The potion name
 */
function getHealthPotionName(tier: number): string {
  switch (tier) {
    case 1:
      return 'Minor Healing Potion';
    case 2:
      return 'Healing Potion';
    case 3:
      return 'Strong Healing Potion';
    case 4:
      return 'Superior Healing Potion';
    case 5:
      return 'Supreme Healing Potion';
    default:
      return 'Minor Healing Potion';
  }
}

/**
 * Get the value of a health potion based on tier
 * @param tier The tier of the potion (1-5)
 * @returns The healing value
 */
function getHealthPotionValue(tier: number): number {
  switch (tier) {
    case 1:
      return 25;
    case 2:
      return 50;
    case 3:
      return 100;
    case 4:
      return 200;
    case 5:
      return 400;
    default:
      return 25;
  }
}

/**
 * Get the name of a mana potion based on tier
 * @param tier The tier of the potion (1-5)
 * @returns The potion name
 */
function getManaPotionName(tier: number): string {
  switch (tier) {
    case 1:
      return 'Minor Mana Potion';
    case 2:
      return 'Mana Potion';
    case 3:
      return 'Strong Mana Potion';
    case 4:
      return 'Superior Mana Potion';
    case 5:
      return 'Supreme Mana Potion';
    default:
      return 'Minor Mana Potion';
  }
}

/**
 * Get the value of a mana potion based on tier
 * @param tier The tier of the potion (1-5)
 * @returns The mana value
 */
function getManaPotionValue(tier: number): number {
  switch (tier) {
    case 1:
      return 20;
    case 2:
      return 40;
    case 3:
      return 80;
    case 4:
      return 150;
    case 5:
      return 300;
    default:
      return 20;
  }
}

/**
 * Get the name of a strength potion based on tier
 * @param tier The tier of the potion (1-5)
 * @returns The potion name
 */
function getStrengthPotionName(tier: number): string {
  switch (tier) {
    case 1:
      return 'Minor Strength Potion';
    case 2:
      return 'Strength Potion';
    case 3:
      return 'Strong Strength Potion';
    case 4:
      return 'Superior Strength Potion';
    case 5:
      return 'Supreme Strength Potion';
    default:
      return 'Minor Strength Potion';
  }
}

/**
 * Get the name of a protection potion based on tier
 * @param tier The tier of the potion (1-5)
 * @returns The potion name
 */
function getProtectionPotionName(tier: number): string {
  switch (tier) {
    case 1:
      return 'Minor Protection Potion';
    case 2:
      return 'Protection Potion';
    case 3:
      return 'Strong Protection Potion';
    case 4:
      return 'Superior Protection Potion';
    case 5:
      return 'Supreme Protection Potion';
    default:
      return 'Minor Protection Potion';
  }
}

/**
 * Get the name of an elemental potion based on tier
 * @param tier The tier of the potion (1-5)
 * @returns The potion name
 */
function getElementalPotionName(tier: number): string {
  switch (tier) {
    case 1:
      return 'Minor Elemental Potion';
    case 2:
      return 'Elemental Potion';
    case 3:
      return 'Strong Elemental Potion';
    case 4:
      return 'Superior Elemental Potion';
    case 5:
      return 'Supreme Elemental Potion';
    default:
      return 'Minor Elemental Potion';
  }
}

/**
 * Get the name of a luck potion based on tier
 * @param tier The tier of the potion (1-5)
 * @returns The potion name
 */
function getLuckPotionName(tier: number): string {
  switch (tier) {
    case 1:
      return 'Minor Luck Potion';
    case 2:
      return 'Luck Potion';
    case 3:
      return 'Strong Luck Potion';
    case 4:
      return 'Superior Luck Potion';
    case 5:
      return 'Supreme Luck Potion';
    default:
      return 'Minor Luck Potion';
  }
} 