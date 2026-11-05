import { beforeEach } from "vitest";
import { VersionState } from "@/services/versionState";
import type { VersionHistoryManager } from "@/storage/versionHistory";
import type { Character } from "@/types/character";
import { createTestCharacter } from "../../factories/character.js";
import { setupRealVersionHistory } from "./realVersionHistory";

export const createMockCharacter = (name: string): Character => createTestCharacter({ name });

export interface VersionStateFixture {
  readonly versionHistory: VersionHistoryManager;
  readonly mockCharacter: Character;
  readonly versionState: VersionState;
}

/**
 * Registers hooks giving each test a VersionState over a real history
 * manager (isolated fake-indexeddb database). Returns live accessors.
 */
export function setupVersionState(): VersionStateFixture {
  const history = setupRealVersionHistory();
  let mockCharacter: Character;
  let versionState: VersionState;

  beforeEach(() => {
    mockCharacter = createMockCharacter("Test Character");
    versionState = new VersionState(mockCharacter, history.manager);
  });

  return {
    get versionHistory() {
      return history.manager;
    },
    get mockCharacter() {
      return mockCharacter;
    },
    get versionState() {
      return versionState;
    },
  };
}
