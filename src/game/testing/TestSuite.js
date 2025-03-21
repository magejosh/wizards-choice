// Test Suite for Wizard's Choice
// Handles automated testing of game components

export class TestSuite {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }
    
    addTest(name, testFunction) {
        this.tests.push({
            name,
            testFunction
        });
    }
    
    async runTests() {
        console.log('Starting test suite...');
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
        
        for (const test of this.tests) {
            try {
                console.log(`Running test: ${test.name}`);
                const startTime = performance.now();
                await test.testFunction();
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                console.log(`✅ Test passed: ${test.name} (${duration.toFixed(2)}ms)`);
                this.results.passed++;
                this.results.details.push({
                    name: test.name,
                    status: 'passed',
                    duration
                });
            } catch (error) {
                console.error(`❌ Test failed: ${test.name}`);
                console.error(error);
                this.results.failed++;
                this.results.details.push({
                    name: test.name,
                    status: 'failed',
                    error: error.message
                });
            }
            
            this.results.total++;
        }
        
        console.log('Test suite completed.');
        console.log(`Results: ${this.results.passed} passed, ${this.results.failed} failed, ${this.results.total} total`);
        
        return this.results;
    }
    
    getResults() {
        return { ...this.results };
    }
}

// Game Component Tests
export class GameTests {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.testSuite = new TestSuite();
        this.setupTests();
    }
    
    setupTests() {
        // Add tests for game components
        this.addGameStateTests();
        this.addSpellSystemTests();
        this.addDuelSystemTests();
        this.addProgressionSystemTests();
        this.addAIOpponentTests();
    }
    
    addGameStateTests() {
        // Test game state initialization
        this.testSuite.addTest('Game State Initialization', async () => {
            const gameState = this.gameManager.gameState;
            if (!gameState) {
                throw new Error('Game state not initialized');
            }
            
            // Check initial state
            if (gameState.currentState !== 'mainMenu') {
                throw new Error(`Expected initial state to be 'mainMenu', got '${gameState.currentState}'`);
            }
        });
        
        // Test state transitions
        this.testSuite.addTest('Game State Transitions', async () => {
            const gameState = this.gameManager.gameState;
            
            // Test transition to spell selection
            gameState.changeState('spellSelection');
            if (gameState.currentState !== 'spellSelection') {
                throw new Error(`Failed to transition to spellSelection state`);
            }
            
            // Test transition to battle
            gameState.changeState('battle');
            if (gameState.currentState !== 'battle') {
                throw new Error(`Failed to transition to battle state`);
            }
            
            // Test transition to results
            gameState.changeState('results');
            if (gameState.currentState !== 'results') {
                throw new Error(`Failed to transition to results state`);
            }
            
            // Reset to main menu
            gameState.changeState('mainMenu');
        });
    }
    
    addSpellSystemTests() {
        // Test spell system initialization
        this.testSuite.addTest('Spell System Initialization', async () => {
            const spellSystem = this.gameManager.spellSystem;
            if (!spellSystem) {
                throw new Error('Spell system not initialized');
            }
            
            // Check if spells are loaded
            const spells = Object.keys(spellSystem.spells);
            if (spells.length === 0) {
                throw new Error('No spells loaded in spell system');
            }
            
            // Check if spell trees are initialized
            const trees = Object.keys(spellSystem.spellTrees);
            if (trees.length === 0) {
                throw new Error('No spell trees initialized in spell system');
            }
        });
        
        // Test spell unlocking
        this.testSuite.addTest('Spell Unlocking', async () => {
            const spellSystem = this.gameManager.spellSystem;
            
            // Get initial unlocked spells count
            const initialUnlocked = spellSystem.playerUnlockedSpells.length;
            
            // Force unlock a new spell
            const allSpellIds = Object.keys(spellSystem.spells);
            const lockedSpellIds = allSpellIds.filter(id => !spellSystem.playerUnlockedSpells.includes(id));
            
            if (lockedSpellIds.length === 0) {
                // All spells already unlocked, test passes
                return;
            }
            
            // Add a locked spell to unlocked list
            spellSystem.playerUnlockedSpells.push(lockedSpellIds[0]);
            
            // Check if spell was unlocked
            const newUnlocked = spellSystem.playerUnlockedSpells.length;
            if (newUnlocked !== initialUnlocked + 1) {
                throw new Error('Failed to unlock new spell');
            }
            
            // Reset to initial state
            spellSystem.playerUnlockedSpells.pop();
        });
    }
    
    addDuelSystemTests() {
        // Test duel system initialization
        this.testSuite.addTest('Duel System Initialization', async () => {
            const duelSystem = this.gameManager.duelSystem;
            if (!duelSystem) {
                throw new Error('Duel system not initialized');
            }
        });
        
        // Test spell casting
        this.testSuite.addTest('Spell Casting', async () => {
            const duelSystem = this.gameManager.duelSystem;
            const spellSystem = this.gameManager.spellSystem;
            
            // Get a test spell
            const testSpell = spellSystem.getSpellById('fireball');
            if (!testSpell) {
                throw new Error('Test spell not found');
            }
            
            // Set up a test battle state
            const battleState = {
                player: {
                    health: 100,
                    maxHealth: 100,
                    mana: 100,
                    maxMana: 100
                },
                opponent: {
                    health: 100,
                    maxHealth: 100,
                    mana: 100,
                    maxMana: 100
                },
                turn: 'player'
            };
            
            // Cast spell
            const result = duelSystem.castSpell(testSpell, 'player', battleState);
            
            // Check if spell was cast successfully
            if (!result) {
                throw new Error('Failed to cast spell');
            }
            
            // Check if mana was deducted
            if (battleState.player.mana >= 100) {
                throw new Error('Mana not deducted after casting spell');
            }
            
            // Check if damage was applied
            if (battleState.opponent.health >= 100) {
                throw new Error('Damage not applied after casting spell');
            }
        });
    }
    
    addProgressionSystemTests() {
        // Test progression system initialization
        this.testSuite.addTest('Progression System Initialization', async () => {
            const progressionSystem = this.gameManager.progressionSystem;
            if (!progressionSystem) {
                throw new Error('Progression system not initialized');
            }
            
            // Check if tiers are defined
            if (!progressionSystem.progressionTiers || progressionSystem.progressionTiers.length === 0) {
                throw new Error('No progression tiers defined');
            }
            
            // Check if achievements are defined
            if (!progressionSystem.achievements || progressionSystem.achievements.length === 0) {
                throw new Error('No achievements defined');
            }
        });
        
        // Test battle result processing
        this.testSuite.addTest('Battle Result Processing', async () => {
            const progressionSystem = this.gameManager.progressionSystem;
            const spellSystem = this.gameManager.spellSystem;
            
            // Get initial progress
            const initialProgress = spellSystem.getPlayerProgress();
            const initialWins = initialProgress.wins;
            
            // Process a win
            const result = progressionSystem.processBattleResult(true, 'normal', []);
            
            // Check if win was recorded
            const newProgress = spellSystem.getPlayerProgress();
            if (newProgress.wins !== initialWins + 1) {
                throw new Error('Win not recorded in player progress');
            }
            
            // Check if result contains expected properties
            if (!result.hasOwnProperty('won') || !result.hasOwnProperty('currentTier')) {
                throw new Error('Battle result missing expected properties');
            }
            
            // Reset progress
            spellSystem.playerProgress.wins = initialWins;
        });
    }
    
    addAIOpponentTests() {
        // Test AI opponent creation
        this.testSuite.addTest('AI Opponent Creation', async () => {
            const aiDifficultyManager = this.gameManager.aiDifficultyManager;
            if (!aiDifficultyManager) {
                throw new Error('AI difficulty manager not initialized');
            }
            
            // Create an opponent
            const opponent = aiDifficultyManager.createOpponent();
            
            // Check if opponent was created
            if (!opponent) {
                throw new Error('Failed to create AI opponent');
            }
            
            // Check if opponent has required properties
            if (!opponent.name || !opponent.difficulty || !opponent.spells) {
                throw new Error('AI opponent missing required properties');
            }
            
            // Check if opponent has spells
            if (!opponent.spells || opponent.spells.length === 0) {
                throw new Error('AI opponent has no spells');
            }
        });
        
        // Test AI spell selection
        this.testSuite.addTest('AI Spell Selection', async () => {
            const aiDifficultyManager = this.gameManager.aiDifficultyManager;
            
            // Create an opponent
            const opponent = aiDifficultyManager.createOpponent();
            
            // Set up a test game state
            const gameState = {
                player: {
                    health: 80,
                    maxHealth: 100,
                    mana: 80,
                    maxMana: 100
                },
                opponent: {
                    health: 80,
                    maxHealth: 100,
                    mana: 80,
                    maxMana: 100
                }
            };
            
            // Choose a spell
            const spell = opponent.chooseSpell(opponent.spells, gameState);
            
            // Check if a spell was chosen
            if (!spell) {
                throw new Error('AI failed to choose a spell');
            }
            
            // Check if chosen spell is in opponent's spell list
            const spellInList = opponent.spells.some(s => s.id === spell.id);
            if (!spellInList) {
                throw new Error('AI chose a spell not in its spell list');
            }
        });
    }
    
    async runTests() {
        return await this.testSuite.runTests();
    }
    
    getResults() {
        return this.testSuite.getResults();
    }
}

