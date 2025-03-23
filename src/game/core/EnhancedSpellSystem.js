// Enhanced Spell System - Manages spells, their effects, and player progression

class EnhancedSpellSystem {
    constructor() {
        this.spells = {};
        this.playerUnlockedSpells = [];
        this.playerProgress = {
            level: 1,
            experience: 0,
            unlockedSpells: []
        };
        // Track spells used in current battle
        this.usedSpellsTracking = [];
        // Player's current hand of active spells (3 spells they can cast)
        this.playerSpellHand = [];
        // Maximum number of spells in hand
        this.maxHandSize = 3;
        // Available spells left in the "deck" for the current battle
        this.availableSpellsForBattle = [];
    }

    init() {
        console.log('Initializing Enhanced Spell System...');
        
        // Define base spell types
        this.defineSpells();
        
        // Load player progress
        this.loadProgress();
        
        // Set default unlocked spells for new players
        if (this.playerUnlockedSpells.length === 0) {
            this.playerUnlockedSpells = [ 'fireball', 'waterBlast', 'stoneSkin', 'windGust', 'arcaneMissile' ];
        }
        
        console.log('Enhanced Spell System initialized with', Object.keys(this.spells).length, 'spells');
        console.log('Player has unlocked', this.playerUnlockedSpells.length, 'spells');
    }

    defineSpells() {
        // Fire spells
        this.addSpell({
            id: 'fireball',
            name: 'Fireball',
            description: 'Launches a ball of fire at your opponent',
            element: 'fire',
            manaCost: 15,
            damage: 20,
            healing: 0,
            manaRestore: 0,
            unlockLevel: 1
        });
        
        this.addSpell({
            id: 'inferno',
            name: 'Inferno',
            description: 'Engulfs your opponent in a raging inferno',
            element: 'fire',
            manaCost: 35,
            damage: 45,
            healing: 0,
            manaRestore: 0,
            unlockLevel: 5
        });
        
        this.addSpell({
            id: 'phoenixFlame',
            name: 'Phoenix Flame',
            description: 'Summons the healing power of the phoenix',
            element: 'fire',
            manaCost: 40,
            damage: 10,
            healing: 25,
            manaRestore: 0,
            unlockLevel: 8
        });
        
        // Water spells
        this.addSpell({
            id: 'waterBlast',
            name: 'Water Blast',
            description: 'Blasts your opponent with a surge of water',
            element: 'water',
            manaCost: 10,
            damage: 15,
            healing: 0,
            manaRestore: 0,
            unlockLevel: 1
        });
        
        this.addSpell({
            id: 'iceSpike',
            name: 'Ice Spike',
            description: 'Launches a sharp spike of ice at your opponent',
            element: 'water',
            manaCost: 25,
            damage: 30,
            healing: 0,
            manaRestore: 0,
            unlockLevel: 3
        });
        
        this.addSpell({
            id: 'tidalWave',
            name: 'Tidal Wave',
            description: 'Summons a massive wave to crash into your opponent',
            element: 'water',
            manaCost: 45,
            damage: 50,
            healing: 0,
            manaRestore: 0,
            unlockLevel: 7
        });
        
        this.addSpell({
            id: 'healingRain',
            name: 'Healing Rain',
            description: 'Summons a gentle rain that heals your wounds',
            element: 'water',
            manaCost: 30,
            damage: 0,
            healing: 35,
            manaRestore: 0,
            unlockLevel: 4
        });
        
        // Earth spells
        this.addSpell({
            id: 'stoneSkin',
            name: 'Stone Skin',
            description: 'Hardens your skin, reducing damage and healing wounds',
            element: 'earth',
            manaCost: 20,
            damage: 0,
            healing: 20,
            manaRestore: 0,
            unlockLevel: 1
        });
        
        this.addSpell({
            id: 'boulderThrow',
            name: 'Boulder Throw',
            description: 'Hurls a massive boulder at your opponent',
            element: 'earth',
            manaCost: 30,
            damage: 35,
            healing: 0,
            manaRestore: 0,
            unlockLevel: 4
        });
        
        this.addSpell({
            id: 'earthquake',
            name: 'Earthquake',
            description: 'Shakes the ground beneath your opponent',
            element: 'earth',
            manaCost: 50,
            damage: 60,
            healing: 0,
            manaRestore: 0,
            unlockLevel: 9
        });
        
        // Air spells
        this.addSpell({
            id: 'windGust',
            name: 'Wind Gust',
            description: 'Blasts your opponent with a gust of wind',
            element: 'air',
            manaCost: 10,
            damage: 10,
            healing: 0,
            manaRestore: 10,
            unlockLevel: 1
        });
        
        this.addSpell({
            id: 'lightningBolt',
            name: 'Lightning Bolt',
            description: 'Strikes your opponent with a bolt of lightning',
            element: 'air',
            manaCost: 30,
            damage: 40,
            healing: 0,
            manaRestore: 0,
            unlockLevel: 5
        });
        
        this.addSpell({
            id: 'thunderstorm',
            name: 'Thunderstorm',
            description: 'Summons a violent storm to strike your opponent',
            element: 'air',
            manaCost: 45,
            damage: 55,
            healing: 0,
            manaRestore: 0,
            unlockLevel: 8
        });
        
        // Arcane spells
        this.addSpell({
            id: 'arcaneMissile',
            name: 'Arcane Missile',
            description: 'Launches a missile of pure arcane energy',
            element: 'arcane',
            manaCost: 15,
            damage: 18,
            healing: 0,
            manaRestore: 5,
            unlockLevel: 2
        });
        
        this.addSpell({
            id: 'manaSurge',
            name: 'Mana Surge',
            description: 'Replenishes your mana reserves',
            element: 'arcane',
            manaCost: 10,
            damage: 0,
            healing: 0,
            manaRestore: 30,
            unlockLevel: 3
        });
        
        this.addSpell({
            id: 'arcaneSurge',
            name: 'Arcane Surge',
            description: 'Unleashes a powerful surge of arcane energy',
            element: 'arcane',
            manaCost: 60,
            damage: 70,
            healing: 0,
            manaRestore: 0,
            unlockLevel: 10
        });
    }

