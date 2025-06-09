import { executeMysticPunch } from '../spellExecutor';
import { calculateWizardStats } from '../../wizard/wizardUtils';
import { CombatState, Wizard, Equipment } from '../../types';

const dagger: Equipment = {
  id: 'd1',
  name: 'Dagger',
  slot: 'hand',
  rarity: 'common',
  bonuses: [
    { stat: 'mysticPunchPower', value: 10 },
    { stat: 'bleedEffect', value: 3 },
  ],
  description: '',
  equipped: true,
  unlocked: true,
};

function createWizard(withDagger: boolean): Wizard {
  return calculateWizardStats({
    id: 'w1',
    name: 'Test',
    level: 1,
    experience: 0,
    experienceToNextLevel: 100,
    health: 100,
    mana: 100,
    maxHealth: 100,
    maxMana: 100,
    manaRegen: 1,
    spells: [],
    equippedSpells: [],
    equipment: withDagger ? { hand: dagger } : {},
    inventory: [],
    potions: [],
    equippedPotions: [],
    equippedSpellScrolls: [],
    ingredients: [],
    discoveredRecipes: [],
    levelUpPoints: 0,
    gold: 0,
    skillPoints: 0,
    decks: [],
    activeDeckId: null,
    combatStats: {},
    baseMaxHealth: 100,
    progressionMaxHealth: 0,
    equipmentMaxHealth: 0,
    totalMaxHealth: 100,
    baseMaxMana: 100,
    progressionMaxMana: 0,
    equipmentMaxMana: 0,
    totalMaxMana: 100,
  } as Wizard);
}

function createState(player: Wizard, enemy: Wizard): CombatState {
  return {
    playerWizard: {
      wizard: player,
      currentHealth: player.maxHealth,
      currentMana: player.maxMana,
      activeEffects: [],
      selectedSpell: null,
      hand: [],
      drawPile: [],
      discardPile: [],
      equippedPotions: [],
      equippedSpellScrolls: [],
      position: { q: 0, r: 0 },
      minions: [],
    },
    enemyWizard: {
      wizard: enemy,
      currentHealth: enemy.maxHealth,
      currentMana: enemy.maxMana,
      activeEffects: [],
      selectedSpell: null,
      hand: [],
      drawPile: [],
      discardPile: [],
      equippedPotions: [],
      equippedSpellScrolls: [],
      position: { q: 1, r: 0 },
      minions: [],
    },
    playerMinions: [],
    enemyMinions: [],
    turn: 1,
    round: 1,
    isPlayerTurn: true,
    log: [],
    status: 'active',
    difficulty: 'normal',
    currentPhase: 'action',
    firstActor: 'player',
    initiative: { player: 1, enemy: 1 },
    actionState: { player: { hasActed: false, hasResponded: false }, enemy: { hasActed: false, hasResponded: false } },
    effectQueue: [],
    pendingResponse: { active: false, action: null, respondingActor: null, responseTimeRemaining: 0 },
  } as CombatState;
}

test('mystic punch power and bleed effect from equipment apply', () => {
  const player = createWizard(true);
  const enemy = createWizard(false);
  const state = createState(player, enemy);

  const result = executeMysticPunch(state, 1, true);

  expect(result.enemyWizard.currentHealth).toBe(enemy.maxHealth - 20);
  expect(result.enemyWizard.activeEffects.length).toBe(1);
  expect(result.enemyWizard.activeEffects[0].value).toBe(3);
});
