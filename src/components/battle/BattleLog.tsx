// src/components/battle/BattleLog.tsx
// Component to display the combat log

import React, { useEffect, useRef, useState, CSSProperties } from 'react';
import { CombatLogEntry } from '../../lib/types/combat-types';
import styles from './BattleArena.module.css';

interface BattleLogProps {
  entries: CombatLogEntry[];
}

const BattleLog: React.FC<BattleLogProps> = ({ entries }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check viewport width on component mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check initially
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Format log entries for display
  const formatLogEntries = (): string[] => {
    if (!entries || entries.length === 0) {
      return ['The duel is about to begin!'];
    }
    
    return entries.map(entry => {
      const actorName = entry.actor === 'player' ? 'You' : 
                        entry.actor === 'enemy' ? 'Enemy' :
                        entry.actor;
      const targetName = entry.target === 'player' ? 'you' : 
                         entry.target === 'enemy' ? 'enemy' :
                         entry.target;
      
      switch (entry.action) {
        case 'spell_cast':
          if (entry.damage && entry.damage > 0) {
            return `${actorName} cast ${entry.spellName} for ${entry.damage} damage to ${targetName}.`;
          } else if (entry.healing && entry.healing > 0) {
            return `${actorName} cast ${entry.spellName} healing ${entry.target === entry.actor ? 'themselves' : targetName} for ${entry.healing}.`;
          } else {
            return `${actorName} cast ${entry.spellName}.`;
          }
        case 'mystic_punch':
          return `${actorName} used Mystic Punch for ${entry.damage} damage.`;
        case 'skip_turn':
          return `${actorName} skipped their turn.`;
        case 'effect_applied':
          return `${entry.spellName || 'Effect'} was applied to ${targetName}.`;
        case 'effect_tick':
          if (entry.damage && entry.damage > 0) {
            return `${targetName} took ${entry.damage} damage from ${entry.spellName || 'effect'}.`;
          } else if (entry.healing && entry.healing > 0) {
            return `${targetName} healed ${entry.healing} from ${entry.spellName || 'effect'}.`;
          }
          return `${entry.spellName || 'Effect'} affected ${targetName}.`;
        case 'effect_expired':
          return `${entry.spellName || 'Effect'} expired on ${targetName}.`;
        case 'combat_start':
          return 'The duel has begun!';
        default:
          return entry.details || 'Unknown action occurred.';
      }
    });
  };
  
  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [entries]);
  
  const formattedEntries = formatLogEntries();
  
  // Inline styles for mobile
  const mobileStyles: {
    container: CSSProperties;
    title: CSSProperties;
    entry: CSSProperties;
  } = {
    container: {
      width: window.innerWidth <= 380 ? '100%' : 
             window.innerWidth <= 480 ? '100%' : 
             window.innerWidth <= 768 ? '100%' : '100%',
      maxWidth: '100%',
      height: 'auto',
      maxHeight: '150px',
      margin: '0',
      fontSize: window.innerWidth <= 380 ? '0.8rem' : 
               window.innerWidth <= 480 ? '0.9rem' : '1rem',
      padding: window.innerWidth <= 380 ? '0.3rem' : 
              window.innerWidth <= 480 ? '0.4rem' : '0.5rem',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: '4px'
    },
    title: {
      fontSize: '1rem',
      marginBottom: '0.2rem',
      textAlign: 'center' as 'center'
    },
    entry: {
      fontSize: '0.75rem',
      padding: '0.2rem 0.4rem',
      lineHeight: '1.1'
    }
  };
  
  return (
    <div 
      className={styles.battleLogContainer} 
      ref={logContainerRef}
      style={isMobile ? mobileStyles.container : undefined}
    >
      <h3 className={styles.battleLogTitle} style={isMobile ? mobileStyles.title : undefined}>
        Battle Log
      </h3>
      <div className={styles.battleLogEntries}>
        {formattedEntries.map((entry, index) => (
          <div 
            key={index} 
            className={styles.logEntry}
            style={isMobile ? mobileStyles.entry : undefined}
          >
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BattleLog; 