// src/lib/features/deckBuilder.ts
import { Wizard, Spell } from '../types';

/**
 * Interface for the deck builder functionality
 */
export interface DeckBuilderInterface {
  /**
   * Get all available spells for the wizard
   * @param wizard The wizard to get spells for
   * @returns Array of available spells
   */
  getAvailableSpells: (wizard: Wizard) => Spell[];
  
  /**
   * Get currently equipped spells
   * @param wizard The wizard to get equipped spells for
   * @returns Array of equipped spells
   */
  getEquippedSpells: (wizard: Wizard) => Spell[];
  
  /**
   * Equip a spell in a specific slot
   * @param wizard The wizard to equip the spell for
   * @param spellId The ID of the spell to equip
   * @param slotIndex The index of the slot to equip the spell in (0-2)
   * @returns Updated wizard with the spell equipped
   */
  equipSpell: (wizard: Wizard, spellId: string, slotIndex: number) => Wizard;
  
  /**
   * Unequip a spell from a specific slot
   * @param wizard The wizard to unequip the spell for
   * @param slotIndex The index of the slot to unequip the spell from (0-2)
   * @returns Updated wizard with the spell unequipped
   */
  unequipSpell: (wizard: Wizard, slotIndex: number) => Wizard;
  
  /**
   * Filter spells by various criteria
   * @param spells The spells to filter
   * @param filters The filters to apply
   * @returns Filtered spells
   */
  filterSpells: (spells: Spell[], filters: SpellFilters) => Spell[];
  
  /**
   * Sort spells by various criteria
   * @param spells The spells to sort
   * @param sortBy The criteria to sort by
   * @param sortDirection The direction to sort in
   * @returns Sorted spells
   */
  sortSpells: (spells: Spell[], sortBy: SpellSortCriteria, sortDirection: 'asc' | 'desc') => Spell[];
}

/**
 * Interface for spell filters
 */
export interface SpellFilters {
  type?: string[];
  element?: string[];
  tier?: number[];
  manaCostMin?: number;
  manaCostMax?: number;
  searchText?: string;
}

/**
 * Type for spell sort criteria
 */
export type SpellSortCriteria = 'name' | 'type' | 'element' | 'tier' | 'manaCost';

/**
 * Implementation of the deck builder functionality
 */
export const DeckBuilder: DeckBuilderInterface = {
  getAvailableSpells: (wizard: Wizard): Spell[] => {
    return wizard.spells;
  },
  
  getEquippedSpells: (wizard: Wizard): Spell[] => {
    return wizard.equippedSpells;
  },
  
  equipSpell: (wizard: Wizard, spellId: string, slotIndex: number): Wizard => {
    // Find the spell to equip
    const spellToEquip = wizard.spells.find(spell => spell.id === spellId);
    
    if (!spellToEquip) {
      return wizard; // Spell not found
    }
    
    // Create a copy of the equipped spells
    const equippedSpells = [...wizard.equippedSpells];
    
    // Check if the slot is valid
    if (slotIndex < 0 || slotIndex > 2) {
      return wizard; // Invalid slot
    }
    
    // If the slot is already occupied, replace the spell
    if (slotIndex < equippedSpells.length) {
      equippedSpells[slotIndex] = spellToEquip;
    } else {
      // Otherwise, add the spell to the end
      equippedSpells.push(spellToEquip);
    }
    
    // Return updated wizard
    return {
      ...wizard,
      equippedSpells,
    };
  },
  
  unequipSpell: (wizard: Wizard, slotIndex: number): Wizard => {
    // Check if the slot is valid
    if (slotIndex < 0 || slotIndex >= wizard.equippedSpells.length) {
      return wizard; // Invalid slot
    }
    
    // Create a copy of the equipped spells and remove the spell at the specified index
    const equippedSpells = [...wizard.equippedSpells];
    equippedSpells.splice(slotIndex, 1);
    
    // Return updated wizard
    return {
      ...wizard,
      equippedSpells,
    };
  },
  
  filterSpells: (spells: Spell[], filters: SpellFilters): Spell[] => {
    return spells.filter(spell => {
      // Filter by type
      if (filters.type && filters.type.length > 0 && !filters.type.includes(spell.type)) {
        return false;
      }
      
      // Filter by element
      if (filters.element && filters.element.length > 0 && !filters.element.includes(spell.element)) {
        return false;
      }
      
      // Filter by tier
      if (filters.tier && filters.tier.length > 0 && !filters.tier.includes(spell.tier)) {
        return false;
      }
      
      // Filter by mana cost (minimum)
      if (filters.manaCostMin !== undefined && spell.manaCost < filters.manaCostMin) {
        return false;
      }
      
      // Filter by mana cost (maximum)
      if (filters.manaCostMax !== undefined && spell.manaCost > filters.manaCostMax) {
        return false;
      }
      
      // Filter by search text
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const nameMatch = spell.name.toLowerCase().includes(searchLower);
        const descriptionMatch = spell.description.toLowerCase().includes(searchLower);
        
        if (!nameMatch && !descriptionMatch) {
          return false;
        }
      }
      
      return true;
    });
  },
  
  sortSpells: (spells: Spell[], sortBy: SpellSortCriteria, sortDirection: 'asc' | 'desc'): Spell[] => {
    const sortedSpells = [...spells];
    
    sortedSpells.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'element':
          comparison = a.element.localeCompare(b.element);
          break;
        case 'tier':
          comparison = a.tier - b.tier;
          break;
        case 'manaCost':
          comparison = a.manaCost - b.manaCost;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sortedSpells;
  },
};

export default DeckBuilder;
