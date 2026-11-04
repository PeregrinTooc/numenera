import { beforeEach, afterEach, expect, vi } from "vitest";
import { ExportManager } from "@/storage/exportManager";
import {
  deleteFileHandle,
  loadPersistedFileHandle,
  persistFileHandle,
} from "@/storage/fileHandleStore";
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

// Helper to create mock FileSystemFileHandle. The methods are non-enumerable so
// the handle survives IndexedDB's structured clone, as a real handle does.
export function createMockHandle(name = "character.json"): FileSystemFileHandle {
  const handle = { name, kind: "file" as const };
  Object.defineProperties(handle, {
    createWritable: {
      value: vi.fn().mockResolvedValue({
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      }),
    },
    queryPermission: { value: vi.fn().mockResolvedValue("granted" as PermissionState) },
  });
  return handle as unknown as FileSystemFileHandle;
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

export interface RecordedDownload {
  filename: string;
  href: string;
  /** Whether the anchor was attached to the document when it was clicked. */
  connected: boolean;
}

// Unique across tests, so a stale revoke timer from an earlier test cannot be mistaken for this one.
let objectUrlCounter = 0;

// Helper to setup download test (non-Chromium). Intercepts the download at the
// platform edge only: object-URL creation and the anchor click that would start it.
export function setupDownloadTest() {
  delete window.showSaveFilePicker;
  const blobs = new Map<string, Blob>();
  const downloads: RecordedDownload[] = [];
  vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
    const url = `blob:test/${objectUrlCounter++}`;
    blobs.set(url, blob as Blob);
    return url;
  });
  const revokeSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
    this: HTMLAnchorElement
  ) {
    downloads.push({ filename: this.download, href: this.href, connected: this.isConnected });
  });
  return {
    downloads,
    revokeSpy,
    /** Text of the Blob that the given download's link pointed at. */
    contentOf: (download: RecordedDownload): Promise<string> => {
      const blob = blobs.get(download.href);
      if (!blob) throw new Error(`No Blob was created for ${download.href}`);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsText(blob);
      });
    },
  };
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

export interface ExportManagerFixture {
  exportManager: ExportManager;
  /** Whether a file handle is persisted in the (fake) IndexedDB handle store. */
  hasPersistedHandle(): Promise<boolean>;
  /** Writes a handle into the (fake) IndexedDB handle store. */
  seedPersistedHandle(handle: FileSystemFileHandle): Promise<void>;
}

/**
 * Registers hooks that give each test a fresh ExportManager over the globally
 * installed fake IndexedDB with no showSaveFilePicker. Returns live accessors.
 */
export function setupExportManager(): ExportManagerFixture {
  const fixture = {
    hasPersistedHandle: async () => (await loadPersistedFileHandle()) !== undefined,
    seedPersistedHandle: persistFileHandle,
  } as ExportManagerFixture;

  beforeEach(async () => {
    await deleteFileHandle();
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
