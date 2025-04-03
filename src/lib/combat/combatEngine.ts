// src/lib/combat/combatEngine.ts
import { CombatState, CombatWizard, Wizard, Spell, SpellEffect, ActiveEffect, CombatLogEntry } from '../types';
import { calculateWizardStats } from '../wizard/wizardUtils';
import { getAISpellSelection } from './aiEngine';
import { getRandomInt } from '../utils/randomUtils';
import { calculateDamage, calculateHealing } from '../utils/combatUtils';

// Number of cards to draw initially
const INITIAL_HAND_SIZE = 3;

// Number of cards to draw at the start of each round
const CARDS_PER_DRAW = 1;

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
    },
    turn: 1,
    round: 1,
    isPlayerTurn: true, // Player goes first
    log: [],
    status: 'active',
    difficulty,
  };
  
  // Initialize the player's deck
  const playerDeck = getPlayerDeck(calculatedPlayerWizard);
  initialState.playerWizard.drawPile = shuffleArray([...playerDeck]);
  
  // Initialize the enemy's deck
  const enemyDeck = getEnemyDeck(calculatedEnemyWizard);
  initialState.enemyWizard.drawPile = shuffleArray([...enemyDeck]);
  
  // Draw initial hands
  const stateWithPlayerHand = drawCards(initialState, true, INITIAL_HAND_SIZE);
  const stateWithBothHands = drawCards(stateWithPlayerHand, false, INITIAL_HAND_SIZE);
  
  // Add initial log entry
  stateWithBothHands.log.push(createLogEntry({
    turn: 1,
    round: 1,
    actor: 'player',
    action: 'combat_start',
    details: 'The duel has begun! May the best wizard win.',
  }));
  
  return stateWithBothHands;
}

/**
 * Get the player's deck based on their active deck
 * @param wizard The player's wizard
 * @returns Array of spells for the deck
 */
