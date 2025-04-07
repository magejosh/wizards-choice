import React from 'react';
import { CombatPhase } from '@/lib/types';
import styles from './PhaseTracker.module.css';

interface PhaseTrackerProps {
  currentPhase: CombatPhase;
  isPlayerTurn: boolean;
  round: number;
}

const PhaseTracker: React.FC<PhaseTrackerProps> = ({
  currentPhase,
  isPlayerTurn,
  round
}) => {
  // Define all possible phases in order
  const phases: CombatPhase[] = [
    'initiative',
    'draw',
    'upkeep',
    'action',
    'response',
    'resolve',
    'discard',
    'end'
  ];

  // Get the index of the current phase
  const currentPhaseIndex = phases.indexOf(currentPhase);

  // Format phase display name
  const formatPhaseName = (phase: CombatPhase): string => {
    return phase.charAt(0).toUpperCase() + phase.slice(1);
  };

  return (
    <div className={styles.phaseTrackerContainer}>
      <div className={styles.headerInfo}>
        <div className={styles.roundIndicator}>
          Round {round}
        </div>
        <div className={styles.phaseSeparator}>-</div>
        <div className={styles.turnIndicator}>
          {isPlayerTurn ? "Your Turn" : "Enemy's Turn"}
        </div>
      </div>
      <div className={styles.phasesContainer}>
        {phases.map((phase, index) => (
          <div
            key={phase}
            className={`
              ${styles.phaseItem}
              ${currentPhase === phase ? styles.activePhase : ''}
              ${index < currentPhaseIndex ? styles.completedPhase : ''}
            `}
          >
            <div className={styles.phaseIcon}>
              {getPhaseIcon(phase)}
            </div>
            <div className={styles.phaseName}>
              {formatPhaseName(phase)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to get icons for each phase
function getPhaseIcon(phase: CombatPhase): React.ReactNode {
  switch (phase) {
    case 'initiative':
      return '🎲';
    case 'draw':
      return '🃏';
    case 'upkeep':
      return '⚡';
    case 'action':
      return '⚔️';
    case 'response':
      return '🛡️';
    case 'resolve':
      return '✨';
    case 'discard':
      return '🗑️';
    case 'end':
      return '🔄';
    default:
      return '•';
  }
}

export default PhaseTracker;