Here's a clear breakdown of the Wizard's Choice architecture:

### Core Architecture
- **Frontend Framework**: Next.js with React, using TypeScript
- **3D Rendering**: Three.js via React Three Fiber
- **State Management**: Zustand for centralized game state
- **Data Persistence**: IndexedDB for local storage

### Key Modules

1. **Game State (`src/lib/game-state/`)**
- Central state management using Zustand
- Handles saving/loading game progress
- Manages player stats, inventory, and progression
- Tracks achievements and battle records

2. **Combat System (`src/lib/combat/`)**
- `combatEngine.ts`: Core battle mechanics
- `aiEngine.ts`: Enemy AI decision making
- Integrates with 3D visualization
- Embedded enemy turns directly in player action handlers for improved flow
- Visual "Enemy's Turn" indicator with animated styling

3. **Spell System (`src/lib/spells/`)**
- Spell definitions and effects
- Tech tree progression
- Deck building mechanics

4. **Battle UI (`src/components/battle/`)**
```
BattleArena.tsx
├── BattleScene.tsx (3D environment)
├── WizardModel.tsx (3D characters)
└── SpellEffect3D.tsx (Visual effects)
```

5. **Market System (`src/lib/features/market/`)**
- Handles transactions
- Inventory management
- Market attack encounters

### Data Flow
```
User Action → UI Component → Game State Store → Combat/Market Engine → State Update → UI Update
```

### Integration Points

1. **Authentication**
- `authService.ts` handles user management
- Integrates with game state persistence

2. **Save System**
- Game state persists to IndexedDB
- Multiple save slots per user
- Automatic saving at key points

3. **3D Rendering**
- Three.js integration via React Three Fiber
- Spell effects and character animations
- Battle arena visualization

4. **Profile System**
- Tracks achievements, titles, battle history
- Integrates with combat and progression systems
- Persistent player statistics

### Recent Improvements

- **Battle System Flow (2025-03-30)**: 
  - Redesigned battle flow with embedded enemy turns in player action handlers
  - Eliminated race conditions and state management issues with the previous timer-based approach
  - Added clear visual "Enemy's Turn" indicator with animated styling
  - Enhanced safety mechanisms to detect and recover from stuck animation states
  - Extended timing between turns for better player experience

This architecture supports a single-player tactical game with future multiplayer considerations built into the design.


# Wizard's Choice - High-Level Optimization Refactoring Plan

Based on the codebase analysis, here are the key areas for high-impact refactoring:

1. **Combat Engine Optimization**
````typescript path=src/lib/combat/combatEngine.ts mode=EXCERPT
// Deprecated code still in use
export function _legacyGetAISpellSelection(state: CombatState): Spell | null {
  const enemyWizard = state.enemyWizard.wizard;
  const availableSpells = enemyWizard.equippedSpells.filter(
    spell => spell.manaCost <= state.enemyWizard.currentMana
  );
````

- Remove deprecated `_legacyGetAISpellSelection` function
- Move spell filtering logic to shared utility functions
- Implement memoization for expensive calculations

2. **Battle Component Duplication**
There are two nearly identical BattleArena components:
- `src/lib/ui/components/BattleArena.tsx`
- `src/components/battle/BattleArena.tsx`

Consolidate these into a single component to reduce maintenance overhead.

3. **State Management Optimization**
````typescript path=src/lib/game-state/gameStateStore.ts mode=EXCERPT
const initialGameState: GameState = {
  player: generateDefaultWizard(''),
  gameProgress: {
    // Large nested object with redundant data
    playerStats: {
      battlesTotal: 0,
      battlesWon: 0,
      // ... many more stats
    }
  }
}
````

- Split large state object into smaller, focused slices
- Implement selective state updates to prevent unnecessary re-renders
- Add state selectors for better performance

4. **3D Scene Performance**
````typescript path=src/components/battle/BattleScene.tsx mode=EXCERPT
return (
  <>
    <ambientLight intensity={0.3} />
    <directionalLight position={[10, 10, 5]} intensity={1} />
    <Environment preset="night" />
    <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
````

- Implement proper LOD (Level of Detail) system
- Add object pooling for spell effects
- Use instanced meshes for particle systems
- Implement proper cleanup for 3D effects

5. **Type System Improvements**
````typescript path=src/lib/types.ts mode=EXCERPT
export interface CombatState {
  playerWizard: CombatWizard;
  enemyWizard: CombatWizard;
  // ... other properties
}
````

- Create more specific types instead of using `any`
- Add strict type checking for spell effects
- Implement discriminated unions for better type safety

6. **AI Strategy Pattern Refactoring**
````typescript path=src/lib/combat/aiEngine.ts mode=EXCERPT
class BaseAIStrategy implements AIStrategy {
  abstract selectSpell(state: CombatState): Spell | null;
  // ... shared methods
}
````

- Move common strategy methods to utility functions
- Implement strategy composition instead of inheritance
- Add performance metrics for strategy evaluation

7. **Component Architecture**
- Implement React.memo() for heavy components
- Add ErrorBoundary components
- Implement proper Suspense boundaries
- Add loading states for async operations

8. **Testing Infrastructure**
- Add unit tests for core game logic
- Implement performance testing
- Add integration tests for critical paths

9. **Code Organization**
- Move shared utilities to a common location
- Implement proper module boundaries
- Add proper documentation for public APIs

10. **Performance Monitoring**
- Add performance metrics collection
- Implement proper error tracking
- Add telemetry for critical paths

These improvements would significantly enhance:
- Runtime performance
- Code maintainability
- Type safety
- Testing coverage
- Development experience

The most immediate high-impact changes would be:
1. Consolidating the duplicate BattleArena components
2. Implementing proper 3D scene optimizations
3. Adding proper type safety
4. Removing deprecated code

These changes align with the best practices mentioned in the technical documentation and would provide immediate benefits while setting up for future improvements.
