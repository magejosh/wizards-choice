// src/lib/ui/components/BattleArena.tsx
'use client';

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { CombatState, Spell, SpellScroll } from '../../types';
import StatusBar from './StatusBar';
import SpellCard from './SpellCard';
import BattleScene from './scenes/BattleScene';
import { useGameStateStore } from '../../game-state/gameStateStore';

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

// Main battle arena component
const BattleArena: React.FC<BattleArenaProps> = ({
  combatState,
  onSpellCast,
  onMysticPunch,
  onSkipTurn,
  onContinue,
  isPlayerTurn: uiPlayerTurn,
  battleLog,
  animating
}) => {
  if (!combatState) return null;
  
  const { player, enemy, turn, round, status } = combatState;
  
  // Get the last log entry for display
  const lastLogEntry = battleLog.length > 0 ? battleLog[battleLog.length - 1] : null;
  const lastAction = lastLogEntry ? lastLogEntry : 'Battle started';
  
  const renderActiveEffects = (target: 'player' | 'enemy') => {
    const activeEffects = target === 'player' ? player.activeEffects : enemy.activeEffects;
    
    if (!activeEffects || activeEffects.length === 0) {
      return <div>No active effects</div>;
    }
    
    return (
      <div className="battle-arena__effects-list">
        {activeEffects.map((effect, index) => (
          <div key={index} className="battle-arena__effect-item">
            <span className="battle-arena__effect-name">{effect.name}</span>
            <span className="battle-arena__effect-duration">{effect.duration} turns</span>
          </div>
        ))}
      </div>
    );
  };
  
  const renderBattleLog = () => {
    return (
      <div className="battle-arena__log">
        <h3>Battle Log</h3>
        <div className="battle-arena__log-entries">
          {battleLog.slice(-5).map((entry, index) => (
            <div key={index} className="battle-arena__log-entry">
              {entry}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderDeckInfo = () => {
    const drawPileCount = player.drawPile?.length || 0;
    const discardPileCount = player.discardPile?.length || 0;
    
    return (
      <div className="battle-arena__deck-info">
        <div className="battle-arena__deck-counter">
          <span className="battle-arena__deck-label">Draw Pile: </span>
          <span className="battle-arena__deck-count">{drawPileCount}</span>
        </div>
        <div className="battle-arena__deck-counter">
          <span className="battle-arena__deck-label">Discard Pile: </span>
          <span className="battle-arena__deck-count">{discardPileCount}</span>
        </div>
      </div>
    );
  };

  const [showScrolls, setShowScrolls] = useState(false);
  const [selectedScroll, setSelectedScroll] = useState<SpellScroll | null>(null);
  const [scrollUseResult, setScrollUseResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const {
    getPlayerScrolls,
    useScrollInBattle
  } = useGameStateStore();
  
  // Get player scrolls
  const playerScrolls = getPlayerScrolls();
  
  // Function to handle using a spell scroll in battle
  const handleUseScroll = (scrollId: string) => {
    const result = useScrollInBattle(scrollId);
    
    if (result.success && result.spell) {
      // Cast the spell immediately without mana cost
      // This would need to be integrated with your existing castSpell function
      onSpellCast(result.spell);
      setScrollUseResult({ success: true, message: `Cast ${result.spell.name} from scroll!` });
    } else {
      setScrollUseResult({ success: false, message: result.message });
    }
    
    setSelectedScroll(null);
    setShowScrolls(false);
    
    // Show result message for a few seconds, then clear it
    setTimeout(() => {
      setScrollUseResult(null);
    }, 3000);
  };

  return (
    <div className="battle-arena">
      <div className="battle-arena__canvas">
        <Canvas>
          <BattleScene combatState={combatState} />
        </Canvas>
      </div>
      
      <div className="battle-arena__ui">
        <div className="battle-arena__top-bar">
          <div className="battle-arena__turn-info">
            <div>Round: <span className="battle-arena__round-number">{round}</span></div>
            <div>{uiPlayerTurn ? "Your Turn" : "Enemy's Turn"}</div>
          </div>
          <div className="battle-arena__last-action">
            {battleLog.length > 0 && (
              <div className="battle-arena__action-text">{battleLog[battleLog.length - 1]}</div>
            )}
          </div>
        </div>
        
        {/* Player stats */}
        <div className="battle-arena__player-stats">
          <h2 className="battle-arena__player-name">Your Wizard</h2>
          <StatusBar 
            current={player.health} 
            max={player.maxHealth} 
            type="health" 
            label="Health" 
          />
          <StatusBar 
            current={player.mana} 
            max={player.maxMana} 
            type="mana" 
            label="Mana" 
          />
          <StatusBar 
            current={0} 
            max={100} 
            type="experience" 
            label="Experience" 
          />
          
          <div className="battle-arena__active-effects">
            <h3>Active Effects</h3>
            {renderActiveEffects('player')}
          </div>
          
          {renderDeckInfo()}
        </div>
        
        {/* Enemy stats */}
        <div className="battle-arena__enemy-stats">
          <h2 className="battle-arena__enemy-name">Enemy Wizard</h2>
          <StatusBar 
            current={enemy.health} 
            max={enemy.maxHealth} 
            type="health" 
            label="Health" 
          />
          <StatusBar 
            current={enemy.mana} 
            max={enemy.maxMana} 
            type="mana" 
            label="Mana" 
          />
          
          <div className="battle-arena__active-effects">
            <h3>Active Effects</h3>
            {renderActiveEffects('enemy')}
          </div>
        </div>
        
        {renderBattleLog()}
        
        {/* Player's turn UI */}
        {uiPlayerTurn && status === 'active' && (
          <div className="battle-arena__spell-selection">
            <div className="battle-arena__spells-header">
              <h3>Your Hand</h3>
              {uiPlayerTurn ? (
                <div>Choose a spell to cast</div>
              ) : (
                <div>Enemy's turn...</div>
              )}
            </div>
            <div className="battle-arena__spells-container">
              {player.hand.map(spell => (
                <SpellCard 
                  key={spell.id} 
                  spell={spell} 
                  onClick={() => onSpellCast(spell)}
                  disabled={!uiPlayerTurn || animating || player.mana < spell.manaCost}
                />
              ))}
              
              <div 
                className="battle-arena__mystic-punch"
                onClick={onMysticPunch}
              >
                <h3>Mystic Punch</h3>
                <p>Deal 5 damage to enemy. Costs no mana.</p>
              </div>
              
              {player.hand.length > 0 && (
                <div 
                  className="battle-arena__skip-turn"
                  onClick={onSkipTurn}
                >
                  <h3>Skip Turn</h3>
                  <p>End your turn without casting a spell.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Battle status */}
        {status !== 'active' && (
          <div className={`battle-arena__battle-result battle-arena__battle-result--${status}`}>
            <h2>{status === 'playerWon' ? 'Victory!' : 'Defeat!'}</h2>
            <button className="battle-arena__continue-button" onClick={onContinue}>
              Continue
            </button>
          </div>
        )}
      </div>
      
      <div className="battle-controls">
        {uiPlayerTurn && status === 'active' && (
          <>
            <button onClick={() => setShowScrolls(true)}>Use Scroll</button>
          </>
        )}
      </div>
      
      {/* Spell Scrolls Modal */}
      {showScrolls && (
        <div className="modal-overlay">
          <div className="modal-content battle-scrolls">
            <h2>Use Spell Scroll</h2>
            <p>Use a spell scroll to cast a spell without mana cost.</p>
            
            {scrollUseResult && (
              <div className={`result-message ${scrollUseResult.success ? 'success' : 'error'}`}>
                {scrollUseResult.message}
              </div>
            )}
            
            {selectedScroll ? (
              <div className="scroll-details">
                <h3>{selectedScroll.name}</h3>
                <div className="scroll-spell-preview">
                  <SpellCard spell={selectedScroll.spell} />
                </div>
                <p>{selectedScroll.description}</p>
                <p className="scroll-rarity">Rarity: {selectedScroll.rarity}</p>
                
                <button 
                  onClick={() => handleUseScroll(selectedScroll.id)}
                  className="use-scroll-button"
                >
                  Cast Spell
                </button>
                
                <button 
                  onClick={() => setSelectedScroll(null)}
                  className="back-button"
                >
                  Back to Scrolls
                </button>
              </div>
            ) : (
              <>
                {playerScrolls.length === 0 ? (
                  <div className="no-scrolls">
                    <p>You don't have any spell scrolls. Defeat enemies or visit the market to find spell scrolls.</p>
                  </div>
                ) : (
                  <div className="scrolls-grid">
                    {playerScrolls.map(scroll => (
                      <div 
                        key={scroll.id} 
                        className="scroll-item"
                        onClick={() => setSelectedScroll(scroll)}
                      >
                        <h4>{scroll.name}</h4>
                        <p className="scroll-rarity">{scroll.rarity}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            
            <button onClick={() => setShowScrolls(false)} className="close-button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleArena;
