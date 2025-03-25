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
import {
  generateRandomIngredient,
  generateHerbIngredient,
  generateCrystalIngredient,
  generateEssenceIngredient,
  generateFungusIngredient,
  generateCatalystIngredient,
  generateCoreIngredient
} from '../procedural/ingredientGenerator';
import { generateProceduralEquipment } from '../procedural/equipmentGenerator';
import { generateScrollsForMarket, getScrollBasePrice } from '../scrolls/scrollSystem';

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
  
  return [
    {
      id: generateMarketId('Novice Bazaar'),
      name: 'Novice Bazaar',
      description: 'A small marketplace catering to apprentice wizards with common ingredients and basic supplies.',
      unlockLevel: 1, // Available from the start
      reputationLevel: 0,
      inventoryRefreshDays: 3,
      lastRefreshed: today,
      inventory: generateMarketInventory(1, 'general'),
      priceMultiplier: 1.0
    },
    {
      id: generateMarketId('Herbalist\'s Haven'),
      name: 'Herbalist\'s Haven',
      description: 'A specialized market focused on rare herbs and botanical ingredients for potion crafting.',
      unlockLevel: 5,
      specialization: 'ingredients',
      reputationLevel: 0,
      inventoryRefreshDays: 5,
      lastRefreshed: today,
      inventory: generateMarketInventory(5, 'ingredients'),
      priceMultiplier: 0.9 // Slightly cheaper ingredients due to specialization
    },
    {
      id: generateMarketId('Arcane Emporium'),
      name: 'Arcane Emporium',
      description: 'An upscale marketplace offering quality equipment and rare magical items for accomplished wizards.',
      unlockLevel: 10,
      specialization: 'equipment',
      reputationLevel: 0,
      inventoryRefreshDays: 7,
      lastRefreshed: today,
      inventory: generateMarketInventory(10, 'equipment'),
      priceMultiplier: 1.2 // Premium prices for quality equipment
    },
    {
      id: generateMarketId('Alchemist\'s Square'),
      name: 'Alchemist\'s Square',
      description: 'The premier destination for potion crafters, offering a wide variety of brewing supplies and finished potions.',
      unlockLevel: 15,
      specialization: 'potions',
      reputationLevel: 0,
      inventoryRefreshDays: 5,
      lastRefreshed: today,
      inventory: generateMarketInventory(15, 'potions'),
      priceMultiplier: 1.0
    },
    {
      id: generateMarketId('Spellcaster\'s Exchange'),
      name: 'Spellcaster\'s Exchange',
      description: 'A prestigious marketplace for master wizards, featuring rare scrolls and exotic magical components.',
      unlockLevel: 20,
      specialization: 'scrolls',
      reputationLevel: 0,
      inventoryRefreshDays: 10,
      lastRefreshed: today,
      inventory: generateMarketInventory(20, 'scrolls'),
      priceMultiplier: 1.5 // Premium prices for rare scrolls
    },
    // New high-level markets
    {
      id: generateMarketId('Ethereal Bazaar'),
      name: 'Ethereal Bazaar',
      description: 'A mystical market that appears and disappears unpredictably, offering rare ingredients from other planes of existence.',
      unlockLevel: 25,
      specialization: 'ingredients',
      reputationLevel: 0,
      inventoryRefreshDays: 6,
      lastRefreshed: today,
      inventory: generateMarketInventory(25, 'ingredients'),
      priceMultiplier: 1.3
    },
    {
      id: generateMarketId('Enchanter\'s Workshop'),
      name: 'Enchanter\'s Workshop',
      description: 'An exclusive market where master enchanters craft and sell specialized equipment with powerful enchantments.',
      unlockLevel: 50,
      specialization: 'equipment',
      reputationLevel: 0,
      inventoryRefreshDays: 8,
      lastRefreshed: today,
      inventory: generateMarketInventory(50, 'equipment'),
      priceMultiplier: 1.6
    },
    {
      id: generateMarketId('Celestial Apothecary'),
      name: 'Celestial Apothecary',
      description: 'A prestigious market run by celestial beings, offering exceptionally potent potions and elixirs.',
      unlockLevel: 75,
      specialization: 'potions',
      reputationLevel: 0,
      inventoryRefreshDays: 9,
      lastRefreshed: today,
      inventory: generateMarketInventory(75, 'potions'),
      priceMultiplier: 1.8
    },
    {
      id: generateMarketId('Archmage\'s Repository'),
      name: 'Archmage\'s Repository',
      description: 'A highly exclusive collection of rare scrolls and magical artifacts maintained by the council of archmages.',
      unlockLevel: 100,
      specialization: 'scrolls',
      reputationLevel: 0,
      inventoryRefreshDays: 12,
      lastRefreshed: today,
      inventory: generateMarketInventory(100, 'scrolls'),
      priceMultiplier: 2.0
    },
    {
      id: generateMarketId('Elemental Nexus'),
      name: 'Elemental Nexus',
      description: 'A convergence point of elemental planes where powerful entities trade in the rarest of magical components.',
      unlockLevel: 150,
      specialization: 'ingredients',
      reputationLevel: 0,
      inventoryRefreshDays: 14,
      lastRefreshed: today,
      inventory: generateMarketInventory(150, 'ingredients'),
      priceMultiplier: 2.2
    },
    {
      id: generateMarketId('Temporal Auction House'),
      name: 'Temporal Auction House',
      description: 'A market that exists outside normal time, offering equipment and artifacts from various points in history and possible futures.',
      unlockLevel: 250,
      specialization: 'equipment',
      reputationLevel: 0,
      inventoryRefreshDays: 16,
      lastRefreshed: today,
      inventory: generateMarketInventory(250, 'equipment'),
      priceMultiplier: 2.5
    },
    {
      id: generateMarketId('Philosopher\'s Emporium'),
      name: 'Philosopher\'s Emporium',
      description: 'The ultimate destination for alchemists and philosophers, featuring legendary potions and elixirs of transcendence.',
      unlockLevel: 500,
      specialization: 'potions',
      reputationLevel: 0,
      inventoryRefreshDays: 20,
      lastRefreshed: today,
      inventory: generateMarketInventory(500, 'potions'),
      priceMultiplier: 3.0
    },
    {
      id: generateMarketId('Cosmic Library'),
      name: 'Cosmic Library',
      description: 'A legendary marketplace containing the most powerful spell scrolls and forbidden knowledge in the multiverse.',
      unlockLevel: 1000,
      specialization: 'scrolls',
      reputationLevel: 0,
      inventoryRefreshDays: 30,
      lastRefreshed: today,
      inventory: generateMarketInventory(1000, 'scrolls'),
      priceMultiplier: 4.0
    }
  ];
}

