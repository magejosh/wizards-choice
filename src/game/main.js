// Main entry point for Wizard's Choice game

import { GameManager } from './managers/GameManager.js';
import { UIManager } from './managers/UIManager.js';
import { SceneManager } from './managers/SceneManager.js';
import { SpellManager } from './managers/SpellManager.js';
import { AudioManager } from './managers/AudioManager.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Wizard\'s Choice...');
    
    // Initialize game managers
    const gameManager = new GameManager();
    const uiManager = new UIManager();
    const sceneManager = new SceneManager();
    const spellManager = new SpellManager();
    const audioManager = new AudioManager();
    
    // Connect managers
    gameManager.init(uiManager, sceneManager, spellManager, audioManager);
    
    // Show loading screen
    uiManager.showScreen('loading-screen');
    
    // Initialize game assets and then show main menu
    Promise.all([
        sceneManager.init(),
        spellManager.init(),
        audioManager.init()
    ]).then(() => {
        console.log('Game initialized successfully');
        uiManager.hideScreen('loading-screen');
        uiManager.showScreen('main-menu');
        
        // Set up event listeners for main menu
        document.getElementById('start-game').addEventListener('click', () => {
            gameManager.startNewGame();
        });
        
        document.getElementById('options').addEventListener('click', () => {
            // To be implemented
            console.log('Options menu clicked');
        });
    }).catch(error => {
        console.error('Error initializing game:', error);
        alert('Failed to initialize game. Please refresh the page and try again.');
    });
});
