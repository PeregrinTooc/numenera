import { beforeEach, afterEach, expect, vi } from "vitest";
import { ExportManager } from "@/storage/exportManager";
import type { Character } from "@/types/character";

// Mock character data
export const mockCharacter: Character = {
  name: "Glaive Warrior",
  tier: 1,
  descriptor: "Strong",
  type: "Glaive",
  focus: "Fights with Panache",
  currentXp: 0,
  totalXp: 0,
  shins: 0,
  armor: 1,
  effort: 1,
  maxCyphers: 2,
  stats: {
    might: { pool: 10, edge: 0, current: 10 },
    speed: { pool: 10, edge: 0, current: 10 },
    intellect: { pool: 10, edge: 0, current: 10 },
  },
  damageTrack: { impairment: "healthy" },
  recoveryRolls: {
    action: false,
    tenMinutes: false,
    oneHour: false,
    tenHours: false,
    modifier: 0,
  },
  abilities: [],
  attacks: [],
  specialAbilities: [],
  cyphers: [],
  artifacts: [],
  equipment: [],
  oddities: [],
  textFields: {
    background: "",
    notes: "",
  },
};

// Helper to create mock FileSystemFileHandle
export function createMockHandle(name = "character.json"): FileSystemFileHandle {
  return {
    name,
    kind: "file" as const,
    createWritable: vi.fn().mockResolvedValue({
      write: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    }),
    queryPermission: vi.fn().mockResolvedValue("granted" as PermissionState),
  } as unknown as FileSystemFileHandle;
}

// Wraps a write stub in a FileSystemWritableFileStream (the mock implements only write/close).
export function createMockWritable(
  write = vi.fn().mockResolvedValue(undefined)
): FileSystemWritableFileStream {
  return {
    write,
    close: vi.fn().mockResolvedValue(undefined),
  } as unknown as FileSystemWritableFileStream;
}

// Helper to setup export test with File System Access API
export function setupExportTest() {
  const mockHandle = createMockHandle();
  const picker = vi.fn().mockResolvedValue(mockHandle);
  window.showSaveFilePicker = picker;
  return { mockHandle, picker };
}

// Helper to setup download test (non-Chromium)
export function setupDownloadTest() {
  delete window.showSaveFilePicker;
  const createElementSpy = vi.spyOn(document, "createElement");
  const mockLink = {
    click: vi.fn(),
    download: "",
    href: "",
  };
  createElementSpy.mockReturnValue(mockLink as unknown as HTMLElement);
  const appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
  const removeChildSpy = vi.spyOn(document.body, "removeChild").mockImplementation((node) => node);
  return { mockLink, createElementSpy, appendChildSpy, removeChildSpy };
}

// Helper to verify valid file structure
export function expectValidFileStructure(data: string) {
  expect(data).toBeTruthy();
  const parsed = JSON.parse(data);
  expect(parsed).toHaveProperty("version");
  expect(parsed).toHaveProperty("schemaVersion");
  expect(parsed).toHaveProperty("exportDate");
  expect(parsed).toHaveProperty("character");
  return parsed;
}

// Minimal IndexedDB request: settles "successfully" on the next microtask,
// calling whatever onsuccess the code under test has assigned by then.
interface FakeRequest<T> {
  result: T;
  error: null;
  onsuccess: (() => void) | null;
  onerror: (() => void) | null;
}

function fakeRequest<T>(result: T, beforeSuccess?: () => void): FakeRequest<T> {
  const request: FakeRequest<T> = { result, error: null, onsuccess: null, onerror: null };
  void Promise.resolve().then(() => {
    beforeSuccess?.();
    request.onsuccess?.();
  });
  return request;
}

// Helper to setup IndexedDB mock
export function setupIndexedDBMock(): Map<string, unknown> {
  const store = new Map<string, unknown>();

  const objectStore = () => ({
    get: vi.fn((key: string) => fakeRequest(store.get(key))),
    put: vi.fn((value: unknown, key: string) => {
      store.set(key, value);
      return fakeRequest(undefined);
    }),
    delete: vi.fn((key: string) => {
      store.delete(key);
      return fakeRequest(undefined);
    }),
  });

  const db = {
    objectStoreNames: { contains: () => false },
    transaction: () => {
      const tx = { objectStore, oncomplete: null as (() => void) | null, onerror: null };
      // Complete on the next tick
      void Promise.resolve().then(() => tx.oncomplete?.());
      return tx;
    },
    createObjectStore: vi.fn(),
  };

  // Only the slice of IDBFactory that the file-handle store calls.
  const fakeFactory = {
    open: vi.fn(() => {
      const request = fakeRequest(db) as FakeRequest<typeof db> & {
        onupgradeneeded: ((event: unknown) => void) | null;
      };
      request.onupgradeneeded = null;
      // fakeRequest settles on a microtask, so upgrade runs first, as in a real open
      void Promise.resolve().then(() => request.onupgradeneeded?.({ target: { result: db } }));
      return request;
    }),
    deleteDatabase: vi.fn(),
  };
  global.indexedDB = fakeFactory as unknown as IDBFactory;

  return store;
}

export interface ExportManagerFixture {
  exportManager: ExportManager;
  readonly idbStore: Map<string, unknown>;
}

/**
 * Registers hooks that give each test a fresh ExportManager over a fake
 * IndexedDB with no showSaveFilePicker. Returns live accessors.
 */
export function setupExportManager(): ExportManagerFixture {
  const fixture = {} as { exportManager: ExportManager; idbStore: Map<string, unknown> };

  beforeEach(() => {
    fixture.idbStore = setupIndexedDBMock();
    vi.clearAllMocks();

    // Clear window mocks
    delete window.showSaveFilePicker;

    fixture.exportManager = new ExportManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  return fixture;
}
