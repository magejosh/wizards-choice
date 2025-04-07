import { CombatLogEntry } from '../types';
import { battleLogManager } from './battleLogManager';

/**
 * Add a new entry to the battle log
 * @param entry The log entry to add
 */
export function addLogEntry(entry: Omit<CombatLogEntry, 'timestamp'>): CombatLogEntry {
  // Use the centralized battle log manager
  return battleLogManager.addEntry(entry);
}

/**
 * Format a battle log entry for display
 * @param entry The log entry to format
 * @returns Formatted string
 */
export function formatLogEntry(entry: CombatLogEntry): string {
  // Use the centralized battle log manager
  return battleLogManager.formatEntry(entry);
}