// src/lib/combat/cardManager.ts
import { CombatState, Spell, Wizard } from '../types';
import { createLogEntry } from './battleLogManager';

/**
 * Discards a specific card from a wizard's hand
 * @param state The current combat state
 * @param cardId The ID of the card to discard
 * @param isPlayer Whether the player or enemy is discarding
 * @param reason Optional reason for the discard (for logging)
 * @returns Updated combat state with the card moved to discard pile
 */
export function discardCard(
  state: CombatState,
  cardId: string,
  isPlayer: boolean,
  reason: string = 'discard'
): CombatState {
  let newState = { ...state };
  const wizard = isPlayer ? 'playerWizard' : 'enemyWizard';
  const actorName = isPlayer ? 'You' : 'Enemy';

  // Get current piles
  const hand = [...newState[wizard].hand];
  const discardPile = [...newState[wizard].discardPile];

  // Find the spell in hand
  const spellIndex = hand.findIndex(spell => spell.id === cardId);
  if (spellIndex === -1) {
    console.warn(`Card with ID ${cardId} not found in ${wizard}'s hand`);
    return newState; // Spell not found
  }

  // Remove from hand and add to discard pile
  const [discardedSpell] = hand.splice(spellIndex, 1);
  discardPile.push(discardedSpell);

  // Update the state
  newState[wizard].hand = hand;
  newState[wizard].discardPile = discardPile;

  // Add to combat log
  newState.log.push(createLogEntry({
    turn: newState.turn,
    round: newState.round,
    actor: isPlayer ? 'player' : 'enemy',
    action: reason,
    details: `${actorName} discarded ${discardedSpell.name}.`,
    spellName: discardedSpell.name
  }));

  console.log(`${actorName} discarded ${discardedSpell.name} (ID: ${cardId}). New hand size: ${hand.length}, discard pile size: ${discardPile.length}`);

  return newState;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param array The array to shuffle
 * @returns A new shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Draw cards from the draw pile into the hand
 * @param state The current combat state
 * @param isPlayer Whether the player is drawing cards
 * @param count The number of cards to draw
 * @param suppressLog Whether to suppress logging the card draw (for initial setup)
 * @returns Updated combat state
 */
export function drawCards(
  state: CombatState,
  isPlayer: boolean,
  count: number,
  suppressLog: boolean = false
): CombatState {
  const newState = { ...state };
  const wizard = isPlayer ? 'playerWizard' : 'enemyWizard';
  const wizardName = isPlayer ? 'You' : 'Enemy';

  console.log(`Drawing ${count} cards for ${wizardName}`);

  // Get current piles
  let hand = [...newState[wizard].hand];
  let drawPile = [...newState[wizard].drawPile];
  let discardPile = [...newState[wizard].discardPile];

  console.log(`Before drawing - Hand: ${hand.length}, Draw pile: ${drawPile.length}, Discard pile: ${discardPile.length}`);

  // Check if draw pile is empty but should have cards
  if (drawPile.length === 0) {
    console.log(`Draw pile is empty for ${wizardName}, initializing deck`);
    // Initialize the deck if it's empty
    const deck = isPlayer ? getPlayerDeck(newState[wizard].wizard) : getEnemyDeck(newState[wizard].wizard);
    drawPile = shuffleArray([...deck]);
    console.log(`Initialized ${wizardName} draw pile with ${drawPile.length} cards`);
  }

  // Calculate actual cards to draw based on extraCardDraw equipment bonus
  let actualCount = count;
  if (newState[wizard].wizard.combatStats?.extraCardDraw) {
    actualCount += newState[wizard].wizard.combatStats.extraCardDraw;
    console.log(`Adjusted draw count to ${actualCount} due to equipment bonus`);
  }

  // Draw cards
  for (let i = 0; i < actualCount; i++) {
    // If draw pile is empty, take damage instead of drawing
    if (drawPile.length === 0) {
      // Reduce health by 1
      newState[wizard].currentHealth = Math.max(0, newState[wizard].currentHealth - 1);

      // Add to combat log
      if (!suppressLog) {
        newState.log.push(createLogEntry({
          turn: newState.turn,
          round: newState.round,
          actor: isPlayer ? 'player' : 'enemy',
          action: 'failed_draw',
          details: `${wizardName} couldn't draw a card and took 1 damage!`,
        }));
      }

      continue; // Skip this draw attempt
    }

    // Draw a card if possible
    const card = drawPile.pop()!;
    hand.push(card);
  }

  // Update the state
  newState[wizard] = {
    ...newState[wizard],
    hand,
    drawPile,
    discardPile,
  };

  console.log(`After drawing - Hand: ${hand.length}, Draw pile: ${drawPile.length}, Discard pile: ${discardPile.length}`);
  if (hand.length > 0) {
    console.log(`First card in hand: ${hand[0].name}`);
  } else {
    console.log(`Hand is empty for ${wizardName}!`);
  }

  // Add to combat log if any cards were drawn and logging is not suppressed
  if (count > 0 && !suppressLog) {
    newState.log.push(createLogEntry({
      turn: newState.turn,
      round: newState.round,
      actor: isPlayer ? 'player' : 'enemy',
      action: 'draw_cards',
      details: `${wizardName} drew ${actualCount} card${actualCount !== 1 ? 's' : ''}.`,
    }));
  }

  return newState;
}

/**
 * Shuffle the discard pile into the draw pile
 * @param state The current combat state
 * @param isPlayer Whether this is for the player
 * @returns Updated combat state
 */
export function shuffleDiscardIntoDraw(
  state: CombatState,
  isPlayer: boolean
): CombatState {
  const newState = { ...state };
  const wizard = isPlayer ? 'playerWizard' : 'enemyWizard';
  const wizardName = isPlayer ? 'You' : 'Enemy';

  // Check if there are cards to shuffle
  if (newState[wizard].discardPile.length > 0) {
    // Get the existing piles
    const drawPile = [...newState[wizard].drawPile];
    const discardPile = [...newState[wizard].discardPile];

    // Shuffle the discard pile and add existing draw pile cards
    const shuffledDeck = shuffleArray([...discardPile]);
    const newDrawPile = [...shuffledDeck, ...drawPile];

    // Update the state
    newState[wizard] = {
      ...newState[wizard],
      drawPile: newDrawPile,
      discardPile: [],
    };

    // Add to combat log
    newState.log.push(createLogEntry({
      turn: newState.turn,
      round: newState.round,
      actor: isPlayer ? 'player' : 'enemy',
      action: 'shuffle_discard',
      details: `${wizardName} shuffled the discard pile back into the draw pile.`,
    }));
  }

  return newState;
}

/**
 * Get the player's deck based on their active deck
 * @param wizard The player's wizard
 * @returns Array of spells for the deck
 */
export function getPlayerDeck(wizard: Wizard): Spell[] {
  // Get the active deck if it exists
  if (wizard.activeDeckId && wizard.decks.length > 0) {
    const activeDeck = wizard.decks.find(deck => deck.id === wizard.activeDeckId);
    if (activeDeck && activeDeck.spells.length > 0) {
      return activeDeck.spells;
    }
  }

  // Fallback to equipped spells if no active deck or empty deck
  return wizard.equippedSpells.length > 0
    ? wizard.equippedSpells
    : wizard.spells.slice(0, 5); // Take first 5 spells as default
}

/**
 * Get the enemy deck based on their equipped spells
 * @param wizard The enemy wizard
 * @returns Array of spells for the deck
 */
export function getEnemyDeck(wizard: Wizard): Spell[] {
  return wizard.equippedSpells.length > 0
    ? wizard.equippedSpells
    : wizard.spells.slice(0, 5); // Take first 5 spells as default
}

/**
 * Process enemy discard for the discard phase
 * @param state The current combat state
 * @param maxHandSize The maximum allowed hand size
 * @returns Updated combat state with enemy discards processed
 */
export function processEnemyDiscard(state: CombatState, maxHandSize: number): CombatState {
  let newState = { ...state };

  try {
    // Check if enemy needs to discard
    if (newState.enemyWizard.hand.length > maxHandSize) {
      // Enemy needs to discard down to maxHandSize
      const numToDiscard = newState.enemyWizard.hand.length - maxHandSize;
      console.log(`Enemy needs to discard ${numToDiscard} cards`);

      // Discard the lowest mana cost cards first (simple AI)
      const sortedHand = [...newState.enemyWizard.hand].sort((a, b) => a.manaCost - b.manaCost);
      for (let i = 0; i < numToDiscard; i++) {
        if (sortedHand.length > 0) {
          const cardToDiscard = sortedHand.shift();
          if (cardToDiscard) {
            newState = discardCard(newState, cardToDiscard.id, false);
          }
        }
      }

      // Verify discard was successful
      if (newState.enemyWizard.hand.length > maxHandSize) {
        console.error(`Enemy discard failed, hand size: ${newState.enemyWizard.hand.length}, max: ${maxHandSize}`);
      } else {
        console.log(`Enemy discard successful, new hand size: ${newState.enemyWizard.hand.length}`);
      }
    } else {
      console.log(`Enemy hand size (${newState.enemyWizard.hand.length}) is within limits, no discard needed`);
    }
  } catch (error) {
    console.error('Error in processEnemyDiscard:', error);
  }

  return newState;
}

/**
 * Check if a player needs to discard cards
 * @param state The current combat state
 * @param isPlayer Whether to check the player or enemy
 * @param maxHandSize The maximum allowed hand size
 * @returns Boolean indicating if discard is needed and number of cards to discard
 */
export function needsToDiscard(state: CombatState, isPlayer: boolean, maxHandSize: number): { needsDiscard: boolean, cardsToDiscard: number } {
  if (!state) {
    console.error('Invalid state passed to needsToDiscard');
    return { needsDiscard: false, cardsToDiscard: 0 };
  }

  const wizard = isPlayer ? 'playerWizard' : 'enemyWizard';

  // Validate that the wizard exists in the state
  if (!state[wizard]) {
    console.error(`Wizard ${wizard} not found in state`);
    return { needsDiscard: false, cardsToDiscard: 0 };
  }

  // Validate that the hand exists
  if (!state[wizard].hand) {
    console.error(`Hand not found for ${wizard}`);
    return { needsDiscard: false, cardsToDiscard: 0 };
  }

  const handSize = state[wizard].hand.length;
  const cardsToDiscard = Math.max(0, handSize - maxHandSize);

  const actorName = isPlayer ? 'Player' : 'Enemy';
  console.log(`${actorName} hand size: ${handSize}, max: ${maxHandSize}, needs to discard: ${cardsToDiscard > 0 ? 'yes' : 'no'}`);

  return {
    needsDiscard: cardsToDiscard > 0,
    cardsToDiscard
  };
}
