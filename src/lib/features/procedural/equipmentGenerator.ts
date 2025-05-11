import { Equipment, EquipmentSlot, ElementType, StatBonus } from '../../types';

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
  bonuses: StatBonus[];
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
  bonuses: StatBonus[];
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
  let finalBonuses: StatBonus[] = [...baseEquipment.bonuses];
  let finalDescription = baseEquipment.description;
  
  // Apply prefixes (prepend to name)
  const prefixes = appliedAffixes.filter(affix => affix.type === 'prefix');
  for (const prefix of prefixes) {
    finalName = `${prefix.name} ${finalName}`;
    finalBonuses = [...finalBonuses, ...prefix.bonuses];
    finalDescription = `${finalDescription} ${prefix.descriptionTemplate.replace('{item}', baseEquipment.name)}`;
  }
  
  // Apply suffixes (append to name)
  const suffixes = appliedAffixes.filter(affix => affix.type === 'suffix');
  for (const suffix of suffixes) {
    finalName = `${finalName} of ${suffix.name}`;
    finalBonuses = [...finalBonuses, ...suffix.bonuses];
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
  head: [
    {
      name: 'Wizard Hat',
      slot: 'head',
      description: 'A classic pointed wizard hat that enhances magical abilities.',
      bonuses: [
        { stat: 'maxMana', value: 15 },
        { stat: 'spellPower', value: 3 }
      ],
      minLevel: 1,
    },
    {
      name: 'Mage Cap',
      slot: 'head',
      description: 'A comfortable cap that improves mental focus and magical reserves.',
      bonuses: [
        { stat: 'maxMana', value: 20 },
        { stat: 'manaRegen', value: 2 }
      ],
      minLevel: 5,
    },
  ],
  hand: [
    {
      name: 'Wand',
      slot: 'hand',
      description: 'A standard wooden wand.',
      bonuses: [
        { stat: 'manaCostReduction', value: 2 }
      ],
      minLevel: 1,
    },
    {
      name: 'Staff',
      slot: 'hand',
      description: 'A sturdy wooden staff.',
      bonuses: [
        { stat: 'spellPower', value: 5 }
      ],
      minLevel: 5,
    },
    {
      name: 'Dagger',
      slot: 'hand',
      description: 'A sharp magical dagger that enhances close combat abilities.',
      bonuses: [
        { stat: 'mysticPunchPower', value: 10 },
        { stat: 'bleedEffect', value: 3 }
      ],
      minLevel: 1,
    },
    {
      name: 'Spellbook',
      slot: 'hand',
      description: 'A basic spellbook that allows for improved spell management during duels.',
      bonuses: [
        { stat: 'extraCardDraw', value: 1 },
        { stat: 'spellPower', value: 5 }
      ],
      minLevel: 2,
    },
  ],
  body: [
    {
      name: 'Apprentice Robe',
      slot: 'body',
      description: 'A simple robe that provides basic magical protection.',
      bonuses: [
        { stat: 'maxHealth', value: 10 },
        { stat: 'maxMana', value: 10 },
        { stat: 'scrollSlots', value: 1 }
      ],
      minLevel: 1,
    },
    {
      name: 'Mage Robe',
      slot: 'body',
      description: 'A well-crafted robe that enhances magical abilities.',
      bonuses: [
        { stat: 'maxHealth', value: 20 },
        { stat: 'maxMana', value: 20 },
        { stat: 'spellPower', value: 5 },
        { stat: 'scrollSlots', value: 2 }
      ],
      minLevel: 5,
    },
  ],
  neck: [
    {
      name: 'Mana Pendant',
      slot: 'neck',
      description: 'A pendant that enhances mana regeneration.',
      bonuses: [
        { stat: 'manaRegen', value: 2 }
      ],
      minLevel: 1,
    },
    {
      name: 'Arcane Amulet',
      slot: 'neck',
      description: 'An amulet that boosts magical power.',
      bonuses: [
        { stat: 'spellPower', value: 8 }
      ],
      minLevel: 5,
    },
  ],
  finger: [
    {
      name: 'Ring of Power',
      slot: 'finger',
      description: 'A ring that enhances magical abilities.',
      bonuses: [
        { stat: 'spellPower', value: 3 }
      ],
      minLevel: 1,
    },
    {
      name: 'Ring of Protection',
      slot: 'finger',
      description: 'A ring that provides magical protection.',
      bonuses: [
        { stat: 'maxHealth', value: 15 }
      ],
      minLevel: 3,
    },
  ],
  belt: [
    {
      name: 'Potion Belt',
      slot: 'belt',
      description: 'A belt with pouches for carrying potions.',
      bonuses: [
        { stat: 'potionSlots', value: 2 }
      ],
      minLevel: 1,
    },
    {
      name: 'Alchemist Belt',
      slot: 'belt',
      description: 'A specialized belt for carrying multiple potions.',
      bonuses: [
        { stat: 'potionSlots', value: 3 },
        { stat: 'potionEffectiveness', value: 10 }
      ],
      minLevel: 5,
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
    bonuses: [{ stat: 'spellPower', value: 8 }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Enhances spell power.',
  },
  {
    type: 'prefix',
    name: 'Enchanted',
    bonuses: [{ stat: 'spellPower', value: 12 }],
    minLevel: 5,
    rarity: 'rare',
    descriptionTemplate: 'Significantly enhances spell power.',
  },
  {
    type: 'prefix',
    name: 'Sorcerous',
    bonuses: [{ stat: 'spellPower', value: 18 }],
    minLevel: 10,
    rarity: 'epic',
    descriptionTemplate: 'Greatly enhances spell power.',
  },
  {
    type: 'prefix',
    name: 'Transcendent',
    bonuses: [{ stat: 'spellPower', value: 25 }],
    minLevel: 15,
    rarity: 'legendary',
    descriptionTemplate: 'Massively enhances spell power.',
  },
  
  // Mana Cost Reduction
  {
    type: 'prefix',
    name: 'Efficient',
    bonuses: [{ stat: 'manaCostReduction', value: 8 }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Reduces the mana cost of spells.',
  },
  {
    type: 'prefix',
    name: 'Conserving',
    bonuses: [{ stat: 'manaCostReduction', value: 15 }],
    minLevel: 5,
    rarity: 'rare',
    descriptionTemplate: 'Significantly reduces the mana cost of spells.',
  },
  {
    type: 'prefix',
    name: 'Thrifty',
    bonuses: [{ stat: 'manaCostReduction', value: 25 }],
    minLevel: 10,
    rarity: 'epic',
    descriptionTemplate: 'Greatly reduces the mana cost of spells.',
  },
  
  // Elemental Affinities - Fire
  {
    type: 'prefix',
    name: 'Fiery',
    bonuses: [{ stat: 'elementalAffinity', value: 10, element: 'fire' }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Enhances fire spells.',
  },
  {
    type: 'prefix',
    name: 'Blazing',
    bonuses: [{ stat: 'elementalAffinity', value: 20, element: 'fire' }],
    minLevel: 8,
    rarity: 'rare',
    descriptionTemplate: 'Significantly enhances fire spells.',
  },
  {
    type: 'prefix',
    name: 'Infernal',
    bonuses: [{ stat: 'elementalAffinity', value: 35, element: 'fire' }],
    minLevel: 15,
    rarity: 'epic',
    descriptionTemplate: 'Greatly enhances fire spells.',
  },
  
  // Elemental Affinities - Water
  {
    type: 'prefix',
    name: 'Icy',
    bonuses: [{ stat: 'elementalAffinity', value: 10, element: 'water' }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Enhances water spells.',
  },
  {
    type: 'prefix',
    name: 'Frozen',
    bonuses: [{ stat: 'elementalAffinity', value: 20, element: 'water' }],
    minLevel: 8,
    rarity: 'rare',
    descriptionTemplate: 'Significantly enhances water spells.',
  },
  {
    type: 'prefix',
    name: 'Glacial',
    bonuses: [{ stat: 'elementalAffinity', value: 35, element: 'water' }],
    minLevel: 15,
    rarity: 'epic',
    descriptionTemplate: 'Greatly enhances water spells.',
  },
  
  // Elemental Affinities - Earth
  {
    type: 'prefix',
    name: 'Rocky',
    bonuses: [{ stat: 'elementalAffinity', value: 10, element: 'earth' }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Enhances earth spells.',
  },
  {
    type: 'prefix',
    name: 'Earthen',
    bonuses: [{ stat: 'elementalAffinity', value: 20, element: 'earth' }],
    minLevel: 8,
    rarity: 'rare',
    descriptionTemplate: 'Significantly enhances earth spells.',
  },
  {
    type: 'prefix',
    name: 'Stone',
    bonuses: [{ stat: 'elementalAffinity', value: 35, element: 'earth' }],
    minLevel: 15,
    rarity: 'epic',
    descriptionTemplate: 'Greatly enhances earth spells.',
  },
  
  // Elemental Affinities - Air
  {
    type: 'prefix',
    name: 'Windy',
    bonuses: [{ stat: 'elementalAffinity', value: 10, element: 'air' }],
    minLevel: 1,
    rarity: 'uncommon',
    descriptionTemplate: 'Enhances air spells.',
  },
  {
    type: 'prefix',
    name: 'Stormy',
    bonuses: [{ stat: 'elementalAffinity', value: 20, element: 'air' }],
    minLevel: 8,
    rarity: 'rare',
    descriptionTemplate: 'Significantly enhances air spells.',
  },
  {
    type: 'prefix',
    name: 'Tempestuous',
    bonuses: [{ stat: 'elementalAffinity', value: 35, element: 'air' }],
    minLevel: 15,
    rarity: 'epic',
    descriptionTemplate: 'Greatly enhances air spells.',
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
  const physicalDamageBonus: StatBonus[] = [
    { stat: 'spellPower', value: 10 + Math.floor(playerLevel * 1.5) }
  ];
  
  // Update the name and properties
  equipment.name = equipment.name.replace(/Wand|Rod|Scepter/, chosenType);
  equipment.bonuses = [...equipment.bonuses, ...physicalDamageBonus];
  equipment.description += ' Enhances the mystic punch ability.';
  
  return equipment;
} 