'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';

interface WizardModelProps {
  position: [number, number, number];
  color: string;
  health: number; // 0.0 to 1.0
  isActive?: boolean;
  isEnemy?: boolean;
}

const WizardModel: React.FC<WizardModelProps> = ({
  position,
  color,
  health,
  isActive = false,
  isEnemy = false
}) => {
  const bodyRef = useRef<Mesh>(null);
  const headRef = useRef<Mesh>(null);
  const staffRef = useRef<Mesh>(null);
  const healthBarRef = useRef<Mesh>(null);
  
  const [hoverAnimation, setHoverAnimation] = useState<number>(0);
  
  // Animate the wizard based on active state
  useFrame((_, delta) => {
    // Bounce animation when active
    if (isActive) {
      setHoverAnimation(prev => prev + delta);
      
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(hoverAnimation * 2) * 0.1 + 0.1;
      }
      
      if (headRef.current) {
        headRef.current.position.y = Math.sin(hoverAnimation * 2 + 0.5) * 0.05 + 1.1;
      }
      
      if (staffRef.current) {
        staffRef.current.rotation.z = Math.sin(hoverAnimation * 3) * 0.1;
      }
    } else {
      // Reset positions when not active
      if (bodyRef.current && bodyRef.current.position.y !== 0.1) {
        bodyRef.current.position.y = 0.1;
      }
      
      if (headRef.current && headRef.current.position.y !== 1.1) {
        headRef.current.position.y = 1.1;
      }
      
      if (staffRef.current && staffRef.current.rotation.z !== 0) {
        staffRef.current.rotation.z = 0;
      }
    }
    
    // Update health bar scale
    if (healthBarRef.current) {
      healthBarRef.current.scale.x = Math.max(0.01, health);
    }
  });
  
  // Get health bar color based on health percentage
  const getHealthColor = () => {
    if (health > 0.6) return '#44ff44'; // Green
    if (health > 0.3) return '#ffff00'; // Yellow
    return '#ff4444'; // Red
  };
  
  return (
    <group position={position}>
      {/* Wizard body */}
      <mesh 
        ref={bodyRef} 
        position={[0, 0.1, 0]}
        rotation={[0, isEnemy ? Math.PI : 0, 0]}
      >
        {/* Robe */}
        <cylinderGeometry args={[0.4, 0.6, 1.2, 8]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.7}
        />
      </mesh>
      
      {/* Wizard head */}
      <mesh 
        ref={headRef}
        position={[0, 1.1, 0]}
        rotation={[0, isEnemy ? Math.PI : 0, 0]}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color="#f8d8c0" 
          roughness={0.2}
        />
        
        {/* Hat */}
        <mesh position={[0, 0.25, 0]}>
          <coneGeometry args={[0.35, 0.7, 16]} />
          <meshStandardMaterial 
            color={color} 
            roughness={0.5}
          />
          <mesh position={[0, -0.25, 0]}>
            <torusGeometry args={[0.4, 0.1, 8, 16]} />
            <meshStandardMaterial 
              color={color} 
              roughness={0.5}
            />
          </mesh>
        </mesh>
      </mesh>
      
      {/* Wizard staff/wand */}
      <mesh 
        ref={staffRef}
        position={[isEnemy ? -0.6 : 0.6, 0.5, 0]}
        rotation={[0, 0, isEnemy ? -0.3 : 0.3]}
      >
        <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
        <meshStandardMaterial 
          color="#8b4513" 
          roughness={0.7}
        />
        
        {/* Staff gem */}
        <mesh position={[0, 0.8, 0]}>
          <dodecahedronGeometry args={[0.15, 0]} />
          <meshStandardMaterial 
            color={isEnemy ? '#ff4444' : '#44aaff'} 
            emissive={isEnemy ? '#ff8888' : '#88ccff'}
            emissiveIntensity={isActive ? 1.5 : 0.5}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>
      </mesh>
      
      {/* Health bar */}
      <group position={[0, 2, 0]}>
        {/* Health bar background */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.2, 0.15, 0.05]} />
          <meshStandardMaterial 
            color="#222222" 
            roughness={0.5}
          />
        </mesh>
        
        {/* Health bar fill */}
        <mesh 
          ref={healthBarRef}
          position={[0, 0, 0.03]}
          scale={[health, 1, 1]}
        >
          <boxGeometry args={[1.2, 0.15, 0.05]} />
          <meshStandardMaterial 
            color={getHealthColor()} 
            emissive={getHealthColor()}
            emissiveIntensity={0.5}
            roughness={0.3}
          />
        </mesh>
        
        {/* Health percentage text */}
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {Math.floor(health * 100)}%
        </Text>
      </group>
      
      {/* Glow effect when active */}
      {isActive && (
        <mesh position={[0, 0.5, -0.5]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial 
            color={isEnemy ? '#ff000033' : '#0000ff33'} 
            transparent={true}
            opacity={0.3}
          />
        </mesh>
      )}
    </group>
  );
};

export default WizardModel; 