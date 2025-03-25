'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CombatState, Enemy, Spell, CombatWizard, ActiveEffect, Wizard } from '../../lib/types';
import { BattleArena } from '../../lib/ui/components/BattleArena';
import { initializeCombat, executeSpell, drawSpells, discardSpell, addActiveEffect, applyActiveEffects, decrementActiveEffects, checkActiveEffects, regenerateMana, getAISpellSelection, checkBattleEnd, executeMysticPunch } from '../../lib/combat/combatEngine';
import { useGameStateStore } from '../../lib/game-state/gameStateStore';

export default function Battle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameStateStore = useGameStateStore();
  const [combatState, setCombatState] = useState<CombatState | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [marketAttacker, setMarketAttacker] = useState<Wizard | null>(null);
  const [isMarketBattle, setIsMarketBattle] = useState(false);

  useEffect(() => {
    // Check if this is a market battle
    const source = searchParams.get('source');
    if (source === 'market') {
      setIsMarketBattle(true);
      
      // Retrieve market attacker from sessionStorage
      const attackerData = sessionStorage.getItem('marketAttacker');
      if (attackerData) {
        try {
          const attacker = JSON.parse(attackerData);
          setMarketAttacker(attacker);
        } catch (error) {
          console.error('Failed to parse market attacker data:', error);
          router.push('/');
          return;
        }
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    // For market battles, initialize with the market attacker
    if (isMarketBattle && marketAttacker && !combatState) {
      const player = gameStateStore.gameState.player;
      
      // Initialize combat with the market attacker
      const initialState = initializeCombat(player, marketAttacker, gameStateStore.gameState.settings.difficulty);
      setCombatState(initialState);
      addLogEntry(`Battle begins! ${player.name} faces ${marketAttacker.name}!`);
      addLogEntry(`Round 1 begins! ${player.name} draws 3 spells.`);
    }
    // For non-market battles, use a default enemy for now
    else if (!isMarketBattle && !combatState) {
      router.push('/');
    }
  }, [combatState, router, isMarketBattle, marketAttacker, gameStateStore]);

  const addLogEntry = (entry: string) => {
    setBattleLog(prev => [...prev, entry]);
  };

  const handleSpellCast = async (spell: Spell) => {
    if (!combatState || !isPlayerTurn || animating) return;
    
    setAnimating(true);

    // Execute the spell and get updated state
    const { newState, spellResult } = executeSpell(combatState, spell, 'player');
    
    // Discard the used spell
    const updatedState = discardSpell(newState, spell);
    
    // Log the spell cast
    addLogEntry(`${combatState.player.name} casts ${spell.name}!`);
    if (spellResult.damage) {
      addLogEntry(`${spell.name} deals ${spellResult.damage} damage to ${combatState.enemy.name}!`);
    }
    if (spellResult.healing) {
      addLogEntry(`${spell.name} heals ${combatState.player.name} for ${spellResult.healing} health!`);
    }
    
    // Handle active effects from the spell
    if (spell.effect) {
      const stateWithEffect = addActiveEffect(updatedState, spell.effect, 'enemy');
      setCombatState(stateWithEffect);
      addLogEntry(`${spell.effect.name} is applied to ${combatState.enemy.name} for ${spell.effect.duration} turns!`);
    }
    
    setCombatState(updatedState);
    
    // Check if battle has ended after player's turn
    const endResult = checkBattleEnd(updatedState);
    if (endResult !== null) {
      handleBattleEnd(endResult, updatedState);
      setAnimating(false);
      return;
    }
    
    // Set up enemy turn
    setTimeout(() => {
      setIsPlayerTurn(false);
      setAnimating(false);
      handleEnemyTurn(updatedState);
    }, 1500);
  };

  const handleMysticPunch = async () => {
    if (!combatState || !isPlayerTurn || animating) return;
    
    setAnimating(true);
    
    // Execute the mystic punch
    const updatedState = executeMysticPunch(combatState);
    
    addLogEntry(`${combatState.player.name} launches a Mystic Punch!`);
    addLogEntry(`Mystic Punch deals damage to ${combatState.enemy.name}!`);
    
    setCombatState(updatedState);
    
    // Check if battle has ended after player's turn
    const endResult = checkBattleEnd(updatedState);
    if (endResult !== null) {
      handleBattleEnd(endResult, updatedState);
      setAnimating(false);
      return;
    }
    
    // Set up enemy turn
    setTimeout(() => {
      setIsPlayerTurn(false);
      setAnimating(false);
      handleEnemyTurn(updatedState);
    }, 1500);
  };

  const handleSkipTurn = () => {
    if (!combatState || !isPlayerTurn || animating) return;
    
    setAnimating(true);
    
    addLogEntry(`${combatState.player.name} skips their turn.`);
    
    // Set up enemy turn
    setTimeout(() => {
      setIsPlayerTurn(false);
      setAnimating(false);
      handleEnemyTurn(combatState);
    }, 1000);
  };

  const handleEnemyTurn = async (currentState: CombatState) => {
    // Apply active effects at the start of enemy turn
    const stateAfterEffects = applyActiveEffects(currentState, 'enemy');
    
    // Get AI spell selection
    const selectedSpell = getAISpellSelection(stateAfterEffects);
    
    if (selectedSpell) {
      addLogEntry(`${stateAfterEffects.enemy.name} casts ${selectedSpell.name}!`);
      
      // Execute the enemy spell and get updated state
      const { newState, spellResult } = executeSpell(stateAfterEffects, selectedSpell, 'enemy');
      
      if (spellResult.damage) {
        addLogEntry(`${selectedSpell.name} deals ${spellResult.damage} damage to ${stateAfterEffects.player.name}!`);
      }
      
      // Handle active effects from the enemy spell
      if (selectedSpell.effect) {
        const stateWithEffect = addActiveEffect(newState, selectedSpell.effect, 'player');
        setCombatState(stateWithEffect);
        addLogEntry(`${selectedSpell.effect.name} is applied to ${stateAfterEffects.player.name} for ${selectedSpell.effect.duration} turns!`);
      } else {
        setCombatState(newState);
      }
      
      // Check if battle has ended after enemy's turn
      const endResult = checkBattleEnd(newState);
      if (endResult !== null) {
        handleBattleEnd(endResult, newState);
        return;
      }
    } else {
      addLogEntry(`${stateAfterEffects.enemy.name} does nothing.`);
      setCombatState(stateAfterEffects);
      
      // Check if battle has ended after enemy's turn
      const endResult = checkBattleEnd(stateAfterEffects);
      if (endResult !== null) {
        handleBattleEnd(endResult, stateAfterEffects);
        return;
      }
    }
    
    // End of round processing
    setTimeout(() => {
      endRound();
    }, 1500);
  };

  const endRound = () => {
    if (!combatState) return;
    
    // Decrement active effects duration
    const stateAfterEffects = decrementActiveEffects(combatState);
    
    // Remove expired effects
    const stateWithoutExpiredEffects = checkActiveEffects(stateAfterEffects);
    
    // Regenerate some mana
    const stateWithMana = regenerateMana(stateWithoutExpiredEffects, 1);
    
    // Draw cards if hand is empty or has fewer than 3 cards
    let finalState = stateWithMana;
    const playerHand = finalState.player.hand || [];
    
    if (playerHand.length < 3) {
      const cardsToDraw = 3 - playerHand.length;
      finalState = drawSpells(finalState, cardsToDraw);
      
      if (cardsToDraw > 0) {
        addLogEntry(`${finalState.player.name} draws ${cardsToDraw} spell${cardsToDraw > 1 ? 's' : ''}.`);
      }
    }
    
    // Increment round counter
    finalState = {
      ...finalState,
      round: finalState.round + 1
    };
    
    addLogEntry(`Round ${finalState.round} begins!`);
    setCombatState(finalState);
    setIsPlayerTurn(true);
    setAnimating(false);
  };

  const handleBattleEnd = (result: 'playerWon' | 'enemyWon', finalState: CombatState) => {
    if (result === 'playerWon') {
      addLogEntry(`${finalState.player.name} defeated ${finalState.enemy.name}!`);
      
      // Handle market attacker defeat
      if (isMarketBattle && marketAttacker) {
        // Process market attacker rewards
        const battleResult = gameStateStore.handleMarketAttackResult('win', marketAttacker);
        addLogEntry(battleResult.message);
        
        // Clear the market attacker from sessionStorage
        sessionStorage.removeItem('marketAttacker');
      }
    } else {
      addLogEntry(`${finalState.enemy.name} defeated ${finalState.player.name}!`);
      
      // Handle market attacker victory
      if (isMarketBattle && marketAttacker) {
        // Process market attacker victory consequences
        const battleResult = gameStateStore.handleMarketAttackResult('lose', marketAttacker);
        addLogEntry(battleResult.message);
        
        // Clear the market attacker from sessionStorage
        sessionStorage.removeItem('marketAttacker');
      }
    }
  };

  const handleContinue = () => {
    // For market battles, return to wizard's study after battle
    if (isMarketBattle) {
      gameStateStore.setCurrentLocation('wizardStudy');
      router.push('/');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="battle-page">
      <BattleArena
        combatState={combatState}
        battleLog={battleLog}
        isPlayerTurn={isPlayerTurn}
        onSpellCast={handleSpellCast}
        onMysticPunch={handleMysticPunch}
        onSkipTurn={handleSkipTurn}
        onContinue={handleContinue}
      />
    </div>
  );
}; 