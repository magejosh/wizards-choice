/**
 * Mock market data for testing MarketUI component
 */
import { MarketLocation, MarketItem, Ingredient, Potion, Equipment, IngredientRarity, IngredientCategory, SpellScroll, HandEquipment, PotionType, SpellType, ElementType, Spell, EquipmentSlot } from '../types';

export const mockIngredients: MarketItem<Ingredient>[] = [
  {
    item: {
      id: 'ing-001',
      name: 'Dragon Scale',
      description: 'A shimmering scale from a fire dragon.',
      rarity: 'rare' as IngredientRarity,
      category: 'catalyst' as IngredientCategory,
      properties: ['fire', 'protection']
    },
    quantity: 5,
    currentPrice: 150,
    supply: 'limited',
    demand: 'high',
    priceHistory: [140, 145, 150]
  },
  {
    item: {
      id: 'ing-002',
      name: 'Mandrake Root',
      description: 'A rare root that screams when pulled from the ground.',
      rarity: 'uncommon' as IngredientRarity,
      category: 'herb' as IngredientCategory,
      properties: ['healing', 'transformation']
    },
    quantity: 10,
    currentPrice: 95,
    supply: 'common',
    demand: 'moderate',
    priceHistory: [90, 95, 95]
  },
  {
    item: {
      id: 'ing-003',
      name: 'Troll Blood',
      description: 'Thick green blood from a mountain troll.',
      rarity: 'common' as IngredientRarity,
      category: 'essence' as IngredientCategory,
      properties: ['strength', 'endurance']
    },
    quantity: 20,
    currentPrice: 45,
    supply: 'abundant',
    demand: 'low',
    priceHistory: [50, 45, 45]
  }
];

// Mock spell for use in scrolls
const mockFireballSpell: Spell = {
  id: 'spell-001',
  name: 'Fireball',
  type: 'attack' as SpellType,
  element: 'fire' as ElementType,
  tier: 2,
  manaCost: 15,
  description: 'Launches a ball of fire at your enemy.',
  effects: [{
    type: 'damage',
    value: 20,
    target: 'enemy',
    element: 'fire' as ElementType
  }],
  imagePath: '/images/spells/fireball.png'
};

export const mockScrolls: MarketItem<SpellScroll>[] = [
  {
    item: {
      id: 'scroll-001',
      name: 'Fireball Scroll',
      type: 'scroll',
      rarity: 'uncommon',
      description: 'A scroll containing the fireball spell.',
      spell: mockFireballSpell,
      imagePath: '/images/scrolls/fireball_scroll.png'
    },
    quantity: 2,
    currentPrice: 300,
    supply: 'limited',
    demand: 'high',
    priceHistory: [280, 290, 300]
  }
];

export const mockPotions: MarketItem<Potion>[] = [
  {
    item: {
      id: 'pot-001',
      name: 'Healing Elixir',
      description: 'Restores health when consumed.',
      type: 'health' as PotionType,
      rarity: 'common',
      effect: {
        value: 50,
        duration: 1
      },
      imagePath: '/images/potions/healing_elixir.png'
    },
    quantity: 3,
    currentPrice: 240,
    supply: 'common',
    demand: 'high',
    priceHistory: [230, 235, 240]
  },
  {
    item: {
      id: 'pot-002',
      name: 'Invisibility Potion',
      description: 'Grants invisibility for a short period.',
      type: 'protection' as PotionType,
      rarity: 'rare',
      effect: {
        value: 30,
        duration: 3
      },
      imagePath: '/images/potions/invisibility_potion.png'
    },
    quantity: 2,
    currentPrice: 420,
    supply: 'rare',
    demand: 'extreme',
    priceHistory: [400, 410, 420]
  }
];

export const mockEquipment: MarketItem<Equipment>[] = [
  {
    item: {
      id: 'eq-001',
      name: 'Amulet of Protection',
      description: 'Protects the wearer from harmful spells.',
      slot: 'neck' as EquipmentSlot,
      rarity: 'rare',
      bonuses: [{
        stat: 'defense',
        value: 15
      }, {
        stat: 'maxHealth',
        value: 30
      }],
      unlocked: true,
      equipped: false
    },
    quantity: 1,
    currentPrice: 600,
    supply: 'rare',
    demand: 'high',
    priceHistory: [580, 590, 600]
  },
  {
    item: {
      id: 'eq-002',
      name: 'Staff of Elemental Fire',
      description: 'A staff that enhances fire magic.',
      slot: 'hand' as EquipmentSlot,
      type: 'staff' as HandEquipment,
      rarity: 'epic',
      bonuses: [{
        stat: 'spellPower',
        value: 25
      }, {
        stat: 'elementalAffinity',
        value: 40,
        element: 'fire'
      }],
      unlocked: true,
      equipped: false
    },
    quantity: 1,
    currentPrice: 950,
    supply: 'rare',
    demand: 'extreme',
    priceHistory: [900, 925, 950]
  }
];

export const mockMarkets: MarketLocation[] = [
  {
    id: 'market-001',
    name: 'Wizard Tower Market',
    description: 'A small market within the Wizard Tower.',
    unlockLevel: 1,
    reputationLevel: 0,
    inventoryRefreshDays: 3,
    lastRefreshed: new Date().toISOString(),
    priceMultiplier: 1.0,
    prices: {},
    inventory: {
      ingredients: mockIngredients.slice(0, 2),
      potions: mockPotions.slice(0, 1),
      equipment: [],
      scrolls: []
    }
  },
  {
    id: 'market-002',
    name: 'Mystic Village Bazaar',
    description: 'A bustling market in a village known for magical items.',
    unlockLevel: 3,
    reputationLevel: 0,
    inventoryRefreshDays: 3,
    lastRefreshed: new Date().toISOString(),
    priceMultiplier: 1.0,
    prices: {},
    inventory: {
      ingredients: mockIngredients,
      potions: mockPotions,
      equipment: mockEquipment.slice(0, 1),
      scrolls: []
    }
  },
  {
    id: 'market-003',
    name: 'Arcane Metropolis Exchange',
    description: 'The largest magical market in the realm with rare items.',
    unlockLevel: 5,
    reputationLevel: 0,
    inventoryRefreshDays: 3,
    lastRefreshed: new Date().toISOString(),
    priceMultiplier: 1.0,
    prices: {},
    inventory: {
      ingredients: mockIngredients,
      potions: mockPotions,
      equipment: mockEquipment,
      scrolls: mockScrolls
    }
  }
];

export const getMockMarkets = (): MarketLocation[] => {
  return JSON.parse(JSON.stringify(mockMarkets));
};

export const getMockMarketById = (id: string): MarketLocation | undefined => {
  return JSON.parse(JSON.stringify(
    mockMarkets.find(market => market.id === id)
  ));
};

export default {
  mockIngredients,
  mockPotions,
  mockEquipment,
  mockScrolls,
  mockMarkets,
  getMockMarkets,
  getMockMarketById
}; 