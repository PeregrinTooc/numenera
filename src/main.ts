// Entry point for the application
// Minimal bootstrapping - all components are now class-based

import "./styles/main.css";
import { render } from "lit-html";
import {
  saveCharacterState,
  loadCharacterState,
  clearCharacterState,
} from "./storage/storageFactory.js";
import { importCharacterFromFile } from "./storage/fileStorage.js";
import { ExportManager } from "./storage/exportManager.js";
import { AutoSaveService } from "./services/autoSaveService.js";
import { SaveIndicator } from "./components/SaveIndicator.js";
import { VersionNavigator } from "./components/VersionNavigator.js";
import { VersionWarningBanner } from "./components/VersionWarningBanner.js";
import { Character } from "./types/character.js";
import { FULL_CHARACTER, NEW_CHARACTER } from "./data/mockCharacters.js";
import { CharacterSheet } from "./components/CharacterSheet.js";
import { initI18n, onLanguageChanged } from "./i18n/index.js";
import { getVersionHistory } from "./storage/storageFactory.js";
import { VersionState } from "./services/versionState.js";
import { VersionHistoryService } from "./services/versionHistoryService.js";

// Expose storage functions on window for E2E tests
// This allows tests to work in both dev and production builds
declare global {
  interface Window {
    __testStorage?: {
      saveCharacterState: typeof saveCharacterState;
      loadCharacterState: typeof loadCharacterState;
      clearCharacterState: () => Promise<void>;
    };
    __testVersionHistory?: {
      createVersion: (character: Character, description: string) => Promise<void>;
      getAllVersions: () => Promise<any[]>;
      clearVersions: () => Promise<void>;
    };
    __versionHistoryService?: VersionHistoryService | null;
  }
}

// Global CharacterSheet instance to preserve state across re-renders
let currentSheet: CharacterSheet | null = null;

// Global ExportManager instance
const exportManager = new ExportManager();

// Global AutoSaveService instance with 300ms debounce
const autoSaveService = new AutoSaveService(async () => {
  if (currentCharacter) {
    await saveCharacterState(currentCharacter);
  }
}, 300);

// Global SaveIndicator instance
const saveIndicator = new SaveIndicator();

// Global VersionNavigator instance
let versionNavigator: VersionNavigator | null = null;

// Global VersionState instance
let versionState: VersionState | null = null;

// Global VersionWarningBanner instance
let versionWarningBanner: VersionWarningBanner | null = null;

// Global VersionHistoryService instance
let versionHistoryService: VersionHistoryService | null = null;

// Listen for save-completed events to update indicator
autoSaveService.on("save-completed", async (event) => {
  // Version history is now handled through VersionHistoryService
  // with smart squashing (timer-based buffering)
  // No need to create versions here anymore

  saveIndicator.updateTimestamp(event.timestamp);

  // Check if there are versions (squashing may have occurred)
  // Update version navigator to reflect any new versions
  if (versionState && versionHistoryService) {
    // Only reload if buffer is empty (meaning squash just completed)
    if (versionHistoryService.getBufferLength() === 0 && !versionHistoryService.isTimerActive()) {
      await versionState.reload();
      await updateVersionNavigator(false);
    }
  }

  // Re-render to show updated indicator
  const app = document.getElementById("app");
  if (app && currentSheet) {
    render(currentSheet.render(), app);
    // Re-render indicator separately to avoid full sheet re-render
    const indicatorContainer = document.getElementById("save-indicator-container");
    if (indicatorContainer) {
      render(saveIndicator.render(), indicatorContainer);
    }
  }
});

// Listen for version-squashed events to update version navigator
window.addEventListener("version-squashed", async () => {
  if (versionState) {
    const wasViewingOld = versionState.isViewingOldVersion();
    await versionState.reload();

    // If we were viewing an old version when we edited, navigate to the new latest
    if (wasViewingOld) {
      versionState.restoreToLatest();
      const latestCharacter = versionState.getLatestCharacter();
      await renderCharacterSheet(latestCharacter, true);
    }

    await updateVersionNavigator(true);
  }
});

// Track current character for auto-save
let currentCharacter: Character | null = null;

