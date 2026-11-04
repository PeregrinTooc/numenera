import {
  loadCharacterState,
  loadRawCharacterState,
  saveCharacterState,
  saveCorruptedCharacterBackup,
  loadCorruptedCharacterBackup,
  deleteCorruptedCharacterBackup,
  getVersionHistory,
} from "@/storage/storageFactory";
import { ModalService } from "@/services/modalService";
import { downloadTextFile } from "@/utils/downloadFile";
import { logger } from "@/utils/logger";
import { reportStorageWriteFailure } from "@/storage/storageWriteFailure";
import { sanitizeCharacter } from "@/utils/characterSanitizer";
import {
  isUnreadableCharacter,
  keepUnreadableCharacter,
  offerUnreadableBackup,
} from "./unreadableCharacter";
import { VersionState } from "@/services/versionState";
import { VersionHistoryService } from "@/services/versionHistoryService";
import { ConflictDetectionService } from "@/services/conflictDetectionService";
import { ConflictWarningModal } from "@/components/ConflictWarningModal";
import { FULL_CHARACTER } from "@/data/mockCharacters";
import { initI18n, onLanguageChanged } from "@/i18n/index";
import { migrateLegacyVersionDescriptions } from "@/services/versionDescriptionMigration";
import { reconcileVersionHistory } from "@/services/versionHistoryReconciliation";
import { registerAppEventListeners } from "./appEvents";
import { installTestHooks } from "./testHooks";
import { registerVersionKeyboardShortcuts } from "./versionNavigation";
import type { AppContext } from "./appContext";
import type { Character } from "@/types/character";

/** Multi-tab conflict detection: service, modal, and the events that feed it. */
async function initConflictDetection(ctx: AppContext, initialCharacter: Character): Promise<void> {
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
      if (ctx.currentSheet && ctx.currentCharacter) {
        ctx.currentSheet.mount(appEl);
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
    if (ctx.currentCharacter) {
      await conflictDetectionService.notifyVersionSaved(ctx.currentCharacter);
      conflictDetectionService.clearDirty();
    }
  });
}

/**
 * Flush a pending debounced save on unload so a last-moment edit is not lost.
 * Best effort: the save is initiated synchronously, but unload cannot await it.
 * pagehide covers mobile Safari / bfcache; a second flush is a no-op.
 */
function registerUnloadFlush(ctx: AppContext): void {
  const flushAutoSaveOnUnload = (): void => {
    void ctx.autoSaveService.flush();
  };
  window.addEventListener("beforeunload", flushAutoSaveOnUnload);
  window.addEventListener("pagehide", flushAutoSaveOnUnload);
}

/** Re-render the sheet from storage (or the default character) when the language changes. */
function registerLanguageChangeRender(ctx: AppContext): void {
  onLanguageChanged(async () => {
    const storedCharacter = await loadCharacterState();
    if (storedCharacter) {
      void ctx.actions.renderCharacterSheet(storedCharacter);
    } else {
      void ctx.actions.renderCharacterSheet(FULL_CHARACTER);
    }
  });
}

/**
 * Priority: stored character > default. `stored` is null when the default takes over.
 * Unreadable data is copied to a backup before the default character takes over;
 * it is never deleted here.
 */
async function loadInitialCharacter(): Promise<{ character: Character; stored: Character | null }> {
  const rawStored = await loadRawCharacterState();

  let stored: Character | null = null;
  if (isUnreadableCharacter(rawStored)) {
    await keepUnreadableCharacter(rawStored, {
      saveBackup: saveCorruptedCharacterBackup,
      persistDefault: () => saveCharacterState(FULL_CHARACTER),
      warn: (message, detail) => logger.warn(message, detail),
      reportFailure: reportStorageWriteFailure,
    });
  } else if (rawStored) {
    stored = sanitizeCharacter(rawStored).character;
  }
  return { character: stored ?? FULL_CHARACTER, stored };
}

/** While a kept copy of unreadable data exists, ask what to do with it on every load. */
async function offerKeptUnreadableBackup(): Promise<void> {
  await offerUnreadableBackup({
    loadBackup: loadCorruptedCharacterBackup,
    deleteBackup: deleteCorruptedCharacterBackup,
    download: (filename, content) => downloadTextFile(filename, content, "application/json"),
    showChoice: (handlers) => ModalService.openUnreadableCharacterModal(handlers),
    now: () => new Date(),
  });
}

/**
 * Migrate and reconcile stored versions, create the VersionHistoryService and
 * Version 1 if needed, then initialise VersionState and the navigator.
 */
async function initVersionHistory(
  ctx: AppContext,
  initialCharacter: Character,
  stored: Character | null
): Promise<void> {
  const versionHistory = await getVersionHistory();
  const versions = await versionHistory.getAllVersions();

  // Backfill any stored descriptions still carrying the old hardcoded
  // "Updated character" literal from before detectChanges was wired up.
  // Must complete before VersionState is constructed below so it sees
  // already-migrated descriptions on this same load.
  await migrateLegacyVersionDescriptions(versionHistory, versions);

  // Recover a squash lost to the last unload. Only a stored character counts:
  // the default character was never edited, so it has nothing to recover.
  if (initialCharacter === stored) {
    await reconcileVersionHistory(versionHistory, initialCharacter);
  }

  // Use configured delay if available (for tests), otherwise default 5000ms;
  // use test timer if available (for E2E tests)
  const squashDelay = window.__SQUASH_DELAY_MS__ || 5000;
  ctx.versionHistoryService = new VersionHistoryService(
    versionHistory,
    squashDelay,
    ctx.testTimer || undefined
  );

  // Expose versionHistoryService globally for components to access
  window.__versionHistoryService = ctx.versionHistoryService;

  // Only create initial version if no versions exist yet
  if (versions.length === 0) {
    await versionHistory.saveVersion(initialCharacter, "Initial state");
  }

  ctx.versionState = new VersionState(initialCharacter, versionHistory);
  await ctx.versionState.init();

  // Update navigator after versionState is initialized
  await ctx.actions.updateVersionNavigator(true);
}

/** Boot sequence, run on DOMContentLoaded. */
export async function bootstrap(ctx: AppContext): Promise<void> {
  // Expose storage / version history / autoSaveService APIs for E2E tests
  installTestHooks(ctx);
  registerUnloadFlush(ctx);

  await initI18n();
  registerLanguageChangeRender(ctx);

  const { character: initialCharacter, stored } = await loadInitialCharacter();

  // Register the app-level event listeners once, before the first render
  const appElement = document.getElementById("app");
  if (appElement) {
    registerAppEventListeners(ctx, appElement);
  }

  await ctx.actions.renderCharacterSheet(initialCharacter);
  await offerKeptUnreadableBackup();
  await initVersionHistory(ctx, initialCharacter, stored);
  await initConflictDetection(ctx, initialCharacter);
  registerVersionKeyboardShortcuts(ctx);
}
