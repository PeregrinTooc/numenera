// Events components dispatch to tell the app a character changed

import type { Character } from "@/types/character";

/** Ask the app to auto-save, dispatching from `target` so the event bubbles up to #app. */
export function notifyCharacterUpdated(target: EventTarget, character: Character): void {
  target.dispatchEvent(
    new CustomEvent("character-updated", { detail: character, bubbles: true, composed: true })
  );
}

/**
 * Ask #app to re-render a collection (via `updatedEvent` when the collection has its
 * own targeted event, else `collection-updated`), then to auto-save.
 */
export function notifyCollectionUpdated(section: string, updatedEvent?: string): void {
  const appElement = document.getElementById("app");
  if (!appElement) return;
  appElement.dispatchEvent(
    updatedEvent
      ? new CustomEvent(updatedEvent)
      : new CustomEvent("collection-updated", { detail: { section } })
  );
  appElement.dispatchEvent(new CustomEvent("character-updated"));
}