// Update version navigator based on current version history state
async function updateVersionNavigator(shouldReload = false): Promise<void> {
  if (!versionState) {
    return;
  }

  // Only reload when explicitly requested (e.g., after creating a new version)
  // NOT after navigation, as that would reset to latest
  if (shouldReload) {
    await versionState.reload();
  }

  const versionCount = versionState.getVersionCount();
  const currentIndex = versionState.getCurrentVersionIndex();

  // Navigation handlers
  const handleNavigateBackward = async () => {
    if (!versionState) return;
    await versionState.navigateBackward();
    // Re-render with displayed character
    const displayedCharacter = versionState.getDisplayedCharacter();
    await renderCharacterSheet(displayedCharacter, true);
    // Update navigator UI without reloading
    await updateVersionNavigator(false);
  };

  const handleNavigateForward = async () => {
    if (!versionState) return;
    await versionState.navigateForward();
    // Re-render with displayed character
    const displayedCharacter = versionState.getDisplayedCharacter();
    await renderCharacterSheet(displayedCharacter, true);
    // Update navigator UI without reloading
    await updateVersionNavigator(false);
  };

  if (!versionNavigator) {
    // Create version navigator on first update
    versionNavigator = new VersionNavigator({
      versionCount,
      currentIndex,
      onNavigateBackward: handleNavigateBackward,
      onNavigateForward: handleNavigateForward,
    });

    // Mount in dedicated container (similar to SaveIndicator pattern)
    let navigatorContainer = document.getElementById("version-navigator-container");
    if (!navigatorContainer) {
      navigatorContainer = document.createElement("div");
      navigatorContainer.id = "version-navigator-container";
      document.body.appendChild(navigatorContainer);
    }
    versionNavigator.mount(navigatorContainer);
  } else {
    // Update existing navigator
    versionNavigator.update({
      versionCount,
      currentIndex,
      onNavigateBackward: handleNavigateBackward,
      onNavigateForward: handleNavigateForward,
    });
  }
}

