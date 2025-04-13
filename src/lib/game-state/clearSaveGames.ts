// Function to clear save games from local storage
import { useGameStateStore } from './gameStateStore';

export const clearSaveGames = () => {
  console.log('Clearing all save games...');

  try {
    // Get the resetState function from the store
    const { resetState } = useGameStateStore.getState();

    // Clear all localStorage entries first
    localStorage.removeItem('wizards-choice-game-state');

    // Clear individual save slots (old format)
    for (let i = 0; i < 3; i++) {
      localStorage.removeItem(`wizardsChoice_saveSlot_${i}`);
    }

    // Clear any save slots in new format
    const allKeys = Object.keys(localStorage);
    const saveKeys = allKeys.filter(key => key.startsWith('wizardsChoice_save_'));
    saveKeys.forEach(key => localStorage.removeItem(key));

    // Clear any other game-related data
    localStorage.removeItem('wizardsChoice_currentSaveSlot');
    localStorage.removeItem('wizardsChoice_gameState');

    // Reset the store state last
    resetState();

    console.log('All save data has been cleared');
    return true;
  } catch (error) {
    console.error('Error clearing save games:', error);
    return false;
  }
};