/**
 * Generate inventory for a market based on level and specialization
 * @param level The level of the market (affects quality and rarity)
 * @param specialization The market's specialization (affects types of items available)
 * @returns MarketInventory object with generated items
 */
export function generateMarketInventory(
  level: number,
  specialization: 'general' | 'ingredients' | 'potions' | 'equipment' | 'scrolls'
): MarketInventory {
  // Determine counts based on specialization
  let ingredientCount = 5;
  let potionCount = 3;
  let equipmentCount = 2;
  let scrollCount = 1;
  
  // Adjust counts based on specialization
  switch (specialization) {
    case 'ingredients':
      ingredientCount = 12;
      potionCount = 4;
      equipmentCount = 1;
      scrollCount = 1;
      break;
    case 'potions':
      ingredientCount = 6;
      potionCount = 10;
      equipmentCount = 1;
      scrollCount = 2;
      break;
    case 'equipment':
      ingredientCount = 3;
      potionCount = 3;
      equipmentCount = 8;
      scrollCount = 2;
      break;
    case 'scrolls':
      ingredientCount = 4;
      potionCount = 2;
      equipmentCount = 2;
      scrollCount = 8;
      break;
    // general case uses default values
  }
  
  // Generate ingredients
  const ingredients = generateIngredientInventory(level, ingredientCount);
  
  // Generate potions (placeholder - will need to implement)
  const potions: MarketItem<Potion>[] = [];
  
  // Generate equipment
  const equipment = generateEquipmentInventory(level, equipmentCount);
  
  // Generate scrolls
  const scrolls = generateScrollInventory(level, scrollCount);
  
  return {
    ingredients,
    potions,
    equipment,
    scrolls
  };
}