// UI Tests
export class UITests {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.testSuite = new TestSuite();
        this.setupTests();
    }
    
    setupTests() {
        // Add tests for UI components
        this.addUIManagerTests();
        this.addSceneManagerTests();
        this.addSpellSelectionInterfaceTests();
    }
    
    addUIManagerTests() {
        // Test UI initialization
        this.testSuite.addTest('UI Manager Initialization', async () => {
            if (!this.uiManager) {
                throw new Error('UI manager not initialized');
            }
            
            // Check if UI elements exist
            const gameContainer = document.getElementById('game-container');
            if (!gameContainer) {
                throw new Error('Game container not found');
            }
        });
        
        // Test screen transitions
        this.testSuite.addTest('Screen Transitions', async () => {
            // Test showing loading screen
            this.uiManager.showScreen('loading');
            let loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen.classList.contains('hidden')) {
                throw new Error('Failed to show loading screen');
            }
            
            // Test showing main menu
            this.uiManager.showScreen('main-menu');
            let mainMenu = document.getElementById('main-menu');
            if (mainMenu.classList.contains('hidden')) {
                throw new Error('Failed to show main menu');
            }
            
            // Test showing game UI
            this.uiManager.showScreen('game-ui');
            let gameUI = document.getElementById('game-ui');
            if (gameUI.classList.contains('hidden')) {
                throw new Error('Failed to show game UI');
            }
            
            // Reset to main menu
            this.uiManager.showScreen('main-menu');
        });
        
        // Test notification system
        this.testSuite.addTest('Notification System', async () => {
            // Show a test notification
            this.uiManager.showNotification('Test notification', 'info');
            
            // Check if notification was created
            const notifications = document.querySelectorAll('.notification');
            if (notifications.length === 0) {
                throw new Error('Notification not created');
            }
            
            // Wait for notification to disappear
            await new Promise(resolve => setTimeout(resolve, 3000));
        });
    }
    
    addSceneManagerTests() {
        // Test scene manager initialization
        this.testSuite.addTest('Scene Manager Initialization', async () => {
            const sceneManager = this.uiManager.sceneManager;
            if (!sceneManager) {
                throw new Error('Scene manager not initialized');
            }
        });
        
        // Test battle scene setup
        this.testSuite.addTest('Battle Scene Setup', async () => {
            const sceneManager = this.uiManager.sceneManager;
            
            // Set up battle scene
            await sceneManager.setupBattleScene();
            
            // Check if scene has been set up
            if (!sceneManager.scene || sceneManager.scene.children.length === 0) {
                throw new Error('Battle scene not set up properly');
            }
        });
        
        // Test spell animation
        this.testSuite.addTest('Spell Animation', async () => {
            const sceneManager = this.uiManager.sceneManager;
            
            // Play a test spell animation
            sceneManager.playSpellAnimation('player', 'fire');
            
            // Check if animation was created
            if (sceneManager.activeSpellEffects.length === 0) {
                throw new Error('Spell animation not created');
            }
            
            // Wait for animation to complete
            await new Promise(resolve => setTimeout(resolve, 2000));
        });
    }
    
    addSpellSelectionInterfaceTests() {
        // Test spell selection interface initialization
        this.testSuite.addTest('Spell Selection Interface Initialization', async () => {
            const spellSelectionInterface = this.uiManager.spellSelectionInterface;
            if (!spellSelectionInterface) {
                throw new Error('Spell selection interface not initialized');
            }
        });
        
        // Test spell selection
        this.testSuite.addTest('Spell Selection', async () => {
            const spellSelectionInterface = this.uiManager.spellSelectionInterface;
            
            // Show interface
            let selectionComplete = false;
            let selectedSpells = [];
            
            spellSelectionInterface.show(spells => {
                selectedSpells = spells;
                selectionComplete = true;
            });
            
            // Check if interface is shown
            const interfaceElement = document.getElementById('spell-selection-interface');
            if (interfaceElement.classList.contains('hidden')) {
                throw new Error('Spell selection interface not shown');
            }
            
            // Add a test spell
            const availableSpells = spellSelectionInterface.spellSystem.getUnlockedSpells();
            if (availableSpells.length > 0) {
                spellSelectionInterface.addSpell(availableSpells[0]);
                
                // Check if spell was added
                if (spellSelectionInterface.selectedSpells.length === 0) {
                    throw new Error('Failed to add spell to selection');
                }
            }
            
            // Confirm selection
            spellSelectionInterface.confirmSelection();
            
            // Wait for selection to complete
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if selection was completed
            if (!selectionComplete) {
                throw new Error('Spell selection not completed');
            }
        });
    }
    
    async runTests() {
        return await this.testSuite.runTests();
    }
    
    getResults() {
        return this.testSuite.getResults();
    }
}

