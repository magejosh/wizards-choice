import { Spell, ElementType, SpellType } from '../../types';

export function generateSpell(element: ElementType, level: number): Spell {
  const baseValue = 15 + level * 2;
  const tier = Math.min(Math.ceil(level / 3), 10);
  const manaCost = 20 + level * 2;

  return {
    id: `spell_${element}_${Date.now()}`,
    name: `${element.charAt(0).toUpperCase() + element.slice(1)} Blast`,
    type: 'attack',
    element,
    tier,
    manaCost,
    description: `A powerful blast of ${element} energy.`,
    effects: [
      {
        type: 'damage',
        value: baseValue,
        target: 'enemy',
        element
      }
    ],
    imagePath: `/images/spells/${element}-blast.jpg`
  };
} 