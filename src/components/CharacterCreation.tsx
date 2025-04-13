// src/components/CharacterCreation.tsx
import React, { useState } from 'react';
import { useGameStateStore } from '../lib/game-state/gameStateStore';

interface CharacterCreationProps {
  onComplete: (name: string) => void;
  onCancel: () => void;
  saveSlotId: number;
  saveUuid?: string;  // Optional UUID for the save slot
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({
  onComplete,
  onCancel,
  saveSlotId,
  saveUuid
}) => {
  const [name, setName] = useState('');
  const { initializeNewGame } = useGameStateStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      console.log(`CharacterCreation: Creating character "${name}" in slot ${saveSlotId} with UUID ${saveUuid}`);
      initializeNewGame(name, saveSlotId);
      onComplete(name);
    }
  };

  return (
    <div className="name-input-modal">
      <div className="name-input-content">
        <h2 className="modal-title">Create Your Character</h2>
        <p className="name-input-subtitle">Choose a name for your wizard</p>

        <form onSubmit={handleSubmit}>
          <div className="name-input-field">
            <label htmlFor="characterName">Character Name:</label>
            <input
              type="text"
              id="characterName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your wizard's name"
              autoFocus
            />
          </div>

          <div className="name-input-buttons">
            <button
              type="button"
              className="name-input-cancel"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="name-input-submit"
              disabled={!name.trim()}
            >
              Create Character
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CharacterCreation;