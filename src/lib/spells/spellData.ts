// src/lib/spells/spellData.ts
import { Spell, SpellEffect, SpellType } from '../types';
import { ElementType } from '../types/element-types';

// XML spell loader utility
let spellCache: Spell[] = [];
let spellLoadPromise: Promise<Spell[]> | null = null;

const STRICT_DUPLICATE_CHECK = false; // Set to true to throw on duplicate spell names

function parseAndValidate(xmlText: string): Spell[] {
  const spells: Spell[] = parseXmlSpells(xmlText);
  const nameSet = new Set<string>();
  const duplicateNames: string[] = [];
  const filteredSpells: Spell[] = [];
  for (const spell of spells) {
    if (!spell.id || !spell.name) throw new Error('Spell missing id or name');
    const lowerName = spell.name.toLowerCase();
    if (nameSet.has(lowerName)) {
      duplicateNames.push(spell.name);
      if (STRICT_DUPLICATE_CHECK) throw new Error('Duplicate spell name: ' + spell.name);
      continue;
    }
    nameSet.add(lowerName);
    filteredSpells.push(spell);
  }
  if (duplicateNames.length > 0) {
    console.warn(
      `[Spell Loader] Skipped duplicate spell names: ${duplicateNames.join(', ')}. Only the first occurrence of each name was loaded.`
    );
  }
  return filteredSpells;
}

function getSpellDataUrl() {
  if (typeof window === 'undefined') {
    // Server-side: construct absolute URL
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return base.replace(/\/$/, '') + '/data/spell_data.xml';
  } else {
    // Client-side: use relative path
    return '/data/spell_data.xml';
  }
}

function parseXmlSpells(xmlText: string): Spell[] {
  if (typeof window === 'undefined') {
    // Server-side: use fast-xml-parser
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { XMLParser } = require('fast-xml-parser');
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', textNodeName: '#text' });
    const xmlObj = parser.parse(xmlText);
    const spellNodes = xmlObj.spells && xmlObj.spells.spell ? xmlObj.spells.spell : [];
    // Ensure spellNodes is always an array
    const spellArr = Array.isArray(spellNodes) ? spellNodes : [spellNodes];
    return spellArr.map((node: any) => {
      const id = node.id || '';
      const name = node.name || '';
      const type = node.type as SpellType;
      const element = node.element as ElementType;
      const tier = parseInt(node.tier || '1', 10);
      const manaCost = parseInt(node.manaCost || '0', 10);
      const rarity = node.rarity || 'common';
      const imagePath = node.imagePath || '';
      const description = node.description?.['#text'] || '';
      // Effects
      let effects: SpellEffect[] = [];
      if (node.effects && node.effects.effect) {
        const effectArr = Array.isArray(node.effects.effect) ? node.effects.effect : [node.effects.effect];
        effects = effectArr.map((e: any) => ({
          type: e.type,
          value: parseFloat(e.value || '0'),
          target: e.target,
          element: e.element,
          duration: e.duration !== undefined ? parseInt(e.duration, 10) : undefined,
          minionName: e.minionName,
          modelPath: e.modelPath,
          health: e.health !== undefined ? parseInt(e.health, 10) : undefined,
        }));
      }
      const lists = node.list ? (Array.isArray(node.list) ? node.list : [node.list]) : ['any'];
      return { id, name, type, element, tier, manaCost, description, effects, imagePath, rarity, lists } as Spell;
    });
  } else {
    // Client-side: use DOMParser
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, 'application/xml');
    const spellNodes = Array.from(xml.getElementsByTagName('spell'));
    return spellNodes.map((node) => {
      const id = node.getAttribute('id') || '';
      const name = node.getAttribute('name') || '';
      const type = node.getAttribute('type') as SpellType;
      const element = node.getAttribute('element') as ElementType;
      const tier = parseInt(node.getAttribute('tier') || '1', 10);
      const manaCost = parseInt(node.getAttribute('manaCost') || '0', 10);
      const rarity = node.getAttribute('rarity') || 'common';
      const imagePath = node.getAttribute('imagePath') || '';
      const description = node.getElementsByTagName('description')[0]?.textContent || '';
      const effects: SpellEffect[] = Array.from(node.getElementsByTagName('effect')).map((e) => ({
        type: e.getAttribute('type') as any,
        value: parseFloat(e.getAttribute('value') || '0'),
        target: e.getAttribute('target') as any,
        element: e.getAttribute('element') as any,
        duration: e.hasAttribute('duration') ? parseInt(e.getAttribute('duration')!, 10) : undefined,
        minionName: e.getAttribute('minionName') || undefined,
        modelPath: e.getAttribute('modelPath') || undefined,
        health: e.hasAttribute('health') ? parseInt(e.getAttribute('health')!, 10) : undefined,
      }));
      const lists = Array.from(node.getElementsByTagName('list')).map(n => n.textContent || '').filter(Boolean);
      if (lists.length === 0) lists.push('any');
      return { id, name, type, element, tier, manaCost, description, effects, imagePath, rarity, lists } as Spell;
    });
  }
}

export async function loadSpellsFromXML(): Promise<Spell[]> {
  if (spellCache.length > 0) return spellCache;
  if (spellLoadPromise) return spellLoadPromise;
  const loader = async () => {
    let xmlText: string;
    if (typeof window === 'undefined') {
      const { readFile } = await import('fs/promises');
      const { join } = await import('path');
      const filePath = join(process.cwd(), 'public', 'data', 'spell_data.xml');
      xmlText = await readFile(filePath, 'utf8');
    } else {
      const url = getSpellDataUrl();
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load spell_data.xml');
      xmlText = await res.text();
    }
    const spells = parseAndValidate(xmlText);
    spellCache = spells;
    return spells;
  };
  spellLoadPromise = loader().catch((err) => {
    spellLoadPromise = null;
    throw err;
  });
  return spellLoadPromise;
}

export async function getAllSpells(): Promise<Spell[]> {
  return loadSpellsFromXML();
}

export async function getSpellsByTier(tier: number): Promise<Spell[]> {
  const spells = await loadSpellsFromXML();
  return spells.filter(s => s.tier === tier);
}

export async function getSpellsByElement(element: ElementType): Promise<Spell[]> {
  const spells = await loadSpellsFromXML();
  return spells.filter(s => s.element === element);
}

export async function getSpellsByType(type: SpellType): Promise<Spell[]> {
  const spells = await loadSpellsFromXML();
  return spells.filter(s => s.type === type);
}

export async function getSpellByName(name: string): Promise<Spell | undefined> {
  const spells = await loadSpellsFromXML();
  return spells.find(s => s.name.toLowerCase() === name.toLowerCase());
}

export async function getSpellById(id: string): Promise<Spell | undefined> {
  const spells = await loadSpellsFromXML();
  return spells.find(s => s.id === id);
}

export async function getSpellsByList(listName: string): Promise<Spell[]> {
  const spells = await loadSpellsFromXML();
  return spells.filter(s => (s.lists || []).includes(listName));
}

export function clearSpellCache() {
  spellCache = [];
  spellLoadPromise = null;
}
