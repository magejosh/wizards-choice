// AI Opponent Module
// Handles AI decision-making and difficulty levels for wizard duels

export class AIOpponent {
    constructor(difficulty = 'normal') {
        this.difficulty = difficulty; // 'easy', 'normal', 'hard'
        this.personality = this.generatePersonality();
        this.memory = {
            playerSpellsUsed: {},
            playerHealthHistory: [],
            playerManaHistory: [],
            myHealthHistory: [],
            myManaHistory: [],
            turnCount: 0
        };
        this.strategyWeights = this.getStrategyWeightsByDifficulty();
    }
    
    generatePersonality() {
        // Generate a random personality for the AI
        // This affects decision-making tendencies
        return {
            aggression: Math.random() * 0.5 + (this.difficulty === 'hard' ? 0.5 : 0.3),
            defensiveness: Math.random() * 0.5 + (this.difficulty === 'easy' ? 0.5 : 0.3),
            resourcefulness: Math.random() * 0.5 + (this.difficulty === 'normal' ? 0.5 : 0.3),
            adaptability: Math.random() * 0.3 + (this.difficulty === 'hard' ? 0.7 : 0.4),
            elementPreference: this.getRandomElement()
        };
    }
    
    getRandomElement() {
        const elements = ['fire', 'water', 'earth', 'air', 'arcane'];
        return elements[Math.floor(Math.random() * elements.length)];
    }
    
    getStrategyWeightsByDifficulty() {
        // Define strategy weights based on difficulty
        switch(this.difficulty) {
            case 'easy':
                return {
                    random: 0.5,           // Choose randomly
                    offensive: 0.2,        // Focus on damage
                    defensive: 0.2,        // Focus on healing
                    efficient: 0.05,       // Focus on mana efficiency
                    adaptive: 0.05         // Adapt to player's strategy
                };
            case 'normal':
                return {
                    random: 0.2,
                    offensive: 0.3,
                    defensive: 0.3,
                    efficient: 0.1,
                    adaptive: 0.1
                };
            case 'hard':
                return {
                    random: 0.05,
                    offensive: 0.3,
                    defensive: 0.2,
                    efficient: 0.15,
                    adaptive: 0.3
                };
            default:
                return {
                    random: 0.2,
                    offensive: 0.3,
                    defensive: 0.3,
                    efficient: 0.1,
                    adaptive: 0.1
                };
        }
    }
    
    chooseSpell(availableSpells, gameState) {
        // Update memory with current game state
        this.updateMemory(gameState);
        
        // Filter spells that can be cast with current mana
        const castableSpells = availableSpells.filter(
            spell => spell.manaCost <= gameState.opponent.mana
        );
        
        // If no castable spells, return the cheapest one (even if can't afford it)
        if (castableSpells.length === 0) {
            return this.getCheapestSpell(availableSpells);
        }
        
        // Choose strategy based on difficulty and current game state
        const strategy = this.selectStrategy(gameState);
        
        // Get spell based on selected strategy
        let selectedSpell;
        switch(strategy) {
            case 'random':
                selectedSpell = this.getRandomSpell(castableSpells);
                break;
            case 'offensive':
                selectedSpell = this.getOffensiveSpell(castableSpells);
                break;
            case 'defensive':
                selectedSpell = this.getDefensiveSpell(castableSpells, gameState);
                break;
            case 'efficient':
                selectedSpell = this.getEfficientSpell(castableSpells);
                break;
            case 'adaptive':
                selectedSpell = this.getAdaptiveSpell(castableSpells, gameState);
                break;
            default:
                selectedSpell = this.getRandomSpell(castableSpells);
        }
        
        console.log(`AI (${this.difficulty}) chose ${selectedSpell.name} using ${strategy} strategy`);
        return selectedSpell;
    }
    
    updateMemory(gameState) {
        // Track turn count
        this.memory.turnCount++;
        
        // Track health and mana history
        this.memory.playerHealthHistory.push(gameState.player.health);
        this.memory.playerManaHistory.push(gameState.player.mana);
        this.memory.myHealthHistory.push(gameState.opponent.health);
        this.memory.myManaHistory.push(gameState.opponent.mana);
        
        // Track player's last used spell if available
        if (gameState.lastPlayerSpell) {
            const spellType = gameState.lastPlayerSpell.type.toLowerCase();
            this.memory.playerSpellsUsed[spellType] = (this.memory.playerSpellsUsed[spellType] || 0) + 1;
        }
    }
    
