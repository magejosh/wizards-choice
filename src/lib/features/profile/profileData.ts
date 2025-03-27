import { Achievement, PlayerTitle, ElementType } from '../../types';

/**
 * Default achievements for the player profile system
 */
export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // Combat Achievements
  {
    id: 'achievement-elemental-master',
    name: 'Elemental Master',
    description: 'Cast 50 spells of each elemental type',
    category: 'combat',
    progress: 0,
    requiredProgress: 50,
    unlocked: false,
    reward: {
      type: 'stat_bonus',
      value: 5,
      stat: 'spellPower'
    },
    icon: '/images/achievements/elemental_master.png'
  },
  {
    id: 'achievement-unstoppable',
    name: 'Unstoppable',
    description: 'Win 10 battles without taking damage',
    category: 'combat',
    progress: 0,
    requiredProgress: 10,
    unlocked: false,
    reward: {
      type: 'stat_bonus',
      value: 10,
      stat: 'maxHealth'
    },
    icon: '/images/achievements/unstoppable.png'
  },
  {
    id: 'achievement-mana-efficient',
    name: 'Mana Efficient',
    description: 'Win a battle using less than 50 total mana',
    category: 'combat',
    progress: 0,
    requiredProgress: 1,
    unlocked: false,
    reward: {
      type: 'stat_bonus',
      value: 5,
      stat: 'manaCostReduction'
    },
    icon: '/images/achievements/mana_efficient.png'
  },
  {
    id: 'achievement-battle-hardened',
    name: 'Battle Hardened',
    description: 'Win 100 battles',
    category: 'combat',
    progress: 0,
    requiredProgress: 100,
    unlocked: false,
    reward: {
      type: 'stat_bonus',
      value: 15,
      stat: 'maxHealth'
    },
    icon: '/images/achievements/battle_hardened.png'
  },
  {
    id: 'achievement-mystic-striker',
    name: 'Mystic Striker',
    description: 'Defeat an enemy using only Mystic Punch',
    category: 'combat',
    progress: 0,
    requiredProgress: 1,
    unlocked: false,
    reward: {
      type: 'stat_bonus',
      value: 10,
      stat: 'mysticPunchPower'
    },
    icon: '/images/achievements/mystic_striker.png'
  },

  // Collection Achievements
  {
    id: 'achievement-potion-prodigy',
    name: 'Potion Prodigy',
    description: 'Craft 20 different potion recipes',
    category: 'collection',
    progress: 0,
    requiredProgress: 20,
    unlocked: false,
    reward: {
      type: 'recipe',
      value: 1,
      itemId: 'recipe-ultimate-healing'
    },
    icon: '/images/achievements/potion_prodigy.png'
  },
  {
    id: 'achievement-arsenal-of-magic',
    name: 'Arsenal of Magic',
    description: 'Collect 50 unique spells',
    category: 'collection',
    progress: 0,
    requiredProgress: 50,
    unlocked: false,
    reward: {
      type: 'stat_bonus',
      value: 1,
      stat: 'extraCardDraw'
    },
    icon: '/images/achievements/arsenal_of_magic.png'
  },
  {
    id: 'achievement-geared-up',
    name: 'Geared Up',
    description: 'Collect one equipment item of each rarity',
    category: 'collection',
    progress: 0,
    requiredProgress: 5, // common, uncommon, rare, epic, legendary
    unlocked: false,
    reward: {
      type: 'stat_bonus',
      value: 5,
      stat: 'defense'
    },
    icon: '/images/achievements/geared_up.png'
  },
  {
    id: 'achievement-scroll-sage',
    name: 'Scroll Sage',
    description: 'Learn 10 spells from scrolls',
    category: 'collection',
    progress: 0,
    requiredProgress: 10,
    unlocked: false,
    reward: {
      type: 'gold',
      value: 500
    },
    icon: '/images/achievements/scroll_sage.png'
  },

  // Exploration Achievements
  {
    id: 'achievement-market-magnate',
    name: 'Market Magnate',
    description: 'Visit all market locations',
    category: 'exploration',
    progress: 0,
    requiredProgress: 13, // Total number of markets
    unlocked: false,
    reward: {
      type: 'gold',
      value: 1000
    },
    icon: '/images/achievements/market_magnate.png'
  },
  {
    id: 'achievement-experienced-trader',
    name: 'Experienced Trader',
    description: 'Complete 50 market transactions',
    category: 'exploration',
    progress: 0,
    requiredProgress: 50,
    unlocked: false,
    reward: {
      type: 'stat_bonus',
      value: 10,
      stat: 'marketDiscount'
    },
    icon: '/images/achievements/experienced_trader.png'
  },
  
  // Mastery Achievements
  {
    id: 'achievement-flawless-victor',
    name: 'Flawless Victor',
    description: 'Achieve 25 flawless victories',
    category: 'mastery',
    progress: 0,
    requiredProgress: 25,
    unlocked: false,
    reward: {
      type: 'stat_bonus',
      value: 10,
      stat: 'defense'
    },
    icon: '/images/achievements/flawless_victor.png'
  },
  {
    id: 'achievement-spell-specialist',
    name: 'Spell Specialist',
    description: 'Cast 1000 spells',
    category: 'mastery',
    progress: 0,
    requiredProgress: 1000,
    unlocked: false,
    reward: {
      type: 'stat_bonus',
      value: 10,
      stat: 'manaRegen'
    },
    icon: '/images/achievements/spell_specialist.png'
  }
];

