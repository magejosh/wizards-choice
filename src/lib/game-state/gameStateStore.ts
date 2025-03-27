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
  SpellScroll,
  // Add new profile system types
  Achievement,
  PlayerTitle,
  BattleRecord,
  PlayerStats,
  SpellType,
  ElementType,
  MarketInventory
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
  generateRandomIngredient,
  generateRandomPotion,
  generateRandomEquipment,
  generateRandomScroll
} from '../features/items/itemGenerators';
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
    // Initialize player profile data
    achievements: [],
    titles: [],
    battleHistory: [],
    playerStats: {
      // Combat Statistics
      battlesTotal: 0,
      battlesWon: 0,
      battlesLost: 0,
      damageDealt: 0,
      damageReceived: 0,
      healingDone: 0,
      criticalHitsLanded: 0,
      criticalHitsReceived: 0,
      spellsCast: {
        total: 0,
        byType: {},
        byElement: {}
      },
      mysticPunchesUsed: 0,
      totalTurns: 0,
      longestBattle: 0,
      shortestVictory: 0,
      flawlessVictories: 0,

      // Progression Statistics
      totalExperienceGained: 0,
      goldEarned: 0,
      goldSpent: 0,
      levelsGained: 0,
      skillPointsSpent: 0,

      // Collection Statistics
      spellsAcquired: 0,
      equipmentCollected: 0,
      potionsCrafted: 0,
      ingredientsGathered: 0,
      recipesDiscovered: 0,
      scrollsUsed: 0,

      // Efficiency Metrics
      damagePerMana: 0,
      averageTurnsPerVictory: 0,
      goldPerBattle: 0,
      experiencePerBattle: 0,
      
      // By Element Damage
      elementalDamage: {
        fire: 0,
        water: 0,
        earth: 0,
        air: 0,
        arcane: 0,
        nature: 0,
        shadow: 0,
        light: 0
      }
    }
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
  
  // Player Profile System methods
  
  // Achievement methods
  getAchievements: () => Achievement[];
  getAchievementById: (achievementId: string) => Achievement | undefined;
  updateAchievementProgress: (achievementId: string, progress: number) => void;
  checkAchievementCompletion: (achievementId: string) => boolean;
  unlockAchievement: (achievementId: string) => {
    success: boolean;
    achievement?: Achievement;
    reward?: any;
  };
  
  // Title methods
  getTitles: () => PlayerTitle[];
  getTitleById: (titleId: string) => PlayerTitle | undefined;
  checkTitleUnlockRequirements: (titleId: string) => boolean;
  unlockTitle: (titleId: string) => {
    success: boolean;
    title?: PlayerTitle;
  };
  equipTitle: (titleId: string) => void;
  unequipTitle: (titleId: string) => void;
  
  // Battle history methods
  getBattleHistory: () => BattleRecord[];
  addBattleRecord: (record: Omit<BattleRecord, 'id' | 'date'>) => void;
  getBattleRecordById: (recordId: string) => BattleRecord | undefined;
  clearBattleHistory: () => void;
  
  // Player stats methods
  getPlayerStats: () => PlayerStats;
  updatePlayerStats: (stats: Partial<PlayerStats>) => void;
  recordSpellCast: (spell: Spell) => void;
  recordDamageDealt: (amount: number, element?: ElementType) => void;
  recordDamageReceived: (amount: number) => void;
  recordHealingDone: (amount: number) => void;
  recordCriticalHit: (isPlayer: boolean) => void;
  recordMysticPunchUsed: () => void;
  recordBattleResult: (won: boolean, turns: number, flawless: boolean) => void;
  recordGoldTransaction: (amount: number, isEarned: boolean) => void;
  recordExperienceGained: (amount: number) => void;
  recordItemAcquired: (type: 'spell' | 'equipment' | 'potion' | 'ingredient' | 'recipe' | 'scroll') => void;
  
  // Export methods
  exportPlayerProfile: () => string;
  exportBattleHistory: () => string;
  exportAchievements: () => string;
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
              achievements: [],
              titles: [],
              battleHistory: [],
              playerStats: {
                // Combat Statistics
                battlesTotal: 0,
                battlesWon: 0,
                battlesLost: 0,
                damageDealt: 0,
                damageReceived: 0,
                healingDone: 0,
                criticalHitsLanded: 0,
                criticalHitsReceived: 0,
                spellsCast: {
                  total: 0,
                  byType: {},
                  byElement: {}
                },
                mysticPunchesUsed: 0,
                totalTurns: 0,
                longestBattle: 0,
                shortestVictory: 0,
                flawlessVictories: 0,

                // Progression Statistics
                totalExperienceGained: 0,
                goldEarned: 0,
                goldSpent: 0,
                levelsGained: 0,
                skillPointsSpent: 0,

                // Collection Statistics
                spellsAcquired: 0,
                equipmentCollected: 0,
                potionsCrafted: 0,
                ingredientsGathered: 0,
                recipesDiscovered: 0,
                scrollsUsed: 0,

                // Efficiency Metrics
                damagePerMana: 0,
                averageTurnsPerVictory: 0,
                goldPerBattle: 0,
                experiencePerBattle: 0,
                
                // By Element Damage
                elementalDamage: {
                  fire: 0,
                  water: 0,
                  earth: 0,
                  air: 0,
                  arcane: 0,
                  nature: 0,
                  shadow: 0,
                  light: 0
                }
              }
            },
            marketData: {
              gold: 100, // Starting gold
              transactions: [],
              reputationLevels: {},
              visitedMarkets: [],
              favoriteMarkets: []
            }
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
        const { gameState } = get();
        
        // Ensure markets array exists and is initialized
        if (!gameState.markets || !Array.isArray(gameState.markets)) {
          const initializedMarkets = initializeMarkets();
          set({
            gameState: {
              ...get().gameState,
              markets: initializedMarkets
            }
          });
          return initializedMarkets;
        }
        
        // Update prices and refresh inventory for all markets
        const updatedMarkets = gameState.markets.map(market => {
          let updatedMarket = { ...market };
          
          // Update prices
          updatedMarket = updateMarketPrices(updatedMarket);
          
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
              ...get().gameState,
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
        
        // Update player's gold - FIXED: Use direct updates instead of helper methods
        const newGold = gameState.marketData.gold - totalCost;
        set({
          gameState: {
            ...gameState,
            marketData: {
              ...gameState.marketData,
              gold: newGold
            }
          }
        });
        
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
        
        // Update markets array with the modified market
        const updatedMarkets = gameState.markets.map(m => 
          m.id === marketId ? updatedMarket : m
        );
        
        // Add item to player's inventory
        const item = marketItem.item;
        let updatedPlayer = { ...gameState.player };
        
        switch (itemType) {
          case 'ingredient':
            // Direct update of player ingredients
            updatedPlayer.ingredients = [
              ...updatedPlayer.ingredients,
              ...(Array(quantity).fill(null).map(() => item as unknown as Ingredient))
            ];
            break;
          case 'potion':
            // Direct update of player potions
            updatedPlayer.potions = [
              ...updatedPlayer.potions,
              ...(Array(quantity).fill(null).map(() => item as unknown as Potion))
            ];
            break;
          case 'equipment':
            // Direct update of player inventory
            updatedPlayer.inventory = [
              ...updatedPlayer.inventory,
              ...(Array(quantity).fill(null).map(() => item as unknown as Equipment))
            ];
            break;
          // case 'scroll' will be implemented later with the spell scroll system
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
        
        // Update entire state to ensure changes are reflected properly
        set({
          gameState: {
            ...gameState,
            player: updatedPlayer,
            markets: updatedMarkets,
            marketData: {
              ...gameState.marketData,
              transactions: [...gameState.marketData.transactions, transaction]
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
        let updatedPlayer = { ...gameState.player };
        
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
              
              // Directly update player ingredients
              let ingredientsToRemove = quantity;
              updatedPlayer.ingredients = ingredients.filter(item => {
                if (item.id === itemId && ingredientsToRemove > 0) {
                  ingredientsToRemove--;
                  return false;
                }
                return true;
              });
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
              
              // Directly update player potions
              let potionsToRemove = quantity;
              updatedPlayer.potions = potions.filter(item => {
                if (item.id === itemId && potionsToRemove > 0) {
                  potionsToRemove--;
                  return false;
                }
                return true;
              });
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
              
              // Directly update player equipment
              let equipmentToRemove = quantity;
              updatedPlayer.inventory = equipment.filter(item => {
                if (item.id === itemId && equipmentToRemove > 0) {
                  equipmentToRemove--;
                  return false;
                }
                return true;
              });
            }
            break;
          
          // case 'scroll' will be implemented later with the spell scroll system
        }
        
        if (!hasItem) {
          return { success: false, message: 'Item not found in your inventory.' };
        }
        
        // Add gold to player directly
        const totalSalePrice = sellPrice * quantity;
        const newGold = gameState.marketData.gold + totalSalePrice;
        
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
        
        // Update entire state to ensure changes are reflected properly
        set({
          gameState: {
            ...gameState,
            player: updatedPlayer,
            marketData: {
              ...gameState.marketData,
              gold: newGold,
              transactions: [...gameState.marketData.transactions, transaction]
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
      },
      
      // Player Profile System methods
      
      // Achievement methods
      getAchievements: () => {
        return get().gameState.gameProgress.achievements || [];
      },
      
      getAchievementById: (achievementId: string) => {
        const achievements = get().gameState.gameProgress.achievements || [];
        return achievements.find(achievement => achievement.id === achievementId);
      },
      
      updateAchievementProgress: (achievementId: string, progress: number) => {
        const { gameState } = get();
        const achievements = [...(gameState.gameProgress.achievements || [])];
        const achievementIndex = achievements.findIndex(a => a.id === achievementId);
        
        if (achievementIndex === -1) return;
        
        const achievement = { ...achievements[achievementIndex] };
        achievement.progress = Math.min(achievement.requiredProgress, achievement.progress + progress);
        
        achievements[achievementIndex] = achievement;
        
        // Check if the achievement is now completed
        if (achievement.progress >= achievement.requiredProgress && !achievement.unlocked) {
          get().unlockAchievement(achievementId);
        } else {
          set({
            gameState: {
              ...gameState,
              gameProgress: {
                ...gameState.gameProgress,
                achievements
              }
            }
          });
        }
      },
      
      checkAchievementCompletion: (achievementId: string) => {
        const achievement = get().getAchievementById(achievementId);
        if (!achievement) return false;
        
        return achievement.progress >= achievement.requiredProgress;
      },
      
      unlockAchievement: (achievementId: string) => {
        const { gameState } = get();
        const achievements = [...(gameState.gameProgress.achievements || [])];
        const achievementIndex = achievements.findIndex(a => a.id === achievementId);
        
        if (achievementIndex === -1) {
          return { success: false };
        }
        
        const achievement = { ...achievements[achievementIndex] };
        
        // Already unlocked
        if (achievement.unlocked) {
          return { success: false, achievement };
        }
        
        // Update achievement
        achievement.unlocked = true;
        achievement.unlockedDate = new Date();
        achievements[achievementIndex] = achievement;
        
        // Apply the reward if there is one
        let reward;
        if (achievement.reward) {
          switch (achievement.reward.type) {
            case 'stat_bonus':
              if (achievement.reward.stat && achievement.reward.value) {
                // Apply stat bonus to player
                const player = { ...gameState.player };
                
                // Handle different stats
                if (achievement.reward.stat === 'maxHealth') {
                  player.maxHealth += achievement.reward.value;
                  player.health = player.maxHealth; // Heal to new max
                } else if (achievement.reward.stat === 'maxMana') {
                  player.maxMana += achievement.reward.value;
                  player.mana = player.maxMana; // Restore to new max
                } else if (achievement.reward.stat === 'manaRegen') {
                  player.manaRegen += achievement.reward.value;
                }
                
                reward = { stat: achievement.reward.stat, value: achievement.reward.value };
                
                set({
                  gameState: {
                    ...gameState,
                    player,
                    gameProgress: {
                      ...gameState.gameProgress,
                      achievements
                    }
                  }
                });
              }
              break;
              
            case 'gold':
              get().addGold(achievement.reward.value);
              reward = { gold: achievement.reward.value };
              
              set({
                gameState: {
                  ...gameState,
                  gameProgress: {
                    ...gameState.gameProgress,
                    achievements
                  }
                }
              });
              break;
              
            // Handle other reward types as needed
            default:
              set({
                gameState: {
                  ...gameState,
                  gameProgress: {
                    ...gameState.gameProgress,
                    achievements
                  }
                }
              });
          }
        } else {
          set({
            gameState: {
              ...gameState,
              gameProgress: {
                ...gameState.gameProgress,
                achievements
              }
            }
          });
        }
        
        return { success: true, achievement, reward };
      },
      
      // Title methods
      getTitles: () => {
        return get().gameState.gameProgress.titles || [];
      },
      
      getTitleById: (titleId: string) => {
        const titles = get().gameState.gameProgress.titles || [];
        return titles.find(title => title.id === titleId);
      },
      
      checkTitleUnlockRequirements: (titleId: string) => {
        const { gameState } = get();
        const title = get().getTitleById(titleId);
        
        if (!title) return false;
        
        // Check player level requirement
        if (title.requiredLevel && gameState.player.level < title.requiredLevel) {
          return false;
        }
        
        // Check achievement requirements
        if (title.requiredAchievements && title.requiredAchievements.length > 0) {
          const achievements = gameState.gameProgress.achievements || [];
          const unlockedAchievementIds = achievements
            .filter(a => a.unlocked)
            .map(a => a.id);
            
          for (const requiredAchievementId of title.requiredAchievements) {
            if (!unlockedAchievementIds.includes(requiredAchievementId)) {
              return false;
            }
          }
        }
        
        // Check stat requirements
        if (title.requiredStats && title.requiredStats.length > 0) {
          const playerStats = gameState.gameProgress.playerStats;
          if (!playerStats) return false;
          
          for (const statReq of title.requiredStats) {
            // Check against the appropriate player stat
            const statValue = (playerStats as any)[statReq.stat];
            if (typeof statValue === 'undefined' || statValue < statReq.value) {
              return false;
            }
          }
        }
        
        return true;
      },
      
      unlockTitle: (titleId: string) => {
        const { gameState } = get();
        const titles = [...(gameState.gameProgress.titles || [])];
        const titleIndex = titles.findIndex(t => t.id === titleId);
        
        if (titleIndex === -1) {
          return { success: false };
        }
        
        const title = { ...titles[titleIndex] };
        
        // Already unlocked
        if (title.unlocked) {
          return { success: false, title };
        }
        
        // Check requirements
        if (!get().checkTitleUnlockRequirements(titleId)) {
          return { success: false };
        }
        
        // Update title
        title.unlocked = true;
        title.unlockedDate = new Date();
        titles[titleIndex] = title;
        
        set({
          gameState: {
            ...gameState,
            gameProgress: {
              ...gameState.gameProgress,
              titles
            }
          }
        });
        
        return { success: true, title };
      },
      
      equipTitle: (titleId: string) => {
        const { gameState } = get();
        const titles = [...(gameState.gameProgress.titles || [])];
        
        // First unequip any currently equipped title
        const updatedTitles = titles.map(title => ({
          ...title,
          equipped: title.id === titleId && title.unlocked
        }));
        
        set({
          gameState: {
            ...gameState,
            gameProgress: {
              ...gameState.gameProgress,
              titles: updatedTitles
            }
          }
        });
      },
      
      unequipTitle: (titleId: string) => {
        const { gameState } = get();
        const titles = [...(gameState.gameProgress.titles || [])];
        const titleIndex = titles.findIndex(t => t.id === titleId);
        
        if (titleIndex === -1) return;
        
        const title = { ...titles[titleIndex], equipped: false };
        titles[titleIndex] = title;
        
        set({
          gameState: {
            ...gameState,
            gameProgress: {
              ...gameState.gameProgress,
              titles
            }
          }
        });
      },
      
      // Battle history methods
      getBattleHistory: () => {
        return get().gameState.gameProgress.battleHistory || [];
      },
      
      addBattleRecord: (record) => {
        const { gameState } = get();
        const battleHistory = [...(gameState.gameProgress.battleHistory || [])];
        
        // Create new record with ID and date
        const newRecord: BattleRecord = {
          ...record,
          id: `battle-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          date: new Date().toISOString()
        };
        
        // Add to the beginning of the array (most recent first)
        battleHistory.unshift(newRecord);
        
        // Limit to 50 battles to prevent excessive storage
        const limitedHistory = battleHistory.slice(0, 50);
        
        set({
          gameState: {
            ...gameState,
            gameProgress: {
              ...gameState.gameProgress,
              battleHistory: limitedHistory
            }
          }
        });
      },
      
      getBattleRecordById: (recordId: string) => {
        const battleHistory = get().gameState.gameProgress.battleHistory || [];
        return battleHistory.find(record => record.id === recordId);
      },
      
      clearBattleHistory: () => {
        const { gameState } = get();
        
        set({
          gameState: {
            ...gameState,
            gameProgress: {
              ...gameState.gameProgress,
              battleHistory: []
            }
          }
        });
      },
      
      // Player stats methods
      getPlayerStats: () => {
        return get().gameState.gameProgress.playerStats || initialGameState.gameProgress.playerStats!;
      },
      
      updatePlayerStats: (stats) => {
        const { gameState } = get();
        const currentStats = gameState.gameProgress.playerStats || initialGameState.gameProgress.playerStats!;
        
        set({
          gameState: {
            ...gameState,
            gameProgress: {
              ...gameState.gameProgress,
              playerStats: {
                ...currentStats,
                ...stats
              }
            }
          }
        });
      },
      
      recordSpellCast: (spell) => {
        const { gameState } = get();
        const currentStats = gameState.gameProgress.playerStats || initialGameState.gameProgress.playerStats!;
        
        // Update total spells cast
        const spellsCast = { 
          ...currentStats.spellsCast,
          total: currentStats.spellsCast.total + 1
        };
        
        // Update by spell type
        const byType = { ...currentStats.spellsCast.byType };
        byType[spell.type] = (byType[spell.type] || 0) + 1;
        spellsCast.byType = byType;
        
        // Update by element
        const byElement = { ...currentStats.spellsCast.byElement };
        byElement[spell.element] = (byElement[spell.element] || 0) + 1;
        spellsCast.byElement = byElement;
        
        // Update the stats
        get().updatePlayerStats({ spellsCast });
      },
      
      recordDamageDealt: (amount, element) => {
        const { gameState } = get();
        const currentStats = gameState.gameProgress.playerStats || initialGameState.gameProgress.playerStats!;
        
        const updates: Partial<PlayerStats> = {
          damageDealt: currentStats.damageDealt + amount
        };
        
        // If element is provided, update elemental damage
        if (element) {
          const elementalDamage = { ...currentStats.elementalDamage };
          elementalDamage[element] = (elementalDamage[element] || 0) + amount;
          updates.elementalDamage = elementalDamage;
        }
        
        // Update the stats
        get().updatePlayerStats(updates);
      },
      
      recordDamageReceived: (amount) => {
        const { gameState } = get();
        const currentStats = gameState.gameProgress.playerStats || initialGameState.gameProgress.playerStats!;
        
        get().updatePlayerStats({
          damageReceived: currentStats.damageReceived + amount
        });
      },
      
      recordHealingDone: (amount) => {
        const { gameState } = get();
        const currentStats = gameState.gameProgress.playerStats || initialGameState.gameProgress.playerStats!;
        
        get().updatePlayerStats({
          healingDone: currentStats.healingDone + amount
        });
      },
      
      recordCriticalHit: (isPlayer) => {
        const { gameState } = get();
        const currentStats = gameState.gameProgress.playerStats || initialGameState.gameProgress.playerStats!;
        
        if (isPlayer) {
          get().updatePlayerStats({
            criticalHitsLanded: currentStats.criticalHitsLanded + 1
          });
        } else {
          get().updatePlayerStats({
            criticalHitsReceived: currentStats.criticalHitsReceived + 1
          });
        }
      },
      
      recordMysticPunchUsed: () => {
        const { gameState } = get();
        const currentStats = gameState.gameProgress.playerStats || initialGameState.gameProgress.playerStats!;
        
        get().updatePlayerStats({
          mysticPunchesUsed: currentStats.mysticPunchesUsed + 1
        });
      },
      
      recordBattleResult: (won, turns, flawless) => {
        const { gameState } = get();
        const currentStats = gameState.gameProgress.playerStats || initialGameState.gameProgress.playerStats!;
        
        const updates: Partial<PlayerStats> = {
          battlesTotal: currentStats.battlesTotal + 1,
          totalTurns: currentStats.totalTurns + turns
        };
        
        if (won) {
          updates.battlesWon = currentStats.battlesWon + 1;
          
          // Update shortest victory if applicable
          if (currentStats.shortestVictory === 0 || turns < currentStats.shortestVictory) {
            updates.shortestVictory = turns;
          }
          
          // Update average turns per victory
          const totalVictories = currentStats.battlesWon + 1; // Include this victory
          updates.averageTurnsPerVictory = (currentStats.averageTurnsPerVictory * (totalVictories - 1) + turns) / totalVictories;
          
          // Track flawless victories
          if (flawless) {
            updates.flawlessVictories = currentStats.flawlessVictories + 1;
          }
        } else {
          updates.battlesLost = currentStats.battlesLost + 1;
        }
        
        // Update longest battle if applicable
        if (turns > currentStats.longestBattle) {
          updates.longestBattle = turns;
        }
        
        get().updatePlayerStats(updates);
      },
      
      recordGoldTransaction: (amount, isEarned) => {
        const { gameState } = get();
        const currentStats = gameState.gameProgress.playerStats || initialGameState.gameProgress.playerStats!;
        
        if (isEarned) {
          get().updatePlayerStats({
            goldEarned: currentStats.goldEarned + amount
          });
        } else {
          get().updatePlayerStats({
            goldSpent: currentStats.goldSpent + amount
          });
        }
      },
      
      recordExperienceGained: (amount) => {
        const { gameState } = get();
        const currentStats = gameState.gameProgress.playerStats || initialGameState.gameProgress.playerStats!;
        
        get().updatePlayerStats({
          totalExperienceGained: currentStats.totalExperienceGained + amount
        });
      },
      
      recordItemAcquired: (type) => {
        const { gameState } = get();
        const currentStats = gameState.gameProgress.playerStats || initialGameState.gameProgress.playerStats!;
        
        switch (type) {
          case 'spell':
            get().updatePlayerStats({
              spellsAcquired: currentStats.spellsAcquired + 1
            });
            break;
          case 'equipment':
            get().updatePlayerStats({
              equipmentCollected: currentStats.equipmentCollected + 1
            });
            break;
          case 'potion':
            get().updatePlayerStats({
              potionsCrafted: currentStats.potionsCrafted + 1
            });
            break;
          case 'ingredient':
            get().updatePlayerStats({
              ingredientsGathered: currentStats.ingredientsGathered + 1
            });
            break;
          case 'recipe':
            get().updatePlayerStats({
              recipesDiscovered: currentStats.recipesDiscovered + 1
            });
            break;
          case 'scroll':
            get().updatePlayerStats({
              scrollsUsed: currentStats.scrollsUsed + 1
            });
            break;
        }
      },
      
      // Export methods
      exportPlayerProfile: () => {
        const { gameState } = get();
        const { player, gameProgress } = gameState;
        
        const profileData = {
          player: {
            name: player.name,
            level: player.level,
            experience: player.experience,
            experienceToNextLevel: player.experienceToNextLevel,
            maxHealth: player.maxHealth,
            maxMana: player.maxMana,
            manaRegen: player.manaRegen,
            spellsCount: player.spells.length,
            equippedSpellsCount: player.equippedSpells.length,
            gold: gameState.marketData.gold
          },
          stats: gameProgress.playerStats,
          achievements: {
            total: gameProgress.achievements?.length || 0,
            unlocked: gameProgress.achievements?.filter(a => a.unlocked).length || 0
          },
          titles: {
            total: gameProgress.titles?.length || 0,
            unlocked: gameProgress.titles?.filter(t => t.unlocked).length || 0,
            equipped: gameProgress.titles?.find(t => t.equipped)?.name || 'None'
          },
          battles: {
            total: gameProgress.battleHistory?.length || 0,
            won: gameProgress.playerStats?.battlesWon || 0,
            lost: gameProgress.playerStats?.battlesLost || 0
          }
        };
        
        return JSON.stringify(profileData, null, 2);
      },
      
      exportBattleHistory: () => {
        const battleHistory = get().getBattleHistory();
        return JSON.stringify(battleHistory, null, 2);
      },
      
      exportAchievements: () => {
        const achievements = get().getAchievements();
        return JSON.stringify(achievements, null, 2);
      },

      initializeMarkets: () => {
        const markets: MarketLocation[] = [
          {
            id: 'market-1',
            name: 'Beginner\'s Market',
            description: 'A small market for novice wizards',
            unlockLevel: 1,
            reputationLevel: 0,
            inventoryRefreshDays: 3,
            lastRefreshed: new Date().toISOString(),
            inventory: generateMarketInventory(1),
            priceMultiplier: 1.0,
            prices: {}
          },
          {
            id: 'market-2',
            name: 'Apprentice\'s Market',
            description: 'A bustling market for growing wizards',
            unlockLevel: 5,
            reputationLevel: 0,
            inventoryRefreshDays: 5,
            lastRefreshed: new Date().toISOString(),
            inventory: generateMarketInventory(5),
            priceMultiplier: 1.2,
            prices: {}
          },
          {
            id: 'market-3',
            name: 'Master\'s Market',
            description: 'An exclusive market for experienced wizards',
            unlockLevel: 10,
            reputationLevel: 0,
            inventoryRefreshDays: 7,
            lastRefreshed: new Date().toISOString(),
            inventory: generateMarketInventory(10),
            priceMultiplier: 1.5,
            prices: {}
          }
        ];
        
        // Initialize prices for each market
        markets.forEach(market => {
          const inventory = market.inventory;
          market.prices = {};
          
          // Add prices for all items
          inventory.ingredients.forEach(item => {
            market.prices[item.item.id] = item.currentPrice;
          });
          
          inventory.potions.forEach(item => {
            market.prices[item.item.id] = item.currentPrice;
          });
          
          inventory.equipment.forEach(item => {
            market.prices[item.item.id] = item.currentPrice;
          });
          
          if (inventory.scrolls) {
            inventory.scrolls.forEach(item => {
              market.prices[item.item.id] = item.currentPrice;
            });
          }
        });
        
        set({
          gameState: {
            ...get().gameState,
            markets
          }
        });
      },

      updateMarketPrices: (market: MarketLocation) => {
        const updatedMarket = { ...market };
        const priceMultiplier = 1 + (Math.random() * 0.2 - 0.1); // ±10% price variation
        
        updatedMarket.prices = Object.entries(market.prices).reduce((acc: Record<string, number>, [itemId, price]) => {
          acc[itemId] = Math.round(Number(price) * priceMultiplier);
          return acc;
        }, {});
        
        return updatedMarket;
      },

      shouldRefreshMarketInventory: (market: any) => {
        const lastRefresh = new Date(market.lastRefresh);
        const now = new Date();
        const hoursSinceRefresh = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60);
        return hoursSinceRefresh >= 24; // Refresh every 24 hours
      },

      refreshMarketInventory: (market: any) => {
        const updatedMarket = { ...market };
        updatedMarket.inventory = generateMarketInventory(market.unlockLevel);
        updatedMarket.lastRefresh = new Date().toISOString();
        return updatedMarket;
      },

      generateMarketInventory: (level: number): MarketInventory => {
        const inventory: MarketInventory = {
          ingredients: [],
          potions: [],
          equipment: [],
          scrolls: []
        };

        // Generate ingredients
        const ingredientCount = Math.min(5 + level, 15);
        for (let i = 0; i < ingredientCount; i++) {
          const ingredient = generateRandomIngredient(level);
          inventory.ingredients.push(generateMarketItem(ingredient, level, 5));
        }

        // Generate potions
        const potionCount = Math.min(3 + level, 10);
        for (let i = 0; i < potionCount; i++) {
          const potion = generateRandomPotion(level);
          inventory.potions.push(generateMarketItem(potion, level, 3));
        }

        // Generate equipment
        const equipmentCount = Math.min(2 + level, 8);
        for (let i = 0; i < equipmentCount; i++) {
          const equipment = generateRandomEquipment(level);
          inventory.equipment.push(generateMarketItem(equipment, level, 2));
        }

        // Generate scrolls
        const scrollCount = Math.min(1 + level, 5);
        for (let i = 0; i < scrollCount; i++) {
          const scroll = generateRandomScroll(level);
          inventory.scrolls.push(generateMarketItem(scroll, level, 2));
        }

        return inventory;
      },

      generateMarketPrices: (level: number) => {
        const prices: Record<string, number> = {};
        
        // Generate base prices for all items in the market
        const inventory = generateMarketInventory(level);
        
        // Add ingredient prices
        inventory.ingredients.forEach(item => {
          prices[item.item.id] = item.currentPrice;
        });
        
        // Add potion prices
        inventory.potions.forEach(item => {
          prices[item.item.id] = item.currentPrice;
        });
        
        // Add equipment prices
        inventory.equipment.forEach(item => {
          prices[item.item.id] = item.currentPrice;
        });
        
        // Add scroll prices
        inventory.scrolls.forEach(item => {
          prices[item.item.id] = item.currentPrice;
        });
        
        return prices;
      },

      calculateBasePrice: (item: any, level: number): number => {
        const rarityMultipliers = {
          common: 1,
          uncommon: 2.5,
          rare: 6,
          epic: 15,
          legendary: 40
        };

        const basePrice = 50 * (rarityMultipliers[item.rarity] || 1);
        const levelMultiplier = 1 + (level - 1) * 0.2;
        const variation = 0.9 + Math.random() * 0.2;

        return Math.round(basePrice * levelMultiplier * variation);
      },
    }),
    {
      name: 'wizards-choice-storage', // Name for localStorage key
      partialize: (state) => ({
        gameState: state.gameState // Only persist the gameState field
      }),
    }
  )
);

const determineSupply = (rarity: string): 'abundant' | 'common' | 'limited' | 'rare' | 'unique' => {
  switch (rarity) {
    case 'legendary': return 'unique';
    case 'epic': return 'rare';
    case 'rare': return 'limited';
    case 'uncommon': return 'common';
    default: return 'abundant';
  }
};

const determineDemand = (rarity: string): 'unwanted' | 'low' | 'moderate' | 'high' | 'extreme' => {
  switch (rarity) {
    case 'legendary': return 'extreme';
    case 'epic': return 'high';
    case 'rare': return 'moderate';
    case 'uncommon': return 'low';
    default: return 'unwanted';
  }
};

const generateMarketItem = <T extends { rarity: string; id: string }>(
  item: T,
  level: number,
  baseQuantity: number
): MarketItem<T> => {
  return {
    item,
    quantity: Math.floor(Math.random() * baseQuantity) + 1,
    currentPrice: calculateBasePrice(item, level),
    supply: determineSupply(item.rarity),
    demand: determineDemand(item.rarity),
    priceHistory: []
  };
};
