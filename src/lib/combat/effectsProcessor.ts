// src/lib/combat/effectsProcessor.ts
import { CombatState, ActiveEffect } from '../types';
import { createLogEntry } from './battleLogManager';
import { checkCombatStatus } from './combatStatusManager';

/**
 * Process active effects for a wizard
 * @param state The current combat state
 * @param isPlayer Whether to process effects for the player
 * @returns Updated combat state
 */
export function processActiveEffects(
  state: CombatState,
  isPlayer: boolean
): CombatState {
  let newState = { ...state };
  const wizard = isPlayer ? 'playerWizard' : 'enemyWizard';
  const activeEffects = [...newState[wizard].activeEffects];
  const expiredEffects: ActiveEffect[] = [];
  const remainingEffects: ActiveEffect[] = [];

  // Allowed ActiveEffect types
  const allowedTypes = new Set([
    'damage_over_time',
    'healing_over_time',
    'mana_regen',
    'mana_drain',
    'stun',
    'silence',
  ]);

  // Process each active effect
  activeEffects.forEach(activeEffect => {
    // Defensive: skip undefined or malformed effects
    if (!activeEffect || (!activeEffect.type && !activeEffect.effect)) return;

    // Support both legacy (effect.type) and direct (activeEffect.type) effect types
    let effectType = activeEffect.type as ActiveEffect['type'];
    let effectValue = activeEffect.value;
    let effectName = activeEffect.name;
    let effectSource = activeEffect.source;
    // If effect property exists, prefer its type/value
    if (activeEffect.effect) {
      effectType = activeEffect.effect.type as ActiveEffect['type'];
      effectValue = activeEffect.effect.value;
    }

    // Only process allowed types
    if (!allowedTypes.has(effectType)) return;

    switch (effectType) {
      case 'damage_over_time':
        // Apply damage over time
        newState[wizard] = {
          ...newState[wizard],
          currentHealth: Math.max(0, newState[wizard].currentHealth - effectValue),
        };
        newState.log.push(createLogEntry({
          turn: newState.turn,
          round: newState.round,
          actor: effectSource,
          action: 'damage_over_time',
          details: `${effectValue} damage to ${isPlayer ? 'you' : 'enemy'} from ${effectName}!`,
          damage: effectValue,
        }));
        newState = checkCombatStatus(newState);
        break;
      case 'healing_over_time':
        // Apply healing over time
        const maxHealth = newState[wizard].wizard.maxHealth;
        newState[wizard] = {
          ...newState[wizard],
          currentHealth: Math.min(maxHealth, newState[wizard].currentHealth + effectValue),
        };
        newState.log.push(createLogEntry({
          turn: newState.turn,
          round: newState.round,
          actor: effectSource,
          action: 'healing_over_time',
          details: `${effectValue} healing to ${isPlayer ? 'you' : 'enemy'} from ${effectName}!`,
          healing: effectValue,
        }));
        break;
      case 'mana_regen':
        // Apply mana regeneration over time
        const maxMana = newState[wizard].wizard.maxMana;
        newState[wizard] = {
          ...newState[wizard],
          currentMana: Math.min(maxMana, newState[wizard].currentMana + effectValue),
        };
        newState.log.push(createLogEntry({
          turn: newState.turn,
          round: newState.round,
          actor: effectSource,
          action: 'mana_restore_over_time',
          details: `${effectValue} mana restored to ${isPlayer ? 'you' : 'enemy'} from ${effectName}!`,
          mana: effectValue,
        }));
        break;
      // Other allowed types (mana_drain, stun, silence) can be implemented as needed
      default:
        // Skip unknown or unsupported effect types
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
export function regenerateMana(
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
