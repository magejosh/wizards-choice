// BattleManager.js - Handles battle flow and turn processing

export class BattleManager {
    constructor(gameStateManager) {
        this.gameStateManager = gameStateManager;
    }

    // Process opponent's turn
    processOpponentTurn() {
        console.log('Processing opponent turn');
        
        try {
            const gameState = this.gameStateManager.getGameState();
            
            // Check if opponent has any spells
            if (!gameState.opponent.currentSpellHand || gameState.opponent.currentSpellHand.length === 0) {
                console.log('Opponent has no spells in hand, drawing new ones');
                
                // Initialize opponent spell hand if needed
                if (!gameState.opponent.currentSpellHand) {
                    gameState.opponent.currentSpellHand = [];
                }
                
                // Draw up to 3 spells
                while (gameState.opponent.currentSpellHand.length < 3) {
                    this.drawOpponentSpell();
                }
            }
            
            // Find a castable spell (one that the opponent has enough mana for)
            const castableSpells = gameState.opponent.currentSpellHand.filter(spellId => {
                const spell = this.gameStateManager.spellSystem.getSpellById(spellId);
                return spell && spell.manaCost <= gameState.opponent.mana;
            });
            
            if (castableSpells.length > 0) {
                let chosenSpellId;
                
                // Choose spell based on AI level
                if (gameState.opponent.aiLevel === 1) {
                    // Level 1 AI: Choose random spell
                    const randomIndex = Math.floor(Math.random() * castableSpells.length);
                    chosenSpellId = castableSpells[randomIndex];
                } else {
                    // Level 2+ AI: Choose spell with highest damage
                    castableSpells.sort((a, b) => {
                        const spellA = this.gameStateManager.spellSystem.getSpellById(a);
                        const spellB = this.gameStateManager.spellSystem.getSpellById(b);
                        return (spellB ? spellB.damage : 0) - (spellA ? spellA.damage : 0);
                    });
                    chosenSpellId = castableSpells[0];
                }
                
                const chosenSpell = this.gameStateManager.spellSystem.getSpellById(chosenSpellId);
                if (!chosenSpell) {
                    throw new Error(`Failed to get spell with ID: ${chosenSpellId}`);
                }
                
                console.log(`Opponent chose to cast ${chosenSpell.name} (Mana: ${chosenSpell.manaCost}, Damage: ${chosenSpell.damage || 0})`);
                
                // Remove spell from opponent's hand
                const spellIndex = gameState.opponent.currentSpellHand.indexOf(chosenSpellId);
                if (spellIndex !== -1) {
                    gameState.opponent.currentSpellHand.splice(spellIndex, 1);
                    console.log(`Opponent removed ${chosenSpell.name} from hand after casting`);
                }
                
                // Apply spell effects before moving on to the next turn
                this.applySpellEffects(chosenSpell, 'opponent', 'player');
                
                // Update battle UI to show changes immediately
                this.gameStateManager.updateBattleUI();
            } else {
                console.log('Opponent has no available spells to cast');
                gameState.battleLog.push('Opponent skips their turn (no castable spells)');
                
                // Still update the UI even when skipping
                this.gameStateManager.updateBattleUI();
            }
        } catch (error) {
            console.error('Error in opponent turn:', error);
            const gameState = this.gameStateManager.getGameState();
            gameState.battleLog.push('Opponent encountered an error and skipped their turn');
            this.gameStateManager.updateBattleUI();
        } finally {
            // Process end of turn after a delay to allow for animations
            // This ensures the turn always progresses, even if there was an error
            setTimeout(() => {
                // Clear the processing flag to allow player to cast spells again
                const gameState = this.gameStateManager.getGameState();
                gameState.isProcessingTurn = false;
                this.processTurnEnd();
            }, 1000);
        }
    }
    
