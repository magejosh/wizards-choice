'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStateStore } from '../../game-state/gameStateStore';
import { MarketLocation, MarketItem, Ingredient, Potion, Equipment, IngredientRarity, Wizard } from '../../types';
import ErrorBoundary from './ErrorBoundary';
import { setPerformanceMonitoring, trackRenderStart, usePerformanceTracking } from '../../utils/performance';
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
  useMockData?: boolean;
}

// Main MarketUI component (internal use only, not exported)
const _MarketUI: React.FC<MarketUIProps> = ({ onClose, useMockData = false }) => {
  // Enable performance monitoring
  useEffect(() => {
    setPerformanceMonitoring(true);
    return () => setPerformanceMonitoring(false);
  }, []);

  // Create a ref for the market container element
  const marketContainerRef = React.useRef<HTMLDivElement>(null);

  // Debugging log of DOM structure
  useEffect(() => {
    console.log('DEBUG: DOM Structure check - MarketUI has mounted');
    // Use ref instead of querySelector which might fail with CSS modules
    console.log('DEBUG: Market container element:', marketContainerRef.current);
    if (marketContainerRef.current) {
      // Get computed style
      const style = window.getComputedStyle(marketContainerRef.current);
      console.log('DEBUG: Market container computed style:', {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        position: style.position,
        zIndex: style.zIndex,
        width: style.width,
        height: style.height,
        overflow: style.overflow
      });
    }
  }, []);

  // Track component render time
  const endRenderTracking = trackRenderStart('MarketUI');
  
  // Get performance tracking utilities
  const perf = usePerformanceTracking('MarketUI');

  console.log('MarketUI: Component rendering');
  const router = useRouter();
  
  // Always call hooks at the top level, unconditionally
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
    setCurrentLocation,
    gameState,
    updateGameState
  } = useGameStateStore();
  
  console.log('MarketUI: Game state initialized:', { 
    hasGameState: !!gameState,
    playerLevel: gameState?.player?.level 
  });
  
  // All state hooks
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'ingredients' | 'potions' | 'equipment'>('ingredients');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [showAttackModal, setShowAttackModal] = useState(false);
  const [attacker, setAttacker] = useState<Wizard | null>(null);
  const [markets, setMarkets] = useState<MarketLocation[]>([]);
  const [gold, setGold] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize markets and gold - using useEffect to avoid state updates during render
  useEffect(() => {
    perf.logEvent('initialization-start');
    console.log('MarketUI: Starting initialization effect');
    let isMounted = true;
    
    const initializeMarketData = async () => {
      try {
        // Check if we need to create initial markets
        console.log('MarketUI: Checking if markets need to be initialized in gameState');
        let marketExists = true;
        
        try {
          // See if markets array exists and is populated
          const existingMarkets = getMarkets();
          if (!existingMarkets || existingMarkets.length === 0) {
            console.log('MarketUI: No markets found in gameState, may need initialization');
            marketExists = false;
          } else {
            console.log(`MarketUI: Found ${existingMarkets.length} markets in gameState`);
          }
        } catch (err) {
          console.error('MarketUI: Error checking for markets existence:', err);
          marketExists = false;
        }
        
        // Force gameState update to initialize markets if needed
        if (!marketExists) {
          console.log('MarketUI: Initializing gameState with default markets');
          try {
            // Instead of using updateGameState with a callback, we'll call a function to initialize markets
            // This avoids the linter error: Type '(draft: any) => void' has no properties in common with type 'Partial<GameState>'
            setCurrentLocation('wizardStudy'); // This will trigger market initialization
            console.log('MarketUI: GameState updated to ensure markets are initialized');
          } catch (initErr) {
            console.error('MarketUI: Error initializing markets in gameState:', initErr);
          }
        }

        // Fetch markets after ensuring they're initialized
        const fetchedMarkets = perf.trackOperation('fetchMarkets', () => getMarkets());
        console.log('MarketUI: Fetched markets:', fetchedMarkets);
        
        if (!isMounted) return;
        
        if (!fetchedMarkets || fetchedMarkets.length === 0) {
          console.log('MarketUI: No markets available');
          setError('No markets available at this time.');
          setIsLoading(false);
          return;
        }

        // Update state once and don't worry about real-time updates
        setMarkets(fetchedMarkets);
        const playerGold = perf.trackOperation('fetchPlayerGold', () => getPlayerGold());
        console.log('MarketUI: Player gold:', playerGold);
        setGold(playerGold);
        
        // Force the first market to be selected since we know markets exist
        const firstAvailableMarket = fetchedMarkets.find(
          market => market.unlockLevel <= gameState.player.level
        );
        
        if (firstAvailableMarket) {
          console.log('MarketUI: First available market:', firstAvailableMarket);
          
          // Force selection of first market
          setSelectedMarketId(firstAvailableMarket.id);
          
          // Make sure the market has been visited to generate inventory
          try {
            // Ensure market is visited to generate inventory
            visitMarket(firstAvailableMarket.id);
            
            // We need to directly get the very latest market data
            const marketWithInventory = getMarketById(firstAvailableMarket.id);
            console.log('MarketUI: Verified market data after visit:', {
              id: marketWithInventory.id,
              hasInventory: !!marketWithInventory.inventory,
              ingredients: marketWithInventory.inventory?.ingredients?.length || 0,
              potions: marketWithInventory.inventory?.potions?.length || 0,
              equipment: marketWithInventory.inventory?.equipment?.length || 0
            });
            
            // Force re-render with updated market data after a short delay
            setTimeout(() => {
              if (isMounted) {
                console.log('MarketUI: Forcing re-render with updated market data');
                // Important: Update selectedTab to match available inventory
                if (marketWithInventory.inventory?.ingredients?.length > 0) {
                  setSelectedTab('ingredients');
                } else if (marketWithInventory.inventory?.potions?.length > 0) {
                  setSelectedTab('potions');
                } else if (marketWithInventory.inventory?.equipment?.length > 0) {
                  setSelectedTab('equipment');
                }
                
                // Set loading to false and force re-render
                setIsLoading(false);
                // Directly set the local state to the latest market
                setMarkets(prevMarkets => {
                  const updatedMarkets = [...prevMarkets];
                  const index = updatedMarkets.findIndex(m => m.id === firstAvailableMarket.id);
                  if (index >= 0) {
                    updatedMarkets[index] = marketWithInventory;
                  }
                  return updatedMarkets;
                });
              }
            }, 300); // Increased to 300ms for more reliable update
          } catch (visitErr) {
            console.error('MarketUI: Error visiting market:', visitErr);
            setIsLoading(false);
          }
        } else {
          console.error('MarketUI: No markets available for player level', gameState.player.level);
          setError('No markets available for your level.');
          setIsLoading(false);
        }
        
        perf.logEvent('initialization-complete');
      } catch (err) {
        console.error('MarketUI: Initialization error:', err);
        if (isMounted) {
          setError('Failed to load market data. Please try again later.');
          setIsLoading(false);
        }
      }
    };

    // Initialize data once - no complex update logic
    initializeMarketData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []); // Execute only on mount
  
  // NEW: Add an effect to update inventory when selectedMarketId changes
  useEffect(() => {
    if (selectedMarketId) {
      try {
        console.log(`MarketUI: Selected market changed to ${selectedMarketId}, updating inventory`);
        
        // Re-fetch the market to ensure we have the latest data
        const currentMarket = getMarketById(selectedMarketId);
        
        if (currentMarket && currentMarket.inventory) {
          console.log('MarketUI: Updated inventory data:', {
            ingredients: currentMarket.inventory.ingredients?.length || 0,
            potions: currentMarket.inventory.potions?.length || 0,
            equipment: currentMarket.inventory.equipment?.length || 0,
          });
        }
      } catch (err) {
        console.error('MarketUI: Error updating inventory after market selection:', err);
      }
    }
  }, [selectedMarketId, getMarketById]);
  
  // Reset quantity when selecting a new item
  useEffect(() => {
    setQuantity(1);
  }, [selectedItem]);
  
  // Update gold when it changes in the game state
  useEffect(() => {
    const updateGold = () => {
      perf.trackOperation('updateGold', () => setGold(getPlayerGold()));
    };
    
    // Initial update
    updateGold();
    
    // We could set up a listener here if needed for real-time updates
  }, [getPlayerGold, perf]);
  
  // End render tracking
  useEffect(() => {
    return endRenderTracking;
  }, [endRenderTracking]);
  
  // Create derived data outside of render using useMemo or just regular variables
  // Important: Access these safely with proper error handling
  let selectedMarket = null;
  try {
    selectedMarket = selectedMarketId ? getMarketById(selectedMarketId) : null;
    // Debug selected market details
    if (selectedMarket) {
      console.log('DEBUG: Selected market data:', {
        id: selectedMarket.id,
        name: selectedMarket.name,
        hasInventory: !!selectedMarket.inventory,
        inventoryStructure: selectedMarket.inventory ? {
          ingredients: Array.isArray(selectedMarket.inventory.ingredients) ? `${selectedMarket.inventory.ingredients.length} items` : 'not an array',
          potions: Array.isArray(selectedMarket.inventory.potions) ? `${selectedMarket.inventory.potions.length} items` : 'not an array',
          equipment: Array.isArray(selectedMarket.inventory.equipment) ? `${selectedMarket.inventory.equipment.length} items` : 'not an array'
        } : 'no inventory'
      });
    }
  } catch (err) {
    console.error("Error getting selected market:", err);
  }
  
  // Filter markets based on player level
  let availableMarkets: MarketLocation[] = [];
  try {
    // Only filter if markets array is populated
    if (markets && markets.length > 0) {
      availableMarkets = markets.filter(
        market => market.unlockLevel <= gameState.player.level
      );
      console.log(`DEBUG: ${availableMarkets.length} markets available for player level ${gameState.player.level}`);
      
      // If we have no available markets but we have markets in general,
      // something may be wrong with the level requirements
      if (availableMarkets.length === 0) {
        console.error('WARNING: No markets available despite having markets loaded. Check level requirements.', {
          playerLevel: gameState.player.level,
          marketLevels: markets.map(m => ({ name: m.name, unlockLevel: m.unlockLevel }))
        });
        
        // FALLBACK: If no markets are available but we have markets, show them all
        // This prevents the UI from being completely empty
        console.log('FALLBACK: Showing all markets regardless of level requirements');
        availableMarkets = [...markets];
      }
    } else {
      console.log('DEBUG: Markets array is empty or not yet loaded');
    }
  } catch (err) {
    console.error("Error filtering available markets:", err);
    availableMarkets = [...markets]; // Fallback to all markets
  }
  
  // Get relevant inventory based on selected tab
  const getInventory = () => {
    if (!selectedMarketId) {
      console.log('DEBUG: No market ID selected, cannot get inventory');
      return [];
    }
    
    try {
      // Always get the freshest version of the market directly from game state
      const freshMarket = getMarketById(selectedMarketId);
      
      if (!freshMarket) {
        console.error(`Market with ID ${selectedMarketId} not found`);
        return [];
      }
      
      // Ensure we have visited the market to generate inventory if needed
      visitMarket(selectedMarketId);
      
      // Get the freshest market data again after visiting
      const marketAfterVisit = getMarketById(selectedMarketId);
      
      // Log the freshly fetched market data
      console.log('DEBUG: Fresh market data directly from gameState after ensuring visited:', {
        id: marketAfterVisit.id,
        name: marketAfterVisit.name,
        hasInventory: !!marketAfterVisit.inventory,
        inventoryTypes: marketAfterVisit.inventory ? Object.keys(marketAfterVisit.inventory) : []
      });
      
      // Ensure the inventory object exists
      if (!marketAfterVisit.inventory) {
        console.error("Market inventory is undefined or null, forcing generation", selectedMarketId);
        
        // Try one more time with a forced market refresh
        refreshMarket(selectedMarketId);
        const marketAfterRefresh = getMarketById(selectedMarketId);
        
        if (!marketAfterRefresh.inventory) {
          console.error("Market inventory still null after refresh, returning empty array");
          return [];
        }
        
        console.log("DEBUG: Inventory generated after refresh:", {
          ingredients: marketAfterRefresh.inventory?.ingredients?.length || 0,
          potions: marketAfterRefresh.inventory?.potions?.length || 0,
          equipment: marketAfterRefresh.inventory?.equipment?.length || 0
        });
        
        // Use the refreshed market's inventory
        return getInventoryForTab(marketAfterRefresh, selectedTab);
      }
      
      return getInventoryForTab(marketAfterVisit, selectedTab);
    } catch (err) {
      console.error("Error getting inventory:", err);
      return [];
    }
  };
  
  // Helper function to get inventory for a specific tab
  const getInventoryForTab = (market, tab) => {
    if (!market || !market.inventory) return [];
    
    let items = [];
    switch (tab) {
      case 'ingredients':
        // Ensure ingredients array exists and is an array
        if (!Array.isArray(market.inventory.ingredients)) {
          console.error("Market ingredients is not an array", market.id);
          return [];
        }
        items = market.inventory.ingredients || [];
        break;
      case 'potions':
        // Ensure potions array exists and is an array
        if (!Array.isArray(market.inventory.potions)) {
          console.error("Market potions is not an array", market.id);
          return [];
        }
        items = market.inventory.potions || [];
        break;
      case 'equipment':
        // Ensure equipment array exists and is an array
        if (!Array.isArray(market.inventory.equipment)) {
          console.error("Market equipment is not an array", market.id);
          return [];
        }
        items = market.inventory.equipment || [];
        break;
      default:
        items = [];
    }
    
    // Debug log to verify items exist and inspect the structure more deeply
    console.log(`DEBUG: Market ${market.name} has ${items.length} ${tab} items`);
    
    // Log detailed item structure of first item for debugging
    if (items.length > 0) {
      console.log('DEBUG: First item structure:', JSON.stringify(items[0], null, 2));
      console.log('DEBUG: Can access required properties:', {
        hasItemProp: !!items[0].item,
        name: items[0].item?.name || 'N/A',
        id: items[0].item?.id || 'N/A',
        price: items[0].currentPrice || 'N/A',
        quantity: items[0].quantity || 'N/A'
      });
    } else {
      console.log(`DEBUG: No ${tab} items in market ${market.name}`);
    }
    
    return items;
  };
  
  // Filter inventory items based on search term - with extra safety checks
  let filteredInventory: any[] = [];
  try {
    const inventory = getInventory();
    
    // Only filter if inventory is not empty
    if (inventory.length > 0) {
      filteredInventory = inventory.filter(item => {
        // Extra defensive check for item structure
        if (!item) {
          console.error("Null item in inventory");
          return false;
        }
        
        // Ensure item.item exists and has a name property
        if (!item.item) {
          console.error("Invalid item structure - item.item is missing:", item);
          return false;
        }
        
        if (typeof item.item.name !== 'string') {
          console.error("Invalid item structure - item.item.name is not a string:", item);
          return false;
        }
        
        return item.item.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
      console.log(`DEBUG: Filtered inventory has ${filteredInventory.length} items after search filter`);
    } else {
      console.log(`DEBUG: Inventory is empty, nothing to filter`);
    }
  } catch (err) {
    console.error("Error filtering inventory:", err);
    filteredInventory = [];
  }
  
  // Get player's inventory based on selected tab
  const getPlayerInventory = () => {
    try {
      // Ensure the player object exists
      if (!gameState || !gameState.player) {
        console.error("Game state or player is undefined or null");
        return [];
      }
      
      switch (selectedTab) {
        case 'ingredients':
          // Ensure ingredients array exists and is an array
          if (!Array.isArray(gameState.player.ingredients)) {
            console.error("Player ingredients is not an array");
            return [];
          }
          return gameState.player.ingredients || [];
        case 'potions':
          // Ensure potions array exists and is an array
          if (!Array.isArray(gameState.player.potions)) {
            console.error("Player potions is not an array");
            return [];
          }
          return gameState.player.potions || [];
        case 'equipment':
          // Ensure inventory array exists and is an array
          if (!Array.isArray(gameState.player.inventory)) {
            console.error("Player inventory is not an array");
            return [];
          }
          return gameState.player.inventory || [];
        default:
          return [];
      }
    } catch (err) {
      console.error("Error getting player inventory:", err);
      return [];
    }
  };
  
  // Filter player's inventory based on search term
  let filteredPlayerInventory: any[] = [];
  try {
    const playerInventory = getPlayerInventory();
    
    // Only filter if player inventory is not empty
    if (playerInventory.length > 0) {
      filteredPlayerInventory = playerInventory.filter(item => {
        // Ensure item exists and has a name property
        if (!item || typeof item.name !== 'string') {
          console.error("Invalid player item structure:", item);
          return false;
        }
        return item.name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
  } catch (err) {
    console.error("Error filtering player inventory:", err);
    filteredPlayerInventory = [];
  }
  
  // Log the filtered inventory that will be rendered
  useEffect(() => {
    if (mode === 'buy') {
      console.log(`DEBUG: About to render ${filteredInventory.length} items in buy mode`);
    } else {
      console.log(`DEBUG: About to render ${filteredPlayerInventory.length} items in sell mode`);
    }
  }, [filteredInventory, filteredPlayerInventory, mode]);
  
  // Event handlers
  const handleMarketChange = (marketId: string) => {
    try {
      setSelectedMarketId(marketId);
      visitMarket(marketId);
      setSelectedItem(null);
    } catch (err) {
      console.error("Error changing market:", err);
      setMessage("Failed to change markets. Please try again.");
    }
  };
  
  const handleBuy = () => {
    try {
      if (!selectedMarket || !selectedItem) return;
      
      const result = buyItem(
        selectedMarket.id,
        selectedTab === 'ingredients' ? 'ingredient' : 
        selectedTab === 'potions' ? 'potion' : 'equipment',
        selectedItem.item.id,
        quantity
      );
      
      // Update UI immediately after transaction
      setMessage(result.message);
      
      // Ensure we get the latest gold value directly from the store
      const updatedGold = getPlayerGold();
      setGold(updatedGold);
      
      // Reset selection after successful purchase
      if (result.success) {
        // Get updated market data to reflect changes
        const updatedMarket = getMarketById(selectedMarket.id);
        setMarkets(prevMarkets => {
          return prevMarkets.map(market => 
            market.id === selectedMarket.id ? updatedMarket : market
          );
        });
        
        setSelectedItem(null);
        
        // Clear message after delay
        setTimeout(() => {
          setMessage('');
        }, 2000);
      }
    } catch (err) {
      console.error("Error buying item:", err);
      setMessage("An error occurred while buying. Please try again.");
    }
  };
  
  const handleSell = () => {
    try {
      if (!selectedMarket || !selectedItem) return;
      
      const result = sellItem(
        selectedMarket.id,
        selectedTab === 'ingredients' ? 'ingredient' : 
        selectedTab === 'potions' ? 'potion' : 'equipment',
        selectedItem.id,
        quantity
      );
      
      // Update UI immediately after transaction
      setMessage(result.message);
      
      // Ensure we get the latest gold value directly from the store
      const updatedGold = getPlayerGold();
      setGold(updatedGold);
      
      // Reset selection after successful sale
      if (result.success) {
        // Get updated market data to reflect changes
        const updatedMarket = getMarketById(selectedMarket.id);
        setMarkets(prevMarkets => {
          return prevMarkets.map(market => 
            market.id === selectedMarket.id ? updatedMarket : market
          );
        });
        
        setSelectedItem(null);
        
        // Clear message after delay
        setTimeout(() => {
          setMessage('');
        }, 2000);
      }
    } catch (err) {
      console.error("Error selling item:", err);
      setMessage("An error occurred while selling. Please try again.");
    }
  };
  
  const handleMarketClose = () => {
    try {
      // Check for potential ambush when leaving the market
      if (Math.random() < 0.1) { // 10% chance of ambush
      if (!selectedMarketId) {
        onClose();
        return;
      }
      
      const attackResult = checkForMarketAttack(selectedMarketId);
        if (attackResult.attacked) {
        setAttacker(attackResult.attacker);
        setShowAttackModal(true);
          return; // Don't close the market yet
      }
      }
      
      // No attack, safe to leave
      setCurrentLocation('wizardStudy');
      onClose();
    } catch (err) {
      console.error("Error closing market:", err);
      // Force close anyway
      onClose();
    }
  };
  
  const handleAcceptDuel = () => {
    try {
      if (!attacker) return;
      
      // Accept the duel
      const result = handleMarketAttackResult('win', attacker);
      setMessage(result.message);
      
      // Redirect to battle with a delay
      setTimeout(() => {
        router.push('/battle');
      }, 1500);
    } catch (err) {
      console.error("Error accepting duel:", err);
      setMessage("Error starting battle. Please try again.");
    }
  };
  
  const handleFlee = () => {
    try {
      if (!attacker) return;
      
      // Try to flee
        const result = handleMarketAttackResult('lose', attacker);
        setMessage(result.message);
      
      // Close the modal after delay
        setTimeout(() => {
          setShowAttackModal(false);
          onClose();
      }, 1500);
    } catch (err) {
      console.error("Error fleeing:", err);
      setMessage("Error fleeing. Please try again.");
    }
  };
  
  const handleRefreshMarket = (marketId: string) => {
    try {
      // Simple approach: Just call refresh and update UI once
      refreshMarket(marketId);
      
      // Get the updated market data
      if (selectedMarketId) {
        const updatedMarket = getMarketById(selectedMarketId);
        
        // Update the markets array to reflect changes
        setMarkets(prevMarkets => {
          return prevMarkets.map(market => 
            market.id === selectedMarketId ? updatedMarket : market
          );
        });
        
        setMessage("Market refreshed with new items!");
        
        // Clear any selected item since inventory may have changed
        setSelectedItem(null);
      }
    } catch (err) {
      console.error("Error refreshing market:", err);
      setMessage("Error refreshing market. Please try again.");
    }
  };
  
  const formatGold = (amount: number) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  const incrementQuantity = () => {
    try {
      const maxQuantity = mode === 'buy' 
        ? selectedItem.quantity
        : selectedItem.count || 1;
        
      if (quantity < maxQuantity) {
        setQuantity(prevQuantity => prevQuantity + 1);
      }
    } catch (err) {
      console.error("Error incrementing quantity:", err);
    }
  };
  
  const decrementQuantity = () => {
    try {
      if (quantity > 1) {
        setQuantity(prevQuantity => prevQuantity - 1);
      }
  } catch (err) {
      console.error("Error decrementing quantity:", err);
  }
  };
  
  // Render an item card with extra error checking
  const renderItemCard = (item: MarketItem<any> | any, isBuyMode: boolean) => {
    try {
      // Extra defensive check for null items
      if (!item) {
        console.error("Attempted to render null item");
        return <div className={styles.errorCard}>Invalid item data</div>;
      }
      
      // Extra checks for buy mode
      if (isBuyMode && (!item.item || typeof item.item !== 'object')) {
        console.error("Buy mode item is missing the item property or it's not an object:", item);
        return <div className={styles.errorCard}>Invalid market item data</div>;
      }
      
      const itemData = isBuyMode ? item.item : item;
      
      // More defensive checks
      if (!itemData) {
        console.error("Item data is null after mode check");
        return <div className={styles.errorCard}>Missing item data</div>;
      }
      
      if (!itemData.id) {
        console.error("Item is missing ID:", itemData);
        return <div className={styles.errorCard}>Item missing ID</div>;
      }
      
      // Guarantee a rarity value
      const rarity = itemData.rarity || 'common';
      
      const handleCardClick = () => {
        console.log("Item card clicked:", isBuyMode ? item.item.name : item.name);
        setSelectedItem(item);
        setQuantity(1);
      };
      
      const isSelected = selectedItem && (
        isBuyMode 
          ? selectedItem.item.id === itemData.id
          : selectedItem.id === itemData.id
      );
      
      return (
        <div 
          key={itemData.id} 
          className={`${styles.itemCard} ${isSelected ? styles.selectedCard : ''}`}
          onClick={handleCardClick}
        >
          <div 
            className={styles.itemHeader} 
            style={{ backgroundColor: RARITY_COLORS[rarity] }}
          >
            <h4>{itemData.name || 'Unknown Item'}</h4>
            <span className={styles.rarityBadge}>{rarity}</span>
          </div>
          <div className={styles.itemDetails}>
            <p>{itemData.description || 'No description available'}</p>
            {isBuyMode ? (
              <p>Price: {item.currentPrice || 0} gold (x{item.quantity || 1} available)</p>
            ) : (
              <p>Value: {Math.floor((itemData.value || 0) * 0.7)} gold (x{itemData.count || 1} owned)</p>
            )}
          </div>
        </div>
      );
    } catch (err) {
      console.error("Error rendering item card:", err, item);
      return <div className={styles.errorCard}>Error loading item</div>;
    }
  };
  
  // Calculate total price based on quantity and mode
  const totalPrice = selectedItem
    ? (mode === 'buy'
        ? selectedItem.currentPrice * quantity
        : Math.floor(selectedItem.value * 0.7) * quantity)
    : 0;
  
  // Utility function to check if market refresh is available
  // Markets refresh every 12 hours of game time
  const isMarketRefreshAvailable = (market: MarketLocation) => {
    if (!market.lastRefreshed) return true;
    
    const now = Date.now();
    const lastRefreshTime = new Date(market.lastRefreshed).getTime();
    const hoursSinceRefresh = (now - lastRefreshTime) / (1000 * 60 * 60);
    
    // Allow refresh after 12 hours
    return hoursSinceRefresh >= 12;
  };
  
  // Handler to refresh all markets
  const handleRefreshAllMarkets = () => {
    try {
      // Assuming there's a refreshAllMarkets function in the game state
      // If not, we can iterate through all markets and refresh them
      markets.forEach(market => {
        if (isMarketRefreshAvailable(market)) {
          refreshMarket(market.id);
        }
      });
      
      // Update the markets state with the refreshed markets
      const refreshedMarkets = getMarkets();
      setMarkets(refreshedMarkets);
      
      setMessage("All eligible markets have been refreshed!");
      
      // Clear message after delay
      setTimeout(() => {
        setMessage('');
      }, 2000);
    } catch (err) {
      console.error("Error refreshing all markets:", err);
      setMessage("Error refreshing markets. Please try again.");
    }
  };
  
  // Added useEffect to ensure gold is always synced with gameState
  useEffect(() => {
    // This will run whenever gameState changes, ensuring gold display is in sync
    const currentGold = getPlayerGold();
    if (currentGold !== gold) {
      setGold(currentGold);
    }
  }, [gameState.marketData.gold]); // Only re-run when marketData.gold changes
  
  if (isLoading) {
    return (
      <div className={styles.marketContainer} ref={marketContainerRef}>
        <div className={styles.loadingMessage}>Loading markets...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.marketContainer} ref={marketContainerRef}>
        <div className={styles.errorMessage}>{error}</div>
        <button className={styles.closeButton} onClick={onClose}>Close</button>
      </div>
    );
  }
  
  return (
    <div 
      className={styles.marketContainer}
      ref={marketContainerRef}
      style={{
        zIndex: 10000, 
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        border: '5px solid red', // Debug border
        width: '90%',
        maxWidth: '1200px',
        height: '80vh',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        boxShadow: '0 0 40px rgba(0,0,0,0.5)',
        overflow: 'auto'
      }}
    >
      {/* Debug element to confirm rendering */}
      <div style={{
        position: 'absolute', 
        top: 0, 
        left: 0, 
        background: 'red', 
        color: 'white', 
        padding: '5px', 
        fontSize: '16px',
        zIndex: 10001,
        fontWeight: 'bold'
      }}>
        Market UI Rendered
      </div>
      
      {/* Always visible close button */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 10002
      }}>
        <button 
          onClick={handleMarketClose}
          style={{
            backgroundColor: '#6d4ca3',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Close Market
        </button>
      </div>
      
      <div className={styles.marketHeader}>
        <h2>Wizards Market</h2>
        <div className={styles.marketControls}>
          <div className={styles.goldAmount}>{gold} Gold</div>
          <button 
            className={styles.refreshAllButton}
            onClick={handleRefreshAllMarkets}
          >
            Refresh All Markets
          </button>
        </div>
      </div>
      
      {message && (
        <div className={styles.globalMessage}>{message}</div>
      )}
      
      {/* Debug panel showing market data state */}
      <div style={{
        background: '#f0f0f0', 
        border: '3px dashed blue', 
        padding: '10px', 
        margin: '10px 0',
        fontSize: '14px'
      }}>
        <div><strong>DEBUG INFO:</strong></div>
        <div>Markets loaded: {markets.length}</div>
        <div>Selected market: {selectedMarket?.name || 'None'}</div>
        <div>Selected market ID: {selectedMarketId || 'None'}</div>
        <div>Selected tab: {selectedTab}</div>
        <div>Mode: {mode}</div>
        <div>Has items in selected market: {selectedMarket && selectedMarket.inventory ? 'Yes' : 'No'}</div>
        <div>Items in current view: {mode === 'buy' ? filteredInventory.length : filteredPlayerInventory.length}</div>
        
        {/* Emergency manual refresh controls */}
        <div style={{ marginTop: '10px', padding: '5px', border: '2px solid red' }}>
          <div><strong>EMERGENCY REFRESH CONTROLS:</strong></div>
          <button 
            onClick={() => {
              if (selectedMarketId) {
                visitMarket(selectedMarketId);
                const refreshedMarket = getMarketById(selectedMarketId);
                console.log('EMERGENCY: Manually refreshed market data:', {
                  id: refreshedMarket.id,
                  hasInventory: !!refreshedMarket.inventory,
                  ingredients: refreshedMarket.inventory?.ingredients?.length || 0,
                  potions: refreshedMarket.inventory?.potions?.length || 0,
                  equipment: refreshedMarket.inventory?.equipment?.length || 0
                });
                // Force a re-render
                setMarkets(prevMarkets => {
                  const newMarkets = [...prevMarkets];
                  const index = newMarkets.findIndex(m => m.id === selectedMarketId);
                  if (index >= 0) {
                    newMarkets[index] = refreshedMarket;
                  }
                  return newMarkets;
                });
              } else {
                console.log('EMERGENCY: No market selected to refresh');
              }
            }}
            style={{
              backgroundColor: 'red',
              color: 'white',
              fontWeight: 'bold',
              padding: '5px 10px',
              marginRight: '10px'
            }}
          >
            FORCE REFRESH MARKET
          </button>
          
          <button
            onClick={() => {
              // Cycle through available tabs to find one with items
              if (selectedMarket && selectedMarket.inventory) {
                if (selectedTab === 'ingredients') {
                  console.log('EMERGENCY: Switching to potions tab');
                  setSelectedTab('potions');
                } else if (selectedTab === 'potions') {
                  console.log('EMERGENCY: Switching to equipment tab');
                  setSelectedTab('equipment');
                } else {
                  console.log('EMERGENCY: Switching to ingredients tab');
                  setSelectedTab('ingredients');
                }
              }
            }}
            style={{
              backgroundColor: 'orange',
              color: 'white',
              fontWeight: 'bold',
              padding: '5px 10px'
            }}
          >
            CYCLE TABS
          </button>
        </div>
      </div>
      
      <div className={styles.marketControls}>
        <div className={styles.marketSelect}>
          <label>Choose Market:</label>
          <select 
            value={selectedMarketId || ''}
            onChange={(e) => handleMarketChange(e.target.value)}
          >
            {availableMarkets.map((market) => (
              <option key={market.id} value={market.id}>
                {market.name}
              </option>
            ))}
          </select>
        </div>
        
        {selectedMarket && (
          <div className={styles.marketInfo}>
            <p>{selectedMarket.description}</p>
            <div className={styles.refreshInfo}>
              {selectedMarket.lastRefreshed ? (
                <p>Last refreshed: {new Date(selectedMarket.lastRefreshed).toLocaleString()}</p>
              ) : (
                <p>Market inventory is fresh</p>
              )}
              
              <button 
                className={styles.refreshButton}
                onClick={() => handleRefreshMarket(selectedMarket.id)}
                disabled={!isMarketRefreshAvailable(selectedMarket)}
              >
                {isMarketRefreshAvailable(selectedMarket) 
                  ? "Refresh Market" 
                  : "Refresh Available in " + Math.ceil(12 - ((Date.now() - new Date(selectedMarket.lastRefreshed || 0).getTime()) / (1000 * 60 * 60))) + " hours"}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className={styles.tabNavigation}>
        <button 
          className={selectedTab === 'ingredients' ? styles.activeTab : styles.tab}
          onClick={() => setSelectedTab('ingredients')}
        >
          Ingredients
        </button>
        <button 
          className={selectedTab === 'potions' ? styles.activeTab : styles.tab}
          onClick={() => setSelectedTab('potions')}
        >
          Potions
        </button>
        <button 
          className={selectedTab === 'equipment' ? styles.activeTab : styles.tab}
          onClick={() => setSelectedTab('equipment')}
        >
          Equipment
        </button>
      </div>
      
      <div className={styles.buySellToggle}>
        <button 
          className={mode === 'buy' ? styles.activeBuySell : styles.buySell}
          onClick={() => setMode('buy')}
        >
          Buy
        </button>
        <button 
          className={mode === 'sell' ? styles.activeBuySell : styles.buySell}
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
      
      <div className={styles.mainContent} style={{ 
        border: '2px solid green', 
        padding: '10px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        minHeight: '300px'
      }}>
        <div className={styles.itemsListing} style={{ 
          border: '2px dashed purple', 
          minHeight: '200px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '15px',
          padding: '15px',
          backgroundColor: 'white'
        }}>
          {/* Debug information about inventory */}
          <div style={{ 
            gridColumn: '1 / -1', 
            backgroundColor: '#f0f0f0', 
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '4px'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Inventory Debug:</h3>
            <div>Selected Market: {selectedMarket?.name || 'None'}</div>
            <div>Selected Tab: {selectedTab}</div>
            <div>Mode: {mode}</div>
            <div>Items to Display: {mode === 'buy' ? filteredInventory.length : filteredPlayerInventory.length}</div>
            
            {selectedMarket && selectedMarket.inventory && (
              <div>
                <div>Raw Inventory Counts:</div>
                <div>- Ingredients: {selectedMarket.inventory.ingredients?.length || 0}</div>
                <div>- Potions: {selectedMarket.inventory.potions?.length || 0}</div>
                <div>- Equipment: {selectedMarket.inventory.equipment?.length || 0}</div>
              </div>
            )}
          </div>
          
          {/* Direct rendering of inventory items from selected market */}
          {mode === 'buy' && selectedMarket && selectedMarket.inventory && (
            <div style={{ gridColumn: '1 / -1', marginBottom: '20px' }}>
              <h3 style={{ color: 'blue' }}>Direct Inventory Access:</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '10px'
              }}>
                {selectedTab === 'ingredients' && selectedMarket.inventory.ingredients && 
                  selectedMarket.inventory.ingredients.map((item, index) => (
                    <div key={index} style={{ 
                      border: '1px solid #ddd', 
                      padding: '10px', 
                      borderRadius: '4px',
                      backgroundColor: '#f9fff9'
                    }}>
                      <div style={{ fontWeight: 'bold' }}>{item?.item?.name || 'Unknown Item'}</div>
                      <div>{item?.currentPrice || 0} gold</div>
                    </div>
                  ))
                }
                {selectedTab === 'potions' && selectedMarket.inventory.potions && 
                  selectedMarket.inventory.potions.map((item, index) => (
                    <div key={index} style={{ 
                      border: '1px solid #ddd', 
                      padding: '10px', 
                      borderRadius: '4px',
                      backgroundColor: '#f9f9ff'
                    }}>
                      <div style={{ fontWeight: 'bold' }}>{item?.item?.name || 'Unknown Item'}</div>
                      <div>{item?.currentPrice || 0} gold</div>
                    </div>
                  ))
                }
                {selectedTab === 'equipment' && selectedMarket.inventory.equipment && 
                  selectedMarket.inventory.equipment.map((item, index) => (
                    <div key={index} style={{ 
                      border: '1px solid #ddd', 
                      padding: '10px', 
                      borderRadius: '4px',
                      backgroundColor: '#fff9f9'
                    }}>
                      <div style={{ fontWeight: 'bold' }}>{item?.item?.name || 'Unknown Item'}</div>
                      <div>{item?.currentPrice || 0} gold</div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
          
          {/* Regular rendering path using filteredInventory */}
          <div style={{ gridColumn: '1 / -1' }}>
            <h3 style={{ color: 'green' }}>Filtered Items:</h3>
            
            {mode === 'buy' ? (
              filteredInventory.length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '10px'
                }}>
                  {filteredInventory.map((item, index) => renderItemCard(item, true))}
                </div>
              ) : (
                <div className={styles.noItems}>No filtered items available.</div>
              )
            ) : (
              filteredPlayerInventory.length > 0 ? (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '10px'
                }}>
                  {filteredPlayerInventory.map((item, index) => renderItemCard(item, false))}
                </div>
              ) : (
                <div className={styles.noItems}>You don't have any filtered items of this type to sell.</div>
              )
            )}
          </div>
        </div>
        
        {selectedItem && (
          <div className={styles.selectedItem}>
            <h3>{mode === 'buy' ? 'Buy Item' : 'Sell Item'}</h3>
            
            <div className={styles.itemDetails}>
              <strong>{mode === 'buy' ? selectedItem.item.name : selectedItem.name}</strong>
              <p>{mode === 'buy' ? selectedItem.item.description : selectedItem.description}</p>
            </div>
            
            <div className={styles.quantityControls}>
              <span>Quantity:</span>
              <div>
                <button 
                  className={styles.quantityButton}
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  className={styles.quantityButton}
                  onClick={incrementQuantity}
                >
                  +
                </button>
              </div>
            </div>
            
            <div className={styles.priceDetails}>
              <span>Price per item: {mode === 'buy' ? selectedItem.currentPrice : (selectedItem.value || 0)} gold</span>
              <span>Total: {totalPrice} gold</span>
            </div>
            
            <button 
              className={mode === 'buy' && gold < totalPrice ? styles.disabledButton : styles.buySellButton}
              onClick={mode === 'buy' ? handleBuy : handleSell}
              disabled={mode === 'buy' && gold < totalPrice}
            >
              {mode === 'buy' ? 'Buy' : 'Sell'}
            </button>
            
            {message && (
              <div className={styles.message}>{message}</div>
            )}
          </div>
        )}
      </div>
      
      {showAttackModal && attacker && (
        <div className={styles.attackModal}>
          <div className={styles.modalContent}>
            <h2>Market Ambush!</h2>
            <p>As you leave the market, you are ambushed by a {attacker.name}!</p>
            <p>They demand your gold and valuable ingredients.</p>
            
            <div className={styles.buttonGroup}>
              <button 
                className={styles.fightButton}
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
              <div className={styles.message}>{message}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 

// Create a wrapped version of MarketUI with ErrorBoundary and export as default
export const MarketUI: React.FC<MarketUIProps> = (props) => {
  console.log('MarketUIWithErrorBoundary: About to render with props', props);
  
  // Add debugging styles to ensure visibility 
  return (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 999999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}
    >
      <div style={{
        backgroundColor: '#ddd',
        border: '5px solid lime',
        padding: '5px',
        width: '95%',
        maxWidth: '1200px',
        height: '90%',
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{
          backgroundColor: 'black',
          color: 'white',
          padding: '5px',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          DEBUG MARKET UI WRAPPER
        </div>
        <div style={{flex: 1, overflow: 'auto', position: 'relative'}}>
          <_MarketUI {...props} />
        </div>
      </div>
    </div>
  );
}; 