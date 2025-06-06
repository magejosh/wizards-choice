import { CombatLogEntry } from '../types';

/**
 * Singleton manager for battle log entries
 * Ensures a single source of truth for all battle log operations
 */
class BattleLogManager {
  private static instance: BattleLogManager;
  private logEntries: CombatLogEntry[] = [];
  private lastEntryTimestamp: number = 0;
  private duplicateThresholdMs: number = 200; // Increased threshold to better catch duplicates
  private entryCounter: number = 0; // Counter to ensure unique ordering
  // We no longer need a sequence counter as we're using explicit sorting in getEntries
  private hasDuelBegunMessage: boolean = false; // Flag to track if we've added the initial message

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): BattleLogManager {
    if (!BattleLogManager.instance) {
      BattleLogManager.instance = new BattleLogManager();
    }
    return BattleLogManager.instance;
  }

  /**
   * Reset the log entries (typically at the start of a new battle)
   */
  public resetLog(): void {
    this.logEntries = [];
    this.lastEntryTimestamp = 0;
    this.entryCounter = 0;
    this.hasDuelBegunMessage = false;
    console.log('[Battle Log] Reset complete');
  }

  /**
   * Add a new entry to the battle log
   * @param entry The log entry to add (without timestamp)
   * @returns The complete log entry with timestamp
   */
  public addEntry(entry: Omit<CombatLogEntry, 'timestamp'> & { timestamp?: number, sequence?: number }): CombatLogEntry {
    // Check if this is the "duel has begun" message
    const isDuelBegunMessage = entry.action === 'combat_start' &&
                              entry.details?.includes('The duel has begun');

    // Use provided timestamp or generate one
    let timestamp: number;
    if (entry.timestamp !== undefined) {
      // Use the provided timestamp
      timestamp = entry.timestamp;
    } else {
      // Generate a timestamp that's at least 1ms newer than the last one
      const now = Date.now();
      timestamp = Math.max(now, this.lastEntryTimestamp + 1);
    }

    // Add sequence number for additional ordering precision
    const sequence = entry.sequence !== undefined ? entry.sequence : this.entryCounter++;

    const logEntry: CombatLogEntry = {
      ...entry,
      timestamp,
      sequence
    };

    // Check for potential duplicates
    if (this.isDuplicate(logEntry)) {
      // console.log(`[Battle Log] Prevented duplicate entry: ${entry.actor} ${entry.action}: ${entry.details}`);
      return logEntry; // Return the entry but don't add it to the log
    }

    // Update state based on entry type
    if (isDuelBegunMessage) {
      this.hasDuelBegunMessage = true;
    }

    // Add to log - we'll sort when retrieving
    this.logEntries.push(logEntry);
    this.lastEntryTimestamp = timestamp;

    // Log to console for debugging
    // console.log(`[Battle Log] Added: ${entry.actor} ${entry.action}: ${entry.details} (timestamp: ${timestamp}, sequence: ${sequence})`);

    return logEntry;
  }

  /**
   * Get all log entries
   * @returns Array of log entries (newest first)
   */
  public getEntries(): CombatLogEntry[] {
    // Create a completely new array to avoid modifying the original
    const allEntries = [...this.logEntries];

    // Sort by timestamp first, then by sequence number if timestamps are equal
    const sortedEntries = allEntries.sort((a, b) => {
      if (b.timestamp === a.timestamp) {
        // If timestamps are equal, use sequence number
        return (b.sequence || 0) - (a.sequence || 0);
      }
      return b.timestamp - a.timestamp;
    });

    return sortedEntries;
  }

  /**
   * Set the log entries (used when initializing from existing state)
   * @param entries Array of log entries
   */
  public setEntries(entries: CombatLogEntry[]): void {
    if (!entries || entries.length === 0) {
      this.resetLog();
      return;
    }

    // Check if we already have the "duel has begun" message
    this.hasDuelBegunMessage = entries.some(entry =>
      entry.action === 'combat_start' && entry.details?.includes('The duel has begun')
    );

    // Simply store the entries as-is - we'll sort them when retrieving
    this.logEntries = [...entries];

    // Update last timestamp
    if (this.logEntries.length > 0) {
      const timestamps = this.logEntries.map(entry => entry.timestamp);
      this.lastEntryTimestamp = Math.max(...timestamps);
      this.entryCounter = this.logEntries.length;
    }

    console.log(`[Battle Log] Set ${this.logEntries.length} entries`);
  }

  /**
   * Check if an entry is likely a duplicate
   * @param entry The entry to check
   * @returns True if the entry is likely a duplicate
   */
  private isDuplicate(entry: CombatLogEntry): boolean {
    // If this is the first entry, it can't be a duplicate
    if (this.logEntries.length === 0) {
      return false;
    }

    // Special handling for "duel has begun" message
    if (entry.action === 'combat_start' && entry.details?.includes('The duel has begun')) {
      return this.hasDuelBegunMessage;
    }

    // Special handling for phase transition messages
    if (entry.details && entry.details.startsWith('Beginning the ')) {
      // For phase transitions, check if we already have this exact phase transition
      // in the current round and turn
      return this.logEntries.some(existingEntry =>
        existingEntry.round === entry.round &&
        existingEntry.turn === entry.turn &&
        existingEntry.details === entry.details
      );
    }

    // Special handling for initiative entries
    if (entry.action === 'initiative') {
      // If this is the generic "Rolling for initiative..." message
      if (entry.details === 'Rolling for initiative...') {
        // Prevent duplicate "Rolling for initiative..." messages
        return this.logEntries.some(existingEntry =>
          existingEntry.action === 'initiative' &&
          existingEntry.details === 'Rolling for initiative...'
        );
      }

      // If this is an initiative roll result (contains "rolled")
      if (entry.details && entry.details.includes('rolled')) {
        // Prevent duplicate initiative roll results for the same round
        return this.logEntries.some(existingEntry =>
          existingEntry.round === entry.round &&
          existingEntry.action === 'initiative' &&
          existingEntry.details && existingEntry.details.includes('rolled')
        );
      }

      // For any other initiative entries
      return this.logEntries.some(existingEntry =>
        existingEntry.round === entry.round &&
        existingEntry.turn === entry.turn &&
        existingEntry.action === 'initiative' &&
        existingEntry.details === entry.details
      );
    }

    // For other entries, check for duplicates with more specific matching
    return this.logEntries.some(existingEntry =>
      existingEntry.actor === entry.actor &&
      existingEntry.action === entry.action &&
      existingEntry.details === entry.details &&
      existingEntry.round === entry.round &&
      existingEntry.turn === entry.turn
    );
  }

  /**
   * Format a battle log entry for display
   * @param entry The log entry to format
   * @returns Formatted string
   */
  public formatEntry(entry: CombatLogEntry): string {
    const actorName = entry.actor === 'player'
      ? 'You'
      : entry.actor === 'enemy'
        ? 'Enemy'
        : 'System';

    return `[Turn ${entry.turn}] ${actorName}: ${entry.details}`;
  }

  /**
   * Debug function to print the current state of the battle log
   * This is useful for diagnosing ordering issues
   */
  public debugLog(): void {
    console.log('===== BATTLE LOG DEBUG =====');
    console.log(`Total entries: ${this.logEntries.length}`);
    console.log('Entries in display order (newest first):');

    const sortedEntries = this.getEntries();
    sortedEntries.forEach((entry, index) => {
      // Format timestamp as relative time (e.g., "now", "-1s", etc.)
      const now = Date.now();
      const timeDiff = Math.round((entry.timestamp - now) / 1000);
      const timeStr = timeDiff === 0 ? 'now' : `${timeDiff}s`;

      console.log(`${index}. [${entry.action}] ${entry.details || 'No details'} (time: ${timeStr}, raw: ${entry.timestamp})`);
    });

    // Also log the raw entries to see their original order
    console.log('\nRaw entries (in order of addition):');
    this.logEntries.forEach((entry, index) => {
      console.log(`${index}. [${entry.action}] ${entry.details || 'No details'} (timestamp: ${entry.timestamp})`);
    });

    console.log('===== END DEBUG =====');
  }
}

// Export the singleton instance
export const battleLogManager = BattleLogManager.getInstance();

/**
 * Helper function to create and add a log entry in one step
 * This is the recommended way to add entries to the battle log
 * @param entry The log entry to add (without timestamp, or with optional timestamp)
 * @returns The complete log entry with timestamp
 */
export function createLogEntry(entry: Omit<CombatLogEntry, 'timestamp'> & { timestamp?: number }): CombatLogEntry {
  return battleLogManager.addEntry(entry);
}
