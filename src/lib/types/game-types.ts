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
  theme: 'default' | 'dark' | 'light' | 'highContrast';
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
} 