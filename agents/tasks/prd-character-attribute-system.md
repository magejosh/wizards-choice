# Character Attribute System

## Introduction/Overview
Players earn level-up points but currently have limited ways to spend them. This feature introduces a full attribute progression system. Players can allocate their level-up points to enhance key attributes that influence health, mana, regeneration and other future mechanics.

## Goals
- Enable spending level-up points on eleven core attributes
- Persist attribute values in the save system
- Provide a clear UI for viewing and upgrading attributes
- Apply basic stat bonuses from select attributes (HP, MP, regeneration)

## User Stories
- **As a player**, I want to see my available level-up points and spend them on attributes so that my wizard grows stronger over time.
- **As a player**, I want vitality and endurance to increase my maximum health so I can survive longer in battles.
- **As a player**, I want intelligence and wisdom to raise my maximum mana so I can cast more spells in a duel.
- **As a player**, I want vitality and willpower to improve my health and mana regeneration between fights.

## Functional Requirements
1. Add the following numeric attributes to the `Wizard` type and game state:
   - strength, agility, vitality, endurance, perception, reaction,
     resistance, willpower, intelligence, wisdom, control, focus.
2. Display current attribute values and remaining level-up points in a new
   **Attribute Upgrade** screen accessible from the Wizard's Study.
3. Allow players to spend level-up points to increase any attribute by 1 per
   point. Deduct points immediately on confirmation.
4. Increase `progressionMaxHealth` based on vitality and endurance.
5. Increase `progressionMaxMana` based on intelligence and wisdom.
6. Increase mana and health regeneration rates using vitality and willpower.
7. Recalculate total health and mana after every upgrade and persist the new
   values to IndexedDB save slots.
8. Prevent spending points if the player lacks sufficient level-up points.
9. Ensure the UI uses existing styling patterns defined in
   `docs/ui_design_standards.md`.

## Non-Goals
- Complex combat bonuses or spell interactions from attributes
- Respec or refund mechanics
- Changes to existing equipment or spell systems

## Design Considerations
- Follow the magical aesthetic and modal design rules when creating the
  attribute upgrade screen.
- Attributes should be listed with plus and minus controls or buttons for
  clarity on mobile and desktop.

## Technical Considerations
- Extend `wizardModule.ts` with actions for upgrading attributes and updating
  derived stats.
- Update `calculateWizardStats` to factor attribute bonuses into health and
  mana totals.
- Persist attribute data within each save slot so upgrades survive reloads.

## Success Metrics
- Players can view and upgrade attributes without errors.
- Health, mana, and regeneration values update immediately after upgrades.
- Upgraded attributes persist after closing and reopening the game.

## Open Questions
- What are the initial base values for each attribute at level 1?
- Should there be attribute caps or diminishing returns at high values?
- Will future phases allow respeccing attributes?
