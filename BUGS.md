# Market UI Rendering Issues

## Problem Description
The MarketUI component in the Wizard's Choice game fails to render properly. When clicking the market button in the Wizard Study screen, only the background appears with no content.

## Complete MarketUI Refactoring Plan

After multiple attempts to fix individual issues, we need a complete refactoring approach.

### Core UI Elements

1. **Market Container**
   - Main fixed-position container centered on screen
   - Handles overall layout and styling

2. **Market Header**
   - "Wizard's Choice" logo positioned on top left
   - "<locationName> Market" title centered on page without overlapping the logo
   - Gold amount display showing player's current gold
   - "Leave Market" button - *Interactable*: Closes market UI

3. **Market Controls**
   - Market selection dropdown - *Interactable*: Changes selected market
   - Market description text showing details about the selected market
   - Travel button - *Interactable*: Allows travel between markets with chance of market attack
     - Travel mechanics: No actual wait time, but higher chance of market attack based on distance
     - Distance units based on relative position in market unlock scale

4. **Tab Navigation**
   - Ingredients tab - *Interactable*: Shows ingredient items
   - Potions tab - *Interactable*: Shows potion items
   - Equipment tab - *Interactable*: Shows equipment items

5. **Mode Toggle**
   - Buy mode button - *Interactable*: Switches to buying from market
   - Sell mode button - *Interactable*: Switches to selling to market

6. **Search Bar**
   - Input field - *Interactable*: Filters items by name

7. **Main Content Area**
   - Grid of item cards
   - "No items available" message when appropriate (only when player has purchased all items before inventory regeneration)

8. **Item Cards**
   - Item name
   - Item price
   - Visual styling based on rarity
   - *Interactable*: Selects item when clicked

9. **Selected Item Details** (appears when item is selected)
   - Item name and description
   - Purchase/sell controls
   - Quantity selector - *Interactable*: Adjusts quantity
   - Buy/Sell button - *Interactable*: Completes transaction

### Market Attack Mechanics

- Market attacks do not occur while browsing the market screen
- Attacks can trigger randomly when:
  1. Player changes market locations via the travel function
  2. Player clicks the "Leave Market" button
- When a market attack occurs, player is taken to the battle arena
- Attackers can be bandits, rogues, or monster attackers (random selection)
- If player loses, attackers take items depending on the type of attacker

### Implementation Approach

1. **Loading-First Architecture**
   - Implement a dedicated loading screen that appears immediately when the market UI is opened
   - Pre-load ALL necessary market data before attempting to render any UI elements
   - Use explicit loading states with visual feedback (progress indicators, animated elements)
   - Only transition to the full UI when data readiness is confirmed

2. **Phased Rendering**
   - Phase 1: Render market selection interface with available markets list only
   - Phase 2: Only render inventory after market selection and travel completion
   - Phase 3: Show filtered items only after tab selection and search criteria are applied
   - Each phase waits for data confirmation before proceeding

3. **Market Selection and Travel Flow**
   - Allow users to select a market from dropdown without loading that market's inventory
   - Only load market inventory after the Travel button is clicked and any market attack is resolved
   - This creates a clear data dependency chain: selection → travel → (possible battle) → inventory loading

4. **Graceful Inventory Regeneration**
   - Implement market inventory regeneration on a timer (hourly)
   - Do NOT update inventory while player is viewing the market
   - Store regeneration events and apply them only when player closes and reopens the market
   - Add visual indicator if regeneration has occurred since last visit

5. **Atomic State Management**
   - Use a dedicated reducer for market state to handle complex state transitions as atomic operations
   - Keep market data in a normalized structure with clear relationships
   - Implement explicit data synchronization mechanisms instead of relying on React's rendering cycle

6. **Error Prevention and Recovery**
   - Add comprehensive error boundaries with meaningful fallbacks at multiple levels
   - Implement data validation checks before any rendering attempt
   - Include self-healing mechanisms that can recover from incomplete or corrupted state
   - Provide emergency "reset market data" option for users experiencing persistent issues

7. **Enhanced Debugging**
   - Add detailed logging for each step of the market rendering process
   - Include DOM verification to confirm elements are actually being rendered
   - Track timing of data loading, state updates, and UI rendering phases
   - Log warnings for unexpected or out-of-sequence operations

8. **Styling and Visibility Guarantees**
   - Use a combination of CSS modules and critical inline styles for maximum reliability
   - Implement guaranteed visibility properties for all key UI elements
   - Set explicit z-index values and positioning to prevent conflicts with other components
   - Use !important flags sparingly but strategically for critical visibility properties