    selectStrategy(gameState) {
        // Calculate health and mana percentages
        const myHealthPercent = gameState.opponent.health / gameState.opponent.maxHealth;
        const playerHealthPercent = gameState.player.health / gameState.player.maxHealth;
        const myManaPercent = gameState.opponent.mana / gameState.opponent.maxMana;
        
        // Adjust strategy weights based on game state
        let adjustedWeights = { ...this.strategyWeights };
        
        // If low health, increase defensive weight
        if (myHealthPercent < 0.3) {
            adjustedWeights.defensive += 0.3;
            adjustedWeights.offensive -= 0.1;
        }
        
        // If player low health, increase offensive weight
        if (playerHealthPercent < 0.3) {
            adjustedWeights.offensive += 0.3;
            adjustedWeights.defensive -= 0.1;
        }
        
        // If low mana, increase efficient weight
        if (myManaPercent < 0.3) {
            adjustedWeights.efficient += 0.2;
        }
        
        // Normalize weights
        const totalWeight = Object.values(adjustedWeights).reduce((sum, weight) => sum + weight, 0);
        Object.keys(adjustedWeights).forEach(key => {
            adjustedWeights[key] /= totalWeight;
        });
        
        // Select strategy using weighted random
        const rand = Math.random();
        let cumulativeWeight = 0;
        
        for (const [strategy, weight] of Object.entries(adjustedWeights)) {
            cumulativeWeight += weight;
            if (rand <= cumulativeWeight) {
                return strategy;
            }
        }
        
        // Fallback to random
        return 'random';
    }
    
    getRandomSpell(spells) {
        const index = Math.floor(Math.random() * spells.length);
        return spells[index];
    }
    
    getOffensiveSpell(spells) {
        // Sort by damage, then by mana cost (lower is better)
        const sortedSpells = [...spells].sort((a, b) => {
            if (b.damage !== a.damage) {
                return b.damage - a.damage;
            }
            return a.manaCost - b.manaCost;
        });
        
        // Add some randomness based on difficulty
        const topCount = this.difficulty === 'easy' ? 
            Math.ceil(sortedSpells.length * 0.7) : 
            (this.difficulty === 'normal' ? 
                Math.ceil(sortedSpells.length * 0.3) : 
                Math.ceil(sortedSpells.length * 0.1));
        
        const topSpells = sortedSpells.slice(0, Math.max(1, topCount));
        return this.getRandomSpell(topSpells);
    }
    
    getDefensiveSpell(spells, gameState) {
        // If health is low, prioritize healing
        const myHealthPercent = gameState.opponent.health / gameState.opponent.maxHealth;
        
        if (myHealthPercent < 0.5) {
            // Sort by healing, then by mana cost (lower is better)
            const healingSpells = spells.filter(spell => spell.healing > 0);
            
            if (healingSpells.length > 0) {
                const sortedHealingSpells = [...healingSpells].sort((a, b) => {
                    if (b.healing !== a.healing) {
                        return b.healing - a.healing;
                    }
                    return a.manaCost - b.manaCost;
                });
                
                // Add some randomness based on difficulty
                const topCount = this.difficulty === 'easy' ? 
                    Math.ceil(sortedHealingSpells.length * 0.7) : 
                    Math.ceil(sortedHealingSpells.length * 0.3);
                
                const topSpells = sortedHealingSpells.slice(0, Math.max(1, topCount));
                return this.getRandomSpell(topSpells);
            }
        }
        
        // If no healing spells or health is not low, choose a balanced spell
        // Sort by combined value (damage + healing), then by mana cost
        const sortedSpells = [...spells].sort((a, b) => {
            const aValue = a.damage + a.healing * 1.5;
            const bValue = b.damage + b.healing * 1.5;
            
            if (bValue !== aValue) {
                return bValue - aValue;
            }
            return a.manaCost - b.manaCost;
        });
        
        // Add some randomness based on difficulty
        const topCount = this.difficulty === 'easy' ? 
            Math.ceil(sortedSpells.length * 0.7) : 
            Math.ceil(sortedSpells.length * 0.3);
        
        const topSpells = sortedSpells.slice(0, Math.max(1, topCount));
        return this.getRandomSpell(topSpells);
    }
    
