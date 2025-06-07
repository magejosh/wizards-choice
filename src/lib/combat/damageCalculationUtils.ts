import { CombatState, ActiveEffect } from '../types';
import { createLogEntry } from './battleLogManager';
import { checkCombatStatus } from './combatStatusManager';

/**
 * Standardized damage calculation and application system
 * This ensures ALL damage sources (spells, mystic punch, DoT effects) 
 * use the same mechanics and apply the same modifiers consistently
 */

export interface DamageCalculationOptions {
  baseDamage: number;
  damageType: 'spell' | 'mysticPunch' | 'effect' | 'equipment';
  element?: string;
  caster: 'playerWizard' | 'enemyWizard';
  target: 'playerWizard' | 'enemyWizard';
  sourceDescription: string;
  bypassReduction?: boolean; // For certain special effects
}

/**
 * Calculate and apply damage using standardized game mechanics
 * This is the single source of truth for all damage calculation
 */
export function calculateAndApplyDamage(
  state: CombatState,
  options: DamageCalculationOptions
): CombatState {
  let newState = { ...state };
  const { baseDamage, damageType, element, caster, target, sourceDescription, bypassReduction = false } = options;

  // Step 1: Calculate base damage with caster bonuses
  let finalDamage = baseDamage;

  // Apply spell power bonus for spell damage
  if (damageType === 'spell' || damageType === 'mysticPunch') {
    const spellPower = newState[caster].wizard.combatStats?.spellPower || 0;
    finalDamage += spellPower;
  }

  // Apply mystic punch power bonus for mystic punch
  if (damageType === 'mysticPunch') {
    const mysticPunchPower = newState[caster].wizard.combatStats?.mysticPunchPower || 0;
    finalDamage += mysticPunchPower;
  }

  // Step 2: Apply difficulty modifiers
  const isPlayerCaster = caster === 'playerWizard';
  if (isPlayerCaster) {
    switch (newState.difficulty) {
      case 'easy':
        finalDamage *= 1.2; // Player deals more damage on easy
        break;
      case 'hard':
        finalDamage *= 0.8; // Player deals less damage on hard
        break;
    }
  } else {
    switch (newState.difficulty) {
      case 'easy':
        finalDamage *= 0.8; // Enemy deals less damage on easy
        break;
      case 'hard':
        finalDamage *= 1.2; // Enemy deals more damage on hard
        break;
    }
  }

  // Step 3: Apply target damage reduction (unless bypassed)
  let totalReduction = 0;
  if (!bypassReduction) {
    const damageReductionEffects = newState[target].activeEffects.filter(
      effect => effect.type === 'damageReduction' && effect.remainingDuration > 0
    );
    
    totalReduction = damageReductionEffects.reduce((sum, effect) => {
      // Ensure we use absolute value to handle negative values correctly
      return sum + Math.abs(effect.value);
    }, 0);
  }

  // Step 4: Calculate final damage after all modifiers
  const damageAfterReduction = Math.max(0, Math.round(finalDamage) - totalReduction);

  // Step 5: Apply damage to target
  newState[target] = {
    ...newState[target],
    currentHealth: Math.max(0, newState[target].currentHealth - damageAfterReduction),
  };

  // Step 6: Log the damage with details
  const reductionText = totalReduction > 0 ? ` (reduced by ${totalReduction})` : '';
  const elementText = element ? ` ${element}` : '';
  
  newState.log.push(createLogEntry({
    turn: newState.turn,
    round: newState.round,
    actor: isPlayerCaster ? 'player' : 'enemy',
    action: damageType === 'mysticPunch' ? 'mystic_punch' : 'damage',
    details: `${damageAfterReduction}${elementText} damage to ${target === 'playerWizard' ? 'you' : 'enemy'} from ${sourceDescription}${reductionText}!`,
    damage: damageAfterReduction,
  }));

  // Step 7: Check if combat has ended
  newState = checkCombatStatus(newState);

  return newState;
}

/**
 * Apply active effects that modify damage calculations
 * This handles buffs and debuffs that affect damage output or reduction
 */
export function getDamageModifiers(
  state: CombatState,
  caster: 'playerWizard' | 'enemyWizard',
  target: 'playerWizard' | 'enemyWizard'
): {
  damageBonus: number;
  damageReduction: number;
} {
  let damageBonus = 0;
  let damageReduction = 0;

  // Check caster's damage bonus effects
  const casterBuffs = state[caster].activeEffects.filter(
    effect => effect.type === 'buff' && effect.remainingDuration > 0
  );
  
  damageBonus = casterBuffs.reduce((sum, effect) => {
    // If the buff affects damage output (positive value for damage)
    if (effect.effect?.type === 'statModifier' && effect.value > 0) {
      return sum + effect.value;
    }
    return sum;
  }, 0);

  // Check target's damage reduction effects
  const targetReductions = state[target].activeEffects.filter(
    effect => effect.type === 'damageReduction' && effect.remainingDuration > 0
  );
  
  damageReduction = targetReductions.reduce((sum, effect) => {
    return sum + Math.abs(effect.value);
  }, 0);

  return { damageBonus, damageReduction };
}

/**
 * Utility function to get all active damage-affecting effects for display
 */
export function getActiveDamageEffects(  state: CombatState,  wizardKey: 'playerWizard' | 'enemyWizard'): ActiveEffect[] {  return state[wizardKey].activeEffects.filter(effect =>     (effect.type === 'damageReduction' ||      effect.type === 'healing_over_time' ||      effect.type === 'damage_over_time') &&     effect.remainingDuration > 0  );} 