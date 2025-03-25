// src/lib/features/procedural/enemyGenerator.ts
import { Wizard, Spell, Equipment } from '../../types';
import { generateDefaultWizard } from '../../wizard/wizardUtils';
import { getAllSpells, getSpellsByTier, getSpellsByElement } from '../../spells/spellData';
import { getRandomEquipment } from '../../equipment/equipmentData';

/**
 * Generates a procedural enemy wizard based on player level and difficulty
 * @param playerLevel The player's current level
 * @param difficulty The game difficulty
 * @param theme Optional theme for the enemy wizard (element or specialty)
 * @returns A procedurally generated enemy wizard
 */
export function generateEnemyWizard(
  playerLevel: number, 
  difficulty: 'easy' | 'normal' | 'hard',
  theme?: string
): Wizard {
  // Base level adjustment based on difficulty
  let levelAdjustment = 0;
  switch (difficulty) {
    case 'easy':
      levelAdjustment = -2;
      break;
    case 'normal':
      levelAdjustment = 0;
      break;
    case 'hard':
      levelAdjustment = 2;
      break;
  }
  
  // Calculate enemy level (minimum level 1)
  const enemyLevel = Math.max(1, playerLevel + levelAdjustment);
  
  // Generate random name
  const name = generateRandomWizardName(theme);
  
  // Create base wizard
  const enemyWizard = generateDefaultWizard(name);
  
  // Adjust stats based on level and difficulty
  enemyWizard.level = enemyLevel;
  enemyWizard.maxHealth = 100 + (enemyLevel - 1) * 10;
  enemyWizard.health = enemyWizard.maxHealth;
  enemyWizard.maxMana = 100 + (enemyLevel - 1) * 5;
  enemyWizard.mana = enemyWizard.maxMana;
  enemyWizard.manaRegen = enemyLevel;
  
  // Add spells based on theme if provided
  if (theme && isElementTheme(theme)) {
    addElementalSpells(enemyWizard, theme as any, enemyLevel);
  } else {
    addRandomSpells(enemyWizard, enemyLevel);
  }
  
  // Ensure enemy has at least 3 spells equipped
  while (enemyWizard.equippedSpells.length < 3 && enemyWizard.spells.length > 0) {
    const randomSpellIndex = Math.floor(Math.random() * enemyWizard.spells.length);
    const spellToEquip = enemyWizard.spells[randomSpellIndex];
    
    if (!enemyWizard.equippedSpells.some(spell => spell.id === spellToEquip.id)) {
      enemyWizard.equippedSpells.push(spellToEquip);
    }
  }
  
  // Add equipment based on level
  addEquipment(enemyWizard, enemyLevel);
  
  return enemyWizard;
}

/**
 * Generates a random wizard name, optionally based on a theme
 * @param theme Optional theme to influence the name
 * @returns A randomly generated wizard name
 */
function generateRandomWizardName(theme?: string): string {
  const prefixes = [
    'Arch', 'Grand', 'High', 'Master', 'Elder', 'Ancient', 'Mystic', 'Sage', 
    'Venerable', 'Wise', 'Dark', 'Bright', 'Astral', 'Ethereal', 'Primal'
  ];
  
  const names = [
    'Zephyr', 'Merlin', 'Gandalf', 'Elminster', 'Mordenkainen', 'Tenser', 'Raistlin',
    'Alhazred', 'Tasha', 'Iggwilv', 'Bigby', 'Otiluke', 'Leomund', 'Melf', 'Drawmij',
    'Nystul', 'Evard', 'Aganazzar', 'Snilloc', 'Tasha', 'Mordenkainen', 'Rary'
  ];
  
  const suffixes = [
    'the Wise', 'the Arcane', 'the Magnificent', 'the Mysterious', 'the Powerful',
    'the Ancient', 'the Enchanter', 'the Conjurer', 'the Evoker', 'the Diviner',
    'the Illusionist', 'the Necromancer', 'the Transmuter', 'the Abjurer'
  ];
  
  // If theme is provided, add theme-specific names
  if (theme) {
    if (theme === 'fire') {
      names.push('Ignis', 'Pyros', 'Flameweaver', 'Embermage', 'Cindercloak');
      suffixes.push('of the Flame', 'the Firebringer', 'the Incinerator');
    } else if (theme === 'water') {
      names.push('Aquarius', 'Hydromancer', 'Tidecaller', 'Waveshaper', 'Frostweaver');
      suffixes.push('of the Depths', 'the Tidebringer', 'the Stormbringer');
    } else if (theme === 'earth') {
      names.push('Terramancer', 'Stoneshaper', 'Geomant', 'Earthcaller', 'Mountainheart');
      suffixes.push('of the Stone', 'the Earthshaker', 'the Mountainforger');
    } else if (theme === 'air') {
      names.push('Aeromancer', 'Stormcaller', 'Windweaver', 'Skyshaper', 'Tempestbringer');
      suffixes.push('of the Skies', 'the Stormcaller', 'the Windwalker');
    } else if (theme === 'arcane') {
      names.push('Arcanist', 'Spellweaver', 'Magus', 'Thaumaturge', 'Archmage');
      suffixes.push('of the Arcane', 'the Spellmaster', 'the Arcanist');
    }
  }
  
  // Randomly select name components
  const prefix = Math.random() < 0.7 ? prefixes[Math.floor(Math.random() * prefixes.length)] : '';
  const name = names[Math.floor(Math.random() * names.length)];
  const suffix = Math.random() < 0.8 ? suffixes[Math.floor(Math.random() * suffixes.length)] : '';
  
  // Construct the name
  return `${prefix} ${name} ${suffix}`.trim();
}

