'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BattleArena from '../../components/battle/BattleArena';
import { 
  initializeCombat, 
  selectSpell, 
  executeMysticPunch, 
  executeSpellCast 
} from '../../lib/combat/combatEngine';
import { getAISpellSelection } from '../../lib/combat/aiEngine';
import { useGameStateStore } from '../../lib/game-state/gameStateStore';
import { Wizard, Spell, CombatState, CombatWizard, CombatLogEntry } from '../../lib/types';
import './battle.css';

// Define the function signature type to match what's in combatEngine.ts
type ExecuteMysticPunchFn = (state: CombatState, spellTier: number, isPlayer: boolean) => CombatState;

export default function BattlePage() {
  const router = useRouter();
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [selectedSpellForMysticPunch, setSelectedSpellForMysticPunch] = useState<Spell | null>(null);
  const [showMysticPunchSelection, setShowMysticPunchSelection] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Use refs to track state that shouldn't trigger re-renders
  const isProcessingEndRef = useRef(false);
  const isHandlingAITurnRef = useRef(false);
  const isNavigatingAwayRef = useRef(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get game state from store
  const { 
    gameState,
    updateWizard,
    addExperience,
    saveGame
  } = useGameStateStore();
  
  // Initialize combat once
  useEffect(() => {
    if (isInitialized) return;
    
    // Check if we're coming from wizard's study (valid entry point)
    const { currentLocation } = gameState.gameProgress;
    
    if (currentLocation !== 'duel' && !isNavigatingAwayRef.current) {
      console.log('Invalid navigation to battle page');
      isNavigatingAwayRef.current = true;
      router.push('/');
      return;
    }
    
    // Generate enemy wizard
    const playerWizard = gameState.player;
    const enemyWizard = {
      id: 'enemy-1',
      name: 'Enemy Wizard',
      level: playerWizard.level,
      experience: 0,
      experienceToNextLevel: 100,
      health: playerWizard.level * 20 + 80,
      maxHealth: playerWizard.level * 20 + 80,
      mana: playerWizard.level * 10 + 90,
      maxMana: playerWizard.level * 10 + 90,
      manaRegen: 5,
      spells: [...playerWizard.spells],
      equippedSpells: [...playerWizard.equippedSpells],
      equipment: {},
      inventory: [],
      potions: [],
      equippedPotions: [],
      ingredients: [],
      discoveredRecipes: [],
      levelUpPoints: 0,
      decks: [],
      activeDeckId: null,
      combatStats: {
        mysticPunchPower: 1,
        bleedEffect: 0,
        extraCardDraw: 0,
        canDiscardAndDraw: false,
        potionSlots: 0
      }
    };
    
    const difficulty = gameState.settings.difficulty as 'easy' | 'normal' | 'hard';
    
    // Initialize combat
    const initialCombatState = initializeCombat(
      playerWizard,
      enemyWizard,
      difficulty
    );
    
    setCombatState(initialCombatState);
    setIsInitialized(true);
  }, []);
  
  // Handle AI turn
  useEffect(() => {
    // Ensure we only process AI turns when needed
    if (!combatState) {
      console.log("AI turn: No combat state available");
      return;
    }
    
    if (combatState.isPlayerTurn) {
      // Player's turn, don't process AI turn
      return;
    }
    
    if (combatState.status !== 'active') {
      console.log("AI turn: Combat is not active, status:", combatState.status);
      return;
    }
    
    // CRITICAL FIX: Force reset animation state if it's been true for more than 5 seconds
    // This prevents the AI turn from being blocked indefinitely
    
    if (isAnimating) {
      console.log("AI turn: Animation in progress, waiting");
      
      // Clear any existing timeout
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      // Set a new timeout to force animation to end after 3 seconds
      animationTimeoutRef.current = setTimeout(() => {
        console.log("AI turn: Animation timeout reached, forcing animation to end");
        setIsAnimating(false);
        isHandlingAITurnRef.current = false;
      }, 3000);
      
      return; // Don't proceed if animations are playing
    }
    
    if (isHandlingAITurnRef.current) {
      console.log("AI turn: Already handling AI turn");
      return;
    }
    
    // Clear animation timeout if we're proceeding with AI turn
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
    console.log("AI turn: Starting AI turn logic");
    
    // Prevent re-entry
    isHandlingAITurnRef.current = true;
    setIsAnimating(true);
    
    // Use setTimeout to add a delay before AI acts
    const aiTimer = setTimeout(() => {
      if (!combatState) {
        console.log("AI turn: Combat state no longer available");
        isHandlingAITurnRef.current = false;
        setIsAnimating(false);
        return;
      }
      
      try {
        // Log available spells for the enemy
        console.log("AI turn: Enemy wizard", combatState.enemyWizard);
        console.log("AI turn: Enemy wizard has equipped spells:", combatState.enemyWizard.wizard.equippedSpells);
        
        // Get AI spell selection
        const aiSpell = getAISpellSelection(combatState);
        console.log("AI turn: Selected spell for AI turn", aiSpell);
        
        if (!aiSpell) {
          console.error("AI turn: No valid spell selected for AI turn");
          // If no spell available, skip turn
          const skipTurnLog = {
            turn: combatState.turn,
            round: combatState.round,
            actor: 'enemy',
            action: 'skip_turn',
            details: `${combatState.enemyWizard.wizard.name} skipped their turn.`,
            timestamp: Date.now()
          };
          
          setCombatState({
            ...combatState,
            isPlayerTurn: true,
            turn: combatState.turn + 1,
            log: [...combatState.log, skipTurnLog]
          });
          
          // Ensure animation flag is reset
          setTimeout(() => {
            isHandlingAITurnRef.current = false;
            setIsAnimating(false);
          }, 300);
          return;
        }
        
        // Make sure the spell has required properties
        const validatedSpell = {
          ...aiSpell,
          effects: aiSpell.effects || [],
          imagePath: aiSpell.imagePath || '/images/spells/default-placeholder.jpg'
        };
        
        console.log("AI turn: Validated spell with required properties", validatedSpell);
        
        // Update state with selected spell
        const updatedState = selectSpell(combatState, validatedSpell, false);
        console.log("AI turn: After spell selection", updatedState);
        
        setCombatState(updatedState);
        
        // Execute the spell after a short delay
        setTimeout(() => {
          try {
            if (!updatedState) {
              console.error("AI turn: Updated state is null after spell selection");
              isHandlingAITurnRef.current = false;
              setIsAnimating(false);
              return;
            }
            
            console.log("AI turn: Executing spell cast");
            const afterCastState = executeSpellCast(updatedState, false);
            console.log("AI turn: After spell execution", afterCastState);
            setCombatState(afterCastState);
            
            // Ensure animation flag is reset
            setTimeout(() => {
              console.log("AI turn completed, setting isAnimating to false");
              isHandlingAITurnRef.current = false;
              setIsAnimating(false);
            }, 500);
          } catch (error) {
            console.error("Error executing AI spell:", error);
            isHandlingAITurnRef.current = false;
            setIsAnimating(false);
          }
        }, 1000);
      } catch (error) {
        console.error("Error in AI turn:", error);
        isHandlingAITurnRef.current = false;
        setIsAnimating(false);
      }
    }, 800); // Reduced from 1500ms to 800ms for better flow
    
    return () => {
      clearTimeout(aiTimer);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      isHandlingAITurnRef.current = false;
    };
  }, [combatState, isAnimating]);
  
  // Handle game end
  useEffect(() => {
    if (!combatState || 
        combatState.status === 'active' || 
        isProcessingEndRef.current) {
      return;
    }
    
    // Prevent multiple executions
    isProcessingEndRef.current = true;
    
    // Process victory
    if (combatState.status === 'playerWon') {
      try {
        // Calculate experience based on difficulty
        const experienceMultiplier = 
          combatState.difficulty === 'easy' ? 10 : 
          combatState.difficulty === 'normal' ? 1 : 0.1;
        
        const enemyWizard = combatState.enemyWizard.wizard;
        const experience = Math.round(enemyWizard.level * 100 * experienceMultiplier);
        
        // Award experience to player
        addExperience(experience);
        
        // Save game state
        saveGame();
      } catch (error) {
        console.error("Error processing victory:", error);
      }
    }
  }, [combatState?.status]);
  
  // Handle player return to wizard's study
  const handleReturnToWizardStudy = () => {
    if (isNavigatingAwayRef.current) return;
    
    isNavigatingAwayRef.current = true;
    
    try {
      // Update game state to set location back to wizard's study
      useGameStateStore.getState().setCurrentLocation('wizardStudy');
      
      // Navigate back to home
      router.push('/');
    } catch (error) {
      console.error("Error returning to wizard's study:", error);
      isNavigatingAwayRef.current = false;
    }
  };

  // Handle spell selection
  const handleSpellSelect = (spell: Spell) => {
    if (!combatState || !combatState.isPlayerTurn || isAnimating) return;
    
    setIsAnimating(true);
    
    try {
      // Make sure the spell has required properties
      const validatedSpell: Spell = {
        ...spell,
        effects: spell.effects || [],
        imagePath: spell.imagePath || '/images/spells/default-placeholder.jpg'
      };
      
      console.log("Casting spell:", validatedSpell);
      
      // Update state with selected spell
      const updatedState = selectSpell(combatState, validatedSpell, true);
      setCombatState(updatedState);
      
      // Execute the spell after a short delay
      setTimeout(() => {
        try {
          console.log("Executing spell:", validatedSpell);
          
          const afterCastState = executeSpellCast(updatedState, true);
          console.log("Spell executed, new state:", afterCastState);
          
          setCombatState(afterCastState);
          
          // Add a slight delay before setting isAnimating to false
          // This ensures animations complete before AI turn processing
          setTimeout(() => {
            console.log("Player turn animation completed, setting isAnimating to false");
            setIsAnimating(false);
          }, 300);
        } catch (error) {
          console.error("Error executing spell:", error);
          setIsAnimating(false);
        }
      }, 500);
    } catch (error) {
      console.error("Error selecting spell:", error);
      setIsAnimating(false);
    }
  };

  // Handle mystic punch option
  const handleMysticPunch = () => {
    if (!combatState || !combatState.isPlayerTurn || isAnimating) return;
    
    // Show spell selection for mystic punch
    setShowMysticPunchSelection(true);
  };

  // Execute mystic punch with selected spell
  const executeMysticPunchWithSpell = (spell: Spell) => {
    if (!combatState) return;
    
    setIsAnimating(true);
    
    try {
      // Make sure the spell has required properties
      const validatedSpell: Spell = {
        ...spell,
        effects: spell.effects || [],
        imagePath: spell.imagePath || '/images/spells/default-placeholder.jpg'
      };
      
      console.log("Using spell for Mystic Punch:", validatedSpell);
      
      // Hide selection modal
      setShowMysticPunchSelection(false);
      
      // Execute mystic punch with the correct parameters
      const updatedState = executeMysticPunch(
        combatState,
        validatedSpell.tier,
        true // isPlayer = true
      );
      
      console.log("Mystic Punch executed, new state:", updatedState);
      
      setCombatState(updatedState);
      
      // Add a slight delay before setting isAnimating to false
      // This ensures animations complete before AI turn processing
      setTimeout(() => {
        console.log("Mystic Punch animation completed, setting isAnimating to false");
        setIsAnimating(false);
      }, 500);
    } catch (error) {
      console.error("Error executing mystic punch:", error);
      setIsAnimating(false);
    }
  };

  // Handle skip turn
  const handleSkipTurn = () => {
    if (!combatState || !combatState.isPlayerTurn || isAnimating) return;
    
    setIsAnimating(true);
    
    try {
      console.log("Skip turn: Player is skipping their turn");
      
      // Create a log entry for skipping the turn
      const skipTurnLog = {
        turn: combatState.turn,
        round: combatState.round,
        actor: 'player',
        action: 'skip_turn',
        details: 'You skipped your turn.',
        timestamp: Date.now()  // Add the timestamp that's required by the type
      };
      
      const newState = {
        ...combatState,
        isPlayerTurn: false,
        log: [...combatState.log, skipTurnLog]
      };
      
      console.log("Skip turn: Updated state", newState);
      setCombatState(newState as CombatState);
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    } catch (error) {
      console.error("Error skipping turn:", error);
      setIsAnimating(false);
    }
  };

  // Add useEffect to log animation state changes
  useEffect(() => {
    console.log(`Animation state changed to: ${isAnimating ? 'animating' : 'not animating'}`);
  }, [isAnimating]);

  if (!combatState) {
    return <div className="loading">Initializing battle...</div>;
  }

  return (
    <div className="battle-page">
      <BattleArena
        combatState={combatState as any}
        onSpellSelect={handleSpellSelect}
        onMysticPunch={handleMysticPunch}
        onSkipTurn={handleSkipTurn}
        isAnimating={isAnimating}
      />
      
      {/* Show continue button when battle is over */}
      {combatState.status !== 'active' && (
        <div className="battle-end-modal">
          <div className="battle-end-modal__content">
            <h2>{combatState.status === 'playerWon' ? 'Victory!' : 'Defeat!'}</h2>
            <div className="battle-end-modal__rewards">
              {combatState.status === 'playerWon' && (
                <p>You gained experience and improved your magical prowess!</p>
              )}
              {combatState.status === 'enemyWon' && (
                <p>You were defeated. Better luck next time!</p>
              )}
            </div>
            <button 
              className="battle-end-modal__continue"
              onClick={handleReturnToWizardStudy}
            >
              Continue
            </button>
          </div>
        </div>
      )}
      
      {/* Mystic punch spell selection modal */}
      {showMysticPunchSelection && (
        <div className="mystic-punch-modal">
          <div className="mystic-punch-modal__content">
            <h3>Select a spell to power your Mystic Punch</h3>
            <div className="mystic-punch-modal__spells">
              {combatState.playerWizard.hand.map((spell) => (
                <div 
                  key={spell.id} 
                  className="mystic-punch-modal__spell"
                  onClick={() => executeMysticPunchWithSpell(spell)}
                >
                  <p>{spell.name} (Tier {spell.tier})</p>
                  <p className="mystic-punch-modal__damage">
                    Will deal {spell.tier + (combatState.difficulty === 'easy' ? 20 : combatState.difficulty === 'normal' ? 5 : 2)} damage
                  </p>
                </div>
              ))}
            </div>
            <button 
              className="mystic-punch-modal__cancel"
              onClick={() => setShowMysticPunchSelection(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 