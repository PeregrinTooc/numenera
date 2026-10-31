import { describe, it, expect, afterEach, vi } from "vitest";
import { IndexedDBStorageImpl } from "@/storage/indexedDBStorageImpl";
import { createTestCharacter } from "../factories/character";

/**
 * A transaction that aborts on commit() with the given error, the way a
 * browser aborts a write that exceeds the storage quota.
 */
function abortingTransaction(error: DOMException): unknown {
  const request: { onsuccess?: () => void; onerror?: () => void; error: DOMException | null } = {
    error: new DOMException("aborted", "AbortError"),
  };
  const transaction: { onabort?: () => void; error: DOMException; [k: string]: unknown } = {
    error,
    objectStore: () => ({ put: () => request }),
    commit: () => {
      void Promise.resolve().then(() => {
        request.onerror?.();
        transaction.onabort?.();
      });
    },
  };
  return transaction;
}

describe("IndexedDBStorageImpl.save failure", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects with the transaction's QuotaExceededError when the write is aborted for size", async () => {
    const storage = new IndexedDBStorageImpl();
    await storage.init();
    const quota = new DOMException("quota", "QuotaExceededError");
    vi.spyOn(IDBDatabase.prototype, "transaction").mockReturnValue(
      abortingTransaction(quota) as ReturnType<IDBDatabase["transaction"]>
    );

    await expect(storage.save(createTestCharacter({}))).rejects.toMatchObject({
      name: "QuotaExceededError",
    });
  });
});
