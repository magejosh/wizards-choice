import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Ingredient } from '@/lib/types';
import styles from './Ingredients.module.css';

interface IngredientsProps {
  ingredients: Ingredient[];
  onUseIngredient: (ingredient: Ingredient) => void;
}

export function Ingredients({ ingredients, onUseIngredient }: IngredientsProps) {
  if (ingredients.length === 0) {
    return (
      <div className={styles.emptyIngredients}>
        No ingredients found in your inventory.
      </div>
    );
  }

  return (
    <div className={styles.ingredientsGrid}>
      {ingredients.map((ingredient) => (
        <Card key={ingredient.id} className={styles.ingredientCard}>
          <div className={styles.ingredientHeader}>
            <h3 className={styles.ingredientName}>{ingredient.name}</h3>
            <span className={`${styles.rarity} ${styles[ingredient.rarity]}`}>
              {ingredient.rarity}
            </span>
          </div>
          <div className={styles.ingredientInfo}>
            <div className={styles.ingredientDetails}>
              <span className={styles.category}>{ingredient.category}</span>
              <span className={styles.quantity}>x{ingredient.quantity}</span>
            </div>
            <p className={styles.description}>{ingredient.description}</p>
            <div className={styles.effects}>
              {ingredient.effects.map((effect, index) => (
                <span key={index} className={styles.effect}>
                  {effect}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.ingredientActions}>
            <Button
              variant="outline"
              className={styles.useButton}
              onClick={() => onUseIngredient(ingredient)}
            >
              Use Ingredient
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
} 