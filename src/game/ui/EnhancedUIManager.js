// Enhanced UI Manager for Wizard's Choice
// Handles all UI interactions, updates, and visual elements

class EnhancedUIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.screens = [
            'loading-screen',
            'main-menu',
            'settings-screen',
            'game-ui',
            'game-over',
            'results-screen'
        ];
        this.activeAnimations = [];
        this.uiElements = {};
        this.initialized = false;
        this.container = document.getElementById('game-container');
    }
    
    async init() {
        console.log('Initializing EnhancedUIManager');
        return new Promise((resolve, reject) => {
            // Wait a short time to ensure DOM is fully loaded
            setTimeout(() => {
                try {
                    console.log('Dom should be ready, looking for UI elements');
                    // Try to find all the required UI elements
                    this.screens.forEach(screenId => {
                        const element = document.getElementById(screenId);
                        if (element) {
                            console.log(`Found UI element: ${screenId}`);
                            this.uiElements[screenId] = element;
                        } else {
                            console.warn(`UI element not found: ${screenId}`);
                        }
                    });
                    
                    // Log all found and missing elements
                    console.log('Found UI elements:', Object.keys(this.uiElements));
                    const missingElements = this.screens.filter(id => !this.uiElements[id]);
                    if (missingElements.length > 0) {
                        console.warn('Missing UI elements:', missingElements);
                    }
                    
                    // Check if main container exists
                    const gameContainer = document.getElementById('game-container');
                    if (gameContainer) {
                        console.log('Game container found');
                        console.log('Game container children:', gameContainer.children.length);
                        // Log the HTML structure for debugging
                        console.log('Game container HTML:', gameContainer.innerHTML.substring(0, 200) + '...');
                    } else {
                        console.error('Game container not found!');
                    }
                    
                    // Continue with initialization
                    this.cacheUIElements();
                    this.setupEventListeners();
                    this.setupResponsiveHandlers();
                    this.hideAllScreens();
                    this.initialized = true;
                    console.log('EnhancedUIManager initialization complete');
                    
                    // Resolve the promise to signal completion
                    resolve(true);
                } catch (error) {
                    console.error('Error initializing UI manager:', error);
                    // Even if there's an error, try to mark as initialized to prevent blocking
                    this.initialized = true;
                    reject(error);
                }
            }, 200); // Longer timeout to ensure DOM is ready
        });
    }
    
    cacheUIElements() {
        // Cache screen elements
        this.screens.forEach(screenId => {
            const element = document.getElementById(screenId);
            if (element) {
                this.uiElements[screenId] = element;
                console.log(`Found screen element: ${screenId}`);
            } else {
                console.warn(`Screen element not found: ${screenId}. Will try again later.`);
            }
        });
        
        // Cache player and opponent info elements
        this.tryGetElement('playerHealth', 'player-health');
        this.tryGetElement('playerMana', 'player-mana');
        this.tryGetElement('opponentHealth', 'opponent-health');
        this.tryGetElement('opponentMana', 'opponent-mana');
        
        // Cache battle elements
        this.tryGetElement('battleScene', 'battle-scene');
        this.tryGetElement('spellChoices', 'spell-choices');
        this.tryGetElement('spellButtons', 'spell-buttons');
        this.tryGetElement('battleLog', 'battle-log');
        
        // Cache game stats elements
        this.tryGetElement('turnCounter', 'turn-counter');
        this.tryGetElement('spellsCast', 'spells-cast');
        
        // Cache return to menu button
        this.tryGetElement('returnToMenuBtn', 'return-to-menu-btn');
        
        // Log all found UI elements
        console.log('Cached UI elements:', Object.keys(this.uiElements));
    }
    
    tryGetElement(propertyName, elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            this.uiElements[propertyName] = element;
            console.log(`Found UI element: ${elementId}`);
            return true;
        } else {
            console.warn(`UI element not found: ${elementId}`);
            return false;
        }
    }
    
    setupEventListeners() {
        // Add hover effects for buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.playButtonHoverEffect(button);
            });
        });
    }
    
    setupResponsiveHandlers() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Initial resize handling
        this.handleResize();
    }
    
    handleResize() {
        // Adjust UI based on screen size
        const width = window.innerWidth;
        
        if (width < 768) {
            // Mobile layout adjustments
            document.body.classList.add('mobile');
            document.body.classList.remove('desktop');
        } else {
            // Desktop layout adjustments
            document.body.classList.add('desktop');
            document.body.classList.remove('mobile');
        }
    }
    
    showScreen(screenId) {
        console.log(`Attempting to show screen: ${screenId}`);
        const screen = this.uiElements[screenId] || document.getElementById(screenId);
        
        if (screen) {
            console.log(`Found screen element: ${screenId}, adding 'active' class and removing 'hidden' class`);
            
            // First hide all screens
            this.hideAllScreens();
            
            // Then show the requested screen
            screen.classList.remove('hidden');
            screen.classList.add('active');
            
            // Check if the classes were actually modified (debugging)
            setTimeout(() => {
                console.log(`Screen ${screenId} has classes: ${screen.className}`);
                if (!screen.classList.contains('active')) {
                    console.warn(`Failed to add 'active' class to ${screenId}`);
                } else {
                    console.log(`Successfully showed screen: ${screenId}`);
                }
            }, 0);
        } else {
            console.error(`Screen element not found: ${screenId}`);
        }
    }
    
    returnToMainMenu() {
        console.log('Returning to main menu');
        this.hideAllScreens();
        this.showScreen('main-menu');
    }
    
    hideScreen(screenId) {
        console.log(`Attempting to hide screen: ${screenId}`);
        const screen = this.uiElements[screenId] || document.getElementById(screenId);
        
        if (screen) {
            console.log(`Found screen element: ${screenId}, removing 'active' class and adding 'hidden' class`);
            screen.classList.add('hidden');
            screen.classList.remove('active');
            
            // Check if the classes were actually modified (debugging)
            setTimeout(() => {
                console.log(`Screen ${screenId} has classes: ${screen.className}`);
                if (screen.classList.contains('active')) {
                    console.warn(`Failed to remove 'active' class from ${screenId}`);
                } else {
                    console.log(`Successfully hid screen: ${screenId}`);
                }
            }, 0);
        } else {
            console.error(`Screen element not found: ${screenId}`);
        }
    }
    
    hideAllScreens() {
        console.log('Hiding all screens');
        this.screens.forEach(screenId => {
            this.hideScreen(screenId);
        });
    }
    
    updatePlayerInfo(player) {
        if (!this.uiElements.playerHealth || !this.uiElements.playerMana) return;
        
        // Ensure player has maxHealth and maxMana properties
        if (player.maxHealth === undefined) player.maxHealth = 100;
        if (player.maxMana === undefined) player.maxMana = 100;
        
        // Calculate health and mana percentages
        const healthPercentage = Math.max(0, Math.min(100, (player.health / player.maxHealth) * 100));
        const manaPercentage = Math.max(0, Math.min(100, (player.mana / player.maxMana) * 100));
        
        // Update health display
        const healthFill = this.uiElements.playerHealth.querySelector('.health-fill');
        const healthText = this.uiElements.playerHealth.querySelector('.health-text');
        
        if (healthFill) healthFill.style.width = `${healthPercentage}%`;
        if (healthText) healthText.textContent = `${player.health}/${player.maxHealth}`;
        
        // Update mana display
        const manaFill = this.uiElements.playerMana.querySelector('.mana-fill');
        const manaText = this.uiElements.playerMana.querySelector('.mana-text');
        
        if (manaFill) manaFill.style.width = `${manaPercentage}%`;
        if (manaText) manaText.textContent = `${player.mana}/${player.maxMana}`;
        
        // Add pulse animation if health is low
        if (healthFill && healthPercentage < 25) {
            healthFill.classList.add('pulse-animation');
        } else if (healthFill) {
            healthFill.classList.remove('pulse-animation');
        }
    }
    
    updateOpponentInfo(opponent) {
        if (!this.uiElements.opponentHealth || !this.uiElements.opponentMana) return;
        
        // Ensure opponent has maxHealth and maxMana properties
        if (opponent.maxHealth === undefined) opponent.maxHealth = 100;
        if (opponent.maxMana === undefined) opponent.maxMana = 100;
        
        // Calculate health and mana percentages
        const healthPercentage = Math.max(0, Math.min(100, (opponent.health / opponent.maxHealth) * 100));
        const manaPercentage = Math.max(0, Math.min(100, (opponent.mana / opponent.maxMana) * 100));
        
        // Update health display
        const healthFill = this.uiElements.opponentHealth.querySelector('.health-fill');
        const healthText = this.uiElements.opponentHealth.querySelector('.health-text');
        
        if (healthFill) healthFill.style.width = `${healthPercentage}%`;
        if (healthText) healthText.textContent = `${opponent.health}/${opponent.maxHealth}`;
        
        // Update mana display
        const manaFill = this.uiElements.opponentMana.querySelector('.mana-fill');
        const manaText = this.uiElements.opponentMana.querySelector('.mana-text');
        
        if (manaFill) manaFill.style.width = `${manaPercentage}%`;
        if (manaText) manaText.textContent = `${opponent.mana}/${opponent.maxMana}`;
        
        // Add pulse animation if health is low
        if (healthFill && healthPercentage < 25) {
            healthFill.classList.add('pulse-animation');
        } else if (healthFill) {
            healthFill.classList.remove('pulse-animation');
        }
    }
    
    displaySpellChoices(spells, onSpellSelected) {
        if (!this.uiElements.spellButtons) {
            console.error('Spell buttons container not found');
            return;
        }
        
        // Clear existing spell buttons
        this.uiElements.spellButtons.innerHTML = '';
        
        // Create buttons for each spell
        spells.forEach((spell, index) => {
            // Skip if spell is undefined
            if (!spell) return;
            
            // Determine spell element class based on type
            let spellClass = 'spell-button';
            if (spell.type) {
                spellClass += ` ${spell.type.toLowerCase()}`;
            }
            
            // Create spell button
            const spellButton = document.createElement('button');
            spellButton.className = spellClass;
            spellButton.innerHTML = `
                <div class="spell-name">${spell.name || 'Unknown Spell'}</div>
                <div class="spell-cost">Mana: ${spell.manaCost || '?'}</div>
                <div class="spell-description">${spell.description || 'No description available'}</div>
            `;
            
            // Add click event
            spellButton.addEventListener('click', () => {
                // Highlight selected spell
                this.highlightSelectedSpell(spellButton);
                
                // Call the callback with spell index
                if (typeof onSpellSelected === 'function') {
                    onSpellSelected(index);
                }
            });
            
            // Add to container
            this.uiElements.spellButtons.appendChild(spellButton);
        });
        
        // If no spells were added, show a message
        if (this.uiElements.spellButtons.children.length === 0) {
            this.uiElements.spellButtons.innerHTML = '<div class="no-spells">No spells available</div>';
        }
    }
    
    highlightSelectedSpell(selectedButton) {
        // Remove highlight from all spell buttons
        if (this.uiElements.spellButtons) {
            const buttons = this.uiElements.spellButtons.querySelectorAll('.spell-button');
            buttons.forEach(button => {
                button.classList.remove('selected');
            });
        }
        
        // Add highlight to selected button
        if (selectedButton) {
            selectedButton.classList.add('selected');
        }
    }
    
    addToBattleLog(message) {
        if (!this.uiElements.battleLog) {
            console.error('Battle log element not found');
            return;
        }
        
        // Create log entry
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = message;
        
        // Add to battle log
        this.uiElements.battleLog.appendChild(logEntry);
        
        // Scroll to bottom
        this.uiElements.battleLog.scrollTop = this.uiElements.battleLog.scrollHeight;
    }
    
    clearBattleLog() {
        if (this.uiElements.battleLog) {
            this.uiElements.battleLog.innerHTML = '';
        }
    }
    
    // Generic method to display any type of choices
    displayChoices(choices, onChoiceSelected) {
        const choicesContainer = this.uiElements.spellChoices;
        
        if (!choicesContainer) return;
        
        // Clear previous choices
        choicesContainer.innerHTML = '';
        
        // Create buttons for each choice with staggered animation
        choices.forEach((choice, index) => {
            const choiceButton = document.createElement('button');
            choiceButton.classList.add('choice-button');
            choiceButton.style.animationDelay = `${index * 0.1}s`;
            
            // Show choice name and description
            choiceButton.innerHTML = `
                <div class="choice-name">${choice.name}</div>
                <div class="choice-description">${choice.description}</div>
            `;
            
            // Add click event
            choiceButton.addEventListener('click', () => {
                // Add selection animation
                this.animateChoiceSelection(choiceButton);
                
                // Call the callback after animation
                setTimeout(() => {
                    onChoiceSelected(index);
                }, 300);
            });
            
            // Disable button if choice is disabled
            if (choice.disabled) {
                choiceButton.disabled = true;
                choiceButton.classList.add('disabled');
            }
            
            choicesContainer.appendChild(choiceButton);
        });
        
        // Add entrance animation to container
        choicesContainer.classList.add('choices-enter');
        setTimeout(() => {
            choicesContainer.classList.remove('choices-enter');
        }, 500);
    }
    
    clearChoices() {
        const choicesContainer = this.uiElements.spellChoices;
        
        if (!choicesContainer) return;
        
        // Add exit animation
        choicesContainer.classList.add('choices-exit');
        
        // Clear after animation
        setTimeout(() => {
            choicesContainer.innerHTML = '';
            choicesContainer.classList.remove('choices-exit');
        }, 300);
    }
    
    updateBattleLog(message) {
        const battleLog = this.uiElements.battleLog;
        
        if (!battleLog) return;
        
        const logEntry = document.createElement('div');
        logEntry.classList.add('log-entry');
        logEntry.textContent = message;
        
        // Add entrance animation
        logEntry.classList.add('log-entry-new');
        
        battleLog.appendChild(logEntry);
        
        // Remove animation class after animation completes
        setTimeout(() => {
            logEntry.classList.remove('log-entry-new');
        }, 500);
        
        // Auto-scroll to bottom
        battleLog.scrollTop = battleLog.scrollHeight;
    }
    
    // Animation methods
    animateSpellSelection(spellButton) {
        spellButton.classList.add('spell-selected');
        
        // Play selection sound
        // this.audioManager.playSound('spell_select');
    }
    
    animateChoiceSelection(choiceButton) {
        choiceButton.classList.add('choice-selected');
        
        // Play selection sound
        // this.audioManager.playSound('menu_select');
    }
    
    playButtonHoverEffect(button) {
        button.classList.add('button-hover');
        
        // Remove class after animation completes
        setTimeout(() => {
            button.classList.remove('button-hover');
        }, 300);
        
        // Play hover sound
        // this.audioManager.playSound('menu_hover');
    }
    
    // Show a notification message
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.classList.add('notification', `notification-${type}`);
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Add entrance animation
        setTimeout(() => {
            notification.classList.add('notification-show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('notification-show');
            notification.classList.add('notification-hide');
            
            // Remove from DOM after exit animation
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    // Show spell effect animation
    showSpellEffect(spellType, targetElement) {
        const effect = document.createElement('div');
        effect.classList.add('spell-effect', `${spellType.toLowerCase()}-effect`);
        
        targetElement.appendChild(effect);
        
        // Remove after animation completes
        setTimeout(() => {
            targetElement.removeChild(effect);
        }, 1000);
    }
    
    // Update game over screen with results
    updateGameOverScreen(result) {
        if (!this.uiElements.resultMessage || !this.uiElements.battleStats) return;
        
        // Set result message with animation
        this.uiElements.resultMessage.textContent = result.playerWon ? 'Victory!' : 'Defeat!';
        this.uiElements.resultMessage.classList.add(result.playerWon ? 'victory-text' : 'defeat-text');
        
        // Display battle stats with animation
        this.uiElements.battleStats.innerHTML = `
            <p class="stat-item stat-turns">Turns: ${result.turns}</p>
            <p class="stat-item stat-player-health">Your remaining health: ${result.playerHealth}</p>
            <p class="stat-item stat-opponent-health">Opponent remaining health: ${result.opponentHealth}</p>
        `;
        
        // Add staggered animation to stats
        const statItems = this.uiElements.battleStats.querySelectorAll('.stat-item');
        statItems.forEach((item, index) => {
            item.style.animationDelay = `${0.5 + index * 0.2}s`;
            item.classList.add('stat-item-enter');
        });
        
        // If player won and unlocked a new spell, show it
        if (result.playerWon && result.newSpell) {
            const newSpellElement = document.createElement('p');
            newSpellElement.classList.add('new-spell', 'stat-item');
            newSpellElement.textContent = `New spell unlocked: ${result.newSpell.name}!`;
            newSpellElement.style.animationDelay = `${0.5 + statItems.length * 0.2}s`;
            newSpellElement.classList.add('stat-item-enter');
            
            this.uiElements.battleStats.appendChild(newSpellElement);
        }
    }
}

export default EnhancedUIManager;
