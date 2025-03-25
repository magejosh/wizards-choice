// UI Element Manager for Wizard's Choice
// Handles UI element creation and updating

/**
 * Manages UI element creation and updating
 */
class UIElementManager {
    /**
     * Create a UIElementManager instance
     * @param {Object} gameState - The current game state
     */
    constructor(gameState) {
        this.gameState = gameState;
        this.uiElements = {};
        this.initialized = false;
    }
    
    /**
     * Initialize the UI element manager
     * @returns {Promise<boolean>} Promise that resolves when initialization is complete
     */
    async init() {
        console.log('Initializing UIElementManager');
        
        // If already initialized, just return
        if (this.initialized) {
            console.log('UIElementManager already initialized');
            return true;
        }
        
        try {
            // Cache UI elements
            this.cacheUIElements();
            
            // Ensure we have the necessary methods
            if (!this.updatePlayerOverlay) {
                console.warn('UIElementManager missing updatePlayerOverlay method, adding it');
                this.updatePlayerOverlay = function(player) {
                    console.log('Default updatePlayerOverlay implementation called');
                    // Default implementation can be empty
                };
            }
            
            // Mark as initialized
            this.initialized = true;
            console.log('UIElementManager initialization complete');
            return true;
        } catch (error) {
            console.error('Error initializing UI Element manager:', error);
            this.initialized = true; // Mark as initialized even if there's an error to prevent blocking
            return false;
        }
    }
    
