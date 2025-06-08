# Code Duplication Resolution Task List

## Analysis Phase
1. Create a complete inventory of all duplicated components between src/components/ and src/lib/ui/components/
2. Document the differences between each pair of duplicated components
3. Identify which version of each component is the most current/complete
4. Determine dependencies for each component to understand impact of changes
5. Map out import relationships to identify which components are imported where

## Planning Phase
6. ✅ Decided on src/components/ as the standard location for all UI components
7. Create a migration strategy for each component from src/lib/ui/components/ to src/components/
8. Prioritize components based on complexity and dependency impact
9. Document the planned changes for each component, focusing on streamlining and removing unused code
10. Create a testing plan to ensure functionality is preserved after migration

## Implementation Phase
11. Start with low-impact components that have few dependencies
12. For each component, migrate from src/lib/ui/components/ to src/components/ or enhance existing src/components/ version
13. Update all import statements across the codebase to reference the src/components/ version
14. Prefer consolidation, Only Create wrapper components where needed for backward compatibility
15. Remove the duplicate component from src/lib/ui/components/ after confirming all references are updated
16. Update any CSS module imports to match the new component structure
17. Test the component in all contexts where it's used
18. Identify and remove unused code and props to streamline components

## Specific Component Tasks
19. Migrate or enhance BattleArena.tsx (remove wrapper in lib/ui/components)
20. Migrate or enhance BattleScene.tsx to src/components/
21. Migrate or enhance SpellEffect3D.tsx to src/components/
22. Migrate or enhance WizardModel.tsx to src/components/
23. Migrate or enhance AchievementNotification.tsx to src/components/
24. Migrate or enhance NotificationManager.tsx to src/components/
25. Migrate or enhance SpellScrolls.tsx to src/components/
26. Migrate or enhance SpellCard.tsx to src/components/ (appears in multiple locations)
27. Migrate or enhance ErrorBoundary.tsx to src/components/
28. Migrate or enhance HowToPlay.tsx to src/components/
29. Migrate or enhance MainMenu.tsx to src/components/
30. Migrate or enhance Settings.tsx to src/components/
31. Migrate or enhance all associated CSS modules to src/components/

## Testing Phase
32. Create or update unit tests for each migrated component
33. Perform integration testing to ensure components work together
34. Test the application end-to-end to verify no functionality was lost
35. Verify all UI elements render correctly after migration

## Documentation Phase
36. Update component documentation to reflect new structure in src/components/
37. Create a style guide for future component development
38. Document the component hierarchy and relationships
39. Update any developer onboarding materials to reflect new structure

## Final Review
40. Conduct code review of all changes
41. Verify all duplicated components have been removed from src/lib/ui/components/
42. Check for any performance regressions
43. Ensure consistent styling across all components
44. Update the project audit document to reflect resolved issues
45. Remove the src/lib/ui/components/ directory if empty or document any remaining components