    addSpell(spellData) {
        this.spells[spellData.id] = spellData;
    }

    getSpellById(spellId) {
        if (this.spells[spellId]) {
            return {
                id: spellId,
                name: this.spells[spellId].name,
                element: this.spells[spellId].element,
                description: this.spells[spellId].description,
                manaCost: this.spells[spellId].manaCost,
                damage: this.spells[spellId].damage || 0,
                healing: this.spells[spellId].healing || 0,
                manaRestore: this.spells[spellId].manaRestore || 0,
                unlockLevel: this.spells[spellId].unlockLevel
            };
        }
        return null;
    }

    getPlayerUnlockedSpells() {
        return this.playerUnlockedSpells;
    }

    getUnlockedSpells() {
        return this.getPlayerUnlockedSpells();
    }

    unlockSpell(spellId) {
        if (!this.playerUnlockedSpells.includes(spellId)) {
            this.playerUnlockedSpells.push(spellId);
            console.log(`Unlocked new spell: ${this.getSpellById(spellId).name}`);
            return this.getSpellById(spellId);
        } else {
            // If spell is already unlocked, improve it
            return this.improveSpell(spellId);
        }
    }
    
    // Improve an existing spell (reduce mana cost or increase effect)
    improveSpell(spellId) {
        console.log(`Improving existing spell: ${spellId}`);
        
        const spell = this.spells[spellId];
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
        
        return this.getSpellById(spellId);
    }

    getSpellsByElement(element) {
        return Object.values(this.spells).filter(spell => spell.element === element);
    }

    getSpellsByUnlockLevel(level) {
        return Object.values(this.spells).filter(spell => spell.unlockLevel === level);
    }

    getAvailableSpellsForUnlock(playerLevel) {
        return Object.values(this.spells).filter(spell => 
            spell.unlockLevel <= playerLevel && 
            !this.playerUnlockedSpells.includes(spell.id)
        );
    }