/**
 * Default titles for the player profile system
 */
export const DEFAULT_TITLES: PlayerTitle[] = [
  // Progression Titles
  {
    id: 'title-apprentice',
    name: 'Apprentice',
    description: 'A beginner wizard still learning the basics of magic',
    category: 'progression',
    unlocked: true, // Player starts with this title
    unlockedDate: new Date().toISOString(),
    equipped: true,
    requiredLevel: 1,
    bonus: {
      stat: 'spellPower',
      value: 1
    },
    icon: '/images/titles/apprentice.png'
  },
  {
    id: 'title-adept',
    name: 'Adept',
    description: 'A wizard who has mastered the fundamentals of magic',
    category: 'progression',
    unlocked: false,
    equipped: false,
    requiredLevel: 15,
    bonus: {
      stat: 'spellPower',
      value: 2
    },
    icon: '/images/titles/adept.png'
  },
  {
    id: 'title-master',
    name: 'Master',
    description: 'A wizard with great knowledge and power',
    category: 'progression',
    unlocked: false,
    equipped: false,
    requiredLevel: 25,
    bonus: {
      stat: 'spellPower',
      value: 3
    },
    icon: '/images/titles/master.png'
  },
  {
    id: 'title-archmage',
    name: 'Archmage',
    description: 'A wizard of legendary skill and ability',
    category: 'progression',
    unlocked: false,
    equipped: false,
    requiredLevel: 40,
    bonus: {
      stat: 'spellPower',
      value: 4
    },
    icon: '/images/titles/archmage.png'
  },

  // Specialization Titles
  {
    id: 'title-pyromancer',
    name: 'Pyromancer',
    description: 'A wizard specialized in the elemental magic of fire',
    category: 'specialization',
    unlocked: false,
    equipped: false,
    requiredStats: [
      {
        stat: 'elementalDamage.fire',
        value: 10000
      }
    ],
    bonus: {
      stat: 'manaCostReduction',
      value: 5,
      element: 'fire'
    },
    icon: '/images/titles/pyromancer.png'
  },
  {
    id: 'title-aquamancer',
    name: 'Aquamancer',
    description: 'A wizard specialized in the elemental magic of water',
    category: 'specialization',
    unlocked: false,
    equipped: false,
    requiredStats: [
      {
        stat: 'spellsCast.byElement.water',
        value: 200
      }
    ],
    bonus: {
      stat: 'spellPower',
      value: 5,
      element: 'water'
    },
    icon: '/images/titles/aquamancer.png'
  },
  {
    id: 'title-terramancer',
    name: 'Terramancer',
    description: 'A wizard specialized in the elemental magic of earth',
    category: 'specialization',
    unlocked: false,
    equipped: false,
    requiredStats: [
      {
        stat: 'elementalDamage.earth',
        value: 5000
      }
    ],
    bonus: {
      stat: 'defense',
      value: 5,
      element: 'earth'
    },
    icon: '/images/titles/terramancer.png'
  },

  // Achievement Titles
  {
    id: 'title-tactical-genius',
    name: 'Tactical Genius',
    description: 'A wizard who values efficiency and strategic perfection',
    category: 'achievement',
    unlocked: false,
    equipped: false,
    requiredAchievements: ['achievement-unstoppable', 'achievement-mana-efficient'],
    bonus: {
      stat: 'extraCardDraw',
      value: 1
    },
    icon: '/images/titles/tactical_genius.png'
  },
  {
    id: 'title-potion-master',
    name: 'Potion Master',
    description: 'A wizard with exceptional skill in brewing magical concoctions',
    category: 'achievement',
    unlocked: false,
    equipped: false,
    requiredAchievements: ['achievement-potion-prodigy'],
    bonus: {
      stat: 'potionEffectiveness',
      value: 10
    },
    icon: '/images/titles/potion_master.png'
  },
  {
    id: 'title-spell-collector',
    name: 'Spell Collector',
    description: 'A wizard who has amassed an impressive collection of magical knowledge',
    category: 'achievement',
    unlocked: false,
    equipped: false,
    requiredAchievements: ['achievement-arsenal-of-magic'],
    bonus: {
      stat: 'extraCardDrawChance',
      value: 5
    },
    icon: '/images/titles/spell_collector.png'
  }
];