/**
 * Generate ingredient inventory items
 * @param level Market level/tier
 * @param count Number of ingredients to generate
 * @returns Array of market items with ingredients
 */
function generateIngredientInventory(level: number, count: number): MarketItem<Ingredient>[] {
  const inventory: MarketItem<Ingredient>[] = [];
  
  // Generate one of each category for variety
  const categories = ['herb', 'crystal', 'essence', 'fungus', 'catalyst', 'core'];
  const generatorFunctions = [
    generateHerbIngredient,
    generateCrystalIngredient,
    generateEssenceIngredient,
    generateFungusIngredient,
    generateCatalystIngredient,
    generateCoreIngredient
  ];
  
  // Add one of each category first
  for (let i = 0; i < Math.min(count, categories.length); i++) {
    // For higher level markets, generate higher tier ingredients
    const tier = Math.min(Math.max(Math.floor(level / 5), 1), 5);
    
    // Generate ingredient with appropriate tier
    const ingredient = generatorFunctions[i](tier);
    
    // Add to inventory with appropriate pricing
    inventory.push(generateMarketItemForIngredient(ingredient));
  }
  
  // Fill remaining slots with random ingredients
  for (let i = categories.length; i < count; i++) {
    const ingredient = generateRandomIngredient(level);
    inventory.push(generateMarketItemForIngredient(ingredient));
  }
  
  return inventory;
}

/**
 * Generate equipment inventory items
 * @param level Market level/tier
 * @param count Number of equipment items to generate
 * @returns Array of market items with equipment
 */
function generateEquipmentInventory(level: number, count: number): MarketItem<Equipment>[] {
  const inventory: MarketItem<Equipment>[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate random equipment appropriate for the level
    const equipment = generateProceduralEquipment(level);
    
    // Add to inventory with appropriate pricing
    inventory.push(generateMarketItemForEquipment(equipment));
  }
  
  return inventory;
}

/**
 * Generate spell scroll inventory for a market
 * @param level The level of the market
 * @param count Number of spell scrolls to generate
 * @returns Array of market items containing spell scrolls
 */
function generateScrollInventory(level: number, count: number): MarketItem<SpellScroll>[] {
  const scrolls = generateScrollsForMarket(count, level);
  
  return scrolls.map(scroll => generateMarketItemForScroll(scroll));
}

/**
 * Generate a market item for a spell scroll
 * @param scroll The spell scroll
 * @returns Market item for the spell scroll
 */
function generateMarketItemForScroll(scroll: SpellScroll): MarketItem<SpellScroll> {
  // Base price determined by rarity
  const basePrice = getScrollBasePrice(scroll.rarity);
  
  // Determine supply based on rarity
  let supply: 'abundant' | 'common' | 'limited' | 'rare' | 'unique';
  let quantity: number;
  
  switch (scroll.rarity) {
    case 'legendary':
      supply = 'unique';
      quantity = 1;
      break;
    case 'epic':
      supply = 'rare';
      quantity = Math.ceil(Math.random() * 2);
      break;
    case 'rare':
      supply = 'limited';
      quantity = Math.ceil(Math.random() * 3) + 1;
      break;
    case 'uncommon':
      supply = 'common';
      quantity = Math.ceil(Math.random() * 4) + 2;
      break;
    case 'common':
    default:
      supply = 'abundant';
      quantity = Math.ceil(Math.random() * 5) + 5;
      break;
  }
  
  // Determine demand (more powerful spells or higher tier generally have higher demand)
  let demand: 'unwanted' | 'low' | 'moderate' | 'high' | 'extreme';
  
  const spellTier = scroll.spell.tier || 1;
  const randomFactor = Math.random();
  
  if (spellTier >= 8 || scroll.rarity === 'legendary') {
    demand = 'extreme';
  } else if (spellTier >= 6 || scroll.rarity === 'epic') {
    demand = randomFactor < 0.7 ? 'high' : 'moderate';
  } else if (spellTier >= 4 || scroll.rarity === 'rare') {
    demand = randomFactor < 0.5 ? 'high' : 'moderate';
  } else if (spellTier >= 2 || scroll.rarity === 'uncommon') {
    demand = randomFactor < 0.7 ? 'moderate' : 'low';
  } else {
    demand = randomFactor < 0.5 ? 'moderate' : 'low';
  }
  
  // Calculate current price with a slight random variation
  const variation = 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
  const currentPrice = Math.round(basePrice * DEMAND_PRICE_MULTIPLIERS[demand] * variation);
  
  return {
    item: scroll,
    basePrice,
    currentPrice,
    quantity,
    supply,
    demand,
    priceHistory: [currentPrice]
  };
}

