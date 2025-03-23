# Wizard's Choice UI Components Documentation

## Spell Selection Screen

The Spell Selection screen allows players to choose spells for battle from their unlocked spells list.

### Components

1. **Available Spells Container** (`#available-spells-container`)
   - Displays selectable spell cards for the player
   - Each spell card shows:
     - Spell name
     - Spell type (fire, water, earth, etc.)
     - Mana cost
     - Damage value
     - Healing value (if applicable)

2. **Spell Selection Footer** (`#spell-selection-footer`)
   - Contains:
     - Spells Selected Counter (`#spells-selected-counter`): Shows "X/3 Spells Selected"
     - Start Battle Button (`#start-battle-button`): Begins battle when 3 spells are selected

### Behavior

- Players can select up to 3 spells for their battle hand
- Selected spells are highlighted with a gold border and glow effect
- The Start Battle button is disabled until exactly 3 spells are selected
- Clicking on a selected spell will deselect it
- Attempting to select more than 3 spells shows a notification

### Technical Implementation

- The GameManager class handles spell selection logic in the `showSpellSelection()` method
- The `updateSelectionUI()` function maintains the counter and button state
- Button state is updated immediately after each spell selection/deselection
- Important variables (`selectedSpells` and `MAX_SELECTED_SPELLS`) are scoped at the appropriate level to avoid reference errors
- The Start Battle button directly triggers the `initializeBattle()` method when clicked
- Event listener is attached to the existing button rather than replacing the element
- Debug features are available in debug.html to test button functionality

### Implementation Notes

#### Start Battle Button Event Handling

The Start Battle button uses a direct event listener approach for maximum reliability:

```javascript
// Find the Start Battle button
const startBattleButton = document.getElementById('start-battle-button');

// Safely attach event listener
if (startBattleButton) {
    // Add click handler that processes selected spells
    startBattleButton.addEventListener('click', (e) => {
        if (selectedSpells.length === MAX_SELECTED_SPELLS) {
            // Set player spell hand
            this.spellSystem.setPlayerSpellHand(selectedSpells);
            // Initialize battle with selected spells
            this.initializeBattle();
        }
    });
}

## Game UI Screen

The main battle interface where players cast spells and battle opponents.
