import React, { useState, useEffect } from 'react';
import { useGameStateStore } from '../../game-state/gameStateStore';
import { 
  MarketLocation, 
  MarketItem, 
  Ingredient, 
  Potion, 
  Equipment,
  SpellScroll, 
  Wizard 
} from '../../types';

interface StreamlinedMarketUIProps {
  onClose: () => void;
}

// Rarity color mapping
const RARITY_COLORS = {
  common: '#c0c0c0',
  uncommon: '#00cc00',
  rare: '#0088ff',
  epic: '#cc00ff',
  legendary: '#ffaa00'
};

const StreamlinedMarketUI: React.FC<StreamlinedMarketUIProps> = ({ onClose }) => {
  // Game state store functions
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
    getPlayerScrolls
  } = useGameStateStore();
  
  // UI state
  const [loadingState, setLoadingState] = useState<'initial' | 'markets' | 'inventory' | 'complete'>('initial');
  const [markets, setMarkets] = useState<MarketLocation[]>([]);
  const [availableMarkets, setAvailableMarkets] = useState<MarketLocation[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'ingredients' | 'potions' | 'equipment' | 'scrolls'>('ingredients');
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [gold, setGold] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Market attack state
  const [showAttackModal, setShowAttackModal] = useState(false);
  const [attacker, setAttacker] = useState<Wizard | null>(null);
  
  // Initialize markets on component mount
  useEffect(() => {
    const initializeMarkets = async () => {
      try {
        setLoadingState('markets');
        
        // Get all markets
        const allMarkets = getMarkets();
        if (!allMarkets || allMarkets.length === 0) {
          setError('No markets available. Please try again later.');
          return;
        }
        
        // Store all markets
        setMarkets(allMarkets);
        
        // Filter available markets based on player level
        const filtered = allMarkets.filter(
          market => market.unlockLevel <= gameState.player.level
        );
        setAvailableMarkets(filtered);
        
        // Default selection: first available market
        if (filtered.length > 0) {
          setSelectedMarketId(filtered[0].id);
        }
        
        // Update gold
        setGold(getPlayerGold());
        
        setLoadingState('complete');
      } catch (err) {
        console.error('Error initializing markets:', err);
        setError('Failed to load markets. Please try again later.');
      }
    };
    
    initializeMarkets();
  }, [getMarkets, getPlayerGold, gameState.player.level]);
  
  // Selected market object
  const selectedMarket = selectedMarketId ? getMarketById(selectedMarketId) : null;
  
  // Handle market travel (with attack chance)
  const handleTravel = () => {
    if (!selectedMarketId) return;
    
    setLoadingState('inventory');
    
    // Visit the selected market to ensure inventory is generated
    visitMarket(selectedMarketId);
    
    // Check for market attack
    const attackResult = checkForMarketAttack(selectedMarketId);
    
    if (attackResult.attacked && attackResult.attacker) {
      // Show attack modal if an attack occurs
      setAttacker(attackResult.attacker);
      setShowAttackModal(true);
    }
    
    // Update with the latest market data
    const updatedMarkets = getMarkets();
    setMarkets(updatedMarkets);
    
    // Update available markets
    const filtered = updatedMarkets.filter(
      market => market.unlockLevel <= gameState.player.level
    );
    setAvailableMarkets(filtered);
    
    setLoadingState('complete');
  };
  
  // Get inventory based on selected tab and filtering
  const getFilteredInventory = () => {
    if (!selectedMarket) return [];
    
    let items: any[] = [];
    
    switch (selectedTab) {
      case 'ingredients':
        items = selectedMarket.inventory.ingredients || [];
        break;
      case 'potions':
        items = selectedMarket.inventory.potions || [];
        break;
      case 'equipment':
        items = selectedMarket.inventory.equipment || [];
        break;
      case 'scrolls':
        items = selectedMarket.inventory.scrolls || [];
        break;
      default:
        items = [];
    }
    
    // Filter by search term if provided
    if (searchTerm) {
      return items.filter(item => 
        item.item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return items;
  };
  
  // Get player inventory based on selected tab and filtering
  const getFilteredPlayerInventory = () => {
    if (!gameState.player) return [];
    
    let items: any[] = [];
    
    switch (selectedTab) {
      case 'ingredients':
        items = gameState.player.ingredients || [];
        break;
      case 'potions':
        items = gameState.player.potions || [];
        break;
      case 'equipment':
        items = gameState.player.inventory || [];
        break;
      case 'scrolls':
        // Get player scrolls through store function if available
        items = getPlayerScrolls() || [];
        break;
      default:
        items = [];
    }
    
    // Filter by search term if provided
    if (searchTerm) {
      return items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return items;
  };
  
  // Handle buying items
  const handleBuy = () => {
    if (!selectedMarket || !selectedItem) return;
    
    // Convert UI tab names to API parameter names
    const itemTypeMap = {
      'ingredients': 'ingredient',
      'potions': 'potion',
      'equipment': 'equipment',
      'scrolls': 'scroll'
    };
    
    const itemType = itemTypeMap[selectedTab] as 'ingredient' | 'potion' | 'equipment' | 'scroll';
    
    const result = buyItem(
      selectedMarket.id,
      itemType,
      selectedItem.item.id,
      quantity
    );
    
    // Show result message
    setMessage(result.message);
    
    // Update gold
    setGold(getPlayerGold());
    
    // Clear selection after successful purchase
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
    
    // Convert UI tab names to API parameter names
    const itemTypeMap = {
      'ingredients': 'ingredient',
      'potions': 'potion',
      'equipment': 'equipment',
      'scrolls': 'scroll'
    };
    
    const itemType = itemTypeMap[selectedTab] as 'ingredient' | 'potion' | 'equipment' | 'scroll';
    
    const result = sellItem(
      selectedMarket.id,
      itemType,
      selectedItem.id,
      quantity
    );
    
    // Show result message
    setMessage(result.message);
    
    // Update gold
    setGold(getPlayerGold());
    
    // Clear selection after successful sale
    if (result.success) {
      setTimeout(() => {
        setSelectedItem(null);
        setMessage('');
      }, 2000);
    }
  };
  
  // Handle market close (with possible attack)
  const handleMarketClose = () => {
    if (!selectedMarketId) {
      onClose();
      return;
    }
    
    // Check for possible market attack when leaving
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
  
  // Handle accepting a duel with market attacker
  const handleAcceptDuel = () => {
    if (!attacker) return;
    
    // Store attacker in sessionStorage for battle
    sessionStorage.setItem('marketAttacker', JSON.stringify(attacker));
    
    // Set location to duel
    setCurrentLocation('duel');
    setShowAttackModal(false);
    
    // Close market UI
    onClose();
  };
  
  // Handle fleeing from market attacker
  const handleFlee = () => {
    if (!attacker) return;
    
    // Random chance to successfully flee (50%)
    const fleeSuccessful = Math.random() >= 0.5;
    
    if (fleeSuccessful) {
      setMessage('You managed to escape!');
      setTimeout(() => {
        setShowAttackModal(false);
        onClose();
      }, 1500);
    } else {
      // Failed to flee, must fight
      setMessage('You failed to escape! You must fight!');
      setTimeout(() => {
        handleAcceptDuel();
      }, 1500);
    }
  };
  
  // Helper functions
  const formatGold = (amount: number) => `${amount.toLocaleString()} Gold`;
  
  const incrementQuantity = () => {
    if (!selectedItem) return;
    
    const maxQuantity = mode === 'buy' 
      ? selectedItem.quantity 
      : (selectedItem.quantity || 1);
    
    setQuantity(prev => Math.min(prev + 1, maxQuantity));
  };
  
  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };
  
  // Render item card based on mode
  const renderItemCard = (item: any, isBuyMode: boolean) => {
    const isSelected = selectedItem && 
      (isBuyMode 
        ? selectedItem.item.id === item.item.id 
        : selectedItem.id === item.id);
    
    // Get appropriate rarity and name
    const rarity = isBuyMode ? item.item.rarity : item.rarity;
    const name = isBuyMode ? item.item.name : item.name;
    const rarityColor = RARITY_COLORS[rarity] || RARITY_COLORS.common;
    
    const handleCardClick = () => {
      setSelectedItem(item);
      setQuantity(1);
    };
    
    return (
      <div 
        key={isBuyMode ? item.item.id : item.id} 
        className={`market-item-card ${isSelected ? 'selected' : ''}`}
        onClick={handleCardClick}
        style={{ 
          border: `2px solid ${rarityColor}`,
          backgroundColor: isSelected ? `${rarityColor}22` : 'transparent',
          padding: '8px',
          margin: '4px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        <div style={{ 
          backgroundColor: rarityColor, 
          color: '#000',
          padding: '4px',
          borderRadius: '4px 4px 0 0',
          fontWeight: 'bold'
        }}>
          {name}
        </div>
        <div style={{ padding: '4px' }}>
          {isBuyMode ? (
            <>
              <div>Price: {item.currentPrice} gold</div>
              <div>Available: {item.quantity}</div>
            </>
          ) : (
            <div>Value: {Math.floor((item.value || 10) * 0.7)} gold</div>
          )}
        </div>
      </div>
    );
  };
  
  // Loading state rendering
  if (loadingState === 'initial' || loadingState === 'markets') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        <h2 style={{ color: '#fff', marginBottom: '20px' }}>Loading Markets...</h2>
        <div style={{ 
          width: '200px', 
          height: '20px', 
          backgroundColor: '#333', 
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: loadingState === 'initial' ? '30%' : '60%', 
            height: '100%', 
            backgroundColor: '#0088ff',
            transition: 'width 0.5s ease-in-out'
          }} />
        </div>
      </div>
    );
  }
  
  // Error state rendering
  if (error) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        <h2 style={{ color: '#ff4444', marginBottom: '20px' }}>Error</h2>
        <p style={{ color: '#fff', marginBottom: '20px' }}>{error}</p>
        <button 
          onClick={onClose}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0088ff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Return to Study
        </button>
      </div>
    );
  }
  
  // Market attack modal
  if (showAttackModal) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        <div style={{
          backgroundColor: '#222',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#ff4444', marginBottom: '20px' }}>Market Attack!</h2>
          <p style={{ color: '#fff', marginBottom: '20px' }}>
            {attacker ? `A ${attacker.name} has ambushed you!` : 'You are being attacked!'}
          </p>
          {message && (
            <p style={{ color: '#ffaa00', marginBottom: '20px' }}>{message}</p>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <button 
              onClick={handleAcceptDuel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#cc0000',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Fight
            </button>
            <button 
              onClick={handleFlee}
              style={{
                padding: '10px 20px',
                backgroundColor: '#666',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Try to Flee
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Main market UI
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#222',
        width: '90%',
        maxWidth: '1000px',
        height: '90%',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Market Header */}
        <div style={{
          padding: '15px',
          backgroundColor: '#333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '18px',
              color: '#ffaa00',
              marginRight: '15px'
            }}>
              Wizard's Choice
            </div>
            <h2 style={{ margin: 0, color: '#fff' }}>
              {selectedMarket ? `${selectedMarket.name} Market` : 'Market'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              backgroundColor: '#444',
              padding: '5px 10px',
              borderRadius: '4px',
              marginRight: '15px',
              color: '#ffaa00',
              fontWeight: 'bold'
            }}>
              {formatGold(gold)}
            </div>
            <button 
              onClick={handleMarketClose}
              style={{
                padding: '8px 15px',
                backgroundColor: '#555',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Leave Market
            </button>
          </div>
        </div>
        
        {/* Market Controls */}
        <div style={{
          padding: '15px',
          backgroundColor: '#2a2a2a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <select 
              value={selectedMarketId || ''}
              onChange={(e) => setSelectedMarketId(e.target.value)}
              style={{
                padding: '8px',
                backgroundColor: '#333',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px',
                marginRight: '15px'
              }}
            >
              {availableMarkets.map(market => (
                <option key={market.id} value={market.id}>
                  {market.name}
                </option>
              ))}
            </select>
            <div style={{ 
              padding: '8px',
              flex: 1,
              color: '#aaa',
              fontSize: '14px'
            }}>
              {selectedMarket?.description}
            </div>
          </div>
          <button 
            onClick={handleTravel}
            style={{
              padding: '8px 15px',
              backgroundColor: '#0088ff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Travel to Market
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #444'
        }}>
          {(['ingredients', 'potions', 'equipment', 'scrolls'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedTab === tab ? '#333' : 'transparent',
                color: selectedTab === tab ? '#fff' : '#aaa',
                border: 'none',
                borderBottom: selectedTab === tab ? '2px solid #0088ff' : 'none',
                cursor: 'pointer',
                flex: 1,
                textTransform: 'capitalize'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Mode Toggle and Search */}
        <div style={{
          padding: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: '#2a2a2a'
        }}>
          <div>
            <button
              onClick={() => setMode('buy')}
              style={{
                padding: '8px 15px',
                backgroundColor: mode === 'buy' ? '#0088ff' : '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '4px 0 0 4px',
                cursor: 'pointer'
              }}
            >
              Buy
            </button>
            <button
              onClick={() => setMode('sell')}
              style={{
                padding: '8px 15px',
                backgroundColor: mode === 'sell' ? '#0088ff' : '#333',
                color: '#fff',
                border: 'none',
                borderRadius: '0 4px 4px 0',
                cursor: 'pointer'
              }}
            >
              Sell
            </button>
          </div>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px',
              backgroundColor: '#333',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '4px',
              width: '200px'
            }}
          />
        </div>
        
        {/* Main Content Area */}
        <div style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Item list */}
          <div style={{
            flex: 1,
            padding: '10px',
            overflowY: 'auto',
            backgroundColor: '#1a1a1a'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '10px'
            }}>
              {mode === 'buy' ? (
                getFilteredInventory().length > 0 ? (
                  getFilteredInventory().map(item => renderItemCard(item, true))
                ) : (
                  <div style={{ 
                    gridColumn: '1 / -1', 
                    padding: '20px', 
                    textAlign: 'center',
                    color: '#aaa'
                  }}>
                    No items available
                  </div>
                )
              ) : (
                getFilteredPlayerInventory().length > 0 ? (
                  getFilteredPlayerInventory().map(item => renderItemCard(item, false))
                ) : (
                  <div style={{ 
                    gridColumn: '1 / -1', 
                    padding: '20px', 
                    textAlign: 'center',
                    color: '#aaa'
                  }}>
                    No items to sell
                  </div>
                )
              )}
            </div>
          </div>
          
          {/* Item details panel */}
          {selectedItem && (
            <div style={{
              width: '300px',
              backgroundColor: '#2a2a2a',
              padding: '15px',
              borderLeft: '1px solid #444',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <h3 style={{ 
                margin: '0 0 15px 0', 
                color: RARITY_COLORS[mode === 'buy' ? selectedItem.item.rarity : selectedItem.rarity] 
              }}>
                {mode === 'buy' ? selectedItem.item.name : selectedItem.name}
              </h3>
              
              <p style={{ color: '#aaa', flex: 1 }}>
                {mode === 'buy' ? selectedItem.item.description : selectedItem.description || 'No description available.'}
              </p>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ color: '#fff', marginBottom: '5px' }}>
                  {mode === 'buy' ? 'Cost:' : 'Value:'} {
                    mode === 'buy' 
                      ? `${selectedItem.currentPrice} gold (each)` 
                      : `${Math.floor((selectedItem.value || 10) * 0.7)} gold (each)`
                  }
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <button 
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#333',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px 0 0 4px',
                      cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                      opacity: quantity <= 1 ? 0.5 : 1
                    }}
                  >
                    -
                  </button>
                  <div style={{
                    padding: '5px 10px',
                    backgroundColor: '#444',
                    color: '#fff',
                    textAlign: 'center',
                    minWidth: '40px'
                  }}>
                    {quantity}
                  </div>
                  <button 
                    onClick={incrementQuantity}
                    disabled={
                      mode === 'buy'
                        ? quantity >= selectedItem.quantity
                        : quantity >= (selectedItem.quantity || 1)
                    }
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#333',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '0 4px 4px 0',
                      cursor: 
                        mode === 'buy'
                          ? quantity >= selectedItem.quantity ? 'not-allowed' : 'pointer'
                          : quantity >= (selectedItem.quantity || 1) ? 'not-allowed' : 'pointer',
                      opacity: 
                        mode === 'buy'
                          ? quantity >= selectedItem.quantity ? 0.5 : 1
                          : quantity >= (selectedItem.quantity || 1) ? 0.5 : 1
                    }}
                  >
                    +
                  </button>
                </div>
                
                <div style={{ color: '#ffaa00', marginBottom: '10px' }}>
                  Total: {
                    mode === 'buy' 
                      ? selectedItem.currentPrice * quantity
                      : Math.floor((selectedItem.value || 10) * 0.7) * quantity
                  } gold
                </div>
              </div>
              
              <button
                onClick={mode === 'buy' ? handleBuy : handleSell}
                style={{
                  padding: '10px',
                  backgroundColor: mode === 'buy' ? '#00aa00' : '#aa7700',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {mode === 'buy' ? 'Buy' : 'Sell'}
              </button>
              
              {message && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '10px', 
                  backgroundColor: message.includes('success') ? '#00550055' : '#55000055',
                  color: message.includes('success') ? '#22ff22' : '#ff2222',
                  borderRadius: '4px'
                }}>
                  {message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamlinedMarketUI; 