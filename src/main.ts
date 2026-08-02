// Entry point for the application
// Minimal bootstrapping - all components are now class-based

import "./styles/main.css";
import { render } from "lit-html";
import {
  saveCharacterState,
  loadCharacterState,
  clearCharacterState,
} from "./storage/storageFactory.js";
import { getFileImporter, setFileImporter, resetFileImporter } from "./storage/fileImporter.js";
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
import { ConflictDetectionService } from "./services/conflictDetectionService.js";
import { ConflictWarningModal } from "./components/ConflictWarningModal.js";
import type { TestTimer, ITimer } from "./services/timer.js";
import type { SectionId } from "./types/layout.js";
import { applyFieldUpdate } from "./utils/characterFieldUpdate.js";

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
    __testFileImporter?: {
      setFileImporter: typeof setFileImporter;
      resetFileImporter: typeof resetFileImporter;
    };
    __versionHistoryService?: VersionHistoryService | null;
    __conflictDetectionService?: ConflictDetectionService | null;
    __testTimer?: TestTimer;
    __autoSaveService?: AutoSaveService;
  }
}

// Global CharacterSheet instance to preserve state across re-renders
let currentSheet: CharacterSheet | null = null;

// Sections rendered via a separate CollectionBehavior-backed component whose
// DOM nodes aren't tracked by lit-html's part system when only the parent
// sheet re-renders; each needs an explicit targeted re-render.
const COLLECTION_SECTION_IDS: SectionId[] = [
  "cyphers",
  "abilities",
  "specialAbilities",
  "attacks",
  "items",
];

function rerenderCollectionSections(): void {
  for (const sectionId of COLLECTION_SECTION_IDS) {
    currentSheet?.rerenderSection(sectionId);
  }
}

// Global ExportManager instance
const exportManager = new ExportManager();

// Create timer instance for tests (or use real timer in production)
// Tests can set window.__testTimer before DOMContentLoaded
// NOTE: TestTimer is ONLY for VersionHistoryService squash timer
// AutoSaveService should always use RealTimer so debounce works automatically
let testTimer: ITimer | undefined;
if (typeof window !== "undefined" && window.__testTimer) {
  testTimer = window.__testTimer;
}

