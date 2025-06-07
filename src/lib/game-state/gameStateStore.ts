// src/lib/game-state/gameStateStore.ts
// Main game state store using a modular approach

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, GameProgress, SaveSlot } from '../types/game-types';
import { MarketData } from '../types/market-types';
import { Wizard } from '../types/wizard-types';
import { generateDefaultWizardAsync } from '../wizard/wizardUtils';
import { initializeMarkets, refreshMarketInventory } from '../features/market/marketSystem';

// Import all modules
import { createWizardModule, WizardActions } from './modules/wizardModule';
import { createMarketModule, MarketActions } from './modules/marketModule';
import { createCombatModule, CombatActions } from './modules/combatModule';
import { createSettingsModule, SettingsActions } from './modules/settingsModule';
import { createProgressModule, ProgressActions } from './modules/progressModule';
import { createSaveModule, SaveActions } from './modules/saveModule';

// Import uuid for generating unique IDs
import { v4 as uuidv4 } from 'uuid';

// Get initial state with placeholder data
const getInitialState = async (): Promise<{ gameState: GameState }> => {
  const defaultWizard = await generateDefaultWizardAsync('');
  const defaultMarkets = initializeMarkets();

  // Defensive: Validate and recover market inventory structure
  const validatedMarkets = defaultMarkets.map((market: any) => {
    if (!market.inventory ||
        !Array.isArray(market.inventory.ingredients) ||
        !Array.isArray(market.inventory.potions) ||
        !Array.isArray(market.inventory.equipment) ||
        !Array.isArray(market.inventory.scrolls)) {
      console.warn(`Market ${market.name} inventory missing or malformed. Regenerating...`);
      return refreshMarketInventory(market);
    }
    return market;
  });

  // Default game progress
  const defaultGameProgress: GameProgress = {
    defeatedEnemies: [],
    unlockedSpells: [],
    currentLocation: 'wizardStudy',
    questProgress: {},
    achievements: [],
    titles: [],
    battleHistory: [],
    playerStats: {
      battlesTotal: 0,
      battlesWon: 0,
      battlesLost: 0,
      damageDealt: 0,
      damageReceived: 0,
      healingDone: 0,
      criticalHitsLanded: 0,
      criticalHitsReceived: 0,
      spellsCast: {
        total: 0,
        byType: {},
        byElement: {}
      },
      mysticPunchesUsed: 0,
      totalTurns: 0,
      longestBattle: 0,
      shortestVictory: 0,
      flawlessVictories: 0,
      totalExperienceGained: 0,
      goldEarned: 0,
      goldSpent: 0,
      levelsGained: 0,
      skillPointsSpent: 0,
      spellsAcquired: 0,
      equipmentCollected: 0,
      potionsCrafted: 0,
      ingredientsGathered: 0,
      recipesDiscovered: 0,
      scrollsUsed: 0,
      damagePerMana: 0,
      averageTurnsPerVictory: 0,
      goldPerBattle: 0,
      experiencePerBattle: 0,
      elementalDamage: {
        fire: 0,
        water: 0,
        earth: 0,
        air: 0,
        arcane: 0,
        nature: 0,
        shadow: 0,
        light: 0
      }
    }
  };

  // Generate UUIDs for save slots
  const saveSlots = Array(3).fill(null).map((_, i) => ({
    id: i,
    saveUuid: uuidv4(),
    playerName: '',
    level: 0,
    lastSaved: '',
    isEmpty: true,
    // First slot gets default player and game progress
    player: i === 0 ? defaultWizard : undefined,
    gameProgress: i === 0 ? defaultGameProgress : undefined
  }));

  return {
    gameState: {
      // Keep these for backward compatibility
      player: defaultWizard,
      gameProgress: defaultGameProgress,

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
      saveSlots: saveSlots,
      currentSaveSlot: saveSlots[0].saveUuid,  // Use the UUID of the first slot
      markets: validatedMarkets,
      marketData: {
        gold: 0,
        transactions: [],
        reputationLevels: {},
        visitedMarkets: [],
        favoriteMarkets: []
      },
      notifications: [],
      version: 3  // Increment version for the new save format with isolated save slots
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
        set((state) => {
          const gameState = state.gameState;
          const currentSaveUuid = gameState.currentSaveSlot;
          const saveSlots = [...gameState.saveSlots];

          // Find the current save slot
          const slotIndex = saveSlots.findIndex(slot => slot.saveUuid === currentSaveUuid);
          if (slotIndex === -1) {
            // If no save slot found, just update the top-level state
            return {
              gameState: {
                ...gameState,
                ...partialState
              }
            };
          }

          // Create a new state object
          const newGameState = { ...gameState };

          // Update the top-level state with the partial state
          Object.keys(partialState).forEach(key => {
            newGameState[key] = partialState[key];
          });

          // If player or gameProgress is being updated, also update the save slot
          if (partialState.player) {
            saveSlots[slotIndex] = {
              ...saveSlots[slotIndex],
              player: partialState.player,
              level: partialState.player.level,
              playerName: partialState.player.name
            };
          }

          if (partialState.gameProgress) {
            saveSlots[slotIndex] = {
              ...saveSlots[slotIndex],
              gameProgress: partialState.gameProgress
            };
          }

          // Update the save slots in the new state
          newGameState.saveSlots = saveSlots;

          return {
            gameState: newGameState
          };
        });
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

      // Update version for save slot isolation migration
      version: 3,

      // Debug log for storage issues and handle migrations
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Game state successfully rehydrated');

          // Verify markets exist
          if (!state.gameState?.markets || state.gameState.markets.length === 0) {
            console.warn('No markets found in rehydrated state, will initialize new ones');
          }

          // Check if save data needs migration
          if (!state.gameState.version || state.gameState.version < 3) {
            console.log('Migrating save data to version 3...');

            // Trigger migration in the next tick to ensure store is fully initialized
            setTimeout(() => {
              const { migrateSaveData, loadAllSaveSlots } = useGameStateStore.getState();
              migrateSaveData();
              loadAllSaveSlots();
              console.log('Migration completed');
            }, 0);
          } else {
            // Even if no migration is needed, ensure we load all save slots
            setTimeout(() => {
              const { loadAllSaveSlots } = useGameStateStore.getState();
              loadAllSaveSlots();
            }, 0);
          }

          // Ensure the top-level player and gameProgress are set from the current save slot
          const currentSaveUuid = state.gameState.currentSaveSlot;
          const currentSlot = state.gameState.saveSlots.find(slot => slot.saveUuid === currentSaveUuid);
          if (currentSlot && (currentSlot.player || currentSlot.gameProgress)) {
            setTimeout(() => {
              // --- DEDUPE & MERGE POTIONS ---
              let player = currentSlot.player || state.gameState.player;
              let changed = false;
              if (player) {
                console.log('[Repair] Before dedupe - potions:', player.potions);
                console.log('[Repair] Before dedupe - equippedPotions:', player.equippedPotions);
                const dedupedPotions = dedupeAndMergePotions(player.potions || []);
                const dedupedEquipped = dedupeAndMergePotions(player.equippedPotions || []);
                // Compare by length and content (ids and quantities)
                const arraysDiffer = (a, b) =>
                  a.length !== b.length ||
                  a.some((item, i) => item.id !== b[i]?.id || item.quantity !== b[i]?.quantity);
                if (
                  arraysDiffer(dedupedPotions, player.potions || []) ||
                  arraysDiffer(dedupedEquipped, player.equippedPotions || [])
                ) {
                  changed = true;
                  player = { ...player, potions: dedupedPotions, equippedPotions: dedupedEquipped };
                  console.log('[Repair] After dedupe - potions:', dedupedPotions);
                  console.log('[Repair] After dedupe - equippedPotions:', dedupedEquipped);
                }
              }
              useGameStateStore.setState({
                gameState: {
                  ...state.gameState,
                  player: player || state.gameState.player,
                  gameProgress: currentSlot.gameProgress || state.gameState.gameProgress
                }
              });
              if (changed) {
                // Force save to localStorage for current save slot
                try {
                  const updatedState = useGameStateStore.getState().gameState;
                  localStorage.setItem(`wizardsChoice_save_${currentSaveUuid}`, JSON.stringify(updatedState));
                  console.log('[Repair] Forced save to localStorage after dedupe.');
                } catch (e) {
                  console.error('[Repair] Failed to save cleaned state to localStorage:', e);
                }
                console.log('[GameState] Deduplicated and merged potions on load (full content check).');
              }
            }, 0);
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

// Helper function to get the current save slot
export const getCurrentSaveSlot = (): SaveSlot | undefined => {
  const state = useGameStateStore.getState().gameState;
  const currentSaveUuid = state.currentSaveSlot;
  return state.saveSlots.find(slot => slot.saveUuid === currentSaveUuid);
};

// Helper function to find a save slot by UUID
export const findSaveSlotByUuid = (saveUuid: string): SaveSlot | undefined => {
  const state = useGameStateStore.getState().gameState;
  return state.saveSlots.find(slot => slot.saveUuid === saveUuid);
};

// Helper function to find a save slot index by UUID
export const findSaveSlotIndexByUuid = (saveUuid: string): number => {
  const state = useGameStateStore.getState().gameState;
  return state.saveSlots.findIndex(slot => slot.saveUuid === saveUuid);
};

// Export direct accessors for specific state slices
export const getWizard = (): Wizard | undefined => {
  const currentSlot = getCurrentSaveSlot();
  // First try to get player from the current save slot
  if (currentSlot?.player) {
    return currentSlot.player;
  }
  // Fall back to the legacy top-level player for backward compatibility
  return useGameStateStore.getState().gameState.player;
};

export const getGameProgress = (): GameProgress | undefined => {
  const currentSlot = getCurrentSaveSlot();
  // First try to get gameProgress from the current save slot
  if (currentSlot?.gameProgress) {
    return currentSlot.gameProgress;
  }
  // Fall back to the legacy top-level gameProgress for backward compatibility
  return useGameStateStore.getState().gameState.gameProgress;
};

// Modifier functions that update both the save slot and top-level state
export const updateWizard = (updater: (wizard: Wizard) => Wizard): void => {
  useGameStateStore.setState(state => {
    const gameState = state.gameState;
    const currentSaveUuid = gameState.currentSaveSlot;
    const saveSlots = [...gameState.saveSlots];

    // Find the current save slot
    const slotIndex = saveSlots.findIndex(slot => slot.saveUuid === currentSaveUuid);
    if (slotIndex === -1) return state;

    // Get the current player data
    const currentPlayer = saveSlots[slotIndex].player || gameState.player;
    if (!currentPlayer) return state;

    // Update the player data
    const updatedPlayer = updater(currentPlayer);

    // Update the save slot
    saveSlots[slotIndex] = {
      ...saveSlots[slotIndex],
      player: updatedPlayer,
      level: updatedPlayer.level,
      playerName: updatedPlayer.name
    };

    // Return the updated state
    return {
      ...state,
      gameState: {
        ...gameState,
        player: updatedPlayer,  // Update top-level reference
        saveSlots
      }
    };
  });
};

export const updateGameProgress = (updater: (progress: GameProgress) => GameProgress): void => {
  useGameStateStore.setState(state => {
    const gameState = state.gameState;
    const currentSaveUuid = gameState.currentSaveSlot;
    const saveSlots = [...gameState.saveSlots];

    // Find the current save slot
    const slotIndex = saveSlots.findIndex(slot => slot.saveUuid === currentSaveUuid);
    if (slotIndex === -1) return state;

    // Get the current game progress data
    const currentProgress = saveSlots[slotIndex].gameProgress || gameState.gameProgress;
    if (!currentProgress) return state;

    // Update the game progress data
    const updatedProgress = updater(currentProgress);

    // Update the save slot
    saveSlots[slotIndex] = {
      ...saveSlots[slotIndex],
      gameProgress: updatedProgress
    };

    // Return the updated state
    return {
      ...state,
      gameState: {
        ...gameState,
        gameProgress: updatedProgress,  // Update top-level reference
        saveSlots
      }
    };
  });
};

// Convenience function to update both wizard and game progress in one operation
export const updateGameState = (wizardUpdater?: (wizard: Wizard) => Wizard, progressUpdater?: (progress: GameProgress) => GameProgress): void => {
  useGameStateStore.setState(state => {
    const gameState = state.gameState;
    const currentSaveUuid = gameState.currentSaveSlot;
    const saveSlots = [...gameState.saveSlots];

    // Find the current save slot
    const slotIndex = saveSlots.findIndex(slot => slot.saveUuid === currentSaveUuid);
    if (slotIndex === -1) return state;

    let updatedPlayer = gameState.player;
    let updatedProgress = gameState.gameProgress;

    // Update player if updater provided
    if (wizardUpdater) {
      const currentPlayer = saveSlots[slotIndex].player || gameState.player;
      if (currentPlayer) {
        updatedPlayer = wizardUpdater(currentPlayer);
      }
    }

    // Update game progress if updater provided
    if (progressUpdater) {
      const currentProgress = saveSlots[slotIndex].gameProgress || gameState.gameProgress;
      if (currentProgress) {
        updatedProgress = progressUpdater(currentProgress);
      }
    }

    // Update the save slot
    saveSlots[slotIndex] = {
      ...saveSlots[slotIndex],
      player: updatedPlayer,
      gameProgress: updatedProgress,
      level: updatedPlayer?.level || saveSlots[slotIndex].level,
      playerName: updatedPlayer?.name || saveSlots[slotIndex].playerName
    };

    // Return the updated state
    return {
      ...state,
      gameState: {
        ...gameState,
        player: updatedPlayer,
        gameProgress: updatedProgress,
        saveSlots
      }
    };
  });
};

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

// Utility to deduplicate and merge potions by name/type/rarity
export function dedupeAndMergePotions(potions) {
  const map = new Map();
  for (const potion of potions) {
    const key = `${potion.name}|${potion.type}|${potion.rarity}`;
    if (map.has(key)) {
      const existing = map.get(key);
      existing.quantity = (existing.quantity || 1) + (potion.quantity || 1);
    } else {
      map.set(key, { ...potion, quantity: potion.quantity || 1 });
    }
  }
  return Array.from(map.values());
}
