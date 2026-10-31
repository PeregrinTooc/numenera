// CollectionBehavior - Reusable helpers for container components managing collections
// Eliminates duplication across Abilities, Attacks, Cyphers, Items, and SpecialAbilities

import type { TemplateResult } from "lit-html";
import { Character } from "@/types/character";
import { persistCharacterState } from "@/storage/storageFactory";
import { CompletionNotifier } from "@/utils/completionNotifier";
import { readCollection, writeCollection } from "./characterCollections";

/**
 * Dispatch the targeted re-render event for a collection, then character-updated for save.
 */
function dispatchCollectionUpdate(collectionKey: CharacterCollectionKey | undefined): void {
  const appElement = document.getElementById("app");
  if (!appElement) return;
  if (collectionKey === "cyphers") {
    appElement.dispatchEvent(new CustomEvent("cyphers-updated"));
  } else if (collectionKey) {
    appElement.dispatchEvent(
      new CustomEvent("collection-updated", { detail: { section: collectionKey } })
    );
  }
  // Always dispatch character-updated for save
  appElement.dispatchEvent(new CustomEvent("character-updated"));
}

/**
 * Configuration for creating an add handler for a collection
 */
export interface AddHandlerConfig<T, ItemComponent> {
  /** Empty/default item to use for creation */
  emptyItem: T;
  /** Constructor for the item component class */
  ItemComponentClass: new (
    item: T,
    index: number,
    onUpdate?: (updated: T) => void,
    onDelete?: () => void
  ) => ItemComponent;
  /** Collection array to add to (only used for callback-based pattern) */
  collection: T[];
  /** Character reference (for event-based updates) */
  character?: Character;
  /** Key identifying which collection on character to update (required with character) */
  collectionKey?: CharacterCollectionKey;
  /** Callback-based update handler (alternative to character) */
  onUpdate?: (index: number, updated: T) => void;
}

/**
 * Creates a generic add handler for collection items
 * Handles the pattern: create temp item → create temp component → trigger edit → add to collection
 */
export function createAddHandler<T, ItemComponent extends { handleEdit: () => void }>(
  config: AddHandlerConfig<T, ItemComponent>
): () => void {
  return () => {
    const { emptyItem, ItemComponentClass, collection, character, collectionKey, onUpdate } =
      config;

    // Create temporary item component with onUpdate callback that adds to collection
    const tempItem = new ItemComponentClass(emptyItem, -1, (updated: T) => {
      if (character && collectionKey) {
        // Event-based update - IMMUTABLE: create new array with added item
        // Read current collection from character (not captured reference)
        const currentCollection = readCollection<T>(character, collectionKey);
        const newCollection = [...currentCollection, updated];
        writeCollection(character, collectionKey, newCollection);

        // Emit card-added event
        const cardNotifier = new CompletionNotifier("card", {
          data: {
            cardType:
              typeof updated === "object" && updated !== null && "name" in updated && updated.name
                ? "item"
                : "card",
            cardIndex: newCollection.length - 1,
          },
        });
        cardNotifier.emit("added");

        persistCharacterState(character);
        dispatchCollectionUpdate(collectionKey);
      } else {
        // Callback-based update (legacy pattern) - mutate collection
        collection.push(updated);

        // Emit card-added event
        const cardNotifier = new CompletionNotifier("card", {
          data: {
            cardType:
              typeof updated === "object" && updated !== null && "name" in updated && updated.name
                ? "item"
                : "card",
            cardIndex: collection.length - 1,
          },
        });
        cardNotifier.emit("added");

        if (onUpdate) {
          const newIndex = collection.length - 1;
          onUpdate(newIndex, updated);
        }
      }
    });

    // Trigger edit on the temporary item
    tempItem.handleEdit();
  };
}

/** Keys on Character that hold collection arrays */
export type CharacterCollectionKey =
  | "cyphers"
  | "artifacts"
  | "oddities"
  | "equipment"
  | "abilities"
  | "attacks"
  | "specialAbilities";

/**
 * Configuration for creating item instances with update/delete handlers
 */
