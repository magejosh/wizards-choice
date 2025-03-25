// src/lib/game-state/gameStateStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, Wizard, Spell, Equipment, GameSettings } from '../types';
import { generateDefaultWizard } from '../wizard/wizardUtils';
import { getDefaultSpells } from '../spells/spellData';

// Default initial game state
const initialGameState: GameState = {
  player: generateDefaultWizard(''),
  gameProgress: {
    defeatedEnemies: [],
    unlockedSpells: [],
    currentLocation: 'wizardStudy',
    questProgress: {},
  },
  settings: {
    difficulty: 'normal',
    soundEnabled: true,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    colorblindMode: false,
    uiScale: 1,
    theme: 'default',
  },
  saveSlots: Array(3).fill(null).map((_, i) => ({
    id: i,
    playerName: '',
    level: 0,
    lastSaved: '',
    isEmpty: true,
  })),
  currentSaveSlot: 0,
};

interface GameStateStore {
  gameState: GameState;
  initializeNewGame: (playerName: string, saveSlotId: number) => void;
  saveGame: () => void;
  loadGame: (saveSlotId: number) => boolean;
  updateWizard: (wizard: Wizard) => void;
  equipSpell: (spellId: string, index: number) => void;
  unequipSpell: (index: number) => void;
  equipItem: (item: Equipment) => void;
  unequipItem: (slot: string) => void;
  addSpell: (spell: Spell) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  addExperience: (amount: number) => void;
  spendLevelUpPoints: (stat: 'health' | 'mana' | 'manaRegen', amount: number) => boolean;
  setCurrentLocation: (location: 'wizardStudy' | 'duel' | 'levelUp') => void;
  resetState: () => void;
}