/**
 * Generate a market item for an ingredient with appropriate pricing
 * @param ingredient The ingredient to price
 * @returns Market item with pricing information
 */
function generateMarketItemForIngredient(ingredient: Ingredient): MarketItem<Ingredient> {
  // Base price determined by rarity
  const basePrice = BASE_INGREDIENT_PRICES[ingredient.rarity];
  
  // Randomize supply and demand
  const supplyLevels: Array<'abundant' | 'common' | 'limited' | 'rare' | 'unique'> = 
    ['abundant', 'common', 'limited', 'rare', 'unique'];
  const demandLevels: Array<'unwanted' | 'low' | 'moderate' | 'high' | 'extreme'> = 
    ['unwanted', 'low', 'moderate', 'high', 'extreme'];
  
  // Adjust supply based on ingredient rarity
  const supplyIndex = Math.min(
    Math.floor(Math.random() * 3) + 
    (['common', 'uncommon', 'rare', 'epic', 'legendary'].indexOf(ingredient.rarity)),
    supplyLevels.length - 1
  );
  const supply = supplyLevels[supplyIndex];
  
  // Randomize demand but with higher chance for moderate
  const demandRoll = Math.random();
  let demandIndex;
  if (demandRoll < 0.2) demandIndex = 0; // unwanted
  else if (demandRoll < 0.4) demandIndex = 1; // low
  else if (demandRoll < 0.7) demandIndex = 2; // moderate
  else if (demandRoll < 0.9) demandIndex = 3; // high
  else demandIndex = 4; // extreme
  
  const demand = demandLevels[demandIndex];
  
  // Determine quantity based on supply
  const [minQuantity, maxQuantity] = SUPPLY_QUANTITY_RANGES[supply];
  const quantity = Math.floor(Math.random() * (maxQuantity - minQuantity + 1)) + minQuantity;
  
  // Calculate current price based on base price, supply/demand
  const currentPrice = Math.round(basePrice * DEMAND_PRICE_MULTIPLIERS[demand]);
  
  return {
    item: ingredient,
    basePrice,
    currentPrice,
    quantity,
    supply,
    demand,
    priceHistory: [currentPrice]
  };
}

/**
 * Generate a market item for equipment with appropriate pricing
 * @param equipment The equipment to price
 * @returns Market item with pricing information
 */
function generateMarketItemForEquipment(equipment: Equipment): MarketItem<Equipment> {
  // Base rarity multipliers
  const rarityMultipliers = {
    common: 1,
    uncommon: 2.5,
    rare: 6,
    epic: 15,
    legendary: 40
  };
  
  // Base price based on rarity
  const basePrice = 50 * rarityMultipliers[equipment.rarity];
  
  // Equipment is typically more limited in supply than ingredients
  const supplyLevels: Array<'abundant' | 'common' | 'limited' | 'rare' | 'unique'> = 
    ['common', 'limited', 'rare', 'unique'];
  const demandLevels: Array<'unwanted' | 'low' | 'moderate' | 'high' | 'extreme'> = 
    ['unwanted', 'low', 'moderate', 'high', 'extreme'];
  
  // Adjust supply based on equipment rarity
  const supplyIndex = Math.min(
    Math.floor(Math.random() * 2) + 
    (['common', 'uncommon', 'rare', 'epic', 'legendary'].indexOf(equipment.rarity)),
    supplyLevels.length - 1
  );
  const supply = supplyLevels[supplyIndex];
  
  // Randomize demand but with higher chance for moderate and high for better equipment
  let demandIndex;
  if (equipment.rarity === 'common') {
    demandIndex = Math.floor(Math.random() * 3); // unwanted to moderate
  } else if (equipment.rarity === 'uncommon') {
    demandIndex = Math.floor(Math.random() * 3) + 1; // low to high
  } else {
    demandIndex = Math.floor(Math.random() * 3) + 2; // moderate to extreme
  }
  
  const demand = demandLevels[demandIndex];
  
  // Determine quantity based on supply
  const [minQuantity, maxQuantity] = SUPPLY_QUANTITY_RANGES[supply];
  const quantity = Math.floor(Math.random() * (maxQuantity - minQuantity + 1)) + minQuantity;
  
  // Calculate current price based on base price, supply/demand
  const currentPrice = Math.round(basePrice * DEMAND_PRICE_MULTIPLIERS[demand]);
  
  return {
    item: equipment,
    basePrice,
    currentPrice,
    quantity,
    supply,
    demand,
    priceHistory: [currentPrice]
  };
}

