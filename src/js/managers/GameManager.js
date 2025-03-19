// Game Manager class - handles overall game state and logic

export class GameManager {
    constructor() {
        this.uiManager = null;
        this.sceneManager = null;
        this.spellManager = null;
        this.audioManager = null;
        
        this.gameState = {
            isPlaying: false,
            currentTurn: 0,
            player: {
                health: 100,
                mana: 100,
                spells: []
            },
            opponent: {
                health: 100,
                mana: 100,
                spells: [],
                difficulty: 'normal'
            },
            battleLog: []
        };
    }
    
    init(uiManager, sceneManager, spellManager, audioManager) {
        this.uiManager = uiManager;
        this.sceneManager = sceneManager;
        this.spellManager = spellManager;
        this.audioManager = audioManager;
        
        console.log('Game Manager initialized');
        
        // Set up event listeners for game over screen
        document.getElementById('play-again').addEventListener('click', () => {
            this.startNewGame();
        });
        
        document.getElementById('return-to-menu').addEventListener('click', () => {
            this.uiManager.hideScreen('game-over');
            this.uiManager.showScreen('main-menu');
        });
    }
    
    startNewGame() {
        console.log('Starting new game');
        
        // Reset game state
        this.resetGameState();
        
        // Initialize player and opponent spells
        this.gameState.player.spells = this.spellManager.getInitialPlayerSpells();
        this.gameState.opponent.spells = this.spellManager.getInitialOpponentSpells(this.gameState.opponent.difficulty);
        
        // Show game UI
        this.uiManager.hideScreen('main-menu');
        this.uiManager.hideScreen('game-over');
        this.uiManager.showScreen('game-ui');
        
        // Initialize battle scene
        this.sceneManager.setupBattleScene(this.gameState.player, this.gameState.opponent);
        
        // Update UI
        this.uiManager.updatePlayerInfo(this.gameState.player);
        this.uiManager.updateOpponentInfo(this.gameState.opponent);
        
        // Start first turn
        this.gameState.isPlaying = true;
        this.startPlayerTurn();
    }
    
    resetGameState() {
        this.gameState = {
            isPlaying: false,
            currentTurn: 0,
            player: {
                health: 100,
                mana: 100,
                spells: []
            },
            opponent: {
                health: 100,
                mana: 100,
                spells: [],
                difficulty: 'normal'
            },
            battleLog: []
        };
        
        this.uiManager.clearBattleLog();
    }
    
    startPlayerTurn() {
        this.gameState.currentTurn++;
        console.log(`Starting player turn ${this.gameState.currentTurn}`);
        
        // Regenerate some mana
        this.gameState.player.mana = Math.min(100, this.gameState.player.mana + 20);
        this.uiManager.updatePlayerInfo(this.gameState.player);
        
        // Log turn start
        this.addToBattleLog(`Turn ${this.gameState.currentTurn}: Your turn begins. Mana restored to ${this.gameState.player.mana}.`);
        
        // Display spell choices
        this.uiManager.displaySpellChoices(this.gameState.player.spells, (spellIndex) => {
            this.castPlayerSpell(spellIndex);
        });
    }
    
    castPlayerSpell(spellIndex) {
        const spell = this.gameState.player.spells[spellIndex];
        
        // Check if player has enough mana
        if (spell.manaCost > this.gameState.player.mana) {
            this.addToBattleLog(`Not enough mana to cast ${spell.name}!`);
            return;
        }
        
        // Deduct mana cost
        this.gameState.player.mana -= spell.manaCost;
        this.uiManager.updatePlayerInfo(this.gameState.player);
        
        // Log spell cast
        this.addToBattleLog(`You cast ${spell.name}!`);
        
        // Play spell animation
        this.sceneManager.playSpellAnimation('player', spell.type);
        this.audioManager.playSound(`spell_${spell.type}`);
        
        // Apply spell effects
        this.applySpellEffects(spell, 'player', 'opponent');
        
        // Check if opponent is defeated
        if (this.gameState.opponent.health <= 0) {
            this.endBattle(true);
            return;
        }
        
        // Start opponent turn
        setTimeout(() => {
            this.startOpponentTurn();
        }, 1500);
    }
    
    startOpponentTurn() {
        console.log('Starting opponent turn');
        
        // Regenerate some mana
        this.gameState.opponent.mana = Math.min(100, this.gameState.opponent.mana + 20);
        this.uiManager.updateOpponentInfo(this.gameState.opponent);
        
        // Log turn start
        this.addToBattleLog(`Opponent's turn begins.`);
        
        // AI selects a spell
        setTimeout(() => {
            const spellIndex = this.getOpponentSpellChoice();
            this.castOpponentSpell(spellIndex);
        }, 1000);
    }
    
