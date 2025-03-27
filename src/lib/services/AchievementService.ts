import { useGameStateStore } from '../game-state/gameStateStore';
import { 
  Achievement,
  PlayerStats,
  BattleRecord,
  BattleOutcome
} from '../types';

/**
 * Achievement Service to check for and trigger achievements based on game events
 */
export class AchievementService {
  private static instance: AchievementService;
  
  /**
   * Get the singleton instance of the AchievementService
   */
  public static getInstance(): AchievementService {
    if (!AchievementService.instance) {
      AchievementService.instance = new AchievementService();
    }
    return AchievementService.instance;
  }
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {}
  
  /**
   * Check if any achievements should be unlocked based on the current player stats
   * @param stats Current player stats
   * @param achievements List of all achievements
   * @param unlockCallback Callback to unlock an achievement
   */
  public checkStatsBasedAchievements(
    stats: PlayerStats, 
    achievements: Achievement[],
    unlockCallback: (achievementId: string) => void
  ): void {
    // Check level-based achievements
    this.checkLevelAchievements(stats.level, achievements, unlockCallback);
    
    // Check battle-based achievements
    this.checkBattleAchievements(stats, achievements, unlockCallback);
    
    // Check collection-based achievements
    this.checkCollectionAchievements(stats, achievements, unlockCallback);
    
    // Check choice-based achievements
    this.checkChoiceAchievements(stats.totalChoicesMade, achievements, unlockCallback);
    
    // Check playtime achievements
    this.checkPlaytimeAchievements(stats.totalGameTime, achievements, unlockCallback);
  }
  
  /**
   * Check for achievements related to player level
   */
  private checkLevelAchievements(
    level: number, 
    achievements: Achievement[],
    unlockCallback: (achievementId: string) => void
  ): void {
    // Find level-based achievements that aren't unlocked yet
    const levelAchievements = achievements.filter(
      a => !a.unlocked && a.description.toLowerCase().includes('level') 
    );
    
    for (const achievement of levelAchievements) {
      // Simple parsing to extract level requirements from descriptions
      // In a real implementation, we might have more structured data
      
      // Check for "reach level X" type achievements
      const levelMatch = achievement.description.match(/reach level (\d+)/i);
      if (levelMatch && levelMatch[1]) {
        const requiredLevel = parseInt(levelMatch[1], 10);
        if (level >= requiredLevel) {
          unlockCallback(achievement.id);
        }
      }
    }
  }
  
  /**
   * Check for achievements related to battles
   */
  private checkBattleAchievements(
    stats: PlayerStats,
    achievements: Achievement[],
    unlockCallback: (achievementId: string) => void
  ): void {
    // Find battle-related achievements that aren't unlocked yet
    const battleAchievements = achievements.filter(
      a => !a.unlocked && (
        a.description.toLowerCase().includes('battle') ||
        a.description.toLowerCase().includes('win') ||
        a.description.toLowerCase().includes('defeat')
      )
    );
    
    for (const achievement of battleAchievements) {
      // Check for "win X battles" type achievements
      const winMatch = achievement.description.match(/win (\d+) battles/i);
      if (winMatch && winMatch[1]) {
        const requiredWins = parseInt(winMatch[1], 10);
        if (stats.battlesWon >= requiredWins) {
          unlockCallback(achievement.id);
        }
      }
      
      // Check for battle win rate achievements
      if (achievement.description.toLowerCase().includes('win rate')) {
        const winRate = stats.battlesWon / (stats.battlesWon + stats.battlesLost) * 100;
        
        if (winRate >= 75 && stats.battlesWon + stats.battlesLost >= 20) {
          unlockCallback(achievement.id);
        }
      }
      
      // Check for damage-based achievements
      if (achievement.description.toLowerCase().includes('damage')) {
        const damageMatch = achievement.description.match(/deal (\d+) damage/i);
        if (damageMatch && damageMatch[1]) {
          const requiredDamage = parseInt(damageMatch[1], 10);
          if (stats.totalDamageDealt >= requiredDamage) {
            unlockCallback(achievement.id);
          }
        }
      }
    }
  }
  
  /**
   * Check for achievements related to item collection
   */
  private checkCollectionAchievements(
    stats: PlayerStats,
    achievements: Achievement[],
    unlockCallback: (achievementId: string) => void
  ): void {
    // Find collection-based achievements that aren't unlocked yet
    const collectionAchievements = achievements.filter(
      a => !a.unlocked && (
        a.description.toLowerCase().includes('collect') ||
        a.description.toLowerCase().includes('items') ||
        a.description.toLowerCase().includes('spells')
      )
    );
    
    for (const achievement of collectionAchievements) {
      // Check for "collect X items" type achievements
      const itemMatch = achievement.description.match(/collect (\d+) (?:items|unique items)/i);
      if (itemMatch && itemMatch[1]) {
        const requiredItems = parseInt(itemMatch[1], 10);
        if (stats.itemsCollected >= requiredItems) {
          unlockCallback(achievement.id);
        }
      }
      
      // Check for "learn X spells" type achievements
      const spellMatch = achievement.description.match(/learn (\d+) (?:spells|different spells)/i);
      if (spellMatch && spellMatch[1]) {
        const requiredSpells = parseInt(spellMatch[1], 10);
        if (stats.spellsLearned >= requiredSpells) {
          unlockCallback(achievement.id);
        }
      }
      
      // Check for potion-related achievements
      if (achievement.description.toLowerCase().includes('potion')) {
        const potionMatch = achievement.description.match(/use (\d+) potions/i);
        if (potionMatch && potionMatch[1]) {
          const requiredPotions = parseInt(potionMatch[1], 10);
          if (stats.potionsUsed >= requiredPotions) {
            unlockCallback(achievement.id);
          }
        }
      }
    }
  }
  
