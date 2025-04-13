'use client';

import React, { useState } from 'react';
import { useGameStateStore, getWizard } from '../../lib/game-state/gameStateStore';
import { Equipment, EquipmentSlot, HandEquipment, Potion } from '../../lib/types';

interface EquipmentScreenProps {
  onClose: () => void;
}

const EquipmentScreen: React.FC<EquipmentScreenProps> = ({
  onClose
}) => {
  const { updatePlayerEquipment, updatePlayerInventory, updatePlayerPotions, updatePlayerEquippedPotions } = useGameStateStore();
  const player = getWizard();

  // State for selected item
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [selectedPotion, setSelectedPotion] = useState<Potion | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'hands' | 'heads' | 'bodies' | 'necks' | 'fingers' | 'belts' | 'potions'>('all');
  const [hoveredSlot, setHoveredSlot] = useState<EquipmentSlot | null>(null);

  // Handle equipping an item
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
        setSelectedItem(item);
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

    // Update selected item
    setSelectedItem(item);
  };

  // Handle unequipping an item
  const handleUnequipItem = (slot: EquipmentSlot, isSecondFinger: boolean = false) => {
    if (!player) return;

    // Create new equipment object
    const newEquipment = { ...player.equipment };

    let itemToUnequip: Equipment | undefined;

    if (slot === 'finger' && isSecondFinger) {
      // Handle unequipping the second ring
      itemToUnequip = newEquipment.finger2;
      if (itemToUnequip) {
        delete newEquipment.finger2;
      }
    } else if (slot === 'finger') {
      // Handle unequipping the first ring
      itemToUnequip = newEquipment.finger1;
      if (itemToUnequip) {
        delete newEquipment.finger1;
      }
    } else {
      // Handle other equipment slots
      itemToUnequip = newEquipment[slot];
      if (itemToUnequip) {
        delete newEquipment[slot];
      }
    }

    if (!itemToUnequip) return;

    // Create new inventory array with the unequipped item
    const newInventory = [...player.inventory, itemToUnequip];

    // Update player state
    updatePlayerEquipment(newEquipment);
    updatePlayerInventory(newInventory);

    // Clear selected item if it was the unequipped one
    if (selectedItem && selectedItem.id === itemToUnequip.id) {
      setSelectedItem(null);
    }
  };

  // Handle equipping a potion to the belt
  const handleEquipPotion = (potion: Potion) => {
    if (!player || !player.equipment.belt) return;

    // Calculate available potion slots from belt
    const maxPotionSlots = player.combatStats?.potionSlots || 0;

    // Check if there's room on the belt
    if (player.equippedPotions.length >= maxPotionSlots) {
      // Belt is full, can't equip more potions
      return;
    }

    // Create new potion arrays
    const newEquippedPotions = [...player.equippedPotions, potion];
    const newPotions = player.potions.filter(p => p.id !== potion.id);

    // Update player state
    updatePlayerEquippedPotions(newEquippedPotions);
    updatePlayerPotions(newPotions);

    // Update selected potion
    setSelectedPotion(potion);
  };

  // Handle unequipping a potion from the belt
  const handleUnequipPotion = (potionId: string) => {
    if (!player) return;

    const potionToUnequip = player.equippedPotions.find(p => p.id === potionId);
    if (!potionToUnequip) return;

    // Create new potion arrays
    const newEquippedPotions = player.equippedPotions.filter(p => p.id !== potionId);
    const newPotions = [...player.potions, potionToUnequip];

    // Update player state
    updatePlayerEquippedPotions(newEquippedPotions);
    updatePlayerPotions(newPotions);

    // Clear selected potion if it was the unequipped one
    if (selectedPotion && selectedPotion.id === potionId) {
      setSelectedPotion(null);
    }
  };

  // Filter inventory items by tab
  const filteredInventory = player.inventory.filter(item => {
    if (activeTab === 'all') return true;
    if (activeTab === 'hands') return item.slot === 'hand';
    if (activeTab === 'heads') return item.slot === 'head';
    if (activeTab === 'bodies') return item.slot === 'body';
    if (activeTab === 'necks') return item.slot === 'neck';
    if (activeTab === 'fingers') return item.slot === 'finger';
    if (activeTab === 'belts') return item.slot === 'belt';
    return false;
  });

  // Get item by slot
  const getItemBySlot = (slot: EquipmentSlot, isSecondFinger: boolean = false): Equipment | undefined => {
    if (slot === 'finger' && isSecondFinger) {
      return player.equipment.finger2;
    }
    return player.equipment[slot];
  };

  // Check if an item is equipped
  const isItemEquipped = (item: Equipment): boolean => {
    if (item.slot === 'finger') {
      const finger1 = player.equipment.finger1;
      const finger2 = player.equipment.finger2;
      return (finger1 && finger1.id === item.id) || (finger2 && finger2.id === item.id);
    }
    const equippedItem = player.equipment[item.slot];
    return equippedItem ? equippedItem.id === item.id : false;
  };

  // Render a single equipment slot
  const renderEquipmentSlot = (slot: EquipmentSlot, label: string, isSecondFinger: boolean = false) => {
    const item = getItemBySlot(slot, isSecondFinger);
    const isHovered = hoveredSlot === slot && (!isSecondFinger || (isSecondFinger && slot === 'finger'));

    const slotDisplayName = isSecondFinger ? 'Ring 2' : label;

    return (
      <div
        className={`equipment-slot ${item ? 'equipment-slot--filled' : 'equipment-slot--empty'} ${isHovered ? 'equipment-slot--hovered' : ''}`}
        onClick={() => item && setSelectedItem(item)}
        onMouseEnter={() => setHoveredSlot(slot)}
        onMouseLeave={() => setHoveredSlot(null)}
      >
        <div className="equipment-slot__label">{slotDisplayName}</div>
        <div className="equipment-slot__item">
          {item ? (
            <>
              <span className={`equipment-slot__name text-${getRarityColor(item.rarity)}`}>
                {item.name}
              </span>
              <button
                className="equipment-slot__unequip"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnequipItem(slot, isSecondFinger);
                }}
              >
                X
              </button>
            </>
          ) : (
            <span className="equipment-slot__empty-text">Empty</span>
          )}
        </div>
      </div>
    );
  };

  // Render potion slots
  const renderPotionSlots = () => {
    const maxPotionSlots = player.combatStats?.potionSlots || 0;
    const equippedPotions = player.equippedPotions || [];

    // If no belt is equipped, show a message
    if (!player.equipment.belt) {
      return (
        <div className="potion-slots potion-slots--empty">
          <div className="potion-slots__message">Equip a belt to use potions</div>
        </div>
      );
    }

    // Render slots based on belt capacity
    return (
      <div className="potion-slots">
        <div className="potion-slots__label">Potion Belt ({equippedPotions.length}/{maxPotionSlots})</div>
        <div className="potion-slots__container">
          {equippedPotions.map((potion, index) => (
            <div
              key={potion.id}
              className={`potion-slot potion-slot--${potion.type}`}
              onClick={() => setSelectedPotion(potion)}
            >
              <span className={`potion-slot__name text-${getRarityColor(potion.rarity)}`}>
                {potion.name}
              </span>
              <button
                className="potion-slot__unequip"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnequipPotion(potion.id);
                }}
              >
                X
              </button>
            </div>
          ))}

          {/* Empty slots */}
          {Array.from({ length: maxPotionSlots - equippedPotions.length }).map((_, index) => (
            <div key={`empty-${index}`} className="potion-slot potion-slot--empty">
              <span className="potion-slot__empty-text">Empty</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render the item card
  const renderItemCard = (item: Equipment) => {
    const equipped = isItemEquipped(item);

    return (
      <div
        className={`equipment-card ${equipped ? 'equipment-card--equipped' : ''}`}
        onClick={() => setSelectedItem(item)}
      >
        <div className="equipment-card__header">
          <span className={`equipment-card__name text-${getRarityColor(item.rarity)}`}>
            {item.name}
          </span>
          <span className="equipment-card__slot">{getSlotDisplayName(item.slot)}</span>
          {item.type && <span className="equipment-card__type">{item.type}</span>}
        </div>

        <div className="equipment-card__bonuses">
          {Object.entries(item.bonuses).map(([key, value]) => {
            if (!value) return null;
            return (
              <div key={key} className="equipment-card__bonus">
                {formatBonusName(key)}: {formatBonusValue(key, value)}
              </div>
            );
          })}
        </div>

        <div className="equipment-card__footer">
          <span className="equipment-card__rarity">{item.rarity}</span>
          {!equipped && (
            <button
              className="equipment-card__action"
              onClick={(e) => {
                e.stopPropagation();
                handleEquipItem(item);
              }}
            >
              Equip
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render a potion card
  const renderPotionCard = (potion: Potion) => {
    const isEquipped = player.equippedPotions.some(p => p.id === potion.id);
    const maxPotionSlots = player.combatStats?.potionSlots || 0;
    const canEquip = !isEquipped && player.equippedPotions.length < maxPotionSlots && player.equipment.belt;

    return (
      <div
        className={`potion-card potion-card--${potion.type} ${isEquipped ? 'potion-card--equipped' : ''}`}
        onClick={() => setSelectedPotion(potion)}
      >
        <div className="potion-card__header">
          <span className={`potion-card__name text-${getRarityColor(potion.rarity)}`}>
            {potion.name}
          </span>
          <span className="potion-card__type">{getPotionTypeDisplayName(potion.type)}</span>
        </div>

        <div className="potion-card__effect">
          Effect: {potion.effect.value} {potion.effect.duration ? `(${potion.effect.duration} turns)` : ''}
        </div>

        <div className="potion-card__description">
          {potion.description}
        </div>

        <div className="potion-card__footer">
          <span className="potion-card__rarity">{potion.rarity}</span>
          {canEquip && (
            <button
              className="potion-card__action"
              onClick={(e) => {
                e.stopPropagation();
                handleEquipPotion(potion);
              }}
            >
              Equip
            </button>
          )}
        </div>
      </div>
    );
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

  // Get display name for equipment slot
  const getSlotDisplayName = (slot: EquipmentSlot): string => {
    switch (slot) {
      case 'head': return 'Head';
      case 'hand': return 'Weapon';
      case 'body': return 'Robe';
      case 'neck': return 'Amulet';
      case 'finger': return 'Ring';
      case 'belt': return 'Belt';
      default: return slot;
    }
  };

  // Get display name for potion type
  const getPotionTypeDisplayName = (type: string): string => {
    switch (type) {
      case 'health': return 'Health Potion';
      case 'mana': return 'Mana Potion';
      case 'strength': return 'Strength Potion';
      case 'protection': return 'Protection Potion';
      case 'elemental': return 'Elemental Potion';
      case 'luck': return 'Luck Potion';
      default: return type;
    }
  };

  // Format bonus name
  const formatBonusName = (key: string): string => {
    switch (key) {
      case 'spellPower': return 'Spell Power';
      case 'spellCritChance': return 'Spell Crit Chance';
      case 'healingPower': return 'Healing Power';
      case 'manaCostReduction': return 'Mana Cost Reduction';
      case 'maxMana': return 'Max Mana';
      case 'maxHealth': return 'Max Health';
      case 'manaRegen': return 'Mana Regen';
      case 'healthRegen': return 'Health Regen';
      case 'damageReduction': return 'Damage Reduction';
      case 'elementalResistance': return 'Elemental Resistance';
      case 'luckBonus': return 'Luck Bonus';
      case 'mysticPunchPower': return 'Mystic Punch Power';
      case 'bleedEffect': return 'Bleed Effect';
      case 'extraCardDraw': return 'Extra Card Draw';
      case 'discardAndDraw': return 'Discard and Draw';
      case 'potionSlots': return 'Potion Slots';
      default: return key.replace(/([A-Z])/g, ' $1').trim();
    }
  };

  // Format bonus value
  const formatBonusValue = (key: string, value: any): string => {
    if (key === 'spellCritChance' || key === 'manaCostReduction') {
      return `${value}%`;
    }

    if (key === 'elementalResistance' && typeof value === 'object') {
      return Object.entries(value)
        .filter(([_, val]) => val)
        .map(([element, val]) => `${element}: ${val}%`)
        .join(', ');
    }

    if (key === 'discardAndDraw') {
      return value ? 'Yes' : 'No';
    }

    return `${value}`;
  };

  return (
    <div className="equipment-screen">
      <div className="equipment-screen__header">
        <h2 className="equipment-screen__title">Equipment</h2>
        <button className="equipment-screen__back" onClick={onClose}>
          Back to Study
        </button>
      </div>

      <div className="equipment-screen__content">
        <div className="equipment-screen__equipped-area">
          <h3 className="equipment-screen__subtitle">Equipped Items</h3>
          <div className="equipment-slots">
            {renderEquipmentSlot('head', 'Hat')}
            {renderEquipmentSlot('hand', 'Weapon')}
            {renderEquipmentSlot('body', 'Robe')}
            {renderEquipmentSlot('neck', 'Amulet')}
            {renderEquipmentSlot('finger', 'Ring 1')}
            {renderEquipmentSlot('finger', 'Ring 2', true)}
            {renderEquipmentSlot('belt', 'Belt')}
          </div>

          {/* Potion Slots */}
          {renderPotionSlots()}
        </div>

        <div className="equipment-screen__detail-area">
          {selectedItem ? (
            <div className="equipment-detail">
              <h3 className={`equipment-detail__name text-${getRarityColor(selectedItem.rarity)}`}>
                {selectedItem.name}
              </h3>
              <div className="equipment-detail__type">
                {getSlotDisplayName(selectedItem.slot)}
                {selectedItem.type && ` - ${selectedItem.type}`}
              </div>

              <h4 className="equipment-detail__subtitle">Properties</h4>
              <ul className="equipment-detail__list">
                {Object.entries(selectedItem.bonuses).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <li key={key} className="equipment-detail__bonus">
                      {formatBonusName(key)}: {formatBonusValue(key, value)}
                    </li>
                  );
                })}
              </ul>

              <div className="equipment-detail__description">
                {selectedItem.description}
              </div>

              <div className="equipment-detail__actions">
                {isItemEquipped(selectedItem) ? (
                  <button
                    className="equipment-detail__action equipment-detail__action--unequip"
                    onClick={() => {
                      // Determine if it's finger1 or finger2 for rings
                      if (selectedItem.slot === 'finger') {
                        const finger1 = player.equipment.finger1;
                        if (finger1 && finger1.id === selectedItem.id) {
                          handleUnequipItem('finger', false);
                        } else {
                          handleUnequipItem('finger', true);
                        }
                      } else {
                        handleUnequipItem(selectedItem.slot);
                      }
                    }}
                  >
                    Unequip
                  </button>
                ) : (
                  <button
                    className="equipment-detail__action equipment-detail__action--equip"
                    onClick={() => handleEquipItem(selectedItem)}
                  >
                    Equip
                  </button>
                )}
              </div>
            </div>
          ) : selectedPotion ? (
            <div className="potion-detail">
              <h3 className={`potion-detail__name text-${getRarityColor(selectedPotion.rarity)}`}>
                {selectedPotion.name}
              </h3>
              <div className="potion-detail__type">
                {getPotionTypeDisplayName(selectedPotion.type)}
              </div>

              <div className="potion-detail__effect">
                Effect: {selectedPotion.effect.value} {selectedPotion.effect.duration ? `(${selectedPotion.effect.duration} turns)` : ''}
              </div>

              <div className="potion-detail__description">
                {selectedPotion.description}
              </div>

              <div className="potion-detail__actions">
                {player.equippedPotions.some(p => p.id === selectedPotion.id) ? (
                  <button
                    className="potion-detail__action potion-detail__action--unequip"
                    onClick={() => handleUnequipPotion(selectedPotion.id)}
                  >
                    Unequip
                  </button>
                ) : (
                  player.equipment.belt && player.equippedPotions.length < (player.combatStats?.potionSlots || 0) && (
                    <button
                      className="potion-detail__action potion-detail__action--equip"
                      onClick={() => handleEquipPotion(selectedPotion)}
                    >
                      Equip
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="equipment-detail equipment-detail--empty">
              Select an item to view details
            </div>
          )}
        </div>

        <div className="equipment-screen__inventory-area">
          <h3 className="equipment-screen__subtitle">Inventory</h3>

          <div className="equipment-screen__tabs">
            <button
              className={`equipment-screen__tab ${activeTab === 'all' ? 'equipment-screen__tab--active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All
            </button>
            <button
              className={`equipment-screen__tab ${activeTab === 'hands' ? 'equipment-screen__tab--active' : ''}`}
              onClick={() => setActiveTab('hands')}
            >
              Weapons
            </button>
            <button
              className={`equipment-screen__tab ${activeTab === 'heads' ? 'equipment-screen__tab--active' : ''}`}
              onClick={() => setActiveTab('heads')}
            >
              Hats
            </button>
            <button
              className={`equipment-screen__tab ${activeTab === 'bodies' ? 'equipment-screen__tab--active' : ''}`}
              onClick={() => setActiveTab('bodies')}
            >
              Robes
            </button>
            <button
              className={`equipment-screen__tab ${activeTab === 'necks' ? 'equipment-screen__tab--active' : ''}`}
              onClick={() => setActiveTab('necks')}
            >
              Amulets
            </button>
            <button
              className={`equipment-screen__tab ${activeTab === 'fingers' ? 'equipment-screen__tab--active' : ''}`}
              onClick={() => setActiveTab('fingers')}
            >
              Rings
            </button>
            <button
              className={`equipment-screen__tab ${activeTab === 'belts' ? 'equipment-screen__tab--active' : ''}`}
              onClick={() => setActiveTab('belts')}
            >
              Belts
            </button>
            <button
              className={`equipment-screen__tab ${activeTab === 'potions' ? 'equipment-screen__tab--active' : ''}`}
              onClick={() => setActiveTab('potions')}
            >
              Potions
            </button>
          </div>

          <div className="equipment-screen__items">
            {activeTab === 'potions' ? (
              // Render potions grid
              <div className="potion-grid">
                {player.potions.length > 0 ? (
                  player.potions.map(potion => (
                    <React.Fragment key={potion.id}>
                      {renderPotionCard(potion)}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="potion-grid__empty">
                    No potions in inventory
                  </div>
                )}
              </div>
            ) : (
              // Render equipment grid
              <div className="equipment-grid">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map(item => (
                    <React.Fragment key={item.id}>
                      {renderItemCard(item)}
                    </React.Fragment>
                  ))
                ) : (
                  <div className="equipment-grid__empty">
                    No items in inventory
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentScreen;
