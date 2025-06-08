// src/lib/combat/combatInitializer.ts
import { CombatState, Wizard } from '../types';
import { calculateWizardStats } from '../wizard/wizardUtils';
import { getRandomInt } from '../utils/randomUtils';
import { getPlayerDeck, getEnemyDeck, shuffleArray } from './cardManager';

// Number of cards to draw initially
export const INITIAL_HAND_SIZE = 3;

// Number of cards to draw at the start of each round
export const CARDS_PER_DRAW = 1;

// Maximum hand size before requiring discard
export const MAX_HAND_SIZE = 2;

/**
 * Roll initiative for combat
 * @returns Object containing player and enemy initiative rolls
 */
export function rollInitiative(): { player: number; enemy: number; firstActor: 'player' | 'enemy' } {
  // Roll d20 for each participant
  const playerRoll = getRandomInt(1, 20);
  const enemyRoll = getRandomInt(1, 20);

  // Determine who goes first
  const firstActor = playerRoll >= enemyRoll ? 'player' : 'enemy';

  return {
    player: playerRoll,
    enemy: enemyRoll,
    firstActor
  };
}

/**
 * Initialize a new combat state
 * @param playerWizard The player's wizard
 * @param enemyWizard The enemy wizard
 * @param difficulty The difficulty level
 * @returns A new combat state
 */
export function initializeCombat(
  playerWizard: Wizard,
  enemyWizard: Wizard,
  difficulty: 'easy' | 'normal' | 'hard'
): CombatState {
  // Calculate stats with equipment bonuses
  const calculatedPlayerWizard = calculateWizardStats(playerWizard);
  const calculatedEnemyWizard = calculateWizardStats(enemyWizard);

  // Roll initiative
  const { player: playerInitiative, enemy: enemyInitiative, firstActor } = rollInitiative();

  // Create initial combat state
  const initialState: CombatState = {
    playerWizard: {
      wizard: calculatedPlayerWizard,
      currentHealth: calculatedPlayerWizard.maxHealth,
      currentMana: calculatedPlayerWizard.maxMana,
      activeEffects: [],
      selectedSpell: null,
      hand: [],          // Current hand of spells
      drawPile: [],      // Spells that can be drawn
      discardPile: [],   // Spells that have been cast/discarded
      equippedPotions: calculatedPlayerWizard.equippedPotions || [],
      equippedSpellScrolls: calculatedPlayerWizard.equippedSpellScrolls || [],
      position: { q: -2, r: 0 },
      minions: [],
    },
    enemyWizard: {
      wizard: calculatedEnemyWizard,
      currentHealth: calculatedEnemyWizard.maxHealth,
      currentMana: calculatedEnemyWizard.maxMana,
      activeEffects: [],
      selectedSpell: null,
      hand: [],          // Current hand of spells
      drawPile: [],      // Spells that can be drawn
      discardPile: [],   // Spells that have been cast/discarded
      position: { q: 2, r: 0 },
      minions: [],
    },
    playerMinions: [],
    enemyMinions: [],
    turn: 1,
    round: 1,
    isPlayerTurn: firstActor === 'player', // Based on initiative
    log: [],
    status: 'active',
    difficulty,

    // New properties for enhanced combat flow
    currentPhase: 'initiative', // Start in initiative phase
    firstActor,
    initiative: {
      player: playerInitiative,
      enemy: enemyInitiative
    },
    actionState: {
      player: { hasActed: false, hasResponded: false },
      enemy: { hasActed: false, hasResponded: false }
    },
    effectQueue: [],
    pendingResponse: {
      active: false,
      action: null,
      respondingActor: null,
      responseTimeRemaining: 0
    }
  };

  // Initialize the player's deck
  const playerDeck = getPlayerDeck(calculatedPlayerWizard);
  initialState.playerWizard.drawPile = shuffleArray([...playerDeck]);

  // Initialize the enemy's deck
  const enemyDeck = getEnemyDeck(calculatedEnemyWizard);
  initialState.enemyWizard.drawPile = shuffleArray([...enemyDeck]);

  // We'll initialize the log in BattleView.tsx to avoid duplicate "duel has begun" messages
  // This allows us to maintain a single battle log across all rounds
  initialState.log = [];

  // Start with initiative phase - don't advance to draw phase yet
  // This allows the UI to show the initiative roll modal
  // Draw initial hands only after initiative phase is complete
  // We'll draw cards in the advancePhase function when transitioning from initiative to draw
  const stateWithBothHands = initialState;

  return stateWithBothHands;
}
