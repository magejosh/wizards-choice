// Enhanced Spell System - Manages spells, their effects, and player progression
import SpellDefinitions from './SpellDefinitions';
import SpellHandManager from './SpellHandManager';
import SpellProgressionTracker from './SpellProgressionTracker';

/**
 * Main system that integrates spell definitions, hand management, and progression tracking
 */
class EnhancedSpellSystem {
    /**
     * Initialize the Enhanced Spell System
     */
    constructor() {
        // Initialize sub-components
        this.spellDefinitions = new SpellDefinitions();
        this.progressionTracker = null;
        this.handManager = null;
        this.gameStateManager = null;
        
        /**
         * Mapping of spell IDs to their definitions
         * @type {Object<string, SpellDefinition>}
         */
        this.spells = {};
        
        /**
         * List of spell IDs that the player has unlocked
         * @type {string[]}
         */
        this.playerUnlockedSpells = [];
        
        /**
         * Player's current progress
         * @type {Object}
         * @property {number} level - Player's current level
         * @property {number} experience - Player's current experience
         * @property {string[]} unlockedSpells - List of spell IDs that the player has unlocked
         */
        this.playerProgress = {
            level: 1,
            experience: 0,
            unlockedSpells: []
        };
        
        /**
         * List of spell IDs used in the current battle
         * @type {string[]}
         */
        this.usedSpellsTracking = [];
        
        /**
         * Player's current hand of active spells (3 spells they can cast)
         * @type {string[]}
         */
        this.playerSpellHand = [];
        
        /**
         * Maximum number of spells in hand
         * @type {number}
         */
        this.maxHandSize = 3;
        
        /**
         * Available spells left in the "deck" for the current battle
         * @type {string[]}
         */
        this.availableSpellsForBattle = [];
        
        /**
         * Opponent's current hand of active spells
         * @type {Array}
         */
        this.opponentSpellHand = null;
    }

    /**
     * Initialize the spell system and its components
     * @returns {EnhancedSpellSystem} The initialized spell system
     */
    init() {
        console.log('Initializing Enhanced Spell System...');
        
        // Initialize spell definitions
        this.spellDefinitions.init();
        
        // Initialize progression tracker with spell definitions
        this.progressionTracker = new SpellProgressionTracker(this.spellDefinitions);
        this.progressionTracker.init();
        
        // Initialize hand manager with spell definitions
        this.handManager = new SpellHandManager(this.spellDefinitions);
        
        // Load player progress
        this.loadProgress();
        
        console.log('Enhanced Spell System initialized');
        return this;
    }

    /**
     * Get a spell definition by its ID
     * @param {string} spellId - ID of the spell to retrieve
     * @returns {SpellDefinition} The spell definition
     */
    getSpellById(spellId) {
        return this.spellDefinitions.getSpellById(spellId);
    }

    /**
     * Get a list of spell IDs that can be unlocked at a given level
     * @param {number} level - Level at which to unlock spells
     * @returns {string[]} List of spell IDs that can be unlocked
     */
    getSpellsByUnlockLevel(level) {
        return this.progressionTracker.getSpellsByUnlockLevel(level);
    }

    /**
     * Get a list of available spells that can be unlocked by the player
     * @param {number} playerLevel - Player's current level
     * @returns {string[]} List of available spell IDs
     */
    getAvailableSpellsForUnlock(playerLevel) {
        return this.progressionTracker.getAvailableSpellsForUnlock(playerLevel);
    }

    /**
     * Get a list of spell IDs that the player has unlocked
     * @returns {string[]} List of unlocked spell IDs
     */
    getPlayerUnlockedSpells() {
        return this.progressionTracker.getPlayerUnlockedSpells();
    }

    /**
     * Get a list of all unlocked spell IDs
     * @returns {string[]} List of unlocked spell IDs
     */
    getUnlockedSpells() {
        return this.progressionTracker.getUnlockedSpells();
    }

    /**
     * Unlock a spell for the player
     * @param {string} spellId - ID of the spell to unlock
     * @returns {boolean} Whether the spell was unlocked successfully
     */
    unlockSpell(spellId) {
        return this.progressionTracker.unlockSpell(spellId);
    }

    /**
     * Improve a spell for the player
     * @param {string} spellId - ID of the spell to improve
     * @returns {boolean} Whether the spell was improved successfully
     */
    improveSpell(spellId) {
        return this.progressionTracker.improveSpell(spellId);
    }

    /**
     * Get a list of spell IDs that match a given element
     * @param {string} element - Element to match
     * @returns {string[]} List of spell IDs that match the element
     */
    getSpellsByElement(element) {
        return this.spellDefinitions.getSpellsByElement(element);
    }

    /**
     * Add experience to the player's progress
     * @param {number} amount - Amount of experience to add
     * @returns {boolean} Whether the experience was added successfully
     */
    addExperience(amount) {
        return this.progressionTracker.addExperience(amount);
    }

