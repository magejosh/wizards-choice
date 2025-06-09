import { Spell, ElementType } from '../../types';
import { getSpellsByList } from '../../spells/spellData';

export interface MagicalCreature {
  name: string;
  type: 'dragon' | 'horror' | 'guardian' | 'elemental' | 'leviathan';
  /** Optional path to a 3D model for this creature */
  modelPath?: string;
  description: string;
  baseStats: {
    health: number;
    mana: number;
    physicalResistance: number;
    magicalResistance: number;
    speed: number;
  };
  elements: ElementType[];
  weaknesses: ElementType[];
  resistances: ElementType[];
  specialAbility: {
    name: string;
    description: string;
    trigger: 'lowHealth' | 'turnStart' | 'turnEnd' | 'damageTaken' | 'spellCast';
    effect: {
      type: 'damage' | 'healing' | 'buff' | 'debuff' | 'summon' | 'transform';
      value: number;
      duration?: number;
      target: 'self' | 'enemy' | 'all';
      element?: ElementType;
    };
  };
  getThematicSpells: () => Promise<Spell[]>;
  lootTable: {
    common: string[];
    uncommon: string[];
    rare: string[];
    epic: string[];
    legendary: string[];
  };
}

export const magicalCreatures: Record<string, MagicalCreature> = {
  ancientDragon: {
    name: 'Ancient Dragon',
    type: 'dragon',
    modelPath: '/assets/PyreSorcerer.vrm',
    description: 'A massive dragon that has lived for centuries, wielding the power of fire and commanding the skies.',
    baseStats: {
      health: 150,
      mana: 120,
      physicalResistance: 40,
      magicalResistance: 30,
      speed: 35,
    },
    elements: ['fire', 'air'],
    weaknesses: ['water'],
    resistances: ['fire', 'earth'],
    specialAbility: {
      name: "Dragon's Rage",
      description: 'As the dragon\'s health decreases, its attacks become more powerful and devastating.',
      trigger: 'lowHealth',
      effect: {
        type: 'buff',
        value: 50,
        duration: 3,
        target: 'self',
        element: 'fire',
      },
    },
    getThematicSpells: async () => getSpellsByList('ancientDragon'),
    lootTable: {
      common: ['Dragon Scale', 'Dragon Claw', 'Dragon Fang'],
      uncommon: ['Dragon Wing', 'Dragon Tail', 'Dragon Heart'],
      rare: ['Dragon Eye', 'Dragon Horn', 'Ancient Dragon Scale'],
      epic: ['Dragon Soul', 'Dragon Essence', 'Dragon Blood'],
      legendary: ['Dragon Core', 'Ancient Dragon Heart', 'Dragon Soul Stone'],
    },
  },
  eldritchHorror: {
    name: 'Eldritch Horror',
    type: 'horror',
    modelPath: '/assets/HorrorNurse.vrm',
    description: 'An incomprehensible being from beyond the void, warping reality with its mere presence.',
    baseStats: {
      health: 140,
      mana: 130,
      physicalResistance: 20,
      magicalResistance: 50,
      speed: 25,
    },
    elements: ['arcane', 'shadow'],
    weaknesses: ['light'],
    resistances: ['arcane', 'shadow'],
    specialAbility: {
      name: 'Reality Distortion',
      description: 'The horror can negate incoming spell effects by warping reality around itself.',
      trigger: 'spellCast',
      effect: {
        type: 'debuff',
        value: 100,
        duration: 1,
        target: 'enemy',
        element: 'arcane',
      },
    },
    getThematicSpells: async () => getSpellsByList('eldritchHorror'),
    lootTable: {
      common: ['Void Shard', 'Eldritch Fragment', 'Dark Essence'],
      uncommon: ['Void Crystal', 'Eldritch Eye', 'Dark Matter'],
      rare: ['Void Core', 'Eldritch Heart', 'Dark Soul'],
      epic: ['Void Stone', 'Eldritch Essence', 'Dark Power'],
      legendary: ['Void Heart', 'Eldritch Core', 'Dark Void Stone'],
    },
  },
  natureGuardian: {
    name: 'Nature Guardian',
    type: 'guardian',
    modelPath: '/assets/Witch.vrm',
    description: 'A massive being of living wood and stone, protecting the natural world with its immense power.',
    baseStats: {
      health: 170,
      mana: 110,
      physicalResistance: 45,
      magicalResistance: 25,
      speed: 20,
    },
    elements: ['earth', 'water'],
    weaknesses: ['fire'],
    resistances: ['earth', 'water'],
    specialAbility: {
      name: 'Regeneration',
      description: 'The guardian heals itself over time, drawing power from the earth.',
      trigger: 'turnEnd',
      effect: {
        type: 'healing',
        value: 20,
        target: 'self',
        element: 'earth',
      },
    },
    getThematicSpells: async () => getSpellsByList('natureGuardian'),
    lootTable: {
      common: ['Wood Shard', 'Stone Fragment', 'Leaf Essence'],
      uncommon: ['Ancient Wood', 'Living Stone', 'Forest Essence'],
      rare: ['Guardian Wood', 'Nature Stone', 'Forest Heart'],
      epic: ['Ancient Guardian Wood', 'Living Guardian Stone', 'Forest Core'],
      legendary: ['Guardian Heart', 'Nature Core', 'Forest Soul'],
    },
  },
  stormElemental: {
    name: 'Storm Elemental',
    type: 'elemental',
    modelPath: '/assets/Scarecrow.vrm',
    description: 'A being of pure lightning and wind, moving with incredible speed and striking with thunderous force.',
    baseStats: {
      health: 130,
      mana: 120,
      physicalResistance: 15,
      magicalResistance: 40,
      speed: 45,
    },
    elements: ['air', 'fire'],
    weaknesses: ['earth'],
    resistances: ['air', 'fire'],
    specialAbility: {
      name: 'Chain Lightning',
      description: 'The elemental\'s attacks can chain between multiple targets.',
      trigger: 'damageTaken',
      effect: {
        type: 'damage',
        value: 30,
        target: 'all',
        element: 'air',
      },
    },
    getThematicSpells: async () => getSpellsByList('stormElemental'),
    lootTable: {
      common: ['Storm Shard', 'Wind Essence', 'Lightning Fragment'],
      uncommon: ['Storm Crystal', 'Wind Core', 'Lightning Essence'],
      rare: ['Storm Heart', 'Wind Soul', 'Lightning Core'],
      epic: ['Storm Core', 'Wind Heart', 'Lightning Soul'],
      legendary: ['Storm Soul', 'Wind Spirit', 'Lightning Heart'],
    },
  },
  abyssalLeviathan: {
    name: 'Abyssal Leviathan',
    type: 'leviathan',
    modelPath: '/assets/Devil.vrm',
    description: 'A massive creature from the depths of the ocean, wielding the power of water and darkness.',
    baseStats: {
      health: 160,
      mana: 130,
      physicalResistance: 35,
      magicalResistance: 35,
      speed: 30,
    },
    elements: ['water', 'shadow'],
    weaknesses: ['light'],
    resistances: ['water', 'shadow'],
    specialAbility: {
      name: 'Tidal Surge',
      description: 'The leviathan can flood the battlefield, making it harder for enemies to move and attack.',
      trigger: 'turnStart',
      effect: {
        type: 'debuff',
        value: 40,
        duration: 2,
        target: 'enemy',
        element: 'water',
      },
    },
    getThematicSpells: async () => getSpellsByList('abyssalLeviathan'),
    lootTable: {
      common: ['Abyssal Shard', 'Ocean Essence', 'Dark Water'],
      uncommon: ['Abyssal Crystal', 'Ocean Core', 'Dark Tide'],
      rare: ['Abyssal Heart', 'Ocean Soul', 'Dark Depths'],
      epic: ['Abyssal Core', 'Ocean Heart', 'Dark Abyss'],
      legendary: ['Abyssal Soul', 'Ocean Spirit', 'Dark Leviathan Heart'],
    },
  },
};
