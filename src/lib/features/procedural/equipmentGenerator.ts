import { Equipment, EquipmentBonuses, EquipmentSlot, ElementType } from '../../types';

/**
 * Equipment prefix/suffix type for naming
 */
type AffixType = 'prefix' | 'suffix';

/**
 * Equipment affix structure
 */
interface EquipmentAffix {
  type: AffixType;
  name: string;
  bonuses: Partial<EquipmentBonuses>;
  minLevel: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  // Description template with {item} placeholder for the base equipment name
  descriptionTemplate: string;
}

/**
 * Base equipment structure
 */
interface BaseEquipment {
  name: string;
  slot: EquipmentSlot;
  description: string;
  bonuses: Partial<EquipmentBonuses>;
  minLevel: number;
}

/**
 * Generate a unique ID for equipment
 */
function generateEquipmentId(name: string): string {
  return `equipment_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now().toString(36)}`;
}

/**
 * Generate procedural equipment with random affixes
 * @param playerLevel The current player level
 * @param specificSlot Optional - generate for a specific slot
 * @returns Generated equipment
 */
export function generateProceduralEquipment(
  playerLevel: number,
  specificSlot?: EquipmentSlot
): Equipment {
  // 1. Choose the slot (if not specified)
  const slot = specificSlot || chooseRandomSlot(playerLevel);
  
  // 2. Choose the rarity based on player level and random chance
  const rarity = determineRarity(playerLevel);
  
  // 3. Select a base equipment for the slot
  const baseEquipment = selectBaseEquipment(slot, playerLevel);
  
  // 4. Determine the number of affixes based on rarity
  const affixCount = determineAffixCount(rarity);
  
  // 5. Choose and apply affixes
  const appliedAffixes = selectAffixes(slot, rarity, playerLevel, affixCount);
  
  // 6. Generate name, combine bonuses, and create description
  let finalName = baseEquipment.name;
  let finalBonuses: Partial<EquipmentBonuses> = { ...baseEquipment.bonuses };
  let finalDescription = baseEquipment.description;
  
  // Apply prefixes (prepend to name)
  const prefixes = appliedAffixes.filter(affix => affix.type === 'prefix');
  for (const prefix of prefixes) {
    finalName = `${prefix.name} ${finalName}`;
    finalBonuses = { ...finalBonuses, ...prefix.bonuses };
    finalDescription = `${finalDescription} ${prefix.descriptionTemplate.replace('{item}', baseEquipment.name)}`;
  }
  
  // Apply suffixes (append to name)
  const suffixes = appliedAffixes.filter(affix => affix.type === 'suffix');
  for (const suffix of suffixes) {
    finalName = `${finalName} of ${suffix.name}`;
    finalBonuses = { ...finalBonuses, ...suffix.bonuses };
    finalDescription = `${finalDescription} ${suffix.descriptionTemplate.replace('{item}', baseEquipment.name)}`;
  }
  
  // 7. Create the final equipment object
  return {
    id: generateEquipmentId(finalName),
    name: finalName,
    slot: slot,
    rarity: rarity,
    bonuses: finalBonuses,
    description: finalDescription,
  };
}

/**
 * Choose a random equipment slot
 * @param playerLevel Player level (to determine if higher slots are available)
 * @returns Random equipment slot
 */
function chooseRandomSlot(playerLevel: number): EquipmentSlot {
  // Create a weighted array of available slots based on player level
  const availableSlots: EquipmentSlot[] = ['hand', 'body']; // Always available
  
  // Add head for early levels
  if (playerLevel >= 1) {
    availableSlots.push('head');
  }
  
  // Add more advanced slots at higher levels
  if (playerLevel >= 3) {
    availableSlots.push('neck');
  }
  
  if (playerLevel >= 5) {
    availableSlots.push('finger', 'belt');
  }
  
  // Choose a random slot from available slots
  return availableSlots[Math.floor(Math.random() * availableSlots.length)];
}

/**
 * Determine equipment rarity based on player level and random chance
 * @param playerLevel Current player level
 * @returns Equipment rarity
 */
