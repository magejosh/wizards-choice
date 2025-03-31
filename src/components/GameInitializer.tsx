// src/components/GameInitializer.tsx
import { useEffect } from 'react';
import { useGameStateStore } from '../lib/game-state/gameStateStore';

interface GameInitializerProps {
  onGameStart: (shouldStartGame: boolean) => void;
}

const GameInitializer: React.FC<GameInitializerProps> = ({ onGameStart }) => {
  const { gameState } = useGameStateStore();

  useEffect(() => {
    console.log("=== GAME INITIALIZER MOUNT ===");
    
    // Check if browser storage is available
    if (typeof window !== 'undefined') {
      // Check URL parameters first (highest priority)
      const urlParams = new URLSearchParams(window.location.search);
      const forceBattleReturn = urlParams.get('forceBattleReturn') === 'true';
      
      if (forceBattleReturn) {
        console.log("*** Force battle return parameter detected ***");
        
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Force the location if needed
        useGameStateStore.getState().setCurrentLocation('wizardStudy');
        
        // Set game started to true to show wizard study
        console.log("Setting game started to true for battle return");
        onGameStart(true);
        return;
      }
      
      // Check localStorage flags for battle victory (second priority)
      const comingFromBattle = localStorage.getItem('comingFromBattleVictory') === 'true';
      if (comingFromBattle) {
        console.log('===== BATTLE VICTORY NAVIGATION DETECTED =====');
        
        // Clear the flags
        localStorage.removeItem('comingFromBattleVictory');
        localStorage.removeItem('forceWizardStudy');
        
        // Set location to wizardStudy in game state
        useGameStateStore.getState().setCurrentLocation('wizardStudy');
        
        // Show the game view (wizard study)
        console.log("Setting game started to true for battle victory");
        onGameStart(true);
        return;
      }
      
      // IMPORTANT: We don't set anything to false here anymore!
      // This allows manual actions like "Start New Game" and "Continue Game" to work
      console.log("GameInitializer found no special flags or parameters - taking no action");
    }
  }, [onGameStart]);

  return null; // This is a logic-only component
};

export default GameInitializer;