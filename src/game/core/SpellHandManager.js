// SpellHandManager.js - Manages the player's spell hand during battles

class SpellHandManager {
    constructor(spellDefinitions) {
        this.spellDefinitions = spellDefinitions;
        this.playerSpellHand = [];
        this.availableSpellsForBattle = [];
        this.maxHandSize = 3;
        this.usedSpellsTracking = [];
    }

    // Initialize the player's spell hand for battle
    initializeSpellHand(unlockedSpells) {
        console.log('Initializing player spell hand for battle');
        
        // Reset spell hand
        this.playerSpellHand = [];
        
        // Set max hand size
        this.maxHandSize = 3;
        
        // Reset available spells for battle (deck of unlocked spells)
        this.availableSpellsForBattle = [...unlockedSpells];
        
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
            return null;
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
        const drawnSpell = this.spellDefinitions.getSpellById(drawnSpellId);
        
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
    reshuffleDiscardPile(unlockedSpells) {
        console.log('Reshuffling discard pile into deck');
        
        // Get IDs of spells currently in hand 
        const spellsInHandIds = this.playerSpellHand.map(spell => 
            typeof spell === 'object' ? spell.id : spell
        );
        
        // Reshuffle all spells not currently in hand back into the deck
        this.availableSpellsForBattle = unlockedSpells.filter(spellId => 
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
                const spellObj = this.spellDefinitions.getSpellById(spell);
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
                const spellObj = this.spellDefinitions.getSpellById(spell);
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
    resetAvailableSpells(unlockedSpells) {
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
            const firstThreeSpells = unlockedSpells.slice(0, 3);
            
            // Ensure we don't have duplicate spell IDs
            const uniqueSpellIds = [...new Set(firstThreeSpells)];
            
            this.availableSpellsForBattle = uniqueSpellIds;
        }
        
        console.log('Available spells for battle set to:', this.availableSpellsForBattle);
        
        // Shuffle the available spells
        this.shuffleSpellDeck();
        
        return this.availableSpellsForBattle;
    }

    // Track spell usage during a battle
    trackSpellUsage(spellId) {
        try {
            const spell = this.spellDefinitions.getSpellById(spellId);
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

    getUsedSpells() {
        try {
            return Array.isArray(this.usedSpellsTracking) ? this.usedSpellsTracking : [];
        } catch (error) {
            console.error('Error in getUsedSpells:', error);
            return [];
        }
    }
}

export default SpellHandManager;
