// SpellProgressionTracker.js - Manages player progression and spell unlocking

class SpellProgressionTracker {
    constructor(spellDefinitions) {
        this.spellDefinitions = spellDefinitions;
        this.playerUnlockedSpells = [];
        this.playerProgress = {
            level: 1,
            experience: 0,
            unlockedSpells: []
        };
    }

    init() {
        console.log('Initializing SpellProgressionTracker...');
        
        // Initialize player progress
        this.initPlayerProgress();
        
        console.log('SpellProgressionTracker initialized');
        return this.playerProgress;
    }

    // Initialize player progress - sets up default progress for a new game
    initPlayerProgress() {
        console.log('Initializing player progress...');
        
        // Set default values
        this.playerProgress = {
            level: 1,
            experience: 0,
            unlockedSpells: ['fireball', 'waterBlast', 'stoneSkin', 'windGust', 'arcaneMissile']
        };
        
        // Initialize player unlocked spells from progress
        this.playerUnlockedSpells = [...this.playerProgress.unlockedSpells];
        
        // Save the initial state
        this.saveProgress();
        
        return this.playerProgress;
    }

    // Reset player progress to default values
    resetPlayerProgress() {
        console.log('Resetting player progress...');
        
        // Use initPlayerProgress to reset to default values
        return this.initPlayerProgress();
    }

    // Save player progress to localStorage
    saveProgress() {
        try {
            // Update the unlockedSpells in the progress object
            this.playerProgress.unlockedSpells = this.playerUnlockedSpells;
            
            // Save to localStorage
            localStorage.setItem('playerProgress', JSON.stringify(this.playerProgress));
            console.log('Player progress saved:', this.playerProgress);
            return true;
        } catch (error) {
            console.error('Error saving player progress:', error);
            return false;
        }
    }

    // Load player progress from localStorage
    loadProgress() {
        try {
            const savedProgress = localStorage.getItem('playerProgress');
            
            if (savedProgress) {
                this.playerProgress = JSON.parse(savedProgress);
                
                // Ensure we have the unlockedSpells array
                if (this.playerProgress.unlockedSpells) {
                    this.playerUnlockedSpells = this.playerProgress.unlockedSpells;
                } else {
                    // If no unlockedSpells in saved progress, initialize with defaults
                    this.playerUnlockedSpells = ['fireball', 'waterBlast', 'stoneSkin', 'windGust', 'arcaneMissile'];
                    this.playerProgress.unlockedSpells = this.playerUnlockedSpells;
                }
                
                console.log('Player progress loaded:', this.playerProgress);
                return this.playerProgress;
            } else {
                console.log('No saved progress found, initializing new progress');
                return this.initPlayerProgress();
            }
        } catch (error) {
            console.error('Error loading player progress:', error);
            return this.initPlayerProgress();
        }
    }

    // Get player unlocked spells
    getPlayerUnlockedSpells() {
        return this.playerUnlockedSpells;
    }

    // Alias for getPlayerUnlockedSpells to maintain compatibility
    getUnlockedSpells() {
        return this.getPlayerUnlockedSpells();
    }

    // Get player progress
    getPlayerProgress() {
        return this.playerProgress;
    }

    // Add experience to the player
    addExperience(amount) {
        // Define max level
        const MAX_LEVEL = 10;
        const MAX_EXPERIENCE_CAP = 80; // Cap at 80/100 experience
        
        // Check if player is at max level
        if (this.playerProgress.level >= MAX_LEVEL && this.playerProgress.experience >= MAX_EXPERIENCE_CAP) {
            console.log(`Player has reached the maximum level and experience cap. No more experience gained.`);
            return false;
        }
        
        // Calculate how much experience can be added before hitting cap
        let experienceToAdd = amount;
        
        // If at max level, only allow experience up to the cap
        if (this.playerProgress.level >= MAX_LEVEL) {
            const roomUntilCap = MAX_EXPERIENCE_CAP - this.playerProgress.experience;
            if (roomUntilCap <= 0) {
                console.log(`Player is at maximum experience cap. No more experience gained.`);
                return false;
            }
            experienceToAdd = Math.min(amount, roomUntilCap);
            console.log(`Player at max level. Limited experience gain to ${experienceToAdd} (cap: ${MAX_EXPERIENCE_CAP})`);
        }
        
        this.playerProgress.experience += experienceToAdd;
        
        // Check for level up
        const nextLevelThreshold = this.playerProgress.level * 100;
        
        if (this.playerProgress.experience >= nextLevelThreshold && this.playerProgress.level < MAX_LEVEL) {
            this.playerProgress.level++;
            this.playerProgress.experience -= nextLevelThreshold;
            
            console.log(`Player leveled up to level ${this.playerProgress.level}!`);
            
            // Unlock new spells based on level
            const newSpells = this.getSpellsByUnlockLevel(this.playerProgress.level);
            
            newSpells.forEach(spell => {
                this.unlockSpell(spell.id);
            });
            
            return true;
        }
        
        return false;
    }

