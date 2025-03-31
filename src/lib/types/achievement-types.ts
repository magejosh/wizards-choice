// src/lib/types/achievement-types.ts
// Achievement system and player profile types

import { ElementType } from './element-types';
import { SpellType } from './spell-types';

/**
 * Battle outcome type
 */
export type BattleOutcome = 'victory' | 'defeat' | 'retreat';

/**
 * Player achievement
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
 * Player title
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

/**
 * Player stats and metrics
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