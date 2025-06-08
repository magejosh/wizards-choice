# CardMagic Game System Analysis

## Component Relationships

### Widget Hierarchy
1. `app` widget (root component):
   - Orchestrates game flow
   - Contains and initializes other widgets
   - Handles button events (load deck, deal hand, shuffle, etc.)
   - Manages containers for different card zones

2. `deckofcards` widget:
   - Manages deck state and card collection
   - Handles deck operations (shuffle, draw)
   - Creates individual `card` widgets
   - Maintains zone arrays (currentFullDeck, graveYard, unusedCards, exiledCards)
   - Loads deck data from JSON

3. `card` widget:
   - Represents individual cards
   - Handles card interactions (tap/untap, flip, drag-drop)
   - Manages state via FSM
   - Can be contained in different containers

4. `container` widget:
   - Provides zones for cards
   - Handles card positioning and alignment
   - Manages drag-drop functionality
   - Maintains contained cards array

5. `handofcards` widget:
   - Specialized container for player's hand
   - Handles dealing cards
   - Manages hand-specific operations

### Component Flow
```
app
├── deckofcards (creates) → card widgets
├── containers (various zones that can hold cards)
└── handofcards (specialized container for hands)
```

## Card State Management System

### Available States
1. `initial`:
   - Starting state
   - Enables dragging
   - Transitions to `dealt` state

2. `dealt`:
   - Transitions to `untapped` state
   - Represents card being dealt to player

3. `untapped`:
   - Default playable state
   - Can transition to:
     - `tapped` (via tap action)
     - `zoomed` (via view action)
   - Handles mouse enter/exit events

4. `tapped`:
   - Represents tapped card (rotated 90 degrees)
   - Can transition to:
     - `untapped` (via untap action)
     - `zoomed` (via view action)
   - Handles mouse enter/exit events

5. `zoomed`:
   - Enlarged view state
   - Disables dragging
   - Scales card up 300%
   - Can return to previous state

### State Transitions
- Managed through feather.FiniteStateMachine
- Each state defines allowed transitions
- States can have entry/exit actions
- Mouse events can trigger state changes

## Card Loading and Rendering

### Deck Loading Process
1. JSON deck file is loaded via `loadDeck()` in `deckofcards` widget
2. For each card in JSON:
   - Creates new card widget
   - Loads card image
   - Creates card object with metadata
   - Adds to currentFullDeck array

### Card Creation Flow
1. `createCardWidget()` creates new widget instance
2. Card metadata assigned (name, attack, defense, etc.)
3. Image loaded via `loadCard()`
4. Widget initialized with event bindings
5. Added to appropriate container

### Rendering
- Cards rendered as HTML elements with images
- Position managed by container widgets
- Visual effects (tap, flip, zoom) via CSS transforms
- Preview functionality shows enlarged card image

## Drag and Drop System

### Implementation
- Uses jQuery UI draggable/droppable
- Cards are draggable elements
- Containers are droppable zones

### Draggable Configuration
- Cards configured with:
  - revert: 'invalid'
  - containment: 'window'
  - distance: 15
  - opacity: 1

### Container Drop Handling
1. Container receives dropped card
2. Calculates best position for card
3. Updates internal array of cards
4. Realigns all cards in container
5. Handles invalid drops with revert

### Position Management
- Automatic spacing between cards
- Handles overflow with card overlap
- Maintains z-index ordering
- Animates position changes

## Client-Server Communication

### Feather Framework Structure
1. Server-side components:
   - Widget definitions
   - API endpoints
   - Resource handling

2. Client-side components:
   - Widget implementations
   - Event handling
   - UI rendering

### Communication Flow
- Widgets defined on server (`*.server.js`)
- Client implementations in `*.client.js`
- Resources managed through feather cache
- AJAX used for system operations

### Widget Loading
1. Server defines widget structure
2. Client loads widget resources
3. Widget initialized on client
4. Events bound to DOM elements

### Data Flow
- JSON deck data loaded from server
- Card images served as resources
- State maintained on client
- Server handles widget initialization