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
  
  // Add state for enemy turn indicator
  const [isEnemyTurnIndicatorVisible, setIsEnemyTurnIndicatorVisible] = useState(false);
  
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

  // Handle player spell selection
  const handleSpellSelect = (spell: Spell) => {
    if (!combatState || !combatState.isPlayerTurn || isAnimating) return;
    
    setIsAnimating(true);
    
    try {
      // STEP 1: PLAYER TURN
      console.log("PLAYER TURN: Player casting spell");
      
      // Make sure the spell has required properties
      const validatedSpell: Spell = {
        ...spell,
        effects: spell.effects || [],
        imagePath: spell.imagePath || '/images/spells/default-placeholder.jpg'
      };
      
      console.log("PLAYER TURN: Casting spell:", validatedSpell);
      
      // Update state with selected spell
      const playerStateWithSpell = selectSpell(combatState, validatedSpell, true);
      
      // Execute the spell immediately
      console.log("PLAYER TURN: Executing spell:", validatedSpell);
      const playerTurnComplete = executeSpellCast(playerStateWithSpell, true);
      console.log("PLAYER TURN: Spell executed, new state:", playerTurnComplete);
      
      // STEP 2: ENEMY TURN - process it after a delay with visual indicator
      setTimeout(() => {
        // Show enemy turn indicator
        setIsEnemyTurnIndicatorVisible(true);
        
        setTimeout(() => {
          try {
            console.log("ENEMY TURN: Starting enemy turn after player");
            
            // Get the enemy wizard info
            const enemyWizard = playerTurnComplete.enemyWizard.wizard;
            console.log("ENEMY TURN: Enemy wizard data:", enemyWizard);
            
            // Find any spell the enemy can cast
            const availableSpells = enemyWizard.equippedSpells.filter(
              spell => spell.manaCost <= playerTurnComplete.enemyWizard.currentMana
            );
            
            console.log("ENEMY TURN: Available spells:", availableSpells);
            
            // Pick a spell for the enemy
            let enemySpell: Spell;
            
            if (availableSpells.length > 0) {
              enemySpell = availableSpells[0];
              console.log("ENEMY TURN: Selected spell:", enemySpell);
            } else {
              // Create a basic spell if needed
              enemySpell = {
                id: `emergency_spell_${Date.now()}`,
                name: "Emergency Magic",
                description: "A basic magical attack",
                manaCost: 0,
                tier: 1,
                type: "attack" as any,
                element: "arcane" as any,
                effects: [
                  {
                    type: "damage" as any,
                    value: 5,
                    target: "enemy",
                    element: "arcane"
                  }
                ],
                imagePath: '/images/spells/default-placeholder.jpg'
              };
              console.log("ENEMY TURN: Created emergency spell:", enemySpell);
            }
            
            // Execute enemy spell
            const enemyStateWithSpell = selectSpell(playerTurnComplete, enemySpell, false);
            console.log("ENEMY TURN: Enemy selected spell, state:", enemyStateWithSpell);
            
            const enemyTurnComplete = executeSpellCast(enemyStateWithSpell, false);
            console.log("ENEMY TURN: Enemy spell executed, final state:", enemyTurnComplete);
            
            // Wait a moment before hiding the indicator
            setTimeout(() => {
              // Hide the enemy turn indicator
              setIsEnemyTurnIndicatorVisible(false);
              
              // Update with the final state after both turns
              setCombatState(enemyTurnComplete);
              
              // Reset animation state
              setTimeout(() => {
                setIsAnimating(false);
                console.log("COMPLETE: Both turns finished, animation reset");
              }, 500);
            }, 1000);
          } catch (error) {
            console.error("Error in enemy turn:", error);
            // If enemy turn fails, still update with player's turn
            setCombatState(playerTurnComplete);
            setIsAnimating(false);
            setIsEnemyTurnIndicatorVisible(false);
          }
        }, 1000); // Wait 1 second after showing indicator before executing enemy turn
      }, 1000); // Wait 1 second after player's turn before showing enemy turn indicator
    } catch (error) {
      console.error("Error in player turn:", error);
      setIsAnimating(false);
      setIsEnemyTurnIndicatorVisible(false);
    }
  };

  // Handle mystic punch option
  const handleMysticPunch = () => {
    if (!combatState || !combatState.isPlayerTurn || isAnimating) return;
    
    // Show spell selection for mystic punch
    setShowMysticPunchSelection(true);
  };

  // Execute mystic punch with selected spell - also handle enemy turn directly
  const executeMysticPunchWithSpell = (spell: Spell) => {
    if (!combatState || isAnimating) return;
    
    setIsAnimating(true);
    
    try {
      // STEP 1: PLAYER TURN
      console.log("PLAYER TURN: Player using Mystic Punch");
      
      // Hide selection modal
      setShowMysticPunchSelection(false);
      
      // Execute mystic punch with the spell tier
      const playerTurnComplete = executeMysticPunch(
        combatState,
        spell.tier,
        true // isPlayer = true
      );
      
      console.log("PLAYER TURN: Mystic Punch executed, new state:", playerTurnComplete);
      
      // Check if combat ended with player's turn
      if (playerTurnComplete.status !== 'active') {
        setCombatState(playerTurnComplete);
        setTimeout(() => setIsAnimating(false), 500);
        return;
      }
      
      // STEP 2: ENEMY TURN - process it after a delay with visual indicator
      setTimeout(() => {
        // Show enemy turn indicator
        setIsEnemyTurnIndicatorVisible(true);
        
        setTimeout(() => {
          try {
            console.log("ENEMY TURN: Starting enemy turn after player");
            
            // Get the enemy wizard info
            const enemyWizard = playerTurnComplete.enemyWizard.wizard;
            console.log("ENEMY TURN: Enemy wizard data:", enemyWizard);
            
            // Find any spell the enemy can cast
            const availableSpells = enemyWizard.equippedSpells.filter(
              spell => spell.manaCost <= playerTurnComplete.enemyWizard.currentMana
            );
            
            console.log("ENEMY TURN: Available spells:", availableSpells);
            
            // Pick a spell for the enemy
            let enemySpell: Spell;
            
            if (availableSpells.length > 0) {
              enemySpell = availableSpells[0];
              console.log("ENEMY TURN: Selected spell:", enemySpell);
            } else {
              // Create a basic spell if needed
              enemySpell = {
                id: `emergency_spell_${Date.now()}`,
                name: "Emergency Magic",
                description: "A basic magical attack",
                manaCost: 0,
                tier: 1,
                type: "attack" as any,
                element: "arcane" as any,
                effects: [
                  {
                    type: "damage" as any,
                    value: 5,
                    target: "enemy",
                    element: "arcane"
                  }
                ],
                imagePath: '/images/spells/default-placeholder.jpg'
              };
              console.log("ENEMY TURN: Created emergency spell:", enemySpell);
            }
            
            // Execute enemy spell
            const enemyStateWithSpell = selectSpell(playerTurnComplete, enemySpell, false);
            console.log("ENEMY TURN: Enemy selected spell, state:", enemyStateWithSpell);
            
            const enemyTurnComplete = executeSpellCast(enemyStateWithSpell, false);
            console.log("ENEMY TURN: Enemy spell executed, final state:", enemyTurnComplete);
            
            // Wait a moment before hiding the indicator
            setTimeout(() => {
              // Hide the enemy turn indicator
              setIsEnemyTurnIndicatorVisible(false);
              
              // Update with the final state after both turns
              setCombatState(enemyTurnComplete);
              
              // Reset animation state
              setTimeout(() => {
                setIsAnimating(false);
                console.log("COMPLETE: Both turns finished, animation reset");
              }, 500);
            }, 1000);
          } catch (error) {
            console.error("Error in enemy turn:", error);
            // If enemy turn fails, still update with player's turn
            setCombatState(playerTurnComplete);
            setIsAnimating(false);
            setIsEnemyTurnIndicatorVisible(false);
          }
        }, 1000); // Wait 1 second after showing indicator before executing enemy turn
      }, 1000); // Wait 1 second after player's turn before showing enemy turn indicator
    } catch (error) {
      console.error("Error executing mystic punch:", error);
      setIsAnimating(false);
      setIsEnemyTurnIndicatorVisible(false);
    }
  };

  // Handle skip turn - also handle enemy turn directly
  const handleSkipTurn = () => {
    if (!combatState || !combatState.isPlayerTurn || isAnimating) return;
    
    setIsAnimating(true);
    
    try {
      // STEP 1: PLAYER TURN (SKIP)
      console.log("PLAYER TURN: Player skipping turn");
      
      // Create a log entry for skipping the turn
      const skipTurnLog = {
        turn: combatState.turn,
        round: combatState.round,
        actor: 'player',
        action: 'skip_turn',
        details: 'You skipped your turn.',
        timestamp: Date.now()
      };
      
      // Create state after player's skip
      const playerTurnComplete = {
        ...combatState,
        isPlayerTurn: false,
        turn: combatState.turn + 1,
        log: [...combatState.log, skipTurnLog]
      };
      
      console.log("PLAYER TURN: Skip completed, new state:", playerTurnComplete);
      
      // STEP 2: ENEMY TURN - process it after a delay with visual indicator
      setTimeout(() => {
        // Show enemy turn indicator
        setIsEnemyTurnIndicatorVisible(true);
        
        setTimeout(() => {
          try {
            console.log("ENEMY TURN: Starting enemy turn after player");
            
            // Get the enemy wizard info
            const enemyWizard = playerTurnComplete.enemyWizard.wizard;
            console.log("ENEMY TURN: Enemy wizard data:", enemyWizard);
            
            // Find any spell the enemy can cast
            const availableSpells = enemyWizard.equippedSpells.filter(
              spell => spell.manaCost <= playerTurnComplete.enemyWizard.currentMana
            );
            
            console.log("ENEMY TURN: Available spells:", availableSpells);
            
            // Pick a spell for the enemy
            let enemySpell: Spell;
            
            if (availableSpells.length > 0) {
              enemySpell = availableSpells[0];
              console.log("ENEMY TURN: Selected spell:", enemySpell);
            } else {
              // Create a basic spell if needed
              enemySpell = {
                id: `emergency_spell_${Date.now()}`,
                name: "Emergency Magic",
                description: "A basic magical attack",
                manaCost: 0,
                tier: 1,
                type: "attack" as any,
                element: "arcane" as any,
                effects: [
                  {
                    type: "damage" as any,
                    value: 5,
                    target: "enemy",
                    element: "arcane"
                  }
                ],
                imagePath: '/images/spells/default-placeholder.jpg'
              };
              console.log("ENEMY TURN: Created emergency spell:", enemySpell);
            }
            
            // Execute enemy spell
            const enemyStateWithSpell = selectSpell(playerTurnComplete, enemySpell, false);
            console.log("ENEMY TURN: Enemy selected spell, state:", enemyStateWithSpell);
            
            const enemyTurnComplete = executeSpellCast(enemyStateWithSpell, false);
            console.log("ENEMY TURN: Enemy spell executed, final state:", enemyTurnComplete);
            
            // Wait a moment before hiding the indicator
            setTimeout(() => {
              // Hide the enemy turn indicator
              setIsEnemyTurnIndicatorVisible(false);
              
              // Update with the final state after both turns
              setCombatState(enemyTurnComplete);
              
              // Reset animation state
              setTimeout(() => {
                setIsAnimating(false);
                console.log("COMPLETE: Both turns finished, animation reset");
              }, 500);
            }, 1000);
          } catch (error) {
            console.error("Error in enemy turn:", error);
            // If enemy turn fails, still update with player's turn
            setCombatState(playerTurnComplete);
            setIsAnimating(false);
            setIsEnemyTurnIndicatorVisible(false);
          }
        }, 1000); // Wait 1 second after showing indicator before executing enemy turn
      }, 1000); // Wait 1 second after player's turn before showing enemy turn indicator
    } catch (error) {
      console.error("Error skipping turn:", error);
      setIsAnimating(false);
      setIsEnemyTurnIndicatorVisible(false);
    }
  };

  // Keep our safety timeout but make it longer
  useEffect(() => {
    if (combatState && combatState.status === 'active') {
      const checkTimeout = setTimeout(() => {
        if (isAnimating) {
          console.log("Animation safety timeout: Animation stuck for too long, forcing it to end");
          setIsAnimating(false);
          
          // Also reset the turn if we detected a stuck state
          if (!combatState.isPlayerTurn) {
            console.log("Animation safety: Forced turn reset to player");
            setCombatState({
              ...combatState,
              isPlayerTurn: true
            });
          }
        }
      }, 5000); // 5 seconds
      
      return () => clearTimeout(checkTimeout);
    }
  }, [combatState, isAnimating]);

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
      
      {/* Enemy turn indicator */}
      {isEnemyTurnIndicatorVisible && (
        <div className="enemy-turn-indicator">
          <div className="enemy-turn-indicator__content">
            <h3>Enemy's Turn</h3>
            <p>{combatState.enemyWizard.wizard.name} is casting a spell...</p>
          </div>
        </div>
      )}
      
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