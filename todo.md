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

### Phase 1: Core Refactor & Spell Management Editor

#### Task Group 1: XML Spell Data Format & Documentation
- [x] Decide and document the new XML spell data format in /docs, including all fields (name, type, element, tier, mana cost, description, effects, image, rarity, list membership)
- [x] Specify XML schema and validation rules (unique spell names, valid effects/targets, list attribute for archetype/creature/any)
- [x] Update documentation and process maps in /docs to reflect the new spell system and CMX workflow

#### Task Group 2: Spell Data Migration & Validation
- [x] Write a migration script to export all current spells to the new XML format, ensuring each spell is a node with a list attribute (archetype, creature, or 'any')
- [x] Add validation to prevent duplicate spell names and invalid effects/targets
- [x] Ensure migration script checks for and appends a suffix on duplicate spell names
- [x] Ensure migration script does not delete current spell data and includes all spell lists in the XML data
- [x] Execute migration script and validate XML data against the new schema, IF failed, restart Task Group 2 UNTIL successful.


#### Task Group 3: Game Refactor for XML Spell Loading
- [x] Refactor the game to load spells from the XML file at runtime, replacing hardcoded spell lists
- [x] Refactor archetype/creature logic to reference spells by name (unique, case-insensitive) instead of object or ID
- [x] Ensure all spell lists (default, archetype, creature) are populated from the XML data

#### Task Group 4: Card Management Editor (CMX) Implementation
- [ ] Create a dev-only GUI at /cmx for spell management (visible only in dev server)
- [ ] Allow viewing, editing, deleting, and adding spells, with all fields editable
- [ ] Allow the dev user to select which list(s) a spell belongs to, or 'any' for default
- [ ] Provide quick selection for mechanics/effects and value editing
- [ ] Allow the dev user to enter the art file path/name (must exist in project folder)
- [ ] Show changes live in the GUI, but require a dev server restart to load changes into the game
- [ ] Add buttons to download the current spell list XML and import/upload a new XML file
- [ ] Prompt the dev user to overwrite or rename if saving a spell with a duplicate name
- [ ] Leave inline comments in the code for future batch editing and versioning extension points

#### Task Group 5: Testing & Robustness
- [ ] Add unit tests for spell loading, saving, and editing
- [ ] Add validation tests for XML schema, duplicate names, and effect/target correctness
- [ ] Ensure error handling and user feedback in the CMX GUI


### Phase 2: Code Cleanup & Consistency

#### Task Group 6: Potion Crafting System
- [ ] Implement Core Crafting Logic
  - [ ] Review `src/lib/features/potions/potionCrafting.ts` and related 
  files
  - [ ] Ensure craftPotion correctly consumes ingredients from player.
  ingredients (checking quantities)
  - [ ] Ensure craftPotion correctly adds the resulting Potion to player.
  potions
  - [ ] Fully implement experimentWithIngredients, ensuring ingredient 
  consumption and recipe discovery updates

- [ ] Connect UI to Logic
  - [ ] Review `src/components/potions/PotionCraftingScreen.tsx` and 
  related components
  - [ ] Verify that clicking "Craft Potion" calls the correct state 
  action (craftPotion from the store)
  - [ ] Verify that clicking "Experiment" calls experimentWithIngredients
  - [ ] Ensure UI state (selected recipe, ingredients) is correctly 
  passed to the logic functions
  - [ ] Ensure the UI updates correctly after crafting/experimentation 
  (ingredient counts, potion list, discovered recipes)
  - [ ] Check for proper error handling and feedback during the crafting 
  process


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

### Loot System Overhaul Tasks
- [ ] Fix loot scroll generation bug (async special scrolls)
- [ ] Guarantee a minimum gold or ingredient drop from every victory
- [ ] Base loot scaling primarily on the defeated enemy and market unlock levels
- [ ] Add archetype and creature specific ingredient lists
- [ ] Update tests for new loot rules
