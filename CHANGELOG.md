# CHANGELOG

## 2025-04-05
- Refactoring Combat Logic Flow Continued
  - Fixing visual and backend logic errors
  - Ensuring proper state management and UI updates
  - Playtesting-Refinement Loop
  - Fixed Mystic Punch spell discard functionality
  - Fixed second discard modal popup issue
  - Added Upkeep phase to help the AI understand where the step to shuffle the discard pile into the deck is supposed to happen. Instead of it just doing it whenever it wanted to do so.


## 2025-04-04
- Refactor Combat Logic Flow
  - Add initiative roll phase
  - Add action phase
  - Add response phase
  - Add discard phase
  - Add end phase
  - Add phase tracker component
  - Add phase transition logic
  - Add phase-specific UI components
  - Add phase-specific state management
  - Add phase-specific combat logic
  - Add phase-specific spell casting logic
  - Add phase-specific spell effect logic
  - Add phase-specific spell targeting logic

## 2025-04-03
- Done: fixed favicon and metacard info

## 2025-04-02
- Done: Implement phase tracker widget during duels

## 2025-04-01
- Done: Fixed mobile responsiveness for production version

## 2025-03-31
- Done: Fixed battle arena 3D display and combat functionality
  - Resolved issue with the 3D battle scene not displaying properly
  - Fixed compatibility issues between BattleView and BattleArena components
  - Updated BattleScene component to support both direct props and combat state approaches
  - Implemented proper props passing to restore the original battle arena appearance
  - Fixed spell casting functionality and turn transitions
  - Ensured combat log properly displays battle events
  - Enhanced state management to prevent combat flow issues
  - Fixed mystic punch spell discard functionality to discard the spell after selecting the spell that powers it

## 2025-03-30
- Done: Fixed battle arena display and functionality
  - Resolved issue with 3D battle scene not displaying properly
  - Fixed battle arena component prop mismatch after refactoring
  - Restored proper spell casting functionality and turn mechanics
  - Ensured BattleView passes correct props to BattleArena component

## 2025-03-30
- Done: Fixed market transaction functionality
  - Implemented missing buyItem and sellItem functions in marketModule.ts
  - Added checkForMarketAttack and handleMarketAttackResult functions
  - Ensured proper integration with the getPlayerScrolls function for spell scroll transactions
  - Fixed "buyItem is not a function" and "checkForMarketAttack is not a function" errors

## 2025-03-30
- Done: Fixed getPlayerScrolls not a function error
  - Implemented missing getPlayerScrolls function in wizardModule.ts
  - Added consumeScrollToLearnSpell and checkIfScrollSpellKnown functions
  - Ensured proper SpellScroll type imports from spell-types.ts
  - Fixed battle initialization error when starting new battles

## 2025-03-30
- Done: Fixed game navigation and transition issues
  - Fixed navigation from battle victory to wizard's study by implementing a direct URL parameter approach
  - Solved race conditions in game state updates during navigation between screens
  - Added immediate visual feedback for button clicks with page transition overlay
  - Eliminated loading screen flicker when returning from battle to wizard's study
  - Enhanced state management to prevent game start/continue actions from being overridden
  - Implemented proper cleanup of transition classes across all components
  - Made combat initialization more resilient with improved error handling
  - Added consistent loading indicators with smoother transitions between game views

## 2025-03-30
- Done: Fixed battle system enemy turn flow and improved visibility
  - Redesigned the battle flow to embed enemy turns directly into player action handlers
  - Eliminated race conditions and state management issues with the previous timer-based approach
  - Added a clear visual "Enemy's Turn" indicator with animated styling to improve user experience
  - Enhanced safety mechanisms to detect and recover from any stuck animation states
  - Extended timing between turns to make the enemy's actions more noticeable for players

## 2025-03-28
- Identified remaining issues in StreamlinedMarketUI after successful rendering implementation
  - Transaction logic not properly updating player gold
  - Inventory not receiving purchased items
  - Market quantities not updating after purchases
  - Created targeted plan to fix transaction-related issues while preserving the successful UI rendering