function determineRarity(playerLevel: number): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
  // Base chances
  const rarityChances = {
    common: 0.6,
    uncommon: 0.25,
    rare: 0.1,
    epic: 0.04,
    legendary: 0.01,
  };
  
  // Adjust chances based on player level
  if (playerLevel >= 5) {
    rarityChances.common = 0.45;
    rarityChances.uncommon = 0.35;
    rarityChances.rare = 0.15;
    rarityChances.epic = 0.04;
    rarityChances.legendary = 0.01;
  }
  
  if (playerLevel >= 10) {
    rarityChances.common = 0.3;
    rarityChances.uncommon = 0.4;
    rarityChances.rare = 0.2;
    rarityChances.epic = 0.08;
    rarityChances.legendary = 0.02;
  }
  
  if (playerLevel >= 15) {
    rarityChances.common = 0.2;
    rarityChances.uncommon = 0.3;
    rarityChances.rare = 0.3;
    rarityChances.epic = 0.15;
    rarityChances.legendary = 0.05;
  }
  
  if (playerLevel >= 20) {
    rarityChances.common = 0.1;
    rarityChances.uncommon = 0.2;
    rarityChances.rare = 0.35;
    rarityChances.epic = 0.25;
    rarityChances.legendary = 0.1;
  }
  
  // Roll for rarity with weighted chances
  const roll = Math.random();
  let cumulativeChance = 0;
  
  if (roll < (cumulativeChance += rarityChances.legendary)) return 'legendary';
  if (roll < (cumulativeChance += rarityChances.epic)) return 'epic';
  if (roll < (cumulativeChance += rarityChances.rare)) return 'rare';
  if (roll < (cumulativeChance += rarityChances.uncommon)) return 'uncommon';
  return 'common';
}

/**
 * Determine number of affixes based on rarity
 * @param rarity Equipment rarity
 * @returns Number of affixes to apply
 */
function determineAffixCount(rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'): number {
  switch (rarity) {
    case 'common':
      return 0; // No affixes for common items
    case 'uncommon':
      return 1; // 1 affix
    case 'rare':
      return 2; // 2 affixes
    case 'epic':
      return 3; // 3 affixes
    case 'legendary':
      return 4; // 4 affixes
    default:
      return 0;
  }
}

/**
 * Select appropriate base equipment for slot and level
 * @param slot Equipment slot
 * @param playerLevel Player level
 * @returns Base equipment
 */
function selectBaseEquipment(slot: EquipmentSlot, playerLevel: number): BaseEquipment {
  // Select from base equipment options for the given slot
  const availableBaseEquipment = BASE_EQUIPMENT[slot].filter(
    item => item.minLevel <= playerLevel
  );
  
  // Choose a random base equipment
  return availableBaseEquipment[Math.floor(Math.random() * availableBaseEquipment.length)];
}

/**
 * Select appropriate affixes for the equipment
 * @param slot Equipment slot
 * @param rarity Equipment rarity
 * @param playerLevel Player level
 * @param count Number of affixes to select
 * @returns Array of selected affixes
 */
function selectAffixes(
  slot: EquipmentSlot, 
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary',
  playerLevel: number,
  count: number
): EquipmentAffix[] {
  if (count === 0) return [];
  
  // Get all affixes appropriate for the slot and player level
  const availableAffixes = EQUIPMENT_AFFIXES.filter(affix => 
    affix.minLevel <= playerLevel && 
    // Make sure rarity matches or is lower (e.g., a rare item can have uncommon affixes)
    rarityValue(affix.rarity) <= rarityValue(rarity)
  );
  
  // Categorize by type
  const prefixes = availableAffixes.filter(affix => affix.type === 'prefix');
  const suffixes = availableAffixes.filter(affix => affix.type === 'suffix');
  
  const selectedAffixes: EquipmentAffix[] = [];
  
  // Try to balance prefixes and suffixes
  let prefixCount = Math.floor(count / 2);
  let suffixCount = count - prefixCount;
  
  // If we don't have enough of one type, adjust
  if (prefixCount > prefixes.length) {
    suffixCount += (prefixCount - prefixes.length);
    prefixCount = prefixes.length;
  }
  
  if (suffixCount > suffixes.length) {
    prefixCount += (suffixCount - suffixes.length);
    suffixCount = suffixes.length;
  }
  
  // Select random prefixes
  const shuffledPrefixes = [...prefixes].sort(() => Math.random() - 0.5);
  selectedAffixes.push(...shuffledPrefixes.slice(0, prefixCount));
  
  // Select random suffixes
  const shuffledSuffixes = [...suffixes].sort(() => Math.random() - 0.5);
  selectedAffixes.push(...shuffledSuffixes.slice(0, suffixCount));
  
  return selectedAffixes;
}

