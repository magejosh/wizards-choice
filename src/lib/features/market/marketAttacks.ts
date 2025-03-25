import { Wizard, Ingredient, IngredientRarity } from '../../types';
import { generateDefaultWizard } from '../../wizard/wizardUtils';
import { generateRandomIngredient } from '../procedural/ingredientGenerator';
import { getSpellsByElement, getSpellsByTier } from '../../spells/spellData';

// Constants for market attack system
const BASE_ATTACK_CHANCE = 0.15; // 15% base chance
const LEVEL_SCALING_FACTOR = 0.005; // Increases chance by 0.5% per level of the market
const MAX_ATTACK_CHANCE = 0.40; // Maximum 40% chance

/**
 * Determines if a market attack should occur when leaving a market
 * @param marketLevel The level of the market (unlock level)
 * @param playerLevel The player's current level
 * @param difficulty The game difficulty setting
 * @returns Whether an attack should occur
 */
export function shouldMarketAttackOccur(
  marketLevel: number,
  playerLevel: number,
  difficulty: 'easy' | 'normal' | 'hard'
): boolean {
  // Base chance adjusted by market level
  let attackChance = BASE_ATTACK_CHANCE + (marketLevel * LEVEL_SCALING_FACTOR);
  
  // Adjust based on difficulty
  if (difficulty === 'easy') {
    attackChance *= 0.5; // 50% less chance on easy
  } else if (difficulty === 'hard') {
    attackChance *= 1.5; // 50% more chance on hard
  }
  
  // Cap at maximum chance
  attackChance = Math.min(attackChance, MAX_ATTACK_CHANCE);
  
  // Reduce chance if player is significantly higher level than the market
  if (playerLevel > marketLevel + 10) {
    attackChance *= 0.5; // 50% reduction if player is 10+ levels above market
  }
  
  // Random roll
  return Math.random() < attackChance;
}

/**
 * Generates a thief/bandit wizard for a market attack
 * @param playerLevel The player's current level
 * @param marketLevel The level of the market
 * @param difficulty The game difficulty
 * @returns A specialized thief/bandit wizard
 */
export function generateMarketAttacker(
  playerLevel: number,
  marketLevel: number,
  difficulty: 'easy' | 'normal' | 'hard'
): Wizard {
  // Bandit level is based on market level and player level
  const banditLevelBase = Math.floor((marketLevel + playerLevel) / 2);
  
  // Adjust level based on difficulty
  let banditLevel = banditLevelBase;
  switch (difficulty) {
    case 'easy':
      banditLevel = Math.max(1, banditLevelBase - 2);
      break;
    case 'normal':
      banditLevel = banditLevelBase;
      break;
    case 'hard':
      banditLevel = banditLevelBase + 2;
      break;
  }
  
  // Generate bandit name
  const banditNames = [
    'Shadow Thief', 'Market Bandit', 'Arcane Pickpocket', 'Potion Snatcher', 
    'Gold Grabber', 'Relic Robber', 'Mystic Mugger', 'Spell Swiper',
    'Ingredient Pilferer', 'Scroll Snatcher', 'Alley Ambusher', 'Market Rogue'
  ];
  
  const randomName = banditNames[Math.floor(Math.random() * banditNames.length)];
  const fullName = `${randomName} (Level ${banditLevel})`;
  
  // Create base bandit wizard
  const bandit = generateDefaultWizard(fullName);
  
  // Adjust stats based on level and difficulty
  bandit.level = banditLevel;
  bandit.maxHealth = 80 + (banditLevel * 8);
  bandit.health = bandit.maxHealth;
  bandit.maxMana = 80 + (banditLevel * 6);
  bandit.mana = bandit.maxMana;
  bandit.manaRegen = Math.max(1, Math.floor(banditLevel / 2));
  
  // Add specialized bandit spells
  addBanditSpells(bandit, banditLevel);
  
  return bandit;
}

/**
 * Adds specialized spells to a market attacker wizard
 * @param bandit The bandit wizard to add spells to
 * @param level The bandit's level
 */
