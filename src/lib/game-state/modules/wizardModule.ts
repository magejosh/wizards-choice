// src/lib/game-state/modules/wizardModule.ts
// Wizard-related state management

import { Wizard } from '../../types/wizard-types';
import { Spell, SpellScroll } from '../../types/spell-types';
import { Equipment, Potion } from '../../types/equipment-types';
import { calculateExperienceForLevel, calculateWizardStats } from '../../wizard/wizardUtils';
import { updateWizard as updateWizardInSaveSlot, updateGameProgress, getWizard, dedupeAndMergePotions } from '../gameStateStore';

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
  unequipItem: (slot: string, isSecondFinger?: boolean) => void;
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
  equipSpellScroll: (scroll: Equipment) => void;
  unequipSpellScroll: (scrollId: string) => void;
  unequipAllSpellScrolls: () => void;
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
    const player = get().gameState.player;
    if (!player) return;

    // Ensure all equipment slots exist
    const defaultSlots = ['head', 'hand', 'body', 'neck', 'belt', 'finger1', 'finger2'];
    const equipment = { ...player.equipment };
    for (const slot of defaultSlots) {
      if (!(slot in equipment)) equipment[slot] = undefined;
    }
    let inventory = player.inventory ? [...player.inventory] : [];
    let equippedPotions = player.equippedPotions ? [...player.equippedPotions] : [];
    let equippedSpellScrolls = player.equippedSpellScrolls ? [...player.equippedSpellScrolls] : [];

    if (item.slot === 'finger') {
      if (!equipment.finger1) {
        equipment.finger1 = { ...item, equipped: true };
      } else if (!equipment.finger2) {
        equipment.finger2 = { ...item, equipped: true };
      } else {
        const oldRing = equipment.finger1;
        if (oldRing) {
          inventory.push({ ...oldRing, equipped: false });
        }
        equipment.finger1 = { ...item, equipped: true };
      }
      inventory = inventory.filter((i: Equipment) => i.id !== item.id);
    } else {
      // Map slot to correct key
      const slotKey = item.slot;
      const oldItem = equipment[slotKey];
      // Special handling for robes (body) and belts
      if (slotKey === 'body' && oldItem) {
        // Unequip all spell scrolls before replacing robe
        if (player.equippedSpellScrolls && player.equippedSpellScrolls.length > 0) {
          inventory.push(...player.equippedSpellScrolls.map(s => ({ ...s, equipped: false })));
          equippedSpellScrolls = [];
        }
      }
      if (slotKey === 'belt' && oldItem) {
        // Unequip all potions before replacing belt
        if (player.equippedPotions && player.equippedPotions.length > 0) {
          inventory.push(...player.equippedPotions);
          equippedPotions = [];
          // Deduplicate and merge potions in inventory after unequipping belt
          inventory = dedupeAndMergePotions(inventory);
        }
      }
      if (oldItem) {
        inventory.push({ ...oldItem, equipped: false });
      }
      equipment[slotKey] = { ...item, equipped: true };
      inventory = inventory.filter((i: Equipment) => i.id !== item.id);
    }

    // Recalculate stats after equipment change
    const updatedPlayer = calculateWizardStats({
      ...player,
      equipment,
      inventory,
      equippedPotions,
      equippedSpellScrolls
    });

    updateWizardInSaveSlot(() => updatedPlayer);
  },

  unequipItem: (slot, isSecondFinger = false) => {
    const player = get().gameState.player;
    if (!player) return;

    // Ensure all equipment slots exist
    const defaultSlots = ['head', 'hand', 'body', 'neck', 'belt', 'finger1', 'finger2'];
    const equipment = { ...player.equipment };
    for (const s of defaultSlots) {
      if (!(s in equipment)) equipment[s] = undefined;
    }
    let item: Equipment | undefined;
    if (slot === 'finger') {
      if (isSecondFinger) {
        item = equipment.finger2;
        if (item) equipment.finger2 = undefined;
      } else {
        item = equipment.finger1;
        if (item) equipment.finger1 = undefined;
      }
    } else {
      item = equipment[slot];
      if (item) equipment[slot] = undefined;
    }
    if (!item) return;

    let inventory = player.inventory ? [...player.inventory] : [];
    inventory.push({ ...item, equipped: false });

    // Recalculate stats after equipment change
    const updatedPlayer = calculateWizardStats({
      ...player,
      equipment,
      inventory
    });

    updateWizardInSaveSlot(() => updatedPlayer);

    if (slot === 'body') {
      get().unequipAllSpellScrolls();
    }
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

      // Apply stat increase using new stat structure
      // - progressionMaxHealth: permanent upgrades from level-ups, quests, etc.
      // - progressionMaxMana: permanent upgrades from level-ups, quests, etc.
      // Deprecated: maxHealth/maxMana are set by calculateWizardStats for compatibility
      switch (stat) {
        case 'health':
          updatedPlayer.progressionMaxHealth = (updatedPlayer.progressionMaxHealth || 0) + amount * 10;
          break;
        case 'mana':
          updatedPlayer.progressionMaxMana = (updatedPlayer.progressionMaxMana || 0) + amount * 5;
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
    set((state: any) => {
      const updatedPlayer = calculateWizardStats({
        ...state.gameState.player,
        equipment
      });
      return {
        gameState: {
          ...state.gameState,
          player: updatedPlayer
        }
      };
    });
  },

  updatePlayerInventory: (inventory) => {
    set((state: any) => {
      const updatedPlayer = calculateWizardStats({
        ...state.gameState.player,
        inventory
      });
      return {
        gameState: {
          ...state.gameState,
          player: updatedPlayer
        }
      };
    });
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
    updateWizardInSaveSlot(player => ({
      ...player,
      inventory: player.inventory ? player.inventory.filter((item: Equipment) => item.id !== itemId) : []
    }));
  },

  updatePlayerPotions: (potions) => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        player: {
          ...state.gameState.player,
          potions: dedupeAndMergePotions(potions)
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
          equippedPotions: dedupeAndMergePotions(equippedPotions)
        }
      }
    }));
  },

  addPotionToInventory: (potion) => {
    set((state: any) => {
      const potions = state.gameState.player.potions || [];
      const merged = dedupeAndMergePotions([...potions, potion]);
      return {
        gameState: {
          ...state.gameState,
          player: {
            ...state.gameState.player,
            potions: merged
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
      const potions = state.gameState.player.potions || [];
      const maxPotionSlots = state.gameState.player.combatStats?.potionSlots || 2;

      // Check if already at max capacity
      if (equippedPotions.length >= maxPotionSlots) {
        // Can't equip more potions
        return state;
      }

      // Remove one from stack by name/type/rarity
      let found = false;
      const newPotions = potions.map(p => {
        if (!found && p.name === potion.name && p.type === potion.type && p.rarity === potion.rarity) {
          found = true;
          const qty = p.quantity || 1;
          if (qty > 1) {
            return { ...p, quantity: qty - 1 };
          }
          // else, don't return (removes from inventory)
          return null;
        }
        return p;
      }).filter(Boolean);
      const mergedEquipped = dedupeAndMergePotions([...equippedPotions, { ...potion, quantity: 1 }]);
      const mergedPotions = dedupeAndMergePotions(newPotions);
      return {
        gameState: {
          ...state.gameState,
          player: {
            ...state.gameState.player,
            equippedPotions: mergedEquipped,
            potions: mergedPotions
          }
        }
      };
    });
  },

  unequipPotion: (potionId) => {
    set((state: any) => {
      const equippedPotions = state.gameState.player.equippedPotions || [];
      const potions = state.gameState.player.potions || [];
      const potionToUnequip = equippedPotions.find((p: Potion) => p.id === potionId);
      if (!potionToUnequip) return state;
      const newEquipped = equippedPotions.filter((p: Potion) => p.id !== potionId);
      // Merge with stack if exists
      let merged = false;
      const newPotions = potions.map(p => {
        if (!merged && p.name === potionToUnequip.name && p.type === potionToUnequip.type && p.rarity === potionToUnequip.rarity) {
          merged = true;
          return { ...p, quantity: (p.quantity || 1) + 1 };
        }
        return p;
      });
      if (!merged) newPotions.push({ ...potionToUnequip, quantity: 1 });
      const mergedEquipped = dedupeAndMergePotions(newEquipped);
      const mergedPotions = dedupeAndMergePotions(newPotions);
      return {
        gameState: {
          ...state.gameState,
          player: {
            ...state.gameState.player,
            equippedPotions: mergedEquipped,
            potions: mergedPotions
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
  },

  equipSpellScroll: (scroll: Equipment) => {
    const player = getWizard();
    if (!player) return;
    // Only allow if a robe is equipped
    const robe = player.equipment.body;
    if (!robe) return;
    // Determine slot limit (default 0 if not found)
    const slotBonus = robe.bonuses.find(b => b.stat === 'scrollSlots');
    const maxScrollSlots = slotBonus ? slotBonus.value : 0;
    if (player.equippedSpellScrolls.length >= maxScrollSlots) return;
    // Remove one from stack by name/rarity/spell
    let found = false;
    const newInventory = (player.inventory || []).map(i => {
      if (!found && i.type === 'scroll' && i.spell?.name === scroll.spell?.name && i.rarity === scroll.rarity) {
        found = true;
        const qty = i.quantity || 1;
        if (qty > 1) {
          return { ...i, quantity: qty - 1 };
        }
        // else, don't return (removes from inventory)
        return null;
      }
      return i;
    }).filter(Boolean);
    // Add scroll to equippedSpellScrolls
    const newEquipped = [...player.equippedSpellScrolls, { ...scroll, quantity: 1 }];
    updateWizardInSaveSlot(player => ({
      ...player,
      equippedSpellScrolls: newEquipped,
      inventory: newInventory
    }));
  },

  unequipSpellScroll: (scrollId: string) => {
    const player = getWizard();
    if (!player) return;
    const scrollToUnequip = player.equippedSpellScrolls.find(s => s.id === scrollId);
    if (!scrollToUnequip) return;
    const newEquipped = player.equippedSpellScrolls.filter(s => s.id !== scrollId);
    // Merge with stack if exists
    let merged = false;
    const newInventory = (player.inventory || []).map(s => {
      if (!merged && s.type === 'scroll' && s.spell?.name === scrollToUnequip.spell?.name && s.rarity === scrollToUnequip.rarity) {
        merged = true;
        return { ...s, quantity: (s.quantity || 1) + 1 };
      }
      return s;
    });
    if (!merged) newInventory.push({ ...scrollToUnequip, quantity: 1 });
    updateWizardInSaveSlot(player => ({
      ...player,
      equippedSpellScrolls: newEquipped,
      inventory: newInventory
    }));
  },

  unequipAllSpellScrolls: () => {
    const player = getWizard();
    if (!player) return;
    if (!player.equippedSpellScrolls.length) return;
    const newInventory = [...(player.inventory || []), ...player.equippedSpellScrolls];
    updateWizardInSaveSlot(player => ({
      ...player,
      equippedSpellScrolls: [],
      inventory: newInventory
    }));
  }
});