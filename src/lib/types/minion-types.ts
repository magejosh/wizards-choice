// src/lib/types/minion-types.ts
// Types for summoned minions on the battlefield

import { AxialCoord } from '../utils/hexUtils';

/** Basic stats for a minion */
export interface MinionStats {
  health: number;
  maxHealth: number;
  attack?: number;
  defense?: number;
}

/** A summoned minion on the battlefield */
export interface Minion {
  id: string;
  name: string;
  /** Wizard ID that controls this minion */
  ownerId: string;
  /** 'player' if controlled by the player, otherwise 'enemy' */
  owner: 'player' | 'enemy';
  modelPath?: string;
  position: AxialCoord;
  stats: MinionStats;
  remainingDuration: number;
  isFlying?: boolean;
}
