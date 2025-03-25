'use client';

import React, { useState, useEffect } from 'react';
import { useGameStateStore } from '../../game-state/gameStateStore';
import { PotionRecipe, Ingredient } from '../../types';
import { getCraftableRecipes, getDiscoveredRecipes } from '../../features/potions/potionCrafting';

interface PotionCraftingScreenProps {
  onClose: () => void;
}

const PotionCraftingScreen: React.FC<PotionCraftingScreenProps> = ({ onClose }) => {
  const { gameState, updatePlayerIngredients, updatePlayerPotions, experimentWithIngredients, craftPotion } = useGameStateStore();
  const { player } = gameState;
  
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
  
  // Handle recipe selection
  const handleRecipeSelect = (recipe: PotionRecipe) => {
    setSelectedRecipe(recipe);
    setResultMessage(null);
  };
  
  // Handle ingredient selection for experimenting
  const handleIngredientSelect = (ingredient: Ingredient) => {
    if (selectedTab === 'experiment') {
      // In experiment mode, allow selecting/deselecting ingredients
      const isSelected = selectedIngredients.some(i => i.id === ingredient.id);
      
      if (isSelected) {
        // Deselect
        setSelectedIngredients(selectedIngredients.filter(i => i.id !== ingredient.id));
      } else {
        // Select
        setSelectedIngredients([...selectedIngredients, ingredient]);
      }
      
      setResultMessage(null);
    }
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
  
  // Helper function to get rarity color
  const getRarityColor = (rarity: string): string => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'gray-300';
      case 'uncommon': return 'green-400';
      case 'rare': return 'blue-400';
      case 'epic': return 'purple-400';
      case 'legendary': return 'yellow-400';
      default: return 'gray-300';
    }
  };
  
  // Render ingredient list for experimenting
  const renderIngredientsList = () => {
    if (!player.ingredients || player.ingredients.length === 0) {
      return <div className="potion-crafting__empty-message">You don't have any ingredients to experiment with.</div>;
    }
    
    return (
      <div className="potion-crafting__ingredients-list">
        {player.ingredients.map(ingredient => {
          const isSelected = selectedIngredients.some(i => i.id === ingredient.id);
          
          return (
            <div 
              key={ingredient.id}
              className={`potion-crafting__ingredient ${isSelected ? 'potion-crafting__ingredient--selected' : ''}`}
              onClick={() => handleIngredientSelect(ingredient)}
            >
              <div className="potion-crafting__ingredient-header">
                <span className={`potion-crafting__ingredient-name text-${getRarityColor(ingredient.rarity)}`}>
                  {ingredient.name}
                </span>
                <span className="potion-crafting__ingredient-category">{ingredient.category}</span>
              </div>
              
              <div className="potion-crafting__ingredient-properties">
                Properties: {ingredient.properties.join(', ')}
              </div>
              
              <div className="potion-crafting__ingredient-description">
                {ingredient.description}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Render recipe list for brewing
  const renderRecipesList = () => {
    const recipes = selectedTab === 'brew' ? craftableRecipes : discoveredRecipes;
    
    if (recipes.length === 0) {
      return (
        <div className="potion-crafting__empty-message">
          {selectedTab === 'brew' 
            ? "You don't have the ingredients for any recipes."
            : "You haven't discovered any recipes yet. Try experimenting!"}
        </div>
      );
    }
    
    return (
      <div className="potion-crafting__recipes-list">
        {recipes.map(recipe => (
          <div 
            key={recipe.id}
            className={`potion-crafting__recipe ${selectedRecipe?.id === recipe.id ? 'potion-crafting__recipe--selected' : ''}`}
            onClick={() => handleRecipeSelect(recipe)}
          >
            <div className="potion-crafting__recipe-header">
              <span className="potion-crafting__recipe-name">{recipe.name}</span>
              <span className="potion-crafting__recipe-tier">Tier {recipe.resultTier}</span>
            </div>
            
            <div className="potion-crafting__recipe-ingredients">
              <strong>Ingredients:</strong>
              <ul>
                {recipe.ingredients.map(({ ingredientId, count }) => (
                  <li key={ingredientId}>
                    {count}x {ingredientId.replace('ingredient_', '').replace(/_/g, ' ')}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="potion-crafting__recipe-description">
              {recipe.description}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="potion-crafting">
      <div className="potion-crafting__header">
        <h1 className="potion-crafting__title">Potion Crafting</h1>
        <button className="potion-crafting__close-button" onClick={onClose}>Close</button>
      </div>
      
      <div className="potion-crafting__tabs">
        <button 
          className={`potion-crafting__tab ${selectedTab === 'brew' ? 'potion-crafting__tab--active' : ''}`}
          onClick={() => setSelectedTab('brew')}
        >
          Brew Potions
        </button>
        <button 
          className={`potion-crafting__tab ${selectedTab === 'experiment' ? 'potion-crafting__tab--active' : ''}`}
          onClick={() => setSelectedTab('experiment')}
        >
          Experiment
        </button>
      </div>
      
      <div className="potion-crafting__content">
        {selectedTab === 'brew' ? (
          <div className="potion-crafting__brew-mode">
            <div className="potion-crafting__recipes">
              <h2 className="potion-crafting__section-title">Available Recipes</h2>
              {renderRecipesList()}
            </div>
            
            <div className="potion-crafting__brewing-area">
              <h2 className="potion-crafting__section-title">Brewing Cauldron</h2>
              
              {selectedRecipe ? (
                <div className="potion-crafting__selected-recipe">
                  <h3 className="potion-crafting__recipe-title">{selectedRecipe.name}</h3>
                  <p className="potion-crafting__recipe-description">{selectedRecipe.description}</p>
                  
                  <div className="potion-crafting__recipe-details">
                    <div className="potion-crafting__recipe-ingredients">
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
                    className="potion-crafting__craft-button"
                    onClick={handleCraftPotion}
                  >
                    Craft Potion
                  </button>
                </div>
              ) : (
                <div className="potion-crafting__no-selection">
                  Select a recipe from the list to begin brewing.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="potion-crafting__experiment-mode">
            <div className="potion-crafting__ingredients">
              <h2 className="potion-crafting__section-title">Your Ingredients</h2>
              {renderIngredientsList()}
            </div>
            
            <div className="potion-crafting__experimentation-area">
              <h2 className="potion-crafting__section-title">Experimentation Cauldron</h2>
              
              <div className="potion-crafting__selected-ingredients">
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
                className="potion-crafting__experiment-button"
                onClick={handleExperiment}
                disabled={selectedIngredients.length < 2}
              >
                Experiment
              </button>
              
              <p className="potion-crafting__warning">
                Warning: Experimenting will consume the selected ingredients regardless of success.
              </p>
            </div>
          </div>
        )}
        
        {resultMessage && (
          <div className={`potion-crafting__result ${isSuccess ? 'potion-crafting__result--success' : 'potion-crafting__result--failure'}`}>
            {resultMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default PotionCraftingScreen; 