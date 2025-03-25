p--------------------------[]



























































































































































































































































































































1````111// Main entry point for Wizard's Choice game

import { AudioManager } from './managers/AudioManager.js';
import { GameStateManager } from './managers/GameStateManager.js';
import { ProgressionSystem } from './core/ProgressionSystem.js';
import { SceneManager } from './managers/SceneManager.js';
import EnhancedSpellSystem from './core/EnhancedSpellSystem.js';
import EnhancedUIManager from './ui/EnhancedUIManager.js';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Wizard\'s Choice...');
    
    // Force all required stylesheets to be loaded with !important rules
    ensureStylesheetsLoaded();
    
    // Initialize game
    initGame();
});

// Function to ensure all required stylesheets are loaded
function ensureStylesheetsLoaded() {
    // Create an array of required stylesheets
    const requiredStylesheets = [
        { href: 'styles/style.css', id: 'base-style' },
        { href: 'styles/enhanced-style.css', id: 'enhanced-style' },
        { href: 'styles/scene-overlay.css', id: 'scene-overlay' }
    ];
    
    // Check for each stylesheet and add if missing
    requiredStylesheets.forEach(sheet => {
        const existingLink = document.querySelector(`link[href="${sheet.href}"]`);
        if (!existingLink) {
            console.log(`Adding missing stylesheet: ${sheet.href}`);
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = sheet.href;
            link.id = sheet.id;
            document.head.appendChild(link);
        } else {
            console.log(`Stylesheet already exists: ${sheet.href}`);
            // Ensure it has the highest priority by re-appending it
            document.head.appendChild(existingLink);
        }
    });
    
    // Add !important to all CSS rules by injecting a style tag
    const styleTag = document.createElement('style');
    styleTag.id = 'priority-overrides';
    styleTag.textContent = `
        /* Reset any conflicting styles */
        #game-ui.hidden {
            display: none !important;
            visibility: hidden !important;
        }
        
        #game-ui:not(.hidden).scene-integrated {
            display: flex !important;
            flex-direction: column !important;
            height: 100vh !important;
            width: 100vw !important;
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
        }
        
        /* Battle container takes up the top 2/3 of the screen */
        #battle-container {
            position: relative !important;
            width: 100% !important; 
            height: 66vh !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
        }
        
        /* Battle scene fills the entire container */
        #battle-scene {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            z-index: 1 !important;
        }
        
        /* Hide old UI elements */
        #player-info, 
        #opponent-info, 
        #battle-info {
            display: none !important;
            visibility: hidden !important;
            width: 0 !important;
            height: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }
        
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
    `;
    document.head.appendChild(styleTag);
    
    console.log('All required stylesheets loaded and CSS priority enforced');
}

// Initialize game
async function initGame() {
    console.log('Initializing game...');
    
    // Initialize game managers
    const gameStateManager = new GameStateManager();
    const uiManager = new EnhancedUIManager();
    const sceneManager = new SceneManager();
    const spellSystem = new EnhancedSpellSystem();
    const audioManager = new AudioManager();
    const progressionSystem = new ProgressionSystem(spellSystem);
    
    // Expose game manager for debugging
    window.gameStateManager = gameStateManager;
    
    // Connect managers
    gameStateManager.init(uiManager, sceneManager, spellSystem, progressionSystem);
    
    // Show loading screen
    uiManager.showScreen('loading-screen');
    
    // Ensure game UI has the scene-integrated class
    const gameUI = document.getElementById('game-ui');
    if (gameUI) {
        console.log('Adding scene-integrated class to game-ui');
        gameUI.classList.add('scene-integrated');
        
        // Create overlay containers if they don't exist
        ensureOverlayElements();
    } else {
        console.error('Game UI element not found!');
    }
    
    // Initialize game assets and then show main menu
    Promise.all([
        sceneManager.init(document.getElementById('battle-scene')),
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
            gameStateManager.startNewGame();
        });
        
        document.getElementById('options').addEventListener('click', () => {
            uiManager.showScreen('settings-screen');
            uiManager.hideScreen('main-menu');
        });
        
        // Add event listener for the close settings button
        const closeSettingsBtn = document.getElementById('close-settings-btn');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => {
                uiManager.hideScreen('settings-screen');
                uiManager.showScreen('main-menu');
            });
        }
    }).catch(error => {
        console.error('Error initializing game:', error);
        alert('Failed to initialize game. Please refresh the page and try again.');
    });
}

