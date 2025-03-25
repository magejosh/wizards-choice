// GameStateManager.js - Handles overall game state

import BattleManager from './BattleManager.js';
import PlayerManager from './PlayerManager.js';
import UIElementManager from '../ui/UIElementManager.js';

/**
 * Manages the overall game state and provides centralized access to game components
 */
export class GameStateManager {
    /**
     * Initialize the GameStateManager with default state
     */
    constructor() {
        this.uiManager = null;
        this.uiElementManager = null; // Alias for consistency
        this.sceneManager = null;
        this.spellSystem = null;
        this.progressionSystem = null;
        this.audioManager = null;
        this.onStateChange = null;
        this.battleManager = null;
        this.playerManager = null;
        this.defeatedEnemySpells = [];
        
        this.gameState = {
            isPlaying: false,
            currentTurn: 0,
            player: {
                health: 100,
                maxHealth: 100,
                mana: 100,
                maxMana: 100,
                manaRegen: 10,
                level: 1,
                experience: 0,
                spells: [],
                prevHealth: 100 // Store previous health for animation effects
            },
            opponent: {
                health: 100,
                maxHealth: 100,
                mana: 100,
                maxMana: 100,
                manaRegen: 10,
                spells: [],
                difficulty: 'normal',
                aiLevel: 1,
                prevHealth: 100 // Store previous health for animation effects
            },
            battleLog: []
        };
    }
    
    /**
     * Initialize the game manager
     * @param {Object} uiManager - The UI manager instance
     * @param {Object} sceneManager - The scene manager instance
     * @param {Object} spellSystem - The spell system instance
     * @param {Object} progressionSystem - The progression system instance
     * @param {Object} battleSceneContainer - The battle scene container
     */
    async init(uiManager, sceneManager, spellSystem, progressionSystem, battleSceneContainer) {
        console.log('Initializing Game State Manager...');
        
        // Store references to other managers
        this.uiManager = uiManager;
        
        // Initialize UI Element Manager properly
        this.uiElementManager = new UIElementManager(this.gameState);
        await this.uiElementManager.init();
        
        this.sceneManager = sceneManager;
        this.spellSystem = spellSystem;
        this.progressionSystem = progressionSystem;
        
        // Create battle and player managers
        this.battleManager = new BattleManager(this);
        this.playerManager = new PlayerManager(this);
        
        // Initialize game state
        this.resetGameState();
        
        // Initialize scene manager with battle scene container
        if (this.sceneManager) {
            await this.sceneManager.init(battleSceneContainer);
        }
        
        // Set up event listeners for UI elements
        this.setupEventListeners();
        
        // Initialize UI fully before updating any player elements
        if (this.uiManager && typeof this.uiManager.init === 'function') {
            await this.uiManager.init();
        }
        
        // Now update player progress display after UI is initialized
        this.updatePlayerUI();
        
        console.log('Game State Manager initialized');
    }
    
    /**
     * Reset game state to default values
     */
    resetGameState() {
        console.log('Resetting game state');
        
        // Reset game state
        this.gameState = {
            currentScreen: 'main-menu',
            currentTurn: 'player',
            isProcessingTurn: false,
            turnCount: 1,
            spellsCast: 0,
            battleResult: null,
            player: {
                health: 100,
                maxHealth: 100,
                mana: 100,
                maxMana: 100,
                manaRegen: 10,
                spells: [],
                prevHealth: 100 // Store previous health for animation effects
            },
            opponent: {
                health: 100,
                maxHealth: 100,
                mana: 100,
                maxMana: 100,
                manaRegen: 10,
                aiLevel: 1,
                difficulty: 'normal',
                spells: [],
                prevHealth: 100 // Store previous health for animation effects
            },
            battleLog: []
        };
        
        // Update game state reference in UI element manager
        if (this.uiElementManager) {
            this.uiElementManager.gameState = this.gameState;
        }
        
        // Immediately update the UI with the reset state
        if (this.uiManager) {
            this.updatePlayerUI();
        }
    }

