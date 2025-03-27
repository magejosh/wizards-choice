import { 
  PlayerStats, 
  Achievement, 
  PlayerTitle, 
  BattleRecord,
  SpellCastRecord,
  BattleOutcome
} from '../types';
import { GameState } from './GameStateContext';

// Mock player stats
export const mockPlayerStats: PlayerStats = {
  level: 12,
  experience: 8750,
  currentHealth: 120,
  maxHealth: 150,
  mana: 85,
  gold: 2543,
  
  chaptersCompleted: 3,
  totalChoicesMade: 147,
  totalGameTime: 12600, // 3.5 hours
  gameStartDate: new Date(Date.now() - 864000000).toISOString(), // 10 days ago
  
  battlesWon: 32,
  battlesLost: 7,
  totalDamageDealt: 4823,
  
  achievementsUnlocked: 14,
  totalAchievements: 25,
  mostRecentAchievement: "Flame Mastery",
  
  titlesUnlocked: 5,
  totalTitles: 12,
  currentTitle: "Flamecaller",
  
  itemsCollected: 37,
  spellsLearned: 16,
  potionsUsed: 22
};

// Mock achievements
export const mockAchievements: Achievement[] = [
  {
    id: "achieve_1",
    name: "First Steps",
    description: "Complete the tutorial and begin your magical journey",
    unlocked: true,
    unlockedDate: new Date(Date.now() - 864000000).toISOString(),
    currentProgress: 1,
    requiredProgress: 1
  },
  {
    id: "achieve_2",
    name: "Apprentice No More",
    description: "Reach level 5 and graduate from apprentice status",
    unlocked: true,
    unlockedDate: new Date(Date.now() - 432000000).toISOString(),
    currentProgress: 5,
    requiredProgress: 5,
    reward: "+5 max mana"
  },
  {
    id: "achieve_3",
    name: "Flame Mastery",
    description: "Cast 50 fire spells",
    unlocked: true,
    unlockedDate: new Date(Date.now() - 86400000).toISOString(),
    currentProgress: 50,
    requiredProgress: 50,
    reward: "New fire spell: Inferno"
  },
  {
    id: "achieve_4",
    name: "Collector",
    description: "Collect 50 unique items",
    unlocked: false,
    currentProgress: 37,
    requiredProgress: 50,
    reward: "Extra inventory space"
  },
  {
    id: "achieve_5",
    name: "Battle Hardened",
    description: "Win 50 battles",
    unlocked: false,
    currentProgress: 32,
    requiredProgress: 50,
    reward: "+10 max health"
  },
  {
    id: "achieve_6",
    name: "Alchemist",
    description: "Use 25 potions",
    unlocked: false,
    currentProgress: 22,
    requiredProgress: 25,
    reward: "Potion duration increased by 25%"
  },
  {
    id: "achieve_7",
    name: "Decision Maker",
    description: "Make 200 choices in your adventure",
    unlocked: false,
    currentProgress: 147,
    requiredProgress: 200
  },
  {
    id: "achieve_8",
    name: "Arcane Scholar",
    description: "Learn 20 different spells",
    unlocked: false,
    currentProgress: 16,
    requiredProgress: 20,
    reward: "Spell cost reduced by 10%"
  }
];

