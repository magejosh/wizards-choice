# UI Design Standards for Wizard's Choice

This document outlines the UI design standards for Wizard's Choice, providing guidelines for maintaining a consistent, epic, and magical visual style across the application. These standards incorporate the existing design elements from the Wizard's Study, Deck Builder, Battle Arena, Spell Cards, and Main Menu modals to ensure a cohesive user experience.

## Table of Contents
1. [Design Principles](#design-principles)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Modal Design](#modal-design)
5. [Button Styles](#button-styles)
6. [Form Elements](#form-elements)
7. [Card Components](#card-components)
8. [Spell Cards](#spell-cards)
9. [Battle Arena](#battle-arena)
10. [Wizard's Study](#wizards-study)
11. [Deck Builder](#deck-builder)
12. [Responsive Design](#responsive-design)
13. [Animation Standards](#animation-standards)
14. [Implementation Guidelines](#implementation-guidelines)

## Design Principles

All UI components in Wizard's Choice should adhere to these core principles:

- **Magical Aesthetic**: UI elements should evoke a sense of magic and wonder through glowing effects, gradients, and subtle animations.
- **Epic Feel**: Components should feel substantial and important, with depth created through shadows, borders, and lighting effects.
- **Consistent Theme**: Maintain a cohesive visual language across all screens and components.
- **Responsive Design**: All UI elements must adapt gracefully to different screen sizes.
- **Clear Feedback**: Provide visual feedback for all interactive elements.
- **Accessibility**: Ensure sufficient contrast and readability while maintaining the magical aesthetic.

## Color Palette

The application uses a consistent color palette centered around magical purples and complementary accents:

- **Primary Colors**:
  - Main Purple: `#6a3de8` (Rich purple)
  - Light Purple: `#8c65f7`
  - Dark Purple: `#4a2ba6`
  - Accent Purple: `#b38dff`
  - Highlight Purple: `#9370DB`

- **UI Background Colors**:
  - Deep Background: `#1a1a2e` (Deep space purple)
  - Light Background: `#2d1b4e`
  - Card Background: `rgba(58, 42, 94, 0.5)`
  - Gradient Background: `linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 100%)`

- **Text Colors**:
  - Primary Text: `#ffffff`
  - Secondary Text: `#e0e0ff`
  - Accent Text: `#b38dff`
  - Label Text: `#a280e9`

- **Status/Feedback Colors**:
  - Success: `#4caf50`
  - Warning: `#ff9d00`
  - Danger/Error: `#ff6b84`
  - Info: `#3b7aff`

## Typography

Typography should be consistent across the application:

- **Font Families**:
  - Headings: 'Cinzel', serif
  - Body Text: 'Raleway', sans-serif
  - Monospace (for code): 'Fira Code', monospace

- **Font Sizes**:
  - Modal Titles: 2.2rem (1.8rem on mobile)
  - Section Headings: 1.5rem
  - Subheadings: 1.2rem
  - Body Text: 1rem
  - Small Text: 0.9rem

- **Text Effects**:
  - Headings should have text shadows: `0 0 10px rgba(179, 141, 255, 0.7), 0 0 20px rgba(179, 141, 255, 0.5)`
  - Important labels should have subtle text shadows: `0 0 5px rgba(179, 141, 255, 0.5)`
  - Warning text should have red text shadows: `0 0 5px rgba(255, 107, 132, 0.5)`

## Modal Design

All modals in the application should follow this epic design pattern:

### Container
- Background overlay: `rgba(0, 0, 0, 0.8)` with `backdrop-filter: blur(4px)`
- Modal background: `linear-gradient(135deg, #2d1b4e 0%, #1a1a2e 100%)`
- Border: `2px solid #8a4fff`
- Border radius: `12px`
- Box shadow:
  ```css
  box-shadow:
    0 0 15px rgba(138, 79, 255, 0.5),
    0 0 30px rgba(138, 79, 255, 0.3),
    inset 0 0 10px rgba(138, 79, 255, 0.2);
  ```
- Animation: Subtle floating animation
  ```css
  animation: modalFloat 6s ease-in-out infinite;
  ```
- Background effect: Radial gradients with subtle animation
  ```css
  background:
    radial-gradient(circle at 30% 40%, rgba(138, 79, 255, 0.1) 0%, transparent 40%),
    radial-gradient(circle at 70% 60%, rgba(106, 61, 232, 0.1) 0%, transparent 40%);
  animation: backgroundShift 15s ease-in-out infinite alternate;
  ```

### Header
- Title should be centered with the Cinzel font
- Title should be in ALL CAPS
- Title should have a magical glow effect
- Decorative divider below the header

### Content
- Clear visual hierarchy with proper spacing
- Consistent padding (2rem, 1.5rem on mobile)
- Overflow handling: `overflow-y: auto; overflow-x: hidden;`
- Maximum height: `80vh`
- Width: `90%` with appropriate max-width (500-600px)

### Footer
- Decorative divider above the footer
- Action buttons aligned appropriately (space-between for multiple buttons, center for single button)
- Consistent button styling

### Dividers
Use decorative dividers between sections:
```css
.settings-modal__divider {
  height: 2px;
  background: linear-gradient(to right, transparent, #8a4fff, transparent);
  margin: 1rem 0;
  position: relative;
}

.settings-modal__divider::before {
  content: '✧';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #8a4fff;
  background-color: #2d1b4e;
  padding: 0 10px;
  font-size: 1rem;
}
```

## Button Styles

Buttons should follow these style guidelines:

### Primary Buttons
```css
.magical-button--primary {
  background: linear-gradient(to bottom, #6a3de8, #5a2dd8);
  color: white;
  box-shadow: 0 5px 15px rgba(106, 61, 232, 0.3);
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.magical-button--primary:hover {
  background: linear-gradient(to bottom, #7a4df8, #6a3de8);
  box-shadow:
    0 5px 15px rgba(106, 61, 232, 0.5),
    0 0 10px rgba(106, 61, 232, 0.3);
  transform: translateY(-2px);
}
```

### Secondary Buttons
```css
.magical-button--secondary {
  background: transparent;
  color: #b38dff;
  border: 1px solid #5a3a8e;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.magical-button--secondary:hover {
  background: rgba(90, 58, 142, 0.2);
  border-color: #8a5dff;
  box-shadow: 0 0 10px rgba(138, 79, 255, 0.3);
  transform: translateY(-2px);
}
```

### Danger Buttons
```css
.magical-button--danger {
  background: transparent;
  color: #ff6b84;
  border: 1px solid #ff6b84;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: bold;
  transition: all 0.3s ease;
}

.magical-button--danger:hover {
  background: rgba(255, 107, 132, 0.2);
  border-color: #ff6b84;
  box-shadow: 0 0 10px rgba(255, 107, 132, 0.3);
  transform: translateY(-2px);
}
```

## Form Elements

### Sliders
Sliders should have a magical appearance:
```css
.magical-slider {
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: linear-gradient(to right, #6a3de8 var(--value, 0%), #3a2a5e var(--value, 0%));
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.magical-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #8a4fff;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(138, 79, 255, 0.7);
  transition: all 0.2s ease;
}

.magical-slider::-webkit-slider-thumb:hover,
.magical-slider:active::-webkit-slider-thumb {
  transform: scale(1.2);
  box-shadow: 0 0 15px rgba(138, 79, 255, 0.9);
}
```

### Toggle Switches
Toggle switches should have a magical appearance:
```css
.magical-toggle__switch {
  position: relative;
  width: 50px;
  height: 24px;
  background: #3a2a5e;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.5);
}

.magical-toggle__switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: #b38dff;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.magical-toggle--active .magical-toggle__switch {
  background: #6a3de8;
}

.magical-toggle--active .magical-toggle__switch::after {
  left: calc(100% - 22px);
  background: white;
  box-shadow: 0 0 10px rgba(106, 61, 232, 0.7);
}
```

## Card Components

Generic cards (like save slots, inventory items, etc.) should follow these guidelines:

### Base Card Style
```css
.magical-card {
  background: rgba(58, 42, 94, 0.5);
  border: 2px solid #5a3a8e;
  border-radius: 8px;
  padding: 1.2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.magical-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, transparent 100%);
  pointer-events: none;
}

.magical-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 5px 15px rgba(90, 58, 142, 0.3),
    0 0 10px rgba(138, 79, 255, 0.3);
  border-color: #8a5dff;
}
```

### Save Slot Cards
```css
.magical-save-slot {
  background: rgba(58, 42, 94, 0.5);
  border: 2px solid #5a3a8e;
  border-radius: 8px;
  padding: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 150px;
}

.magical-save-slot--empty {
  border-style: dashed;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #8a5dff;
  font-style: italic;
}

.magical-save-slot--filled {
  border-color: #6a3de8;
  background: linear-gradient(to bottom, rgba(106, 61, 232, 0.2), rgba(58, 42, 94, 0.5));
}
```

### Save Slot Delete Button

Each non-empty save slot card now features a delete button in the bottom right corner:

- **Appearance**: Small, round button with a red gradient background and a white ❌ emoji.
- **Location**: Absolutely positioned in the bottom right of the save slot card.
- **Interaction**: Clicking the button prompts for confirmation and deletes only that save slot. The button is accessible (aria-label, focusable, keyboard accessible).
- **Class**: `.save-slot__delete-btn` (see styles for details).
- **Accessibility**: Button uses `aria-label` and is keyboard focusable for screen readers.

### Card Variations
- Empty cards should use dashed borders
- Filled cards should use solid borders with a subtle gradient background
- Special cards (like rare items) should have enhanced glow effects
- Cards should have a consistent aspect ratio within their category

## Spell Cards

Spell cards are a core UI element and should maintain consistent styling across all views:

### Spell Card Structure
```css
.spellCard {
  width: 100%;
  aspect-ratio: 2/3;
  background-color: #1a1a2e;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  color: #fff;
  max-width: 180px;
  margin: 0 auto;
}

.spellCard:hover:not(.disabled) {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  border-color: #9370DB;
}
```

### Spell Card Elements
- **Header**: Contains the spell name with a background color based on spell type
- **Image Container**: Shows a spell-specific or element-specific image
- **Element/Type Bar**: Displays the spell's element and type with appropriate colors
- **Tier/Mana Row**: Shows the spell's tier and mana cost
- **Description**: Brief explanation of the spell's effect
- **Effects List**: Detailed breakdown of spell effects with icons

### Element-Specific Styling
Spell cards should have a left border color based on their element:
```css
.fire { border-left: 3px solid #ff3b3b; }
.water { border-left: 3px solid #3b9eff; }
.earth { border-left: 3px solid #a67c52; }
.air { border-left: 3px solid #b3e0ff; }
.arcane { border-left: 3px solid #940dd2; }
.nature { border-left: 3px solid #7aff3b; }
.shadow { border-left: 3px solid #746798; }
.light { border-left: 3px solid #f7f6f5; }
```

### Type-Specific Styling
Header background colors should reflect the spell type:
```css
.damage .header { background-color: rgba(255, 59, 59, 0.2); }
.healing .header { background-color: rgba(45, 139, 48, 0.2); }
.buff .header { background-color: rgba(59, 158, 255, 0.2); }
.debuff .header { background-color: rgba(139, 104, 48, 0.2); }
.dot .header { background-color: rgba(193, 59, 255, 0.2); }
.reaction .header { background-color: rgba(48, 139, 139, 0.2); }
```

### Spell Card Variations
- **Disabled**: Reduced opacity and no hover effects for uncastable spells
- **Equipped**: Optional badge or slot number indicator
- **Selected**: Enhanced border/glow for selected spells in modals

## Battle Arena

The Battle Arena should maintain a consistent layout and styling:

### Layout Structure
- **Main Battle Area**: 3D scene with wizard models and spell effects
- **Wizard Stats Panels**: Player and enemy health/mana bars and effects
- **Phase Tracker**: Visual indicator of the current combat phase
- **Spells Area**: Grid of available spell cards
- **Action Buttons**: Mystic Punch and Skip Turn buttons
- **Battle Log**: Scrollable log of combat events

### Color Scheme
- Dark backgrounds with rich purple accents
- Health bars: Green gradient
- Mana bars: Blue gradient for player, purple gradient for enemy
- Phase indicators: Color-coded by phase type

### Battle Elements
```css
/* Wizard stats panels */
.wizardInfo {
  background-color: rgba(10, 10, 15, 0.9);
  border-radius: 8px;
  padding: 1rem;
}

/* Health and mana bars */
.statBarContainer {
  height: 36px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 18px;
  position: relative;
  overflow: hidden;
}

/* Spells container */
.spellsContainer {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.5rem;
  padding: 3px;
}

/* Action buttons */
.actionButton {
  background-color: #6a3de8;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-family: 'Cinzel', serif;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
```

### Consumable Item Cards (Potions & Spell Scrolls)

- During battle, equipped potions and spell scrolls are accessible via two new buttons near the Mystic Punch and Skip Turn buttons: **Belt** (for potions) and **Robes** (for spell scrolls).
- These buttons are only enabled if the player has at least one item equipped in the corresponding slot.
- Pressing a button opens a modal overlay displaying the equipped items as cards.
- Item cards use the same layout and style as spell cards in the hand and as item cards in the inventory/market (see `.itemCard`, `.scrollCard`, and `.spellCard` styles).
- Each card has a **Use** button. When used, the item is consumed (removed from the slot and UI) and its effect is applied in battle.
- The modal uses the same epic modal style as other modals (see `.modalOverlay` and `.modalContent`).
- The rest of the battle arena remains unchanged.

## Wizard's Study

The Wizard's Study should maintain its current layout and styling:

### Layout Structure
- **Header**: Contains title and player info
- **Main Area**: Background scene with action buttons
- **Sidebar**: Player stats, equipped deck, equipment, and scrolls

### Styling Elements
```css
.wizard-study {
  display: flex;
  flex-direction: column;
  width: 97%;
  height: 100dvh;
  height: 100vh; /* Fallback for older browsers */
  background-color: #1d1a2e;
  color: #ffffff;
  padding: 2px;
  overflow: hidden;
  font-family: 'Raleway', sans-serif;
  margin: 0 auto;
}

.wizard-study__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  padding-bottom: 2px;
  border-bottom: 1px solid #3a3a5c;
  background-color: #1a1a2e;
}

.wizard-study__content {
  display: flex;
  flex: 1;
  gap: 2px;
  overflow: hidden;
  height: calc(93vh - 100px);
  box-sizing: border-box;
}

.wizard-study__main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.wizard-study__sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
  background-color: #13132b;
  border-radius: 8px;
  padding: 2px;
  box-sizing: border-box;
}
```

### Button Styles
```css
.wizard-study__action {
  padding: 12px 20px;
  background-color: transparent;
  color: #9370DB;
  border: 1px solid #3a3a5c;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
  text-align: center;
  margin-bottom: 5px;
}

.wizard-study__action:hover {
  background-color: rgba(147, 112, 219, 0.1);
  border-color: #9370DB;
}

.wizard-study__action--primary {
  background-color: #9370DB;
  color: white;
  font-size: 18px;
  border: none;
  padding: 15px 20px;
  border-radius: 4px;
}
```

### Sidebar Elements
```css
.wizard-study__sidebar-title {
  font-size: 18px;
  color: #9370DB;
  margin-top: 0;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 1px solid #3a3a5c;
  font-family: 'Cinzel', serif;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.wizard-study__player-stats,
.wizard-study__equipped-deck,
.wizard-study__equipment,
.wizard-study__scrolls {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 95%;
  background-color: transparent;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid #3a3a5c;
  box-sizing: border-box;
  margin: 0 auto;
}
```

## Deck Builder

The Deck Builder should maintain its current layout and styling:

### Layout Structure
- **Header**: Title and close button
- **Help Section**: Collapsible instructions
- **Decks List**: List of saved decks
- **Deck Actions**: Create, equip, and delete buttons
- **Editing Area**: Currently selected deck's spells
- **Spell Collection**: Grid of available spells with filters

### Styling Elements
```css
.deck-builder {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100dvh;
  height: 100vh; /* Fallback for older browsers */
  background-color: #0c0c1d;
  color: #ffffff;
  padding: 20px;
  overflow: auto;
  font-family: 'Raleway', sans-serif;
}

.deck-builder__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
}

.deck-builder__header h2 {
  font-size: 28px;
  color: #9370DB;
  margin: 0;
  font-family: 'Cinzel', serif;
  text-transform: uppercase;
  letter-spacing: 1px;
}
```

### Deck Items
```css
.deck-builder__deck-item {
  background-color: #13132b;
  border: 1px solid #3a3a5c;
  border-radius: 4px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.deck-builder__deck-item:hover {
  border-color: #9370DB;
  box-shadow: 0 0 10px rgba(147, 112, 219, 0.3);
}

.deck-builder__deck-item--selected {
  border-color: #9370DB;
  background-color: rgba(147, 112, 219, 0.1);
}
```

### Spell Grid
```css
.deck-builder__spells-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
  padding: 2px;
}

.deck-builder__deck-slots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 0.5rem;
  margin-bottom: 20px;
  padding: 3px;
}
```

### Button Styles
```css
.deck-builder__deck-action {
  padding: 10px 16px;
  background-color: #9370DB;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  flex: 1;
  font-weight: bold;
  text-align: center;
}

.deck-builder__deck-action:hover:not(:disabled) {
  background-color: #a280e9;
}
```

## Responsive Design

All UI components must be responsive:

- Use relative units (rem, %, vh/vw) instead of fixed pixel values
- Implement different layouts for mobile and desktop
- Adjust font sizes, padding, and margins for different screen sizes
- Use CSS Grid and Flexbox for responsive layouts
- Test on various screen sizes and orientations
- Use `100dvh` for full-screen containers with `100vh` as a fallback to avoid mobile browser UI issues

### Mobile Adjustments
```css
@media (max-width: 768px) {
  /* Reduce padding */
  .modal-content {
    padding: 1.5rem;
    width: 95%;
  }

  /* Reduce font sizes */
  .modal-title {
    font-size: 1.8rem;
  }

  /* Adjust layouts */
  .grid-layout {
    grid-template-columns: 1fr;
  }

  /* Adjust button sizes */
  .magical-button {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
}
```

## Animation Standards

Animations should be subtle and enhance the magical feel:

### Modal Float Animation
```css
@keyframes modalFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
```

### Background Shift Animation
```css
@keyframes backgroundShift {
  0% { transform: rotate(0deg) scale(1); }
  100% { transform: rotate(5deg) scale(1.1); }
}
```

### Hover Transitions
All interactive elements should have smooth transitions:
```css
transition: all 0.3s ease;
```

## Implementation Guidelines

When implementing UI components:

1. **Use the Existing CSS Classes**: Leverage the classes in `settings-modal.css` and other style files.
2. **Follow BEM Naming Convention**: Use Block__Element--Modifier pattern for class names.
3. **Maintain Separation of Concerns**: Keep styles in CSS files, not inline styles.
4. **Reuse Components**: Use existing components when possible rather than creating new ones.
5. **Test Across Devices**: Ensure components work well on desktop, tablet, and mobile.
6. **Maintain Accessibility**: Ensure sufficient contrast and keyboard navigation.
7. **Document New Components**: Add new components to this documentation.

### Example Modal Implementation

```jsx
<div className="epic-modal">
  <div className="epic-modal__content">
    <div className="epic-modal__header">
      <h2 className="epic-modal__title">MODAL TITLE</h2>
    </div>

    <div className="settings-modal__divider"></div>

    <div className="epic-modal__body">
      {/* Modal content goes here */}
    </div>

    <div className="settings-modal__divider"></div>

    <div className="settings-modal__actions">
      <button className="magical-button magical-button--secondary">
        Cancel
      </button>
      <button className="magical-button magical-button--primary">
        Confirm
      </button>
    </div>
  </div>
</div>
```

---

By following these UI design standards, we ensure a consistent, epic, and magical user experience throughout Wizard's Choice. These standards should be applied to all new UI components and used when updating existing ones.
