// Choice System Module
// Handles player choices and decision-making

export class ChoiceSystem {
    constructor(gameState, uiManager) {
        this.gameState = gameState;
        this.uiManager = uiManager;
        this.currentChoices = [];
        this.choiceCallback = null;
    }
    
    // Present choices to the player
    presentChoices(choices, callback) {
        this.currentChoices = choices;
        this.choiceCallback = callback;
        
        // Use UI manager to display choices
        this.uiManager.displayChoices(choices, (choiceIndex) => {
            this.handleChoice(choiceIndex);
        });
    }
    
    // Handle player's choice selection
    handleChoice(choiceIndex) {
        if (choiceIndex < 0 || choiceIndex >= this.currentChoices.length) {
            console.error('Invalid choice index:', choiceIndex);
            return;
        }
        
        const selectedChoice = this.currentChoices[choiceIndex];
        console.log('Player selected choice:', selectedChoice);
        
        // Execute callback with the selected choice
        if (this.choiceCallback) {
            this.choiceCallback(selectedChoice, choiceIndex);
        }
        
        // Clear current choices
        this.currentChoices = [];
        this.choiceCallback = null;
    }
    
    // Present spell choices specifically for battle
    presentSpellChoices(spells, callback) {
        // Format spells as choices
        const spellChoices = spells.map(spell => ({
            id: spell.id,
            name: spell.name,
            description: `${spell.name} (${spell.manaCost} Mana): ${spell.description}`,
            data: spell,
            disabled: spell.manaCost > this.gameState.getPlayerData().mana
        }));
        
        this.presentChoices(spellChoices, (choice) => {
            callback(spells.indexOf(choice.data));
        });
    }
    
    // Present difficulty choices for starting a new game
    presentDifficultyChoices(callback) {
        const difficultyChoices = [
            {
                id: 'easy',
                name: 'Easy',
                description: 'Opponent uses only basic spells. Recommended for beginners.',
                data: 'easy'
            },
            {
                id: 'normal',
                name: 'Normal',
                description: 'Opponent uses a mix of basic and intermediate spells. Balanced challenge.',
                data: 'normal'
            },
            {
                id: 'hard',
                name: 'Hard',
                description: 'Opponent uses powerful advanced spells. A true test of your wizardry.',
                data: 'hard'
            }
        ];
        
        this.presentChoices(difficultyChoices, (choice) => {
            callback(choice.data);
        });
    }
    
    // Present choices for after battle (play again, return to menu)
    presentPostBattleChoices(playerWon, callback) {
        const postBattleChoices = [
            {
                id: 'playAgain',
                name: 'Play Again',
                description: 'Start a new duel with your current spells.',
                data: 'playAgain'
            },
            {
                id: 'returnToMenu',
                name: 'Return to Menu',
                description: 'Go back to the main menu.',
                data: 'returnToMenu'
            }
        ];
        
        // Add a special choice if player won
        if (playerWon) {
            postBattleChoices.unshift({
                id: 'increaseDifficulty',
                name: 'Increase Difficulty',
                description: 'Challenge yourself with a more powerful opponent.',
                data: 'increaseDifficulty'
            });
        }
        
        this.presentChoices(postBattleChoices, (choice) => {
            callback(choice.data);
        });
    }
    
    // Clear any active choices
    clearChoices() {
        this.currentChoices = [];
        this.choiceCallback = null;
        this.uiManager.clearChoices();
    }
}
