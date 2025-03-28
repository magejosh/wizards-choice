# Wizard's Choice Refactor Proposal
Implementing robust patterns for card-based mechanics

## Current vs Proposed Structure

### Card Management

```mermaid
flowchart TD
    subgraph Current
        SpellCard[SpellCard Component] --> CombatEngine[Combat Engine]
        CombatEngine --> StateManagement[Mixed State Management]
    end

    subgraph Proposed
        CardWidget[Card Widget] --> HandManager[Hand Manager]
        HandManager --> DeckManager[Deck Manager]
        DeckManager --> GameState[Centralized State]
    end
```

## Key Improvements

### 1. Widget-Based Card System
A dedicated widget system for spell cards provides better encapsulation and state management:

```typescript
interface SpellCardWidget {
    state: {
        isFlipped: boolean;
        zIndex: number;
        position: Vector2;
    };
    
    // Core methods
    flip(): void;
    setPosition(pos: Vector2): void;
    updateVisuals(): void;
}
```

### 2. Hand Management
A dedicated hand management system handles card organization and interactions:

```mermaid
flowchart LR
    subgraph HandManager
        Cards[Active Cards] --> Layout[Layout System]
        Layout --> Animation[Animation Handler]
        Animation --> Interaction[Interaction Events]
    end
```

### 3. Deck Organization
A structured deck management system improves card flow and game state:

```typescript
class SpellDeck {
    private drawPile: Spell[];
    private discardPile: Spell[];
    
    drawCard(): Spell;
    shuffleDiscard(): void;
    addToDiscard(spell: Spell): void;
}
```

## Implementation Priority

1. **Card Component Refactor**
   - Convert SpellCard to widget-based system
   - Implement proper state management
   - Add animation support

2. **Hand Management**
   - Create dedicated hand manager
   - Implement card positioning
   - Add drag-and-drop support

3. **Deck System**
   - Centralize deck management
   - Implement proper shuffle mechanics
   - Add discard pile handling

## State Flow

```mermaid
stateDiagram-v2
    [*] --> DrawPhase
    DrawPhase --> HandPhase
    HandPhase --> PlayPhase
    PlayPhase --> DiscardPhase
    DiscardPhase --> DrawPhase
    
    note right of HandPhase
        Improved card positioning
        and interaction handling
    end note
```

## Code Examples

### Current Combat Engine
```typescript
// Current implementation with mixed concerns
export function drawCards(state: CombatState, isPlayer: boolean, count: number) {
    // Mixed concerns and complex state management
}
```

### Proposed Refactor
```typescript
// Structured approach with clear separation of concerns
class SpellManager {
    private handManager: HandManager;
    private deckManager: DeckManager;

    drawCards(count: number): void {
        const cards = this.deckManager.draw(count);
        this.handManager.addCards(cards);
    }

    playCard(card: Spell): void {
        this.handManager.removeCard(card);
        this.deckManager.addToDiscard(card);
    }
}
```

## UI Improvements

```mermaid
flowchart TD
    subgraph CardUI
        Base[Base Card] --> Spell[Spell Variant]
        Spell --> Effects[Visual Effects]
        Effects --> Animations[Animations]
    end
```

## Migration Steps

### Phase 1: Card Components
1. Create SpellCardWidget base class
2. Migrate existing SpellCard functionality
3. Implement proper state handling

### Phase 2: Hand Management
1. Create HandManager class
2. Implement card positioning logic
3. Add interaction handling

### Phase 3: Deck System
1. Create DeckManager class
2. Implement draw/discard mechanics
3. Add shuffle functionality

## Technical Benefits

1. **Improved Organization**
   - Clear separation of concerns
   - Better state management
   - Modular components

2. **Enhanced Maintainability**
   - Isolated card logic
   - Cleaner combat engine
   - Easier debugging

3. **Better User Experience**
   - Smoother animations
   - Responsive interactions
   - Consistent behavior

## Technical Implementation Addendum

### Rendering Layer Enhancement
While maintaining our widget-based architecture and game mechanics, we'll enhance the visual implementation:

```mermaid
flowchart TD
    subgraph Architecture
        Widget[Widget System] --> Render[Rendering Layer]
        Render --> Phaser[Phaser.js]
        Render --> ThreeJS[Three.js]
    end
```

### Hybrid Rendering Approach
- Maintain Three.js for existing 3D spell effects where beneficial
- Integrate Phaser.js for optimized 2D card mechanics:
  ```typescript
  class SpellCardWidget extends BaseWidget {
      private phaserSprite?: Phaser.GameObjects.Sprite;
      private threeJSEffect?: THREE.Object3D;
      
      render() {
          this.update2DElements();
          if (this.hasSpecialEffect) {
              this.update3DEffects();
          }
      }
  }
  ```

### Performance Optimizations
- Use Phaser.js for card movement and basic interactions
- Reserve Three.js for premium visual effects
- Implement smart switching between rendering modes based on device capabilities

### Integration with Existing Systems
- Card Widget System remains unchanged
- Hand Management logic preserved
- Deck Organization maintains current structure
- Enhanced visual feedback through new rendering capabilities

This addition provides performance improvements while preserving all existing gameplay mechanics and special effects.

## Notes
- Maintain spell-specific features and effects
- Focus on improving core card mechanics
- Preserve existing game rules and balance
- Retain combat system uniqueness
    - Implement creature spell cards that:
        - Provide automatic attack/defense capabilities
        - Use power value for attack damage
        - Use toughness for damage absorption before player takes damage
        - Reset toughness/health at turn end if not destroyed
        - Die when taking toughness value in damage during one turn before turn ends
        - Cost an amount of mana to cast/summon and an equal amount to maintain each turn. Amount equal to half the creature's total power+toughness+1 rounded up to nearest whole number. 
