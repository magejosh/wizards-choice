# Import Path Standards

## Absolute Imports
- Use for cross-module references (>2 directory levels)
- Path aliases:
  - `@game` → `src/game`
  - `@managers` → `src/game/managers`
  - `@ui` → `src/game/ui`

## Relative Imports
- Use for:
  - Files in same directory
  - Immediate parent/child directories
  - Sibling modules within same feature
