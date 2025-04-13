# Combat Engine Refactoring Plan

## Overview
The current `combatEngine.ts` file (1576 lines) contains multiple responsibilities that can be separated into focused modules. This refactoring plan aims to improve code organization, maintainability, and testability without breaking existing functionality.

## Current Issues
- The file is too large (1576 lines), making it difficult to navigate and maintain
- Multiple responsibilities are mixed together
- Some functions are already deprecated but still present
- Related functionality is spread across different parts of the file
- Some functionality has already been partially modularized (cardHandlers.ts, battleLogManager.ts, etc.)

## Existing Modules Analysis

Before proposing new modules, let's analyze the existing modules in the `src/lib/combat` directory:

1. `combatEngine.ts` - The main file we're refactoring
2. `battleLogManager.ts` - Manages battle log entries
3. `cardHandlers.ts` - Handles card operations like discarding
4. `combatStatusManager.ts` - Checks combat status (win/loss conditions)
5. `phaseManager.ts` - Manages combat phases
6. `aiEngine.ts` - Handles AI decision making
7. `battleLogger.ts` - Wrapper around battleLogManager

## Proposed Modules

### 1. Expand `cardHandlers.ts` to `cardManager.ts`
**Purpose**: Handle all deck and card operations.

**Functions to move from combatEngine.ts**:
- `shuffleArray`: Shuffle an array using Fisher-Yates algorithm
- `drawCards`: Draw cards from draw pile to hand
- `shuffleDiscardIntoDraw`: Shuffle discard pile into draw pile

**Benefits**:
- Centralizes all deck and card manipulation logic in one place
- Expands the existing cardHandlers.ts module rather than creating a new overlapping module
- Has minimal dependencies, making it easier to test

### 2. effectsProcessor.ts
**Purpose**: Process active effects and regenerate resources.

**Functions**:
- `processActiveEffects`: Process active effects for a wizard
- `regenerateMana`: Regenerate mana for a wizard

**Benefits**:
- Isolates the complex logic for handling ongoing effects
- Makes it easier to add new types of effects in the future
- Improves testability of effect processing

### 3. Expand `combatStatusManager.ts`
**Purpose**: Handle combat status checking and end-of-combat calculations.

**Functions to move from combatEngine.ts**:
- `calculateExperienceGained`: Calculate XP gained from combat

**Benefits**:
- Expands the existing combatStatusManager.ts module rather than creating a new overlapping module
- Centralizes all combat status and resolution logic in one place
- Makes it easier to add new end-of-combat calculations
- Very self-contained with minimal dependencies

### 4. combatInitializer.ts
**Purpose**: Initialize and set up combat.

**Functions**:
- `initializeCombat`: Initialize a new combat state
- `rollInitiative`: Roll initiative for combat
- `getPlayerDeck`: Get the player's deck
- `getEnemyDeck`: Get the enemy's deck

**Benefits**:
- Centralizes all combat setup logic
- Makes it easier to modify the initialization process
- Improves readability by separating setup from ongoing combat

### 5. spellEffectsManager.ts
**Purpose**: Handle spell casting and effect application.

**Functions**:
- `applySpellEffect`: Apply a spell effect to the combat state
- `getEffectName`: Get a descriptive name for an effect
- `executeSpellCast`: Execute a spell cast
- `executeMysticPunch`: Execute a mystic punch
- `selectSpell`: Select a spell for a wizard to cast
- `queueAction`: Queue an action for the resolution phase

**Benefits**:
- Centralizes all spell casting and effect application logic
- Makes it easier to add new spell types and effects
- Improves testability of spell effects

## Implementation Strategy

For each module, we'll follow this process:

1. Create the new file with appropriate imports
2. Move the relevant functions from combatEngine.ts
3. Update any internal references within the functions
4. In combatEngine.ts, replace the function implementations with imports and re-exports
5. Test thoroughly before proceeding to the next module

## Refactoring Order

1. **Expand `cardHandlers.ts` to `cardManager.ts`** (lowest dependencies)
2. **effectsProcessor.ts**
3. **Expand `combatStatusManager.ts`**
4. **combatInitializer.ts**
5. **spellEffectsManager.ts** (highest dependencies)

