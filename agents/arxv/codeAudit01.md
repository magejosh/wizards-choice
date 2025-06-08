Project Audit Findings (Ordered by Severity)
Severe Code Duplication (Components):
Issue: There is extensive duplication of components and their associated CSS modules between src/components/ and src/lib/ui/components/. This includes core UI elements for battle, notifications, inventory, spells, and general UI components (like ErrorBoundary, HowToPlay, MainMenu, Settings, GameInterface, SpellCard).
Details: Examples include BattleArena.tsx, BattleScene.tsx, SpellEffect3D.tsx, WizardModel.tsx, AchievementNotification.tsx, NotificationManager.tsx, SpellScrolls.tsx, SpellCard.tsx, ErrorBoundary.tsx, HowToPlay.tsx, MainMenu.tsx, Settings.tsx and their corresponding CSS modules appearing in both locations.
Severity: Critical. Duplication drastically increases maintenance overhead, leads to inconsistencies, bugs (fixing in one place but not the other), and makes the codebase significantly harder to navigate and understand.
Legacy/Incorrect Dice Implementation:
Issue: The project contains assets for dice-box (public/assets/dice-box/) which is noted as a legacy method. Furthermore, the InitiativeRoll.tsx component appears to implement its own dice roll visualization (likely CSS-based, judging by the associated .module.css file), contradicting the stated intention to use the threejs-dice library.
Details: The presence of public/assets/dice-box/themes/default/theme.config.json indicates leftover legacy assets. The src/components/battle/InitiativeRoll.tsx and InitiativeRoll.module.css suggest a custom implementation instead of the intended threejs-dice library listed in package.json.
Severity: High. This indicates unused legacy assets cluttering the project and a core feature (initiative rolling) implemented using an incorrect/unintended method, potentially lacking the features or visual fidelity of the intended library. It also means the threejs-dice dependency is likely unused.
Functional Bugs / Incomplete Features (from BUGS.md & CHANGELOG):
Issue: Several critical gameplay features are known to be buggy or incomplete.
Details:
Combat phase advancement glitches (BUGS.md, CHANGELOG.md).
Market system issues: selling not working, item scrolling broken, market attacks not triggering (BUGS.md).
Potion crafting likely incomplete or not hooked up (BUGS.md).
Equipment equipping overwrites existing items instead of unequipping (BUGS.md).
Severity: High. These directly prevent or hinder core gameplay loops, making parts of the game potentially unplayable or frustrating.
Improper Modularization / Unclear Structure:
Issue: The existence of the src/lib/ui/components/ directory alongside src/components/ creates ambiguity. It's unclear which is the canonical source for UI components, suggesting either an incomplete refactor, poor organization, or unnecessary layering. The purpose of src/lib/ui/ compared to src/components/ui/ (which seems to hold ShadCN components) is also unclear.
Details: The widespread duplication listed in Finding #1 is a direct symptom of this. The combatEngine.ts file mentions being a re-export point, which is a good pattern, but needs consistent application across the lib modules.
Severity: Medium. Leads to confusion, complicates maintenance, increases the chance of using outdated components, and hinders refactoring efforts.
Outdated Documentation:
Issue: Documentation files do not reflect the current state of the codebase.
Details: docs/requirements.md mentions PhaserJS, but the project clearly uses Three.js/React Three Fiber (@react-three/fiber, three in package.json, presence of BattleScene.tsx using Canvas). Given the recent refactoring mentioned in the CHANGELOG (combat phases, market), other documents like technical_documentation.md and process_maps.md are likely outdated regarding these systems.
Severity: Medium. Outdated documentation misleads developers, increases onboarding time, and can lead to incorrect assumptions about functionality or architecture.
Potentially Unused Packages:
Issue: Packages listed in package.json might not be actively used in the current codebase version.
Details:
dice-roller-parser: Given the note about threejs-dice being the intended library and the presence of a custom InitiativeRoll.tsx, this parser might be unused. Requires code verification.
dice-box: While not listed in the provided package.json, the user note and asset files confirm it's legacy and thus the dependency (if it existed) would be unused. Since it's not listed, the issue is primarily the leftover assets (Finding #2).
Severity: Low. Unused dependencies add bloat to the project and can potentially introduce vulnerabilities or increase build times, but don't directly break functionality.
Remediation Plan
Here’s an optimal method for addressing each finding using best practices, focusing on root causes:
Address Code Duplication (Components):
Root Cause: Likely an incomplete or abandoned refactoring effort, lack of clear component ownership, or misunderstanding of module boundaries.
Method (Best Practice): Establish a Single Source of Truth (SSOT) for UI components. Decide on one canonical location (src/components/ seems more conventional for primary UI components, while src/components/ui/ holds the base ShadCN elements). Migrate any necessary unique logic from the duplicate location (src/lib/ui/components/) into the canonical one, then delete the duplicate directory (src/lib/ui/) entirely after verifying all imports point to the canonical location. Apply the Don't Repeat Yourself (DRY) principle rigorously.
Tasks:
Task 1: Decide on the canonical directory for UI components (Recommend src/components/).
Task 2: Audit src/lib/ui/components/ vs src/components/.
Subtask 2.1: For each duplicated component, compare versions. Identify the most up-to-date or correct version.
Subtask 2.2: Merge any unique, necessary logic from the non-canonical version into the canonical version.
Task 3: Refactor all imports across the project to point only to the canonical components.
Task 4: Delete the entire src/lib/ui/ directory structure (or specifically src/lib/ui/components/ if src/lib/ui/styles or theme.ts are deemed necessary elsewhere, though they likely belong closer to the components or a global styles directory).
Task 5: Run linters, type checkers, and tests (if available) to ensure no broken imports remain.
Fix Legacy/Incorrect Dice Implementation:
Root Cause: Changing requirements or technical direction without proper cleanup and implementation of the new approach.
Method (Best Practice): Implement the intended solution (threejs-dice) consistently and remove all traces of the legacy/incorrect methods.
Tasks:
Task 1: Delete the legacy dice-box assets: rm -rf public/assets/dice-box.
Task 2: Refactor src/components/battle/InitiativeRoll.tsx.
Subtask 2.1: Remove the existing CSS-based animation logic.
Subtask 2.2: Integrate the threejs-dice library to handle dice rolling and visualization within the component.
Subtask 2.3: Ensure the component correctly calls onRollComplete with the results from threejs-dice.
Task 3: Delete the associated CSS module: rm src/components/battle/InitiativeRoll.module.css.
Task 4: Verify threejs-dice is correctly listed and installed via package.json.
Resolve Functional Bugs / Incomplete Features:
Root Cause: Complexity introduced during refactoring (combat phases), incomplete implementation, potential race conditions in state management, or incorrect logic.
Method (Best Practice): Address each bug systematically using debugging tools and code analysis. Ensure state transitions are atomic and predictable. Complete feature implementations based on requirements. Use the BUGS.md and CHANGELOG.md as guides.
Tasks:
Task 1: Combat Phase Glitch:
Subtask 1.1: Debug the state transitions between discard and initiative phases, focusing on phaseManager.ts and its interaction with BattleView.tsx and gameStateStore.
Subtask 1.2: Ensure phase transitions are triggered correctly and state updates are fully processed before the next phase begins. Refactor state updates to be more atomic if needed.
Subtask 1.3: Add robust logging around phase transitions.
Task 2: Market System Bugs:
Subtask 2.1 (Sell): Implement or fix the logic in marketModule.ts (sellItem function) to correctly fetch and display player inventory items eligible for sale based on the current market context.
Subtask 2.2 (Scrolling): Refactor the item display (MarketUI.tsx, potentially using Carousel from shadcn/ui as suggested or a simple scrollable div) to handle large inventories. Ensure CSS allows scrolling (overflow-y: auto or similar).
Subtask 2.3 (Attacks): Debug the checkForMarketAttack logic in marketModule.ts and its trigger point (likely in MarketUI.tsx's onClose handler) to ensure it fires correctly based on game state (difficulty, market level).
Task 3: Potion Crafting:
Subtask 3.1: Audit potionCrafting.ts, potionRecipes.ts, and PotionCraftingScreen.tsx.
Subtask 3.2: Identify missing logic or UI connections.
Subtask 3.3: Implement the full crafting flow based on requirements (ingredient consumption, recipe discovery, potion creation, inventory update).
Task 4: Equipment Overwriting:
Subtask 4.1: Modify the equipItem logic (likely in wizardModule.ts or EquipmentScreen.tsx) to check if the target slot already has an item.
Subtask 4.2: If the slot is occupied, call the unequipItem logic for that slot before equipping the new item. Ensure the unequipped item is correctly added back to the player's inventory.
Address Improper Modularization / Unclear Structure:
Root Cause: Organic growth without clear architectural guidelines, or incomplete refactoring.
Method (Best Practice): Define clear responsibilities for each module/directory. Consolidate duplicated logic/components (covered by #1). Ensure lib contains reusable core logic/types/services, and components contains the React UI elements. Refactor src/lib/ui/ based on the decision in #1. Review the combatEngine.ts re-exports to ensure they are consistent and necessary; potentially refactor callers to import directly from the source modules (phaseManager, spellExecutor, etc.) for clarity.
Tasks:
Task 1: Complete Task Set #1 (Component Duplication).
Task 2: Define and document the exact purpose of src/lib/ subdirectories vs src/components/ subdirectories in docs/project_structure.md.
Task 3: Review combatEngine.ts. Consider removing it as a re-export hub and updating all imports to point directly to the source modules (cardManager, effectsProcessor, phaseManager, etc.) for improved clarity and reduced indirection.
Update Documentation:
Root Cause: Documentation not updated alongside code changes.
Method (Best Practice): Treat documentation as code. Update documentation concurrently with code changes. Establish a standard for documentation content and structure. Regularly review docs for accuracy.
Tasks:
Task 1: Update docs/requirements.md to reflect the use of Three.js/R3F instead of PhaserJS.
Task 2: Review and update docs/technical_documentation.md and docs/process_maps.md to accurately describe the current combat phase system, market system, and overall architecture, removing references to deleted/refactored code.
Task 3: Update docs/project_structure.md based on the outcome of modularization refactoring (Task Set #1 and #4).
Task 4: Review docs/high-level-overview.md and docs/how_to_play.md for consistency with current features and mechanics.
Handle Potentially Unused Packages:
Root Cause: Dependencies added but later replaced or abandoned.
Method (Best Practice): Regularly audit dependencies. Remove unused packages to reduce bundle size and potential security risks.
Tasks:
Task 1: Perform a codebase search for imports from dice-roller-parser.
Task 2: If no imports are found and threejs-dice is confirmed as the sole dice mechanism, uninstall the package: npm uninstall dice-roller-parser (or pnpm remove).
Task 3: Remove the package from package.json.
This plan prioritizes fixing the core structural issues (duplication, modularization) and critical bugs first, followed by cleaning up legacy code and updating documentation.