// src/lib/features/enemyAI.ts
import { CombatState, Spell, Wizard } from '../types';
import { getAISpellSelection } from '../combat/combatEngine';

/**
 * Handles enemy AI decision making during combat
 */
export class EnemyAI {
  /**
   * Selects a spell for the enemy to cast based on the current combat state and difficulty
   * @param combatState The current state of combat
   * @returns The selected spell or null for mystic punch
   */
  static selectSpell(combatState: CombatState): Spell | null {
    return getAISpellSelection(combatState);
  }
  
  /**
   * Determines if the enemy should use mystic punch instead of casting a spell
   * @param combatState The current state of combat
   * @returns True if the enemy should use mystic punch
   */
  static shouldUseMysticPunch(combatState: CombatState): boolean {
    const { enemyWizard, difficulty } = combatState;
    
    // If no spells can be cast due to mana constraints, use mystic punch
    const canCastSpell = enemyWizard.wizard.equippedSpells.some(
      spell => spell.manaCost <= enemyWizard.currentMana
    );
    
    if (!canCastSpell) return true;
    
    // Random chance to use mystic punch based on difficulty
    const randomChance = Math.random();
    switch (difficulty) {
      case 'easy':
        // Easy enemies rarely use mystic punch when they can cast spells
        return randomChance < 0.1;
      case 'normal':
        // Normal enemies sometimes use mystic punch strategically
        return randomChance < 0.25;
      case 'hard':
        // Hard enemies use mystic punch more tactically
        // More likely to use it when player health is low
        const playerHealthPercentage = combatState.playerWizard.currentHealth / 
                                      combatState.playerWizard.wizard.maxHealth;
        return randomChance < (0.3 + (1 - playerHealthPercentage) * 0.2);
      default:
        return randomChance < 0.2;
    }
  }
  
  /**
   * Selects which spell to discard for mystic punch
   * @param enemyWizard The enemy wizard
   * @param difficulty The game difficulty
   * @returns The index of the spell to discard
   */
  static selectSpellToDiscard(enemyWizard: Wizard, difficulty: 'easy' | 'normal' | 'hard'): number {
    const spells = enemyWizard.equippedSpells;
    
    if (spells.length === 0) return -1;
    
    switch (difficulty) {
      case 'easy':
        // Easy enemies discard their highest tier spell (worst decision)
        return spells.reduce((highestIndex, spell, currentIndex, arr) => 
          spell.tier > arr[highestIndex].tier ? currentIndex : highestIndex, 0);
      
      case 'hard':
        // Hard enemies discard their lowest tier spell (best decision)
        return spells.reduce((lowestIndex, spell, currentIndex, arr) => 
          spell.tier < arr[lowestIndex].tier ? currentIndex : lowestIndex, 0);
      
      case 'normal':
      default:
        // Normal enemies discard a random spell
        return Math.floor(Math.random() * spells.length);
    }
  }
}
