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
      // Save current state before navigation
      const currentState = useGameStateStore.getState();
      console.log('Current player experience:', currentState.player.experience);
      
      // Set location
      setCurrentLocation('wizardStudy');
      
      // Ensure state persists
      await saveGame();
      
      // Verify state after save
      const savedState = useGameStateStore.getState();
      console.log('Saved player experience:', savedState.player.experience);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('forceWizardStudy', 'true');
        localStorage.setItem('comingFromBattleVictory', 'true');
      }
    } catch (error) {
      console.error('Battle victory processing error:', error);
    }
  };
  
  return {
    navigateToWizardStudy,
    navigateToBattle,
    navigateToMainMenu,
    handleBattleVictory
  };
}
