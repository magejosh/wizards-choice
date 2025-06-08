# Wizard's Choice Project

## Project Audit: Issues by Severity

Here's a list of identified issues, ordered from most to least severe:

1. **High: Core Gameplay Bug - Combat Phase Advancement Glitch**
    
    - **Detail:** The BUGS.md file explicitly mentions a critical bug where the combat phase advancement gets stuck between the discard and initiative phases, potentially due to race conditions or improper state management. This affects the core playability of the dueling system. The current phase management appears complex and spread across multiple files (phaseManager.ts, BattleView.tsx useEffect hooks), increasing the likelihood of such bugs.
        
    - **Severity:** High (Blocks core gameplay loop).
        
2. **High: Core Gameplay Bug - Save Slot System Malfunction**
    
    - **Detail:** BUGS.md states that save slots are not functioning correctly, potentially only saving or loading the last used slot. This implies a fundamental issue with identifying and persisting distinct save states, likely related to how currentSaveSlot interacts with localStorage keys in saveModule.ts and potentially authService.ts. Unique IDs per save might be missing or improperly handled.
        
    - **Severity:** High (Prevents reliable game progression and saving).
        
3. **High: Documentation Mismatch - Core Technology (Phaser vs. Three.js)**
    
    - **Detail:** The requirements.md specifies PhaserJS for 2D visualization. However, the codebase clearly uses Three.js and React Three Fiber (@react-three/fiber, @react-three/drei in package.json, BattleScene.tsx, WizardModel.tsx, SpellEffect3D.tsx). This is a major discrepancy in core technology choice documented vs. implemented.
        
    - **Severity:** High (Fundamental mismatch in documented architecture).
        
4. **Medium: Unhooked Feature - Spell Tree System**
    
    - **Detail:** A full spell tree system exists (src/app/spell-tree, src/components/spells/SpellTree.tsx, src/lib/spells/spellTree.ts, src/lib/spells/spellTreeLayout.ts). However, there's no apparent navigation link or button from the main game hub (WizardStudy.tsx) to access this feature. It's a significant piece of implemented functionality that isn't integrated into the player's progression path.
        
    - **Severity:** Medium (Major feature unavailable to players).
        
5. **Medium: Broken Feature - Market Sell Functionality**
    
    - **Detail:** BUGS.md reports that the market sell function doesn't display player inventory items correctly. marketModule.ts implements sellItem, but the issue likely lies in how player inventory (excluding equipped items) is fetched or filtered within MarketUI.tsx when in 'sell' mode, or a logic error within sellItem itself.
        
    - **Severity:** Medium (Core market feature broken).
        
6. **Medium: Broken Feature - Market Attacks Not Triggering**
    
    - **Detail:** BUGS.md states market attacks aren't triggering. The logic exists in marketAttacks.ts and marketModule.ts (checkForMarketAttack). The failure point is likely in the trigger mechanism, possibly within the handleClose function of MarketUI.tsx or navigation logic, failing to call checkForMarketAttack.
        
    - **Severity:** Medium (Intended gameplay mechanic non-functional).
        
7. **Medium: Broken Feature - Potion Crafting System**
    
    - **Detail:** BUGS.md suggests the potion crafting system is incomplete or not properly hooked up. Files like PotionCraftingScreen.tsx, potionCrafting.ts, potionRecipes.ts, and potionGenerator.ts exist, but the connection between the UI actions in the screen component and the underlying logic in the library files might be flawed or incomplete. Ingredient consumption and potion creation might not be fully implemented or updating the game state correctly.
        
    - **Severity:** Medium (Core crafting feature likely non-functional).
        
8. **Medium: Broken Feature - Equipment Overwriting**
    
    - **Detail:** BUGS.md notes that equipping an item to an occupied slot deletes the previously equipped item instead of returning it to inventory. This points to a logic error in the handleEquipItem function (likely within EquipmentScreen.tsx or the corresponding state management action in wizardModule.ts), which needs to handle the unequip-and-add-to-inventory step for the replaced item.
        
    - **Severity:** Medium (Causes unintended item loss, breaking inventory management).
        
9. **Medium: Code Duplication & Inconsistency - Styling Approach**
    
    - **Detail:** The project mixes CSS Modules (*.module.css files like BattleArena.module.css, EquipmentScreen.module.css) with global CSS files (components.css, deckbuilder.css, equipment.css, main.css). Components within src/components/ui (like button.tsx) don't use CSS Modules, while feature components sometimes do. This inconsistency leads to potential style conflicts, overrides, and duplicated styling efforts (e.g., equipment.css vs. EquipmentScreen.module.css).
        
    - **Severity:** Medium (Increases maintenance burden, potential for style conflicts).
        
