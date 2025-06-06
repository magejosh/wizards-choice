# Wizard's Choice - Project Structure

This document provides an overview of the project structure and organization for the Wizard's Choice game.

## Directory Structure

```
wizard-choice/
├── docs/                    # Documentation files
│   ├── deployment_guide.md  # Deployment instructions
│   ├── high-level-overview.md # High-level overview of the game
│   ├── how_to_play.md       # Game mechanics and instructions
│   ├── process_maps.md      # Process flow diagrams
│   ├── project_structure.md # Project structure documentation
│   ├── requirements.md      # Original requirements and specifications
│   └── technical_documentation.md # Technical architecture and implementation details
├── public/                  # Static assets
│   └── images/              # Game images
│       └── spells/          # Spell card images (placeholders)
├── src/                     # Source code
│   ├── app/                 # Next.js app router pages
│   │   ├── demo/            # Demo page for battle arena
│   │   ├── simplified-demo/ # Simplified demo without 3D rendering
│   │   ├── battle/          # Battle page for dueling system
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout component
│   │   └── page.tsx         # Main entry page (home)
│   ├── components/          # Shared React components
│   │   └── battle/          # Battle components
│   │       ├── BattleArena.tsx       # Main battle interface with UI and 3D canvas
│   │       ├── BattleScene.tsx       # 3D battle scene with wizards and effects
│   │       ├── BattleArena.module.css # Styles for battle arena
│   │       ├── WizardModel.tsx       # 3D wizard character model
│   │       └── effects/              # Visual effect components
│   │           └── SpellEffect3D.tsx # 3D spell effects for different elements
│   │       └── spells/
│   │           ├── SpellTree.tsx           # Interactive spell progression tree component
│   │           ├── SpellTree.module.css    # Styles for spell tree component
│   │           └── SpellDetails.tsx        # Detailed spell information display
│   └── lib/                 # Core game logic and utilities
│       ├── auth/            # Authentication services
│       │   └── authService.ts # User authentication and management
│       ├── combat/          # Combat engine and mechanics
│       │   ├── combatEngine.ts # Turn-based combat system
│       │   └── aiEngine.ts  # AI opponent decision making
│       ├── equipment/       # Equipment data and utilities
│       │   └── equipmentData.ts # Equipment definitions and effects
│       ├── features/        # Game features
│       │   ├── deckBuilder.ts # Spell deck management
│       │   ├── enemyAI.ts   # AI opponent decision making
│       │   ├── loot/        # Loot system
│       │   │   └── lootSystem.ts # Post-battle rewards
│       │   ├── market/      # Market system
│       │   │   ├── marketSystem.ts # Market locations and transactions
│       │   │   └── marketAttacks.ts # Market ambush system
│       │   └── procedural/  # Procedural content generation
│       │       ├── enemyGenerator.ts # Dynamic enemy creation
│       │       ├── ingredientGenerator.ts # Ingredient generation
│       │       └── equipmentGenerator.ts # Equipment generation
│       ├── game-state/      # Game state management
│       │   └── gameStateStore.ts # Central state management
│       ├── spells/          # Spell data and utilities
│       │   └── spellData.ts # Spell definitions and effects
│       ├── ui/              # UI-specific components and utilities
│       │   ├── components/  # UI components
│       │   │   ├── HowToPlay.tsx # Game instructions
│       │   │   ├── MainMenu.tsx # Main menu interface
│       │   │   ├── Settings.tsx # Game settings
│       │   │   ├── SpellCard.tsx # Spell card display
│       │   │   ├── StatusBar.tsx # Health/mana bars
│       │   │   ├── WizardStudy.tsx # Hub area interface
│       │   ├── styles/      # CSS styles
│       │   │   └── main.css # Main stylesheet
│       │   └── theme.ts     # Color themes and styling constants
│       ├── wizard/          # Wizard character logic
│       │   └── wizardUtils.ts # Wizard creation and management
│       └── types.ts         # TypeScript type definitions
└── README.md                # Project overview and getting started
```

## Key Files and Their Purposes

### Core Game Logic

- **src/lib/types.ts**: Central type definitions for the entire application
- **src/lib/game-state/gameStateStore.ts**: Manages game state with save/load functionality
- **src/lib/combat/combatEngine.ts**: Handles turn-based combat mechanics
- **src/lib/combat/aiEngine.ts**: Controls AI decision making for enemies
- **src/lib/spells/spellData.ts**: Defines all spells and their effects
- **src/lib/equipment/equipmentData.ts**: Defines equipment items and their bonuses
- **src/lib/wizard/wizardUtils.ts**: Handles wizard character creation and progression
- **src/lib/auth/authService.ts**: Manages user authentication and game state persistence

### Game Features

