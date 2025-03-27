# StreamlinedMarketUI Test Plan

## Overview
This document outlines the test plan for the new StreamlinedMarketUI component implemented to resolve rendering issues with the original MarketUI component.

## Testing Objectives
1. Verify proper loading and rendering of the market UI
2. Test market selection functionality
3. Verify travel mechanic and market attack random chance
4. Test tab navigation and mode switching
5. Verify proper display of market inventory
6. Test item selection and details panel
7. Verify buying and selling mechanics
8. Test search functionality
9. Verify error handling and edge cases
10. Test performance and responsiveness

## Test Cases

### 1. Loading and Initial Rendering
- [ ] Open the Wizard's Study screen
- [ ] Click the Market button
- [ ] Verify that the loading screen appears
- [ ] Confirm the progress indicator works correctly
- [ ] Verify that market data loads successfully
- [ ] Confirm that the market UI renders completely with all elements visible

### 2. Market Selection
- [ ] Verify that the market dropdown contains all markets appropriate for player level
- [ ] Select different markets from the dropdown
- [ ] Confirm market description updates when selection changes
- [ ] Verify that selected market is highlighted in the UI

### 3. Travel Mechanic
- [ ] Select a different market from the dropdown
- [ ] Click the "Travel to Market" button
- [ ] Verify that the loading indicator appears during travel
- [ ] Confirm that the selected market loads after travel
- [ ] Test multiple market travels to verify random market attack chance
- [ ] When a market attack occurs, verify that the attack modal appears
- [ ] Test both "Fight" and "Try to Flee" options in the attack modal

### 4. Tab Navigation and Mode Switching
- [ ] Click each tab (Ingredients, Potions, Equipment, Scrolls)
- [ ] Verify that the content area updates to show the appropriate items
- [ ] Click the Buy and Sell mode buttons
- [ ] Confirm that the display switches between market inventory and player inventory
- [ ] Verify that the appropriate action button (Buy/Sell) appears in the details panel

### 5. Inventory Display
- [ ] Check that market inventory items are displayed correctly with appropriate rarity colors
- [ ] Verify that player inventory items are displayed correctly in sell mode
- [ ] Confirm that "No items available" message appears when appropriate
- [ ] Verify that item prices are displayed correctly

### 6. Item Selection and Details
- [ ] Click on various items to select them
- [ ] Verify that the details panel updates with the correct item information
- [ ] Confirm that item name, description, and price are displayed correctly
- [ ] Test quantity adjustment controls (+ and - buttons)
- [ ] Verify that the total price updates correctly when quantity changes
- [ ] Confirm that the maximum quantity is limited by the available quantity

### 7. Buying and Selling
- [ ] Select an item to buy
- [ ] Adjust quantity
- [ ] Click the Buy button
- [ ] Verify that the purchase is successful and gold is deducted
- [ ] Confirm success message is displayed
- [ ] Switch to sell mode
- [ ] Select an item to sell
- [ ] Adjust quantity
- [ ] Click the Sell button
- [ ] Verify that the sale is successful and gold is added
- [ ] Confirm success message is displayed
- [ ] Verify that items are removed from inventory after successful purchase/sale

### 8. Search Functionality
- [ ] Enter search terms in the search field
- [ ] Verify that items are filtered correctly based on the search term
- [ ] Confirm that the filtering works in both buy and sell modes
- [ ] Test with partial search terms and case insensitivity
- [ ] Verify that "No items available" message appears when no items match the search

### 9. Error Handling
- [ ] Test buying with insufficient gold
- [ ] Verify appropriate error message is displayed
- [ ] Test buying with quantity exceeding available stock
- [ ] Test selling with quantity exceeding player's inventory
- [ ] Verify that the error boundary catches any rendering errors

### 10. Performance and Responsiveness
- [ ] Observe rendering speed and smoothness of transitions
- [ ] Verify that there are no console errors during normal operation
- [ ] Test with large inventories to ensure performance remains acceptable
- [ ] Check responsiveness on different screen sizes

## User Verification Steps
1. Open the game and navigate to the Wizard's Study
2. Click the Market button
3. Verify the market loads without errors
4. Test each functionality listed in the test cases
5. Leave the market and return to ensure consistent behavior
6. Check for any visual glitches or rendering issues
7. Verify that all interactions work as expected with no console errors

## Reporting Issues
Document any issues found with:
- Screenshot of the issue
- Steps to reproduce
- Console errors (if any)
- Expected vs. actual behavior 