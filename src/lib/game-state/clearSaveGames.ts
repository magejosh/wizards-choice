// Function to clear save games from local storage
export function clearSaveGames() {
  // Clear all game state related items from local storage
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('wizards-choice-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Force a page reload to ensure clean state
  window.location.reload();
} 