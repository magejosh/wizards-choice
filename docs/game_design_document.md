# Wizard's Choice - Game Design Document

## Game Overview

### Concept
Wizard's Choice is a quick, choice-driven wizard duel game where strategic spell selection shapes your path to magical supremacy. Players engage in magical duels against AI opponents, making tactical decisions about which spells to cast in each turn. The outcome of each duel influences the player's progression, unlocking new and more powerful spells as they advance.

### Target Audience
- Fantasy game enthusiasts
- Players who enjoy strategic decision-making
- Casual gamers looking for quick gameplay sessions
- Players who appreciate progression systems

### Unique Selling Points
- Fast-paced tactical gameplay with meaningful choices
- Dynamic spell progression system that evolves based on duel outcomes
- Atmospheric magical visuals using ThreeJS
- Accessible gameplay that's easy to learn but offers strategic depth
- Persistent progression between duels to reward continued play

## Core Mechanics

### Game Loop
1. Player starts a new duel against an AI opponent with a selected difficulty
2. Player selects up to 3 spells from their unlocked collection for the battle
3. Each turn, player selects one spell to cast from their hand
4. Spell effects are applied (damage, healing, mana restoration)
5. AI opponent selects and casts a spell
6. This cycle continues until either the player or opponent is defeated
7. Upon victory, player gains experience and may unlock new spells based on battle difficulty
8. Player can continue with enhanced spell collection or start a more difficult duel

### Resources
- **Health**: Starts at 100. When reduced to 0, the character is defeated.
- **Mana**: Starts at 100, consumed when casting spells. Regenerates partially each turn.
- **Spells**: The collection of magical abilities unlocked by the player.
- **Experience**: Earned from battles and used for level progression.
- **Level**: Increases as experience is gained, unlocking more powerful spells.

### Turn Structure
1. Player's turn begins with partial mana regeneration
2. Player selects a spell to cast from their hand (if they have sufficient mana)
3. Spell effects are applied immediately
4. Opponent's turn begins with partial mana regeneration
5. AI selects and casts a spell
6. Spell effects are applied immediately
7. Return to player's turn

## Spell System

### Spell Categories
Spells are divided into five elemental categories, each with distinct characteristics:

1. **Fire**: High damage, high mana cost
   - Example: Fireball, Inferno, Phoenix Flame

2. **Water**: Balanced damage and healing, moderate mana cost
   - Example: Water Blast, Ice Spike, Tidal Wave

3. **Earth**: Defensive, focused on healing and protection, moderate mana cost
   - Example: Stone Skin, Boulder Throw, Earthquake

4. **Air**: Fast, lower damage but mana restoration, low mana cost
   - Example: Wind Gust, Lightning Bolt, Tornado

5. **Arcane**: Versatile, balanced attributes with unique effects, varied mana cost
   - Example: Arcane Missile, Mana Drain, Arcane Nova

### Spell Attributes
Each spell has the following attributes:
- **Name**: Unique identifier for the spell
- **Element**: Elemental category (fire, water, earth, air, arcane)
- **Mana Cost**: Amount of mana required to cast
- **Damage**: Amount of health removed from target
- **Healing**: Amount of health restored to caster
- **Mana Restore**: Amount of mana restored to caster
- **Description**: Flavor text and explanation
- **Tier**: Power level (1-3), used for progression
- **Unlock Level**: Minimum player level required to unlock the spell

### Card Drawing System
- The game uses a card game-like drawing mechanism for spells
- Each player has a deck of spells (all unlocked spells) and a hand (currently drawable spells)
- At the start of battle, players select up to 3 spells to include in their deck
- Player starts with 3 random cards drawn from their deck
- After casting a spell, it is removed from the hand
- At the beginning of each turn, the player draws cards until they have 3 in hand
- When the deck is empty, all previously cast spells are reshuffled back into the deck
- A spell can only exist in one place at a time: either in the hand or in the deck
- This system ensures variety in gameplay while preventing duplicate spells in hand

### Opponent AI Spell System
- Enemy wizards use the same card drawing system as the player
- The opponent maintains a hand of 3 spells drawn from their spell deck
- Opponents draw cards at the beginning of their turn to maintain a 3-card hand
- When their deck is empty, all previously cast spells are reshuffled
- The AI decision-making varies based on difficulty level:
  - **Level 1 AI**: Randomly selects spells from available castable options
  - **Higher Level AI**: Uses basic strategy - prioritizes healing when health is low, otherwise uses highest damage spells
- The opponent's spells are limited by their available mana, just like the player

## Progression System

### Player Levels and Experience
- Players earn experience points (XP) after each battle
- XP gained depends on battle difficulty and outcome
- Each level requires progressively more XP to reach
- Level progress is visually displayed with an experience bar
- Higher levels unlock access to more powerful spells

### Spell Trees
Each elemental category has a progression tree with three tiers:
- **Tier 1**: Basic spells, available from the start (Level 1)
- **Tier 2**: Intermediate spells, unlocked at higher levels (Level 3-5)
- **Tier 3**: Advanced spells, unlocked at highest levels (Level 7+)

### Unlocking Mechanism
- Player starts with one tier 1 spell from each element
- After winning a duel, player gains experience and may level up
- New spells are unlocked automatically when reaching appropriate levels
- Higher difficulty battles have a chance to unlock bonus spells
- The game tracks battle statistics to reward consistent play with specific elements

