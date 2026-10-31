import { beforeEach, afterEach, vi } from "vitest";
import { VersionHistoryService } from "@/services/versionHistoryService";
import type { Character } from "@/types/character";
import type { VersionHistoryManager } from "@/storage/versionHistory";
import { createMockVersionHistoryManager } from "../../factories/versionHistoryManager";
import { createTestCharacter } from "../../factories/character";

export interface VersionHistoryServiceFixture {
  readonly service: VersionHistoryService;
  readonly mockManager: VersionHistoryManager;
  readonly mockCharacter: Character;
}

/**
 * Registers hooks that give each test a VersionHistoryService (1000ms squash
 * delay) over a mocked manager, with fake timers. Returns live accessors.
 */
export function setupVersionHistoryService(): VersionHistoryServiceFixture {
  let service: VersionHistoryService;
  let mockManager: VersionHistoryManager;
  let mockCharacter: Character;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

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

    mockManager = createMockVersionHistoryManager();
    vi.mocked(mockManager.saveVersion).mockResolvedValue({
      id: "version-123",
      character: mockCharacter,
      description: "Test",
      timestamp: Date.now(),
      etag: "etag-123",
    });

    service = new VersionHistoryService(mockManager, 1000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  return {
    get service() {
      return service;
    },
    get mockManager() {
      return mockManager;
    },
    get mockCharacter() {
      return mockCharacter;
    },
  };
}
