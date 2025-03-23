// Duel System Module
// Handles the wizard duels and turn-based gameplay

import { GameState } from './GameState.js';

export class DuelSystem {
    constructor(gameManager, uiManager, sceneManager, audioManager) {
        this.gameState = new GameState();
        this.gameManager = gameManager;
        this.uiManager = uiManager;
        this.sceneManager = sceneManager;
        this.audioManager = audioManager;
        
        this.aiDecisionDelay = 1500; // milliseconds to wait before AI makes a decision
        
        // Initialize state change handlers
        this.initStateHandlers();
    }
    
    initStateHandlers() {
        // Handle battle state
        this.gameState.onStateChange('battle', () => {
            console.log('Battle started');
            this.uiManager.showScreen('game-ui');
            this.uiManager.hideScreen('main-menu');
            this.uiManager.hideScreen('game-over');
            
            // Set up battle scene
            this.sceneManager.setupBattleScene(
                this.gameState.getPlayerData(),
                this.gameState.getOpponentData()
            );
            
            // Update UI with initial data
            this.updateBattleUI();
            
            // Play battle start sound
            this.audioManager.playSound('battle_start');
        });
        
        // Handle game over state
        this.gameState.onStateChange('gameOver', () => {
            console.log('Game over');
            
            // Get battle results
            const playerWon = this.gameState.getOpponentData().health <= 0;
            const battleData = this.gameState.getBattleData();
            
            // Update result message
            const resultMessage = playerWon ? 'Victory!' : 'Defeat!';
            document.getElementById('result-message').textContent = resultMessage;
            
            // Display battle stats
            const battleStats = document.getElementById('battle-stats');
            battleStats.innerHTML = `
                <p>Turns: ${Math.ceil(battleData.currentTurn/2)}</p>
                <p>Your remaining health: ${this.gameState.getPlayerData().health}</p>
                <p>Opponent remaining health: ${this.gameState.getOpponentData().health}</p>
            `;
            
            // Show game over screen
            this.uiManager.hideScreen('game-ui');
            this.uiManager.showScreen('game-over');
            
            // Play victory or defeat sound
            this.audioManager.playSound(playerWon ? 'victory' : 'defeat');
            
            // If player won, trigger spell unlock in game manager
            if (playerWon) {
                const newSpell = this.gameManager.unlockNewSpell();
                if (newSpell) {
                    battleStats.innerHTML += `<p class="new-spell">New spell unlocked: ${newSpell.name}!</p>`;
                }
            }
        });
    }
    
    startNewDuel(playerSpells, opponentSpells, difficulty = 'normal') {
        console.log('Starting new duel');
        
        // Start battle in game state
        this.gameState.startBattle(playerSpells, opponentSpells, difficulty);
        
        // If it's player's turn, display spell choices
        if (this.gameState.isPlayerTurn()) {
            this.displayPlayerSpellChoices();
        } else {
            // If it's AI's turn (shouldn't happen initially, but just in case)
            this.processAITurn();
        }
    }
    
    displayPlayerSpellChoices() {
        const playerData = this.gameState.getPlayerData();
        
        // Display spell choices through UI manager
        this.uiManager.displaySpellChoices(playerData.spells, (spellIndex) => {
            this.handlePlayerSpellSelection(spellIndex);
        });
    }
    
    handlePlayerSpellSelection(spellIndex) {
        const playerData = this.gameState.getPlayerData();
        const selectedSpell = playerData.spells[spellIndex];
        
        console.log(`Player selected spell: ${selectedSpell.name}`);
        
        // Attempt to cast the spell
        const spellCast = this.gameState.castSpell(selectedSpell, 'player', 'opponent');
        
        if (spellCast) {
            // Play spell animation
            this.sceneManager.playSpellAnimation('player', selectedSpell.type);
            this.audioManager.playSound(`spell_${selectedSpell.type.toLowerCase()}`);
            
            // Update UI
            this.updateBattleUI();
            
            // If battle is still active and it's now opponent's turn
            if (this.gameState.getBattleData().isActive && !this.gameState.isPlayerTurn()) {
                // Process AI turn after a delay
                setTimeout(() => {
                    this.processAITurn();
                }, this.aiDecisionDelay);
            }
        } else {
            // Spell cast failed (likely not enough mana)
            console.log('Spell cast failed');
            
            // Allow player to choose again
            this.displayPlayerSpellChoices();
        }
    }
    
    processAITurn() {
        console.log('Processing AI turn');
        
        const opponentData = this.gameState.getOpponentData();
        
        // Select a spell using AI logic
        const selectedSpellIndex = this.selectAISpell(opponentData);
        const selectedSpell = opponentData.spells[selectedSpellIndex];
        
        console.log(`AI selected spell: ${selectedSpell.name}`);
        
        // Cast the spell
        const spellCast = this.gameState.castSpell(selectedSpell, 'opponent', 'player');
        
        if (spellCast) {
            // Play spell animation
            this.sceneManager.playSpellAnimation('opponent', selectedSpell.type);
            this.audioManager.playSound(`spell_${selectedSpell.type.toLowerCase()}`);
            
            // Update UI
            this.updateBattleUI();
            
            // If battle is still active and it's now player's turn
            if (this.gameState.getBattleData().isActive && this.gameState.isPlayerTurn()) {
                // Display player spell choices
                this.displayPlayerSpellChoices();
            }
        } else {
            // This shouldn't happen with proper AI logic, but just in case
            console.error('AI spell cast failed');
            
            // Force end turn and let player go
            this.gameState.startNewTurn();
            this.updateBattleUI();
            this.displayPlayerSpellChoices();
        }
    }
    
    selectAISpell(opponentData) {
        // Simple AI for MVP - choose a random spell that the opponent can afford
        const affordableSpells = opponentData.spells.filter(
            spell => spell.manaCost <= opponentData.mana
        );
        
        if (affordableSpells.length === 0) {
            // If no affordable spells, choose the cheapest one
            const cheapestSpell = opponentData.spells.reduce(
                (cheapest, current) => current.manaCost < cheapest.manaCost ? current : cheapest,
                opponentData.spells[0]
            );
            
            return opponentData.spells.indexOf(cheapestSpell);
        }
        
        // Choose a random affordable spell
        const randomIndex = Math.floor(Math.random() * affordableSpells.length);
        return opponentData.spells.indexOf(affordableSpells[randomIndex]);
    }
    
    updateBattleUI() {
        const playerData = this.gameState.getPlayerData();
        const opponentData = this.gameState.getOpponentData();
        const lastLogMessage = this.gameState.getLastLogMessage();
        
        // Update player and opponent info
        this.uiManager.updatePlayerInfo(playerData);
        this.uiManager.updateOpponentInfo(opponentData);
        
        // Update battle log if there's a new message
        if (lastLogMessage) {
            this.uiManager.updateBattleLog(lastLogMessage);
        }
    }
    
    resetDuel() {
        this.gameState.resetGame();
    }
    
    // Getters for game state
    getGameState() {
        return this.gameState;
    }
}
