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
    
    // IMPORTANT: Instead of showing the loading screen (which creates a flicker),
    // add a transition class to the body to indicate loading
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
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // STEP 5: Navigate using a direct approach 
        // Instead of using the router directly which may have race conditions,
        // we'll use window.location for a more direct navigation
        console.log("Initiating navigation to home page");
        window.location.href = '/?forceBattleReturn=true';
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