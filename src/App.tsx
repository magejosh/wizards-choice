import React from 'react';
import { useGameStateStore } from './lib/game-state/gameStateStore';
import { NotificationProvider } from './lib/ui/components/notifications/NotificationProvider';
import { GameInterface } from './lib/ui/components/GameInterface';

const App: React.FC = () => {
  const { gameState } = useGameStateStore();

  return (
    <NotificationProvider>
      <GameInterface />
    </NotificationProvider>
  );
};

export default App; 