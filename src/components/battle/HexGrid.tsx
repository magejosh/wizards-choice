import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

type Vec3 = [number, number, number];

interface HexGridProps {
  radius?: number;
  gridRadius?: number;
  height?: number;
  textureUrl?: string;
}

interface HexTileProps {
  position: Vec3;
  radius: number;
  height: number;
  textureUrl?: string;
}

const HexTile: React.FC<HexTileProps> = ({ position, radius, height, textureUrl }) => {
  const texture = textureUrl ? useLoader(TextureLoader, textureUrl) : undefined;

  // CylinderGeometry groups: 0 - side, 1 - top, 2 - bottom
  const materials = useMemo(() => {
    const side = { color: '#333333' } as const;
    const top = texture ? { map: texture } : { color: '#666666' };
    const mat = [side, top, top];
    return mat;
  }, [texture]);

  return (
    <mesh position={position} rotation={[0, 0, 0]}>
      <cylinderGeometry args={[radius, radius, height, 6]} />
      {materials.map((props, idx) => (
        <meshStandardMaterial key={idx} attach={`material-${idx}`} {...props} />
      ))}
    </mesh>
  );
};

const HexGrid: React.FC<HexGridProps> = ({ radius = 1, gridRadius = 2, height = 0.2, textureUrl }) => {
  const tiles: Vec3[] = useMemo(() => {
    const arr: Vec3[] = [];
    for (let q = -gridRadius; q <= gridRadius; q++) {
      const r1 = Math.max(-gridRadius, -q - gridRadius);
      const r2 = Math.min(gridRadius, -q + gridRadius);
      for (let r = r1; r <= r2; r++) {
        const x = radius * Math.sqrt(3) * (q + r / 2);
        const z = radius * 1.5 * r;
        arr.push([x, 0, z]);
      }
    }
    return arr;
  }, [gridRadius, radius]);

  return (
    <group>
      {tiles.map((pos, idx) => (
        <HexTile key={idx} position={pos} radius={radius} height={height} textureUrl={textureUrl} />
      ))}
    </group>
  );
};

export default HexGrid;
