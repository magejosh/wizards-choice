'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStateStore } from '../../game-state/gameStateStore';
import { MarketLocation, MarketItem, Ingredient, Potion, Equipment, IngredientRarity, Wizard } from '../../types';
import styles from '../styles/MarketUI.module.css';

const RARITY_COLORS = {
  common: '#c0c0c0',
  uncommon: '#00cc00',
  rare: '#0088ff',
  epic: '#cc00ff',
  legendary: '#ffaa00'
};

interface MarketUIProps {
  onClose: () => void;
}

export const MarketUI: React.FC<MarketUIProps> = ({ onClose }) => {
  const router = useRouter();
  const { 
    getMarkets, 
    getMarketById, 
    getPlayerGold, 
    visitMarket, 
    refreshMarket,
    buyItem,
    sellItem,
    checkForMarketAttack,
    handleMarketAttackResult,
    setCurrentLocation
  } = useGameStateStore();
  
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'ingredients' | 'potions' | 'equipment'>('ingredients');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [showAttackModal, setShowAttackModal] = useState(false);
  const [attacker, setAttacker] = useState<Wizard | null>(null);
  
  const markets = getMarkets();
  const gold = getPlayerGold();
  const selectedMarket = selectedMarketId ? getMarketById(selectedMarketId) : null;
  
  // Choose first market if none selected
  useEffect(() => {
    if (markets.length > 0 && !selectedMarketId) {
      setSelectedMarketId(markets[0].id);
      visitMarket(markets[0].id);
    }
  }, [markets, selectedMarketId, visitMarket]);
  
  // Reset quantity when selecting a new item
  useEffect(() => {
    setQuantity(1);
  }, [selectedItem]);
  
  // Filter markets based on player level
  const availableMarkets = markets.filter(
    market => market.unlockLevel <= useGameStateStore().gameState.player.level
  );
  
  // Get relevant inventory based on selected tab
  const getInventory = () => {
    if (!selectedMarket) return [];
    
    switch (selectedTab) {
      case 'ingredients':
        return selectedMarket.inventory.ingredients;
      case 'potions':
        return selectedMarket.inventory.potions;
      case 'equipment':
        return selectedMarket.inventory.equipment;
      default:
        return [];
    }
  };
  
  // Filter inventory items based on search term
  const filteredInventory = getInventory().filter(item => 
    item.item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle market selection
  const handleMarketChange = (marketId: string) => {
    setSelectedMarketId(marketId);
    visitMarket(marketId);
    setSelectedItem(null);
  };
  
  // Handle buying items
  const handleBuy = () => {
    if (!selectedMarket || !selectedItem) return;
    
    const result = buyItem(
      selectedMarket.id,
      selectedTab === 'ingredients' ? 'ingredient' : 
      selectedTab === 'potions' ? 'potion' : 'equipment',
      selectedItem.item.id,
      quantity
    );
    
    setMessage(result.message);
    
    // Reset selection after successful purchase
    if (result.success) {
      setTimeout(() => {
        setSelectedItem(null);
        setMessage('');
      }, 2000);
    }
  };
  
  // Handle selling items
  const handleSell = () => {
    if (!selectedMarket || !selectedItem) return;
    
    const result = sellItem(
      selectedMarket.id,
      selectedTab === 'ingredients' ? 'ingredient' : 
      selectedTab === 'potions' ? 'potion' : 'equipment',
      selectedItem.id,
      quantity
    );
    
    setMessage(result.message);
    
    // Reset selection after successful sale
    if (result.success) {
      setTimeout(() => {
        setSelectedItem(null);
        setMessage('');
      }, 2000);
    }
  };
  
  // Get player's inventory based on selected tab
  const getPlayerInventory = () => {
    const gameState = useGameStateStore().gameState;
    
    switch (selectedTab) {
      case 'ingredients':
        return gameState.player.ingredients || [];
      case 'potions':
        return gameState.player.potions || [];
      case 'equipment':
        return gameState.player.inventory || [];
      default:
        return [];
    }
  };
  
  // Filter player inventory based on search term
  const filteredPlayerInventory = getPlayerInventory().filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Render item card based on type
  const renderItemCard = (item: MarketItem<any> | any, isBuyMode: boolean) => {
    const itemData = isBuyMode ? item.item : item;
    const rarity = itemData.rarity as IngredientRarity;
    const rarityColor = RARITY_COLORS[rarity] || RARITY_COLORS.common;
    
    const isSelected = selectedItem && (
      (isBuyMode && selectedItem.item.id === itemData.id) || 
      (!isBuyMode && selectedItem.id === itemData.id)
    );
    
    const handleCardClick = () => {
      setSelectedItem(isBuyMode ? item : itemData);
    };
    
    return (
      <div 
        key={itemData.id} 
        className={`${styles.itemCard} ${isSelected ? styles.selectedCard : ''}`}
        style={{ borderColor: rarityColor }}
        onClick={handleCardClick}
      >
        <div className={styles.itemHeader} style={{ backgroundColor: rarityColor }}>
          <h4>{itemData.name}</h4>
          <span className={styles.rarityBadge}>{rarity}</span>
        </div>
        
        <div className={styles.itemDetails}>
          <p>{itemData.description}</p>
          
          {selectedTab === 'ingredients' && (
            <div className={styles.itemProperties}>
              <span>Category: {itemData.category}</span>
              <span>Properties: {(itemData.properties || []).join(', ')}</span>
            </div>
          )}
          
          {selectedTab === 'equipment' && (
            <div className={styles.itemProperties}>
              <span>Slot: {itemData.slot}</span>
              <span>Bonuses: 
                {itemData.bonuses.map((bonus: any, index: number) => 
                  <span key={index}>{bonus.stat}: +{bonus.value}</span>
                )}
              </span>
            </div>
          )}
          
          {selectedTab === 'potions' && (
            <div className={styles.itemProperties}>
              <span>Type: {itemData.type}</span>
              <span>Effect: {itemData.effect.value} {itemData.effect.duration ? `for ${itemData.effect.duration} turns` : ''}</span>
            </div>
          )}
          
          {isBuyMode && (
            <div className={styles.marketData}>
              <span className={styles.price}>Price: {item.currentPrice} gold</span>
              <span className={styles.quantity}>Quantity: {item.quantity}</span>
              <span className={styles.supplyDemand}>
                Supply: {item.supply} | Demand: {item.demand}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Format gold with commas
  const formatGold = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Handle quantity changes
  const incrementQuantity = () => {
    if (mode === 'buy' && selectedItem) {
      // Don't exceed available quantity when buying
      setQuantity(prev => Math.min(prev + 1, selectedItem.quantity));
    } else {
      // When selling, don't exceed player inventory count
      const playerItems = getPlayerInventory();
      const itemCount = playerItems.filter(item => item.id === selectedItem?.id).length;
      setQuantity(prev => Math.min(prev + 1, itemCount));
    }
  };
  
  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };
  
  // Handle closing the market with possible attack
  const handleMarketClose = () => {
    if (!selectedMarketId) {
      onClose();
      return;
    }
    
    // Check for possible market attack
    const attackResult = checkForMarketAttack(selectedMarketId);
    
    if (attackResult.attacked && attackResult.attacker) {
      // Show attack modal if an attack occurs
      setAttacker(attackResult.attacker);
      setShowAttackModal(true);
    } else {
      // No attack, close normally
      onClose();
    }
  };
  
  // Handle accepting the duel with the market attacker
  const handleAcceptDuel = () => {
    if (!attacker) return;
    
    // Store attacker in sessionStorage so it can be retrieved on battle page
    sessionStorage.setItem('marketAttacker', JSON.stringify(attacker));
    
    // Redirect to battle page
    setCurrentLocation('duel');
    setShowAttackModal(false);
    router.push('/battle?source=market');
  };
  
  // Handle fleeing from the market attacker
  const handleFlee = () => {
    if (!attacker) return;
    
    // 50% chance to escape successfully
    if (Math.random() < 0.5) {
      setMessage("You managed to escape!");
      setTimeout(() => {
        setShowAttackModal(false);
        onClose();
      }, 1500);
    } else {
      // Failed to flee - lose some gold
      const result = handleMarketAttackResult('lose', attacker);
      setMessage(result.message);
      setTimeout(() => {
        setShowAttackModal(false);
        onClose();
      }, 2000);
    }
  };
  
  // Calculate total price
  const totalPrice = selectedItem 
    ? (mode === 'buy' ? selectedItem.currentPrice : selectedItem.value || 0) * quantity
    : 0;
  
  return (
    <div className={styles.marketContainer}>
      <div className={styles.marketHeader}>
        <h2>Marketplace</h2>
        <span className={styles.goldAmount}>Your Gold: {formatGold(gold)}</span>
        <button className={styles.closeButton} onClick={handleMarketClose}>Close</button>
      </div>
      
      <div className={styles.marketControls}>
        <div className={styles.marketSelect}>
          <label htmlFor="market-select">Select Market:</label>
          <select 
            id="market-select" 
            value={selectedMarketId || ''}
            onChange={(e) => handleMarketChange(e.target.value)}
          >
            {availableMarkets.map(market => (
              <option key={market.id} value={market.id}>
                {market.name} (Level {market.unlockLevel})
              </option>
            ))}
          </select>
        </div>
        
        {selectedMarket && (
          <div className={styles.marketInfo}>
            <p>{selectedMarket.description}</p>
            <button 
              className={styles.refreshButton}
              onClick={() => refreshMarket(selectedMarket.id)}
            >
              Refresh Inventory
            </button>
          </div>
        )}
      </div>
      
      <div className={styles.tabContainer}>
        <button 
          className={`${styles.tabButton} ${selectedTab === 'ingredients' ? styles.activeTab : ''}`}
          onClick={() => setSelectedTab('ingredients')}
        >
          Ingredients
        </button>
        <button 
          className={`${styles.tabButton} ${selectedTab === 'potions' ? styles.activeTab : ''}`}
          onClick={() => setSelectedTab('potions')}
        >
          Potions
        </button>
        <button 
          className={`${styles.tabButton} ${selectedTab === 'equipment' ? styles.activeTab : ''}`}
          onClick={() => setSelectedTab('equipment')}
        >
          Equipment
        </button>
      </div>
      
      <div className={styles.modeToggle}>
        <button 
          className={`${styles.modeButton} ${mode === 'buy' ? styles.activeMode : ''}`}
          onClick={() => setMode('buy')}
        >
          Buy
        </button>
        <button 
          className={`${styles.modeButton} ${mode === 'sell' ? styles.activeMode : ''}`}
          onClick={() => setMode('sell')}
        >
          Sell
        </button>
      </div>
      
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder={`Search ${selectedTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className={styles.marketContent}>
        <div className={styles.itemList}>
          {mode === 'buy' ? (
            filteredInventory.length > 0 ? (
              filteredInventory.map(item => renderItemCard(item, true))
            ) : (
              <p className={styles.emptyMessage}>No items available in this category.</p>
            )
          ) : (
            filteredPlayerInventory.length > 0 ? (
              filteredPlayerInventory.map(item => renderItemCard(item, false))
            ) : (
              <p className={styles.emptyMessage}>You don't have any items in this category.</p>
            )
          )}
        </div>
        
        {selectedItem && (
          <div className={styles.transactionPanel}>
            <h3>{mode === 'buy' ? 'Buy' : 'Sell'} Item</h3>
            <h4>{mode === 'buy' ? selectedItem.item.name : selectedItem.name}</h4>
            
            <div className={styles.quantitySelector}>
              <label>Quantity:</label>
              <div className={styles.quantityControls}>
                <button onClick={decrementQuantity}>-</button>
                <span>{quantity}</span>
                <button onClick={incrementQuantity}>+</button>
              </div>
            </div>
            
            <div className={styles.priceCalculation}>
              <span>Price per item: {mode === 'buy' ? selectedItem.currentPrice : (selectedItem.value || 0)} gold</span>
              <span>Total: {totalPrice} gold</span>
            </div>
            
            <button 
              className={styles.transactionButton}
              onClick={mode === 'buy' ? handleBuy : handleSell}
              disabled={mode === 'buy' ? gold < totalPrice : false}
            >
              {mode === 'buy' ? 'Buy' : 'Sell'}
            </button>
            
            {message && (
              <div className={styles.transactionMessage}>
                {message}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Market Attack Modal */}
      {showAttackModal && attacker && (
        <div className={styles.modalOverlay}>
          <div className={styles.attackModal}>
            <h2>Market Ambush!</h2>
            <p>As you leave the market, you are ambushed by a {attacker.name}!</p>
            <p>They demand your gold and valuable ingredients.</p>
            
            <div className={styles.attackModalButtons}>
              <button 
                className={styles.duelButton}
                onClick={handleAcceptDuel}
              >
                Fight!
              </button>
              <button 
                className={styles.fleeButton}
                onClick={handleFlee}
              >
                Try to Flee (50% chance)
              </button>
            </div>
            
            {message && (
              <div className={styles.modalMessage}>
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 