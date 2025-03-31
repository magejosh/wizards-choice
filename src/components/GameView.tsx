import React, { useState } from 'react';
import WizardStudy from '../lib/ui/components/WizardStudy';
import DeckBuilder from '../lib/ui/components/DeckBuilder';
import EquipmentScreen from '../lib/ui/components/EquipmentScreen';
import InventoryScreen from '../lib/ui/components/InventoryScreen';
import { useGameStateStore } from '../lib/game-state/gameStateStore';
import authService from '../lib/auth/authService';

interface GameViewProps {
  onStartDuel: () => void;
  onReturnToMainMenu: () => void;
}

const GameView: React.FC<GameViewProps> = ({ onStartDuel, onReturnToMainMenu }) => {
  const [showDeckBuilder, setShowDeckBuilder] = useState(false);
  const [showEquipment, setShowEquipment] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCloseDeckBuilder = async () => {
    // Save the game state when closing the deck builder
    // to persist any changes to equipped spells
    setIsLoading(true);
    try {
      await authService.saveGameState();
      setShowDeckBuilder(false);
    } catch (error) {
      console.error('Error saving deck changes:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCloseEquipment = async () => {
    // Save the game state when closing the equipment screen
    setIsLoading(true);
    try {
      await authService.saveGameState();
      setShowEquipment(false);
    } catch (error) {
      console.error('Error saving equipment changes:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCloseInventory = async () => {
    // Save the game state when closing the inventory screen
    setIsLoading(true);
    try {
      await authService.saveGameState();
      setShowInventory(false);
    } catch (error) {
      console.error('Error saving inventory changes:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      {/* Show Wizard Study */}
      <WizardStudy 
        onStartDuel={onStartDuel}
        onOpenDeckBuilder={() => setShowDeckBuilder(true)}
        onOpenEquipment={() => setShowEquipment(true)}
        onOpenInventory={() => setShowInventory(true)}
        onReturnToMainMenu={onReturnToMainMenu}
      />
      
      {/* Overlay components that can appear in game */}
      {showDeckBuilder && <DeckBuilder onClose={handleCloseDeckBuilder} />}
      {showEquipment && <EquipmentScreen onClose={handleCloseEquipment} />}
      {showInventory && <InventoryScreen onClose={handleCloseInventory} />}
    </>
  );
};

export default GameView; 