// Global AutoSaveService instance with 300ms debounce
// IMPORTANT: Always use RealTimer for auto-save debounce (not TestTimer)
// This ensures auto-save triggers automatically after 300ms in both prod and tests
const autoSaveService = new AutoSaveService(
  async () => {
    if (currentCharacter) {
      await saveCharacterState(currentCharacter);
    }
  },
  300
  // No timer parameter = uses default RealTimer
);

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

  // Format timestamp for display (HH:MM:SS format)
  const date = new Date(event.timestamp);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const formattedTime = `${hours}:${minutes}:${seconds}`;

  saveIndicator.updateTimestamp(formattedTime);

  // Check if there are versions (squashing may have occurred)
  // Update version navigator to reflect any new versions
  if (versionState && versionHistoryService) {
    // Only reload if buffer is empty (meaning squash just completed)
    if (versionHistoryService.getBufferLength() === 0 && !versionHistoryService.isTimerActive()) {
      await versionState.reload();
      await updateVersionNavigator(false);
    }
  }

  // Only re-render the indicator, not the full sheet
  // Full sheet re-render would cause flash during drag-drop operations
  const indicatorContainer = document.getElementById("save-indicator-container");
  if (indicatorContainer) {
    render(saveIndicator.render(), indicatorContainer);
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

// Track character state before updates for version history
// This needs to be updated whenever a new event listener might need it
let characterBeforeUpdate: Character | null = null;

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

    // Force a fresh render by clearing the currentSheet
    // This ensures a new CharacterSheet is created with the correct character
    currentSheet = null;
    currentCharacter = displayedCharacter;

    await renderCharacterSheet(displayedCharacter, true);

    // Force re-render of all collection sections to ensure DOM is updated
    rerenderCollectionSections();

    // Update navigator UI without reloading
    await updateVersionNavigator(false);
  };

  const handleNavigateForward = async () => {
    if (!versionState) return;
    await versionState.navigateForward();
    // Re-render with displayed character
    const displayedCharacter = versionState.getDisplayedCharacter();

    // Force a fresh render by clearing the currentSheet
    currentSheet = null;
    currentCharacter = displayedCharacter;

    await renderCharacterSheet(displayedCharacter, true);

    // Force re-render of all collection sections to ensure DOM is updated
    rerenderCollectionSections();

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

  // Keep VersionState's latestCharacter current so "Return to latest" and
  // the post-squash auto-navigate reflect the session's edits instead of
  // falling back to the character loaded at page load (setLatestCharacter
  // otherwise has no call sites). Skip while viewing a historical version -
  // `character` here is that old version's data, not a live edit.
  if (versionState && !versionState.isViewingOldVersion()) {
    versionState.setLatestCharacter(character);
  }

  // Handler for field updates
  const handleFieldUpdate = async (field: string, value: string | number): Promise<void> => {
    // Set initial state before first edit (if buffer is empty and no initial state set)
    const service = window.__versionHistoryService || versionHistoryService;
    if (service && service.getBufferLength() === 0) {
      service.setInitialState(character);
    }

    // Mark as dirty for conflict detection (before making changes)
    const conflictService = window.__conflictDetectionService;
    if (conflictService) {
      conflictService.markDirty(character);
    }

    // Update the character object
    const { character: updatedCharacter, label: fieldLabel } = applyFieldUpdate(
      character,
      field,
      value
    );

    // Update currentCharacter BEFORE requesting auto-save
    currentCharacter = updatedCharacter;

    // Buffer change for version history with smart squashing
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
      const fileImporter = getFileImporter();
      const importResult = await fileImporter.importCharacter();
      if (importResult) {
        const { character: importedCharacter, warnings } = importResult;

        // Log any warnings from sanitization
        if (warnings.length > 0) {
          console.warn("Character import warnings:", warnings);
          // Show warning to user if there were significant corrections
          if (warnings.length > 0) {
            const warningMessage =
              warnings.length === 1
                ? `Note: ${warnings[0]}`
                : `Note: ${warnings.length} adjustments were made during import. Check console for details.`;
            // Use setTimeout to avoid blocking the import
            setTimeout(() => alert(warningMessage), 100);
          }
        }

        // Buffer change for version history
        const service = window.__versionHistoryService || versionHistoryService;
        if (service) {
          service.bufferChange(importedCharacter, "Imported character");
        }

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
    if (currentSheet) {
      currentSheet.setHeaderHasRememberedLocation(exportManager.hasRememberedLocation());
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
  const needsNewSheet = !currentSheet || !currentSheet.isForCharacter(character);

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
  if (currentSheet) {
    currentSheet.setHeaderHasRememberedLocation(exportManager.hasRememberedLocation());
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

    // Update import button state based on viewing mode
    if (currentSheet) {
      currentSheet.setIsViewingOldVersion(isViewingOldVersion);
    }

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

  // Update the global BEFORE state for version history tracking
  // This must happen AFTER rendering but BEFORE any component can dispatch character-updated
  characterBeforeUpdate = currentCharacter ? globalThis.structuredClone(currentCharacter) : null;
}

// Listen for cyphers-updated events for targeted cypher re-render (smooth, no flash)
function handleCyphersUpdated(_e: Event): void {
  currentSheet?.rerenderSection("cyphers");
}

const COLLECTION_UPDATED_SECTION_IDS: Record<string, SectionId> = {
  abilities: "abilities",
  specialAbilities: "specialAbilities",
  attacks: "attacks",
  equipment: "items",
  artifacts: "items",
  oddities: "items",
};

// Listen for collection-updated events for targeted re-render of collection sections
function handleCollectionUpdated(e: Event): void {
  const customEvent = e as CustomEvent<{ section: string }>;
  const sectionName = customEvent.detail?.section;
  const sectionId = sectionName ? COLLECTION_UPDATED_SECTION_IDS[sectionName] : undefined;
  if (sectionId) {
    currentSheet?.rerenderSection(sectionId);
  }
}

// Listen for recovery-updated events for targeted re-render of recovery section
// Since RecoveryRolls is created fresh in render(), we need to re-render the full sheet
function handleRecoveryUpdated(_e: Event): void {
  const app = document.getElementById("app");
  if (app && currentSheet && currentCharacter) {
    render(currentSheet.render(), app);
  }
}

// Listen for character-updated events and trigger auto-save
// Re-rendering is handled by specific event listeners:
// - cyphers-updated for cyphers
// - collection-updated for abilities, specialAbilities, attacks, equipment, artifacts, oddities
// - recovery-updated for recovery modifier
function handleCharacterUpdated(_e: Event): void {
  // Buffer the change for version history (for card operations, etc.)
  const service = window.__versionHistoryService || versionHistoryService;
  if (service && currentCharacter && characterBeforeUpdate) {
    // Set initial state before first edit if buffer is empty
    if (service.getBufferLength() === 0) {
      service.setInitialState(characterBeforeUpdate);
    }
    service.bufferChange(currentCharacter, "Updated character");

    // Update the BEFORE state for the next change
    characterBeforeUpdate = globalThis.structuredClone(currentCharacter);
  }

  // Trigger auto-save when character is updated
  autoSaveService.requestSave();

  // NOTE: No re-render here - specific event listeners handle rendering:
  // - cyphers-updated for cyphers
  // - collection-updated for other collections
  // This prevents double re-render (flash) when collections are reordered
}

// Register the four app-level listeners exactly once. They read
// currentSheet/currentCharacter/etc. from module state at fire time, so a
// single registration handles every render — no per-render re-registration
// needed (and no accumulation: registering inside renderCharacterSheet, once
// per render, built a new closure each time whose removeEventListener call
// could never match a previously-added one, so listeners piled up and a
// single event dispatch fired the handler once per prior render).
function registerAppEventListeners(app: HTMLElement): void {
  app.addEventListener("cyphers-updated", handleCyphersUpdated);
  app.addEventListener("collection-updated", handleCollectionUpdated);
  app.addEventListener("recovery-updated", handleRecoveryUpdated);
  app.addEventListener("character-updated", handleCharacterUpdated);
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", async () => {
  // Expose storage API for E2E tests (works in both dev and production)
  window.__testStorage = {
    saveCharacterState,
    loadCharacterState,
    clearCharacterState: async () => {
      localStorage.clear();
      // Go through the real adapter rather than deleting a database by name:
      // this targets whichever backend is actually active (IndexedDB or the
      // localStorage fallback) under its real name, instead of a hardcoded
      // "NumeneraCharacterDB" that never matched the real
      // "numenera-character-db" database.
      await clearCharacterState();
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
      // Go through the real manager's own clear(), targeting the actual
      // "numenera-version-history-db" database and "versions" store, rather
      // than hand-rolling a transaction against a hardcoded, wrong DB name
      // ("NumeneraCharacterDB") that has no "versions" store at all.
      const versionHistory = await getVersionHistory();
      await versionHistory.clear();

      // Update navigator to reflect cleared state (reload to get updated list)
      await updateVersionNavigator(true);
    },
  };

  // Expose autoSaveService for E2E tests
  window.__autoSaveService = autoSaveService;

  // Expose file importer API for E2E tests
  window.__testFileImporter = {
    setFileImporter,
    resetFileImporter,
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

  // Register the app-level event listeners once, before the first render
  const appElement = document.getElementById("app");
  if (appElement) {
    registerAppEventListeners(appElement);
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

  // Use test timer if available (for E2E tests)
  const timerForVersionHistory = testTimer || undefined;
  versionHistoryService = new VersionHistoryService(
    versionHistory,
    squashDelay,
    timerForVersionHistory
  );

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

  // Initialize ConflictDetectionService for multi-tab conflict detection
  const conflictDetectionService = new ConflictDetectionService();
  window.__conflictDetectionService = conflictDetectionService;

  // Set initial ETag for conflict detection
  await conflictDetectionService.setCurrentEtag(initialCharacter);

  // Initialize ConflictWarningModal
  const appEl = document.getElementById("app");
  if (appEl) {
    new ConflictWarningModal(appEl);

    // Listen for settings updates (e.g., settings panel open/close)
    appEl.addEventListener("settings-updated", () => {
      // Re-render the current sheet to update settings panel visibility
      if (currentSheet && currentCharacter) {
        render(currentSheet.render(), appEl);
      }
    });
  }

  // Listen for conflict resolution events
  window.addEventListener("conflict-resolved", async (event: Event) => {
    const customEvent = event as CustomEvent<{ resolution: string; remoteEtag: string }>;
    const { resolution } = customEvent.detail;

    if (resolution === "load-remote") {
      // Reload the page to get the latest version
      window.location.reload();
    }
    // For "save-local", the save will proceed normally
  });

  // Notify conflict detection service when versions are saved and clear dirty flag
  window.addEventListener("version-squashed", async () => {
    if (currentCharacter && conflictDetectionService) {
      await conflictDetectionService.notifyVersionSaved(currentCharacter);
      conflictDetectionService.clearDirty();
    }
  });

  // Add keyboard shortcuts for version navigation (Ctrl+Z for undo, Ctrl+Y for redo)
  document.addEventListener("keydown", async (e: KeyboardEvent) => {
    // Check if a modal or input is focused (don't intercept shortcuts in inputs)
    const target = e.target as HTMLElement;
    const isInInput =
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.closest('[role="dialog"]'));

    if (isInInput) {
      return;
    }

    // Handle Ctrl+Z or Cmd+Z (Undo)
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();

      if (!versionState) return;

      // Check buffer state first (before squash undo/redo takes precedence)
      if (versionHistoryService && versionHistoryService.canUndo()) {
        // Undo in buffer (before squash)
        const previousState = versionHistoryService.undo();
        if (previousState) {
          // Force a fresh render by clearing the currentSheet
          // This ensures a new CharacterSheet is created with the correct character
          currentSheet = null;

          // Update currentCharacter BEFORE rendering
          currentCharacter = previousState;

          await renderCharacterSheet(previousState, true);

          // Force re-render of all collection sections to ensure DOM is updated
          rerenderCollectionSections();
        }
        return;
      }

      // Otherwise, navigate backward through saved versions (after squash)
      if (versionState.getCurrentVersionIndex() > 0) {
        await versionState.navigateBackward();
        // Re-render with the previous version
        const displayedCharacter = versionState.getDisplayedCharacter();
        await renderCharacterSheet(displayedCharacter, true);
        // Update navigator UI without reloading
        await updateVersionNavigator(false);
      }
    }

    // Handle Ctrl+Y, Cmd+Y, or Ctrl+Shift+Z (Redo)
    if (
      ((e.ctrlKey || e.metaKey) && e.key === "y") ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
    ) {
      e.preventDefault();

      if (!versionState) return;

      // Check buffer state first (before squash redo takes precedence)
      if (versionHistoryService && versionHistoryService.canRedo()) {
        // Redo in buffer (before squash)
        const redoneState = versionHistoryService.redo();
        if (redoneState) {
          // Force a fresh render by clearing the currentSheet
          currentSheet = null;

          // Update currentCharacter before rendering
          currentCharacter = redoneState;

          // Render the redo'd state (this will update characterBeforeUpdate)
          await renderCharacterSheet(redoneState, true);

          // Force re-render of all collection sections to ensure DOM is updated
          rerenderCollectionSections();

          // Request auto-save to persist the redo'd state to localStorage
          autoSaveService.requestSave();
        }
        return;
      }

      // Otherwise, navigate forward through saved versions (after squash)
      if (versionState.isViewingOldVersion()) {
        await versionState.navigateForward();
        // Re-render with the next version
        const displayedCharacter = versionState.getDisplayedCharacter();
        await renderCharacterSheet(displayedCharacter, true);
        // Update navigator UI without reloading
        await updateVersionNavigator(false);
      }
    }
  });
});