This order minimizes the risk of creating circular dependencies and allows for incremental testing.

## Detailed Steps for First Module (Expanding cardHandlers.ts to cardManager.ts)

1. Rename the existing file:
   ```typescript
   // Rename src/lib/combat/cardHandlers.ts to src/lib/combat/cardManager.ts
   // Update imports in all files that reference cardHandlers.ts
   ```

2. Update the imports in the file:
   ```typescript
   // src/lib/combat/cardManager.ts
   import { CombatState, Spell } from '../types';
   import { createLogEntry } from './battleLogManager';
   ```

3. Move the shuffleArray function:
   ```typescript
   /**
    * Shuffle an array using Fisher-Yates algorithm
    * @param array The array to shuffle
    * @returns A new shuffled array
    */
   export function shuffleArray<T>(array: T[]): T[] {
     const shuffled = [...array];
     for (let i = shuffled.length - 1; i > 0; i--) {
       const j = Math.floor(Math.random() * (i + 1));
       [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
     }
     return shuffled;
   }
   ```

4. Move the drawCards function:
   ```typescript
   /**
    * Draw cards from the draw pile into the hand
    * @param state The current combat state
    * @param isPlayer Whether the player is drawing cards
    * @param count The number of cards to draw
    * @param suppressLog Whether to suppress logging the card draw (for initial setup)
    * @returns Updated combat state
    */
   export function drawCards(
     state: CombatState,
     isPlayer: boolean,
     count: number,
     suppressLog: boolean = false
   ): CombatState {
     // Implementation from combatEngine.ts
     // Update any references to other functions that have been moved
   }
   ```

5. Move the shuffleDiscardIntoDraw function:
   ```typescript
   /**
    * Shuffle the discard pile into the draw pile
    * @param state The current combat state
    * @param isPlayer Whether this is for the player
    * @returns Updated combat state
    */
   export function shuffleDiscardIntoDraw(
     state: CombatState,
     isPlayer: boolean
   ): CombatState {
     // Implementation from combatEngine.ts
     // Update any references to other functions that have been moved
   }
   ```

6. Update combatEngine.ts to import and re-export these functions:
   ```typescript
   // In combatEngine.ts
   import {
     drawCards,
     shuffleDiscardIntoDraw,
     shuffleArray,
     discardCard // existing function
   } from './cardManager';

   // Re-export for backward compatibility
   export { shuffleDiscardIntoDraw, shuffleArray };
   ```

7. Test thoroughly to ensure everything still works correctly.

## Module Overlap Considerations

When refactoring, we need to be mindful of potential overlaps with existing modules:

1. **Card and Deck Management**: Rather than creating a new `deckManager.ts`, we'll expand the existing `cardHandlers.ts` to `cardManager.ts` to handle all card and deck operations.

2. **Combat Resolution**: Instead of creating a separate `combatResolution.ts`, we'll expand the existing `combatStatusManager.ts` to include end-of-combat calculations.

3. **Phase Management**: The existing `phaseManager.ts` already handles phase transitions. We'll ensure our refactoring doesn't duplicate this functionality.

4. **Battle Logging**: The existing `battleLogManager.ts` and `battleLogger.ts` handle logging. We'll ensure our refactored modules use these for all logging operations.

## General Considerations

- **Backward Compatibility**: Maintain backward compatibility through re-exports from combatEngine.ts
- **Circular Dependencies**: Avoid circular dependencies through careful module design
- **Deprecated Functions**: Keep deprecated functions in combatEngine.ts with clear notices
- **Complex Orchestration**: Consider keeping complex orchestration functions (like advancePhase) in combatEngine.ts initially
- **Testing**: Test thoroughly after each module is refactored
- **Documentation**: Update comments and documentation to reflect the new module structure

## Final Cleanup

After all modules are created:

1. Review combatEngine.ts for any remaining functions that could be modularized
2. Remove deprecated functions or clearly mark them for future removal
3. Update documentation to reflect the new module structure
4. Consider adding new tests for the modularized functions

## Conclusion

This refactoring plan allows for incremental improvement with minimal risk, while significantly enhancing the code organization and maintainability. By breaking down the monolithic combatEngine.ts into focused modules, we'll make the codebase easier to understand, maintain, and extend in the future.