function getPlayerDeck(wizard: Wizard): Spell[] {
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
function getEnemyDeck(wizard: Wizard): Spell[] {
  return wizard.equippedSpells.length > 0 
    ? wizard.equippedSpells 
    : wizard.spells.slice(0, 5); // Take first 5 spells as default
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param array The array to shuffle
 * @returns A new shuffled array
 */
function shuffleArray<T>(array: T[]): T[] {
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
 * @returns Updated combat state
 */
function drawCards(
  state: CombatState,
  isPlayer: boolean,
  count: number
): CombatState {
  const newState = { ...state };
  const wizard = isPlayer ? 'playerWizard' : 'enemyWizard';
  const wizardName = isPlayer ? 'You' : 'Enemy';
  
  // Get current piles
  let hand = [...newState[wizard].hand];
  let drawPile = [...newState[wizard].drawPile];
  let discardPile = [...newState[wizard].discardPile];
  
  // Calculate actual cards to draw based on extraCardDraw equipment bonus
  let actualCount = count;
  if (newState[wizard].wizard.combatStats?.extraCardDraw) {
    actualCount += newState[wizard].wizard.combatStats.extraCardDraw;
  }
  
  // Draw cards
  for (let i = 0; i < actualCount; i++) {
    // If draw pile is empty, take damage instead of drawing
    if (drawPile.length === 0) {
      // Reduce health by 1
      newState[wizard].currentHealth = Math.max(0, newState[wizard].currentHealth - 1);
      
      // Add to combat log
      newState.log.push(createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: isPlayer ? 'player' : 'enemy',
        action: 'failed_draw',
        details: `${wizardName} couldn't draw a card and took 1 damage!`,
      }));
      
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
  
  // Add to combat log if any cards were drawn
  if (count > 0) {
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
 * Process the end-of-turn discard phase
 * @param state The current combat state
 * @param isPlayerActive Whether the player is the active wizard
 * @returns Updated combat state with a flag indicating if the player needs to discard
 */
export function processDiscardPhase(
  state: CombatState,
  isPlayerActive: boolean
): { state: CombatState, needsPlayerDiscard: boolean } {
  let newState = { ...state };
  const wizard = isPlayerActive ? 'playerWizard' : 'enemyWizard';
  const wizardName = isPlayerActive ? 'You' : 'Enemy';
  
  console.log(`DEBUG processDiscardPhase: Checking discard for ${wizardName}, hand size:`, newState[wizard].hand.length);
  
  // Add a log entry that we've entered discard phase
  newState.log.push(createLogEntry({
    turn: newState.turn,
    round: newState.round,
    actor: isPlayerActive ? 'player' : 'enemy',
    action: 'phase_change',
    details: `${wizardName} entered discard phase`,
  }));
  
  // Check if hand size exceeds MAX_HAND_SIZE (which is 2)
  const MAX_HAND_SIZE = 2;
  if (newState[wizard].hand.length > MAX_HAND_SIZE) {
    const cardsToDiscard = newState[wizard].hand.length - MAX_HAND_SIZE;
    console.log(`DEBUG processDiscardPhase: Need to discard ${cardsToDiscard} cards`);
    
    // Add to combat log
    newState.log.push(createLogEntry({
      turn: newState.turn,
      round: newState.round,
      actor: isPlayerActive ? 'player' : 'enemy',
      action: 'discard_required',
      details: `${wizardName} must discard ${cardsToDiscard} card${cardsToDiscard !== 1 ? 's' : ''}`,
    }));
    
    // For enemy, auto-discard (can be improved with better AI logic)
    if (!isPlayerActive) {
      // Simple AI: discard first card
      const cardToDiscard = newState[wizard].hand[0];
      newState = discardSpell(newState, cardToDiscard.id, false);
      console.log('DEBUG processDiscardPhase: Enemy auto-discarded a card');
      
      return { state: newState, needsPlayerDiscard: false };
    }
    
    // For player, flag that they need to discard
    console.log('DEBUG processDiscardPhase: Player must discard, returning needsPlayerDiscard: true');
    return { state: newState, needsPlayerDiscard: true };
  }
  
  // No discard needed
  console.log('DEBUG processDiscardPhase: No discard needed, hand size <= MAX_HAND_SIZE');
  newState.log.push(createLogEntry({
    turn: newState.turn,
    round: newState.round,
    actor: isPlayerActive ? 'player' : 'enemy',
    action: 'phase_change',
    details: `${wizardName} completed discard phase with ${newState[wizard].hand.length} cards in hand`,
  }));
  
  return { state: newState, needsPlayerDiscard: false };
}

/**
 * Discard a spell from hand to the discard pile
 * @param state The current combat state
 * @param spellId The ID of the spell to discard
 * @param isPlayer Whether the player is discarding
 * @returns Updated combat state
 */
export function discardSpell(
  state: CombatState,
  spellId: string,
  isPlayer: boolean
): CombatState {
  const newState = { ...state };
  const wizard = isPlayer ? 'playerWizard' : 'enemyWizard';
  
  // Get current piles
  const hand = [...newState[wizard].hand];
  const discardPile = [...newState[wizard].discardPile];
  
  // Find the spell in hand
  const spellIndex = hand.findIndex(spell => spell.id === spellId);
  if (spellIndex === -1) return newState; // Spell not found
  
  // Move the spell to discard pile
  const [spell] = hand.splice(spellIndex, 1);
  discardPile.push(spell);
  
  // Update the state
  newState[wizard] = {
    ...newState[wizard],
    hand,
    discardPile,
  };
  
  // Add to combat log
  newState.log.push(createLogEntry({
    turn: newState.turn,
    round: newState.round,
    actor: isPlayer ? 'player' : 'enemy',
    action: 'discard_spell',
    details: `${isPlayer ? 'You' : 'Enemy'} discarded ${spell.name}.`,
  }));
  
  return newState;
}

/**
 * Select a spell for a wizard to cast
 * @param state The current combat state
 * @param spell The spell to select
 * @param isPlayer Whether the spell is being selected by the player
 * @returns Updated combat state
 */
export function selectSpell(
  state: CombatState,
  spell: Spell | null,
  isPlayer: boolean
): CombatState {
  const newState = { ...state };
  
  if (isPlayer) {
    newState.playerWizard = {
      ...newState.playerWizard,
      selectedSpell: spell,
    };
  } else {
    newState.enemyWizard = {
      ...newState.enemyWizard,
      selectedSpell: spell,
    };
  }
  
  return newState;
}

/**
 * Execute a mystic punch attack
 * @param state The current combat state
 * @param spellTier The tier of the spell used for the punch
 * @param isPlayer Whether the punch is being done by the player
 * @returns Updated combat state
 */
export function executeMysticPunch(
  state: CombatState,
  spellTier: number,
  isPlayer: boolean
): CombatState {
  let newState = { ...state };
  const actor = isPlayer ? 'player' : 'enemy';
  const target = isPlayer ? 'enemyWizard' : 'playerWizard';
  const caster = isPlayer ? 'playerWizard' : 'enemyWizard';
  
  // Get the selected spell from the combat state
  const selectedSpell = newState[caster].selectedSpell;
  console.log(`DEBUG executeMysticPunch: Selected spell for mystic punch:`, selectedSpell);
  
  // Calculate damage based on spell tier and difficulty
  let damageModifier = 0;
  if (state.difficulty === 'easy') {
    damageModifier = isPlayer ? 20 : 5;
  } else if (state.difficulty === 'normal') {
    damageModifier = isPlayer ? 5 : 10;
  } else {
    damageModifier = isPlayer ? 2 : 15;
  }
  
  // Apply mystic punch power from equipment
  if (isPlayer && state.playerWizard.wizard.combatStats?.mysticPunchPower) {
    damageModifier += state.playerWizard.wizard.combatStats.mysticPunchPower;
  } else if (!isPlayer && state.enemyWizard.wizard.combatStats?.mysticPunchPower) {
    damageModifier += state.enemyWizard.wizard.combatStats.mysticPunchPower;
  }
  
  const damage = spellTier + damageModifier;
  
  // Apply damage to target
  newState[target] = {
    ...newState[target],
    currentHealth: Math.max(0, newState[target].currentHealth - damage),
  };
  
  // Add to combat log
  newState.log.push(createLogEntry({
    turn: newState.turn,
    round: newState.round,
    actor,
    action: 'mystic_punch',
    details: `${actor === 'player' ? 'You' : 'Enemy'} used Mystic Punch for ${damage} damage!`,
    damage,
  }));
  
  // Check if we have a selected spell to discard
  if (selectedSpell) {
    console.log(`DEBUG executeMysticPunch: Attempting to discard spell ID ${selectedSpell.id}`);
    
    // Look for the spell in the hand by ID
    const spellInHand = newState[caster].hand.find(s => s.id === selectedSpell.id);
    
    if (spellInHand) {
      console.log(`DEBUG executeMysticPunch: Found spell in hand, discarding it:`, spellInHand.name);
      // Correctly discard the spell using the discardSpell function
      newState = discardSpell(newState, selectedSpell.id, isPlayer);
    } else {
      console.log(`DEBUG executeMysticPunch: Warning - Selected spell not found in hand!`);
    }
  } else {
    console.log(`DEBUG executeMysticPunch: Warning - No selected spell to discard!`);
  }
  
  // Clear selected spell
  newState[caster].selectedSpell = null;
  
  // Check if combat has ended
  if (newState[target].currentHealth <= 0) {
    newState.status = isPlayer ? 'playerWon' : 'enemyWon';
    newState.log.push(createLogEntry({
      turn: newState.turn,
      round: newState.round,
      actor,
      action: 'combat_end',
      details: `${actor === 'player' ? 'You' : 'Enemy'} won the duel!`,
    }));
  }
  
  // Proceed with advancing turn (discard phase will be handled after both players have acted)
  return advanceTurn(newState);
}

/**
 * Execute the casting of a spell
 * @param state The current combat state
 * @param isPlayer Whether the spell is being cast by the player
 * @returns Updated combat state
 */
export function executeSpellCast(
  state: CombatState,
  isPlayer: boolean
): CombatState {
  let newState = { ...state };
  const actor = isPlayer ? 'player' : 'enemy';
  const caster = isPlayer ? 'playerWizard' : 'enemyWizard';
  const spell = newState[caster].selectedSpell;
  
  if (!spell) {
    // No spell selected, just advance the turn
    return advanceTurn(newState);
  }
  
  // Check if the caster has enough mana to cast the spell
  if (newState[caster].currentMana < spell.manaCost) {
    // If not enough mana, log it and don't cast the spell
    newState.log.push(createLogEntry({
      turn: newState.turn,
      round: newState.round,
      actor,
      action: 'cast_failed',
      spellName: spell.name,
      details: `${actor === 'player' ? 'You' : 'Enemy'} tried to cast ${spell.name} but didn't have enough mana!`,
    }));
    
    // Proceed with advancing turn without casting
    return advanceTurn(newState);
  }
  
  // Deduct mana cost
  newState[caster] = {
    ...newState[caster],
    currentMana: newState[caster].currentMana - spell.manaCost,
    selectedSpell: null, // Clear selected spell
  };
  
  // Log spell cast
  newState.log.push(createLogEntry({
    turn: newState.turn,
    round: newState.round,
    actor,
    action: 'cast',
    spellName: spell.name,
    details: `${actor === 'player' ? 'You' : 'Enemy'} cast ${spell.name}!`,
  }));
  
  // Apply spell effects
  spell.effects.forEach(effect => {
    newState = applySpellEffect(newState, effect, isPlayer);
  });
  
  // Move the spell from hand to discard pile
  const spellInHand = newState[caster].hand.find(s => s.id === spell.id);
  if (spellInHand) {
    newState = discardSpell(newState, spell.id, isPlayer);
  }
  
  // Check if combat has ended after applying damage
  if (
    (newState.playerWizard.currentHealth <= 0) ||
    (newState.enemyWizard.currentHealth <= 0)
  ) {
    const winner = newState.playerWizard.currentHealth <= 0 ? 'enemy' : 'player';
    newState.status = winner === 'player' ? 'playerWon' : 'enemyWon';
    newState.log.push(createLogEntry({
      turn: newState.turn,
      round: newState.round,
      actor: winner,
      action: 'combat_end',
      details: `${winner === 'player' ? 'You' : 'Enemy'} won the duel!`,
    }));
    return newState;
  }
  
  // Proceed with advancing turn (discard phase will be handled after both players have acted)
  return advanceTurn(newState);
}

/**
 * Apply a spell effect to the combat state
 * @param state The current combat state
 * @param effect The spell effect to apply
 * @param isPlayerCaster Whether the effect is being applied by the player
 * @returns Updated combat state
 */
function applySpellEffect(
  state: CombatState,
  effect: SpellEffect,
  isPlayerCaster: boolean
): CombatState {
  const newState = { ...state };
  const effectTarget = effect.target === 'self' 
    ? (isPlayerCaster ? 'playerWizard' : 'enemyWizard')
    : (isPlayerCaster ? 'enemyWizard' : 'playerWizard');
  
  switch (effect.type) {
    case 'damage':
      // Apply immediate damage
      newState[effectTarget] = {
        ...newState[effectTarget],
        currentHealth: Math.max(0, newState[effectTarget].currentHealth - effect.value),
      };
      
      // Add to combat log
      newState.log.push(createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: isPlayerCaster ? 'player' : 'enemy',
        action: 'damage',
        details: `${effect.value} ${effect.element || ''} damage to ${effectTarget === 'playerWizard' ? 'you' : 'enemy'}!`,
        damage: effect.value
      }));
      break;
      
    case 'healing':
      // Apply immediate healing
      const maxHealth = newState[effectTarget].wizard.maxHealth;
      newState[effectTarget] = {
        ...newState[effectTarget],
        currentHealth: Math.min(maxHealth, newState[effectTarget].currentHealth + effect.value),
      };
      
      // Add to combat log
      newState.log.push(createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: isPlayerCaster ? 'player' : 'enemy',
        action: 'healing',
        details: `${effect.value} healing to ${effectTarget === 'playerWizard' ? 'you' : 'enemy'}!`,
        healing: effect.value
      }));
      break;
      
    case 'manaRestore':
      // Apply immediate mana restoration
      const maxMana = newState[effectTarget].wizard.maxMana;
      newState[effectTarget] = {
        ...newState[effectTarget],
        currentMana: Math.min(maxMana, newState[effectTarget].currentMana + effect.value),
      };
      
      // Add to combat log
      newState.log.push(createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: isPlayerCaster ? 'player' : 'enemy',
        action: 'mana_restore',
        details: `${effect.value} mana restored to ${effectTarget === 'playerWizard' ? 'you' : 'enemy'}!`,
        mana: effect.value
      }));
      break;
      
    case 'statModifier':
    case 'statusEffect':
      // Handle special status effect for extra turn (Time Warp spell)
      if (effect.type === 'statusEffect' && effect.value === 1 && effect.duration === 1) {
        // This is the Time Warp extra turn effect
        const actorName = isPlayerCaster ? 'player' : 'enemy';
        
        // Add to combat log
        newState.log.push(createLogEntry({
          turn: newState.turn,
          round: newState.round,
          actor: actorName,
          action: 'effect_applied',
          details: `Time warped! ${actorName === 'player' ? 'You' : 'Enemy'} will get an extra turn!`
        }));
        
        // Set a flag to grant an extra turn in the advanceTurn function
        newState.extraTurn = {
          for: actorName
        };
      } 
      // Handle regular status/stat effects with duration
      else if (effect.duration && effect.duration > 0) {
        const effectName = getEffectName(effect);
        
        const activeEffect: ActiveEffect = {
          id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: effectName,
          type: effect.type === 'statusEffect' ? 'damage_over_time' : 'stun', // Default based on effect type
          value: effect.value,
          duration: effect.duration || 1,
          remainingDuration: effect.duration || 1,
          source: isPlayerCaster ? 'player' : 'enemy',
          effect: { ...effect }
        };
        
        newState[effectTarget] = {
          ...newState[effectTarget],
          activeEffects: [...newState[effectTarget].activeEffects, activeEffect],
        };
        
        // Add to combat log
        newState.log.push(createLogEntry({
          turn: newState.turn,
          round: newState.round,
          actor: isPlayerCaster ? 'player' : 'enemy',
          action: 'effect_applied',
          details: `Applied ${activeEffect.name} to ${effectTarget === 'playerWizard' ? 'you' : 'enemy'} for ${effect.duration} turns!`,
        }));
      }
      break;
  }
  
  return newState;
}

