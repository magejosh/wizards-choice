// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Login from '../lib/ui/components/Login';
import Settings from '../lib/ui/components/Settings';
import HowToPlay from '../lib/ui/components/HowToPlay';
import { NotificationProvider } from '@/lib/ui/components/notifications/NotificationManager';
import GameInterface from '@/lib/ui/components/GameInterface';

// Import custom hooks
import { useGameAuth } from '../hooks/useGameAuth';
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

export default function Home() {
  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedSaveSlot, setSelectedSaveSlot] = useState(0); // New state for selected save slot
  const [transitionClass, setTransitionClass] = useState('');
  
  // Custom hooks
  const { isAuthenticated, isLoading, checkAuthStatus, handleLogout } = useGameAuth();
  const { navigateToWizardStudy, navigateToBattle, navigateToMainMenu } = useGameNavigation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCurrentLocation, gameState } = useGameStateStore();
  
  // Cleanup transition class and check URL parameters on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Remove any page transition classes when mounting
      document.body.classList.remove('page-transitioning');
      
      // Check for any URL parameters that might affect initialization
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Clean up URL if needed
        if (urlParams.size > 0) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // Force the location if needed based on state
        if (gameState && gameState.player && gameState.player.name) {
          console.log("Found existing player in state:", gameState.player.name);
        }
      }
    }
  }, []);
  
  // Check for direct battle return via URL (executed once on component mount)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const forceBattleReturn = urlParams.get('forceBattleReturn') === 'true';
      
      if (forceBattleReturn) {
        console.log("*** HOME PAGE: Force battle return parameter detected ***");
        
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Force the location if needed
        useGameStateStore.getState().setCurrentLocation('wizardStudy');
        
        // Set game started to true to show wizard study
        console.log("Setting game started to true for battle return");
        setGameStarted(true);
      }
    }
  }, []);
  
  // Call checkAuthStatus on component mount
  useEffect(() => {
    console.log("Home: Initializing authentication check...");
    checkAuthStatus();
  }, [checkAuthStatus]);
  
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
  
  // This handler will be called after character creation is complete
  const handleCharacterCreationComplete = (name: string) => {
    console.log(`Page: Character creation complete for "${name}", navigating to wizard study`);
    setCurrentLocation('wizardStudy');
    setGameStarted(true);
  };
  
  // Handle starting a duel
  const handleStartDuel = () => {
    console.log("Starting duel");
    
    // First, set location to 'duel' to prevent invalid navigation checks
    navigateToBattle();
    
    // IMPORTANT: Show loading screen immediately on button click
    // This shows immediate feedback to the user
    document.body.classList.add('page-transitioning');
    
    // Navigate to battle page
    router.push('/battle');
  };
  
  // Handle returning to main menu
  const handleReturnToMainMenu = async () => {
    console.log("=== RETURN TO MAIN MENU REQUESTED ===");
    
    const result = await navigateToMainMenu();
    console.log("Navigation result:", result);
    
    // Set game started to false to show main menu
    setGameStarted(false);
  };
  
  // Handle continuing a game
  const handleContinueGame = (saveSlotId: number) => {
    console.log(`Page: Continuing game from slot ${saveSlotId}`);
    setCurrentLocation('wizardStudy');
    setGameStarted(true);
  };
  
  // Handler for GameInitializer
  const handleGameStartChange = (shouldStartGame: boolean) => {
    console.log("GameInitializer called onGameStart:", shouldStartGame);
    
    // Check if any URL parameters are set for battle returns
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const forceBattleReturn = urlParams.get('forceBattleReturn') === 'true';
      
      if (forceBattleReturn) {
        console.log("*** handleGameStartChange: Force battle return parameter detected ***");
        
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Force wizard study state and game view
        useGameStateStore.getState().setCurrentLocation('wizardStudy');
        setGameStarted(true);
        return;
      }
    }
    
    // Only accept positive signals (true) from GameInitializer
    // This prevents overriding manual game start actions
    if (shouldStartGame) {
      console.log("Setting gameStarted to true from GameInitializer");
      setGameStarted(true);
    } else {
      console.log("Ignoring false signal from GameInitializer to preserve manual actions");
    }
  };

  // Display loading state
  if (isLoading) {
    console.log("Home: Showing loading screen: Loading Wizard's Choice...");
    return <LoadingScreen message="Loading Wizard's Choice..." />;
  }

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    console.log("Home: User not authenticated, showing login screen");
    return <Login onLoginSuccess={checkAuthStatus} />;
  }

  console.log("Home: User authenticated, rendering game UI, gameStarted =", gameStarted);
  
  // Main application container
  return (
    <NotificationProvider>
      <div className={`app-container ${transitionClass}`}>
        {/* GameInitializer handles battle victory navigation */}
        <GameInitializer onGameStart={handleGameStartChange} />
        
        {/* Main Menu View */}
        {!gameStarted && (
          <>
            <MainMenuView 
              onStartNewGame={handleStartNewGame}
              onContinueGame={handleContinueGame}
              onOpenSettings={handleOpenSettings}
              onOpenHowToPlay={handleOpenHowToPlay}
              onLogout={handleLogout}
            />
            
            {/* Modal overlays */}
            {showSettings && <Settings onClose={handleCloseSettings} />}
            {showHowToPlay && <HowToPlay onClose={handleCloseHowToPlay} />}
            
            {/* Character creation modal */}
            {showNameInput && (
              <CharacterCreation 
                onComplete={handleCharacterCreationComplete}
                onCancel={() => setShowNameInput(false)}
                saveSlotId={selectedSaveSlot}
              />
            )}
          </>
        )}

        {/* Game Interface View */}
        {gameStarted && (
          <GameView 
            onStartDuel={handleStartDuel}
            onReturnToMainMenu={handleReturnToMainMenu}
          />
        )}
      </div>
    </NotificationProvider>
  );
}
