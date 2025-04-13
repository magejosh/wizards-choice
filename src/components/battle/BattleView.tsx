import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import BattleArena from './BattleArena';
import BattleEndModal from './BattleEndModal';
import { Spell, CombatState, CombatLogEntry } from '../../lib/types';
import {
  skipTurn,
  advancePhase,
  queueAction
} from '../../lib/combat/phaseManager';
import {
  selectSpell,
  executeMysticPunch,
  executeSpellCast
} from '../../lib/combat/spellExecutor';
import { initializeCombat } from '../../lib/combat/combatInitializer';
import { discardCard, needsToDiscard } from '../../lib/combat/cardManager';
import { PhaseManager } from '../../lib/combat/phaseManager';
import { useGameStateStore, getWizard, updateWizard } from '../../lib/game-state/gameStateStore';
import { generateLoot, applyLoot, LootDrop } from '../../lib/features/loot/lootSystem';
import '@/app/battle/battle.css';
import PhaseTracker from './PhaseTracker';
import InitiativeRoll from './InitiativeRoll';
import { addLogEntry } from '../../lib/combat/battleLogger';
import { battleLogManager } from '../../lib/combat/battleLogManager';
import { calculateExperienceGained } from '../../lib/combat/combatStatusManager';
import { CombatPhase } from '../../lib/types/combat-types';
import SpellCard from '../../components/ui/SpellCard';

// Maximum number of cards a player can have in hand before requiring discard
const MAX_HAND_SIZE = 2;

interface BattleViewProps {
  onReturnToWizardStudy: () => void;
}

// Define a type for initiative roll results
interface InitiativeRollResults {
  playerRoll: number;
  enemyRoll: number;
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
  // Use a custom state setter to ensure entries are always sorted
  const [battleLog, setLogEntries] = useState<CombatLogEntry[]>([]);

  // Custom setter that ensures entries are always sorted by timestamp (newest first)
  const setBattleLog = (entries: CombatLogEntry[]) => {
    // Debug log to help diagnose ordering issues
    console.log('setBattleLog called with', entries.length, 'entries');
    if (entries.length > 0) {
      console.log('First entry before sorting:', entries[0].details);
      console.log('Last entry before sorting:', entries[entries.length - 1].details);
    }

    // Sort entries by timestamp (newest first)
    const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);

    // Debug log after sorting
    if (sortedEntries.length > 0) {
      console.log('First entry after sorting (newest):', sortedEntries[0].details);
      console.log('Last entry after sorting (oldest):', sortedEntries[sortedEntries.length - 1].details);
    }

