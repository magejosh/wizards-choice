// Enhanced Spell System Module
// Handles spell creation, selection, progression, and unlocking

export class EnhancedSpellSystem {
    constructor() {
        this.spells = {};
        this.playerUnlockedSpells = [];
        this.spellTrees = {};
        this.playerProgress = {
            wins: 0,
            losses: 0,
            spellsUnlocked: 0,
            highestTier: 1
        };
        this.unlockProbabilities = {
            easy: 0.5,    // 50% chance to unlock after winning on easy
            normal: 0.75, // 75% chance to unlock after winning on normal
            hard: 1.0     // 100% chance to unlock after winning on hard
        };
    }
    
    async init() {
        console.log('Initializing Enhanced Spell System...');
        
        // Define base spell types
        this.initializeSpellTypes();
        
        // Define spell trees for progression
        this.initializeSpellTrees();
        
        // Set initial unlocked spells for player
        this.playerUnlockedSpells = [
            'fireball',
            'waterBlast',
            'stoneSkin',
            'windGust',
            'arcaneMissile'
        ];
        
        // Load player progress from local storage if available
        this.loadProgress();
        
        console.log('Enhanced Spell System initialized');
        return Promise.resolve();
    }
    
    initializeSpellTypes() {
        // Fire spells
        this.spells = {
            // Fire spells
            fireball: {
                id: 'fireball',
                name: 'Fireball',
                type: 'Fire',
                manaCost: 20,
                damage: 25,
                healing: 0,
                manaRestore: 0,
                description: 'Launches a ball of fire that deals moderate damage.',
                tier: 1,
                element: 'fire',
                castTime: 1.0,
                cooldown: 0,
                unlockRequirement: null
            },
            inferno: {
                id: 'inferno',
                name: 'Inferno',
                type: 'Fire',
                manaCost: 40,
                damage: 45,
                healing: 0,
                manaRestore: 0,
                description: 'Creates a raging inferno that deals high damage.',
                tier: 2,
                element: 'fire',
                castTime: 1.5,
                cooldown: 1,
                unlockRequirement: 'fireball'
            },
            phoenixFlame: {
                id: 'phoenixFlame',
                name: 'Phoenix Flame',
                type: 'Fire',
                manaCost: 60,
                damage: 50,
                healing: 15,
                manaRestore: 0,
                description: 'Summons the essence of a phoenix, dealing damage and providing healing.',
                tier: 3,
                element: 'fire',
                castTime: 2.0,
                cooldown: 2,
                unlockRequirement: 'inferno'
            },
            
            // Water spells
            waterBlast: {
                id: 'waterBlast',
                name: 'Water Blast',
                type: 'Water',
                manaCost: 15,
                damage: 15,
                healing: 5,
                manaRestore: 0,
                description: 'Blasts the opponent with water, dealing light damage and providing minor healing.',
                tier: 1,
                element: 'water',
                castTime: 0.8,
                cooldown: 0,
                unlockRequirement: null
            },
            iceSpike: {
                id: 'iceSpike',
                name: 'Ice Spike',
                type: 'Water',
                manaCost: 30,
                damage: 35,
                healing: 0,
                manaRestore: 0,
                description: 'Launches a spike of ice that deals moderate damage.',
                tier: 2,
                element: 'water',
                castTime: 1.2,
                cooldown: 1,
                unlockRequirement: 'waterBlast'
            },
            tidalWave: {
                id: 'tidalWave',
                name: 'Tidal Wave',
                type: 'Water',
                manaCost: 50,
                damage: 40,
                healing: 20,
                manaRestore: 0,
                description: 'Summons a powerful wave that deals damage and provides healing.',
                tier: 3,
                element: 'water',
                castTime: 1.8,
                cooldown: 2,
                unlockRequirement: 'iceSpike'
            },
            
            // Earth spells
            stoneSkin: {
                id: 'stoneSkin',
                name: 'Stone Skin',
                type: 'Earth',
                manaCost: 15,
                damage: 0,
                healing: 20,
                manaRestore: 0,
                description: 'Hardens your skin, providing moderate healing.',
                tier: 1,
                element: 'earth',
                castTime: 0.7,
                cooldown: 0,
                unlockRequirement: null
            },
            boulderThrow: {
                id: 'boulderThrow',
                name: 'Boulder Throw',
                type: 'Earth',
                manaCost: 25,
                damage: 30,
                healing: 0,
                manaRestore: 0,
                description: 'Hurls a massive boulder at your opponent, dealing moderate damage.',
                tier: 2,
                element: 'earth',
                castTime: 1.3,
                cooldown: 1,
                unlockRequirement: 'stoneSkin'
            },
            earthquake: {
                id: 'earthquake',
                name: 'Earthquake',
                type: 'Earth',
                manaCost: 45,
                damage: 35,
                healing: 15,
                manaRestore: 0,
                description: 'Shakes the ground, dealing damage and providing some healing from absorbed earth energy.',
                tier: 3,
                element: 'earth',
                castTime: 1.7,
                cooldown: 2,
                unlockRequirement: 'boulderThrow'
            },
            
            // Air spells
            windGust: {
                id: 'windGust',
                name: 'Wind Gust',
                type: 'Air',
                manaCost: 10,
                damage: 10,
                healing: 0,
                manaRestore: 10,
                description: 'Summons a gust of wind that deals light damage and restores some mana.',
                tier: 1,
                element: 'air',
                castTime: 0.5,
                cooldown: 0,
                unlockRequirement: null
            },
            lightningBolt: {
                id: 'lightningBolt',
                name: 'Lightning Bolt',
                type: 'Air',
                manaCost: 35,
                damage: 40,
                healing: 0,
                manaRestore: 0,
                description: 'Calls down a bolt of lightning that deals high damage.',
                tier: 2,
                element: 'air',
                castTime: 1.0,
                cooldown: 1,
                unlockRequirement: 'windGust'
            },
            tornado: {
                id: 'tornado',
                name: 'Tornado',
                type: 'Air',
                manaCost: 55,
                damage: 45,
                healing: 0,
                manaRestore: 15,
                description: 'Creates a swirling tornado that deals high damage and restores some mana.',
                tier: 3,
                element: 'air',
                castTime: 1.6,
                cooldown: 2,
                unlockRequirement: 'lightningBolt'
            },
            
            // Arcane spells
            arcaneMissile: {
                id: 'arcaneMissile',
                name: 'Arcane Missile',
                type: 'Arcane',
                manaCost: 15,
                damage: 20,
                healing: 0,
                manaRestore: 5,
                description: 'Fires a missile of pure arcane energy that deals moderate damage and restores some mana.',
                tier: 1,
                element: 'arcane',
                castTime: 0.6,
                cooldown: 0,
                unlockRequirement: null
            },
            manaDrain: {
                id: 'manaDrain',
                name: 'Mana Drain',
                type: 'Arcane',
                manaCost: 25,
                damage: 15,
                healing: 0,
                manaRestore: 25,
                description: 'Drains mana from your opponent, dealing light damage and restoring significant mana.',
                tier: 2,
                element: 'arcane',
                castTime: 1.1,
                cooldown: 1,
                unlockRequirement: 'arcaneMissile'
            },
            arcaneNova: {
                id: 'arcaneNova',
                name: 'Arcane Nova',
                type: 'Arcane',
                manaCost: 60,
                damage: 55,
                healing: 0,
                manaRestore: 10,
                description: 'Releases a nova of arcane energy that deals massive damage and restores some mana.',
                tier: 3,
                element: 'arcane',
                castTime: 1.9,
                cooldown: 2,
                unlockRequirement: 'manaDrain'
            }
        };
    }
    
