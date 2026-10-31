import { render } from "lit-html";
import { saveCharacterState } from "@/storage/storageFactory";
import { reportStorageWriteFailure } from "@/storage/storageWriteFailure";
import { CharacterSheet } from "@/components/CharacterSheet";
import { FULL_CHARACTER, NEW_CHARACTER } from "@/data/mockCharacters";
import { applyFieldUpdate } from "@/utils/characterFieldUpdate";
import { createFileActions } from "./fileActions";
import { syncVersionWarning } from "./versionBanner";
import type { AppContext } from "./appContext";
import type { Character } from "@/types/character";

// Handler for field updates
async function handleFieldUpdate(
  ctx: AppContext,
  character: Character,
  field: string,
  value: string | number
): Promise<void> {
  // Set initial state before first edit (if buffer is empty and no initial state set)
  const service = window.__versionHistoryService || ctx.versionHistoryService;
  if (service && service.getBufferLength() === 0) {
    service.setInitialState(character);
  }

  // Mark as dirty for conflict detection (before making changes)
  const conflictService = window.__conflictDetectionService;
  if (conflictService) {
    conflictService.markDirty(character);
  }

  // Update the character object
  const { character: updatedCharacter, label: fieldLabel } = applyFieldUpdate(
    character,
    field,
    value
  );

  // Update currentCharacter BEFORE requesting auto-save
  ctx.currentCharacter = updatedCharacter;

  // Buffer change for version history with smart squashing
  if (service) {
    service.bufferChange(updatedCharacter, fieldLabel);
  }

  // Request auto-save (debounced) - will now save the updated character
  ctx.autoSaveService.requestSave();

  // Re-render with updated character (skip immediate save since we're using debounced auto-save)
  void renderCharacterSheet(ctx, updatedCharacter, true);
}

// Render the character sheet with the given character data
export async function renderCharacterSheet(
  ctx: AppContext,
  character: Character,
  skipImmediateSave = false
): Promise<void> {
  const app = document.getElementById("app");
  if (!app) return;

  // Update current character for auto-save
  ctx.currentCharacter = character;

  // Keep VersionState's latestCharacter current so "Return to latest" and
  // the post-squash auto-navigate reflect the session's edits instead of
  // falling back to the character loaded at page load (setLatestCharacter
  // otherwise has no call sites). Skip while viewing a historical version -
  // `character` here is that old version's data, not a live edit.
  if (ctx.versionState && !ctx.versionState.isViewingOldVersion()) {
    ctx.versionState.setLatestCharacter(character);
  }

  // Create new sheet only if we don't have one yet, or if it's a different character
  // (e.g., Load or New button clicked)
  const needsNewSheet = !ctx.currentSheet || !ctx.currentSheet.isForCharacter(character);

  if (needsNewSheet) {
    const fileActions = createFileActions(ctx, character, app);
    ctx.currentSheet = new CharacterSheet(
      character,
      async () => {
        void renderCharacterSheet(ctx, FULL_CHARACTER);
        // Save immediately when loading a character
        await saveCharacterState(FULL_CHARACTER);
      },
      async () => {
        void renderCharacterSheet(ctx, NEW_CHARACTER);
        // Save immediately when creating new character
        await saveCharacterState(NEW_CHARACTER);
      },
      fileActions.handleLoadFromFile,
      fileActions.handleExport,
      (field, value) => handleFieldUpdate(ctx, character, field, value),
      fileActions.handleQuickExport,
      fileActions.handleSaveAs
    );
  }

  // Update header with current export manager state
  if (ctx.currentSheet) {
    ctx.currentSheet.setHeaderHasRememberedLocation(ctx.exportManager.hasRememberedLocation());
    ctx.currentSheet.mount(app);
  }

  // Save character state to localStorage after rendering
  // Skip immediate save only when explicitly requested (e.g., during field updates that use debounced auto-save)
  if (!skipImmediateSave) {
    // A failed write is reported to the user; the sheet still renders.
    await saveCharacterState(character).catch(reportStorageWriteFailure);
  }

  // Render save indicator in separate container
  let indicatorContainer = document.getElementById("save-indicator-container");
  if (!indicatorContainer) {
    indicatorContainer = document.createElement("div");
    indicatorContainer.id = "save-indicator-container";
    document.body.appendChild(indicatorContainer);
  }
  render(ctx.saveIndicator.render(), indicatorContainer);

  // Request auto-save (debounced) - initial render doesn't trigger save
  // Only subsequent changes will trigger auto-save

  // Handle version warning banner and read-only mode
  syncVersionWarning(ctx);

  // Update the global BEFORE state for version history tracking
  // This must happen AFTER rendering but BEFORE any component can dispatch character-updated
  ctx.characterBeforeUpdate = ctx.currentCharacter
    ? globalThis.structuredClone(ctx.currentCharacter)
    : null;
}
