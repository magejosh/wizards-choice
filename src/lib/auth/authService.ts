// src/lib/auth/authService.ts
import { User, GameState } from '../types';
import { useGameStateStore } from '../game-state/gameStateStore';
import bcryptjs from 'bcryptjs';
import dbService from '../storage/dbService';

// Demo user data for initial setup
const DEMO_USERS = [
  {
    id: 'admin',
    username: 'admin',
    password: 'admin123', // Will be hashed during initialization
    isAdmin: true,
    email: 'admin@wizardschoice.com'
  },
  {
    id: 'player1',
    username: 'player1',
    password: 'player123',
    isAdmin: false,
    email: 'player1@example.com'
  },
  {
    id: 'player2',
    username: 'player2',
    password: 'player123',
    isAdmin: false,
    email: 'player2@example.com'
  }
];

// In-memory cache for current user
let currentUser: User | null = null;

// Initialize the database with demo users
const initializeDemoUsers = async () => {
  const users = await dbService.getAllUsers();
  
  // If no users exist, add the demo users
  if (users.length === 0) {
    for (const user of DEMO_USERS) {
      // Hash the password
      const hashedPassword = await bcryptjs.hash(user.password, 10);
      
      // Save user with hashed password
      await dbService.saveUser({
        ...user,
        password: hashedPassword
      });
    }
  }
};

// Only run initialization on the client side
if (typeof window !== 'undefined') {
  // Run initialization
  initializeDemoUsers().catch(console.error);
}

export const authService = {
  /**
   * Login a user with username and password
   * @param username User's username
   * @param password User's password
   * @returns User object if login successful, null otherwise
   */
  login: async (username: string, password: string): Promise<User | null> => {
    // Find user by username
    const user = await dbService.getUserByUsername(username);
    
    // Check if user exists and password matches
    if (user && await bcryptjs.compare(password, user.password)) {
      // Create a copy without the password for security
      const { password, ...userWithoutPassword } = user;
      currentUser = userWithoutPassword;
      
      // Reset the game state store
      const gameStore = useGameStateStore.getState();
      await gameStore.resetState();
      
      // Load user's game state if it exists
      const savedGameState = await dbService.loadGameState(user.id);
      if (savedGameState) {
        // Set the loaded game state in the store
        useGameStateStore.setState({ gameState: savedGameState });
      }
      
      // Store in localStorage for persistence across page refreshes
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
      
      return currentUser;
    }
    
    return null;
  },
  
  /**
   * Register a new user
   * @param username User's username
   * @param password User's password
   * @param email User's email
   * @returns User object if registration successful, null otherwise
   */
  register: async (username: string, password: string, email: string): Promise<User | null> => {
    // Check if username already exists
    const existingUser = await dbService.getUserByUsername(username);
    if (existingUser) {
      return null;
    }
    
    // Hash the password
    const hashedPassword = await bcryptjs.hash(password, 10);
    
    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      username,
      password: hashedPassword,
      isAdmin: false,
      email
    };
    
    // Save the new user
    await dbService.saveUser(newUser);
    
    // Login the new user (this will also initialize their game state)
    return authService.login(username, password);
  },
  
  /**
   * Logout the current user
   */
  logout: async (): Promise<void> => {
    // Save current game state before logout
    if (currentUser) {
      const gameState = useGameStateStore.getState().gameState;
      if (gameState) {
        await dbService.saveGameState(currentUser.id, gameState);
      }
    }
    
    currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
    }
    
    // Reset game state to initial values
    await useGameStateStore.getState().resetState();
  },
  
  /**
   * Get the current logged in user
   * @returns Current user or null if not logged in
   */
  getCurrentUser: (): User | null => {
    // Check localStorage first
    if (!currentUser && typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          currentUser = JSON.parse(storedUser);
        } catch (e) {
          console.error('Error parsing stored user:', e);
        }
      }
    }
    return currentUser;
  },
  
  /**
   * Check if user is logged in
   * @returns true if user is logged in, false otherwise
   */
  isLoggedIn: (): boolean => {
    return !!authService.getCurrentUser();
  },
  
  /**
   * Check if current user is an admin
   * @returns true if user is admin, false otherwise
   */
  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user ? user.isAdmin : false;
  },
  
  /**
   * Save game state for current user
   */
  saveGameState: async (): Promise<void> => {
    const user = authService.getCurrentUser();
    if (!user) return;
    
    const gameState = useGameStateStore.getState().gameState;
    await dbService.saveGameState(user.id, gameState);
    
    // Also use the store's save function
    useGameStateStore.getState().saveGame();
  },
  
  /**
   * Load game state for current user
   * @returns Game state if found, null otherwise
   */
  loadGameState: async (): Promise<GameState | null> => {
    const user = authService.getCurrentUser();
    if (!user) return null;
    
    const gameState = await dbService.loadGameState(user.id);
    
    if (gameState) {
      // Update the store with the loaded game state
      useGameStateStore.setState({ gameState });
    }
    
    return gameState;
  },
  
  /**
   * Get all users (admin only)
   * @returns Array of users without passwords if current user is admin, empty array otherwise
   */
  getAllUsers: async (): Promise<Partial<User>[]> => {
    if (!authService.isAdmin()) return [];
    
    const users = await dbService.getAllUsers();
    return users.map(({ password, ...user }) => user);
  },
  
  /**
   * Reset a user's password (admin only)
   * @param userId User ID to reset password for
   * @param newPassword New password
   * @returns true if successful, false otherwise
   */
  resetUserPassword: async (userId: string, newPassword: string): Promise<boolean> => {
    if (!authService.isAdmin()) return false;
    
    const user = await dbService.getUser(userId);
    if (!user) return false;
    
    // Hash the new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    
    // Update the user's password
    await dbService.saveUser({
      ...user,
      password: hashedPassword
    });
    
    return true;
  }
};

export default authService;