// Integration Tests
export class IntegrationTests {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.testSuite = new TestSuite();
        this.setupTests();
    }
    
    setupTests() {
        // Add integration tests
        this.addGameFlowTests();
        this.addComponentInteractionTests();
    }
    
    addGameFlowTests() {
        // Test game initialization
        this.testSuite.addTest('Game Initialization', async () => {
            // Check if all required components are initialized
            if (!this.gameManager.gameState) {
                throw new Error('Game state not initialized');
            }
            
            if (!this.gameManager.spellSystem) {
                throw new Error('Spell system not initialized');
            }
            
            if (!this.gameManager.duelSystem) {
                throw new Error('Duel system not initialized');
            }
            
            if (!this.gameManager.progressionSystem) {
                throw new Error('Progression system not initialized');
            }
            
            if (!this.gameManager.aiDifficultyManager) {
                throw new Error('AI difficulty manager not initialized');
            }
            
            if (!this.gameManager.uiManager) {
                throw new Error('UI manager not initialized');
            }
        });
        
        // Test game flow
        this.testSuite.addTest('Game Flow', async () => {
            // Start a new game
            this.gameManager.startNewGame();
            
            // Check if game state is updated
            if (this.gameManager.gameState.currentState !== 'spellSelection') {
                throw new Error('Game state not updated after starting new game');
            }
            
            // Simulate spell selection
            const playerSpells = this.gameManager.spellSystem.getInitialPlayerSpells();
            this.gameManager.setPlayerSpells(playerSpells);
            
            // Start battle
            this.gameManager.startBattle();
            
            // Check if battle is initialized
            if (this.gameManager.gameState.currentState !== 'battle') {
                throw new Error('Battle not started');
            }
            
            // Check if battle state is initialized
            if (!this.gameManager.battleState) {
                throw new Error('Battle state not initialized');
            }
            
            // Check if opponent is created
            if (!this.gameManager.opponent) {
                throw new Error('Opponent not created');
            }
            
            // End battle
            this.gameManager.endBattle(true); // Player wins
            
            // Check if game state is updated
            if (this.gameManager.gameState.currentState !== 'results') {
                throw new Error('Game state not updated after ending battle');
            }
            
            // Return to main menu
            this.gameManager.returnToMainMenu();
            
            // Check if game state is updated
            if (this.gameManager.gameState.currentState !== 'mainMenu') {
                throw new Error('Game state not updated after returning to main menu');
            }
        });
    }
    
    addComponentInteractionTests() {
        // Test spell system and duel system interaction
        this.testSuite.addTest('Spell System and Duel System Interaction', async () => {
            const spellSystem = this.gameManager.spellSystem;
            const duelSystem = this.gameManager.duelSystem;
            
            // Get a test spell
            const testSpell = spellSystem.getSpellById('fireball');
            if (!testSpell) {
                throw new Error('Test spell not found');
            }
            
            // Set up a test battle state
            const battleState = {
                player: {
                    health: 100,
                    maxHealth: 100,
                    mana: 100,
                    maxMana: 100
                },
                opponent: {
                    health: 100,
                    maxHealth: 100,
                    mana: 100,
                    maxMana: 100
                },
                turn: 'player'
            };
            
            // Cast spell
            const result = duelSystem.castSpell(testSpell, 'player', battleState);
            
            // Check if spell was cast successfully
            if (!result) {
                throw new Error('Failed to cast spell');
            }
            
            // Check if mana was deducted
            if (battleState.player.mana >= 100) {
                throw new Error('Mana not deducted after casting spell');
            }
            
            // Check if damage was applied
            if (battleState.opponent.health >= 100) {
                throw new Error('Damage not applied after casting spell');
            }
        });
        
        // Test progression system and spell system interaction
        this.testSuite.addTest('Progression System and Spell System Interaction', async () => {
            const progressionSystem = this.gameManager.progressionSystem;
            const spellSystem = this.gameManager.spellSystem;
            
            // Get initial progress
            const initialProgress = spellSystem.getPlayerProgress();
            const initialWins = initialProgress.wins;
            const initialUnlocked = spellSystem.playerUnlockedSpells.length;
            
            // Process a win
            const result = progressionSystem.processBattleResult(true, 'normal', []);
            
            // Check if win was recorded
            const newProgress = spellSystem.getPlayerProgress();
            if (newProgress.wins !== initialWins + 1) {
                throw new Error('Win not recorded in player progress');
            }
            
            // Reset progress
            spellSystem.playerProgress.wins = initialWins;
            
            // If a new spell was unlocked, remove it
            if (spellSystem.playerUnlockedSpells.length > initialUnlocked) {
                spellSystem.playerUnlockedSpells.pop();
            }
        });
        
        // Test AI and duel system interaction
        this.testSuite.addTest('AI and Duel System Interaction', async () => {
            const aiDifficultyManager = this.gameManager.aiDifficultyManager;
            const duelSystem = this.gameManager.duelSystem;
            
            // Create an opponent
            const opponent = aiDifficultyManager.createOpponent();
            
            // Set up a test battle state
            const battleState = {
                player: {
                    health: 80,
                    maxHealth: 100,
                    mana: 80,
                    maxMana: 100
                },
                opponent: {
                    health: 80,
                    maxHealth: 100,
                    mana: 80,
                    maxMana: 100
                },
                turn: 'opponent'
            };
            
            // Choose a spell
            const spell = opponent.chooseSpell(opponent.spells, battleState);
            
            // Cast the chosen spell
            const result = duelSystem.castSpell(spell, 'opponent', battleState);
            
            // Check if spell was cast successfully
            if (!result) {
                throw new Error('Failed to cast AI-chosen spell');
            }
            
            // Check if mana was deducted
            if (battleState.opponent.mana >= 80) {
                throw new Error('Mana not deducted after casting AI-chosen spell');
            }
            
            // Check if effects were applied (either damage to player or healing to opponent)
            if (spell.damage > 0 && battleState.player.health >= 80) {
                throw new Error('Damage not applied after casting AI-chosen spell');
            }
            
            if (spell.healing > 0 && battleState.opponent.health <= 80) {
                throw new Error('Healing not applied after casting AI-chosen spell');
            }
        });
    }
    
    async runTests() {
        return await this.testSuite.runTests();
    }
    
    getResults() {
        return this.testSuite.getResults();
    }
}

