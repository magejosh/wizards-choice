// Progression System Module
// Handles player progression, spell unlocking, and difficulty scaling

import { EnhancedSpellSystem } from './EnhancedSpellSystem.js';

export class ProgressionSystem {
    constructor() {
        this.spellSystem = null;
        this.progressionTiers = [
            { name: 'Novice', requiredWins: 0, maxDifficulty: 'easy' },
            { name: 'Apprentice', requiredWins: 3, maxDifficulty: 'normal' },
            { name: 'Adept', requiredWins: 7, maxDifficulty: 'normal' },
            { name: 'Expert', requiredWins: 12, maxDifficulty: 'hard' },
            { name: 'Master', requiredWins: 18, maxDifficulty: 'hard' },
            { name: 'Archmage', requiredWins: 25, maxDifficulty: 'hard' }
        ];
        this.achievements = [
            { id: 'first_win', name: 'First Victory', description: 'Win your first duel', unlocked: false },
            { id: 'fire_master', name: 'Fire Master', description: 'Unlock all fire spells', unlocked: false },
            { id: 'water_master', name: 'Water Master', description: 'Unlock all water spells', unlocked: false },
            { id: 'earth_master', name: 'Earth Master', description: 'Unlock all earth spells', unlocked: false },
            { id: 'air_master', name: 'Air Master', description: 'Unlock all air spells', unlocked: false },
            { id: 'arcane_master', name: 'Arcane Master', description: 'Unlock all arcane spells', unlocked: false },
            { id: 'spell_collector', name: 'Spell Collector', description: 'Unlock 10 different spells', unlocked: false },
            { id: 'winning_streak', name: 'Winning Streak', description: 'Win 5 duels in a row', unlocked: false },
            { id: 'elemental_balance', name: 'Elemental Balance', description: 'Use spells from all 5 elements in a single duel', unlocked: false }
        ];
        this.currentWinStreak = 0;
        this.usedElementsInCurrentDuel = new Set();
    }
    
    init(spellSystem) {
        this.spellSystem = spellSystem;
        
        // Load achievements from local storage
        this.loadAchievements();
        
        return this;
    }
    
    getCurrentTier() {
        const wins = this.spellSystem.getPlayerProgress().wins;
        
        // Find the highest tier the player qualifies for
        for (let i = this.progressionTiers.length - 1; i >= 0; i--) {
            if (wins >= this.progressionTiers[i].requiredWins) {
                return this.progressionTiers[i];
            }
        }
        
        // Default to first tier
        return this.progressionTiers[0];
    }
    
    getNextTier() {
        const currentTier = this.getCurrentTier();
        const currentTierIndex = this.progressionTiers.findIndex(tier => tier.name === currentTier.name);
        
        // If player is at max tier, return null
        if (currentTierIndex === this.progressionTiers.length - 1) {
            return null;
        }
        
        return this.progressionTiers[currentTierIndex + 1];
    }
    
    getWinsUntilNextTier() {
        const nextTier = this.getNextTier();
        if (!nextTier) {
            return 0; // Already at max tier
        }
        
        const wins = this.spellSystem.getPlayerProgress().wins;
        return nextTier.requiredWins - wins;
    }
    
    getRecommendedDifficulty() {
        const currentTier = this.getCurrentTier();
        return currentTier.maxDifficulty;
    }
    
    processBattleResult(won, difficulty, usedSpells) {
        // Record battle result in spell system
        this.spellSystem.recordBattleResult(won, difficulty);
        
        // Update win streak
        if (won) {
            this.currentWinStreak++;
        } else {
            this.currentWinStreak = 0;
        }
        
        // Track used elements in current duel
        if (usedSpells && usedSpells.length > 0) {
            usedSpells.forEach(spell => {
                this.usedElementsInCurrentDuel.add(spell.element);
            });
        }
        
        // Check for achievements
        this.checkAchievements(won);
        
        // If player won, attempt to unlock a new spell
        let newSpell = null;
        if (won) {
            newSpell = this.spellSystem.unlockNewSpell(difficulty);
        }
        
        // Return battle results with progression info
        return {
            won,
            newSpell,
            currentTier: this.getCurrentTier(),
            nextTier: this.getNextTier(),
            winsUntilNextTier: this.getWinsUntilNextTier(),
            unlockedAchievements: this.getNewlyUnlockedAchievements()
        };
    }
    
