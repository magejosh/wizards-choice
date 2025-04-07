# Wizard's Choice: Sequential Task List

This document outlines the step-by-step actions needed to address all issues identified in the code audit, ordered by severity and following the audit's structure.

## Critical: Component Duplication & Improper Modularization

1. Review both versions of duplicated components to determine the correct implementation:
   - Compare BattleArena.tsx in src/components/battle/ and src/lib/ui/components/
   - Compare BattleScene.tsx in src/components/battle/ and src/lib/ui/components/
   - Compare SpellEffect3D.tsx in src/components/battle/ and src/lib/ui/components/
   - Compare WizardModel.tsx in src/components/battle/ and src/lib/ui/components/
   - Compare SpellScrolls.tsx in src/components/battle/ and src/lib/ui/components/

2. Document the differences between duplicated components and confirm src/components/battle/ versions are the intended implementations.

3. Identify all import statements across the codebase that reference components in src/lib/ui/components/.

4. Update all identified imports to point to the canonical components in src/components/battle/.

5. Delete the entire src/lib/ui/components/ directory structure after confirming all imports have been updated.

6. Test battle functionality to ensure UI renders correctly and all interactions work as expected.

## Critical: Potential Use of Legacy/Deprecated Code (Combat Engine)

7. Identify all deprecated functions in src/lib/combat/combatEngine.ts (advancePhase, skipTurn, queueAction, etc.).

8. Search the entire codebase for direct calls to these deprecated functions.

9. Refactor all identified call sites to use the functions imported from their new modules.

10. Remove the deprecated function bodies and @deprecated comments from combatEngine.ts, keeping only the imports and re-exports if necessary.

11. Test combat phases, spell casting, mystic punch, and turn skipping to ensure functionality remains intact.

## High: Unused Dependency & Legacy Code (Dice System)

12. Review InitiativeRoll.tsx and any other dice-rolling components to confirm they exclusively use @3d-dice/dice-box.

13. Search the codebase for any imports of @3d-dice/dice-box-threejs to confirm it's unused.

14. Remove the entire docs/refactor/dice-box-threejs/ directory.

15. Uninstall the unused dependency: `npm uninstall @3d-dice/dice-box-threejs`.

16. Check if cannon or cannon-es is imported anywhere in the src/ directory.

17. If cannon is not used, uninstall it: `npm uninstall cannon`.

18. Test the Initiative Roll functionality to ensure it works correctly.

## Medium: Potentially Unused Code

19. Perform a project-wide search for imports of incrementAndLog and getStats from src/app/counter.ts.

20. If no usages are found within the src directory, delete the file src/app/counter.ts.

21. If usages are found, document them for further review.

## Low: Incomplete Refactor Cleanup (Combat Engine)

22. After completing steps 7-11, verify no direct calls to deprecated functions remain.

23. Remove any remaining deprecated function definitions entirely from combatEngine.ts.

24. Ensure combatEngine.ts only contains necessary imports and re-exports.

## Medium: Outdated Documentation

25. Delete the docs/arxv/ directory after reviewing for any valuable information.

26. Consolidate relevant items from docs/arxv/todo.md into the root todo.md file.

27. Update README.md to accurately reflect the project's current state, dependencies, and setup instructions.

28. Update docs/project_structure.md to match the cleaned-up file structure.

29. Update docs/technical_documentation.md to reflect the refactored combat engine, the correct dice library, and the standardized component structure.

30. Update docs/how_to_play.md to ensure game mechanics described match the code.

31. Update docs/deployment_guide.md to list only the actual dependencies found in the root package.json after cleanup.

This task list addresses all issues identified in the codeAudit.md, prioritizing critical issues first and following the order presented in the audit document. Each task is specific, actionable, and designed to systematically improve the codebase's quality and maintainability.
