// src/components/CharacterCreation.tsx
import React, { useState } from 'react';
import { useGameStateStore } from '../lib/game-state/gameStateStore';
import authService from '../lib/auth/authService';

interface CharacterCreationProps {
  onComplete: () => void;
  onCancel: () => void;
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onComplete, onCancel }) => {
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { initializeNewGame, setCurrentLocation } = useGameStateStore();

  const handleCreateCharacter = async () => {
    if (!playerName.trim()) {
      alert('Please enter a name for your wizard');
      return;
    }
    
    setIsLoading(true);
    try {
      // Initialize a new game in save slot 0
      initializeNewGame(playerName, 0);
      
      // Set the current location to wizard's study
      setCurrentLocation('wizardStudy');
      
      // Save the game state
      await authService.saveGameState();
      
      // Notify parent of completion
      onComplete();
    } catch (error) {
      console.error('Error creating character:', error);
      alert('Error creating character. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="name-input-modal">
      <div className="name-input-content">
        <h2>Create Your Wizard</h2>
        <div className="name-input-field">
          <label htmlFor="player-name">Enter your wizard's name:</label>
          <input
            id="player-name"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Wizard name..."
            autoFocus
            disabled={isLoading}
          />
        </div>
        <div className="name-input-buttons">
          <button 
            className="name-input-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button 
            className="name-input-submit"
            onClick={handleCreateCharacter}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Begin Adventure'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;