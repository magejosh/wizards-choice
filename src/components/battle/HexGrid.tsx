import React, { useMemo, useEffect, useState } from 'react';
import { AxialCoord } from '@/lib/utils/hexUtils';
import { TextureLoader, Texture, MeshStandardMaterial } from 'three';
import { Edges } from '@react-three/drei';

type Vec3 = [number, number, number];

type TileType = 'grass' | 'stone' | 'brick' | 'dirt' | 'water';

export const TILE_COLORS: Record<TileType, string> = {
  grass: '#3a7d3a',
  stone: '#888888',
  brick: '#b75555',
  dirt: '#8b5a2b',
  water: '#3366dd'
};

interface HexGridProps {
  radius?: number;
  gridRadius?: number;
  height?: number;
  textureMap?: Partial<Record<TileType, string>>;
  onTileClick?: (coord: AxialCoord) => void;
  highlightedTiles?: AxialCoord[];
}

interface HexTileProps {
  position: Vec3;
  radius: number;
  height: number;
  type: TileType;
  textureMap?: Partial<Record<TileType, string>>;
  coord: AxialCoord;
  highlighted?: boolean;
  onClick?: (coord: AxialCoord) => void;
}

const useOptionalTexture = (url?: string) => {
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    if (!url) {
      setTexture(null);
      return;
    }
    let active = true;
    const loader = new TextureLoader();
    loader.load(
      url,
      tex => {
        if (active) setTexture(tex);
      },
      undefined,
      err => {
        console.warn(`Could not load ${url}:`, err);
        if (active) setTexture(null);
      }
    );
    return () => {
      active = false;
    };
  }, [url]);

  return texture;
};

const HexTile: React.FC<HexTileProps> = ({ position, radius, height, type, textureMap, coord, highlighted = false, onClick }) => {
  const texturePath = textureMap?.[type];
  const texture = useOptionalTexture(texturePath);

  // CylinderGeometry groups: 0 - side, 1 - top, 2 - bottom
  const materials = useMemo(() => {
    const side = new MeshStandardMaterial({ color: '#333333' });
    const top = texture
      ? new MeshStandardMaterial({ map: texture })
      : new MeshStandardMaterial({ color: TILE_COLORS[type] });
    return [side, top, top];
  }, [texture, type]);

  return (
    <mesh
      position={position}
      rotation={[0, 0, 0]}
      material={materials}
      onPointerDown={() => onClick && onClick(coord)}
    >
      <cylinderGeometry args={[radius, radius, height, 6]} />
      <Edges scale={1.02} color={highlighted ? '#00ffff' : '#ffd700'} />
    </mesh>
  );
};

const HexGrid: React.FC<HexGridProps> = ({ radius = 1, gridRadius = 2, height = 0.2, textureMap, onTileClick, highlightedTiles = [] }) => {
  const types: TileType[] = Object.keys(TILE_COLORS) as TileType[];
  const tiles = useMemo(() => {
    const arr: { pos: Vec3; type: TileType; coord: AxialCoord }[] = [];
    for (let q = -gridRadius; q <= gridRadius; q++) {
      const r1 = Math.max(-gridRadius, -q - gridRadius);
      const r2 = Math.min(gridRadius, -q + gridRadius);
      for (let r = r1; r <= r2; r++) {
        const x = radius * Math.sqrt(3) * (q + r / 2);
        const z = radius * 1.5 * r;
        const type = types[Math.floor(Math.random() * types.length)];
        arr.push({ pos: [x, 0, z], type, coord: { q, r } });
      }
    }
    return arr;
  }, [gridRadius, radius]);

  return (
    <group>
      {tiles.map(({ pos, type, coord }, idx) => (
        <HexTile
          key={idx}
          position={pos}
          radius={radius}
          height={height}
          type={type}
          textureMap={textureMap}
          coord={coord}
          highlighted={highlightedTiles.some(t => t.q === coord.q && t.r === coord.r)}
          onClick={onTileClick}
        />
      ))}
    </group>
  );
};

export default HexGrid;
