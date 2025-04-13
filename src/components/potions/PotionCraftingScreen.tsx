'use client';

import React, { useState, useEffect } from 'react';
import { useGameStateStore, getWizard } from '../../lib/game-state/gameStateStore';
import { PotionRecipe, Ingredient } from '../../lib/types';
import { getCraftableRecipes, getDiscoveredRecipes } from '../../lib/features/potions/potionCrafting';
import styles from './PotionCraftingScreen.module.css';

interface PotionCraftingScreenProps {
  onClose: () => void;
}

const PotionCraftingScreen: React.FC<PotionCraftingScreenProps> = ({ onClose }) => {
  const { updatePlayerIngredients, updatePlayerPotions, experimentWithIngredients, craftPotion } = useGameStateStore();
  const player = getWizard();

  // Local state
  const [selectedTab, setSelectedTab] = useState<'brew' | 'experiment'>('brew');
  const [selectedRecipe, setSelectedRecipe] = useState<PotionRecipe | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [craftableRecipes, setCraftableRecipes] = useState<PotionRecipe[]>([]);
  const [discoveredRecipes, setDiscoveredRecipes] = useState<PotionRecipe[]>([]);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Load recipes on component mount
  useEffect(() => {
    if (player) {
      setCraftableRecipes(getCraftableRecipes(player));
      setDiscoveredRecipes(getDiscoveredRecipes(player));
    }
  }, [player]);

  // Handle selecting a recipe
  const handleRecipeSelect = (recipe: PotionRecipe) => {
    setSelectedRecipe(recipe);
  };

  // Handle selecting an ingredient for experimentation
  const handleIngredientSelect = (ingredient: Ingredient) => {
    // Check if ingredient is already selected
    const isSelected = selectedIngredients.some(i => i.id === ingredient.id);

    if (isSelected) {
      // Remove from selection
      setSelectedIngredients(selectedIngredients.filter(i => i.id !== ingredient.id));
    } else {
      // Add to selection
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
  };

  // Render ingredients list for experimentation
  const renderIngredientsList = () => {
    if (!player.ingredients || player.ingredients.length === 0) {
      return (
        <div className={styles.potionCraftingEmptyMessage}>
          You don't have any ingredients. Visit the market to purchase some.
        </div>
      );
    }

    return (
      <div className={styles.potionCraftingIngredientsList}>
        {player.ingredients.map(ingredient => {
          const isSelected = selectedIngredients.some(i => i.id === ingredient.id);

          return (
            <div
              key={ingredient.id}
              className={`${styles.potionCraftingIngredient} ${isSelected ? styles.potionCraftingIngredientSelected : ''}`}
              onClick={() => handleIngredientSelect(ingredient)}
            >
              <div className={styles.potionCraftingIngredientHeader}>
                <span className={styles.potionCraftingIngredientName}>{ingredient.name}</span>
                <span className={styles.potionCraftingIngredientCategory}>{ingredient.category}</span>
              </div>

              <div className={styles.potionCraftingIngredientDescription}>
                {ingredient.description}
              </div>

              <div className={styles.potionCraftingIngredientProperties}>
                <span>Potency: {ingredient.potency}</span>
                <span>Rarity: {ingredient.rarity}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Handle crafting a potion from a recipe
  const handleCraftPotion = () => {
    if (!selectedRecipe) return;

    const result = craftPotion(selectedRecipe.id);
    setResultMessage(result.message);
    setIsSuccess(result.success);

    if (result.success) {
      // Update the craftable recipes list since we used ingredients
      setCraftableRecipes(getCraftableRecipes(gameState.player));
    }
  };

  // Handle experimenting with ingredients
  const handleExperiment = () => {
    if (selectedIngredients.length < 2) {
      setResultMessage('You need at least 2 ingredients to experiment.');
      setIsSuccess(false);
      return;
    }

    const result = experimentWithIngredients(selectedIngredients.map(i => i.id));
    setResultMessage(result.message);
    setIsSuccess(result.success);
    setSelectedIngredients([]);

    // Update recipes and ingredients lists
    if (result.success) {
      setCraftableRecipes(getCraftableRecipes(gameState.player));
      setDiscoveredRecipes(getDiscoveredRecipes(gameState.player));
    }
  };

  // Render recipe list for brewing
  const renderRecipesList = () => {
    const recipes = selectedTab === 'brew' ? craftableRecipes : discoveredRecipes;

    if (recipes.length === 0) {
      return (
        <div className={styles.potionCraftingEmptyMessage}>
          {selectedTab === 'brew'
            ? "You don't have the ingredients for any recipes."
            : "You haven't discovered any recipes yet. Try experimenting!"}
        </div>
      );
    }

    return (
      <div className={styles.potionCraftingRecipesList}>
        {recipes.map(recipe => (
          <div
            key={recipe.id}
            className={`${styles.potionCraftingRecipe} ${selectedRecipe?.id === recipe.id ? styles.potionCraftingRecipeSelected : ''}`}
            onClick={() => handleRecipeSelect(recipe)}
          >
            <div className={styles.potionCraftingRecipeHeader}>
              <span className={styles.potionCraftingRecipeName}>{recipe.name}</span>
              <span className={styles.potionCraftingRecipeTier}>Tier {recipe.resultTier}</span>
            </div>

            <div className={styles.potionCraftingRecipeIngredients}>
              <strong>Ingredients:</strong>
              <ul>
                {recipe.ingredients.map(({ ingredientId, count }) => (
                  <li key={ingredientId}>
                    {count}x {ingredientId.replace('ingredient_', '').replace(/_/g, ' ')}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.potionCraftingRecipeDescription}>
              {recipe.description}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.potionCrafting}>
      <div className={styles.potionCraftingHeader}>
        <h1 className={styles.potionCraftingTitle}>Potion Crafting</h1>
        <button className={styles.potionCraftingCloseButton} onClick={onClose}>Close</button>
      </div>

      <div className={styles.potionCraftingTabs}>
        <button
          className={`${styles.potionCraftingTab} ${selectedTab === 'brew' ? styles.potionCraftingTabActive : ''}`}
          onClick={() => setSelectedTab('brew')}
        >
          Brew Potions
        </button>
        <button
          className={`${styles.potionCraftingTab} ${selectedTab === 'experiment' ? styles.potionCraftingTabActive : ''}`}
          onClick={() => setSelectedTab('experiment')}
        >
          Experiment
        </button>
      </div>

      <div className={styles.potionCraftingContent}>
        {selectedTab === 'brew' ? (
          <div className={styles.potionCraftingBrewMode}>
            <div className={styles.potionCraftingRecipes}>
              <h2 className={styles.potionCraftingSectionTitle}>Available Recipes</h2>
              {renderRecipesList()}
            </div>

            <div className={styles.potionCraftingBrewingArea}>
              <h2 className={styles.potionCraftingSectionTitle}>Brewing Cauldron</h2>

              {selectedRecipe ? (
                <div className={styles.potionCraftingSelectedRecipe}>
                  <h3 className={styles.potionCraftingRecipeTitle}>{selectedRecipe.name}</h3>
                  <p className={styles.potionCraftingRecipeDescription}>{selectedRecipe.description}</p>

                  <div className={styles.potionCraftingRecipeDetails}>
                    <div className={styles.potionCraftingRecipeIngredients}>
                      <h4>Required Ingredients:</h4>
                      <ul>
                        {selectedRecipe.ingredients.map(({ ingredientId, count }) => (
                          <li key={ingredientId}>
                            {count}x {ingredientId.replace('ingredient_', '').replace(/_/g, ' ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    className={styles.potionCraftingCraftButton}
                    onClick={handleCraftPotion}
                  >
                    Craft Potion
                  </button>
                </div>
              ) : (
                <div className={styles.potionCraftingNoSelection}>
                  Select a recipe from the list to begin brewing.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.potionCraftingExperimentMode}>
            <div className={styles.potionCraftingIngredients}>
              <h2 className={styles.potionCraftingSectionTitle}>Your Ingredients</h2>
              {renderIngredientsList()}
            </div>

            <div className={styles.potionCraftingExperimentationArea}>
              <h2 className={styles.potionCraftingSectionTitle}>Experimentation Cauldron</h2>

              <div className={styles.potionCraftingSelectedIngredients}>
                <h3>Selected Ingredients:</h3>
                {selectedIngredients.length > 0 ? (
                  <ul>
                    {selectedIngredients.map(ingredient => (
                      <li key={ingredient.id}>
                        {ingredient.name} ({ingredient.category})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No ingredients selected. Select ingredients from the list to begin experimenting.</p>
                )}
              </div>

              <button
                className={styles.potionCraftingExperimentButton}
                onClick={handleExperiment}
                disabled={selectedIngredients.length < 2}
              >
                Experiment
              </button>

              <p className={styles.potionCraftingWarning}>
                Warning: Experimenting will consume the selected ingredients regardless of success.
              </p>
            </div>
          </div>
        )}

        {resultMessage && (
          <div className={`${styles.potionCraftingResult} ${isSuccess ? styles.potionCraftingResultSuccess : styles.potionCraftingResultFailure}`}>
            {resultMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default PotionCraftingScreen;
