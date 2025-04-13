import React from 'react';
import MainMenu from './menu/MainMenu';

interface MainMenuViewProps {
  onStartNewGame: (saveSlotId: number, saveUuid: string) => void;
  onContinueGame: (saveSlotId: number, saveUuid: string) => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onLogout: () => void;
}

const MainMenuView: React.FC<MainMenuViewProps> = ({
  onStartNewGame,
  onContinueGame,
  onOpenSettings,
  onOpenHowToPlay,
  onLogout
}) => {
  return (
    <MainMenu
      onStartNewGame={onStartNewGame}
      onContinueGame={onContinueGame}
      onOpenSettings={onOpenSettings}
      onOpenHowToPlay={onOpenHowToPlay}
      onLogout={onLogout}
    />
  );
};

export default MainMenuView;