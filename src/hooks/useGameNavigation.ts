// src/hooks/useGameNavigation.ts
import { useRouter } from 'next/navigation';
import { useGameStateStore } from '../lib/game-state/gameStateStore';
import authService from '../lib/auth/authService';

export function useGameNavigation() {
  const router = useRouter();
  const { setCurrentLocation, saveGame } = useGameStateStore();
  
  const navigateToWizardStudy = () => {
    console.log('Explicitly navigating to Wizard Study');
    setCurrentLocation('wizardStudy');
    return true; // Return value to indicate navigation intent
  };
  
  const navigateToBattle = () => {
    console.log('Navigating to battle');
    setCurrentLocation('duel');
    router.push('/battle');
  };
  
  const navigateToMainMenu = async () => {
    console.log('Returning to main menu');
    try {
      await authService.saveGameState();
    } catch (error) {
      console.error('Error saving game state:', error);
    }
    return false; // Return value to indicate main menu
  };

  const handleBattleVictory = async () => {
    console.log('=== PROCESSING BATTLE VICTORY ===');
    try {
      // First update the game state location
      console.log('DEBUG: Setting location to wizardStudy');
      setCurrentLocation('wizardStudy');
      
      // Then save the game state
      console.log('DEBUG: Saving game state');
      await saveGame();
      console.log('DEBUG: Game state saved successfully');
      
      // Use a custom localStorage flag to force wizard study view
      // This approach is more resilient than URL params
      if (typeof window !== 'undefined') {
        // Check if flags already exist (shouldn't happen but let's check)
        const existingFlags = {
          forceWizardStudy: localStorage.getItem('forceWizardStudy'),
          comingFromBattle: localStorage.getItem('comingFromBattleVictory')
        };
        console.log('DEBUG: Existing flags before setting:', existingFlags);
        
        // Set a dedicated flag for battle victory navigation
        localStorage.setItem('forceWizardStudy', 'true');
        localStorage.setItem('comingFromBattleVictory', 'true');
        console.log('DEBUG: Set localStorage flags for battle victory navigation');
        
        // Verify flags were set correctly
        const newFlags = {
          forceWizardStudy: localStorage.getItem('forceWizardStudy'),
          comingFromBattle: localStorage.getItem('comingFromBattleVictory')
        };
        console.log('DEBUG: New flags after setting:', newFlags);
        
        // Clear any reload flags to prevent conflicts
        sessionStorage.removeItem('isPageRefresh');
      }
      
      // Now navigate to home using router to maintain state
      console.log('DEBUG: About to navigate to home page');
      router.push('/');
      console.log('DEBUG: Navigation to home page triggered');
    } catch (error) {
      console.error('Error handling battle victory:', error);
    }
  };
  
  return {
    navigateToWizardStudy,
    navigateToBattle,
    navigateToMainMenu,
    handleBattleVictory
  };
}