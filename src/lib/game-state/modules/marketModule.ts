// src/lib/game-state/modules/marketModule.ts
// Market-related state management

import { MarketLocation, MarketData, MarketTransaction, MarketItem, MarketInventory } from '../../types/market-types';
import { Equipment, Ingredient, Potion } from '../../types/equipment-types';
import { SpellScroll, Spell } from '../../types/spell-types';
import { Wizard } from '../../types/wizard-types';
import { generateDefaultWizard } from '../../wizard/wizardUtils';
import { refreshMarketInventory as importedRefreshMarketInventory } from '../../features/market/marketSystem';
import { getWizard, updateWizard, updateGameProgress } from '../gameStateStore';

// Define the slice of state this module manages
export interface MarketState {
  markets: MarketLocation[];
  marketData: MarketData;
}

// Define the actions this module provides
export interface MarketActions {
  getMarkets: () => MarketLocation[];
  getMarketById: (marketId: string) => MarketLocation | undefined;
  updateMarkets: (markets: MarketLocation[]) => void;
  updateMarket: (marketId: string, updatedMarket: Partial<MarketLocation>) => void;
  getPlayerGold: () => number;
  updatePlayerGold: (amount: number) => void;
  addGold: (amount: number) => void;
  removeGold: (amount: number) => boolean;
  recordTransaction: (transaction: Omit<MarketTransaction, 'id' | 'date'>) => void;
  visitMarket: (marketId: string) => boolean;
  toggleFavoriteMarket: (marketId: string) => void;
  refreshMarketInventory: (marketId: string) => void;
  updateMarketPrices: (marketId: string) => void;
  buyItem: (marketId: string, itemType: 'ingredient' | 'potion' | 'equipment' | 'scroll', itemId: string, quantity: number) => { success: boolean; message: string };
  sellItem: (marketId: string, itemType: 'ingredient' | 'potion' | 'equipment' | 'scroll', itemId: string, quantity: number) => { success: boolean; message: string };
  checkForMarketAttack: (marketId: string) => { attacked: boolean; attacker: Wizard | null };
  handleMarketAttackResult: (result: 'win' | 'lose' | 'flee') => void;
}

// Helper function to generate IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Fix function name clash by renaming the imported function
const generateMarketInventory = importedRefreshMarketInventory;

