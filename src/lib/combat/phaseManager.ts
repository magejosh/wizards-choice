import { CombatState, CombatPhase, QueuedEffect } from '@/lib/types';
import { shuffleDiscardIntoDraw, discardCard, drawCards, processEnemyDiscard, needsToDiscard } from './cardManager';
import { regenerateMana, processActiveEffects } from './effectsProcessor';
import { checkCombatStatus } from './combatStatusManager';
import { createLogEntry, battleLogManager } from './battleLogManager';
import { selectSpell, executeSpellCast, executeMysticPunch } from './spellExecutor';
import { INITIAL_HAND_SIZE, CARDS_PER_DRAW } from './combatInitializer';

// Maximum hand size before requiring discard
export const MAX_HAND_SIZE = 2;

/**
 * Validate the current phase state before transitioning to the next phase
 * @param state The current combat state
 * @param phase The current phase to validate
 * @returns Boolean indicating if the state is valid for transitioning
 */
function validatePhaseState(state: CombatState, phase: CombatPhase): boolean {
  // Check if combat has ended - always valid to transition in this case
  if (state.status !== 'active') {
    return true;
  }

  switch (phase) {
    case 'discard':
      // Check if player needs to discard but hasn't
      const playerDiscardCheck = needsToDiscard(state, true, MAX_HAND_SIZE);
      if (playerDiscardCheck.needsDiscard) {
        console.log(`Player still needs to discard ${playerDiscardCheck.cardsToDiscard} cards`);
        return false;
      }
      return true;

    case 'action':
      // Check if both players have acted
      if (!state.actionState.player.hasActed || !state.actionState.enemy.hasActed) {
        console.log('Not all players have acted yet');
        return false;
      }
      return true;

    case 'response':
      // For response phase, we need to be more flexible
      // If there are no effects in the queue, we can always advance
      if (state.effectQueue.length === 0) {
        console.log('No effects in queue, can advance from response phase');
        return true;
      }

      // If both players have already responded, we can advance
      if (state.actionState.player.hasResponded && state.actionState.enemy.hasResponded) {
        console.log('Both players have responded, can advance from response phase');
        return true;
      }

      // If player has no reaction spells they can cast, auto-respond for them
      if (!state.actionState.player.hasResponded) {
        const playerReactionSpells = state.playerWizard.hand.filter(
          spell => spell.type === 'reaction' && spell.manaCost <= state.playerWizard.currentMana
        );

        if (playerReactionSpells.length === 0) {
          console.log('Player has no reaction spells to cast, auto-responding');
          return true;
        }
      }

      // If enemy has no reaction spells they can cast, auto-respond for them
      if (!state.actionState.enemy.hasResponded) {
        const enemyReactionSpells = state.enemyWizard.hand.filter(
          spell => spell.type === 'reaction' && spell.manaCost <= state.enemyWizard.currentMana
        );

        if (enemyReactionSpells.length === 0) {
          console.log('Enemy has no reaction spells to cast, auto-responding');
          return true;
        }
      }

      console.log('Some players still need to respond');
      return false;

    // For other phases, always valid to transition
    default:
      return true;
  }
}

/**
 * Advance the combat phase to the next phase
 * @param state The current combat state
 * @returns Updated combat state with the next phase
 */
