"use client";

import React from "react";
import { useModel } from "@/lib/utils/modelLoader";

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
  const { scene } = modelPath ? useModel(modelPath) : { scene: null } as any;

  if (scene) {
    return (
      <group position={position}>
        <primitive object={scene} position={[0, -0.25, 0]} />
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
