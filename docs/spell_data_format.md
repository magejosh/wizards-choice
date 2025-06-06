# Spell Data XML Format

This document defines the XML format for all spell data in Wizard's Choice. All spells must be defined using this format for consistency, validation, and future extensibility.

## Overview
- Each spell is represented as a `<spell>` node within a root `<spells>` element.
- All fields are required unless otherwise specified.
- List membership (archetype, creature, or 'any') is required for each spell.
- All referenced images must exist in `/public/images/spells/`.

## XML Structure
```xml
<spells>
  <spell id="spell_firebolt" name="Firebolt" type="attack" element="fire" tier="1" manaCost="10" rarity="common" imagePath="/images/spells/firebolt.png">
    <description>Deals fire damage to a single enemy.</description>
    <effects>
      <effect type="damage" value="15" target="enemy" element="fire" />
    </effects>
    <list>any</list>
  </spell>
  <!-- More spells... -->
</spells>
```

## Field Reference
| Field         | Type     | Required | Allowed Values / Notes                                                                 |
|--------------|----------|----------|---------------------------------------------------------------------------------------|
| id           | string   | Yes      | Unique identifier for the spell (e.g., spell_firebolt)                                |
| name         | string   | Yes      | Unique, case-insensitive                                                              |
| type         | enum     | Yes      | attack, healing, debuff, buff, reaction, summon, control, utility                     |
| element      | enum     | Yes      | fire, water, earth, air, arcane, nature, shadow, light, physical, poison, mental      |
| tier         | integer  | Yes      | 1-10                                                                                  |
| manaCost     | integer  | Yes      | Mana required to cast                                                                 |
| rarity       | enum     | Yes      | common, uncommon, rare, epic, legendary                                               |
| imagePath    | string   | Yes      | Path to image in `/public/images/spells/`                                             |
| description  | string   | Yes      | Spell description                                                                     |
| effects      | array    | Yes      | One or more `<effect>` nodes (see below)                                              |
| list         | string   | Yes      | archetype, creature, or 'any'; can be repeated for multiple memberships               |

### Effect Node Reference
| Field     | Type     | Required | Allowed Values / Notes                                                                 |
|-----------|----------|----------|---------------------------------------------------------------------------------------|
| type      | enum     | Yes      | damage, healing, buff, debuff, control, summon, utility, timeRewind, delay, confusion, damageBonus, defense, spellEcho, manaRestore, statModifier, statusEffect |
| value     | number   | Yes      | Effect magnitude                                                                      |
| target    | enum     | Yes      | self, enemy                                                                           |
| element   | enum     | Yes      | fire, water, earth, air, arcane, nature, shadow, light, physical, poison, mental      |
| duration  | integer  | No       | Duration in turns (if applicable)                                                     |

## Validation Rules
- Spell `name` and `id` must be unique (case-insensitive for name).
- All `type`, `element`, `rarity`, and `target` values must match the allowed enums above.
- All referenced `imagePath` values must exist in `/public/images/spells/`.
- Each spell must have at least one `<effect>`.
- Each spell must have a `<list>` node with a valid value (archetype, creature, or 'any').
- If a spell belongs to multiple lists, include multiple `<list>` nodes.

## Example Spell (Full)
```xml
<spells>
  <spell id="spell_firebolt" name="Firebolt" type="attack" element="fire" tier="1" manaCost="10" rarity="common" imagePath="/images/spells/firebolt.png">
    <description>Deals fire damage to a single enemy.</description>
    <effects>
      <effect type="damage" value="15" target="enemy" element="fire" />
    </effects>
    <list>any</list>
  </spell>
  <spell id="spell_arcane_shield" name="Arcane Shield" type="buff" element="arcane" tier="1" manaCost="12" rarity="common" imagePath="/images/spells/arcane-shield.png">
    <description>Shields the caster, reducing damage taken for 2 turns.</description>
    <effects>
      <effect type="defense" value="8" target="self" element="arcane" duration="2" />
    </effects>
    <list>any</list>
  </spell>
  <spell id="spell_necromancer_bolt" name="Death Bolt" type="attack" element="dark" tier="2" manaCost="20" rarity="rare" imagePath="/images/spells/necromancer-bolt.jpg">
    <description>A bolt of dark energy that saps life force.</description>
    <effects>
      <effect type="damage" value="30" target="enemy" element="dark" />
      <effect type="healing" value="9" target="self" element="dark" />
    </effects>
    <list>archetype</list>
    <list>necromancer</list>
  </spell>
</spells>
```

## Extending the Schema
- To add new fields or effect types, update this document and the XML schema accordingly.
- For batch editing/versioning, leave inline comments in the XML as needed.

## References
- See `/docs/technical_documentation.md` for integration details.
- See `/docs/process_maps.md` for the spell data workflow diagram.

## File Location and Loading
- The spell data XML file must be placed at `/public/data/spell_data.xml` in the project directory.
- At runtime, the game loads the file from `/data/spell_data.xml` (the URL path).
- There is only one file: the `/public` directory is served as the web root, so `/public/data/spell_data.xml` is accessible at `/data/spell_data.xml` in the browser.

## Cache Invalidation Requirement

- After editing and saving spells (via the CMX or any tool), the in-memory spell cache must be cleared using the `clearSpellCache` function from `src/lib/spells/spellData.ts`.
- This ensures that the game reloads the latest spell data from the XML file and displays all updates immediately.
- The CMX now calls this automatically after a successful save. 