    // Draw a spell for the opponent
    drawOpponentSpell() {
        const gameState = this.gameStateManager.getGameState();
        
        // Ensure opponent has necessary properties initialized
        if (!gameState.opponent.availableSpellsForBattle) {
            gameState.opponent.availableSpellsForBattle = [...gameState.opponent.spells];
            console.log('Initialized opponent availableSpellsForBattle');
        }
        
        if (!gameState.opponent.currentSpellHand) {
            gameState.opponent.currentSpellHand = [];
            console.log('Initialized opponent currentSpellHand');
        }
        
        // Check if deck is empty - if so, reshuffle
        if (gameState.opponent.availableSpellsForBattle.length === 0) {
            console.log('Opponent deck empty - reshuffling');
            
            // Get all opponent spells that aren't in hand
            const allOpponentSpells = [...gameState.opponent.spells];
            const handSpells = gameState.opponent.currentSpellHand || [];
            
            // Reshuffle all spells not in hand
            gameState.opponent.availableSpellsForBattle = allOpponentSpells.filter(spellId =>
                !handSpells.includes(spellId)
            );
            
            // Shuffle opponent's deck (Fisher-Yates algorithm)
            for (let i = gameState.opponent.availableSpellsForBattle.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [gameState.opponent.availableSpellsForBattle[i], gameState.opponent.availableSpellsForBattle[j]] =
                [gameState.opponent.availableSpellsForBattle[j], gameState.opponent.availableSpellsForBattle[i]];
            }
            
            console.log(`Opponent reshuffled deck with ${gameState.opponent.availableSpellsForBattle.length} spells`);
            
            // If still no cards, return
            if (gameState.opponent.availableSpellsForBattle.length === 0) {
                console.log('Opponent has no more spells to draw');
                return null;
            }
        }
        
        // Draw top card
        const drawnSpellId = gameState.opponent.availableSpellsForBattle.shift();
        const drawnSpell = this.gameStateManager.spellSystem.getSpellById(drawnSpellId);
        
        if (drawnSpell) {
            console.log(`Opponent drew ${drawnSpell.name}`);
            gameState.opponent.currentSpellHand.push(drawnSpellId);
            return drawnSpellId;
        } else {
            console.error(`Failed to get opponent spell with ID: ${drawnSpellId}`);
            
            // If we drew an invalid spell, try to draw another one instead of returning null
            if (gameState.opponent.availableSpellsForBattle.length > 0) {
                console.log('Attempting to draw another spell instead');
                return this.drawOpponentSpell();
            }
            
            return null;
        }
    }
    
    // Process end of turn
    processTurnEnd() {
        console.log('Processing end of turn');
        const gameState = this.gameStateManager.getGameState();
        
        // Increment turn counter
        gameState.currentTurn++;
        console.log(`New turn: ${gameState.currentTurn}`);
        
        // Update battle log
        gameState.battleLog.push(`Turn ${gameState.currentTurn} started`);
        
        // Apply mana regeneration
        gameState.player.mana = Math.min(
            gameState.player.maxMana,
            gameState.player.mana + gameState.player.manaRegen
        );
        
        gameState.opponent.mana = Math.min(
            gameState.opponent.maxMana,
            gameState.opponent.mana + gameState.opponent.manaRegen
        );
        
        console.log(`Player mana regenerated to ${gameState.player.mana}/${gameState.player.maxMana}`);
        console.log(`Opponent mana regenerated to ${gameState.opponent.mana}/${gameState.opponent.maxMana}`);
        
        // Draw cards to refill player's hand
        const drawnCard = this.gameStateManager.spellSystem.refillSpellHand();
        if (drawnCard) {
            gameState.battleLog.push(`You drew ${drawnCard.name}`);
        }
        
        // Draw cards to refill opponent's hand to 3 cards
        while (gameState.opponent.currentSpellHand && 
               gameState.opponent.currentSpellHand.length < 3) {
            this.drawOpponentSpell();
        }
        
        // Update UI
        this.gameStateManager.updateBattleUI();
        
        // Check if battle has ended
        this.checkBattleEnd();
    }
    