// Debug Utilities
export class DebugUtilities {
    constructor(gameManager) {
        this.gameManager = gameManager;
    }
    
    logGameState() {
        console.log('Current Game State:', this.gameManager.gameState);
    }
    
    logBattleState() {
        console.log('Current Battle State:', this.gameManager.battleState);
    }
    
    logPlayerProgress() {
        console.log('Player Progress:', this.gameManager.spellSystem.getPlayerProgress());
    }
    
    logUnlockedSpells() {
        console.log('Unlocked Spells:', this.gameManager.spellSystem.getUnlockedSpells());
    }
    
    logAIOpponent() {
        console.log('Current AI Opponent:', this.gameManager.opponent);
    }
    
    resetPlayerProgress() {
        this.gameManager.spellSystem.resetProgress();
        this.gameManager.progressionSystem.resetProgress();
        console.log('Player progress reset');
    }
    
    unlockAllSpells() {
        const allSpellIds = Object.keys(this.gameManager.spellSystem.spells);
        this.gameManager.spellSystem.playerUnlockedSpells = [...allSpellIds];
        console.log('All spells unlocked');
    }
    
    setDifficulty(difficulty) {
        this.gameManager.aiDifficultyManager.setDifficulty(difficulty);
        console.log(`Difficulty set to ${difficulty}`);
    }
    
