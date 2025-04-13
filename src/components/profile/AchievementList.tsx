import React, { useState } from 'react';
import { Achievement } from '../../lib/types';
import styles from './PlayerProfile.module.css';

interface AchievementListProps {
  achievements: Achievement[];
}

export const AchievementList: React.FC<AchievementListProps> = ({ 
  achievements
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  
  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return achievement.unlocked;
    if (filter === 'locked') return !achievement.unlocked;
    return true;
  });
  
  // Calculate completion percentage
  const completionPercentage = achievements.length > 0
    ? Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)
    : 0;
  
  // Format date
  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div>
      <div className={styles.achievementFilters}>
        <button 
          className={`${styles.filterButton} ${filter === 'all' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({achievements.length})
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'unlocked' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('unlocked')}
        >
          Unlocked ({achievements.filter(a => a.unlocked).length})
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'locked' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('locked')}
        >
          Locked ({achievements.filter(a => !a.unlocked).length})
        </button>
        
        <div style={{ marginLeft: 'auto' }}>
          Completion: {completionPercentage}%
        </div>
      </div>
      
      <div className={styles.achievementGrid}>
        {filteredAchievements.length > 0 ? (
          filteredAchievements.map(achievement => (
            <div 
              key={achievement.id}
              className={achievement.unlocked ? styles.achievementUnlocked : styles.achievementLocked}
            >
              <div className={styles.achievementCard}>
                <h3 className={styles.achievementTitle}>
                  {achievement.unlocked ? achievement.name : achievement.hidden ? '???' : achievement.name}
                </h3>
                
                <p className={styles.achievementDescription}>
                  {achievement.unlocked ? achievement.description : achievement.hidden ? 'This achievement is hidden until unlocked.' : achievement.description}
                </p>
                
                {achievement.progressCurrent !== undefined && achievement.progressRequired !== undefined && (
                  <>
                    <div className={styles.achievementProgress}>
                      <div 
                        className={styles.achievementProgressBar}
                        style={{ width: `${Math.min(100, (achievement.progressCurrent / achievement.progressRequired) * 100)}%` }}
                      ></div>
                    </div>
                    <p className={styles.achievementProgressText}>
                      {achievement.progressCurrent} / {achievement.progressRequired}
                    </p>
                  </>
                )}
                
                {achievement.unlocked && achievement.unlockedDate && (
                  <p className={styles.achievementDate}>
                    Unlocked on {formatDate(achievement.unlockedDate)}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
            No achievements match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
