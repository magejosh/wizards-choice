'use client';

import React, { useState } from 'react';
import { useGameStateStore } from '../../../game-state/gameStateStore';
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
  const [activeTab, setActiveTab] = useState<ProfileTab>(ProfileTab.SUMMARY);
  const { gameState, equipTitle } = useGameStateStore();
  
  // Helper functions for exporting data
  const exportStatsData = () => {
    const data = {
      playerName: gameState.player.name,
      stats: {
        level: gameState.player.level,
        battlesWon: gameState.player.battlesWon || 0,
        battlesLost: gameState.player.battlesLost || 0,
        spellsLearned: gameState.player.spells?.length || 0,
        achievementsUnlocked: gameState.achievements?.filter(a => a.unlocked).length || 0,
        totalAchievements: gameState.achievements?.length || 0,
        titlesUnlocked: gameState.titles?.filter(t => t.unlocked).length || 0,
        totalTitles: gameState.titles?.length || 0,
        currentTitle: gameState.player.equippedTitle?.name || null,
      },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `wizard_choice_stats_${gameState.player.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const exportAchievementsData = () => {
    const data = {
      playerName: gameState.player.name,
      achievements: gameState.achievements || [],
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `wizard_choice_achievements_${gameState.player.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const exportBattleHistoryData = () => {
    const data = {
      playerName: gameState.player.name,
      battleHistory: gameState.battleHistory || [],
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `wizard_choice_battles_${gameState.player.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleEquipTitle = (titleId: string) => {
    equipTitle(titleId);
  };

  // Calculate stats for display
  const playerStats = {
    level: gameState.player.level,
    battlesWon: gameState.player.battlesWon || 0,
    battlesLost: gameState.player.battlesLost || 0,
    spellsLearned: gameState.player.spells?.length || 0,
    achievementsUnlocked: gameState.achievements?.filter(a => a.unlocked).length || 0,
    totalAchievements: gameState.achievements?.length || 0,
    titlesUnlocked: gameState.titles?.filter(t => t.unlocked).length || 0,
    totalTitles: gameState.titles?.length || 0,
    currentTitle: gameState.player.equippedTitle?.name || null,
  };
  
  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <h2 className={styles.profileTitle}>Player Profile</h2>
        <div className={styles.playerInfo}>
          <h3 className={styles.playerName}>{gameState.player.name}</h3>
          <p className={styles.playerLevel}>Level {gameState.player.level}</p>
          {gameState.player.equippedTitle && (
            <p className={styles.playerTitle}>{gameState.player.equippedTitle.name}</p>
          )}
        </div>
        <button 
          className={styles.closeButton}
          onClick={onClose}
        >
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
          Achievements ({playerStats.achievementsUnlocked}/{playerStats.totalAchievements})
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === ProfileTab.BATTLE_HISTORY ? styles.activeTab : ''}`}
          onClick={() => setActiveTab(ProfileTab.BATTLE_HISTORY)}
        >
          Battle History ({gameState.battleHistory?.length || 0})
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === ProfileTab.TITLES ? styles.activeTab : ''}`}
          onClick={() => setActiveTab(ProfileTab.TITLES)}
        >
          Titles ({playerStats.titlesUnlocked}/{playerStats.totalTitles})
        </button>
      </div>
      
      <div className={styles.tabContent}>
        {activeTab === ProfileTab.SUMMARY && (
          <StatsSummary 
            stats={playerStats}
            onExportStats={exportStatsData}
          />
        )}
        
        {activeTab === ProfileTab.ACHIEVEMENTS && (
          <AchievementList 
            achievements={gameState.achievements || []}
            onExportAchievements={exportAchievementsData}
          />
        )}
        
        {activeTab === ProfileTab.BATTLE_HISTORY && (
          <BattleHistoryLog 
            battleRecords={gameState.battleHistory || []}
            onExportBattleHistory={exportBattleHistoryData}
          />
        )}
        
        {activeTab === ProfileTab.TITLES && (
          <TitleRankDisplay 
            titles={gameState.titles || []}
            currentTitleId={gameState.player.equippedTitleId}
            onEquipTitle={handleEquipTitle}
          />
        )}
      </div>
    </div>
  );
}; 