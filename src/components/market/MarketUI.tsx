'use client';

import React, { useState, useEffect } from 'react';
import { useGameStateStore, reinitializeMarkets, getWizard } from '../../lib/game-state/gameStateStore';
import {
  MarketItem as MarketItemType,
  Ingredient,
  Potion,
  Equipment,
  SpellScroll
} from '../../lib/types';
import ErrorBoundary from '../error/ErrorBoundary';
import styles from './MarketUI.module.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';

// Main MarketUI component
export const MarketUI: React.FC<{ onClose: (attackInfo?: any) => void }> = ({ onClose }) => {
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [filteredMarkets, setFilteredMarkets] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('ingredients');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [restockTime, setRestockTime] = useState<string>('');

  // Game state store functions
  const {
    getMarkets,
    getPlayerGold,
    visitMarket,
    troubleshootMarkets,
    buyItem,
    sellItem,
    refreshMarketInventory,
    checkForMarketAttack,
    handleMarketAttackResult
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

  // Calculate and update the restock timer
  useEffect(() => {
    if (!selectedMarketId) return;

    // Track if we've already triggered a refresh to avoid multiple refreshes
    let hasRefreshed = false;

    const calculateRestockTime = () => {
      const market = getMarkets().find(m => m.id === selectedMarketId);
      if (!market) return;

      const lastRefreshed = new Date(market.lastRefreshed);
      const refreshDays = market.inventoryRefreshDays || 1; // Default to 1 day if not specified

      // Calculate when the next refresh will happen
      const nextRefresh = new Date(lastRefreshed);
      nextRefresh.setDate(lastRefreshed.getDate() + refreshDays);

      // Calculate time remaining
      const now = new Date();
      const timeRemaining = nextRefresh.getTime() - now.getTime();

      if (timeRemaining <= 0) {
        // Market should be refreshed
        setRestockTime('Ready to restock');

        // Automatically refresh the market if it hasn't been refreshed yet
        if (!hasRefreshed) {
          console.log(`Market ${market.name} needs refreshing, automatically refreshing inventory...`);
          refreshMarketInventory(selectedMarketId);
          hasRefreshed = true;

          // Show a message to the user
          setTransactionMessage({
            text: `The market has been restocked with fresh inventory!`,
            type: 'success'
          });

          // Clear the message after a few seconds
          setTimeout(() => setTransactionMessage(null), 3000);
        }
        return;
      }

      // Reset the refresh flag if the timer is counting down again
      hasRefreshed = false;

      // Convert to hours, minutes, seconds
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      // Format the time string
      setRestockTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    // Calculate immediately
    calculateRestockTime();

    // Update every second
    const timer = setInterval(calculateRestockTime, 1000);

    // Clean up on unmount or when selectedMarketId changes
    return () => clearInterval(timer);
  }, [selectedMarketId, getMarkets, refreshMarketInventory, setTransactionMessage]);

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
    let triggeredAttack = false;
    if (selectedMarketId) {
      const attack = checkForMarketAttack(selectedMarketId);
      if (attack.attacked) {
        // Instead of showing modal here, call onClose and pass attack info
        triggeredAttack = true;
        onClose(attack);
      }
    }
    if (!triggeredAttack) {
      onClose();
    }
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
    if (!selectedMarketId) return [];

    const market = getMarkets().find(m => m.id === selectedMarketId);
    if (!market) return [];

    // Defensive: If inventory is missing or malformed, trigger refresh and show error
    if (!market.inventory ||
        !Array.isArray(market.inventory.ingredients) ||
        !Array.isArray(market.inventory.potions) ||
        !Array.isArray(market.inventory.equipment) ||
        !Array.isArray(market.inventory.scrolls)) {
      setError('Market inventory is missing or corrupted. Attempting to refresh...');
      refreshMarketInventory(selectedMarketId);
      return [];
    }

    if (mode === 'buy') {
      // For buy mode, show market inventory
      if (selectedTab === 'spellScrolls') {
        return market.inventory.scrolls || [];
      } else {
        return market.inventory[selectedTab] || [];
      }
    } else {
      // For sell mode, aggregate/stack duplicate items by name
      const player = getWizard();
      if (!player) return [];

      switch (selectedTab) {
        case 'ingredients': {
          // Aggregate ingredients by name
          const ingredientMap = new Map();
          (player.ingredients || []).forEach(item => {
            if (ingredientMap.has(item.name)) {
              ingredientMap.get(item.name).quantity += item.quantity || 1;
            } else {
              ingredientMap.set(item.name, {
                item: { ...item },
                quantity: item.quantity || 1,
                currentPrice: Math.floor((item.value || 10) * (market.sellPriceMultiplier || 0.6)),
                supply: 'common',
                demand: 'moderate',
                priceHistory: []
              });
            }
          });
          return Array.from(ingredientMap.values());
        }
        case 'potions': {
          // Aggregate potions by name
          const potionMap = new Map();
          (player.potions || []).forEach(item => {
            if (potionMap.has(item.name)) {
              potionMap.get(item.name).quantity += item.quantity || 1;
            } else {
              potionMap.set(item.name, {
                item: { ...item },
                quantity: item.quantity || 1,
                currentPrice: Math.floor((item.value || 20) * (market.sellPriceMultiplier || 0.6)),
                supply: 'common',
                demand: 'moderate',
                priceHistory: []
              });
            }
          });
          return Array.from(potionMap.values());
        }
        case 'equipment': {
          // Aggregate unequipped equipment by name
          const equipmentMap = new Map();
          (player.inventory || [])
            .filter(item =>
              item.type !== 'scroll' &&
              !(player.equipment || []).some(eq => eq.id === item.id)
            )
            .forEach(item => {
              if (equipmentMap.has(item.name)) {
                equipmentMap.get(item.name).quantity += item.quantity || 1;
              } else {
                equipmentMap.set(item.name, {
                  item: { ...item },
                  quantity: item.quantity || 1,
                  currentPrice: Math.floor((item.value || 50) * (market.sellPriceMultiplier || 0.6)),
                  supply: 'common',
                  demand: 'moderate',
                  priceHistory: []
                });
              }
            });
          return Array.from(equipmentMap.values());
        }
        case 'spellScrolls': {
          // Aggregate scrolls by name
          const scrollMap = new Map();
          (player.inventory || [])
            .filter(item => item.type === 'scroll')
            .forEach(item => {
              if (scrollMap.has(item.name)) {
                scrollMap.get(item.name).quantity += item.quantity || 1;
              } else {
                scrollMap.set(item.name, {
                  item: { ...item },
                  quantity: item.quantity || 1,
                  currentPrice: Math.floor((item.value || 100) * (market.sellPriceMultiplier || 0.6)),
                  supply: 'common',
                  demand: 'moderate',
                  priceHistory: []
                });
              }
            });
          return Array.from(scrollMap.values());
        }
        default:
          return [];
      }
    }
  };

  // Get all markets
  const allMarkets = getMarkets();

  // Handle buying an item
  const handleBuyItem = (item: MarketItemType<any>, index: number) => {
    if (!selectedMarketId) {
      setTransactionMessage({
        text: 'No market selected',
        type: 'error'
      });
      return;
    }

    if (playerGold < item.currentPrice) {
      setTransactionMessage({
        text: 'Not enough gold',
        type: 'error'
      });
      return;
    }

    try {
      // Determine item type from the selected tab
      let itemType: string;
      switch (selectedTab) {
        case 'ingredients':
          itemType = 'ingredient';
          break;
        case 'potions':
          itemType = 'potion';
          break;
        case 'equipment':
          itemType = 'equipment';
          break;
        case 'spellScrolls':
          itemType = 'scroll';
          break;
        default:
          throw new Error(`Unknown item type for tab: ${selectedTab}`);
      }

      // Attempt to buy the item with the correct parameter order: marketId, itemType, itemId, quantity
      const result = buyItem(selectedMarketId!, itemType as 'ingredient' | 'potion' | 'equipment' | 'scroll', item.item.id, 1);

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

  // Handle selling an item
  const handleSellItem = (item: MarketItemType<any>, index: number) => {
    if (!selectedMarketId) {
      setTransactionMessage({
        text: 'No market selected',
        type: 'error'
      });
      return;
    }

    try {
      // Determine item type from the selected tab
      let itemType: string;
      switch (selectedTab) {
        case 'ingredients':
          itemType = 'ingredient';
          break;
        case 'potions':
          itemType = 'potion';
          break;
        case 'equipment':
          itemType = 'equipment';
          break;
        case 'spellScrolls':
          itemType = 'scroll';
          break;
        default:
          throw new Error(`Unknown item type for tab: ${selectedTab}`);
      }

      // Get the market to check if it has enough gold
      const market = getMarkets().find(m => m.id === selectedMarketId);
      if (!market) {
        setTransactionMessage({
          text: 'Market not found',
          type: 'error'
        });
        return;
      }

      // Check if market has enough gold
      const marketGold = market.currentGold || 0;
      const sellPrice = item.currentPrice;
      if (marketGold < sellPrice) {
        setTransactionMessage({
          text: `The market doesn't have enough gold (${marketGold}) to buy this item for ${sellPrice}.`,
          type: 'error'
        });
        return;
      }

      // Attempt to sell the item
      const result = sellItem(selectedMarketId!, itemType as 'ingredient' | 'potion' | 'equipment' | 'scroll', item.item.id, 1);

      if (result && result.success) {
        setTransactionMessage({
          text: `Successfully sold ${item.item.name} for ${item.currentPrice} gold!`,
          type: 'success'
        });

        // Clear message after 3 seconds
        setTimeout(() => setTransactionMessage(null), 3000);
      } else {
        setTransactionMessage({
          text: result ? result.message : `Failed to sell ${item.item.name}. Invalid item type.`,
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error selling item:', err);
      setTransactionMessage({
        text: err instanceof Error ? err.message : "An error occurred while trying to sell the item",
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
                  <div className={styles.goldAmount}>
                    <div className={styles.goldRow}>Your Gold: {playerGold}</div>
                    <div className={styles.goldRow}>🏪 Market Gold: {(allMarkets.find(m => m.id === selectedMarketId)?.currentGold || 0).toLocaleString()}</div>
                  </div>
                  <button className={styles.closeButton} onClick={handleClose}>
                    Leave Market
                  </button>
                </div>
              </div>

              <div className={styles.marketNavigation}>
                <div className={styles.marketNavLeft}>
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
                              {isLocked && ` (Unlocks at level ${market.unlockLevel})`}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className={styles.restockTimer}>
                    Market Restocks in: <span>{restockTime}</span>
                  </div>
                </div>

                <div className={styles.marketModes}>
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
              </div>

              <div className={styles.marketTabs}>
                <button
                  className={`${styles.marketTab} ${selectedTab === 'ingredients' ? styles.activeTab : ''}`}
                  onClick={() => setSelectedTab('ingredients')}
                >
                  Ingredients
                </button>
                <button
                  className={`${styles.marketTab} ${selectedTab === 'potions' ? styles.activeTab : ''}`}
                  onClick={() => setSelectedTab('potions')}
                >
                  Potions
                </button>
                <button
                  className={`${styles.marketTab} ${selectedTab === 'equipment' ? styles.activeTab : ''}`}
                  onClick={() => setSelectedTab('equipment')}
                >
                  Equipment
                </button>
                <button
                  className={`${styles.marketTab} ${selectedTab === 'spellScrolls' ? styles.activeTab : ''}`}
                  onClick={() => setSelectedTab('spellScrolls')}
                >
                  Spell Scrolls
                </button>
              </div>

              <div className={styles.itemsGrid}>
                {getDisplayItems().map((item: MarketItemType<any>, index: number) => {
                  // Determine item name and description based on item type
                  let itemName = item.item.name || 'Unknown Item';
                  let itemDescription = '';
                  let itemCardStyle = {};
                  let itemNameStyle = {};
                  let descriptionStyle = {};

                  if (selectedTab === 'ingredients') {
                    const ingredient = item.item as Ingredient;
                    itemDescription = ingredient.description || 'No description available';
                    itemCardStyle = { borderLeft: '4px solid #4caf50' };
                    itemNameStyle = { color: '#4caf50' };
                  } else if (selectedTab === 'potions') {
                    const potion = item.item as Potion;
                    itemDescription = potion.description || 'No description available';
                    itemCardStyle = { borderLeft: '4px solid #2196f3' };
                    itemNameStyle = { color: '#2196f3' };
                  } else if (selectedTab === 'equipment') {
                    const equipment = item.item as Equipment;
                    itemDescription = equipment.description || 'No description available';
                    itemCardStyle = { borderLeft: '4px solid #ff9800' };
                    itemNameStyle = { color: '#ff9800' };
                    descriptionStyle = { fontSize: '12px' };
                  } else if (selectedTab === 'spellScrolls') {
                    const scroll = item.item as SpellScroll;
                    itemDescription = `Learn the ${scroll.spell.name} spell`;
                    itemCardStyle = { borderLeft: '4px solid #9c27b0' };
                    itemNameStyle = { color: '#9c27b0' };
                  }

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
                        onClick={() => mode === 'buy' ? handleBuyItem(item, index) : handleSellItem(item, index)}
                      >
                        {mode === 'buy' ? 'Buy' : 'Sell'}
                      </button>
                    </div>
                  );
                })}

                {getDisplayItems().length === 0 && (
                  <div className={styles.emptyState}>
                    <p>No items available in this category</p>
                  </div>
                )}
              </div>
            </>
          )}

          {transactionMessage && (
            <div className={`${styles.transactionMessage} ${transactionMessage.type === 'success' ? styles.successMessage : styles.errorMessage}`}>
              {transactionMessage.text}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default MarketUI;
