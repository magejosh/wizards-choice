# Wizard's Choice - Process Maps

This document contains process maps for the Wizard's Choice game, visualizing the main components, interactions, and game flow.

## Component Structure

```mermaid
graph TD
    A[Main Entry] --> B[GameManager]
    B --> C[EnhancedSpellSystem]
    B --> D[UIManager]
    B --> E[SceneManager]
    B --> F[AudioManager]
    B --> G[ProgressionSystem]
    
    C --> C1[SpellDefinitions]
    C --> C2[SpellHandManager]
    C --> C3[SpellProgressionTracker]
    
    D --> D1[ScreenManager]
    D --> D2[UIElementManager]
    D --> D3[UIEventManager]
    
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
    participant UI as EnhancedUIManager
    participant SS as EnhancedSpellSystem
    participant SD as SpellDefinitions
    participant SH as SpellHandManager
    participant SP as SpellProgressionTracker
    participant PS as ProgressionSystem
    participant SM as SceneManager
    participant AM as AudioManager
    
    Main->>GM: new GameManager()
    Main->>UI: new EnhancedUIManager()
    Main->>SM: new SceneManager()
    Main->>SS: new EnhancedSpellSystem()
    Main->>AM: new AudioManager()
    Main->>PS: new ProgressionSystem(spellSystem)
    
    SS->>SD: new SpellDefinitions()
    SS->>SS: Initialize internal components
    
    Main->>GM: init(uiManager, sceneManager, spellSystem, progressionSystem)
    Main->>UI: showScreen('loading-screen')
    
    par Initialize Assets
        Main->>SM: init()
        Main->>SS: init()
        SS->>SD: init()
        SS->>SP: new SpellProgressionTracker(spellDefinitions)
        SS->>SH: new SpellHandManager(spellDefinitions)
        SS->>SP: init()
        SS->>SS: loadProgress()
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
    A[Initialize EnhancedSpellSystem] --> B[Initialize SpellDefinitions]
    B --> C[Define Spells]
    C --> D[Initialize SpellProgressionTracker]
    D --> E[Initialize SpellHandManager]
    E --> F[Load Player Progress]
    F --> G{First Time?}
    G -->|Yes| H[Unlock Starter Spells]
    G -->|No| I[Restore Saved Spells]
    
    H --> J[Start Battle]
    I --> J
    
    J --> K[Select Battle Spells]
    K --> L[Initialize Spell Hand]
    L --> M[Player's Turn]
    
    M --> N[Cast Spell]
    N --> O[Remove from Hand]
    O --> P[Apply Spell Effects]
    P --> Q[End Turn]
    
    Q --> R{Hand Size < 3?}
    R -->|Yes| S[Draw New Spell]
    R -->|No| T[AI Turn]
    
    S --> T
    T --> U[AI Cast Spell]
    U --> V[AI End Turn]
    
    V --> W{Player's Hand Size < 3?}
    W -->|Yes| X[Draw New Spell]
    W -->|No| Y[New Turn]
    
    X --> Y
    Y --> Z{Battle End?}
    Z -->|No| M
    Z -->|Yes| AA[Process Battle Result]
    
    AA --> AB[Award XP]
    AB --> AC[Unlock New Spells]
    AC --> AD[Return to Menu]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style J fill:#bbf,stroke:#333,stroke-width:2px
    style M fill:#bfb,stroke:#333,stroke-width:2px
    style T fill:#fbf,stroke:#333,stroke-width:2px
    style AA fill:#bbf,stroke:#333,stroke-width:2px
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
    A[Completed Refactoring] --> B[Removed src/js/* duplication]
    A --> C[Modularized GameManager]
    A --> D[Modularized EnhancedSpellSystem]
    A --> E[Modularized UIManager]
    
    F[Remaining Code Improvements] --> G[Unused functions and variables]
    F --> H[Commented-out code]
    F --> I[Duplicate logic across components]
    F --> J[Large functions to break down]
    
    K[Performance Optimizations] --> L[ThreeJS rendering]
    K --> M[Asset preloading]
    K --> N[Spell effect animations]
    K --> O[Memory management]
    
    P[Documentation Updates] --> Q[Code documentation]
    P --> R[JSDoc comments]
    P --> S[User guide improvements]
    P --> T[Developer documentation]
    
    style A fill:#9f9,stroke:#333,stroke-width:2px
    style F fill:#f99,stroke:#333,stroke-width:2px
    style K fill:#f99,stroke:#333,stroke-width:2px
    style P fill:#f99,stroke:#333,stroke-width:2px
```

## Completed Refactoring Structure

```mermaid
graph TD
    A[Main Entry] --> B[GameStateManager]
    B --> C[BattleManager]
    B --> D[PlayerManager]
    
    E[EnhancedSpellSystem] --> F[SpellDefinitions]
    E --> G[SpellHandManager]
    E --> H[SpellProgressionTracker]
    
    I[EnhancedUIManager] --> J[ScreenManager]
    I --> K[UIElementManager]
    I --> L[UIEventManager]
    
    B --> E
    B --> I
    B --> M[SceneManager]
    B --> N[AudioManager]
    B --> O[ProgressionSystem]
    
    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bfb,stroke:#333,stroke-width:2px
    style D fill:#bfb,stroke:#333,stroke-width:2px
    style E fill:#fbf,stroke:#333,stroke-width:2px
    style F fill:#dfd,stroke:#333,stroke-width:2px
    style G fill:#dfd,stroke:#333,stroke-width:2px
    style H fill:#dfd,stroke:#333,stroke-width:2px
    style I fill:#fbb,stroke:#333,stroke-width:2px
    style J fill:#fdd,stroke:#333,stroke-width:2px
    style K fill:#fdd,stroke:#333,stroke-width:2px
    style L fill:#fdd,stroke:#333,stroke-width:2px
