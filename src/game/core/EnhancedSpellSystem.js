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

    getSpellById(id) {
        return this.spells[id];
    }

    getPlayerUnlockedSpells() {
        return this.playerUnlockedSpells;
    }

    unlockSpell(spellId) {
        if (!this.playerUnlockedSpells.includes(spellId)) {
            this.playerUnlockedSpells.push(spellId);
            console.log(`Unlocked new spell: ${this.getSpellById(spellId).name}`);
            return this.getSpellById(spellId);
        }
        return null;
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

    addExperience(amount) {
        this.playerProgress.experience += amount;
        
        // Check for level up
        const nextLevelThreshold = this.playerProgress.level * 100;
        
        if (this.playerProgress.experience >= nextLevelThreshold) {
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
}

export default EnhancedSpellSystem;