    simulateBattle(turns = 5) {
        console.log(`Simulating ${turns} battle turns...`);
        
        // Set up a test battle
        const playerSpells = this.gameManager.spellSystem.getInitialPlayerSpells();
        this.gameManager.setPlayerSpells(playerSpells);
        this.gameManager.startBattle();
        
        // Simulate turns
        for (let i = 0; i < turns; i++) {
            console.log(`Turn ${i + 1}:`);
            
            // Player turn
            if (this.gameManager.battleState.turn === 'player') {
                const playerSpell = playerSpells[Math.floor(Math.random() * playerSpells.length)];
                console.log(`Player casts ${playerSpell.name}`);
                this.gameManager.duelSystem.castSpell(playerSpell, 'player', this.gameManager.battleState);
                this.gameManager.battleState.turn = 'opponent';
            } 
            // Opponent turn
            else {
                const opponentSpell = this.gameManager.opponent.chooseSpell(
                    this.gameManager.opponent.spells, 
                    this.gameManager.battleState
                );
                console.log(`Opponent casts ${opponentSpell.name}`);
                this.gameManager.duelSystem.castSpell(opponentSpell, 'opponent', this.gameManager.battleState);
                this.gameManager.battleState.turn = 'player';
            }
            
            // Log battle state after turn
            console.log('Battle State:', {
                player: {
                    health: this.gameManager.battleState.player.health,
                    mana: this.gameManager.battleState.player.mana
                },
                opponent: {
                    health: this.gameManager.battleState.opponent.health,
                    mana: this.gameManager.battleState.opponent.mana
                },
                turn: this.gameManager.battleState.turn
            });
            
            // Check if battle is over
            if (this.gameManager.battleState.player.health <= 0 || 
                this.gameManager.battleState.opponent.health <= 0) {
                const playerWon = this.gameManager.battleState.opponent.health <= 0;
                console.log(`Battle ended. Player ${playerWon ? 'won' : 'lost'}`);
                this.gameManager.endBattle(playerWon);
                break;
            }
        }
        
        // Return to main menu
        this.gameManager.returnToMainMenu();
    }
    
