// src/lib/ui/placeholder.ts
// This file creates a placeholder image for spell cards

/**
 * Creates a data URL for a placeholder image
 * @param text Text to display on the placeholder
 * @param width Width of the placeholder image
 * @param height Height of the placeholder image
 * @returns Data URL for the placeholder image
 */
export function createPlaceholderImage(text: string = 'Spell Image', width: number = 200, height: number = 300): string {
  // This function would normally create a canvas and draw on it
  // For simplicity, we'll just return a placeholder URL
  return `/images/spells/default-placeholder.jpg`;
}
