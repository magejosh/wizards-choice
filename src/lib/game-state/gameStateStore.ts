// src/lib/game-state/gameStateStore.ts
// Main game state store using a modular approach

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState } from '../types/game-types';
import { generateDefaultWizard } from '../wizard/wizardUtils';
import { initializeMarkets } from '../features/market/marketSystem';

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
  const defaultMarkets = initializeMarkets();
  
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
        theme: 'default',
        // Accessibility settings
        highContrastMode: false,
        screenReaderMode: false,
        textSize: 'medium',
        // Display settings
        showDamageNumbers: true,
        showCombatLog: true,
        showTutorialTips: true
      },
      saveSlots: Array(3).fill(null).map((_, i) => ({
        id: i,
        playerName: '',
        level: 0,
        lastSaved: '',
        isEmpty: true
      })),
      currentSaveSlot: 0,
      markets: defaultMarkets,
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
  troubleshootMarkets: () => { marketsExist: boolean; marketCount: number; visitedCount: number; initializedCount: number };
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
      ...createSaveModule(set, get),
      
      // Helper function to troubleshoot market issues
      troubleshootMarkets: () => {
        const state = get().gameState;
        
        console.group('Market Troubleshooting');
        
        // Check if markets exist
        console.log('Markets exist:', state.markets && state.markets.length > 0);
        console.log('Number of markets:', state.markets?.length || 0);
        
        // Check if markets have been visited
        const visitedMarkets = state.marketData?.visitedMarkets || [];
        console.log('Visited markets:', visitedMarkets.length);
        
        // Check market initialization status
        const initializedMarkets = state.markets?.filter(market => {
          const hasIngredients = market.inventory?.ingredients?.length > 0;
          const hasPotions = market.inventory?.potions?.length > 0;
          const hasEquipment = market.inventory?.equipment?.length > 0;
          const hasScrolls = market.inventory?.scrolls?.length > 0;
          
          return hasIngredients && hasPotions && hasEquipment && hasScrolls;
        }).length || 0;
        
        console.log('Fully initialized markets:', initializedMarkets);
        
        // Log debug info about the first market
        if (state.markets && state.markets.length > 0) {
          const firstMarket = state.markets[0];
          console.log('First market details:', {
            id: firstMarket.id,
            name: firstMarket.name,
            hasIngredients: firstMarket.inventory?.ingredients?.length > 0,
            hasPotions: firstMarket.inventory?.potions?.length > 0, 
            hasEquipment: firstMarket.inventory?.equipment?.length > 0,
            hasScrolls: firstMarket.inventory?.scrolls?.length > 0
          });
        }
        
        console.groupEnd();
        
        // Return a simple status object
        return {
          marketsExist: state.markets && state.markets.length > 0,
          marketCount: state.markets?.length || 0,
          visitedCount: visitedMarkets.length,
          initializedCount: initializedMarkets
        };
      }
    }),
    {
      name: 'wizards-choice-game-state',
      
      // Only persist game state, not the actions
      partialize: (state) => ({ gameState: state.gameState }),
      
      // Add version for future migrations if needed
      version: 1,
      
      // Debug log for storage issues
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Game state successfully rehydrated');
          
          // Verify markets exist
          if (!state.gameState?.markets || state.gameState.markets.length === 0) {
            console.warn('No markets found in rehydrated state, will initialize new ones');
          }
        } else {
          console.warn('Failed to rehydrate game state');
        }
      }
    }
  )
);

// Use this method for debugging
export const debug = () => {
  console.log('Current game state:', useGameStateStore.getState().gameState);
};

// Use this to safely ensure markets exist
export const reinitializeMarkets = () => {
  // First try to get existing markets
  const existingMarkets = useGameStateStore.getState().gameState.markets;
  
  // If markets already exist, return them without modifying
  if (existingMarkets && existingMarkets.length > 0) {
    console.log('Using existing markets:', existingMarkets.length);
    return existingMarkets;
  }
  
  // Only create new markets if none exist
  console.log('No markets found, creating new ones');
  const newMarkets = initializeMarkets();
  useGameStateStore.getState().updateMarkets(newMarkets);
  return newMarkets;
};

// Export direct accessors for specific state slices
export const getWizard = () => useGameStateStore.getState().gameState.player;
export const getGameProgress = () => useGameStateStore.getState().gameState.gameProgress;
export const getSettings = () => useGameStateStore.getState().gameState.settings;
export const getSaveSlots = () => useGameStateStore.getState().gameState.saveSlots;
export const getMarkets = () => {
  const markets = useGameStateStore.getState().gameState.markets;
  // If markets don't exist or are empty (which shouldn't happen normally),
  // this is a defensive check to ensure markets always exist
  if (!markets || markets.length === 0) {
    console.warn('Markets not found in game state, initializing new markets');
    const newMarkets = initializeMarkets();
    useGameStateStore.getState().updateMarkets(newMarkets);
    return newMarkets;
  }
  return markets;
};
export const getMarketData = () => useGameStateStore.getState().gameState.marketData;
