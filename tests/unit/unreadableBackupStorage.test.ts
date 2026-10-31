import { describe, it, expect, vi, beforeEach } from "vitest";
import { LocalStorageImpl } from "@/storage/localStorageImpl";
import { STORAGE_KEY } from "@/storage/storageConstants";
import { setupIndexedDBStorage } from "./helpers/indexedDBStorageFixture";

describe("IndexedDBStorageImpl unreadable backup", () => {
  const ctx = setupIndexedDBStorage();

  it("returns null when no backup exists", async () => {
    expect(await ctx.storage.loadCorruptedBackup()).toBeNull();
  });

  it("keeps the raw value exactly as given", async () => {
    const raw = { stats: 5, weird: [1, 2] };

    await ctx.storage.saveCorruptedBackup(raw);

    expect(await ctx.storage.loadCorruptedBackup()).toEqual(raw);
  });

  it("keeps only the latest backup", async () => {
    await ctx.storage.saveCorruptedBackup("first");
    await ctx.storage.saveCorruptedBackup("second");

    expect(await ctx.storage.loadCorruptedBackup()).toBe("second");
  });

  it("removes the backup without touching the stored character", async () => {
    await ctx.storage.saveCorruptedBackup("raw");
    await ctx.storage.save({ name: "Kept" } as never);

    await ctx.storage.clearCorruptedBackup();

    expect(await ctx.storage.loadCorruptedBackup()).toBeNull();
    expect(await ctx.storage.load()).toEqual({ name: "Kept" });
  });

  it("keeps the backup when the character is cleared", async () => {
    await ctx.storage.saveCorruptedBackup("raw");

    await ctx.storage.clear();

    expect(await ctx.storage.loadCorruptedBackup()).toBe("raw");
  });
});

describe("LocalStorageImpl unreadable data", () => {
  const storage = new LocalStorageImpl();

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns invalid JSON text unchanged and does not delete it", async () => {
    localStorage.setItem(STORAGE_KEY, "{not json");

    const loaded = await storage.load();

    expect(loaded).toBe("{not json");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("{not json");
  });

  it("keeps the raw text as backup, latest wins, and can remove it", async () => {
    expect(await storage.loadCorruptedBackup()).toBeNull();

    await storage.saveCorruptedBackup("{first");
    await storage.saveCorruptedBackup("{second");
    expect(await storage.loadCorruptedBackup()).toBe("{second");

    await storage.clearCorruptedBackup();
    expect(await storage.loadCorruptedBackup()).toBeNull();
  });

  it("stores a non-string value as JSON", async () => {
    await storage.saveCorruptedBackup({ a: 1 });

    expect(await storage.loadCorruptedBackup()).toBe('{"a":1}');
  });
});
