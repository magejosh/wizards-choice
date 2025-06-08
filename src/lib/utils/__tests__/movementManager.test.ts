import { axialDistance } from '../hexUtils';
import { rebuildOccupancy, isTileOccupied } from '../../combat/movementManager';
import { CombatState } from '../../types/combat-types';

test('axialDistance computes hex distance', () => {
  const d = axialDistance({ q: 0, r: 0 }, { q: 1, r: -1 });
  expect(d).toBe(1);
});

test('occupancy map detects occupied tiles', () => {
  const state: CombatState = {
    playerWizard: {
      wizard: { id: 'p', name: 'P' } as any,
      currentHealth: 10,
      currentMana: 0,
      activeEffects: [],
      selectedSpell: null,
      hand: [],
      drawPile: [],
      discardPile: [],
      equippedPotions: [],
      equippedSpellScrolls: [],
      position: { q: 0, r: 0 },
      minions: []
    },
    enemyWizard: {
      wizard: { id: 'e', name: 'E' } as any,
      currentHealth: 10,
      currentMana: 0,
      activeEffects: [],
      selectedSpell: null,
      hand: [],
      drawPile: [],
      discardPile: [],
      equippedPotions: [],
      equippedSpellScrolls: [],
      position: { q: 1, r: 0 },
      minions: []
    },
    turn: 1,
    round: 1,
    isPlayerTurn: true,
    log: [],
    status: 'active',
    difficulty: 'easy',
    currentPhase: 'action',
    firstActor: 'player',
    initiative: { player: 1, enemy: 1 },
    actionState: { player: { hasActed: false, hasResponded: false }, enemy: { hasActed: false, hasResponded: false } },
    effectQueue: [],
    pendingResponse: { active: false, action: null, respondingActor: null, responseTimeRemaining: 0 }
  } as CombatState;

  rebuildOccupancy(state);
  expect(isTileOccupied({ q: 0, r: 0 })).toBe(true);
  expect(isTileOccupied({ q: 2, r: 0 })).toBe(false);
});
