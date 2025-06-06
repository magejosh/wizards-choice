import React, { useState } from 'react';
import { useGameStateStore } from '@/lib/game-state/gameStateStore';
import MainMenu from '../menu/MainMenu';
import Settings from '../settings/Settings';
import HowToPlay from '../help/HowToPlay';
import BattleArena from '../battle/BattleArena';
import WizardStudy from '../study/WizardStudy';
import ErrorBoundary from '../error/ErrorBoundary';
import { CombatState, Spell } from '@/lib/types';

const GameInterface: React.FC = () => {
  const { gameState, updateGameState } = useGameStateStore();
  const [currentView, setCurrentView] = useState<'menu' | 'battle' | 'study'>('menu');
  const [battleState, setBattleState] = useState<{
    combatState: CombatState;
    isPlayerTurn: boolean;
    battleLog: string[];
    animating: boolean;
  } | null>(null);

  const handleStartNewGame = (saveSlotId: number, saveUuid: string) => {
    updateGameState({
      currentSaveSlot: saveUuid,
      // Add other initialization logic
    });
    setCurrentView('study');
  };

  const handleContinueGame = (saveSlotId: number, saveUuid: string) => {
    updateGameState({
      currentSaveSlot: saveUuid,
      // Add loading logic
    });
    setCurrentView('study');
  };

  const handleOpenSettings = () => {
    // Settings logic
  };

  const handleOpenHowToPlay = () => {
    // How to play logic
  };

  const handleLogout = () => {
    setCurrentView('menu');
  };

  // Battle handlers
  const handleSpellCast = (spell: Spell) => {
    // Handle spell casting logic
  };

  const handleMysticPunch = () => {
    // Handle mystic punch logic
  };

  const handleSkipTurn = () => {
    // Handle skip turn logic
  };

  const handleBattleContinue = () => {
    setCurrentView('study');
    setBattleState(null);
  };

  // Study handlers
  const handleStartDuel = () => {
    // Initialize battle state here
    setCurrentView('battle');
  };

  const handleOpenDeckBuilder = () => {
    // Open deck builder logic
  };

  const handleOpenEquipment = () => {
    // Open equipment screen logic
  };

  const handleOpenInventory = () => {
    // Open inventory screen logic
  };

  const handleReturnToMainMenu = () => {
    setCurrentView('menu');
  };

  return (
    <ErrorBoundary>
      <div className="game-interface">
        {currentView === 'menu' && (
          <MainMenu
            onStartNewGame={handleStartNewGame}
            onContinueGame={handleContinueGame}
            onOpenSettings={handleOpenSettings}
            onOpenHowToPlay={handleOpenHowToPlay}
            onLogout={handleLogout}
          />
        )}
        {currentView === 'battle' && battleState && (
          <BattleArena
            combatState={battleState.combatState}
            onSpellCast={handleSpellCast}
            onMysticPunch={handleMysticPunch}
            onSkipTurn={handleSkipTurn}
            onContinue={handleBattleContinue}
            isPlayerTurn={battleState.isPlayerTurn}
            battleLog={battleState.battleLog}
            animating={battleState.animating}
          />
        )}
        {currentView === 'study' && (
          <WizardStudy
            onStartDuel={handleStartDuel}
            onOpenDeckBuilder={handleOpenDeckBuilder}
            onOpenEquipment={handleOpenEquipment}
            onOpenInventory={handleOpenInventory}
            onReturnToMainMenu={handleReturnToMainMenu}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default GameInterface;