    /**
     * Initialize the player's progress
     * @returns {boolean} Whether the progress was initialized successfully
     */
    initPlayerProgress() {
        return this.progressionTracker.initPlayerProgress();
    }

    /**
     * Reset the player's progress
     * @returns {boolean} Whether the progress was reset successfully
     */
    resetPlayerProgress() {
        return this.progressionTracker.resetPlayerProgress();
    }

    /**
     * Load the player's progress from storage
     * @returns {boolean} Whether the progress was loaded successfully
     */
    loadProgress() {
        return this.progressionTracker.loadProgress();
    }

    /**
     * Save the player's progress to storage
     * @returns {boolean} Whether the progress was saved successfully
     */
    saveProgress() {
        return this.progressionTracker.saveProgress();
    }

    /**
     * Get the player's current progress
     * @returns {Object} The player's progress
     */
    getPlayerProgress() {
        return this.progressionTracker.getPlayerProgress();
    }

    /**
     * Get a list of spell options for the player to level up
     * @param {string[]} defeatedEnemySpells - List of spell IDs used by defeated enemies
     * @returns {string[]} List of spell IDs that the player can level up
     */
    getSpellOptionsForLevelUp(defeatedEnemySpells) {
        return this.progressionTracker.getSpellOptionsForLevelUp(defeatedEnemySpells);
    }

    /**
     * Unlock a new spell for the player based on their difficulty level
     * @param {number} difficulty - Player's current difficulty level
     * @returns {boolean} Whether a new spell was unlocked successfully
     */
    unlockNewSpell(difficulty) {
        return this.progressionTracker.unlockNewSpell(difficulty);
    }

    /**
     * Record the result of a battle
     * @param {boolean} won - Whether the player won the battle
     * @param {number} difficulty - Difficulty level of the battle
     * @returns {boolean} Whether the battle result was recorded successfully
     */
    recordBattleResult(won, difficulty) {
        return this.progressionTracker.recordBattleResult(won, difficulty);
    }

    /**
     * Get a list of spells that can be displayed to the player
     * @returns {string[]} List of spell IDs that can be displayed
     */
    getSpellsForDisplay() {
        return this.spellDefinitions.getSpellsForDisplay(this.progressionTracker.getPlayerUnlockedSpells());
    }

    /**
     * Initialize the player's spell hand
     * @returns {boolean} Whether the spell hand was initialized successfully
     */
    initializeSpellHand() {
        return this.handManager.initializeSpellHand(this.progressionTracker.getPlayerUnlockedSpells());
    }

    /**
     * Refill the player's spell hand
     * @returns {boolean} Whether the spell hand was refilled successfully
     */
    refillSpellHand() {
        return this.handManager.refillSpellHand();
    }

    /**
     * Remove a spell from the player's spell hand
     * @param {string} spellId - ID of the spell to remove
     * @returns {boolean} Whether the spell was removed successfully
     */
    removeSpellFromHand(spellId) {
        return this.handManager.removeSpellFromHand(spellId);
    }

    /**
     * Get the player's current spell hand
     * @returns {string[]} List of spell IDs in the player's spell hand
     */
    getPlayerSpellHand() {
        return this.handManager.getPlayerSpellHand();
    }

    /**
     * Check if a spell is in the player's spell hand
     * @param {string} spellId - ID of the spell to check
     * @returns {boolean} Whether the spell is in the player's spell hand
     */
    isSpellInHand(spellId) {
        return this.handManager.isSpellInHand(spellId);
    }

    /**
     * Set the player's spell hand
     * @param {string[]} spells - List of spell IDs to set as the player's spell hand
     * @returns {boolean} Whether the spell hand was set successfully
     */
    setPlayerSpellHand(spells) {
        return this.handManager.setPlayerSpellHand(spells);
    }

    /**
     * Reset the player's spell hand
     * @returns {boolean} Whether the spell hand was reset successfully
     */
    resetSpellHand() {
        return this.handManager.resetSpellHand();
    }

    /**
     * Reset the available spells for the current battle
     * @returns {boolean} Whether the available spells were reset successfully
     */
    resetAvailableSpells() {
        return this.handManager.resetAvailableSpells(this.progressionTracker.getPlayerUnlockedSpells());
    }

    /**
     * Track the usage of a spell
     * @param {string} spellId - ID of the spell to track
     * @returns {boolean} Whether the spell usage was tracked successfully
     */
    trackSpellUsage(spellId) {
        return this.handManager.trackSpellUsage(spellId);
    }

    /**
     * Reset the spell usage tracking
     * @returns {boolean} Whether the spell usage tracking was reset successfully
     */
    resetSpellTracking() {
        return this.handManager.resetSpellTracking();
    }

    /**
     * Get the list of used spells
     * @returns {string[]} List of spell IDs that have been used
     */
    getUsedSpells() {
        return this.handManager.getUsedSpells();
    }

