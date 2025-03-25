// src/lib/equipment/equipmentData.ts
import { Equipment, EquipmentBonus, ElementType } from '../types';

/**
 * Generate a unique ID for equipment
 */
function generateEquipmentId(name: string): string {
  return `equipment_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now().toString(36)}`;
}

/**
 * Get all available wands
 * @returns Array of wand equipment
 */
export function getAllWands(): Equipment[] {
  return [
    createApprenticeWand(),
    createElementalFocusWand('fire'),
    createElementalFocusWand('water'),
    createElementalFocusWand('earth'),
    createElementalFocusWand('air'),
    createElementalFocusWand('arcane'),
    createManaConservationWand(),
    createSpellAmplifierWand(),
  ];
}

/**
 * Get all available robes
 * @returns Array of robe equipment
 */
export function getAllRobes(): Equipment[] {
  return [
    createApprenticeRobe(),
    createElementalWardRobe('fire'),
    createElementalWardRobe('water'),
    createElementalWardRobe('earth'),
    createElementalWardRobe('air'),
    createElementalWardRobe('arcane'),
    createVitalityRobe(),
    createRegenRobe(),
  ];
}

/**
 * Get all available amulets
 * @returns Array of amulet equipment
 */
export function getAllAmulets(): Equipment[] {
  return [
    createApprenticeAmulet(),
    createElementalAmulet('fire'),
    createElementalAmulet('water'),
    createElementalAmulet('earth'),
    createElementalAmulet('air'),
    createElementalAmulet('arcane'),
    createSpellReuseAmulet(),
    createDamageBarrierAmulet(),
  ];
}

/**
 * Get all available rings
 * @returns Array of ring equipment
 */
export function getAllRings(): Equipment[] {
  return [
    createApprenticeRing(),
    createElementalRing('fire'),
    createElementalRing('water'),
    createElementalRing('earth'),
    createElementalRing('air'),
    createElementalRing('arcane'),
    createCriticalSpellRing(),
    createManaBoostRing(),
    createSpellVampirismRing(),
  ];
}

/**
 * Get equipment by rarity
 * @param rarity The rarity to filter by
 * @returns Array of equipment with the specified rarity
 */
export function getEquipmentByRarity(rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'): Equipment[] {
  return [
    ...getAllWands(),
    ...getAllRobes(),
    ...getAllAmulets(),
    ...getAllRings(),
  ].filter(equipment => equipment.rarity === rarity);
}

/**
 * Get starter equipment for a new wizard
 * @returns Object containing starter equipment
 */
export function getStarterEquipment(): {
  wand: Equipment;
  robe: Equipment;
  amulet: Equipment;
  ring1: Equipment;
} {
  return {
    wand: createApprenticeWand(),
    robe: createApprenticeRobe(),
    amulet: createApprenticeAmulet(),
    ring1: createApprenticeRing(),
  };
}

/**
 * Get random equipment based on player level
 * @param level The player's level
 * @returns Random equipment appropriate for the level
 */
export function getRandomEquipment(level: number): Equipment {
  let possibleEquipment: Equipment[] = [];
  
  // Determine available rarities based on level
  if (level >= 20) {
    possibleEquipment = getEquipmentByRarity('legendary');
  } else if (level >= 15) {
    possibleEquipment = getEquipmentByRarity('epic');
  } else if (level >= 10) {
    possibleEquipment = getEquipmentByRarity('rare');
  } else if (level >= 5) {
    possibleEquipment = getEquipmentByRarity('uncommon');
  } else {
    possibleEquipment = getEquipmentByRarity('common');
  }
  
  // If no equipment is available for the level, fall back to common
  if (possibleEquipment.length === 0) {
    possibleEquipment = getEquipmentByRarity('common');
  }
  
  // Return a random piece of equipment
  return possibleEquipment[Math.floor(Math.random() * possibleEquipment.length)];
}

// Individual equipment creation functions

function createApprenticeWand(): Equipment {
  return {
    id: generateEquipmentId('Apprentice Wand'),
    name: 'Apprentice Wand',
    slot: 'wand',
    rarity: 'common',
    bonuses: [
      {
        type: 'manaCostReduction',
        value: 5, // 5% reduction
      },
      {
        type: 'manaRegen',
        value: 1,
      },
    ],
    description: 'A basic wand given to apprentice wizards. Provides minor mana cost reduction and regeneration.',
  };
}

