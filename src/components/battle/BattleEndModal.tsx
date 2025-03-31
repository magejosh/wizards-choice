// src/components/battle/BattleEndModal.tsx
import React from 'react';

interface BattleEndModalProps {
  status: 'playerWon' | 'enemyWon' | 'active';
  onContinue: () => void;
}

const BattleEndModal: React.FC<BattleEndModalProps> = ({ status, onContinue }) => {
  if (status === 'active') return null;
  
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
        <p style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px' }}>
          {status === 'playerWon' 
            ? 'You gained experience and improved your magical prowess!' 
            : 'You have been defeated by the enemy wizard!'}
        </p>
        <button 
          onClick={onContinue}
          style={{
            backgroundColor: '#6a4c93',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          Continue to Wizard's Study
        </button>
      </div>
    </div>
  );
};

export default BattleEndModal;