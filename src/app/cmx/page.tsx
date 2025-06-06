"use client";
import { useEffect, useState } from "react";
import { loadSpellsFromXML, clearSpellCache } from "@/lib/spells/spellData";
import { Spell as BaseSpell, SpellEffect } from "@/lib/types/spell-types";
import { ElementType } from "@/lib/types/element-types";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import styles from './cmx.module.css';

type Spell = BaseSpell & { rarity?: string; lists: string[] };

const SPELL_TYPES = ["attack", "healing", "debuff", "buff", "reaction"];
const ELEMENT_TYPES: ElementType[] = ["fire", "water", "earth", "air", "arcane", "nature", "shadow", "light"];
const RARITIES = ["common", "uncommon", "rare", "epic", "legendary"];
const LIST_TYPES = ["archetype", "creature", "any"];

// Utility to extract effect types from SpellEffect type
function getEffectTypes(): string[] {
  return [
    "damage", "healing", "buff", "debuff", "control", "summon", "utility", "timeRewind", "delay", "confusion",
    "damageBonus", "defense", "spellEcho", "manaRestore", "statModifier", "statusEffect", "damageReduction"
  ].sort();
}
const EFFECT_TYPES = getEffectTypes();

const EFFECT_TARGETS = ["self", "enemy"];

function fileExists(path: string): boolean {
  // Only works for files in public/images/spells/ in dev mode
  if (!path) return false;
  const img = new window.Image();
  img.src = path;
  return img.complete && img.naturalWidth > 0;
}

function EffectEditor({ effects, onChange }: { effects: any[]; onChange: (effects: any[]) => void }) {
  const handleEffectChange = (idx: number, field: string, value: any) => {
    const updated = effects.map((e, i) => i === idx ? { ...e, [field]: value } : e);
    onChange(updated);
  };
  const handleAddEffect = () => {
    onChange([...effects, { type: "damage", value: 0, target: "enemy", element: "fire" }]);
  };
  const handleRemoveEffect = (idx: number) => {
    onChange(effects.filter((_, i) => i !== idx));
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {effects.map((effect, idx) => (
        <div key={idx} style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <select value={effect.type} onChange={e => handleEffectChange(idx, "type", e.target.value)}>
            {EFFECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="number" value={effect.value} style={{ width: 60 }} onChange={e => handleEffectChange(idx, "value", parseFloat(e.target.value))} />
          <select value={effect.target} onChange={e => handleEffectChange(idx, "target", e.target.value)}>
            {EFFECT_TARGETS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={effect.element} onChange={e => handleEffectChange(idx, "element", e.target.value)}>
            {ELEMENT_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <input type="number" value={effect.duration ?? ''} style={{ width: 50 }} placeholder="dur" onChange={e => handleEffectChange(idx, "duration", e.target.value ? parseInt(e.target.value, 10) : undefined)} />
          <button type="button" onClick={() => handleRemoveEffect(idx)}>-</button>
        </div>
      ))}
      <button type="button" onClick={handleAddEffect}>Add Effect</button>
    </div>
  );
}

function ListMembershipEditor({ lists, onChange }: { lists: string[]; onChange: (lists: string[]) => void }) {
  const handleToggle = (list: string) => {
    if (lists.includes(list)) {
      onChange(lists.filter(l => l !== list));
    } else {
      onChange([...lists, list]);
    }
  };
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {LIST_TYPES.map(list => (
        <label key={list} style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <input type="checkbox" checked={lists.includes(list)} onChange={() => handleToggle(list)} />
          {list}
        </label>
      ))}
    </div>
  );
}

function serializeSpellsToXml(spells: Spell[]): string {
  const builder = new XMLBuilder({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    textNodeName: '#text',
    format: true,
    suppressEmptyNode: true,
  });
  const xmlObj = {
    spells: {
      spell: spells.map(spell => ({
        id: spell.id,
        name: spell.name,
        type: spell.type,
        element: spell.element,
        tier: spell.tier,
        manaCost: spell.manaCost,
        rarity: spell.rarity,
        imagePath: spell.imagePath,
        description: { '#text': spell.description },
        effects: {
          effect: spell.effects.map(e => ({
            type: e.type,
            value: e.value,
            target: e.target,
            element: e.element,
            ...(e.duration !== undefined ? { duration: e.duration } : {}),
          })),
        },
        list: spell.lists && spell.lists.length > 0 ? spell.lists : ["any"],
      })),
    },
  };
  return builder.build(xmlObj);
}

function parseXmlToSpells(xmlText: string): Spell[] {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '', textNodeName: '#text' });
  const xmlObj = parser.parse(xmlText);
  const spellNodes = xmlObj.spells && xmlObj.spells.spell ? xmlObj.spells.spell : [];
  const spellArr = Array.isArray(spellNodes) ? spellNodes : [spellNodes];
  return spellArr.map((node: any) => {
    const lists = node.list ? (Array.isArray(node.list) ? node.list : [node.list]) : ["any"];
    const effects = node.effects && node.effects.effect
      ? (Array.isArray(node.effects.effect) ? node.effects.effect : [node.effects.effect])
      : [];
    return {
      id: node.id || '',
      name: node.name || '',
      type: node.type,
      element: node.element,
      tier: parseInt(node.tier || '1', 10),
      manaCost: parseInt(node.manaCost || '0', 10),
      rarity: node.rarity || 'common',
      imagePath: node.imagePath || '',
      description: node.description?.['#text'] || '',
      effects: effects.map((e: any) => ({
        type: e.type,
        value: parseFloat(e.value || '0'),
        target: e.target,
        element: e.element,
        duration: e.duration !== undefined ? parseInt(e.duration, 10) : undefined,
      })),
      lists,
    };
  });
}

