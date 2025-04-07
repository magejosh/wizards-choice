# Wizard's Choice - Next Steps
Main tasks are not to be marked complete until all subtasks are completed.

## Immediate Tasks
- [x] Fix transaction functionality in StreamlinedMarketUI
  - [ ] Fixed gold not being deducted from player's Current Gold properly when buying items (or something is instantly resetting it to the starting 100 gold)
  - [ ] Fixed purchased items not being added to player's inventory after purchase
  - [x] Fixed market inventory quantities not updating correctly
    - [ ] Fixed market inventory quantities not persisting until the hourly market inventory refresh. Currently when the player leaves the market for any reason (via button or page reload) and returns the item quantities reset to what they started as which is undesirable.
  - [x] Implemented direct state updates instead of relying on helper functions
  - [x] Added proper UI refresh after transactions
- [ ] Comprehensive test verification
  - [ ] Verify all market scenarios with different item types
  - [ ] Test edge cases (inventory full, market attack, etc.)
  - [ ] Confirm all interactive elements in the market screen work as expected by asking the user to test all features via presenting an itemized list of all features and asking the user to test each one with instructions for how to test each. ```WAIT until.USER.Confirms.THIS.TaskComplete && THEN REFACTOR MarketUI component WITH StreamlinedMarketUI component AS GUIDE.```

## Completed Tasks
- [x] Fix MarketUI rendering issues
  - [x] Completely rewrote with new StreamlinedMarketUI component
  - [x] Fixed layout and styling issues
  - [x] Implemented clear loading states
  - [x] Improved error handling and fallbacks
  - [x] Replaced refresh button with travel mechanic
  - [x] Added attack chance when traveling to market
- [x] Fix TypeScript errors in StreamlinedMarketUI component
- [x] Ensure proper display of all UI elements
  - [x] Fix TypeScript errors in StreamlinedMarketUI component
  - [x] Verify UI layout and styling across different screen sizes

## Up Next
- [x] Add player profiles and stats tracking
  - [x] Create profile page with player stats
  - [x] Track combat performance metrics
  - [x] Implement achievement system
  - [x] Add visual indicators for progress

## Project Management
- [ ] Update all documentation
  - [ ] Clear all completed tasks from the docs/todo.md and move any remaining tasks to the todo.md in the project root at the bottom of the file.
  - [ ] Create a checklist of all files in the project using the docs/todo.md
  - [ ] Create a checklist of all docs files in the project using the docs/todo.md
  - [ ] Compare the code in each file with each of the docs one at a time, step by step to verify accuracy of the docs to the actual code in the project and correct any errors in the docs without removing any information that might be from intended but unimplemented features. Note these in the docs/todo.md as up to two line comments at the bottom of the file.
  - [ ] Review and update deployment instructions.

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

## Future Features (From Archived Todo)
- [ ] Implement spell progression tech tree system
  - [ ] Design PoE-style spell tree with wizard at center
  - [ ] Create data structure for spell nodes and connections
  - [ ] Implement level-up point system for purchasing connected spells
  - [ ] Design visual tech tree UI with connection paths and node states
  - [ ] Add navigation and interaction for the spell tech tree

- [ ] Add more enemy types
  - [ ] Design new enemy wizards with unique abilities
  - [ ] Create specialized AI strategies for each enemy
  - [ ] Add visual representations for new enemies
  - [ ] Implement enemy-specific loot tables

- [ ] Create procedural content generation
- [ ] Implement multiple difficulty levels
- [ ] Balance spell system
- [ ] Package game for download
