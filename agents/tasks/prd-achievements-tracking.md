# Achievements and Profile Stats Tracking Fix

## Introduction/Overview
The existing player profile screen displays placeholders or blank fields for achievements and other statistics. This feature will implement full tracking so that the profile reflects actual game progress. The goal is to update stats in real time and persist them between sessions.

## Goals
- Display accurate counts for all statistics on the profile screen.
- Unlock and show achievements when their conditions are met.
- Persist updated stats and achievements in local storage.
- Follow the styles defined in [/docs/ui_design_standards.md](../docs/ui_design_standards.md).

## User Stories
- **As a player**, I want to see my battle wins, items collected, and other stats so that I can track my progress.
- **As a player**, I want achievements to unlock automatically when I meet their criteria so that I feel rewarded.
- **As a returning player**, I want my statistics and achievements to load from my save file so that progress is not lost.

## Functional Requirements
1. The system must update `playerStats` after relevant events (battle completion, item acquisition, spell learning, etc.).
2. The profile screen must read statistics from `playerStats` and display them using existing components.
3. The AchievementService must evaluate achievement conditions whenever stats change or battles end.
4. When an achievement is unlocked, it must be marked with `unlocked: true` and the `unlockedDate` recorded.
5. Updated stats and achievements must be persisted via the game state store to IndexedDB/local storage.
6. UI elements must conform to the styles and responsive behavior specified in `ui_design_standards.md`.
7. The profile screen must handle loading states gracefully when data is missing or during first-time initialization.

## Non-Goals
- No offline-only mode will be implemented.
- Network failure handling beyond normal save persistence is out of scope.

## Design Considerations
- Reuse existing components (`StatsSummary`, `AchievementList`, etc.) and CSS modules.
- Ensure color themes and font choices match the UI design standards.

## Technical Considerations
- Use the existing Zustand store (`useGameStateStore`) for state updates and persistence.
- Achievement checks should leverage the current `AchievementService` methods.
- Data should be saved in the current save slot to maintain isolation between slots.

## Success Metrics
- All fields on the profile screen show real numbers after gameplay.
- Achievements unlock at the appropriate times and remain unlocked after a refresh.
- Manual playtesting verifies stats increment correctly across battles and item pickups.

## Open Questions
- Are there additional achievement categories or stats planned that are not yet represented in `PlayerStats`?
- Should unlocked achievements show a notification toast or modal beyond the existing list update?