    testPerformance() {
        console.log('Running performance tests...');
        
        // Test spell casting performance
        console.time('1000 spell casts');
        const testSpell = this.gameManager.spellSystem.getSpellById('fireball');
        const battleState = {
            player: {
                health: 100,
                maxHealth: 100,
                mana: 10000, // Enough mana for all casts
                maxMana: 10000
            },
            opponent: {
                health: 10000, // Enough health to survive all casts
                maxHealth: 10000,
                mana: 100,
                maxMana: 100
            },
            turn: 'player'
        };
        
        for (let i = 0; i < 1000; i++) {
            this.gameManager.duelSystem.castSpell(testSpell, 'player', battleState);
        }
        console.timeEnd('1000 spell casts');
        
        // Test AI decision making performance
        console.time('100 AI decisions');
        const opponent = this.gameManager.aiDifficultyManager.createOpponent();
        for (let i = 0; i < 100; i++) {
            opponent.chooseSpell(opponent.spells, battleState);
        }
        console.timeEnd('100 AI decisions');
        
        // Test UI rendering performance
        console.time('10 screen transitions');
        for (let i = 0; i < 10; i++) {
            this.gameManager.uiManager.showScreen('loading');
            this.gameManager.uiManager.showScreen('main-menu');
        }
        console.timeEnd('10 screen transitions');
    }
}