/**
 * Get a descriptive name for an effect
 * @param effect The effect to name
 * @returns A descriptive name for the effect
 */
function getEffectName(effect: SpellEffect): string {
  switch (effect.type) {
    case 'statModifier':
      if (effect.value < 0) {
        return 'Damage Reduction';
      } else {
        return 'Power Boost';
      }
    case 'statusEffect':
      if (effect.target === 'self' && effect.value > 0) {
        return 'Healing Over Time';
      } else if (effect.target === 'enemy' && effect.value > 0) {
        return 'Damage Over Time';
      } else if (effect.value === 1) {
        return 'Time Warp';
      } else {
        return 'Status Effect';
      }
    default:
      return effect.type;
  }
}

/**
 * Process active effects for a wizard
 * @param state The current combat state
 * @param isPlayer Whether to process effects for the player
 * @returns Updated combat state
 */
function processActiveEffects(
  state: CombatState,
  isPlayer: boolean
): CombatState {
  const newState = { ...state };
  const wizard = isPlayer ? 'playerWizard' : 'enemyWizard';
  const activeEffects = [...newState[wizard].activeEffects];
  const expiredEffects: ActiveEffect[] = [];
  const remainingEffects: ActiveEffect[] = [];
  
  // Process each active effect
  activeEffects.forEach(activeEffect => {
    const effect = activeEffect.effect;
    
    // Apply effect
    switch (effect.type) {
      case 'damage':
        // Apply damage over time
        newState[wizard] = {
          ...newState[wizard],
          currentHealth: Math.max(0, newState[wizard].currentHealth - effect.value),
        };
        
        // Add to combat log
        newState.log.push(createLogEntry({
          turn: newState.turn,
          round: newState.round,
          actor: activeEffect.source,
          action: 'damage_over_time',
          details: `${effect.value} ${effect.element || ''} damage to ${isPlayer ? 'you' : 'enemy'} from ${activeEffect.name}!`,
          damage: effect.value,
        }));
        break;
        
      case 'healing':
        // Apply healing over time
        const maxHealth = newState[wizard].wizard.maxHealth;
        newState[wizard] = {
          ...newState[wizard],
          currentHealth: Math.min(maxHealth, newState[wizard].currentHealth + effect.value),
        };
        
        // Add to combat log
        newState.log.push(createLogEntry({
          turn: newState.turn,
          round: newState.round,
          actor: activeEffect.source,
          action: 'healing_over_time',
          details: `${effect.value} healing to ${isPlayer ? 'you' : 'enemy'} from ${activeEffect.name}!`,
          healing: effect.value,
        }));
        break;
        
      case 'manaRestore':
        // Apply mana restoration over time
        const maxMana = newState[wizard].wizard.maxMana;
        newState[wizard] = {
          ...newState[wizard],
          currentMana: Math.min(maxMana, newState[wizard].currentMana + effect.value),
        };
        
        // Add to combat log
        newState.log.push(createLogEntry({
          turn: newState.turn,
          round: newState.round,
          actor: activeEffect.source,
          action: 'mana_restore_over_time',
          details: `${effect.value} mana restored to ${isPlayer ? 'you' : 'enemy'} from ${activeEffect.name}!`,
          mana: effect.value,
        }));
        break;
    }
    
    // Decrement duration
    activeEffect.remainingDuration--;
    
    // Check if effect has expired
    if (activeEffect.remainingDuration <= 0) {
      expiredEffects.push(activeEffect);
    } else {
      remainingEffects.push(activeEffect);
    }
  });
  
  // Log expired effects
  expiredEffects.forEach(expiredEffect => {
    newState.log.push(createLogEntry({
      turn: newState.turn,
      round: newState.round,
      actor: expiredEffect.source,
      action: 'effect_expired',
      details: `${expiredEffect.name} has expired for ${isPlayer ? 'you' : 'enemy'}!`,
    }));
  });
  
  // Update active effects
  newState[wizard] = {
    ...newState[wizard],
    activeEffects: remainingEffects,
  };
  
  return newState;
}

