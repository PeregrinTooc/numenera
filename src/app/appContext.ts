import { ExportManager } from "@/storage/exportManager";
import { AutoSaveService } from "@/services/autoSaveService";
import { SaveIndicator } from "@/components/SaveIndicator";
import { saveCharacterState } from "@/storage/storageFactory";
import type { CharacterSheet } from "@/components/CharacterSheet";
import type { VersionNavigator } from "@/components/VersionNavigator";
import type { VersionWarningBanner } from "@/components/VersionWarningBanner";
import type { CompareView } from "@/components/CompareView";
import type { VersionState } from "@/services/versionState";
import type { VersionHistoryService } from "@/services/versionHistoryService";
import { SystemClock, type Clock } from "@/services/clock";
import type { Character } from "@/types/character";

/**
 * Cross-module calls that would otherwise form import cycles
 * (rendering <-> version navigation). `main.ts` wires the real functions in.
 */
export interface AppActions {
  renderCharacterSheet: (character: Character, skipImmediateSave?: boolean) => Promise<void>;
  updateVersionNavigator: (shouldReload?: boolean) => Promise<void>;
}

/**
 * All mutable application state, created once in `main.ts` and passed to the
 * `src/app/` modules. Extracted modules never import `main.ts`.
 */
export interface AppContext {
  /** Sheet instance, kept across re-renders to preserve its state. */
  currentSheet: CharacterSheet | null;
  /** Character shown right now; what auto-save persists. */
  currentCharacter: Character | null;
  /** Snapshot taken after each render, the "before" side of version-history diffs. */
  characterBeforeUpdate: Character | null;
  versionState: VersionState | null;
  versionHistoryService: VersionHistoryService | null;
  versionNavigator: VersionNavigator | null;
  versionWarningBanner: VersionWarningBanner | null;
  /** Comparison View overlay, opt-in via settings. */
  compareView: CompareView | null;
  readonly exportManager: ExportManager;
  /** The one source of time for the app's services. */
  readonly clock: Clock;
  readonly autoSaveService: AutoSaveService;
  readonly saveIndicator: SaveIndicator;
  /** E2E-installed clock for the squash timer only, so it never fires on its own. */
  readonly testTimer: Clock | undefined;
  actions: AppActions;
}

function notWired(): Promise<void> {
  return Promise.reject(new Error("AppContext.actions has not been wired"));
}

export function createAppContext(): AppContext {
  // Tests can set window.__testTimer before DOMContentLoaded
  const testTimer = window.__testTimer;
  const clock = new SystemClock();

  const ctx: AppContext = {
    currentSheet: null,
    currentCharacter: null,
    characterBeforeUpdate: null,
    versionState: null,
    versionHistoryService: null,
    versionNavigator: null,
    versionWarningBanner: null,
    compareView: null,
    exportManager: new ExportManager(clock),
    clock,
    autoSaveService: new AutoSaveService(async () => {
      if (ctx.currentCharacter) {
        await saveCharacterState(ctx.currentCharacter);
      }
    }, clock),
    saveIndicator: new SaveIndicator(),
    testTimer,
    actions: { renderCharacterSheet: notWired, updateVersionNavigator: notWired },
  };
  return ctx;
}

/** The version-history service tests/e2e install on window, else the one this app created. */
export function activeHistoryService(ctx: AppContext): VersionHistoryService | null | undefined {
  return window.__versionHistoryService || ctx.versionHistoryService;
}
