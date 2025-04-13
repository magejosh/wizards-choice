import React, { useState } from 'react';
import { BattleRecord } from '../../lib/types';
import styles from './PlayerProfile.module.css';

interface BattleHistoryLogProps {
  battleHistory: BattleRecord[];
}

export const BattleHistoryLog: React.FC<BattleHistoryLogProps> = ({ 
  battleHistory
}) => {
  const [filter, setFilter] = useState<'all' | 'victories' | 'defeats'>('all');
  
  const filteredBattles = battleHistory.filter(battle => {
    if (filter === 'all') return true;
    if (filter === 'victories') return battle.outcome === 'victory';
    if (filter === 'defeats') return battle.outcome === 'defeat';
    return true;
  });
  
  // Sort battles by date (newest first)
  const sortedBattles = [...filteredBattles].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format duration
  const formatDuration = (seconds: number): string => {
    if (!seconds) return 'N/A';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}m ${remainingSeconds}s`;
  };
  
  return (
    <div>
      <div className={styles.battleHistoryFilters}>
        <button 
          className={`${styles.filterButton} ${filter === 'all' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('all')}
        >
          All Battles ({battleHistory.length})
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'victories' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('victories')}
        >
          Victories ({battleHistory.filter(b => b.outcome === 'victory').length})
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'defeats' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('defeats')}
        >
          Defeats ({battleHistory.filter(b => b.outcome === 'defeat').length})
        </button>
      </div>
      
      <div className={styles.battleHistoryContainer}>
        {sortedBattles.length > 0 ? (
          sortedBattles.map((battle, index) => (
            <div key={battle.id || index} className={styles.battleCard}>
              <div className={styles.battleHeader}>
                <h3 className={styles.battleTitle}>
                  {battle.opponentName || 'Unknown Opponent'}
                </h3>
                <span className={battle.outcome === 'victory' ? styles.battleOutcomeVictory : styles.battleOutcomeDefeat}>
                  {battle.outcome === 'victory' ? 'Victory' : 'Defeat'}
                </span>
              </div>
              
              <div className={styles.battleDate}>
                {formatDate(battle.date)}
              </div>
              
              <div className={styles.battleStats}>
                <div className={styles.battleStat}>
                  <div className={styles.battleStatLabel}>Duration</div>
                  <div className={styles.battleStatValue}>{formatDuration(battle.duration || 0)}</div>
                </div>
                
                <div className={styles.battleStat}>
                  <div className={styles.battleStatLabel}>Damage Dealt</div>
                  <div className={styles.battleStatValue}>{battle.damageDealt || 0}</div>
                </div>
                
                <div className={styles.battleStat}>
                  <div className={styles.battleStatLabel}>Damage Taken</div>
                  <div className={styles.battleStatValue}>{battle.damageTaken || 0}</div>
                </div>
                
                <div className={styles.battleStat}>
                  <div className={styles.battleStatLabel}>Spells Cast</div>
                  <div className={styles.battleStatValue}>{battle.spellsCast || 0}</div>
                </div>
                
                <div className={styles.battleStat}>
                  <div className={styles.battleStatLabel}>Critical Hits</div>
                  <div className={styles.battleStatValue}>{battle.criticalHits || 0}</div>
                </div>
                
                <div className={styles.battleStat}>
                  <div className={styles.battleStatLabel}>Turns</div>
                  <div className={styles.battleStatValue}>{battle.turns || 0}</div>
                </div>
              </div>
              
              {battle.spellsUsed && battle.spellsUsed.length > 0 && (
                <div className={styles.battleSpells}>
                  <h4 className={styles.battleSpellsTitle}>Spells Used</h4>
                  <div className={styles.battleSpellsList}>
                    {battle.spellsUsed.map((spell, i) => (
                      <div key={i} className={styles.battleSpell}>
                        {spell}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {battle.rewards && (
                <div className={styles.battleRewards}>
                  <h4 className={styles.battleRewardsTitle}>Rewards</h4>
                  <div className={styles.battleRewardsList}>
                    {battle.rewards.gold > 0 && (
                      <div className={styles.battleReward}>
                        {battle.rewards.gold} Gold
                      </div>
                    )}
                    
                    {battle.rewards.experience > 0 && (
                      <div className={styles.battleReward}>
                        {battle.rewards.experience} XP
                      </div>
                    )}
                    
                    {battle.rewards.items && battle.rewards.items.map((item, i) => (
                      <div key={i} className={styles.battleReward}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            No battle records match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