export function advancePhase(state: CombatState): CombatState {
  // First check if combat has ended using the combat status manager
  let newState = checkCombatStatus(state);

  // If combat has ended, don't advance phases
  if (newState.status !== 'active') {
    console.log(`Combat has ended with status: ${newState.status}. Not advancing phases.`);
    // Make sure we're not stuck in a phase that requires player input
    newState.currentPhase = 'end';
    return newState;
  }

  // Get the current phase and determine the next phase
  const currentPhase = newState.currentPhase;
  let nextPhase: CombatPhase;

  // Log the phase transition attempt for debugging
  console.log(`Attempting to advance from ${currentPhase} phase in round ${newState.round}`);

  // Validate current phase state before transitioning
  if (!validatePhaseState(newState, currentPhase)) {
    console.error(`Invalid state for ${currentPhase} phase, cannot advance`);
    // Return current state without advancing to avoid getting stuck
    return newState;
  }

  switch (currentPhase) {
    case 'initiative':
      nextPhase = 'draw';

      // Log phase change using the battle log manager
      // This will use the current timestamp, which will naturally place it
      // at the top of the log (newest first)
      createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: 'system',
        action: 'phase_change',
        details: `Beginning the Draw phase.`
      });

      // Update the state log with the latest entries
      newState.log = battleLogManager.getEntries();
      break;

    case 'draw':
      nextPhase = 'upkeep';

      // Log phase change using the battle log manager
      createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: 'system',
        action: 'phase_change',
        details: `Beginning the Upkeep phase.`
      });

      // Update the state log with the latest entries
      newState.log = battleLogManager.getEntries();
      break;

    case 'upkeep':
      nextPhase = 'action';

      // Reset action state for the new action phase
      newState.actionState = {
        player: { hasActed: false, hasResponded: false },
        enemy: { hasActed: false, hasResponded: false }
      };

      // Log phase change using the battle log manager
      createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: 'system',
        action: 'phase_change',
        details: `Beginning the Action phase.`
      });

      // Update the state log with the latest entries
      newState.log = battleLogManager.getEntries();
      break;

    case 'action':
      // Only advance to response if there are effects in the queue
      if (newState.effectQueue.length > 0) {
        nextPhase = 'response';

        // Reset response state for the new response phase
        newState.actionState.player.hasResponded = false;
        newState.actionState.enemy.hasResponded = false;

        // Log phase change using the battle log manager
        createLogEntry({
          turn: newState.turn,
          round: newState.round,
          actor: 'system',
          action: 'phase_change',
          details: `Beginning the Response phase.`
        });

        // Update the state log with the latest entries
        newState.log = battleLogManager.getEntries();
      } else {
        // Skip response phase if no actions were queued
        nextPhase = 'resolve';

        // **CRITICAL FIX**: Even when skipping response, still resolve any effects
        // that might be in the queue (defensive programming)
        console.log(`Skipping response phase. Resolving ${newState.effectQueue.length} queued effects`);
        newState = resolveQueuedEffects(newState);

        // Log phase change using the battle log manager
        createLogEntry({
          turn: newState.turn,
          round: newState.round,
          actor: 'system',
          action: 'phase_change',
          details: `Skipping Response phase (no actions). Beginning the Resolve phase.`
        });

        // Update the state log with the latest entries
        newState.log = battleLogManager.getEntries();
      }
      break;

    case 'response':
      nextPhase = 'resolve';

      // **CRITICAL FIX**: Actually resolve queued effects before advancing
      // This was the root cause of the spell execution bug
      console.log(`Resolving ${newState.effectQueue.length} queued effects`);
      newState = resolveQueuedEffects(newState);

      // Log phase change using the battle log manager
      createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: 'system',
        action: 'phase_change',
        details: `Beginning the Resolve phase.`
      });

      // Update the state log with the latest entries
      newState.log = battleLogManager.getEntries();
      break;

    case 'resolve':
      nextPhase = 'discard';

      // Log phase change using the battle log manager
      createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: 'system',
        action: 'phase_change',
        details: `Beginning the Discard phase.`
      });

      // Update the state log with the latest entries
      newState.log = battleLogManager.getEntries();
      break;

    case 'discard':
      nextPhase = 'end';

      // Log phase change using the battle log manager
      createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: 'system',
        action: 'phase_change',
        details: `Beginning the End phase.`
      });

      // Update the state log with the latest entries
      newState.log = battleLogManager.getEntries();
      break;

    case 'end':
      // Move to the next round
      newState.round++;

      // We'll let the UI handle the initiative roll
      // Don't roll initiative here to avoid conflicts with the UI roll
      nextPhase = 'initiative';

      // Reset action state for the new round
      newState.actionState = {
        player: { hasActed: false, hasResponded: false },
        enemy: { hasActed: false, hasResponded: false }
      };

      // Log round change using the battle log manager
      createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: 'system',
        action: 'round_change',
        details: `Round ${newState.round} begins!`
      });

      // Update the state log with the latest entries
      newState.log = battleLogManager.getEntries();

      // Log the transition for debugging
      console.log(`Advancing from end phase to initiative phase for round ${newState.round}`);
      break;

    default:
      // This shouldn't happen, but if it does, go to initiative
      console.error(`Unknown phase: ${currentPhase}`);
      nextPhase = 'initiative';
  }

  // Update the phase
  newState.currentPhase = nextPhase;

  // If combat has ended, skip special phase processing
  if (newState.status !== 'active') {
    console.log(`Combat has ended with status: ${newState.status}. Skipping special phase processing.`);
    return newState;
  }

  // Special handling for specific phases
  if (nextPhase === 'draw') {
    // Draw cards for both players
    if (newState.round === 1) {
      // First round, draw initial hands
      console.log('Drawing initial hands in round 1');
      console.log('Player draw pile size:', newState.playerWizard.drawPile.length);
      console.log('Enemy draw pile size:', newState.enemyWizard.drawPile.length);

      // Draw the cards
      newState = drawCards(newState, true, INITIAL_HAND_SIZE, true); // Player
      newState = drawCards(newState, false, INITIAL_HAND_SIZE, true); // Enemy
    } else {
      // For subsequent rounds, draw 1 card each
      newState = drawCards(newState, true, CARDS_PER_DRAW);
      newState = drawCards(newState, false, CARDS_PER_DRAW);
    }
  } else if (nextPhase === 'upkeep') {
    // Shuffle discard piles into draw piles
    newState = shuffleDiscardIntoDraw(newState, true); // Player
    newState = shuffleDiscardIntoDraw(newState, false); // Enemy

    // Regenerate mana for both players
    newState = regenerateMana(newState, true);
    newState = regenerateMana(newState, false);

    // Process active effects for both players
    newState = processActiveEffects(newState, true);
    newState = processActiveEffects(newState, false);
  } else if (nextPhase === 'resolve') {
    // Process the effect queue in the resolve phase
    return resolveQueuedEffects(newState);
  } else if (nextPhase === 'discard') {
    // Process discard phase for both players
    // First check if combat has ended
    if (newState.status !== 'active') {
      console.log(`Combat has ended with status: ${newState.status}. Skipping discard phase.`);
      return newState;
    }

    // Check if player needs to discard (this will be handled by the UI)
    const playerDiscardCheck = needsToDiscard(newState, true, MAX_HAND_SIZE);
    if (playerDiscardCheck.needsDiscard) {
      console.log(`Player needs to discard ${playerDiscardCheck.cardsToDiscard} cards`);
    }

    // Process enemy discard using the cardManager function
    newState = processEnemyDiscard(newState, MAX_HAND_SIZE);

    // Log the hand sizes after discard processing
    console.log(`After discard processing - Player hand: ${newState.playerWizard.hand.length}, Enemy hand: ${newState.enemyWizard.hand.length}`);
    console.log(`Player hand size limit: ${MAX_HAND_SIZE}, Enemy hand size limit: ${MAX_HAND_SIZE}`);

    // If player doesn't need to discard, we can proceed to the end phase
    // If player needs to discard, the UI will handle it and then advance the phase
    if (!playerDiscardCheck.needsDiscard) {
      console.log('Player hand size is within limits, can proceed to end phase');
    } else {
      console.log('Player needs to discard, waiting for UI to handle it');
    }
  }

  return newState;
}