## 2025-03-28
- Done: Successfully resolved MarketUI rendering issues with complete rewrite
  - Completely rewrote the MarketUI using a phased loading architecture to improve stability
  - Used explicit loading states with progress indicators for each step in market data loading
  - Implemented inline styles with guaranteed visibility properties instead of CSS modules
  - Set high z-index values to prevent conflicts with other components
  - Created clear visual hierarchy with consistent spacing and layout
  - Added proper error boundaries and fallback UIs for all error states
  - Replaced refresh button with travel mechanic that includes market attack random chance
  - Implemented proper loading states with visual feedback for each step of the process
  - Created consistent UI layout with clear sections for market selection, item browsing, and transactions
  - Added detailed item cards with improved visual design based on rarity
  - Ensured smooth transition between buy and sell modes with appropriate item filtering
  - Key factors that fixed the rendering issues:
    - Using phased rendering approach instead of attempting to render everything at once
    - Implementing explicit state management for loading and data availability
    - Using inline styles with high z-index values to ensure visibility
    - Ensuring clear separation between API parameter values and UI state

## 2025-03-28
- Note: Completed multiple approaches to fix MarketUI rendering issues, but none fully resolved the problem
  - Implemented comprehensive ErrorBoundary around MarketUI component
  - Added detailed performance monitoring to identify bottlenecks and race conditions
  - Resolved CSS module duplication by consolidating MarketUI.module.css files
  - Removed duplicate CSS file in src/lib/ui/components/styles
  - Ensured consistent import paths across all components
  - Tested switching back to CSS modules from inline styles
  - Created simple version using CSS modules to verify styles apply correctly
  - Refactored component to use CSS modules instead of inline styles
  - Tested with mock data to determine if issues were related to data structure or timing
  - Created mock market data for testing
  - Implemented fallbacks for empty or malformed data
  - Fixed linter errors related to the market attack functionality
  - Resolved import/export mismatch between WizardStudy and MarketUI
  - Fixed component recursion problem causing infinite rendering loop
  - Diagnosed MarketUI visibility issues with emergency implementations
  - Created refactoring plan with detailed component structure in BUGS.md
  - After multiple unsuccessful approaches, decided to create a complete refactoring plan for the MarketUI

## 2025-03-27
- Done: Completed MarketUI rendering improvements and refactoring
  - Fixed import/export mismatch between WizardStudy and MarketUI components
  - Fully transitioned MarketUI to use CSS modules instead of inline styles
  - Fixed function calls for market attack functionality to match their signatures
  - Enhanced error handling with comprehensive fallbacks for empty or malformed data
  - Added ErrorBoundary component with CSS-styled fallback UI 
  - Ensured consistent import paths across all components
  - Resolved CSS module duplication by consolidating styles

## 2025-03-27
- Done: Improved MarketUI component stability and usability
  - Implemented comprehensive ErrorBoundary around MarketUI component to catch and log specific React errors
  - Added detailed performance monitoring utilities to identify bottlenecks and race conditions 
  - Removed duplicate CSS module files to resolve style conflicts
  - Created simplified version of MarketUI using CSS modules to verify styling issues
  - Implemented mock market data for consistent testing and debugging
  - Enhanced error handling for market data loading and processing

## 2025-03-26
- Done: Fixed UI integration bugs in player profile and market systems
  - Updated PlayerProfileScreen to use useGameStateStore instead of useGameState for consistent state management
  - Fixed market screen navigation issue by changing router handling during market attacks
  - Improved error handling in component state transitions
  - Ensured proper integration between the Wizard's Study, Profile, and Market components

## 2025-03-26
- Done: Moved player profile button to Wizard's Study screen
  - Relocated profile button from main menu to Wizard's Study for better integration with character management
  - Added profile button under player name and level in the top right corner
  - Styled button to match existing UI design language
  - Designed for future expansion to support multiple character saves (up to 3)

## 2025-03-26
- Done: Created comprehensive documentation for Player Profile and Stats Tracking System
  - Designed detailed specifications for player statistics tracking across combat, progression, and collection categories
  - Defined achievement system with categories, examples, and reward mechanics
  - Created title/rank system with progression paths and gameplay bonuses
  - Designed battle history logging system for performance tracking
  - Implemented export/share functionality specifications
  - Added process maps for Player Profile System and UI navigation flow
  - Documented technical considerations for data management and performance optimization