    initializeSpellTrees() {
        // Define progression paths for spells
        this.spellTrees = {
            fire: {
                tier1: 'fireball',
                tier2: 'inferno',
                tier3: 'phoenixFlame'
            },
            water: {
                tier1: 'waterBlast',
                tier2: 'iceSpike',
                tier3: 'tidalWave'
            },
            earth: {
                tier1: 'stoneSkin',
                tier2: 'boulderThrow',
                tier3: 'earthquake'
            },
            air: {
                tier1: 'windGust',
                tier2: 'lightningBolt',
                tier3: 'tornado'
            },
            arcane: {
                tier1: 'arcaneMissile',
                tier2: 'manaDrain',
                tier3: 'arcaneNova'
            }
        };
    }
    
    getInitialPlayerSpells() {
        // Return the player's currently unlocked spells
        return this.playerUnlockedSpells.map(spellId => this.spells[spellId]);
    }
    
    getInitialOpponentSpells(difficulty) {
        // For MVP, opponent gets a selection of spells based on difficulty
        let opponentSpells = [];
        
        switch(difficulty) {
            case 'easy':
                // Only tier 1 spells
                opponentSpells = [
                    this.spells.fireball,
                    this.spells.waterBlast,
                    this.spells.stoneSkin,
                    this.spells.windGust
                ];
                break;
                
            case 'normal':
                // Mix of tier 1 and 2 spells
                opponentSpells = [
                    this.spells.fireball,
                    this.spells.iceSpike,
                    this.spells.stoneSkin,
                    this.spells.lightningBolt,
                    this.spells.arcaneMissile
                ];
                break;
                
            case 'hard':
                // Mix of tier 1, 2, and 3 spells
                opponentSpells = [
                    this.spells.inferno,
                    this.spells.tidalWave,
                    this.spells.earthquake,
                    this.spells.tornado,
                    this.spells.arcaneNova
                ];
                break;
                
            default:
                // Default to normal
                opponentSpells = [
                    this.spells.fireball,
                    this.spells.iceSpike,
                    this.spells.stoneSkin,
                    this.spells.lightningBolt,
                    this.spells.arcaneMissile
                ];
        }
        
        return opponentSpells;
    }
    