/**
 * Resolve all queued effects in order
 * @param state The current combat state
 * @returns Updated combat state after resolving all effects
 */
function resolveQueuedEffects(state: CombatState): CombatState {
  let newState = { ...state };

  // Get the effect queue
  const queue = [...newState.effectQueue];

  if (queue.length === 0) {
    console.warn('resolveQueuedEffects: Effect queue is empty. No actions to resolve.');
  }

  // Sort the queue by timestamp (oldest first)
  const sortedQueue = queue.sort((a, b) => a.timestamp - b.timestamp);

  // Process each effect in the queue
  for (const effect of sortedQueue) {
    // Check if combat has already ended
    newState = checkCombatStatus(newState);
    if (newState.status !== 'active') {
      console.log(`Combat has ended with status: ${newState.status}. Skipping remaining effects.`);
      break; // Exit the loop if combat has ended
    }

    // Process spell cast or mystic punch
    if (effect.spell) {
      // It's a spell cast
      // Defensive: check if spell is in hand before resolving
      const caster = effect.caster === 'player' ? 'playerWizard' : 'enemyWizard';
      const spellInHand = newState[caster].hand.find(spell => spell.id === effect.spell!.id);
      if (!spellInHand) {
        console.warn(`resolveQueuedEffects: Spell with id ${effect.spell.id} not found in hand for ${caster}. Skipping.`);
        continue; // Skip this effect, do not penalize player
      }
      newState = selectSpell(newState, effect.spell, effect.caster === 'player');
      newState = executeSpellCast(newState, effect.caster === 'player', true);
      console.log(`resolveQueuedEffects: Successfully resolved spell ${effect.spell.name} for ${caster}.`);
    } else if (effect.spellTier !== undefined) {
      // It's a mystic punch
      newState = executeMysticPunch(newState, effect.spellTier, effect.caster === 'player', true);
      console.log(`resolveQueuedEffects: Successfully resolved mystic punch for ${effect.caster}.`);
    }
  }

  // Clear the effect queue
  newState.effectQueue = [];

  return newState;
}

/**
 * Skip the current turn
 * @param state The current combat state
 * @param isPlayer Whether the player is skipping their turn
 * @returns Updated combat state
 */