    // Update state with sorted entries
    setLogEntries(sortedEntries);
  };
  const [hasLootedEnemy, setHasLootedEnemy] = useState(false);
  const [lootNotification, setLootNotification] = useState<{show: boolean, message: string}>({show: false, message: ''});
  const [currentPhase, setCurrentPhase] = useState<CombatPhase>('action');
  const [showInitiativeRoll, setShowInitiativeRoll] = useState(false);
  const [initiativeRolls, setInitiativeRolls] = useState<InitiativeRollResults | null>(null);
  const [experienceGained, setExperienceGained] = useState<number | undefined>(undefined);

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

  // Create phase manager
  const phaseManager = useMemo(() => new PhaseManager(
    setCurrentPhase,
    setCombatState,
    setShowDiscardSelection,
    setNumCardsToDiscard,
    setIsAnimating,
    setShowInitiativeRoll,
    MAX_HAND_SIZE
  ), []);

  // Use phase manager to handle phase changes
  useEffect(() => {
    if (!combatState) return;

    // Log the phase change for debugging
    console.log(`BattleView detected phase change to: ${combatState.currentPhase} in round ${combatState.round}`);

    // Safety check: If we're in initiative phase but the initiative roll UI isn't showing,
    // make sure it gets shown
    if (combatState.currentPhase === 'initiative' && !showInitiativeRoll) {
      console.log('Safety check: In initiative phase but initiative roll UI not showing - fixing');
      setShowInitiativeRoll(true);
    }

    // Let the phase manager handle the phase change
    phaseManager.handlePhaseChange(combatState);
  }, [combatState?.currentPhase, phaseManager, showInitiativeRoll]);

  // Ensure battle log is always sorted by timestamp (newest first)
  useEffect(() => {
    if (battleLog.length > 0) {
      // Sort the battle log entries by timestamp (newest first)
      const sortedEntries = [...battleLog].sort((a, b) => b.timestamp - a.timestamp);

      // Check if the order has changed
      const orderChanged = sortedEntries.some((entry, index) => entry !== battleLog[index]);

      // Only update if the order has changed
      if (orderChanged) {
        console.log('Battle log order changed - re-sorting');
        setLogEntries(sortedEntries);
      }
    }
  }, [battleLog]);

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
    const playerWizard = getWizard();
    if (!playerWizard) {
      console.error('Player wizard not found');
      return;
    }
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
    setCurrentPhase(initialCombatState.currentPhase);

    // Initialize battle log from the combat state
    // Only reset the log at the very beginning of combat, not between rounds
    battleLogManager.resetLog();

    // IMPORTANT: We need to add entries in the correct order with timestamps
    // that will ensure they appear in the right order when sorted by timestamp

    // Get the current timestamp as our base
    const now = Date.now();

    // Add "The duel has begun" message with the OLDEST timestamp
    // This will make it appear at the BOTTOM of the log when sorted newest-first
    battleLogManager.addEntry({
      turn: 1,
      round: 1,
      actor: 'system',
      action: 'combat_start',
      details: 'The duel has begun! May the best wizard win.',
      timestamp: now - 1000 // Make this appear at the very bottom
    });

    // Add "Rolling for initiative..." message with the SECOND OLDEST timestamp
    // This will make it appear SECOND FROM BOTTOM when sorted newest-first
    battleLogManager.addEntry({
      turn: 1,
      round: 1,
      actor: 'system',
      action: 'initiative',
      details: 'Rolling for initiative...',
      timestamp: now - 900 // Make this appear just above "duel has begun"
    });

    // Note: We don't add the initiative roll results here
    // They will be added by the handleInitiativeRollComplete callback
    // after the player sees the dice roll animation

    // Update the combat state log with the battle log manager entries
    initialCombatState.log = battleLogManager.getEntries();
    setBattleLog(battleLogManager.getEntries());

    // Debug log to help diagnose ordering issues
    battleLogManager.debugLog();

    // Important: Show the initiative roll UI as soon as we initialize combat
    if (initialCombatState.currentPhase === 'initiative') {
      console.log('Starting with initiative phase - showing dice roller UI');
      // We don't set initiativeRolls with pre-generated values anymore
      // Let the InitiativeRoll component generate random values
      setShowInitiativeRoll(true);
    }
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
    setShowDiscardSelection(false);
    setNumCardsToDiscard(0);
    setIsEnemyTurnIndicatorVisible(false);
    setShowInitiativeRoll(false);

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
        // Use the centralized experience calculation function
        const experience = calculateExperienceGained(combatState);

        console.log('Adding experience:', experience);

        // Store the experience gained for display in the victory modal
        setExperienceGained(experience);

        // Add experience to player
        addExperience(experience);

        // Force save
        saveGame();

        // Add victory message to battle log using the manager
        battleLogManager.addEntry({
          turn: combatState.turn,
          round: combatState.round,
          actor: 'player',
          action: 'victory',
          details: `Gained ${experience} experience!`
        });

        // Update the battle log state with the latest entries
        setBattleLog(battleLogManager.getEntries());
      } else if (combatState.status === 'enemyWon') {
        // Add defeat message to battle log using the manager
        battleLogManager.addEntry({
          turn: combatState.turn,
          round: combatState.round,
          actor: 'enemy',
          action: 'victory',
          details: 'You were defeated!'
        });

        // Update the battle log state with the latest entries
        setBattleLog(battleLogManager.getEntries());
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
      // Use the same multiplier values as in calculateExperienceGained
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

        // Get the current player
        const currentPlayer = getWizard();
        if (!currentPlayer) {
          console.error('Player not found when applying loot');
          return;
        }

        // Apply the loot to the player
        console.log("Player before applying loot:", currentPlayer);
        const updatedWizard = applyLoot(currentPlayer, lootDrop);
        console.log("Player after applying loot:", updatedWizard);

        // Add gold to the updated wizard
        const currentGold = currentPlayer.gold || 0;
        updatedWizard.gold = currentGold + goldAmount;

        // Update the player in the game state using updateWizard
        // This will update both the save slot and top-level player data
        updateWizard(() => updatedWizard);
        console.log("Added gold to player:", goldAmount);

        // Force a save immediately
        setTimeout(() => {
          saveGame();
          console.log("Game saved after loot applied");

          // Double-check that state was updated correctly
          const currentState = useGameStateStore.getState().gameState;
          console.log("Current player state after save:", currentState.player);
          console.log("Current player gold after save:", currentState.player.gold);
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

        // Add loot message to battle log using the manager
        battleLogManager.addEntry({
          turn: combatState.turn,
          round: combatState.round,
          actor: 'player',
          action: 'loot',
          details: lootMessage
        });

        // Update the battle log state with the latest entries
        setBattleLog(battleLogManager.getEntries());
      } else {
        // Looting failed
        setLootNotification({
          show: true,
          message: "You didn't find anything valuable on the enemy."
        });

        // Add failure message to battle log using the manager
        battleLogManager.addEntry({
          turn: combatState.turn,
          round: combatState.round,
          actor: 'player',
          action: 'loot',
          details: "Failed to find anything valuable."
        });

        // Update the battle log state with the latest entries
        setBattleLog(battleLogManager.getEntries());
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

  // Handle player spell selection with phase-based checking
  const handleSpellSelect = (spell: Spell) => {
    if (!combatState || isAnimating) return;

    // Only allow spell casting during the action or response phases
    if (combatState.currentPhase !== 'action' && combatState.currentPhase !== 'response') {
      console.log(`Cannot cast spell in ${combatState.currentPhase} phase - must be in action or response phase`);
      return;
    }

    // In response phase, only allow reaction type spells
    if (combatState.currentPhase === 'response' && spell.type !== 'reaction') {
      console.log('Only reaction spells can be cast during the response phase');
      return;
    }

    // Don't allow casting if player has already acted in the current phase
    if ((combatState.currentPhase === 'action' && combatState.actionState.player.hasActed) ||
        (combatState.currentPhase === 'response' && combatState.actionState.player.hasResponded)) {
      console.log(`Player has already taken an action in this ${combatState.currentPhase} phase`);
      return;
    }

    // Validate mana cost
    if (spell.manaCost > combatState.playerWizard.currentMana) {
      console.log('Not enough mana to cast this spell');
      return;
    }

    setIsAnimating(true);

    try {
      console.log(`Player queuing spell: ${spell.name} in ${combatState.currentPhase} phase`);

      // Make sure the spell has required properties
      const validatedSpell: Spell = {
        ...spell,
        effects: spell.effects || [],
        imagePath: spell.imagePath || '/images/spells/default-placeholder.jpg'
      };

      // Queue the spell for the resolution phase - DON'T execute immediately
      // If in response phase, mark as a response
      const isResponse = combatState.currentPhase === 'response';
      const updatedState = queueAction(combatState, {
        caster: 'player',
        spell: validatedSpell,
        target: 'enemy'
      }, isResponse);

      // Add to battle log with appropriate action type using the manager
      battleLogManager.addEntry({
        turn: combatState.turn,
        round: combatState.round,
        actor: 'player',
        action: isResponse ? 'cast_response' : 'queue_spell',
        details: isResponse
          ? `You responded with ${validatedSpell.name}`
          : `You queued ${validatedSpell.name}`
      });

      // Update the battle log state with the latest entries from the manager
      setBattleLog(battleLogManager.getEntries());

      // Also update the combat state log
      updatedState.log = battleLogManager.getEntries();

      setCombatState(updatedState);

      // Check if both player and enemy have acted in the action phase
      if (combatState.currentPhase === 'action') {
        if (updatedState.actionState.player.hasActed && updatedState.actionState.enemy.hasActed) {
          // Both have acted, advance to the next phase (should go to response phase)
        setTimeout(() => {
            const nextPhaseState = advancePhase(updatedState);
            setCombatState(nextPhaseState);
            setIsAnimating(false);
          }, 1000);
        }
        // If player acted first and enemy hasn't acted yet, process enemy action
        else if (updatedState.actionState.player.hasActed &&
                !updatedState.actionState.enemy.hasActed &&
                updatedState.firstActor === 'player') {
            setTimeout(() => {
            processEnemyAction(updatedState);
          }, 1000);
        } else {
          // Just reset animation
              setTimeout(() => {
                setIsAnimating(false);
              }, 500);
        }
      }
      // In response phase, advance after player responds
      else if (combatState.currentPhase === 'response') {
        setTimeout(() => {
          const nextPhaseState = advancePhase(updatedState);
          setCombatState(nextPhaseState);
          setIsAnimating(false);
            }, 1000);
      } else {
        // Just reset animation
        setTimeout(() => {
            setIsAnimating(false);
        }, 500);
          }
    } catch (error) {
      console.error("Error in spell selection:", error);
      setIsAnimating(false);
    }
  };

  // Handle mystic punch selection
  const handleMysticPunchSelect = (spell: Spell) => {
    if (!combatState || isAnimating) {
      console.log("Cannot execute Mystic Punch - combatState missing or animation in progress");
      setShowMysticPunchSelection(false);
      return;
    }

    console.log(`DEBUG: Selected spell for Mystic Punch: ${spell.name} (ID: ${spell.id})`);

    // First close the selection modal to prevent duplicate processing
    setShowMysticPunchSelection(false);

    // Set animation flag to prevent further actions while processing
    setIsAnimating(true);

    try {
      // First, select the spell in the combat state
      const stateWithSelectedSpell = selectSpell(combatState, spell, true);

      // IMPORTANT: Mystic Punch executes immediately in the action phase
      // This is different from regular spells which are queued for the resolution phase
      const spellTier = spell.tier || 1;
      const updatedState = executeMysticPunch(stateWithSelectedSpell, spellTier, true);

      // Add to battle log using the manager
      battleLogManager.addEntry({
        turn: combatState.turn,
        round: combatState.round,
        actor: 'player',
        action: 'mystic_punch',
        details: `You used Mystic Punch with ${spell.name}`
      });

      // Update the battle log state with the latest entries from the manager
      setBattleLog(battleLogManager.getEntries());

      // Also update the combat state log
      updatedState.log = battleLogManager.getEntries();

      // Clear the selected spell
      setSelectedSpellForMysticPunch(null);

      // Update action state to mark player as having acted
      const newState = {
        ...updatedState,
        actionState: {
          ...updatedState.actionState,
          player: {
            ...updatedState.actionState.player,
            hasActed: true
          }
        }
      };

      // Update the combat state
      setCombatState(newState);

      // Check if both player and enemy have acted
      if (newState.actionState.player.hasActed && newState.actionState.enemy.hasActed) {
        // Both have acted, advance to the next phase (should be response phase)
            setTimeout(() => {
          const nextPhaseState = advancePhase(newState);
          setCombatState(nextPhaseState);
                setIsAnimating(false);
            }, 1000);
      }
      // If player acted first and enemy hasn't acted yet, process enemy action
      else if (newState.actionState.player.hasActed &&
               !newState.actionState.enemy.hasActed &&
               newState.firstActor === 'player') {
        setTimeout(() => {
          processEnemyAction(newState);
        }, 1000);
      } else {
        setTimeout(() => {
            setIsAnimating(false);
        }, 500);
          }
    } catch (error) {
      console.error("Error executing mystic punch:", error);
      setIsAnimating(false);
      setShowMysticPunchSelection(false);
    }
  };

  // Handle skip turn with phase-based system
  const handleSkipTurn = () => {
    console.log("Skip turn button clicked");
    if (!combatState) {
      console.log("Cannot skip turn - combat state is null");
      return;
    }

    if (isAnimating) {
      console.log("Cannot skip turn - animation in progress");
      return;
    }

    console.log(`Current phase: ${combatState.currentPhase}, Player has acted: ${combatState.actionState.player.hasActed}`);

    // Only allow skipping during action or response phases
    if (combatState.currentPhase !== 'action' && combatState.currentPhase !== 'response') {
      console.log(`Cannot skip turn in ${combatState.currentPhase} phase`);
      return;
    }

    // Check if player has already acted in the current phase
    if ((combatState.currentPhase === 'action' && combatState.actionState.player.hasActed) ||
        (combatState.currentPhase === 'response' && combatState.actionState.player.hasResponded)) {
      console.log(`Player has already taken an action in this ${combatState.currentPhase} phase`);
      return;
    }

    setIsAnimating(true);

    try {
      // Log the action
      console.log(`Skipping turn in ${combatState.currentPhase} phase`);

      // Skip the player's turn - this will update the action state
      const newState = skipTurn(combatState, true);

      // Add to battle log using the manager
      battleLogManager.addEntry({
        turn: combatState.turn,
        round: combatState.round,
        actor: 'player',
        action: 'skip_turn',
        details: 'You skipped your turn'
      });

      // Update the battle log state with the latest entries from the manager
      setBattleLog(battleLogManager.getEntries());

      // Also update the combat state log
      newState.log = battleLogManager.getEntries();

      setCombatState(newState);

      // Check if both player and enemy have acted (in action phase)
      // or if we need to advance to next phase (in response phase)
      if (combatState.currentPhase === 'action') {
        if (newState.actionState.player.hasActed && newState.actionState.enemy.hasActed) {
          // Both have acted, advance to the next phase
      setTimeout(() => {
            const nextPhaseState = advancePhase(newState);
            setCombatState(nextPhaseState);
            setIsAnimating(false);
          }, 1000);
        }
        // If player acted first and enemy hasn't acted yet, process enemy action
        else if (newState.actionState.player.hasActed &&
                 !newState.actionState.enemy.hasActed &&
                 newState.firstActor === 'player') {
        setTimeout(() => {
            processEnemyAction(newState);
          }, 1000);
        } else {
          setTimeout(() => {
            setIsAnimating(false);
          }, 500);
        }
      } else if (combatState.currentPhase === 'response') {
        // In response phase, advance to the next phase
        setTimeout(() => {
          const nextPhaseState = advancePhase(newState);
          setCombatState(nextPhaseState);
          setIsAnimating(false);
        }, 1000);
      } else {
        setTimeout(() => {
          setIsAnimating(false);
        }, 500);
      }
    } catch (error) {
      console.error("Error skipping turn:", error);
      setIsAnimating(false);
    }
  };

  // This function is no longer used - enemy turns are handled by the PhaseManager

  // Handle player's discard selection
  const handlePlayerDiscard = (spell: Spell) => {
    if (!combatState) return;

    try {
      console.log('DEBUG: Discarding spell:', spell.name);
      console.log('DEBUG: Hand size before discard:', combatState.playerWizard.hand.length);

      // Execute the discard using the card manager
      const updatedState = discardCard(combatState, spell.id, true);

      console.log('DEBUG: Hand size after discard:', updatedState.playerWizard.hand.length);

      // Use the cardManager function to check if player still needs to discard
      const { needsDiscard, cardsToDiscard } = needsToDiscard(updatedState, true, MAX_HAND_SIZE);

      if (needsDiscard) {
        console.log(`DEBUG: Still need to discard ${cardsToDiscard} more cards`);
        setNumCardsToDiscard(cardsToDiscard);
        // Update state but keep discard modal open
        setCombatState(updatedState);
      } else {
        // All required discards complete - player has MAX_HAND_SIZE or fewer cards
        console.log(`DEBUG: Discard complete, hand size is now ≤ ${MAX_HAND_SIZE}`);

        // First close the discard modal
        setShowDiscardSelection(false);
        setNumCardsToDiscard(0);

        // Verify that enemy has also completed discarding
        if (updatedState.enemyWizard.hand.length <= MAX_HAND_SIZE) {
          // Both player and enemy have completed discarding, advance to next phase
          console.log('DEBUG: Both player and enemy discard complete, advancing to end phase');

          // Make sure we're still in the discard phase before advancing
          if (updatedState.currentPhase === 'discard') {
            // Add a slight delay to ensure UI updates
            setTimeout(() => {
              const finalState = advancePhase(updatedState);
              // Update the combat state with the new phase
              setCombatState(finalState);
            }, 500);
          } else {
            // Just update the state without advancing the phase
            setCombatState(updatedState);
          }
        } else {
          console.log('DEBUG: Player discard complete, but enemy still needs to discard');
          // Process enemy discard first
          const stateAfterEnemyDiscard = processEnemyDiscard(updatedState, MAX_HAND_SIZE);

          // Then advance to the end phase
          if (stateAfterEnemyDiscard.currentPhase === 'discard') {
            setTimeout(() => {
              const finalState = advancePhase(stateAfterEnemyDiscard);
              setCombatState(finalState);
            }, 500);
          } else {
            setCombatState(stateAfterEnemyDiscard);
          }
        }
      }
    } catch (error) {
      console.error("Error in discard selection:", error);
      // In case of error, make sure discard modal is closed
      setShowDiscardSelection(false);
      setNumCardsToDiscard(0);
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

      // Ensure we set the location properly using the setCurrentLocation function
      // This will update both the save slot and top-level gameProgress data
      useGameStateStore.getState().setCurrentLocation('wizardStudy');

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

  // Handle initiative roll completion
  const handleInitiativeRollComplete = useCallback((results: InitiativeRollResults) => {
    // Hide the initiative roll UI
    setShowInitiativeRoll(false);

    // Make sure discard modal is closed
    setShowDiscardSelection(false);
    setNumCardsToDiscard(0);

    // Store the roll results
    setInitiativeRolls(results);

    // Update the combat state with the results and then advance the phase
    setCombatState(prevState => {
      if (!prevState) return prevState;

      const updatedState = { ...prevState };

      // Determine first actor based on initiative rolls
      const firstActor = results.playerRoll >= results.enemyRoll ? 'player' : 'enemy';
      updatedState.firstActor = firstActor;

      // Save the actual roll values
      updatedState.initiative = {
        player: results.playerRoll,
        enemy: results.enemyRoll
      };

      // Only add the initiative roll entry, don't reset the log
      // This preserves the battle history across rounds

      // Get the current timestamp as our base
      const now = Date.now();

      // 1. First add the player's roll result (should appear after "Rolling for initiative...")
      battleLogManager.addEntry({
        turn: prevState.turn,
        round: prevState.round,
        actor: 'player',
        action: 'initiative_roll',
        details: `You rolled ${results.playerRoll} for initiative.`,
        timestamp: now - 200 // Make this appear after "Rolling for initiative..."
      });

      // 2. Then add the enemy's roll result
      battleLogManager.addEntry({
        turn: prevState.turn,
        round: prevState.round,
        actor: 'enemy',
        action: 'initiative_roll',
        details: `Enemy rolled ${results.enemyRoll} for initiative.`,
        timestamp: now - 100 // Make this appear after player's roll
      });

      // 3. Finally add the initiative result (who goes first)
      battleLogManager.addEntry({
        turn: prevState.turn,
        round: prevState.round,
        actor: 'system',
        action: 'initiative_result',
        details: `${firstActor === 'player' ? 'You' : 'Enemy'} won initiative and will go first.`,
        // No timestamp specified - will use current time automatically
      });

      // Update the state log with the latest entries from the manager
      updatedState.log = battleLogManager.getEntries();

      // Debug log to help diagnose ordering issues
      console.log('After initiative roll:');
      battleLogManager.debugLog();

      // Now advance from initiative to draw phase
      const nextPhaseState = advancePhase(updatedState);
      console.log('Advanced from initiative to draw phase after roll completion');

      return nextPhaseState;
    });
  }, []);

  // Helper function to handle enemy action during action phase
  const processEnemyAction = (state: CombatState) => {
    if (!state || state.actionState.enemy.hasActed) return;

    try {
      setIsAnimating(true);
      // Get the enemy's available spells directly

      // Find any spell the enemy can cast
      const availableSpells = state.enemyWizard.hand.filter(
        spell => spell.manaCost <= state.enemyWizard.currentMana
      );

      if (availableSpells.length > 0) {
        // Sort by mana cost (descending) to use the most powerful spell
        const sortedSpells = [...availableSpells].sort((a, b) => b.manaCost - a.manaCost);
        const chosenSpell = sortedSpells[0];

        console.log(`Enemy queuing spell: ${chosenSpell.name}`);

        // Queue the spell action for the resolution phase
        const queuedState = queueAction(state, {
          caster: 'enemy',
          spell: chosenSpell,
          target: 'player'
        });

        // Add to battle log using the manager
        battleLogManager.addEntry({
          turn: state.turn,
          round: state.round,
          actor: 'enemy',
          action: 'queue_spell',
          details: `Enemy queued ${chosenSpell.name}`
        });

        // Get the latest entries from the manager
        const latestEntries = battleLogManager.getEntries();

        // Update the battle log state with the latest entries
        setBattleLog(latestEntries);

        // Also update the combat state log
        queuedState.log = latestEntries;

        // Debug log to help diagnose ordering issues
        console.log('Enemy action - updated battle log with', latestEntries.length, 'entries');

        // Update the state to reflect the enemy's action
        setCombatState(queuedState);

        // If both player and enemy have acted, advance to the next phase
        if (queuedState.actionState.player.hasActed && queuedState.actionState.enemy.hasActed) {
          setTimeout(() => {
            const nextPhaseState = advancePhase(queuedState);
            setCombatState(nextPhaseState);
            setIsAnimating(false);
          }, 1000);
        } else {
          // Enemy has acted but player hasn't - allow player to take their turn
          setTimeout(() => {
            setIsAnimating(false);
          }, 500);
        }
      } else {
        // Enemy skips turn if no spells can be cast
        console.log('Enemy skipping turn (no castable spells)');
        const skipState = skipTurn(state, false);

        // Add to battle log using the manager
        battleLogManager.addEntry({
          turn: state.turn,
          round: state.round,
          actor: 'enemy',
          action: 'skip_turn',
          details: 'Enemy skipped their turn'
        });

        // Get the latest entries from the manager
        const latestEntries = battleLogManager.getEntries();

        // Update the battle log state with the latest entries
        setBattleLog(latestEntries);

        // Also update the combat state log
        skipState.log = latestEntries;

        // Debug log to help diagnose ordering issues
        console.log('Enemy skip turn - updated battle log with', latestEntries.length, 'entries');

        // Update the state to reflect the enemy's skipped turn
        setCombatState(skipState);

        // If both player and enemy have acted, advance to the next phase
        if (skipState.actionState.player.hasActed && skipState.actionState.enemy.hasActed) {
          setTimeout(() => {
            const nextPhaseState = advancePhase(skipState);
            setCombatState(nextPhaseState);
            setIsAnimating(false);
          }, 1000);
        } else {
          // Enemy has acted but player hasn't - allow player to take their turn
          setTimeout(() => {
            setIsAnimating(false);
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error in enemy action:", error);
      setIsAnimating(false);
    }
  };

  // Phase transitions are now handled by the PhaseManager

  if (!combatState) {
    return <div className="loading">Initializing battle...</div>;
  }

  // Game status is directly passed from combatState.status

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
              console.log("Mystic Punch button clicked");
              // Show selection modal only during action phase and if player hasn't acted
              if (combatState.currentPhase !== 'action' || combatState.actionState.player.hasActed || isAnimating) {
                console.log("Cannot use Mystic Punch - wrong phase, already acted, or animation in progress");
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
            canCastSpell={(spell) => {
              // Can cast if: in action/response phase, haven't acted, and have enough mana
              const inActionPhase = combatState.currentPhase === 'action';
              const inResponsePhase = combatState.currentPhase === 'response';
              const hasntActedYet = !combatState.actionState.player.hasActed;
              const hasntRespondedYet = !combatState.actionState.player.hasResponded;
              const hasEnoughMana = combatState.playerWizard.currentMana >= spell.manaCost;

              // In response phase, can only cast reaction spells
              if (inResponsePhase) {
                return hasntRespondedYet && hasEnoughMana && spell.type === 'reaction';
              }

              // In action phase
              return inActionPhase && hasntActedYet && hasEnoughMana;
            }}
            canUseMysticPunch={
              combatState.currentPhase === 'action' &&
              !combatState.actionState.player.hasActed &&
              !isAnimating
            }
            currentPhase={combatState.currentPhase}
          />

          {/* Phase Tracker is now only in BattleArena component */}

          {/* Combat Status HUD */}
          <div className="battle-status-hud">
            <h3>Round: {combatState.round} | Phase: {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}</h3>

            {/* Phase-specific status */}
            {combatState.currentPhase === 'action' && (
              <p>
                {!combatState.actionState.player.hasActed
                  ? "Your turn to act"
                  : "You have taken your action"}
                {combatState.actionState.enemy.hasActed
                  ? " • Enemy has acted"
                  : " • Enemy's turn to act"}
              </p>
            )}

            {combatState.currentPhase === 'response' && (
              <p>
                {!combatState.actionState.player.hasResponded
                  ? "Your turn to respond with a reaction spell"
                  : "You have responded"}
                {combatState.actionState.enemy.hasResponded
                  ? " • Enemy has responded"
                  : " • Enemy's turn to respond"}
              </p>
            )}

            {combatState.currentPhase === 'resolve' && (
              <p>Resolving queued actions...</p>
            )}

            {combatState.currentPhase === 'draw' && (
              <p>Drawing cards...</p>
            )}

            {combatState.currentPhase === 'initiative' && (
              <p>Rolling for initiative...</p>
            )}
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
            experienceGained={experienceGained}
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
                    <div key={spell.id} className="spell-card-wrapper" id={`mystic-punch-spell-${spell.id}`}>
                      <SpellCard
                        spell={spell}
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
                      />
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
                    <div key={spell.id} className="spell-card-wrapper">
                      <SpellCard
                        spell={spell}
                        onClick={() => handlePlayerDiscard(spell)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Initiative Roll Modal */}
          {showInitiativeRoll && (
            <InitiativeRoll
              onRollComplete={handleInitiativeRollComplete}
              isEnemy={false}
            />
          )}
        </>
      )}
    </div>
  );
};

export default BattleView;



