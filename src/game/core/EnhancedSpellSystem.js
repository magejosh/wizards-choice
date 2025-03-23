// Enhanced Spell System - Manages spells, their effects, and player progression
import SpellDefinitions from './SpellDefinitions';
import SpellHandManager from './SpellHandManager';
import SpellProgressionTracker from './SpellProgressionTracker';

class EnhancedSpellSystem {
    constructor() {
        // Initialize sub-components
        this.spellDefinitions = new SpellDefinitions();
        this.progressionTracker = null;
        this.handManager = null;
        
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
        
        // Initialize spell definitions
        this.spellDefinitions.init();
        
        // Initialize progression tracker with spell definitions
        this.progressionTracker = new SpellProgressionTracker(this.spellDefinitions);
        this.progressionTracker.init();
        
        // Initialize hand manager with spell definitions
        this.handManager = new SpellHandManager(this.spellDefinitions);
        
        // Load player progress
        this.loadProgress();
        
        console.log('Enhanced Spell System initialized');
        return true;
    }

    getSpellById(spellId) {
        return this.spellDefinitions.getSpellById(spellId);
    }

    getSpellsByUnlockLevel(level) {
        return this.progressionTracker.getSpellsByUnlockLevel(level);
    }

    getAvailableSpellsForUnlock(playerLevel) {
        return this.progressionTracker.getAvailableSpellsForUnlock(playerLevel);
    }

    getPlayerUnlockedSpells() {
        return this.progressionTracker.getPlayerUnlockedSpells();
    }

    getUnlockedSpells() {
        return this.progressionTracker.getUnlockedSpells();
    }

    unlockSpell(spellId) {
        return this.progressionTracker.unlockSpell(spellId);
    }

    improveSpell(spellId) {
        return this.progressionTracker.improveSpell(spellId);
    }

    getSpellsByElement(element) {
        return this.spellDefinitions.getSpellsByElement(element);
    }

    addExperience(amount) {
        return this.progressionTracker.addExperience(amount);
    }

    initPlayerProgress() {
        return this.progressionTracker.initPlayerProgress();
    }

    resetPlayerProgress() {
        return this.progressionTracker.resetPlayerProgress();
    }

    loadProgress() {
        return this.progressionTracker.loadProgress();
    }

    saveProgress() {
        return this.progressionTracker.saveProgress();
    }

    getPlayerProgress() {
        return this.progressionTracker.getPlayerProgress();
    }

    getSpellOptionsForLevelUp(defeatedEnemySpells) {
        return this.progressionTracker.getSpellOptionsForLevelUp(defeatedEnemySpells);
    }

    unlockNewSpell(difficulty) {
        return this.progressionTracker.unlockNewSpell(difficulty);
    }

    recordBattleResult(won, difficulty) {
        return this.progressionTracker.recordBattleResult(won, difficulty);
    }

    getSpellsForDisplay() {
        return this.spellDefinitions.getSpellsForDisplay(this.progressionTracker.getPlayerUnlockedSpells());
    }

    initializeSpellHand() {
        return this.handManager.initializeSpellHand(this.progressionTracker.getPlayerUnlockedSpells());
    }

    refillSpellHand() {
        return this.handManager.refillSpellHand();
    }

    removeSpellFromHand(spellId) {
        return this.handManager.removeSpellFromHand(spellId);
    }

    getPlayerSpellHand() {
        return this.handManager.getPlayerSpellHand();
    }

    isSpellInHand(spellId) {
        return this.handManager.isSpellInHand(spellId);
    }

    setPlayerSpellHand(spells) {
        return this.handManager.setPlayerSpellHand(spells);
    }

    resetSpellHand() {
        return this.handManager.resetSpellHand();
    }

    resetAvailableSpells() {
        return this.handManager.resetAvailableSpells(this.progressionTracker.getPlayerUnlockedSpells());
    }

    trackSpellUsage(spellId) {
        return this.handManager.trackSpellUsage(spellId);
    }

    resetSpellTracking() {
        return this.handManager.resetSpellTracking();
    }

    getUsedSpells() {
        return this.handManager.getUsedSpells();
    }
}

export default EnhancedSpellSystem;
