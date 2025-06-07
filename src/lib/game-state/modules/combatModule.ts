// src/lib/game-state/modules/combatModule.ts
// Combat-related state management

import { CombatState, CombatWizard, CombatLogEntry } from '../../types/combat-types';
import { Wizard } from '../../types/wizard-types';
import { Spell, ActiveEffect, SpellEffect } from '../../types/spell-types';
import { ElementType } from '../../types/element-types';
import { battleLogManager } from '../../combat/battleLogManager';

// Define the slice of state this module manages
export interface CombatSlice {
  combatState: CombatState | null;
}

// Define the actions this module provides
export interface CombatActions {
  initializeCombat: (playerWizard: Wizard, enemyWizard: Wizard, difficulty: 'easy' | 'normal' | 'hard') => void;
  getCombatState: () => CombatState | null;
  selectSpell: (spell: Spell, isPlayer: boolean) => void;
  castSpell: (isPlayer: boolean) => void;
  executeMysticPunch: (spell: Spell | null, isPlayer: boolean) => void;
  skipTurn: (isPlayer: boolean) => void;
  addCombatLogEntry: (entry: Omit<CombatLogEntry, 'timestamp'>) => void;
  processTurnEffects: (isPlayer: boolean) => void;
  endCombat: (winner: 'player' | 'enemy') => void;
  resetCombat: () => void;
}

// Helper to generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to calculate damage based on difficulty and stats
const calculateDamage = (baseDamage: number, isPlayer: boolean, difficulty: 'easy' | 'normal' | 'hard'): number => {
  let damageMultiplier = 1.0;

  // Adjust based on difficulty
  if (isPlayer) {
    // Player does more damage on easy, less on hard
    damageMultiplier = difficulty === 'easy' ? 1.5 :
                      difficulty === 'normal' ? 1.0 : 0.8;
  } else {
    // Enemy does less damage on easy, more on hard
    damageMultiplier = difficulty === 'easy' ? 0.7 :
                      difficulty === 'normal' ? 1.0 : 1.3;
  }

  return Math.round(baseDamage * damageMultiplier);
};

// Minimal working version of applySpellEffect to fix build errors
// DEPRECATED: This module will be phased out in favor of the standardized damage system
const applySpellEffect = (
  effect: SpellEffect,
  caster: CombatWizard,
  target: CombatWizard,
  isPlayerCasting: boolean,
  difficulty: 'easy' | 'normal' | 'hard'
): { damage?: number; healing?: number; newEffects: ActiveEffect[] } => {
  // Return minimal implementation to avoid build errors
  // The standardized damage system in spellExecutor.ts handles actual combat
  return { damage: 0, healing: 0, newEffects: [] };
};

// Create the module
export const createCombatModule = (set: Function, get: Function): CombatActions => ({
  initializeCombat: (playerWizard, enemyWizard, difficulty) => {
    // This function is deprecated and should not be used
    // Combat initialization is handled by the battle system
    console.warn('combatModule.initializeCombat is deprecated - use battle system instead');
  },

  getCombatState: () => {
    return get().combatState;
  },

  selectSpell: (spell, isPlayer) => {
    // This function is deprecated
    console.warn('combatModule.selectSpell is deprecated - use spellExecutor instead');
  },

  castSpell: (isPlayer) => {
    // This function is deprecated
    console.warn('combatModule.castSpell is deprecated - use spellExecutor instead');
  },

  executeMysticPunch: (spell, isPlayer) => {
    // This function is deprecated
    console.warn('combatModule.executeMysticPunch is deprecated - use spellExecutor instead');
  },

  skipTurn: (isPlayer) => {
    // This function is deprecated
    console.warn('combatModule.skipTurn is deprecated - use phaseManager instead');
  },

  addCombatLogEntry: (entry) => {
    // Use the battle log manager to add the entry
    battleLogManager.addEntry(entry);
  },

  processTurnEffects: (isPlayer) => {
    // This function is deprecated
    console.warn('combatModule.processTurnEffects is deprecated - use effectsProcessor instead');
  },

  endCombat: (winner) => {
    set((state: any) => {
      const combatState = { ...state.combatState };
      if (!combatState) return state;

      combatState.status = winner === 'player' ? 'playerWon' : 'enemyWon';

      return { combatState };
    });
  },

  resetCombat: () => {
    set({ combatState: null });
  }
});