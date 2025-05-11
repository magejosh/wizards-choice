'use client';

import React, { useState, useEffect, ErrorInfo } from 'react';
import { useGameStateStore, getWizard } from '../../lib/game-state/gameStateStore';
import { Wizard, Spell, Equipment, SpellScroll } from '../../lib/types';
import PotionCraftingScreen from '../potions/PotionCraftingScreen';
import { MarketUI } from '../market/MarketUI';
import SpellCard from '../ui/SpellCard';
import { PlayerProfileScreen } from '../profile/PlayerProfileScreen';
import ErrorBoundary from '../error/ErrorBoundary';
import DeckBuilder from '../deck/DeckBuilder';
import EquipmentScreen from '../equipment/EquipmentScreen';
import InventoryScreen from '../inventory/InventoryScreen';
import authService from '../../lib/auth/authService';
import { Sidebar, SidebarBody, SidebarLink } from '../ui/collapsible-sidebar';
import { Book, Scroll, Shield, User, Beaker, ShoppingBag, Home, Swords, Menu, ChevronRight, Image, Palette } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
// Using global CSS classes from src/styles/components.css

interface WizardStudyProps {
  onStartDuel: () => void;
  onReturnToMainMenu: () => void;
}

const WizardStudy: React.FC<WizardStudyProps> = ({
  onStartDuel,
  onReturnToMainMenu
}) => {
  const { gameState, setCurrentLocation, getPlayerScrolls, consumeScrollToLearnSpell, checkIfScrollSpellKnown } = useGameStateStore();
  const player = getWizard();

  // Debug flag to check for hydration issues
  const [mounted, setMounted] = useState(false);

  // State for potion crafting screen
  const [isPotionCraftingOpen, setIsPotionCraftingOpen] = useState(false);

  // State for market screen
  const [isMarketOpen, setIsMarketOpen] = useState(false);

  // State for player profile screen
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // State for deck builder screen
  const [isDeckBuilderOpen, setIsDeckBuilderOpen] = useState(false);

  // State for equipment screen
  const [isEquipmentOpen, setIsEquipmentOpen] = useState(false);

  // State for inventory screen
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  // State for loading indicator
  const [isLoading, setIsLoading] = useState(false);

  // State for spell scrolls screen
  const [showScrolls, setShowScrolls] = useState(false);
  const [selectedScroll, setSelectedScroll] = useState<SpellScroll | null>(null);
  const [scrollLearningResult, setScrollLearningResult] = useState<{
    success: boolean;
    message: string;
    learnedSpell?: Spell;
  } | null>(null);

  // State for deck dropdown
  const [isDeckDropdownOpen, setIsDeckDropdownOpen] = useState(false);

  // State for sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Add state for market attack modal
  const [marketAttack, setMarketAttack] = useState<{ attacker: any; open: boolean } | null>(null);
  const [attackResult, setAttackResult] = useState<'win' | 'flee' | null>(null);

  // Effect for initial mount and client-side rendering
  useEffect(() => {
    setMounted(true);
    console.log('WizardStudy: Component mounted');
  }, []);

  // Separate effect for verifying save slot data to avoid infinite loops
  // This will run once when the component mounts and whenever the current save slot or player changes
  useEffect(() => {
    // Only run this check if we're mounted and have a player
    if (mounted && player) {
      const currentSaveSlot = gameState.currentSaveSlot;
      const currentSlot = gameState.saveSlots.find(slot => slot.saveUuid === currentSaveSlot);

      if (currentSlot) {
        console.log(`WizardStudy: Using save slot ${currentSlot.id} with UUID ${currentSlot.saveUuid}`);
        console.log(`WizardStudy: Player name: ${player.name}, Level: ${player.level}`);

        // Verify that the player data matches the save slot data
        if (currentSlot.player && (currentSlot.player.name !== player.name || currentSlot.player.level !== player.level)) {
          console.error('WizardStudy: Player data mismatch between current player and save slot player!');
          console.error(`Current player: ${player.name}, Level ${player.level}`);
          console.error(`Save slot player: ${currentSlot.player.name}, Level ${currentSlot.player.level}`);
        }
      } else {
        console.error('WizardStudy: Could not find current save slot!');
      }
    }
  }, [mounted, gameState.currentSaveSlot, player?.name, player?.level]);

  // Add click outside handler for the deck dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if the click is outside the dropdown
      if (isDeckDropdownOpen && !target.closest('.wizard-study__deck-selector')) {
        setIsDeckDropdownOpen(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDeckDropdownOpen]);

  // Handler for opening the potion crafting screen
  const handleOpenPotionCrafting = () => {
    setIsPotionCraftingOpen(true);
  };

  // Handler for closing the potion crafting screen
  const handleClosePotionCrafting = () => {
    setIsPotionCraftingOpen(false);
  };

  // Handler for opening the market
  const handleOpenMarket = (attackInfo?: any) => {
    setIsMarketOpen(true);
    if (attackInfo && attackInfo.attacked) {
      setMarketAttack({ attacker: attackInfo.attacker, open: true });
    }
  };

  // Handler for closing the market
  const handleCloseMarket = (attackInfo?: any) => {
    setIsMarketOpen(false);
    if (attackInfo && attackInfo.attacked) {
      setMarketAttack({ attacker: attackInfo.attacker, open: true });
    }
  };

  // Handler for opening the player profile screen
  const handleOpenProfile = () => {
    setIsProfileOpen(true);
  };

  // Handler for closing the player profile screen
  const handleCloseProfile = () => {
    setIsProfileOpen(false);
  };

  // Handler for opening the deck builder screen
  const handleOpenDeckBuilder = () => {
    setIsDeckBuilderOpen(true);
  };

  // Handler for closing the deck builder screen
  const handleCloseDeckBuilder = async () => {
    // Save the game state when closing the deck builder
    setIsLoading(true);
    try {
      await authService.saveGameState();
      setIsDeckBuilderOpen(false);
    } catch (error) {
      console.error('Error saving deck changes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for opening the equipment screen
  const handleOpenEquipment = () => {
    setIsEquipmentOpen(true);
  };

  // Handler for closing the equipment screen
  const handleCloseEquipment = async () => {
    // Save the game state when closing the equipment screen
    setIsLoading(true);
    try {
      await authService.saveGameState();
      setIsEquipmentOpen(false);
    } catch (error) {
      console.error('Error saving equipment changes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for opening the inventory screen
  const handleOpenInventory = () => {
    setIsInventoryOpen(true);
  };

  // Handler for closing the inventory screen
  const handleCloseInventory = async () => {
    // Save the game state when closing the inventory screen
    setIsLoading(true);
    try {
      await authService.saveGameState();
      setIsInventoryOpen(false);
    } catch (error) {
      console.error('Error saving inventory changes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle deck dropdown visibility
  const toggleDeckDropdown = () => {
    setIsDeckDropdownOpen(!isDeckDropdownOpen);
  };

  // Handle selecting a deck from the dropdown
  const handleSelectDeck = async (deckId: string) => {
    // Check if player exists
    if (!player) {
      console.error('Player data not found');
      setIsDeckDropdownOpen(false);
      return;
    }

    if (deckId === player.activeDeckId) {
      // If the same deck is selected, just close the dropdown
      setIsDeckDropdownOpen(false);
      return;
    }

    // Find the selected deck
    const selectedDeck = player.decks?.find(deck => deck.id === deckId);
    if (!selectedDeck) {
      console.error('Selected deck not found');
      setIsDeckDropdownOpen(false);
      return;
    }

    // Update the game state with the new active deck
    setIsLoading(true);
    try {
      // Update the player's active deck ID and equipped spells using updateWizard
      // This will update both the save slot and top-level player data
      useGameStateStore.getState().updateWizard(wizard => ({
        ...wizard,
        activeDeckId: deckId,
        equippedSpells: selectedDeck.spells
      }));

      // Save the game state
      await authService.saveGameState();
      setIsDeckDropdownOpen(false);
    } catch (error) {
      console.error('Error changing active deck:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if player exists
  if (!player) {
    return (
      <div className="wizard-study">
        <div className="wizard-study__header">
          <h1 className="wizard-study__title">Wizard's Study</h1>
          <div className="wizard-study__player-info">
            <h2 className="wizard-study__player-name">Error: Player data not found</h2>
          </div>
          <button
            className="wizard-study__action wizard-study__action--secondary"
            onClick={onReturnToMainMenu}
          >
            Return to Main Menu
          </button>
        </div>
        <div className="wizard-study__content">
          <p>There was an error loading your character data. Please return to the main menu and try again.</p>
        </div>
      </div>
    );
  }

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
    // Use the MarketUI component with proper error handling
    return (
      <ErrorBoundary
        fallback={
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px',
            zIndex: 9999999,
            color: 'white'
          }}>
            <h2>Failed to load Market UI</h2>
            <p>There was an error loading the Market UI. Please try again later.</p>
            <button
              onClick={() => handleCloseMarket()}
              style={{
                padding: '10px 20px',
                backgroundColor: 'white',
                color: 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Return to Study
            </button>
          </div>
        }
      >
        <MarketUI onClose={handleCloseMarket} />
      </ErrorBoundary>
    );
  }

  // If player profile is open, render the profile screen
  if (isProfileOpen) {
    return <PlayerProfileScreen onClose={handleCloseProfile} />;
  }

  // If deck builder is open, render the deck builder screen
  if (isDeckBuilderOpen) {
    return <DeckBuilder onClose={handleCloseDeckBuilder} />;
  }

  // If equipment screen is open, render the equipment screen
  if (isEquipmentOpen) {
    return <EquipmentScreen onClose={handleCloseEquipment} />;
  }

  // If inventory screen is open, render the inventory screen
  if (isInventoryOpen) {
    return <InventoryScreen onClose={handleCloseInventory} />;
  }

  // Market attack modal actions
  const handleAttackResult = (result: 'win' | 'flee') => {
    if (result === 'win') {
      // Start a duel with the market bandit
      const player = getWizard();
      if (player && marketAttack?.attacker) {
        useGameStateStore.getState().initializeCombat(player, marketAttack.attacker, gameState.settings.difficulty);
        setMarketAttack(null);
        setAttackResult(null);
        onStartDuel(); // Switch to battle view
      }
      return;
    }
    // Flee logic (lose some gold, show result, then close modal)
    useGameStateStore.getState().handleMarketAttackResult('flee');
    setAttackResult('flee');
    setTimeout(() => {
      setMarketAttack(null);
      setAttackResult(null);
    }, 1500);
  };

  // If market attack modal is open, render it exclusively
  if (marketAttack && marketAttack.open) {
    return (
      <div className="market-attack-modal-overlay">
        <div className="market-attack-modal">
          <div className="market-attack-modal-title">Market Attack!</div>
          <div className="market-attack-modal-divider" />
          <div className="market-attack-modal-content">
            {attackResult === 'flee' ? (
              'You fled and lost a small amount of gold.'
            ) : (
              <>
                A bandit attacks you as you leave the market!<br />
                <strong>{marketAttack.attacker?.name || 'Unknown Bandit'}</strong> (Level {marketAttack.attacker?.level || '?'})<br />
                What will you do?
              </>
            )}
          </div>
          <div className="market-attack-modal-divider" />
          {!attackResult && (
            <div className="market-attack-modal-buttons">
              <button className="magical-button--primary" onClick={() => handleAttackResult('win')}>Fight</button>
              <button className="magical-button--secondary" onClick={() => handleAttackResult('flee')}>Flee</button>
            </div>
          )}
          {attackResult === 'flee' && (
            <div className="market-attack-modal-buttons">
              <button className="magical-button--primary" onClick={() => { setMarketAttack(null); setAttackResult(null); }}>OK</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="wizard-study">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      <div className="wizard-study__header">
        <h1 className="wizard-study__title">Wizard's Study</h1>
        <div className="wizard-study__player-info">
          <h2 className="wizard-study__player-name">{player.name} <span className="wizard-study__player-level">Level {player.level}</span></h2>
        </div>
        <button
          className="wizard-study__sidebar-toggle sidebar-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <Menu className="h-6 w-6 text-purple-400" />
        </button>
      </div>

      <div className="wizard-study__content">
        <Sidebar open={isSidebarOpen} setOpen={setIsSidebarOpen} className="wizard-study__sidebar-container">
          <SidebarBody className="wizard-study__sidebar">
            {/* Sidebar Content */}
            <div className="flex flex-col gap-6 h-full overflow-y-auto">
              {/* Player Stats - Only visible when sidebar is expanded */}
              {isSidebarOpen && (
                <div className="wizard-study__player-stats">
                  <h3 className="wizard-study__sidebar-title">Wizard Stats</h3>
                  <div className="wizard-study__stat">
                    <span className="wizard-study__stat-label">
                      <span className="wizard-study__stat-icon">❤️</span>
                      <span className="wizard-study__stat-text">Health:</span>
                    </span>
                    <span className="wizard-study__stat-value">{player.health}/{player.maxHealth}</span>
                  </div>
                  <div className="wizard-study__stat">
                    <span className="wizard-study__stat-label">
                      <span className="wizard-study__stat-icon">🔷</span>
                      <span className="wizard-study__stat-text">Mana:</span>
                    </span>
                    <span className="wizard-study__stat-value">{player.mana}/{player.maxMana}</span>
                  </div>
                  <div className="wizard-study__stat">
                    <span className="wizard-study__stat-label">
                      <span className="wizard-study__stat-icon">⚡</span>
                      <span className="wizard-study__stat-text">Mana Regen:</span>
                    </span>
                    <span className="wizard-study__stat-value">{player.manaRegen}/turn</span>
                  </div>
                  <div className="wizard-study__stat">
                    <span className="wizard-study__stat-label">
                      <span className="wizard-study__stat-icon">✨</span>
                      <span className="wizard-study__stat-text">Experience:</span>
                    </span>
                    <span className="wizard-study__stat-value">{player.experience}/{player.experienceToNextLevel}</span>
                  </div>
                  <div className="wizard-study__stat">
                    <span className="wizard-study__stat-label">
                      <span className="wizard-study__stat-icon">🔼</span>
                      <span className="wizard-study__stat-text">Level-up Points:</span>
                    </span>
                    <span className="wizard-study__stat-value">{player.levelUpPoints || 0}</span>
                  </div>
                  <div className="wizard-study__stat">
                    <span className="wizard-study__stat-label">
                      <span className="wizard-study__stat-icon">💰</span>
                      <span className="wizard-study__stat-text">Gold:</span>
                    </span>
                    <span className="wizard-study__stat-value">{player.gold}</span>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="flex flex-col gap-2 mt-12">
                {/* Show regular links when sidebar is collapsed */}
                {!isSidebarOpen && (
                  <>
                    <SidebarLink
                      link={{
                        label: "Start Battle",
                        href: "#",
                        icon: <Swords className="h-5 w-5 text-purple-400" />,
                        onClick: () => {
                          console.log('Starting duel from WizardStudy component');
                          try {
                            onStartDuel();
                          } catch (error) {
                            console.error('Error starting duel:', error);
                          }
                        }
                      }}
                    />
                    <SidebarLink
                      link={{
                        label: "Deck Builder",
                        href: "#",
                        icon: <Book className="h-5 w-5 text-purple-400" />,
                        onClick: handleOpenDeckBuilder
                      }}
                    />
                    <SidebarLink
                      link={{
                        label: "Inventory",
                        href: "#",
                        icon: <ShoppingBag className="h-5 w-5 text-purple-400" />,
                        onClick: handleOpenInventory
                      }}
                    />
                    <SidebarLink
                      link={{
                        label: "Equipment",
                        href: "#",
                        icon: <Shield className="h-5 w-5 text-purple-400" />,
                        onClick: handleOpenEquipment
                      }}
                    />
                    <SidebarLink
                      link={{
                        label: "Spell Scrolls",
                        href: "#",
                        icon: <Scroll className="h-5 w-5 text-purple-400" />,
                        onClick: () => setShowScrolls(true)
                      }}
                    />
                    <SidebarLink
                      link={{
                        label: "Potion Crafting",
                        href: "#",
                        icon: <Beaker className="h-5 w-5 text-purple-400" />,
                        onClick: handleOpenPotionCrafting
                      }}
                    />
                    <SidebarLink
                      link={{
                        label: "Visit Market",
                        href: "#",
                        icon: <ShoppingBag className="h-5 w-5 text-purple-400" />,
                        onClick: () => handleOpenMarket()
                      }}
                    />
                    <SidebarLink
                      link={{
                        label: "View Profile",
                        href: "#",
                        icon: <User className="h-5 w-5 text-purple-400" />,
                        onClick: handleOpenProfile
                      }}
                    />
                    <SidebarLink
                      link={{
                        label: "Customize Background",
                        href: "#",
                        icon: <Palette className="h-5 w-5 text-purple-400" />,
                        onClick: () => {/* TODO: Implement background customization */}
                      }}
                    />
                    <SidebarLink
                      link={{
                        label: "Main Menu",
                        href: "#",
                        icon: <Home className="h-5 w-5 text-purple-400" />,
                        onClick: () => {
                          console.log('Return to Main Menu button clicked in WizardStudy');
                          onReturnToMainMenu();
                        }
                      }}
                    />
                  </>
                )}

                {/* Show Quickactions Accordion when sidebar is expanded */}
                {isSidebarOpen && (
                  <div className="wizard-study__quickactions-section">
                    <h3 className="wizard-study__sidebar-title">Quickactions</h3>
                    <Accordion type="single" collapsible defaultValue="">
                      <AccordionItem value="quickactions" className="border-none">
                        <AccordionTrigger className="wizard-study__action wizard-study__action--secondary wizard-study__deck-dropdown py-2 hover:text-white hover:no-underline sidebar-accordion-trigger">
                          <span>Show Actions</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-0 pt-2">
                          <div className="flex flex-col gap-2">
                          <SidebarLink
                            link={{
                              label: "Start Battle",
                              href: "#",
                              icon: <Swords className="h-5 w-5 text-purple-400" />,
                              onClick: () => {
                                console.log('Starting duel from WizardStudy component');
                                try {
                                  onStartDuel();
                                } catch (error) {
                                  console.error('Error starting duel:', error);
                                }
                              }
                            }}
                          />
                          <SidebarLink
                            link={{
                              label: "Deck Builder",
                              href: "#",
                              icon: <Book className="h-5 w-5 text-purple-400" />,
                              onClick: handleOpenDeckBuilder
                            }}
                          />
                          <SidebarLink
                            link={{
                              label: "Inventory",
                              href: "#",
                              icon: <ShoppingBag className="h-5 w-5 text-purple-400" />,
                              onClick: handleOpenInventory
                            }}
                          />
                          <SidebarLink
                            link={{
                              label: "Equipment",
                              href: "#",
                              icon: <Shield className="h-5 w-5 text-purple-400" />,
                              onClick: handleOpenEquipment
                            }}
                          />
                          <SidebarLink
                            link={{
                              label: "Spell Scrolls",
                              href: "#",
                              icon: <Scroll className="h-5 w-5 text-purple-400" />,
                              onClick: () => setShowScrolls(true)
                            }}
                          />
                          <SidebarLink
                            link={{
                              label: "Potion Crafting",
                              href: "#",
                              icon: <Beaker className="h-5 w-5 text-purple-400" />,
                              onClick: handleOpenPotionCrafting
                            }}
                          />
                          <SidebarLink
                            link={{
                              label: "Visit Market",
                              href: "#",
                              icon: <ShoppingBag className="h-5 w-5 text-purple-400" />,
                              onClick: () => handleOpenMarket()
                            }}
                          />
                          <SidebarLink
                            link={{
                              label: "View Profile",
                              href: "#",
                              icon: <User className="h-5 w-5 text-purple-400" />,
                              onClick: handleOpenProfile
                            }}
                          />
                          <SidebarLink
                            link={{
                              label: "Customize Background",
                              href: "#",
                              icon: <Palette className="h-5 w-5 text-purple-400" />,
                              onClick: () => {/* TODO: Implement background customization */}
                            }}
                          />
                          <SidebarLink
                            link={{
                              label: "Main Menu",
                              href: "#",
                              icon: <Home className="h-5 w-5 text-purple-400" />,
                              onClick: () => {
                                console.log('Return to Main Menu button clicked in WizardStudy');
                                onReturnToMainMenu();
                              }
                            }}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  </div>
                )}
              </div>

              {/* Active Deck, Equipment, and Scrolls - Only visible when sidebar is expanded */}
              {isSidebarOpen && (
                <>
                  {/* Active Deck */}
                  <div className="wizard-study__equipped-deck">
                    <h3 className="wizard-study__sidebar-title">Active Deck</h3>
                    <div className="wizard-study__deck-selector">
                      <button
                        className="wizard-study__action wizard-study__action--secondary wizard-study__deck-dropdown"
                        onClick={toggleDeckDropdown}
                      >
                        {player.decks && player.activeDeckId
                          ? player.decks.find(deck => deck.id === player.activeDeckId)?.name || 'Starter Deck'
                          : 'Starter Deck'} ▼
                      </button>
                      {isDeckDropdownOpen && player.decks && player.decks.length > 0 && (
                        <div className="wizard-study__deck-dropdown-menu">
                          {player.decks.map(deck => (
                            <div
                              key={deck.id}
                              className={`wizard-study__deck-dropdown-item ${player.activeDeckId === deck.id ? 'wizard-study__deck-dropdown-item--active' : ''}`}
                              onClick={() => handleSelectDeck(deck.id)}
                            >
                              {deck.name} {player.activeDeckId === deck.id && <span className="wizard-study__active-indicator">✓</span>}
                              <span className="wizard-study__deck-card-count">{deck.spells.length} cards</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Equipment section removed intentionally */}
                </>
              )}
            </div>
          </SidebarBody>
        </Sidebar>

        <div className="wizard-study__main-area">
          <div className="wizard-study__study-scene">
            <div className="wizard-study__study-background">
              {/* Background area */}
              <div className="wizard-study__background-area">
                {/* Empty div for background */}
              </div>

              {/* Action buttons centered over the background */}
              <div className="wizard-study__actions">
                <button
                  className="wizard-study__action wizard-study__action--primary"
                  onClick={() => {
                    console.log('Starting duel from WizardStudy component');
                    try {
                      onStartDuel();
                    } catch (error) {
                      console.error('Error starting duel:', error);
                    }
                  }}
                >
                  Start Next Duel
                </button>

                <div className="wizard-study__action-group">
                  <button
                    className="wizard-study__action"
                    onClick={handleOpenDeckBuilder}
                  >
                    Deck Builder
                  </button>

                  <button
                    className="wizard-study__action"
                    onClick={handleOpenInventory}
                  >
                    Inventory
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
                    onClick={() => handleOpenMarket()}
                  >
                    Marketplace
                  </button>
                </div>

                <button
                  className="wizard-study__action wizard-study__action--secondary"
                  onClick={() => {
                    console.log('Return to Main Menu button clicked in WizardStudy');
                    onReturnToMainMenu();
                  }}
                >
                  Return to Main Menu
                </button>
              </div>
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
              <div className={`result-message ${scrollLearningResult.success ? 'success' : 'error'}`}>{scrollLearningResult.message}</div>
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

            <button
              onClick={() => setShowScrolls(false)}
              className="close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WizardStudy;