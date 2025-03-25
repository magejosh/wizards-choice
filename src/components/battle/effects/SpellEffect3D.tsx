'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Trail } from '@react-three/drei';
import { Vector3, Mesh } from 'three';

interface SpellEffect3DProps {
  type: string;
  element: string;
  position: [number, number, number];
  target: 'player' | 'enemy';
  lifetime: number;
}

// Helper function to get colors based on element
const getElementColors = (element: string) => {
  switch (element.toLowerCase()) {
    case 'fire':
      return { primary: '#ff4400', secondary: '#ffcc00' };
    case 'water':
      return { primary: '#0088ff', secondary: '#00ccff' };
    case 'earth':
      return { primary: '#88cc00', secondary: '#448800' };
    case 'air':
      return { primary: '#ffffff', secondary: '#aaccff' };
    case 'arcane':
      return { primary: '#aa00ff', secondary: '#ff00ff' };
    case 'shadow':
      return { primary: '#440044', secondary: '#880088' };
    case 'light':
      return { primary: '#ffff88', secondary: '#ffffcc' };
    default:
      return { primary: '#ff44ff', secondary: '#8800ff' }; // Default magical colors
  }
};

const SpellEffect3D: React.FC<SpellEffect3DProps> = ({ 
  type, 
  element, 
  position, 
  target, 
  lifetime 
}) => {
  const meshRef = useRef<Mesh>(null);
  const colors = getElementColors(element);
  
  // Calculate direction based on target (from caster to target)
  const direction = target === 'player' ? new Vector3(-1, 0, 0) : new Vector3(1, 0, 0);
  
  // Update position and scale based on lifetime
  useFrame((_, delta) => {
    if (meshRef.current) {
      // Move in the direction of the target
      meshRef.current.position.x += direction.x * delta * 2;
      
      // Scale down as the effect ages
      const scale = Math.min(1, lifetime / 60);
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  // Render different effects based on spell type
  const renderEffect = () => {
    switch (type.toLowerCase()) {
      case 'attack':
        return (
          <group>
            <mesh ref={meshRef} position={position}>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshStandardMaterial 
                color={colors.primary} 
                emissive={colors.secondary}
                emissiveIntensity={2}
                transparent={true}
                opacity={0.8}
              />
              <Sparkles 
                count={20} 
                scale={2} 
                size={0.2} 
                speed={0.5} 
                color={colors.secondary} 
              />
            </mesh>
            <Trail 
              width={0.5}
              length={8}
              color={colors.primary}
              attenuation={(t) => t * t}
            >
              <mesh position={position}>
                <sphereGeometry args={[0.1, 8, 8]} />
                <meshBasicMaterial color={colors.primary} />
              </mesh>
            </Trail>
          </group>
        );
      
      case 'defense':
        return (
          <mesh ref={meshRef} position={position}>
            <torusGeometry args={[0.7, 0.1, 16, 32]} />
            <meshStandardMaterial 
              color={colors.primary}
              emissive={colors.secondary}
              emissiveIntensity={2}
              transparent={true}
              opacity={0.7}
            />
            <Sparkles 
              count={30} 
              scale={1.5} 
              size={0.1} 
              speed={0.2} 
              color={colors.secondary} 
            />
          </mesh>
        );
      
      case 'healing':
        return (
          <mesh ref={meshRef} position={position}>
            <icosahedronGeometry args={[0.6, 1]} />
            <meshStandardMaterial 
              color="#00ff88"
              emissive="#88ffcc"
              emissiveIntensity={2}
              transparent={true}
              opacity={0.7}
            />
            <Sparkles 
              count={40} 
              scale={2} 
              size={0.1} 
              speed={0.3} 
              color="#aaffcc" 
            />
          </mesh>
        );
      
      case 'utility':
        return (
          <mesh ref={meshRef} position={position}>
            <octahedronGeometry args={[0.5, 1]} />
            <meshStandardMaterial 
              color={colors.primary}
              emissive={colors.secondary}
              wireframe={true}
              transparent={true}
              opacity={0.9}
            />
            <Sparkles 
              count={25} 
              scale={1.8} 
              size={0.1} 
              speed={0.1} 
              color={colors.secondary} 
            />
          </mesh>
        );
        
      default:
        // Generic magical effect for any other type
        return (
          <mesh ref={meshRef} position={position}>
            <dodecahedronGeometry args={[0.4, 0]} />
            <meshStandardMaterial 
              color={colors.primary}
              emissive={colors.secondary}
              emissiveIntensity={1.5}
              transparent={true}
              opacity={0.8}
            />
            <Sparkles 
              count={15} 
              scale={1.5} 
              size={0.1} 
              speed={0.4} 
              color={colors.secondary} 
            />
          </mesh>
        );
    }
  };

  return renderEffect();
};

export default SpellEffect3D; 