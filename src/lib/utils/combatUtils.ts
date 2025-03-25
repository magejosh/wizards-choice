import { Spell, CombatWizard } from '../types';
import { getRandomInt } from './randomUtils';

/**
 * Calculate the damage dealt by a spell
 */
export function calculateDamage(spell: Spell, caster: CombatWizard, target: CombatWizard): number {
  // Base damage from spell
  let damage = spell.power || 0;
  
  // Add random variance (±20%)
  const variance = damage * 0.2;
  damage += getRandomInt(-Math.floor(variance), Math.floor(variance));
  
  // Apply elemental strengths and weaknesses
  if (spell.element && target.weakness === spell.element) {
    // Target is weak to this element - 50% more damage
    damage = Math.floor(damage * 1.5);
  } else if (spell.element && target.resistance === spell.element) {
    // Target resists this element - 33% less damage
    damage = Math.floor(damage * 0.67);
  }
  
  // Apply any damage bonuses from equipment or effects
  if (caster.damageBonus) {
    damage += caster.damageBonus;
  }
  
  // Apply target's defense
  if (target.defense) {
    // Reduce damage by defense, but ensure at least 1 damage
    damage = Math.max(1, damage - target.defense);
  }
  
  return Math.max(0, Math.floor(damage));
}

/**
 * Calculate the healing provided by a spell
 */
export function calculateHealing(spell: Spell, caster: CombatWizard): number {
  // Base healing from spell
  let healing = spell.power || 0;
  
  // Add random variance (±10%)
  const variance = healing * 0.1;
  healing += getRandomInt(-Math.floor(variance), Math.floor(variance));
  
  // Apply healing bonuses from equipment or effects
  if (caster.healingBonus) {
    healing += caster.healingBonus;
  }
  
  return Math.max(0, Math.floor(healing));
}

/**
 * Check if a spell can be cast
 */
export function canCastSpell(spell: Spell, caster: CombatWizard): boolean {
  // Check mana cost
  if (spell.manaCost > caster.mana) {
    return false;
  }
  
  return true;
}

/**
 * Calculate critical hit chance and damage
 */
export function calculateCritical(baseDamage: number, caster: CombatWizard): { isCritical: boolean, damage: number } {
  // Default critical chance is 10%
  const criticalChance = caster.criticalChance || 0.1;
  
  // Roll for critical
  const roll = Math.random();
  
  if (roll < criticalChance) {
    // Critical hit - 200% damage
    return {
      isCritical: true,
      damage: Math.floor(baseDamage * 2)
    };
  }
  
  return {
    isCritical: false,
    damage: baseDamage
  };
} 