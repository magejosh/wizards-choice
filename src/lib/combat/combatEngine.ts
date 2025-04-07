// src/lib/combat/combatEngine.ts
// This file now serves as a re-export point for combat-related functions
// Import the functions from their respective modules
import { shuffleArray, drawCards, shuffleDiscardIntoDraw, getPlayerDeck, getEnemyDeck } from './cardManager';
import { processActiveEffects, regenerateMana } from './effectsProcessor';
import { calculateExperienceGained } from './combatStatusManager';
import { initializeCombat, rollInitiative, INITIAL_HAND_SIZE, CARDS_PER_DRAW, MAX_HAND_SIZE } from './combatInitializer';
import { selectSpell, executeSpellCast, executeMysticPunch, applySpellEffect, getEffectName } from './spellExecutor';

// This file has been refactored to improve modularity.
// The original functions have been moved to specialized modules:
// - cardManager.ts: Card and deck operations
// - effectsProcessor.ts: Active effects and mana regeneration
// - combatStatusManager.ts: Combat status checks and experience calculation
// - combatInitializer.ts: Combat initialization and constants
// - spellExecutor.ts: Spell selection and execution
// - phaseManager.ts: Phase management and turn advancement

// Re-export functions for backward compatibility
// This allows existing code to continue importing from combatEngine.ts
// while the implementation has been moved to specialized modules
export {
  // From cardManager.ts
  shuffleArray,
  drawCards,
  shuffleDiscardIntoDraw,
  getPlayerDeck,
  getEnemyDeck,
  // From effectsProcessor.ts
  processActiveEffects,
  regenerateMana,
  // From combatStatusManager.ts
  calculateExperienceGained,
  // From combatInitializer.ts
  initializeCombat,
  rollInitiative,
  INITIAL_HAND_SIZE,
  CARDS_PER_DRAW,
  MAX_HAND_SIZE,
  // From spellExecutor.ts
  selectSpell,
  executeSpellCast,
  executeMysticPunch,
  applySpellEffect,
  getEffectName
  // Note: advancePhase, skipTurn, and queueAction should now be imported directly from phaseManager.ts
  // but we don't re-export them to avoid conflicts with the local implementations
};
