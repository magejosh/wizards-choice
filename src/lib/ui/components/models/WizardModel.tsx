// src/lib/ui/components/models/WizardModel.tsx
'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { theme } from '../../theme';

interface WizardModelProps {
  position: [number, number, number];
  color: string;
  isEnemy?: boolean;
  health?: number;
  isActive?: boolean;
}

const WizardModel: React.FC<WizardModelProps> = ({ 
  position, 
  color, 
  isEnemy = false,
  health = 1,
  isActive = false
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const orbRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);
  
  // Animations
  useFrame((state) => {
    if (groupRef.current) {
      // Idle animation - gentle floating
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
      
      // Active state animation
      if (isActive) {
        // Slightly bounce when active
        groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      } else {
        // Reset rotation when inactive
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          isEnemy ? 0.2 : -0.2,
          0.1
        );
      }
    }
    
    // Orb glow animation
    if (orbRef.current && orbRef.current.material instanceof THREE.MeshStandardMaterial) {
      time.current += 0.05;
      const pulseIntensity = isActive ? 
        0.8 + Math.sin(time.current * 2) * 0.3 : 
        0.5 + Math.sin(time.current) * 0.1;
      
      orbRef.current.material.emissiveIntensity = pulseIntensity;
    }
  });
  
  // Calculate health color
  const healthColor = new THREE.Color(
    Math.max(0, Math.min(1, 2 * (1 - health))), // Red: increases as health decreases
    Math.max(0, Math.min(1, 2 * health)), // Green: increases as health increases
    0.2 // Fixed blue component
  );
  
  return (
    <group position={position} ref={groupRef}>
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
      
      {/* Staff */}
      <mesh 
        position={isEnemy ? [1, 1, 0] : [-1, 1, 0]} 
        rotation={[0, 0, isEnemy ? Math.PI / 4 : -Math.PI / 4]}
      >
        <cylinderGeometry args={[0.1, 0.1, 2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Magical orb */}
      <mesh 
        position={isEnemy ? [1.5, 1.5, 0] : [-1.5, 1.5, 0]}
        ref={orbRef}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color={isEnemy ? theme.colors.elements.fire : theme.colors.elements.arcane} 
          emissive={isEnemy ? theme.colors.elements.fire : theme.colors.elements.arcane}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Health bar */}
      <group position={[0, 3.2, 0]}>
        {/* Background */}
        <mesh position={[0, 0, 0]} scale={[1.5, 0.2, 0.1]}>
          <boxGeometry />
          <meshStandardMaterial color="#333333" />
        </mesh>
        
        {/* Health meter */}
        <mesh 
          position={[(health - 1) * 0.75, 0, 0.1]} 
          scale={[1.5 * health, 0.15, 0.05]}
        >
          <boxGeometry />
          <meshStandardMaterial color={healthColor.getStyle()} />
        </mesh>
      </group>
    </group>
  );
};

export default WizardModel;
