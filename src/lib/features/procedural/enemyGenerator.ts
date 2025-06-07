// src/lib/features/procedural/enemyGenerator.ts
import { Enemy, EnemyArchetype, Spell, Equipment, EquipmentSlot, Wizard } from '../../types';
import { magicalCreatures } from './magicalCreatures';
import { enemyArchetypes } from './enemyArchetypes';
import { generateProceduralEquipment } from './equipmentGenerator';
import { generateSpell } from './spellGenerator';

function getLevelMultiplier(level: number): number {
  const steps = [
    { limit: 25, rate: 0.1 },
    { limit: 100, rate: 0.07 },
    { limit: 250, rate: 0.05 },
    { limit: 500, rate: 0.03 },
    { limit: 1000, rate: 0.02 },
    { limit: 1500, rate: 0.015 },
    { limit: 2500, rate: 0.01 },
    { limit: 5000, rate: 0.005 },
    { limit: 10000, rate: 0.003 }
  ];

  let multiplier = 1;
  let remaining = level - 1;
  let previous = 0;

  for (const step of steps) {
    if (remaining <= 0) break;
    const stepLevels = Math.min(remaining, step.limit - previous);
    multiplier += stepLevels * step.rate;
    remaining -= stepLevels;
    previous = step.limit;
  }

  if (remaining > 0) {
    multiplier += remaining * 0.001;
  }

  return multiplier;
}

function getSpellScale(level: number): number {
  const steps = [
    { limit: 25, rate: 0.75 / 24 },
    { limit: 100, rate: 0.02 },
    { limit: 250, rate: 0.015 },
    { limit: 500, rate: 0.01 },
    { limit: 1000, rate: 0.008 },
    { limit: 1500, rate: 0.006 },
    { limit: 2500, rate: 0.004 },
    { limit: 5000, rate: 0.002 },
    { limit: 10000, rate: 0.001 }
  ];

  let ratio = 0.25;
  let remaining = level - 1;
  let previous = 0;

  for (const step of steps) {
    if (remaining <= 0) break;
    const stepLevels = Math.min(remaining, step.limit - previous);
    ratio += stepLevels * step.rate;
    remaining -= stepLevels;
    previous = step.limit;
  }

  if (remaining > 0) {
    ratio += remaining * 0.0005;
  }

  return ratio;
}

/**
 * Generates a procedural enemy wizard based on player level and difficulty
 * @param playerLevel The player's current level
 * @param difficulty The game difficulty
 * @param theme Optional theme for the enemy wizard (element or specialty)
 * @returns A procedurally generated enemy wizard
 */
function generateEnemyWizard(playerLevel: number, difficulty: 'easy' | 'normal' | 'hard', theme?: string): Enemy {
  // Always use the key as the archetype property for robust mapping in the UI
  const archetypeKeys = Object.keys(enemyArchetypes);
  const archetypeKey = archetypeKeys[Math.floor(Math.random() * archetypeKeys.length)];
  const archetype = enemyArchetypes[archetypeKey];
  const level = Math.max(1, playerLevel + Math.floor(Math.random() * 3) - 1);

  // Calculate base stats with difficulty multiplier
  const difficultyMultiplier = {
    easy: 0.8,
    normal: 1,
    hard: 1.2
  }[difficulty];

  // Apply archetype multiplier only to the base, then scale by level and difficulty
  const baseHealth = 100 * archetype.baseStats.healthMultiplier;
  const baseMana = 80 * archetype.baseStats.manaMultiplier;
  const health = Math.round(baseHealth * (1 + level * 0.1) * difficultyMultiplier);
  const mana = Math.round(baseMana * (1 + level * 0.1) * difficultyMultiplier);

  // Generate spells based on archetype
  const spells: Spell[] = [
    archetype.getSpecialSpell(level),
    ...archetype.getThematicSpells(level)
  ];

  // Generate equipment based on archetype
  const equipment: Record<string, Equipment | undefined> = {};
  const slots: EquipmentSlot[] = ['head', 'hand', 'body', 'neck', 'finger', 'belt'];
  for (const slot of slots) {
    equipment[slot] = generateProceduralEquipment(playerLevel, slot);
  }

  // Calculate rewards based on difficulty and level
  const goldReward = Math.floor(100 * difficultyMultiplier * (1 + level * 0.1));
  const expReward = Math.floor(50 * difficultyMultiplier * (1 + level * 0.1));

  return {
    id: `enemy_${Date.now()}`,
    name: `${archetype.name} Wizard`,
    health,
    mana,
    maxHealth: health,
    maxMana: mana,
    baseMaxHealth: health,
    progressionMaxHealth: 0,
    equipmentMaxHealth: 0,
    totalMaxHealth: health,
    baseMaxMana: mana,
    progressionMaxMana: 0,
    equipmentMaxMana: 0,
    totalMaxMana: mana,
    level,
    spells,
    goldReward,
    expReward,
    weakness: archetype.weakness || undefined,
    resistance: archetype.resistance || undefined,
    imagePath: `/images/enemies/${archetype.id}.jpg`,
    equipment,
    archetype: archetypeKey // Always set to the key for robust UI mapping
  };
}

/**
 * Generates a random wizard name based on theme
 */