    getEfficientSpell(spells) {
        // Calculate efficiency as (damage + healing) / manaCost
        const sortedSpells = [...spells].sort((a, b) => {
            const aEfficiency = (a.damage + a.healing + a.manaRestore) / a.manaCost;
            const bEfficiency = (b.damage + b.healing + b.manaRestore) / b.manaCost;
            return bEfficiency - aEfficiency;
        });
        
        // Add some randomness based on difficulty
        const topCount = this.difficulty === 'easy' ? 
            Math.ceil(sortedSpells.length * 0.7) : 
            (this.difficulty === 'normal' ? 
                Math.ceil(sortedSpells.length * 0.3) : 
                Math.ceil(sortedSpells.length * 0.1));
        
        const topSpells = sortedSpells.slice(0, Math.max(1, topCount));
        return this.getRandomSpell(topSpells);
    }
    
    getAdaptiveSpell(spells, gameState) {
        // Analyze player's strategy based on spells used
        const playerStrategy = this.analyzePlayerStrategy();
        
        switch(playerStrategy) {
            case 'offensive':
                // Player is aggressive, focus on healing and counter-attacks
                return this.getDefensiveSpell(spells, gameState);
                
            case 'defensive':
                // Player is defensive, focus on efficient damage
                return this.getOffensiveSpell(spells);
                
            case 'balanced':
            default:
                // Player is balanced or unknown, choose based on game state
                const myHealthPercent = gameState.opponent.health / gameState.opponent.maxHealth;
                const playerHealthPercent = gameState.player.health / gameState.player.maxHealth;
                
                if (myHealthPercent < playerHealthPercent) {
                    // We're losing, focus on healing or high damage
                    return myHealthPercent < 0.3 ? 
                        this.getDefensiveSpell(spells, gameState) : 
                        this.getOffensiveSpell(spells);
                } else {
                    // We're winning, focus on efficient spells
                    return this.getEfficientSpell(spells);
                }
        }
    }
    
    analyzePlayerStrategy() {
        // Count total spells used
        const totalSpells = Object.values(this.memory.playerSpellsUsed)
            .reduce((sum, count) => sum + count, 0);
            
        if (totalSpells < 2) {
            return 'unknown'; // Not enough data
        }
        
        // Calculate damage vs healing focus
        let damageCount = 0;
        let healingCount = 0;
        
        if (this.memory.playerSpellsUsed.fire) {
            damageCount += this.memory.playerSpellsUsed.fire;
        }
        if (this.memory.playerSpellsUsed.air) {
            damageCount += this.memory.playerSpellsUsed.air;
        }
        if (this.memory.playerSpellsUsed.arcane) {
            damageCount += this.memory.playerSpellsUsed.arcane;
        }
        if (this.memory.playerSpellsUsed.water) {
            healingCount += this.memory.playerSpellsUsed.water;
        }
        if (this.memory.playerSpellsUsed.earth) {
            healingCount += this.memory.playerSpellsUsed.earth;
        }
        
        const damageRatio = damageCount / totalSpells;
        const healingRatio = healingCount / totalSpells;
        
        if (damageRatio > 0.7) {
            return 'offensive';
        } else if (healingRatio > 0.7) {
            return 'defensive';
        } else {
            return 'balanced';
        }
    }
    
    getCheapestSpell(spells) {
        // Sort by mana cost (ascending)
        const sortedSpells = [...spells].sort((a, b) => a.manaCost - b.manaCost);
        return sortedSpells[0];
    }
}

