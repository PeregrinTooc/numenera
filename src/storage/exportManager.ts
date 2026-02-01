import type { Character } from "../types/character";
import { SCHEMA_VERSION } from "./storageConstants";

// Type declarations for File System Access API
declare global {
  interface Window {
    showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
  }
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}

/**
 * File format structure for exported characters
 */
interface CharacterFileData {
  version: string;
  schemaVersion: number;
  exportDate: string;
  character: Character;
}

/**
 * ExportManager handles file exports with File System Access API support
 * Provides Quick Export, Save As, and fallback download functionality
 */
export class ExportManager {
  private fileHandle: FileSystemFileHandle | null = null;
  private readonly HANDLE_STORAGE_KEY = "lastExportFileHandle";
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
      await this.persistHandle(handle);

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
      throw new Error("No remembered location for Quick Export");
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
          throw new Error("Unable to save file. Permission denied.");
        }
        if (error.name === "QuotaExceededError") {
          throw new Error("Unable to save file. Disk full.");
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
    await this.persistHandle(handle);

    // Trigger button update event
    window.dispatchEvent(new CustomEvent("export-handle-updated"));
  }

  /**
   * Clear remembered location (useful for testing or user request)
   */
  clearRememberedLocation(): void {
    this.fileHandle = null;
    localStorage.removeItem(this.HANDLE_STORAGE_KEY);
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
    const blob = new Blob([json], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  }

  private createFileData(character: Character): CharacterFileData {
    return {
      version: "1.0",
      schemaVersion: SCHEMA_VERSION,
      exportDate: new Date().toISOString(),
      character: character,
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

  private async persistHandle(handle: FileSystemFileHandle): Promise<void> {
    try {
      // Store handle in IndexedDB (can't use localStorage for handles)
      const db = await this.openHandleDB();
      const tx = db.transaction("handles", "readwrite");
      const store = tx.objectStore("handles");
      store.put(handle, this.HANDLE_STORAGE_KEY);
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.warn("Failed to persist file handle:", error);
    }
  }

  private async loadPersistedHandle(): Promise<void> {
    try {
      const db = await this.openHandleDB();
      const tx = db.transaction("handles", "readonly");
      const store = tx.objectStore("handles");
      const request = store.get(this.HANDLE_STORAGE_KEY);

      // Wait for the request to complete
      const handle = await new Promise<FileSystemFileHandle | undefined>((resolve) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(undefined);
      });

      if (handle) {
        // Verify we still have permission (if queryPermission exists)
        const queryPermission = (handle as any).queryPermission;
        if (typeof queryPermission === "function") {
          const permission = await queryPermission.call(handle, { mode: "readwrite" });
          if (permission === "granted") {
            this.fileHandle = handle;
          }
        } else {
          // In test/mock environments, assume we have permission
          this.fileHandle = handle;
        }
      }
    } catch (error) {
      // Ignore errors - just means no persisted handle
      console.warn("Failed to load persisted file handle:", error);
    }
  }

  private openHandleDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("FileHandles", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("handles")) {
          db.createObjectStore("handles");
        }
      };
    });
  }
}