function createElementalFocusWand(element: ElementType): Equipment {
  return {
    id: generateEquipmentId(`${capitalizeFirstLetter(element)} Focus Wand`),
    name: `${capitalizeFirstLetter(element)} Focus Wand`,
    slot: 'wand',
    rarity: 'uncommon',
    bonuses: [
      {
        type: 'elementalAffinity',
        value: 10, // 10% boost to element
        element,
      },
      {
        type: 'manaRegen',
        value: 1,
      },
    ],
    description: `A wand attuned to ${element} magic. Increases the power of ${element} spells and provides minor mana regeneration.`,
  };
}

function createManaConservationWand(): Equipment {
  return {
    id: generateEquipmentId('Mana Conservation Wand'),
    name: 'Mana Conservation Wand',
    slot: 'wand',
    rarity: 'rare',
    bonuses: [
      {
        type: 'manaCostReduction',
        value: 10, // 10% reduction
      },
      {
        type: 'manaRegen',
        value: 2,
      },
    ],
    description: 'A wand designed to conserve magical energy. Significantly reduces mana costs and improves regeneration.',
  };
}

function createSpellAmplifierWand(): Equipment {
  return {
    id: generateEquipmentId('Spell Amplifier Wand'),
    name: 'Spell Amplifier Wand',
    slot: 'wand',
    rarity: 'epic',
    bonuses: [
      {
        type: 'spellPower',
        value: 15, // 15% increase
      },
      {
        type: 'manaRegen',
        value: 1,
      },
    ],
    description: 'A powerful wand that amplifies the effects of all spells. Provides a significant boost to spell power.',
  };
}

function createApprenticeRobe(): Equipment {
  return {
    id: generateEquipmentId('Apprentice Robe'),
    name: 'Apprentice Robe',
    slot: 'robe',
    rarity: 'common',
    bonuses: [
      {
        type: 'health',
        value: 10,
      },
      {
        type: 'damageReduction',
        value: 2, // 2% reduction
      },
    ],
    description: 'A basic robe given to apprentice wizards. Provides minor health and damage reduction.',
  };
}

function createElementalWardRobe(element: ElementType): Equipment {
  return {
    id: generateEquipmentId(`${capitalizeFirstLetter(element)} Ward Robe`),
    name: `${capitalizeFirstLetter(element)} Ward Robe`,
    slot: 'robe',
    rarity: 'uncommon',
    bonuses: [
      {
        type: 'health',
        value: 15,
      },
      {
        type: 'damageReduction',
        value: 5, // 5% reduction
        element,
      },
    ],
    description: `A robe warded against ${element} damage. Provides increased health and resistance to ${element} attacks.`,
  };
}

function createVitalityRobe(): Equipment {
  return {
    id: generateEquipmentId('Vitality Robe'),
    name: 'Vitality Robe',
    slot: 'robe',
    rarity: 'rare',
    bonuses: [
      {
        type: 'health',
        value: 30,
      },
      {
        type: 'damageReduction',
        value: 3, // 3% reduction
      },
    ],
    description: 'A robe imbued with vitality magic. Significantly increases maximum health and provides damage reduction.',
  };
}

function createRegenRobe(): Equipment {
  return {
    id: generateEquipmentId('Regeneration Robe'),
    name: 'Regeneration Robe',
    slot: 'robe',
    rarity: 'epic',
    bonuses: [
      {
        type: 'health',
        value: 20,
      },
      {
        type: 'healthRegen',
        value: 5, // 5 health per round
      },
    ],
    description: 'A robe that continuously channels healing energy. Provides health regeneration each round.',
  };
}

function createApprenticeAmulet(): Equipment {
  return {
    id: generateEquipmentId('Apprentice Amulet'),
    name: 'Apprentice Amulet',
    slot: 'amulet',
    rarity: 'common',
    bonuses: [
      {
        type: 'manaBoost',
        value: 10,
      },
      {
        type: 'spellPower',
        value: 2, // 2% increase
      },
    ],
    description: 'A basic amulet given to apprentice wizards. Provides minor mana and spell power boosts.',
  };
}