// Create the module
export const createMarketModule = (set: Function, get: Function): MarketActions => ({
  getMarkets: () => {
    return get().gameState.markets;
  },

  getMarketById: (marketId) => {
    const markets = get().gameState.markets;
    return markets.find(market => market.id === marketId);
  },

  updateMarkets: (markets) => {
    set((state: any) => ({
      gameState: {
        ...state.gameState,
        markets
      }
    }));
  },

  updateMarket: (marketId, updatedMarket) => {
    set((state: any) => {
      const markets = [...state.gameState.markets];
      const marketIndex = markets.findIndex(m => m.id === marketId);

      if (marketIndex === -1) return state;

      markets[marketIndex] = {
        ...markets[marketIndex],
        ...updatedMarket
      };

      return {
        gameState: {
          ...state.gameState,
          markets
        }
      };
    });
  },

  getPlayerGold: () => {
    // Use the getWizard function to get the player data
    const player = getWizard();
    return player?.gold || 0;
  },

  updatePlayerGold: (amount) => {
    // Use the updateWizard function to update the player data
    const player = getWizard();
    if (!player) return;

    updateWizard(wizard => ({
      ...wizard,
      gold: amount
    }));
  },

  addGold: (amount) => {
    // Use the updateWizard function to update the player data
    const player = getWizard();
    if (!player) return;

    const currentGold = player.gold || 0;

    // Update the player data
    updateWizard(wizard => ({
      ...wizard,
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

  removeGold: (amount) => {
    // Use the getWizard function to get the player data
    const player = getWizard();
    if (!player) return false;

    const currentGold = player.gold || 0;

    // Check if player has enough gold
    if (currentGold < amount) {
      return false;
    }

    // Update the player data
    updateWizard(wizard => ({
      ...wizard,
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

  recordTransaction: (transaction) => {
    set((state: any) => {
      const newTransaction: MarketTransaction = {
        ...transaction,
        id: generateId(),
        date: new Date().toISOString()
      };

      return {
        gameState: {
          ...state.gameState,
          marketData: {
            ...state.gameState.marketData,
            transactions: [
              newTransaction,
              ...state.gameState.marketData.transactions
            ]
          }
        }
      };
    });
  },

  visitMarket: (marketId) => {
    const markets = get().gameState.markets || [];
    const marketIndex = markets.findIndex(m => m.id === marketId);

    if (marketIndex === -1) {
      console.error(`Market not found: ${marketId}`);
      return false;
    }

    const market = markets[marketIndex];
    console.log(`Visiting market: ${market.name}`);

    // Properly check if market inventory needs initialization
    const needsInventory =
      !market.inventory ||
      !Array.isArray(market.inventory.ingredients) || market.inventory.ingredients.length === 0 ||
      !Array.isArray(market.inventory.potions) || market.inventory.potions.length === 0 ||
      !Array.isArray(market.inventory.equipment) || market.inventory.equipment.length === 0 ||
      !Array.isArray(market.inventory.scrolls) || market.inventory.scrolls.length === 0;

    if (needsInventory) {
      console.log(`Initializing inventory for market: ${market.name}, level ${market.unlockLevel}`);
      try {
        // Call the correct function - refreshMarketInventory from marketSystem expects a MarketLocation
        // while the local function doesn't accept parameters
        console.log('Market before refresh:', JSON.stringify({
          id: market.id,
          name: market.name,
          unlockLevel: market.unlockLevel
        }));

        // Use the imported function that takes a market parameter
        const updatedMarket = importedRefreshMarketInventory(market);

        if (updatedMarket && updatedMarket.inventory) {
          markets[marketIndex] = updatedMarket;
          console.log(`Market inventory refreshed successfully with:
            ${updatedMarket.inventory.ingredients.length} ingredients,
            ${updatedMarket.inventory.potions.length} potions,
            ${updatedMarket.inventory.equipment.length} equipment,
            ${updatedMarket.inventory.scrolls.length} scrolls`
          );
        } else {
          // If updatedMarket is undefined or has no inventory, fallback to creating inventory directly
          console.log('Using fallback inventory generation due to error in market refresh');
          const newInventory = {
            ingredients: [],
            potions: [],
            equipment: [],
            scrolls: []
          };

          // Generate some basic inventory
          const level = market.unlockLevel || 1;

          // Import the require inventory generation functions
          const {
            generateRandomIngredient,
            generateRandomPotion,
            generateRandomEquipment,
            generateRandomScroll
          } = require('../../features/items/itemGenerators');

          // Populate with basic items
          for (let i = 0; i < 5; i++) {
            newInventory.ingredients.push({
              item: generateRandomIngredient(level),
              quantity: Math.floor(Math.random() * 5) + 1,
              currentPrice: 50,
              supply: 'common',
              demand: 'moderate',
              priceHistory: [50]
            });

            if (i < 3) {
              newInventory.potions.push({
                item: generateRandomPotion(level),
                quantity: Math.floor(Math.random() * 3) + 1,
                currentPrice: 100,
                supply: 'common',
                demand: 'moderate',
                priceHistory: [100]
              });
            }

            if (i < 2) {
              newInventory.equipment.push({
                item: generateRandomEquipment(level),
                quantity: Math.floor(Math.random() * 2) + 1,
                currentPrice: 200,
                supply: 'limited',
                demand: 'high',
                priceHistory: [200]
              });
            }

            if (i < 1) {
              newInventory.scrolls.push({
                item: generateRandomScroll(level),
                quantity: 1,
                currentPrice: 300,
                supply: 'rare',
                demand: 'high',
                priceHistory: [300]
              });
            }
          }

          markets[marketIndex] = {
            ...market,
            inventory: newInventory,
            lastRefreshed: new Date().toISOString()
          };

          console.log('Fallback inventory generation complete');
        }
      } catch (err) {
        console.error('Error generating market inventory:', err);

        // Create a minimal inventory to prevent crashes
        const minimalInventory = {
          ingredients: [],
          potions: [],
          equipment: [{
            item: {
              id: 'apprentice-robe',
              name: 'Apprentice Robe',
              description: 'A simple robe for novice wizards',
              type: 'armor',
              equipSlot: 'body',
              rarity: 'common',
              defense: 1,
              magicDefense: 2,
              effects: ['magic power +1']
            },
            quantity: 6,
            currentPrice: 30,
            supply: 'common',
            demand: 'moderate',
            priceHistory: [30]
          }, {
            item: {
              id: 'wand-of-protection',
              name: 'Wand of Protection',
              description: 'A basic wand that provides magical protection',
              type: 'weapon',
              equipSlot: 'hand',
              rarity: 'uncommon',
              attack: 1,
              magicAttack: 3,
              effects: ['defense +5']
            },
            quantity: 1,
            currentPrice: 100,
            supply: 'limited',
            demand: 'high',
            priceHistory: [100]
          }],
          scrolls: []
        };

        markets[marketIndex] = {
          ...market,
          inventory: minimalInventory,
          lastRefreshed: new Date().toISOString()
        };

        console.log('Created minimal inventory due to error');
      }
    }

    set((state: any) => {
      const visitedMarkets = [...(state.gameState.marketData.visitedMarkets || [])];

      // Add to visited markets if not already there
      if (!visitedMarkets.includes(marketId)) {
        visitedMarkets.push(marketId);
      }

      return {
        gameState: {
          ...state.gameState,
          marketData: {
            ...state.gameState.marketData,
            visitedMarkets
          },
          markets
        }
      };
    });

    return true;
  },

  toggleFavoriteMarket: (marketId) => {
    set((state: any) => {
      const favoriteMarkets = [...state.gameState.marketData.favoriteMarkets];

      // Toggle favorite status
      if (favoriteMarkets.includes(marketId)) {
        const index = favoriteMarkets.indexOf(marketId);
        favoriteMarkets.splice(index, 1);
      } else {
        favoriteMarkets.push(marketId);
      }

      return {
        gameState: {
          ...state.gameState,
          marketData: {
            ...state.gameState.marketData,
            favoriteMarkets
          }
        }
      };
    });
  },

  refreshMarketInventory: (marketId) => {
    set((state: any) => {
      const markets = [...state.gameState.markets];
      const marketIndex = markets.findIndex(m => m.id === marketId);

      if (marketIndex === -1) return state;

      const market = markets[marketIndex];
      console.log(`Refreshing inventory for market: ${market.name}`);

      // Generate new inventory using the marketSystem function
      const updatedMarket = importedRefreshMarketInventory(market);

      // Update the market with new inventory and refresh date
      markets[marketIndex] = updatedMarket;

      console.log(`Market inventory refreshed with ${updatedMarket.inventory.ingredients.length} ingredients, ${updatedMarket.inventory.potions.length} potions, ${updatedMarket.inventory.equipment.length} equipment, ${updatedMarket.inventory.scrolls.length} scrolls`);

      return {
        gameState: {
          ...state.gameState,
          markets
        }
      };
    });
  },

  updateMarketPrices: (marketId) => {
    set((state: any) => {
      const markets = [...state.gameState.markets];
      const marketIndex = markets.findIndex(m => m.id === marketId);

      if (marketIndex === -1) return state;

      const market = markets[marketIndex];

      // Function to adjust prices based on supply and demand
      const adjustPrice = (item: MarketItem<any>) => {
        // Base price fluctuation - random 5-10% change
        const fluctuation = (Math.random() * 0.05) + 0.05;

        // Direction of change (up or down)
        const direction = Math.random() > 0.5 ? 1 : -1;

        // Supply and demand factors
        const supplyFactor = item.supply === 'abundant' ? -0.1 :
                            item.supply === 'common' ? -0.05 :
                            item.supply === 'limited' ? 0.05 :
                            item.supply === 'rare' ? 0.1 : 0.2;

        const demandFactor = item.demand === 'unwanted' ? -0.1 :
                            item.demand === 'low' ? -0.05 :
                            item.demand === 'moderate' ? 0 :
                            item.demand === 'high' ? 0.1 : 0.2;

        // Calculate price change
        const change = item.currentPrice * fluctuation * direction;
        const supplyDemandChange = item.currentPrice * (supplyFactor + demandFactor);

        // Apply change and ensure price doesn't go below 1
        const newPrice = Math.max(1, item.currentPrice + change + supplyDemandChange);

        // Update price history
        const priceHistory = [...item.priceHistory, item.currentPrice].slice(-10);

        return {
          ...item,
          currentPrice: Math.round(newPrice),
          priceHistory
        };
      };

      // Update prices for all items in inventory
      const updatedInventory = {
        ingredients: market.inventory.ingredients.map(adjustPrice),
        potions: market.inventory.potions.map(adjustPrice),
        equipment: market.inventory.equipment.map(adjustPrice),
        scrolls: market.inventory.scrolls.map(adjustPrice)
      };

      markets[marketIndex] = {
        ...market,
        inventory: updatedInventory
      };

      return {
        gameState: {
          ...state.gameState,
          markets
        }
      };
    });
  },

  buyItem: (marketId, itemType, itemId, quantity) => {
    const market = get().getMarketById(marketId);
    if (!market) {
      return { success: false, message: 'Market not found.' };
    }

    // Get the correct inventory array based on item type
    let marketItemArray: MarketItem<any>[] = [];
    switch (itemType) {
      case 'ingredient':
        marketItemArray = market.inventory.ingredients;
        break;
      case 'potion':
        marketItemArray = market.inventory.potions;
        break;
      case 'equipment':
        marketItemArray = market.inventory.equipment;
        break;
      case 'scroll':
        marketItemArray = market.inventory.scrolls;
        break;
      default:
        return { success: false, message: 'Invalid item type.' };
    }

    // Find the item in the market inventory
    const marketItemIndex = marketItemArray.findIndex(item => item.item.id === itemId);
    if (marketItemIndex === -1) {
      return { success: false, message: 'Item not found in market inventory.' };
    }

    const marketItem = marketItemArray[marketItemIndex];

    // Check if enough quantity is available
    if (marketItem.quantity < quantity) {
      return { success: false, message: `Only ${marketItem.quantity} available.` };
    }

    // Calculate total cost
    const totalCost = marketItem.currentPrice * quantity;

    // Check if player has enough gold
    const playerGold = get().getPlayerGold();
    if (playerGold < totalCost) {
      return { success: false, message: `Not enough gold. Needed: ${totalCost}, Available: ${playerGold}.` };
    }

    // Remove gold from player
    const goldRemoved = get().removeGold(totalCost);
    if (!goldRemoved) {
      return { success: false, message: 'Could not complete transaction.' };
    }

    // Update market inventory - reduce quantity or remove if all purchased
    const updatedInventory = { ...market.inventory };

    if (marketItem.quantity <= quantity) {
      // Remove the item from market inventory
      switch (itemType) {
        case 'ingredient':
          updatedInventory.ingredients = updatedInventory.ingredients.filter(item => item.item.id !== itemId);
          break;
        case 'potion':
          updatedInventory.potions = updatedInventory.potions.filter(item => item.item.id !== itemId);
          break;
        case 'equipment':
          updatedInventory.equipment = updatedInventory.equipment.filter(item => item.item.id !== itemId);
          break;
        case 'scroll':
          updatedInventory.scrolls = updatedInventory.scrolls.filter(item => item.item.id !== itemId);
          break;
      }
    } else {
      // Reduce quantity
      const updatedMarketItem = {
        ...marketItem,
        quantity: marketItem.quantity - quantity
      };

      // Update the specific array
      switch (itemType) {
        case 'ingredient':
          updatedInventory.ingredients = [
            ...updatedInventory.ingredients.slice(0, marketItemIndex),
            updatedMarketItem,
            ...updatedInventory.ingredients.slice(marketItemIndex + 1)
          ];
          break;
        case 'potion':
          updatedInventory.potions = [
            ...updatedInventory.potions.slice(0, marketItemIndex),
            updatedMarketItem,
            ...updatedInventory.potions.slice(marketItemIndex + 1)
          ];
          break;
        case 'equipment':
          updatedInventory.equipment = [
            ...updatedInventory.equipment.slice(0, marketItemIndex),
            updatedMarketItem,
            ...updatedInventory.equipment.slice(marketItemIndex + 1)
          ];
          break;
        case 'scroll':
          updatedInventory.scrolls = [
            ...updatedInventory.scrolls.slice(0, marketItemIndex),
            updatedMarketItem,
            ...updatedInventory.scrolls.slice(marketItemIndex + 1)
          ];
          break;
      }
    }

    // Update market with new inventory and increase market gold
    get().updateMarket(marketId, {
      inventory: updatedInventory,
      currentGold: (market.currentGold || 0) + totalCost // Increase market gold
    });

    // Add item to player inventory
    const itemToAdd = { ...marketItem.item };

    switch (itemType) {
      case 'ingredient':
        // Get player data using getWizard
        const playerData = getWizard();
        if (!playerData) {
          return { success: false, message: 'Player data not found.' };
        }

        // Handle ingredient quantity
        const existingIngredient = playerData.ingredients?.find(i => i.id === itemId);
        if (existingIngredient) {
          // Update existing ingredient quantity
          updateWizard(wizard => ({
            ...wizard,
            ingredients: (wizard.ingredients || []).map(i =>
              i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
            )
          }));
        } else {
          // Add new ingredient with a unique ID
          const ingredientToAdd = {
            ...itemToAdd,
            id: `ingredient-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            quantity: quantity
          };
          updateWizard(wizard => ({
            ...wizard,
            ingredients: [...(wizard.ingredients || []), ingredientToAdd]
          }));
        }
        break;
      case 'potion':
        // Get player data using getWizard
        const potionPlayerData = getWizard();
        if (!potionPlayerData) {
          return { success: false, message: 'Player data not found.' };
        }

        // Ensure the potion has the correct structure and a unique ID
        const potionToAdd: Potion = {
          id: `potion-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: itemToAdd.name,
          type: itemToAdd.type as any,
          rarity: itemToAdd.rarity,
          description: itemToAdd.description || `A ${itemToAdd.rarity} ${itemToAdd.name}`,
          effect: itemToAdd.effect || { value: 10 },
          imagePath: itemToAdd.imagePath,
          quantity: 1
        };

        // Add potion to inventory
        updateWizard(wizard => ({
          ...wizard,
          potions: [...(wizard.potions || []), potionToAdd]
        }));
        break;
      case 'equipment':
        // Get player data using getWizard
        const equipPlayerData = getWizard();
        if (!equipPlayerData) {
          return { success: false, message: 'Player data not found.' };
        }

        // Ensure equipment has a unique ID
        const equipToAdd: Equipment = {
          ...itemToAdd as Equipment,
          id: `equip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        };

        // Add equipment to inventory
        updateWizard(wizard => ({
          ...wizard,
          inventory: [...(wizard.inventory || []), equipToAdd]
        }));
        break;
      case 'scroll':
        // Get player data using getWizard
        const scrollPlayerData = getWizard();
        if (!scrollPlayerData) {
          return { success: false, message: 'Player data not found.' };
        }

        // Scrolls are added as equipment with type "scroll" and a spell reference
        const scrollToAdd = {
          ...itemToAdd,
          id: `scroll-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          type: 'scroll',
          slot: 'hand',
          equipped: false,
          unlocked: true,
          bonuses: []
        } as unknown as Equipment;

        // Add scroll to inventory
        updateWizard(wizard => ({
          ...wizard,
          inventory: [...(wizard.inventory || []), scrollToAdd]
        }));
        break;
    }

    // Record transaction
    get().recordTransaction({
      type: 'buy',
      marketId,
      itemType,
      itemId: itemToAdd.id,
      itemName: itemToAdd.name,
      quantity,
      price: marketItem.currentPrice,
      totalAmount: totalCost
    });

    return {
      success: true,
      message: `Purchased ${quantity} ${itemToAdd.name} for ${totalCost} gold.`
    };
  },

  sellItem: (marketId, itemType, itemId, quantity) => {
    const market = get().getMarketById(marketId);
    if (!market) {
      return { success: false, message: 'Market not found.' };
    }

    // Get the item from player inventory
    let playerItem: any = null;
    let playerItems: any[] = [];

    switch (itemType) {
      case 'ingredient':
        // Get player data using getWizard
        const playerData = getWizard();
        if (!playerData) {
          return { success: false, message: 'Player data not found.' };
        }

        playerItems = playerData.ingredients || [];
        playerItem = playerItems.find(i => i.id === itemId);
        if (!playerItem || playerItem.quantity < quantity) {
          return {
            success: false,
            message: playerItem ? `You only have ${playerItem.quantity} of this item.` : 'Item not found in your inventory.'
          };
        }
        break;
      case 'potion':
        // Get player data using getWizard
        const wizardData = getWizard();
        if (!wizardData) {
          return { success: false, message: 'Player data not found.' };
        }

        playerItems = wizardData.potions || [];
        playerItem = playerItems.find(i => i.id === itemId);
        if (!playerItem) {
          return { success: false, message: 'Potion not found in your inventory.' };
        }
        break;
      case 'equipment':
        // Get player data using getWizard
        const player = getWizard();
        if (!player) {
          return { success: false, message: 'Player data not found.' };
        }

        // Get inventory items that are not equipped
        playerItems = (player.inventory || []).filter(item =>
          item.type !== 'scroll' &&
          !(player.equipment || []).some(eq => eq.id === item.id)
        );

        playerItem = playerItems.find(i => i.id === itemId);
        if (!playerItem) {
          return { success: false, message: 'Equipment not found in your unequipped inventory.' };
        }
        break;
      case 'scroll':
        // Get player scrolls via the dedicated function
        playerItems = get().getPlayerScrolls();
        playerItem = playerItems.find(i => i.id === itemId);
        if (!playerItem) {
          return { success: false, message: 'Scroll not found in your inventory.' };
        }
        break;
      default:
        return { success: false, message: 'Invalid item type.' };
    }

    // Calculate sell price (usually 50-80% of buy price depending on market)
    const marketFactor = market.sellPriceMultiplier || 0.6; // Default to 60% of value
    const sellPrice = Math.floor((playerItem.value || 10) * marketFactor);
    const totalValue = sellPrice * quantity;

    // Check if market has enough gold
    const marketGold = market.currentGold || 0;
    if (marketGold < totalValue) {
      return { success: false, message: `The market doesn't have enough gold (${marketGold}) to buy this item for ${totalValue}.` };
    }

    // Add gold to player
    get().addGold(totalValue);

    // Add the sold item to the market's inventory
    const updatedInventory = { ...market.inventory };

    // Create a market item from the player item
    const marketItem = {
      item: { ...playerItem },
      quantity: quantity,
      currentPrice: Math.ceil(sellPrice / market.sellPriceMultiplier), // Original buy price
      supply: 'common',
      demand: 'moderate',
      priceHistory: [Math.ceil(sellPrice / market.sellPriceMultiplier)]
    };

    // Add to the appropriate inventory array
    switch (itemType) {
      case 'ingredient':
        // Check if the ingredient already exists in the market
        const existingIngredientIndex = updatedInventory.ingredients.findIndex(i =>
          i.item.id === itemId || i.item.name === playerItem.name
        );
        if (existingIngredientIndex >= 0) {
          // Update existing ingredient quantity
          updatedInventory.ingredients[existingIngredientIndex].quantity += quantity;
        } else {
          // Add new ingredient
          updatedInventory.ingredients.push(marketItem);
        }
        break;
      case 'potion':
        // Check if the potion already exists in the market
        const existingPotionIndex = updatedInventory.potions.findIndex(i =>
          i.item.id === itemId || i.item.name === playerItem.name
        );
        if (existingPotionIndex >= 0) {
          // Update existing potion quantity
          updatedInventory.potions[existingPotionIndex].quantity += quantity;
        } else {
          // Add new potion
          updatedInventory.potions.push(marketItem);
        }
        break;
      case 'equipment':
        // Check if the equipment already exists in the market
        const existingEquipmentIndex = updatedInventory.equipment.findIndex(i =>
          i.item.id === itemId || i.item.name === playerItem.name
        );
        if (existingEquipmentIndex >= 0) {
          // Update existing equipment quantity
          updatedInventory.equipment[existingEquipmentIndex].quantity += quantity;
        } else {
          // Add new equipment
          updatedInventory.equipment.push(marketItem);
        }
        break;
      case 'scroll':
        // For scrolls, we need to ensure the item has the correct structure for a SpellScroll
        const scrollItem = {
          ...marketItem,
          item: {
            id: playerItem.id,
            name: playerItem.name,
            type: 'scroll',
            rarity: playerItem.rarity || 'common',
            description: playerItem.description || `A scroll containing the ${playerItem.spell?.name || 'unknown'} spell.`,
            spell: playerItem.spell || null,
            imagePath: playerItem.imagePath || '/images/scrolls/default_scroll.png'
          }
        };

        // Check if the scroll already exists in the market
        const existingScrollIndex = updatedInventory.scrolls.findIndex(i =>
          i.item.id === itemId || i.item.name === playerItem.name
        );
        if (existingScrollIndex >= 0) {
          // Update existing scroll quantity
          updatedInventory.scrolls[existingScrollIndex].quantity += quantity;
        } else {
          // Add new scroll
          updatedInventory.scrolls.push(scrollItem);
        }
        break;
    }

    // Update market with new inventory and reduced gold
    get().updateMarket(marketId, {
      inventory: updatedInventory,
      currentGold: marketGold - totalValue
    });

    // Remove item from player inventory
    switch (itemType) {
      case 'ingredient':
        // Handle ingredient quantity
        const currentWizard = getWizard();
        if (!currentWizard) {
          return { success: false, message: 'Player data not found.' };
        }

        if (playerItem.quantity <= quantity) {
          // Remove the ingredient entirely
          updateWizard(wizard => ({
            ...wizard,
            ingredients: (wizard.ingredients || []).filter(i => i.id !== itemId)
          }));
        } else {
          // Reduce quantity
          updateWizard(wizard => ({
            ...wizard,
            ingredients: (wizard.ingredients || []).map(i =>
              i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i
            )
          }));
        }
        break;
      case 'potion':
        // Get player data using getWizard
        const wizardData = getWizard();
        if (!wizardData) {
          return { success: false, message: 'Player data not found.' };
        }

        // Remove potion from inventory
        updateWizard(wizard => ({
          ...wizard,
          potions: (wizard.potions || []).filter(p => p.id !== itemId)
        }));
        break;
      case 'equipment':
        // Get player data using getWizard
        const equipWizard = getWizard();
        if (!equipWizard) {
          return { success: false, message: 'Player data not found.' };
        }

        // Remove equipment from inventory
        updateWizard(wizard => ({
          ...wizard,
          inventory: (wizard.inventory || []).filter(i => i.id !== itemId)
        }));
        break;
      case 'scroll': // Scrolls are stored as equipment with type "scroll"
        // Get player data using getWizard
        const scrollWizard = getWizard();
        if (!scrollWizard) {
          return { success: false, message: 'Player data not found.' };
        }

        // Remove scroll from inventory
        updateWizard(wizard => ({
          ...wizard,
          inventory: (wizard.inventory || []).filter(i => i.id !== itemId)
        }));
        break;
    }

    // Record transaction
    get().recordTransaction({
      type: 'sell',
      marketId,
      itemType,
      itemId: playerItem.id,
      itemName: playerItem.name,
      quantity,
      price: sellPrice,
      totalAmount: totalValue
    });

    return {
      success: true,
      message: `Sold ${quantity} ${playerItem.name} for ${totalValue} gold.`
    };
  },

  checkForMarketAttack: (marketId) => {
    const market = get().getMarketById(marketId);
    if (!market) {
      return { attacked: false, attacker: null };
    }

    // Set attack chance based on difficulty
    let attackChance = 0.05; // default to 5%
    const difficulty = get().gameState.settings.difficulty;
    if (difficulty === 'easy') {
      attackChance = 0.05; // 5%
    } else if (difficulty === 'normal') {
      attackChance = 0.25; // 25%
    } else if (difficulty === 'hard') {
      attackChance = 0.5; // 50%
    }

    // Roll for attack
    const roll = Math.random();
    if (roll <= attackChance) {
      // Get the player data using getWizard
      const player = getWizard();
      if (!player) {
        return { attacked: false, attacker: null };
      }

      // Generate an attacker based on player level
      const playerLevel = player.level;
      const attackerLevel = Math.max(1, Math.floor(playerLevel * 0.8));

      // Generate a bandit/thief wizard with appropriate level
      const attackerWizard = generateDefaultWizard('Market Bandit');

      // Manually set the attacker's level
      attackerWizard.level = attackerLevel;

      return { attacked: true, attacker: attackerWizard };
    }

    return { attacked: false, attacker: null };
  },

  handleMarketAttackResult: (result) => {
    // Update player stats based on the outcome
    switch (result) {
      case 'win':
        // Award some bonus gold and potentially rare items
        const goldReward = Math.floor(Math.random() * 50) + 50; // 50-100 gold
        get().addGold(goldReward);

        // Update player stats
        updateGameProgress(gameProgress => {
          if (!gameProgress) return gameProgress;

          const updatedPlayerStats = {
            ...gameProgress.playerStats,
            marketAttacksWon: (gameProgress.playerStats?.marketAttacksWon || 0) + 1
          };

          return {
            ...gameProgress,
            playerStats: updatedPlayerStats
          };
        });
        break;

      case 'lose':
        // Lose some gold
        const goldLoss = Math.floor(get().getPlayerGold() * 0.1); // Lose 10% of gold
        get().removeGold(goldLoss);

        // Update player stats
        updateGameProgress(gameProgress => {
          if (!gameProgress) return gameProgress;

          const updatedPlayerStats = {
            ...gameProgress.playerStats,
            marketAttacksLost: (gameProgress.playerStats?.marketAttacksLost || 0) + 1
          };

          return {
            ...gameProgress,
            playerStats: updatedPlayerStats
          };
        });
        break;

      case 'flee':
        // Lose a smaller amount of gold
        const fleeGoldLoss = Math.floor(get().getPlayerGold() * 0.05); // Lose 5% of gold
        get().removeGold(fleeGoldLoss);

        // Update player stats
        updateGameProgress(gameProgress => {
          if (!gameProgress) return gameProgress;

          const updatedPlayerStats = {
            ...gameProgress.playerStats,
            marketAttacksFled: (gameProgress.playerStats?.marketAttacksFled || 0) + 1
          };

          return {
            ...gameProgress,
            playerStats: updatedPlayerStats
          };
        });
        break;
    }
  }
});