// src/components/battle/BattleEndModal.tsx
import React from 'react';

interface BattleEndModalProps {
  status: 'playerWon' | 'enemyWon' | 'active';
  onContinue: () => void;
  onLootEnemy?: () => void; // Optional prop for handling enemy looting
  experienceGained?: number; // Optional prop for displaying experience gained
}

const BattleEndModal: React.FC<BattleEndModalProps> = ({ status, onContinue, onLootEnemy, experienceGained }) => {
  if (status === 'active') return null;

  const buttonStyle = {
    backgroundColor: '#6a4c93',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '4px',
    fontSize: '1.1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    margin: '0 8px'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.8)'
    }}>
      <div style={{
        backgroundColor: '#1a1a2e',
        border: '2px solid #6a4c93',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 0 20px rgba(106, 76, 147, 0.7)',
        width: '80%',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#e94560', fontSize: '2.5rem', marginBottom: '20px' }}>
          {status === 'playerWon' ? 'Victory!' : 'Defeat!'}
        </h2>
        <p style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '10px' }}>
          {status === 'playerWon'
            ? 'You gained experience and improved your magical prowess!'
            : 'You have been defeated by the enemy wizard!'}
        </p>
        {status === 'playerWon' && experienceGained !== undefined && (
          <p style={{ color: '#9370DB', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>
            +{experienceGained} Experience
          </p>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {status === 'playerWon' && onLootEnemy && (
            <button
              onClick={onLootEnemy}
              style={buttonStyle}
            >
              Loot Enemy
            </button>
          )}
          <button
            onClick={onContinue}
            style={buttonStyle}
          >
            Continue to Wizard's Study
          </button>
        </div>
      </div>
    </div>
  );
};

export default BattleEndModal;