import React from 'react';
import WizardStudy from './study/WizardStudy';

interface GameViewProps {
  onStartDuel: () => void;
  onReturnToMainMenu: () => void;
}

const GameView: React.FC<GameViewProps> = ({ onStartDuel, onReturnToMainMenu }) => {

  return (
    <WizardStudy
      onStartDuel={onStartDuel}
      onReturnToMainMenu={onReturnToMainMenu}
    />
  );
};

export default GameView;