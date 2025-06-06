import fs from 'fs';
import path from 'path';
import { getAllSpells as getMainSpells } from '../src/lib/spells/spellData';
import { getAllSpecialSpells } from '../src/lib/spells/specialSpellData';
import { Spell } from '../src/lib/types/spell-types';

// Allowed enums from /docs/spell_data_format.md
const ALLOWED_TYPES = ['attack', 'healing', 'debuff', 'buff', 'reaction', 'summon', 'control', 'utility'];
const ALLOWED_ELEMENTS = ['fire', 'water', 'earth', 'air', 'arcane', 'nature', 'shadow', 'light', 'physical', 'poison', 'mental', 'dark'];
const ALLOWED_RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const ALLOWED_TARGETS = ['self', 'enemy'];
const ALLOWED_EFFECT_TYPES = [
  'damage', 'healing', 'buff', 'debuff', 'control', 'summon', 'utility', 'timeRewind', 'delay', 'confusion',
  'damageBonus', 'defense', 'spellEcho', 'manaRestore', 'statModifier', 'statusEffect'
];
const ALLOWED_LISTS = ['archetype', 'creature', 'any'];

const IMAGE_BASE_PATH = path.join(__dirname, '../public/images/spells');
const OUTPUT_PATH = path.join(__dirname, '../public/data/spell_data.xml');

// Helper to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'\"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

// Map a Spell object to XML string
function spellToXml(spell: Spell, listMembership: string[] = ['any']): string {
  const effectsXml = spell.effects.map(effect => {
    const attrs = [
      `type=\"${effect.type}\"`,
      `value=\"${effect.value}\"`,
      `target=\"${effect.target}\"`,
      `element=\"${effect.element}\"`,
      effect.duration !== undefined ? `duration=\"${effect.duration}\"` : null
    ].filter(Boolean).join(' ');
    return `      <effect ${attrs} />`;
  }).join('\n');

  const listXml = listMembership.map(list => `    <list>${list}</list>`).join('\n');
  const rarityAttr = (spell as any).rarity ? ` rarity=\"${(spell as any).rarity}\"` : '';

  return `  <spell id=\"${escapeXml(spell.id)}\" name=\"${escapeXml(spell.name)}\" type=\"${spell.type}\" element=\"${spell.element}\" tier=\"${spell.tier}\" manaCost=\"${spell.manaCost}\"${rarityAttr} imagePath=\"${spell.imagePath}\">\n` +
    `    <description>${escapeXml(spell.description)}</description>\n` +
    `    <effects>\n${effectsXml}\n    </effects>\n` +
    `${listXml}\n` +
    `  </spell>`;
}

// Load all spells
const mainSpells: Spell[] = getMainSpells();
const specialSpells: Spell[] = getAllSpecialSpells();
const allSpells: Spell[] = [...mainSpells, ...specialSpells];

// Validation
const errors: string[] = [];
const nameMap: Record<string, number> = {};
const idMap: Record<string, number> = {};
const renamed: { old: string; newName: string; newId: string }[] = [];

function validateSpell(spell: Spell, idx: number): Spell {
  let valid = true;
  let origName = spell.name;
  let origId = spell.id;
  let nameKey = spell.name.toLowerCase();
  let idKey = spell.id.toLowerCase();

  // Uniqueness
  if (nameMap[nameKey]) {
    nameMap[nameKey]++;
    spell.name = `${spell.name}_${nameMap[nameKey]}`;
    valid = false;
    renamed.push({ old: origName, newName: spell.name, newId: spell.id });
    errors.push(`Duplicate spell name: ${origName} (renamed to ${spell.name})`);
  } else {
    nameMap[nameKey] = 1;
  }
  if (idMap[idKey]) {
    idMap[idKey]++;
    spell.id = `${spell.id}_${idMap[idKey]}`;
    valid = false;
    renamed.push({ old: origId, newName: spell.name, newId: spell.id });
    errors.push(`Duplicate spell id: ${origId} (renamed to ${spell.id})`);
  } else {
    idMap[idKey] = 1;
  }

  // Type
  if (!ALLOWED_TYPES.includes((spell.type as string))) {
    errors.push(`Invalid type for spell ${spell.name}: ${spell.type}`);
    valid = false;
  }
  // Element
  if (!ALLOWED_ELEMENTS.includes((spell.element as string))) {
    errors.push(`Invalid element for spell ${spell.name}: ${spell.element}`);
    valid = false;
  }
  // Rarity (if present)
  if ((spell as any).rarity && !ALLOWED_RARITIES.includes((spell as any).rarity)) {
    errors.push(`Invalid rarity for spell ${spell.name}: ${(spell as any).rarity}`);
    valid = false;
  }
  // Effects
  if (!spell.effects || spell.effects.length === 0) {
    errors.push(`Spell ${spell.name} has no effects.`);
    valid = false;
  } else {
    spell.effects.forEach((effect, i) => {
      if (!ALLOWED_EFFECT_TYPES.includes(effect.type)) {
        errors.push(`Invalid effect type for spell ${spell.name}: ${effect.type}`);
        valid = false;
      }
      if (!ALLOWED_TARGETS.includes(effect.target)) {
        errors.push(`Invalid effect target for spell ${spell.name}: ${effect.target}`);
        valid = false;
      }
      if (!ALLOWED_ELEMENTS.includes(effect.element)) {
        errors.push(`Invalid effect element for spell ${spell.name}: ${effect.element}`);
        valid = false;
      }
    });
  }
  // Image existence
  const imgPath = spell.imagePath.startsWith('/') ? spell.imagePath.slice(1) : spell.imagePath;
  const fullImgPath = path.join(__dirname, '../public', imgPath);
  if (!fs.existsSync(fullImgPath)) {
    errors.push(`Image not found for spell ${spell.name}: ${spell.imagePath}`);
    valid = false;
  }
  // List membership (for now, always 'any')
  // TODO: Add real list logic if/when available
  return spell;
}

const validatedSpells = allSpells.map(validateSpell);

if (errors.length > 0) {
  console.error('Validation failed. Errors:');
  errors.forEach(e => console.error(e));
  console.error(`\n${renamed.length} spells were renamed due to duplicates.`);
  process.exit(1);
}

const xmlSpells = validatedSpells.map(spell => spellToXml(spell, ['any'])).join('\n');
const xml = `<spells>\n${xmlSpells}\n</spells>`;

fs.writeFileSync(OUTPUT_PATH, xml, 'utf-8');
console.log(`Exported ${validatedSpells.length} spells to ${OUTPUT_PATH}`);
if (renamed.length > 0) {
  console.log(`${renamed.length} spells were renamed due to duplicates:`);
  renamed.forEach(r => console.log(`  ${r.old} -> ${r.newName} (${r.newId})`));
}
// Inline comments: For future batch editing/versioning, extend this script to support diff/patch and version tags in XML. 