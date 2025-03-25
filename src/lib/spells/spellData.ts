// src/lib/spells/spellData.ts
import { Spell, SpellEffect, ElementType, SpellType } from '../types';

/**
 * Generate a unique ID for a spell
 */
function generateSpellId(name: string): string {
  return `spell_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now().toString(36)}`;
}

/**
 * Get the default spells that a player starts with
 * @returns Array of default spells
 */
export function getDefaultSpells(): Spell[] {
  // 3 default spells + 2 random Tier 1 spells
  const defaultSpells = [
    createFireboltSpell(),
    createArcaneShieldSpell(),
    createMinorHealingSpell(),
  ];
  
  // Add 2 random Tier 1 spells
  const randomSpells = getTier1Spells()
    .filter(spell => !defaultSpells.some(s => s.name === spell.name))
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);
  
  return [...defaultSpells, ...randomSpells];
}

/**
 * Get all Tier 1 spells (Cantrips)
 * @returns Array of Tier 1 spells
 */
export function getTier1Spells(): Spell[] {
  return [
    createFireboltSpell(),
    createArcaneShieldSpell(),
    createMinorHealingSpell(),
    createFrostRaySpell(),
    createArcaneBlastSpell(),
    createNaturesTouchSpell(),
    createShadowStrikeSpell(),
    createLightningJoltSpell(),
    createEarthTremorSpell(),
    createMysticInsightSpell(),
  ];
}

/**
 * Get all spells in the game
 * @returns Array of all spells
 */
export function getAllSpells(): Spell[] {
  // This would contain all 120 spells across 10 tiers
  // For now, we'll just return Tier 1 spells as a placeholder
  return [
    ...getTier1Spells(),
    // Additional tiers would be added here
  ];
}

/**
 * Get spells by tier
 * @param tier The tier to get spells for (1-10)
 * @returns Array of spells for the specified tier
 */
export function getSpellsByTier(tier: number): Spell[] {
  if (tier === 1) {
    return getTier1Spells();
  }
  
  // Additional tiers would be implemented here
  return [];
}

/**
 * Get spells by element
 * @param element The element to get spells for
 * @returns Array of spells for the specified element
 */
export function getSpellsByElement(element: ElementType): Spell[] {
  return getAllSpells().filter(spell => spell.element === element);
}

/**
 * Get spells by type
 * @param type The type to get spells for
 * @returns Array of spells for the specified type
 */
export function getSpellsByType(type: SpellType): Spell[] {
  return getAllSpells().filter(spell => spell.type === type);
}

// Individual spell creation functions

function createFireboltSpell(): Spell {
  return {
    id: generateSpellId('Firebolt'),
    name: 'Firebolt',
    type: 'damage',
    element: 'fire',
    tier: 1,
    manaCost: 25,
    description: 'Launches a bolt of fire at your enemy, dealing direct damage.',
    effects: [
      {
        type: 'damage',
        value: 20,
        target: 'enemy',
        element: 'fire',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createArcaneShieldSpell(): Spell {
  return {
    id: generateSpellId('Arcane Shield'),
    name: 'Arcane Shield',
    type: 'buff',
    element: 'arcane',
    tier: 1,
    manaCost: 30,
    description: 'Creates a magical shield that reduces incoming damage for 3 turns.',
    effects: [
      {
        type: 'statModifier',
        value: -5, // Reduces damage by 5
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createMinorHealingSpell(): Spell {
  return {
    id: generateSpellId('Minor Healing'),
    name: 'Minor Healing',
    type: 'healing',
    element: 'nature',
    tier: 1,
    manaCost: 35,
    description: 'Channels natural energy to heal minor wounds.',
    effects: [
      {
        type: 'healing',
        value: 15,
        target: 'self',
        element: 'nature',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createFrostRaySpell(): Spell {
  return {
    id: generateSpellId('Frost Ray'),
    name: 'Frost Ray',
    type: 'damage',
    element: 'water',
    tier: 1,
    manaCost: 25,
    description: 'Fires a ray of freezing energy that damages and slows the enemy.',
    effects: [
      {
        type: 'damage',
        value: 15,
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'statModifier',
        value: -2, // Reduces enemy action speed
        duration: 2,
        target: 'enemy',
        element: 'water',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createArcaneBlastSpell(): Spell {
  return {
    id: generateSpellId('Arcane Blast'),
    name: 'Arcane Blast',
    type: 'damage',
    element: 'arcane',
    tier: 1,
    manaCost: 30,
    description: 'Releases a burst of pure arcane energy.',
    effects: [
      {
        type: 'damage',
        value: 25,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createNaturesTouchSpell(): Spell {
  return {
    id: generateSpellId('Nature\'s Touch'),
    name: 'Nature\'s Touch',
    type: 'healing',
    element: 'nature',
    tier: 1,
    manaCost: 30,
    description: 'Harnesses natural energy to heal over time.',
    effects: [
      {
        type: 'healing',
        value: 8,
        duration: 3,
        target: 'self',
        element: 'nature',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createShadowStrikeSpell(): Spell {
  return {
    id: generateSpellId('Shadow Strike'),
    name: 'Shadow Strike',
    type: 'damage',
    element: 'shadow',
    tier: 1,
    manaCost: 25,
    description: 'Strikes from the shadows, dealing damage and reducing enemy visibility.',
    effects: [
      {
        type: 'damage',
        value: 18,
        target: 'enemy',
        element: 'shadow',
      },
      {
        type: 'statModifier',
        value: -3, // Reduces accuracy
        duration: 2,
        target: 'enemy',
        element: 'shadow',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createLightningJoltSpell(): Spell {
  return {
    id: generateSpellId('Lightning Jolt'),
    name: 'Lightning Jolt',
    type: 'damage',
    element: 'air',
    tier: 1,
    manaCost: 25,
    description: 'Sends a quick jolt of lightning at your enemy.',
    effects: [
      {
        type: 'damage',
        value: 22,
        target: 'enemy',
        element: 'air',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createEarthTremorSpell(): Spell {
  return {
    id: generateSpellId('Earth Tremor'),
    name: 'Earth Tremor',
    type: 'damage',
    element: 'earth',
    tier: 1,
    manaCost: 30,
    description: 'Creates a small tremor that damages and unbalances your enemy.',
    effects: [
      {
        type: 'damage',
        value: 15,
        target: 'enemy',
        element: 'earth',
      },
      {
        type: 'statModifier',
        value: -2, // Reduces stability
        duration: 2,
        target: 'enemy',
        element: 'earth',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createMysticInsightSpell(): Spell {
  return {
    id: generateSpellId('Mystic Insight'),
    name: 'Mystic Insight',
    type: 'buff',
    element: 'arcane',
    tier: 1,
    manaCost: 20,
    description: 'Enhances your magical perception, increasing mana regeneration temporarily.',
    effects: [
      {
        type: 'manaRestore',
        value: 5,
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}