/**
 * Checks if a theme is an elemental theme
 * @param theme The theme to check
 * @returns True if the theme is an elemental theme
 */
function isElementTheme(theme: string): boolean {
  return ['fire', 'water', 'earth', 'air', 'arcane', 'nature', 'shadow', 'light'].includes(theme);
}

/**
 * Adds elemental spells to a wizard based on their theme
 * @param wizard The wizard to add spells to
 * @param element The elemental theme
 * @param level The wizard's level
 */
function addElementalSpells(wizard: Wizard, element: string, level: number): void {
  // Get elemental spells
  const elementalSpells = getSpellsByElement(element as any);
  
  // Filter spells by tier based on level
  const maxTier = Math.min(Math.ceil(level / 3), 10); // Max tier 10
  const availableSpells = elementalSpells.filter(spell => spell.tier <= maxTier);
  
  // Add a special thematic spell
  const thematicSpell = createThematicSpell(element, level);
  wizard.spells.push(thematicSpell);
  wizard.equippedSpells.push(thematicSpell);
  
  // Add random elemental spells
  const spellsToAdd = Math.min(5 + Math.floor(level / 2), availableSpells.length);
  const shuffledSpells = [...availableSpells].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < spellsToAdd; i++) {
    if (i < shuffledSpells.length) {
      wizard.spells.push(shuffledSpells[i]);
      
      // Equip some of the spells (up to 3 total)
      if (wizard.equippedSpells.length < 3 && Math.random() < 0.5) {
        wizard.equippedSpells.push(shuffledSpells[i]);
      }
    }
  }
}

/**
 * Adds random spells to a wizard
 * @param wizard The wizard to add spells to
 * @param level The wizard's level
 */
function addRandomSpells(wizard: Wizard, level: number): void {
  // Calculate max tier based on level
  const maxTier = Math.min(Math.ceil(level / 3), 10); // Max tier 10
  
  // Get all spells up to max tier
  let availableSpells: Spell[] = [];
  for (let tier = 1; tier <= maxTier; tier++) {
    availableSpells = [...availableSpells, ...getSpellsByTier(tier)];
  }
  
  // Add random spells
  const spellsToAdd = Math.min(5 + Math.floor(level / 2), availableSpells.length);
  const shuffledSpells = [...availableSpells].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < spellsToAdd; i++) {
    if (i < shuffledSpells.length) {
      wizard.spells.push(shuffledSpells[i]);
      
      // Equip some of the spells (up to 3 total)
      if (wizard.equippedSpells.length < 3 && Math.random() < 0.5) {
        wizard.equippedSpells.push(shuffledSpells[i]);
      }
    }
  }
}

/**
 * Creates a special thematic spell for an enemy wizard
 * @param element The elemental theme
 * @param level The wizard's level
 * @returns A unique thematic spell
 */
