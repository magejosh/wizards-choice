// src/lib/game-state/modules/progressModule.ts
// Game progress management

import { GameProgress } from '../../types/game-types';
import { Achievement, BattleRecord, PlayerTitle } from '../../types/achievement-types';

// Define the slice of state this module manages
export interface ProgressState {
  gameProgress: GameProgress;
}

// Define the actions this module provides
export interface ProgressActions {
  updateGameProgress: (progress: Partial<GameProgress>) => void;
  setCurrentLocation: (location: 'wizardStudy' | 'duel' | 'levelUp' | 'market') => void;
  addDefeatedEnemy: (enemyId: string) => void;
  addUnlockedSpell: (spellId: string) => void;
  updateQuestProgress: (questId: string, progress: any) => void;
  addAchievement: (achievement: Achievement) => void;
  updateAchievement: (achievementId: string, update: Partial<Achievement>) => void;
  addPlayerTitle: (title: PlayerTitle) => void;
  unlockPlayerTitle: (titleId: string) => void;
  equipPlayerTitle: (titleId: string) => void;
  unequipPlayerTitle: (titleId: string) => void;
  addBattleRecord: (record: BattleRecord) => void;
  updatePlayerStats: (statName: string, value: number, operation?: 'add' | 'set') => void;
  discoverRecipe: (recipeId: string) => void;
  craftRecipe: (recipeId: string) => void;
}

