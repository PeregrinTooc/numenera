import { ensureBodyContainer } from "./bodyContainer";
import { VersionNavigator } from "@/components/VersionNavigator";
import { loadComparisonViewEnabled } from "@/storage/comparisonViewPreference";
import { isPhoneViewport } from "@/utils/viewport";
import { openCompareView } from "./compareViewController";
import type { AppContext } from "./appContext";

/**
 * Show the character `versionState` currently displays on a brand-new sheet.
 * Clearing `currentSheet` forces a fresh CharacterSheet for that character.
 */
async function showDisplayedVersion(ctx: AppContext, freshSheet: boolean): Promise<void> {
  if (!ctx.versionState) return;
  const displayedCharacter = ctx.versionState.getDisplayedCharacter();

  if (freshSheet) {
    ctx.currentSheet = null;
    ctx.currentCharacter = displayedCharacter;
  }

  await ctx.actions.renderCharacterSheet(displayedCharacter, true);

  await ctx.actions.updateVersionNavigator(false);
}

export async function updateVersionNavigator(ctx: AppContext, shouldReload = false): Promise<void> {
  const versionState = ctx.versionState;
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

  const handleNavigateBackward = async (): Promise<void> => {
    if (!ctx.versionState) return;

    // Comparison View is opt-in (settings) and unavailable on phone-width
    // viewports (two full sheets side by side don't fit there) - falls
    // back to the single-pane flow below in either of those cases. It
    // deliberately never calls versionState.navigateBackward()/reads
    // displayedCharacter, so opening/closing it never disturbs this
    // single-pane position.
    if (loadComparisonViewEnabled() && !isPhoneViewport()) {
      openCompareView(ctx);
      return;
    }

    await ctx.versionState.navigateBackward();
    await showDisplayedVersion(ctx, true);
  };

  const handleNavigateForward = async (): Promise<void> => {
    if (!ctx.versionState) return;
    await ctx.versionState.navigateForward();
    await showDisplayedVersion(ctx, true);
  };

  const options = {
    versionCount,
    currentIndex,
    onNavigateBackward: handleNavigateBackward,
    onNavigateForward: handleNavigateForward,
  };

  if (!ctx.versionNavigator) {
    ctx.versionNavigator = new VersionNavigator(options);

    const navigatorContainer = ensureBodyContainer("version-navigator-container");
    ctx.versionNavigator.mount(navigatorContainer);
  } else {
    ctx.versionNavigator.update(options);
  }
}

export function registerVersionSquashedListener(ctx: AppContext): void {
  window.addEventListener("version-squashed", async () => {
    const versionState = ctx.versionState;
    if (versionState) {
      const wasViewingOld = versionState.isViewingOldVersion();
      await versionState.reload();

      if (wasViewingOld) {
        versionState.restoreToLatest();
        const latestCharacter = versionState.getLatestCharacter();
        await ctx.actions.renderCharacterSheet(latestCharacter, true);
      }

      await ctx.actions.updateVersionNavigator(true);
    }
  });
}

async function handleUndo(ctx: AppContext): Promise<void> {
  const versionState = ctx.versionState;
  if (!versionState) return;

  if (ctx.versionHistoryService && ctx.versionHistoryService.canUndo()) {
    const previousState = ctx.versionHistoryService.undo();
    if (previousState) {
      ctx.currentSheet = null;

      // Update currentCharacter BEFORE rendering
      ctx.currentCharacter = previousState;

      await ctx.actions.renderCharacterSheet(previousState, true);
    }
    return;
  }

  if (versionState.getCurrentVersionIndex() > 0) {
    await versionState.navigateBackward();
    await showDisplayedVersion(ctx, false);
  }
}

async function handleRedo(ctx: AppContext): Promise<void> {
  const versionState = ctx.versionState;
  if (!versionState) return;

  if (ctx.versionHistoryService && ctx.versionHistoryService.canRedo()) {
    const redoneState = ctx.versionHistoryService.redo();
    if (redoneState) {
      ctx.currentSheet = null;

      // Update currentCharacter before rendering
      ctx.currentCharacter = redoneState;

      // Render the redo'd state (this will update characterBeforeUpdate)
      await ctx.actions.renderCharacterSheet(redoneState, true);

      ctx.autoSaveService.requestSave();
    }
    return;
  }

  if (versionState.isViewingOldVersion()) {
    await versionState.navigateForward();
    await showDisplayedVersion(ctx, false);
  }
}

export function registerVersionKeyboardShortcuts(ctx: AppContext): void {
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

    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      await handleUndo(ctx);
    }

    if (
      ((e.ctrlKey || e.metaKey) && e.key === "y") ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
    ) {
      e.preventDefault();
      await handleRedo(ctx);
    }
  });
}