## 2025-03-26
- Done: Fixed React state management issues in Market system
  - Fixed React state update error in the MarketUI component by implementing proper state management with useEffect and local component state
  - Optimized getMarkets function to prevent React rendering errors by deferring state updates with setTimeout
  - Updated technical documentation with new Market UI state management best practices
  - Added detailed process map for Market UI Component state flow
  - Updated UI Components section of technical documentation with MarketUI details
  - Completed all UI reorganization tasks in Wizard's Study screen
  - Consolidated navigation by merging inventory-related functionality into a single Inventory button

## 2025-03-25
- Done: Added marketplace attacks feature
  - Implemented random attack chances when leaving markets based on market level and difficulty
  - Created specialized bandit/thief wizard antagonists with unique spells and abilities
  - Designed market attack encounter system with fight or flee options
  - Added reward system with rare ingredients for defeating market attackers
  - Implemented gold loss mechanic when fleeing or losing to market attackers

## 2025-03-25
- Done: Added high-level market locations
  - Implemented 8 new advanced markets unlocked at higher player levels (25,50,75,100,150,250,500,1000)
  - Created thematically unique marketplace concepts with specialized inventories
  - Balanced pricing multipliers and inventory refresh cycles for market progression
  - Updated market system documentation with new locations diagram

## 2025-03-25
- Done: Created market system for trading ingredients and items
  - Designed comprehensive market data structures with inventory, prices, and fluctuation
  - Implemented price fluctuation algorithm based on supply/demand mechanics
  - Created market UI component accessible from wizard's study 
  - Added transaction system for buying/selling ingredients, potions, and equipment
  - Implemented market reputation system affecting prices
  - Added multiple market locations unlocked by player level progression
  - Created visual feedback for price changes and transaction history
  - Added process map documenting market system workflow

## 2025-03-25
- Done: Implemented battle screen with dueling system
  - Created responsive 3D battle arena with wizards and dynamic spell effects
  - Implemented interactive spell casting with visual feedback and animations
  - Added special effects for different spell types (attack, defense, healing, utility)
  - Integrated equipment bonuses in combat calculations
  - Created turn-based UI with clear status indicators and battle log
  - Implemented victory/defeat conditions with appropriate UI
  
- Implemented interactive battle screen with dueling system:
  - Created battle page with 3D battle arena integration
  - Implemented spell selection and mystic punch mechanics
  - Added turn-based combat flow with player and enemy phases
  - Created battle end modals with rewards display
  - Integrated game state with combat engine for persistent progression
  - Added process maps documenting battle system workflow

- Revised equipment system with logical slot categorization and new items:
  - Reorganized equipment into six logical slots: head, hand, body, neck, finger, and belt
  - Added finger slot that allows equipping two rings simultaneously
  - Implemented belt slot with variable potion capacity (1-5 slots based on rarity)
  - Added more weapon options to the hand slot (wands, staffs, daggers, swords, spellbooks)
  - Designed complete potion system with six types (health, mana, strength, protection, elemental, luck)
  - Created five tiers of potions with increasing power and effects
  - Updated equipment UI to support new slot system and potion management
  - Enhanced stat calculations to account for all equipment and potion effects

- Expanded equipment system with new weapon types and gear options:
  - Added daggers that provide enhanced mystic punch and bleed effects
  - Implemented swords with powerful melee capabilities and bleed damage
  - Created spellbooks that offer card advantage with extra draws or discard-and-draw abilities
  - Added wizard hats as new head equipment focusing on mana and health bonuses
  - Updated equipment UI to accommodate new equipment slots and filtering options
  - Enhanced wizard stat calculations to incorporate new equipment bonuses
  - Balanced new equipment types across all rarity tiers

