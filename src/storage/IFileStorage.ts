/**
 * Interface for file storage operations (import/export)
 *
 * This interface abstracts the file picker boundary, allowing tests
 * to inject mock implementations while production code uses the real
 * File System Access API.
 */

import { Character } from "../types/character.js";

/**
 * Result of importing a character file
 */
export interface ImportResult {
  character: Character;
  warnings: string[];
}

/**
 * Interface for file import operations
 * Implementations can use File System Access API, input elements, or mocks
 */
export interface IFileImporter {
  /**
   * Import a character from a file
   * @returns Import result with character and warnings, or null if user cancels
   * @throws Error for invalid JSON or missing character data
   */
  importCharacter(): Promise<ImportResult | null>;
}

/**
 * Interface for file export operations
 * Implementations can use File System Access API, blob downloads, or mocks
 */
export interface IFileExporter {
  /**
   * Export a character to a file (first-time or fallback)
   * @param character - Character to export
   */
  export(character: Character): Promise<void>;

  /**
   * Quick export to remembered location (Chromium only)
   * @param character - Character to export
   */
  quickExport(character: Character): Promise<void>;

  /**
   * Save to new location (Save As dialog)
   * @param character - Character to export
   */
  saveAs(character: Character): Promise<void>;

  /**
   * Check if File System Access API is supported
   */
  supportsFileSystemAccess(): boolean;

  /**
   * Check if a file location is remembered
   */
  hasRememberedLocation(): boolean;

  /**
   * Clear the remembered file location
   */
  clearRememberedLocation(): void;
}
