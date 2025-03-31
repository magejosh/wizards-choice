'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import BattleScene from './BattleScene';
import styles from './BattleArena.module.css';

// Import types from the codebase
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
  wizard: any;
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

interface BattleArenaProps {
  combatState: CombatState;
  onSpellSelect: (spell: Spell) => void;
  onMysticPunch: () => void;
  onSkipTurn: () => void;
  onContinue?: () => void;
  isAnimating?: boolean;
}

const BattleArena: React.FC<BattleArenaProps> = ({
  combatState,
  onSpellSelect,
  onMysticPunch,
  onSkipTurn,
  onContinue = () => {},
  isAnimating = false
}) => {
  const [battleLog, setBattleLog] = useState<string[]>([]);
  
  // Update battle log when combat state changes
  useEffect(() => {
    if (combatState && combatState.log) {
      const formattedLog = combatState.log.map(entry => {
        const actorName = entry.actor === 'player' ? 'You' : 'Enemy';
        const targetName = entry.target === 'player' ? 'you' : 'enemy';
        
        switch (entry.action) {
          case 'spell_cast':
            if (entry.damage && entry.damage > 0) {
              return `${actorName} cast ${entry.spellName} for ${entry.damage} damage to ${targetName}.`;
            } else if (entry.healing && entry.healing > 0) {
              return `${actorName} cast ${entry.spellName} healing ${entry.target === entry.actor ? 'themselves' : targetName} for ${entry.healing}.`;
            } else {
              return `${actorName} cast ${entry.spellName}.`;
            }
          case 'mystic_punch':
            return `${actorName} used Mystic Punch for ${entry.damage} damage.`;
          case 'skip_turn':
            return `${actorName} skipped their turn.`;
          case 'effect_applied':
            return `${entry.effectName} was applied to ${targetName}.`;
          case 'effect_tick':
            if (entry.damage && entry.damage > 0) {
              return `${targetName} took ${entry.damage} damage from ${entry.effectName}.`;
            } else if (entry.healing && entry.healing > 0) {
              return `${targetName} healed ${entry.healing} from ${entry.effectName}.`;
            }
            return `${entry.effectName} affected ${targetName}.`;
          case 'effect_expired':
            return `${entry.effectName} expired on ${targetName}.`;
          case 'combat_start':
            return `The duel has begun!`;
          default:
            return entry.details || 'Unknown action occurred.';
        }
      });
      
      setBattleLog(formattedLog);
    }
  }, [combatState]);
  
  const { playerWizard, enemyWizard, isPlayerTurn, status } = combatState;
  
  // Render the player's hand of spell cards
  const renderPlayerHand = () => {
    if (!playerWizard.hand || playerWizard.hand.length === 0) {
      return <div className={styles.noSpells}>No spells in hand</div>;
    }
    
    return (
      <div className={styles.spellsContainer}>
        {playerWizard.hand.map(spell => (
          <div 
            key={spell.id}
            className={`${styles.spellCard} ${playerWizard.currentMana < spell.manaCost ? styles.spellCardDisabled : ''}`}
            onClick={() => {
              if (isPlayerTurn && playerWizard.currentMana >= spell.manaCost && !isAnimating) {
                onSpellSelect(spell);
              }
            }}
          >
            <div className={styles.spellCardHeader}>
              <span className={styles.spellName}>{spell.name}</span>
              <span className={styles.spellMana}>{spell.manaCost}</span>
            </div>
            <div className={styles.spellCardBody}>
              <div className={styles.spellElement}>{spell.element}</div>
              <div className={styles.spellType}>{spell.type}</div>
            </div>
            <div className={styles.spellCardDescription}>
              {spell.description}
            </div>
            <div className={styles.spellCardFooter}>
              <span className={styles.spellTier}>Tier {spell.tier}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Render active effects for a wizard
  const renderActiveEffects = (target: 'player' | 'enemy') => {
    const effects = target === 'player' ? playerWizard.activeEffects : enemyWizard.activeEffects;
    
    if (!effects || effects.length === 0) {
      return <div className={styles.noEffects}>None</div>;
    }
    
    return (
      <div className={styles.effectsList}>
        {effects.map((effect, index) => (
          <div key={index} className={styles.effectItem}>
            <span className={styles.effectName}>{effect.name}</span>
            <span className={styles.effectDuration}>{effect.remainingDuration} turns</span>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className={styles.battleArena}>
      {/* 3D Battle Scene */}
      <div className={styles.battleCanvas}>
        <Canvas>
          <BattleScene combatState={combatState} />
        </Canvas>
      </div>
      
      {/* Battle UI */}
      <div className={styles.battleUI}>
        {/* Top bar with turn/round info */}
        <div className={styles.topBar}>
          <div className={styles.turnInfo}>
            <div>Round: <span className={styles.roundNumber}>{combatState.round}</span></div>
            <div>Turn: <span className={styles.turnNumber}>{combatState.turn}</span></div>
          </div>
          
          <div className={styles.turnIndicator}>
            {isPlayerTurn ? "Your Turn" : "Enemy's Turn"}
          </div>
        </div>
        
        {/* Main battle area */}
        <div className={styles.mainArea}>
          {/* Player info */}
          <div className={styles.wizardInfo}>
            <h3 className={styles.wizardName}>Your Wizard</h3>
            
            <div className={styles.statsBar}>
              <div className={styles.statGroup}>
                <div className={styles.statLabel}>Health</div>
                <div className={styles.statBarContainer}>
                  <div 
                    className={styles.statBarFill} 
                    style={{ 
                      width: `${(playerWizard.currentHealth / playerWizard.wizard.maxHealth) * 100}%`,
                      backgroundColor: '#44ff44'
                    }}
                  />
                </div>
                <div className={styles.statValue}>
                  {playerWizard.currentHealth}/{playerWizard.wizard.maxHealth}
                </div>
              </div>
              
              <div className={styles.statGroup}>
                <div className={styles.statLabel}>Mana</div>
                <div className={styles.statBarContainer}>
                  <div 
                    className={styles.statBarFill} 
                    style={{ 
                      width: `${(playerWizard.currentMana / playerWizard.wizard.maxMana) * 100}%`,
                      backgroundColor: '#4488ff'
                    }}
                  />
                </div>
                <div className={styles.statValue}>
                  {playerWizard.currentMana}/{playerWizard.wizard.maxMana}
                </div>
              </div>
            </div>
            
            <div className={styles.effectsSection}>
              <h4 className={styles.effectsTitle}>Active Effects</h4>
              {renderActiveEffects('player')}
            </div>
            
            <div className={styles.deckInfo}>
              <div className={styles.deckCounter}>
                Draw: <span>{playerWizard.drawPile.length}</span>
              </div>
              <div className={styles.deckCounter}>
                Discard: <span>{playerWizard.discardPile.length}</span>
              </div>
            </div>
          </div>
          
          {/* Battle log */}
          <div className={styles.battleLog}>
            <h3 className={styles.battleLogTitle}>Battle Log</h3>
            <div className={styles.battleLogEntries}>
              {battleLog.slice(-5).map((entry, index) => (
                <div key={index} className={styles.battleLogEntry}>
                  {entry}
                </div>
              ))}
            </div>
          </div>
          
          {/* Enemy info */}
          <div className={styles.wizardInfo}>
            <h3 className={styles.wizardName}>Enemy Wizard</h3>
            
            <div className={styles.statsBar}>
              <div className={styles.statGroup}>
                <div className={styles.statLabel}>Health</div>
                <div className={styles.statBarContainer}>
                  <div 
                    className={styles.statBarFill} 
                    style={{ 
                      width: `${(enemyWizard.currentHealth / enemyWizard.wizard.maxHealth) * 100}%`,
                      backgroundColor: '#ff4444'
                    }}
                  />
                </div>
                <div className={styles.statValue}>
                  {enemyWizard.currentHealth}/{enemyWizard.wizard.maxHealth}
                </div>
              </div>
              
              <div className={styles.statGroup}>
                <div className={styles.statLabel}>Mana</div>
                <div className={styles.statBarContainer}>
                  <div 
                    className={styles.statBarFill} 
                    style={{ 
                      width: `${(enemyWizard.currentMana / enemyWizard.wizard.maxMana) * 100}%`,
                      backgroundColor: '#aa44ff'
                    }}
                  />
                </div>
                <div className={styles.statValue}>
                  {enemyWizard.currentMana}/{enemyWizard.wizard.maxMana}
                </div>
              </div>
            </div>
            
            <div className={styles.effectsSection}>
              <h4 className={styles.effectsTitle}>Active Effects</h4>
              {renderActiveEffects('enemy')}
            </div>
            
            <div className={styles.enemyHand}>
              <div className={styles.enemyHandTitle}>
                Hand: <span>{enemyWizard.hand.length} cards</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Player action area */}
        {status === 'active' && isPlayerTurn && (
          <div className={styles.actionArea}>
            <h3 className={styles.actionTitle}>Your Hand</h3>
            
            {renderPlayerHand()}
            
            <div className={styles.actionButtons}>
              <button 
                className={styles.mysticPunchButton}
                onClick={onMysticPunch}
                disabled={isAnimating}
              >
                Mystic Punch
              </button>
              
              <button 
                className={styles.skipTurnButton}
                onClick={onSkipTurn}
                disabled={isAnimating}
              >
                Skip Turn
              </button>
            </div>
          </div>
        )}
        
        {/* Game over UI */}
        {status !== 'active' && (
          <div className={styles.gameOverContainer} style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            zIndex: 9999, 
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }}>
            <div className={styles.gameOverMessage} style={{
              backgroundColor: '#1a1a2e',
              border: '2px solid #6a4c93',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 0 20px rgba(106, 76, 147, 0.7)',
              width: '80%',
              maxWidth: '500px',
              textAlign: 'center'
            }}>
              <h2 className={styles.gameOverTitle} style={{ color: '#e94560', fontSize: '2.5rem', marginBottom: '20px' }}>
                {status === 'playerWon' ? 'Victory!' : 'Defeat!'}
              </h2>
              <p style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px' }}>
                {status === 'playerWon' 
                  ? 'You gained experience and improved your magical prowess!' 
                  : 'You have been defeated by the enemy wizard!'}
              </p>
              <button 
                className={styles.continueButton}
                onClick={onContinue}
                style={{
                  backgroundColor: '#6a4c93',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
              >
                Continue to Wizard's Study
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleArena; 