    // Check if battle has ended
    checkBattleEnd() {
        const gameState = this.gameStateManager.getGameState();
        
        if (gameState.player.health <= 0) {
            // Player lost
            console.log('Battle ended - Player defeated');
            gameState.battleResult = 'defeat';
            gameState.isBattleOver = true;
            this.endBattle(false);
            return true;
        } else if (gameState.opponent.health <= 0) {
            // Player won
            console.log('Battle ended - Player victorious');
            gameState.battleResult = 'victory';
            gameState.isBattleOver = true;
            this.endBattle(true);
            return true;
        }
        
        // Battle continues
        return false;
    }
    
    // End the battle and process results
    endBattle(playerWon) {
        console.log(`Battle ended, player ${playerWon ? 'won' : 'lost'}`);
        const gameState = this.gameStateManager.getGameState();
        
        // Get current experience and level before processing results
        const playerProgressBefore = this.gameStateManager.progressionSystem.getPlayerProgress();
        const expBefore = playerProgressBefore.experience;
        const levelBefore = playerProgressBefore.level;
        
        // Get difficulty level
        const difficulty = gameState.opponent.difficulty;
        
        // Get spells used in battle
        const usedSpells = this.gameStateManager.spellSystem.getUsedSpells() || [];
        console.log(`Used spells in battle:`, usedSpells.length > 0 ? usedSpells.map(s => s.name).join(', ') : 'None');
        
        // Process battle results
        const battleResults = this.gameStateManager.progressionSystem.processBattleResult(playerWon, difficulty, usedSpells);
        const newSpell = battleResults.newSpell;
        
        // Get updated experience
        const playerProgressAfter = this.gameStateManager.progressionSystem.getPlayerProgress();
        const expGained = playerProgressAfter.experience - expBefore;
        const levelUp = playerProgressAfter.level > levelBefore;
        
        // Show appropriate screen
        if (playerWon) {
            // Update results screen with rewards
            const resultMessage = document.getElementById('result-message');
            const rewardsList = document.getElementById('rewards-list');
            
            if (resultMessage) {
                resultMessage.textContent = 'Victory! You defeated the enemy wizard!';
            }
            
            if (rewardsList) {
                // Clear previous rewards
                rewardsList.innerHTML = '';
                
                // Add experience reward
                const expReward = document.createElement('div');
                expReward.className = 'reward-item';
                expReward.textContent = `Experience gained: ${expGained}`;
                rewardsList.appendChild(expReward);
                
                // Add level up message if applicable
                if (levelUp) {
                    const levelUpReward = document.createElement('div');
                    levelUpReward.className = 'reward-item level-up';
                    levelUpReward.textContent = `Level Up! You are now level ${playerProgressAfter.level}!`;
                    rewardsList.appendChild(levelUpReward);
                    
                    // Store the enemy spells for level-up spell selection
                    this.gameStateManager.defeatedEnemySpells = gameState.opponent.spells || [];
                }
                
                // Add new spell message if applicable
                if (newSpell) {
                    const spellReward = document.createElement('div');
                    spellReward.className = 'reward-item new-spell';
                    spellReward.textContent = `New spell unlocked: ${newSpell.name}!`;
                    rewardsList.appendChild(spellReward);
                }
            }
            
            // Show results screen
            this.gameStateManager.uiManager.showScreen('results-screen');
            
            // Add event listener to continue button
            const continueButton = document.getElementById('continue-button');
            if (continueButton) {
                // Remove any existing event listeners
                const newContinueButton = continueButton.cloneNode(true);
                continueButton.parentNode.replaceChild(newContinueButton, continueButton);
                
                // Add new event listener
                newContinueButton.addEventListener('click', () => {
                    console.log('Continue button clicked');
                    
                    // If player leveled up, show level-up spell selection screen
                    if (levelUp) {
                        this.showLevelUpSpellSelection();
                    } else {
                        // Otherwise, return to main menu
                        this.gameStateManager.uiManager.showScreen('main-menu');
                    }
                });
            }
        } else {
            // Update game over screen
            const gameOverResult = document.getElementById('game-over-result');
            
            if (gameOverResult) {
                gameOverResult.textContent = 'You were defeated by the enemy wizard!';
            }
            
            // Show game over screen
            this.gameStateManager.uiManager.showScreen('game-over');
        }
        
        // Save game state
        this.gameStateManager.saveGameState();
    }
    
