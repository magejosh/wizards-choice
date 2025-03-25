// src/lib/features/loot/lootSystem.ts
import { Wizard, Spell, Equipment } from '../../types';
import { getAllSpells, getSpellsByTier } from '../../spells/spellData';
import { getRandomEquipment } from '../../equipment/equipmentData';

/**
 * Represents a loot drop from defeating an enemy
 */
export interface LootDrop {
  spells: Spell[];
  equipment: Equipment[];
  experience: number;
}

/**
 * Generates loot after defeating an enemy
 * @param playerWizard The player's wizard
 * @param enemyWizard The defeated enemy wizard
 * @param isWizardEnemy Whether the enemy was a wizard (true) or a magical creature (false)
 * @param difficulty The game difficulty
 * @returns The generated loot
 */
export function generateLoot(
  playerWizard: Wizard,
  enemyWizard: Wizard,
  isWizardEnemy: boolean,
  difficulty: 'easy' | 'normal' | 'hard'
): LootDrop {
  // Calculate experience based on enemy level and difficulty
  const experienceMultiplier = difficulty === 'easy' ? 10 : difficulty === 'normal' ? 1 : 0.1;
  const experience = Math.floor(enemyWizard.level * 10 * experienceMultiplier);
  
  // Generate spell loot
  const spells = generateSpellLoot(playerWizard, enemyWizard, isWizardEnemy, difficulty);
  
  // Generate equipment loot
  const equipment = generateEquipmentLoot(playerWizard, enemyWizard, isWizardEnemy, difficulty);
  
  return {
    spells,
    equipment,
    experience
  };
}

/**
 * Generates spell loot after defeating an enemy
 * @param playerWizard The player's wizard
 * @param enemyWizard The defeated enemy wizard
 * @param isWizardEnemy Whether the enemy was a wizard (true) or a magical creature (false)
 * @param difficulty The game difficulty
 * @returns Array of spell loot
 */
function generateSpellLoot(
  playerWizard: Wizard,
  enemyWizard: Wizard,
  isWizardEnemy: boolean,
  difficulty: 'easy' | 'normal' | 'hard'
): Spell[] {
  const lootSpells: Spell[] = [];
  
  // Determine number of spells to drop
  let spellDropCount = 0;
  
  if (isWizardEnemy) {
    // Wizards have higher chance to drop spells
    switch (difficulty) {
      case 'easy':
        spellDropCount = Math.floor(Math.random() * 2) + 1; // 1-2 spells
        break;
      case 'normal':
        spellDropCount = Math.random() < 0.7 ? 1 : 0; // 70% chance for 1 spell
        break;
      case 'hard':
        spellDropCount = Math.random() < 0.4 ? 1 : 0; // 40% chance for 1 spell
        break;
    }
    
    // Chance to get one of the enemy's spells
    if (spellDropCount > 0 && enemyWizard.equippedSpells.length > 0) {
      const randomEnemySpell = enemyWizard.equippedSpells[
        Math.floor(Math.random() * enemyWizard.equippedSpells.length)
      ];
      
      // Check if player already has this spell
      if (!playerWizard.spells.some(spell => spell.id === randomEnemySpell.id)) {
        lootSpells.push(randomEnemySpell);
        spellDropCount--;
      }
    }
  } else {
    // Magical creatures have lower chance to drop spells
    switch (difficulty) {
      case 'easy':
        spellDropCount = Math.random() < 0.7 ? 1 : 0; // 70% chance for 1 spell
        break;
      case 'normal':
        spellDropCount = Math.random() < 0.4 ? 1 : 0; // 40% chance for 1 spell
        break;
      case 'hard':
        spellDropCount = Math.random() < 0.2 ? 1 : 0; // 20% chance for 1 spell
        break;
    }
  }
  
  // Add random spells from appropriate tiers
  if (spellDropCount > 0) {
    // Determine max spell tier based on enemy level
    const maxTier = Math.min(Math.ceil(enemyWizard.level / 3), 10);
    
    // Get spells from appropriate tiers
    let availableSpells: Spell[] = [];
    for (let tier = 1; tier <= maxTier; tier++) {
      availableSpells = [...availableSpells, ...getSpellsByTier(tier)];
    }
    
    // Filter out spells the player already has
    availableSpells = availableSpells.filter(spell => 
      !playerWizard.spells.some(playerSpell => playerSpell.id === spell.id)
    );
    
    // Randomly select spells
    for (let i = 0; i < spellDropCount; i++) {
      if (availableSpells.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableSpells.length);
        lootSpells.push(availableSpells[randomIndex]);
        availableSpells.splice(randomIndex, 1);
      }
    }
  }
  
  return lootSpells;
}

