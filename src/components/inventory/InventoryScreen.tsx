'use client';

import React from 'react';
import { useGameStateStore, getWizard } from '../../lib/game-state/gameStateStore';
import { Inventory } from './Inventory';
import { Equipment, SpellScroll, Potion, Ingredient } from '../../lib/types';
import { groupEquipmentItems, groupSpellScrolls, groupPotions, groupIngredients } from '../../lib/utils/inventoryUtils';
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
    updatePlayerPotions,
    equipSpellScroll,
    unequipSpellScroll,
    updatePlayerEquippedPotions
  } = useGameStateStore();
  const player = getWizard();

  // Handler for equipping an item
  const handleEquipItem = (item: Equipment) => {
    if (!player) return;
    // Use the canonical store action
    useGameStateStore.getState().equipItem(item);
  };

  // Handler for unequipping an item
  const handleUnequipItem = (slot: string) => {
    if (!player) return;
    // Use the canonical store action
    // For finger slots, check if it's finger1 or finger2
    if (slot === 'finger1') {
      useGameStateStore.getState().unequipItem('finger', false);
    } else if (slot === 'finger2') {
      useGameStateStore.getState().unequipItem('finger', true);
    } else {
      useGameStateStore.getState().unequipItem(slot);
    }
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
    // Directly update the player's ingredients array if needed
    // If ingredients are part of player object, update via updatePlayerInventory or similar if required
    // For now, just alert
    alert(`Used ingredient: ${ingredient.name}`);
  };

  // Handler for equipping a spell scroll to robes
  const handleEquipSpellScroll = (scroll: Equipment) => {
    equipSpellScroll(scroll);
  };

  // Handler for unequipping a spell scroll from robes
  const handleUnequipSpellScroll = (scrollId: string) => {
    unequipSpellScroll(scrollId);
  };

  // Handler for equipping an item or potion
  const handleEquipItemOrPotion = (item: Equipment | Potion) => {
    if (!player) return;
    // If it's a potion (has 'effect'), handle potion equip
    if ('effect' in item) {
      if (!player.equipment.belt) return;
      const maxPotionSlots = player.combatStats?.potionSlots || 0;
      if (player.equippedPotions.length >= maxPotionSlots) return;
      const newEquippedPotions = [...player.equippedPotions, item];
      const newPotions = player.potions.filter(p => p.id !== item.id);
      updatePlayerEquippedPotions(newEquippedPotions);
      updatePlayerPotions(newPotions);
      return;
    }
    // Otherwise, use the canonical store action
    handleEquipItem(item);
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
          inventory={[...groupEquipmentItems(player.inventory || []), ...groupPotions(player.potions || [])]}
          spellScrolls={groupSpellScrolls((player.inventory?.filter(item => 'spell' in item && item.type === 'scroll') as SpellScroll[]) || [])}
          equippedSpellScrolls={player.equippedSpellScrolls || []}
          ingredients={groupIngredients(player.ingredients || [])}
          potions={groupPotions(player.potions || [])}
          onEquipItem={handleEquipItemOrPotion}
          onUnequipItem={handleUnequipItem}
          onUseSpellScroll={handleUseSpellScroll}
          onEquipSpellScroll={handleEquipSpellScroll}
          onUnequipSpellScroll={handleUnequipSpellScroll}
          onUsePotion={handleUsePotion}
          onUseIngredient={handleUseIngredient}
        />
      </div>
      <div className={styles.divider}></div>
    </div>
  );
};

export default InventoryScreen;
