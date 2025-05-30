// src/components/GameInitializer.tsx
import { useEffect } from 'react';
import { useGameStateStore, dedupeAndMergePotions, getWizard } from '../lib/game-state/gameStateStore';

interface GameInitializerProps {
  onGameStart: (shouldStartGame: boolean) => void;
}

const GameInitializer: React.FC<GameInitializerProps> = ({ onGameStart }) => {
  const { gameState } = useGameStateStore();

  useEffect(() => {
    console.log("=== GAME INITIALIZER MOUNT ===");

    // Remove transitioning class in case it's still present
    if (typeof document !== 'undefined') {
      // Remove any transition class and loading elements
      document.body.classList.remove('page-transitioning');

      // Remove any battle return loader if it exists
      const loader = document.getElementById('battle-return-loader');
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }

      // Check if browser storage is available
      if (typeof window !== 'undefined') {
        // Check URL parameters first (highest priority)
        const urlParams = new URLSearchParams(window.location.search);
        const forceBattleReturn = urlParams.get('forceBattleReturn') === 'true';

        // Check localStorage flags for battle victory (second priority)
        const comingFromBattle = localStorage.getItem('comingFromBattleVictory') === 'true';
        const forceWizardStudy = localStorage.getItem('forceWizardStudy') === 'true';

        console.log("Battle navigation check:", {
          forceBattleReturn,
          comingFromBattle,
          forceWizardStudy,
          currentUrl: window.location.href
        });

        if (forceBattleReturn || comingFromBattle || forceWizardStudy) {
          console.log('===== NAVIGATION FROM BATTLE DETECTED =====');

          // Force the location to wizardStudy in game state
          useGameStateStore.getState().setCurrentLocation('wizardStudy');

          // Clear the flags immediately to prevent loops
          if (comingFromBattle) localStorage.removeItem('comingFromBattleVictory');
          if (forceWizardStudy) localStorage.removeItem('forceWizardStudy');

          // Clean the URL parameters
          if (forceBattleReturn && window.history && window.history.replaceState) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }

          // Force game started state
          console.log("Force setting game started to true for battle return");
          setTimeout(() => {
            onGameStart(true);
          }, 0);
          return;
        }
      }

      // Log debug information about the current save slot
      // We'll do this once on mount without triggering state updates
      console.log("GameInitializer found no special flags - taking no action");
    }
  }, [onGameStart]); // Removed gameState from dependencies to prevent infinite loops

  // Repair potions and equippedPotions on every mount
  useEffect(() => {
    const player = getWizard();
    if (player) {
      const dedupedPotions = dedupeAndMergePotions(player.potions || []);
      const dedupedEquipped = dedupeAndMergePotions(player.equippedPotions || []);
      const arraysDiffer = (a, b) =>
        a.length !== b.length ||
        a.some((item, i) => item.id !== b[i]?.id || item.quantity !== b[i]?.quantity);
      if (
        arraysDiffer(dedupedPotions, player.potions || []) ||
        arraysDiffer(dedupedEquipped, player.equippedPotions || [])
      ) {
        console.log('[Repair] (Initializer) Before dedupe - potions:', player.potions);
        console.log('[Repair] (Initializer) Before dedupe - equippedPotions:', player.equippedPotions);
        useGameStateStore.getState().updatePlayerPotions(dedupedPotions);
        useGameStateStore.getState().updatePlayerEquippedPotions(dedupedEquipped);
        setTimeout(() => {
          const updated = getWizard();
          console.log('[Repair] (Initializer) After dedupe - potions:', updated?.potions);
          console.log('[Repair] (Initializer) After dedupe - equippedPotions:', updated?.equippedPotions);
        }, 100);
      }
    }
  }, []);

  return null; // This is a logic-only component
};

export default GameInitializer;