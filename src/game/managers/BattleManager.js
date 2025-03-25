// BattleManager.js - Handles battle flow and turn processing

/**
 * Manages battle flow and turn processing
 */
export class BattleManager {
    /**
     * Create a BattleManager instance
     * @param {Object} gameStateManager - The game state manager instance
     */
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
    }

    /**
     * Process opponent's turn
     */
    processOpponentTurn() {
        const gameState = this.gameStateManager.getGameState();
        
        console.log('Processing opponent turn...');
        
        try {
            // Check if the battle is already over
            if (gameState.isBattleOver) {
                console.log('Battle is already over, not processing opponent turn');
                return;
            }
            
            // First, make sure the opponent has spells
            this.ensureOpponentHasSpells();
            
            // Choose and cast a spell
            const spell = this.chooseAndCastOpponentSpell();
            
            // Update UI immediately after opponent casts a spell
            this.updatePlayerAndOpponentUI();
            
            // Check if the battle has ended
            if (this.checkBattleEnd()) {
                console.log('Battle ended during opponent turn');
                return;
            }
        } catch (error) {
            console.error('Error during opponent turn:', error);
            
            // Add error to battle log
            gameState.battleLog.push('Enemy wizard fumbled their spell');
            
            // Update UI to show the error message
            this.gameStateManager.updateBattleUI();
        } finally {
            // Process the end of the turn after a delay (to allow for animations)
            setTimeout(() => {
                this.processTurnEnd();
            }, 1000);
        }
    }
    
    /**
     * Ensure the opponent has spells in hand
     */
    ensureOpponentHasSpells() {
        const gameState = this.gameStateManager.getGameState();
        
        // Check if opponent has any spells
        if (!gameState.opponent.currentSpellHand || gameState.opponent.currentSpellHand.length === 0) {
            console.log('Opponent has no spells in hand, drawing new ones');
            
            // Initialize opponent spell hand if needed
            if (!gameState.opponent.currentSpellHand) {
                gameState.opponent.currentSpellHand = [];
            }
            
            // Draw up to 3 spells
            while (gameState.opponent.currentSpellHand.length < 3) {
                this.drawOpponentSpell();
            }
        }
    }
    
    /**
     * Choose and cast a spell for the opponent
     */
    chooseAndCastOpponentSpell() {
        console.log('Opponent choosing a spell to cast');
        const gameState = this.gameStateManager.getGameState();
        
        // Ensure spell system is properly initialized
        if (!this.gameStateManager.spellSystem) {
            console.error('Spell system not initialized');
            gameState.battleLog.push('Error: Spell system not ready');
            this.gameStateManager.updateBattleUI();
            return;
        }
        
        // Get opponent's hand
        let opponentHand;
        try {
            opponentHand = this.gameStateManager.spellSystem.getOpponentSpellHand();
        } catch (error) {
            console.error('Failed to get opponent spell hand:', error);
            gameState.battleLog.push('Error: Could not retrieve opponent spells');
            this.gameStateManager.updateBattleUI();
            return;
        }
        
        if (!opponentHand || opponentHand.length === 0) {
            console.error('Opponent has no spells in hand');
            gameState.battleLog.push('Enemy has no spells to cast!');
            this.gameStateManager.updateBattleUI();
            return;
        }
        
        // Filter spells the opponent can cast based on mana
        const castableSpells = opponentHand.filter(spell => {
            return spell && gameState.opponent.mana >= spell.manaCost;
        });
        
        console.log(`Opponent has ${castableSpells.length} castable spells out of ${opponentHand.length} in hand`);
        
        if (castableSpells.length === 0) {
            console.log('Opponent has no castable spells due to mana constraints');
            gameState.battleLog.push('Enemy has no spells they can cast!');
            this.gameStateManager.updateBattleUI();
            return;
        }
        
        // Choose a spell based on simple AI (prioritize damage)
        const chosenSpell = this.selectOpponentSpell(castableSpells, gameState);
        
        if (!chosenSpell) {
            console.error('Failed to select a spell for opponent');
            gameState.battleLog.push('Enemy failed to cast a spell!');
            this.gameStateManager.updateBattleUI();
            return;
        }
        
        console.log(`Opponent chose to cast: ${chosenSpell.name}`);
        
        // Apply spell effects
        try {
            this.applySpellEffects(chosenSpell, 'opponent', 'player');
        } catch (error) {
            console.error('Error applying opponent spell effects:', error);
            gameState.battleLog.push(`Error casting ${chosenSpell.name}`);
            this.gameStateManager.updateBattleUI();
            return;
        }
        
        // Remove the spell from opponent's hand
        try {
            this.gameStateManager.spellSystem.removeSpellFromOpponentHand(chosenSpell.id);
        } catch (error) {
            console.error('Error removing spell from opponent hand:', error);
            // Not a critical error, so we'll continue
        }
        
        // Update battle log
        gameState.battleLog.push(`Enemy cast ${chosenSpell.name}`);
        
        // Update UI
        this.gameStateManager.updateBattleUI();
        
        // Check if battle has ended
        this.checkBattleEnd();
        
        return chosenSpell;
    }
    
    /**
     * Get spells that the opponent can cast with current mana
     * @returns {Array} Castable spells
     */
    getCastableOpponentSpells() {
        const gameState = this.gameStateManager.getGameState();
        
        return gameState.opponent.currentSpellHand.filter(spellId => {
            const spell = this.gameStateManager.spellSystem.getSpellById(spellId);
            return spell && spell.manaCost <= gameState.opponent.mana;
        });
    }
    
    /**
     * Select a spell for the opponent to cast based on AI level
     * @param {Array} castableSpells - Castable spells
     * @param {Object} gameState - Game state
     * @returns {Number} Chosen spell ID
     */
    selectOpponentSpell(castableSpells, gameState) {
        if (gameState.opponent.aiLevel === 1) {
            // Level 1 AI: Choose random spell
            const randomIndex = Math.floor(Math.random() * castableSpells.length);
            return castableSpells[randomIndex];
        } else {
            // Level 2+ AI: Choose spell with highest damage
            castableSpells.sort((a, b) => {
                const spellA = this.gameStateManager.spellSystem.getSpellById(a);
                const spellB = this.gameStateManager.spellSystem.getSpellById(b);
                return (spellB ? spellB.damage : 0) - (spellA ? spellA.damage : 0);
            });
            return castableSpells[0];
        }
    }
    
    /**
     * Remove a spell from the opponent's hand
     * @param {Number} spellId - Spell ID to remove
     */
    removeSpellFromOpponentHand(spellId) {
        const gameState = this.gameStateManager.getGameState();
        const spell = this.gameStateManager.spellSystem.getSpellById(spellId);
        
        const spellIndex = gameState.opponent.currentSpellHand.indexOf(spellId);
        if (spellIndex !== -1) {
            gameState.opponent.currentSpellHand.splice(spellIndex, 1);
            console.log(`Opponent removed ${spell.name} from hand after casting`);
        }
    }
    
    /**
     * Draw a spell for the opponent
     * @returns {Number|null} Drawn spell ID or null if no spell was drawn
     */
    drawOpponentSpell() {
        const gameState = this.gameStateManager.getGameState();
        
        // Ensure opponent has necessary properties initialized
        if (!gameState.opponent.availableSpellsForBattle) {
            gameState.opponent.availableSpellsForBattle = [...gameState.opponent.spells];
            console.log('Initialized opponent availableSpellsForBattle');
        }
        
        if (!gameState.opponent.currentSpellHand) {
            gameState.opponent.currentSpellHand = [];
            console.log('Initialized opponent currentSpellHand');
        }
        
        // Check if deck is empty - if so, reshuffle
        if (gameState.opponent.availableSpellsForBattle.length === 0) {
            this.reshuffleOpponentDeck();
            
            // If still no cards, return
            if (gameState.opponent.availableSpellsForBattle.length === 0) {
                console.log('Opponent has no more spells to draw');
                return null;
            }
        }
        
        // Draw top card
        const drawnSpellId = gameState.opponent.availableSpellsForBattle.shift();
        const drawnSpell = this.gameStateManager.spellSystem.getSpellById(drawnSpellId);
        
        if (drawnSpell) {
            console.log(`Opponent drew ${drawnSpell.name}`);
            gameState.opponent.currentSpellHand.push(drawnSpellId);
            return drawnSpellId;
        } else {
            console.error(`Failed to get opponent spell with ID: ${drawnSpellId}`);
            
            // If we drew an invalid spell, try to draw another one instead of returning null
            if (gameState.opponent.availableSpellsForBattle.length > 0) {
                console.log('Attempting to draw another spell instead');
                return this.drawOpponentSpell();
            }
            
            return null;
        }
    }
    
    /**
     * Reshuffle the opponent's deck
     */
    reshuffleOpponentDeck() {
        const gameState = this.gameStateManager.getGameState();
        
        console.log('Opponent deck empty - reshuffling');
        
        // Get all opponent spells that aren't in hand
        const allOpponentSpells = [...gameState.opponent.spells];
        const handSpells = gameState.opponent.currentSpellHand || [];
        
        // Reshuffle all spells not in hand
        gameState.opponent.availableSpellsForBattle = allOpponentSpells.filter(spellId =>
            !handSpells.includes(spellId)
        );
        
        // Shuffle opponent's deck (Fisher-Yates algorithm)
        for (let i = gameState.opponent.availableSpellsForBattle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gameState.opponent.availableSpellsForBattle[i], gameState.opponent.availableSpellsForBattle[j]] =
            [gameState.opponent.availableSpellsForBattle[j], gameState.opponent.availableSpellsForBattle[i]];
        }
        
        console.log(`Opponent reshuffled deck with ${gameState.opponent.availableSpellsForBattle.length} spells`);
    }
    
    /**
     * Process end of turn
     */
    processTurnEnd() {
        console.log('Processing end of turn');
        const gameState = this.gameStateManager.getGameState();
        
        // Initialize spellsCast counter if not present
        if (gameState.spellsCast === undefined) {
            gameState.spellsCast = 0;
        }
        
        // Increment turn counter
        gameState.currentTurn++;
        console.log(`New turn: ${gameState.currentTurn}`);
        
        // Update battle log
        gameState.battleLog.push(`Turn ${gameState.currentTurn} started`);
        
        // Apply mana regeneration
        gameState.player.mana = Math.min(
            gameState.player.maxMana,
            gameState.player.mana + gameState.player.manaRegen
        );
        
        gameState.opponent.mana = Math.min(
            gameState.opponent.maxMana,
            gameState.opponent.mana + gameState.opponent.manaRegen
        );
        
        console.log(`Player mana regenerated to ${gameState.player.mana}/${gameState.player.maxMana}`);
        console.log(`Opponent mana regenerated to ${gameState.opponent.mana}/${gameState.opponent.maxMana}`);
        
        // Draw cards to refill player's hand
        const drawnCard = this.gameStateManager.spellSystem.refillSpellHand();
        if (drawnCard) {
            gameState.battleLog.push(`You drew ${drawnCard.name}`);
        }
        
        // Draw cards to refill opponent's hand to 3 cards
        while (gameState.opponent.currentSpellHand && 
               gameState.opponent.currentSpellHand.length < 3) {
            this.drawOpponentSpell();
        }
        
        // Update UI
        this.gameStateManager.updateBattleUI();
        this.updateOpponentUI();
        
        // Check if battle has ended
        this.checkBattleEnd();
    }
    
    /**
     * Start next turn
     */
    startNextTurn() {
        console.log('Starting next turn');
        const gameState = this.gameStateManager.getGameState();
        
        // Increment turn counter
        gameState.currentTurn++;
        console.log(`Turn ${gameState.currentTurn}`);
        
        // Apply mana regeneration
        gameState.player.mana = Math.min(
            gameState.player.maxMana,
            gameState.player.mana + gameState.player.manaRegen
        );
        
        gameState.opponent.mana = Math.min(
            gameState.opponent.maxMana,
            gameState.opponent.mana + gameState.opponent.manaRegen
        );
        
        console.log(`Player mana regenerated to ${gameState.player.mana}/${gameState.player.maxMana}`);
        console.log(`Opponent mana regenerated to ${gameState.opponent.mana}/${gameState.opponent.maxMana}`);
        
        // Draw cards to refill player's hand
        const drawnCard = this.gameStateManager.spellSystem.refillSpellHand();
        if (drawnCard) {
            gameState.battleLog.push(`You drew ${drawnCard.name}`);
        }
        
        // Draw cards to refill opponent's hand to 3 cards
        while (gameState.opponent.currentSpellHand && 
               gameState.opponent.currentSpellHand.length < 3) {
            this.drawOpponentSpell();
        }
        
        // Update UI with direct DOM manipulation to ensure bars are updated
        this.updatePlayerAndOpponentUI();
        
        // Update the full battle UI
        this.gameStateManager.updateBattleUI();
        
        // Check if battle has ended
        this.checkBattleEnd();
    }
    
    /**
     * Update opponent UI
     */
    updateOpponentUI() {
        const gameState = this.gameStateManager.getGameState();
        if (!gameState || !gameState.opponent) return;
        
        // Update opponent name
        const opponentName = document.querySelector('.opponent-name');
        if (opponentName) {
            opponentName.textContent = gameState.opponent.name || 'Enemy Wizard';
        }
        
        // Update opponent health bar - using specific selectors
        const opponentHealthFill = document.querySelector('#opponent-health.opponent-stat .health-bar .health-bar-fill');
        const opponentHealthText = document.querySelector('#opponent-health.opponent-stat .health-bar .bar-text');
        if (opponentHealthFill && opponentHealthText) {
            const healthPercentage = (gameState.opponent.health / gameState.opponent.maxHealth) * 100;
            opponentHealthFill.style.width = `${healthPercentage}%`;
            opponentHealthText.textContent = `${gameState.opponent.health}/${gameState.opponent.maxHealth}`;
        }
        
        // Update opponent mana bar - using specific selectors
        const opponentManaFill = document.querySelector('#opponent-mana.opponent-stat .mana-bar .mana-bar-fill');
        const opponentManaText = document.querySelector('#opponent-mana.opponent-stat .mana-bar .bar-text');
        if (opponentManaFill && opponentManaText) {
            const manaPercentage = (gameState.opponent.mana / gameState.opponent.maxMana) * 100;
            opponentManaFill.style.width = `${manaPercentage}%`;
            opponentManaText.textContent = `${gameState.opponent.mana}/${gameState.opponent.maxMana}`;
        }
        
        // Update difficulty display
        const difficultyElement = document.querySelector('.difficulty-text');
        if (difficultyElement && gameState.difficulty) {
            difficultyElement.textContent = gameState.difficulty;
        }
    }
    
    /**
     * Check if battle has ended
     * @returns {Boolean} True if battle has ended, false otherwise
     */
    checkBattleEnd() {
        const gameState = this.gameStateManager.getGameState();
        
        if (gameState.player.health <= 0) {
            // Player lost
            console.log('Battle ended - Player defeated');
            gameState.battleResult = 'defeat';
            gameState.isBattleOver = true;
            this.endBattle(false);
            return true;
        } else if (gameState.opponent.health <= 0) {
            // Player won
            console.log('Battle ended - Player victorious');
            gameState.battleResult = 'victory';
            gameState.isBattleOver = true;
            this.endBattle(true);
            return true;
        }
        
        // Battle continues
        return false;
    }
    
    /**
     * End the battle and process results
     * @param {Boolean} playerWon - True if player won, false otherwise
     */
    endBattle(playerWon) {
        console.log(`Battle ended, player ${playerWon ? 'won' : 'lost'}`);
        const gameState = this.gameStateManager.getGameState();
        
        // Get current experience and level before processing results
        const playerProgressBefore = this.gameStateManager.progressionSystem.getPlayerProgress();
        const expBefore = playerProgressBefore.experience;
        const levelBefore = playerProgressBefore.level;
        
        // Get difficulty level
        const difficulty = gameState.opponent.difficulty;
        
        // Get spells used in battle
        const usedSpells = this.gameStateManager.spellSystem.getUsedSpells() || [];
        console.log(`Used spells in battle:`, usedSpells.length > 0 ? usedSpells.map(s => s.name).join(', ') : 'None');
        
        // Process battle results
        const battleResults = this.gameStateManager.progressionSystem.processBattleResult(playerWon, difficulty, usedSpells);
        const newSpell = battleResults.newSpell;
        
        // Get updated experience
        const playerProgressAfter = this.gameStateManager.progressionSystem.getPlayerProgress();
        const expGained = playerProgressAfter.experience - expBefore;
        const levelUp = playerProgressAfter.level > levelBefore;
        
        // Show appropriate screen
        if (playerWon) {
            this.handleVictory(expGained, levelUp, playerProgressAfter, newSpell);
        } else {
            this.handleDefeat();
        }
        
        // Save game state
        this.gameStateManager.saveGameState();
    }
    
    /**
     * Handle victory scenario
     * @param {Number} expGained - Experience gained
     * @param {Boolean} levelUp - True if player leveled up, false otherwise
     * @param {Object} playerProgressAfter - Player progress after battle
     * @param {Object|null} newSpell - New spell unlocked or null if none
     */
    handleVictory(expGained, levelUp, playerProgressAfter, newSpell) {
        const gameState = this.gameStateManager.getGameState();
        
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
                this.gameStateManager.defeatedEnemySpells = gameState.opponent.spells || [];
            }
            
            // Add new spell message if applicable
            this.addNewSpellReward(rewardsList, newSpell);
        }
        
        // Show results screen
        this.gameStateManager.uiManager.showScreen('results-screen');
        
        // Setup continue button
        this.setupContinueButton(levelUp);
    }
    
    /**
     * Add new spell reward to rewards list
     * @param {HTMLElement} rewardsList - Rewards list element
     * @param {Object|null} newSpell - New spell unlocked or null if none
     */
    addNewSpellReward(rewardsList, newSpell) {
        if (newSpell) {
            const spellReward = document.createElement('div');
            spellReward.className = 'reward-item new-spell';
            spellReward.textContent = `New spell unlocked: ${newSpell.name}!`;
            rewardsList.appendChild(spellReward);
        }
    }
    
    /**
     * Setup continue button after battle
     * @param {Boolean} levelUp - True if player leveled up, false otherwise
     */
    setupContinueButton(levelUp) {
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
                    this.gameStateManager.uiManager.showScreen('main-menu');
                }
            });
        }
    }
    
    /**
     * Handle defeat scenario
     */
    handleDefeat() {
        // Update game over screen
        const gameOverResult = document.getElementById('game-over-result');
        
        if (gameOverResult) {
            gameOverResult.textContent = 'You were defeated by the enemy wizard!';
        }
        
        // Show game over screen
        this.gameStateManager.uiManager.showScreen('game-over');
    }
    
    /**
     * Show level-up spell selection screen
     */
    showLevelUpSpellSelection() {
        console.log('Showing level-up spell selection screen');
        
        // Get spell options for level-up (1 from defeated enemy, 2 random)
        const spellOptions = this.gameStateManager.spellSystem.getSpellOptionsForLevelUp(this.gameStateManager.defeatedEnemySpells);
        
        // Show the level-up spell selection screen
        this.gameStateManager.uiManager.showScreen('level-up-spell-selection');
        
        // Make the screen visible with transition
        const levelUpScreen = document.getElementById('level-up-spell-selection');
        if (levelUpScreen) {
            levelUpScreen.classList.add('active');
            
            // Ensure it's visible
            levelUpScreen.style.display = 'flex';
            levelUpScreen.style.opacity = '1';
            
            // Add some animations for better UX
            levelUpScreen.style.animation = 'fadeIn 0.5s ease-in-out';
        }
        
        // Update the new level display
        this.updateLevelUpDisplay();
        
        // Populate the spell options
        this.populateSpellOptions(spellOptions);
    }
    
    /**
     * Update level-up display
     */
    updateLevelUpDisplay() {
        const newLevelElement = document.getElementById('new-level');
        if (newLevelElement) {
            newLevelElement.textContent = this.gameStateManager.spellSystem.getPlayerProgress().level;
        }
    }
    
    /**
     * Populate spell options for level-up
     * @param {Array} spellOptions - Spell options
     */
    populateSpellOptions(spellOptions) {
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
            const spellElement = this.createSpellOptionElement(spell);
            
            // Add click handler
            spellElement.addEventListener('click', () => {
                this.handleSpellOptionClick(spell, spellElement, selectedSpellId);
                selectedSpellId = spell.id; // Update selected spell ID
                
                // Enable confirm button
                confirmButton.disabled = false;
            });
            
            fragment.appendChild(spellElement);
        });
        
        // Append all spell elements at once
        spellOptionsContainer.appendChild(fragment);
        
        // Add event listener to confirm button
        this.setupConfirmSpellSelectionButton(confirmButton);
    }
    
    /**
     * Create a spell option element
     * @param {Object} spell - Spell data
     * @returns {HTMLElement} Spell option element
     */
    createSpellOptionElement(spell) {
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
        this.applyElementStyling(spellElement, spell.element);
        
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
        
        return spellElement;
    }
    
    /**
     * Apply element-specific styling to spell element
     * @param {HTMLElement} spellElement - Spell element
     * @param {String} element - Element type
     */
    applyElementStyling(spellElement, element) {
        if (element === 'fire') {
            spellElement.style.background = 'linear-gradient(to bottom, rgba(60, 20, 20, 0.8), rgba(30, 10, 10, 0.8))';
            spellElement.style.borderColor = 'rgba(255, 100, 50, 0.6)';
        } else if (element === 'water') {
            spellElement.style.background = 'linear-gradient(to bottom, rgba(20, 20, 60, 0.8), rgba(10, 10, 30, 0.8))';
            spellElement.style.borderColor = 'rgba(50, 100, 255, 0.6)';
        } else if (element === 'earth') {
            spellElement.style.background = 'linear-gradient(to bottom, rgba(40, 60, 20, 0.8), rgba(20, 30, 10, 0.8))';
            spellElement.style.borderColor = 'rgba(100, 200, 50, 0.6)';
        } else if (element === 'air') {
            spellElement.style.background = 'linear-gradient(to bottom, rgba(60, 60, 90, 0.8), rgba(30, 30, 45, 0.8))';
            spellElement.style.borderColor = 'rgba(200, 200, 255, 0.6)';
        } else if (element === 'arcane') {
            spellElement.style.background = 'linear-gradient(to bottom, rgba(60, 20, 90, 0.8), rgba(30, 10, 45, 0.8))';
            spellElement.style.borderColor = 'rgba(200, 50, 255, 0.6)';
        }
    }
    
    /**
     * Handle spell option click
     * @param {Object} spell - Spell data
     * @param {HTMLElement} spellElement - Spell element
     * @param {Number|null} selectedSpellId - Currently selected spell ID or null
     */
    handleSpellOptionClick(spell, spellElement, selectedSpellId) {
        console.log(`Spell option clicked: ${spell.name} (${spell.id})`);
        
        // Deselect any previously selected spell
        document.querySelectorAll('.selectable-spell').forEach(el => {
            el.style.border = '2px solid rgba(100, 100, 200, 0.5)';
            el.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
        });
        
        // Select this spell
        spellElement.style.border = '3px solid #ffcc00';
        spellElement.style.boxShadow = '0 0 15px rgba(255, 204, 0, 0.5)';
    }
    
    /**
     * Setup confirm spell selection button
     * @param {HTMLElement} confirmButton - Confirm button element
     */
    setupConfirmSpellSelectionButton(confirmButton) {
        // Clear existing event listeners
        const newConfirmButton = confirmButton.cloneNode(true);
        confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
        
        // Add new event listener
        newConfirmButton.addEventListener('click', () => {
            const selectedSpellId = document.querySelector('.selectable-spell[style*="border: 3px solid #ffcc00"]')?.getAttribute('data-spell-id');
            
            if (selectedSpellId) {
                this.handleSpellSelection(selectedSpellId);
            }
        });
    }
    
    /**
     * Handle spell selection
     * @param {Number} selectedSpellId - Selected spell ID
     */
    handleSpellSelection(selectedSpellId) {
        console.log(`Learning spell: ${selectedSpellId}`);
        
        // Unlock or improve the selected spell
        const spell = this.gameStateManager.spellSystem.unlockSpell(selectedSpellId);
        
        if (spell) {
            console.log(`Successfully learned/improved spell: ${spell.name}`);
            
            // Show a notification
            this.showSpellLearnedNotification(spell);
            
            // Return to the results screen
            this.gameStateManager.uiManager.showScreen('results-screen');
        }
    }
    
    /**
     * Show spell learned notification
     * @param {Object} spell - Spell data
     */
    showSpellLearnedNotification(spell) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = `You learned ${spell.name}!`;
        document.body.appendChild(notification);
        
        // Remove notification after a delay
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
    
    /**
     * Apply spell effects
     * @param {Object} spell - Spell data
     * @param {String} casterType - Caster type (player or opponent)
     * @param {String} targetType - Target type (player or opponent)
     * @returns {Boolean} True if spell was applied successfully, false otherwise
     */
    applySpellEffects(spell, casterType, targetType) {
        console.log(`Applying spell effects for ${spell.name} - ${casterType} targeting ${targetType}`);
        
        try {
            const gameState = this.gameStateManager.getGameState();
            
            // Ensure game state is valid
            if (!gameState) {
                console.error('Game state is not available');
                return false;
            }
            
            // Get caster and target
            const caster = gameState[casterType];
            const target = gameState[targetType];
            
            // Validate caster and target
            if (!caster || !target) {
                console.error(`Invalid caster or target: ${casterType} -> ${targetType}`);
                return false;
            }
            
            // Ensure UI elements exist before applying spell effects
            if (this.gameStateManager.uiElementManager) {
                console.log('Ensuring UI elements exist before applying spell effects');
                this.gameStateManager.uiElementManager.ensureUIElementsExist();
            }
            
            // Debug log spell data and states before application
            console.log(`${casterType} casting ${spell.name} with stats:`, { 
                damage: spell.damage, 
                manaCost: spell.manaCost,
                healing: spell.healing
            });
            console.log(`${casterType} stats before: Health=${caster.health}/${caster.maxHealth}, Mana=${caster.mana}/${caster.maxMana}`);
            console.log(`${targetType} stats before: Health=${target.health}/${target.maxHealth}, Mana=${target.mana}/${target.maxMana}`);
            
            // Deduct mana cost
            const previousMana = caster.mana;
            caster.mana -= spell.manaCost;
            console.log(`${casterType} mana after spell cast: ${caster.mana}/${caster.maxMana} (cost: ${spell.manaCost})`);
            
            // Apply damage to target if spell has damage
            if (spell.damage && spell.damage > 0) {
                const previousHealth = target.health;
                const damageDealt = spell.damage;
                
                target.health = Math.max(0, target.health - damageDealt);
                console.log(`${targetType} health after damage: ${target.health}/${target.maxHealth} (damage: ${damageDealt})`);
                
                // Add to battle log
                const damageMessage = `${casterType === 'player' ? 'You' : 'Enemy'} dealt ${damageDealt} damage`;
                gameState.battleLog.push(damageMessage);
            }
            
            // Apply healing to caster if spell has healing
            this.applyHealingEffect(spell, caster, casterType, gameState);
            
            // Apply any additional effects
            this.applyAdditionalEffects(spell, caster, casterType, gameState);
            
            // Always update UI after spell application
            this.updatePlayerAndOpponentUI();
            
            // Update previous health values for health bar animations
            caster.prevHealth = caster.health;
            target.prevHealth = target.health;
            
            // Success
            return true;
        } catch (error) {
            console.error('Error applying spell effects:', error);
            // Update UI even if there was an error
            try {
                this.updatePlayerAndOpponentUI();
            } catch (e) {
                console.error('Error updating UI after spell effect failure:', e);
            }
            return false;
        }
    }
    
    /**
     * Apply healing effect to caster
     * @param {Object} spell - Spell data
     * @param {Object} caster - Caster data
     * @param {String} casterType - Caster type (player or opponent)
     * @param {Object} gameState - Game state
     */
    applyHealingEffect(spell, caster, casterType, gameState) {
        if (!caster || !spell || !gameState) {
            console.error('Missing caster, spell, or gameState data in applyHealingEffect');
            return;
        }
        
        const actualHealing = spell.healing || 0;
        
        // Apply healing to caster if spell has healing
        if (actualHealing > 0) {
            // Calculate previous health for animation
            const previousHealth = caster.health;
            
            // Apply healing
            caster.health = Math.min(caster.maxHealth, caster.health + actualHealing);
            console.log(`${casterType} health after healing: ${caster.health}/${caster.maxHealth} (healing: ${actualHealing})`);
            
            // Display healing effect
            if (this.gameStateManager.uiElementManager) {
                const casterElementId = casterType === 'player' ? 'player-health' : 'opponent-health';
                
                // Check if displayStatChange method exists before calling it
                if (typeof this.gameStateManager.uiElementManager.displayStatChange === 'function') {
                    this.gameStateManager.uiElementManager.displayStatChange('healing', actualHealing, casterElementId);
                } else {
                    console.warn('displayStatChange method not available on uiElementManager');
                }
            }
            
            // Add to battle log
            const logMessage = `${casterType === 'player' ? 'You' : 'Enemy'} healed for ${actualHealing} health`;
            gameState.battleLog.push(logMessage);
            console.log(`Battle log: ${logMessage}`);
        }
    }
    
    /**
     * Apply additional spell effects
     * @param {Object} spell - Spell data
     * @param {Object} caster - Caster data
     * @param {String} casterType - Caster type (player or opponent)
     * @param {Object} gameState - Game state
     */
    applyAdditionalEffects(spell, caster, casterType, gameState) {
        if (!caster || !spell || !gameState) {
            console.error('Missing caster, spell, or gameState data in applyAdditionalEffects');
            return;
        }
        
        // Apply mana restore effect if spell has it
        if (spell.manaRestore && spell.manaRestore > 0) {
            const manaRestored = spell.manaRestore;
            caster.mana = Math.min(caster.maxMana, caster.mana + manaRestored);
            
            // Display mana restore effect
            if (this.gameStateManager.uiElementManager) {
                const casterElementId = casterType === 'player' ? 'player-mana' : 'opponent-mana';
                
                // Check if displayStatChange method exists before calling it
                if (typeof this.gameStateManager.uiElementManager.displayStatChange === 'function') {
                    this.gameStateManager.uiElementManager.displayStatChange('mana', manaRestored, casterElementId);
                } else {
                    console.warn('displayStatChange method not available on uiElementManager');
                }
            }
            
            const logMessage = `${casterType === 'player' ? 'You' : 'Enemy'} restored ${manaRestored} mana`;
            gameState.battleLog.push(logMessage);
            console.log(`${casterType} mana after restore: ${caster.mana}/${caster.maxMana} (restored: ${manaRestored})`);
        }
        
        // Apply any other spell effects
        if (spell.effects && spell.effects.length > 0) {
            spell.effects.forEach(effect => {
                console.log(`Applying effect: ${effect.type}`);
                // Handle different effect types
                switch (effect.type) {
                    case 'manaRegen':
                        caster.mana = Math.min(caster.maxMana, caster.mana + effect.value);
                        
                        // Display mana regen effect
                        if (this.gameStateManager.uiElementManager) {
                            const casterElementId = casterType === 'player' ? 'player-mana' : 'opponent-mana';
                            
                            // Check if displayStatChange method exists before calling it
                            if (typeof this.gameStateManager.uiElementManager.displayStatChange === 'function') {
                                this.gameStateManager.uiElementManager.displayStatChange('mana', effect.value, casterElementId);
                            } else {
                                console.warn('displayStatChange method not available on uiElementManager');
                            }
                        }
                        
                        gameState.battleLog.push(`${casterType === 'player' ? 'You' : 'Enemy'} regenerated ${effect.value} mana`);
                        break;
                    // Add more effect types as needed
                }
            });
        }
    }
    
    /**
     * Update player and opponent UI elements
     */
    updatePlayerAndOpponentUI() {
        try {
            const gameState = this.gameStateManager.getGameState();
            if (!gameState) {
                console.error('Game state is not available');
                return;
            }

            console.log('Updating player and opponent UI with current game state');
            
            // Log current values for debugging
            console.log('Player stats:', {
                health: gameState.player.health,
                maxHealth: gameState.player.maxHealth,
                mana: gameState.player.mana,
                maxMana: gameState.player.maxMana,
                level: gameState.player.level,
                experience: gameState.player.experience
            });
            
            console.log('Opponent stats:', {
                health: gameState.opponent.health,
                maxHealth: gameState.opponent.maxHealth,
                mana: gameState.opponent.mana,
                maxMana: gameState.opponent.maxMana
            });
            
            // Use the comprehensive UI update method if available
            if (this.gameStateManager.uiElementManager && 
                typeof this.gameStateManager.uiElementManager.ensureAndUpdateAllUI === 'function') {
                console.log('Using comprehensive UI update method');
                return this.gameStateManager.uiElementManager.ensureAndUpdateAllUI(gameState);
            }
            
            // Fall back to individual update methods if the comprehensive one is not available
            if (this.gameStateManager.uiElementManager) {
                // Update player overlay
                if (typeof this.gameStateManager.uiElementManager.updatePlayerOverlay === 'function') {
                    console.log('Calling UIElementManager.updatePlayerOverlay');
                    this.gameStateManager.uiElementManager.updatePlayerOverlay(gameState.player);
                } else {
                    console.error('UIElementManager.updatePlayerOverlay is not available');
                }
                
                // Update opponent overlay
                if (typeof this.gameStateManager.uiElementManager.updateOpponentOverlay === 'function') {
                    console.log('Calling UIElementManager.updateOpponentOverlay');
                    this.gameStateManager.uiElementManager.updateOpponentOverlay(gameState.opponent);
        } else {
                    console.error('UIElementManager.updateOpponentOverlay is not available');
                }
                
                // Update spell buttons separately
                this.updateSpellButtonStates(gameState.player.mana);
            } else {
                console.error('UIElementManager is not available, unable to update UI');
            }
        } catch (error) {
            console.error('Error updating player and opponent UI:', error);
        }
    }
    
    /**
     * Update spell button states based on available mana
     * @param {number} playerMana - Current player mana
     */
    updateSpellButtonStates(playerMana) {
        try {
            const gameState = this.gameStateManager.getGameState();
            const spellButtons = document.querySelectorAll('.spell-button');
            const isProcessingTurn = gameState.isProcessingTurn;
            
            console.log(`Updating spell buttons with mana ${playerMana}, processing: ${isProcessingTurn}`);
            
            spellButtons.forEach(button => {
                const spellId = button.getAttribute('data-spell-id');
                if (spellId) {
                    const spell = this.gameStateManager.spellSystem.getSpellById(spellId);
                    if (spell) {
                        // Disable button if not enough mana or turn is processing
                        const disabled = playerMana < spell.manaCost || isProcessingTurn;
                        button.classList.toggle('disabled', disabled);
                        
                        // Apply visual styling to make the state obvious
                        if (disabled) {
                            button.style.opacity = '0.5';
                            button.style.cursor = 'not-allowed';
                        } else {
                            button.style.opacity = '1.0';
                            button.style.cursor = 'pointer';
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error updating spell button states:', error);
        }
    }
    
    /**
     * Update experience bar display
     * @param {Object} player - Player character data
     */
    updateExperienceBar(player) {
        const expFill = document.getElementById('player-exp-fill');
        const expCurrentElement = document.getElementById('exp-current-value');
        const expNextElement = document.getElementById('exp-next-value');
        const playerLevelElement = document.getElementById('player-level');
        
        if (!expFill || !expCurrentElement || !expNextElement) {
            console.warn('Experience bar elements not found');
            return;
        }
        
        if (!player) {
            console.error('No player data provided');
            return;
        }
        
        try {
            // Get current player level and experience
            const currentLevel = player.level || 1;
            const expNeeded = this.gameStateManager.playerManager.calculateExpToNextLevel(currentLevel);
            const currentExp = player.experience || 0;
            
            // Use a safer way to calculate total experience for current level
            let totalExpForCurrentLevel = 0;
            for (let i = 1; i < currentLevel; i++) {
                totalExpForCurrentLevel += this.gameStateManager.playerManager.calculateExpToNextLevel(i);
            }
            
            const currentLevelExp = currentExp - totalExpForCurrentLevel;
            
            // Calculate percentage for the progress bar
            const percentage = Math.max(0, Math.min(100, (currentLevelExp / expNeeded) * 100));
            
            // Update UI elements
            expFill.style.width = `${percentage}%`;
            expCurrentElement.textContent = Math.floor(currentLevelExp);
            expNextElement.textContent = expNeeded;
            
            // Update player level display if element exists
            if (playerLevelElement) {
                playerLevelElement.textContent = currentLevel;
            }
            
            console.log(`Updated player experience: ${percentage}% (${currentLevelExp}/${expNeeded})`);
        } catch (error) {
            console.error('Error updating experience bar:', error);
        }
    }
    
    /**
     * Apply spell mana cost to caster
     * @param {Object} spell - Spell data
     * @param {Object} caster - Caster data
     * @param {String} casterType - Caster type (player or opponent)
     */
    applySpellCost(spell, caster, casterType) {
        if (!caster || !spell) {
            console.error('Missing caster or spell data in applySpellCost');
            return;
        }
        
        const manaCost = spell.manaCost || 0;
        
        // Deduct mana cost from caster
        caster.mana = Math.max(0, caster.mana - manaCost);
        console.log(`${casterType} mana after casting: ${caster.mana}/${caster.maxMana} (cost: ${manaCost})`);
        
        // Display mana cost animation if mana was spent and ui manager exists with the method
        if (manaCost > 0 && this.gameStateManager.uiElementManager) {
            const manaElementId = casterType === 'player' ? 'player-mana' : 'opponent-mana';
            
            // Check if displayStatChange method exists before calling it
            if (typeof this.gameStateManager.uiElementManager.displayStatChange === 'function') {
                this.gameStateManager.uiElementManager.displayStatChange('mana', -manaCost, manaElementId);
            } else {
                console.warn('displayStatChange method not available on uiElementManager');
            }
        }
    }
    
    /**
     * Apply damage effect to target
     * @param {Object} spell - Spell data
     * @param {Object} target - Target data
     * @param {String} targetType - Target type (player or opponent)
     * @param {String} casterType - Caster type (player or opponent)
     * @param {Object} gameState - Game state
     */
    applyDamageEffect(spell, target, targetType, casterType, gameState) {
        if (!target || !spell || !gameState) {
            console.error('Missing target, spell, or gameState data in applyDamageEffect');
            return;
        }
        
        const actualDamage = spell.damage || 0;
        
        // Apply damage to target if spell has damage
        if (actualDamage > 0) {
            // Calculate previous health for animation
            const previousHealth = target.health;
            
            // Apply damage
            target.health = Math.max(0, target.health - actualDamage);
            console.log(`${targetType} health after damage: ${target.health}/${target.maxHealth} (damage: ${actualDamage})`);
            
            // Display damage effect
            if (this.gameStateManager.uiElementManager) {
                const targetElementId = targetType === 'player' ? 'player-health' : 'opponent-health';
                
                // Check if displayStatChange method exists before calling it
                if (typeof this.gameStateManager.uiElementManager.displayStatChange === 'function') {
                    this.gameStateManager.uiElementManager.displayStatChange('damage', actualDamage, targetElementId);
                } else {
                    console.warn('displayStatChange method not available on uiElementManager');
                }
            }
            
            // Add to battle log
            const logMessage = `${casterType === 'player' ? 'You' : 'Enemy'} cast ${spell.name} for ${actualDamage} damage`;
            gameState.battleLog.push(logMessage);
            console.log(`Battle log: ${logMessage}`);
        }
    }
}

export default BattleManager;