/**
 * Generates equipment loot after defeating an enemy
 * @param playerWizard The player's wizard
 * @param enemyWizard The defeated enemy wizard
 * @param isWizardEnemy Whether the enemy was a wizard (true) or a magical creature (false)
 * @param difficulty The game difficulty
 * @returns Array of equipment loot
 */
function generateEquipmentLoot(
  playerWizard: Wizard,
  enemyWizard: Wizard,
  isWizardEnemy: boolean,
  difficulty: 'easy' | 'normal' | 'hard'
): Equipment[] {
  const lootEquipment: Equipment[] = [];
  
  // Determine chance to drop equipment
  let equipmentDropChance = 0;
  
  if (isWizardEnemy) {
    // Wizards have lower chance to drop equipment
    switch (difficulty) {
      case 'easy':
        equipmentDropChance = 0.5; // 50% chance
        break;
      case 'normal':
        equipmentDropChance = 0.3; // 30% chance
        break;
      case 'hard':
        equipmentDropChance = 0.15; // 15% chance
        break;
    }
  } else {
    // Magical creatures have higher chance to drop equipment
    switch (difficulty) {
      case 'easy':
        equipmentDropChance = 0.8; // 80% chance
        break;
      case 'normal':
        equipmentDropChance = 0.5; // 50% chance
        break;
      case 'hard':
        equipmentDropChance = 0.3; // 30% chance
        break;
    }
  }
  
  // Roll for equipment drop
  if (Math.random() < equipmentDropChance) {
    // Chance to get one of the enemy's equipment
    if (isWizardEnemy) {
      const enemyEquipment = Object.values(enemyWizard.equipment).filter(item => item !== undefined);
      
      if (enemyEquipment.length > 0) {
        const randomEnemyEquipment = enemyEquipment[
          Math.floor(Math.random() * enemyEquipment.length)
        ];
        
        lootEquipment.push(randomEnemyEquipment as Equipment);
      }
    } else {
      // Generate random equipment based on enemy level
      lootEquipment.push(getRandomEquipment(enemyWizard.level));
    }
  }
  
  return lootEquipment;
}

/**
 * Applies loot to the player's wizard
 * @param playerWizard The player's wizard
 * @param loot The loot to apply
 * @returns Updated player wizard
 */
export function applyLoot(playerWizard: Wizard, loot: LootDrop): Wizard {
  const updatedWizard = { ...playerWizard };
  
  // Add experience
  updatedWizard.experience += loot.experience;
  
  // Check for level up
  while (updatedWizard.experience >= updatedWizard.experienceToNextLevel) {
    updatedWizard.experience -= updatedWizard.experienceToNextLevel;
    updatedWizard.level += 1;
    
    // Calculate new experience required for next level
    updatedWizard.experienceToNextLevel = updatedWizard.level * 100;
    
    // Award level up points based on difficulty
    // This would normally come from game settings, using normal as default
    updatedWizard.levelUpPoints += 2;
  }
  
  // Add spells
  loot.spells.forEach(spell => {
    if (!updatedWizard.spells.some(s => s.id === spell.id)) {
      updatedWizard.spells.push(spell);
    }
  });
  
  // Add equipment to inventory (in a real implementation, we would have an inventory system)
  // For now, we'll just log that the equipment was obtained
  
  return updatedWizard;
}
