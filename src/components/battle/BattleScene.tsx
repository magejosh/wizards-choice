'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Stars, Text, OrbitControls } from '@react-three/drei';
import SpellEffect3D from './effects/SpellEffect3D';
import WizardModel from './WizardModel';

// Import types from the codebase
interface Spell {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  tier: number;
  type: string;
  element: string;
  effects: any[];
}

interface ActiveEffect {
  id: string;
  name: string;
  remainingDuration: number;
  effect: any;
}

interface CombatWizard {
  wizard: any;
  currentHealth: number;
  currentMana: number;
  activeEffects: ActiveEffect[];
  selectedSpell: Spell | null;
  hand: Spell[];
  drawPile: Spell[];
  discardPile: Spell[];
}

interface CombatLogEntry {
  turn: number;
  round: number;
  actor: 'player' | 'enemy';
  action: string;
  target?: 'player' | 'enemy';
  spellName?: string;
  damage?: number;
  healing?: number;
  effectName?: string;
  details?: string;
}

interface CombatState {
  playerWizard: CombatWizard;
  enemyWizard: CombatWizard;
  turn: number;
  round: number;
  isPlayerTurn: boolean;
  log: CombatLogEntry[];
  status: 'active' | 'playerWon' | 'enemyWon';
  difficulty: 'easy' | 'normal' | 'hard';
}

interface BattleSceneProps {
  combatState: CombatState;
}

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

const BattleScene: React.FC<BattleSceneProps> = ({ combatState }) => {
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [activeEffects, setActiveEffects] = useState<VisualEffect[]>([]);
  const prevLogLength = useRef<number>(0);
  
  // Theme colors for consistency
  const theme = {
    colors: {
      primary: {
        main: '#6a3de8',
        dark: '#4a2ca8'
      },
      secondary: {
        main: '#e83d8c',
        dark: '#a82c63'
      }
    }
  };
  
  // Process combat log to create visual effects
  useEffect(() => {
    if (combatState.log.length > prevLogLength.current) {
      const latestLog = combatState.log[combatState.log.length - 1];
      
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
        if (latestLog.action === 'spell_cast' && combatState[latestLog.actor === 'player' ? 'playerWizard' : 'enemyWizard'].selectedSpell) {
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
        if (latestLog.action === 'spell_cast' && combatState[latestLog.actor === 'player' ? 'playerWizard' : 'enemyWizard'].selectedSpell) {
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
      
      prevLogLength.current = combatState.log.length;
    }
  }, [combatState.log, combatState]);

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
          key={effect.id || `effect-${index}-${effect.type}-${effect.lifetime}`}
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
      
      {/* Orbit controls for camera adjustment */}
      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  );
};

export default BattleScene; 