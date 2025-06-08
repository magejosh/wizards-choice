import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { createPotionModule, PotionActions } from "../modules/potionModule";
import { GameState, SaveSlot } from "../../types/game-types";
import { Wizard, Ingredient, PotionRecipe, Potion } from "../../types";
import { getAllPotionRecipes } from "../../features/potions/potionRecipes";

type TestStore = PotionActions & { gameState: GameState };

function createTestWizard(recipe: PotionRecipe): Wizard {
  const ingredients: Ingredient[] = [];
  recipe.ingredients.forEach((req) => {
    for (let i = 0; i < req.count; i++) {
      ingredients.push({
        id: req.ingredientId,
        name: req.ingredientId,
        category: "herb",
        rarity: "common",
        description: "",
        properties: [],
        effects: [],
        quantity: 1,
      });
    }
  });
  return {
    id: "wiz1",
    name: "Tester",
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    health: 100,
    mana: 100,
    maxHealth: 100,
    maxMana: 100,
    manaRegen: 1,
    spells: [],
    equippedSpells: [],
    equipment: {},
    inventory: [],
    potions: [],
    equippedPotions: [],
    equippedSpellScrolls: [],
    ingredients,
    discoveredRecipes: [],
    levelUpPoints: 0,
    gold: 0,
    skillPoints: 0,
    decks: [],
    activeDeckId: null,
    combatStats: {},
    baseMaxHealth: 100,
    progressionMaxHealth: 0,
    equipmentMaxHealth: 0,
    totalMaxHealth: 100,
    baseMaxMana: 100,
    progressionMaxMana: 0,
    equipmentMaxMana: 0,
    totalMaxMana: 100,
  };
}

function createTestStore(wizard: Wizard, slotId = 0) {
  const saveSlots: SaveSlot[] = Array(1)
    .fill(null)
    .map((_, i) => ({
      id: i,
      saveUuid: uuidv4(),
      playerName: wizard.name,
      level: wizard.level,
      lastSaved: "",
      isEmpty: false,
      player: wizard,
      gameProgress: undefined,
    }));
  const initialState: GameState = {
    settings: {} as any,
    saveSlots,
    currentSaveSlot: saveSlots[0].saveUuid,
    markets: [],
    marketData: {
      transactions: [],
      reputationLevels: {},
      visitedMarkets: [],
      favoriteMarkets: [],
    },
    notifications: [],
    version: 1,
    player: wizard,
    gameProgress: undefined,
  };
  return create<TestStore>((set, get) => ({
    gameState: initialState,
    ...createPotionModule(set, get),
  }));
}

const recipe = getAllPotionRecipes().find((r) =>
  r.ingredients.every((i) => i.count === 1),
)!;

test("experimentWithIngredients discovers recipe and updates inventory", () => {
  const wizard = createTestWizard(recipe);
  const store = createTestStore(wizard);
  const ingredientIds = recipe.ingredients.flatMap((r) =>
    Array(r.count).fill(r.ingredientId),
  );
  const result = store.getState().experimentWithIngredients(ingredientIds);
  expect(result.success).toBe(true);
  const state = store.getState().gameState.player!;
  expect(state.potions.length).toBe(1);
  expect(state.ingredients?.length).toBe(0);
  expect(state.discoveredRecipes?.some((r) => r.id === recipe.id)).toBe(true);
});

test("craftPotion consumes ingredients and adds potion", () => {
  const wizard = createTestWizard(recipe);
  // mark recipe discovered
  wizard.discoveredRecipes = [{ ...recipe, discovered: true }];
  const store = createTestStore(wizard);
  const result = store.getState().craftPotion(recipe.id);
  expect(result.success).toBe(true);
  const state = store.getState().gameState.player!;
  expect(state.potions.length).toBe(1);
  expect(state.ingredients?.length).toBe(0);
});
