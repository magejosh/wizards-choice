import { ElementType, Spell, SpellEffect } from '../types';

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
  getSpecialSpell: (level: number) => Spell;
  getThematicSpells: (level: number) => Spell[];
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
    resistance: 'dark',
    baseStats: {
      healthMultiplier: 1.2,
      manaMultiplier: 1.3,
      manaRegenMultiplier: 1.1
    },
    modelPath: '/assets/Skull.vrm',
    getSpecialSpell: (level: number): Spell => ({
      id: `spell_summon_undead_${Date.now()}`,
      name: 'Summon Undead Minion',
      type: 'summon',
      element: 'dark',
      tier: Math.min(Math.ceil(level / 3), 10),
      manaCost: 25 + level * 2,
      description: 'Summons an undead minion to fight for you.',
      effects: [
        {
          type: 'summon',
          value: 1,
          target: 'self',
          element: 'dark',
          duration: 3
        }
      ],
      imagePath: '/images/spells/necromancer-summon.jpg'
    }),
    getThematicSpells: (level: number): Spell[] => {
      const spells: Spell[] = [];
      const baseValue = 5 + level * 1.5;
      
      // Death Bolt
      spells.push({
        id: `spell_death_bolt_${Date.now()}`,
        name: 'Death Bolt',
        type: 'damage',
        element: 'dark',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 20 + level,
        description: 'A bolt of dark energy that saps life force.',
        effects: [
          {
            type: 'damage',
            value: baseValue,
            target: 'enemy',
            element: 'dark'
          },
          {
            type: 'healing',
            value: baseValue * 0.3,
            target: 'self',
            element: 'dark'
          }
        ],
        imagePath: '/images/spells/necromancer-bolt.jpg'
      });

      // Soul Drain
      spells.push({
        id: `spell_soul_drain_${Date.now()}`,
        name: 'Soul Drain',
        type: 'damage',
        element: 'dark',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 30 + level * 2,
        description: 'Drains the target\'s soul, dealing damage and healing yourself.',
        effects: [
          {
            type: 'damage',
            value: baseValue * 1.5,
            target: 'enemy',
            element: 'dark'
          },
          {
            type: 'healing',
            value: baseValue * 0.5,
            target: 'self',
            element: 'dark'
          }
        ],
        imagePath: '/images/spells/necromancer-drain.jpg'
      });

      return spells;
    }
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
    getSpecialSpell: (level: number): Spell => ({
      id: `spell_time_rewind_${Date.now()}`,
      name: 'Time Rewind',
      type: 'utility',
      element: 'arcane',
      tier: Math.min(Math.ceil(level / 3), 10),
      manaCost: 40 + level * 3,
      description: 'Rewinds time to undo the last action.',
      effects: [
        {
          type: 'timeRewind',
          value: 1,
          target: 'self',
          element: 'arcane',
          duration: 1
        }
      ],
      imagePath: '/images/spells/timeweaver-rewind.jpg'
    }),
    getThematicSpells: (level: number): Spell[] => {
      const spells: Spell[] = [];
      const baseValue = 5 + level * 1.5;
      
      // Time Stop
      spells.push({
        id: `spell_time_stop_${Date.now()}`,
        name: 'Time Stop',
        type: 'control',
        element: 'arcane',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 30 + level * 2,
        description: 'Freezes time briefly, delaying enemy actions.',
        effects: [
          {
            type: 'delay',
            value: 2,
            target: 'enemy',
            element: 'arcane',
            duration: 1
          }
        ],
        imagePath: '/images/spells/timeweaver-stop.jpg'
      });

      // Temporal Echo
      spells.push({
        id: `spell_temporal_echo_${Date.now()}`,
        name: 'Temporal Echo',
        type: 'damage',
        element: 'arcane',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 25 + level * 2,
        description: 'Creates an echo of your last spell.',
        effects: [
          {
            type: 'spellEcho',
            value: 1,
            target: 'self',
            element: 'arcane',
            duration: 1
          }
        ],
        imagePath: '/images/spells/timeweaver-echo.jpg'
      });

      return spells;
    }
  },

  battleMage: {
    id: 'battleMage',
    name: 'Battle Mage',
    description: 'A warrior wizard who excels in close combat.',
    theme: 'combat',
    specialAbility: 'Enhanced mystic punch and weapon-based spells',
    uniqueMechanic: 'Gains temporary buffs when using weapon attacks',
    weakness: 'ranged',
    resistance: 'physical',
    baseStats: {
      healthMultiplier: 1.5,
      manaMultiplier: 0.8,
      manaRegenMultiplier: 1.0
    },
    modelPath: '/assets/Bloody.vrm',
    getSpecialSpell: (level: number): Spell => ({
      id: `spell_weapon_enhancement_${Date.now()}`,
      name: 'Weapon Enhancement',
      type: 'buff',
      element: 'physical',
      tier: Math.min(Math.ceil(level / 3), 10),
      manaCost: 20 + level,
      description: 'Enhances your weapon with magical power.',
      effects: [
        {
          type: 'damageBonus',
          value: 10 + level,
          target: 'self',
          element: 'physical',
          duration: 3
        }
      ],
      imagePath: '/images/spells/battlemage-enhance.jpg'
    }),
    getThematicSpells: (level: number): Spell[] => {
      const spells: Spell[] = [];
      const baseValue = 5 + level * 1.5;
      
      // Blade Storm
      spells.push({
        id: `spell_blade_storm_${Date.now()}`,
        name: 'Blade Storm',
        type: 'damage',
        element: 'physical',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 25 + level * 2,
        description: 'Creates a storm of magical blades.',
        effects: [
          {
            type: 'damage',
            value: baseValue * 1.2,
            target: 'enemy',
            element: 'physical'
          }
        ],
        imagePath: '/images/spells/battlemage-storm.jpg'
      });

      // Combat Surge
      spells.push({
        id: `spell_combat_surge_${Date.now()}`,
        name: 'Combat Surge',
        type: 'buff',
        element: 'physical',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 30 + level * 2,
        description: 'Grants temporary combat prowess.',
        effects: [
          {
            type: 'damageBonus',
            value: 15 + level,
            target: 'self',
            element: 'physical',
            duration: 2
          },
          {
            type: 'defense',
            value: 5 + level,
            target: 'self',
            element: 'physical',
            duration: 2
          }
        ],
        imagePath: '/images/spells/battlemage-surge.jpg'
      });

      return spells;
    }
  },

  illusionist: {
    id: 'illusionist',
    name: 'Illusionist',
    description: 'A master of deception and mind manipulation.',
    theme: 'illusion',
    specialAbility: 'Can create mirror images and confuse enemies',
    uniqueMechanic: 'Gains advantage when enemy is confused',
    weakness: 'true_sight',
    resistance: 'mental',
    baseStats: {
      healthMultiplier: 0.9,
      manaMultiplier: 1.2,
      manaRegenMultiplier: 1.1
    },
    modelPath: '/assets/David.vrm',
    getSpecialSpell: (level: number): Spell => ({
      id: `spell_mirror_image_${Date.now()}`,
      name: 'Mirror Image',
      type: 'summon',
      element: 'arcane',
      tier: Math.min(Math.ceil(level / 3), 10),
      manaCost: 25 + level * 2,
      description: 'Creates illusory copies of yourself.',
      effects: [
        {
          type: 'summon',
          value: 2,
          target: 'self',
          element: 'arcane',
          duration: 3
        }
      ],
      imagePath: '/images/spells/illusionist-mirror.jpg'
    }),
    getThematicSpells: (level: number): Spell[] => {
      const spells: Spell[] = [];
      const baseValue = 5 + level * 1.5;
      
      // Confusion
      spells.push({
        id: `spell_confusion_${Date.now()}`,
        name: 'Confusion',
        type: 'control',
        element: 'mental',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 20 + level,
        description: 'Confuses the target, making them attack randomly.',
        effects: [
          {
            type: 'confusion',
            value: 1,
            target: 'enemy',
            element: 'mental',
            duration: 2
          }
        ],
        imagePath: '/images/spells/illusionist-confusion.jpg'
      });

      // Phantasmal Force
      spells.push({
        id: `spell_phantasmal_force_${Date.now()}`,
        name: 'Phantasmal Force',
        type: 'damage',
        element: 'mental',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 30 + level * 2,
        description: 'Creates a powerful illusion that causes real damage.',
        effects: [
          {
            type: 'damage',
            value: baseValue * 1.3,
            target: 'enemy',
            element: 'mental'
          }
        ],
        imagePath: '/images/spells/illusionist-phantasm.jpg'
      });

      return spells;
    }
  },

  alchemist: {
    id: 'alchemist',
    name: 'Alchemist',
    description: 'A wizard who masters the art of potion brewing and chemical warfare.',
    theme: 'alchemy',
    specialAbility: 'Can throw potions with various effects',
    uniqueMechanic: 'Gains resources when potions are used',
    weakness: 'fire',
    resistance: 'poison',
    baseStats: {
      healthMultiplier: 1.0,
      manaMultiplier: 1.1,
      manaRegenMultiplier: 1.2
    },
    modelPath: '/assets/Pipe.vrm',
    getSpecialSpell: (level: number): Spell => ({
      id: `spell_potion_throw_${Date.now()}`,
      name: 'Potion Throw',
      type: 'damage',
      element: 'poison',
      tier: Math.min(Math.ceil(level / 3), 10),
      manaCost: 20 + level,
      description: 'Throws a damaging potion at the enemy.',
      effects: [
        {
          type: 'damage',
          value: 15 + level * 2,
          target: 'enemy',
          element: 'poison',
          duration: 2
        }
      ],
      imagePath: '/images/spells/alchemist-potion.jpg'
    }),
    getThematicSpells: (level: number): Spell[] => {
      const spells: Spell[] = [];
      const baseValue = 5 + level * 1.5;
      
      // Acid Splash
      spells.push({
        id: `spell_acid_splash_${Date.now()}`,
        name: 'Acid Splash',
        type: 'damage',
        element: 'poison',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 15 + level,
        description: 'Splashes acid on the target, dealing damage over time.',
        effects: [
          {
            type: 'damage',
            value: baseValue * 0.8,
            target: 'enemy',
            element: 'poison',
            duration: 2
          }
        ],
        imagePath: '/images/spells/alchemist-acid.jpg'
      });

      // Healing Elixir
      spells.push({
        id: `spell_healing_elixir_${Date.now()}`,
        name: 'Healing Elixir',
        type: 'healing',
        element: 'poison',
        tier: Math.min(Math.ceil(level / 3), 10),
        manaCost: 25 + level * 2,
        description: 'Creates a healing elixir that restores health over time.',
        effects: [
          {
            type: 'healing',
            value: baseValue * 1.2,
            target: 'self',
            element: 'poison',
            duration: 3
          }
        ],
        imagePath: '/images/spells/alchemist-heal.jpg'
      });

      return spells;
    }
  }
}; 