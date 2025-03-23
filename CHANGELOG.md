# Wizard's Choice - Changelog

## [Unreleased]

### Added
- Level-up spell selection screen with options from defeated enemy and random spells
- Spell improvement system for already known spells
- Experience gain based on difficulty (10x for easy, 25x for normal, 50x for hard)
- Card drawing at the beginning of each turn to refill player's hand
- Comprehensive process maps in Mermaid diagram format to visualize game architecture
- Restructured todo.md with a sequential implementation plan for remaining tasks
- Import standards documentation defining rules for absolute vs. relative imports
- Standardized import organization in main.js (alphabetical ordering)
- Split GameManager into modular components for better code organization:
  - GameStateManager - Handles overall game state and initialization
  - BattleManager - Manages battle flow and turn processing
  - PlayerManager - Handles player state and actions
- Split EnhancedUIManager into modular components for better separation of concerns:
  - ScreenManager - Handles screen transitions and visibility
  - UIElementManager - Manages UI element creation and updating
  - UIEventManager - Handles event handling for UI elements
- New modular spell system with separate SpellDefinitions, SpellHandManager, and SpellProgressionTracker
- New modular game management system with BattleManager, PlayerManager, and GameStateManager
- New modular UI system with ScreenManager, UIElementManager, and UIEventManager

### Changed
- Refactored project structure to remove duplicate files in src/js/core and src/js/ui
  - Consolidated all core game logic into src/game/core
  - Consolidated all UI components into src/game/ui
  - Updated imports to reference the canonical src/game paths
  - Added CSS style injection for more consistent UI rendering
  - Maintained all fixed methods including recordBattleResult in EnhancedSpellSystem
- Moved improveSpell method from EnhancedSpellSystem to SpellProgressionTracker for better code organization
- Updated React components to use GameStateManager instead of GameManager
- Consolidated duplicate initialization logic in SpellProgressionTracker.js
- Simplified resetPlayerProgress to reuse initPlayerProgress logic
- Added redirection from src/js/main.js to src/game/main.js for HTML compatibility
- Added redirection from src/js/ui files to their corresponding src/game/ui files
- Added placeholder spell card images via external URL
- Improved spell card layout with optimized space for descriptions and effects
  - Adjusted padding and margins to reduce wasted space
  - Set spell image width to 81% of card width for better proportions
  - Added text wrapping for descriptions to prevent clipping
  - Added support for both heal and healing attributes in effects display
  - Included tooltips for complete spell information on hover
- Updated import statements in main.js to follow the defined standards
- Verified all import statements in the codebase follow the defined standards
- Refactored EnhancedSpellSystem.js into modular components:
  - SpellDefinitions.js - spell catalog and attributes
  - SpellHandManager.js - deck and hand management
  - SpellProgressionTracker.js - player progression and spell unlocking
- Modified event listener attachment approach to use direct binding rather than node replacement
- Updated UI state management to be more resilient to DOM changes
- Enhanced spell selection visualization with improved feedback
- Exposed gameManager instance for debugging purposes
- Restructured main.js to use async initialization
- Reworked spell drawing from a static selection to a dynamic card game system
  - Player now draws cards from a deck that gets reshuffled when empty
  - Each spell can only exist in one place: hand, deck, or discard pile
  - Drawing system ensures variety in gameplay while preventing duplicates
- Improved opponent turn processing to mimic player mechanics
  - Opponent now maintains their own hand of 3 spells
  - Uses the same drawing and reshuffling mechanics as the player
- Refactored codebase to eliminate duplication between src/game/ and src/js/ directories
  - Consolidated main.js files, keeping the enhanced functionality from js version but placing it in game directory
  - Removed redundant js/main.js after consolidation
  - Updated imports to reference the canonical src/game paths
  - Added CSS style injection for more consistent UI rendering
  - Maintained all fixed methods including recordBattleResult in EnhancedSpellSystem
- Updated React components to use GameStateManager instead of GameManager

### Fixed
- Fixed battle logic issue where enemy wizard wouldn't cast a spell after player's turn
  - Corrected spell ID mismatches in opponent spell initialization
  - Added validation in drawOpponentSpell to handle invalid spell IDs
  - Improved error handling in processOpponentTurn to ensure turn progression
  - Wrapped opponent turn logic in try/catch/finally to guarantee turn advancement

