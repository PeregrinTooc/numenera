import { VersionWarningBanner } from "@/components/VersionWarningBanner";
import type { AppContext } from "./appContext";

/** Sync the old-version warning banner and the sheet's import-button state with `versionState`. */
export function syncVersionWarning(ctx: AppContext): void {
  const versionState = ctx.versionState;
  if (!versionState) return;

  const isViewingOldVersion = versionState.isViewingOldVersion();

  // Update import button state based on viewing mode
  if (ctx.currentSheet) {
    ctx.currentSheet.setIsViewingOldVersion(isViewingOldVersion);
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
      const options = {
        description: metadata.description,
        timestamp: metadata.timestamp,
        onReturn: async (): Promise<void> => {
          if (!ctx.versionState) return;
          // Navigate to latest version without creating new version
          ctx.versionState.restoreToLatest();
          const latestCharacter = ctx.versionState.getLatestCharacter();
          await ctx.actions.renderCharacterSheet(latestCharacter, true);
          await ctx.actions.updateVersionNavigator(false); // Don't reload, just update UI
        },
        onRestore: async (): Promise<void> => {
          if (!ctx.versionState) return;
          // Restore the current old version by saving it as new latest
          await ctx.versionState.restoreCurrentVersion();
          const latestCharacter = ctx.versionState.getLatestCharacter();
          await ctx.actions.renderCharacterSheet(latestCharacter, true);
          await ctx.actions.updateVersionNavigator(true); // Reload to show new version
        },
      };
      if (!ctx.versionWarningBanner) {
        ctx.versionWarningBanner = new VersionWarningBanner(options);
        ctx.versionWarningBanner.mount(bannerContainer);
      } else {
        ctx.versionWarningBanner.update(options);
      }
    }
    // Note: No read-only mode - user can edit from any version, which auto-navigates to latest
  } else {
    // Remove warning banner if it exists
    if (ctx.versionWarningBanner) {
      ctx.versionWarningBanner.unmount();
      ctx.versionWarningBanner = null;
    }
  }
}