function createThematicSpell(element: string, level: number): Spell {
  // Base damage/healing value based on level
  const baseValue = 15 + level * 2;
  
  // Create spell based on element
  switch (element) {
    case 'fire':
      return {
        id: `spell_inferno_blast_${Date.now()}`,
        name: 'Inferno Blast',
        type: 'damage',
        element: 'fire',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 20 + level,
        description: 'A devastating blast of fire that deals massive damage and leaves the target burning.',
        effects: [
          {
            type: 'damage',
            value: baseValue * 1.2,
            target: 'enemy',
            element: 'fire',
          },
          {
            type: 'damage',
            value: baseValue * 0.3,
            duration: 2,
            target: 'enemy',
            element: 'fire',
          }
        ],
        imagePath: '/images/spells/default-placeholder.jpg',
      };
      
    case 'water':
      return {
        id: `spell_tidal_surge_${Date.now()}`,
        name: 'Tidal Surge',
        type: 'damage',
        element: 'water',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 20 + level,
        description: 'A powerful surge of water that damages and slows the target.',
        effects: [
          {
            type: 'damage',
            value: baseValue,
            target: 'enemy',
            element: 'water',
          },
          {
            type: 'statModifier',
            value: -5,
            duration: 3,
            target: 'enemy',
            element: 'water',
          }
        ],
        imagePath: '/images/spells/default-placeholder.jpg',
      };
      
    case 'earth':
      return {
        id: `spell_stone_armor_${Date.now()}`,
        name: 'Stone Armor',
        type: 'buff',
        element: 'earth',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 20 + level,
        description: 'Encases the caster in protective stone, reducing incoming damage and reflecting some back.',
        effects: [
          {
            type: 'statModifier',
            value: -10,
            duration: 3,
            target: 'self',
            element: 'earth',
          },
          {
            type: 'damage',
            value: baseValue * 0.5,
            duration: 3,
            target: 'enemy',
            element: 'earth',
          }
        ],
        imagePath: '/images/spells/default-placeholder.jpg',
      };
      
    case 'air':
      return {
        id: `spell_lightning_storm_${Date.now()}`,
        name: 'Lightning Storm',
        type: 'damage',
        element: 'air',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 20 + level,
        description: 'Summons a storm of lightning that strikes the target multiple times.',
        effects: [
          {
            type: 'damage',
            value: baseValue * 0.6,
            target: 'enemy',
            element: 'air',
          },
          {
            type: 'damage',
            value: baseValue * 0.6,
            target: 'enemy',
            element: 'air',
          },
          {
            type: 'damage',
            value: baseValue * 0.6,
            target: 'enemy',
            element: 'air',
          }
        ],
        imagePath: '/images/spells/default-placeholder.jpg',
      };
      
    case 'arcane':
      return {
        id: `spell_arcane_barrage_${Date.now()}`,
        name: 'Arcane Barrage',
        type: 'damage',
        element: 'arcane',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 20 + level,
        description: 'Launches a barrage of arcane missiles that seek out the target.',
        effects: [
          {
            type: 'damage',
            value: baseValue * 0.4,
            target: 'enemy',
            element: 'arcane',
          },
          {
            type: 'damage',
            value: baseValue * 0.4,
            target: 'enemy',
            element: 'arcane',
          },
          {
            type: 'damage',
            value: baseValue * 0.4,
            target: 'enemy',
            element: 'arcane',
          },
          {
            type: 'damage',
            value: baseValue * 0.4,
            target: 'enemy',
            element: 'arcane',
          }
        ],
        imagePath: '/images/spells/default-placeholder.jpg',
      };
      
    case 'nature':
      return {
        id: `spell_natures_embrace_${Date.now()}`,
        name: 'Nature\'s Embrace',
        type: 'healing',
        element: 'nature',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 20 + level,
        description: 'Channels the power of nature to heal the caster over time and provide protection.',
        effects: [
          {
            type: 'healing',
            value: baseValue * 0.5,
            target: 'self',
            element: 'nature',
          },
          {
            type: 'healing',
            value: baseValue * 0.3,
            duration: 3,
            target: 'self',
            element: 'nature',
          },
          {
            type: 'statModifier',
            value: -5,
            duration: 3,
            target: 'self',
            element: 'nature',
          }
        ],
        imagePath: '/images/spells/default-placeholder.jpg',
      };
      
    case 'shadow':
      return {
        id: `spell_shadow_drain_${Date.now()}`,
        name: 'Shadow Drain',
        type: 'damage',
        element: 'shadow',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 20 + level,
        description: 'Drains the life force from the target, healing the caster.',
        effects: [
          {
            type: 'damage',
            value: baseValue,
            target: 'enemy',
            element: 'shadow',
          },
          {
            type: 'healing',
            value: baseValue * 0.5,
            target: 'self',
            element: 'shadow',
          }
        ],
        imagePath: '/images/spells/default-placeholder.jpg',
      };
      
    case 'light':
      return {
        id: `spell_divine_radiance_${Date.now()}`,
        name: 'Divine Radiance',
        type: 'damage',
        element: 'light',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 20 + level,
        description: 'Channels divine light to damage enemies and heal allies.',
        effects: [
          {
            type: 'damage',
            value: baseValue,
            target: 'enemy',
            element: 'light',
          },
          {
            type: 'healing',
            value: baseValue * 0.3,
            target: 'self',
            element: 'light',
          }
        ],
        imagePath: '/images/spells/default-placeholder.jpg',
      };
      
    default:
      // Generic arcane spell as fallback
      return {
        id: `spell_arcane_blast_${Date.now()}`,
        name: 'Arcane Blast',
        type: 'damage',
        element: 'arcane',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 20 + level,
        description: 'A powerful blast of arcane energy.',
        effects: [
          {
            type: 'damage',
            value: baseValue,
            target: 'enemy',
            element: 'arcane',
          }
        ],
        imagePath: '/images/spells/default-placeholder.jpg',
      };
  }
}

/**
 * Adds equipment to a wizard based on their level
 * @param wizard The wizard to add equipment to
 * @param level The wizard's level
 */
function addEquipment(wizard: Wizard, level: number): void {
  // Add wand
  wizard.equipment.wand = getRandomEquipment(level);
  
  // Add robe
  wizard.equipment.robe = getRandomEquipment(level);
  
  // Add amulet
  if (level >= 3) {
    wizard.equipment.amulet = getRandomEquipment(level);
  }
  
  // Add rings
  if (level >= 5) {
    wizard.equipment.ring1 = getRandomEquipment(level);
  }
  
  if (level >= 10) {
    wizard.equipment.ring2 = getRandomEquipment(level);
  }
}
