# Wizard's Choice - Game Requirements Document

## Overview
"Wizard's Choice" is a single-player browser-based tactical choice-driven strategy game where players engage in wizard duels through strategic spell selection. The game features progression mechanics, fantasy themes, and lightweight atmospheric visuals, with architectural considerations for future multiplayer expansion.

## Technical Requirements

### Engine & Framework
- PhaserJS for 2D visualization and responsive visuals
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
- Multiple save slots functionality, active one selected on start new game or continue game button press from main menu.

#### Save Slot System Requirements
- Each save slot must maintain completely isolated game data, including:
  - Player character data (name, level, stats, etc.)
  - Game progress (completed duels, unlocked content, etc.)
  - Inventory (spells, equipment, items, gold, etc.)
  - Game state (current location, active quests, etc.)
- Save slots must be uniquely identified by UUID rather than array indices
- Loading a save slot must restore the exact state of that save slot without any data leakage from other slots
- All game state modifications must update both the current save slot data and any top-level state references
- The system must maintain backward compatibility with existing code while ensuring data isolation
- The save system must handle migration of older save formats to newer versions

### Game Initialization
- Players start with 5 initial spells (3 defaults, 2 random Tier 1)
- Players select 3 spells from these for their first duel
- Initial stats: 100 Health, 100 Mana (level 1 baseline)

### Duel Mechanics
- 2D visualization of two wizards in a battle arena, with space for their card hand, deck, discard pile, summoned creatures, available scrolls, equipped potions.
- UI overlay showing:
  - Current/max Health, red fill color on fillbar.
  - Current/max Mana, blue  fill color on fillbar.
  - Level counter
  - Experience bar showing current/next level values for experience inside a pretty fillbar. green fill color.
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
- Experience gained = (enemy level × 5) + (10 × difficulty multiplier) where difficulty multipliers are: Easy ×10, Normal ×1, Hard ×0.1
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
- Spell synergy mechanics similar to MtG. We could use tags on Spells to help integrate this idea as ways to target/trigger synergy mechanics.
- Spell card types: damage, buff, debuff, healing, summoning, interrupt, hybrid
- **All spells must conform to the XML schema in [/docs/spell_data_format.md](./spell_data_format.md) and follow the workflow in [/docs/process_maps.md](./process_maps.md#spell-data-workflow).**
- The spell data XML file is always located at `/public/data/spell_data.xml` in the project and loaded at runtime from `/data/spell_data.xml` (the URL path). There is only one file; the `/public` directory is served as the web root.

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
  - Inventory refresh cycles varying by market tier, with countdown to refresh timer to show how long to the player
  - Market attacks on clicking leave market or travel to new market location with random chance of triggering a market attack. Random chance is weighted by difficulty setting player has set from the main menu. Easy is really low chance (mayb 5%), normal is say maybe 25%, and hard is probably 50% chance of triggering a market attack. Attacker is a rogue or bandit or magical creature, and will steal gold or ingredients in inventory (most magical creatures but dragons prefer the ingredients) if the player loses the battle. Player will loot something if they win instead.


### Procedural Content & Replayability
- Enemy wizards and creatures procedurally match player's level and earned points
- Unique spell selections and special thematic spells for enemies

### Loot System
- Post-duel acquisition of spells and equipment
- Different loot tendencies for wizards vs. magical creatures

## UI/UX Requirements

Standards documented in `docs/ui_design_standards.md`

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
