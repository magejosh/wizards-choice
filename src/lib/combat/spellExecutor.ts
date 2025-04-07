// src/lib/combat/spellExecutor.ts
import { CombatState, Spell, SpellEffect, ActiveEffect } from '../types';
import { createLogEntry } from './battleLogManager';
import { checkCombatStatus } from './combatStatusManager';
import { discardCard } from './cardManager';
import { advancePhase } from './phaseManager';

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
 * Execute a mystic punch with the selected spell
 * @param state The current combat state
 * @param spellTier The tier of the spell used for mystic punch power
 * @param isPlayer Whether the player is executing the mystic punch
 * @param isResolution Whether this is being executed during resolution phase
 * @returns Updated combat state
 */
export function executeMysticPunch(
  state: CombatState,
  spellTier: number,
  isPlayer: boolean,
  isResolution: boolean = false
): CombatState {
  let newState = { ...state };
  const caster = isPlayer ? 'playerWizard' : 'enemyWizard';
  const target = isPlayer ? 'enemyWizard' : 'playerWizard';

  // Calculate base damage based on spell tier
  let baseDamage = 5 + (spellTier * 2);

  // Apply difficulty modifier
  if (isPlayer) {
    switch (newState.difficulty) {
      case 'easy':
        baseDamage *= 1.2; // Player deals more damage on easy difficulty
        break;
      case 'hard':
        baseDamage *= 0.8; // Player deals less damage on hard difficulty
        break;
    }
  } else {
    switch (newState.difficulty) {
      case 'easy':
        baseDamage *= 0.8; // Enemy deals less damage on easy difficulty
        break;
      case 'hard':
        baseDamage *= 1.2; // Enemy deals more damage on hard difficulty
        break;
    }
  }

  // Round damage to nearest integer
  const finalDamage = Math.round(baseDamage);

  // Apply damage to target
  newState[target] = {
    ...newState[target],
    currentHealth: Math.max(0, newState[target].currentHealth - finalDamage),
  };

  // Add to combat log
  newState.log.push(createLogEntry({
    turn: newState.turn,
    round: newState.round,
    actor: isPlayer ? 'player' : 'enemy',
    action: 'mystic_punch',
    details: `${isPlayer ? 'You' : 'Enemy'} used Mystic Punch for ${finalDamage} damage!`,
    damage: finalDamage,
  }));

  // Check if this ended the combat using the combat status manager
  newState = checkCombatStatus(newState);

  // If combat has ended, return immediately
  if (newState.status !== 'active') {
    console.log(`Combat ended: ${newState.status}, target health: ${newState[target].currentHealth}`);
    return newState;
  }

  // If the selectedSpell is not null, discard it using the card handler
  if (newState[caster].selectedSpell) {
    const selectedSpell = newState[caster].selectedSpell;
    newState = discardCard(newState, selectedSpell.id, isPlayer, 'mystic_punch');

    // Clear selected spell after discarding
    newState[caster].selectedSpell = null;
  }

  // If this is during resolution phase, don't advance the turn
  if (isResolution) {
    return newState;
  }

  // Mark the player as having acted in this phase
  if (newState.currentPhase === 'action') {
    if (isPlayer) {
      newState.actionState.player.hasActed = true;
    } else {
      newState.actionState.enemy.hasActed = true;
    }

    // Check if both players have acted, and if so, advance to the next phase
    if (newState.actionState.player.hasActed && newState.actionState.enemy.hasActed) {
      return advancePhase(newState);
    }
  }

  return newState;
}

/**
 * Execute a spell cast
 * @param state The current combat state
 * @param isPlayer Whether the player is casting the spell
 * @param isResolution Whether this is being executed during resolution phase
 * @returns Updated combat state
 */
