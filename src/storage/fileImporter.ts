/**
 * Real file importer implementation
 *
 * Uses File System Access API for Chromium browsers,
 * falls back to input element for Safari/Firefox.
 */

import { IFileImporter, ImportResult } from "./IFileStorage.js";
import { importCharacterFromFile } from "./fileStorage.js";

/**
 * Production implementation of IFileImporter
 * Wraps the existing importCharacterFromFile function
 */
export class RealFileImporter implements IFileImporter {
  async importCharacter(): Promise<ImportResult | null> {
    return await importCharacterFromFile();
  }
}

/**
 * Singleton instance for production use
 */
let fileImporter: IFileImporter = new RealFileImporter();

/**
 * Get the current file importer instance
 * Tests can replace this with a mock via setFileImporter
 */
export function getFileImporter(): IFileImporter {
  return fileImporter;
}

/**
 * Set a custom file importer (for testing)
 * @param importer - The file importer to use
 */
export function setFileImporter(importer: IFileImporter): void {
  fileImporter = importer;
}

/**
 * Reset to the default real file importer
 */
export function resetFileImporter(): void {
  fileImporter = new RealFileImporter();
}
