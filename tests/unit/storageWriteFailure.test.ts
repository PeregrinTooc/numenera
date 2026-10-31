import { describe, it, expect, vi } from "vitest";
import {
  STORAGE_WRITE_FAILED_EVENT,
  reportStorageWriteFailure,
  type StorageWriteFailedDetail,
} from "@/storage/storageWriteFailure";

function captureEvent(run: () => void): StorageWriteFailedDetail[] {
  const details: StorageWriteFailedDetail[] = [];
  const listener = (event: Event): void => {
    details.push((event as CustomEvent<StorageWriteFailedDetail>).detail);
  };
  window.addEventListener(STORAGE_WRITE_FAILED_EVENT, listener);
  try {
    run();
  } finally {
    window.removeEventListener(STORAGE_WRITE_FAILED_EVENT, listener);
  }
  return details;
}

describe("reportStorageWriteFailure", () => {
  it("reports a QuotaExceededError as reason quota", () => {
    const error = new DOMException("full", "QuotaExceededError");

    const details = captureEvent(() => reportStorageWriteFailure(error));

    expect(details).toEqual([{ reason: "quota" }]);
  });

  it("reports a quota error wrapped as the cause as reason quota", () => {
    const error = Object.assign(new Error("Failed to save character"), {
      cause: new DOMException("full", "QuotaExceededError"),
    });

    const details = captureEvent(() => reportStorageWriteFailure(error));

    expect(details).toEqual([{ reason: "quota" }]);
  });

  it("reports any other failure as reason unknown", () => {
    const details = captureEvent(() => reportStorageWriteFailure(new Error("boom")));

    expect(details).toEqual([{ reason: "unknown" }]);
  });

  it("reports a non-Error rejection as reason unknown", () => {
    const details = captureEvent(() => reportStorageWriteFailure("nope"));

    expect(details).toEqual([{ reason: "unknown" }]);
  });

  it("still logs the error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    reportStorageWriteFailure(new Error("boom"));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
