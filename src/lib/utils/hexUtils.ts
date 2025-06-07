export interface AxialCoord {
  q: number;
  r: number;
}

/**
 * Convert axial hex coordinates to world space 3D coordinates.
 * @param coord - axial coordinates {q, r}
 * @param radius - hex tile radius
 */
export function axialToWorld(coord: AxialCoord, radius = 1): [number, number, number] {
  const x = radius * Math.sqrt(3) * (coord.q + coord.r / 2);
  const z = radius * 1.5 * coord.r;
  return [x, 0, z];
}

/**
 * Convert world space coordinates to axial hex coordinates.
 * @param position - [x, y, z] world coords
 * @param radius - hex tile radius
 */
export function worldToAxial(position: [number, number, number], radius = 1): AxialCoord {
  const [x, , z] = position;
  const q = (Math.sqrt(3)/3 * x - 1/3 * z) / radius;
  const r = (2/3 * z) / radius;
  return { q, r };
}

/**
 * Round fractional axial coordinates to the nearest hex tile.
 */
export function roundAxial(q: number, r: number): AxialCoord {
  let x = q;
  let y = r;
  let z = -x - y;

  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);

  const xDiff = Math.abs(rx - x);
  const yDiff = Math.abs(ry - y);
  const zDiff = Math.abs(rz - z);

  if (xDiff > yDiff && xDiff > zDiff) {
    rx = -ry - rz;
  } else if (yDiff > zDiff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  return { q: rx, r: ry };
}

/**
 * Snap a world space position to the center of the nearest hex tile.
 */
export function snapToHexCenter(position: [number, number, number], radius = 1): [number, number, number] {
  const axial = worldToAxial(position, radius);
  const rounded = roundAxial(axial.q, axial.r);
  return axialToWorld(rounded, radius);
}
