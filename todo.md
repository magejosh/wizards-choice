# Wizard's Choice - Next Steps

## Immediate

## Up Next
- [ ] Create spell progression tech tree system
  - [ ] Design PoE-style spell tree with wizard at center
  - [ ] Create data structure for spell nodes and connections
  - [ ] Implement level-up point system for purchasing connected spells. check docs/how_to_play.md for how this works. 
  - [ ] Design visual tech tree UI with connection paths and node states
  - [ ] Add navigation and interaction for the spell tech tree
  - [ ] Implement spell unlocking logic based on prerequisites
  - [ ] Balance progression curve and spell distribution on tree
  - [ ] Add tooltips and preview for locked/available spells

## Later Tasks
- [ ] Add more enemy types
  - [ ] Design 5 new enemy wizard archetypes with unique abilities.
  - [ ] Design 5 new enemy magical creature types with unique abilities.
  - [ ] Create specialized AI strategies for each enemy type
  - [ ] Add visual representations for new enemy types
  - [ ] Implement enemy-specific loot tables and drop rates
  - [ ] Balance difficulty scaling for new enemy encounters

- [ ] Add player profile with stats tracking
  - [ ] Design comprehensive stats tracking system
  - [ ] Create player profile UI with achievement display
  - [ ] Implement battle history and performance metrics
  - [ ] Add player titles/ranks based on achievements
  - [ ] Create export/share functionality for player stats


## Project Management
- [ ] Update all documentation

- [ ] Mobile responsiveness improvements
  - [ ] Optimize UI layouts for various screen sizes
  - [ ] Implement touch-friendly controls for mobile
  - [ ] Test and fix responsive design issues
  - [ ] Add progressive loading for mobile connections

## Production Preparation
- [ ] Security audit
- [ ] Performance optimization
- [ ] Prepare backend infrastructure
- [ ] Create deployment pipeline
- [ ] User testing and feedback
- [ ] Documentation updates 


## Recently Completed
- ✅ Implemented spell scroll system
  - ✅ Created spell scroll item type data structure
  - ✅ Added spell scrolls to loot tables and market inventory
  - ✅ Implemented spell scroll consumption to learn spells permanently if used in wizards study.
  - ✅ Added battle mechanic for single-use free casting from scrolls and consumes the scroll.
  - ✅ Designed UI for spell scroll inventory and usage, so they show up to the side of the characters spell cards in hand.

- ✅ Added multiple market locations unlocked by player level (25,50,75,100,150,250,500,1000)
  - ✅ Implemented additional high-level markets beyond the current 5 markets (levels 1,5,10,15,20)

- ✅ Added marketplace attacks
  - ✅ Added a chance to get attacked when leaving the market, similar to how the cops could chase you and attack in later versions of dope wars game. maybe the bandits/rogue that attacks takes some of your gold or ingredients. This should still be a duel, but with an opponent suited to robbing wizards with special abilities that make them a match. Beating them should reward uncommon or rare ingredients in random quantities.

- ✅ Created market system for trading ingredients and items
  - ✅ Designed market data structures (inventory, prices, fluctuation)
  - ✅ Implemented price fluctuation algorithm based on supply/demand
  - ✅ Created market UI component accessible from wizard's study
  - ✅ Added transaction system for buying/selling ingredients
  - ✅ Implemented market reputation system affecting prices
  - ✅ Added initial market locations unlocked by player level (1,5,10,15,20)
  - ✅ Created visual feedback for price changes over time
- ✅ Implemented battle system with 3D effects 
- ✅ Implemented AI for enemy wizards using strategy patterns
- ✅ Created deck builder functionality with filtering and sorting
- ✅ Fixed duplicate identifier errors in imports
- ✅ Implemented secure password hashing with bcryptjs
- ✅ Added IndexedDB integration for persistent storage
- ✅ Fixed server-side rendering compatibility 
- ✅ Implemented loading states and error handling
- ✅ Added unique save game persistence per user
- ✅ Expanded spell system with all 10 tiers completed (100 common spells)
- ✅ Added special spells (25 uncommon, rare and legendary spells)
- ✅ Implemented equipment system with procedural generation
  - ✅ Created equipment component UI with slots for wands, staffs, robes, amulets, and rings
  - ✅ Implemented equipment data structures with affix-based bonuses
  - ✅ Added equipment effect calculations for wizard stats
  - ✅ Created procedural equipment generation for loot system
  - ✅ Designed and integrated Equipment Screen UI
- ✅ Expanded equipment options with new gear types:
  - ✅ Added daggers and swords with enhanced mystic punch and bleed effects
  - ✅ Implemented spellbooks with card advantage mechanics
  - ✅ Created wizard hats as head equipment with mana/health bonuses
  - ✅ Updated UI to support new equipment slots
  - ✅ Enhanced stat calculations for new equipment bonuses
- ✅ Revised equipment system with logical slot organization:
  - ✅ Reorganized equipment into six logical slots (head, hand, body, neck, finger, belt)
  - ✅ Implemented dual-ring system for finger slot
  - ✅ Added belt slot with potion capacity
  - ✅ Created comprehensive potion system with six types and five tiers
  - ✅ Implemented potion management UI in equipment screen
  - ✅ Enhanced game state store with potion functionality
- ✅ Fix TypeScript errors in aiEngine.ts and page.tsx
- ✅ Add diagram to docs for Battle System
- ✅ Add diagram to docs for Equipment System
- ✅ Add diagram for Potion System
- ✅ Update changelog with latest changes
- ✅ Create interactive battle UI
- ✅ Implement turn-based combat logic with deck system
- ✅ Set up GitHub repository
- ✅ Implement battle screen with dueling system
  - ✅ Add special effects for spell casting
  - ✅ Integrate equipment bonuses in combat
  - ✅ Add potion usage mechanics during battle
- ✅ Implemented potion crafting system
  - ✅ Created ingredient gathering mechanic (use the loot system)
  - ✅ Designed recipe discovery system (loot system and experimenting with ingredients to discover recipes)
  - ✅ Implemented brewing interface, accessed from wizards study screen
