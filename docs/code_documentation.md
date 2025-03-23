# Wizard's Choice - Code Documentation

## Overview

This document provides comprehensive documentation for the Wizard's Choice game codebase. The game is a tactical choice-based strategy game where players engage in wizard duels by strategically selecting spells.

## Project Structure

```
wizards-choice/
├── src/
│   ├── game/
│   │   ├── core/          # Core game systems (spell, progression)
│   │   ├── managers/      # Game managers (game, scene, UI, audio)
│   │   ├── ui/            # UI-related components
│   │   └── main.js        # Main entry point for the game
│   ├── css/               # CSS files for styling
│   ├── js/
│   │   └── main.js        # Redirection to game/main.js for HTML compatibility
│   ├── assets/            # Game assets (images, sounds)
│   ├── styles/            # Additional CSS styles
│   ├── index.html         # Main HTML file
│   └── debug.html         # Debug version with additional tools
├── docs/                   # Documentation
└── package.json            # Project configuration
```

> Note: The `src/js/core` and `src/js/ui` directories have been refactored to use the files in `src/game/core` and `src/game/ui` respectively, with redirection files in place to maintain compatibility.

## Core Modules

### GameState.js

The `GameState` class manages the overall state of the game, handling transitions between different game screens and maintaining the current state.

**Key Methods:**
- `init()`: Initializes the game state
- `changeState(newState)`: Transitions to a new game state
- `getCurrentState()`: Returns the current game state

### DuelSystem.js

The `DuelSystem` class handles the turn-based wizard duels, including spell casting, battle flow, and outcome determination.

**Key Methods:**
- `startDuel(player, opponent)`: Initializes a new duel
- `castSpell(spell, caster, battleState)`: Processes spell casting and effects
- `endTurn()`: Handles end of turn logic
- `checkBattleEnd()`: Determines if the battle has ended

### ChoiceSystem.js

The `ChoiceSystem` class manages player decision-making, including spell selection and post-battle options.

**Key Methods:**
- `presentChoices(choices)`: Displays choices to the player
- `processChoice(choice)`: Handles the player's selected choice
- `generateSpellChoices()`: Creates spell selection options

### GameLoop.js

The `GameLoop` class ties all systems together and provides the foundation for the game's interactive experience.

**Key Methods:**
- `start()`: Begins the game loop
- `update()`: Updates game state each frame
- `pause()`: Pauses the game loop
- `resume()`: Resumes the game loop

## Spell System

### EnhancedSpellSystem.js

The `EnhancedSpellSystem` class handles spell creation, selection, progression, unlocking, and card drawing mechanics.

**Key Methods:**
- `init()`: Initializes the spell system
- `defineSpells()`: Defines all available spells
- `getSpellById(spellId)`: Retrieves a spell by its ID
- `unlockSpell(spellId)`: Unlocks a new spell or improves an existing one
- `improveSpell(spellId)`: Improves an existing spell by reducing mana cost or increasing effects
- `saveProgress()`: Saves player progress to local storage
- `initializeSpellHand()`: Sets up the initial spell hand for battle
- `refillSpellHand()`: Draws cards to fill the player's hand to maximum size
- `drawSpellFromDeck()`: Draws a random spell from the deck
- `removeSpellFromHand(spellId)`: Removes a spell from hand after casting
- `isSpellInHand(spellId)`: Checks if a spell is in the player's hand
- `getSpellOptionsForLevelUp(defeatedEnemySpells)`: Gets spell options for level-up (1 from defeated enemy, 2 random)

### ProgressionSystem.js

The `ProgressionSystem` class manages player progression, spell unlocking, and difficulty scaling.

**Key Methods:**
- `init(spellSystem)`: Initializes the progression system
- `getCurrentTier()`: Gets the player's current progression tier
- `processBattleResult(won, difficulty, usedSpells)`: Processes battle outcomes and awards experience based on difficulty
- `startNewDuel()`: Resets tracking for a new duel
- `checkAchievements(won)`: Checks for unlocked achievements
- `unlockAchievement(achievementId)`: Unlocks a specific achievement
- `getProgressSummary()`: Returns a summary of player progress
- `getPlayerProgress()`: Gets the player's current progress data

## Managers

### GameManager.js

The `GameManager` class controls game state, battle flow, turn processing, and spell selection.

**Key Methods:**
- `init()`: Initializes the game manager with all dependencies
- `startBattle()`: Starts a new battle
- `showSpellSelectionScreen()`: Shows the spell selection screen before battle
- `startBattleWithSelectedSpells()`: Starts battle with player's selected spells
- `playerCastSpell(spellId)`: Handles player casting a spell
- `processTurnEnd()`: Processes end of turn, including drawing new cards
- `endBattle(playerWon)`: Handles battle end, rewards, and experience gain
- `showLevelUpSpellSelection()`: Shows the level-up spell selection screen with options
- `saveGameState()`: Saves the current game state to local storage
- `updateBattleUI()`: Updates battle UI elements and renders the player's spell hand during battle

### SceneManager.js

The `SceneManager` class handles 3D scene rendering using ThreeJS.