    saveProgress() {
        try {
            const progressData = {
                unlockedSpells: this.playerUnlockedSpells,
                level: this.playerProgress.level,
                experience: this.playerProgress.experience
            };
            
            localStorage.setItem('wizardChoiceSpellProgress', JSON.stringify(progressData));
            console.log('Spell progress saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving spell progress:', error);
            return false;
        }
    }

    loadProgress() {
        try {
            const savedData = localStorage.getItem('wizardChoiceSpellProgress');
            
            if (savedData) {
                const progressData = JSON.parse(savedData);
                
                if (progressData.unlockedSpells) {
                    this.playerUnlockedSpells = progressData.unlockedSpells;
                }
                
                if (progressData.level) {
                    this.playerProgress.level = progressData.level;
                }
                
                if (progressData.experience) {
                    this.playerProgress.experience = progressData.experience;
                }
                
                console.log('Spell progress loaded successfully');
                return true;
            }
            
            console.log('No saved spell progress found');
            return false;
        } catch (error) {
            console.error('Error loading spell progress:', error);
            return false;
        }
    }

    getPlayerProgress() {
        return this.playerProgress;
    }

    resetPlayerProgress() {
        console.log('Resetting player progress to level 1');
        
        // Reset progress stats
        this.playerProgress = {
            level: 1,
            experience: 0,
            unlockedSpells: []
        };
        
        // Reset unlocked spells to starter set
        this.playerUnlockedSpells = ['fireball', 'waterBlast', 'stoneSkin', 'windGust', 'arcaneMissile'];
        
        // Save the reset progress
        this.saveProgress();
        
        return this.playerProgress;
    }

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

    getSpellsForDisplay() {
        return this.playerUnlockedSpells.map(spellId => {
            const spell = this.spells[spellId];
            return {
                id: spellId,
                name: spell.name,
                element: spell.element,
                description: spell.description,
                manaCost: spell.manaCost,
                damage: spell.damage || 0,
                healing: spell.healing || 0,
                manaRestore: spell.manaRestore || 0,
                unlockLevel: spell.unlockLevel
            };
        }).sort((a, b) => {
            // Sort by element first, then by mana cost
            if (a.element !== b.element) {
                const elementOrder = { fire: 1, water: 2, earth: 3, air: 4, arcane: 5 };
                return elementOrder[a.element] - elementOrder[b.element];
            }
            return a.manaCost - b.manaCost;
        });
    }

