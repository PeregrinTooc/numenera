import { FILE_HANDLES_DB_NAME } from "./storageConstants";

/** Key under which the last export file handle is stored (IndexedDB, and legacy localStorage). */
export const HANDLE_STORAGE_KEY = "lastExportFileHandle";

const HANDLES_STORE_NAME = "handles";

function openHandleDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(FILE_HANDLES_DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(HANDLES_STORE_NAME)) {
        db.createObjectStore(HANDLES_STORE_NAME);
      }
    };
  });
}

/**
 * Persist the export file handle in IndexedDB (handles can't live in localStorage).
 * Failures are logged and swallowed.
 */
export async function persistFileHandle(handle: FileSystemFileHandle): Promise<void> {
  try {
    const db = await openHandleDB();
    const tx = db.transaction(HANDLES_STORE_NAME, "readwrite");
    const store = tx.objectStore(HANDLES_STORE_NAME);
    store.put(handle, HANDLE_STORAGE_KEY);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    // Continuing is fine: the handle is only a cache - Quick Export asks for the location again.
    console.warn("Failed to persist file handle:", error);
  }
}

/** Remove the persisted export file handle. Rejects if IndexedDB fails. */
export async function deleteFileHandle(): Promise<void> {
  const db = await openHandleDB();
  const tx = db.transaction(HANDLES_STORE_NAME, "readwrite");
  const store = tx.objectStore(HANDLES_STORE_NAME);
  store.delete(HANDLE_STORAGE_KEY);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Load the persisted export file handle, if one exists and write permission is still granted.
 * Returns undefined otherwise (errors are logged and swallowed).
 */
export async function loadPersistedFileHandle(): Promise<FileSystemFileHandle | undefined> {
  try {
    const db = await openHandleDB();
    const tx = db.transaction(HANDLES_STORE_NAME, "readonly");
    const store = tx.objectStore(HANDLES_STORE_NAME);
    const request = store.get(HANDLE_STORAGE_KEY);

    // Wait for the request to complete
    const handle = await new Promise<FileSystemFileHandle | undefined>((resolve) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(undefined);
    });

    if (!handle) return undefined;

    // Verify we still have permission (if queryPermission exists)
    if (typeof handle.queryPermission === "function") {
      const permission = await handle.queryPermission({ mode: "readwrite" });
      return permission === "granted" ? handle : undefined;
    }
    // In test/mock environments, assume we have permission
    return handle;
  } catch (error) {
    // Ignore errors - just means no persisted handle
    console.warn("Failed to load persisted file handle:", error);
    return undefined;
  }
}
