'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Stars, Text, OrbitControls } from '@react-three/drei';
import SpellEffect3D from './effects/SpellEffect3D';
import WizardModel from './WizardModel';
import HexGrid, { TILE_COLORS } from './HexGrid';
import { axialToWorld, axialDistance, AxialCoord, getAdjacentCoords } from '@/lib/utils/hexUtils';
import { rebuildOccupancy, isTileOccupied } from '@/lib/combat/movementManager';
import { moveEntity } from '@/lib/combat/phaseManager';
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
  isMobile?: boolean;
  currentPhase?: string; // Current combat phase from the phase-based system
  onMove?: (coord: AxialCoord) => void;
  selectingSummon?: boolean;
  selectingMove?: boolean;
  onSummonTile?: (coord: AxialCoord) => void;
}

// Create a separate component for the 3D scene content
const BattleSceneContent: React.FC<BattleSceneProps> = (props) => {
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [activeEffects, setActiveEffects] = useState<VisualEffect[]>([]);
  const [playerAnim, setPlayerAnim] = useState<'idle' | 'cast' | 'dodge' | 'die' | 'throw'>('idle');
  const [enemyAnim, setEnemyAnim] = useState<'idle' | 'cast' | 'dodge' | 'die' | 'throw'>('idle');
  const prevLogLength = useRef<number>(0);
  const [reachableTiles, setReachableTiles] = useState<AxialCoord[]>([]);
  const [selectedDest, setSelectedDest] = useState<AxialCoord | null>(null);
  const [summonTiles, setSummonTiles] = useState<AxialCoord[]>([]);
  
  // Extract props - support both old and new formats
  const {
    combatState,
    playerHealth: propsPlayerHealth,
    playerMaxHealth: propsPlayerMaxHealth,
    enemyHealth: propsEnemyHealth,
    enemyMaxHealth: propsEnemyMaxHealth,
    log: propsLog,
    animating = false,
    isMobile = false,
    onMove
  } = props;

  // Use either props or fallback to combatState if available
  const playerHealth = propsPlayerHealth ?? (combatState?.playerWizard.currentHealth ?? 100);
  const playerMaxHealth = propsPlayerMaxHealth ?? (combatState?.playerWizard.wizard.maxHealth ?? 100);
  const enemyHealth = propsEnemyHealth ?? (combatState?.enemyWizard.currentHealth ?? 100);
  const enemyMaxHealth = propsEnemyMaxHealth ?? (combatState?.enemyWizard.wizard.maxHealth ?? 100);
  const log = propsLog ?? (combatState?.log ?? []);
  
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

  const textureMap = {
    grass: '/tiles/grass.png',
    stone: '/tiles/stone.png',
    brick: '/tiles/brick.png',
    dirt: '/tiles/dirt.png',
    water: '/tiles/water.png'
  } as const;

  const handleTileClick = (coord: AxialCoord) => {
    if (!combatState) return;
    if (props.selectingSummon && props.onSummonTile) {
      if (!summonTiles.some(t => t.q === coord.q && t.r === coord.r)) return;
      props.onSummonTile(coord);
      setSummonTiles([]);
      return;
    }
    if (!props.selectingMove) return;
    if (!onMove) return;
    if (!reachableTiles.some(t => t.q === coord.q && t.r === coord.r)) return;
    onMove(coord);
    setSelectedDest(null);
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

        if (latestLog.target === 'enemy') {
          setEnemyAnim('dodge');
        } else {
          setPlayerAnim('dodge');
        }
        
        // Add visual effect based on spell type
        if (latestLog.action === 'spell_cast' && combatState && combatState[latestLog.actor === 'player' ? 'playerWizard' : 'enemyWizard'].selectedSpell) {
          const spell = combatState[latestLog.actor === 'player' ? 'playerWizard' : 'enemyWizard'].selectedSpell;
          if (spell) {
            setActiveEffects(prev => [...prev, {
              type: spell.type,
              element: spell.element,
              position: latestLog.actor === 'player' ? [-3, 1, 0] : [3, 1, 0],
              target: latestLog.actor === 'player' ? 'enemy' : 'player',
              lifetime: 30,
              id: `spell-effect-${Date.now()}-${Math.random()}`
            }]);

            if (latestLog.actor === 'player') {
              if (spell.name === 'Potion Throw') {
                setPlayerAnim('throw');
              } else {
                setPlayerAnim('cast');
              }
            } else {
              if (spell.name === 'Potion Throw') {
                setEnemyAnim('throw');
              } else {
                setEnemyAnim('cast');
              }
            }
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
              lifetime: 30,
              id: `heal-effect-${Date.now()}-${Math.random()}`
            }]);

            if (latestLog.actor === 'player') {
              setPlayerAnim('cast');
            } else {
              setEnemyAnim('cast');
            }
          }
        }
      }
      
      prevLogLength.current = log.length;
    }
  }, [log, combatState]);

  useEffect(() => {
    if (!combatState) return;
    if (
      combatState.currentPhase === 'action' &&
      combatState.isPlayerTurn &&
      props.selectingMove
    ) {
      const pos = combatState.playerWizard.position;
      const neighbors: AxialCoord[] = [
        { q: pos.q + 1, r: pos.r },
        { q: pos.q - 1, r: pos.r },
        { q: pos.q, r: pos.r + 1 },
        { q: pos.q, r: pos.r - 1 },
        { q: pos.q + 1, r: pos.r - 1 },
        { q: pos.q - 1, r: pos.r + 1 }
      ];
      setReachableTiles(neighbors);
    } else {
      setReachableTiles([]);
    }
  }, [
    props.selectingMove,
    combatState?.currentPhase,
    combatState?.isPlayerTurn,
    combatState?.playerWizard.position
  ]);

  useEffect(() => {
    if (!combatState || !props.selectingSummon) {
      setSummonTiles([]);
      return;
    }
    rebuildOccupancy(combatState);
    const pos = combatState.playerWizard.position;
    const adj = getAdjacentCoords(pos);
    const valid = adj.filter(c => !isTileOccupied(c));
    setSummonTiles(valid);
  }, [props.selectingSummon, combatState]);

  // Play defeat animations when combat ends
  useEffect(() => {
    if (!combatState) return;
    if (combatState.status === 'playerWon') {
      setEnemyAnim('die');
    } else if (combatState.status === 'enemyWon') {
      setPlayerAnim('die');
    }
  }, [combatState?.status]);

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
  
  // Adjust orbit control parameters for mobile
  const orbitMinPolarAngle = isMobile ? Math.PI / 3 : Math.PI / 2.8;
  const orbitMaxPolarAngle = isMobile ? Math.PI / 2 : Math.PI / 2.2;
  const orbitMinAzimuthAngle = isMobile ? -Math.PI / 6 : -Math.PI / 8;
  const orbitMaxAzimuthAngle = isMobile ? Math.PI / 6 : Math.PI / 8;
  
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

      {/* Hexagonal battlefield overlay */}
      {/* Slightly above the platform to avoid z-fighting */}
      <group position={[0, -0.49, 0]}>
        <HexGrid
          gridRadius={3}
          radius={1}
          height={0.2}
          textureMap={textureMap}
          highlightedTiles={
            props.selectingSummon
              ? summonTiles
              : props.selectingMove
                ? reachableTiles
                : []
          }
          onTileClick={handleTileClick}
        />
      </group>
      
      {/* Player wizard */}
      <Suspense fallback={null}>
        <WizardModel
          position={axialToWorld(combatState ? combatState.playerWizard.position : { q: -2, r: 0 })}
          color={theme.colors.primary.main}
          health={playerHealth / playerMaxHealth}
          isActive={combatState ? (combatState.isPlayerTurn && combatState.status === 'active') : true}
          action={playerAnim}
        />
      </Suspense>
      
      {/* Enemy wizard */}
      <Suspense fallback={null}>
        <WizardModel
          position={axialToWorld(combatState ? combatState.enemyWizard.position : { q: 2, r: 0 })}
          color={theme.colors.secondary.main}
          isEnemy={true}
          health={enemyHealth / enemyMaxHealth}
          isActive={combatState ? (!combatState.isPlayerTurn && combatState.status === 'active') : false}
          enemyVariant={Math.round(Math.random()) as 0 | 1}
          modelPath={combatState?.enemyWizard.wizard.modelPath}
          action={enemyAnim}
        />
      </Suspense>
      
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
        maxPolarAngle={orbitMaxPolarAngle}
        minPolarAngle={orbitMinPolarAngle}
        minAzimuthAngle={orbitMinAzimuthAngle}
        maxAzimuthAngle={orbitMaxAzimuthAngle}
      />
    </>
  );
};

// Main BattleScene component that wraps the content in a Canvas
const BattleScene: React.FC<BattleSceneProps> = (props) => {
  // Detect if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false);
  
  // Check viewport width on component mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Check initially
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Adjust camera position for mobile
  const cameraPosition: [number, number, number] = isMobile ? 
    [0, 3.8, 7.5] : // move camera back and up slightly on mobile
    [0, 3.5, 6];
  
  // Adjust field of view for mobile
  const fov = isMobile ? 50 : 45;
  
  return (
    <Canvas
      camera={{ position: cameraPosition, fov: fov }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <BattleSceneContent {...props} isMobile={isMobile} />
      </Suspense>
    </Canvas>
  );
};

export default BattleScene; 