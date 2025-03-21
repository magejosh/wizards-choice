// Game Loop Module
// Handles the main game loop and integrates all core systems

import { GameState } from './GameState.js';
import { DuelSystem } from './DuelSystem.js';
import { ChoiceSystem } from './ChoiceSystem.js';

export class GameLoop {
    constructor(gameManager, uiManager, sceneManager, spellManager, audioManager) {
        this.gameManager = gameManager;
        this.uiManager = uiManager;
        this.sceneManager = sceneManager;
        this.spellManager = spellManager;
        this.audioManager = audioManager;
        
        // Initialize core systems
        this.gameState = new GameState();
        this.duelSystem = new DuelSystem(gameManager, uiManager, sceneManager, audioManager);
        this.choiceSystem = new ChoiceSystem(this.gameState, uiManager);
        
        // Game configuration
        this.config = {
            defaultDifficulty: 'normal',
            turnDelay: 500, // milliseconds between turns
            animationDuration: 1000 // milliseconds for animations
        };
        
        // Initialize event listeners
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Main menu buttons
        document.getElementById('start-game').addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('options').addEventListener('click', () => {
            // To be implemented in future
            console.log('Options menu clicked');
        });
        
        // Game over screen buttons
        document.getElementById('play-again').addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('return-to-menu').addEventListener('click', () => {
            this.returnToMainMenu();
        });
    }
    
    startNewGame() {
        console.log('Starting new game');
        
        // Get player spells from spell manager
        const playerSpells = this.spellManager.getInitialPlayerSpells();
        
        // Present difficulty choice to player
        this.choiceSystem.presentDifficultyChoices((difficulty) => {
            // Get opponent spells based on difficulty
            const opponentSpells = this.spellManager.getInitialOpponentSpells(difficulty);
            
            // Start the duel
            this.duelSystem.startNewDuel(playerSpells, opponentSpells, difficulty);
        });
    }
    
    returnToMainMenu() {
        console.log('Returning to main menu');
        
        // Reset game state
        this.duelSystem.resetDuel();
        
        // Show main menu
        this.uiManager.hideScreen('game-ui');
        this.uiManager.hideScreen('game-over');
        this.uiManager.showScreen('main-menu');
        
        // Play menu music
        this.audioManager.playMusic('menu');
    }
    
    // Method to handle game state updates
    update() {
        // This would be called in a requestAnimationFrame loop
        // For this MVP, we're using event-driven updates instead
        
        // Check current game state
        const currentState = this.gameState.getCurrentState();
        
        // Update based on state
        switch (currentState) {
            case 'battle':
                // Update battle animations
                break;
                
            case 'gameOver':
                // Update game over animations
                break;
                
            default:
                // No updates needed for other states
                break;
        }
    }
    
    // Method to handle player input
    handleInput(inputType, data) {
        // This would handle various types of player input
        // For this MVP, we're using direct event listeners instead
        
        switch (inputType) {
            case 'spellSelect':
                // Handle spell selection
                break;
                
            case 'menuSelect':
                // Handle menu selection
                break;
                
            default:
                console.warn('Unknown input type:', inputType);
                break;
        }
    }
    
    // Get the current game state
    getGameState() {
        return this.gameState;
    }
    
    // Get the duel system
    getDuelSystem() {
        return this.duelSystem;
    }
    
    // Get the choice system
    getChoiceSystem() {
        return this.choiceSystem;
    }
}
