/**
 * Utility functions for parsing bulk import text
 */

export interface BulkImportItem {
  quantity: number;
  cardName: string;
}

/**
 * Parses bulk import text into an array of items
 * Supports formats like:
 * - "2x Lightning Bolt"
 * - "2 Lightning Bolt"
 * - "Lightning Bolt" (defaults to quantity 1)
 */
export function parseBulkImportText(text: string): BulkImportItem[] {
  const lines = text.split("\n").filter((line) => line.trim());

  return lines.map((line) => {
    // Parse format: "2x Lightning Bolt" or "2 Lightning Bolt"
    const match = line.match(/^(\d+)(?:x)?\s+(.+)$/);
    if (match) {
      return {
        quantity: parseInt(match[1]),
        cardName: match[2].trim(),
      };
    }
    return {
      quantity: 1,
      cardName: line.trim(),
    };
  });
}

/**
 * Validates bulk import text format
 */
export function validateBulkImportText(text: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!text.trim()) {
    errors.push("Import text cannot be empty");
    return { isValid: false, errors };
  }

  const lines = text.split("\n").filter((line) => line.trim());

  if (lines.length === 0) {
    errors.push("No valid lines found");
    return { isValid: false, errors };
  }

  // Check for invalid formats
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    // Check if line starts with a number but has invalid format
    const numberMatch = trimmedLine.match(/^(\d+)/);
    if (numberMatch && !trimmedLine.match(/^\d+(?:x)?\s+.+/)) {
      errors.push(
        `Line ${index + 1}: Invalid format. Use "2x Card Name" or "2 Card Name"`
      );
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}
