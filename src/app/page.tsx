// src/app/page.tsx
'use client';

import React from 'react';
import MainMenu from '../lib/ui/components/MainMenu';

export default function Home() {
  return (
    <div className="app-container">
      <MainMenu 
        onStartNewGame={() => console.log('Start new game')}
        onContinueGame={(saveSlotId) => console.log('Continue game', saveSlotId)}
        onOpenSettings={() => console.log('Open settings')}
        onOpenHowToPlay={() => console.log('Open how to play')}
      />
    </div>
  );
}
