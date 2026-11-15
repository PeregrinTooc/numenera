import { beforeEach, afterEach, vi } from "vitest";
import { VersionHistoryService } from "@/services/versionHistoryService";
import { ManualClock } from "@/services/manualClock";
import type { Character } from "@/types/character";
import type { VersionHistoryManager } from "@/storage/versionHistory";
import { setupRealVersionHistory } from "./realVersionHistory";
import { createTestCharacter } from "../../factories/character";

export interface VersionHistoryServiceFixture {
  readonly service: VersionHistoryService;
  readonly manager: VersionHistoryManager;
  readonly mockCharacter: Character;
  readonly clock: ManualClock;
}

/**
 * Registers hooks that give each test a VersionHistoryService (1000ms squash
 * delay) over a real manager, on a ManualClock. Returns live accessors.
 */
export function setupVersionHistoryService(): VersionHistoryServiceFixture {
  const history = setupRealVersionHistory();
  let service: VersionHistoryService;
  let mockCharacter: Character;
  let clock: ManualClock;

  beforeEach(() => {
    clock = new ManualClock();

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

    service = new VersionHistoryService(history.manager, clock, 1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  return {
    get service() {
      return service;
    },
    get manager() {
      return history.manager;
    },
    get clock() {
      return clock;
    },
    get mockCharacter() {
      return mockCharacter;
    },
  };
}
