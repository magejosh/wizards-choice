'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ElementType, SpellType } from '../../../types';
import { theme } from '../../theme';

interface SpellEffect3DProps {
  type: string;
  element: ElementType;
  position: [number, number, number];
  target: 'player' | 'enemy';
  lifetime: number;
}

const SpellEffect3D: React.FC<SpellEffect3DProps> = ({
  type,
  element,
  position,
  target,
  lifetime
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  
  // Get element color from theme
  const getElementColor = (element: ElementType): string => {
    return theme.colors.elements[element] || '#ffffff';
  };
  
  // Convert hex color to THREE.Color
  const elementColor = new THREE.Color(getElementColor(element));
  
  // Animation based on effect type and lifetime
  useFrame(() => {
    const progress = lifetime / 90; // Normalize from 0 to 1
    
    if (groupRef.current) {
      // Scale effect based on lifetime
      const scale = Math.min(1, 2 - progress * 2);
      groupRef.current.scale.set(scale, scale, scale);
      
      // Rotate based on spell type
      if (type === 'damage' || type === 'dot') {
        groupRef.current.rotation.z += 0.05;
      } else if (type === 'healing') {
        groupRef.current.rotation.y += 0.03;
      } else {
        groupRef.current.rotation.x += 0.02;
        groupRef.current.rotation.y += 0.01;
      }
      
      // Move effect towards target
      const targetPos = target === 'player' ? [-3, 1, 0] : [3, 1, 0];
      groupRef.current.position.x = THREE.MathUtils.lerp(position[0], targetPos[0], 1 - progress);
      groupRef.current.position.y = THREE.MathUtils.lerp(position[1], targetPos[1], 1 - progress);
      groupRef.current.position.z = THREE.MathUtils.lerp(position[2], targetPos[2], 1 - progress);
    }
    
    // Particle animation
    if (particlesRef.current && particlesRef.current.geometry instanceof THREE.BufferGeometry) {
      const positions = particlesRef.current.geometry.attributes.position;
      
      // Animate particles
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);
        
        positions.setXYZ(
          i,
          x + (Math.random() - 0.5) * 0.05,
          y + (Math.random() - 0.5) * 0.05,
          z + (Math.random() - 0.5) * 0.05
        );
      }
      
      positions.needsUpdate = true;
    }
    
    // Ring animation
    if (ringRef.current) {
      ringRef.current.scale.x = 1 + Math.sin(lifetime * 0.1) * 0.2;
      ringRef.current.scale.y = 1 + Math.sin(lifetime * 0.1 + 1) * 0.2;
    }
  });
  
  // Create different effect visuals based on spell type
  const renderEffectType = () => {
    switch (type) {
      case 'damage':
        return (
          <>
            {/* Explosive particles */}
            <points ref={particlesRef}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={50}
                  array={new Float32Array(150).map(() => (Math.random() - 0.5) * 2)}
                  itemSize={3}
                />
              </bufferGeometry>
              <pointsMaterial
                size={0.15}
                color={elementColor}
                transparent
                opacity={0.8}
              />
            </points>
            
            {/* Energy core */}
            <mesh>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshStandardMaterial
                color={elementColor}
                emissive={elementColor}
                emissiveIntensity={1.5}
                transparent
                opacity={0.9}
              />
            </mesh>
          </>
        );
        
      case 'healing':
        return (
          <>
            {/* Gentle glow particles */}
            <points ref={particlesRef}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={30}
                  array={new Float32Array(90).map(() => (Math.random() - 0.5) * 2)}
                  itemSize={3}
                />
              </bufferGeometry>
              <pointsMaterial
                size={0.1}
                color={elementColor}
                transparent
                opacity={0.7}
              />
            </points>
            
            {/* Healing ring */}
            <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.6, 0.05, 16, 32]} />
              <meshStandardMaterial
                color={elementColor}
                emissive={elementColor}
                emissiveIntensity={1.5}
                transparent
                opacity={0.9}
              />
            </mesh>
          </>
        );
        
      case 'buff':
      case 'debuff':
        return (
          <>
            {/* Energy field */}
            <mesh>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshStandardMaterial
                color={elementColor}
                emissive={elementColor}
                emissiveIntensity={1}
                transparent
                opacity={0.4}
                wireframe
              />
            </mesh>
            
            {/* Swirling particles */}
            <points ref={particlesRef}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={40}
                  array={new Float32Array(120).map(() => (Math.random() - 0.5) * 2)}
                  itemSize={3}
                />
              </bufferGeometry>
              <pointsMaterial
                size={0.08}
                color={elementColor}
                transparent
                opacity={0.8}
              />
            </points>
          </>
        );
      
      default:
        return (
          <>
            {/* Default effect */}
            <mesh>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshStandardMaterial
                color={elementColor}
                emissive={elementColor}
                emissiveIntensity={1}
                transparent
                opacity={0.7}
              />
            </mesh>
          </>
        );
    }
  };
  
  return (
    <group ref={groupRef} position={position}>
      {renderEffectType()}
    </group>
  );
};

export default SpellEffect3D; 