    // Initialize player spells - sets up default spells for a new game
    initPlayerSpells() {
        console.log('Initializing player spells...');
        
        // Reset to default starter spells
        this.playerUnlockedSpells = ['fireball', 'waterBlast', 'stoneSkin', 'windGust', 'arcaneMissile'];
        
        // Reset player progress
        this.playerProgress = {
            level: 1,
            experience: 0,
            unlockedSpells: this.playerUnlockedSpells
        };
        
        console.log('Player spells initialized with', this.playerUnlockedSpells.length, 'spells');
        
        // Save the initial state
        this.saveProgress();
        
        return this.playerUnlockedSpells;
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
                const enemySpell = this.getSpellById(randomEnemySpell);
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
            const unlockedSpells = this.playerUnlockedSpells.map(id => this.getSpellById(id));
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

    getUsedSpells() {
        try {
            return Array.isArray(this.usedSpellsTracking) ? this.usedSpellsTracking : [];
        } catch (error) {
            console.error('Error in getUsedSpells:', error);
            return [];
        }
    }

    // Track spell usage during a battle
    trackSpellUsage(spellId) {
        try {
            const spell = this.getSpellById(spellId);
            if (!spell) {
                console.warn(`Cannot track spell usage: Spell ID ${spellId} not found`);
                return false;
            }
            
            if (!Array.isArray(this.usedSpellsTracking)) {
                this.usedSpellsTracking = [];
            }
            
            if (!this.usedSpellsTracking.some(s => s.id === spellId)) {
                this.usedSpellsTracking.push(spell);
                console.log(`Tracked spell usage: ${spell.name}`);
            }
            return true;
        } catch (error) {
            console.error('Error in trackSpellUsage:', error);
            return false;
        }
    }

    // Reset spell tracking for a new battle
    resetSpellTracking() {
        try {
            console.log('Resetting spell tracking for new battle');
            this.usedSpellsTracking = []; 
            return true;
        } catch (error) {
            console.error('Error in resetSpellTracking:', error);
            return false;
        }
    }

    // Initialize the player's spell hand for battle
    initializeSpellHand() {
        console.log('Initializing player spell hand for battle');
        
        // Reset spell hand
        this.playerSpellHand = [];
        
        // Set max hand size
        this.maxHandSize = 3;
        
        // Reset available spells for battle (deck of unlocked spells)
        this.availableSpellsForBattle = [...this.getPlayerUnlockedSpells()];
        
        // Shuffle the deck
        this.shuffleSpellDeck();
        
        console.log(`Available spells in deck: ${this.availableSpellsForBattle.length}`);
        
        // Draw initial hand of 3 spells
        for (let i = 0; i < this.maxHandSize; i++) {
            this.drawSpellFromDeck();
        }
        
        console.log('Initial hand:', this.playerSpellHand.map(spell => spell.name).join(', '));
        return this.playerSpellHand;
    }
    
    // Refill the player's spell hand up to the maximum hand size
    refillSpellHand() {
        console.log('Refilling player spell hand');
        console.log(`Current hand has ${this.playerSpellHand.length} spells out of ${this.maxHandSize}`);
        
        // Check if hand is already full
        if (this.playerSpellHand.length >= this.maxHandSize) {
            console.log('Hand is already full');
            return null;
        }
        
        // Draw cards until we have maxHandSize cards or the deck is empty
        let lastDrawnCard = null;
        while (this.playerSpellHand.length < this.maxHandSize) {
            const drawnSpell = this.drawSpellFromDeck();
            if (drawnSpell) {
                lastDrawnCard = drawnSpell;
            } else {
                console.log('Failed to draw a spell - deck might be empty');
                // If we can't draw a card and can't reshuffle, break out
                break;
            }
        }
        
        console.log('Hand after refill:', this.playerSpellHand.map(spell => spell.name).join(', '));
        return lastDrawnCard; // Return the last card drawn for UI feedback
    }
    
    // Draw a random spell from the deck and add it to the player's hand
    drawSpellFromDeck() {
        console.log('Attempting to draw a spell from deck');
        
        // Initialize the deck if it doesn't exist
        if (!this.availableSpellsForBattle || this.availableSpellsForBattle.length === 0) {
            console.log('Deck not initialized, creating it now');
            this.availableSpellsForBattle = [...this.getPlayerUnlockedSpells()];
            this.shuffleSpellDeck();
        }
        
        // Check if deck is empty
        if (this.availableSpellsForBattle.length === 0) {
            console.log('Deck is empty - need to reshuffle discard pile');
            // In a real card game, we would reshuffle the discard pile here
            // For our game, we'll get all spells that aren't currently in hand
            this.reshuffleDiscardPile();
            
            // If still no cards after reshuffling, we can't draw
            if (this.availableSpellsForBattle.length === 0) {
                console.log('No spells available even after reshuffling');
                return null;
            }
        }
        
        // Get IDs of spells currently in hand for duplicate checking
        const spellsInHandIds = this.playerSpellHand.map(spell => 
            typeof spell === 'object' ? spell.id : spell
        );
        
        // Try to draw a non-duplicate spell first
        let attempts = 0;
        let drawnSpellId = null;
        const maxAttempts = this.availableSpellsForBattle.length;
        
        while (attempts < maxAttempts) {
            // Get the next potential spell
            const potentialSpellId = this.availableSpellsForBattle[0];
            
            // Check if this spell is already in hand
            if (!spellsInHandIds.includes(potentialSpellId)) {
                // Not a duplicate, so draw this spell
                drawnSpellId = this.availableSpellsForBattle.shift();
                break;
            } else {
                // It's a duplicate, move it to the end of the deck and try the next one
                this.availableSpellsForBattle.shift();
                this.availableSpellsForBattle.push(potentialSpellId);
                attempts++;
            }
        }
        
        // If we couldn't find a non-duplicate after checking all cards, just draw the top card
        if (!drawnSpellId && this.availableSpellsForBattle.length > 0) {
            console.log('Could not find a non-duplicate spell, drawing anyway');
            drawnSpellId = this.availableSpellsForBattle.shift();
        }
        
        // Get the spell object from the ID
        const drawnSpell = this.getSpellById(drawnSpellId);
        
        if (drawnSpell) {
            console.log(`Drew spell from deck: ${drawnSpell.name}`);
            this.playerSpellHand.push(drawnSpell);
            return drawnSpell;
        } else {
            console.error(`Failed to get spell with ID: ${drawnSpellId}`);
            return null;
        }
    }
    
    // Shuffle the spell deck (the available spells for battle)
    shuffleSpellDeck() {
        // Fisher-Yates shuffle algorithm
        for (let i = this.availableSpellsForBattle.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.availableSpellsForBattle[i], this.availableSpellsForBattle[j]] = 
            [this.availableSpellsForBattle[j], this.availableSpellsForBattle[i]];
        }
        console.log('Spell deck shuffled');
    }
    
