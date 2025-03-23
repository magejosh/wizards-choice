// PlayerManager.js - Handles player state and actions

export class PlayerManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
    }

    // Handle player casting a spell
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
            
            // Update UI to show changes immediately
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
            }, 1000);
            
        } catch (error) {
            console.error('Error in player cast spell:', error);
            gameState.battleLog.push('Error occurred while casting spell');
            this.gameStateManager.updateBattleUI();
            gameState.isProcessingTurn = false;
        }
    }
    
    // Show spell selection screen before battle
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
    
    // Update UI to display player progression information
    updatePlayerProgressDisplay() {
        // Check if progression system is initialized
        if (!this.gameStateManager.progressionSystem) {
            console.warn('Cannot update player progress display: progression system not initialized');
            return;
        }
        
        // Get player progress
        const playerProgress = this.gameStateManager.progressionSystem.getPlayerProgress();
        
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
            const unlockedSpells = this.gameStateManager.spellSystem.getPlayerUnlockedSpells();
            playerSpellsCountElement.textContent = unlockedSpells.length;
        }
        
        // Update experience bar
        const expBarFill = document.getElementById('exp-bar-fill');
        const expCurrentElement = document.getElementById('exp-current-value');
        const expNextElement = document.getElementById('exp-next-value');
        
        if (expBarFill && expCurrentElement && expNextElement) {
            const currentExp = playerProgress.experience;
            const expForCurrentLevel = this.gameStateManager.progressionSystem.getExpForLevel(playerProgress.level);
            const expForNextLevel = this.gameStateManager.progressionSystem.getExpForLevel(playerProgress.level + 1);
            const expNeeded = expForNextLevel - expForCurrentLevel;
            const currentLevelExp = currentExp - expForCurrentLevel;
            const percentage = (currentLevelExp / expNeeded) * 100;
            
            // Update the fill width
            expBarFill.style.width = `${percentage}%`;
            
            // Update the text values
            expCurrentElement.textContent = currentLevelExp;
            expNextElement.textContent = expNeeded;
        }
    }
}

export default PlayerManager;
