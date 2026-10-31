import {
  loadCharacterState,
  clearCharacterState,
  getVersionHistory,
} from "@/storage/storageFactory";
import { VersionState } from "@/services/versionState";
import { VersionHistoryService } from "@/services/versionHistoryService";
import { ConflictDetectionService } from "@/services/conflictDetectionService";
import { ConflictWarningModal } from "@/components/ConflictWarningModal";
import { FULL_CHARACTER } from "@/data/mockCharacters";
import { initI18n, onLanguageChanged } from "@/i18n/index";
import { isCompleteCharacter } from "@/utils/typeGuards";
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

/** Boot sequence, run on DOMContentLoaded. */
export async function bootstrap(ctx: AppContext): Promise<void> {
  // Expose storage / version history / autoSaveService APIs for E2E tests
  installTestHooks(ctx);

  // Flush a pending debounced save on unload so a last-moment edit is not lost.
  // Best effort: the save is initiated synchronously, but unload cannot await it.
  // pagehide covers mobile Safari / bfcache; a second flush is a no-op.
  const flushAutoSaveOnUnload = (): void => {
    void ctx.autoSaveService.flush();
  };
  window.addEventListener("beforeunload", flushAutoSaveOnUnload);
  window.addEventListener("pagehide", flushAutoSaveOnUnload);

  // Initialize i18n first
  await initI18n();

  // Re-render on language change
  onLanguageChanged(async () => {
    const storedCharacter = await loadCharacterState();
    if (storedCharacter) {
      void ctx.actions.renderCharacterSheet(storedCharacter);
    } else {
      void ctx.actions.renderCharacterSheet(FULL_CHARACTER);
    }
  });

  // Priority: localStorage > default
  const storedCharacter = await loadCharacterState();

  // Select and render initial character data
  // Validate that stored character has required structure
  let initialCharacter = FULL_CHARACTER;
  if (isCompleteCharacter(storedCharacter)) {
    initialCharacter = storedCharacter;
  } else if (storedCharacter) {
    console.warn("Stored character data is incomplete or corrupted, using default character");
    // Clear the corrupted data
    await clearCharacterState();
  }

  // Register the app-level event listeners once, before the first render
  const appElement = document.getElementById("app");
  if (appElement) {
    registerAppEventListeners(ctx, appElement);
  }

  // Render the initial character sheet
  await ctx.actions.renderCharacterSheet(initialCharacter);

  // Save the initial state as Version 1
  const versionHistory = await getVersionHistory();
  const versions = await versionHistory.getAllVersions();

  // Backfill any stored descriptions still carrying the old hardcoded
  // "Updated character" literal from before detectChanges was wired up.
  // Must complete before VersionState is constructed below so it sees
  // already-migrated descriptions on this same load.
  await migrateLegacyVersionDescriptions(versionHistory, versions);

  // Recover a squash lost to the last unload. Only a stored character counts:
  // the default character was never edited, so it has nothing to recover.
  if (initialCharacter === storedCharacter) {
    await reconcileVersionHistory(versionHistory, initialCharacter);
  }

  // Initialize VersionHistoryService
  // Use configured delay if available (for tests), otherwise default 5000ms
  const squashDelay = (typeof window !== "undefined" && window.__SQUASH_DELAY_MS__) || 5000;

  // Use test timer if available (for E2E tests)
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

  // Initialize VersionState
  ctx.versionState = new VersionState(initialCharacter, versionHistory);
  await ctx.versionState.init();

  // Update navigator after versionState is initialized
  await ctx.actions.updateVersionNavigator(true);

  await initConflictDetection(ctx, initialCharacter);

  registerVersionKeyboardShortcuts(ctx);
}
