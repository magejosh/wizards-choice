import React, { useState } from 'react';
import { BattleRecord } from '../../../types';
import styles from './PlayerProfile.module.css';

interface BattleHistoryLogProps {
  battleRecords: BattleRecord[];
  onExportBattleHistory: () => void;
}

export const BattleHistoryLog: React.FC<BattleHistoryLogProps> = ({ 
  battleRecords,
  onExportBattleHistory
}) => {
  const [filter, setFilter] = useState<'all' | 'victories' | 'defeats'>('all');
  
  const filteredBattles = battleRecords.filter(battle => {
    if (filter === 'all') return true;
    if (filter === 'victories') return battle.outcome === 'victory';
    if (filter === 'defeats') return battle.outcome === 'defeat';
    return true;
  }).sort((a, b) => {
    // Sort by date, newest first
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div>
      <div className={styles.filterButtons} style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setFilter('all')}
          className={`${styles.tabButton} ${filter === 'all' ? styles.activeTab : ''}`}
          style={{ marginRight: '10px' }}
        >
          All Battles ({battleRecords.length})
        </button>
        <button 
          onClick={() => setFilter('victories')}
          className={`${styles.tabButton} ${filter === 'victories' ? styles.activeTab : ''}`}
          style={{ marginRight: '10px' }}
        >
          Victories ({battleRecords.filter(b => b.outcome === 'victory').length})
        </button>
        <button 
          onClick={() => setFilter('defeats')}
          className={`${styles.tabButton} ${filter === 'defeats' ? styles.activeTab : ''}`}
        >
          Defeats ({battleRecords.filter(b => b.outcome === 'defeat').length})
        </button>
      </div>

      {filteredBattles.length > 0 ? (
        <div className={styles.battleHistoryContainer}>
          {filteredBattles.map((battle) => (
            <div key={battle.id} className={styles.battleCard}>
              <div className={styles.battleHeader}>
                <h3 className={styles.battleTitle}>
                  {battle.enemyName}
                  {battle.chapterName && ` - ${battle.chapterName}`}
                </h3>
                <span className={battle.outcome === 'victory' 
                  ? styles.battleOutcomeVictory 
                  : styles.battleOutcomeDefeat
                }>
                  {battle.outcome === 'victory' ? 'Victory' : 'Defeat'}
                </span>
              </div>
              
              <p className={styles.battleDate}>
                {formatDate(battle.date)}
              </p>
              
              <div className={styles.battleDetails}>
                <div className={styles.battleStat}>
                  <span>Duration: </span>
                  <span className={styles.battleStatValue}>{battle.duration} turns</span>
                </div>
                <div className={styles.battleStat}>
                  <span>Damage Dealt: </span>
                  <span className={styles.battleStatValue}>{battle.damageDealt}</span>
                </div>
                <div className={styles.battleStat}>
                  <span>Damage Taken: </span>
                  <span className={styles.battleStatValue}>{battle.damageTaken}</span>
                </div>
                <div className={styles.battleStat}>
                  <span>Spells Cast: </span>
                  <span className={styles.battleStatValue}>{battle.spellsCast.total}</span>
                </div>
                <div className={styles.battleStat}>
                  <span>Items Used: </span>
                  <span className={styles.battleStatValue}>{battle.itemsUsed}</span>
                </div>
                {battle.rewards && (
                  <div className={styles.battleStat}>
                    <span>Reward: </span>
                    <span className={styles.battleStatValue}>{battle.rewards}</span>
                  </div>
                )}
              </div>
              
              {battle.notes && (
                <p style={{ marginTop: '15px', fontStyle: 'italic', color: '#b8b8b8', fontSize: '0.9rem' }}>
                  {battle.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noResults}>
          No battle records found matching your filter.
        </div>
      )}
      
      <button 
        className={styles.exportButton}
        onClick={onExportBattleHistory}
        style={{ marginTop: '20px' }}
      >
        Export Battle History
      </button>
    </div>
  );
};

// Helper function
const formatDate = (date: Date | string): string => {
  if (!date) return 'Unknown';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 