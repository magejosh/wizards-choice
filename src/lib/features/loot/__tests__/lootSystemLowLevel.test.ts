import { generateLoot } from '../lootSystem';
import { calculateWizardStats } from '../../../wizard/wizardUtils';
import { Wizard } from '../../../types';

function createWizard(level: number): Wizard {
  return calculateWizardStats({
    id: `w${level}`,
    name: 'Test',
    level,
    experience: 0,
    experienceToNextLevel: 100,
    health: 100,
    mana: 100,
    maxHealth: 100,
    maxMana: 100,
    manaRegen: 1,
    spells: [],
    equippedSpells: [],
    equipment: {},
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

test('easy difficulty low-level enemies grant extra gold', async () => {
  const player = createWizard(1);
  const enemy = createWizard(3);
  const loot = await generateLoot(player, enemy, true, 'easy');
  expect(loot.gold).toBe(54);
});
