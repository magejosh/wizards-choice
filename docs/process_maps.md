# Wizard's Choice - Process Maps

This document contains process maps for the Wizard's Choice game, visualizing the main components, interactions, and game flow.

## Component Structure

```mermaid
graph TD
    A[Main Entry] --> B[GameManager]
    B --> C[SpellSystem]
    B --> D[UIManager]
    B --> E[SceneManager]
    B --> F[AudioManager]
    B --> G[ProgressionSystem]
    
    C --> C1[Spell Definitions]
    C --> C2[Spell Hand Management]
    C --> C3[Progression Tracking]
    
    D --> D1[Screen Management]
    D --> D2[UI Elements]
    D --> D3[Event Listeners]
    
    E --> E1[ThreeJS Scene]
    E --> E2[Visual Effects]
    E --> E3[Animation System]
    
    F --> F1[Sound Effects]
    F --> F2[Music]
    F --> F3[Volume Control]
    
    G --> G1[Level System]
    G --> G2[Experience Points]
    G --> G3[Unlock Mechanics]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bfb,stroke:#333,stroke-width:2px
    style D fill:#bfb,stroke:#333,stroke-width:2px
    style E fill:#bfb,stroke:#333,stroke-width:2px
    style F fill:#bfb,stroke:#333,stroke-width:2px
    style G fill:#bfb,stroke:#333,stroke-width:2px
```

## Game Initialization Process

```mermaid
sequenceDiagram
    participant Main as main.js
    participant GM as GameManager
    participant UI as UIManager
    participant SS as SpellSystem
    participant PS as ProgressionSystem
    participant SM as SceneManager
    participant AM as AudioManager
    
    Main->>GM: new GameManager()
    Main->>UI: new UIManager()
    Main->>SM: new SceneManager()
    Main->>SS: new SpellSystem()
    Main->>AM: new AudioManager()
    Main->>PS: new ProgressionSystem(spellSystem)
    
    Main->>GM: init(uiManager, sceneManager, spellSystem, audioManager, progressionSystem)
    Main->>UI: showScreen('loading-screen')
    
    par Initialize Assets
        Main->>SM: init()
        Main->>SS: init()
        Main->>AM: init()
    end
    
    Main->>PS: init(spellSystem)
    Main->>UI: hideScreen('loading-screen')
    Main->>UI: showScreen('main-menu')
    
    Main->>Main: Setup event listeners
    Note over Main: Game ready to play
```

## Game Loop Process

```mermaid
stateDiagram-v2
    [*] --> MainMenu
    MainMenu --> SpellSelection: Start New Game
    SpellSelection --> Battle: Select Spells
    Battle --> PlayerTurn: Start Battle
    
    state PlayerTurn {
        [*] --> SelectSpell
        SelectSpell --> CastSpell: Select Spell
        CastSpell --> ApplyEffects: Cast Spell
        ApplyEffects --> [*]: End Turn
    }
    
    state OpponentTurn {
        [*] --> AISelectSpell
        AISelectSpell --> AICastSpell: AI Selects Spell
        AICastSpell --> AIApplyEffects: Cast Spell
        AIApplyEffects --> [*]: End Turn
    }
    
    PlayerTurn --> CheckBattleEnd: End Turn
    CheckBattleEnd --> OpponentTurn: Battle Continues
    OpponentTurn --> CheckBattleEnd: End Turn
    
    CheckBattleEnd --> BattleResults: Battle Ends
    BattleResults --> LevelUp: Player Wins
    LevelUp --> MainMenu: Continue
    BattleResults --> MainMenu: Player Loses
    
    MainMenu --> [*]: Exit Game
```

## Spell System Process

```mermaid
flowchart TD
    A[Initialize Spell System] --> B[Define Spells]
    B --> C[Load Player Progress]
    C --> D{First Time?}
    D -->|Yes| E[Unlock Starter Spells]
    D -->|No| F[Restore Saved Spells]
    
    E --> G[Start Battle]
    F --> G
    
    G --> H[Select Battle Spells]
    H --> I[Initialize Spell Hand]
    I --> J[Player's Turn]
    
    J --> K[Cast Spell]
    K --> L[Remove from Hand]
    L --> M[Apply Spell Effects]
    M --> N[End Turn]
    
    N --> O{Hand Size < 3?}
    O -->|Yes| P[Draw New Spell]
    O -->|No| Q[AI Turn]
    
    P --> Q
    Q --> R[AI Cast Spell]
    R --> S[AI End Turn]
    
    S --> T{Player's Hand Size < 3?}
    T -->|Yes| U[Draw New Spell]
    T -->|No| V[New Turn]
    
    U --> V
    V --> W{Battle End?}
    W -->|No| J
    W -->|Yes| X[Process Battle Result]
    
    X --> Y[Award XP]
    Y --> Z[Unlock New Spells]
    Z --> AA[Return to Menu]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style G fill:#bbf,stroke:#333,stroke-width:2px
    style J fill:#bfb,stroke:#333,stroke-width:2px
    style Q fill:#fbf,stroke:#333,stroke-width:2px
    style X fill:#bbf,stroke:#333,stroke-width:2px
```

