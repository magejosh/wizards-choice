// Main entry point for Wizard's Choice game

import { GameManager } from './managers/GameManager.js';
import EnhancedUIManager from './ui/EnhancedUIManager.js';
import { SceneManager } from './managers/SceneManager.js';
import EnhancedSpellSystem from './core/EnhancedSpellSystem.js';
import { AudioManager } from './managers/AudioManager.js';
import { ProgressionSystem } from './core/ProgressionSystem.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Wizard\'s Choice...');
    
    // Force our enhanced styles to have higher priority
    const enhancedStyleLink = document.querySelector('link[href="css/enhanced-style.css"]');
    if (!enhancedStyleLink) {
        // If enhanced-style.css link doesn't exist, create it
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/enhanced-style.css';
        // Add !important to all CSS rules by injecting a style tag
        const styleTag = document.createElement('style');
        styleTag.textContent = `
            /* Force horizontal layout for spell selection screen with flex */
            #available-spells-container {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: wrap !important;
                justify-content: space-evenly !important;
                align-items: flex-start !important;
                gap: 5px !important;
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 auto !important;
                padding: 0 !important;
            }
            
            /* Spell cards on selection screen - smaller size */
            .selectable-spell {
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
            }
            
            /* Horizontal layout for battle spell cards - with flex */
            .spells-container {
                display: flex !important;
                flex-direction: row !important;
                flex-wrap: wrap !important;
                justify-content: center !important;
                gap: 5px !important;
                width: 100% !important;
                padding: 5px !important;
                margin: 5px auto !important;
            }
            
            /* Battle spell buttons - smaller size */
            .spell-button {
                position: relative !important;
                width: 140px !important;
                height: auto !important;
                min-height: 0 !important;
                padding: 6px !important;
                margin: 2px !important;
                border-radius: 8px !important;
                background-color: rgba(30, 30, 60, 0.8) !important;
                border: 2px solid rgba(100, 100, 200, 0.5) !important;
                color: white !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
                display: flex !important;
                flex-direction: column !important;
                text-align: center !important;
                flex: 0 0 auto !important;
                font-size: 0.9rem !important;
            }
        `;
        document.head.appendChild(styleTag);
        document.head.appendChild(link);
    }
    
    // Initialize game
    async function initGame() {
        console.log('Initializing game...');
        
        // Initialize game managers
        const gameManager = new GameManager();
        const uiManager = new EnhancedUIManager();
        const sceneManager = new SceneManager();
        const spellSystem = new EnhancedSpellSystem();
        const audioManager = new AudioManager();
        const progressionSystem = new ProgressionSystem(spellSystem);
        
        // Expose game manager for debugging
        window.gameManager = gameManager;
        
        // Connect managers
        gameManager.init(uiManager, sceneManager, spellSystem, audioManager, progressionSystem);
        
        // Show loading screen
        uiManager.showScreen('loading-screen');
        
        // Initialize game assets and then show main menu
        Promise.all([
            sceneManager.init(),
            spellSystem.init(),
            audioManager.init()
        ]).then(() => {
            // Initialize progression system with spell system
            progressionSystem.init(spellSystem);
            
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
    }
    
    initGame();
});
