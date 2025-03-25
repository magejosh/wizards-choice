'use client';

import React from 'react';
import { useGameStateStore } from '../../game-state/gameStateStore';
import { Inventory } from '../../../components/inventory/Inventory';
import { Equipment, SpellScroll, Potion, Ingredient } from '../../types';

interface InventoryScreenProps {
  onClose: () => void;
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({ onClose }) => {
  const { 
    gameState, 
    updatePlayerEquipment, 
    updatePlayerInventory,
    consumeScrollToLearnSpell,
    removeItemFromInventory,
    updatePlayerIngredients,
    updatePlayerPotions
  } = useGameStateStore();
  const { player } = gameState;

  // Handler for equipping an item
  const handleEquipItem = (item: Equipment) => {
    if (!player) return;
    
    // Create new equipment object
    const newEquipment = { ...player.equipment };
    
    // Handle different equipment slots
    if (item.slot === 'finger') {
      // For rings (finger slot), we have two slots: finger1 and finger2
      if (!newEquipment.finger1) {
        newEquipment.finger1 = item;
      } else if (!newEquipment.finger2) {
        newEquipment.finger2 = item;
      } else {
        // Both slots are filled, replace finger1
        const oldRing = newEquipment.finger1;
        newEquipment.finger1 = item;
        // Add old ring to inventory
        const newInventory = player.inventory.filter(invItem => invItem.id !== item.id);
        newInventory.push(oldRing);
        updatePlayerInventory(newInventory);
        updatePlayerEquipment(newEquipment);
        return;
      }
    } else {
      // For other slots, simply assign to the corresponding slot
      newEquipment[item.slot] = item;
    }
    
    // Create new inventory array without the equipped item
    const newInventory = player.inventory.filter(invItem => invItem.id !== item.id);
    
    // Update player state
    updatePlayerEquipment(newEquipment);
    updatePlayerInventory(newInventory);
  };

  // Handler for unequipping an item
  const handleUnequipItem = (slot: string) => {
    if (!player) return;
    
    // Copy equipment and inventory objects
    const newEquipment = { ...player.equipment };
    const newInventory = [...player.inventory];
    
    // Handle finger slots specially
    if (slot === 'finger1' || slot === 'finger2') {
      const item = newEquipment[slot as keyof typeof newEquipment];
      if (item) {
        newInventory.push(item as Equipment);
        newEquipment[slot as keyof typeof newEquipment] = undefined;
      }
    } else {
      // Handle other equipment slots
      const equipmentSlot = slot as keyof typeof newEquipment;
      const item = newEquipment[equipmentSlot];
      if (item) {
        newInventory.push(item as Equipment);
        newEquipment[equipmentSlot] = undefined;
      }
    }
    
    // Update player state
    updatePlayerEquipment(newEquipment);
    updatePlayerInventory(newInventory);
  };

  // Handler for using spell scrolls
  const handleUseSpellScroll = (scroll: SpellScroll) => {
    const result = consumeScrollToLearnSpell(scroll.id);
    if (result.success) {
      // Alert the user of success
      alert(`Learned spell: ${result.learnedSpell?.name}`);
    } else {
      alert(result.message);
    }
  };

  // Handler for using potions
  const handleUsePotion = (potion: Potion) => {
    // For now, just remove the potion from inventory
    const updatedPotions = player.potions.filter(p => p.id !== potion.id);
    updatePlayerPotions(updatedPotions);
    alert(`Used potion: ${potion.name}`);
  };

  // Handler for using ingredients
  const handleUseIngredient = (ingredient: Ingredient) => {
    // For now, just remove the ingredient from inventory
    const updatedIngredients = player.ingredients.filter(i => i.id !== ingredient.id);
    updatePlayerIngredients(updatedIngredients);
    alert(`Used ingredient: ${ingredient.name}`);
  };

  return (
    <div className="inventory-screen">
      <div className="inventory-screen__header">
        <h2 className="inventory-screen__title">Inventory</h2>
        <button 
          className="inventory-screen__close-button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
      
      <div className="inventory-screen__content">
        <Inventory 
          equipment={player.equipment}
          inventory={player.inventory || []}
          spellScrolls={player.inventory?.filter(item => 'spell' in item) as SpellScroll[] || []}
          ingredients={player.ingredients || []}
          potions={player.potions || []}
          onEquipItem={handleEquipItem}
          onUnequipItem={handleUnequipItem}
          onUseSpellScroll={handleUseSpellScroll}
          onUsePotion={handleUsePotion}
          onUseIngredient={handleUseIngredient}
        />
      </div>
    </div>
  );
};

export default InventoryScreen; 