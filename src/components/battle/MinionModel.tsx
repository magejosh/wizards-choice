"use client";

import React, { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { useFBX } from "@react-three/drei";
import { VRMLoader } from "three-stdlib";

interface MinionModelProps {
  position: [number, number, number];
  modelPath?: string;
  isEnemy?: boolean;
}

const MinionModel: React.FC<MinionModelProps> = ({
  position,
  modelPath,
  isEnemy = false,
}) => {
  let scene: any = null;
  if (modelPath) {
    try {
      if (modelPath.toLowerCase().endsWith(".vrm")) {
        const gltf = useLoader(VRMLoader, modelPath);
        scene = gltf.scene;
      } else {
        scene = useFBX(modelPath);
      }
    } catch {
      scene = null;
    }
  }

  if (scene) {
    return (
      <group position={position}>
        <primitive
          object={scene}
          scale={[1, 1, 1]}
          position={[0, -0.25, 0]}
          rotation={[0, Math.PI / 2, 0]}
        />
      </group>
    );
  }

  return (
    <mesh position={position}>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color={isEnemy ? "#aa0000" : "#cccccc"} />
    </mesh>
  );
};

export default MinionModel;
