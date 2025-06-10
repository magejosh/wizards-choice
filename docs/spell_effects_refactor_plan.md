# Spell Effects Refactor Plan

This document outlines the work required to properly support the currently unused effect types `control`, `mana_drain`, `stun` and `silence`. Implementing these will expand combat variety and fix inconsistencies noted in `spellEffects_review.md`.

## Goals
- Allow spells to temporarily take control of enemy minions (`control`).
- Drain mana over time from a target and optionally restore it to the caster (`mana_drain`).
- Prevent a target from acting (`stun`).
- Prevent a target from casting spells (`silence`).
- Maintain clear combat logs and correct effect expiration behaviour.

## Required Changes

1. **Type Updates**
   - Extend `ActiveEffect['type']` to include `'control'`.
   - Add optional fields to store affected minion IDs and the original owner so control can be reverted.
   - Ensure `allowedTypes` in `effectsProcessor.ts` lists all four new effect types.

2. **spellExecutor.ts**
   - Add a `case 'control'` to change the owner of targeted enemy minions and push a corresponding `ActiveEffect`.
   - Add cases for `mana_drain`, `stun` and `silence` that create the appropriate `ActiveEffect` with duration and value.

3. **effectsProcessor.ts**
   - Implement per-turn logic:
     - `control`: restore minion ownership when the effect expires.
     - `mana_drain`: reduce target mana each turn and transfer it to the caster if possible.
     - `stun`: skip the stunned actor's action while active.
     - `silence`: block spell casting for the affected wizard.
   - Log each tick and expiration of these effects.

4. **Combat Flow Adjustments**
   - Phase handlers should respect `stun` and `silence` flags when determining available actions.
   - AI logic should ignore controlled minions and account for the new effects when selecting spells.

5. **Testing**
   - Add unit tests to cover application, ticking, and expiration of each effect.
   - Update existing combat tests to account for the new behaviours.

6. **Documentation**
   - After implementation, update `docs/spellEffects_review.md` to reflect the supported status of these effects.

## Task Checklist
- [ ] Update type definitions for `ActiveEffect`.
- [ ] Implement effect application in `spellExecutor.ts`.
- [ ] Handle per-turn processing in `effectsProcessor.ts`.
- [ ] Adjust phase logic and AI behaviour.
- [ ] Write comprehensive tests.
- [ ] Update documentation.