- Implemented comprehensive procedural equipment system:
  - Added equipment generator with affix-based properties
  - Created five equipment types: wands, staffs, robes, amulets, and rings
  - Implemented equipment rarities with increasing power and bonus potential
  - Designed specialized bonuses for each equipment type:
    - Wands/Staffs enhance spell damage and reduce mana costs
    - Robes provide elemental resistance and damage reduction
    - Amulets boost wizard stats like health and mana
    - Rings offer unique bonuses including luck for better loot
  - Added staff equipment type that enhances mystic punch ability
  - Integrated equipment with the wizard character system
- Enhanced loot system with procedural equipment generation:
  - Created dynamic loot drops based on enemy level and game difficulty
  - Implemented experience rewards from defeated enemies
  - Added varied equipment rarity chances based on enemy type and level
- Built intuitive Equipment Screen UI:
  - Created responsive equipment management interface
  - Implemented equipment slots with visual feedback
  - Added inventory management with filtering by equipment type
  - Designed detailed item inspection with bonus visualization
  - Integrated equip/unequip functionality with visual feedback

- Completed the entire spell system with 100 common spells across all 10 tiers:
  - Added 10 powerful Tier 6 spells with advanced damage and effect combinations
  - Designed 10 Tier 7 spells at near-legendary power levels
  - Created 10 formidable Tier 8 spells with catastrophic damage potential
  - Implemented 10 mythic Tier 9 spells with universe-altering effects
  - Added 10 ultimate Tier 10 spells representing the pinnacle of magical power
  - Designed progressive scaling of effects and mana costs across all tiers
- Added special collectible spells:
  - Created 10 uncommon spells of various tiers with unique effects
  - Implemented 10 rare spells with powerful specialized abilities
  - Designed 5 legendary spells with game-changing power levels
  - Added lore and acquisition methods for each special spell
  - Integrated special spells with the enemy and loot systems

- Expanded spell system with 50 unique spells across 5 tiers:
  - Added 10 Tier 1 spells (cantrips) for early gameplay
  - Implemented 10 powerful Tier 2 spells with enhanced effects
  - Created 10 advanced Tier 3 spells with complex effect combinations
  - Designed 10 formidable Tier 4 spells with powerful strategic options
  - Added 10 devastating Tier 5 spells with game-changing capabilities
  - Implemented special effect handling for advanced spell mechanics like Time Warp
  - Enhanced combat engine to support new spell effect types and interactions
  - Balanced spell costs and effects across tiers for strategic gameplay

## 2025-03-24
- Improved Deck Builder UI and usability:
  - Added collapsible help section for cleaner interface
  - Enhanced mobile responsiveness with adaptive layout
  - Improved grid layout for spell cards
  - Added visual indicators for minimum deck size requirements

- Enhanced deck builder with comprehensive deck management:
  - Added ability to create multiple named decks
  - Implemented deck saving and editing functionality
  - Added deck equipping to select active deck for duels
  - Created intuitive UI for deck management with filtering and sorting options
  - Integrated deck system with game state for persistence
  - Implemented discard pile draw mechanics with minimum deck size of 5 spells
  - Added helpful tutorial section explaining deck system

## Upcoming Features
- Procedural content generation for varied gameplay
- Expanded loot system with rare and unique spells
- Multiple difficulty levels with scaling rewards
- Equipment system with magical items and bonuses

- Implemented battle system with immersive 3D effects:
  - Added dynamic spell casting effects with element-based particles and animations
  - Created floating damage/healing numbers with visual feedback
  - Enhanced wizard models with health bars and active state animations
  - Implemented smooth transitions and spell travel effects
  - Added turn indicators and battle state visualization
- Implemented sophisticated AI system for enemy wizards using strategy patterns
- Created deck builder interface for managing spells with filtering and sorting capabilities
- Added spell card component with visual styling for different elements and types
- Improved TypeScript compatibility and fixed duplicate identifier errors
- Enhanced authentication security with proper password hashing using bcryptjs
- Added robust user storage with persistent IndexedDB integration
- Fixed server-side rendering compatibility issues
- Implemented loading states and improved error handling
- Added unique save game persistence per user account

## [Unreleased]

### Added
- Interactive battle screen with 3D wizards and spell effects
- Deck-based spell system with draw and discard mechanics
  - Draw pile and discard pile tracking
  - Hand refill mechanics at the start of each round
  - Automatic reshuffling of discard pile when draw pile is empty