// AI Opponent Factory
export class AIOpponentFactory {
    constructor() {
        this.opponentTemplates = {
            easy: [
                { name: 'Novice Pyromancer', elementFocus: 'fire', personality: { aggression: 0.7, defensiveness: 0.3 } },
                { name: 'Apprentice Hydromancer', elementFocus: 'water', personality: { aggression: 0.3, defensiveness: 0.7 } },
                { name: 'Beginner Geomancer', elementFocus: 'earth', personality: { aggression: 0.4, defensiveness: 0.6 } },
                { name: 'Fledgling Aeromancer', elementFocus: 'air', personality: { aggression: 0.6, defensiveness: 0.4 } },
                { name: 'Initiate Arcanist', elementFocus: 'arcane', personality: { aggression: 0.5, defensiveness: 0.5 } }
            ],
            normal: [
                { name: 'Adept Pyromancer', elementFocus: 'fire', personality: { aggression: 0.8, defensiveness: 0.4 } },
                { name: 'Skilled Hydromancer', elementFocus: 'water', personality: { aggression: 0.4, defensiveness: 0.8 } },
                { name: 'Practiced Geomancer', elementFocus: 'earth', personality: { aggression: 0.5, defensiveness: 0.7 } },
                { name: 'Experienced Aeromancer', elementFocus: 'air', personality: { aggression: 0.7, defensiveness: 0.5 } },
                { name: 'Proficient Arcanist', elementFocus: 'arcane', personality: { aggression: 0.6, defensiveness: 0.6 } }
            ],
            hard: [
                { name: 'Master Pyromancer', elementFocus: 'fire', personality: { aggression: 0.9, defensiveness: 0.5 } },
                { name: 'Expert Hydromancer', elementFocus: 'water', personality: { aggression: 0.5, defensiveness: 0.9 } },
                { name: 'Veteran Geomancer', elementFocus: 'earth', personality: { aggression: 0.6, defensiveness: 0.8 } },
                { name: 'Elite Aeromancer', elementFocus: 'air', personality: { aggression: 0.8, defensiveness: 0.6 } },
                { name: 'Archmage Arcanist', elementFocus: 'arcane', personality: { aggression: 0.7, defensiveness: 0.7 } }
            ]
        };
    }
    
    createOpponent(difficulty = 'normal', spellSystem) {
        // Create base AI opponent
        const opponent = new AIOpponent(difficulty);
        
        // Get random template for this difficulty
        const templates = this.opponentTemplates[difficulty];
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        // Apply template
        opponent.name = template.name;
        opponent.elementFocus = template.elementFocus;
        
        // Merge personality traits
        opponent.personality = {
            ...opponent.personality,
            ...template.personality,
            elementPreference: template.elementFocus
        };
        
        // Select spells based on difficulty and element focus
        opponent.spells = this.selectSpellsForOpponent(opponent, spellSystem);
        
        return opponent;
    }
    
    selectSpellsForOpponent(opponent, spellSystem) {
        // Get all spells
        const allSpells = spellSystem.spells;
        
        // Filter spells based on difficulty tier access
        let availableSpells = [];
        switch(opponent.difficulty) {
            case 'easy':
                // Only tier 1 spells
                availableSpells = Object.values(allSpells).filter(spell => spell.tier === 1);
                break;
            case 'normal':
                // Tier 1 and 2 spells
                availableSpells = Object.values(allSpells).filter(spell => spell.tier <= 2);
                break;
            case 'hard':
                // All tiers, but focus on tier 2 and 3
                availableSpells = Object.values(allSpells);
                break;
        }
        
        // Prioritize spells of the opponent's element focus
        const focusedSpells = availableSpells.filter(
            spell => spell.element === opponent.elementFocus
        );
        
        // Select spells for the opponent
        const selectedSpells = [];
        
        // Always include at least 2 spells from the focused element if available
        while (focusedSpells.length > 0 && selectedSpells.length < 2) {
            const randomIndex = Math.floor(Math.random() * focusedSpells.length);
            selectedSpells.push(focusedSpells.splice(randomIndex, 1)[0]);
        }
        
        // Fill remaining slots with random spells
        const remainingSpells = availableSpells.filter(
            spell => !selectedSpells.includes(spell)
        );
        
        while (remainingSpells.length > 0 && selectedSpells.length < 5) {
            const randomIndex = Math.floor(Math.random() * remainingSpells.length);
            selectedSpells.push(remainingSpells.splice(randomIndex, 1)[0]);
        }
        
        return selectedSpells;
    }
}
