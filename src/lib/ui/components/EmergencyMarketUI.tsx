'use client';

import React from 'react';

interface EmergencyMarketUIProps {
  onClose: () => void;
}

// Ultra simple emergency UI - just testing visibility
const EmergencyMarketUI: React.FC<EmergencyMarketUIProps> = ({ onClose }) => {
  console.log('MINIMAL EMERGENCY MARKET UI: Mounting component');
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'red',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1 style={{ color: 'white', fontSize: '48px' }}>
        EMERGENCY MARKET
      </h1>
      
      <button 
        onClick={onClose}
        style={{
          backgroundColor: 'white',
          color: 'black',
          padding: '20px 40px',
          fontSize: '24px',
          marginTop: '40px',
          cursor: 'pointer',
          border: 'none',
          borderRadius: '10px'
        }}
      >
        CLOSE
      </button>
    </div>
  );
};

export default EmergencyMarketUI; 