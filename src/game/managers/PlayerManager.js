// PlayerManager.js - Handles player state and actions

/**
 * Manages player state and actions
 */
export class PlayerManager {
    /**
     * Create a PlayerManager instance
     * @param {Object} gameStateManager - The game state manager instance
     */
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
    }

    /**
     * Handle player casting a spell
     * @param {string} spellId - ID of the spell to cast
     */
    playerCastSpell(spellId) {
        console.log(`Player attempting to cast spell: ${spellId}`);
        const gameState = this.gameStateManager.getGameState();
        
        // Check if we're already processing a turn
        if (gameState.isProcessingTurn) {
            console.log('Already processing a turn, ignoring spell cast request');
            return;
        }
        
        // Set flag to prevent multiple spell casts while processing
        gameState.isProcessingTurn = true;
        
        try {
            // Get the spell object
            const spell = this.gameStateManager.spellSystem.getSpellById(spellId);
            if (!spell) {
                console.error(`Spell not found with ID: ${spellId}`);
                gameState.isProcessingTurn = false;
                return;
            }
            
            console.log(`Player casting ${spell.name} (Mana: ${spell.manaCost}, Damage: ${spell.damage || 0})`);
            
            // Check if player has enough mana
            if (gameState.player.mana < spell.manaCost) {
                console.log(`Not enough mana to cast ${spell.name}`);
                gameState.battleLog.push(`Not enough mana to cast ${spell.name}`);
                this.gameStateManager.updateBattleUI();
                gameState.isProcessingTurn = false;
                return;
            }
            
            // Check if spell is in player's hand
            const playerHand = this.gameStateManager.spellSystem.getPlayerSpellHand();
            const spellInHand = playerHand.find(handSpell => handSpell.id === spellId);
            
            if (!spellInHand) {
                console.error(`Spell ${spell.name} is not in player's hand`);
                gameState.battleLog.push(`Cannot cast ${spell.name} - not in your hand`);
                this.gameStateManager.updateBattleUI();
                gameState.isProcessingTurn = false;
                return;
            }
            
            // Apply spell effects
            this.gameStateManager.battleManager.applySpellEffects(spell, 'player', 'opponent');
            
            // Remove spell from player's hand
            this.gameStateManager.spellSystem.removeSpellFromHand(spellId);
            
            // Update battle log
            gameState.battleLog.push(`You cast ${spell.name}`);
            
            // Update the entire battle UI, including player and opponent stats
            this.gameStateManager.updateBattleUI();
            
            // Check if battle has ended after player's spell
            if (this.gameStateManager.battleManager.checkBattleEnd()) {
                // Battle ended, don't process opponent turn
                gameState.isProcessingTurn = false;
                return;
            }
            
            // Process opponent's turn after a delay
            console.log('Scheduling opponent turn');
            setTimeout(() => {
                this.gameStateManager.battleManager.processOpponentTurn();
                
                // Update the battle UI again after opponent's turn
                this.gameStateManager.updateBattleUI();
            }, 1000);
            
        } catch (error) {
            console.error('Error in player cast spell:', error);
            gameState.battleLog.push('Error occurred while casting spell');
            this.gameStateManager.updateBattleUI();
            gameState.isProcessingTurn = false;
        }
    }
    
    /**
     * Show spell selection screen before battle
     */
    showSpellSelectionScreen() {
        console.log('Showing spell selection screen');
        
        // Reset the spell system for a new battle
        this.gameStateManager.spellSystem.resetSpellHand();
        this.gameStateManager.spellSystem.resetAvailableSpells();
        
        // Get all available spells the player has unlocked
        const availableSpells = this.gameStateManager.spellSystem.getPlayerUnlockedSpells().map(spellId => {
            return this.gameStateManager.spellSystem.getSpellById(spellId);
        });
        
        // Show the spell selection screen
        this.gameStateManager.uiManager.showScreen('spell-selection-screen');
        
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
                            const spell = this.gameStateManager.spellSystem.getSpellById(spellId);
                            if (!spell) {
                                console.error(`Failed to find spell with ID: ${spellId}`);
                            }
                            return spell;
                        }).filter(spell => spell !== null);
                        
                        console.log('Selected spell objects:', selectedSpellObjects);
                        this.gameStateManager.spellSystem.setPlayerSpellHand(selectedSpellObjects);
                        
                        // Now proceed with the battle
                        console.log('Calling startBattleWithSelectedSpells()');
                        this.gameStateManager.startBattleWithSelectedSpells();
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
    
    /**
     * Update player progress display, including experience bar
     */
    updatePlayerProgressDisplay() {
        console.log('Updating player progress display');
        
        const player = this.gameStateManager.getGameState().player;
        if (!player) {
            console.error('No player data found');
            return;
        }
        
        // Update overlay stats through UI manager if available
        if (this.gameStateManager.uiManager && typeof this.gameStateManager.uiManager.updatePlayerOverlay === 'function') {
            this.gameStateManager.uiManager.updatePlayerOverlay(player);
            return;
        }
        
        // If no UI manager, update elements directly
        
        // Update health bar
        const healthBarElement = document.querySelector('#player-health .health-bar .health-bar-fill');
        const healthTextElement = document.querySelector('#player-health .health-bar .bar-text');
        
        if (healthBarElement && healthTextElement) {
            const healthPercentage = Math.max(0, Math.min(100, (player.health / player.maxHealth) * 100));
            
            healthBarElement.style.width = `${healthPercentage}%`;
            healthTextElement.textContent = `${Math.round(player.health)}/${player.maxHealth}`;
            
            console.log(`Health: ${player.health}/${player.maxHealth} (${healthPercentage}%)`);
        } else {
            console.warn('Health bar elements not found');
        }
        
        // Update mana bar
        const manaBarElement = document.querySelector('#player-mana .mana-bar .mana-bar-fill');
        const manaTextElement = document.querySelector('#player-mana .mana-bar .bar-text');
        
        if (manaBarElement && manaTextElement) {
            const manaPercentage = Math.max(0, Math.min(100, (player.mana / player.maxMana) * 100));
            
            manaBarElement.style.width = `${manaPercentage}%`;
            manaTextElement.textContent = `${Math.round(player.mana)}/${player.maxMana}`;
            
            console.log(`Mana: ${player.mana}/${player.maxMana} (${manaPercentage}%)`);
        } else {
            console.warn('Mana bar elements not found');
        }
        
        // Update experience bar (using the new overlay elements)
        const expFill = document.getElementById('player-exp-fill');
        const expCurrentElement = document.getElementById('exp-current-value');
        const expNextElement = document.getElementById('exp-next-value');
        const playerLevelElement = document.getElementById('player-level');
        
        if (expFill && expCurrentElement && expNextElement) {
            try {
                const currentLevel = player.level || 1;
                const expNeeded = this.calculateExpToNextLevel(currentLevel);
                const currentExp = player.experience || 0;
                
                // Calculate experience for current level
                let expForPreviousLevels = 0;
                for (let i = 1; i < currentLevel; i++) {
                    expForPreviousLevels += this.calculateExpToNextLevel(i);
                }
                
                const currentLevelExp = currentExp - expForPreviousLevels;
                const percentage = Math.max(0, Math.min(100, (currentLevelExp / expNeeded) * 100));
                
                // Update UI elements
                expFill.style.width = `${percentage}%`;
                expCurrentElement.textContent = Math.floor(currentLevelExp);
                expNextElement.textContent = expNeeded;
                
                // Update player level if element exists
                if (playerLevelElement) {
                    playerLevelElement.textContent = currentLevel;
                }
                
                console.log(`Experience: ${currentLevelExp}/${expNeeded} (${percentage}%)`);
            } catch (error) {
                console.error('Error updating experience bar:', error);
            }
        } else {
            console.warn('Experience bar elements not found');
        }
    }
    
    /**
     * Create missing experience bar elements if they don't exist
     */
    createMissingExperienceBarElements() {
        console.log('Creating missing experience bar elements for player stats overlay');
        
        // Check if the player stats overlay exists
        let playerStatsOverlay = document.getElementById('player-stats-overlay');
        if (!playerStatsOverlay) {
            console.warn('Player stats overlay not found, creating it');
            playerStatsOverlay = document.createElement('div');
            playerStatsOverlay.id = 'player-stats-overlay';
            playerStatsOverlay.className = 'stats-overlay';
            
            // Try to find the battle container
            const battleContainer = document.getElementById('battle-container');
            if (battleContainer) {
                battleContainer.appendChild(playerStatsOverlay);
            } else {
                document.body.appendChild(playerStatsOverlay);
            }
        }
        
        // Check if the XP stat section exists
        let expStatSection = playerStatsOverlay.querySelector('.overlay-stat:last-child');
        if (!expStatSection || !expStatSection.querySelector('.overlay-stat-label span:first-child')?.textContent.includes('XP')) {
            console.log('Creating XP stat section');
            
            // Create new XP stat section
            expStatSection = document.createElement('div');
            expStatSection.className = 'overlay-stat';
            expStatSection.innerHTML = `
                <div class="overlay-stat-label">
                    <span>XP</span>
                    <span id="player-exp-text"><span id="exp-current-value">0</span>/<span id="exp-next-value">100</span></span>
                </div>
                <div class="overlay-bar">
                    <div id="player-exp-fill" class="overlay-bar-fill overlay-exp-fill" style="width: 0%;"></div>
                </div>
            `;
            
            playerStatsOverlay.appendChild(expStatSection);
        }
        
        // Check if player level is shown in the overlay name
        const overlayName = playerStatsOverlay.querySelector('.overlay-name');
        if (!overlayName) {
            console.log('Creating player name and level display');
            
            const nameElement = document.createElement('div');
            nameElement.className = 'overlay-name';
            nameElement.innerHTML = 'Your Wizard - Level <span id="player-level">1</span>';
            
            playerStatsOverlay.insertBefore(nameElement, playerStatsOverlay.firstChild);
        } else if (!overlayName.querySelector('#player-level')) {
            console.log('Adding level display to player name');
            overlayName.innerHTML = 'Your Wizard - Level <span id="player-level">1</span>';
        }
        
        console.log('Experience bar elements created successfully');
        
        // Update display immediately
        setTimeout(() => this.updatePlayerProgressDisplay(), 100);
    }
    
    /**
     * Calculate experience required for the next level
     * @param {number} currentLevel - Current player level
     * @returns {number} Experience points needed for next level
     */
    calculateExpToNextLevel(currentLevel) {
        // Simple exponential experience curve
        return Math.floor(100 * Math.pow(1.5, currentLevel - 1));
    }
}

export default PlayerManager;