    unlockNewSpell(difficulty = 'normal') {
        // Check if we should unlock a spell based on difficulty
        const unlockChance = Math.random();
        if (unlockChance > this.unlockProbabilities[difficulty]) {
            console.log('No spell unlocked this time');
            return null;
        }
        
        // Find spells that are not yet unlocked
        const unlockedSpellIds = new Set(this.playerUnlockedSpells);
        const allSpellIds = Object.keys(this.spells);
        const lockedSpellIds = allSpellIds.filter(id => !unlockedSpellIds.has(id));
        
        if (lockedSpellIds.length === 0) {
            console.log('All spells already unlocked');
            return null;
        }
        
        // Find eligible next tier spells
        const eligibleSpells = [];
        
        // Check each spell tree
        for (const [element, tree] of Object.entries(this.spellTrees)) {
            // If tier 1 is unlocked but tier 2 is not, add tier 2 to eligible
            if (unlockedSpellIds.has(tree.tier1) && !unlockedSpellIds.has(tree.tier2)) {
                eligibleSpells.push(tree.tier2);
            }
            // If tier 2 is unlocked but tier 3 is not, add tier 3 to eligible
            else if (unlockedSpellIds.has(tree.tier2) && !unlockedSpellIds.has(tree.tier3)) {
                eligibleSpells.push(tree.tier3);
            }
        }
        
        // If no eligible spells in progression, choose a random locked spell
        if (eligibleSpells.length === 0 && lockedSpellIds.length > 0) {
            const randomIndex = Math.floor(Math.random() * lockedSpellIds.length);
            const newSpellId = lockedSpellIds[randomIndex];
            this.playerUnlockedSpells.push(newSpellId);
            
            // Update player progress
            this.playerProgress.spellsUnlocked++;
            this.updateHighestTier();
            this.saveProgress();
            
            return this.spells[newSpellId];
        }
        
        // Choose a random eligible spell
        if (eligibleSpells.length > 0) {
            const randomIndex = Math.floor(Math.random() * eligibleSpells.length);
            const newSpellId = eligibleSpells[randomIndex];
            this.playerUnlockedSpells.push(newSpellId);
            
            // Update player progress
            this.playerProgress.spellsUnlocked++;
            this.updateHighestTier();
            this.saveProgress();
            
            return this.spells[newSpellId];
        }
        
        return null;
    }
    
