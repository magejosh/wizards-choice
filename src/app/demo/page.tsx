'use client';

import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import WizardModel from '../lib/ui/components/models/WizardModel';
import { theme } from '../lib/ui/theme';

export default function DemoPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="loading">Loading 3D scene...</div>;
  }

  return (
    <div className="demo-page" style={{ width: '100vw', height: '100vh' }}>
      <Canvas>
        {/* Environment and lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="night" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        
        {/* Battle platform */}
        <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[5, 32]} />
          <meshStandardMaterial 
            color={theme.colors.primary.dark} 
            metalness={0.5}
            roughness={0.2}
          />
        </mesh>
        
        {/* Player wizard */}
        <WizardModel 
          position={[-3, 0, 0]} 
          color={theme.colors.primary.main} 
        />
        
        {/* Enemy wizard */}
        <WizardModel 
          position={[3, 0, 0]} 
          color={theme.colors.secondary.dark} 
          isEnemy={true} 
        />
        
        {/* Orbit controls for development/debugging */}
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>

      <div className="demo-controls" style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '10px',
        backgroundColor: 'rgba(26, 26, 46, 0.8)',
        padding: '10px',
        borderRadius: '8px',
        zIndex: 1000
      }}>
        <button onClick={() => window.location.href = '/'} style={{
          backgroundColor: theme.colors.primary.main,
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          border: 'none',
          cursor: 'pointer'
        }}>
          Return to Main Menu
        </button>
      </div>
    </div>
  );
}
