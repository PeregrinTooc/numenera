// File storage utilities for character import/export
// Uses File System Access API for Chromium browsers, falls back to input element for others
/* global Event */

import { Character } from "../types/character.js";
import { SCHEMA_VERSION } from "./storageConstants.js";
import { validateCharacter } from "../utils/characterValidation.js";

/**
 * File format structure for exported characters
 */
export interface CharacterFileData {
  version: string;
  schemaVersion: number;
  exportDate: string;
  character: Character;
}

/**
 * Parse and validate character data from file content
 * @param text - Raw text content from file
 * @returns Validated character object
 * @throws Error if file is invalid or character data is corrupted
 */
function parseAndValidateCharacter(text: string): Character {
  // Parse JSON
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON in file");
  }

  // Validate file structure
  if (!data.character) {
    throw new Error("File does not contain character data");
  }

  // Check schema version
  if (data.schemaVersion !== undefined && data.schemaVersion !== SCHEMA_VERSION) {
    throw new Error(
      `Incompatible schema version: file has version ${data.schemaVersion}, but current version is ${SCHEMA_VERSION}`
    );
  }

  // Validate character data
  const validation = validateCharacter(data.character);
  if (!validation.valid) {
    throw new Error(`Invalid character data: ${validation.errors.join(", ")}`);
  }

  return validation.character;
}

/**
 * Import using File System Access API (Chrome/Edge/Opera)
 * @returns The imported character, or null if user cancels
 * @throws Error if file is invalid or character data is corrupted
 */
async function importWithFileSystemAPI(): Promise<Character | null> {
  try {
    // Open file picker
    const [fileHandle] = await (window as any).showOpenFilePicker({
      types: [
        {
          description: "Numenera Character Files",
          accept: {
            "application/json": [".numenera"],
          },
        },
      ],
      multiple: false,
    });

    // Read file contents
    const file = await fileHandle.getFile();
    const text = await file.text();

    return parseAndValidateCharacter(text);
  } catch (error: any) {
    // User cancelled the file picker
    if (error.name === "AbortError") {
      return null;
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Import using <input type="file"> element (Safari/Firefox fallback)
 * @returns The imported character, or null if user cancels
 * @throws Error if file is invalid or character data is corrupted
 */
async function importWithInputElement(): Promise<Character | null> {
  return new Promise((resolve, reject) => {
    // Create hidden input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".numenera";
    input.style.display = "none";

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];

      // Clean up
      document.body.removeChild(input);

      if (!file) {
        resolve(null); // No file selected
        return;
      }

      try {
        const text = await file.text();
        const character = parseAndValidateCharacter(text);
        resolve(character);
      } catch (error) {
        reject(error);
      }
    };

    input.oncancel = () => {
      document.body.removeChild(input);
      resolve(null);
    };

    // Add to DOM and trigger
    document.body.appendChild(input);
    input.click();
  });
}

/**
 * Import a character from a JSON file
 * Uses File System Access API for Chromium browsers, falls back to input element for others
 * @returns The imported character, or null if user cancels
 * @throws Error if file is invalid or character data is corrupted
 */
export async function importCharacterFromFile(): Promise<Character | null> {
  // Try modern API first (Chrome/Edge/Opera)
  if ("showOpenFilePicker" in window) {
    return await importWithFileSystemAPI();
  } else {
    // Fallback for Safari/Firefox
    return await importWithInputElement();
  }
}
