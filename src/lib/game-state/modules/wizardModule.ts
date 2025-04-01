// src/lib/game-state/modules/wizardModule.ts
// Wizard-related state management

import { Wizard } from '../../types/wizard-types';
import { Spell, SpellScroll } from '../../types/spell-types';
import { Equipment, Potion } from '../../types/equipment-types';

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
}

// Create the module
export const createWizardModule = (set: Function, get: Function): WizardActions => ({
  updateWizard: (wizard) => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        player: {
          ...wizard
        }
      }
    }));
  },

  equipSpell: (spellId, index) => {
    const state = get().gameState;
    const spells = [...state.player.spells];
    const spell = spells.find(s => s.id === spellId);
    
    if (!spell) return;
    
    // Create a copy of equipped spells
    const equippedSpells = [...state.player.equippedSpells];
    
    // Replace the spell at the specified index
    equippedSpells[index] = spell;
    
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        player: {
          ...state.gameState.player,
          equippedSpells
        }
      }
    }));
  },

  unequipSpell: (index) => {
    set((state: any) => {
      const equippedSpells = [...state.gameState.player.equippedSpells];
      equippedSpells[index] = null;
      
      return {
        gameState: {
          ...state.gameState,
          player: {
            ...state.gameState.player,
            equippedSpells
          }
        }
      };
    });
  },

  equipItem: (item) => {
    set((state: any) => {
      const equipment = { ...state.gameState.player.equipment };
      equipment[item.slot] = item;
      item.equipped = true;
      
      // Update inventory to reflect equipped status
      const inventory = state.gameState.player.inventory ? 
        state.gameState.player.inventory.map((i: Equipment) => 
          i.id === item.id ? { ...i, equipped: true } : i
        ) : [];
      
      return {
        gameState: {
          ...state.gameState,
          player: {
            ...state.gameState.player,
            equipment,
            inventory
          }
        }
      };
    });
  },

  unequipItem: (slot) => {
    set((state: any) => {
      const equipment = { ...state.gameState.player.equipment };
      const item = equipment[slot];
      
      if (item) {
        item.equipped = false;
        equipment[slot] = undefined;
        
        // Update inventory to reflect unequipped status
        const inventory = state.gameState.player.inventory ? 
          state.gameState.player.inventory.map((i: Equipment) => 
            i.id === item.id ? { ...i, equipped: false } : i
          ) : [];
        
        return {
          gameState: {
            ...state.gameState,
            player: {
              ...state.gameState.player,
              equipment,
              inventory
            }
          }
        };
      }
      
      return state;
    });
  },

  addSpell: (spell) => {
    set((state: any) => {
      const spells = [...state.gameState.player.spells, spell];
      
      // Update gameProgress unlockedSpells
      const unlockedSpells = [
        ...state.gameState.gameProgress.unlockedSpells,
        spell.id
      ];
      
      return {
        gameState: {
          ...state.gameState,
          player: {
            ...state.gameState.player,
            spells
          },
          gameProgress: {
            ...state.gameState.gameProgress,
            unlockedSpells
          }
        }
      };
    });
  },

  addExperience: (amount) => {
    set((state: any) => {
      const player = { ...state.gameState.player };
      const currentExperience = player.experience;
      const experienceToNextLevel = player.experienceToNextLevel;
      
      // Add experience
      player.experience += amount;
      
      // Check for level up
      if (player.experience >= experienceToNextLevel) {
        player.level += 1;
        player.levelUpPoints += 3; // Award level up points
        player.experience -= experienceToNextLevel;
        player.experienceToNextLevel = Math.floor(experienceToNextLevel * 1.2); // Increase next level requirement
      }
      
      // Update player stats
      const playerStats = { 
        ...state.gameState.gameProgress.playerStats,
        totalExperienceGained: state.gameState.gameProgress.playerStats.totalExperienceGained + amount
      };
      
      return {
        gameState: {
          ...state.gameState,
          player,
          gameProgress: {
            ...state.gameState.gameProgress,
            playerStats
          }
        }
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
    const state = get().gameState;
    if (!state.player.inventory) return [];
    
    // Filter inventory for items of type "scroll"
    return state.player.inventory.filter(
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
    const state = get().gameState;
    if (!state.player.inventory) return false;
    
    const scrollItem = state.player.inventory.find(
      (item: Equipment) => item.id === scrollId && item.type === 'scroll'
    );
    
    if (!scrollItem || !scrollItem.spell) return false;
    
    // Check if the spell is already known
    return state.player.spells.some(spell => spell.id === scrollItem.spell?.id);
  },
  
  // Consume a scroll to learn its spell
  consumeScrollToLearnSpell: (scrollId: string) => {
    const state = get().gameState;
    if (!state.player.inventory) {
      return { 
        success: false, 
        message: "You have no items in your inventory." 
      };
    }
    
    const scrollItem = state.player.inventory.find(
      (item: Equipment) => item.id === scrollId && item.type === 'scroll'
    );
    
    if (!scrollItem || !scrollItem.spell) {
      return { 
        success: false, 
        message: "Scroll not found in inventory or no spell attached." 
      };
    }
    
    // Check if the spell is already known
    const isAlreadyKnown = state.player.spells.some(spell => spell.id === scrollItem.spell?.id);
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
  }
}); 