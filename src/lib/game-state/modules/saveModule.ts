// src/lib/game-state/modules/saveModule.ts
// Game save/load management

import { SaveSlot, GameState, GameProgress } from '../../types/game-types';
import { Wizard } from '../../types/wizard-types';
import { generateDefaultWizardAsync } from '../../wizard/wizardUtils';
import { v4 as uuidv4 } from 'uuid';

// Define the slice of state this module manages
export interface SaveState {
  saveSlots: SaveSlot[];
  currentSaveSlot: string;  // Changed from number to string (saveUuid)
}

// Define the actions this module provides
export interface SaveActions {
  saveGame: () => void;
  loadGame: (saveUuid: string) => boolean;
  initializeNewGame: (playerName: string, slotId: number) => Promise<void>;
  resetState: () => Promise<void>;
  updateSaveSlot: (saveUuid: string, data: Partial<SaveSlot>) => void;
  deleteSaveSlot: (saveUuid: string) => void;
  getSaveSlots: () => SaveSlot[];
  getCurrentSaveSlot: () => string;
  setCurrentSaveSlot: (saveUuid: string) => void;
  findSlotIndexByUuid: (saveUuid: string) => number;
  migrateSaveData: () => void;
  loadAllSaveSlots: () => void;
}

// Helper to generate initial state
const getInitialGameState = async (playerName: string, saveSlotId: number): Promise<GameState> => {
  const defaultWizard = await generateDefaultWizardAsync(playerName);
  // Generate a UUID for the active save slot
  const activeSlotUuid = uuidv4();
  // Create save slots with UUIDs
  const saveSlots = Array(3).fill(null).map((_, i) => {
    const isActiveSlot = i === saveSlotId;
    return {
      id: i,
      saveUuid: isActiveSlot ? activeSlotUuid : uuidv4(),
      playerName: isActiveSlot ? playerName : '',
      level: isActiveSlot ? 1 : 0,
      lastSaved: isActiveSlot ? new Date().toISOString() : '',
      isEmpty: !isActiveSlot
    };
  });
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
    saveSlots,
    currentSaveSlot: activeSlotUuid,
    settings: {
      difficulty: 'normal',
      soundEnabled: true,
      musicVolume: 0.7,
      sfxVolume: 0.8,
      colorblindMode: false,
      uiScale: 1.0,
      theme: 'default',
      highContrastMode: false,
      screenReaderMode: false,
      textSize: 'medium',
      showDamageNumbers: true,
      showCombatLog: true,
      showTutorialTips: true
    },
    markets: [],
    marketData: {
      gold: 0,
      transactions: [],
      reputationLevels: {},
      visitedMarkets: [],
      favoriteMarkets: []
    },
    notifications: [],
    version: 3
  };
};

// Helper function to find a slot index by UUID
const findSlotIndexByUuid = (saveSlots: SaveSlot[], saveUuid: string): number => {
  const index = saveSlots.findIndex(slot => slot.saveUuid === saveUuid);
  if (index === -1) {
    console.error(`No save slot found with UUID ${saveUuid}`);
  }
  return index;
};

// Helper function to migrate old save data to the new format
const migrateOldSaveData = (saveData: any): GameState => {
  console.log('Migrating old save data to new format...');

  // If saveSlots don't have saveUuid, add them
  const migratedSaveSlots = saveData.saveSlots.map((slot: any, index: number) => {
    if (!slot.saveUuid) {
      return {
        ...slot,
        saveUuid: uuidv4()
      };
    }
    return slot;
  });

  // If currentSaveSlot is a number, convert it to the UUID of that slot
  let currentSaveSlot = saveData.currentSaveSlot;
  let currentSlotIndex = -1;

  if (typeof currentSaveSlot === 'number') {
    currentSlotIndex = currentSaveSlot;
    if (currentSlotIndex >= 0 && currentSlotIndex < migratedSaveSlots.length) {
      currentSaveSlot = migratedSaveSlots[currentSlotIndex].saveUuid;
    } else {
      // If the index is invalid, use the first slot's UUID
      currentSaveSlot = migratedSaveSlots[0].saveUuid;
      currentSlotIndex = 0;
    }
  } else {
    // Find the index of the current save slot by UUID
    currentSlotIndex = migratedSaveSlots.findIndex(slot => slot.saveUuid === currentSaveSlot);
    if (currentSlotIndex === -1) {
      // If not found, use the first slot
      currentSaveSlot = migratedSaveSlots[0].saveUuid;
      currentSlotIndex = 0;
    }
  }

  // Move player and gameProgress data into the current save slot
  if (currentSlotIndex !== -1 && saveData.player && saveData.gameProgress) {
    migratedSaveSlots[currentSlotIndex] = {
      ...migratedSaveSlots[currentSlotIndex],
      player: saveData.player,
      gameProgress: saveData.gameProgress
    };
  }

  return {
    ...saveData,
    saveSlots: migratedSaveSlots,
    currentSaveSlot,
    version: 3  // Update to version 3
  };
};

