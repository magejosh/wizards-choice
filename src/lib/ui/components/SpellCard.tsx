// src/lib/ui/components/SpellCard.tsx
'use client';

import React from 'react';
import { Spell } from '../../types';
import { getElementColor } from '../theme';

interface SpellCardProps {
  spell: Spell;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

const SpellCard: React.FC<SpellCardProps> = ({ 
  spell, 
  onClick, 
  selected = false,
  disabled = false 
}) => {
  const elementColor = getElementColor(spell.element);
  
  return (
    <div 
      className={`
        spell-card 
        ${selected ? 'spell-card--selected' : ''} 
        ${disabled ? 'spell-card--disabled' : ''}
      `}
      onClick={!disabled ? onClick : undefined}
      style={{
        '--element-color': elementColor,
      } as React.CSSProperties}
    >
      <div className="spell-card__header">
        <h3 className="spell-card__name">{spell.name}</h3>
        <div className="spell-card__type-badge">{spell.type}</div>
      </div>
      
      <div className="spell-card__image-container">
        <img 
          src={spell.imagePath} 
          alt={spell.name} 
          className="spell-card__image" 
        />
        <div className="spell-card__element-badge">{spell.element}</div>
      </div>
      
      <div className="spell-card__content">
        <p className="spell-card__description">{spell.description}</p>
        
        <div className="spell-card__effects">
          {spell.effects.map((effect, index) => (
            <div key={index} className="spell-card__effect">
              <span className="spell-card__effect-type">{effect.type}:</span>
              <span className="spell-card__effect-value">{effect.value}</span>
              {effect.duration && (
                <span className="spell-card__effect-duration">
                  for {effect.duration} turns
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="spell-card__footer">
        <div className="spell-card__mana-cost">
          <span className="spell-card__mana-icon">✦</span>
          <span className="spell-card__mana-value">{spell.manaCost}</span>
        </div>
        <div className="spell-card__tier">Tier {spell.tier}</div>
      </div>
    </div>
  );
};

export default SpellCard;
