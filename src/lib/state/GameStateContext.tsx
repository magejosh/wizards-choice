import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { 
  PlayerStats, 
  Achievement, 
  PlayerTitle, 
  BattleRecord 
} from '../types';

// State interface
export interface GameState {
  playerName: string;
  playerStats: PlayerStats;
  achievements: Achievement[];
  battleHistory: BattleRecord[];
  titles: PlayerTitle[];
  equippedTitleId: string | null;
}

// Action types
type GameStateAction = 
  | { type: 'UPDATE_PLAYER_STATS'; payload: Partial<PlayerStats> }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'ADD_BATTLE_RECORD'; payload: BattleRecord }
  | { type: 'UNLOCK_TITLE'; payload: string }
  | { type: 'EQUIP_TITLE'; payload: string }
  | { type: 'EXPORT_PROFILE' }
  | { type: 'IMPORT_PROFILE'; payload: GameState };

// Initial state
const initialStats: PlayerStats = {
  level: 1,
  experience: 0,
  currentHealth: 100,
  maxHealth: 100,
  mana: 50,
  gold: 100,
  chaptersCompleted: 0,
  totalChoicesMade: 0,
  totalGameTime: 0,
  gameStartDate: new Date().toISOString(),
  battlesWon: 0,
  battlesLost: 0,
  totalDamageDealt: 0,
  achievementsUnlocked: 0,
  totalAchievements: 0,
  mostRecentAchievement: null,
  titlesUnlocked: 0,
  totalTitles: 0,
  currentTitle: null,
  itemsCollected: 0,
  spellsLearned: 0,
  potionsUsed: 0
};

const initialState: GameState = {
  playerName: 'Apprentice',
  playerStats: initialStats,
  achievements: [],
  battleHistory: [],
  titles: [],
  equippedTitleId: null
};

// Reducer function
function gameStateReducer(state: GameState, action: GameStateAction): GameState {
  switch (action.type) {
    case 'UPDATE_PLAYER_STATS':
      return {
        ...state,
        playerStats: {
          ...state.playerStats,
          ...action.payload
        }
      };
      
    case 'UNLOCK_ACHIEVEMENT': {
      const achievementId = action.payload;
      const updatedAchievements = state.achievements.map(achievement => {
        if (achievement.id === achievementId && !achievement.unlocked) {
          return {
            ...achievement,
            unlocked: true,
            unlockedDate: new Date().toISOString(),
            currentProgress: achievement.requiredProgress
          };
        }
        return achievement;
      });
      
      // Count unlocked achievements
      const unlockedCount = updatedAchievements.filter(a => a.unlocked).length;
      
      // Get name of the most recently unlocked achievement
      const unlockedAchievement = updatedAchievements.find(a => a.id === achievementId);
      
      return {
        ...state,
        achievements: updatedAchievements,
        playerStats: {
          ...state.playerStats,
          achievementsUnlocked: unlockedCount,
          mostRecentAchievement: unlockedAchievement?.name || state.playerStats.mostRecentAchievement
        }
      };
    }
      
    case 'ADD_BATTLE_RECORD': {
      const newBattleRecord = action.payload;
      const isVictory = newBattleRecord.outcome === 'victory';
      
      // Update battle stats
      const updatedStats = {
        ...state.playerStats,
        battlesWon: isVictory ? state.playerStats.battlesWon + 1 : state.playerStats.battlesWon,
        battlesLost: !isVictory ? state.playerStats.battlesLost + 1 : state.playerStats.battlesLost,
        totalDamageDealt: state.playerStats.totalDamageDealt + newBattleRecord.damageDealt
      };
      
      return {
        ...state,
        battleHistory: [newBattleRecord, ...state.battleHistory],
        playerStats: updatedStats
      };
    }
      
    case 'UNLOCK_TITLE': {
      const titleId = action.payload;
      const updatedTitles = state.titles.map(title => {
        if (title.id === titleId && !title.unlocked) {
          return {
            ...title,
            unlocked: true,
            unlockedDate: new Date().toISOString()
          };
        }
        return title;
      });
      
      // Count unlocked titles
      const unlockedCount = updatedTitles.filter(t => t.unlocked).length;
      
      return {
        ...state,
        titles: updatedTitles,
        playerStats: {
          ...state.playerStats,
          titlesUnlocked: unlockedCount
        }
      };
    }
      
    case 'EQUIP_TITLE': {
      const titleId = action.payload;
      const title = state.titles.find(t => t.id === titleId);
      
      if (!title || !title.unlocked) {
        return state;
      }
      
      return {
        ...state,
        equippedTitleId: titleId,
        playerStats: {
          ...state.playerStats,
          currentTitle: title.name
        }
      };
    }
      
    case 'IMPORT_PROFILE':
      return action.payload;
      
    default:
      return state;
  }
}

