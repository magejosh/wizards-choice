import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BattleArena from './BattleArena';
import BattleEndModal from './BattleEndModal';
import { Spell, CombatState, CombatLogEntry } from '../../lib/types';
import { 
  initializeCombat, 
  selectSpell, 
  executeMysticPunch, 
  executeSpellCast 
} from '../../lib/combat/combatEngine';
import { useGameStateStore } from '../../lib/game-state/gameStateStore';
import { generateLoot, applyLoot, LootDrop } from '../../lib/features/loot/lootSystem';
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
  const [hasLootedEnemy, setHasLootedEnemy] = useState(false);
  const [lootNotification, setLootNotification] = useState<{show: boolean, message: string}>({show: false, message: ''});
  
  // Use refs to track state that shouldn't trigger re-renders
  const isProcessingEndRef = useRef(false);
  const isHandlingAITurnRef = useRef(false);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get game state from store
  const { 
    gameState,
    addExperience,
    saveGame,
    updateGameState
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
          combatState.difficulty === 'normal' ? 1 : 
          combatState.difficulty === 'hard' ? 0.1 : 1; // explicit hard case, default to normal
        
        const enemyWizard = combatState.enemyWizard.wizard;
        const experience = Math.round(enemyWizard.level * 10 * experienceMultiplier); // changed 100 to 10
        
        console.log('Adding experience:', experience, 'Difficulty multiplier:', experienceMultiplier);
        
        // Add experience to player
        addExperience(experience);

        // Force save
        saveGame();
        
        // Add victory message to battle log
        setBattleLog(prev => [...prev, {
          turn: combatState.turn,
          round: combatState.round,
          actor: 'player',
          action: 'victory',
          details: `Gained ${experience} experience!`,
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
      
      // Save game state but don't change location yet
      // Location will be changed when user clicks Continue button
      console.log("COMBAT END: Saving game state");
      saveGame();
      
      // Note: We don't navigate here - let the user click the continue button
      // Location will be set by onReturnToWizardStudy function
    } catch (error) {
      console.error("Error processing battle end:", error);
    }
  }, [combatState?.status, addExperience, saveGame]);

  // Handle enemy looting
  const handleLootEnemy = () => {
    if (!combatState || hasLootedEnemy) return;
    
    try {
      console.log("Looting enemy wizard");
      
      const difficulty = combatState.difficulty;
      const playerWizard = gameState.player;
      const enemyWizard = combatState.enemyWizard.wizard;
      
      // Determine success chance based on difficulty experienceMultiplier
      let successChance = 0;
      const experienceMultiplier = 
        difficulty === 'easy' ? 10 : 
        difficulty === 'normal' ? 1 : 
        difficulty === 'hard' ? 0.1 : 1;
      
      // 10 times the experienceMultiplier as percentage
      successChance = experienceMultiplier * 10;
      
      // For debugging, temporarily make success more likely
      console.log(`Loot success chance: ${successChance}%`);
      const roll = Math.random() * 100;
      const isLootingSuccessful = roll <= successChance;
      console.log(`Loot roll: ${roll}, Success: ${isLootingSuccessful}`);
      
      if (isLootingSuccessful) {
        // Generate loot using the lootSystem
        let lootDrop = generateLoot(
          playerWizard,
          enemyWizard,
          true, // isWizardEnemy
          difficulty
        );
        
        console.log("Generated loot:", lootDrop);
        
        // Convert any spells to scrolls instead of directly adding them to the spell library
        const scrollsFromSpells = lootDrop.spells.map(spell => ({
          id: `scroll_${spell.id}_${Date.now()}`,
          name: `Scroll: ${spell.name}`,
          description: `A magical scroll containing the spell: ${spell.name}`,
          type: 'scroll' as const,
          rarity: spell.tier <= 2 ? 'common' as const : 
                 spell.tier <= 4 ? 'uncommon' as const : 
                 spell.tier <= 6 ? 'rare' as const : 
                 'epic' as const,
          spell: spell,
          imagePath: spell.imagePath
        }));
        
        // Remove spells from loot and add them as scrolls
        lootDrop = {
          ...lootDrop,
          spells: [],
          scrolls: [...lootDrop.scrolls, ...scrollsFromSpells]
        };
        
        // Calculate gold based on enemy level and difficulty
        const goldAmount = Math.floor((Math.random() * 30 + 20) * enemyWizard.level * experienceMultiplier);
        
        // Apply the loot to the player
        console.log("Player before applying loot:", playerWizard);
        const updatedWizard = applyLoot(playerWizard, lootDrop);
        console.log("Player after applying loot:", updatedWizard);
        
        // Add gold to the market data
        let updatedMarketData = {
          ...gameState.marketData,
          gold: (gameState.marketData.gold || 0) + goldAmount
        };
        console.log("Updated market data with gold:", updatedMarketData);
        
        // Update the game state directly using set state
        useGameStateStore.setState((state) => ({
          gameState: {
            ...state.gameState,
            player: updatedWizard,
            marketData: updatedMarketData
          }
        }));
        
        // Force a save immediately
        setTimeout(() => {
          saveGame();
          console.log("Game saved after loot applied");
          
          // Double-check that state was updated correctly
          const currentState = useGameStateStore.getState().gameState;
          console.log("Current player state after save:", currentState.player);
          console.log("Current market data after save:", currentState.marketData);
        }, 100);
        
        // Generate loot notification message
        let lootMessage = "You looted: ";
        if (scrollsFromSpells.length > 0) {
          lootMessage += `${scrollsFromSpells.length} spell scroll${scrollsFromSpells.length !== 1 ? 's' : ''} (${scrollsFromSpells.map(s => s.name.replace('Scroll: ', '')).join(', ')}), `;
        }
        if (lootDrop.equipment.length > 0) {
          lootMessage += `${lootDrop.equipment.length} equipment item${lootDrop.equipment.length !== 1 ? 's' : ''}, `;
        }
        if (lootDrop.ingredients.length > 0) {
          lootMessage += `${lootDrop.ingredients.length} ingredient${lootDrop.ingredients.length !== 1 ? 's' : ''}, `;
        }
        if (lootDrop.scrolls.length - scrollsFromSpells.length > 0) {
          const originalScrollCount = lootDrop.scrolls.length - scrollsFromSpells.length;
          lootMessage += `${originalScrollCount} additional scroll${originalScrollCount !== 1 ? 's' : ''}, `;
        }
        lootMessage += `and ${goldAmount} gold!`;
        
        // Show loot notification
        setLootNotification({
          show: true,
          message: lootMessage
        });
        
        // Add loot message to battle log
        setBattleLog(prev => [...prev, {
          turn: combatState.turn,
          round: combatState.round,
          actor: 'player',
          action: 'loot',
          details: lootMessage,
          timestamp: Date.now()
        }]);
      } else {
        // Looting failed
        setLootNotification({
          show: true,
          message: "You didn't find anything valuable on the enemy."
        });
        
        // Add failure message to battle log
        setBattleLog(prev => [...prev, {
          turn: combatState.turn,
          round: combatState.round,
          actor: 'player',
          action: 'loot',
          details: "Failed to find anything valuable.",
          timestamp: Date.now()
        }]);
      }
      
      // Mark enemy as looted
      setHasLootedEnemy(true);
      
      // Hide notification after 5 seconds
      setTimeout(() => {
        setLootNotification({show: false, message: ''});
      }, 5000);
      
    } catch (error) {
      console.error("Error looting enemy:", error);
      setLootNotification({
        show: true,
        message: "Error occurred while looting."
      });
      setTimeout(() => {
        setLootNotification({show: false, message: ''});
      }, 5000);
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
      
      // Make sure the spell has required properties
      const validatedSpell: Spell = {
        ...spell,
        effects: spell.effects || [],
        imagePath: spell.imagePath || '/images/spells/default-placeholder.jpg'
      };
      
      // STEP 1: PLAYER TURN - First select the spell
      const playerStateWithSpell = selectSpell(combatState, validatedSpell, true);
      
      // Execute mystic punch with the spell tier
      const playerTurnComplete = executeMysticPunch(
        playerStateWithSpell,
        validatedSpell.tier,
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

  // Create a wrapped version of onReturnToWizardStudy to ensure game is saved before returning
  const handleReturnToWizardStudy = () => {
    try {
      // Force an immediate state refresh
      const currentState = useGameStateStore.getState().gameState;
      console.log("Current game state before returning:", currentState);
      
      // Ensure we set the location properly
      useGameStateStore.setState((state) => ({
        gameState: {
          ...state.gameState,
          gameProgress: {
            ...state.gameState.gameProgress,
            currentLocation: 'wizardStudy'
          }
        }
      }));
      
      // Final save to ensure all changes are persisted
      saveGame();
      console.log("Saving game before returning to wizard's study");
      
      // Short delay to ensure save completes
      setTimeout(() => {
        // Double-check that our state is correctly persisted
        const finalState = useGameStateStore.getState().gameState;
        console.log("Final player state:", finalState.player);
        console.log("Final market data:", finalState.marketData);
        
        // Call the original handler
        onReturnToWizardStudy();
      }, 200); // Slightly longer delay to ensure save completes
    } catch (error) {
      console.error("Error saving game before returning to wizard's study:", error);
      // Call the original handler even if there was an error
      onReturnToWizardStudy();
    }
  };

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
    <div className="battle-view">
      {combatState && (
        <>
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
            onExitBattle={handleReturnToWizardStudy}
            isPlayerTurn={combatState.isPlayerTurn}
            round={combatState.round}
            turn={combatState.turn}
            animating={isAnimating}
            canCastSpell={(spell) => combatState.isPlayerTurn && combatState.playerWizard.currentMana >= spell.manaCost}
            canUseMysticPunch={combatState.isPlayerTurn}
          />
          
          {/* Combat Status HUD */}
          <div className="battle-status-hud">
            <h3>Turn: {combatState.turn} | Round: {combatState.round}</h3>
            <p>{combatState.isPlayerTurn ? "Your Turn" : "Enemy's Turn"}</p>
          </div>
          
          {/* Loot Notification */}
          {lootNotification.show && (
            <div className="loot-notification" style={{
              position: 'fixed',
              top: '20%',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#1a1a2e',
              border: '2px solid #e94560',
              borderRadius: '8px',
              padding: '15px',
              zIndex: 10000,
              color: 'white',
              boxShadow: '0 0 20px rgba(233, 69, 96, 0.7)',
              maxWidth: '80%',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#e94560', marginBottom: '10px' }}>Loot Results</h3>
              <p>{lootNotification.message}</p>
            </div>
          )}
          
          {/* Battle End Modal */}
          <BattleEndModal 
            status={combatState.status} 
            onContinue={handleReturnToWizardStudy}
            onLootEnemy={combatState.status === 'playerWon' ? handleLootEnemy : undefined}
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
          
          {/* Mystic Punch Spell Selection Modal */}
          {showMysticPunchSelection && (
            <div className="modal mystic-punch-modal">
              <div className="modal-content">
                <h2>Select Spell for Mystic Punch</h2>
                <p>Select a spell to amplify your mystic punch</p>
                <div className="spell-grid">
                  {combatState.playerWizard.hand.map(spell => (
                    <div 
                      key={spell.id} 
                      className="spell-card"
                      onClick={() => {
                        setSelectedSpellForMysticPunch(spell);
                        setShowMysticPunchSelection(false);
                        executeMysticPunchWithSpell(spell);
                      }}
                    >
                      <h3>{spell.name}</h3>
                      <p>{spell.description}</p>
                    </div>
                  ))}
                </div>
                <button 
                  className="modal-close-btn"
                  onClick={() => setShowMysticPunchSelection(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BattleView; 