    // Reshuffle the "discard pile" back into the deck
    reshuffleDiscardPile() {
        console.log('Reshuffling discard pile into deck');
        
        // Get all unlocked spells
        const allUnlockedSpells = this.getPlayerUnlockedSpells();
        
        // Get IDs of spells currently in hand 
        const spellsInHandIds = this.playerSpellHand.map(spell => 
            typeof spell === 'object' ? spell.id : spell
        );
        
        // Reshuffle all spells not currently in hand back into the deck
        this.availableSpellsForBattle = allUnlockedSpells.filter(spellId => 
            !spellsInHandIds.includes(spellId)
        );
        
        // Shuffle the new deck
        this.shuffleSpellDeck();
        
        console.log(`Deck reshuffled with ${this.availableSpellsForBattle.length} spells`);
    }
    
    // Remove a spell from the player's hand after casting it
    removeSpellFromHand(spellId) {
        console.log(`Attempting to remove spell ${spellId} from hand`);
        
        if (!this.playerSpellHand || this.playerSpellHand.length === 0) {
            console.warn(`Cannot remove spell ${spellId} from empty hand`);
            return false;
        }
        
        const handBefore = [...this.playerSpellHand];
        console.log('Hand before removing:', handBefore.map(spell => spell.name).join(', '));
        
        // Find the spell in the hand
        let index = -1;
        
        // Check if playerSpellHand contains spell objects or spell IDs
        if (typeof this.playerSpellHand[0] === 'object') {
            index = this.playerSpellHand.findIndex(spell => spell.id === spellId);
        } else {
            index = this.playerSpellHand.indexOf(spellId);
        }
        
        if (index !== -1) {
            // Remove the spell from the hand
            this.playerSpellHand.splice(index, 1);
            console.log(`Removed spell ${spellId} from hand after casting`);
            console.log('Hand after removing:', this.playerSpellHand.map(spell => spell.name).join(', '));
            return true;
        }
        
        console.log(`Spell ${spellId} not found in hand`);
        return false;
    }
    
    // Get the player's current spell hand
    getPlayerSpellHand() {
        // Ensure we have a valid spell hand
        if (!this.playerSpellHand) {
            this.playerSpellHand = [];
        }
        
        // Create a unique version of each spell in the hand by adding a unique identifier
        const uniqueSpellHand = this.playerSpellHand.map((spell, index) => {
            // If it's already an object with an id, create a copy with a unique instance id
            if (typeof spell === 'object') {
                // Create a deep copy of the spell object
                const spellCopy = JSON.parse(JSON.stringify(spell));
                
                // Add a unique instance ID to each spell in the hand
                // This ensures React can use unique keys even with duplicate spells
                spellCopy.instanceId = `${spellCopy.id}_${index}`;
                
                return spellCopy;
            } 
            // If it's just a spell ID string, look up the spell and add a unique instance id
            else {
                const spellObj = this.getSpellById(spell);
                if (spellObj) {
                    // Create a deep copy of the spell object
                    const spellCopy = JSON.parse(JSON.stringify(spellObj));
                    
                    // Add a unique instance ID
                    spellCopy.instanceId = `${spellCopy.id}_${index}`;
                    
                    return spellCopy;
                }
                return null;
            }
        }).filter(spell => spell !== null); // Remove any null entries
        
        console.log('Returning unique spell hand:', uniqueSpellHand);
        return uniqueSpellHand;
    }
    
