'use client';

import React, { useState, useEffect } from 'react';
import { useGameStateStore } from '../../game-state/gameStateStore';
import styles from '../styles/MarketUI.module.css';
import ErrorBoundary from './ErrorBoundary';
import { setPerformanceMonitoring, trackRenderStart } from '../../utils/performance';
import { getMockMarkets } from '../../utils/marketMockData';

interface SimpleMarketUIProps {
  onClose: () => void;
  useMockData?: boolean;
}

const SimpleMarketUI: React.FC<SimpleMarketUIProps> = ({ onClose, useMockData = false }) => {
  // Enable performance monitoring
  useEffect(() => {
    setPerformanceMonitoring(true);
    return () => setPerformanceMonitoring(false);
  }, []);

  // Track component render time
  const endRenderTracking = trackRenderStart('SimpleMarketUI');
  
  // Log component mount
  console.log('SimpleMarketUI: Component rendering');
  
  // Get game state
  const { getMarkets, getPlayerGold } = useGameStateStore();
  
  // State hooks
  const [markets, setMarkets] = useState([]);
  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const [gold, setGold] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use either mock data or data from game state
  useEffect(() => {
    try {
      if (useMockData) {
        // Use mock data
        const mockMarkets = getMockMarkets();
        setMarkets(mockMarkets);
        setGold(1000); // Default gold amount for testing
        
        // Select the first market
        if (mockMarkets.length > 0) {
          setSelectedMarketId(mockMarkets[0].id);
        }
        
        setIsLoading(false);
      } else {
        // Use data from game state
        const markets = getMarkets();
        setMarkets(markets);
        setGold(getPlayerGold());
        
        // Select the first market
        if (markets.length > 0) {
          setSelectedMarketId(markets[0].id);
        }
        
        setIsLoading(false);
      }
    } catch (err) {
      console.error('SimpleMarketUI: Error loading data:', err);
      setError('Failed to load market data');
      setIsLoading(false);
    }
  }, [getMarkets, getPlayerGold, useMockData]);
  
  // End render tracking
  useEffect(() => {
    return endRenderTracking;
  }, [endRenderTracking]);
  
  // Helper to get selected market
  const selectedMarket = markets.find(m => m.id === selectedMarketId);
  
  // Handle market selection change
  const handleMarketChange = (e) => {
    setSelectedMarketId(e.target.value);
  };
  
  if (isLoading) {
    return (
      <div className={styles.marketContainer}>
        <div className={styles.loadingMessage}>Loading markets...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={styles.marketContainer}>
        <div className={styles.errorMessage}>{error}</div>
        <button className={styles.closeButton} onClick={onClose}>Close</button>
      </div>
    );
  }
  
  return (
    <div className={styles.marketContainer}>
      <div className={styles.marketHeader}>
        <h2>Wizards Market</h2>
        <div className={styles.goldAmount}>{gold} Gold</div>
        <button className={styles.closeButton} onClick={onClose}>Close</button>
      </div>
      
      <div className={styles.marketControls}>
        <div className={styles.marketSelect}>
          <label>Choose Market:</label>
          <select value={selectedMarketId} onChange={handleMarketChange}>
            {markets.map((market) => (
              <option key={market.id} value={market.id}>
                {market.name}
              </option>
            ))}
          </select>
        </div>
        
        {selectedMarket && (
          <div className={styles.marketInfo}>
            <p>{selectedMarket.description}</p>
          </div>
        )}
      </div>
      
      <div className={styles.tabContainer}>
        <button className={`${styles.tabButton} ${styles.activeTab}`}>
          Ingredients
        </button>
        <button className={styles.tabButton}>Potions</button>
        <button className={styles.tabButton}>Equipment</button>
        <button className={styles.tabButton}>Scrolls</button>
      </div>
      
      <div className={styles.modeToggle}>
        <button className={`${styles.modeButton} ${styles.activeMode}`}>Buy</button>
        <button className={styles.modeButton}>Sell</button>
      </div>
      
      <div className={styles.searchBar}>
        <input type="text" placeholder="Search items..." />
      </div>
      
      <div className={styles.marketContent}>
        <div className={styles.itemList}>
          {selectedMarket && selectedMarket.inventory.ingredients.map((item) => (
            <div key={item.item.id} className={styles.itemCard}>
              <div 
                className={styles.itemHeader} 
                style={{ backgroundColor: getRarityColor(item.item.rarity) }}
              >
                <h4>{item.item.name}</h4>
                <span className={styles.rarityBadge}>{item.item.rarity}</span>
              </div>
              <div className={styles.itemDetails}>
                <p>{item.item.description}</p>
                <div className={styles.itemProperties}>
                  <span>Properties: {item.item.properties.join(', ')}</span>
                  <span>Price: {item.currentPrice} gold</span>
                  <span>Quantity: {item.quantity}</span>
                </div>
              </div>
            </div>
          ))}
          
          {selectedMarket && selectedMarket.inventory.ingredients.length === 0 && (
            <div className={styles.emptyMessage}>No ingredients available at this market.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get color based on rarity
function getRarityColor(rarity) {
  const colors = {
    common: '#c0c0c0',
    uncommon: '#00cc00',
    rare: '#0088ff',
    epic: '#cc00ff',
    legendary: '#ffaa00'
  };
  return colors[rarity] || colors.common;
}

// Wrap component with ErrorBoundary
const SimpleMarketUIWithErrorBoundary: React.FC<SimpleMarketUIProps> = (props) => {
  return (
    <ErrorBoundary 
      onError={(error, info) => {
        console.error('SimpleMarketUI Error:', error, info);
      }}
      fallback={
        <div className="error-fallback">
          <h2>Something went wrong with the Market UI</h2>
          <p>We've encountered an error while loading the market.</p>
          <button onClick={props.onClose}>Close Market</button>
        </div>
      }
    >
      <SimpleMarketUI {...props} />
    </ErrorBoundary>
  );
};

export default SimpleMarketUIWithErrorBoundary; 