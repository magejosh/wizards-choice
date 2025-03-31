// src/hooks/useGameAuth.ts
import { useState, useCallback, useEffect } from 'react';
import { useGameStateStore } from '../lib/game-state/gameStateStore';
import authService from '../lib/auth/authService';

export function useGameAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const checkAuthStatus = useCallback(async () => {
    console.log("=== AUTH CHECK STARTED ===");
    setIsLoading(true);
    
    try {
      const isUserLoggedIn = authService.isLoggedIn();
      console.log("User logged in:", isUserLoggedIn);
      setIsAuthenticated(isUserLoggedIn);
      
      if (isUserLoggedIn) {
        console.log("Loading game state for logged in user");
        await authService.loadGameState();
        console.log("Game state loaded successfully");
      }
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      console.log("Setting loading state to false");
      setIsLoading(false);
      console.log("=== AUTH CHECK COMPLETED ===");
    }
  }, []);

  const handleLogout = async () => {
    console.log("=== LOGOUT STARTED ===");
    setIsLoading(true);
    try {
      await authService.logout();
      setIsAuthenticated(false);
      console.log("User logged out successfully");
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
      console.log("=== LOGOUT COMPLETED ===");
    }
  };
  
  return {
    isAuthenticated,
    isLoading,
    isInitialized,
    checkAuthStatus,
    handleLogout
  };
}