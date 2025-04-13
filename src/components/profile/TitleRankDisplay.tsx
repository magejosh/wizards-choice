import React, { useState } from 'react';
import { PlayerTitle } from '../../lib/types';
import { useGameStateStore } from '../../lib/game-state/gameStateStore';
import styles from './PlayerProfile.module.css';

interface TitleRankDisplayProps {
  titles: PlayerTitle[];
  unlockedTitles: string[];
}

export const TitleRankDisplay: React.FC<TitleRankDisplayProps> = ({
  titles,
  unlockedTitles
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const { equipTitle } = useGameStateStore();
  
  const filteredTitles = titles.filter(title => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return title.unlocked;
    if (filter === 'locked') return !title.unlocked;
    return true;
  });
  
  // Handle equipping a title
  const handleEquipTitle = (titleId: string) => {
    equipTitle(titleId);
  };
  
  return (
    <div>
      <div className={styles.achievementFilters}>
        <button 
          className={`${styles.filterButton} ${filter === 'all' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('all')}
        >
          All Titles ({titles.length})
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'unlocked' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('unlocked')}
        >
          Unlocked ({titles.filter(t => t.unlocked).length})
        </button>
        <button 
          className={`${styles.filterButton} ${filter === 'locked' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('locked')}
        >
          Locked ({titles.filter(t => !t.unlocked).length})
        </button>
      </div>
      
      <div className={styles.titlesContainer}>
        {filteredTitles.length > 0 ? (
          filteredTitles.map(title => (
            <div 
              key={title.id}
              className={title.unlocked ? styles.titleUnlocked : styles.titleLocked}
            >
              <div className={styles.titleCard}>
                {title.isEquipped && (
                  <div className={styles.titleEquipped}>Equipped</div>
                )}
                
                <h3 className={styles.titleName}>
                  {title.unlocked ? title.name : title.hidden ? '???' : title.name}
                </h3>
                
                <div className={styles.titleCategory}>
                  {title.category || 'General'}
                </div>
                
                <p className={styles.titleDescription}>
                  {title.unlocked ? title.description : title.hidden ? 'This title is hidden until unlocked.' : title.description}
                </p>
                
                {!title.unlocked && title.requirements && (
                  <div className={styles.titleRequirements}>
                    Requirements: {title.requirements}
                  </div>
                )}
                
                {title.unlocked && title.bonuses && (
                  <div className={styles.titleBonus}>
                    Bonuses: {title.bonuses}
                  </div>
                )}
                
                {title.unlocked && !title.isEquipped && (
                  <button 
                    className={styles.titleEquipButton}
                    onClick={() => handleEquipTitle(title.id)}
                  >
                    Equip Title
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
            No titles match the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};
