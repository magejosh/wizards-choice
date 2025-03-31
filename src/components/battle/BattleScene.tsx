'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Stars, Text, OrbitControls } from '@react-three/drei';
import SpellEffect3D from './effects/SpellEffect3D';
import WizardModel from './WizardModel';
import { Spell, ActiveEffect } from '../../lib/types/spell-types';
import { CombatState, CombatLogEntry, CombatWizard } from '../../lib/types/combat-types';

interface DamageNumber {
  value: number;
  position: [number, number, number];
  lifetime: number;
  color: string;
  isHealing: boolean;
}

interface VisualEffect {
  type: string;
  element: string;
  position: [number, number, number];
  target: 'player' | 'enemy';
  lifetime: number;
  id?: string;
}

interface BattleSceneProps {
  combatState?: CombatState;
  playerHealth?: number;
  playerMaxHealth?: number;
  enemyHealth?: number;
  enemyMaxHealth?: number;
  log?: CombatLogEntry[];
  animating?: boolean;
}

// Create a separate component for the 3D scene content
const BattleSceneContent: React.FC<BattleSceneProps> = (props) => {
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [activeEffects, setActiveEffects] = useState<VisualEffect[]>([]);
  const prevLogLength = useRef<number>(0);
  
  // Extract props - support both old and new formats
  const combatState = props.combatState;
  const log = props.log || (combatState ? combatState.log : []);
  const playerHealth = props.playerHealth || (combatState ? combatState.playerWizard.currentHealth : 100);
  const playerMaxHealth = props.playerMaxHealth || (combatState ? combatState.playerWizard.wizard.maxHealth : 100);
  const enemyHealth = props.enemyHealth || (combatState ? combatState.enemyWizard.currentHealth : 100);
  const enemyMaxHealth = props.enemyMaxHealth || (combatState ? combatState.enemyWizard.wizard.maxHealth : 100);
  
  // Theme colors for consistency
  const theme = {
    colors: {
      primary: {
        main: '#4a2ca8',  // Purple for player wizard
        dark: '#371f80'
      },
      secondary: {
        main: '#8B0040',  // Dark red for enemy wizard
        dark: '#660030'
      },
      background: '#0a0a0f',  // Almost black background
      platform: '#1a1a2f',    // Slightly lighter than background for platform
      health: {
        bar: '#00ff00',  // Bright green for health bars
        text: '#ffffff'   // White for text
      },
      mana: {
        player: '#0088ff',  // Bright blue for player mana
        enemy: '#9933ff'    // Purple for enemy mana
      }
    }
  };
  
  // Process combat log to create visual effects
  useEffect(() => {
    if (log.length > prevLogLength.current) {
      const latestLog = log[log.length - 1];
      
      // Display damage or healing numbers
      if (latestLog.damage && latestLog.damage > 0) {
        const targetPosition: [number, number, number] = latestLog.target === 'enemy' ? [3, 1.5, 0] : [-3, 1.5, 0];
        setDamageNumbers(prev => [...prev, {
          value: latestLog.damage,
          position: targetPosition,
          lifetime: 30, // Reduced from 60 to 30 frames for faster completion
          color: '#ff4444',
          isHealing: false
        }]);
        
        // Add visual effect based on spell type
        if (latestLog.action === 'spell_cast' && combatState && combatState[latestLog.actor === 'player' ? 'playerWizard' : 'enemyWizard'].selectedSpell) {
          const spell = combatState[latestLog.actor === 'player' ? 'playerWizard' : 'enemyWizard'].selectedSpell;
          if (spell) {
            setActiveEffects(prev => [...prev, {
              type: spell.type,
              element: spell.element,
              position: latestLog.actor === 'player' ? [-3, 1, 0] : [3, 1, 0],
              target: latestLog.actor === 'player' ? 'enemy' : 'player',
              lifetime: 30, // Reduced from 60 to 30 frames for faster completion
              id: `spell-effect-${Date.now()}-${Math.random()}` // Add unique ID to help with rendering
            }]);
          }
        }
      }
      
      if (latestLog.healing && latestLog.healing > 0) {
        const targetPosition: [number, number, number] = latestLog.target === 'enemy' ? [3, 1.5, 0] : [-3, 1.5, 0];
        setDamageNumbers(prev => [...prev, {
          value: latestLog.healing,
          position: targetPosition,
          lifetime: 30, // Reduced from 60 to 30 frames for faster completion
          color: '#44ff44',
          isHealing: true
        }]);
        
        // Add healing visual effect
        if (latestLog.action === 'spell_cast' && combatState && combatState[latestLog.actor === 'player' ? 'playerWizard' : 'enemyWizard'].selectedSpell) {
          const spell = combatState[latestLog.actor === 'player' ? 'playerWizard' : 'enemyWizard'].selectedSpell;
          if (spell && spell.type === 'healing') {
            setActiveEffects(prev => [...prev, {
              type: 'healing',
              element: spell.element,
              position: targetPosition,
              target: latestLog.target === 'enemy' ? 'enemy' : 'player',
              lifetime: 30, // Reduced from 60 to 30 frames for faster completion
              id: `heal-effect-${Date.now()}-${Math.random()}` // Add unique ID to help with rendering
            }]);
          }
        }
      }
      
      prevLogLength.current = log.length;
    }
  }, [log, combatState]);

  // Animation frame handler - use even higher decay rate to ensure effects don't last too long
  useFrame(() => {
    // Update active effects lifetimes
    setActiveEffects(prev => 
      prev
        .map(effect => ({ ...effect, lifetime: effect.lifetime - 3 })) // Even faster decay (from 2 to 3)
        .filter(effect => effect.lifetime > 0)
    );
    
    // Update damage numbers
    setDamageNumbers(prev => 
      prev
        .map(num => ({ 
          ...num, 
          lifetime: num.lifetime - 3, // Even faster decay (from 2 to 3)
          position: [
            num.position[0], 
            num.position[1] + 0.05, // Move slightly faster upward
            num.position[2]
          ] as [number, number, number]
        }))
        .filter(num => num.lifetime > 0)
    );
  });
  
  return (
    <>
      {/* Environment and lighting */}
      <ambientLight intensity={0.4} />  {/* Slightly increased for better visibility */}
      <directionalLight position={[10, 10, 5]} intensity={1.2} />  {/* Slightly increased for better visibility */}
      <Environment preset="night" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      
      {/* Battle platform */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={1}>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial 
          color={theme.colors.platform}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      
      {/* Player wizard */}
      <WizardModel 
        position={[-2.5, 0, 0]} 
        color={theme.colors.primary.main}
        health={playerHealth / playerMaxHealth}
        isActive={combatState ? (combatState.isPlayerTurn && combatState.status === 'active') : true}
      />
      
      {/* Enemy wizard */}
      <WizardModel 
        position={[2.5, 0, 0]} 
        color={theme.colors.secondary.main}
        isEnemy={true}
        health={enemyHealth / enemyMaxHealth}
        isActive={combatState ? (!combatState.isPlayerTurn && combatState.status === 'active') : false}
      />
      
      {/* Render active spell effects - adjusted for tighter view */}
      {activeEffects.map((effect, index) => (
        <SpellEffect3D 
          key={effect.id || `effect-${index}-${effect.type}-${effect.lifetime}`}
          type={effect.type}
          element={effect.element}
          position={[effect.position[0] * 0.8, effect.position[1], effect.position[2]]}
          target={effect.target}
          lifetime={effect.lifetime}
        />
      ))}
      
      {/* Render damage/healing numbers - adjusted for tighter view */}
      {damageNumbers.map((damageInfo, index) => (
        <Text
          key={`damage-${index}`}
          position={[damageInfo.position[0] * 0.8, damageInfo.position[1], damageInfo.position[2]]}
          color={damageInfo.color}
          fontSize={0.4}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {damageInfo.isHealing ? '+' : ''}{damageInfo.value}
        </Text>
      ))}
      
      {/* Orbit controls */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 2.8}
        minAzimuthAngle={-Math.PI / 8}
        maxAzimuthAngle={Math.PI / 8}
      />
    </>
  );
};

// Main BattleScene component that wraps the content in a Canvas
const BattleScene: React.FC<BattleSceneProps> = (props) => {
  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
    >
      <BattleSceneContent {...props} />
    </Canvas>
  );
};

export default BattleScene; 