export function skipTurn(
  state: CombatState,
  isPlayer: boolean
): CombatState {
  let newState = { ...state };

  // Log the action using the battle log manager
  const logEntry = createLogEntry({
    turn: newState.turn,
    round: newState.round,
    actor: isPlayer ? 'player' : 'enemy',
    action: 'skip_turn',
    details: `${isPlayer ? 'You' : 'Enemy'} skipped the turn.`
  });

  // Update the log in the state with the latest entries
  newState.log = [...newState.log.filter(entry => entry.action !== 'skip_turn' || entry.actor !== (isPlayer ? 'player' : 'enemy')), logEntry];

  // Mark this actor appropriately based on the phase
  const actor = isPlayer ? 'player' : 'enemy';

  if (newState.currentPhase === 'action') {
    // In action phase, mark as having acted
    newState.actionState[actor].hasActed = true;

    // Check if both players have acted, and if so, advance to the next phase
    if (newState.actionState.player.hasActed && newState.actionState.enemy.hasActed) {
      return advancePhase(newState);
    }
  } else if (newState.currentPhase === 'response') {
    // In response phase, mark as having responded
    newState.actionState[actor].hasResponded = true;

    // Check if both players have responded, and if so, advance to the next phase
    if (newState.actionState.player.hasResponded && newState.actionState.enemy.hasResponded) {
      return advancePhase(newState);
    }
  }

  return newState;
}

/**
 * Queue an action (spell cast or mystic punch) for the resolution phase
 * @param state The current combat state
 * @param queuedEffect The effect to queue
 * @returns Updated combat state with the queued effect
 */