    // Get spells that unlock at a specific level
    getSpellsByUnlockLevel(level) {
        return Object.values(this.spellDefinitions.spells).filter(spell => spell.unlockLevel === level);
    }

    // Get available spells for unlock based on player level
    getAvailableSpellsForUnlock(playerLevel) {
        // Get all spells that are unlockable at the player's level or below
        const availableSpells = Object.values(this.spellDefinitions.spells).filter(spell => 
            spell.unlockLevel <= playerLevel && !this.playerUnlockedSpells.includes(spell.id)
        );
        
        return availableSpells;
    }

    // Unlock a spell for the player
    unlockSpell(spellId) {
        console.log(`Attempting to unlock spell: ${spellId}`);
        
        // Check if the spell exists
        const spell = this.spellDefinitions.getSpellById(spellId);
        if (!spell) {
            console.error(`Cannot unlock spell: Spell ID ${spellId} not found`);
            return null;
        }
        
        // Check if the spell is already unlocked
        if (!this.playerUnlockedSpells.includes(spellId)) {
            this.playerUnlockedSpells.push(spellId);
            console.log(`Unlocked new spell: ${this.spellDefinitions.getSpellById(spellId).name}`);
            return this.spellDefinitions.getSpellById(spellId);
        }
        
        console.log(`Spell ${spellId} is already unlocked`);
        return null;
    }

    // Get spell options for level-up (1 from defeated enemy, 2 random)
    getSpellOptionsForLevelUp(defeatedEnemySpells) {
        console.log('Getting spell options for level-up');
        
        // Get all available spells that aren't unlocked yet
        const availableSpells = this.getAvailableSpellsForUnlock(this.playerProgress.level);
        
        // Create array to hold the 3 options
        const spellOptions = [];
        
        // Try to add one spell from the defeated enemy
        if (defeatedEnemySpells && defeatedEnemySpells.length > 0) {
            // Filter enemy spells to those the player doesn't have
            const newEnemySpells = defeatedEnemySpells.filter(spellId =>
                !this.playerUnlockedSpells.includes(spellId));
            
            if (newEnemySpells.length > 0) {
                // Randomly select one enemy spell
                const randomEnemySpell = newEnemySpells[Math.floor(Math.random() * newEnemySpells.length)];
                const enemySpell = this.spellDefinitions.getSpellById(randomEnemySpell);
                if (enemySpell) {
                    spellOptions.push(enemySpell);
                    console.log(`Added enemy spell to options: ${enemySpell.name}`);
                }
            }
        }
        
        // Add random spells from available spells to fill up to 3 options
        const remainingSpells = [...availableSpells];
        
        // Remove any spells already in options
        spellOptions.forEach(spell => {
            const index = remainingSpells.findIndex(s => s.id === spell.id);
            if (index !== -1) {
                remainingSpells.splice(index, 1);
            }
        });
        
        // If we don't have enough new spells, add some already unlocked spells for improvement
        if (remainingSpells.length < (3 - spellOptions.length)) {
            const unlockedSpells = this.playerUnlockedSpells.map(id => this.spellDefinitions.getSpellById(id));
            remainingSpells.push(...unlockedSpells);
        }
        
        // Shuffle the remaining spells
        for (let i = remainingSpells.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [remainingSpells[i], remainingSpells[j]] = [remainingSpells[j], remainingSpells[i]];
        }
        
        // Add remaining spells to options until we have 3
        while (spellOptions.length < 3 && remainingSpells.length > 0) {
            const spell = remainingSpells.pop();
            spellOptions.push(spell);
            console.log(`Added spell to options: ${spell.name}`);
        }
        
        console.log(`Returning ${spellOptions.length} spell options for level-up`);
        return spellOptions;
    }

