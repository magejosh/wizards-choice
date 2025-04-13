import React from 'react';
import { PlayerStats } from '../../lib/types';
import styles from './PlayerProfile.module.css';

interface StatsSummaryProps {
  stats: PlayerStats;
  onExportStats: () => void;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ stats, onExportStats }) => {
  // Helper function to format time in hours, minutes, seconds
  const formatTime = (seconds: number): string => {
    if (!seconds) return '0m 0s';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    let result = '';
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || hours > 0) result += `${minutes}m `;
    result += `${remainingSeconds}s`;
    
    return result;
  };
  
  return (
    <div>
      <div className={styles.summaryContainer}>
        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Game Progress</h3>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Chapters Completed:</span>
            <span className={styles.statValue}>{stats.chaptersCompleted || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Quests Completed:</span>
            <span className={styles.statValue}>{stats.questsCompleted || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Play Time:</span>
            <span className={styles.statValue}>{formatTime(stats.playTime || 0)}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Days Played:</span>
            <span className={styles.statValue}>{stats.totalDaysPlayed || 0}</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Combat</h3>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Battles Won:</span>
            <span className={styles.statValue}>{stats.battlesWon || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Battles Lost:</span>
            <span className={styles.statValue}>{stats.battlesLost || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Win Rate:</span>
            <span className={styles.statValue}>
              {stats.battlesWon || stats.battlesLost ? 
                `${Math.round((stats.battlesWon || 0) / ((stats.battlesWon || 0) + (stats.battlesLost || 0)) * 100)}%` : 
                '0%'}
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Longest Win Streak:</span>
            <span className={styles.statValue}>{stats.longestWinStreak || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Enemies Defeated:</span>
            <span className={styles.statValue}>{stats.enemiesDefeated || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Bosses Defeated:</span>
            <span className={styles.statValue}>{stats.bossesDefeated || 0}</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Spellcasting</h3>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Spells Cast:</span>
            <span className={styles.statValue}>{stats.spellsCast || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Damage Dealt:</span>
            <span className={styles.statValue}>{stats.damageDealt || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Damage Received:</span>
            <span className={styles.statValue}>{stats.damageReceived || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Critical Hits:</span>
            <span className={styles.statValue}>{stats.criticalHits || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Highest Combo:</span>
            <span className={styles.statValue}>{stats.highestCombo || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Mana Spent:</span>
            <span className={styles.statValue}>{stats.totalManaSpent || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Most Damage in One Turn:</span>
            <span className={styles.statValue}>{stats.mostDamageInOneTurn || 0}</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Economy</h3>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Gold Earned:</span>
            <span className={styles.statValue}>{stats.goldEarned || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Gold Spent:</span>
            <span className={styles.statValue}>{stats.totalGoldSpent || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Experience Gained:</span>
            <span className={styles.statValue}>{stats.totalExperienceGained || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Most Gold from One Battle:</span>
            <span className={styles.statValue}>{stats.mostGoldEarnedInOneBattle || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Most XP from One Battle:</span>
            <span className={styles.statValue}>{stats.mostExperienceEarnedInOneBattle || 0}</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Inventory</h3>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Items Found:</span>
            <span className={styles.statValue}>{stats.itemsFound || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Spells Learned:</span>
            <span className={styles.statValue}>{stats.spellsLearned || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Potions Crafted:</span>
            <span className={styles.statValue}>{stats.potionsCrafted || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Potions Used:</span>
            <span className={styles.statValue}>{stats.potionsUsed || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Scrolls Used:</span>
            <span className={styles.statValue}>{stats.totalScrollsUsed || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Ingredients Collected:</span>
            <span className={styles.statValue}>{stats.totalIngredientsCollected || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Equipment Found:</span>
            <span className={styles.statValue}>{stats.totalEquipmentFound || 0}</span>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Achievements</h3>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Achievements Unlocked:</span>
            <span className={styles.statValue}>{stats.achievementsUnlocked || 0}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Titles Unlocked:</span>
            <span className={styles.statValue}>{stats.titlesUnlocked || 0}</span>
          </div>
        </div>
      </div>
      
      <button 
        className={styles.exportButton}
        onClick={onExportStats}
      >
        Export Stats Summary
      </button>
    </div>
  );
};
