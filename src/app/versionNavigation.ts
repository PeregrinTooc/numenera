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

  // Update navigator UI without reloading
  await ctx.actions.updateVersionNavigator(false);
}

// Update version navigator based on current version history state
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

  // Navigation handlers
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
    // Create version navigator on first update
    ctx.versionNavigator = new VersionNavigator(options);

    // Mount in dedicated container (similar to SaveIndicator pattern)
    let navigatorContainer = document.getElementById("version-navigator-container");
    if (!navigatorContainer) {
      navigatorContainer = document.createElement("div");
      navigatorContainer.id = "version-navigator-container";
      document.body.appendChild(navigatorContainer);
    }
    ctx.versionNavigator.mount(navigatorContainer);
  } else {
    // Update existing navigator
    ctx.versionNavigator.update(options);
  }
}

// Listen for version-squashed events to update version navigator
export function registerVersionSquashedListener(ctx: AppContext): void {
  window.addEventListener("version-squashed", async () => {
    const versionState = ctx.versionState;
    if (versionState) {
      const wasViewingOld = versionState.isViewingOldVersion();
      await versionState.reload();

      // If we were viewing an old version when we edited, navigate to the new latest
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

  // Check buffer state first (before squash undo/redo takes precedence)
  if (ctx.versionHistoryService && ctx.versionHistoryService.canUndo()) {
    // Undo in buffer (before squash)
    const previousState = ctx.versionHistoryService.undo();
    if (previousState) {
      // Force a fresh render by clearing the currentSheet
      // This ensures a new CharacterSheet is created with the correct character
      ctx.currentSheet = null;

      // Update currentCharacter BEFORE rendering
      ctx.currentCharacter = previousState;

      await ctx.actions.renderCharacterSheet(previousState, true);
    }
    return;
  }

  // Otherwise, navigate backward through saved versions (after squash)
  if (versionState.getCurrentVersionIndex() > 0) {
    await versionState.navigateBackward();
    // Re-render with the previous version
    await showDisplayedVersion(ctx, false);
  }
}

async function handleRedo(ctx: AppContext): Promise<void> {
  const versionState = ctx.versionState;
  if (!versionState) return;

  // Check buffer state first (before squash redo takes precedence)
  if (ctx.versionHistoryService && ctx.versionHistoryService.canRedo()) {
    // Redo in buffer (before squash)
    const redoneState = ctx.versionHistoryService.redo();
    if (redoneState) {
      // Force a fresh render by clearing the currentSheet
      ctx.currentSheet = null;

      // Update currentCharacter before rendering
      ctx.currentCharacter = redoneState;

      // Render the redo'd state (this will update characterBeforeUpdate)
      await ctx.actions.renderCharacterSheet(redoneState, true);

      // Request auto-save to persist the redo'd state to localStorage
      ctx.autoSaveService.requestSave();
    }
    return;
  }

  // Otherwise, navigate forward through saved versions (after squash)
  if (versionState.isViewingOldVersion()) {
    await versionState.navigateForward();
    // Re-render with the next version
    await showDisplayedVersion(ctx, false);
  }
}

// Add keyboard shortcuts for version navigation (Ctrl+Z for undo, Ctrl+Y for redo)
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

    // Handle Ctrl+Z or Cmd+Z (Undo)
    if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
      e.preventDefault();
      await handleUndo(ctx);
    }

    // Handle Ctrl+Y, Cmd+Y, or Ctrl+Shift+Z (Redo)
    if (
      ((e.ctrlKey || e.metaKey) && e.key === "y") ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
    ) {
      e.preventDefault();
      await handleRedo(ctx);
    }
  });
}
