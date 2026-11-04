import { ensureBodyContainer } from "./bodyContainer";
import { VersionWarningBanner } from "@/components/VersionWarningBanner";
import type { AppContext } from "./appContext";

/** Sync the old-version warning banner and the sheet's import-button state with `versionState`. */
export function syncVersionWarning(ctx: AppContext): void {
  const versionState = ctx.versionState;
  if (!versionState) return;

  const isViewingOldVersion = versionState.isViewingOldVersion();

  if (ctx.currentSheet) {
    ctx.currentSheet.setIsViewingOldVersion(isViewingOldVersion);
  }

  const bannerContainer = ensureBodyContainer("version-warning-banner-container");

  if (isViewingOldVersion) {
    const metadata = versionState.getCurrentVersionMetadata();
    if (metadata) {
      const options = {
        description: metadata.description,
        timestamp: metadata.timestamp,
        onReturn: async (): Promise<void> => {
          if (!ctx.versionState) return;
          ctx.versionState.restoreToLatest();
          const latestCharacter = ctx.versionState.getLatestCharacter();
          await ctx.actions.renderCharacterSheet(latestCharacter, true);
          await ctx.actions.updateVersionNavigator(false);
        },
        onRestore: async (): Promise<void> => {
          if (!ctx.versionState) return;
          await ctx.versionState.restoreCurrentVersion();
          const latestCharacter = ctx.versionState.getLatestCharacter();
          await ctx.actions.renderCharacterSheet(latestCharacter, true);
          await ctx.actions.updateVersionNavigator(true);
        },
      };
      if (!ctx.versionWarningBanner) {
        ctx.versionWarningBanner = new VersionWarningBanner(options);
        ctx.versionWarningBanner.mount(bannerContainer);
      } else {
        ctx.versionWarningBanner.update(options);
      }
    }
  } else {
    if (ctx.versionWarningBanner) {
      ctx.versionWarningBanner.unmount();
      ctx.versionWarningBanner = null;
    }
  }
}
