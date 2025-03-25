// SpellDefinitions.js - Contains spell catalog and attributes

/**
 * Defines and stores all spell data used in the game
 */
class SpellDefinitions {
    /**
     * Initialize spell definitions container
     */
    constructor() {
        this.spells = {};
    }

    /**
     * Initialize spell definitions
     * @returns {Object} The spells catalog
     */
    init() {
        console.log('Initializing Spell Definitions...');
        
        // Define base spell types
        this.defineSpells();
        
        console.log('Spell Definitions initialized with', Object.keys(this.spells).length, 'spells');
        return this.spells;
    }

    /**
     * Define all spells in the game
     */
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

    /**
     * Add a spell to the spell catalog
     * @param {Object} spellData - The spell data to add
     */
    addSpell(spellData) {
        this.spells[spellData.id] = spellData;
    }

    /**
     * Get a spell by its ID
     * @param {string} spellId - The ID of the spell to retrieve
     * @returns {Object|null} The spell data, or null if not found
     */
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

    /**
     * Get all spells of a specific element
     * @param {string} element - The element to filter by
     * @returns {Object[]} An array of spell data
     */
    getSpellsByElement(element) {
        return Object.values(this.spells).filter(spell => spell.element === element);
    }

    /**
     * Get all spells that unlock at a specific level
     * @param {number} level - The level to filter by
     * @returns {Object[]} An array of spell data
     */
    getSpellsByUnlockLevel(level) {
        return Object.values(this.spells).filter(spell => spell.unlockLevel === level);
    }

    /**
     * Get all spells for display, sorted by element and mana cost
     * @param {string[]} unlockedSpells - An array of unlocked spell IDs
     * @returns {Object[]} An array of spell data
     */
    getSpellsForDisplay(unlockedSpells) {
        return unlockedSpells.map(spellId => {
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
}

export default SpellDefinitions;