function createElementalAmulet(element: ElementType): Equipment {
  return {
    id: generateEquipmentId(`${capitalizeFirstLetter(element)} Amulet`),
    name: `${capitalizeFirstLetter(element)} Amulet`,
    slot: 'amulet',
    rarity: 'uncommon',
    bonuses: [
      {
        type: 'elementalAffinity',
        value: 15, // 15% boost to element
        element,
      },
    ],
    description: `An amulet attuned to ${element} magic. Significantly increases the power of ${element} spells.`,
  };
}

function createSpellReuseAmulet(): Equipment {
  return {
    id: generateEquipmentId('Spell Reuse Amulet'),
    name: 'Spell Reuse Amulet',
    slot: 'amulet',
    rarity: 'rare',
    bonuses: [
      {
        type: 'spellReuse',
        value: 1, // Once per 3 rounds
      },
    ],
    description: 'A mysterious amulet that occasionally allows spells to be cast without consuming a spell card. Can activate once every 3 rounds.',
  };
}

function createDamageBarrierAmulet(): Equipment {
  return {
    id: generateEquipmentId('Damage Barrier Amulet'),
    name: 'Damage Barrier Amulet',
    slot: 'amulet',
    rarity: 'epic',
    bonuses: [
      {
        type: 'damageBarrier',
        value: 1, // Once per duel
      },
    ],
    description: 'A powerful amulet that can absorb a single damaging attack completely. Can only be used once per duel.',
  };
}

function createApprenticeRing(): Equipment {
  return {
    id: generateEquipmentId('Apprentice Ring'),
    name: 'Apprentice Ring',
    slot: 'ring1', // Can be equipped in either ring slot
    rarity: 'common',
    bonuses: [
      {
        type: 'manaBoost',
        value: 5,
      },
      {
        type: 'spellPower',
        value: 2, // 2% increase
      },
    ],
    description: 'A basic ring given to apprentice wizards. Provides minor mana and spell power boosts.',
  };
}

function createElementalRing(element: ElementType): Equipment {
  return {
    id: generateEquipmentId(`${capitalizeFirstLetter(element)} Ring`),
    name: `${capitalizeFirstLetter(element)} Ring`,
    slot: 'ring1', // Can be equipped in either ring slot
    rarity: 'uncommon',
    bonuses: [
      {
        type: 'elementalAffinity',
        value: 10, // 10% boost to element
        element,
      },
      {
        type: 'manaBoost',
        value: 5,
      },
    ],
    description: `A ring attuned to ${element} magic. Increases the power of ${element} spells and provides a small mana boost.`,
  };
}

function createCriticalSpellRing(): Equipment {
  return {
    id: generateEquipmentId('Critical Spell Ring'),
    name: 'Critical Spell Ring',
    slot: 'ring1', // Can be equipped in either ring slot
    rarity: 'rare',
    bonuses: [
      {
        type: 'criticalSpellcast',
        value: 5, // 5% chance
      },
    ],
    description: 'A ring that enhances spell focus. Provides a chance for spells to have double effect.',
  };
}

function createManaBoostRing(): Equipment {
  return {
    id: generateEquipmentId('Mana Boost Ring'),
    name: 'Mana Boost Ring',
    slot: 'ring1', // Can be equipped in either ring slot
    rarity: 'rare',
    bonuses: [
      {
        type: 'manaBoost',
        value: 15,
      },
    ],
    description: 'A ring imbued with mana crystals. Significantly increases maximum mana.',
  };
}

function createSpellVampirismRing(): Equipment {
  return {
    id: generateEquipmentId('Spell Vampirism Ring'),
    name: 'Spell Vampirism Ring',
    slot: 'ring1', // Can be equipped in either ring slot
    rarity: 'epic',
    bonuses: [
      {
        type: 'spellVampirism',
        value: 10, // 10% of damage
      },
    ],
    description: 'A dark ring that channels life force from damage dealt. Restores health equal to a percentage of damage dealt by spells.',
  };
}

// Helper functions
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
