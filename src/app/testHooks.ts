import {
  saveCharacterState,
  loadCharacterState,
  clearCharacterState,
  getVersionHistory,
  loadCorruptedCharacterBackup,
} from "@/storage/storageFactory";
import type { AppContext } from "./appContext";
import type { Character } from "@/types/character";
import type { CharacterVersion } from "@/types/versionHistory";
import type { VersionHistoryService } from "@/services/versionHistoryService";
import type { ConflictDetectionService } from "@/services/conflictDetectionService";
import type { TestTimer } from "@/services/testTimer";
import type { AutoSaveService } from "@/services/autoSaveService";

declare global {
  interface Window {
    __testStorage?: {
      saveCharacterState: typeof saveCharacterState;
      loadCharacterState: typeof loadCharacterState;
      clearCharacterState: () => Promise<void>;
      loadCorruptedCharacterBackup: typeof loadCorruptedCharacterBackup;
    };
    __testVersionHistory?: {
      createVersions: (versions: { character: Character; description: string }[]) => Promise<void>;
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
    loadCorruptedCharacterBackup,
    clearCharacterState: async () => {
      localStorage.clear();
      // Through the real adapter, so whichever backend is active (IndexedDB or
      // the localStorage fallback) is the one cleared.
      await clearCharacterState();
    },
  };

  window.__testVersionHistory = {
    createVersions: async (versions) => {
      const versionHistory = await getVersionHistory();
      for (const { character, description } of versions) {
        await versionHistory.saveVersion(character, description);
      }
      await ctx.actions.updateVersionNavigator(true);
    },
    getAllVersions: async () => {
      const versionHistory = await getVersionHistory();
      return await versionHistory.getAllVersions();
    },
    clearVersions: async () => {
      const versionHistory = await getVersionHistory();
      await versionHistory.clear();

      await ctx.actions.updateVersionNavigator(true);
    },
  };

  window.__autoSaveService = ctx.autoSaveService;
}
