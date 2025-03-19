// Enhanced UI Manager for Wizard's Choice
// Handles all UI interactions, updates, and visual elements

export class EnhancedUIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.screens = [
            'loading-screen',
            'main-menu',
            'game-ui',
            'game-over'
        ];
        this.activeAnimations = [];
        this.uiElements = {};
    }
    
    init() {
        console.log('Initializing Enhanced UI Manager...');
        
        // Cache UI elements for faster access
        this.cacheUIElements();
        
        // Add event listeners for UI interactions
        this.setupEventListeners();
        
        // Add responsive design handlers
        this.setupResponsiveHandlers();
        
        console.log('Enhanced UI Manager initialized');
        return Promise.resolve();
    }
    
    cacheUIElements() {
        // Cache screen elements
        this.screens.forEach(screenId => {
            this.uiElements[screenId] = document.getElementById(screenId);
        });
        
        // Cache player and opponent info elements
        this.uiElements.playerHealth = document.getElementById('player-health');
        this.uiElements.playerMana = document.getElementById('player-mana');
        this.uiElements.opponentHealth = document.getElementById('opponent-health');
        this.uiElements.opponentMana = document.getElementById('opponent-mana');
        
        // Cache battle elements
        this.uiElements.battleScene = document.getElementById('battle-scene');
        this.uiElements.spellChoices = document.getElementById('spell-choices');
        this.uiElements.battleLog = document.getElementById('battle-log');
        
        // Cache game over elements
        this.uiElements.resultMessage = document.getElementById('result-message');
        this.uiElements.battleStats = document.getElementById('battle-stats');
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
        const screen = this.uiElements[screenId];
        if (screen) {
            // Add entrance animation
            screen.classList.remove('hidden');
            screen.classList.add('screen-enter');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                screen.classList.remove('screen-enter');
            }, 500);
        } else {
            console.error(`Screen with ID ${screenId} not found`);
        }
    }
    
    hideScreen(screenId) {
        const screen = this.uiElements[screenId];
        if (screen) {
            // Add exit animation
            screen.classList.add('screen-exit');
            
            // Hide screen after animation completes
            setTimeout(() => {
                screen.classList.add('hidden');
                screen.classList.remove('screen-exit');
            }, 500);
        } else {
            console.error(`Screen with ID ${screenId} not found`);
        }
    }
    
    hideAllScreens() {
        this.screens.forEach(screenId => {
            this.hideScreen(screenId);
        });
    }
    
    updatePlayerInfo(player) {
        if (!this.uiElements.playerHealth || !this.uiElements.playerMana) return;
        
        // Create health bar with animation
        const healthPercentage = (player.health / player.maxHealth) * 100;
        this.uiElements.playerHealth.innerHTML = `
            <h3>Health: ${player.health}/${player.maxHealth}</h3>
            <div class="health-bar">
                <div class="health-fill" style="width: ${healthPercentage}%"></div>
            </div>
        `;
        
        // Create mana bar with animation
        const manaPercentage = (player.mana / player.maxMana) * 100;
        this.uiElements.playerMana.innerHTML = `
            <h3>Mana: ${player.mana}/${player.maxMana}</h3>
            <div class="mana-bar">
                <div class="mana-fill" style="width: ${manaPercentage}%"></div>
            </div>
        `;
        
        // Add pulse animation if health is low
        if (healthPercentage < 25) {
            const healthFill = this.uiElements.playerHealth.querySelector('.health-fill');
            healthFill.classList.add('pulse-animation');
        }
    }
    
    updateOpponentInfo(opponent) {
        if (!this.uiElements.opponentHealth || !this.uiElements.opponentMana) return;
        
        // Create health bar with animation
        const healthPercentage = (opponent.health / opponent.maxHealth) * 100;
        this.uiElements.opponentHealth.innerHTML = `
            <h3>Health: ${opponent.health}/${opponent.maxHealth}</h3>
            <div class="health-bar">
                <div class="health-fill" style="width: ${healthPercentage}%"></div>
            </div>
        `;
        
        // Create mana bar with animation
        const manaPercentage = (opponent.mana / opponent.maxMana) * 100;
        this.uiElements.opponentMana.innerHTML = `
            <h3>Mana: ${opponent.mana}/${opponent.maxMana}</h3>
            <div class="mana-bar">
                <div class="mana-fill" style="width: ${manaPercentage}%"></div>
            </div>
        `;
        
        // Add pulse animation if health is low
        if (healthPercentage < 25) {
            const healthFill = this.uiElements.opponentHealth.querySelector('.health-fill');
            healthFill.classList.add('pulse-animation');
        }
    }
    
    displaySpellChoices(spells, onSpellSelected) {
        const spellChoicesContainer = this.uiElements.spellChoices;
        
        if (!spellChoicesContainer) return;
        
        // Clear previous choices
        spellChoicesContainer.innerHTML = '';
        
        // Create buttons for each spell with staggered animation
        spells.forEach((spell, index) => {
            const spellButton = document.createElement('button');
            spellButton.classList.add('spell-button');
            spellButton.classList.add(spell.type.toLowerCase());
            spellButton.style.animationDelay = `${index * 0.1}s`;
            
            // Show spell name and mana cost
            spellButton.innerHTML = `
                <div class="spell-icon ${spell.type.toLowerCase()}-icon"></div>
                <div class="spell-details">
                    <div class="spell-name">${spell.name}</div>
                    <div class="spell-cost">${spell.manaCost} Mana</div>
                </div>
            `;
            
            // Add tooltip with spell details
            spellButton.title = `${spell.name} (${spell.type}): ${spell.description}`;
            
            // Add click event
            spellButton.addEventListener('click', () => {
                // Add selection animation
                this.animateSpellSelection(spellButton);
                
                // Call the callback after animation
                setTimeout(() => {
                    onSpellSelected(index);
                }, 300);
            });
            
            // Disable button if not enough mana
            if (spell.manaCost > this.gameState.getPlayerData().mana) {
                spellButton.disabled = true;
                spellButton.classList.add('disabled');
            }
            
            spellChoicesContainer.appendChild(spellButton);
        });
        
        // Add entrance animation to container
        spellChoicesContainer.classList.add('choices-enter');
        setTimeout(() => {
            spellChoicesContainer.classList.remove('choices-enter');
        }, 500);
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
    
    clearBattleLog() {
        const battleLog = this.uiElements.battleLog;
        
        if (!battleLog) return;
        
        // Add fade-out animation to all entries
        const entries = battleLog.querySelectorAll('.log-entry');
        entries.forEach(entry => {
            entry.classList.add('log-entry-fade');
        });
        
        // Clear after animation
        setTimeout(() => {
            battleLog.innerHTML = '';
        }, 300);
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