10. **Medium: Legacy Code/Dependency - dice-box Library & Initiative Roll Implementation**
    
    - **Detail:** The note specifies threejs-dice is intended for initiative rolls, and dice-box is legacy. package.json lists both dice-box and threejs-dice. However, InitiativeRoll.tsx uses neither; it seems to implement a CSS-based dice animation. This CSS implementation is effectively legacy if threejs-dice is the target. The dice-box dependency appears entirely unused.
        
    - **Severity:** Medium (Unused dependency, implementation doesn't match intention).
        
11. **Medium: Potential Modularization Issue - aiEngine.ts**
    
    - **Detail:** src/lib/combat/aiEngine.ts contains multiple strategy classes (DefensiveStrategy, AggressiveStrategy, BalancedStrategy, ElementalStrategy, plus archetype-specific strategies) and a factory within a single large file. While functionally grouped, each strategy class could arguably be in its own file for better modularity and easier maintenance, especially as strategies become more complex.
        
    - **Severity:** Medium (Reduces maintainability of AI logic).
        
12. **Medium: Potential Legacy Code - Placeholder Utilities**
    
    - **Detail:** src/styles/utilities/createPlaceholder.js looks like a one-off utility script using browser APIs (canvas) to generate an image file. It doesn't belong in the source tree. src/styles/utilities/placeholder.ts provides a function but seems redundant if components handle image fallbacks directly (e.g., SpellCard.tsx's onError handler).
        
    - **Severity:** Medium (Clutters codebase, potential build issues with .js file).
        
