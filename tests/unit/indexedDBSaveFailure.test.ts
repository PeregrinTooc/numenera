import { describe, it, expect, afterEach, vi } from "vitest";
import { ManualClock } from "@/services/manualClock";
import { IndexedDBStorageImpl } from "@/storage/indexedDBStorageImpl";
import { createTestCharacter } from "../factories/character";
import { abortWriteTransactions } from "./helpers/abortingTransaction";

describe("IndexedDBStorageImpl.save failure", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects with the transaction's QuotaExceededError when the write is aborted for size", async () => {
    const storage = new IndexedDBStorageImpl(new ManualClock());
    await storage.init();
    abortWriteTransactions(new DOMException("quota", "QuotaExceededError"));

    await expect(storage.save(createTestCharacter({}))).rejects.toMatchObject({
      name: "QuotaExceededError",
    });
  });
});