**Key Methods:**
- `init()`: Initializes the scene manager
- `setupBattleScene(player, opponent)`: Sets up the 3D battle scene
- `playSpellAnimation(caster, spellType)`: Plays a spell casting animation
- `createImpactEffect(target, effect)`: Creates a spell impact effect
- `dispose()`: Cleans up resources when scene is no longer needed

### UIManager.js

The `UIManager` class manages UI screens, elements, and interactions.

**Key Methods:**
- `init()`: Initializes the UI manager
- `showScreen(screenId)`: Shows a specific screen
- `hideScreen(screenId)`: Hides a specific screen
- `updateHealthBars(playerHealth, opponentHealth)`: Updates health bar displays
- `showNotification(message, type)`: Displays a notification to the player

### AudioManager.js

The `AudioManager` class controls game audio and sound effects.

**Key Methods:**
- `init()`: Initializes the audio manager
- `playSound(soundId)`: Plays a sound effect
- `stopSound(soundId)`: Stops a sound effect
- `updateVolume(volume)`: Updates the audio volume

### SpellManager.js

The `SpellManager` class manages spell data and availability.

**Key Methods:**
- `init()`: Initializes the spell manager
- `getSpellById(spellId)`: Retrieves a spell by its ID
- `unlockNewSpell(difficulty)`: Unlocks a new spell based on difficulty
- `saveProgress()`: Saves player progress to local storage

## AI System

### AIOpponent.js

The `AIOpponent` class handles AI decision-making and difficulty levels for wizard duels.

**Key Methods:**
- `chooseSpell(availableSpells, gameState)`: Selects a spell for the AI to cast
- `updateMemory(gameState)`: Updates the AI's memory of the game state
- `selectStrategy(gameState)`: Chooses a strategy based on the game state
- `analyzePlayerStrategy()`: Analyzes the player's strategy based on past actions

### AIDifficultyManager.js

The `AIDifficultyManager` class handles AI difficulty scaling and opponent selection.

**Key Methods:**
- `init()`: Initializes the difficulty manager
- `updateRecommendedDifficulty()`: Updates the recommended difficulty based on player progression
- `createOpponent()`: Creates an opponent based on current difficulty
- `getDifficultyDescription(difficulty)`: Returns a description of the difficulty level

## UI Components

### EnhancedUIManager.js

The `EnhancedUIManager` class manages the user interface, including screen transitions, animations, and notifications.

**Key Methods:**
- `init()`: Initializes the UI manager
- `showScreen(screenId)`: Shows a specific screen
- `hideScreen(screenId)`: Hides a specific screen
- `updateHealthBars(playerHealth, opponentHealth)`: Updates health bar displays
- `showNotification(message, type)`: Displays a notification to the player

### EnhancedSceneManager.js

The `EnhancedSceneManager` class handles ThreeJS scene and visual effects with improved graphics.

**Key Methods:**
- `init()`: Initializes the scene manager
- `setupBattleScene(player, opponent)`: Sets up the 3D battle scene
- `playSpellAnimation(caster, spellType)`: Plays a spell casting animation
- `createImpactEffect(target, effect)`: Creates a spell impact effect
- `dispose()`: Cleans up resources when scene is no longer needed

### SpellSelectionInterface.js

The `SpellSelectionInterface` class provides an interactive interface for selecting and managing spells.

**Key Methods:**
- `init()`: Initializes the spell selection interface
- `show(callback)`: Shows the interface and sets a callback for when selection is confirmed
- `updateAvailableSpells()`: Updates the list of available spells
- `addSpell(spell)`: Adds a spell to the selected spells
- `updateSpellTreeVisualization()`: Updates the spell tree visualization

## Testing and Debugging

### TestSuite.js

The `TestSuite` class handles automated testing of game components.

**Key Methods:**
- `addTest(name, testFunction)`: Adds a test to the suite
- `runTests()`: Runs all tests in the suite
- `getResults()`: Returns the results of the tests

### BugFixes.js

The `BugFixes` class handles common issues and fixes.

**Key Methods:**
- `applyAllFixes()`: Applies all bug fixes
- `fixSpellCastingIssues()`: Fixes issues with spell casting
- `fixUIRenderingIssues()`: Fixes UI rendering issues
- `fixProgressionIssues()`: Fixes progression and achievement issues

### Optimizations.js

The `Optimizations` class handles performance improvements.

**Key Methods:**
- `applyAllOptimizations()`: Applies all optimizations
- `optimizeRendering()`: Optimizes rendering performance
- `optimizeMemoryUsage()`: Optimizes memory usage
- `optimizeMobileExperience()`: Applies mobile-specific optimizations

## Main Entry Point

### main.js

The `main.js` file is the entry point for the application, initializing all necessary components and starting the game.

**Key Functions:**
- `initGame()`: Initializes the game
- `loadAssets()`: Loads game assets
- `setupEventListeners()`: Sets up event listeners
- `startGame()`: Starts the game

## Future Expansion

The codebase is designed with future multiplayer expansion in mind:

1. The game state management is already structured to handle multiple players
2. The spell system can be extended to support player vs player interactions
3. The UI is designed to be adaptable for multiplayer scenarios
4. Network code can be added to the existing framework with minimal changes

## Conclusion

This documentation provides an overview of the Wizard's Choice codebase. For more detailed information on specific components, refer to the inline documentation within each file.
