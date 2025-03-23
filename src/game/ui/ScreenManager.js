// Screen Manager for Wizard's Choice
// Handles screen transitions and visibility

class ScreenManager {
    constructor() {
        this.screens = [
            'loading-screen',
            'main-menu',
            'settings-screen',
            'game-ui',
            'game-over',
            'results-screen',
            'spell-selection-screen'
        ];
        this.uiElements = {};
        this.initialized = false;
        this.container = document.getElementById('game-container');
    }
    
    async init() {
        console.log('Initializing ScreenManager');
        return new Promise((resolve, reject) => {
            // Wait a short time to ensure DOM is fully loaded
            setTimeout(() => {
                try {
                    console.log('Dom should be ready, looking for UI elements');
                    // Try to find all the required UI elements
                    this.screens.forEach(screenId => {
                        const element = document.getElementById(screenId);
                        if (element) {
                            console.log(`Found UI element: ${screenId}`);
                            this.uiElements[screenId] = element;
                        } else {
                            console.warn(`UI element not found: ${screenId}`);
                        }
                    });
                    
                    // Log all found and missing elements
                    console.log('Found UI elements:', Object.keys(this.uiElements));
                    const missingElements = this.screens.filter(id => !this.uiElements[id]);
                    if (missingElements.length > 0) {
                        console.warn('Missing UI elements:', missingElements);
                        
                        // Try to find the spell selection screen again
                        // Sometimes elements are not found on the first pass
                        missingElements.forEach(id => {
                            const element = document.getElementById(id);
                            if (element) {
                                console.log(`Found UI element on second pass: ${id}`);
                                this.uiElements[id] = element;
                            }
                        });
                    }
                    
                    // Log all found and missing elements again
                    console.log('Found UI elements after retry:', Object.keys(this.uiElements));
                    const missingElementsAfterRetry = this.screens.filter(id => !this.uiElements[id]);
                    if (missingElementsAfterRetry.length > 0) {
                        console.warn('Missing UI elements after retry:', missingElementsAfterRetry);
                    }
                    
                    // Check if main container exists
                    const gameContainer = document.getElementById('game-container');
                    if (gameContainer) {
                        console.log('Game container found');
                        console.log('Game container children:', gameContainer.children.length);
                        // Log the HTML structure for debugging
                        console.log('Game container HTML:', gameContainer.innerHTML.substring(0, 200) + '...');
                    } else {
                        console.error('Game container not found!');
                    }
                    
                    this.setupResponsiveHandlers();
                    this.hideAllScreens();
                    this.initialized = true;
                    console.log('ScreenManager initialization complete');
                    
                    // Resolve the promise to signal completion
                    resolve(true);
                } catch (error) {
                    console.error('Error initializing Screen manager:', error);
                    // Even if there's an error, try to mark as initialized to prevent blocking
                    this.initialized = true;
                    reject(error);
                }
            }, 200); // Longer timeout to ensure DOM is ready
        });
    }
    
    setupResponsiveHandlers() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
        
