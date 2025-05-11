# Wizard's Choice - Next Steps
Main tasks are not to be marked complete until all subtasks are completed.

## Methodology & Best Practices

All tasks should be approached with these principles in mind:

- **Root Cause Analysis:** Focus on fixing the underlying problems, not just patching symptoms
- **Consistency:** Strive for consistent patterns (styling, state management, error handling)
- **Modularity:** Break down large components/modules into smaller, reusable pieces
- **Testing:** Perform tests after fixes to ensure issues are resolved
- **Documentation:** Update documentation concurrently with code changes
- **Clean Code:** Remove unused code, dependencies, and fix inconsistencies

Additional guidelines:
- Look for existing code to iterate on instead of creating new code unless required for proper modularization
- Avoid duplication of code by searching for similar functionality elsewhere in the codebase
- Keep the codebase clean and organized, refactoring files over 200-300 lines of code into smaller files and modules whenever possible
- Be mindful of what other methods and areas of code might be affected by changes
- Prefer well-known libraries when possible over custom solutions

## Bug Fix & Improvement Tasks

### Phase 1: Core Bug Fixes & Stability

#### Task Group 1: Combat Phase Advancement Glitch
- [x] Refactor Phase Management Logic
  - [x] Review `src/lib/combat/phaseManager.ts`, focusing on the `advancePhase` function and phase transitions
  - [x] Centralize phase state management definitively within phaseManager.ts and remove phase logic from BattleView.tsx useEffects
  - [x] Ensure advancePhase transitions are atomic and handle all states correctly, especially discard -> end -> initiative
  - [x] Implement robust state checks within advancePhase to prevent getting stuck and add detailed logging
  - [x] Ensure processEnemyDiscard in cardManager.ts completes synchronously or its completion reliably triggers the next step

- [x] Verify State Updates
  - [x] Add logging/debugging in BattleView.tsx and phaseManager.ts to trace state updates during phase transitions, while mindfully removing exceessive or redundant logging
  - [x] Test edge cases (e.g., player/enemy skipping turns, empty hands/decks during discard)
  - [x] Examine how phase changes are triggered and handled in the UI
  - [x] Check for proper synchronization between UI state and combat state

- [x] Phase Tracking Review
  - [x] Review `src/components/battle/PhaseTracker.tsx` and related components
  - [x] Verify that phase tracking accurately reflects the current game state
  - [x] Look for potential UI/state mismatches that could cause confusion

#### Task Group 2: Save Slot System Malfunction
- [x] Implement Unique Save Slot Identifiers
  - [x] Review `src/lib/game-state/modules/saveModule.ts`, focusing on save slot management
  - [x] Modify SaveSlot interface in game-types.ts to include a unique saveUuid (e.g., using uuid)
  - [x] Update saveModule.ts (saveGame, loadGame, initializeNewGame, deleteSaveSlot) to use saveUuid for localStorage keys
  - [x] Ensure currentSaveSlot stores the saveUuid, not just the array index
  - [x] Update MainMenu.tsx to handle selection based on saveUuid

- [x] Refactor Save/Load Logic
  - [x] Ensure loadGame correctly hydrates the entire game state, including correctly identifying the loaded slot
  - [x] Verify that saveGame always saves the state associated with the currently active saveUuid
  - [x] Check how save data is stored in localStorage
  - [x] Look for potential conflicts or overwriting issues
  - [x] Check for proper handling of empty vs. filled save slots

