// src/lib/spells/spellData.ts
import { Spell, SpellEffect, ElementType, SpellType } from '../types';

/**
 * Generate a unique ID for a spell
 */
export function generateSpellId(name: string): string {
  return `spell_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now().toString(36)}`;
}

/**
 * Get the default spells that a player starts with
 * @returns Array of default spells
 */
export function getDefaultSpells(): Spell[] {
  // 3 default spells + 2 random Tier 1 spells
  const defaultSpells = [
    createFireboltSpell(),
    createArcaneShieldSpell(),
    createMinorHealingSpell(),
  ];
  
  // Add 2 random Tier 1 spells
  const randomSpells = getTier1Spells()
    .filter(spell => !defaultSpells.some(s => s.name === spell.name))
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);
  
  return [...defaultSpells, ...randomSpells];
}

/**
 * Get all Tier 1 spells (Cantrips)
 * @returns Array of Tier 1 spells
 */
export function getTier1Spells(): Spell[] {
  return [
    createFireboltSpell(),
    createArcaneShieldSpell(),
    createMinorHealingSpell(),
    createFrostRaySpell(),
    createArcaneBlastSpell(),
    createNaturesTouchSpell(),
    createShadowStrikeSpell(),
    createLightningJoltSpell(),
    createEarthTremorSpell(),
    createMysticInsightSpell(),
  ];
}

/**
 * Get all Tier 2 spells
 * @returns Array of Tier 2 spells
 */
export function getTier2Spells(): Spell[] {
  return [
    createFireballSpell(),
    createIceBarrierSpell(),
    createRejuvenationSpell(),
    createArcaneArmorySpell(),
    createWindBlastSpell(),
    createVenomSpraySpell(),
    createThunderclaspSpell(),
    createEarthShieldSpell(),
    createLifedrainSpell(),
    createManaStealSpell(),
  ];
}

/**
 * Get all Tier 3 spells
 * @returns Array of Tier 3 spells
 */
export function getTier3Spells(): Spell[] {
  return [
    createInfernoSpell(),
    createFrostNovaSpell(),
    createNaturesBlessingSpell(),
    createArcaneSurgeSpell(),
    createHurricaneSpell(),
    createEarthquakeSpell(),
    createShadowFormSpell(),
    createChainLightningSpell(),
    createVitalityTransferSpell(),
    createManaFluxSpell(),
  ];
}

/**
 * Get all Tier 4 spells
 * @returns Array of Tier 4 spells
 */
export function getTier4Spells(): Spell[] {
  return [
    createMeteorStrikeSpell(),
    createBlizzardSpell(),
    createArcaneExplosionSpell(),
    createGaleForceSpell(),
    createEarthsEmbrace(),
    createVoidRiftSpell(),
    createRagingThunderstormSpell(),
    createNaturesWrathSpell(),
    createManaRejuvenationSpell(),
    createPhoenixFlameSpell(),
  ];
}

/**
 * Get all Tier 5 spells
 * @returns Array of Tier 5 spells
 */
export function getTier5Spells(): Spell[] {
  return [
    createSolarFlareSpell(),
    createAbsoluteZeroSpell(),
    createWorldShatterSpell(),
    createTempestSpell(),
    createArcaneSingularitySpell(),
    createDivineRestorationSpell(),
    createVoidConsumptionSpell(),
    createElementalFusionSpell(),
    createTimeWarpSpell(),
    createEssenceOfLifeSpell(),
  ];
}

/**
 * Get all Tier 6 spells
 * @returns Array of Tier 6 spells
 */
export function getTier6Spells(): Spell[] {
  return [
    createApocalypseSpell(),
    createTsunamiSpell(),
    createColossalEruptionSpell(),
    createSupercellStormSpell(),
    createRealityWarpSpell(),
    createMindControlSpell(),
    createPhoenixResurrectionSpell(),
    createTimeReverseSpell(),
    createCosmicShieldSpell(),
    createPlanarBindingSpell(),
  ];
}

/**
 * Get all Tier 7 spells
 * @returns Array of Tier 7 spells
 */
export function getTier7Spells(): Spell[] {
  return [
    createSupernovaSpell(),
    createAbyssalMawSpell(),
    createWorldTreeSpell(),
    createHurricaneApocalypseSpell(),
    createAstralProjectionSpell(),
    createElementalConvergenceSpell(),
    createLifeforceManipulationSpell(),
    createGlacialAgeSpell(),
    createCelestialJudgmentSpell(),
    createPhaseShiftSpell(),
  ];
}

/**
 * Get all Tier 8 spells
 * @returns Array of Tier 8 spells
 */
export function getTier8Spells(): Spell[] {
  return [
    createExtinctionEventSpell(),
    createGalacticRiftSpell(),
    createDimensionalCollapseSpell(),
    createOmniElementalFurySpell(),
    createTimeStopSpell(),
    createCosmicRebirthSpell(),
    createPrimevalForceSpell(),
    createDivineInterventionSpell(),
    createRealityBreachSpell(),
    createTitanicManifestationSpell(),
  ];
}

/**
 * Get all Tier 9 spells
 * @returns Array of Tier 9 spells
 */
export function getTier9Spells(): Spell[] {
  return [
    createUniversalCataclysmSpell(),
    createEternalOblivionSpell(),
    createMultiversalNexusSpell(),
    createAscensionSpell(),
    createPrimordialGenesisSpell(),
    createCosmicResetSpell(),
    createTranscendentFormSpell(),
    createOmegaBlastSpell(),
    createCelestialMaelstromSpell(),
    createChronoDisruptionSpell(),
  ];
}

/**
 * Get all Tier 10 spells
 * @returns Array of Tier 10 spells
 */
export function getTier10Spells(): Spell[] {
  return [
    createTotalObliterationSpell(),
    createCreationExtinctionCycleSpell(),
    createUltimateRealitySpell(),
    createGodheadManifestationSpell(),
    createInfinitySpell(),
    createPrimordialOneSpell(),
    createOmnipotenceSpell(),
    createHeatDeathSpell(),
    createBigBangSpell(),
    createSingularitySpell(),
  ];
}

/**
 * Get all spells in the game
 * @returns Array of all spells
 */
export function getAllSpells(): Spell[] {
  // Complete collection of 100 spells across 10 tiers
  return [
    ...getTier1Spells(),
    ...getTier2Spells(),
    ...getTier3Spells(),
    ...getTier4Spells(),
    ...getTier5Spells(),
    ...getTier6Spells(),
    ...getTier7Spells(),
    ...getTier8Spells(),
    ...getTier9Spells(),
    ...getTier10Spells(),
  ];
}

/**
 * Get spells by tier
 * @param tier The tier to get spells for (1-10)
 * @returns Array of spells for the specified tier
 */
export function getSpellsByTier(tier: number): Spell[] {
  switch (tier) {
    case 1:
      return getTier1Spells();
    case 2:
      return getTier2Spells();
    case 3:
      return getTier3Spells();
    case 4:
      return getTier4Spells();
    case 5:
      return getTier5Spells();
    case 6:
      return getTier6Spells();
    case 7:
      return getTier7Spells();
    case 8:
      return getTier8Spells();
    case 9:
      return getTier9Spells();
    case 10:
      return getTier10Spells();
    default:
      return [];
  }
}

/**
 * Get spells by element
 * @param element The element to get spells for
 * @returns Array of spells for the specified element
 */
export function getSpellsByElement(element: ElementType): Spell[] {
  return getAllSpells().filter(spell => spell.element === element);
}

/**
 * Get spells by type
 * @param type The type to get spells for
 * @returns Array of spells for the specified type
 */
export function getSpellsByType(type: SpellType): Spell[] {
  return getAllSpells().filter(spell => spell.type === type);
}

// Individual spell creation functions