        // Initial resize handling
        this.handleResize();
    }
    
    handleResize() {
        // Adjust UI based on screen size
        const width = window.innerWidth;
        
        if (width < 768) {
            // Mobile layout adjustments
            document.body.classList.add('mobile');
            document.body.classList.remove('desktop');
        } else {
            // Desktop layout adjustments
            document.body.classList.add('desktop');
            document.body.classList.remove('mobile');
        }
    }
    
    showScreen(screenId) {
        console.log(`Attempting to show screen: ${screenId}`);
        let screen = this.uiElements[screenId] || document.getElementById(screenId);
        
        // If screen doesn't exist and it's the spell selection screen, create it
        if (!screen && screenId === 'spell-selection-screen') {
            console.log('Spell selection screen not found, creating it dynamically');
            screen = document.createElement('div');
            screen.id = 'spell-selection-screen';
            screen.className = 'hidden';
            screen.innerHTML = `
                <h2>Choose Your Spells</h2>
                <p>Select 3 spells to add to your hand for this battle:</p>
                <div id="available-spells-container"></div>
                <div class="spell-selection-footer">
                    <span id="spells-selected-counter">0/3 Spells Selected</span>
                    <button id="start-battle-button" disabled>Start Battle</button>
                </div>
            `;
            
            // Add to the game container
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                gameContainer.appendChild(screen);
                this.uiElements[screenId] = screen;
                console.log('Created and added spell selection screen to the DOM');
            } else {
                console.error('Game container not found, cannot add spell selection screen');
            }
        }
        
        if (screen) {
            console.log(`Found screen element: ${screenId}, adding 'active' class and removing 'hidden' class`);
            
            // First hide all screens
            this.hideAllScreens();
            
            // Then show the requested screen
            screen.classList.remove('hidden');
            screen.classList.add('active');
            
            // Check if the classes were actually modified (debugging)
            setTimeout(() => {
                console.log(`Screen ${screenId} has classes: ${screen.className}`);
                if (!screen.classList.contains('active')) {
                    console.warn(`Failed to add 'active' class to ${screenId}`);
                } else {
                    console.log(`Successfully showed screen: ${screenId}`);
                }
            }, 0);
        } else {
            console.error(`Screen element not found: ${screenId}`);
        }
    }
    
    returnToMainMenu() {
        console.log('Returning to main menu');
        this.hideAllScreens();
        this.showScreen('main-menu');
    }
    
    hideScreen(screenId) {
        console.log(`Attempting to hide screen: ${screenId}`);
        const screen = this.uiElements[screenId] || document.getElementById(screenId);
        
        if (screen) {
            console.log(`Found screen element: ${screenId}, removing 'active' class and adding 'hidden' class`);
            screen.classList.add('hidden');
            screen.classList.remove('active');
            
            // Check if the classes were actually modified (debugging)
            setTimeout(() => {
                console.log(`Screen ${screenId} has classes: ${screen.className}`);
                if (screen.classList.contains('active')) {
                    console.warn(`Failed to remove 'active' class from ${screenId}`);
                } else {
                    console.log(`Successfully hid screen: ${screenId}`);
                }
            }, 0);
        } else {
            console.warn(`Screen element not found: ${screenId}`);
        }
    }
    
    hideAllScreens() {
        console.log('Hiding all screens');
        this.screens.forEach(screenId => {
            // Check if the screen exists before trying to hide it
            const screen = this.uiElements[screenId] || document.getElementById(screenId);
            if (screen) {
                screen.classList.add('hidden');
                screen.classList.remove('active');
                console.log(`Hidden screen: ${screenId}`);
            } else {
                console.warn(`Cannot hide screen ${screenId}: element not found`);
            }
        });
    }
    
    // Toggle the menu popup
    toggleMenuPopup() {
        // Check if menu popup already exists
        let menuPopup = document.getElementById('menu-popup');
        
        // If it exists, toggle its visibility
        if (menuPopup) {
            if (menuPopup.style.display === 'none' || menuPopup.classList.contains('hidden')) {
                menuPopup.style.display = 'block';
                menuPopup.classList.remove('hidden');
                // Add fade-in animation
                menuPopup.style.animation = 'fadeIn 0.2s ease-out forwards';
            } else {
                // Add fade-out animation and then hide
                menuPopup.style.animation = 'fadeOut 0.2s ease-out forwards';
                setTimeout(() => {
                    menuPopup.style.display = 'none';
                }, 200);
            }
            return;
        }
        
        // Create the menu popup if it doesn't exist
        menuPopup = document.createElement('div');
        menuPopup.id = 'menu-popup';
        menuPopup.className = 'menu-popup';
        
        // Create menu items
        const returnToMenuBtn = document.createElement('button');
        returnToMenuBtn.className = 'menu-popup-item';
        returnToMenuBtn.textContent = 'Return to Main Menu';
        returnToMenuBtn.addEventListener('click', () => {
            this.returnToMainMenu();
            this.toggleMenuPopup(); // Hide menu popup
        });
        
        const toggleSoundBtn = document.createElement('button');
        toggleSoundBtn.className = 'menu-popup-item';
        toggleSoundBtn.textContent = 'Toggle Sound';
        toggleSoundBtn.addEventListener('click', () => {
            // Implement sound toggle functionality later
            // Show notification
            const notification = document.createElement('div');
            notification.classList.add('notification', 'notification-info');
            notification.textContent = 'Sound toggle not implemented yet';
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
            
            this.toggleMenuPopup(); // Hide menu popup
        });
        
        const closeMenuBtn = document.createElement('button');
        closeMenuBtn.className = 'menu-popup-item';
        closeMenuBtn.textContent = 'Close Menu';
        closeMenuBtn.addEventListener('click', () => {
            this.toggleMenuPopup(); // Hide menu popup
        });
        
        // Add items to menu
        menuPopup.appendChild(returnToMenuBtn);
        menuPopup.appendChild(toggleSoundBtn);
        menuPopup.appendChild(closeMenuBtn);
        
        // Add menu to DOM
        document.body.appendChild(menuPopup);
    }
}

export default ScreenManager;
