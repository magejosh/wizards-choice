// src/lib/types.ts
// Core type definitions for Wizard's Choice game

// User Authentication
export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  email: string;
}

// Spell Types
export type SpellType = 'attack' | 'healing' | 'debuff' | 'buff' | 'reaction';
export type ElementType = 'fire' | 'water' | 'earth' | 'air' | 'arcane' | 'nature' | 'shadow' | 'light';

export interface Spell {
  id: string;
  name: string;
  type: SpellType;
  element: ElementType;
  tier: number; // 1-10
  manaCost: number;
  power: number; // Base power for damage or healing
  description: string;
  effect?: ActiveEffect; // Effect that can be applied
  imagePath?: string; // Path to spell image, default is placeholder
}

export interface ActiveEffect {
  id?: string;
  name: string;
  type: 'damage_over_time' | 'healing_over_time' | 'mana_drain' | 'mana_regen' | 'stun' | 'silence';
  value: number;
  duration: number; // In turns
  source?: 'player' | 'enemy';
}

// Equipment Types
export type EquipmentSlot = 'head' | 'hand' | 'body' | 'neck' | 'finger' | 'belt';
export type HandEquipment = 'wand' | 'staff' | 'dagger' | 'sword' | 'spellbook';
export type PotionType = 'health' | 'mana' | 'strength' | 'protection' | 'elemental' | 'luck';

/**
 * Ingredient rarity determines how common ingredients are in loot drops
 * and affects the potency of potions created with them
 */
export type IngredientRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

/**
 * Ingredient categories help organize ingredients by their properties
 */
export type IngredientCategory = 'herb' | 'crystal' | 'essence' | 'fungus' | 'catalyst' | 'core';

/**
 * Represents a potion crafting ingredient that can be gathered and used in recipes
 */
export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  rarity: IngredientRarity;
  description: string;
  properties: string[];
  imagePath?: string;
}

/**
 * Represents a discoverable potion crafting recipe
 */
export interface PotionRecipe {
  id: string;
  name: string;
  resultType: PotionType;
  resultTier: number;
  ingredients: {
    ingredientId: string;
    count: number;
  }[];
  discovered: boolean;
  description: string;
}

export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  type?: HandEquipment; // For hand slot items
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  bonuses: StatBonus[];
  description: string;
  imagePath?: string;
}

export interface StatBonus {
  stat: 'health' | 'mana' | 'damage' | 'defense';
  value: number;
}

export interface Potion {
  id: string;
  name: string;
  type: PotionType;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  effect: {
    value: number;
    duration?: number;
  };
  description: string;
  imagePath?: string;
}

// Wizard Types
export interface Wizard {
  id: string;
  name: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  manaRegen: number;
  spells: Spell[];
  equippedSpells: Spell[];
  equipment: Record<string, Equipment | undefined>;
  inventory?: Equipment[];
  potions: Potion[];
  equippedPotions: Potion[];
  ingredients?: Ingredient[];
  discoveredRecipes?: PotionRecipe[];
  levelUpPoints: number;
  decks?: {
    id: string;
    name: string;
    spells: Spell[];
    dateCreated: string;
    lastModified: string;
  }[];
  activeDeckId?: string | null;
  combatStats?: {
    mysticPunchPower?: number;
    bleedEffect?: number;
    extraCardDraw?: number;
    canDiscardAndDraw?: boolean;
    potionSlots?: number;
  };
}

// Enemy Types
export interface Enemy {
  id: string;
  name: string;
  health: number;
  mana: number;
  level: number;
  spells: Spell[];
  goldReward?: number;
  expReward?: number;
  weakness?: ElementType;
  resistance?: ElementType;
  imagePath?: string;
}

// Encounter Types
export interface Encounter {
  id: string;
  name: string;
  description: string;
  enemyId: string;
  requiredLevel?: number;
  rewardsGold?: number;
  rewardsExp?: number;
  rewardsItem?: string;
  isAvailable: boolean;
}