export function queueAction(
  state: CombatState,
  queuedEffect: Omit<QueuedEffect, 'id' | 'timestamp' | 'wasResponded'>,
  isResponse: boolean = false
): CombatState {
  let newState = { ...state };

  // Create the full effect
  const effect: QueuedEffect = {
    ...queuedEffect,
    id: `effect_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    wasResponded: false
  };

  if (isResponse) {
    // This is a response to an action
    // Find the most recent action from the other actor to respond to
    const actorToRespondTo = queuedEffect.caster === 'player' ? 'enemy' : 'player';
    const actionsToRespondTo = [...newState.effectQueue]
      .filter(e => e.caster === actorToRespondTo && !e.wasResponded);

    // Sort by timestamp (newest first) to get the most recent action
    const actionToRespondTo = actionsToRespondTo.length > 0
      ? actionsToRespondTo.sort((a, b) => b.timestamp - a.timestamp)[0]
      : null;

    if (actionToRespondTo) {
      // Mark the action as having been responded to
      newState.effectQueue = newState.effectQueue.map(e =>
        e.id === actionToRespondTo.id ? { ...e, wasResponded: true, responseEffect: effect } : e
      );

      // Update response state
      const actor = queuedEffect.caster;
      newState.actionState[actor].hasResponded = true;

      // Log the response using the battle log manager
      const actionType = queuedEffect.spell ? 'cast_response' : 'mystic_punch_response';
      const spellName = queuedEffect.spell ? queuedEffect.spell.name : 'Mystic Punch';

      const logEntry = createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: actor,
        action: actionType,
        details: `${actor === 'player' ? 'You' : 'Enemy'} responded with ${spellName}.`,
        spellName: spellName
      });

      // Update the log in the state with the latest entries
      newState.log = [...newState.log, logEntry];

      // Check if both players have responded, and if so, advance to the next phase
      if (newState.actionState.player.hasResponded && newState.actionState.enemy.hasResponded) {
        return advancePhase(newState);
      }
    } else {
      console.error('No action to respond to');
    }
  } else {
    // This is a regular action
    // Add to the queue
    newState.effectQueue = [...newState.effectQueue, effect];

    // Update action state
    const actor = queuedEffect.caster;
    newState.actionState[actor].hasActed = true;

    // Log the action using the battle log manager
    const actionType = queuedEffect.spell ? 'cast_spell' : 'mystic_punch';
    const spellName = queuedEffect.spell ? queuedEffect.spell.name : 'Mystic Punch';

    const logEntry = createLogEntry({
      turn: newState.turn,
      round: newState.round,
      actor: actor,
      action: 'queue_' + actionType,
      details: `${actor === 'player' ? 'You' : 'Enemy'} queued ${spellName} for the resolution phase.`,
      spellName: spellName
    });

    // Update the log in the state with the latest entries
    newState.log = [...newState.log, logEntry];

    // Check if both players have acted, and if so, advance to the next phase
    if (newState.actionState.player.hasActed && newState.actionState.enemy.hasActed) {
      return advancePhase(newState);
    }
  }

  return newState;
}

/**
 * Handles phase transitions and related UI state
 */
export class PhaseManager {
  private setPhase: (phase: CombatPhase) => void;
  private setCombatState: (state: CombatState) => void;
  private setShowDiscardSelection: (show: boolean) => void;
  private setNumCardsToDiscard: (num: number) => void;
  private setIsAnimating: (isAnimating: boolean) => void;
  private setShowInitiativeRoll: (show: boolean) => void;
  private MAX_HAND_SIZE: number;
  private lastHandledPhase: string | null = null;
  private lastHandledRound: number | null = null;

  constructor(
    setPhase: (phase: CombatPhase) => void,
    setCombatState: (state: CombatState) => void,
    setShowDiscardSelection: (show: boolean) => void,
    setNumCardsToDiscard: (num: number) => void,
    setIsAnimating: (isAnimating: boolean) => void,
    setShowInitiativeRoll: (show: boolean) => void,
    maxHandSize: number
  ) {
    this.setPhase = setPhase;
    this.setCombatState = setCombatState;
    this.setShowDiscardSelection = setShowDiscardSelection;
    this.setNumCardsToDiscard = setNumCardsToDiscard;
    this.setIsAnimating = setIsAnimating;
    this.setShowInitiativeRoll = setShowInitiativeRoll;
    this.MAX_HAND_SIZE = maxHandSize;
  }

  /**
   * Handle phase change
   * @param combatState Current combat state
   */
  handlePhaseChange(combatState: CombatState): void {
    if (!combatState) {
      console.error('handlePhaseChange called with null combatState');
      return;
    }

    // Log the current state for debugging
    console.log(`Phase change handler: ${combatState.currentPhase} in round ${combatState.round}`);
    console.log(`Action state: player.hasActed=${combatState.actionState?.player?.hasActed}, player.hasResponded=${combatState.actionState?.player?.hasResponded}`);
    console.log(`Action state: enemy.hasActed=${combatState.actionState?.enemy?.hasActed}, enemy.hasResponded=${combatState.actionState?.enemy?.hasResponded}`);
    console.log(`Effect queue length: ${combatState.effectQueue?.length || 0}`);

    // Check if combat has ended
    if (combatState.status !== 'active') {
      console.log(`Combat has ended with status: ${combatState.status}. Minimal phase handling.`);
      // Just sync the phase and return - don't process any phase-specific logic
      this.setPhase(combatState.currentPhase);

      // Make sure all modals are closed
      this.setShowDiscardSelection(false);
      this.setNumCardsToDiscard(0);
      this.setIsAnimating(false);
      this.setShowInitiativeRoll(false);
      return;
    }

    // Always sync the component phase state with the combat state phase
    this.setPhase(combatState.currentPhase);

    // Create a unique key for this phase and round to avoid duplicates
    const phaseKey = `${combatState.currentPhase}_${combatState.round}_${combatState.turn}`;

    // Check if we've already handled this exact phase in this round and turn to avoid duplicates
    if (this.lastHandledPhase === phaseKey) {
      console.log(`Already handled phase ${combatState.currentPhase} in round ${combatState.round}, turn ${combatState.turn}, skipping`);
      return;
    }

    // Update the last handled phase key
    this.lastHandledPhase = phaseKey;
    this.lastHandledRound = combatState.round;

    console.log(`Phase changed to: ${combatState.currentPhase}, firstActor: ${combatState.firstActor}`);
    console.log(`Player hand size: ${combatState.playerWizard.hand.length}, Enemy hand size: ${combatState.enemyWizard.hand.length}`);

    // Handle phase-specific logic
    switch (combatState.currentPhase) {
      case 'initiative':
        this.handleInitiativePhase(combatState);
        break;
      case 'draw':
        this.handleDrawPhase(combatState);
        break;
      case 'upkeep':
        this.handleUpkeepPhase(combatState);
        break;
      case 'action':
        this.handleActionPhase(combatState);
        break;
      case 'response':
        this.handleResponsePhase(combatState);
        break;
      case 'resolve':
        this.handleResolvePhase(combatState);
        break;
      case 'discard':
        this.handleDiscardPhase(combatState);
        break;
      case 'end':
        this.handleEndPhase(combatState);
        break;
    }
  }

  private handleInitiativePhase(combatState: CombatState): void {
    // Initiative phase is handled by the initiative roll UI
    console.log(`In initiative phase for round ${combatState.round}`);

    // Make sure discard modal is closed
    this.setShowDiscardSelection(false);
    this.setNumCardsToDiscard(0);

    // Reset phase tracking for the new round
    if (combatState.round > 1) {
      console.log(`New round ${combatState.round} started, resetting phase tracking`);
      // We keep the current phase (initiative) as tracked with the new key format
      this.lastHandledPhase = `initiative_${combatState.round}_${combatState.turn}`;
      this.lastHandledRound = combatState.round;
    }

    // Show the initiative roll UI with a slight delay to ensure UI updates properly
    setTimeout(() => {
      console.log('Showing initiative roll UI for new round');
      this.setShowInitiativeRoll(true);
    }, 100);
  }

  private handleDrawPhase(combatState: CombatState): void {
    // Log the current hand sizes
    console.log(`In draw phase - Player hand: ${combatState.playerWizard.hand.length}, Enemy hand: ${combatState.enemyWizard.hand.length}`);
    console.log(`Player draw pile: ${combatState.playerWizard.drawPile.length}, Enemy draw pile: ${combatState.enemyWizard.drawPile.length}`);

    // Close discard modal if open
    this.setShowDiscardSelection(false);
    this.setNumCardsToDiscard(0);

    // Automatically advance from draw to upkeep phase after a delay
    setTimeout(() => {
      if (combatState && combatState.currentPhase === 'draw') {
        console.log('Draw phase complete, advancing to upkeep phase');
        const updatedState = advancePhase(combatState);
        this.setCombatState(updatedState);
      }
    }, 1500);
  }

  private handleUpkeepPhase(combatState: CombatState): void {
    // Log the current state
    console.log(`In upkeep phase - Processing upkeep effects`);

    // Close discard modal if open
    this.setShowDiscardSelection(false);
    this.setNumCardsToDiscard(0);

    // Automatically advance from upkeep to action phase after a delay
    // The actual shuffling and mana regeneration happens in the advancePhase function
    setTimeout(() => {
      if (combatState && combatState.currentPhase === 'upkeep') {
        console.log('Upkeep phase complete, advancing to action phase');
        const updatedState = advancePhase(combatState);
        this.setCombatState(updatedState);
      }
    }, 1500);
  }

  private handleActionPhase(combatState: CombatState): void {
    // Action phase is handled by player/enemy actions
    // Just make sure discard modal is closed
    this.setShowDiscardSelection(false);
    this.setNumCardsToDiscard(0);

    // Reset action state if needed
    let updatedState = { ...combatState };
    let stateChanged = false;

    // Ensure action state is properly initialized
    if (updatedState.actionState === undefined) {
      console.log('Action state was undefined, initializing');
      updatedState.actionState = {
        player: { hasActed: false, hasResponded: false },
        enemy: { hasActed: false, hasResponded: false }
      };
      stateChanged = true;
    }

    // If we made changes to the state, update it
    if (stateChanged) {
      this.setCombatState(updatedState);
      combatState = updatedState;
    }

    // If enemy goes first based on initiative, process their turn
    if (combatState.firstActor === 'enemy' && !combatState.actionState.enemy.hasActed) {
      console.log('Enemy goes first - processing enemy action');
      // Small delay to visualize the phase change
      setTimeout(() => {
        this.processEnemyAction(combatState);
      }, 1000);
    }
  }

  private handleResponsePhase(combatState: CombatState): void {
    // Response phase is handled by player/enemy responses
    // Just make sure discard modal is closed
    this.setShowDiscardSelection(false);
    this.setNumCardsToDiscard(0);

    // If there are no effects in the queue, we can skip the response phase entirely
    if (combatState.effectQueue.length === 0) {
      console.log('No effects in queue, skipping response phase entirely');
      setTimeout(() => {
        const nextPhaseState = advancePhase(combatState);
        this.setCombatState(nextPhaseState);
      }, 500);
      return;
    }

    // Create a local copy of the state to track changes
    let updatedState = { ...combatState };
    let needToAdvancePhase = false;

    // Check if player has any reaction spells they can cast
    if (!updatedState.actionState.player.hasResponded) {
      const playerReactionSpells = updatedState.playerWizard.hand.filter(
        spell => spell.type === 'reaction' && spell.manaCost <= updatedState.playerWizard.currentMana
      );

      if (playerReactionSpells.length === 0) {
        // Player has no reaction spells - auto-skip
        console.log('Player has no reaction spells - auto-skipping response');

        // Mark player as having responded (skipped)
        updatedState.actionState.player.hasResponded = true;

        // Add to combat log using the manager
        battleLogManager.addEntry({
          turn: updatedState.turn,
          round: updatedState.round,
          actor: 'player',
          action: 'auto_skip_response',
          details: 'You had no reaction spells to cast.'
        });

        // Update the log in the state
        updatedState.log = battleLogManager.getEntries();

        // Check if we can advance the phase
        if (updatedState.actionState.enemy.hasResponded) {
          needToAdvancePhase = true;
        }
      }
    }

    // If enemy needs to respond and hasn't yet
    if (!updatedState.actionState.enemy.hasResponded) {
      // Check if enemy has any reaction spells they can cast
      const enemyReactionSpells = updatedState.enemyWizard.hand.filter(
        spell => spell.type === 'reaction' && spell.manaCost <= updatedState.enemyWizard.currentMana
      );

      if (enemyReactionSpells.length === 0) {
        // Enemy has no reaction spells - auto-skip
        console.log('Enemy has no reaction spells - auto-skipping response');

        // Mark enemy as having responded (skipped)
        updatedState.actionState.enemy.hasResponded = true;

        // Add to combat log using the manager
        battleLogManager.addEntry({
          turn: updatedState.turn,
          round: updatedState.round,
          actor: 'enemy',
          action: 'auto_skip_response',
          details: 'Enemy had no reaction spells to cast.'
        });

        // Update the log in the state
        updatedState.log = battleLogManager.getEntries();

        // Check if we can advance the phase
        if (updatedState.actionState.player.hasResponded) {
          needToAdvancePhase = true;
        }
      } else {
        // Enemy has reaction spells - choose one to cast
        // Only process this if we haven't already decided to advance the phase
        if (!needToAdvancePhase) {
          // Update the state first
          this.setCombatState(updatedState);

          setTimeout(() => {
            // Simple AI: just pick the first reaction spell
            const reactionSpell = enemyReactionSpells[0];

            // Queue the reaction spell
            const stateAfterEnemyResponse = queueAction(updatedState, {
              caster: 'enemy',
              spell: reactionSpell,
              target: 'player'
            }, true); // true indicates this is a response

            // Mark enemy as having responded
            stateAfterEnemyResponse.actionState.enemy.hasResponded = true;

            this.setCombatState(stateAfterEnemyResponse);

            // If both players have responded or skipped, advance to resolve phase
            if (stateAfterEnemyResponse.actionState.player.hasResponded) {
              setTimeout(() => {
                const nextPhaseState = advancePhase(stateAfterEnemyResponse);
                this.setCombatState(nextPhaseState);
              }, 1000);
            }
          }, 1500);
          return; // Exit early since we're handling this asynchronously
        }
      }
    }

    // Update the state with any changes
    this.setCombatState(updatedState);

    // If we need to advance the phase, do it after a short delay
    if (needToAdvancePhase) {
      setTimeout(() => {
        console.log('Both players have responded or skipped, advancing to resolve phase');
        const nextPhaseState = advancePhase(updatedState);
        this.setCombatState(nextPhaseState);
      }, 1000);
    }
  }

  private handleResolvePhase(combatState: CombatState): void {
    // Resolve phase is handled by the combat engine
    // Just make sure discard modal is closed
    this.setShowDiscardSelection(false);
    this.setNumCardsToDiscard(0);

    // Allow time for resolving animations to play out
    setTimeout(() => {
      if (combatState && combatState.currentPhase === 'resolve') {
        console.log('Resolve phase complete, advancing to discard phase');
        const updatedState = advancePhase(combatState);
        this.setCombatState(updatedState);
      }
    }, 2500); // Longer delay to allow animations to complete
  }

  private handleDiscardPhase(combatState: CombatState): void {
    console.log(`In discard phase - Player hand: ${combatState.playerWizard.hand.length}, Enemy hand: ${combatState.enemyWizard.hand.length}`);

    // First, process enemy discard to ensure it completes synchronously
    if (combatState.enemyWizard.hand.length > this.MAX_HAND_SIZE) {
      console.log('Processing enemy discard first');
      const stateAfterEnemyDiscard = processEnemyDiscard(combatState, this.MAX_HAND_SIZE);

      // Update the combat state with the enemy's discards
      this.setCombatState(stateAfterEnemyDiscard);

      // Continue with the updated state
      combatState = stateAfterEnemyDiscard;
    }

    // Use the cardManager function to check if player needs to discard
    const { needsDiscard, cardsToDiscard } = needsToDiscard(combatState, true, this.MAX_HAND_SIZE);

    if (needsDiscard) {
      console.log(`Player needs to discard ${cardsToDiscard} cards`);
      this.setNumCardsToDiscard(cardsToDiscard);
      this.setShowDiscardSelection(true);
    } else {
      // Player doesn't need to discard, proceed to next phase
      console.log('Player hand size is within limits, no discard needed');

      // Make sure discard modal is closed
      this.setShowDiscardSelection(false);
      this.setNumCardsToDiscard(0);

      // Verify that enemy has also completed discarding
      if (combatState.enemyWizard.hand.length <= this.MAX_HAND_SIZE) {
        // Both player and enemy have completed discarding, advance to next phase
        console.log('Discard phase complete for both players, advancing to end phase');

        // Advance to next phase with a slight delay to ensure UI updates
        setTimeout(() => {
          if (combatState && combatState.currentPhase === 'discard') {
            const updatedState = advancePhase(combatState);
            this.setCombatState(updatedState);
          }
        }, 1000);
      } else {
        console.error('Enemy discard not complete, cannot advance phase');
      }
    }
  }

  private handleEndPhase(combatState: CombatState): void {
    // End phase should automatically transition to initiative for the next round
    console.log('In end phase - finishing round');

    // Make sure discard modal is closed
    this.setShowDiscardSelection(false);
    this.setNumCardsToDiscard(0);

    // Make sure we're not animating
    this.setIsAnimating(false);

    // Allow time for end phase animations to play out
    setTimeout(() => {
      // Double-check that we're still in the end phase and combat is active
      if (combatState && combatState.currentPhase === 'end' && combatState.status === 'active') {
        console.log('End phase complete, advancing to initiative phase for next round');

        try {
          // Create a new state with the next phase
          const updatedState = advancePhase(combatState);

          // Log the phase transition for debugging
          console.log(`Phase transition: ${combatState.currentPhase} -> ${updatedState.currentPhase}`);
          console.log(`Round transition: ${combatState.round} -> ${updatedState.round}`);

          // Verify that the phase actually changed
          if (updatedState.currentPhase !== 'initiative') {
            console.error(`Phase transition failed: expected initiative, got ${updatedState.currentPhase}`);

            // Force the initiative phase if something went wrong
            const fixedState = { ...updatedState, currentPhase: 'initiative' };
            this.setCombatState(fixedState);
            this.setPhase('initiative');

            // Make sure all modals are closed
            this.setShowDiscardSelection(false);
            this.setNumCardsToDiscard(0);

            // Show the initiative roll UI
            console.log('Forced transition to initiative phase');
            this.setShowInitiativeRoll(true);
            return;
          }

          // Store the updated state so we have it for the initiative roll
          this.setCombatState(updatedState);

          // Wait for the state update to complete before showing the initiative roll
          setTimeout(() => {
            // Verify we're in the initiative phase
            if (updatedState.currentPhase === 'initiative') {
              // By this point the phase should be 'initiative'
              this.setPhase('initiative');

              // Make absolutely sure discard modal is closed before showing initiative
              this.setShowDiscardSelection(false);
              this.setNumCardsToDiscard(0);

              // Show the initiative roll UI
              console.log('Showing initiative roll UI for new round');
              this.setShowInitiativeRoll(true);
            } else {
              console.error('Expected initiative phase after end phase, but got:', updatedState.currentPhase);

              // Force the initiative phase if something went wrong
              const fixedState = { ...updatedState, currentPhase: 'initiative' };
              this.setCombatState(fixedState);
              this.setPhase('initiative');
              this.setShowInitiativeRoll(true);
              console.log('Forced transition to initiative phase');
            }
          }, 200);
        } catch (error) {
          console.error('Error during end phase transition:', error);

          // Force the initiative phase if something went wrong
          const fixedState = { ...combatState, currentPhase: 'initiative', round: combatState.round + 1 };
          this.setCombatState(fixedState);
          this.setPhase('initiative');
          this.setShowInitiativeRoll(true);
          console.log('Forced transition to initiative phase after error');
        }
      }
    }, 1500);
  }

  /**
   * Process enemy action during action phase
   * @param state Current combat state
   */
  private processEnemyAction(state: CombatState): void {
    if (!state || state.actionState.enemy.hasActed) return;

    try {
      this.setIsAnimating(true);
      // Get the enemy wizard info
      const enemyWizard = state.enemyWizard.wizard;

      // Find any spell the enemy can cast
      const availableSpells = state.enemyWizard.hand.filter(
        spell => spell.manaCost <= state.enemyWizard.currentMana
      );

      if (availableSpells.length > 0) {
        // Sort by mana cost (descending) to use the most powerful spell
        const sortedSpells = [...availableSpells].sort((a, b) => b.manaCost - a.manaCost);
        const chosenSpell = sortedSpells[0];

        console.log(`Enemy queuing spell: ${chosenSpell.name}`);

        // Queue the spell action for the resolution phase
        const queuedState = queueAction(state, {
          caster: 'enemy',
          spell: chosenSpell,
          target: 'player'
        });

        // Update the state to reflect the enemy's action
        this.setCombatState(queuedState);

        // If both player and enemy have acted, advance to the next phase
        if (queuedState.actionState.player.hasActed && queuedState.actionState.enemy.hasActed) {
          setTimeout(() => {
            const nextPhaseState = advancePhase(queuedState);
            this.setCombatState(nextPhaseState);
            this.setIsAnimating(false);
          }, 1000);
        } else {
          // Enemy has acted but player hasn't - allow player to take their turn
          setTimeout(() => {
            this.setIsAnimating(false);
          }, 500);
        }
      } else {
        // Enemy has no spells they can cast - skip their turn
        console.log('Enemy has no castable spells - skipping turn');

        // Skip the enemy's turn
        const skipState = skipTurn(state, false);

        // Update the state to reflect the enemy's skipped turn
        this.setCombatState(skipState);

        // If both player and enemy have acted, advance to the next phase
        if (skipState.actionState.player.hasActed && skipState.actionState.enemy.hasActed) {
          setTimeout(() => {
            const nextPhaseState = advancePhase(skipState);
            this.setCombatState(nextPhaseState);
            this.setIsAnimating(false);
          }, 1000);
        } else {
          // Enemy has acted but player hasn't - allow player to take their turn
          setTimeout(() => {
            this.setIsAnimating(false);
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error in enemy action:", error);
      this.setIsAnimating(false);
    }
  }
}