function addBanditSpells(bandit: Wizard, level: number): void {
  // Calculate max spell tier based on level
  const maxTier = Math.min(Math.ceil(level / 3), 8); // Cap at tier 8
  
  // Bandits focus on shadow/stealth and quick damage spells
  // Add some utility and shadow-themed spells
  const utilitySpells = getSpellsByElement('shadow').filter(s => s.tier <= maxTier);
  const damageSpells = getSpellsByElement('fire').filter(s => s.tier <= maxTier);
  const defenseSpells = getSpellsByElement('arcane').filter(s => s.tier <= maxTier);
  
  // Add utility spells (2-3)
  const utilityCount = 2 + (Math.random() < 0.5 ? 1 : 0);
  for (let i = 0; i < utilityCount && i < utilitySpells.length; i++) {
    bandit.spells.push(utilitySpells[i]);
    if (i === 0) bandit.equippedSpells.push(utilitySpells[i]); // Equip at least one
  }
  
  // Add damage spells (3-4)
  const damageCount = 3 + (Math.random() < 0.5 ? 1 : 0);
  for (let i = 0; i < damageCount && i < damageSpells.length; i++) {
    bandit.spells.push(damageSpells[i]);
    if (i < 2) bandit.equippedSpells.push(damageSpells[i]); // Equip two
  }
  
  // Add defense spells (1-2)
  const defenseCount = 1 + (Math.random() < 0.5 ? 1 : 0);
  for (let i = 0; i < defenseCount && i < defenseSpells.length; i++) {
    bandit.spells.push(defenseSpells[i]);
    if (i === 0) bandit.equippedSpells.push(defenseSpells[i]); // Equip one
  }
  
  // Add signature bandit spell
  const banditSpell = createBanditSignatureSpell(level);
  bandit.spells.push(banditSpell);
  bandit.equippedSpells.push(banditSpell);
}

/**
 * Creates a signature spell for bandits
 * @param level The bandit's level
 * @returns A unique signature spell
 */
function createBanditSignatureSpell(level: number): any {
  // Base damage value increases with level
  const baseDamage = 10 + (level * 2);
  
  return {
    id: `spell_shadow_strike_${Date.now()}`,
    name: 'Shadow Strike',
    type: 'damage',
    element: 'shadow',
    tier: Math.min(Math.ceil(level / 3), 5),
    manaCost: 15 + Math.floor(level / 2),
    description: 'A quick, unexpected strike from the shadows that deals damage and has a chance to steal gold.',
    effects: [
      {
        type: 'damage',
        value: baseDamage,
        target: 'enemy',
        element: 'shadow',
      },
      {
        type: 'special',
        value: Math.floor(level / 2),
        target: 'enemy',
        element: 'shadow',
        description: 'May steal gold on hit'
      }
    ],
    imagePath: '/images/spells/default-placeholder.jpg',
  };
}

/**
 * Generates loot rewards for defeating a market attacker
 * @param attackerLevel The level of the defeated attacker
 * @returns Array of ingredient rewards
 */
export function generateMarketAttackerLoot(attackerLevel: number): Ingredient[] {
  const loot: Ingredient[] = [];
  
  // Number of ingredients increases with attacker level
  const ingredientCount = 2 + Math.floor(attackerLevel / 5);
  
  for (let i = 0; i < ingredientCount; i++) {
    // Determine rarity based on attacker level and random chance
    let rarity: IngredientRarity = 'common';
    
    const rarityRoll = Math.random();
    if (attackerLevel >= 15 && rarityRoll < 0.08) {
      rarity = 'legendary';
    } else if (attackerLevel >= 10 && rarityRoll < 0.15) {
      rarity = 'epic';
    } else if (attackerLevel >= 5 && rarityRoll < 0.3) {
      rarity = 'rare';
    } else if (rarityRoll < 0.5) {
      rarity = 'uncommon';
    }
    
    // Create random ingredient with appropriate tier based on level
    const tier = Math.min(Math.max(Math.floor(attackerLevel / 5), 1), 5);
    const ingredient = generateRandomIngredient(attackerLevel);
    
    loot.push(ingredient);
  }
  
  return loot;
} 