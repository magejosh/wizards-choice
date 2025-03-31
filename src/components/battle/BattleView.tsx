import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BattleArena from './BattleArena';
import { Spell, CombatState, CombatLogEntry } from '../../lib/types';
import { 
  initializeCombat, 
  selectSpell, 
  executeMysticPunch, 
  executeSpellCast 
} from '../../lib/combat/combatEngine';
import { useGameStateStore } from '../../lib/game-state/gameStateStore';
import '@/app/battle/battle.css';

interface BattleViewProps {
  onReturnToWizardStudy: () => void;
}

const BattleView: React.FC<BattleViewProps> = ({ onReturnToWizardStudy }) => {
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [selectedSpellForMysticPunch, setSelectedSpellForMysticPunch] = useState<Spell | null>(null);
  const [showMysticPunchSelection, setShowMysticPunchSelection] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnemyTurnIndicatorVisible, setIsEnemyTurnIndicatorVisible] = useState(false);
  const [battleLog, setBattleLog] = useState<CombatLogEntry[]>([]);
  
  // Use refs to track state that shouldn't trigger re-renders
  const isProcessingEndRef = useRef(false);
  const isHandlingAITurnRef = useRef(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get game state from store
  const { 
    gameState,
    addExperience,
    saveGame
  } = useGameStateStore();
  
  // Initialize combat once
  useEffect(() => {
    if (isInitialized) return;
    
    // Check if we're coming from wizard's study (valid entry point)
    const { currentLocation } = gameState.gameProgress;
    
    console.log('Battle page initialization, current location:', currentLocation);
    
    // Accept either 'duel' or 'wizardStudy' as valid entry points to prevent navigation issues
    if (currentLocation !== 'duel' && currentLocation !== 'wizardStudy') {
      console.log('Invalid navigation to battle - aborting');
      return;
    }
    
    // Set current location to 'duel' to ensure battle state is maintained
    useGameStateStore.getState().setCurrentLocation('duel');
    
    // Generate enemy wizard
    const playerWizard = gameState.player;
    console.log("Player wizard for battle:", playerWizard.name, "Level:", playerWizard.level);
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

    // Initialize battle log with starting message
    setBattleLog([{
      turn: 1,
      round: 1,
      actor: 'player',
      action: 'combat_start',
      timestamp: Date.now()
    }]);
  }, []);
  
  // Update battle log when combat state changes
  useEffect(() => {
    if (!combatState || !combatState.log) return;
    setBattleLog(combatState.log);
  }, [combatState]);
  
  // Handle game end
  useEffect(() => {
    if (!combatState || 
        combatState.status === 'active' || 
        isProcessingEndRef.current) {
      return;
    }
    
    // Prevent multiple executions
    isProcessingEndRef.current = true;
    
    // IMPORTANT: Close ALL possible modals immediately
    setShowMysticPunchSelection(false);
    setIsEnemyTurnIndicatorVisible(false);
    
    // Also clear animation flags
    setIsAnimating(false);
    
    // Cancel any lingering animation timeouts
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    
    console.log("COMBAT END: Processing battle end, status =", combatState.status);
    
    // Process victory or defeat - shared logic
    try {
      if (combatState.status === 'playerWon') {
        // Calculate experience based on difficulty
        const experienceMultiplier = 
          combatState.difficulty === 'easy' ? 10 : 
          combatState.difficulty === 'normal' ? 1 : 0.1;
        
        const enemyWizard = combatState.enemyWizard.wizard;
        const experience = Math.round(enemyWizard.level * 100 * experienceMultiplier);
        
        // Award experience to player
        addExperience(experience);

        // Add victory message to battle log
        setBattleLog(prev => [...prev, {
          turn: combatState.turn,
          round: combatState.round,
          actor: 'player',
          action: 'victory',
          timestamp: Date.now()
        }]);
      } else if (combatState.status === 'enemyWon') {
        // Add defeat message to battle log
        setBattleLog(prev => [...prev, {
          turn: combatState.turn,
          round: combatState.round,
          actor: 'enemy',
          action: 'victory',
          timestamp: Date.now()
        }]);
      }
      
      // Common logic for both victory and defeat
      
      // Update location to wizardStudy
      console.log("COMBAT END: Setting current location to wizardStudy");
      useGameStateStore.getState().setCurrentLocation('wizardStudy');
      
      // Save game state
      console.log("COMBAT END: Saving game state");
      saveGame();
      
      // Note: We don't navigate here - let the user click the continue button
    } catch (error) {
      console.error("Error processing battle end:", error);
    }
  }, [combatState?.status, addExperience, saveGame]);

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
      
      // Update state with selected spell
      const playerStateWithSpell = selectSpell(combatState, validatedSpell, true);
      
      // Execute the spell immediately
      const playerTurnComplete = executeSpellCast(playerStateWithSpell, true);

      // Add spell cast to battle log
      setBattleLog(prev => [...prev, {
        turn: combatState.turn,
        round: combatState.round,
        actor: 'player',
        action: 'cast_spell',
        details: spell.name,
        timestamp: Date.now()
      }]);
      
      // STEP 2: ENEMY TURN - process it after a delay with visual indicator
      setTimeout(() => {
        // Show enemy turn indicator
        setIsEnemyTurnIndicatorVisible(true);
        
        setTimeout(() => {
          try {
            // Get the enemy wizard info
            const enemyWizard = playerTurnComplete.enemyWizard.wizard;
            
            // Find any spell the enemy can cast
            const availableSpells = enemyWizard.equippedSpells.filter(
              spell => spell.manaCost <= playerTurnComplete.enemyWizard.currentMana
            );
            
            // Pick a spell for the enemy
            let enemySpell: Spell;
            
            if (availableSpells.length > 0) {
              enemySpell = availableSpells[0];
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
            }
            
            // Execute enemy spell
            const enemyStateWithSpell = selectSpell(playerTurnComplete, enemySpell, false);
            const enemyTurnComplete = executeSpellCast(enemyStateWithSpell, false);

            // Add enemy spell cast to battle log
            setBattleLog(prev => [...prev, {
              turn: combatState.turn,
              round: combatState.round,
              actor: 'enemy',
              action: 'cast_spell',
              details: enemySpell.name,
              timestamp: Date.now()
            }]);
            
            // Wait a moment before hiding the indicator
            setTimeout(() => {
              // Hide the enemy turn indicator
              setIsEnemyTurnIndicatorVisible(false);
              
              // Update with the final state after both turns
              setCombatState(enemyTurnComplete);
              
              // Reset animation state
              setTimeout(() => {
                setIsAnimating(false);
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

  // Execute mystic punch with selected spell
  const executeMysticPunchWithSpell = (spell: Spell) => {
    if (!combatState || isAnimating) return;
    
    setIsAnimating(true);
    
    try {
      // Hide selection modal
      setShowMysticPunchSelection(false);
      
      // Execute mystic punch with the spell tier
      const playerTurnComplete = executeMysticPunch(
        combatState,
        spell.tier,
        true // isPlayer = true
      );

      // Add mystic punch to battle log
      setBattleLog(prev => [...prev, {
        turn: combatState.turn,
        round: combatState.round,
        actor: 'player',
        action: 'use_mystic_punch',
        details: spell.name,
        timestamp: Date.now()
      }]);
      
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
            // Get the enemy wizard info
            const enemyWizard = playerTurnComplete.enemyWizard.wizard;
            
            // Find any spell the enemy can cast
            const availableSpells = enemyWizard.equippedSpells.filter(
              spell => spell.manaCost <= playerTurnComplete.enemyWizard.currentMana
            );
            
            // Pick a spell for the enemy
            let enemySpell: Spell;
            
            if (availableSpells.length > 0) {
              enemySpell = availableSpells[0];
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
            }
            
            // Execute enemy spell
            const enemyStateWithSpell = selectSpell(playerTurnComplete, enemySpell, false);
            const enemyTurnComplete = executeSpellCast(enemyStateWithSpell, false);

            // Add enemy spell cast to battle log
            setBattleLog(prev => [...prev, {
              turn: combatState.turn,
              round: combatState.round,
              actor: 'enemy',
              action: 'cast_spell',
              details: enemySpell.name,
              timestamp: Date.now()
            }]);
            
            // Wait a moment before hiding the indicator
            setTimeout(() => {
              // Hide the enemy turn indicator
              setIsEnemyTurnIndicatorVisible(false);
              
              // Update with the final state after both turns
              setCombatState(enemyTurnComplete);
              
              // Reset animation state
              setTimeout(() => {
                setIsAnimating(false);
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

  // Handle skip turn
  const handleSkipTurn = () => {
    if (!combatState || !combatState.isPlayerTurn || isAnimating) return;
    
    setIsAnimating(true);
    
    try {
      // Create a log entry for skipping the turn
      const skipTurnLog: CombatLogEntry = {
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

      // Add skip turn to battle log
      setBattleLog(prev => [...prev, skipTurnLog]);
      
      // STEP 2: ENEMY TURN - process it after a delay with visual indicator
      setTimeout(() => {
        // Show enemy turn indicator
        setIsEnemyTurnIndicatorVisible(true);
        
        setTimeout(() => {
          try {
            // Get the enemy wizard info
            const enemyWizard = playerTurnComplete.enemyWizard.wizard;
            
            // Find any spell the enemy can cast
            const availableSpells = enemyWizard.equippedSpells.filter(
              spell => spell.manaCost <= playerTurnComplete.enemyWizard.currentMana
            );
            
            // Pick a spell for the enemy
            let enemySpell: Spell;
            
            if (availableSpells.length > 0) {
              enemySpell = availableSpells[0];
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
            }
            
            // Execute enemy spell
            const enemyStateWithSpell = selectSpell(playerTurnComplete, enemySpell, false);
            const enemyTurnComplete = executeSpellCast(enemyStateWithSpell, false);

            // Add enemy spell cast to battle log
            setBattleLog(prev => [...prev, {
              turn: combatState.turn,
              round: combatState.round,
              actor: 'enemy',
              action: 'cast_spell',
              details: enemySpell.name,
              timestamp: Date.now()
            }]);
            
            // Wait a moment before hiding the indicator
            setTimeout(() => {
              // Hide the enemy turn indicator
              setIsEnemyTurnIndicatorVisible(false);
              
              // Update with the final state after both turns
              setCombatState(enemyTurnComplete);
              
              // Reset animation state
              setTimeout(() => {
                setIsAnimating(false);
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

  // Determine game status for BattleArena
  let gameStatus: 'active' | 'playerWon' | 'enemyWon' = 'active';
  if (combatState.status === 'playerWon') {
    gameStatus = 'playerWon';
  } else if (combatState.status === 'enemyWon') {
    gameStatus = 'enemyWon';
  }

  return (
    <div className="battle-page">
      <BattleArena
        playerHealth={combatState.playerWizard.currentHealth}
        playerMaxHealth={combatState.playerWizard.wizard.maxHealth}
        playerMana={combatState.playerWizard.currentMana}
        playerMaxMana={combatState.playerWizard.wizard.maxMana}
        playerActiveEffects={combatState.playerWizard.activeEffects}
        enemyHealth={combatState.enemyWizard.currentHealth}
        enemyMaxHealth={combatState.enemyWizard.wizard.maxHealth}
        enemyMana={combatState.enemyWizard.currentMana}
        enemyMaxMana={combatState.enemyWizard.wizard.maxMana}
        enemyActiveEffects={combatState.enemyWizard.activeEffects}
        spells={combatState.playerWizard.hand}
        battleLog={battleLog}
        onSpellCast={handleSpellSelect}
        onMysticPunch={handleMysticPunch}
        onSkipTurn={handleSkipTurn}
        onExitBattle={onReturnToWizardStudy}
        isPlayerTurn={combatState.isPlayerTurn}
        round={combatState.round}
        turn={combatState.turn}
        animating={isAnimating}
        canCastSpell={(spell) => combatState.isPlayerTurn && combatState.playerWizard.currentMana >= spell.manaCost}
        canUseMysticPunch={combatState.isPlayerTurn}
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
};

export default BattleView; 