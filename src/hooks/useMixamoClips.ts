import { useFBX } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

export interface MixamoActions {
  idle: string;
  cast: string;
  die: string;
}

export function useMixamoClips(
  scene: THREE.Object3D | undefined,
  actions: MixamoActions
) {
  const idle = useFBX(actions.idle);
  const cast = useFBX(actions.cast);
  const die = useFBX(actions.die);

  return useMemo(() => {
    if (!scene) return {} as Record<keyof MixamoActions, THREE.AnimationClip | undefined>;
    const retarget = (fbx: any) =>
      fbx.animations && fbx.animations[0]
        ? SkeletonUtils.retargetClip(scene, fbx, fbx.animations[0])
        : undefined;
    return {
      idle: retarget(idle),
      cast: retarget(cast),
      die: retarget(die),
    } as Record<keyof MixamoActions, THREE.AnimationClip | undefined>;
  }, [scene, idle, cast, die]);
}
