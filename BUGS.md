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

1. Create a new streamlined MarketUI component with simpler state management
2. Implement strong error boundaries and visual debugging elements
3. Ensure proper z-index and display properties to guarantee visibility
4. Add detailed logging for each step of the market rendering process
5. Implement the removal of the refresh button and addition of the travel mechanic
6. Ensure market inventory properly regenerates on a timer (hourly) rather than on demand

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