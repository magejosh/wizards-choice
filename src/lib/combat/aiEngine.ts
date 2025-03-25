import { CombatState, Spell, SpellType, ElementType, CombatWizard } from '../types';

// Interface for AI strategies
interface AIStrategy {
  /**
   * Select a spell based on the current combat state
   * @param state Current combat state
   * @returns Selected spell or null if using Mystic Punch
   */
  selectSpell(state: CombatState): Spell | null;
  
  /**
   * Get the name of this strategy
   */
  getName(): string;
}

/**
 * Base class for AI strategies that contains common utility methods
 */
abstract class BaseAIStrategy implements AIStrategy {
  abstract selectSpell(state: CombatState): Spell | null;
  abstract getName(): string;
  
  /**
   * Get spells that can be cast with current mana
   */
  protected getAvailableSpells(state: CombatState): Spell[] {
    return state.enemyWizard.wizard.equippedSpells.filter(
      spell => spell.manaCost <= state.enemyWizard.currentMana
    );
  }
  
  /**
   * Calculate total damage of a spell
   */
  protected calculateSpellDamage(spell: Spell): number {
    return spell.effects.reduce((sum, effect) => 
      effect.type === 'damage' ? sum + effect.value : sum, 0);
  }
  
  /**
   * Calculate total healing of a spell
   */
  protected calculateSpellHealing(spell: Spell): number {
    return spell.effects.reduce((sum, effect) => 
      effect.type === 'healing' ? sum + effect.value : sum, 0);
  }
  
  /**
   * Check if a wizard is in low health (below 40%)
   */
  protected isLowHealth(wizard: CombatWizard): boolean {
    return wizard.currentHealth < wizard.wizard.maxHealth * 0.4;
  }
  
  /**
   * Check if a wizard is in critical health (below 25%)
   */
  protected isCriticalHealth(wizard: CombatWizard): boolean {
    return wizard.currentHealth < wizard.wizard.maxHealth * 0.25;
  }
  
  /**
   * Check if mana is low (below 30%)
   */
  protected isLowMana(wizard: CombatWizard): boolean {
    return wizard.currentMana < wizard.wizard.maxMana * 0.3;
  }
  
  /**
   * Find spells of a specific type
   */
  protected getSpellsByType(spells: Spell[], type: SpellType): Spell[] {
    return spells.filter(spell => spell.type === type);
  }
  
  /**
   * Find spells of a specific element
   */
  protected getSpellsByElement(spells: Spell[], element: ElementType): Spell[] {
    return spells.filter(spell => spell.element === element);
  }
}

/**
 * Defensive AI Strategy - Prioritizes healing and buffs when health is low
 */
class DefensiveStrategy extends BaseAIStrategy {
  selectSpell(state: CombatState): Spell | null {
    const availableSpells = this.getAvailableSpells(state);
    
    if (availableSpells.length === 0) {
      return null; // Use Mystic Punch
    }
    
    // If health is critical, prioritize healing spells
    if (this.isCriticalHealth(state.enemyWizard)) {
      const healingSpells = this.getSpellsByType(availableSpells, 'healing');
      if (healingSpells.length > 0) {
        // Select the highest healing spell
        return healingSpells.sort((a, b) => 
          this.calculateSpellHealing(b) - this.calculateSpellHealing(a))[0];
      }
    }
    
    // If health is low, consider healing or buff spells
    if (this.isLowHealth(state.enemyWizard)) {
      const defensiveSpells = [
        ...this.getSpellsByType(availableSpells, 'healing'),
        ...this.getSpellsByType(availableSpells, 'buff')
      ];
      
      if (defensiveSpells.length > 0) {
        return defensiveSpells[Math.floor(Math.random() * defensiveSpells.length)];
      }
    }
    
    // If player has active buffs, consider using debuff spells
    const playerHasBuffs = state.playerWizard.activeEffects.some(effect => 
      effect.effect.type === 'statModifier' && effect.effect.value > 0);
      
    if (playerHasBuffs) {
      const debuffSpells = this.getSpellsByType(availableSpells, 'debuff');
      if (debuffSpells.length > 0 && Math.random() > 0.5) {
        return debuffSpells[Math.floor(Math.random() * debuffSpells.length)];
      }
    }
    
    // Otherwise, use a mix of damage and strategic spells
    const damageSpells = this.getSpellsByType(availableSpells, 'damage');
    if (damageSpells.length > 0 && Math.random() > 0.3) {
      const damageSpell = damageSpells[Math.floor(Math.random() * damageSpells.length)];
      return damageSpell;
    }
    
    // As a fallback, just pick a random spell
    return availableSpells[Math.floor(Math.random() * availableSpells.length)];
  }
  
  getName(): string {
    return 'Defensive';
  }
}

