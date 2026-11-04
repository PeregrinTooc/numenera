import { vi } from "vitest";

/**
 * A transaction that aborts on commit() with the given error, the way a
 * browser aborts a write that exceeds the storage quota.
 */
export function abortingTransaction(error: DOMException): unknown {
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

/**
 * Makes every readwrite IndexedDB transaction abort with the given error while
 * reads keep working. Undo with vi.restoreAllMocks().
 */
export function abortWriteTransactions(error: DOMException): void {
  const realTransaction = IDBDatabase.prototype.transaction;
  vi.spyOn(IDBDatabase.prototype, "transaction").mockImplementation(function (
    this: IDBDatabase,
    ...args: Parameters<IDBDatabase["transaction"]>
  ) {
    if (args[1] === "readwrite") {
      return abortingTransaction(error) as ReturnType<IDBDatabase["transaction"]>;
    }
    return realTransaction.apply(this, args);
  });
}