    startNewDuel() {
        // Reset tracking for new duel
        this.usedElementsInCurrentDuel.clear();
        this.newlyUnlockedAchievements = [];
    }
    
    checkAchievements(won) {
        this.newlyUnlockedAchievements = [];
        const progress = this.spellSystem.getPlayerProgress();
        const unlockedSpells = this.spellSystem.getUnlockedSpells();
        
        // Check first win achievement
        if (won && progress.wins === 1) {
            this.unlockAchievement('first_win');
        }
        
        // Check winning streak achievement
        if (this.currentWinStreak >= 5) {
            this.unlockAchievement('winning_streak');
        }
        
        // Check spell collector achievement
        if (unlockedSpells.length >= 10) {
            this.unlockAchievement('spell_collector');
        }
        
        // Check elemental balance achievement
        if (this.usedElementsInCurrentDuel.size >= 5) {
            this.unlockAchievement('elemental_balance');
        }
        
        // Check element master achievements
        const elementCounts = {
            fire: 0,
            water: 0,
            earth: 0,
            air: 0,
            arcane: 0
        };
        
        unlockedSpells.forEach(spell => {
            if (elementCounts[spell.element] !== undefined) {
                elementCounts[spell.element]++;
            }
        });
        
        // Check if all spells of each element are unlocked
        if (elementCounts.fire >= 3) {
            this.unlockAchievement('fire_master');
        }
        
        if (elementCounts.water >= 3) {
            this.unlockAchievement('water_master');
        }
        
        if (elementCounts.earth >= 3) {
            this.unlockAchievement('earth_master');
        }
        
        if (elementCounts.air >= 3) {
            this.unlockAchievement('air_master');
        }
        
        if (elementCounts.arcane >= 3) {
            this.unlockAchievement('arcane_master');
        }
        
        // Save achievements
        this.saveAchievements();
    }
    
    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            achievement.unlockDate = new Date().toISOString();
            this.newlyUnlockedAchievements.push(achievement);
            console.log(`Achievement unlocked: ${achievement.name}`);
        }
    }
    
    getNewlyUnlockedAchievements() {
        return this.newlyUnlockedAchievements || [];
    }
    
    getAllAchievements() {
        return [...this.achievements];
    }
    
    getUnlockedAchievements() {
        return this.achievements.filter(a => a.unlocked);
    }
    
    getLockedAchievements() {
        return this.achievements.filter(a => !a.unlocked);
    }
    
    saveAchievements() {
        try {
            localStorage.setItem('wizardsChoice_achievements', JSON.stringify(this.achievements));
            localStorage.setItem('wizardsChoice_winStreak', this.currentWinStreak.toString());
        } catch (error) {
            console.error('Error saving achievements:', error);
        }
    }
    
    loadAchievements() {
        try {
            const savedAchievements = localStorage.getItem('wizardsChoice_achievements');
            const savedWinStreak = localStorage.getItem('wizardsChoice_winStreak');
            
            if (savedAchievements) {
                this.achievements = JSON.parse(savedAchievements);
            }
            
            if (savedWinStreak) {
                this.currentWinStreak = parseInt(savedWinStreak, 10);
            }
        } catch (error) {
            console.error('Error loading achievements:', error);
        }
    }
    
    resetProgress() {
        // Reset achievements
        this.achievements.forEach(achievement => {
            achievement.unlocked = false;
            delete achievement.unlockDate;
        });
        
        // Reset win streak
        this.currentWinStreak = 0;
        
        // Save reset state
        this.saveAchievements();
    }
    
    getProgressSummary() {
        const progress = this.spellSystem.getPlayerProgress();
        const currentTier = this.getCurrentTier();
        const nextTier = this.getNextTier();
        const unlockedSpells = this.spellSystem.getUnlockedSpells();
        const unlockedAchievements = this.getUnlockedAchievements();
        
        return {
            tier: currentTier.name,
            wins: progress.wins,
            losses: progress.losses,
            winRate: progress.wins + progress.losses > 0 
                ? Math.round((progress.wins / (progress.wins + progress.losses)) * 100) 
                : 0,
            spellsUnlocked: unlockedSpells.length,
            totalSpells: Object.keys(this.spellSystem.spells).length,
            achievementsUnlocked: unlockedAchievements.length,
            totalAchievements: this.achievements.length,
            nextTier: nextTier ? nextTier.name : 'Max Tier Reached',
            winsUntilNextTier: this.getWinsUntilNextTier(),
            currentWinStreak: this.currentWinStreak
        };
    }
}
