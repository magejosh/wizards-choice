'use client';

import React, { useState, useEffect } from 'react';
import { useGameStateStore } from '../../game-state/gameStateStore';
import { MarketLocation, MarketItem, Ingredient, Potion, Equipment, IngredientRarity, Wizard } from '../../types';

interface WorkingMarketUIProps {
  onClose: () => void;
}

const RARITY_COLORS = {
  common: '#c0c0c0',
  uncommon: '#00cc00',
  rare: '#0088ff',
  epic: '#cc00ff',
  legendary: '#ffaa00'
};

const WorkingMarketUI: React.FC<WorkingMarketUIProps> = ({ onClose }) => {
  console.log('WorkingMarketUI: Component rendering');
  
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
    console.log('WorkingMarketUI: Starting initialization effect');
    let isMounted = true;
    
    const initializeMarketData = async () => {
      try {
        // Get available markets
        const fetchedMarkets = getMarkets();
        console.log('WorkingMarketUI: Fetched markets:', fetchedMarkets);
        
        if (!isMounted) return;
        
        if (!fetchedMarkets || fetchedMarkets.length === 0) {
          console.log('WorkingMarketUI: No markets available');
          setError('No markets available at this time.');
          setIsLoading(false);
          return;
        }

        // Update state if component is still mounted
        setMarkets(fetchedMarkets);
        const playerGold = getPlayerGold();
        console.log('WorkingMarketUI: Player gold:', playerGold);
        setGold(playerGold);
        
        // If no market is selected, select the first available one
        if (!selectedMarketId && fetchedMarkets.length > 0) {
          const firstAvailableMarket = fetchedMarkets.find(
            market => market.unlockLevel <= gameState.player.level
          );
          console.log('WorkingMarketUI: First available market:', firstAvailableMarket);
          if (firstAvailableMarket) {
            setSelectedMarketId(firstAvailableMarket.id);
            visitMarket(firstAvailableMarket.id);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('WorkingMarketUI: Initialization error:', err);
        if (isMounted) {
          setError('Failed to load market data. Please try again later.');
          setIsLoading(false);
        }
      }
    };

    initializeMarketData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [getMarkets, getPlayerGold, gameState.player.level, selectedMarketId, visitMarket]);
  
  // Reset quantity when selecting a new item
  useEffect(() => {
    setQuantity(1);
  }, [selectedItem]);
  
  // Update gold when it changes in the game state
  useEffect(() => {
    setGold(getPlayerGold());
  }, [getPlayerGold]);
  
  // Create derived data outside of render using useMemo or just regular variables
  const selectedMarket = selectedMarketId ? getMarketById(selectedMarketId) : null;
  
  // Filter markets based on player level
  const availableMarkets = markets.filter(
    market => market.unlockLevel <= gameState.player.level
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
  
  // Get player's inventory based on selected tab
  const getPlayerInventory = () => {
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
  
  // Filter player's inventory based on search term
  const filteredPlayerInventory = getPlayerInventory().filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Event handlers
  const handleMarketChange = (marketId: string) => {
    setSelectedMarketId(marketId);
    visitMarket(marketId);
    setSelectedItem(null);
  };
  
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
    setGold(getPlayerGold()); // Update gold after purchase
    
    // Reset selection after successful purchase
    if (result.success) {
      setTimeout(() => {
        setSelectedItem(null);
        setMessage('');
      }, 2000);
    }
  };
  
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
    setGold(getPlayerGold()); // Update gold after sale
    
    // Reset selection after successful sale
    if (result.success) {
      setTimeout(() => {
        setSelectedItem(null);
        setMessage('');
      }, 2000);
    }
  };
  
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
  
  const handleAcceptDuel = () => {
    if (!attacker) return;
    
    // Store attacker in sessionStorage so it can be retrieved on battle page
    sessionStorage.setItem('marketAttacker', JSON.stringify(attacker));
    
    // Set location to duel and close the market UI
    setCurrentLocation('duel');
    setShowAttackModal(false);
    
    // Close the market UI and let the parent component handle navigation
    onClose();
  };
  
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
  
  const handleRefreshMarket = (marketId: string) => {
    refreshMarket(marketId);
    // Update markets state after refresh
    setTimeout(() => {
      setMarkets(getMarkets());
    }, 100);
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
        onClick={handleCardClick}
        style={{
          backgroundColor: 'white',
          borderRadius: '6px',
          border: `2px solid ${isSelected ? rarityColor : '#ddd'}`,
          overflow: 'hidden',
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          marginBottom: '10px',
          boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
        }}
      >
        <div style={{ 
          padding: '10px', 
          color: 'white', 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: rarityColor
        }}>
          <h4 style={{ margin: 0, fontSize: '16px' }}>{itemData.name}</h4>
          <span style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '12px',
            textTransform: 'capitalize'
          }}>
            {rarity}
          </span>
        </div>
        
        <div style={{ padding: '10px' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>
            {itemData.description}
          </p>
          
          {isBuyMode && (
            <div style={{
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid #eee',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              fontSize: '12px',
              color: '#666'
            }}>
              <span>Price: {item.currentPrice} gold</span>
              <span>Quantity: {item.quantity}</span>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Calculate total price
  const totalPrice = selectedItem 
    ? (mode === 'buy' ? selectedItem.currentPrice : selectedItem.value || 0) * quantity
    : 0;
  
  // Render loading state
  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#4a2c82'
        }}>
          Loading markets...
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        zIndex: 9999
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'red',
          marginBottom: '20px'
        }}>
          {error}
        </div>
        <button 
          style={{
            backgroundColor: '#6d4ca3',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
          onClick={onClose}
        >
          Return to Study
        </button>
      </div>
    );
  }

  // Render no market selected state
  if (!selectedMarket) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        zIndex: 9999
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: 'red',
          marginBottom: '20px'
        }}>
          No market selected.
        </div>
        <button 
          style={{
            backgroundColor: '#6d4ca3',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
          onClick={onClose}
        >
          Return to Study
        </button>
      </div>
    );
  }

  // Main market UI
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#f0f0f0',
      color: '#333',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      overflow: 'auto',
      zIndex: 9999
    }}>
      {/* Market Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '2px solid #ddd'
      }}>
        <h2 style={{ margin: 0, color: '#4a2c82', fontSize: '28px' }}>{selectedMarket.name}</h2>
        <span style={{ 
          fontWeight: 'bold',
          color: '#d4af37',
          backgroundColor: '#333',
          padding: '5px 10px',
          borderRadius: '4px'
        }}>
          Your Gold: {formatGold(gold)}
        </span>
        <button 
          style={{ 
            backgroundColor: '#6d4ca3',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={handleMarketClose}
        >
          Close
        </button>
      </div>
      
      {/* Market Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '20px',
        gap: '10px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <label style={{ fontWeight: 'bold', minWidth: '120px' }} htmlFor="market-select">Select Market:</label>
          <select 
            id="market-select" 
            value={selectedMarketId}
            onChange={(e) => handleMarketChange(e.target.value)}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              backgroundColor: 'white',
              flexGrow: 1,
              fontSize: '16px'
            }}
          >
            {availableMarkets.map(market => (
              <option key={market.id} value={market.id}>
                {market.name} (Level {market.unlockLevel})
              </option>
            ))}
          </select>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#e8e3f0',
          padding: '10px',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0, flexGrow: 1, fontStyle: 'italic' }}>{selectedMarket.description}</p>
          <button 
            style={{ 
              backgroundColor: '#6d4ca3',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={() => handleRefreshMarket(selectedMarket.id)}
          >
            Refresh Inventory
          </button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex',
        borderBottom: '1px solid #ddd',
        marginBottom: '20px'
      }}>
        <button 
          style={{ 
            padding: '10px 20px',
            backgroundColor: selectedTab === 'ingredients' ? '#6d4ca3' : '#e8e3f0',
            color: selectedTab === 'ingredients' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            marginRight: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={() => setSelectedTab('ingredients')}
        >
          Ingredients
        </button>
        <button 
          style={{ 
            padding: '10px 20px',
            backgroundColor: selectedTab === 'potions' ? '#6d4ca3' : '#e8e3f0',
            color: selectedTab === 'potions' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            marginRight: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={() => setSelectedTab('potions')}
        >
          Potions
        </button>
        <button 
          style={{ 
            padding: '10px 20px',
            backgroundColor: selectedTab === 'equipment' ? '#6d4ca3' : '#e8e3f0',
            color: selectedTab === 'equipment' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            marginRight: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={() => setSelectedTab('equipment')}
        >
          Equipment
        </button>
      </div>
      
      {/* Buy/Sell Toggle */}
      <div style={{
        display: 'flex',
        marginBottom: '20px'
      }}>
        <button 
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: mode === 'buy' ? '#6d4ca3' : '#e8e3f0',
            color: mode === 'buy' ? 'white' : 'black',
            border: 'none',
            borderRadius: '4px 0 0 4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={() => setMode('buy')}
        >
          Buy
        </button>
        <button 
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: mode === 'sell' ? '#6d4ca3' : '#e8e3f0',
            color: mode === 'sell' ? 'white' : 'black',
            border: 'none',
            borderRadius: '0 4px 4px 0',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={() => setMode('sell')}
        >
          Sell
        </button>
      </div>
      
      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder={`Search ${selectedTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '16px'
          }}
        />
      </div>
      
      {/* Market Content */}
      <div style={{
        display: 'flex',
        gap: '20px',
        flexGrow: 1,
        overflow: 'hidden'
      }}>
        {/* Item List */}
        <div style={{
          flex: 3,
          overflow: 'auto',
          paddingRight: '10px'
        }}>
          {mode === 'buy' ? (
            filteredInventory.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                {filteredInventory.map(item => renderItemCard(item, true))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontStyle: 'italic' }}>
                No items available in this category.
              </div>
            )
          ) : (
            filteredPlayerInventory.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                {filteredPlayerInventory.map(item => renderItemCard(item, false))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontStyle: 'italic' }}>
                You don't have any items in this category.
              </div>
            )
          )}
        </div>
        
        {/* Transaction Panel */}
        {selectedItem && (
          <div style={{
            flex: 1,
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '6px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#4a2c82' }}>{mode === 'buy' ? 'Buy' : 'Sell'} Item</h3>
            <h4 style={{ margin: '0 0 20px 0', color: '#333' }}>{mode === 'buy' ? selectedItem.item.name : selectedItem.name}</h4>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Quantity:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button 
                  onClick={decrementQuantity}
                  style={{
                    backgroundColor: '#6d4ca3',
                    color: 'white',
                    border: 'none',
                    width: '30px',
                    height: '30px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  -
                </button>
                <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 'bold' }}>{quantity}</span>
                <button 
                  onClick={incrementQuantity}
                  style={{
                    backgroundColor: '#6d4ca3',
                    color: 'white',
                    border: 'none',
                    width: '30px',
                    height: '30px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  +
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <span>Price per item: {mode === 'buy' ? selectedItem.currentPrice : (selectedItem.value || 0)} gold</span>
              <span>Total: {totalPrice} gold</span>
            </div>
            
            <button 
              onClick={mode === 'buy' ? handleBuy : handleSell}
              disabled={mode === 'buy' ? gold < totalPrice : false}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: mode === 'buy' && gold < totalPrice ? '#ccc' : '#6d4ca3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: mode === 'buy' && gold < totalPrice ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {mode === 'buy' ? 'Buy' : 'Sell'}
            </button>
            
            {message && (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                borderRadius: '4px',
                backgroundColor: '#f8f8f8',
                color: '#666'
              }}>
                {message}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Market Attack Modal */}
      {showAttackModal && attacker && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#4a2c82' }}>Market Ambush!</h2>
            <p style={{ margin: '0 0 20px 0', color: '#666' }}>As you leave the market, you are ambushed by a {attacker.name}!</p>
            <p style={{ margin: '0 0 20px 0', color: '#666' }}>They demand your gold and valuable ingredients.</p>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button 
                onClick={handleAcceptDuel}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6d4ca3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Fight!
              </button>
              <button 
                onClick={handleFlee}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#e8e3f0',
                  color: '#4a2c82',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Try to Flee (50% chance)
              </button>
            </div>
            
            {message && (
              <div style={{
                marginTop: '20px',
                padding: '10px',
                borderRadius: '4px',
                backgroundColor: '#f8f8f8',
                color: '#666'
              }}>
                {message}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkingMarketUI; 