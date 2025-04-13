'use client';

import React, { useState } from 'react';
import { useGameStateStore, getWizard } from '../../lib/game-state/gameStateStore';
import { StatsSummary } from './StatsSummary';
import { AchievementList } from './AchievementList';
import { BattleHistoryLog } from './BattleHistoryLog';
import { TitleRankDisplay } from './TitleRankDisplay';
import styles from './PlayerProfile.module.css';

enum ProfileTab {
  SUMMARY = 'summary',
  ACHIEVEMENTS = 'achievements',
  BATTLE_HISTORY = 'battle_history',
  TITLES = 'titles'
}

interface PlayerProfileScreenProps {
  onClose: () => void;
}

export const PlayerProfileScreen: React.FC<PlayerProfileScreenProps> = ({ onClose }) => {
  const { gameState, exportPlayerStats } = useGameStateStore();
  const player = getWizard();

  const [activeTab, setActiveTab] = useState<ProfileTab>(ProfileTab.SUMMARY);

  // Handle exporting player stats
  const handleExportStats = () => {
    exportPlayerStats();
  };

  // Get player title
  const getPlayerTitle = (): string => {
    if (!player.titles || player.titles.length === 0) {
      return 'Novice Wizard';
    }

    const equippedTitle = player.titles.find(title => title.isEquipped);
    return equippedTitle ? equippedTitle.name : 'Novice Wizard';
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h1 className={styles.profileTitle}>Wizard Profile</h1>

        <div className={styles.playerInfo}>
          <h2 className={styles.playerName}>{player.name}</h2>
          <p className={styles.playerLevel}>Level {player.level}</p>
          <p className={styles.playerTitle}>{getPlayerTitle()}</p>
        </div>

        <button className={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </div>

      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tabButton} ${activeTab === ProfileTab.SUMMARY ? styles.activeTab : ''}`}
          onClick={() => setActiveTab(ProfileTab.SUMMARY)}
        >
          Summary
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === ProfileTab.ACHIEVEMENTS ? styles.activeTab : ''}`}
          onClick={() => setActiveTab(ProfileTab.ACHIEVEMENTS)}
        >
          Achievements
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === ProfileTab.BATTLE_HISTORY ? styles.activeTab : ''}`}
          onClick={() => setActiveTab(ProfileTab.BATTLE_HISTORY)}
        >
          Battle History
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === ProfileTab.TITLES ? styles.activeTab : ''}`}
          onClick={() => setActiveTab(ProfileTab.TITLES)}
        >
          Titles & Ranks
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === ProfileTab.SUMMARY && (
          <StatsSummary
            stats={player.stats || {
              battlesWon: 0,
              battlesLost: 0,
              spellsCast: 0,
              damageDealt: 0,
              damageReceived: 0,
              criticalHits: 0,
              goldEarned: 0,
              itemsFound: 0,
              potionsCrafted: 0,
              potionsUsed: 0,
              questsCompleted: 0,
              chaptersCompleted: 0,
              achievementsUnlocked: 0,
              playTime: 0,
              highestCombo: 0,
              enemiesDefeated: 0,
              bossesDefeated: 0,
              spellsLearned: 0,
              titlesUnlocked: 0,
              totalExperienceGained: 0,
              totalGoldSpent: 0,
              totalManaSpent: 0,
              totalHealthHealed: 0,
              totalDistanceTraveled: 0,
              totalScrollsUsed: 0,
              totalIngredientsCollected: 0,
              totalEquipmentFound: 0,
              totalDaysPlayed: 0,
              longestWinStreak: 0,
              fastestVictory: 0,
              mostDamageInOneTurn: 0,
              mostGoldEarnedInOneBattle: 0,
              mostExperienceEarnedInOneBattle: 0
            }}
            onExportStats={handleExportStats}
          />
        )}

        {activeTab === ProfileTab.ACHIEVEMENTS && (
          <AchievementList
            achievements={player.achievements || []}
          />
        )}

        {activeTab === ProfileTab.BATTLE_HISTORY && (
          <BattleHistoryLog
            battleHistory={player.battleHistory || []}
          />
        )}

        {activeTab === ProfileTab.TITLES && (
          <TitleRankDisplay
            titles={player.titles || []}
            unlockedTitles={player.unlockedTitles || []}
          />
        )}
      </div>
    </div>
  );
};