// Combat Types
export interface CombatState {
  player: CombatWizard;
  enemy: CombatWizard;
  turn: number;
  round: number;
  status: 'active' | 'playerWon' | 'enemyWon';
  battleResult: 'playerWon' | 'enemyWon' | null;
}

export interface CombatWizard {
  name: string;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  spells: Spell[];
  activeEffects: ActiveEffect[];
  hand: Spell[];         // Current hand of spells
  drawPile: Spell[];     // Spells that can be drawn
  discardPile: Spell[];  // Spells that have been cast/discarded
  
  // Combat stats
  damageBonus?: number;  // Bonus damage from equipment/effects
  healingBonus?: number; // Bonus healing from equipment/effects
  defense?: number;      // Damage reduction
  criticalChance?: number; // Chance for critical hits
  weakness?: ElementType; // Element this wizard is weak against
  resistance?: ElementType; // Element this wizard resists
}

// Player State
export interface PlayerState {
  wizardId: string;
  gold: number;
  experience: number;
  level: number;
  equipment: Equipment[];
  spells: Spell[];
  potions: Potion[];
  ingredients: Ingredient[];
  discoveredRecipes: PotionRecipe[];
  currentEncounter: Encounter | null;
  completedEncounters: string[];
}

// Game State Types
export interface GameProgress {
  defeatedEnemies: string[];
  unlockedSpells: string[];
  unlockedRecipes?: string[];
  discoveredRecipes?: string[];
  craftedRecipes?: string[];
  currentLocation: 'wizardStudy' | 'duel' | 'levelUp' | 'market';
  questProgress: Record<string, any>;
}

export interface GameSettings {
  difficulty: 'easy' | 'normal' | 'hard';
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  colorblindMode: boolean;
  uiScale: number;
  theme: 'default' | 'dark' | 'light' | 'highContrast';
}

export interface SaveSlot {
  id: number;
  playerName: string;
  level: number;
  lastSaved: string;
  isEmpty: boolean;
}

export interface GameState {
  player: Wizard;
  gameProgress: GameProgress;
  settings: GameSettings;
  saveSlots: SaveSlot[];
  currentSaveSlot: number;
  markets: MarketLocation[];
  marketData: MarketData;
}

// Market System Types

/**
 * Represents a market location where players can buy and sell items
 */
export interface MarketLocation {
  id: string;
  name: string;
  description: string;
  unlockLevel: number; // Player level required to unlock this market
  specialization?: 'ingredients' | 'potions' | 'equipment' | 'scrolls'; // Market specialization affects available inventory
  reputationLevel: number; // Reputation with this market (0-100)
  inventoryRefreshDays: number; // Days before inventory refreshes
  lastRefreshed: string; // ISO date string of last refresh
  inventory: MarketInventory;
  priceMultiplier: number; // Base price modifier for this market (0.8-1.5)
}

/**
 * The inventory of items available at a market
 */
export interface MarketInventory {
  ingredients: MarketItem<Ingredient>[];
  potions: MarketItem<Potion>[];
  equipment: MarketItem<Equipment>[];
  scrolls?: MarketItem<SpellScroll>[]; // Added later when spell scroll system is implemented
}

/**
 * An item that can be bought or sold at a market
 */
export interface MarketItem<T> {
  item: T;
  basePrice: number;
  currentPrice: number; // Fluctuates based on supply/demand
  quantity: number; // Available quantity
  supply: 'abundant' | 'common' | 'limited' | 'rare' | 'unique'; // Affects price and quantity
  demand: 'unwanted' | 'low' | 'moderate' | 'high' | 'extreme'; // Affects price fluctuation
  priceHistory: number[]; // Last 5 prices for tracking trends
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

/**
 * Placeholder for the spell scroll system that will be implemented later
 */
export interface SpellScroll {
  id: string;
  name: string;
  spell: Spell;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  description: string;
  isConsumable: boolean; // If true, consumed on use; if false, can be kept
  imagePath?: string;
}
