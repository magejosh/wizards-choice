// src/app/page.tsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Settings from '../lib/ui/components/Settings';
import HowToPlay from '../lib/ui/components/HowToPlay';
import { NotificationProvider } from '@/lib/ui/components/notifications/NotificationManager';
import GameInterface from '@/lib/ui/components/GameInterface';
import { Analytics } from '@vercel/analytics/react';

// Import custom hooks
import { useGameNavigation } from '../hooks/useGameNavigation';
import { useGameStateStore } from '../lib/game-state/gameStateStore';
import { clearSaveGames } from '../lib/game-state/clearSaveGames';

// Import refactored components
import GameInitializer from '../components/GameInitializer';
import LoadingScreen from '../components/LoadingScreen';
import MainMenuView from '../components/MainMenuView';
import GameView from '../components/GameView';
import CharacterCreation from '../components/CharacterCreation';

// Import styles
import '../lib/ui/styles/main.css';

// Separate component for URL parameter handling
const URLParamHandler = () => {
  const { setCurrentLocation } = useGameStateStore();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const forceBattleReturn = searchParams.get('forceBattleReturn') === 'true';
      
      if (forceBattleReturn) {
        console.log("*** URL Handler: Force battle return parameter detected ***");
        window.history.replaceState({}, document.title, window.location.pathname);
        setCurrentLocation('wizardStudy');
      }
    }
  }, [searchParams, setCurrentLocation]);
  
  return null;
};

export default function Home() {
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedSaveSlot, setSelectedSaveSlot] = useState(0);
  const [transitionClass, setTransitionClass] = useState('');
  
  // Custom hooks
  const { navigateToWizardStudy, navigateToBattle, navigateToMainMenu } = useGameNavigation();
  const router = useRouter();
  const { setCurrentLocation, gameState } = useGameStateStore();
  
  // Cleanup transition class on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('page-transitioning');
      
      if (gameState && gameState.player && gameState.player.name) {
        console.log("Found existing player in state:", gameState.player.name);
      }
    }
  }, [gameState]);
  
  // Simple handlers
  const handleStartNewGame = (saveSlotId: number) => {
    console.log(`Page: Starting new game in slot ${saveSlotId}`);
    setCurrentLocation('wizardStudy');
    setGameStarted(true);
  };
  
  const handleOpenSettings = () => {
    console.log("Page: Opening settings");
    // Settings are now handled in MainMenu component
  };
  
  const handleCloseSettings = () => setShowSettings(false);
  
  const handleOpenHowToPlay = () => {
    console.log("Page: Opening how to play");
    // How to play is now handled in MainMenu component
  };
  
  const handleCloseHowToPlay = () => setShowHowToPlay(false);
  
  const handleCharacterCreationComplete = (name: string) => {
    console.log(`Page: Character creation complete for "${name}", navigating to wizard study`);
    setCurrentLocation('wizardStudy');
    setGameStarted(true);
  };
  
  const handleStartDuel = () => {
    console.log("Starting duel");
    navigateToBattle();
    document.body.classList.add('page-transitioning');
    router.push('/battle');
  };
  
  const handleReturnToMainMenu = async () => {
    console.log("=== RETURN TO MAIN MENU REQUESTED ===");
    const result = await navigateToMainMenu();
    console.log("Navigation result:", result);
    setGameStarted(false);
  };
  
  const handleContinueGame = (saveSlotId: number) => {
    console.log(`Page: Continuing game from slot ${saveSlotId}`);
    setCurrentLocation('wizardStudy');
    setGameStarted(true);
  };
  
  const handleGameStartChange = (shouldStartGame: boolean) => {
    console.log("GameInitializer called onGameStart:", shouldStartGame);
    
    if (shouldStartGame) {
      console.log("Setting gameStarted to true from GameInitializer");
      setGameStarted(true);
    } else {
      console.log("Ignoring false signal from GameInitializer to preserve manual actions");
    }
  };

  // Dummy logout handler since we're not using authentication
  const handleLogout = () => {
    console.log("Logout clicked - no action needed");
  };

  return (
    <>
      <NotificationProvider>
        <Suspense fallback={<LoadingScreen message="Loading..." />}>
          <URLParamHandler />
          {gameStarted ? (
            <GameView
              onStartDuel={handleStartDuel}
              onReturnToMainMenu={handleReturnToMainMenu}
            />
          ) : (
            <MainMenuView
              onStartNewGame={handleStartNewGame}
              onContinueGame={handleContinueGame}
              onOpenSettings={handleOpenSettings}
              onOpenHowToPlay={handleOpenHowToPlay}
              onLogout={handleLogout}
            />
          )}
          <GameInitializer onGameStart={handleGameStartChange} />
        </Suspense>
      </NotificationProvider>
      <Analytics />
    </>
  );
}