    // Check if a spell is in the player's hand
    isSpellInHand(spellId) {
        console.log(`Checking if spell ${spellId} is in player's hand`);
        
        if (!this.playerSpellHand) {
            console.log('playerSpellHand is not initialized');
            return false;
        }
        
        console.log(`Current player hand:`, this.playerSpellHand);
        
        // If playerSpellHand contains spell objects
        if (this.playerSpellHand.length > 0 && typeof this.playerSpellHand[0] === 'object') {
            const result = this.playerSpellHand.some(spell => spell.id === spellId);
            console.log(`Checking against spell objects. Result: ${result}`);
            return result;
        }
        
        // If playerSpellHand contains spell IDs
        const result = this.playerSpellHand.includes(spellId);
        console.log(`Checking against spell IDs. Result: ${result}`);
        return result;
    }

    setPlayerSpellHand(spells) {
        console.log('Setting player spell hand with selected spells:', spells);
        
        // Reset the current spell hand
        this.playerSpellHand = [];
        
        // Add the selected spells to the hand
        spells.forEach(spell => {
            // Handle both spell objects and spell IDs
            if (typeof spell === 'string') {
                const spellObj = this.getSpellById(spell);
                if (spellObj) {
                    console.log(`Adding spell to hand: ${spellObj.name}`);
                    this.playerSpellHand.push(spellObj);
                } else {
                    console.error(`Failed to find spell with ID: ${spell}`);
                }
            } else if (typeof spell === 'object' && spell !== null) {
                console.log(`Adding spell object to hand: ${spell.name}`);
                this.playerSpellHand.push(spell);
            } else {
                console.error(`Invalid spell format:`, spell);
            }
        });
        
        // Reset spell usage tracking
        this.resetSpellTracking();
        
        console.log('Player spell hand set with', this.playerSpellHand.length, 'spells');
        return this.playerSpellHand;
    }

    resetSpellHand() {
        console.log('Resetting player spell hand');
        this.playerSpellHand = [];
        return true;
    }
    
    // Reset available spells for battle to use only the 3 selected spells
    resetAvailableSpells() {
        console.log('Resetting available spells for battle');
        
        // Use the player's spell hand (which contains the selected spells) rather than
        // trying to get them from DOM elements which won't be available during battle
        if (this.playerSpellHand && this.playerSpellHand.length > 0) {
            // If we already have spells in the player's hand, use those
            const spellIds = this.playerSpellHand.map(spell => 
                typeof spell === 'object' ? spell.id : spell
            );
            
            // Ensure we don't have duplicate spell IDs
            const uniqueSpellIds = [...new Set(spellIds)];
            
            console.log('Using spells from playerSpellHand:', uniqueSpellIds);
            this.availableSpellsForBattle = [...uniqueSpellIds];
        } else {
            // If no selected spells in hand, use the first 3 unlocked spells
            console.log('No spells in playerSpellHand, using first 3 unlocked spells');
            const unlockedSpells = this.getPlayerUnlockedSpells().slice(0, 3);
            
            // Ensure we don't have duplicate spell IDs
            const uniqueSpellIds = [...new Set(unlockedSpells)];
            
            this.availableSpellsForBattle = uniqueSpellIds;
        }
        
        console.log('Available spells for battle set to:', this.availableSpellsForBattle);
        
        // Shuffle the available spells
        this.shuffleSpellDeck();
        
        return this.availableSpellsForBattle;
    }
}

export default EnhancedSpellSystem;
