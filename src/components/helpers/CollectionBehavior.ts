import type { TemplateResult } from "lit-html";
import { Character } from "@/types/character";
import { persistCharacterState } from "@/storage/storageFactory";
import { notifyCollectionUpdated } from "./characterEvents.js";
import { readCollection, writeCollection } from "./characterCollections";

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
  notifyCollectionUpdated(
    collectionKey,
    collectionKey === "cyphers" ? "cyphers-updated" : undefined
  );
}

export interface AddHandlerConfig<T, ItemComponent> {
  emptyItem: T;
  ItemComponentClass: ItemComponentConstructor<T, ItemComponent>;
  character: Character;
  collectionKey: CharacterCollectionKey;
}

export function createAddHandler<T, ItemComponent extends { handleEdit: () => void }>(
  config: AddHandlerConfig<T, ItemComponent>
): () => void {
  return () => {
    const { emptyItem, ItemComponentClass, character, collectionKey } = config;

    const tempItem = new ItemComponentClass(emptyItem, -1, (updated: T) => {
      const currentCollection = readCollection<T>(character, collectionKey);
      writeCollection(character, collectionKey, [...currentCollection, updated]);

      persistCharacterState(character);
      dispatchCollectionUpdate(collectionKey);
    });

    tempItem.handleEdit();
  };
}

export interface ItemInstancesConfig<T, ItemComponent> {
  collection: T[];
  ItemComponentClass: ItemComponentConstructor<T, ItemComponent>;
  character: Character;
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

/**
 * Configuration naming a collection once: its key, item component and the empty item
 * a new card starts from.
 */
export interface CollectionSectionConfig<T, ItemComponent> {
  collectionKey: CharacterCollectionKey;
  ItemComponentClass: ItemComponentConstructor<T, ItemComponent>;
  emptyItem: T;
}

/**
 * One collection of a container component: yields both the add handler and the item
 * instances from the same key, item class and empty item.
 */
export class CollectionSection<
  T,
  ItemComponent extends { handleEdit: () => void; render: () => TemplateResult },
> {
  readonly handleAdd: () => void;

  constructor(
    private character: Character,
    private config: CollectionSectionConfig<T, ItemComponent>
  ) {
    this.handleAdd = createAddHandler({ ...config, character });
  }

  items(): ItemComponent[] {
    const { collectionKey, ItemComponentClass } = this.config;
    return createItemInstances({
      collection: readCollection<T>(this.character, collectionKey),
      ItemComponentClass,
      character: this.character,
      collectionKey,
    });
  }
}
