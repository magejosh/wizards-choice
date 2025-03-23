// UI Element Manager for Wizard's Choice
// Handles UI element creation and updating

class UIElementManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.uiElements = {};
        this.initialized = false;
    }
    
    async init() {
        console.log('Initializing UIElementManager');
        try {
            this.cacheUIElements();
            this.initialized = true;
            console.log('UIElementManager initialization complete');
            return true;
        } catch (error) {
            console.error('Error initializing UI Element manager:', error);
            this.initialized = true; // Mark as initialized even if there's an error to prevent blocking
            throw error;
        }
    }
    
    cacheUIElements() {
        // Cache player and opponent info elements
        this.tryGetElement('playerHealth', 'player-health');
        this.tryGetElement('playerMana', 'player-mana');
        this.tryGetElement('opponentHealth', 'opponent-health');
        this.tryGetElement('opponentMana', 'opponent-mana');
        
        // Cache battle elements
        this.tryGetElement('battleScene', 'battle-scene');
        this.tryGetElement('spellChoices', 'spell-choices');
        this.tryGetElement('spellButtons', 'spell-choices'); // Use spell-choices instead of spell-buttons
        this.tryGetElement('battleLog', 'battle-log');
        
        // Cache game stats elements
        this.tryGetElement('turnCounter', 'turn-counter');
        this.tryGetElement('spellsCast', 'spells-cast');
        
        // Cache return to menu button
        this.tryGetElement('returnToMenuBtn', 'return-to-menu-btn');
        
        // Cache menu button
        this.tryGetElement('menuButton', 'menu-btn');
        
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
        
        // Update health label and header
        const healthLabel = this.uiElements.playerHealth.querySelector('.health-label');
        if (!healthLabel) {
            // Create the header structure if it doesn't exist
            const healthBarContainer = this.uiElements.playerHealth.querySelector('.health-bar-container');
            if (healthBarContainer && healthBarContainer.previousElementSibling && healthBarContainer.previousElementSibling.classList.contains('health-label')) {
                // Convert simple label to header structure
                const existingLabel = healthBarContainer.previousElementSibling;
                const headerHTML = `
                <div class="bar-header">
                    <span class="bar-label">Health</span>
                    <span class="bar-value">${player.health}/${player.maxHealth}</span>
                </div>`;
                existingLabel.insertAdjacentHTML('afterend', headerHTML);
                existingLabel.remove();
            }
        } else {
            // Update existing value if it's already in the header format
            const healthValue = this.uiElements.playerHealth.querySelector('.bar-value');
            if (healthValue) {
                healthValue.textContent = `${player.health}/${player.maxHealth}`;
            }
        }
        
        if (healthFill) healthFill.style.width = `${healthPercentage}%`;
        if (healthText) healthText.textContent = `${player.health}/${player.maxHealth}`;
        
        // Update mana display
        const manaFill = this.uiElements.playerMana.querySelector('.mana-fill');
        const manaText = this.uiElements.playerMana.querySelector('.mana-text');
        
        // Update mana label and header
        const manaLabel = this.uiElements.playerMana.querySelector('.mana-label');
        if (!manaLabel) {
            // Create the header structure if it doesn't exist
            const manaBarContainer = this.uiElements.playerMana.querySelector('.mana-bar-container');
            if (manaBarContainer && manaBarContainer.previousElementSibling && manaBarContainer.previousElementSibling.classList.contains('mana-label')) {
                // Convert simple label to header structure
                const headerHTML = `
                <div class="bar-header">
                    <span class="bar-label">Mana</span>
                    <span class="bar-value">${player.mana}/${player.maxMana}</span>
                </div>`;
                manaBarContainer.insertAdjacentHTML('beforebegin', headerHTML);
            }
        } else {
            // Update existing value if it's already in the header format
            const manaValue = this.uiElements.playerMana.querySelector('.bar-value');
            if (manaValue) {
                manaValue.textContent = `${player.mana}/${player.maxMana}`;
            }
        }
        
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
        
        // Update health header values
        const healthValue = this.uiElements.opponentHealth.querySelector('.bar-value');
        if (healthValue) {
            healthValue.textContent = `${opponent.health}/${opponent.maxHealth}`;
        }
        
        if (healthFill) healthFill.style.width = `${healthPercentage}%`;
        if (healthText) healthText.textContent = `${opponent.health}/${opponent.maxHealth}`;
        
        // Update mana display
        const manaFill = this.uiElements.opponentMana.querySelector('.mana-fill');
        const manaText = this.uiElements.opponentMana.querySelector('.mana-text');
        
        // Update mana header values
        const manaValue = this.uiElements.opponentMana.querySelector('.bar-value');
        if (manaValue) {
            manaValue.textContent = `${opponent.mana}/${opponent.maxMana}`;
        }
        
        if (manaFill) manaFill.style.width = `${manaPercentage}%`;
        if (manaText) manaText.textContent = `${opponent.mana}/${opponent.maxMana}`;
        
        // Update name with difficulty
        const opponentName = document.querySelector('.opponent-name');
        if (opponentName && opponent.difficulty) {
            const difficultyText = opponent.difficulty.charAt(0).toUpperCase() + opponent.difficulty.slice(1);
            opponentName.textContent = `${difficultyText} Enemy Wizard`;
        }
        
        // Update difficulty display
        const difficultyValue = document.querySelector('.difficulty-value');
        if (difficultyValue && opponent.difficulty) {
            difficultyValue.textContent = opponent.difficulty.charAt(0).toUpperCase() + opponent.difficulty.slice(1);
        }
    }
    
    displaySpellChoices(spells, onSpellSelected) {
        if (!this.uiElements.spellButtons) {
            console.error('Spell buttons container not found');
            return;
        }
        
        // Clear existing spell buttons
        this.uiElements.spellButtons.innerHTML = '';
        
        // Create a row container for horizontal layout
        const spellRow = document.createElement('div');
        spellRow.className = 'spell-row';
        spellRow.style.display = 'flex';
        spellRow.style.flexDirection = 'row';
        spellRow.style.flexWrap = 'wrap';
        spellRow.style.justifyContent = 'center';
        spellRow.style.gap = '10px';
        spellRow.style.width = '100%';
        
        // Create buttons for each spell
        spells.forEach((spell, index) => {
            // Skip if spell is undefined
            if (!spell) return;
            
            // Create spell button
            const spellButton = document.createElement('div');
            spellButton.className = 'spell-card';
            
            // Add spell type class for background color
            if (spell.type) {
                spellButton.classList.add(spell.type.toLowerCase());
            } else if (spell.element) {
                spellButton.classList.add(spell.element.toLowerCase());
            }
            
            spellButton.style.margin = '5px';
            spellButton.style.flex = '0 1 auto';
            spellButton.style.width = '180px';
            spellButton.style.minHeight = '180px';
            spellButton.style.display = 'flex';
            spellButton.style.flexDirection = 'column';
            spellButton.style.alignItems = 'center';
            spellButton.style.padding = '10px'; 
            spellButton.style.textAlign = 'center';
            spellButton.style.position = 'relative';
            spellButton.style.borderRadius = '8px';
            spellButton.style.cursor = 'pointer';
            spellButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
            
            // Header section (name and mana cost)
            const headerDiv = document.createElement('div');
            headerDiv.style.width = '100%';
            headerDiv.style.marginBottom = '0px'; 
            
            // Create title at the top
            const titleDiv = document.createElement('div');
            titleDiv.className = 'spell-name';
            titleDiv.style.fontWeight = 'bold';
            titleDiv.style.fontSize = '1.1rem';
            titleDiv.style.color = '#ffffff';
            titleDiv.style.marginBottom = '0px'; 
            titleDiv.textContent = spell.name || 'Unknown Spell';
            
            // Add mana cost display
            const manaDiv = document.createElement('div');
            manaDiv.className = 'spell-cost';
            manaDiv.style.color = '#a0a0ff';
            manaDiv.style.fontSize = '0.9rem';
            manaDiv.style.marginTop = '0px'; 
            manaDiv.style.marginBottom = '1px'; 
            manaDiv.textContent = `Mana: ${spell.manaCost || '?'}`;
            
            headerDiv.appendChild(titleDiv);
            headerDiv.appendChild(manaDiv);
            
            // Add spell image
            const spellImg = document.createElement('img');
            spellImg.src = 'https://i.imgur.com/1L99sG0.png';
            spellImg.alt = spell.name || 'Spell';
            spellImg.style.width = '81%'; 
            spellImg.style.maxWidth = '145px'; 
            spellImg.style.height = 'auto'; 
            spellImg.style.borderRadius = '5px';
            spellImg.style.marginTop = '1px'; 
            spellImg.style.marginBottom = '1px'; 
            
            // Add spell description below image
            const descDiv = document.createElement('div');
            descDiv.className = 'spell-description';
            descDiv.style.fontSize = '0.8rem';
            descDiv.style.color = '#ddddff';
            descDiv.style.lineHeight = '1.1'; 
            descDiv.style.width = '100%';
            descDiv.style.marginTop = '1px'; 
            descDiv.style.wordWrap = 'break-word'; 
            descDiv.style.overflow = 'hidden'; 
            descDiv.style.maxHeight = '40px'; 
            descDiv.textContent = spell.description || 'No description available';
            
            // Add effects section at the bottom
            const effectsDiv = document.createElement('div');
            effectsDiv.className = 'spell-effects';
            effectsDiv.style.marginTop = '1px'; 
            effectsDiv.style.fontSize = '0.8rem';
            effectsDiv.style.color = '#ffdd99';
            effectsDiv.style.width = '100%';
            effectsDiv.style.fontStyle = 'italic';
            
            // Format spell effects
            let effectsText = '';
            if (spell.damage) effectsText += `Damage: ${spell.damage} `;
            if (spell.heal) effectsText += `Heal: ${spell.heal} `;
            if (spell.healing) effectsText += `Heal: ${spell.healing} `; 
            if (spell.shield) effectsText += `Shield: ${spell.shield} `;
            if (spell.dot) effectsText += `DoT: ${spell.dot} `;
            if (spell.manaRestore) effectsText += `Mana: +${spell.manaRestore} `;
            if (!effectsText) effectsText = 'No effects';
            
            effectsDiv.textContent = effectsText;
            
            // Append elements to button in correct order
            spellButton.appendChild(headerDiv);
            spellButton.appendChild(spellImg);
            spellButton.appendChild(descDiv);
            spellButton.appendChild(effectsDiv);
            
            // Add tooltip for complete information
            spellButton.title = `${spell.name}: ${spell.description}\n${effectsText}`;
            
            // Add click event
            spellButton.addEventListener('click', () => {
                // Highlight selected spell
                this.highlightSelectedSpell(spellButton);
                
                // Call the callback with spell index
                if (typeof onSpellSelected === 'function') {
                    onSpellSelected(index);
                }
            });
            
            // Add to row container
            spellRow.appendChild(spellButton);
        });
        
        // Add the row to the container
        this.uiElements.spellButtons.appendChild(spellRow);
        
        // If no spells were added, show a message
        if (spellRow.children.length === 0) {
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
    
    updateBattleInfo(gameState) {
        if (!gameState) {
            console.error('No game state provided to updateBattleInfo');
            return;
        }
        
        // Update turn counter
        const turnCounter = document.getElementById('turn-counter');
        if (turnCounter) {
            turnCounter.textContent = gameState.currentTurn || 1;
        }
        
        // Update spells cast counter
        const spellsCast = document.getElementById('spells-cast');
        if (spellsCast) {
            spellsCast.textContent = gameState.spellsCast || 0;
        }
        
        // Update last action text
        const lastAction = document.getElementById('last-action');
        if (lastAction && gameState.lastAction) {
            lastAction.textContent = gameState.lastAction;
        }
        
        console.log('Updated battle info:', {
            turn: gameState.currentTurn,
            spellsCast: gameState.spellsCast,
            lastAction: gameState.lastAction
        });
    }
}

export default UIElementManager;
