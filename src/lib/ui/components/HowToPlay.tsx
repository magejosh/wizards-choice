// src/lib/ui/components/HowToPlay.tsx
'use client';

import React from 'react';

interface HowToPlayProps {
  onClose: () => void;
}

const HowToPlay: React.FC<HowToPlayProps> = ({ onClose }) => {
  return (
    <div className="how-to-play">
      <div className="how-to-play__content">
        <h1 className="how-to-play__title">How to Play</h1>
        
        <div className="how-to-play__section">
          <h2 className="how-to-play__section-title">Basic Mechanics</h2>
          <p>
            Wizard's Choice is a tactical spell-casting game where you'll duel against other wizards
            by strategically selecting and casting spells. Your choices will shape your path to
            magical supremacy!
          </p>
        </div>
        
        <div className="how-to-play__section">
          <h2 className="how-to-play__section-title">Spellcasting</h2>
          <p>
            Each turn, you can cast one spell from your hand. Spells cost mana to cast and have
            various effects like dealing damage, healing, or applying status effects. Choose your
            spells wisely based on the situation!
          </p>
          <p>
            You can also use "Mystic Punch" by discarding a spell card to deal direct damage
            without using mana. The damage is based on the spell's tier plus a difficulty modifier.
          </p>
        </div>
        
        <div className="how-to-play__section">
          <h2 className="how-to-play__section-title">Mana Regeneration</h2>
          <p>
            Your mana regenerates at the start of each round. The base regeneration amount equals
            your wizard level plus any equipment bonuses. Manage your mana carefully to cast
            powerful spells when needed.
          </p>
        </div>
        
        <div className="how-to-play__section">
          <h2 className="how-to-play__section-title">Leveling Up</h2>
          <p>
            Winning duels earns you experience points. When you level up, you gain points to
            enhance your wizard's stats:
          </p>
          <ul className="how-to-play__list">
            <li>Max Health: 1 point per +1 Health</li>
            <li>Max Mana: 1 point per +1 Mana</li>
            <li>Mana Regen: 10 points per +1 Mana Regen per round</li>
          </ul>
        </div>
        
        <div className="how-to-play__section">
          <h2 className="how-to-play__section-title">Spell Synergy</h2>
          <p>
            Some spells work particularly well together. Look for combinations that complement
            each other, such as debuffs followed by damage spells, or protective buffs paired
            with healing over time.
          </p>
        </div>
        
        <div className="how-to-play__section">
          <h2 className="how-to-play__section-title">Equipment</h2>
          <p>
            Equip wands, robes, amulets, and rings to enhance your wizard's abilities. Each piece
            provides unique bonuses like mana cost reduction, health boosts, or elemental affinities.
          </p>
        </div>
        
        <button 
          className="how-to-play__close-button"
          onClick={onClose}
        >
          Return to Game
        </button>
      </div>
    </div>
  );
};

export default HowToPlay;