    getOpponentSpellChoice() {
        // Simple AI for MVP - choose a random spell that the opponent can afford
        const affordableSpells = this.gameState.opponent.spells.filter(
            spell => spell.manaCost <= this.gameState.opponent.mana
        );
        
        if (affordableSpells.length === 0) {
            // If no affordable spells, choose the cheapest one
            const cheapestSpell = this.gameState.opponent.spells.reduce(
                (cheapest, current) => current.manaCost < cheapest.manaCost ? current : cheapest,
                this.gameState.opponent.spells[0]
            );
            
            return this.gameState.opponent.spells.indexOf(cheapestSpell);
        }
        
        // Choose a random affordable spell
        const randomIndex = Math.floor(Math.random() * affordableSpells.length);
        return this.gameState.opponent.spells.indexOf(affordableSpells[randomIndex]);
    }
    
    castOpponentSpell(spellIndex) {
        const spell = this.gameState.opponent.spells[spellIndex];
        
        // Deduct mana cost
        this.gameState.opponent.mana -= spell.manaCost;
        this.uiManager.updateOpponentInfo(this.gameState.opponent);
        
        // Log spell cast
        this.addToBattleLog(`Opponent casts ${spell.name}!`);
        
        // Play spell animation
        this.sceneManager.playSpellAnimation('opponent', spell.type);
        this.audioManager.playSound(`spell_${spell.type}`);
        
        // Apply spell effects
        this.applySpellEffects(spell, 'opponent', 'player');
        
        // Check if player is defeated
        if (this.gameState.player.health <= 0) {
            this.endBattle(false);
            return;
        }
        
        // Start player turn
        setTimeout(() => {
            this.startPlayerTurn();
        }, 1500);
    }
    
    applySpellEffects(spell, caster, target) {
        // Get the actual target object
        const targetObj = target === 'player' ? this.gameState.player : this.gameState.opponent;
        const casterObj = caster === 'player' ? this.gameState.player : this.gameState.opponent;
        
        // Apply damage
        if (spell.damage > 0) {
            targetObj.health = Math.max(0, targetObj.health - spell.damage);
            this.addToBattleLog(`${spell.name} deals ${spell.damage} damage!`);
            
            // Update UI
            if (target === 'player') {
                this.uiManager.updatePlayerInfo(targetObj);
            } else {
                this.uiManager.updateOpponentInfo(targetObj);
            }
        }
        
        // Apply healing
        if (spell.healing > 0) {
            casterObj.health = Math.min(100, casterObj.health + spell.healing);
            this.addToBattleLog(`${spell.name} heals for ${spell.healing} health!`);
            
            // Update UI
            if (caster === 'player') {
                this.uiManager.updatePlayerInfo(casterObj);
            } else {
                this.uiManager.updateOpponentInfo(casterObj);
            }
        }
        
        // Apply mana restoration
        if (spell.manaRestore > 0) {
            casterObj.mana = Math.min(100, casterObj.mana + spell.manaRestore);
            this.addToBattleLog(`${spell.name} restores ${spell.manaRestore} mana!`);
            
            // Update UI
            if (caster === 'player') {
                this.uiManager.updatePlayerInfo(casterObj);
            } else {
                this.uiManager.updateOpponentInfo(casterObj);
            }
        }
    }
    
    endBattle(playerWon) {
        this.gameState.isPlaying = false;
        
        // Update result message
        const resultMessage = playerWon ? 'Victory!' : 'Defeat!';
        document.getElementById('result-message').textContent = resultMessage;
        
        // Display battle stats
        const battleStats = document.getElementById('battle-stats');
        battleStats.innerHTML = `
            <p>Turns: ${this.gameState.currentTurn}</p>
            <p>Your remaining health: ${this.gameState.player.health}</p>
            <p>Opponent remaining health: ${this.gameState.opponent.health}</p>
        `;
        
        // Show game over screen
        this.uiManager.hideScreen('game-ui');
        this.uiManager.showScreen('game-over');
        
        // Play victory or defeat sound
        this.audioManager.playSound(playerWon ? 'victory' : 'defeat');
        
        // If player won, unlock new spells
        if (playerWon) {
            const newSpell = this.spellManager.unlockNewSpell();
            if (newSpell) {
                battleStats.innerHTML += `<p class="new-spell">New spell unlocked: ${newSpell.name}!</p>`;
            }
        }
    }
    
    addToBattleLog(message) {
        this.gameState.battleLog.push(message);
        this.uiManager.updateBattleLog(message);
    }
}
