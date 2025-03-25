// src/lib/types.ts
// Core type definitions for Wizard's Choice game

// User Authentication
export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
  email: string;
}

// Spell Types
export type SpellType = 'damage' | 'dot' | 'healing' | 'debuff' | 'buff' | 'reaction';
export type ElementType = 'fire' | 'water' | 'earth' | 'air' | 'arcane' | 'nature' | 'shadow' | 'light';

export interface Spell {
  id: string;
  name: string;
  type: SpellType;
  element: ElementType;
  tier: number; // 1-10
  manaCost: number;
  description: string;
  effects: SpellEffect[];
  imagePath: string; // Path to spell image, default is placeholder
}

export interface SpellEffect {
  type: 'damage' | 'healing' | 'manaRestore' | 'statModifier' | 'statusEffect';
  value: number;
  duration?: number; // For effects that last multiple turns
  target: 'self' | 'enemy';
  element?: ElementType;
}

// Equipment Types
export type EquipmentSlot = 'wand' | 'robe' | 'amulet' | 'ring1' | 'ring2';

export interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  bonuses: EquipmentBonus[];
  description: string;
}

export interface EquipmentBonus {
  type: 'manaCostReduction' | 'manaRegen' | 'spellPower' | 'health' | 'damageReduction' | 'healthRegen' | 'elementalAffinity' | 'spellReuse' | 'damageBarrier' | 'criticalSpellcast' | 'manaBoost' | 'spellVampirism';
  value: number;
  element?: ElementType; // For elemental affinity
}

// Wizard Types
export interface Wizard {
  id: string;
  name: string;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  manaRegen: number;
  spells: Spell[]; // All spells known
  equippedSpells: Spell[]; // Spells selected for battle (max 3)
  equipment: Partial<Record<EquipmentSlot, Equipment>>;
  levelUpPoints: number;
  decks: Deck[]; // Collection of saved decks
  activeDeckId: string | null; // Currently active deck ID
}

// Deck Management Types
export interface Deck {
  id: string;
  name: string;
  spells: Spell[];
  dateCreated: string;
  lastModified: string;
}

// Combat Types
export interface CombatState {
  playerWizard: CombatWizard;
  enemyWizard: CombatWizard;
  turn: number;
  round: number;
  isPlayerTurn: boolean;
  log: CombatLogEntry[];
  status: 'active' | 'playerWon' | 'enemyWon';
  difficulty: 'easy' | 'normal' | 'hard';
}

export interface CombatWizard {
  wizard: Wizard;
  currentHealth: number;
  currentMana: number;
  activeEffects: ActiveEffect[];
  selectedSpell: Spell | null;
}

export interface ActiveEffect {
  id: string;
  name: string;
  effect: SpellEffect;
  remainingDuration: number;
  source: 'player' | 'enemy';
}

export interface CombatLogEntry {
  turn: number;
  round: number;
  actor: 'player' | 'enemy';
  action: string;
  details: string;
  damage?: number;
  healing?: number;
  mana?: number;
}

// Game State Types
export interface GameState {
  player: Wizard;
  gameProgress: GameProgress;
  settings: GameSettings;
  saveSlots: SaveSlot[];
  currentSaveSlot: number;
}

export interface GameProgress {
  defeatedEnemies: string[];
  unlockedSpells: string[];
  currentLocation: 'wizardStudy' | 'duel' | 'levelUp';
  questProgress: Record<string, any>;
}

export interface GameSettings {
  difficulty: 'easy' | 'normal' | 'hard';
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  colorblindMode: boolean;
  uiScale: number;
  theme: 'default' | 'dark' | 'light' | 'highContrast';
}

export interface SaveSlot {
  id: number;
  playerName: string;
  level: number;
  lastSaved: string; // ISO date string
  isEmpty: boolean;
}
