'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Mesh, Vector3 } from 'three';
import * as THREE from 'three';
import { useMixamoClips, findSkinnedMesh } from '@/hooks/useMixamoClips';
import { useModel } from '@/lib/utils/modelLoader';
import { useIsMobile } from '@/hooks/use-mobile';

interface WizardModelProps {
  position: [number, number, number];
  color: string;
  health: number; // 0.0 to 1.0
  /** Current action to play */
  action?: 'idle' | 'cast' | 'dodge' | 'die' | 'throw';
  isActive?: boolean;
  isEnemy?: boolean;
  enemyVariant?: 0 | 1; // 0: original, 1: alternate
  modelPath?: string;
}


const PrimitiveWizardModel: React.FC<{
  position: [number, number, number];
  color: string;
  health: number;
  isActive: boolean;
  isEnemy: boolean;
  variant: 0 | 1;
}> = ({ position, color, health, isActive, isEnemy, variant }) => {
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
        rotation={[0, Math.PI / 3, 0]}
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
        rotation={[0, Math.PI / 3, 0]}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial 
          color="#f8d8c0" 
          roughness={0.2}
        />
        
        {/* Hat */}
        <mesh position={[0, 0.25, 0]}>
          {variant === 0 ? (
            <coneGeometry args={[0.35, 0.6, 16]} />
          ) : (
            <coneGeometry args={[0.45, 0.8, 16]} />
          )}
          <meshStandardMaterial 
            color={color} 
            roughness={0.5}
          />
          <mesh position={[0, -0.32, 0]}>
            <torusGeometry args={[0.42, 0.1, 8, 16]} />
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
          {variant === 0 ? (
            <dodecahedronGeometry args={[0.15, 0]} />
          ) : (
            <boxGeometry args={[0.15, 0.15, 0.15]} />
          )}
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

const WizardModel: React.FC<WizardModelProps> = ({
  position,
  color,
  health,
  action = 'idle',
  isActive = false,
  isEnemy = false,
  enemyVariant = 0,
  modelPath,
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <PrimitiveWizardModel
        position={position}
        color={color}
        health={health}
        isActive={isActive}
        isEnemy={isEnemy}
        variant={enemyVariant}
      />
    );
  }
  // Player: use GLB model
  if (!isEnemy) {
    const { scene, descriptor } = useModel('player-wizard');
    const skinned = useMemo(() => findSkinnedMesh(scene), [scene]);
    const clips = useMixamoClips(scene, descriptor.animations);
    const mixer = useMemo(
      () => new THREE.AnimationMixer(skinned || scene),
      [scene, skinned]
    );

    useEffect(() => {
      const clip = clips[action || 'idle'] || clips.idle;
      if (!clip) return;
      const act = mixer.clipAction(clip, skinned || undefined);
      act.reset().play();
      return () => act.stop();
    }, [action, clips, mixer, skinned]);

    useFrame((_, delta) => {
      mixer.update(delta);
    });

    return (
      <group position={position}>
        <primitive object={scene} position={[0, 0.7, 0]} />
        <group position={[0, 2, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.2, 0.15, 0.05]} />
            <meshStandardMaterial color="#222222" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.03]} scale={[health, 1, 1]}>
            <boxGeometry args={[1.2, 0.15, 0.05]} />
            <meshStandardMaterial color="#44ff44" emissive="#44ff44" emissiveIntensity={0.5} roughness={0.3} />
          </mesh>
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
      </group>
    );
  }
  // Enemy: use custom model if provided, otherwise primitive model
  const isValidModelPath = typeof modelPath === 'string' && modelPath.trim().length > 0;
  let sceneObj: any = null;
  let descriptor: any = null;
  if (isValidModelPath) {
    const loaded = useModel(modelPath!);
    sceneObj = loaded.scene;
    descriptor = loaded.descriptor;
  }
  if (sceneObj) {
    const skinned = useMemo(() => findSkinnedMesh(sceneObj), [sceneObj]);
    const clips = useMixamoClips(sceneObj, descriptor?.animations || {
      idle: '/assets/anims/Idle.fbx',
      cast: '/assets/anims/Standing 1H Cast Spell 01.fbx',
      die: '/assets/anims/Dying.fbx',
    });
    const mixer = useMemo(
      () => new THREE.AnimationMixer(skinned || sceneObj),
      [sceneObj, skinned]
    );

    useEffect(() => {
      const clip = clips[action || 'idle'] || clips.idle;
      if (!clip) return;
      const act = mixer.clipAction(clip, skinned || undefined);
      act.reset().play();
      return () => act.stop();
    }, [action, clips, mixer, skinned]);

    useFrame((_, delta) => {
      mixer.update(delta);
    });

    return (
      <group position={position}>
        <ambientLight intensity={0.8} />
        <primitive object={sceneObj} position={[0, -0.25, 0]} />
        <group position={[0, 2, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.2, 0.15, 0.05]} />
            <meshStandardMaterial color="#222222" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.03]} scale={[health, 1, 1]}>
            <boxGeometry args={[1.2, 0.15, 0.05]} />
            <meshStandardMaterial color="#44ff44" emissive="#44ff44" emissiveIntensity={0.5} roughness={0.3} />
          </mesh>
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
      </group>
    );
  }
  return (
    <PrimitiveWizardModel
      position={position}
      color={color}
      health={health}
      isActive={isActive}
      isEnemy={isEnemy}
      variant={enemyVariant}
    />
  );
};

export default WizardModel; 