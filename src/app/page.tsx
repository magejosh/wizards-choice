// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import MainMenu from '../lib/ui/components/MainMenu';
import Settings from '../lib/ui/components/Settings';
import HowToPlay from '../lib/ui/components/HowToPlay';
import WizardStudy from '../lib/ui/components/WizardStudy';
import Login from '../lib/ui/components/Login';
import DeckBuilder from '../lib/ui/components/DeckBuilder';
import { useGameStateStore } from '../lib/game-state/gameStateStore';
import authService from '../lib/auth/authService';
import '../lib/ui/styles/main.css';

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [showDeckBuilder, setShowDeckBuilder] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { gameState, initializeNewGame, setCurrentLocation } = useGameStateStore();

  // Track if we're in the game proper or still in the menu
  const [gameStarted, setGameStarted] = useState(false);
  
  // Check if user is already logged in (on page refresh)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const isUserLoggedIn = authService.isLoggedIn();
        setIsAuthenticated(isUserLoggedIn);
        
        if (isUserLoggedIn) {
          // Load the user's game state if they're logged in
          await authService.loadGameState();
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };
  
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setIsAuthenticated(false);
      setGameStarted(false);
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewGame = () => {
    console.log('Starting new game setup...');
    setShowNameInput(true);
  };

  const handleCreateCharacter = async () => {
    if (!playerName.trim()) {
      alert('Please enter a name for your wizard');
      return;
    }
    
    setIsLoading(true);
    try {
      // Initialize a new game in save slot 0
      initializeNewGame(playerName, 0);
      
      // Set the current location to wizard's study
      setCurrentLocation('wizardStudy');
      
      // Save the game state
      await authService.saveGameState();
      
      // Close the dialog and start the game
      setShowNameInput(false);
      setGameStarted(true);
    } catch (error) {
      console.error('Error creating character:', error);
      alert('Error creating character. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueGame = async (saveSlotId: number) => {
    console.log('Continuing game from save slot:', saveSlotId);
    
    setIsLoading(true);
    try {
      // Load the selected game save
      const loadSuccess = useGameStateStore.getState().loadGame(saveSlotId);
      
      if (loadSuccess) {
        // Save the updated current save slot
        await authService.saveGameState();
        setGameStarted(true);
      } else {
        alert('Failed to load game save');
      }
    } catch (error) {
      console.error('Error loading game:', error);
      alert('Error loading game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleOpenHowToPlay = () => {
    setShowHowToPlay(true);
  };

  const handleCloseHowToPlay = () => {
    setShowHowToPlay(false);
  };
  
  // Wizard Study handlers
  const handleStartDuel = () => {
    console.log('Starting a duel');
    // In a full implementation, this would navigate to the battle arena
    alert('Duel would start here');
  };
  
  const handleOpenDeckBuilder = () => {
    console.log('Opening deck builder');
    setShowDeckBuilder(true);
  };
  
  const handleCloseDeckBuilder = async () => {
    // Save the game state when closing the deck builder
    // to persist any changes to equipped spells
    setIsLoading(true);
    try {
      await authService.saveGameState();
      setShowDeckBuilder(false);
    } catch (error) {
      console.error('Error saving deck changes:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenEquipment = () => {
    console.log('Opening equipment');
    alert('Equipment screen would open here');
  };
  
  const handleOpenSpellbook = () => {
    console.log('Opening spellbook');
    alert('Spellbook would open here');
  };
  
  const handleReturnToMainMenu = async () => {
    setIsLoading(true);
    try {
      // Save game state before returning to menu
      await authService.saveGameState();
      setGameStarted(false);
    } catch (error) {
      console.error('Error returning to main menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Wizard's Choice...</p>
      </div>
    );
  }

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      {!gameStarted ? (
        <>
          <MainMenu 
            onStartNewGame={handleStartNewGame}
            onContinueGame={handleContinueGame}
            onOpenSettings={handleOpenSettings}
            onOpenHowToPlay={handleOpenHowToPlay}
            onLogout={handleLogout}
          />
          
          {showSettings && <Settings onClose={handleCloseSettings} />}
          {showHowToPlay && <HowToPlay onClose={handleCloseHowToPlay} />}
          
          {showNameInput && (
            <div className="name-input-modal">
              <div className="name-input-content">
                <h2>Create Your Wizard</h2>
                <div className="name-input-field">
                  <label htmlFor="player-name">Enter your wizard's name:</label>
                  <input
                    id="player-name"
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Wizard name..."
                    autoFocus
                    disabled={isLoading}
                  />
                </div>
                <div className="name-input-buttons">
                  <button 
                    className="name-input-cancel"
                    onClick={() => setShowNameInput(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="name-input-submit"
                    onClick={handleCreateCharacter}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Begin Adventure'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        // The game has started, render the appropriate component based on current location
        <>
          {gameState.gameProgress.currentLocation === 'wizardStudy' && (
            <WizardStudy 
              onStartDuel={handleStartDuel}
              onOpenDeckBuilder={handleOpenDeckBuilder}
              onOpenEquipment={handleOpenEquipment}
              onOpenSpellbook={handleOpenSpellbook}
              onReturnToMainMenu={handleReturnToMainMenu}
            />
          )}
          
          {/* Overlay components that can appear in game */}
          {showDeckBuilder && <DeckBuilder onClose={handleCloseDeckBuilder} />}
        </>
      )}
    </div>
  );
}
