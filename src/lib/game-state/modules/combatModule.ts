// src/lib/game-state/modules/combatModule.ts
// Combat-related state management

import { CombatState, CombatWizard, CombatLogEntry } from '../../types/combat-types';
import { Wizard } from '../../types/wizard-types';
import { Spell, ActiveEffect, SpellEffect } from '../../types/spell-types';
import { ElementType } from '../../types/element-types';

// Define the slice of state this module manages
export interface CombatSlice {
  combatState: CombatState | null;
}

// Define the actions this module provides
export interface CombatActions {
  initializeCombat: (playerWizard: Wizard, enemyWizard: Wizard, difficulty: 'easy' | 'normal' | 'hard') => void;
  getCombatState: () => CombatState | null;
  selectSpell: (spell: Spell, isPlayer: boolean) => void;
  castSpell: (isPlayer: boolean) => void;
  executeMysticPunch: (spell: Spell | null, isPlayer: boolean) => void;
  skipTurn: (isPlayer: boolean) => void;
  addCombatLogEntry: (entry: Omit<CombatLogEntry, 'timestamp'>) => void;
  processTurnEffects: (isPlayer: boolean) => void;
  endCombat: (winner: 'player' | 'enemy') => void;
  resetCombat: () => void;
}

// Helper to generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to calculate damage based on difficulty and stats
const calculateDamage = (baseDamage: number, isPlayer: boolean, difficulty: 'easy' | 'normal' | 'hard'): number => {
  let damageMultiplier = 1.0;
  
  // Adjust based on difficulty
  if (isPlayer) {
    // Player does more damage on easy, less on hard
    damageMultiplier = difficulty === 'easy' ? 1.5 : 
                      difficulty === 'normal' ? 1.0 : 0.8;
  } else {
    // Enemy does less damage on easy, more on hard
    damageMultiplier = difficulty === 'easy' ? 0.7 : 
                      difficulty === 'normal' ? 1.0 : 1.3;
  }
  
  return Math.round(baseDamage * damageMultiplier);
};

// Helper to apply spell effects
const applySpellEffect = (
  effect: SpellEffect, 
  caster: CombatWizard, 
  target: CombatWizard,
  isPlayerCasting: boolean,
  difficulty: 'easy' | 'normal' | 'hard'
): { damage?: number; healing?: number; newEffects: ActiveEffect[] } => {
  const newEffects: ActiveEffect[] = [];
  let damage = 0;
  let healing = 0;
  
  switch (effect.type) {
    case 'damage':
      damage = calculateDamage(effect.value, isPlayerCasting, difficulty);
      target.currentHealth = Math.max(0, target.currentHealth - damage);
      break;
      
    case 'healing':
      healing = effect.value;
      if (effect.target === 'self') {
        caster.currentHealth = Math.min(caster.wizard.maxHealth, caster.currentHealth + healing);
      } else {
        target.currentHealth = Math.min(target.wizard.maxHealth, target.currentHealth + healing);
      }
      break;
      
    case 'buff':
    case 'debuff':
    case 'statusEffect':
      if (effect.duration && effect.duration > 0) {
        const newEffect: ActiveEffect = {
          id: generateId(),
          name: effect.type === 'buff' ? 'Buff' : 
                effect.type === 'debuff' ? 'Debuff' : 'Status Effect',
          type: effect.type === 'buff' ? 'healing_over_time' : 
                effect.type === 'debuff' ? 'damage_over_time' : 'stun',
          value: effect.value,
          duration: effect.duration,
          remainingDuration: effect.duration,
          source: isPlayerCasting ? 'player' : 'enemy',
          effect
        };
        
        // Apply to the correct target
        if (effect.target === 'self') {
          caster.activeEffects.push(newEffect);
        } else {
          target.activeEffects.push(newEffect);
        }
        
        newEffects.push(newEffect);
      }
      break;
      
    // Add more cases for other effect types
  }
  
  return { damage, healing, newEffects };
};

