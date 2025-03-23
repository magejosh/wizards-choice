// UI Event Manager for Wizard's Choice
// Handles event handling for UI elements

class UIEventManager {
    constructor() {
        this.activeAnimations = [];
        this.eventListeners = {};
        this.initialized = false;
    }
    
    async init() {
        console.log('Initializing UIEventManager');
        try {
            this.setupEventListeners();
            this.initialized = true;
            console.log('UIEventManager initialization complete');
            return true;
        } catch (error) {
            console.error('Error initializing UI Event manager:', error);
            this.initialized = true; // Mark as initialized even if there's an error to prevent blocking
            throw error;
        }
    }
    
    setupEventListeners() {
        // Add hover effects for buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.playButtonHoverEffect(button);
            });
        });
        
        // Add menu button event listener
        const menuButton = document.getElementById('menu-btn');
        if (menuButton) {
            menuButton.addEventListener('click', () => {
                // Create or toggle menu popup
                this.emit('toggleMenu');
            });
        }
    }
    
    // Animation methods
    animateSpellSelection(spellButton) {
        spellButton.classList.add('spell-selected');
    }
    
    animateChoiceSelection(choiceButton) {
        choiceButton.classList.add('choice-selected');
    }
    
    playButtonHoverEffect(button) {
        button.classList.add('button-hover');
        
        // Remove class after animation completes
        setTimeout(() => {
            button.classList.remove('button-hover');
        }, 300);
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
    
    // Event emitter pattern
    on(eventName, callback) {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(callback);
    }
    
    emit(eventName, ...args) {
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName].forEach(callback => {
                callback(...args);
            });
        }
    }
    
    removeListener(eventName, callback) {
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName] = this.eventListeners[eventName].filter(
                listener => listener !== callback
            );
        }
    }
}

export default UIEventManager;
