// src/lib/ui/components/Settings.tsx
'use client';

import React from 'react';
import { useGameStateStore } from '../../game-state/gameStateStore';
import { GameSettings } from '../../types';

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { gameState, updateSettings, saveGame } = useGameStateStore();
  const { settings } = gameState;
  
  const handleDifficultyChange = (difficulty: 'easy' | 'normal' | 'hard') => {
    updateSettings({ difficulty });
  };
  
  const handleSoundToggle = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };
  
  const handleMusicVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ musicVolume: parseFloat(e.target.value) });
  };
  
  const handleSfxVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ sfxVolume: parseFloat(e.target.value) });
  };
  
  const handleColorblindModeToggle = () => {
    updateSettings({ colorblindMode: !settings.colorblindMode });
  };
  
  const handleUiScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ uiScale: parseFloat(e.target.value) });
  };
  
  const handleThemeChange = (theme: 'default' | 'dark' | 'light' | 'highContrast') => {
    updateSettings({ theme });
  };
  
  const handleSaveAndClose = () => {
    // Save the game state to ensure settings are persisted
    saveGame();
    // Close the settings menu
    onClose();
  };
  
  return (
    <div className="settings">
      <div className="settings__content">
        <h1 className="settings__title">Settings</h1>
        
        <div className="settings__section">
          <h2 className="settings__section-title">Game Settings</h2>
          
          <div className="settings__option">
            <label className="settings__label">Difficulty</label>
            <div className="settings__difficulty-buttons">
              <button 
                className={`settings__difficulty-button ${settings.difficulty === 'easy' ? 'settings__difficulty-button--active' : ''}`}
                onClick={() => handleDifficultyChange('easy')}
              >
                Easy
              </button>
              <button 
                className={`settings__difficulty-button ${settings.difficulty === 'normal' ? 'settings__difficulty-button--active' : ''}`}
                onClick={() => handleDifficultyChange('normal')}
              >
                Normal
              </button>
              <button 
                className={`settings__difficulty-button ${settings.difficulty === 'hard' ? 'settings__difficulty-button--active' : ''}`}
                onClick={() => handleDifficultyChange('hard')}
              >
                Hard
              </button>
            </div>
          </div>
        </div>
        
        <div className="settings__section">
          <h2 className="settings__section-title">Audio Settings</h2>
          
          <div className="settings__option">
            <label className="settings__label">Sound Effects</label>
            <div className="settings__toggle">
              <input 
                type="checkbox" 
                checked={settings.soundEnabled} 
                onChange={handleSoundToggle}
                className="settings__checkbox"
              />
              <span className="settings__toggle-label">{settings.soundEnabled ? 'On' : 'Off'}</span>
            </div>
          </div>
          
          <div className="settings__option">
            <label className="settings__label">Music Volume</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={settings.musicVolume} 
              onChange={handleMusicVolumeChange}
              className="settings__slider"
              disabled={!settings.soundEnabled}
            />
            <span className="settings__value">{Math.round(settings.musicVolume * 100)}%</span>
          </div>
          
          <div className="settings__option">
            <label className="settings__label">SFX Volume</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={settings.sfxVolume} 
              onChange={handleSfxVolumeChange}
              className="settings__slider"
              disabled={!settings.soundEnabled}
            />
            <span className="settings__value">{Math.round(settings.sfxVolume * 100)}%</span>
          </div>
        </div>
        
        <div className="settings__section">
          <h2 className="settings__section-title">Accessibility</h2>
          
          <div className="settings__option">
            <label className="settings__label">Colorblind Mode</label>
            <div className="settings__toggle">
              <input 
                type="checkbox" 
                checked={settings.colorblindMode} 
                onChange={handleColorblindModeToggle}
                className="settings__checkbox"
              />
              <span className="settings__toggle-label">{settings.colorblindMode ? 'On' : 'Off'}</span>
            </div>
          </div>
          
          <div className="settings__option">
            <label className="settings__label">UI Scale</label>
            <input 
              type="range" 
              min="0.8" 
              max="1.5" 
              step="0.1" 
              value={settings.uiScale} 
              onChange={handleUiScaleChange}
              className="settings__slider"
            />
            <span className="settings__value">{Math.round(settings.uiScale * 100)}%</span>
          </div>
          
          <div className="settings__option">
            <label className="settings__label">Theme</label>
            <select 
              value={settings.theme} 
              onChange={(e) => handleThemeChange(e.target.value as any)}
              className="settings__select"
            >
              <option value="default">Default</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="highContrast">High Contrast</option>
            </select>
          </div>
        </div>
        
        <button 
          className="settings__close-button"
          onClick={handleSaveAndClose}
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};

export default Settings;
