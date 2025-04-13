// src/lib/game-state/modules/wizardModule.ts
// Wizard-related state management

import { Wizard } from '../../types/wizard-types';
import { Spell, SpellScroll } from '../../types/spell-types';
import { Equipment, Potion } from '../../types/equipment-types';
import { calculateExperienceForLevel } from '../../wizard/wizardUtils';
import { updateWizard as updateWizardInSaveSlot, updateGameProgress, getWizard } from '../gameStateStore';

// Define the slice of state this module manages
export interface WizardState {
  wizard: Wizard;
}

// Define the actions this module provides
export interface WizardActions {
  updateWizard: (wizard: Wizard) => void;
  equipSpell: (spellId: string, index: number) => void;
  unequipSpell: (index: number) => void;
  equipItem: (item: Equipment) => void;
  unequipItem: (slot: string) => void;
  addSpell: (spell: Spell) => void;
  addExperience: (amount: number) => void;
  spendLevelUpPoints: (stat: 'health' | 'mana' | 'manaRegen', amount: number) => boolean;
  updatePlayerEquipment: (equipment: Wizard['equipment']) => void;
  updatePlayerInventory: (inventory: Equipment[]) => void;
  addItemToInventory: (item: Equipment) => void;
  removeItemFromInventory: (itemId: string) => void;
  updatePlayerPotions: (potions: Potion[]) => void;
  updatePlayerEquippedPotions: (equippedPotions: Potion[]) => void;
  addPotionToInventory: (potion: Potion) => void;
  removePotionFromInventory: (potionId: string) => void;
  equipPotion: (potion: Potion) => void;
  unequipPotion: (potionId: string) => void;
  getPlayerScrolls: () => SpellScroll[];
  consumeScrollToLearnSpell: (scrollId: string) => { success: boolean; message: string; learnedSpell?: Spell };
  checkIfScrollSpellKnown: (scrollId: string) => boolean;
  getPlayerGold: () => number;
  updatePlayerGold: (amount: number) => void;
  addGold: (amount: number) => void;
  removeGold: (amount: number) => boolean;
}

