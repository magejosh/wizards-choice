'use client';

import React, { useState, useEffect } from 'react';
import { useGameStateStore, reinitializeMarkets } from '../../game-state/gameStateStore';
import { 
  MarketLocation, 
  MarketItem, 
  Ingredient, 
  Potion, 
  Equipment,
  SpellScroll, 
  Wizard 
} from '../../types';
import ErrorBoundary from './ErrorBoundary';
import styles from '../styles/MarketUI.module.css';

// Main MarketUI component
const MarketUI: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [filteredMarkets, setFilteredMarkets] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('ingredients');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  
  // Game state store functions
  const { 
    getMarkets, 
    getPlayerGold, 
    visitMarket, 
    troubleshootMarkets,
    buyItem
  } = useGameStateStore();
  
  // Get player's gold directly
  const playerGold = getPlayerGold();
  
  // Get player level from the game state
  const playerLevel = useGameStateStore.getState().gameState.player.level || 1;
  
  // State for transaction message
  const [transactionMessage, setTransactionMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  
  // Initialize markets on component mount
  useEffect(() => {
    const initializeMarkets = async () => {
      console.log('Initializing markets');
      setIsLoading(true);
      setError(null);
      
      try {
        // First run troubleshooting to see if markets exist
        const marketStatus = troubleshootMarkets();
        console.log('Market status:', marketStatus);
        
        // If no markets exist, try to reinitialize
        if (!marketStatus.marketsExist || marketStatus.marketCount === 0) {
          console.log('No markets found, reinitializing...');
          const newMarkets = reinitializeMarkets();
          if (newMarkets.length === 0) {
            setError('Failed to initialize markets. Please restart the game.');
            setIsLoading(false);
            return;
          }
        }
        
        // Get all markets
        const allMarkets = getMarkets();
        console.log(`Loaded ${allMarkets.length} markets`);
        
        if (!allMarkets || allMarkets.length === 0) {
          setError('No markets available');
          setIsLoading(false);
          return;
        }
        
        // Filter markets by player level
        const availableMarkets = allMarkets.filter(market => market.unlockLevel <= playerLevel);
        console.log(`Player level: ${playerLevel}, Available markets: ${availableMarkets.length}`);
        
        if (availableMarkets.length === 0) {
          setError('No markets available for your level');
          setIsLoading(false);
          return;
        }
        
        // Try to select Novice Bazaar first, then fall back to first available market
        const defaultMarket = availableMarkets.find(m => m.name === "Novice Bazaar") || availableMarkets[0];
        console.log('Selected default market:', defaultMarket ? defaultMarket.name : 'none found');
        
        if (!defaultMarket) {
          setError('Could not select a default market');
          setIsLoading(false);
          return;
        }
        
        // Set the filtered markets first
        setFilteredMarkets(availableMarkets);
        
        // Set the selected market ID before calling visitMarket to prevent race conditions
        setSelectedMarketId(defaultMarket.id);
        console.log(`Set selectedMarketId to ${defaultMarket.id}`);
        
        // Initialize the selected market
        const market = visitMarket(defaultMarket.id);
        if (market) {
          console.log(`Visited market: ${defaultMarket.id}`);
        } else {
          setError('Failed to load market');
        }
        
        // Finish loading after setting everything
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing markets:', err);
        setError('Failed to load markets');
        setIsLoading(false);
      }
    };
    
    initializeMarkets();
  }, [getMarkets, visitMarket, troubleshootMarkets, playerLevel]);
  
  // Make sure loading state is properly respected
  useEffect(() => {
    console.log(`State changed - isLoading: ${isLoading}, selectedMarketId: ${selectedMarketId}, markets: ${filteredMarkets.length}`);
  }, [isLoading, selectedMarketId, filteredMarkets]);
  
  // Handle market change
  const handleMarketChange = (marketId: string) => {
    try {
      const market = visitMarket(marketId);
      if (market) {
        setSelectedMarketId(marketId);
        setIsDropdownOpen(false);
        setError(null);
      } else {
        console.error('Error visiting market: market not found');
        setError('Failed to change market');
      }
    } catch (err) {
      console.error('Error changing market:', err);
      setError('Failed to change market');
    }
  };
  
  // Handle close
  const handleClose = () => {
    onClose();
    setSelectedMarketId(null);
    setSelectedTab('ingredients');
    setMode('buy');
  };
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  // Get items for current tab and mode
  const getDisplayItems = () => {
    if (!selectedMarketId || !selectedMarketId) return [];
    
    const market = getMarkets().find(m => m.id === selectedMarketId);
    if (!market || !market.inventory) return [];
    
    if (mode === 'buy') {
      // For buy mode, show market inventory
      return market.inventory[selectedTab] || [];
    } else {
      // For sell mode, we would show player inventory
      // This is placeholder - would need to implement player inventory filtering
      return [];
    }
  };
  
  const items = getDisplayItems();
  
  // Get all markets including locked ones
  const allMarkets = getMarkets().sort((a, b) => a.unlockLevel - b.unlockLevel);
  
  // Handle buying an item
  const handleBuyItem = (item: any, index: number) => {
    try {
      // Check if player has enough gold
      if (playerGold < item.currentPrice) {
        setTransactionMessage({
          text: "You don't have enough gold to buy this item!",
          type: 'error'
        });
        return;
      }
      
      // Get item type from the selectedTab - ensure it's a valid type
      const itemType = selectedTab === 'scrolls' ? 'scroll' : 
                       selectedTab === 'potions' ? 'potion' : 
                       selectedTab === 'equipment' ? 'equipment' : 
                       'ingredient'; // Default to ingredient
      
      // Add logging to trace the issue
      console.log('Buying item:', {
        marketId: selectedMarketId,
        itemId: item.item.id,
        itemType,
        price: item.currentPrice,
        quantity: 1,
        item: item // Log the full item for debugging
      });
      
      // Attempt to buy the item with the correct parameter order: marketId, itemType, itemId, quantity
      const result = buyItem(selectedMarketId!, itemType, item.item.id, 1);
      
      if (result && result.success) {
        setTransactionMessage({
          text: `Successfully purchased ${item.item.name}!`,
          type: 'success'
        });
        
        // Clear message after 3 seconds
        setTimeout(() => setTransactionMessage(null), 3000);
      } else {
        setTransactionMessage({
          text: result ? result.message : `Failed to purchase ${item.item.name}. Invalid item type.`,
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error buying item:', err);
      setTransactionMessage({
        text: err instanceof Error ? err.message : "An error occurred while trying to purchase the item",
        type: 'error'
      });
    }
  };
  
  // Render market UI
  return (
    <ErrorBoundary fallback={<div className={styles.errorContainer}>Something went wrong in the market.</div>}>
      <div className={styles.marketOverlay}>
        <div className={styles.marketContainer}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <p>Loading market...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <h3>Market Error</h3>
              <p>{error}</p>
              <button className={styles.closeButton} onClick={handleClose}>Close</button>
            </div>
          ) : !selectedMarketId ? (
            <div className={styles.errorContainer}>
              <h3>No Market Selected</h3>
              <p>Please select a market to continue.</p>
              <button className={styles.closeButton} onClick={handleClose}>Close</button>
            </div>
          ) : (
            <>
              <div className={styles.marketHeader}>
                <div className={styles.marketTitle}>
                  <span className={styles.marketBranding}>Wizard's Choice</span>
                  <h2>{allMarkets.find(m => m.id === selectedMarketId)?.name || 'Unknown'} Market</h2>
                </div>
                <div className={styles.marketControls}>
                  <div className={styles.goldAmount}>{playerGold} Gold</div>
                  <button className={styles.closeButton} onClick={handleClose}>
                    Leave Market
                  </button>
                </div>
              </div>
              
              <div className={styles.marketNavigation}>
                <div className={styles.marketSelect}>
                  <button className={styles.marketSelectButton} onClick={toggleDropdown}>
                    {allMarkets.find(m => m.id === selectedMarketId)?.name || 'Unknown Market'}
                    <svg viewBox="0 0 24 24">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                  </button>
                  {isDropdownOpen && (
                    <div className={styles.marketDropdown}>
                      {allMarkets.map(market => {
                        const isLocked = market.unlockLevel > playerLevel;
                        return (
                          <div
                            key={market.id}
                            className={`${styles.marketOption} 
                              ${market.id === selectedMarketId ? styles.selectedMarket : ''} 
                              ${isLocked ? styles.lockedMarket : ''}`}
                            onClick={() => !isLocked && handleMarketChange(market.id)}
                          >
                            {market.name}
                            {isLocked && <span className={styles.lockedText}> (Unlocks at level {market.unlockLevel})</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <div className={styles.marketDescription}>
                  {allMarkets.find(m => m.id === selectedMarketId)?.description || 'No description available'}
                </div>
                
                <button className={styles.travelButton}>
                  Travel to Market
                </button>
              </div>
              
              <div className={styles.marketTabs}>
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
                <button 
                  className={`${styles.tabButton} ${selectedTab === 'scrolls' ? styles.activeTab : ''}`}
                  onClick={() => setSelectedTab('scrolls')}
                >
                  Scrolls
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
              
              <div className={styles.marketContent}>
                {transactionMessage && (
                  <div className={`${styles.transactionMessage} ${styles[transactionMessage.type]}`}>
                    {transactionMessage.text}
                  </div>
                )}
                {items.length > 0 ? (
                  <div className={styles.itemsGrid}>
                    {items.map((item, index) => {
                      const rarity = item.item.rarity || 'common';
                      const itemName = item.item.name || 'Unknown Item';
                      const itemDescription = item.item.description || 'No description available';
                      
                      const itemCardStyle: React.CSSProperties = {
                        backgroundColor: '#222',
                        color: 'white',
                        borderWidth: '4px',
                        borderStyle: 'solid',
                        borderColor: 
                          rarity === 'common' ? '#aaa' : 
                          rarity === 'uncommon' ? '#ff8000' : 
                          rarity === 'rare' ? '#0a84ff' : 
                          rarity === 'epic' ? '#a335ee' : 
                          rarity === 'legendary' ? '#1eae30' : '#aaa',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column' as 'column'
                      };
                      
                      const itemNameStyle: React.CSSProperties = {
                        backgroundColor: 
                          rarity === 'common' ? '#aaa' : 
                          rarity === 'uncommon' ? '#ff8000' : 
                          rarity === 'rare' ? '#0a84ff' : 
                          rarity === 'epic' ? '#a335ee' : 
                          rarity === 'legendary' ? '#1eae30' : '#aaa',
                        color: rarity === 'common' ? 'black' : 'white',
                        padding: '10px',
                        margin: 0,
                        textAlign: 'center' as 'center',
                        fontWeight: 'bold'
                      };
                      
                      const descriptionStyle: React.CSSProperties = {
                        color: 'white', 
                        padding: '10px', 
                        minHeight: '40px', 
                        textAlign: 'center' as 'center'
                      };
                      
                      return (
                        <div 
                          key={index} 
                          className={`${styles.itemCard}`}
                          style={itemCardStyle}
                        >
                          <div className={styles.itemName} style={itemNameStyle}>{itemName}</div>
                          <div className={styles.itemDescription} style={descriptionStyle}>{itemDescription}</div>
                          <div className={styles.itemDetails}>
                            <div className={styles.itemPrice}>Price: {item.currentPrice} gold</div>
                            <div className={styles.itemQuantity} style={{color: '#cccccc'}}>Available: {item.quantity}</div>
                          </div>
                          <button 
                            className={styles.actionButton}
                            onClick={() => mode === 'buy' ? handleBuyItem(item, index) : null}
                            disabled={mode === 'buy' ? false : true} // Disable for sell mode until implemented
                          >
                            {mode === 'buy' ? 'Buy' : 'Sell'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.noItems}>
                    <p>No {selectedTab} available{mode === 'sell' ? ' to sell' : ''}.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export { MarketUI }; 