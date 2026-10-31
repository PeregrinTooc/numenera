import { vi } from "vitest";
import type { VersionHistoryManager } from "@/storage/versionHistory";

/**
 * A VersionHistoryManager whose public methods are vi.fn() stubs (resolving to
 * undefined unless a test configures them). The class has private members, so
 * an object literal is not assignable to it; the single cast lives here.
 * Use vi.mocked(manager).method to configure or inspect a stub.
 */
export function createMockVersionHistoryManager(): VersionHistoryManager {
  return {
    init: vi.fn().mockResolvedValue(undefined),
    isAvailable: vi.fn().mockResolvedValue(true),
    saveVersion: vi.fn().mockResolvedValue(undefined),
    getAllVersions: vi.fn().mockResolvedValue([]),
    getVersionById: vi.fn().mockResolvedValue(null),
    updateVersionDescription: vi.fn().mockResolvedValue(undefined),
    updateVersionMetadata: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
    close: vi.fn(),
  } as unknown as VersionHistoryManager;
}
