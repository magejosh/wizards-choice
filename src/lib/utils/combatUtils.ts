import { Spell, CombatWizard } from '../types';
import { getRandomInt } from './randomUtils';

/**
 * Calculate the damage dealt by a spell
 */
export function calculateDamage(spell: Spell, caster: CombatWizard, target: CombatWizard): number {
  // Use spell tier as base damage (since Spell has no 'power')
  let damage = spell.tier || 0;
  
  // Add spellPower from combatStats if present
  if (caster.wizard && caster.wizard.combatStats && caster.wizard.combatStats.spellPower) {
    damage += caster.wizard.combatStats.spellPower;
  }
  
  // No elemental, defense, or bonus logic since those fields do not exist

  return Math.max(0, Math.floor(damage));
}

/**
 * Calculate the healing provided by a spell
 */
export function calculateHealing(spell: Spell, caster: CombatWizard): number {
  // Use spell tier as base healing (since Spell has no 'power')
  let healing = spell.tier || 0;
  
  return Math.max(0, Math.floor(healing));
}

/**
 * Check if a spell can be cast
 */
export function canCastSpell(spell: Spell, caster: CombatWizard): boolean {
  // Always return true for now, as mana is not tracked on CombatWizard
  return true;
} 