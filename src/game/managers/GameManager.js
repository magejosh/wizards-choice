// Game Manager class - handles overall game state and logic

class GameManager {
    constructor() {
        this.uiManager = null;
        this.sceneManager = null;
        this.spellSystem = null;
        this.progressionSystem = null;
        this.audioManager = null;
        this.onStateChange = null;
        
        this.gameState = {
            isPlaying: false,
            currentTurn: 0,
            player: {
                health: 100,
                maxHealth: 100,
                mana: 100,
                maxMana: 100,
                manaRegen: 15,
                spells: []
            },
            opponent: {
                health: 100,
                maxHealth: 100,
                mana: 100,
                maxMana: 100,
                manaRegen: 15,
                spells: [],
                difficulty: 'normal',
                aiLevel: 1
            },
            battleLog: []
        };
    }
    
    // Initialize the game manager
    async init(uiManager, sceneManager, spellSystem, progressionSystem, battleSceneContainer) {
        console.log('Initializing Game Manager...');
        
        // Store references to other managers
        this.uiManager = uiManager;
        this.sceneManager = sceneManager;
        this.spellSystem = spellSystem;
        this.progressionSystem = progressionSystem;
        
        // Initialize game state
        this.resetGameState();
        
        // Initialize scene manager with battle scene container
        if (this.sceneManager) {
            await this.sceneManager.init(battleSceneContainer);
        }
        
        // Set up event listeners for UI elements
        this.setupEventListeners();
        
        console.log('Game Manager initialized');
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
                manaRegen: 20,
                level: 1,
                experience: 0
            },
            opponent: {
                health: 100,
                maxHealth: 100,
                mana: 100,
                maxMana: 100,
                manaRegen: 20,
                aiLevel: 2,
                spells: []
            },
            battleLog: []
        };
    }

    // Start a new game
    startNewGame() {
        // Reset game state
        this.resetGameState();
        
        // Initialize player spells
        this.spellSystem.initPlayerSpells();
        
        // Initialize opponent spells based on difficulty
        this.initializeOpponentSpells();
        
        // Start the first battle
        this.startBattle();
        
        // Notify state change
        if (this.onStateChange) {
            this.onStateChange('battle');
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
          this.gameState.opponent.spells.push('fireWall', 'iceSpear');
        }
        
        if (this.gameState.opponent.aiLevel >= 3) {
          this.gameState.opponent.spells.push('earthQuake', 'thunderStorm');
        }
        
        if (this.gameState.opponent.aiLevel >= 4) {
          this.gameState.opponent.spells.push('arcaneBarrage', 'healingWave');
        }
        
        if (this.gameState.opponent.aiLevel >= 5) {
          this.gameState.opponent.spells.push('meteorShower', 'timeWarp');
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
            playAgainBtn.addEventListener('click', () => this.startNewGame());
        }
        
        if (returnToMenuBtnOver) {
            returnToMenuBtnOver.addEventListener('click', () => {
                this.uiManager.showScreen('main-menu');
            });
        }
        
        // Connect results screen buttons
        const continueBtn = document.getElementById('continue-btn');
        const returnToMenuBtnResults = document.getElementById('return-to-menu-btn-results');
        
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                // Continue to next battle or level
                this.startBattle();
            });
        }
        
        if (returnToMenuBtnResults) {
            returnToMenuBtnResults.addEventListener('click', () => {
                this.uiManager.showScreen('main-menu');
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
    
    // Handle player casting a spell
    playerCastSpell(spellId) {
        if (this.gameState.isProcessingTurn) {
            console.log('Still processing previous turn, please wait...');
            return;
        }
        
        console.log(`Player casting spell: ${spellId}`);
        
        // Get spell details from spell system
        const spell = this.spellSystem.getSpellById(spellId);
        if (!spell) {
            console.error(`Spell ${spellId} not found`);
            return;
        }
        
        // Check if player has enough mana
        if (this.gameState.player.mana < spell.manaCost) {
            console.log(`Not enough mana to cast ${spell.name}`);
            return;
        }
        
        // Set processing flag
        this.gameState.isProcessingTurn = true;
        
        // Apply spell effects
        this.applySpellEffects(spell, 'player', 'opponent');
        
        // After player's turn, process opponent's turn
        setTimeout(() => {
            this.processOpponentTurn();
        }, 1500);
    }
    
    // Apply spell effects from caster to target
    applySpellEffects(spell, casterType, targetType) {
        const caster = this.gameState[casterType];
        const target = this.gameState[targetType];
        
        // Deduct mana cost
        caster.mana -= spell.manaCost;
        
        // Apply damage if spell has damage
        if (spell.damage) {
            target.health -= spell.damage;
            console.log(`${casterType} cast ${spell.name} for ${spell.damage} damage`);
            
            // Update battle log
            this.gameState.battleLog.push(`${casterType} cast ${spell.name} for ${spell.damage} damage`);
        }
        
        // Apply healing if spell has healing
        if (spell.healing) {
            caster.health += spell.healing;
            if (caster.health > caster.maxHealth) {
                caster.health = caster.maxHealth;
            }
            console.log(`${casterType} healed for ${spell.healing}`);
            
            // Update battle log
            this.gameState.battleLog.push(`${casterType} healed for ${spell.healing}`);
        }
        
        // Check for battle end
        this.checkBattleEnd();
        
        // Update UI
        this.updateBattleUI();
    }
    
    // Process opponent's turn
    processOpponentTurn() {
        // Simple AI: choose a random spell the opponent can cast
        const availableSpells = this.gameState.opponent.spells.filter(spellId => {
            const spell = this.spellSystem.getSpellById(spellId);
            return spell && this.gameState.opponent.mana >= spell.manaCost;
        });
        
        if (availableSpells.length > 0) {
            // Choose a random spell
            const randomSpellId = availableSpells[Math.floor(Math.random() * availableSpells.length)];
            const spell = this.spellSystem.getSpellById(randomSpellId);
            
            // Apply spell effects
            this.applySpellEffects(spell, 'opponent', 'player');
        } else {
            console.log('Opponent has no available spells to cast');
            this.gameState.battleLog.push('Opponent skips their turn');
        }
        
        // Process end of turn
        this.processTurnEnd();
    }
    
    // Process end of turn
    processTurnEnd() {
        // Increment turn counter
        this.gameState.turnCount++;
        
        // Regenerate mana for both player and opponent
        this.gameState.player.mana += this.gameState.player.manaRegen;
        if (this.gameState.player.mana > this.gameState.player.maxMana) {
            this.gameState.player.mana = this.gameState.player.maxMana;
        }
        
        this.gameState.opponent.mana += this.gameState.opponent.manaRegen;
        if (this.gameState.opponent.mana > this.gameState.opponent.maxMana) {
            this.gameState.opponent.mana = this.gameState.opponent.maxMana;
        }
        
        // Clear processing flag
        this.gameState.isProcessingTurn = false;
        
        // Update UI
        this.updateBattleUI();
        
        // Update spell button states
        this.updateSpellButtonStates();
    }
    
    // Check if battle has ended
    checkBattleEnd() {
        if (this.gameState.player.health <= 0) {
            // Player lost
            this.gameState.battleResult = 'defeat';
            this.endBattle();
        } else if (this.gameState.opponent.health <= 0) {
            // Player won
            this.gameState.battleResult = 'victory';
            this.endBattle();
        }
    }
    
    // End the battle and process results
    endBattle() {
        console.log(`Battle ended with result: ${this.gameState.battleResult}`);
        
        // Process battle results with progression system
        if (this.progressionSystem) {
            this.progressionSystem.processBattleResult(this.gameState.battleResult);
        }
        
        // Show appropriate screen based on result
        this.uiManager.showScreen('game-over');
        
        // Update the result message
        const resultMessage = document.getElementById('game-over-result');
        if (resultMessage) {
            resultMessage.textContent = this.gameState.battleResult === 'victory' 
                ? 'You won the battle!' 
                : 'You were defeated!';
        }
        
        // Save game state
        this.saveGameState();
    }
    
    // Start a battle
    startBattle() {
        console.log('Starting battle...');
        
        // Show battle UI
        this.uiManager.showScreen('game-ui');
        
        // Set up battle scene
        this.sceneManager.setupBattleScene(this.gameState.player, this.gameState.opponent);
        
        // Update UI with initial values
        this.updateBattleUI();
        
        // Set a small delay to ensure DOM is updated before resizing
        setTimeout(() => {
            // Force a resize to ensure proper rendering
            if (this.sceneManager && typeof this.sceneManager.resizeRenderer === 'function') {
                this.sceneManager.resizeRenderer();
                console.log('Forced renderer resize after battle start');
            }
        }, 100);
        
        console.log('Battle started');
    }
    
    // Update battle UI elements
    updateBattleUI() {
        // Update health and mana displays
        const playerHealthEl = document.getElementById('player-health');
        const playerManaEl = document.getElementById('player-mana');
        const opponentHealthEl = document.getElementById('opponent-health');
        const opponentManaEl = document.getElementById('opponent-mana');
        
        if (playerHealthEl) {
            playerHealthEl.textContent = `${this.gameState.player.health}/${this.gameState.player.maxHealth}`;
            playerHealthEl.style.width = `${(this.gameState.player.health / this.gameState.player.maxHealth) * 100}%`;
        }
        
        if (playerManaEl) {
            playerManaEl.textContent = `${this.gameState.player.mana}/${this.gameState.player.maxMana}`;
            playerManaEl.style.width = `${(this.gameState.player.mana / this.gameState.player.maxMana) * 100}%`;
        }
        
        if (opponentHealthEl) {
            opponentHealthEl.textContent = `${this.gameState.opponent.health}/${this.gameState.opponent.maxHealth}`;
            opponentHealthEl.style.width = `${(this.gameState.opponent.health / this.gameState.opponent.maxHealth) * 100}%`;
        }
        
        if (opponentManaEl) {
            opponentManaEl.textContent = `${this.gameState.opponent.mana}/${this.gameState.opponent.maxMana}`;
            opponentManaEl.style.width = `${(this.gameState.opponent.mana / this.gameState.opponent.maxMana) * 100}%`;
        }
        
        // Update battle log
        const battleLogEl = document.getElementById('battle-log');
        if (battleLogEl && this.gameState.battleLog.length > 0) {
            battleLogEl.innerHTML = this.gameState.battleLog.map(log => `<div>${log}</div>`).join('');
            battleLogEl.scrollTop = battleLogEl.scrollHeight;
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
}

export default GameManager;
