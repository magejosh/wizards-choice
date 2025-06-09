# Loot System Overhaul

This document outlines the new approach for post-battle loot generation and the remaining tasks to fully implement it.

## Goals

- Fix errors when looting defeated enemies.
- Guarantee that every victory awards at least **one gold piece or ingredient**.
- Scale loot variety and quantity mainly by the defeated enemy and only slightly by the player's level.
- Unlock richer loot tiers in line with market unlock levels.
- Differentiate loot tendencies for wizards and magical creatures.
- Reflect enemy archetypes or creature types in the ingredient and item types they drop.

## Loot Logic

1. **Base Drop** – Each enemy always yields at least 1 gold or 1 common ingredient.
2. **Enemy Level Influence** – The enemy's level determines the base range for gold and quantities. Player level provides a very small bonus (<5%).
3. **Market Unlock Milestones** –
   - Levels 1–5: only common items and small gold amounts.
   - Levels 5–10: introduce uncommon ingredients and simple equipment.
   - Levels 10–15: add rare potions and improved gear.
   - Levels 15–20+: higher quantities and chances for rare/epic items.
   - These thresholds mirror the market locations defined in `marketSystem.ts`.
4. **Enemy Type** –
   - **Enemy wizards**: higher chance for spell scrolls and equipment pieces.
   - **Magical creatures**: more ingredients and potions, especially ones that fit the creature's theme (blood, venom, scales, etc.).
5. **Archetype Bias** – Loot tables can weight certain ingredients or items that make sense for the specific archetype or creature type (e.g., fire drakes drop fiery glands).

## Task List

- [ ] Refactor scroll generation to use async spell loading and prevent loot errors.
- [ ] Ensure generateLoot always awards at least one gold or ingredient.
- [ ] Base scroll generation on the enemy's level instead of the player's level.
- [ ] Expand loot tables with market unlock level milestones.
- [ ] Implement archetype/creature specific ingredient pools.
- [ ] Update existing tests and add new tests for guaranteed loot.
- [ ] Document any new data structures or helper functions.

