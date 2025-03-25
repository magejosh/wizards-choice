// src/lib/ui/components/MainMenu.tsx
'use client';

import React from 'react';
import { useGameStateStore } from '../../game-state/gameStateStore';

interface MainMenuProps {
  onStartNewGame: () => void;
  onContinueGame: (saveSlotId: number) => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  onStartNewGame,
  onContinueGame,
  onOpenSettings,
  onOpenHowToPlay
}) => {
  const { gameState } = useGameStateStore();
  const { saveSlots } = gameState;
  
  return (
    <div className="main-menu">
      <div className="main-menu__content">
        <h1 className="main-menu__title">Wizard's Choice</h1>
        <h2 className="main-menu__subtitle">A Tactical Spell-Casting Adventure</h2>
        
        <div className="main-menu__buttons">
          <button 
            className="main-menu__button main-menu__button--primary"
            onClick={onStartNewGame}
          >
            Start New Game
          </button>
          
          {saveSlots.some(slot => !slot.isEmpty) && (
            <div className="main-menu__save-slots">
              <h3 className="main-menu__save-slots-title">Continue Game</h3>
              {saveSlots.map((slot, index) => (
                !slot.isEmpty && (
                  <button 
                    key={slot.id}
                    className="main-menu__save-slot"
                    onClick={() => onContinueGame(slot.id)}
                  >
                    <div className="main-menu__save-slot-name">{slot.playerName}</div>
                    <div className="main-menu__save-slot-details">
                      <span className="main-menu__save-slot-level">Level {slot.level}</span>
                      <span className="main-menu__save-slot-date">
                        {new Date(slot.lastSaved).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                )
              ))}
            </div>
          )}
          
          <button 
            className="main-menu__button main-menu__button--secondary"
            onClick={onOpenSettings}
          >
            Settings
          </button>
          
          <button 
            className="main-menu__button main-menu__button--secondary"
            onClick={onOpenHowToPlay}
          >
            How to Play
          </button>
        </div>
      </div>
      
      <div className="main-menu__background">
        {/* This would be a ThreeJS background scene in the full implementation */}
        <div className="main-menu__magical-particles"></div>
      </div>
      
      <footer className="main-menu__footer">
        <p>© 2025 Wizard's Choice</p>
      </footer>
    </div>
  );
};

export default MainMenu;
