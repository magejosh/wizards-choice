// src/lib/game-state/gameStateStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  GameState, 
  Wizard, 
  Spell, 
  Equipment, 
  EquipmentSlot, 
  Potion, 
  GameSettings, 
  Ingredient, 
  PotionRecipe,
  MarketLocation,
  MarketData,
  MarketTransaction,
  MarketItem,
  SpellScroll
} from '../types';
import { generateDefaultWizard } from '../wizard/wizardUtils';
import { getDefaultSpells } from '../spells/spellData';
import { 
  initializeMarkets, 
  updateMarketPrices,
  refreshMarketInventory,
  shouldRefreshMarketInventory,
  createTransaction
} from '../features/market/marketSystem';
import { 
  shouldMarketAttackOccur,
  generateMarketAttacker,
  generateMarketAttackerLoot
} from '../features/market/marketAttacks';
import { 
  consumeScrollToLearnSpell,
  wizardKnowsScrollSpell
} from '../features/scrolls/scrollSystem';

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
  markets: initializeMarkets(),
  marketData: {
    gold: 100, // Starting gold
    transactions: [],
    reputationLevels: {},
    visitedMarkets: [],
    favoriteMarkets: []
  }
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
  setCurrentLocation: (location: 'wizardStudy' | 'duel' | 'levelUp' | 'market') => void;
  resetState: () => void;
  updateGameState: (partialState: Partial<GameState>) => void;
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
  
  // New functions for ingredients and recipes
  updatePlayerIngredients: (ingredients: Ingredient[]) => void;
  addIngredientToInventory: (ingredient: Ingredient) => void;
  removeIngredientFromInventory: (ingredientId: string) => void;
  updatePlayerRecipes: (recipes: PotionRecipe[]) => void;
  discoverRecipe: (recipeId: string) => void;
  experimentWithIngredients: (ingredientIds: string[]) => {
    success: boolean;
    message: string;
    discoveredRecipe?: PotionRecipe;
    potion?: Potion;
  };
  craftPotion: (recipeId: string) => {
    success: boolean;
    message: string;
    potion?: Potion;
  };
  
  // New functions for the market system
  getMarkets: () => MarketLocation[];
  getMarketById: (marketId: string) => MarketLocation | undefined;
  updateMarkets: (markets: MarketLocation[]) => void;
  updateMarket: (marketId: string, updatedMarket: MarketLocation) => void;
  getPlayerGold: () => number;
  updatePlayerGold: (amount: number) => void;
  addGold: (amount: number) => void;
  deductGold: (amount: number) => boolean;
  visitMarket: (marketId: string) => void;
  refreshMarket: (marketId: string) => void;
  getMarketItem: <T>(marketId: string, itemType: 'ingredient' | 'potion' | 'equipment' | 'scroll', itemId: string) => MarketItem<T> | undefined;
  buyItem: <T>(
    marketId: string, 
    itemType: 'ingredient' | 'potion' | 'equipment' | 'scroll', 
    itemId: string, 
    quantity: number
  ) => {
    success: boolean;
    message: string;
    transaction?: MarketTransaction;
  };
  sellItem: <T>(
    marketId: string,
    itemType: 'ingredient' | 'potion' | 'equipment' | 'scroll',
    itemId: string,
    quantity: number
  ) => {
    success: boolean;
    message: string;
    transaction?: MarketTransaction;
  };
  updateMarketReputations: (reputationLevels: Record<string, number>) => void;
  updateMarketReputation: (marketId: string, reputation: number) => void;
  
  // New functions for market attacks
  checkForMarketAttack: (marketId: string) => {
    attacked: boolean;
    attacker?: Wizard;
  };
  handleMarketAttackResult: (result: 'win' | 'lose', attacker: Wizard) => {
    message: string;
    rewards?: Ingredient[];
  };
  
  // Add new functions for spell scrolls
  getPlayerScrolls: () => SpellScroll[];
  addScrollToInventory: (scroll: SpellScroll) => void;
  removeScrollFromInventory: (scrollId: string) => void;
  consumeScrollToLearnSpell: (scrollId: string) => {
    success: boolean;
    message: string;
    learnedSpell?: Spell;
  };
  useScrollInBattle: (scrollId: string) => {
    success: boolean;
    message: string;
    spell?: Spell;
  };
  checkIfWizardKnowsSpell: (spellId: string) => boolean;
  checkIfScrollSpellKnown: (scrollId: string) => boolean;
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
        
        // Equip all default spells (player starts with the full deck equipped)
        defaultWizard.equippedSpells = defaultSpells;
        
        // Create a default deck
        const defaultDeck = {
          id: 'default-deck-' + Date.now(),
          name: 'Starter Deck',
          spells: defaultSpells, // Include all default spells in the deck
          dateCreated: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };
        
        // Add the default deck to the wizard
        defaultWizard.decks = [defaultDeck];
        defaultWizard.activeDeckId = defaultDeck.id;
        
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
        const inventory = [...(gameState.player.inventory || [])];
        
        // If there's already an item in this slot, add it to inventory
        const existingItem = equipment[item.slot];
        if (existingItem) {
          inventory.push(existingItem);
        }
        
        // Set the new item in the equipment slot
        equipment[item.slot] = item;
        
        // Remove the equipped item from inventory
        const updatedInventory = inventory.filter(i => i.id !== item.id);
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              equipment,
              inventory: updatedInventory
            },
          },
        });
      },

      unequipItem: (slot: string) => {
        const { gameState } = get();
        const equipment = { ...gameState.player.equipment };
        const inventory = [...(gameState.player.inventory || [])];
        
        // Add the unequipped item to inventory if it exists
        const itemToUnequip = equipment[slot as EquipmentSlot];
        if (itemToUnequip) {
          inventory.push(itemToUnequip);
        }
        
        // Remove from equipment
        delete equipment[slot as EquipmentSlot];
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              equipment,
              inventory
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

      setCurrentLocation: (location: 'wizardStudy' | 'duel' | 'levelUp' | 'market') => {
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

      updateGameState: (partialState: Partial<GameState>) => {
        set({
          gameState: {
            ...get().gameState,
            ...partialState,
          },
        });
      },

      updatePlayerEquipment: (equipment: Wizard['equipment']) => {
        set({
          gameState: {
            ...get().gameState,
            player: {
              ...get().gameState.player,
              equipment
            }
          }
        });
      },

      updatePlayerInventory: (inventory: Equipment[]) => {
        set({
          gameState: {
            ...get().gameState,
            player: {
              ...get().gameState.player,
              inventory
            }
          }
        });
      },

      addItemToInventory: (item: Equipment) => {
        const { gameState } = get();
        const inventory = [...(gameState.player.inventory || [])];
        
        // Check if the item already exists (by ID)
        if (inventory.some(i => i.id === item.id)) return;
        
        // Add the item to inventory
        inventory.push(item);
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              inventory
            },
          },
        });
      },
      
      removeItemFromInventory: (itemId: string) => {
        const { gameState } = get();
        const inventory = [...(gameState.player.inventory || [])];
        
        // Remove the item from inventory
        const updatedInventory = inventory.filter(i => i.id !== itemId);
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              inventory: updatedInventory
            },
          },
        });
      },

      updatePlayerPotions: (potions: Potion[]) => {
        set({
          gameState: {
            ...get().gameState,
            player: {
              ...get().gameState.player,
              potions
            }
          }
        });
      },

      updatePlayerEquippedPotions: (equippedPotions: Potion[]) => {
        set({
          gameState: {
            ...get().gameState,
            player: {
              ...get().gameState.player,
              equippedPotions
            }
          }
        });
      },

      addPotionToInventory: (potion: Potion) => {
        const { gameState } = get();
        const potions = [...(gameState.player.potions || [])];
        potions.push(potion);
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              potions
            }
          }
        });
      },

      removePotionFromInventory: (potionId: string) => {
        const { gameState } = get();
        const potions = gameState.player.potions.filter(
          potion => potion.id !== potionId
        );
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              potions
            }
          }
        });
      },

      equipPotion: (potion: Potion) => {
        const { gameState } = get();
        
        // Check if the player has a belt equipped
        if (!gameState.player.equipment.belt) return;
        
        // Get the maximum number of potion slots from belt
        const maxPotionSlots = gameState.player.combatStats?.potionSlots || 0;
        
        // Check if there's room on the belt
        if (gameState.player.equippedPotions.length >= maxPotionSlots) {
          return; // Belt is full
        }
        
        const equippedPotions = [...gameState.player.equippedPotions, potion];
        const potions = gameState.player.potions.filter(p => p.id !== potion.id);
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              equippedPotions,
              potions
            }
          }
        });
      },

      unequipPotion: (potionId: string) => {
        const { gameState } = get();
        const potion = gameState.player.equippedPotions.find(p => p.id === potionId);
        
        if (!potion) return;
        
        const equippedPotions = gameState.player.equippedPotions.filter(
          p => p.id !== potionId
        );
        
        const potions = [...gameState.player.potions, potion];
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              equippedPotions,
              potions
            }
          }
        });
      },

      updatePlayerIngredients: (ingredients: Ingredient[]) => {
        set({
          gameState: {
            ...get().gameState,
            player: {
              ...get().gameState.player,
              ingredients
            }
          }
        });
      },

      addIngredientToInventory: (ingredient: Ingredient) => {
        const { gameState } = get();
        const ingredients = [...(gameState.player.ingredients || [])];
        ingredients.push(ingredient);
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              ingredients
            }
          }
        });
      },

      removeIngredientFromInventory: (ingredientId: string) => {
        const { gameState } = get();
        const ingredients = gameState.player.ingredients.filter(
          ingredient => ingredient.id !== ingredientId
        );
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              ingredients
            }
          }
        });
      },

      updatePlayerRecipes: (recipes: PotionRecipe[]) => {
        set({
          gameState: {
            ...get().gameState,
            player: {
              ...get().gameState.player,
              discoveredRecipes: recipes
            }
          }
        });
      },

      discoverRecipe: (recipeId: string) => {
        const { gameState } = get();
        const { player } = gameState;
        
        // Import the discover function from potionCrafting
        const { discoverRecipe } = require('../features/potions/potionCrafting');
        
        // Use the implementation from the potionCrafting module
        const updatedWizard = discoverRecipe(player, recipeId);
        
        if (updatedWizard) {
          set({
            gameState: {
              ...gameState,
              player: updatedWizard,
              gameProgress: {
                ...gameState.gameProgress,
                discoveredRecipes: [...(gameState.gameProgress.discoveredRecipes || []), recipeId],
              },
            },
          });
        }
      },

      experimentWithIngredients: (ingredientIds: string[]) => {
        const { gameState } = get();
        const { player } = gameState;
        
        // Import the experiment function from potionCrafting
        const { experimentWithIngredients } = require('../features/potions/potionCrafting');
        
        // Use the implementation from the potionCrafting module
        const result = experimentWithIngredients(player, ingredientIds);
        
        // Update the game state with the modified player
        set({
          gameState: {
            ...gameState,
            player: result.wizard
          }
        });
        
        // Return just the result part
        return result.result;
      },

      craftPotion: (recipeId: string) => {
        const { gameState } = get();
        const { player } = gameState;
        
        // Import the craft function from potionCrafting
        const { craftPotion } = require('../features/potions/potionCrafting');
        
        // Use the implementation from the potionCrafting module
        const result = craftPotion(player, recipeId);
        
        // Update the game state with the modified player
        set({
          gameState: {
            ...gameState,
            player: result.wizard
          }
        });
        
        // Return just the result part
        return result.result;
      },

      // Market system functions
      getMarkets: () => {
        // Check if markets need inventory refresh
        const { gameState } = get();
        const updatedMarkets = gameState.markets.map(market => {
          // Update prices for all markets
          let updatedMarket = updateMarketPrices(market);
          
          // Check if inventory needs refreshing
          if (shouldRefreshMarketInventory(updatedMarket)) {
            updatedMarket = refreshMarketInventory(updatedMarket);
          }
          
          return updatedMarket;
        });
        
        // Update the markets in state if they changed
        if (JSON.stringify(updatedMarkets) !== JSON.stringify(gameState.markets)) {
          set({
            gameState: {
              ...gameState,
              markets: updatedMarkets
            }
          });
        }
        
        return updatedMarkets;
      },
      
      getMarketById: (marketId: string) => {
        const markets = get().getMarkets();
        return markets.find(market => market.id === marketId);
      },
      
      updateMarkets: (markets: MarketLocation[]) => {
        set({
          gameState: {
            ...get().gameState,
            markets
          }
        });
      },
      
      updateMarket: (marketId: string, updatedMarket: MarketLocation) => {
        const { gameState } = get();
        const markets = [...gameState.markets];
        const index = markets.findIndex(m => m.id === marketId);
        
        if (index !== -1) {
          markets[index] = updatedMarket;
          set({
            gameState: {
              ...gameState,
              markets
            }
          });
        }
      },
      
      getPlayerGold: () => {
        return get().gameState.marketData.gold;
      },
      
      updatePlayerGold: (amount: number) => {
        set({
          gameState: {
            ...get().gameState,
            marketData: {
              ...get().gameState.marketData,
              gold: amount
            }
          }
        });
      },
      
      addGold: (amount: number) => {
        const currentGold = get().getPlayerGold();
        get().updatePlayerGold(currentGold + amount);
      },
      
      deductGold: (amount: number) => {
        const currentGold = get().getPlayerGold();
        if (currentGold >= amount) {
          get().updatePlayerGold(currentGold - amount);
          return true;
        }
        return false;
      },
      
      visitMarket: (marketId: string) => {
        const { gameState } = get();
        const visitedMarkets = [...gameState.marketData.visitedMarkets];
        
        if (!visitedMarkets.includes(marketId)) {
          visitedMarkets.push(marketId);
          set({
            gameState: {
              ...gameState,
              marketData: {
                ...gameState.marketData,
                visitedMarkets
              }
            }
          });
        }
        
        // Set current location to market
        get().setCurrentLocation('market');
      },
      
      refreshMarket: (marketId: string) => {
        const { gameState } = get();
        const market = gameState.markets.find(m => m.id === marketId);
        
        if (market) {
          const refreshedMarket = refreshMarketInventory(market);
          get().updateMarket(marketId, refreshedMarket);
        }
      },
      
      getMarketItem: <T>(marketId: string, itemType: 'ingredient' | 'potion' | 'equipment' | 'scroll', itemId: string) => {
        const market = get().getMarketById(marketId);
        if (!market) return undefined;
        
        let items: MarketItem<any>[] = [];
        switch (itemType) {
          case 'ingredient':
            items = market.inventory.ingredients;
            break;
          case 'potion':
            items = market.inventory.potions;
            break;
          case 'equipment':
            items = market.inventory.equipment;
            break;
          case 'scroll':
            items = market.inventory.scrolls || [];
            break;
        }
        
        return items.find(item => item.item.id === itemId) as MarketItem<T> | undefined;
      },
      
      buyItem: <T>(marketId: string, itemType: 'ingredient' | 'potion' | 'equipment' | 'scroll', itemId: string, quantity: number) => {
        const { gameState } = get();
        const market = get().getMarketById(marketId);
        if (!market) {
          return { success: false, message: 'Market not found.' };
        }
        
        const marketItem = get().getMarketItem<T>(marketId, itemType, itemId);
        if (!marketItem) {
          return { success: false, message: 'Item not found in market.' };
        }
        
        // Check if there's enough quantity available
        if (marketItem.quantity < quantity) {
          return { success: false, message: `Only ${marketItem.quantity} available.` };
        }
        
        // Calculate total cost
        const totalCost = marketItem.currentPrice * quantity;
        
        // Check if player has enough gold
        if (gameState.marketData.gold < totalCost) {
          return { success: false, message: 'Not enough gold.' };
        }
        
        // Update player's gold
        const deductionSuccess = get().deductGold(totalCost);
        if (!deductionSuccess) {
          return { success: false, message: 'Failed to deduct gold.' };
        }
        
        // Update market item quantity
        const updatedMarket = { ...market };
        let updatedInventory = { ...updatedMarket.inventory };
        
        switch (itemType) {
          case 'ingredient':
            updatedInventory.ingredients = updatedInventory.ingredients.map(item => {
              if (item.item.id === itemId) {
                return { ...item, quantity: item.quantity - quantity };
              }
              return item;
            });
            break;
          case 'potion':
            updatedInventory.potions = updatedInventory.potions.map(item => {
              if (item.item.id === itemId) {
                return { ...item, quantity: item.quantity - quantity };
              }
              return item;
            });
            break;
          case 'equipment':
            updatedInventory.equipment = updatedInventory.equipment.map(item => {
              if (item.item.id === itemId) {
                return { ...item, quantity: item.quantity - quantity };
              }
              return item;
            });
            break;
          case 'scroll':
            if (updatedInventory.scrolls) {
              updatedInventory.scrolls = updatedInventory.scrolls.map(item => {
                if (item.item.id === itemId) {
                  return { ...item, quantity: item.quantity - quantity };
                }
                return item;
              });
            }
            break;
        }
        
        updatedMarket.inventory = updatedInventory;
        get().updateMarket(marketId, updatedMarket);
        
        // Add item to player's inventory
        const item = marketItem.item;
        for (let i = 0; i < quantity; i++) {
          switch (itemType) {
            case 'ingredient':
              get().addIngredientToInventory(item as unknown as Ingredient);
              break;
            case 'potion':
              get().addPotionToInventory(item as unknown as Potion);
              break;
            case 'equipment':
              get().addItemToInventory(item as unknown as Equipment);
              break;
            // case 'scroll' will be implemented later with the spell scroll system
          }
        }
        
        // Create and record transaction
        const transaction = createTransaction(
          marketId,
          itemId,
          (item as any).name,
          itemType,
          quantity,
          marketItem.currentPrice,
          'buy'
        );
        
        // Update player's transaction history
        const updatedTransactions = [...gameState.marketData.transactions, transaction];
        set({
          gameState: {
            ...gameState,
            marketData: {
              ...gameState.marketData,
              transactions: updatedTransactions
            }
          }
        });
        
        return { 
          success: true, 
          message: `Successfully purchased ${quantity} ${(item as any).name}.`,
          transaction
        };
      },
      
      sellItem: <T>(marketId: string, itemType: 'ingredient' | 'potion' | 'equipment' | 'scroll', itemId: string, quantity: number) => {
        const { gameState } = get();
        const market = get().getMarketById(marketId);
        if (!market) {
          return { success: false, message: 'Market not found.' };
        }
        
        // Check if player has the item in sufficient quantity
        let itemName = '';
        let sellPrice = 0;
        let hasItem = false;
        
        switch (itemType) {
          case 'ingredient':
            const ingredients = gameState.player.ingredients || [];
            const ingredientCount = ingredients.filter(i => i.id === itemId).length;
            if (ingredientCount < quantity) {
              return { success: false, message: `You only have ${ingredientCount} of this ingredient.` };
            }
            if (ingredientCount > 0) {
              itemName = ingredients.find(i => i.id === itemId)?.name || 'Unknown Ingredient';
              hasItem = true;
              // Sell for 70% of base price
              const ingredient = ingredients.find(i => i.id === itemId);
              if (ingredient) {
                const basePrice = {
                  common: 10,
                  uncommon: 25,
                  rare: 75,
                  epic: 200,
                  legendary: 500
                }[ingredient.rarity];
                sellPrice = Math.round(basePrice * 0.7);
              }
            }
            break;
          
          case 'potion':
            const potions = gameState.player.potions || [];
            const potionCount = potions.filter(p => p.id === itemId).length;
            if (potionCount < quantity) {
              return { success: false, message: `You only have ${potionCount} of this potion.` };
            }
            if (potionCount > 0) {
              itemName = potions.find(p => p.id === itemId)?.name || 'Unknown Potion';
              hasItem = true;
              // Sell for 60% of estimated value
              const potion = potions.find(p => p.id === itemId);
              if (potion) {
                const basePrice = {
                  common: 30,
                  uncommon: 75,
                  rare: 200,
                  epic: 500,
                  legendary: 1200
                }[potion.rarity];
                sellPrice = Math.round(basePrice * 0.6);
              }
            }
            break;
          
          case 'equipment':
            const equipment = gameState.player.inventory || [];
            const equipmentCount = equipment.filter(e => e.id === itemId).length;
            if (equipmentCount < quantity) {
              return { success: false, message: `You only have ${equipmentCount} of this equipment.` };
            }
            if (equipmentCount > 0) {
              itemName = equipment.find(e => e.id === itemId)?.name || 'Unknown Equipment';
              hasItem = true;
              // Sell for 50% of estimated value
              const equip = equipment.find(e => e.id === itemId);
              if (equip) {
                const rarityMultipliers = {
                  common: 1,
                  uncommon: 2.5,
                  rare: 6,
                  epic: 15,
                  legendary: 40
                };
                const basePrice = 50 * rarityMultipliers[equip.rarity];
                sellPrice = Math.round(basePrice * 0.5);
              }
            }
            break;
          
          // case 'scroll' will be implemented later with the spell scroll system
        }
        
        if (!hasItem) {
          return { success: false, message: 'Item not found in your inventory.' };
        }
        
        // Remove item from player's inventory
        for (let i = 0; i < quantity; i++) {
          switch (itemType) {
            case 'ingredient':
              get().removeIngredientFromInventory(itemId);
              break;
            case 'potion':
              get().removePotionFromInventory(itemId);
              break;
            case 'equipment':
              get().removeItemFromInventory(itemId);
              break;
            // case 'scroll' will be implemented later
          }
        }
        
        // Add gold to player
        const totalSalePrice = sellPrice * quantity;
        get().addGold(totalSalePrice);
        
        // Create and record transaction
        const transaction = createTransaction(
          marketId,
          itemId,
          itemName,
          itemType,
          quantity,
          sellPrice,
          'sell'
        );
        
        // Update player's transaction history
        const updatedTransactions = [...gameState.marketData.transactions, transaction];
        set({
          gameState: {
            ...gameState,
            marketData: {
              ...gameState.marketData,
              transactions: updatedTransactions
            }
          }
        });
        
        return { 
          success: true, 
          message: `Successfully sold ${quantity} ${itemName} for ${totalSalePrice} gold.`,
          transaction
        };
      },
      
      updateMarketReputations: (reputationLevels: Record<string, number>) => {
        set({
          gameState: {
            ...get().gameState,
            marketData: {
              ...get().gameState.marketData,
              reputationLevels
            }
          }
        });
      },
      
      updateMarketReputation: (marketId: string, reputation: number) => {
        const { gameState } = get();
        const reputationLevels = {
          ...gameState.marketData.reputationLevels,
          [marketId]: reputation
        };
        
        set({
          gameState: {
            ...gameState,
            marketData: {
              ...gameState.marketData,
              reputationLevels
            }
          }
        });
      },
      
      // New functions for market attacks
      checkForMarketAttack: (marketId: string) => {
        const { gameState } = get();
        const market = gameState.markets.find(m => m.id === marketId);
        
        if (!market) return { attacked: false };
        
        const playerLevel = gameState.player.level;
        const marketLevel = market.unlockLevel;
        const difficulty = gameState.settings.difficulty;
        
        // Check if an attack should occur
        if (shouldMarketAttackOccur(marketLevel, playerLevel, difficulty)) {
          // Generate an attacker if attack occurs
          const attacker = generateMarketAttacker(playerLevel, marketLevel, difficulty);
          return { attacked: true, attacker };
        }
        
        return { attacked: false };
      },
      
      handleMarketAttackResult: (result: 'win' | 'lose', attacker: Wizard) => {
        const { gameState } = get();
        
        if (result === 'win') {
          // Player defeated the attacker, generate rewards
          const rewards = generateMarketAttackerLoot(attacker.level);
          
          // Add rewards to player inventory
          set({
            gameState: {
              ...gameState,
              player: {
                ...gameState.player,
                ingredients: [
                  ...gameState.player.ingredients,
                  ...rewards
                ]
              }
            }
          });
          
          return {
            message: `You defeated the ${attacker.name} and recovered ${rewards.length} ingredients!`,
            rewards
          };
        } else {
          // Player was defeated by the attacker
          // Calculate gold loss (10-20% of current gold)
          const goldLossPercent = 0.1 + (Math.random() * 0.1);
          const goldLoss = Math.floor(gameState.marketData.gold * goldLossPercent);
          const remainingGold = Math.max(0, gameState.marketData.gold - goldLoss);
          
          // Update player gold
          set({
            gameState: {
              ...gameState,
              marketData: {
                ...gameState.marketData,
                gold: remainingGold
              }
            }
          });
          
          return {
            message: `You were defeated by the ${attacker.name} and lost ${goldLoss} gold!`
          };
        }
      },
      
      // Add new functions for spell scrolls
      getPlayerScrolls: () => {
        const { gameState } = get();
        const inventory = gameState.player.inventory || [];
        // Filter the inventory to get only spell scrolls
        return inventory.filter(item => 'spell' in item) as unknown as SpellScroll[];
      },
      
      /**
       * Add a spell scroll to the player's inventory
       * @param scroll The spell scroll to add
       */
      addScrollToInventory: (scroll: SpellScroll) => {
        const { gameState } = get();
        const inventory = gameState.player.inventory || [];
        const updatedInventory = [...inventory, scroll as unknown as Equipment];
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              inventory: updatedInventory
            }
          }
        });
      },
      
      /**
       * Remove a spell scroll from the player's inventory
       * @param scrollId The ID of the scroll to remove
       */
      removeScrollFromInventory: (scrollId: string) => {
        const { gameState } = get();
        const inventory = gameState.player.inventory || [];
        const updatedInventory = inventory.filter(item => item.id !== scrollId);
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              inventory: updatedInventory
            }
          }
        });
      },
      
      /**
       * Consume a spell scroll to learn its spell permanently
       * @param scrollId The ID of the scroll to consume
       * @returns Object containing success status and learned spell if successful
       */
      consumeScrollToLearnSpell: (scrollId: string) => {
        const { gameState } = get();
        const result = consumeScrollToLearnSpell(gameState.player, scrollId);
        
        if (result.success && result.updatedWizard) {
          set({
            gameState: {
              ...gameState,
              player: result.updatedWizard
            }
          });
        }
        
        return {
          success: result.success,
          message: result.message,
          learnedSpell: result.learnedSpell
        };
      },
      
      /**
       * Use a spell scroll in battle (removing it from inventory but not learning it)
       * Note: This doesn't actually cast the spell - battle system will need to implement that
       * This just provides the spell and removes the scroll
       * @param scrollId The ID of the scroll to use
       * @returns Object containing success status and spell if successful
       */
      useScrollInBattle: (scrollId: string) => {
        const { gameState } = get();
        const inventory = gameState.player.inventory || [];
        const scrollIndex = inventory.findIndex(item => item.id === scrollId);
        
        if (scrollIndex === -1) {
          return {
            success: false,
            message: "Scroll not found in inventory."
          };
        }
        
        // Get the scroll
        const scroll = inventory[scrollIndex] as unknown as SpellScroll;
        
        // Remove the scroll from inventory
        const updatedInventory = [...inventory];
        updatedInventory.splice(scrollIndex, 1);
        
        set({
          gameState: {
            ...gameState,
            player: {
              ...gameState.player,
              inventory: updatedInventory
            }
          }
        });
        
        return {
          success: true,
          message: `You've used a scroll of ${scroll.spell.name}!`,
          spell: scroll.spell
        };
      },

      /**
       * Check if the wizard already knows a specific spell
       * @param spellId The ID of the spell to check
       * @returns True if the wizard knows the spell, false otherwise
       */
      checkIfWizardKnowsSpell: (spellId: string) => {
        const { gameState } = get();
        return gameState.player.spells.some(spell => spell.id === spellId);
      },

      /**
       * Check if the wizard already knows the spell contained in a scroll
       * @param scrollId The ID of the scroll to check
       * @returns True if the wizard knows the spell, false otherwise
       */
      checkIfScrollSpellKnown: (scrollId: string) => {
        const { gameState } = get();
        const inventory = gameState.player.inventory || [];
        const scroll = inventory.find(item => item.id === scrollId) as unknown as SpellScroll;
        
        if (!scroll || !('spell' in scroll)) {
          return false;
        }
        
        return wizardKnowsScrollSpell(gameState.player, scroll);
      }
    }),
    {
      name: 'wizards-choice-state',
      
      // Filter out large or sensitive data from persistence
      partialize: (state) => {
        // We'll store everything for now, but in a real game you might
        // want to filter out certain runtime-only state
        return state;
      },
    }
  )
);
