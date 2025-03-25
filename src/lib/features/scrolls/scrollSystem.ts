import { v4 as uuidv4 } from 'uuid';
import { Spell, SpellScroll, IngredientRarity, Wizard } from '../../types';
import { getAllSpells, getSpellsByTier } from '../../spells/spellData';
import { getAllSpecialSpells } from '../../spells/specialSpellData';

/**
 * Generates a spell scroll for a specific spell
 * @param spell The spell to create a scroll for
 * @returns A new SpellScroll object
 */
export function createSpellScroll(spell: Spell): SpellScroll {
  const rarityMap: Record<number, IngredientRarity> = {
    1: 'common',
    2: 'common',
    3: 'uncommon',
    4: 'uncommon',
    5: 'rare',
    6: 'rare',
    7: 'epic',
    8: 'epic',
    9: 'legendary',
    10: 'legendary'
  };
  
  // Special spells are always at least rare
  const spellRarity = spell.tier ? rarityMap[spell.tier] : 'rare';
  
  return {
    id: `scroll_${spell.id}_${uuidv4().slice(0, 8)}`,
    name: `Scroll of ${spell.name}`,
    spell: spell,
    rarity: spellRarity,
    description: `A magical scroll containing the ${spell.name} spell. Use in your wizard's study to learn the spell permanently, or in battle for a one-time casting without mana cost.`,
    isConsumable: true,
    imagePath: `/images/scrolls/${spell.element}_scroll.png` // Assuming these images exist or will be created
  };
}

/**
 * Generates a random spell scroll appropriate for the player's level
 * @param playerLevel The current level of the player
 * @returns A randomly generated spell scroll
 */
export function generateRandomSpellScroll(playerLevel: number): SpellScroll {
  // Determine max tier based on player level
  const maxTier = Math.min(Math.ceil(playerLevel / 3), 10);
  
  // Small chance to get a special spell (5%)
  const isSpecialSpell = Math.random() < 0.05;
  
  let spell: Spell;
  
  if (isSpecialSpell) {
    // Get a random special spell
    const specialSpells = getAllSpecialSpells();
    spell = specialSpells[Math.floor(Math.random() * specialSpells.length)];
  } else {
    // Get a random tier up to the max tier
    const tier = Math.max(1, Math.ceil(Math.random() * maxTier));
    
    // Get spells for that tier
    const spellsForTier = getSpellsByTier(tier);
    
    // Select a random spell from that tier
    spell = spellsForTier[Math.floor(Math.random() * spellsForTier.length)];
  }
  
  return createSpellScroll(spell);
}

/**
 * Generates a list of spell scrolls for market inventory
 * @param count Number of scrolls to generate
 * @param level The market/player level to use for generating appropriate scrolls
 * @returns Array of spell scrolls
 */
export function generateScrollsForMarket(count: number, level: number): SpellScroll[] {
  const scrolls: SpellScroll[] = [];
  
  for (let i = 0; i < count; i++) {
    scrolls.push(generateRandomSpellScroll(level));
  }
  
  return scrolls;
}

/**
 * Determines if a player already knows the spell contained in a scroll
 * @param wizard The player wizard
 * @param scroll The spell scroll
 * @returns True if the wizard already knows the spell, false otherwise
 */
export function wizardKnowsScrollSpell(wizard: Wizard, scroll: SpellScroll): boolean {
  return wizard.spells.some(spell => spell.id === scroll.spell.id);
}

/**
 * Consumes a spell scroll to learn its spell permanently
 * @param wizard The player wizard
 * @param scrollId The ID of the scroll to consume
 * @returns Object containing success status and updated wizard
 */
export function consumeScrollToLearnSpell(wizard: Wizard, scrollId: string): { 
  success: boolean; 
  message: string; 
  updatedWizard?: Wizard;
  learnedSpell?: Spell;
} {
  // Find the scroll in the inventory (assuming scrolls will be added to wizard.inventory)
  // For now, we'll check if this is properly implemented when we add scrolls to the wizard inventory
  const scrollIndex = wizard.inventory?.findIndex(item => 
    'spell' in item && item.id === scrollId
  );
  
  if (scrollIndex === undefined || scrollIndex === -1) {
    return {
      success: false,
      message: "Scroll not found in inventory."
    };
  }
  
  // Get the scroll
  const scroll = wizard.inventory[scrollIndex] as unknown as SpellScroll;
  
  // Check if the wizard already knows this spell
  if (wizardKnowsScrollSpell(wizard, scroll)) {
    return {
      success: false,
      message: "You already know this spell."
    };
  }
  
  // Add the spell to the wizard's spells
  const updatedSpells = [...wizard.spells, scroll.spell];
  
  // Remove the scroll from inventory
  const updatedInventory = [...wizard.inventory];
  updatedInventory.splice(scrollIndex, 1);
  
  // Return updated wizard
  const updatedWizard: Wizard = {
    ...wizard,
    spells: updatedSpells,
    inventory: updatedInventory
  };
  
  return {
    success: true,
    message: `You have learned the ${scroll.spell.name} spell!`,
    updatedWizard,
    learnedSpell: scroll.spell
  };
}

/**
 * Gets base price for a spell scroll based on its rarity
 * @param rarity The rarity of the spell scroll
 * @returns Base price for the scroll
 */
export function getScrollBasePrice(rarity: IngredientRarity): number {
  const basePrices: Record<IngredientRarity, number> = {
    common: 50,
    uncommon: 150,
    rare: 500,
    epic: 1500,
    legendary: 5000
  };
  
  return basePrices[rarity];
} 