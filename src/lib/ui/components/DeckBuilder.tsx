'use client';

import React, { useState, useEffect } from 'react';
import { Spell, Deck } from '../../types';
import { useGameStateStore } from '../../game-state/gameStateStore';
import SpellCard from './SpellCard';

// Minimum number of spells required in a deck
const MIN_DECK_SIZE = 5;

interface DeckBuilderProps {
  onClose: () => void;
}

const DeckBuilder: React.FC<DeckBuilderProps> = ({ onClose }) => {
  const { gameState, updateGameState } = useGameStateStore();
  const { player } = gameState;
  
  // State for managing decks
  const [decks, setDecks] = useState<Deck[]>(player.decks || []);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(player.activeDeckId);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(player.activeDeckId);
  const [newDeckName, setNewDeckName] = useState<string>('');
  const [isCreatingDeck, setIsCreatingDeck] = useState<boolean>(false);
  const [isEditingDeck, setIsEditingDeck] = useState<boolean>(false);
  const [isHelpExpanded, setIsHelpExpanded] = useState<boolean>(false);
  
  // State for active editing deck
  const [editingDeckSpells, setEditingDeckSpells] = useState<Spell[]>([]);
  
  // State for filtering and sorting
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('tier');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // All available spells the player has
  const availableSpells = player.spells;
  
  // Create a default deck if none exists
  useEffect(() => {
    if (decks.length === 0) {
      const defaultDeck: Deck = {
        id: 'default-deck-' + Date.now(),
        name: 'Starter Deck',
        spells: player.spells.slice(0, Math.min(5, player.spells.length)),
        dateCreated: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
      
      setDecks([defaultDeck]);
      setSelectedDeckId(defaultDeck.id);
      setActiveDeckId(defaultDeck.id);
      
      // Update the game state with the new player properties
      updateGameState({
        player: {
          ...player,
          decks: [defaultDeck],
          activeDeckId: defaultDeck.id,
          equippedSpells: defaultDeck.spells
        }
      });
    }
  }, []);
  
  // Get the active deck being edited
  const getActiveDeck = (): Deck | undefined => {
    return decks.find(deck => deck.id === selectedDeckId);
  };
  
  // Initialize editing deck whenever selected deck changes
  useEffect(() => {
    const activeDeck = getActiveDeck();
    if (activeDeck) {
      setEditingDeckSpells(activeDeck.spells.slice(0));
      setIsEditingDeck(true);
    } else {
      setEditingDeckSpells([]);
      setIsEditingDeck(false);
    }
  }, [selectedDeckId]);
  
  // Toggle help section expanded state
  const toggleHelpSection = () => {
    setIsHelpExpanded(!isHelpExpanded);
  };
  
  // Apply filtering
  const filteredSpells = availableSpells.filter(spell => {
    // Text search filter
    if (searchQuery && !spell.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (filter === 'all') return true;
    if (filter === 'equipped') return editingDeckSpells.some(s => s.id === spell.id);
    if (filter === 'damage') return spell.type === 'damage';
    if (filter === 'healing') return spell.type === 'healing';
    if (filter === 'buff') return spell.type === 'buff';
    if (filter === 'debuff') return spell.type === 'debuff';
    
    // Element filter
    return spell.element === filter;
  });
  
  // Apply sorting
  const sortedSpells = [...filteredSpells].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'mana') return a.manaCost - b.manaCost;
    if (sortBy === 'element') return a.element.localeCompare(b.element);
    return a.tier - b.tier; // Default sort by tier
  });
  
  // Check if a spell is in the current editing deck
  const isSpellInDeck = (spell: Spell): boolean => {
    return editingDeckSpells.some(s => s.id === spell.id);
  };
  
  // Get the position of a spell in the current editing deck
  const getSpellDeckPosition = (spell: Spell): number => {
    return editingDeckSpells.findIndex(s => s.id === spell.id);
  };
  
  // Add or remove a spell from the editing deck
  const toggleSpellInDeck = (spell: Spell) => {
    if (isSpellInDeck(spell)) {
      // Don't remove if it would make the deck too small
      if (editingDeckSpells.length <= MIN_DECK_SIZE) {
        alert(`Your deck must contain at least ${MIN_DECK_SIZE} spells. Add another spell before removing this one.`);
        return;
      }
      // Remove spell from deck
      setEditingDeckSpells(editingDeckSpells.filter(s => s.id !== spell.id));
    } else {
      // Add spell to deck (no maximum limit)
      setEditingDeckSpells([...editingDeckSpells, spell]);
    }
  };
  
  // Create a new deck
  const handleCreateDeck = () => {
    if (newDeckName.trim() === '') {
      alert('Please enter a deck name');
      return;
    }
    
    const newDeck: Deck = {
      id: 'deck-' + Date.now(),
      name: newDeckName,
      spells: [],
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    const updatedDecks = [...decks, newDeck];
    setDecks(updatedDecks);
    setSelectedDeckId(newDeck.id);
    setNewDeckName('');
    setIsCreatingDeck(false);
    setEditingDeckSpells([]);
    
    // Update the game state
    updateGameState({
      player: {
        ...player,
        decks: updatedDecks
      }
    });
  };
  
  // Save the current deck
  const handleSaveDeck = () => {
    if (!selectedDeckId) return;
    
    // Check if deck meets minimum size requirement
    if (editingDeckSpells.length < MIN_DECK_SIZE) {
      alert(`Your deck must contain at least ${MIN_DECK_SIZE} spells to save.`);
      return;
    }
    
    const updatedDecks = decks.map(deck => {
      if (deck.id === selectedDeckId) {
        return {
          ...deck,
          spells: editingDeckSpells,
          lastModified: new Date().toISOString()
        };
      }
      return deck;
    });
    
    setDecks(updatedDecks);
    
    // Update the game state
    const updatedPlayer = {
      ...player,
      decks: updatedDecks
    };
    
    // If this is the active deck, update equipped spells too
    if (selectedDeckId === activeDeckId) {
      updatedPlayer.equippedSpells = editingDeckSpells;
    }
    
    updateGameState({
      player: updatedPlayer
    });
    
    alert(`Deck "${getActiveDeck()?.name}" saved successfully!`);
  };
  
  // Equip the selected deck (make it active)
  const handleEquipDeck = () => {
    if (!selectedDeckId) return;
    
    const selectedDeck = decks.find(deck => deck.id === selectedDeckId);
    if (!selectedDeck) return;
    
    // Check if deck meets minimum size requirement
    if (selectedDeck.spells.length < MIN_DECK_SIZE) {
      alert(`Your deck must contain at least ${MIN_DECK_SIZE} spells to equip.`);
      return;
    }
    
    setActiveDeckId(selectedDeckId);
    
    // Update the game state
    updateGameState({
      player: {
        ...player,
        activeDeckId: selectedDeckId,
        equippedSpells: selectedDeck.spells
      }
    });
    
    alert(`Deck "${selectedDeck.name}" is now equipped!`);
  };
  
  // Delete the selected deck
  const handleDeleteDeck = () => {
    if (!selectedDeckId) return;
    
    if (decks.length <= 1) {
      alert('You cannot delete your only deck.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this deck?')) {
      const updatedDecks = decks.filter(deck => deck.id !== selectedDeckId);
      setDecks(updatedDecks);
      
      // Set a new active/selected deck
      const newSelectedId = updatedDecks[0]?.id || null;
      setSelectedDeckId(newSelectedId);
      
      const updatedPlayer = {
        ...player,
        decks: updatedDecks
      };
      
      // If the deleted deck was active, update the active deck and equipped spells
      if (selectedDeckId === activeDeckId) {
        setActiveDeckId(newSelectedId);
        
        const newActiveDeck = updatedDecks.find(deck => deck.id === newSelectedId);
        updatedPlayer.activeDeckId = newSelectedId;
        updatedPlayer.equippedSpells = newActiveDeck?.spells || [];
      }
      
      // Update the game state
      updateGameState({
        player: updatedPlayer
      });
    }
  };
  
  return (
    <div className="deck-builder">
      <div className="deck-builder__header">
        <h2>Spell Deck Builder</h2>
        <button className="deck-builder__close" onClick={onClose}>
          Close
        </button>
      </div>
      
      <div className="deck-builder__help">
        <div 
          className="deck-builder__help-header" 
          onClick={toggleHelpSection}
        >
          <h3>How to Use Deck Builder</h3>
          <span className={`deck-builder__help-toggle ${isHelpExpanded ? 'expanded' : ''}`}>
            {isHelpExpanded ? '−' : '+'}
          </span>
        </div>
        
        {isHelpExpanded && (
          <div className="deck-builder__help-content">
            <p>
              Create and manage your spell decks for duels! Each deck must contain at least {MIN_DECK_SIZE} spells.
              Create multiple decks for different strategies, and equip the one you want to use in battle.
            </p>
            <p>
              <strong>Deck Mechanics:</strong> When you cast a spell in battle, it goes to your discard pile. 
              After your next draw step, cards in the discard pile are shuffled back into your deck.
              Strategic deck building is crucial for maintaining spell flow in longer duels!
            </p>
            <ul>
              <li>Click on spells to add/remove them from your selected deck</li>
              <li>Filter and sort spells to find what you need</li>
              <li>Save your deck when you're happy with your selection</li>
              <li>Click "Equip Selected Deck" to use it in your next duel</li>
            </ul>
          </div>
        )}
      </div>
      
      <div className="deck-builder__deck-management">
        <h3>Your Decks</h3>
        
        <div className="deck-builder__decks-list">
          {decks.map(deck => (
            <div
              key={deck.id}
              className={`deck-builder__deck-item ${selectedDeckId === deck.id ? 'deck-builder__deck-item--selected' : ''} ${activeDeckId === deck.id ? 'deck-builder__deck-item--active' : ''}`}
              onClick={() => setSelectedDeckId(deck.id)}
            >
              <div className="deck-builder__deck-name">
                {deck.name} {activeDeckId === deck.id && <span className="deck-builder__active-badge">(Active)</span>}
              </div>
              <div className="deck-builder__deck-info">
                {deck.spells.length} spells {deck.spells.length < MIN_DECK_SIZE && <span className="deck-builder__warning">(Needs {MIN_DECK_SIZE - deck.spells.length} more)</span>}
              </div>
            </div>
          ))}
          
          <div className="deck-builder__deck-actions">
            <button 
              className="deck-builder__deck-action"
              onClick={() => setIsCreatingDeck(true)}
            >
              Create New Deck
            </button>
            
            <button 
              className="deck-builder__deck-action"
              onClick={handleEquipDeck}
              disabled={!selectedDeckId || selectedDeckId === activeDeckId || (getActiveDeck() && getActiveDeck()!.spells.length < MIN_DECK_SIZE)}
            >
              Equip Selected Deck
            </button>
            
            <button 
              className="deck-builder__deck-action deck-builder__deck-action--danger"
              onClick={handleDeleteDeck}
              disabled={!selectedDeckId || decks.length <= 1}
            >
              Delete Selected Deck
            </button>
          </div>
        </div>
        
        {isCreatingDeck && (
          <div className="deck-builder__create-deck">
            <h4>Create New Deck</h4>
            <div className="deck-builder__create-form">
              <input
                type="text"
                placeholder="Enter deck name..."
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
              />
              <div className="deck-builder__create-actions">
                <button 
                  className="deck-builder__create-action"
                  onClick={handleCreateDeck}
                >
                  Create
                </button>
                <button 
                  className="deck-builder__create-action deck-builder__create-action--cancel"
                  onClick={() => setIsCreatingDeck(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isEditingDeck && (
        <>
          <div className="deck-builder__current-deck">
            <div className="deck-builder__current-header">
              <h3>Editing: {getActiveDeck()?.name}</h3>
              <button 
                className="deck-builder__save-button"
                onClick={handleSaveDeck}
                disabled={editingDeckSpells.length < MIN_DECK_SIZE}
              >
                Save Deck
              </button>
            </div>
            
            <div className="deck-builder__deck-slots">
              {editingDeckSpells.map((spell, index) => (
                <div key={spell.id} className="deck-builder__deck-slot">
                  <SpellCard 
                    spell={spell} 
                    onClick={() => toggleSpellInDeck(spell)}
                    isEquipped={true}
                    slotNumber={index + 1}
                  />
                </div>
              ))}
              
              {editingDeckSpells.length < MIN_DECK_SIZE && (
                <div className="deck-builder__min-size-warning">
                  Add at least {MIN_DECK_SIZE - editingDeckSpells.length} more spell{MIN_DECK_SIZE - editingDeckSpells.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>
          
          <div className="deck-builder__filters">
            <div className="deck-builder__search">
              <input
                type="text"
                placeholder="Search spells..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="deck-builder__filter-group">
              <label>Filter by:</label>
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Spells</option>
                <option value="equipped">In Deck</option>
                <option value="damage">Damage</option>
                <option value="healing">Healing</option>
                <option value="buff">Buff</option>
                <option value="debuff">Debuff</option>
                <option value="fire">Fire</option>
                <option value="water">Water</option>
                <option value="earth">Earth</option>
                <option value="air">Air</option>
                <option value="arcane">Arcane</option>
                <option value="nature">Nature</option>
                <option value="shadow">Shadow</option>
                <option value="light">Light</option>
              </select>
            </div>
            
            <div className="deck-builder__filter-group">
              <label>Sort by:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="tier">Tier</option>
                <option value="name">Name</option>
                <option value="mana">Mana Cost</option>
                <option value="element">Element</option>
              </select>
            </div>
          </div>
          
          <div className="deck-builder__collection">
            <h3>Spell Collection ({sortedSpells.length} spells)</h3>
            <div className="deck-builder__spells-grid">
              {sortedSpells.map(spell => (
                <div 
                  key={spell.id} 
                  className={`deck-builder__spell ${isSpellInDeck(spell) ? 'deck-builder__spell--in-deck' : ''}`}
                >
                  <SpellCard 
                    spell={spell} 
                    onClick={() => toggleSpellInDeck(spell)}
                    isEquipped={isSpellInDeck(spell)}
                    slotNumber={isSpellInDeck(spell) ? getSpellDeckPosition(spell) + 1 : undefined}
                  />
                </div>
              ))}
              
              {sortedSpells.length === 0 && (
                <div className="deck-builder__no-spells">
                  No spells match your filter criteria.
                </div>
              )}
            </div>
          </div>
        </>
      )}
      
      {!isEditingDeck && !isCreatingDeck && (
        <div className="deck-builder__empty-state">
          <p>Select a deck to edit or create a new one</p>
        </div>
      )}
    </div>
  );
};

export default DeckBuilder; 