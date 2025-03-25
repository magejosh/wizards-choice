// src/lib/ui/components/models/WizardModel.tsx
'use client';

import React from 'react';
import { theme } from '../../theme';

interface WizardModelProps {
  position: [number, number, number];
  color: string;
  isEnemy?: boolean;
}

const WizardModel: React.FC<WizardModelProps> = ({ 
  position, 
  color, 
  isEnemy = false 
}) => {
  return (
    <group position={position}>
      {/* Wizard body (cone) */}
      <mesh position={[0, 1, 0]}>
        <coneGeometry args={[1, 2, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Wizard hat */}
      <mesh position={[0, 2.5, 0]}>
        <coneGeometry args={[0.5, 1, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Staff (for enemy wizard) */}
      {isEnemy && (
        <mesh position={[1, 1, 0]} rotation={[0, 0, Math.PI / 4]}>
          <cylinderGeometry args={[0.1, 0.1, 2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      )}
      
      {/* Magical orb */}
      <mesh position={isEnemy ? [1.5, 1.5, 0] : [-1.5, 1.5, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={isEnemy ? theme.colors.elements.fire : theme.colors.elements.arcane} 
          emissive={isEnemy ? theme.colors.elements.fire : theme.colors.elements.arcane}
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
};

export default WizardModel;
