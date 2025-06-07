import { axialToWorld, worldToAxial, snapToHexCenter } from '../hexUtils';

test('axialToWorld converts axial coords to world space', () => {
  const pos = axialToWorld({ q: 1, r: -1 });
  expect(pos[0]).toBeCloseTo(Math.sqrt(3) / 2);
  expect(pos[2]).toBeCloseTo(-1.5);
});

test('worldToAxial converts world space to axial coords', () => {
  const coord = worldToAxial([Math.sqrt(3) / 2, 0, -1.5]);
  expect(coord.q).toBeCloseTo(1);
  expect(coord.r).toBeCloseTo(-1);
});

test('snapToHexCenter snaps to nearest tile center', () => {
  const snapped = snapToHexCenter([0.9, 0, 0.2]);
  expect(snapped[0]).toBeCloseTo(Math.sqrt(3));
  expect(snapped[2]).toBeCloseTo(0);
});
