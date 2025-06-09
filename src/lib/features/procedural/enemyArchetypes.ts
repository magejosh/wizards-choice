import { ElementType } from '../../types/element-types';
import { Spell } from '../../types/spell-types';
import { getSpellsByList } from '../../spells/spellData';

export interface EnemyArchetype {
  id: string;
  name: string;
  description: string;
  theme: string;
  specialAbility: string;
  uniqueMechanic: string;
  weakness: ElementType | null;
  resistance: ElementType | null;
  baseStats: {
    healthMultiplier: number;
    manaMultiplier: number;
    manaRegenMultiplier: number;
  };
  /** Optional path to a 3D model for this archetype */
  modelPath?: string;
  getSpecialSpell: (level: number) => Promise<Spell>;
  getThematicSpells: (level: number) => Promise<Spell[]>;
}

async function fetchArchetypeSpells(id: string): Promise<{ special: Spell; thematic: Spell[] }> {
  const spells = await getSpellsByList(id);
  const special = spells.find(s => ['rare', 'epic', 'legendary'].includes(s.rarity)) || spells[0];
  return { special, thematic: spells.filter(s => s !== special) };
}

export const enemyArchetypes: Record<string, EnemyArchetype> = {
  necromancer: {
    id: 'necromancer',
    name: 'Necromancer',
    description: 'A dark wizard who commands the forces of death and undeath.',
    theme: 'death',
    specialAbility: 'Can summon undead minions',
    uniqueMechanic: 'Gains power when allies die',
    weakness: 'light',
    resistance: 'shadow',
    baseStats: {
      healthMultiplier: 1.2,
      manaMultiplier: 1.3,
      manaRegenMultiplier: 1.1
    },
    modelPath: '/assets/Skull.vrm',
    getSpecialSpell: async () => (await fetchArchetypeSpells('necromancer')).special,
    getThematicSpells: async () => (await fetchArchetypeSpells('necromancer')).thematic
  },

  timeWeaver: {
    id: 'timeWeaver',
    name: 'Time Weaver',
    description: 'A mysterious wizard who manipulates the flow of time.',
    theme: 'time',
    specialAbility: 'Can rewind turns or delay enemy actions',
    uniqueMechanic: 'Gains mana when time effects expire',
    weakness: null,
    resistance: null,
    baseStats: {
      healthMultiplier: 0.8,
      manaMultiplier: 1.5,
      manaRegenMultiplier: 1.3
    },
    modelPath: '/assets/Wizzir.vrm',
    getSpecialSpell: async () => (await fetchArchetypeSpells('timeWeaver')).special,
    getThematicSpells: async () => (await fetchArchetypeSpells('timeWeaver')).thematic
  },

  battleMage: {
    id: 'battleMage',
    name: 'Battle Mage',
    description: 'A warrior wizard who excels in close combat.',
    theme: 'combat',
    specialAbility: 'Enhanced mystic punch and weapon-based spells',
    uniqueMechanic: 'Gains temporary buffs when using weapon attacks',
    weakness: 'air',
    resistance: 'earth',
    baseStats: {
      healthMultiplier: 1.5,
      manaMultiplier: 0.8,
      manaRegenMultiplier: 1.0
    },
    modelPath: '/assets/Bloody.vrm',
    getSpecialSpell: async () => (await fetchArchetypeSpells('battleMage')).special,
    getThematicSpells: async () => (await fetchArchetypeSpells('battleMage')).thematic
  },

  illusionist: {
    id: 'illusionist',
    name: 'Illusionist',
    description: 'A master of deception and mind manipulation.',
    theme: 'illusion',
    specialAbility: 'Can create mirror images and confuse enemies',
    uniqueMechanic: 'Gains advantage when enemy is confused',
    weakness: 'light',
    resistance: 'arcane',
    baseStats: {
      healthMultiplier: 0.9,
      manaMultiplier: 1.2,
      manaRegenMultiplier: 1.1
    },
    modelPath: '/assets/David.vrm',
    getSpecialSpell: async () => (await fetchArchetypeSpells('illusionist')).special,
    getThematicSpells: async () => (await fetchArchetypeSpells('illusionist')).thematic
  },

  alchemist: {
    id: 'alchemist',
    name: 'Alchemist',
    description: 'A wizard who masters the art of potion brewing and chemical warfare.',
    theme: 'alchemy',
    specialAbility: 'Can throw potions with various effects',
    uniqueMechanic: 'Gains resources when potions are used',
    weakness: 'fire',
    resistance: 'nature',
    baseStats: {
      healthMultiplier: 1.0,
      manaMultiplier: 1.1,
      manaRegenMultiplier: 1.2
    },
    modelPath: '/assets/Pipe.vrm',
    getSpecialSpell: async () => (await fetchArchetypeSpells('alchemist')).special,
    getThematicSpells: async () => (await fetchArchetypeSpells('alchemist')).thematic
  }
};
