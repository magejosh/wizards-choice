// src/lib/types/combat-types.ts
// Combat system types and interfaces

import { ElementType } from './element-types';
import { Spell, ActiveEffect } from './spell-types';
import { Wizard } from './wizard-types';
import { AxialCoord } from '../utils/hexUtils';

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

  // New properties for enhanced combat flow
  currentPhase: CombatPhase;
  firstActor: 'player' | 'enemy'; // Who goes first based on initiative
  initiative: {
    player: number;
    enemy: number;
  };
  actionState: {
    player: ActionState;
    enemy: ActionState;
  };
  // Queue of effects to resolve in the resolution phase
  effectQueue: QueuedEffect[];
  // Tracks if a response is pending
  pendingResponse: {
    active: boolean;
    action: QueuedEffect | null;
    respondingActor: 'player' | 'enemy' | null;
    responseTimeRemaining: number;
  };
}

/**
 * Combat phases
 */
export type CombatPhase = 'initiative' | 'draw' | 'upkeep' | 'action' | 'response' | 'resolve' | 'discard' | 'end';

/**
 * Action states for each actor
 */
export interface ActionState {
  hasActed: boolean;
  hasResponded: boolean;
}

/**
 * Queued effect to be resolved in the resolution phase
 */
export interface QueuedEffect {
  id: string;
  caster: 'player' | 'enemy';
  spell: Spell | null; // null for mystic punch
  spellTier?: number; // for mystic punch
  target: 'player' | 'enemy';
  timestamp: number;
  wasResponded: boolean;
  responseEffect?: QueuedEffect;
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
  equippedPotions: import('./equipment-types').Potion[];
  equippedSpellScrolls: import('./equipment-types').Equipment[];
  position: AxialCoord;
  minions: CombatMinion[];
}

export interface CombatMinion {
  id: string;
  name: string;
  isFlying: boolean;
  position: AxialCoord;
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
  sequence?: number; // Explicit sequence number for ordering
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