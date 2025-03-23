// Game Manager class - handles overall game state and logic

export class GameManager {
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
                spells: [],
                prevHealth: 100 // Store previous health for animation effects
            },
            opponent: {
                health: 100,
                maxHealth: 100,
                mana: 100,
                maxMana: 100,
                manaRegen: 15,
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
        
        // Update player progress display
        this.updatePlayerProgressDisplay();
        
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
        this.spellSystem.initPlayerSpells();
        
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
    
    // Handle player casting a spell
    playerCastSpell(spellId) {
        console.log(`Player attempting to cast spell: ${spellId}`);
        
        // Check if we're already processing a turn
        if (this.gameState.isProcessingTurn) {
            console.log('Already processing a turn, ignoring spell cast request');
            return;
        }
        
        // Set flag to prevent multiple spell casts while processing
        this.gameState.isProcessingTurn = true;
        
        try {
            // Get the spell object
            const spell = this.spellSystem.getSpellById(spellId);
            if (!spell) {
                console.error(`Spell not found with ID: ${spellId}`);
                this.gameState.isProcessingTurn = false;
                return;
            }
            
            console.log(`Player casting ${spell.name} (Mana: ${spell.manaCost}, Damage: ${spell.damage || 0})`);
            
            // Check if player has enough mana
            if (this.gameState.player.mana < spell.manaCost) {
                console.log(`Not enough mana to cast ${spell.name}`);
                this.gameState.battleLog.push(`Not enough mana to cast ${spell.name}`);
                this.updateBattleUI();
                this.gameState.isProcessingTurn = false;
                return;
            }
            
            // Check if spell is in player's hand
            const playerHand = this.spellSystem.getPlayerSpellHand();
            const spellInHand = playerHand.find(handSpell => handSpell.id === spellId);
            
            if (!spellInHand) {
                console.error(`Spell ${spell.name} is not in player's hand`);
                this.gameState.battleLog.push(`Cannot cast ${spell.name} - not in your hand`);
                this.updateBattleUI();
                this.gameState.isProcessingTurn = false;
                return;
            }
            
            // Apply spell effects
            this.applySpellEffects(spell, 'player', 'opponent');
            
            // Remove spell from player's hand
            this.spellSystem.removeSpellFromHand(spellId);
            
            // Update battle log
            this.gameState.battleLog.push(`You cast ${spell.name}`);
            
            // Update UI to show changes immediately
            this.updateBattleUI();
            
            // Check if battle has ended after player's spell
            if (this.checkBattleEnd()) {
                // Battle ended, don't process opponent turn
                this.gameState.isProcessingTurn = false;
                return;
            }
            
            // Process opponent's turn after a delay
            console.log('Scheduling opponent turn');
            setTimeout(() => {
                this.processOpponentTurn();
            }, 1000);
            
        } catch (error) {
            console.error('Error in player cast spell:', error);
            this.gameState.battleLog.push('Error occurred while casting spell');
            this.updateBattleUI();
            this.gameState.isProcessingTurn = false;
        }
    }
    
    // Apply spell effects from caster to target
    applySpellEffects(spell, casterType, targetType) {
        console.log(`Applying spell effects for ${spell.name} from ${casterType} to ${targetType}`);
        
        // Get caster and target
        const caster = casterType === 'player' ? this.gameState.player : this.gameState.opponent;
        const target = targetType === 'player' ? this.gameState.player : this.gameState.opponent;
        
        // Store previous health values for animation effects
        caster.prevHealth = caster.health;
        target.prevHealth = target.health;
        
        // Calculate actual damage and healing based on spell properties
        const actualDamage = spell.damage || 0;
        const actualHealing = spell.healing || 0;
        
        // Deduct mana cost from caster
        caster.mana = Math.max(0, caster.mana - spell.manaCost);
        console.log(`${casterType} mana after casting: ${caster.mana}/${caster.maxMana}`);
        
        // Apply damage to target if spell has damage
        if (actualDamage > 0) {
            // Apply damage
            target.health = Math.max(0, target.health - actualDamage);
            console.log(`${targetType} health after damage: ${target.health}/${target.maxHealth}`);
            
            // Add to battle log
            this.gameState.battleLog.push(`${casterType === 'player' ? 'You' : 'Enemy'} cast ${spell.name} for ${actualDamage} damage`);
        }
        
        // Apply healing to caster if spell has healing
        if (actualHealing > 0) {
            // Apply healing
            caster.health = Math.min(caster.maxHealth, caster.health + actualHealing);
            console.log(`${casterType} health after healing: ${caster.health}/${caster.maxHealth}`);
            
            // Add to battle log
            this.gameState.battleLog.push(`${casterType === 'player' ? 'You' : 'Enemy'} healed for ${actualHealing} health`);
        }
        
        // Apply any other spell effects
        if (spell.effects && spell.effects.length > 0) {
            spell.effects.forEach(effect => {
                console.log(`Applying effect: ${effect.type}`);
                // Handle different effect types
                switch (effect.type) {
                    case 'manaRegen':
                        caster.mana = Math.min(caster.maxMana, caster.mana + effect.value);
                        this.gameState.battleLog.push(`${casterType === 'player' ? 'You' : 'Enemy'} regenerated ${effect.value} mana`);
                        break;
                    // Add more effect types as needed
                }
            });
        }
        
        // Track the spell usage for progression system if player cast it
        if (casterType === 'player') {
            this.spellSystem.trackSpellUsage(spell.id);
        }
        
        // Update health bars in the scene
        this.updateHealthBars();
        
        // Update spell button states based on available mana
        this.updateSpellButtonStates();
    }
    
    // Process opponent's turn
    processOpponentTurn() {
        console.log('Processing opponent turn');
        
        try {
            // Check if opponent has any spells
            if (!this.gameState.opponent.currentSpellHand || this.gameState.opponent.currentSpellHand.length === 0) {
                console.log('Opponent has no spells in hand, drawing new ones');
                
                // Initialize opponent spell hand if needed
                if (!this.gameState.opponent.currentSpellHand) {
                    this.gameState.opponent.currentSpellHand = [];
                }
                
                // Draw up to 3 spells
                while (this.gameState.opponent.currentSpellHand.length < 3) {
                    this.drawOpponentSpell();
                }
            }
            
            // Find a castable spell (one that the opponent has enough mana for)
            const castableSpells = this.gameState.opponent.currentSpellHand.filter(spellId => {
                const spell = this.spellSystem.getSpellById(spellId);
                return spell && spell.manaCost <= this.gameState.opponent.mana;
            });
            
            if (castableSpells.length > 0) {
                let chosenSpellId;
                
                // Choose spell based on AI level
                if (this.gameState.opponent.aiLevel === 1) {
                    // Level 1 AI: Choose random spell
                    const randomIndex = Math.floor(Math.random() * castableSpells.length);
                    chosenSpellId = castableSpells[randomIndex];
                } else {
                    // Level 2+ AI: Choose spell with highest damage
                    castableSpells.sort((a, b) => {
                        const spellA = this.spellSystem.getSpellById(a);
                        const spellB = this.spellSystem.getSpellById(b);
                        return (spellB ? spellB.damage : 0) - (spellA ? spellA.damage : 0);
                    });
                    chosenSpellId = castableSpells[0];
                }
                
                const chosenSpell = this.spellSystem.getSpellById(chosenSpellId);
                if (!chosenSpell) {
                    throw new Error(`Failed to get spell with ID: ${chosenSpellId}`);
                }
                
                console.log(`Opponent chose to cast ${chosenSpell.name} (Mana: ${chosenSpell.manaCost}, Damage: ${chosenSpell.damage || 0})`);
                
                // Remove spell from opponent's hand
                const spellIndex = this.gameState.opponent.currentSpellHand.indexOf(chosenSpellId);
                if (spellIndex !== -1) {
                    this.gameState.opponent.currentSpellHand.splice(spellIndex, 1);
                    console.log(`Opponent removed ${chosenSpell.name} from hand after casting`);
                }
                
                // Apply spell effects before moving on to the next turn
                this.applySpellEffects(chosenSpell, 'opponent', 'player');
                
                // Update battle UI to show changes immediately
                this.updateBattleUI();
            } else {
                console.log('Opponent has no available spells to cast');
                this.gameState.battleLog.push('Opponent skips their turn (no castable spells)');
                
                // Still update the UI even when skipping
                this.updateBattleUI();
            }
        } catch (error) {
            console.error('Error in opponent turn:', error);
            this.gameState.battleLog.push('Opponent encountered an error and skipped their turn');
            this.updateBattleUI();
        } finally {
            // Process end of turn after a delay to allow for animations
            // This ensures the turn always progresses, even if there was an error
            setTimeout(() => {
                // Clear the processing flag to allow player to cast spells again
                this.gameState.isProcessingTurn = false;
                this.processTurnEnd();
            }, 1000);
        }
    }
    
    // Draw a spell for the opponent
    drawOpponentSpell() {
        // Ensure opponent has necessary properties initialized
        if (!this.gameState.opponent.availableSpellsForBattle) {
            this.gameState.opponent.availableSpellsForBattle = [...this.gameState.opponent.spells];
            console.log('Initialized opponent availableSpellsForBattle');
        }
        
        if (!this.gameState.opponent.currentSpellHand) {
            this.gameState.opponent.currentSpellHand = [];
            console.log('Initialized opponent currentSpellHand');
        }
        
        // Check if deck is empty - if so, reshuffle
        if (this.gameState.opponent.availableSpellsForBattle.length === 0) {
            console.log('Opponent deck empty - reshuffling');
            
            // Get all opponent spells that aren't in hand
            const allOpponentSpells = [...this.gameState.opponent.spells];
            const handSpells = this.gameState.opponent.currentSpellHand || [];
            
            // Reshuffle all spells not in hand
            this.gameState.opponent.availableSpellsForBattle = allOpponentSpells.filter(spellId =>
                !handSpells.includes(spellId)
            );
            
            // Shuffle opponent's deck (Fisher-Yates algorithm)
            for (let i = this.gameState.opponent.availableSpellsForBattle.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.gameState.opponent.availableSpellsForBattle[i], this.gameState.opponent.availableSpellsForBattle[j]] =
                [this.gameState.opponent.availableSpellsForBattle[j], this.gameState.opponent.availableSpellsForBattle[i]];
            }
            
            console.log(`Opponent reshuffled deck with ${this.gameState.opponent.availableSpellsForBattle.length} spells`);
            
            // If still no cards, return
            if (this.gameState.opponent.availableSpellsForBattle.length === 0) {
                console.log('Opponent has no more spells to draw');
                return null;
            }
        }
        
        // Draw top card
        const drawnSpellId = this.gameState.opponent.availableSpellsForBattle.shift();
        const drawnSpell = this.spellSystem.getSpellById(drawnSpellId);
        
        if (drawnSpell) {
            console.log(`Opponent drew ${drawnSpell.name}`);
            this.gameState.opponent.currentSpellHand.push(drawnSpellId);
            return drawnSpellId;
        } else {
            console.error(`Failed to get opponent spell with ID: ${drawnSpellId}`);
            
            // If we drew an invalid spell, try to draw another one instead of returning null
            if (this.gameState.opponent.availableSpellsForBattle.length > 0) {
                console.log('Attempting to draw another spell instead');
                return this.drawOpponentSpell();
            }
            
            return null;
        }
    }
    
    // Process end of turn
    processTurnEnd() {
        console.log('Processing end of turn');
        
        // Increment turn counter
        this.gameState.currentTurn++;
        console.log(`New turn: ${this.gameState.currentTurn}`);
        
        // Update battle log
        this.gameState.battleLog.push(`Turn ${this.gameState.currentTurn} started`);
        
        // Apply mana regeneration
        this.gameState.player.mana = Math.min(
            this.gameState.player.maxMana,
            this.gameState.player.mana + this.gameState.player.manaRegen
        );
        
        this.gameState.opponent.mana = Math.min(
            this.gameState.opponent.maxMana,
            this.gameState.opponent.mana + this.gameState.opponent.manaRegen
        );
        
        console.log(`Player mana regenerated to ${this.gameState.player.mana}/${this.gameState.player.maxMana}`);
        console.log(`Opponent mana regenerated to ${this.gameState.opponent.mana}/${this.gameState.opponent.maxMana}`);
        
        // Draw cards to refill player's hand
        const drawnCard = this.spellSystem.refillSpellHand();
        if (drawnCard) {
            this.gameState.battleLog.push(`You drew ${drawnCard.name}`);
        }
        
        // Draw cards to refill opponent's hand to 3 cards
        while (this.gameState.opponent.currentSpellHand && 
               this.gameState.opponent.currentSpellHand.length < 3) {
            this.drawOpponentSpell();
        }
        
        // Update UI
        this.updateBattleUI();
        
        // Check if battle has ended
        this.checkBattleEnd();
    }
    
    // Check if battle has ended
    checkBattleEnd() {
        if (this.gameState.player.health <= 0) {
            // Player lost
            console.log('Battle ended - Player defeated');
            this.gameState.battleResult = 'defeat';
            this.gameState.isBattleOver = true;
            this.endBattle(false);
            return true;
        } else if (this.gameState.opponent.health <= 0) {
            // Player won
            console.log('Battle ended - Player victorious');
            this.gameState.battleResult = 'victory';
            this.gameState.isBattleOver = true;
            this.endBattle(true);
            return true;
        }
        
        // Battle continues
        return false;
    }
    
    // End the battle and process results
    endBattle(playerWon) {
        console.log(`Battle ended, player ${playerWon ? 'won' : 'lost'}`);
        
        // Get current experience and level before processing results
        const playerProgressBefore = this.progressionSystem.getPlayerProgress();
        const expBefore = playerProgressBefore.experience;
        const levelBefore = playerProgressBefore.level;
        
        // Get difficulty level
        const difficulty = this.gameState.opponent.difficulty;
        
        // Get spells used in battle
        const usedSpells = this.spellSystem.getUsedSpells() || [];
        console.log(`Used spells in battle:`, usedSpells.length > 0 ? usedSpells.map(s => s.name).join(', ') : 'None');
        
        // Process battle results
        const battleResults = this.progressionSystem.processBattleResult(playerWon, difficulty, usedSpells);
        const newSpell = battleResults.newSpell;
        
        // Get updated experience
        const playerProgressAfter = this.progressionSystem.getPlayerProgress();
        const expGained = playerProgressAfter.experience - expBefore;
        const levelUp = playerProgressAfter.level > levelBefore;
        
        // Show appropriate screen
        if (playerWon) {
            // Update results screen with rewards
            const resultMessage = document.getElementById('result-message');
            const rewardsList = document.getElementById('rewards-list');
            
            if (resultMessage) {
                resultMessage.textContent = 'Victory! You defeated the enemy wizard!';
            }
            
            if (rewardsList) {
                // Clear previous rewards
                rewardsList.innerHTML = '';
                
                // Add experience reward
                const expReward = document.createElement('div');
                expReward.className = 'reward-item';
                expReward.textContent = `Experience gained: ${expGained}`;
                rewardsList.appendChild(expReward);
                
                // Add level up message if applicable
                if (levelUp) {
                    const levelUpReward = document.createElement('div');
                    levelUpReward.className = 'reward-item level-up';
                    levelUpReward.textContent = `Level Up! You are now level ${playerProgressAfter.level}!`;
                    rewardsList.appendChild(levelUpReward);
                    
                    // Store the enemy spells for level-up spell selection
                    this.defeatedEnemySpells = this.gameState.opponent.spells || [];
                }
                
                // Add new spell message if applicable
                if (newSpell) {
                    const spellReward = document.createElement('div');
                    spellReward.className = 'reward-item new-spell';
                    spellReward.textContent = `New spell unlocked: ${newSpell.name}!`;
                    rewardsList.appendChild(spellReward);
                }
            }
            
            // Show results screen
            this.uiManager.showScreen('results-screen');
            
            // Add event listener to continue button
            const continueButton = document.getElementById('continue-button');
            if (continueButton) {
                // Remove any existing event listeners
                const newContinueButton = continueButton.cloneNode(true);
                continueButton.parentNode.replaceChild(newContinueButton, continueButton);
                
                // Add new event listener
                newContinueButton.addEventListener('click', () => {
                    console.log('Continue button clicked');
                    
                    // If player leveled up, show level-up spell selection screen
                    if (levelUp) {
                        this.showLevelUpSpellSelection();
                    } else {
                        // Otherwise, return to main menu
                        this.uiManager.showScreen('main-menu');
                    }
                });
            }
        } else {
            // Update game over screen
            const gameOverResult = document.getElementById('game-over-result');
            
            if (gameOverResult) {
                gameOverResult.textContent = 'You were defeated by the enemy wizard!';
            }
            
            // Show game over screen
            this.uiManager.showScreen('game-over');
        }
        
        // Save game state
        this.saveGameState();
    }
    
    // Show level-up spell selection screen
    showLevelUpSpellSelection() {
        console.log('Showing level-up spell selection screen');
        
        // Get spell options for level-up (1 from defeated enemy, 2 random)
        const spellOptions = this.spellSystem.getSpellOptionsForLevelUp(this.defeatedEnemySpells);
        
        // Show the level-up spell selection screen
        this.uiManager.showScreen('level-up-spell-selection');
        
        // Update the new level display
        const newLevelElement = document.getElementById('new-level');
        if (newLevelElement) {
            newLevelElement.textContent = this.spellSystem.getPlayerProgress().level;
        }
        
        // Populate the spell options
        const spellOptionsContainer = document.getElementById('new-spell-options');
        const confirmButton = document.getElementById('confirm-spell-selection');
        
        if (!spellOptionsContainer) {
            console.error('Spell options container not found!');
            return;
        }
        
        if (!confirmButton) {
            console.error('Confirm spell selection button not found!');
            return;
        }
        
        // Clear previous content
        spellOptionsContainer.innerHTML = '';
        
        // Track selected spell
        let selectedSpellId = null;
        
        // Create a document fragment to improve performance
        const fragment = document.createDocumentFragment();
        
        // Add each spell option
        spellOptions.forEach(spell => {
            const spellElement = document.createElement('div');
            spellElement.className = `selectable-spell ${spell.element}-spell`;
            spellElement.setAttribute('data-spell-id', spell.id);
            
            // Apply styling
            spellElement.style = `
                position: relative !important;
                width: 160px !important;
                min-height: 0 !important;
                height: auto !important;
                padding: 8px !important;
                margin: 2px !important;
                border-radius: 8px !important;
                background-color: rgba(30, 30, 60, 0.8) !important;
                border: 2px solid rgba(100, 100, 200, 0.5) !important;
                transition: all 0.3s ease !important;
                cursor: pointer !important;
                display: flex !important;
                flex-direction: column !important;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3) !important;
                flex: 0 0 auto !important;
            `;
            
            // Apply element-specific styling
            if (spell.element === 'fire') {
                spellElement.style.background = 'linear-gradient(to bottom, rgba(60, 20, 20, 0.8), rgba(30, 10, 10, 0.8))';
                spellElement.style.borderColor = 'rgba(255, 100, 50, 0.6)';
            } else if (spell.element === 'water') {
                spellElement.style.background = 'linear-gradient(to bottom, rgba(20, 20, 60, 0.8), rgba(10, 10, 30, 0.8))';
                spellElement.style.borderColor = 'rgba(50, 100, 255, 0.6)';
            } else if (spell.element === 'earth') {
                spellElement.style.background = 'linear-gradient(to bottom, rgba(40, 60, 20, 0.8), rgba(20, 30, 10, 0.8))';
                spellElement.style.borderColor = 'rgba(100, 200, 50, 0.6)';
            } else if (spell.element === 'air') {
                spellElement.style.background = 'linear-gradient(to bottom, rgba(60, 60, 90, 0.8), rgba(30, 30, 45, 0.8))';
                spellElement.style.borderColor = 'rgba(200, 200, 255, 0.6)';
            } else if (spell.element === 'arcane') {
                spellElement.style.background = 'linear-gradient(to bottom, rgba(60, 20, 90, 0.8), rgba(30, 10, 45, 0.8))';
                spellElement.style.borderColor = 'rgba(200, 50, 255, 0.6)';
            }
            
            // Populate spell details
            spellElement.innerHTML = `
                <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 3px; color: #ffffff; text-align: center;">
                    ${spell.name} ${spell.element}
                </div>
                <div style="font-size: 0.8rem; margin-bottom: 3px; color: #aaaaff; text-align: center; font-style: italic;">
                    ${spell.description || 'A powerful magical spell'}
                </div>
                <div style="margin: 3px 0; font-size: 0.8rem; color: #ddddff; text-align: center;">
                    Mana: ${spell.manaCost}
                    ${spell.damage ? `<br>Dmg: ${spell.damage}` : ''}
                    ${spell.healing ? `<br>Heal: ${spell.healing}` : ''}
                    ${spell.manaRestore ? `<br>+Mana: ${spell.manaRestore}` : ''}
                </div>
            `;
            
            // Add click handler
            spellElement.addEventListener('click', () => {
                console.log(`Spell option clicked: ${spell.name} (${spell.id})`);
                
                // Deselect any previously selected spell
                document.querySelectorAll('.selectable-spell').forEach(el => {
                    el.style.border = '2px solid rgba(100, 100, 200, 0.5)';
                    el.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
                });
                
                // Select this spell
                selectedSpellId = spell.id;
                spellElement.style.border = '3px solid #ffcc00';
                spellElement.style.boxShadow = '0 0 15px rgba(255, 204, 0, 0.5)';
                
                // Enable confirm button
                confirmButton.disabled = false;
            });
            
            fragment.appendChild(spellElement);
        });
        
        // Append all spell elements at once
        spellOptionsContainer.appendChild(fragment);
        
        // Add event listener to confirm button
        confirmButton.addEventListener('click', () => {
            if (selectedSpellId) {
                console.log(`Learning spell: ${selectedSpellId}`);
                
                // Unlock or improve the selected spell
                const spell = this.spellSystem.unlockSpell(selectedSpellId);
                
                if (spell) {
                    console.log(`Successfully learned/improved spell: ${spell.name}`);
                    
                    // Show a notification
                    const notification = document.createElement('div');
                    notification.className = 'notification';
                    notification.textContent = `You learned ${spell.name}!`;
                    document.body.appendChild(notification);
                    
                    // Remove notification after a delay
                    setTimeout(() => {
                        document.body.removeChild(notification);
                    }, 3000);
                    
                    // Return to the results screen
                    this.uiManager.showScreen('results-screen');
                }
            }
        });
    }

    // Start a battle
    startBattle() {
        console.log('Starting battle...');
        
        // First show the spell selection screen
        this.showSpellSelectionScreen();
    }
    
    // Show spell selection screen before battle
    showSpellSelectionScreen() {
        console.log('Showing spell selection screen');
        
        // Reset the spell system for a new battle
        this.spellSystem.resetSpellHand();
        this.spellSystem.resetAvailableSpells();
        
        // Get all available spells the player has unlocked
        const availableSpells = this.spellSystem.getPlayerUnlockedSpells().map(spellId => {
            return this.spellSystem.getSpellById(spellId);
        });
        
        // Show the spell selection screen
        this.uiManager.showScreen('spell-selection-screen');
        
        // Populate the available spells
        const spellsContainer = document.getElementById('available-spells-container');
        const selectedCounter = document.getElementById('spells-selected-counter');
        const startBattleButton = document.getElementById('start-battle-button');
        
        // Validate UI elements
        if (!selectedCounter) {
            console.error('Spells selected counter not found!');
        }
        
        if (!startBattleButton) {
            console.error('Start Battle button not found!');
        } else {
            // Initialize the button state
            startBattleButton.disabled = true;
            console.log('Initial Start Battle button state set to disabled');
        }
        
        // Track selected spells and maximum allowed
        let selectedSpells = [];
        const MAX_SELECTED_SPELLS = 3;
        
        // Helper function to update the counter and button state
        const updateSelectionUI = () => {
            // Update the counter display
            if (selectedCounter) {
                selectedCounter.textContent = `${selectedSpells.length}/${MAX_SELECTED_SPELLS} Spells Selected`;
            }
            
            // Update button state
            if (startBattleButton) {
                console.log(`Updating button state: ${selectedSpells.length} of ${MAX_SELECTED_SPELLS} selected`);
                startBattleButton.disabled = selectedSpells.length !== MAX_SELECTED_SPELLS;
            }
        };
        
        if (spellsContainer) {
            // Clear previous content
            spellsContainer.innerHTML = '';
            
            // Force horizontal layout with inline styles - more aggressive approach
            spellsContainer.style = `
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: wrap !important;
                justify-content: space-evenly !important;
                align-items: flex-start !important;
                gap: 5px !important;
                width: 100% !important;
                padding: 0 !important;
                margin: 5px 0 !important;
            `;
            
            // Create a document fragment to improve performance
            const fragment = document.createDocumentFragment();
            
            // Add each available spell
            availableSpells.forEach(spell => {
                const spellElement = document.createElement('div');
                spellElement.className = `selectable-spell ${spell.element}-spell`;
                spellElement.setAttribute('data-spell-id', spell.id);
                
                // Apply direct styles to each spell card - smaller size
                spellElement.style = `
                    position: relative !important;
                    width: 160px !important;
                    min-height: 0 !important;
                    height: auto !important;
                    padding: 8px !important;
                    margin: 2px !important;
                    border-radius: 8px !important;
                    background-color: rgba(30, 30, 60, 0.8) !important;
                    border: 2px solid rgba(100, 100, 200, 0.5) !important;
                    transition: all 0.3s ease !important;
                    cursor: pointer !important;
                    display: flex !important;
                    flex-direction: column !important;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3) !important;
                    flex: 0 0 auto !important;
                `;
                
                // Apply element-specific background
                if (spell.element === 'fire') {
                    spellElement.style.background = 'linear-gradient(to bottom, rgba(60, 20, 20, 0.8), rgba(30, 10, 10, 0.8))';
                    spellElement.style.borderColor = 'rgba(255, 100, 50, 0.6)';
                } else if (spell.element === 'water') {
                    spellElement.style.background = 'linear-gradient(to bottom, rgba(20, 20, 60, 0.8), rgba(10, 10, 30, 0.8))';
                    spellElement.style.borderColor = 'rgba(50, 100, 255, 0.6)';
                } else if (spell.element === 'earth') {
                    spellElement.style.background = 'linear-gradient(to bottom, rgba(40, 60, 20, 0.8), rgba(20, 30, 10, 0.8))';
                    spellElement.style.borderColor = 'rgba(100, 200, 50, 0.6)';
                } else if (spell.element === 'air') {
                    spellElement.style.background = 'linear-gradient(to bottom, rgba(60, 60, 90, 0.8), rgba(30, 30, 45, 0.8))';
                    spellElement.style.borderColor = 'rgba(200, 200, 255, 0.6)';
                } else if (spell.element === 'arcane') {
                    spellElement.style.background = 'linear-gradient(to bottom, rgba(60, 20, 90, 0.8), rgba(30, 10, 45, 0.8))';
                    spellElement.style.borderColor = 'rgba(200, 50, 255, 0.6)';
                }
                
                // Populate spell details - compact design
                spellElement.innerHTML = `
                    <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 3px; color: #ffffff; text-align: center;">${spell.name}</div>
                    <div style="font-size: 0.8rem; margin-bottom: 3px; color: #aaaaff; text-align: center; font-style: italic;">${spell.element}</div>
                    <div style="margin: 3px 0; font-size: 0.8rem; color: #ddddff; text-align: center;">${spell.description || 'A powerful magical spell'}</div>
                    <div style="font-size: 0.8rem; background-color: rgba(0, 0, 0, 0.3); padding: 5px; border-radius: 5px; margin-top: 5px;">
                        Mana: ${spell.manaCost}
                        ${spell.damage ? `<br>Dmg: ${spell.damage}` : ''}
                        ${spell.healing ? `<br>Heal: ${spell.healing}` : ''}
                        ${spell.manaRestore ? `<br>+Mana: ${spell.manaRestore}` : ''}
                    </div>
                `;
                
                // Add click handler
                spellElement.addEventListener('click', () => {
                    console.log(`Spell clicked: ${spell.name} (${spell.id})`);
                    const isSelected = selectedSpells.includes(spell.id);
                    
                    if (isSelected) {
                        // If already selected, deselect
                        console.log(`Deselecting spell: ${spell.name}`);
                        const index = selectedSpells.indexOf(spell.id);
                        if (index > -1) {
                            selectedSpells.splice(index, 1);
                        }
                        spellElement.classList.remove('selected');
                        spellElement.style.border = '2px solid rgba(100, 100, 200, 0.5)';
                        spellElement.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
                    } else if (selectedSpells.length < MAX_SELECTED_SPELLS) {
                        // If not at max, select
                        console.log(`Selecting spell: ${spell.name}`);
                        selectedSpells.push(spell.id);
                        spellElement.classList.add('selected');
                        spellElement.style.border = '3px solid #ffcc00';
                        spellElement.style.boxShadow = '0 0 15px rgba(255, 204, 0, 0.5)';
                    } else {
                        // At max already, show notification
                        console.log('Max spells already selected');
                        const notification = document.createElement('div');
                        notification.className = 'notification';
                        notification.textContent = `You can only select ${MAX_SELECTED_SPELLS} spells!`;
                        document.body.appendChild(notification);
                        
                        // Remove notification after a delay
                        setTimeout(() => {
                            document.body.removeChild(notification);
                        }, 3000);
                        return;
                    }
                    
                    // Update the counter and button state
                    console.log('Updating selection UI, selected spells:', selectedSpells);
                    updateSelectionUI();
                });
                
                fragment.appendChild(spellElement);
            });
            
            // Append all spell elements at once
            spellsContainer.appendChild(fragment);
            
            // Get the Start Battle button and add event listener directly to it
            const startBattleButton = document.getElementById('start-battle-button');
            if (startBattleButton) {
                console.log('Found Start Battle button, attaching event listener directly');
                
                // Remove any existing event listeners
                startBattleButton.removeEventListener('click', () => {});
                
                // Add event listener to the button
                startBattleButton.addEventListener('click', (e) => {
                    console.log('Start Battle button clicked!', e);
                    console.log('Button element:', e.target);
                    console.log('Button disabled state:', e.target.disabled);
                    console.log('Selected spells:', selectedSpells);
                    console.log('MAX_SELECTED_SPELLS:', MAX_SELECTED_SPELLS);
                    console.log('Selected count equals max?', selectedSpells.length === MAX_SELECTED_SPELLS);
                    
                    e.preventDefault(); // Prevent any default action
                    e.stopPropagation(); // Stop event bubbling
                    
                    if (selectedSpells.length === MAX_SELECTED_SPELLS) {
                        console.log('Setting player spell hand:', selectedSpells);
                        // Convert the spell IDs to actual spell objects before setting them
                        const selectedSpellObjects = selectedSpells.map(spellId => {
                            const spell = this.spellSystem.getSpellById(spellId);
                            if (!spell) {
                                console.error(`Failed to find spell with ID: ${spellId}`);
                            }
                            return spell;
                        }).filter(spell => spell !== null);
                        
                        console.log('Selected spell objects:', selectedSpellObjects);
                        this.spellSystem.setPlayerSpellHand(selectedSpellObjects);
                        
                        // Now proceed with the battle
                        console.log('Calling initializeBattle()');
                        this.startBattleWithSelectedSpells();
                    } else {
                        console.log('Not enough spells selected:', selectedSpells.length, 'of', MAX_SELECTED_SPELLS);
                    }
                });
            } else {
                console.error('Start Battle button not found in DOM!');
            }
            
            // Initial UI update
            updateSelectionUI();
        }
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
            
            // Shuffle opponent's deck
            for (let i = this.gameState.opponent.availableSpellsForBattle.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.gameState.opponent.availableSpellsForBattle[i], this.gameState.opponent.availableSpellsForBattle[j]] =
                [this.gameState.opponent.availableSpellsForBattle[j], this.gameState.opponent.availableSpellsForBattle[i]];
            }
            
            // Draw initial hand for opponent
            for (let i = 0; i < 3 && i < this.gameState.opponent.availableSpellsForBattle.length; i++) {
                this.drawOpponentSpell();
            }
        }
        
        // Update UI
        this.updateBattleUI();
        
        console.log('Battle initialized:', this.gameState);
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
                this.playerCastSpell(spell.id);
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
        this.updatePlayerProgressDisplay();
        
        // Notify state change
        if (this.onStateChange) {
            this.onStateChange('battle');
        }
    }
    
    // Update UI to display player progression information
    updatePlayerProgressDisplay() {
        // Check if progression system is initialized
        if (!this.progressionSystem) {
            console.warn('Cannot update player progress display: progression system not initialized');
            return;
        }
        
        // Get player progress
        const playerProgress = this.progressionSystem.getPlayerProgress();
        
        // Update player level display
        const playerLevelElement = document.getElementById('player-level-value');
        if (playerLevelElement) {
            playerLevelElement.textContent = playerProgress.level;
        }
        
        // Update player name to include level
        const playerNameElement = document.querySelector('.player-name');
        if (playerNameElement) {
            playerNameElement.textContent = `Your Wizard - Level ${playerProgress.level}`;
        }
        
        // Update spells known display
        const playerSpellsCountElement = document.getElementById('player-spells-known-value');
        if (playerSpellsCountElement) {
            playerSpellsCountElement.textContent = this.spellSystem.getPlayerUnlockedSpells().length;
        }
        
        // Add experience bar display
        const playerInfoElement = document.querySelector('.player-stats');
        if (playerInfoElement) {
            // Check if experience bar already exists
            let expBarElement = document.getElementById('player-experience');
            
            if (!expBarElement) {
                // Create experience bar if it doesn't exist
                const expBarHTML = `
                <div id="player-experience" class="experience-bar">
                    <div class="exp-header">
                        <span class="exp-label">Experience:</span>
                        <span class="exp-value">${playerProgress.experience}/${playerProgress.level * 100}</span>
                    </div>
                    <div class="exp-bar-container">
                        <div class="exp-fill" style="width: ${(playerProgress.experience / (playerProgress.level * 100)) * 100}%"></div>
                    </div>
                </div>`;
                
                playerInfoElement.insertAdjacentHTML('beforeend', expBarHTML);
            } else {
                // Update existing experience bar
                const expFillElement = expBarElement.querySelector('.exp-fill');
                const expValueElement = expBarElement.querySelector('.exp-value');
                
                if (expFillElement) {
                    expFillElement.style.width = `${(playerProgress.experience / (playerProgress.level * 100)) * 100}%`;
                }
                
                if (expValueElement) {
                    expValueElement.textContent = `${playerProgress.experience}/${playerProgress.level * 100}`;
                }
            }
        }
    }
}

export default GameManager;