/**
 * Apply price fluctuation to a market based on time passed and market activity
 * @param market The market to update
 * @returns Updated market with new prices
 */
export function updateMarketPrices(market: MarketLocation): MarketLocation {
  const updatedMarket = { ...market };
  const updatedInventory = { ...market.inventory };
  
  // Update ingredients prices
  updatedInventory.ingredients = market.inventory.ingredients.map(item => {
    return updateItemPrice(item);
  });
  
  // Update equipment prices
  updatedInventory.equipment = market.inventory.equipment.map(item => {
    return updateItemPrice(item);
  });
  
  // Update potion prices
  updatedInventory.potions = market.inventory.potions.map(item => {
    return updateItemPrice(item);
  });
  
  // Update scroll prices when implemented
  if (market.inventory.scrolls) {
    updatedInventory.scrolls = market.inventory.scrolls.map(item => {
      return updateItemPrice(item);
    });
  }
  
  updatedMarket.inventory = updatedInventory;
  return updatedMarket;
}

/**
 * Update the price of a market item based on supply and demand trends
 * @param item The market item to update
 * @returns Updated market item with new price
 */
function updateItemPrice<T>(item: MarketItem<T>): MarketItem<T> {
  const updatedItem = { ...item };
  
  // Price variation factor (0.9 to 1.1)
  const variationFactor = 0.9 + Math.random() * 0.2;
  
  // Adjust price based on supply and demand
  let priceAdjustment = 1.0;
  
  // Supply affects price - less supply means higher prices
  switch (item.supply) {
    case 'abundant': priceAdjustment *= 0.9; break;
    case 'common': priceAdjustment *= 1.0; break;
    case 'limited': priceAdjustment *= 1.1; break;
    case 'rare': priceAdjustment *= 1.2; break;
    case 'unique': priceAdjustment *= 1.3; break;
  }
  
  // Demand affects price - higher demand means higher prices
  switch (item.demand) {
    case 'unwanted': priceAdjustment *= 0.7; break;
    case 'low': priceAdjustment *= 0.9; break;
    case 'moderate': priceAdjustment *= 1.0; break;
    case 'high': priceAdjustment *= 1.2; break;
    case 'extreme': priceAdjustment *= 1.5; break;
  }
  
  // Calculate new price
  let newPrice = Math.round(item.basePrice * priceAdjustment * variationFactor);
  
  // Ensure price doesn't change too drastically from current price
  const maxChange = item.currentPrice * 0.2; // Max 20% change
  if (newPrice > item.currentPrice + maxChange) {
    newPrice = Math.round(item.currentPrice + maxChange);
  } else if (newPrice < item.currentPrice - maxChange) {
    newPrice = Math.round(item.currentPrice - maxChange);
  }
  
  // Ensure price doesn't go below minimum threshold
  const minPrice = Math.max(Math.round(item.basePrice * 0.5), 1);
  if (newPrice < minPrice) {
    newPrice = minPrice;
  }
  
  // Update price history (keep last 5 prices)
  const updatedPriceHistory = [newPrice, ...item.priceHistory.slice(0, 4)];
  
  return {
    ...updatedItem,
    currentPrice: newPrice,
    priceHistory: updatedPriceHistory
  };
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
  
  // Generate new inventory based on market specialization
  const specialization = market.specialization || 'general';
  updatedMarket.inventory = generateMarketInventory(market.unlockLevel, specialization);
  
  // Update refresh timestamp
  updatedMarket.lastRefreshed = new Date().toISOString();
  
  return updatedMarket;
} 