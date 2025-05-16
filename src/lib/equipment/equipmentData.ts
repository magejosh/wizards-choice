// src/lib/equipment/equipmentData.ts
import { Equipment } from '../types';
import { ElementType } from '../types/element-types';

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
 * @deprecated Use generateProceduralEquipment or generateLootEquipment from procedural/equipmentGenerator.ts instead.
 * This function should not be used for new equipment generation.
 */
export function getRandomEquipment(level: number): Equipment {
  throw new Error('getRandomEquipment is deprecated. Use generateProceduralEquipment or generateLootEquipment instead.');
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
    slot: 'hand',
    rarity: 'common',
    bonuses: [
      { stat: 'manaCostReduction', value: 5 },
      { stat: 'manaRegen', value: 1 }
    ],
    description: 'A basic wand given to apprentice wizards. Provides minor mana cost reduction and regeneration.',
    unlocked: false,
    equipped: false,
    requiredLevel: 1
  };
}

function createElementalFocusWand(element: string): Equipment {
  return {
    id: generateEquipmentId(`${capitalizeFirstLetter(element)} Focus Wand`),
    name: `${capitalizeFirstLetter(element)} Focus Wand`,
    slot: 'hand',
    rarity: 'uncommon',
    bonuses: [
      { stat: 'elementalAffinity', value: 10, element: element as ElementType },
      { stat: 'manaRegen', value: 1 }
    ],
    description: `A wand attuned to ${element} magic. Increases the power of ${element} spells and provides minor mana regeneration.`,
    unlocked: false,
    equipped: false,
    requiredLevel: 1
  };
}

function createManaConservationWand(): Equipment {
  return {
    id: generateEquipmentId('Mana Conservation Wand'),
    name: 'Mana Conservation Wand',
    slot: 'hand',
    rarity: 'rare',
    bonuses: [
      { stat: 'manaCostReduction', value: 10 },
      { stat: 'manaRegen', value: 2 }
    ],
    description: 'A wand designed to conserve magical energy. Significantly reduces mana costs and improves regeneration.',
    unlocked: false,
    equipped: false,
    requiredLevel: 1
  };
}

function createSpellAmplifierWand(): Equipment {
  return {
    id: generateEquipmentId('Spell Amplifier Wand'),
    name: 'Spell Amplifier Wand',
    slot: 'hand',
    rarity: 'epic',
    bonuses: [
      { stat: 'spellPower', value: 15 },
      { stat: 'manaRegen', value: 1 }
    ],
    description: 'A powerful wand that amplifies the effects of all spells. Provides a significant boost to spell power.',
    unlocked: false,
    equipped: false,
    requiredLevel: 1
  };
}

function createApprenticeRobe(): Equipment {
  return {
    id: generateEquipmentId('Apprentice Robe'),
    name: 'Apprentice Robe',
    slot: 'body',
    rarity: 'common',
    bonuses: [
      { stat: 'maxHealth', value: 10 },
      { stat: 'defense', value: 2 }
    ],
    description: 'A basic robe given to apprentice wizards. Provides minor health and damage reduction.',
    unlocked: false,
    equipped: false,
    requiredLevel: 1
  };
}

function createElementalWardRobe(element: string): Equipment {
  return {
    id: generateEquipmentId(`${capitalizeFirstLetter(element)} Ward Robe`),
    name: `${capitalizeFirstLetter(element)} Ward Robe`,
    slot: 'body',
    rarity: 'uncommon',
    bonuses: [
      {
        stat: 'health',
        value: 15,
      },
      {
        stat: 'defense',
        value: 5, // 5% reduction
        element: element as ElementType,
      },
    ],
    description: `A robe warded against ${element} damage. Provides increased health and resistance to ${element} attacks.`,
    unlocked: false,
    equipped: false,
  };
}

function createVitalityRobe(): Equipment {
  return {
    id: generateEquipmentId('Vitality Robe'),
    name: 'Vitality Robe',
    slot: 'body',
    rarity: 'rare',
    bonuses: [
      {
        stat: 'health',
        value: 30,
      },
      {
        stat: 'defense',
        value: 3, // 3% reduction
      },
    ],
    description: 'A robe imbued with vitality magic. Significantly increases maximum health and provides damage reduction.',
    unlocked: false,
    equipped: false,
  };
}

function createRegenRobe(): Equipment {
  return {
    id: generateEquipmentId('Regeneration Robe'),
    name: 'Regeneration Robe',
    slot: 'body',
    rarity: 'epic',
    bonuses: [
      {
        stat: 'health',
        value: 20,
      },
      {
        stat: 'manaRegen',
        value: 5, // 5 health per round
      },
    ],
    description: 'A robe that continuously channels healing energy. Provides health regeneration each round.',
    unlocked: false,
    equipped: false,
  };
}