- **src/lib/features/enemyAI.ts**: Controls enemy decision making based on difficulty
- **src/lib/features/deckBuilder.ts**: Manages spell collection and deck building
- **src/lib/features/loot/lootSystem.ts**: Handles post-battle rewards
- **src/lib/features/market/marketSystem.ts**: Manages market locations, inventory, and transactions
- **src/lib/features/market/marketAttacks.ts**: Handles market ambush encounters when leaving markets
- **src/lib/features/procedural/enemyGenerator.ts**: Creates enemies scaled to player level
- **src/lib/features/procedural/ingredientGenerator.ts**: Generates ingredients for crafting and markets
- **src/lib/features/procedural/equipmentGenerator.ts**: Creates procedural equipment with random properties

### UI Components

- **src/components/menu/MainMenu.tsx**: Main menu interface
- **src/components/battle/BattleArena.tsx**: Battle screen interface with UI panels
- **src/components/battle/BattleScene.tsx**: 3D battle environment
- **src/components/battle/WizardModel.tsx**: 3D wizard models with animations
- **src/components/battle/effects/SpellEffect3D.tsx**: Dynamic 3D spell effects
- **src/lib/ui/components/WizardStudy.tsx**: Hub area for between battles
- **src/lib/ui/components/MarketUI.tsx**: Interface for buying and selling items
- **src/components/ui/SpellCard.tsx**: Displays spell information
- **src/lib/ui/components/StatusBar.tsx**: Shows health and mana status
- **src/lib/ui/theme.ts**: Defines color schemes and UI constants

### Pages

- **src/app/page.tsx**: Main entry point with main menu
- **src/app/battle/page.tsx**: Battle page with combat system
- **src/app/demo/page.tsx**: 3D battle arena demonstration
- **src/app/simplified-demo/page.tsx**: Simplified battle interface without 3D

### Documentation

- **docs/technical_documentation.md**: Comprehensive technical overview
- **docs/how_to_play.md**: Game mechanics and instructions
- **docs/deployment_guide.md**: Deployment instructions for various platforms
- **docs/high-level-overview.md**: High-level overview of the game
- **docs/process_maps.md**: Process flow diagrams
- **docs/project_structure.md**: Project structure documentation
- **docs/requirements.md**: Original requirements and specifications
- **README.md**: Project overview and getting started guide

## Development Workflow

1. Start with the main menu (**src/app/page.tsx**)
2. Navigate to battle arena or wizard's study
3. Game state is managed through **gameStateStore.ts**
4. Combat is handled by **combatEngine.ts**
5. User authentication and save data through **authService.ts**

## Extension Points

The codebase is designed with these key extension points:

1. **Spell System**: Add new spells in **spellData.ts**
2. **Equipment**: Add new items in **equipmentData.ts**
3. **Enemy Types**: Extend enemy generation in **enemyGenerator.ts**
4. **Market System**: Add new markets or modify existing ones in **marketSystem.ts**
5. **UI Themes**: Modify appearance in **theme.ts**
6. **3D Effects**: Add new visual effects in **SpellEffect3D.tsx**
7. **Multiplayer**: Game logic is separated from UI for future multiplayer support

## GitHub Repository

The project is hosted on GitHub at:
```
https://github.com/magejosh/wizards-choice
```

## Spell System

### Spell System
- **All spell data is now defined in XML format as per [/docs/spell_data_format.md](./spell_data_format.md).**
- The spell data XML file is always located at `/public/data/spell_data.xml` in the project and loaded at runtime from `/data/spell_data.xml` (the URL path). There is only one file; the `/public` directory is served as the web root.
- See the [Spell Data Workflow process map](./process_maps.md#spell-data-workflow) for the full lifecycle.

```
src/
├── components/
│   └── spells/
│       ├── SpellTree.tsx           # Interactive spell progression tree component
│       ├── SpellTree.module.css    # Styles for spell tree component
│       └── SpellDetails.tsx        # Detailed spell information display
├── lib/
│   └── spells/
│       ├── spellTree.ts           # Spell tree data structures and logic
│       ├── spellTreeLayout.ts     # Node positioning and connection logic
│       └── spells.ts              # Core spell definitions and utilities
└── app/
    └── spell-tree/
        ├── page.tsx               # Spell tree page component
        └── page.module.css        # Styles for spell tree page
```

### Spell Tree System
- **Components**
  - `SpellTree.tsx`: Main component for rendering the interactive spell progression tree
  - `SpellDetails.tsx`: Displays detailed information about selected spells
  - `SpellTree.module.css`: Styles for the spell tree visualization

- **Logic**
  - `spellTree.ts`: Core data structures and tree management logic
  - `spellTreeLayout.ts`: Handles node positioning and connection generation
  - `spells.ts`: Spell definitions and utility functions

- **Pages**
  - `spell-tree/page.tsx`: Main page component for the spell tree interface
  - `spell-tree/page.module.css`: Styles for the spell tree page