// Context
interface GameStateContextType {
  state: GameState;
  actions: {
    updatePlayerStats: (stats: Partial<PlayerStats>) => void;
    unlockAchievement: (achievementId: string) => void;
    addBattleRecord: (record: BattleRecord) => void;
    unlockTitle: (titleId: string) => void;
    equipTitle: (titleId: string) => void;
    importProfile: (data: GameState) => void;
    saveProfileData: () => void;
    loadProfileData: (userId: string, saveId: string) => Promise<void>;
  };
}

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

// Provider component
interface GameStateProviderProps {
  children: ReactNode;
  initialStateOverride?: Partial<GameState>;
}

export const GameStateProvider: React.FC<GameStateProviderProps> = ({ 
  children, 
  initialStateOverride 
}) => {
  const [state, dispatch] = useReducer(
    gameStateReducer, 
    { ...initialState, ...initialStateOverride }
  );
  
  const actions = {
    updatePlayerStats: (stats: Partial<PlayerStats>) => 
      dispatch({ type: 'UPDATE_PLAYER_STATS', payload: stats }),
      
    unlockAchievement: (achievementId: string) => 
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievementId }),
      
    addBattleRecord: (record: BattleRecord) => 
      dispatch({ type: 'ADD_BATTLE_RECORD', payload: record }),
      
    unlockTitle: (titleId: string) => 
      dispatch({ type: 'UNLOCK_TITLE', payload: titleId }),
      
    equipTitle: (titleId: string) => 
      dispatch({ type: 'EQUIP_TITLE', payload: titleId }),
      
    importProfile: (data: GameState) => 
      dispatch({ type: 'IMPORT_PROFILE', payload: data }),
      
    saveProfileData: () => {
      // Get the current save ID from localStorage or default to 'autosave'
      const currentUser = localStorage.getItem('currentUser') || 'defaultUser';
      const saveId = localStorage.getItem('currentSaveId') || 'autosave';
      
      // Create a save key using user and save ID
      const saveKey = `wizard_choice_${currentUser}_${saveId}_profile`;
      
      // Save to localStorage
      localStorage.setItem(saveKey, JSON.stringify(state));
      
      console.log(`Profile data saved for user ${currentUser}, save ${saveId}`);
    },
    
    loadProfileData: async (userId: string, saveId: string) => {
      // Create a save key using user and save ID
      const saveKey = `wizard_choice_${userId}_${saveId}_profile`;
      
      // Try to load from localStorage
      const savedData = localStorage.getItem(saveKey);
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData) as GameState;
          dispatch({ type: 'IMPORT_PROFILE', payload: parsedData });
          console.log(`Profile data loaded for user ${userId}, save ${saveId}`);
        } catch (error) {
          console.error('Error parsing saved profile data:', error);
          // If there's an error, we'll just use the default state
          console.log('Using default profile data');
        }
      } else {
        console.log(`No saved profile data found for user ${userId}, save ${saveId}`);
        // If no saved data, we'll just use the default state
      }
    }
  };
  
  return (
    <GameStateContext.Provider value={{ state, actions }}>
      {children}
    </GameStateContext.Provider>
  );
};

// Custom hook for using the context
export const useGameState = (): GameStateContextType => {
  const context = useContext(GameStateContext);
  
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  
  return context;
}; 