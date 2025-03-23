// Enhanced UI Manager for Wizard's Choice
// Handles all UI interactions, updates, and visual elements
import ScreenManager from './ScreenManager.js';
import UIElementManager from './UIElementManager.js';
import UIEventManager from './UIEventManager.js';

class EnhancedUIManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.screenManager = new ScreenManager();
        this.uiElementManager = new UIElementManager(gameState);
        this.uiEventManager = new UIEventManager();
        
        // Set up event listeners between components
        this.uiEventManager.on('toggleMenu', () => {
            this.screenManager.toggleMenuPopup();
        });
    }
    
    async init() {
        console.log('Initializing EnhancedUIManager');
        try {
            // Initialize all managers
            await Promise.all([
                this.screenManager.init(),
                this.uiElementManager.init(),
                this.uiEventManager.init()
            ]);
            
            console.log('EnhancedUIManager initialization complete');
            return true;
        } catch (error) {
            console.error('Error initializing UI manager:', error);
            throw error;
        }
    }
    
    // Screen management methods
    showScreen(screenId) {
        return this.screenManager.showScreen(screenId);
    }
    
    hideScreen(screenId) {
        return this.screenManager.hideScreen(screenId);
    }
    
    hideAllScreens() {
        return this.screenManager.hideAllScreens();
    }
    
    returnToMainMenu() {
        return this.screenManager.returnToMainMenu();
    }
    
    toggleMenuPopup() {
        return this.screenManager.toggleMenuPopup();
    }
    
    // UI element update methods
    updatePlayerInfo(player) {
        return this.uiElementManager.updatePlayerInfo(player);
    }
    
    updateOpponentInfo(opponent) {
        return this.uiElementManager.updateOpponentInfo(opponent);
    }
    
    displaySpellChoices(spells, onSpellSelected) {
        return this.uiElementManager.displaySpellChoices(spells, onSpellSelected);
    }
    
    highlightSelectedSpell(selectedButton) {
        return this.uiElementManager.highlightSelectedSpell(selectedButton);
    }
    
    displayChoices(choices, onChoiceSelected) {
        return this.uiElementManager.displayChoices(choices, onChoiceSelected);
    }
    
    clearChoices() {
        return this.uiElementManager.clearChoices();
    }
    
    addToBattleLog(message) {
        return this.uiElementManager.addToBattleLog(message);
    }
    
    clearBattleLog() {
        return this.uiElementManager.clearBattleLog();
    }
    
    updateBattleLog(message) {
        return this.uiElementManager.updateBattleLog(message);
    }
    
    showSpellEffect(spellType, targetElement) {
        return this.uiElementManager.showSpellEffect(spellType, targetElement);
    }
    
    updateGameOverScreen(result) {
        return this.uiElementManager.updateGameOverScreen(result);
    }
    
    updateBattleInfo(gameState) {
        return this.uiElementManager.updateBattleInfo(gameState);
    }
    
    // UI event methods
    animateSpellSelection(spellButton) {
        return this.uiEventManager.animateSpellSelection(spellButton);
    }
    
    animateChoiceSelection(choiceButton) {
        return this.uiEventManager.animateChoiceSelection(choiceButton);
    }
    
    playButtonHoverEffect(button) {
        return this.uiEventManager.playButtonHoverEffect(button);
    }
    
    showNotification(message, type = 'info') {
        return this.uiEventManager.showNotification(message, type);
    }
}

export default EnhancedUIManager;
