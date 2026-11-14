import { importCharacterFromFile, type ImportResult } from "@/storage/fileStorage";
import { ModalService } from "@/services/modalService";
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

/**
 * Show a character from a file. Warnings and the layout prompt wait until it
 * has rendered; alert() blocks, so the prompt opens once the warning is closed.
 */
async function importCharacter(ctx: AppContext): Promise<void> {
  const result = await importCharacterFromFile();
  if (!result) return;

  activeHistoryService(ctx)?.bufferChange(result.character, "versionHistory.changes.imported");
  void ctx.actions.renderCharacterSheet(result.character);

  ctx.clock.setTimeout(() => {
    showImportWarnings(result.warnings);
    if (result.hasLayoutDifference) offerImportedLayout(ctx, result);
  }, 100);
}

function showImportWarnings(warnings: string[]): void {
  if (warnings.length === 0) return;
  console.warn("Character import warnings:", warnings);
  alert(
    warnings.length === 1
      ? t("fileOperations.importNote", { warning: warnings[0] })
      : t("fileOperations.importAdjustments", { count: warnings.length })
  );
}

function offerImportedLayout(ctx: AppContext, result: ImportResult): void {
  ModalService.openLayoutChoiceModal({
    onKeep: () => undefined,
    onUseImported: () => ctx.currentSheet?.useLayout(result.layout, result.sectionColumns),
  });
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
        () => importCharacter(ctx),
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