/**
 * Helper to convert rarity to numeric value for comparison
 */
function rarityValue(rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'): number {
  switch (rarity) {
    case 'common': return 1;
    case 'uncommon': return 2;
    case 'rare': return 3;
    case 'epic': return 4;
    case 'legendary': return 5;
    default: return 0;
  }
}

// Base equipment data structures
const BASE_EQUIPMENT: Record<EquipmentSlot, BaseEquipment[]> = {
  wand: [
    {
      name: 'Wand',
      slot: 'wand',
      description: 'A standard wooden wand.',
      bonuses: [
        { type: 'manaCostReduction', value: 2 },
      ],
      minLevel: 1,
    },
    {
      name: 'Staff',
      slot: 'wand',
      description: 'A sturdy wooden staff.',
      bonuses: [
        { type: 'spellPower', value: 5 },
      ],
      minLevel: 5,
    },
    {
      name: 'Rod',
      slot: 'wand',
      description: 'A short rod with a focusing crystal.',
      bonuses: [
        { type: 'manaRegen', value: 2 },
      ],
      minLevel: 3,
    },
    {
      name: 'Scepter',
      slot: 'wand',
      description: 'An ornate scepter that channels magical energy efficiently.',
      bonuses: [
        { type: 'manaCostReduction', value: 5 },
        { type: 'spellPower', value: 3 },
      ],
      minLevel: 8,
    },
    {
      name: 'Mystic Blade',
      slot: 'wand',
      description: 'A blade that channels magical energy into combat.',
      bonuses: [
        { type: 'spellPower', value: 8 },
      ],
      minLevel: 10,
    },
  ],
  dagger: [
    {
      name: 'Dagger',
      slot: 'dagger',
      description: 'A sharp magical dagger that enhances close combat abilities.',
      bonuses: [
        { type: 'mysticPunchPower', value: 10 },
        { type: 'bleedEffect', value: 3 },
      ],
      minLevel: 1,
    },
    {
      name: 'Ritual Dagger',
      slot: 'dagger',
      description: 'A ceremonial dagger that enhances magical strikes and causes bleeding.',
      bonuses: [
        { type: 'mysticPunchPower', value: 15 },
        { type: 'bleedEffect', value: 5 },
      ],
      minLevel: 5,
    },
    {
      name: 'Assassin Blade',
      slot: 'dagger',
      description: 'A deadly assassin\'s blade that causes deep wounds and enhances magical strikes.',
      bonuses: [
        { type: 'mysticPunchPower', value: 20 },
        { type: 'bleedEffect', value: 8 },
        { type: 'spellPower', value: 5 },
      ],
      minLevel: 10,
    },
    {
      name: 'Shadow Kris',
      slot: 'dagger',
      description: 'A wavy-bladed kris that channels shadow magic into devastating bleeding attacks.',
      bonuses: [
        { type: 'mysticPunchPower', value: 25 },
        { type: 'bleedEffect', value: 12 },
        { type: 'spellPower', value: 8 },
      ],
      minLevel: 15,
    },
  ],
  sword: [
    {
      name: 'Shortsword',
      slot: 'sword',
      description: 'A magical shortsword that enhances combat abilities with magical strikes.',
      bonuses: [
        { type: 'mysticPunchPower', value: 15 },
        { type: 'bleedEffect', value: 5 },
      ],
      minLevel: 3,
    },
    {
      name: 'Spellblade',
      slot: 'sword',
      description: 'A elegant blade infused with magical runes that enhance magical strikes.',
      bonuses: [
        { type: 'mysticPunchPower', value: 20 },
        { type: 'bleedEffect', value: 8 },
        { type: 'manaCostReduction', value: 3 },
      ],
      minLevel: 8,
    },
    {
      name: 'Runic Sword',
      slot: 'sword',
      description: 'A sword covered in arcane runes that channel magic into devastating strikes.',
      bonuses: [
        { type: 'mysticPunchPower', value: 30 },
        { type: 'bleedEffect', value: 10 },
        { type: 'spellPower', value: 10 },
      ],
      minLevel: 12,
    },
    {
      name: 'Arcblade',
      slot: 'sword',
      description: 'A legendary sword that arcs magical energy through foes, causing severe wounds.',
      bonuses: [
        { type: 'mysticPunchPower', value: 40 },
        { type: 'bleedEffect', value: 15 },
        { type: 'spellPower', value: 15 },
      ],
      minLevel: 18,
    },
  ],
  spellbook: [
    {
      name: 'Spellbook',
      slot: 'spellbook',
      description: 'A basic spellbook that allows for improved spell management during duels.',
      bonuses: [
        { type: 'extraCardDraw', value: 1 },
        { type: 'spellPower', value: 5 },
      ],
      minLevel: 2,
    },
    {
      name: 'Grimoire',
      slot: 'spellbook',
      description: 'An ancient grimoire that enables drawing additional cards in combat.',
      bonuses: [
        { type: 'extraCardDraw', value: 1 },
        { type: 'spellPower', value: 10 },
        { type: 'manaCostReduction', value: 2 },
      ],
      minLevel: 7,
    },
    {
      name: 'Tome',
      slot: 'spellbook',
      description: 'A powerful tome allowing for discarding and drawing new cards during battle.',
      bonuses: [
        { type: 'extraCardDraw', value: 1 },
        { type: 'discardAndDraw', value: true },
        { type: 'spellPower', value: 8 },
      ],
      minLevel: 10,
    },
    {
      name: 'Arcanum',
      slot: 'spellbook',
      description: 'A legendary arcanum that grants access to expanded spell options in combat.',
      bonuses: [
        { type: 'extraCardDraw', value: 2 },
        { type: 'discardAndDraw', value: true },
        { type: 'spellPower', value: 12 },
        { type: 'manaCostReduction', value: 5 },
      ],
      minLevel: 15,
    },
  ],
  hat: [
    {
      name: 'Wizard Hat',
      slot: 'hat',
      description: 'A classic pointed wizard hat that enhances magical abilities.',
      bonuses: [
        { type: 'maxMana', value: 15 },
        { type: 'spellPower', value: 3 },
      ],
      minLevel: 1,
    },
    {
      name: 'Mage Cap',
      slot: 'hat',
      description: 'A comfortable cap that improves mental focus and magical reserves.',
      bonuses: [
        { type: 'maxMana', value: 25 },
        { type: 'manaRegen', value: 1 },
      ],
      minLevel: 5,
    },
    {
      name: 'Circlet',
      slot: 'hat',
      description: 'An elegant circlet that enhances magical power and capacity.',
      bonuses: [
        { type: 'maxMana', value: 30 },
        { type: 'maxHealth', value: 20 },
        { type: 'spellPower', value: 5 },
      ],
      minLevel: 10,
    },
    {
      name: 'Crown',
      slot: 'hat',
      description: 'A majestic crown that greatly amplifies the wearer\'s magical potential.',
      bonuses: [
        { type: 'maxMana', value: 50 },
        { type: 'maxHealth', value: 30 },
        { type: 'spellPower', value: 10 },
        { type: 'manaRegen', value: 2 },
      ],
      minLevel: 15,
    },
  ],
  robe: [
    {
      name: 'Robe',
      slot: 'robe',
      description: 'A simple cloth robe.',
      bonuses: [
        { type: 'damageReduction', value: 2 },
      ],
      minLevel: 1,
    },
    {
      name: 'Cloak',
      slot: 'robe',
      description: 'A protective magical cloak.',
      bonuses: [
        { type: 'damageReduction', value: 3 },
        { type: 'health', value: 5 },
      ],
      minLevel: 3,
    },
    {
      name: 'Vestment',
      slot: 'robe',
      description: 'Ceremonial vestments imbued with protective magic.',
      bonuses: [
        { type: 'damageReduction', value: 5 },
      ],
      minLevel: 5,
    },
    {
      name: 'Mantle',
      slot: 'robe',
      description: 'A enchanted mantle that protects the wearer.',
      bonuses: [
        { type: 'health', value: 15 },
        { type: 'damageReduction', value: 4 },
      ],
      minLevel: 8,
    },
    {
      name: 'Armor',
      slot: 'robe',
      description: 'Magical armor that protects without restricting movement.',
      bonuses: [
        { type: 'damageReduction', value: 8 },
        { type: 'health', value: 10 },
      ],
      minLevel: 10,
    },
  ],
  amulet: [
    {
      name: 'Amulet',
      slot: 'amulet',
      description: 'A simple magical amulet.',
      bonuses: [
        { type: 'manaBoost', value: 10 },
      ],
      minLevel: 3,
    },
    {
      name: 'Pendant',
      slot: 'amulet',
      description: 'A pendant that enhances magical abilities.',
      bonuses: [
        { type: 'spellPower', value: 5 },
      ],
      minLevel: 5,
    },
    {
      name: 'Talisman',
      slot: 'amulet',
      description: 'A powerful talisman with protective magic.',
      bonuses: [
        { type: 'health', value: 15 },
        { type: 'manaBoost', value: 5 },
      ],
      minLevel: 8,
    },
    {
      name: 'Medallion',
      slot: 'amulet',
      description: 'A medallion that resonates with magical energy.',
      bonuses: [
        { type: 'manaRegen', value: 3 },
        { type: 'spellPower', value: 3 },
      ],
      minLevel: 10,
    },
  ],
  ring: [
    {
      name: 'Ring',
      slot: 'ring',
      description: 'A basic enchanted ring.',
      bonuses: [
        { type: 'manaBoost', value: 5 },
      ],
      minLevel: 5,
    },
    {
      name: 'Band',
      slot: 'ring',
      description: 'A band that enhances magical abilities.',
      bonuses: [
        { type: 'spellPower', value: 3 },
      ],
      minLevel: 7,
    },
    {
      name: 'Signet',
      slot: 'ring',
      description: 'A signet ring with focused magical properties.',
      bonuses: [
        { type: 'manaCostReduction', value: 4 },
      ],
      minLevel: 10,
    },
  ],
  belt: [
    {
      name: 'Simple Belt',
      slot: 'belt',
      description: 'A basic belt with a single potion slot.',
      bonuses: {
        potionSlots: 1
      },
      minLevel: 1,
    },
    {
      name: 'Alchemist Belt',
      slot: 'belt',
      description: 'A specialized belt with multiple potion loops for quick access.',
      bonuses: {
        potionSlots: 2,
        manaRegen: 1
      },
      minLevel: 5,
    },
    {
      name: 'Master\'s Utility Belt',
      slot: 'belt',
      description: 'A well-crafted belt with numerous secure pouches for various potions.',
      bonuses: {
        potionSlots: 3,
        manaRegen: 2
      },
      minLevel: 10,
    },
    {
      name: 'Archmage\'s Belt',
      slot: 'belt',
      description: 'A legendary belt with enchanted loops that preserve potions indefinitely.',
      bonuses: {
        potionSlots: 5,
        manaRegen: 3,
        spellPower: 5
      },
      minLevel: 15,
    },
  ],
};

