import { beforeEach } from "vitest";
import { VersionState } from "@/services/versionState";
import type { VersionHistoryManager } from "@/storage/versionHistory";
import type { Character } from "@/types/character";
import type { CharacterVersion } from "@/types/versionHistory";
import { createTestCharacter } from "../../factories/character.js";
import { createMockVersionHistoryManager } from "../../factories/versionHistoryManager";

export const createMockCharacter = (name: string): Character => createTestCharacter({ name });

export const createMockVersion = (
  name: string,
  description: string,
  timestamp: number
): CharacterVersion => {
  const character = createMockCharacter(name);
  const { portrait: _portrait, ...characterWithoutPortrait } = character;
  return {
    id: `version-${name}`,
    character: characterWithoutPortrait,
    timestamp,
    description,
    etag: `etag-${name}`,
  };
};

export interface VersionStateFixture {
  readonly mockVersionHistory: VersionHistoryManager;
  readonly mockCharacter: Character;
  readonly versionState: VersionState;
}

/**
 * Registers a hook giving each test a VersionState over a mocked history
 * manager. Returns live accessors.
 */
export function setupVersionState(): VersionStateFixture {
  let mockVersionHistory: VersionHistoryManager;
  let mockCharacter: Character;
  let versionState: VersionState;

  beforeEach(() => {
    mockCharacter = createMockCharacter("Test Character");
    mockVersionHistory = createMockVersionHistoryManager();
    versionState = new VersionState(mockCharacter, mockVersionHistory);
  });

  return {
    get mockVersionHistory() {
      return mockVersionHistory;
    },
    get mockCharacter() {
      return mockCharacter;
    },
    get versionState() {
      return versionState;
    },
  };
}