- Turn-based combat logic with rounds and mana regeneration
  - Clear separation between player and enemy turns
  - Round-based progression with incrementing counter
  - Mana regeneration at the end of each round
- Active effects system for status effects during combat
  - Support for damage over time, healing, mana drain, and mana regeneration effects
  - Duration tracking and automatic expiration
  - Visual indicators for active effects on both player and enemy
- Battle log to track actions during combat
  - Chronological display of combat events
  - Visual styling for different action types
- Mystic Punch as a basic attack that requires no mana
- Equipment systems with bonuses to player stats
- Potion system framework for in-battle usage
- Process maps for Battle, Equipment, and Potion systems
- Combat utilities for calculating damage, healing, and critical hits
  - Randomized damage variance for unpredictability
  - Elemental damage modifiers based on resistances and weaknesses
  - Critical hit system with damage multipliers
- Spell Scroll System
  - Created spell scroll item type with rarity-based attributes
  - Added spell scrolls to loot tables for monster and wizard drops
  - Integrated spell scrolls with market system for buying and selling
  - Implemented scroll consumption in wizard's study to learn spells permanently
  - Added battle mechanic for using scrolls as single-use free spells without mana cost
  - Designed UI for scroll inventory in wizard's study and battle screen

### Changed
- Updated SpellCard component to support disabled state
- Improved BattleArena UI with deck information and active effects display
- Enhanced combat engine with AI decision making
  - Intelligent spell selection based on combat state
  - Strategic prioritization of healing when health is low
  - Consideration of mana efficiency in spell choice
- Refactored types to better support combat mechanics
  - Added CombatWizard interface with deck-related properties
  - Enhanced Spell interface with power and effect properties
  - Created dedicated ActiveEffect interface for status effects
- Separated combat calculations into utility functions for better maintainability

### Fixed
- Type errors in aiEngine.ts getAISpellSelection function
- Fixed execution of Mystic Punch in combat
- Added proper error handling for combat actions
- Improved active effect application and processing
- Fixed deck mechanics to properly handle empty draw piles

## [0.1.0] - 2025-03-25

### Added
- Initial project setup with Next.js and TypeScript
- Basic wizard character creation
- Simple spell casting mechanic
- Equipment inventory system
- Map navigation between locations

### Changed
- Improved UI for spell selection
- Enhanced equipment management interface

### Fixed
- Various type issues in core game components
- Layout issues on smaller screens 

## 2025-03-25
- Done: Implemented potion crafting system
  - Created ingredient gathering mechanic through the existing loot system
  - Designed recipe discovery system through experimentation and loot drops
  - Implemented brewing interface accessible from the wizard's study
  - Added comprehensive documentation with mermaid diagram

## 2025-03-25
- Done: Fixed TypeScript errors in aiEngine.ts and page.tsx
- Done: Added comprehensive diagrams to documentation
  - Created Battle System workflow diagram
  - Created Equipment System diagram
  - Created Potion System diagram
  - Updated process_maps.md with all new diagrams

## 2025-03-25
- Done: Revised equipment system with logical slot organization
  - Reorganized equipment into six logical slots (head, hand, body, neck, finger, belt)
  - Implemented dual-ring system for finger slot
  - Added belt slot with potion capacity
  - Created comprehensive potion system with six types and five tiers
  - Implemented potion management UI in equipment screen
  - Enhanced game state store with potion functionality

## 2025-03-25
- Done: Expanded equipment options with new gear types
  - Added daggers and swords with enhanced mystic punch and bleed effects
  - Implemented spellbooks with card advantage mechanics
  - Created wizard hats as head equipment with mana/health bonuses
  - Updated UI to support new equipment slots
  - Enhanced stat calculations for new equipment bonuses

## 2025-03-25
- Done: Implemented equipment system with procedural generation
  - Created equipment component UI with slots for wands, staffs, robes, amulets, and rings
  - Implemented equipment data structures with affix-based bonuses
  - Added equipment effect calculations for wizard stats
  - Created procedural equipment generation for loot system
  - Designed and integrated Equipment Screen UI

