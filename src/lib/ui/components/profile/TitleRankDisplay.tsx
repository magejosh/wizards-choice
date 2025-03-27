import React, { useState } from 'react';
import { PlayerTitle } from '../../../types';
import styles from './PlayerProfile.module.css';

interface TitleRankDisplayProps {
  titles: PlayerTitle[];
  currentTitleId: string | null;
  onEquipTitle: (titleId: string) => void;
}

export const TitleRankDisplay: React.FC<TitleRankDisplayProps> = ({
  titles,
  currentTitleId,
  onEquipTitle
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  
  const filteredTitles = titles.filter(title => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return title.unlocked;
    if (filter === 'locked') return !title.unlocked;
    return true;
  }).sort((a, b) => {
    // Sort by unlocked first, then by category
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    return a.category.localeCompare(b.category);
  });

  return (
    <div>
      <div className={styles.filterButtons} style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setFilter('all')}
          className={`${styles.tabButton} ${filter === 'all' ? styles.activeTab : ''}`}
          style={{ marginRight: '10px' }}
        >
          All Titles ({titles.length})
        </button>
        <button 
          onClick={() => setFilter('unlocked')}
          className={`${styles.tabButton} ${filter === 'unlocked' ? styles.activeTab : ''}`}
          style={{ marginRight: '10px' }}
        >
          Unlocked ({titles.filter(t => t.unlocked).length})
        </button>
        <button 
          onClick={() => setFilter('locked')}
          className={`${styles.tabButton} ${filter === 'locked' ? styles.activeTab : ''}`}
        >
          Locked ({titles.filter(t => !t.unlocked).length})
        </button>
      </div>

      {filteredTitles.length > 0 ? (
        <div className={styles.titlesContainer}>
          {filteredTitles.map((title) => (
            <div 
              key={title.id}
              className={title.unlocked ? styles.titleUnlocked : styles.titleLocked}
            >
              <div className={styles.titleCard}>
                {title.id === currentTitleId && (
                  <div className={styles.titleEquipped}>Equipped</div>
                )}
                
                <h3 className={styles.titleName}>{title.name}</h3>
                <p className={styles.titleCategory}>{title.category}</p>
                <p className={styles.titleDescription}>{title.description}</p>
                
                {title.requirement && (
                  <p className={styles.titleRequirements}>
                    Requirements: {title.requirement}
                  </p>
                )}
                
                {title.bonus && (
                  <p className={styles.titleBonus}>
                    Bonus: {title.bonus}
                  </p>
                )}
                
                {title.unlocked && (
                  <button 
                    className={styles.titleEquipButton}
                    onClick={() => onEquipTitle(title.id)}
                    disabled={title.id === currentTitleId}
                  >
                    {title.id === currentTitleId ? 'Equipped' : 'Equip Title'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noResults}>
          No titles found matching your filter.
        </div>
      )}
    </div>
  );
}; 