'use client';

import React, { useState, useEffect } from 'react';
import RuneSequenceMinigame from '../minigames/RuneSequenceMinigame';
import PotionStudyMinigame from '../minigames/PotionStudyMinigame';
import { RuneGrade } from '@/lib/types/minigame-types';
import { useGameStateStore, getWizard } from '../../lib/game-state/gameStateStore';
import { PotionRecipe, Ingredient, Potion } from '../../lib/types';
import { getCraftableRecipes, getDiscoveredRecipes } from '../../lib/features/potions/potionCrafting';
import styles from './PotionCraftingScreen.module.css';

interface PotionCraftingScreenProps {
  onClose: () => void;
}

const PotionCraftingScreen: React.FC<PotionCraftingScreenProps> = ({ onClose }) => {
  const { updatePlayerIngredients, updatePlayerPotions, experimentWithIngredients, craftPotion, studyPotion: studyPotionAction } = useGameStateStore();
  const player = getWizard();

  // Local state
  const [selectedTab, setSelectedTab] = useState<'brew' | 'experiment' | 'study'>('brew');
  const [selectedRecipe, setSelectedRecipe] = useState<PotionRecipe | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [craftableRecipes, setCraftableRecipes] = useState<PotionRecipe[]>([]);
  const [discoveredRecipes, setDiscoveredRecipes] = useState<PotionRecipe[]>([]);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showMinigame, setShowMinigame] = useState(false);
  const [pendingAction, setPendingAction] = useState<'craft' | 'experiment' | null>(null);
  const [studyPotion, setStudyPotion] = useState<Potion | null>(null);
  const [studyTimeLeft, setStudyTimeLeft] = useState<number>(0);
  const [showStudyMinigame, setShowStudyMinigame] = useState(false);

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

  // Countdown timer for studying
  useEffect(() => {
    if (studyTimeLeft <= 0) return;
    const t = setTimeout(() => setStudyTimeLeft(studyTimeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [studyTimeLeft]);

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

  // Perform the craft action
  const performCraftPotion = () => {
    if (!selectedRecipe) return;

    const result = craftPotion(selectedRecipe.id);
    setResultMessage(result.message);
    setIsSuccess(result.success);

    if (result.success) {
      // Update the craftable recipes list since we used ingredients
      setCraftableRecipes(getCraftableRecipes(getWizard()!));
    }
  };

  // Handle crafting a potion (opens minigame first)
  const handleCraftPotion = () => {
    if (!selectedRecipe) return;
    setPendingAction('craft');
    setShowMinigame(true);
  };

  // Perform the experiment action
  const performExperiment = () => {
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
      const updatedPlayer = getWizard();
      if (updatedPlayer) {
        setCraftableRecipes(getCraftableRecipes(updatedPlayer));
        setDiscoveredRecipes(getDiscoveredRecipes(updatedPlayer));
      }
    }
  };

  // Handle experimenting with ingredients (opens minigame)
  const handleExperiment = () => {
    setPendingAction('experiment');
    setShowMinigame(true);
  };

  const performStudy = (grade: RuneGrade) => {
    if (!studyPotion) return;
    const result = studyPotionAction(studyPotion.id, grade);
    setResultMessage(result.message);
    setIsSuccess(result.success);

    if (result.success) {
      const updatedPlayer = getWizard();
      if (updatedPlayer) {
        setCraftableRecipes(getCraftableRecipes(updatedPlayer));
        setDiscoveredRecipes(getDiscoveredRecipes(updatedPlayer));
      }
    }
    setStudyPotion(null);
    setStudyTimeLeft(0);
  };

  // Start studying the selected potion
  const handleStartStudy = () => {
    if (!studyPotion) return;
    setStudyTimeLeft(60);
  };

  const handleStudyMinigameStart = () => {
    setShowStudyMinigame(true);
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

  // Render potion list for study
  const renderPotionsList = () => {
    if (!player.potions || player.potions.length === 0) {
      return (
        <div className={styles.potionCraftingEmptyMessage}>
          You don't have any potions to study.
        </div>
      );
    }

    return (
      <div className={styles.potionCraftingPotionsList}>
        {player.potions.map(potion => {
          const isSelected = studyPotion?.id === potion.id;
          return (
            <div
              key={potion.id}
              className={`${styles.potionCraftingPotion} ${isSelected ? styles.potionCraftingPotionSelected : ''}`}
              onClick={() => {
                if (studyTimeLeft > 0) return;
                setStudyPotion(potion);
              }}
            >
              <div className={styles.potionCraftingIngredientHeader}>
                <span className={styles.potionCraftingIngredientName}>{potion.name}</span>
                {potion.quantity && potion.quantity > 1 && (
                  <span className={styles.potionCraftingIngredientCategory}>x{potion.quantity}</span>
                )}
              </div>
              <div className={styles.potionCraftingIngredientDescription}>{potion.description}</div>
            </div>
          );
        })}
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
        <button
          className={`${styles.potionCraftingTab} ${selectedTab === 'study' ? styles.potionCraftingTabActive : ''}`}
          onClick={() => setSelectedTab('study')}
        >
          Study
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
        ) : selectedTab === 'experiment' ? (
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
        ) : (
          <div className={styles.potionCraftingStudyMode}>
            <div className={styles.potionCraftingIngredients}>
              <h2 className={styles.potionCraftingSectionTitle}>Your Potions</h2>
              {renderPotionsList()}
            </div>

            <div className={styles.potionCraftingStudyArea}>
              <h2 className={styles.potionCraftingSectionTitle}>Study Station</h2>

              <div
                className={styles.potionCraftingStudySlot}
                onClick={() => {
                  if (studyTimeLeft > 0) {
                    setStudyPotion(null);
                    setStudyTimeLeft(0);
                  }
                }}
              >
                {studyPotion ? (
                  <div>
                    <p>{studyPotion.name}</p>
                    {studyTimeLeft > 0 && (
                      <p className={styles.potionCraftingTimer}>
                        Studying... {studyTimeLeft}s
                      </p>
                    )}
                    {studyTimeLeft === 0 && (
                      <button
                        className={styles.potionCraftingExperimentButton}
                        onClick={handleStudyMinigameStart}
                      >
                        Analyze
                      </button>
                    )}
                  </div>
                ) : (
                  <p>Select a potion to study</p>
                )}
              </div>

              <button
                className={styles.potionCraftingExperimentButton}
                onClick={handleStartStudy}
                disabled={!studyPotion || studyTimeLeft > 0}
              >
                Study
              </button>

              <p className={styles.potionCraftingWarning}>
                Studying consumes the potion.
              </p>
            </div>
          </div>
        )}

        {resultMessage && (
          <div className={`${styles.potionCraftingResult} ${isSuccess ? styles.potionCraftingResultSuccess : styles.potionCraftingResultFailure}`}>
            {resultMessage}
          </div>
        )}

        {showMinigame && (
          <RuneSequenceMinigame
            sequenceLength={3}
            onComplete={(grade: RuneGrade) => {
              setShowMinigame(false);
              if (pendingAction === 'craft') {
                performCraftPotion();
              } else if (pendingAction === 'experiment') {
                performExperiment();
              }
              setPendingAction(null);
              setResultMessage(prev =>
                prev ? `${prev} (Rune ${grade})` : `Rune ${grade}`
              );
            }}
            onCancel={() => {
              setShowMinigame(false);
              setPendingAction(null);
            }}
          />
        )}
        {showStudyMinigame && (
          <PotionStudyMinigame
            sequenceLength={3}
            onComplete={(grade: RuneGrade) => {
              setShowStudyMinigame(false);
              performStudy(grade);
            }}
            onCancel={() => {
              setShowStudyMinigame(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PotionCraftingScreen;
