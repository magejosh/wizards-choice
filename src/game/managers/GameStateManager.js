// GameStateManager.js - Handles overall game state

import BattleManager from './BattleManager.js';
import PlayerManager from './PlayerManager.js';

export class GameStateManager {
    constructor() {
        this.uiManager = null;
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
    
    // Initialize the game manager
    async init(uiManager, sceneManager, spellSystem, progressionSystem, battleSceneContainer) {
        console.log('Initializing Game State Manager...');
        
        // Store references to other managers
        this.uiManager = uiManager;
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
        
        // Update player progress display
        this.playerManager.updatePlayerProgressDisplay();
        
        console.log('Game State Manager initialized');
    }
    
    // Reset game state to default values
    resetGameState() {
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
    }

    // Start a new game
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

    // Continue a saved game
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

    // Save current game state
    saveGameState() {
        try {
            localStorage.setItem('wizardChoiceGameState', JSON.stringify(this.gameState));
            console.log('Game state saved');
        } catch (error) {
            console.error('Error saving game state:', error);
        }
    }

    // Initialize opponent spells based on difficulty level
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

    // Connect UI elements to their event handlers
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

    // Start a battle
    startBattle() {
        console.log('Starting battle...');
        
        // First show the spell selection screen
        this.playerManager.showSpellSelectionScreen();
    }
    
    // Initialize battle state
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
        
        // Initialize spell hands
        this.spellSystem.initializeSpellHand();
        
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
    
    // Initialize battle after spell selection
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
            
            // Set up the battle scene
            if (this.sceneManager) {
                console.log('Setting up battle scene with player and opponent');
                this.sceneManager.setupBattleScene(this.gameState.player, this.gameState.opponent);
            }
            this.uiManager.showScreen('game-ui');
            
            console.log('Battle initialization completed successfully');
        } catch (error) {
            console.error('Error initializing battle:', error);
        }
    }
    
    // Update battle UI elements
    updateBattleUI() {
        console.log('Updating battle UI');
        
        // Update player and opponent info
        this.uiManager.updatePlayerInfo(this.gameState.player);
        this.uiManager.updateOpponentInfo(this.gameState.opponent);
        
        // Update battle info (turn counter, etc.)
        if (typeof this.uiManager.updateBattleInfo === 'function') {
            // Pass the gameState to updateBattleInfo
            this.uiManager.updateBattleInfo(this.gameState);
        }
        
        // Update battle log
        this.uiManager.updateBattleLog(this.gameState.battleLog);
        
        // Render the player's spell hand in the battle UI
        const playerSpellHand = this.spellSystem.getPlayerSpellHand();
        console.log('Displaying player spell hand:', playerSpellHand);
        this.uiManager.displaySpellChoices(playerSpellHand, (spellIndex) => {
            const spell = playerSpellHand[spellIndex];
            if (spell) {
                console.log(`Player selected spell: ${spell.name} (${spell.id})`);
                this.playerManager.playerCastSpell(spell.id);
            }
        });
        
        // Update spell buttons based on available mana
        this.updateSpellButtonStates();
        
        // Update health bars in scene (if scene manager is available)
        this.updateHealthBars();
    }
    
    // Update health bars in scene (if scene manager is available)
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
    
    // Update spell button states based on available mana
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

    // Start a new battle with current player progress
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
        
        // Notify state change
        if (this.onStateChange) {
            this.onStateChange('battle');
        }
    }
    
    // Get the current game state
    getGameState() {
        return this.gameState;
    }
}

export default GameStateManager;
