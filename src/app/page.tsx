// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Login from '../lib/ui/components/Login';
import Settings from '../lib/ui/components/Settings';
import HowToPlay from '../lib/ui/components/HowToPlay';

// Import custom hooks
import { useGameAuth } from '../hooks/useGameAuth';
import { useGameNavigation } from '../hooks/useGameNavigation';
import { useGameStateStore } from '../lib/game-state/gameStateStore';

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
  
  // Custom hooks
  const { isAuthenticated, isLoading, checkAuthStatus, handleLogout } = useGameAuth();
  const { navigateToWizardStudy, navigateToBattle, navigateToMainMenu } = useGameNavigation();
  const router = useRouter();
  
  // Cleanup transition class on mount
  useEffect(() => {
    // Remove any page transition classes when mounting
    if (typeof document !== 'undefined') {
      document.body.classList.remove('page-transitioning');
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
  const handleStartNewGame = () => {
    console.log("Starting new game - showing character creation");
    setShowNameInput(true);
  };
  
  const handleOpenSettings = () => setShowSettings(true);
  const handleCloseSettings = () => setShowSettings(false);
  const handleOpenHowToPlay = () => setShowHowToPlay(true);
  const handleCloseHowToPlay = () => setShowHowToPlay(false);
  
  // This handler will be called after character creation is complete
  const handleCharacterCreationComplete = () => {
    console.log("Character creation completed - entering game");
    setShowNameInput(false);
    
    // First ensure the correct game state
    navigateToWizardStudy();
    
    // Then switch to game view
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
  
  // Handle manual navigation to wizard study
  const handleContinueGame = (saveSlotId: number) => {
    console.log("=== CONTINUE GAME REQUESTED ===");
    console.log("Continue game with save slot:", saveSlotId);
    
    // First ensure we are in the wizard study location
    navigateToWizardStudy();
    
    // This is the direct, simple fix - immediately set gameStarted to true
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
    <div className="app-container">
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
  );
}
