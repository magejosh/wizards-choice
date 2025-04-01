// src/lib/ui/components/MainMenu.tsx
'use client';

import React, { useState } from 'react';
import { useGameStateStore } from '../../game-state/gameStateStore';
import { clearSaveGames } from '../../game-state/clearSaveGames';
import { SaveSlot } from '../../types/game-types';
import CharacterCreation from '../../../components/CharacterCreation';

interface MainMenuProps {
  onStartNewGame: (saveSlotId: number) => void;
  onContinueGame: (saveSlotId: number) => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onLogout: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  onStartNewGame,
  onContinueGame,
  onOpenSettings,
  onOpenHowToPlay,
  onLogout
}) => {
  const { gameState, updateSettings } = useGameStateStore();
  const { settings, saveSlots } = gameState;
  
  // State for modals
  const [showSaveSlotModal, setShowSaveSlotModal] = useState(false);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [showCharacterCreation, setShowCharacterCreation] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [isNewGame, setIsNewGame] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  
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
    setShowSettings(false);
  };
  
  // Reset local settings when opening modal
  const handleOpenSettings = () => {
    setLocalSettings(settings);
    setShowSettings(true);
  };
  
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
    setIsNewGame(true);
    setShowSaveSlotModal(true);
    setShowCharacterCreation(false);
  };
  
  const handleContinueGame = () => {
    console.log('MainMenu: Opening save slot selection for continue game');
    setIsNewGame(false);
    setShowSaveSlotModal(true);
  };
  
  const handleSaveSlotSelect = (slotId: number) => {
    console.log(`MainMenu: Save slot ${slotId} selected`);
    setSelectedSlotId(slotId);
    
    if (isNewGame) {
      console.log('MainMenu: Opening character creation for new game');
      setShowSaveSlotModal(false);
      setShowCharacterCreation(true);
    } else if (!saveSlots[slotId].isEmpty) {
      console.log('MainMenu: Loading existing game');
      setShowSaveSlotModal(false);
      onContinueGame(slotId);
    }
  };

  const handleCharacterCreationComplete = (name: string) => {
    console.log(`MainMenu: Character creation complete for "${name}"`);
    setShowCharacterCreation(false);
    onStartNewGame(selectedSlotId!);
  };
  
  // Modal component for save slots
  const SaveSlotModal = () => (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      <div className="modal-content">
        <h2 className="modal-title">
          {isNewGame ? 'Select Save Slot' : 'Load Game'}
        </h2>
        
        <div className="save-slots-grid">
          {saveSlots.map((slot) => (
            <div
              key={slot.id}
              className={`save-slot ${slot.isEmpty ? 'empty' : 'filled'}`}
              onClick={() => handleSaveSlotSelect(slot.id)}
            >
              {slot.isEmpty ? (
                <p>Empty Slot {slot.id + 1}</p>
              ) : (
                <>
                  <p>Slot {slot.id + 1}</p>
                  <p>{slot.playerName}</p>
                  <p>Level {slot.level}</p>
                  <p>Last Played: {new Date(slot.lastSaved).toLocaleDateString()}</p>
                </>
              )}
            </div>
          ))}
        </div>
        
        <div className="modal-actions">
          <button 
            className="modal-close"
            onClick={() => setShowSaveSlotModal(false)}
          >
            Cancel
          </button>
          
          {hasSavedGames && (
            <button 
              className="modal-action modal-action--danger"
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
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
      <div className="modal-content">
        <h2 className="modal-title">Select a Save Slot</h2>
        
        <div className="save-slots-grid">
          {saveSlots.map((slot) => (
            <button 
              key={slot.id}
              className={`save-slot ${slot.isEmpty ? 'save-slot--empty' : 'save-slot--filled'}`}
              onClick={() => handleSaveSlotSelect(slot.id)}
            >
              {slot.isEmpty ? (
                <div className="save-slot__empty">Empty Slot</div>
              ) : (
                <>
                  <div className="save-slot__name">{slot.playerName}</div>
                  <div className="save-slot__details">
                    <span className="save-slot__level">Level {slot.level}</span>
                    <span className="save-slot__warning">Will be overwritten!</span>
                  </div>
                </>
              )}
            </button>
          ))}
        </div>
        
        <button 
          className="modal-close"
          onClick={() => setShowNewGameModal(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="main-menu">
      <div className="main-menu__background">
        {/* This would be a ThreeJS background scene in the full implementation */}
        <div className="main-menu__magical-particles"></div>
      </div>
      
      <div className="main-menu__content" style={{ position: 'relative', zIndex: 10 }}>
        <h1 className="main-menu__title">Wizard's Choice</h1>
        <h2 className="main-menu__subtitle">A Tactical Spell-Casting Adventure</h2>
        
        <div className="main-menu__buttons">
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
        position: 'fixed',
        bottom: '40px',
        left: '0',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        padding: '0 20px',
        zIndex: 10
      }}>
        <div style={{ color: '#fff' }}>
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
            display: 'block'
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
      {showCharacterCreation && selectedSlotId !== null && (
        <CharacterCreation
          onComplete={handleCharacterCreationComplete}
          onCancel={() => setShowCharacterCreation(false)}
          saveSlotId={selectedSlotId}
        />
      )}

      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Settings</h2>
            <div className="settings-content">
              <div className="setting-group">
                <h3>Game Settings</h3>
                <div className="difficulty-buttons">
                  <button 
                    className={`difficulty-button ${localSettings.difficulty === 'easy' ? 'active' : ''}`}
                    onClick={() => handleSettingChange('difficulty', 'easy')}
                  >
                    Easy
                  </button>
                  <button 
                    className={`difficulty-button ${localSettings.difficulty === 'normal' ? 'active' : ''}`}
                    onClick={() => handleSettingChange('difficulty', 'normal')}
                  >
                    Normal
                  </button>
                  <button 
                    className={`difficulty-button ${localSettings.difficulty === 'hard' ? 'active' : ''}`}
                    onClick={() => handleSettingChange('difficulty', 'hard')}
                  >
                    Hard
                  </button>
                </div>
              </div>

              <div className="setting-group">
                <h3>Audio</h3>
                <label>
                  Music Volume
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={localSettings.musicVolume * 100}
                    onChange={(e) => handleSettingChange('musicVolume', Number(e.target.value) / 100)}
                  />
                </label>
                <label>
                  Sound Effects
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={localSettings.sfxVolume * 100}
                    onChange={(e) => handleSettingChange('sfxVolume', Number(e.target.value) / 100)}
                  />
                </label>
                <label>
                  <input 
                    type="checkbox" 
                    checked={localSettings.soundEnabled}
                    onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                  />
                  Enable Sound
                </label>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowSettings(false)}>Cancel</button>
              <button 
                className="modal-action modal-action--primary"
                onClick={handleSaveSettings}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showHowToPlay && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">How to Play</h2>
            <div className="how-to-play-content">
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
            <div className="modal-actions">
              <button onClick={() => setShowHowToPlay(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainMenu;

