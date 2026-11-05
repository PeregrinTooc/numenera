// Uses File System Access API for Chromium browsers, falls back to input element for others

import { Character } from "@/types/character";
import { Layout, isValidLayout } from "@/types/layout";
import { SectionColumns, isValidSectionColumns } from "@/types/sectionColumns";
import { SCHEMA_VERSION } from "./storageConstants.js";
import { sanitizeCharacter } from "@/utils/characterSanitizer";
import { loadLayout } from "./layoutStorage.js";
import { t } from "@/i18n/index";
import { UserFacingError } from "@/utils/UserFacingError";

export interface CharacterFileData {
  version: string;
  schemaVersion: string;
  exportDate: string;
  character: Character;
  layout?: Layout;
  sectionColumns?: SectionColumns;
}

export interface ImportResult {
  character: Character;
  warnings: string[];
  layout?: Layout;
  hasLayoutDifference?: boolean;
  sectionColumns?: SectionColumns;
}

/** Parse the file text into the top-level file object that carries the character. */
function parseFileJson(text: string): Record<string, unknown> {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw new UserFacingError("errors.invalidJson", { cause: error });
  }

  if (data === null || typeof data !== "object") {
    throw new UserFacingError("errors.invalidData");
  }

  const fileData = data as Record<string, unknown>;
  if (!fileData.character) {
    throw new UserFacingError("errors.noCharacterData");
  }
  return fileData;
}

/** Warn about a schema mismatch but don't reject the file. */
function checkSchemaVersion(fileData: Record<string, unknown>, warnings: string[]): void {
  if (fileData.schemaVersion !== undefined && fileData.schemaVersion !== SCHEMA_VERSION) {
    warnings.push(
      t("fileOperations.schemaMismatch", {
        fileVersion: String(fileData.schemaVersion),
        currentVersion: SCHEMA_VERSION,
      })
    );
  }
}

/** The file's layout, if present and valid, and whether it differs from the current layout. */
function importLayout(
  fileData: Record<string, unknown>,
  warnings: string[]
): { layout?: Layout; hasLayoutDifference: boolean } {
  if (!fileData.layout || !Array.isArray(fileData.layout)) {
    return { hasLayoutDifference: false };
  }
  if (!isValidLayout(fileData.layout)) {
    warnings.push(t("fileOperations.invalidLayout"));
    return { hasLayoutDifference: false };
  }
  const layout = fileData.layout;
  return {
    layout,
    hasLayoutDifference: JSON.stringify(layout) !== JSON.stringify(loadLayout()),
  };
}

/** The file's column choices, if present and valid. */
function importSectionColumns(
  fileData: Record<string, unknown>,
  warnings: string[]
): SectionColumns | undefined {
  if (fileData.sectionColumns === undefined) return undefined;
  if (!isValidSectionColumns(fileData.sectionColumns)) {
    warnings.push(t("fileOperations.invalidLayout"));
    return undefined;
  }
  return fileData.sectionColumns;
}

/**
 * @throws Error only for completely invalid JSON or missing character data
 */
function parseAndSanitizeCharacter(text: string): ImportResult {
  const fileData = parseFileJson(text);

  const schemaWarnings: string[] = [];
  checkSchemaVersion(fileData, schemaWarnings);

  const sanitizeResult = sanitizeCharacter(fileData.character);

  const warnings = [...schemaWarnings, ...sanitizeResult.warnings];
  const { layout, hasLayoutDifference } = importLayout(fileData, warnings);
  const sectionColumns = importSectionColumns(fileData, warnings);

  return {
    character: sanitizeResult.character,
    warnings,
    layout,
    hasLayoutDifference,
    sectionColumns,
  };
}

/**
 * @returns Import result with character and warnings, or null if user cancels
 * @throws Error only for invalid JSON or missing character data
 */
async function importWithFileSystemAPI(): Promise<ImportResult | null> {
  try {
    if (!window.showOpenFilePicker) {
      throw new UserFacingError("errors.fileSystemUnavailable");
    }
    const [fileHandle] = await window.showOpenFilePicker({
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

    const file = await fileHandle.getFile();
    const text = await file.text();

    return parseAndSanitizeCharacter(text);
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return null;
    }

    throw error;
  }
}

/**
 * @returns Import result with character and warnings, or null if user cancels
 * @throws Error only for invalid JSON or missing character data
 */
async function importWithInputElement(): Promise<ImportResult | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".numenera";
    input.style.display = "none";

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];

      document.body.removeChild(input);

      if (!file) {
        resolve(null);
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

    document.body.appendChild(input);
    input.click();
  });
}

/**
 * @returns Import result with character and warnings, or null if user cancels
 * @throws Error only for invalid JSON or missing character data
 */
export async function importCharacterFromFile(): Promise<ImportResult | null> {
  if ("showOpenFilePicker" in window) {
    return await importWithFileSystemAPI();
  } else {
    return await importWithInputElement();
  }
}
