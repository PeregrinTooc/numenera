import { describeCharacterChange } from "@/services/versionDescriptions";
import type { SectionId } from "@/types/layout";
import { activeHistoryService, type AppContext } from "./appContext";

const COLLECTION_UPDATED_SECTION_IDS: Record<string, SectionId> = {
  abilities: "abilities",
  specialAbilities: "specialAbilities",
  attacks: "attacks",
  equipment: "items",
  artifacts: "items",
  oddities: "items",
};

function handleCharacterUpdated(ctx: AppContext): void {
  const service = activeHistoryService(ctx);
  if (service && ctx.currentCharacter && ctx.characterBeforeUpdate) {
    if (service.getBufferLength() === 0) {
      service.setInitialState(ctx.characterBeforeUpdate);
    }
    const description = describeCharacterChange(ctx.characterBeforeUpdate, ctx.currentCharacter);
    service.bufferChange(ctx.currentCharacter, description);

    ctx.characterBeforeUpdate = globalThis.structuredClone(ctx.currentCharacter);
  }

  ctx.autoSaveService.requestSave();

  // NOTE: No re-render here - specific event listeners handle rendering:
  // - cyphers-updated for cyphers
  // - collection-updated for other collections
  // This prevents double re-render (flash) when collections are reordered
}

// Registered once: the listeners read the context at fire time. Registering per
// render would stack them (each render builds a new closure that
// removeEventListener cannot match), firing the handler once per prior render.
export function registerAppEventListeners(ctx: AppContext, app: HTMLElement): void {
  app.addEventListener("cyphers-updated", () => {
    ctx.currentSheet?.rerenderSection("cyphers");
  });

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

  // The settings panel lives in the sheet's header
  app.addEventListener("settings-updated", () => {
    ctx.currentSheet?.rerender();
  });
}
