import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading Wizard\'s Choice...' 
}) => {
  return (
    <div className="loading-screen" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100dvh',
      height: '100vh', // Fallback
      width: '100vw',
      background: '#161630',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
    }}>
      <div className="loading-spinner" style={{
        width: '60px',
        height: '60px',
        border: '5px solid rgba(106, 76, 147, 0.3)',
        borderTop: '5px solid #6a4c93',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }} />
      <p style={{
        color: '#a786df',
        fontSize: '1.5rem',
        fontFamily: 'serif',
        letterSpacing: '0.1em'
      }}>{message}</p>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen; 