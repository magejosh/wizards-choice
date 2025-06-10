## Relevant Files
- `src/lib/game-state/gameStateStore.ts` - Maintains game progress and player stats across save slots.
- `src/lib/services/AchievementService.ts` - Handles checking and unlocking achievements.
- `src/components/profile/PlayerProfileScreen.tsx` - Renders the profile UI and tabs.
- `src/components/profile/StatsSummary.tsx` - Displays statistics on the profile screen.
- `src/components/profile/AchievementList.tsx` - Shows unlocked achievements.
- `src/lib/types/achievement-types.ts` - Defines the `PlayerStats` interface.
- `docs/ui_design_standards.md` - UI style guidelines to follow.

## Tasks
- [ ] **1.0 Update Player Stats Handling**
  - [ ] 1.1 Audit battle and inventory modules to ensure each relevant event updates `playerStats`.
  - [ ] 1.2 Persist updated stats to the current save slot using `useGameStateStore`.
- [ ] **2.0 Improve Achievement Service**
  - [ ] 2.1 Trigger `checkStatsBasedAchievements` after any stat change.
  - [ ] 2.2 Mark achievements as unlocked with date and save to state.
- [ ] **3.0 Connect Profile UI**
  - [ ] 3.1 Read stats from the store in `StatsSummary` instead of default placeholders.
  - [ ] 3.2 Render unlocked achievements in `AchievementList` with proper styling.
  - [ ] 3.3 Handle cases where no stats exist yet with a loading or empty state.
- [ ] **4.0 Save and Load Data**
  - [ ] 4.1 Ensure achievements and stats persist in local storage and reload correctly on startup.
- [ ] **5.0 Documentation and Tests**
  - [ ] 5.1 Add unit tests for new AchievementService logic.
  - [ ] 5.2 Document the feature in `/docs` with a short summary and update `CHANGELOG.md`.
