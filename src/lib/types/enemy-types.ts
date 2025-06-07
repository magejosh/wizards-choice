// src/lib/types/enemy-types.ts
// Enemy character types and interfaces

import { ElementType } from './element-types';
import { Equipment } from './equipment-types';
import { Spell } from './spell-types';

/**
 * Enemy character
 */
export interface Enemy {
  id: string;
  name: string;
  health: number;
  mana: number;
  maxHealth: number;
  maxMana: number;
  baseMaxHealth?: number;
  progressionMaxHealth?: number;
  equipmentMaxHealth?: number;
  totalMaxHealth?: number;
  baseMaxMana?: number;
  progressionMaxMana?: number;
  equipmentMaxMana?: number;
  totalMaxMana?: number;
  level: number;
  spells: Spell[];
  goldReward?: number;
  expReward?: number;
  weakness?: ElementType;
  resistance?: ElementType;
  imagePath?: string;
  /** Optional path to a 3D model for this enemy */
  modelPath?: string;
  equipment?: Record<string, Equipment | undefined>;
  archetype?: string;
}

/**
 * Enemy archetype with base stats and equipment
 */
export interface EnemyArchetype {
  name: string;
  description: string;
  baseStats: {
    health: number;
    mana: number;
    manaRegen: number;
  };
  specialSpells: Spell[];
  thematicSpells: Spell[];
  specialEquipment: Record<string, Equipment>;
  weaknesses: ElementType[];
  resistances: ElementType[];
  imagePath: string;
}

/**
 * Encounter with an enemy
 */
export interface Encounter {
  id: string;
  name: string;
  description: string;
  enemyId: string;
  requiredLevel?: number;
  rewardsGold?: number;
  rewardsExp?: number;
  rewardsItem?: string;
  isAvailable: boolean;
} 