- [x] Fix Save Slot Data Isolation Issue
  - [x] Restructure SaveSlot interface to include player and gameProgress data
    - [x] Update game-types.ts to move player and gameProgress into the SaveSlot interface
    - [x] Update GameState interface to remove top-level player and gameProgress properties
  - [x] Update saveModule.ts functions to handle the new structure
    - [x] Modify initializeNewGame to store player and gameProgress within the save slot
    - [x] Update saveGame to save player and gameProgress data for the specific slot only
    - [x] Revise loadGame to load player and gameProgress from the selected save slot
  - [x] Update game state access patterns throughout the codebase
    - [x] Create helper functions to get/set the current player and gameProgress data
    - [x] Update all components that access player or gameProgress to use the new helpers
  - [x] Implement data migration for existing saves
    - [x] Create migration function to convert old save format to new structure
    - [x] Update version number and add version check in onRehydrateStorage
  - [x] Update wizardModule.ts to use the new update functions
    - [x] Update updateWizard to use updateWizardInSaveSlot
    - [x] Update addExperience to use updateWizardInSaveSlot and updateGameProgress
    - [x] Update addGold and removeGold to use updateWizardInSaveSlot and updateGameProgress
    - [x] Update addSpell to use updateWizardInSaveSlot and updateGameProgress
    - [x] Update equipSpell and unequipSpell to use updateWizardInSaveSlot
    - [x] Update equipItem and unequipItem to use updateWizardInSaveSlot
  - [x] Update UI components to use the new accessor and modifier functions
    - [x] Update WizardStudy component to use getWizard instead of directly accessing gameState.player
    - [x] Update DeckBuilder component to use getWizard and updateWizard
    - [x] Update progressModule to use updateGameProgress
    - [x] Update PlayerProfileScreen, InventoryScreen, PotionCraftingScreen, and EquipmentScreen components
    - [x] Update BattleView component to use getWizard and updateWizard
    - [x] Update MarketUI component and marketModule to use getWizard and updateWizard
  - [x] Fix updateGameState function to handle player and gameProgress updates properly
  - [x] Fix updateWizard function calls to use proper function syntax
    - [x] Update WizardStudy component to use proper function syntax
    - [x] Update DeckBuilder component to use proper function syntax
    - [x] Update BattleView component to use proper function syntax
    - [x] Update marketModule to use proper function syntax
    - [x] Update wizardModule to handle both function and object parameters
  - [x] Fix direct access to top-level player and gameProgress data
    - [x] Update wizardModule.ts functions to use getWizard() instead of directly accessing state.player
    - [x] Update getPlayerGold, getPlayerScrolls, checkIfScrollSpellKnown, consumeScrollToLearnSpell, addGold, and removeGold functions
    - [x] Fix import of getWizard in wizardModule.ts
  - [x] Test save slot isolation
    - [x] Verify that each save slot maintains its own player and progress data
    - [x] Ensure switching between save slots correctly loads the appropriate data

#### Task Group 3: Market Sell Function
- [x] Refactor sellItem Logic
  - [x] Review `src/lib/game-state/modules/marketModule.ts`, focusing on the `sellItem` function
  - [x] Ensure sellItem correctly fetches the player's unequipped inventory items (excluding items in player.equipment)
  - [x] Verify quantity checks and gold calculations are correct

- [x] Update MarketUI.tsx Sell Mode
  - [x] Review `src/components/market/MarketUI.tsx`, focusing on sell mode functionality
  - [x] Implement the logic to display the correct player inventory items when mode is 'sell'
  - [x] Ensure the UI passes the correct item details to the sellItem action
  - [x] Examine how the UI switches between buy and sell modes

- [x] Implement Market Gold Limits
  - [x] Add a currentGold property to the MarketLocation type
  - [x] Modify sellItem in marketModule.ts to check if market.currentGold >= totalValue
  - [x] Modify buyItem to increase market.currentGold
  - [x] Add logic to refreshMarketInventory to reset market.currentGold to a base value
  - [x] Verify that gold limits reset when inventory refreshes as specified in the requirements

#### Task Group 4: Market Attacks Not Triggering
- [x] Verify Attack Trigger Points
  - [x] Review `src/lib/features/market/marketAttacks.ts` and related functions
  - [x] Ensure checkForMarketAttack (from marketModule.ts) is correctly called within MarketUI.tsx's handleClose function
  - [x] If navigation involves changing currentLocation state, ensure the attack check happens before or is integrated into that process

