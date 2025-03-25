// src/lib/ui/components/scenes/BattleScene.tsx
'use client';

import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import { CombatState } from '../../../types';
import WizardModel from '../models/WizardModel';
import theme from '../../theme';

interface BattleSceneProps {
  combatState: CombatState;
}

const BattleScene: React.FC<BattleSceneProps> = ({ combatState }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    // Position camera to view the battle
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  
  return (
    <>
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
    </>
  );
};

export default BattleScene;
