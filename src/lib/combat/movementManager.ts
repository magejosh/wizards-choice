import { CombatState, Minion } from '../types';
import { AxialCoord } from '../utils/hexUtils';

const occupancy = new Map<string, string>();

const key = (coord: AxialCoord) => `${coord.q},${coord.r}`;

export function rebuildOccupancy(state: CombatState) {
  occupancy.clear();
  const add = (id: string, pos: AxialCoord, flying?: boolean) => {
    if (!flying) occupancy.set(key(pos), id);
  };
  add(state.playerWizard.wizard.id, state.playerWizard.position || { q: -2, r: 0 });
  add(state.enemyWizard.wizard.id, state.enemyWizard.position || { q: 2, r: 0 });
  const playerMinions: Minion[] = [...(state.playerWizard.minions || []), ...(state.playerMinions || [])];
  const enemyMinions: Minion[] = [...(state.enemyWizard.minions || []), ...(state.enemyMinions || [])];
  playerMinions.forEach(m => add(m.id, m.position, (m as any).isFlying));
  enemyMinions.forEach(m => add(m.id, m.position, (m as any).isFlying));
}

export function isTileOccupied(coord: AxialCoord, ignoreId?: string): boolean {
  const occ = occupancy.get(key(coord));
  return occ !== undefined && occ !== ignoreId;
}

export function getOccupantId(coord: AxialCoord): string | undefined {
  return occupancy.get(key(coord));
}
