/**
 * Utilities for handling 3D model orientation and up axis.
 */

/**
 * Supported up axes for 3D models.
 */
export type UpAxis = 'Y' | 'Z';

/**
 * Returns the rotation array to apply to a model based on its up axis.
 *
 * @param upAxis - The up axis of the model ('Y' or 'Z').
 * @param baseRotation - Optional base rotation [x, y, z] to apply in addition to up axis correction.
 * @returns The rotation array [x, y, z] to use in the <primitive> or mesh.
 */
export function getModelRotationForUpAxis(
  upAxis: UpAxis,
  baseRotation: [number, number, number] = [0, 0, 0]
): [number, number, number] {
  if (upAxis === 'Y') {
    return baseRotation;
  } else if (upAxis === 'Z') {
    // Rotate -90 degrees on X to convert Z-up to Y-up
    return [baseRotation[0] - Math.PI / 2, baseRotation[1], baseRotation[2]];
  } else {
    // Default to no rotation if unknown
    return baseRotation;
  }
} 