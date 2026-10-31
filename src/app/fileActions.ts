import { importCharacterFromFile } from "@/storage/fileStorage";
import { t } from "@/i18n/index";
import { describeError } from "@/utils/describeError";
import type { AppContext } from "./appContext";
import type { Character } from "@/types/character";

export interface FileActions {
  handleLoadFromFile: () => Promise<void>;
  handleExport: () => Promise<void>;
  handleQuickExport: () => Promise<void>;
  handleSaveAs: () => Promise<void>;
}

/** Import / export handlers for the sheet header, bound to the character being rendered. */
export function createFileActions(
  ctx: AppContext,
  character: Character,
  app: HTMLElement
): FileActions {
  // Helper to update header button state after export operations
  const updateHeaderButtonState = (): void => {
    if (ctx.currentSheet) {
      ctx.currentSheet.setHeaderHasRememberedLocation(ctx.exportManager.hasRememberedLocation());
      // Trigger re-render to show new buttons
      ctx.currentSheet.mount(app);
    }
  };

  return {
    // Handler for importing character from file
    handleLoadFromFile: async (): Promise<void> => {
      try {
        const importResult = await importCharacterFromFile();
        if (importResult) {
          const { character: importedCharacter, warnings } = importResult;

          // Log any warnings from sanitization
          if (warnings.length > 0) {
            console.warn("Character import warnings:", warnings);
            // Show warning to user if there were significant corrections
            const warningMessage =
              warnings.length === 1
                ? t("fileOperations.importNote", { warning: warnings[0] })
                : t("fileOperations.importAdjustments", { count: warnings.length });
            // Use setTimeout to avoid blocking the import
            setTimeout(() => alert(warningMessage), 100);
          }

          // Buffer change for version history
          const service = window.__versionHistoryService || ctx.versionHistoryService;
          if (service) {
            service.bufferChange(importedCharacter, "Imported character");
          }

          void ctx.actions.renderCharacterSheet(importedCharacter);
        }
        // If null, user cancelled - do nothing
      } catch (error) {
        console.error("Error importing character:", error);
        alert(t("fileOperations.importFailed", { reason: describeError(error) }));
      }
    },

    // Handler for first export (or fallback for non-Chromium)
    handleExport: async (): Promise<void> => {
      try {
        await ctx.exportManager.export(character);
        updateHeaderButtonState();
      } catch (error) {
        console.error("Error exporting character:", error);
        alert(t("fileOperations.exportFailed", { reason: describeError(error) }));
      }
    },

    // Handler for Quick Export
    handleQuickExport: async (): Promise<void> => {
      try {
        await ctx.exportManager.quickExport(character);
        // Success feedback is handled by export-success event
      } catch (error) {
        console.error("Error in quick export:", error);
        alert(t("fileOperations.saveFailed", { reason: describeError(error) }));
      }
    },

    // Handler for Save As
    handleSaveAs: async (): Promise<void> => {
      try {
        await ctx.exportManager.saveAs(character);
        updateHeaderButtonState();
      } catch (error) {
        console.error("Error in save as:", error);
        alert(t("fileOperations.saveFailed", { reason: describeError(error) }));
      }
    },
  };
}
