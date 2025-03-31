// src/lib/game-state/gameStateStore.ts
// Main game state store using a modular approach

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState } from '../types/game-types';
import { generateDefaultWizard } from '../wizard/wizardUtils';

// Import all modules
import { createWizardModule, WizardActions } from './modules/wizardModule';
import { createMarketModule, MarketActions } from './modules/marketModule';
import { createCombatModule, CombatActions } from './modules/combatModule';
import { createSettingsModule, SettingsActions } from './modules/settingsModule';
import { createProgressModule, ProgressActions } from './modules/progressModule';
import { createSaveModule, SaveActions } from './modules/saveModule';

// Get initial state with placeholder data
const getInitialState = (): { gameState: GameState } => {
  const defaultWizard = generateDefaultWizard('');
  
  return {
    gameState: {
      player: defaultWizard,
      gameProgress: {
        defeatedEnemies: [],
        unlockedSpells: [],
        currentLocation: 'wizardStudy',
        questProgress: {}
      },
      settings: {
        difficulty: 'normal',
        soundEnabled: true,
        musicVolume: 0.7,
        sfxVolume: 0.8,
        colorblindMode: false,
        uiScale: 1.0,
        theme: 'default'
      },
      saveSlots: Array(3).fill(null).map((_, i) => ({
        id: i,
        playerName: '',
        level: 0,
        lastSaved: '',
        isEmpty: true
      })),
      currentSaveSlot: 0,
      markets: [],
      marketData: {
        gold: 100,
        transactions: [],
        reputationLevels: {},
        visitedMarkets: [],
        favoriteMarkets: []
      }
    }
  };
};

// Create interface that combines all module actions
export interface GameStateStore extends 
  WizardActions,
  MarketActions,
  CombatActions,
  SettingsActions,
  ProgressActions,
  SaveActions {
  gameState: GameState;
  updateGameState: (partialState: Partial<GameState>) => void;
}

// Create the store with all modules
export const useGameStateStore = create<GameStateStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),
      
      // Add common methods
      updateGameState: (partialState) => {
        set((state) => ({
          gameState: {
            ...state.gameState,
            ...partialState
          }
        }));
      },
      
      // Add module methods
      ...createWizardModule(set, get),
      ...createMarketModule(set, get),
      ...createCombatModule(set, get),
      ...createSettingsModule(set, get),
      ...createProgressModule(set, get),
      ...createSaveModule(set, get)
    }),
    {
      name: 'wizards-choice-game-state',
      
      // Only persist game state, not the actions
      partialize: (state) => ({ gameState: state.gameState }),
    }
  )
);

// Use this method for debugging
export const debug = () => {
  console.log('Current game state:', useGameStateStore.getState().gameState);
};

// Export direct accessors for specific state slices
export const getWizard = () => useGameStateStore.getState().gameState.player;
export const getGameProgress = () => useGameStateStore.getState().gameState.gameProgress;
export const getSettings = () => useGameStateStore.getState().gameState.settings;
export const getSaveSlots = () => useGameStateStore.getState().gameState.saveSlots;
export const getMarkets = () => useGameStateStore.getState().gameState.markets;
export const getMarketData = () => useGameStateStore.getState().gameState.marketData;
