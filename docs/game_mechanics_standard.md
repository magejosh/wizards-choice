# Wizard's Choice - Game Mechanics Standard

This document defines the standardized game mechanics for Wizard's Choice. All combat systems MUST follow these standards to ensure consistent behavior across the entire game.

## Core Design Principles

1. **Single Source of Truth**: All damage calculation uses one standardized function
2. **Consistent Order of Operations**: All modifiers apply in the same sequence
3. **Clear Effect Interactions**: Well-defined rules for how effects stack and interact
4. **Transparent Mechanics**: Players can understand how damage is calculated
5. **Extensible System**: Easy to add new mechanics without breaking existing ones

## Damage Calculation Standard

All damage in the game follows this exact order of operations:

### 1. Base Damage Calculation
- **Spells**: Use the `value` field from the spell effect
- **Mystic Punch**: Base damage = 2 + (spell tier × 3)
- **Equipment Effects**: Use the equipment's damage value
- **Over-Time Effects**: Use the stored effect value

### 2. Caster Bonuses (Applied to Base)
- **Spell Power**: Added to all spell damage and mystic punch
- **Mystic Punch Power**: Added only to mystic punch damage
- **Elemental Bonuses**: Future implementation for elemental spell bonuses

### 3. Difficulty Modifiers
- **Easy Mode**: 
  - Player deals +20% damage
  - Enemy deals -20% damage
- **Normal Mode**: No modifiers
- **Hard Mode**:
  - Player deals -20% damage  
  - Enemy deals +20% damage

### 4. Target Damage Reduction
- **Damage Reduction Effects**: Subtract total reduction from final damage
- **Armor/Equipment**: Future implementation
- **Elemental Resistances**: Future implementation

### 5. Final Damage Application
- **Minimum Damage**: Always at least 0 (cannot heal through negative damage)
- **Health Update**: Subtract final damage from current health
- **Combat Log**: Record damage with all relevant details

## Active Effects System

### Effect Types and Behavior

| Effect Type | Description | Duration Behavior | Stacking Rules |
|-------------|-------------|-------------------|----------------|
| `damage_over_time` | Deals damage each turn | Decrements each turn | Multiple effects stack |
| `healing_over_time` | Heals health each turn | Decrements each turn | Multiple effects stack |
| `mana_regen` | Restores mana each turn | Decrements each turn | Multiple effects stack |
| `mana_drain` | Drains mana each turn | Decrements each turn | Multiple effects stack |
| `damageReduction` | Reduces incoming damage | Decrements each turn | Multiple effects stack |
| `buff` | Positive stat modification | Decrements each turn | Effects stack additively |
| `debuff` | Negative stat modification | Decrements each turn | Effects stack additively |
| `stun` | Prevents actions | Decrements each turn | Duration resets to highest |
| `silence` | Prevents spellcasting | Decrements each turn | Duration resets to highest |

### Effect Processing Order

Effects are processed in this order during the "upkeep" phase:

1. **Damage Over Time**: All DoT effects apply damage
2. **Healing Over Time**: All HoT effects restore health  
3. **Mana Effects**: Mana regeneration and drain
4. **Status Conditions**: Stun, silence, etc. are checked
5. **Effect Expiration**: Expired effects are removed and logged

### Effect Creation Standards

When creating new active effects:

```typescript
const newEffect: ActiveEffect = {
  id: `effect_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  name: 'Human Readable Name',
  type: 'damage_over_time', // Must be from allowed types
  value: effectValue, // Positive numbers for damage/healing
  duration: originalDuration,
  remainingDuration: originalDuration,
  source: isPlayerCasting ? 'player' : 'enemy',
  effect: originalSpellEffect // Reference to source effect
};
```

## Combat Phase System

### Phase Order
1. **Initiative**: Determine turn order
2. **Draw**: Draw cards to hand
3. **Action**: Primary actions (spells, mystic punch)
4. **Response**: Reaction spells only
5. **Resolve**: Execute all queued actions
6. **Upkeep**: Process active effects
7. **Discard**: Discard excess cards
8. **End**: Check win conditions

### Action Queuing
- Actions are queued during Action and Response phases
- All queued actions resolve simultaneously in Resolve phase
- Actions resolve in timestamp order (oldest first)
- Combat status is checked after each action resolution

## Equipment and Stat Bonuses

### Combat Stats Hierarchy
1. **Base Stats**: Wizard's inherent capabilities
2. **Level Progression**: Bonuses from leveling up
3. **Equipment Bonuses**: Additive bonuses from gear
4. **Active Effect Modifiers**: Temporary spell effects

### Equipment Stat Types
- `maxHealth`: Increases maximum health
- `maxMana`: Increases maximum mana
- `manaRegen`: Increases mana regeneration per turn
- `spellPower`: Increases all spell and mystic punch damage
- `mysticPunchPower`: Increases only mystic punch damage
- `bleedEffect`: Adds damage over time to mystic punch
- `extraCardDraw`: Increases cards drawn each turn
- `potionSlots`: Number of potions that can be equipped
- `damageReduction`: Passive damage reduction (future)

## Spell Effect Implementation

### Required Fields
All spell effects MUST have:
- `type`: One of the standardized effect types
- `value`: Numeric value for the effect
- `target`: 'self' or 'enemy'
- `element`: Elemental type (for future mechanics)

### Optional Fields
- `duration`: For effects that last multiple turns
- `condition`: For conditional effects (future)
- `scaling`: For level-based scaling (future)

### Effect Type Mapping
- `damage` → Direct damage using standardized calculation
- `healing` → Direct health restoration
- `buff` → Creates `healing_over_time` or stat bonus effect
- `debuff` → Creates `damage_over_time` or stat penalty effect
- `manaRestore` → Direct mana restoration
- `damageReduction` → Creates damage reduction effect
- `statusEffect` → Creates status condition based on value/target

## Testing Standards

### Required Tests for New Mechanics
1. **Basic Functionality**: Effect applies correctly
2. **Damage Reduction**: All damage sources respect reduction
3. **Stacking Behavior**: Multiple effects interact properly
4. **Duration Management**: Effects expire at correct time
5. **Edge Cases**: Zero damage, overflow protection, etc.

### Test Coverage Requirements
- All damage sources must be tested with damage reduction
- All effect types must be tested for proper stacking
- Phase transitions must maintain effect state
- Combat end scenarios must clean up effects

## Implementation Checklist

When adding new combat mechanics:

- [ ] Use `calculateAndApplyDamage()` for all damage
- [ ] Follow standardized effect creation format
- [ ] Add appropriate logging with consistent format
- [ ] Handle edge cases (zero values, missing fields)
- [ ] Test interaction with existing mechanics
- [ ] Update this documentation
- [ ] Add unit tests for new functionality

## Migration Guide

### For Existing Code
1. Replace custom damage calculations with `calculateAndApplyDamage()`
2. Ensure all effects use standardized `ActiveEffect` format
3. Update logging to use consistent format
4. Add missing field validation
5. Test all damage sources work with damage reduction

### Breaking Changes
- Old damage calculation functions are deprecated
- Effect creation must use new format
- Combat logging format has changed
- Some effect types have been renamed for consistency

## Future Enhancements

### Planned Features
- Elemental resistance/weakness system
- Armor and equipment-based damage reduction
- Conditional effects (trigger on specific events)
- Spell scaling based on caster level
- Complex status effects (charm, fear, etc.)

### Extension Points
- Custom damage types beyond spell/mysticPunch/effect
- Multi-target spell effects
- Area of effect calculations
- Damage reflection mechanics
- Spell interaction systems

---

**Version**: 1.0  
**Last Updated**: December 2024  
**Compliance**: All combat code must follow these standards as of this version 