    /**
     * Cache references to UI elements
     */
    cacheUIElements() {
        // Cache player and opponent info elements
        this.tryGetElement('playerHealth', 'player-health');
        this.tryGetElement('playerMana', 'player-mana');
        this.tryGetElement('playerExperience', 'player-experience');
        this.tryGetElement('expBarFill', 'player-exp-fill');
        this.tryGetElement('expCurrentValue', 'exp-current-value');
        this.tryGetElement('expNextValue', 'exp-next-value');
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
    
    /**
     * Try to get a UI element by its ID
     * @param {string} propertyName - The property name to store the element under
     * @param {string} elementId - The ID of the element to retrieve
     * @returns {boolean} Whether the element was found
     */
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
    
    /**
     * Update the player info display
     * @param {Object} player - The player object with health and mana properties
     */
    updatePlayerInfo(player) {
        if (!player) {
            console.warn('No player data provided to updatePlayerInfo');
            return;
        }
        
        // Ensure player has maxHealth and maxMana properties
        if (player.maxHealth === undefined) player.maxHealth = 100;
        if (player.maxMana === undefined) player.maxMana = 100;
        
        // Ensure health and mana are integers to avoid decimal display
        const health = Math.round(player.health);
        const maxHealth = Math.round(player.maxHealth);
        const mana = Math.round(player.mana);
        const maxMana = Math.round(player.maxMana);
        
        // Calculate health and mana percentages
        const healthPercentage = Math.max(0, Math.min(100, (health / maxHealth) * 100));
        const manaPercentage = Math.max(0, Math.min(100, (mana / maxMana) * 100));
        
        // Get elements directly
        const playerHealthFill = document.querySelector('#player-health .health-fill');
        const playerHealthText = document.querySelector('#player-health .health-text');
        const playerManaFill = document.querySelector('#player-mana .mana-fill');
        const playerManaText = document.querySelector('#player-mana .mana-text');
        
        // Update health display
        if (playerHealthFill) {
            playerHealthFill.style.width = `${healthPercentage}%`;
        } else {
            console.error('Health fill element not found');
        }
        
        if (playerHealthText) {
            playerHealthText.textContent = `${health}/${maxHealth}`;
        } else {
            console.error('Health text element not found');
        }
        
        // Update mana display
        if (playerManaFill) {
            playerManaFill.style.width = `${manaPercentage}%`;
        } else {
            console.error('Mana fill element not found');
        }
        
        if (playerManaText) {
            playerManaText.textContent = `${mana}/${maxMana}`;
        } else {
            console.error('Mana text element not found');
        }
        
        // Also update experience bar
        this.updateExperienceBar(player);
    }
    
    /**
     * Update experience bar in the overlay
     * @param {Object} player - Player object with level and experience properties
     */
    updateExperienceBar(player) {
        // Check if the game UI is visible first
        const gameUI = document.getElementById('game-ui');
        if (!gameUI || gameUI.classList.contains('hidden')) {
            // Game UI is not visible yet, so we'll skip updating the experience bar
            return;
        }
        
        // Get experience bar overlay elements
        const expFill = document.getElementById('player-exp-fill');
        const expCurrentValue = document.getElementById('exp-current-value');
        const expNextValue = document.getElementById('exp-next-value');
        const playerLevelElement = document.getElementById('player-level');
        
        if (!expFill || !expCurrentValue || !expNextValue) {
            console.warn('Experience bar overlay elements not found, creating them');
            this.createExperienceBarElements();
            return;
        }
        
        // Get experience data from player
        const currentLevel = player.level || 1;
        const currentExp = player.experience || 0;
        
        // Calculate experience needed and earned in the current level
        const expNeededForNextLevel = this.calculateExpForNextLevel(currentLevel);
        const totalExpForCurrentLevel = this.calculateTotalExpForLevel(currentLevel);
        const currentLevelExp = currentExp - totalExpForCurrentLevel;
        
        // Calculate percentage of progress to next level
        const expPercentage = Math.max(0, Math.min(100, (currentLevelExp / expNeededForNextLevel) * 100));
        
        // Update the fill width
        expFill.style.width = `${expPercentage}%`;
        
        // Update the experience text
        expCurrentValue.textContent = Math.floor(currentLevelExp);
        expNextValue.textContent = expNeededForNextLevel;
        
        // Update player level if element exists
        if (playerLevelElement) {
            playerLevelElement.textContent = currentLevel;
        }
        
        console.log(`Updated player XP bar: ${Math.floor(currentLevelExp)}/${expNeededForNextLevel} (${expPercentage.toFixed(1)}%)`);
    }
    
    /**
     * Create experience bar overlay elements if they don't exist
     */
    createExperienceBarElements() {
        // Check if player stats overlay exists
        let playerStatsOverlay = document.getElementById('player-stats-overlay');
        
        if (!playerStatsOverlay) {
            console.warn('Player stats overlay not found, creating it');
            playerStatsOverlay = document.createElement('div');
            playerStatsOverlay.id = 'player-stats-overlay';
            playerStatsOverlay.className = 'stats-overlay';
            
            // Add it to the battle container
            const battleContainer = document.getElementById('battle-container');
            if (battleContainer) {
                battleContainer.appendChild(playerStatsOverlay);
            } else {
                document.body.appendChild(playerStatsOverlay);
            }
        }
        
        // Check if the name with level already exists
        let overlayName = playerStatsOverlay.querySelector('.overlay-name');
        if (!overlayName) {
            overlayName = document.createElement('div');
            overlayName.className = 'overlay-name';
            overlayName.innerHTML = 'Your Wizard - Level <span id="player-level">1</span>';
            playerStatsOverlay.appendChild(overlayName);
        }
        
        // Check if XP stat exists
        let expStat = Array.from(playerStatsOverlay.querySelectorAll('.overlay-stat'))
            .find(stat => stat.querySelector('.overlay-stat-label span')?.textContent === 'XP');
            
        if (!expStat) {
            expStat = document.createElement('div');
            expStat.className = 'overlay-stat';
            expStat.innerHTML = `
                <div class="overlay-stat-label">
                    <span>XP</span>
                    <span id="player-exp-text"><span id="exp-current-value">0</span>/<span id="exp-next-value">100</span></span>
                </div>
                <div class="overlay-bar">
                    <div id="player-exp-fill" class="overlay-bar-fill overlay-exp-fill" style="width: 0%;"></div>
                </div>
            `;
            playerStatsOverlay.appendChild(expStat);
        }
        
        console.log('Experience bar overlay elements created successfully');
    }
    
    /**
     * Update the opponent info display
     * @param {Object} opponent - The opponent object with health and mana properties
     */
    updateOpponentInfo(opponent) {
        if (!opponent) {
            console.warn('No opponent data provided to updateOpponentInfo');
            return;
        }
        
        // Update opponent name
        const opponentName = document.querySelector('.opponent-name');
        if (opponentName) {
            opponentName.textContent = opponent.name || 'Enemy Wizard';
        }
        
        // Ensure opponent has maxHealth and maxMana properties
        if (opponent.maxHealth === undefined) opponent.maxHealth = 100;
        if (opponent.maxMana === undefined) opponent.maxMana = 100;
        
        // Ensure health and mana are integers to avoid decimal display
        const health = Math.round(opponent.health);
        const maxHealth = Math.round(opponent.maxHealth);
        const mana = Math.round(opponent.mana);
        const maxMana = Math.round(opponent.maxMana);
        
        // Calculate health and mana percentages
        const healthPercentage = Math.max(0, Math.min(100, (health / maxHealth) * 100));
        const manaPercentage = Math.max(0, Math.min(100, (mana / maxMana) * 100));
        
        // Get elements directly
        const opponentHealthFill = document.querySelector('#opponent-health .health-fill');
        const opponentHealthText = document.querySelector('#opponent-health .health-text');
        const opponentManaFill = document.querySelector('#opponent-mana .mana-fill');
        const opponentManaText = document.querySelector('#opponent-mana .mana-text');
        
        // Update health display
        if (opponentHealthFill) {
            opponentHealthFill.style.width = `${healthPercentage}%`;
        } else {
            console.error('Opponent health fill element not found');
        }
        
        if (opponentHealthText) {
            opponentHealthText.textContent = `${health}/${maxHealth}`;
        } else {
            console.error('Opponent health text element not found');
        }
        
        // Update mana display
        if (opponentManaFill) {
            opponentManaFill.style.width = `${manaPercentage}%`;
        } else {
            console.error('Opponent mana fill element not found');
        }
        
        if (opponentManaText) {
            opponentManaText.textContent = `${mana}/${maxMana}`;
        } else {
            console.error('Opponent mana text element not found');
        }
        
        // Update difficulty display
        const difficultyElement = document.querySelector('.difficulty-text');
        if (difficultyElement && opponent.difficulty) {
            difficultyElement.textContent = opponent.difficulty;
        }
    }
    
    /**
     * Display spell choices
     * @param {Array<Object>} spells - The array of spell objects
     * @param {Function} onSpellSelected - The callback function when a spell is selected
     */
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
            // Check if the spell has its own image, otherwise use default
            if (spell.imageUrl) {
                spellImg.src = spell.imageUrl;
            } else if (spell.image) {
                spellImg.src = spell.image;
            } else {
                // Try to use a spell-specific image based on name or type
                const spellNameForImage = spell.name ? spell.name.toLowerCase().replace(/\s+/g, '_') : '';
                const spellTypeForImage = spell.type ? spell.type.toLowerCase() : (spell.element ? spell.element.toLowerCase() : '');
                
                // Try spell name specific image first
                const nameBasedImagePath = `/images/spells/${spellNameForImage}.jpg`;
                const typeBasedImagePath = `/images/spells/${spellTypeForImage}.jpg`;
                
                // Set error handler to use type-based or default image as fallbacks
                spellImg.onerror = function() {
                    // If name-based image fails, try type-based image
                    this.src = typeBasedImagePath;
                    
                    // If type-based image fails, use default
                    this.onerror = function() {
                        this.src = '/images/spells/default-placeholder.jpg';
                        this.onerror = null; // Prevent infinite onerror loop
                    };
                };
                
                // Start with name-based image
                spellImg.src = nameBasedImagePath;
            }
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
    
    /**
     * Highlight the selected spell
     * @param {HTMLElement} selectedButton - The selected spell button
     */
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
    
    /**
     * Display choices
     * @param {Array<Object>} choices - The array of choice objects
     * @param {Function} onChoiceSelected - The callback function when a choice is selected
     */
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
    
    /**
     * Clear choices
     */
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
    
    /**
     * Add a message to the battle log
     * @param {string} message - The message to add
     */
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
    
    /**
     * Clear the battle log
     */
    clearBattleLog() {
        if (this.uiElements.battleLog) {
            this.uiElements.battleLog.innerHTML = '';
        }
    }
    
    /**
     * Update the battle log
     * @param {string} message - The message to update
     */
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
    
    /**
     * Show spell effect animation
     * @param {string} spellType - The type of spell
     * @param {HTMLElement} targetElement - The target element
     */
    showSpellEffect(spellType, targetElement) {
        const effect = document.createElement('div');
        effect.classList.add('spell-effect', `${spellType.toLowerCase()}-effect`);
        
        targetElement.appendChild(effect);
        
        // Remove after animation completes
        setTimeout(() => {
            targetElement.removeChild(effect);
        }, 1000);
    }
    
    /**
     * Display floating damage/healing/mana numbers
     * @param {string} type - 'damage', 'healing', or 'mana'
     * @param {number} amount - Amount to display
     * @param {string} targetElementId - ID of target element to show number over
     */
    displayStatChange(type, amount, targetElementId) {
        try {
            // Skip if amount is 0
            if (amount === 0) return;
            
            // Limit the number of active floating numbers to prevent performance issues
            const existingNumbers = document.querySelectorAll('.floating-number');
            if (existingNumbers.length > 10) {
                console.warn('Too many floating numbers, skipping new one');
                return;
            }
            
            // Find target element - first try the overlay elements, then fall back to original elements
            let targetElement;
            
            // Convert old element IDs to new overlay IDs
            let overlayElementId = null;
            
            if (targetElementId === 'player-health') {
                overlayElementId = 'player-health-fill';
            } else if (targetElementId === 'player-mana') {
                overlayElementId = 'player-mana-fill';
            } else if (targetElementId === 'opponent-health') {
                overlayElementId = 'enemy-health-fill';
            } else if (targetElementId === 'opponent-mana') {
                overlayElementId = 'enemy-mana-fill'; 
            }
            
            // Try to find the overlay element first
            if (overlayElementId) {
                targetElement = document.getElementById(overlayElementId);
            }
            
            // If overlay element not found, try the original element
            if (!targetElement) {
                targetElement = document.getElementById(targetElementId);
            }
            
            if (!targetElement) {
                console.warn(`Target element ${targetElementId} not found for displaying ${type} amount`);
                return;
            }
            
            // Also pulse the parent stat container for visual emphasis
            const statContainer = targetElement.closest('.overlay-stat');
            if (statContainer) {
                statContainer.classList.add('pulse-animation');
                setTimeout(() => {
                    statContainer.classList.remove('pulse-animation');
                }, 300);
            }
            
            // Create floating number element
            const floatingNumber = document.createElement('div');
            floatingNumber.className = `floating-number ${type}-number`;
            
            // Determine sign and classes based on type
            let prefix = '';
            if (type === 'damage') {
                prefix = '-';
                floatingNumber.classList.add('damage');
            } else if (type === 'healing') {
                prefix = '+';
                floatingNumber.classList.add('healing');
            } else if (type === 'mana') {
                if (amount > 0) {
                    prefix = '+';
                    floatingNumber.classList.add('mana-gain');
                } else {
                    prefix = '-';
                    amount = Math.abs(amount);
                    floatingNumber.classList.add('mana-loss');
                }
            }
            
            floatingNumber.textContent = `${prefix}${Math.round(amount)}`;
            
            // Apply CSS directly rather than setting inline styles
            floatingNumber.style.position = 'absolute';
            floatingNumber.style.zIndex = '100';
            floatingNumber.style.fontSize = '20px';
            floatingNumber.style.fontWeight = 'bold';
            floatingNumber.style.textShadow = '0 0 3px #000';
            
            // Use CSS animation class instead of inline style
            floatingNumber.classList.add('float-animation');
            
            // Set color based on type using CSS classes only
            if (type === 'damage') {
                floatingNumber.style.color = '#ff5555';
            } else if (type === 'healing') {
                floatingNumber.style.color = '#55ff55';
            } else if (type === 'mana') {
                floatingNumber.style.color = '#5555ff';
            }
            
            // Position element before adding to DOM to avoid layout thrashing
            const targetRect = targetElement.getBoundingClientRect();
            // Use safe positioning with fixed values instead of calculated widths
            floatingNumber.style.left = `${targetRect.left + targetRect.width / 2}px`;
            floatingNumber.style.top = `${targetRect.top}px`;
            floatingNumber.style.transform = 'translate(-50%, -50%)';
            
            // Add to document body
            document.body.appendChild(floatingNumber);
            
            // Remove after animation completes with safety check
            setTimeout(() => {
                try {
                    if (document.body.contains(floatingNumber)) {
                        document.body.removeChild(floatingNumber);
                    }
                } catch (e) {
                    console.warn('Error removing floating number:', e);
                }
            }, 1500);
        } catch (error) {
            // Catch any errors to prevent browser crashes
            console.error('Error displaying stat change:', error);
        }
    }
    
    /**
     * Update game over screen with results
     * @param {Object} result - The result object
     */
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
    
    /**
     * Update battle info
     * @param {Object} gameState - The current game state
     */
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

    /**
     * Update overlay stats displayed in the 3D scene
     * @param {Object} player - Player data
     * @param {Object} opponent - Opponent data
     */
    updateOverlayStats(player, opponent) {
        // Skip if no data provided
        if (!player && !opponent) {
            console.warn('No data provided to updateOverlayStats');
            return;
        }
        
        // Update player stats if provided
        if (player) {
            this.updatePlayerOverlay(player);
        }
        
        // Update opponent stats if provided
        if (opponent) {
            this.updateOpponentOverlay(opponent);
        }
    }

    /**
     * Update player stats in the overlay
     * @param {Object} player - Player data
     * @returns {boolean} True if update was successful, false otherwise
     */
    updatePlayerOverlay(player) {
        console.log('Updating player overlay with:', player);
        
        try {
            // Get player level element
            const playerLevel = document.getElementById('player-level');
            if (playerLevel) {
                playerLevel.textContent = player.level || 1;
                console.log(`Updated player level to ${player.level || 1}`);
            }
            
            // Update player health
            const healthFill = document.getElementById('player-health-fill');
            const healthText = document.getElementById('player-health-text');
            
            if (healthFill && healthText) {
                const healthPercentage = Math.max(0, Math.min(100, (player.health / player.maxHealth) * 100));
                healthFill.style.width = `${healthPercentage}%`;
                healthFill.style.backgroundColor = 'red'; // Simple color to ensure visibility
                healthFill.style.background = 'linear-gradient(to right, #ff3030, #ff5050)';
                healthText.textContent = `${Math.round(player.health)}/${player.maxHealth}`;
                console.log(`Updated player health: ${player.health}/${player.maxHealth} (${healthPercentage}%)`);
            }
            
            // Update player mana
            const manaFill = document.getElementById('player-mana-fill');
            const manaText = document.getElementById('player-mana-text');
            
            if (manaFill && manaText) {
                const manaPercentage = Math.max(0, Math.min(100, (player.mana / player.maxMana) * 100));
                manaFill.style.width = `${manaPercentage}%`;
                manaFill.style.backgroundColor = 'blue'; // Simple color to ensure visibility
                manaFill.style.background = 'linear-gradient(to right, #3030ff, #5050ff)';
                manaText.textContent = `${Math.round(player.mana)}/${player.maxMana}`;
                console.log(`Updated player mana: ${player.mana}/${player.maxMana} (${manaPercentage}%)`);
            }
            
            // Update player experience
            const expFill = document.getElementById('player-exp-fill');
            const expCurrentValue = document.getElementById('exp-current-value');
            const expNextValue = document.getElementById('exp-next-value');
            
            if (expFill && expCurrentValue && expNextValue) {
                // Calculate experience needed for next level and current level progress
                const currentLevel = player.level || 1;
                const currentExp = player.experience || 0;
                const expNeeded = this.calculateExpForNextLevel(currentLevel);
                const totalExpForCurrentLevel = this.calculateTotalExpForLevel(currentLevel);
                const levelExpCurrent = currentExp - totalExpForCurrentLevel;
                
                // Calculate percentage for the current level's progress
                const levelExpPercentage = Math.max(0, Math.min(100, (levelExpCurrent / expNeeded) * 100));
                
                // Update UI elements
                expFill.style.width = `${levelExpPercentage}%`;
                expFill.style.backgroundColor = 'gold'; // Simple color to ensure visibility
                expFill.style.background = 'linear-gradient(to right, #ffcc00, #ffd700)';
                expFill.style.height = '100%';
                
                expCurrentValue.textContent = Math.floor(levelExpCurrent);
                expNextValue.textContent = expNeeded;
                
                console.log(`Updated XP bar: ${Math.floor(levelExpCurrent)}/${expNeeded} (${levelExpPercentage}%)`);
            }
            
            return true;
        } catch (error) {
            console.error('Error updating player overlay:', error);
            return false;
        }
    }

    /**
     * Update opponent stats in the overlay
     * @param {Object} opponent - Opponent data
     * @returns {boolean} True if update was successful, false otherwise
     */
    updateOpponentOverlay(opponent) {
        console.log('Updating opponent overlay with:', opponent);
        
        try {
            // Update opponent difficulty
            const difficultyText = document.getElementById('enemy-difficulty');
            if (difficultyText) {
                difficultyText.textContent = opponent.difficulty || 'Normal';
            }
            
            // Update opponent health
            const healthFill = document.getElementById('enemy-health-fill');
            const healthText = document.getElementById('enemy-health-text');
            
            if (healthFill && healthText) {
                const healthPercentage = Math.max(0, Math.min(100, (opponent.health / opponent.maxHealth) * 100));
                healthFill.style.width = `${healthPercentage}%`;
                healthFill.style.backgroundColor = 'red'; // Simple color to ensure visibility
                healthFill.style.background = 'linear-gradient(to right, #ff3030, #ff5050)';
                healthText.textContent = `${Math.round(opponent.health)}/${opponent.maxHealth}`;
                console.log(`Updated opponent health: ${opponent.health}/${opponent.maxHealth} (${healthPercentage}%)`);
            }
            
            // Update opponent mana
            const manaFill = document.getElementById('enemy-mana-fill');
            const manaText = document.getElementById('enemy-mana-text');
            
            if (manaFill && manaText) {
                const manaPercentage = Math.max(0, Math.min(100, (opponent.mana / opponent.maxMana) * 100));
                manaFill.style.width = `${manaPercentage}%`;
                manaFill.style.backgroundColor = 'blue'; // Simple color to ensure visibility
                manaFill.style.background = 'linear-gradient(to right, #3030ff, #5050ff)';
                manaText.textContent = `${Math.round(opponent.mana)}/${opponent.maxMana}`;
                console.log(`Updated opponent mana: ${opponent.mana}/${opponent.maxMana} (${manaPercentage}%)`);
            }
            
            return true;
        } catch (error) {
            console.error('Error updating opponent overlay:', error);
            return false;
        }
    }

    /**
     * Calculate experience needed for next level
     * @param {number} level - Current level
     * @returns {number} Experience needed for next level
     */
    calculateExpForNextLevel(level) {
        return level * 100; // Simple formula: 100 exp per level
    }

    /**
     * Calculate total experience for reaching a level
     * @param {number} level - Level to calculate
     * @returns {number} Total experience required
     */
    calculateTotalExpForLevel(level) {
        if (level <= 1) return 0;
        
        let totalExp = 0;
        for (let i = 1; i < level; i++) {
            totalExp += i * 100;
        }
        return totalExp;
    }

    /**
     * Ensure all UI elements exist and update them
     * This is the primary method to call whenever UI needs to be updated
     * @param {Object} gameState - The current game state
     * @returns {boolean} True if the update was successful
     */
    ensureAndUpdateAllUI(gameState) {
        console.log('Comprehensive UI update initiated with game state:', {
            currentScreen: gameState.currentScreen,
            currentTurn: gameState.currentTurn,
            isProcessingTurn: gameState.isProcessingTurn,
            turnCount: gameState.turnCount,
            spellsCast: gameState.spellsCast,
            ...gameState
        });
        
        try {
            // Update player UI if player exists
            if (gameState.player) {
                try {
                    this.updatePlayerOverlay(gameState.player);
                } catch (error) {
                    console.error('Error updating player UI:', error);
                }
            }
            
            // Update opponent UI if opponent exists
            if (gameState.opponent) {
                try {
                    this.updateOpponentOverlay(gameState.opponent);
                } catch (error) {
                    console.error('Error updating opponent UI:', error);
                }
            }
            
            // Update spell buttons based on player mana
            if (gameState.player && gameState.player.mana !== undefined) {
                try {
                    this.updateSpellButtons(gameState.player.mana, gameState.isProcessingTurn);
                } catch (error) {
                    console.error('Error updating spell buttons:', error);
                }
            }
            
            // Update turn indicator
            const turnElement = document.querySelector('.turn-indicator');
            if (turnElement) {
                turnElement.textContent = `Turn: ${gameState.turnCount || 1}`;
            }
            
            // Update battle log
            if (gameState.battleLog && gameState.battleLog.length > 0) {
                try {
                    this.updateBattleLog(gameState.battleLog);
                } catch (error) {
                    console.error('Error updating battle log:', error);
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error in comprehensive UI update:', error);
            return false;
        }
    }

    /**
     * Update spell buttons based on player's available mana
     * @param {number} playerMana - Current player mana
     * @param {boolean} isProcessingTurn - Whether a turn is currently being processed
     */
    updateSpellButtons(playerMana, isProcessingTurn) {
        try {
            const spellButtons = document.querySelectorAll('.spell-button');
            
            console.log(`Updating ${spellButtons.length} spell buttons with mana ${playerMana}, processing: ${isProcessingTurn}`);
            
            spellButtons.forEach(button => {
                const spellId = button.getAttribute('data-spell-id');
                if (spellId) {
                    // Get the mana cost from the button's content if possible
                    let manaCost = 0;
                    const manaText = button.querySelector('div[style*="color: #aaa"]');
                    if (manaText) {
                        const manaCostMatch = manaText.textContent.match(/Mana: (\d+)/);
                        if (manaCostMatch) {
                            manaCost = parseInt(manaCostMatch[1], 10);
                        }
                    }
                    
                    // Disable button if not enough mana or turn is processing
                    const disabled = playerMana < manaCost || isProcessingTurn;
                    button.classList.toggle('disabled', disabled);
                    
                    // Apply visual styling to make the state obvious
                    if (disabled) {
                        button.style.opacity = '0.5';
                        button.style.cursor = 'not-allowed';
                    } else {
                        button.style.opacity = '1';
                        button.style.cursor = 'pointer';
                    }
                }
            });
        } catch (error) {
            console.error('Error updating spell buttons:', error);
        }
    }

    /**
     * Update battle log display
     * @param {Array} battleLog - Battle log messages
     */
    updateBattleLog(battleLog) {
        try {
            const battleLogContainer = document.querySelector('.battle-log');
            if (battleLogContainer) {
                // Clear previous content
                battleLogContainer.innerHTML = '';
                
                // Add each message
                battleLog.forEach(message => {
                    const messageElement = document.createElement('div');
                    messageElement.className = 'log-message';
                    messageElement.textContent = message;
                    battleLogContainer.appendChild(messageElement);
                });
                
                // Scroll to bottom
                battleLogContainer.scrollTop = battleLogContainer.scrollHeight;
            }
        } catch (error) {
            console.error('Error updating battle log:', error);
        }
    }

    /**
     * Creates an overlay stat bar if it doesn't exist
     * @param {HTMLElement} container - The container to add the stat to
     * @param {string} label - The label for the stat
     * @param {string} type - The type of stat ('health', 'mana', 'exp')
     * @param {string} [owner='player'] - The owner of the stat ('player' or 'opponent')
     * @returns {boolean} Whether the stat was successfully created
     */
    createOverlayStat(container, label, type, owner = 'player') {
        if (!container) {
            console.error(`Cannot create ${type} stat: container not found`);
            return false;
        }
        
        // Check if this stat already exists
        const existingStatContainer = Array.from(container.querySelectorAll('.overlay-stat')).find(stat => {
            const statLabel = stat.querySelector('.overlay-stat-label');
            return statLabel && statLabel.textContent.includes(label);
        });
        
        if (existingStatContainer) {
            return true; // Already exists
        }
        
        try {
            console.log(`Creating missing ${type} stat for ${owner}`);
            
            // Create the stat container
            const statContainer = document.createElement('div');
            statContainer.className = 'overlay-stat';
            
            // Create the label
            const statLabel = document.createElement('div');
            statLabel.className = 'overlay-stat-label';
            statLabel.innerHTML = `
                <span>${label}</span>
                <span id="${owner}-${type}-text">100/100</span>
            `;
            
            // Create the bar
            const barContainer = document.createElement('div');
            barContainer.className = 'overlay-bar';
            
            // Create the fill element
            const fill = document.createElement('div');
            fill.className = `overlay-bar-fill overlay-${type}-fill`;
            fill.id = `${owner}-${type}-fill`;
            fill.style.width = '100%';
            
            // For health and mana, add color gradients
            if (type === 'health') {
                fill.style.background = 'linear-gradient(to right, #ff0000, #ff5555)';
            } else if (type === 'mana') {
                fill.style.background = 'linear-gradient(to right, #0000ff, #5555ff)';
            } else if (type === 'exp') {
                fill.style.background = 'linear-gradient(to right, #00ff00, #55ff55)';
            }
            
            // Assemble the elements
            barContainer.appendChild(fill);
            statContainer.appendChild(statLabel);
            statContainer.appendChild(barContainer);
            container.appendChild(statContainer);
            
            return true;
        } catch (error) {
            console.error(`Error creating ${type} stat for ${owner}:`, error);
            return false;
        }
    }
}

export default UIElementManager;
