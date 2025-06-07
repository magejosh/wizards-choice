// src/lib/combat/effectsProcessor.ts
import { CombatState, ActiveEffect } from '../types';
import { createLogEntry } from './battleLogManager';
import { checkCombatStatus } from './combatStatusManager';
import { calculateAndApplyDamage } from './damageCalculationUtils';

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
    'damageReduction',
    'buff',
  ]);

  // Process each active effect
  activeEffects.forEach(activeEffect => {
    // Defensive: skip undefined or malformed effects
    if (!activeEffect || !activeEffect.type) return; // Ensure activeEffect and its type are defined

    const currentEffectType = activeEffect.type as ActiveEffect['type'];
    let effectValue = activeEffect.value;
    const effectName = activeEffect.name;
    const effectSource = activeEffect.source || (isPlayer ? 'player' : 'enemy');

    // Use original spell effect's value if current one is missing and original exists
    if (activeEffect.effect && typeof effectValue === 'undefined') {
      effectValue = activeEffect.effect.value;
    }
    
    // Only process allowed types
    if (!allowedTypes.has(currentEffectType)) {
      // If not an allowed type, it won't be processed by the switch,
      // but its duration will still tick down below.
      // If it has remainingDuration > 0, it will be added to remainingEffects.
    }

    // Apply effect-specific logic if it's an allowed type
    if (allowedTypes.has(currentEffectType)) {
      switch (currentEffectType) {
        case 'damage_over_time':
          // Use standardized damage calculation for DoT effects
          newState = calculateAndApplyDamage(newState, {
            baseDamage: effectValue,
            damageType: 'effect',
            element: activeEffect.effect?.element || 'arcane',
            caster: effectSource === 'player' ? 'playerWizard' : 'enemyWizard',
            target: wizard,
            sourceDescription: effectName,
          });
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
        case 'damageReduction':
          // Damage reduction effects don't have per-turn effects - they work passively during damage calculation
          // We just maintain them and let them expire naturally
          break;
        case 'buff':
          // Buff effects work passively - they just provide bonuses during relevant calculations
          // We just maintain them and let them expire naturally
          break;
        // Other allowed types (mana_drain, stun, silence) can be implemented as needed
        default:
          // Skip unknown or unsupported effect types that somehow passed the allowedTypes check
          // Or, if an effect type is in allowedTypes but has no case here, it will also just tick down.
          break;
      }
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
      actor: expiredEffect.source || (isPlayer ? 'player' : 'enemy'),
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