    // Show level-up spell selection screen
    showLevelUpSpellSelection() {
        console.log('Showing level-up spell selection screen');
        
        // Get spell options for level-up (1 from defeated enemy, 2 random)
        const spellOptions = this.gameStateManager.spellSystem.getSpellOptionsForLevelUp(this.gameStateManager.defeatedEnemySpells);
        
        // Show the level-up spell selection screen
        this.gameStateManager.uiManager.showScreen('level-up-spell-selection');
        
        // Update the new level display
        const newLevelElement = document.getElementById('new-level');
        if (newLevelElement) {
            newLevelElement.textContent = this.gameStateManager.spellSystem.getPlayerProgress().level;
        }
        
        // Populate the spell options
        const spellOptionsContainer = document.getElementById('new-spell-options');
        const confirmButton = document.getElementById('confirm-spell-selection');
        
        if (!spellOptionsContainer) {
            console.error('Spell options container not found!');
            return;
        }
        
        if (!confirmButton) {
            console.error('Confirm spell selection button not found!');
            return;
        }
        
        // Clear previous content
        spellOptionsContainer.innerHTML = '';
        
        // Track selected spell
        let selectedSpellId = null;
        
        // Create a document fragment to improve performance
        const fragment = document.createDocumentFragment();
        
        // Add each spell option
        spellOptions.forEach(spell => {
            const spellElement = document.createElement('div');
            spellElement.className = `selectable-spell ${spell.element}-spell`;
            spellElement.setAttribute('data-spell-id', spell.id);
            
            // Apply styling
            spellElement.style = `
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
            `;
            
            // Apply element-specific styling
            if (spell.element === 'fire') {
                spellElement.style.background = 'linear-gradient(to bottom, rgba(60, 20, 20, 0.8), rgba(30, 10, 10, 0.8))';
                spellElement.style.borderColor = 'rgba(255, 100, 50, 0.6)';
            } else if (spell.element === 'water') {
                spellElement.style.background = 'linear-gradient(to bottom, rgba(20, 20, 60, 0.8), rgba(10, 10, 30, 0.8))';
                spellElement.style.borderColor = 'rgba(50, 100, 255, 0.6)';
            } else if (spell.element === 'earth') {
                spellElement.style.background = 'linear-gradient(to bottom, rgba(40, 60, 20, 0.8), rgba(20, 30, 10, 0.8))';
                spellElement.style.borderColor = 'rgba(100, 200, 50, 0.6)';
            } else if (spell.element === 'air') {
                spellElement.style.background = 'linear-gradient(to bottom, rgba(60, 60, 90, 0.8), rgba(30, 30, 45, 0.8))';
                spellElement.style.borderColor = 'rgba(200, 200, 255, 0.6)';
            } else if (spell.element === 'arcane') {
                spellElement.style.background = 'linear-gradient(to bottom, rgba(60, 20, 90, 0.8), rgba(30, 10, 45, 0.8))';
                spellElement.style.borderColor = 'rgba(200, 50, 255, 0.6)';
            }
            
            // Populate spell details
            spellElement.innerHTML = `
                <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 3px; color: #ffffff; text-align: center;">
                    ${spell.name} ${spell.element}
                </div>
                <div style="font-size: 0.8rem; margin-bottom: 3px; color: #aaaaff; text-align: center; font-style: italic;">
                    ${spell.description || 'A powerful magical spell'}
                </div>
                <div style="margin: 3px 0; font-size: 0.8rem; color: #ddddff; text-align: center;">
                    Mana: ${spell.manaCost}
                    ${spell.damage ? `<br>Dmg: ${spell.damage}` : ''}
                    ${spell.healing ? `<br>Heal: ${spell.healing}` : ''}
                    ${spell.manaRestore ? `<br>+Mana: ${spell.manaRestore}` : ''}
                </div>
            `;
            
            // Add click handler
            spellElement.addEventListener('click', () => {
                console.log(`Spell option clicked: ${spell.name} (${spell.id})`);
                
                // Deselect any previously selected spell
                document.querySelectorAll('.selectable-spell').forEach(el => {
                    el.style.border = '2px solid rgba(100, 100, 200, 0.5)';
                    el.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
                });
                
                // Select this spell
                selectedSpellId = spell.id;
                spellElement.style.border = '3px solid #ffcc00';
                spellElement.style.boxShadow = '0 0 15px rgba(255, 204, 0, 0.5)';
                
                // Enable confirm button
                confirmButton.disabled = false;
            });
            
            fragment.appendChild(spellElement);
        });
        
        // Append all spell elements at once
        spellOptionsContainer.appendChild(fragment);
        
        // Add event listener to confirm button
        confirmButton.addEventListener('click', () => {
            if (selectedSpellId) {
                console.log(`Learning spell: ${selectedSpellId}`);
                
                // Unlock or improve the selected spell
                const spell = this.gameStateManager.spellSystem.unlockSpell(selectedSpellId);
                
                if (spell) {
                    console.log(`Successfully learned/improved spell: ${spell.name}`);
                    
                    // Show a notification
                    const notification = document.createElement('div');
                    notification.className = 'notification';
                    notification.textContent = `You learned ${spell.name}!`;
                    document.body.appendChild(notification);
                    
                    // Remove notification after a delay
                    setTimeout(() => {
                        document.body.removeChild(notification);
                    }, 3000);
                    
                    // Return to the results screen
                    this.gameStateManager.uiManager.showScreen('results-screen');
                }
            }
        });
    }
    