    updateHighestTier() {
        // Update the highest tier the player has unlocked
        let highestTier = 1;
        
        this.playerUnlockedSpells.forEach(spellId => {
            const spell = this.spells[spellId];
            if (spell && spell.tier > highestTier) {
                highestTier = spell.tier;
            }
        });
        
        this.playerProgress.highestTier = highestTier;
    }
    
    recordBattleResult(won, difficulty) {
        // Update win/loss record
        if (won) {
            this.playerProgress.wins++;
        } else {
            this.playerProgress.losses++;
        }
        
        // Save progress
        this.saveProgress();
    }
    
    getSpellById(spellId) {
        return this.spells[spellId];
    }
    
    getSpellsByElement(element) {
        return Object.values(this.spells).filter(spell => spell.element === element);
    }
    
    getSpellsByTier(tier) {
        return Object.values(this.spells).filter(spell => spell.tier === tier);
    }
    
    getUnlockedSpells() {
        return this.playerUnlockedSpells.map(spellId => this.spells[spellId]);
    }
    
    getLockedSpells() {
        const unlockedSpellIds = new Set(this.playerUnlockedSpells);
        return Object.values(this.spells).filter(spell => !unlockedSpellIds.has(spell.id));
    }
    
    getNextUnlockableSpells() {
        const unlockedSpellIds = new Set(this.playerUnlockedSpells);
        const unlockableSpells = [];
        
        // Check each spell to see if its requirement is met
        Object.values(this.spells).forEach(spell => {
            if (!unlockedSpellIds.has(spell.id) && 
                (spell.unlockRequirement === null || unlockedSpellIds.has(spell.unlockRequirement))) {
                unlockableSpells.push(spell);
            }
        });
        
        return unlockableSpells;
    }
    
    getSpellTree(element) {
        const tree = this.spellTrees[element];
        if (!tree) return null;
        
        return {
            tier1: this.spells[tree.tier1],
            tier2: this.spells[tree.tier2],
            tier3: this.spells[tree.tier3]
        };
    }
    
    getAllSpellTrees() {
        const trees = {};
        
        for (const [element, tree] of Object.entries(this.spellTrees)) {
            trees[element] = {
                tier1: this.spells[tree.tier1],
                tier2: this.spells[tree.tier2],
                tier3: this.spells[tree.tier3]
            };
        }
        
        return trees;
    }
    
    getPlayerProgress() {
        return { ...this.playerProgress };
    }
    
    saveProgress() {
        // Save progress to local storage
        try {
            const progressData = {
                unlockedSpells: this.playerUnlockedSpells,
                progress: this.playerProgress
            };
            
            localStorage.setItem('wizardsChoice_progress', JSON.stringify(progressData));
            console.log('Progress saved');
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }
    
    loadProgress() {
        // Load progress from local storage
        try {
            const savedData = localStorage.getItem('wizardsChoice_progress');
            if (savedData) {
                const progressData = JSON.parse(savedData);
                
                if (progressData.unlockedSpells) {
                    this.playerUnlockedSpells = progressData.unlockedSpells;
                }
                
                if (progressData.progress) {
                    this.playerProgress = progressData.progress;
                }
                
                console.log('Progress loaded');
            }
        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }
    
    resetProgress() {
        // Reset player progress
        this.playerUnlockedSpells = [
            'fireball',
            'waterBlast',
            'stoneSkin',
            'windGust',
            'arcaneMissile'
        ];
        
        this.playerProgress = {
            wins: 0,
            losses: 0,
            spellsUnlocked: 0,
            highestTier: 1
        };
        
        // Save reset progress
        this.saveProgress();
    }
}