## UI System Process

```mermaid
flowchart TD
    A[Initialize UI] --> B[Cache UI Elements]
    B --> C[Setup Event Listeners]
    C --> D[Setup Responsive Handlers]
    
    D --> E[Show Main Menu]
    E --> F{User Choice}
    
    F -->|Start Game| G[Show Spell Selection]
    F -->|Settings| H[Show Settings Screen]
    
    G --> I[Render Available Spells]
    I --> J[Handle Spell Selection]
    J --> K[Start Battle]
    
    K --> L[Show Game UI]
    L --> M[Update Health/Mana Bars]
    L --> N[Render Player Spell Hand]
    L --> O[Process Player Actions]
    
    O --> P[Update Battle Scene]
    P --> Q[Update Battle Log]
    Q --> R{Battle End?}
    
    R -->|No| M
    R -->|Yes| S[Show Results Screen]
    
    S --> T[Show Battle Statistics]
    T --> U[Show Level Up Notification]
    U --> V[Offer Continue/Exit Options]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style L fill:#bfb,stroke:#333,stroke-width:2px
    style S fill:#fbf,stroke:#333,stroke-width:2px
```

## Progression System Process

```mermaid
flowchart TD
    A[Initialize Progression] --> B[Load Saved Progress]
    B --> C{First Time?}
    C -->|Yes| D[Set Initial Level & XP]
    C -->|No| E[Restore Level & XP]
    
    D --> F[Track Battle Performance]
    E --> F
    
    F --> G[Process Battle Result]
    G --> H{Player Won?}
    
    H -->|Yes| I[Calculate XP Gain]
    H -->|No| J[Calculate Minimal XP]
    
    I --> K[Apply XP Bonus Based on Difficulty]
    K --> L[Add XP to Player Progress]
    J --> L
    
    L --> M{Level Up?}
    M -->|Yes| N[Increase Player Level]
    M -->|No| P[Save Progress]
    
    N --> O[Generate Spell Unlock Options]
    O --> P
    
    P --> Q[Update UI with Progress]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#bbf,stroke:#333,stroke-width:2px
    style G fill:#bfb,stroke:#333,stroke-width:2px
    style M fill:#fbf,stroke:#333,stroke-width:2px
```

## Integrated Game Flow

```mermaid
graph TD
    A[Game Start] --> B[Initialize Components]
    B --> C[Load Game Data]
    C --> D[Show Main Menu]
    
    D --> E{User Action}
    E -->|New Game| F[Reset Game State]
    E -->|Continue| G[Load Saved State]
    E -->|Options| H[Show Options]
    
    F --> I[Show Spell Selection]
    G --> I
    
    I --> J[Player Selects Spells]
    J --> K[Initialize Battle]
    
    K --> L[Player Turn]
    L --> M[Player Casts Spell]
    M --> N[Apply Spell Effects]
    N --> O[Check Battle Status]
    
    O -->|Continues| P[AI Turn]
    O -->|Ended| Q[Show Results]
    
    P --> R[AI Selects & Casts Spell]
    R --> S[Apply AI Spell Effects]
    S --> T[Check Battle Status]
    
    T -->|Continues| U[Refill Player Hand]
    T -->|Ended| Q
    
    U --> L
    
    Q --> V[Process Battle Results]
    V --> W[Award XP]
    W --> X{Level Up?}
    
    X -->|Yes| Y[Show Level Up]
    X -->|No| Z[Return to Menu]
    
    Y --> AA[Select Unlock Reward]
    AA --> Z
    
    Z --> D
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style D fill:#bbf,stroke:#333,stroke-width:2px
    style K fill:#bfb,stroke:#333,stroke-width:2px
    style L fill:#fbf,stroke:#333,stroke-width:2px
    style P fill:#fbf,stroke:#333,stroke-width:2px
    style Q fill:#bbf,stroke:#333,stroke-width:2px
```

## Potential Refactoring Targets

```mermaid
graph TD
    A[Duplicate Code] --> B[src/game/* vs src/js/*]
    A --> C[Redundant Logic in GameManager]
    A --> D[Overlapping UI Management]
    
    E[Code Bloat] --> F[EnhancedSpellSystem.js - 964 lines]
    E --> G[GameManager.js - 1440 lines]
    E --> H[EnhancedUIManager.js - 886 lines]
    
    I[Disconnected Components] --> J[Unused Files in src/js]
    I --> K[Duplicate HTML Structure]
    
    L[Refactoring Opportunities] --> M[Split EnhancedSpellSystem]
    L --> N[Modularize GameManager]
    L --> O[Consolidate UI Logic]
    
    style A fill:#f99,stroke:#333,stroke-width:2px
    style E fill:#f99,stroke:#333,stroke-width:2px
    style I fill:#f99,stroke:#333,stroke-width:2px
    style L fill:#9f9,stroke:#333,stroke-width:2px
```
