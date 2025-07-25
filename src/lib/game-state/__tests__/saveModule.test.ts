import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { createSaveModule, SaveActions } from '../modules/saveModule';
import { GameState, SaveSlot } from '../../types/game-types';

declare global {
  // eslint-disable-next-line no-var
  var localStorage: Storage;
}

class MemoryStorage implements Storage {
  private store: Record<string, string> = {};
  length = 0;
  clear() {
    this.store = {};
    this.length = 0;
  }
  getItem(key: string) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }
  key(index: number) {
    return Object.keys(this.store)[index] ?? null;
  }
  removeItem(key: string) {
    if (Object.prototype.hasOwnProperty.call(this.store, key)) {
      delete this.store[key];
      this.length = Object.keys(this.store).length;
    }
  }
  setItem(key: string, value: string) {
    this.store[key] = value;
    this.length = Object.keys(this.store).length;
  }
}

type TestStore = SaveActions & { gameState: GameState };

function createTestStore() {
  const saveSlots: SaveSlot[] = Array(3).fill(null).map((_, i) => ({
    id: i,
    saveUuid: uuidv4(),
    playerName: '',
    level: 0,
    lastSaved: '',
    isEmpty: true
  }));

  const initialState: GameState = {
    settings: {} as any,
    saveSlots,
    currentSaveSlot: saveSlots[0].saveUuid,
    markets: [],
    marketData: { transactions: [], reputationLevels: {}, visitedMarkets: [], favoriteMarkets: [] },
    notifications: [],
    version: 3,
    player: undefined,
    gameProgress: undefined
  };

  return create<TestStore>((set, get) => ({
    gameState: initialState,
    ...createSaveModule(set, get)
  }));
}

beforeEach(() => {
  global.localStorage = new MemoryStorage();
});

test('initializes multiple save slots', async () => {
  const store = createTestStore();
  const { initializeNewGame, getSaveSlots } = store.getState();

  await initializeNewGame('Alice', 0);
  await initializeNewGame('Bob', 1);

  const slots = getSaveSlots();
  expect(slots[0].playerName).toBe('Alice');
  expect(slots[1].playerName).toBe('Bob');
  expect(slots[0].isEmpty).toBe(false);
  expect(slots[1].isEmpty).toBe(false);
});

test('save and load different slots without overwriting', async () => {
  const store = createTestStore();
  const actions = store.getState();
  await actions.initializeNewGame('Alice', 0);
  const slot0Uuid = store.getState().gameState.saveSlots[0].saveUuid;
  await actions.initializeNewGame('Bob', 1);
  const slot1Uuid = store.getState().gameState.saveSlots[1].saveUuid;

  // Update Bob to level 2 and save
  store.setState(state => {
    const slot1 = { ...state.gameState.saveSlots[1] };
    const player = { ...slot1.player!, level: 2 };
    slot1.player = player;
    slot1.level = 2;
    const saveSlots = [...state.gameState.saveSlots];
    saveSlots[1] = slot1;
    return { gameState: { ...state.gameState, player, saveSlots } } as any;
  });
  store.getState().saveGame();

  // Load Alice and ensure Bob remains level 2
  store.getState().loadGame(slot0Uuid);
  const stateAfterLoad0 = store.getState();
  expect(stateAfterLoad0.gameState.player?.name).toBe('Alice');
  expect(stateAfterLoad0.gameState.player?.level).toBe(1);
  expect(stateAfterLoad0.gameState.saveSlots[1].level).toBe(2);

  // Load Bob again
  store.getState().loadGame(slot1Uuid);
  const stateAfterLoad1 = store.getState();
  expect(stateAfterLoad1.gameState.player?.name).toBe('Bob');
  expect(stateAfterLoad1.gameState.player?.level).toBe(2);
  expect(stateAfterLoad1.gameState.saveSlots[0].level).toBe(1);
});

test('resetState clears storage and resets slots', async () => {
  const store = createTestStore();
  const actions = store.getState();

  await actions.initializeNewGame('Alice', 0);
  expect(global.localStorage.length).toBeGreaterThan(0);

  await actions.resetState();

  const state = store.getState().gameState;
  expect(global.localStorage.length).toBe(0);
  expect(state.saveSlots.length).toBe(3);
  expect(state.saveSlots.every((s) => s.isEmpty)).toBe(true);
  expect(state.currentSaveSlot).toBe(state.saveSlots[0].saveUuid);
});
