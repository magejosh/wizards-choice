const fs = require('fs');
const path = require('path');
const { getAllSpells: getMainSpells } = require('../src/lib/spells/spellData');
const { getAllSpecialSpells } = require('../src/lib/spells/specialSpellData');

const mainSpells = getMainSpells();
const specialSpells = getAllSpecialSpells();
console.log(`Loaded ${mainSpells.length} main spells and ${specialSpells.length} special spells.`);
const allSpells = [...mainSpells, ...specialSpells];

const errors = [];
const nameMap = {};
const idMap = {};
const renamed = [];

function validateSpell(spell) {
  // ... existing code ...
}

const validatedSpells = allSpells.map(validateSpell);

if (errors.length > 0) {
  console.error('Validation failed. Errors:');
  errors.forEach(e => console.error(e));
  console.error(`\n${renamed.length} spells were renamed due to duplicates.`);
  process.exit(1);
}

console.log('Validation passed. Writing XML file...');
const xmlSpells = validatedSpells.map(spell => spellToXml(spell, ['any'])).join('\n');
const xml = `<spells>\n${xmlSpells}\n</spells>`;

fs.writeFileSync(OUTPUT_PATH, xml, 'utf-8');
console.log(`Exported ${validatedSpells.length} spells to ${OUTPUT_PATH}`);
if (renamed.length > 0) {
  console.log(`${renamed.length} spells were renamed due to duplicates:`);
  renamed.forEach(r => console.log(`  ${r.old} -> ${r.newName} (${r.newId})`));
}
// Inline comments: For future batch editing/versioning, extend this script to support diff/patch and version tags in XML. 