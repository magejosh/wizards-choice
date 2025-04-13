'use client';

import React from 'react';
import { useGameStateStore, getWizard } from '../../lib/game-state/gameStateStore';
import { Inventory } from './Inventory';
import { Equipment, SpellScroll, Potion, Ingredient } from '../../lib/types';
import { groupEquipmentItems, groupSpellScrolls, groupPotions } from '../../lib/utils/inventoryUtils';
import styles from './InventoryScreen.module.css';

interface InventoryScreenProps {
  onClose: () => void;
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({ onClose }) => {
  const {
    updatePlayerEquipment,
    updatePlayerInventory,
    consumeScrollToLearnSpell,
    removeItemFromInventory,
    updatePlayerIngredients,
    updatePlayerPotions
  } = useGameStateStore();
  const player = getWizard();

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

      // Force a UI refresh by getting the updated player data
      const updatedPlayer = getWizard();
      if (updatedPlayer) {
        // Update the inventory in the UI
        updatePlayerInventory(updatedPlayer.inventory || []);
      }
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
    <div className={styles.inventoryScreen}>
      <div className={styles.inventoryScreenHeader}>
        <h2 className={styles.inventoryScreenTitle}>INVENTORY</h2>
        <button
          className={styles.inventoryScreenCloseButton}
          onClick={onClose}
        >
          Close
        </button>
      </div>
      <div className={styles.divider}></div>

      <div className={styles.inventoryScreenContent}>
        <Inventory
          equipment={player.equipment}
          inventory={groupEquipmentItems(player.inventory || [])}
          spellScrolls={groupSpellScrolls(player.inventory?.filter(item => 'spell' in item) as SpellScroll[] || [])}
          ingredients={player.ingredients || []}
          potions={groupPotions(player.potions || [])}
          onEquipItem={handleEquipItem}
          onUnequipItem={handleUnequipItem}
          onUseSpellScroll={handleUseSpellScroll}
          onUsePotion={handleUsePotion}
          onUseIngredient={handleUseIngredient}
        />
      </div>
      <div className={styles.divider}></div>
    </div>
  );
};

export default InventoryScreen;
