import { openDB, DBSchema } from 'idb';
import { GameState, User } from '../types';

interface WizardsChoiceDB extends DBSchema {
  gameStates: {
    key: string; // userId
    value: {
      userId: string;
      gameState: GameState;
      lastUpdated: string;
    };
  };
  users: {
    key: string; // userId
    value: User & { password: string };
  };
}

// Only initialize the database on the client side
const dbPromise = typeof window !== 'undefined' 
  ? openDB<WizardsChoiceDB>('wizards-choice-db', 1, {
      upgrade(db) {
        // Create a store for game states
        if (!db.objectStoreNames.contains('gameStates')) {
          db.createObjectStore('gameStates', { keyPath: 'userId' });
        }
        
        // Create a store for users
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
      },
    })
  : null;

export const dbService = {
  /**
   * Save a user's game state
   * @param userId The user ID
   * @param gameState The game state to save
   */
  saveGameState: async (userId: string, gameState: GameState): Promise<void> => {
    if (!dbPromise) return;
    const db = await dbPromise;
    try {
      await db.put('gameStates', {
        userId,
        gameState,
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      // Handle or log error
    }
  },
  
  /**
   * Load a user's game state
   * @param userId The user ID
   * @returns The user's game state, or null if not found
   */
  loadGameState: async (userId: string): Promise<GameState | null> => {
    if (!dbPromise) return null;
    const db = await dbPromise;
    const result = await db.get('gameStates', userId);
    return result ? result.gameState : null;
  },
  
  /**
   * Save a user
   * @param user The user to save
   */
  saveUser: async (user: User & { password: string }): Promise<void> => {
    if (!dbPromise) return;
    const db = await dbPromise;
    try {
      await db.put('users', user);
    } catch (err) {
      // Handle or log error
    }
  },
  
  /**
   * Get a user by ID
   * @param userId The user ID
   * @returns The user, or null if not found
   */
  getUser: async (userId: string): Promise<(User & { password: string }) | null> => {
    if (!dbPromise) return null;
    const db = await dbPromise;
    return await db.get('users', userId);
  },
  
  /**
   * Get a user by username
   * @param username The username
   * @returns The user, or null if not found
   */
  getUserByUsername: async (username: string): Promise<(User & { password: string }) | null> => {
    if (!dbPromise) return null;
    const db = await dbPromise;
    const users = await db.getAll('users');
    return users.find(user => user.username === username) || null;
  },
  
  /**
   * Get all users
   * @returns All users
   */
  getAllUsers: async (): Promise<(User & { password: string })[]> => {
    if (!dbPromise) return [];
    const db = await dbPromise;
    return await db.getAll('users');
  },
  
  /**
   * Delete a user
   * @param userId The user ID
   */
  deleteUser: async (userId: string): Promise<void> => {
    if (!dbPromise) return;
    const db = await dbPromise;
    try {
      await db.delete('users', userId);
    } catch (err) {
      // Handle or log error
    }
  }
};

export default dbService; 