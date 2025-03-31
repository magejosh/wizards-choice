'use client';

import React from 'react';
import styles from './BattleArena.module.css';
import BattleScene from './BattleScene';
import WizardStats from './WizardStats';
import BattleLog from './BattleLog';
import { Spell, ActiveEffect, SpellEffect } from '../../lib/types/spell-types';
import { CombatState, CombatLogEntry } from '../../lib/types/combat-types';
import { ElementType } from '../../lib/types/element-types';
import { Wizard } from '../../lib/types/wizard-types';

interface BattleArenaProps {
  playerHealth: number;
  playerMaxHealth: number;
  playerMana: number;
  playerMaxMana: number;
  playerActiveEffects: ActiveEffect[];
  enemyHealth: number;
  enemyMaxHealth: number;
  enemyMana: number;
  enemyMaxMana: number;
  enemyActiveEffects: ActiveEffect[];
  battleLog: CombatLogEntry[];
  isPlayerTurn: boolean;
  onMysticPunch: () => void;
  onSkipTurn: () => void;
  onExitBattle: () => void;
  round: number;
  turn: number;
  animating: boolean;
  spells: Spell[];
  onSpellCast: (spell: Spell) => void;
  canCastSpell: (spell: Spell) => boolean;
  canUseMysticPunch: boolean;
}

const BattleArena: React.FC<BattleArenaProps> = ({
  playerHealth,
  playerMaxHealth,
  playerMana,
  playerMaxMana,
  playerActiveEffects,
  enemyHealth,
  enemyMaxHealth,
  enemyMana,
  enemyMaxMana,
  enemyActiveEffects,
  battleLog,
  isPlayerTurn,
  onMysticPunch,
  onSkipTurn,
  round,
  turn,
  animating,
  spells = [],
  onSpellCast,
  canCastSpell,
  canUseMysticPunch
}) => {
  // Create default wizard objects
  const playerWizard: Wizard = {
    id: 'player',
    name: 'Player',
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    health: playerMaxHealth,
    maxHealth: playerMaxHealth,
    mana: playerMaxMana,
    maxMana: playerMaxMana,
    manaRegen: 1,
    spells: [],
    equippedSpells: [],
    equipment: {},
    potions: [],
    equippedPotions: [],
    levelUpPoints: 0
  };

  const enemyWizard: Wizard = {
    id: 'enemy',
    name: 'Enemy',
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    health: enemyMaxHealth,
    maxHealth: enemyMaxHealth,
    mana: enemyMaxMana,
    maxMana: enemyMaxMana,
    manaRegen: 1,
    spells: [],
    equippedSpells: [],
    equipment: {},
    potions: [],
    equippedPotions: [],
    levelUpPoints: 0
  };

  // Create default spell effect for active effects
  const defaultSpellEffect: SpellEffect = {
    type: 'statusEffect',
    value: 0,
    target: 'enemy',
    element: 'neutral' as ElementType
  };

  // Create combat state for BattleScene
  const combatState: CombatState = {
    playerWizard: {
      wizard: playerWizard,
      currentHealth: playerHealth,
      currentMana: playerMana,
      activeEffects: playerActiveEffects.map(effect => ({
        ...effect,
        id: effect.id || `player-effect-${Date.now()}-${Math.random()}`,
        effect: effect.effect || defaultSpellEffect
      })) as ActiveEffect[],
      selectedSpell: null,
      hand: [],
      drawPile: [],
      discardPile: []
    },
    enemyWizard: {
      wizard: enemyWizard,
      currentHealth: enemyHealth,
      currentMana: enemyMana,
      activeEffects: enemyActiveEffects.map(effect => ({
        ...effect,
        id: effect.id || `enemy-effect-${Date.now()}-${Math.random()}`,
        effect: effect.effect || defaultSpellEffect
      })) as ActiveEffect[],
      selectedSpell: null,
      hand: [],
      drawPile: [],
      discardPile: []
    },
    turn,
    round,
    isPlayerTurn,
    log: battleLog,
    status: 'active' as const,
    difficulty: 'normal' as const
  };

  return (
    <div className={styles.battleArena}>
      <div className={styles.battleCanvas}>
        <BattleScene
          combatState={combatState}
          playerHealth={playerHealth}
          playerMaxHealth={playerMaxHealth}
          enemyHealth={enemyHealth}
          enemyMaxHealth={enemyMaxHealth}
          animating={animating}
        />
        
        {/* Wizard info panels */}
        <div className={styles.playerSection}>
          <WizardStats
            name="Your Wizard"
            currentHealth={playerHealth}
            maxHealth={playerMaxHealth}
            currentMana={playerMana}
            maxMana={playerMaxMana}
            activeEffects={playerActiveEffects || []}
            isPlayer={true}
          />
        </div>
        
        <div className={styles.enemySection}>
          <WizardStats
            name="Enemy Wizard"
            currentHealth={enemyHealth}
            maxHealth={enemyMaxHealth}
            currentMana={enemyMana}
            maxMana={enemyMaxMana}
            activeEffects={enemyActiveEffects || []}
            isPlayer={false}
          />
        </div>
      </div>

      <div className={styles.battleContent}>
        {/* Spells section */}
        <div className={styles.playerSpellSection}>
          <div className={styles.spellsContainer}>
            {(spells || []).map((spell, index) => (
              <div
                key={index}
                className={`${styles.spellCard} ${!canCastSpell(spell) ? styles.spellCardDisabled : ''}`}
                onClick={() => canCastSpell(spell) && onSpellCast(spell)}
              >
                <div className={styles.spellCardHeader}>
                  <span className={styles.spellName}>{spell.name}</span>
                  <span className={styles.spellMana}>{spell.manaCost}</span>
                </div>
                <div className={styles.spellCardBody}>
                  <span className={styles.spellElement}>{spell.element}</span>
                  <span className={styles.spellType}>{spell.type}</span>
                </div>
                <div className={styles.spellCardDescription}>
                  {spell.description}
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.actionButtons}>
            <button 
              className={styles.actionButton}
              onClick={onMysticPunch}
              disabled={!isPlayerTurn || !canUseMysticPunch}
            >
              Mystic Punch
            </button>
            <button
              className={styles.actionButton}
              onClick={onSkipTurn}
              disabled={!isPlayerTurn}
            >
              Skip Turn
            </button>
          </div>
        </div>

        {/* Battle log */}
        <div className={styles.battleLogSection}>
          <BattleLog entries={battleLog || []} />
        </div>
      </div>
    </div>
  );
};

export default BattleArena; 