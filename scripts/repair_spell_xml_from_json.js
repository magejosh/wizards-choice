const fs = require('fs');
const { XMLBuilder } = require('fast-xml-parser');

const jsonPath = 'public/data/spell_data.json';
const xmlPath = 'public/data/spell_data.xml';

const spells = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: '#text',
  format: true,
  suppressEmptyNode: true,
});

const xmlObj = {
  spells: {
    spell: spells.map(spell => {
      const spellObj = {
        id: spell.id,
        name: spell.name,
        type: spell.type,
        element: spell.element,
        tier: spell.tier,
        manaCost: spell.manaCost,
        rarity: spell.rarity || 'common',
        imagePath: spell.imagePath || '',
        description: { '#text': spell.description || '' },
        effects: {
          effect: spell.effects.map(e => ({
            type: e.type,
            value: e.value,
            target: e.target,
            element: e.element,
            ...(e.duration !== undefined ? { duration: e.duration } : {}),
          })),
        },
        list: spell.lists && spell.lists.length > 0 ? spell.lists : ['any'],
      };
      return spellObj;
    }),
  },
};

const xml = builder.build(xmlObj);
fs.writeFileSync(xmlPath, xml, 'utf-8');
console.log('Spell XML repaired from JSON backup with <description> as child node.'); 