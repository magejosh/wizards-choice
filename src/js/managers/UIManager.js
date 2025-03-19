// UI Manager class - handles all UI interactions and updates

export class UIManager {
    constructor() {
        this.screens = [
            'loading-screen',
            'main-menu',
            'game-ui',
            'game-over'
        ];
    }
    
    init() {
        console.log('UI Manager initialized');
    }
    
    showScreen(screenId) {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
        } else {
            console.error(`Screen with ID ${screenId} not found`);
        }
    }
    
    hideScreen(screenId) {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('hidden');
        } else {
            console.error(`Screen with ID ${screenId} not found`);
        }
    }
    
    hideAllScreens() {
        this.screens.forEach(screenId => {
            this.hideScreen(screenId);
        });
    }
    
    updatePlayerInfo(player) {
        const playerHealth = document.getElementById('player-health');
        const playerMana = document.getElementById('player-mana');
        
        if (playerHealth && playerMana) {
            playerHealth.innerHTML = `
                <h3>Health: ${player.health}/100</h3>
                <div class="health-bar">
                    <div class="health-fill" style="width: ${player.health}%"></div>
                </div>
            `;
            
            playerMana.innerHTML = `
                <h3>Mana: ${player.mana}/100</h3>
                <div class="mana-bar">
                    <div class="mana-fill" style="width: ${player.mana}%"></div>
                </div>
            `;
        }
    }
    
    updateOpponentInfo(opponent) {
        const opponentHealth = document.getElementById('opponent-health');
        const opponentMana = document.getElementById('opponent-mana');
        
        if (opponentHealth && opponentMana) {
            opponentHealth.innerHTML = `
                <h3>Health: ${opponent.health}/100</h3>
                <div class="health-bar">
                    <div class="health-fill" style="width: ${opponent.health}%"></div>
                </div>
            `;
            
            opponentMana.innerHTML = `
                <h3>Mana: ${opponent.mana}/100</h3>
                <div class="mana-bar">
                    <div class="mana-fill" style="width: ${opponent.mana}%"></div>
                </div>
            `;
        }
    }
    
    displaySpellChoices(spells, onSpellSelected) {
        const spellChoicesContainer = document.getElementById('spell-choices');
        
        if (spellChoicesContainer) {
            // Clear previous choices
            spellChoicesContainer.innerHTML = '';
            
            // Create buttons for each spell
            spells.forEach((spell, index) => {
                const spellButton = document.createElement('button');
                spellButton.classList.add('spell-button');
                spellButton.classList.add(spell.type.toLowerCase());
                
                // Show spell name and mana cost
                spellButton.innerHTML = `
                    <div class="spell-name">${spell.name}</div>
                    <div class="spell-cost">${spell.manaCost} Mana</div>
                `;
                
                // Add tooltip with spell details
                spellButton.title = `${spell.name} (${spell.type}): ${spell.description}`;
                
                // Add click event
                spellButton.addEventListener('click', () => {
                    onSpellSelected(index);
                });
                
                // Disable button if not enough mana
                if (spell.manaCost > 100) { // Using 100 as placeholder, should use actual player mana
                    spellButton.disabled = true;
                    spellButton.classList.add('disabled');
                }
                
                spellChoicesContainer.appendChild(spellButton);
            });
        }
    }
    
    updateBattleLog(message) {
        const battleLog = document.getElementById('battle-log');
        
        if (battleLog) {
            const logEntry = document.createElement('div');
            logEntry.classList.add('log-entry');
            logEntry.textContent = message;
            
            battleLog.appendChild(logEntry);
            
            // Auto-scroll to bottom
            battleLog.scrollTop = battleLog.scrollHeight;
        }
    }
    
    clearBattleLog() {
        const battleLog = document.getElementById('battle-log');
        
        if (battleLog) {
            battleLog.innerHTML = '';
        }
    }
}
