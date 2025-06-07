// src/components/battle/WizardStats.tsx
// Component to display wizard's stats during battle

import React, { useEffect, useState, CSSProperties } from 'react';
import { ActiveEffect } from '../../lib/types/spell-types';
import styles from './BattleArena.module.css';

interface WizardStatsProps {
  name: string;
  currentHealth: number;
  maxHealth: number;
  currentMana: number;
  maxMana: number;
  activeEffects: ActiveEffect[];
  isPlayer: boolean;
  style?: React.CSSProperties;
}

const WizardStats: React.FC<WizardStatsProps> = ({
  name,
  currentHealth,
  maxHealth,
  currentMana,
  maxMana,
  activeEffects,
  isPlayer,
  style
}) => {
  // Track if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false);
  // Track if we're in landscape mode
  const [isLandscape, setIsLandscape] = useState(false);
  
  // Check viewport width and orientation on component mount and window resize
  useEffect(() => {
    const checkDisplay = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width <= 768);
      setIsLandscape(width > height);
    };
    
    // Check initially
    checkDisplay();
    
    // Add resize and orientation change listeners
    window.addEventListener('resize', checkDisplay);
    window.addEventListener('orientationchange', checkDisplay);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', checkDisplay);
      window.removeEventListener('orientationchange', checkDisplay);
    };
  }, []);
  
  // Get proper scale based on screen size and orientation
  const getScale = () => {
    if (!isMobile) return 1;
    
    if (isLandscape) {
      // Landscape mode - 20% larger than portrait
      return window.innerWidth <= 380 ? 0.34 : // was 0.28
             window.innerWidth <= 480 ? 0.42 : // was 0.35
             window.innerWidth <= 768 ? 0.6 : 1; // was 0.5
    } else {
      // Portrait mode - keep original scaling
      return window.innerWidth <= 380 ? 0.28 : 
             window.innerWidth <= 480 ? 0.35 : 
             window.innerWidth <= 768 ? 0.5 : 1;
    }
  };
  
  // Make transforms smaller and position panels at bottom corners
  // Adjust based on orientation
  const mobileStyles: {
    container: CSSProperties;
    title: CSSProperties;
    statLabel: CSSProperties;
    statValue: CSSProperties;
    effectsTitle: CSSProperties;
  } = {
    container: {
      transform: `scale(${getScale()})`,
      transformOrigin: isPlayer ? 'bottom left' : 'bottom right',
      width: '300px', // Fixed width before scaling
      position: 'absolute' as 'absolute',
      bottom: isLandscape ? '10px' : '5px',
      left: isPlayer ? (isLandscape ? '10px' : '5px') : 'auto',
      right: !isPlayer ? (isLandscape ? '10px' : '5px') : 'auto',
      zIndex: 5
    },
    title: {
      fontSize: '1.2rem',
      marginBottom: '0.3rem',
      textAlign: isPlayer ? 'left' : 'right' as 'left' | 'right'
    },
    statLabel: {
      fontSize: '0.7rem'
    },
    statValue: {
      fontSize: '0.7rem'
    },
    effectsTitle: {
      fontSize: '0.8rem',
      textAlign: isPlayer ? 'left' : 'right' as 'left' | 'right'
    }
  };

  // Helper to split and style the level in the name
  function renderNameWithLevel(name: string) {
    // Player: 'Name (Lv. X)'
    const playerMatch = name.match(/^(.*) \(Lv\. (\d+)\)$/);
    if (playerMatch) {
      return <>
        <span>{playerMatch[1]}</span>{' '}
        <span className="wizard-level">(Lv. {playerMatch[2]})</span>
      </>;
    }
    // Enemy: 'Lv. X Name'
    const enemyMatch = name.match(/^Lv\. (\d+) (.*)$/);
    if (enemyMatch) {
      return <>
        <span className="wizard-level">Lv. {enemyMatch[1]}</span>{' '}
        <span>{enemyMatch[2]}</span>
      </>;
    }
    // Fallback
    return name;
  }

  // Helper to get a user-friendly effect label
  function getEffectLabel(effect: ActiveEffect): string {
    if (effect.name && effect.name !== 'Damage Over Time' && effect.name !== 'Healing Over Time' && effect.name !== 'Mana Restore Over Time' && effect.name !== 'Damage Reduction') {
      return effect.name;
    }
    switch (effect.type) {
      case 'damage_over_time':
        return `Damage Over Time (${effect.value < 0 ? '' : '+'}${effect.value})`;
      case 'healing_over_time':
        return `Healing Over Time (${effect.value < 0 ? '' : '+'}${effect.value})`;
      case 'mana_regen':
        return `Mana Regen (${effect.value < 0 ? '' : '+'}${effect.value})`;
      case 'damageReduction':
        return `Damage Reduction (${effect.value})`;
      case 'buff':
        return `Buff (+${effect.value})`;
      case 'mana_drain':
        return `Mana Drain (${effect.value})`;
      case 'stun':
        return 'Stunned';
      case 'silence':
        return 'Silenced';
      default:
        return effect.name || effect.type;
    }
  }

  return (
    <div 
      style={style || (isMobile ? mobileStyles.container : undefined)} 
      className={isMobile ? '' : isPlayer ? styles.playerSection : styles.enemySection}
    >
      <h2 style={isMobile ? mobileStyles.title : undefined}>{renderNameWithLevel(name)}</h2>
      
      <div className={styles.statsBar}>
        <div className={styles.statGroup}>
          <div className={styles.statBarContainer}>
            <div className={styles.statLabel} style={isMobile ? mobileStyles.statLabel : undefined}>Health</div>
            <div 
              className={`${styles.statBarFill} ${styles.healthBar}`}
              style={{ width: `${(currentHealth / maxHealth) * 100}%` }}
            />
            <div className={styles.statValue} style={isMobile ? mobileStyles.statValue : undefined}>
              {currentHealth}/{maxHealth}
            </div>
          </div>
        </div>

        <div className={styles.statGroup}>
          <div className={styles.statBarContainer}>
            <div className={styles.statLabel} style={isMobile ? mobileStyles.statLabel : undefined}>Mana</div>
            <div 
              className={`${styles.statBarFill} ${styles.manaBar}`}
              style={{ width: `${(currentMana / maxMana) * 100}%` }}
            />
            <div className={styles.statValue} style={isMobile ? mobileStyles.statValue : undefined}>
              {currentMana}/{maxMana}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.effectsSection}>
        <h3 className={styles.effectsTitle} style={isMobile ? mobileStyles.effectsTitle : undefined}>Active Effects</h3>
        {activeEffects.length > 0 ? (
          <div className={styles.effectsList}>
            {activeEffects.map((effect, index) => (
              <div key={index} className={styles.effectItem}>
                <span className={styles.effectName}>{getEffectLabel(effect)}</span>
                <span className={styles.effectDuration}>{effect.remainingDuration} turns</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noEffects}>None</div>
        )}
      </div>
    </div>
  );
};

export default WizardStats; 