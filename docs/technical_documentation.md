# Wizard's Choice - Technical Documentation

## Table of Contents
1. [Introduction](#introduction)
2. [Architecture Overview](#architecture-overview)
3. [Code Structure](#code-structure)
4. [Authentication System](#authentication-system)
5. [Game State Management](#game-state-management)
6. [Spell System](#spell-system)
7. [Spell Scroll System](#spell-scroll-system)
8. [Combat Engine](#combat-engine)
9. [Combat Utilities](#combat-utilities)
10. [3D Battle System](#3d-battle-system)
11. [Equipment System](#equipment-system)
12. [Inventory System](#inventory-system)
13. [UI Components](#ui-components)
14. [Best Practices](#best-practices)
15. [Deployment Guide](#deployment-guide)
16. [Admin Guide](#admin-guide)
17. [Future Development](#future-development)
18. [Market System](#market-system)
19. [Market Attack System](#market-attack-system)
20. [Spell Progression Tech Tree System](#spell-progression-tech-tree-system)

## Introduction

Wizard's Choice is a tactical choice-based strategy game where players engage in wizard duels through strategic spell selection. This document provides comprehensive technical documentation for developers working on the codebase.

## Architecture Overview

The game is built using Next.js with React for the frontend and uses ThreeJS for 3D visualizations. The architecture follows these key principles:

1. **Separation of Concerns**: Game logic is separated from UI rendering to facilitate future multiplayer expansion.
2. **State Management**: Game state is managed through a centralized store with persistence capabilities.
3. **Modular Design**: Components and features are organized into logical modules for maintainability.
4. **Type Safety**: TypeScript is used throughout to ensure type safety and improve developer experience.

## Code Structure

The codebase is organized as follows:

```
wizard-choice/
├── docs/                    # Documentation files
├── public/                  # Static assets
│   └── images/              # Game images including spell cards
├── src/                     # Source code
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Shared React components
│   └── lib/                 # Core game logic and utilities
│       ├── auth/            # Authentication services
│       ├── combat/          # Combat engine and mechanics
│       ├── equipment/       # Equipment data and utilities
│       ├── features/        # Game features (AI, procedural generation, etc.)
│       ├── game-state/      # Game state management
│       ├── spells/          # Spell data and utilities
│       ├── ui/              # UI-specific components and utilities
│       └── wizard/          # Wizard character logic
```

## Authentication System

The authentication system provides user management with login, registration, and admin capabilities. For development, it uses IndexedDB for persistent storage with demo accounts.

### Demo Accounts
- Admin: username: `admin`, password: `admin123`
- Player 1: username: `player1`, password: `player123`
- Player 2: username: `player2`, password: `player123`

### Key Features
- User registration and login with secure password hashing (bcryptjs)
- Persistent game state storage in IndexedDB tied to user accounts
- Admin functionality for user management
- Client-side compatibility with Next.js server-side rendering
- Proper loading states and error handling

### Best Practices
- **AXIOM 1**: All passwords are properly hashed using bcryptjs with a salt factor of 10.
- **AXIOM 2**: Separate authentication logic from game logic for better security boundaries.
- **AXIOM 3**: Always validate user input on both client and server sides.
- **AXIOM 4**: Check for browser API availability with `typeof window !== 'undefined'` for Next.js compatibility.

## Game State Management (update)

- Game state now tracks all four stat fields for each wizard:
  - baseMaxHealth, progressionMaxHealth, equipmentMaxHealth, totalMaxHealth
  - baseMaxMana, progressionMaxMana, equipmentMaxMana, totalMaxMana
- Stat recalculation is triggered automatically after equipment or inventory changes, and after spending level-up points.
- Only totalMaxHealth/totalMaxMana are used for display and combat logic.

## Spell System

The spell system is designed to be extensible and balanced, with 10 tiers of spells (expandable to 120 spells).

**Authoritative Spell Data Format:**
- All spells are now defined in XML format as specified in [/docs/spell_data_format.md](./spell_data_format.md).
- The XML schema covers all spell fields, effects, rarity, and list membership (archetype, creature, or 'any').
- The spell data XML file is always located at `/public/data/spell_data.xml` in the project and loaded at runtime from `/data/spell_data.xml` (the URL path). There is only one file; the `/public` directory is served as the web root.
- See the [Spell Data Workflow process map](./process_maps.md#spell-data-workflow) for the full lifecycle from creation to runtime loading.

### Key Features
- Spell tiers with increasing power and complexity
- Elemental types with strategic advantages
- Mana cost scaling based on spell power
- Spell synergies for strategic depth

### Best Practices
- **AXIOM 8**: Balance spell power through a combination of mana cost, damage, and effects.
- **AXIOM 9**: Design spells in sets with complementary effects to encourage strategic combinations.
- **AXIOM 10**: Maintain clear documentation of spell effects and interactions for future expansion.

### Spell Cache Invalidation
- After editing and saving spells (via the CMX or any tool), the in-memory spell cache must be cleared using the `clearSpellCache` function from `src/lib/spells/spellData.ts`.
- This ensures the game reloads the latest spell data from the XML file and displays all updates immediately.
- The CMX now calls this automatically after a successful save.

## Spell Scroll System

The spell scroll system provides an alternative method for players to acquire and use spells beyond the standard deck-building mechanics.

### Key Features
- Spell scrolls can be found as loot from defeated enemies or purchased in markets
- Scrolls contain a single spell of varying rarity
- Players can use scrolls in two ways:
  - In the Wizard's Study to permanently learn the spell
  - In battle for a one-time casting without mana cost
- Different scroll rarities based on the enclosed spell's tier

### Implementation Details
- **Spell scrolls are NOT procedurally generated as equipment.** Instead, scrolls are generated from the set of spells loaded in the game, with random selection and tier/rarity logic. The scroll generator creates a scroll for a specific spell, not as a random equipment item.
- Market scroll availability depends on market specialization and level
- Scrolls for rare or powerful spells have correspondingly lower drop rates
- The system integrates with both the loot system and market system
- UI interfaces for both study and battle scroll usage

### Best Practices
- **AXIOM 35**: Ensure scroll rarity aligns with the enclosed spell's power level.
- **AXIOM 36**: Provide clear feedback when using scrolls in different contexts.
- **AXIOM 37**: Balance scroll acquisition rates to maintain game progression curve.
- **AXIOM 38**: Store scrolls in the player's inventory using a type-safe approach.

## Combat Engine

The combat engine handles turn-based duels between wizards with card-based gameplay mechanics for a strategic experience. The system is designed to be extensible and support complex interactions between spells, effects, and abilities.

### Key Features

1. **Deck-Based Combat System**
   - Players and enemies use decks of spells for combat
   - Draw pile, hand, and discard pile mechanics similar to deck-building games
   - Initial hand of 3 cards drawn at the start of combat
   - Hand refilled to 3 cards at the start of each round
   - Empty draw piles automatically reshuffle the discard pile

2. **Turn Management**
   - Clear separation between player and enemy turns
   - Round-based structure with incrementing counter
   - Turn actions: cast spell, use mystic punch, skip turn, use scroll
   - Animations and visual cues to indicate current turn state

3. **Spell Casting and Effects**
   - Mana cost verification before spell casting
   - Automatic spell discard after casting
   - Support for various spell types (attack, healing, buff, debuff)
   - Elemental damage calculation with resistances and weaknesses

4. **Active Effects System**
   - Implementation of status effects that persist across turns
   - Effect types: damage over time, healing over time, mana drain, mana regen
   - Duration tracking with automatic decrement at end of rounds
   - Removal of expired effects

5. **Mana Management**
   - Mana cost for spell casting
   - Mana regeneration at the end of each round
   - Maximum mana cap based on wizard stats and equipment

6. **Health Tracking**
   - Damage application with elemental modifiers
   - Healing effects with wizard stat bonuses
   - Victory/defeat detection based on health values

7. **Battle Log**
   - Comprehensive logging of all combat actions
   - Clear text descriptions of spell effects, damage, healing
   - Visual highlighting of important battle events

8. **Mystic Punch Mechanic**
   - Basic attack option that requires no mana
   - Consistent damage output as a fallback option
   - Strategic alternative when spell options are limited

### Core Combat Engine Functions

1. **`initializeCombat`**: Sets up the initial combat state with player and enemy wizards
2. **`drawSpells`**: Draws a specified number of spells from the draw pile to hand
3. **`discardSpell`**: Moves a spell from hand to discard pile
4. **`executeSpell`**: Processes spell casting including mana cost and effects
5. **`executeMysticPunch`**: Handles the basic attack option
6. **`addActiveEffect`**: Applies status effects to a target
7. **`applyActiveEffects`**: Processes active effects at the start of a turn
8. **`decrementActiveEffects`**: Reduces the duration of active effects
9. **`checkActiveEffects`**: Removes expired effects
10. **`regenerateMana`**: Handles mana regeneration between rounds
11. **`checkBattleEnd`**: Determines if victory or defeat conditions are met

### AI System

Enemy wizards utilize a sophisticated AI system with three distinct strategies:

1. **Defensive Strategy**: Prioritizes healing and buffs when health is low, with selective use of damage spells.
2. **Aggressive Strategy**: Focuses on high-damage spells and debuffs, with minimal health management.
3. **Balanced Strategy**: Adaptively chooses spells based on the combat situation, with a mix of all spell types.

The AI decision-making process implemented in `getAISpellSelection` evaluates the current combat state to choose the most appropriate spell based on:
- Available mana
- Current health percentage
- Available spell types
- Elemental advantages against the player

### Battle State Management

The combat engine maintains a comprehensive `CombatState` object that tracks:
- Player and enemy wizard stats, hands, and decks
- Active effects on both combatants
- Current turn and round information
- Battle status (active, playerWon, enemyWon)

This state is passed between components and updated immutably to ensure consistent game state.

### Best Practices
- **AXIOM 11**: Separate combat logic from visual effects for cleaner code and easier testing.
- **AXIOM 12**: Implement AI difficulty levels through strategy patterns rather than hardcoded behaviors.
- **AXIOM 13**: Use event-based systems for combat effects to allow for extensibility.
- **AXIOM 47**: Always create new state objects rather than mutating existing state to maintain immutability.
- **AXIOM 48**: Implement clear type definitions for all combat-related structures and functions.
- **AXIOM 49**: Balance deck mechanics to ensure players always have meaningful choices.
- **AXIOM 50**: Use pure functions for combat calculations to facilitate testing and debugging.

## Combat Utilities

The combat utility system provides reusable functions for damage and healing calculations, ensuring consistent and balanced combat mechanics. These utilities are isolated from the main combat engine to promote maintainability and testability.

### Key Utilities

1. **Damage Calculation**
   - `calculateDamage`: Computes final damage based on spell power, caster stats, and target defenses
   - Includes random variance (±20%) for unpredictability
   - Applies elemental strengths and weaknesses (50% bonus damage / 33% reduction)
   - Factors in equipment damage bonuses
   - Applies defensive stat reductions

2. **Healing Calculation**
   - `calculateHealing`: Determines healing amount based on spell power and caster stats
   - Includes slight random variance (±10%)
   - Applies healing bonuses from equipment or effects

3. **Critical Hit System**
   - `calculateCritical`: Determines if an attack is a critical hit
   - Uses wizard's critical chance stat (default 10%)
   - Doubles damage on successful critical hits

4. **Spell Validation**
   - `canCastSpell`: Checks if a spell can be cast based on mana requirements
   - Validates other potential casting restrictions

5. **Random Utilities**
   - `getRandomInt`: Generates random integers within a range
   - `getRandomFloat`: Generates random floating-point numbers
   - `getRandomItem`: Selects a random item from an array
   - `shuffleArray`: Randomizes array elements using Fisher-Yates algorithm
   - `randomChance`: Provides true/false based on probability

### Implementation

The combat utilities are implemented as pure functions in dedicated utility files:
- `combatUtils.ts`: Contains damage, healing, and validation functions
- `randomUtils.ts`: Provides randomization functions for combat variance

### Best Practices
- **AXIOM 51**: Use deterministic calculation formulas for predictable balance testing.
- **AXIOM 52**: Maintain separate utility functions for each combat calculation type.
- **AXIOM 53**: Implement bounds checking to prevent negative or invalid values.
- **AXIOM 54**: Document calculation formulas clearly to aid future balance adjustments.
- **AXIOM 55**: Use TypeScript for strong typing of all parameters and return values.

## 3D Battle System

The battle system provides an immersive 3D experience using Three.js via React Three Fiber.

### Components
1. **BattleArena**: The main container component that combines the 3D battle canvas with UI elements.
   - Manages player and enemy information displays
   - Renders the spell hand interface for player choices
   - Displays the battle log with action history
   - Provides action buttons (Mystic Punch, Skip Turn)
   - Handles victory/defeat conditions with appropriate UI
   - Manages animations and state transitions

2. **BattleScene**: Manages the overall 3D scene, including lighting, environment, and camera.
   - Handles the arrangement of wizards in 3D space
   - Coordinates visual effects based on combat log entries
   - Renders floating damage/healing numbers
   - Displays turn indicators and status information
   - Integrates environment elements (battle platform, stars, lighting)

3. **WizardModel**: Renders 3D wizard models with health bars and animations.
   - Creates stylized 3D wizard models with robes, hats, and staffs
   - Implements hover animations for active wizards
   - Renders dynamic health bars with color-coded health percentages
   - Provides visual feedback for wizard state (active, damaged, etc.)
   - Orients wizards to face each other in the battle arena

4. **SpellEffect3D**: Creates dynamic spell effects based on spell type and element.
   - Renders unique 3D effects for different spell types:
     - Attack spells: Projectiles with particle trails
     - Defense spells: Shield-like barriers
     - Healing spells: Glowing restorative effects
     - Utility spells: Specialized visual indicators
   - Adapts colors and particles based on spell element
   - Handles effect lifetime and animation
   - Creates particle systems for magical effects

### Key Features
- **Real-time Animations**: Wizards and spells animate based on battle state and actions.
- **Element-based Effects**: Spell effects are visually distinct based on their elemental type.
- **Visual Feedback**: Damage and healing numbers appear and float upward for clear feedback.
- **Health Visualization**: Health bars dynamically update with color coding for remaining health.
- **Turn Indicators**: Visual cues show which wizard is actively taking their turn.
- **Responsive Integration**: Seamless integration between 3D visuals and 2D UI elements.
- **Battle Log**: Detailed action history with formatting based on action types.
- **Spell Card Interface**: Interactive spell cards for player selection.

### Technical Implementation
- Three.js is used for 3D rendering through React Three Fiber
- useFrame hook manages animations and effect lifetimes
- Component-based architecture for reusable 3D elements
- GPU-accelerated particle effects for spell casting
- Dynamic lighting and environment settings
- React state management for synchronizing UI with 3D elements
- CSS modules for styling UI components
- Canvas integration for rendering the 3D scene within the UI layout

### Design Patterns
- **Component Composition**: Building complex visuals from simpler components
- **Props-based Configuration**: Configuring visual appearance through props
- **React Hooks for Animation**: Using useFrame and useRef for managing animations
- **Event-based Effects**: Triggering visual effects in response to combat events
- **Responsive Layout**: Adapting to different screen sizes while maintaining visual quality

### Best Practices
- **AXIOM 31**: Batch 3D model updates to minimize render calls and optimize performance.
- **AXIOM 32**: Use instanced meshes for particle effects to improve rendering efficiency.
- **AXIOM 33**: Implement proper cleanup for 3D effects to prevent memory leaks.
- **AXIOM 34**: Scale visual complexity based on device performance capabilities.
- **AXIOM 43**: Maintain clear separation between combat logic and visual effects.
- **AXIOM 44**: Implement graceful fallbacks for older devices that may struggle with 3D rendering.
- **AXIOM 45**: Use consistent color themes and visual language across all spell effects.
- **AXIOM 46**: Design visual effects to communicate gameplay information (damage type, effect strength).

## Hex Grid System

The battle arena uses a hexagonal grid as the basis for future tactical movement mechanics. The grid is generated in `HexGrid.tsx` and all entity positions are aligned to hex centers using utilities from `src/lib/utils/hexUtils.ts`.

### Key Points
1. Hex tiles use axial coordinates `(q, r)` with pointy-top orientation.
2. `axialToWorld()` converts a tile coordinate to a Three.js world position.
3. `snapToHexCenter()` snaps any world position to the nearest hex center for consistent placement.
4. Player and enemy wizards start at `(-2, 0)` and `(2, 0)` respectively, leaving three empty tiles between them.

This grid forms the foundation for a tactical movement system planned for future updates. All movement and range calculations will operate on these axial coordinates.

## Equipment System

The equipment system allows players to customize their wizard with:

1. Wands (affecting spell power and mana regeneration)
2. Robes (affecting health and damage reduction)
3. Amulets (providing special abilities)
4. Rings (offering passive bonuses)

### Stat Calculation and Progression Model

Wizard stats are now calculated using a robust, modular structure:

- **baseMaxHealth/baseMaxMana**: The true base stat, only changed by rare effects or admin tools.
- **progressionMaxHealth/progressionMaxMana**: Permanent upgrades from level-ups, quests, or other progression sources. Increased by spending level-up points.
- **equipmentMaxHealth/equipmentMaxMana**: The sum of all currently equipped item bonuses. Updated automatically when equipment is equipped or unequipped.
- **totalMaxHealth/totalMaxMana**: The sum of all the above. This is the value used for display in the UI and for all combat calculations.

**Stat Calculation Flow:**
- When a wizard is created or loaded, all four stat fields are initialized.
- When level-up points are spent, only progressionMaxHealth/progressionMaxMana are increased.
- When equipment is equipped or unequipped, only equipmentMaxHealth/equipmentMaxMana are recalculated.
- The totalMaxHealth/totalMaxMana is always recalculated as:
  
  `totalMaxHealth = baseMaxHealth + progressionMaxHealth + equipmentMaxHealth`
  `totalMaxMana = baseMaxMana + progressionMaxMana + equipmentMaxMana`

- Deprecated fields (maxHealth, maxMana) are set to totalMaxHealth/totalMaxMana for compatibility, but should not be mutated directly.

### Best Practices (updated)
- **AXIOM 14**: Design equipment bonuses to complement different play styles rather than having clear "best" items.
- **AXIOM 15**: Implement equipment as composable modifiers to wizard stats for flexibility. All equipment bonuses are summed into equipmentMaxHealth/equipmentMaxMana.
- **AXIOM 16**: Balance equipment bonuses against progression to maintain game challenge.

- **All equipment (robes, belts, etc.) is procedurally generated using the equipment generator.**
- **Spell scrolls are not generated as equipment and are not part of the procedural equipment system.**

## Equipment Slot Overwriting Prevention

The equipment system ensures that when a player equips an item, any item already occupying the target slot is first moved back to the player's inventory before the new item is equipped. This prevents accidental overwriting and loss of equipped items.

Special handling is implemented for 'finger' slots (rings):
- The player has two ring slots, `finger1` and `finger2`.
- When equipping a ring, the system checks for an empty slot. If both are filled, the first slot (`finger1`) is replaced, and the previously equipped ring is returned to inventory.
- Unequipping a ring requires specifying which slot to remove from.

This logic is implemented in both the state management (wizardModule.ts) and the UI (EquipmentScreen.tsx), ensuring robust and consistent behavior.

For a visual overview, see the process map in [process_maps.md](process_maps.md#equipment-slot-handling-process).

## Inventory System

The inventory system provides a unified interface for managing all player items, equipment, spell scrolls, ingredients, and potions.

### Key Features
- Tabbed interface for different inventory sections
- Equipment slots with visual feedback
- Grid-based layout for items, scrolls, ingredients, and potions
- Consistent styling and empty state handling
- Responsive design for all screen sizes

### Implementation Details
- Located in `src/components/inventory/`
- Components:
  - `Inventory.tsx`: Main container with tab management
  - `EquipmentSlots.tsx`: Equipment slot display and management
  - `ItemGrid.tsx`: General item inventory display
  - `SpellScrolls.tsx`: Spell scroll management
  - `Ingredients.tsx`: Ingredient storage and usage
  - `Potions.tsx`: Potion management

### Best Practices
- **AXIOM 39**: Use consistent styling across all inventory sections for better UX
- **AXIOM 40**: Implement responsive grid layouts that adapt to screen size
- **AXIOM 41**: Provide clear visual feedback for item interactions
- **AXIOM 42**: Handle empty states gracefully with informative messages
- **AXIOM 43**: Use TypeScript for type-safe inventory management

## UI Components

UI components are built with React and styled for a responsive, engaging experience.

### Key Components
- Main Menu
- Battle Arena
- Wizard's Study
- Spell Cards
- Deck Builder
- Status Bars
- Settings Panel

### Wizard's Study
The Wizard's Study serves as the main hub for the game, providing:
- Responsive grid layout for main action buttons
- 90% width container with 800px max-width for optimal space utilization
- Background customization placeholder with hover effects
- Proper z-indexing and overflow handling
- Mobile-responsive design with adaptive layout
- Smooth transitions and hover effects
- Improved typography and visual hierarchy
- Organized action groups with clear hierarchy

### Deck Builder
The deck builder provides an intuitive interface for managing spells with:
- Filtering by spell type and element
- Sorting by various attributes (mana cost, tier, etc.)
- Visual indication of equipped spells with slot numbers
- Minimum of five spells required per deck
- Immediate feedback on spell selection and equipment
- Responsive layout adapting to different screen sizes

#### Deck Management System
The deck management system allows players to:
- Create multiple named decks for different strategies
- Save and load decks
- Equip a specific deck for combat
- Delete unwanted decks
- View all spells in their collection
- Track which deck is currently active
- Automatically save deck changes to persistent storage

#### Draw Mechanics
The deck system uses a discard pile mechanic:
- When a spell is cast, it goes to the discard pile
- Cards in the discard pile remain there until after the next draw step
- At the end of the draw step, cards in the discard pile are shuffled back into the deck
- Players and enemies then cast their first spell of the turn

Each deck requires a minimum of 5 spells to ensure the player maintains sufficient spell options throughout combat. Players start with a "Starter Deck" containing their first 5 spells, and can customize their decks as they collect more spells throughout the game.

### Best Practices
- **AXIOM 17**: Use the 'use client' directive for all components that use client-side hooks or interactivity.
- **AXIOM 18**: Break down complex components into smaller, focused components for better maintainability.
- **AXIOM 19**: Implement responsive design principles for all UI components.
- **AXIOM 20**: Separate styling concerns from component logic using CSS modules or styled components.

## Best Practices

### Code Organization
- **AXIOM 21**: Keep files focused on a single responsibility; break out functions when they grow beyond 50-100 lines.
- **AXIOM 22**: Use TypeScript interfaces to define clear contracts between components.
- **AXIOM 23**: Implement proper error handling throughout the application.
- **AXIOM 24**: Write unit tests for core game logic to ensure stability during development.

### Performance
- **AXIOM 25**: Optimize 3D rendering by using proper LOD (Level of Detail) techniques.
- **AXIOM 26**: Implement memoization for expensive calculations in the game logic.
- **AXIOM 27**: Use React's useMemo and useCallback hooks appropriately to prevent unnecessary re-renders.

### Accessibility
- **AXIOM 28**: Ensure proper color contrast for text and UI elements.
- **AXIOM 29**: Implement keyboard navigation for all interactive elements.
- **AXIOM 30**: Provide alternative text for images and visual elements.

## Deployment Guide

### Local Development
1. Clone the repository
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`
4. Access the application at `http://localhost:3000`

### Production Deployment

#### Netlify
1. Connect your GitHub repository to Netlify
2. Set the build command to `npm run build`
3. Set the publish directory to `.next`
4. Deploy the site

#### Vercel
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect Next.js settings
3. Deploy the site

#### Hostinger VPS
1. SSH into your VPS
2. Clone the repository
3. Install dependencies with `npm install`
4. Build the application with `npm run build`
5. Install PM2 with `npm install -g pm2`
6. Start the application with `pm2 start npm -- start`
7. Configure Nginx as a reverse proxy to the Next.js application

## Admin Guide

As an admin, you have access to additional functionality for managing the game:

1. **User Management**: View all registered users
2. **Password Reset**: Reset passwords for any user
3. **Game State Inspection**: View and modify game states for debugging

To access admin features:
1. Log in with the admin account (username: `admin`, password: `admin123`)
2. Navigate to the admin panel through the settings menu

## Future Development

The codebase is designed to be extensible for future features:

### Multiplayer Implementation
- The separation of game logic from UI facilitates adding multiplayer functionality
- The authentication system is ready for expansion to handle online users
- Combat engine can be extended to support player vs. player duels

### Content Expansion
- The spell system can be expanded to include all 120 planned spells
- Additional equipment items can be added to the equipment system
- New enemy wizards and creatures can be added to the procedural generation system

### Technical Improvements
- Implement server-side rendering for improved performance
- Add comprehensive test coverage
- Integrate with a proper database for production use

## Market System

The market system provides an economic component to the game where players can trade resources and acquire new items.

### Key Features
- Multiple market locations with progressive level unlocks (1-1000)
- Market specializations (ingredients, potions, equipment, scrolls)
- Dynamic supply and demand affecting prices
- Reputation system influencing player-specific pricing
- Inventory refresh cycles varying by market tier
- Buy and sell interface for all item types

### Market Locations
The game features 13 unique market locations, each with specific unlock requirements:
1. **Novice Bazaar** (Level 1) - General market with basic supplies
2. **Herbalist's Haven** (Level 5) - Specializes in ingredients
3. **Arcane Emporium** (Level 10) - Specializes in equipment
4. **Alchemist's Square** (Level 15) - Specializes in potions
5. **Spellcaster's Exchange** (Level 20) - Specializes in scrolls
6. **Ethereal Bazaar** (Level 25) - Advanced ingredients market
7. **Enchanter's Workshop** (Level 50) - Advanced equipment market
8. **Celestial Apothecary** (Level 75) - Advanced potions market
9. **Archmage's Repository** (Level 100) - Advanced scrolls market
10. **Elemental Nexus** (Level 150) - Rare ingredients market
11. **Temporal Auction House** (Level 250) - Rare equipment market
12. **Philosopher's Emporium** (Level 500) - Rare potions market
13. **Cosmic Library** (Level 1000) - Rare scrolls market

Higher-level markets have higher price multipliers but offer rarer items and better quality.

### Market UI Component

The `MarketUI` component (`src/lib/ui/components/MarketUI.tsx`) provides the user interface for interacting with markets, featuring:

- Selection of available markets based on player level
- Tabbed interface for different item categories (ingredients, potions, equipment)
- Buy/sell toggle for different transaction modes
- Item card display with rarity-coded styling
- Transaction panel for quantity selection and price calculation
- Dynamic gold and inventory updates

#### State Management

The MarketUI component follows React best practices for state management:

- Uses React `useState` hooks for component-specific state
- Implements `useEffect` for data fetching and initialization
- Defers state updates to avoid React rendering errors
- Maintains separation between store data and component-specific state

Key optimizations:
- Market data is fetched and stored in component state instead of being accessed directly from the store during render
- All market operations (buying, selling, refreshing) update local state after completion
- Quantity selection is properly bounded by available item counts
- State updates are batched when appropriate

### Game State Store Integration

The market system interacts with the game state store through these key functions:

- `getMarkets`: Retrieves all available markets with proper state initialization
- `getMarketById`: Finds a specific market by ID
- `visitMarket`: Records market visits and updates current location
- `refreshMarket`: Updates market inventory with new items
- `buyItem`: Handles purchase transactions with proper validation
- `sellItem`: Handles sale transactions with validation
- `getPlayerGold`: Retrieves current gold amount
- `updatePlayerGold`: Updates gold after transactions

#### Optimized State Updates

The `getMarkets` function in `gameStateStore.ts` is optimized to prevent state updates during component rendering:

```typescript
getMarkets: () => {
  const { gameState } = get();
  
  // Ensure markets array exists
  if (!gameState.markets || !Array.isArray(gameState.markets)) {
    // Don't update state during render - schedule it for the next tick
    setTimeout(() => {
      set({
        gameState: {
          ...get().gameState,
          markets: []
        }
      });
    }, 0);
    return [];
  }
  
  // Process market updates as needed
  const updatedMarkets = /* market processing logic */;
  
  // Defer state updates to avoid React render-time state mutations
  if (marketsNeedUpdate) {
    setTimeout(() => {
      set({
        gameState: {
          ...get().gameState,
          markets: updatedMarkets
        }
      });
    }, 0);
  }
  
  return gameState.markets;
}
```

### Best Practices
- **AXIOM 39**: Balance attack frequency to add tension without excessive frustration
- **AXIOM 40**: Scale rewards appropriately with risk (higher level market attackers provide better rewards)
- **AXIOM 41**: Ensure UI clearly communicates the risk/reward decision to players
- **AXIOM 42**: Implement proper state transitions between market, battle, and wizard study
- **AXIOM 56**: Never update state during component rendering; defer updates using setTimeout or useEffect
- **AXIOM 57**: Initialize component-specific state from store data rather than accessing store directly in render
- **AXIOM 58**: Implement proper error boundaries around market components to prevent crashes

## Market Attack System

The market attack system adds risk and reward to market visits, creating encounters when players leave markets.

### Key Features
- Random chance of market attacks based on market level and game difficulty
- Specialized bandit/thief enemies tailored to player level
- Attack chance scaled by market level (higher level markets are more dangerous)
- Player option to fight or attempt to flee
- Gold loss when defeated or failing to flee
- Rare ingredient rewards for defeating market attackers

### Implementation Details
- Attack chance calculation: Base chance + (Market Level × Scaling Factor)
- Difficulty modifiers: Easy (50% less chance), Hard (50% more chance)
- Flee mechanic: 50% success rate
- Gold loss: 10-20% of current gold when defeated
- Rewards: 2-5 ingredients with rarity based on attacker level

### Best Practices
- **AXIOM 39**: Balance attack frequency to add tension without excessive frustration
- **AXIOM 40**: Scale rewards appropriately with risk (higher level market attackers provide better rewards)
- **AXIOM 41**: Ensure UI clearly communicates the risk/reward decision to players
- **AXIOM 42**: Implement proper state transitions between market, battle, and wizard study

## Spell Progression Tech Tree System

### Components

#### SpellTree Component
- Location: `src/components/spells/SpellTree.tsx`
- Purpose: Renders the interactive spell progression tree
- Features:
  - Zoom and pan functionality
  - Node connection visualization
  - Interactive node unlocking
  - Tooltip display for locked nodes
  - Unlocking animations
  - Responsive layout

#### SpellTreeLayout
- Location: `src/lib/spells/spellTreeLayout.ts`
- Purpose: Handles the positioning and connection logic for spell nodes
- Features:
  - Radial layout calculation
  - Connection path generation
  - Node positioning optimization
  - Tier-based spacing

#### SpellTree Data Structure
- Location: `src/lib/spells/spellTree.ts`
- Purpose: Manages the spell tree state and logic
- Features:
  - Node and connection data structures
  - Unlocking validation
  - Point system management
  - State persistence

### Data Structures

```