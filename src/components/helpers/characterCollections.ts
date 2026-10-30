import type { Character } from "@/types/character";
import type { CharacterCollectionKey } from "./CollectionBehavior";

/**
 * Read a collection from the character by key.
 *
 * The caller chooses the item type T; it is the caller's responsibility that it matches the
 * collection named by `key` (the component that owns the key also owns the item type).
 */
export function readCollection<T>(character: Character, key: CharacterCollectionKey): T[] {
  const items: unknown[] = character[key];
  return items as T[];
}

/** Replace a collection on the character by key (immutable-update callers pass a new array). */
export function writeCollection<T>(
  character: Character,
  key: CharacterCollectionKey,
  items: T[]
): void {
  Object.assign(character, { [key]: items });
}
