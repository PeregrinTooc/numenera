import { downloadTextFile } from "@/utils/downloadFile";
import type { Character } from "@/types/character";
import { SCHEMA_VERSION } from "./storageConstants";
import type { CharacterFileData } from "./fileStorage";
import {
  HANDLE_STORAGE_KEY,
  persistFileHandle,
  deleteFileHandle,
  loadPersistedFileHandle,
} from "./fileHandleStore";
import { loadLayout } from "./layoutStorage";
import { UserFacingError } from "@/utils/UserFacingError";

/**
 * ExportManager handles file exports with File System Access API support
 * Provides Quick Export, Save As, and fallback download functionality
 */
export class ExportManager {
  private fileHandle: FileSystemFileHandle | null = null;
  private initPromise: Promise<void>;

  constructor() {
    // Start loading persisted handle but don't block constructor
    this.initPromise = this.loadPersistedHandle().catch((error) => {
      console.warn("Failed to load persisted handle during init:", error);
    });
  }

  /**
   * Ensure initialization is complete before operations
   */
  private async ensureInitialized(): Promise<void> {
    await this.initPromise;
  }

  /**
   * Check if File System Access API is available
   */
  supportsFileSystemAccess(): boolean {
    return "showSaveFilePicker" in window;
  }

  /**
   * Check if we have a remembered export location
   * Note: This is synchronous for simplicity, but initialization happens async in background
   */
  hasRememberedLocation(): boolean {
    return this.fileHandle !== null;
  }

  /**
   * Export character - behavior depends on API support and state
   * - Chromium + no handle: Prompt for location, save handle
   * - Chromium + has handle: Not used (Quick Export button shown instead)
   * - Non-Chromium: Traditional download
   */
  async export(character: Character): Promise<void> {
    await this.ensureInitialized();

    if (this.supportsFileSystemAccess()) {
      // First-time export in Chromium - prompt and remember
      const handle = await this.promptForLocation(character);
      if (!handle) return; // User cancelled

      await this.writeToHandle(handle, character);
      this.fileHandle = handle;
      await persistFileHandle(handle);

      // Trigger button update event
      window.dispatchEvent(new CustomEvent("export-handle-updated"));
    } else {
      // Fallback for non-Chromium browsers
      await this.downloadFile(character);
    }
  }

  /**
   * Quick Export - only available after first export in Chromium
   */
  async quickExport(character: Character): Promise<void> {
    if (!this.fileHandle) {
      throw new UserFacingError("errors.noRememberedLocation");
    }

    try {
      await this.writeToHandle(this.fileHandle, character);

      // Show success notification
      window.dispatchEvent(
        new CustomEvent("export-success", {
          detail: { filename: this.fileHandle.name },
        })
      );
    } catch (error) {
      if (error instanceof DOMException) {
        // Handle specific errors
        if (error.name === "NotAllowedError") {
          throw new UserFacingError("errors.permissionDenied", { cause: error });
        }
        if (error.name === "QuotaExceededError") {
          throw new UserFacingError("errors.diskFull", { cause: error });
        }
      }
      throw error;
    }
  }

  /**
   * Save As - only available after first export in Chromium
   */
  async saveAs(character: Character): Promise<void> {
    const handle = await this.promptForLocation(character);
    if (!handle) return; // User cancelled

    await this.writeToHandle(handle, character);
    this.fileHandle = handle;
    await persistFileHandle(handle);

    // Trigger button update event
    window.dispatchEvent(new CustomEvent("export-handle-updated"));
  }

  /**
   * Clear remembered location (useful for testing or user request)
   */
  clearRememberedLocation(): void {
    this.fileHandle = null;
    localStorage.removeItem(HANDLE_STORAGE_KEY);
    deleteFileHandle().catch((error) => {
      console.warn("Failed to delete persisted file handle:", error);
    });
    window.dispatchEvent(new CustomEvent("export-handle-updated"));
  }

  // ========================================
  // Private Methods
  // ========================================

  private async promptForLocation(character: Character): Promise<FileSystemFileHandle | null> {
    const filename = this.generateFilename(character);

    try {
      return await window.showSaveFilePicker!({
        suggestedName: filename,
        types: [
          {
            description: "Numenera Character Files",
            accept: { "application/json": [".numenera"] },
          },
        ],
      });
    } catch (error) {
      // User cancelled
      if (error instanceof DOMException && error.name === "AbortError") {
        return null;
      }
      throw error;
    }
  }

  private async writeToHandle(handle: FileSystemFileHandle, character: Character): Promise<void> {
    const fileData = this.createFileData(character);
    const writable = await handle.createWritable();
    const json = JSON.stringify(fileData, null, 2);
    await writable.write(json);
    await writable.close();
  }

  private async downloadFile(character: Character): Promise<void> {
    const filename = this.generateFilename(character);
    const fileData = this.createFileData(character);
    const json = JSON.stringify(fileData, null, 2);
    downloadTextFile(filename, json, "application/json");
  }

  private createFileData(character: Character): CharacterFileData {
    return {
      version: "1.0",
      schemaVersion: SCHEMA_VERSION,
      exportDate: new Date().toISOString(),
      character: character,
      layout: loadLayout(),
    };
  }

  private generateFilename(character: Character): string {
    const trimmed = character.name.trim();
    if (!trimmed) return "character.numenera";

    const sanitized = trimmed
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    return `${sanitized}.numenera`;
  }

  private async loadPersistedHandle(): Promise<void> {
    const handle = await loadPersistedFileHandle();
    if (handle) {
      this.fileHandle = handle;
    }
  }
}
