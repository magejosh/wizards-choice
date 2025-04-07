// src/lib/combat/combatStatusManager.ts
import { CombatState } from '../types';
import { createLogEntry as createLogEntryFromManager, battleLogManager } from './battleLogManager';

/**
 * Creates a log entry and updates the battle log manager
 */
function createLogEntry(entry: any) {
  const logEntry = createLogEntryFromManager(entry);
  battleLogManager.addEntry(logEntry);
  return logEntry;
}

/**
 * Checks if combat has ended (either wizard has 0 or less HP)
 * @param state The current combat state
 * @returns Updated combat state with status updated if combat has ended
 */
export function checkCombatStatus(state: CombatState): CombatState {
  // If combat is already over, just return the state
  if (state.status !== 'active') {
    return state;
  }

  const newState = { ...state };

  // Check if player is defeated
  if (newState.playerWizard.currentHealth <= 0) {
    newState.status = 'enemyWon';

    // Add to combat log
    createLogEntry({
      turn: newState.turn,
      round: newState.round,
      actor: 'system',
      action: 'combat_end',
      details: 'Enemy won the duel!',
    });

    console.log('Combat ended: Player defeated');
    return newState;
  }

  // Check if enemy is defeated
  if (newState.enemyWizard.currentHealth <= 0) {
    newState.status = 'playerWon';

    // Add to combat log
    createLogEntry({
      turn: newState.turn,
      round: newState.round,
      actor: 'system',
      action: 'combat_end',
      details: 'You won the duel!',
    });

    console.log('Combat ended: Enemy defeated');
    return newState;
  }

  // Combat continues
  return newState;
}

/**
 * Calculate experience gained from combat
 * @param state The final combat state
 * @returns Experience points gained
 */
export function calculateExperienceGained(state: CombatState): number {
  if (state.status !== 'playerWon') {
    return 0;
  }

  const enemyValue = state.enemyWizard.wizard.level * 10;

  // Apply difficulty multiplier
  const difficultyMultiplier = {
    easy: 10,
    normal: 1,
    hard: 0.1,
  }[state.difficulty];

  const experience = Math.floor(enemyValue * difficultyMultiplier);
  console.log('Combat experience calculated:', experience);
  return experience;
}