## 2025-03-25
- Done: Expanded spell system
  - Completed all 10 tiers (100 common spells)
  - Added 25 special spells (uncommon, rare, and legendary)

## 2025-03-25
- Done: Implemented user persistence features
  - Added unique save game persistence per user
  - Implemented loading states and error handling
  - Fixed server-side rendering compatibility
  - Added IndexedDB integration for persistent storage
  - Implemented secure password hashing with bcryptjs

## 2025-03-25
- Done: Core game systems implementation
  - Fixed duplicate identifier errors in imports
  - Created deck builder functionality with filtering and sorting
  - Implemented AI for enemy wizards using strategy patterns
  - Implemented battle system with 3D effects
  - Created interactive battle UI
  - Implemented turn-based combat logic with deck system

## 2025-03-25
- Done: Initial project setup
  - Set up GitHub repository
  - Created project structure
  - Implemented basic UI framework
  - Added initial spell system 

## 2025-03-25
- Done: Added more enemy types
  - Created specialized AI strategies for each enemy type
  - Added visual representations for new enemy types
  - Implemented enemy-specific loot tables and drop rates
  - Balanced difficulty scaling for new enemy encounters

- Done: Designed 5 new enemy wizard archetypes with unique abilities
  - Created Necromancer, Time Weaver, Battle Mage, Illusionist, and Alchemist archetypes
  - Implemented specialized AI strategies for each archetype
  - Added unique spells and abilities for each archetype
  - Balanced stats and mechanics for each archetype

- Done: Designed 5 new enemy magical creature types with unique abilities
  - Created Ancient Dragon, Eldritch Horror, Nature Guardian, Storm Elemental, and Abyssal Leviathan with unique abilities and stats
  - Implemented specialized AI strategies for each creature type
  - Added visual representations and loot tables for each creature
  - Balanced difficulty scaling for creature encounters

- Done: Created spell progression tech tree system
  - Design PoE-style spell tree with wizard at center
  - Create data structure for spell nodes and connections
  - Implement level-up point system for purchasing connected spells
  - Design visual tech tree UI with connection paths and node states
  - Add navigation and interaction for the spell tech tree
  - Implement spell unlocking logic based on prerequisites
  - Balance progression curve and spell distribution on tree
  - Add tooltips and preview for locked/available spells

- Done: Implemented spell scroll system
  - Created spell scroll item type data structure
  - Added spell scrolls to loot tables and market inventory
  - Implemented spell scroll consumption to learn spells permanently if used in wizards study
  - Added battle mechanic for single-use free casting from scrolls and consumes the scroll
  - Designed UI for spell scroll inventory and usage, so they show up to the side of the characters spell cards in hand 

## 2025-03-26
- Done: Improved Wizard's Study UI Layout and Structure
  - Increased button container width to 90% with max-width of 800px for better space utilization
  - Implemented responsive grid layout for main buttons using CSS Grid with auto-fit
  - Added placeholder for future background customization feature with hover effects
  - Fixed vertical overflow issues with proper positioning and z-indexing
  - Enhanced mobile responsiveness with media queries
  - Added smooth transitions and hover effects for better interactivity
  - Improved typography and spacing for better visual hierarchy 

## 2025-03-25
- Done: Reorganized inventory system and fixed TypeScript configuration
  - Created unified inventory system with equipment slots, items, spell scrolls, ingredients, and potions
  - Fixed TypeScript path aliases for proper module resolution
  - Implemented responsive grid layouts for all inventory sections
  - Added consistent styling and empty state handling 

## 2025-03-25
- Done: Fixed bug where spell scrolls were not removed from inventory after learning a spell. Refactored removeItemFromInventory to use updateWizardInSaveSlot for save slot consistency. 

## 2025-03-25
- Done: Task Group 5: Equipment Slot Overwriting. Implemented robust equip/unequip logic to prevent overwriting equipped items and ensure proper handling of finger slots. Updated docs and process maps accordingly. 

## 2025-03-25
- Done: Changed the market reset timer from 72 hours to 72 minutes. Updated all logic, types, mock data, and documentation to use minutes instead of days for the refresh interval. 