// Create the module
export const createCombatModule = (set: Function, get: Function): CombatActions => ({
  initializeCombat: (playerWizard, enemyWizard, difficulty) => {
    // Initialize player combat wizard
    const playerCombatWizard: CombatWizard = {
      wizard: { ...playerWizard },
      currentHealth: playerWizard.health,
      currentMana: playerWizard.mana,
      activeEffects: [],
      selectedSpell: null,
      hand: [], // Will be filled with spells from the deck
      drawPile: [...playerWizard.equippedSpells], // Start with all equipped spells in draw pile
      discardPile: []
    };
    
    // Initialize enemy combat wizard
    const enemyCombatWizard: CombatWizard = {
      wizard: { ...enemyWizard },
      currentHealth: enemyWizard.health,
      currentMana: enemyWizard.mana,
      activeEffects: [],
      selectedSpell: null,
      hand: [], // Will be filled with spells
      drawPile: [...enemyWizard.equippedSpells], // Start with all equipped spells
      discardPile: []
    };
    
    // Shuffle player's deck
    playerCombatWizard.drawPile.sort(() => Math.random() - 0.5);
    
    // Draw initial hand for player (3 cards)
    const drawCount = Math.min(3 + (playerWizard.combatStats?.extraCardDraw || 0), playerCombatWizard.drawPile.length);
    playerCombatWizard.hand = playerCombatWizard.drawPile.splice(0, drawCount);
    
    // Shuffle enemy's deck
    enemyCombatWizard.drawPile.sort(() => Math.random() - 0.5);
    
    // Draw initial hand for enemy (3 cards)
    enemyCombatWizard.hand = enemyCombatWizard.drawPile.splice(0, 3);
    
    // Initialize combat state
    const initialCombatState: CombatState = {
      playerWizard: playerCombatWizard,
      enemyWizard: enemyCombatWizard,
      turn: 1,
      round: 1,
      isPlayerTurn: true, // Player goes first
      log: [{
        turn: 0,
        round: 0,
        actor: 'system',
        action: 'combat_start',
        timestamp: Date.now()
      }],
      status: 'active',
      difficulty
    };
    
    set((state: any) => ({
      combatState: initialCombatState
    }));
  },

  getCombatState: () => {
    return get().combatState;
  },

  selectSpell: (spell, isPlayer) => {
    set((state: any) => {
      const combatState = { ...state.combatState };
      if (!combatState) return state;
      
      if (isPlayer) {
        combatState.playerWizard = {
          ...combatState.playerWizard,
          selectedSpell: spell
        };
      } else {
        combatState.enemyWizard = {
          ...combatState.enemyWizard,
          selectedSpell: spell
        };
      }
      
      return { combatState };
    });
  },

  castSpell: (isPlayer) => {
    set((state: any) => {
      const combatState = { ...state.combatState };
      if (!combatState) return state;
      
      const caster = isPlayer ? combatState.playerWizard : combatState.enemyWizard;
      const target = isPlayer ? combatState.enemyWizard : combatState.playerWizard;
      
      // Check if a spell is selected
      if (!caster.selectedSpell) return state;
      
      const spell = caster.selectedSpell;
      
      // Check if caster has enough mana
      if (caster.currentMana < spell.manaCost) return state;
      
      // Deduct mana cost
      caster.currentMana -= spell.manaCost;
      
      // Apply spell effects
      let totalDamage = 0;
      let totalHealing = 0;
      const newEffects: ActiveEffect[] = [];
      
      for (const effect of spell.effects) {
        const { damage, healing, newEffects: effectsApplied } = applySpellEffect(
          effect, 
          caster, 
          target, 
          isPlayer, 
          combatState.difficulty
        );
        
        if (damage) totalDamage += damage;
        if (healing) totalHealing += healing;
        newEffects.push(...effectsApplied);
      }
      
      // Create log entry for the spell cast
      const logEntry: CombatLogEntry = {
        turn: combatState.turn,
        round: combatState.round,
        actor: isPlayer ? 'player' : 'enemy',
        action: 'spell_cast',
        target: isPlayer ? 'enemy' : 'player',
        spellName: spell.name,
        value: totalDamage || totalHealing,
        element: spell.element as ElementType,
        timestamp: Date.now(),
        damage: totalDamage,
        healing: totalHealing
      };
      
      combatState.log.push(logEntry);
      
      // Move the spell from hand to discard pile
      const handIndex = caster.hand.findIndex(s => s.id === spell.id);
      if (handIndex !== -1) {
        const discardedSpell = caster.hand.splice(handIndex, 1)[0];
        caster.discardPile.push(discardedSpell);
      }
      
      // Clear selected spell
      caster.selectedSpell = null;
      
      // Check if combat has ended
      if (target.currentHealth <= 0) {
        combatState.status = isPlayer ? 'playerWon' : 'enemyWon';
        return { combatState };
      }
      
      // End the turn
      if (isPlayer === combatState.isPlayerTurn) {
        combatState.isPlayerTurn = !combatState.isPlayerTurn;
        
        // If it's now the enemy's turn, increment the turn counter
        if (!combatState.isPlayerTurn) {
          combatState.turn++;
          
          // Check if we need to increment the round counter (after both players have gone)
          if (combatState.turn % 2 === 1) {
            combatState.round++;
            
            // Draw a card at the start of each round
            // Draw for player if it's now their turn (odd turn number)
            if (combatState.playerWizard.drawPile.length === 0) {
              // Shuffle discard pile into draw pile
              combatState.playerWizard.drawPile = [...combatState.playerWizard.discardPile].sort(() => Math.random() - 0.5);
              combatState.playerWizard.discardPile = [];
            }
            
            if (combatState.playerWizard.drawPile.length > 0) {
              const drawnCard = combatState.playerWizard.drawPile.shift()!;
              combatState.playerWizard.hand.push(drawnCard);
            }
            
            // Regenerate some mana for both wizards at the start of a round
            combatState.playerWizard.currentMana = Math.min(
              combatState.playerWizard.wizard.maxMana,
              combatState.playerWizard.currentMana + combatState.playerWizard.wizard.manaRegen
            );
            
            combatState.enemyWizard.currentMana = Math.min(
              combatState.enemyWizard.wizard.maxMana,
              combatState.enemyWizard.currentMana + (combatState.enemyWizard.wizard.manaRegen || 5)
            );
          }
          
          // Draw for enemy at the start of their turn
          if (combatState.enemyWizard.drawPile.length === 0) {
            // Shuffle discard pile into draw pile
            combatState.enemyWizard.drawPile = [...combatState.enemyWizard.discardPile].sort(() => Math.random() - 0.5);
            combatState.enemyWizard.discardPile = [];
          }
          
          if (combatState.enemyWizard.drawPile.length > 0 && combatState.enemyWizard.hand.length < 3) {
            const drawnCard = combatState.enemyWizard.drawPile.shift()!;
            combatState.enemyWizard.hand.push(drawnCard);
          }
        }
      }
      
      return { combatState };
    });
  },

  executeMysticPunch: (spell, isPlayer) => {
    set((state: any) => {
      if (!state.combatState) return state;
      
      const combatState = { ...state.combatState };
      
      // Get the attacker and defender
      const attacker = isPlayer ? combatState.playerWizard : combatState.enemyWizard;
      const defender = isPlayer ? combatState.enemyWizard : combatState.playerWizard;
      
      // Safety checks
      if (!spell || !attacker || !defender) return state;
      
      // Safe access to wizard data
      if (!attacker.wizard) {
        // Clone a minimal wizard object if missing
        attacker.wizard = {
          maxHealth: 100,
          maxMana: 100,
          manaRegen: 5,
          combatStats: { mysticPunchPower: 0 }
        };
      }
      
      // Base damage calculation (with null-safe access)
      const mysticPunchPower = attacker.wizard.combatStats?.mysticPunchPower || 0;
      
      // Calculate damage based on spell tier and difficulty
      let damageModifier = 0;
      if (combatState.difficulty === 'easy') {
        damageModifier = isPlayer ? 20 : 5;
      } else if (combatState.difficulty === 'normal') {
        damageModifier = isPlayer ? 5 : 10;
      } else {
        damageModifier = isPlayer ? 2 : 15;
      }
      
      // Add mystic punch power bonus
      damageModifier += mysticPunchPower;
      
      const damage = spell.tier + damageModifier;
      
      // Apply damage to defender
      defender.currentHealth = Math.max(0, defender.currentHealth - damage);
      
      // Find the spell in hand and move it to discard pile
      const hand = [...attacker.hand];
      const discardPile = [...attacker.discardPile];
      
      const spellIndex = hand.findIndex(s => s.id === spell.id);
      if (spellIndex !== -1) {
        const [discardedSpell] = hand.splice(spellIndex, 1);
        discardPile.push(discardedSpell);
        
        attacker.hand = hand;
        attacker.discardPile = discardPile;
      }
      
      // Add log entry
      const logEntry: CombatLogEntry = {
        turn: combatState.turn,
        round: combatState.round,
        actor: isPlayer ? 'player' : 'enemy',
        action: 'mystic_punch',
        target: isPlayer ? 'enemy' : 'player',
        value: damage,
        timestamp: Date.now(),
        damage,
        details: `${isPlayer ? 'You' : 'Enemy'} used Mystic Punch with ${spell.name} for ${damage} damage!`
      };
      
      combatState.log.push(logEntry);
      
      // Check if combat has ended
      if (defender.currentHealth <= 0) {
        combatState.status = isPlayer ? 'playerWon' : 'enemyWon';
        return { combatState };
      }
      
      // End turn
      if (isPlayer === combatState.isPlayerTurn) {
        combatState.isPlayerTurn = !combatState.isPlayerTurn;
        
        // If it's now the enemy's turn, increment the turn counter
        if (!combatState.isPlayerTurn) {
          combatState.turn++;
          
          // Check if we need to increment the round counter (after both players have gone)
          if (combatState.turn % 2 === 1) {
            combatState.round++;
            
            // Draw a card at the start of each round for the player
            if (combatState.playerWizard.drawPile.length === 0) {
              // Shuffle discard pile into draw pile
              combatState.playerWizard.drawPile = [...combatState.playerWizard.discardPile].sort(() => Math.random() - 0.5);
              combatState.playerWizard.discardPile = [];
            }
            
            if (combatState.playerWizard.drawPile.length > 0) {
              const drawnCard = combatState.playerWizard.drawPile.shift()!;
              combatState.playerWizard.hand.push(drawnCard);
            }
            
            // Regenerate some mana for both wizards
            combatState.playerWizard.currentMana = Math.min(
              combatState.playerWizard.wizard.maxMana,
              combatState.playerWizard.currentMana + combatState.playerWizard.wizard.manaRegen
            );
            
            combatState.enemyWizard.currentMana = Math.min(
              combatState.enemyWizard.wizard.maxMana,
              combatState.enemyWizard.currentMana + (combatState.enemyWizard.wizard.manaRegen || 5)
            );
          }
        }
      }
      
      return { combatState };
    });
  },

  skipTurn: (isPlayer) => {
    set((state: any) => {
      const combatState = { ...state.combatState };
      if (!combatState) return state;
      
      // Add log entry
      const logEntry: CombatLogEntry = {
        turn: combatState.turn,
        round: combatState.round,
        actor: isPlayer ? 'player' : 'enemy',
        action: 'skip_turn',
        timestamp: Date.now()
      };
      
      combatState.log.push(logEntry);
      
      // End turn
      if (isPlayer === combatState.isPlayerTurn) {
        combatState.isPlayerTurn = !combatState.isPlayerTurn;
        
        // If it's now the enemy's turn, increment the turn counter
        if (!combatState.isPlayerTurn) {
          combatState.turn++;
          
          // Check if we need to increment the round counter (after both players have gone)
          if (combatState.turn % 2 === 1) {
            combatState.round++;
            
            // Draw a card at the start of each round for the player
            if (combatState.playerWizard.drawPile.length === 0) {
              // Shuffle discard pile into draw pile
              combatState.playerWizard.drawPile = [...combatState.playerWizard.discardPile].sort(() => Math.random() - 0.5);
              combatState.playerWizard.discardPile = [];
            }
            
            if (combatState.playerWizard.drawPile.length > 0) {
              const drawnCard = combatState.playerWizard.drawPile.shift()!;
              combatState.playerWizard.hand.push(drawnCard);
            }
            
            // Regenerate some mana
            combatState.playerWizard.currentMana = Math.min(
              combatState.playerWizard.wizard.maxMana,
              combatState.playerWizard.currentMana + combatState.playerWizard.wizard.manaRegen
            );
            
            combatState.enemyWizard.currentMana = Math.min(
              combatState.enemyWizard.wizard.maxMana,
              combatState.enemyWizard.currentMana + (combatState.enemyWizard.wizard.manaRegen || 5)
            );
          }
        }
      }
      
      return { combatState };
    });
  },

  addCombatLogEntry: (entry) => {
    set((state: any) => {
      const combatState = { ...state.combatState };
      if (!combatState) return state;
      
      const newEntry: CombatLogEntry = {
        ...entry,
        timestamp: Date.now()
      };
      
      combatState.log.push(newEntry);
      
      return { combatState };
    });
  },

  processTurnEffects: (isPlayer) => {
    set((state: any) => {
      const combatState = { ...state.combatState };
      if (!combatState) return state;
      
      const affectedWizard = isPlayer ? combatState.playerWizard : combatState.enemyWizard;
      
      // Process each active effect
      const expiredEffects: string[] = [];
      
      for (const effect of affectedWizard.activeEffects) {
        // Apply the effect
        switch (effect.type) {
          case 'damage_over_time':
            const damage = calculateDamage(effect.value, effect.source === 'player', combatState.difficulty);
            affectedWizard.currentHealth = Math.max(0, affectedWizard.currentHealth - damage);
            
            // Log the effect
            combatState.log.push({
              turn: combatState.turn,
              round: combatState.round,
              actor: effect.source || 'system',
              action: 'effect_tick',
              target: isPlayer ? 'player' : 'enemy',
              value: damage,
              timestamp: Date.now(),
              damage,
              details: `${effect.name} dealt ${damage} damage`
            });
            break;
            
          case 'healing_over_time':
            const healing = effect.value;
            affectedWizard.currentHealth = Math.min(
              affectedWizard.wizard.maxHealth,
              affectedWizard.currentHealth + healing
            );
            
            // Log the effect
            combatState.log.push({
              turn: combatState.turn,
              round: combatState.round,
              actor: effect.source || 'system',
              action: 'effect_tick',
              target: isPlayer ? 'player' : 'enemy',
              value: healing,
              timestamp: Date.now(),
              healing,
              details: `${effect.name} healed for ${healing}`
            });
            break;
            
          case 'mana_drain':
            const manaDrain = effect.value;
            affectedWizard.currentMana = Math.max(0, affectedWizard.currentMana - manaDrain);
            
            // Log the effect
            combatState.log.push({
              turn: combatState.turn,
              round: combatState.round,
              actor: effect.source || 'system',
              action: 'effect_tick',
              target: isPlayer ? 'player' : 'enemy',
              value: manaDrain,
              timestamp: Date.now(),
              mana: -manaDrain,
              details: `${effect.name} drained ${manaDrain} mana`
            });
            break;
            
          case 'mana_regen':
            const manaRegen = effect.value;
            affectedWizard.currentMana = Math.min(
              affectedWizard.wizard.maxMana,
              affectedWizard.currentMana + manaRegen
            );
            
            // Log the effect
            combatState.log.push({
              turn: combatState.turn,
              round: combatState.round,
              actor: effect.source || 'system',
              action: 'effect_tick',
              target: isPlayer ? 'player' : 'enemy',
              value: manaRegen,
              timestamp: Date.now(),
              mana: manaRegen,
              details: `${effect.name} restored ${manaRegen} mana`
            });
            break;
            
          // Add cases for other effect types
        }
        
        // Decrement remaining duration
        effect.remainingDuration--;
        
        // Check if effect has expired
        if (effect.remainingDuration <= 0) {
          expiredEffects.push(effect.id || '');
          
          // Log the expiration
          combatState.log.push({
            turn: combatState.turn,
            round: combatState.round,
            actor: 'system',
            action: 'effect_expired',
            target: isPlayer ? 'player' : 'enemy',
            timestamp: Date.now(),
            details: `${effect.name} expired`
          });
        }
      }
      
      // Remove expired effects
      affectedWizard.activeEffects = affectedWizard.activeEffects.filter(
        effect => !expiredEffects.includes(effect.id || '')
      );
      
      // Check if combat has ended
      if (affectedWizard.currentHealth <= 0) {
        combatState.status = isPlayer ? 'enemyWon' : 'playerWon';
      }
      
      return { combatState };
    });
  },

  endCombat: (winner) => {
    set((state: any) => {
      const combatState = { ...state.combatState };
      if (!combatState) return state;
      
      combatState.status = winner === 'player' ? 'playerWon' : 'enemyWon';
      
      return { combatState };
    });
  },

  resetCombat: () => {
    set({ combatState: null });
  }
}); 