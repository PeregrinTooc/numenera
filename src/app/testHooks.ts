import {
  saveCharacterState,
  loadCharacterState,
  clearCharacterState,
  getVersionHistory,
} from "@/storage/storageFactory";
import type { AppContext } from "./appContext";
import type { Character } from "@/types/character";
import type { CharacterVersion } from "@/types/versionHistory";
import type { VersionHistoryService } from "@/services/versionHistoryService";
import type { ConflictDetectionService } from "@/services/conflictDetectionService";
import type { TestTimer } from "@/services/testTimer";
import type { AutoSaveService } from "@/services/autoSaveService";

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
      getAllVersions: () => Promise<CharacterVersion[]>;
      clearVersions: () => Promise<void>;
    };
    __versionHistoryService?: VersionHistoryService | null;
    __conflictDetectionService?: ConflictDetectionService | null;
    __testTimer?: TestTimer;
    __autoSaveService?: AutoSaveService;
    /** E2E hook: overrides the version-history squash delay (ms). */
    __SQUASH_DELAY_MS__?: number;
  }
}

/** Expose storage, version-history and auto-save APIs for E2E tests (dev and production). */
export function installTestHooks(ctx: AppContext): void {
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

  window.__testVersionHistory = {
    createVersion: async (character: Character, description: string) => {
      const versionHistory = await getVersionHistory();
      await versionHistory.saveVersion(character, description);
      // Update the version navigator after creating a version (reload to get new version)
      await ctx.actions.updateVersionNavigator(true);
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
      await ctx.actions.updateVersionNavigator(true);
    },
  };

  window.__autoSaveService = ctx.autoSaveService;
}
