// src/components/battle/WizardStats.tsx
// Component to display wizard's stats during battle

import React from 'react';
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
}

const WizardStats: React.FC<WizardStatsProps> = ({
  name,
  currentHealth,
  maxHealth,
  currentMana,
  maxMana,
  activeEffects,
  isPlayer
}) => {
  return (
    <div className={styles.wizardStats}>
      <h3 className={styles.wizardName}>{name}</h3>
      
      <div className={styles.statsBar}>
        <div className={styles.statGroup}>
          <div className={styles.statLabel}>Health</div>
          <div className={styles.statBarContainer}>
            <div 
              className={styles.healthBar}
              style={{ 
                width: `${(currentHealth / maxHealth) * 100}%`,
                backgroundColor: '#00ff00'  // Bright green health bar
              }}
            />
            <div className={styles.statValue}>
              {currentHealth}/{maxHealth}
            </div>
          </div>
        </div>
        
        <div className={styles.statGroup}>
          <div className={styles.statLabel}>Mana</div>
          <div className={styles.statBarContainer}>
            <div 
              className={isPlayer ? styles.manaBar : styles.enemyManaBar}
              style={{ 
                width: `${(currentMana / maxMana) * 100}%`,
                backgroundColor: isPlayer ? '#0088ff' : '#9933ff'  // Blue for player, purple for enemy
              }}
            />
            <div className={styles.statValue}>
              {currentMana}/{maxMana}
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.effectsSection}>
        <h4 className={styles.effectsTitle}>Active Effects</h4>
        {activeEffects.length > 0 ? (
          <div className={styles.effectsList}>
            {activeEffects.map((effect, index) => (
              <div key={index} className={styles.effectItem}>
                <span className={styles.effectName}>{effect.name}</span>
                <span className={styles.effectDuration}>{effect.remainingDuration}</span>
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