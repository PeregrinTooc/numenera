import { beforeEach, afterEach, vi } from "vitest";
import { VersionHistoryService } from "@/services/versionHistoryService";
import type { Character } from "@/types/character";
import type { VersionHistoryManager } from "@/storage/versionHistory";
import { setupRealVersionHistory } from "./realVersionHistory";
import { createTestCharacter } from "../../factories/character";

export interface VersionHistoryServiceFixture {
  readonly service: VersionHistoryService;
  readonly manager: VersionHistoryManager;
  readonly mockCharacter: Character;
}

/**
 * Registers hooks that give each test a VersionHistoryService (1000ms squash
 * delay) over a real manager, with fake timers. Returns live accessors.
 */
export function setupVersionHistoryService(): VersionHistoryServiceFixture {
  const history = setupRealVersionHistory();
  let service: VersionHistoryService;
  let mockCharacter: Character;

  beforeEach(() => {
    vi.useFakeTimers({
      shouldAdvanceTime: true,
      toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date"],
    });

    mockCharacter = createTestCharacter({
      descriptor: "Swift",
      focus: "Masters Defense",
      portrait: undefined,
      stats: {
        might: { pool: 10, edge: 1, current: 10 },
        speed: { pool: 10, edge: 0, current: 10 },
        intellect: { pool: 10, edge: 0, current: 10 },
      },
    });

    service = new VersionHistoryService(history.manager, 1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  return {
    get service() {
      return service;
    },
    get manager() {
      return history.manager;
    },
    get mockCharacter() {
      return mockCharacter;
    },
  };
}
