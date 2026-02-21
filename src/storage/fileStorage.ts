// File storage utilities for character import/export
// Uses File System Access API for Chromium browsers, falls back to input element for others

import { Character } from "../types/character.js";
import { SCHEMA_VERSION } from "./storageConstants.js";
import { sanitizeCharacter } from "../utils/unified-validation.js";

/**
 * File format structure for exported characters
 */
export interface CharacterFileData {
  version: string;
  schemaVersion: string;
  exportDate: string;
  character: Character;
}

/**
 * Result of importing a character file
 */
export interface ImportResult {
  character: Character;
  warnings: string[];
}

/**
 * Parse and sanitize character data from file content.
 * Uses lenient approach: sanitizes invalid data instead of rejecting it.
 *
 * @param text - Raw text content from file
 * @returns Sanitized character with any warnings
 * @throws Error only for completely invalid JSON or missing character data
 */
function parseAndSanitizeCharacter(text: string): ImportResult {
  const warnings: string[] = [];

  // Parse JSON
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON in file");
  }

  // Check if data is an object
  if (data === null || typeof data !== "object") {
    throw new Error("File does not contain valid data");
  }

  const fileData = data as Record<string, unknown>;

  // Validate file structure - must have character field
  if (!fileData.character) {
    throw new Error("File does not contain character data");
  }

  // Check schema version - warn but don't reject
  if (fileData.schemaVersion !== undefined && fileData.schemaVersion !== SCHEMA_VERSION) {
    warnings.push(
      `File has different schema version (${fileData.schemaVersion}), current version is ${SCHEMA_VERSION}. Data may have been adjusted.`
    );
  }

  // Sanitize character data - fix invalid fields instead of rejecting
  const sanitizeResult = sanitizeCharacter(fileData.character);

  // Combine warnings
  const allWarnings = [...warnings, ...sanitizeResult.warnings];

  return {
    character: sanitizeResult.character,
    warnings: allWarnings,
  };
}

/**
 * Import using File System Access API (Chrome/Edge/Opera)
 * @returns Import result with character and warnings, or null if user cancels
 * @throws Error only for invalid JSON or missing character data
 */
async function importWithFileSystemAPI(): Promise<ImportResult | null> {
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

    return parseAndSanitizeCharacter(text);
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
 * @returns Import result with character and warnings, or null if user cancels
 * @throws Error only for invalid JSON or missing character data
 */
async function importWithInputElement(): Promise<ImportResult | null> {
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
        const result = parseAndSanitizeCharacter(text);
        resolve(result);
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
 * Import a character from a JSON file.
 * Uses lenient approach: sanitizes invalid data instead of rejecting it.
 * Uses File System Access API for Chromium browsers, falls back to input element for others.
 *
 * @returns Import result with character and warnings, or null if user cancels
 * @throws Error only for invalid JSON or missing character data
 */
export async function importCharacterFromFile(): Promise<ImportResult | null> {
  // Try modern API first (Chrome/Edge/Opera)
  if ("showOpenFilePicker" in window) {
    return await importWithFileSystemAPI();
  } else {
    // Fallback for Safari/Firefox
    return await importWithInputElement();
  }
}

/**
 * Sanitize character name for use as filename
 * @param name - Character name to sanitize
 * @returns Sanitized filename (without extension)
 */
function sanitizeFilename(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "character";

  return trimmed
    .toLowerCase()
    .replace(/\s+/g, "-") // spaces → hyphens
    .replace(/[^a-z0-9-_]/g, "") // remove special chars
    .replace(/-+/g, "-") // collapse multiple hyphens
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}

/**
 * Export using File System Access API (Chrome/Edge/Opera)
 * @param character - Character to export
 * @param fileData - Complete file data structure
 */
async function exportWithFileSystemAPI(
  character: Character,
  fileData: CharacterFileData
): Promise<void> {
  const filename = sanitizeFilename(character.name) + ".numenera";

  try {
    // Open file save picker
    const fileHandle = await (window as any).showSaveFilePicker({
      suggestedName: filename,
      types: [
        {
          description: "Numenera Character Files",
          accept: {
            "application/json": [".numenera"],
          },
        },
      ],
    });

    // Write file contents
    const writable = await fileHandle.createWritable();
    await writable.write(JSON.stringify(fileData, null, 2));
    await writable.close();
  } catch (error: any) {
    // User cancelled the file picker
    if (error.name === "AbortError") {
      return;
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Export using blob download (Safari/Firefox fallback)
 * @param character - Character to export
 * @param fileData - Complete file data structure
 */
async function exportWithBlobDownload(
  character: Character,
  fileData: CharacterFileData
): Promise<void> {
  const filename = sanitizeFilename(character.name) + ".numenera";

  // Create blob with JSON data
  const blob = new Blob([JSON.stringify(fileData, null, 2)], {
    type: "application/json",
  });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export a character to a .numenera file
 * Uses File System Access API for Chromium browsers, falls back to blob download for others
 * @param character - Character to export
 */
export async function exportCharacterToFile(character: Character): Promise<void> {
  // Build file data structure
  const fileData: CharacterFileData = {
    version: "1.0",
    schemaVersion: SCHEMA_VERSION,
    exportDate: new Date().toISOString(),
    character: character,
  };

  // Try modern API first (Chrome/Edge/Opera)
  if ("showSaveFilePicker" in window) {
    await exportWithFileSystemAPI(character, fileData);
  } else {
    // Fallback for Safari/Firefox
    await exportWithBlobDownload(character, fileData);
  }
}