/**
 * Regenerate mana for a wizard
 * @param state The current combat state
 * @param isPlayer Whether to regenerate mana for the player
 * @returns Updated combat state
 */
function regenerateMana(
  state: CombatState,
  isPlayer: boolean
): CombatState {
  const newState = { ...state };
  const wizard = isPlayer ? 'playerWizard' : 'enemyWizard';
  const manaRegen = newState[wizard].wizard.manaRegen;
  const maxMana = newState[wizard].wizard.maxMana;
  
  // Regenerate mana
  newState[wizard] = {
    ...newState[wizard],
    currentMana: Math.min(maxMana, newState[wizard].currentMana + manaRegen),
  };
  
  // Add to combat log
  newState.log.push(createLogEntry({
    turn: newState.turn,
    round: newState.round,
    actor: isPlayer ? 'player' : 'enemy',
    action: 'mana_regen',
    details: `${isPlayer ? 'You' : 'Enemy'} regenerated ${manaRegen} mana!`,
    mana: manaRegen,
  }));
  
  return newState;
}

/**
 * Advance to the next turn in combat
 * @param state The current combat state
 * @returns Updated combat state
 */
export function advanceTurn(state: CombatState): CombatState {
  // Don't advance turn if combat has ended
  if (state.status !== 'active') {
    return state;
  }
  
  let newState = { ...state };
  
  // Handle extra turn from Time Warp spell
  if (newState.extraTurn) {
    // If there's an extra turn queued up, use it instead of advancing normally
    const extraTurnFor = newState.extraTurn.for;
    
    // Clear the extra turn flag
    newState.extraTurn = undefined;
    
    // Add to combat log
    newState.log.push(createLogEntry({
      turn: newState.turn,
      round: newState.round,
      actor: extraTurnFor,
      action: 'extra_turn',
      details: `${extraTurnFor === 'player' ? 'You' : 'Enemy'} takes an extra turn through time magic!`,
    }));
    
    // Set the turn to the player who cast Time Warp
    newState.isPlayerTurn = extraTurnFor === 'player';
    
    return newState;
  } 
  
  // Normal turn advancement
  if (newState.isPlayerTurn) {
    // If it was the player's turn, now it's the enemy's turn
    newState.isPlayerTurn = false;
    console.log("DEBUG advanceTurn: Switching from player to enemy turn");
  } else {
    // If it was the enemy's turn, process discard phase BEFORE drawing new cards
    // This happens after both player and enemy have taken their turns
    console.log("DEBUG advanceTurn: Enemy turn ending, processing discard phase");
    console.log("DEBUG advanceTurn: Player hand size before discard phase:", newState.playerWizard.hand.length);
    
    const { state: stateAfterDiscard, needsPlayerDiscard } = processDiscardPhase(newState, true);
    
    // If player needs to discard, return the state without advancing turn
    if (needsPlayerDiscard) {
      console.log("DEBUG advanceTurn: Player needs to discard, hand size:", stateAfterDiscard.playerWizard.hand.length);
      return stateAfterDiscard;
    }
    
    // Otherwise, advance to the next round and player's turn
    console.log("DEBUG advanceTurn: No discard needed or discard complete, advancing to next round");
    newState = stateAfterDiscard;
    newState.isPlayerTurn = true;
    newState.round += 1;
    
    // Process status effects at the start of a new round
    newState = processActiveEffects(newState, true); // Player effects
    newState = processActiveEffects(newState, false); // Enemy effects
    
    // Regenerate mana at the start of a new round
    newState = regenerateMana(newState, true); // Player mana
    newState = regenerateMana(newState, false); // Enemy mana
    
    // MOVED: Draw cards AFTER discard phase and at start of new round
    console.log("DEBUG advanceTurn: Drawing cards for new round");
    newState = drawCards(newState, true, CARDS_PER_DRAW);
    console.log("DEBUG advanceTurn: Player hand size after draw:", newState.playerWizard.hand.length);
    newState = drawCards(newState, false, CARDS_PER_DRAW);
    
    // MOVED: Shuffle discard piles AFTER discard phase and after drawing
    newState = shuffleDiscardIntoDraw(newState, true);
    newState = shuffleDiscardIntoDraw(newState, false);
  }
  
  // Increase turn counter
  newState.turn += 1;
  
  return newState;
}

