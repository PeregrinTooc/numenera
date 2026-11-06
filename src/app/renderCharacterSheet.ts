import { ensureBodyContainer } from "./bodyContainer";
import { render } from "lit-html";
import { saveCharacterState } from "@/storage/storageFactory";
import { reportStorageWriteFailure } from "@/storage/storageWriteFailure";
import { CharacterSheet } from "@/components/CharacterSheet";
import { FULL_CHARACTER, NEW_CHARACTER } from "@/data/mockCharacters";
import { applyFieldUpdate } from "@/utils/characterFieldUpdate";
import { describeCharacterChange } from "@/services/versionDescriptions";
import { createFileActions } from "./fileActions";
import { syncVersionWarning } from "./versionBanner";
import { activeHistoryService, type AppContext } from "./appContext";
import type { Character } from "@/types/character";

async function handleFieldUpdate(
  ctx: AppContext,
  character: Character,
  field: string,
  value: string | number
): Promise<void> {
  const service = activeHistoryService(ctx);
  if (service && service.getBufferLength() === 0) {
    service.setInitialState(character);
  }

  const conflictService = window.__conflictDetectionService;
  if (conflictService) {
    conflictService.markDirty(character);
  }

  const updatedCharacter = applyFieldUpdate(character, field, value);

  // Update currentCharacter BEFORE requesting auto-save
  ctx.currentCharacter = updatedCharacter;

  if (service) {
    service.bufferChange(updatedCharacter, describeCharacterChange(character, updatedCharacter));
  }

  ctx.autoSaveService.requestSave();

  void renderCharacterSheet(ctx, updatedCharacter, true);
}

export async function renderCharacterSheet(
  ctx: AppContext,
  character: Character,
  skipImmediateSave = false
): Promise<void> {
  const app = document.getElementById("app");
  if (!app) return;

  ctx.currentCharacter = character;

  // Keep VersionState's latestCharacter current so "Return to latest" and the
  // post-squash auto-navigate reflect the session's edits. Skip while viewing a
  // historical version: `character` is that old version's data, not a live edit.
  if (ctx.versionState && !ctx.versionState.isViewingOldVersion()) {
    ctx.versionState.setLatestCharacter(character);
  }

  const needsNewSheet = !ctx.currentSheet || !ctx.currentSheet.isForCharacter(character);

  if (needsNewSheet) {
    const fileActions = createFileActions(ctx, character, app);
    ctx.currentSheet = new CharacterSheet(
      character,
      async () => {
        void renderCharacterSheet(ctx, FULL_CHARACTER);
        await saveCharacterState(FULL_CHARACTER);
      },
      async () => {
        void renderCharacterSheet(ctx, NEW_CHARACTER);
        await saveCharacterState(NEW_CHARACTER);
      },
      fileActions.handleLoadFromFile,
      fileActions.handleExport,
      (field, value) => handleFieldUpdate(ctx, character, field, value),
      fileActions.handleQuickExport,
      fileActions.handleSaveAs
    );
  }

  if (ctx.currentSheet) {
    ctx.currentSheet.setHeaderHasRememberedLocation(ctx.exportManager.hasRememberedLocation());
    ctx.currentSheet.mount(app);
  }

  // Skip immediate save only when explicitly requested (e.g., during field updates that use debounced auto-save)
  if (!skipImmediateSave) {
    // A failed write is reported to the user; the sheet still renders.
    await saveCharacterState(character).catch(reportStorageWriteFailure);
  }

  const indicatorContainer = ensureBodyContainer("save-indicator-container");
  render(ctx.saveIndicator.render(), indicatorContainer);

  syncVersionWarning(ctx);

  // This must happen AFTER rendering but BEFORE any component can dispatch character-updated
  ctx.characterBeforeUpdate = ctx.currentCharacter
    ? globalThis.structuredClone(ctx.currentCharacter)
    : null;
}
