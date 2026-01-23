// Validation utilities for editable character fields

/**
 * Tier validation: must be between 1-6 (Numenera rules)
 */
export function validateTier(value: string | number): number {
  const numValue = typeof value === "string" ? parseInt(value, 10) : value;

  // Handle invalid numbers
  if (isNaN(numValue)) {
    return 1; // Default to minimum
  }

  // Constrain to valid range
  if (numValue < 1) return 1;
  if (numValue > 6) return 6;

  return numValue;
}

/**
 * Name validation: must not be empty, max 50 characters
 */
export function validateName(value: string): { valid: boolean; error?: string } {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Name cannot be empty" };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: "Name must be 50 characters or less" };
  }

  return { valid: true };
}

/**
 * Descriptor validation: must not be empty, max 30 characters
 */
export function validateDescriptor(value: string): { valid: boolean; error?: string } {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Descriptor cannot be empty" };
  }

  if (trimmed.length > 30) {
    return { valid: false, error: "Descriptor must be 30 characters or less" };
  }

  return { valid: true };
}

/**
 * Focus validation: must not be empty, max 50 characters
 */
export function validateFocus(value: string): { valid: boolean; error?: string } {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: "Focus cannot be empty" };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: "Focus must be 50 characters or less" };
  }

  return { valid: true };
}
