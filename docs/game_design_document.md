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

## Core Mechanics

### Game Loop
1. Player starts a new duel against an AI opponent
2. Each turn, player selects one spell to cast from their available options
3. Spell effects are applied (damage, healing, mana restoration)
4. AI opponent selects and casts a spell
5. This cycle continues until either the player or opponent is defeated
6. Upon victory, player may unlock new spells for future duels
7. Player can start a new duel with their expanded spell collection

### Resources
- **Health**: Starts at 100. When reduced to 0, the character is defeated.
- **Mana**: Starts at 100, consumed when casting spells. Regenerates partially each turn.
- **Spells**: The collection of magical abilities available to the player.

### Turn Structure
1. Player's turn begins with partial mana regeneration
2. Player selects a spell to cast (if they have sufficient mana)
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
- **Type**: Elemental category
- **Mana Cost**: Amount of mana required to cast
- **Damage**: Amount of health removed from target
- **Healing**: Amount of health restored to caster
- **Mana Restore**: Amount of mana restored to caster
- **Description**: Flavor text and explanation
- **Tier**: Power level (1-3), used for progression

## Progression System

### Spell Trees
Each elemental category has a progression tree with three tiers:
- **Tier 1**: Basic spells, available from the start
- **Tier 2**: Intermediate spells, unlocked after winning duels
- **Tier 3**: Advanced spells, unlocked after mastering tier 2 spells

### Unlocking Mechanism
- Player starts with one tier 1 spell from each element
- After winning a duel, player has a chance to unlock a new spell
- Unlocking follows the progression tree (must have tier 1 to unlock tier 2)
- Higher tier spells are more powerful but have higher mana costs

### Difficulty Progression
As players unlock more powerful spells, they face increasingly challenging opponents:
- **Easy**: AI uses only tier 1 spells
- **Normal**: AI uses a mix of tier 1 and tier 2 spells
- **Hard**: AI uses a mix of tier 1, 2, and 3 spells, with emphasis on tier 3

## User Interface

### Main Menu
- Title: "Wizard's Choice"
- Start New Duel button
- Options button (for future implementation)

### Game UI
- Player information (health and mana bars)
- Opponent information (health and mana bars)
- Battle scene (3D visualization using ThreeJS)
- Spell choice buttons
- Battle log (text descriptions of actions)

### Game Over Screen
- Victory/Defeat message
- Battle statistics
- New spell unlocked notification (if applicable)
- Play Again button
- Return to Menu button

## Visual Design

### Art Style
- Stylized, atmospheric fantasy visuals
- Vibrant spell effects with distinct colors for each element
- Simple but recognizable wizard representations
- Magical environment with ambient effects

### Color Palette
- **Fire**: Red, orange, yellow (#ff5030, #ff8030, #ffb030)
- **Water**: Blue, cyan, light blue (#3080ff, #30c0ff, #80e0ff)
- **Earth**: Green, brown, tan (#80c040, #a06030, #d0b080)
- **Air**: White, light blue, silver (#ffffff, #c0c0ff, #e0e0e0)
- **Arcane**: Purple, magenta, pink (#a050ff, #d050ff, #ff50ff)
- **UI Background**: Dark blue (#0a0a1a)
- **UI Elements**: Purple, blue (#4020a0, #6030d0)

## Audio Design

### Sound Effects
- Spell casting sounds for each element
- Impact sounds for damage
- Healing sounds
- Victory/defeat fanfares
- UI interaction sounds

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

### Performance Considerations
- Optimized 3D rendering for broad device compatibility
- Efficient spell effect animations
- Responsive design for various screen sizes

## Future Expansion

### Multiplayer Implementation
- Player vs. Player duels
- Matchmaking system based on spell collection
- Leaderboards and rankings

### Additional Features
- More spell varieties and elements
- Customizable wizard appearance
- Special events and challenges
- Tournament mode

### Monetization Potential (if applicable)
- Cosmetic items for wizards
- Additional spell packs
- Premium tournaments

## Development Roadmap

### MVP (Current Focus)
- Single-player duels against AI
- Basic spell system with five elements
- Simple progression system
- Core visual effects and UI

### Phase 2
- Enhanced AI with different strategies
- Expanded spell collection
- Improved visual effects
- Sound implementation

### Phase 3
- Multiplayer functionality
- Advanced progression system
- Tournaments and special events
- Enhanced customization options

## Conclusion
Wizard's Choice aims to deliver an engaging, strategic experience focused on meaningful player choices and satisfying progression. The game's accessible mechanics and quick gameplay sessions make it appealing to casual players, while the depth of the spell system and tactical decision-making provide enough complexity to engage more dedicated gamers. The ThreeJS implementation allows for visually appealing magical effects while maintaining broad compatibility across devices.
