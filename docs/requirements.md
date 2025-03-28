# Wizard's Choice - Game Requirements Document

## Overview
"Wizard's Choice" is a single-player browser-based tactical choice-driven strategy game where players engage in wizard duels through strategic spell selection. The game features progression mechanics, fantasy themes, and lightweight atmospheric visuals, with architectural considerations for future multiplayer expansion.

## Technical Requirements

### Engine & Framework
- ThreeJS for 3D visualization and responsive visuals
- Next.js as the application framework (with future multiplayer considerations)
- Browser-based implementation for cross-platform accessibility

### Performance Requirements
- Fast loading times for spell animations and battle resolutions
- Responsive design for various screen sizes
- Efficient state management for game progression

## Game Mechanics

### Core Gameplay Loop
1. Select spells for duels
2. Engage in turn-based wizard duels
3. Gain experience and level up
4. Acquire new spells and equipment
5. Return to Wizard's Study to prepare for next duel

### Starting & Saving
- Main page with Login options, "Start New Game," "Continue," and "Settings"
- Automatic saving after:
  - Each duel
  - Exiting the Level-Up screen
  - Returning to the Wizard's Study
- Multiple save slots functionality

### Game Initialization
- Players start with 5 initial spells (3 defaults, 2 random Tier 1)
- Players select 3 spells from these for their first duel
- Initial stats: 100 Health, 100 Mana (level 1 baseline)

### Duel Mechanics
- 3D visualization of two wizards in a battle arena
- UI overlay showing:
  - Current/max Health
  - Current/max Mana
  - Level counter
  - Experience bar
- Spell cards (2:3 aspect ratio, rounded corners) displaying:
  - Name
  - Type (direct damage, DoT, healing, debuff)
  - Elemental type (fire, water, arcane, etc.)
  - Mana cost
  - Spell effects
  - Description
  - Image placeholder
- Combat rounds:
  - One spell per round for player and enemy
  - Enemy AI difficulty levels:
    - Easy: Selects lowest damage spell
    - Normal: Selects random spells
    - Hard: Selects highest damage or healing if health <50%
  - Immediate spell effects with animations and visual feedback
- Mana regeneration: base amount per turn = player level + equipment bonuses
- Optional discard mechanic for "mystic punch" (no mana cost):
  - Damage = spell tier + difficulty modifier (Easy +20, Normal +5, Hard +2)
- Option to skip casting (if ≤2 cards in hand)
- Reactionary spells that can be cast outside normal turn order
- Duel ends when either wizard reaches ≤0 Health
- Winner's Health and Mana reset fully; all lingering effects end

### Experience & Leveling
- Experience gained = enemy value × difficulty multiplier (Easy ×10, Normal ×1, Hard ×0.1)
- Level-up requirement: current level × 100 experience points
- Level-up points awarded based on difficulty: Easy (1), Normal (2), Hard (5)

### Spell System
- Spell tech-tree structure inspired by Path of Exile and Magic: The Gathering
- 120 initial spells across 10 tiers:
  - Tier 1 = Cantrip
  - Tier 10 = D&D Level 9 spells
- Spell cost equals spell tier
- Scaling mana costs and effects:
  - Tier 1: High Mana (25-40), minor effects
  - Tier 3: Moderate Mana (around 15), balanced effects
- Spell synergy mechanics

### Wizard Stats & Progression
- Level-up points can enhance:
  - Max Health: 1 point per +1 Health
  - Max Mana: 1 point per +1 Mana
  - Mana Regen: 10 points per +1 Mana Regen per round

### Wizard's Study (Hub)
- Central hub for selecting next duel (wizard or magical creature)
- Deckbuilder for tactical spell storage and selection
- Inventory management: spell scrolls, ingredients, potions, and equipment
  - Equipment management: one wand or weapon (hand slot), one robe or armor (body slot), one amulet (neck slot), one belt (belt slot), and two rings (finger slots)

### Equipment System
- Equipment types and example bonuses:
  - Wands: Mana cost reduction (10%), Mana Regen (+2), Spell Power (+5%)
  - Robes: Health (+20), Damage reduction (5%), Health Regen (+5 per round)
  - Amulets: Elemental Affinity (+10% specific element), Spell reuse (once per 3 rounds), Damage barrier (once per duel)
  - Rings: Critical spellcast (5% double effect), Mana (+15), Spell vampirism (10% health restored from damage)
  - Belts: Potion slots (1-5 based on rarity)

### Market System
- Multiple market locations with progressive level unlocks (1-1000)
  - Buy/Sell Mode
  - Market specializations (ingredients, potions, equipment, scrolls)
  - Dynamic supply and demand affecting prices (simulated with randomization generated at market initialization/refresh)
  - Inventory refresh cycles varying by market tier
  - Market attacks on travel to new market location with random chance of attack based on distance where distance is relative to market unlock scale
  

### Procedural Content & Replayability
- Enemy wizards and creatures procedurally match player's level and earned points
- Unique spell selections and special thematic spells for enemies

### Loot System
- Post-duel acquisition of spells and equipment
- Different loot tendencies for wizards vs. magical creatures

## UI/UX Requirements

### Accessibility
- UI scaling options
- Readable fonts
- Colorblind-friendly design with multiple theme options
- Clear visual feedback for game actions

### How to Play Section
- Accessible from main menu
- Explains basic mechanics:
  - Spellcasting
  - Mana regeneration
  - Discarding
  - Leveling
  - Spell synergy

## Multiplayer Considerations (Future)

### Architecture
- Separation of game logic/state management from UI and client-side visuals
- Wizard's Study multiplayer functionality:
  - Duel invite link sharing
  - Friends list integration
  - Online dueling with spell copying as reward
  - Random first player selection

## Documentation Requirements

- Comprehensive README
- Changelog
- Deployment guides for:
  - Netlify
  - Vercel
  - Hostinger VPS
- Project map and Mermaid diagrams of functional flow
- Full requirements documentation
- Inline code comments for complex logic

## Testing Requirements

- Thorough testing for errors guidelines written in concise action steps format for the user to perform testing as needed.
- Balance testing for gameplay mechanics
- Cross-browser compatibility testing
- Responsive design testing