// Create the module
export const createSaveModule = (set: Function, get: Function): SaveActions => ({
  saveGame: () => {
    set((state: any) => {
      const gameState = state.gameState;
      const currentSaveUuid = gameState.currentSaveSlot;
      const saveSlots = [...gameState.saveSlots];

      // Find the index of the current save slot by UUID
      const slotIndex = findSlotIndexByUuid(saveSlots, currentSaveUuid);
      if (slotIndex === -1) {
        console.error('Failed to save game: current save slot not found');
        return state;
      }

      // Get the current save slot
      const currentSlot = saveSlots[slotIndex];

      // Ensure the save slot has the latest player and gameProgress data
      // This is critical for data isolation between save slots
      const updatedSlot = {
        ...currentSlot,
        playerName: gameState.player.name,
        level: gameState.player.level,
        lastSaved: new Date().toISOString(),
        isEmpty: false,
        player: gameState.player,  // Store player data in the save slot
        gameProgress: gameState.gameProgress  // Store gameProgress data in the save slot
      };

      // Update the save slot in the array
      saveSlots[slotIndex] = updatedSlot;

      // Create updated game state with all save slots preserved
      const updatedGameState = {
        ...gameState,
        saveSlots,
        version: 3  // Version 3 for save slot isolation
      };

      // Store the updated state in localStorage
      try {
        // Save the current save slot data
        localStorage.setItem(`wizardsChoice_save_${currentSaveUuid}`, JSON.stringify(updatedGameState));
        console.log(`Game saved with UUID ${currentSaveUuid}`);

        // Update the metadata for other save slots, but preserve their player and gameProgress data
        saveSlots.forEach(slot => {
          if (!slot.isEmpty && slot.saveUuid !== currentSaveUuid) {
            // Get the existing save data for this slot
            const slotDataString = localStorage.getItem(`wizardsChoice_save_${slot.saveUuid}`);
            if (slotDataString) {
              try {
                const slotData = JSON.parse(slotDataString);

                // Find this slot's data in the current save slots array
                const thisSlotInCurrentArray = saveSlots.find(s => s.saveUuid === slot.saveUuid);
                if (!thisSlotInCurrentArray) return; // Skip if not found

                // Find this slot's data in the loaded data
                const thisSlotInLoadedData = slotData.saveSlots.find(
                  (s: SaveSlot) => s.saveUuid === slot.saveUuid
                );
                if (!thisSlotInLoadedData) return; // Skip if not found

                // Create a new save slots array for this slot's save data
                const preservedSaveSlots = slotData.saveSlots.map((s: SaveSlot) => {
                  if (s.saveUuid === slot.saveUuid) {
                    // For this slot, keep its own player and gameProgress data
                    return {
                      ...s,
                      // Update metadata only
                      id: thisSlotInCurrentArray.id,
                      playerName: thisSlotInLoadedData.playerName,
                      level: thisSlotInLoadedData.level,
                      lastSaved: thisSlotInLoadedData.lastSaved,
                      isEmpty: thisSlotInLoadedData.isEmpty
                    };
                  } else {
                    // For other slots, update metadata only
                    const matchingSlot = saveSlots.find(ms => ms.saveUuid === s.saveUuid);
                    if (matchingSlot) {
                      return {
                        ...s,
                        id: matchingSlot.id,
                        playerName: matchingSlot.playerName,
                        level: matchingSlot.level,
                        lastSaved: matchingSlot.lastSaved,
                        isEmpty: matchingSlot.isEmpty
                      };
                    }
                    return s;
                  }
                });

                // Update only the save slots array in the existing data
                const updatedSlotData = {
                  ...slotData,
                  saveSlots: preservedSaveSlots,
                  version: 3
                };

                // Save the updated data
                localStorage.setItem(`wizardsChoice_save_${slot.saveUuid}`, JSON.stringify(updatedSlotData));
                console.log(`Updated save slot metadata for UUID ${slot.saveUuid}`);
              } catch (error) {
                console.error(`Failed to update save slot ${slot.saveUuid}:`, error);
              }
            }
          }
        });
      } catch (error) {
        console.error('Failed to save game:', error);
      }

      return {
        gameState: updatedGameState
      };
    });
  },

  loadGame: (saveUuid) => {
    try {
      console.log(`Loading game with UUID ${saveUuid}...`);

      // Try to retrieve save data from localStorage
      const saveDataString = localStorage.getItem(`wizardsChoice_save_${saveUuid}`);

      // If not found with new format, try the old format
      if (!saveDataString) {
        // Try to find the save slot by UUID in the current state
        const currentSaveSlots = get().gameState.saveSlots;
        const slotIndex = findSlotIndexByUuid(currentSaveSlots, saveUuid);

        if (slotIndex !== -1) {
          // Try the old format with the slot index
          const oldFormatData = localStorage.getItem(`wizardsChoice_saveSlot_${slotIndex}`);
          if (oldFormatData) {
            console.log(`Found save data in old format for slot ${slotIndex}, migrating...`);
            const parsedData = JSON.parse(oldFormatData);
            const migratedData = migrateOldSaveData(parsedData);

            // Save in new format and remove old format
            localStorage.setItem(`wizardsChoice_save_${saveUuid}`, JSON.stringify(migratedData));
            localStorage.removeItem(`wizardsChoice_saveSlot_${slotIndex}`);

            // Update the state
            set({ gameState: migratedData });
            console.log(`Game loaded and migrated for UUID ${saveUuid}`);
            return true;
          }
        }

        console.error(`No save data found for UUID ${saveUuid}`);
        return false;
      }

      let saveData = JSON.parse(saveDataString);

      // Validate the save data structure
      if (!saveData.settings) {
        console.error('Invalid save data format');
        return false;
      }

      // Check if migration is needed for version 2 to version 3
      if (!saveData.version || saveData.version < 3) {
        // Migrate from version 2 to version 3 (move player and gameProgress into save slots)
        if (saveData.version === 2 && saveData.player && saveData.gameProgress) {
          console.log('Migrating from version 2 to version 3 (save slot isolation)...');

          // Find the slot for this UUID
          const slotIndex = findSlotIndexByUuid(saveData.saveSlots, saveUuid);
          if (slotIndex !== -1) {
            // Update the save slot with player and gameProgress data
            saveData.saveSlots[slotIndex] = {
              ...saveData.saveSlots[slotIndex],
              player: saveData.player,
              gameProgress: saveData.gameProgress
            };

            // Update version
            saveData.version = 3;

            // Save the migrated data
            localStorage.setItem(`wizardsChoice_save_${saveUuid}`, JSON.stringify(saveData));
            console.log(`Migrated save data to version 3 for UUID ${saveUuid}`);
          }
        } else {
          // For older versions, use the general migration function
          saveData = migrateOldSaveData(saveData);
        }
      }

      // Get the current game state to preserve other save slots
      const currentGameState = get().gameState;
      const currentSaveSlots = [...currentGameState.saveSlots];

      // Find the slot index for this UUID in the loaded save data
      const loadedSlotIndex = findSlotIndexByUuid(saveData.saveSlots, saveUuid);
      if (loadedSlotIndex === -1) {
        console.error(`Save slot with UUID ${saveUuid} not found in loaded data`);
        return false;
      }

      // Get the loaded save slot data
      const loadedSaveSlot = saveData.saveSlots[loadedSlotIndex];

      // Find the slot index in the current save slots
      const currentSlotIndex = currentSaveSlots.findIndex(slot => slot.saveUuid === saveUuid);
      if (currentSlotIndex === -1) {
        console.error(`Save slot with UUID ${saveUuid} not found in current save slots`);
        return false;
      }

      // Ensure the loaded save slot has player and gameProgress data
      if (!loadedSaveSlot.player || !loadedSaveSlot.gameProgress) {
        console.warn(`Save slot with UUID ${saveUuid} missing player or gameProgress data, using top-level data`);

        // Use the top-level data if available
        if (saveData.player && saveData.gameProgress) {
          loadedSaveSlot.player = saveData.player;
          loadedSaveSlot.gameProgress = saveData.gameProgress;

          // Save the updated data
          saveData.saveSlots[loadedSlotIndex] = loadedSaveSlot;
          localStorage.setItem(`wizardsChoice_save_${saveUuid}`, JSON.stringify(saveData));
          console.log(`Updated save slot with UUID ${saveUuid} with top-level data`);
        } else {
          console.error(`No player or gameProgress data found for save slot with UUID ${saveUuid}`);
          return false;
        }
      }

      // Update the current save slot with the loaded data
      currentSaveSlots[currentSlotIndex] = loadedSaveSlot;

      // Create a merged game state that preserves other save slots
      const mergedGameState = {
        ...saveData,
        // Set the top-level player and gameProgress to the ones from the loaded save slot
        player: loadedSaveSlot.player,
        gameProgress: loadedSaveSlot.gameProgress,
        saveSlots: currentSaveSlots,
        currentSaveSlot: saveUuid,
        version: 3
      };

      // Log the loaded data for debugging
      console.log(`Loaded save slot: ${loadedSaveSlot.playerName}, Level ${loadedSaveSlot.level}`);
      console.log(`Player data: ${loadedSaveSlot.player ? 'Present' : 'Missing'}`);
      console.log(`Game progress data: ${loadedSaveSlot.gameProgress ? 'Present' : 'Missing'}`);

      // Update the state with the merged data
      set({ gameState: mergedGameState });

      // Log detailed information about the loaded save slot for debugging
      console.log(`Game loaded for UUID ${saveUuid} with preserved save slots`);
      console.log(`Loaded player: ${loadedSaveSlot.player?.name}, Level ${loadedSaveSlot.player?.level}`);
      console.log(`Current save slot UUID set to: ${saveUuid}`);
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      return false;
    }
  },

  initializeNewGame: async (playerName, slotId) => {
    console.log(`Initializing new game for ${playerName} in slot ${slotId}...`);
    // Get the current game state
    const currentGameState = get().gameState;
    const currentSaveSlots = [...currentGameState.saveSlots];
    // Generate a new UUID for this save slot
    const newSaveUuid = uuidv4();
    // First, clear any existing save data for this slot
    try {
      localStorage.removeItem(`wizardsChoice_saveSlot_${slotId}`);
      const existingSlot = currentSaveSlots.find(slot => slot.id === slotId);
      if (existingSlot && existingSlot.saveUuid) {
        localStorage.removeItem(`wizardsChoice_save_${existingSlot.saveUuid}`);
      }
      console.log(`Cleared existing save data in slot ${slotId}`);
    } catch (error) {
      console.error('Failed to clear existing save data:', error);
    }
    // Create a default wizard with the given name
    const defaultWizard = await generateDefaultWizardAsync(playerName);
    console.log(`Created default wizard: ${playerName}, Level ${defaultWizard.level}`);
    // Create default game progress
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

    // Create the new save slot with player and gameProgress data
    const newSaveSlot: SaveSlot = {
      id: slotId,
      saveUuid: newSaveUuid,
      playerName: playerName,
      level: 1,
      lastSaved: new Date().toISOString(),
      isEmpty: false,
      player: defaultWizard,
      gameProgress: defaultGameProgress
    };

    // Update the save slots array
    currentSaveSlots[slotId] = newSaveSlot;

    // Create the new game state, preserving other save slots
    const newGameState = {
      ...currentGameState,
      // Set the top-level player and gameProgress to the ones from the new save slot
      // for backward compatibility
      player: defaultWizard,
      gameProgress: defaultGameProgress,
      saveSlots: currentSaveSlots,
      currentSaveSlot: newSaveUuid,
      version: 3  // Version 3 for save slot isolation
    };

    // Update the state
    set({ gameState: newGameState });

    // Save the new game
    try {
      localStorage.setItem(`wizardsChoice_save_${newSaveUuid}`, JSON.stringify(newGameState));
      console.log(`New game initialized with UUID ${newSaveUuid} in slot ${slotId}`);

      // Verify the save slot data
      const savedData = localStorage.getItem(`wizardsChoice_save_${newSaveUuid}`);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const savedSlot = parsedData.saveSlots.find((slot: SaveSlot) => slot.saveUuid === newSaveUuid);
        if (savedSlot) {
          console.log(`Verified save slot data: ${savedSlot.playerName}, Level ${savedSlot.level}`);
          console.log(`Player data: ${savedSlot.player ? 'Present' : 'Missing'}`);
          console.log(`Game progress data: ${savedSlot.gameProgress ? 'Present' : 'Missing'}`);
        }
      }
    } catch (error) {
      console.error('Failed to save new game:', error);
    }
  },

  resetState: async () => {
    // Reset to a default state with empty save slots
    const initialGameState = await getInitialGameState('', 0);

    // Reset all save slots to empty with new UUIDs
    initialGameState.saveSlots = Array(3).fill(null).map((_, i) => ({
      id: i,
      saveUuid: uuidv4(),
      playerName: '',
      level: 0,
      lastSaved: '',
      isEmpty: true
    }));

    // Set currentSaveSlot to the UUID of the first slot
    initialGameState.currentSaveSlot = initialGameState.saveSlots[0].saveUuid;

    // Clear all localStorage entries for save slots
    try {
      // Remove everything related to the game
      localStorage.clear();

      console.log('All save data has been cleared from localStorage');
    } catch (error) {
      console.error('Failed to clear save data:', error);
    }

    // Update the store state with empty save slots
    set(() => ({
      gameState: initialGameState
    }));

    console.log('Game state has been reset with empty save slots');
  },

  updateSaveSlot: (saveUuid, data) => {
    set((state: any) => {
      const saveSlots = [...state.gameState.saveSlots];
      const slotIndex = findSlotIndexByUuid(saveSlots, saveUuid);

      if (slotIndex === -1) {
        console.error(`Failed to update save slot: no slot found with UUID ${saveUuid}`);
        return state;
      }

      // Update the specified save slot
      saveSlots[slotIndex] = {
        ...saveSlots[slotIndex],
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

  deleteSaveSlot: (saveUuid) => {
    set((state: any) => {
      const saveSlots = [...state.gameState.saveSlots];
      const slotIndex = findSlotIndexByUuid(saveSlots, saveUuid);

      if (slotIndex === -1) {
        console.error(`Failed to delete save slot: no slot found with UUID ${saveUuid}`);
        return state;
      }

      // Reset the specified save slot but keep its ID
      const slotId = saveSlots[slotIndex].id;
      saveSlots[slotIndex] = {
        id: slotId,
        saveUuid: uuidv4(),  // Generate a new UUID for the empty slot
        playerName: '',
        level: 0,
        lastSaved: '',
        isEmpty: true
      };

      // Remove from localStorage
      try {
        // Remove both old and new format
        localStorage.removeItem(`wizardsChoice_saveSlot_${slotId}`);
        localStorage.removeItem(`wizardsChoice_save_${saveUuid}`);
        console.log(`Save data with UUID ${saveUuid} deleted`);
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

  setCurrentSaveSlot: (saveUuid) => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        currentSaveSlot: saveUuid
      }
    }));
  },

  findSlotIndexByUuid: (saveUuid) => {
    const saveSlots = get().gameState.saveSlots;
    return findSlotIndexByUuid(saveSlots, saveUuid);
  },

  migrateSaveData: () => {
    set((state: any) => {
      const gameState = state.gameState;

      // Skip if already migrated
      if (gameState.version === 2) {
        console.log('Save data already in version 2 format');
        return state;
      }

      // Migrate the data
      const migratedState = migrateOldSaveData(gameState);

      console.log('Save data migrated to version 2');
      return { gameState: migratedState };
    });
  },

  loadAllSaveSlots: () => {
    // Get all localStorage keys
    const allKeys = Object.keys(localStorage);

    // Filter for save keys in the new format
    const saveKeys = allKeys.filter(key => key.startsWith('wizardsChoice_save_'));

    if (saveKeys.length === 0) {
      console.log('No save slots found in localStorage');
      return;
    }

    console.log(`Found ${saveKeys.length} save slots in localStorage`);

    // Get the current game state
    const currentGameState = get().gameState;
    const currentSaveSlots = [...currentGameState.saveSlots];

    // Load each save slot
    let updatedSaveSlots = false;

    saveKeys.forEach(key => {
      try {
        // Extract the UUID from the key
        const saveUuid = key.replace('wizardsChoice_save_', '');

        // Load the save data
        const saveDataString = localStorage.getItem(key);
        if (saveDataString) {
          const saveData = JSON.parse(saveDataString);

          // Check if migration is needed
          let processedSaveData = saveData;
          if (!processedSaveData.version || processedSaveData.version < 3) {
            // Migrate from version 2 to version 3 if needed
            if (processedSaveData.version === 2 && processedSaveData.player && processedSaveData.gameProgress) {
              console.log(`Migrating save data for UUID ${saveUuid} to version 3...`);

              // Find the slot for this UUID
              const slotIndex = findSlotIndexByUuid(processedSaveData.saveSlots, saveUuid);
              if (slotIndex !== -1) {
                // Update the save slot with player and gameProgress data
                processedSaveData.saveSlots[slotIndex] = {
                  ...processedSaveData.saveSlots[slotIndex],
                  player: processedSaveData.player,
                  gameProgress: processedSaveData.gameProgress
                };

                // Update version
                processedSaveData.version = 3;

                // Save the migrated data
                localStorage.setItem(key, JSON.stringify(processedSaveData));
                console.log(`Migrated save data to version 3 for UUID ${saveUuid}`);
              }
            } else {
              // For older versions, use the general migration function
              processedSaveData = migrateOldSaveData(processedSaveData);
              localStorage.setItem(key, JSON.stringify(processedSaveData));
            }
          }

          // Find the slot in the save data that matches this UUID
          const saveSlot = processedSaveData.saveSlots.find((slot: SaveSlot) => slot.saveUuid === saveUuid);

          if (saveSlot) {
            // Find the corresponding slot in the current save slots
            const slotIndex = currentSaveSlots.findIndex(slot => slot.id === saveSlot.id);

            if (slotIndex !== -1) {
              // Update the slot in the current save slots
              currentSaveSlots[slotIndex] = saveSlot;
              updatedSaveSlots = true;
              console.log(`Loaded save slot ${saveSlot.id} with UUID ${saveUuid}`);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to load save slot from key ${key}:`, error);
      }
    });

    // Update the game state if any save slots were updated
    if (updatedSaveSlots) {
      set((state: any) => {
        // Get the current save UUID
        const currentSaveUuid = state.gameState.currentSaveSlot;

        // Find the current save slot
        const currentSlot = currentSaveSlots.find(slot => slot.saveUuid === currentSaveUuid);

        return {
          gameState: {
            ...state.gameState,
            // Update the top-level player and gameProgress with the current save slot's data
            // for backward compatibility
            player: currentSlot?.player || state.gameState.player,
            gameProgress: currentSlot?.gameProgress || state.gameState.gameProgress,
            saveSlots: currentSaveSlots,
            version: 3
          }
        };
      });
      console.log('Updated game state with all save slots from localStorage');
    }
  }
});