    // Apply spell effects from caster to target
    applySpellEffects(spell, casterType, targetType) {
        console.log(`Applying spell effects for ${spell.name} from ${casterType} to ${targetType}`);
        const gameState = this.gameStateManager.getGameState();
        
        // Get caster and target
        const caster = casterType === 'player' ? gameState.player : gameState.opponent;
        const target = targetType === 'player' ? gameState.player : gameState.opponent;
        
        // Store previous health values for animation effects
        caster.prevHealth = caster.health;
        target.prevHealth = target.health;
        
        // Calculate actual damage and healing based on spell properties
        const actualDamage = spell.damage || 0;
        const actualHealing = spell.healing || 0;
        
        // Deduct mana cost from caster
        caster.mana = Math.max(0, caster.mana - spell.manaCost);
        console.log(`${casterType} mana after casting: ${caster.mana}/${caster.maxMana}`);
        
        // Apply damage to target if spell has damage
        if (actualDamage > 0) {
            // Apply damage
            target.health = Math.max(0, target.health - actualDamage);
            console.log(`${targetType} health after damage: ${target.health}/${target.maxHealth}`);
            
            // Add to battle log
            gameState.battleLog.push(`${casterType === 'player' ? 'You' : 'Enemy'} cast ${spell.name} for ${actualDamage} damage`);
        }
        
        // Apply healing to caster if spell has healing
        if (actualHealing > 0) {
            // Apply healing
            caster.health = Math.min(caster.maxHealth, caster.health + actualHealing);
            console.log(`${casterType} health after healing: ${caster.health}/${caster.maxHealth}`);
            
            // Add to battle log
            gameState.battleLog.push(`${casterType === 'player' ? 'You' : 'Enemy'} healed for ${actualHealing} health`);
        }
        
        // Apply any other spell effects
        if (spell.effects && spell.effects.length > 0) {
            spell.effects.forEach(effect => {
                console.log(`Applying effect: ${effect.type}`);
                // Handle different effect types
                switch (effect.type) {
                    case 'manaRegen':
                        caster.mana = Math.min(caster.maxMana, caster.mana + effect.value);
                        gameState.battleLog.push(`${casterType === 'player' ? 'You' : 'Enemy'} regenerated ${effect.value} mana`);
                        break;
                    // Add more effect types as needed
                }
            });
        }
        
        // Track the spell usage for progression system if player cast it
        if (casterType === 'player') {
            this.gameStateManager.spellSystem.trackSpellUsage(spell.id);
        }
        
        // Update health bars in the scene
        this.gameStateManager.updateHealthBars();
        
        // Update spell button states based on available mana
        this.gameStateManager.updateSpellButtonStates();
    }
}

export default BattleManager;
