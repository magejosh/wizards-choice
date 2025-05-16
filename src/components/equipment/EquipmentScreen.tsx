'use client';

import React, { useState, useEffect } from 'react';
import { useGameStateStore } from '../../lib/game-state/gameStateStore';
import { getWizard } from '../../lib/game-state/gameStateStore';
import { Equipment, EquipmentSlot, HandEquipment, Potion } from '../../lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';

interface EquipmentScreenProps {
  onClose: () => void;
}

const EquipmentScreen: React.FC<EquipmentScreenProps> = ({
  onClose
}) => {
  // Get the wizard object directly to avoid store structure issues
  const player = getWizard();
  const { updatePlayerEquipment, updatePlayerInventory, updatePlayerPotions, updatePlayerEquippedPotions } = useGameStateStore();

  // Early return or loading state if player data is not yet available
  if (!player) {
    return <div>Loading player data...</div>; // Or some other loading indicator
  }

  // Helper to deduplicate by id, keeping first occurrence
  const deduplicateById = <T extends { id: string }>(arr: T[]): T[] => {
    const seen = new Set<string>();
    const deduped: T[] = [];
    for (const item of arr) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        deduped.push(item);
      }
    }
    return deduped;
  };

  // Memoized unique potion arrays for rendering
  const uniqueEquippedPotions: Potion[] = React.useMemo(() => deduplicateById<Potion>(player.equippedPotions || []), [player.equippedPotions]);

  const uniqueInventoryPotions: Potion[] = React.useMemo(() => {
    const equippedIds = new Set(uniqueEquippedPotions.map(p => p.id));
    return deduplicateById<Potion>((player.potions || []).filter(p => !equippedIds.has(p.id)));
  }, [player.potions, uniqueEquippedPotions]);

  // State for selected item
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [selectedPotion, setSelectedPotion] = useState<Potion | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'hands' | 'heads' | 'bodies' | 'necks' | 'fingers' | 'belts' | 'potions'>('all');
  const [hoveredSlot, setHoveredSlot] = useState<EquipmentSlot | null>(null);

  // Handle equipping an item
  const handleEquipItem = (item: Equipment) => {
    if (!player) return;
    // Use the updated equipItem from the store, which now handles slot overwriting and inventory updates
    useGameStateStore.getState().equipItem(item);
    setSelectedItem(item);
  };

  // Handle unequipping an item
  const handleUnequipItem = (slot: EquipmentSlot, isSecondFinger: boolean = false) => {
    if (!player) return;
    // Use the updated unequipItem from the store, which now supports isSecondFinger for rings
    useGameStateStore.getState().unequipItem(slot, isSecondFinger);
    // Clear selected item if it was the unequipped one
    if (selectedItem && ((slot === 'finger' && selectedItem.slot === 'finger') || selectedItem.slot === slot)) {
      setSelectedItem(null);
    }
  };

  // Function to safely get potions with no duplicates
  const getSafePotions = () => {
    if (!player || !player.potions) return [];
    
    // Map to track seen IDs
    const seenIds = new Map();
    const result = [];
    
    for (const potion of player.potions) {
      if (!seenIds.has(potion.id)) {
        seenIds.set(potion.id, true);
        result.push(potion);
      } else {
        console.warn(`Duplicate potion ID found and filtered: ${potion.id}`);
      }
    }
    
    return result;
  };
  
  // Function to safely get equipped potions with no duplicates
  const getSafeEquippedPotions = () => {
    if (!player || !player.equippedPotions) return [];
    
    // Map to track seen IDs
    const seenIds = new Map();
    const result = [];
    
    for (const potion of player.equippedPotions) {
      if (!seenIds.has(potion.id)) {
        seenIds.set(potion.id, true);
        result.push(potion);
      } else {
        console.warn(`Duplicate equipped potion ID found and filtered: ${potion.id}`);
      }
    }
    
    return result;
  };

  // Handle equipping a potion to the belt
  const handleEquipPotion = (potion: Potion) => {
    if (!player || !player.equipment.belt) return;

    // Calculate available potion slots from belt
    const maxPotionSlots = player.combatStats?.potionSlots || 0;

    // Check if there's room on the belt
    if ((player.equippedPotions || []).length >= maxPotionSlots) {
      // Belt is full, can't equip more potions
      return;
    }

    // Create new potion arrays
    const newEquippedPotions = [...(player.equippedPotions || []), potion];
    const newPotions = (player.potions || []).filter(p => p.id !== potion.id);

    // Update player state
    updatePlayerEquippedPotions(newEquippedPotions);
    updatePlayerPotions(newPotions);

    // Update selected potion
    setSelectedPotion(potion);
  };

  // Handle unequipping a potion from the belt
  const handleUnequipPotion = (potionId: string) => {
    if (!player) return;

    const potionToUnequip = (player.equippedPotions || []).find(p => p.id === potionId);
    if (!potionToUnequip) return;

    // Create new potion arrays
    const newEquippedPotions = (player.equippedPotions || []).filter(p => p.id !== potionId);
    const newPotions = [...(player.potions || []), potionToUnequip];

    // Update player state
    updatePlayerEquippedPotions(newEquippedPotions);
    updatePlayerPotions(newPotions);

    // Clear selected potion if it was the unequipped one
    if (selectedPotion && selectedPotion.id === potionId) {
      setSelectedPotion(null);
    }
  };

  // Filter inventory items by tab
  const filteredInventory = (player.inventory || []).filter(item => {
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

  // Utility: get image for equipment
  const getEquipmentImage = (item: Equipment): string => {
    if (item.imagePath) return item.imagePath;
    // fallback by slot/type
    switch (item.slot) {
      case 'head': return '/images/equipment/head.png';
      case 'hand':
        if (item.type === 'wand') return '/images/equipment/wand.png';
        if (item.type === 'staff') return '/images/equipment/staff.png';
        if (item.type === 'dagger') return '/images/equipment/dagger.png';
        if (item.type === 'spellbook') return '/images/equipment/spellbook.png';
        return '/images/equipment/hand.png';
      case 'body': return '/images/equipment/robe.png';
      case 'neck': return '/images/equipment/amulet.png';
      case 'finger': return '/images/equipment/ring.png';
      case 'belt': return '/images/equipment/belt.png';
      default: return '/images/equipment/default.png';
    }
  };

  // Utility: render icons for slot-specific features
  const renderSlotIcons = (item: Equipment) => {
    return (
      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        {item.bonuses?.find(b => b.stat === 'scrollSlots') && (
          <span title="Scroll Slots" role="img" aria-label="Scroll Slots">📜 x{item.bonuses.find(b => b.stat === 'scrollSlots')?.value}</span>
        )}
        {item.bonuses?.find(b => b.stat === 'potionSlots') && (
          <span title="Potion Slots" role="img" aria-label="Potion Slots">🧪 x{item.bonuses.find(b => b.stat === 'potionSlots')?.value}</span>
        )}
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

  // Restore renderEquipmentSlot for equipped items area
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
              <span className={`equipment-slot__name text-${getRarityColor(item.rarity)}`}>{item.name}</span>
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

  // Refactored renderItemCard
  const renderItemCard = (item: Equipment) => {
    const equipped = isItemEquipped(item);
    return (
      <Card className={`equipment-card ${equipped ? 'equipment-card--equipped' : ''}`} tabIndex={0} aria-label={item.name}>
        <CardHeader className="equipment-card__header">
          <CardTitle className={`equipment-card__name text-${getRarityColor(item.rarity)}`}>{item.name}</CardTitle>
          <span className="equipment-card__slot">{getSlotDisplayName(item.slot)}{item.type ? ` – ${item.type}` : ''}</span>
        </CardHeader>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
          <img src={getEquipmentImage(item)} alt={item.name} style={{ width: 64, height: 64, objectFit: 'contain' }} />
          {renderSlotIcons(item)}
        </div>
        <CardContent className="equipment-card__bonuses">
          {item.bonuses && item.bonuses.length > 0 ? (
            item.bonuses.map((bonus, idx) => {
              const bonusKey = bonus.stat || (bonus as any).type;
              if (!bonusKey) {
                return (
                  <div key={idx} className="equipment-card__bonus">
                    Unknown Bonus
                  </div>
                );
              }
              return (
                <div key={idx} className="equipment-card__bonus">
                  {formatBonusName(bonusKey)}: {formatBonusValue(bonusKey, bonus.value)}
                  {bonus.element && ` (${bonus.element})`}
                </div>
              );
            })
          ) : (
            <div className="equipment-card__bonus">No bonuses</div>
          )}
        </CardContent>
        <CardDescription className="equipment-card__description">
          {item.description}
        </CardDescription>
        <CardFooter className="equipment-card__footer">
          <span className="equipment-card__rarity">{item.rarity}</span>
          {!equipped && (
            <button
              className="equipment-card__action"
              onClick={e => { e.stopPropagation(); handleEquipItem(item); }}
            >Equip</button>
          )}
        </CardFooter>
      </Card>
    );
  };

  // Render potion slots
  const renderPotionSlots = () => {
    const maxPotionSlots = player.combatStats?.potionSlots || 0;
    // Get deduplicated equipped potions
    const equippedPotions = getSafeEquippedPotions();

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
          {equippedPotions.map((potion) => (
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

  // Refactored equipment detail view
  const renderItemDetail = (item: Equipment) => {
    const equipped = isItemEquipped(item);
    return (
      <Card className="equipment-detail" tabIndex={0} aria-label={item.name}>
        <CardHeader>
          <CardTitle className={`equipment-detail__name text-${getRarityColor(item.rarity)}`}>{item.name}</CardTitle>
          <div className="equipment-detail__type">{getSlotDisplayName(item.slot)}{item.type ? ` – ${item.type}` : ''}</div>
        </CardHeader>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
          <img src={getEquipmentImage(item)} alt={item.name} style={{ width: 96, height: 96, objectFit: 'contain' }} />
          {renderSlotIcons(item)}
        </div>
        <CardContent>
          <h4 className="equipment-detail__subtitle">Properties</h4>
          <ul className="equipment-detail__list">
            {selectedItem.bonuses && selectedItem.bonuses.length > 0 ? (
              selectedItem.bonuses.map((bonus, idx) => {
                const bonusKey = bonus.stat || (bonus as any).type;
                if (!bonusKey) {
                  return (
                    <li key={idx} className="equipment-detail__bonus">
                      Unknown Bonus
                    </li>
                  );
                }
                return (
                  <li key={idx} className="equipment-detail__bonus">
                    {formatBonusName(bonusKey)}: {formatBonusValue(bonusKey, bonus.value)}
                    {bonus.element && ` (${bonus.element})`}
                  </li>
                );
              })
            ) : (
              <li className="equipment-detail__bonus">No bonuses</li>
            )}
          </ul>
          <div className="equipment-detail__description">{item.description}</div>
        </CardContent>
        <CardFooter className="equipment-detail__actions">
          {isItemEquipped(item) ? (
            <button
              className="equipment-detail__action equipment-detail__action--unequip"
              onClick={() => {
                if (item.slot === 'finger') {
                  const finger1 = player.equipment.finger1;
                  if (finger1 && finger1.id === item.id) {
                    handleUnequipItem('finger', false);
                  } else {
                    handleUnequipItem('finger', true);
                  }
                } else {
                  handleUnequipItem(item.slot);
                }
              }}
            >Unequip</button>
          ) : (
            <button
              className="equipment-detail__action equipment-detail__action--equip"
              onClick={() => handleEquipItem(item)}
            >Equip</button>
          )}
        </CardFooter>
      </Card>
    );
  };

  // Render a potion card
  const renderPotionCard = (potion: Potion) => {
    const isEquipped = getSafeEquippedPotions().some(p => p.id === potion.id);
    const maxPotionSlots = player.combatStats?.potionSlots || 0;
    const canEquip = !isEquipped && getSafeEquippedPotions().length < maxPotionSlots && player.equipment.belt;

    return (
      <div
        key={potion.id}
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

  // Deduplicate potions and equippedPotions by id on mount
  useEffect(() => {
    if (!player) return;
    const dedupedPotions = deduplicateById<Potion>(player.potions || []);
    const dedupedEquipped = deduplicateById<Potion>(player.equippedPotions || []);
    let changed = false;
    if (dedupedPotions.length !== (player.potions || []).length) changed = true;
    if (dedupedEquipped.length !== (player.equippedPotions || []).length) changed = true;
    if (changed) {
      updatePlayerPotions(dedupedPotions);
      updatePlayerEquippedPotions(dedupedEquipped);
      // Optionally log for debugging
      console.log('[EquipmentScreen] Duplicate potion IDs found and removed.');
    }
  }, [player, updatePlayerPotions, updatePlayerEquippedPotions]);

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
            renderItemDetail(selectedItem)
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
                {getSafeEquippedPotions().some(p => p.id === selectedPotion.id) ? (
                  <button
                    className="potion-detail__action potion-detail__action--unequip"
                    onClick={() => handleUnequipPotion(selectedPotion.id)}
                  >
                    Unequip
                  </button>
                ) : (
                  player.equipment.belt && getSafeEquippedPotions().length < (player.combatStats?.potionSlots || 0) && (
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
              // Render potions grid with direct JSX to avoid key issues
              <div className="potion-grid">
                {function renderPotions() {
                  if (!player || !player.potions || player.potions.length === 0) {
                    return <div className="potion-grid__empty">No potions in inventory</div>;
                  }
                  
                  // Create a safe list without duplicates
                  const uniquePotions = [];
                  const seenIds = new Set();
                  
                  for (const p of player.potions) {
                    if (!seenIds.has(p.id)) {
                      seenIds.add(p.id);
                      uniquePotions.push(p);
                    }
                  }
                  
                  // Render each potion with index-only keys
                  return uniquePotions.map((potion) => {
                    // Inline the potion card rendering to avoid any potential issues
                    const isEquipped = player.equippedPotions?.some(p => p.id === potion.id) || false;
                    const maxPotionSlots = player.combatStats?.potionSlots || 0;
                    const canEquip = !isEquipped && 
                      player.equippedPotions && 
                      player.equippedPotions.length < maxPotionSlots && 
                      player.equipment?.belt;
                    
                    return (
                      <div
                        key={potion.id}
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
                  });
                }()}
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