- [x] Review Attack Probability Logic
  - [x] Debug shouldMarketAttackOccur in marketAttacks.ts to ensure probabilities are calculated correctly
  - [x] Check how difficulty settings affect attack chances (Easy ~5%, Normal ~25%, Hard ~50% as per requirements)
  - [x] Examine how market attacks are integrated with the game flow
  - [x] Check for proper handling of attack results (win/lose/flee)

#### Task Group 5: Equipment Slot Overwriting
- [x] Modify Equipping Logic
  - [x] Review `src/components/equipment/EquipmentScreen.tsx` and related components
  - [x] In handleEquipItem (or the corresponding action in wizardModule.ts), check if the target slot is already occupied
  - [x] If occupied, retrieve the currently equipped item and add it back to player.inventory
  - [x] Then, place the new item into the player.equipment slot and remove it from player.inventory
  - [x] Handle the edge case for the two 'finger' slots correctly
  - [x] Verify that items are properly moved between inventory and equipment slots

#### Task Group 6: Potion Crafting System
- [ ] Implement Core Crafting Logic
  - [ ] Review `src/lib/features/potions/potionCrafting.ts` and related files
  - [ ] Ensure craftPotion correctly consumes ingredients from player.ingredients (checking quantities)
  - [ ] Ensure craftPotion correctly adds the resulting Potion to player.potions
  - [ ] Fully implement experimentWithIngredients, ensuring ingredient consumption and recipe discovery updates

- [ ] Connect UI to Logic
  - [ ] Review `src/components/potions/PotionCraftingScreen.tsx` and related components
  - [ ] Verify that clicking "Craft Potion" calls the correct state action (craftPotion from the store)
  - [ ] Verify that clicking "Experiment" calls experimentWithIngredients
  - [ ] Ensure UI state (selected recipe, ingredients) is correctly passed to the logic functions
  - [ ] Ensure the UI updates correctly after crafting/experimentation (ingredient counts, potion list, discovered recipes)
  - [ ] Check for proper error handling and feedback during the crafting process

### Phase 2: Code Cleanup & Consistency

#### Task Group 7: Consolidate Styling Approach
- [ ] Choose a Primary Styling Method
  - [ ] Decide whether to use CSS Modules (*.module.css) or a global/utility-class approach consistently
  - [ ] Ensure alignment with UI design standards in docs/ui_design_standards.md
  - [ ] Consider standardizing on CSS Modules for component-specific styles and globals.css for base styles

- [ ] Refactor Styles
  - [ ] Migrate styles from components.css, deckbuilder.css, equipment.css, main.css, battle.css into relevant *.module.css files or globals.css
  - [ ] Remove redundant global CSS files (except globals.css)
  - [ ] Ensure shadcn/ui components (src/components/ui) integrate well with the chosen approach
  - [ ] Verify that all UI components follow the color palette, typography, and design principles in the UI standards

#### Task Group 8: Refactor Initiative Roll & Dependencies
- [ ] Implement threejs-dice
  - [ ] Update InitiativeRoll.tsx to use the threejs-dice library for rendering and rolling dice, replacing the CSS animation
  - [ ] Ensure the component correctly reports roll results via onRollComplete

- [ ] Remove Legacy Dependencies
  - [ ] Remove the dice-box dependency from package.json
  - [ ] Remove the dice-roller-parser dependency from package.json
  - [ ] Run npm install or pnpm install to update lock files

#### Task Group 9: Refactor AI Engine
- [ ] Modularize AI Strategies
  - [ ] Create a new directory src/lib/ai/strategies
  - [ ] Move each strategy class (DefensiveStrategy, AggressiveStrategy, etc.) into its own file within the new directory
  - [ ] Update aiEngine.ts (or potentially rename/move it to src/lib/ai/index.ts) to import strategies
  - [ ] Maintain the AIStrategyFactory and getAISpellSelection functionality

