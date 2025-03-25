import { Spell } from '../types';
import { generateSpellId } from './spellData';

/**
 * Rarity levels for special spells
 */
export type SpellRarity = 'uncommon' | 'rare' | 'legendary';

/**
 * Interface extending Spell with rarity property
 */
export interface SpecialSpell extends Spell {
  rarity: SpellRarity;
  howToObtain?: string; // Information on how to obtain this spell
}

/**
 * Get all uncommon spells
 * @returns Array of uncommon spells
 */
export function getUncommonSpells(): SpecialSpell[] {
  return [
    createEssenceTheftSpell(),
    createAstralChainSpell(),
    createMagneticPulseSpell(),
    createResonanceStrikeSpell(),
    createHoneyedWordsSpell(),
    createLifebloodRitualSpell(),
    createElementalHarmonySpell(),
    createRiftShatterSpell(),
    createChronoSkipSpell(),
    createMirrorImageSpell(),
  ];
}

/**
 * Get all rare spells
 * @returns Array of rare spells
 */
export function getRareSpells(): SpecialSpell[] {
  return [
    createEternalWinterSpell(),
    createVoidRiftSpell(),
    createSoulshatterSpell(),
    createDragonflameSpell(),
    createCelestialBlessSpell(),
    createAbsoluteSilenceSpell(),
    createPlasmaStormSpell(),
    createRunicBindingSpell(),
    createEldritchBarrierSpell(),
    createInsanityWhisperSpell(),
  ];
}

/**
 * Get all legendary spells
 * @returns Array of legendary spells - the rarest and most powerful
 */
export function getLegendarySpells(): SpecialSpell[] {
  return [
    createWorldEndingFlameSpell(),
    createGazeOfTheVoidSpell(),
    createSingularityNexusSpell(),
    createAscendantApotheosisSpell(),
    createDivineJudgmentSpell(),
  ];
}

/**
 * Get all special spells
 * @returns Array of all special spells
 */
export function getAllSpecialSpells(): SpecialSpell[] {
  return [
    ...getUncommonSpells(),
    ...getRareSpells(),
    ...getLegendarySpells(),
  ];
}

// Uncommon Spells

function createEssenceTheftSpell(): SpecialSpell {
  return {
    id: generateSpellId('Essence Theft'),
    name: 'Essence Theft',
    type: 'damage',
    element: 'arcane',
    tier: 3,
    manaCost: 40,
    description: 'Steals the essence of the enemy, healing the caster for a portion of the damage dealt.',
    effects: [
      {
        type: 'damage',
        value: 40,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'healing',
        value: 25,
        target: 'self',
        element: 'arcane',
      },
    ],
    rarity: 'uncommon',
    howToObtain: 'Defeat a Mana Vampire in the Whispering Caverns',
    imagePath: '/images/spells/special/essence-theft.jpg',
  };
}

function createAstralChainSpell(): SpecialSpell {
  return {
    id: generateSpellId('Astral Chain'),
    name: 'Astral Chain',
    type: 'damage',
    element: 'arcane',
    tier: 4,
    manaCost: 45,
    description: 'Binds the enemy with chains of astral energy, dealing damage and preventing them from using certain abilities.',
    effects: [
      {
        type: 'damage',
        value: 35,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 15,
        duration: 3,
        target: 'enemy',
        element: 'arcane',
      },
      // Would also apply a "silenced" effect in extended implementation
    ],
    rarity: 'uncommon',
    howToObtain: 'Complete the "Astral Binding" side quest in the Mystic Academy',
    imagePath: '/images/spells/special/astral-chain.jpg',
  };
}

function createMagneticPulseSpell(): SpecialSpell {
  return {
    id: generateSpellId('Magnetic Pulse'),
    name: 'Magnetic Pulse',
    type: 'damage',
    element: 'air',
    tier: 2,
    manaCost: 30,
    description: 'Releases a concentrated magnetic pulse that damages enemies wearing metal armor more severely.',
    effects: [
      {
        type: 'damage',
        value: 45, // Higher base damage to compensate for situational benefit
        target: 'enemy',
        element: 'air',
      },
      // Would have conditional logic for additional damage vs. metal armor
    ],
    rarity: 'uncommon',
    howToObtain: 'Found in ancient technology in the Rusted Ruins',
    imagePath: '/images/spells/special/magnetic-pulse.jpg',
  };
}