  /**
   * Check for achievements related to choices made
   */
  private checkChoiceAchievements(
    totalChoices: number,
    achievements: Achievement[],
    unlockCallback: (achievementId: string) => void
  ): void {
    // Find choice-based achievements that aren't unlocked yet
    const choiceAchievements = achievements.filter(
      a => !a.unlocked && a.description.toLowerCase().includes('choice')
    );
    
    for (const achievement of choiceAchievements) {
      // Check for "make X choices" type achievements
      const choiceMatch = achievement.description.match(/make (\d+) choices/i);
      if (choiceMatch && choiceMatch[1]) {
        const requiredChoices = parseInt(choiceMatch[1], 10);
        if (totalChoices >= requiredChoices) {
          unlockCallback(achievement.id);
        }
      }
    }
  }
  
  /**
   * Check for achievements related to playtime
   */
  private checkPlaytimeAchievements(
    totalGameTime: number,
    achievements: Achievement[],
    unlockCallback: (achievementId: string) => void
  ): void {
    // Find playtime-based achievements that aren't unlocked yet
    const timeAchievements = achievements.filter(
      a => !a.unlocked && (
        a.description.toLowerCase().includes('hours') ||
        a.description.toLowerCase().includes('playtime')
      )
    );
    
    // Convert seconds to hours
    const hoursPlayed = totalGameTime / 3600;
    
    for (const achievement of timeAchievements) {
      // Check for "play for X hours" type achievements
      const hourMatch = achievement.description.match(/play for (\d+) hours/i);
      if (hourMatch && hourMatch[1]) {
        const requiredHours = parseInt(hourMatch[1], 10);
        if (hoursPlayed >= requiredHours) {
          unlockCallback(achievement.id);
        }
      }
    }
  }
  
  /**
   * Handle a completed battle event to check for related achievements
   */
  public handleBattleComplete(
    battleRecord: BattleRecord,
    achievements: Achievement[],
    unlockCallback: (achievementId: string) => void
  ): void {
    // Victory-specific achievements
    if (battleRecord.outcome === 'victory') {
      // Check for flawless victory achievements
      if (battleRecord.damageTaken === 0) {
        const flawlessAchievement = achievements.find(
          a => !a.unlocked && a.description.toLowerCase().includes('flawless')
        );
        if (flawlessAchievement) {
          unlockCallback(flawlessAchievement.id);
        }
      }
      
      // Check for specific enemy defeats
      const enemyAchievements = achievements.filter(
        a => !a.unlocked && a.description.toLowerCase().includes('defeat') &&
             a.description.toLowerCase().includes(battleRecord.enemyName.toLowerCase())
      );
      
      for (const achievement of enemyAchievements) {
        unlockCallback(achievement.id);
      }
    }
    
    // Check for spell casting achievements
    if (battleRecord.spellsCast.total >= 10) {
      const spellCastingAchievement = achievements.find(
        a => !a.unlocked && a.description.toLowerCase().includes('cast') &&
             a.description.toLowerCase().includes('spells in one battle')
      );
      if (spellCastingAchievement) {
        unlockCallback(spellCastingAchievement.id);
      }
    }
  }
}

/**
 * React hook to use the achievement service
 */
export const useAchievementService = () => {
  const { gameState, updateGameState } = useGameStateStore();
  const { achievements } = gameState;
  const service = AchievementService.getInstance();
  
  const checkAchievement = (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (!achievement || achievement.unlocked) return false;

    // Check achievement conditions
    const shouldUnlock = checkAchievementConditions(achievement);
    
    if (shouldUnlock) {
      unlockAchievement(achievementId);
      return true;
    }
    
    return false;
  };

  const unlockAchievement = (achievementId: string) => {
    updateGameState(prev => ({
      ...prev,
      achievements: prev.achievements.map(achievement => 
        achievement.id === achievementId
          ? { ...achievement, unlocked: true, unlockedDate: new Date() }
          : achievement
      )
    }));
  };

  const checkAchievementConditions = (achievement: Achievement): boolean => {
    // Implement achievement condition checks here
    return false; // Placeholder
  };

  // Function to handle battle completion
  const handleBattleComplete = (battleRecord: BattleRecord) => {
    // First add the battle record
    updateGameState(prev => ({
      ...prev,
      battleRecords: [...prev.battleRecords, battleRecord]
    }));
    
    // Then check for battle-related achievements
    service.handleBattleComplete(
      battleRecord,
      achievements,
      unlockAchievement
    );
    
    // Finally check for any stat-based achievements that might be triggered
    service.checkStatsBasedAchievements(
      gameState.playerStats,
      achievements,
      unlockAchievement
    );
    
    // Save the updated profile data
    updateGameState(prev => ({
      ...prev,
      playerStats: {
        ...prev.playerStats,
        totalGameTime: prev.playerStats.totalGameTime + battleRecord.duration
      }
    }));
  };
  
  return {
    checkAchievement,
    unlockAchievement,
    handleBattleComplete
  };
}; 