# Wizard's Choice - Player Profile System

## Table of Contents
1. [Introduction](#introduction)
2. [Player Profile Overview](#player-profile-overview)
3. [Stats Tracking System](#stats-tracking-system)
4. [Achievement System](#achievement-system)
5. [Title/Rank System](#titlerank-system)
6. [Battle History](#battle-history)
7. [Export and Share Functionality](#export-and-share-functionality)
8. [Implementation Plan](#implementation-plan)
9. [UI Components](#ui-components)
10. [Technical Considerations](#technical-considerations)

## Introduction

The Player Profile System provides players with comprehensive tracking of their progress, achievements, and gameplay statistics. This feature enhances player engagement by providing recognition for accomplishments, visualization of progress, and personalization through titles and ranks.

This document details the design, implementation, and technical specifications for adding player profiles with stats tracking to Wizard's Choice.

## Player Profile Overview

The player profile serves as a central hub for tracking the player's journey through the game. It includes:

1. **Personal Information**: Player name, current level, and active title/rank
2. **Core Statistics**: Summary of key gameplay metrics
3. **Achievements**: List of unlocked and locked achievements
4. **Battle History**: Record of past duels with performance metrics
5. **Titles/Ranks**: Display of available and earned titles with selection option
6. **Export/Share**: Functionality to export profile data or share accomplishments

### Core Principles

1. **Non-intrusive**: The profile system enhances gameplay without requiring constant attention
2. **Rewarding**: Achievements and titles provide meaningful recognition
3. **Accessible**: Stats and progress are clearly presented and easy to understand
4. **Performance-focused**: Implementation optimizes for minimal performance impact

## Stats Tracking System

The stats tracking system records key metrics during gameplay to provide players with insights into their performance and progress.

### Primary Statistics Categories

1. **Combat Statistics**
   - Total battles fought/won/lost
   - Damage dealt/received (total and per element)
   - Healing performed
   - Critical hits landed/received
   - Spells cast (total and by type/element)
   - Mystic punches used
   - Turns taken
   - Average battle duration

2. **Progression Statistics**
   - Total experience gained
   - Gold earned/spent
   - Levels gained
   - Skill points allocated

3. **Collection Statistics**
   - Spells acquired (total and by rarity/element)
   - Equipment collected (total and by rarity/type)
   - Potions crafted
   - Ingredients gathered
   - Recipes discovered

4. **Efficiency Metrics**
   - Damage per mana spent
   - Average turns per victory
   - Gold per battle
   - Experience per battle

### Implementation Details

Statistics are recorded in real-time during gameplay and stored within the game state. The system is designed to:

- Update automatically as actions occur
- Persist across play sessions
- Calculate derived statistics on-demand to minimize storage requirements
- Track both lifetime and recent performance

## Achievement System

Achievements serve as milestones that recognize player accomplishments across various aspects of gameplay.

### Core Mechanics

- Achievements unlock automatically when specific conditions are met
- Organized into categories for easier navigation
- Each achievement has a name, description, icon, and progress tracker
- Achievements may provide small gameplay bonuses upon completion

### Achievement Categories

1. **Combat Achievements**: Related to battle performance and tactics
2. **Collection Achievements**: For gathering spells, equipment, and other collectibles
3. **Exploration Achievements**: For discovering game content and locations
4. **Mastery Achievements**: For demonstrating skill with specific elements or playstyles

### Example Achievements

#### Combat Achievements
1. **"Elemental Master"**
   - Description: Cast 50 spells of each elemental type
   - Progress: Tracks spells cast by element type
   - Reward: +5% spell power with all elements

2. **"Unstoppable"**
   - Description: Win 10 battles without taking damage
   - Progress: Counter of flawless victories
   - Reward: +10 maximum health

3. **"Mana Efficient"**
   - Description: Win a battle using less than 50 total mana
   - Progress: Tracks battles won with low mana usage
   - Reward: -5% mana cost for all spells

#### Collection Achievements
1. **"Potion Prodigy"**
   - Description: Craft 20 different potion recipes
   - Progress: Shows discovered/crafted recipes out of total
   - Reward: Unlock a special rare potion recipe

2. **"Arsenal of Magic"**
   - Description: Collect 50 unique spells
   - Progress: Shows collected spells out of total
   - Reward: +1 starting card in battle

3. **"Geared Up"**
   - Description: Collect one equipment item of each rarity
   - Progress: Shows collected rarities out of total
   - Reward: +5% chance to find rare equipment

### Achievement Display

Achievements are presented in a clean, grid-based layout with:
- Visual indication of locked/unlocked status
- Progress bars for in-progress achievements
- Sorting and filtering options
- Details view showing criteria and rewards

## Title/Rank System

Titles are honorific labels that represent a player's accomplishments or playstyle preferences. Unlike achievements, titles are equipable - players can select which title to display on their profile.

### Core Mechanics

- Titles unlock through specific achievements or combinations of stats
- Players can equip one title at a time to display
- Titles reflect different aspects of gameplay mastery or style
- Some titles offer minor passive bonuses that complement certain strategies

### Title Categories

1. **Progression Titles**: Based on player level and general advancement
2. **Specialization Titles**: Based on elemental or spell type preferences
3. **Achievement Titles**: Unlocked by completing specific achievements
4. **Mastery Titles**: Representing exceptional skill in particular aspects

### Example Titles/Ranks

#### Progression Titles
1. **"Apprentice → Adept → Master → Archmage"**
   - Unlocked by: Reaching specific player levels (5/15/25/40)
   - Benefit: Each tier grants +1% to all stats

#### Specialization Titles
1. **"Pyromancer"**
   - Unlocked by: Dealing 10,000 total fire damage
   - Benefit: Fire spells cost 5% less mana

2. **"Aquamancer"**
   - Unlocked by: Casting 200 water spells
   - Benefit: Water spells deal 5% more damage

3. **"Terramancer"**
   - Unlocked by: Blocking 5,000 damage with earth spells
   - Benefit: Earth spells provide 5% more protection

#### Achievement Titles
1. **"Tactical Genius"**
   - Unlocked by: Winning 25 battles while never having less than 50% mana
   - Benefit: Start battles with +1 card in hand

2. **"Potion Master"**
   - Unlocked by: Complete all potion-related achievements
   - Benefit: 10% increased potion effectiveness

3. **"Spell Collector"**
   - Unlocked by: Collect 75% of all available spells
   - Benefit: 5% chance to draw an extra card when drawing cards

## Battle History

The battle history feature records details of past combat encounters, providing players with insights into their performance over time.

### Recorded Data Per Battle

- Date and time of battle
- Enemy name and level
- Battle outcome (victory/defeat)
- Battle duration (turns)
- Damage dealt and received
- Healing performed
- Critical hits landed
- Spells cast (with breakdown by type)
- Rewards obtained
- Special conditions or notable events

### Implementation Details

- Battles are recorded automatically upon completion
- History is limited to the most recent 50 battles to manage storage
- Summary statistics are maintained separately to provide lifetime metrics
- Export functionality allows preserving complete history externally

### Battle Replay Considerations

Future expansion could include:
- Simplified battle replay capability
- Battle highlight recording
- Performance comparisons between multiple attempts against the same enemy

## Export and Share Functionality

The export and share features allow players to preserve their stats, share accomplishments, and back up their progress.

### Export Options

1. **Profile Summary**: Text-based summary of key stats and achievements
2. **Complete Stats**: JSON export of all tracked statistics
3. **Battle History**: Dedicated export of battle records
4. **Achievement Showcase**: Visual representation of unlocked achievements

### Share Functionality

1. **Achievement Sharing**: Generate shareable images for notable achievements
2. **Profile Card**: Create a visual card summarizing player stats and titles
3. **Battle Reports**: Share details of memorable battles

## Implementation Plan

The implementation of the player profile system will follow these key phases:

### Phase 1: Data Structure Implementation
1. Extend `GameState` interface with new statistics tracking properties
2. Create types for `PlayerStats`, `Achievement`, `PlayerTitle`, and `BattleRecord`
3. Update the game state store with methods for managing the new data
4. Implement statistics tracking in core gameplay systems (combat, collection, etc.)

### Phase 2: Achievement System
1. Define achievement conditions and rewards
2. Implement achievement checking logic
3. Create achievement progress tracking
4. Design notification system for unlocked achievements

### Phase 3: Title/Rank System
1. Define title unlock conditions
2. Implement title selection and display
3. Create title-based bonuses
4. Design progression paths for title advancement

### Phase 4: UI Implementation
1. Create the main profile screen
2. Implement stats display components
3. Design achievement and title interfaces
4. Develop battle history visualization
5. Add export and share functionality

### Phase 5: Integration and Testing
1. Connect profile components to main game navigation
2. Test performance impact and optimize as needed
3. Validate data persistence and accuracy
4. Ensure backward compatibility with existing save data

## UI Components

### PlayerProfileScreen
Main container component with tabbed navigation:
- Summary tab with core stats and equipped title
- Achievements tab with unlocked and available achievements
- Battle History tab with recent battles and performance
- Titles tab for viewing and selecting titles

### StatsSummary
Displays key statistics in an easily scannable format:
- Combat metrics (wins, losses, damage dealt, etc.)
- Collection progress (spells, equipment, etc.)
- Visual charts for data representation

### AchievementList
Grid display of achievements with:
- Filtering by category and completion status
- Progress indicators for incomplete achievements
- Details view showing rewards and requirements

### BattleHistoryLog
Chronological list of battles with:
- Sortable columns for different metrics
- Expandable entries for detailed battle information
- Search and filter capabilities

### TitleRankDisplay
Interface for managing titles:
- Visual representation of title progression paths
- Selection mechanism for active title
- Details panel showing unlock requirements and benefits

### ProfileExport
Tools for exporting and sharing profile data:
- Format selection dropdown
- Preview of export content
- Copy to clipboard and download options
- Share button with platform options

## Technical Considerations

### Data Management
- Use efficient data structures to minimize storage requirements
- Implement aggregation methods to maintain summary statistics
- Schedule regular cleanup for battle history to prevent bloat

### Performance Optimization
- Use memoization for frequently accessed statistics
- Calculate derived statistics on-demand rather than storing
- Implement pagination for battle history display

### Backward Compatibility
- Handle migration of existing save data to new format
- Provide default values for new statistics based on existing data
- Maintain compatibility with older versions of the game

### Security and Privacy
- Sanitize data for export to prevent sensitive information leakage
- Allow players to control what information is included in shared content
- Implement data validation for imported profiles (future feature)

### Expandability
- Design the system to easily accommodate new achievements and titles
- Implement category system that can be extended
- Create flexible stat tracking that can add new metrics without restructuring

---

This document serves as the comprehensive guide for implementing the Player Profile System in Wizard's Choice. Development should adhere to these specifications while maintaining flexibility for future enhancements based on player feedback. 