// Affix data structure
const EQUIPMENT_AFFIXES: EquipmentAffix[] = [
  // PREFIXES - Primarily affect offensive capabilities
  
  // Spell Power - General
  {
    type: 'prefix',
    name: 'Arcane',
    bonuses: [{ type: 'spellPower', value: 8 }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Enhances spell power.',
  },
  {
    type: 'prefix',
    name: 'Enchanted',
    bonuses: [{ type: 'spellPower', value: 12 }],
    minLevel: 5,
    rarity: 'rare',
    descriptionTemplate: 'Significantly enhances spell power.',
  },
  {
    type: 'prefix',
    name: 'Sorcerous',
    bonuses: [{ type: 'spellPower', value: 18 }],
    minLevel: 10,
    rarity: 'epic',
    descriptionTemplate: 'Greatly enhances spell power.',
  },
  {
    type: 'prefix',
    name: 'Transcendent',
    bonuses: [{ type: 'spellPower', value: 25 }],
    minLevel: 15,
    rarity: 'legendary',
    descriptionTemplate: 'Massively enhances spell power.',
  },
  
  // Mana Cost Reduction
  {
    type: 'prefix',
    name: 'Efficient',
    bonuses: [{ type: 'manaCostReduction', value: 8 }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Reduces the mana cost of spells.',
  },
  {
    type: 'prefix',
    name: 'Conserving',
    bonuses: [{ type: 'manaCostReduction', value: 15 }],
    minLevel: 5,
    rarity: 'rare',
    descriptionTemplate: 'Significantly reduces the mana cost of spells.',
  },
  {
    type: 'prefix',
    name: 'Thrifty',
    bonuses: [{ type: 'manaCostReduction', value: 25 }],
    minLevel: 10,
    rarity: 'epic',
    descriptionTemplate: 'Greatly reduces the mana cost of spells.',
  },
  
  // Elemental Affinities - Fire
  {
    type: 'prefix',
    name: 'Fiery',
    bonuses: [{ 
      type: 'elementalAffinity', 
      value: 10,
      element: 'fire'
    }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Enhances fire spells.',
  },
  {
    type: 'prefix',
    name: 'Blazing',
    bonuses: [{ 
      type: 'elementalAffinity', 
      value: 20,
      element: 'fire'
    }],
    minLevel: 8,
    rarity: 'rare',
    descriptionTemplate: 'Significantly enhances fire spells.',
  },
  {
    type: 'prefix',
    name: 'Infernal',
    bonuses: [{ 
      type: 'elementalAffinity', 
      value: 35,
      element: 'fire'
    }],
    minLevel: 15,
    rarity: 'epic',
    descriptionTemplate: 'Greatly enhances fire spells.',
  },
  
  // Elemental Affinities - Water
  {
    type: 'prefix',
    name: 'Icy',
    bonuses: [{ 
      type: 'elementalAffinity', 
      value: 10,
      element: 'water'
    }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Enhances water spells.',
  },
  {
    type: 'prefix',
    name: 'Frozen',
    bonuses: [{ 
      type: 'elementalAffinity', 
      value: 20,
      element: 'water'
    }],
    minLevel: 8,
    rarity: 'rare',
    descriptionTemplate: 'Significantly enhances water spells.',
  },
  {
    type: 'prefix',
    name: 'Glacial',
    bonuses: [{ 
      type: 'elementalAffinity', 
      value: 35,
      element: 'water'
    }],
    minLevel: 15,
    rarity: 'epic',
    descriptionTemplate: 'Greatly enhances water spells.',
  },
  
  // Elemental Affinities - Earth
  {
    type: 'prefix',
    name: 'Rocky',
    bonuses: [{ 
      type: 'elementalAffinity', 
      value: 10,
      element: 'earth'
    }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Enhances earth spells.',
  },
  {
    type: 'prefix',
    name: 'Earthen',
    bonuses: [{ 
      type: 'elementalAffinity', 
      value: 20,
      element: 'earth'
    }],
    minLevel: 8,
    rarity: 'rare',
    descriptionTemplate: 'Significantly enhances earth spells.',
  },
  {
    type: 'prefix',
    name: 'Stone',
    bonuses: [{ 
      type: 'elementalAffinity', 
      value: 35,
      element: 'earth'
    }],
    minLevel: 15,
    rarity: 'epic',
    descriptionTemplate: 'Greatly enhances earth spells.',
  },
  
  // Elemental Affinities - Air
  {
    type: 'prefix',
    name: 'Windy',
    bonuses: [{ 
      type: 'elementalAffinity', 
      value: 10,
      element: 'air'
    }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Enhances air spells.',
  },
  {
    type: 'prefix',
    name: 'Stormy',
    bonuses: [{ 
      type: 'elementalAffinity', 
      value: 20,
      element: 'air'
    }],
    minLevel: 8,
    rarity: 'rare',
    descriptionTemplate: 'Significantly enhances air spells.',
  },
  {
    type: 'prefix',
    name: 'Tempestuous',
    bonuses: [{ 
      type: 'elementalAffinity', 
      value: 35,
      element: 'air'
    }],
    minLevel: 15,
    rarity: 'epic',
    descriptionTemplate: 'Greatly enhances air spells.',
  },
  
  // Elemental Affinities - Arcane
  {
    type: 'prefix',
    name: 'Mystic',
    bonuses: [{ 
      type: 'elementalAffinity', 
      value: 10,
      element: 'arcane'
    }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Enhances arcane spells.',
  },
  {
    type: 'prefix',
    name: 'Celestial',
    bonuses: [{ 
      type: 'elementalAffinity', 
      value: 20,
      element: 'arcane'
    }],
    minLevel: 8,
    rarity: 'rare',
    descriptionTemplate: 'Significantly enhances arcane spells.',
  },
  {
    type: 'prefix',
    name: 'Astral',
    bonuses: [{ 
      type: 'elementalAffinity', 
      value: 35,
      element: 'arcane'
    }],
    minLevel: 15,
    rarity: 'epic',
    descriptionTemplate: 'Greatly enhances arcane spells.',
  },
  
  // SUFFIXES - Primarily affect defensive and utility capabilities
  
  // Health
  {
    type: 'suffix',
    name: 'Vitality',
    bonuses: [{ type: 'health', value: 15 }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Increases maximum health.',
  },
  {
    type: 'suffix',
    name: 'Fortitude',
    bonuses: [{ type: 'health', value: 30 }],
    minLevel: 5,
    rarity: 'rare',
    descriptionTemplate: 'Significantly increases maximum health.',
  },
  {
    type: 'suffix',
    name: 'Titans',
    bonuses: [{ type: 'health', value: 50 }],
    minLevel: 10,
    rarity: 'epic',
    descriptionTemplate: 'Greatly increases maximum health.',
  },
  
  // Mana
  {
    type: 'suffix',
    name: 'Focus',
    bonuses: [{ type: 'manaBoost', value: 15 }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Increases maximum mana.',
  },
  {
    type: 'suffix',
    name: 'Concentration',
    bonuses: [{ type: 'manaBoost', value: 30 }],
    minLevel: 5,
    rarity: 'rare',
    descriptionTemplate: 'Significantly increases maximum mana.',
  },
  {
    type: 'suffix',
    name: 'Brilliance',
    bonuses: [{ type: 'manaBoost', value: 50 }],
    minLevel: 10,
    rarity: 'epic',
    descriptionTemplate: 'Greatly increases maximum mana.',
  },
  
  // Mana Regeneration
  {
    type: 'suffix',
    name: 'Restoration',
    bonuses: [{ type: 'manaRegen', value: 2 }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Enhances mana regeneration.',
  },
  {
    type: 'suffix',
    name: 'Replenishment',
    bonuses: [{ type: 'manaRegen', value: 4 }],
    minLevel: 5,
    rarity: 'rare',
    descriptionTemplate: 'Significantly enhances mana regeneration.',
  },
  {
    type: 'suffix',
    name: 'Renewal',
    bonuses: [{ type: 'manaRegen', value: 7 }],
    minLevel: 10,
    rarity: 'epic',
    descriptionTemplate: 'Greatly enhances mana regeneration.',
  },
  
  // Damage Reduction
  {
    type: 'suffix',
    name: 'Protection',
    bonuses: [{ type: 'damageReduction', value: 5 }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Reduces damage taken.',
  },
  {
    type: 'suffix',
    name: 'Warding',
    bonuses: [{ type: 'damageReduction', value: 10 }],
    minLevel: 5,
    rarity: 'rare',
    descriptionTemplate: 'Significantly reduces damage taken.',
  },
  {
    type: 'suffix',
    name: 'Invulnerability',
    bonuses: [{ type: 'damageReduction', value: 15 }],
    minLevel: 10,
    rarity: 'epic',
    descriptionTemplate: 'Greatly reduces damage taken.',
  },
  
  // Health Regeneration
  {
    type: 'suffix',
    name: 'Healing',
    bonuses: [{ type: 'healthRegen', value: 2 }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Regenerates health over time.',
  },
  {
    type: 'suffix',
    name: 'Rejuvenation',
    bonuses: [{ type: 'healthRegen', value: 4 }],
    minLevel: 5,
    rarity: 'rare',
    descriptionTemplate: 'Significantly regenerates health over time.',
  },
  {
    type: 'suffix',
    name: 'Immortality',
    bonuses: [{ type: 'healthRegen', value: 7 }],
    minLevel: 10,
    rarity: 'epic',
    descriptionTemplate: 'Greatly regenerates health over time.',
  },
  
  // Special Effects - these are more rare and powerful
  
  // Spell Reuse
  {
    type: 'suffix',
    name: 'Recycling',
    bonuses: [{ type: 'spellReuse', value: 1 }], // Chance to reuse a spell
    minLevel: 5,
    rarity: 'rare',
    descriptionTemplate: 'Occasionally allows casting a spell without consuming it.',
  },
  
  // Critical Spellcasting
  {
    type: 'suffix',
    name: 'Potency',
    bonuses: [{ type: 'criticalSpellcast', value: 10 }], // 10% chance
    minLevel: 8,
    rarity: 'rare',
    descriptionTemplate: 'Gives a chance for spells to have increased effect.',
  },
  {
    type: 'suffix',
    name: 'Devastation',
    bonuses: [{ type: 'criticalSpellcast', value: 20 }], // 20% chance
    minLevel: 15,
    rarity: 'epic',
    descriptionTemplate: 'Gives a significant chance for spells to have increased effect.',
  },
  
  // Spell Vampirism
  {
    type: 'suffix',
    name: 'Leeching',
    bonuses: [{ type: 'spellVampirism', value: 5 }], // 5% life steal
    minLevel: 10,
    rarity: 'rare',
    descriptionTemplate: 'Converts a portion of spell damage to health.',
  },
  {
    type: 'suffix',
    name: 'Vampirism',
    bonuses: [{ type: 'spellVampirism', value: 10 }], // 10% life steal
    minLevel: 15,
    rarity: 'epic',
    descriptionTemplate: 'Converts a significant portion of spell damage to health.',
  },
  
  // Damage Barrier
  {
    type: 'suffix',
    name: 'Shielding',
    bonuses: [{ type: 'damageBarrier', value: 15 }], // Absorbs 15 damage
    minLevel: 5,
    rarity: 'rare',
    descriptionTemplate: 'Creates a magical barrier that absorbs damage.',
  },
  {
    type: 'suffix',
    name: 'Aegis',
    bonuses: [{ type: 'damageBarrier', value: 30 }], // Absorbs 30 damage
    minLevel: 12,
    rarity: 'epic',
    descriptionTemplate: 'Creates a powerful magical barrier that absorbs significant damage.',
  },
  
  // Legendary Combinations - these provide multiple bonuses
  {
    type: 'suffix',
    name: 'the Archmage',
    bonuses: [
      { type: 'spellPower', value: 15 },
      { type: 'manaBoost', value: 30 },
      { type: 'manaRegen', value: 3 },
    ],
    minLevel: 15,
    rarity: 'legendary',
    descriptionTemplate: 'Imbued with the power of legendary archmages.',
  },
  {
    type: 'suffix',
    name: 'the Guardian',
    bonuses: [
      { type: 'health', value: 30 },
      { type: 'damageReduction', value: 10 },
      { type: 'damageBarrier', value: 20 },
    ],
    minLevel: 15,
    rarity: 'legendary',
    descriptionTemplate: 'Provides exceptional protection to the wearer.',
  },
  {
    type: 'suffix',
    name: 'the Phoenix',
    bonuses: [
      { type: 'elementalAffinity', value: 25, element: 'fire' },
      { type: 'healthRegen', value: 5 },
      { type: 'spellVampirism', value: 8 },
    ],
    minLevel: 15,
    rarity: 'legendary',
    descriptionTemplate: 'Channels the regenerative power of the phoenix.',
  },
];

/**
 * Generate multiple equipment pieces for loot drops
 * @param playerLevel Current player level
 * @param count Number of equipment pieces to generate
 * @param minRarity Optional minimum rarity
 * @returns Array of generated equipment
 */
export function generateLootEquipment(
  playerLevel: number, 
  count: number, 
  minRarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
): Equipment[] {
  const loot: Equipment[] = [];
  
  for (let i = 0; i < count; i++) {
    let equipment = generateProceduralEquipment(playerLevel);
    
    // If minRarity specified, ensure equipment meets that rarity
    if (minRarity && rarityValue(equipment.rarity) < rarityValue(minRarity)) {
      // Try again with forced rarity
      equipment = generateProceduralEquipment(playerLevel);
      equipment.rarity = minRarity;
    }
    
    loot.push(equipment);
  }
  
  return loot;
}

/**
 * Generate a staff weapon that can be equipped in the wand slot
 * This enhances the mystic punch ability
 */
export function generateStaff(playerLevel: number): Equipment {
  const equipment = generateProceduralEquipment(playerLevel, 'wand');
  
  // Make it a staff or similar weapon type
  const weaponTypes = ['Staff', 'Battle Staff', 'Wizard Staff', 'Battlemage Staff', 'Mystic Staff'];
  const chosenType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
  
  // Add a physical damage bonus
  const physicalDamageBonus: Partial<EquipmentBonuses> = {
    type: 'spellPower',
    value: 10 + Math.floor(playerLevel * 1.5)
  };
  
  // Update the name and properties
  equipment.name = equipment.name.replace(/Wand|Rod|Scepter/, chosenType);
  equipment.bonuses = { ...equipment.bonuses, ...physicalDamageBonus };
  equipment.description += ' Enhances the mystic punch ability.';
  
  return equipment;
} 