### Difficulty Progression
Three difficulty levels are available for battles:
- **Easy**: AI uses only tier 1 spells, rewards less XP
- **Normal**: AI uses a mix of tier 1 and tier 2 spells, rewards moderate XP
- **Hard**: AI uses a mix of tier 1, 2, and 3 spells, rewards the most XP and has highest chance for bonus spell unlocks

### Persistent Progression
- Player progress (level, XP, and unlocked spells) is maintained between play sessions
- "Play Again" and "Continue" options allow for persistent gameplay even after defeat
- Players can choose to reset progress and start fresh if desired

## User Interface

### Main Menu
- Title: "Wizard's Choice"
- Start New Duel button
- Continue button (if applicable)
- Difficulty selection
- Options button (for future implementation)

### Game UI
- Player information (health and mana bars, level and XP)
- Opponent information (health and mana bars)
- Battle scene (3D visualization using ThreeJS)
- Spell hand display (horizontal flex layout)
- Battle log (text descriptions of actions)
- Visual effects for spell casting

### Spell Selection Screen
- Available spells displayed in a responsive horizontal layout
- Selection counter (e.g., "1/3 Spells Selected")
- Spell cards with information about mana cost, damage, healing, etc.
- Element-based color coding and visual effects
- Start Battle button (enabled when selection is complete)

### Battle Results Screen
- Victory/Defeat message
- Battle statistics
- Experience gained and level up notification
- New spell unlocked notification (if applicable)
- Play Again button (maintains progression)
- Return to Menu button

## Visual Design

### Art Style
- Stylized, atmospheric fantasy visuals
- Vibrant spell effects with distinct colors for each element
- Simple but recognizable wizard representations
- Magical environment with ambient effects

### UI Layout
- Responsive design using flexbox for optimal display across different screen sizes
- Horizontally arranged spell cards for intuitive selection
- Compact design for battle spells to ensure all options are visible at once
- Dynamic resizing of the render container to maintain proper aspect ratio

### Color Palette
- **Fire**: Red, orange, yellow (#ff5030, #ff8030, #ffb030)
- **Water**: Blue, cyan, light blue (#3080ff, #30c0ff, #80e0ff)
- **Earth**: Green, brown, tan (#80c040, #a06030, #d0b080)
- **Air**: White, light blue, silver (#ffffff, #c0c0ff, #e0e0e0)
- **Arcane**: Purple, magenta, pink (#a050ff, #d050ff, #ff50ff)
- **UI Background**: Dark blue (#0a0a1a)
- **UI Elements**: Purple, blue (#4020a0, #6030d0)
- **Experience Bar**: Gold/Yellow (#ffcc00)

## Audio Design

### Sound Effects
- Spell casting sounds for each element
- Impact sounds for damage
- Healing sounds
- Victory/defeat fanfares
- UI interaction sounds
- Level up and spell unlock notifications

### Music
- Ambient magical background music
- Tension-building battle music
- Victory/defeat themes

## Technical Implementation

### Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript
- **Rendering**: ThreeJS for 3D visuals
- **Build System**: Webpack
- **Future Considerations**: Backend for multiplayer (Node.js, WebSockets)

### Core Components
- **GameManager**: Central controller for game state and battle logic
- **SceneManager**: Handles ThreeJS scene rendering and camera management
- **EnhancedSpellSystem**: Manages spell data, unlocking mechanics, and player progression
- **ProgressionSystem**: Tracks player experience, level, and unlocks
- **UIManager**: Controls user interface elements and animations

### Performance Optimizations
- Responsive designs with proper container sizing
- Optimized 3D rendering with dynamic size adjustments
- Efficient spell effect animations
- CSS layout improvements with flexbox for consistent display across devices
- Minimum dimension constraints to prevent rendering issues

## Future Expansion

### Multiplayer Implementation
- Player vs. Player duels
- Matchmaking system based on player level and spell collection
- Leaderboards and rankings

### Additional Features
- More spell varieties and elements
- Customizable wizard appearance
- Special events and challenges
- Tournament mode
- Achievement system

### Monetization Potential (if applicable)
- Cosmetic items for wizards
- Additional spell packs
- Premium tournaments

## Development Roadmap

### Completed Features
- Single-player duels against AI
- Basic spell system with five elements
- Core visual effects and UI
- Spell hand selection system
- Persistent progression with experience and levels
- Responsive UI layouts for spell cards and battle interface
- Difficulty settings with appropriate rewards

### Current Focus
- Refining the UI experience and layout
- Optimizing rendering performance
- Enhancing visual feedback for actions
- Expanding the spell collection

### Future Phases
- Enhanced AI with different strategies
- Expanded spell collection
- Improved visual effects
- Sound implementation
- Multiplayer functionality
- Tournaments and special events
- Enhanced customization options

## Conclusion
Wizard's Choice delivers an engaging, strategic experience focused on meaningful player choices and satisfying progression. The game's accessible mechanics and quick gameplay sessions make it appealing to casual players, while the depth of the spell system and tactical decision-making provide enough complexity to engage more dedicated gamers. The persistent progression system encourages continued play, while the responsive design ensures a consistent experience across different devices. The ThreeJS implementation allows for visually appealing magical effects while maintaining broad compatibility.