/**
 * Initialize the profile data for a new player
 */
export const initializeProfileData = () => {
  return {
    achievements: DEFAULT_ACHIEVEMENTS,
    titles: DEFAULT_TITLES
  };
};

/**
 * Check for achievements that should be unlocked based on the player's stats
 */
export const checkAchievements = (achievements: Achievement[], playerStats: any) => {
  const updatedAchievements = [...achievements];
  
  for (let i = 0; i < updatedAchievements.length; i++) {
    const achievement = updatedAchievements[i];
    
    // Skip already unlocked achievements
    if (achievement.unlocked) continue;
    
    let progress = 0;
    
    // Calculate progress based on the achievement type
    switch (achievement.id) {
      case 'achievement-battle-hardened':
        progress = playerStats.battlesWon || 0;
        break;
        
      case 'achievement-unstoppable':
        progress = playerStats.flawlessVictories || 0;
        break;
        
      case 'achievement-spell-specialist':
        progress = playerStats.spellsCast?.total || 0;
        break;
        
      case 'achievement-arsenal-of-magic':
        progress = playerStats.spellsAcquired || 0;
        break;
        
      case 'achievement-potion-prodigy':
        progress = playerStats.recipesDiscovered || 0;
        break;
        
      case 'achievement-scroll-sage':
        progress = playerStats.scrollsUsed || 0;
        break;
        
      case 'achievement-flawless-victor':
        progress = playerStats.flawlessVictories || 0;
        break;
        
      case 'achievement-geared-up':
        // This would need to be checked against inventory, not just stats
        // Will need special handling elsewhere
        break;
        
      // Add more cases for other achievements
    }
    
    // Update the achievement progress if needed
    if (progress > achievement.progress) {
      updatedAchievements[i] = {
        ...achievement,
        progress
      };
    }
  }
  
  return updatedAchievements;
};

/**
 * Check for titles that should be unlocked based on the player's level, achievements, and stats
 */
export const checkTitles = (
  titles: PlayerTitle[], 
  playerLevel: number,
  unlockedAchievements: string[],
  playerStats: any
) => {
  const updatedTitles = [...titles];
  
  for (let i = 0; i < updatedTitles.length; i++) {
    const title = updatedTitles[i];
    
    // Skip already unlocked titles
    if (title.unlocked) continue;
    
    let shouldUnlock = true;
    
    // Check level requirement
    if (title.requiredLevel && playerLevel < title.requiredLevel) {
      shouldUnlock = false;
    }
    
    // Check achievement requirements
    if (shouldUnlock && title.requiredAchievements && title.requiredAchievements.length > 0) {
      for (const achievementId of title.requiredAchievements) {
        if (!unlockedAchievements.includes(achievementId)) {
          shouldUnlock = false;
          break;
        }
      }
    }
    
    // Check stat requirements
    if (shouldUnlock && title.requiredStats && title.requiredStats.length > 0) {
      for (const statReq of title.requiredStats) {
        // Get the nested stat value (e.g., "elementalDamage.fire")
        const statPath = statReq.stat.split('.');
        let statValue = playerStats;
        
        for (const key of statPath) {
          statValue = statValue?.[key];
          if (statValue === undefined) {
            break;
          }
        }
        
        if (typeof statValue !== 'number' || statValue < statReq.value) {
          shouldUnlock = false;
          break;
        }
      }
    }
    
    // Unlock the title if all requirements are met
    if (shouldUnlock) {
      updatedTitles[i] = {
        ...title,
        unlocked: true,
        unlockedDate: new Date().toISOString()
      };
    }
  }
  
  return updatedTitles;
}; 