function generateRandomWizardName(theme: string): string {
  const prefixes = {
    death: ['Dark', 'Shadow', 'Death', 'Grave', 'Bone'],
    time: ['Chronos', 'Temporal', 'Time', 'Echo', 'Past'],
    combat: ['Blade', 'Steel', 'Iron', 'War', 'Battle'],
    illusion: ['Mirage', 'Phantom', 'Shadow', 'Veil', 'Mist'],
    alchemy: ['Potion', 'Brew', 'Vial', 'Flask', 'Elixir']
  };
  
  const suffixes = {
    death: ['Reaper', 'Walker', 'Caller', 'Binder', 'Master'],
    time: ['Weaver', 'Walker', 'Master', 'Keeper', 'Guardian'],
    combat: ['Blade', 'Fighter', 'Warrior', 'Knight', 'Guardian'],
    illusion: ['Weaver', 'Master', 'Walker', 'Keeper', 'Guardian'],
    alchemy: ['Master', 'Brewer', 'Mixer', 'Master', 'Guardian']
  };
  
  const themePrefixes = prefixes[theme as keyof typeof prefixes] || ['Mystic', 'Arcane', 'Wise', 'Ancient', 'Powerful'];
  const themeSuffixes = suffixes[theme as keyof typeof suffixes] || ['Wizard', 'Mage', 'Sage', 'Master', 'Guardian'];
  
  const prefix = themePrefixes[Math.floor(Math.random() * themePrefixes.length)];
  const suffix = themeSuffixes[Math.floor(Math.random() * themeSuffixes.length)];
  
  return `${prefix} ${suffix}`;
}

/**
 * Adds equipment to a wizard based on their level and archetype
 */
function addEquipment(wizard: Wizard, level: number, archetype: any): void {
  // Add wand with theme-appropriate bonuses
  wizard.equipment.wand = generateProceduralEquipment(level, 'hand');
  
  // Add robe with theme-appropriate bonuses
  wizard.equipment.robe = generateProceduralEquipment(level, 'body');
  
  // Add amulet if high enough level
  if (level >= 3) {
    wizard.equipment.amulet = generateProceduralEquipment(level, 'neck');
  }
  
  // Add rings if high enough level
  if (level >= 5) {
    wizard.equipment.ring1 = generateProceduralEquipment(level, 'finger');
  }
  
  if (level >= 10) {
    wizard.equipment.ring2 = generateProceduralEquipment(level, 'finger');
  }
  
  // Add archetype-specific equipment bonuses
  if (archetype.baseStats) {
    // Apply any archetype-specific equipment bonuses here
    // This could be expanded to add special equipment slots or bonuses
  }
}

/**
 * Generate a random magical creature based on player level and difficulty
 */
function generateMagicalCreature(playerLevel: number, difficulty: 'easy' | 'normal' | 'hard', theme?: string): Enemy {
  const creatureKey = Object.keys(magicalCreatures)[Math.floor(Math.random() * Object.keys(magicalCreatures).length)];
  const creature = magicalCreatures[creatureKey];
  const level = Math.max(1, playerLevel + Math.floor(Math.random() * 3) - 1);

  // Calculate base stats with difficulty multiplier
  const difficultyMultiplier = {
    easy: 0.8,
    normal: 1,
    hard: 1.2
  }[difficulty];

  const levelMultiplier = getLevelMultiplier(level) * difficultyMultiplier;
  const baseHealth = 100 * levelMultiplier;
  const baseMana = 80 * levelMultiplier;
  const health = Math.floor(baseHealth * (creature.baseStats.health / 100));
  const mana = Math.floor(baseMana * (creature.baseStats.mana / 80));

  // Generate spells based on creature type
  // Scale creature spells based on level so early encounters aren't overwhelming
  const scaleCreatureSpell = (spell: Spell): Spell => {
    const ratio = getSpellScale(level);
    const scaledEffects = spell.effects.map(effect => {
      if (effect.type === 'damage' || effect.type === 'healing') {
        return { ...effect, value: Math.round(effect.value * ratio) };
      }
      return effect;
    });
    return {
      ...spell,
      tier: Math.max(1, Math.ceil(level / 3)),
      effects: scaledEffects
    };
  };

  const spells: Spell[] = creature.thematicSpells.map(scaleCreatureSpell);

  // Calculate rewards based on difficulty and level
  const goldReward = Math.floor(150 * difficultyMultiplier * (1 + level * 0.1));
  const expReward = Math.floor(75 * difficultyMultiplier * (1 + level * 0.1));

  return {
    id: `creature_${Date.now()}`,
    name: creature.name,
    health,
    mana,
    maxHealth: health,
    maxMana: mana,
    baseMaxHealth: health,
    progressionMaxHealth: 0,
    equipmentMaxHealth: 0,
    totalMaxHealth: health,
    baseMaxMana: mana,
    progressionMaxMana: 0,
    equipmentMaxMana: 0,
    totalMaxMana: mana,
    level,
    spells,
    goldReward,
    expReward,
    weakness: creature.weaknesses[Math.floor(Math.random() * creature.weaknesses.length)],
    resistance: creature.resistances[Math.floor(Math.random() * creature.resistances.length)],
    imagePath: `/images/creatures/${creature.type}.jpg`,
    archetype: creature.type
  };
}

/**
 * Generate a random enemy (either wizard or magical creature)
 */
export function generateEnemy(playerLevel: number, difficulty: 'easy' | 'normal' | 'hard', theme?: string): Enemy {
  // The chance of a magical creature starts at 30% and increases by 0.1 percentage points per level, capping at 50%
  const baseCreatureChance = 0.3;
  const maxCreatureChance = 0.5;
  const creatureChance = Math.min(baseCreatureChance + 0.001 * (playerLevel - 1), maxCreatureChance);
  const isWizard = Math.random() >= creatureChance;
  return isWizard ? generateEnemyWizard(playerLevel, difficulty, theme) : generateMagicalCreature(playerLevel, difficulty, theme);
}

function generateThematicSpells(elements: string[], level: number): Spell[] {
  return elements.map(element => generateSpell(element, level));
}