// Ensure all required overlay elements exist
function ensureOverlayElements() {
    const battleContainer = document.getElementById('battle-container');
    
    // If the battle container doesn't exist, create it
    if (!battleContainer) {
        console.log('Creating battle-container element');
        const gameUI = document.getElementById('game-ui');
        
        // Create battle container
        const newBattleContainer = document.createElement('div');
        newBattleContainer.id = 'battle-container';
        
        // Move battle scene into it if it exists
        const battleScene = document.getElementById('battle-scene');
        if (battleScene) {
            newBattleContainer.appendChild(battleScene);
        } else {
            // Create battle scene if it doesn't exist
            const newBattleScene = document.createElement('div');
            newBattleScene.id = 'battle-scene';
            newBattleContainer.appendChild(newBattleScene);
        }
        
        // Create overlay elements if they don't exist
        const overlayElements = [
            {
                id: 'player-stats-overlay',
                className: 'stats-overlay',
                html: `
                    <div class="overlay-name">Your Wizard - Level <span id="player-level">1</span></div>
                    <div class="overlay-stat">
                        <div class="overlay-stat-label">
                            <span>HP</span>
                            <span id="player-health-text">100/100</span>
                        </div>
                        <div class="overlay-bar">
                            <div id="player-health-fill" class="overlay-bar-fill overlay-health-fill" style="width: 100%;"></div>
                        </div>
                    </div>
                    <div class="overlay-stat">
                        <div class="overlay-stat-label">
                            <span>MP</span>
                            <span id="player-mana-text">100/100</span>
                        </div>
                        <div class="overlay-bar">
                            <div id="player-mana-fill" class="overlay-bar-fill overlay-mana-fill" style="width: 100%;"></div>
                        </div>
                    </div>
                    <div class="overlay-stat">
                        <div class="overlay-stat-label">
                            <span>XP</span>
                            <span id="player-exp-text"><span id="exp-current-value">0</span>/<span id="exp-next-value">100</span></span>
                        </div>
                        <div class="overlay-bar">
                            <div id="player-exp-fill" class="overlay-bar-fill overlay-exp-fill" style="width: 0%;"></div>
                        </div>
                    </div>
                `
            },
            {
                id: 'enemy-stats-overlay',
                className: 'stats-overlay',
                html: `
                    <div class="overlay-name">Enemy Wizard</div>
                    <div class="overlay-stat">
                        <div class="overlay-stat-label">
                            <span>HP</span>
                            <span id="enemy-health-text">100/100</span>
                        </div>
                        <div class="overlay-bar">
                            <div id="enemy-health-fill" class="overlay-bar-fill overlay-health-fill" style="width: 100%;"></div>
                        </div>
                    </div>
                    <div class="overlay-stat">
                        <div class="overlay-stat-label">
                            <span>MP</span>
                            <span id="enemy-mana-text">100/100</span>
                        </div>
                        <div class="overlay-bar">
                            <div id="enemy-mana-fill" class="overlay-bar-fill overlay-mana-fill" style="width: 100%;"></div>
                        </div>
                    </div>
                    <div class="overlay-stat">
                        <div class="overlay-stat-label">
                            <span>Difficulty</span>
                            <span id="enemy-difficulty">Normal</span>
                        </div>
                    </div>
                `
            },
            {
                id: 'battle-info-overlay',
                className: 'stats-overlay',
                html: `
                    <div class="overlay-name">Battle Info</div>
                    <div class="overlay-stat">
                        <div class="overlay-stat-label">
                            <span>Turn</span>
                            <span id="turn-counter">1</span>
                        </div>
                    </div>
                    <div class="overlay-stat">
                        <div class="overlay-stat-label">
                            <span>Spells Cast</span>
                            <span id="spells-cast">0</span>
                        </div>
                    </div>
                    <div id="battle-log">
                        <div class="log-entry">Battle started against Enemy Wizard</div>
                    </div>
                `
            }
        ];
        
        // Add overlay elements to battle container
        overlayElements.forEach(el => {
            if (!document.getElementById(el.id)) {
                console.log(`Creating ${el.id} element`);
                const overlayElement = document.createElement('div');
                overlayElement.id = el.id;
                overlayElement.className = el.className;
                overlayElement.innerHTML = el.html;
                newBattleContainer.appendChild(overlayElement);
            }
        });
        
        // Add battle container to game UI at the beginning
        gameUI.insertBefore(newBattleContainer, gameUI.firstChild);
        
        // Create spell container if it doesn't exist
        if (!document.getElementById('spell-container')) {
            console.log('Creating spell-container element');
            const spellContainer = document.createElement('div');
            spellContainer.id = 'spell-container';
            
            // Create spell choices container
            const spellChoices = document.createElement('div');
            spellChoices.id = 'spell-choices';
            spellContainer.appendChild(spellChoices);
            
            // Add spell container to game UI
            gameUI.appendChild(spellContainer);
        }
    } else {
        console.log('Battle container already exists');
        
        // Check if overlay elements exist inside battle container and create if needed
        const overlayElements = ['player-stats-overlay', 'enemy-stats-overlay', 'battle-info-overlay'];
        overlayElements.forEach(id => {
            if (!document.getElementById(id)) {
                console.log(`Overlay element ${id} missing, needs to be created`);
            } else {
                console.log(`Overlay element ${id} exists`);
            }
        });
    }
}
