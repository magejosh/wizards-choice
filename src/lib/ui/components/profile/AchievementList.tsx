import React, { useState } from 'react';
import { Achievement } from '../../../types';
import styles from './PlayerProfile.module.css';

interface AchievementListProps {
  achievements: Achievement[];
  onExportAchievements: () => void;
}

export const AchievementList: React.FC<AchievementListProps> = ({ 
  achievements,
  onExportAchievements
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  
  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });

  return (
    <div>
      <div className={styles.filterButtons} style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setFilter('all')}
          className={`${styles.tabButton} ${filter === 'all' ? styles.activeTab : ''}`}
          style={{ marginRight: '10px' }}
        >
          All ({achievements.length})
        </button>
        <button 
          onClick={() => setFilter('unlocked')}
          className={`${styles.tabButton} ${filter === 'unlocked' ? styles.activeTab : ''}`}
          style={{ marginRight: '10px' }}
        >
          Unlocked ({achievements.filter(a => a.unlocked).length})
        </button>
        <button 
          onClick={() => setFilter('locked')}
          className={`${styles.tabButton} ${filter === 'locked' ? styles.activeTab : ''}`}
        >
          Locked ({achievements.filter(a => !a.unlocked).length})
        </button>
      </div>

      {filteredAchievements.length > 0 ? (
        <div className={styles.achievementGrid}>
          {filteredAchievements.map((achievement) => (
            <div 
              key={achievement.id} 
              className={achievement.unlocked ? styles.achievementUnlocked : styles.achievementLocked}
            >
              <div className={styles.achievementCard}>
                <h3 className={styles.achievementTitle}>{achievement.name}</h3>
                <p className={styles.achievementDescription}>{achievement.description}</p>
                
                <div className={styles.achievementProgress}>
                  <div 
                    className={styles.achievementProgressBar} 
                    style={{ 
                      width: `${calculateProgressPercentage(achievement.currentProgress, achievement.requiredProgress)}%` 
                    }}
                  />
                </div>
                <p className={styles.achievementProgressText}>
                  {achievement.currentProgress} / {achievement.requiredProgress}
                </p>
                
                {achievement.reward && (
                  <p className={styles.achievementReward}>
                    Reward: {achievement.reward}
                  </p>
                )}
                
                {achievement.unlocked && achievement.unlockedDate && (
                  <p className={styles.achievementUnlockedDate}>
                    Unlocked on {formatDate(achievement.unlockedDate)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noResults}>
          No achievements found matching your filter.
        </div>
      )}
      
      <button 
        className={styles.exportButton}
        onClick={onExportAchievements}
        style={{ marginTop: '20px' }}
      >
        Export Achievements
      </button>
    </div>
  );
};

// Helper functions
const calculateProgressPercentage = (current: number, required: number): number => {
  if (required === 0) return 100;
  const percentage = (current / required) * 100;
  return Math.min(Math.max(percentage, 0), 100);
};

const formatDate = (date: Date | string): string => {
  if (!date) return 'Unknown';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString();
}; 