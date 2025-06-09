// src/components/menu/MainMenu.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useGameStateStore } from '../../lib/game-state/gameStateStore';
import { clearSaveGames } from '../../lib/game-state/clearSaveGames';
import { SaveSlot } from '../../lib/types/game-types';
import CharacterCreation from '../CharacterCreation';
import '../../styles/settings-modal.css';

interface MainMenuProps {
  onStartNewGame: (saveSlotId: number, saveUuid: string) => void;
  onContinueGame: (saveSlotId: number, saveUuid: string) => void;
  onOpenSettings?: () => void;
  onOpenHowToPlay?: () => void;
  onLogout?: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  onStartNewGame,
  onContinueGame
}) => {
  const { gameState, updateSettings, saveGame, migrateSaveData, loadAllSaveSlots, deleteSaveSlot } = useGameStateStore();
  const { settings, saveSlots } = gameState;

  // State for modals
  const [showSaveSlotModal, setShowSaveSlotModal] = useState(false);
  const [showNewGameModal, setShowNewGameModal] = useState(false);

  // Ensure save data is migrated and all save slots are loaded when component mounts
  useEffect(() => {
    console.log('MainMenu: Ensuring save data is migrated and loading all save slots');
    migrateSaveData();
    loadAllSaveSlots();
  }, []);

  // Separate effect for logging save slot information to avoid infinite loops
  useEffect(() => {
    // Only log if we have save slots and we're showing the save slot modal
    if (saveSlots.length > 0 && (showSaveSlotModal || showNewGameModal)) {
      console.log(`MainMenu: Found ${saveSlots.length} save slots:`);
      saveSlots.forEach(slot => {
        console.log(`Slot ${slot.id}: UUID ${slot.saveUuid}, Player: ${slot.playerName}, Level: ${slot.level}, Empty: ${slot.isEmpty}`);
        if (slot.player) {
          console.log(`  Player data: Name: ${slot.player.name}, Level: ${slot.player.level}`);
        } else {
          console.log('  No player data in this slot');
        }
      });

      console.log(`MainMenu: Current save slot UUID: ${gameState.currentSaveSlot}`);
    }
  }, [saveSlots, showSaveSlotModal, showNewGameModal]);

  // Additional state for modals and game state
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [selectedSaveUuid, setSelectedSaveUuid] = useState<string | null>(null);
  const [isNewGame, setIsNewGame] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSupportDevs, setShowSupportDevs] = useState(false);

  // Viewport state
  const [isMobile, setIsMobile] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  // Check viewport width and orientation on component mount and window resize
  useEffect(() => {
    const checkDisplay = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width <= 768);
      setIsLandscape(width > height);
    };

    // Check initially
    checkDisplay();

    // Add resize and orientation change listeners
    window.addEventListener('resize', checkDisplay);
    window.addEventListener('orientationchange', checkDisplay);

    // Clean up
    return () => {
      window.removeEventListener('resize', checkDisplay);
      window.removeEventListener('orientationchange', checkDisplay);
    };
  }, []);

  // Local settings state
  const [localSettings, setLocalSettings] = useState(settings);

  // Settings handlers
  const handleSettingChange = (key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    console.log('Saving settings:', localSettings);
    updateSettings(localSettings);
    // Persist settings to storage so they aren't lost when loading a game
    saveGame();
    setShowSettings(false);
  };

  // Function to open settings modal is called from the settings button click handler

  // Check if any saves exist
  const hasSavedGames = saveSlots.some(slot => !slot.isEmpty);

  const handleClearSaveGames = () => {
    if (confirm('Are you sure you want to clear all saved games? This action cannot be undone.')) {
      console.log('User confirmed. Clearing all saved games...');
      clearSaveGames();
      // Force a re-render by closing and reopening the modal
      setShowSaveSlotModal(false);
      setTimeout(() => setShowSaveSlotModal(true), 100);
    } else {
      console.log('User cancelled clearing saved games');
    }
  };

  const handleStartNewGame = () => {
    console.log('MainMenu: Opening save slot selection for new game');
    // Load all save slots from localStorage before showing the modal
    loadAllSaveSlots();
    setIsNewGame(true);
    setShowSaveSlotModal(true);
    setShowCharacterCreation(false);
  };

  const handleContinueGame = () => {
    console.log('MainMenu: Opening save slot selection for continue game');
    // Load all save slots from localStorage before showing the modal
    loadAllSaveSlots();
    setIsNewGame(false);
    setShowSaveSlotModal(true);
  };

  const handleSaveSlotSelect = (slot: SaveSlot) => {
    console.log(`MainMenu: Save slot ${slot.id} with UUID ${slot.saveUuid} selected`);
    setSelectedSlotId(slot.id);
    setSelectedSaveUuid(slot.saveUuid);

    if (isNewGame) {
      console.log('MainMenu: Opening character creation for new game');
      setShowSaveSlotModal(false);
      setShowCharacterCreation(true);
    } else if (!slot.isEmpty) {
      console.log('MainMenu: Loading existing game');
      setShowSaveSlotModal(false);
      onContinueGame(slot.id, slot.saveUuid);
    }
  };

  const handleCharacterCreationComplete = (wizardName: string) => {
    console.log(`MainMenu: Character creation complete for ${wizardName}`);
    if (selectedSlotId !== null && selectedSaveUuid !== null) {
      setShowCharacterCreation(false);
      onStartNewGame(selectedSlotId, selectedSaveUuid);
    }
  };

  // Handler for deleting a single save slot
  const handleDeleteSaveSlot = (e: React.MouseEvent, slot: SaveSlot) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete save slot ${slot.id + 1} (${slot.playerName})? This action cannot be undone.`)) {
      deleteSaveSlot(slot.saveUuid);
      // Force a re-render by closing and reopening the modal
      setShowSaveSlotModal(false);
      setTimeout(() => setShowSaveSlotModal(true), 100);
    }
  };

  // Modal component for save slots
  const SaveSlotModal = () => (
    <div className="save-slot-modal">
      <div className="save-slot-modal__content">
        <div className="save-slot-modal__header">
          <h2 className="save-slot-modal__title">
            {isNewGame ? 'SELECT SAVE SLOT' : 'LOAD GAME'}
          </h2>
        </div>

        <div className="settings-modal__divider"></div>

        <div className="save-slots-grid">
          {saveSlots.map((slot) => (
            <div
              key={slot.id}
              className={`magical-save-slot ${slot.isEmpty ? 'magical-save-slot--empty' : 'magical-save-slot--filled'}`}
              onClick={() => handleSaveSlotSelect(slot)}
              style={{ position: 'relative' }}
            >
              <div className="magical-save-slot__slot-number">Slot {slot.id + 1}</div>

              {slot.isEmpty ? (
                <div>Empty Slot</div>
              ) : (
                <>
                  <div className="magical-save-slot__name">{slot.playerName}</div>
                  <div className="magical-save-slot__details">
                    <div className="magical-save-slot__detail">
                      <span className="magical-save-slot__label">Level:</span>
                      <span className="magical-save-slot__value">{slot.level}</span>
                    </div>
                    <div className="magical-save-slot__detail">
                      <span className="magical-save-slot__label">Last Played:</span>
                      <span className="magical-save-slot__value">{new Date(slot.lastSaved).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {/* Delete button in bottom right */}
                  <button
                    className="save-slot__delete-btn"
                    aria-label={`Delete save slot ${slot.id + 1}`}
                    title="Delete Save Slot"
                    onClick={e => handleDeleteSaveSlot(e, slot)}
                    tabIndex={0}
                    type="button"
                  >
                    ❌
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="settings-modal__divider"></div>

        <div className="settings-modal__actions">
          <button
            className="magical-button magical-button--secondary"
            onClick={() => setShowSaveSlotModal(false)}
          >
            Cancel
          </button>

          {hasSavedGames && (
            <button
              className="magical-button magical-button--danger"
              onClick={handleClearSaveGames}
            >
              Clear All Save Games
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Modal component for new game
  const NewGameModal = () => (
    <div className="save-slot-modal">
      <div className="save-slot-modal__content">
        <div className="save-slot-modal__header">
          <h2 className="save-slot-modal__title">SELECT A SAVE SLOT</h2>
        </div>

        <div className="settings-modal__divider"></div>

        <div className="save-slots-grid">
          {saveSlots.map((slot) => (
            <div
              key={slot.id}
              className={`magical-save-slot ${slot.isEmpty ? 'magical-save-slot--empty' : 'magical-save-slot--filled'}`}
              onClick={() => handleSaveSlotSelect(slot)}
              style={{ position: 'relative' }}
            >
              <div className="magical-save-slot__slot-number">Slot {slot.id + 1}</div>

              {slot.isEmpty ? (
                <div>Empty Slot</div>
              ) : (
                <>
                  <div className="magical-save-slot__name">{slot.playerName}</div>
                  <div className="magical-save-slot__details">
                    <div className="magical-save-slot__detail">
                      <span className="magical-save-slot__label">Level:</span>
                      <span className="magical-save-slot__value">{slot.level}</span>
                    </div>
                  </div>
                  <div className="magical-save-slot__warning">Will be overwritten!</div>
                  {/* Delete button in bottom right */}
                  <button
                    className="save-slot__delete-btn"
                    aria-label={`Delete save slot ${slot.id + 1}`}
                    title="Delete Save Slot"
                    onClick={e => handleDeleteSaveSlot(e, slot)}
                    tabIndex={0}
                    type="button"
                  >
                    ❌
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="settings-modal__divider"></div>

        <div className="settings-modal__actions">
          <button
            className="magical-button magical-button--secondary"
            onClick={() => setShowNewGameModal(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Determine appropriate styles based on device and orientation
  const bannerHeight = isMobile
    ? (isLandscape ? '69vh' : '56vh') // Increased for better visibility on mobile
    : '79vh'; // Taller on desktop
  const titleSize = isMobile ? (isLandscape ? '1.8rem' : '2.2rem') : '2.5rem';
  const subtitleSize = isMobile ? (isLandscape ? '1rem' : '1.2rem') : '1.25rem';
  const contentPadding = isMobile ? (isLandscape ? '10px' : '15px') : '20px';

  return (
    <div className="main-menu" style={{
      overflow: 'auto',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start'
    }}>
      {/* Structure layering:
          1. Background (lowest)
          2. Banner (above background)
          3. Content (highest) */}

      {/* Base background layer */}
      <div className="main-menu__background" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
      }}>
        {/* This would be a ThreeJS background scene in the full implementation */}
        <div className="main-menu__magical-particles"></div>
      </div>

      {/* Banner Image */}
      <div style={{
        width: '100%',
        height: bannerHeight,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 2,
        backgroundImage: `url('/images/default-placeholder.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat'
      }}>
        {/* Gradient overlay at the bottom of the banner */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '50%',
          background: 'linear-gradient(to top, var(--ui-background) 0%, rgba(26, 26, 46, 0) 100%)',
          zIndex: 3
        }}></div>
      </div>

      {/* Content layer */}
      <div className="main-menu__content" style={{
        position: 'relative',
        zIndex: 10,
        paddingLeft: contentPadding,
        paddingRight: contentPadding,
        paddingBottom: contentPadding,
        paddingTop: 0,
        flex: '1 0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        marginTop: `calc(${bannerHeight} * 0.65)` // Position titles partially over the banner
      }}>
        <h1 className="main-menu__title" style={{
          fontSize: titleSize,
          textShadow: '0 0 10px rgba(0, 0, 0, 0.7)' // Add shadow for better visibility
        }}>Wizard's Choice</h1>
        <h2 className="main-menu__subtitle" style={{
          fontSize: subtitleSize,
          textShadow: '0 0 8px rgba(0, 0, 0, 0.7)' // Add shadow for better visibility
        }}>A Tactical Spell-Casting Adventure</h2>

        <div className="main-menu__buttons" style={{
          marginTop: '20px',
          width: '100%',
          maxWidth: '400px'
        }}>
          <button
            className="main-menu__button main-menu__button--primary"
            onClick={handleStartNewGame}
          >
            Start New Game
          </button>

          {hasSavedGames && (
            <button
              className="main-menu__button main-menu__button--primary"
              onClick={handleContinueGame}
            >
              Continue Game
            </button>
          )}

          <button
            className="main-menu__button main-menu__button--secondary"
            onClick={() => setShowSettings(true)}
          >
            Settings
          </button>

          <button
            className="main-menu__button main-menu__button--secondary"
            onClick={() => setShowHowToPlay(true)}
          >
            How to Play
          </button>

          <button
            className="main-menu__button main-menu__button--secondary"
            onClick={() => setShowSupportDevs(true)}
          >
            Support the Devs
          </button>

          {/* Logout button commented out - login system disabled
          <button
            className="main-menu__button main-menu__button--secondary"
            onClick={onLogout}
          >
            Logout
          </button>
          */}
        </div>
      </div>

      <div style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 20px 20px 20px',
        marginTop: 'auto',
        marginBottom: '20px',
        zIndex: 10
      }}>
        <div style={{ color: '#fff', marginBottom: '10px', textAlign: 'center' }}>
          Brought to you by <a
            href="https://mageworks.studio"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#fff',
              textDecoration: 'underline'
            }}
          >
            mageworks.studio
          </a>
        </div>
        <a
          href="https://mageworks.studio"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: '100%',
            maxWidth: '400px',
            display: 'block',
            margin: '0 auto'
          }}
        >
          <img
            src="https://i.imgur.com/KHOtK2O.png"
            alt="Mageworks Studio"
            style={{
              width: '100%',
              height: 'auto'
            }}
          />
        </a>
      </div>

      <a
        target="_blank"
        href="https://jam.pieter.com"
        style={{
          fontFamily: 'system-ui, sans-serif',
          position: 'fixed',
          bottom: '-1px',
          right: '-1px',
          padding: '7px',
          fontSize: '14px',
          fontWeight: 'bold',
          background: '#fff',
          color: '#000',
          textDecoration: 'none',
          zIndex: 10000,
          borderTopLeftRadius: '12px',
          border: '1px solid #fff'
        }}
      >
        🕹️ Vibe Jam 2025
      </a>

      {/* Render modals */}
      {showSaveSlotModal && <SaveSlotModal />}
      {showNewGameModal && <NewGameModal />}
      {showCharacterCreation && selectedSlotId !== null && selectedSaveUuid !== null && (
        <CharacterCreation
          onComplete={handleCharacterCreationComplete}
          onCancel={() => setShowCharacterCreation(false)}
          saveSlotId={selectedSlotId}
          saveUuid={selectedSaveUuid}
        />
      )}

      {showSettings && (
        <div className="settings-modal">
          <div className="settings-modal__content">
            <div className="settings-modal__header">
              <h2 className="settings-modal__title">SETTINGS</h2>
            </div>

            <div className="settings-modal__divider"></div>

            <div className="settings-modal__section">
              <h3 className="settings-modal__section-title">Game Settings</h3>
              <div className="difficulty-selector">
                <button
                  className={`difficulty-option ${localSettings.difficulty === 'easy' ? 'difficulty-option--selected' : ''}`}
                  onClick={() => handleSettingChange('difficulty', 'easy')}
                >
                  Easy
                </button>
                <button
                  className={`difficulty-option ${localSettings.difficulty === 'normal' ? 'difficulty-option--selected' : ''}`}
                  onClick={() => handleSettingChange('difficulty', 'normal')}
                >
                  Normal
                </button>
                <button
                  className={`difficulty-option ${localSettings.difficulty === 'hard' ? 'difficulty-option--selected' : ''}`}
                  onClick={() => handleSettingChange('difficulty', 'hard')}
                >
                  Hard
                </button>
              </div>
            </div>

            <div className="settings-modal__divider"></div>

            <div className="settings-modal__section">
              <h3 className="settings-modal__section-title">Audio</h3>

              <div className="settings-group">
                <label className="settings-label">Music Volume</label>
                <div className="magical-slider-container">
                  <input
                    type="range"
                    className="magical-slider music-slider"
                    min="0"
                    max="100"
                    value={localSettings.musicVolume * 100}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      handleSettingChange('musicVolume', value / 100);
                      // Update the CSS variable for the gradient
                      e.target.style.setProperty('--value', `${value}%`);
                    }}
                    style={{
                      '--value': `${localSettings.musicVolume * 100}%`
                    } as React.CSSProperties}
                  />
                  <span className="slider-value">{Math.round(localSettings.musicVolume * 100)}%</span>
                </div>
              </div>

              <div className="settings-group">
                <label className="settings-label">Sound Effects</label>
                <div className="magical-slider-container">
                  <input
                    type="range"
                    className="magical-slider sfx-slider"
                    min="0"
                    max="100"
                    value={localSettings.sfxVolume * 100}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      handleSettingChange('sfxVolume', value / 100);
                      // Update the CSS variable for the gradient
                      e.target.style.setProperty('--value', `${value}%`);
                    }}
                    style={{
                      '--value': `${localSettings.sfxVolume * 100}%`
                    } as React.CSSProperties}
                  />
                  <span className="slider-value">{Math.round(localSettings.sfxVolume * 100)}%</span>
                </div>
              </div>

              <div className="settings-group">
                <div
                  className={`magical-toggle ${localSettings.soundEnabled ? 'magical-toggle--active' : ''}`}
                  onClick={() => handleSettingChange('soundEnabled', !localSettings.soundEnabled)}
                >
                  <div className="magical-toggle__switch"></div>
                  <span className="magical-toggle__label">Enable Sound</span>
                </div>
              </div>
            </div>

            <div className="settings-modal__divider"></div>

            <div className="settings-modal__actions">
              <button
                className="magical-button magical-button--secondary"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>
              <button
                className="magical-button magical-button--primary"
                onClick={handleSaveSettings}
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {showHowToPlay && (
        <div className="how-to-play-modal">
          <div className="how-to-play-modal__content">
            <div className="how-to-play-modal__header">
              <h2 className="how-to-play-modal__title">HOW TO PLAY</h2>
            </div>

            <div className="settings-modal__divider"></div>

            <div>
              <h3>Welcome to Wizard's Choice!</h3>
              <p>Embark on a magical journey where your choices shape your destiny.</p>

              <h4>Getting Started:</h4>
              <ul>
                <li>Create a new character by selecting "Start New Game"</li>
                <li>Choose your wizard's name and begin your adventure</li>
                <li>Learn spells and develop your magical abilities</li>
                <li>Make choices that affect your story and relationships</li>
              </ul>

              <h4>Combat:</h4>
              <ul>
                <li>Cast spells using your mana points</li>
                <li>Choose between offensive and defensive strategies</li>
                <li>Use items and potions to aid in battle</li>
              </ul>
            </div>

            <div className="settings-modal__divider"></div>

            <div className="settings-modal__actions">
              <button
                className="magical-button magical-button--primary"
                onClick={() => setShowHowToPlay(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showSupportDevs && (
        <div className="support-devs-modal">
          <div className="support-devs-modal__content">
            <div className="support-devs-modal__header">
              <h2 className="support-devs-modal__title">SUPPORT THE DEVELOPERS</h2>
            </div>

            <div className="settings-modal__divider"></div>

            <div>
              <p>Your contributions help us keep the game running by covering expenses such as power, internet, hosting bills, and further development costs. We appreciate your support!</p>

              <h3>Donation Options:</h3>
              <div className="donation-options">
                <div className="donation-option">
                  <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" />
                  <a href="https://www.paypal.me/joshuaem" target="_blank" rel="noopener noreferrer">Donate via PayPal</a>
                </div>
                <div className="donation-option">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c5/Square_Cash_app_logo.svg" alt="Cash App" />
                  <a href="https://cash.app/$magejosh" target="_blank" rel="noopener noreferrer">Donate via Cash App</a>
                </div>
                <div className="donation-option">
                  <img src="https://storage.ko-fi.com/cdn/cup-border.png" alt="Ko-fi" />
                  <a href="https://ko-fi.com/magejosh" target="_blank" rel="noopener noreferrer">Support us on Ko-fi</a>
                </div>
                <div className="donation-option">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/9/94/Patreon_logo.svg" alt="Patreon" />
                  <a href="https://www.patreon.com/mageworks" target="_blank" rel="noopener noreferrer">Become a Patron</a>
                </div>
              </div>
            </div>

            <div className="settings-modal__divider"></div>

            <div className="settings-modal__actions">
              <button
                className="magical-button magical-button--primary"
                onClick={() => setShowSupportDevs(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;
