# Wizard's Choice - Project Structure

This document provides an overview of the project structure and organization for the Wizard's Choice game.

## Directory Structure

```
wizard-choice/
├── docs/                    # Documentation files
│   ├── code_review.md       # Code review and best practices
│   ├── deployment_guide.md  # Deployment instructions
│   ├── how_to_play.md       # Game mechanics and instructions
│   ├── requirements.md      # Original requirements and specifications
│   └── technical_documentation.md # Technical architecture and implementation details
├── public/                  # Static assets
│   └── images/              # Game images
│       └── spells/          # Spell card images (placeholders)
├── src/                     # Source code
│   ├── app/                 # Next.js app router pages
│   │   ├── demo/            # Demo page for battle arena
│   │   ├── simplified-demo/ # Simplified demo without 3D rendering
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout component
│   │   └── page.tsx         # Main entry page (home)
│   ├── components/          # Shared React components
│   └── lib/                 # Core game logic and utilities
│       ├── auth/            # Authentication services
│       │   └── authService.ts # User authentication and management
│       ├── combat/          # Combat engine and mechanics
│       │   └── combatEngine.ts # Turn-based combat system
│       ├── equipment/       # Equipment data and utilities
│       │   └── equipmentData.ts # Equipment definitions and effects
│       ├── features/        # Game features
│       │   ├── deckBuilder.ts # Spell deck management
│       │   ├── enemyAI.ts   # AI opponent decision making
│       │   ├── loot/        # Loot system
│       │   │   └── lootSystem.ts # Post-battle rewards
│       │   └── procedural/  # Procedural content generation
│       │       └── enemyGenerator.ts # Dynamic enemy creation
│       ├── game-state/      # Game state management
│       │   └── gameStateStore.ts # Central state management
│       ├── spells/          # Spell data and utilities
│       │   └── spellData.ts # Spell definitions and effects
│       ├── ui/              # UI-specific components and utilities
│       │   ├── components/  # UI components
│       │   │   ├── BattleArena.tsx # Main battle interface
│       │   │   ├── HowToPlay.tsx # Game instructions
│       │   │   ├── MainMenu.tsx # Main menu interface
│       │   │   ├── Settings.tsx # Game settings
│       │   │   ├── SpellCard.tsx # Spell card display
│       │   │   ├── StatusBar.tsx # Health/mana bars
│       │   │   ├── WizardStudy.tsx # Hub area interface
│       │   │   ├── models/  # 3D models
│       │   │   │   └── WizardModel.tsx # Wizard character model
│       │   │   └── scenes/  # 3D scenes
│       │   │       └── BattleScene.tsx # Battle environment
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
- **src/lib/spells/spellData.ts**: Defines all spells and their effects
- **src/lib/equipment/equipmentData.ts**: Defines equipment items and their bonuses
- **src/lib/wizard/wizardUtils.ts**: Handles wizard character creation and progression
- **src/lib/auth/authService.ts**: Manages user authentication and game state persistence

### Game Features

- **src/lib/features/enemyAI.ts**: Controls enemy decision making based on difficulty
- **src/lib/features/deckBuilder.ts**: Manages spell collection and deck building
- **src/lib/features/loot/lootSystem.ts**: Handles post-battle rewards
- **src/lib/features/procedural/enemyGenerator.ts**: Creates enemies scaled to player level

### UI Components

- **src/lib/ui/components/MainMenu.tsx**: Main menu interface
- **src/lib/ui/components/BattleArena.tsx**: Battle screen interface
- **src/lib/ui/components/WizardStudy.tsx**: Hub area for between battles
- **src/lib/ui/components/SpellCard.tsx**: Displays spell information
- **src/lib/ui/components/StatusBar.tsx**: Shows health and mana status
- **src/lib/ui/theme.ts**: Defines color schemes and UI constants

### Pages

- **src/app/page.tsx**: Main entry point with main menu
- **src/app/demo/page.tsx**: 3D battle arena demonstration
- **src/app/simplified-demo/page.tsx**: Simplified battle interface without 3D

### Documentation

- **docs/technical_documentation.md**: Comprehensive technical overview
- **docs/how_to_play.md**: Game mechanics and instructions
- **docs/deployment_guide.md**: Deployment instructions for various platforms
- **docs/code_review.md**: Code review and best practices
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
4. **UI Themes**: Modify appearance in **theme.ts**
5. **Multiplayer**: Game logic is separated from UI for future multiplayer support

## GitHub Repository

The project is hosted on GitHub at:
```
https://github.com/magejosh/wizards-choice
```
