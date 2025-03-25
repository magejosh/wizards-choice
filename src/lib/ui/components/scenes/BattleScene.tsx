// src/lib/ui/components/scenes/BattleScene.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Stars, Text } from '@react-three/drei';
import { CombatState, SpellEffect, ElementType } from '../../../types';
import WizardModel from '../models/WizardModel';
import SpellEffect3D from '../effects/SpellEffect3D';
import { theme } from '../../theme';

interface BattleSceneProps {
  combatState: CombatState;
}

const BattleScene: React.FC<BattleSceneProps> = ({ combatState }) => {
  const { camera } = useThree();
  const [activeEffects, setActiveEffects] = useState<{
    type: string;
    element: ElementType;
    position: [number, number, number];
    target: 'player' | 'enemy';
    lifetime: number;
  }[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<{
    value: number;
    position: [number, number, number];
    lifetime: number;
    color: string;
    isHealing: boolean;
  }[]>([]);

  const prevLogLength = useRef(combatState.log.length);
  
  useEffect(() => {
    // Position camera to view the battle
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  // Process combat log to create visual effects
  useEffect(() => {
    if (combatState.log.length > prevLogLength.current) {
      const latestLog = combatState.log[combatState.log.length - 1];
      
      // Display damage or healing numbers
      if (latestLog.damage && latestLog.damage > 0) {
        const targetPosition: [number, number, number] = latestLog.actor === 'player' ? [3, 1.5, 0] : [-3, 1.5, 0];
        setDamageNumbers(prev => [...prev, {
          value: latestLog.damage,
          position: targetPosition,
          lifetime: 60, // frames
          color: '#ff4444',
          isHealing: false
        }]);
        
        // Add visual effect based on spell type
        if (latestLog.action === 'spell_cast' && combatState[latestLog.actor === 'player' ? 'playerWizard' : 'enemyWizard'].selectedSpell) {
          const spell = combatState[latestLog.actor === 'player' ? 'playerWizard' : 'enemyWizard'].selectedSpell;
          if (spell) {
            setActiveEffects(prev => [...prev, {
              type: spell.type,
              element: spell.element,
              position: targetPosition,
              target: latestLog.actor === 'player' ? 'enemy' : 'player',
              lifetime: 90 // frames
            }]);
          }
        }
      }
      
      if (latestLog.healing && latestLog.healing > 0) {
        const targetPosition: [number, number, number] = latestLog.actor === 'player' ? [-3, 1.5, 0] : [3, 1.5, 0];
        setDamageNumbers(prev => [...prev, {
          value: latestLog.healing,
          position: targetPosition,
          lifetime: 60, // frames
          color: '#44ff44',
          isHealing: true
        }]);
      }
      
      prevLogLength.current = combatState.log.length;
    }
  }, [combatState.log]);

  // Animation frame handler
  useFrame(() => {
    // Update active effects lifetimes
    setActiveEffects(prev => 
      prev
        .map(effect => ({ ...effect, lifetime: effect.lifetime - 1 }))
        .filter(effect => effect.lifetime > 0)
    );
    
    // Update damage numbers
    setDamageNumbers(prev => 
      prev
        .map(num => ({ 
          ...num, 
          lifetime: num.lifetime - 1,
          position: [
            num.position[0], 
            num.position[1] + 0.03, 
            num.position[2]
          ] as [number, number, number] // Explicitly type as tuple
        }))
        .filter(num => num.lifetime > 0)
    );
  });
  
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
        health={combatState.playerWizard.currentHealth / combatState.playerWizard.wizard.maxHealth}
        isActive={combatState.isPlayerTurn && combatState.status === 'active'}
      />
      
      {/* Enemy wizard */}
      <WizardModel 
        position={[3, 0, 0]} 
        color={theme.colors.secondary.dark} 
        isEnemy={true}
        health={combatState.enemyWizard.currentHealth / combatState.enemyWizard.wizard.maxHealth}
        isActive={!combatState.isPlayerTurn && combatState.status === 'active'}
      />
      
      {/* Render active spell effects */}
      {activeEffects.map((effect, index) => (
        <SpellEffect3D 
          key={index}
          type={effect.type}
          element={effect.element}
          position={effect.position}
          target={effect.target}
          lifetime={effect.lifetime}
        />
      ))}
      
      {/* Render damage/healing numbers */}
      {damageNumbers.map((damageInfo, index) => (
        <Text
          key={`damage-${index}`}
          position={damageInfo.position}
          color={damageInfo.color}
          fontSize={0.5}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {damageInfo.isHealing ? '+' : ''}{damageInfo.value}
        </Text>
      ))}
      
      {/* Turn indicator */}
      <Text
        position={[0, 3.5, 0]}
        color={combatState.isPlayerTurn ? theme.colors.primary.main : theme.colors.secondary.dark}
        fontSize={0.6}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {combatState.isPlayerTurn ? "Your Turn" : "Enemy's Turn"}
      </Text>
      
      {/* Orbit controls for development/debugging */}
      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  );
};

export default BattleScene;