function createApprenticeAmulet(): Equipment {
  return {
    id: generateEquipmentId('Apprentice Amulet'),
    name: 'Apprentice Amulet',
    slot: 'neck',
    rarity: 'common',
    bonuses: [
      {
        stat: 'maxMana',
        value: 10,
      },
      {
        stat: 'spellPower',
        value: 2, // 2% increase
      },
    ],
    description: 'A basic amulet given to apprentice wizards. Provides minor mana and spell power boosts.',
    unlocked: false,
    equipped: false,
  };
}

function createElementalAmulet(element: string): Equipment {
  return {
    id: generateEquipmentId(`${capitalizeFirstLetter(element)} Amulet`),
    name: `${capitalizeFirstLetter(element)} Amulet`,
    slot: 'neck',
    rarity: 'uncommon',
    bonuses: [
      {
        stat: 'elementalAffinity',
        value: 15, // 15% boost to element
        element: element as ElementType,
      },
    ],
    description: `An amulet attuned to ${element} magic. Significantly increases the power of ${element} spells.`,
    unlocked: false,
    equipped: false,
  };
}

function createSpellReuseAmulet(): Equipment {
  return {
    id: generateEquipmentId('Spell Reuse Amulet'),
    name: 'Spell Reuse Amulet',
    slot: 'neck',
    rarity: 'rare',
    // TODO: Retain spellReuse bonus for effects overhaul
    bonuses: [
      {
        stat: 'spellReuse',
        value: 1, // Once per 3 rounds
      },
    ],
    description: 'A mysterious amulet that occasionally allows spells to be cast without consuming a spell card. Can activate once every 3 rounds.',
    unlocked: false,
    equipped: false,
  };
}

function createDamageBarrierAmulet(): Equipment {
  return {
    id: generateEquipmentId('Damage Barrier Amulet'),
    name: 'Damage Barrier Amulet',
    slot: 'neck',
    rarity: 'epic',
    // TODO: Retain damageBarrier bonus for effects overhaul
    bonuses: [
      {
        stat: 'damageBarrier',
        value: 1, // Once per duel
      },
    ],
    description: 'A powerful amulet that can absorb a single damaging attack completely. Can only be used once per duel.',
    unlocked: false,
    equipped: false,
  };
}

function createApprenticeRing(): Equipment {
  return {
    id: generateEquipmentId('Apprentice Ring'),
    name: 'Apprentice Ring',
    slot: 'finger',
    rarity: 'common',
    bonuses: [
      {
        stat: 'maxMana',
        value: 5,
      },
      {
        stat: 'spellPower',
        value: 2, // 2% increase
      },
    ],
    description: 'A basic ring given to apprentice wizards. Provides minor mana and spell power boosts.',
    unlocked: false,
    equipped: false,
  };
}

function createElementalRing(element: string): Equipment {
  return {
    id: generateEquipmentId(`${capitalizeFirstLetter(element)} Ring`),
    name: `${capitalizeFirstLetter(element)} Ring`,
    slot: 'finger',
    rarity: 'uncommon',
    bonuses: [
      {
        stat: 'elementalAffinity',
        value: 10, // 10% boost to element
        element: element as ElementType,
      },
      {
        stat: 'maxMana',
        value: 5,
      },
    ],
    description: `A ring attuned to ${element} magic. Increases the power of ${element} spells and provides a small mana boost.`,
    unlocked: false,
    equipped: false,
  };
}

function createCriticalSpellRing(): Equipment {
  return {
    id: generateEquipmentId('Critical Spell Ring'),
    name: 'Critical Spell Ring',
    slot: 'finger',
    rarity: 'rare',
    // TODO: Retain criticalSpellcast bonus for effects overhaul
    bonuses: [
      {
        stat: 'criticalSpellcast',
        value: 5, // 5% chance
      },
    ],
    description: 'A ring that enhances spell focus. Provides a chance for spells to have double effect.',
    unlocked: false,
    equipped: false,
  };
}

function createManaBoostRing(): Equipment {
  return {
    id: generateEquipmentId('Mana Boost Ring'),
    name: 'Mana Boost Ring',
    slot: 'finger',
    rarity: 'rare',
    bonuses: [
      {
        stat: 'maxMana',
        value: 15,
      },
    ],
    description: 'A ring imbued with mana crystals. Significantly increases maximum mana.',
    unlocked: false,
    equipped: false,
  };
}

function createSpellVampirismRing(): Equipment {
  return {
    id: generateEquipmentId('Spell Vampirism Ring'),
    name: 'Spell Vampirism Ring',
    slot: 'finger',
    rarity: 'epic',
    // TODO: Retain spellVampirism bonus for effects overhaul
    bonuses: [
      {
        stat: 'spellVampirism',
        value: 10, // 10% of damage
      },
    ],
    description: 'A dark ring that channels life force from damage dealt. Restores health equal to a percentage of damage dealt by spells.',
    unlocked: false,
    equipped: false,
  };
}

// Helper functions
function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
