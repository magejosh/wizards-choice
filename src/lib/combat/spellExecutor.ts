// src/lib/combat/spellExecutor.ts
import { CombatState, Spell, SpellEffect, ActiveEffect, Minion } from '../types';
import { createLogEntry } from './battleLogManager';
import { checkCombatStatus } from './combatStatusManager';
import { discardCard } from './cardManager';
import { advancePhase } from './phaseManager';
import { calculateAndApplyDamage } from './damageCalculationUtils';
import { findUnoccupiedAdjacentHex } from '../utils/hexUtils';

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
  const baseDamage = 2 + (spellTier * 3);

  // Apply Bleed Effect if present
  const bleedEffect = newState[caster].wizard.combatStats?.bleedEffect || 0;
  if (bleedEffect > 0) {
    const bleedActiveEffect = {
      name: 'Bleed',
      type: 'damage_over_time' as const,
      value: bleedEffect,
      duration: 3,
      remainingDuration: 3,
      source: (isPlayer ? 'player' : 'enemy') as 'player' | 'enemy',
    };
    newState[target] = {
      ...newState[target],
      activeEffects: [...newState[target].activeEffects, bleedActiveEffect],
    };
    newState.log.push(createLogEntry({
      turn: newState.turn,
      round: newState.round,
      actor: isPlayer ? 'player' : 'enemy',
      action: 'effect_applied',
      details: `Bleed applied to ${isPlayer ? 'enemy' : 'you'} for 3 turns!`,
    }));
  }

  // Use standardized damage calculation system
  newState = calculateAndApplyDamage(newState, {
    baseDamage,
    damageType: 'mysticPunch',
    element: 'physical',
    caster,
    target,
    sourceDescription: 'Mystic Punch',
  });

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
    return processMinionActions(newState, isPlayer);
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
      newState = processMinionActions(newState, isPlayer);
      return advancePhase(newState);
    }
  }

  newState = processMinionActions(newState, isPlayer);
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
      newState = processMinionActions(newState, isPlayer);
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
      newState = processMinionActions(newState, isPlayer);
      return advancePhase(newState);
    }
  }

  newState = processMinionActions(newState, isPlayer);
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
  const caster = isPlayerCaster ? 'playerWizard' : 'enemyWizard';
  const effectTarget = effect.target === 'self'
    ? (isPlayerCaster ? 'playerWizard' : 'enemyWizard')
    : (isPlayerCaster ? 'enemyWizard' : 'playerWizard');

  switch (effect.type) {
    case 'damage':
      // Use standardized damage calculation system
      newState = calculateAndApplyDamage(newState, {
        baseDamage: effect.value,
        damageType: 'spell',
        element: effect.element || 'arcane',
        caster,
        target: effectTarget,
        sourceDescription: `spell ${effect.element || ''} damage`,
      });
      break;

    case 'healing':
      // Apply healing
      const maxHealth = newState[effectTarget].wizard.maxHealth;
      newState[effectTarget] = {
        ...newState[effectTarget],
        currentHealth: Math.min(maxHealth, newState[effectTarget].currentHealth + Math.round(effect.value)),
      };

      // Add to combat log
      newState.log.push(createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: isPlayerCaster ? 'player' : 'enemy',
        action: 'healing',
        details: `${Math.round(effect.value)} healing to ${effectTarget === 'playerWizard' ? 'you' : 'enemy'}!`,
        healing: Math.round(effect.value)
      }));
      break;

    case 'manaRestore':
      // Apply mana restoration
      const maxMana = newState[effectTarget].wizard.maxMana;
      newState[effectTarget] = {
        ...newState[effectTarget],
        currentMana: Math.min(maxMana, newState[effectTarget].currentMana + Math.round(effect.value)),
      };

      // Add to combat log
      newState.log.push(createLogEntry({
        turn: newState.turn,
        round: newState.round,
        actor: isPlayerCaster ? 'player' : 'enemy',
        action: 'mana_restore',
        details: `${Math.round(effect.value)} mana restored to ${effectTarget === 'playerWizard' ? 'you' : 'enemy'}!`,
        mana: Math.round(effect.value)
      }));
      break;

    case 'statusEffect': {
      // Handle Time Warp extra-turn effect first
      if (effect.value === 1 && effect.duration === 1) {
        const actorName = isPlayerCaster ? 'player' : 'enemy';

        newState.log.push(createLogEntry({
          turn: newState.turn,
          round: newState.round,
          actor: actorName,
          action: 'effect_applied',
          details: `Time warped! ${actorName === 'player' ? 'You' : 'Enemy'} will get an extra turn!`
        }));

        newState.extraTurn = { for: actorName };
        break;
      }

      let newActiveEffect: ActiveEffect | null = null;

      if (effect.target === 'self' && effect.value > 0) {
        // Healing over time on self
        newActiveEffect = {
          id: `hot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: 'Healing Over Time',
          source: isPlayerCaster ? 'player' : 'enemy',
          remainingDuration: effect.duration || 1,
          duration: effect.duration || 1,
          type: 'healing_over_time',
          value: effect.value,
          effect
        };
      } else if (effect.target === 'enemy' && effect.value > 0) {
        // Damage over time on enemy
        newActiveEffect = {
          id: `dot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: 'Damage Over Time',
          source: isPlayerCaster ? 'player' : 'enemy',
          remainingDuration: effect.duration || 1,
          duration: effect.duration || 1,
          type: 'damage_over_time',
          value: effect.value,
          effect
        };
      }

      if (newActiveEffect) {
        newState[effectTarget] = {
          ...newState[effectTarget],
          activeEffects: [...newState[effectTarget].activeEffects, newActiveEffect],
        };

        newState.log.push(createLogEntry({
          turn: newState.turn,
          round: newState.round,
          actor: isPlayerCaster ? 'player' : 'enemy',
          action: 'effect_applied',
          details: `${newActiveEffect.name} applied to ${effectTarget === 'playerWizard' ? 'you' : 'enemy'} for ${effect.duration} turns!`,
        }));
      }
      break;
    }

    case 'statModifier': {
      // Handle duration-based stat modifiers (buffs/debuffs)
      if (effect.duration && effect.duration > 0) {
        let effectType: ActiveEffect['type'];
        let effectName: string;
        
        if (effect.value < 0) {
          // Negative values are damage reduction/shields
          effectType = 'damageReduction';
          effectName = 'Damage Reduction';
        } else {
          // Positive values are buffs
          effectType = 'buff';
          effectName = 'Buff';
        }

        const activeEffect: ActiveEffect = {
          id: `mod-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: effectName,
          source: isPlayerCaster ? 'player' : 'enemy',
          remainingDuration: effect.duration,
          duration: effect.duration,
          type: effectType,
          value: effect.value,
          effect,
        };

        newState[effectTarget] = {
          ...newState[effectTarget],
          activeEffects: [...newState[effectTarget].activeEffects, activeEffect],
        };

        newState.log.push(createLogEntry({
          turn: newState.turn,
          round: newState.round,
          actor: isPlayerCaster ? 'player' : 'enemy',
          action: 'effect_applied',
          details: `${activeEffect.name} applied to ${effectTarget === 'playerWizard' ? 'you' : 'enemy'} for ${effect.duration} turns!`,
        }));
      }
      break;
    }

    case 'summon': {
      const owner = isPlayerCaster ? 'player' : 'enemy';
      const minion: Minion = {
        id: `minion-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: effect.minionName || 'Minion',
        owner,
        ownerId: isPlayerCaster
          ? newState.playerWizard.wizard.id
          : newState.enemyWizard.wizard.id,
        modelPath: effect.modelPath,
        position: { q: 0, r: 0 } as import('../utils/hexUtils').AxialCoord,
        stats: {
          health: effect.health || 10,
          maxHealth: effect.health || 10,
        },
        remainingDuration: effect.duration || 1,
      };

      const casterPos = newState[caster].position || { q: owner === 'player' ? -2 : 2, r: 0 };
      const occupied = [
        newState.playerWizard.position || { q: -2, r: 0 },
        newState.enemyWizard.position || { q: 2, r: 0 },
        ...newState.playerMinions.map(m => m.position),
        ...newState.enemyMinions.map(m => m.position),
      ];
      const spawn = findUnoccupiedAdjacentHex(casterPos, occupied);
      if (spawn) {
        minion.position = spawn;
        if (owner === 'player') {
          newState.playerMinions = [...newState.playerMinions, minion];
        } else {
          newState.enemyMinions = [...newState.enemyMinions, minion];
        }
        newState.log.push(createLogEntry({
          turn: newState.turn,
          round: newState.round,
          actor: owner,
          action: 'summon',
          details: `${owner === 'player' ? 'You' : 'Enemy'} summoned ${minion.name}!`,
        }));
      } else {
        newState.log.push(createLogEntry({
          turn: newState.turn,
          round: newState.round,
          actor: owner,
          action: 'summon_failed',
          details: 'No space to summon a minion!',
        }));
      }
      break;
    }

    case 'damageReduction': {
      // Handle direct damageReduction effects (like Arcane Shield)
      if (effect.duration && effect.duration > 0) {
        const activeEffect: ActiveEffect = {
          id: `dmgred-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: 'Damage Reduction',
          source: isPlayerCaster ? 'player' : 'enemy',
          remainingDuration: effect.duration,
          duration: effect.duration,
          type: 'damageReduction',
          value: effect.value,
          effect,
        };

        newState[effectTarget] = {
          ...newState[effectTarget],
          activeEffects: [...newState[effectTarget].activeEffects, activeEffect],
        };

        newState.log.push(createLogEntry({
          turn: newState.turn,
          round: newState.round,
          actor: isPlayerCaster ? 'player' : 'enemy',
          action: 'effect_applied',
          details: `${activeEffect.name} applied to ${effectTarget === 'playerWizard' ? 'you' : 'enemy'} for ${effect.duration} turns!`,
        }));
      }
      break;
    }
  }

  return newState;
}

/**
 * After the caster acts, let their minions perform a basic attack.
 */
function processMinionActions(state: CombatState, isPlayerCaster: boolean): CombatState {
  let newState = { ...state };
  const list = isPlayerCaster ? newState.playerMinions : newState.enemyMinions;
  const targetKey = isPlayerCaster ? 'enemyWizard' : 'playerWizard';
  const casterKey = isPlayerCaster ? 'playerWizard' : 'enemyWizard';
  for (const minion of list) {
    newState = calculateAndApplyDamage(newState, {
      baseDamage: 5,
      damageType: 'spell',
      element: 'physical',
      caster: casterKey,
      target: targetKey,
      sourceDescription: minion.name,
    });
    minion.remainingDuration -= 1;
  }
  const filtered = list.filter(
    m => m.remainingDuration > 0 && m.stats.health > 0
  );
  if (isPlayerCaster) {
    newState.playerMinions = filtered;
  } else {
    newState.enemyMinions = filtered;
  }
  return newState;
}
