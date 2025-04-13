import { v4 as uuidv4 } from 'uuid';
import {
  MarketLocation,
  MarketInventory,
  MarketItem,
  MarketTransaction,
  Ingredient,
  Potion,
  Equipment,
  IngredientRarity,
  SpellScroll
} from '../../types';
import { generateRandomIngredient } from '../procedural/ingredientGenerator';
import { generateRandomPotion, generateRandomEquipment, generateRandomScroll } from '../items/itemGenerators';
import { generateScrollsForMarket } from '../scrolls/scrollSystem';
import {
  generateHerbIngredient,
  generateCrystalIngredient,
  generateEssenceIngredient,
  generateFungusIngredient,
  generateCatalystIngredient,
  generateCoreIngredient
} from '../procedural/ingredientGenerator';
import { generateProceduralEquipment } from '../procedural/equipmentGenerator';
import { getScrollBasePrice } from '../scrolls/scrollSystem';

// Constants for market system
const BASE_INGREDIENT_PRICES: Record<IngredientRarity, number> = {
  common: 10,
  uncommon: 25,
  rare: 75,
  epic: 200,
  legendary: 500
};

const SUPPLY_QUANTITY_RANGES: Record<string, [number, number]> = {
  abundant: [15, 30],
  common: [8, 15],
  limited: [3, 7],
  rare: [1, 3],
  unique: [1, 1]
};

const DEMAND_PRICE_MULTIPLIERS: Record<string, number> = {
  unwanted: 0.6,
  low: 0.8,
  moderate: 1.0,
  high: 1.3,
  extreme: 1.8
};

/**
 * Generate a unique ID for a market
 */
function generateMarketId(name: string): string {
  return `market_${name.toLowerCase().replace(/\s+/g, '_')}_${uuidv4().slice(0, 8)}`;
}

/**
 * Initialize default market locations
 * @returns Array of market locations
 */
export function initializeMarkets(): MarketLocation[] {
  const today = new Date().toISOString();

  const createMarket = (
    id: string,
    name: string,
    description: string,
    unlockLevel: number,
    specialization?: 'ingredients' | 'potions' | 'equipment' | 'scrolls',
    priceMultiplier: number = 1.0,
    inventoryRefreshDays: number = 3
  ): MarketLocation => {
    const inventory = generateMarketInventory(unlockLevel);
    const prices: Record<string, number> = {};

    // Initialize prices from inventory
    inventory.ingredients.forEach(item => {
      prices[item.item.id] = item.currentPrice;
    });

    inventory.potions.forEach(item => {
      prices[item.item.id] = item.currentPrice;
    });

    inventory.equipment.forEach(item => {
      prices[item.item.id] = item.currentPrice;
    });

    if (inventory.scrolls) {
      inventory.scrolls.forEach(item => {
        prices[item.item.id] = item.currentPrice;
      });
    }

    // Calculate base gold based on market level and specialization
    const baseGold = 1000 * unlockLevel;

    return {
      id,
      name,
      description,
      unlockLevel,
      specialization,
      reputationLevel: 0,
      inventoryRefreshDays,
      lastRefreshed: today,
      inventory,
      priceMultiplier,
      prices,
      sellPriceMultiplier: 0.6, // Default sell price is 60% of buy price
      currentGold: baseGold // Amount of gold the market has available for buying items from player
    };
  };

  return [
    createMarket(
      'market-1',
      'Novice Bazaar',
      'A small marketplace catering to apprentice wizards with common ingredients and basic supplies.',
      1,
      undefined,
      1.0,
      3
    ),
    createMarket(
      'market-2',
      'Herbalist\'s Haven',
      'A specialized market focused on rare herbs and botanical ingredients for potion crafting.',
      5,
      'ingredients',
      0.9,
      5
    ),
    createMarket(
      'market-3',
      'Arcane Emporium',
      'An upscale marketplace offering quality equipment and rare magical items for accomplished wizards.',
      10,
      'equipment',
      1.2,
      7
    ),
    createMarket(
      'market-4',
      'Alchemist\'s Square',
      'The premier destination for potion crafters, offering a wide variety of brewing supplies and finished potions.',
      15,
      'potions',
      1.0,
      5
    ),
    createMarket(
      'market-5',
      'Spellcaster\'s Exchange',
      'A prestigious marketplace for master wizards, featuring rare scrolls and exotic magical components.',
      20,
      'scrolls',
      1.5,
      10
    ),
    createMarket(
      'market-6',
      'Mystic Garden',
      'An ancient garden marketplace known for its rare and exotic magical ingredients.',
      150,
      'ingredients',
      2.2,
      14
    ),
    createMarket(
      'market-7',
      'Artificer\'s Workshop',
      'A legendary marketplace for master craftsmen and artificers.',
      250,
      'equipment',
      2.5,
      16
    ),
    createMarket(
      'market-8',
      'Grand Alchemist\'s Hall',
      'The most prestigious potion market in the realm.',
      500,
      'potions',
      3.0,
      21
    ),
    createMarket(
      'market-9',
      'Archmage\'s Library',
      'The ultimate destination for the most powerful magical scrolls and artifacts.',
      1000,
      'scrolls',
      4.0,
      30
    )
  ];
}

