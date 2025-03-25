// src/lib/combat/combatEngine.ts
import { CombatState, CombatWizard, Wizard, Spell, SpellEffect, ActiveEffect, CombatLogEntry } from '../types';
import { calculateWizardStats } from '../wizard/wizardUtils';
import { getAISpellSelection } from './aiEngine';

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
  
  return {
    playerWizard: {
      wizard: calculatedPlayerWizard,
      currentHealth: calculatedPlayerWizard.maxHealth,
      currentMana: calculatedPlayerWizard.maxMana,
      activeEffects: [],
      selectedSpell: null,
    },
    enemyWizard: {
      wizard: calculatedEnemyWizard,
      currentHealth: calculatedEnemyWizard.maxHealth,
      currentMana: calculatedEnemyWizard.maxMana,
      activeEffects: [],
      selectedSpell: null,
    },
    turn: 1,
    round: 1,
    isPlayerTurn: true, // Player goes first
    log: [],
    status: 'active',
    difficulty,
  };
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
  
  const damage = spellTier + damageModifier;
  
  // Apply damage to target
  newState[target] = {
    ...newState[target],
    currentHealth: Math.max(0, newState[target].currentHealth - damage),
  };
  
  // Add to combat log
  newState.log.push({
    turn: newState.turn,
    round: newState.round,
    actor,
    action: 'mystic_punch',
    details: `${actor === 'player' ? 'You' : 'Enemy'} used Mystic Punch for ${damage} damage!`,
    damage,
  });
  
  // Check if combat has ended
  if (newState[target].currentHealth <= 0) {
    newState.status = isPlayer ? 'playerWon' : 'enemyWon';
    newState.log.push({
      turn: newState.turn,
      round: newState.round,
      actor,
      action: 'combat_end',
      details: `${actor === 'player' ? 'You' : 'Enemy'} won the duel!`,
    });
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
    newState.log.push({
      turn: newState.turn,
      round: newState.round,
      actor: isPlayer ? 'player' : 'enemy',
      action: 'spell_failed',
      details: `Not enough mana to cast ${spell.name}!`,
    });
    return advanceTurn(newState);
  }
  
  // Deduct mana cost
  newState[caster] = {
    ...newState[caster],
    currentMana: newState[caster].currentMana - spell.manaCost,
    selectedSpell: null, // Clear selected spell
  };
  
  // Add to combat log
  newState.log.push({
    turn: newState.turn,
    round: newState.round,
    actor: isPlayer ? 'player' : 'enemy',
    action: 'spell_cast',
    details: `${isPlayer ? 'You' : 'Enemy'} cast ${spell.name}!`,
  });
  
  // Apply spell effects
  spell.effects.forEach(effect => {
    newState = applySpellEffect(newState, effect, isPlayer);
  });
  
  // Check if combat has ended
  if (newState.playerWizard.currentHealth <= 0) {
    newState.status = 'enemyWon';
    newState.log.push({
      turn: newState.turn,
      round: newState.round,
      actor: 'enemy',
      action: 'combat_end',
      details: 'Enemy won the duel!',
    });
  } else if (newState.enemyWizard.currentHealth <= 0) {
    newState.status = 'playerWon';
    newState.log.push({
      turn: newState.turn,
      round: newState.round,
      actor: 'player',
      action: 'combat_end',
      details: 'You won the duel!',
    });
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
      newState.log.push({
        turn: newState.turn,
        round: newState.round,
        actor: isPlayerCaster ? 'player' : 'enemy',
        action: 'damage',
        details: `${effect.value} ${effect.element || ''} damage to ${effectTarget === 'playerWizard' ? 'you' : 'enemy'}!`,
        damage: effect.value,
      });
      break;
      
    case 'healing':
      // Apply immediate healing
      const maxHealth = newState[effectTarget].wizard.maxHealth;
      newState[effectTarget] = {
        ...newState[effectTarget],
        currentHealth: Math.min(maxHealth, newState[effectTarget].currentHealth + effect.value),
      };
      
      // Add to combat log
      newState.log.push({
        turn: newState.turn,
        round: newState.round,
        actor: isPlayerCaster ? 'player' : 'enemy',
        action: 'healing',
        details: `${effect.value} healing to ${effectTarget === 'playerWizard' ? 'you' : 'enemy'}!`,
        healing: effect.value,
      });
      break;
      
    case 'manaRestore':
      // Apply immediate mana restoration
      const maxMana = newState[effectTarget].wizard.maxMana;
      newState[effectTarget] = {
        ...newState[effectTarget],
        currentMana: Math.min(maxMana, newState[effectTarget].currentMana + effect.value),
      };
      
      // Add to combat log
      newState.log.push({
        turn: newState.turn,
        round: newState.round,
        actor: isPlayerCaster ? 'player' : 'enemy',
        action: 'mana_restore',
        details: `${effect.value} mana restored to ${effectTarget === 'playerWizard' ? 'you' : 'enemy'}!`,
        mana: effect.value,
      });
      break;
      
    case 'statModifier':
    case 'statusEffect':
      // Add effect to active effects if it has a duration
      if (effect.duration && effect.duration > 0) {
        const activeEffect: ActiveEffect = {
          id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: effect.type === 'statModifier' ? 'Stat Modifier' : 'Status Effect',
          effect: { ...effect },
          remainingDuration: effect.duration,
          source: isPlayerCaster ? 'player' : 'enemy',
        };
        
        newState[effectTarget] = {
          ...newState[effectTarget],
          activeEffects: [...newState[effectTarget].activeEffects, activeEffect],
        };
        
        // Add to combat log
        newState.log.push({
          turn: newState.turn,
          round: newState.round,
          actor: isPlayerCaster ? 'player' : 'enemy',
          action: 'effect_applied',
          details: `Applied ${activeEffect.name} to ${effectTarget === 'playerWizard' ? 'you' : 'enemy'} for ${effect.duration} turns!`,
        });
      }
      break;
  }
  
  return newState;
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
        newState.log.push({
          turn: newState.turn,
          round: newState.round,
          actor: activeEffect.source,
          action: 'damage_over_time',
          details: `${effect.value} ${effect.element || ''} damage to ${isPlayer ? 'you' : 'enemy'} from ${activeEffect.name}!`,
          damage: effect.value,
        });
        break;
        
      case 'healing':
        // Apply healing over time
        const maxHealth = newState[wizard].wizard.maxHealth;
        newState[wizard] = {
          ...newState[wizard],
          currentHealth: Math.min(maxHealth, newState[wizard].currentHealth + effect.value),
        };
        
        // Add to combat log
        newState.log.push({
          turn: newState.turn,
          round: newState.round,
          actor: activeEffect.source,
          action: 'healing_over_time',
          details: `${effect.value} healing to ${isPlayer ? 'you' : 'enemy'} from ${activeEffect.name}!`,
          healing: effect.value,
        });
        break;
        
      case 'manaRestore':
        // Apply mana restoration over time
        const maxMana = newState[wizard].wizard.maxMana;
        newState[wizard] = {
          ...newState[wizard],
          currentMana: Math.min(maxMana, newState[wizard].currentMana + effect.value),
        };
        
        // Add to combat log
        newState.log.push({
          turn: newState.turn,
          round: newState.round,
          actor: activeEffect.source,
          action: 'mana_restore_over_time',
          details: `${effect.value} mana restored to ${isPlayer ? 'you' : 'enemy'} from ${activeEffect.name}!`,
          mana: effect.value,
        });
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
    newState.log.push({
      turn: newState.turn,
      round: newState.round,
      actor: expiredEffect.source,
      action: 'effect_expired',
      details: `${expiredEffect.name} has expired for ${isPlayer ? 'you' : 'enemy'}!`,
    });
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
  newState.log.push({
    turn: newState.turn,
    round: newState.round,
    actor: isPlayer ? 'player' : 'enemy',
    action: 'mana_regen',
    details: `${isPlayer ? 'You' : 'Enemy'} regenerated ${manaRegen} mana!`,
    mana: manaRegen,
  });
  
  return newState;
}

/**
 * Advance the turn in combat
 * @param state The current combat state
 * @returns Updated combat state
 */
function advanceTurn(state: CombatState): CombatState {
  let newState = { ...state };
  
  // If combat has ended, don't advance turn
  if (newState.status !== 'active') {
    return newState;
  }
  
  // Toggle player turn
  newState.isPlayerTurn = !newState.isPlayerTurn;
  
  // If it's the start of a new round (after enemy's turn)
  if (!newState.isPlayerTurn) {
    newState.turn++;
  } else {
    newState.round++;
    
    // Process active effects at the start of a new round
    newState = processActiveEffects(newState, true); // Player effects
    newState = processActiveEffects(newState, false); // Enemy effects
    
    // Regenerate mana at the start of a new round
    newState = regenerateMana(newState, true); // Player mana
    newState = regenerateMana(newState, false); // Enemy mana
  }
  
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
