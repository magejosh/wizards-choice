// src/lib/types/market-types.ts
// Market system types and interfaces

import { Equipment, Ingredient, Potion } from './equipment-types';
import { SpellScroll } from './spell-types';

/**
 * Represents a market location where players can buy and sell items
 */
export interface MarketLocation {
  id: string;
  name: string;
  description: string;
  unlockLevel: number;
  specialization?: 'ingredients' | 'potions' | 'equipment' | 'scrolls';
  reputationLevel: number;
  inventoryRefreshDays: number;
  lastRefreshed: string;
  inventory: MarketInventory;
  priceMultiplier: number;
  sellPriceMultiplier: number; // Multiplier for selling items (e.g. 0.6 for 60% of buy price)
  prices: Record<string, number>;
}

/**
 * The inventory of items available at a market
 */
export interface MarketInventory {
  ingredients: MarketItem<Ingredient>[];
  potions: MarketItem<Potion>[];
  equipment: MarketItem<Equipment>[];
  scrolls: MarketItem<SpellScroll>[];
}

/**
 * An item that can be bought or sold at a market
 */
export interface MarketItem<T> {
  item: T;
  quantity: number;
  currentPrice: number;
  supply: 'abundant' | 'common' | 'limited' | 'rare' | 'unique';
  demand: 'unwanted' | 'low' | 'moderate' | 'high' | 'extreme';
  priceHistory: number[];
}

/**
 * Represents the player's market-related data
 */
export interface MarketData {
  gold: number;
  transactions: MarketTransaction[];
  reputationLevels: Record<string, number>; // Market ID to reputation level
  visitedMarkets: string[]; // IDs of markets the player has visited
  favoriteMarkets: string[]; // IDs of markets the player has favorited
}

/**
 * Records a transaction made by the player
 */
export interface MarketTransaction {
  id: string;
  marketId: string;
  itemId: string;
  itemName: string;
  itemType: 'ingredient' | 'potion' | 'equipment' | 'scroll';
  quantity: number;
  price: number;
  type: 'buy' | 'sell';
  date: string; // ISO date string
} 