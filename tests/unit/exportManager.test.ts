import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ExportManager } from "../../src/storage/exportManager";
import type { Character } from "../../src/types/character";

// Mock character data
const mockCharacter: Character = {
  name: "Glaive Warrior",
  tier: 1,
  descriptor: "Strong",
  type: "Glaive",
  focus: "Fights with Panache",
  xp: 0,
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
function createMockHandle(name = "character.json") {
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

// Helper to setup export test with File System Access API
function setupExportTest() {
  const mockHandle = createMockHandle();
  (window as any).showSaveFilePicker = vi.fn().mockResolvedValue(mockHandle);
  return { mockHandle };
}

// Helper to setup download test (non-Chromium)
function setupDownloadTest() {
  delete (window as any).showSaveFilePicker;
  const createElementSpy = vi.spyOn(document, "createElement");
  const mockLink = {
    click: vi.fn(),
    download: "",
    href: "",
  };
  createElementSpy.mockReturnValue(mockLink as any);
  return { mockLink, createElementSpy };
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

// Helper to setup IndexedDB mock
function setupIndexedDBMock() {
  const store = new Map();

  global.indexedDB = {
    open: vi.fn().mockImplementation((_name: string, _version: number) => {
      const db = {
        objectStoreNames: { contains: () => false },
        transaction: (_storeName: string, _mode: string) => {
          const tx = {
            objectStore: (_name: string) => ({
              get: vi.fn().mockImplementation((key: string) => {
                const result = store.get(key);
                const request = {
                  result,
                  onsuccess: null as any,
                  onerror: null as any,
                };
                // Resolve immediately in next tick
                Promise.resolve().then(() => {
                  if (request.onsuccess) {
                    request.onsuccess();
                  }
                });
                return request;
              }),
              put: vi.fn().mockImplementation((value: any, key: string) => {
                store.set(key, value);
                const request = {
                  onsuccess: null as any,
                  onerror: null as any,
                };
                Promise.resolve().then(() => {
                  if (request.onsuccess) {
                    request.onsuccess();
                  }
                });
                return request;
              }),
            }),
            oncomplete: null as any,
            onerror: null as any,
          };
          // Trigger oncomplete in next tick
          Promise.resolve().then(() => {
            if (tx.oncomplete) {
              tx.oncomplete();
            }
          });
          return tx;
        },
        createObjectStore: vi.fn(),
      };

      const request = {
        result: db,
        error: null,
        onsuccess: null as any,
        onerror: null as any,
        onupgradeneeded: null as any,
      };

      // Resolve immediately in next tick
      Promise.resolve().then(() => {
        if (request.onupgradeneeded) {
          request.onupgradeneeded({ target: { result: db } } as any);
        }
        if (request.onsuccess) {
          request.onsuccess();
        }
      });

      return request;
    }),
    deleteDatabase: vi.fn(),
  } as any;

  return store;
}

describe("ExportManager", () => {
  let exportManager: ExportManager;
  let idbStore: Map<string, any>;

  beforeEach(() => {
    // Setup mocks
    idbStore = setupIndexedDBMock();
    vi.clearAllMocks();

    // Clear window mocks
    delete (window as any).showSaveFilePicker;

    exportManager = new ExportManager();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Feature Detection", () => {
    it("should detect File System Access API support", () => {
      (window as any).showSaveFilePicker = vi.fn();

      expect(exportManager.supportsFileSystemAccess()).toBe(true);
    });

    it("should return false when API not available", () => {
      delete (window as any).showSaveFilePicker;

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
      const writtenData = (writableMock.write as any).mock.calls[0][0];
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
      (window as any).showSaveFilePicker = vi
        .fn()
        .mockRejectedValue(new (global as any).DOMException("User cancelled", "AbortError"));

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
  });

  describe("quickExport()", () => {
    it("should throw error if no remembered location", async () => {
      await expect(exportManager.quickExport(mockCharacter)).rejects.toThrow(
        "No remembered location for Quick Export"
      );
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
      (window as any).showSaveFilePicker.mockClear();

      // Quick export should not prompt and should use the remembered handle
      await exportManager.quickExport(mockCharacter);

      expect(window.showSaveFilePicker).not.toHaveBeenCalled();
      // Verify createWritable was called (will be called twice total: once in export, once in quickExport)
      expect(mockHandle.createWritable).toHaveBeenCalledTimes(2);
    });

    it("should dispatch success event after quick export", async () => {
      const _mockHandle = createMockHandle("test.json");
      (window as any).showSaveFilePicker = vi.fn().mockResolvedValue(_mockHandle);

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
      const writableMock = {
        write: vi
          .fn()
          .mockResolvedValueOnce(undefined) // First call succeeds (export)
          .mockRejectedValueOnce(
            new (global as any).DOMException("Permission denied", "NotAllowedError")
          ), // Second call fails (quickExport)
        close: vi.fn().mockResolvedValue(undefined),
      };
      (mockHandle.createWritable as any).mockResolvedValue(writableMock);
      (window as any).showSaveFilePicker = vi.fn().mockResolvedValue(mockHandle);

      await exportManager.export(mockCharacter);
      await new Promise((resolve) => setTimeout(resolve, 10));

      await expect(exportManager.quickExport(mockCharacter)).rejects.toThrow(
        "Unable to save file. Permission denied."
      );
    });

    it("should handle disk full error", async () => {
      const mockHandle = createMockHandle();
      // Set up the write mock to fail on the second call
      const writableMock = {
        write: vi
          .fn()
          .mockResolvedValueOnce(undefined) // First call succeeds (export)
          .mockRejectedValueOnce(
            new (global as any).DOMException("Disk full", "QuotaExceededError")
          ), // Second call fails (quickExport)
        close: vi.fn().mockResolvedValue(undefined),
      };
      (mockHandle.createWritable as any).mockResolvedValue(writableMock);
      (window as any).showSaveFilePicker = vi.fn().mockResolvedValue(mockHandle);

      await exportManager.export(mockCharacter);
      await new Promise((resolve) => setTimeout(resolve, 10));

      await expect(exportManager.quickExport(mockCharacter)).rejects.toThrow(
        "Unable to save file. Disk full."
      );
    });
  });

  describe("saveAs()", () => {
    it("should always prompt for new location", async () => {
      const mockHandle1 = createMockHandle("file1.json");
      const mockHandle2 = createMockHandle("file2.json");

      (window as any).showSaveFilePicker = vi
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

      (window as any).showSaveFilePicker = vi
        .fn()
        .mockResolvedValueOnce(mockHandle1)
        .mockResolvedValueOnce(mockHandle2);

      await exportManager.export(mockCharacter);
      await exportManager.saveAs(mockCharacter);

      // Clear mocks
      (window as any).showSaveFilePicker.mockClear();
      (writable2.write as any).mockClear();

      // Quick export should now use handle2
      await exportManager.quickExport(mockCharacter);

      expect(window.showSaveFilePicker).not.toHaveBeenCalled();
      expect(mockHandle2.createWritable).toHaveBeenCalled();
    });

    it("should dispatch handle-updated event", async () => {
      const mockHandle = createMockHandle();
      (window as any).showSaveFilePicker = vi.fn().mockResolvedValue(mockHandle);

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
