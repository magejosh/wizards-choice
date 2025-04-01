'use client';

import React, { useState } from 'react';
import { theme } from '../../lib/ui/theme';
import StatusBar from '../../lib/ui/components/StatusBar';

export default function SimplifiedDemo() {
  const [currentView, setCurrentView] = useState('battle');
  const [playerHealth, setPlayerHealth] = useState(100);
  const [playerMana, setPlayerMana] = useState(100);
  const [enemyHealth, setEnemyHealth] = useState(100);
  const [enemyMana, setEnemyMana] = useState(100);
  const [turnCount, setTurnCount] = useState(1);
  const [battleLog, setBattleLog] = useState(['Battle started']);
  
  // Sample spells for demonstration
  const spells = [
    { id: 1, name: 'Fireball', type: 'damage', element: 'fire', manaCost: 15, damage: 20 },
    { id: 2, name: 'Water Blast', type: 'damage', element: 'water', manaCost: 10, damage: 15 },
    { id: 3, name: 'Arcane Missile', type: 'damage', element: 'arcane', manaCost: 15, damage: 20 },
  ];
  
  const castSpell = (spell) => {
    if (playerMana < spell.manaCost) {
      setBattleLog([...battleLog, 'Not enough mana to cast ' + spell.name]);
      return;
    }
    
    // Player turn
    setPlayerMana(playerMana - spell.manaCost);
    setEnemyHealth(Math.max(0, enemyHealth - spell.damage));
    setBattleLog([...battleLog, `You cast ${spell.name} for ${spell.damage} damage`]);
    
    // Check if enemy is defeated
    if (enemyHealth - spell.damage <= 0) {
      setBattleLog([...battleLog, `You cast ${spell.name} for ${spell.damage} damage`, 'Enemy defeated!']);
      return;
    }
    
    // Enemy turn
    setTimeout(() => {
      const enemySpell = spells[Math.floor(Math.random() * spells.length)];
      setEnemyMana(enemyMana - enemySpell.manaCost);
      setPlayerHealth(Math.max(0, playerHealth - enemySpell.damage));
      setBattleLog([...battleLog, 
        `You cast ${spell.name} for ${spell.damage} damage`, 
        `Enemy casts ${enemySpell.name} for ${enemySpell.damage} damage`
      ]);
      setTurnCount(turnCount + 1);
      
      // Check if player is defeated
      if (playerHealth - enemySpell.damage <= 0) {
        setBattleLog([...battleLog, 
          `You cast ${spell.name} for ${spell.damage} damage`, 
          `Enemy casts ${enemySpell.name} for ${enemySpell.damage} damage`,
          'You were defeated!'
        ]);
      }
    }, 500);
  };
  
  const useMysticPunch = () => {
    // Mystic punch logic
    const damage = 10;
    setEnemyHealth(Math.max(0, enemyHealth - damage));
    setBattleLog([...battleLog, `You used Mystic Punch for ${damage} damage`]);
    
    // Enemy turn
    setTimeout(() => {
      const enemySpell = spells[Math.floor(Math.random() * spells.length)];
      setEnemyMana(enemyMana - enemySpell.manaCost);
      setPlayerHealth(Math.max(0, playerHealth - enemySpell.damage));
      setBattleLog([...battleLog, 
        `You used Mystic Punch for ${damage} damage`, 
        `Enemy casts ${enemySpell.name} for ${enemySpell.damage} damage`
      ]);
      setTurnCount(turnCount + 1);
    }, 500);
  };
  
  const skipTurn = () => {
    // Regenerate some mana when skipping turn
    setPlayerMana(Math.min(100, playerMana + 10));
    setBattleLog([...battleLog, 'You skipped your turn and regenerated 10 mana']);
    
    // Enemy turn
    setTimeout(() => {
      const enemySpell = spells[Math.floor(Math.random() * spells.length)];
      setEnemyMana(enemyMana - enemySpell.manaCost);
      setPlayerHealth(Math.max(0, playerHealth - enemySpell.damage));
      setBattleLog([...battleLog, 
        'You skipped your turn and regenerated 10 mana', 
        `Enemy casts ${enemySpell.name} for ${enemySpell.damage} damage`
      ]);
      setTurnCount(turnCount + 1);
    }, 500);
  };
  
  const resetBattle = () => {
    setPlayerHealth(100);
    setPlayerMana(100);
    setEnemyHealth(100);
    setEnemyMana(100);
    setTurnCount(1);
    setBattleLog(['Battle started']);
  };
  
  const renderBattleView = () => {
    return (
      <div className="battle-view">
        <div className="battle-header">
          <h2>Turn: {turnCount}</h2>
          <p>Last Action: {battleLog[battleLog.length - 1]}</p>
        </div>
        
        <div className="battle-arena">
          <div className="player-stats">
            <h3>Your Wizard</h3>
            <div className="stat-bars">
              <div className="stat-bar">
                <label>Health</label>
                <StatusBar current={playerHealth} max={100} type="health" />
                <span>{playerHealth}/100</span>
              </div>
              <div className="stat-bar">
                <label>Mana</label>
                <StatusBar current={playerMana} max={100} type="mana" />
                <span>{playerMana}/100</span>
              </div>
            </div>
          </div>
          
          <div className="battle-field">
            <div className="wizard player-wizard">
              <div className="wizard-avatar" style={{ backgroundColor: theme.colors.primary.main }}></div>
            </div>
            <div className="wizard enemy-wizard">
              <div className="wizard-avatar" style={{ backgroundColor: theme.colors.secondary.main }}></div>
            </div>
          </div>
          
          <div className="enemy-stats">
            <h3>Enemy Wizard</h3>
            <div className="stat-bars">
              <div className="stat-bar">
                <label>Health</label>
                <StatusBar current={enemyHealth} max={100} type="health" />
                <span>{enemyHealth}/100</span>
              </div>
              <div className="stat-bar">
                <label>Mana</label>
                <StatusBar current={enemyMana} max={100} type="mana" />
                <span>{enemyMana}/100</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="battle-log">
          <h3>Battle Log</h3>
          <div className="log-entries">
            {battleLog.map((entry, index) => (
              <p key={index}>{entry}</p>
            ))}
          </div>
        </div>
        
        <div className="spell-selection">
          <h3>Your Spells</h3>
          <div className="spell-cards">
            {spells.map(spell => (
              <div 
                key={spell.id} 
                className="spell-card"
                onClick={() => castSpell(spell)}
                style={{ 
                  backgroundColor: theme.colors.ui.card,
                  borderColor: theme.colors.ui.cardBorder,
                  opacity: playerMana < spell.manaCost ? 0.6 : 1
                }}
              >
                <div className="spell-header">
                  <h4>{spell.name}</h4>
                  <span className="spell-type">{spell.type}</span>
                </div>
                <div className="spell-element">{spell.element}</div>
                <div className="spell-effect">Damage: {spell.damage}</div>
                <div className="spell-mana">Mana Cost: {spell.manaCost}</div>
              </div>
            ))}
            
            <div 
              className="spell-action mystic-punch"
              onClick={useMysticPunch}
              style={{ backgroundColor: 'rgba(255, 61, 61, 0.2)' }}
            >
              <h4>Mystic Punch</h4>
              <p>Discard a spell to deal 10 damage</p>
              <p>No mana cost</p>
            </div>
            
            <div 
              className="spell-action skip-turn"
              onClick={skipTurn}
              style={{ backgroundColor: 'rgba(59, 122, 255, 0.2)' }}
            >
              <h4>Skip Turn</h4>
              <p>Regenerate 10 mana</p>
            </div>
          </div>
        </div>
        
        <div className="battle-controls">
          <button onClick={resetBattle}>Reset Battle</button>
          <button onClick={() => setCurrentView('study')}>Go to Wizard's Study</button>
          <button onClick={() => window.location.href = '/'}>Return to Main Menu</button>
        </div>
      </div>
    );
  };
  
  const renderWizardStudy = () => {
    return (
      <div className="wizard-study-view">
        <h2>Wizard's Study</h2>
        <p>This is where you would manage your spells, equipment, and prepare for your next duel.</p>
        
        <div className="study-sections">
          <div className="study-section">
            <h3>Your Stats</h3>
            <p>Level: 1</p>
            <p>Experience: 0/100</p>
            <p>Health: 100/100</p>
            <p>Mana: 100/100</p>
            <p>Mana Regen: 5 per turn</p>
          </div>
          
          <div className="study-section">
            <h3>Your Spells</h3>
            <ul>
              {spells.map(spell => (
                <li key={spell.id}>{spell.name} - {spell.element} ({spell.manaCost} mana)</li>
              ))}
            </ul>
          </div>
          
          <div className="study-section">
            <h3>Your Equipment</h3>
            <p>Wand: Apprentice Wand (+5% Spell Power)</p>
            <p>Robe: Novice Robe (+10 Health)</p>
            <p>Amulet: None</p>
            <p>Rings: None</p>
          </div>
        </div>
        
        <div className="study-controls">
          <button onClick={() => setCurrentView('battle')}>Start Duel</button>
          <button onClick={() => window.location.href = '/'}>Return to Main Menu</button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="simplified-demo" style={{ 
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      color: theme.colors.ui.text,
      fontFamily: 'Raleway, sans-serif'
    }}>
      <style jsx global>{`
        body {
          background-color: ${theme.colors.ui.background};
          margin: 0;
          padding: 0;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Cinzel', serif;
          color: ${theme.colors.primary.main};
        }
        
        button {
          background-color: ${theme.colors.primary.main};
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin: 5px;
          font-family: 'Raleway', sans-serif;
        }
        
        button:hover {
          background-color: ${theme.colors.primary.light};
        }
        
        .battle-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .battle-arena {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .player-stats, .enemy-stats {
          width: 250px;
          padding: 15px;
          background-color: ${theme.colors.ui.backgroundLight};
          border-radius: 8px;
        }
        
        .battle-field {
          flex: 1;
          display: flex;
          justify-content: space-around;
          align-items: center;
          height: 200px;
          margin: 0 20px;
          background-color: ${theme.colors.ui.backgroundLight};
          border-radius: 8px;
          position: relative;
        }
        
        .wizard {
          text-align: center;
        }
        
        .wizard-avatar {
          width: 80px;
          height: 120px;
          border-radius: 50% 50% 0 0;
          position: relative;
        }
        
        .battle-log {
          margin-bottom: 20px;
          padding: 15px;
          background-color: ${theme.colors.ui.backgroundLight};
          border-radius: 8px;
          max-height: 150px;
          overflow-y: auto;
        }
        
        .log-entries p {
          margin: 5px 0;
        }
        
        .spell-selection {
          margin-bottom: 20px;
        }
        
        .spell-cards {
          display: flex;
          gap: 15px;
          overflow-x: auto;
          padding-bottom: 10px;
        }
        
        .spell-card, .spell-action {
          width: 150px;
          height: 200px;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid ${theme.colors.ui.cardBorder};
          cursor: pointer;
          transition: transform 0.2s;
          display: flex;
          flex-direction: column;
        }
        
        .spell-card:hover, .spell-action:hover {
          transform: translateY(-5px);
        }
        
        .spell-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .spell-type {
          font-size: 0.8em;
          background-color: ${theme.colors.primary.dark};
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        .spell-element {
          margin-bottom: 10px;
          font-style: italic;
        }
        
        .battle-controls, .study-controls {
          display: flex;
          justify-content: center;
          margin-top: 20px;
        }
        
        .wizard-study-view {
          padding: 20px;
          background-color: ${theme.colors.ui.backgroundLight};
          border-radius: 8px;
        }
        
        .study-sections {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin: 20px 0;
        }
        
        .study-section {
          flex: 1;
          min-width: 250px;
          padding: 15px;
          background-color: ${theme.colors.ui.card};
          border-radius: 8px;
          border: 1px solid ${theme.colors.ui.cardBorder};
        }
      `}</style>
      
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Wizard's Choice - Demo</h1>
      
      {currentView === 'battle' ? renderBattleView() : renderWizardStudy()}
    </div>
  );
}