13. **Low: Documentation Mismatch - Minor Inconsistencies**
    
    - **Detail:** While the core technology mismatch is high severity, other minor inconsistencies might exist between documentation (docs/*.md) and the current codebase structure or specific feature implementations described. A full review is needed. For example, technical_documentation.md mentions PhaserJS in the overview section despite the project using Three.js.
        
    - **Severity:** Low (Can cause confusion for developers).
        
14. **Low: Unused Dependency - dice-roller-parser**
    
    - **Detail:** Listed in package.json, this library seems related to the legacy dice-box or text-based dice rolling. Given the current CSS-based initiative roll and the intention to use threejs-dice, this dependency is likely unused.
        
    - **Severity:** Low (Minor bloat).
        

## Remediation Plan & Task List

Here's an optimal method for addressing each issue using best practices, followed by a task list:

**Methodology:**

- **Root Cause Analysis:** Focus on fixing the underlying problems, not just patching symptoms.
    
- **Consistency:** Strive for consistent patterns (styling, state management, error handling).
    
- **Modularity:** Break down large components/modules into smaller, reusable pieces.
    
- **Testing:** User will perform tests where applicable after fixes.
    
- **Documentation:** Update documentation concurrently with code changes.
    
- **Clean Code:** Remove unused code, dependencies, and fix inconsistencies.
    

---

**Task List:**

**Phase 1: Core Bug Fixes & Stability**

1. **Fix Combat Phase Advancement Glitch:**
    
    - **Task 1.1:** Refactor Phase Management Logic.
        
        - Subtask 1.1.1: Centralize phase state management definitively within phaseManager.ts. Remove phase logic from BattleView.tsx useEffects.
            
        - Subtask 1.1.2: Ensure advancePhase transitions are atomic and handle all states correctly, especially discard -> end -> initiative.
            
        - Subtask 1.1.3: Implement robust state checks within advancePhase to prevent getting stuck. Add detailed logging.
            
        - Subtask 1.1.4: Ensure processEnemyDiscard in cardManager.ts completes synchronously or its completion reliably triggers the next step.
            
    - **Task 1.2:** Verify State Updates.
        
        - Subtask 1.2.1: Add logging/debugging in BattleView.tsx and phaseManager.ts to trace state updates during phase transitions.
            
        - Subtask 1.2.2: Test edge cases (e.g., player/enemy skipping turns, empty hands/decks during discard).
            
2. **Fix Save Slot System Malfunction:**
    
    - **Task 2.1:** Implement Unique Save Slot Identifiers.
        
        - Subtask 2.1.1: Modify SaveSlot interface in game-types.ts to include a unique saveUuid (e.g., using uuid).
            
        - Subtask 2.1.2: Update saveModule.ts (saveGame, loadGame, initializeNewGame, deleteSaveSlot) to use saveUuid for localStorage keys (e.g., wizardsChoice_save_${saveUuid}).
            
        - Subtask 2.1.3: Ensure currentSaveSlot stores the saveUuid, not just the array index.
            
        - Subtask 2.1.4: Update MainMenu.tsx to handle selection based on saveUuid.
            
    - **Task 2.2:** Refactor Save/Load Logic.
        
        - Subtask 2.2.1: Ensure loadGame correctly hydrates the entire game state, including correctly identifying the loaded slot.
            
        - Subtask 2.2.2: Verify that saveGame always saves the state associated with the currently active saveUuid.
            
3. **Fix Market Sell Functionality:**
    
    - **Task 3.1:** Refactor sellItem Logic.
        
        - Subtask 3.1.1: In marketModule.ts, ensure sellItem correctly fetches the player's unequipped inventory items (from player.inventory, excluding items present in player.equipment).
            
        - Subtask 3.1.2: Verify quantity checks and gold calculations are correct.
            
    - **Task 3.2:** Update MarketUI.tsx Sell Mode.
        
        - Subtask 3.2.1: Implement the logic to display the correct player inventory items when mode is 'sell'.
            
        - Subtask 3.2.2: Ensure the UI passes the correct item details to the sellItem action.
            
    - **Task 3.3:** Implement Market Gold Limits.
        
        - Subtask 3.3.1: Add a currentGold property to the MarketLocation type.
            
        - Subtask 3.3.2: Modify sellItem in marketModule.ts to check if market.currentGold >= totalValue.
            
        - Subtask 3.3.3: Modify buyItem to increase market.currentGold.
            
        - Subtask 3.3.4: Add logic to refreshMarketInventory to reset market.currentGold to a base value.
            
4. **Fix Market Attacks Not Triggering:**
    
    - **Task 4.1:** Verify Attack Trigger Points.
        
        - Subtask 4.1.1: Ensure checkForMarketAttack (from marketModule.ts) is correctly called within MarketUI.tsx's handleClose function before navigation occurs.
            
        - Subtask 4.1.2: If navigation involves changing currentLocation state, ensure the attack check happens before or is integrated into that state change process.
            
    - **Task 4.2:** Review Attack Probability Logic.
        
        - Subtask 4.2.1: Debug shouldMarketAttackOccur in marketAttacks.ts to ensure probabilities are calculated as expected based on market level, player level, and difficulty. Add logging.
            
5. **Fix Potion Crafting System:**
    
    - **Task 5.1:** Implement Core Crafting Logic.
        
        - Subtask 5.1.1: In potionCrafting.ts and wizardModule.ts, ensure craftPotion correctly consumes ingredients from player.ingredients (checking quantities).
            
        - Subtask 5.1.2: Ensure craftPotion correctly adds the resulting Potion to player.potions.
            
        - Subtask 5.1.3: Fully implement experimentWithIngredients, ensuring ingredient consumption and recipe discovery updates (player.discoveredRecipes).
            
    - **Task 5.2:** Connect UI to Logic.
        
        - Subtask 5.2.1: In PotionCraftingScreen.tsx, verify that clicking "Craft Potion" calls the correct state action (craftPotion from the store).
            
        - Subtask 5.2.2: Verify that clicking "Experiment" calls experimentWithIngredients.
            
        - Subtask 5.2.3: Ensure UI state (selected recipe, ingredients) is correctly passed to the logic functions.
            
        - Subtask 5.2.4: Ensure the UI updates correctly after crafting/experimentation (ingredient counts, potion list, discovered recipes).
            
6. **Fix Equipment Overwriting Bug:**
    
    - **Task 6.1:** Modify Equipping Logic.
        
        - Subtask 6.1.1: In EquipmentScreen.tsx's handleEquipItem (or the corresponding action in wizardModule.ts), check if the target slot in player.equipment is already occupied.
            
        - Subtask 6.1.2: If occupied, retrieve the currently equipped item.
            
        - Subtask 6.1.3: Add the retrieved item back to player.inventory.
            
        - Subtask 6.1.4: Then, place the new item into the player.equipment slot and remove it from player.inventory.
            
        - Subtask 6.1.5: Handle the edge case for the two 'finger' slots correctly.
            

**Phase 2: Code Cleanup & Consistency**

1. **Consolidate Styling Approach:**
    
    - **Task 7.1:** Choose a Primary Styling Method.
        
        - Subtask 7.1.1: Decide whether to use CSS Modules (*.module.css) or a global/utility-class approach (like Tailwind, though Tailwind isn't fully set up here) consistently. Given the use of shadcn/ui, a utility-class approach combined with targeted CSS Modules might be best, but consistency is key. Let's assume standardizing on CSS Modules for component-specific styles and globals.css for base styles.
            
    - **Task 7.2:** Refactor Styles.
        
        - Subtask 7.2.1: Migrate styles from components.css, deckbuilder.css, equipment.css, main.css, battle.css into relevant *.module.css files or globals.css.
            
        - Subtask 7.2.2: Remove the now-redundant global CSS files (except globals.css).
            
        - Subtask 7.2.3: Ensure shadcn/ui components (src/components/ui) integrate well with the chosen approach (they typically use utility classes).
            
2. **Refactor Initiative Roll & Dependencies:**
    
    - **Task 8.1:** Implement threejs-dice.
        
        - Subtask 8.1.1: Update InitiativeRoll.tsx to use the threejs-dice library for rendering and rolling dice, replacing the CSS animation.
            
        - Subtask 8.1.2: Ensure the component correctly reports roll results via onRollComplete.
            
    - **Task 8.2:** Remove Legacy Dependencies.
        
        - Subtask 8.2.1: Remove the dice-box dependency from package.json.
            
        - Subtask 8.2.2: Remove the dice-roller-parser dependency from package.json.
            
        - Subtask 8.2.3: Run npm install or pnpm install to update lock files.
            
3. **Refactor aiEngine.ts:**
    
    - **Task 9.1:** Modularize AI Strategies.
        
        - Subtask 9.1.1: Create a new directory src/lib/ai/strategies.
            
        - Subtask 9.1.2: Move each strategy class (DefensiveStrategy, AggressiveStrategy, etc.) into its own file within the new directory (e.g., DefensiveStrategy.ts).
            
        - Subtask 9.1.3: Update aiEngine.ts (or potentially rename/move it to src/lib/ai/index.ts) to import strategies and keep the AIStrategyFactory and getAISpellSelection.
            
4. **Remove Legacy Placeholder Utilities:**
    
    - **Task 10.1:** Delete createPlaceholder.js.
        
        - Subtask 10.1.1: Remove the file src/styles/utilities/createPlaceholder.js.
            
    - **Task 10.2:** Evaluate and potentially remove placeholder.ts.
        
        - Subtask 10.2.1: Check if src/styles/utilities/placeholder.ts is imported and used anywhere.
            
        - Subtask 10.2.2: If not used, or if image fallbacks are handled sufficiently elsewhere (like SpellCard.tsx), remove the file.
            

**Phase 3: Feature Integration & Documentation**

1. **Integrate Spell Tree System:**
    
    - **Task 11.1:** Add Navigation Link.
        
        - Subtask 11.1.1: Add a button or link in WizardStudy.tsx (e.g., "View Spell Tree") that navigates the user to the /spell-tree route.
            
    - **Task 11.2:** Integrate Points System.
        
        - Subtask 11.2.1: Ensure level-ups correctly grant points (player.skillPoints or similar).
            
        - Subtask 11.2.2: Modify SpellTreePage.tsx or spellTree.ts logic to use and deduct points from the central game state (gameState.player.skillPoints) when unlocking nodes.
            
        - Subtask 11.2.3: Ensure unlocked spells in the tree are correctly added to the player's known spells (player.spells).
            
2. **Update Documentation:**
    
    - **Task 12.1:** Correct Core Technology Documentation.
        
        - Subtask 12.1.1: Update requirements.md and technical_documentation.md to reflect the use of Three.js/React Three Fiber instead of PhaserJS.
            
    - **Task 12.2:** Align Documentation with Code.
        
        - Subtask 12.2.1: Review all files in docs/ against the current codebase.
            
        - Subtask 12.2.2: Update file paths, component descriptions, feature details, and technical explanations to match the implemented code.
            
        - Subtask 12.2.3: Ensure how_to_play.md accurately describes current mechanics.
            
        - Subtask 12.2.4: Update project_structure.md if any file locations changed during refactoring.
            

This plan prioritizes fixing core gameplay issues, then addresses code health and consistency, and finally ensures features are properly integrated and documented.