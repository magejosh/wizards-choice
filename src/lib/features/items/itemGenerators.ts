import { Ingredient, Potion, Equipment, SpellScroll, Spell, ElementType, PotionType, HandEquipment, IngredientCategory, IngredientRarity, StatBonus, SpellType, SpellEffect } from '../../types';

// Constants
const INGREDIENT_NAMES = [
  'Dragon Scale', 'Phoenix Feather', 'Unicorn Hair', 'Mandrake Root', 'Basilisk Fang',
  'Moonstone', 'Stardust', 'Mermaid Tears', 'Fairy Dust', 'Troll Blood',
  'Ghost Essence', 'Vampire Fangs', 'Werewolf Fur', 'Griffin Claw', 'Chimera Scale'
];

const POTION_NAMES = [
  'Healing Elixir', 'Mana Potion', 'Strength Brew', 'Invisibility Draught', 'Flying Potion',
  'Luck Potion', 'Truth Serum', 'Love Potion', 'Wisdom Brew', 'Courage Draught',
  'Growth Elixir', 'Shrinking Solution', 'Memory Potion', 'Dream Essence', 'Time Sand'
];

const EQUIPMENT_TYPES: HandEquipment[] = ['wand', 'staff', 'dagger', 'sword', 'spellbook', 'scroll'];

const SPELL_NAMES = [
  'Fireball', 'Ice Shard', 'Lightning Bolt', 'Earth Shield', 'Wind Slash',
  'Healing Light', 'Dark Nova', 'Time Stop', 'Mind Control', 'Teleport',
  'Summon Familiar', 'Polymorph', 'Invisibility', 'Flight', 'Resurrection'
];

const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const;
const ELEMENTS: ElementType[] = ['fire', 'water', 'earth', 'air', 'arcane', 'nature', 'shadow', 'light'];
const INGREDIENT_CATEGORIES: IngredientCategory[] = ['herb', 'crystal', 'essence', 'fungus', 'catalyst', 'core'];
const POTION_TYPES: PotionType[] = ['health', 'mana', 'strength', 'protection', 'elemental', 'luck'];
const SPELL_TYPES: SpellType[] = ['attack', 'healing', 'debuff', 'buff', 'reaction'];

// Helper functions
const randomFromArray = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const calculateRarity = (level: number): IngredientRarity => {
  const roll = Math.random() * 100;
  const levelBonus = Math.min(level * 0.5, 25); // Max 25% bonus from level
  const adjustedRoll = roll + levelBonus;

  if (adjustedRoll >= 98) return 'legendary';
  if (adjustedRoll >= 90) return 'epic';
  if (adjustedRoll >= 75) return 'rare';
  if (adjustedRoll >= 50) return 'uncommon';
  return 'common';
};

const calculatePotency = (level: number, rarity: IngredientRarity): number => {
  const rarityMultiplier = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5
  }[rarity];

  const baseValue = 10 + level * 5;
  const variation = 0.8 + Math.random() * 0.4; // ±20% variation
  return Math.round(baseValue * rarityMultiplier * variation);
};

const calculateValue = (level: number, rarity: IngredientRarity): number => {
  const rarityMultiplier = {
    common: 1,
    uncommon: 2.5,
    rare: 6,
    epic: 15,
    legendary: 40
  }[rarity];

  const baseValue = 50 + level * 25;
  const variation = 0.9 + Math.random() * 0.2; // ±10% variation
  return Math.round(baseValue * rarityMultiplier * variation);
};

const calculateDuration = (level: number, rarity: IngredientRarity): number => {
  const rarityMultiplier = {
    common: 1,
    uncommon: 1.3,
    rare: 1.8,
    epic: 2.5,
    legendary: 4
  }[rarity];

  const baseValue = 30 + level * 10; // Base duration in seconds
  const variation = 0.9 + Math.random() * 0.2;
  return Math.round(baseValue * rarityMultiplier * variation);
};

// Item generation functions
export const generateRandomIngredient = (level: number): Ingredient => {
  const rarity = calculateRarity(level);
  const name = randomFromArray(INGREDIENT_NAMES);
  const category = randomFromArray(INGREDIENT_CATEGORIES);
  
  return {
    id: `ingredient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    category,
    rarity,
    description: `A ${rarity} ${category} used in potion crafting`,
    properties: [`Level ${level}`, `${category} type`]
  };
};

export const generateRandomPotion = (level: number): Potion => {
  const rarity = calculateRarity(level);
  const name = randomFromArray(POTION_NAMES);
  const type = randomFromArray(POTION_TYPES);
  const potency = calculatePotency(level, rarity);
  const duration = calculateDuration(level, rarity);

  return {
    id: `potion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    type,
    rarity,
    effect: {
      value: potency,
      duration: type === 'protection' || type === 'strength' ? duration : undefined
    },
    description: `A ${rarity} ${name.toLowerCase()} of level ${level}`
  };
};

export const generateRandomEquipment = (level: number): Equipment => {
  const rarity = calculateRarity(level);
  const type = randomFromArray(EQUIPMENT_TYPES);
  const element = randomFromArray(ELEMENTS);

  const bonuses: StatBonus[] = [
    { stat: 'health', value: Math.round(level * (Math.random() * 5 + 5)) },
    { stat: 'mana', value: Math.round(level * (Math.random() * 4 + 3)) },
    { stat: 'damage', value: Math.round(level * (Math.random() * 3 + 2)) },
    { stat: 'defense', value: Math.round(level * (Math.random() * 3 + 2)) },
    { stat: 'spellPower', value: Math.round(level * (Math.random() * 3 + 2)) },
    { stat: 'elementalAffinity', value: Math.round(level * (Math.random() * 2 + 1)), element }
  ];

  return {
    id: `equipment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${type} of ${element}`,
    slot: 'hand',
    type,
    rarity,
    bonuses,
    description: `A ${rarity} ${type} imbued with ${element} energy`,
    unlocked: true,
    equipped: false,
    requiredLevel: level
  };
};

export const generateRandomScroll = (level: number): SpellScroll => {
  const rarity = calculateRarity(level);
  const name = randomFromArray(SPELL_NAMES);
  const element = randomFromArray(ELEMENTS);
  const spellType = randomFromArray(SPELL_TYPES);

  const effects: SpellEffect[] = [
    {
      type: spellType === 'healing' ? 'healing' : 'damage',
      value: calculatePotency(level, rarity),
      target: spellType === 'healing' ? 'self' : 'enemy',
      element,
      duration: spellType === 'buff' || spellType === 'debuff' ? calculateDuration(level, rarity) : undefined
    }
  ];

  if (spellType === 'buff') {
    effects.push({
      type: 'damageBonus',
      value: Math.round(calculatePotency(level, rarity) * 0.5),
      target: 'self',
      element,
      duration: calculateDuration(level, rarity)
    });
  } else if (spellType === 'debuff') {
    effects.push({
      type: 'defense',
      value: -Math.round(calculatePotency(level, rarity) * 0.3),
      target: 'enemy',
      element,
      duration: calculateDuration(level, rarity)
    });
  }

  const spell: Spell = {
    id: `spell-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    type: spellType,
    element,
    tier: Math.ceil(level / 10),
    manaCost: Math.round(10 + level * 2),
    description: `A ${rarity} spell of ${element} power`,
    effects,
    imagePath: ''
  };

  return {
    id: `scroll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: `Scroll of ${name}`,
    type: 'scroll',
    rarity,
    spell,
    description: `A ${rarity} scroll containing the ${name} spell`
  };
}; 