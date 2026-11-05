import { describe, it, expect, vi, afterEach } from "vitest";
import {
  clearCharacterState,
  getVersionHistory,
  loadCharacterState,
  persistCharacterState,
} from "@/storage/storageFactory";
import { STORAGE_WRITE_FAILED_EVENT } from "@/storage/storageWriteFailure";
import { CHARACTER_DB_NAME } from "@/storage/storageConstants";
import { NEW_CHARACTER } from "@/data/mockCharacters";
import { abortWriteTransactions } from "./helpers/abortingTransaction";

/** Writes `value` as the stored character, exactly as an older app version left it. */
function seedStoredCharacter(value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open(CHARACTER_DB_NAME, 1);
    open.onupgradeneeded = () => open.result.createObjectStore("characters");
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const transaction = db.transaction("characters", "readwrite");
      transaction.objectStore("characters").put(value, "current");
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    };
  });
}

describe("storageFactory", () => {
  describe("loadCharacterState", () => {
    it("migrates a legacy xp-only character to currentXp/totalXp on load", async () => {
      await seedStoredCharacter({ xp: 12 });

      const result = await loadCharacterState();

      expect(result).not.toBeNull();
      expect(result?.currentXp).toBe(12);
      expect(result?.totalXp).toBe(12);
    });

    it("returns null without sanitizing when nothing is stored", async () => {
      await clearCharacterState();

      const result = await loadCharacterState();

      expect(result).toBeNull();
    });
  });

  describe("persistCharacterState", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("dispatches storage-write-failed when the write is rejected", async () => {
      await loadCharacterState();
      abortWriteTransactions(new DOMException("full", "QuotaExceededError"));
      vi.spyOn(console, "error").mockImplementation(() => {});
      const received = new Promise<CustomEvent>((resolve) => {
        window.addEventListener(STORAGE_WRITE_FAILED_EVENT, (e) => resolve(e as CustomEvent), {
          once: true,
        });
      });

      persistCharacterState(NEW_CHARACTER);

      expect((await received).detail).toEqual({ reason: "quota" });
    });
  });

  describe("getVersionHistory", () => {
    it("hands concurrent callers the same ready-to-use manager", async () => {
      const first = getVersionHistory();
      const second = getVersionHistory();

      const [managerA, managerB] = await Promise.all([first, second]);

      expect(managerA).toBe(managerB);
      const saved = await managerB.saveVersion(NEW_CHARACTER, "first save");
      const stored = await managerA.getAllVersions();
      expect(stored.map((version) => version.id)).toContain(saved.id);
    });
  });
});