// Create the module
export const createWizardModule = (set: Function, get: Function): WizardActions => ({
  updateWizard: (wizard) => {
    // Use the updateWizard function from gameStateStore
    // This will update both the save slot and top-level player data
    if (typeof wizard === 'function') {
      updateWizardInSaveSlot(wizard);
    } else {
      updateWizardInSaveSlot(() => wizard);
    }
  },

  equipSpell: (spellId, index) => {
    // Get the current player data
    const player = get().gameState.player;
    if (!player) return;

    // Find the spell in the player's spells
    const spell = player.spells.find(s => s.id === spellId);
    if (!spell) return;

    // Create a copy of equipped spells
    const equippedSpells = [...player.equippedSpells];

    // Replace the spell at the specified index
    equippedSpells[index] = spell;

    // Update the player data in the save slot and top-level state
    updateWizardInSaveSlot(player => ({
      ...player,
      equippedSpells
    }));
  },

  unequipSpell: (index) => {
    // Get the current player data
    const player = get().gameState.player;
    if (!player) return;

    // Create a copy of equipped spells
    const equippedSpells = [...player.equippedSpells];

    // Remove the spell at the specified index
    equippedSpells[index] = null;

    // Update the player data in the save slot and top-level state
    updateWizardInSaveSlot(player => ({
      ...player,
      equippedSpells
    }));
  },

  equipItem: (item) => {
    // Get the current player data
    const player = get().gameState.player;
    if (!player) return;

    // Create a copy of equipment
    const equipment = { ...player.equipment };
    equipment[item.slot] = item;

    // Mark the item as equipped
    const equippedItem = { ...item, equipped: true };

    // Update inventory to reflect equipped status
    const inventory = player.inventory ?
      player.inventory.map((i: Equipment) =>
        i.id === item.id ? { ...i, equipped: true } : i
      ) : [];

    // Update the player data in the save slot and top-level state
    updateWizardInSaveSlot(player => ({
      ...player,
      equipment,
      inventory
    }));
  },

  unequipItem: (slot) => {
    // Get the current player data
    const player = get().gameState.player;
    if (!player) return;

    // Create a copy of equipment
    const equipment = { ...player.equipment };
    const item = equipment[slot];

    if (!item) return;

    // Mark the item as unequipped
    const unequippedItem = { ...item, equipped: false };
    equipment[slot] = undefined;

    // Update inventory to reflect unequipped status
    const inventory = player.inventory ?
      player.inventory.map((i: Equipment) =>
        i.id === item.id ? { ...i, equipped: false } : i
      ) : [];

    // Update the player data in the save slot and top-level state
    updateWizardInSaveSlot(player => ({
      ...player,
      equipment,
      inventory
    }));
  },

  addSpell: (spell) => {
    // Get the current player data
    const player = get().gameState.player;
    if (!player) return;

    // Update the player data in the save slot and top-level state
    updateWizardInSaveSlot(player => ({
      ...player,
      spells: [...player.spells, spell]
    }));

    // Update the game progress data
    updateGameProgress(gameProgress => {
      if (!gameProgress) return gameProgress;

      // Add the spell ID to unlockedSpells
      const unlockedSpells = [
        ...gameProgress.unlockedSpells,
        spell.id
      ];

      // Return the updated game progress
      return {
        ...gameProgress,
        unlockedSpells
      };
    });
  },

  addExperience: (amount) => {
    // Get the current player data
    const player = get().gameState.player;
    if (!player) return;

    // Calculate the new player data
    const currentExperience = player.experience;
    const experienceToNextLevel = player.experienceToNextLevel;

    // Create a new player object with updated experience
    const updatedPlayer = { ...player };
    updatedPlayer.experience += amount;

    // Check for level up
    if (updatedPlayer.experience >= experienceToNextLevel) {
      updatedPlayer.level += 1;
      updatedPlayer.levelUpPoints += 3; // Award level up points
      updatedPlayer.experience -= experienceToNextLevel;
      // Use calculateExperienceForLevel instead of 1.2x multiplier
      updatedPlayer.experienceToNextLevel = calculateExperienceForLevel(updatedPlayer.level);
    }

    // Update the player data in the save slot and top-level state
    updateWizardInSaveSlot(() => updatedPlayer);

    // Update the game progress data
    updateGameProgress(gameProgress => {
      if (!gameProgress) return gameProgress;

      // Create a new playerStats object with updated experience
      const updatedPlayerStats = {
        ...gameProgress.playerStats,
        totalExperienceGained: (gameProgress.playerStats?.totalExperienceGained || 0) + amount
      };

      // Return the updated game progress
      return {
        ...gameProgress,
        playerStats: updatedPlayerStats
      };
    });
  },

  spendLevelUpPoints: (stat, amount) => {
    const state = get().gameState;
    const player = state.player;

    // Check if player has enough points
    if (player.levelUpPoints < amount) {
      return false;
    }

    set((state: any) => {
      const updatedPlayer = { ...state.gameState.player };

      // Deduct points
      updatedPlayer.levelUpPoints -= amount;

      // Apply stat increase
      switch (stat) {
        case 'health':
          updatedPlayer.maxHealth += amount * 10;
          updatedPlayer.health = updatedPlayer.maxHealth; // Fully heal on level up
          break;
        case 'mana':
          updatedPlayer.maxMana += amount * 5;
          updatedPlayer.mana = updatedPlayer.maxMana; // Fully restore mana on level up
          break;
        case 'manaRegen':
          updatedPlayer.manaRegen += amount;
          break;
      }

      // Update player stats
      const playerStats = {
        ...state.gameState.gameProgress.playerStats,
        skillPointsSpent: state.gameState.gameProgress.playerStats.skillPointsSpent + amount,
        levelsGained: state.gameState.gameProgress.playerStats.levelsGained + 1
      };

      return {
        gameState: {
          ...state.gameState,
          player: updatedPlayer,
          gameProgress: {
            ...state.gameState.gameProgress,
            playerStats
          }
        }
      };
    });

    return true;
  },

  updatePlayerEquipment: (equipment) => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        player: {
          ...state.gameState.player,
          equipment
        }
      }
    }));
  },

  updatePlayerInventory: (inventory) => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        player: {
          ...state.gameState.player,
          inventory
        }
      }
    }));
  },

  addItemToInventory: (item) => {
    set((state: any) => {
      const inventory = state.gameState.player.inventory || [];

      return {
        gameState: {
          ...state.gameState,
          player: {
            ...state.gameState.player,
            inventory: [...inventory, item]
          }
        }
      };
    });
  },

  removeItemFromInventory: (itemId) => {
    set((state: any) => {
      const inventory = state.gameState.player.inventory || [];
      const filteredInventory = inventory.filter((item: Equipment) => item.id !== itemId);

      return {
        gameState: {
          ...state.gameState,
          player: {
            ...state.gameState.player,
            inventory: filteredInventory
          }
        }
      };
    });
  },

  updatePlayerPotions: (potions) => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        player: {
          ...state.gameState.player,
          potions
        }
      }
    }));
  },

  updatePlayerEquippedPotions: (equippedPotions) => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        player: {
          ...state.gameState.player,
          equippedPotions
        }
      }
    }));
  },

  addPotionToInventory: (potion) => {
    set((state: any) => {
      const potions = state.gameState.player.potions || [];

      return {
        gameState: {
          ...state.gameState,
          player: {
            ...state.gameState.player,
            potions: [...potions, potion]
          }
        }
      };
    });
  },

  removePotionFromInventory: (potionId) => {
    set((state: any) => {
      const potions = state.gameState.player.potions || [];
      const filteredPotions = potions.filter((potion: Potion) => potion.id !== potionId);

      return {
        gameState: {
          ...state.gameState,
          player: {
            ...state.gameState.player,
            potions: filteredPotions
          }
        }
      };
    });
  },

  equipPotion: (potion) => {
    set((state: any) => {
      const equippedPotions = state.gameState.player.equippedPotions || [];
      const maxPotionSlots = state.gameState.player.combatStats?.potionSlots || 2;

      // Check if already at max capacity
      if (equippedPotions.length >= maxPotionSlots) {
        // Can't equip more potions
        return state;
      }

      return {
        gameState: {
          ...state.gameState,
          player: {
            ...state.gameState.player,
            equippedPotions: [...equippedPotions, potion]
          }
        }
      };
    });
  },

  unequipPotion: (potionId) => {
    set((state: any) => {
      const equippedPotions = state.gameState.player.equippedPotions || [];
      const filteredPotions = equippedPotions.filter((potion: Potion) => potion.id !== potionId);

      return {
        gameState: {
          ...state.gameState,
          player: {
            ...state.gameState.player,
            equippedPotions: filteredPotions
          }
        }
      };
    });
  },

  // Get player scrolls
  getPlayerScrolls: () => {
    const player = getWizard();
    if (!player?.inventory) return [];

    // Filter inventory for items of type "scroll"
    return player.inventory.filter(
      (item: Equipment) => item.type === 'scroll'
    ).map(item => ({
      id: item.id,
      name: item.name,
      type: 'scroll',
      rarity: item.rarity,
      spell: item.spell as Spell,
      description: item.description,
      imagePath: item.imagePath
    })) as SpellScroll[];
  },

  // Check if the player already knows the spell from a scroll
  checkIfScrollSpellKnown: (scrollId: string) => {
    const player = getWizard();
    if (!player?.inventory) return false;

    const scrollItem = player.inventory.find(
      (item: Equipment) => item.id === scrollId && item.type === 'scroll'
    );

    if (!scrollItem || !scrollItem.spell) return false;

    // Check if the spell is already known
    return player.spells.some(spell => spell.id === scrollItem.spell?.id);
  },

  // Consume a scroll to learn its spell
  consumeScrollToLearnSpell: (scrollId: string) => {
    const player = getWizard();
    if (!player?.inventory) {
      return {
        success: false,
        message: "You have no items in your inventory."
      };
    }

    const scrollItem = player.inventory.find(
      (item: Equipment) => item.id === scrollId && item.type === 'scroll'
    );

    if (!scrollItem || !scrollItem.spell) {
      return {
        success: false,
        message: "Scroll not found in inventory or no spell attached."
      };
    }

    // Check if the spell is already known
    const isAlreadyKnown = player.spells.some(spell => spell.id === scrollItem.spell?.id);
    if (isAlreadyKnown) {
      return {
        success: false,
        message: "You already know this spell."
      };
    }

    // Get the spell from the scroll
    const spellToLearn = scrollItem.spell;

    // Remove the scroll from inventory
    get().removeItemFromInventory(scrollId);

    // Add the spell to the player's spells
    get().addSpell(spellToLearn);

    return {
      success: true,
      message: `You learned the spell: ${spellToLearn.name}!`,
      learnedSpell: spellToLearn
    };
  },

  // Get player's gold
  getPlayerGold: () => {
    const player = getWizard();
    return player?.gold || 0;
  },

  // Update player's gold to a specific amount
  updatePlayerGold: (amount) => {
    // Update the player data in the save slot and top-level state
    updateWizardInSaveSlot(player => ({
      ...player,
      gold: amount
    }));
  },

  // Add gold to player
  addGold: (amount) => {
    // Get the current player data
    const player = getWizard();
    if (!player) return;

    const currentGold = player.gold || 0;

    // Update the player data in the save slot and top-level state
    updateWizardInSaveSlot(player => ({
      ...player,
      gold: currentGold + amount
    }));

    // Update the game progress data
    updateGameProgress(gameProgress => {
      if (!gameProgress) return gameProgress;

      // Create a new playerStats object with updated gold earned
      const updatedPlayerStats = {
        ...gameProgress.playerStats,
        goldEarned: (gameProgress.playerStats?.goldEarned || 0) + amount
      };

      // Return the updated game progress
      return {
        ...gameProgress,
        playerStats: updatedPlayerStats
      };
    });
  },

  // Remove gold from player
  removeGold: (amount) => {
    // Get the current player data
    const player = getWizard();
    if (!player) return false;

    const currentGold = player.gold || 0;

    // Check if player has enough gold
    if (currentGold < amount) {
      return false;
    }

    // Update the player data in the save slot and top-level state
    updateWizardInSaveSlot(player => ({
      ...player,
      gold: currentGold - amount
    }));

    // Update the game progress data
    updateGameProgress(gameProgress => {
      if (!gameProgress) return gameProgress;

      // Create a new playerStats object with updated gold spent
      const updatedPlayerStats = {
        ...gameProgress.playerStats,
        goldSpent: (gameProgress.playerStats?.goldSpent || 0) + amount
      };

      // Return the updated game progress
      return {
        ...gameProgress,
        playerStats: updatedPlayerStats
      };
    });

    return true;
  }
});