// CollectionBehavior - Reusable helpers for container components managing collections
// Eliminates duplication across Abilities, Attacks, Cyphers, Items, and SpecialAbilities

import type { TemplateResult } from "lit-html";
import { Character } from "@/types/character";
import { persistCharacterState } from "@/storage/storageFactory";
import { readCollection, writeCollection } from "./characterCollections";

/** Keys on Character that hold collection arrays */
export type CharacterCollectionKey =
  | "cyphers"
  | "artifacts"
  | "oddities"
  | "equipment"
  | "abilities"
  | "attacks"
  | "specialAbilities";

type ItemComponentConstructor<T, ItemComponent> = new (
  item: T,
  index: number,
  onUpdate?: (updated: T) => void,
  onDelete?: () => void
) => ItemComponent;

/**
 * Dispatch the targeted re-render event for a collection, then character-updated for save.
 */
function dispatchCollectionUpdate(collectionKey: CharacterCollectionKey): void {
  const appElement = document.getElementById("app");
  if (!appElement) return;
  if (collectionKey === "cyphers") {
    appElement.dispatchEvent(new CustomEvent("cyphers-updated"));
  } else {
    appElement.dispatchEvent(
      new CustomEvent("collection-updated", { detail: { section: collectionKey } })
    );
  }
  appElement.dispatchEvent(new CustomEvent("character-updated"));
}

/**
 * Configuration for creating an add handler for a collection
 */
export interface AddHandlerConfig<T, ItemComponent> {
  /** Empty/default item to use for creation */
  emptyItem: T;
  /** Constructor for the item component class */
  ItemComponentClass: ItemComponentConstructor<T, ItemComponent>;
  /** Character whose collection is updated */
  character: Character;
  /** Key identifying which collection on character to update */
  collectionKey: CharacterCollectionKey;
}

/**
 * Creates a generic add handler for collection items
 * Handles the pattern: create temp item → create temp component → trigger edit → add to collection
 */
export function createAddHandler<T, ItemComponent extends { handleEdit: () => void }>(
  config: AddHandlerConfig<T, ItemComponent>
): () => void {
  return () => {
    const { emptyItem, ItemComponentClass, character, collectionKey } = config;

    const tempItem = new ItemComponentClass(emptyItem, -1, (updated: T) => {
      // IMMUTABLE: create a new array with the added item, read fresh from the character
      const currentCollection = readCollection<T>(character, collectionKey);
      writeCollection(character, collectionKey, [...currentCollection, updated]);

      persistCharacterState(character);
      dispatchCollectionUpdate(collectionKey);
    });

    tempItem.handleEdit();
  };
}

/**
 * Configuration for creating item instances with update/delete handlers
 */
export interface ItemInstancesConfig<T, ItemComponent> {
  /** Collection array to map */
  collection: T[];
  /** Constructor for the item component class */
  ItemComponentClass: ItemComponentConstructor<T, ItemComponent>;
  /** Character whose collection is updated */
  character: Character;
  /** Key identifying which collection on character to update */
  collectionKey: CharacterCollectionKey;
}

/**
 * Creates item component instances with standardized update/delete handlers.
 *
 * Updates and deletes are immutable (a new array is written to the character), which
 * keeps version history snapshots from sharing array references and makes undo work.
 */
export function createItemInstances<T, ItemComponent extends { render: () => TemplateResult }>(
  config: ItemInstancesConfig<T, ItemComponent>
): ItemComponent[] {
  const { collection, ItemComponentClass, character, collectionKey } = config;

  const commit = (newCollection: T[]): void => {
    writeCollection(character, collectionKey, newCollection);
    persistCharacterState(character);
    dispatchCollectionUpdate(collectionKey);
  };

  return collection.map((item, index) => {
    const onUpdate = (updated: T): void => {
      const newCollection = [...collection];
      newCollection[index] = updated;
      commit(newCollection);
    };
    const onDelete = (): void => commit(collection.filter((_, i) => i !== index));

    return new ItemComponentClass(item, index, onUpdate, onDelete);
  });
}