## Symptoms
- Only the background of the MarketUI is visible
- Console logs indicate the component is mounting and data is being fetched correctly
- React error: "Removing unpermitted intrinsics" appears in console
- React error: "Cannot update a component while rendering a different component"
- React error: "React has detected a change in the order of Hooks called by BasicMarketUI"
- React error: "Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined"

## Root Causes Identified
1. **React Hooks Rule Violations**
   - Hooks being conditionally called, breaking React's rules
   - State updates occurring directly during rendering phase

2. **Unsafe Data Access**
   - Accessing data directly in render without proper error handling
   - Direct calls to state-updating functions during rendering

3. **Component Lifecycle Issues**
   - No cleanup functions to prevent state updates after component unmount
   - Dependency cycles in useEffect hooks causing infinite re-renders

4. **Data Structure Issues**
   - Possible empty or malformed data causing silent rendering failures
   - Missing or undefined properties in nested objects
   - Type mismatches between expected and actual data
   - Conditional rendering that doesn't account for empty arrays or other edge cases

5. **CSS Module Duplication**
   - Discovered duplicate CSS module files:
     - `src/lib/ui/styles/MarketUI.module.css`
     - `src/lib/ui/components/styles/MarketUI.module.css`
   - Component currently uses inline styles but may have previously used CSS modules
   - Path confusion could cause the component to look for styles in the wrong location
   - The component might be attempting to use CSS classes that aren't properly imported

6. **Import/Export Mismatch**
   - WizardStudy.tsx imports MarketUI as a named import: `import { MarketUI } from './MarketUI'`
   - But MarketUI.tsx exports it as a default export: `export default MarketUIWithErrorBoundary`
   - This causes the "Element type is invalid" error when rendering the component

7. **Component Recursion Problem**
   - After changing MarketUI to a named export, we encountered a component recursion issue
   - The renamed component structure creates an infinite render loop
   - MarketUI renders MarketUIBase and creates a circular dependency

8. **CSS Rendering Issues**
   - Despite proper imports and component structure, CSS styles might have problems
   - Possible z-index conflicts, incorrect position values, or zero opacity settings
   - CSS classes might not be applied correctly to all necessary elements

9. **Conditional Rendering Logic Errors**
   - One or more conditional rendering checks might be failing silently
   - Conditions might evaluate differently than expected, preventing content display

10. **Parent-Child Component Structure Problems**
    - The nested structure with ErrorBoundary might be interrupting proper rendering
    - Component props might not be properly passed down through component layers

## Previous Solutions Attempted

### 1. CSS Fixes
- Changed import paths from '../styles/MarketUI.module.css' to './styles/MarketUI.module.css'
- **Result:** No improvement, indicating the issue was not solved by simply changing the import path

### 2. Test Components
- Created SimpleMarketUI with minimal functionality and inline styles
- Created BasicMarketUI for step-by-step debugging
- **Result:** Test components rendered correctly, helping isolate the issue

### 3. React Hooks Restructuring
- Moved all hooks to the top level to ensure they're called in the same order on every render
- Eliminated conditional hook calls
- **Result:** Reduced hooks-related errors but didn't fully resolve rendering issues

### 4. Data Fetching Improvements
- Moved data fetching (getMarkets, getPlayerGold) from render to useEffect
- Added local state variables to store fetched data
- **Result:** Eliminated "Cannot update a component while rendering a different component" error

### 5. Error Handling Enhancement
- Added try/catch blocks around critical operations
- Implemented fallback UIs for different error states
- **Result:** Improved stability but didn't solve core rendering problem

### 6. Component Unmount Handling
- Added cleanup functions in useEffect to set an isMounted flag
- Prevented state updates after component unmount
- **Result:** Eliminated some state-related errors

### 7. Dependency Management
- Reduced dependencies in useEffect hooks to prevent cycles
- Used empty dependency arrays where appropriate to run effects only on mount
- **Result:** Reduced re-render issues but some dependencies may still be problematic

### 8. Component Simplification
- Temporarily stripped down the component to basic functionality
- Incrementally added features back to identify breaking points
- **Result:** Helped isolate issues but led to temporary loss of functionality

### 9. Inline Styles Conversion
- Switched from using CSS modules to inline styles
- **Result:** Eliminated potential CSS-related rendering issues but may not be the optimal long-term solution. (Definitely not the solution and should be corrected ASAP)

