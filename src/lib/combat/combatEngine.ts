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
    // If draw pile is empty, shuffle discard pile into draw pile
    if (drawPile.length === 0 && discardPile.length > 0) {
      drawPile = shuffleArray(discardPile);
      discardPile = [];
      
      // Add to combat log
      newState.log.push(createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: isPlayer ? 'player' : 'enemy',
        action: 'shuffle_discard',
        details: `${wizardName} shuffled the discard pile back into the draw pile.`,
      }));
    }
    
    // Draw a card if possible
    if (drawPile.length > 0) {
      const card = drawPile.pop()!;
      hand.push(card);
    }
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
 * Discard a spell from hand to the discard pile
 * @param state The current combat state
 * @param spellId The ID of the spell to discard
 * @param isPlayer Whether the player is discarding
 * @returns Updated combat state
 */
function discardSpell(
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
 * Execute a mystic punch (discard a spell for direct damage)
 * @param state The current combat state
 * @param spellTier The tier of the discarded spell
 * @param isPlayer Whether the mystic punch is being executed by the player
 * @returns Updated combat state
 */
export function executeMysticPunch(
  state: CombatState,
  spellTier: number,
  isPlayer: boolean
): CombatState {
  const newState = { ...state };
  const actor = isPlayer ? 'player' : 'enemy';
  const target = isPlayer ? 'enemyWizard' : 'playerWizard';
  
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
  
  return advanceTurn(newState);
}

/**
 * Execute a spell cast
 * @param state The current combat state
 * @param isPlayer Whether the spell is being cast by the player
 * @returns Updated combat state
 */
export function executeSpellCast(
  state: CombatState,
  isPlayer: boolean
): CombatState {
  let newState = { ...state };
  const caster = isPlayer ? 'playerWizard' : 'enemyWizard';
  const target = isPlayer ? 'enemyWizard' : 'playerWizard';
  const spell = newState[caster].selectedSpell;
  
  if (!spell) {
    // No spell selected, just advance the turn
    return advanceTurn(newState);
  }
  
  // Check if caster has enough mana
  if (newState[caster].currentMana < spell.manaCost) {
    // Not enough mana, add to log and advance turn
    newState.log.push(createLogEntry({
      turn: newState.turn,
      round: newState.round,
      actor: isPlayer ? 'player' : 'enemy',
      action: 'spell_failed',
      details: `Not enough mana to cast ${spell.name}!`
    }));
    return advanceTurn(newState);
  }
  
  // Deduct mana cost
  newState[caster] = {
    ...newState[caster],
    currentMana: newState[caster].currentMana - spell.manaCost,
    selectedSpell: null, // Clear selected spell
  };
  
  // Add to combat log
  newState.log.push(createLogEntry({
    turn: newState.turn,
    round: newState.round,
    actor: isPlayer ? 'player' : 'enemy',
    action: 'spell_cast',
    details: `${isPlayer ? 'You' : 'Enemy'} cast ${spell.name}!`,
    spellName: spell.name
  }));
  
  // Apply spell effects
  spell.effects.forEach(effect => {
    newState = applySpellEffect(newState, effect, isPlayer);
  });
  
  // Check if combat has ended
  if (newState.playerWizard.currentHealth <= 0) {
    newState.status = 'enemyWon';
    newState.log.push(createLogEntry({
      turn: newState.turn,
      round: newState.round,
      actor: 'enemy',
      action: 'combat_end',
      details: 'Enemy won the duel!'
    }));
  } else if (newState.enemyWizard.currentHealth <= 0) {
    newState.status = 'playerWon';
    newState.log.push(createLogEntry({
      turn: newState.turn,
      round: newState.round,
      actor: 'player',
      action: 'combat_end',
      details: 'You won the duel!'
    }));
  }
  
  // Move the spell from hand to discard pile
  const spellInHand = newState[caster].hand.find(s => s.id === spell.id);
  if (spellInHand) {
    newState = discardSpell(newState, spell.id, isPlayer);
  }
  
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
 * Advance to the next turn
 * @param state The current combat state
 * @returns Updated combat state
 */
function advanceTurn(state: CombatState): CombatState {
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
  } else {
    // If it was the enemy's turn, advance to the next round and player's turn
    newState.isPlayerTurn = true;
    newState.round += 1;
    
    // Process status effects at the start of a new round
    newState = processActiveEffects(newState, true); // Player effects
    newState = processActiveEffects(newState, false); // Enemy effects
    
    // Regenerate mana at the start of a new round
    newState = regenerateMana(newState, true); // Player mana
    newState = regenerateMana(newState, false); // Enemy mana
    
    // Draw cards for the new round
    newState = drawCards(newState, true, CARDS_PER_DRAW);
    newState = drawCards(newState, false, CARDS_PER_DRAW);
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
  
  return Math.floor(enemyValue * difficultyMultiplier);
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
