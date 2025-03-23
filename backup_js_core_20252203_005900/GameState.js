// Game State Management Module
// Handles the core game state and transitions

export class GameState {
    constructor() {
        this.currentState = 'loading'; // loading, mainMenu, battle, gameOver
        this.stateChangeCallbacks = {};
        
        // Game data
        this.playerData = {
            health: 100,
            maxHealth: 100,
            mana: 100,
            maxMana: 100,
            spells: []
        };
        
        this.opponentData = {
            health: 100,
            maxHealth: 100,
            mana: 100,
            maxMana: 100,
            spells: [],
            difficulty: 'normal'
        };
        
        this.battleData = {
            currentTurn: 0,
            playerTurn: true,
            battleLog: [],
            isActive: false
        };
    }
    
    // State management
    changeState(newState) {
        const oldState = this.currentState;
        this.currentState = newState;
        
        console.log(`Game state changed: ${oldState} -> ${newState}`);
        
        // Call registered callbacks for this state change
        if (this.stateChangeCallbacks[newState]) {
            this.stateChangeCallbacks[newState].forEach(callback => callback());
        }
        
        return this;
    }
    
    getCurrentState() {
        return this.currentState;
    }
    
    // Register callbacks for state changes
    onStateChange(state, callback) {
        if (!this.stateChangeCallbacks[state]) {
            this.stateChangeCallbacks[state] = [];
        }
        
        this.stateChangeCallbacks[state].push(callback);
        return this;
    }
    
    // Battle management
    startBattle(playerSpells, opponentSpells, difficulty = 'normal') {
        // Reset battle data
        this.battleData = {
            currentTurn: 0,
            playerTurn: true,
            battleLog: [],
            isActive: true
        };
        
        // Set up player
        this.playerData = {
            health: 100,
            maxHealth: 100,
            mana: 100,
            maxMana: 100,
            spells: playerSpells
        };
        
        // Set up opponent
        this.opponentData = {
            health: 100,
            maxHealth: 100,
            mana: 100,
            maxMana: 100,
            spells: opponentSpells,
            difficulty: difficulty
        };
        
        // Change state to battle
        this.changeState('battle');
        
        // Start first turn
        this.startNewTurn();
        
        return this;
    }
    
    startNewTurn() {
        this.battleData.currentTurn++;
        
        // Determine whose turn it is
        if (this.battleData.currentTurn % 2 === 1) {
            // Player's turn
            this.battleData.playerTurn = true;
            
            // Regenerate some mana
            this.playerData.mana = Math.min(
                this.playerData.maxMana, 
                this.playerData.mana + 20
            );
            
            this.addToBattleLog(`Turn ${Math.ceil(this.battleData.currentTurn/2)}: Your turn begins. Mana restored to ${this.playerData.mana}.`);
        } else {
            // Opponent's turn
            this.battleData.playerTurn = false;
            
            // Regenerate some mana
            this.opponentData.mana = Math.min(
                this.opponentData.maxMana, 
                this.opponentData.mana + 20
            );
            
            this.addToBattleLog(`Opponent's turn begins.`);
        }
        
        return this;
    }
    
    castSpell(spell, caster, target) {
        // Validate spell cast
        if (caster === 'player') {
            // Check if player has enough mana
            if (spell.manaCost > this.playerData.mana) {
                this.addToBattleLog(`Not enough mana to cast ${spell.name}!`);
                return false;
            }
            
            // Deduct mana cost
            this.playerData.mana -= spell.manaCost;
            this.addToBattleLog(`You cast ${spell.name}!`);
        } else {
            // Check if opponent has enough mana
            if (spell.manaCost > this.opponentData.mana) {
                this.addToBattleLog(`Opponent doesn't have enough mana to cast ${spell.name}!`);
                return false;
            }
            
            // Deduct mana cost
            this.opponentData.mana -= spell.manaCost;
            this.addToBattleLog(`Opponent casts ${spell.name}!`);
        }
        
        // Apply spell effects
        this.applySpellEffects(spell, caster, target);
        
        // Check for battle end
        if (this.playerData.health <= 0 || this.opponentData.health <= 0) {
            this.endBattle();
            return true;
        }
        
        // If battle continues, start next turn
        if (this.battleData.isActive) {
            this.startNewTurn();
        }
        
        return true;
    }
    
    applySpellEffects(spell, caster, target) {
        // Apply damage
        if (spell.damage > 0) {
            if (target === 'player') {
                this.playerData.health = Math.max(0, this.playerData.health - spell.damage);
                this.addToBattleLog(`${spell.name} deals ${spell.damage} damage to you!`);
            } else {
                this.opponentData.health = Math.max(0, this.opponentData.health - spell.damage);
                this.addToBattleLog(`${spell.name} deals ${spell.damage} damage to opponent!`);
            }
        }
        
        // Apply healing
        if (spell.healing > 0) {
            if (caster === 'player') {
                this.playerData.health = Math.min(this.playerData.maxHealth, this.playerData.health + spell.healing);
                this.addToBattleLog(`${spell.name} heals you for ${spell.healing} health!`);
            } else {
                this.opponentData.health = Math.min(this.opponentData.maxHealth, this.opponentData.health + spell.healing);
                this.addToBattleLog(`${spell.name} heals opponent for ${spell.healing} health!`);
            }
        }
        
        // Apply mana restoration
        if (spell.manaRestore > 0) {
            if (caster === 'player') {
                this.playerData.mana = Math.min(this.playerData.maxMana, this.playerData.mana + spell.manaRestore);
                this.addToBattleLog(`${spell.name} restores ${spell.manaRestore} mana to you!`);
            } else {
                this.opponentData.mana = Math.min(this.opponentData.maxMana, this.opponentData.mana + spell.manaRestore);
                this.addToBattleLog(`${spell.name} restores ${spell.manaRestore} mana to opponent!`);
            }
        }
    }
    
    endBattle() {
        this.battleData.isActive = false;
        
        // Determine winner
        const playerWon = this.opponentData.health <= 0;
        
        if (playerWon) {
            this.addToBattleLog('Victory! You have defeated your opponent.');
        } else {
            this.addToBattleLog('Defeat! You have been defeated by your opponent.');
        }
        
        // Change state to game over
        this.changeState('gameOver');
        
        return {
            playerWon,
            turns: Math.ceil(this.battleData.currentTurn/2),
            playerHealth: this.playerData.health,
            opponentHealth: this.opponentData.health
        };
    }
    
    addToBattleLog(message) {
        this.battleData.battleLog.push(message);
        return this.battleData.battleLog;
    }
    
    getBattleLog() {
        return this.battleData.battleLog;
    }
    
    getLastLogMessage() {
        if (this.battleData.battleLog.length === 0) {
            return '';
        }
        return this.battleData.battleLog[this.battleData.battleLog.length - 1];
    }
    
    // Player data accessors
    getPlayerData() {
        return this.playerData;
    }
    
    getOpponentData() {
        return this.opponentData;
    }
    
    getBattleData() {
        return this.battleData;
    }
    
    isPlayerTurn() {
        return this.battleData.playerTurn;
    }
    
    // Reset game state
    resetGame() {
        this.changeState('mainMenu');
        
        this.playerData = {
            health: 100,
            maxHealth: 100,
            mana: 100,
            maxMana: 100,
            spells: []
        };
        
        this.opponentData = {
            health: 100,
            maxHealth: 100,
            mana: 100,
            maxMana: 100,
            spells: [],
            difficulty: 'normal'
        };
        
        this.battleData = {
            currentTurn: 0,
            playerTurn: true,
            battleLog: [],
            isActive: false
        };
        
        return this;
    }
}
