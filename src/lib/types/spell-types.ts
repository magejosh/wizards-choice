// src/lib/types/spell-types.ts
// All spell related types and interfaces

import { ElementType } from './element-types';

/**
 * Types of spells in the game
 */
export type SpellType = 'attack' | 'healing' | 'debuff' | 'buff' | 'reaction' | 'summon';

/**
 * A spell in the game
 */
export interface Spell {
  id: string;
  name: string;
  type: SpellType;
  element: ElementType;
  tier: number; // 1-10
  manaCost: number;
  description: string;
  effects: SpellEffect[];
  imagePath: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  /** Names of spell lists this spell belongs to */
  lists?: string[];
}

/**
 * Effect that a spell can have
 */
export interface SpellEffect {
  type: 'damage' | 'healing' | 'buff' | 'debuff' | 'control' | 'summon' | 'utility' | 'timeRewind' |
        'delay' | 'confusion' | 'damageBonus' | 'defense' | 'spellEcho' |
        'manaRestore' | 'statModifier' | 'statusEffect' | 'damageReduction';
  value: number;
  target: 'self' | 'enemy';
  element: ElementType;
  duration?: number;
  /** Optional name for a summoned minion */
  minionName?: string;
  /** Optional path to a 3D model for the minion or to indicate caster model */
  modelPath?: string;
  /** Health for the summoned minion */
  health?: number;
}

/**
 * An active effect applied to a wizard
 */
export interface ActiveEffect {
  id?: string;
  name: string;
  type: 'damage_over_time' | 'healing_over_time' | 'mana_drain' | 'mana_regen' |
    'stun' | 'silence' | 'damageReduction' | 'buff' | 'summon';
  value: number;
  duration: number; // In turns
  remainingDuration: number; // Remaining turns for the effect
  source?: 'player' | 'enemy';
  effect?: SpellEffect; // The original spell effect that created this active effect
  /** Model path for summoned entities if applicable */
  modelPath?: string;
  /** Number of entities summoned */
  quantity?: number;
}

/**
 * Represents a spell scroll that can be used to learn a new spell
 */
export interface SpellScroll {
  id: string;
  name: string;
  type: 'scroll';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  spell: Spell;
  description: string;
  imagePath?: string;
} 