export default function CMXSpellManagerPage() {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSpell, setEditSpell] = useState<Spell | null>(null);
  const [newSpell, setNewSpell] = useState<Spell | null>(null);
  const [imageWarning, setImageWarning] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [duplicateNamePrompt, setDuplicateNamePrompt] = useState<{ mode: 'edit' | 'add'; spell: Spell } | null>(null);
  const [renameValue, setRenameValue] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Only allow in dev
  if (process.env.NODE_ENV !== "development") {
    return <div style={{ color: "red", padding: 32 }}>CMX is only available in development mode.</div>;
  }

  useEffect(() => {
    loadSpellsFromXML()
      .then(spells => setSpells(spells.map(s => ({ ...s, lists: (s as any).lists && (s as any).lists.length > 0 ? (s as any).lists : ["any"] }))))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading spells...</div>;
  if (error) return <div style={{ color: "red" }}>Error: {error}</div>;

  const handleEdit = (spell: Spell) => {
    setEditingId(spell.id);
    setEditSpell({ ...spell, lists: spell.lists && spell.lists.length > 0 ? spell.lists : ["any"] });
    setImageWarning(null);
  };

  const handleDelete = (id: string) => {
    setSpells((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditSpell(null);
    }
  };

  const handleEditChange = (field: keyof Spell, value: any) => {
    if (!editSpell) return;
    setEditSpell({ ...editSpell, [field]: value });
    if (field === "imagePath") {
      // Validate image exists
      const img = new window.Image();
      img.onload = () => setImageWarning(null);
      img.onerror = () => setImageWarning("Image not found in /public/images/spells/");
      img.src = value;
    }
  };

  function checkDuplicateName(name: string, excludeId?: string) {
    return spells.some(s => s.name.toLowerCase() === name.toLowerCase() && s.id !== excludeId);
  }

  const handleSave = () => {
    if (!editSpell) return;
    if (checkDuplicateName(editSpell.name, editSpell.id)) {
      setDuplicateNamePrompt({ mode: 'edit', spell: editSpell });
      setRenameValue(editSpell.name);
      return;
    }
    setSpells((prev) => prev.map((s) => (s.id === editSpell.id ? editSpell : s)));
    setEditingId(null);
    setEditSpell(null);
    setImageWarning(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditSpell(null);
    setImageWarning(null);
  };

  const handleAddNew = () => {
    setNewSpell({
      id: "",
      name: "",
      type: "attack",
      element: "fire",
      tier: 1,
      manaCost: 0,
      description: "",
      effects: [],
      imagePath: "",
      rarity: "common",
      lists: ["any"],
    });
  };

  const handleNewChange = (field: keyof Spell, value: any) => {
    if (!newSpell) return;
    setNewSpell({ ...newSpell, [field]: value });
    if (field === "imagePath") {
      const img = new window.Image();
      img.onload = () => setImageWarning(null);
      img.onerror = () => setImageWarning("Image not found in /public/images/spells/");
      img.src = value;
    }
  };

  const handleNewSave = () => {
    if (!newSpell) return;
    if (checkDuplicateName(newSpell.name)) {
      setDuplicateNamePrompt({ mode: 'add', spell: newSpell });
      setRenameValue(newSpell.name);
      return;
    }
    setSpells((prev) => [...prev, newSpell]);
    setNewSpell(null);
    setImageWarning(null);
  };

  const handleNewCancel = () => {
    setNewSpell(null);
    setImageWarning(null);
  };

  const handleOverwrite = () => {
    if (!duplicateNamePrompt) return;
    if (duplicateNamePrompt.mode === 'edit') {
      setSpells((prev) => prev.map((s) =>
        s.name.toLowerCase() === duplicateNamePrompt.spell.name.toLowerCase() ? duplicateNamePrompt.spell : s
      ));
      setEditingId(null);
      setEditSpell(null);
    } else {
      setSpells((prev) => [
        ...prev.filter(s => s.name.toLowerCase() !== duplicateNamePrompt.spell.name.toLowerCase()),
        duplicateNamePrompt.spell
      ]);
      setNewSpell(null);
    }
    setDuplicateNamePrompt(null);
    setImageWarning(null);
  };

  const handleRename = () => {
    if (!duplicateNamePrompt) return;
    if (checkDuplicateName(renameValue, duplicateNamePrompt.spell.id)) return; // still duplicate
    if (duplicateNamePrompt.mode === 'edit') {
      setEditSpell({ ...duplicateNamePrompt.spell, name: renameValue });
    } else {
      setNewSpell({ ...duplicateNamePrompt.spell, name: renameValue });
    }
    setDuplicateNamePrompt(null);
  };

  const handleDownloadXml = () => {
    const xml = serializeSpellsToXml(spells);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spell_data.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportXml = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const xmlText = evt.target?.result as string;
        const importedSpells = parseXmlToSpells(xmlText);
        setSpells(importedSpells);
        setImportError(null);
      } catch (err: any) {
        setImportError('Failed to parse XML: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveToServer = async () => {
    setSaveStatus('saving');
    setSaveError(null);
    try {
      const xml = serializeSpellsToXml(spells);
      const res = await fetch('/api/cmx/save-spell-xml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: xml,
      });
      const data = await res.json();
      if (data.success) {
        // Invalidate spell cache so the game reloads the latest spell data
        clearSpellCache();
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        setSaveError(data.error || 'Unknown error');
      }
    } catch (err: any) {
      setSaveStatus('error');
      setSaveError(err.message);
    }
  };

  function renderEffectsSummary(effects: any[]) {
    return effects.map((e, i) => `${e.type}(${e.value}${e.duration ? `/${e.duration}` : ''})`).join(', ');
  }

  return (
    <div className={styles.cmxContainer}>
      <h1 className={styles.cmxTitle}>Card Management Editor (CMX)</h1>
      <div className={styles.cmxDivider}></div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className={styles.cmxButton} onClick={handleDownloadXml} aria-label="Download spell XML">Download XML</button>
        <label style={{ display: 'inline-block' }}>
          <span style={{ marginRight: 8 }}>Import XML:</span>
          <input type="file" accept=".xml" onChange={handleImportXml} aria-label="Import spell XML" />
        </label>
        <button className={styles.cmxButton} onClick={handleSaveToServer} disabled={saveStatus === 'saving'} aria-label="Save spell XML to server">
          {saveStatus === 'saving' ? 'Saving...' : 'Save to Server'}
        </button>
        {saveStatus === 'success' && <span style={{ color: 'green' }}>Saved!</span>}
        {saveStatus === 'error' && <span style={{ color: 'red' }}>Error: {saveError}</span>}
        {importError && <span style={{ color: 'red' }}>{importError}</span>}
      </div>
      <button className={styles.cmxButton} onClick={handleAddNew} style={{ marginBottom: 16 }} aria-label="Add new spell">Add New Spell</button>
      {duplicateNamePrompt && (
        <div className={styles.cmxPromptOverlay}>
          <div className={styles.cmxPromptBox} role="dialog" aria-modal="true" aria-label="Duplicate Name Prompt">
            <div style={{ marginBottom: 8 }}>
              A spell with the name "{duplicateNamePrompt.spell.name}" already exists.<br />
              Would you like to Overwrite or Rename?
            </div>
            <button className={styles.cmxButton} onClick={handleOverwrite} style={{ marginRight: 8 }}>Overwrite</button>
            <input
              className={styles.cmxInput}
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              style={{ marginRight: 8, width: 180 }}
              placeholder="New unique name"
              aria-label="Rename spell"
            />
            <button className={styles.cmxButtonSecondary} onClick={handleRename} disabled={checkDuplicateName(renameValue, duplicateNamePrompt.spell.id) || !renameValue.trim()}>Rename</button>
            {checkDuplicateName(renameValue, duplicateNamePrompt.spell.id) && <span style={{ color: 'red', marginLeft: 8 }}>Name still exists</span>}
          </div>
        </div>
      )}
      <table className={styles.cmxTable}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Type</th>
            <th>Element</th>
            <th>Tier</th>
            <th>Mana</th>
            <th>Image</th>
            <th>Effects</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {spells.map((spell) => {
            const isExpanded = expandedId === spell.id;
            if (editingId === spell.id) {
              return (
                <tr key={spell.id + '-edit'}>
                  <td colSpan={9} style={{ background: '#23204a', padding: '2rem 2.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 180 }}>
                          <label>ID<br /><input className={styles.cmxInput} value={editSpell?.id || ""} onChange={e => handleEditChange("id", e.target.value)} aria-label="Spell ID" /></label>
                        </div>
                        <div style={{ flex: 1, minWidth: 180 }}>
                          <label>Name<br /><input className={styles.cmxInput} value={editSpell?.name || ""} onChange={e => handleEditChange("name", e.target.value)} aria-label="Spell Name" /></label>
                        </div>
                        <div style={{ flex: 1, minWidth: 120 }}>
                          <label>Type<br /><select className={styles.cmxSelect} value={editSpell?.type} onChange={e => handleEditChange("type", e.target.value)} aria-label="Spell Type">{SPELL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></label>
                        </div>
                        <div style={{ flex: 1, minWidth: 120 }}>
                          <label>Element<br /><select className={styles.cmxSelect} value={editSpell?.element} onChange={e => handleEditChange("element", e.target.value as ElementType)} aria-label="Spell Element">{ELEMENT_TYPES.map(e => <option key={e} value={e}>{e}</option>)}</select></label>
                        </div>
                        <div style={{ flex: 1, minWidth: 80 }}>
                          <label>Tier<br /><input className={styles.cmxInput} type="number" value={editSpell?.tier || 1} onChange={e => handleEditChange("tier", parseInt(e.target.value, 10))} aria-label="Spell Tier" /></label>
                        </div>
                        <div style={{ flex: 1, minWidth: 80 }}>
                          <label>Mana<br /><input className={styles.cmxInput} type="number" value={editSpell?.manaCost || 0} onChange={e => handleEditChange("manaCost", parseInt(e.target.value, 10))} aria-label="Mana Cost" /></label>
                        </div>
                        <div style={{ flex: 1, minWidth: 220 }}>
                          <label>Image Path<br /><input className={styles.cmxInput} value={editSpell?.imagePath || ""} onChange={e => handleEditChange("imagePath", e.target.value)} aria-label="Image Path" /></label>
                          {editSpell?.imagePath && (<img src={editSpell.imagePath} alt={editSpell.name} style={{ width: 40, height: 40, objectFit: "cover", marginTop: 4 }} />)}
                          {imageWarning && <div style={{ color: "red" }}>{imageWarning}</div>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 2, minWidth: 300 }}>
                          <label>Description<br /><textarea className={styles.cmxTextarea} value={editSpell?.description || ""} onChange={e => handleEditChange("description", e.target.value)} rows={2} aria-label="Description" /></label>
                        </div>
                        <div style={{ flex: 1, minWidth: 120 }}>
                          <label>Rarity<br /><select className={styles.cmxSelect} value={editSpell?.rarity || "common"} onChange={e => handleEditChange("rarity", e.target.value)} aria-label="Rarity">{RARITIES.map(r => <option key={r} value={r}>{r}</option>)}</select></label>
                        </div>
                        <div style={{ flex: 2, minWidth: 300 }}>
                          <label>List Membership<br /><ListMembershipEditor lists={editSpell?.lists || ["any"]} onChange={lists => handleEditChange("lists", lists)} /></label>
                        </div>
                      </div>
                      <div>
                        <label>Effects<br /><EffectEditor effects={editSpell?.effects || []} onChange={effects => handleEditChange("effects", effects)} /></label>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <button className={styles.cmxButton} onClick={handleSave} aria-label="Save Spell">Save</button>
                        <button className={styles.cmxButtonSecondary} onClick={handleCancel} aria-label="Cancel Edit">Cancel</button>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            }
            return [
              <tr
                key={spell.id}
                className={isExpanded ? styles.cmxExpandedRow : ''}
                onClick={() => setExpandedId(isExpanded ? null : spell.id)}
                style={{ cursor: 'pointer', background: isExpanded ? '#2d1b4e' : undefined }}
              >
                <td>{spell.id}</td>
                <td>{spell.name}</td>
                <td>{spell.type}</td>
                <td>{spell.element}</td>
                <td>{spell.tier}</td>
                <td>{spell.manaCost}</td>
                <td>
                  {spell.imagePath && (
                    <img src={spell.imagePath} alt={spell.name} style={{ width: 40, height: 40, objectFit: "cover" }} />
                  )}
                </td>
                <td>{renderEffectsSummary(spell.effects)}</td>
                <td>
                  <button className={styles.cmxButton} onClick={e => { e.stopPropagation(); setExpandedId(spell.id); }}>Details</button>
                </td>
              </tr>,
              isExpanded && (
                <tr key={spell.id + '-details'}>
                  <td colSpan={9} style={{ background: '#1a1a2e', padding: '1.5rem 2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div><b>Description:</b> {spell.description}</div>
                      <div><b>Rarity:</b> {spell.rarity}</div>
                      <div><b>Effects:</b>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          {spell.effects.map((e, i) => (
                            <li key={i}>{e.type} | {e.value} | {e.target} | {e.element}{e.duration !== undefined ? ` | ${e.duration} turns` : ''}</li>
                          ))}
                        </ul>
                      </div>
                      <div><b>List Membership:</b> {spell.lists && spell.lists.length > 0 ? spell.lists.join(', ') : 'any'}</div>
                      <div style={{ marginTop: 8 }}>
                        <button className={styles.cmxButton} onClick={e => { e.stopPropagation(); handleEdit(spell); }}>Edit</button>
                        <button className={styles.cmxButtonSecondary} onClick={e => { e.stopPropagation(); handleDelete(spell.id); }}>Delete</button>
                        <button className={styles.cmxButtonSecondary} onClick={e => { e.stopPropagation(); setExpandedId(null); }}>Collapse</button>
                      </div>
                    </div>
                  </td>
                </tr>
              )
            ];
          })}
          {newSpell && (
            <tr style={{ background: "#e6f7ff" }}>
              <td><input className={styles.cmxInput} value={newSpell.id} onChange={e => handleNewChange("id", e.target.value)} aria-label="Spell ID" /></td>
              <td><input className={styles.cmxInput} value={newSpell.name} onChange={e => handleNewChange("name", e.target.value)} aria-label="Spell Name" /></td>
              <td>
                <select className={styles.cmxSelect} value={newSpell.type} onChange={e => handleNewChange("type", e.target.value)} aria-label="Spell Type">
                  {SPELL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </td>
              <td>
                <select className={styles.cmxSelect} value={newSpell.element} onChange={e => handleNewChange("element", e.target.value as ElementType)} aria-label="Spell Element">
                  {ELEMENT_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </td>
              <td><input className={styles.cmxInput} type="number" value={newSpell.tier} onChange={e => handleNewChange("tier", parseInt(e.target.value, 10))} aria-label="Spell Tier" /></td>
              <td><input className={styles.cmxInput} type="number" value={newSpell.manaCost} onChange={e => handleNewChange("manaCost", parseInt(e.target.value, 10))} aria-label="Mana Cost" /></td>
              <td>
                <input className={styles.cmxInput} value={newSpell.imagePath} onChange={e => handleNewChange("imagePath", e.target.value)} aria-label="Image Path" />
                {newSpell.imagePath && (
                  <img src={newSpell.imagePath} alt={newSpell.name} style={{ width: 40, height: 40, objectFit: "cover" }} />
                )}
                {imageWarning && <div style={{ color: "red" }}>{imageWarning}</div>}
              </td>
              <td>{renderEffectsSummary(newSpell.effects)}</td>
              <td>
                <button className={styles.cmxButton} onClick={handleNewSave} aria-label="Add Spell">Add</button>
                <button className={styles.cmxButtonSecondary} onClick={handleNewCancel} aria-label="Cancel Add">Cancel</button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className={styles.cmxDivider}></div>
      <div style={{ color: '#b38dff', textAlign: 'center', marginTop: 24, fontFamily: 'Cinzel, serif', fontSize: '1.1rem' }}>
        <span>All changes are live in the editor. Use <b>Save to Server</b> to persist to the game.</span>
      </div>
    </div>
  );
} 