    /**
     * Start a new game
     */
    startNewGame() {
        console.log('Starting new game...');
        
        // Reset game state
        this.resetGameState();
        
        // Reset player progress in spell system
        this.spellSystem.resetPlayerProgress();
        
        // Initialize player spells
        this.spellSystem.initializeSpellHand();
        
        // Initialize opponent spells based on difficulty
        this.initializeOpponentSpells();
        
        // Start the battle directly
        this.startBattle();
        
        // Notify state change
        if (this.onStateChange) {
            this.onStateChange('new-game');
        }
    }

    /**
     * Continue a saved game
     */
    continueGame() {
        // Load saved game state
        const savedState = localStorage.getItem('wizardChoiceGameState');
        if (savedState) {
            try {
                this.gameState = JSON.parse(savedState);
                
                // Load player spells
                this.spellSystem.loadPlayerProgress();
                
                // Initialize opponent spells based on saved difficulty
                this.initializeOpponentSpells();
                
                // Start the battle
                this.startBattle();
                
                // Notify state change
                if (this.onStateChange) {
                    this.onStateChange('battle');
                }
            } catch (error) {
                console.error('Error loading saved game:', error);
                // If error, start a new game
                this.startNewGame();
            }
        } else {
            // No saved game found, start a new game
            this.startNewGame();
        }
    }

    /**
     * Save current game state
     */
    saveGameState() {
        try {
            localStorage.setItem('wizardChoiceGameState', JSON.stringify(this.gameState));
            console.log('Game state saved');
        } catch (error) {
            console.error('Error saving game state:', error);
        }
    }

    /**
     * Initialize opponent spells based on difficulty level
     */
    initializeOpponentSpells() {
        // Clear existing spells
        this.gameState.opponent.spells = [];
        
        // Base spells for all opponents
        const baseSpells = ['fireball', 'waterBlast', 'stoneSkin', 'windGust', 'arcaneMissile'];
        
        // Add base spells
        this.gameState.opponent.spells = [...baseSpells];
        
        // Add more powerful spells based on AI level
        if (this.gameState.opponent.aiLevel >= 2) {
          this.gameState.opponent.spells.push('inferno', 'iceSpike'); // Corrected from fireWall, iceSpear
        }
        
        if (this.gameState.opponent.aiLevel >= 3) {
          this.gameState.opponent.spells.push('earthquake', 'thunderstorm'); // Corrected case
        }
        
        if (this.gameState.opponent.aiLevel >= 4) {
          this.gameState.opponent.spells.push('arcaneSurge', 'healingRain'); // Corrected from arcaneBarrage, healingWave
        }
        
        if (this.gameState.opponent.aiLevel >= 5) {
          this.gameState.opponent.spells.push('phoenixFlame', 'tidalWave'); // Corrected from meteorShower, timeWarp
        }
        
        console.log(`Initialized opponent with ${this.gameState.opponent.spells.length} spells at AI level ${this.gameState.opponent.aiLevel}`);
    }

