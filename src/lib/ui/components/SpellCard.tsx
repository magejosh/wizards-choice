// src/lib/ui/components/SpellCard.tsx
'use client';

import React from 'react';
import { Spell } from '../../types';

export interface SpellCardProps {
  spell: Spell;
  onClick?: () => void;
  isEquipped?: boolean;
  slotNumber?: number;
}

const SpellCard: React.FC<SpellCardProps> = ({ 
  spell, 
  onClick, 
  isEquipped = false,
  slotNumber
}) => {
  // Map element to a CSS class for styling
  const elementClass = `spell-card--${spell.element}`;
  
  // Map type to a CSS class for styling
  const typeClass = `spell-card--${spell.type}`;
  
  // Get proper image path, with fallbacks
  const getImagePath = () => {
    // If spell has a specific image path, use it
    if (spell.imagePath && spell.imagePath.trim() !== '') {
      return spell.imagePath;
    }
    
    // Try element-specific default
    const elementDefault = `/images/${spell.element}-default.jpg`;
    
    // Fallback to generic default
    return `/images/default-placeholder.jpg`;
  };
  
  return (
    <div 
      className={`spell-card ${elementClass} ${typeClass} ${isEquipped ? 'spell-card--equipped' : ''}`}
      onClick={onClick}
    >
      {slotNumber !== undefined && (
        <div className="spell-card__slot-number">{slotNumber}</div>
      )}
      
      <div className="spell-card__header">
        <h3 className="spell-card__name">{spell.name}</h3>
        <div className="spell-card__tier">Tier {spell.tier}</div>
      </div>
      
      <div className="spell-card__image-container">
        <img 
          src={getImagePath()} 
          alt={spell.name} 
          className="spell-card__image" 
          onError={(e) => {
            // Fallback if the image fails to load
            const target = e.target as HTMLImageElement;
            target.src = '/images/default-placeholder.jpg';
          }}
        />
        <div className="spell-card__element-overlay">
          <span className="spell-card__element">{spell.element}</span>
          <span className="spell-card__type">{spell.type}</span>
        </div>
      </div>
      
      <div className="spell-card__info">
        <div className="spell-card__mana-cost">
          <span className="spell-card__mana-icon">✦</span>
          <span className="spell-card__mana-value">{spell.manaCost}</span>
        </div>
        
        <div className="spell-card__description">
          {spell.description}
        </div>
        
        <div className="spell-card__effects">
          {spell.effects.map((effect, index) => (
            <div key={index} className="spell-card__effect">
              <span className="spell-card__effect-type">
                {effect.type === 'damage' && '💥'}
                {effect.type === 'healing' && '💚'}
                {effect.type === 'statModifier' && '⚡'}
                {effect.type === 'statusEffect' && '🔄'}
                {effect.type === 'manaRestore' && '✨'}
              </span>
              <span className="spell-card__effect-value">
                {effect.value > 0 && '+'}
                {effect.value}
              </span>
              {effect.duration && (
                <span className="spell-card__effect-duration">
                  for {effect.duration} {effect.duration === 1 ? 'turn' : 'turns'}
                </span>
              )}
              <span className="spell-card__effect-target">
                {effect.target === 'self' ? 'You' : 'Enemy'}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {isEquipped && (
        <div className="spell-card__equipped-badge">Equipped</div>
      )}
    </div>
  );
};

export default SpellCard;
