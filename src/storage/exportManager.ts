import { downloadTextFile } from "@/utils/downloadFile";
import type { Clock } from "@/services/clock";
import type { Character } from "@/types/character";
import { SCHEMA_VERSION } from "./storageConstants";
import { characterFileTypes, type CharacterFileData } from "./fileStorage";
import {
  HANDLE_STORAGE_KEY,
  persistFileHandle,
  deleteFileHandle,
  loadPersistedFileHandle,
} from "./fileHandleStore";
import { loadLayout, loadSectionColumns } from "./layoutStorage";
import { UserFacingError } from "@/utils/UserFacingError";

export class ExportManager {
  private fileHandle: FileSystemFileHandle | null = null;
  private initPromise: Promise<void>;

  constructor(private readonly clock: Clock) {
    // Start loading persisted handle but don't block constructor
    this.initPromise = this.loadPersistedHandle().catch((error) => {
      console.warn("Failed to load persisted handle during init:", error);
    });
  }

  private async ensureInitialized(): Promise<void> {
    await this.initPromise;
  }

  supportsFileSystemAccess(): boolean {
    return "showSaveFilePicker" in window;
  }

  /**
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
      await this.chooseAndRememberLocation(character);
    } else {
      await this.downloadFile(character);
    }
  }

  async quickExport(character: Character): Promise<void> {
    if (!this.fileHandle) {
      throw new UserFacingError("errors.noRememberedLocation");
    }

    try {
      await this.writeToHandle(this.fileHandle, character);

      window.dispatchEvent(
        new CustomEvent("export-success", {
          detail: { filename: this.fileHandle.name },
        })
      );
    } catch (error) {
      if (error instanceof DOMException) {
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

  async saveAs(character: Character): Promise<void> {
    await this.chooseAndRememberLocation(character);
  }

  clearRememberedLocation(): void {
    this.fileHandle = null;
    localStorage.removeItem(HANDLE_STORAGE_KEY);
    deleteFileHandle().catch((error) => {
      console.warn("Failed to delete persisted file handle:", error);
    });
    window.dispatchEvent(new CustomEvent("export-handle-updated"));
  }

  private async chooseAndRememberLocation(character: Character): Promise<void> {
    const handle = await this.promptForLocation(character);
    if (!handle) return;

    await this.writeToHandle(handle, character);
    this.fileHandle = handle;
    await persistFileHandle(handle);

    window.dispatchEvent(new CustomEvent("export-handle-updated"));
  }

  private async promptForLocation(character: Character): Promise<FileSystemFileHandle | null> {
    const filename = this.generateFilename(character);

    try {
      return await window.showSaveFilePicker!({
        suggestedName: filename,
        types: characterFileTypes(),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return null;
      }
      throw error;
    }
  }

  private async writeToHandle(handle: FileSystemFileHandle, character: Character): Promise<void> {
    const writable = await handle.createWritable();
    await writable.write(this.serialize(character));
    await writable.close();
  }

  private async downloadFile(character: Character): Promise<void> {
    const filename = this.generateFilename(character);
    downloadTextFile(filename, this.serialize(character), "application/json", this.clock);
  }

  private serialize(character: Character): string {
    const fileData: CharacterFileData = {
      version: "1.0",
      schemaVersion: SCHEMA_VERSION,
      exportDate: new Date().toISOString(),
      character: character,
      layout: loadLayout(),
      sectionColumns: loadSectionColumns(),
    };
    return JSON.stringify(fileData, null, 2);
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