// Mock titles
export const mockTitles: PlayerTitle[] = [
  {
    id: "title_1",
    name: "Novice",
    description: "A beginner wizard still learning the basics",
    category: "Progression",
    unlocked: true,
    unlockedDate: new Date(Date.now() - 864000000).toISOString()
  },
  {
    id: "title_2",
    name: "Adept",
    description: "A wizard who has mastered the fundamentals",
    category: "Progression",
    unlocked: true,
    unlockedDate: new Date(Date.now() - 432000000).toISOString(),
    requirement: "Reach level 10",
    bonus: "+5% spell effectiveness"
  },
  {
    id: "title_3",
    name: "Flamecaller",
    description: "A wizard specialized in fire magic",
    category: "Specialization",
    unlocked: true,
    unlockedDate: new Date(Date.now() - 259200000).toISOString(),
    requirement: "Cast 50 fire spells",
    bonus: "+15% fire spell damage"
  },
  {
    id: "title_4",
    name: "Battle Mage",
    description: "A wizard who excels in magical combat",
    category: "Combat",
    unlocked: true,
    unlockedDate: new Date(Date.now() - 172800000).toISOString(),
    requirement: "Win 30 battles",
    bonus: "+10% combat spell effectiveness"
  },
  {
    id: "title_5",
    name: "Archmage",
    description: "A wizard of great power and knowledge",
    category: "Progression",
    unlocked: true,
    unlockedDate: new Date(Date.now() - 86400000).toISOString(),
    requirement: "Reach level 30",
    bonus: "+10% to all magical abilities"
  },
  {
    id: "title_6",
    name: "Elementalist",
    description: "A wizard who has mastered all elemental magic",
    category: "Specialization",
    unlocked: false,
    requirement: "Learn 5 spells from each element",
    bonus: "+5% to all elemental damage"
  },
  {
    id: "title_7",
    name: "Potion Master",
    description: "A wizard skilled in the art of potion-making",
    category: "Crafting",
    unlocked: false,
    requirement: "Craft 30 potions",
    bonus: "+25% potion effectiveness"
  }
];

// Mock battle history
const createSpellCastRecord = (total: number): SpellCastRecord => ({
  total,
  byType: {
    attack: Math.floor(total * 0.6),
    healing: Math.floor(total * 0.2),
    debuff: Math.floor(total * 0.1),
    buff: Math.floor(total * 0.1)
  },
  byElement: {
    fire: Math.floor(total * 0.4),
    water: Math.floor(total * 0.2),
    earth: Math.floor(total * 0.2),
    air: Math.floor(total * 0.1),
    arcane: Math.floor(total * 0.1)
  }
});

export const mockBattleHistory: BattleRecord[] = [
  {
    id: "battle_1",
    enemyName: "Fire Elemental",
    chapterName: "The Burning Tower",
    outcome: "victory" as BattleOutcome,
    date: new Date(Date.now() - 86400000).toISOString(),
    duration: 8,
    damageDealt: 230,
    damageTaken: 85,
    spellsCast: createSpellCastRecord(6),
    itemsUsed: 2,
    rewards: "150 gold, Fire Crystal",
    notes: "Tough battle, had to use fire resistance potion"
  },
  {
    id: "battle_2",
    enemyName: "Shadow Assassin",
    chapterName: "The Dark Alley",
    outcome: "victory" as BattleOutcome,
    date: new Date(Date.now() - 172800000).toISOString(),
    duration: 5,
    damageDealt: 185,
    damageTaken: 120,
    spellsCast: createSpellCastRecord(4),
    itemsUsed: 1,
    rewards: "100 gold, Shadow Cloak"
  },
  {
    id: "battle_3",
    enemyName: "Arcane Golem",
    chapterName: "The Ancient Laboratory",
    outcome: "defeat" as BattleOutcome,
    date: new Date(Date.now() - 259200000).toISOString(),
    duration: 12,
    damageDealt: 210,
    damageTaken: 200,
    spellsCast: createSpellCastRecord(9),
    itemsUsed: 3,
    notes: "Golem had strong magic resistance, need better strategy"
  },
  {
    id: "battle_4",
    enemyName: "Ice Wolf",
    chapterName: "The Frozen Forest",
    outcome: "victory" as BattleOutcome,
    date: new Date(Date.now() - 345600000).toISOString(),
    duration: 6,
    damageDealt: 160,
    damageTaken: 70,
    spellsCast: createSpellCastRecord(5),
    itemsUsed: 1,
    rewards: "120 gold, Wolf's Fang"
  },
  {
    id: "battle_5",
    enemyName: "Grand Sorcerer",
    chapterName: "The Wizard's Tower",
    outcome: "defeat" as BattleOutcome,
    date: new Date(Date.now() - 432000000).toISOString(),
    duration: 15,
    damageDealt: 280,
    damageTaken: 250,
    spellsCast: createSpellCastRecord(12),
    itemsUsed: 4,
    notes: "Need to learn counterspells for arcane magic"
  }
];

// Complete mock game state
export const mockGameState: GameState = {
  playerName: "Merlin",
  playerStats: mockPlayerStats,
  achievements: mockAchievements,
  battleHistory: mockBattleHistory,
  titles: mockTitles,
  equippedTitleId: "title_3" // Flamecaller
}; 