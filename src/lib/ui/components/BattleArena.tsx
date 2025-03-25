// src/lib/ui/components/BattleArena.tsx
'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { CombatState } from '../../types';
import StatusBar from './StatusBar';
import SpellCard from './SpellCard';
import BattleScene from './scenes/BattleScene';

interface BattleArenaProps {
  combatState: CombatState;
  onSpellSelect: (spell: any) => void;
  onMysticPunch: () => void;
  onSkipTurn: () => void;
}

// Main battle arena component
const BattleArena: React.FC<BattleArenaProps> = ({ 
  combatState, 
  onSpellSelect, 
  onMysticPunch, 
  onSkipTurn 
}) => {
  if (!combatState) return null;
  
  const { playerWizard, enemyWizard, turn, round, isPlayerTurn, log, status } = combatState;
  
  // Get the last log entry for display
  const lastLogEntry = log.length > 0 ? log[log.length - 1] : null;
  const lastAction = lastLogEntry ? lastLogEntry.details : 'Battle started';
  
  return (
    <div className="battle-arena">
      {/* 3D Battle Scene */}
      <div className="battle-arena__canvas">
        <Canvas>
          <BattleScene combatState={combatState} />
        </Canvas>
      </div>
      
      {/* UI Overlay */}
      <div className="battle-arena__ui">
        {/* Top bar with turn info */}
        <div className="battle-arena__top-bar">
          <div className="battle-arena__turn-info">
            <span className="battle-arena__turn-label">Turn: </span>
            <span className="battle-arena__turn-number">{turn}</span>
          </div>
          <div className="battle-arena__last-action">
            <span className="battle-arena__action-label">Last Action: </span>
            <span className="battle-arena__action-text">{lastAction}</span>
          </div>
        </div>
        
        {/* Player stats */}
        <div className="battle-arena__player-stats">
          <h2 className="battle-arena__player-name">Your Wizard</h2>
          <StatusBar 
            current={playerWizard.currentHealth} 
            max={playerWizard.wizard.maxHealth} 
            type="health" 
            label="Health" 
          />
          <StatusBar 
            current={playerWizard.currentMana} 
            max={playerWizard.wizard.maxMana} 
            type="mana" 
            label="Mana" 
          />
          <StatusBar 
            current={playerWizard.wizard.experience} 
            max={playerWizard.wizard.experienceToNextLevel} 
            type="experience" 
            label="XP" 
          />
        </div>
        
        {/* Enemy stats */}
        <div className="battle-arena__enemy-stats">
          <h2 className="battle-arena__enemy-name">Enemy Wizard</h2>
          <StatusBar 
            current={enemyWizard.currentHealth} 
            max={enemyWizard.wizard.maxHealth} 
            type="health" 
            label="Health" 
          />
          <StatusBar 
            current={enemyWizard.currentMana} 
            max={enemyWizard.wizard.maxMana} 
            type="mana" 
            label="Mana" 
          />
        </div>
        
        {/* Spell selection */}
        {isPlayerTurn && status === 'active' && (
          <div className="battle-arena__spell-selection">
            <div className="battle-arena__spells-header">
              <h3>Your Spells: {playerWizard.wizard.equippedSpells.length} Available</h3>
            </div>
            <div className="battle-arena__spells-container">
              {playerWizard.wizard.equippedSpells.map((spell, index) => (
                <SpellCard 
                  key={spell.id} 
                  spell={spell} 
                  onClick={() => onSpellSelect(spell)}
                  disabled={spell.manaCost > playerWizard.currentMana}
                />
              ))}
              
              {/* Mystic Punch option */}
              <div 
                className="battle-arena__mystic-punch"
                onClick={onMysticPunch}
              >
                <h3>Mystic Punch</h3>
                <p>Discard a spell to deal direct damage</p>
              </div>
              
              {/* Skip turn option */}
              {playerWizard.wizard.equippedSpells.length <= 2 && (
                <div 
                  className="battle-arena__skip-turn"
                  onClick={onSkipTurn}
                >
                  <h3>Skip Turn</h3>
                  <p>Pass your turn without casting</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Battle status */}
        {status !== 'active' && (
          <div className={`battle-arena__battle-result battle-arena__battle-result--${status}`}>
            <h2>{status === 'playerWon' ? 'Victory!' : 'Defeat!'}</h2>
            <button className="battle-arena__continue-button">
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleArena;
