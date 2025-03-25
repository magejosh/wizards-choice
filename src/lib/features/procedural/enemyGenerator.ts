// src/lib/features/procedural/enemyGenerator.ts
import { Enemy, EnemyArchetype, Spell, Equipment, ElementType, EquipmentSlot, Wizard } from '../../types';
import { magicalCreatures } from './magicalCreatures';
import { enemyArchetypes } from './enemyArchetypes';
import { generateProceduralEquipment } from './equipmentGenerator';
import { getRandomEquipment } from '../../equipment/equipmentData';
import { generateSpell } from './spellGenerator';

/**
 * Generates a procedural enemy wizard based on player level and difficulty
 * @param playerLevel The player's current level
 * @param difficulty The game difficulty
 * @param theme Optional theme for the enemy wizard (element or specialty)
 * @returns A procedurally generated enemy wizard
 */
function generateEnemyWizard(playerLevel: number, difficulty: 'easy' | 'normal' | 'hard', theme?: string): Enemy {
  const archetypeKey = Object.keys(enemyArchetypes)[Math.floor(Math.random() * Object.keys(enemyArchetypes).length)];
  const archetype = enemyArchetypes[archetypeKey];
  const level = Math.max(1, playerLevel + Math.floor(Math.random() * 3) - 1);

  // Calculate base stats with difficulty multiplier
  const difficultyMultiplier = {
    easy: 0.8,
    normal: 1,
    hard: 1.2
  }[difficulty];

  const baseHealth = 100 * (1 + level * 0.1) * difficultyMultiplier;
  const baseMana = 80 * (1 + level * 0.1) * difficultyMultiplier;
  const health = Math.floor(baseHealth * archetype.baseStats.healthMultiplier);
  const mana = Math.floor(baseMana * archetype.baseStats.manaMultiplier);

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
    level,
    spells,
    goldReward,
    expReward,
    weakness: archetype.weakness || undefined,
    resistance: archetype.resistance || undefined,
    imagePath: `/images/enemies/${archetype.id}.jpg`,
    equipment,
    archetype: archetype.id
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
  wizard.equipment.wand = getRandomEquipment(level);
  
  // Add robe with theme-appropriate bonuses
  wizard.equipment.robe = getRandomEquipment(level);
  
  // Add amulet if high enough level
  if (level >= 3) {
    wizard.equipment.amulet = getRandomEquipment(level);
  }
  
  // Add rings if high enough level
  if (level >= 5) {
    wizard.equipment.ring1 = getRandomEquipment(level);
  }
  
  if (level >= 10) {
    wizard.equipment.ring2 = getRandomEquipment(level);
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

  const baseHealth = 100 * (1 + level * 0.1) * difficultyMultiplier;
  const baseMana = 80 * (1 + level * 0.1) * difficultyMultiplier;
  const health = Math.floor(baseHealth * (creature.baseStats.health / 100));
  const mana = Math.floor(baseMana * (creature.baseStats.mana / 80));

  // Generate spells based on creature type
  const spells: Spell[] = [...creature.thematicSpells];

  // Calculate rewards based on difficulty and level
  const goldReward = Math.floor(150 * difficultyMultiplier * (1 + level * 0.1));
  const expReward = Math.floor(75 * difficultyMultiplier * (1 + level * 0.1));

  return {
    id: `creature_${Date.now()}`,
    name: creature.name,
    health,
    mana,
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
  // 70% chance for wizard, 30% chance for magical creature
  const isWizard = Math.random() < 0.7;
  return isWizard ? generateEnemyWizard(playerLevel, difficulty, theme) : generateMagicalCreature(playerLevel, difficulty, theme);
}

function generateThematicSpells(elements: ElementType[], level: number): Spell[] {
  return elements.map(element => generateSpell(element, level));
}
