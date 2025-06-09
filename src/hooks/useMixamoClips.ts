import { useFBX } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

export interface MixamoActions {
  idle: string;
  cast: string;
  die: string;
}

export function findSkinnedMesh(root: THREE.Object3D | undefined) {
  let skinned: THREE.SkinnedMesh | undefined;
  if (!root) return skinned;
  root.traverse(obj => {
    if (!skinned && (obj as THREE.SkinnedMesh).isSkinnedMesh) {
      skinned = obj as THREE.SkinnedMesh;
    }
  });
  return skinned;
}

export function useMixamoClips(
  scene: THREE.Object3D | undefined,
  actions: MixamoActions
) {
  const idle = useFBX(actions.idle);
  const cast = useFBX(actions.cast);
  const die = useFBX(actions.die);

  return useMemo(() => {
    const skinned = findSkinnedMesh(scene);
    if (!skinned || !skinned.skeleton || !skinned.skeleton.bones?.length) {
      return {} as Record<keyof MixamoActions, THREE.AnimationClip | undefined>;
    }

    const retarget = (fbx: any) => {
      if (!fbx?.animations || !fbx.animations[0]) {
        return undefined;
      }

      const sourceSkinned = findSkinnedMesh(fbx);
      if (!sourceSkinned?.skeleton?.bones?.length) {
        return undefined;
      }

      try {
        return SkeletonUtils.retargetClip(skinned, sourceSkinned, fbx.animations[0]);
      } catch (e) {
        console.warn('Failed to retarget clip', e);
        return undefined;
      }
    };
    return {
      idle: retarget(idle),
      cast: retarget(cast),
      die: retarget(die),
    } as Record<keyof MixamoActions, THREE.AnimationClip | undefined>;
  }, [scene, idle, cast, die]);
}