export interface ItemInstancesConfig<T, ItemComponent> {
  /** Collection array to map */
  collection: T[];
  /** Constructor for the item component class */
  ItemComponentClass: new (
    item: T,
    index: number,
    onUpdate?: (updated: T) => void,
    onDelete?: () => void
  ) => ItemComponent;
  /** Character reference (for event-based updates) */
  character?: Character;
  /** Key identifying which collection on character to update (required with character) */
  collectionKey?: CharacterCollectionKey;
  /** Callback-based update handler (alternative to character) */
  onUpdate?: (index: number, updated: T) => void;
  /** Callback-based delete handler (alternative to character) */
  onDelete?: (index: number) => void;
}

/**
 * Creates item component instances with standardized update/delete handlers
 * Supports both event-based (character) and callback-based update patterns
 *
 * IMPORTANT: When using event-based pattern (character), collectionKey MUST be provided
 * to enable immutable updates. This is critical for version history undo to work correctly.
 */
export function createItemInstances<T, ItemComponent extends { render: () => TemplateResult }>(
  config: ItemInstancesConfig<T, ItemComponent>
): ItemComponent[] {
  const { collection, ItemComponentClass, character, collectionKey, onUpdate, onDelete } = config;

  return collection.map((item, index) => {
    // Determine update handler based on pattern
    const updateHandler = character
      ? // Event-based update pattern (CyphersBox, ItemsBox)
        (updated: T) => {
          // IMMUTABLE UPDATE: Create new array with updated item
          // This ensures version history snapshots don't share array references
          if (collectionKey) {
            const newCollection = [...collection];
            newCollection[index] = updated;
            writeCollection(character, collectionKey, newCollection);
          } else {
            // Fallback to mutation if collectionKey not provided (legacy support)
            collection[index] = updated;
          }

          // Emit card-edited event
          const cardNotifier = new CompletionNotifier("card", {
            data: {
              cardType:
                typeof updated === "object" && updated !== null && "name" in updated && updated.name
                  ? "item"
                  : "card",
              cardIndex: index,
            },
          });
          cardNotifier.emit("edited");

          persistCharacterState(character);
          dispatchCollectionUpdate(collectionKey);
        }
      : onUpdate
        ? // Callback-based update pattern (Abilities, Attacks, SpecialAbilities)
          (updated: T) => {
            // Emit card-edited event
            const cardNotifier = new CompletionNotifier("card", {
              data: {
                cardType:
                  typeof updated === "object" &&
                  updated !== null &&
                  "name" in updated &&
                  updated.name
                    ? "item"
                    : "card",
                cardIndex: index,
              },
            });
            cardNotifier.emit("edited");

            onUpdate(index, updated);
          }
        : undefined;

    // Determine delete handler based on pattern
    const deleteHandler = character
      ? // Event-based delete pattern (CyphersBox, ItemsBox)
        () => {
          // Emit card-deleted event before deletion
          const cardNotifier = new CompletionNotifier("card", {
            data: {
              cardType:
                typeof item === "object" && item !== null && "name" in item && item.name
                  ? "item"
                  : "card",
              cardIndex: index,
            },
          });
          cardNotifier.emit("deleted");

          // IMMUTABLE DELETE: Create new filtered array and assign to character
          // This ensures version history snapshots don't share array references
          const filtered = collection.filter((_, i) => i !== index);
          if (collectionKey) {
            writeCollection(character, collectionKey, filtered);
          } else {
            // Fallback to mutation if collectionKey not provided (legacy support)
            collection.length = 0;
            collection.push(...filtered);
          }

          persistCharacterState(character);
          dispatchCollectionUpdate(collectionKey);
        }
      : onDelete
        ? // Callback-based delete pattern (Abilities, Attacks, SpecialAbilities)
          () => {
            // Emit card-deleted event before deletion
            const cardNotifier = new CompletionNotifier("card", {
              data: {
                cardType:
                  typeof item === "object" && item !== null && "name" in item && item.name
                    ? "item"
                    : "card",
                cardIndex: index,
              },
            });
            cardNotifier.emit("deleted");

            onDelete(index);
          }
        : undefined;

    return new ItemComponentClass(item, index, updateHandler, deleteHandler);
  });
}
