import React from 'react';
import { PlayerStats } from '../../../types';
import styles from './PlayerProfile.module.css';

interface StatsSummaryProps {
  stats: PlayerStats;
  onExportStats: () => void;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ stats, onExportStats }) => {
  return (
    <div>
      <div className={styles.summaryContainer}>
        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Game Progress</h3>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Chapters Completed:</span>
            <span className={styles.statValue}>{stats.chaptersCompleted}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Choices Made:</span>
            <span className={styles.statValue}>{stats.totalChoicesMade}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Game Time:</span>
            <span className={styles.statValue}>{formatTime(stats.totalGameTime)}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Game Started:</span>
            <span className={styles.statValue}>{formatDate(stats.gameStartDate)}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Character Stats</h3>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Current Health:</span>
            <span className={styles.statValue}>{stats.currentHealth} / {stats.maxHealth}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Gold:</span>
            <span className={styles.statValue}>{stats.gold}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Mana:</span>
            <span className={styles.statValue}>{stats.mana}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Experience:</span>
            <span className={styles.statValue}>{stats.experience}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Combat Statistics</h3>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Battles Won:</span>
            <span className={styles.statValue}>{stats.battlesWon}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Battles Lost:</span>
            <span className={styles.statValue}>{stats.battlesLost}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Win Rate:</span>
            <span className={styles.statValue}>
              {calculateWinRate(stats.battlesWon, stats.battlesLost)}%
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Damage Dealt:</span>
            <span className={styles.statValue}>{stats.totalDamageDealt}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Achievements</h3>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Unlocked:</span>
            <span className={styles.statValue}>{stats.achievementsUnlocked}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Progress:</span>
            <span className={styles.statValue}>
              {calculatePercentage(stats.achievementsUnlocked, stats.totalAchievements)}%
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Recent Achievement:</span>
            <span className={styles.statValue}>{stats.mostRecentAchievement || 'None'}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Player Titles</h3>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Titles Unlocked:</span>
            <span className={styles.statValue}>{stats.titlesUnlocked}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Progress:</span>
            <span className={styles.statValue}>
              {calculatePercentage(stats.titlesUnlocked, stats.totalTitles)}%
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Current Title:</span>
            <span className={styles.statValue}>{stats.currentTitle || 'None'}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <h3 className={styles.statCardTitle}>Inventory</h3>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Items Collected:</span>
            <span className={styles.statValue}>{stats.itemsCollected}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Spells Learned:</span>
            <span className={styles.statValue}>{stats.spellsLearned}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Potions Used:</span>
            <span className={styles.statValue}>{stats.potionsUsed}</span>
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

// Helper functions
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return `${hours}h ${minutes}m ${remainingSeconds}s`;
};

const formatDate = (date: Date | string): string => {
  if (!date) return 'Unknown';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString();
};

const calculateWinRate = (wins: number, losses: number): string => {
  if (wins + losses === 0) return '0';
  return ((wins / (wins + losses)) * 100).toFixed(1);
};

const calculatePercentage = (current: number, total: number): string => {
  if (total === 0) return '0';
  return ((current / total) * 100).toFixed(0);
}; 