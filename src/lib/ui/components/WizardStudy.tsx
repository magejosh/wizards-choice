// src/lib/ui/components/WizardStudy.tsx
'use client';

import React from 'react';
import { useGameStateStore } from '../../game-state/gameStateStore';
import { Wizard, Spell, Equipment } from '../../types';

interface WizardStudyProps {
  onStartDuel: () => void;
  onOpenDeckBuilder: () => void;
  onOpenEquipment: () => void;
  onOpenSpellbook: () => void;
  onReturnToMainMenu: () => void;
}

const WizardStudy: React.FC<WizardStudyProps> = ({
  onStartDuel,
  onOpenDeckBuilder,
  onOpenEquipment,
  onOpenSpellbook,
  onReturnToMainMenu
}) => {
  const { gameState } = useGameStateStore();
  const { player } = gameState;
  
  return (
    <div className="wizard-study">
      <div className="wizard-study__header">
        <h1 className="wizard-study__title">Wizard's Study</h1>
        <div className="wizard-study__player-info">
          <h2 className="wizard-study__player-name">{player.name}</h2>
          <div className="wizard-study__player-level">Level {player.level}</div>
        </div>
      </div>
      
      <div className="wizard-study__content">
        <div className="wizard-study__main-area">
          <div className="wizard-study__study-scene">
            {/* This would be a ThreeJS scene in the full implementation */}
            <div className="wizard-study__study-background"></div>
          </div>
          
          <div className="wizard-study__actions">
            <button 
              className="wizard-study__action wizard-study__action--primary"
              onClick={onStartDuel}
            >
              Start Next Duel
            </button>
            
            <div className="wizard-study__action-group">
              <button 
                className="wizard-study__action"
                onClick={onOpenDeckBuilder}
              >
                Deck Builder
              </button>
              
              <button 
                className="wizard-study__action"
                onClick={onOpenEquipment}
              >
                Equipment
              </button>
              
              <button 
                className="wizard-study__action"
                onClick={onOpenSpellbook}
              >
                Spellbook
              </button>
            </div>
            
            <button 
              className="wizard-study__action wizard-study__action--secondary"
              onClick={onReturnToMainMenu}
            >
              Return to Main Menu
            </button>
          </div>
        </div>
        
        <div className="wizard-study__sidebar">
          <div className="wizard-study__stats">
            <h3 className="wizard-study__stats-title">Wizard Stats</h3>
            <div className="wizard-study__stat">
              <span className="wizard-study__stat-label">Health:</span>
              <span className="wizard-study__stat-value">{player.health}/{player.maxHealth}</span>
            </div>
            <div className="wizard-study__stat">
              <span className="wizard-study__stat-label">Mana:</span>
              <span className="wizard-study__stat-value">{player.mana}/{player.maxMana}</span>
            </div>
            <div className="wizard-study__stat">
              <span className="wizard-study__stat-label">Mana Regen:</span>
              <span className="wizard-study__stat-value">{player.manaRegen}/turn</span>
            </div>
            <div className="wizard-study__stat">
              <span className="wizard-study__stat-label">Experience:</span>
              <span className="wizard-study__stat-value">{player.experience}/{player.experienceToNextLevel}</span>
            </div>
            <div className="wizard-study__stat">
              <span className="wizard-study__stat-label">Level-up Points:</span>
              <span className="wizard-study__stat-value">{player.levelUpPoints}</span>
            </div>
          </div>
          
          <div className="wizard-study__equipped">
            <h3 className="wizard-study__equipped-title">Equipped Items</h3>
            <div className="wizard-study__equipment-slots">
              {Object.entries(player.equipment).map(([slot, item]) => (
                item && (
                  <div key={slot} className="wizard-study__equipment-item">
                    <div className="wizard-study__equipment-name">{item.name}</div>
                    <div className="wizard-study__equipment-slot">{slot}</div>
                  </div>
                )
              ))}
            </div>
          </div>
          
          <div className="wizard-study__spells">
            <h3 className="wizard-study__spells-title">Equipped Spells</h3>
            <div className="wizard-study__spell-list">
              {player.equippedSpells.map((spell) => (
                <div key={spell.id} className="wizard-study__spell-item">
                  <div className="wizard-study__spell-name">{spell.name}</div>
                  <div className="wizard-study__spell-type">{spell.type} - {spell.element}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WizardStudy;
