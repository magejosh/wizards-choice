// src/lib/ui/components/WizardStudy.tsx
'use client';

import React, { useState } from 'react';
import { useGameStateStore } from '../../game-state/gameStateStore';
import { Wizard, Spell, Equipment, SpellScroll } from '../../types';
import PotionCraftingScreen from './PotionCraftingScreen';
import { MarketUI } from './MarketUI';
import SpellCard from './SpellCard';

interface WizardStudyProps {
  onStartDuel: () => void;
  onOpenDeckBuilder: () => void;
  onOpenEquipment: () => void;
  onOpenSpellbook: () => void;
  onReturnToMainMenu: () => void;
}

const WizardStudy: React.FC<WizardStudyProps> = ({
  onStartDuel,
  onOpenDeckBuilder,
  onOpenEquipment,
  onOpenSpellbook,
  onReturnToMainMenu
}) => {
  const { gameState, setCurrentLocation, getPlayerScrolls, consumeScrollToLearnSpell, checkIfScrollSpellKnown } = useGameStateStore();
  const { player } = gameState;
  
  // State to control the visibility of the potion crafting screen
  const [isPotionCraftingOpen, setIsPotionCraftingOpen] = useState(false);
  
  // State to control the visibility of the market screen
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  
  // State to control the visibility of the spell scrolls screen
  const [showScrolls, setShowScrolls] = useState(false);
  const [selectedScroll, setSelectedScroll] = useState<SpellScroll | null>(null);
  const [scrollLearningResult, setScrollLearningResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Handler for opening the potion crafting screen
  const handleOpenPotionCrafting = () => {
    setIsPotionCraftingOpen(true);
  };
  
  // Handler for closing the potion crafting screen
  const handleClosePotionCrafting = () => {
    setIsPotionCraftingOpen(false);
  };
  
  // Handler for opening the market screen
  const handleOpenMarket = () => {
    setIsMarketOpen(true);
  };
  
  // Handler for closing the market screen
  const handleCloseMarket = () => {
    setIsMarketOpen(false);
  };
  
  // Get player scrolls
  const playerScrolls = getPlayerScrolls();
  
  // Function to handle learning a spell from a scroll
  const handleLearnSpell = (scrollId: string) => {
    const result = consumeScrollToLearnSpell(scrollId);
    setScrollLearningResult(result);
    setSelectedScroll(null);
    
    // Show result message for a few seconds, then clear it
    setTimeout(() => {
      setScrollLearningResult(null);
    }, 3000);
  };
  
  // If potion crafting is open, render the potion crafting screen
  if (isPotionCraftingOpen) {
    return <PotionCraftingScreen onClose={handleClosePotionCrafting} />;
  }
  
  // If market is open, render the market screen
  if (isMarketOpen) {
    return <MarketUI onClose={handleCloseMarket} />;
  }
  
  return (
    <div className="wizard-study">
      <div className="wizard-study__header">
        <h1 className="wizard-study__title">Wizard's Study</h1>
        <div className="wizard-study__player-info">
          <h2 className="wizard-study__player-name">{player.name}</h2>
          <div className="wizard-study__player-level">Level {player.level}</div>
        </div>
      </div>
      
      <div className="wizard-study__content">
        <div className="wizard-study__main-area">
          <div className="wizard-study__study-scene">
            {/* This would be a ThreeJS scene in the full implementation */}
            <div className="wizard-study__study-background"></div>
          </div>
          
          <div className="wizard-study__actions">
            <button 
              className="wizard-study__action wizard-study__action--primary"
              onClick={onStartDuel}
            >
              Start Next Duel
            </button>
            
            <div className="wizard-study__action-group">
              <button 
                className="wizard-study__action"
                onClick={onOpenDeckBuilder}
              >
                Deck Builder
              </button>
              
              <button 
                className="wizard-study__action"
                onClick={onOpenEquipment}
              >
                Equipment
              </button>
              
              <button 
                className="wizard-study__action"
                onClick={onOpenSpellbook}
              >
                Spellbook
              </button>
            </div>
            
            <div className="wizard-study__secondary-actions">
              <button 
                className="wizard-study__action wizard-study__action--secondary"
                onClick={handleOpenPotionCrafting}
              >
                Potion Crafting
              </button>
              
              <button 
                className="wizard-study__action wizard-study__action--secondary"
                onClick={handleOpenMarket}
              >
                Marketplace
              </button>
            </div>
            
            <button 
              className="wizard-study__action wizard-study__action--secondary"
              onClick={() => setShowScrolls(true)}
            >
              Spell Scrolls
            </button>
            
            <button 
              className="wizard-study__action wizard-study__action--secondary"
              onClick={onReturnToMainMenu}
            >
              Return to Main Menu
            </button>
          </div>
        </div>
        
        <div className="wizard-study__sidebar">
          <div className="wizard-study__stats">
            <h3 className="wizard-study__stats-title">Wizard Stats</h3>
            <div className="wizard-study__stat">
              <span className="wizard-study__stat-label">Health:</span>
              <span className="wizard-study__stat-value">{player.health}/{player.maxHealth}</span>
            </div>
            <div className="wizard-study__stat">
              <span className="wizard-study__stat-label">Mana:</span>
              <span className="wizard-study__stat-value">{player.mana}/{player.maxMana}</span>
            </div>
            <div className="wizard-study__stat">
              <span className="wizard-study__stat-label">Mana Regen:</span>
              <span className="wizard-study__stat-value">{player.manaRegen}/turn</span>
            </div>
            <div className="wizard-study__stat">
              <span className="wizard-study__stat-label">Experience:</span>
              <span className="wizard-study__stat-value">{player.experience}/{player.experienceToNextLevel}</span>
            </div>
            <div className="wizard-study__stat">
              <span className="wizard-study__stat-label">Level-up Points:</span>
              <span className="wizard-study__stat-value">{player.levelUpPoints}</span>
            </div>
            <div className="wizard-study__stat">
              <span className="wizard-study__stat-label">Gold:</span>
              <span className="wizard-study__stat-value">{gameState.marketData.gold}</span>
            </div>
          </div>
          
          <div className="wizard-study__equipped">
            <h3 className="wizard-study__equipped-title">Equipped Items</h3>
            <div className="wizard-study__equipment-slots">
              {Object.entries(player.equipment).map(([slot, item]) => (
                item && (
                  <div key={slot} className="wizard-study__equipment-item">
                    <div className="wizard-study__equipment-name">{item.name}</div>
                    <div className="wizard-study__equipment-slot">{slot}</div>
                  </div>
                )
              ))}
            </div>
          </div>
          
          <div className="wizard-study__spells">
            <h3 className="wizard-study__spells-title">Equipped Spells</h3>
            <div className="wizard-study__spell-list">
              {player.equippedSpells.map((spell) => (
                <div key={spell.id} className="wizard-study__spell-item">
                  <div className="wizard-study__spell-name">{spell.name}</div>
                  <div className="wizard-study__spell-type">{spell.type} - {spell.element}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="wizard-study__ingredients">
            <h3 className="wizard-study__ingredients-title">Ingredients</h3>
            <div className="wizard-study__ingredients-count">
              {player.ingredients ? player.ingredients.length : 0} ingredients in inventory
            </div>
          </div>
        </div>
      </div>
      
      {/* Spell Scrolls Screen */}
      {showScrolls && (
        <div className="modal-overlay">
          <div className="modal-content scroll-collection">
            <h2>Spell Scrolls</h2>
            <p>Use spell scrolls to learn new spells permanently.</p>
            
            {scrollLearningResult && (
              <div className={`result-message ${scrollLearningResult.success ? 'success' : 'error'}`}>
                {scrollLearningResult.message}
              </div>
            )}
            
            {selectedScroll ? (
              <div className="scroll-details">
                <h3>{selectedScroll.name}</h3>
                <div className="scroll-spell-preview">
                  <SpellCard spell={selectedScroll.spell} />
                </div>
                <p>{selectedScroll.description}</p>
                <p className="scroll-rarity">Rarity: {selectedScroll.rarity}</p>
                
                {checkIfScrollSpellKnown(selectedScroll.id) ? (
                  <p className="already-known">You already know this spell.</p>
                ) : (
                  <button 
                    onClick={() => handleLearnSpell(selectedScroll.id)}
                    className="learn-spell-button"
                  >
                    Learn Spell
                  </button>
                )}
                
                <button 
                  onClick={() => setSelectedScroll(null)}
                  className="back-button"
                >
                  Back to Scrolls
                </button>
              </div>
            ) : (
              <>
                {playerScrolls.length === 0 ? (
                  <div className="no-scrolls">
                    <p>You don't have any spell scrolls yet. Defeat enemies or visit the market to find spell scrolls.</p>
                  </div>
                ) : (
                  <div className="scrolls-grid">
                    {playerScrolls.map(scroll => (
                      <div 
                        key={scroll.id} 
                        className={`scroll-item ${checkIfScrollSpellKnown(scroll.id) ? 'already-known' : ''}`}
                        onClick={() => setSelectedScroll(scroll)}
                      >
                        <h4>{scroll.name}</h4>
                        <p className="scroll-rarity">{scroll.rarity}</p>
                        {checkIfScrollSpellKnown(scroll.id) && (
                          <div className="known-badge">Known</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            
            <button onClick={() => setShowScrolls(false)} className="close-button">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WizardStudy;
