'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BattleView from '../../components/battle/BattleView';
import LoadingScreen from '../../components/LoadingScreen';
import { useGameStateStore } from '../../lib/game-state/gameStateStore';
import './battle.css';

export default function BattlePage() {
  const router = useRouter();
  const isNavigatingAwayRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get game state store directly
  const { setCurrentLocation, saveGame } = useGameStateStore();
  const gameState = useGameStateStore(state => state.gameState);
  
  // Cleanup transition class on mount
  useEffect(() => {
    // Remove any transition classes from previous navigations
    document.body.classList.remove('page-transitioning');
    
    // Check if we're coming from wizard's study (valid entry point)
    // The location should be 'duel' - this is set by the WizardStudy component when starting a duel
    const { currentLocation } = gameState.gameProgress;
    
    console.log('Battle page initialization, current location:', currentLocation);
    
    // Accept either 'duel' or 'wizardStudy' as valid entry points to prevent navigation issues
    if (currentLocation !== 'duel' && currentLocation !== 'wizardStudy' && !isNavigatingAwayRef.current) {
      console.log('Invalid navigation to battle page - redirecting to home');
      isNavigatingAwayRef.current = true;
      router.push('/');
      return;
    }
    
    // Show loading screen for 1.5 seconds to allow battle arena to initialize properly
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle player return to wizard's study
  const handleReturnToWizardStudy = async () => {
    if (isNavigatingAwayRef.current) {
      console.log("Navigation already in progress, ignoring duplicate click");
      return;
    }
    
    console.log("=== VICTORY NAVIGATION START ===");
    console.log("Navigating to Wizard's Study from battle victory screen");
    
    isNavigatingAwayRef.current = true;
    
    // Add transition class to the body to prevent UI flickering
    document.body.classList.add('page-transitioning');
    
    try {
      // STEP 1: Update the game state location
      console.log("Setting location to wizardStudy");
      setCurrentLocation('wizardStudy');
      
      // STEP 2: Save the game state
      console.log("Saving game state");
      await saveGame();
      
      // STEP 3: Set up localStorage flags for the home page to detect
      if (typeof window !== 'undefined') {
        localStorage.setItem('forceWizardStudy', 'true');
        localStorage.setItem('comingFromBattleVictory', 'true');
        console.log("Set localStorage flags for battle victory navigation");
        
        // STEP 4: Wait briefly to ensure state is saved
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // STEP 5: Navigate with explicit loading message
        console.log("Initiating direct navigation to home page");
        
        // Special loading element to prevent UI flash
        const loadingElement = document.createElement('div');
        loadingElement.className = 'full-page-loader';
        loadingElement.innerHTML = `
          <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #0f0f1a;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 99999;
          ">
            <div style="
              border: 5px solid #333;
              border-top: 5px solid #6a3de8;
              border-radius: 50%;
              width: 60px;
              height: 60px;
              animation: spin 1.5s linear infinite;
              margin-bottom: 20px;
            "></div>
            <div style="
              color: white;
              font-family: 'Cinzel', serif;
              font-size: 24px;
            ">Returning to Wizard's Study...</div>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </div>
        `;
        
        document.body.appendChild(loadingElement);
        
        // Navigate after a short delay to ensure the loading screen is displayed
        setTimeout(() => {
          window.location.href = '/?forceBattleReturn=true'; 
        }, 100);
      }
    } catch (error) {
      console.error("Error returning to wizard's study:", error);
      isNavigatingAwayRef.current = false;
      document.body.classList.remove('page-transitioning');
    }
  };

  // Show loading screen while initializing battle
  if (isLoading) {
    return <LoadingScreen message="Preparing Battle Arena..." />;
  }

  // Render the BattleView component which contains all battle logic
  return <BattleView onReturnToWizardStudy={handleReturnToWizardStudy} />;
} 