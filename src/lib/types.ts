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
  description: string;
  effects: SpellEffect[];
  imagePath: string;
}

export interface ActiveEffect {
  id?: string;
  name: string;
  type: 'damage_over_time' | 'healing_over_time' | 'mana_drain' | 'mana_regen' | 'stun' | 'silence';
  value: number;
  duration: number; // In turns
  remainingDuration: number; // Remaining turns for the effect
  source?: 'player' | 'enemy';
  effect?: SpellEffect; // The original spell effect that created this active effect
}

// Equipment Types
export type EquipmentSlot = 'head' | 'hand' | 'body' | 'neck' | 'finger' | 'belt';
export type HandEquipment = 'wand' | 'staff' | 'dagger' | 'sword' | 'spellbook' | 'scroll';
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
  effects: string[];
  quantity: number;
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

export interface StatBonus {
  stat: 'health' | 'maxHealth' | 'mana' | 'maxMana' | 'damage' | 'defense' | 'spellPower' | 'manaRegen' | 'manaCostReduction' | 'mysticPunchPower' | 'bleedEffect' | 'extraCardDraw' | 'potionSlots' | 'potionEffectiveness' | 'elementalAffinity';
  value: number;
  element?: ElementType; // For elemental affinity bonuses
}

/**
 * Represents a spell scroll that can be used to learn a new spell
 */
export interface SpellScroll {
  id: string;
  name: string;
  type: 'scroll';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  spell: Spell;
  description: string;
  imagePath?: string;
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
  spell?: Spell; // For spell scrolls
  unlocked: boolean;
  equipped: boolean;
  unlockedDate?: Date;
  requiredLevel?: number;
  requiredAchievements?: string[];
  requiredStats?: { stat: string; value: number; }[];
  bonus?: {
    health?: number;
    mana?: number;
    manaRegen?: number;
    damage?: number;
    defense?: number;
    criticalChance?: number;
    criticalDamage?: number;
    potionSlots?: number;
  };
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
  equipment?: Record<string, Equipment | undefined>;
  archetype?: string;
}

export interface EnemyArchetype {
  name: string;
  description: string;
  baseStats: {
    health: number;
    mana: number;
    manaRegen: number;
  };
  specialSpells: Spell[];
  thematicSpells: Spell[];
  specialEquipment: Record<string, Equipment>;
  weaknesses: ElementType[];
  resistances: ElementType[];
  imagePath: string;
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
  playerWizard: CombatWizard;
  enemyWizard: CombatWizard;
  turn: number;
  round: number;
  isPlayerTurn: boolean;
  log: CombatLogEntry[];
  status: 'active' | 'playerWon' | 'enemyWon';
  difficulty: 'easy' | 'normal' | 'hard';
  extraTurn?: { for: 'player' | 'enemy' }; // Add this for Time Warp spell effect
}

export interface CombatWizard {
  wizard: Wizard;
  currentHealth: number;
  currentMana: number;
  activeEffects: ActiveEffect[];
  selectedSpell: Spell | null;
  hand: Spell[];
  drawPile: Spell[];
  discardPile: Spell[];
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

// Player Profile System Types

/**
 * Player stats that track game progress and achievements
 */
export interface PlayerStats {
  // Combat Statistics
  battlesTotal: number;
  battlesWon: number;
  battlesLost: number;
  damageDealt: number;
  damageReceived: number;
  healingDone: number;
  criticalHitsLanded: number;
  criticalHitsReceived: number;
  mysticPunchesUsed: number;
  totalTurns: number;
  shortestVictory: number;
  longestBattle: number;
  averageTurnsPerVictory: number;
  flawlessVictories: number;

  // Spell Statistics
  spellsCast: {
    total: number;
    byType: Record<string, number>;
    byElement: Record<string, number>;
  };
  spellsAcquired: number;

  // Collection Statistics
  equipmentCollected: number;
  potionsCrafted: number;
  ingredientsGathered: number;
  recipesDiscovered: number;
  scrollsUsed: number;

  // Economic Statistics
  goldEarned: number;
  goldSpent: number;
  totalExperienceGained: number;

  // Elemental Damage Tracking
  elementalDamage: Record<string, number>;

  // Progression Statistics
  levelsGained: number;
  skillPointsSpent: number;

  // Efficiency Metrics
  damagePerMana: number;
  goldPerBattle: number;
  experiencePerBattle: number;
}

/**
 * Achievement that can be unlocked by the player
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedDate?: Date;
  currentProgress: number;
  requiredProgress: number;
  progress: number;
  reward?: {
    type: 'stat_bonus' | 'gold';
    stat?: string;
    value?: number;
  };
  hidden?: boolean;
}

/**
 * Title that can be earned and equipped by the player
 */
export interface PlayerTitle {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  equipped: boolean;
  requiredLevel?: number;
  requiredAchievements?: string[];
  requiredStats?: Array<{
    stat: string;
    value: number;
  }>;
  bonus?: {
    type: string;
    value: number;
  };
}

/**
 * Battle outcome type
 */
export type BattleOutcome = 'victory' | 'defeat' | 'retreat';

/**
 * Spell casting record for battle history
 */
export interface SpellCastRecord {
  total: number;
  byType: Partial<Record<SpellType, number>>;
  byElement: Partial<Record<ElementType, number>>;
}

/**
 * Record of a battle that occurred
 */
export interface BattleRecord {
  id: string;
  enemyName: string;
  chapterName?: string;
  outcome: BattleOutcome;
  date: Date | string;
  duration: number; // in seconds or turns
  damageDealt: number;
  damageTaken: number;
  spellsCast: SpellCastRecord;
  itemsUsed: number;
  rewards?: string;
  notes?: string;
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
  
  // New fields for the player profile system
  achievements?: Achievement[];
  titles?: PlayerTitle[];
  battleHistory?: BattleRecord[];
  playerStats?: PlayerStats;
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
  unlockLevel: number;
  specialization?: 'ingredients' | 'potions' | 'equipment' | 'scrolls';
  reputationLevel: number;
  inventoryRefreshDays: number;
  lastRefreshed: string;
  inventory: MarketInventory;
  priceMultiplier: number;
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

export interface SpellEffect {
  type: 'damage' | 'healing' | 'buff' | 'debuff' | 'control' | 'summon' | 'utility' | 'timeRewind' | 
        'delay' | 'confusion' | 'damageBonus' | 'defense' | 'spellEcho' | 
        'manaRestore' | 'statModifier' | 'statusEffect';
  value: number;
  target: 'self' | 'enemy';
  element: ElementType;
  duration?: number;
}

export interface CombatLogEntry {
  turn: number;
  round: number;
  actor: string;
  action: string;
  target?: string;
  value?: number;
  element?: ElementType;
  timestamp: number;
  details?: string;
  damage?: number;
  healing?: number;
  mana?: number;
  spellName?: string;
}
