// src/components/battle/BattleLog.tsx
// Component to display the combat log

import React, { useEffect, useRef, useState, CSSProperties } from 'react';
import { CombatLogEntry } from '../../lib/types/combat-types';
import styles from './BattleArena.module.css';
// We don't need to import battleLogManager here as we're just displaying entries

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

  // We no longer need to update the battle log manager with entries
  // The battle log manager is the source of truth, and entries are just for rendering
  // This prevents potential duplicate entries or ordering issues

  // Format log entries for display
  const formatLogEntries = (entriesToFormat: CombatLogEntry[]): string[] => {
    if (!entriesToFormat || entriesToFormat.length === 0) {
      // Return an empty array instead of a default message
      // The "duel has begun" message will be added by BattleView.tsx only once
      return [];
    }

    // Filter out initiative entries that might appear before the actual roll
    const filteredEntries = entriesToFormat.filter(entry => {
      // Don't show initiative entries that have "rolled X, Y" until after the modal is closed
      if (entry.action === 'initiative' && entry.details && entry.details.includes('rolled')) {
        const containsModal = document.querySelector('.modal');
        if (containsModal && containsModal.classList.contains('initiativeRollModal')) {
          return false;
        }
      }
      return true;
    });

    return filteredEntries.map(entry => {
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
        case 'initiative':
          // For the initial "Rolling for initiative..." message
          return entry.details || 'Rolling for initiative...';
        case 'initiative_roll':
          // For individual player/enemy roll results
          return entry.details || 'Rolling for initiative...';
        case 'initiative_result':
          // For the final result (who goes first)
          return entry.details || 'Initiative determined.';
        default:
          return entry.details || 'Unknown action occurred.';
      }
    });
  };

  // Auto-scroll to top when new entries are added (since newest entries are at the top)
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [entries]);

  // Make sure entries are sorted by timestamp (newest first) before formatting
  // This ensures consistent ordering even if the entries prop isn't already sorted
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  const formattedEntries = formatLogEntries(sortedEntries);

  // Force a re-render when entries change to ensure proper ordering
  useEffect(() => {
    // This empty effect with entries dependency will trigger a re-render
    // when entries change, ensuring the sorted order is applied
  }, [entries]);

  // Debug log to help diagnose ordering issues
  console.log('BattleLog component rendering entries:', entries.length);
  if (sortedEntries.length > 0) {
    console.log('First entry (newest):', sortedEntries[0].details);
    console.log('Last entry (oldest):', sortedEntries[sortedEntries.length - 1].details);

    // Check for "The duel has begun" and "Rolling for initiative" entries
    const duelBegunEntry = sortedEntries.find(entry =>
      entry.action === 'combat_start' && entry.details?.includes('The duel has begun')
    );

    const initiativeEntry = sortedEntries.find(entry =>
      entry.action === 'initiative' && entry.details === 'Rolling for initiative...'
    );

    if (duelBegunEntry) {
      const index = sortedEntries.indexOf(duelBegunEntry);
      console.log(`"The duel has begun" entry is at position ${index} of ${sortedEntries.length}`);
    }

    if (initiativeEntry) {
      const index = sortedEntries.indexOf(initiativeEntry);
      console.log(`"Rolling for initiative" entry is at position ${index} of ${sortedEntries.length}`);
    }
  }

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