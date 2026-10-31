import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ExportManager } from "@/storage/exportManager";
import type { Character } from "@/types/character";

// Mock character data
const mockCharacter: Character = {
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
function createMockHandle(name = "character.json"): FileSystemFileHandle {
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
function createMockWritable(
  write = vi.fn().mockResolvedValue(undefined)
): FileSystemWritableFileStream {
  return {
    write,
    close: vi.fn().mockResolvedValue(undefined),
  } as unknown as FileSystemWritableFileStream;
}

// Helper to setup export test with File System Access API
function setupExportTest() {
  const mockHandle = createMockHandle();
  const picker = vi.fn().mockResolvedValue(mockHandle);
  window.showSaveFilePicker = picker;
  return { mockHandle, picker };
}

// Helper to setup download test (non-Chromium)
function setupDownloadTest() {
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
function expectValidFileStructure(data: string) {
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
function setupIndexedDBMock(): Map<string, unknown> {
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

describe("ExportManager", () => {
  let exportManager: ExportManager;
  let idbStore: Map<string, unknown>;

  beforeEach(() => {
    // Setup mocks
    idbStore = setupIndexedDBMock();
    vi.clearAllMocks();

    // Clear window mocks
    delete window.showSaveFilePicker;

    exportManager = new ExportManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Feature Detection", () => {
    it("should detect File System Access API support", () => {
      window.showSaveFilePicker = vi.fn();

      expect(exportManager.supportsFileSystemAccess()).toBe(true);
    });

    it("should return false when API not available", () => {
      delete window.showSaveFilePicker;

      expect(exportManager.supportsFileSystemAccess()).toBe(false);
    });

    it("should detect remembered location exists", async () => {
      const mockHandle = createMockHandle();
      idbStore.set("lastExportFileHandle", mockHandle);

      // Recreate manager to load from IDB
      exportManager = new ExportManager();

      // Wait for all microtasks to complete
      await new Promise((resolve) => setTimeout(resolve, 0));
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(exportManager.hasRememberedLocation()).toBe(true);
    });

    it("should detect no remembered location on first use", () => {
      expect(exportManager.hasRememberedLocation()).toBe(false);
    });
  });

  describe("export() - First Time Export", () => {
    it("should prompt for location on first export in Chromium", async () => {
      setupExportTest();

      await exportManager.export(mockCharacter);

      expect(window.showSaveFilePicker).toHaveBeenCalledWith({
        suggestedName: "glaive-warrior.numenera",
        types: [
          {
            description: "Numenera Character Files",
            accept: { "application/json": [".numenera"] },
          },
        ],
      });
    });

    it("should save file to selected location", async () => {
      const { mockHandle } = setupExportTest();
      const writableMock = await mockHandle.createWritable();

      await exportManager.export(mockCharacter);

      expect(mockHandle.createWritable).toHaveBeenCalled();

      // Verify the written data has valid structure
      const writtenData = vi.mocked(writableMock.write).mock.calls[0][0] as string;
      const parsed = expectValidFileStructure(writtenData);
      expect(parsed.character.name).toBe("Glaive Warrior");

      expect(writableMock.close).toHaveBeenCalled();
    });

    it("should remember file handle after first export", async () => {
      setupExportTest();

      await exportManager.export(mockCharacter);

      expect(exportManager.hasRememberedLocation()).toBe(true);
    });

    it("should dispatch handle-updated event after first export", async () => {
      setupExportTest();

      const eventSpy = vi.fn();
      window.addEventListener("export-handle-updated", eventSpy);

      await exportManager.export(mockCharacter);

      expect(eventSpy).toHaveBeenCalled();
    });

    it("should handle user cancellation gracefully", async () => {
      window.showSaveFilePicker = vi
        .fn()
        .mockRejectedValue(new DOMException("User cancelled", "AbortError"));

      // Should not throw
      await exportManager.export(mockCharacter);

      expect(exportManager.hasRememberedLocation()).toBe(false);
    });

    it("should use fallback download in non-Chromium browsers", async () => {
      const { mockLink } = setupDownloadTest();

      await exportManager.export(mockCharacter);

      expect(mockLink.click).toHaveBeenCalled();
      expect(mockLink.download).toBe("glaive-warrior.numenera");
    });

    it("appends the download link to the document before clicking and removes it after, for the Firefox fallback", async () => {
      const { mockLink, appendChildSpy, removeChildSpy } = setupDownloadTest();

      await exportManager.export(mockCharacter);

      expect(appendChildSpy).toHaveBeenCalledWith(mockLink);
      expect(removeChildSpy).toHaveBeenCalledWith(mockLink);

      const appendOrder = appendChildSpy.mock.invocationCallOrder[0];
      const clickOrder = mockLink.click.mock.invocationCallOrder[0];
      const removeOrder = removeChildSpy.mock.invocationCallOrder[0];
      expect(appendOrder).toBeLessThan(clickOrder);
      expect(clickOrder).toBeLessThan(removeOrder);
    });

    it("revokes the object URL asynchronously, so Firefox has time to start the download", async () => {
      vi.useFakeTimers();
      try {
        const revokeSpy = vi.spyOn(URL, "revokeObjectURL");
        setupDownloadTest();

        await exportManager.export(mockCharacter);

        expect(revokeSpy).not.toHaveBeenCalled();
        vi.runAllTimers();
        expect(revokeSpy).toHaveBeenCalled();
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("quickExport()", () => {
    it("should throw error if no remembered location", async () => {
      await expect(exportManager.quickExport(mockCharacter)).rejects.toMatchObject({
        messageKey: "errors.noRememberedLocation",
      });
    });

    it("should save to remembered location without prompting", async () => {
      const { mockHandle } = setupExportTest();

      // First export to set handle
      await exportManager.export(mockCharacter);

      // Wait for IndexedDB operations to complete
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Verify the handle is stored
      expect(exportManager.hasRememberedLocation()).toBe(true);

      // Clear showSaveFilePicker mock to verify it's not called again
      vi.mocked(window.showSaveFilePicker!).mockClear();

      // Quick export should not prompt and should use the remembered handle
      await exportManager.quickExport(mockCharacter);

      expect(window.showSaveFilePicker).not.toHaveBeenCalled();
      // Verify createWritable was called (will be called twice total: once in export, once in quickExport)
      expect(mockHandle.createWritable).toHaveBeenCalledTimes(2);
    });

    it("should dispatch success event after quick export", async () => {
      const _mockHandle = createMockHandle("test.json");
      window.showSaveFilePicker = vi.fn().mockResolvedValue(_mockHandle);

      await exportManager.export(mockCharacter);
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Reset the event spy after export
      const eventSpy = vi.fn();
      window.addEventListener("export-success", eventSpy);

      await exportManager.quickExport(mockCharacter);

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: { filename: "test.json" },
        })
      );
    });

    it("should handle write permission denied", async () => {
      const mockHandle = createMockHandle();
      // Set up the write mock to fail on the second call
      const writableMock = createMockWritable(
        vi
          .fn()
          .mockResolvedValueOnce(undefined) // First call succeeds (export)
          .mockRejectedValueOnce(new DOMException("Permission denied", "NotAllowedError")) // Second call fails (quickExport)
      );
      vi.mocked(mockHandle.createWritable).mockResolvedValue(writableMock);
      window.showSaveFilePicker = vi.fn().mockResolvedValue(mockHandle);

      await exportManager.export(mockCharacter);
      await new Promise((resolve) => setTimeout(resolve, 10));

      await expect(exportManager.quickExport(mockCharacter)).rejects.toMatchObject({
        messageKey: "errors.permissionDenied",
      });
    });

    it("should handle disk full error", async () => {
      const mockHandle = createMockHandle();
      // Set up the write mock to fail on the second call
      const writableMock = createMockWritable(
        vi
          .fn()
          .mockResolvedValueOnce(undefined) // First call succeeds (export)
          .mockRejectedValueOnce(new DOMException("Disk full", "QuotaExceededError")) // Second call fails (quickExport)
      );
      vi.mocked(mockHandle.createWritable).mockResolvedValue(writableMock);
      window.showSaveFilePicker = vi.fn().mockResolvedValue(mockHandle);

      await exportManager.export(mockCharacter);
      await new Promise((resolve) => setTimeout(resolve, 10));

      await expect(exportManager.quickExport(mockCharacter)).rejects.toMatchObject({
        messageKey: "errors.diskFull",
      });
    });
  });

  describe("saveAs()", () => {
    it("should always prompt for new location", async () => {
      const mockHandle1 = createMockHandle("file1.json");
      const mockHandle2 = createMockHandle("file2.json");

      window.showSaveFilePicker = vi
        .fn()
        .mockResolvedValueOnce(mockHandle1)
        .mockResolvedValueOnce(mockHandle2);

      await exportManager.export(mockCharacter);

      // Save As should prompt again
      await exportManager.saveAs(mockCharacter);

      expect(window.showSaveFilePicker).toHaveBeenCalledTimes(2);
    });

    it("should update remembered handle after Save As", async () => {
      const mockHandle1 = createMockHandle("file1.json");
      const mockHandle2 = createMockHandle("file2.json");
      const writable2 = await mockHandle2.createWritable();

      window.showSaveFilePicker = vi
        .fn()
        .mockResolvedValueOnce(mockHandle1)
        .mockResolvedValueOnce(mockHandle2);

      await exportManager.export(mockCharacter);
      await exportManager.saveAs(mockCharacter);

      // Clear mocks
      vi.mocked(window.showSaveFilePicker!).mockClear();
      vi.mocked(writable2.write).mockClear();

      // Quick export should now use handle2
      await exportManager.quickExport(mockCharacter);

      expect(window.showSaveFilePicker).not.toHaveBeenCalled();
      expect(mockHandle2.createWritable).toHaveBeenCalled();
    });

    it("should dispatch handle-updated event", async () => {
      const mockHandle = createMockHandle();
      window.showSaveFilePicker = vi.fn().mockResolvedValue(mockHandle);

      const eventSpy = vi.fn();
      window.addEventListener("export-handle-updated", eventSpy);

      await exportManager.saveAs(mockCharacter);

      expect(eventSpy).toHaveBeenCalled();
    });
  });

  describe("clearRememberedLocation()", () => {
    it("should clear stored file handle", async () => {
      setupExportTest();

      await exportManager.export(mockCharacter);
      expect(exportManager.hasRememberedLocation()).toBe(true);

      exportManager.clearRememberedLocation();

      expect(exportManager.hasRememberedLocation()).toBe(false);
    });

    it("should dispatch handle-updated event", () => {
      const eventSpy = vi.fn();
      window.addEventListener("export-handle-updated", eventSpy);

      exportManager.clearRememberedLocation();

      expect(eventSpy).toHaveBeenCalled();
    });

    it("should remove the persisted handle from IndexedDB, not just localStorage", async () => {
      setupExportTest();

      await exportManager.export(mockCharacter);
      expect(idbStore.has("lastExportFileHandle")).toBe(true);

      exportManager.clearRememberedLocation();
      await Promise.resolve();
      await Promise.resolve();

      expect(idbStore.has("lastExportFileHandle")).toBe(false);

      // A fresh manager reloading from IndexedDB should no longer see it.
      const reloaded = new ExportManager();
      await Promise.resolve();
      await Promise.resolve();
      expect(reloaded.hasRememberedLocation()).toBe(false);
    });
  });

  describe("Filename Generation", () => {
    it("should generate filename from character name", async () => {
      const { mockLink } = setupDownloadTest();

      await exportManager.export(mockCharacter);

      expect(mockLink.download).toBe("glaive-warrior.numenera");
    });

    it("should sanitize special characters in filename", async () => {
      const specialCharacter = { ...mockCharacter };
      specialCharacter.name = "Test@Character #1";

      const { mockLink } = setupDownloadTest();

      await exportManager.export(specialCharacter);

      expect(mockLink.download).toBe("testcharacter-1.numenera");
    });

    it("should use .numenera extension", async () => {
      const { mockLink } = setupDownloadTest();

      await exportManager.export(mockCharacter);

      expect(mockLink.download).toMatch(/\.numenera$/);
    });
  });
});