/**
 * Aggressive AI Strategy - Prioritizes damage and debuffs
 */
class AggressiveStrategy extends BaseAIStrategy {
  selectSpell(state: CombatState): Spell | null {
    const availableSpells = this.getAvailableSpells(state);
    
    if (availableSpells.length === 0) {
      return null; // Use Mystic Punch
    }
    
    // If enemy health is critical, still consider healing
    if (this.isCriticalHealth(state.enemyWizard) && Math.random() > 0.7) {
      const healingSpells = this.getSpellsByType(availableSpells, 'healing');
      if (healingSpells.length > 0) {
        return healingSpells[Math.floor(Math.random() * healingSpells.length)];
      }
    }
    
    // Prioritize high damage spells
    const damageSpells = this.getSpellsByType(availableSpells, 'damage');
    if (damageSpells.length > 0) {
      // Sort by damage and get top 3 or all if less than 3
      const topDamageSpells = [...damageSpells]
        .sort((a, b) => this.calculateSpellDamage(b) - this.calculateSpellDamage(a))
        .slice(0, Math.min(3, damageSpells.length));
      
      // 70% chance to use a high damage spell
      if (Math.random() < 0.7) {
        return topDamageSpells[Math.floor(Math.random() * topDamageSpells.length)];
      }
    }
    
    // Consider debuffs if player's health is high
    if (state.playerWizard.currentHealth > state.playerWizard.wizard.maxHealth * 0.7) {
      const debuffSpells = this.getSpellsByType(availableSpells, 'debuff');
      if (debuffSpells.length > 0 && Math.random() > 0.5) {
        return debuffSpells[Math.floor(Math.random() * debuffSpells.length)];
      }
    }
    
    // As a fallback, use a random spell, favoring damage spells
    return availableSpells[Math.floor(Math.random() * availableSpells.length)];
  }
  
  getName(): string {
    return 'Aggressive';
  }
}

/**
 * Balanced AI Strategy - Uses a mix of all spell types based on situation
 */
class BalancedStrategy extends BaseAIStrategy {
  selectSpell(state: CombatState): Spell | null {
    const availableSpells = this.getAvailableSpells(state);
    
    if (availableSpells.length === 0) {
      return null; // Use Mystic Punch
    }
    
    // Health management
    if (this.isCriticalHealth(state.enemyWizard)) {
      const healingSpells = this.getSpellsByType(availableSpells, 'healing');
      if (healingSpells.length > 0) {
        return healingSpells.sort((a, b) => 
          this.calculateSpellHealing(b) - this.calculateSpellHealing(a))[0];
      }
    }
    
    // If player is low on health, go for kill with high damage
    if (this.isLowHealth(state.playerWizard)) {
      const damageSpells = this.getSpellsByType(availableSpells, 'damage');
      if (damageSpells.length > 0) {
        return damageSpells.sort((a, b) => 
          this.calculateSpellDamage(b) - this.calculateSpellDamage(a))[0];
      }
    }
    
    // Counter player's active effects
    const playerHasBuffs = state.playerWizard.activeEffects.some(effect => 
      effect.effect.type === 'statModifier' && effect.effect.value > 0);
      
    if (playerHasBuffs && Math.random() > 0.6) {
      const debuffSpells = this.getSpellsByType(availableSpells, 'debuff');
      if (debuffSpells.length > 0) {
        return debuffSpells[Math.floor(Math.random() * debuffSpells.length)];
      }
    }
    
    // Dynamically choose based on situation
    const situation = Math.random();
    if (situation < 0.4) {
      // Damage focus (40% chance)
      const damageSpells = this.getSpellsByType(availableSpells, 'damage');
      if (damageSpells.length > 0) {
        return damageSpells[Math.floor(Math.random() * damageSpells.length)];
      }
    } else if (situation < 0.7) {
      // Buff/Debuff focus (30% chance)
      const tacticalSpells = [
        ...this.getSpellsByType(availableSpells, 'buff'),
        ...this.getSpellsByType(availableSpells, 'debuff')
      ];
      if (tacticalSpells.length > 0) {
        return tacticalSpells[Math.floor(Math.random() * tacticalSpells.length)];
      }
    } else {
      // Healing/Recovery focus (30% chance)
      const recoverySpells = this.getSpellsByType(availableSpells, 'healing');
      if (recoverySpells.length > 0) {
        return recoverySpells[Math.floor(Math.random() * recoverySpells.length)];
      }
    }
    
    // Fallback to a random spell
    return availableSpells[Math.floor(Math.random() * availableSpells.length)];
  }
  
  getName(): string {
    return 'Balanced';
  }
}

/**
 * Elemental AI Strategy - Focuses on exploiting elemental weaknesses and synergies
 */