### 10. ErrorBoundary Implementation
- Added ErrorBoundary around MarketUI component to catch React errors
- Implemented fallback UI that allows users to return to the Wizard's Study
- **Result:** Successfully catches rendering errors and provides a graceful fallback, but doesn't fix the underlying issue

### 11. Import/Export Mismatch Fix
- Changed MarketUI.tsx to use named exports instead of default exports
- Renamed internal component to MarketUIBase to avoid naming conflicts
- **Result:** Created a component recursion problem where MarketUI tried to render MarketUIBase in an infinite loop

### 12. Simplified Market Data Approach
- Implemented a player-specific market model instead of shared market
- Added refresh mechanics based on time intervals
- Simplified data flow and state management
- **Result:** Improved code organization but did not fix rendering issues

### 13. Direct DOM Manipulation
- Added code to directly insert a market UI element into the DOM using vanilla JavaScript
- Created a basic UI with high z-index and fixed positioning
- **Result:** Successfully displayed an emergency market UI, confirming that the issue is with React rendering

### 14. CSS Overrides
- Added !important flags to critical CSS properties
- Increased z-index values to maximum possible
- **Result:** No improvement in the regular MarketUI component visibility

### 15. EmergencyMarketUI Component
- Created a standalone EmergencyMarketUI component with minimal dependencies
- Used inline styles with high z-index and direct DOM inspection
- **Result:** Successful rendering, but not a proper solution for the main component

## Current Status
Despite multiple approaches and fixes, the Market UI still exhibits rendering issues. Console logs show the component initializes correctly and fetches data but nothing appears on screen except the background. No errors are shown in the console, suggesting a silent rendering failure.

A complete refactoring of the MarketUI component is needed, as outlined in the plan above, to resolve these persistent issues.

## References
- [React Hooks Rules](https://reactjs.org/docs/hooks-rules.html)
- [React Error Boundaries](https://reactjs.org/docs/error-boundaries.html)
- [React State Updates](https://reactjs.org/docs/state-and-lifecycle.html#state-updates-may-be-asynchronous)
- [React Import/Export](https://reactjs.org/docs/code-splitting.html#named-exports)
- [CSS z-index and stacking contexts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)

# StreamlinedMarketUI Remaining Issues

## Problem Description
While the new StreamlinedMarketUI component successfully renders and allows for user interaction, there are a few functional issues that need to be addressed:

1. **Gold Deduction Not Working**: When purchasing items, the player's gold amount is not properly depleted by the item's cost.
   
2. **Inventory Update Not Working**: Purchased items are not being added to the player's inventory.
   
3. **Market Quantity Not Updating**: The market inventory quantity doesn't decrease when items are purchased.

## Implementation Approach

1. **Fix Transaction Logic**
   - Investigate the buyItem and sellItem functions in the game state store
   - Ensure proper parameters are being passed to these functions
   - Verify that the functions are properly updating the game state
   - Add logging to trace the flow of data during transactions

2. **Inventory Synchronization**
   - Add state update after successful transactions to refresh displayed gold amount
   - Ensure inventory state is properly updated after transactions
   - Verify item data structure matches what's expected by the inventory system

3. **Market Inventory Updates**
   - Ensure market item quantities are properly decremented on purchase
   - Add refresh mechanism to update UI after transactions
   - Check for race conditions or asynchronous issues in state updates 

## Fixed Issues

### StreamlinedMarketUI Transaction Issues (Fixed 2025-03-31)
1. **Gold Deduction Not Working (Fixed)**
   - Issue: Player's gold amount was not properly depleted by the item's cost.
   - Fix: Replaced indirect helper function calls with direct state updates to ensure gold was properly deducted when buying items.

2. **Inventory Update Not Working (Fixed)**
   - Issue: Purchased items were not being added to the player's inventory.
   - Fix: Implemented direct inventory updates within the transaction functions instead of relying on helper methods that weren't properly updating state.

3. **Market Quantity Not Updating (Fixed)**
   - Issue: The market inventory quantity didn't decrease when items were purchased.
   - Fix: Improved market inventory update logic and added UI refresh mechanisms to reflect the updated quantities.

### Implementation Approach (Applied Successfully)
- **Transaction Logic Fixes**: Modified both buyItem and sellItem functions to use direct state updates instead of helper functions.
- **State Synchronization**: Implemented a comprehensive state update approach that updates all relevant parts of the state in a single operation.
- **UI Refresh**: Added mechanisms to force UI refreshes after transactions complete to ensure changes are reflected immediately.
- **Testing**: Verified that gold, inventory, and market quantities are all properly updated. 