// Render the character sheet with the given character data
async function renderCharacterSheet(
  character: Character,
  skipImmediateSave = false
): Promise<void> {
  const app = document.getElementById("app");
  if (!app) return;

  // Update current character for auto-save
  currentCharacter = character;

  // Handler for field updates
  const handleFieldUpdate = async (field: string, value: string | number): Promise<void> => {
    // Update the character object
    const updatedCharacter = { ...character };
    let fieldLabel = field;

    switch (field) {
      case "name":
        updatedCharacter.name = value as string;
        fieldLabel = "Changed name";
        break;
      case "tier":
        updatedCharacter.tier = value as number;
        fieldLabel = "Changed tier";
        break;
      case "descriptor":
        updatedCharacter.descriptor = value as string;
        fieldLabel = "Changed descriptor";
        break;
      case "focus":
        updatedCharacter.focus = value as string;
        fieldLabel = "Changed focus";
        break;
      case "xp":
        updatedCharacter.xp = value as number;
        fieldLabel = "Changed XP";
        break;
      case "shins":
        updatedCharacter.shins = value as number;
        fieldLabel = "Changed shins";
        break;
      case "armor":
        updatedCharacter.armor = value as number;
        fieldLabel = "Changed armor";
        break;
      case "maxCyphers":
        updatedCharacter.maxCyphers = value as number;
        fieldLabel = "Changed max cyphers";
        break;
      case "effort":
        updatedCharacter.effort = value as number;
        fieldLabel = "Changed effort";
        break;
      case "mightPool":
        updatedCharacter.stats.might.pool = value as number;
        fieldLabel = "Changed Might pool";
        break;
      case "mightEdge":
        updatedCharacter.stats.might.edge = value as number;
        fieldLabel = "Changed Might edge";
        break;
      case "mightCurrent":
        updatedCharacter.stats.might.current = value as number;
        fieldLabel = "Changed current Might";
        break;
      case "speedPool":
        updatedCharacter.stats.speed.pool = value as number;
        fieldLabel = "Changed Speed pool";
        break;
      case "speedEdge":
        updatedCharacter.stats.speed.edge = value as number;
        fieldLabel = "Changed Speed edge";
        break;
      case "speedCurrent":
        updatedCharacter.stats.speed.current = value as number;
        fieldLabel = "Changed current Speed";
        break;
      case "intellectPool":
        updatedCharacter.stats.intellect.pool = value as number;
        fieldLabel = "Changed Intellect pool";
        break;
      case "intellectEdge":
        updatedCharacter.stats.intellect.edge = value as number;
        fieldLabel = "Changed Intellect edge";
        break;
      case "intellectCurrent":
        updatedCharacter.stats.intellect.current = value as number;
        fieldLabel = "Changed current Intellect";
        break;
    }

    // Update currentCharacter BEFORE requesting auto-save
    currentCharacter = updatedCharacter;

    // Buffer change for version history with smart squashing
    const service = window.__versionHistoryService || versionHistoryService;
    if (service) {
      service.bufferChange(updatedCharacter, fieldLabel);
    }

    // Request auto-save (debounced) - will now save the updated character
    autoSaveService.requestSave();

    // Re-render with updated character (skip immediate save since we're using debounced auto-save)
    renderCharacterSheet(updatedCharacter, true);
  };

  // Handler for importing character from file
  const handleLoadFromFile = async (): Promise<void> => {
    try {
      const importedCharacter = await importCharacterFromFile();
      if (importedCharacter) {
        renderCharacterSheet(importedCharacter);
      }
      // If null, user cancelled - do nothing
    } catch (error) {
      console.error("Error importing character:", error);
      alert(
        `Failed to import character: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // Helper to update header button state after export operations
  const updateHeaderButtonState = (): void => {
    if (currentSheet && (currentSheet as any).header) {
      (currentSheet as any).header.setHasRememberedLocation(exportManager.hasRememberedLocation());
      // Trigger re-render to show new buttons
      if (app) {
        render(currentSheet.render(), app);
      }
    }
  };

  // Handler for first export (or fallback for non-Chromium)
  const handleExport = async (): Promise<void> => {
    try {
      await exportManager.export(character);
      updateHeaderButtonState();
    } catch (error) {
      console.error("Error exporting character:", error);
      alert(
        `Failed to export character: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };

  // Handler for Quick Export
  const handleQuickExport = async (): Promise<void> => {
    try {
      await exportManager.quickExport(character);
      // Success feedback is handled by export-success event
    } catch (error) {
      console.error("Error in quick export:", error);
      alert(`Failed to save file: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Handler for Save As
  const handleSaveAs = async (): Promise<void> => {
    try {
      await exportManager.saveAs(character);
      updateHeaderButtonState();
    } catch (error) {
      console.error("Error in save as:", error);
      alert(`Failed to save file: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Create new sheet only if we don't have one yet, or if it's a different character
  // (e.g., Load or New button clicked)
  const needsNewSheet = !currentSheet || (currentSheet as any).character !== character;

  if (needsNewSheet) {
    currentSheet = new CharacterSheet(
      character,
      async () => {
        renderCharacterSheet(FULL_CHARACTER);
        // Save immediately when loading a character
        await saveCharacterState(FULL_CHARACTER);
      },
      async () => {
        renderCharacterSheet(NEW_CHARACTER);
        // Save immediately when creating new character
        await saveCharacterState(NEW_CHARACTER);
      },
      handleLoadFromFile,
      handleExport,
      handleFieldUpdate,
      handleQuickExport,
      handleSaveAs
    );
  }

  // Update header with current export manager state
  if (currentSheet && (currentSheet as any).header) {
    (currentSheet as any).header.setHasRememberedLocation(exportManager.hasRememberedLocation());
  }

  if (currentSheet) {
    render(currentSheet.render(), app);
  }

  // Save character state to localStorage after rendering
  // Skip immediate save only when explicitly requested (e.g., during field updates that use debounced auto-save)
  if (!skipImmediateSave) {
    await saveCharacterState(character);
  }

  // Render save indicator in separate container
  let indicatorContainer = document.getElementById("save-indicator-container");
  if (!indicatorContainer) {
    indicatorContainer = document.createElement("div");
    indicatorContainer.id = "save-indicator-container";
    document.body.appendChild(indicatorContainer);
  }
  render(saveIndicator.render(), indicatorContainer);

  // Request auto-save (debounced) - initial render doesn't trigger save
  // Only subsequent changes will trigger auto-save

  // Handle version warning banner and read-only mode
  if (versionState) {
    const isViewingOldVersion = versionState.isViewingOldVersion();

    // Show/hide warning banner
    let bannerContainer = document.getElementById("version-warning-banner-container");
    if (!bannerContainer) {
      bannerContainer = document.createElement("div");
      bannerContainer.id = "version-warning-banner-container";
      document.body.appendChild(bannerContainer);
    }

    if (isViewingOldVersion) {
      const metadata = versionState.getCurrentVersionMetadata();
      if (metadata) {
        if (!versionWarningBanner) {
          versionWarningBanner = new VersionWarningBanner({
            description: metadata.description,
            timestamp: metadata.timestamp,
            onReturn: async () => {
              if (!versionState) return;
              // Navigate to latest version without creating new version
              versionState.restoreToLatest();
              const latestCharacter = versionState.getLatestCharacter();
              await renderCharacterSheet(latestCharacter, true);
              await updateVersionNavigator(false); // Don't reload, just update UI
            },
            onRestore: async () => {
              if (!versionState) return;
              // Restore the current old version by saving it as new latest
              await versionState.restoreCurrentVersion();
              const latestCharacter = versionState.getLatestCharacter();
              await renderCharacterSheet(latestCharacter, true);
              await updateVersionNavigator(true); // Reload to show new version
            },
          });
          versionWarningBanner.mount(bannerContainer);
        } else {
          versionWarningBanner.update({
            description: metadata.description,
            timestamp: metadata.timestamp,
            onReturn: async () => {
              if (!versionState) return;
              // Navigate to latest version without creating new version
              versionState.restoreToLatest();
              const latestCharacter = versionState.getLatestCharacter();
              await renderCharacterSheet(latestCharacter, true);
              await updateVersionNavigator(false); // Don't reload, just update UI
            },
            onRestore: async () => {
              if (!versionState) return;
              // Restore the current old version by saving it as new latest
              await versionState.restoreCurrentVersion();
              const latestCharacter = versionState.getLatestCharacter();
              await renderCharacterSheet(latestCharacter, true);
              await updateVersionNavigator(true); // Reload to show new version
            },
          });
        }
      }
      // Note: No read-only mode - user can edit from any version, which auto-navigates to latest
    } else {
      // Remove warning banner if it exists
      if (versionWarningBanner) {
        versionWarningBanner.unmount();
        versionWarningBanner = null;
      }
    }
  }

  // Listen for character-updated events and re-render + auto-save
  // Use setTimeout to ensure the event listener is added after render completes
  setTimeout(() => {
    const listener = async (_e: Event) => {
      // Trigger auto-save when character is updated
      autoSaveService.requestSave();

      // Just re-render with the same sheet instance to preserve component state
      if (currentSheet) {
        render(currentSheet.render(), app);
      }
    };

    // Remove any existing listeners to avoid duplicates
    app.removeEventListener("character-updated", listener as EventListener);
    app.addEventListener("character-updated", listener as EventListener);
  }, 0);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", async () => {
  // Expose storage API for E2E tests (works in both dev and production)
  window.__testStorage = {
    saveCharacterState,
    loadCharacterState,
    clearCharacterState: async () => {
      localStorage.clear();
      const dbName = "NumeneraCharacterDB";
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase(dbName);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },
  };

  // Expose version history API for E2E tests
  window.__testVersionHistory = {
    createVersion: async (character: Character, description: string) => {
      const versionHistory = await getVersionHistory();
      await versionHistory.saveVersion(character, description);
      // Update the version navigator after creating a version (reload to get new version)
      await updateVersionNavigator(true);
    },
    getAllVersions: async () => {
      const versionHistory = await getVersionHistory();
      return await versionHistory.getAllVersions();
    },
    clearVersions: async () => {
      // Clear all versions from IndexedDB
      const dbName = "NumeneraCharacterDB";
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const transaction = db.transaction(["versions"], "readwrite");
      const store = transaction.objectStore("versions");
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      db.close();

      // Update navigator to reflect cleared state (reload to get updated list)
      await updateVersionNavigator(true);
    },
  };

  // Initialize i18n first
  await initI18n();

  // Re-render on language change
  onLanguageChanged(async () => {
    const storedCharacter = await loadCharacterState();
    if (storedCharacter) {
      renderCharacterSheet(storedCharacter);
    } else {
      renderCharacterSheet(FULL_CHARACTER);
    }
  });

  // Priority: localStorage > default
  const storedCharacter = await loadCharacterState();

  // Select and render initial character data
  // Validate that stored character has required structure
  const isValidCharacter = (char: any): boolean => {
    return (
      char &&
      char.stats &&
      char.stats.might &&
      char.stats.speed &&
      char.stats.intellect &&
      Array.isArray(char.abilities) &&
      Array.isArray(char.cyphers) &&
      Array.isArray(char.artifacts) &&
      Array.isArray(char.equipment) &&
      Array.isArray(char.attacks) &&
      Array.isArray(char.specialAbilities) &&
      Array.isArray(char.oddities) &&
      char.recoveryRolls &&
      char.damageTrack &&
      char.textFields
    );
  };

  let initialCharacter = FULL_CHARACTER;
  if (isValidCharacter(storedCharacter)) {
    initialCharacter = storedCharacter;
  } else if (storedCharacter) {
    console.warn("Stored character data is incomplete or corrupted, using default character");
    // Clear the corrupted data
    await clearCharacterState();
  }

  // Render the initial character sheet
  await renderCharacterSheet(initialCharacter);

  // Save the initial state as Version 1
  const versionHistory = await getVersionHistory();
  const versions = await versionHistory.getAllVersions();

  // Initialize VersionHistoryService
  // Use configured delay if available (for tests), otherwise default 5000ms
  const squashDelay =
    (typeof window !== "undefined" && (window as any).__SQUASH_DELAY_MS__) || 5000;
  versionHistoryService = new VersionHistoryService(versionHistory, squashDelay);

  // Expose versionHistoryService globally for components to access
  window.__versionHistoryService = versionHistoryService;

  // Add beforeunload handler to flush buffered changes
  window.addEventListener("beforeunload", async () => {
    if (versionHistoryService) {
      // Flush any buffered changes before page unload
      await versionHistoryService.flush();
    }
  });

  // Only create initial version if no versions exist yet
  if (versions.length === 0) {
    await versionHistory.saveVersion(initialCharacter, "Initial state");
  }

  // Initialize VersionState
  versionState = new VersionState(initialCharacter, versionHistory);
  await versionState.init();

  // Update navigator after versionState is initialized
  await updateVersionNavigator(true);
});