class ElementalStrategy extends BaseAIStrategy {
  // Track previously used elements to create combos
  private lastUsedElement: ElementType | null = null;
  
  selectSpell(state: CombatState): Spell | null {
    const availableSpells = this.getAvailableSpells(state);
    
    if (availableSpells.length === 0) {
      return null; // Use Mystic Punch
    }
    
    // Emergency healing still takes precedence
    if (this.isCriticalHealth(state.enemyWizard)) {
      const healingSpells = this.getSpellsByType(availableSpells, 'healing');
      if (healingSpells.length > 0) {
        const healSpell = healingSpells.sort((a, b) => 
          this.calculateSpellHealing(b) - this.calculateSpellHealing(a))[0];
        this.lastUsedElement = healSpell.element;
        return healSpell;
      }
    }
    
    // Try to create elemental combos by using the same element consecutively
    if (this.lastUsedElement) {
      const sameElementSpells = this.getSpellsByElement(availableSpells, this.lastUsedElement);
      if (sameElementSpells.length > 0 && Math.random() > 0.4) {
        const selectedSpell = sameElementSpells[Math.floor(Math.random() * sameElementSpells.length)];
        this.lastUsedElement = selectedSpell.element;
        return selectedSpell;
      }
    }
    
    // Consider counter-elements based on player's active effects
    const playerElements = new Set<ElementType>();
    state.playerWizard.activeEffects.forEach(effect => {
      if (effect.effect.element) {
        playerElements.add(effect.effect.element);
      }
    });
    
    if (playerElements.size > 0 && Math.random() > 0.5) {
      // For a real implementation, we would have proper elemental counters
      // For now, just use a different element than what the player is using
      const counterSpells = availableSpells.filter(spell => 
        !playerElements.has(spell.element)
      );
      
      if (counterSpells.length > 0) {
        const selectedSpell = counterSpells[Math.floor(Math.random() * counterSpells.length)];
        this.lastUsedElement = selectedSpell.element;
        return selectedSpell;
      }
    }
    
    // Default to a random spell with preference for damage spells
    const damageSpells = this.getSpellsByType(availableSpells, 'damage');
    if (damageSpells.length > 0 && Math.random() > 0.3) {
      const selectedSpell = damageSpells[Math.floor(Math.random() * damageSpells.length)];
      this.lastUsedElement = selectedSpell.element;
      return selectedSpell;
    }
    
    // Truly random fallback
    const selectedSpell = availableSpells[Math.floor(Math.random() * availableSpells.length)];
    this.lastUsedElement = selectedSpell.element;
    return selectedSpell;
  }
  
  getName(): string {
    return 'Elemental';
  }
}

/**
 * Factory for creating AI strategies based on difficulty and wizard level
 */
export class AIStrategyFactory {
  /**
   * Create an appropriate AI strategy based on difficulty and enemy wizard level
   */
  static createStrategy(difficulty: 'easy' | 'normal' | 'hard', wizardLevel: number): AIStrategy {
    // For easy difficulty, always use defensive or very basic strategy
    if (difficulty === 'easy') {
      return new DefensiveStrategy();
    }
    
    // For hard difficulty, use more complex strategies
    if (difficulty === 'hard') {
      // Higher level wizards use more sophisticated strategies
      if (wizardLevel >= 8) {
        return new ElementalStrategy();
      } else if (wizardLevel >= 5) {
        return new AggressiveStrategy();
      } else {
        return new BalancedStrategy();
      }
    }
    
    // For normal difficulty, use a mix
    const strategyRoll = Math.random();
    if (wizardLevel >= 7) {
      // Higher chance of advanced strategies at higher levels
      if (strategyRoll < 0.4) {
        return new BalancedStrategy();
      } else if (strategyRoll < 0.7) {
        return new AggressiveStrategy();
      } else {
        return new ElementalStrategy();
      }
    } else if (wizardLevel >= 4) {
      // Mid-level wizards
      if (strategyRoll < 0.5) {
        return new DefensiveStrategy();
      } else if (strategyRoll < 0.9) {
        return new BalancedStrategy();
      } else {
        return new AggressiveStrategy();
      }
    } else {
      // Lower level wizards
      if (strategyRoll < 0.7) {
        return new DefensiveStrategy();
      } else {
        return new BalancedStrategy();
      }
    }
  }
}

/**
 * The main AI function that selects a spell for the enemy wizard
 */
export function getAISpellSelection(state: CombatState): Spell | null {
  const strategy = AIStrategyFactory.createStrategy(
    state.difficulty,
    state.enemyWizard.wizard.level
  );
  
  const selectedSpell = strategy.selectSpell(state);
  
  // For debugging and potential UI feedback
  console.log(`AI using ${strategy.getName()} strategy selected: ${selectedSpell?.name || 'Mystic Punch'}`);
  
  return selectedSpell;
} 