    /**
     * Connect UI elements to their event handlers
     */
    setupEventListeners() {
        // Connect main menu buttons
        const startGameBtn = document.getElementById('start-game-btn');
        const continueGameBtn = document.getElementById('continue-game-btn');
        const settingsBtn = document.getElementById('settings-btn');
        
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.startNewGame());
        }
        
        if (continueGameBtn) {
            continueGameBtn.addEventListener('click', () => this.continueGame());
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.uiManager.showScreen('settings-screen');
            });
        }
        
        // Connect settings screen buttons
        const closeSettingsBtn = document.getElementById('close-settings-btn');
        console.log('closeSettingsBtn element found:', closeSettingsBtn);
        if (closeSettingsBtn) {
            // Remove any existing event listeners to prevent duplicates
            const newCloseBtn = closeSettingsBtn.cloneNode(true);
            closeSettingsBtn.parentNode.replaceChild(newCloseBtn, closeSettingsBtn);
            
            // Add the event listener to the new button
            newCloseBtn.addEventListener('click', () => {
                console.log('Close settings button clicked');
                if (this.uiManager) {
                    // Use the direct method to return to main menu
                    this.uiManager.returnToMainMenu();
                } else {
                    console.error('UI Manager not available');
                }
            });
        } else {
            console.warn('Close settings button not found during connection');
            
            // Try again after a short delay to ensure DOM is fully loaded
            setTimeout(() => {
                const retryCloseBtn = document.getElementById('close-settings-btn');
                if (retryCloseBtn) {
                    console.log('Found close settings button on retry');
                    retryCloseBtn.addEventListener('click', () => {
                        console.log('Close settings button clicked (retry)');
                        if (this.uiManager) {
                            // Use the direct method to return to main menu
                            this.uiManager.returnToMainMenu();
                        }
                    });
                }
            }, 500);
        }
        
        // Connect game-over screen buttons
        const playAgainBtn = document.getElementById('play-again-btn');
        const returnToMenuBtnOver = document.getElementById('return-to-menu-btn-over');
        
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => this.playAgain());
        }
        
        if (returnToMenuBtnOver) {
            returnToMenuBtnOver.addEventListener('click', () => {
                this.uiManager.returnToMainMenu();
            });
        }
        
        // Connect results screen buttons
        const continueBtn = document.getElementById('continue-btn');
        const returnToMenuBtnResults = document.getElementById('return-to-menu-btn-results');
        
        if (continueBtn) {
            continueBtn.addEventListener('click', () => this.playAgain());
        }
        
        if (returnToMenuBtnResults) {
            returnToMenuBtnResults.addEventListener('click', () => {
                this.uiManager.returnToMainMenu();
            });
        }
        
        // Connect return-to-menu button in battle screen
        const returnToMenuBtn = document.getElementById('return-to-menu-btn');
        if (returnToMenuBtn) {
            returnToMenuBtn.addEventListener('click', () => {
                this.saveGameState();
                this.uiManager.showScreen('main-menu');
            });
        }
        
        console.log('UI elements connected');
    }

    /**
     * Start a battle
     */
    startBattle() {
        console.log('Starting battle...');
        
        // First show the spell selection screen
        this.playerManager.showSpellSelectionScreen();
    }
    
    /**
     * Initialize battle state
     * @param {Object} opponent - The opponent object
     */
    initializeBattle(opponent) {
        console.log('Initializing battle with opponent:', opponent);
        
        // Reset battle state
        this.gameState.isPlaying = true;
        this.gameState.currentTurn = 1; // Start at turn 1 instead of 0
        this.gameState.isProcessingTurn = false;
        this.gameState.isBattleOver = false;
        this.gameState.battleLog = [`Battle started against ${opponent.name || 'Enemy Wizard'}`];
        
        // Reset player state for battle
        this.gameState.player.health = this.gameState.player.maxHealth;
        this.gameState.player.mana = this.gameState.player.maxMana;
        this.gameState.player.prevHealth = this.gameState.player.health;
        
        // Set up opponent for battle
        this.gameState.opponent = opponent;
        this.gameState.opponent.prevHealth = opponent.health;
        
        // Do NOT initialize spell hand here - it overrides the player's selected spells
        // REMOVED: this.spellSystem.initializeSpellHand();
        
        // Log current spell hand to verify it contains the selected spells
        console.log('Current player spell hand during battle initialization:', 
            this.spellSystem.getPlayerSpellHand().map(spell => spell.name));
        
        // Initialize opponent's spell hand if not already done
        if (!this.gameState.opponent.currentSpellHand) {
            this.gameState.opponent.currentSpellHand = [];
            
            // Ensure opponent has spells
            if (!this.gameState.opponent.spells || !Array.isArray(this.gameState.opponent.spells) || this.gameState.opponent.spells.length === 0) {
                console.warn('Opponent has no spells defined, adding default spells');
                this.gameState.opponent.spells = ['fireball', 'waterBlast', 'stoneSkin'];
            }
            
            // Initialize opponent's available spells for battle
            this.gameState.opponent.availableSpellsForBattle = [...this.gameState.opponent.spells];
            
            // Shuffle opponent's deck (Fisher-Yates algorithm)
            for (let i = this.gameState.opponent.availableSpellsForBattle.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.gameState.opponent.availableSpellsForBattle[i], this.gameState.opponent.availableSpellsForBattle[j]] =
                [this.gameState.opponent.availableSpellsForBattle[j], this.gameState.opponent.availableSpellsForBattle[i]];
            }
            
            // Draw initial hand for opponent
            for (let i = 0; i < 3; i++) {
                this.battleManager.drawOpponentSpell();
            }
        }
        
        // Update battle UI
        this.updateBattleUI();
    }
    
    /**
     * Initialize battle after spell selection
     */
    startBattleWithSelectedSpells() {
        console.log('Starting battle with selected spells');
        console.log('Current player spells:', this.spellSystem.playerSpellHand);
        
        try {
            // Reset spell tracking for the new battle
            this.spellSystem.resetSpellTracking();
            
            // Inform the progression system of a new duel
            if (this.progressionSystem) {
                console.log('Starting new duel in progression system');
                this.progressionSystem.startNewDuel();
            } else {
                console.warn('ProgressionSystem not initialized');
            }
            
            console.log('Transitioning to game-ui screen');
            
            // Create opponent if needed
            if (!this.gameState.opponent) {
                console.log('No opponent exists, creating one');
                const opponent = this.createOpponent();
                
                // Initialize battle with the created opponent
                this.initializeBattle(opponent);
            } else {
                console.log('Using existing opponent');
                this.initializeBattle(this.gameState.opponent);
            }
            
            // CRITICAL FIX: Ensuring UI elements exist BEFORE showing the screen
            if (this.uiElementManager) {
                console.log('Pre-creating all UI elements before showing game screen');
                
                // Create all necessary overlay elements first
                this.uiElementManager.createExperienceBarElements();
                
                // Force updatePlayerOverlay and updateOpponentOverlay to run once before the screen is shown
                if (typeof this.uiElementManager.updatePlayerOverlay === 'function') {
                    this.uiElementManager.updatePlayerOverlay(this.gameState.player);
                }
                
                if (typeof this.uiElementManager.updateOpponentOverlay === 'function') {
                    this.uiElementManager.updateOpponentOverlay(this.gameState.opponent);
                }
            }
            
            // PRE-CREATE spell buttons so they're ready when the screen appears
            this.preCreateSpellButtons();
            
            // THEN make sure the game-ui has the scene-integrated class
            const gameUI = document.getElementById('game-ui');
            if (gameUI) {
                gameUI.classList.add('scene-integrated');
            }
            
            // ONLY NOW show the game UI after elements are created
            this.uiManager.showScreen('game-ui');
            
            // Hide old UI elements that are now replaced by overlays
            const oldPlayerInfo = document.getElementById('player-info');
            const oldOpponentInfo = document.getElementById('opponent-info');
            const oldBattleInfo = document.getElementById('battle-info');
            
            if (oldPlayerInfo) oldPlayerInfo.style.display = 'none';
            if (oldOpponentInfo) oldOpponentInfo.style.display = 'none';
            if (oldBattleInfo) oldBattleInfo.style.display = 'none';
            
            // Force immediate UI update instead of waiting
            this.updateBattleUI();
            
            // Set up the battle scene
            if (this.sceneManager) {
                console.log('Setting up battle scene with player and opponent');
                // Get the battle-scene element for proper initialization
                const battleSceneElement = document.getElementById('battle-scene');
                if (battleSceneElement) {
                    // Make sure battle container is properly sized
                    const battleContainer = document.getElementById('battle-container');
                    if (battleContainer) {
                        battleContainer.style.height = '66vh';
                    }
                    
                    // Initialize the scene with the container
                    this.sceneManager.container = battleSceneElement;
                    this.sceneManager.resizeRenderer();
                }
                this.sceneManager.setupBattleScene(this.gameState.player, this.gameState.opponent);
            }
            
            // Also do a slightly delayed update to ensure everything is loaded
            setTimeout(() => {
                // Check if spell buttons are showing, if not, recreate them
                this.checkAndRecreateSpellButtons();
                
                this.updateBattleUI();
                console.log('Battle initialization completed successfully');
                
                // Force update of overlay stats
                if (this.battleManager) {
                    this.battleManager.updatePlayerAndOpponentUI();
                }
            }, 200);
        } catch (error) {
            console.error('Error initializing battle:', error);
        }
    }
    
    /**
     * Pre-create spell buttons for the battle UI
     * @private
     */
    preCreateSpellButtons() {
        if (!this.spellSystem || !this.spellSystem.playerSpellHand) {
            console.error('Cannot create spell buttons: spell system or player spell hand is missing');
            return;
        }
        
        console.log('Pre-creating spell buttons');
        
        const playerSpellHand = this.spellSystem.getPlayerSpellHand();
        if (!playerSpellHand || playerSpellHand.length === 0) {
            console.error('Player spell hand is empty or undefined');
            return;
        }
        
        // Find or create spell container
        let spellContainer = document.querySelector('.spell-container') || 
                             document.getElementById('player-spells');
        
        if (!spellContainer) {
            console.log('Creating missing spell container');
            spellContainer = document.createElement('div');
            spellContainer.className = 'spell-container';
            spellContainer.id = 'player-spells';
            
            // Try to find a good place to add it
            const battleContainer = document.getElementById('battle-container');
            const gameUI = document.getElementById('game-ui');
            
            if (battleContainer) {
                battleContainer.appendChild(spellContainer);
            } else if (gameUI) {
                gameUI.appendChild(spellContainer);
                } else {
                document.body.appendChild(spellContainer);
            }
        }
        
        // Now create spell buttons
        console.log('Creating spell buttons for:', playerSpellHand);
        
        // Clear existing content
        spellContainer.innerHTML = '';
        
        // Apply critical styling
        spellContainer.style.display = 'flex';
        spellContainer.style.flexDirection = 'row';
        spellContainer.style.justifyContent = 'center';
        spellContainer.style.flexWrap = 'wrap';
        spellContainer.style.gap = '10px';
        spellContainer.style.marginTop = '10px';
        spellContainer.style.padding = '10px';
        spellContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
        spellContainer.style.borderRadius = '10px';
        spellContainer.style.minHeight = '100px';
        spellContainer.style.zIndex = '1000';
        
        // Create a spell button for each spell
        playerSpellHand.forEach((spell, index) => {
            const spellButton = document.createElement('button');
            spellButton.className = 'spell-button';
            spellButton.setAttribute('data-spell-id', spell.id);
            
            // Add styling to make the buttons visible
            spellButton.style.minWidth = '120px';
            spellButton.style.padding = '8px';
            spellButton.style.margin = '4px';
            spellButton.style.backgroundColor = '#333';
            spellButton.style.color = 'white';
            spellButton.style.border = '2px solid #555';
            spellButton.style.borderRadius = '8px';
            spellButton.style.cursor = 'pointer';
            
            // Set content
            spellButton.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 4px;">${spell.name}</div>
                <div style="font-size: 12px; color: #aaa;">Mana: ${spell.manaCost}</div>
                <div style="font-size: 12px; color: #aaa;">
                    ${spell.damage ? `Dmg: ${spell.damage}` : ''}
                    ${spell.healing ? `Heal: ${spell.healing}` : ''}
                </div>
            `;
            
            // Add click handler
            spellButton.addEventListener('click', () => {
                console.log(`Spell button clicked: ${spell.name} (${spell.id})`);
                if (this.playerManager) {
                    this.playerManager.playerCastSpell(spell.id);
                }
            });
            
            // Add to container
            spellContainer.appendChild(spellButton);
        });
        
        // Verify buttons were created
        const createdButtons = spellContainer.querySelectorAll('.spell-button');
        console.log(`Created ${createdButtons.length} spell buttons`);
    }

    /**
     * Check if spell buttons exist and recreate them if needed
     * @private
     */
    checkAndRecreateSpellButtons() {
        const spellContainer = document.querySelector('.spell-container') || 
                              document.getElementById('player-spells');
        
        if (!spellContainer || spellContainer.children.length === 0) {
            console.log('Spell buttons missing, recreating them');
            this.preCreateSpellButtons();
        } else {
            console.log(`Found ${spellContainer.children.length} spell buttons, no need to recreate`);
        }
    }
    
    /**
     * Update the battle UI
     */
    updateBattleUI() {
        console.log('Updating battle UI');
        
        try {
            // Fall back to BattleManager if available
            if (this.battleManager && typeof this.battleManager.updatePlayerAndOpponentUI === 'function') {
                console.log('Calling battleManager.updatePlayerAndOpponentUI');
                this.battleManager.updatePlayerAndOpponentUI();
            }
            
            // Or update directly via UIElementManager if necessary
            else if (this.uiElementManager) {
                console.log('Directly calling uiElementManager update methods');
                
                if (typeof this.uiElementManager.updatePlayerOverlay === 'function') {
                    this.uiElementManager.updatePlayerOverlay(this.gameState.player);
                }
                
                if (typeof this.uiElementManager.updateOpponentOverlay === 'function') {
                    this.uiElementManager.updateOpponentOverlay(this.gameState.opponent);
                }
            }
            
            // Update battle log if available
            if (this.uiElementManager && typeof this.uiElementManager.updateBattleLog === 'function' &&
                this.gameState.battleLog && this.gameState.battleLog.length > 0) {
                this.uiElementManager.updateBattleLog(this.gameState.battleLog);
            } else if (this.gameState.battleLog && this.gameState.battleLog.length > 0) {
                console.log('Manually updating battle log');
                
                const battleLogContainer = document.querySelector('.battle-log');
                if (battleLogContainer) {
                    // Clear previous content
                    battleLogContainer.innerHTML = '';
                    
                    // Add each message
                    this.gameState.battleLog.forEach(message => {
                        const messageElement = document.createElement('div');
                        messageElement.className = 'log-message';
                        messageElement.textContent = message;
                        battleLogContainer.appendChild(messageElement);
                    });
                    
                    // Scroll to bottom
                    battleLogContainer.scrollTop = battleLogContainer.scrollHeight;
            }
        }
        
        // Update spell buttons based on available mana
            this.updateSpellButtonStates();
            
            // Update turn indicator
            const turnElement = document.querySelector('.turn-indicator');
            if (turnElement) {
                turnElement.textContent = `Turn ${this.gameState.currentTurn || 1}`;
            }
        } catch (error) {
            console.error('Error updating battle UI:', error);
        }
    }
    
    /**
     * Update health bars in scene (if scene manager is available)
     */
    updateHealthBars() {
        if (this.sceneManager) {
            try {
                // Try to update health using playSpellAnimation method which we know exists
                if (this.gameState.player.health < this.gameState.player.prevHealth) {
                    // Player took damage
                    this.sceneManager.playSpellAnimation('opponent', 'fire');
                } else if (this.gameState.player.health > this.gameState.player.prevHealth) {
                    // Player was healed
                    this.sceneManager.playSpellAnimation('player', 'water');
                }
                
                if (this.gameState.opponent.health < this.gameState.opponent.prevHealth) {
                    // Opponent took damage
                    this.sceneManager.playSpellAnimation('player', 'fire');
                } else if (this.gameState.opponent.health > this.gameState.opponent.prevHealth) {
                    // Opponent was healed
                    this.sceneManager.playSpellAnimation('opponent', 'water');
                }
                
                // Update previous health values
                this.gameState.player.prevHealth = this.gameState.player.health;
                this.gameState.opponent.prevHealth = this.gameState.opponent.health;
            } catch (error) {
                console.log('Error updating scene health:', error);
            }
        }
    }
    
    /**
     * Update spell button states based on available mana
     */
    updateSpellButtonStates() {
        const spellButtons = document.querySelectorAll('.spell-button');
        
        spellButtons.forEach(button => {
            const spellId = button.getAttribute('data-spell-id');
            if (spellId) {
                const spell = this.spellSystem.getSpellById(spellId);
                if (spell) {
                    // Disable button if not enough mana
                    const disabled = this.gameState.player.mana < spell.manaCost || this.gameState.isProcessingTurn;
                    button.classList.toggle('disabled', disabled);
                }
            }
        });
    }

    /**
     * Update the player UI
     */
    updatePlayerUI() {
        // Debug what's happening with player data
        console.log('DEBUG: updatePlayerUI called', this.gameState?.player);
        
        // Get the latest player progress data from the spell system
        if (this.spellSystem) {
            const playerProgress = this.spellSystem.getPlayerProgress();
            console.log('DEBUG: Player progress from spell system:', playerProgress);
            
            // Sync player level and experience with the player progress
            this.gameState.player.level = playerProgress.level || 1;
            this.gameState.player.experience = playerProgress.experience || 0;
            
            // Log current player stats for debugging
            console.log('DEBUG: Updated player UI with:', this.gameState.player);
        } else {
            console.warn('DEBUG: No spell system available, using default player values');
        }
        
        // Make sure player has level and experience defined (but don't override with debug values)
        if (!this.gameState.player.level) {
            console.log('DEBUG: Setting default player level to 1');
            this.gameState.player.level = 1;
        }
        
        // Update the player info on screen using the most appropriate method available
        try {
            // First try UIManager if available
            if (this.uiManager && typeof this.uiManager.updatePlayerInfo === 'function') {
                console.log('DEBUG: Calling uiManager.updatePlayerInfo with:', this.gameState.player);
            this.uiManager.updatePlayerInfo(this.gameState.player);
                return;
            }
            
            // Next try UIElementManager if available
            if (this.uiElementManager && typeof this.uiElementManager.updatePlayerOverlay === 'function') {
                console.log('DEBUG: Calling uiElementManager.updatePlayerOverlay with:', this.gameState.player);
                this.uiElementManager.updatePlayerOverlay(this.gameState.player);
                return;
            }
            
            // Finally, fall back to PlayerManager as a last resort
            if (this.playerManager && typeof this.playerManager.updatePlayerProgressDisplay === 'function') {
                console.log('DEBUG: Calling playerManager.updatePlayerProgressDisplay');
                this.playerManager.updatePlayerProgressDisplay();
                return;
            }
            
            console.warn('DEBUG: No suitable UI update method found!');
        } catch (error) {
            console.error('Error updating player UI:', error);
        }
    }

    /**
     * Start a new battle with current player progress
     */
    playAgain() {
        console.log('Starting a new battle with current player progress...');
        
        // Reset battle-specific state while preserving player progress
        this.gameState = {
            currentScreen: 'game-ui',
            currentTurn: 'player',
            isProcessingTurn: false,
            turnCount: 1,
            spellsCast: 0,
            battleResult: null,
            player: {
                health: 100,
                maxHealth: 100,
                mana: 100,
                maxMana: 100,
                manaRegen: 10,
                // Preserve player level and experience
                level: this.progressionSystem.getPlayerProgress().level,
                experience: this.progressionSystem.getPlayerProgress().experience,
                prevHealth: 100
            },
            opponent: {
                health: 100,
                maxHealth: 100,
                mana: 100,
                maxMana: 100,
                manaRegen: 10,
                // Scale opponent difficulty based on player level
                aiLevel: Math.min(5, Math.max(1, Math.floor(this.progressionSystem.getPlayerProgress().level / 2))),
                spells: [],
                prevHealth: 100
            },
            battleLog: []
        };
        
        // Initialize opponent spells based on updated AI level
        this.initializeOpponentSpells();
        
        // Start the battle
        this.startBattle();
        
        // Update UI to show player progress
        this.playerManager.updatePlayerProgressDisplay();
        
        // Update player UI
        this.updatePlayerUI();
        
        // Notify state change
        if (this.onStateChange) {
            this.onStateChange('battle');
        }
    }
    
    /**
     * Get the current game state
     * @returns {Object} The current game state
     */
    getGameState() {
        if (!this.gameState) {
            console.warn('Game state not initialized, providing default state');
            this.gameState = {
                currentScreen: 'main-menu',
                currentTurn: 'player',
                isProcessingTurn: false,
                turnCount: 1,
                spellsCast: 0,
                battleResult: null,
                player: {
                    health: 100,
                    maxHealth: 100,
                    mana: 100,
                    maxMana: 100,
                    manaRegen: 10,
                    spells: [],
                    prevHealth: 100
                },
                opponent: {
                    health: 100,
                    maxHealth: 100,
                    mana: 100,
                    maxMana: 100,
                    manaRegen: 10,
                    aiLevel: 1,
                    difficulty: 'normal',
                    spells: [],
                    prevHealth: 100
                },
                battleLog: []
            };
        }
        return this.gameState;
    }
}

export default GameStateManager;