/**
 * Generate inventory for a market based on level and specialization
 * @param level The level of the market (affects quality and rarity)
 * @param specialization The market's specialization (affects types of items available)
 * @returns MarketInventory object with generated items
 */
export function generateMarketInventory(level: number): MarketInventory {
  const inventory: MarketInventory = {
    ingredients: [],
    potions: [],
    equipment: [],
    scrolls: []
  };

  // Generate ingredients
  const ingredientCount = Math.min(5 + level, 15);
  for (let i = 0; i < ingredientCount; i++) {
    const ingredient = generateRandomIngredient(level);
    inventory.ingredients.push(generateMarketItem(ingredient, level, 5));
  }

  // Generate potions
  const potionCount = Math.min(3 + level, 10);
  for (let i = 0; i < potionCount; i++) {
    const potion = generateRandomPotion(level);
    inventory.potions.push(generateMarketItem(potion, level, 3));
  }

  // Generate equipment
  const equipmentCount = Math.min(2 + level, 8);
  for (let i = 0; i < equipmentCount; i++) {
    const equipment = generateRandomEquipment(level);
    inventory.equipment.push(generateMarketItem(equipment, level, 2));
  }

  // Generate scrolls
  const scrollCount = Math.min(1 + level, 5);
  for (let i = 0; i < scrollCount; i++) {
    const scroll = generateRandomScroll(level);
    inventory.scrolls.push(generateMarketItem(scroll, level, 2));
  }

  return inventory;
}

const generateMarketItem = <T extends { rarity: string; id: string }>(
  item: T,
  level: number,
  baseQuantity: number
): MarketItem<T> => {
  const currentPrice = calculateBasePrice(item, level);
  return {
    item,
    quantity: Math.floor(Math.random() * baseQuantity) + 1,
    currentPrice,
    supply: determineSupply(item.rarity),
    demand: determineDemand(item.rarity),
    priceHistory: [currentPrice]
  };
};

const determineSupply = (rarity: string): 'abundant' | 'common' | 'limited' | 'rare' | 'unique' => {
  switch (rarity) {
    case 'legendary': return 'unique';
    case 'epic': return 'rare';
    case 'rare': return 'limited';
    case 'uncommon': return 'common';
    default: return 'abundant';
  }
};

const determineDemand = (rarity: string): 'unwanted' | 'low' | 'moderate' | 'high' | 'extreme' => {
  switch (rarity) {
    case 'legendary': return 'extreme';
    case 'epic': return 'high';
    case 'rare': return 'moderate';
    case 'uncommon': return 'low';
    default: return 'unwanted';
  }
};

