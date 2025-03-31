// src/lib/game-state/modules/saveModule.ts
// Game save/load management

import { SaveSlot, GameState } from '../../types/game-types';
import { Wizard } from '../../types/wizard-types';
import { generateDefaultWizard } from '../../wizard/wizardUtils';

// Define the slice of state this module manages
export interface SaveState {
  saveSlots: SaveSlot[];
  currentSaveSlot: number;
}

// Define the actions this module provides
export interface SaveActions {
  saveGame: () => void;
  loadGame: (saveSlotId: number) => boolean;
  initializeNewGame: (playerName: string, saveSlotId: number) => void;
  resetState: () => void;
  updateSaveSlot: (slotId: number, data: Partial<SaveSlot>) => void;
  deleteSaveSlot: (slotId: number) => void;
  getSaveSlots: () => SaveSlot[];
  getCurrentSaveSlot: () => number;
  setCurrentSaveSlot: (slotId: number) => void;
}

// Helper to generate initial state
const getInitialGameState = (playerName: string, saveSlotId: number): GameState => {
  const defaultWizard = generateDefaultWizard(playerName);
  
  return {
    player: defaultWizard,
    gameProgress: {
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
      playerName: i === saveSlotId ? playerName : '',
      level: i === saveSlotId ? 1 : 0,
      lastSaved: i === saveSlotId ? new Date().toISOString() : '',
      isEmpty: i !== saveSlotId
    })),
    currentSaveSlot: saveSlotId,
    markets: [],
    marketData: {
      gold: 100, // Starting gold
      transactions: [],
      reputationLevels: {},
      visitedMarkets: [],
      favoriteMarkets: []
    }
  };
};

// Create the module
export const createSaveModule = (set: Function, get: Function): SaveActions => ({
  saveGame: () => {
    set((state: any) => {
      const gameState = state.gameState;
      const currentSlotId = gameState.currentSaveSlot;
      const saveSlots = [...gameState.saveSlots];
      
      // Update the current save slot
      saveSlots[currentSlotId] = {
        ...saveSlots[currentSlotId],
        playerName: gameState.player.name,
        level: gameState.player.level,
        lastSaved: new Date().toISOString(),
        isEmpty: false
      };
      
      // Store the updated state in localStorage
      try {
        const saveData = {
          ...gameState,
          saveSlots
        };
        
        localStorage.setItem(`wizardsChoice_saveSlot_${currentSlotId}`, JSON.stringify(saveData));
        console.log(`Game saved to slot ${currentSlotId}`);
      } catch (error) {
        console.error('Failed to save game:', error);
      }
      
      return {
        gameState: {
          ...gameState,
          saveSlots
        }
      };
    });
  },

  loadGame: (saveSlotId) => {
    try {
      // Try to retrieve save data from localStorage
      const saveDataString = localStorage.getItem(`wizardsChoice_saveSlot_${saveSlotId}`);
      
      if (!saveDataString) {
        console.error(`No save data found for slot ${saveSlotId}`);
        return false;
      }
      
      const saveData = JSON.parse(saveDataString);
      
      // Validate the save data structure
      if (!saveData.player || !saveData.gameProgress || !saveData.settings) {
        console.error('Invalid save data format');
        return false;
      }
      
      // Update the current save slot
      set({ gameState: { ...saveData, currentSaveSlot: saveSlotId } });
      
      console.log(`Game loaded from slot ${saveSlotId}`);
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  },

  initializeNewGame: (playerName, saveSlotId) => {
    // Initialize a new game with default values
    const initialGameState = getInitialGameState(playerName, saveSlotId);
    
    set({ gameState: initialGameState });
    
    // Save the new game
    try {
      localStorage.setItem(`wizardsChoice_saveSlot_${saveSlotId}`, JSON.stringify(initialGameState));
      console.log(`New game initialized in slot ${saveSlotId}`);
    } catch (error) {
      console.error('Failed to save new game:', error);
    }
  },

  resetState: () => {
    // Reset to a default state (useful for debugging)
    const initialGameState = getInitialGameState('Debug', 0);
    
    set({ gameState: initialGameState });
  },

  updateSaveSlot: (slotId, data) => {
    set((state: any) => {
      const saveSlots = [...state.gameState.saveSlots];
      
      // Update the specified save slot
      saveSlots[slotId] = {
        ...saveSlots[slotId],
        ...data
      };
      
      return {
        gameState: {
          ...state.gameState,
          saveSlots
        }
      };
    });
  },

  deleteSaveSlot: (slotId) => {
    set((state: any) => {
      const saveSlots = [...state.gameState.saveSlots];
      
      // Reset the specified save slot
      saveSlots[slotId] = {
        id: slotId,
        playerName: '',
        level: 0,
        lastSaved: '',
        isEmpty: true
      };
      
      // Remove from localStorage
      try {
        localStorage.removeItem(`wizardsChoice_saveSlot_${slotId}`);
        console.log(`Save data in slot ${slotId} deleted`);
      } catch (error) {
        console.error('Failed to delete save data:', error);
      }
      
      return {
        gameState: {
          ...state.gameState,
          saveSlots
        }
      };
    });
  },

  getSaveSlots: () => {
    return get().gameState.saveSlots;
  },

  getCurrentSaveSlot: () => {
    return get().gameState.currentSaveSlot;
  },

  setCurrentSaveSlot: (slotId) => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        currentSaveSlot: slotId
      }
    }));
  }
}); 