// src/lib/types/game-types.ts
// Game state and settings types

import { Wizard } from './wizard-types';
import { MarketLocation, MarketData } from './market-types';
import { Achievement, PlayerTitle, BattleRecord, PlayerStats } from './achievement-types';

/**
 * Game progress tracking
 */
export interface GameProgress {
  defeatedEnemies: string[];
  unlockedSpells: string[];
  unlockedRecipes?: string[];
  discoveredRecipes?: string[];
  craftedRecipes?: string[];
  currentLocation: 'wizardStudy' | 'duel' | 'levelUp' | 'market';
  questProgress: Record<string, any>;
  
  // Player profile data
  achievements?: Achievement[];
  titles?: PlayerTitle[];
  battleHistory?: BattleRecord[];
  playerStats?: PlayerStats;
}

/**
 * Game settings
 */
export interface GameSettings {
  difficulty: 'easy' | 'normal' | 'hard';
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  colorblindMode: boolean;
  uiScale: number;
  theme: string;
  // Accessibility settings
  highContrastMode: boolean;
  screenReaderMode: boolean;
  textSize: 'small' | 'medium' | 'large';
  // Display settings
  showDamageNumbers: boolean;
  showCombatLog: boolean;
  showTutorialTips: boolean;
}

/**
 * Save slot information
 */
export interface SaveSlot {
  id: number;
  playerName: string;
  level: number;
  lastSaved: string;
  isEmpty: boolean;
}

/**
 * Game notification
 */
export interface GameNotification {
  id: string;
  type: 'achievement' | 'title';
  unlocked?: boolean;
  unlockedDate?: string;
  title: string;
  description: string;
  reward?: string;
  imageUrl?: string;
}

/**
 * Complete game state
 */
export interface GameState {
  player: Wizard;
  gameProgress: GameProgress;
  settings: GameSettings;
  saveSlots: SaveSlot[];
  currentSaveSlot: number;
  markets: MarketLocation[];
  marketData: MarketData;
  notifications: GameNotification[];
} 