const calculateBasePrice = (item: any, level: number): number => {
  const rarityMultipliers = {
    common: 1,
    uncommon: 2.5,
    rare: 6,
    epic: 15,
    legendary: 40
  };

  const basePrice = 50 * (rarityMultipliers[item.rarity] || 1);
  const levelMultiplier = 1 + (level - 1) * 0.2;
  const variation = 0.9 + Math.random() * 0.2;

  return Math.round(basePrice * levelMultiplier * variation);
};

/**
 * Apply price fluctuation to a market based on time passed and market activity
 * @param market The market to update
 * @returns Updated market with new prices
 */
export function updateMarketPrices(market: MarketLocation): MarketLocation {
  const updatedMarket = { ...market };
  const priceMultiplier = 1 + (Math.random() * 0.2 - 0.1); // ±10% price variation

  // Initialize prices if undefined
  if (!updatedMarket.prices) {
    updatedMarket.prices = {};
  }

  // Update prices for all items in inventory
  updatedMarket.inventory.ingredients.forEach(item => {
    updatedMarket.prices[item.item.id] = Math.round(item.currentPrice * priceMultiplier);
  });

  updatedMarket.inventory.potions.forEach(item => {
    updatedMarket.prices[item.item.id] = Math.round(item.currentPrice * priceMultiplier);
  });

  updatedMarket.inventory.equipment.forEach(item => {
    updatedMarket.prices[item.item.id] = Math.round(item.currentPrice * priceMultiplier);
  });

  if (updatedMarket.inventory.scrolls) {
    updatedMarket.inventory.scrolls.forEach(item => {
      updatedMarket.prices[item.item.id] = Math.round(item.currentPrice * priceMultiplier);
    });
  }

  return updatedMarket;
}

/**
 * Create a new transaction record
 * @param marketId ID of the market
 * @param itemId ID of the item
 * @param itemName Name of the item
 * @param itemType Type of the item
 * @param quantity Quantity bought/sold
 * @param price Price per unit
 * @param type Transaction type (buy/sell)
 * @returns Transaction record
 */
export function createTransaction(
  marketId: string,
  itemId: string,
  itemName: string,
  itemType: 'ingredient' | 'potion' | 'equipment' | 'scroll',
  quantity: number,
  price: number,
  type: 'buy' | 'sell'
): MarketTransaction {
  return {
    id: uuidv4(),
    marketId,
    itemId,
    itemName,
    itemType,
    quantity,
    price,
    type,
    date: new Date().toISOString()
  };
}

/**
 * Check if a market needs inventory refresh
 * @param market The market to check
 * @returns Whether the market needs a refresh
 */
export function shouldRefreshMarketInventory(market: MarketLocation): boolean {
  const lastRefreshed = new Date(market.lastRefreshed);
  const today = new Date();

  // Calculate days since last refresh
  const daysSinceRefresh = Math.floor((today.getTime() - lastRefreshed.getTime()) / (1000 * 60 * 60 * 24));

  return daysSinceRefresh >= market.inventoryRefreshDays;
}

/**
 * Refresh a market's inventory
 * @param market The market to refresh
 * @returns Updated market with fresh inventory
 */
export function refreshMarketInventory(market: MarketLocation): MarketLocation {
  const updatedMarket = { ...market };
  updatedMarket.inventory = generateMarketInventory(market.unlockLevel);
  updatedMarket.lastRefreshed = new Date().toISOString();

  // Reset market gold based on level
  updatedMarket.currentGold = 1000 * market.unlockLevel;

  // Update prices
  updatedMarket.prices = {};
  updatedMarket.inventory.ingredients.forEach(item => {
    updatedMarket.prices[item.item.id] = item.currentPrice;
  });
  updatedMarket.inventory.potions.forEach(item => {
    updatedMarket.prices[item.item.id] = item.currentPrice;
  });
  updatedMarket.inventory.equipment.forEach(item => {
    updatedMarket.prices[item.item.id] = item.currentPrice;
  });
  if (updatedMarket.inventory.scrolls) {
    updatedMarket.inventory.scrolls.forEach(item => {
      updatedMarket.prices[item.item.id] = item.currentPrice;
    });
  }

  return updatedMarket;
}