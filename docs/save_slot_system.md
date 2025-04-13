# Save Slot System Technical Design

## Overview

The save slot system allows players to maintain multiple separate game instances, each with its own character, progress, and game state. This document outlines the technical design for implementing a robust save slot system that ensures complete data isolation between save slots.

## Data Structure

### SaveSlot Interface

```typescript
export interface SaveSlot {
  id: number;                 // Slot number (0, 1, 2, etc.)
  saveUuid: string;           // Unique identifier for the save slot
  playerName: string;         // Character name
  level: number;              // Character level
  lastSaved: string;          // ISO timestamp of last save
  isEmpty: boolean;           // Whether the slot is empty
  player: Wizard;             // Player character data
  gameProgress: GameProgress; // Game progress data
}
```

### GameState Interface

```typescript
export interface GameState {
  settings: GameSettings;           // Game settings
  saveSlots: SaveSlot[];            // Array of save slots
  currentSaveSlot: string;          // UUID of the current save slot
  markets: MarketLocation[];        // Market data
  marketData: MarketData;           // Market transaction history
  notifications: GameNotification[]; // Game notifications
  version: number;                  // Save data version
  
  // Legacy properties for backward compatibility
  player?: Wizard;                  // Reference to current save slot's player
  gameProgress?: GameProgress;      // Reference to current save slot's gameProgress
}
```

## Core Functions

### Accessor Functions

These functions provide access to the current save slot's data:

```typescript
// Get the current save slot
export const getCurrentSaveSlot = (): SaveSlot | undefined => {
  const state = useGameStateStore.getState().gameState;
  const currentSaveUuid = state.currentSaveSlot;
  return state.saveSlots.find(slot => slot.saveUuid === currentSaveUuid);
};

// Get the current player data
export const getWizard = (): Wizard | undefined => {
  const currentSlot = getCurrentSaveSlot();
  return currentSlot?.player || useGameStateStore.getState().gameState.player;
};

// Get the current game progress data
export const getGameProgress = (): GameProgress | undefined => {
  const currentSlot = getCurrentSaveSlot();
  return currentSlot?.gameProgress || useGameStateStore.getState().gameState.gameProgress;
};
```

### Modifier Functions

These functions update both the save slot data and the top-level references:

```typescript
// Update the player data
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

// Update the game progress data
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
```

## Save/Load Functions

### saveGame

```typescript
saveGame: () => {
  set((state: any) => {
    const gameState = state.gameState;
    const currentSaveUuid = gameState.currentSaveSlot;
    const saveSlots = [...gameState.saveSlots];
    
    // Find the current save slot
    const slotIndex = findSlotIndexByUuid(saveSlots, currentSaveUuid);
    if (slotIndex === -1) return state;
    
    // Update the current save slot
    saveSlots[slotIndex] = {
      ...saveSlots[slotIndex],
      lastSaved: new Date().toISOString(),
      isEmpty: false,
      player: gameState.player,
      gameProgress: gameState.gameProgress
    };
    
    // Create updated game state
    const updatedGameState = {
      ...gameState,
      saveSlots,
      version: 3
    };
    
    // Save to localStorage
    localStorage.setItem(`wizardsChoice_save_${currentSaveUuid}`, JSON.stringify(updatedGameState));
    
    return { gameState: updatedGameState };
  });
}
```

### loadGame

```typescript
loadGame: (saveUuid) => {
  try {
    // Load save data from localStorage
    const saveDataString = localStorage.getItem(`wizardsChoice_save_${saveUuid}`);
    if (!saveDataString) return false;
    
    const saveData = JSON.parse(saveDataString);
    
    // Find the save slot
    const slotIndex = findSlotIndexByUuid(saveData.saveSlots, saveUuid);
    if (slotIndex === -1) return false;
    
    // Get the save slot data
    const loadedSaveSlot = saveData.saveSlots[slotIndex];
    
    // Update the game state
    set({
      gameState: {
        ...saveData,
        player: loadedSaveSlot.player,
        gameProgress: loadedSaveSlot.gameProgress,
        currentSaveSlot: saveUuid
      }
    });
    
    return true;
  } catch (error) {
    console.error('Failed to load game:', error);
    return false;
  }
}
```

## Migration Strategy

1. Update the SaveSlot interface to include player and gameProgress data
2. Create accessor and modifier functions for player and gameProgress data
3. Update all state-modifying functions to use the new modifier functions
4. Implement migration code to convert old save data to the new format
5. Update the version number to track migration status

## Implementation Plan

1. Update the data structures (SaveSlot and GameState interfaces)
2. Implement the accessor and modifier functions
3. Update the save/load functions to handle the new data structure
4. Implement migration code for existing save data
5. Update all state-modifying functions to use the new modifier functions
6. Test the system with multiple save slots

## Backward Compatibility

To maintain backward compatibility with existing code:

1. Keep the top-level player and gameProgress properties in the GameState interface
2. Update these properties whenever the save slot data is updated
3. Ensure the accessor functions fall back to the top-level properties if the save slot data is not available
4. Gradually update all code to use the new accessor and modifier functions

## Testing

Test cases should include:

1. Creating multiple save slots with different characters
2. Switching between save slots and verifying data isolation
3. Modifying player and game progress data and verifying changes are saved correctly
4. Loading older save formats and verifying migration works correctly
5. Testing backward compatibility with existing code
