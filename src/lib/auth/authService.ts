// src/lib/auth/authService.ts
import { User, GameState } from '../types';
import { useGameStateStore } from '../game-state/gameStateStore';

// Simulated user database for local development and testing
const DEMO_USERS = [
  {
    id: 'admin',
    username: 'admin',
    password: 'admin123', // In a real app, this would be hashed
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

// In-memory storage for user sessions
let currentUser: User | null = null;
let userGameStates: Record<string, GameState[]> = {};

// Initialize with some demo data
DEMO_USERS.forEach(user => {
  userGameStates[user.id] = [];
});

export const authService = {
  /**
   * Login a user with username and password
   * @param username User's username
   * @param password User's password
   * @returns User object if login successful, null otherwise
   */
  login: (username: string, password: string): User | null => {
    const user = DEMO_USERS.find(
      u => u.username === username && u.password === password
    );
    
    if (user) {
      // Create a copy without the password for security
      const { password, ...userWithoutPassword } = user;
      currentUser = userWithoutPassword as User;
      
      // Load user's game states
      const gameStates = userGameStates[user.id] || [];
      useGameStateStore.getState().loadSaveSlots(gameStates);
      
      // Store in localStorage for persistence across page refreshes
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      
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
  register: (username: string, password: string, email: string): User | null => {
    // Check if username already exists
    if (DEMO_USERS.some(u => u.username === username)) {
      return null;
    }
    
    // Create new user
    const newUser = {
      id: `user_${Date.now()}`,
      username,
      password,
      isAdmin: false,
      email
    };
    
    // Add to demo users
    DEMO_USERS.push(newUser);
    
    // Initialize game states
    userGameStates[newUser.id] = [];
    
    // Login the new user
    return authService.login(username, password);
  },
  
  /**
   * Logout the current user
   */
  logout: (): void => {
    // Save current game state before logout
    if (currentUser) {
      const gameStates = useGameStateStore.getState().saveSlots;
      userGameStates[currentUser.id] = gameStates;
    }
    
    currentUser = null;
    localStorage.removeItem('currentUser');
    useGameStateStore.getState().resetState();
  },
  
  /**
   * Get the current logged in user
   * @returns Current user or null if not logged in
   */
  getCurrentUser: (): User | null => {
    // Check localStorage first
    if (!currentUser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        currentUser = JSON.parse(storedUser);
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
   * @param gameState Game state to save
   * @param slotIndex Save slot index
   */
  saveGameState: (gameState: GameState, slotIndex: number): void => {
    if (!currentUser) return;
    
    const gameStates = [...(userGameStates[currentUser.id] || [])];
    gameStates[slotIndex] = gameState;
    userGameStates[currentUser.id] = gameStates;
    
    // Also update the store
    useGameStateStore.getState().saveGame(gameState, slotIndex);
  },
  
  /**
   * Load game state for current user
   * @param slotIndex Save slot index to load
   * @returns Game state if found, null otherwise
   */
  loadGameState: (slotIndex: number): GameState | null => {
    if (!currentUser) return null;
    
    const gameStates = userGameStates[currentUser.id] || [];
    return gameStates[slotIndex] || null;
  },
  
  /**
   * Get all users (admin only)
   * @returns Array of users without passwords if current user is admin, empty array otherwise
   */
  getAllUsers: (): Partial<User>[] => {
    if (!authService.isAdmin()) return [];
    
    return DEMO_USERS.map(({ password, ...user }) => user);
  },
  
  /**
   * Reset a user's password (admin only)
   * @param userId User ID to reset password for
   * @param newPassword New password
   * @returns true if successful, false otherwise
   */
  resetUserPassword: (userId: string, newPassword: string): boolean => {
    if (!authService.isAdmin()) return false;
    
    const userIndex = DEMO_USERS.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;
    
    DEMO_USERS[userIndex].password = newPassword;
    return true;
  }
};

export default authService;