#### Task Group 10: Remove Legacy Placeholder Utilities
- [ ] Clean Up Placeholder Utilities
  - [ ] Remove the file src/styles/utilities/createPlaceholder.js
  - [ ] Check if src/styles/utilities/placeholder.ts is used anywhere
  - [ ] If not used, or if image fallbacks are handled elsewhere (like SpellCard.tsx), remove the file

### Phase 3: Feature Integration & Documentation

#### Task Group 11: Integrate Spell Tree System
- [ ] Add Navigation Link
  - [ ] Add a button or link in WizardStudy.tsx (e.g., "View Spell Tree") that navigates to the /spell-tree route

- [ ] Integrate Points System
  - [ ] Ensure level-ups correctly grant points (player.skillPoints or similar)
  - [ ] Modify SpellTreePage.tsx or spellTree.ts logic to use and deduct points from the central game state
  - [ ] Ensure unlocked spells in the tree are correctly added to the player's known spells (player.spells)

#### Task Group 12: Update Documentation
- [ ] Correct Core Technology Documentation
  - [ ] Update requirements.md and technical_documentation.md to reflect the use of Three.js/React Three Fiber instead of PhaserJS

- [ ] Align Documentation with Code
  - [ ] Review all files in docs/ against the current codebase
  - [ ] Update file paths, component descriptions, feature details, and technical explanations
  - [ ] Ensure how_to_play.md accurately describes current mechanics
  - [ ] Update project_structure.md if any file locations changed during refactoring

## Up Next
- [ ] Fix implementation of player profiles and stats tracking
  - [ ] Refactor player profile page with player stats and level up tabs as well as achievements and titles
  - [ ] Track combat performance metrics, finish implementation
  - [ ] Complete implementing achievement system
  - [ ] Add visual indicators for progress
  - [ ] Add title/rank system with progression paths and gameplay bonuses
  - [ ] Implement battle history logging system for performance tracking
  - [ ] Add export/share functionality
  - [ ] Add process maps for Player Profile System and UI navigation flow
  - [ ] Document technical considerations for data management and performance optimization

## Project Management
- [ ] Update all documentation
  - [ ] Clear all completed tasks from the docs/todo.md and move any remaining tasks to the todo.md in the project root at the bottom of the file.
  - [ ] Create a checklist of all files in the project using the docs/todo.md
  - [ ] Create a checklist of all docs files in the project using the docs/todo.md
  - [ ] Compare the code in each file with each of the docs one at a time, step by step to verify accuracy of the docs to the actual code in the project and correct any errors in the docs without removing any information that might be from intended but unimplemented features. Note these in the docs/todo.md as up to two line comments at the bottom of the file.
  - [ ] Review and update deployment instructions.

- [ ] Mobile responsiveness improvements
  - [ ] Optimize UI layouts for various screen sizes
  - [ ] Implement touch-friendly controls for mobile
  - [ ] Test and fix responsive design issues
  - [ ] Add progressive loading for mobile connections

## Production Preparation
- [ ] Security audit
- [ ] Performance optimization
- [ ] Prepare backend infrastructure
- [ ] Create deployment pipeline
- [ ] User testing and feedback
- [ ] Documentation updates

## Future Features (From Archived Todo)
- [ ] Implement spell progression tech tree system
  - [ ] Design PoE-style spell tree with wizard at center
  - [ ] Create data structure for spell nodes and connections
  - [ ] Implement level-up point system for purchasing connected spells
  - [ ] Design visual tech tree UI with connection paths and node states
  - [ ] Add navigation and interaction for the spell tech tree

- [ ] Add more enemy types
  - [ ] Design new enemy wizards with unique abilities
  - [ ] Create specialized AI strategies for each enemy
  - [ ] Add visual representations for new enemies
  - [ ] Implement enemy-specific loot tables

- [ ] Create procedural content generation
- [ ] Implement multiple difficulty levels
- [ ] Balance spell system
- [ ] Package game for deployment to vercel & docker
