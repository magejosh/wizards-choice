'use client';

import React, { useState, useEffect } from 'react';
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
import './battle.css';

// Define the types needed for our battle system
interface Wizard {
  id: string;
  name: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  manaRegen: number;
  spells: Spell[];
  equippedSpells: Spell[];
  equipment: any;
  inventory: any[];
  potions: any[];
  equippedPotions: any[];
  levelUpPoints: number;
  decks: any[];
  activeDeckId: string | null;
}

interface Spell {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  tier: number;
  type: string;
  element: string;
  effects: any[];
}

interface ActiveEffect {
  id: string;
  name: string;
  remainingDuration: number;
  effect: any;
}

interface CombatWizard {
  wizard: Wizard;
  currentHealth: number;
  currentMana: number;
  activeEffects: ActiveEffect[];
  selectedSpell: Spell | null;
  hand: Spell[];
  drawPile: Spell[];
  discardPile: Spell[];
}

interface CombatLogEntry {
  turn: number;
  round: number;
  actor: 'player' | 'enemy';
  action: string;
  target?: 'player' | 'enemy';
  spellName?: string;
  damage?: number;
  healing?: number;
  effectName?: string;
  details?: string;
}

interface CombatState {
  playerWizard: CombatWizard;
  enemyWizard: CombatWizard;
  turn: number;
  round: number;
  isPlayerTurn: boolean;
  log: CombatLogEntry[];
  status: 'active' | 'playerWon' | 'enemyWon';
  difficulty: 'easy' | 'normal' | 'hard';
}

// Define the function signature type to match what's in combatEngine.ts
type ExecuteMysticPunchFn = (state: CombatState, spellTier: number, isPlayer: boolean) => CombatState;

export default function BattlePage() {
  const router = useRouter();
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [selectedSpellForMysticPunch, setSelectedSpellForMysticPunch] = useState<Spell | null>(null);
  const [showMysticPunchSelection, setShowMysticPunchSelection] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Get game state from store
  const { 
    gameState,
    updateWizard,
    addExperience,
    saveGame
  } = useGameStateStore();
  
  const playerWizard = gameState.player;
  const enemyWizard = generateEnemyWizard(); // This function would need to be implemented
  const difficulty = gameState.settings.difficulty as 'easy' | 'normal' | 'hard';

  // Initialize combat when the component mounts
  useEffect(() => {
    if (playerWizard && enemyWizard) {
      const initialCombatState = initializeCombat(
        playerWizard,
        enemyWizard,
        difficulty
      );
      setCombatState(initialCombatState);
    }
  }, [playerWizard, enemyWizard, difficulty]);

  // Temporary placeholder function - in a real implementation, this would fetch from the game state
  function generateEnemyWizard(): Wizard {
    return {
      id: 'enemy-1',
      name: 'Enemy Wizard',
      level: playerWizard.level,
      experience: 0,
      experienceToNextLevel: 100,
      health: 100,
      maxHealth: 100,
      mana: 100,
      maxMana: 100,
      manaRegen: 5,
      spells: [],
      equippedSpells: [],
      equipment: {},
      inventory: [],
      potions: [],
      equippedPotions: [],
      levelUpPoints: 0,
      decks: [],
      activeDeckId: null
    };
  }

  // Handle AI turn
  useEffect(() => {
    if (combatState && !combatState.isPlayerTurn && combatState.status === 'active') {
      setIsAnimating(true);
      
      // Small delay for AI to make decision for better UX
      const aiTimer = setTimeout(() => {
        // Get AI spell selection
        const aiSpell = getAISpellSelection(combatState);
        
        // Update state with selected spell
        const updatedState = selectSpell(combatState, aiSpell, false);
        setCombatState(updatedState);
        
        // Execute the spell after a short delay
        setTimeout(() => {
          const afterCastState = executeSpellCast(updatedState, false);
          setCombatState(afterCastState);
          setIsAnimating(false);
        }, 1000);
      }, 1500);
      
      return () => clearTimeout(aiTimer);
    }
  }, [combatState]);

  // Handle game end
  useEffect(() => {
    if (combatState?.status !== 'active' && combatState?.status !== undefined) {
      // Handle victory or defeat
      if (combatState.status === 'playerWon') {
        // Calculate experience based on difficulty
        const experienceMultiplier = 
          combatState.difficulty === 'easy' ? 10 : 
          combatState.difficulty === 'normal' ? 1 : 0.1;
        
        const experience = Math.round(enemyWizard.level * 100 * experienceMultiplier);
        
        // Award experience to player
        addExperience(experience);
        
        // Save game state
        saveGame();
      }
    }
  }, [combatState?.status, addExperience, saveGame, enemyWizard.level]);

  // Handle spell selection
  const handleSpellSelect = (spell: Spell) => {
    if (!combatState || !combatState.isPlayerTurn || isAnimating) return;
    
    setIsAnimating(true);
    
    // Update state with selected spell
    const updatedState = selectSpell(combatState, spell, true);
    setCombatState(updatedState);
    
    // Execute the spell after a short delay
    setTimeout(() => {
      const afterCastState = executeSpellCast(updatedState, true);
      setCombatState(afterCastState);
      setIsAnimating(false);
    }, 500);
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
    
    // Hide selection modal
    setShowMysticPunchSelection(false);
    
    // Execute mystic punch with the correct parameters
    const updatedState = executeMysticPunch(
      combatState,
      spell.tier,
      true // isPlayer = true
    );
    setCombatState(updatedState);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  // Handle skip turn
  const handleSkipTurn = () => {
    if (!combatState || !combatState.isPlayerTurn || isAnimating) return;
    
    setIsAnimating(true);
    
    // Just advance the turn
    const updatedState = { ...combatState, isPlayerTurn: false };
    setCombatState(updatedState);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  // Handle continue after battle ends
  const handleContinue = () => {
    // Navigate back to the wizard's study
    router.push('/');
  };

  if (!combatState) {
    return <div className="loading">Initializing battle...</div>;
  }

  return (
    <div className="battle-page">
      <BattleArena
        combatState={combatState}
        onSpellSelect={handleSpellSelect}
        onMysticPunch={handleMysticPunch}
        onSkipTurn={handleSkipTurn}
        onContinue={handleContinue}
        isAnimating={isAnimating}
      />
      
      {/* Mystic Punch Spell Selection Modal */}
      {showMysticPunchSelection && (
        <div className="mystic-punch-modal">
          <div className="mystic-punch-modal__content">
            <h2>Select a spell to discard</h2>
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