function createFireboltSpell(): Spell {
  return {
    id: generateSpellId('Firebolt'),
    name: 'Firebolt',
    type: 'damage',
    element: 'fire',
    tier: 1,
    manaCost: 25,
    description: 'Launches a bolt of fire at your enemy, dealing direct damage.',
    effects: [
      {
        type: 'damage',
        value: 20,
        target: 'enemy',
        element: 'fire',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createArcaneShieldSpell(): Spell {
  return {
    id: generateSpellId('Arcane Shield'),
    name: 'Arcane Shield',
    type: 'buff',
    element: 'arcane',
    tier: 1,
    manaCost: 30,
    description: 'Creates a magical shield that reduces incoming damage for 3 turns.',
    effects: [
      {
        type: 'statModifier',
        value: -5, // Reduces damage by 5
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createMinorHealingSpell(): Spell {
  return {
    id: generateSpellId('Minor Healing'),
    name: 'Minor Healing',
    type: 'healing',
    element: 'water',
    tier: 1,
    manaCost: 25,
    description: 'Heals some of your health.',
    effects: [
      {
        type: 'healing',
        value: 15,
        target: 'self',
        element: 'water',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createFrostRaySpell(): Spell {
  return {
    id: generateSpellId('Frost Ray'),
    name: 'Frost Ray',
    type: 'damage',
    element: 'water',
    tier: 1,
    manaCost: 25,
    description: 'Shoots a beam of frost that deals damage and may slow the enemy.',
    effects: [
      {
        type: 'damage',
        value: 15,
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'statModifier',
        value: -2, // Reduces enemy speed/initiative
        duration: 2,
        target: 'enemy',
        element: 'water',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createArcaneBlastSpell(): Spell {
  return {
    id: generateSpellId('Arcane Blast'),
    name: 'Arcane Blast',
    type: 'damage',
    element: 'arcane',
    tier: 1,
    manaCost: 30,
    description: 'Releases a burst of pure arcane energy.',
    effects: [
      {
        type: 'damage',
        value: 25,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createNaturesTouchSpell(): Spell {
  return {
    id: generateSpellId('Nature\'s Touch'),
    name: 'Nature\'s Touch',
    type: 'healing',
    element: 'earth',
    tier: 1,
    manaCost: 30,
    description: 'Channels the power of nature to restore health over time.',
    effects: [
      {
        type: 'healing',
        value: 10,
        target: 'self',
        element: 'earth',
      },
      {
        type: 'statusEffect',
        value: 5, // Heals 5 per turn
        duration: 3,
        target: 'self',
        element: 'earth',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createShadowStrikeSpell(): Spell {
  return {
    id: generateSpellId('Shadow Strike'),
    name: 'Shadow Strike',
    type: 'damage',
    element: 'arcane',
    tier: 1,
    manaCost: 20,
    description: 'A quick strike from the shadows that deals moderate damage.',
    effects: [
      {
        type: 'damage',
        value: 15,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createLightningJoltSpell(): Spell {
  return {
    id: generateSpellId('Lightning Jolt'),
    name: 'Lightning Jolt',
    type: 'damage',
    element: 'air',
    tier: 1,
    manaCost: 20,
    description: 'A quick bolt of lightning that deals damage.',
    effects: [
      {
        type: 'damage',
        value: 18,
        target: 'enemy',
        element: 'air',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createEarthTremorSpell(): Spell {
  return {
    id: generateSpellId('Earth Tremor'),
    name: 'Earth Tremor',
    type: 'damage',
    element: 'earth',
    tier: 1,
    manaCost: 35,
    description: 'Creates a small earthquake that damages the enemy.',
    effects: [
      {
        type: 'damage',
        value: 22,
        target: 'enemy',
        element: 'earth',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createMysticInsightSpell(): Spell {
  return {
    id: generateSpellId('Mystic Insight'),
    name: 'Mystic Insight',
    type: 'buff',
    element: 'arcane',
    tier: 1,
    manaCost: 20,
    description: 'Grants mystical insight, increasing spell power for a short time.',
    effects: [
      {
        type: 'statModifier',
        value: 5, // Increases spell power by 5
        duration: 2,
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

// Tier 2 Spells

function createFireballSpell(): Spell {
  return {
    id: generateSpellId('Fireball'),
    name: 'Fireball',
    type: 'damage',
    element: 'fire',
    tier: 2,
    manaCost: 40,
    description: 'Hurls a ball of fire that explodes on impact, dealing area damage.',
    effects: [
      {
        type: 'damage',
        value: 35,
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'statusEffect',
        value: 5, // Burns for 5 damage per turn
        duration: 2,
        target: 'enemy',
        element: 'fire',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createIceBarrierSpell(): Spell {
  return {
    id: generateSpellId('Ice Barrier'),
    name: 'Ice Barrier',
    type: 'buff',
    element: 'water',
    tier: 2,
    manaCost: 35,
    description: 'Creates a barrier of ice that reduces damage and may freeze attackers.',
    effects: [
      {
        type: 'statModifier',
        value: -10, // Reduces damage by 10
        duration: 3,
        target: 'self',
        element: 'water',
      },
      {
        type: 'statusEffect',
        value: 5, // Reflects 5 damage to attackers
        duration: 3,
        target: 'self',
        element: 'water',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createRejuvenationSpell(): Spell {
  return {
    id: generateSpellId('Rejuvenation'),
    name: 'Rejuvenation',
    type: 'healing',
    element: 'earth',
    tier: 2,
    manaCost: 45,
    description: 'A powerful healing spell that restores health and provides healing over time.',
    effects: [
      {
        type: 'healing',
        value: 25,
        target: 'self',
        element: 'earth',
      },
      {
        type: 'statusEffect',
        value: 8, // Heals 8 per turn
        duration: 3,
        target: 'self',
        element: 'earth',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createArcaneArmorySpell(): Spell {
  return {
    id: generateSpellId('Arcane Armory'),
    name: 'Arcane Armory',
    type: 'buff',
    element: 'arcane',
    tier: 2,
    manaCost: 40,
    description: 'Surrounds the caster with arcane weapons that boost attack power and defense.',
    effects: [
      {
        type: 'statModifier',
        value: 8, // Increases spell power by 8
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: -5, // Reduces damage taken by 5
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createWindBlastSpell(): Spell {
  return {
    id: generateSpellId('Wind Blast'),
    name: 'Wind Blast',
    type: 'damage',
    element: 'air',
    tier: 2,
    manaCost: 35,
    description: 'Summons a powerful gust of wind that damages and pushes back the enemy.',
    effects: [
      {
        type: 'damage',
        value: 30,
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'statModifier',
        value: -3, // Reduces enemy initiative
        duration: 2,
        target: 'enemy',
        element: 'air',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createVenomSpraySpell(): Spell {
  return {
    id: generateSpellId('Venom Spray'),
    name: 'Venom Spray',
    type: 'dot',
    element: 'earth',
    tier: 2,
    manaCost: 38,
    description: 'Sprays toxic venom that poisons the enemy, dealing damage over time.',
    effects: [
      {
        type: 'damage',
        value: 15,
        target: 'enemy',
        element: 'earth',
      },
      {
        type: 'statusEffect',
        value: 10, // Poison damage per turn
        duration: 3,
        target: 'enemy',
        element: 'earth',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createThunderclaspSpell(): Spell {
  return {
    id: generateSpellId('Thunderclasp'),
    name: 'Thunderclasp',
    type: 'damage',
    element: 'air',
    tier: 2,
    manaCost: 42,
    description: 'Calls down a thunderous boom that deals heavy damage and may stun the enemy.',
    effects: [
      {
        type: 'damage',
        value: 40,
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'statusEffect',
        value: -1, // Stun effect (prevents action)
        duration: 1,
        target: 'enemy',
        element: 'air',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createEarthShieldSpell(): Spell {
  return {
    id: generateSpellId('Earth Shield'),
    name: 'Earth Shield',
    type: 'buff',
    element: 'earth',
    tier: 2,
    manaCost: 40,
    description: 'Creates a shield of stone and earth that significantly reduces incoming damage.',
    effects: [
      {
        type: 'statModifier',
        value: -15, // Reduces damage by 15
        duration: 2,
        target: 'self',
        element: 'earth',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createLifedrainSpell(): Spell {
  return {
    id: generateSpellId('Lifedrain'),
    name: 'Lifedrain',
    type: 'damage',
    element: 'arcane',
    tier: 2,
    manaCost: 45,
    description: 'Drains life force from the enemy, healing the caster by half the damage dealt.',
    effects: [
      {
        type: 'damage',
        value: 30,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'healing',
        value: 15, // Half of the damage dealt
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createManaStealSpell(): Spell {
  return {
    id: generateSpellId('Mana Steal'),
    name: 'Mana Steal',
    type: 'damage',
    element: 'arcane',
    tier: 2,
    manaCost: 35,
    description: 'Drains magical energy from the enemy, restoring mana to the caster.',
    effects: [
      {
        type: 'damage',
        value: 25,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'manaRestore',
        value: 15,
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

// Tier 3 Spells

function createInfernoSpell(): Spell {
  return {
    id: generateSpellId('Inferno'),
    name: 'Inferno',
    type: 'damage',
    element: 'fire',
    tier: 3,
    manaCost: 60,
    description: 'Engulfs the area in flames, causing massive fire damage and lingering burns.',
    effects: [
      {
        type: 'damage',
        value: 50,
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'statusEffect',
        value: 10, // Burns for 10 damage per turn
        duration: 3,
        target: 'enemy',
        element: 'fire',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createFrostNovaSpell(): Spell {
  return {
    id: generateSpellId('Frost Nova'),
    name: 'Frost Nova',
    type: 'damage',
    element: 'water',
    tier: 3,
    manaCost: 55,
    description: 'Releases a freezing wave that damages enemies and significantly reduces their action speed.',
    effects: [
      {
        type: 'damage',
        value: 40,
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'statModifier',
        value: -5, // Severely reduces speed
        duration: 3,
        target: 'enemy',
        element: 'water',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createNaturesBlessingSpell(): Spell {
  return {
    id: generateSpellId('Nature\'s Blessing'),
    name: 'Nature\'s Blessing',
    type: 'healing',
    element: 'earth',
    tier: 3,
    manaCost: 65,
    description: 'Channels the full power of nature to provide substantial healing and restoration over time.',
    effects: [
      {
        type: 'healing',
        value: 45,
        target: 'self',
        element: 'earth',
      },
      {
        type: 'statusEffect',
        value: 12, // Heals 12 per turn
        duration: 3,
        target: 'self',
        element: 'earth',
      },
      {
        type: 'manaRestore',
        value: 10,
        target: 'self',
        element: 'earth',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createArcaneSurgeSpell(): Spell {
  return {
    id: generateSpellId('Arcane Surge'),
    name: 'Arcane Surge',
    type: 'damage',
    element: 'arcane',
    tier: 3,
    manaCost: 60,
    description: 'Channels pure arcane energy into a devastating blast that ignores magical defenses.',
    effects: [
      {
        type: 'damage',
        value: 60, // High damage as it ignores defenses
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createHurricaneSpell(): Spell {
  return {
    id: generateSpellId('Hurricane'),
    name: 'Hurricane',
    type: 'damage',
    element: 'air',
    tier: 3,
    manaCost: 58,
    description: 'Summons a violent storm that deals damage over multiple turns and reduces enemy effectiveness.',
    effects: [
      {
        type: 'damage',
        value: 35,
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'statusEffect',
        value: 15, // Recurring damage
        duration: 4,
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'statModifier',
        value: -3, // Reduces effectiveness
        duration: 4,
        target: 'enemy',
        element: 'air',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createEarthquakeSpell(): Spell {
  return {
    id: generateSpellId('Earthquake'),
    name: 'Earthquake',
    type: 'damage',
    element: 'earth',
    tier: 3,
    manaCost: 55,
    description: 'Triggers a massive earthquake that deals substantial damage and destabilizes the enemy.',
    effects: [
      {
        type: 'damage',
        value: 55,
        target: 'enemy',
        element: 'earth',
      },
      {
        type: 'statModifier',
        value: -4, // Reduces stability/accuracy
        duration: 2,
        target: 'enemy',
        element: 'earth',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createShadowFormSpell(): Spell {
  return {
    id: generateSpellId('Shadow Form'),
    name: 'Shadow Form',
    type: 'buff',
    element: 'arcane',
    tier: 3,
    manaCost: 50,
    description: 'Transforms the caster into living shadow, increasing evasion and spell power.',
    effects: [
      {
        type: 'statModifier',
        value: -20, // Significant damage reduction
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 12, // Increased spell power
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createChainLightningSpell(): Spell {
  return {
    id: generateSpellId('Chain Lightning'),
    name: 'Chain Lightning',
    type: 'damage',
    element: 'air',
    tier: 3,
    manaCost: 55,
    description: 'Unleashes a bolt of lightning that repeatedly strikes the enemy.',
    effects: [
      {
        type: 'damage',
        value: 20, // Initial hit
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'damage',
        value: 20, // Second hit
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'damage',
        value: 20, // Third hit
        target: 'enemy',
        element: 'air',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createVitalityTransferSpell(): Spell {
  return {
    id: generateSpellId('Vitality Transfer'),
    name: 'Vitality Transfer',
    type: 'healing',
    element: 'arcane',
    tier: 3,
    manaCost: 50,
    description: 'Converts mana into health, providing substantial immediate healing.',
    effects: [
      {
        type: 'healing',
        value: 70, // High healing at the cost of additional mana
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createManaFluxSpell(): Spell {
  return {
    id: generateSpellId('Mana Flux'),
    name: 'Mana Flux',
    type: 'buff',
    element: 'arcane',
    tier: 3,
    manaCost: 45,
    description: 'Creates a surge of magical energy that temporarily reduces spell costs and increases regeneration.',
    effects: [
      {
        type: 'statModifier',
        value: 15, // Increases mana regeneration
        duration: 4,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'manaRestore',
        value: 25, // Immediate mana restoration
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

// Tier 4 Spells

function createMeteorStrikeSpell(): Spell {
  return {
    id: generateSpellId('Meteor Strike'),
    name: 'Meteor Strike',
    type: 'damage',
    element: 'fire',
    tier: 4,
    manaCost: 75,
    description: 'Calls down a devastating meteor that deals massive damage and leaves the area burning.',
    effects: [
      {
        type: 'damage',
        value: 70,
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'statusEffect',
        value: 15, // Burns for 15 damage per turn
        duration: 3,
        target: 'enemy',
        element: 'fire',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createBlizzardSpell(): Spell {
  return {
    id: generateSpellId('Blizzard'),
    name: 'Blizzard',
    type: 'damage',
    element: 'water',
    tier: 4,
    manaCost: 70,
    description: 'Summons a violent blizzard that deals severe cold damage and freezes enemies.',
    effects: [
      {
        type: 'damage',
        value: 50,
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'statusEffect',
        value: 10, // Cold damage per turn
        duration: 3,
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'statModifier',
        value: -8, // Severe speed reduction
        duration: 2,
        target: 'enemy',
        element: 'water',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createArcaneExplosionSpell(): Spell {
  return {
    id: generateSpellId('Arcane Explosion'),
    name: 'Arcane Explosion',
    type: 'damage',
    element: 'arcane',
    tier: 4,
    manaCost: 85,
    description: 'Releases an explosive burst of arcane energy that deals massive damage to all enemies.',
    effects: [
      {
        type: 'damage',
        value: 90,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createGaleForceSpell(): Spell {
  return {
    id: generateSpellId('Gale Force'),
    name: 'Gale Force',
    type: 'damage',
    element: 'air',
    tier: 4,
    manaCost: 70,
    description: 'Summons a devastating windstorm that deals damage and severely reduces enemy capabilities.',
    effects: [
      {
        type: 'damage',
        value: 60,
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'statModifier',
        value: -10, // Severe reduction in effectiveness
        duration: 3,
        target: 'enemy',
        element: 'air',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createEarthsEmbrace(): Spell {
  return {
    id: generateSpellId('Earth\'s Embrace'),
    name: 'Earth\'s Embrace',
    type: 'buff',
    element: 'earth',
    tier: 4,
    manaCost: 65,
    description: 'Envelops the caster in living stone, providing near-immunity to damage for a short time.',
    effects: [
      {
        type: 'statModifier',
        value: -30, // Near immunity to damage
        duration: 2,
        target: 'self',
        element: 'earth',
      },
      {
        type: 'healing',
        value: 30,
        target: 'self',
        element: 'earth',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createVoidRiftSpell(): Spell {
  return {
    id: generateSpellId('Void Rift'),
    name: 'Void Rift',
    type: 'damage',
    element: 'arcane',
    tier: 4,
    manaCost: 80,
    description: 'Opens a rift to the void, dealing extreme damage that bypasses defenses.',
    effects: [
      {
        type: 'damage',
        value: 80,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 10, // Temporarily weakens enemy defenses
        duration: 2,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createRagingThunderstormSpell(): Spell {
  return {
    id: generateSpellId('Raging Thunderstorm'),
    name: 'Raging Thunderstorm',
    type: 'damage',
    element: 'air',
    tier: 4,
    manaCost: 75,
    description: 'Summons a violent thunderstorm that strikes multiple times with increasing intensity.',
    effects: [
      {
        type: 'damage',
        value: 30, // First strike
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'damage',
        value: 35, // Second strike
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'damage',
        value: 40, // Third strike
        target: 'enemy',
        element: 'air',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createNaturesWrathSpell(): Spell {
  return {
    id: generateSpellId('Nature\'s Wrath'),
    name: 'Nature\'s Wrath',
    type: 'damage',
    element: 'earth',
    tier: 4,
    manaCost: 75,
    description: 'Unleashes nature\'s fury in a devastating attack that also heals the caster.',
    effects: [
      {
        type: 'damage',
        value: 65,
        target: 'enemy',
        element: 'earth',
      },
      {
        type: 'healing',
        value: 30,
        target: 'self',
        element: 'earth',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createManaRejuvenationSpell(): Spell {
  return {
    id: generateSpellId('Mana Rejuvenation'),
    name: 'Mana Rejuvenation',
    type: 'buff',
    element: 'arcane',
    tier: 4,
    manaCost: 60,
    description: 'Rapidly restores mana and enhances mana regeneration for several turns.',
    effects: [
      {
        type: 'manaRestore',
        value: 50,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 20, // Enhanced mana regeneration
        duration: 4,
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createPhoenixFlameSpell(): Spell {
  return {
    id: generateSpellId('Phoenix Flame'),
    name: 'Phoenix Flame',
    type: 'healing',
    element: 'fire',
    tier: 4,
    manaCost: 80,
    description: 'Envelops the caster in regenerative flames that provide substantial healing and damage resistance.',
    effects: [
      {
        type: 'healing',
        value: 60,
        target: 'self',
        element: 'fire',
      },
      {
        type: 'statModifier',
        value: -15, // Damage reduction
        duration: 3,
        target: 'self',
        element: 'fire',
      },
      {
        type: 'statusEffect',
        value: 10, // Healing over time
        duration: 3,
        target: 'self',
        element: 'fire',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

// Tier 5 Spells

function createSolarFlareSpell(): Spell {
  return {
    id: generateSpellId('Solar Flare'),
    name: 'Solar Flare',
    type: 'damage',
    element: 'fire',
    tier: 5,
    manaCost: 100,
    description: 'Channels the power of the sun to create a devastating flare that causes catastrophic damage.',
    effects: [
      {
        type: 'damage',
        value: 100,
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'statusEffect',
        value: 20, // Severe burning damage per turn
        duration: 3,
        target: 'enemy',
        element: 'fire',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createAbsoluteZeroSpell(): Spell {
  return {
    id: generateSpellId('Absolute Zero'),
    name: 'Absolute Zero',
    type: 'damage',
    element: 'water',
    tier: 5,
    manaCost: 95,
    description: 'Reduces the temperature to absolute zero, causing extreme damage and completely freezing the enemy.',
    effects: [
      {
        type: 'damage',
        value: 80,
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'statusEffect',
        value: 15, // Freezing damage per turn
        duration: 3,
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'statModifier',
        value: -15, // Complete freezing - severe speed reduction
        duration: 2,
        target: 'enemy',
        element: 'water',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createWorldShatterSpell(): Spell {
  return {
    id: generateSpellId('World Shatter'),
    name: 'World Shatter',
    type: 'damage',
    element: 'earth',
    tier: 5,
    manaCost: 100,
    description: 'Creates a localized earthquake of such magnitude that it threatens to shatter the world itself.',
    effects: [
      {
        type: 'damage',
        value: 120,
        target: 'enemy',
        element: 'earth',
      },
      {
        type: 'statusEffect',
        value: 10, // Continuing damage from aftershocks
        duration: 2,
        target: 'enemy',
        element: 'earth',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createTempestSpell(): Spell {
  return {
    id: generateSpellId('Tempest'),
    name: 'Tempest',
    type: 'damage',
    element: 'air',
    tier: 5,
    manaCost: 90,
    description: 'Conjures a catastrophic tempest of wind, lightning, and rain that devastates everything in its path.',
    effects: [
      {
        type: 'damage',
        value: 70, // Initial wind damage
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'damage',
        value: 40, // Lightning strike
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'statusEffect',
        value: 15, // Ongoing storm damage
        duration: 3,
        target: 'enemy',
        element: 'air',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createArcaneSingularitySpell(): Spell {
  return {
    id: generateSpellId('Arcane Singularity'),
    name: 'Arcane Singularity',
    type: 'damage',
    element: 'arcane',
    tier: 5,
    manaCost: 120,
    description: 'Creates an arcane singularity that warps reality and devastates anything in its vicinity.',
    effects: [
      {
        type: 'damage',
        value: 150, // Extremely high damage
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createDivineRestorationSpell(): Spell {
  return {
    id: generateSpellId('Divine Restoration'),
    name: 'Divine Restoration',
    type: 'healing',
    element: 'water',
    tier: 5,
    manaCost: 90,
    description: 'Channels divine energy to completely restore health and remove all negative effects.',
    effects: [
      {
        type: 'healing',
        value: 100, // Complete health restoration
        target: 'self',
        element: 'water',
      },
      {
        type: 'statusEffect',
        value: 15, // Ongoing healing
        duration: 3,
        target: 'self',
        element: 'water',
      },
      // This would also need to remove negative status effects, 
      // which might require a special effect type
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createVoidConsumptionSpell(): Spell {
  return {
    id: generateSpellId('Void Consumption'),
    name: 'Void Consumption',
    type: 'damage',
    element: 'arcane',
    tier: 5,
    manaCost: 110,
    description: 'Opens a rift to the void that consumes a portion of the enemy\'s essence, dealing damage and healing the caster.',
    effects: [
      {
        type: 'damage',
        value: 90,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'healing',
        value: 45, // Half of the damage dealt
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'manaRestore',
        value: 35, // Also restores mana
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createElementalFusionSpell(): Spell {
  return {
    id: generateSpellId('Elemental Fusion'),
    name: 'Elemental Fusion',
    type: 'buff',
    element: 'arcane',
    tier: 5,
    manaCost: 85,
    description: 'Fuses elemental energies to dramatically enhance spellcasting power and provide protection.',
    effects: [
      {
        type: 'statModifier',
        value: 25, // Massive spell power increase
        duration: 4,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: -20, // Strong damage reduction
        duration: 4,
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createTimeWarpSpell(): Spell {
  return {
    id: generateSpellId('Time Warp'),
    name: 'Time Warp',
    type: 'buff',
    element: 'arcane',
    tier: 5,
    manaCost: 100,
    description: 'Warps the flow of time, allowing the caster to act twice in a single turn.',
    effects: [
      {
        type: 'statusEffect',
        value: 1, // Special value for "extra turn" effect
        duration: 1,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'manaRestore',
        value: 30, // Restore some mana for the extra action
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createEssenceOfLifeSpell(): Spell {
  return {
    id: generateSpellId('Essence of Life'),
    name: 'Essence of Life',
    type: 'healing',
    element: 'earth',
    tier: 5,
    manaCost: 95,
    description: 'Channels the pure essence of life, providing massive healing and ongoing regeneration.',
    effects: [
      {
        type: 'healing',
        value: 80,
        target: 'self',
        element: 'earth',
      },
      {
        type: 'statusEffect',
        value: 20, // Strong regeneration per turn
        duration: 5,
        target: 'self',
        element: 'earth',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

// Tier 6 Spells

function createApocalypseSpell(): Spell {
  return {
    id: generateSpellId('Apocalypse'),
    name: 'Apocalypse',
    type: 'damage',
    element: 'fire',
    tier: 6,
    manaCost: 150,
    description: 'Summons the apocalypse, inflicting catastrophic fire damage and leaving the target in agony.',
    effects: [
      {
        type: 'damage',
        value: 140,
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'statusEffect',
        value: 30, // Severe burning damage per turn
        duration: 4,
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'statModifier',
        value: 10, // Reduces enemy defense
        duration: 3,
        target: 'enemy',
        element: 'fire',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createTsunamiSpell(): Spell {
  return {
    id: generateSpellId('Tsunami'),
    name: 'Tsunami',
    type: 'damage',
    element: 'water',
    tier: 6,
    manaCost: 140,
    description: 'Summons a massive tsunami that crashes down on enemies, causing devastating damage and lingering effects.',
    effects: [
      {
        type: 'damage',
        value: 120,
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'statusEffect',
        value: 15, // Drowning damage per turn
        duration: 4,
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'statModifier',
        value: -20, // Severe speed reduction from being waterlogged
        duration: 3,
        target: 'enemy',
        element: 'water',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createColossalEruptionSpell(): Spell {
  return {
    id: generateSpellId('Colossal Eruption'),
    name: 'Colossal Eruption',
    type: 'damage',
    element: 'earth',
    tier: 6,
    manaCost: 150,
    description: 'Triggers a massive volcanic eruption beneath the enemy, causing extreme damage and lingering volcanic effects.',
    effects: [
      {
        type: 'damage',
        value: 150,
        target: 'enemy',
        element: 'earth',
      },
      {
        type: 'statusEffect',
        value: 20, // Lava damage per turn
        duration: 3,
        target: 'enemy',
        element: 'fire', // Lava damage is fire element
      },
      {
        type: 'statModifier',
        value: -10, // Reduced mobility from terrain destruction
        duration: 3,
        target: 'enemy',
        element: 'earth',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createSupercellStormSpell(): Spell {
  return {
    id: generateSpellId('Supercell Storm'),
    name: 'Supercell Storm',
    type: 'damage',
    element: 'air',
    tier: 6,
    manaCost: 145,
    description: 'Summons a massive supercell thunderstorm with multiple devastating effects.',
    effects: [
      {
        type: 'damage',
        value: 60, // Initial wind damage
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'damage',
        value: 60, // Lightning strikes
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'statusEffect',
        value: 25, // Ongoing storm damage
        duration: 4,
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'statModifier',
        value: -15, // Severe reduction in combat effectiveness
        duration: 3,
        target: 'enemy',
        element: 'air',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createRealityWarpSpell(): Spell {
  return {
    id: generateSpellId('Reality Warp'),
    name: 'Reality Warp',
    type: 'damage',
    element: 'arcane',
    tier: 6,
    manaCost: 160,
    description: 'Tears apart the fabric of reality around the target, causing catastrophic arcane damage and disrupting their magic.',
    effects: [
      {
        type: 'damage',
        value: 180,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 25, // Severely weakens the enemy's magical defenses
        duration: 3,
        target: 'enemy',
        element: 'arcane',
      },
      // This would ideally also prevent the enemy from casting high-tier spells
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createMindControlSpell(): Spell {
  return {
    id: generateSpellId('Mind Control'),
    name: 'Mind Control',
    type: 'debuff',
    element: 'arcane',
    tier: 6,
    manaCost: 140,
    description: 'Takes control of the enemy\'s mind, forcing them to damage themselves with their own power.',
    effects: [
      {
        type: 'damage',
        value: 80, // Initial psychic damage
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 40, // Forces the enemy to damage themselves
        duration: 2,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 20, // Makes enemy more vulnerable
        duration: 2,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createPhoenixResurrectionSpell(): Spell {
  return {
    id: generateSpellId('Phoenix Resurrection'),
    name: 'Phoenix Resurrection',
    type: 'healing',
    element: 'fire',
    tier: 6,
    manaCost: 150,
    description: 'Channels the power of the mythical phoenix to restore the caster to full power and provide powerful regeneration.',
    effects: [
      {
        type: 'healing',
        value: 200, // Near-complete healing
        target: 'self',
        element: 'fire',
      },
      {
        type: 'statusEffect',
        value: 30, // Strong regeneration per turn
        duration: 4,
        target: 'self',
        element: 'fire',
      },
      {
        type: 'statModifier',
        value: 20, // Increased spell power from rebirth
        duration: 4,
        target: 'self',
        element: 'fire',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createTimeReverseSpell(): Spell {
  return {
    id: generateSpellId('Time Reverse'),
    name: 'Time Reverse',
    type: 'healing',
    element: 'arcane',
    tier: 6,
    manaCost: 140,
    description: 'Reverses time around the caster, undoing recent damage and restoring mana and health to a previous state.',
    effects: [
      {
        type: 'healing',
        value: 150, // Significant healing
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'manaRestore',
        value: 100, // Significant mana restoration
        target: 'self',
        element: 'arcane',
      },
      // Would ideally also remove all negative status effects
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createCosmicShieldSpell(): Spell {
  return {
    id: generateSpellId('Cosmic Shield'),
    name: 'Cosmic Shield',
    type: 'buff',
    element: 'arcane',
    tier: 6,
    manaCost: 130,
    description: 'Surrounds the caster with the power of the cosmos, providing near invulnerability and reflecting damage back at attackers.',
    effects: [
      {
        type: 'statModifier',
        value: -50, // Near immunity to damage
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 30, // Reflects 30 damage to attackers
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createPlanarBindingSpell(): Spell {
  return {
    id: generateSpellId('Planar Binding'),
    name: 'Planar Binding',
    type: 'damage',
    element: 'arcane',
    tier: 6,
    manaCost: 155,
    description: 'Binds the enemy to another plane of existence, causing immense damage and absorbing their power.',
    effects: [
      {
        type: 'damage',
        value: 120,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 20, // Binding damage per turn
        duration: 3,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'manaRestore',
        value: 60, // Absorbs significant mana
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'healing',
        value: 40, // Absorbs life force
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

// Tier 7 Spells

function createSupernovaSpell(): Spell {
  return {
    id: generateSpellId('Supernova'),
    name: 'Supernova',
    type: 'damage',
    element: 'fire',
    tier: 7,
    manaCost: 200,
    description: 'Creates a supernova explosion that devastates everything in its path with stellar fire.',
    effects: [
      {
        type: 'damage',
        value: 200,
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'statusEffect',
        value: 40, // Extreme burning damage per turn
        duration: 4,
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'statModifier',
        value: 30, // Severely weakens defenses
        duration: 3,
        target: 'enemy',
        element: 'fire',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createAbyssalMawSpell(): Spell {
  return {
    id: generateSpellId('Abyssal Maw'),
    name: 'Abyssal Maw',
    type: 'damage',
    element: 'water',
    tier: 7,
    manaCost: 190,
    description: 'Opens a giant maw to the deepest abyssal trenches, crushing the enemy with immense pressure and cold.',
    effects: [
      {
        type: 'damage',
        value: 180,
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'statusEffect',
        value: 30, // Crushing pressure damage per turn
        duration: 3,
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'statModifier',
        value: 25, // Weakness from pressure
        duration: 4,
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'statModifier',
        value: -25, // Severe speed reduction from pressure
        duration: 4,
        target: 'enemy',
        element: 'water',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createWorldTreeSpell(): Spell {
  return {
    id: generateSpellId('World Tree'),
    name: 'World Tree',
    type: 'healing',
    element: 'earth',
    tier: 7,
    manaCost: 180,
    description: 'Manifests the World Tree, the source of all life, providing extraordinary healing and life force.',
    effects: [
      {
        type: 'healing',
        value: 250, // Massive healing
        target: 'self',
        element: 'earth',
      },
      {
        type: 'statusEffect',
        value: 40, // Extreme regeneration per turn
        duration: 5,
        target: 'self',
        element: 'earth',
      },
      {
        type: 'manaRestore',
        value: 50, // Significant mana regeneration
        target: 'self',
        element: 'earth',
      },
      {
        type: 'statModifier',
        value: -30, // Strong damage reduction
        duration: 5,
        target: 'self',
        element: 'earth',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createHurricaneApocalypseSpell(): Spell {
  return {
    id: generateSpellId('Hurricane Apocalypse'),
    name: 'Hurricane Apocalypse',
    type: 'damage',
    element: 'air',
    tier: 7,
    manaCost: 195,
    description: 'Summons a world-ending hurricane that tears everything apart with wind, lightning, and devastation.',
    effects: [
      {
        type: 'damage',
        value: 100, // Initial wind damage
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'damage',
        value: 100, // Lightning damage
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'statusEffect',
        value: 40, // Ongoing hurricane damage
        duration: 5,
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'statModifier',
        value: 30, // Makes enemy extremely vulnerable
        duration: 3,
        target: 'enemy',
        element: 'air',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createAstralProjectionSpell(): Spell {
  return {
    id: generateSpellId('Astral Projection'),
    name: 'Astral Projection',
    type: 'buff',
    element: 'arcane',
    tier: 7,
    manaCost: 170,
    description: 'Projects the caster\'s consciousness into the astral plane, making them nearly invulnerable and enhancing their magical abilities.',
    effects: [
      {
        type: 'statModifier',
        value: -70, // Near-complete immunity to damage
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 40, // Massive spell power increase
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'manaRestore',
        value: 60, // Significant mana restoration
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createElementalConvergenceSpell(): Spell {
  return {
    id: generateSpellId('Elemental Convergence'),
    name: 'Elemental Convergence',
    type: 'damage',
    element: 'arcane',
    tier: 7,
    manaCost: 210,
    description: 'Converges all elemental forces into a single devastating attack that overwhelms any defense.',
    effects: [
      {
        type: 'damage',
        value: 80, // Fire damage
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'damage',
        value: 80, // Water damage
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'damage',
        value: 80, // Earth damage
        target: 'enemy',
        element: 'earth',
      },
      {
        type: 'damage',
        value: 80, // Air damage
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'statModifier',
        value: 40, // Completely strips elemental resistances
        duration: 2,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createLifeforceManipulationSpell(): Spell {
  return {
    id: generateSpellId('Lifeforce Manipulation'),
    name: 'Lifeforce Manipulation',
    type: 'healing',
    element: 'arcane',
    tier: 7,
    manaCost: 185,
    description: 'Manipulates the very essence of life, transferring life force from the enemy to the caster.',
    effects: [
      {
        type: 'damage',
        value: 150, // Massive life drain
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'healing',
        value: 150, // Equal healing to the caster
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 30, // Ongoing life drain
        duration: 3,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 30, // Ongoing healing to the caster
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createGlacialAgeSpell(): Spell {
  return {
    id: generateSpellId('Glacial Age'),
    name: 'Glacial Age',
    type: 'damage',
    element: 'water',
    tier: 7,
    manaCost: 190,
    description: 'Brings forth a miniature ice age, freezing everything and causing catastrophic cold damage.',
    effects: [
      {
        type: 'damage',
        value: 170, // Massive cold damage
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'statusEffect',
        value: 35, // Severe freezing damage per turn
        duration: 4,
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'statModifier',
        value: -40, // Complete freezing - near inability to act
        duration: 2,
        target: 'enemy',
        element: 'water',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createCelestialJudgmentSpell(): Spell {
  return {
    id: generateSpellId('Celestial Judgment'),
    name: 'Celestial Judgment',
    type: 'damage',
    element: 'arcane',
    tier: 7,
    manaCost: 220,
    description: 'Calls down judgment from celestial beings, devastating the enemy with divine power.',
    effects: [
      {
        type: 'damage',
        value: 250, // Extremely high damage
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 50, // Completely strips defenses
        duration: 1,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createPhaseShiftSpell(): Spell {
  return {
    id: generateSpellId('Phase Shift'),
    name: 'Phase Shift',
    type: 'buff',
    element: 'arcane',
    tier: 7,
    manaCost: 180,
    description: 'Shifts the caster out of phase with normal reality, granting them extraordinary powers.',
    effects: [
      {
        type: 'statModifier',
        value: -80, // Near complete invulnerability
        duration: 2,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 50, // Extreme spell power increase
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 1, // Special value for extra turn effect
        duration: 1,
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

// Tier 8 Spells

function createExtinctionEventSpell(): Spell {
  return {
    id: generateSpellId('Extinction Event'),
    name: 'Extinction Event',
    type: 'damage',
    element: 'fire',
    tier: 8,
    manaCost: 300,
    description: 'Recreates the cataclysmic event that caused mass extinction, annihilating everything in its path.',
    effects: [
      {
        type: 'damage',
        value: 300, // Catastrophic damage
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'statusEffect',
        value: 50, // Extreme burning damage per turn
        duration: 5,
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'statModifier',
        value: 50, // Completely strips defenses
        duration: 3,
        target: 'enemy',
        element: 'fire',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createGalacticRiftSpell(): Spell {
  return {
    id: generateSpellId('Galactic Rift'),
    name: 'Galactic Rift',
    type: 'damage',
    element: 'arcane',
    tier: 8,
    manaCost: 320,
    description: 'Tears open a rift to the void between galaxies, subjecting the enemy to the unimaginable forces found there.',
    effects: [
      {
        type: 'damage',
        value: 350, // Extreme damage
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 40, // Void damage per turn
        duration: 3,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 40, // Severely weakens all resistances
        duration: 4,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createDimensionalCollapseSpell(): Spell {
  return {
    id: generateSpellId('Dimensional Collapse'),
    name: 'Dimensional Collapse',
    type: 'damage',
    element: 'arcane',
    tier: 8,
    manaCost: 330,
    description: 'Collapses a small dimension onto the enemy, subjecting them to the catastrophic energy release.',
    effects: [
      {
        type: 'damage',
        value: 400, // Extreme damage
        target: 'enemy',
        element: 'arcane',
      },
      // This is so powerful it doesn't even need additional effects
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createOmniElementalFurySpell(): Spell {
  return {
    id: generateSpellId('Omni-Elemental Fury'),
    name: 'Omni-Elemental Fury',
    type: 'damage',
    element: 'arcane',
    tier: 8,
    manaCost: 310,
    description: 'Unleashes the fury of all elemental planes simultaneously in a devastating assault.',
    effects: [
      {
        type: 'damage',
        value: 100, // Fire damage
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'damage',
        value: 100, // Water damage
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'damage',
        value: 100, // Earth damage
        target: 'enemy',
        element: 'earth',
      },
      {
        type: 'damage',
        value: 100, // Air damage
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'statusEffect',
        value: 60, // Combined elemental damage over time
        duration: 3,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createTimeStopSpell(): Spell {
  return {
    id: generateSpellId('Time Stop'),
    name: 'Time Stop',
    type: 'buff',
    element: 'arcane',
    tier: 8,
    manaCost: 300,
    description: 'Completely stops time for everyone except the caster, allowing multiple actions without opposition.',
    effects: [
      {
        type: 'statusEffect',
        value: 1, // Special value for "extra turn" effect, but should grant multiple turns in implementation
        duration: 3, // Would ideally grant 3 extra turns in sequence
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'manaRestore',
        value: 100, // Significant mana restore to cast during stopped time
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 60, // Massive spell power increase during stopped time
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createCosmicRebirthSpell(): Spell {
  return {
    id: generateSpellId('Cosmic Rebirth'),
    name: 'Cosmic Rebirth',
    type: 'healing',
    element: 'arcane',
    tier: 8,
    manaCost: 280,
    description: 'Causes the caster to be reborn in the fires of cosmic creation, fully restoring them and granting immense power.',
    effects: [
      {
        type: 'healing',
        value: 500, // Complete healing
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'manaRestore',
        value: 200, // Complete mana restoration
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: -70, // Near invulnerability
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 70, // Extreme spell power
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
      // Would ideally also remove all negative status effects
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createPrimevalForceSpell(): Spell {
  return {
    id: generateSpellId('Primeval Force'),
    name: 'Primeval Force',
    type: 'damage',
    element: 'earth',
    tier: 8,
    manaCost: 290,
    description: 'Channels the primeval forces of creation that shaped the world, devastating the enemy with unimaginable power.',
    effects: [
      {
        type: 'damage',
        value: 280, // Massive damage
        target: 'enemy',
        element: 'earth',
      },
      {
        type: 'statusEffect',
        value: 70, // Extreme crushing damage over time
        duration: 4,
        target: 'enemy',
        element: 'earth',
      },
      {
        type: 'statModifier',
        value: 60, // Completely strips physical defenses
        duration: 3,
        target: 'enemy',
        element: 'earth',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createDivineInterventionSpell(): Spell {
  return {
    id: generateSpellId('Divine Intervention'),
    name: 'Divine Intervention',
    type: 'healing',
    element: 'arcane',
    tier: 8,
    manaCost: 270,
    description: 'Calls upon divine powers to intervene, completely restoring the caster and smiting their enemies.',
    effects: [
      {
        type: 'healing',
        value: 400, // Near-complete healing
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'damage',
        value: 200, // Significant divine damage to enemy
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'manaRestore',
        value: 150, // Significant mana restoration
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 50, // Ongoing healing
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createRealityBreachSpell(): Spell {
  return {
    id: generateSpellId('Reality Breach'),
    name: 'Reality Breach',
    type: 'damage',
    element: 'arcane',
    tier: 8,
    manaCost: 340,
    description: 'Creates a catastrophic breach in the fabric of reality, unleashing chaotic energies that devastate everything.',
    effects: [
      {
        type: 'damage',
        value: 300, // Extreme damage
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 80, // Extreme reality-shredding damage over time
        duration: 3,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 70, // Completely strips all defenses
        duration: 2,
        target: 'enemy',
        element: 'arcane',
      },
      // Also damages the caster slightly due to the chaotic nature
      {
        type: 'damage',
        value: 50, // Backlash damage
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createTitanicManifestationSpell(): Spell {
  return {
    id: generateSpellId('Titanic Manifestation'),
    name: 'Titanic Manifestation',
    type: 'buff',
    element: 'earth',
    tier: 8,
    manaCost: 310,
    description: 'Manifests a titanic elemental being of immense power that fights alongside the caster.',
    effects: [
      {
        type: 'statModifier',
        value: -90, // Near-complete invulnerability
        duration: 4,
        target: 'self',
        element: 'earth',
      },
      {
        type: 'statModifier',
        value: 80, // Immense spell power boost
        duration: 4,
        target: 'self',
        element: 'earth',
      },
      {
        type: 'statusEffect',
        value: 60, // The titan deals damage to enemies each turn
        duration: 4,
        target: 'enemy',
        element: 'earth',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

// Tier 9 Spells

function createUniversalCataclysmSpell(): Spell {
  return {
    id: generateSpellId('Universal Cataclysm'),
    name: 'Universal Cataclysm',
    type: 'damage',
    element: 'fire',
    tier: 9,
    manaCost: 450,
    description: 'Triggers a cataclysm on a universal scale, channeling the raw destructive power of cosmic apocalypse.',
    effects: [
      {
        type: 'damage',
        value: 500, // Apocalyptic damage
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'statusEffect',
        value: 100, // Cosmic fire damage per turn
        duration: 3,
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'statModifier',
        value: 80, // Almost completely removes enemy defenses
        duration: 3,
        target: 'enemy',
        element: 'fire',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createEternalOblivionSpell(): Spell {
  return {
    id: generateSpellId('Eternal Oblivion'),
    name: 'Eternal Oblivion',
    type: 'damage',
    element: 'arcane',
    tier: 9,
    manaCost: 470,
    description: 'Consigns the enemy to eternal oblivion, a place beyond space and time where existence itself is erased.',
    effects: [
      {
        type: 'damage',
        value: 550, // Existential erasure damage
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 80, // Ongoing erasure damage
        duration: 4,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createMultiversalNexusSpell(): Spell {
  return {
    id: generateSpellId('Multiversal Nexus'),
    name: 'Multiversal Nexus',
    type: 'damage',
    element: 'arcane',
    tier: 9,
    manaCost: 500,
    description: 'Creates a nexus of infinite realities, subjecting the enemy to the simultaneous destructive forces of countless universes.',
    effects: [
      {
        type: 'damage',
        value: 150, // Initial reality breach
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'damage',
        value: 150, // Secondary reality collapse
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'damage',
        value: 150, // Tertiary dimensional shear
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'damage',
        value: 150, // Final multiversal convergence
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 120, // Ongoing multiversal damage
        duration: 2,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createAscensionSpell(): Spell {
  return {
    id: generateSpellId('Ascension'),
    name: 'Ascension',
    type: 'buff',
    element: 'arcane',
    tier: 9,
    manaCost: 450,
    description: 'Causes the caster to temporarily ascend to a higher plane of existence, gaining godlike powers.',
    effects: [
      {
        type: 'statModifier',
        value: -100, // Complete invulnerability
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 100, // Godlike spell power
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'healing',
        value: 300, // Massive healing
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'manaRestore',
        value: 300, // Massive mana restoration
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 1, // Extra turn effect
        duration: 2, // Two extra turns
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createPrimordialGenesisSpell(): Spell {
  return {
    id: generateSpellId('Primordial Genesis'),
    name: 'Primordial Genesis',
    type: 'healing',
    element: 'earth',
    tier: 9,
    manaCost: 420,
    description: 'Taps into the primordial forces of creation that birthed the world, completely restoring and empowering the caster.',
    effects: [
      {
        type: 'healing',
        value: 600, // Complete healing
        target: 'self',
        element: 'earth',
      },
      {
        type: 'manaRestore',
        value: 400, // Complete mana restoration
        target: 'self',
        element: 'earth',
      },
      {
        type: 'statusEffect',
        value: 80, // Extreme regeneration per turn
        duration: 5,
        target: 'self',
        element: 'earth',
      },
      {
        type: 'statModifier',
        value: -80, // Near-complete damage immunity
        duration: 5,
        target: 'self',
        element: 'earth',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createCosmicResetSpell(): Spell {
  return {
    id: generateSpellId('Cosmic Reset'),
    name: 'Cosmic Reset',
    type: 'healing',
    element: 'arcane',
    tier: 9,
    manaCost: 480,
    description: 'Resets the caster\'s existence to a perfect state while devastating the enemy\'s.',
    effects: [
      {
        type: 'healing',
        value: 999, // Complete healing
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'manaRestore',
        value: 999, // Complete mana restoration
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'damage',
        value: 400, // Massive damage to enemy
        target: 'enemy',
        element: 'arcane',
      },
      // Would ideally remove all negative status effects and apply all positive ones
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createTranscendentFormSpell(): Spell {
  return {
    id: generateSpellId('Transcendent Form'),
    name: 'Transcendent Form',
    type: 'buff',
    element: 'arcane',
    tier: 9,
    manaCost: 430,
    description: 'Transforms the caster into a being of pure energy, transcending the limitations of physical form.',
    effects: [
      {
        type: 'statModifier',
        value: -120, // Complete immunity to physical damage
        duration: 4,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 120, // Godlike spell power
        duration: 4,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 100, // The transcendent form deals massive damage to attackers
        duration: 4,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createOmegaBlastSpell(): Spell {
  return {
    id: generateSpellId('Omega Blast'),
    name: 'Omega Blast',
    type: 'damage',
    element: 'arcane',
    tier: 9,
    manaCost: 490,
    description: 'Channels the power of the omega force, the ultimate destructive power in the multiverse.',
    effects: [
      {
        type: 'damage',
        value: 650, // Apocalyptic damage
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'damage',
        value: 100, // Backlash damage to caster from the immense power
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createCelestialMaelstromSpell(): Spell {
  return {
    id: generateSpellId('Celestial Maelstrom'),
    name: 'Celestial Maelstrom',
    type: 'damage',
    element: 'air',
    tier: 9,
    manaCost: 460,
    description: 'Summons a maelstrom of celestial proportions, channeling the destructive power of colliding galaxies.',
    effects: [
      {
        type: 'damage',
        value: 200, // Initial celestial winds
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'damage',
        value: 200, // Stellar lightning
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'damage',
        value: 200, // Galactic pressure
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'statusEffect',
        value: 150, // Ongoing celestial storm damage
        duration: 3,
        target: 'enemy',
        element: 'air',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createChronoDisruptionSpell(): Spell {
  return {
    id: generateSpellId('Chrono Disruption'),
    name: 'Chrono Disruption',
    type: 'damage',
    element: 'arcane',
    tier: 9,
    manaCost: 470,
    description: 'Disrupts the enemy\'s timeline, causing them to experience their demise from infinite different timelines simultaneously.',
    effects: [
      {
        type: 'damage',
        value: 300, // Initial timeline fracture
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 200, // The target experiences deaths from multiple timelines each turn
        duration: 3,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 150, // Completely removes all defenses
        duration: 3,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

// Tier 10 Spells

function createTotalObliterationSpell(): Spell {
  return {
    id: generateSpellId('Total Obliteration'),
    name: 'Total Obliteration',
    type: 'damage',
    element: 'arcane',
    tier: 10,
    manaCost: 800,
    description: 'The ultimate destructive spell that completely obliterates the target from existence across all possible timelines and realities.',
    effects: [
      {
        type: 'damage',
        value: 1000, // Ultimate damage
        target: 'enemy',
        element: 'arcane',
      },
      // This spell is so powerful it doesn't need additional effects
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createCreationExtinctionCycleSpell(): Spell {
  return {
    id: generateSpellId('Creation-Extinction Cycle'),
    name: 'Creation-Extinction Cycle',
    type: 'damage',
    element: 'arcane',
    tier: 10,
    manaCost: 850,
    description: 'Subjects the enemy to the full cycle of universal creation and extinction, billions of years of cosmic birth and death compressed into moments.',
    effects: [
      {
        type: 'damage',
        value: 300, // Creation phase
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'damage',
        value: 300, // Evolution phase
        target: 'enemy',
        element: 'earth',
      },
      {
        type: 'damage',
        value: 300, // Extinction phase
        target: 'enemy',
        element: 'water',
      },
      {
        type: 'damage',
        value: 300, // Void phase
        target: 'enemy',
        element: 'air',
      },
      {
        type: 'statusEffect',
        value: 300, // Ongoing cycle damage
        duration: 3,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createUltimateRealitySpell(): Spell {
  return {
    id: generateSpellId('Ultimate Reality'),
    name: 'Ultimate Reality',
    type: 'damage',
    element: 'arcane',
    tier: 10,
    manaCost: 900,
    description: 'Confronts the enemy with the ultimate reality that lies beyond all illusion, a truth so terrible it shatters mind, body, and soul.',
    effects: [
      {
        type: 'damage',
        value: 800, // Mind-shattering damage
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 400, // Reality dissolution damage over time
        duration: 3,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 200, // Complete nullification of all defenses
        duration: 3,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createGodheadManifestationSpell(): Spell {
  return {
    id: generateSpellId('Godhead Manifestation'),
    name: 'Godhead Manifestation',
    type: 'buff',
    element: 'arcane',
    tier: 10,
    manaCost: 750,
    description: 'The caster temporarily manifests as a divine being of unlimited power, transcending all limitations of mortal existence.',
    effects: [
      {
        type: 'healing',
        value: 999, // Complete healing
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'manaRestore',
        value: 999, // Complete mana restoration
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: -200, // Complete invulnerability
        duration: 5,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 200, // Godlike spell power
        duration: 5,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 1, // Extra turn effect
        duration: 3, // Three extra turns
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createInfinitySpell(): Spell {
  return {
    id: generateSpellId('Infinity'),
    name: 'Infinity',
    type: 'damage',
    element: 'arcane',
    tier: 10,
    manaCost: 1000,
    description: 'Channels the concept of infinity itself, subjecting the enemy to endless iterations of destruction across infinite dimensions.',
    effects: [
      {
        type: 'damage',
        value: 500, // Initial breach
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'damage',
        value: 500, // Secondary collapse
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'damage',
        value: 500, // Final convergence
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 500, // Infinite recursion damage
        duration: 3,
        target: 'enemy',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createPrimordialOneSpell(): Spell {
  return {
    id: generateSpellId('Primordial One'),
    name: 'Primordial One',
    type: 'healing',
    element: 'arcane',
    tier: 10,
    manaCost: 800,
    description: 'Returns the caster to the primordial state of the One that existed before creation, gaining the power that birthed all reality.',
    effects: [
      {
        type: 'healing',
        value: 999, // Complete healing
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'manaRestore',
        value: 999, // Complete mana restoration
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: -500, // Absolute invulnerability
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'damage',
        value: 500, // Unleash creation energy on enemy
        target: 'enemy',
        element: 'arcane',
      },
      // Removes all negative effects and applies all buffs
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createOmnipotenceSpell(): Spell {
  return {
    id: generateSpellId('Omnipotence'),
    name: 'Omnipotence',
    type: 'buff',
    element: 'arcane',
    tier: 10,
    manaCost: 950,
    description: 'Grants the caster temporary omnipotence, the state of unlimited power and ability to do anything.',
    effects: [
      {
        type: 'statModifier',
        value: -999, // Beyond invulnerability
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statModifier',
        value: 999, // Beyond godlike spell power
        duration: 3,
        target: 'self',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 500, // Passive damage to all enemies from mere presence
        duration: 3,
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'statusEffect',
        value: 1, // Extra turn effect
        duration: 5, // Five extra turns
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createHeatDeathSpell(): Spell {
  return {
    id: generateSpellId('Heat Death'),
    name: 'Heat Death',
    type: 'damage',
    element: 'fire',
    tier: 10,
    manaCost: 880,
    description: 'Subjects the enemy to the heat death of the universe, the ultimate entropic end where all energy is exhausted.',
    effects: [
      {
        type: 'damage',
        value: 600, // Entropy damage
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'statusEffect',
        value: 400, // Ongoing entropy damage
        duration: 5,
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'statModifier',
        value: 300, // Energy depletion - completely removes defenses
        duration: 5,
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'manaRestore',
        value: -300, // Drains enemy mana (would require implementation)
        target: 'enemy',
        element: 'fire',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createBigBangSpell(): Spell {
  return {
    id: generateSpellId('Big Bang'),
    name: 'Big Bang',
    type: 'damage',
    element: 'fire',
    tier: 10,
    manaCost: 920,
    description: 'Recreates the Big Bang, the primordial explosion that birthed the universe, focusing all its energy on the enemy.',
    effects: [
      {
        type: 'damage',
        value: 1500, // Ultimate cosmic damage
        target: 'enemy',
        element: 'fire',
      },
      {
        type: 'damage',
        value: 300, // Backlash damage to caster from the colossal energies
        target: 'self',
        element: 'fire',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

function createSingularitySpell(): Spell {
  return {
    id: generateSpellId('Singularity'),
    name: 'Singularity',
    type: 'damage',
    element: 'arcane',
    tier: 10,
    manaCost: 999,
    description: 'Creates a true singularity, a point of infinite density and zero volume, that consumes the enemy completely.',
    effects: [
      {
        type: 'damage',
        value: 2000, // Beyond ultimate damage
        target: 'enemy',
        element: 'arcane',
      },
      {
        type: 'damage',
        value: 500, // Extreme backlash damage to caster
        target: 'self',
        element: 'arcane',
      },
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}
