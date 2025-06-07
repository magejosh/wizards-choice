"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var spellData_1 = require("../src/lib/spells/spellData");
var specialSpellData_1 = require("../src/lib/spells/specialSpellData");
// Allowed enums from /docs/spell_data_format.md
var ALLOWED_TYPES = ['attack', 'healing', 'debuff', 'buff', 'reaction', 'summon', 'control', 'utility'];
var ALLOWED_ELEMENTS = ['fire', 'water', 'earth', 'air', 'arcane', 'nature', 'shadow', 'light', 'physical', 'poison', 'mental', 'dark'];
var ALLOWED_RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
var ALLOWED_TARGETS = ['self', 'enemy'];
var ALLOWED_EFFECT_TYPES = [
    'damage', 'healing', 'buff', 'debuff', 'control', 'summon', 'utility', 'timeRewind', 'delay', 'confusion',
    'damageBonus', 'defense', 'spellEcho', 'manaRestore', 'statModifier', 'statusEffect'
];
var ALLOWED_LISTS = ['archetype', 'creature', 'any'];
var IMAGE_BASE_PATH = path_1.default.join(__dirname, '../public/images/spells');
var OUTPUT_PATH = path_1.default.join(__dirname, '../public/data/spell_data.xml');
// Helper to escape XML special characters
function escapeXml(unsafe) {
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
function spellToXml(spell, listMembership) {
    if (listMembership === void 0) { listMembership = ['any']; }
    var effectsXml = spell.effects.map(function (effect) {
        var attrs = [
            "type=\"".concat(effect.type, "\""),
            "value=\"".concat(effect.value, "\""),
            "target=\"".concat(effect.target, "\""),
            "element=\"".concat(effect.element, "\""),
            effect.duration !== undefined ? "duration=\"".concat(effect.duration, "\"") : null
        ].filter(Boolean).join(' ');
        return "      <effect ".concat(attrs, " />");
    }).join('\n');
    var listXml = listMembership.map(function (list) { return "    <list>".concat(list, "</list>"); }).join('\n');
    var rarityAttr = spell.rarity ? " rarity=\"".concat(spell.rarity, "\"") : '';
    return "  <spell id=\"".concat(escapeXml(spell.id), "\" name=\"").concat(escapeXml(spell.name), "\" type=\"").concat(spell.type, "\" element=\"").concat(spell.element, "\" tier=\"").concat(spell.tier, "\" manaCost=\"").concat(spell.manaCost, "\"").concat(rarityAttr, " imagePath=\"").concat(spell.imagePath, "\">\n") +
        "    <description>".concat(escapeXml(spell.description), "</description>\n") +
        "    <effects>\n".concat(effectsXml, "\n    </effects>\n") +
        "".concat(listXml, "\n") +
        "  </spell>";
}
// Load all spells
var mainSpells = (0, spellData_1.getAllSpells)();
var specialSpells = (0, specialSpellData_1.getAllSpecialSpells)();
var allSpells = __spreadArray(__spreadArray([], mainSpells, true), specialSpells, true);
// Validation
var errors = [];
var nameMap = {};
var idMap = {};
var renamed = [];
function validateSpell(spell, idx) {
    var valid = true;
    var origName = spell.name;
    var origId = spell.id;
    var nameKey = spell.name.toLowerCase();
    var idKey = spell.id.toLowerCase();
    // Uniqueness
    if (nameMap[nameKey]) {
        nameMap[nameKey]++;
        spell.name = "".concat(spell.name, "_").concat(nameMap[nameKey]);
        valid = false;
        renamed.push({ old: origName, newName: spell.name, newId: spell.id });
        errors.push("Duplicate spell name: ".concat(origName, " (renamed to ").concat(spell.name, ")"));
    }
    else {
        nameMap[nameKey] = 1;
    }
    if (idMap[idKey]) {
        idMap[idKey]++;
        spell.id = "".concat(spell.id, "_").concat(idMap[idKey]);
        valid = false;
        renamed.push({ old: origId, newName: spell.name, newId: spell.id });
        errors.push("Duplicate spell id: ".concat(origId, " (renamed to ").concat(spell.id, ")"));
    }
    else {
        idMap[idKey] = 1;
    }
    // Type
    if (!ALLOWED_TYPES.includes(spell.type)) {
        errors.push("Invalid type for spell ".concat(spell.name, ": ").concat(spell.type));
        valid = false;
    }
    // Element
    if (!ALLOWED_ELEMENTS.includes(spell.element)) {
        errors.push("Invalid element for spell ".concat(spell.name, ": ").concat(spell.element));
        valid = false;
    }
    // Rarity (if present)
    if (spell.rarity && !ALLOWED_RARITIES.includes(spell.rarity)) {
        errors.push("Invalid rarity for spell ".concat(spell.name, ": ").concat(spell.rarity));
        valid = false;
    }
    // Effects
    if (!spell.effects || spell.effects.length === 0) {
        errors.push("Spell ".concat(spell.name, " has no effects."));
        valid = false;
    }
    else {
        spell.effects.forEach(function (effect, i) {
            if (!ALLOWED_EFFECT_TYPES.includes(effect.type)) {
                errors.push("Invalid effect type for spell ".concat(spell.name, ": ").concat(effect.type));
                valid = false;
            }
            if (!ALLOWED_TARGETS.includes(effect.target)) {
                errors.push("Invalid effect target for spell ".concat(spell.name, ": ").concat(effect.target));
                valid = false;
            }
            if (!ALLOWED_ELEMENTS.includes(effect.element)) {
                errors.push("Invalid effect element for spell ".concat(spell.name, ": ").concat(effect.element));
                valid = false;
            }
        });
    }
    // Image existence
    var imgPath = spell.imagePath.startsWith('/') ? spell.imagePath.slice(1) : spell.imagePath;
    var fullImgPath = path_1.default.join(__dirname, '../public', imgPath);
    if (!fs_1.default.existsSync(fullImgPath)) {
        errors.push("Image not found for spell ".concat(spell.name, ": ").concat(spell.imagePath));
        valid = false;
    }
    // List membership (for now, always 'any')
    // TODO: Add real list logic if/when available
    return spell;
}
var validatedSpells = allSpells.map(validateSpell);
if (errors.length > 0) {
    console.error('Validation failed. Errors:');
    errors.forEach(function (e) { return console.error(e); });
    console.error("\n".concat(renamed.length, " spells were renamed due to duplicates."));
    process.exit(1);
}
var xmlSpells = validatedSpells.map(function (spell) { return spellToXml(spell, ['any']); }).join('\n');
var xml = "<spells>\n".concat(xmlSpells, "\n</spells>");
fs_1.default.writeFileSync(OUTPUT_PATH, xml, 'utf-8');
console.log("Exported ".concat(validatedSpells.length, " spells to ").concat(OUTPUT_PATH));
if (renamed.length > 0) {
    console.log("".concat(renamed.length, " spells were renamed due to duplicates:"));
    renamed.forEach(function (r) { return console.log("  ".concat(r.old, " -> ").concat(r.newName, " (").concat(r.newId, ")")); });
}
// Inline comments: For future batch editing/versioning, extend this script to support diff/patch and version tags in XML. 
