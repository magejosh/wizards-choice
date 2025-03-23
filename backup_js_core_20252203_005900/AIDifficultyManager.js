// AI Difficulty Manager
// Handles AI difficulty scaling and opponent selection

import { AIOpponentFactory } from './AIOpponent.js';

export class AIDifficultyManager {
    constructor(spellSystem, progressionSystem) {
        this.spellSystem = spellSystem;
        this.progressionSystem = progressionSystem;
        this.opponentFactory = new AIOpponentFactory();
        this.difficultyLevels = ['easy', 'normal', 'hard'];
        this.currentDifficulty = 'normal';
        this.opponentHistory = [];
    }
    
    init() {
        // Initialize with recommended difficulty based on player progression
        this.updateRecommendedDifficulty();
        return this;
    }
    
    updateRecommendedDifficulty() {
        // Get recommended difficulty from progression system
        this.currentDifficulty = this.progressionSystem.getRecommendedDifficulty();
        return this.currentDifficulty;
    }
    
    setDifficulty(difficulty) {
        if (this.difficultyLevels.includes(difficulty)) {
            this.currentDifficulty = difficulty;
        } else {
            console.error(`Invalid difficulty: ${difficulty}`);
        }
        return this.currentDifficulty;
    }
    
    getCurrentDifficulty() {
        return this.currentDifficulty;
    }
    
    createOpponent() {
        // Create an opponent based on current difficulty
        const opponent = this.opponentFactory.createOpponent(
            this.currentDifficulty, 
            this.spellSystem
        );
        
        // Add to history
        this.opponentHistory.push({
            name: opponent.name,
            difficulty: opponent.difficulty,
            elementFocus: opponent.elementFocus,
            date: new Date().toISOString()
        });
        
        // Limit history size
        if (this.opponentHistory.length > 10) {
            this.opponentHistory.shift();
        }
        
        return opponent;
    }
    
    getOpponentHistory() {
        return [...this.opponentHistory];
    }
    
    getLastOpponent() {
        if (this.opponentHistory.length === 0) {
            return null;
        }
        return this.opponentHistory[this.opponentHistory.length - 1];
    }
    
    getDifficultyDescription(difficulty) {
        switch(difficulty) {
            case 'easy':
                return "Novice opponents with basic spells. Recommended for beginners.";
            case 'normal':
                return "Skilled opponents with intermediate spells. A balanced challenge.";
            case 'hard':
                return "Master opponents with powerful spells. A true test of your wizardry.";
            default:
                return "Unknown difficulty level.";
        }
    }
    
    getDifficultyStats(difficulty) {
        // Return statistics about each difficulty level
        switch(difficulty) {
            case 'easy':
                return {
                    spellTiers: "Tier 1 only",
                    aiIntelligence: "Basic",
                    unlockChance: "50%",
                    recommendedFor: "New players"
                };
            case 'normal':
                return {
                    spellTiers: "Tier 1 and 2",
                    aiIntelligence: "Moderate",
                    unlockChance: "75%",
                    recommendedFor: "Experienced players"
                };
            case 'hard':
                return {
                    spellTiers: "All tiers, focus on 2 and 3",
                    aiIntelligence: "Advanced",
                    unlockChance: "100%",
                    recommendedFor: "Expert players"
                };
            default:
                return {
                    spellTiers: "Unknown",
                    aiIntelligence: "Unknown",
                    unlockChance: "Unknown",
                    recommendedFor: "Unknown"
                };
        }
    }
    
    // For future expansion: dynamic difficulty adjustment
    adjustDifficultyBasedOnPerformance(winRate) {
        if (winRate > 0.8) {
            // Player is doing very well, increase difficulty
            const currentIndex = this.difficultyLevels.indexOf(this.currentDifficulty);
            if (currentIndex < this.difficultyLevels.length - 1) {
                this.currentDifficulty = this.difficultyLevels[currentIndex + 1];
            }
        } else if (winRate < 0.2) {
            // Player is struggling, decrease difficulty
            const currentIndex = this.difficultyLevels.indexOf(this.currentDifficulty);
            if (currentIndex > 0) {
                this.currentDifficulty = this.difficultyLevels[currentIndex - 1];
            }
        }
        
        return this.currentDifficulty;
    }
}
