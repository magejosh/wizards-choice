# Spell Effects Review

This document summarizes the current status of each spell effect type available in the spell editor dropdown, and describes what each effect does in the combat code.

---

## Effect Type Review

| Effect Type      | Implemented? | What it Does / Notes                                                                 |
|------------------|--------------|-------------------------------------------------------------------------------------|
| **damage**           | Yes          | Direct damage to health                                                             |
| **healing**          | Yes          | Direct healing                                                                      |
| **buff**             | Yes          | Healing over time/stat boost                                                        |
| **debuff**           | Yes          | Damage over time/stat penalty                                                       |
| **control**          | No           | Planned - will allow taking control of enemy minions |
| **summon**           | Yes          | Creates minions on the battlefield |
| **utility**          | No           | Not implemented                                                                     |
| **timeRewind**       | No           | Not implemented                                                                     |
| **delay**            | No           | Not implemented                                                                     |
| **confusion**        | No           | Not implemented                                                                     |
| **damageBonus**      | No           | Only as equipment, not as spell effect                                              |
| **defense**          | No           | Only as equipment, not as spell effect                                              |
| **spellEcho**        | No           | Not implemented                                                                     |
| **manaRestore**      | Yes          | Restores mana                                                                       |
| **statModifier**     | Partial      | Used for buffs/debuffs, not standalone                                              |
| **statusEffect**     | Yes          | Stun, healing/damage over time, etc.                                                |
| **damageReduction**  | Yes          | Reduces incoming damage for a duration                                              |

---

## Details

### Implemented Effects
- **damage**: Applies immediate damage to the target's health. Handled in both `applySpellEffect` (in `spellExecutor.ts` and `combatModule.ts`).
- **healing**: Restores health to the target (self or enemy). Handled in both `applySpellEffect` functions.
- **buff**: Applies a positive effect, usually as a healing over time or stat boost. In `combatModule.ts`, it creates a `healing_over_time` effect. In AI, buffs are considered for defensive strategies.
- **debuff**: Applies a negative effect, usually as damage over time. In `combatModule.ts`, it creates a `damage_over_time` effect. AI considers debuffs if the player has buffs.
- **manaRestore**: Restores mana to the target. Handled in `applySpellEffect` in `spellExecutor.ts`.
- **statusEffect**: Used for effects like stun, healing over time, or damage over time, depending on value and target. Handled in `applySpellEffect` and `getEffectName`.
- **damageReduction**: Applies a reduction to incoming damage for a duration. Handled in `combatModule.ts` and processed in damage calculation.

### Partially Implemented
- **statModifier**: Used for buffs/debuffs, but not as a standalone effect. In `getEffectName`, it is mapped to "Damage Reduction" or "Power Boost".

-### Not Implemented
- **control, utility, timeRewind, delay, confusion, spellEcho**: No code found that processes or applies these effects.
- **damageBonus, defense**: Exist as stats in equipment or AI logic, but not as spell effects in combat.

---

**Note:** Only a subset of the dropdown spell effects are actually hooked up in the combat code. The rest are either placeholders or only referenced in equipment or AI logic, not as spell effects. If you want to add support for any of the unimplemented types, new logic will need to be added to the combat resolution and effect processing code. 


---

## Detailed Review

Here is a step-by-step review of each spell effect type listed in the dropdown (from the `SpellEffect` type and CMX editor), with a summary of whether it is currently implemented and what it does in the combat code:

---

### 1. **damage**
- **Status:** Fully implemented.
- **What it does:** Applies immediate damage to the target's health. Handled in both `applySpellEffect` (in `spellExecutor.ts` and `combatModule.ts`).

---

### 2. **healing**
- **Status:** Fully implemented.
- **What it does:** Restores health to the target (self or enemy). Handled in both `applySpellEffect` functions.

---

### 3. **buff**
- **Status:** Implemented.
- **What it does:** Applies a positive effect, usually as a healing over time or stat boost. In `combatModule.ts`, it creates a `healing_over_time` effect. In AI, buffs are considered for defensive strategies.

