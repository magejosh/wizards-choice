'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Text, useGLTF, useFBX, Html } from '@react-three/drei';
import { VRMLoader } from 'three-stdlib';
import { Mesh, Vector3 } from 'three';
import * as THREE from 'three';
import { getModelRotationForUpAxis, UpAxis } from '@/lib/utils/modelUtils';

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

const PLAYER_WIZARD_GLB_PATH = '/assets/player-wizard-01.glb';

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
  // Player: use GLB model
  if (!isEnemy) {
    const { scene } = useGLTF(PLAYER_WIZARD_GLB_PATH);

    // Debug: expanded rotation presets for player model orientation (keep for future dev use)
    const rotationPresets: [number, number, number][] = [
      [Math.PI / 2, Math.PI / 3, Math.PI],
      [Math.PI / 2, 0, Math.PI],
      [Math.PI / 2, 0, 0],
      [Math.PI / 2, Math.PI / 2, 0],
      [Math.PI / 2, 0, -Math.PI / 2],
      [0, 0, 0],
      [0, Math.PI, 0],
      [0, 0, Math.PI],
      [0, Math.PI / 2, Math.PI / 2],
      [Math.PI, 0, 0],
      [0, -Math.PI / 2, 0],
      [0, 0, -Math.PI / 2],
      [Math.PI / 2, Math.PI / 2, Math.PI / 2],
      [Math.PI / 2, Math.PI, 0],
      [Math.PI / 2, Math.PI, Math.PI / 2],
      [Math.PI / 2, Math.PI, Math.PI],
      [Math.PI / 2, Math.PI, -Math.PI / 2],
      [Math.PI / 2, -Math.PI / 2, 0],
      [Math.PI / 2, -Math.PI / 2, Math.PI / 2],
      [Math.PI / 2, -Math.PI / 2, Math.PI],
      [Math.PI / 2, -Math.PI / 2, -Math.PI / 2],
    ];
    const [rotationIndex, setRotationIndex] = useState(0);
    const handleNextRotation = () => setRotationIndex((i) => (i + 1) % rotationPresets.length);
    // Debug switcher is disabled for now, but code is retained for future use.

    // Load animations
    const idleA = useFBX('/assets/anims/Idle.fbx');
    const idleB = useFBX('/assets/anims/Unarmed Idle.fbx');
    const idleC = useFBX('/assets/anims/Zombie Idle.fbx');
    const idleD = useFBX('/assets/anims/Standing Idle 03.fbx');
    const castA = useFBX('/assets/anims/Standing 2H Magic Attack 01.fbx');
    const castB = useFBX('/assets/anims/Standing Idle to Magic Attack 04.fbx');
    const castC = useFBX('/assets/anims/Standing 1H Cast Spell 01.fbx');
    const dodgeA = useFBX('/assets/anims/Dodging.fbx');
    const dodgeB = useFBX('/assets/anims/Dodging Right.fbx');
    const dieA = useFBX('/assets/anims/Dying.fbx');
    const dieB = useFBX('/assets/anims/Defeated.fbx');
    const dieC = useFBX('/assets/anims/Standing React Death Forward.fbx');
    const throwA = useFBX('/assets/anims/Throwing.fbx');

    const mixer = useRef<THREE.AnimationMixer>();
    const currentAction = useRef<THREE.AnimationAction>();
    const [internalAction, setInternalAction] = useState(action || 'idle');

    if (!mixer.current) {
      mixer.current = new THREE.AnimationMixer(scene);
    }

    const animations = {
      idle: [idleA.animations[0], idleB.animations[0], idleC.animations[0], idleD.animations[0]],
      cast: [castA.animations[0], castB.animations[0], castC.animations[0]],
      dodge: [dodgeA.animations[0], dodgeB.animations[0]],
      die: [dieA.animations[0], dieB.animations[0], dieC.animations[0]],
      throw: [throwA.animations[0]]
    } as const;

    const playClips = (clips: THREE.AnimationClip[], loop: boolean) => {
      if (!mixer.current) return;
      const clip = clips[Math.floor(Math.random() * clips.length)];
      const actionObj = mixer.current.clipAction(clip);
      actionObj.reset();
      actionObj.fadeIn(0.1);
      actionObj.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
      actionObj.clampWhenFinished = !loop;
      actionObj.play();
      if (currentAction.current && currentAction.current !== actionObj) {
        currentAction.current.fadeOut(0.1);
      }
      currentAction.current = actionObj;
      if (!loop) {
        setTimeout(() => setInternalAction('idle'), clip.duration * 1000);
      }
    };

    useEffect(() => {
      setInternalAction(action || 'idle');
    }, [action]);

    useEffect(() => {
      switch (internalAction) {
        case 'cast':
          playClips(Array.from(animations.cast), false);
          break;
        case 'dodge':
          playClips(Array.from(animations.dodge), false);
          break;
        case 'die':
          playClips(Array.from(animations.die), false);
          break;
        case 'throw':
          playClips(Array.from(animations.throw), false);
          break;
        default:
          playClips(Array.from(animations.idle), true);
      }
    }, [internalAction]);

    useFrame((_, delta) => {
      mixer.current?.update(delta);
    });

    const getHealthColor = () => {
      if (health > 0.6) return '#44ff44';
      if (health > 0.3) return '#ffff00';
      return '#ff4444';
    };

    return (
      <group position={position}>
        <primitive object={scene} scale={[1.81, 1.81, 1.81]} position={[0, 0.4, 0]} rotation={[-Math.PI / 2, Math.PI, 0]} />
        <group position={[0, 2, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.2, 0.15, 0.05]} />
            <meshStandardMaterial color="#222222" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.03]} scale={[health, 1, 1]}>
            <boxGeometry args={[1.2, 0.15, 0.05]} />
            <meshStandardMaterial color={getHealthColor()} emissive={getHealthColor()} emissiveIntensity={0.5} roughness={0.3} />
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
  let scene: any = null;
  if (isValidModelPath) {
    try {
      if (modelPath!.toLowerCase().endsWith('.vrm')) {
        const gltf = useLoader(VRMLoader, modelPath!);
        scene = gltf.scene;
      } else {
        scene = useFBX(modelPath!);
      }
    } catch {
      scene = null;
    }
  }
  if (scene) {
    // Reuse animation clips loaded for the player
    const idleA = useFBX('/assets/anims/Idle.fbx');
    const idleB = useFBX('/assets/anims/Unarmed Idle.fbx');
    const idleC = useFBX('/assets/anims/Zombie Idle.fbx');
    const idleD = useFBX('/assets/anims/Standing Idle 03.fbx');
    const castA = useFBX('/assets/anims/Standing 2H Magic Attack 01.fbx');
    const castB = useFBX('/assets/anims/Standing Idle to Magic Attack 04.fbx');
    const castC = useFBX('/assets/anims/Standing 1H Cast Spell 01.fbx');
    const dodgeA = useFBX('/assets/anims/Dodging.fbx');
    const dodgeB = useFBX('/assets/anims/Dodging Right.fbx');
    const dieA = useFBX('/assets/anims/Dying.fbx');
    const dieB = useFBX('/assets/anims/Defeated.fbx');
    const dieC = useFBX('/assets/anims/Standing React Death Forward.fbx');
    const throwA = useFBX('/assets/anims/Throwing.fbx');

    const mixer = useRef<THREE.AnimationMixer>();
    const currentAction = useRef<THREE.AnimationAction>();
    const [internalAction, setInternalAction] = useState(action || 'idle');

    if (!mixer.current) {
      mixer.current = new THREE.AnimationMixer(scene);
    }

    const animations = {
      idle: [idleA.animations[0], idleB.animations[0], idleC.animations[0], idleD.animations[0]],
      cast: [castA.animations[0], castB.animations[0], castC.animations[0]],
      dodge: [dodgeA.animations[0], dodgeB.animations[0]],
      die: [dieA.animations[0], dieB.animations[0], dieC.animations[0]],
      throw: [throwA.animations[0]]
    } as const;

    const playClips = (clips: THREE.AnimationClip[], loop: boolean) => {
      if (!mixer.current) return;
      const clip = clips[Math.floor(Math.random() * clips.length)];
      const actionObj = mixer.current.clipAction(clip);
      actionObj.reset();
      actionObj.fadeIn(0.1);
      actionObj.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
      actionObj.clampWhenFinished = !loop;
      actionObj.play();
      if (currentAction.current && currentAction.current !== actionObj) {
        currentAction.current.fadeOut(0.1);
      }
      currentAction.current = actionObj;
      if (!loop) {
        setTimeout(() => setInternalAction('idle'), clip.duration * 1000);
      }
    };

    useEffect(() => {
      setInternalAction(action || 'idle');
    }, [action]);

    useEffect(() => {
      switch (internalAction) {
        case 'cast':
          playClips(Array.from(animations.cast), false);
          break;
        case 'dodge':
          playClips(Array.from(animations.dodge), false);
          break;
        case 'die':
          playClips(Array.from(animations.die), false);
          break;
        case 'throw':
          playClips(Array.from(animations.throw), false);
          break;
        default:
          playClips(Array.from(animations.idle), true);
      }
    }, [internalAction]);

    useFrame((_, delta) => {
      mixer.current?.update(delta);
    });

    const getHealthColor = () => {
      if (health > 0.6) return '#44ff44';
      if (health > 0.3) return '#ffff00';
      return '#ff4444';
    };
    return (
      <group position={position}>
        <ambientLight intensity={0.8} />
        <primitive
          object={scene}
          scale={[1.17, 1.17, 1.17]}
          position={[0, -0.25, 0]}
          rotation={getModelRotationForUpAxis('Y', [0, Math.PI / 2, 0])}
        />
        <group position={[0, 2, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.2, 0.15, 0.05]} />
            <meshStandardMaterial color="#222222" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0, 0.03]} scale={[health, 1, 1]}>
            <boxGeometry args={[1.2, 0.15, 0.05]} />
            <meshStandardMaterial color={getHealthColor()} emissive={getHealthColor()} emissiveIntensity={0.5} roughness={0.3} />
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