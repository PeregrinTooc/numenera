import { describeCharacterChange } from "@/services/versionDescriptions";
import type { SectionId } from "@/types/layout";
import type { AppContext } from "./appContext";

const COLLECTION_UPDATED_SECTION_IDS: Record<string, SectionId> = {
  abilities: "abilities",
  specialAbilities: "specialAbilities",
  attacks: "attacks",
  equipment: "items",
  artifacts: "items",
  oddities: "items",
};

// Listen for character-updated events and trigger auto-save
// Re-rendering is handled by specific event listeners:
// - cyphers-updated for cyphers
// - collection-updated for abilities, specialAbilities, attacks, equipment, artifacts, oddities
// - recovery-updated for recovery modifier
function handleCharacterUpdated(ctx: AppContext): void {
  // Buffer the change for version history (for card operations, etc.)
  const service = window.__versionHistoryService || ctx.versionHistoryService;
  if (service && ctx.currentCharacter && ctx.characterBeforeUpdate) {
    // Set initial state before first edit if buffer is empty
    if (service.getBufferLength() === 0) {
      service.setInitialState(ctx.characterBeforeUpdate);
    }
    const description = describeCharacterChange(ctx.characterBeforeUpdate, ctx.currentCharacter);
    service.bufferChange(ctx.currentCharacter, description);

    // Update the BEFORE state for the next change
    ctx.characterBeforeUpdate = globalThis.structuredClone(ctx.currentCharacter);
  }

  // Trigger auto-save when character is updated
  ctx.autoSaveService.requestSave();

  // NOTE: No re-render here - specific event listeners handle rendering:
  // - cyphers-updated for cyphers
  // - collection-updated for other collections
  // This prevents double re-render (flash) when collections are reordered
}

// Register the four app-level listeners exactly once. They read
// currentSheet/currentCharacter/etc. from the context at fire time, so a
// single registration handles every render — no per-render re-registration
// needed (and no accumulation: registering inside renderCharacterSheet, once
// per render, built a new closure each time whose removeEventListener call
// could never match a previously-added one, so listeners piled up and a
// single event dispatch fired the handler once per prior render).
export function registerAppEventListeners(ctx: AppContext, app: HTMLElement): void {
  // Targeted cypher re-render
  app.addEventListener("cyphers-updated", () => {
    ctx.currentSheet?.rerenderSection("cyphers");
  });

  // Targeted re-render of the updated collection's section
  app.addEventListener("collection-updated", (e: Event) => {
    const customEvent = e as CustomEvent<{ section: string }>;
    const sectionName = customEvent.detail?.section;
    const sectionId = sectionName ? COLLECTION_UPDATED_SECTION_IDS[sectionName] : undefined;
    if (sectionId) {
      ctx.currentSheet?.rerenderSection(sectionId);
    }
  });

  // RecoveryRolls has no host of its own, so the whole sheet is re-rendered;
  // lit-html diffs, so only changed bindings move.
  app.addEventListener("recovery-updated", () => {
    ctx.currentSheet?.rerender();
  });

  app.addEventListener("character-updated", () => handleCharacterUpdated(ctx));
}
