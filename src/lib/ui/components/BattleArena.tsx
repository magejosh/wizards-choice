// src/lib/ui/components/BattleArena.tsx
'use client';

import React from 'react';
import { CombatState, Spell } from '../../types';
import OriginalBattleArena from '../../../components/battle/BattleArena';

interface BattleArenaProps {
  combatState: CombatState;
  onSpellCast: (spell: Spell) => void;
  onMysticPunch: () => void;
  onSkipTurn: () => void;
  onContinue: () => void;
  isPlayerTurn: boolean;
  battleLog: string[];
  animating: boolean;
}

// This component is a wrapper that passes props to the original BattleArena component
const BattleArena: React.FC<BattleArenaProps> = (props) => {
  // Map props from the new interface to the original component's interface
  return (
    <OriginalBattleArena
      enemyName={props.combatState.enemyWizard.wizard.name}
      enemyHealth={props.combatState.enemyWizard.currentHealth}
      enemyMaxHealth={props.combatState.enemyWizard.wizard.maxHealth}
      enemyMana={props.combatState.enemyWizard.currentMana}
      enemyMaxMana={props.combatState.enemyWizard.wizard.maxMana}
      enemyActiveEffects={props.combatState.enemyWizard.activeEffects}
      playerHealth={props.combatState.playerWizard.currentHealth}
      playerMaxHealth={props.combatState.playerWizard.wizard.maxHealth}
      playerMana={props.combatState.playerWizard.currentMana}
      playerMaxMana={props.combatState.playerWizard.wizard.maxMana}
      playerActiveEffects={props.combatState.playerWizard.activeEffects}
      spellsInHand={props.combatState.playerWizard.hand}
      drawPile={props.combatState.playerWizard.drawPile}
      discardPile={props.combatState.playerWizard.discardPile}
      battleLog={props.battleLog}
      onCastSpell={props.onSpellCast}
      onMysticPunch={props.onMysticPunch}
      onSkipTurn={props.onSkipTurn}
      onExitBattle={props.onContinue}
      isPlayerTurn={props.isPlayerTurn}
      gameStatus={props.combatState.status}
      round={props.combatState.round}
      turn={props.combatState.turn}
      animating={props.animating}
    />
  );
};

export default BattleArena;