// Create the game state store with persistence
export const useGameStateStore = create<GameStateStore>()(
  persist(
    (set, get) => ({
      gameState: initialGameState,

      initializeNewGame: (playerName: string, saveSlotId: number) => {
        const defaultWizard = generateDefaultWizard(playerName);
        const defaultSpells = getDefaultSpells();
        
        // Add default spells to the wizard
        defaultWizard.spells = defaultSpells;
        
        // Equip the first three spells by default
        defaultWizard.equippedSpells = defaultSpells.slice(0, 3);
        
        const saveSlots = [...get().gameState.saveSlots];
        saveSlots[saveSlotId] = {
          id: saveSlotId,
          playerName,
          level: 1,
          lastSaved: new Date().toISOString(),
          isEmpty: false,
        };
        
        set({
          gameState: {
            ...get().gameState,
            player: defaultWizard,
            currentSaveSlot: saveSlotId,
            saveSlots,
            gameProgress: {
              defeatedEnemies: [],
              unlockedSpells: defaultSpells.map(spell => spell.id),
              currentLocation: 'wizardStudy',
              questProgress: {},
            },
          },
        });
      },

      saveGame: () => {
        const { gameState } = get();
        const saveSlots = [...gameState.saveSlots];
        saveSlots[gameState.currentSaveSlot] = {
          ...saveSlots[gameState.currentSaveSlot],
          playerName: gameState.player.name,
          level: gameState.player.level,
          lastSaved: new Date().toISOString(),
          isEmpty: false,
        };
        
        set({
          gameState: {
            ...gameState,
            saveSlots,
          },
        });
      },

      loadGame: (saveSlotId: number) => {
        const { gameState } = get();
        if (gameState.saveSlots[saveSlotId].isEmpty) {
          return false;
        }
        
        set({
          gameState: {
            ...gameState,
            currentSaveSlot: saveSlotId,
          },
        });
        
        return true;
      },

      updateWizard: (wizard: Wizard) => {
        set({
          gameState: {
            ...get().gameState,
            player: wizard,
          },
        });
      },

      equipSpell: (spellId: string, index: number) => {
        const { gameState } = get();
        const spell = gameState.player.spells.find(s => s.id === spellId);
        
        if (!spell) return;
        
        const equippedSpells = [...gameState.player.equippedSpells];
        
        // Ensure we don't exceed 3 equipped spells
        if (equippedSpells.length >= 3 && index >= equippedSpells.length) {
          return;
        }
        
        // Replace or add the spell at the specified index
        if (index < equippedSpells.length) {
          equippedSpells[index] = spell;
        } else {
          equippedSpells.push(spell);
        }
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              equippedSpells,
            },
          },
        });
      },

      unequipSpell: (index: number) => {
        const { gameState } = get();
        const equippedSpells = [...gameState.player.equippedSpells];
        
        if (index >= equippedSpells.length) return;
        
        equippedSpells.splice(index, 1);
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              equippedSpells,
            },
          },
        });
      },

      equipItem: (item: Equipment) => {
        const { gameState } = get();
        const equipment = { ...gameState.player.equipment };
        
        equipment[item.slot] = item;
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              equipment,
            },
          },
        });
      },

      unequipItem: (slot: string) => {
        const { gameState } = get();
        const equipment = { ...gameState.player.equipment };
        
        delete equipment[slot as keyof typeof equipment];
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              equipment,
            },
          },
        });
      },

      addSpell: (spell: Spell) => {
        const { gameState } = get();
        const spells = [...gameState.player.spells];
        
        // Check if the spell already exists
        if (spells.some(s => s.id === spell.id)) return;
        
        spells.push(spell);
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              spells,
            },
            gameProgress: {
              ...gameState.gameProgress,
              unlockedSpells: [...gameState.gameProgress.unlockedSpells, spell.id],
            },
          },
        });
      },

      updateSettings: (settings: Partial<GameSettings>) => {
        set({
          gameState: {
            ...get().gameState,
            settings: {
              ...get().gameState.settings,
              ...settings,
            },
          },
        });
      },

      addExperience: (amount: number) => {
        const { gameState } = get();
        const player = { ...gameState.player };
        
        player.experience += amount;
        
        // Check if level up is needed
        while (player.experience >= player.experienceToNextLevel) {
          player.experience -= player.experienceToNextLevel;
          player.level += 1;
          
          // Calculate new experience required for next level
          player.experienceToNextLevel = player.level * 100;
          
          // Award level up points based on difficulty
          const difficultyMultiplier = {
            easy: 1,
            normal: 2,
            hard: 5,
          }[gameState.settings.difficulty];
          
          player.levelUpPoints += difficultyMultiplier;
        }
        
        set({
          gameState: {
            ...gameState,
            player,
          },
        });
      },

      spendLevelUpPoints: (stat: 'health' | 'mana' | 'manaRegen', amount: number) => {
        const { gameState } = get();
        const player = { ...gameState.player };
        
        // Check if player has enough points
        const cost = stat === 'manaRegen' ? amount * 10 : amount;
        
        if (player.levelUpPoints < cost) {
          return false;
        }
        
        // Apply the stat increase
        switch (stat) {
          case 'health':
            player.maxHealth += amount;
            player.health = player.maxHealth; // Heal to full when max health increases
            break;
          case 'mana':
            player.maxMana += amount;
            player.mana = player.maxMana; // Restore to full when max mana increases
            break;
          case 'manaRegen':
            player.manaRegen += amount;
            break;
        }
        
        player.levelUpPoints -= cost;
        
        set({
          gameState: {
            ...gameState,
            player,
          },
        });
        
        return true;
      },

      setCurrentLocation: (location: 'wizardStudy' | 'duel' | 'levelUp') => {
        set({
          gameState: {
            ...get().gameState,
            gameProgress: {
              ...get().gameState.gameProgress,
              currentLocation: location,
            },
          },
        });
        
        // Auto-save when returning to Wizard's Study
        if (location === 'wizardStudy') {
          get().saveGame();
        }
      },

      resetState: () => {
        // Reset to initial state
        set({ gameState: initialGameState });
      },
    }),
    {
      name: 'wizards-choice-storage',
    }
  )
);