/**
 * This function is deprecated. Use getAISpellSelection from aiEngine.ts instead.
 * @deprecated
 */
export function _legacyGetAISpellSelection(state: CombatState): Spell | null {
  const enemyWizard = state.enemyWizard.wizard;
  const availableSpells = enemyWizard.equippedSpells.filter(
    spell => spell.manaCost <= state.enemyWizard.currentMana
  );
  
  // If no spells can be cast, use mystic punch
  if (availableSpells.length === 0) {
    return null;
  }
  
  // Select spell based on difficulty
  switch (state.difficulty) {
    case 'easy':
      // Lowest damage spell
      return availableSpells.sort((a, b) => {
        const aDamage = a.effects.reduce((sum, effect) => 
          effect.type === 'damage' ? sum + effect.value : sum, 0);
        const bDamage = b.effects.reduce((sum, effect) => 
          effect.type === 'damage' ? sum + effect.value : sum, 0);
        return aDamage - bDamage;
      })[0];
      
    case 'hard':
      // Highest damage spell, or healing if health < 50%
      if (state.enemyWizard.currentHealth < state.enemyWizard.wizard.maxHealth / 2) {
        const healingSpells = availableSpells.filter(spell => 
          spell.effects.some(effect => effect.type === 'healing')
        );
        
        if (healingSpells.length > 0) {
          return healingSpells.sort((a, b) => {
            const aHealing = a.effects.reduce((sum, effect) => 
              effect.type === 'healing' ? sum + effect.value : sum, 0);
            const bHealing = b.effects.reduce((sum, effect) => 
              effect.type === 'healing' ? sum + effect.value : sum, 0);
            return bHealing - aHealing;
          })[0];
        }
      }
      
      return availableSpells.sort((a, b) => {
        const aDamage = a.effects.reduce((sum, effect) => 
          effect.type === 'damage' ? sum + effect.value : sum, 0);
        const bDamage = b.effects.reduce((sum, effect) => 
          effect.type === 'damage' ? sum + effect.value : sum, 0);
        return bDamage - aDamage;
      })[0];
      
    case 'normal':
    default:
      // Random spell
      return availableSpells[Math.floor(Math.random() * availableSpells.length)];
  }
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

/**
 * Helper function to create a combat log entry with timestamp
 */
function createLogEntry(entry: Omit<CombatLogEntry, 'timestamp'>): CombatLogEntry {
  return {
    ...entry,
    timestamp: Date.now()
  };
}

/**
 * Skip the current turn
 * @param state The current combat state
 * @param isPlayer Whether the player is skipping the turn
 * @returns Updated combat state
 */
export function skipTurn(
  state: CombatState,
  isPlayer: boolean
): CombatState {
  let newState = { ...state };
  
  // Add to combat log
  newState.log.push(createLogEntry({
    turn: newState.turn,
    round: newState.round,
    actor: isPlayer ? 'player' : 'enemy',
    action: 'skip_turn',
    details: `${isPlayer ? 'You' : 'Enemy'} skipped the turn.`,
  }));
  
  // Proceed with advancing turn (discard phase will be handled after both players have acted)
  return advanceTurn(newState);
}