    // Unlock a new spell based on difficulty
    unlockNewSpell(difficulty) {
        console.log(`Attempting to unlock new spell based on ${difficulty} difficulty`);
        
        // Get available spells that aren't unlocked yet
        const availableSpells = this.getAvailableSpellsForUnlock(this.playerProgress.level);
        
        if (availableSpells.length === 0) {
            console.log('No new spells available to unlock');
            return null;
        }
        
        // Filter spells based on difficulty
        let eligibleSpells = [];
        
        if (difficulty === 'easy') {
            // On easy, only unlock low-level spells
            eligibleSpells = availableSpells.filter(spell => spell.unlockLevel <= this.playerProgress.level - 1);
        } else if (difficulty === 'normal') {
            // On normal, unlock spells at current level
            eligibleSpells = availableSpells.filter(spell => spell.unlockLevel <= this.playerProgress.level);
        } else if (difficulty === 'hard') {
            // On hard, chance to unlock higher level spells
            eligibleSpells = availableSpells;
        }
        
        // If no eligible spells after filtering, return null
        if (eligibleSpells.length === 0) {
            console.log('No eligible spells to unlock for this difficulty');
            return null;
        }
        
        // Randomly select a spell to unlock
        const randomIndex = Math.floor(Math.random() * eligibleSpells.length);
        const spellToUnlock = eligibleSpells[randomIndex];
        
        // Unlock the spell
        this.unlockSpell(spellToUnlock.id);
        
        console.log(`Unlocked new spell: ${spellToUnlock.name}`);
        
        // Save progress
        this.saveProgress();
        
        return spellToUnlock;
    }

    // Record battle results and update player progress
    recordBattleResult(won, difficulty) {
        console.log(`Recording battle result: ${won ? 'Victory' : 'Defeat'} on ${difficulty} difficulty`);
        
        // Update player stats based on battle outcome
        if (!this.playerProgress.stats) {
            this.playerProgress.stats = {
                wins: 0,
                losses: 0,
                easyWins: 0,
                normalWins: 0,
                hardWins: 0
            };
        }
        
        // Update win/loss count
        if (won) {
            this.playerProgress.stats.wins++;
            
            // Update difficulty-specific win count
            if (difficulty === 'easy') {
                this.playerProgress.stats.easyWins++;
                // Award experience based on difficulty
                this.addExperience(20);
            } else if (difficulty === 'normal') {
                this.playerProgress.stats.normalWins++;
                this.addExperience(40);
            } else if (difficulty === 'hard') {
                this.playerProgress.stats.hardWins++;
                this.addExperience(70);
            }
        } else {
            this.playerProgress.stats.losses++;
            // Award some experience even for losses
            this.addExperience(10);
        }
        
        // Save progress after battle
        this.saveProgress();
        
        return this.playerProgress.stats;
    }

    // Improve an existing spell
    improveSpell(spellId) {
        console.log(`Improving existing spell: ${spellId}`);
        
        const spell = this.spellDefinitions.getSpellById(spellId);
        if (!spell) {
            console.error(`Cannot improve spell ${spellId}: not found`);
            return null;
        }
        
        // Choose a random improvement
        const improvementType = Math.random() < 0.5 ? 'mana' : 'effect';
        
        if (improvementType === 'mana' && spell.manaCost > 5) {
            // Reduce mana cost by 10-20%
            const reduction = Math.max(1, Math.floor(spell.manaCost * (0.1 + Math.random() * 0.1)));
            spell.manaCost = Math.max(5, spell.manaCost - reduction);
            console.log(`Reduced mana cost of ${spell.name} by ${reduction} to ${spell.manaCost}`);
        } else {
            // Increase damage, healing, or mana restore by 10-20%
            if (spell.damage > 0) {
                const increase = Math.max(1, Math.floor(spell.damage * (0.1 + Math.random() * 0.1)));
                spell.damage += increase;
                console.log(`Increased damage of ${spell.name} by ${increase} to ${spell.damage}`);
            } else if (spell.healing > 0) {
                const increase = Math.max(1, Math.floor(spell.healing * (0.1 + Math.random() * 0.1)));
                spell.healing += increase;
                console.log(`Increased healing of ${spell.name} by ${increase} to ${spell.healing}`);
            } else if (spell.manaRestore > 0) {
                const increase = Math.max(1, Math.floor(spell.manaRestore * (0.1 + Math.random() * 0.1)));
                spell.manaRestore += increase;
                console.log(`Increased mana restore of ${spell.name} by ${increase} to ${spell.manaRestore}`);
            } else {
                // If no effect to improve, reduce mana cost instead
                const reduction = Math.max(1, Math.floor(spell.manaCost * (0.1 + Math.random() * 0.1)));
                spell.manaCost = Math.max(5, spell.manaCost - reduction);
                console.log(`Reduced mana cost of ${spell.name} by ${reduction} to ${spell.manaCost}`);
            }
        }
        
        // Save the improved spell
        this.saveProgress();
        
        return this.spellDefinitions.getSpellById(spellId);
    }
}

export default SpellProgressionTracker;
