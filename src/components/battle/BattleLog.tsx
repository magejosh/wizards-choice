// src/components/battle/BattleLog.tsx
// Component to display the combat log

import React, { useEffect, useRef } from 'react';
import { CombatLogEntry } from '../../lib/types/combat-types';
import styles from './BattleArena.module.css';

interface BattleLogProps {
  entries: CombatLogEntry[];
}

const BattleLog: React.FC<BattleLogProps> = ({ entries }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);
  
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
  
  return (
    <div className={styles.battleLogContainer} ref={logContainerRef}>
      <h3 className={styles.battleLogTitle}>Battle Log</h3>
      <div className={styles.battleLogEntries}>
        {formattedEntries.map((entry, index) => (
          <div key={index} className={styles.logEntry}>
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BattleLog; 