export function executeSpellCast(
  state: CombatState,
  isPlayer: boolean,
  isResolution: boolean = false
): CombatState {
  let newState = { ...state };
  const caster = isPlayer ? 'playerWizard' : 'enemyWizard';

  // Get the selected spell
  const selectedSpell = newState[caster].selectedSpell;

  // If no spell is selected, log and return unchanged state
  if (!selectedSpell) {
    console.error(`No spell selected for ${isPlayer ? 'player' : 'enemy'}`);
    return newState;
  }

  // Check if caster has enough mana
  if (newState[caster].currentMana < selectedSpell.manaCost) {
    newState.log.push(createLogEntry({
      turn: newState.turn,
      round: newState.round,
      actor: isPlayer ? 'player' : 'enemy',
      action: 'cast_failed',
      details: `${isPlayer ? 'You' : 'Enemy'} tried to cast ${selectedSpell.name} but didn't have enough mana!`,
      spellName: selectedSpell.name,
    }));

    // Clear selected spell
    newState[caster] = {
      ...newState[caster],
      selectedSpell: null,
    };

    return advancePhase(newState);
  }

  // Deduct mana cost
  newState[caster] = {
    ...newState[caster],
    currentMana: newState[caster].currentMana - selectedSpell.manaCost,
  };

  // Log spell cast
  newState.log.push(createLogEntry({
    turn: newState.turn,
    round: newState.round,
    actor: isPlayer ? 'player' : 'enemy',
    action: 'spell_cast',
    details: `${isPlayer ? 'You' : 'Enemy'} cast ${selectedSpell.name}!`,
    spellName: selectedSpell.name,
    mana: -selectedSpell.manaCost,
  }));

  // Apply all spell effects
  for (const effect of selectedSpell.effects) {
    newState = applySpellEffect(newState, effect, isPlayer);
  }

  // Check if combat has ended
  if (newState.status !== 'active') {
    console.log(`Combat ended: ${newState.status}`);
    return newState;
  }

  // Move spell from hand to discard pile using the card handler
  if (newState[caster].selectedSpell) {
    const selectedSpellId = newState[caster].selectedSpell.id;
    // Check if the spell is in hand before trying to discard it
    const spellInHand = newState[caster].hand.find(spell => spell.id === selectedSpellId);
    if (spellInHand) {
      newState = discardCard(newState, selectedSpellId, isPlayer, 'spell_cast');
    }

    // Clear selected spell
    newState[caster].selectedSpell = null;
  }

  // If this is during resolution phase, don't advance the turn
  if (isResolution) {
    return newState;
  }

  // Mark the player as having acted in this phase
  if (newState.currentPhase === 'action') {
    if (isPlayer) {
      newState.actionState.player.hasActed = true;
    } else {
      newState.actionState.enemy.hasActed = true;
    }

    // Check if both players have acted, and if so, advance to the next phase
    if (newState.actionState.player.hasActed && newState.actionState.enemy.hasActed) {
      return advancePhase(newState);
    }
  } else if (newState.currentPhase === 'response') {
    if (isPlayer) {
      newState.actionState.player.hasResponded = true;
    } else {
      newState.actionState.enemy.hasResponded = true;
    }

    // Check if both players have responded, and if so, advance to the next phase
    if (newState.actionState.player.hasResponded && newState.actionState.enemy.hasResponded) {
      return advancePhase(newState);
    }
  }

  return newState;
}

/**
 * Apply a spell effect to the combat state
 * @param state The current combat state
 * @param effect The spell effect to apply
 * @param isPlayerCaster Whether the effect is being applied by the player
 * @returns Updated combat state
 */
/**
 * Get a descriptive name for an effect
 * @param effect The effect to name
 * @returns A descriptive name for the effect
 */
export function getEffectName(effect: SpellEffect): string {
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

export function applySpellEffect(
  state: CombatState,
  effect: SpellEffect,
  isPlayerCaster: boolean
): CombatState {
  let newState = { ...state };
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

      // Check if this damage ended the combat
      newState = checkCombatStatus(newState);
      break;

    case 'healing':
      // Apply healing
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
      // Apply mana restoration
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

    case 'damageOverTime':
      // Apply damage over time effect
      const dotEffect = {
        id: `dot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: effect.name || 'Damage Over Time',
        source: isPlayerCaster ? 'player' : 'enemy',
        remainingDuration: effect.duration || 1,
        effect: {
          type: 'damage',
          value: effect.value,
          element: effect.element,
        },
      };

      // Add to active effects
      newState[effectTarget] = {
        ...newState[effectTarget],
        activeEffects: [...newState[effectTarget].activeEffects, dotEffect],
      };

      // Add to combat log
      newState.log.push(createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: isPlayerCaster ? 'player' : 'enemy',
        action: 'effect_applied',
        details: `${dotEffect.name} applied to ${effectTarget === 'playerWizard' ? 'you' : 'enemy'} for ${effect.duration} turns!`,
      }));
      break;

    case 'healingOverTime':
      // Apply healing over time effect
      const hotEffect = {
        id: `hot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: effect.name || 'Healing Over Time',
        source: isPlayerCaster ? 'player' : 'enemy',
        remainingDuration: effect.duration || 1,
        effect: {
          type: 'healing',
          value: effect.value,
        },
      };

      // Add to active effects
      newState[effectTarget] = {
        ...newState[effectTarget],
        activeEffects: [...newState[effectTarget].activeEffects, hotEffect],
      };

      // Add to combat log
      newState.log.push(createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: isPlayerCaster ? 'player' : 'enemy',
        action: 'effect_applied',
        details: `${hotEffect.name} applied to ${effectTarget === 'playerWizard' ? 'you' : 'enemy'} for ${effect.duration} turns!`,
      }));
      break;

    case 'manaRestoreOverTime':
      // Apply mana restore over time effect
      const motEffect = {
        id: `mot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: effect.name || 'Mana Restore Over Time',
        source: isPlayerCaster ? 'player' : 'enemy',
        remainingDuration: effect.duration || 1,
        effect: {
          type: 'manaRestore',
          value: effect.value,
        },
      };

      // Add to active effects
      newState[effectTarget] = {
        ...newState[effectTarget],
        activeEffects: [...newState[effectTarget].activeEffects, motEffect],
      };

      // Add to combat log
      newState.log.push(createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: isPlayerCaster ? 'player' : 'enemy',
        action: 'effect_applied',
        details: `${motEffect.name} applied to ${effectTarget === 'playerWizard' ? 'you' : 'enemy'} for ${effect.duration} turns!`,
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
      break;
  }

  return newState;
}
