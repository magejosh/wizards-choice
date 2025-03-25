'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

// Declare global window property for TypeScript
declare global {
  interface Window {
    gameInstance: any; // Use 'any' to avoid specific interface requirements
  }
}

// This component will integrate the game's ThreeJS functionality
export default function GameComponent() {
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const [gameState, setGameState] = useState({
    isInitialized: false,
    currentScreen: 'loading',
    gameStateManager: null as any | null,
    sceneManager: null as any | null,
    uiManager: null as any | null,
    spellSystem: null as any | null,
    progressionSystem: null as any | null,
    playerSpells: [] as any[],
    showMenu: false
  })

  useEffect(() => {
    const initGame = async () => {
      try {
        console.log('Initializing game...')
        
        // Get the battle scene container
        const battleSceneContainer = document.getElementById('battle-scene');
        if (!battleSceneContainer) {
          console.error('Battle scene container not found');
          return;
        }
        
        // Create managers
        const gameStateManager = new (await import('../game/managers/GameStateManager')).default()
        const sceneManager = new (await import('../game/managers/SceneManager')).SceneManager()
        const uiManager = new (await import('../game/ui/EnhancedUIManager')).default()
        const spellSystem = new (await import('../game/core/EnhancedSpellSystem')).default()
        const progressionSystem = new (await import('../game/core/ProgressionSystem')).ProgressionSystem()
        
        // Initialize spell system first
        await spellSystem.init()
        
        // Initialize UI manager
        await uiManager.init()
        
        // Initialize scene manager
        await sceneManager.init(battleSceneContainer)
        
        // Initialize progression system
        await progressionSystem.init(spellSystem)
        
        // Initialize game state manager with all dependencies
        await gameStateManager.init(uiManager, sceneManager, spellSystem, progressionSystem, battleSceneContainer)
        
        // Function to create floating text effects
        const createFloatingText = (text, type, targetElement) => {
          // Create element
          const floatingText = document.createElement('div');
          floatingText.className = `floating-text ${type}`;
          floatingText.textContent = text;
          
          // Position element - get target position
          const targetBounds = targetElement.getBoundingClientRect();
          
          // Position floating text
          floatingText.style.top = `${targetBounds.top + targetBounds.height/2}px`;
          floatingText.style.left = `${targetBounds.left + targetBounds.width/2}px`;
          
          // Add to document
          document.body.appendChild(floatingText);
          
          // Remove after animation completes
          setTimeout(() => {
            if (document.body.contains(floatingText)) {
              document.body.removeChild(floatingText);
            }
          }, 2000);
        };
        
        // Function to show spell cast information
        const showSpellCast = (caster, spellName) => {
          // Check if there's an existing spell cast text
          const existingText = document.querySelector('.spell-cast-text');
          if (existingText && document.body.contains(existingText)) {
            document.body.removeChild(existingText);
          }
          
          // Create element
          const spellText = document.createElement('div');
          spellText.className = 'spell-cast-text';
          spellText.textContent = `${caster} casts ${spellName}!`;
          
          // Add to document
          document.body.appendChild(spellText);
          
          // Remove after a delay
          setTimeout(() => {
            if (document.body.contains(spellText)) {
              document.body.removeChild(spellText);
            }
          }, 3000);
        };
        
        // Hook into spell cast events
        const originalPlayerCastSpell = gameStateManager.playerCastSpell;
        gameStateManager.playerCastSpell = function(spellId) {
          const spellData = spellSystem.getSpellById(spellId);
          if (spellData) {
            const playerElement = document.querySelector('#player-stats-overlay');
            if (playerElement) {
              // Show spell cast text
              showSpellCast('Player', spellData.name);
              
              // Show mana cost
              if (spellData.manaCost > 0) {
                createFloatingText(`-${spellData.manaCost} Mana`, 'mana-text', playerElement);
              }
            }
          }
          
          // Call original method
          return originalPlayerCastSpell.call(gameStateManager, spellId);
        };
        
        // Hook into enemy spell cast events
        const originalEnemyCastSpell = gameStateManager.enemyCastSpell;
        gameStateManager.enemyCastSpell = function(spellId) {
          const spellData = spellSystem.getSpellById(spellId);
          if (spellData) {
            const enemyElement = document.querySelector('#enemy-stats-overlay');
            if (enemyElement) {
              // Show spell cast text
              showSpellCast('Enemy', spellData.name);
              
              // Show mana cost
              if (spellData.manaCost > 0) {
                createFloatingText(`-${spellData.manaCost} Mana`, 'mana-text', enemyElement);
              }
            }
          }
          
          // Call original method
          return originalEnemyCastSpell.call(gameStateManager, spellId);
        };
        
        // Hook into damage/healing events
        gameStateManager.onDamageDealt = function(target, amount) {
          const targetElement = target === 'player' ? 
            document.querySelector('#player-stats-overlay') : 
            document.querySelector('#enemy-stats-overlay');
          
          if (targetElement && amount > 0) {
            createFloatingText(`-${amount} HP`, 'damage-text', targetElement);
          }
        };
        
        gameStateManager.onHealingReceived = function(target, amount) {
          const targetElement = target === 'player' ? 
            document.querySelector('#player-stats-overlay') : 
            document.querySelector('#enemy-stats-overlay');
          
          if (targetElement && amount > 0) {
            createFloatingText(`+${amount} HP`, 'heal-text', targetElement);
          }
        };
        
        gameStateManager.onManaRestored = function(target, amount) {
          const targetElement = target === 'player' ? 
            document.querySelector('#player-stats-overlay') : 
            document.querySelector('#enemy-stats-overlay');
          
          if (targetElement && amount > 0) {
            createFloatingText(`+${amount} Mana`, 'mana-text', targetElement);
          }
        };
        
        // Set up state change handler
        gameStateManager.onStateChange = (newState: string) => {
          console.log(`Game state changed to: ${newState}`)
          if (newState === 'battle' || newState === 'spell-cast' || newState === 'turn-end') {
            // Update player spells when battle starts, a spell is cast, or turn ends (new card drawn)
            const playerHand = spellSystem.getPlayerSpellHand();
            console.log('Updating UI with player hand:', playerHand);
            setGameState(prevState => ({
              ...prevState,
              playerSpells: playerHand
            }))
          }
        }
        
        // Global event listener for settings back button
        window.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') {
            console.log('Escape key pressed, checking if settings screen is active');
            const settingsScreen = document.getElementById('settings-screen');
            if (settingsScreen && settingsScreen.classList.contains('active')) {
              console.log('Settings screen is active, returning to main menu');
              uiManager.returnToMainMenu();
            }
          }
        });
        
        // Make game instance available globally for debugging
        window.gameInstance = {
          gameStateManager,
          sceneManager,
          uiManager,
          spellSystem,
          progressionSystem
        }
        
        // Update state
        setGameState({
          isInitialized: true,
          currentScreen: 'main-menu',
          gameStateManager,
          sceneManager,
          uiManager,
          spellSystem,
          progressionSystem,
          playerSpells: [], // Will be populated when battle starts
          showMenu: false
        })
        
        // Show main menu screen after initialization
        uiManager.hideAllScreens();
        uiManager.showScreen('main-menu');
        
        console.log('Game initialized successfully')
      } catch (error) {
        console.error('Error initializing game:', error)
      }
    }
    
    initGame()
    
    // Cleanup on unmount
    return () => {
      if (gameState.sceneManager) {
        gameState.sceneManager.dispose()
      }
    }
  }, [])

  useEffect(() => {
    // Set up event listeners
    if (typeof window !== 'undefined') {
      const menuBtn = document.getElementById('menu-btn');
      if (menuBtn) {
        menuBtn.addEventListener('click', () => {
          // Show a small menu popup
          setGameState(prevState => ({ ...prevState, showMenu: !prevState.showMenu }));
        });
      }

      // Set up sync between hidden elements and visible overlay elements
      const setupUISync = () => {
        // Function to sync player health
        const syncPlayerHealth = () => {
          const playerHealthFill = document.querySelector('#player-health .health-fill') as HTMLElement;
          const playerHealthText = document.querySelector('#player-health .health-text') as HTMLElement;
          const overlayHealthFill = document.querySelector('#player-stats-overlay .overlay-health-fill') as HTMLElement;
          const overlayHealthText = document.querySelector('#player-stats-overlay .overlay-stat-label span:nth-child(2)') as HTMLElement;
          
          if (playerHealthFill && overlayHealthFill) {
            const width = playerHealthFill.style.width;
            if (width) {
              overlayHealthFill.style.width = width;
            }
          }
          
          if (playerHealthText && overlayHealthText) {
            overlayHealthText.textContent = playerHealthText.textContent;
          }
        };
        
        // Function to sync player mana
        const syncPlayerMana = () => {
          const playerManaFill = document.querySelector('#player-mana .mana-fill') as HTMLElement;
          const playerManaText = document.querySelector('#player-mana .mana-text') as HTMLElement;
          const overlayManaFill = document.querySelector('#player-stats-overlay .overlay-mana-fill') as HTMLElement;
          const overlayManaText = document.querySelector('#player-stats-overlay .overlay-stat:nth-child(3) .overlay-stat-label span:nth-child(2)') as HTMLElement;
          
          if (playerManaFill && overlayManaFill) {
            const width = playerManaFill.style.width;
            if (width) {
              overlayManaFill.style.width = width;
            }
          }
          
          if (playerManaText && overlayManaText) {
            overlayManaText.textContent = playerManaText.textContent;
          }
        };
        
        // Function to sync enemy health and mana
        const syncEnemyStats = () => {
          const enemyHealthFill = document.querySelector('#opponent-health .health-fill') as HTMLElement;
          const enemyHealthText = document.querySelector('#opponent-health .health-text') as HTMLElement;
          const overlayHealthFill = document.querySelector('#enemy-stats-overlay .overlay-health-fill') as HTMLElement;
          const overlayHealthText = document.querySelector('#enemy-stats-overlay .overlay-stat:nth-child(2) .overlay-stat-label span:nth-child(2)') as HTMLElement;
          
          if (enemyHealthFill && overlayHealthFill) {
            const width = enemyHealthFill.style.width;
            if (width) {
              overlayHealthFill.style.width = width;
            }
          }
          
          if (enemyHealthText && overlayHealthText) {
            overlayHealthText.textContent = enemyHealthText.textContent;
          }
          
          const enemyManaFill = document.querySelector('#opponent-mana .mana-fill') as HTMLElement;
          const enemyManaText = document.querySelector('#opponent-mana .mana-text') as HTMLElement;
          const overlayManaFill = document.querySelector('#enemy-stats-overlay .overlay-mana-fill') as HTMLElement;
          const overlayManaText = document.querySelector('#enemy-stats-overlay .overlay-stat:nth-child(3) .overlay-stat-label span:nth-child(2)') as HTMLElement;
          
          if (enemyManaFill && overlayManaFill) {
            const width = enemyManaFill.style.width;
            if (width) {
              overlayManaFill.style.width = width;
            }
          }
          
          if (enemyManaText && overlayManaText) {
            overlayManaText.textContent = enemyManaText.textContent;
          }
        };
        
        // Set up MutationObserver to watch for changes to the hidden elements
        const setupObserver = () => {
          // Create MutationObserver instance
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              const target = mutation.target as HTMLElement;
              
              // Check which element changed and sync accordingly
              if (target.closest('#player-health')) {
                syncPlayerHealth();
              } else if (target.closest('#player-mana')) {
                syncPlayerMana();
              } else if (target.closest('#opponent-health') || target.closest('#opponent-mana')) {
                syncEnemyStats();
              }
            });
          });
          
          // Configure and start the observer
          const config = { attributes: true, childList: true, characterData: true, subtree: true };
          
          // Observe player health and mana
          const playerHealth = document.getElementById('player-health');
          const playerMana = document.getElementById('player-mana');
          const opponentHealth = document.getElementById('opponent-health');
          const opponentMana = document.getElementById('opponent-mana');
          
          if (playerHealth) observer.observe(playerHealth, config);
          if (playerMana) observer.observe(playerMana, config);
          if (opponentHealth) observer.observe(opponentHealth, config);
          if (opponentMana) observer.observe(opponentMana, config);
        };
        
        // Initial sync
        syncPlayerHealth();
        syncPlayerMana();
        syncEnemyStats();
        
        // Set up observer
        setupObserver();
        
        // Periodic sync (as a fallback)
        const syncInterval = setInterval(() => {
          syncPlayerHealth();
          syncPlayerMana();
          syncEnemyStats();
        }, 500);
        
        return () => clearInterval(syncInterval);
      };
      
      // Run the setup after a short delay to ensure DOM is ready
      const syncSetupTimeout = setTimeout(setupUISync, 1000);
      return () => clearTimeout(syncSetupTimeout);
    }
  }, [])

  // Effect to connect spell buttons after component renders
  useEffect(() => {
    if (gameState.isInitialized && gameState.gameStateManager) {
      // Connect UI elements
      gameState.gameStateManager.setupEventListeners()
      
      // Add click event listeners to spell buttons
      const spellButtons = document.querySelectorAll('.spell-button')
      spellButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const target = e.currentTarget as HTMLElement
          const spellId = target.getAttribute('data-spell-id')
          if (spellId && gameState.gameStateManager) {
            console.log(`Attempting to cast spell with ID: ${spellId}`);
            console.log(`Current player spells in React state:`, gameState.playerSpells);
            console.log(`Current player spell hand in SpellSystem:`, gameState.spellSystem.getPlayerSpellHand());
            gameState.gameStateManager.playerCastSpell(spellId)
          }
        })
      })
      
      // Manually add event listener for settings back button
      const closeSettingsBtn = document.getElementById('close-settings-btn')
      if (closeSettingsBtn) {
        console.log('Manually attaching event listener to close-settings-btn')
        closeSettingsBtn.addEventListener('click', () => {
          if (gameState.uiManager) {
            console.log('UI Manager found:', gameState.uiManager);
            gameState.uiManager.showScreen('main-menu')
          } else {
            console.error('UI Manager not found in state')
            alert('Error: UI Manager not found')
          }
        })
      } else {
        console.warn('close-settings-btn not found during manual attachment')
      }
      
      // Update spell button states initially
      gameState.gameStateManager.updateSpellButtonStates()
    }
  }, [gameState.isInitialized, gameState.playerSpells])

  // Get element color based on spell element
  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire':
        return '#ff5722'
      case 'water':
        return '#2196f3'
      case 'earth':
        return '#795548'
      case 'air':
        return '#90caf9'
      case 'arcane':
        return '#9c27b0'
      default:
        return '#ffffff'
    }
  }

  // Get element icon based on spell element
  const getElementIcon = (element: string) => {
    switch (element) {
      case 'fire':
        return '🔥'
      case 'water':
        return '💧'
      case 'earth':
        return '🪨'
      case 'air':
        return '💨'
      case 'arcane':
        return '✨'
      default:
        return '⚡'
    }
  }

  return (
    <div id="game-container" className="game-container">
      {/* Loading Screen */}
      <div id="loading-screen" className="game-screen">
        <div className="loading-content">
          <h1>Wizard's Choice</h1>
          <div className="loading-spinner"></div>
          <p>Loading the magical realm...</p>
        </div>
      </div>
      
      {/* Main Menu */}
      <div id="main-menu" className="game-screen">
        <div className="menu-content">
          <h1>Wizard's Choice</h1>
          <div className="menu-buttons">
            <button id="start-game-btn" className="menu-button">Start New Game</button>
            <button id="continue-game-btn" className="menu-button">Continue Game</button>
            <button id="settings-btn" className="menu-button">Settings</button>
          </div>
        </div>
      </div>
      
      {/* Settings Screen */}
      <div id="settings-screen" className="game-screen">
        <div className="settings-content">
          <h1>Settings</h1>
          <div className="settings-options">
            <div className="setting-option">
              <label htmlFor="music-volume">Music Volume:</label>
              <input 
                type="range" 
                id="music-volume" 
                name="music-volume"
                min="0" 
                max="100" 
                defaultValue="50" 
              />
            </div>
            <div className="setting-option">
              <label htmlFor="sfx-volume">Sound Effects Volume:</label>
              <input 
                type="range" 
                id="sfx-volume" 
                name="sfx-volume"
                min="0" 
                max="100" 
                defaultValue="70" 
              />
            </div>
            <div className="setting-option">
              <label htmlFor="difficulty-select">Difficulty:</label>
              <select 
                id="difficulty-select" 
                name="difficulty" 
                defaultValue="normal"
              >
                <option value="easy">Easy</option>
                <option value="normal">Normal</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <button 
            id="close-settings-btn" 
            className="menu-button"
            onClick={(e) => {
              e.preventDefault();
              console.log('Settings back button clicked via React handler');
              alert('Back button clicked!');
              
              try {
                // Direct DOM manipulation approach
                const mainMenu = document.getElementById('main-menu');
                const settingsScreen = document.getElementById('settings-screen');
                
                if (mainMenu && settingsScreen) {
                  // Hide all screens first
                  document.querySelectorAll('.game-screen').forEach(screen => {
                    screen.classList.add('hidden');
                    screen.classList.remove('active');
                  });
                  
                  // Show main menu
                  mainMenu.classList.remove('hidden');
                  mainMenu.classList.add('active');
                  console.log('Directly manipulated DOM to show main menu');
                }
                
                // Also try the UI manager approach
                if (gameState.uiManager) {
                  console.log('UI Manager found, using returnToMainMenu');
                  gameState.uiManager.returnToMainMenu();
                }
              } catch (error) {
                console.error('Error handling settings back button:', error);
                alert('Error: ' + error.message);
              }
            }}
          >
            Back to Menu
          </button>
        </div>
      </div>
      
      {/* Game UI */}
      <div id="game-ui" className="game-screen scene-integrated">
        <div id="battle-container">
          {/* Battle Scene Canvas Container */}
          <div id="battle-scene"></div>
          
          {/* Stat Overlays */}
          <div id="player-stats-overlay" className="stats-overlay">
            <div className="overlay-name">Your Wizard</div>
            <div className="overlay-stat">
              <div className="overlay-stat-label">
                <span>Health</span>
                <span>100/100</span>
              </div>
              <div className="overlay-bar">
                <div className="overlay-bar-fill overlay-health-fill" style={{width: '100%'}}></div>
              </div>
            </div>
            <div className="overlay-stat">
              <div className="overlay-stat-label">
                <span>Mana</span>
                <span>100/100</span>
              </div>
              <div className="overlay-bar">
                <div className="overlay-bar-fill overlay-mana-fill" style={{width: '100%'}}></div>
              </div>
            </div>
          </div>
          
          <div id="enemy-stats-overlay" className="stats-overlay">
            <div className="overlay-name">Enemy Wizard</div>
            <div className="overlay-stat">
              <div className="overlay-stat-label">
                <span>Health</span>
                <span>100/100</span>
              </div>
              <div className="overlay-bar">
                <div className="overlay-bar-fill overlay-health-fill" style={{width: '100%'}}></div>
              </div>
            </div>
            <div className="overlay-stat">
              <div className="overlay-stat-label">
                <span>Mana</span>
                <span>100/100</span>
              </div>
              <div className="overlay-bar">
                <div className="overlay-bar-fill overlay-mana-fill" style={{width: '100%'}}></div>
              </div>
            </div>
          </div>
          
          <div id="battle-info-overlay" className="stats-overlay">
            <div>Turn: <span id="overlay-turn-counter">1</span></div>
            <div>Last Action: <span id="overlay-last-action">Battle started</span></div>
          </div>
          
          {/* Hidden elements for compatibility - do not display */}
          <div id="player-health" className="hidden-ui-element">
            <div className="health-fill"></div>
            <div className="health-text">100/100</div>
          </div>
          <div id="player-mana" className="hidden-ui-element">
            <div className="mana-fill"></div>
            <div className="mana-text">100/100</div>
          </div>
          <div id="opponent-health" className="hidden-ui-element">
            <div className="health-fill"></div>
            <div className="health-text">100/100</div>
          </div>
          <div id="opponent-mana" className="hidden-ui-element">
            <div className="mana-fill"></div>
            <div className="mana-text">100/100</div>
          </div>
          
          {/* Spell Container - overlay on the battle scene */}
          <div id="spell-container">
            <div id="spell-choices" className="spell-choices">
              <div className="spells-header">
                <span>Your Spells: <span className="spells-known-count"><span id="player-spells-count">{gameState.playerSpells.length}</span> Known</span></span>
              </div>
              <div className="spells-list">
                {gameState.playerSpells.map((spell, index) => (
                  <div 
                    key={spell.instanceId || `${spell.id}_${index}`} 
                    className="spell-button" 
                    data-spell-id={spell.id}
                    onClick={(e) => {
                      console.log(`Spell clicked: ${spell.name}`);
                      // Any additional click handling here
                    }}
                    style={{ 
                      backgroundColor: `rgba(20, 20, 50, 0.9)`,
                      borderColor: getElementColor(spell.element)
                    }}
                  >
                    <div className="spell-header" style={{
                      backgroundColor: `${getElementColor(spell.element)}30`,
                      borderBottom: `1px solid ${getElementColor(spell.element)}60`
                    }}>
                      <span className="spell-element">{getElementIcon(spell.element)}</span>
                      <span className="spell-name">{spell.name}</span>
                      <span className="spell-cost">{spell.manaCost} MP</span>
                    </div>
                    <div className="spell-image-container">
                      <div 
                        className="spell-element-placeholder"
                        style={{
                          backgroundColor: `${getElementColor(spell.element)}40`,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '36px'
                        }}
                      >
                        {getElementIcon(spell.element)}
                        <span className="spell-element-text">{spell.element}</span>
                      </div>
                    </div>
                    <div className="spell-description">
                      {spell.description}
                    </div>
                    <div className="spell-stats" style={{
                      backgroundColor: `${getElementColor(spell.element)}20`
                    }}>
                      {spell.damage > 0 && <span className="spell-damage">Damage: {spell.damage}</span>}
                      {spell.healing > 0 && <span className="spell-healing">Healing: {spell.healing}</span>}
                      {spell.manaRestore > 0 && <span className="spell-mana">Mana: +{spell.manaRestore}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Menu Button (bottom right corner) */}
        <div className="corner-button menu-button-container">
          <button id="menu-btn" className="icon-button" onClick={() => setGameState(prevState => ({ ...prevState, showMenu: !prevState.showMenu }))}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
            </svg>
          </button>
          
          {/* Menu Popup */}
          {gameState.showMenu && (
            <div className="menu-popup">
              <button className="menu-popup-item" onClick={() => {
                // Return to main menu
                setGameState(prevState => ({ ...prevState, showMenu: false }));
                document.getElementById('main-menu')?.classList.remove('hidden');
                document.getElementById('game-ui')?.classList.add('hidden');
              }}>
                Return to Main Menu
              </button>
              <button className="menu-popup-item" onClick={() => {
                // Toggle sound
                setGameState(prevState => ({ ...prevState, showMenu: false }));
                // Sound toggle logic would go here
              }}>
                Toggle Sound
              </button>
              <button className="menu-popup-item" onClick={() => {
                // Close menu
                setGameState(prevState => ({ ...prevState, showMenu: false }));
              }}>
                Close Menu
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Game Over Screen */}
      <div id="game-over" className="game-screen">
        <div className="game-over-content">
          <h1>Game Over</h1>
          <div id="game-over-result" className="result-message">You were defeated!</div>
          <div className="game-over-buttons">
            <button id="play-again-btn" className="menu-button">Play Again</button>
            <button id="return-to-menu-btn-over" className="menu-button">Return to Menu</button>
          </div>
        </div>
      </div>
      
      {/* Results Screen */}
      <div id="results-screen" className="game-screen">
        <div className="results-content">
          <h1>Battle Results</h1>
          <div id="result-message" className="result-message">You won the battle!</div>
          <div id="rewards-list" className="rewards-list">
            <div className="reward-item">Experience gained: 100</div>
            <div className="reward-item new-spell">New spell unlocked: Thunderstorm!</div>
          </div>
          <div className="results-buttons">
            <button id="continue-btn" className="menu-button">Continue</button>
            <button id="return-to-menu-btn-results" className="menu-button">Return to Menu</button>
          </div>
        </div>
      </div>
    </div>
  )
}