- Fixed turn counter not incrementing and player unable to cast spells after first turn
  - Added proper isProcessingTurn flag management in playerCastSpell and processOpponentTurn
  - Fixed initializeBattle to properly set up game state with correct turn counter
  - Ensured processTurnEnd is always called after opponent's turn
  - Added proper battle state tracking with isBattleOver flag

- Fixed player health and mana not updating correctly during gameplay
  - Enhanced applySpellEffects to properly update health and mana values
  - Added tracking of previous health values for animation effects
  - Improved UI update calls to ensure health and mana displays are refreshed
  - Added proper spell effect application for various spell types
  - Fixed checkBattleEnd to properly handle battle end conditions

- Fixed selected spells not appearing in battle
  - Removed code that overwrote player's spell selections
  - Added missing code to render the player's spell hand in the battle UI
  - Fixed mismatch between HTML element ID and UI manager's element reference in the battle scene
  - Fixed spell button layout to display horizontally in the battle UI using a flex container
  - Fixed spell selection not persisting to battle by updating resetAvailableSpells method
  - Fixed Stone Skin spell description displaying correctly with its healing effect
- Start Battle button now correctly responds to clicks after selecting spells
  - Fixed scope issues with selectedSpells and MAX_SELECTED_SPELLS variables
  - Improved event listener attachment to ensure clicks are properly detected
  - Added extensive debugging to trace button state changes
- Enhanced spell selection screen to properly track selected spells
- Fixed improper GameManager class export which was causing integration issues 
- Corrected EnhancedUIManager import in main.js to use default export
- Added comprehensive try/catch blocks to the battle initialization process
- Completely rebuilt the spell drawing system to work like a proper card game
  - Fixed issues with drawing duplicate spells or running out of spells
  - Implemented proper deck shuffling and discard pile mechanics
  - Added tracking of spells in hand vs. spells in deck
- Fixed enemy wizard mana consumption and damage application
  - Enemy now properly takes damage from player spells
  - Enemy's mana is correctly deducted when casting spells
- Fixed turn-based progression to ensure proper state management
- Fixed SceneManager rendering errors related to container dimensions
  - Added robust validation of container width and height
  - Implemented proper fallbacks for invalid dimensions
  - Added debugging for resize operations
- Fixed missing UI screens in the UIManager
  - Added 'spell-selection-screen' and 'results-screen' to managed screens list
  - Created missing 'results-screen' HTML element for battle outcome display
  - Fixed screen hiding and showing functionality
- Fixed accessibility issues in form elements
  - Added missing id and name attributes to select elements
  - Added proper label associations with for attributes
  - Improved form field structure in settings screen
  - Added colons to labels for better readability
- Fixed React component accessibility issues
  - Added proper label associations using htmlFor
  - Implemented focus states for better keyboard navigation
  - Standardized form field structure across HTML and React components
- Fixed "this.spellSystem.initPlayerSpells is not a function" error when starting a new game
  - Added missing initPlayerSpells method to EnhancedSpellSystem class
  - Method delegates to initializeSpellHand in SpellHandManager with player's unlocked spells
- Updated process_maps.md to accurately reflect the new modular spell system structure
  - Updated Component Structure diagram with correct component names
  - Updated Game Initialization Process diagram to show component initialization flow
  - Updated Spell System Process diagram to reflect the new modular architecture
- Fixed runtime errors related to missing methods in SpellSystem
- Fixed import paths to use the consolidated structure

### Removed
- Eliminated redundant managers directory (src/js/managers)
  - Consolidated manager functionality into src/game/managers
  - Updated imports to reference the single source of manager classes
  - Removed outdated, less functional versions of manager classes
- Removed duplicate src/js/* directories after confirming all functionality is preserved in src/game/*
- Removed unused methods defineSpells() and addSpell() from EnhancedSpellSystem.js
- Removed commented-out audio functionality code from UIEventManager.js
- Removed SpellManager.js as its functionality is now handled by the modular spell system components (SpellDefinitions.js, SpellHandManager.js, and SpellProgressionTracker.js)

## [0.1.0] - 2025-03-21
Initial development version with core game functionality
