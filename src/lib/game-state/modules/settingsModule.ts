// src/lib/game-state/modules/settingsModule.ts
// Game settings management

import { GameSettings } from '../../types/game-types';

// Define the slice of state this module manages
export interface SettingsState {
  settings: GameSettings;
}

// Define the actions this module provides
export interface SettingsActions {
  updateSettings: (settings: Partial<GameSettings>) => void;
  setDifficulty: (difficulty: 'easy' | 'normal' | 'hard') => void;
  toggleSound: () => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  toggleColorblindMode: () => void;
  setUiScale: (scale: number) => void;
  setTheme: (theme: 'default' | 'dark' | 'light' | 'highContrast') => void;
  getSettings: () => GameSettings;
}

// Create the module
export const createSettingsModule = (set: Function, get: Function): SettingsActions => ({
  updateSettings: (settings) => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        settings: {
          ...state.gameState.settings,
          ...settings
        }
      }
    }));
  },

  setDifficulty: (difficulty) => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        settings: {
          ...state.gameState.settings,
          difficulty
        }
      }
    }));
  },

  toggleSound: () => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        settings: {
          ...state.gameState.settings,
          soundEnabled: !state.gameState.settings.soundEnabled
        }
      }
    }));
  },

  setMusicVolume: (volume) => {
    // Ensure volume is between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        settings: {
          ...state.gameState.settings,
          musicVolume: clampedVolume
        }
      }
    }));
  },

  setSfxVolume: (volume) => {
    // Ensure volume is between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        settings: {
          ...state.gameState.settings,
          sfxVolume: clampedVolume
        }
      }
    }));
  },

  toggleColorblindMode: () => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        settings: {
          ...state.gameState.settings,
          colorblindMode: !state.gameState.settings.colorblindMode
        }
      }
    }));
  },

  setUiScale: (scale) => {
    // Ensure scale is between 0.5 and 2
    const clampedScale = Math.max(0.5, Math.min(2, scale));
    
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        settings: {
          ...state.gameState.settings,
          uiScale: clampedScale
        }
      }
    }));
  },

  setTheme: (theme) => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        settings: {
          ...state.gameState.settings,
          theme
        }
      }
    }));
  },

  getSettings: () => {
    return get().gameState.settings;
  }
}); 