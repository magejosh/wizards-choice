// src/lib/types/combat-types.ts
// Combat system types and interfaces

import { ElementType } from './element-types';
import { Spell, ActiveEffect } from './spell-types';
import { Wizard } from './wizard-types';

/**
 * Combat state
 */
export interface CombatState {
  playerWizard: CombatWizard;
  enemyWizard: CombatWizard;
  turn: number;
  round: number;
  isPlayerTurn: boolean;
  log: CombatLogEntry[];
  status: 'active' | 'playerWon' | 'enemyWon';
  difficulty: 'easy' | 'normal' | 'hard';
  extraTurn?: { for: 'player' | 'enemy' }; // For Time Warp spell effect
}

/**
 * Wizard in combat state
 */
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

/**
 * Combat log entry
 */
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

/**
 * Player state during gameplay
 */
export interface PlayerState {
  wizardId: string;
  gold: number;
  experience: number;
  level: number;
  equipment: any[];
  spells: Spell[];
  potions: any[];
  ingredients: any[];
  discoveredRecipes: any[];
  currentEncounter: any | null;
  completedEncounters: string[];
} 