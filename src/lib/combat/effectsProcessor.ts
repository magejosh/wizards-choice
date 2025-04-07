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

        // Check if this damage ended the combat
        newState = checkCombatStatus(newState);
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
