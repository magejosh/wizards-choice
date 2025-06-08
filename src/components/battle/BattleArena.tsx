'use client';

import React, { useEffect, useState } from 'react';
import styles from './BattleArena.module.css';
import BattleScene from './BattleScene';
import { CombatState } from '@/lib/types';
import { AxialCoord } from '@/lib/utils/hexUtils';
import WizardStats from './WizardStats';
import BattleLog from './BattleLog';
import { Spell, ActiveEffect } from '../../lib/types/spell-types';
import { CombatLogEntry } from '../../lib/types/combat-types';
import SpellCard from '../../components/ui/SpellCard';
import PhaseTracker from './PhaseTracker';
import { CombatPhase } from '@/lib/types';

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
  currentPhase?: CombatPhase;
  equippedPotions: import('../../lib/types/equipment-types').Potion[];
  equippedSpellScrolls: import('../../lib/types/equipment-types').Equipment[];
  onOpenBeltModal: () => void;
  onOpenRobesModal: () => void;
  enemyName?: string;
  playerName?: string;
  playerLevel?: number;
  enemyLevel?: number;
  combatState?: CombatState;
  onMove?: (coord: AxialCoord) => void;
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
  onExitBattle,
  round,
  turn,
  animating,
  spells,
  onSpellCast,
  canCastSpell,
  canUseMysticPunch,
  currentPhase,
  equippedPotions,
  equippedSpellScrolls,
  onOpenBeltModal,
  onOpenRobesModal,
  enemyName,
  playerName,
  playerLevel,
  enemyLevel,
  combatState,
  onMove
}) => {
  // Track if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false);
  // Track if we're in landscape mode
  const [isLandscape, setIsLandscape] = useState(false);

  // Check viewport width and orientation on component mount and window resize
  useEffect(() => {
    const checkDisplay = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width <= 768);
      setIsLandscape(width > height);
    };

    // Check initially
    checkDisplay();

    // Add resize and orientation change listeners
    window.addEventListener('resize', checkDisplay);
    window.addEventListener('orientationchange', checkDisplay);

    // Clean up
    return () => {
      window.removeEventListener('resize', checkDisplay);
      window.removeEventListener('orientationchange', checkDisplay);
    };
  }, []);

  // Restructure for mobile to put battle log at the bottom
  if (isMobile) {
    // Determine battle area height based on orientation
    const battleAreaHeight = isLandscape
      ? window.innerWidth <= 380 ? '300px' : '350px'  // taller in landscape
      : window.innerWidth <= 380 ? '250px' : '300px'; // regular in portrait

    // Adjust spell area height based on orientation
    const spellAreaMaxHeight = isLandscape
      ? window.innerWidth <= 380 ? '200px' : '250px'  // shorter in landscape
      : window.innerWidth <= 380 ? '300px' : '400px'; // taller in portrait

    // Adjust battle log based on orientation
    const battleLogMaxHeight = isLandscape ? '120px' : '150px';

    return (
      <div className={styles.battleArena} style={{
        flexDirection: 'column',
        padding: window.innerWidth <= 380 ? '0.5rem' : '1rem',
        gap: window.innerWidth <= 380 ? '0.5rem' : '1rem',
        overflow: 'auto',
        height: 'auto',
        minHeight: '100%'
      }}>
        {/* Battle Scene Area */}
        <div className={styles.mainBattleArea} style={{
          height: battleAreaHeight,
          position: 'relative'
        }}>
          <div className={styles.sceneContainer}>
            {currentPhase && (
              <div className={styles.phaseTrackerWrapper}>
                <PhaseTracker
                  currentPhase={currentPhase}
                  isPlayerTurn={isPlayerTurn}
                  round={round}
                />
              </div>
            )}
            <BattleScene
              playerHealth={playerHealth}
              playerMaxHealth={playerMaxHealth}
              enemyHealth={enemyHealth}
              enemyMaxHealth={enemyMaxHealth}
              animating={animating}
              currentPhase={currentPhase}
              combatState={combatState}
              log={battleLog}
              onMove={onMove}
            />
          </div>

          <WizardStats
            name={playerName || "Your Wizard"}
            currentHealth={playerHealth}
            maxHealth={playerMaxHealth}
            currentMana={playerMana}
            maxMana={playerMaxMana}
            activeEffects={playerActiveEffects || []}
            isPlayer={true}
            style={!isLandscape ? {
              position: 'absolute',
              top: '5px',
              left: '5px',
              transform: 'scale(0.63)',
              transformOrigin: 'top left',
              zIndex: 5
            } : undefined}
          />

          <WizardStats
            name={enemyName || "Enemy Wizard"}
            currentHealth={enemyHealth}
            maxHealth={enemyMaxHealth}
            currentMana={enemyMana}
            maxMana={enemyMaxMana}
            activeEffects={enemyActiveEffects || []}
            isPlayer={false}
            style={!isLandscape ? {
              position: 'absolute',
              top: '5px',
              right: '5px',
              transform: 'scale(0.63)',
              transformOrigin: 'top right',
              zIndex: 5
            } : undefined}
          />
        </div>

        {/* Spells Area */}
        <div className={styles.spellsArea} style={{
          maxHeight: spellAreaMaxHeight,
          overflow: 'auto'
        }}>
          <div className={styles.spellsContainer} style={{
            gridTemplateColumns: window.innerWidth <= 380 ? 'repeat(auto-fill, minmax(120px, 1fr))' :
                              window.innerWidth <= 480 ? 'repeat(auto-fill, minmax(140px, 1fr))' :
                              'repeat(auto-fill, minmax(12.5rem, 1fr))'
          }}>
            {spells?.map((spell, index) => (
              <div key={index} className={styles.spellCardWrapper}>
                <SpellCard
                  spell={spell}
                  onClick={() => onSpellCast(spell)}
                  disabled={!canCastSpell(spell)}
                />
              </div>
            ))}
          </div>
          <div className={styles.actionButtons}>
            <button
              className={styles.mysticPunchButton}
              onClick={onMysticPunch}
              disabled={!canUseMysticPunch}
              style={{
                fontSize: window.innerWidth <= 380 ? '0.9rem' : '1rem',
                padding: window.innerWidth <= 380 ? '0.4rem 0.6rem' : '0.5rem 1rem'
              }}
            >
              Mystic Punch
            </button>
            <button
              className={styles.skipTurnButton}
              onClick={onSkipTurn}
              style={{
                fontSize: window.innerWidth <= 380 ? '0.9rem' : '1rem',
                padding: window.innerWidth <= 380 ? '0.4rem 0.6rem' : '0.5rem 1rem'
              }}
            >
              Skip Turn
            </button>
            <button
              className={styles.mysticPunchButton}
              onClick={onOpenBeltModal}
              disabled={!(equippedPotions && equippedPotions.length > 0)}
              style={{
                fontSize: window.innerWidth <= 380 ? '0.9rem' : '1rem',
                padding: window.innerWidth <= 380 ? '0.4rem 0.6rem' : '0.5rem 1rem'
              }}
              title={equippedPotions && equippedPotions.length > 0 ? 'Use a potion' : 'No potions equipped'}
            >
              Belt
            </button>
            <button
              className={styles.mysticPunchButton}
              onClick={onOpenRobesModal}
              disabled={!(equippedSpellScrolls && equippedSpellScrolls.length > 0)}
              style={{
                fontSize: window.innerWidth <= 380 ? '0.9rem' : '1rem',
                padding: window.innerWidth <= 380 ? '0.4rem 0.6rem' : '0.5rem 1rem'
              }}
              title={equippedSpellScrolls && equippedSpellScrolls.length > 0 ? 'Use a scroll' : 'No scrolls equipped'}
            >
              Robes
            </button>
          </div>
        </div>

        {/* Battle Log placed last for mobile */}
        <div className={styles.battleLog} style={{
          width: '100%',
          height: 'auto',
          maxHeight: battleLogMaxHeight,
          marginLeft: '0',
          marginTop: '0.5rem'
        }}>
          <BattleLog entries={battleLog || []} />
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className={styles.battleArena}>
      <div className={styles.mainContent}>
        <div className={styles.mainBattleArea}>
          <div className={styles.wizardInfo}>
            <WizardStats
              name={playerName || "Your Wizard"}
              currentHealth={playerHealth}
              maxHealth={playerMaxHealth}
              currentMana={playerMana}
              maxMana={playerMaxMana}
              activeEffects={playerActiveEffects || []}
              isPlayer={true}
            />
          </div>

          <div className={styles.sceneContainer}>
            {currentPhase && (
              <div className={styles.phaseTrackerWrapper}>
                <PhaseTracker
                  currentPhase={currentPhase}
                  isPlayerTurn={isPlayerTurn}
                  round={round}
                />
              </div>
            )}
            <BattleScene
              playerHealth={playerHealth}
              playerMaxHealth={playerMaxHealth}
              enemyHealth={enemyHealth}
              enemyMaxHealth={enemyMaxHealth}
              animating={animating}
              currentPhase={currentPhase}
              combatState={combatState}
              log={battleLog}
              onMove={onMove}
            />
          </div>

          <div className={`${styles.wizardInfo} ${styles.enemyInfo}`}>
            <WizardStats
              name={enemyName || "Enemy Wizard"}
              currentHealth={enemyHealth}
              maxHealth={enemyMaxHealth}
              currentMana={enemyMana}
              maxMana={enemyMaxMana}
              activeEffects={enemyActiveEffects || []}
              isPlayer={false}
            />
          </div>
        </div>

        <div className={styles.spellsArea}>
          <div className={styles.spellsContainer}>
            {spells?.map((spell, index) => (
              <div key={index} className={styles.spellCardWrapper}>
                <SpellCard
                  spell={spell}
                  onClick={() => onSpellCast(spell)}
                  disabled={!canCastSpell(spell)}
                />
              </div>
            ))}
          </div>
          <div className={styles.actionButtons}>
            <button
              className={styles.mysticPunchButton}
              onClick={onMysticPunch}
              disabled={!canUseMysticPunch}
              style={{
                fontSize: window.innerWidth <= 380 ? '0.9rem' : '1rem',
                padding: window.innerWidth <= 380 ? '0.4rem 0.6rem' : '0.5rem 1rem'
              }}
            >
              Mystic Punch
            </button>
            <button
              className={styles.skipTurnButton}
              onClick={onSkipTurn}
              style={{
                fontSize: window.innerWidth <= 380 ? '0.9rem' : '1rem',
                padding: window.innerWidth <= 380 ? '0.4rem 0.6rem' : '0.5rem 1rem'
              }}
            >
              Skip Turn
            </button>
            <button
              className={styles.mysticPunchButton}
              onClick={onOpenBeltModal}
              disabled={!(equippedPotions && equippedPotions.length > 0)}
              style={{
                fontSize: window.innerWidth <= 380 ? '0.9rem' : '1rem',
                padding: window.innerWidth <= 380 ? '0.4rem 0.6rem' : '0.5rem 1rem'
              }}
              title={equippedPotions && equippedPotions.length > 0 ? 'Use a potion' : 'No potions equipped'}
            >
              Belt
            </button>
            <button
              className={styles.mysticPunchButton}
              onClick={onOpenRobesModal}
              disabled={!(equippedSpellScrolls && equippedSpellScrolls.length > 0)}
              style={{
                fontSize: window.innerWidth <= 380 ? '0.9rem' : '1rem',
                padding: window.innerWidth <= 380 ? '0.4rem 0.6rem' : '0.5rem 1rem'
              }}
              title={equippedSpellScrolls && equippedSpellScrolls.length > 0 ? 'Use a scroll' : 'No scrolls equipped'}
            >
              Robes
            </button>
          </div>
        </div>
      </div>

      <div className={styles.battleLog}>
        <BattleLog entries={battleLog || []} />
      </div>
    </div>
  );
};

export default BattleArena;