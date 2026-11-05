import { importCharacterFromFile } from "@/storage/fileStorage";
import { t } from "@/i18n/index";
import { describeError } from "@/utils/describeError";
import { activeHistoryService, type AppContext } from "./appContext";
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
  const updateHeaderButtonState = (): void => {
    if (ctx.currentSheet) {
      ctx.currentSheet.setHeaderHasRememberedLocation(ctx.exportManager.hasRememberedLocation());
      ctx.currentSheet.mount(app);
    }
  };

  return {
    handleLoadFromFile: () =>
      runFileOp(
        async () => {
          const importResult = await importCharacterFromFile();
          if (!importResult) return;

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
          activeHistoryService(ctx)?.bufferChange(importedCharacter, "Imported character");

          void ctx.actions.renderCharacterSheet(importedCharacter);
        },
        "Error importing character:",
        "fileOperations.importFailed"
      ),

    handleExport: () =>
      runFileOp(
        () => ctx.exportManager.export(character),
        "Error exporting character:",
        "fileOperations.exportFailed",
        updateHeaderButtonState
      ),

    // Handler for Quick Export (success feedback is handled by the export-success event)
    handleQuickExport: () =>
      runFileOp(
        () => ctx.exportManager.quickExport(character),
        "Error in quick export:",
        "fileOperations.saveFailed"
      ),

    handleSaveAs: () =>
      runFileOp(
        () => ctx.exportManager.saveAs(character),
        "Error in save as:",
        "fileOperations.saveFailed",
        updateHeaderButtonState
      ),
  };
}

/** Run a file operation, alerting the user with the translated `errorKey` if it fails. */
async function runFileOp(
  operation: () => Promise<unknown>,
  logMessage: string,
  errorKey: string,
  afterSuccess?: () => void
): Promise<void> {
  try {
    await operation();
    afterSuccess?.();
  } catch (error) {
    console.error(logMessage, error);
    alert(t(errorKey, { reason: describeError(error) }));
  }
}