    /**
     * Inject dependencies into the Enhanced Spell System
     * @param {Object} dependencies - Object containing dependencies
     * @param {Object} dependencies.gameStateManager - Game state management system
     */
    injectDependencies(dependencies = {}) {
        console.log('Injecting dependencies into EnhancedSpellSystem');
        
        // Inject gameStateManager if provided
        if (dependencies.gameStateManager) {
            this.gameStateManager = dependencies.gameStateManager;
            console.log('GameStateManager successfully injected');
        } else {
            console.warn('No gameStateManager provided during dependency injection');
        }
        
        // Add other potential dependencies here
        return this;
    }

    /**
     * Get the opponent's spell hand for the current battle
     * @returns {Array} List of spells in the opponent's hand
     */
    getOpponentSpellHand() {
        console.log('Getting opponent spell hand');
        
        // If opponent hand is not initialized, create it
        if (!this.opponentSpellHand) {
            this.opponentSpellHand = this.initializeOpponentSpellHand();
        }
        
        // Ensure we have spells
        if (!this.opponentSpellHand || this.opponentSpellHand.length === 0) {
            console.warn('No spells in opponent hand, generating default spells');
            this.opponentSpellHand = this.generateDefaultOpponentSpells();
        }
        
        return this.opponentSpellHand || [];
    }

    /**
     * Generate a default set of spells for the opponent when no spells are available
     * @returns {Array} List of default spells
     */
    generateDefaultOpponentSpells() {
        console.log('Generating default opponent spells');
        
        // Default spells with basic damage and healing
        const defaultSpells = [
            this.spellDefinitions.getSpellById('basic_fireball'),
            this.spellDefinitions.getSpellById('basic_heal')
        ].filter(spell => spell); // Remove any undefined spells
        
        // If no default spells found, create minimal spell objects
        if (defaultSpells.length === 0) {
            defaultSpells.push({
                id: 'fallback_damage',
                name: 'Fallback Damage Spell',
                type: 'damage',
                manaCost: 10,
                damage: 15
            }, {
                id: 'fallback_heal',
                name: 'Fallback Heal Spell',
                type: 'heal',
                manaCost: 10,
                healing: 10
            });
        }
        
        console.log(`Generated ${defaultSpells.length} default spells`);
        return defaultSpells;
    }

    /**
     * Initialize the opponent's spell hand for the current battle
     * @returns {Array} List of spells for the opponent
     */
    initializeOpponentSpellHand() {
        console.log('Initializing opponent spell hand');
        
        try {
            // Check if gameStateManager exists
            if (!this.gameStateManager) {
                console.warn('gameStateManager not initialized, using default spells');
                return this.generateDefaultOpponentSpells();
            }
            
            // Get the current game state
            const gameState = this.gameStateManager.getGameState();
            
            // Validate game state and opponent
            if (!gameState || !gameState.opponent) {
                console.warn('Game state or opponent not initialized, using default spells');
                return this.generateDefaultOpponentSpells();
            }
            
            // Determine the number of spells based on difficulty
            const aiLevel = gameState.opponent.aiLevel || 1;
            const spellCount = aiLevel === 1 ? 2 : 
                              aiLevel === 2 ? 3 : 4;
            
            // Get available spells for the opponent's difficulty level
            const playerLevel = gameState.player ? gameState.player.level || 1 : 1;
            const availableSpells = this.getSpellsByUnlockLevel(playerLevel);
            
            // If no available spells, use default spells
            if (!availableSpells || availableSpells.length === 0) {
                console.warn('No available spells found, using default spells');
                return this.generateDefaultOpponentSpells();
            }
            
            // Shuffle the available spells
            const shuffledSpells = this.shuffleArray(availableSpells);
            
            // Select spells for the opponent's hand
            const opponentSpells = shuffledSpells.slice(0, spellCount)
                .map(spellId => this.spellDefinitions.getSpellById(spellId))
                .filter(spell => spell); // Filter out any undefined spells
            
            // If no spells selected, use default spells
            if (opponentSpells.length === 0) {
                console.warn('No spells selected, using default spells');
                return this.generateDefaultOpponentSpells();
            }
            
            console.log(`Created opponent spell hand with ${opponentSpells.length} spells`);
            return opponentSpells;
        } catch (error) {
            console.error('Error initializing opponent spell hand:', error);
            return this.generateDefaultOpponentSpells();
        }
    }

    /**
     * Remove a spell from the opponent's hand after it's been cast
     * @param {string} spellId - ID of the spell to remove
     */
    removeSpellFromOpponentHand(spellId) {
        if (!this.opponentSpellHand) {
            console.error('Opponent spell hand not initialized');
            return;
        }
        
        const index = this.opponentSpellHand.findIndex(spell => spell.id === spellId);
        
        if (index !== -1) {
            console.log(`Removing spell from opponent hand: ${this.opponentSpellHand[index].name}`);
            this.opponentSpellHand.splice(index, 1);
        } else {
            console.warn(`Spell with ID ${spellId} not found in opponent hand`);
        }
    }

    /**
     * Shuffle an array randomly
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffleArray(array) {
        const shuffledArray = [...array];
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }
        return shuffledArray;
    }
}

export default EnhancedSpellSystem;
