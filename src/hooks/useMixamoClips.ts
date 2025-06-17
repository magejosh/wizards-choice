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

export interface AnimationRetargeterOptions {
  fallback?: Record<keyof MixamoActions, THREE.AnimationClip>;
}

export function useMixamoClips(
  scene: THREE.Object3D | undefined,
  actions: MixamoActions,
  options: AnimationRetargeterOptions = {}
) {
  const idle = useFBX(actions.idle);
  const cast = useFBX(actions.cast);
  const die = useFBX(actions.die);

  return useMemo(() => {
    const skinned = findSkinnedMesh(scene);
    if (!skinned || !skinned.skeleton || !skinned.skeleton.bones?.length) {
      console.warn('Mixamo retargeting skipped: target skeleton missing');
      return options.fallback || ({} as Record<keyof MixamoActions, THREE.AnimationClip | undefined>);
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
        return SkeletonUtils.retargetClip(skinned, sourceSkinned, fbx.animations[0], {
          hip: 'mixamorig:Hips',
          preservePosition: false,
        });
      } catch (e) {
        console.warn('Failed to retarget clip', e);
        return undefined;
      }
    };
    const clips = {
      idle: retarget(idle),
      cast: retarget(cast),
      die: retarget(die),
    } as Record<keyof MixamoActions, THREE.AnimationClip | undefined>;

    if (Object.values(clips).some(c => !c) && options.fallback) {
      console.warn('Skeleton mismatch detected, using fallback animations');
      return options.fallback;
    }

    return clips;
  }, [scene, idle, cast, die, options.fallback]);
}
