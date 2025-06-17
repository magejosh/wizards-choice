import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { VRMLoader } from 'three-stdlib';
import type { Group } from 'three';
import modelDescriptors from '../models/model-descriptors.json';
import { getModelRotationForUpAxis, UpAxis } from './modelUtils';

export interface ModelDescriptor {
  path?: string;
  upAxis: UpAxis;
  scale: number;
  baseRotation?: [number, number, number];
  animations: Record<string, string>;
}

const cache: Record<string, Group> = {};

export function useModel(modelKey: string): { scene: Group; descriptor: ModelDescriptor } {
  const descriptor = (modelDescriptors as Record<string, ModelDescriptor>)[modelKey] ||
    (modelDescriptors as Record<string, ModelDescriptor>)['default-enemy'];
  const path = descriptor.path || modelKey;
  const ext = path.toLowerCase().split('.').pop();

  let base: any;
  if (ext === 'vrm') {
    const gltf = useLoader(VRMLoader, path);
    base = gltf.scene;
  } else if (ext === 'fbx') {
    base = useLoader(FBXLoader, path);
  } else {
    const gltf = useLoader(GLTFLoader, path);
    base = gltf.scene;
  }

  const scene = useMemo(() => {
    const cached = cache[path];
    if (cached) return cached.clone();
    const cloned = base.clone();
    const rotation = getModelRotationForUpAxis(
      descriptor.upAxis,
      descriptor.baseRotation || [0, 0, 0]
    );
    cloned.rotation.set(...rotation);
    cloned.scale.setScalar(descriptor.scale);
    cache[path] = cloned;
    return cloned.clone();
  }, [base, path, descriptor.upAxis, descriptor.scale]);

  return { scene, descriptor };
}