function createResonanceStrikeSpell(): SpecialSpell {
  return {
    id: generateSpellId('Resonance Strike'),
    name: 'Resonance Strike',
    type: 'damage',
    element: 'air',
    tier: 5,
    manaCost: 50,
    description: 'Strikes the enemy with a precisely tuned resonant frequency, bypassing shields and barriers.',
    effects: [
      {
        type: 'damage',
        value: 60,
        target: 'enemy',
        element: 'air',
      },
      // Would have shield-bypassing logic in extended implementation
    ],
    rarity: 'uncommon',
    howToObtain: 'Reward from the Resonant Crystal collection quest',
    imagePath: '/images/spells/special/resonance-strike.jpg',
  };
}

function createHoneyedWordsSpell(): SpecialSpell {
  return {
    id: generateSpellId('Honeyed Words'),
    name: 'Honeyed Words',
    type: 'buff',
    element: 'arcane',
    tier: 1,
    manaCost: 15,
    description: 'A subtle enchantment that makes your words more persuasive, potentially avoiding combat entirely.',
    effects: [
      {
        type: 'statModifier',
        value: 30, // Improves persuasion checks
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
    ],
    rarity: 'uncommon',
    howToObtain: 'Learned from the Silvertongue Bard in Verdant City',
    imagePath: '/images/spells/special/honeyed-words.jpg',
  };
}

function createLifebloodRitualSpell(): SpecialSpell {
  return {
    id: generateSpellId('Lifeblood Ritual'),
    name: 'Lifeblood Ritual',
    type: 'healing',
    element: 'earth',
    tier: 4,
    manaCost: 35,
    description: 'A forbidden healing ritual that draws upon your own lifeforce to heal grievous wounds instantly.',
    effects: [
      {
        type: 'healing',
        value: 100, // Much higher healing than normal
        target: 'self',
        element: 'earth',
      },
      {
        type: 'damage',
        value: 30, // Cost to cast beyond mana - life sacrifice
        target: 'self',
        element: 'earth',
      },
    ],
    rarity: 'uncommon',
    howToObtain: 'Found in the Forbidden Grimoire in the Ancient Library',
    imagePath: '/images/spells/special/lifeblood-ritual.jpg',
  };
}

function createElementalHarmonySpell(): SpecialSpell {
  return {
    id: generateSpellId('Elemental Harmony'),
    name: 'Elemental Harmony',
    type: 'buff',
    element: 'arcane',
    tier: 3,
    manaCost: 45,
    description: 'Harmonizes with the elements around you, granting resistance to all elemental damage for a short time.',
    effects: [
      {
        type: 'statModifier',
        value: -20, // Resistance to all elements
        duration: 4,
        target: 'self',
        element: 'arcane',
      },
    ],
    rarity: 'uncommon',
    howToObtain: 'Reward for completing the Elemental Trials',
    imagePath: '/images/spells/special/elemental-harmony.jpg',
  };
}

function createRiftShatterSpell(): SpecialSpell {
  return {
    id: generateSpellId('Rift Shatter'),
    name: 'Rift Shatter',
    type: 'damage',
    element: 'arcane',
    tier: 5,
    manaCost: 60,
    description: 'Shatters the fabric between dimensions, causing chaotic arcane energy to flood the area and damage all enemies.',
    effects: [
      {
        type: 'damage',
        value: 70,
        target: 'enemy',
        element: 'arcane',
      },
      // Would affect all enemies in extended implementation
    ],
    rarity: 'uncommon',
    howToObtain: 'Dropped by the Dimensional Ripper boss',
    imagePath: '/images/spells/special/rift-shatter.jpg',
  };
}

function createChronoSkipSpell(): SpecialSpell {
  return {
    id: generateSpellId('Chrono Skip'),
    name: 'Chrono Skip',
    type: 'buff',
    element: 'arcane',
    tier: 4,
    manaCost: 70,
    description: 'Skips forward in time momentarily, allowing you to avoid an incoming attack with certainty.',
    effects: [
      {
        type: 'statModifier',
        value: -100, // Complete evasion of next attack
        duration: 1,
        target: 'self',
        element: 'arcane',
      },
    ],
    rarity: 'uncommon',
    howToObtain: 'Found in the Clockwork Tower',
    imagePath: '/images/spells/special/chrono-skip.jpg',
  };
}

function createMirrorImageSpell(): SpecialSpell {
  return {
    id: generateSpellId('Mirror Image'),
    name: 'Mirror Image',
    type: 'buff',
    element: 'arcane',
    tier: 3,
    manaCost: 40,
    description: 'Creates illusory duplicates of yourself that confuse enemies and absorb attacks.',
    effects: [
      {
        type: 'statModifier',
        value: -40, // Reduced damage from attacks
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
    ],
    rarity: 'uncommon',
    howToObtain: 'Learned from the Master Illusionist in the Hall of Mirrors',
    imagePath: '/images/spells/special/mirror-image.jpg',
  };
}

// Rare Spells

function createEternalWinterSpell(): SpecialSpell {
  return {
    id: generateSpellId('Eternal Winter'),
    name: 'Eternal Winter',
    type: 'damage',
    element: 'water',
    tier: 6,
    manaCost: 70,
    description: 'Summons a fragment of eternal winter from the far north, freezing enemies solid and dealing severe cold damage over time.',
    effects: [
      {
        type: 'damage',
        value: 60,
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'statusEffect',
        value: 30,
        duration: 5,
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'statModifier',
        value: 40, // Slows enemy actions
        duration: 3,
        target: 'enemy',
        element: 'water',
      },
    ],
    rarity: 'rare',
    howToObtain: 'Defeat the Frost Giant King in the Glacial Peaks',
    imagePath: '/images/spells/special/eternal-winter.jpg',
  };
}

function createVoidRiftSpell(): SpecialSpell {
  return {
    id: generateSpellId('Void Rift'),
    name: 'Void Rift',
    type: 'damage',
    element: 'arcane',
    tier: 7,
    manaCost: 100,
    description: 'Opens a rift to the Void, a place of nothingness that consumes matter and energy alike. Can sometimes banish enemies entirely.',
    effects: [
      {
        type: 'damage',
        value: 150,
        target: 'enemy',
        element: 'arcane',
      },
      // Would have a small chance to instantly defeat non-boss enemies
    ],
    rarity: 'rare',
    howToObtain: 'Complete the "Beyond the Veil" quest line',
    imagePath: '/images/spells/special/void-rift.jpg',
  };
}

function createSoulshatterSpell(): SpecialSpell {
  return {
    id: generateSpellId('Soulshatter'),
    name: 'Soulshatter',
    type: 'damage',
    element: 'arcane',
    tier: 6,
    manaCost: 80,
    description: 'Attacks the very soul of the enemy, dealing damage proportional to their remaining health and weakening them severely.',
    effects: [
      {
        type: 'damage',
        value: 100, // Base damage, would be modified by enemy health
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 50, // Weakens enemy
        duration: 4,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    rarity: 'rare',
    howToObtain: 'Defeat the Soulsplitter Demon in the Abyssal Depths',
    imagePath: '/images/spells/special/soulshatter.jpg',
  };
}

function createDragonflameSpell(): SpecialSpell {
  return {
    id: generateSpellId('Dragonflame'),
    name: 'Dragonflame',
    type: 'damage',
    element: 'fire',
    tier: 6,
    manaCost: 75,
    description: 'Channels the ancient fire of dragons, burning through all defenses and continuing to burn for several turns.',
    effects: [
      {
        type: 'damage',
        value: 85,
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'statusEffect',
        value: 30,
        duration: 4,
        target: 'enemy',
        element: 'fire',
      },
      // Would ignore fire resistance in extended implementation
    ],
    rarity: 'rare',
    howToObtain: 'Defeat an Ancient Dragon or complete the Dragon\'s Pact quest',
    imagePath: '/images/spells/special/dragonflame.jpg',
  };
}

function createCelestialBlessSpell(): SpecialSpell {
  return {
    id: generateSpellId('Celestial Blessing'),
    name: 'Celestial Blessing',
    type: 'healing',
    element: 'arcane',
    tier: 7,
    manaCost: 85,
    description: 'Calls upon celestial forces to bless the caster, providing healing, protection, and enhanced magical abilities.',
    effects: [
      {
        type: 'healing',
        value: 100,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: -30, // Protection
        duration: 5,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 40, // Enhanced spell power
        duration: 5,
        target: 'self',
        element: 'arcane',
      },
    ],
    rarity: 'rare',
    howToObtain: 'Complete the Celestial Temple trials',
    imagePath: '/images/spells/special/celestial-blessing.jpg',
  };
}

function createAbsoluteSilenceSpell(): SpecialSpell {
  return {
    id: generateSpellId('Absolute Silence'),
    name: 'Absolute Silence',
    type: 'damage',
    element: 'arcane',
    tier: 6,
    manaCost: 70,
    description: 'Envelops the enemy in a field of absolute silence where no magic can function, preventing them from casting spells.',
    effects: [
      {
        type: 'damage',
        value: 50,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 100, // Prevents spellcasting
        duration: 2,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    rarity: 'rare',
    howToObtain: 'Reward from the Mage Hunter faction',
    imagePath: '/images/spells/special/absolute-silence.jpg',
  };
}

function createPlasmaStormSpell(): SpecialSpell {
  return {
    id: generateSpellId('Plasma Storm'),
    name: 'Plasma Storm',
    type: 'damage',
    element: 'fire',
    tier: 7,
    manaCost: 95,
    description: 'Creates a swirling vortex of superheated plasma that deals massive damage to enemies caught within it.',
    effects: [
      {
        type: 'damage',
        value: 120,
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'statusEffect',
        value: 40,
        duration: 3,
        target: 'enemy',
        element: 'fire',
      },
      // Would damage all enemies in extended implementation
    ],
    rarity: 'rare',
    howToObtain: 'Defeat the Star Forger in the Celestial Forge',
    imagePath: '/images/spells/special/plasma-storm.jpg',
  };
}

function createRunicBindingSpell(): SpecialSpell {
  return {
    id: generateSpellId('Runic Binding'),
    name: 'Runic Binding',
    type: 'buff',
    element: 'earth',
    tier: 6,
    manaCost: 60,
    description: 'Inscribes ancient protective runes on the caster, granting exceptional defense against all forms of damage.',
    effects: [
      {
        type: 'statModifier',
        value: -60, // Strong defense
        duration: 6,
        target: 'self',
        element: 'earth',
      },
      {
        type: 'healing',
        value: 20, // Minor ongoing healing
        target: 'self',
        element: 'earth',
      },
    ],
    rarity: 'rare',
    howToObtain: 'Complete the Rune Master\'s trials in the Runic Chambers',
    imagePath: '/images/spells/special/runic-binding.jpg',
  };
}

function createEldritchBarrierSpell(): SpecialSpell {
  return {
    id: generateSpellId('Eldritch Barrier'),
    name: 'Eldritch Barrier',
    type: 'buff',
    element: 'arcane',
    tier: 7,
    manaCost: 80,
    description: 'Creates a protective barrier of eldritch energy that absorbs damage and reflects a portion back to attackers.',
    effects: [
      {
        type: 'statModifier',
        value: -70, // Absorbs damage
        duration: 4,
        target: 'self',
        element: 'arcane',
      },
      // Would reflect damage to attackers in extended implementation
    ],
    rarity: 'rare',
    howToObtain: 'Found in the Tome of Eldritch Wonders in the Forbidden Library',
    imagePath: '/images/spells/special/eldritch-barrier.jpg',
  };
}

function createInsanityWhisperSpell(): SpecialSpell {
  return {
    id: generateSpellId('Insanity Whisper'),
    name: 'Insanity Whisper',
    type: 'damage',
    element: 'arcane',
    tier: 7,
    manaCost: 90,
    description: 'Whispers secrets of cosmic horror directly into the enemy\'s mind, causing them to attack themselves or allies in madness.',
    effects: [
      {
        type: 'damage',
        value: 70,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 60, // Confusion/madness effect
        duration: 3,
        target: 'enemy',
        element: 'arcane',
      },
      // Would cause enemies to attack themselves or allies in extended implementation
    ],
    rarity: 'rare',
    howToObtain: 'Defeat the Mind Flayer Elder in the Darkest Depths',
    imagePath: '/images/spells/special/insanity-whisper.jpg',
  };
}

// Legendary Spells - The rarest and most powerful

function createWorldEndingFlameSpell(): SpecialSpell {
  return {
    id: generateSpellId('World-Ending Flame'),
    name: 'World-Ending Flame',
    type: 'damage',
    element: 'fire',
    tier: 9,
    manaCost: 150,
    description: 'Summons the primordial flame that will one day consume the world, dealing catastrophic damage to all enemies.',
    effects: [
      {
        type: 'damage',
        value: 300,
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'statusEffect',
        value: 100, // Devastating burning
        duration: 3,
        target: 'enemy',
        element: 'fire',
      },
      // Would damage all enemies in extended implementation
    ],
    rarity: 'legendary',
    howToObtain: 'Defeat the Apocalypse Dragon, an optional superboss',
    imagePath: '/images/spells/special/world-ending-flame.jpg',
  };
}

function createGazeOfTheVoidSpell(): SpecialSpell {
  return {
    id: generateSpellId('Gaze of the Void'),
    name: 'Gaze of the Void',
    type: 'damage',
    element: 'arcane',
    tier: 9,
    manaCost: 180,
    description: 'Channels the incomprehensible power of the Void itself, potentially erasing enemies from existence.',
    effects: [
      {
        type: 'damage',
        value: 250,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 200, // Nullifies defenses
        duration: 2,
        target: 'enemy',
        element: 'arcane',
      },
      // Would have a chance to instantly defeat non-boss enemies
    ],
    rarity: 'legendary',
    howToObtain: 'Complete the secret "Void Walker" quest line',
    imagePath: '/images/spells/special/gaze-of-the-void.jpg',
  };
}

function createSingularityNexusSpell(): SpecialSpell {
  return {
    id: generateSpellId('Singularity Nexus'),
    name: 'Singularity Nexus',
    type: 'damage',
    element: 'arcane',
    tier: 10,
    manaCost: 220,
    description: 'Creates a nexus of singularities that bend spacetime itself, dealing massive damage to all enemies and distorting reality.',
    effects: [
      {
        type: 'damage',
        value: 400, // Extreme damage
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 150, // Reality distortion damage
        duration: 3,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'damage',
        value: 100, // Backlash damage from manipulating reality
        target: 'self',
        element: 'arcane',
      },
      // Would damage all enemies in extended implementation
    ],
    rarity: 'legendary',
    howToObtain: 'Combine three fragments of the Cosmic Keystone found in hidden locations',
    imagePath: '/images/spells/special/singularity-nexus.jpg',
  };
}

function createAscendantApotheosisSpell(): SpecialSpell {
  return {
    id: generateSpellId('Ascendant Apotheosis'),
    name: 'Ascendant Apotheosis',
    type: 'buff',
    element: 'arcane',
    tier: 10,
    manaCost: 200,
    description: 'Temporarily ascends the caster to a higher plane of existence, granting godlike power for a brief moment.',
    effects: [
      {
        type: 'statModifier',
        value: -200, // Complete invulnerability
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 200, // Maximum spell power
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'manaRestore',
        value: 500, // Full mana restore
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'healing',
        value: 500, // Full health restore
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 1, // Extra turn
        duration: 3, // Three extra turns
        target: 'self',
        element: 'arcane',
      },
    ],
    rarity: 'legendary',
    howToObtain: 'Complete the hidden "Path to Transcendence" quest line',
    imagePath: '/images/spells/special/ascendant-apotheosis.jpg',
  };
}

function createDivineJudgmentSpell(): SpecialSpell {
  return {
    id: generateSpellId('Divine Judgment'),
    name: 'Divine Judgment',
    type: 'damage',
    element: 'arcane',
    tier: 10,
    manaCost: 250,
    description: 'Calls down divine judgment upon enemies, dealing damage proportional to their misdeeds and evil within them.',
    effects: [
      {
        type: 'damage',
        value: 500, // Base damage, would be modified by enemy type
        target: 'enemy',
        element: 'arcane',
      },
      // Would deal more damage to "evil" enemies in extended implementation
    ],
    rarity: 'legendary',
    howToObtain: 'Earn the favor of the God of Justice by completing all righteous quests',
    imagePath: '/images/spells/special/divine-judgment.jpg',
  };
}

// Enemy-Only Spells
// These could be implemented in a separate file if needed 