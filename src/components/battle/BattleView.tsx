import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import BattleArena from './BattleArena';
import BattleEndModal from './BattleEndModal';
import { Spell, CombatState, CombatLogEntry } from '../../lib/types';
import { 
  initializeCombat, 
  selectSpell, 
  executeMysticPunch, 
  executeSpellCast,
  skipTurn,
  discardSpell,
  processDiscardPhase,
  advanceTurn
} from '../../lib/combat/combatEngine';
import { useGameStateStore } from '../../lib/game-state/gameStateStore';
import { generateLoot, applyLoot, LootDrop } from '../../lib/features/loot/lootSystem';
import '@/app/battle/battle.css';

// Define battle phases
type BattlePhase = 
  | 'draw' 
  | 'shuffle' 
  | 'player_main' 
  | 'enemy_main' 
  | 'player_reaction' 
  | 'enemy_reaction' 
  | 'discard' 
  | 'end';

// Maximum number of cards a player can have in hand before requiring discard
const MAX_HAND_SIZE = 2;

interface BattleViewProps {
  onReturnToWizardStudy: () => void;
}

const BattleView: React.FC<BattleViewProps> = ({ onReturnToWizardStudy }) => {
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [selectedSpellForMysticPunch, setSelectedSpellForMysticPunch] = useState<Spell | null>(null);
  const [showMysticPunchSelection, setShowMysticPunchSelection] = useState(false);
  const [showDiscardSelection, setShowDiscardSelection] = useState(false);
  const [numCardsToDiscard, setNumCardsToDiscard] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isEnemyTurnIndicatorVisible, setIsEnemyTurnIndicatorVisible] = useState(false);
  const [battleLog, setBattleLog] = useState<CombatLogEntry[]>([]);
  const [hasLootedEnemy, setHasLootedEnemy] = useState(false);
  const [lootNotification, setLootNotification] = useState<{show: boolean, message: string}>({show: false, message: ''});
  const [currentPhase, setCurrentPhase] = useState<BattlePhase>('player_main');
  
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
  
  // Update the current phase based on combat state changes
  useEffect(() => {
    if (!combatState) return;
    
    // Set phase based on current state
    if (showDiscardSelection) {
      setCurrentPhase('discard');
    } else if (combatState.isPlayerTurn) {
      setCurrentPhase('player_main');
    } else {
      setCurrentPhase('enemy_main');
    }
  }, [combatState?.isPlayerTurn, showDiscardSelection]);
  
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
    setCurrentPhase('player_main');

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
    setCurrentPhase('player_main');
    
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
        details: validatedSpell.name,
        timestamp: Date.now()
      }]);
      
      // Update combat state with player's turn result
      setCombatState(playerTurnComplete);
      
      // Check if combat ended 
      if (playerTurnComplete.status !== 'active') {
        // The game end will be handled by the useEffect
        setTimeout(() => setIsAnimating(false), 500);
        return;
      }
      
      // Wait for animation and then process enemy turn
      setTimeout(() => {
        // Show enemy turn indicator
        setIsEnemyTurnIndicatorVisible(true);
        setCurrentPhase('enemy_main');
        
        setTimeout(() => {
          // Process enemy turn
          processEnemyTurn(playerTurnComplete);
        }, 1000);
      }, 1000);
    } catch (error) {
      console.error("Error in spell selection:", error);
      setIsAnimating(false);
      setIsEnemyTurnIndicatorVisible(false);
    }
  };

  // Handle mystic punch selection
  const handleMysticPunchSelect = (spell: Spell) => {
    if (!combatState || !combatState.isPlayerTurn || isAnimating) return;
    
    console.log(`DEBUG: Selected spell for Mystic Punch: ${spell.name} (ID: ${spell.id})`);
    
    // Store the selected spell for mystic punch
    setSelectedSpellForMysticPunch(spell);
    
    // Close the selection modal
    setShowMysticPunchSelection(false);
    
    // Execute mystic punch immediately with the selected spell - pass it directly
    handleMysticPunch(spell);
  };

  // Execute a mystic punch with the selected spell
  const handleMysticPunch = (spellToUse?: Spell) => {
    // Use either the passed spell or the one from state
    const spellForPunch = spellToUse || selectedSpellForMysticPunch;
    
    if (!combatState || !combatState.isPlayerTurn || isAnimating) {
      console.log("DEBUG: Cannot execute Mystic Punch - conditions not met:", { 
        'combatState exists': !!combatState,
        'isPlayerTurn': combatState?.isPlayerTurn,
        'isAnimating': isAnimating,
        'selectedSpell': spellForPunch?.name || 'none'
      });
      return;
    }
    
    if (!spellForPunch) {
      console.log("DEBUG: No spell selected for Mystic Punch");
      return;
    }
    
    console.log("DEBUG: Executing Mystic Punch with spell:", spellForPunch.name);
    setIsAnimating(true);
    setCurrentPhase('player_main');
    
    try {
      // STEP 1: PLAYER TURN
      console.log("PLAYER TURN: Player using mystic punch with spell:", spellForPunch.name);
      
      // First, select the spell in the combat state
      const stateWithSelectedSpell = selectSpell(combatState, spellForPunch, true);
      
      // Execute mystic punch using the selected spell's tier
      const spellTier = spellForPunch.tier;
      const playerTurnComplete = executeMysticPunch(stateWithSelectedSpell, spellTier, true);
      
      // Add to battle log
      setBattleLog(prev => [...prev, {
        turn: combatState.turn,
        round: combatState.round,
        actor: 'player',
        action: 'mystic_punch',
        details: `Used ${spellForPunch.name} for Mystic Punch`,
        timestamp: Date.now()
      }]);
      
      // Debug log to check hand size after mystic punch
      console.log('DEBUG: Player hand size after mystic punch:', playerTurnComplete.playerWizard.hand.length);
      console.log('DEBUG: Player hand after mystic punch:', playerTurnComplete.playerWizard.hand);
      
      // Update combat state with player's turn result
      setCombatState(playerTurnComplete);
      setSelectedSpellForMysticPunch(null);
      
      // Check if combat ended 
      if (playerTurnComplete.status !== 'active') {
        // The game end will be handled by the useEffect
        setTimeout(() => setIsAnimating(false), 500);
        return;
      }
      
      // Wait for animation and then process enemy turn
      setTimeout(() => {
        // Show enemy turn indicator
        setIsEnemyTurnIndicatorVisible(true);
        setCurrentPhase('enemy_main');
        
        setTimeout(() => {
          // Process enemy turn
          processEnemyTurn(playerTurnComplete);
        }, 1000);
      }, 1000);
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
    setCurrentPhase('player_main');
    
    // Log the action
    console.log('Skipping turn');
    
    // Skip the player's turn
    const newState = skipTurn(combatState, true);
    setCombatState(newState);
    
    // Check if the combat has ended
    if (newState.status !== 'active') {
      // The game end will be handled by the useEffect that watches combat state
      setIsAnimating(false);
      return;
    }
    
    // Wait for animation and then process enemy turn
    setTimeout(() => {
      setIsEnemyTurnIndicatorVisible(true);
      setCurrentPhase('enemy_main');
      
      setTimeout(() => {
        // Process enemy turn
        processEnemyTurn(newState);
      }, 1000);
    }, 1000);
  };

  // Handle enemy turn processing
  const processEnemyTurn = (state: CombatState) => {
    try {
      // Get the enemy wizard info
      const enemyWizard = state.enemyWizard.wizard;
      
      // Find any spell the enemy can cast
      const availableSpells = enemyWizard.equippedSpells.filter(
        spell => spell.manaCost <= state.enemyWizard.currentMana
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
      const enemyStateWithSpell = selectSpell(state, enemySpell, false);
      const enemyTurnComplete = executeSpellCast(enemyStateWithSpell, false);

      // Add enemy spell cast to battle log
      setBattleLog(prev => [...prev, {
        turn: state.turn,
        round: state.round,
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
        
        // Debug log for hand size
        console.log('DEBUG: Player hand size after enemy turn:', enemyTurnComplete.playerWizard.hand.length);
        
        // REMOVE DISCARD CHECK: The discard phase is already handled by the combatEngine
        // in the advanceTurn function, which also handles drawing new cards.
        // We're now in a new round with freshly drawn cards.
        
        // Show draw phase animation
        setCurrentPhase('draw');
        
        // Small delay before switching to player's main phase
        setTimeout(() => {
          if (enemyTurnComplete.status === 'active') {
            setCurrentPhase('player_main');
          }
        }, 1500);
        
        // Reset animation state
        setTimeout(() => {
          setIsAnimating(false);
        }, 500);
      }, 1000);
    } catch (error) {
      console.error("Error in enemy turn:", error);
      // If enemy turn fails, still update UI state
      setIsAnimating(false);
      setIsEnemyTurnIndicatorVisible(false);
    }
  };

  // Handle player's discard selection
  const handlePlayerDiscard = (spell: Spell) => {
    if (!combatState) return;
    
    try {
      console.log('DEBUG: Discarding spell:', spell.name);
      console.log('DEBUG: Hand size before discard:', combatState.playerWizard.hand.length);
      
      // Execute the discard
      const updatedState = discardSpell(combatState, spell.id, true);
      
      console.log('DEBUG: Hand size after discard:', updatedState.playerWizard.hand.length);
      setCombatState(updatedState);
      
      // Check if player still needs to discard more (hand size > MAX_HAND_SIZE)
      if (updatedState.playerWizard.hand.length > MAX_HAND_SIZE) {
        const remainingToDiscard = updatedState.playerWizard.hand.length - MAX_HAND_SIZE;
        console.log(`DEBUG: Still need to discard ${remainingToDiscard} more cards`);
        setNumCardsToDiscard(remainingToDiscard);
      } else {
        // All required discards complete - player has MAX_HAND_SIZE or fewer cards
        console.log(`DEBUG: Discard complete, hand size is now ≤ ${MAX_HAND_SIZE}`);
        setShowDiscardSelection(false);
        setNumCardsToDiscard(0);
        setCurrentPhase('end');
        
        // Continue with turn advancement if needed
        if (updatedState.status === 'active') {
          console.log('DEBUG: Advancing turn after discard phase');
          const finalState = advanceTurn(updatedState);
          setCombatState(finalState);
          
          // Show draw phase, then back to player main
          setTimeout(() => {
            setCurrentPhase('draw');
            // Then after a short delay, show shuffle if needed
            setTimeout(() => {
              if (finalState.status === 'active') {
                setCurrentPhase('shuffle');
                // Then after another short delay, back to player main
                setTimeout(() => {
                  if (finalState.status === 'active') {
                    setCurrentPhase('player_main');
                  }
                }, 500);
              }
            }, 500);
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error in discard selection:", error);
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
      console.log("BattleView: Return to wizard study clicked");
      
      // Add transition class immediately to prevent UI flashing
      if (typeof document !== 'undefined') {
        document.body.classList.add('page-transitioning');
        
        // Create a more reliable full-screen loader
        const fullscreenLoader = document.createElement('div');
        fullscreenLoader.id = 'battle-return-loader';
        fullscreenLoader.style.position = 'fixed';
        fullscreenLoader.style.top = '0';
        fullscreenLoader.style.left = '0';
        fullscreenLoader.style.width = '100%';
        fullscreenLoader.style.height = '100%';
        fullscreenLoader.style.backgroundColor = '#0f0f1a';
        fullscreenLoader.style.display = 'flex';
        fullscreenLoader.style.flexDirection = 'column';
        fullscreenLoader.style.justifyContent = 'center';
        fullscreenLoader.style.alignItems = 'center';
        fullscreenLoader.style.zIndex = '99999';
        
        // Add loading spinner
        const spinner = document.createElement('div');
        spinner.style.width = '60px';
        spinner.style.height = '60px';
        spinner.style.border = '5px solid #333';
        spinner.style.borderTop = '5px solid #6a3de8';
        spinner.style.borderRadius = '50%';
        spinner.style.animation = 'spin 1.5s linear infinite';
        spinner.style.marginBottom = '20px';
        
        // Add text
        const text = document.createElement('div');
        text.style.color = 'white';
        text.style.fontFamily = "'Cinzel', serif";
        text.style.fontSize = '24px';
        text.innerText = 'Returning to Wizard\'s Study...';
        
        // Add animation style
        const style = document.createElement('style');
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        
        // Append elements
        fullscreenLoader.appendChild(spinner);
        fullscreenLoader.appendChild(text);
        fullscreenLoader.appendChild(style);
        document.body.appendChild(fullscreenLoader);
      }
      
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
      
      // Save game immediately
      saveGame();
      console.log("Saving game before returning to wizard's study");
      
      // Set localStorage flags for home page detection
      if (typeof window !== 'undefined') {
        localStorage.setItem('forceWizardStudy', 'true');
        localStorage.setItem('comingFromBattleVictory', 'true');
        console.log("Set localStorage flags for battle victory navigation");
        
        // Use a more reliable direct navigation approach
        setTimeout(() => {
          // Replace (not push) to home with the force parameter
          console.log("Executing direct navigation to wizard study");
          window.location.replace('/?forceBattleReturn=true&timestamp=' + Date.now());
        }, 300);
      }
    } catch (error) {
      console.error("Error saving game before returning to wizard's study:", error);
      // Remove transition class if there was an error
      if (typeof document !== 'undefined') {
        document.body.classList.remove('page-transitioning');
        const loader = document.getElementById('battle-return-loader');
        if (loader) {
          document.body.removeChild(loader);
        }
      }
      // Call the original handler as fallback
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
            isPlayerTurn={combatState.isPlayerTurn}
            onMysticPunch={() => {
              console.log("Mystic Punch button clicked, isPlayerTurn:", combatState.isPlayerTurn);
              // Validate that the player can use Mystic Punch
              if (!combatState.isPlayerTurn || isAnimating) {
                console.log("Cannot use Mystic Punch - not player's turn or animation in progress");
                return;
              }
              console.log("Opening Mystic Punch selection modal");
              setShowMysticPunchSelection(true);
            }}
            onSpellCast={handleSpellSelect}
            onSkipTurn={handleSkipTurn} 
            onExitBattle={handleReturnToWizardStudy}
            round={combatState.round}
            turn={combatState.turn}
            animating={isAnimating}
            canCastSpell={(spell) => combatState.isPlayerTurn && combatState.playerWizard.currentMana >= spell.manaCost}
            canUseMysticPunch={combatState.isPlayerTurn && !isAnimating}
          />
          
          {/* Phase Tracker */}
          <div className="phase-tracker" style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            backgroundColor: 'rgba(0,0,0,0.7)',
            borderRadius: '8px',
            padding: '5px 10px',
            zIndex: 1000
          }}>
            {['draw', 'player_main', 'enemy_main', 'discard', 'end'].map((phase) => (
              <div 
                key={phase}
                style={{
                  padding: '5px 10px',
                  margin: '0 5px',
                  backgroundColor: currentPhase === phase ? '#e94560' : 'transparent',
                  color: currentPhase === phase ? 'white' : '#aaa',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: currentPhase === phase ? 'bold' : 'normal',
                  textTransform: 'capitalize'
                }}
              >
                {phase.replace('_', ' ')}
              </div>
            ))}
          </div>
          
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
                        console.log(`Selecting spell for Mystic Punch: ${spell.name}`);
                        // Add a small delay to ensure the user sees the selection
                        const selectedCard = document.getElementById(`mystic-punch-spell-${spell.id}`);
                        if (selectedCard) {
                          selectedCard.classList.add('selected');
                        }
                        
                        // Slight delay to show the selection before closing the modal
                        setTimeout(() => {
                          handleMysticPunchSelect(spell);
                        }, 200);
                      }}
                      id={`mystic-punch-spell-${spell.id}`}
                    >
                      <h3>{spell.name}</h3>
                      <p>{spell.description}</p>
                      <div className="spell-tier">Tier {spell.tier}</div>
                    </div>
                  ))}
                </div>
                <button 
                  className="modal-close-btn"
                  onClick={() => {
                    console.log("Closing Mystic Punch modal");
                    setShowMysticPunchSelection(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Discard Phase Modal */}
          {showDiscardSelection && numCardsToDiscard > 0 && (
            <div className="modal discard-modal">
              <div className="modal-content">
                <h2>Discard Phase</h2>
                <p>
                  {numCardsToDiscard === 1 
                    ? "Select 1 card to discard." 
                    : `Select ${numCardsToDiscard} cards to discard.`}
                </p>
                <div className="spell-grid">
                  {combatState.playerWizard.hand.map(spell => (
                    <div 
                      key={spell.id} 
                      className="spell-card"
                      onClick={() => handlePlayerDiscard(spell)}
                    >
                      <h3>{spell.name}</h3>
                      <p>{spell.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BattleView; 