// Create the module
export const createProgressModule = (set: Function, get: Function): ProgressActions => ({
  updateGameProgress: (progress) => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        gameProgress: {
          ...state.gameState.gameProgress,
          ...progress
        }
      }
    }));
  },

  setCurrentLocation: (location) => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        gameProgress: {
          ...state.gameState.gameProgress,
          currentLocation: location
        }
      }
    }));
  },

  addDefeatedEnemy: (enemyId) => {
    set((state: any) => {
      const defeatedEnemies = [...state.gameState.gameProgress.defeatedEnemies];
      
      // Only add if not already defeated
      if (!defeatedEnemies.includes(enemyId)) {
        defeatedEnemies.push(enemyId);
      }
      
      return {
        gameState: {
          ...state.gameState,
          gameProgress: {
            ...state.gameState.gameProgress,
            defeatedEnemies
          }
        }
      };
    });
  },

  addUnlockedSpell: (spellId) => {
    set((state: any) => {
      const unlockedSpells = [...state.gameState.gameProgress.unlockedSpells];
      
      // Only add if not already unlocked
      if (!unlockedSpells.includes(spellId)) {
        unlockedSpells.push(spellId);
      }
      
      return {
        gameState: {
          ...state.gameState,
          gameProgress: {
            ...state.gameState.gameProgress,
            unlockedSpells
          }
        }
      };
    });
  },

  updateQuestProgress: (questId, progress) => {
    set((state: any) => {
      const questProgress = {
        ...state.gameState.gameProgress.questProgress,
        [questId]: progress
      };
      
      return {
        gameState: {
          ...state.gameState,
          gameProgress: {
            ...state.gameState.gameProgress,
            questProgress
          }
        }
      };
    });
  },

  addAchievement: (achievement) => {
    set((state: any) => {
      const achievements = [...(state.gameState.gameProgress.achievements || [])];
      
      // Check if achievement already exists
      const existingIndex = achievements.findIndex(a => a.id === achievement.id);
      
      if (existingIndex !== -1) {
        // Update existing achievement
        achievements[existingIndex] = {
          ...achievements[existingIndex],
          ...achievement
        };
      } else {
        // Add new achievement
        achievements.push(achievement);
      }
      
      return {
        gameState: {
          ...state.gameState,
          gameProgress: {
            ...state.gameState.gameProgress,
            achievements
          }
        }
      };
    });
  },

  updateAchievement: (achievementId, update) => {
    set((state: any) => {
      const achievements = [...(state.gameState.gameProgress.achievements || [])];
      
      // Find the achievement to update
      const index = achievements.findIndex(a => a.id === achievementId);
      
      if (index !== -1) {
        // Update the achievement
        achievements[index] = {
          ...achievements[index],
          ...update
        };
        
        return {
          gameState: {
            ...state.gameState,
            gameProgress: {
              ...state.gameState.gameProgress,
              achievements
            }
          }
        };
      }
      
      return state;
    });
  },

  addPlayerTitle: (title) => {
    set((state: any) => {
      const titles = [...(state.gameState.gameProgress.titles || [])];
      
      // Check if title already exists
      const existingIndex = titles.findIndex(t => t.id === title.id);
      
      if (existingIndex !== -1) {
        // Update existing title
        titles[existingIndex] = {
          ...titles[existingIndex],
          ...title
        };
      } else {
        // Add new title
        titles.push(title);
      }
      
      return {
        gameState: {
          ...state.gameState,
          gameProgress: {
            ...state.gameState.gameProgress,
            titles
          }
        }
      };
    });
  },

  unlockPlayerTitle: (titleId) => {
    set((state: any) => {
      const titles = [...(state.gameState.gameProgress.titles || [])];
      
      // Find the title to unlock
      const index = titles.findIndex(t => t.id === titleId);
      
      if (index !== -1) {
        // Unlock the title
        titles[index] = {
          ...titles[index],
          unlocked: true
        };
        
        return {
          gameState: {
            ...state.gameState,
            gameProgress: {
              ...state.gameState.gameProgress,
              titles
            }
          }
        };
      }
      
      return state;
    });
  },

  equipPlayerTitle: (titleId) => {
    set((state: any) => {
      const titles = [...(state.gameState.gameProgress.titles || [])];
      
      // Unequip all titles first
      const updatedTitles = titles.map(t => ({
        ...t,
        equipped: t.id === titleId
      }));
      
      return {
        gameState: {
          ...state.gameState,
          gameProgress: {
            ...state.gameState.gameProgress,
            titles: updatedTitles
          }
        }
      };
    });
  },

  unequipPlayerTitle: (titleId) => {
    set((state: any) => {
      const titles = [...(state.gameState.gameProgress.titles || [])];
      
      // Find the title to unequip
      const index = titles.findIndex(t => t.id === titleId);
      
      if (index !== -1) {
        // Unequip the title
        titles[index] = {
          ...titles[index],
          equipped: false
        };
        
        return {
          gameState: {
            ...state.gameState,
            gameProgress: {
              ...state.gameState.gameProgress,
              titles
            }
          }
        };
      }
      
      return state;
    });
  },

  addBattleRecord: (record) => {
    set((state: any) => {
      const battleHistory = [...(state.gameState.gameProgress.battleHistory || [])];
      
      // Add new battle record
      battleHistory.push(record);
      
      return {
        gameState: {
          ...state.gameState,
          gameProgress: {
            ...state.gameState.gameProgress,
            battleHistory
          }
        }
      };
    });
  },

  updatePlayerStats: (statName, value, operation = 'add') => {
    set((state: any) => {
      const playerStats = state.gameState.gameProgress.playerStats
        ? { ...state.gameState.gameProgress.playerStats }
        : {};
      
      // Handle nested stats (e.g., 'elementalDamage.fire')
      const parts = statName.split('.');
      
      if (parts.length === 1) {
        // Simple stat
        if (operation === 'add') {
          playerStats[statName] = (playerStats[statName] || 0) + value;
        } else {
          playerStats[statName] = value;
        }
      } else if (parts.length === 2) {
        // Nested stat (e.g., spellsCast.byType, elementalDamage.fire)
        const [parent, child] = parts;
        
        if (!playerStats[parent]) {
          if (parent === 'spellsCast') {
            playerStats[parent] = { total: 0, byType: {}, byElement: {} };
          } else if (parent === 'elementalDamage') {
            playerStats[parent] = {};
          } else {
            playerStats[parent] = {};
          }
        }
        
        if (operation === 'add') {
          playerStats[parent][child] = (playerStats[parent][child] || 0) + value;
        } else {
          playerStats[parent][child] = value;
        }
      }
      
      return {
        gameState: {
          ...state.gameState,
          gameProgress: {
            ...state.gameState.gameProgress,
            playerStats
          }
        }
      };
    });
  },

  discoverRecipe: (recipeId) => {
    set((state: any) => {
      const discoveredRecipes = [...(state.gameState.gameProgress.discoveredRecipes || [])];
      
      // Only add if not already discovered
      if (!discoveredRecipes.includes(recipeId)) {
        discoveredRecipes.push(recipeId);
      }
      
      // Update player stats
      const playerStats = state.gameState.gameProgress.playerStats
        ? {
            ...state.gameState.gameProgress.playerStats,
            recipesDiscovered: (state.gameState.gameProgress.playerStats.recipesDiscovered || 0) + 1
          }
        : undefined;
      
      return {
        gameState: {
          ...state.gameState,
          gameProgress: {
            ...state.gameState.gameProgress,
            discoveredRecipes,
            playerStats: playerStats || state.gameState.gameProgress.playerStats
          }
        }
      };
    });
  },

  craftRecipe: (recipeId) => {
    set((state: any) => {
      const craftedRecipes = [...(state.gameState.gameProgress.craftedRecipes || [])];
      
      // Only add if not already crafted
      if (!craftedRecipes.includes(recipeId)) {
        craftedRecipes.push(recipeId);
      }
      
      // Update player stats
      const playerStats = state.gameState.gameProgress.playerStats
        ? {
            ...state.gameState.gameProgress.playerStats,
            potionsCrafted: (state.gameState.gameProgress.playerStats.potionsCrafted || 0) + 1
          }
        : undefined;
      
      return {
        gameState: {
          ...state.gameState,
          gameProgress: {
            ...state.gameState.gameProgress,
            craftedRecipes,
            playerStats: playerStats || state.gameState.gameProgress.playerStats
          }
        }
      };
    });
  }
}); 