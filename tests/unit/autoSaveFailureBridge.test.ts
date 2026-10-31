import { describe, it, expect, vi, afterEach } from "vitest";
import { AutoSaveService } from "@/services/autoSaveService";
import { forwardAutoSaveFailures } from "@/services/autoSaveFailureBridge";
import { STORAGE_WRITE_FAILED_EVENT } from "@/storage/storageWriteFailure";

describe("forwardAutoSaveFailures", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("turns a failed auto-save into a storage-write-failed event", async () => {
    vi.useFakeTimers();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const service = new AutoSaveService(
      () => Promise.reject(new DOMException("full", "QuotaExceededError")),
      300
    );
    forwardAutoSaveFailures(service);
    const listener = vi.fn();
    window.addEventListener(STORAGE_WRITE_FAILED_EVENT, listener);

    service.requestSave();
    await vi.advanceTimersByTimeAsync(300);

    window.removeEventListener(STORAGE_WRITE_FAILED_EVENT, listener);
    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toEqual({ reason: "quota" });
  });
});
