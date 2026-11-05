/** Shared plumbing for the IndexedDB-backed stores. */

/**
 * Open a database. `onUpgrade` creates the object stores; `openFailure` maps the browser's
 * error to whatever the caller rejects with.
 */
export function openDatabase(
  name: string,
  version: number,
  onUpgrade: (db: IDBDatabase) => void,
  openFailure: (cause: DOMException | null) => unknown
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);

    request.onerror = () => reject(openFailure(request.error));
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => onUpgrade(request.result);
  });
}

/** Resolve with the request's result; reject with `failure()` if it errors. */
export function requestToPromise<T>(request: IDBRequest<T>, failure: () => Error): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(failure());
  });
}

/**
 * Settle when the transaction itself finishes, not when its requests do: a write that
 * exceeds the storage quota succeeds as a request and only aborts the transaction at
 * commit. Rejects with the transaction's error (the real cause), else `fallback()`.
 */
export function transactionDone(
  transaction: IDBTransaction,
  fallback: () => Error = () => new Error("IndexedDB transaction aborted")
): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? fallback());
  });
}

/** Return `db`, or throw `notInitialized` when the store has not been opened. */
export function requireDatabase(db: IDBDatabase | null, notInitialized: string): IDBDatabase {
  if (!db) {
    throw new Error(notInitialized);
  }
  return db;
}

/** Run one request in its own transaction and resolve with its result. */
export function runRequest<T>(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode,
  makeRequest: (store: IDBObjectStore) => IDBRequest<T>,
  failure: () => Error
): Promise<T> {
  const store = db.transaction([storeName], mode).objectStore(storeName);
  return requestToPromise(makeRequest(store), failure);
}
