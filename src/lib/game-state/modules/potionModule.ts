import { Ingredient, Potion } from "../../types/equipment-types";
import { PotionRecipe } from "../../types/equipment-types";
import {
  experimentWithIngredients as experimentHelper,
  craftPotion as craftHelper,
} from "../../features/potions/potionCrafting";

export interface PotionActions {
  updatePlayerIngredients: (ingredients: Ingredient[]) => void;
  updatePlayerPotions: (potions: Potion[]) => void;
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
}

export const createPotionModule = (
  set: Function,
  get: Function,
): PotionActions => ({
  updatePlayerIngredients: (ingredients) => {
    set((state: any) => {
      const gameState = state.gameState;
      const saveSlots = [...gameState.saveSlots];
      const slotIndex = saveSlots.findIndex(
        (s: any) => s.saveUuid === gameState.currentSaveSlot,
      );
      if (slotIndex >= 0) {
        const slot = saveSlots[slotIndex];
        if (slot.player) {
          slot.player = { ...slot.player, ingredients };
        }
        saveSlots[slotIndex] = slot;
      }
      return {
        gameState: {
          ...gameState,
          player: { ...gameState.player, ingredients },
          saveSlots,
        },
      };
    });
  },

  updatePlayerPotions: (potions) => {
    const merged = potions;
    set((state: any) => {
      const gameState = state.gameState;
      const saveSlots = [...gameState.saveSlots];
      const slotIndex = saveSlots.findIndex(
        (s: any) => s.saveUuid === gameState.currentSaveSlot,
      );
      if (slotIndex >= 0) {
        const slot = saveSlots[slotIndex];
        if (slot.player) {
          slot.player = { ...slot.player, potions: merged };
        }
        saveSlots[slotIndex] = slot;
      }
      return {
        gameState: {
          ...gameState,
          player: { ...gameState.player, potions: merged },
          saveSlots,
        },
      };
    });
  },

  experimentWithIngredients: (ingredientIds) => {
    const player = get().gameState.player;
    if (!player) return { success: false, message: "No player loaded." };
    const { wizard: updatedWizard, result } = experimentHelper(
      player,
      ingredientIds,
    );
    set((state: any) => {
      const gameState = state.gameState;
      const saveSlots = [...gameState.saveSlots];
      const slotIndex = saveSlots.findIndex(
        (s: any) => s.saveUuid === gameState.currentSaveSlot,
      );
      if (slotIndex >= 0) {
        saveSlots[slotIndex] = {
          ...saveSlots[slotIndex],
          player: updatedWizard,
          level: updatedWizard.level,
          playerName: updatedWizard.name,
        };
      }
      return {
        gameState: {
          ...gameState,
          player: updatedWizard,
          saveSlots,
        },
      };
    });
    return result;
  },

  craftPotion: (recipeId) => {
    const player = get().gameState.player;
    if (!player) return { success: false, message: "No player loaded." };
    const { wizard: updatedWizard, result } = craftHelper(player, recipeId);
    set((state: any) => {
      const gameState = state.gameState;
      const saveSlots = [...gameState.saveSlots];
      const slotIndex = saveSlots.findIndex(
        (s: any) => s.saveUuid === gameState.currentSaveSlot,
      );
      if (slotIndex >= 0) {
        saveSlots[slotIndex] = {
          ...saveSlots[slotIndex],
          player: updatedWizard,
          level: updatedWizard.level,
          playerName: updatedWizard.name,
        };
      }
      return {
        gameState: {
          ...gameState,
          player: updatedWizard,
          saveSlots,
        },
      };
    });
    return result;
  },
});