---

### 4. **debuff**
- **Status:** Implemented.
- **What it does:** Applies a negative effect, usually as damage over time. In `combatModule.ts`, it creates a `damage_over_time` effect. AI considers debuffs if the player has buffs.

---

### 5. **control**
- **Status:** Not implemented.
- **What it does:** Planned effect to take control of enemy minions for a duration.

---

### 6. **summon**
- **Status:** Implemented.
- **What it does:** Creates minions for the caster or transforms the caster into minions depending on `modelPath`.

---

### 7. **utility**
- **Status:** Not implemented.
- **What it does:** No code found that processes or applies a "utility" effect.

---

### 8. **timeRewind**
- **Status:** Not implemented.
- **What it does:** No code found that processes or applies a "timeRewind" effect.

---

### 9. **delay**
- **Status:** Not implemented.
- **What it does:** No code found that processes or applies a "delay" effect.

---

### 10. **confusion**
- **Status:** Not implemented.
- **What it does:** No code found that processes or applies a "confusion" effect.

---

### 11. **damageBonus**
- **Status:** Not directly implemented as a spell effect.
- **What it does:** Referenced in AI for equipment or enhancement, but not as a spell effect in combat resolution.

---

### 12. **defense**
- **Status:** Not implemented as a spell effect.
- **What it does:** Exists as a stat in equipment, but not as a spell effect in combat.

---

### 13. **spellEcho**
- **Status:** Not implemented.
- **What it does:** No code found that processes or applies a "spellEcho" effect.

---

### 14. **manaRestore**
- **Status:** Implemented.
- **What it does:** Restores mana to the target. Handled in `applySpellEffect` in `spellExecutor.ts`.

---

### 15. **statModifier**
- **Status:** Partially implemented.
- **What it does:** Used for buffs/debuffs, but not as a standalone effect. In `getEffectName`, it is mapped to "Damage Reduction" or "Power Boost".

---

### 16. **statusEffect**
- **Status:** Implemented.
- **What it does:** Used for effects like stun, healing over time, or damage over time, depending on value and target. Handled in `applySpellEffect` and `getEffectName`.

---

### 17. **damageReduction**
- **Status:** Implemented.
- **What it does:** Applies a reduction to incoming damage for a duration. Handled in `combatModule.ts` and processed in damage calculation.

---

#### **Summary Table**

| Effect Type      | Implemented? | What it Does / Notes                                                                 |
|------------------|--------------|-------------------------------------------------------------------------------------|
| damage           | Yes          | Direct damage to health                                                             |
| healing          | Yes          | Direct healing                                                                      |
| buff             | Yes          | Healing over time/stat boost                                                        |
| debuff           | Yes          | Damage over time/stat penalty                                                       |
| control          | No           | Planned - will allow taking control of enemy minions |
| summon           | Yes          | Creates minions on the battlefield |
| utility          | No           | Not implemented                                                                     |
| timeRewind       | No           | Not implemented                                                                     |
| delay            | No           | Not implemented                                                                     |
| confusion        | No           | Not implemented                                                                     |
| damageBonus      | No           | Only as equipment, not as spell effect                                              |
| defense          | No           | Only as equipment, not as spell effect                                              |
| spellEcho        | No           | Not implemented                                                                     |
| manaRestore      | Yes          | Restores mana                                                                       |
| statModifier     | Partial      | Used for buffs/debuffs, not standalone                                              |
| statusEffect     | Yes          | Stun, healing/damage over time, etc.                                                |
| damageReduction  | Yes          | Reduces incoming damage for a duration                                              |

---

**Conclusion:**  
Only a subset of the dropdown spell effects are actually hooked up in the combat code. `summon` is now functional but effects like `control`, `mana_drain`, `stun`, and `silence` remain unimplemented. Adding them will require new logic in `spellExecutor.ts` and `effectsProcessor.ts` as outlined in `docs/spell_effects_refactor_plan.md`.

Let me know if you want a breakdown of how to implement any of the missing effect types, or if you want this summary added to documentation.
